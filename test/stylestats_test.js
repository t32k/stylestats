'use strict';

var StyleStats = require('../lib/stylestats.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/
var stats = new StyleStats('test/fixture/test.css');
var result;

exports.stylestats = {
    setUp: function(done) {
        result = stats.parse();
        done();
    },
    log: function(test) {
        console.log('\n' + JSON.stringify(result, null, 2));
        test.done();
    },
    size: function(test) {
        test.expect(1);
        test.equal(result.size, 278, 'should display file size.');
        test.done();
    },
    rules: function(test) {
        test.expect(1);
        test.equal(result.rules, 6, 'should parse stylesheet.');
        test.done();
    }
};