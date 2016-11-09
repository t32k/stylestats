#!/usr/bin/env node

/* eslint no-console: "off" */

const fs = require('fs');
const chalk = require('chalk');
const program = require('commander');
const StyleStats = require('../lib/stylestats');
const Format = require('../lib/format');
const specs = require('../lib/specs');
const util = require('../lib/util');

program
  .version(require('../package.json').version)
  .usage('[options] <file ...>')
  .option('-c, --config <path>', 'set configurations')
  .option('-f, --format <format>', 'set the output format <json|html|md|csv>')
  .option('-t, --template <path>', 'set the template path for output formant')
  .option('-s, --specs <path>', 'run test with your test specs file')
  .option('-n, --number', 'show only numeral metrics')
  .option('-m, --mobile', 'set the mobile user agent')
  .parse(process.argv);


if (!program.args.length) {
  console.log(chalk.red('\n No input file specified.'));
  program.help();
}

// Config
const config = {
  requestOptions: {
    headers: {}
  }
};
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_3_2 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13F69 Safari/601.1';
const numberConfig = {
  "published": false,
  "paths": false,
  "mostIdentifierSelector": false,
  "lowestCohesionSelector": false,
  "uniqueFontFamilies": false,
  "uniqueFontSizes": false,
  "uniqueColors": false,
  "propertiesCount": false
};
let userConfig = {};

if (program.mobile) {
  config.requestOptions.headers['User-Agent'] = MOBILE_UA;
}
if (program.number) {
  Object.assign(config, numberConfig);
}
if (program.config && util.isFile(program.config)) {
  const configString = fs.readFileSync(program.config, {
    encoding: 'utf8'
  });
  try {
    userConfig = JSON.parse(configString);
  } catch (e) {
    throw e;
  }
} else if (util.isObject(program.config)) {
  userConfig = config;
}
Object.assign(config, userConfig);


// Parse
const stats = new StyleStats(program.args, config);
stats.parse((error, result) => {
  if (error) {
    console.log(chalk.red(` [ERROR] ${error.message}`));
  }
  const format = new Format(result);
  if (fs.existsSync(program.template)) {

    format.setTemplate(fs.readFileSync(program.template, {
      encoding: 'utf8'
    }));

    format.parseTemplate((text) => {
      console.log(text);
    });

  } else if (!program.specs) {
    switch (program.format) {
      case 'json':
        format.toJSON((json) => {
          console.log(json);
        });
        break;
      case 'csv':
        format.toCSV((csv) => {
          console.log(csv);
        });
        break;
      case 'html':
        format.toHTML((html) => {
          console.log(html);
        });
        break;
      case 'md':
        format.toMarkdown((md) => {
          console.log(md);
        });
        break;
      default:
        format.toTable((table) => {
          console.log(` StyleStats!
${table}`);
        });
        break;
    }
  } else {
    specs(result, program.specs);
  }
});
