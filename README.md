# TurtleGUI

A Graphical User Interface library for HTML/javascript


Requires Jquery 1.x or greater 


# TLDR:

Given this data:

    var data = {
        sentence: "The quick brown fox jumped over the lazy dog"
    }

With this HTML:

    <div gui-text="data.sentence"></div>

Calling:

    turtlegui.reload()

Will result in the HTML being changed to:

    <div gui-text="data.sentence">The quick brown fox jumped over the lazy dog</div>

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

Turtlegui uses a simplified model syntax to refer to any in-scope javascript data or functions. Most gui- fields use this model syntax unless otherwise stated.

The syntax supports:
* simple field names: i.e. 'myvar' evaluates to the myvar variable.
* object syntax: i.e. 'myobj.myvar' evaluates the 'myvar' field of the 'myobj' object.
* dicttionary-like syntax: i.e. 'myobj[key]' evaluates 'key' first (if key is a variable) and uses that as the lookup in myobj
* function calls: i.e. 'callme(myvar)' will evaluate the 'myvar' variable and pass that into the callme function, returning the value
* simple string and number types are supported: i.e. 'callme("Ghostbusters")' will call the function callme with the string "Ghostbusters"

Note: TurtleGUI does not use eval() in order to avoid shenanigans.


# Full Directive Reference:

Turtlegui uses _**gui-**_ element fields.

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
### *gui-item*
_Required by **gui-list**._ The local variable which represents the item in the list, for each item

### *gui-ordering*
_Optionally used with **gui-list**._ Specify the field name used to order the list
```html
<div gui-list="data.siblings" gui-item="sibling" gui-ordering="name">
    <div gui-text="sibling.name"></div>
</div>
```

### *gui-reversed*
_Optionally used with **gui-list**._ Reversed the order of the list

### *gui-key*
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

### *gui-onshow*
_Optionally used with **gui-show**._ Function evaluated in place of the default _display_ style behaviour. Intended to allow fades and transitions and the like.
```html
<div gui-show="gui.show_popup" gui-onshow="gui.fadein()">
    How the fade is done is up to you, the gui.fadein() function is expected to affect the fade, using css transitions or another similar method.
</div>
```

### *gui-onhide*
_Optionally used with **gui-show**._ Function evaluated in place of the default _display_ style behaviour. Opposite of _**gui-onshow**_ above.

## *gui-switch*

gui-switch|shows or hides child elements based on values of gui-case attributes of those children
gui-case|show/hide element if value is equal to parent gui-switch
gui-click|evaluates on click (normally a function call)
gui-bind|binds to arbitrary event name, for use with gui-event
gui-event|evaluates when the event specified by gui-bind fires
gui-include|include an html snippet
gui-include-params|semicolon-separated string of values to send to the template as local variables
gui-include-nocache|if present, will not cache the template
gui-class|sets classname(s) on element
gui-css|set css as properties object
gui-val|sets value on element - will write back a changed value if the target is a simple type (number, string). If target is a function, calls the function with the value as an extra parameter
gui-id|sets id on element
gui-change|evaluates on change event (usually for an input field)
gui-format-func|used for gui-val - reference to a function expected to format the string on a read
gui-parse-func|used for gui-val - reference to a function expected to parse the string on a write (i.e. parseFloat)
gui-attrs|semicolon-separated string of values used as attributes on an element (i.e. 'style=')
gui-data|semicolon-separated string of values used to set arbitrary data on an element (i.e. 'mylocal=')
gui-tree|process a tree structure using gui-nodeitem and gui-node.
gui-nodeitem|specify the local variable used to iterate the tree
gui-node|repeat last gui-tree template snippet at this point with the specified item as the root

~~~~
Notes:

Deferred reload:
turtlegui.deferred_reload() can be used for some cases where the change event is interfering with building a list or included template.
If you've got a change event in a dynamically create element like a list, it can knock out the focused element, making forms awkward to work with.
deferred_reload() will fire the reload after the change event has finished.
(basically if you find yourself losing input focus in places, try using deferred_reload)
