'use strict';

define([
    'app/components/home/module',
    'app/components/dataServices/ojnApiService'
], function (module) {
    module.controller('HomeControler', function ($scope, ojnApiService, $interval) {
        console.log("HomeControler reporting for duty.");
        /*
        var update = function () {
            //ojnApiService..
            //$scope.CityData = cityInfoService.getCityData();
            //$scope.CityName = $scope.CityData.Name;
        }
        
        ojnApiService.registerSubscriber(function () {
            //update();
        });
        cityInfoService.setActiveDistrictId(0);
        update();
        */
    });
});
