
var flowsim = angular.module('flowsim', ['ngRoute', 'ui.bootstrap']);

flowsim.controller('signinController', function($scope) {
  console.log('singin-controller');
});

flowsim.controller('signupController', function($scope) {
  console.log('singup-controller');
});

flowsim.controller('mainController', function($scope) {
  console.log('main-controller');
});

flowsim.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/signin', {
    templateUrl: 'html/signin.html',
    controller: 'signinController'
  })
  .when('/signup', {
    templateUrl: 'html/signup.html',
    controller: 'signupController'
  })
  .when('/register', {
    templateUrl: 'html/register.html',
    controller: 'registerController'
  })
  .otherwise({
    templateUrl: 'html/main.html',
    controller: 'mainController'
  });
}]);

flowsim.directive('fsMenu', function() {
  return {
    restrict: 'E',
    templateUrl: 'html/menu.html'
  };
});

flowsim.directive('fsJumbo', function() {
  return {
    restrict: 'E',
    templateUrl: 'html/jumbo.html',
    transclude: true
  };
});

flowsim.directive('fsSignup', function() {
  return {
    templateUrl: 'signup.html',
    restrict: 'E'
  }
});
