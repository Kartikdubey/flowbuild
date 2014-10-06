
/**
 * @module mailer
 * @requires module:utils~Formatter
 */

(/** @lends module:mailer */function(){

var mailgun  = require('mailgun-js');
var fmt = require('../utils/formatter');

var name = 'mailer';

/**
 * Wraps a mailgun object
 *
 * @constructor
 * @param {Object} config        - a mailer configuration object
 * @param {Object} logger        - a logger object
 *
 */
function Mailer(config, logger) {
  // Grab a configuration if present ...
  // ... otherwise throw an error
  this.config = config[name];
  if(!this.config) {
    throw new Error('Mailer: missing config');
  }
  if(!this.config.apiKey){
    throw new Error('Mailer: missing config.apiKey');
  }
  if(!this.config.domain){
    throw new Error('Mailer: missing config.domain');
  }
  if(!this.config.user){
    throw new Error('Mailer: missing config.user');
  }

  this.logger = logger; 

  // construct the mailer
  this.mailer = mailgun({
    apiKey: this.config.apiKey, 
    domain: this.config.domain
  });

}
exports.Mailer = Mailer;

function MailerError(method, err, config){
  var mailErr = {};
  mailErr.module = 'Mailer';
  mailErr.method = method;
  mailErr.subError = err;
  mailErr.mailConfig = config;
  switch(err.statusCode.toString()){
    case '401':
      mailErr.description = 'InvalidMailgunCredentials';
      break;
    default:
      mailErr.description = 'Unknown Error';
      break;
  }
  return mailErr;
}

/**
 * Take a subscriber email address, subject, and body
 * and send message
 *
 * @param {String} dst               - subscriber email address
 * @param {String} sub               - email subject
 * @param {String} body              - email body
 * @param {genericCallback} callback - a generic callback for mail results
 *
 */
Mailer.prototype.send = function(dst, sub, body, callback) {
  var that = this;
  var e;
  var logString = sub + ' message sent to: ' + dst;
  this.mailer.messages().send({
      from: this.config.user,
      to: dst,
      subject: sub,
      html: body
    }, function(err, result){
      if(err) {
        e = MailerError('send', err, that.config);
        that.logger.log(e);
        callback(e);
      } else {
        that.logger.log(logString);
        callback(null, result);
      }
  });

}; 

Mailer.prototype.toFormatter = function(f) {
  f.begin('Mailer');
  // should we actually out put our key? ... i've dont do this for https
  f.addPair('apiKey', this.config.apiKey);
  f.addPair('domain', this.config.domain);
  f.addPair('User', this.config.user);
  f.end();
};

Mailer.prototype.toString = fmt.toString;

})();

