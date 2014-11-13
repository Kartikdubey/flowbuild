'use strict';

describe('Service: UDP', function () {

  // load the service's module
  beforeEach(module('flowsimUiApp'));

  // instantiate service
  var UDP;
  beforeEach(inject(function (_UDP_) {
    UDP = _UDP_;
  }));

  it('mkPort Pass', function () {
    expect(!!UDP).toBe(true);

    UDP.mkPort(0);
    var src = UDP.mkPort(54689);
    var dst = UDP.mkPort('54689');
    expect(src.toString()).toBe(dst.toString());
  });

  it('mkPort Fail', function () {
    expect(!!UDP).toBe(true);

    expect(function(){UDP.mkPort(69422)}).toThrow();
    expect(function(){UDP.mkPort('66422')}).toThrow();
  });

  it('Construction Pass', function () {
    expect(!!UDP).toBe(true);

    UDP.mkUDP(null, 0, 0);

    var src = UDP.mkPort(12345);
    var dst = UDP.mkPort('54689');
    var udp1 = UDP.mkUDP(src, dst);
    var udp2 = new UDP.UDP(udp1);
    var udp3 = new UDP.UDP(null, src, dst);
    var udp3 = new UDP.UDP(null, 12345, '54689');
    var udp4 = udp1.clone();

    var testStr = udp1.toString();
    expect(udp2.toString()).toBe(testStr);
    expect(udp3.toString()).toBe(testStr);
    expect(udp4.toString()).toBe(testStr);
  });

  it('Construction Fail', function () {
    expect(!!UDP).toBe(true);

    expect(function(){UDP.mkUDP(0, 69422)}).toThrow();
    expect(function(){UDP.mkUDP('66422', 234)}).toThrow();
  });

  it('Set Field Pass', function () {
    expect(!!UDP).toBe(true);

    var src = UDP.mkPort(12345);
    var dst = UDP.mkPort('54689');
    var udp1 = UDP.mkUDP(src, dst);


    expect(udp1.src().toString()).toBe('12345');
    expect(udp1.dst().toString()).toBe('54689');
    udp1.src(5000);
    expect(udp1.src().toString()).toBe('5000');
    expect(udp1.dst().toString()).toBe('54689');
    udp1.dst('0xFFFF');
    expect(udp1.src().toString()).toBe('5000');
    expect(udp1.dst().toString()).toBe('65535');
  });

  it('Set Field Fail', function () {
    expect(!!UDP).toBe(true);

    var src = UDP.mkPort(12345);
    var dst = UDP.mkPort('54689');
    var udp1 = UDP.mkUDP(src, dst);


    expect(udp1.src().toString()).toBe('12345');
    expect(udp1.dst().toString()).toBe('54689');
    expect(function(){udp1.src(70000)}).toThrow();
    expect(udp1.src().toString()).toBe('12345');
    expect(udp1.dst().toString()).toBe('54689');
    expect(function(){udp1.dst('0x10000')}).toThrow();
    expect(udp1.src().toString()).toBe('12345');
    expect(udp1.dst().toString()).toBe('54689');
    //expect(function(){udp1.dst(-1)}).toThrow();
    expect(udp1.src().toString()).toBe('12345');
    expect(udp1.dst().toString(16)).toBe('0xd5a1');
  });


});
