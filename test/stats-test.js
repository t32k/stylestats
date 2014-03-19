var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

var stats = new StyleStats('test/fixture/test.css');
stats.parse(function(result) {
    describe('StyleStats!', function() {
        it('should returns stylesheets', function() {
            assert.equal(result.stylesheets, 1);
        });
        it('should returns file size', function() {
            assert.equal(result.size, 753);
        });
        it('should returns data URI size', function() {
            assert.equal(result.dataUriSize, 82);
        });
        it('should returns raito of data URI size', function() {
            assert.equal(result.raitoOfDataUriSize, 0.10889774236387782);
        });
        stats.raitoOfDataUriSize
        it('should returns css rules', function() {
            assert.equal(result.rules, 10);
        });
        it('should returns css selectors', function() {
            assert.equal(result.selectors, 15);
        });
        it('should returns simplicity', function() {
            assert.equal(result.simplicity, 0.6666666666666666);
        });
        it('should returns most identifers', function() {
            assert.equal(result.mostIdentifers, 5);
        });
        it('should returns most identifers selector', function() {
            assert.equal(result.mostIdentifersSelector, '.foo  .bar > .baz + .qux ~ .quux:before');
        });
        it('should returns lowest cohesion', function() {
            assert.equal(result.lowestCohesion, 8);
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
        it('should returns JavaScript specific selectors', function() {
            assert.equal(result.javascriptSpecificSelectors, 1);
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
            assert.equal(customResult.gzippedSize, 217);
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
            assert.equal(customObjectResult.gzippedSize, 217);
        });
    });
});

// Doesn't work...
var requestStats = new StyleStats('http://t32k.me/static/blog/skelton.css');
requestStats.parse(function(requestResult) {
    describe('Remote Pattern StyleStats!', function(done) {
        it('should returns file size', function() {
            assert.equal(requestResult.size, 0);
            done();
        });
    });
});

var dirStats = new StyleStats('test/fixture/');
dirStats.parse(function(dirResult) {
    describe('Glob Pattern StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(dirResult.size, 20462);
        });
    });
});

var globStats = new StyleStats('test/**/*.css');
globStats.parse(function(globResult) {
    describe('Glob Pattern StyleStats!', function() {
        it('should returns file size', function() {
            assert.equal(globResult.size, 20462);
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