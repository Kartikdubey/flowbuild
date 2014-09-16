var orm = require('../../../dbbs');
var Packet = orm.model("packet");
var request = require('request');
var assert = require('assert');
var fs = require('fs');

//orm.setup()
var token, sessKey;

// ----------------------------------------------------------------------------
// Testing create packet
describe('Testing create packet requests:',function() {
  // Register, verify, then login a subscriber
  before(function(done) { 
    this.timeout(5000);
    request( { // login subscriber
      url: 'http://localhost:3000/api/subscriber/login',
      body: '{ \"email\": \"flowgrammabletest1@gmail.com\", \"password\": \"openflow1\"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    }, function (error, response, body) {
      assert(JSON.parse(body)['value'],'Unable to login user');
      sessKey = JSON.parse(body)['value'];
      done();
    });
  });
  it('A packet creation request that is successful should return msg.success()',
  function(done) {
    this.timeout(5000);
    request( {
      url: 'http://localhost:3000/api/packet/create',
      body: '{ \"name\": \"test packet\", \"bytes\": \"100\"}',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'POST'
    }, function (error, response, body) {
      assert(JSON.parse(body)['value'],'Unable to create packet');
      console.log('\tResponse received : ', body);
      done();
    }); 
  });
  it('Test: any method but POST should return msg.methodNotSupported()',
  function(done) {
    request({
      url: 'http://localhost:3000/api/packet/create',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'GET'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'methodNotSupported');
      console.log('\tResponse received : ', body);
      done();
    });
  });/*
  it('A request with a missing name should return msg.missingName()',
  function(done) {
    request( {
      url: 'http://localhost:3000/api/profile/create',
      body: '{ \"name\": \"\"}',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'missingName');
      console.log('\tResponse received : ', body);
      done();
    }); 
  });*/
});

// --------------------------------------------------------------------------
// Testing update profile
/*describe('Testing update profile request: ', function() {

	it('Test: Successful update of profile PUT /api/packet/update {id: id, name: name} should return msg.success()', 
	function(done) {
		request( {
			url: 'http://localhost:3000/api/packet/update',
			body: '{\"id\": \"1\", \"name\": \"test packet\"}',
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
			url: 'http://localhost:3000/api/packet/update',
			body: '{ \"name\": \"test packet\"}',
		   	headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
   			method: 'PUT'
 		}, function (error, response, body) {
			assert.equal(JSON.parse(body)['error']['type'],'missingId');
			console.log('\tResponse received : ', body);
      			done();
    		});
  	});
	
});
*/
// -----------------------------------------------------------------------------
// Testing fetch details
describe('Testing fetch details request: ', function() {
  it('Test: Successful request of profile GET /api/packet/detail/id should return {"id":id, "name":name}',
  function(done) {
      request({
        url : 'http://localhost:3000/api/packet/detail/1',
        headers: {'Content-Type': 'application/json','x-access-token': sessKey},
        method: 'GET'
      }, function (error, response, body) {
        console.log(body);
        assert(JSON.parse(body)['value'][0]);
        assert(JSON.parse(body)['value'][0].id);
        assert(JSON.parse(body)['value'][0].name);
        done();
    });
  });
  it('Test: GET to /api/packet/detail/id without an id should return msg.missingId()' ,
  function(done) {
      request({
        url : 'http://localhost:3000/api/packet/detail',
        headers: {'Content-Type': 'application/json','x-access-token': sessKey},
        method: 'GET'
      }, function (error, response, body) {
        assert.equal(JSON.parse(body)['error']['type'],'missingId');
        console.log('\tResponse received : ', body);
        done();
    });
  });
});
// -----------------------------------------------------------------------------
// Testing list packet
describe('Testing list packet request: ', function() {

  it('Test: Successful request of profiles GET /api/packet/list should return {"id":id, "name":name} ',
  function(done) {
      request({
        url : 'http://localhost:3000/api/packet/list',
        headers: {'Content-Type': 'application/json','x-access-token': sessKey},
        method: 'GET'
      }, function (error, response, body) {
        console.log(body);
        assert(JSON.parse(body)['value'][0]);
        assert(JSON.parse(body)['value'][0].id);
        assert(JSON.parse(body)['value'][0].name);
        done();
    });
  });

  it('Test: GET /api/packet/list with no packet found should return {value: [ ] }',
  function(done) {
    request( { //logout
      url: 'http://localhost:3000/api/subscriber/logout',
      body: '{ \"email\": \"flowgrammabletest1@gmail.com\", \"password\": \"openflow1\"}',
      headers: {'Content-Type': 'application/json','x-access-token': sessKey},
      method: 'POST'
    }, function (error, response, body) {
      assert(JSON.parse(body)['value'],'Unable to logout user');
      console.log('\tResponse received : ', body);
      request( { // login subscriber
        url: 'http://localhost:3000/api/subscriber/login',
        body: '{ \"email\": \"flowgrammabletest2@gmail.com\", \"password\": \"openflow2\"}',
        headers: { 'Content-Type': 'application/json' },
        method: 'POST'
      }, function (error, response, body) {
        assert(JSON.parse(body)['value'],'Unable to login user');
        sessKey = JSON.parse(body)['value'];
        request( {
          url : 'http://localhost:3000/api/packet/list',
          headers: {'Content-Type': 'application/json','x-access-token': sessKey},
          method: 'GET'
        }, function (error, response, body) {
          assert(JSON.parse(body)['value'],'noPacketsFound');
          console.log('\tResponse received : ', body);
          done();
        }); 
      });
    });
  });
  it('Test: any method but GET should return msg.methodNotSupported()',
  function(done) {
    request({
      url: 'http://localhost:3000/api/packet/list',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'POST'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'methodNotSupported');
      console.log('\tResponse received : ', body);
      done();
    });
  });
  it('Test: GET /api/packet/list while not logged in should return msg.subscriberUnauthenticated()',
  function(done) {
    request( { //logout
      url: 'http://localhost:3000/api/subscriber/logout',
      body: '{ \"email\": \"flowgrammabletest2@gmail.com\", \"password\": \"openflow2\"}',
      headers: {'Content-Type': 'application/json','x-access-token': sessKey},
      method: 'POST'
    }, function (error, response, body) {
      assert(JSON.parse(body)['value'],'Unable to logout user');
      console.log('\tResponse received : ', body);
      request( {
        url: 'http://localhost:3000/api/packet/list',
        headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
        method: 'GET'
      }, function (error, response, body) {
        assert.equal(JSON.parse(body)['error']['type'],'subscriberUnauthenticated');
        console.log('\tResponse received : ', body);
        done();
      });
    });
  });  
});
//-----------------------------------------------------------------------------
// Testing delete packet
describe('Test delete packet request: ', function() {
  it('Test: Successful deletion of packet DEL /api/packet/delete/packet_id should return msg.success()',
  function(done) {
    request( { // login subscriber
      url: 'http://localhost:3000/api/subscriber/login',
      body: '{ \"email\": \"flowgrammabletest1@gmail.com\", \"password\": \"openflow1\"}',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST'
    }, function (error, response, body) {
      assert(JSON.parse(body)['value'],'Unable to login user');
      sessKey = JSON.parse(body)['value'];
      request({
        url: 'http://localhost:3000/api/packet/delete/1',
        headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
        method: 'DEL'
      }, function (error, response, body) {
        console.log('\tResponse received : ', body);
        assert(JSON.parse(body)['value'],'Unable to delete packet');
        //console.log('\tResponse received : ', body);
        done();
      });
    });
  });
  it('Test: DEL to /api/packet/delete/packet_id without packet_id should return msg.missingId()',
  function(done) {
    request({
      url: 'http://localhost:3000/api/packet/delete/',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'DEL'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'missingId');
      console.log('\tResponse received : ', body);
      done();
    });
  });

  it('Test: any method but DEL should return msg.methodNotSupported()',
  function(done) {
    request({
      url: 'http://localhost:3000/api/packet/delete/1',
      headers: { 'Content-Type':'application/json', 'x-access-token': sessKey },
      method: 'GET'
    }, function (error, response, body) {
      assert.equal(JSON.parse(body)['error']['type'],'methodNotSupported');
      console.log('\tResponse received : ', body);
      done();
    });
  });

});
