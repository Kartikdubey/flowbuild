'use strict';

/**
 * @ngdoc directive
 * @name flowsimUiApp.directive:fgGotoConfig
 * @description
 * # fgMeterConfig
 */
angular.module('flowsimUiApp')
  .directive('fgGotoConfig', function () {
    return {
      templateUrl: 'views/fggotoconfig.html',
      restrict: 'E',
      scope: {
      	goto_: '=goto',
      	caps: '='
      },
      controller: function($scope) {
      	$scope.active = {
      		value: ''
      	};

      	$scope.set = function() {
      		$scope.goto_.target = $scope.active.value;
          $scope.active.value = '';
      	};
      }
    };
  });
