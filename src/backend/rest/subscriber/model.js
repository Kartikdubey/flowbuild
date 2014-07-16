var _ = require('underscore');
var async = require('async');

var msg = require('./msg');
var adapter = require('./adapter');

function resultChecker(result, callback){
  if(result.value){
    callback(null, result);
  } else if(result.error) {
    callback(result, null);
  } else {
    throw "Undefined success and error objects";
  }
}

// ----------------------------------------------------------------------------
// Subscriber

function subCreate(adapter, em, pwd, ip, cb) {
  // 1. Insert User
  // 2. Send Verification Email

  async.waterfall([
    function(callback){
      adapter.insertSubscriber(em, pwd, ip, function(result){
        resultChecker(result, callback);
      });
    },
    function(result, callback){
      console.log(result);
      adapter.sendVerificationEmail(result.value, function(result){
        resultChecker(result, callback);
      });
    }
  ], function(err, result){
      if(err) { cb(err);    } 
      else    { cb(result); }
  });

}

function subVerify(adapter, token, cb) {
  // 1. Fetch user by verificationToken
  // 2. Set user to verified
  // 3. generate auth token

  async.waterfall([
    function(callback){
      adapter.fetchSubscriber({verification_token: token}, function(result){
        resultChecker(result, callback);
      });
    },
    function(result, callback){
      adapter.verifySubscriber(result.value , function(result){
        resultChecker(result, callback);
      });
     },
     function(result, callback){
      adapter.generateAuthToken(result.value, function(result){
        resultChecker(result, callback);
      })
     }
    ], function(err, result){
        if(err) { cb(err); }
        else    { cb(result); }
    });
}

function sessAuthenticate(adapter, email, password, sessId, cb){
  // 1. Fetch user by email
  // 2. Check credentials
  async.waterfall([
    function(callback){
      adapter.fetchSubscriber({email: email}, function(result){
        resultChecker(result, callback);
      });
    },
    function(result, callback){
      // password is correct
      if (bcrypt.compareSync(pwd, result.value.password))
        resultChecker(msg.success(result), callback);
      // password is incorrect
      else
        resultChecker(msg.incorrectPwd(), callback);
    },
    function(result, callback){
      adapter.createSession(result.value.id, function(result){
        resultChecker(result, callback);
      });
    }],
    function(err, result){
      if(err) { cb(err); }
      else    { cb(result); }
    });
}

function subReset(adapter, email, cb) {
  // 1. Generate password reset token
  // 2. associate it with user
  // 3. send email with token
  async.waterfall([
    function(callback){
      adapter.generateResetToken()
    }
    ], function(err, result){
        if(err) { cb(err); }
        else    { cb(result);}

    });

}

// ----------------------------------------------------------------------------
// Session

function createSession(adapter, subId, cb){
  adapter.insertSession(sessKey, subId, function(result){
    if(result.value){
      console.log('hit insert session success');
      cb(msg.success());
    }
    //TODO: handle error
  });
}


// function subUpdate(db, id, row) {
//   var table = db.subscribers;
//   id -= base;
//   if(id < 0 || id >= table.length) return "badId";
//   table[id] = row;
//   return "";
// }

// function subDestroy(db, id) {
//   var table = db.subscribers;
//   id -= base;
//   if(id < 0 || id >= table.length) return "badId";
//   table.splice(id, 1);
//   return "";
// }

// function sessGetByAccessToken(db, token) {
//   var i;
//   for(var i=0; i<db.sessions.length; ++i) {
//     if(db.sessions[i].accessToken = accessToken)
//       return db.session[i];
//   }
//   return null;
// }

module.exports = function(db) {
  return {
    subscriber: {
      create: _.bind(subCreate, null, adapter),
      verify: _.bind(subVerify, null, adapter),

//      update: _.bind(subUpdate, null, db),
//      destroy: _.bind(subDestroy, null, db)
    },
    session: {
      create: _.bind(createSession, null, adapter),
//      destroy: _.bind(sessDestroy, null, db),
      authenticate: _.bind(sessAuthenticate, null, adapter)

//      getByAccessToken: _.bind(sessGetByAccessToken, null, db)
    }
  };
}

