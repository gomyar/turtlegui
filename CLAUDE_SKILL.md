---
name: turtlegui
description: Use this skill when working with projects that use the TurtleGUI library, indicated by HTML files containing gui-* directive attributes (gui-text, gui-list, gui-val, gui-show, gui-click, etc.), references to turtlegui.js, or when the user explicitly mentions TurtleGUI or needs help with declarative HTML data binding using this library.
---

# TurtleGUI Assistant

TurtleGUI is a lightweight HTML/JavaScript GUI library that uses declarative directives to bind data to DOM elements. It provides reactive UI updates through a simple `turtlegui.reload()` function call.

## When Writing HTML with TurtleGUI

Use `gui-*` directives to bind data to DOM elements:

- `gui-text="expr"` - Sets text content
- `gui-html="expr"` - Sets innerHTML
- `gui-show="bool"` - Shows/hides element
- `gui-list="array" gui-item="item"` - **List iteration: clones child elements for each item**
- `gui-val="variable"` - Two-way binding for inputs
- `gui-click="fn()"` - Click event handling
- `gui-class="expr"` - Dynamic CSS classes
- `gui-include="path"` - Include external templates

## Expression Limitations (CRITICAL)

**Directive expressions ONLY support single-line expressions that evaluate to a value.** They do NOT support:
- Control flow statements: `if`, `while`, `for`, `switch`, `case`
- Ternary operators: `condition ? true : false`
- Multi-line statements or blocks
- Complex logic

**Function and method calls ARE supported** - use them for any conditional logic:

```html
<!-- ✓ Correct - simple expressions and function calls -->
<div gui-text="user.name"></div>
<div gui-show="isLoggedIn && hasPermission"></div>
<div gui-text="getStatus()"></div>
<div gui-text="user.getName()"></div>
<div gui-text="formatDate(timestamp)"></div>
<div gui-text="items.length + ' items'"></div>

<!-- ✗ Wrong - control statements and ternary operators not supported -->
<div gui-text="count > 5 ? 'Many' : 'Few'"></div>
<div gui-text="if (x > 5) { return 'big' }"></div>
<div gui-text="for (let i = 0; i < 10; i++) { ... }"></div>
```

**For ANY conditional logic, write JavaScript functions:**
```javascript
function getStatusLabel() {
  if (count > 10) return "High";
  if (count > 5) return "Medium";
  return "Low";
}

function getCountLabel() {
  return count > 5 ? 'Many' : 'Few';
}
```
```html
<div gui-text="getStatusLabel()"></div>
<div gui-text="getCountLabel()"></div>
```

## When Writing JavaScript for TurtleGUI

**CRITICAL: Always use `var` to declare data variables.** TurtleGUI cannot access `const` or `let` variables.

```javascript
// ✓ Correct
var items = [1, 2, 3];
var user = {name: "Alice"};

// ✗ Won't work
const items = [1, 2, 3];
let user = {name: "Alice"};
```

**After modifying data, call `turtlegui.reload()`** to update the UI:
```javascript
var count = 0;
function increment() {
  count++;
  turtlegui.reload();
}
```

For async operations, use `turtlegui.deferred_reload()`.

## Understanding gui-list (Critical)

The `gui-list` directive clones **child elements**, not the parent:

```html
<div gui-list="users" gui-item="user">
  <p gui-text="user.name"></p>  <!-- This <p> is cloned for each user -->
</div>
```

- `gui-list="users"` - Array/object to iterate
- `gui-item="user"` - Name for each item
- `gui-key="idx"` - Optional index/key name

## Common Patterns

**Display a list:**
```html
<ul gui-list="items" gui-item="item">
  <li gui-text="item"></li>
</ul>
```

**Conditional rendering (use gui-show for boolean conditions):**
```html
<div gui-show="isLoggedIn">Welcome!</div>
<div gui-show="count > 5">Many items</div>
```

**Conditional text (use functions for logic):**
```javascript
function getGreeting() {
  return isLoggedIn ? "Welcome back!" : "Please log in";
}
```
```html
<div gui-text="getGreeting()"></div>
```

**Form input binding:**
```html
<input type="text" gui-val="username">
<p gui-text="'Hello, ' + username"></p>
```

**Button click:**
```html
<button gui-click="save()">Save</button>
```

## When Debugging Issues

- **Data not showing**: Check if variables use `var` (not `const`/`let`)
- **List not rendering**: Verify `gui-list` is on the parent element
- **Changes not appearing**: Confirm `turtlegui.reload()` is called after updates
- **Expression errors**: No ternary operators or control statements in directives - use functions for ALL conditional logic
