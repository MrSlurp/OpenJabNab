'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiAccount',
  'app/components/dataServices/ojnApiHelpers',
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
            ojnngEvents.notifyEvent("UserNotifySucess", "Lapin renommé avec succès ("+response.data.message+")");
          else
            ojnngEvents.notifyEvent("UserNotifyError", "Erreur lors du renommage, le serveur à répondu : " + response.data.message);
        
          if (cb) cb();
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          if (cb) cb();
        }
      );
    }

    return {
      doBunnyRename: function (mac, newName) {
        var defer = $q.defer();
        _doBunnyRename(mac, newName, function () { defer.resolve();});
        return defer.promise;
      }
    }
  });
});
