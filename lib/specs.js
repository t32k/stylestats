/* global describe, it */

const fs = require('fs');
const Mocha = require('mocha');
const assert = require('assert');

function parseSpecs(data) {
  let specs;
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
  } catch (error) {
    return new Error(`SpecsParserError: ${error.message}`);
  }
  return specs;
}

function buildSuite(specs, tests) {
  describe(specs.defaults.suiteName || 'StyleStats Test', () => {
    tests.forEach((test) => {
      it(test.text, () => {
        if (test.result instanceof Error) {
          return assert.ifError(test.result);
        }
        assert(test.result);
      });
    });
  });
}

function buildTest(metric, spec, actual, defaults) {
  let operation, expected, result, text;
  // text
  const defaultText = '{metric}: {actual} should be {operation} {expected}';
  text = defaults.text || spec.text || defaultText;
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
      operation = `less than ${expected[0]} and greater than`;
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
  return {text, result};
}

function testRunner(results, specs) {
  const testSpecs = parseSpecs(specs);
  const reporter = testSpecs.defaults.reporter || 'spec';
  const defaults = testSpecs.defaults || {};
  const tests = [];
  const path = [];

  function traverse(specs, data) {
    Object.keys(specs).forEach((key) => {
      // bail on default
      if (key === 'defaults' && !path.length) {
        return;
      }
      if (key === 'results') {
        path.push(key);
        traverse(specs[key], data);
        return;
      }
      if (data[key] === 'undefined') {
        tests.push({text: path.join('.'), result: new Error('not found')});
        path.pop();
        return;
      }
      if (typeof data[key] === 'object') {
        traverse(specs[key], data[key]);
      } else {
        path.push(key);
        tests.push(buildTest(path.join('.'), specs[key], data[key], defaults));
        path.pop();
      }
    });
  }

  traverse(specs, results);
  // Mocha
  const mocha = new Mocha({reporter});
  mocha.suite.emit('pre-require', global);
  buildSuite(specs, tests);
  mocha.run((failures) => {
    process.exit(failures);
  });
}

module.exports = testRunner;
