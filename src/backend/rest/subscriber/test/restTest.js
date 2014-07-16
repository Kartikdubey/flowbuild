var orm = require('../../../dbbs');
var Subscriber = orm.model("subscriber");
var request = require('request');
var assert = require('assert');

orm.setup()

var testEmail = 'ash.1382@gmail.com';

describe('Testing registration requests:',function() {
  it('User registered successfully',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\", \"ip\": \"192.162.0.8\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      assert(JSON.parse(body)['value'],'Unable to register user');
      console.log('\tResponse received : ', body);
      done();
    }); 
  });
  it('Email Already in Use',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\", \"ip\": \"192.162.0.8\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'emailInUse');
      console.log('\tResponse received : ', body);
      done();
    });
  });/*
  it('Bad Password',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"Something@gmailler.com\", \"password\": \"my\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'badPwd');
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('Bad email',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"asdf.com\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'badEmail');
      console.log('\tResponse received : ', body);
      done();
    });
  });*/
  it('Missing Password',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'missingPwd');
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('Missing Email',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'missingEmail');
      console.log('\tResponse received : ', body);
      done();
    });
  });
});

describe('Testing verification requests:',function() {
  it('User verified successfully',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/verify/'+token,
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('User already verified',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/verify/'+token,
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('Missing verification token',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/verify',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('Bad verification token',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/verify/Bad-Token',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
});
/*
describe('Testing verification requests:',function() {
  it('User verified successfully',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/verify',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('User already verified',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/verify',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Token': token
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('Missing verification token',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();


*/
/*
describe('Testing fetching of subscribers:',function() {
  it('Subscriber found',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/fetch',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('Subscriber not found',function(done) {
    request( {
      url: 'http://localhost:3000/api/subscriber/fetch',
      body: '{ \"email\": \"'+testEmail+'\", \"password\": \"my password\"}',
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    }, function (error, response, body) {
      console.log('\tResponse received : ', body);
      done();
    });
  });
});*/
