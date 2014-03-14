![StyleStats](http://i.imgur.com/81kKnxH.png)

StyleStats is Node.js library collect css statistics.

[![Build Status](https://secure.travis-ci.org/t32k/stylestats.png?branch=master)](http://travis-ci.org/t32k/stylestats)
[![NPM version](https://badge.fury.io/js/stylestats.png)](http://badge.fury.io/js/stylestats)
[![Dependency Status](https://david-dm.org/t32k/stylestats.png)](https://david-dm.org/t32k/stylestats)
[![devDependency Status](https://david-dm.org/t32k/stylestats/dev-status.png)](https://david-dm.org/t32k/stylestats#info=devDependencies)


## Installation

Requires Node.js v`0.10.x`

```
$ npm install -g stylestats
```

## Usage


```sh
$ stylestats path/to/stylesheet.css
StyleStats!
┌─────────────────────────────────┬─────────────────────────────────────────┐
│ Stylesheets                     │ 1                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Size                            │ 518.0B                                  │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Rules                           │ 7                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Selectors                       │ 11                                      │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Simplicity                      │ 63.64%                                  │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Most Identifers                 │ 5                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Most Identifers Selector        │ .foo  .bar > .baz + .qux ~ .quux:before │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Lowest Cohesion                 │ 6                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Lowest Cohesion Selector        │ hr                                      │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Total Unique Font Sizes         │ 5                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Unique Font Size                │ 10px                                    │
│                                 │ 12px                                    │
│                                 │ 14px                                    │
│                                 │ 16px                                    │
│                                 │ 18px                                    │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Total Unique Colors             │ 2                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Unique Color                    │ #333                                    │
│                                 │ #CCC                                    │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Id Selectors                    │ 1                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Universal Selectors             │ 0                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Unqualified Attribute Selectors │ 1                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Important Keywords              │ 1                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Float Properties                │ 0                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Media Queries                   │ 1                                       │
├─────────────────────────────────┼─────────────────────────────────────────┤
│ Properties Count                │ font-size: 5                            │
│                                 │ margin: 4                               │
│                                 │ padding: 3                              │
│                                 │ color: 2                                │
│                                 │ display: 1                              │
│                                 │ height: 1                               │
│                                 │ border: 1                               │
│                                 │ border-top: 1                           │
└─────────────────────────────────┴─────────────────────────────────────────┘
```


StyleStats supports remote file analysis!!!

```sh
$ stylestats http://t32k.me/static/blog/skelton.css
```

StyleStats supports multiple input.

```sh
$ stylestats foo.css bar.css baz.css
```

`-e` option output JSON or CSV.

```sh
$ stylestats foo.css -e [json|csv]
```
## Metrics

![](http://i.imgur.com/qUvaK1B.png)

### Simplicity

The __Simplicity__ is measured as __Rules__ divided by __Selectors__.

### Lowest Cohesion

The __Lowest Cohesion__ metric is the number of selector declaration.

### Unqualified Attribute Selectors

The __Unqualified Attribute Selectors__ metric is the number of unqualified attribute selectors.

The following patterns will be counted:

```css
[type=text] {
    color: red;
}

.selected [type=text] {
    color: red;
}
```

The following patterns are considered as okay and will not be counted:

```
/* unqualified attribute selector is not key */
.selected [type=text] a {
    color: red;
}
```

See also:

+ [Disallow unqualified attribute selectors · stubbornella/csslint Wiki](https://github.com/stubbornella/csslint/wiki/Disallow-unqualified-attribute-selectors)

### Properties Count

The __Properties Count__ is number of property declaration. Default option is set to display the top `10` properties.


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

Default configuration is [here](lib/defaultOptions.js).

Here is an example of enabling display gzipped size:

```
{
  "gzippedSize": true
}
```

`gzippedSize` attribute is `false` by default. Because it is pretty slow.


## CLI Reference


```shell
$ stylestats -h

  Usage: stylestats [options] <file ...>

  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -c, --config [path]       Path and name of the incoming JSON file.
    -e, --extension [format]  Specify the format to convert. <json|csv>
    -s, --simple              Show compact style's log.
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
│ Id Selectors              │ 1             │
│ Important Keywords        │ 1             │
│ Media Queries             │ 1             │
└───────────────────────────┴───────────────┘
```

+ [Plot StyleStats data with Jenkins](https://github.com/t32k/stylestats/wiki/Plot-with-Jenkins)

## API Reference

### `new StyleStats(stylesheet, config)`

1. `stylesheet` Required `String|Array` Stylesheet file path or path's array.
2. `config` Optional `String|Object` Configuration's JSON file path or object.

### `StyleStats.parse(fn)`

```javascript
var StyleStats = require('stylestats');
var stats = new StyleStats('path/to/stylesheet.css');

stats.parse(function (result) {
  console.log(JSON.stringify(result, null, 2));
});
```

### Example

```css
body {
  color: #333;
  font-size: 14px;
}
h1, h2, h3, h4, h5, h6 {
  margin: 0;
  padding: 0;
  font-size: 18px;
}
section {
  margin: 10px;
  padding: 10px;
  font-size: 10px;
}
.foo  .bar > .baz + .qux ~ .quux:before {
  color: #ccc;
  font-size: 12px;
}
#foo [src] {
  margin: 10px;
  font-size: 16px;
}
/* Lowest Cohesion Selecotor */
hr {
  display: block;
  margin: 10px 0;
  padding: 0 !important;
  height: 1px;
  border: 0;
  border-top: 1px solid red;
}
@media (max-width: 600px) {
  .media-queries {
    display: none;
  }
}
```

Above the stylesheet's stats tree:

```json
{
  "stylesheets": 1,
  "size": 518,
  "rules": 7,
  "selectors": 11,
  "simplicity": 0.6363636363636364,
  "mostIdentifers": 5,
  "mostIdentifersSelector": ".foo  .bar > .baz + .qux ~ .quux:before",
  "lowestCohesion": 6,
  "lowestCohesionSelecotor": [ "hr" ],
  "totalUniqueFontSizes": 5,
  "uniqueFontSize": [ "10px","12px","14px","16px","18px" ],
  "totalUniqueColors": 2,
  "uniqueColor": [ "#333", "#CCC" ],
  "idSelectors": 1,
  "universalSelectors": 0,
  "unqualifiedAttributeSelectors": 1,
  "importantKeywords": 1,
  "floatProperties": 0,
  "mediaQueries": 1,
  "propertiesCount": [
    { "property": "font-size", "count": 5},
    { "property": "margin", "count": 4},
    { "property": "padding", "count": 3},
    { "property": "color", "count": 2},
    { "property": "display", "count": 1},
    { "property": "height", "count": 1},
    { "property": "border", "count": 1},
    { "property": "border-top", "count": 1}
  ]
}
```

## Online Tool

_(Coming soon)_


## Release History

+ v2.0.0: __API is changed:__ `StyleStats.parse()`. Add metrics.
+ v1.2.0: Support multiple input files.
+ v1.1.0: Add `universalSelectors` metrics.
+ v1.0.0: Major release.

# License

Code is released under [the MIT license](LICENSE).
