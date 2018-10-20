'use strict';

define([
    'angular',

], function (angular, angularRoute) {
  var mod = angular.module('adminModule', [
    'ngRoute',
    'ngCookies',
    'ui.bootstrap',
  ]);
  mod.config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider.when('/admin', { 
          templateUrl: 'app/components/admin/adminView.html',
          resolve:{
            "check":function(ojnApiAccount, $location){   
              //check user is logged in
              if(ojnApiAccount.isInitialized() && ojnApiAccount.hasToken() && ojnApiAccount.isUserAdmin()){ 
                // pass
              }else{
                $location.path('/home');    //redirect user to home.
                //alert("You don't have access here");
              }
            }
          }
        }
      );
    }
  ]);
  return mod;
});