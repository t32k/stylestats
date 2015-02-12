var fs = require('fs');
var Mocha = require('mocha');
var assert = require('assert');


function parseSpecs(data) {
  var specs;
  // already an object
  if (typeof data === 'object') {
    return data;
  }
  // from file
  if (fs.existsSync(data) && fs.statSync(data).isFile()) {
    data = fs.readFileSync(data, 'utf8');
  }
  // from string
  try {
    specs = JSON.parse(data);
  } catch (e) {
    return new Error('SpecsParserError: ' + e.message);
  }
  return specs;
}

function buildSuite(defaults, tests) {
  describe(defaults.suiteName || 'StyleStats Test', function() {
    tests.forEach(function(test) {
      it(test.text, function() {
        if (test.result instanceof Error) {
          return assert.ifError(test.result);
        }
        assert(test.result);
      });
    });
  });
}

function buildTest(metric, spec, actual, defaults) {
  var operation, expected, result, text;

  // text
  text = defaults.text || spec.text ||
  '{metric}: {actual} should be {operation} {expected}';

  // operation
  if (typeof spec !== 'object') {
    operation = defaults.operation || '<';
    expected = spec;
  } else {
    if ('max' in spec) {
      operation = '<';
      expected = spec.max;
    }
    if ('min' in spec) {
      if (!operation) {
        operation = '>';
        expected = spec.min;
      } else {
        operation = '<>';
        expected = [spec.max, spec.min];
      }
    }
  }

  // test
  switch (operation) {
    case '<':
      result = actual < expected;
      operation = 'less than';
      break;
    case '>':
      result = actual > expected;
      operation = 'greater than';
      break;
    case '<>':
      result = actual < expected[0] && actual > expected[1];
      operation = 'less than ' + expected[0] + ' and greater than';
      expected = expected[1];
      break;
    default:
      result = actual === expected;
      operation = 'equal to';
  }

  // result
  text = text
    .replace('{metric}', metric)
    .replace('{actual}', actual)
    .replace('{operation}', operation)
    .replace('{expected}', expected);

  return {text: text, result: result};
}

function testRunner (results, specs) {

  var specs = parseSpecs(specs);
  var reporter = specs.defaults.reporter || 'spec';

  //console.log(specs);

  console.log(specs.defaults.reporter);
  // Mocha
  var mocha = new Mocha({ reporter: reporter });
  mocha.suite.emit('pre-require', global);

  // buildSuite(defaults, tests);

  describe('Array', function(){
    describe('#indexOf()', function(){
      it('should return -1 when the value is not present', function(){
        assert.equal(-1, [1,2,3].indexOf(5));
        assert.equal(-1, [1,2,3].indexOf(0));
      })
    })
  });

  mocha.run(function(failures) {
    process.exit(failures);
  });

}

module.exports = testRunner;
