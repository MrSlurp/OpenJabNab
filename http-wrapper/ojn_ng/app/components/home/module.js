'use strict';

define([
    'angular',

], function (angular, angularRoute) {
    var mod = angular.module('homeModule', [
        'ngRoute',
        'ui.bootstrap',
    ]);
    mod.config([
         '$routeProvider',
         function ($routeProvider) {
             $routeProvider
                 .when('/home', { templateUrl: 'app/components/home/homeView.html'});
         }
    ]);

    return mod;
});