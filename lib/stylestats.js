/*
 * stylestats
 * https://github.com/t32k/stylestats
 *
 * Copyright (c) 2014
 * Licensed under the MIT license.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const validUrl = require('valid-url');
const util = require('./util');
const Parser = require('./parser');
const Analyzer = require('./analyzer');

class StyleStats {
  /**
   * @param {Array} args
   * @param {String|Object} config
   */
  constructor(args, config) {
    const that = this;
    args = Array.isArray(args) ? args : [args];
    this.urls = [];
    this.files = [];
    this.styles = [];
    let EXTENSIONS = ['.css'];

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
      } else if (validUrl.isUri(arg)) {
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

    const defaultOptions = require('../assets/default.json');
    let customOptions = {};
    if (config && util.isFile(config)) {
      let configString = fs.readFileSync(config, {
        encoding: 'utf8'
      });
      try {
        customOptions = JSON.parse(configString);
      } catch (e) {
        throw e;
      }
    } else if (util.isObject(config)) {
      customOptions = config;
    }

    this.options = Object.assign({}, defaultOptions, customOptions);
    this.parser = new Parser(this.urls, this.files, this.styles, this.options);
  }
  /**
   * Parse CSS
   * @param {Function} callback
   */
  parse(callback) {
    const that = this;
    this.parser.parse(function (error, data) {
      if (error) {
        callback(error, null);
      }

      let analyzedData = new Analyzer(
        data.rules,
        data.selectors,
        data.declarations,
        data.cssString,
        data.cssSize,
        that.options
      ).analyze();

      let stats = {};
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
      if (that.options.styleElements) {
        stats.styleElements = data.styleElements;
      }
      Object.assign(stats, analyzedData);
      if (that.options.mediaQueries) {
        stats.mediaQueries = data.mediaQueries;
      }
      callback(null, stats);
    });
  }
}

module.exports = StyleStats;
