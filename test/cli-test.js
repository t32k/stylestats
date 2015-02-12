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
    cmds.push('--type', 'json');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.json', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return HTML format', function(done) {
    cmds.push('--type', 'html');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.html', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return custom HTML format', function(done) {
    cmds.push('--type', 'html');
    cmds.push('--template', 'test/fixture/cli/custom.template');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/custom.html', 'utf-8');
      stdout = stdout.replace(/\s/g, '');
      fixture = fixture.replace(/\s/g, '');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return error message if given template file is not found', function(done) {
    cmds.push('--type', 'html');
    cmds.push('--template', 'foo/bar.template');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      assert.equal(stdout, " [ERROR] ENOENT, no such file or directory 'foo/bar.template'\n")
      done();
    });
  });

  it('should return Markdown format', function(done) {
    cmds.push('--type', 'md');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.md', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

  it('should return CSV format', function(done) {
    cmds.push('--type', 'csv');
    exec(cmds.join(' '), function(error, stdout, stderr) {
      var fixture = fs.readFileSync('test/fixture/cli/example.csv', 'utf-8');
      assert.equal(stdout, fixture);
      done();
    });
  });

});
