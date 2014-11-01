'use strict';

/**
 * @ngdoc function
 * @name flowsimUiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the flowsimUiApp
 */
angular.module('flowsimUiApp')
  .controller('ProfileCtrl', function ($scope, fgCache, Profile, $rootScope) {

    $scope.names = {};
    $scope.profile = null;

    $scope.tips = Profile.tips;
    $scope.tests = Profile.tests;
    $scope.speeds = Profile.speeds;
    $scope.mediums = Profile.mediums;
    $scope.modes = Profile.modes;

    $scope.versions = [
      'OpenFlow 1.0',
      'OpenFlow 1.1',
      'OpenFlow 1.2',
      'OpenFlow 1.3',
      'OpenFlow 1.4'
    ];

    $scope.ports = {
      n_ports: 24,
      ports: [],
      vports: [{
        name: 'port_stats',
        value: true
      }, {
        name: 'in_port',
        value: true,
      }, {
        name: 'table:',
        value: true,
      }, {
        name: 'normal',
        value: true,
      }, {
        name: 'any',
        value: true,
      }, {
        name: 'flood',
        value: true,
      }, {
        name: 'all',
        value: true,
      }, {
        name: 'controller',
        value: true,
      }, {
        name: 'local',
        value: true,
      }, {
        name: 'none',
        value: true
      }]
    };

    $scope.showProto = function(idx) {
      $scope.activeProto = idx;
    };

    $scope.getProfiles = function(callback) {
      fgCache.getNames('profile', callback);
    };


    $scope.addProfile = function(name, callback) {
      if(name in $scope.names) {
        callback('Name exists');
      } else if(name.length === 0) {
        callback('Invalid name');
      } else {
        $scope.profile = fgCache.create('profile', name, Profile);
        console.log($scope.profile);
        $scope.names[name] = true;
        $scope.setDirty();
        callback(null);
      }
    };

    $scope.delProfile = function(name) {
      fgCache.destroy('profile', name);
      if(fgCache.isDirty()) {
        $scope.setDirty();
      } else {
        $scope.setClean();
      }
      delete $scope.names[name];
    };

    $scope.setProfile = function(name) {
      if(name === undefined) {
        $scope.profile = null;
        $scope.$broadcast('setProfile', null);
      } else {
        fgCache.get('profile', name, Profile, function(err, result) {
          if(err) {
            console.log(err.details);
          } else {
            $scope.profile = result;
            $scope.$broadcast('setProfile', $scope.profile);
          }
        });
      }
    };

    $scope.setDirty = function() {
      $rootScope.$broadcast('dirtyCache');
    };
    
    $scope.setClean = function() {
      $rootScope.$broadcast('cleanCache');
    };

  });
