var fs = require('fs');
var path = require('path');
var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

describe('Constructor Test', function () {

  this.timeout(5000);

  describe('Invalid argument', function() {

    it('should throw error', function(done) {
      var invalidArgs = new StyleStats('xxxxxxxxxxxx');
      assert.throws(
        invalidArgs.parse(function(error, invalidArgsResult) {
          if (error) {
            throw error;
          }
        }),
        Error
      );
      done();
    });
  });

  describe('Customize with option', function() {

    it('should return gzipped size if configuration file is specified', function(done) {
      var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
      customStats.parse(function(error, customResult) {
        if (error) {
          throw error;
        }
        assert.equal(customResult.gzippedSize, 429);
        done();
      });
    });

    it('should return User Specified Selectors if configuration file is specified', function(done) {
      var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
      customStats.parse(function(error, customResult) {
        if (error) {
          throw error;
        }
        assert.equal(customResult.userSpecifiedSelectors, 1);
        done();
      });
    });


    it('should throw error if specified configuration file is invalid', function(done) {
      assert.throws(
        function() {
          new StyleStats('test/fixture/test.css', 'test/fixture/.invalidrc');
        },
        Error
      );
      done();
    });

    it('should return gzipped size if option object is given', function(done) {
      var customObjectStats = new StyleStats('test/fixture/test.css', {
        gzippedSize: true
      });
      customObjectStats.parse(function(error, customObjectResult) {
        if (error) {
          throw error;
        }
        assert.equal(customObjectResult.gzippedSize, 429);
        done();
      });
    });
  });

  describe('URL', function() {

    it('should return file size if CSS URL is given', function(done) {
      var requestStats = new StyleStats('http://t32k.me/static/assets/css/main.css');
      requestStats.parse(function(error, requestResult) {
        if (error) {
          throw error;
        }
        assert.equal(requestResult.size, 70);
        done();
      });
    });

    it('should throw error if CSS of specified URL is invalid', function(done) {
      var invalidCSS = new StyleStats('http://t32k.me/static/assets/css/invalid.css');
      assert.throws(
        invalidCSS.parse(function(error, invalidCSSResult) {
          if (error) {
            throw error;
          }
        }),
        Error
      );
      done();
    });

    it('should throw error if invalid JSON URL is given', function(done) {
      var invalidJSON = new StyleStats('http://t32k.me/static/assets/json/foo.json');
      assert.throws(
        invalidJSON.parse(function(error, invalidJSONResult) {
          if (error) {
            throw error;
          }
        }),
        Error
      );
      done();
    });

    it('should return the number of stylesheets if site URL is given', function(done) {
      var htmlStats = new StyleStats('http://t32k.me/');
      htmlStats.parse(function(error, htmlResult) {
        if (error) {
          throw error;
        }
        assert.equal(htmlResult.stylesheets, 2);
        done();
      });
    });
  });

  describe('File path', function() {
    it('should return file size', function(done) {
      var dirStats = new StyleStats('test/fixture/');
      var size = fs.readdirSync('test/fixture/').filter(function (file) {
        return path.extname(file) === '.css'
      }).map(function (file) {
        return fs.readFileSync('test/fixture/' + file).length;
      }).reduce(function (previous, current, index, array) {
        return previous + current;
      });

      dirStats.parse(function(error, dirResult) {
        if (error) {
          throw error;
        }
        assert.equal(dirResult.size, size);
        done();
      });
    });

    it('should return specified files size if glob is specified', function(done) {
      var globStats = new StyleStats('test/**/*.css');
      globStats.parse(function(error, globResult) {
        if (error) {
          throw error;
        }
        assert.equal(globResult.size, 39931);
        done();
      });
    });

    it('should return the number of stylesheets if multiple files are specified', function(done) {
      var multipleStats = new StyleStats(['test/fixture/test.css', 'test/fixture/app.css']);
      multipleStats.parse(function(error, multipleResult) {
        if (error) {
          throw error;
        }
        assert.equal(multipleResult.stylesheets, 2);
        done();
      });
    });
  });

  describe('CSS string', function() {

    it('should return 0 as the number of stylesheets', function(done) {
      var rawStats = new StyleStats('body{color:green}');
      rawStats.parse(function(error, rawResult) {
        if (error) {
          throw error;
        }
        assert.equal(rawResult.stylesheets, 0);
        done();
      });
    });

    it('should return data size', function(done) {
      var rawStats = new StyleStats('body{color:green}');
      rawStats.parse(function(error, rawResult) {
        if (error) {
          throw error;
        }
        assert.equal(rawResult.size, 17);
        done();
      });
    });
  });

  describe('Preprocessor files', function() {

    it('should return file size if LESS files are specified', function(done) {
      var lessStats = new StyleStats('test/fixture/prepros/foo.less');
      lessStats.parse(function(error, lessResult) {
        if (error) {
          throw error;
        }
        assert.equal(lessResult.size, 495);
        done();
      });
    });

    it('should return file size if Stylus files are specified', function(done) {
      var stylStats = new StyleStats('test/fixture/prepros/foo.styl');
      stylStats.parse(function(error, stylResult) {
        if (error) {
          throw error;
        }
        assert.equal(stylResult.size, 259);
        done();
      });
    });
  });
});
