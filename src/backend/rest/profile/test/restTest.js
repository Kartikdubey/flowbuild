var orm = require('../../../dbbs');
var Profile = orm.model("switch_profile");
var request = require('request');
var assert = require('assert');
var fs = require('fs');

//orm.setup()
var token, sessKey;

// ----------------------------------------------------------------------------
// Testing create profile
describe('Testing create profile requests:',function() {
  // Register, verify, then login a subscriber
  before(function(done) { 
    this.timeout(5000);
    request( { // register subscriber
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"flowgrammablemailer@gmail.com\", \"password\": \"my password\"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    }, function (error, response, body) {
      console.log(body);
      assert(JSON.parse(body)['value'],'Unable to register user');
      fs.readFile(process.cwd()+'/temp','utf8',function (err,data) {
        if (err) console.log('Unable to read token in file for restTest');
        else {
          var array = data.toString().split("\n"); 
          token = JSON.parse(array[0]).ver_token;
          request( { // verify subscriber
            url: 'http://localhost:3000/api/subscriber/verify/',
            body: '{ \"token\": \"'+token+'\"}',
            headers: { 'Content-Type': 'application/json' },
            method: 'POST'
          }, function (error, response, body) { 
            assert(JSON.parse(body)['value'],'Unable to verify user');
            request( { // login subscriber
              url: 'http://localhost:3000/api/subscriber/login',
              body: '{ \"email\": \"flowgrammablemailer@gmail.com\", \"password\": \"my password\"}',
              headers: { 'Content-Type': 'application/json' },
              method: 'POST'
            }, function (error, response, body) {
              assert(JSON.parse(body)['value'],'Unable to login user');
              sessKey = JSON.parse(body)['value'];
              done();
            });
          });
        }
      });
    }); 
  });
  it('A request that is successful should return msg.success()',
  function(done) {
    request( {
      url: 'http://localhost:3000/api/profile/create',
      body: '{ \"name\": \"test profile\", \"ofp_version\": \"10\"}',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'POST'
    }, function (error, response, body) {
	console.log('\tResponse received : ', body);
      assert(JSON.parse(body)['value'],'Unable to create profile');
      //console.log('\tResponse received : ', body);
      done();
    }); 
  });
  it('A request with a missing name should return msg.missingName()',
  function(done) {
    request( {
      url: 'http://localhost:3000/api/profile/create',
      body: '{ \"name\": \"\", \"ofp_version\": \"10\"}',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'missingName');
      console.log('\tResponse received : ', body);
      done();
    }); 
  });
});

// --------------------------------------------------------------------------
// Testing update profile
describe('Testing update profile request: ', function() {

	it('Test: Successful update of profile PUT /api/profile/update {id: id, name: name} should return msg.success()', 
	function(done) {
		request( {
			url: 'http://localhost:3000/api/profile/update',
			body: '{\"id\": \"1\", \"name\": \"test profile\", \"ofp_version\" : \"10\" }',
			headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
                        method: 'PUT'
                }, function (error, response, body) {
                        assert(JSON.parse(body)['value'],'Unable to update profile');
                        console.log('\tResponse received : ', body);
                        done();
		});
	});

	it('Test: PUT to /api/profile/update without an id in the body should return msg.missingId()', 
	function(done) {
		request( {
			url: 'http://localhost:3000/api/profile/update',
			body: '{ \"name\": \"test profile\"}',
		   	headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
   			method: 'PUT'
 		}, function (error, response, body) {
			assert.equal(JSON.parse(body)['error']['type'],'missingId');
			console.log('\tResponse received : ', body);
      			done();
    		});
  	});
	
	before(function(done) {
    this.timeout(5000);
    request( { // register anoter subscriber
      url: 'http://localhost:3000/api/subscriber/register',
      body: '{ \"email\": \"test@flog.com\", \"password\": \"my_password\"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    }, function (error, response, body) {
      console.log(body);
      assert(JSON.parse(body)['value'],'Unable to register user');
      fs.readFile(process.cwd()+'/temp','utf8',function (err,data) {
        if (err) console.log('Unable to read token in file for restTest');
        else {
          var array = data.toString().split("\n");
          token = JSON.parse(array[0]).ver_token;
          request( { // verify subscriber
            url: 'http://localhost:3000/api/subscriber/verify/',
            body: '{ \"token\": \"'+token+'\"}',
            headers: { 'Content-Type': 'application/json' },
            method: 'POST'
          }, function (error, response, body) {
            assert(JSON.parse(body)['value'],'Unable to verify user');
            request( { // login subscriber
              url: 'http://localhost:3000/api/subscriber/login',
              body: '{ \"email\": \"test@flog.com\", \"password\": \"my_password\"}',
              headers: { 'Content-Type': 'application/json' },
              method: 'POST'
            }, function (error, response, body) {
              assert(JSON.parse(body)['value'],'Unable to login user');
              sessKey = JSON.parse(body)['value'];
              request( { // make another profile
      		url: 'http://localhost:3000/api/profile/create',
      		body: '{ \"name\": \"test2profile\", \"ofp_version\": \"10\"}',
      		headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      		method: 'POST'
    	      }, function (error, response, body) {
      		assert(JSON.parse(body)['value'],'Unable to create profile');
      		console.log('\tResponse received : ', body);
      		request( { //logout
      		  url: 'http://localhost:3000/api/subscriber/logout',
      		  body: '{ \"email\": \"test@flog.com\", \"password\": \"my_password\"}',
      		  headers: {'Content-Type': 'application/json','x-access-token': sessKey},
      		  method: 'POST'
    		}, function (error, response, body) {
      		  assert(JSON.parse(body)['value'],'Unable to logout user');
      		  console.log('\tResponse received : ', body);
      	 	  request( { // login subscriber 1
             	    url: 'http://localhost:3000/api/subscriber/login',
               	    body: '{ \"email\": \"flowgrammablemailer@gmail.com\", \"password\": \"my password\"}',
              	    headers: { 'Content-Type': 'application/json' },
                    method: 'POST'
            	  }, function (error, response, body) {
                    assert(JSON.parse(body)['value'],'Unable to login user');
                    sessKey = JSON.parse(body)['value'];
                    done();
            	  });
    		});
	      });
            });
          });
        }
      });
    });
  });
	it('Test: PUT to /api/profile/update with subscriber_id in the body should return msg.notAuthorized()',
	function(done) {
                request( {
                        url: 'http://localhost:3000/api/profile/update',
                        body: '{\"id\": \"2\", \"name\": \"test2profile\"}',
                        headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
                        method: 'PUT'
                }, function (error, response, body) {
                        assert.equal(JSON.parse(body)['error']['type'],'notAuthorized');
                        console.log('\tResponse received : ', body);
                        done();
                });
        });

});

