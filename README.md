# [StyleStats](http://www.stylestats.org/) [![Build Status](https://secure.travis-ci.org/t32k/stylestats.svg?branch=master)](http://travis-ci.org/t32k/stylestats) [![Dependency Status](https://david-dm.org/t32k/stylestats.svg)](https://david-dm.org/t32k/stylestats) [![Coverage Status](http://img.shields.io/coveralls/t32k/stylestats.svg)](https://coveralls.io/r/t32k/stylestats) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo) 

## Installation

StyleStats works on Node.js `>=6.x`.

```
$ npm install -g stylestats
```

## Usage

```sh
$ stylestats path/to/stylesheet.css
StyleStats!
┌─────────────────────────────────┬──────────────────────────┐
│ Published                       │ June 14, 2017 10:35 AM   │
├─────────────────────────────────┼──────────────────────────┤
│ Paths                           │ path/to/stylesheet.css   │
├─────────────────────────────────┼──────────────────────────┤
│ Style Sheets                    │ 1                        │
├─────────────────────────────────┼──────────────────────────┤
│ Style Elements                  │ 0                        │
├─────────────────────────────────┼──────────────────────────┤
│ Size                            │ 240.0B                   │
├─────────────────────────────────┼──────────────────────────┤
│ Data URI Size                   │ 0                        │
├─────────────────────────────────┼──────────────────────────┤
│ Ratio of Data URI Size          │ 0                        │
├─────────────────────────────────┼──────────────────────────┤
│ Gzipped Size                    │ 158.0B                   │
├─────────────────────────────────┼──────────────────────────┤
│ Rules                           │ 7                        │
├─────────────────────────────────┼──────────────────────────┤
│ Selectors                       │ 12                       │
├─────────────────────────────────┼──────────────────────────┤
│ Simplicity                      │ 58.3%                    │
├─────────────────────────────────┼──────────────────────────┤
│ Average of Identifier           │ 1.250                    │
├─────────────────────────────────┼──────────────────────────┤
│ Most Identifier                 │ 3                        │
├─────────────────────────────────┼──────────────────────────┤
│ Most Identifier Selector        │ .foo .bar .baz           │
├─────────────────────────────────┼──────────────────────────┤
│ Average of Cohesion             │ 1.429                    │
├─────────────────────────────────┼──────────────────────────┤
│ Lowest Cohesion                 │ 2                        │
├─────────────────────────────────┼──────────────────────────┤
│ Lowest Cohesion Selector        │ .foo                     │
├─────────────────────────────────┼──────────────────────────┤
│ Total Unique Font Sizes         │ 2                        │
├─────────────────────────────────┼──────────────────────────┤
│ Unique Font Sizes               │ 12px                     │
│                                 │ 16px                     │
├─────────────────────────────────┼──────────────────────────┤
│ Total Unique Font Families      │ 0                        │
├─────────────────────────────────┼──────────────────────────┤
│ Unique Font Families            │ N/A                      │
├─────────────────────────────────┼──────────────────────────┤
│ Total Unique Colors             │ 3                        │
├─────────────────────────────────┼──────────────────────────┤
│ Unique Colors                   │ #333333                  │
│                                 │ #CCCCCC                  │
│                                 │ RED                      │
├─────────────────────────────────┼──────────────────────────┤
│ Total Unique Background Images  │ 0                        │
├─────────────────────────────────┼──────────────────────────┤
│ Unique Background Images        │ N/A                      │
├─────────────────────────────────┼──────────────────────────┤
│ ID Selectors                    │ 1                        │
├─────────────────────────────────┼──────────────────────────┤
│ Universal Selectors             │ 1                        │
├─────────────────────────────────┼──────────────────────────┤
│ Unqualified Attribute Selectors │ 1                        │
├─────────────────────────────────┼──────────────────────────┤
│ JavaScript Specific Selectors   │ 0                        │
├─────────────────────────────────┼──────────────────────────┤
│ Important Keywords              │ 1                        │
├─────────────────────────────────┼──────────────────────────┤
│ Float Properties                │ 1                        │
├─────────────────────────────────┼──────────────────────────┤
│ Properties Count                │ color: 4                 │
│                                 │ font-size: 3             │
│                                 │ margin: 2                │
│                                 │ float: 1                 │
├─────────────────────────────────┼──────────────────────────┤
│ Media Queries                   │ 0                        │
└─────────────────────────────────┴──────────────────────────┘
```

Specified css file will be analyzed.

```sh
# Providing multiple input is also supported.
$ stylestats foo.css bar.css baz.css
```

CSS files in specified directory will be analyzed.

```sh
$ stylestats path/to/dir
```

Glob input is supported (quotes are required).

```sh
$ stylestats 'path/**/*.css'
```

You can specify a remote CSS file.

```sh
$ stylestats https://t32k.me/wisteria/css/wisteria.css
```

If you specify an HTML page, StyleStats will analyze stylesheets and `style` elements.

```sh
$ stylestats https://t32k.me/
```

`--format` option outputs JSON and CSV.

```sh
$ stylestats foo.css -f <json|csv>
```

If you have __[gist](https://github.com/defunkt/gist)__ installed, you can upload StyleStats data to [GitHub Gist](https://gist.github.com/) with a one-liner command.

```sh
$ stylestats https://t32k.me/ > stats.txt && gist stats.txt
>> https://gist.github.com/anonymous/d6259fce3d80d2c71ebc7edc71c06088
```

## Metrics

![Metrics](http://i.imgur.com/oEABjEl.png)

### Simplicity

The __Simplicity__ is measured as __Rules__ divided by __Selectors__.

### Average of Identifier

The __Average of Identifier__ is measured as __Total Identifiers__ divided by __Selectors__.

### Average of Cohesion

The __Average of Cohesion__ is measured as __Total declarations__ divided by __Rules__.

### Lowest Cohesion

The __Lowest Cohesion__ metric is the number of selector declarations.

See also:

+ [SOLID CSS | Blog | Miller Medeiros](http://blog.millermedeiros.com/solid-css/)

### Unqualified Attribute Selectors

The __Unqualified Attribute Selectors__ metrics is the number of unqualified attribute selectors.

The following patterns will be counted:

```css
[type=text] {
    color: red;
}

.selected [type=text] {
    color: red;
}
```

The following patterns are considered to be okay and will not be counted:

```
/* unqualified attribute selector is not key */
.selected [type=text] a {
    color: red;
}
```

See also:

+ [Disallow unqualified attribute selectors · stubbornella/csslint Wiki](https://github.com/stubbornella/csslint/wiki/Disallow-unqualified-attribute-selectors)

### JavaScript Specific Selectors

The __JavaScript Specific Selectors__ metrics is the number of JavaScript-specific selectors, such as `js-*`. The selectors are only for JavaScript hooks; you should not to hang any presentation off them.

See also:

+ [About HTML semantics and front-end architecture – Nicolas Gallagher](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/#javascript-specific-classes)


### User Specified Selectors

The __User Specified Selectors__ metrics is the number of user-specified selectors. Default is `false`. For instance, you can count the number of components if you specify `"\\.component\\-"` using reqular expression in `.stylestatsrc` .


### Properties Count

The __Properties Count__ is the number of property declarations. The default is to display the top `10` properties.


## Configuration

You can configure StyleStats.

CLI:

```shell
$ stylestats -c path/to/.stylestatsrc
```

API:

```js
const StyleStats = require('stylestats');
const stats = new StyleStats('path/to/stylesheet.css', 'path/to/.stylestatsrc');
```

Default configuration is [here](assets/default.json).

Here is an example JSON to disable display gzipped size:

```
{
  "gzippedSize": false
}
```


## CLI Reference

Help:

```shell
$ stylestats --help

  Usage: stylestats [options] <file ...>

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -c, --config <path>    set configurations
    -f, --format <format>  set the output format <json|csv>
    -p, --prettify         prettify raw data
    -n, --number           show only numeral metrics
    -m, --mobile           set the mobile user agent
```

Example:

```shell
$ stylestats path/to/stylesheet.css -c .stylestatsrc
 StyleStats!
┌────────────────────────────┬────────┐
│ Style Sheets               │ 1      │
├────────────────────────────┼────────┤
│ Size                       │ 19.0KB │
├────────────────────────────┼────────┤
│ Gzipped Size               │ 3.7KB  │
├────────────────────────────┼────────┤
│ Total Unique Font Families │ 3      │
└────────────────────────────┴────────┘
```

### Integration

+ [Plot your data with Jenkins](https://github.com/t32k/stylestats/wiki/Plot-with-Jenkins)
+ [Plot your data with moniteur](https://github.com/t32k/stylestats/wiki/Plot-with-moniteur)
+ [Plot your data with Google Analytics](https://github.com/t32k/stylestats/wiki/Plot-with-Google-Analytics)

## API Reference

### `new StyleStats(stylesheet, [config])`

1. `stylesheet` Required `String|Array` Stylesheet's file path or its array.
2. `config` Optional `String|Object` Configuration JSON file path or object.

#### `config`

Config list is show to [default.json](https://github.com/t32k/stylestats/blob/master/assets/default.json)

### `StyleStats#parse()`

```javascript
const StyleStats = require('stylestats');
const stats = new StyleStats('path/to/stylesheet.css');

stats.parse()
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((err) => console.log(error));
```

### `StyleStats#prettify(result)`

1. `result` Required `Object` Result StyleStats parsed.

```javascript

=stats.parse()
  .then((result) => stats.prettify(result));
```

## Example

CSS example:

```css
* { float: left; }
body { color: #333; }
h1, h2, h3, h4, h5, h6 { margin: 0; }
a[src] { color: red !important; }
.foo { color: #ccc; font-size: 12px; }
.foo .bar .baz { color: #ccc; font-size: 12px; }
#bar { margin: 10px; font-size: 16px; }
```

Statistics tree of above css:

```json
{
  "published": "2017-06-14T10:24:30.124Z",
  "paths": [ "test/fixture/example.css" ],
  "stylesheets": 1,
  "styleElements": 0,
  "size": 240,
  "dataUriSize": 0,
  "ratioOfDataUriSize": 0,
  "gzippedSize": 158,
  "rules": 7,
  "selectors": 12,
  "simplicity": 0.5833333333333334,
  "averageOfIdentifier": 1.25,
  "mostIdentifier": 3,
  "mostIdentifierSelector": ".foo .bar .baz",
  "averageOfCohesion": 1.4285714285714286,
  "lowestCohesion": 2,
  "lowestCohesionSelector": [ ".foo" ],
  "totalUniqueFontSizes": 2,
  "uniqueFontSizes": [ "12px", "16px" ],
  "totalUniqueFontFamilies": 0,
  "uniqueFontFamilies": [],
  "totalUniqueColors": 3,
  "uniqueColors": [ "#333333", "#CCCCCC", "RED" ],
  "totalUniqueBackgroundImages": 0,
  "uniqueBackgroundImages": [],
  "idSelectors": 1,
  "universalSelectors": 1,
  "unqualifiedAttributeSelectors": 1,
  "javascriptSpecificSelectors": 0,
  "importantKeywords": 1,
  "floatProperties": 1,
  "propertiesCount": [
    { "property": "color", "count": 4 },
    { "property": "font-size", "count": 3 },
    { "property": "margin", "count": 2 },
    { "property": "float", "count": 1 }
  ],
  "mediaQueries": 0
}
```
