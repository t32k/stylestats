const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv');
const Table = require('cli-table');
const prettify = require('../lib/prettify');
const Template = require('../lib/template');

class Format {
  constructor(data) {
    this.data = data;
    this.template = null;
  }

  setTemplate(templateString) {
    this.template = new Template(templateString, prettify(this.data));
  }

  parseTemplate(callback) {
    if (!this.template) {
      throw new Error('Template is not set');
    } else {
      this.template.parse(callback);
    }
  }

  toMarkdown(callback) {
    const file = path.join(__dirname, '../assets/markdown.hbs');
    this.setTemplate(fs.readFileSync(file, {
      encoding: 'utf8'
    }));
    this.parseTemplate(callback);
  }

  toHTML(callback) {
    const file = path.join(__dirname, '../assets/html.hbs');
    this.setTemplate(fs.readFileSync(file, {
      encoding: 'utf8'
    }));
    this.parseTemplate(callback);
  }

  toJSON(callback) {
    callback(JSON.stringify(this.data, null, 2));
  }

  toCSV(callback) {
    let data = this.data;
    Object.keys(data).forEach(function (key) {
      if (key === 'propertiesCount') {
        let array = [];
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
  }

  toTable(callback) {
    let table = new Table({
      style: {
        head: ['cyan'],
        compact: false
      }
    });
    let data = prettify(this.data);
    Object.keys(data).forEach(function (key) {
      var row = {};
      row[key] = data[key];
      table.push(row);
    });
    callback(table.toString());
  }
}

module.exports = Format;
