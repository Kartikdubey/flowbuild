
var _ = require('underscore');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');

var msg = require('./msg');
var mailer = require('../../mailer');

// Start subscriber ids from some random 5 digit prime
var base = 19543;

function subGetById(db, id) {
  var table = db.subscribers;
  id -= base;
  if(id < 0 || id >= table.length)
    return null;
  return table[id];
}

function subGetByField(db, key, value) {
  var table = db.subscribers;
  var result = _.find(table, function(_row) {
    return _row[key] == value;
  });
  if(typeof(result) == 'undefined') return null;
  else return result;
}

function _subCreate(db, row) {
  if(subGetByField(db, "email", row.email)) {
    return msg.emailInUse();
  } else {
    table.push(row);
    return msg.success(row);
  }
}

function subCreate(db, em, pwd) {
  bcrypt.hash('password', 5, function( err, bcryptedPassword) {
  msg.test(_subCreate(db, {
    email: em, 
    state: "CREATED",
    verification: uuid.v4()
  }), function(row) {
    bcrypt.hash(pwd, 5, function(err, bcryptedPwd) {
      if(err) throw err;
      row.password = bcryptedPwd;
    });
    return msg.success(row.verification);
  });
}

function subVerify(db, token) {
  var result = subGetByField(db, "verfication", token);
  if(!result) return msg.badToken();
  if(result.state != 'CREATED') return msg.badVerificationState();
  result.state = 'ACTIVE';
  return msg.success();
}

function subReset(db, email) {
  var result = subGetByField(db, "email", email);
  if(!result) return msg.badEmailReset();
}

function subUpdate(db, id, row) {
  var table = db.subscribers;
  id -= base;
  if(id < 0 || id >= table.length) return "badId";
  table[id] = row;
  return "";
}

function subDestroy(db, id) {
  var table = db.subscribers;
  id -= base;
  if(id < 0 || id >= table.length) return "badId";
  table.splice(id, 1);
  return "";
}

function sessGetByAccessToken(db, token) {
  var i;
  for(var i=0; i<db.sessions.length; ++i) {
    if(db.sessions[i].accessToken = accessToken)
      return db.session[i];
  }
  return null;
}

function sendVerification(token) {
    //   
    //  mailer.sendMail(mailer.verificationMessage(token));
}

module.exports = function(db) {
  return {
    subscriber: {
      create: _.bind(subCreate, null, db),
      verify: _.bind(subVerify, null, db),

      update: _.bind(subUpdate, null, db),
      destroy: _.bind(subDestroy, null, db)
    },
    session: {
      create: _.bind(sessCreate, null, db),
      destroy: _.bind(sessDestroy, null, db),
      authenticate: _.bind(sessAuthenticate, null, db);

      getByAccessToken: _.bind(sessGetByAccessToken, null, db)
    }
  };
}

