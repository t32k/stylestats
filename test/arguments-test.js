var fs = require('fs');
var path = require('path');
var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

describe('Constructor Test', function () {

  this.timeout(5000);

  describe('Invalid argument', function() {

    it('should throw error', function(done) {
      var invalidArgs = new StyleStats('xxxxxxxxxxxx');
      invalidArgs.parse()
        .then(function(invalidArgsResult) {
          done();
        })
        .catch(function(error) {
          assert.throws(function() {
            throw error;
          }, Error);
          done();
        });
    });

  });

  describe('Customize with option', function() {

    it('should return gzipped size if configuration file is specified', function(done) {
      var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
      customStats.parse()
        .then(function(customResult) {
          assert.equal(customResult.gzippedSize, 429);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });

    it('should return User Specified Selectors if configuration file is specified', function(done) {
      var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
      customStats.parse()
        .then(function(customResult) {
          assert.equal(customResult.userSpecifiedSelectors, 1);
          done();
        })
        .catch(function(error) {
          throw error;
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
      customObjectStats.parse()
        .then(function(customObjectResult) {
          assert.equal(customObjectResult.gzippedSize, 429);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });
  });

  describe('URL', function() {

    it('should return file size if CSS URL is given', function(done) {
      var requestStats = new StyleStats('http://t32k.me/static/assets/css/main.css');
      requestStats.parse()
        .then(function(requestResult) {
          assert.equal(requestResult.size, 70);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });

    it('should throw error if CSS of specified URL is invalid', function(done) {
      var invalidCSS = new StyleStats('http://t32k.me/static/assets/css/invalid.css');
      invalidCSS.parse()
        .then(function(invalidCSSResult) {
          done();
        })
        .catch(function(error) {
          assert.throws(function() {
            throw error;
          }, Error);
          done();
        });
    });

    it('should throw error if invalid JSON URL is given', function(done) {
      var invalidJSON = new StyleStats('http://t32k.me/static/assets/json/foo.json');
      invalidJSON.parse()
        .then(function(invalidJSONResult) {
          done();
        })
        .catch(function(error) {
          assert.throws(function() {
            throw error;
          }, Error);
          done();
        });
    });

    it('should return the number of stylesheets if site URL is given', function(done) {
      var htmlStats = new StyleStats('https://t32k.me/');
      htmlStats.parse()
        .then(function(htmlResult) {
          assert.equal(htmlResult.stylesheets, 2);
          done();
        })
        .catch(function(error) {
          throw error;
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

      dirStats.parse()
        .then(function(dirResult) {
          assert.equal(dirResult.size, size);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });

    it('should return specified files size if glob is specified', function(done) {
      var globStats = new StyleStats('test/**/*.css');
      globStats.parse()
        .then(function(globResult) {
          assert.equal(globResult.size, 39931);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });

    it('should return the number of stylesheets if multiple files are specified', function(done) {
      var multipleStats = new StyleStats(['test/fixture/test.css', 'test/fixture/app.css']);
      multipleStats.parse()
        .then(function(multipleResult) {
          assert.equal(multipleResult.stylesheets, 2);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });
  });

  describe('CSS string', function() {

    it('should return 0 as the number of stylesheets', function(done) {
      var rawStats = new StyleStats('body{color:green}');
      rawStats.parse()
        .then(function(rawResult) {
          assert.equal(rawResult.stylesheets, 0);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });

    it('should return data size', function(done) {
      var rawStats = new StyleStats('body{color:green}');
      rawStats.parse()
        .then(function(rawResult) {
          assert.equal(rawResult.size, 17);
          done();
        })
        .catch(function(error) {
          throw error;
        });
    });
  });

});
