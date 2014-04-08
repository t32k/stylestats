var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

describe('CSS Statistics', function() {
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
    it('should return stylesheets', function() {
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
    it('should return most identifier', function() {
        assert.equal(statsResult.mostIdentifier, 5);
    });
    it('should return most identifier selector', function() {
        assert.equal(statsResult.mostIdentifierSelector, '.foo  .bar > .baz + .qux ~ .quux:before');
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

describe('Customize with configuration file', function() {
    it('should return gzipped size', function(done) {
        var customStats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
        customStats.parse(function(error, customResult) {
            if (error) {
                throw error;
            }
            assert.equal(customResult.gzippedSize, 217);
            done();
        });
    });
});

describe('Invalid configuration file', function() {
    it('should throw error', function(done) {
        assert.throws(
            function() {
                new StyleStats('test/fixture/test.css', 'test/fixture/.invalidrc');
            },
            Error
        );
        done();
    });
});

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

describe('Invalid CSS', function() {
    it('should throw error', function(done) {
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
});

describe('Invalid JSON', function() {
    it('should throw error', function(done) {
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
});



describe('Customize with option', function() {
    it('should return gzipped size', function(done) {
        var customObjectStats = new StyleStats('test/fixture/test.css', {
            gzippedSize: true
        });
        customObjectStats.parse(function(error, customObjectResult) {
            if (error) {
                throw error;
            }
            assert.equal(customObjectResult.gzippedSize, 217);
            done();
        });
    });
});

describe('Analyze remote css file', function() {
    it('should return file size', function(done) {
        var requestStats = new StyleStats('http://t32k.me/static/blog/skelton.css?query');
        requestStats.parse(function(error, requestResult) {
            if (error) {
                throw error;
            }
            assert.equal(requestResult.size, 15419);
            done();
        });
    });
});

describe('Analyze HTML pages', function() {
    it('should return the number of stylesheets', function(done) {
        var htmlStats = new StyleStats('http://t32k.me/');
        htmlStats.parse(function(error, htmlResult) {
            if (error) {
                throw error;
            }
            assert.equal(htmlResult.styleElements, 1);
            done();
        });

    });
});

describe('Analyze files of specified directory', function() {
    it('should return file size', function(done) {
        var dirStats = new StyleStats('test/fixture/');
        dirStats.parse(function(error, dirResult) {
            if (error) {
                throw error;
            }
            assert.equal(dirResult.size, 20462);
            done();
        });
    });
});

describe('Analyze files which match specified glob', function() {
    it('should return file size', function(done) {
        var globStats = new StyleStats('test/**/*.css');
        globStats.parse(function(error, globResult) {
            if (error) {
                throw error;
            }
            assert.equal(globResult.size, 39931);
            done();
        });
    });
});

describe('Analyze multiple files', function() {
    it('should return the number of stylesheets', function(done) {
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

describe('Analyze raw contents files', function() {
    it('should return the number of stylesheets', function(done) {
        var rawStats = new StyleStats('body{color:green}');
        rawStats.parse(function(error, rawResult) {
            if (error) {
                throw error;
            }
            assert.equal(rawResult.stylesheets, 0);
            done();
        });
    });
    it('should return file size', function(done) {
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


describe('Analyze LESS files', function() {
    it('should return file size', function(done) {
        var lessStats = new StyleStats('test/fixture/prepros/foo.less');
        lessStats.parse(function(error, lessResult) {
            if (error) {
                throw error;
            }
            assert.equal(lessResult.size, 499);
            done();
        });
    });
});

describe('Analyze Stylus files', function() {
    it('should return file size', function(done) {
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