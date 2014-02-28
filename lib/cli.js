/**
 * Command line implementation for StlyeStats
 *
 */

var _ = require('underscore');
var chalk = require('chalk');
var bytes = require('bytes');
var program = require('commander');
var properties = require('properties');

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

var StyleStats = require('./stylestats');

var error = chalk.bold.red;

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'Path and name of the incoming json file.')
    .option('-o, --output [format]', ' Specify the format to convert. <json|properties>')
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
        prettyOutput();
}

function prettyOutput() {
    console.log(
        chalk.bgCyan('                                               ') +
        chalk.cyan.bold(' StyleStats! ') +
        chalk.bgCyan('   ')
    );
    Object.keys(result).forEach(function(key) {
        var outValue = result[key];
        if (key === 'size' || key === 'gzippedSize') {
            outValue = bytes(outValue).toUpperCase();
        }
        if (key === 'uniqueFontSize') {
            outValue = outValue.join(', ');
        }
        if (key === 'propertiesCount') {
            outValue = outValue.map(function(arry) {
                return arry.join(': ')
            }).join('\n    ').replace(/^/, '\n    ');
        }
        console.log(
            '  ' + _(_(key).humanize()).titleize() + ': ' + chalk.bold(outValue)
        );
    });
}