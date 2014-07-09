var msg = require('./msg');
require('../../dbbs').setup();

var orm = require('../../dbbs');
var Subscriber = orm.model("subscriber");

// function insertSubscriber(email, password, cb){
// 	setTimeout(function(){
// 		cb(msg.emailInUse());
// 	}, 3000);
// }

function insertSubscriber(em, pwd, cb){
  setTimeout(function(){
    var token = 'testtoken';
    Subscriber.create({
      email: em,
      password: pwd,
      reg_date: new Date(),
      reg_ip: '127.0.0.1',
      ver_token: token,
      status: 'REGISTERED'
    }).success(function(result){
      cb(msg.success());
    }).error(function(err){
      if (err.detail == 'Key (email)=(' + em + ') already exists.')
        cb(msg.emailInUse());
      // TODO: check if the issue is the database connection
      else
        cb(msg.noDatabaseConnection());
    });
  }, 3000);
}

insertSubscriber('test@test.com', 'thepassword', function(result){
  console.log(result);
});

function sendEmail(email, cb){
	setTimeout(function(){
		cb(msg.error('Cant send Email'));
	}, 3000);
}

exports.sendEmail = sendEmail;
exports.insertSubscriber = insertSubscriber;