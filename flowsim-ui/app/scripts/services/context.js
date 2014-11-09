'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.context
 * @description
 * # context
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('Context', function(Action) {

function Key(key, in_port, in_phy_port, tunnen_id) {
  if(key instanceof Key || (typeof key === 'object' && key !== null)) {
    _.extend(this, key);

    this.vlan = _.map(key.vlan, function(tag) { return tag.clone(); });
    this.mpls = _.map(key.mpls, function(tag) { return tag.clone(); });
  } else if(in_port) {
    // Initialize input information
    this.in_port     = in_port;
    this.in_phy_port = in_phy_port;
    this.tunnel_id   = tunnel_id;

    // Initialize array for stacks
    this.vlan = [];
    this.mpls = [];
  } else {
    throw 'Bad Key('+in_port+')';
  }
}

Key.prototype.clone = function() {
  return new Key(this);
};

function Context(ctx, packet, buffer_id, in_port, in_phy_port, tunnel_id) {
  if(ctx instanceof Context || (typeof ctx === 'object' && ctx !== null)) {
    this.packet = ctx.packet.clone();
    this.buffer = ctx.buffer;

    this._nxtTable = ctx._nxtTable;
    this._lstTable = ctx._lstTable;

    this.key = ctx.key.clone();
    this.actionSet = ctx.actionSet.clone();
  } else if(packet && buffer_id && in_port) {
    // store a reference to the packet and buffer id
    this.packet = packet;
    this.buffer = buffer_id;

    // initialize the first table target
    this._nxtTable = 0;
    this._lstTable = 0;

    // initialize the packet key
    this.key = new Key(in_port, in_phy_port, tunnel_id);

    // initialize an empty packet set
    this.actionSet = new Action.Set();
  } else {
    throw 'Bad Context('+packet+', '+buffer_id+', '+in_port+')';
  }
}

Context.prototype.clone = function() {
  return new Context(this);
};

Context.prototype.table = function(table) {
  if(table) {
    this._lstTable = table;
    this._nxtTable = table;
  } else {
    return this._nxtTable;
  }
};

Context.prototype.meter = function(meter) {
  if(meter) {
    this._meter = meter;
  } else {
    return this._meter;
  }
};

Context.prototype.metadata = function(metadata) {
  if(metadata) {
    // need actual code here
    this.key.metadata = this.key.metadata;
  }
};

Context.prototype.applyActions = function(actions, dp) {
  actions.execute(dp, this);
};

Context.prototype.clearActions = function() {
  this.actionSet.clear();
};

Context.prototype.writeActions = function(actions) {
  this.actionSet.concat(actions);
};

Context.prototype.hasGoto = function() {
  return this._nxtTable !== this._lstTable;
};

});
