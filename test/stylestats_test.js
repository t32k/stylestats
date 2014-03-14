var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

var stats = new StyleStats('test/fixture/test.css');
stats.parse(function (result) {
    describe('StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(result.size, 498);
        });
        it('should returns css rules', function() {
            assert.equal(result.rules, 7);
        });
        it('should returns css selectors', function() {
            assert.equal(result.selectors, 11);
        });
        it('should returns simplicity', function() {
            assert.equal(result.simplicity, 0.6363636363636364);
        });
        it('should returns lowest cohesion', function() {
            assert.equal(result.lowestCohesion, 6);
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
            assert.equal(result.universalSelectors, 0);
        });
        it('should returns important keywords', function() {
            assert.equal(result.importantKeywords, 1);
        });
        it('should returns media queries"', function() {
            assert.equal(result.mediaQueries, 1);
        });
    });
});

var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
customStats.parse(function (customResult) {
    describe('Custom StyleStats!', function() {
        it('should returns gzipped size', function() {
            assert.equal(customResult.gzippedSize, 155);
        });
    });
});

var configObj = {
    gzippedSize: true
};
var customObjectStats = new StyleStats('test/fixture/test.css', configObj);
customObjectStats.parse(function (customObjectResult) {
    describe('CustomObject StyleStats!', function() {
        it('should returns gzipped size', function() {
            assert.equal(customObjectResult.gzippedSize, 155);
        });
    });
});

var globStats = new StyleStats('test/**/*.css');
globStats.parse(function (globResult) {
    describe('Glob Pattern StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(globResult.size, 19967);
        });
    });
});

var requestStats = new StyleStats('http://t32k.me/mol/assets/main.css');
requestStats.parse(function (requestResult) {
    describe('Remote Pattern StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(requestResult.size, 19967);
        });
    });
});

var multipleStats = new StyleStats(['test/fixture/test.css', 'test/fixture/app.css']);
multipleStats.parse(function (multipleResult) {
    describe('Multiple Files StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(multipleResult.stylesheets, 2);
        });
    });
});