var _ = require('underscore');
var fs = require('fs');
var Promise = require('promise');
var cssParse = require('css-parse');
var request = require('request');


/**
 * Get promised request
 * @param {String} url
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
function Parser(urls, files, styles) {
    this.urls = urls;
    this.files = files;
    this.styles = styles;
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
        mediaQueries: 0,
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
    Promise.all(requestPromises).done(function onFulfilled(value) {

        // push remote css data
        that.styles.push(value.join(''));

        // join all css string
        result.cssString = that.styles.join('');
        result.cssSize = Buffer.byteLength(result.cssString, 'utf8');

        // parse css string
        var rawRules = [];

        try {
            rawRules = cssParse(result.cssString).stylesheet.rules;
        } catch (e) {
            throw e;
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