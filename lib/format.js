const Table = require('cli-table');
const json2csv = require('json2csv');

class Format {
  constructor(context) {
    this.context = context;
  }

  toJSON() {
    return JSON.stringify(this.context, null, 2);
  }

  toCSV() {
    const data = this.context;
    Object.keys(data).forEach(key => {
      if (key === 'propertiesCount') {
        const array = [];
        data[key].forEach(item => {
          array.push([`${item.property}:${item.count}`]);
        });
        data[key] = array;
      }
      if (Array.isArray(data[key])) {
        data[key] = data[key].join(' ');
      }
    });
    return new Promise((resolve, reject) => {
      json2csv({data, fields: Object.keys(data)}, (error, csv) => {
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
    const data = this.context;
    Object.keys(data).forEach(key => {
      const row = {};
      row[key] = data[key];
      table.push(row);
    });
    return table.toString();
  }
}

module.exports = Format;
