#!/usr/bin/env node

'use strict';

var _ = require('underscore');
var fs = require('fs');
var chalk = require('chalk');
var program = require('commander');

var StyleStats = require('../lib/stylestats');
var Format = require('../lib/format');
var specs = require('../lib/specs');
var util = require('../lib/util');

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
var config = {
  requestOptions: {
    headers: {}
  }
};

if (program.gzip) {
  config.gzippedSize = true;
}

if (program.mobile) {
  var iOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12A365 Safari/600.1.4';
  config.requestOptions.headers['User-Agent'] = iOS;
}

if (program.number) {
  var numberConfig = {
    "published": false,
    "paths": false,
    "mostIdentifierSelector": false,
    "lowestCohesionSelector": false,
    "uniqueFontFamilies": false,
    "uniqueFontSizes": false,
    "uniqueColors": false,
    "propertiesCount": false
  };
  _.extend(config, numberConfig);
}

var userConfig = {};
if (program.config && util.isFile(program.config)) {
  var configString = fs.readFileSync(program.config, {
    encoding: 'utf8'
  });
  try {
    userConfig = JSON.parse(configString);
  } catch (e) {
    throw e;
  }
} else if (_.isObject(program.config)) {
  userConfig = config;
}

_.extend(config, userConfig);



// Parse
var stats = new StyleStats(program.args, config);
stats.parse(function (error, result) {
  if (error) {
    console.log(chalk.red(' [ERROR] ' + error.message));
  }

  var format = new Format(result);
  if (fs.existsSync(program.template)) {

    format.setTemplate(fs.readFileSync(program.template, {
      encoding: 'utf8'
    }));

    format.toTemplate(function (text) {
      console.log(text);
    });

  } else if(!program.specs) {
    switch (program.format) {
      case 'json':
        format.toJSON(function (json) {
          console.log(json);
        });
        break;
      case 'csv':
        format.toCSV(function (csv) {
          console.log(csv);
        });
        break;
      case 'html':
        format.toHTML(function (html) {
          console.log(html);
        });
        break;
      case 'md':
        format.toMarkdown(function (md) {
          console.log(md);
        });
        break;
      default:
        format.toTable(function (table) {
          console.log(' StyleStats!\n' + table);
        });
        break;
    }
  } else {
    specs(result, program.specs);
  }
});
