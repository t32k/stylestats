/**
 * Command line implementation for StlyeStats
 *
 */

'use strict';

var Table = require('cli-table');
var numeral = require('numeral');
var program = require('commander');
var json2csv = require('json2csv');
var _ = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

var StyleStats = require('./stylestats');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'Path and name of the incoming JSON file.')
    .option('-e, --extension [format]', 'Specify the format to convert. <json|csv>')
    .option('-s, --simple', 'Show compact style\'s log.')
    .parse(process.argv);

if (!program.args.length) {
    console.log('\n No input file specified.');
    program.help();
}

var stats = new StyleStats(program.args, program.config);
var result = stats.parse();
var output = JSON.stringify(result, null, 2);

switch (program.extension) {
    case 'json':
        console.log(output);
        break;
    case 'csv':
        json2csv({
            data: result,
            fields: Object.keys(result),
        }, function(err, csv) {
            console.log(csv)
        });
        break;
    default:
        prettyLog();
}

function prettyLog() {
    var table = new Table({
        style: {
            head: ['cyan'],
            compact: program.simple
        }
    });
    Object.keys(result).forEach(function(key) {
        var stats = {};
        var prop = _(_(key).humanize()).titleize();
        if (key === 'propertiesCount') {
            var array = [];
            result[key].forEach(function(item) {
                array.push([item.property, item.count]);
            });
            stats[prop] = array.join('\n').replace(/\,/g, ': ');
        } else if (key === 'size' || key === 'gzippedSize') {
            stats[prop] = numeral(result[key]).format('0.0b');
        } else if (key === 'simplicity') {
            stats[prop] = numeral(result[key]).format('0.00%');
        } else {
            stats[prop] = Array.isArray(result[key]) ? result[key].join('\n') : result[key];
            if (stats[prop] === '') {
                stats[prop] = 'N/A';
            }
        }
        table.push(stats);
    });
    console.log('StyleStats!\n' + table.toString());
}