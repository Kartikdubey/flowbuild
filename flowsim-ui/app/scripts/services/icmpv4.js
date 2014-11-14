'use strict';

angular.module('flowsimUiApp')
  .factory('ICMPV4', function(UInt, fgUI, fgConstraints){

var NAME = 'ICMPV4';
var BYTES = 8;

var Payloads = {};

function ICMPV4(icmp, type, code, icmp_bytes){
  if(_.isObject(icmp)) {
    this._type = new UInt.UInt(icmp._type);
    this._code = new UInt.UInt(icmp._code);
    this._icmp_bytes = new UInt.UInt(icmp._icmp_bytes);
  } else {
    this._type = new UInt.UInt(null, type, 1);
    this._code = new UInt.UInt(null, code, 1);
    this._icmp_bytes = new UInt.UInt(null, icmp_bytes, 2);
  }
  this.name = NAME;
  if (this._icmp_bytes > BYTES) {
    this.bytes = this._icmp_bytes.value;
  }
  else {
    this.bytes = BYTES;
  }
}

function mkICMPV4(type, code, icmp_bytes) {
  return new ICMPV4(null, type, code, icmp_bytes);
}

ICMPV4.prototype.clone = function() {
  return new ICMPV4(this);
};

ICMPV4.prototype.type = function(type) {
  if(type) {
    if(type instanceof UInt.UInt) {
      this._type = new UInt.UInt(type);
    } else {
      this._type = new UInt.UInt(null, type, 2);
    }
  } else {
    return this._type;
  }
};

ICMPV4.prototype.code = function(code) {
  if(code) {
    if(code instanceof UInt.UInt) {
      this._code = new UInt.UInt(code);
    } else {
      this._code = new UInt.UInt(null, code, 2);
    }
  } else {
    return this._code;
  }
};

ICMPV4.prototype.icmp_bytes = function(icmp_bytes) {
  if(icmp_bytes) {
    if(icmp_bytes instanceof UInt.UInt) {
      this._icmp_bytes = new UInt.UInt(icmp_bytes);
    } else {
      this._icmp_bytes = new UInt.UInt(null, icmp_bytes, 2);
    }
  } else {
    return this._icmp_bytes;
  }
};


// UI Interface:
function ICMPV4_UI(ICMPV4){
  ICMPV4 = ICMPV4 === undefined ? new ICMPV4() : ICMPV4;
  this.name = NAME;
  this.bytes = 4;
  this.attrs = [{
    name: 'Type',
    value: ICMPV4.type().toString(),
    tip: 'ICMP message type',
    test: fgConstraints.isUInt(0, 0xff)
  }, {
    name: 'Code',
    value: ICMPV4.code().toString(),
    tip: 'ICMP message code',
    test: fgConstraints.isUInt(0, 0xff)
  }];
}

ICMPV4_UI.prototype.toBase = function() {
  var result = new ICMPV4();
  result.name = this.name;
  result.bytes = this.bytes;
  result.fields = fgUI.stripLabelInputs(this.attrs);
  return result;
};

ICMPV4_UI.prototype.setPayload = function() {
  return true;
};

return {
  name: NAME,
  Payloads: _.keys(Payloads),
  ICMPV4: ICMPV4,
  mkICMPV4: mkICMPV4,
  create: function() { return new ICMPV4(); },
  createUI: function(ICMPV4) { return new ICMPV4_UI(ICMPV4); }
};

});
