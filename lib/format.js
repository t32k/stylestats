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

Format.prototype.parseTemplate = function (callback) {
  if (!this.template) {
    throw new Error('Template is not set');
  } else {
    this.template.parse(callback);
  }
};

Format.prototype.toMarkdown = function (callback) {
  var file = path.join(__dirname, '../assets/markdown.hbs');
  this.setTemplate(fs.readFileSync(file, {
    encoding: 'utf8'
  }));
  this.parseTemplate(callback);
};

Format.prototype.toHTML = function (callback) {
  var file = path.join(__dirname, '../assets/html.hbs');
  this.setTemplate(fs.readFileSync(file, {
    encoding: 'utf8'
  }));
  this.parseTemplate(callback);
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
