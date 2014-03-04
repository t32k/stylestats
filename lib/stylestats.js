/*
 * stylestats
 * https://github.com/t32k/stylestats
 *
 * Copyright (c) 2014
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var gzipSize = require('gzip-size');
var cssParse = require('css-parse');

_.str = require('underscore.string');
_.mixin(_.str.exports());
_.str.include('Underscore.string', 'string');

function _isFile() {
    var file = path.join.apply(path, arguments);
    return fs.existsSync(file) && fs.statSync(file).isFile();
}

function _isDirectory() {
    var dir = path.join.apply(path, arguments);
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

function StyleStats(filePath, options) {
    if (!_isFile(filePath) && path.extname(filePath) !== '.css') {
        throw new Error(filePath + ' is not css file.')
    }
    this.cssPath = filePath;
    this.cssString = fs.readFileSync(filePath, {
        encoding: "utf-8"
    });
    this.rules = cssParse(this.cssString).stylesheet.rules;

    var defaultOpts = {
        "size": true,
        "gzippedSize": false,
        "simplicity": true,
        "rules": true,
        "selectors": true,
        "lowestCohesion": true,
        "lowestCohesionSelecotor": true,
        "totalUniqueFontSizes": true,
        "uniqueFontSize": true,
        "totalUniqueColors": true,
        "uniqueColor": true,
        "importantKeywords": true,
        "propertiesCount": true
    };
    var customOpts;
    if (options) {
        customOpts = JSON.parse(fs.readFileSync(options, {
            encoding: "utf-8"
        }));
    } else {
        customOpts = {};
    }
    this.options = _.extend(defaultOpts, customOpts)
}

StyleStats.prototype.getSize = function() {
    return fs.statSync(this.cssPath).size;
};

StyleStats.prototype.getGzippedSize = function() {
    return gzipSize.sync(this.cssString);
};

StyleStats.prototype.getRulesCount = function() {
    return this.rules.length;
};

StyleStats.prototype.getSelectorCount = function() {
    var count = 0;
    this.rules.forEach(function(rule) {
        if (Array.isArray(rule.selectors)) {
            count += rule.selectors.length;
        }
    });
    return count;
};

StyleStats.prototype.getUniqueFont = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.property.indexOf('font-size') > -1) {
                    array.push(_.trim(declaration.value, '!important'));
                }
            });
        }
    });
    return _.unique(array);
};

StyleStats.prototype.getUniqueColor = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.property.indexOf('color') > -1) {
                    var color = declaration.value.replace(/\!important/, '');
                    color = color.toUpperCase();
                    array.push(color);
                }
            });
        }
    });
    return _.unique(array);
};

StyleStats.prototype.getDeclarationCount = function() {
    var array = [];
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            array.push([rule.selectors, rule.declarations.length]);
        }
    });
    return array;
};

StyleStats.prototype.getImportantKeywords = function() {
    var count = 0;
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (declaration.value.indexOf('\!important') > -1) {
                    count += 1;
                }
            });
        }
    });
    return count;
};

StyleStats.prototype.getProperty = function() {
    var propMap = {};
    this.rules.forEach(function(rule) {
        if (rule.declarations !== undefined) {
            rule.declarations.forEach(function(declaration) {
                if (propMap[declaration.property]) {
                    propMap[declaration.property] += 1;
                } else {
                    propMap[declaration.property] = 1;
                }
            });
        }
    });
    return propMap;
};

StyleStats.prototype.parse = function() {

    var stats = {};
    var opts = this.options;

    // Sort font size.
    var uniqueFont = this.getUniqueFont();
    var uniqueFontSize = _.sortBy(uniqueFont.slice(), function(item) {
        return item.replace(/[^0-9\.]/g, '') - 0;
    });

    // Sort color.
    var uniqueColor = _.sortBy(this.getUniqueColor());

    // Sort property count.
    var declarationCount = this.getDeclarationCount();
    declarationCount.sort(function(a, b) {
        return b[1] - a[1]
    })


    if (opts.size) {
        _.extend(stats, {
            size: this.getSize()
        });
    }
    if (opts.gzippedSize) {
        _.extend(stats, {
            gzippedSize: this.getGzippedSize()
        });
    }
    if (opts.rules) {
        var rules = this.getRulesCount();
        _.extend(stats, {
            rules: rules
        });
    }
    if (opts.selectors) {
        var selectors = this.getSelectorCount();
        _.extend(stats, {
            selectors: selectors
        });
    }
    if (opts.simplicity) {
        _.extend(stats, {
            simplicity: rules / selectors
        });
    }
    if (opts.lowestCohesion) {
        _.extend(stats, {
            lowestCohesion: declarationCount[0][1]
        });
    }
    if (opts.lowestCohesionSelecotor) {
        _.extend(stats, {
            lowestCohesionSelecotor: declarationCount[0][0]
        });
    }
    if (opts.uniqueFontSize) {
        _.extend(stats, {
            uniqueFontSize: uniqueFontSize
        });
    }
    if (opts.totalUniqueColors) {
        _.extend(stats, {
            totalUniqueColors: uniqueColor.length
        });
    }
    if (opts.uniqueColor) {
        _.extend(stats, {
            uniqueColor: uniqueColor
        });
    }
    if (opts.importantKeywords) {
        _.extend(stats, {
            importantKeywords: this.getImportantKeywords()
        });
    }
    if (opts.propertiesCount) {
        var properties = this.getProperty();
        var propertiesCount = [];
        Object.keys(properties).forEach(function(key) {
            propertiesCount.push([key, properties[key]])
        });
        propertiesCount.sort(function(a, b) {
            return b[1] - a[1]
        })
        _.extend(stats, {
            propertiesCount: propertiesCount
        });
    }

    return stats;
};

module.exports = StyleStats;