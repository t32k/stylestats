'use strict';

var _ = require('underscore');
var fs = require('fs');
var async = require('async');
var request = require('request');
var cssParse = require('css-parse');

module.exports = function(callback) {

    // for callback
    var that = this;
    this.parseCallback = _.isFunction(callback) ? callback : function() {};

    this.files.forEach(function(file) {
        this.styles.push(fs.readFileSync(file, {
            encoding: "utf-8"
        }));
    }, this);

    async.eachSeries(this.urls, function iterator(url, next) {
        request.get(url, function(error, response, body) {
            if (error) {
                throw error;
            }
            if (response.statusCode !== 200) {
                throw new Error('Status code is ' + response.statusCode);
            }
            that.styles.push(body);
            next();
        });
    }, function() {

        that.cssString = that.styles.join('');
        that.cssSize = Buffer.byteLength(that.cssString, 'utf8');

        var rawRules = cssParse(that.cssString).stylesheet.rules;
        var processedRules = [];
        var processedSelectors = [];
        var processedDeclarations = [];

        rawRules.forEach(function(rule) {
            if (rule.type === 'rule') {
                processedRules.push(rule);
                rule.selectors.forEach(function(selector) {
                    processedSelectors.push(selector);
                });
                rule.declarations.forEach(function(declaration) {
                    if (declaration.type === 'declaration') {
                        processedDeclarations.push(declaration);
                    }
                });
            } else if (rule.type === 'media') {
                that.mediaQueries += 1;
                rule.rules.forEach(function(rule) {
                    if (rule.type === 'rule') {
                        processedRules.push(rule);
                        rule.selectors.forEach(function(selector) {
                            processedSelectors.push(selector);
                        });
                        rule.declarations.forEach(function(declaration) {
                            if (declaration.type === 'declaration') {
                                processedDeclarations.push(declaration);
                            }
                        });
                    }
                });
            }
        });

        that.rules = processedRules;
        that.selectors = processedSelectors;
        that.declarations = processedDeclarations;

        var stats = {};
        var options = that.options;
        var selectors = that.parseSelectors();
        var declarations = that.parseDeclarations();

        if (options.stylesheets) {
            stats.stylesheets = that.stylesheets;
        }
        if (options.size) {
            stats.size = that.cssSize;
        }
        if (options.dataUriSize) {
            stats.dataUriSize = declarations.dataUriSize;
        }
        if (options.dataUriSize && options.raitoOfDataUriSize && declarations.dataUriSize !== 0) {
            stats.raitoOfDataUriSize = declarations.dataUriSize / that.cssSize;
        }
        if (options.gzippedSize) {
            stats.gzippedSize = that.getGzippedSize();
        }
        if (options.rules) {
            stats.rules = that.rules.length;
        }
        if (options.selectors) {
            stats.selectors = that.selectors.length;
        }
        if (options.rules && options.selectors && options.simplicity) {
            stats.simplicity = stats.rules / stats.selectors;
        }
        // Most Identifer
        var mostIdentifer = selectors.identifiers.shift();
        if (mostIdentifer && options.mostIdentifers) {
            stats.mostIdentifers = mostIdentifer.count;
        }
        if (mostIdentifer && options.mostIdentifersSelector) {
            stats.mostIdentifersSelector = mostIdentifer.selector;
        }
        // Sort property count.
        var declarationCount = that.getDeclarationCount();
        declarationCount.sort(function(a, b) {
            return b.count - a.count;
        });
        var lowestDefinition = declarationCount.shift();
        if (lowestDefinition && options.lowestCohesion) {
            stats.lowestCohesion = lowestDefinition.count;
        }
        if (lowestDefinition && options.lowestCohesionSelector) {
            stats.lowestCohesionSelector = lowestDefinition.selector;
        }
        if (options.totalUniqueFontSizes) {
            stats.totalUniqueFontSizes = declarations.uniqueFontSize.length;
        }
        if (options.uniqueFontSize) {
            stats.uniqueFontSize = declarations.uniqueFontSize;
        }
        if (options.totalUniqueColors) {
            stats.totalUniqueColors = declarations.uniqueColor.length;
        }
        if (options.uniqueColor) {
            stats.uniqueColor = declarations.uniqueColor;
        }
        if (options.idSelectors) {
            stats.idSelectors = selectors.idSelectors;
        }
        if (options.universalSelectors) {
            stats.universalSelectors = selectors.universalSelectors;
        }
        if (options.unqualifiedAttributeSelectors) {
            stats.unqualifiedAttributeSelectors = selectors.unqualifiedAttributeSelectors;
        }
        if (options.javascriptSpecificSelectors) {
            stats.javascriptSpecificSelectors = selectors.javascriptSpecificSelectors;
        }
        if (options.importantKeywords) {
            stats.importantKeywords = declarations.importantKeywords;
        }
        if (options.floatProperties) {
            stats.floatProperties = declarations.floatProperties;
        }
        if (options.mediaQueries) {
            stats.mediaQueries = that.mediaQueries;
        }
        if (options.propertiesCount) {
            stats.propertiesCount = declarations.properties.slice(0, options.propertiesCount);
        }
        that.parseCallback(stats);
    });
};