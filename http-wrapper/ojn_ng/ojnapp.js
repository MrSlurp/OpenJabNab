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
  'app/components/admin/index',
  'app/shared/alertContainer/index',
],
function (angular, angularRoute) {

  var app = angular.module('ojnapp', [
    'ngRoute',
    'ojnngModule',
    'ojnApiModule',
    'homeModule',
    'bunniesModule',
    'adminModule',
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
    console.log("ojnNgControler ready for duty");
    $scope.IsUserRegistered = false;
    $scope.ServerPing = { ConnectedBunnies : "??", MaxBurstNumberOfBunnies : "??", MaxNumberOfBunnies : "??" };
    $scope.IsUserRegistered = ojnApiAccount.hasToken();
    $scope.IsUserAdmin = false;
    $scope.IsServerOk = true;
    
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
    
    var checkLogin = function()
    {
      ojnApiAccount.verifyToken();
    }
    
    ojnngEvents.subscribe("TokenChanged", function() {
      $scope.IsUserRegistered = ojnApiAccount.hasToken();
      $scope.IsUserAdmin = ojnApiAccount.isUserAdmin();
    });
    
    ojnngEvents.subscribe("OjnServerStateChanged",function(){
      $scope.IsServerOk = ojnApiGlobal.isServerOk();
    });
    
    
    //
    $interval(function () {
      updatePing();
      checkLogin();
    }.bind(this), 10000);
    updatePing();
    checkLogin();
  });
});