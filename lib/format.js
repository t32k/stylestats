const fs = require('fs');
const path = require('path');
const json2csv = require('json2csv');
const Table = require('cli-table');
const Handlebars = require('handlebars');
const prettify = require('../lib/prettify');

Handlebars.registerHelper('removeBreak', (text) => {
  text = Handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, ' ');
  return new Handlebars.SafeString(text);
});


class Format {
  constructor(data) {
    this.data = data;
    this.template = null;
  }

  setTemplate(source) {
    this.template = Handlebars.compile(source || '');
  }

  parseTemplate(callback) {
    if (!this.template) {
      throw new Error('Template is not set');
    } else {
      callback(this.template(prettify(this.data)));
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
    const data = this.data;
    Object.keys(data).forEach((key) => {
      if (key === 'propertiesCount') {
        const array = [];
        data[key].forEach((item) => {
          array.push([`${item.property}:${item.count}`]);
        });
        data[key] = array;
      }
      if (Array.isArray(data[key])) {
        data[key] = data[key].join(' ');
      }
    });
    json2csv({
      data,
      fields: Object.keys(data)
    }, (error, csv) => {
      if (error) {
        throw error;
      } else {
        callback(csv);
      }
    });
  }

  toTable(callback) {
    const table = new Table({
      style: {
        head: ['cyan'],
        compact: false
      }
    });
    const data = prettify(this.data);
    Object.keys(data).forEach((key) => {
      const row = {};
      row[key] = data[key];
      table.push(row);
    });
    callback(table.toString());
  }
}

module.exports = Format;
