var fs = require('fs');
var path = require('path');
var json2csv = require('json2csv');
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

Format.prototype.setData = function (data) {
  this.data = data;
};

Format.prototype.toTemplate = function (callback) {
  if (!this.template) {
    throw new Error('Template is not set');
  } else {
    this.template.parse(callback);
  }
};


Format.prototype.toHTML = function (callback) {

  var templatePath = path.join(__dirname, '../assets/html.hbs');
  var templateString = fs.readFileSync(templatePath, {
    encoding: 'utf8'
  });

  this.template = new Template(templateString, prettify(this.data));
  this.template.parse(callback);
};


Format.prototype.toMarkdown = function (callback) {

  var templatePath = path.join(__dirname, '../assets/markdown.hbs');
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

  json2csv({
    data: data,
    fields: Object.keys(data)
  }, function (error, csv) {
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

  prettify(this.data).forEach(function (row) {
    table.push(row);
  });

  callback(table.toString());
};

module.exports = Format;
