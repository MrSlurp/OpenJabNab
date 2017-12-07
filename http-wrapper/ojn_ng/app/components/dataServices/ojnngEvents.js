'use strict';

define([
  'angular',
  'app/components/dataServices/ojnngError',  
], function () {
angular.module('ojnngModule')
  .factory('ojnngEvents', function () {
    console.log("ojnngEvents ready for duty");
    var _events = {};
    
    return {
      subscribe: function (eventName, callback) {
        if (_events[eventName] != undefined)
        {
          console.log("Subscribed event " + eventName);
          _events[eventName].push(callback);
        }
        else
        {
          console.log("Registered and subscribed new event " + eventName);
          _events[eventName] = [callback];
        }
      },
      notifyEvent: function(eventName, param){
        console.log("fire event " + eventName);
        if (_events[eventName] != undefined)
        {
          _events[eventName].forEach(function(item) {
            item(param);
          });
        }
      }
    }
  });
});
