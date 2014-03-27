#!/usr/bin/env node

'use strict';

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

/**
 * Prettify StyleStats data.
 * @param {object} [result] StyleStats parse data. Required.
 * @return {array} prettified data.
 */
var prettify = function(result) {
    var collections = [];
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
        } else if (key === 'simplicity' || key === 'ratioOfDataUriSize') {
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
    return collections;
};

var StyleStats = require('../lib/stylestats');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'Path and name of the incoming JSON file.')
    .option('-t, --type [format]', 'Specify the output format. <json|html|csv>')
    .option('-s, --simple', 'Show compact style\'s log.')
    .parse(process.argv);

if (!program.args.length) {
    console.log('\n No input file specified.');
    program.help();
}

var stats = new StyleStats(program.args, program.config);
stats.parse(function(result) {
    switch (program.type) {
        case 'json':
            var json = JSON.stringify(result, null, 2);
            console.log(json);
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
            var template = path.join(__dirname, '../assets/stats.jade');
            var html = jade.renderFile(template, {
                pretty: true,
                stats: prettify(result),
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
            prettify(result).forEach(function(data) {
                table.push(data);
            });
            console.log(' StyleStats!\n' + table.toString());
            break;
    }
});