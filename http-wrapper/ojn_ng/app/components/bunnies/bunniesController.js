'use strict';

define([
  'app/components/bunnies/module',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiGlobal',
  'app/components/dataServices/ojnApiBunnies',
  'app/components/dataServices/ojnApiAccount',
  'app/components/dataServices/ojnApiBunny',
  'app/components/dataServices/ojnngEvents',
  
], function (module) {
  module.controller('bunniesCtrl', function ($scope, ojnApiGlobal, ojnApiBunnies, ojnApiBunny, ojnApiAccount, ojnApiPlugins, ojnngEvents) {
    console.log("bunniesCtrl Controller reporting for duty.");
        
    $scope.userBunnies = {};

    var _update = function () {
      if (!ojnApiAccount.hasToken())
        return;
      ojnApiBunnies.getUserBunnies().then(function(data){
        if (data != undefined && data.bunnies != undefined)
        {
          $scope.userBunnies = data.bunnies;
          for (var b in $scope.userBunnies)
          {
            var bunny = $scope.userBunnies[b];
            ojnApiBunny.getFullConfig(bunny.MAC).then(function(data){
              bunny.Config = data;
            });
          }
        }
        else
          $scope.userBunnies = {};
      });
    }
    
    ojnngEvents.subscribe("TokenChanged", function() {
      _update();
    });
    _update();

  });
});
