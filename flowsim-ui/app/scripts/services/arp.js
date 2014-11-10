'use strict';

angular.module('flowsimUiApp')
  .factory('ARP', function ARP(fgConstraints, fgUI, ETHERNET, IPV4, UInt) {

var NAME = 'ARP';
var BYTES = 28;

var Payloads = {
  'Payload': 0x0000
};

function ARP(arp, opcode, sha, spa, tha, tpa){
  if(_.isObject(arp)){
    _.extend(this, arp);
    this._opcode  = new UInt.UInt(arp._opcode);
    this._sha     = new ETHERNET.MAC(arp._sha);
    this._spa     = new IPV4.IP(arp._spa);
    this._tha     = new ETHERNET.MAC(arp._tha);
    this._tpa     = new IPV4.IP(arp._tpa);
  } else {
    this._opcode  = mkOpcode(opcode);
    this._sha     = new ETHERNET.mkMAC(sha);
    this._spa     = new IPV4.IP(spa);
    this._tha     = new ETHERNET.mkMAC(tha);
    this._tpa     = new IPV4.IP(tpa);
  }
  this.bytes = BYTES;
  this.name = NAME;
}

ARP.Opcode = UInt.UInt;
ARP.Opcode.Match = UInt.Match;
ARP.MAC = ETHERNET.MAC;
ARP.MAC.Match = ETHERNET.MAC.Match;


function mkARP(opcode, sha, spa, tha, tpa) {
  return new ARP(null, opcode, sha, spa, tha, tpa);
}

ARP.prototype.opcode = function(opcode) {
  if(opcode) {
    if(opcode instanceof UIint.UIint){
      this._opcode = new UInt.UInt(opcode);
    } else {
      this._opcode = new UInt.UInt(null, opcode, 2);
    }
  } else {
    return this._opcode;
  }
};

function mkOpcode(input){
  return new UInt.UInt(null, input, 2);
}

function mkOpcodeMatch(value, mask) {
  return new UInt.Match(null, mkOpcode(value), mkOpcode(mask));
}

ARP.prototype.sha = function(sha) {
  if(sha) {
    this._sha = new ARP.MAC(sha);
  } else {
    return this._sha;
  }
};

ARP.mkSha = ETHERNET.mkMAC;
ARP.mkShaMatch = ETHERNET.mkMACMatch;

ARP.prototype.spa = function(spa) {
  if(spa) {
    this._spa = new ARP.IP(spa);
  } else {
    return this._spa;
  }
};

ARP.mkSpa = IPV4.mkIP;

ARP.prototype.tha = function(tha) {
  if(tha) {
    this._tha = new ARP.MAC(tha)
  } else {
    return this._tha;
  }
};

ARP.mkTha = ETHERNET.mkMAC;
ARP.mkThaMatch = ETHERNET.mkMACMatch;

ARP.prototype.tpa = function(tpa) {
  if(tpa) {
    this._tpa = new ARP.IP(tpa);
  } else {
    return this._tpa;
  }
};

ARP.mkTpa = IPV4.mkIP;

var TIPS = {
  opcode: 'ARP Message Type',
  sha: 'Source Hardware Address',
  spa: 'Source Protocol Aaddress',
  tha: 'Target Hardware Address',
  tpa: 'Target Protocol Address'
};

var TESTS = {
  opcode: UInt.is(2),
  sha: ETHERNET.MAC.is,
  spa: IPV4.IP.is,
  tha: ETHERNET.MAC.is,
  tpa: IPV4.IP.is
};

var opPattern = /^[1-2]$/;

function ARP_UI(arp) {
  arp = arp ? new ARP(arp) : new ARP();
  this.name = NAME;
  this.bytes = arp.bytes;
  this.attrs = [{
    name: 'Opcode',
    value: arp.opcode().toString(16),
    test: UInt.is(16),
    tip: TIPS.opcode
  }, {
    name: 'SHA',
    value: arp.sha().toString(),
    test: ETHERNET.MAC.is,
    tip: TIPS.sha
  }, {
    name: 'SPA',
    value: arp.spa().toString(),
    test: IPV4.IP.is,
    tip: TIPS.spa
  }, {
    name: 'THA',
    value: arp.tha().toString(),
    test: ETHERNET.MAC.is,
    tips: TIPS.tha
  }, {
    name: 'TPA',
    value: arp.tpa().toString(),
    test: IPV4.IP.is,
    tip: TIPS.tpa
  }];
}


ARP_UI.prototype.toBase = function() {
  return new ARP(null, this.attrs[0].value, this.attrs[1].value,
      this.attrs[2].value, this.attrs[3].value, this.attrs[4].value);
};

ARP_UI.prototype.setPayload = function() {

};

ARP.prototype.clone = function() {
  return new ARP(this);
};


return {
  name:           NAME,
  ARP:            ARP,
  mkARP:          mkARP,
  mkOpcode:       mkOpcode,
  mkOpcodeMatch:  mkOpcodeMatch,
  mkSha:          ARP.mkSha,
  mkShaMatch:     ARP.mkShaMatch,
  mkTha:          ARP.mkTha,
  mkThaMatch:     ARP.mkThaMatch,
  ARP_UI:         ARP_UI,
  create:         function(arp)   { return new ARP(arp); },
  createUI:       function(arp)   { return new ARP_UI(arp); },
  Payloads:       Object.keys(Payloads),
  TESTS:          TESTS,
  TIPS:           TIPS
};

});
