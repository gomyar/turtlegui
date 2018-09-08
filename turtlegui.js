
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
    console.log("Error at:");
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
    var cdata = window;
    while (gres.indexOf('.') != -1) {
        var field = gres.split('.', 1)[0];
        cdata = cdata[field]
        gres = gres.slice(gres.indexOf('.') + 1);
    }
    return cdata[gres];
}


turtlegui._call_callable = function(elem, gres, params) {
    var callable = turtlegui._get_safe_value(elem, gres);
    if (typeof(callable) == 'function') {
        return callable.apply(elem, params);
    } else {
        turtlegui.log_error("Error object not callable: " + gres + " on elem : " + elem, elem)
    }
}


turtlegui._relative_eval = function(elem, gres) {
    try {
        var rel = elem.data('data-rel');
    }catch(e) {
        console.log("error ");
    }
    var switcharoo = {};
    for (var key in rel) {
        if (key in window) {
            switcharoo[key] = window[key];
        }
        window[key] = rel[key];
    }
    try {
        obj = turtlegui.resolve_field(gres);
        if (typeof(callable) == 'function') {
            return obj.apply(elem);
        } else {
            return obj;
        }
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
    return result;
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
    current_elem.focus();
}


turtlegui.deferred_reload = function(elem, rel_data) {
    setTimeout(function() {
        turtlegui.reload(elem, rel_data);
    }, 0);
}


turtlegui._get_data_gui_params = function (elem) {
    var params = {};
    if (elem.attr('data-gui-include-params')) {
        // Needs extra brackets to eval object
        params = turtlegui._relative_eval(elem, "(" + elem.attr('data-gui-include-params') + ")");
        if (!$.isPlainObject(params)) {
            throw "data-gui-include-params must evaluate to a Plain JS Object";
        }
    }
    return params;
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
        var attrs = attrstr.split(',');
        for (var attr in attrs) {
            var key = attrs[attr].split('=')[0];
            var val = turtlegui._relative_eval(elem, attrs[attr].split('=')[1]);
            elem.attr(key, val);
        }
    }
    if (elem.attr('data-gui-data')) {
        var datastr = elem.data('data-gui-data');
        var datas = datastr.split(',');
        for (var data in datas) {
            var key = datas[data].split('=')[0];
            var val = turtlegui._relative_eval(elem, datas[data].split('=')[1]);
            elem.data(key, val);
        }
    }
    if (elem.attr('data-gui-class')) {
        var value = turtlegui._get_safe_value(elem, 'data-gui-class');
        elem.removeClass();
        elem.addClass(value);
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
            turtlegui._call_callable(elem, 'data-gui-click');
        });
    }
    if (elem.attr('data-gui-bind') && elem.attr('data-gui-event')) {
        var bind = elem.attr('data-gui-bind');
        elem.unbind(bind).bind(bind, function(e) {
            return turtlegui._call_callable(elem, 'data-gui-event');
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
        var url = turtlegui._get_safe_value(elem, 'data-gui-include');

        var params = turtlegui._get_data_gui_params(elem);

        var rel_data = jQuery.extend(params, rel_data);
        turtlegui.load_snippet(elem, url, rel_data);
    }
    else if (elem.attr('data-gui-include') && elem.attr('data-gui-included')) {
        var params = turtlegui._get_data_gui_params(elem);

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
        var value = turtlegui._get_safe_value(elem, 'data-gui-val');
        if ($(elem).is(':checkbox')) {
            $(elem).prop('checked', value);
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
                turtlegui._relative_eval(elem, gres + " = " + $(elem).prop('checked'));
            } else if (elem.attr('data-gui-parse-func')) {
                var elem_val = $(elem).val();
                if (elem_val != null) {
                    // Complex objects don't parse so well with eval, so putting the result into the data-rel structure
                    var __formatted = turtlegui._relative_eval(elem, elem.attr('data-gui-parse-func'))(elem_val);
                    var rel = elem.data('data-rel');
                    rel['__formatted'] = __formatted;
                    turtlegui._relative_eval(elem, gres + " = __formatted");
                } else {
                    turtlegui._relative_eval(elem, gres + " = null");
                }
            } else {
                var elemval = $(elem).val();
                var obj = turtlegui.resolve_field(gres);
                if (typeof(obj) == 'function') {
                    turtlegui._call_callable(elem, gres);
                } else {
                    var parentobj;
                    var fieldname;
                    if (gres.indexOf('.') != -1) {
                        var parentgres = gres.substring(0, gres.lastIndexOf('.'));
                        parentobj = turtlegui.resolve_field(parentgres);
                        fieldname = gres.substring(gres.lastIndexOf('.') + 1);
                    } else {
                        parentobj = window;
                        fieldname = gres;
                    }
                    parentobj[fieldname] = elemval;
                }
            }
        });
    }
    if (elem.attr('data-gui-change')) {
        $(elem).change(function (){
            turtlegui._call_callable(elem, 'data-gui-change');
        });
    }
}
