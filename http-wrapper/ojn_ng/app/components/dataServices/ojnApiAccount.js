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
    var _currentUserIsAdmin = false;
    
    var _isInit = false;
    
    // TODO add expiration period (should be returned by API)
    var _setToken= function(value, login) {
      _authToken = value;
      _authLogin = login;
      if (value == undefined)
        _currentUserIsAdmin = false;
      $cookieStore.put("SavedToken", _authToken);
      $cookieStore.put("SavedLogin", _authLogin);
      $cookieStore.put("SavedIsAdmin", _currentUserIsAdmin);
      ojnngEvents.notifyEvent("TokenChanged");
    };
    
    // load existing token and login if exist in cookie
    var _init = function() {
      if (_isInit == false)
      {
        _isInit = true;
        try
        {
          var value = $cookieStore.get("SavedToken");
          var login = $cookieStore.get("SavedLogin");
          var isAdmin = $cookieStore.get("SavedIsAdmin");
          
          if (!(typeof value === "string" || value instanceof String) || value == "[object Object]")
            _setToken();
          else
          {
            _currentUserIsAdmin = isAdmin;
            _setToken(value, login);
          }
        }
        catch(ex)
        {
        }
      }
    };
    
    // 
    var _checkTokenIsValid = function(cb) {
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
        _getUserInfo(function(data) {
          if (data.isAdmin == true)
            _currentUserIsAdmin = true;
        });
        return;
      }
    
      var url = _accountsApiPath + "/auth?login="+l+"&pass="+p;
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
          {
            if (response.data.isAdmin == true)
              _currentUserIsAdmin = true;
              
            _setToken(response.data.token, l);
          }
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
      if (ojnApiHelpers.handleSimuRequest(cb, {login:"Demo", username:"Demo", token:"FakeToken", isValid:false, language:"klingon", isAdmin:true}))
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
    
    var _registerNewAccount = function(login, name, passwd, cb) {
      var url = _accountsApiPath + "/registerNewAccount?login="+login+"&username="+name+"&pass="+passwd;
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
            ojnngEvents.notifyEvent("UserNotifySucess", "Compte ajouté avec succès ("+response.data.message+")");
          else
            ojnngEvents.notifyEvent("UserNotifyError", response.data.message);
          if (cb) cb();
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          _setToken(null);
          if (cb) cb();
        }
      );         
    };
    
    var _GetAllUsersInfos = function(cb) {
      var dummyObj=[
        {login:"Demo1", username:"Demo1", token:"FakeToken", isValid:false, language:"klingon", isAdmin:true},
        {login:"Demo2", username:"Demo2", token:"FakeToken", isValid:false, language:"klingon", isAdmin:false},
      ];
      if (ojnApiHelpers.handleSimuRequest(cb, dummyObj))
      {
        return;
      }
    
      var url = _accountsApiPath + "/GetAllUsersInfos?"+"token="+_authToken;
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
    
    var _removeAccount = function(login, cb) {
    
      if (ojnApiHelpers.handleSimuRequest(cb, {} ))
        return;
    
      if (_authToken == undefined)
        return;
      var url = _accountsApiPath + "/removeAccount?login=" + login+"&token="+_authToken;
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
            ojnngEvents.notifyEvent("UserNotifySucess", "Compte supprimé avec succès ("+response.data.message+")");
          if (cb) cb();
        },
        function (error){ 
          ojnngEvents.notifyEvent("UserNotifyError", "Erreur de communication avec le serveur");
          _setToken(null);
          if (cb) cb();
        }
      );    
    };

    var _setAdmin = function(login, state, cb) {
      if (ojnApiHelpers.handleSimuRequest(cb, {} ))
        return;
    
      if (_authToken == undefined)
        return;
      var url = _accountsApiPath + "/setadmin?user=" + login+"&token="+_authToken;
      console.log(url);
      if (state != undefined)
        url = url + "&state="+ (state? "true" : "false");
      console.log(url);  
      $http.get(url).then(
        function (response) {
          if (!ojnApiHelpers.isErrorApiStatusMessage(response.data))
            ojnngEvents.notifyEvent("UserNotifySucess", "("+response.data.message+")");
          else
            ojnngEvents.notifyEvent("UserNotifyError", "("+response.data.message+")");
          if (cb) cb();
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
      isUserAdmin:function(){
        return _currentUserIsAdmin;
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
      },
      registerNewAccount: function(name, login, passwd) {
        var defer = $q.defer();
        _registerNewAccount(login, name, passwd, function () { defer.resolve();});
        return defer.promise;
      },
      getAllUsersInfos: function() {
        var defer = $q.defer();
        _GetAllUsersInfos(function (data) { defer.resolve(data);});
        return defer.promise;
      },
      removeAccount: function(login) {
        var defer = $q.defer();
        _removeAccount(login, function () { defer.resolve();});
        return defer.promise;
      },
      setAdmin: function(login, state) {
        var defer = $q.defer();
        _setAdmin(login, state, function () { defer.resolve();});
        return defer.promise;
      }
    }
  });
});
