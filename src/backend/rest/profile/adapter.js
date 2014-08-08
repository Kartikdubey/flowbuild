var msg = require('./msg');
var orm = require('../../dbbs');
var subAdapter = require('../subscriber/adapter');

var Profile = orm.model("switch_profile");
var DpCaps = orm.model("dp_caps");
var FtCaps = orm.model("ft_caps");

// ----------------------------------------------------------------------------
// Profile

// create the profile and any related table entries whose fields 
// can be inferred based on the ofp_version
function createProfile(subId, name, ver, cb) {
  var prof;
  Profile.create({ 
    subscriber_id: subId, 
    name: name, 
    ofp_version: ver 
  }).then(function(profile) { 
    prof = profile; 
    return DpCaps.create(generateDpCaps(prof.id, ver)); 
  }).then(function(dp_caps) { 
    return FtCaps.create(generateFtCaps(dp_caps.id, ver)); 
  }).then(function(ft_caps) { cb(msg.success(prof)) })
}

// Where should I put this?
function generateDpCaps(profId, version) {
  if (version == 1) 
    return {
      profile_id:    profId,
      vp_all:        true, 
      vp_controller: true, 
      vp_table:      true,
      vp_in_port:    true,
      vp_any:        true,
      vp_local:      true,
      vp_normal:     true,
      vp_flood:      true
    }
}

// Where should I put this?
function generateFtCaps(dpId, version) {
  if (version == 1) 
    return {
      dp_id:       dpId,
      table_id:    1,
      max_entries: 1
    }
}

function fetchProfile(profileInfo, cb) {
  Profile.find({ where: profileInfo })
    .success(function(result) {
      if (result == null) cb(msg.profileNotFound());
      else cb(msg.success(result));
    }).error(function(err) { cb(msg.unknownError(err)); });
}

function fetchProfileDetails(profile, cb) {
  var dp_caps, ft_caps;
  profile.getDpCaps()
  .then(function(dpCaps){
    dp_caps = dpCaps.values;
    return dpCaps.getFtCaps()
  }).then(function(ftCaps){
    ft_caps = ftCaps.values;
    cb(msg.success({ dp_caps: dp_caps, ft_caps: ft_caps }))
  })
}

function listProfiles(subId, cb) {
  // way 1: find all by sub_id

  // Profile.findAll({ where: { subscriber_id: subId } })
  //   .success(function(profiles) { cb(msg.success(profiles)); })
  //   .error  (function(err)      { cb(msg.unknownError(err)); })

  // way 2: find sub, then use sub.getProfiles

  subAdapter.fetchSubscriber({ id: subId }, function(result) { 
    result.value.getProfiles({attributes: ['id', 'name']})
      .success(function(result) { cb(msg.success(result)); })
      .error  (function(err)    { cb(msg.unknownError(err)); });
  }); 
}

function updateProfile(profile, newProfileInfo, cb) {
  profile.updateAttributes(newProfileInfo)
    .success(function(result) { cb(msg.success(result)); })
    .error  (function(err)    { cb(msg.unknownError(err)); });
}

function destroyProfile(profile, cb) {
  profile.destroy()
    .success(function(result) { cb(msg.success()); })
    .error  (function(err)    { cb(msg.unknownError(err)); });
}

exports.createProfile         = createProfile;
exports.fetchProfile          = fetchProfile;
exports.fetchProfileDetails   = fetchProfileDetails;
exports.listProfiles          = listProfiles;
exports.updateProfile         = updateProfile;
exports.destroyProfile        = destroyProfile;
