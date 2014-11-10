'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.dataplane
 * @description
 * # dataplane
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('Action', function(ETHERNET, VLAN, MPLS, ARP, IPV4, IPV6, ICMPV4, 
                                 ICMPV6, SCTP, TCP, UDP) {

function Output(port_id) {
  this.port_id = port_id;
}

Output.prototype.execute = function(dp, ctx) {
  dp.output(this.port_id, null, ctx);
};

Output.prototype.clone = function() {
  return new Output(this.port_id);
};

function Group(group_id) {
  this.group_id = group_id;
}

Group.prototype.execute = function(dp, ctx) {
  dp.output(null, this.group_id, ctx);
};

Group.prototype.clone = function() {
  return new Group(this.group_id);
};

function Queue(queue_id) {
  this.queue_id = queue_id;
}

Queue.prototype.execute = function(dp, ctx) {
  ctx.queue_id = this.queue_id;
};

Queue.prototype.clone = function() {
  return new Queue(this.queue_id);
};

function SetField(sf, proto, field, value) {
  if(_.isObject(sf)) {
    _.extend(this, sf);
    this.value = sf.value.clone();
  } else {
    this.protocol = proto;
    this.field    = field;
    this.value    = value;
  }
}

SetField.prototype.clone = function() {
  return new SetField(this);
};

SetField.prototype.step = function(dp, ctx) {
  var protocol = _.find(ctx.packet.protocols, function(protocol) {
    return protocol.name === this.protocol && _(protocol).has(this.field);
  }, this);
  if(protocol) {
    protocol[this.field] = this.value;
  } else {
    console.log('SetField(%s, %s, %s) Miss', this.protocol, this.field, 
                this.value.toString());
  }
};

SetField.prototype.execute = function(dp, ctx) {
  var i, protocols, protocol;
  protocols = ctx.packet.protocols;
  for(i=0; i<protocols.length; ++i) {
    protocol = protocols[i];
    if(protocols[i].name === this.protocol && _(protocol).has(this.field)) {
      protocols[i][this.field] = this.value;
      return;
    }
  }
};

SetField.prototype.clone = function() {
  return new SetField(this.protocol, this.field, this.value);
};

function Set() {
  this.actions = {};
}

Set.prototype.clear = function() {
  this.actions = {};
};

Set.prototype.concat = function(rhs) {
  var self = this;
  _.each(rhs.actions, function(key, val) {
    if(key === 'pop') {
      _.each(val, function(_key, _val) {
        self.actions.pop[_key] = _val.clone();
      });
    } else if(key === 'setField') {
      _.each(val, function(_key, _val) {
        self.actions.setField[_key] = _val.clone();
      });
    } else {
      self.actions[key] = val.clone();
    }
  });
};

Set.prototype.copy_ttl_in = function(action) {
  if(action) {
    this.actions.copy_ttl_in = action;
  }
};

Set.prototype.pop_mpls = function(action) {
  if(action) {
    if(!_(this.actions).has('pop_mpls')) {
      this.actions.pop_mpls = [];
    }
    this.actions.pop_mpls.push(action);
  }
};

Set.prototype.pop_pbb = function(action) {
  if(action) {
    if(!_(this.actions).has('pop_pbb')) {
      this.actions.pop_pbb = [];
    }
    this.actions.pop_pbb.push(action);
  }
};

Set.prototype.pop_vlan = function(action) {
  if(action) {
    if(!_(this.actions).has('pop_vlan')) {
      this.actions.pop_vlan = [];
    }
    this.actions.pop_vlan.push(action);
  }
};

Set.prototype.push_mpls = function(action) {
  if(action) {
    if(!_(this.actions).has('push_mpls')) {
      this.actions.push_mpls = [];
    }

    this.actions.push_mpls = action;
  }
};

Set.prototype.push_pbb = function(action) {
  if(action) {
    if(!_(this.actions).has('push_pbb')) {
      this.actions.push_pbb = [];
    }
    this.actions.push_pbb = action;
  }
};

Set.prototype.push_vlan = function(action) {
  if(action) {
    if(!_(this.actions).has('push_vlan')) {
      this.actions.push_vlan = [];
    }
    this.actions.push_vlan = action;
  }
};

Set.prototype.dec_ttl = function(action) {
  if(action) {
    this.actions.dec_ttl = action;
  }
};

Set.prototype.setField = function(action) {
  if(!_(this.actions).has('setField')) {
    this.actions.setField = {};
  }
  if(!_(this.actions.setField).has(action.protocol)) {
    this.actions.setField[action.protocol] = {};
  }
  this.actions.setField[action.protocol][action.field] = action;
};

Set.prototype.queue = function(action) {
  if(action) {
    this.actions.queue = action;
  }
};

Set.prototype.group = function(action) {
  if(action) {
    this.actions.group = action;
    if(_(this.actions).has('output')) {
      delete this.actions.output;
    }
  }
};

Set.prototype.output = function(action) {
  if(action && !_(this.actions).has('group')) {
    this.actions.output = action;
  }
};

Set.prototype.stepSetField = function(dp, ctx, proto) {
  var key;
  if(_(this.actions.setField).has(proto)) {
    key = _(this.actions.setField[proto]).keys()[0];
    this.actions.setField[proto][key].step(dp, ctx);
    delete this.actions.setField[proto][key];
    if(_(this.actions.setField[proto]).keys().length === 0) {
      delete this.actions.setField[proto];
    }
    if(_(this.actions.setField).keys().length === 0) {
      delete this.actions.setField;
    }
    return true;
  } else {
    return false;
  }
};

Set.prototype.stepArray = function(dp, ctx, name) {
  var state = false;
  if(_(this.actions).has(name)) {

    if(this.actions[name].length > 0) {
      this.actions[name][0].step(dp, ctx);
      this.actions[name].splice(0, 1);
      state = true;
    }

    if(this.actions[name].length === 0) {
      delete this.actions[name];
    }
  }
  return state;
};

Set.prototype.empty = function() {
  return _(this.actions).keys().length === 0;
};

// Execute the action set in a precise ordering
Set.prototype.step = function(dp, ctx) {
 
  if(this.actions.copy_ttl_in) {
    this.actions.copy_ttl_in.step(dp, ctx);
    delete this.actions.copy_ttl_in;
    return;
  }

  if(this.stepArray(dp, ctx, 'pop_mpls')) {
    return;
  } else if(this.stepArray(dp, ctx, 'pop_pbb')) {
    return;
  } else if(this.stepArray(dp, ctx, 'pop_vlan')) {
    return;
  } else if(this.stepArray(dp, ctx, 'push_mpls')) {
    return;
  } else if(this.stepArray(dp, ctx, 'push_pbb')) {
    return;
  } else if(this.stepArray(dp, ctx, 'push_vlan')) {
    return;
  }

  if(this.actions.copy_ttl_out) {
    this.actions.copy_ttl_out.step(dp, ctx);
    delete this.actions.copy_ttl_out;
    return;
  }

  if(this.actions.dec_ttl) {
    this.actions.dec_ttl.step(dp, ctx);
    delete this.actions.dec_ttl;
    return;
  }

  if(_(this.actions).has('setField')) {
    if(_(this.actions.setField).keys().length > 0) {
      if(this.stepSetField(dp, ctx, ETHERNET.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, VLAN.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, ARP.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, MPLS.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, IPV4.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, IPV6.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, ICMPV4.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, ICMPV6.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, TCP.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, UDP.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, SCTP.name)) {
        return;
      } else if(this.stepSetField(dp, ctx, ETHERNET.name)) {
        return;
      } else {
        throw 'Bad setField keys: '+this.actions.setField.keys();
      }
    }
  }

  if(this.actions.queue) {
    this.actions.queue.step(dp, ctx);
    delete this.actions.queue;
    return;
  }
 
  // Execute group if present or output if present
  if(this.actions.group) {
    this.actions.group.step(dp, ctx);
    delete this.actions.group;
    return;
  }
  if(this.actions.output) {
    this.actions.output.step(dp, ctx);
    delete this.actions.output;
    return;
  }
};

Set.prototype.execute = function(dp, ctx) {
  while(!this.empty()) {
    this.step(dp, ctx);
  }
};

function List() {
  this.actions = [];
}

List.prototype.add = function(action) {
  this.actions.push(action);
};

List.prototype.execute = function(dp, ctx) {
  _.each(this.actions, function(action) {
    action.execute(dp, ctx);
  });
};

return {
  Output: Output,
  Group: Group,
  Queue: Queue,
  SetField: SetField,
  Set: Set,
  List: List
};
  
});
