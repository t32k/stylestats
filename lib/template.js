const Handlebars = require('handlebars');

Handlebars.registerHelper('removeBreak', (text) => {
  text = Handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, ' ');
  return new Handlebars.SafeString(text);
});

const Template = class {
  constructor(templateString, data) {
    this.template = Handlebars.compile(templateString || '');
    this.data = data || {};
  }

  parse(callback) {
    callback(this.template(this.data));
  }
};

module.exports = Template;
