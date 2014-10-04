
/**
 * @module logger
 */

(/** @lends module:logger */function(){

var bunyan  = require('bunyan');
var fmt = require('../utils/formatter');

var name = 'logger';

function Logger(config) {
  // get our module configuration
  this.config = config[name];

  // initialize logger
  this.log = bunyan.createLogger({name: this.config.name});

}
exports.Logger = Logger;

Logger.prototype.addLog = function(message) {
  this.log.info(message);
};

Logger.prototype.addChild = function(child){
  this.log.child({module: child});
};

})();

