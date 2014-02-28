/**
 * Command line implementation for StlyeStats
 *
 */

var program = require('commander');
var chalk = require('chalk');
var StyleStats = require('./stylestats.js');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config <path>', 'configuration file path')
    .option('-o, --output <json|propety>', ' select output format.')
    .parse(process.argv);

var error = chalk.bold.red;

if (!program.args.length) {
    console.log(error('No input paths specified.'));
    program.help();
}

var stats = new StyleStats(program.args[0]);
var result = stats.parse();
var log = JSON.stringify(result, null, 1);
log = log.replace(/(^\{\n)/g, '');
log = log.replace(/(\{|\}|\"|\,|\[)/g, '');
log = log.replace(/\s\]\n/g, '');
console.log(log);