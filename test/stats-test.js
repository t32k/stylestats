var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

var stats = new StyleStats('test/fixture/test.css');
stats.parse(function(result) {
    //console.log(this.rules);
    describe('StyleStats!', function() {
        it('should returns stylesheets', function() {
            assert.equal(result.stylesheets, 1);
        });
        it('should returns file size', function() {
            assert.equal(result.size, 615);
        });
        it('should returns css rules', function() {
            assert.equal(result.rules, 9);
        });
        it('should returns css selectors', function() {
            assert.equal(result.selectors, 14);
        });
        it('should returns simplicity', function() {
            assert.equal(result.simplicity, 0.6428571428571429);
        });
        it('should returns most identifers', function() {
            assert.equal(result.mostIdentifers, 5);
        });
        it('should returns most identifers selector', function() {
            assert.equal(result.mostIdentifersSelector, '.foo  .bar > .baz + .qux ~ .quux:before');
        });
        it('should returns lowest cohesion', function() {
            assert.equal(result.lowestCohesion, 7);
        });
        it('should returns lowest cohesion selector', function() {
            assert.equal(result.lowestCohesionSelector, 'hr');
        });
        it('should returns total unique font sizes', function() {
            assert.equal(result.totalUniqueFontSizes, 5);
        });
        it('should returns total unique colors', function() {
            assert.equal(result.totalUniqueColors, 2);
        });
        it('should returns id selectors', function() {
            assert.equal(result.idSelectors, 1);
        });
        it('should returns universal selectors', function() {
            assert.equal(result.universalSelectors, 1);
        });
        it('should returns unqualified attribute selectors', function() {
            assert.equal(result.unqualifiedAttributeSelectors, 1);
        });
        it('should returns important keywords', function() {
            assert.equal(result.importantKeywords, 1);
        });
        it('should returns float properties', function() {
            assert.equal(result.floatProperties, 1);
        });
        it('should returns media queries"', function() {
            assert.equal(result.mediaQueries, 1);
        });
    });
});

var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
customStats.parse(function(customResult) {
    describe('Custom StyleStats!', function() {
        it('should returns gzipped size', function() {
            assert.equal(customResult.gzippedSize, 181);
        });
    });
});

var configObj = {
    gzippedSize: true
};
var customObjectStats = new StyleStats('test/fixture/test.css', configObj);
customObjectStats.parse(function(customObjectResult) {
    describe('Custom Object StyleStats!', function() {
        it('should returns gzipped size', function() {
            assert.equal(customObjectResult.gzippedSize, 181);
        });
    });
});

var globStats = new StyleStats('test/**/*.css');
globStats.parse(function(globResult) {
    describe('Glob Pattern StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(globResult.size, 20324);
        });
    });
});

var requestStats = new StyleStats('http://t32k.me/mol/assets/main.css');
requestStats.parse(function(requestResult) {
    describe('Remote Pattern StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(requestResult.size, 19987);
        });
    });
});

var multipleStats = new StyleStats(['test/fixture/test.css', 'test/fixture/app.css']);
multipleStats.parse(function(multipleResult) {
    describe('Multiple Files StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(multipleResult.stylesheets, 2);
        });
    });
});