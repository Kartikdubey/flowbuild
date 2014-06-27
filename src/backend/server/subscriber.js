
var msg = require('./msg');
var model = require('./model');

function subscriberRegister(method, params, data) {
  return msg.success({});
}

function subscriberVerify(method, params, data) {
  return msg.success({});
}

function subscriberReset(method, params, data) {
  return msg.success({});
}

function subscriberLogin(method, params, data) {
  var result;
  if(!data.email || !data.password) {
    return msg.error({
      description: 'Bad email or password'
    });
  }
  
  result = model.subscriber_lookup(data.email);
  if(!result.password || data.password != result.password) {
    return msg.error({
      description: 'Bad password'
    });
  }
  return msg.success({}, {
    'X-Access-Token': 'onebigfuckingstringz'
  });
}

function subscriberLogout(session, method, params, data) {
  return msg.success({});
}

module.exports = function(db) {
  var database = model(db);
  return {
    getSession: function(headers) {
      if(headers['X-Access-Token']) {
        return database.lookupAccesstoken(headers['X-Access-Token']);
      }
      return null;
    },
    module: {
      noauth : {
        register : subscriberRegister,
        verify : subscriberVerify,
        reset : subscriberRegister,
        login : subscriberLogin
      },
      auth : {
        logout : subscriberLogout
      }
    }
  }
}

