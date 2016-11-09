const fs = require('fs');
const cssParse = require('css-parse');

const utils = {
  /**
   * Argument is file path or not
   * @param {String} file
   * @returns {Boolean}
   */
  isFile: (file) => {
    try {
      return fs.existsSync(file) && fs.statSync(file).isFile();
    } catch (error) {
      return false;
    }
  },
  /**
   * Argument is directory path or not
   * @param {String} dir
   * @returns {Boolean}
   */
  isDirectory: (dir) => {
    try {
      return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    } catch (error) {
      return false;
    }
  },
  /**
   * Argument is CSS or not
   * @param {String} str
   * @returns {Boolean}
   */
  isCSS: (str) => {
    try {
      return cssParse(str) instanceof Object;
    } catch (error) {
      return false;
    }
  },
  isFunction: (fn) => {
    return typeof fn === 'function' || false;
  },
  isObject: (obj) => {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  }
};

module.exports = utils;
