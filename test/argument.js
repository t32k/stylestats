import test from 'ava';
import StyleStats from '../lib/stylestats';

test('It should throw error if invalid argument is specified', async t => {
  const stats = new StyleStats('xxxxxxxxxxxx');
  const err = await t.throws(stats.parse());
  t.is(err.message, 'Rule is not found.');
});

test('It should return gzipped size if configuration file is specified', async t => {
  const stats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
  const result = await stats.parse();
  t.is(result.gzippedSize, 429);
});

test('It should return User Specified Selectors if configuration file is specified', async t => {
  const stats = new StyleStats('test/fixture/test.css', 'test/fixture/.stylestatsrc');
  const result = await stats.parse();
  t.is(result.userSpecifiedSelectors, 1);
});

test('It should throw error if specified configuration file is invalid', t => {
  const err = t.throws(() => {
    const stats = new StyleStats('test/fixture/test.css', 'test/fixture/.invalidrc');
    stats.parse();
  }, SyntaxError);
  t.is(err.message, 'Unexpected token } in JSON at position 718');
});

test('It should return gzipped size if option object is given', async t => {
  const stats = new StyleStats('test/fixture/test.css', {gzippedSize: true});
  const result = await stats.parse();
  t.is(result.gzippedSize, 429);
});

test('It should return file size if CSS URL is given', async t => {
  const stats = new StyleStats('https://t32k.me/static/assets/css/main.css');
  const result = await stats.parse();
  t.is(result.size, 48);
});

test('It should throw error if CSS of specified URL is invalid', async t => {
  const stats = new StyleStats('https://t32k.me/static/assets/css/invalid.css');
  const err = await t.throws(stats.parse());
  t.is(err.message, 'Error: undefined:1:6: missing \'{\'');
});

test('It should throw error if invalid JSON URL is given', async t => {
  const stats = new StyleStats('https://t32k.me/static/assets/json/foo.json');
  const err = await t.throws(stats.parse());
  t.is(err.message, 'Content type is not HTML or CSS!');
});

test('It should return the number of stylesheets if site URL is given', async t => {
  const stats = new StyleStats('https://t32k.me/');
  const result = await stats.parse();
  t.is(result.stylesheets, 2);
});

test('It should return file size if directory as an argument is given', async t => {
  const stats = new StyleStats('test/fixture/');
  const result = await stats.parse();
  t.is(result.size, 20462);
});

test('It should return specified files size if glob is specified', async t => {
  const stats = new StyleStats('test/**/*.css');
  const result = await stats.parse();
  t.is(result.size, 39931);
});

test('It should return the number of stylesheets if multiple files are specified', async t => {
  const stats = new StyleStats(['test/fixture/test.css', 'test/fixture/app.css']);
  const result = await stats.parse();
  t.is(result.stylesheets, 2);
});

test('It should return 0 as the number of stylesheets', async t => {
  const stats = new StyleStats('body{color:green}');
  const result = await stats.parse();
  t.is(result.stylesheets, 0);
});

test('It should return bytes of css strings', async t => {
  const stats = new StyleStats('body{color:green}');
  const result = await stats.parse();
  t.is(result.size, 17);
});

test('It should return prettified data', async t => {
  const stats = new StyleStats('body{color:green}');
  let result = await stats.parse();
  result = stats.prettify(result);
  t.is(result.Simplicity, '100.0%');
});
