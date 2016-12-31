import fs from 'fs';
import {exec} from 'child_process';
import test from 'ava';

let cmds;
test.beforeEach(() => {
  cmds = ['node ./bin/cli.js', 'test/fixture/example.css', '-c test/fixture/cli/config.json'];
});

test.cb('It should return standard table format', t => {
  t.plan(1);
  exec(cmds.join(' '), (err, stdout) => {
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
  exec(cmds.join(' '), (err, stdout) => {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/example.json', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});

test.cb('It should return CSV format', t => {
  t.plan(1);
  cmds.push('--format', 'csv');
  exec(cmds.join(' '), (err, stdout) => {
    if (err) {
      t.fail();
    }
    const fixture = fs.readFileSync('test/fixture/cli/example.csv', 'utf-8');
    t.is(stdout, fixture);
    t.end();
  });
});
