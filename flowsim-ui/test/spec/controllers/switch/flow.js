'use strict';

describe('Controller: SwitchFlowCtrl', function () {

  // load the controller's module
  beforeEach(module('flowsimUiApp'));

  var SwitchFlowCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SwitchFlowCtrl = $controller('SwitchFlowCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
