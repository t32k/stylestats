import test from 'ava';
import StyleStats from '../lib/stylestats';

let result;
test.before(async () => {
  const stats = new StyleStats('test/fixture/test.css');
  result = await stats.parse();
});

test('It should return stylesheets count', t => {
  t.is(result.stylesheets, 1);
});

test('It should return style elements count', t => {
  t.is(result.styleElements, 0);
});

test('It should return file size', t => {
  t.is(result.size, 753);
});

test('It should return data URI size', t => {
  t.is(result.dataUriSize, 82);
});

test('It should return ratio of data URI size', t => {
  t.is(result.ratioOfDataUriSize, 0.10889774236387782);
});

test('It should return Gzipped Size', t => {
  t.is(result.gzippedSize, 429);
});

test('It should return css rules', t => {
  t.is(result.rules, 10);
});

test('It should return css selectors', t => {
  t.is(result.selectors, 15);
});

test('It should return declarations', t => {
  t.is(result.declarations, 23);
});

test('It should return simplicity', t => {
  t.is(result.simplicity, 0.6666666666666666);
});

test('It should return average of identifier', t => {
  t.is(result.averageOfIdentifier, 1.4666666666666666);
});

test('It should return most identifier', t => {
  t.is(result.mostIdentifier, 6);
});

test('It should return most identifier selector', t => {
  t.is(result.mostIdentifierSelector, '.foo  .bar > .baz + .qux ~ .quux:before');
});

test('It should return average of cohesion', t => {
  t.is(result.averageOfCohesion, 2.4);
});

test('It should return lowest cohesion', t => {
  t.is(result.lowestCohesion, 8);
});

test('It should return lowest cohesion selector', t => {
  t.is(result.lowestCohesionSelector[0], 'hr');
});

test('It should return total unique font sizes', t => {
  t.is(result.totalUniqueFontSizes, 5);
});

test('It should return Unique Font Sizes', t => {
  t.is(result.uniqueFontSizes[0], '10px');
});

test('It should return total unique font families', t => {
  t.is(result.totalUniqueFontFamilies, 0);
});

test('It should return total unique colors', t => {
  t.is(result.totalUniqueColors, 2);
});

test('It should return unique colors', t => {
  t.is(result.uniqueColors[0], '#333333');
});

test('It should return total unique background images', t => {
  t.is(result.totalUniqueBackgroundImages, 1);
});

test('It should return unique background images', t => {
  t.is(result.uniqueBackgroundImages[0], 'data:image/gif;base64,R0lGODlhAQABAIAAAP//////zCH5BAEHAAAALAAAAAABAAEAAAICRAEAOw==');
});

test('It should return id selectors', t => {
  t.is(result.idSelectors, 1);
});

test('It should return universal selectors', t => {
  t.is(result.universalSelectors, 1);
});

test('It should return unqualified attribute selectors', t => {
  t.is(result.unqualifiedAttributeSelectors, 1);
});

test('It should return JavaScript specific selectors', t => {
  t.is(result.javascriptSpecificSelectors, 1);
});

test('It should return important keywords', t => {
  t.is(result.importantKeywords, 1);
});

test('It should return float properties', t => {
  t.is(result.floatProperties, 1);
});

test('It should return properties count', t => {
  t.is(result.propertiesCount[0].count, 5);
});

test('It should return media queries"', t => {
  t.is(result.mediaQueries, 1);
});
