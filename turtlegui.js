
/**
    Requires Jquery 1.x or greater 
    To use:
    1. Create html template using turtlegui classnames and data-* tags
    2. Populate json object data (manually or using an ajax call).
        var my_data = {'name': 'Turtle Soup', 'ingredients': [{'name': 'water'}, {'name': 'turtle'}]}
    3. Set data root to populated data:
        turtlegui.data = my_data;
        turtlegui.reload()
    4. The html on the page will be populated with the loaded data, as per template.
    5. If the data is altered or reloaded, call turtlegui.reload()

    Example html template:

    -----
    <html>
    <script src="https://code.jquery.com/jquery-1.12.4.min.js" integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=" crossorigin="anonymous"></script>
    <script src="turtlegui.js"></script>
    <script>
    var my_data = {
        'restaurant': {
            'name': 'Turtle Soup',
            'ingredients': [
                {'name': 'water'},
                {'name': 'turtle'}
            ]
        }
    };

    function i_was_clicked(e, item) {
        var index = jQuery.inArray(item, my_data.restaurant.ingredients);
        alert("Ingredient: " + index + "->" + item.name);
    }

    function last_updated(e, item) {
        return new Date();
    }

    function add_ingredient(e) {
        my_data.restaurant.ingredients.push({'name': 'salt'});
        turtlegui.reload()
    }

    function remove_ingredient(e, item) {
        var index = jQuery.inArray(item, my_data.restaurant.ingredients);
        my_data.restaurant.ingredients.splice(index, 1);
        turtlegui.reload()
    }

    function get_title_class(e, item) {
        return "title";
    }

    $(document).ready(function() {
        turtlegui.data = my_data;
        turtlegui.reload()
    });
    </script>
    <style>
        div.title {
           font-weight : bold;
        }
    </style>
    <body>
        <div class="gui-text" data-class="get_title_class" data-src="restaurant.name"></div>    <!-- data-src refers to 'name' field in data -->
        <div class="gui-list" data-src="restaurant.ingredients">   <!-- gui-list iterates over 'ingredients' list -->
            <div>
                <div class="gui-text" data-src=".name"></div>   <!-- fields in each item preceded by '.' -->
                <input type="button" class="gui-click" data-clicked="i_was_clicked" value="Info"></input>   <!-- function called with event, item -->
                <input type="button" class="gui-click" data-clicked="remove_ingredient" value="Remove"></input>
                <div class="gui-text" data-src="last_updated"></div>   <!-- text from function -->
            </div>
        </div>
        <input type='button' onclick='add_ingredient()' value='Add'></input>
    </body>
    </html>
    -----

    "data-src": resolves js to function, or dot notation path to data (using turtlegui.data as root)

    Types of supported classes:
        gui-text: populates element.text() with the value of data-src
            requires: data-src
        gui-list: creates copies of its subelement, one for each item in the list
            requires: data-src
        gui-show: shows or hides based on value of data-src
            requires: data-src
        gui-click: calls function referenced by data-clicked (func(event, item))
            requires: data-clicked (function)
        gui-include: include an html snippet

    Extra supportde fields:
        data-class: sets classname(s) on element, same syntax as data-src

    Notes:
        - all function calls will include the current item in the list if applicable
*/

$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});

var turtlegui = {};

turtlegui.data = {};
turtlegui.root_element = $(document);


turtlegui.get_value = function(gres, rel_data) {
    try {
        var cdata = turtlegui.data;
        if (gres.slice(0, 1) == '.') {
            cdata = rel_data;
            gres = gres.slice(1);
        }
        while (gres.indexOf('.') != -1) {
            var field = gres.split('.', 1)[0];
            cdata = cdata[field]
            gres = gres.slice(gres.indexOf('.') + 1);
        }
        return cdata[gres];
    } catch (exp) {
        throw "Cannot find value or function " + gres;
    }
}


turtlegui._get_safe_value = function(elem, rel_data, datasrc) {
    var gres = elem.attr(datasrc);
    if (!gres) {
        throw "No " + datasrc + " field on element " + elem.attr('id');
    }
    try {
        var item = elem.data('data-item');
        var func = eval(gres);
        return func(elem, item);
    } catch (exp) {
        return turtlegui.get_value(gres, rel_data);
    }
}


turtlegui.load_snippet = function(elem, url, rel_data) {
    elem.load(url, function(response, status, xhr) {
        if (status == 'success') {
            turtlegui.reload(elem, rel_data);
        } else {
            console.log("Could not load html snippet: " + url + " - " + xhr.status + " " + xhr.statusText);
        }
    });
}


turtlegui.reload = function(elem, rel_data) {
    if (!elem) {
        elem = turtlegui.root_element;
    }
    if (rel_data) {
        elem.data('data-item', rel_data);
    }
    if (elem.hasClass('gui-text')) {
        value = turtlegui._get_safe_value(elem, rel_data, 'data-src');
        elem.text(value);
    }
    if (elem.attr('data-class')) {
        value = turtlegui._get_safe_value(elem, rel_data, 'data-class');
        elem.addClass(value);
    }
    if (elem.hasClass('gui-show')) {
        var data_js = elem.attr('data-js');
        var value = false;
        if (data_js) {
            value = eval(data_js);
        } else {
            value = turtlegui._get_safe_value(elem, rel_data, 'data-src');
        }
        if (value) {
            elem.show();
        } else {
            elem.hide();
        }
    }
    if (elem.hasClass('gui-click')) {
        elem.click(function(e) {
            var item = elem.data('data-item');
            var clicked = elem.attr('data-clicked');
            var func = eval(clicked);
            return func(e, item);
        });
    }
    if (elem.hasClass('gui-list')) {
        var gres = elem.attr('data-src');
        var list = turtlegui.get_value(gres, rel_data);
        var orig_elems = elem.children();
        var first_elem = $(orig_elems[0]);
        first_elem.hide();
        var new_elems = [];
        for (var i in list) {
            var new_elem = $(first_elem).clone();
            new_elems[new_elems.length] = new_elem;
        }
        for (var i in new_elems) {
            var item = list[i];
            var new_elem = new_elems[i];
            elem.append(new_elem);
            new_elem.show();
            turtlegui.reload(new_elem, item);
        }
        orig_elems.remove();
        elem.prepend(first_elem);
    }
    else if (elem.hasClass('gui-include')) {
        elem.removeClass('gui-include');
        var url = elem.attr('data-url');
        turtlegui.load_snippet(elem, url, rel_data);
    }
    else {
        elem.children().each(function() {
            turtlegui.reload($(this), rel_data);
        });
    }
}
