var fs = require('fs');
var assert = require('assert');
var util = require('../lib/util.js');
var prettify = require('../lib/prettify.js');

describe('Utility functions', function () {

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
  var json = fs.readFileSync('test/fixture/result.json', {
    encoding: 'utf8'
  });
  var data = prettify(JSON.parse(json));
  describe('prettify()', function () {
    it('should return "Style Sheets" key and value', function () {
      assert.deepEqual(data[0], {'Style Sheets': 2});
    });
    it('should return "Gzipped Size" key and value', function () {
      assert.deepEqual(data[3], {'Gzipped Size': '2.0KB'});
    });
    it('should return "Simplicity" key and value', function () {
      assert.deepEqual(data[6], {Simplicity: '49.2%'});
    });
    it('should return "Unique Colors" key and value', function () {
      assert.deepEqual(data[18], {'Unique Colors': '#0FA0CE\n#1EAEDB\n#222222\n#333333\n#555555\n#FFFFFF'});
    });
    it('should return "Properties Count" key and value', function () {
      assert.deepEqual(data[25], {'Properties Count': 'width: 20\nmargin-left: 18\nfont-size: 17\nline-height: 9\npadding: 9\nmargin-bottom: 8\nletter-spacing: 7\ncolor: 7\nbox-sizing: 6\ndisplay: 6'});
    });
  });
});
