var assert = require('assert');
require('../public/js/charts.js');
require('../public/js/charts/shortagechart.js');

var d1 = [
    {
    title: 'Chart 1',
    data: {
        type: 'shortagechart',
        dataset: {
            demand: [
                {label: 'Track1', value: 10},
                {label: 'Track2', value: 20}
            ],
            shortage: [
                {label: 'Apps', value: 10},
                {label: 'Native', value: 5}
            ]
        }
    }
}
];

var d3 = [
    {
    title: 'Chart 1',
    data: {
        type: 'shortagechart',
        dataset: {
            demand: [
                {label: 'Track1', value: 10},
                {label: 'Track2', value: 20}
            ],
            shortage: [
                {label: 'Apps', value: 10},
                {label: 'Native', value: 5}
            ]
        }
    }
},
    {
    title: 'Chart 2',
    data: {
        type: 'shortagechart',
        dataset: {
            demand: [
                {label: 'Track1', value: 10},
                {label: 'Track2', value: 20}
            ],
            shortage: [
                {label: 'Apps', value: 10},
                {label: 'Native', value: -5}
            ]
        }
    }
},
    {
    title: 'Chart 3',
    data: {
        type: 'shortagechart',
        dataset: {
            demand: [
                {label: 'Track1', value: 10},
                {label: 'Track2', value: 20}
            ],
            shortage: [
                {label: 'Apps', value: -10},
                {label: 'Native', value: -5}
            ]
        }
    }
}
];

var CHART_WIDTH = 960;

describe('getChartHeight', function() {
    it('should return the height of a single chart', function() {
        assert.equal(320, charts.shortagechart.getChartHeight(CHART_WIDTH, d1));
    });

});

describe('getEffortSize', function() {
    it('should sum demand when there are shortages', function() {
        assert.equal(30, charts.shortagechart.getEffortSize(d3[0].data.dataset));
    });

    it('should sum demand when there are any shortages', function() {
        assert.equal(30, charts.shortagechart.getEffortSize(d3[1].data.dataset));
    });

    it('should sum shortage when shortages are all negative', function() {
        assert.equal(15, charts.shortagechart.getEffortSize(d3[2].data.dataset));
    });
});

describe('normalizeDimensions', function() {
    it('should scale the largest item to the specified dimension', function() {
        var sizes = [30, 8, 30, 8];
        var newSizes = charts.shortagechart.normalizeDimensions(300, sizes);
        assert.deepEqual([300, 80, 300, 80], newSizes);
    });
});
