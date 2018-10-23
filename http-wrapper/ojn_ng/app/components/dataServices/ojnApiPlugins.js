'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiHelpers',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnApiAccount',

], function () {
angular.module('ojnApiModule')
  .factory('ojnApiPlugins', function ($http, $q, ojnApiAccount, ojnApiHelpers) {
    console.log("ojnApiPlugins ready for duty");
    var _baseApiPath = "/ojn_api/json";
    var _pluginsApiPath = _baseApiPath + "/plugins";
    
    var _loadedPlugins = {};
    
    var _getAllPluginsData = function(cb) {
      var url = _pluginsApiPath + "/getAllPluginsData?"+ojnApiAccount.getTokenUrl();
      $http.get(url).then(
        function (response) {
          if (cb)
            cb(response.data);
        },
        function (error){ 
          
          if (cb)
            cb(undefined);
        }
      );
    };
    
    
    var _registerPlugin = function(pluginInfo) {
      console.log("Registering new plugin : " + pluginInfo.Name);
      if (_loadedPlugins[pluginInfo.Name] == undefined)
      {
        _loadedPlugins[pluginInfo.Name] = pluginInfo;
        console.log("new Plugin registered : " + pluginInfo);
      }
    };
    
    var _getPluginInfo = function (name) {
      return _loadedPlugins[name];
    };
    
    
    return {
      getAllPluginsData: function () {
        var defer = $q.defer();
        _getAllPluginsData(function (data) { defer.resolve(data);});
        return defer.promise;
      },
      registerPlugin : function (pluginInfo){
        _registerPlugin(pluginInfo);
      },
      getPluginInfo : function (pluginName){
        return _loadedPlugins[pluginName]
      },
    }
  });
});
