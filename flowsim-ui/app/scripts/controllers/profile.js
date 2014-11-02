'use strict';

/**
 * @ngdoc function
 * @name flowsimUiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the flowsimUiApp
 */
angular.module('flowsimUiApp')
  .controller('ProfileCtrl', function($scope, fgCache, Profile, $rootScope,
                                      $modal) {

    $scope.names = {};
    $scope.profile = null;

    $scope.tips = Profile.TIPS;
    $scope.tests = Profile.TESTS;
    $scope.mediums = Profile.MEDIUMS;
    $scope.modes = Profile.MODES;
    $scope.speeds = Profile.SPEEDS;

    $scope.versions = [
      'OpenFlow 1.0',
      'OpenFlow 1.1',
      'OpenFlow 1.2',
      'OpenFlow 1.3',
      'OpenFlow 1.4'
    ];

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
        $scope.names[name] = true;
        $scope.setDirty();
        callback(null);
      }
    };

    $scope.delProfile = function(name) {
      fgCache.destroy('profile', name);
      if(fgCache.isDirty()) {
        $scope.setDirty();
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

    $scope.match = function(idx) {
      $modal.open({
        templateUrl: 'views/dialog/profile/match.html',
        controller: 'DialogProfileMatchCtrl',
        size: 'lg',
        resolve: {
          match: function () {
            return $scope.profile.tables.tables[idx].match;
          }
        }
      }).result.then(function (match) {
         $scope.profile.tables.tables[idx].match = match;
      });
    };

    $scope.instruction = function(idx) {
      $modal.open({
        templateUrl: 'views/dialog/profile/instruction.html',
        controller: 'DialogProfileInstructionCtrl',
        size: 'lg',
        resolve: {
          instruction: function () {
            return $scope.profile.tables.tables[idx].instruction;
          }
        }
      }).result.then(function (instruction) {
         $scope.profile.tables.tables[idx].instruction = instruction;
      });
    };

    $scope.miss = function(idx) {
      $modal.open({
        templateUrl: 'views/dialog/profile/miss.html',
        controller: 'DialogProfileMissCtrl',
        size: 'lg',
        resolve: {
          miss: function() {
            return $scope.profile.tables.tables[idx].miss;
          }
        }
      }).result.then(function(miss) {
         $scope.profile.tables.tables[idx].miss = miss;
      });
    }

  });
