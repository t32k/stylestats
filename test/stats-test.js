var assert = require('assert');
var StyleStats = require('../lib/stylestats.js');

describe('CSS Statistics', function() {
    var stats = new StyleStats('test/fixture/test.css');
    var statsResult;
    before(function(done) {
        stats.parse(function(result) {
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
        customStats.parse(function(customResult) {
            assert.equal(customResult.gzippedSize, 217);
            done();
        });
    });
});

describe('Invalid argument', function() {
    it('should throw erroe', function(done) {
        assert.throws(
            function() {
                new StyleStats('xxxxxxxxxxxxxxxx');
            },
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
        customObjectStats.parse(function(customObjectResult) {
            assert.equal(customObjectResult.gzippedSize, 217);
            done();
        });
    });
});


describe('Analyze remote css file', function() {
    it('should return file size', function(done) {
        var requestStats = new StyleStats('http://t32k.me/static/blog/skelton.css?query');
        requestStats.parse(function(requestResult) {
            assert.equal(requestResult.size, 15419);
            done();
        });
    });
});

describe('Analyze HTML pages', function() {
    it('should return the number of stylesheets', function(done) {
        var htmlStats = new StyleStats('http://t32k.me/');
        htmlStats.parse(function(htmlResult) {
            assert.equal(htmlResult.size, 15419);
            done();
        });
    });
});

describe('Analyze files of specified directory', function() {
    it('should return file size', function(done) {
        var dirStats = new StyleStats('test/fixture/');
        dirStats.parse(function(dirResult) {
            assert.equal(dirResult.size, 20462);
            done();
        });
    });
});

describe('Analyze files which match specified glob', function() {
    it('should return file size', function(done) {
        var globStats = new StyleStats('test/**/*.css');
        globStats.parse(function(globResult) {
            assert.equal(globResult.size, 39931);
            done();
        });
    });
});

describe('Analyze multiple files', function() {
    it('should return the number of stylesheets', function(done) {
        var multipleStats = new StyleStats(['test/fixture/test.css', 'test/fixture/app.css']);
        multipleStats.parse(function(multipleResult) {
            assert.equal(multipleResult.stylesheets, 2);
            done();
        });
    });
});

describe('Analyze raw contents files', function() {
    it('should return the number of stylesheets', function(done) {
        var rawStats = new StyleStats('body{color:green}');
        rawStats.parse(function(rawResult) {
            assert.equal(rawResult.stylesheets, 0);
            done();
        });
    });
    it('should return file size', function(done) {
        var rawStats = new StyleStats('body{color:green}');
        rawStats.parse(function(rawResult) {
            assert.equal(rawResult.size, 17);
            done();
        });
    });
});


describe('Analyze LESS files', function() {
    it('should return file size', function(done) {
        var lessStats = new StyleStats('test/fixture/prepros/foo.less');
        lessStats.parse(function(lessResult) {
            assert.equal(lessResult.size, 499);
            done();
        });
    });
});

describe('Analyze Stylus files', function() {
    it('should return file size', function(done) {
        var stylStats = new StyleStats('test/fixture/prepros/foo.styl');
        stylStats.parse(function(stylResult) {
            assert.equal(stylResult.size, 259);
            done();
        });
    });
});