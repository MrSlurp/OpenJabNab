'use strict';

define([
    'app/components/home/module',
    'app/components/dataServices/ojnApiGlobal',
    'app/components/dataServices/ojnApiBunnies',
    'app/components/dataServices/ojnngEvents',
], function (module) {
    module.controller('HomeControler', function ($scope, ojnApiGlobal, ojnApiBunnies, ojnngEvents, $interval) {
        console.log("HomeControler reporting for duty.");
        $scope.userBunnies = {};
        
        var update = function () {
          ojnApiBunnies.getUserBunnies().then(function(data){
            if (data != undefined)
            {
              $scope.userBunnies = data.bunnies;
            }
          });
        }
        
        ojnngEvents.subscribe("TokenChanged", function() {
          update();
        });
        
    });
});
