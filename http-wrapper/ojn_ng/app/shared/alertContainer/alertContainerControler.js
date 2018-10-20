'use strict';

define([
  'app/components/home/module',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnngEvents',
], function (module) {
  module.controller('alertContainerControler', function ($scope, $interval, ojnngEvents, ojnngError) {
    console.log("alertContainerControler reporting for duty.");
    var _items = [];
    
    $scope.current = undefined;
    //$scope.current = {message:"coin coin coin", type:'error'};
    
    var _addAlert = function(message){
      _items.push({message:message, type:'error'})
    }
    var _addSuccess = function(message){
      _items.push({message:message, type:'success'})
    }
    
    var _isProcessing = false;
    var _processAlerts = function()
    {
      if ($scope.current != undefined || _items.length == 0)
      {
        //$scope.current = undefined;
        return;
      }
      $scope.current = _items.pop();
      $interval(function(){
        $scope.current = undefined;
        _processAlerts();
      }.bind(this), 3000, 1);
    }
    
    ojnngEvents.subscribe("UserNotifyError" ,function(param){
      _addAlert(param);
      _processAlerts();
    });
    ojnngEvents.subscribe("UserNotifySuccess" ,function(param){
      _addSuccess(param);
      _processAlerts();
    });
    
  });
});
