'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.switch
 * @description
 * # switch
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('Switch', function(Datapath, Ports, Tables, Meters, Groups){

function Switch(sw, name, profile) {
  if(sw instanceof Switch || typeof sw === 'object') {
    _.extend(this, s);
    this.datapath     = new Datapath.Configuration(sw.datapath);
    this.ports        = new Ports.Configuration(sw.ports);
    this.tables       = new Tables.Configuration(sw.tables);
    this.meters       = new Meters.Configuration(sw.meters);
    this.groups       = new Groups.Configuration(sw.groups);
  } else {
    this.name         = name;
    this.datapath     = new Datapath.Configuration(profile.datapath);
    this.ports        = new Ports.Configuration(profile.ports);
    this.tables       = new Tables.Configuration(profile.tables);
    this.meters       = new Meters.Configuration(profile.meters);
    this.groups       = new Groups.Configuration(profile.groups);
  }
}

Switch.prototype.clone = function() {
  return new Switch(this);
};

var SwitchUI = Switch;
SwitchUI.prototype.toBase = Switch.prototype.clone;

function create(name, initialValue) {
    return new Switch(name, initialValue);
}

function createUI(swi, initialValue) {
  return new SwitchUI(swi, initialValue);
}

return {
    create: create,
    createUI: createUI
};

});
