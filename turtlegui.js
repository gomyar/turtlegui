
var turtlegui = {};

turtlegui.data = {};
turtlegui.root_element = $(document);


turtlegui.find_value = function(gres, rel_data) {
    var cdata = turtlegui.data;
    if (gres.startsWith('.')) {
        cdata = rel_data;
        gres = gres.slice(1);
    }
    while (gres.indexOf('.') != -1) {
        var field = gres.split('.', 1)[0];
        cdata = cdata[field]
        gres = gres.slice(gres.indexOf('.') + 1);
    }
    return cdata[gres];
}


turtlegui.reload = function(elem, rel_data) {
    if (!elem) {
        elem = turtlegui.root_element;
    }
    if (elem.hasClass('gui-text')) {
        var gres = elem.attr('data-res');
        var value = turtlegui.find_value(gres, rel_data);
        elem.text(value);
        console.log("Val:"+value);
    }
    if (elem.hasClass('gui-list')) {
        var gres = elem.attr('data-res');
        var list = turtlegui.find_value(gres, rel_data);
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
    else {
        elem.children().each(function() {
            turtlegui.reload($(this), rel_data);
        });
    }
}
