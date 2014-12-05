'use strict';

angular.module('flowsimUiApp')
  .factory('ETHERNET', function ETHERNET(UInt) {

var NAME  = 'Ethernet';
var BYTES = 14;

var Payloads = {
  'VLAN': 0x8100,
  'MPLS': 0x8847,
  'ARP':  0x0806,
  'IPv4': 0x0800,
  'IPv6': 0x86dd,
  'Payload': 0x0000
};

var Pattern = /^([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})(-|:)([a-fA-F0-9]{1,2})$/;

function Ethernet(eth, src, dst, type) {
  if(_.isObject(eth)) {
    this._src = mkMAC(eth._src);
    this._dst = mkMAC(eth._dst);
    this._type = new UInt.UInt(eth._type);
  } else {
    this._src = mkMAC(src);
    this._dst = mkMAC(dst);
    this._type = new UInt.UInt(null, type, 2);
  }
  this.bytes = BYTES;
  this.name = NAME;
}

function mkEthernet(src, dst, type) {
  return new Ethernet(null, src, dst, type);
}

Ethernet.prototype.src = function(src) {
  if(src) {
    this._src = mkMAC(src);
  } else {
    return this._src;
  }
};

Ethernet.prototype.dst = function(dst) {
  if(dst) {
    this._dst = mkMAC(dst);
  } else {
    return this._dst;
  }
};

Ethernet.prototype.type = function(type) {
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

Ethernet.prototype.setPayload = function(name) {
  this._type = new UInt.UInt(null, Payloads[name], 2);
};

Ethernet.prototype.clone = function() {
  return new Ethernet(this);
};

Ethernet.prototype.toString = function() {
  return 'src: '+this._src.toString()+'\n'+
         'dst: '+this._dst.toString()+'\n'+
         'type: '+this._type.toString(16);
};

var TIPS = {
  src: 'Ethernet source address',
  dst: 'Ethernet destination address',
  typelen: 'Ethernet payload type or length'
};

function MAC(mac, input) {
  var tmp;
  if(_.isObject(mac)) {
    this._mac = new UInt.UInt(mac._mac);
  } else if(_.isString(input)) {
    if(!Pattern.test(input)) {
      throw 'MAC('+mac+', '+input+')';
    }
    tmp = input.match(Pattern);
    if(!tmp || tmp.length < 12) {
      throw 'Bad MAC Address: ' + mac;
    }
    this._mac = new UInt.UInt(null, _.map(_.range(6), function(i) {
      return parseInt('0x'+tmp[2*i+1]);
    }), 6);
  } else if(_.isArray(input)) {
    this._mac = new UInt.UInt(null, input, 6);
  } else {
    this._mac = new UInt.UInt(null, null, 6);
  }
}

MAC.prototype.clone = function() {
  return new MAC(this);
};

function mkMAC(mac) {
  if(_.isObject(mac)) {
    return new MAC(mac);
  } else {
    return new MAC(null, mac);
  }
}

function mkBroadcast() {
  return mkMAC('ff:ff:ff:ff:ff:ff');
}

MAC.equal = function(lhs, rhs) {
  return UInt.equal(lhs._mac, rhs._mac);
};

MAC.prototype.equal = function(lhs, rhs) {
  return UInt.equal(lhs._mac, rhs._mac);
};

MAC.prototype.toString = function() {
  return _(this._mac.value).map(function(oct) {
    return UInt.padZeros(oct.toString(16), 2);
  }).join(':');
};

MAC.Pattern = Pattern;

MAC.is = function(addr) {
  return Pattern.test(addr);
};

MAC.isBroadcast = function(addr) {
  return MAC.equal(mkBroadcast(), addr);
};

MAC.isMulticast = function(addr) {
  return addr._mac.value[0] & 0x01 ? true : false;
};

MAC.Match = function(match, addr, mask) {
  if(_.isObject(match)) {
    this._match = new UInt.Match(match._match);
  } else {
    this._match = new UInt.Match(null, mkMAC(addr)._mac, mkMAC(mask)._mac);
  }
};

MAC.Match.prototype.clone = function() {
  return new MAC.Match(this);
};

MAC.Match.prototype.match = function(addr) {
  return this._match.match(addr._mac);
};

MAC.Match.prototype.equal = function(mac) {
  return this._match.equal(mac._match);
};

MAC.Match.prototype.toString = function() {
  var tmp = [];
  tmp.push(this.addr.toString());
  tmp.push(this.mask.toString());
  return tmp;
};

MAC.Match.prototype.summarize = function() {
  return 'eth';
};

function mkMACMatch(value, mask) {
  return new MAC.Match(null, value, mask);
}

function mkType(input) {
  return new UInt.UInt(null, input, 2);
}

function mkTypeMatch(value, mask) {
  var tmp =  new UInt.Match(null, mkType(value), mkType(mask));
  tmp.summarize = function() {
    return 'eth';
  };
  return tmp;
}

var TESTS = {
  src:     MAC.is,
  dst:     MAC.is,
  typelen: UInt.is(16)
};

function Ethernet_UI(eth) {
  eth = eth ? new Ethernet(eth) : new Ethernet();
  this.name = NAME;
  this.bytes = eth.bytes;
  this.attrs = [{
    name: 'Src',
    value: eth.src().toString(),
    test: MAC.is,
    tip: TIPS.src
  }, {
    name: 'Dst',
    value: eth.dst().toString(),
    test: MAC.is,
    tip: TIPS.dst
  }, {
    name: 'Type/Length',
    value: eth.type().toString(16),
    test: UInt.is(16),
    tip: TIPS.typelen
  }];
}

Ethernet_UI.prototype.toBase = function() {
  return new Ethernet(null, this.attrs[0].value, this.attrs[1].value,
                      this.attrs[2].value);
};

Ethernet_UI.prototype.setPayload = function(name) {
  this.attrs[2].value = '0x' + (Payloads[name] || 0).toString(16);
};

Ethernet_UI.prototype.clearPayload = function() {
  this.attrs[2].value = '0x0000';
};

var Operations = {
  src: {
    name: 'Src',
    action: 'set',
    constructor: mkMACMatch,
    valueTest: MAC.is,
    maskTest: MAC.is,
    valueTip: 'Ethernet source MAC match value',
    maskTip: 'Ethernet source MAC match mask'
  },
  dst: {
    name: 'Dst',
    action: 'set',
    constructor: mkMACMatch,
    valueTest: MAC.is,
    maskTest: MAC.is,
    valueTip: 'Ethernet destination MAC match value',
    maskTip: 'Ethernet destination MAC match mask'
  },
  type: {
    name: 'Type',
    action: 'set',
    constructor: mkTypeMatch,
    valueTest: UInt.is(16),
    maskTest: UInt.is(16),
    valueTip: 'Ethernet type match value',
    maskTip: 'Ethernet type match mask'
  },
};

return {
  name:        NAME,
  src:         '_src',
  dst:         '_dst',
  type:        '_type',
  Ethernet:    Ethernet,
  Ethernet_UI: Ethernet_UI,
  create:      function(eth)         { return new Ethernet(eth); },
  createUI:    function(eth)         { return new Ethernet_UI(eth); },
  Payloads:    _(Payloads).keys(),
  MAC:         MAC,
  mkMAC:       mkMAC,
  mkMACMatch:  mkMACMatch,
  mkType:      mkType,
  mkTypeMatch: mkTypeMatch,
  mkEthernet:  mkEthernet,
  TESTS:       TESTS,
  TIPS:        TIPS,
  Operations: Operations
};

});
