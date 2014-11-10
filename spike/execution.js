
var _packet1 = {
  name: 'packet 1',
  protocols: [{
    name: 'Ethernet',
    bytes: 14,
    attrs: [{
      name: 'Src',
      value: '00:00:00:00:00:00',
      tip: 'Ethernet source',
      test: function() { return true; }
    }, {
      name: 'Dst',
      value: 'ff:ff:ff:ff:ff:ff',
      tip: 'Ethernet detination',
      test: function() { return true; }
    }, {
      name: 'Src',
      value: '00:00:00:00:00:00',
      tip: '',
      test: function() { return true; }
    }]
  }];
};

var v1 = {
  table: 0,
  buffer: 0x00112301,
  meter: -1,
  packet: _packet1,
  actionSet: [{
    name: 'eth'
    value1: 'src='
    value2: '00:00:00:00:00:00'
  }],
  ins: [{
    name: 'Meter',
    value1: 1234
  }, {
    name: 'Apply'
    set: [{
      name: 'eth',
      value1: 'src=',
      value2: '01:00:00:00:00:00'
    }, {
      name: 'icmpv6',
      value1: 'type=',
      value2: '2'
    }, {
      name: 'Output',
      value1: 1
    }]
  }, {
    name: 'Metadata',
    value1: '00:11:22:44:55:66:77,',
    value2: '00:ff:ff:00:00:ff:ff'
  }]
};
