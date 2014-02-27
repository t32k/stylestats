/*
 * stylestats
 * https://github.com//stylestats
 *
 * Copyright (c) 2014
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(filePath, options) {

    var _ = require('underscore');
    var fs = require('fs');
    var zlib = require('zlib-browserify');
    var bytes = require('bytes');
    var parse = require('css-parse');

    options = options || {};

    // return strings
    var str = fs.readFileSync(filePath, {
        encoding: "utf-8"
    });
    var rules = parse(str).stylesheet.rules;

    // File Size
    function size(filePath) {
        return fs.statSync(filePath).size;
    }

    // Gzipped File Size
    function gzippedSize() {
        return zlib.gzipSync(str).length;
    }

    // Rules
    function rulesSize() {
        return rules.length;
    }

    // Selectors
    function selectors() {
        var num = 0;
        rules.forEach(function(rule) {
            if (rule.selectors !== undefined) {
                num += rule.selectors.length;
            }
        });
        return num;
    }

    function getUniqueFontSizesArray() {
        var arry = [];
        rules.forEach(function(rule) {
            if (rule.declarations !== undefined) {
                rule.declarations.forEach(function(declaration) {
                    if (declaration.property.indexOf('font') > -1) {
                        arry.push(declaration.value);
                    }
                });
            }
        });
        arry = _.unique(arry);
        return arry;
    }

    function totalUniqueFontSizes() {
        var arry = getUniqueFontSizesArray();
        return arry.length;
    }

    function uniqueFontSize() {
        var arry = getUniqueFontSizesArray();

        arry = _.sortBy(arry, function(item) {
            return item.replace(/[^0-9\.]/g, '') - 0;
        });
        return arry;
    }

    function propertiesRank() {
        var propMap = {};
        rules.forEach(function(rule) {
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
        return console.log(propMap);
    }

    function styleStats() {
        return size();
    }

    return styleStats();
};