'use strict';

/**
 * @ngdoc function
 * @name flowsimUiApp.controller:SwitchCtrl
 * @description
 * # SwitchCtrl
 * Controller of the flowsimUiApp
 */
angular.module('flowsimUiApp')
  .controller('SwitchCtrl', function ($scope, fgCache, Profile, Switch, 
                                      $rootScope, $modal) {
    $scope.names = {};
    $scope._switch = null;

    $scope.getSwitches = function(callback) {
      fgCache.getNames('switch', callback);
    };

    $scope.addSwitch = function(name, callback) {
      if(name in $scope.names) {
        callback('Name exists');
      } else if(name.length === 0) {
        callback('Invalid name');
      } else if(!/^[a-zA-Z_][a-zA-Z_0-9]*$/.test(name)) {
        callback('Invalid name');
      } else {
        fgCache.getNames('profile', function(err, result) {
          if(err) {
            console.log(err.details);
          } else {
            $modal.open({
              templateUrl: 'views/dialog/switch.html',
              controller: 'DialogSwitchCtrl',
              size: 'sm',
              resolve: {
                profiles: function () {
                  return result;
                }
              }
            }).result.then(function(profileName) {
              fgCache.get('profile', profileName, Profile, function(err, result) {
                if(err) {
                  console.log(err.details);
                } else {
                  $scope._switch = fgCache.create('switch', name, Switch, result);
                  $scope.names[name] = true;
                  $scope.setDirty();
                  callback(null);
                }
              });
            });
          }
        });
      }
    };

    $scope.delSwitch = function(name) {
      fgCache.destroy('switch', name);
      if(fgCache.isDirty()) {
        $scope.setDirty();
      } else {
        $scope.setClean();
      }
      delete $scope.names[name];
    };

    $scope.setSwitch = function(name) {
      if(name === undefined) {
        $scope._switch = null;
        $scope.$broadcast('setSwitch', null);
      } else {
        fgCache.get('switch', name, Switch, function(err, result) {
          if(err) {
            console.log(err.details);
          } else {
            $scope._switch = result;
            $scope.$broadcast('setSwitch', $scope._switch);
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
