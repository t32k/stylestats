var Handlebars = require('handlebars');

function Template(templateString, data) {
  this.template = Handlebars.compile(templateString || '');
  this.data = data || {};
}

Template.prototype.parse = function (callback) {
  callback(this.template(this.data));
};

module.exports = Template;
