
(function(){

var fmt = require('../utils/formatter');
var msg = require('./msg');
var stg = require('./storage');

function Controller(context) {
  this.storage  = new stg.Storage(context.database);
  this.mailer   = context.mailer;
  this.template = context.template;
}
exports.Controller = Controller;

Controller.prototype.toFromatter = function(f) {
  f.begin('Controller');
  this.storage.toFormatter(f);
  this.mailer.toFormatter(f);
  this.template.toFormatter(f);
  f.end();
};

Controller.prototype.toString = fmt.toString;

Controller.prototype.login = function(email, pwd, delgate) {
};

Controller.prototype.logout = function() {
};

Controller.prototype.register = function() {
};

Controller.prototype.verify = function() {
};

Controller.prototype.reset = function() {
};

})();

