'use strict';

angular.module('flowsimUiApp')
  .factory('TCP', function(fgUI, fgConstraints, UInt){

var NAME = 'TCP';
var BYTES = 20;

var Payloads = {
 'Payload': 0
};

function TCP(tcp, src, dst){
  if(_.isObject(tcp)) {
    this._src = new UInt.UInt(tcp._src);
    this._dst = new UInt.UInt(tcp._dst);
  } else {
    this._src = mkSrc(src);
    this._dst = mkDst(dst);
  }
  this.name = NAME;
  this.bytes = BYTES;
}

TCP.prototype.src = function(src) {
  if(src) {
    this._src = new mkSrc(src);
  } else {
    return this._src;
  }
};

TCP.prototype.dst = function(dst) {
  if(dst) {
    this._dst = new mkDst(dst);
  } else {
    return this._dst;
  }
};

function mkTCP(src, dst) {
  return new TCP(null, src, dst);
}

TCP.prototype.setPayload = function() {
  return true;
};

TCP.prototype.clone = function() {
  return new TCP(this);
};

TCP.prototype.toString = function() {
  return 'src: '+this._src.toString()+'\n'+
         'dst: '+this._dst.toString();
};

var TIPS = {
  src: 'TCP source port',
  dst: 'TCP destination port'
};

function mkSrc(input) {
  return new UInt.UInt(null, input, 2);
}

function mkSrcMatch(value, mask) {
  return new UInt.Match(null, mkSrc(value), mkSrc(mask));
}

function mkDst(input) {
  return new UInt.UInt(null, input, 2);
}

function mkDstMatch(value, mask) {
  return new UInt.Match(null, mkDst(value), mkDst(mask));
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
  Payloads: [],
  mkSrc: mkSrc,
  mkDst: mkDst,
  mkTCP: mkTCP,
  TESTS: TESTS,
  TIPS: TIPS
};

});
