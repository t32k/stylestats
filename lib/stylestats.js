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
var async = require('async');
var request = require('request');
var gzipSize = require('gzip-size');
var cssParse = require('css-parse');

// Utility functions.
function _isFile() {
    try {
        var file = path.join.apply(path, arguments);
        return fs.existsSync(file) && fs.statSync(file).isFile();
    } catch (e) {
        return false;
    }
}

function _isDirectory() {
    try {
        var dir = path.join.apply(path, arguments);
        return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    } catch (e) {
        return false;
    }
}

// Constructor function.
function StyleStats(args, config) {

    var that = this;
    var URL = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;

    args = Array.isArray(args) ? args : [args];

    this.urls = [];
    this.files = [];
    args.forEach(function(arg) {
        if (_isFile(arg) && path.extname === '.css') {
            files.push(arg);
        } else if (_isDirectory(arg)) {
            fs.readdirSync(arg).filter(function(file) {
                return (path.extname(file) === '.css');
            }).forEach(function(file) {
                that.files.push(file);
            });
        } else if (URL.test(arg) && path.extname(arg) === '.css') {
            that.urls.push(arg);
        } else {
            glob.sync(arg).filter(function(file) {
                return (path.extname(file) === '.css');
            }).forEach(function(file) {
                that.files.push(file);
            });
        }
    });

    this.stylesheets = this.files.length + this.urls.length;
    this.cssString = '';
    this.cssArray = [];

    var defaultOptions = require('./defaultOptions');
    var customOptions = {};
    if (config && _isFile(config)) {
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
    this.options = _.extend(defaultOptions, customOptions);
}

StyleStats.prototype.getGzippedSize = function() {
    return gzipSize.sync(this.cssString);
};

StyleStats.prototype.getPureRules = function() {
    return _.filter(this.rules, function(rule) {
        return rule.type === 'rule' || rule.type === 'media';
    });
};

StyleStats.prototype.getSelectorCount = function() {
    var count = 0;
    this.rules.forEach(function(rule) {
        if (Array.isArray(rule.selectors)) {
            count += rule.selectors.length;
        }
    });
    return count;
};

StyleStats.prototype.getUniversalSelector = function() {
    var count = 0;
    this.rules.forEach(function(rule) {
        if (Array.isArray(rule.selectors)) {
            rule.selectors.forEach(function(selector) {
                if (selector.indexOf('*') > -1) {
                    count += 1;
                }
            });
        }
    });
    return count;
};

StyleStats.prototype.getUniqueFont = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.property !== undefined) {
                    if (declaration.property.indexOf('font-size') > -1) {
                        array.push(declaration.value.replace(/\!important/, '').trim());
                    }
                }
            });
        }
    });
    return _.uniq(array);
};

StyleStats.prototype.getUniqueColor = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.property !== undefined) {
                    if (declaration.property.indexOf('color') > -1) {
                        var color = declaration.value.replace(/\!important/, '');
                        color = color.toUpperCase().trim();
                        array.push(color);
                    }
                }
            });
        }
    });
    array = _.without(array, 'TRANSPARENT')
    return _.uniq(array);
};

StyleStats.prototype.getDeclarationCount = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            array.push({
                selector: rule.selectors,
                count: rule.declarations.length
            });
        }
    });
    return array;
};

StyleStats.prototype.getIdSelectors = function() {
    var count = 0;
    this.rules.forEach(function(rule) {
        if (rule.selectors !== undefined) {
            rule.selectors.forEach(function(selector) {
                if (selector.indexOf('#') > -1) {
                    count += 1;
                }
            });
        }
    });
    return count;
};

StyleStats.prototype.getImportantKeywords = function() {
    var count = 0;
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.value !== undefined) {
                    if (declaration.value.indexOf('!important') > -1) {
                        count += 1;
                    }
                }
            });
        }
    });
    return count;
};

StyleStats.prototype.getMediaQueries = function() {
    var count = 0;
    this.rules.forEach(function(rule) {
        if (rule.type.indexOf('media') > -1) {
            count += 1;
        }
    });
    return count;
};

StyleStats.prototype.getProperty = function() {
    var propMap = {};
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (propMap[declaration.property]) {
                    propMap[declaration.property] += 1;
                } else {
                    propMap[declaration.property] = 1;
                }
            });
        }
    });
    return propMap;
};

// Return object parsed result.
StyleStats.prototype.parse = function(callback) {

    // for callback
    var that = this;
    this.parseCallback = _.isFunction(callback) ? callback : function() {};

    this.files.forEach(function(file) {
        that.cssArray.push(fs.readFileSync(file, {
            encoding: "utf-8"
        }));
    });

    async.eachSeries(this.urls, function iterator(url, next) {
        request.get(url, function(error, response, body) {
            if (error) {
                throw error;
            }
            if (response.statusCode !== 200) {
                throw new Error('Status code is ' + response.statusCode);
            }
            that.cssArray.push(body);
            next();
        });
    }, function() {
        that.cssString = that.cssArray.join('');
        that.cssSize = Buffer.byteLength(that.cssString, 'utf8');
        that.rules = cssParse(that.cssString).stylesheet.rules;

        var stats = {};
        var options = that.options;

        // Sort font size.
        var uniqueFont = that.getUniqueFont();
        var uniqueFontSize = _.sortBy(uniqueFont.slice(), function(item) {
            return item.replace(/[^0-9\.]/g, '') - 0;
        });

        // Sort color.
        var uniqueColor = _.sortBy(that.getUniqueColor());

        // Sort property count.
        var declarationCount = that.getDeclarationCount();
        declarationCount.sort(function(a, b) {
            return b.count - a.count;
        });

        if (options.stylesheets) {
            stats.stylesheets = that.stylesheets;
        }
        if (options.size) {
            stats.size = that.cssSize;
        }
        if (options.gzippedSize) {
            stats.gzippedSize = that.getGzippedSize();
        }
        if (options.rules) {
            stats.rules = that.getPureRules().length;
        }
        if (options.selectors) {
            stats.selectors = that.getSelectorCount();
        }
        if (options.rules && options.selectors && options.simplicity) {
            stats.simplicity = stats.rules / stats.selectors;
        }
        var lowestDefinition = declarationCount.shift();
        if (lowestDefinition && options.lowestCohesion) {
            stats.lowestCohesion = lowestDefinition.count;
        }
        if (lowestDefinition && options.lowestCohesionSelector) {
            stats.lowestCohesionSelector = lowestDefinition.selector;
        }
        if (options.totalUniqueFontSizes) {
            stats.totalUniqueFontSizes = uniqueFont.length;
        }
        if (options.uniqueFontSize) {
            stats.uniqueFontSize = uniqueFontSize;
        }
        if (options.totalUniqueColors) {
            stats.totalUniqueColors = uniqueColor.length;
        }
        if (options.uniqueColor) {
            stats.uniqueColor = uniqueColor;
        }
        if (options.idSelectors) {
            stats.idSelectors = that.getIdSelectors();
        }
        if (options.universalSelectors) {
            stats.universalSelectors = that.getUniversalSelector();
        }
        if (options.importantKeywords) {
            stats.importantKeywords = that.getImportantKeywords();
        }
        if (options.mediaQueries) {
            stats.mediaQueries = that.getMediaQueries();
        }
        if (options.propertiesCount) {
            var properties = that.getProperty();
            var propertiesCount = [];
            Object.keys(properties).forEach(function(key) {
                propertiesCount.push({
                    property: key,
                    count: properties[key]
                });
            });

            // sort by property count
            propertiesCount.sort(function(a, b) {
                return b.count - a.count;
            });

            stats.propertiesCount = propertiesCount.slice(0, options.propertiesCount);
        }

        that.parseCallback(stats);
    });
};

module.exports = StyleStats;