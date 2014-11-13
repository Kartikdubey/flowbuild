'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.simulator
 * @description
 * # simulator
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('Simulation', function(Dataplane, Packet) {

function Simulation() {
  this.stage = 0;
  this.active = false;
  this.dataplane = null;
}

Simulation.prototype.stages = Dataplane.Stages;

Simulation.prototype.step = function() {
  this.stage = this.dataplane.step();
  if(this.dataplane.idle()) {
    this.stop();
  }
};

Simulation.prototype.play = function(trace) {
  this.dataplane = new Dataplane.Dataplane(trace.device);
  _(trace.events).each(function(ev) {
    this.dataplane.input(ev.clone());
  }, this);
  this.active = true;
  this.stage = 0;
};

Simulation.prototype.stop = function() {
  this.dataplane = null;
  this.active    = false;
};

var Stages = [{
  name: 'Arrival',
  label: 'Arrival',
  active: true
}, {
  name: 'Extraction',
  label: 'Extraction',
  active: true
}, {
  name: 'Choice',
  label: 'Choice',
  active: true
}, {
  name: 'Selection',
  label: 'Selection',
  active: true
}, {
  name: 'Execution',
  label: 'Execution',
  active: true
}, {
  name: 'Egress',
  label: 'Egress',
  active: true
}];

var Transitions = [{
  from: null,
  to: 0,
  forward: true
}, {
  from: 0,
  to: 1,
  forward: true
}, {
  from: 1,
  to: 2,
  forward: true
}, {
  from: 2,
  to: 3,
  forward: true
}, {
  from: 3,
  to: 4,
  forward: true
}, {
  from: 4,
  to: 5,
  forward: true
}, {
  from: 5,
  to: null,
  forward: true
}, {
  from: 4,
  to: 2,
  forward: false
}];

return {
  Simulation: Simulation,
  Stages: Stages,
  Transitions: Transitions
};

});
