/* Command line implementation for StlyeStats */

'use strict';

var fs = require('fs');
var path = require('path');
var jade = require('jade');
var Table = require('cli-table');
var numeral = require('numeral');
var program = require('commander');
var json2csv = require('json2csv');

var _ = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

var prettifyData = function(collections, result) {
    Object.keys(result).forEach(function(key) {
        var stats = {};
        var prop = _(_(key).humanize()).titleize();
        if (key === 'propertiesCount') {
            var array = [];
            result[key].forEach(function(item) {
                array.push([item.property, item.count]);
            });
            stats[prop] = array.join('\n').replace(/\,/g, ': ');
        } else if (key === 'size' || key === 'gzippedSize' || key === 'dataUriSize') {
            stats[prop] = numeral(result[key]).format('0.0b').replace(/\.0B/, 'B').replace(/0\.0/, '0');
        } else if (key === 'simplicity' || key === 'raitoOfDataUriSize') {
            stats[prop] = numeral(result[key]).format('0.00%');
        } else if (key === 'published' || key === 'paths') {
            return true;
        } else {
            stats[prop] = Array.isArray(result[key]) ? result[key].join('\n') : result[key];
            if (stats[prop] === '') {
                stats[prop] = 'N/A';
            }
        }
        collections.push(stats);
    });
};

var StyleStats = require('./stylestats');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'Path and name of the incoming JSON file.')
    .option('-e, --extension [format]', 'Specify the format to convert. <json|html|csv>')
    .option('-s, --simple', 'Show compact style\'s log.')
    .parse(process.argv);

if (!program.args.length) {
    console.log('\n No input file specified.');
    program.help();
}

var stats = new StyleStats(program.args, program.config);
stats.parse(function(result) {
    var output = JSON.stringify(result, null, 2);
    switch (program.extension) {
        case 'json':
            console.log(output);
            break;
        case 'csv':
            json2csv({
                data: result,
                fields: Object.keys(result)
            }, function(err, csv) {
                console.log(csv);
            });
            break;
        case 'html':
            var realPath = path.dirname(__filename) + '/jade/stats.jade';
            var htmlData = [];
            prettifyData(htmlData, result);
            var template = jade.compile(fs.readFileSync(realPath, 'utf8'), {
                pretty: true
            });
            var html = template({
                stats: htmlData,
                published: result.published,
                paths: result.paths
            });
            console.log(html);
            break;
        default:
            var table = new Table({
                style: {
                    head: ['cyan'],
                    compact: program.simple
                }
            });
            prettifyData(table, result);
            console.log(' StyleStats!\n ' + table.toString());
    }
});