// adapter.js
// adapter for using DB, or email

require('../../dbbs').setup();

var orm = require('../../dbbs');
var Subscriber = orm.model("subscriber");

//Register
// 1. insert subscriber
// 2. send email

//Verify
// 1. Fetch subscriber
// 2. Update subscriber

//Reset password
// 1. send email
// 2. update subscriber

//Login
// 1. fetch subscriber
// 2. send back authToken

function insertSubscriber(em, pwd, cb){
	var token = 'testtoken';
    Subscriber.create({
      email: em,
      password: pwd,
      reg_date: new Date(),
      reg_ip: '127.0.0.1',
      verification_token: token,
      status: 'REGISTERED'
    }).success(function(result){
   		cb(result);
    }).error(function(err){
        cb(msg.error());
    });
}

insertSubscriber('test@test.com', 'thepassword', function(result){
	console.log(result);
});

function updateSubscriber(authToken,cb){
	
	//sql to update an entry
}

function fetchSubscriber(authToken,cb){
}

function sendVerficationEmail(em, verificationToken){}
