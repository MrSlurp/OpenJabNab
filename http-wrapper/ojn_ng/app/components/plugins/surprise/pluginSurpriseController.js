'use strict';

define([
  'app/components/plugins/surprise/pluginSurpriseModule',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnApiGlobal',
  'app/components/dataServices/ojnApiBunnies',
  'app/components/dataServices/ojnApiPlugins',
], function (module) {
  module.controller('pluginSurpriseCtrl', function ($scope, ojnApiGlobal, ojnApiAccount, ojnApiBunnies, ojnApiPlugins) {
    console.log("pluginSurpriseCtrl Controller reporting for duty.");
    ojnApiPlugins.registerPlugin({Name:"surprise", UserPage:".app/component/plugins/surprise/pluginSurpriseUserConfigView.html", AdminPage:undefined});
      
  });
});
