var moment = require('moment');
var numeral = require('numeral');
var aliases = require('../assets/aliases.json');

var KEY_BYTE = [
  'size',
  'gzippedSize',
  'dataUriSize'
];
var KEY_PERCENT = [
  'simplicity',
  'ratioOfDataUriSize'
];
var KEY_NUMBER = [
  'averageOfCohesion',
  'averageOfIdentifier'
];

/**
 * Prettify StyleStats data.
 * @param {object} [result] StyleStats parse data. Required.
 * @return {object} prettified data.
 */
function prettify(result) {
  var collection = {};

  Object.keys(result).forEach(function (key) {
    var readableKey = aliases[key];
    var value = result[key];

    if (key === 'published') {
      value = moment(value).format('LLL');
    }
    if (key === 'propertiesCount') {
      var array = [];
      value.forEach(function (item) {
        array.push([item.property, item.count]);
      });
      if (array.length !== 0) {
        value = array.join('\n').replace(/\,/g, ': ');
      }
    }
    if (KEY_BYTE.indexOf(key) !== -1) {
      value = numeral(value).format('0.0b').replace(/\.0B/, 'B').replace(/0\.0/, '0');
    }
    if (KEY_PERCENT.indexOf(key) !== -1) {
      value = numeral(value).format('0.0%');
    }
    if (KEY_NUMBER.indexOf(key) !== -1) {
      value = numeral(value).format('0.000');
    }
    if (Array.isArray(value)) {
      value = value.join('\n') === '' ? 'N/A' : value.join('\n');
    }
    collection[readableKey] = value;
  });

  return collection;
}

module.exports = prettify;
