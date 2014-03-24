var fs = require('fs');

var _ = require('underscore');
var Promise = require('promise');
var cssParse = require('css-parse');
var request = require('request');

/**
 * get promised request
 * @param url
 * @returns {Promise}
 */
function requestSync(url) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(body);
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
 * @constructor
 */
function Parser(urls, files) {
    this.urls = urls;
    this.files = files;
}

/**
 * Parse css data
 * @param callback
 */
Parser.prototype.parse = function (callback) {
    var result = {
        cssString: '',
        cssSize: 0,
        mediaQueries: 0,
        rules: [],
        selectors: [],
        declarations: []
    };

    // remote file requests
    var requestPromises = [];
    this.urls.forEach(function(url) {
        requestPromises.push(requestSync(url));
    });

    // css string array from arguments
    // they will be joined into css string
    var styles = [];
    this.files.forEach(function(file) {
        // push local css data
        styles.push(fs.readFileSync(file, {
            encoding: "utf-8"
        }));
    });

    Promise.all(requestPromises).done(function onFulfilled(value) {
        // push remote css data
        styles.push(value.join(''));

        // join all css string
        result.cssString = styles.join('');
        result.cssSize = Buffer.byteLength(result.cssString, 'utf8');

        // parse css string
        var rawRules = cssParse(result.cssString).stylesheet.rules;
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

module.exports = Parser;