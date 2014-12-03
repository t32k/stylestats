var fs = require('fs');
var cssParse = require('css-parse');

/**
 * Argument is file path or not
 * @param {String} file
 * @returns {Boolean}
 */
function isFile(file) {
  try {
    return fs.existsSync(file) && fs.statSync(file).isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Argument is directory path or not
 * @param {String} dir
 * @returns {Boolean}
 */
function isDirectory(dir) {
  try {
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Argument is CSS or not
 * @param {String} str
 * @returns {Boolean}
 */
function isCSS(str) {
  try {
    return cssParse(str) instanceof Object;
  } catch (error) {
    return false;
  }
}

module.exports = {
  isFile: isFile,
  isDirectory: isDirectory,
  isCSS: isCSS
};