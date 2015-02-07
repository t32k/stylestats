# [StyleStats](http://www.stylestats.org/) [![Build Status](https://secure.travis-ci.org/t32k/stylestats.svg?branch=master)](http://travis-ci.org/t32k/stylestats) [![Coverage Status](http://img.shields.io/coveralls/t32k/stylestats.svg)](https://coveralls.io/r/t32k/stylestats) [![Code Climate](http://img.shields.io/codeclimate/github/t32k/stylestats.svg)](https://codeclimate.com/github/t32k/stylestats) [![Dependency Status](https://david-dm.org/t32k/stylestats.svg)](https://david-dm.org/t32k/stylestats)

> StyleStats is a Node.js library to collect CSS statistics.

## Installation

StyleStats works on Node.js `0.10.x`

```
$ npm install -g stylestats
```

## Usage

```sh
$ stylestats path/to/stylesheet.css
StyleStats!
┌─────────────────────────────────┬────────────────┐
│ Style Sheets                    │ 1              │
├─────────────────────────────────┼────────────────┤
│ Size                            │ 240B           │
├─────────────────────────────────┼────────────────┤
│ Data URI Size                   │ 0              │
├─────────────────────────────────┼────────────────┤
│ Rules                           │ 7              │
├─────────────────────────────────┼────────────────┤
│ Selectors                       │ 12             │
├─────────────────────────────────┼────────────────┤
│ Simplicity                      │ 58.3%          │
├─────────────────────────────────┼────────────────┤
│ Most Identifier                 │ 3              │
├─────────────────────────────────┼────────────────┤
│ Most Identifier Selector        │ .foo .bar .baz │
├─────────────────────────────────┼────────────────┤
│ Lowest Cohesion                 │ 2              │
├─────────────────────────────────┼────────────────┤
│ Lowest Cohesion Selector        │ .foo           │
├─────────────────────────────────┼────────────────┤
│ Total Unique Font Sizes         │ 2              │
├─────────────────────────────────┼────────────────┤
│ Unique Font Size                │ 12px           │
│                                 │ 16px           │
├─────────────────────────────────┼────────────────┤
│ Total Unique Font Families      │ 0              │
├─────────────────────────────────┼────────────────┤
│ Unique Font Family              │ N/A            │
├─────────────────────────────────┼────────────────┤
│ Total Unique Colors             │ 3              │
├─────────────────────────────────┼────────────────┤
│ Unique Color                    │ #333333        │
│                                 │ #CCCCCC        │
│                                 │ RED            │
├─────────────────────────────────┼────────────────┤
│ ID Selectors                    │ 1              │
├─────────────────────────────────┼────────────────┤
│ Universal Selectors             │ 1              │
├─────────────────────────────────┼────────────────┤
│ Unqualified Attribute Selectors │ 1              │
├─────────────────────────────────┼────────────────┤
│ JavaScript Specific Selectors   │ 0              │
├─────────────────────────────────┼────────────────┤
│ Important Keywords              │ 1              │
├─────────────────────────────────┼────────────────┤
│ Float Properties                │ 1              │
├─────────────────────────────────┼────────────────┤
│ Properties Count                │ color: 4       │
│                                 │ font-size: 3   │
│                                 │ margin: 2      │
│                                 │ float: 1       │
├─────────────────────────────────┼────────────────┤
│ Media Queries                   │ 0              │
└─────────────────────────────────┴────────────────┘
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
$ stylestats http://t32k.me/static/blog/skelton.css
```

If you specify an HTML page, StyleStats will analyze stylesheets and `style` elements.

```sh
$ stylestats http://t32k.me/
```

`-t` option outputs JSON, HTML, Markdown and CSV.

```sh
$ stylestats foo.css -t [json|html|md|csv>]
```

If you have __[gist](https://github.com/defunkt/gist)__ installed, you can upload StyleStats data to [GitHub Gist](https://gist.github.com/9725673) with a one-liner command.

```sh
$ stylestats http://t32k.me/ -t html > stats.md && gist stats.md
https://gist.github.com/9725673
```

## Grunt & Gulp modules

- https://github.com/tvooo/grunt-stylestats by [@tvooo](https://github.com/tvooo)
- https://github.com/1000ch/gulp-stylestats by [@1000ch](https://github.com/1000ch)

## Metrics

![](http://i.imgur.com/zwtP6js.png)

### Simplicity

The __Simplicity__ is measured as __Rules__ divided by __Selectors__.

### Lowest Cohesion

The __Lowest Cohesion__ metric is the number of selector declarations.

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

+ [About HTML semantics and front-end architecture – Nicolas Gallagher](http://nicolasgallagher.com/about-html-semantics-front-end-architecture/#javascript-specific-classes)`


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
var StyleStats = require('stylestats');
var stats = new StyleStats('path/to/stylesheet.css', 'path/to/.stylestatsrc');
```

Default configuration is [here](assets/default.json).

Here is an example JSON to enable display gzipped size:

```
{
  "gzippedSize": true
}
```

`gzippedSize` attribute is `false` by default because it is pretty slow.


## CLI Reference


```shell
$ stylestats -h

  Usage: stylestats [options] <file ...>

  Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -c, --config [path]  Path and name of the incoming JSON file.
    -t, --type [format]  Specify the output format. <json|html|md|csv>
    -s, --simple         Show compact style log.
    -g, --gzip           Show gzipped file size.
    -n, --number         Show only numeral metrics.
    -u, --ua [OS]        Specify the user agent. <ios|android>
```

```shell
$ stylestats path/to/stylesheet.css -s -c path/to/.stylestatsrc
StyleStats!
┌───────────────────────────┬───────────────┐
│ Rules                     │ 7             │
│ Selectors                 │ 11            │
│ Lowest Cohesion           │ 6             │
│ Total Unique Font Sizes   │ 5             │
│ Total Unique Colors       │ 2             │
│ ID Selectors              │ 1             │
│ Important Keywords        │ 1             │
│ Media Queries             │ 1             │
└───────────────────────────┴───────────────┘
```

+ [Plot StyleStats data with Jenkins](https://github.com/t32k/stylestats/wiki/Plot-with-Jenkins)

## API Reference

### `new StyleStats(stylesheet, config)`

1. `stylesheet` Required `String|Array` Stylesheet file path or its array.
2. `config` Optional `String|Object` Configuration JSON file path or object.

### `StyleStats.parse(fn)`

```javascript
var StyleStats = require('stylestats');
var stats = new StyleStats('path/to/stylesheet.css');

stats.parse(function (error, result) {
  console.log(JSON.stringify(result, null, 2));
});
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
  "published": "2014-03-23T15:54:39.825Z",
  "paths": [ "test/fixture/example.css" ],
  "stylesheets": 1,
  "size": 240,
  "dataUriSize": 0,
  "rules": 7,
  "selectors": 12,
  "simplicity": 0.5833333333333334,
  "mostIdentifers": 3,
  "mostIdentifersSelector": ".foo .bar .baz",
  "lowestCohesion": 2,
  "lowestCohesionSelector": [ ".foo" ],
  "totalUniqueFontSizes": 2,
  "uniqueFontSize": [ "12px", "16px" ],
  "totalUniqueFontFamilies": 0,
  "uniqueFontFamily": [],
  "totalUniqueColors": 3,
  "uniqueColor": [ "#333333", "#CCCCCC", "RED" ],
  "idSelectors": 1,
  "universalSelectors": 1,
  "unqualifiedAttributeSelectors": 1,
  "javascriptSpecificSelectors": 0,
  "importantKeywords": 1,
  "floatProperties": 1,
  "mediaQueries": 0,
  "propertiesCount": [
    { "property": "color", "count": 4 },
    { "property": "font-size", "count": 3 },
    { "property": "margin", "count": 2 },
    { "property": "float", "count": 1 }
  ]
}
```

## Online Tool

We launched online tool for StyleStats!

+ [StyleStats](http://www.stylestats.org/)


# License

Code is released under [the MIT license](LICENSE).
