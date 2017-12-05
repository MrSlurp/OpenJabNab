'use strict';

define([
  'angular',
], function () {
angular.module('ojnngModule', [])
  .factory('ojnngError', function () {
    console.log("ojnngError ready for duty");
    var _subscribers = [];
    return {
      subscribe: function (callback) {
        _subscribers.push(callback);
      },
      notifyError: function(msg){
        console.log("error = " + msg);
        _subscribers.forEach(function(item) {
          item({type:"error", message:msg});
        });
      }
    }
  });
});
