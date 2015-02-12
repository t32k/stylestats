var assert = require('assert');
var fs = require('fs');
var exec = require('child_process').exec;
var StyleStats = require('../lib/stylestats.js');

describe('Command line test', function() {

  var cmds;
  var test = 'test/fixture/example.css';
  var config = '-c test/fixture/cli/config.json';

  beforeEach(function () {
    cmds = ['node ./bin/cli.js'];
    cmds.push(test, config);
  });

  it('should return standard table format', function(done) {
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.txt', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return JSON format', function(done) {
    cmds.push('--format', 'json');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.json', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return HTML format', function(done) {
    cmds.push('--format', 'html');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.html', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return Markdown format', function(done) {
    cmds.push('--format', 'md');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.md', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return CSV format', function(done) {
    cmds.push('--format', 'csv');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.csv', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

});
