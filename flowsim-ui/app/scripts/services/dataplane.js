'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.dataplane
 * @description
 * # dataplane
 * Service in the flowsimUiApp.
 */
angular.module('flowsimUiApp')
  .factory('Dataplane', function(ETHERNET, VLAN, MPLS, ARP, IPV4, IPV6, ICMPV4, 
                                 ICMPV6, SCTP, TCP, UDP) {
    // AngularJS will instantiate a singleton by calling "new" on this function
   
// This is the primary datastructure that follows the packet through the
// pipeline
function Context() { //packet, buffer_id, in_port) {
  this.stage     = 'arrival';
  this.packet    = null;           // packet data
  this.buffer_id = null;

  // All contents of a key are just a reference to actual packet
  this.key = {      // extracted key
    in_port: null,  // in_port always present
    vlan: [],       // vlan is a stack
    mpls: [],       // mpls is a stack
  };

  this.actionSet = [];     // action set carried
  this._metadata = null;   // metadata carried
  this._meter = null;      // meter to apply
  this._table = 0;         // goto table - default is table 0
}

// Clear the action set
Context.prototype.clear = function() {
  this.actionSet = [];
};

// Write (append) actions to the action set
Context.prototype.write = function(actions) {
  this.actionSet.concat(actions);
};

// set or get the metadata
Context.prototype.metadata = function(metadata) {
  if(metadata !== undefined && metadata !== null) {
    this._metadata = metadata;
  } else {
    return this._metadata;
  }
};

// set or get the meter id
Context.prototype.meter = function(meter) {
  if(meter !== undefined && meter !== null) {
    this._meter = meter;
  } else {
    return this._meter;
  }
};

// set or get the next table id
Context.prototype.table = function(table) {
  if(table !== undefined && table !== null) {
    this._table = table;
  } else {
    return this._table;
  }
};
 
function extract_ethernet(eth, key) {
  key.eth_src  = eth.src;
  key.eth_dst  = eth.dst;
  key.eth_type = eth.typelen;
}

function extract_vlan(vlan, key) {
  key.vlan.push({
    id: vlan.id,
    pcp: vlan.pcp
  });
}

function extract_arp(arp, key) {
  key.arp_op  = arp.opcode;
  key.arp_sha = arp.sdrHwAddr;
  key.arp_spa = arp.sdrProtoAddr;
  key.arp_tha = arp.tgtHwAddr;
  key.arp_tpa = arp.tgtProtoAddr;
}

function extract_mpls(mpls, key) {
  key.mpls.push({
    label : mpls.label,
    tc    : mpls.tc,
    bos   : mpls.bos
  });
}

function extract_ipv4(ipv4, key) {
  key.ip_dscp  = ipv4.dscp;
  key.ip_ecn   = ipv4.ecn;
  key.ip_proto = ipv4.proto;
  key.ip_src   = ipv4.src;
  key.ip_dst   = ipv4.dst;
}

function extract_ipv6(ipv6, key) {
  key.ip_dscp    = ipv6.dscp;
  key.ip_ecn     = ipv6.ecn;
  key.ip_proto   = ipv6.proto;
  key.ip_src     = ipv6.src;
  key.ip_dst     = ipv6.dst;
  key.flow_label = ipv6.flowLabel;
  key.ext_hdr    = ipv6.extHdr;
}

function extract_icmpv4(icmpv4, key) {
  key.icmpv4.type = icmpv4.type;
  key.icmpv4.code = icmpv4.code;
}

function extract_icmpv6(icmpv6, key) {
  key.icmpv6.type      = icmpv6.type;
  key.icmpv6.code      = icmpv6.code;
  key.icmpv6.nd_tgt    = icmpv6.ndTgtAddr;
  key.icmpv6.nd_ll_src = icmpv6.ndLLSrc;
  key.icmpv6.nd_ll_tgt = icmpv6.ndLLTgt;
}

function extract_sctp(sctp, key) {
  key.sctp_src = sctp.src;
  key.sctp_dst = sctp.dst;
}

function extract_tcp(tcp, key) {
  key.tcp_src = tcp.src;
  key.tcp_dst = tcp.dst;
}

function extract_udp(udp, key) {
  key.udp_src = udp.src;
  key.udp_dst = udp.dst;
}

function extraction(ctx) {
  _.each(ctx.packet.protocols, function(protocol) {
    switch(protocol.name) {
      case ETHERNET.NAME:
        extract_ethernet(protocol, ctx.key);
        break;
      case VLAN.NAME:
        extract_vlan(protocol, ctx.key);
        break;
      case ARP.NAME:
        extract_arp(protocol, ctx.key);
        break;
      case MPLS.NAME:
        extract_mpls(protocol, ctx.key);
        break;
      case IPV4.NAME:
        extract_ipv4(protocol, ctx.key);
        break;
      case IPV6.NAME:
        extract_ipv6(protocol, ctx.key);
        break;
      case ICMPV4.NAME:
        extract_icmpv4(protocol, ctx.key);
        break;
      case ICMPV6.NAME:
        extract_icmpv6(protocol, ctx.key);
        break;
      case SCTP.NAME:
        extract_sctp(protocol, ctx.key);
        break;
      case TCP.NAME:
        extract_tcp(protocol, ctx.key);
        break;
      case UDP.NAME:
        extract_udp(protocol, ctx.key);
        break;
    }
  });
}

function ActionSet() {
  this.actions = {};
}

ActionSet.prototype.add = function(action) {
  this.actions[action.name] = action.value;
};

ActionSet.prototype.execute = function(ctx) {
};

function ActionList(actions) {
  this.actions = actions;
}

ActionList.prototype.execute = function(ctx) {
  var tmp;
  _.each(this.actions, function(action) {
    tmp = action.execute(ctx);
    if(tmp) {
      // clone the packet
    }
  });
};

function Output() {}
Output.prototype.execute = function(ctx) {};

function Group() {}
Group.prototype.execute = function(ctx) {};

function Queue() {}
Queue.prototype.execute = function(ctx) {};

function Apply(actions) {
  this.actionList = actions;
}

Apply.prototype.execute = function(ctx) {
  var ctxs = [];
  _.each(this.actionList, function(action) {
    ctxs.push(action.execute(ctx))
  });
  return ctxs;
};

function Clear() {}

Clear.prototype.execute = function(ctx) {
  ctx.actionSet = [];
  return [ctx];
};

function Write(actions) {
  this.actionList = actions;
}

Write.prototype.execute = function(ctx) {
  ctx.actionSet.concat(this.actionList);
  return [ctx];
};

function Metadata(metadata) {
  this.metadata = metadata;
}

Metadata.prototype.execute = function(ctx) {
  ctx.metadata(this.metadata);
  return [ctx];
};

function Meter(meter_id) {
  this.meter_id = meter_id;
}

Meter.prototype.execute = function(ctx) {
  ctx.meter(this.meter_id);
  return [ctx];
};

function Goto(table_id) {
  this.table_id = table_id;
}

Goto.prototype.execute = function(ctx) {
  ctx.table(this.table_id);
  return [ctx];
};

function Dataplane(trace) {
  this.trace = trace;
  this.evId  = 0;
  this.ev    = trace.events[this.pktId];
  this.stage = 'arrival';

  this.ctxs = [];      // There can be more than 1 ctx (pkt copy)
  this.ctx  = null;

  this.tables = trace.switch_.tables;
  this.table  = null;
  this.flow   = null;
}

Dataplane.prototype.arrival = function(pkt, in_port) {
  this.ctx.packet      = pkt;
  this.ctx.buffer_id   = 1;
  this.ctx.key.in_port = in_port;
};

Dataplane.prototype.extraction = function() {
  extraction(this.ctx);
};

Dataplane.prototype.choice = function() {
  this.table = this.tables[this.ctx.tableid];
};

Dataplane.prototype.selection = function(table, key) {
  return 'Im a flow';
};

Dataplane.prototype.execution = function(flow) {
  var ctxs = [];
  _.each(flow.instructions, function(ins) {
    ctxs.concat(ctxs.ins.execute(ctx);
  }):
  return [this.ctx];
};

Dataplane.prototype.egress = function() {
};

Dataplane.prototype.step = function() {
  var oldId;

  if(this.evId >= this.ev.length) {
    return;
  }
  if(this.ctx === null) {
    this.ctx = new Context();
    this.ctxs = [this.ctx];
  }

  switch(this.ctx.stage) {
    case 'arrival':
      // need to implement packet buffer mechanism
      this.arrival(this.ev.packet, this.ev.in_port);
      this.ctx.stage = 'extraction';
      break;
    case 'extraction':
      this.extraction();
      this.ctx.stage = 'choice';
      break;
    case 'choice':
      this.table = this.tables[this.ctx.tableId];
      this.ctx.stage = 'selection';
      break;
    case 'selection':
      this.selection(this.table, this.ctx.key);
      this.ctx.stage = 'execution';
      break;
    case 'execution':
      oldId = this.ctx.table;
      this.ctxs = this.execution(this.flow); 
      this.ins = null;
      if(oldId === this.ctx.table) {
        this.ctx.stage = 'egress';
      } else {
        this.ctx.stage = 'choice';
      }
      break;
    case 'egress':
      this.egress();
      this.ctxs.splice(0, 1);
      if(this.ctxs.length) {
        this.ctx = this.ctxs[0];
        this.ctx.stage = 'choice';
      } else {
        this.ctx = null;
        this.evId++;
      }
      break;
    default:
      throw 'Bad stage: ' + this.stage;
  }
};

return {
};
  
});
