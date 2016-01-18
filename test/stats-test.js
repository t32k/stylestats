var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

describe('CSS Statistics', function() {

  this.timeout(5000);

  var stats = new StyleStats('test/fixture/test.css');
  var statsResult;
  before(function(done) {
    stats.parse(function(error, result) {
      if (error) {
        throw error;
      }
      statsResult = result;
      done();
    });
  });
  it('should return stylesheets count', function() {
    assert.equal(statsResult.stylesheets, 1);
  });
  it('should return file size', function() {
    assert.equal(statsResult.size, 753);
  });
  it('should return data URI size', function() {
    assert.equal(statsResult.dataUriSize, 82);
  });
  it('should return ratio of data URI size', function() {
    assert.equal(statsResult.ratioOfDataUriSize, 0.10889774236387782);
  });
  it('should return css rules', function() {
    assert.equal(statsResult.rules, 10);
  });
  it('should return css selectors', function() {
    assert.equal(statsResult.selectors, 15);
  });
  it('should return simplicity', function() {
    assert.equal(statsResult.simplicity, 0.6666666666666666);
  });
  it('should return average of identifier', function() {
    assert.equal(statsResult.averageOfIdentifier, 1.4666666666666666);
  });
  it('should return most identifier', function() {
    assert.equal(statsResult.mostIdentifier, 6);
  });
  it('should return most identifier selector', function() {
    assert.equal(statsResult.mostIdentifierSelector, '.foo  .bar > .baz + .qux ~ .quux:before');
  });
  it('should return average of cohesion', function() {
    assert.equal(statsResult.averageOfCohesion, 2.4);
  });
  it('should return lowest cohesion', function() {
    assert.equal(statsResult.lowestCohesion, 8);
  });
  it('should return lowest cohesion selector', function() {
    assert.equal(statsResult.lowestCohesionSelector, 'hr');
  });
  it('should return total unique font sizes', function() {
    assert.equal(statsResult.totalUniqueFontSizes, 5);
  });
  it('should return total unique colors', function() {
    assert.equal(statsResult.totalUniqueColors, 2);
  });
  it('should return total unique font families', function() {
    assert.equal(statsResult.totalUniqueFontFamilies, 0);
  });
  it('should return total unique colors', function() {
    assert.equal(statsResult.totalUniqueColors, 2);
  });
  it('should return total unique background images', function() {
    assert.equal(statsResult.totalUniqueBackgroundImages, 1);
  });
  it('should return id selectors', function() {
    assert.equal(statsResult.idSelectors, 1);
  });
  it('should return universal selectors', function() {
    assert.equal(statsResult.universalSelectors, 1);
  });
  it('should return unqualified attribute selectors', function() {
    assert.equal(statsResult.unqualifiedAttributeSelectors, 1);
  });
  it('should return JavaScript specific selectors', function() {
    assert.equal(statsResult.javascriptSpecificSelectors, 1);
  });
  it('should return important keywords', function() {
    assert.equal(statsResult.importantKeywords, 1);
  });
  it('should return float properties', function() {
    assert.equal(statsResult.floatProperties, 1);
  });
  it('should return media queries"', function() {
    assert.equal(statsResult.mediaQueries, 1);
  });
});
