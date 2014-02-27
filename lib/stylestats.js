/*
 * stylestats
 * https://github.com//stylestats
 *
 * Copyright (c) 2014
 * Licensed under the MIT license.
 */

'use strict';

// var program = require('commander');
var _ = require('underscore');
var fs = require('fs');
var zlib = require('zlib-browserify');
var bytes = require('bytes');
var parse = require('css-parse');


var stylestats = {
    size: function(src) {
        var fileSize = fs.statSync(src).size;
        return bytes(fileSize);
    },
    gzipSize: function(src) {
        var fileSize = zlib.gzipSync(fs.readFileSync(src)).length;
        return bytes(fileSize);
    },
    rules: function(src) {
        var strings = fs.readFileSync(src, {
            encoding: "utf-8"
        });
        var rules = parse(strings).stylesheet.rules;
        return rules.length;
    },
    selectors: function(src) {
        var strings = fs.readFileSync(src, {
            encoding: "utf-8"
        });
        var rules = parse(strings).stylesheet.rules;

        var count = 0;
        rules.forEach(function(elem, i, arr) {
            if (elem.selectors !== undefined) {
                count += elem.selectors.length;
            }
        });
        return count;
    },
    totalFontSize: function(src) {
        var strings = fs.readFileSync(src, {
            encoding: "utf-8"
        });
        var rules = parse(strings).stylesheet.rules;

        var size = [];

        rules.forEach(function(elem) {
            if (elem.declarations !== undefined) {
                elem.declarations.forEach(function(props) {
                    if (props.property.indexOf('font') > -1) {
                        size.push(props.value);
                    }
                });
            }
        });
        return _.unique(size).length;
    },
    uniqueFontSize: function(src) {
        var strings = fs.readFileSync(src, {
            encoding: "utf-8"
        });
        var rules = parse(strings).stylesheet.rules;

        var size = [];

        rules.forEach(function(elem) {
            if (elem.declarations !== undefined) {
                elem.declarations.forEach(function(props) {
                    if (props.property.indexOf('font') > -1) {
                        size.push(props.value);
                    }
                });
            }
        });
        size = _.unique(size);
        size = _.sortBy(size, function(item) {
            return item.replace(/[^0-9\.]/g, '') - 0;
        });
        return size;
    },
    propertiesRank: function(src) {
        var strings = fs.readFileSync(src, {
            encoding: "utf-8"
        });
        var rules = parse(strings).stylesheet.rules;
        var propMap = {};

        rules.forEach(function(elem) {
            if (elem.declarations !== undefined) {
                elem.declarations.forEach(function(props) {

                    if (propMap[props.property]) {
                        propMap[props.property] += 1;
                    } else {
                        propMap[props.property] = 1;
                    }
                });
            }
        });

        return console.log(propMap);
    }
};

console.log('=============================================');
console.log('Size: ' + stylestats.size('test/fixture/test.css'));
console.log('Gzipped size: ' + stylestats.gzipSize('test/fixture/test.css'));
console.log('Rules: ' + stylestats.rules('test/fixture/test.css'));
console.log('Selectors: ' + stylestats.selectors('test/fixture/test.css'));
console.log('Total Unique Font Sizes: ' + stylestats.totalFontSize('test/fixture/test.css'));
console.log('Unique Font Size: ' + stylestats.uniqueFontSize('test/fixture/test.css'));
console.log('Properties Ranking: ' + stylestats.propertiesRank('test/fixture/app.css'));
console.log('=============================================');

module.exports = stylestats;