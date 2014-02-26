/*
 * stylestats
 * https://github.com//stylestats
 *
 * Copyright (c) 2014
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var _ = require('underscore');
var parse = require('css-parse');


var css = "body { \n background-color: #fff;\n } .a { \n color: #c00;\n margin: 10px;}";

var output_obj = parse(css);
// Print parsed object as CSS string
console.log(JSON.stringify(output_obj, null, 2));