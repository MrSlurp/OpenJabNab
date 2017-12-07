'use strict';

define([
  'angular',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnngEvents',
], function (angular) {
  var mod = angular.module('ojnApiModule', [ 'ojnngModule' ]);
  return mod;
});