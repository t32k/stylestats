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
var zlib = require('zlib-browserify');
var cssparse = require('css-parse');

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

function _isFile() {
    var file = path.join.apply(path, arguments);
    return fs.existsSync(file) && fs.statSync(file).isFile();
}

function _isDirectory() {
    var dir = path.join.apply(path, arguments);
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

function StyleStats(filePath) {
    if (!_isFile(filePath) && path.extname(filePath) !== '.css') {
        throw new Error(filePath + ' is not css file.')
    }
    this.cssPath = filePath;
    this.cssString = fs.readFileSync(filePath, {
        encoding: "utf-8"
    });
    this.rules = cssparse(this.cssString).stylesheet.rules;
}

StyleStats.prototype.getSize = function() {
    return fs.statSync(this.cssPath).size;
};

StyleStats.prototype.getGzippedSize = function() {
    return zlib.gzipSync(this.cssString).length;
};

StyleStats.prototype.getRulesCount = function() {
    return this.rules.length;
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

StyleStats.prototype.getUniqueFont = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.property.indexOf('font-size') > -1) {
                    array.push(_.trim(declaration.value, '!important'));
                }
            });
        }
    });
    return _.unique(array);
};

StyleStats.prototype.getUniqueColor = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.property.indexOf('color') > -1) {
                    var color = declaration.value.replace(/!important/, '');
                    color = color.toUpperCase();
                    array.push(color);
                }
            });
        }
    });
    return _.unique(array);
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

StyleStats.prototype.parse = function() {

    // Sort font size.
    var uniqueFont = this.getUniqueFont();
    var uniqueFontSize = _.sortBy(uniqueFont.slice(), function(item) {
        return item.replace(/[^0-9\.]/g, '') - 0;
    });

    // Sort color.
    var uniqueColor = _.sortBy(this.getUniqueColor());

    // Sort property count.
    var properties = this.getProperty();
    var propertiesCount = [];
    Object.keys(properties).forEach(function(key) {
        propertiesCount.push([key, properties[key]])
    });
    propertiesCount.sort(function(a, b) {
        return b[1] - a[1]
    })


    var rules = this.getRulesCount();
    var selectors = this.getSelectorCount();

    return {
        size: this.getSize(),
        gzippedSize: this.getGzippedSize(),
        simplicity: rules / selectors,
        rules: rules,
        selectors: selectors,
        totalUniqueFontSizes: uniqueFont.length,
        uniqueFontSize: uniqueFontSize,
        totalUniqueColors: uniqueColor.length,
        uniqueColor: uniqueColor,
        // propertiesCount: propertiesCount
    };
};

module.exports = StyleStats;