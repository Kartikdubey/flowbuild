
msg = require('../rest/msg');

exports.success = msg.success;
exports.error = msg.error;
exports.test = msg.test;

exports.noDatabaseConnection = function() {
  return msg.error({
    system: "session/adapter",
    type: "noDatabaseConnection"
  });
}

exports.unknownError = function() {
  return msg.error({
    system: "session/adapter",
    type: "unknownError"
  });
}
