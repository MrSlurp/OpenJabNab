'use strict';

define([
    'app/components/admin/module',
    'app/components/dataServices/ojnApiModule',
    'app/components/dataServices/ojnApiGlobal',
    'app/components/dataServices/ojnApiBunnies',
    'app/components/dataServices/ojnApiPlugins',
], function (module) {
    module.controller('adminCtrl', function ($scope, ojnApiGlobal, ojnApiAccount, ojnApiBunnies, ojnApiPlugins) {
        console.log("adminCtrl Controller reporting for duty.");
        
        $scope.ApiFull = {};
        $scope.AllUsers = [];
        $scope.PluginsData = [];
        
        $scope.currentApiTest = {Url:"", ParamString:"", lastResponse:""};
        //$scope.currentTestApi. = "";
        
        ojnApiGlobal.getListOfApiCalls().then(function(data) {
          $scope.ApiFull = data;
        });
        
        var _updatePlugins = function() {
          ojnApiPlugins.getAllPluginsData().then(function(data) {
            $scope.PluginsData = data;
          });
        }
        _updatePlugins();

        var _updateUsers = function() {
          ojnApiAccount.getAllUsersInfos().then(function(data) {
            if (data.users != undefined)
              $scope.AllUsers = data.users;
          });
        };
        _updateUsers();
        
        $scope.setApiTestFields = function(rootPath, apiFamilly, cat, func){
          $scope.currentApiTest.Url = $scope.MakeApiFunctionPath(rootPath, apiFamilly, cat, func);
          $scope.currentApiTest.ParamString = $scope.MakeApiUrlArgumentsString(func.parameters);
        };
        
        $scope.MakeApiFunctionPath = function(rootPath, apiFamilly, cat, func) {
        
          if (cat == 'Api' && !apiFamilly.Name && rootPath != 'bunny/')
            return "/"+rootPath+func.functionName;
          else if (cat=='Api' && !apiFamilly.Name && rootPath == 'bunny/')
            return "/bunny/<Bunny Mac>/"+func.functionName;
          else if (cat=='Api' && apiFamilly.Name)
            return "/plugin/"+apiFamilly.Name+"/"+func.functionName;
          else if (cat=='Bunny' && apiFamilly.Name)
            return "/bunny/<Bunny Mac>/"+apiFamilly.Name+"/"+func.functionName;
          else if (cat=='Ztamp' && apiFamilly.Name)
            return "/ztamp/<ztamp serial>/"+apiFamilly.Name+"/"+func.functionName;
          
          return "???"
        };
        
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
        
        $scope.MakeApiUrlArgumentsString = function(functionArgs, withQuestionMark) {
          if (functionArgs.length == 0)
            return ""
            
          var ret ="";
          if (withQuestionMark)
            ret += "?";
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
        
        $scope.TestApi = function(url, arg) {
          ojnApiGlobal.runTestApi(url, arg).then(function(data) {
            $scope.currentApiTest.lastResponse = JSON.stringify(data);
          });
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
        
        $scope.ReloadPlugins = function() {
          _updatePlugins();
        };
        
        $scope.UserPromote = function(userLogin, state) {
          if (userLogin != undefined)
          {
            ojnApiAccount.setAdmin(userLogin, state).then(function() { _updateUsers();});
          }
        };
        
        $scope.PluginReload = function(pluginName) {
        };
        
        $scope.PluginEnable = function(pluginName) {
        };
        
        $scope.PluginDisable = function(pluginName) {
        };
        
    });
});
