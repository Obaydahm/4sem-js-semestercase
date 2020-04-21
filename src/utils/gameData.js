const gameArea = {
    "type": "Polygon",
    "coordinates": [
        [
            [
                12.544670104980469,
                55.77541444884565
            ],
            [
                12.57711410522461,
                55.77729710731694
            ],
            [
                12.57084846496582,
                55.794912451489
            ],
            [
                12.544670104980469,
                55.77541444884565
            ]
        ],
        [
            [
                12.559947967529297,
                55.780145058811364
            ],
            [
                12.559947967529297,
                55.78308933220229
            ],
            [
                12.565269470214842,
                55.78308933220229
            ],
            [
                12.565269470214842,
                55.780145058811364
            ],
            [
                12.559947967529297,
                55.780145058811364
            ]
        ]
    ]
};
const players = [
    {
        "type": "Feature",
        "properties": {
            "name": "Team1-INSIDE"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.56612777709961,
                55.7857920758437
            ]
        }
    },
    {
        "type": "Feature",
        "properties": {
            "name": "Team2-INSIDE"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.567672729492188,
                55.778165995937634
            ]
        }
    },
    {
        "type": "Feature",
        "properties": { "name": "Team3-OUTSIDE" },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.55488395690918,
                55.784995751218005
            ]
        }
    },
    {
        "type": "Feature",
        "properties": { "name": "Team4-OUTSIDE" },
        "geometry": {
            "type": "Point",
            "coordinates": [
                12.575955390930174,
                55.78287213930687
            ]
        }
    }
];

module.exports = { gameArea, players }