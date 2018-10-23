'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiAccount',
  'app/components/dataServices/ojnApiHelpers',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnngEvents',
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiBunny', function ($http, $q, ojnApiAccount, ojnApiHelpers, ojnngEvents) {
    console.log("ojnApiBunny ready for duty");
    var _baseApiPath = "/ojn_api/json";
    var _bunnyApiPath = _baseApiPath + "/bunny";
    
    var _doBunnyRename = function(mac, newName, cb)
    {
      var url = _bunnyApiPath + "/"+ mac + "/setBunnyName?" + ojnApiAccount.getTokenUrl() + "&name=" + newName;
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
            ojnngEvents.notifyEvent("UserNotifySuccess", "Lapin renommé avec succès ("+response.data.message+")");
          else
            ojnngEvents.notifyEvent("UserNotifyError", "Erreur lors du renommage, le serveur à répondu : " + response.data.message);
        
          if (cb) cb(response.data);
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          if (cb) cb();
        }
      );
    };
    
    var _getFullConfig = function(mac, cb)
    {
      var url = _bunnyApiPath + "/"+ mac + "/getBunnyFullConfig?" + ojnApiAccount.getTokenUrl();
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
          {
            //ojnngEvents.notifyEvent("UserNotifySuccess", "Lapin renommé avec succès ("+response.data.message+")");
          }
          if (cb) cb(response.data);
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          if (cb) cb();
        }
      );
    };
    
    var _setButtonsClickPlugins = function(mac, simpleClickPlugin, doubleClickPlugin)
    {
      var url = _bunnyApiPath + "/"+ mac + "/setSingleClickPlugin?" + ojnApiAccount.getTokenUrl() + "&name="+ (simpleClickPlugin != undefined? simpleClickPlugin : "none");
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
          {
            ojnngEvents.notifyEvent("UserNotifySuccess", "Configuration enregistré ("+response.data.message+")");
            var url = _bunnyApiPath + "/"+ mac + "/setDoubleClickPlugin?" + ojnApiAccount.getTokenUrl() + "&name="+ (doubleClickPlugin != undefined? doubleClickPlugin : "none");
            $http.get(url).then(
              function (response) {
                if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
                {
                  ojnngEvents.notifyEvent("UserNotifySuccess", "Configuration enregistré ("+response.data.message+")");
                }
              },
              function (error){ 
                ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
                if (cb) cb();
              }
            );
          }
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          if (cb) cb();
        }
      );
    
    };

    return {
      doBunnyRename: function (mac, newName) {
        var defer = $q.defer();
        _doBunnyRename(mac, newName, function () { defer.resolve();});
        return defer.promise;
      },
      getFullConfig: function (mac) {
        var defer = $q.defer();
        _getFullConfig(mac, function (response) { defer.resolve(response);});
        return defer.promise;
      },
      setButtonsActions: function (mac, simpleClick, doubleClick) {
        _setButtonsClickPlugins(mac, simpleClick, doubleClick);
      }
    };
  });
});
