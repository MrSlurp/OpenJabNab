'use strict';

define([
  'angular',
  'angularRoute',
  'angularCookies',
  'bootstrapUI',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiGlobal',
  'app/components/dataServices/ojnApiAccount',
  'app/components/home/index',
  'app/components/bunnies/index',
  'app/shared/alertContainer/index',
],
function (angular, angularRoute) {

  var app = angular.module('ojnapp', [
    'ngRoute',
    'ojnngModule',
    'ojnApiModule',
    'homeModule',
    'bunniesModule',
    'ui.bootstrap',
  ]);
  app.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider.when("/about", { templateUrl: 'app/shared/about/about.html'});;
        $routeProvider.otherwise({ templateUrl: 'app/components/home/homeView.html' });
    }
  ]);
  app.controller('ojnNgControler', function ($scope, $interval, $cookies, ojnApiGlobal, ojnApiAccount, ojnngEvents) {
    $scope.IsUserRegistered = false;
    $scope.ServerPing = { ConnectedBunnies : "??", MaxBurstNumberOfBunnies : "??", MaxNumberOfBunnies : "??" };
    $scope.IsUserRegistered = ojnApiAccount.hasToken();
    
    ojnngEvents.subscribe("TokenChanged", function() {
      $scope.IsUserRegistered = ojnApiAccount.hasToken();
    });
    
    
    //
    $scope.TryLogin = function(l,p)
    {
      ojnApiAccount.doUserLogin(l,p).then(function(){
        $scope.IsUserRegistered = ojnApiAccount.hasToken();
        if ($scope.IsUserRegistered)
        {
          ojnngEvents.notifyEvent("UserNotifySucess", "Login succeed")
        }
      });
    }
    
    //
    $scope.DoLogout = function(l,p)
    {
      ojnApiAccount.doLogout().then(function(){
        $scope.IsUserRegistered = ojnApiAccount.hasToken();
        if (!$scope.IsUserRegistered)
        {
          ojnngEvents.notifyEvent("UserNotifySucess", "Logout succeed")
        }
      });
    }

    //
    var updatePing = function()
    {
      ojnApiGlobal.getApiGlobalPing().then(function(response){
        $scope.ServerPing = response;
      });
    }
    
    //
    $interval(function () {
      updatePing();
    }.bind(this), 10000);
    updatePing();
  });
});