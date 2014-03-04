# stylestats 

[![Build Status](https://secure.travis-ci.org/t32k/stylestats.png?branch=master)](http://travis-ci.org/t32k/stylestats)
[![NPM version](https://badge.fury.io/js/stylestats.png)](http://badge.fury.io/js/stylestats)
[![Dependency Status](https://david-dm.org/t32k/stylestats.png)](https://david-dm.org/t32k/stylestats)
[![devDependency Status](https://david-dm.org/t32k/stylestats/dev-status.png)](https://david-dm.org/t32k/stylestats#info=devDependencies)

> Stylestats is a efficient Node.js library for keeping stylesheet statistics.

__This is alpha version, yet.__


```
 ____  _         _      ____  _        _       _ 
/ ___|| |_ _   _| | ___/ ___|| |_ __ _| |_ ___| |
\___ \| __| | | | |/ _ \___ \| __/ _` | __/ __| |
 ___) | |_| |_| | |  __/___) | || (_| | |_\__ \_|
|____/ \__|\__, |_|\___|____/ \__\__,_|\__|___(_)
           |___/                                 
```

## Installation

```
$ npm install stylestats
```

## Usage

### API

```javascript
var StyleStats = require('stylestats');
var stats = new StyleStats('path/to/stylesheet.css');

console.log(JSON.stringify(stats.parse(), null, 2));
```

#### Example

stats tree:

```json
{
  "size": 278,
  "gzippedSize": 89,
  "simplicity": 0.8571428571428571,
  "rules": 6,
  "selectors": 7,
  "lowestCohesion": 3,
  "lowestCohesionSelecotor": [
    ".foo .bar"
  ],
  "totalUniqueFontSizes": 4,
  "uniqueFontSize": [
    "10px",
    "12px",
    "14px",
    "16px"
  ],
  "totalUniqueColors": 1,
  "uniqueColor": [
    "#CCC"
  ],
  "importantKeywords": 2,
  "propertiesCount": [
    [ "margin", 4 ],
    [ "padding", 2 ],
    [ "color", 1 ]
  ]
}
```


### CLI

```shell
$ stylestats -h

  Usage: cli.js [options] <file ...>

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -c, --config [path]    Path and name of the incoming JSON file.
    -e, --extension [format]  Specify the format to convert. [json|csv]
```

```shell
$ stylestats path/to/stylesheet.css

 StyleStats!
┌───────────────────────────┬────────────────────┐
│ Size                      │ 278 B              │
├───────────────────────────┼────────────────────┤
│ Gzipped Size              │ 89 B               │
├───────────────────────────┼────────────────────┤
│ Simplicity                │ 0.8571428571428571 │
├───────────────────────────┼────────────────────┤
│ Rules                     │ 6                  │
├───────────────────────────┼────────────────────┤
│ Selectors                 │ 7                  │
├───────────────────────────┼────────────────────┤
│ Lowest Cohesion           │ 3                  │
├───────────────────────────┼────────────────────┤
│ Lowest Cohesion Selecotor │ .foo .bar          │
├───────────────────────────┼────────────────────┤
│ Total Unique Font Sizes   │ 4                  │
├───────────────────────────┼────────────────────┤
│ Unique Font Size          │ 10px               │
│                           │ 12px               │
│                           │ 14px               │
│                           │ 16px               │
├───────────────────────────┼────────────────────┤
│ Total Unique Colors       │ 1                  │
├───────────────────────────┼────────────────────┤
│ Unique Color              │ #CCC               │
├───────────────────────────┼────────────────────┤
│ Important Keywords        │ 2                  │
├───────────────────────────┼────────────────────┤
│ Properties Count          │ margin,4           │
│                           │ font-size,4        │
│                           │ padding,2          │
│                           │ color,1            │
│                           │ content,1          │
└───────────────────────────┴────────────────────┘
```


### Online Tool

_(Coming soon)_


# License

The MIT License

Copyright (c) 2014 Koji Ishimoto <ijok.ijok@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
