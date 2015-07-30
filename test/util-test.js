var fs = require('fs');
var assert = require('assert');
var util = require('../lib/util.js');
var prettify = require('../lib/prettify.js');

describe('Utility functions', function () {

  this.timeout(5000);

  describe('isFile()', function () {

    it('should return true if specified path is a file', function () {
      var result = util.isFile('test/fixture/app.css');
      assert.equal(result, true);
    });

    it('should return false if specified path is not a file', function () {
      var result = util.isFile('test/fixture/not_exist.css');
      assert.equal(result, false);
    });
  });

  describe('isDirectory()', function () {

    it('should return true if specified path is a directory', function () {
      var result = util.isDirectory('test/fixture/');
      assert.equal(result, true);
    });

    it('should return false if specified path is not a directory', function () {
      var result = util.isDirectory('test/fixture/not_exist/');
      assert.equal(result, false);
    });
  });

  describe('isCSS()', function () {

    it('should return true if specified path is CSS string', function () {
      var result = util.isCSS('.foo{}');
      assert.equal(result, true);
    });

    it('should return false if specified path is not CSS string', function () {
      var result = util.isCSS('.bar{');
      assert.equal(result, false);
    });
  });
});


describe('Unit tests', function () {

  this.timeout(5000);

  var json = fs.readFileSync('test/fixture/result.json', {
    encoding: 'utf8'
  });
  var data = prettify(JSON.parse(json));
  describe('prettify()', function () {
    it('should return "Style Sheets" value', function () {
      assert.equal(data['Style Sheets'], 2);
    });
    it('should return "Gzipped Size" value', function () {
      assert.equal(data['Gzipped Size'], '2.0KB');
    });
    it('should return "Simplicity" value', function () {
      assert.equal(data['Simplicity'], '49.2%');
    });
    it('should return "Unique Colors" value', function () {
      assert.equal(data['Unique Colors'], '#0FA0CE\n#1EAEDB\n#222222\n#333333\n#555555\n#FFFFFF');
    });
    it('should return "Properties Count" value', function () {
      assert.equal(data['Properties Count'], 'width: 20\nmargin-left: 18\nfont-size: 17\nline-height: 9\npadding: 9\nmargin-bottom: 8\nletter-spacing: 7\ncolor: 7\nbox-sizing: 6\ndisplay: 6');
    });
  });
});
