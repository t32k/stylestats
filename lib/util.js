var fs = require('fs');
var path = require('path');

function isFile() {
    try {
        var file = path.join.apply(path, arguments);
        return fs.existsSync(file) && fs.statSync(file).isFile();
    } catch (e) {
        return false;
    }
}

function isDirectory() {
    try {
        var dir = path.join.apply(path, arguments);
        return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    } catch (e) {
        return false;
    }
}

module.exports = {
    isFile: isFile,
    isDirectory: isDirectory
};