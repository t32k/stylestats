var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

describe('StyleStats!', function() {
    var stats = new StyleStats('test/fixture/test.css');
    var statsResult;
    before(function() {
        stats.parse(function(result) {
            statsResult = result;
        });
    });
    it('should returns stylesheets', function() {
        assert.equal(statsResult.stylesheets, 1);
    });
    it('should returns file size', function() {
        assert.equal(statsResult.size, 753);
    });
    it('should returns data URI size', function() {
        assert.equal(statsResult.dataUriSize, 82);
    });
    it('should returns raito of data URI size', function() {
        assert.equal(statsResult.raitoOfDataUriSize, 0.10889774236387782);
    });
    it('should returns css rules', function() {
        assert.equal(statsResult.rules, 10);
    });
    it('should returns css selectors', function() {
        assert.equal(statsResult.selectors, 15);
    });
    it('should returns simplicity', function() {
        assert.equal(statsResult.simplicity, 0.6666666666666666);
    });
    it('should returns most identifers', function() {
        assert.equal(statsResult.mostIdentifers, 5);
    });
    it('should returns most identifers selector', function() {
        assert.equal(statsResult.mostIdentifersSelector, '.foo  .bar > .baz + .qux ~ .quux:before');
    });
    it('should returns lowest cohesion', function() {
        assert.equal(statsResult.lowestCohesion, 8);
    });
    it('should returns lowest cohesion selector', function() {
        assert.equal(statsResult.lowestCohesionSelector, 'hr');
    });
    it('should returns total unique font sizes', function() {
        assert.equal(statsResult.totalUniqueFontSizes, 5);
    });
    it('should returns total unique colors', function() {
        assert.equal(statsResult.totalUniqueColors, 2);
    });
    it('should returns id selectors', function() {
        assert.equal(statsResult.idSelectors, 1);
    });
    it('should returns universal selectors', function() {
        assert.equal(statsResult.universalSelectors, 1);
    });
    it('should returns unqualified attribute selectors', function() {
        assert.equal(statsResult.unqualifiedAttributeSelectors, 1);
    });
    it('should returns JavaScript specific selectors', function() {
        assert.equal(statsResult.javascriptSpecificSelectors, 1);
    });
    it('should returns important keywords', function() {
        assert.equal(statsResult.importantKeywords, 1);
    });
    it('should returns float properties', function() {
        assert.equal(statsResult.floatProperties, 1);
    });
    it('should returns media queries"', function() {
        assert.equal(statsResult.mediaQueries, 1);
    });
});

describe('Custom StyleStats!', function() {
    it('should returns gzipped size', function() {
        var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
        customStats.parse(function(customResult) {
            assert.equal(customResult.gzippedSize, 217);
        });
    });
});

describe('Custom Object StyleStats!', function() {
    it('should returns gzipped size', function() {
        var configObj = {
            gzippedSize: true
        };
        var customObjectStats = new StyleStats('test/fixture/test.css', configObj);
        customObjectStats.parse(function(customObjectResult) {
            assert.equal(customObjectResult.gzippedSize, 217);
        });
    });
});


describe('Remote Pattern StyleStats!', function() {
    it('should returns file size', function() {
        var requestStats = new StyleStats('http://t32k.me/static/blog/skelton.css?query');
        requestStats.parse(function(requestResult) {
            assert.equal(requestResult.size, 15419);
        });
    });
});

describe('Directory Pattern StyleStats!', function() {
    it('should returns file size', function() {
        var dirStats = new StyleStats('test/fixture/');
        dirStats.parse(function(dirResult) {
            assert.equal(dirResult.size, 20462);
        });
    });
});

describe('Glob Pattern StyleStats!', function() {
    it('should returns file size', function() {
        var globStats = new StyleStats('test/**/*.css');
        globStats.parse(function(globResult) {
            assert.equal(globResult.size, 39931);
        });
    });
});

describe('Multiple Files StyleStats!', function() {
    it('should returns file size', function() {
        var multipleStats = new StyleStats(['test/fixture/test.css', 'test/fixture/app.css']);
        multipleStats.parse(function(multipleResult) {
            assert.equal(multipleResult.stylesheets, 2);
        });
    });
});