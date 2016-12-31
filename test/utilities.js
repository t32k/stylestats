import fs from 'fs';
import test from 'ava';
import util from '../lib/util';
import prettify from '../lib/prettify';

test('It should return true if specified path is a file', t => {
  const result = util.isFile('test/fixture/app.css');
  t.is(result, true);
});

test('It should return false if specified path is not a file', t => {
  const result = util.isFile('test/fixture/not_exist.css');
  t.is(result, false);
});

test('It should return true if specified path is a directory', t => {
  const result = util.isDirectory('test/fixture/');
  t.is(result, true);
});

test('It should return false if specified path is not a directory', t => {
  const result = util.isDirectory('test/fixture/not_exist/');
  t.is(result, false);
});

test('It should return true if specified path is CSS string', t => {
  const result = util.isCSS('.foo{}');
  t.is(result, true);
});

test('It should return false if specified path is not CSS string', t => {
  const result = util.isCSS('.bar{');
  t.is(result, false);
});

const json = fs.readFileSync('test/fixture/result.json', {encoding: 'utf8'});
const result = prettify(JSON.parse(json));

test('It should return "Style Sheets" value', t => {
  t.is(result['Style Sheets'], 2);
});

test('It should return "Gzipped Size" value', t => {
  t.is(result['Gzipped Size'], '2.0KB');
});

test('It should return "Simplicity" value', t => {
  t.is(result.Simplicity, '49.2%');
});

test('It should return "Unique Colors" value', t => {
  t.is(result['Unique Colors'], '#0FA0CE\n#1EAEDB\n#222222\n#333333\n#555555\n#FFFFFF');
});

test('It should return "Properties Count" value', t => {
  t.is(result['Properties Count'], 'width: 20\nmargin-left: 18\nfont-size: 17\nline-height: 9\npadding: 9\nmargin-bottom: 8\nletter-spacing: 7\ncolor: 7\nbox-sizing: 6\ndisplay: 6');
});

