'use strict';

define([
  'angular',
  'app/components/dataServices/ojnApiModule',
  'app/components/dataServices/ojnngError',
  'app/components/dataServices/ojnngEvents',
  'app/components/dataServices/ojnApiHelpers',
], function () {
angular.module('ojnApiModule')
  .factory('ojnApiAccount', function ($http, $q, $cookieStore, ojnngEvents, ojnngError, ojnApiHelpers) {
    console.log("ojnApiAccount ready");
    var _baseApiPath = "/ojn_api/json";
    var _accountsApiPath = _baseApiPath + "/accounts";
    
    var _authToken = undefined;
    var _authLogin = undefined;
    
    var _isInit = false;
    
    // TODO add expiration period (should be returned by API)
    var _setToken= function(value, login)
    {
      _authToken = value;
      _authLogin = login;
      $cookieStore.put("SavedToken", _authToken);
      $cookieStore.put("SavedLogin", _authLogin);
      ojnngEvents.notifyEvent("TokenChanged");
    };
    
    // load existing token and login if exist in cookie
    var _init = function()
    {
      if (_isInit == false)
      {
        _isInit = true;
        try
        {
          var value = $cookieStore.get("SavedToken");
          var login = $cookieStore.get("SavedLogin");
          if (!(typeof value === "string" || value instanceof String) || value == "[object Object]")
            _setToken();
          else
            _setToken(value, login);
        }
        catch(ex)
        {
        }
      }
    };
    
    // TODO add support for token check on server
    var _checkTokenIsValid = function(cb)
    {
      if (ojnApiHelpers.handleSimuRequest(cb, {} ))
        return;
    
      if (_authToken == undefined)
        return;
      var url = _accountsApiPath + "/checkAuth?token=" + _authToken;
      $http.get(url).then(
        function (response) {
          if (ojnApiHelpers.isErrorApiStatusMessage(response.data))
            _setToken(null);
            
          if (cb) cb();
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          _setToken(null);
          if (cb) cb();
        }
      );
    };
    
    // perform login request, the password should be hashed7 before being sent
    // need to change this server side
    var _doLoginRequest = function (l,p, cb) {
      if (ojnApiHelpers.handleSimuRequest(cb))
      {
        _setToken("FakeToken", l);
        return;
      }
    
      var url = _accountsApiPath + "/auth?login="+l+"&pass="+p;
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
            _setToken(response.data.value, l);
          else
            _setToken(null);
            
          if (cb) cb();
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          //ojnngError.notifyError("OjnAccount http error " + error);
          _setToken(null);
          
          if (cb) cb();
        }
      );
    };
    
    // ask the server to end token validity (instead of waiting for session timeout)
    var _doLogout = function (cb) {
      if (ojnApiHelpers.handleSimuRequest(cb))
      {
        _setToken();
        return;
      }
    
      if (_authToken != undefined)
      {
        var url = _accountsApiPath + "/logout?token="+_authToken;
        $http.get(url).then(
          function (response) {
            ojnApiHelpers.isErrorApiStatusMessage(response.data);
            /*
            if (response.data["status"] != undefined
               && response.data["status"] == "ok")*/
            _setToken(null);
              
            if (cb)
              cb();
          },
          function (error){ 
            ojnngError.notifyError("OjnAccount http error " + error);
            _setToken(null);
            // raise error message
            if (cb)
              cb();
          }
        );    
      }
    };

    var _addBunnyToAccount = function(mac, cb){
      if (ojnApiHelpers.handleSimuRequest(cb))
      {
        return;
      }
    
      var url = _accountsApiPath + "/addBunny?login="+_authLogin+"&"+"token="+_authToken+"&"+"bunnyid="+mac;
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
            ojnngEvents.notifyEvent("UserNotifySucess", "Lapin ajouté au compte avec succès ("+response.data.message+")");
          else
            ojnngEvents.notifyEvent("UserNotifyError", "Erreur d'ajout du lapin, le serveur à répondu : " + response.data.message);
          if (cb) cb();
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          _setToken(null);
          if (cb) cb();
        }
      );
    };
    
    var _removeBunnyFromAccount = function(mac, cb){
      var url = _accountsApiPath + "/removeBunny?login="+_authLogin+"&"+"token="+_authToken+"&"+"bunnyid="+mac;
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
            ojnngEvents.notifyEvent("UserNotifySucess", "Lapin retiré du compte avec succès ("+response.data.message+")");
          else
            ojnngEvents.notifyEvent("UserNotifyError", "Erreur : " + response.data.message);
          if (cb) cb();
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          _setToken(null);
          if (cb) cb();
        }
      );    
    };
    
    var _getUserInfo = function (cb) {
      if (ojnApiHelpers.handleSimuRequest(cb, {login:"Demo", username:"Demo", token:"FakeToken", isValid:false, language:"klingon"}))
      {
        return;
      }
    
      var url = _accountsApiPath + "/infos?user="+_authLogin+"&"+"token="+_authToken;
      $http.get(url).then(
        function (response) {
          if (ojnApiHelpers.isErrorApiStatusMessage(response.data))
            ojnngEvents.notifyEvent("UserNotifyError", response.data.message);
          if (cb) cb(response.data);
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          _setToken(null);
          if (cb) cb();
        }
      );         
    };
    
    
    return {
      isInitialized: function() {
        return _isInit;
      },
      doUserLogin: function (l, p) {
        _init();
        var defer = $q.defer();
        _doLoginRequest(l, p, function () { defer.resolve();});
        return defer.promise;
      },
      hasToken: function () {
        if (_isInit == false)
          return false;
        return _authToken!=null;
      },
      getTokenUrl: function () {
        _init();
        return "token="+_authToken;
      },
      verifyToken: function () {
        _init();
        var defer = $q.defer();
        _checkTokenIsValid(function () { defer.resolve();});
        return defer.promise;
      },
      doLogout:function(){
        var defer = $q.defer();
        _doLogout(function () { defer.resolve();});
        return defer.promise;
      },
      getUserInfo:function(){
        var defer = $q.defer();
        _getUserInfo(function (info) { defer.resolve(info);});
        return defer.promise;
      },
      addBunnyToAccount: function(mac) {
        var defer = $q.defer();
        _addBunnyToAccount(mac, function () { defer.resolve();});
        return defer.promise;
      },
      removeBunnyFromAccount: function(mac) {
        var defer = $q.defer();
        _removeBunnyFromAccount(mac, function () { defer.resolve();});
        return defer.promise;
      }
    }
  });
});
