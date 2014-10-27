'use strict';


/**
 * @ngdoc function
 * @name flowsimUiApp.controller:PacketCtrl
 * @description
 * # PacketCtrl
 * Controller of the flowsimUiApp
 */
angular.module('flowsimUiApp')
  .controller('PacketCtrl', function ($scope, Packet, Protocols) {
    // Method to add a new packet

    var packetName = /[a-zA-Z_][a-zA-Z_0-9]*/;

    $scope.packet   = null;
    $scope.errorMsg = '';
    $scope.names = {};

    $scope.dirty = false;

    // get the list of packets
    Packet.getNames(function(err, result) {
      if(err) {
        console.log(err.details);
      } else {
        $scope.names = result;
        $scope.$broadcast('initList', _.map($scope.names, function(n) {
          return n.name;
        }));
      }
    });

    // function for changing the focus state of the controller
    $scope.setPacket = function(name) {
      if(name === undefined) {
        $scope.packet = null;
        $scope.$broadcast('setStack', $scope.packet);
      } else {
        Packet.get(name, function(err, result) {
          if(err) {
            console.log(err.details);
          } else {
            $scope.packet = result;
            $scope.$broadcast('setStack', $scope.packet);
          }
        });
      }
    };

    $scope.setDirty = function() { $scope.dirty = true; };

    // function for constructing a new packet
    $scope.addPacket = function(name) {
      var tmp;
      if(!packetName.test(name)) {
        return 'Bad name';
      } else if(name in $scope.names) {
        return 'Name exists';
      } else {
        $scope.names[name] = true;
        $scope.packet = Packet.create(name);
        $scope.dirty = true;
        return '';
      }
    };

    // Method to delete a packet
    $scope.delPacket = function(name) {
      if(name in $scope.names) {
        delete $scope.names[name];
        Packet.destroy(name);
      }
    };

    $scope.getProtocols = function(packet) {
      return Protocols.getOptions(packet.top().name);
    };

    $scope.createProtocol = function(name) {
      return Protocols.createProtocol(name);
    };

    $scope.save = function(callback) {
      $scope.dirty = false;
    };

  });

