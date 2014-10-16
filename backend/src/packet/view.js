
(function(){

var validator = require('validator');

var util      = require('../server/utils');
var msg       = require('./msg');
var pktUtils   = require('./utils');


function create(view) {
  return function(req, res, next) {
    var responder = util.Responder(res, next);
    var packet = {name: req.body.name , bytes: req.body.bytes,
      protocols: req.body.protocols};
    if(packet.name !== req.params.packetName){
      responder(msg.badValue('Packet url name must equal packet body name'));
    } else {
    //lightly sanitize send packet to createPacket Controller
    //TODO: rework validation
    pktUtils.validatePacket(req.body, req.params.packetName,
      function(err, result){
      if(err){
        responder(err);
      } else {
        view.controller.create(req.subscriber_id, packet, responder);
      }
    });
    }
  };
}

function list(view){
  return function(req, res, next){
    var responder = util.Responder(res, next);
    view.controller.list(req.subscriber_id, responder);
  };
}

function detail(view){
  return function(req, res, next){
    var responder = util.Responder(res, next);
    view.controller.detail(req.subscriber_id, req.params.packetName, responder);
  };
}

function update(view){
  return function(req, res, next){
    var responder = util.Responder(res, next);
    var packet = {name: req.body.name , bytes: req.body.bytes,
      protocols: req.body.protocols};

    //TODO: rework validation
    pktUtils.validatePacket(req.body, req.params.packetName,
      function(err, result){
      if(err){
        responder(err);
      } else {
        view.controller.update(req.subscriber_id, req.params.packetName,
          packet, responder);
      }
    });
  };
}

function View(c, packetLogger) {

  this.controller = c;

  this.logger = packetLogger.child({component: 'view'});

  this.services = [
    {
      method: 'post',
      path: '/:packetName',
      handler: util.requiresAuth(create(this))
    } , {
      method: 'get',
      path: '',
      handler: util.requiresAuth(list(this))
    } , {
      method: 'get',
      path: '/:packetName',
      handler: util.requiresAuth(detail(this))
    } , {
      method: 'put',
      path: '/:packetName',
      handler: util.requiresAuth(update(this))
    }
  ];
}
exports.View = View;

})();
