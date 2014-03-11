var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

var stats = new StyleStats('test/fixture/test.css');
var result = stats.parse();

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

var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
var customResult = customStats.parse();

describe('Custom StyleStats!', function() {
    it('should returns gzipped size', function() {
        assert.equal(customResult.gzippedSize, 155);
    });
});

var stringStats = new StyleStats('html{color:red}');
var stringResult = stringStats.parse();
describe('String StyleStats!', function() {
    it('should returns file size', function() {
        assert.equal(stringResult.size, 15);
    });
});