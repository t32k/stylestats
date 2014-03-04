/**
 * Command line implementation for StlyeStats
 *
 */

var Table = require('cli-table');
var program = require('commander');
var json2csv = require('json2csv');
var prettyBytes = require('pretty-bytes');

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
    .parse(process.argv);

if (!program.args.length) {
    console.log('\n No input paths specified.');
    program.help();
}

var stats = new StyleStats(program.args[0], program.config);
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
            head: ['cyan']
            //compact: true
        }
    });
    Object.keys(result).forEach(function(key) {
        var obj = {};
        if (key === 'uniqueFontSize' || key === 'uniqueColor' || key === 'csvCount') {
            obj[_(_(key).humanize()).titleize()] = result[key].join('\n').replace(/(\, )$2/, '\n');
        } else if (key === 'size' || key === 'gzippedSize') {
            obj[_(_(key).humanize()).titleize()] = prettyBytes(result[key]).toUpperCase();
        } else {
            obj[_(_(key).humanize()).titleize()] = result[key]
        }
        table.push(obj);
    });
    console.log('\n StyleStats!');
    console.log(table.toString());
}