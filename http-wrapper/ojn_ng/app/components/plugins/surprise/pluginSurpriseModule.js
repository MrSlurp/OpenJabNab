'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiAccount',
  'app/components/dataServices/ojnApiHelpers',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnApiPlugins',
], function (angular) {
  var mod = angular.module('pluginSurpriseModule', [ 'ojnngModule', 'ojnApiModule', 'ojnApiPlugins' ]);
  console.log("pluginSurpriseModule created");
  return mod;
});