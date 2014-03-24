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

var util = require('./util');
var Parser = require('./parser');
var Analyzer = require('./analyzer');

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
    var that = this;

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
    
    this.parser = new Parser(this.urls, this.files);

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
 * Parse css
 * @param {Function} callback
 */
StyleStats.prototype.parse = function(callback) {
    var that = this;
    this.parser.parse(function (error, data) {
        if (error) {
            throw error;
        }
        var analyzer = new Analyzer(
            data.rules,
            data.selectors,
            data.declarations,
            data.cssString,
            data.cssSize,
            that.options
        );
        var analyzeData = analyzer.analyze();
        
        var stats = {};
        stats.published = new Date();
        stats.paths = [];
        Array.prototype.push.apply(stats.paths, that.files);
        Array.prototype.push.apply(stats.paths, that.urls);
        if (that.options.stylesheets) {
            stats.stylesheets = that.files.length + that.urls.length;
        }
        _.extend(stats, analyzeData);
        if (that.options.mediaQueries) {
            stats.mediaQueries = data.mediaQueries;
        }
        callback(stats);
    });
};

module.exports = StyleStats;