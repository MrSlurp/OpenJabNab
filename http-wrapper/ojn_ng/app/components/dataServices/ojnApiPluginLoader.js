'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule', 
], function () {
angular.module('ojnApiModule')
  .service('ojnApiPluginLoader', function () {
    console.log("ojnApiPluginLoader ready");
    _pluginCache = {};
    this.loadPlugin = function(pluginName)
    {
        var defer = $q.defer();
        // load and recompile?
        return defer.promise;
    
    }
  });
});