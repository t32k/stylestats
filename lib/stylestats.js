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

function decreasingOrder(a, b) {
    return b.count - a.count;
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
            that.files.push(arg);
        } else if (_isDirectory(arg)) {
            fs.readdirSync(arg).filter(function(file) {
                return (path.extname(file) === '.css');
            }).forEach(function(file) {
                that.files.push(arg + file);
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
    this.styles = [];
    this.selectors = [];
    this.declarations = [];
    this.mediaQueries = 0;

    var defaultOptions = require('./defaultOptions.js');
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

StyleStats.prototype.parseSelectors = function() {
    var re = this.options.javascriptSpecificSelectors;
    var obj = {
        idSelectors: 0,
        universalSelectors: 0,
        unqualifiedAttributeSelectors: 0,
        javascriptSpecificSelectors: 0,
        identifiers: []
    };
    this.selectors.forEach(function(selector) {
        if (selector.indexOf('#') > -1) {
            obj.idSelectors += 1;
        }
        if (selector.indexOf('*') > -1) {
            obj.universalSelectors += 1;
        }
        if (selector.trim().match(/\[.+\]$/g)) {
            obj.unqualifiedAttributeSelectors += 1;
        }
        if (selector.trim().match(re)) {
            obj.javascriptSpecificSelectors += 1;
        }
        var trimedSelector = selector.replace(/\s?([\>|\+|\~])\s?/g, '$1');
        trimedSelector = trimedSelector.replace(/\s+/g, ' ');
        var count = trimedSelector.split(/\s|\>|\+|\~/).length;
        obj.identifiers.push({
            selector: selector,
            count: count
        });
    });
    obj.identifiers.sort(decreasingOrder);
    return obj;
};

StyleStats.prototype.parseDeclarations = function() {
    var obj = {
        dataUriSize: '',
        importantKeywords: 0,
        floatProperties: 0,
        uniqueFontSize: [],
        uniqueColor: [],
        properties: {}
    };
    this.declarations.forEach(function(declaration) {
        if (declaration.value.indexOf('data:image') > -1) {
            obj.dataUriSize += declaration.value.match(/data\:image\/[A-Za-z0-9;,\+\=\/]+/);
        }
        if (declaration.value.indexOf('!important') > -1) {
            obj.importantKeywords += 1;
        }
        if (declaration.property.indexOf('float') > -1) {
            obj.floatProperties += 1;
        }
        if (declaration.property.indexOf('font-size') > -1) {
            obj.uniqueFontSize.push(declaration.value.replace(/\!important/, '').trim());
        }
        if (declaration.property.match(/^color$/)) {
            var color = declaration.value.replace(/\!important/, '');
            color = color.toUpperCase().trim();
            obj.uniqueColor.push(color);
        }
        if (obj.properties[declaration.property]) {
            obj.properties[declaration.property] += 1;
        } else {
            obj.properties[declaration.property] = 1;
        }

    });
    // Return byte size.
    obj.dataUriSize = Buffer.byteLength(obj.dataUriSize, 'utf8');
    // Sort `font-size` property.
    obj.uniqueFontSize = _.sortBy(_.uniq(obj.uniqueFontSize).slice(), function(item) {
        return item.replace(/[^0-9\.]/g, '') - 0;
    });
    // Sort `color` property.
    obj.uniqueColor = _.sortBy(_.uniq(_.without(obj.uniqueColor, 'TRANSPARENT')));
    // Sort propertie count.
    var propertiesCount = [];
    Object.keys(obj.properties).forEach(function(key) {
        propertiesCount.push({
            property: key,
            count: obj.properties[key]
        });
    });
    obj.properties = propertiesCount.sort(decreasingOrder);
    return obj;
};

StyleStats.prototype.getDeclarationCount = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (Array.isArray(rule.declarations)) {
            array.push({
                selector: rule.selectors,
                count: rule.declarations.length
            });
        }
    });
    array.sort(decreasingOrder);
    return array;
};

// Return object parsed result.
StyleStats.prototype.parse = require('./parse.js');
module.exports = StyleStats;