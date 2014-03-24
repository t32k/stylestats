var _ = require('underscore');
var gzipSize = require('gzip-size');

/**
 * Analyzer
 * @param rules
 * @param selectors
 * @param declarations
 * @constructor
 */
function Analyzer(rules, selectors, declarations, cssString, cssSize, options) {

    // array of rule
    // referenced in analyzeRules
    this.rules = rules;

    // array of css selector
    // referenced in analyzeSelectors
    this.selectors = selectors;

    // array of css declaration
    // referenced in analyzeDeclarations
    this.declarations = declarations;
    
    // all of css string
    this.cssString = cssString;
    
    // size of css
    this.cssSize = cssSize;
    
    // result options
    this.options = options;
}

/**
 * Analyze rules
 * @returns {
 *   {Array} cssDeclarations
 * }
 */
Analyzer.prototype.analyzeRules = function () {
    var result = {
        cssDeclarations: []
    };
    this.rules.forEach(function(rule) {
        if (Array.isArray(rule.declarations)) {
            result.cssDeclarations.push({
                selector: rule.selectors,
                count: rule.declarations.length
            });
        }
    });
    result.cssDeclarations.sort(function decreasingOrder(a, b) {
        return b.count - a.count;
    });
    return result;
};

/**
 * Analyze selectors
 * @returns {
 *   {Number} idSelectors,
 *   {Number} universalSelectors,
 *   {Number} unqualifiedAttributeSelectors,
 *   {Number} javascriptSpecificSelectors,
 *   {Array} identifiers
 * }
 */
Analyzer.prototype.analyzeSelectors = function () {
    var regexp = new RegExp(this.options.javascriptSpecificSelectors, 'g');
    var result = {
        idSelectors: 0,
        universalSelectors: 0,
        unqualifiedAttributeSelectors: 0,
        javascriptSpecificSelectors: 0,
        identifiers: []
    };
    this.selectors.forEach(function(selector) {
        if (selector.indexOf('#') > -1) {
            result.idSelectors += 1;
        }
        if (selector.indexOf('*') > -1) {
            result.universalSelectors += 1;
        }
        if (selector.trim().match(/\[.+\]$/g)) {
            result.unqualifiedAttributeSelectors += 1;
        }
        if (regexp.test(selector.trim())) {
            result.javascriptSpecificSelectors += 1;
        }
        var trimmedSelector = selector.replace(/\s?([\>|\+|\~])\s?/g, '$1');
        trimmedSelector = trimmedSelector.replace(/\s+/g, ' ');
        var count = trimmedSelector.split(/\s|\>|\+|\~/).length;
        result.identifiers.push({
            selector: selector,
            count: count
        });
    });
    result.identifiers.sort(function decreasingOrder(a, b) {
        return b.count - a.count;
    });
    return result;
};

/**
 * Analyze declarations
 * @returns {
 *   {String} dataUriSize,
 *   {Number} importantKeywords,
 *   {Number} floatProperties,
 *   {Array} uniqueFontSize,
 *   {Array} uniqueColor,
 *   {Object} properties
 * }
 */
Analyzer.prototype.analyzeDeclarations = function () {
    var result = {
        dataUriSize: '',
        importantKeywords: 0,
        floatProperties: 0,
        uniqueFontSize: [],
        uniqueColor: [],
        properties: {}
    };
    this.declarations.forEach(function(declaration) {
        if (declaration.value.indexOf('data:image') > -1) {
            result.dataUriSize += declaration.value.match(/data\:image\/[A-Za-z0-9;,\+\=\/]+/);
        }
        if (declaration.value.indexOf('!important') > -1) {
            result.importantKeywords += 1;
        }
        if (declaration.property.indexOf('float') > -1) {
            result.floatProperties += 1;
        }
        if (declaration.property.indexOf('font-size') > -1) {
            result.uniqueFontSize.push(declaration.value.replace(/\!important/, '').trim());
        }
        if (declaration.property.match(/^color$/)) {
            var color = declaration.value.replace(/\!important/, '');
            color = color.toUpperCase().trim();
            result.uniqueColor.push(color);
        }
        if (result.properties[declaration.property]) {
            result.properties[declaration.property] += 1;
        } else {
            result.properties[declaration.property] = 1;
        }

    });
    // Return byte size.
    result.dataUriSize = Buffer.byteLength(result.dataUriSize, 'utf8');
    // Sort `font-size` property.
    result.uniqueFontSize = _.sortBy(_.uniq(result.uniqueFontSize).slice(), function(item) {
        return item.replace(/[^0-9\.]/g, '') - 0;
    });
    // Sort `color` property.
    result.uniqueColor = _.sortBy(_.uniq(_.without(result.uniqueColor, 'TRANSPARENT')));
    // Sort propertie count.
    var propertiesCount = [];
    Object.keys(result.properties).forEach(function(key) {
        propertiesCount.push({
            property: key,
            count: result.properties[key]
        });
    });
    result.properties = propertiesCount.sort(function decreasingOrder(a, b) {
        return b.count - a.count;
    });
    return result;
};

/**
 * Analyze css from rules, selectors, declarations
 * @returns {
 *   {Number} stylesheets,
 *   {Number} size,
 *   {Number} dataUriSize,
 *   {Number} ratioOfDataUriSize,
 *   {Number} gzippedSize,
 *   {Number} rules,
 *   {Number} selectors,
 *   {Float} simplicity,
 *   {Number} mostIdentifier,
 *   {String} mostIdentifierSelector,
 *   {Number} lowestCohesion,
 *   {Number} lowestCohesionSelector,
 *   {Number} totalUniqueFontSizes,
 *   {String} uniqueFontSize,
 *   {Number} totalUniqueColors,
 *   {String} uniqueColor,
 *   {Number} idSelectors,
 *   {Number} universalSelectors,
 *   {Number} unqualifiedAttributeSelectors,
 *   {Number} javascriptSpecificSelectors,
 *   {Number} importantKeywords,
 *   {Number} floatProperties,
 *   {Number} propertiesCount
 * }
 */
Analyzer.prototype.analyze = function () {
    var ruleAnalysis = this.analyzeRules();
    var selectorAnalysis = this.analyzeSelectors();
    var declarationAnalysis = this.analyzeDeclarations();

    var stats = {};
    if (this.options.size) {
        stats.size = this.cssSize;
    }
    if (this.options.dataUriSize) {
        stats.dataUriSize = declarationAnalysis.dataUriSize;
    }
    if (this.options.dataUriSize && this.options.ratioOfDataUriSize && declarationAnalysis.dataUriSize !== 0) {
        stats.ratioOfDataUriSize = declarationAnalysis.dataUriSize / this.cssSize;
    }
    if (this.options.gzippedSize) {
        stats.gzippedSize = gzipSize.sync(this.cssString);
    }
    if (this.options.rules) {
        stats.rules = this.rules.length;
    }
    if (this.options.selectors) {
        stats.selectors = this.selectors.length;
    }
    if (this.options.rules && this.options.selectors && this.options.simplicity) {
        stats.simplicity = stats.rules / stats.selectors;
    }
    // Most Identifier
    var mostIdentifier = selectorAnalysis.identifiers.shift();
    if (mostIdentifier && this.options.mostIdentifier) {
        stats.mostIdentifier = mostIdentifier.count;
    }
    if (mostIdentifier && this.options.mostIdentifierSelector) {
        stats.mostIdentifierSelector = mostIdentifier.selector;
    }
    var lowestDefinition = ruleAnalysis.cssDeclarations.shift();
    if (lowestDefinition && this.options.lowestCohesion) {
        stats.lowestCohesion = lowestDefinition.count;
    }
    if (lowestDefinition && this.options.lowestCohesionSelector) {
        stats.lowestCohesionSelector = lowestDefinition.selector;
    }
    if (this.options.totalUniqueFontSizes) {
        stats.totalUniqueFontSizes = declarationAnalysis.uniqueFontSize.length;
    }
    if (this.options.uniqueFontSize) {
        stats.uniqueFontSize = declarationAnalysis.uniqueFontSize;
    }
    if (this.options.totalUniqueColors) {
        stats.totalUniqueColors = declarationAnalysis.uniqueColor.length;
    }
    if (this.options.uniqueColor) {
        stats.uniqueColor = declarationAnalysis.uniqueColor;
    }
    if (this.options.idSelectors) {
        stats.idSelectors = selectorAnalysis.idSelectors;
    }
    if (this.options.universalSelectors) {
        stats.universalSelectors = selectorAnalysis.universalSelectors;
    }
    if (this.options.unqualifiedAttributeSelectors) {
        stats.unqualifiedAttributeSelectors = selectorAnalysis.unqualifiedAttributeSelectors;
    }
    if (this.options.javascriptSpecificSelectors) {
        stats.javascriptSpecificSelectors = selectorAnalysis.javascriptSpecificSelectors;
    }
    if (this.options.importantKeywords) {
        stats.importantKeywords = declarationAnalysis.importantKeywords;
    }
    if (this.options.floatProperties) {
        stats.floatProperties = declarationAnalysis.floatProperties;
    }
    if (this.options.propertiesCount) {
        stats.propertiesCount = declarationAnalysis.properties.slice(0, this.options.propertiesCount);
    }
    return stats;
};

module.exports = Analyzer;