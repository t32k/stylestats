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
  constructor(context) {
    this.context = context;
    this.template = null;
  }

  setTemplate(source) {
    this.template = Handlebars.compile(source || '');
  }

  getFormattedText() {
    if (!this.template) {
      throw new Error('Template is not set');
    } else {
      return this.template(prettify(this.context));
    }
  }

  toMarkdown() {
    const file = path.join(__dirname, '../assets/markdown.hbs');
    this.setTemplate(fs.readFileSync(file, { encoding: 'utf8' }));
    return this.getFormattedText();
  }

  toHTML() {
    const file = path.join(__dirname, '../assets/html.hbs');
    this.setTemplate(fs.readFileSync(file, { encoding: 'utf8'}));
    return this.getFormattedText();
  }

  toJSON() {
    return JSON.stringify(this.context, null, 2);
  }

  toCSV() {
    const data = this.context;
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
    return new Promise((resolve, reject) => {
      json2csv({ data, fields: Object.keys(data)}, (error, csv) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(csv);
      });
    });
  }

  toTable() {
    const table = new Table({
      style: {
        head: ['cyan'],
        compact: false
      }
    });
    const data = prettify(this.context);
    Object.keys(data).forEach((key) => {
      const row = {};
      row[key] = data[key];
      table.push(row);
    });
    return table.toString();
  }
}

module.exports = Format;
