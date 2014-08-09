var bcrypt = require('bcrypt');

var testAdapter = require('./testAdapter.js');
var assert = require('assert');
var model = require('../model.js')(testAdapter);
var msg = require('../msg.js');


//------------------------------------------------------------------------------
// Create profile tests

var profile;
describe('===> Testing profileCreate: \n',function() {
  it('Profile created successfully',function(done) {
  	model.profile.create(1, 'test profile', 10, function(result) {
  		assert(result.value, "Could not create profile");
		  done();
	  });
  });
});



describe('===> Testing profileList: \n',function() {
  it('All profiles listed successfully',function(done) {
    model.profile.list(1, function(result) {
        assert(result.value, "Could not list profiles");
        done();
      });
  });
});


describe('===> Testing profileUpdate: \n',function() {
  after(function(done) {
    model.profile.list(1,function(result) {console.log(result.value);});
    done();
  })
  it('Profile updated successfully',function(done) {
    model.profile.update(1,{id:1, name: 'updated profile'},
      function(result){
        assert(result.value, "Could not update profile");
        done();
      });
  });
});

