var fs = require('fs');
var path = require('path');
var converter = require('json-2-csv');
var Table = require('cli-table');
var prettify = require('../lib/prettify');
var Template = require('../lib/template');

function Format(data) {
  this.data = data;
  this.template = null;
}

Format.prototype.setTemplate = function (templateString) {
  this.template = new Template(templateString, prettify(this.data));
};

Format.prototype.toTemplate = function (callback) {
  if (!this.template) {
    throw new Error('Template is not set');
  } else {
    this.template.parse(callback);
  }
};

// toHTML and toMarkdown
Format.prototype.toDefaultTemplate = function (filePath, callback) {
  var templatePath = path.join(__dirname, filePath);
  var templateString = fs.readFileSync(templatePath, {
    encoding: 'utf8'
  });
  this.template = new Template(templateString, prettify(this.data));
  this.template.parse(callback);
};

Format.prototype.toJSON = function (callback) {
  callback(JSON.stringify(this.data, null, 2));
};

Format.prototype.toCSV = function (callback) {

  var data = this.data;

  Object.keys(data).forEach(function (key) {
    if (key === 'propertiesCount') {
      var array = [];
      data[key].forEach(function (item) {
        array.push([item.property + ':' + item.count]);
      });
      data[key] = array;
    }
    if (Array.isArray(data[key])) {
      data[key] = data[key].join(' ');
    }
  });
  converter.json2csv(data, function (error, csv) {
    if (error) {
      throw error;
    } else {
      callback(csv);
    }
  });
};

Format.prototype.toTable = function (callback) {
  var table = new Table({
    style: {
      head: ['cyan'],
      compact: false
    }
  });
  var data = prettify(this.data);
  Object.keys(data).forEach(function (key) {
    var row = {};
    row[key] = data[key];
    table.push(row);
  });
  callback(table.toString());
};

module.exports = Format;
