

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


$( document ).ready(function() {
    console.log( "go!" );
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
