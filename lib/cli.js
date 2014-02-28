/**
 * Command line implementation for StlyeStats
 *
 */

var program = require('commander');
var chalk = require('chalk');
var properties = require('properties');
var StyleStats = require('./stylestats.js');

var error = chalk.bold.red;

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config <path>', 'configuration file path')
    .option('-o, --output [value]', ' select output format. <json|properties>')
    .parse(process.argv);

if (!program.args.length) {
    console.log(error('No input paths specified.'));
    program.help();
}

var stats = new StyleStats(program.args[0]);
var result = stats.parse();
var output = JSON.stringify(result, null, 2);

switch (program.output) {
    case 'json':
        console.log(output);
        break;
    case 'properties':
        output = properties.stringify(result);
        console.log(output);
        break;
    default:
        output = output.replace(/(^\{\n)/g, '');
        output = output.replace(/(\{|\}|\"|\,|\[)/g, '');
        output = output.replace(/\s\]\n/g, '');
        console.log(output);
}