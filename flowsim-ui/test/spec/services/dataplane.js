'use strict';

describe('Service: dataplane', function () {

  // load the service's module
  beforeEach(module('flowsimUiApp'));

  // instantiate service
  var dataplane;
  beforeEach(inject(function (_Dataplane_) {
    dataplane = _Dataplane_;
  }));

  it('should do something', function () {
    expect(!!dataplane).toBe(true);
  });

});