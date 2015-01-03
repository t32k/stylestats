var assert = require('assert');
var util = require('../lib/util.js');

describe('Utility functions', function() {
  it('should return false', function() {
    var result = util.isFile('test/fixture/not_exist.css');
    assert.equal(result, false);
  });
  it('should return false', function() {
    var result = util.isDirectory('test/fixture/not_exist/');
    assert.equal(result, false);
  });
  it('should return false', function() {
    var result = util.isCSS('not.css');
    assert.equal(result, false);
  });
});
