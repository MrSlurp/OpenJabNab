'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnApiHelpers',
  'app/components/plugins/surprise/pluginSurpriseModule',
], function () {
angular.module('pluginSurpriseModule')
  .factory('ojnPluginSurpriseApi', function ($http, $q, $cookieStore, ojnngEvents, ojnngError, ojnApiHelpers) {
    console.log("ojnPluginSurpriseApi ready");
    var _baseApiPath = "/ojn_api/json";
    var _surpriseApiPath = _baseApiPath + "/surprise";
    // implement here suprise plugin dedicated APIs
    return {
    };
  });
});
