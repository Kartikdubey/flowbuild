#!/usr/bin/env node

(function(){

// External dependencies
var fs   = require('fs');
var _    = require('underscore');
var prog = require('commander');

// Internal dependent modules
var dbs = require('./database/pg');
var mlr = require('./mailer');
var tmp = require('./template');
var srv = require('./server');
var sub = require('./subscriber');
var pac = require('./packet');
var log = require('./logger');

// Process the command line
prog
  .version(process.env.SERVER_VERSION)
  .option('-c, --config <config file>', 'Specify a configuration file')
  .option('-d, --dir [root http dir]', 'Specify the root http directory')
  .parse(process.argv);

// Initialize the configuration
var config = require(prog.config);
if(prog.dir) {
  if(config.server.static) {
    config.server.static.directory = prog.dir;
  } else {
    config.server.static = {
      directory: prog.dir
    };
  }
}

// Initialze global objects
var logger     = new log.Logger(config);
var db         = new dbs.Database(config, logger);
var mail       = new mlr.Mailer(config, logger);
var template   = new tmp.Template(config, logger);
var restServer = new srv.Server(config, logger);

// Initialize the modules
var mods = [
  new sub.Subscriber({
    configuration: config,
    database: db,
    mailer: mail,
    template: template,
    server: restServer,
    logger: logger
  }),
  new pac.Packet({
    configuration: config,
    database: db,
    server: restServer,
    logger: logger
  })
];

// Load each module into the rest server
_.each(mods, function(mod) {
  restServer.addModule(mod);
});

// Run the server
restServer.run();
console.log(restServer.toString());

})();
