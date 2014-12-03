var fs       = require('fs');
var path     = require('path');
var _        = require('underscore');
var json2csv = require('json2csv');
var Table    = require('cli-table');
var prettify = require('../lib/prettify');

function Format (data) {
  this.data = data;
}

Format.prototype.toJSON = function (callback) {
  callback(JSON.stringify(this.data, null, 2));
};

Format.prototype.toCSV = function (callback) {

  var data = this.data;

  Object.keys(data).forEach(function(key) {
    if (key === 'propertiesCount') {
      var array = [];
      data[key].forEach(function(item) {
        array.push([item.property + ':' + item.count]);
      });
      data[key] = array;
    }
    data[key] = Array.isArray(data[key]) ? data[key].join(' ') : data[key];
  });

  json2csv({
    data: data,
    fields: Object.keys(data)
  }, function(error, csv) {
    if (error) {
      throw error;
    } else {
      callback(csv);
    }
  });
};

Format.prototype.toHTML = function (callback) {

  var data = this.data;

  var templatePath = path.join(__dirname, '../assets/stats.template');
  var template = _.template(fs.readFileSync(templatePath, {
    encoding: 'utf8'
  }));

  callback(template({
    stats: prettify(data),
    published: data.published,
    paths: data.paths
  }));
};

Format.prototype.toTable = function (isSimple, callback) {

  var table = new Table({
    style: {
      head: ['cyan'],
      compact: isSimple
    }
  });

  prettify(this.data).forEach(function(row) {
    table.push(row);
  });

  callback(table.toString());
};

module.exports = Format;