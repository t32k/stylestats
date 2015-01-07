var assert = require('assert');
var util = require('../lib/util.js');

describe('Utility functions', function() {

  describe('isFile()', function () {

    it('should return true if specified path is a file', function() {
      var result = util.isFile('test/fixture/app.css');
      assert.equal(result, true);
    });

    it('should return false if specified path is not a file', function() {
      var result = util.isFile('test/fixture/not_exist.css');
      assert.equal(result, false);
    });
  });

  describe('isDirectory()', function () {

    it('should return true if specified path is a directory', function() {
      var result = util.isDirectory('test/fixture/');
      assert.equal(result, true);
    });

    it('should return false if specified path is not a directory', function() {
      var result = util.isDirectory('test/fixture/not_exist/');
      assert.equal(result, false);
    });
  });

  describe('isCSS()', function () {

    it('should return true if specified path is CSS string', function() {
      var result = util.isCSS('.foo{}');
      assert.equal(result, true);
    });

    it('should return false if specified path is not CSS string', function() {
      var result = util.isCSS('.bar{');
      assert.equal(result, false);
    });
  });
});
