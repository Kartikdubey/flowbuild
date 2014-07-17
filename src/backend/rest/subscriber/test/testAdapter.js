var uuid = require('node-uuid');
var bcrypt = require('bcrypt');

var msg = require('../msg');

var orm = require('../../../database.js');
var Subscriber = orm['subscribers'];
var Session = orm['sessions'];
// var mailer = require('../../mailer');

// ----------------------------------------------------------------------------
// Subscriber

Array.prototype.containsEmail = function(email) {
   for (i in this) {
       if (this[i].email == email) return true;
   }
   return false;
}

function insertSubscriber(em, pwd, ip, cb){
  var token = uuid.v4();
  var encrypted = bcrypt.hashSync(pwd, 10); // encrypt the password
  if (Subscriber.containsEmail(em)) {
    cb(msg.emailInUse());
  } else {
    var subToAdd = {
      email: em,
      password: encrypted,
      reg_date: new Date(),
      reg_ip: ip, 
      verification_token: token,
      status: 'CREATED'
    };
    Subscriber.push(subToAdd);
    var newSub = Subscriber[Subscriber.length-1];
    if (newSub == subToAdd) {
      cb(msg.success(newSub));
    } else {
      cb(msg.unknownError(Subscriber.pop()));
    };
  }
}

// ----------------------------------------------------------------------------
// Testing insert subscriber
console.log("inserting a test subscriber returns:\n");
// should return success
insertSubscriber('testemail', 'iluvflowg', '127.0.0.1', 
  function(result) {
    console.log(result);
  });

console.log("\ninserting another one with the same email:\n");
// should return emailInUse error
insertSubscriber('testemail', 'testpassword', '127.0.0.1', 
  function(result) {
    console.log(result);
  });
console.log("\nthe full subscriber array:\n");
console.log(Subscriber);
console.log("\ncomparing the encrypted password to iluvflowg:\n");
console.log(bcrypt.compareSync('iluvflowg', Subscriber[0].password));
// ----------------------------------------------------------------------------

function sendVerificationEmail(em, cb){
cb(msg.success());
}

exports.insertSubscriber = insertSubscriber;
exports.sendVerificationEmail = sendVerificationEmail;


