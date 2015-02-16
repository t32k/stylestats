var Handlebars = require('handlebars');

function Template(templateString, data) {
  this.template = Handlebars.compile(templateString || '');
  this.data = data || {};
}

Template.prototype.setTemplate = function (templateString) {
  this.template = Handlebars.compile(templateString || '');
};

Template.prototype.setData = function (data) {
  this.data = data || {};
};

Template.prototype.parse = function (callback) {
  callback(this.template(this.data));
};

module.exports = Template;
