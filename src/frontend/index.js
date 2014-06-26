#!/usr/bin/env node

var db = {
  subscriber: [
    {
      name: "Jasson Casey",
      email: "jasson.casey@gmail.com",
      password: "iluvflowg"
    }
  ],
  session: [],
};

var connect = require('connect');
var program = require('commander');

program
  .version(process.env.SERVER_VERSION)
  .option('-p, --port [tcp port]', 'Specify a listening port')
  .option('-a, --address [ip address]', 'Specify a listening ip address')
  .parse(process.argv);

var port = program.port || process.env.PORT || 3000;
var ip = program.address || process.env.ADDRESS || '127.0.0.1';

var app = connect()
  .use(connect.favicon('img/favicon.png'))
  .use('/img', connect.static('img'))
  .use('/fonts', connect.static('bower_components/bootstrap/dist/fonts'))
  .use('/css', connect.static('bower_components/bootstrap/dist/css'))
  .use('/js', connect.static('bower_components/bootstrap/dist/js'))
  .use('/js', connect.static('bower_components/jquery/dist'))
  .use('/js', connect.static('bower_components/angular'))
  .use('/js', connect.static('bower_components/angular-route'))
  .use('/js', connect.static('bower_components/angular-ui-bootstrap/dist'))
  .use('/css', connect.static('css'))
  .use('/js', connect.static('js'))
  .use(connect.static('html'))
  .use('/api', function(req, res, next){
    for(var item in req.body) {
      console.log('%s', item);
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Access-Token': 'onebigfuckingtoken'
    });
    res.end(JSON.stringify({
      success: {
        name: "Jasson Casey"
      }
    }));
  })
  .listen(port, ip);

console.log('Server started on: %s:%d', ip, port);

