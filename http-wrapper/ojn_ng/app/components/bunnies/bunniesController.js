'use strict';

define([
  'app/components/bunnies/module',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiGlobal',
  'app/components/dataServices/ojnApiBunnies',
  'app/components/dataServices/ojnApiAccount',
  'app/components/dataServices/ojnApiBunny',
  'app/components/dataServices/ojnApiPlugins',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnngEvents',
  //'app/components/plugins/surprise/index',
  
], function (module) {
  module.controller('bunniesCtrl',  function ($scope, ojnApiGlobal, ojnApiBunnies, ojnApiBunny, ojnApiAccount, ojnApiPlugins, ojnngEvents) {
    console.log("bunniesCtrl Controller reporting for duty.");
        
    $scope.userBunnies = [];
    $scope.selectedBunny = undefined;
    
    var _getSelectedBunnyPluginByName = function(pluginName) {
      if ($scope.selectedBunny == undefined 
          || $scope.selectedBunny.Config == undefined
          || pluginName == undefined )
        return undefined;
        
      for (var i in $scope.selectedBunny.Config.Plugins)
      {
        if ($scope.selectedBunny.Config.Plugins[i].Name == pluginName)
          return $scope.selectedBunny.Config.Plugins[i];
      }
      return undefined;
    };
    
    var _update = function () {
      if (!ojnApiAccount.hasToken())
        return;
      ojnApiBunnies.getUserBunnies().then(function(data){
        if (data != undefined && data.bunnies != undefined)
        {
          // select a rabbit if nothing is selected, and select it before 
          // updating $scope.userBunnies to avoid update glitch on initially selected rabbit
          if (!$scope.selectedBunny && data.bunnies.length > 0)
            $scope.SelectBunny(data.bunnies[0]);

          $scope.userBunnies = data.bunnies;
          
          var bunnyUpdateFunc = function(bunny)
          {
            console.log("Requesting config data for bunny : " + bunny.Name);
            ojnApiBunny.getFullConfig(bunny.MAC).then(function(data){
              console.log("Updating config data for bunny : " + bunny.Name);
              bunny.Config = data;
              
              if (bunny.selectedSimpleClickPlugin == undefined)
                bunny.selectedSimpleClickPlugin = _getSelectedBunnyPluginByName(bunny.Config.GlobalSettings.singleClickPlugin);
                
              if (bunny.selectedSimpleClickPlugin == undefined)
                bunny.selectedDoubleClickPlugin = _getSelectedBunnyPluginByName(bunny.Config.GlobalSettings.doubleClickPlugin);
                
            });
          }
          
          for (var b in $scope.userBunnies)
          {
            bunnyUpdateFunc($scope.userBunnies[b]);
          }
        }
        else
          $scope.userBunnies = {};
      });
    }
    
    $scope.SelectBunny = function(bunny)
    {
      // TODO : handle some kind of dirty flag if current selection is modified
      $scope.selectedBunny = bunny;
    };

    $scope.SelectSimpleClickPlugin = function(pluginName)
    {
      if (!$scope.selectedBunny)
        return;
      $scope.selectedBunny.selectedSimpleClickPlugin = _getSelectedBunnyPluginByName(pluginName);
    };

    $scope.SelectDoubleClickPlugin = function(pluginName)
    {
      if (!$scope.selectedBunny)
        return;
      $scope.selectedBunny.selectedDoubleClickPlugin = _getSelectedBunnyPluginByName(pluginName);
    };
    
    $scope.SaveButtonAction = function()
    {
      ojnApiBunny.setButtonsActions($scope.selectedBunny.MAC, 
                                    $scope.selectedBunny.selectedSimpleClickPlugin != undefined? $scope.selectedBunny.selectedSimpleClickPlugin.Name : undefined, 
                                    $scope.selectedBunny.selectedDoubleClickPlugin != undefined? $scope.selectedBunny.selectedDoubleClickPlugin.Name : undefined);
    };
    
    $scope.GetPluginUserViewUri = function(pluginShortName)
    {
      var ret = ojnApiPlugins.getPluginInfo(pluginShortName);
      //console.log("trying do display plugin view for " + pluginShortName);
      return ret != undefined? ret.UserPage : "";
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
