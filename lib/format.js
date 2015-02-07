var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var json2csv = require('json2csv');
var Table = require('cli-table');
var prettify = require('../lib/prettify');

function Format(data, isSimple) {
  this.data = data;
  this.isSimple = !!isSimple;
}

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

Format.prototype.toHTML = function (callback) {

  var templatePath = path.join(__dirname, '../assets/stats.template');
  var templateString = fs.readFileSync(templatePath, {
    encoding: 'utf8'
  });
  var template = _.template(templateString);

  callback(template({
    stats: prettify(this.data),
    published: this.data.published,
    paths: this.data.paths
  }));
};

Format.prototype.toTable = function (callback) {

  var table = new Table({
    style: {
      head: ['cyan'],
      compact: this.isSimple
    }
  });

  prettify(this.data).forEach(function (row) {
    table.push(row);
  });

  callback(table.toString());
};


Format.prototype.toMarkdown = function (callback) {
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

  result = "#StyleStats!\n";
  for (var key in data) {
    result += " * "+key + ": " + data[key];
    result += "\n";
  }

  callback(result);
};


module.exports = Format;
