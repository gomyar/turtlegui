# turtlegui
A gui library for javascript


Requires Jquery 1.x or greater 
To use:
1. Create html template using data-gui-* tags
2. Populate json object data (manually or using an ajax call).
    var my_data = {'name': 'Turtle Soup', 'ingredients': [{'name': 'water'}, {'name': 'turtle'}]}
3. Turtlegui evaluates js strings, i.e. "my_data.name" is used to populate 
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

Turtlegui uses "data-" element fields which resolve js, (function call or dot notation path to data)

Types of supported fields:

* data-gui-text: populates element.text() with the evaluated value
* data-gui-list: creates copies of its subelement, one for each item in the list or object, stores item as local variable, specified by 'data-gui-item'
* data-gui-item: used during data-gui-list - the name of the local variable to store the current list value
* data-gui-key: used during data-gui-list - the current key of the list or object
* data-gui-ordering: for each item in data-gui-list, specify the key to sort by
* data-gui-reversed: reverse the order of data-gui-list
* data-gui-show: shows or hides based on evaluated value (true/false)
* data-gui-click: evaluates js on click (normally a function call)
* data-gui-include: include an html snippet
* data-gui-include-params: a js object - the keys are sent to the snippet as local vars
* data-gui-class: sets classname(s) on element
* data-gui-val: sets value on element - will write back a changed value if the target is a simple type (number, string)
* data-gui-id: sets id on element
* data-gui-change: evaluates js on change event
* data-gui-format-func: used for data-gui-val - reference to a function expected to format the string on a read
* data-gui-parse-func: used for data-gui-val - reference to a function expected to parse the string on a write (i.e. parseFloat)
* data-gui-attr: sets an attribute on an element (used with data-gui-attrval)
* data-gui-attrval: the value of the attribute specified by data-gui-attr
* data-gui-tree: process a tree structure using data-gui-nodeitem and data-gui-node. Honestly this one might need work, see filetree.html for an example
* data-gui-nodeitem: specify the local variable used to iterate the tree
* data-gui-node: repeat last data-gui-tree template snippet at this point with the specified item as the root

~~~~
Notes:

Deferred reload:
turtlegui.deferred_reload() can be used for some cases where the change event is interfering with building a list or included template.
If you've got a change event in a dynamically create element like a list, it can knock out the focused element, making forms awkward to work with.
deferred_reload() will fire the reload after the change event has finished.
(basically if you find yourself losing input focus in places, try using deferred_reload)
