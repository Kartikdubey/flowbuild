'use strict';

/**
 * @ngdoc service
 * @name flowsimUiApp.fgUi
 * @description
 * # fgUi
 * Service in the flowsimUiApp.
 */

function mkLabelInput(name, value, test, tip) {
  return {
    name: name,
    value: value,
    test: test,
    tip: tip
  };
}

function stripLabelInputs(lis) {
  var result = {};
  _.each(lis, function(item) {
    result[li.name] = li.value;
  });
  return result;
}

angular.module('flowsimUiApp')
  .factory('fgUI', function() {
    return {
      mkLabelInput: mkLabelInput,
      stripLabelInputs: stripLabelInputs
    };
  });

