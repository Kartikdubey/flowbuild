'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.instruction
 * @description
 * # instruction
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('Instruction', function(fgConstraints, Action) {


function mkActionField(name, enabled, key, action) {
  action = action ? action : '-n/a-';
  return {
    name: name,
    action: action,
    enabled: enabled,
    key: key
  };
}

var Instruction = {};

function Profile(profile){
  if(_.isObject(profile)) {
    _.extend(this, profile);
    this.caps = _.clone(profile.caps);
    this.apply = Action.cloneAvailable(profile.apply);
    this.write = Action.cloneAvailable(profile.write);
    this.goto_ = _.map(profile.goto_, function(i) {
      return _.clone(i);
    });
  } else {
    this.caps = {
      apply    : true,
      clear    : true,
      write    : true,
      metadata : true,
      meter    : true,
      goto_    : true
    };

    this.apply = Action.Available();
    this.write = Action.Available();
    this.metadata = '0xffffffffffffffff';
    this.goto_ = [];
    console.log('in profile:', this.apply);
/*
 *  This is just as a reminder to move into action
 *  using the new mkActionField mechanism ...
 *
    protocol: 'ARP',
      fields: [
        mkActionField('Opcode', true, 'set_arp_op', 'set'),
        mkActionField('SHA', true, 'set_arp_sha', 'set'),
        mkActionField('SPA', true, 'set_arp_spa', 'set'),
        mkActionField('THA', true, 'set_arp_tha', 'set'),
        mkActionField('TPA', true, 'set_arp_tpa', 'set')
      ]
    }, {
      protocol: 'MPLS',
      fields: [
        mkActionField('Label', true, 'set_mpls_label', 'set'),
        mkActionField('TC', true, 'set_mpls_tc', 'set'),
        mkActionField('BOS', true, 'set_mpls_bos', 'set'),
        mkActionField('TTL', true, 'set_mpls_ttl', 'set'),
        mkActionField('TTL', true, 'dec_mpls_ttl', 'dec'),
        mkActionField('Label', true, 'push_mpls', 'push'),
      ]
    }, {
      protocol: 'VLAN',
      fields: [
        mkActionField('PCP', true, 'set_vlan_pcp', 'set'),
        mkActionField('DEI', true, 'set_vlan_dei', 'set'),
        mkActionField('VID', true, 'set_vlan_vid', 'set'),
        mkActionField('Tag', true, 'push_vlan', 'push'),
      ]
    }, {
      protocol: 'IPv4',
      fields: [
        mkActionField('DSCP', true, 'set_ip_dscp', 'set'),
        mkActionField('ECN', true, 'set_ip_ecn', 'set'),
        mkActionField('Proto', true, 'set_ip_proto', 'set'),
        mkActionField('Src', true, 'set_ipv4_src', 'set'),
        mkActionField('Dst', true, 'set_ipv4_dst', 'set'),
        mkActionField('TTL', true, 'set_nw_ttl', 'set'),
        mkActionField('TTL', true, 'dec_nw_ttl', 'dec')
      ]
    }, {
      protocol: 'IPv6',
      fields: [
        mkActionField('Src', true, 'set_ipv6_src', 'set'),
        mkActionField('Dst', true, 'set_ipv6_dst', 'set'),
        mkActionField('FLabel', true, 'set_ipv6_flabel', 'set')
      ]
    }, {
      protocol: 'ICMPv4',
      fields: [
        mkActionField('Type', true, 'set_icmpv4_type', 'set'),
        mkActionField('Code', true, 'set_icmpv4_code', 'set')
      ]
    }, {
      protocol: 'ICMPv6',
      fields: [
        mkActionField('Type', true, 'set_icmpv6_type', 'set'),
        mkActionField('Code', true, 'set_icmpv6_code', 'set')
      ]
    }, {
      protocol: 'TCP',
      fields: [
        mkActionField('Src', true, 'set_tcp_src', 'set'),
        mkActionField('Dst', true, 'set_tcp_dst', 'set')
      ]
    }, {
      protocol: 'UDP',
      fields: [
        mkActionField('Src', true, 'set_udp_src', 'set'),
        mkActionField('Dst', true, 'set_udp_dst', 'set')
      ]
    }, {
      protocol: 'SCTP',
      fields: [
        mkActionField('Src', true, 'set_sctp_src', 'set'),
        mkActionField('Dst', true, 'set_sctp_dst', 'set')
      ]
    }];
  */
}

}

Profile.TIPS = {
  apply: 'Applies actions immediately',
  clear: 'Clears the action set',
  write: 'Appends actions to the action set',
  metadata: 'Writes metadata register',
  meter: 'Sends packet to designated meter',
  goto_: 'Jumps to another flow table'
};

Profile.TESTS = {
  metadata: fgConstraints.isUInt(0, 0xffffffffffffffff),
  goto_: function(input) {
    return /^([0-9]+)(\.\.([0-9]+))?$/.test(input);
  }
};

Profile.Miss = Profile;

/*
function Apply(apply, actions) {
  if(_.isObject(apply)) {
    this.actions = apply.actions.clone();
  } else {
    this.actions = actions;
  }
}

Apply.prototype.clone = function() {
  return new Apply(this);
};

Apply.prototype.step = function(dp, ctx) {
  if(this.actions.empty()) {
    return;
  }
  return this.actions.step(dp, ctx);
};

Apply.prototype.empty = function() {
  return this.actions.empty();
};

Apply.prototype.execute = function(dp, ctx) {
  while(!this.actions.empty()) {
    this.actions.step(dp, ctx);
  }
};
*/

function Clear() {}

Clear.prototype.clone = function() { return new Clear(); };

Clear.prototype.step = function(dp, ctx) {
  ctx.actionSet.clear();
};

Clear.prototype.execute = Clear.prototype.step;
/*
function Write(write, actions) {
  if(_.isObject(write)) {
    this.actions = write.actions.clone();
  } else {
    this.actions = actions;
  }
}

Write.prototype.clone = function() {
  return new Write(this);
};

Write.prototype.step = function(dp, ctx) {
  if(this.actions.empty()) {
    return;
  }
  ctx.actionSet.push(this.actions.get());
};

Write.prototype.execute = function(dp, ctx) {
  ctx.actionSet.concat(this.actions);
};

Write.prototype.empty = function(){
  return this.actions.empty();
};
*/

function Metadata(meta, data, mask) {
  if(_.isObject(meta)) {
    this._data = meta._data.clone();
    this._mask = meta._mask.clone();
  } else {
    this._data = data.clone();
    this._mask = mask.clone();
  }
}

Metadata.prototype.clone = function() {
  return new Metadata(this);
};

Metadata.prototype.step = function(dp, ctx) {
  ctx.key.metadata.mask(this.data, this.mask);
};

Metadata.prototype.execute = Metadata.prototype.step;

function Meter(meter, meter_id) {
  if(_.isObject(meter)) {
    this.meter = new Meter(meter);
  } else {
    this.meter_id = meter_id;
  }
}

Meter.prototype.clone = function() {
  return new Meter(this);
};

Meter.prototype.step = function(dp, ctx) {
  ctx.meter = this.meter;
};

Meter.prototype.execute = Meter.prototype.step;

function Goto(jump, table) {
  if(_.isObject(jump)) {
    this.table = jump.table;
  } else {
    this.table = table;
  }
}

Goto.prototype.clone = function() {
  return new Goto(this);
};

Goto.prototype.step = function(dp, ctx) {
  ctx.table(this.table);
};

Goto.prototype.execute = Goto.prototype.step;

function Set(set) {
  if(set) {
    this._meter    = set._meter ? new Meter(set._meter) : null;
    this._apply    = new Action.List(set._apply);
    this._clear    = set._clear ? new Clear(set._clear) : null;
    this._write    = new Action.Set(set._write);
    this._metadata = set._metadata ? new Metadata(set._metadata) : null;
    this._goto     = set._goto ? new Goto(set._goto) : null;
  } else {
    this._apply = new Action.List();
    this._write = new Action.Set();
  }
}

Set.prototype.clone = function() {
  return new Set(this);
};

Set.prototype.toView = function() {
  return [{
    name: 'Meter',
      value1: 1234
  }, {
    name: 'Apply',
    set: [{
      name: 'eth',
      value1: 'src=',
      value2: '01:00:00:00:00:00'
    }, {
      name: 'vlan',
      value1: 'vid=',
      value2: '2'
    }, {
      name: 'Output',
      value1: 1
    }]
  },{
    name: 'Clear'
  },{
    name: 'Write',
    set: [{
      name: 'group',
      value1: 2
    }]
  },{
    name: 'Metadata',
    value1: '00:11:22:44:55:66:77,',
    value2: '00:ff:ff:00:00:ff:ff'
  },{
    name: 'Goto',
    value1: 5
  }];
};

Set.prototype.clear = function(clear) {
  if(clear) {
    this._clear = new Clear();
  } else if(clear === null) {
    if(this._clear) {
      delete this._clear;
    }
  } else {
    return this._clear;
  }
};

Set.prototype.apply = function(apply) {
  if(apply) {
    this._apply = new Action.List(/*null,*/ apply);
  } else {
    return this._apply;
  }
};

Set.prototype.pushApply = function(action) {
  this._apply.push(action);
};

Set.prototype.popApply = function() {
  this._apply.pop();
};

Set.prototype.write = function(write) {
  if(write) {
    this._write = new Action.Set(null, write);
  } else {
    return this._write;
  }
};

Set.prototype.pushWrite = function(action) {
  //FIXME
};

Set.prototype.popWrite = function() {
  //FIXME
};

Set.prototype.metadata = function(metadata) {
  if(_.isObject(metadata)) {
    this._metadata = new Metadata(null, metadata);
  } else if(metadata === null) {
    if(this._metadata) {
      delete this._metadata;
    }
  } else {
    return this._metadata;
  }
};

Set.prototype.meter = function(meter) {
  if(_.isObject(meter)) {
    this._meter = new Meter(null, meter);
  } else if(meter === null) {
    if(this._meter) {
      delete this._meter;
    }
  } else {
    return this._meter;
  }
};

Set.prototype.jump = function(jump) {
  if(_.isObject(jump)) {
    this._goto = new Goto(null, jump);
  } else if(jump === null) {
    if(this._goto) {
      delete this._goto;
    }
  } else {
    return this._goto;
  }
};

Set.prototype.summarize = function() {
  var result = [];
  if(this._meter) {
    result.push('meter');
  }
  if(!this._apply.empty()) {
    result.push('apply');
  }
  if(this._clear) {
    result.push('clear');
  }
  if(!this._write.empty()) {
    result.push('write');
  }
  if(this._metadata) {
    result.push('metadata');
  }
  if(this._goto) {
    result.push('goto');
  }
  return result.join(', ');
};

Set.prototype.step = function(dp, ctx) {
  if(this._meter && this._meter.step(dp, ctx)) {
    delete this._meter;
    return true;
  }
  if(!this._apply.empty() && this._apply.step(dp, ctx)) {
    return true;
  }
  if(this._clear) {
    this._clear.step(dp, ctx);
    delete this._clear;
    return true;
  }
  if(!this._write.empty() && this._write.step(dp, ctx)) {
    return true;
  }
  if(this._metadata) {
    this._metadata.step(dp, ctx);
    delete this._metadata;
    return true;
  }
  if(this._goto) {
    this._goto.step(dp, ctx);
    delete this._goto;
    return true;
  }
  return false;
};

Set.prototype.empty = function() {
  return this._meter || this._clear || this._write || this._metadata ||
         this._goto;
};

Set.prototype.execute = function(dp, ctx) {
  while(this.step(dp, ctx)) {}
};

return {
  Apply: Action.List,
  Write: Action.Set,
  Metadata: Metadata,
  Meter: Meter,
  Goto: Goto,
  Set: Set,
  Instruction: Instruction,
  Profile: Profile
};

});
