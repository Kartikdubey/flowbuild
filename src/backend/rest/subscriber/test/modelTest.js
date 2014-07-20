var bcrypt = require('bcrypt');

var subModel = require('../model.js');
var testAdapter = require('./testAdapter.js');
var assert = require('assert');
var model = subModel(testAdapter);
var msg = require('../msg.js');

//------------------------------------------------------------------------------
// Registration Tests
describe('===> Testing createSubscriber: \n',function() {
  it('User registered successfully',function(done) {
  	model.subscriber.create('test@test.com', 'mypassword', '127.0.0.1', 
			function(result){
  		assert(result.value, "Could not create subscriber");
		done();
	});
  });
    it('Duplicate subscriber',function(done) {
  	model.subscriber.create('test@test.com', 'mypassword', '127.0.0.1', 
			function(result){
  		assert.equal(result.error.type, "emailInUse");
		done();
	});
  });
});


//------------------------------------------------------------------------------
// Verification Tests
describe('===> Testing subVerify: \n',function() {
  var token = '';
  // setup subscriber
  before(function(){
    testAdapter.insertSubscriber('verify@test.com', '1234password', '127.0.0.1', 
			function(result){
    token = result.value.verification_token;
   });
  });
  it('Subscriber verified ',function(done) {
  	model.subscriber.verify(token, function(result){
  	  assert.equal(JSON.stringify(result), JSON.stringify(msg.success()));
			done();
		});
  });

  it('Subscriber already verified ',function(done) {
  	model.subscriber.verify(token, function(result){
  	  assert.equal(JSON.stringify(result), 
				JSON.stringify(msg.subscriberAlreadyVerified()));
			done();
		});
  });
});

//------------------------------------------------------------------------------
// Authenticate Tests
describe('===> Testing sessionAuthenticate: \n', function(){
	
  var testPassword = 'testPassword';
  var encrypted = bcrypt.hashSync(testPassword, 10);
  var testSubscriber = {email: 'testSubscriber@test.com', 
			password: encrypted, 
			reg_date: new Date(),
			reg_ip: '127.0.0.1',
      verification_token: 'doesntmatter',
      status: 'ACTIVE'
			};
	before(function(){
	//insert a verified user into db
  testAdapter.makeSubscriber(testSubscriber);
  });
	it('Subscriber should authenticate: \n', function(done){
		model.session.authenticate(testSubscriber.email, testPassword, 
			function(result){
			assert(result.value, true);
			done();
		});
	});
});

describe('===> Testing sessionAuthenticate: \n', function(){
	
  var testPassword = 'testPassword';
  var encrypted = bcrypt.hashSync(testPassword, 10);
  var testSubscriber2 = {email: 'testSubscriber2@test.com', 
			password: encrypted, 
			reg_date: new Date(),
			reg_ip: '127.0.0.1',
      verification_token: 'doesntmatter',
      status: 'REGISTERED'
			};
	before(function(){
	//insert a verified user into db
  testAdapter.makeSubscriber(testSubscriber2);
  });
	it('Subscriber in REGISTERED state should  not authenticate: \n', function(done){
		model.session.authenticate(testSubscriber2.email, testPassword, 
			function(result){
			assert.equal(JSON.stringify(result), 
				JSON.stringify(msg.subscriberNotActive()));
			done();
		});
	});
});


describe('===> Testing sessionAuthenticate: \n', function(){
	
  var testPassword = 'testPassword';
  var encrypted = bcrypt.hashSync(testPassword, 10);
  var testSubscriber3 = {email: 'testSubscriber3@test.com', 
			password: encrypted, 
			reg_date: new Date(),
			reg_ip: '127.0.0.1',
      verification_token: 'doesntmatter',
      status: 'ACTIVE'
			};
	before(function(){
	//insert a verified user into db
  testAdapter.makeSubscriber(testSubscriber3);
  });
	it('Invalid password should return msg.incorrectPwd(): \n', function(done){
		model.session.authenticate(testSubscriber3.email, 'badpass', 
			function(result){
			assert.equal(JSON.stringify(result), 
				JSON.stringify(msg.incorrectPwd()));
			done();
		});
	});
});

//------------------------------------------------------------------------------
// Reset Password 
describe('===> Testing resetPassword: \n', function(){
	var testSubscriber4 = {
		email: 'testSubscriber4@test.com',
		password: 'doesnt matter',
		reg_date: new Date(),
		reg_ip: '127.0.0.1',
		verification_token: 'doesnt matter',
		status: 'ACTIVE'
		};
	before(function(){
		testAdapter.makeSubscriber(testSubscriber4);
	});
  it('resetPassword(email) should return msg.success() if subsciber is ACTIVE : \n', function(done){
		model.subscriber.subReset(email, function(result){
			assert.equal(JSON.stringify(result), JSON.stringify(msg.success()));
			done();
		});
			
	});
});


describe('===> Testing resetPassword: \n', function(){
  it('resetPassword(email) should return msg.subscriberNotFound() when trying' + 
			'to reset a subscriber that has not been registered : \n', function(done){
		model.subscriber.subReset('idont@exist.com', function(result){
			assert.equal(JSON.stringify(result), JSON.stringify(msg.subscriberNotFound()));
			done();
		});
			
	});
});
