
'use strict';

angular.module('flowsimUiApp')
  .factory('Utils', function() {

function padZeros(input, len) {
  len -= input.length;
  if(len < 1) {
    return input;
  }
  return _.map(_.range(len), function() { return '0'; }).join() + input;
}

var HexPattern = /^(0x)?[0-9a-fA-F]+$/;

function inRange(min, max) {
  return function(value) { 
    return min <= value && value <= max;
  };
}

function howManyBits(val) {
  if(val === 0) { return 1; }
  return Math.floor((Math.log(val) / Math.LN2) + 1);
}

function howManyBytes(val) {
  if(val === 0) { return 1; }
  return Math.ceil(howManyBits(val) / 8);
}

function maxFromBits(val) {
  return Math.ceil(Math.pow(2, val) - 1);
}

function maxFromBytes(val) {
  return Math.ceil(maxFromBits(8*val));
}

function UInt(value, bits, min, max) {
  if(typeof value === 'number' && value === parseInt(value)) {
    this.value = value;
    this.bits = bits ? bits : howManyBits(value);
    this.bytes = Math.ceil(this.bits / 8);
    this.min = min ? min : 0;
    this.max = max ? max : this.bytes;
  } else if(typeof value === 'string' && HexPattern.test(value)) {
    this.value = parseInt(value);
    this.bits = bits ? bits : howManyBits(value);
    this.bytes = Math.ceil(this.bits / 8);
    this.min = min ? min : 0;
    this.max = max ? max : this.bytes;
  } else if(value instanceof UInt) {
    this.value = value.value;
    this.bits  = value.bits;
    this.bytes = value.bytes;
    this.min   = value.min;
    this.max   = value.max;
  } else {
    throw 'UInt(' + value + ')';
  }
  if(howManyBits(this.value) > this.bits) {
    throw 'UInt(' + this.value + ') : bits > ' + this.bits;
  }
  if(min) {
    if(min > this.value) {
      throw 'UInt(' + this.value + ') | >= ' + min;
    }
  if(max && max < this.value) {
    throw 'UInt(' + this.value + ') | <= ' + max;
  }
  }
}

UInt.Match = function(value, mask) {
  this.value = new UInt(value);
  this.mask  = new UInt(mask);
};

UInt.Match.prototype.match = function(value) {
  return (this.mask & value) === this.value;
};
  
UInt.Match.prototype.toString = function() {
  return this.value.toString(16) + '/' + this.mask.toString(16);
};

UInt.prototype.toString = function(val) {
  if(val === 16) {
    return '0x' + padZeros(this.value.toString(16), 2*this.bytes);
  }
  return this.value.toString();
};

UInt.is = function(bits) {
  return function(val) {
    var tmp;
    if(typeof val === 'number') {
      return val === parseInt(val) && (0 <= val && val <= maxFromBits(bits));
    } else if(typeof val === 'string' && HexPattern.test(val)) {
      tmp = parseInt(val);
      return 0 <= val && val <= maxFromBits(bits);
    } else {
      return false;
    }
  };
};

return {
  padZeros: padZeros,
  HexPattern: HexPattern,
  howManyBits: howManyBits,
  howManyBytes: howManyBytes,
  maxFromBits: maxFromBits,
  maxFromBytes: maxFromBytes,
  UInt: UInt,
};

});
