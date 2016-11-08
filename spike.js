

var model = {
    'company': {
        'name': 'Bobs Burgers',
        'periods': [
            {
                'eqyYear': 2015,
                "showme": true,
                'period': 'YE',
                'visible': true,
                'fhr': {
                    'stOverall': 45
                },
                "types": [
                    {"name": "bob", "visible": true},
                    {"name": "ned", "visible": false},
                    {"name": "bill", "visible": true}
                ]
            },
            {
                'eqyYear': 2014,
                'period': 'Q2',
                'visible': true,
                'fhr': {
                    'stOverall': 65
                },
                "types": [
                    {"name": "fred", "visible": false},
                    {"name": "jack", "visible": true}
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


function clicked1(e, payload) {
    console.log("clicked " + payload.eqyYear);
    console.log("index:" + jQuery.inArray(payload, model.company.periods));
}


function get_time() {
    return new Date();
}


function showmeornot(e, item) {
    return jQuery.inArray(item, model.company.periods) % 2;
}


function classme(e, item) {
    return "blue";
}

function change_clicked(e) {
    model.company.periods.push({
        'eqyYear': 2001, 'period': 'YE', 'fhr': {'stOverall': 11},
        "types": [
            {"name": "bob"},
            {"name": "ned"},
            {"name": "bill"}
        ]
    })
    turtlegui.reload();
}


$( document ).ready(function() {
    turtlegui.reload()
});
