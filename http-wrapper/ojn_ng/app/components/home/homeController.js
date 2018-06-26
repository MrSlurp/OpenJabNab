'use strict';

define([
  'app/components/home/module',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiGlobal',
  'app/components/dataServices/ojnApiBunnies',
  'app/components/dataServices/ojnApiAccount',
  'app/components/dataServices/ojnApiBunny',
  'app/components/dataServices/ojnngEvents',
  
], function (module) {
  module.controller('HomeControler', function ($scope, ojnApiGlobal, ojnApiBunnies, ojnApiAccount, ojnngEvents, ojnApiBunny) {
    console.log("HomeControler reporting for duty.");
    $scope.userBunnies = {};
    
    $scope.userInfo = {};
    
    var _update = function () {
      if (!ojnApiAccount.hasToken())
        return;
      ojnApiBunnies.getUserBunnies().then(function(data){
        if (data != undefined && data.bunnies != undefined)
          $scope.userBunnies = data.bunnies;
        else
          $scope.userBunnies = {};
      });
      ojnApiAccount.getUserInfo().then(function(data){
        if (data != undefined )
          $scope.userInfo = data;
        else
          $scope.userInfo = {};
      });
    }
    
    ojnngEvents.subscribe("TokenChanged", function() {
      _update();
    });
    _update();
    
    //
    $scope.BunnyRename = function(mac, newBunnyName){
      ojnApiBunny.doBunnyRename(mac, newBunnyName).then(function(){});
    };
    
    //
    $scope.BunnyAdd = function(rabbitMac, rabbitName){
      ojnApiAccount.addBunnyToAccount(rabbitMac).then(function(){
        if (rabbitName != undefined)
          ojnApiBunny.doBunnyRename(rabbitMac, rabbitName).then(function(){_update()});
        else
          _update();
      });
    };
    
    //
    $scope.BunnyRemove = function(rabbitMac){
      ojnApiAccount.removeBunnyFromAccount(rabbitMac).then(function(){
        _update();
      });
    };

  });
});
