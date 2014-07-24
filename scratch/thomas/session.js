var connect = require('connect');
var cookieParser = require('cookie-parser'); 
var cookieSession = require('cookie-session');

connect()
  .use(cookieParser())
  .use(cookieSession({ secret: 'testsecret' }))
  .use(function(req, res, next){
    var n = req.session.views || 0;
    req.session.views = ++n;
    res.end(n + ' views');
  })
  .listen(3000);
