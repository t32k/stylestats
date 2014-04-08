#!/usr/bin/env node

'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var Table = require('cli-table');
var numeral = require('numeral');
var program = require('commander');
var json2csv = require('json2csv');

var StyleStats = require('../lib/stylestats');
var util = require('../lib/util');
var aliases = require('../assets/aliases.json');

/**
 * Prettify StyleStats data.
 * @param {object} [result] StyleStats parse data. Required.
 * @return {array} prettified data.
 */
function prettify(result) {
    var collections = [];
    Object.keys(result).forEach(function(key) {
        var stats = {};
        var prop = aliases[key];
        if (key === 'propertiesCount') {
            var array = [];
            result[key].forEach(function(item) {
                array.push([item.property, item.count]);
            });
            stats[prop] = array.join('\n').replace(/\,/g, ': ');
        } else if (key === 'size' || key === 'gzippedSize' || key === 'dataUriSize') {
            stats[prop] = numeral(result[key]).format('0.0b').replace(/\.0B/, 'B').replace(/0\.0/, '0');
        } else if (key === 'simplicity' || key === 'ratioOfDataUriSize') {
            stats[prop] = numeral(result[key]).format('0.0%');
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
}

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'Path and name of the incoming JSON file.')
    .option('-t, --type [format]', 'Specify the output format. <json|html|csv>')
    .option('-s, --simple', 'Show compact style\'s log.')
    .option('-g, --gzip', 'Show gzipped file size.')
    .option('-n, --number', 'Show only numeral metrics.')
    .option('-u, --ua [OS]', 'Specify the user agent. <ios|android>')
    .parse(process.argv);

if (!program.args.length) {
    console.log( chalk.red('\n No input file specified.') );
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
if (program.ua) {
    var iOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 7_0 like Mac OS X) AppleWebKit/537.51.1 (KHTML, like Gecko) Version/7.0 Mobile/11A465 Safari/9537.53';
    var Android = 'Mozilla/5.0 (Linux; Android 4.4; Nexus 5 Build/KRT16M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.59 Mobile Safari/537.36';
    switch (program.ua) {
        case 'ios':
            config.requestOptions.headers['User-Agent'] = iOS;
            break;
        case 'android':
            config.requestOptions.headers['User-Agent'] = Android;
            break;
        default:
            console.error(' [WARN] User agent should be `ios` or `android`.');
            break;
    }
}
if (program.number) {
    var numberConfig = {
        "published": false,
        "paths": false,
        "mostIdentifierSelector": false,
        "lowestCohesionSelector": false,
        "uniqueFontSize": false,
        "uniqueColor": false,
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
stats.parse(function(error, result) {
    if (error) {
        console.log( chalk.red('[ERROR] ' + error.message) );
    }
    switch (program.type) {
        case 'json':
            var json = JSON.stringify(result, null, 2);
            console.log(json);
            break;
        case 'csv':
            Object.keys(result).forEach(function(key) {
                result[key] = Array.isArray(result[key]) ? result[key].join(' ') : result[key];
            });
            json2csv({
                data: result,
                fields: Object.keys(result)
            }, function(err, csv) {
                console.log(csv);
            });
            break;
        case 'html':
            var templatePath = path.join(__dirname, '../assets/stats.template');
            var template = _.template(fs.readFileSync(templatePath, {
                encoding: 'utf8'
            }));
            var html = template({
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