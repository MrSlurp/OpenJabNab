'use strict';

require.config({
  paths: {
      jquery: 'assets/libs/jquery.min',
      //lodash: 'assets/libs/lodash',
      angular: 'assets/libs/angular',
      angularRoute: 'assets/libs/angular-route',
      angularCookies: 'assets/libs/angular-cookies',
      bootstrap : 'assets/libs/bootstrap.min',
      bootstrapUI: 'assets/libs/ui-bootstrap-tpls-2.5.0.min',
  },
  shim: {
      angular: { 'exports': 'angular', deps:['jquery'] },
      angularRoute: { deps: ['angular'] },
      angularCookies: { deps: ['angular'] },
      bootstrap : { deps: ['jquery'] },
      bootstrapUI: { deps: ['angular', 'bootstrap'] },
  }
});

var dependencies = [
    'jquery',
    'angular',
    'angularCookies',
    'bootstrap',
    'bootstrapUI',
    'app/components/home/index',
    'app/components/bunnies/index',
    'app/components/admin/index',
    //'app/components/plugins/surprise/index',
    'ojnapp'
];

var bootDependencies = dependencies;
require(
    bootDependencies,
    function () {
        var $html = angular.element(document.getElementsByTagName('html')[0]);
        $html.ready(function () {
            angular.bootstrap(document, ['ojnapp']);
        });
    });

