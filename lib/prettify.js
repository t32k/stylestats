const moment = require('moment');
const numeral = require('numeral');
const aliases = require('../assets/aliases.json');

const KEY_BYTE = [
  'size',
  'gzippedSize',
  'dataUriSize'
];
const KEY_PERCENT = [
  'simplicity',
  'ratioOfDataUriSize'
];
const KEY_NUMBER = [
  'averageOfCohesion',
  'averageOfIdentifier'
];

/**
 * Prettify StyleStats data.
 * @param {object} [result] StyleStats parse data. Required.
 * @return {object} prettified data.
 */
function prettify(result) {
  const collection = {};

  Object.keys(result).forEach(key => {
    const readableKey = aliases[key];
    let value = result[key];

    if (key === 'published') {
      value = moment(value).format('LLL');
    }
    if (key === 'propertiesCount') {
      const array = [];
      value.forEach(item => {
        array.push([item.property, item.count]);
      });
      if (array.length !== 0) {
        value = array.join('\n').replace(/,/g, ': ');
      }
    }
    if (KEY_BYTE.indexOf(key) !== -1) {
      value = numeral(value).format('0.0b').replace(/^0\.0B$/, '0');
    }
    if (KEY_PERCENT.indexOf(key) !== -1) {
      value = numeral(value).format('0.0%').replace(/^0\.0%$/, '0');
    }
    if (KEY_NUMBER.indexOf(key) !== -1) {
      value = numeral(value).format('0.000');
    }
    if (Array.isArray(value)) {
      const maxLen = 64;
      value = value.map(val => {
        if (val.length > maxLen) {
          return `${val.substring(0, maxLen)}...`;
        }
        return val;
      });
      value = value.join('\n') === '' ? 'N/A' : value.join('\n');
    }
    collection[readableKey] = value;
  });

  return collection;
}

module.exports = prettify;
