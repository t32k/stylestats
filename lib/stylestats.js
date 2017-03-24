const fs = require('fs');
const path = require('path');
const glob = require('glob');
const validUrl = require('valid-url');
const util = require('./util');
const prettify = require('./prettify');
const Parser = require('./parser');
const Analyzer = require('./analyzer');

class StyleStats {
  /**
   * @param {Array} args
   * @param {String|Object} config
   */
  constructor(args, config) {
    args = Array.isArray(args) ? args : [args];
    this.urls = [];
    this.files = [];
    this.styles = [];
    const EXTENSIONS = ['.css'];

    // Check arguments which is url or file path or other
    args.forEach(arg => {
      if (util.isFile(arg) && EXTENSIONS.indexOf(path.extname(arg)) !== -1) {
        this.files.push(arg);
      } else if (util.isDirectory(arg)) {
        fs.readdirSync(arg).filter(file => {
          return (EXTENSIONS.indexOf(path.extname(file)) !== -1);
        }).forEach(file => {
          this.files.push(arg + file);
        });
      } else if (validUrl.isUri(arg)) {
        this.urls.push(arg);
      } else if (util.isCSS(arg)) {
        this.styles.push(arg);
      } else {
        glob.sync(arg).filter(file => {
          return (path.extname(file) === '.css');
        }).forEach(file => {
          this.files.push(file);
        });
      }
    });

    const defaultOptions = require('../assets/default.json');
    let customOptions = {};
    if (config && util.isFile(config)) {
      const configString = fs.readFileSync(config, {
        encoding: 'utf8'
      });
      try {
        customOptions = JSON.parse(configString);
      } catch (err) {
        throw err;
      }
    } else if (util.isObject(config)) {
      customOptions = config;
    }

    this.options = Object.assign({}, defaultOptions, customOptions);
    this.parser = new Parser(this.urls, this.files, this.styles, this.options);
  }

  /**
   * Parse CSS
   * @returns {Promise}
   */
  parse() {
    return new Promise((resolve, reject) => {
      this.parser.parse().then(data => {
        const analyzedData = new Analyzer(data, this.options).analyze();

        const stats = {};
        if (this.options.published) {
          stats.published = new Date();
        }
        if (this.options.paths) {
          stats.paths = [];
          Array.prototype.push.apply(stats.paths, this.files);
          Array.prototype.push.apply(stats.paths, this.urls);
        }
        if (this.options.stylesheets) {
          stats.stylesheets = this.files.length + data.cssFiles - 0;
        }
        if (this.options.styleElements) {
          stats.styleElements = data.styleElements;
        }
        Object.assign(stats, analyzedData);
        if (this.options.mediaQueries) {
          stats.mediaQueries = data.mediaQueries;
        }
        resolve(stats);
      }).catch(err => reject(err));
    });
  }

  /**
   * Prettify CSS
   * @param {Object} stats
   * @returns {Object}
   */
  prettify(stats) {
    return prettify(stats);
  }
}

module.exports = StyleStats;
