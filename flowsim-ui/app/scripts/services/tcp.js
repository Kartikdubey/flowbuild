'use strict';

angular.module('flowsimUiApp')
  .factory('TCP', function(fgUI, fgConstraints, UInt){

var NAME = 'TCP';
var BYTES = 20;

var Payloads = {};

function TCP(tcp, src, dst){
  if(_.isObject(tcp)) {
    this._src = mkPort(tcp._src);
    this._dst = mkPort(tcp._dst);
  } else {
    this._src = mkPort(src);
    this._dst = mkPort(dst);
  }
  this.name = NAME;
  this.bytes = BYTES;
}

TCP.prototype.src = function(src) {
  if(src) {
    this._src = mkPort(src);
  } else {
    return this._src;
  }
};

TCP.prototype.dst = function(dst) {
  if(dst) {
    this._dst = mkPort(dst);
  } else {
    return this._dst;
  }
};

function mkTCP(src, dst) {
  return new TCP(null, src, dst);
}

TCP.prototype.setPayload = function() {};

TCP.prototype.clone = function() {
  return new TCP(this);
};

TCP.prototype.toString = function() {
  return 'src: '+this._src.toString()+'\n'+
         'dst: '+this._dst.toString();
};

function mkPort(port) {
  if (port instanceof UInt.UInt) {
    return new UInt.UInt(port);
  } else {
    return new UInt.UInt(null, port, 2);
  }
}

var TIPS = {
  src: 'TCP source port',
  dst: 'TCP destination port'
};

function mkPortMatch(value, mask) {
  return new UInt.Match(null, mkPort(value), mkPort(mask));
}

var TESTS = {
  src: UInt.is(16),
  dst: UInt.is(16)
};

function TCP_UI(tcp){
  tcp = tcp ? new TCP(tcp) : new TCP();
  this.name = NAME;
  this.bytes = BYTES;
  this.attrs = [{
    name: 'Src',
    value: tcp.src().toString(),
    test: fgConstraints.isUInt(0,0xffff),
    tip: 'Source port'
  }, {
    name: 'Dst',
    value: tcp.dst().toString(),
    test: fgConstraints.isUInt(0,0xffff),
    tip: 'Destination port'
  }];
}

TCP_UI.prototype.toBase = function() {
  return new TCP(null, this.attrs[0].value, this.attrs[1].value);
};

TCP_UI.prototype.setPayload = function() {};
TCP_UI.prototype.clearPayload = function() {};

return {
  name: NAME,
  src: '_src',
  dst: '_dst',
  TCP: TCP,
  TCP_UI: TCP_UI,
  create: function(tcp) {return new TCP(tcp); },
  createUI: function(tcp) {return new TCP_UI(tcp); },
  Payloads: _(Payloads).keys(),
  mkPort: mkPort,
  mkTCP: mkTCP,
  TESTS: TESTS,
  TIPS: TIPS
};

});
