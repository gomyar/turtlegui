# turtlegui
A gui library for javascript


Requires Jquery 1.x or greater 
To use:
1. Create html template using data-gui-* tags
2. Populate json object data (manually or using an ajax call).
    var my_data = {'name': 'Turtle Soup', 'ingredients': [{'name': 'water'}, {'name': 'turtle'}]}
3. Turtlegui evaluates model strings, i.e. "my_data.name"
4. Whenever a change occurs (data load or user change), call:
    turtlegui.reload()
    which reloads the gui
4. The html on the page will be populated with the loaded data, as per template.

Example html template:

~~~~
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

function i_was_clicked(item) {
    var index = jQuery.inArray(item, my_data.restaurant.ingredients);
    alert("Ingredient: " + index + "->" + item.name);
}

function last_updated(item) {
    return new Date();
}

function add_ingredient() {
    my_data.restaurant.ingredients.push({'name': 'salt'});
    turtlegui.reload()
}

function remove_ingredient(item) {
    var index = jQuery.inArray(item, my_data.restaurant.ingredients);
    my_data.restaurant.ingredients.splice(index, 1);
    turtlegui.reload()
}

function get_title_class(e, item) {
    return "title";
}

$(document).ready(function() {
    turtlegui.reload()
});
</script>
<style>
    div.title {
        font-weight : bold;
    }
</style>
<body>
    <div data-gui-text="my_data.restaurant.name"></div>    <!-- refers to 'name' field in data -->
    <div data-gui-list="my_data.restaurant.ingredients" data-gui-item="ingredient">   <!-- gui-list iterates over 'ingredients' list, stores each in 'ingredient' variable -->
        <div>
            <div data-gui-text="ingredient.name"></div>   <!-- 'ingredient' set for each item in list -->
            <input type="button" data-gui-click="i_was_clicked(ingredient)" value="Info"></input>   <!-- function called with item -->
            <input type="button" data-gui-click="remove_ingredient(ingredient)" value="Remove"></input>
            <div data-gui-text="last_updated(ingredient)"></div>   <!-- text from function -->
        </div>
    </div>
    <input type='button' onclick='add_ingredient()' value='Add'></input>
</body>
</html>
~~~~

Turtlegui uses a simplified model syntax for reading / writing data and calling functions. Most data-gui- fields use this model syntax unless otherwise stated.

The syntax supports:
* simple field names: i.e. 'myvar' evaluates to the myvar variable.
* object syntax: i.e. 'myobj.myvar' evaluates the 'myvar' field of the 'myobj' object.
* dict-like syntax: i.e. 'myobj[key]' evaluates 'key' first (key must be a variable) and uses that as the lookup in myobj
* function calls: i.e. 'callme(myvar)' will evaluate the 'myvar' variable and pass that into the callme function, returning the value

Turtlegui uses "data-" element fields

Types of supported fields:

* data-gui-text: populates element.text() with the evaluated value
* data-gui-html: populates element.html() with the evaluated value
* data-gui-list: creates copies of its subelement, one for each item in the list or object, stores item as local variable, specified by 'data-gui-item'
* data-gui-item: used during data-gui-list - the name of the local variable to store the current list value
* data-gui-key: used during data-gui-list - the name of the local variable used to store the current key of the list or object
* data-gui-ordering: for each item in data-gui-list, specify the key to sort by
* data-gui-reversed: reverse the order of data-gui-list
* data-gui-show: shows or hides based on evaluated value (true/false)
* data-gui-onshow: callback function used when the value of data-gui-show changes (can be used for transitions)
* data-gui-onhide: callback function used when the value of data-gui-show changes (can be used for transitions)
* data-gui-switch: shows or hides child elements based on values of data-gui-case attributes of those children
* data-gui-case: show/hide element if value is equal to parent data-gui-switch
* data-gui-click: evaluates on click (normally a function call)
* data-gui-bind: binds to arbitrary event name, for use with data-gui-event
* data-gui-event: evaluates when the event specified by data-gui-bind fires
* data-gui-include: include an html snippet
* data-gui-include-params: comma-separated string of values to send to the template as local variables
* data-gui-include-nocache: if present, will not cache the template
* data-gui-class: sets classname(s) on element
* data-gui-val: sets value on element - will write back a changed value if the target is a simple type (number, string). If target is a function, calls the function with the value as an extra parameter
* data-gui-id: sets id on element
* data-gui-change: evaluates on change event (usually for an input field)
* data-gui-format-func: used for data-gui-val - reference to a function expected to format the string on a read
* data-gui-parse-func: used for data-gui-val - reference to a function expected to parse the string on a write (i.e. parseFloat)
* data-gui-attrs: comma-separated string of values used as attributes on an element (i.e. 'style=')
* data-gui-data: comma-separated string of values used to set arbitrary data on an element (i.e. 'mylocal=')
* data-gui-tree: process a tree structure using data-gui-nodeitem and data-gui-node.
* data-gui-nodeitem: specify the local variable used to iterate the tree
* data-gui-node: repeat last data-gui-tree template snippet at this point with the specified item as the root

~~~~
Notes:

Deferred reload:
turtlegui.deferred_reload() can be used for some cases where the change event is interfering with building a list or included template.
If you've got a change event in a dynamically create element like a list, it can knock out the focused element, making forms awkward to work with.
deferred_reload() will fire the reload after the change event has finished.
(basically if you find yourself losing input focus in places, try using deferred_reload)
