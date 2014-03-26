var _ = require('underscore');
var fs = require('fs');
var url = require('url');
var Promise = require('promise');
var request = require('request');
var cheerio = require('cheerio');
var cssParse = require('css-parse');

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
 * @param {Array} htmls
 * @constructor
 */
function Parser(urls, files, styles, htmls) {
    this.urls = urls;
    this.files = files;
    this.styles = styles;
    this.htmls = htmls;
}

/**
 * Add css string
 * @param {String} style
 */
Parser.prototype.addString = function(style) {
    this.styles.push(style);
};

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
    this.files.forEach(function(file) {
        // push local css data
        that.styles.push(fs.readFileSync(file, {
            encoding: 'utf8'
        }));
    });

    // get remote files
    Promise.all(requestPromises).then(function onFulfilled(responses) {
        var secondPromises = [];

        // push remote css data
        responses.forEach(function(response) {
            if (response.headers['content-type'].indexOf('html') > -1) {
                var $ = cheerio.load(response.body);
                result.cssFiles += $('link').length;
                $('link[rel=stylesheet]').each(function() {
                    var relPath = $(this).attr('href');
                    var absPath = url.resolve(response.request.href, relPath);
                    secondPromises.push(requestSync(absPath));
                });
                result.styleElements += $('style').length;
                $('style').each(function() {
                    that.styles.push($(this).text());
                });
            } else if (response.headers['content-type'].indexOf('css') > -1) {
                that.styles.push(response.body);
            } else {
                throw new Error('Content type is not HTML or CSS!');
            }
        });

        if (secondPromises.length > 0) {
            return Promise.all(secondPromises);
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