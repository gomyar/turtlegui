

var all_data = {
    'company': {
        'name': 'Bobs Burgers',
        'periods': [
            {
                'eqyYear': 2015,
                "showme": true,
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


function clicked1(e, payload) {
    console.log("clicked " + payload.eqyYear);
    console.log("index:" + jQuery.inArray(payload, all_data.company.periods));
}


function get_time() {
    return new Date();
}


function showmeornot(e, item) {
    return jQuery.inArray(item, all_data.company.periods) % 2;
}


$( document ).ready(function() {
    turtlegui.data = all_data;
    turtlegui.reload()
    $("#change").click(function(e) {
        all_data.company.periods.push({
            'eqyYear': 2001, 'period': 'YE', 'fhr': {'stOverall': 11},
            "types": [
                {"name": "bob"},
                {"name": "ned"},
                {"name": "bill"}
            ]
        })
        turtlegui.reload();
    });
});
