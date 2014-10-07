var uuid = require('node-uuid');
var mocha = require('mocha');
var assert = require('assert');

var pg = require('../../database/pg');
var st = require('./../storage');
var msg = require('../msg');

var db = new pg.Database({database:{
  user: 'flogdev',
  pwd: 'flogdev',
  host: 'localhost',
  database: 'flowsim'
}});

var store = new st.Storage(db);

function genString(n){
  var y = '';
  for(i=0;i<n;i++) y+= 'a';
  return y;
}

// Create test subscriber
var d = new Date();
var dISO = d.toISOString();
var ts = { email: 'testSub@mail.com', password: '123', 
    date: dISO, ip: '1.1.1.1', token: uuid.v4() };


describe('Storage', function(){
describe('.createSubscriber(email, password, date, ip, token, cb)', function(){

  // Delete all subscribers from db before running tests
  before(function(){
    db.delete('session', {}, function(err, result){
      if(err){
        console.log('delete all sessions error: ', err);
      }
    });
    db.delete('subscriber', {}, function(err, result){
      if(err){
        console.log('delete all subscribers error:', err);
      } else {
       }
    });
  });

  it('should return [{id, email, etc}] on successful insert', function(done){
    store.createSubscriber(ts.email, ts.password, ts.date, ts.ip, ts.token, 
      function(err, result){
        if(err){
          console.log('createSub error', err);
        } else {
          assert.equal(result.length, 1);
          done();
        }
    });
   });

  it('should set subscriber status to CREATED', function(done){
    store.getSubscriberByToken(ts.token, function(err, result){
      assert.equal(result.status, 'CREATED');
      done();
    });
  });

  it('should return msg.existingEmail() on duplicate registration', 
    function(done){
      store.createSubscriber(ts.email, ts.password, ts.date, ts.ip, ts.token, 
        function(err, result){
            assert.equal(err.type, 'existingEmail');
            done();
      });
    });
 
});

describe('.verifySubscriber(token, cb)', function(){

  it('should return msg.success on successful verification', function(done){
    store.verifySubscriber(ts.token, function(err, result){
      assert.equal(result, '');
      done();
    });
  });

  it('should set subscriber status to ACTIVE', function(done){
    store.getSubscriberByEmail(ts.email, function(err, result){
      assert.equal(result.status, 'ACTIVE');
      done();
    });
  });

  it('should return unknownVerificationToken() on 2nd verification try',
    function(done){
      store.verifySubscriber(ts.token, function(err, result){
        assert.equal(err.type, 'unknownVerificationToken');
        done();
      });
  });


  it('should return unknownVerificationToken() for a bad token',
    function(done){
      store.verifySubscriber('', function(err, result){
        assert.equal(err.type, 'unknownVerificationToken');
        done();
      });
  });
});

describe('.getSubscriberByEmail(email, cb)', function(){
  
  it('should return an array with a single subscriber', function(done){
    store.getSubscriberByEmail(ts.email, function(err, result){
      assert.equal(result.email, ts.email);
      done();
    });
  });

  it('should return a msg.unknownEmail for invalid email', function(done){
    store.getSubscriberByEmail('nope', function(err, result){
      assert.equal(err.type, 'unknownEmail');
      done();
    });
  });

});

describe('.createSession(token, subscriberId, expireTime, cb)', function(){
  var subID;
  var token = uuid.v4();
  var expireTime = new Date((new Date()).getTime() + 1 * 60000);

  before(function(){
    store.getSubscriberByEmail(ts.email, function(err, result){
      subID = result.id;
    });
  });

  it('should return a x-auth token', function(done){
    store.createSession(token, subID, expireTime.toISOString(),
      function(err, result){
        assert.equal(result.length, 36);
        done();
    });
  });
});
/*
describe('.getSubscriberByToken(token, cb)', function(){

  it('should return an array of subscribers', function(done){
    store.getSubscriberByToken(ts.token, function(err, result){
      assert.equal(result.value[0].email, ts.email);
      done();
    });
  });

  it('should return an empty array if sub does not exist', function(done){
    store.getSubscriberByToken('madeup', function(err, result){
      assert.equal(0, result.value.length );
      done();
    });
  });

});


describe('.verifySubscriber(token, cb)', function(){

  it('should return an empty array on successful update', function(done){
    store.verifySubscriber(ts.token, function(err, result){
      assert.equal(0, result.value.length);
      done();
    });
  });
  
  it('should update subscriber status to ACTIVE', function(done){
    store.getSubscriberByEmail(ts.email, function(err, result){
      if(err){
        console.log(err);
      } else {
        assert.equal('ACTIVE', result.value[0].status);
        done();
      }
    });
  });
});

describe('.resetSubscriber(email, token, cb)', function(){

  it('should return an empty array on successful update', function(done){
    store.resetSubscriber(ts.email, 'resetToken', function(err, result){
      assert.equal(0, result.value.length);
      done();
    });
  });

  it('should set subscriber status to RESET', function(done){
    store.getSubscriberByEmail(ts.email, function(err, result){
      assert.equal('RESET', result.value[0].status);
      done();
    });
  });
});

describe('.updateSubscriberPassword(email, password, cb)', function(){
    
  it('should return \'value\' on success', function(done){
    store.updateSubscriberPassword(ts.email, 'newpassword', function(err, result){
      assert.equal(0, result.value.length);
      done();
    });
  });

  it('should update subscriber password', function(done){
    store.getSubscriberByEmail(ts.email, function(err, result){
      assert.equal('newpassword', result.value[0].password);
      done();
    });
  });
}); */
});
db.close();  
