var numeral = require('numeral');
var aliases = require('../assets/aliases.json');

/**
 * Prettify StyleStats data.
 * @param {object} [result] StyleStats parse data. Required.
 * @return {array} prettified data.
 */
function prettify(result) {
    var collections = [];
    Object.keys(result).forEach(function(key) {
        var stats = {};
        var prop = aliases[key];
        if (key === 'propertiesCount') {
            var array = [];
            result[key].forEach(function(item) {
              array.push([item.property, item.count]);
            });
            stats[prop] = array.join('\n').replace(/\,/g, ': ');
        } else if (key === 'size' || key === 'gzippedSize' || key === 'dataUriSize') {
            stats[prop] = numeral(result[key]).format('0.0b').replace(/\.0B/, 'B').replace(/0\.0/, '0');
        } else if (key === 'simplicity' || key === 'ratioOfDataUriSize') {
            stats[prop] = numeral(result[key]).format('0.0%');
        } else if (key === 'published' || key === 'paths') {
            return true;
        } else {
            stats[prop] = Array.isArray(result[key]) ? result[key].join('\n') : result[key];
            if (stats[prop] === '') {
                stats[prop] = 'N/A';
            }
        }
        collections.push(stats);
    });
    return collections;
}

module.exports = prettify;