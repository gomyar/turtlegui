
/** TurtleGUI - a javascript GUI library. Shared using MIT license (see LICENSE file)
*/

$.ajaxSetup ({
    // Disable caching of AJAX responses
    cache: false
});

var turtlegui = {};

turtlegui.root_element = $(document);
turtlegui.cached_snippets = {};
turtlegui.loading_snippets = {};


turtlegui._get_safe_value = function(elem, datasrc) {
    var gres = elem.attr(datasrc);
    if (!gres) {
        throw "No " + datasrc + " field on element " + elem.attr('id');
    }
    return turtlegui._relative_eval(elem, gres);
}


turtlegui.getstack = function(elm) {
    return elm.parent().length > 0 && !elm.parent().is('body') ? turtlegui.getstack(elm.parent()).concat([elm]) : [elm];
}


turtlegui.log_error = function(msg, elem) {
    console.log("Error at:", elem);
    var stack = turtlegui.getstack(elem);
    for (var i in stack) {
        var elm = $(stack[i]);
        var desc = elm.prop('nodeName') + (elm.attr('id')?'#'+elm.attr('id'):"") + "[" + elm.index() + "]" + "\"" + elm.attr('class') + "\"";
        try {
            var attributes = stack[i][0].getAttributeNames();
            var desc = '<' + elm.prop('nodeName') + "[" + elm.index() + "]";
            for (var key in attributes) {
                desc = desc + ' ' + attributes[key] + '="' + stack[i].attr(attributes[key]) + '"';
            }
            desc = desc + '>';
        } catch (e) {
            console.log('getAttributeName unsupported');
        }
        console.log("  ".repeat(i) + desc);
    }
    console.log(msg);
}


turtlegui.resolve_field = function(gres, rel_data) {
    if (gres in rel_data) {
        return rel_data[gres];
    } else if (gres in window) {
        return window[gres];
    } else {
        return undefined;
    }
}

turtlegui._tokenize = function(token_str) {
    var tokens = [];
    var token = '';
    for (var i=0; i<token_str.length; i++) {
        if ('(),[].'.indexOf(token_str[i]) != -1) {
            if (token) {
                tokens[tokens.length] = token.trim();
            }
            if (token_str[i] != ',') {
                tokens[tokens.length] = token_str[i];
            }
            token = '';
        } else {
            token = token + token_str[i];
        }
    }
    if (token) {
        tokens[tokens.length] = token;
    }
    return tokens;
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
    var rel_data = elem.data('data-rel') || {};
 
    var tokens = turtlegui._tokenize(gres);

    for (var t=0; t<tokens.length; t++) {
        var tl = turtlegui._process_token(tokens, t, gres, rel_data, elem);
        tokens = tl[0];
        t = tl[1];
    }

    return tokens[0];
}


turtlegui._functionify_partial = function(gres, elem) {
    var rel_data = elem.data('data-rel') || {};

    var tokens = turtlegui._tokenize(gres);

    for (var t=0; t<tokens.length - 1; t++) {
        var tl = turtlegui._process_token(tokens, t, gres, rel_data, elem);
        tokens = tl[0];
        t = tl[1];
    }

    return tokens;
}


// params is just for functions
turtlegui._relative_eval = function(elem, gres, params) {
    try {
        var rel = elem.data('data-rel');
    }catch(e) {
        console.log("error", e);
    }
    var switcharoo = {};
    for (var key in rel) {
        if (key in window) {
            switcharoo[key] = window[key];
        }
        window[key] = rel[key];
    }
    try {
        return turtlegui._functionify(gres, elem);
    } catch(e) {
        try {
            turtlegui.log_error("Error evaluating " + gres + " on elem : " + e, elem)
        } catch (noconsole) {
            throw e;
        }
    } finally {
        for (var key in switcharoo) {
            window[key] = switcharoo[key];
        }
    }
}


turtlegui.load_snippet = function(elem, url, rel_data) {
    if (url in turtlegui.cached_snippets) {
        elem.html(turtlegui.cached_snippets[url]);
        turtlegui.reload(elem, rel_data);
    } else if (url in turtlegui.loading_snippets) {
        turtlegui.loading_snippets[url][turtlegui.loading_snippets[url].length] = {'elem': elem, 'rel_data': rel_data};
    } else if (!(url in turtlegui.loading_snippets)) {
        turtlegui.loading_snippets[url] = [{'elem': elem, 'rel_data': rel_data}];
        var nocache = elem.attr('data-gui-include-nocache');
        $.ajax({
            url: url,
            dataType: "html",
            success: function(data) {
                if (!nocache) {
                    turtlegui.cached_snippets[url] = data;
                }

                var snippets = turtlegui.loading_snippets[url];
                delete turtlegui.loading_snippets[url];

                for (var i in snippets) {
                    var elem = snippets[i].elem;
                    var rel_data = snippets[i].rel_data;
                    elem.html(data);
                    turtlegui.reload(elem, rel_data);
                }
            },
            error: function(response, status, xhr) {
                console.log("Could not load html snippet: " + url + " - " + xhr.status + " " + xhr.statusText);
            }
        });
    }
}


turtlegui.reload = function(elem, rel_data) {
    var path = turtlegui.getstack($(document.activeElement));
    var path_indices = [];
    for (var i=0; i<path.length; i++) {
        path_indices[i] = path[i].index();
    }
    turtlegui._reload(elem, rel_data);
    var current_elem = $('body');
    for (var i=0; i<path_indices.length; i++) {
        current_elem = $(current_elem.children()[path_indices[i]]);
    }
    if (document.activeElement != current_elem) {
        current_elem.focus();
    }
}


turtlegui.deferred_reload = function(elem, rel_data, callback) {
    setTimeout(function() {
        turtlegui.reload(elem, rel_data);
        if (callback) {
            callback();
        }
    }, 0);
}


turtlegui._show_element = function(elem) {
    if (elem.attr('data-gui-onshow')) {
        turtlegui._relative_eval(elem, elem.attr('data-gui-onshow'))
    } else {
        elem.show();
    }
}


turtlegui._hide_element = function(elem) {
    if (elem.attr('data-gui-onhide')) {
        turtlegui._relative_eval(elem, elem.attr('data-gui-onhide'))
    } else {
        elem.hide();
    }
}


turtlegui._semicolon_separated = function(elem, attrstr) {
    if (attrstr != null) {
        var attrs = attrstr.split(';');
        var comma = {};
        for (var attr in attrs) {
            if (attrs[attr].indexOf('=') != -1) {
                var key = attrs[attr].split('=')[0];
                var val = turtlegui._relative_eval(elem, attrs[attr].split('=')[1]);
                comma[key] = val;
            } else {
                turtlegui.log_error("Cannot evaluate " + attrs[attr] + " of '" + attrstr + "' :- must be a semicolon-separated string of name=value pairs)", elem)
            }
        }
        return comma;
    } else {
        return {}
    }
}


turtlegui._reload = function(elem, rel_data) {
    if (!rel_data) rel_data = {};

    if (!elem) {
        elem = turtlegui.root_element;
    }
    if (rel_data) {
        elem.data('data-rel', rel_data);
    }
    if (elem.attr('data-gui-show')) {
        var value = turtlegui._get_safe_value(elem, 'data-gui-show');
        if (value) {
            turtlegui._show_element(elem);
        } else {
            turtlegui._hide_element(elem);
            if (elem.attr('data-gui-id')) {
                $(elem).attr('id', null);
            }
            return;
        }
    }
    if (elem.attr('data-gui-attrs')) {
        var attrstr = elem.attr('data-gui-attrs');
        var attrs = turtlegui._semicolon_separated(elem, attrstr);
        for (var key in attrs) {
            elem.attr(key, attrs[key]);
        }
    }
    if (elem.attr('data-gui-data')) {
        var datastr = elem.attr('data-gui-data');
        var datas = turtlegui._semicolon_separated(elem, datastr);
        for (var key in datas) {
            elem.data(key, datas[key]);
        }
    }
    if (elem.attr('data-gui-class')) {
        var orig_class = elem.attr('data-orig-class');
        if (!orig_class && elem.attr('class')) {
            elem.attr('data-orig-class', elem.attr('class'));
            orig_class = elem.attr('class');
        }
        var value = turtlegui._get_safe_value(elem, 'data-gui-class');
        elem.removeClass();
        elem.addClass((orig_class || '') + ' ' + (value || ''));
    }
    if (elem.attr('data-gui-id')) {
        var value = turtlegui._get_safe_value(elem, 'data-gui-id');
        $(elem).attr('id', value);
    }
    if (elem.attr('data-gui-text')) {
        value = turtlegui._get_safe_value(elem, 'data-gui-text');
        elem.text(value);
    }
    if (elem.attr('data-gui-html')) {
        value = turtlegui._get_safe_value(elem, 'data-gui-html');
        elem.html(value);
    }
    if (elem.attr('data-gui-click')) {
        elem.unbind('click').click(function(e) {
            return turtlegui._relative_eval(elem, elem.attr('data-gui-click'));
        });
    }
    if (elem.attr('data-gui-bind') && elem.attr('data-gui-event')) {
        var bind = elem.attr('data-gui-bind');
        elem.unbind(bind).bind(bind, function(e) {
            return turtlegui._relative_eval(elem, elem.attr('data-gui-event'));
        });
    }
    if (elem.attr('data-gui-switch')) {
        var value = turtlegui._get_safe_value(elem, 'data-gui-switch');
        var child_elems = elem.children();
        for (var i=0; i<child_elems.length; i++) {
            var child = $(child_elems[i]);
            if (child.attr('data-gui-case') && child.attr('data-gui-case') == value) {
                turtlegui._show_element(child);
                turtlegui._reload(child, rel_data);
            } else if (child.attr('data-gui-case') == null) {
                turtlegui._reload(child, rel_data);
            } else {
                turtlegui._hide_element(child);
            }
        }
    }
    else if (elem.attr('data-gui-list')) {
        var list = turtlegui._get_safe_value(elem, 'data-gui-list');
        if ($.isPlainObject(list)) {
            var rel_item = elem.attr('data-gui-item');
            var rel_key = elem.attr('data-gui-key');
            var rel_order = elem.attr('data-gui-ordering');
            if (elem.attr('data-gui-reversed')) {
                var rel_reverse = turtlegui._get_safe_value(elem, 'data-gui-reversed');
            } else {
                var rel_reverse = false;
            }

            var object_list = [];
            for (var key in list) {
                if (rel_order) {
                    var rel = elem.data('data-rel');
                    rel[rel_item] = list[key];
                    var order_key = turtlegui._relative_eval(elem, rel_order);
                    object_list[object_list.length] = [order_key, key, list[key]];
                } else {
                    object_list[object_list.length] = [key, key, list[key]];
                }
            }
            object_list.sort();
            if (rel_reverse) {
                object_list.reverse();
            }

            var orig_elems = elem.children();
            var first_elem;

            if (typeof(elem.data('_first_child')) == 'undefined') {
                first_elem = $(orig_elems[0]);
                elem.data('_first_child', first_elem);
            } else {
                first_elem = elem.data('_first_child');
            }


            var new_elems = [];
            for (var i in object_list) {
                var new_elem = $(first_elem).clone();
                new_elems[new_elems.length] = new_elem;
            }
            for (var i in new_elems) {
                var obj_item = object_list[i];
                var obj_key = obj_item[1];
                var item = obj_item[2];

                var new_elem = new_elems[i];
                elem.append(new_elem);
                turtlegui._show_element(new_elem);
                var rel_data = jQuery.extend({}, rel_data);
                rel_data[rel_item] = item;
                if (rel_key != null) {
                    rel_data[rel_key] = obj_key;
                }
                turtlegui._reload(new_elem, rel_data);
            }
            orig_elems.remove();
        } else {
            var rel_item = elem.attr('data-gui-item');
            var rel_key = elem.attr('data-gui-key');
            var orig_elems = elem.children();

            var first_elem;

            if (typeof(elem.data('_first_child')) == 'undefined') {
                first_elem = $(orig_elems[0]);
                elem.data('_first_child', first_elem);
            } else {
                first_elem = elem.data('_first_child');
            }

            var new_elems = [];
            for (var i in list) {
                var new_elem = $(first_elem).clone();
                new_elems[new_elems.length] = new_elem;
            }
            for (var i in new_elems) {
                var item = list[i];
                var new_elem = new_elems[i];
                elem.append(new_elem);
                turtlegui._show_element(new_elem);
                var rel_data = jQuery.extend({}, rel_data);
                rel_data[rel_item] = item;
                if (rel_key != null) {
                    rel_data[rel_key] = i;
                }
                turtlegui._reload(new_elem, rel_data);
            }
            orig_elems.remove();
        }
    }
    else if (elem.attr('data-gui-tree')) {
        var tree = turtlegui._get_safe_value(elem, 'data-gui-tree');
        var rel_item = elem.attr('data-gui-nodeitem');

        var orig_elems = elem.children();

        var first_elem;

        if (typeof(elem.data('_first_child')) == 'undefined') {
            first_elem = $(orig_elems[0]);
            elem.data('_first_child', first_elem);
        } else {
            first_elem = elem.data('_first_child');
        }

        var rel_data = jQuery.extend({}, rel_data);
        rel_data[rel_item] = tree;
        rel_data['_last_tree_elem'] = first_elem;
        rel_data['_last_tree_item'] = rel_item;
         
        var new_elem = $(first_elem).clone();
        elem.append(new_elem);
        turtlegui._show_element(new_elem);
        turtlegui._reload(new_elem, rel_data);

        orig_elems.remove();
    }
    else if (elem.attr('data-gui-node')) {
        var node = turtlegui._get_safe_value(elem, 'data-gui-node');

        var orig_elems = elem.children();
        var first_elem = rel_data['_last_tree_elem'];
        var rel_data = jQuery.extend({}, rel_data);
        rel_data[rel_item] = node;
        rel_data[rel_data['_last_tree_item']] = node;
 
        var new_elem = $(first_elem).clone();
        elem.append(new_elem);
        turtlegui._show_element(new_elem);
        turtlegui._reload(new_elem, rel_data);

        orig_elems.remove();
    }
    else if (elem.attr('data-gui-include') && !elem.attr('data-gui-included')) {
        elem.attr('data-gui-included', true);
        var url = elem.attr('data-gui-include');
        if (url != null) {
            var params = turtlegui._semicolon_separated(elem, elem.attr('data-gui-include-params'));

            var rel_data = jQuery.extend(params, rel_data);
            turtlegui.load_snippet(elem, url, rel_data);
        }
    }
    else if (elem.attr('data-gui-include') && elem.attr('data-gui-included')) {
        var params = turtlegui._semicolon_separated(elem, elem.attr('data-gui-include-params'));

        var rel_data = jQuery.extend(params, rel_data);
        elem.children().each(function() {
            turtlegui._reload($(this), rel_data);
        });
    }
    else {
        elem.children().each(function() {
            turtlegui._reload($(this), rel_data);
        });
    }

    if (elem.attr('data-gui-val') || elem.attr('data-gui-change')) {
        // This overwrites any manually bound change events
        $(elem).unbind('change');
    }

    if (elem.attr('data-gui-val')) {
        var obj_ref = turtlegui._get_safe_value(elem, 'data-gui-val');
        var value = obj_ref;
        if (typeof(obj_ref) == 'function') {
            value = obj_ref();
        }
        if ($(elem).is(':checkbox')) {
            if (value) {
                $(elem).prop('checked', true);
            } else {
                $(elem).prop('checked', false);
            }
        } else {
            if (elem.attr('data-gui-format-func')) {
                if (value != null) {
                    value = turtlegui._relative_eval(elem, elem.attr('data-gui-format-func'))(value);
                }
            }
            $(elem).val(value);
        }
        $(elem).change(function () {
            var gres = elem.attr('data-gui-val');

            if ($(elem).is(':checkbox')) {
                var elem_val = $(elem).prop('checked');
            } else {
                var elem_val = $(elem).val();
            }

            if (elem_val != null && elem.attr('data-gui-parse-func')) {
                elem_val = turtlegui._relative_eval(elem, elem.attr('data-gui-parse-func'))(elem_val);
            }

            var partial = turtlegui._functionify_partial(gres, elem);
            if (partial.length == 1) {
                // Single variable
                window[partial[0]] = elem_val;
            } else if (partial.length == 4 && $.isPlainObject(partial[0]) && partial[1] == '[' && partial[3] == ']') {
                // dict-like object ref
                partial[0][partial[2]] = elem_val;
            } else if (partial.length == 3 && $.isPlainObject(partial[0]) && partial[1] == '.') {
                // dot object ref
                partial[0][partial[2]] = elem_val;
            } else if (typeof(partial[0]) == 'function' && partial[1] == '(' && partial[partial.length-1] == ')') {
                // function ref
                var params = partial.slice(1, partial.length-2);
                params.push(elem_val);
                partial[0].apply(elem, params);
            }
        });
    }
    if (elem.attr('data-gui-change')) {
        $(elem).change(function (){
            turtlegui._relative_eval(elem, elem.attr('data-gui-change'));
        });
    }
}
