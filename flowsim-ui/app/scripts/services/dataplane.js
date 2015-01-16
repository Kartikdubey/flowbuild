'use strict';

angular.module('flowsimUiApp')
  .factory('Dataplane', function(Context, UInt, Extraction, Instruction) {

var ARRIVAL    = 'Arrival';
var EXTRACTION = 'Extraction';
var CHOICE     = 'Choice';
var SELECTION  = 'Selection';
var EXECUTION  = 'Execution';
var GROUPS     = 'Groups';
var EGRESS     = 'Egress';
var FINAL      = 'Final';

var State = [
  ARRIVAL, 
  EXTRACTION,
  CHOICE,  
  SELECTION,
  EXECUTION,
  GROUPS,
  EGRESS, 
  FINAL,
];

function Dataplane(device) {
  if(device) {
    this.currEvent = null;
    this.inputQ    = [];

    this.datapath = device.datapath;
    this.ports    = device.ports;
    this.tables   = device.tables;
    this.groups   = device.groups;
    this.groupQ   = [];
    this.instructionSet = new Instruction.Set();
    //this.meters   = device.meters;

    this.ctx   = null;
    this.state = ARRIVAL;
  } else {
    throw 'Bad Dataplane('+device+')';
  }
  this.pause = false;
}

Dataplane.prototype.toView = function() {
  return this.ctx ? this.ctx.toView() : null;
};

Dataplane.prototype.input = function(ev) {
  this.inputQ.push(ev);
};

Dataplane.prototype.idle = function() {
  return this.state === FINAL;
};

Dataplane.prototype.arrival = function(packet, in_port, in_phy_port, tunnel) {
  // Every packet is not injected into the pipeline
  // A port can have: link down, admin down, or in no_recv state
  // The dataplane could be: dropping fragments, or reassembling fragments
  if(this.ports.ingress(packet, in_port) && this.datapath.ingress(packet)) {
    var bufId = this.datapath.bufAllocator.request();
    this.ctx  = new Context.Context(null, packet, bufId, in_port, in_phy_port, 
                                    tunnel);
  } else {
    throw 'Dataplane arrival failure: '+packet+', '+in_port+', '+in_phy_port+', '+tunnel+')';
  }
};

Dataplane.prototype.extraction = function() {
  Extraction.extract(this.ctx);
};

Dataplane.prototype.choice = function() {
  this.table = this.tables.get(this.ctx.table());
  if(!_.isObject(this.table)) {
    throw 'Failed to load table: ' + this.ctx.table();
  }
};

Dataplane.prototype.selection = function() {
  var flow = this.table.select(this.ctx.key);
  if(flow) {
    this.ctx.setInstructions(flow.ins.clone());
  }
};

Dataplane.prototype.execution = function() {
  this.ctx.instructionSet.step(this, this.ctx);
};

Dataplane.prototype.output = function(pkt, id) {
  this.ports.egress(pkt, id); 
};

Dataplane.prototype.group = function(pkt, id) {
  this.groupQ.push({
    id: id,
    packet: pkt
  });
};

Dataplane.prototype.groups = function() {
  var g_ctx = this.groupQ.splice(0, 1);
  this.groupQ.splice(0, 1);
  if(g_ctx) {
    // FIXME group processing goes here 
  }
};

Dataplane.prototype.egress = function() {
  this.ctx.actionSet.step(this, this.ctx);
};

Dataplane.prototype.transition = function(state) {
  this.nextState = state;
  this.pause     = true;
};

Dataplane.prototype.step = function() {
  var i;

  if(this.pause) {
    this.state = this.nextState;
    this.pause = false;
    for(i=0; i<State.length; i++) {
      if(State[i].toLowerCase() === this.state.toLowerCase()) {
        return i;
      }
    }
  }

  if(this.currEvent === null) {
    this.currEvent = this.inputQ[0];
    this.inputQ.splice(0, 1);
  }

  switch(this.state) {
    case ARRIVAL:
      this.arrival(
          this.currEvent.packet, 
          this.currEvent.in_port, 
          this.currEvent.in_phy_port, 
          this.currEvent.tunnel);
      this.transition(EXTRACTION);
      break;
    case EXTRACTION:
      this.extraction();
      this.transition(CHOICE);
      break;
    case CHOICE:
      this.choice();
      this.transition(SELECTION);
      break;
    case SELECTION:
      this.selection();
      this.transition(EXECUTION);
      break;
    case EXECUTION:
      this.execution();
      if(this.groupQ.length > 0) {
        this.transition(GROUPS);
      } else if(this.instructionSet.isEmpty()) {
        if(this.ctx.hasGoto()) {
          this.transition(CHOICE);
        } else {
          this.transition(EGRESS);
        }
      } else {
        this.transition(EXECUTION);
      }
      break;
    case GROUPS:
      this.groups();
      if(this.groupQ.length > 0) {
        this.transition(GROUPS);
      } else if(this.instructionSet.isEmpty()) {
        this.transition(EGRESS);
      } else {
        this.transition(EXECUTION);
      }
      break;
    case EGRESS:
      this.egress();
      if(this.groupQ.length > 0) {
        this.transition(GROUPS);
      } else if(this.ctx.actionSet.isEmpty()) {
        if(this.inputQ.length > 0) {
          this.transition(ARRIVAL);
        } else {
          this.transition(FINAL);
        }
      } else {
        this.transition(EGRESS);
      }
      break;
    case FINAL:
      break;
    default:
      throw 'Bad Dataplane state: ' + this.state;
  }

  // return the appropriate state we are in
  for(i=0; i<State.length; i++) {
    if(State[i].toLowerCase() === this.state.toLowerCase()) {
      return i;
    }
  }
  throw 'Bad state: '+i;
};

var Stages = _(State).reject(function(state) { 
  return state === FINAL; 
});

return {
  Stages: Stages,
  Dataplane: Dataplane
};

});
