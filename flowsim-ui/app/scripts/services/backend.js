'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.backend
 * @description
 * # backend
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .service('Backend', function backend($http) {

    this._xAccessToken = '';

    function unwrap(data, callback) {
      if(data.error) {
        callback(data.error);
      } else {
        return data.value;
      }
    }

    function request(method, path, data, callback) {
      var that = this;
      $http[method](path, data, {
        headers: { 'x-access-token': that._xAccessToken } }, 
        ).success(function(data, status) {
          unwrap(data, callback);
        }).error(function(data, status) {
          callback({
            details: status + ' : ' + data,
            message: 'We are having trouble contacting the server, please try' +
                     'again soon!'
          });
        });
    }

    this.authorize = function(token) {
      this._xAccessToken = token;
    };

    this.deauthorize = function() {
      this._xAccessToken = '';
    };

    this.get = function(path, data, callback) {
      request('get', path, data, callback);
    };

    this.post = function() {
      request('post', path, data, callback);
    };

    this.update = function() {
      request('put', path, data, callback);
    };

    this.delete = function() {
      request('delete', path, data, callback);
    }

  });

