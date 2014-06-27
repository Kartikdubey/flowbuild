
var url = require('url');
var sub = require('./subscriber');
var msg = require('./msg');

function wrapRes(res, result) {
  res.writeHead('200', {
    'Content-Type': 'application/json'
  });
  res.end(JSON.stringify(result));
}

module.exports = function(userModules) {
  userModules.subscriber = sub.module;
  return function(req, res, next) {
    var result;

    // respond to a bad url pathname
    var path = url.parse(req.url).pathname.split('/');
    if(path.length < 2) {
      wrapRes(res, msg.error({
        description: 'Service not identified'
      });
      return;
    }
    
    // grab the access token if it exists
    var session = subscriber.getSession(req.headers);

    if(restModules[path[0]]) {
      var params = path.slice(2);
      var noauthModule = restModules[path[0]].noauth;
      var authModule = restModules[path[0]].auth;
      if(noauthModule[path[1]]) {
        result = noauthModule[path[1]](req.method, params, req.body);
        wrapRes(res, result);
        return;
      } else if(authModule[path[1]] && session) {
        result = authModule[path[1]](session, req.method, params, req.body);
        wrapRes(res, result);
        return;
      } else {
        wrapRes(res, msg.error({
          description: 'Service not found'
        });
        return
      }
    } else {
      wrapRes(res, msg.error({
        description: 'Module not found'
      });
    }
  }
}

