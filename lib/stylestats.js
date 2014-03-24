/*
 * stylestats
 * https://github.com/t32k/stylestats
 *
 * Copyright (c) 2014
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var glob = require('glob');
var gzipSize = require('gzip-size');
var request = require('request');
var Promise = require('promise');
var cssParse = require('css-parse');

var util = require('./util');

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
 * StyleStats class
 * @param args
 * @param config
 * @constructor
 */
function StyleStats(args, config) {

    var that = this;
    var URL = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

    args = Array.isArray(args) ? args : [args];

    this.urls = [];
    this.files = [];

    // check arguments which is url or file path or other
    args.forEach(function(arg) {
        if (util.isFile(arg) && path.extname === '.css') {
            that.files.push(arg);
        } else if (util.isDirectory(arg)) {
            fs.readdirSync(arg).filter(function(file) {
                return (path.extname(file) === '.css');
            }).forEach(function(file) {
                that.files.push(arg + file);
            });
        } else if (URL.test(arg) && path.extname(arg).indexOf('.css') > -1) {
            that.urls.push(arg);
        } else {
            glob.sync(arg).filter(function(file) {
                return (path.extname(file) === '.css');
            }).forEach(function(file) {
                that.files.push(file);
            });
        }
    });

    // all of css string
    this.cssString = '';

    // css string array from arguments
    // they will be joined into css string
    this.styles = [];

    // array of rule
    // referenced in analyzeRules
    this.rules = [];

    // array of css selector
    // referenced in analyzeSelectors
    this.selectors = [];

    // array of css declaration
    // referenced in analyzeDeclarations
    this.declarations = [];

    var defaultOptions = require('./default.json');
    var customOptions = {};
    if (config && util.isFile(config)) {
        var configString = fs.readFileSync(config, {
            encoding: "utf-8"
        });
        try {
            customOptions = JSON.parse(configString);
        } catch (e) {
            throw e;
        }
    } else if (_.isObject(config)) {
        customOptions = config;
    }
    this.options = _.extend({}, defaultOptions, customOptions);
}

/**
 * Analyze rules
 * @returns {
 *   {Array} cssDeclarations
 * }
 */
StyleStats.prototype.analyzeRules = function() {
    var result = {
        cssDeclarations: []
    };
    this.rules.forEach(function(rule) {
        if (Array.isArray(rule.declarations)) {
            result.cssDeclarations.push({
                selector: rule.selectors,
                count: rule.declarations.length
            });
        }
    });
    result.cssDeclarations.sort(function decreasingOrder(a, b) {
        return b.count - a.count;
    });
    return result;
};

/**
 * Analyze selectors
 * @returns {
 *   {Number} idSelectors,
 *   {Number} universalSelectors,
 *   {Number} unqualifiedAttributeSelectors,
 *   {Number} javascriptSpecificSelectors,
 *   {Array} identifiers
 * }
 */
StyleStats.prototype.analyzeSelectors = function() {
    var regexp = new RegExp(this.options.javascriptSpecificSelectors, 'g');
    var result = {
        idSelectors: 0,
        universalSelectors: 0,
        unqualifiedAttributeSelectors: 0,
        javascriptSpecificSelectors: 0,
        identifiers: []
    };
    this.selectors.forEach(function(selector) {
        if (selector.indexOf('#') > -1) {
            result.idSelectors += 1;
        }
        if (selector.indexOf('*') > -1) {
            result.universalSelectors += 1;
        }
        if (selector.trim().match(/\[.+\]$/g)) {
            result.unqualifiedAttributeSelectors += 1;
        }
        if (regexp.test(selector.trim())) {
            result.javascriptSpecificSelectors += 1;
        }
        var trimedSelector = selector.replace(/\s?([\>|\+|\~])\s?/g, '$1');
        trimedSelector = trimedSelector.replace(/\s+/g, ' ');
        var count = trimedSelector.split(/\s|\>|\+|\~/).length;
        result.identifiers.push({
            selector: selector,
            count: count
        });
    });
    result.identifiers.sort(function decreasingOrder(a, b) {
        return b.count - a.count;
    });
    return result;
};

/**
 * Analyze declarations
 * @returns {
 *   {String} dataUriSize,
 *   {Number} importantKeywords,
 *   {Number} floatProperties,
 *   {Array} uniqueFontSize,
 *   {Array} uniqueColor,
 *   {Object} properties
 * }
 */
StyleStats.prototype.analyzeDeclarations = function() {
    var result = {
        dataUriSize: '',
        importantKeywords: 0,
        floatProperties: 0,
        uniqueFontSize: [],
        uniqueColor: [],
        properties: {}
    };
    this.declarations.forEach(function(declaration) {
        if (declaration.value.indexOf('data:image') > -1) {
            result.dataUriSize += declaration.value.match(/data\:image\/[A-Za-z0-9;,\+\=\/]+/);
        }
        if (declaration.value.indexOf('!important') > -1) {
            result.importantKeywords += 1;
        }
        if (declaration.property.indexOf('float') > -1) {
            result.floatProperties += 1;
        }
        if (declaration.property.indexOf('font-size') > -1) {
            result.uniqueFontSize.push(declaration.value.replace(/\!important/, '').trim());
        }
        if (declaration.property.match(/^color$/)) {
            var color = declaration.value.replace(/\!important/, '');
            color = color.toUpperCase().trim();
            result.uniqueColor.push(color);
        }
        if (result.properties[declaration.property]) {
            result.properties[declaration.property] += 1;
        } else {
            result.properties[declaration.property] = 1;
        }

    });
    // Return byte size.
    result.dataUriSize = Buffer.byteLength(result.dataUriSize, 'utf8');
    // Sort `font-size` property.
    result.uniqueFontSize = _.sortBy(_.uniq(result.uniqueFontSize).slice(), function(item) {
        return item.replace(/[^0-9\.]/g, '') - 0;
    });
    // Sort `color` property.
    result.uniqueColor = _.sortBy(_.uniq(_.without(result.uniqueColor, 'TRANSPARENT')));
    // Sort propertie count.
    var propertiesCount = [];
    Object.keys(result.properties).forEach(function(key) {
        propertiesCount.push({
            property: key,
            count: result.properties[key]
        });
    });
    result.properties = propertiesCount.sort(function decreasingOrder(a, b) {
        return b.count - a.count;
    });
    return result;
};

/**
 * Analyze css from rules, selectors, declarations
 * @returns {
 *   {Number} stylesheets,
 *   {Number} size,
 *   {Number} dataUriSize,
 *   {Number} ratioOfDataUriSize,
 *   {Number} gzippedSize,
 *   {Number} rules,
 *   {Number} selectors,
 *   {Float} simplicity,
 *   {Number} mostIdentifier,
 *   {String} mostIdentifierSelector,
 *   {Number} lowestCohesion,
 *   {Number} lowestCohesionSelector,
 *   {Number} totalUniqueFontSizes,
 *   {String} uniqueFontSize,
 *   {Number} totalUniqueColors,
 *   {String} uniqueColor,
 *   {Number} idSelectors,
 *   {Number} universalSelectors,
 *   {Number} unqualifiedAttributeSelectors,
 *   {Number} javascriptSpecificSelectors,
 *   {Number} importantKeywords,
 *   {Number} floatProperties,
 *   {Number} mediaQueries,
 *   {Number} propertiesCount
 * }
 */
StyleStats.prototype.analyze = function () {

    var ruleAnalysis = this.analyzeRules();
    var selectorAnalysis = this.analyzeSelectors();
    var declarationAnalysis = this.analyzeDeclarations();

    var stats = {};
    stats.published = new Date();
    stats.paths = [];
    Array.prototype.push.apply(stats.paths, this.files);
    Array.prototype.push.apply(stats.paths, this.urls);

    if (this.options.stylesheets) {
        stats.stylesheets = this.files.length + this.urls.length;
    }
    if (this.options.size) {
        stats.size = this.cssSize;
    }
    if (this.options.dataUriSize) {
        stats.dataUriSize = declarationAnalysis.dataUriSize;
    }
    if (this.options.dataUriSize && this.options.ratioOfDataUriSize && declarationAnalysis.dataUriSize !== 0) {
        stats.ratioOfDataUriSize = declarationAnalysis.dataUriSize / this.cssSize;
    }
    if (this.options.gzippedSize) {
        stats.gzippedSize = gzipSize.sync(this.cssString);
    }
    if (this.options.rules) {
        stats.rules = this.rules.length;
    }
    if (this.options.selectors) {
        stats.selectors = this.selectors.length;
    }
    if (this.options.rules && this.options.selectors && this.options.simplicity) {
        stats.simplicity = stats.rules / stats.selectors;
    }
    // Most Identifier
    var mostIdentifier = selectorAnalysis.identifiers.shift();
    if (mostIdentifier && this.options.mostIdentifier) {
        stats.mostIdentifier = mostIdentifier.count;
    }
    if (mostIdentifier && this.options.mostIdentifierSelector) {
        stats.mostIdentifierSelector = mostIdentifier.selector;
    }
    var lowestDefinition = ruleAnalysis.cssDeclarations.shift();
    if (lowestDefinition && this.options.lowestCohesion) {
        stats.lowestCohesion = lowestDefinition.count;
    }
    if (lowestDefinition && this.options.lowestCohesionSelector) {
        stats.lowestCohesionSelector = lowestDefinition.selector;
    }
    if (this.options.totalUniqueFontSizes) {
        stats.totalUniqueFontSizes = declarationAnalysis.uniqueFontSize.length;
    }
    if (this.options.uniqueFontSize) {
        stats.uniqueFontSize = declarationAnalysis.uniqueFontSize;
    }
    if (this.options.totalUniqueColors) {
        stats.totalUniqueColors = declarationAnalysis.uniqueColor.length;
    }
    if (this.options.uniqueColor) {
        stats.uniqueColor = declarationAnalysis.uniqueColor;
    }
    if (this.options.idSelectors) {
        stats.idSelectors = selectorAnalysis.idSelectors;
    }
    if (this.options.universalSelectors) {
        stats.universalSelectors = selectorAnalysis.universalSelectors;
    }
    if (this.options.unqualifiedAttributeSelectors) {
        stats.unqualifiedAttributeSelectors = selectorAnalysis.unqualifiedAttributeSelectors;
    }
    if (this.options.javascriptSpecificSelectors) {
        stats.javascriptSpecificSelectors = selectorAnalysis.javascriptSpecificSelectors;
    }
    if (this.options.importantKeywords) {
        stats.importantKeywords = declarationAnalysis.importantKeywords;
    }
    if (this.options.floatProperties) {
        stats.floatProperties = declarationAnalysis.floatProperties;
    }
    if (this.options.mediaQueries) {
        stats.mediaQueries = this.mediaQueries;
    }
    if (this.options.propertiesCount) {
        stats.propertiesCount = declarationAnalysis.properties.slice(0, this.options.propertiesCount);
    }
    return stats;
};

/**
 * Parse css
 * @param {Function} callback
 */
StyleStats.prototype.parse = function(callback) {

    var that = this;
    var requestPromises = [];

    this.urls.forEach(function(url) {
        requestPromises.push(requestSync(url));
    });
    this.files.forEach(function(file) {
        that.styles.push(fs.readFileSync(file, {
            encoding: "utf-8"
        }));
    });

    Promise.all(requestPromises).done(function onFulfilled(value) {
        that.styles.push(value.join(''));
        that.cssString = that.styles.join('');
        that.cssSize = Buffer.byteLength(that.cssString, 'utf8');
        that.mediaQueries = 0;

        var rawRules = cssParse(that.cssString).stylesheet.rules;
        rawRules.forEach(function(rule) {
            if (rule.type === 'rule') {
                that.rules.push(rule);
            } else if (rule.type === 'media') {
                that.mediaQueries += 1;
                rule.rules.forEach(function(rule) {
                    if (rule.type === 'rule') {
                        that.rules.push(rule);
                    }
                });
            }
        });

        that.rules.forEach(function(rule) {
            rule.selectors.forEach(function(selector) {
                that.selectors.push(selector);
            });
            rule.declarations.forEach(function(declaration) {
                if (declaration.type === 'declaration') {
                    that.declarations.push(declaration);
                }
            });
        });
        
        var stats = that.analyze();

        if (_.isFunction(callback)) {
            callback(null, stats);
        }
    }, function onRejected(error) {
        if (_.isFunction(callback)) {
            callback(error, null);
        }
    });
};

module.exports = StyleStats;