'use strict';

define([
    'angular',

], function (angular, angularRoute) {
  var mod = angular.module('bunniesModule', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
  ]);
  mod.config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/bunnies', { 
          templateUrl: 'app/components/bunnies/bunniesView.html',
          resolve:{
            "check":function($location){   
              //check user is logged in
              if(false){ 
                //
              }else{
                $location.path('/home');    //redirect user to home.
                alert("You don't have access here");
              }
            }
          }
        }
      );
    }
  ]);
  return mod;
});