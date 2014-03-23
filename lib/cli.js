/* Command line implementation for StlyeStats */

'use strict';

var Table = require('cli-table');
var numeral = require('numeral');
var program = require('commander');
var jade = require('jade');
var fs = require('fs');
var json2csv = require('json2csv');
var _ = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

function prettyLog(result) {
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
        } else if (key === 'size' || key === 'gzippedSize' || key === 'dataUriSize') {
            stats[prop] = numeral(result[key]).format('0.0b').replace(/\.0B/, 'B').replace(/0\.0/, '0');
        } else if (key === 'simplicity' || key === 'raitoOfDataUriSize') {
            stats[prop] = numeral(result[key]).format('0.00%');
        } else if (key === 'published') {
            return true;
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
    var output = JSON.stringify(result, null, 2),
        jadeTemplateLocals;

    switch (program.extension) {
        case 'json':
            console.log(output);
            break;
        case 'html':
            _.each(_.keys(result), function (key) {
                result[_(_(key).humanize()).titleize()] = result[key];
                delete result[key];
            });

            jadeTemplateLocals = {
                analyzedFile: _(program.args[0]).titleize(),
                result: result
            }

            jade.renderFile('./jade/stats.jade', jadeTemplateLocals, function (error, html) {
                fs.writeFile('stats.html', html, function (err) {
                    console.log('Stats.html created!');
                })
            });
            break;
        case 'csv':
            json2csv({
                data: result,
                fields: Object.keys(result)
            }, function(err, csv) {
                console.log(csv);
            });
            break;
        default:
            prettyLog(result);
    }
});