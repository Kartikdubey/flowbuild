
var flowsimApp = angular.module('flowsimApp');

function Ethernet() {
  this.src = [0,0,0,0,0,0];
  this.dst = [0,0,0,0,0,0];
  this.ethertype = 0;

  this.name = "Ethernet";
}

Ethernet.prototype.bytes = function() {
  return 14;
}

function ARP() {
  this.name = "ARP";
}

function VLAN() {
  this.name = "VLAN";
}

function MPLS() {
  this.name = "MPLS";
}

function IPv4() {
  this.name = "IPv4";
}

function IPv6() {
  this.name = "IPv6";
}

function TCP() {
  this.name = "TCP";
}

function UDP() {
  this.name = "UDP";
}

function SCTP() {
  this.name = "SCTP";
}

function Packet(name) {
  this.name = name;
  this.protocols = [new Ethernet()];
  this.next = ['ARP', 'VLAN', 'MPLS', 'IPv4', 'IPv6'];
  this._bytes = this.protocols[0].bytes();
}

Packet.prototype.bytes = function() {
  return this._bytes;
}

Packet.prototype.pushProtocol = function(p) {
  this.protocols.push(p);
  this._bytes += p.bytes();
}

Packet.prototype.popProtocol = function() {
  var tmp = null;
  if(this.protocols.length) {
    tmp = this.protocols.splice(this.protocols.length-1);
    this._bytes -= tmp.bytes();
    delete tmp;
  }
}

Packet.prototype.addProtocol = function(name) {
  switch(name) {
    case "ARP":
      this.pushProtocol(new ARP());
      break;
    case "VLAN":
      this.pushProtocol(new VLAN());
      break;
    case "MPLS":
      this.pushProtocol(new MPLS());
      break;
    case "IPv4":
      this.pushProtocol(new IPv4());
      break;
    case "IPv6":
      this.pushProtocol(new IPv6());
      break;
    case "TCP":
      this.pushProtocol(new TCP());
      break;
    case "UDP":
      this.pushProtocol(new UDP());
      break;
    case "SCTP":
      this.pushProtocol(new SCTP());
      break;
    default:
      console.log("Trying to add unknown protocol: " + name);
      break;
  }
}

function Packets() {
  this.acceptableName = /[a-zA-Z_][a-zA-Z0-9_]*/;
  this.packets = [];
  this.names = {};
}

Packets.prototype.addPacket = function(name) {
  var pkt = null;
  if(name in this.names)
    return 'packetExists';
  if(!this.acceptableName.test(name))
    return 'badPacketName';
  pkt = new Packet(name);
  this.packets.push(pkt);
  this.names[name] = pkt;
  return '';
}

Packets.prototype.delPacketByName = function(name) {
  var i;
  if(name in this.names)
    delete this.names[name];
  for(i=0; i<this.packets.length; ++i) {
    if(name == this.packets[i].name) {
      delete this.packets.splice(i, 1);
      return ;
    }
  }
}

Packets.prototype.delPacketByPos = function(pos) {
  var pkt = null;
  if(pos >= -1 && pos < this.packets.length) {
    if(this.packets[pos].name in this.names) {
      delete this.names[this.packets[pos].name];
    }
    this.packets.splice(pos, 1);
  }
}

Packets.prototype.size = function() {
  return this.packets.length;
}

flowsimApp.controller('packet2Controller',
  function($scope) {
    $scope.packets = new Packets();
    $scope.packetName = '';
    $scope.badPacketName = false;
    $scope.packetExists = false;
    $scope.focus = -1;
    $scope.protocol = '';
    $scope.packet = null;

    $scope.shiftFocus = function(pos) {
      $scope.focus = pos;
      $scope.packet = $scope.packets.packets[pos];
    }

    $scope.addPacket = function() {
      switch($scope.packets.addPacket($scope.packetName)) {
        case 'packetExists':
          $scope.packetExists = true;
          break;
        case 'badPacketName':
          $scope.badPacketName = true;
          break;
        default:
          $scope.badPacketName = false;
          $scope.packetExists = false;
          $scope.packetName = '';
          $scope.shiftFocus($scope.packets.size()-1);
          break;
      }
    }

    $scope.delPacket = function(pos) {
      if($scope.focus == pos)
        $scope.focus = -1;
      else if($scope.focus != -1 && pos <= $scope.focus)
        $scope.shiftFocus(pos-1);
      $scope.packets.delPacketByPos(pos);
    }

    $scope.addProtocol = function() {
      $scope.packet.addProtocol($scope.protocol);
    }
  });

