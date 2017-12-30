'use strict';

define([
    'app/components/admin/module',
    'app/components/dataServices/ojnApiModule',
    'app/components/dataServices/ojnApiGlobal',
    'app/components/dataServices/ojnApiBunnies',
], function (module) {
    module.controller('adminCtrl', function ($scope, ojnApiGlobal, ojnApiAccount, ojnApiBunnies, $interval, $cookies) {
        console.log("adminCtrl Controller reporting for duty.");
        
        $scope.ApiFull = {};
        $scope.AllUsers = [];
        
        ojnApiGlobal.getListOfApiCalls().then(function(data) {
          $scope.ApiFull = data;
        });

        var _updateUsers = function() {
          ojnApiAccount.getAllUsersInfos().then(function(data) {
            if (data.users != undefined)
              $scope.AllUsers = data.users;
          });
        };
        _updateUsers();
        
        $scope.MakeApiFunctionArgumentsString = function(functionArgs) {
          var ret = "(";
          var index = 0;
          for (var arg in functionArgs)
          {
            ret+=functionArgs[arg];
            index++;
            if (index != functionArgs.length)
              ret += ",";
          }
          ret += ")";
          return ret;
        };
        
        $scope.MakeApiUrlArgumentsString = function(functionArgs) {
          if (functionArgs.length == 0)
            return ""
            
          var ret = "?";
          var index = 0;
          for (var arg in functionArgs)
          {
            ret+=functionArgs[arg];
            ret+="=<value>";
            index++;
            if (index != functionArgs.length)
              ret += "&";
          }
          return ret;
        };
        
        $scope.UserDelete = function(userLogin) {
          if (userLogin != undefined)
          {
            ojnApiAccount.removeAccount(userLogin).then(function() { _updateUsers();});
          }
        };
        
        $scope.UserAdd = function(userName, userLogin, userPass) {
          if (userName!= undefined && userLogin != undefined && userPass != undefined)
          {
            ojnApiAccount.registerNewAccount(userName, userLogin, userPass).then(function() { _updateUsers();});
          }
        };

        $scope.ReloadUsers = function() {
          _updateUsers();
        };
        
        $scope.UserPromote = function(userLogin) {
          if (userLogin != undefined)
          {
            ojnApiAccount.setAdmin(userLogin).then(function() { _updateUsers();});
          }
        };
    });
});
