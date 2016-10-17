

var all_data = {
    'company': {
        'name': 'Bobs Burgers',
        'periods': [
            {
                'eqyYear': 2015,
                'period': 'YE',
                'fhr': {
                    'stOverall': 45
                },
                "types": [
                    {"name": "bob"},
                    {"name": "ned"},
                    {"name": "bill"}
                ]
            },
            {
                'eqyYear': 2014,
                'period': 'Q2',
                'fhr': {
                    'stOverall': 65
                },
                "types": [
                    {"name": "fred"},
                    {"name": "jack"}
                ]
            }
        ]
    }
};


var more_data = [
    {
        'eqyYear': 2011,
        'period': 'Q1',
        'fhr': {
            'stOverall': 14
        },
        "types": [
            {"name": "bob"},
            {"name": "ned"},
            {"name": "bill"}
        ]
    },
    {
        'eqyYear': 2010,
        'period': 'Q2',
        'fhr': {
            'stOverall': 76
        },
        "types": [
            {"name": "bob"},
            {"name": "ned"},
            {"name": "bill"}
        ]

    }
];

var attached_elems = {};


function find_value(gres, rel_data) {
    var cdata = all_data;
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


function reload(elem, rel_data) {
    console.log("Reload: " + elem.attr('id'));
    if (elem.hasClass('gui-text')) {
        var gres = elem.attr('data-res');
        var value = find_value(gres, rel_data);
        elem.text(value);
        console.log("Val:"+value);
    }
    if (elem.hasClass('gui-list')) {
        var gres = elem.attr('data-res');
        var list = find_value(gres, rel_data);
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
            reload(new_elem, item);
        }
        orig_elems.remove();
        elem.prepend(first_elem);
    }
    else {
        elem.children().each(function() {
            reload($(this), rel_data);
        });
    }
}


function attach(elem, data) {
    attached_elems[elem] = data;
    reload(elem);
}


$( document ).ready(function() {
    console.log( "go!" );
    attach($('#main'), all_data);
    $("#change").click(function(e) {
        all_data.company.periods.push({
            'eqyYear': 2001, 'period': 'YE', 'fhr': {'stOverall': 11},
            "types": [
                {"name": "bob"},
                {"name": "ned"},
                {"name": "bill"}
            ]
        })
        reload($('#main'));
    });
});
