var fs = require('fs');

/**
 * Argument is file path or not
 * @param {String} file
 * @returns {Boolean}
 */
function isFile(file) {
    try {
        return fs.existsSync(file) && fs.statSync(file).isFile();
    } catch (e) {
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
    } catch (e) {
        return false;
    }
}

module.exports = {
    isFile: isFile,
    isDirectory: isDirectory
};