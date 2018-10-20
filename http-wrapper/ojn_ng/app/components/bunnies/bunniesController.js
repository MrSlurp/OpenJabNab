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
        
    $scope.userBunnies = [];
    $scope.selectedBunny = undefined;
    
    var _update = function () {
      if (!ojnApiAccount.hasToken())
        return;
      ojnApiBunnies.getUserBunnies().then(function(data){
        if (data != undefined && data.bunnies != undefined)
        {
          // select a rabbit if nothing is selected, and  select it before 
          // updating $scope.userBunnies to avoid update glitch on selected rabbit
          if (!$scope.selectedBunny && data.bunnies.length > 0)
            $scope.SelectBunny(data.bunnies[0]);

          $scope.userBunnies = data.bunnies;
          for (var b in $scope.userBunnies)
          {
            var bunnyUpdateFunc = function(bunny)
            {
              console.log("Requesting config data for bunny : " + bunny.Name);
              ojnApiBunny.getFullConfig(bunny.MAC).then(function(data){
                console.log("Updating config data for bunny : " + bunny.Name);
                bunny.Config = data;
                
                if (bunny.selectedSimpleClickAction == undefined)
                  bunny.selectedSimpleClickAction = bunny.Config.GlobalSettings.singleClickPlugin;
                  
                if (bunny.selectedDoubleClickAction == undefined)
                  bunny.selectedDoubleClickAction = bunny.Config.GlobalSettings.doubleClickPlugin;
                  
              });
            }
            bunnyUpdateFunc($scope.userBunnies[b]);
          }
        }
        else
          $scope.userBunnies = {};
      });
    }
    
    $scope.SelectBunny = function(bunny)
    {
      // handle some kind of dirty flag if current selection is modified
      $scope.selectedBunny = bunny;
    };
    
    $scope.SaveButtonAction = function()
    {
      ojnApiBunny.setButtonsActions($scope.selectedBunny.MAC, $scope.selectedBunny.selectedSimpleClickAction, $scope.selectedBunny.selectedDoubleClickAction);
      /*
      if (bunny.selectedSimpleClickAction == undefined)
        bunny.selectedSimpleClickAction = bunny.Config.GlobalSettings.singleClickPlugin;
        
      if (bunny.selectedDoubleClickAction == undefined)
        bunny.selectedDoubleClickAction = bunny.Config.GlobalSettings.doubleClickPlugin;
      */
    };
    
    // this one should not change while editing config, load it first
    /*
    var _updatePlugins = function() {
      ojnApiPlugins.getAllPluginsData().then(function(data) {
        _pluginsData = data;
        // load bunnies data once all plugin data are gathered
        _update();
      });
    }*/
    
    ojnngEvents.subscribe("TokenChanged", function() {
      _update();
    });
    _update();
  });
});
