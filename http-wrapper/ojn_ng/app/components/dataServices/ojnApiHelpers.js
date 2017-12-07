'use strict';

define([
  'angular',
], function () {
angular.module('ojnApiModule')
  .service('ojnApiHelpers', function () {
    console.log("ojnApiHelpers ready");
    
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
  });
});