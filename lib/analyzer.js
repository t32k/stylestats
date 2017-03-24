const gzipSize = require('gzip-size');

class Analyzer {
  /**
   * @param {Array} rules
   * @param {Array} selectors
   * @param {Array} declarations
   * @param {String} cssString
   * @param {Number} cssSize
   * @param {Object} options
   */
  constructor(data, options) {
    // Array of rule
    // Referenced in analyzeRules
    this.rules = data.rules;

    // Array of css selector
    // Referenced in analyzeSelectors
    this.selectors = data.selectors;

    // Array of css declaration
    // Referenced in analyzeDeclarations
    this.declarations = data.declarations;

    // All of css string
    this.cssString = data.cssString;

    // Size of css
    this.cssSize = data.cssSize;

    // Result options
    this.options = options;
  }

  /**
   * Analyze rules
   * @returns {
   *   {Number} totalCssDeclarations,
   *   {Array} cssDeclarations
   * }
   */
  analyzeRules() {
    // Object to return
    const result = {
      totalCssDeclarations: 0,
      cssDeclarations: []
    };

    // Analyze rules
    this.rules.forEach(rule => {
      if (Array.isArray(rule.declarations)) {
        result.cssDeclarations.push({
          selector: rule.selectors,
          count: rule.declarations.length
        });
      }
    });

    // Sort by css declaration count
    result.cssDeclarations.sort((a, b) => {
      return b.count - a.count;
    });
    result.cssDeclarations.forEach(obj => {
      result.totalCssDeclarations += obj.count;
    });

    return result;
  }

  /**
   * Analyze selectors
   * @returns {
   *   {Number} idSelectors,
   *   {Number} universalSelectors,
   *   {Number} unqualifiedAttributeSelectors,
   *   {Number} javascriptSpecificSelectors,
   *   {Number} totalIdentifiers,
   *   {Array} identifiers
   * }
   */
  analyzeSelectors() {
    // Object to return
    const result = {
      idSelectors: 0,
      universalSelectors: 0,
      unqualifiedAttributeSelectors: 0,
      javascriptSpecificSelectors: 0,
      userSpecifiedSelectors: 0,
      totalIdentifiers: 0,
      identifiers: []
    };

    // Specified JavaScript hook selector
    const regexpJs = new RegExp(this.options.javascriptSpecificSelectors);
    // Specified user-specified hook selector
    const regexpUser = new RegExp(this.options.userSpecifiedSelectors);

    // Analyze selectors
    this.selectors.forEach(selector => {
      // If it contains # and dose not contain # in attribute selector
      if (selector.indexOf('#') > -1) {
        const id = selector.replace(/\[.+]/g, '');
        if (id.indexOf('#') > -1) {
          result.idSelectors += 1;
        }
      }

      // If it contains * and dose not contain * in attribute selector
      if (selector.indexOf('*') > -1) {
        const universal = selector.replace(/\[.+]/g, '');
        if (universal.indexOf('*') > -1) {
          result.universalSelectors += 1;
        }
      }

      // If it is unqualified attribute selector
      if (selector.trim().match(/\[.+]$/g)) {
        result.unqualifiedAttributeSelectors += 1;
      }

      // If it is for JavaScript hook
      if (regexpJs.test(selector.trim())) {
        result.javascriptSpecificSelectors += 1;
      }

      // If it is for user-specified hook
      if (regexpUser.test(selector.trim())) {
        result.userSpecifiedSelectors += 1;
      }

      // Add selector for statistics
      let trimmedSelector = selector.replace(/\s?([>|+|~])\s?/g, '$1');
      trimmedSelector = trimmedSelector.replace(/\s+/g, ' ');
      const count = trimmedSelector.split(/\s|>|\+|~|:|[\w\]]\.|[\w\]]#|\[/).length;
      result.identifiers.push({
        selector,
        count
      });
    });
    result.identifiers.forEach(obj => {
      result.totalIdentifiers += obj.count;
    });

    // Sort by chained selector count
    result.identifiers.sort((a, b) => {
      return b.count - a.count;
    });

    return result;
  }

  /**
   * Analyze declarations
   * @returns {
   *   {String} dataUriSize,
   *   {Number} importantKeywords,
   *   {Number} floatProperties,
   *   {Array} uniqueFontSizes,
   *   {Array} uniqueFontFamilies
   *   {Array} uniqueColors,
   *   {Object} properties
   * }
   */
  analyzeDeclarations() {
    // Object to return
    const result = {
      dataUriSize: '',
      importantKeywords: 0,
      floatProperties: 0,
      uniqueFontSizes: [],
      uniqueFontFamilies: [],
      uniqueColors: [],
      uniqueBackgroundImages: [],
      properties: {}
    };

    // Analyze declarations
    this.declarations.forEach(declaration => {
      // If it contains DataURI
      if (declaration.value.indexOf('data:image') > -1) {
        result.dataUriSize += declaration.value.match(/data:image\/[A-Za-z0-9;,+=/]+/);
      }

      // If it contains !important keyword
      if (declaration.value.indexOf('!important') > -1) {
        result.importantKeywords += 1;
      }

      // If it contains float
      if (declaration.property.indexOf('float') > -1) {
        result.floatProperties += 1;
      }

      // If it contains font-family
      if (declaration.property.indexOf('font-family') > -1) {
        result.uniqueFontFamilies.push(declaration.value.replace(/(!important)/g, '').trim());
      }

      // If it contains font-size
      if (declaration.property.indexOf('font-size') > -1) {
        result.uniqueFontSizes.push(declaration.value.replace(/!important/, '').trim());
      }

      // If it contains colors
      if (declaration.property.match(/^color$/)) {
        let color = declaration.value.replace(/!important/, '');
        color = color.toUpperCase().trim();
        result.uniqueColors.push(color);
      }

      // If it contains background-image url()
      if (declaration.property.indexOf('background') > -1 && declaration.value.indexOf('url') > -1) {
        const paths = declaration.value.match(/url\(([^)]+)\)/g);
        if (paths) {
          paths.forEach(path => {
            result.uniqueBackgroundImages.push(path.replace(/^url|[()'"]/g, ''));
          });
        }
      }

      // Property statistics
      if (result.properties[declaration.property]) {
        result.properties[declaration.property] += 1;
      } else {
        result.properties[declaration.property] = 1;
      }
    });

    // Return byte size.
    result.dataUriSize = Buffer.byteLength(result.dataUriSize, 'utf8');

    // Sort `font-family` property.
    result.uniqueFontFamilies = result.uniqueFontFamilies.filter((fontFamily, index, array) => {
      return array.indexOf(fontFamily) === index;
    }).sort();

    // Sort `font-size` property.
    result.uniqueFontSizes = result.uniqueFontSizes.filter((fontSize, index, array) => {
      return array.indexOf(fontSize) === index;
    }).sort((a, b) => {
      return Number(a.replace(/[^0-9.]/g, '')) - Number(b.replace(/[^0-9.]/g, ''));
    });
    // Categorize per unit and concat
    const uniqueFontSizes = {};
    result.uniqueFontSizes.forEach(value => {
      const unit = value.replace(/[0-9.]/g, '');
      if (!uniqueFontSizes[unit]) {
        uniqueFontSizes[unit] = [];
      }
      uniqueFontSizes[unit].push(value);
    });
    result.uniqueFontSizes = [];
    Object.keys(uniqueFontSizes).forEach(key => {
      uniqueFontSizes[key].forEach(value => {
        result.uniqueFontSizes.push(value);
      });
    });

    // Sort `color` property.
    const trimmedColors = result.uniqueColors.filter(uniqueColor => {
      return uniqueColor !== 'TRANSPARENT' && uniqueColor !== 'INHERIT';
    });

    const formattedColors = trimmedColors.map(color => {
      let formattedColor = color;
      if (/^#([0-9A-F]){3}$/.test(formattedColor)) {
        formattedColor = color.replace(/^#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3');
      }
      return formattedColor;
    });
    result.uniqueColors = formattedColors.filter((formattedColor, index, array) => {
      return array.indexOf(formattedColor) === index;
    }).sort();

    // If it contains background-image url()
    result.uniqueBackgroundImages = result.uniqueBackgroundImages.filter((backgroundImage, index, array) => {
      return array.indexOf(backgroundImage) === index;
    }).sort();

    // Sort properties count.
    const propertiesCount = [];
    Object.keys(result.properties).forEach(key => {
      propertiesCount.push({
        property: key,
        count: result.properties[key]
      });
    });

    // Sort by property count
    result.properties = propertiesCount.sort((a, b) => {
      return b.count - a.count;
    });

    return result;
  }

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
   *   {Number} averageOfIdentifier,
   *   {Number} mostIdentifier,
   *   {String} mostIdentifierSelector,
   *   {Number} averageOfCohesion,
   *   {Number} lowestCohesion,
   *   {Number} lowestCohesionSelector,
   *   {Number} totalUniqueFontSizes,
   *   {String} uniqueFontSizes,
   *   {Number} totalUniqueFontFamilies,
   *   {String} uniqueFontSizes,
   *   {Number} totalUniqueColors,
   *   {String} uniqueColors,
   *   {Number} totalUniqueFontFamilies
   *   {String} uniqueFontFamilies,
   *   {Number} totalUniqueBackgroundImages
   *   {String} uniqueBackgroundImages,
   *   {Number} idSelectors,
   *   {Number} universalSelectors,
   *   {Number} unqualifiedAttributeSelectors,
   *   {Number} javascriptSpecificSelectors,
   *   {Number} importantKeywords,
   *   {Number} floatProperties,
   *   {Number} propertiesCount
   * }
   */
  analyze() {
    // Get analytics
    const ruleAnalysis = this.analyzeRules();
    const selectorAnalysis = this.analyzeSelectors();
    const declarationAnalysis = this.analyzeDeclarations();

    const analysis = {};
    if (this.options.size) {
      analysis.size = this.cssSize;
    }
    if (this.options.dataUriSize) {
      analysis.dataUriSize = declarationAnalysis.dataUriSize;
    }
    if (this.options.dataUriSize) {
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
    if (this.options.declarations) {
      analysis.declarations = this.declarations.length;
    }
    if (this.options.simplicity) {
      const simplicity = analysis.rules / this.selectors.length;
      analysis.simplicity = isNaN(simplicity) ? 0 : simplicity;
    }
    if (this.selectors.length > 0 && this.options.averageOfIdentifier) {
      analysis.averageOfIdentifier = selectorAnalysis.totalIdentifiers / this.selectors.length;
    }
    // Most Identifier
    const mostIdentifier = selectorAnalysis.identifiers.shift();
    if (mostIdentifier && this.options.mostIdentifier) {
      analysis.mostIdentifier = mostIdentifier.count;
    }
    if (mostIdentifier && this.options.mostIdentifierSelector) {
      analysis.mostIdentifierSelector = mostIdentifier.selector;
    }
    if (this.rules.length > 0 && this.options.averageOfCohesion) {
      analysis.averageOfCohesion = ruleAnalysis.totalCssDeclarations / this.rules.length;
    }
    const lowestDefinition = ruleAnalysis.cssDeclarations.shift();
    if (lowestDefinition && this.options.lowestCohesion) {
      analysis.lowestCohesion = lowestDefinition.count;
    }
    if (lowestDefinition && this.options.lowestCohesionSelector) {
      analysis.lowestCohesionSelector = lowestDefinition.selector;
    }
    if (this.options.totalUniqueFontSizes) {
      analysis.totalUniqueFontSizes = declarationAnalysis.uniqueFontSizes.length;
    }
    if (this.options.uniqueFontSizes) {
      analysis.uniqueFontSizes = declarationAnalysis.uniqueFontSizes;
    }
    if (this.options.totalUniqueFontFamilies) {
      analysis.totalUniqueFontFamilies = declarationAnalysis.uniqueFontFamilies.length;
    }
    if (this.options.uniqueFontFamilies) {
      analysis.uniqueFontFamilies = declarationAnalysis.uniqueFontFamilies;
    }
    if (this.options.totalUniqueColors) {
      analysis.totalUniqueColors = declarationAnalysis.uniqueColors.length;
    }
    if (this.options.uniqueColors) {
      analysis.uniqueColors = declarationAnalysis.uniqueColors;
    }
    if (this.options.totalUniqueBackgroundImages) {
      analysis.totalUniqueBackgroundImages = declarationAnalysis.uniqueBackgroundImages.length;
    }
    if (this.options.uniqueBackgroundImages) {
      analysis.uniqueBackgroundImages = declarationAnalysis.uniqueBackgroundImages;
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
    if (this.options.userSpecifiedSelectors) {
      analysis.userSpecifiedSelectors = selectorAnalysis.userSpecifiedSelectors;
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
  }
}

module.exports = Analyzer;
