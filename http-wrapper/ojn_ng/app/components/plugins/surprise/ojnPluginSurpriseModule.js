'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiAccount',
  'app/components/dataServices/ojnApiHelpers',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnngError',
], function (angular) {
  var mod = angular.module('ojnPluginSurprise', [ 'ojnngModule', 'ojnApiModule' ]);
  .directive('plugin-suprise-admin', function () {
    scope: {
        //productionService: "=",
        //consumptionService: "=",
    },
    controller: [
        '$scope',
        '$element',
        '$attrs',
        function ($scope, $element, $attr) {
        }
    ],
    transclude: true,
    restrict: 'E',
    templateUrl: './app/components/plugins/surprise/pluginSurpriseAdminView.html'
  }),
  .directive('plugin-suprise-bunny', function () {
    scope: {
        //productionService: "=",
        //consumptionService: "=",
    },
    controller: [
        '$scope',
        '$element',
        '$attrs',
        function ($scope, $element, $attr) {
        }
    ],
    transclude: true,
    restrict: 'E',
    templateUrl: './app/components/plugins/surprise/pluginSurpriseBunnyView.html'
  }),
  return mod;
});