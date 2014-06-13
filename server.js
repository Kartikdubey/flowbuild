var express = require('express');
var orm = require('orm');
var environment = require('./conf/environment.js');
var routes = require('./conf/routes');

var server = express();

environment(server);//Setting up the environment, passing server object.
routes(server);//Setting up routes for CRUD http methods.


server.listen(8000, function() {
    console.log('Listening on port 8000');
});
