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
 * @param {Array} args
 * @param {String|Object} config
 * @constructor
 */
function StyleStats(args, config) {

  var that = this;
  var URL = /^(?:(?:ht|f)tp(?:s?)\:\/\/|~\/|\/)?(?:\w+:\w+@)?((?:(?:[-\w\d{1-3}]+\.)+(?:com|org|cat|coop|int|pro|tel|xxx|net|gov|mil|biz|info|mobi|name|aero|jobs|edu|co\.uk|ac\.uk|it|fr|tv|museum|asia|local|travel|[a-z]{2})?)|((\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)(\.(\b25[0-5]\b|\b[2][0-4][0-9]\b|\b[0-1]?[0-9]?[0-9]\b)){3}))(?::[\d]{1,5})?(?:(?:(?:\/(?:[-\w~!$+|.,=]|%[a-f\d]{2})+)+|\/)+|\?|#)?(?:(?:\?(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)(?:&(?:[-\w~!$+|.,*:]|%[a-f\d{2}])+=?(?:[-\w~!$+|.,*:=]|%[a-f\d]{2})*)*)*(?:#(?:[-\w~!$ |\/.,*:;=]|%[a-f\d]{2})*)?$/;

  args = Array.isArray(args) ? args : [args];

  this.urls = [];
  this.files = [];
  this.styles = [];

  var EXTENSIONS = ['.less', '.styl', '.stylus', '.css'];

  // check arguments which is url or file path or other
  args.forEach(function (arg) {
    if (util.isFile(arg) && EXTENSIONS.indexOf(path.extname(arg)) !== -1) {
      that.files.push(arg);
    } else if (util.isDirectory(arg)) {
      fs.readdirSync(arg).filter(function (file) {
        return (EXTENSIONS.indexOf(path.extname(file)) !== -1);
      }).forEach(function (file) {
        that.files.push(arg + file);
      });
    } else if (URL.test(arg) && path.extname(arg).indexOf('.css') !== -1) {
      that.urls.push(arg);
    } else if (URL.test(arg)) {
      that.urls.push(arg);
    } else if (util.isCSS(arg)) {
      that.styles.push(arg);
    } else {
      glob.sync(arg).filter(function (file) {
        return (path.extname(file) === '.css');
      }).forEach(function (file) {
        that.files.push(file);
      });
    }
  });

  var defaultOptions = require('../assets/default.json');
  var customOptions = {};
  if (config && util.isFile(config)) {
    var configString = fs.readFileSync(config, {
      encoding: 'utf8'
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
  this.parser = new Parser(this.urls, this.files, this.styles, this.options);
}

/**
 * Parse css
 * @param {Function} callback
 */
StyleStats.prototype.parse = function (callback) {
  var that = this;
  this.parser.parse(function (error, data) {
    if (error) {
      callback(error, null);
    }

    var analyzedData = new Analyzer(
      data.rules,
      data.selectors,
      data.declarations,
      data.cssString,
      data.cssSize,
      that.options
    ).analyze();

    var stats = {};
    if (that.options.published) {
      stats.published = new Date();
    }
    if (that.options.paths) {
      stats.paths = [];
      Array.prototype.push.apply(stats.paths, that.files);
      Array.prototype.push.apply(stats.paths, that.urls);
    }
    if (that.options.stylesheets) {
      stats.stylesheets = that.files.length + data.cssFiles - 0;
    }
    if (that.options.styleElements && data.styleElements) {
      stats.styleElements = data.styleElements;
    }
    _.extend(stats, analyzedData);
    if (that.options.mediaQueries) {
      stats.mediaQueries = data.mediaQueries;
    }
    callback(null, stats);
  });
};

module.exports = StyleStats;
