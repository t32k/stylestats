/**
 * Command line implementation for StlyeStats
 *
 */

var Table = require('cli-table');
var program = require('commander');
var properties = require('properties');
var prettyBytes = require('pretty-bytes');

var _ = require('underscore');
_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

var StyleStats = require('./stylestats');

program
    .version(require('../package.json').version)
    .usage('[options] <file ...>')
    .option('-c, --config [path]', 'Path and name of the incoming json file.')
    .option('-o, --output [format]', ' Specify the format to convert. <json|properties>')
    .parse(process.argv);

if (!program.args.length) {
    console.log('\n No input paths specified.');
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
        prettyLog();
}

function prettyLog() {

    // Object.keys(result).forEach(function(key) {
    //     var outValue = result[key];
    //     if (key === 'size' || key === 'gzippedSize') {
    //         outValue = bytes(outValue).toUpperCase();
    //     }
    //     if (key === 'uniqueFontSize' || key === 'uniqueColor') {
    //         outValue = outValue.join(', ');
    //     }
    //     if (key === 'propertiesCount') {
    //         outValue = outValue.map(function(arry) {
    //             return arry.join(': ')
    //         }).join('\n    ').replace(/^/, '\n    ');
    //     }
    //     console.log(
    //         '  ' + _(_(key).humanize()).titleize() + ': ' + chalk.bold(outValue)
    //     );
    // });

    console.log('\n StyleStats!');

    var table = new Table({
        //head: ['StyleStats!', ''],
        style: {
            //compact: true,
            //colWidths: [30, 10]
            head: ['cyan']
        }
    });

    Object.keys(result).forEach(function(key) {
        var obj = {};
        if (key === 'uniqueFontSize' || key === 'uniqueColor' || key === 'propertiesCount') {
            obj[_(_(key).humanize()).titleize()] = result[key].join('\n').replace(/(\, )$2/, '\n');
        } else if (key === 'size' || key === 'gzippedSize') {
            obj[_(_(key).humanize()).titleize()] = prettyBytes(result[key]).toUpperCase();
        } else {
            obj[_(_(key).humanize()).titleize()] = result[key]
        }

        table.push(obj);
    });

    console.log(table.toString());

    // joinの任意の番号
    // CLI-tableの色変更
}