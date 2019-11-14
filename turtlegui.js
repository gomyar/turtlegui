
/** TurtleGUI - a javascript GUI library. Shared using MIT license (see LICENSE file)
*/

var turtlegui = {};

turtlegui.root_element = null;
turtlegui.cached_snippets = {};
turtlegui.loading_snippets = {};

turtlegui.cached_tokens = {};

turtlegui.stored_objects = {};
turtlegui.store_key = 0;


turtlegui.store = function(elem, key, value) {
    var elem_key;
    if (elem.turtlegui_store_key) {
        elem_key = elem.turtlegui_store_key;
    } else {
        elem_key = ++turtlegui.store_key;
        Object.defineProperty(elem, 'turtlegui_store_key', {value: elem_key, configurable: true}); 
    }
    if (!(elem_key in turtlegui.stored_objects)) {
        turtlegui.stored_objects[elem_key] = {}
    }
    turtlegui.stored_objects[elem_key][key] = value;
}

turtlegui.retrieve = function(elem, key) {
    if (elem.turtlegui_store_key) {
        return turtlegui.stored_objects[elem.turtlegui_store_key][key];
    } else {
        return null;
    }
}

turtlegui.remove_elements = function(elements) {
    for (var e=0; e<elements.length; e++) {
        var elem = elements[e];
        if (elem.turtlegui_store_key) {
            delete turtlegui.stored_objects[elem.turtlegui_store_key];
        }
        elem.remove()
    }
}


turtlegui.getstack = function(elm) {
    return elm.parentElement && elm.nodeName != 'BODY' && elm.parentElement.nodeName != 'BODY' ? turtlegui.getstack(elm.parentElement).concat([elm]) : [elm];
}

turtlegui.log = function(msg, extra) {
    if (window.console) {
        if (extra != null) {
            console.log(msg, extra);
        } else {
            console.log(msg);
        }
    }
}


turtlegui.log_error = function(msg, elem) {
    turtlegui.log("Error at:", elem);
    var stack = turtlegui.getstack(elem);
    for (var i=0; i<stack.length; i++) {
        var elm = stack[i];
        var desc = elm.nodeName + (elm.getAttribute('id')?'#'+elm.getAttribute('id'):"") + "\"" + elm.getAttribute('class') + "\"";
        try {
            var attributes = stack[i].getAttributeNames();
            var desc = '<' + elm.nodeName;
            for (var key=0; key<attributes.length; key++) {
                desc = desc + ' ' + attributes[key] + '="' + stack[i].getAttribute(attributes[key]) + '"';
            }
            desc = desc + '>';
        } catch (e) {
            turtlegui.log('getAttributeName unsupported');
        }
        turtlegui.log("  ".repeat(i) + desc);
    }
    turtlegui.log(msg);
}

turtlegui._is_string = function(token) {
    return token.length > 1 && (
                (token[0] == "'" && token[token.length-1] == "'") || (token[0] == '"' && token[token.length-1] == '"'))
}

turtlegui.resolve_field = function(gres, rel_data) {
    if (turtlegui._is_string(gres)) {
        return gres.substring(1, gres.length-1);
    } else if (gres in rel_data) {
        return rel_data[gres];
    } else if (gres in window) {
        return window[gres];
    } else if (isNaN(gres)) {
        throw "Cannot resolve variable: " + gres;
    } else {
        return parseFloat(gres);
    }
}

turtlegui._tokenize = function(token_str) {
    if (!(token_str in turtlegui.cached_tokens)) {
        var tokens = [];
        var token = '';
        function interpret_type(token) {
            // Interpret strings / numbers
            if (turtlegui._is_string(token)) {
                return token; // token.substring(1, token.length-1);
            } else if (token === 'true') {
                return true;
            } else if (token === 'false') {
                return false;
            } else {
                return token;
            }
        }
        var processing_string = null;
        for (var i=0; i<token_str.length; i++) {
            if (processing_string) {
                token = token + token_str[i];
                if (token_str[i] == processing_string) {
                    processing_string = null;
                    tokens[tokens.length] = interpret_type(token.trim());
                    token = '';
                } 
            } else {
                if (token_str[i] == '"' || token_str[i] == "'") {
                    processing_string = token_str[i];
                    token = token + token_str[i];
                }
                else if ('(),[].='.indexOf(token_str[i]) != -1) {
                    if (token) {
                        tokens[tokens.length] = interpret_type(token.trim());
                    }
                    if (token_str[i] != ',') {
                        tokens[tokens.length] = interpret_type(token_str[i]);
                    }
                    token = '';
                } else {
                    token = token + token_str[i];
                }
            }
        }
        if (token) {
            tokens[tokens.length] = interpret_type(token);
        }
        turtlegui.cached_tokens[token_str] = tokens;
    }
    return turtlegui.cached_tokens[token_str].slice();
}

turtlegui._tokenize_comma = function(token_str) {
    if (!(token_str in turtlegui.cached_tokens)) {
        var tokens = [];
        var token = '';
        function interpret_type(token) {
            // Interpret strings / numbers
            if (turtlegui._is_string(token)) {
                return token; // token.substring(1, token.length-1);
            } else if (token === 'true') {
                return true;
            } else if (token === 'false') {
                return false;
            } else {
                return token;
            }
        }
        var processing_string = null;
        for (var i=0; i<token_str.length; i++) {
            if (processing_string) {
                token = token + token_str[i];
                if (token_str[i] == processing_string) {
                    processing_string = null;
                } 
            } else {
                if (token_str[i] == '"' || token_str[i] == "'") {
                    processing_string = token_str[i];
                    token = token + token_str[i];
                }
                else if (';='.indexOf(token_str[i]) != -1) {
                    if (token) {
                        tokens[tokens.length] = interpret_type(token.trim());
                    }
                    if (token_str[i] != ';') {
                        tokens[tokens.length] = interpret_type(token_str[i]);
                    }
                    token = '';
                } else {
                    token = token + token_str[i];
                }
            }
        }
        if (token) {
            tokens[tokens.length] = interpret_type(token);
        }
        turtlegui.cached_tokens[token_str] = tokens;
    }
    return turtlegui.cached_tokens[token_str].slice();
}


turtlegui._process_token = function(tokens, t, gres, rel_data, elem) {
    var token = tokens[t];
    if (token == ')') {
        var u = t-1;
        var params = [];
        while (tokens[u] != '(') {
            if (tokens[u] == ']' || tokens[u] == '[') {
                turtlegui.log_error("Unexpected "+tokens[u]+" character in '"+gres+"'", elem)
            }
            params.unshift(tokens[u]);
            u--;
        }
        var func = tokens[u-1];
        var result = func.apply(elem, params);
        tokens = tokens.slice(0, u-1).concat([result]).concat(tokens.slice(t+1));
        t = u-1;
    }
    else if (token == ']') {

        if (tokens[t-2] != '[') {
            turtlegui.log_error("No corresponding [ for ] in '"+gres+"'", elem)
        }
        var field = tokens[t-1];
        var obj = tokens[t-3];
        var result = obj[field];
        tokens = tokens.slice(0, t-3).concat([result]).concat(tokens.slice(t+1));
        t = t-3;
    }
    else if (tokens[t-1] == '.') {
        var field = token;
        var obj = tokens[t-2];
        var result = obj[field];
        tokens = tokens.slice(0, t-2).concat([result]).concat(tokens.slice(t+1));
        t = t-2;
    }
    else if (typeof(tokens[t]) == 'string' && '(),[].'.indexOf(tokens[t]) == -1) {
        tokens[t] = turtlegui.resolve_field(tokens[t], rel_data);
    }
    return [tokens, t];
}



turtlegui._functionify = function(gres, elem) {
    var rel_data = turtlegui.retrieve(elem, 'data-rel') || {};
 
    var tokens = turtlegui._tokenize(gres);

    for (var t=0; t<tokens.length; t++) {
        var tl = turtlegui._process_token(tokens, t, gres, rel_data, elem);
        tokens = tl[0];
        t = tl[1];
    }

    return tokens[0];
}


turtlegui._functionify_partial = function(gres, elem) {
    var rel_data = turtlegui.retrieve(elem, 'data-rel') || {};

    var tokens = turtlegui._tokenize(gres);

    for (var t=0; t<tokens.length - 1; t++) {
        var tl = turtlegui._process_token(tokens, t, gres, rel_data, elem);
        tokens = tl[0];
        t = tl[1];
    }

    return tokens;
}


turtlegui._relative_eval = function(elem, gres, error_str) {
    var rel = turtlegui.retrieve(elem, 'data-rel') || {};
    var switcharoo = {};
    for (var key=0; key<rel.length; key++) {
        if (key in window) {
            switcharoo[key] = window[key];
        }
        window[key] = rel[key];
    }
    try {
        return turtlegui._functionify(gres, elem);
    } catch(e) {
        try {
            turtlegui.log_error(error_str + '" on element ' + elem.nodeName + " : " + e, elem)
            if (e.stack) {
                turtlegui.log("Stacktrace: ", e.stack);
            } else {
                console.trace();
            }
        } catch (noconsole) {
            throw e;
        }
    } finally {
        for (var key=0; key<switcharoo.length; key++) {
            window[key] = switcharoo[key];
        }
    }
}


turtlegui._eval_attribute = function(elem, attribute) {
    var gres = elem.getAttribute(attribute);
    if (!gres) {
        return null;
    }
    var error_str = 'Error evaluating ' + attribute + '="' + gres;
    return turtlegui._relative_eval(elem, gres, error_str);
}


turtlegui.ajax = {
    http_call: function(method, url, data, success, error) {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4) {
                if (this.status >= 200 && this.status < 300) {
                    if (success) {
                        success(this.responseText, this);
                    }
                }
                else if (error) {
                    error(this);
                } else {
                    turtlegui.log("Error loading " + url + " - " + this.status + " " + this.statusText);
                }
            }
        };
        xmlhttp.open(method, url, true);
        if (data) {
            xmlhttp.setRequestHeader("Content-Type", "application/json; utf-8");
            xmlhttp.send(JSON.stringify(data));
        } else {
            xmlhttp.send();
        }
    },
    get: function(url, success, error) {
        turtlegui.ajax.http_call("GET", url, null, success, error);
    },
    post: function(url, data, success, error) {
        turtlegui.ajax.http_call("POST", url, data, success, error);
    },
    put: function(url, data, success, error) {
        turtlegui.ajax.http_call("PUT", url, data, success, error);
    },
    patch: function(url, data, success, error) {
        turtlegui.ajax.http_call("PATCH", url, data, success, error);
    },
    delete: function(url, success, error) {
        turtlegui.ajax.http_call("DELETE", url, null, success, error);
    }
}


turtlegui.load_snippet = function(elem, url, rel_data) {
    if (url in turtlegui.cached_snippets) {
        elem.innerHTML = turtlegui.cached_snippets[url];
        for (var c=0; c<elem.children.length; c++) {
            turtlegui._reload(elem, rel_data);
        }
    } else if (url in turtlegui.loading_snippets) {
        turtlegui.loading_snippets[url][turtlegui.loading_snippets[url].length] = {'elem': elem, 'rel_data': rel_data};
    } else if (!(url in turtlegui.loading_snippets)) {
        turtlegui.loading_snippets[url] = [{'elem': elem, 'rel_data': rel_data}];
        var nocache = elem.getAttribute('gui-include-nocache');

        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                if (!nocache) {
                    turtlegui.cached_snippets[url] = this.responseText;
                }

                var snippets = turtlegui.loading_snippets[url];
                delete turtlegui.loading_snippets[url];

                for (var i=0; i<snippets.length; i++) {
                    var elem = snippets[i].elem;
                    var rel_data = snippets[i].rel_data;
                    elem.innerHTML = this.responseText;
                    for (var c=0; c<elem.children.length; c++) {
                        turtlegui._reload(elem.children[c], rel_data);
                    }
                }
            } else {
                turtlegui.log("Could not load html snippet: " + url + " - " + this.status + " " + this.statusText);
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
}


turtlegui.reload = function(elem) {

    if (!elem) {
        elem = turtlegui.root_element || document.body;
    }

    function index(e) {
        var i = 0;
        while( (e = e.previousElementSibling) != null ) 
            i++;
        return i;
    }
    var path = [];
    if (document.activeElement.nodeName != 'BODY') {
        path = turtlegui.getstack(document.activeElement);
    }
    var path_indices = [];
    for (var i=0; i<path.length; i++) {
        path_indices[i] = index(path[i]);
    }
    turtlegui._reload(elem, null);
    var current_elem = document.body;
    for (var i=0; i<path_indices.length; i++) {
        current_elem = current_elem.children[path_indices[i]];
    }
    if (current_elem && document.activeElement != current_elem) {
        current_elem.focus();
    }
}


turtlegui.deferred_reload = function(elem, callback) {
    setTimeout(function() {
        turtlegui.reload(elem);
        if (callback) {
            callback();
        }
    }, 0);
}


turtlegui._show_element = function(elem) {
    if (!elem.hasAttribute('data-elem-orig-display')) {
        elem.setAttribute('data-elem-orig-display', getComputedStyle(elem, null).display);
    }
    if (elem.getAttribute('data-elem-shown') == 'false' || elem.getAttribute('data-elem-shown') == null) {
        if (elem.getAttribute('gui-onshow')) {
            turtlegui._eval_attribute(elem, 'gui-onshow')
        } else {
            if (elem.getAttribute('data-elem-orig-display') == 'none') {
                elem.style.display = 'block';
            } else {
                elem.style.display = elem.getAttribute('data-elem-orig-display');
            }
        }
        elem.setAttribute('data-elem-shown', 'true');
    }
}


turtlegui._hide_element = function(elem) {
    if (!elem.hasAttribute('data-elem-orig-display')) {
        elem.setAttribute('data-elem-orig-display', getComputedStyle(elem, null).display);
    }
    if (elem.getAttribute('data-elem-shown') == 'true' || elem.getAttribute('data-elem-shown') == null) {
        if (elem.getAttribute('gui-onhide')) {
            turtlegui._eval_attribute(elem, 'gui-onhide')
        } else {
            elem.style.display = "none";
        }
        elem.setAttribute('data-elem-shown', 'false');
    }
}


turtlegui._semicolon_separated = function(elem, attribute_name) {
    var attrstr = elem.getAttribute('gui-attrs');
    var comma = {};
    if (attrstr != null) {
        var tokens = turtlegui._tokenize_comma(attrstr);

        if (tokens.length % 3) {
            turtlegui.log_error("Cannot evaluate " + attrstr + " - must be a semicolon-separated string of name=value pairs");
        } else {
            for (var t=0; t < tokens.length - 2; t += 3) {
                var key = tokens[t];
                var error_str = "Error evaluating string pair " + key + "=" + tokens[t + 2] + " for attribute " + attribute_name;
                var value = turtlegui._relative_eval(elem, tokens[t + 2], error_str);
                comma[key] = value;
            }
        }
    }
    return comma;
}


turtlegui._rebind = function(elem, event_id, func) {
    elem.removeEventListener(event_id, func);
    elem.addEventListener(event_id, func);
}


turtlegui._click_event_listener = function(e) {
    var elem = e.currentTarget;
    return turtlegui._eval_attribute(elem, 'gui-click');
}
turtlegui._bind_listener = function(e) {
    var elem = e.currentTarget;
    return turtlegui._eval_attribute(elem, 'gui-event');
}
turtlegui._mouseover_listener = function(e) {
    var elem = e.currentTarget;
    return turtlegui._eval_attribute(elem, 'gui-mouseover');
}
turtlegui._mouseout_listener = function(e) {
    var elem = e.currentTarget;
    return turtlegui._eval_attribute(elem, 'gui-mouseout');
}
turtlegui._mousemove_listener = function(e) {
    var elem = e.currentTarget;
    return turtlegui._eval_attribute(elem, 'gui-mousemove');
}
turtlegui._keydown_listener = function(e) {
    var elem = e.currentTarget;
    return turtlegui._eval_attribute(elem, 'gui-keydown');
}


turtlegui._reload = function(elem, rel_data) {
    if (!rel_data) rel_data = {};

    var old_rel_data = turtlegui.retrieve(elem, 'data-rel') || {};
    rel_data = Object.assign(old_rel_data, rel_data);
    turtlegui.store(elem, 'data-rel', rel_data);

    if (elem.getAttribute('gui-show')) {
        var value = turtlegui._eval_attribute(elem, 'gui-show');
        if (value) {
            turtlegui._show_element(elem);
        } else {
            turtlegui._hide_element(elem);
            if (elem.getAttribute('gui-id')) {
                elem.setAttribute('id', null);
            }
            return;
        }
    }
    if (elem.getAttribute('gui-attrs')) {
        var attrs = turtlegui._semicolon_separated(elem, 'gui-attrs');
        for (var key in attrs) {
            elem.setAttribute(key, attrs[key]);
        }
    }
    if (elem.getAttribute('gui-data')) {
        var datas = turtlegui._semicolon_separated(elem, 'gui-data');
        for (var key in datas) {
            turtlegui.store(elem, key, datas[key]);
        }
    }
    if (elem.getAttribute('gui-class')) {
        var orig_class = elem.getAttribute('data-orig-class');
        if (!orig_class && elem.getAttribute('class')) {
            elem.setAttribute('data-orig-class', elem.getAttribute('class'));
            orig_class = elem.getAttribute('class');
        }
        var value = turtlegui._eval_attribute(elem, 'gui-class');
        elem.classList.value = (orig_class || '') + ' ' + (value || '');
    }
    if (elem.getAttribute('gui-css')) {
        var properties = turtlegui._eval_attribute(elem, 'gui-css');
        for (var p in properties) {
            elem.style[p] = properties[p];
        }
    }
    if (elem.getAttribute('gui-id')) {
        var orig_id = elem.getAttribute('data-orig-id');
        if (!orig_id && elem.getAttribute('id')) {
            elem.setAttribute('data-orig-id', elem.getAttribute('id'));
            orig_id = elem.getAttribute('id');
        }
        var value = turtlegui._eval_attribute(elem, 'gui-id');
        elem.setAttribute('id', (orig_id == null ? '' : orig_id) + (value == null ? '' : value));
    }
    if (elem.getAttribute('gui-text')) {
        value = turtlegui._eval_attribute(elem, 'gui-text');
        elem.textContent = value;
    }
    if (elem.getAttribute('gui-html')) {
        value = turtlegui._eval_attribute(elem, 'gui-html');
        elem.innerHTML = value;
    }
    if (elem.getAttribute('gui-click')) {
        turtlegui._rebind(elem, 'click', turtlegui._click_event_listener);
    }
    if (elem.getAttribute('gui-bind') && elem.getAttribute('gui-event')) {
        turtlegui._rebind(elem, elem.getAttribute('gui-bind'), turtlegui._bind_listener);
    }
    if (elem.getAttribute('gui-mouseover')) {
        turtlegui._rebind(elem, 'mouseover', turtlegui._mouseover_listener);
    }
    if (elem.getAttribute('gui-mouseout')) {
        turtlegui._rebind(elem, 'mouseout', turtlegui._mouseout_listener);
    }
    if (elem.getAttribute('gui-mousemove')) {
        turtlegui._rebind(elem, 'mousemove', turtlegui._mousemove_listener);
    }
    if (elem.getAttribute('gui-keydown')) {
        turtlegui._rebind(elem, 'keydown', turtlegui._keydown_listener);
    }
    if (elem.getAttribute('gui-switch')) {
        var value = turtlegui._eval_attribute(elem, 'gui-switch');
        for (var i=0; i<elem.children.length; i++) {
            var child = elem.children[i];
            if (child.getAttribute('gui-case') && child.getAttribute('gui-case') == value) {
                turtlegui._show_element(child);
                turtlegui._reload(child, rel_data);
            } else if (child.getAttribute('gui-case') == null) {
                turtlegui._reload(child, rel_data);
            } else {
                turtlegui._hide_element(child);
            }
        }
    }
    else if (elem.getAttribute('gui-list')) {
        var list = turtlegui._eval_attribute(elem, 'gui-list');
        if (!Array.isArray(list)) {
            var rel_item = elem.getAttribute('gui-item');
            var rel_key = elem.getAttribute('gui-key');
            if (elem.getAttribute('gui-reversed')) {
                var rel_reverse = turtlegui._eval_attribute(elem, 'gui-reversed');
            } else {
                var rel_reverse = false;
            }

            var object_list = [];
            if (list) {
                var keys = Object.keys(list);
                for (var k=0; k<keys.length; k++) {
                    var key = keys[k];
                    if (elem.getAttribute('gui-ordering')) {
                        var rel = turtlegui.retrieve(elem, 'data-rel');
                        rel[rel_item] = list[key];
                        var order_key = turtlegui._eval_attribute(elem, 'gui-ordering');
                        object_list[object_list.length] = [order_key, key, list[key]];
                    } else {
                        object_list[object_list.length] = [key, key, list[key]];
                    }
                }
            }
            object_list.sort();
            if (rel_reverse) {
                object_list.reverse();
            }

            var orig_elems = [];
            for (var orig=0; orig<elem.children.length; orig++) {
                orig_elems[orig_elems.length] = elem.children[orig];
            }

            var template_elems;

            if (typeof(turtlegui.retrieve(elem, '_first_child')) == 'undefined') {
                template_elems = [];
                for (var orig=0; orig<orig_elems.length; orig++) {
                    template_elems[template_elems.length] = orig_elems[orig];
                }
                turtlegui.store(elem, '_first_child', template_elems);
            } else {
                template_elems = turtlegui.retrieve(elem, '_first_child');
            }

            for (var i=0; i<object_list.length; i++) {
                var obj_item = object_list[i];
                var obj_key = obj_item[1];
                var item = obj_item[2];

                var rel_data = Object.assign({}, rel_data);
                rel_data[rel_item] = item;
                if (rel_key != null) {
                    rel_data[rel_key] = obj_key;
                }

                for (var e=0; e<template_elems.length; e++) {
                    var new_elem = template_elems[e].cloneNode(true);

                    elem.append(new_elem);

                    turtlegui._show_element(new_elem);
                    turtlegui._reload(new_elem, rel_data);
                }
            }

            turtlegui.remove_elements(orig_elems);
        } else {
            var rel_item = elem.getAttribute('gui-item');
            var rel_key = elem.getAttribute('gui-key');
            var rel_order = elem.getAttribute('gui-ordering');
            var orig_elems = [];
            for (var orig=0; orig<elem.children.length; orig ++) {
                orig_elems[orig_elems.length] = elem.children[orig];
            }

            var template_elems;

            if (typeof(turtlegui.retrieve(elem, '_first_child')) == 'undefined') {
                template_elems = [];
                for (var orig=0; orig<orig_elems.length; orig++) {
                    template_elems[template_elems.length] = orig_elems[orig];
                }
                turtlegui.store(elem, '_first_child', template_elems);
            } else {
                template_elems = turtlegui.retrieve(elem, '_first_child');
            }

            if (rel_order) {
                ordered_list = [];
                for (var i=0; i<list.length; i++) {
                    ordered_list[i] = list[i];
                }
                function cmp(lhs, rhs) {
                    if (lhs[rel_order] == rhs[rel_order]) {
                        return 0;
                    }
                    else if (lhs[rel_order] > rhs[rel_order]) {
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
                ordered_list.sort(cmp);

                if (turtlegui._eval_attribute(elem, 'gui-reversed')) {
                    ordered_list.reverse();
                }

                list = ordered_list;
            }

            for (var i=0; i<list.length; i++) {
                var item = list[i];

                var rel_data = Object.assign({}, rel_data);
                rel_data[rel_item] = item;
                if (rel_key != null) {
                    rel_data[rel_key] = i;
                }

                for (var e=0; e<template_elems.length; e++) {
                    var new_elem = template_elems[e].cloneNode(true);

                    elem.append(new_elem);

                    turtlegui._show_element(new_elem);
                    turtlegui._reload(new_elem, rel_data);
                }
            }

            turtlegui.remove_elements(orig_elems);
        }
    }
    else if (elem.getAttribute('gui-tree')) {
        var tree = turtlegui._eval_attribute(elem, 'gui-tree');
        var rel_item = elem.getAttribute('gui-nodeitem');

        var orig_elems = [];
        for (var orig=0; orig<elem.children.length; orig++) {
            orig_elems[orig_elems.length] = elem.children[orig];
        }

        var first_elem;

        if (typeof(turtlegui.retrieve(elem, '_first_child')) == 'undefined') {
            first_elem = orig_elems[0];
            turtlegui.store(elem, '_first_child', first_elem);
        } else {
            first_elem = turtlegui.retrieve(elem, '_first_child');
        }

        var rel_data = Object.assign({}, rel_data);
        rel_data[rel_item] = tree;
        rel_data['_last_tree_elem'] = first_elem;
        rel_data['_last_tree_item'] = rel_item;
         
        var new_elem = first_elem.cloneNode(true);
        elem.append(new_elem);
        turtlegui._show_element(new_elem);
        turtlegui._reload(new_elem, rel_data);

        turtlegui.remove_elements(orig_elems);
    }
    else if (elem.getAttribute('gui-node')) {
        var node = turtlegui._eval_attribute(elem, 'gui-node');

        var orig_elems = [];
        for (var orig=0; orig<elem.children.length; orig++) {
            orig_elems[orig_elems.length] = elem.children[orig];
        }

        var first_elem = rel_data['_last_tree_elem'];
        var rel_data = Object.assign({}, rel_data);
        rel_data[rel_item] = node;
        rel_data[rel_data['_last_tree_item']] = node;
 
        var new_elem = first_elem.cloneNode(true);
        elem.append(new_elem);
        turtlegui._show_element(new_elem);
        turtlegui._reload(new_elem, rel_data);

        turtlegui.remove_elements(orig_elems);
    }
    else if (elem.getAttribute('gui-include') && !elem.getAttribute('gui-included')) {
        elem.setAttribute('gui-included', true);
        var url = elem.getAttribute('gui-include');
        if (url != null) {
            var params = turtlegui._semicolon_separated(elem, 'gui-include-params');

            var rel_data = Object.assign(params, rel_data);
            turtlegui.load_snippet(elem, url, rel_data);
        }
    }
    else if (elem.getAttribute('gui-include') && elem.getAttribute('gui-included')) {
        var params = turtlegui._semicolon_separated(elem, 'gui-include-params');

        var rel_data = Object.assign(params, rel_data);
        for (var c=0; c<elem.children.length; c++) {
            turtlegui._reload(elem.children[c], rel_data);
        }
    }
    else {
        for (var c=0; c<elem.children.length; c++) {
            turtlegui._reload(elem.children[c], rel_data);
        }
    }

    if (elem.getAttribute('gui-val')) {
        var obj_ref = turtlegui._eval_attribute(elem, 'gui-val');
        var value = obj_ref;
        if (typeof(obj_ref) == 'function') {
            value = obj_ref();
        }
        if (elem.type == 'checkbox' || elem.type == 'radio') {
            if (value) {
                elem.checked = true;
            } else {
                elem.checked = false;
            }
        } else {
            if (elem.getAttribute('gui-format-func')) {
                if (value != null) {
                    value = turtlegui._eval_attribute(elem, 'gui-format-func')(value);
                }
            }
            if (value == null) {
                elem.value = '';
            } else {
                elem.value = value;
            }
        }
        turtlegui._rebind(elem, 'change', turtlegui._val_change);
    }
    if (elem.getAttribute('gui-change')) {
        turtlegui._rebind(elem, 'change', turtlegui._change_listener);
    }
}


turtlegui._val_change = function(e) {
    var elem = e.currentTarget;
    var gres = elem.getAttribute('gui-val');

    if (elem.type == 'checkbox' || elem.type == 'radio') {
        var elem_val = elem.checked;
    } else {
        var elem_val = elem.value;
    }

    if (elem_val != null && elem.getAttribute('gui-parse-func')) {
        elem_val = turtlegui._eval_attribute(elem, 'gui-parse-func')(elem_val);
    }

    var partial = turtlegui._functionify_partial(gres, elem);
    if (partial.length == 1) {
        // Single variable
        window[partial[0]] = elem_val;
    } else if (partial.length == 4 && typeof(partial[0]) == 'object' && partial[1] == '[' && partial[3] == ']') {
        // dict-like object ref
        partial[0][partial[2]] = elem_val;
    } else if (partial.length == 3 && typeof(partial[0]) == 'object' && partial[1] == '.') {
        // dot object ref
        partial[0][partial[2]] = elem_val;
    } else if (typeof(partial[0]) == 'function' && partial[1] == '(' && partial[partial.length-1] == ')') {
        // function ref
        var params = partial.slice(1, partial.length-2);
        params.push(elem_val);
        partial[0].apply(elem, params);
    }

}

turtlegui._change_listener = function(e) {
    var elem = e.currentTarget;
    turtlegui._eval_attribute(elem, 'gui-change');
}

