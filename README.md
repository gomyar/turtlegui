# TurtleGUI

A Graphical User Interface library for HTML/javascript

## TLDR:

Given this data:
```javascript
var data = {
    sentence: "The quick brown fox jumped over the lazy dog"
}
```

With this HTML:
```html
<div gui-text="data.sentence"></div>
```

Calling:
```javascript
turtlegui.reload()
```

Will result in the HTML being changed to:
```html
<div gui-text="data.sentence">The quick brown fox jumped over the lazy dog</div>
```

[Full TLDR example](examples/tldr.html)


# Description:

TurtleGUI works by altering the page's DOM based on directives in each element.
Directives refer to model data / functions. The value of the data or function call will alter the DOM.
Call turtlegui.reload() when the data changes to update the page.


# Examples:

* [show / hide panels](examples/show_hide.html) How to show or hide DOM elements based on data.
* [switch panels](examples/switch_panels.html) Same as show hide with switch directive.
* [popup panel](examples/popup_panel.html) How show / hide can be used to show popups.
* [lists](examples/lists.html) How to display and update lists of data.
* [js objects](examples/js_objects.html) Similar to lists, js objects can be iterated / displayed.
* [tree structures](examples/tree.html) In the rare case a tree structure is needed.
* [events (click)](examples/events.html) Example of how to respond to DOM events.
* [templates](examples/templates.html) How to include HTML snippets from other HTML files.


# Model syntax:

Most of the directives TurtleGUI uses are simple javascript-like expressions which evaluate to a result. 

Example:

```javascript
    address_book[0].name
```

Will find the first object in the "address_book" array and return it's "name" field.

Basic calculation evalautions are supported:

```javascript
    address_book[0].first_name + " " + address_book[0].last_name
```

Will concatenate the "first_name" and "last_name" fields of the first object in the "address_book" array.

Calling Functions is also supported:

```javascript
    address_book[0].full_name()
```

The syntax supports:
* simple field names: i.e. 'myvar' evaluates to the myvar variable.
* object syntax: i.e. 'myobj.myvar' evaluates the 'myvar' field of the 'myobj' object.
* dicttionary-like syntax: i.e. 'myobj[key]' evaluates 'key' first (if key is a variable) and uses that as the lookup in myobj
* function calls: i.e. 'callme(myvar)' will evaluate the 'myvar' variable and pass that into the callme function, returning the value
* simple string and number types are supported: i.e. 'callme("Ghostbusters")' will call the function callme with the string "Ghostbusters"
* Basic calculations like "a + 1 * (b - 2)"
* Boolean operators like "a < 10" or "b == 4"

Note: TurtleGUI does not use eval() in order to avoid shenanigans.
Also Note: for reasons of performance, code sustainability, and developer sanity, TurtleGUI recommends that expressions remain as simple as possible. If a complex calculation is required for something, then put it in a function, and call the function from the expression. Makes debugging a whole lot easier.

# Code Reference:

TurtleGUI has only one real function: `turtlegui.reload()`. It also has `turtlegui.deferred_reload()` when the reload needs to happen asynchronously. Call `turtlegui.reload()` when the data model changes. Changes to the HTML are not implied - you must call reload.

`turtlegui.reload()` will execute all the directives on the page. Passing an element into the function will execute all the directives for that element, which can be used for optimisation; reloading specific page sections.

`turtlegui.deferred_reload()` can be useful when reloading a table of information interferes with an input's focus. It performs the reload in the background.

# Full Directive Reference:


uses _**gui-**_ element fields.

## *gui-text*
Populates element.textContent with the evaluated value.
```html
<div gui-text="data.full_name"></div>
```

## *gui-html*
Populates element.innerHTML with the evaluated value.
```html
<div gui-html="website.html_template"></div>
```

## *gui-list*
Iterate over each item in the given Array or Object, and clone the subelements for each item, specified by _**gui-item**_. Kind of like `for gui-item in gui-list` but for HTML.
```html
<div gui-list="data.siblings" gui-item="sibling">
    <div gui-text="sibling.name"></div>
</div>
```
### &nbsp;*gui-item*
_Required by **gui-list**._ The local variable which represents the item in the list, for each item

### &nbsp;*gui-ordering*
_Optionally used with **gui-list**._ Specify the field name used to order the list
```html
<div gui-list="data.siblings" gui-item="sibling" gui-ordering="name">
    <div gui-text="sibling.name"></div>
</div>
```

### &nbsp;*gui-reversed*
_Optionally used with **gui-list**._ Reversed the order of the list

### &nbsp;*gui-key*
_Optionally used with **gui-list**._ Populates the given variable with the current key in the list, or the field name of the Object being iterated.
```html
<div gui-list="data.siblings" gui-item="sibling" gui-key="index">
    <div gui-text="index"></div>
    <div gui-text="sibling.name"></div>
</div>
```

## *gui-show*
Shows or hides element based on evaluated value (true/false). Uses the _display_ style to show and hide.
```html
<div gui-show="gui.show_popup">
    You should only see this if <b>gui.show_popup</b> is true
</div>
```

### &nbsp;*gui-onshow*
_Optionally used with **gui-show**._ Function evaluated in place of the default _display_ style behaviour. Intended to allow fades and transitions and the like.
```html
<div gui-show="gui.show_popup" gui-onshow="gui.fadein()">
    How the fade is done is up to you, the gui.fadein() function is expected to affect the fade, using css transitions or another similar method.
</div>
```

### &nbsp;*gui-onhide*
_Optionally used with **gui-show**._ Function evaluated in place of the default _display_ style behaviour. Opposite of _**gui-onshow**_ above.

## *gui-switch*
Shows or hides child elements based on values of the _**gui-case**_ attribute of each child. Only works with direct children.
```html
<div gui-switch="gui.tab_id">
    <div gui-case="'video'">This is the video tab</div>
    <div gui-case="'sound'">This is the sound tab</div>
    <div gui-case="'controls'">This is the controls tab</div>
</div>
```

### &nbsp;*gui-case*
_Required by **gui-switch**._ Show/hide element if value is equal to parent _**gui-switch**_.

## *gui-click*
Evaluates on click (normally a function call)
```html
<input type="button" gui-click="gui.button_clicked()"></input>
```
You're probably wondering why this is useful, when there's an `onclick` field on elements - it's because _**gui-click**_ will resolve any local variables set by _**gui-list**_ or _**gui-tree**_ etc.
```html
<div gui-list="data.siblings" gui-item="sibling">
    <input type="button" gui-click="gui.button_clicked(sibling)"></input>
</div>
```

## *gui-bind-events*

Semicolon separated event binding function

## *gui-bind*
Binds to arbitrary event name, for use with _**gui-event**_.
```html
<div gui-bind="mousemove" gui-event="gui.mouse_moved()"></div>
```

### &nbsp;*gui-event*

_Required by **gui-bind**._ Evaluates when the event specified by gui-bind fires

## *gui-mouseover*
Evaluates in the event of a 'mouseover' event.

## *gui-mouseout*
Evaluates in the event of a 'mouseout' event.

## *gui-mousemove*
Evaluates in the event of a 'mousemove' event.

## *gui-keydown*
Evaluates in the event of a 'keydown' event. _Note: this event gets fired before the value is changed, which can make it act odd if gui-val is used as well._

## *gui-include*
Specifies a url path to an html template. Loads and evaluates the html snippet from the web server.
```html
<div gui-include="/template.html"></div>
```

### &nbsp;*gui-include-params*
Semicolon-separated string of values to send to the template as local variables.
```html
<div gui-include="/template.html" gui-include-params="first_name='Roger';surname='Dunne'"></div>
```

### &nbsp;*gui-include-nocache*
By default, TurtleGUI will cache any templates loaded. If, say, the template is being loaded dynamically from a server, set _**gui-include-nocache**_ and the template will not be cached, but requested on every reload.

## *gui-class*
Adds classname(s) to an element. Will evaluate and add the list of class names to the elements' class list. Existing class names specified by the element are not affected.
```html
<div class="pink_background" gui-class="gui.green_if_loaded()"></div>
```

## *gui-css*
Function expected to return an Object, which describes the CSS properties to apply to the element.
```html
<div gui-css="create_css()"></div>
```
where:
```javascript
function create_css() {
    return {
        "background-color": "green",
        "border": "1px solid black",
        "color": "yellow"
    }
}
```

## *gui-val*
Used for input elements / selects etc. Sets value on element - will write back a changed value if the target is a simple type (number, string). If target is a function, calls the function with the value as an extra parameter.

Given:
```javascript
var data = {
    name: "Bob"
}
```

This will get/set the `data.name` value:
```html
<input gui-val="data.name"></input>
```

This will select the `data.name` value:
```html
<select gui-val="data.name">
    <option value="1">Curly</option>
    <option value="2">Moe</option>
    <option value="3">Larry</option>
</select>
```

Combine selects with a list of data for a dynamic list:
Given:
```javascript
var stooges = [
    {id: 1, name: "Curly"},
    {id: 2, name: "Moe"},
    {id: 3, name: "Larry"}
]
```
```html
<select gui-val="data.name" gui-list="stooges" gui-item="stooge">
    <option gui-val="stooge.id" gui-text="stooge.name"></option>
</select>
```

### &nbsp;*gui-parse-func*
_Optionally used with **gui-val**._ Reference to a function expected to parse the string on a write (i.e. parseFloat). Different to normal resolve - don't specify the brackets, just reference the function itself.
```html
<input gui-val="data.year" data-format-func="parseInt"></input>
```

### &nbsp;*gui-format-func*
_Optionally used with **gui-val**._ Reference to a function expected to format the string on a read. Different to normal resolve - don't specify the brackets, just reference the function itself.
```html
<input gui-val="data.year" data-format-func="formatISOYear"></input>
```

## *gui-id*
Appends the evaluated value to the of the element.
```html
<div id="mydiv_" gui-id="data.id"></div>
```
Useful for lists of things:
```html
<div gui-list="data.siblings" gui-item="sibling">
    <div id="sib_" gui-id="sibling.id"></div>
</div>
```

## *gui-change*
Evaluates on change event. Usually for an input field. Used to call reload or perform another action on value change.
```html
<input gui-val="data.name" data-change="turtlegui.reload()"></input>
```
_**gui-change**_ is a good place to add calls to save the data back to the server.

## *gui-attrs*
Semicolon-separated string of values used as attributes on an element (i.e. 'style=')
```html
<div gui-attrs="style='background-color:blue'">The background should show as blue</div>
```

## *gui-data*
Semicolon-separated string of values used to set arbitrary data on an element (i.e. 'mylocal=')

## *gui-tree*
In the event that you need to display a tree structure, process a tree structure using _**gui-nodeitem**_ and _**gui-node**_.
```html
<div class="tree" gui-tree="example.data.family" gui-nodeitem="member">
    <div class="node">
        <div class="box" gui-text="member.name"></div>
        <div gui-list="member.kids" gui-item="kid">
            <div gui-node="kid"></div>
        </div>
    </div>
</div>
```

### &nbsp;*gui-nodeitem*
Specify the local variable used to iterate the tree

### &nbsp;*gui-node*
Repeat last gui-tree template snippet at this point with the specified item as the root

### &nbsp;*gui-node-params*
Semicolon-separated string of values to send with the node
```html
<div gui-node="item" gui-node-params="parent_item=parent;name='Bob'"></div>
```


## *gui-reload*
Evaluates and stops descending the DOM tree - for use integrating 3rd party libraries


## *gui-callback*
Evaluates and continues descending the DOM tree - for use integrating 3rd party libraries


