'use strict';

define([
  'angular',
  'angularRoute',
  'angularCookies',
  'app/components/home/index',
  'app/components/bunnies/index',
  'app/components/dataServices/ojnApiService',
],
function (angular, angularRoute) {

  var app = angular.module('ojnapp', [
    'ngRoute',
    'homeModule',
    'bunniesModule',
    'ojnApiModule'
  ]);
  app.config([
    '$routeProvider',
    function ($routeProvider) {
        $routeProvider.otherwise({ templateUrl: 'app/shared/about/about.html' });
    }
  ]);
  app.controller('ojnNgControler', function ($scope, ojnApiService, $interval, $cookies) {
    $scope.IsUserRegistered = false;
    $scope.ServerPing = { ConnectedBunnies : "??", MaxBurstNumberOfBunnies : "??", MaxNumberOfBunnies : "??" };
    
    $scope.TryLogin = function(l,p)
    {
      console.log("Login for :" + l + ", pass: " +p );
      ojnApiService.doUserLogin(l,p).then(function(){
        $scope.IsUserRegistered = ojnApiService.hasToken();
      });
    }
    
    var promise = $interval(function () {
      ojnApiService.getApiGlobalPing().then(function(response){
        $scope.ServerPing = response;
      });
    }.bind(this), 10000);    
  });
});