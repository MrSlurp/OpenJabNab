'use strict';

define([
  'angular',
], function () {
angular.module('ojnApiModule')
  .service('ojnApiHelpers', function () {
    console.log("ojnApiHelpers ready");
    var _localSimu = false;
    //var _localSimu = true;
    this.isErrorApiStatusMessage = function(value)
    {
      if (value == undefined || value["status"] == undefined)
      {
        //console.log("_isErrorApiStatusMessage = " + value);
        return false;
      }
        
      if (value["status"] == "error")
      {
        return true;
      }
      else if (value["status"] != "ok")
      {
        return true;
      }        
      return false;
    }
    this.handleSimuRequest = function(cb, data)
    {
      if (_localSimu == true)
      {
        if (cb)
          cb(data);
        return true;
      }
      return false;
    }
  });
});