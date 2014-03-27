var _ = require('underscore');
var fs = require('fs');
var url = require('url');
var path = require('path');
var Promise = require('promise');
var request = require('request');
var cheerio = require('cheerio');
var cssParse = require('css-parse');

var util = require('./util');

/**
 * Get promised request
 * @param {String} url
 * @returns {Promise}
 */
function requestSync(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, response) {
            if (!error && response.statusCode === 200) {
                resolve(response);
            } else if (!error) {
                reject('Status code is ' + response.statusCode);
            } else {
                reject(error);
            }
        });
    });
}

/**
 * Parser class
 * @param {Array} urls
 * @param {Array} files
 * @param {Array} styles
 * @constructor
 */
function Parser(urls, files, styles) {
    this.urls = urls;
    this.files = files;
    this.styles = styles;

    this.cssFiles = [];
    this.sassFiles = [];
    this.lessFiles = [];
    this.stylusFiles = [];

    this.files.forEach(function(file) {
        var extname = path.extname(file);
        switch (extname) {
            case '.css':
                this.cssFiles.push(file);
                break;
            case '.less':
                this.lessFiles.push(file);
                break;
            case '.styl':
            case '.stylus':
                this.stylusFiles.push(file);
                break;
        }
    }, this);
}

/**
 * Parse css data
 * @param {Function} callback
 */
Parser.prototype.parse = function(callback) {

    // object to return
    var result = {
        cssString: '',
        cssSize: 0,
        styleElements: 0,
        mediaQueries: 0,
        cssFiles: 0,
        rules: [],
        selectors: [],
        declarations: []
    };

    var that = this;

    // remote file requests
    var requestPromises = [];
    this.urls.forEach(function(url) {
        requestPromises.push(requestSync(url));
    });

    // css string array from arguments
    // they will be joined into css string
    this.cssFiles.forEach(function(cssFile) {
        // push local css data
        that.styles.push(fs.readFileSync(cssFile, {
            encoding: 'utf8'
        }));
    });
    // LESS compile
    if (this.lessFiles.length !== 0) {
        var less = require('less');
        this.lessFiles.forEach(function(lessFile) {
            var parser = new(less.Parser)({
                filename: lessFile
            });
            var promise = new Promise(function(resolve, reject) {
                var string = fs.readFileSync(lessFile, 'utf8');
                parser.parse(string, function(error, tree) {
                    if (error) {
                        reject(error);
                    }
                    resolve(tree.toCSS());
                });
            });
            requestPromises.push(promise);
        });
    }
    // Stylus compile
    if (this.stylusFiles.length !== 0) {
        var stylus = require('stylus');
        this.stylusFiles.forEach(function(stylusFile) {
            var promise = new Promise(function(resolve, reject) {
                var string = fs.readFileSync(stylusFile, 'utf8');
                stylus(string)
                    .set('filename', stylusFile)
                    .render(function(error, css) {
                        if (error) {
                            reject(error);
                        }
                        resolve(css);
                    });
            });
            requestPromises.push(promise);
        });
    }

    // get remote files
    Promise.all(requestPromises).then(function onFulfilled(results) {

        // requests to stylesheet defined in html
        var requestPromisesInner = [];

        results.forEach(function(result) {
            if (util.isCSS(result)) {
                that.styles.push(result);
            } else {
                // push remote css data
                var type = result.headers['content-type'];
                if (type.indexOf('html') > -1) {
                    // parse result body
                    var $ = cheerio.load(result.body);
                    var $link = $('link[rel=stylesheet]');
                    var $style = $('style');

                    // add css file count
                    result.cssFiles += $link.length;
                    result.styleElements += $style.length;

                    // request link[href]
                    $link.each(function() {
                        var relPath = $(this).attr('href');
                        var absPath = url.resolve(result.request.href, relPath);
                        requestPromisesInner.push(requestSync(absPath));
                    });

                    // add text in style tags
                    $style.each(function() {
                        that.styles.push($(this).text());
                    });
                } else if (type.indexOf('css') > -1) {
                    that.styles.push(result.body);
                } else {
                    throw new Error('Content type is not HTML or CSS!');
                }
            }
        });

        if (requestPromisesInner.length > 0) {
            return Promise.all(requestPromisesInner);
        } else {
            return true;
        }
    }).done(function onFulfilled(results) {
        if (Array.isArray(results)) {
            results.forEach(function(result) {
                that.styles.push(result.body);
            });
        }

        // join all css string
        result.cssString = that.styles.join('');
        result.cssSize = Buffer.byteLength(result.cssString, 'utf8');

        // parse css string
        var rawRules = [];

        try {
            rawRules = cssParse(result.cssString).stylesheet.rules;
        } catch (error) {
            throw error;
        }

        // add rules into result
        rawRules.forEach(function(rule) {
            if (rule.type === 'rule') {
                result.rules.push(rule);
            } else if (rule.type === 'media') {
                result.mediaQueries += 1;
                rule.rules.forEach(function(rule) {
                    if (rule.type === 'rule') {
                        result.rules.push(rule);
                    }
                });
            }
        });

        // add selectors and declarations into result
        result.rules.forEach(function(rule) {
            rule.selectors.forEach(function(selector) {
                result.selectors.push(selector);
            });
            rule.declarations.forEach(function(declaration) {
                if (declaration.type === 'declaration') {
                    result.declarations.push(declaration);
                }
            });
        });
        if (_.isFunction(callback)) {
            callback(null, result);
        }
    }, function onRejected(error) {
        if (_.isFunction(callback)) {
            callback(error, null);
        }
    });
};

// export
module.exports = Parser;