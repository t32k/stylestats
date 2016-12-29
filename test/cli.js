import fs from 'fs';
import {exec} from 'child_process';
import test from 'ava';

var cmds;
test.beforeEach(() => {
  cmds = ['node ./bin/cli.js', 'test/fixture/example.css', '-c test/fixture/cli/config.json'];
});

test.cb('It should return standard table format', t => {
  t.plan(1);
  exec(cmds.join(' '), function (err, stdout) {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/example.txt', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});

test.cb('It should return JSON format', t => {
  t.plan(1);
  cmds.push('--format', 'json');
  exec(cmds.join(' '), function (err, stdout) {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/example.json', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});

test.cb('It should return HTML format', t => {
  t.plan(1);
  cmds.push('--format', 'html');
  exec(cmds.join(' '), function (err, stdout) {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/example.html', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});

test.cb('It should return Markdown format', t => {
  t.plan(1);
  cmds.push('--format', 'md');
  exec(cmds.join(' '), function (err, stdout) {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/example.md', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});

test.cb('It should return CSV format', t => {
  t.plan(1);
  cmds.push('--format', 'csv');
  exec(cmds.join(' '), function (err, stdout) {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/example.csv', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});

test.cb('It should return custom template format', t => {
  t.plan(1);
  cmds.push('--template test/fixture/cli/template.hbs');
  exec(cmds.join(' '), function (err, stdout) {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/custom-template.html', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});
