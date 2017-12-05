'use strict';

define([
  'angular',
  'angularRoute',
  'angularCookies',
  'app/components/home/index',
  'app/components/bunnies/index',
  'app/components/dataServices/ojnApiGlobal',
  'app/components/dataServices/ojnApiAccount',
],
function (angular, angularRoute) {

  var app = angular.module('ojnapp', [
    'ngRoute',
    'homeModule',
    'bunniesModule',
    'ojnApiModule',
    'ojnngModule'
  ]);
  app.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider.when("/about", { templateUrl: 'app/shared/about/about.html'});;
        $routeProvider.otherwise({ templateUrl: 'app/components/home/homeView.html' });
    }
  ]);
  app.controller('ojnNgControler', function ($scope, $interval, $cookies, ojnApiGlobal, ojnApiAccount) {
    $scope.IsUserRegistered = false;
    $scope.ServerPing = { ConnectedBunnies : "??", MaxBurstNumberOfBunnies : "??", MaxNumberOfBunnies : "??" };
    $scope.IsUserRegistered = ojnApiAccount.hasToken();
    
    //
    $scope.TryLogin = function(l,p)
    {
      ojnApiAccount.doUserLogin(l,p).then(function(){
        $scope.IsUserRegistered = ojnApiAccount.hasToken();
      });
    }
    
    //
    $scope.DoLogout = function(l,p)
    {
      ojnApiAccount.doLogout().then(function(){
        $scope.IsUserRegistered = ojnApiAccount.hasToken();
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
    var promise = $interval(function () {
      updatePing();
    }.bind(this), 10000);
    updatePing();
  });
});