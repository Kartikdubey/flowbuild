
var flowsimApp = angular.module('flowsimApp', 
  ['ngRoute', 'ui.bootstrap', '_switch', 'subscriber', 'profile',
    'packetCreator',
  'ngCookies']);

flowsimApp.controller('menuCtrl', 
  function($cookies, $scope, $rootScope, subscriberFactory) {
	  $scope.authenticated = false;

    $scope.logout = function() {
      console.log('clicked logged out');
      subscriberFactory.logout()
        .success(function(data){
          $scope.authenticated = false;
          delete $cookies['token'];
          console.log('clicked logout');
        }).error(function(data){
      });
    }

	  if($cookies.token){
		  $scope.authenticated = true;
	  }
	
	  $scope.$on("authenticated", function() {
		  $scope.authenticated = true;
	  });

	  $scope.$on("unauthenticated", function(){
		  $scope.authenticated = false;
	  });
});

flowsimApp.config(['$routeProvider', 
  function($routeProvider){
	  $routeProvider.
	    when('/', {
        templateUrl: 'main.html'
		  }).
		  when('/about', {
			  templateUrl: 'about.html'
		  }).
      when('/packet1', {
        templateUrl: 'packet1.html'
      }).
      when('/packet2', {
        templateUrl: 'packet2.html'
      }).
		  otherwise({
			  templateUrl: 'lost.html'
		  });
}]);

