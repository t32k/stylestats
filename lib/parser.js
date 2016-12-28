const fs = require('fs');
const url = require('url');
const path = require('path');
const css = require('css');
const request = require('request');
const cheerio = require('cheerio');
const util = require('./util');

/**
 * Get promised request
 * @param {Object} options
 * @returns {Promise}
 */
function requestPromise(options) {
  return new Promise((resolve, reject) => {
    request(options, (error, response) => {
      if (!error && response.statusCode === 200) {
        resolve(response);
      } else if (!error) {
        reject(`Status code is ${response.statusCode}`);
      } else {
        reject(error);
      }
    });
  });
}

class Parser {
  /**
   * @param {Array} urls
   * @param {Array} files
   * @param {Array} styles
   */
  constructor(urls, files, styles, options) {
    this.urls = urls;
    this.files = files;
    this.styles = styles;
    this.options = options;

    this.cssFiles = [];

    this.files.forEach(function (file) {
      const extname = path.extname(file);
      switch (extname) {
        case '.css':
          this.cssFiles.push(file);
          break;
      }
    }, this);
  }

  /**
   * Parse css data
   * @returns {Promise}
   */
  parse() {
    // object to return
    const parsedData = {
      cssString: '',
      cssSize: 0,
      styleElements: 0,
      mediaQueries: 0,
      cssFiles: 0,
      rules: [],
      selectors: [],
      declarations: []
    };

    const that = this;

    // remote file requests
    const requestPromises = [];
    this.urls.forEach((url) => {
      const options = that.options.requestOptions;
      options.url = url;
      options.gzip = true;
      requestPromises.push(requestPromise(options));
    });

    // css string array from arguments
    // they will be joined into css string
    this.cssFiles.forEach((cssFile) => {
      // push local css data
      that.styles.push(fs.readFileSync(cssFile, {
        encoding: 'utf8'
      }));
    });

    return new Promise((resolve, reject) => {
      // get remote files
      Promise.all(requestPromises).then((results) => {

        if (!that.urls.length && !that.files.length && !that.styles.length) {
          throw new Error('Argument is invalid');
        }

        // requests to stylesheet defined in html
        const requestPromisesInner = [];

        results.forEach((result) => {
          if (util.isCSS(result)) {
            that.styles.push(result);
          } else {
            // push remote css data
            const type = result.headers['content-type'];
            if (type.indexOf('html') > -1) {
              // parse result body
              const $ = cheerio.load(result.body);
              const $link = $('link[rel=stylesheet]');
              const $style = $('style');

              // add css file count
              parsedData.cssFiles += $link.length;
              parsedData.styleElements += $style.length;

              // request link[href]
              $link.each(function () {
                const relativePath = $(this).attr('href');
                const absolutePath = url.resolve(result.request.href, relativePath);
                const options = that.options.requestOptions;
                options.url = absolutePath;
                requestPromisesInner.push(requestPromise(options));
              });

              // add text in style tags
              $style.each(function () {
                that.styles.push($(this).text());
              });
            } else if (type.indexOf('css') !== -1) {
              parsedData.cssFiles += 1;
              that.styles.push(result.body);
            } else {
              throw new Error('Content type is not HTML or CSS!');
            }
          }
        });

        if (requestPromisesInner.length > 0) {
          return Promise.all(requestPromisesInner);
        } else {
          return true;
        }
      }).then((results) => {
        if (Array.isArray(results)) {
          results.forEach((result) => {
            that.styles.push(result.body);
          });
        }

        // join all css string
        parsedData.cssString = that.styles.join('');
        parsedData.cssSize = Buffer.byteLength(parsedData.cssString, 'utf8');

        // parse css string
        let rawRules = [];

        try {
          rawRules = css.parse(parsedData.cssString).stylesheet.rules;
        } catch (error) {
          throw new Error(error);
        }

        // check number of rules
        if (rawRules[0] === undefined) {
          throw new Error('Rule is not found.');
        }

        // add rules into result
        rawRules.forEach((rule) => {
          if (rule.type === 'rule') {
            parsedData.rules.push(rule);
          } else if (rule.type === 'media') {
            parsedData.mediaQueries += 1;
            rule.rules.forEach((rule) => {
              if (rule.type === 'rule') {
                parsedData.rules.push(rule);
              }
            });
          }
        });

        // add selectors and declarations into result
        parsedData.rules.forEach((rule) => {
          rule.selectors.forEach((selector) => {
            parsedData.selectors.push(selector);
          });
          rule.declarations.forEach((declaration) => {
            if (declaration.type === 'declaration') {
              parsedData.declarations.push(declaration);
            }
          });
        });
        resolve(parsedData);

      }).catch((error) => reject(error));
    });
  }
}

module.exports = Parser;
