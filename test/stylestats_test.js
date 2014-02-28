'use strict';

var stylestats = require('../lib/stylestats.js');

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

var stats = stylestats('test/fixture/test.css');

exports.stylestats = {

    setUp: function(done) {
        // setup here
        done();
    },
    'size': function(test) {
        test.expect(1);
        // tests here
        test.equal(stats.size, 278, 'should display filesize.');
        test.done();
    }
};

console.log(JSON.stringify(stats, null, 2));