var _ = require('underscore');
var gzipSize = require('gzip-size');

/**
 * Analyzer class
 * @param {Array} rules
 * @param {Array} selectors
 * @param {Array} declarations
 * @param {String} cssString
 * @param {Number} cssSize
 * @param {Object} options
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

  // object to return
  var result = {
    cssDeclarations: []
  };

  // analyze rules
  this.rules.forEach(function (rule) {
    if (Array.isArray(rule.declarations)) {
      result.cssDeclarations.push({
        selector: rule.selectors,
        count: rule.declarations.length
      });
    }
  });

  // sort by css declaration count
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

  // object to return
  var result = {
    idSelectors: 0,
    universalSelectors: 0,
    unqualifiedAttributeSelectors: 0,
    javascriptSpecificSelectors: 0,
    identifiers: []
  };

  // specified JavaScript hook selector
  var regexp = new RegExp(this.options.javascriptSpecificSelectors, 'g');

  // analyze selectors
  this.selectors.forEach(function (selector) {

    // if it contains #
    if (selector.indexOf('#') > -1) {
      result.idSelectors += 1;
    }

    // if it contains *
    if (selector.indexOf('*') > -1) {
      result.universalSelectors += 1;
    }

    // if it is unqualified attribute selector
    if (selector.trim().match(/\[.+\]$/g)) {
      result.unqualifiedAttributeSelectors += 1;
    }

    // if it is for JavaScript hook
    if (regexp.test(selector.trim())) {
      result.javascriptSpecificSelectors += 1;
    }

    // add selector for statistics
    var trimmedSelector = selector.replace(/\s?([\>|\+|\~])\s?/g, '$1');
    trimmedSelector = trimmedSelector.replace(/\s+/g, ' ');
    var count = trimmedSelector.split(/\s|\>|\+|\~/).length;
    result.identifiers.push({
      selector: selector,
      count: count
    });
  });

  // sort by chained selector count
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
 *   {Array} uniqueFontFamily
 *   {Array} uniqueColor,
 *   {Object} properties
 * }
 */
Analyzer.prototype.analyzeDeclarations = function () {

  // object to return
  var result = {
    dataUriSize: '',
    importantKeywords: 0,
    floatProperties: 0,
    uniqueFontSize: [],
    uniqueFontFamily: [],
    uniqueColor: [],
    properties: {}
  };

  // analyze declarations
  this.declarations.forEach(function (declaration) {

    // if it contains DataURI
    if (declaration.value.indexOf('data:image') > -1) {
      result.dataUriSize += declaration.value.match(/data\:image\/[A-Za-z0-9;,\+\=\/]+/);
    }

    // if it contains !important keyword
    if (declaration.value.indexOf('!important') > -1) {
      result.importantKeywords += 1;
    }

    // if it contains float
    if (declaration.property.indexOf('float') > -1) {
      result.floatProperties += 1;
    }

    // if it contains font-family
    if (declaration.property.indexOf('font-family') > -1) {
      result.uniqueFontFamily.push(declaration.value.replace(/(\!important)/g, '').trim());
    }

    // if it contains font-size
    if (declaration.property.indexOf('font-size') > -1) {
      result.uniqueFontSize.push(declaration.value.replace(/\!important/, '').trim());
    }

    // if it contains colors
    if (declaration.property.match(/^color$/)) {
      var color = declaration.value.replace(/\!important/, '');
      color = color.toUpperCase().trim();
      result.uniqueColor.push(color);
    }

    // property statistics
    if (result.properties[declaration.property]) {
      result.properties[declaration.property] += 1;
    } else {
      result.properties[declaration.property] = 1;
    }
  });

  // Return byte size.
  result.dataUriSize = Buffer.byteLength(result.dataUriSize, 'utf8');

  // Sort `font-family` property.
  result.uniqueFontFamily = _.sortBy(_.uniq(result.uniqueFontFamily));

  // Sort `font-size` property.
  result.uniqueFontSize = _.sortBy(_.uniq(result.uniqueFontSize).slice(), function (item) {
    return item.replace(/[^0-9\.]/g, '') - 0;
  });

  // Sort `color` property.
  var trimmedColors = _.without(result.uniqueColor, 'TRANSPARENT', 'INHERIT');
  var formattedColors = trimmedColors.map(function (color) {
    var formattedColor = color;
    if (/^#([0-9A-F]){3}$/.test(formattedColor)) {
      formattedColor = color.replace(/^#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3');
    }
    return formattedColor;
  });
  result.uniqueColor = _.sortBy(_.uniq(formattedColors));

  // Sort properties count.
  var propertiesCount = [];
  Object.keys(result.properties).forEach(function (key) {
    propertiesCount.push({
      property: key,
      count: result.properties[key]
    });
  });

  // sort by property count
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
 *   {Float}  simplicity,
 *   {Number} mostIdentifier,
 *   {String} mostIdentifierSelector,
 *   {Number} lowestCohesion,
 *   {Number} lowestCohesionSelector,
 *   {Number} totalUniqueFontSizes,
 *   {String} uniqueFontSize,
 *   {Number} totalUniqueFontFamilies,
 *   {String} uniqueFontSize,
 *   {Number} totalUniqueColors,
 *   {String} uniqueColor,
 *   {Number} totalUniqueFontFamilies
 *   {String} uniqueFontFamily,
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

  // get analytics
  var ruleAnalysis = this.analyzeRules();
  var selectorAnalysis = this.analyzeSelectors();
  var declarationAnalysis = this.analyzeDeclarations();

  var analysis = {};
  if (this.options.size) {
    analysis.size = this.cssSize;
  }
  if (this.options.dataUriSize) {
    analysis.dataUriSize = declarationAnalysis.dataUriSize;
  }
  if (this.options.dataUriSize && this.options.ratioOfDataUriSize && declarationAnalysis.dataUriSize !== 0) {
    analysis.ratioOfDataUriSize = declarationAnalysis.dataUriSize / this.cssSize;
  }
  if (this.options.gzippedSize) {
    analysis.gzippedSize = gzipSize.sync(this.cssString);
  }
  if (this.options.rules) {
    analysis.rules = this.rules.length;
  }
  if (this.options.selectors) {
    analysis.selectors = this.selectors.length;
  }
  if (this.options.rules && this.options.selectors && this.options.simplicity) {
    analysis.simplicity = analysis.rules / analysis.selectors;
  }
  // Most Identifier
  var mostIdentifier = selectorAnalysis.identifiers.shift();
  if (mostIdentifier && this.options.mostIdentifier) {
    analysis.mostIdentifier = mostIdentifier.count;
  }
  if (mostIdentifier && this.options.mostIdentifierSelector) {
    analysis.mostIdentifierSelector = mostIdentifier.selector;
  }
  var lowestDefinition = ruleAnalysis.cssDeclarations.shift();
  if (lowestDefinition && this.options.lowestCohesion) {
    analysis.lowestCohesion = lowestDefinition.count;
  }
  if (lowestDefinition && this.options.lowestCohesionSelector) {
    analysis.lowestCohesionSelector = lowestDefinition.selector;
  }
  if (this.options.totalUniqueFontSizes) {
    analysis.totalUniqueFontSizes = declarationAnalysis.uniqueFontSize.length;
  }
  if (this.options.uniqueFontSize) {
    analysis.uniqueFontSize = declarationAnalysis.uniqueFontSize;
  }
  if (this.options.totalUniqueFontFamilies) {
    analysis.totalUniqueFontFamilies = declarationAnalysis.uniqueFontFamily.length;
  }
  if (this.options.uniqueFontFamily) {
    analysis.uniqueFontFamily = declarationAnalysis.uniqueFontFamily;
  }
  if (this.options.totalUniqueColors) {
    analysis.totalUniqueColors = declarationAnalysis.uniqueColor.length;
  }
  if (this.options.uniqueColor) {
    analysis.uniqueColor = declarationAnalysis.uniqueColor;
  }
  if (this.options.idSelectors) {
    analysis.idSelectors = selectorAnalysis.idSelectors;
  }
  if (this.options.universalSelectors) {
    analysis.universalSelectors = selectorAnalysis.universalSelectors;
  }
  if (this.options.unqualifiedAttributeSelectors) {
    analysis.unqualifiedAttributeSelectors = selectorAnalysis.unqualifiedAttributeSelectors;
  }
  if (this.options.javascriptSpecificSelectors) {
    analysis.javascriptSpecificSelectors = selectorAnalysis.javascriptSpecificSelectors;
  }
  if (this.options.importantKeywords) {
    analysis.importantKeywords = declarationAnalysis.importantKeywords;
  }
  if (this.options.floatProperties) {
    analysis.floatProperties = declarationAnalysis.floatProperties;
  }
  if (this.options.propertiesCount) {
    analysis.propertiesCount = declarationAnalysis.properties.slice(0, this.options.propertiesCount);
  }
  return analysis;
};

module.exports = Analyzer;