'use strict';

describe('Service: uint', function () {

  // load the service's module
  beforeEach(module('flowsimUiApp'));

  // instantiate service
  var UInt;
  beforeEach(inject(function (_UInt_) {
    UInt = _UInt_;
  }));

  it('UInt Import', function () {
    expect(!!UInt).toBe(true);
  });

  it('howMany_, maxFrom_', function () {
    var tmp;
     
    expect(UInt.howManyBits(0)).toBe(1);
    expect(UInt.howManyBits(0x0)).toBe(1);
    expect(UInt.howManyBytes(0)).toBe(1);
    expect(UInt.howManyBytes(0x0)).toBe(1);
    
    expect(UInt.howManyBits(0)).toBe(1);

    tmp = 1;
    _.each(_.range(31), function(i) {
      expect(UInt.howManyBits(tmp)).toBe(i+1);
      tmp <<= 1;
    });
    expect(UInt.howManyBytes(0)).toBe(1);
    
    tmp = 1;
    _.each(_.range(31), function(i) {
      expect(UInt.howManyBytes(tmp)).toBe(Math.ceil((i+1)/8));
      tmp <<= 1;
    });
    
    _.each(_.range(31), function(i) {
      expect(UInt.maxFromBits(i+1)).toBe(Math.pow(2, i+1)-1);
    });
    
    _.each(_.range(4), function(i) {
      expect(UInt.maxFromBytes(i+1)).toBe(Math.pow(2, (8*(i+1)))-1);
    });
  });


  it('UInt(null, 0x1ffff, 2) should fail', function() {
    expect(function() {
      new UInt.UInt(null, 0x1ffff, 2)
    }).toThrow();
  });

  it('UInt(null, "0x1ffff", 2) should fail', function() {
    expect(function() {
      new UInt.UInt(null, '0x1ffff', 2)
    }).toThrow();
  });

  it('UInt(null, 0x800, 2).toString()', function() {
    var v = new UInt.UInt(null, '0x800', 2);
    expect(v.toString(16)).toBe('0x0800');
  });

  it('UInt(null, "0xx0000", 2)', function() {
    expect(function() {
      new UInt.UInt(null, '0xx0000', 2);
    }).toThrow();
  });

  it('UInt Construction', function() {
    expect(function() {
      new UInt.UInt(null, 'q');
    }).toThrow();
    expect(function() {
      new UInt.UInt(null, '0xx00');
    }).toThrow();
    expect(function() {
      new UInt.UInt(null, 1.2);
    }).toThrow();
    expect(function() {
      new UInt.UInt(null, null, 0);
    }).toThrow();
  });

  it('UInt No-Throw Construction', function() {
    var type_ip  = new UInt.UInt(null, 0x0800, 2);
    var type_arp = new UInt.UInt(null, 0x0806, 2);
    var type     = new UInt.UInt(null, null, 2);
    
    var inval  = new UInt.UInt(null, 0x0a0101f0, 4);
    var outval = new UInt.UInt(null, 0x0b0101f0, 4);
  });

  it('UInt Match - Ethernet Type', function() {
    var type1 = new UInt.UInt(null, 0x0800, 2);
    var type2 = new UInt.UInt(null, 0x0806, 2);

    var exact1 = new UInt.Match(null,
        new UInt.UInt(null, 0x0800, 2),
        new UInt.UInt(null, 0xffff, 2));

    var exact2 = new UInt.Match.mkExact(type1);

    var wildcard1 = new UInt.Match(null,
        new UInt.UInt(null, 0x0000, 2),
        new UInt.UInt(null, 0x0000, 2));

    var wildcard2 = new UInt.Match.mkWildcard(type1);
    var wildcard3 = new UInt.Match.mkWildcard(2);

    expect(exact1.match(type1)).toBe(true);
    expect(exact2.match(type1)).toBe(true);
    expect(wildcard1.match(type1)).toBe(true);
    expect(wildcard2.match(type1)).toBe(true);
    expect(wildcard3.match(type1)).toBe(true);

    expect(exact1.match(type2)).toBe(false);
    expect(exact2.match(type2)).toBe(false);
    expect(wildcard1.match(type2)).toBe(true);
    expect(wildcard2.match(type2)).toBe(true);
    expect(wildcard3.match(type2)).toBe(true);

  });

  it('UInt Match - Ethernet MAC', function() {
    var empty     = new UInt.UInt(null, null, 6);
    var broadcast = (new UInt.UInt(null, null, 6)).neg();

    var mac1 = new UInt.UInt(null, [0, 1, 2, 3, 4, 5], 6);
    var mac2 = new UInt.UInt(null, [0, 1, 2, 3, 4, 6], 6);

    var exact1_mac1 = new UInt.Match(null,
        new UInt.UInt(null, [0, 1, 2, 3, 4, 5], 6),
        new UInt.UInt(null, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 6));
    var exact2_mac1 = new UInt.Match.mkExact(mac1);
    
    var exact1_mac2 = new UInt.Match(null,
        new UInt.UInt(null, [0, 1, 2, 3, 4, 6], 6),
        new UInt.UInt(null, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff], 6));
    var exact2_mac2 = new UInt.Match.mkExact(mac2);

    var wildcard1_mac1 = new UInt.Match(null,
        new UInt.UInt(null, null, 6),
        new UInt.UInt(null, null, 6));
    var wildcard2_mac1 = new UInt.Match.mkWildcard(mac1);
    var wildcard3_mac1 = new UInt.Match.mkWildcard(6);

    var wildcard1_mac2 = new UInt.Match(null,
        new UInt.UInt(null, null, 6),
        new UInt.UInt(null, null, 6));
    var wildcard2_mac2 = new UInt.Match.mkWildcard(mac2);
    var wildcard3_mac2 = new UInt.Match.mkWildcard(6);

    expect(exact1_mac1.match(mac1)).toBe(true);
    expect(exact2_mac1.match(mac1)).toBe(true);
    expect(wildcard1_mac1.match(mac1)).toBe(true);
    expect(wildcard2_mac1.match(mac1)).toBe(true);
    expect(wildcard3_mac1.match(mac1)).toBe(true);
    expect(exact1_mac1.match(mac2)).toBe(false);
    expect(exact2_mac1.match(mac2)).toBe(false);
    expect(wildcard1_mac1.match(mac2)).toBe(true);
    expect(wildcard2_mac1.match(mac2)).toBe(true);
    expect(wildcard3_mac1.match(mac2)).toBe(true);

    expect(exact1_mac2.match(mac1)).toBe(false);
    expect(exact2_mac2.match(mac1)).toBe(false);
    expect(wildcard1_mac2.match(mac1)).toBe(true);
    expect(wildcard2_mac2.match(mac1)).toBe(true);
    expect(wildcard3_mac2.match(mac1)).toBe(true);
    expect(exact1_mac2.match(mac2)).toBe(true);
    expect(exact2_mac2.match(mac2)).toBe(true);
    expect(wildcard1_mac2.match(mac2)).toBe(true);
    expect(wildcard2_mac2.match(mac2)).toBe(true);
    expect(wildcard3_mac2.match(mac2)).toBe(true);
  });

  it('UInt Prefix', function() {
    var route1 = new UInt.Match(null,
      new UInt.UInt(null, 0x0a000000, 4),
      new UInt.UInt(null, 0xff000000, 4));
    var route2 = new UInt.Match(null,
      new UInt.UInt(null, 0x0a0b0000, 4),
      new UInt.UInt(null, 0xffff0000, 4));
    var dst1 = new UInt.UInt(null, 0x0a0a0101, 4);
    var dst2 = new UInt.UInt(null, 0x0a0b0101, 4);
    var dst3 = new UInt.UInt(null, 0x0b0b0101, 4);

    expect(route1.match(dst1)).toBe(true);
    expect(route1.match(dst2)).toBe(true);
    expect(route1.match(dst3)).toBe(false);
    
    expect(route2.match(dst1)).toBe(false);
    expect(route2.match(dst2)).toBe(true);
    expect(route2.match(dst3)).toBe(false);
  });

  it('UInt Mask', function() {
    var left = new UInt.UInt(null, 0xffffffff);
    var mask = new UInt.UInt(null, 0x0000ff00);
    var right = new UInt.UInt(null, 0x11223344);

    var r = UInt.or(UInt.and(mask, right), UInt.and(UInt.neg(mask), left));
  });

});
