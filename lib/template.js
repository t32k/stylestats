var Handlebars = require('handlebars');

Handlebars.registerHelper('removeBreak', function (text) {
  text = Handlebars.Utils.escapeExpression(text);
  text = text.replace(/(\r\n|\n|\r)/gm, ' ');
  return new Handlebars.SafeString(text);
});

function Template(templateString, data) {
  this.template = Handlebars.compile(templateString || '');
  this.data = data || {};
}

Template.prototype.setTemplate = function (templateString) {
  this.template = Handlebars.compile(templateString || '');
};

Template.prototype.parse = function (callback) {
  callback(this.template(this.data));
};

module.exports = Template;
