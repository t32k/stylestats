var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

var stats = new StyleStats('test/fixture/test.css');
var result = stats.parse();

var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
var customResult = customStats.parse();

describe('StyleStats!.', function() {
    it('should returns file size.', function() {
        assert.equal(result.size, 498);
    });
    it('should returns css rules.', function() {
        assert.equal(result.rules, 7);
    });
    it('should returns css selectors.', function() {
        assert.equal(result.selectors, 11);
    });
    it('should returns simplicity.', function() {
        assert.equal(result.simplicity, 0.6363636363636364);
    });
    it('should returns file lowestCohesion.', function() {
        assert.equal(result.lowestCohesion, 6);
    });
    it('should returns file lowestCohesionSelector.', function() {
        assert.equal(result.lowestCohesionSelector, 'hr');
    });
    it('should returns file totalUniqueFontSizes.', function() {
        assert.equal(result.totalUniqueFontSizes, 5);
    });
    it('should returns file totalUniqueColors.', function() {
        assert.equal(result.totalUniqueColors, 2);
    });
    it('should returns file idSelectors.', function() {
        assert.equal(result.idSelectors, 1);
    });
    it('should returns file universalSelectors.', function() {
        assert.equal(result.universalSelectors, 0);
    });
    it('should returns file importantKeywords.', function() {
        assert.equal(result.importantKeywords, 1);
    });
    it('should returns file mediaQueries".', function() {
        assert.equal(result.mediaQueries, 1);
    });
});

describe('Custom StyleStats!', function() {
    it('should returns gzippedSize.', function() {
        assert.equal(customResult.gzippedSize, 155);
    });
});