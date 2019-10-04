/**
 * Created by longnguyen on 12/23/2016.
 *
 */
var creants_api = (function () {

    var COMMAND_SIGN_IN_CREANTS = "creants";
    var COMMAND_SIGN_IN_GUEST = "guest";
    var COMMAND_SIGN_IN_FB = "fb";
    var COMMAND_SIGN_IN_ACCOUNTKIT = "fb";
    var COMMAND_SIGN_UP = "signup";
    var COMMAND_SIGN_OUT = "signout";
    var COMMAND_RECOVERY_PASSWORD = "recovery";
    var COMMAND_VERIFY_VALIDATION_CODE = "verify";
    var COMMAND_RESET_PASSWORD = "reset";
    var COMMAND_GET = "get";
    var COMMAND_UPDATE = "update";
    var COMMAND_VALIDATE_TOKEN = "validate";
    var CONTROLLER_OAUTH = "oauth";
    var CONTROLLER_USER = "user";
    var CONTROLLER_ACCOUNT = "account";
    var CONTROLLER_GUEST = "guest";
    var event = {
        LOGIN_CREANTS_CLICK: "event_login_creants_click",
        LOGIN_FB_CLICK: "event_login_facebook_click",
        LOGIN_BY_GUEST_CLICK: "event_login_by_guest_click",
        LOGOUT: "event_logout",
        HAD_CURRENT_TOKEN: "event_had_current_token",
        LOSE_TOKEN: "event_lost_token",
        FAIL: "event_fail",
        KNOCK_KNOCK: "event_knock_knock"
    };

    var REST_URL = null;
    var creants_api = {};
    creants_api.setConfig = function (config) {
        creants_api.APP_ID = config["APP_ID"];
        creants_api.PLATFORM = config["PLATFORM"];
        creants_api.APP_NAME = config["APP_NAME"];
        creants_api.KEY_LOGIN_TOKEN = config["KEY_LOGIN_TOKEN"];
        creants_api.KEY_LINK_ACCOUNT = config["KEY_LINK_ACCOUNT"];
        creants_api.REST_URL = REST_URL = config["REST_URL"];
        creants_api.SUPPORT_GUEST = config["GUEST"] === "yes";
        creants_api.BACKGROUND_COLOR = config["BACKGROUND_COLOR"];
    };

    creants_api.getSignInByCreantsREST = function () {
        return REST_URL + CONTROLLER_OAUTH + "/" + COMMAND_SIGN_IN_CREANTS;
    };

    creants_api.getSignInByGuestREST = function () {
        return REST_URL + CONTROLLER_OAUTH + "/" + COMMAND_SIGN_IN_GUEST;
    };

    creants_api.getSignInByFbREST = function () {
        return REST_URL + CONTROLLER_OAUTH + "/" + COMMAND_SIGN_IN_FB;
    };

    creants_api.getSignInByAccountKitREST = function () {
        var rest = REST_URL + CONTROLLER_OAUTH + "/" + COMMAND_SIGN_IN_ACCOUNTKIT;
        cc.log(rest);
        return rest;
    };

    creants_api.getOauthREST = function () {
        return REST_URL + CONTROLLER_USER + "/" + CONTROLLER_OAUTH;
    };
    creants_api.getUserInfoREST = function () {
        return REST_URL + CONTROLLER_USER + "/" + COMMAND_GET;
    };
    creants_api.getUpdateUserInfoREST = function () {
        return REST_URL + CONTROLLER_USER + "/" + COMMAND_UPDATE;
    };
    creants_api.getSignOutREST = function () {
        return REST_URL + CONTROLLER_USER + "/" + COMMAND_SIGN_OUT;
    };

    creants_api.getSignUpREST = function () {
        return REST_URL + CONTROLLER_ACCOUNT + "/" + COMMAND_SIGN_UP;
    };
    creants_api.getRecoveryPasswordRest = function () {
        return REST_URL + CONTROLLER_ACCOUNT + "/" + COMMAND_RECOVERY_PASSWORD;
    };
    creants_api.getVerifyValidationGenerateCodeRest = function () {
        return REST_URL + CONTROLLER_ACCOUNT + "/" + COMMAND_VERIFY_VALIDATION_CODE;
    };
    creants_api.getResetPasswordRest = function () {
        return REST_URL + CONTROLLER_ACCOUNT + "/" + COMMAND_RESET_PASSWORD;
    };
    creants_api.getValidateTokenRest = function () {
        return REST_URL + CONTROLLER_USER + "/" + COMMAND_VALIDATE_TOKEN;
    };
    creants_api.isWebPlatform = function () {
        return creants_api.PLATFORM === "web";
    };
    creants_api.isCocosPlatform = function () {
        return creants_api.PLATFORM === "cocos";
    };
    creants_api.isReactNativePlatform = function () {
        return creants_api.PLATFORM === "react";
    };

    creants_api._setLoginSession = function (tokenOrDataResult, userInfo, privateKey) {
        if (tokenOrDataResult && userInfo && privateKey) {
            creants_api.currentToken = tokenOrDataResult;
            creants_api.currentUserInfo = userInfo;
            creants_api.privateKey = privateKey;
        } else if (tokenOrDataResult) {
            var result = tokenOrDataResult;
            creants_api.currentToken = result.token;
            creants_api.currentUserInfo = result.data.user;
            creants_api.privateKey = result.privateKey;
        }
    };

    creants_api.isFailCode = function (code) {
        return !code || code < 0 || code >= 1000;
    };

    creants_api.getPrivateKey = function () {
        return creants_api.privateKey;
    };

    creants_api.getCurrentToken = function () {
        return creants_api.currentToken;
    };

    creants_api.getLoginType = function(){
        return creants_api.loginType;
    };

    creants_api.getUserAvatarURL = function () {
        if (creants_api.currentToken && creants_api.currentUserInfo) {
            return creants_api.currentUserInfo.avatar;
        }
        return null;
    };
    creants_api.getUserFullName = function () {
        if (creants_api.currentToken && creants_api.currentUserInfo) {
            return creants_api.currentUserInfo.fullName;
        }
        return null;
    };
    creants_api.getUserMail = function () {
        if (creants_api.currentToken && creants_api.currentUserInfo) {
            return creants_api.currentUserInfo.email;
        }
        return null;
    };
    creants_api.getUserId = function () {
        if (creants_api.currentToken && creants_api.currentUserInfo) {
            return creants_api.currentUserInfo.id;
        }
        return null;
    };
    creants_api.getUserMoney = function () {
        if (creants_api.currentToken && creants_api.currentUserInfo) {
            return creants_api.currentUserInfo.money;
        }
        return null;
    };
    creants_api.clearCurrentUser = function () {
        creants_api.currentToken = null;
        creants_api.currentUserInfo = null;
        creants_api.loginType = null;
    };
    creants_api.createClientFailCode = function (code) {
        var msg = "unknow";
        if (code === const_key.FAIL_CLIENT_NETWORK_ERROR) {
            msg = "Network error";
        }
        else if( code === const_key.FAIL_CLIENT_FACEBOOK_NOT_CONNECT ){
            msg = "Can not connect to Facebook";
        }
        return {
            code: code || const_key.FAIL_CLIENT_UNKNOWN,
            msg: msg
        }
    };
    creants_api.confirmRecoveryPasswordCode = null;
    creants_api.currentToken = null;
    creants_api.currentUserInfo = null;
    creants_api.platformAPI = null;
    creants_api.loginType = null;

    var const_key = {
        LOGIN_TYPE_GUEST : "login_type_guest",
        LOGIN_TYPE_CREANT : "login_type_creant",
        LOGIN_TYPE_FACEBOOK : "login_type_facebook",
        LOGIN_TYPE_ACCOUNTKIT : "login_type_accountkit",

        FAIL_BAD_REQUEST: -1,
        FAIL_USER_NOT_FOUNT: 1000,
        FAIL_SHORT_NAME: 1001,
        FAIL_SHORT_PASSWORD: 1002,
        FAIL_INVALID_EMAIL: 1003,
        FAIL_INVALID_VALIDATION_CODE: 1004,
        FAIL_EXPIRE_TOKEN: 1008,
        FAIL_UPDATE_INFO_FAIL: 1009,
        FAIL_NOT_FOUND: 9999,

        FAIL_CLIENT_UNKNOWN: 100000,
        FAIL_CLIENT_NETWORK_ERROR: 100001,
        FAIL_CLIENT_FACEBOOK_NOT_CONNECT: 100002,
        FAIL_CLIENT_ACCOUNTKIT_NOT_CONNECT: 100003
    };

    creants_api.const_key = const_key;
    creants_api.event = event;

    creants_api.PlatformAPI = function () {

        this.validateToken = function (callback) {
            var token = null;
            var str = this.getItem(creants_api.KEY_LOGIN_TOKEN);
            var tokenObj = null;
            if( str ){
                tokenObj = JSON.parse(str);
            }
            if( tokenObj ){
                token = tokenObj.token;
                this.log("Validate Creants Token: " + token);
            }
            if( this._TOKEN_ ){
                token = this._TOKEN_;
            }
            if (token) {
                this.postHTTP(creants_api.getValidateTokenRest(), {token: token}, function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        creants_api._setLoginSession(responseJson);
                        if( tokenObj ){
                            creants_api.loginType = tokenObj.type;
                        }
                        callback && callback(responseJson);
                    } else {
                        this.removeItem(creants_api.KEY_LOGIN_TOKEN);// remove the expire token.
                        callback && callback(null, responseJson);
                    }
                }.bind(this));
            }
            else {
                callback && callback(null, creants_api.createClientFailCode());
            }
        };
        this.signInByGuest = function (callback) {
            this.postHTTP(creants_api.getSignInByGuestREST(),
                {device_id: mc.const.TEST_DEVICE ? mc.const.TEST_DEVICE : (this.getPlatformOS() + "##" + this.getDeviceString() + "##" + creants_api.APP_ID)},
                function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        creants_api._setLoginSession(responseJson);
                        creants_api.loginType = const_key.LOGIN_TYPE_GUEST;
                        this.isEnableAutoSavingToken() && this.setItem(creants_api.KEY_LOGIN_TOKEN, JSON.stringify({token:responseJson.token,type:const_key.LOGIN_TYPE_GUEST}));
                        callback && callback(responseJson);
                    } else {
                        callback && callback(null, responseJson);
                    }
                }.bind(this));
        };
        this.signInByCreants = function (username, password, callback) {
            this.postHTTP(creants_api.getSignInByCreantsREST(),
                {
                    app_id: creants_api.APP_ID,
                    username: username,
                    password: password
                }, function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        creants_api._setLoginSession(responseJson);
                        creants_api.loginType = const_key.LOGIN_TYPE_CREANT;
                        this.isEnableAutoSavingToken() && this.setItem(creants_api.KEY_LOGIN_TOKEN, JSON.stringify({token:responseJson.token,type:const_key.LOGIN_TYPE_CREANT}));
                        callback && callback(responseJson);
                    } else {
                        callback && callback(null, responseJson);
                    }
                }.bind(this));
        };
        this.signInByFaceBook = function (callback) {
            this.requestFacebook(function(token){
                if( token ){
                    cc.log("requestFacebook success" + token);
                    this.postHTTP(creants_api.getSignInByFbREST(),
                        {
                            app_id: creants_api.APP_ID,
                            fb_token: token
                        }, function (responseJson) {
                            cc.log("signInByFaceBook: "+ responseJson.code);
                            if (!creants_api.isFailCode(responseJson.code)) {
                                creants_api._setLoginSession(responseJson);
                                creants_api.loginType = const_key.LOGIN_TYPE_FACEBOOK;
                                this.isEnableAutoSavingToken() && this.setItem(creants_api.KEY_LOGIN_TOKEN, JSON.stringify({token:token,type:const_key.LOGIN_TYPE_FACEBOOK}));
                                callback && callback(responseJson);
                            } else {
                                responseJson.code === const_key.FAIL_EXPIRE_TOKEN && (this.clearFacebookToken());
                                callback && callback(null, responseJson);
                            }
                        }.bind(this));

                }
                else{
                    cc.log("requestFacebook fail" + token);
                    callback && callback(null,creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_FACEBOOK_NOT_CONNECT));
                }
            }.bind(this));
        };
        this.signInByAccountKit = function(callback){
            this.requestAccountKit(function(info){
                var token = info.token;
                if( token ){
                    cc.log("requestAccountKit success: " + token);
                    this.postHTTP(creants_api.getSignInByAccountKitREST(),
                        {
                            app_id: creants_api.APP_ID,
                            phone: info.phoneNumber,
                            fb_token: token
                        }, function (responseJson) {
                            cc.log("signInByAccountKit: "+ responseJson.code);
                            if (!creants_api.isFailCode(responseJson.code)) {
                                creants_api._setLoginSession(responseJson);
                                creants_api.loginType = const_key.LOGIN_TYPE_ACCOUNTKIT;
                                this.isEnableAutoSavingToken() && this.setItem(creants_api.KEY_LOGIN_TOKEN, JSON.stringify({token:token,type:const_key.LOGIN_TYPE_ACCOUNTKIT}));
                                callback && callback(responseJson);
                            } else {
                                responseJson.code === const_key.FAIL_EXPIRE_TOKEN && (this.clearAccountKitToken());
                                callback && callback(null, responseJson);
                            }
                        }.bind(this));

                }
                else{
                    cc.log("requestAccountKit fail" + info["errorCode"]);
                    callback && callback(null,creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_ACCOUNTKIT_NOT_CONNECT));
                }
            }.bind(this));
        };
        this.linkFacebook = function(token,playerId){
            this.isEnableAutoSavingToken() && this.setItem(creants_api.KEY_LOGIN_TOKEN, JSON.stringify({token:token,type:const_key.LOGIN_TYPE_FACEBOOK}));
            this.loadDeviceString(function(deviceId){
                var str = this.getItem(creants_api.KEY_LINK_ACCOUNT);
                if( str ){
                    str = JSON.parse(str);
                }
                str = str || {};
                str[playerId] = token;
                this.setItem(creants_api.KEY_LINK_ACCOUNT,JSON.stringify(str));
            }.bind(this));
        };
        this.linkAccountKit = function(token,playerId){
            this.isEnableAutoSavingToken() && this.setItem(creants_api.KEY_LOGIN_TOKEN, JSON.stringify({token:token,type:const_key.LOGIN_TYPE_ACCOUNTKIT}));
            this.loadDeviceString(function(deviceId){
                var str = this.getItem(creants_api.KEY_LINK_ACCOUNT);
                if( str ){
                    str = JSON.parse(str);
                }
                str = str || {};
                str[playerId] = token;
                this.setItem(creants_api.KEY_LINK_ACCOUNT,JSON.stringify(str));
            }.bind(this));
        };
        this.isLinkedAccount = function(playerId){
            var str = this.getItem(creants_api.KEY_LINK_ACCOUNT);
            if( str ){
                str = JSON.parse(str);
            }
            if( str ){
                return str[playerId] != null;
            }
            return false;
        };
        this.logOut = function (token, callback) {
            this.postHTTP(creants_api.getSignOutREST(),
                {token: token},
                function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        creants_api.clearCurrentUser();
                        this.removeItem(creants_api.KEY_LOGIN_TOKEN);
                        callback && callback(token, responseJson);
                    } else {
                        callback && callback(null, responseJson);
                    }
                }.bind(this));
        };
        this.requestPasswordByEmail = function (email, callback) {
            this.postHTTP(creants_api.getRecoveryPasswordRest(),
                {
                    email: email,
                    app_id: creants_api.APP_ID
                },
                function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        callback && callback(true, responseJson);
                    } else {
                        callback && callback(false, responseJson);
                    }
                }.bind(this)
            );
        };
        this.signUp = function (name, password, email, callback) {
            this.postHTTP(creants_api.getSignUpREST(),
                {
                    username: name,
                    password: password,
                    email: email,
                    app_id: creants_api.APP_ID
                },
                function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        callback && callback(true, responseJson);
                    } else {
                        callback && callback(false, responseJson);
                    }
                }.bind(this)
            );
        };

        this.resetPassword = function (verifyCode, pass, callback) {
            this.postHTTP(creants_api.getResetPasswordRest(),
                {
                    verify_code: verifyCode,
                    password: pass
                },
                function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        callback && callback(true, responseJson);
                    } else {
                        callback && callback(false, responseJson);
                    }
                }.bind(this)
            );
        };

        this.verifyValidationCode = function (verifyCode, callback) {
            this.postHTTP(creants_api.getVerifyValidationGenerateCodeRest(),
                {
                    verify_code: verifyCode
                },
                function (responseJson) {
                    if (!creants_api.isFailCode(responseJson.code)) {
                        callback && callback(true, responseJson);
                    } else {
                        callback && callback(false, responseJson);
                    }
                }.bind(this)
            );
        };
        this.setToken = function(token){
            this._TOKEN_ = token;
        };
        this.log = function(str){

        };

        this.loadConfig = function(){

        };
        this.postHTTP = function (url, param, callback) {

        };
        this.requestFacebook = function () {
        };
        this.clearFacebookToken = function(){
        };
        this.requestAccountKit = function(){
        };
        this.clearAccountKitToken = function(){
        };
        this.setItem = function (key, val) {

        };
        this.getItem = function (key) {

        };
        this.removeItem = function (key) {

        };
        this.clearToken = function(){
            this.removeItem(creants_api.KEY_LOGIN_TOKEN);
        };
        this.setEnableAutoSavingToken = function(enable){
            this._enableAutoSavingToken = enable;
        };
        this.isEnableAutoSavingToken = function(){
            if( this._enableAutoSavingToken === undefined){
                this._enableAutoSavingToken = true;
            }
            return this._enableAutoSavingToken;
        };
        this.saveLoginToken = function(){
            if( creants_api.currentToken && creants_api.loginType ){
                this.setItem(creants_api.KEY_LOGIN_TOKEN, JSON.stringify({token:creants_api.currentToken,type:creants_api.loginType}));
            }
        };
        this.getDeviceString = function () {

        };
        this.getPlatformOS = function () {

        };
    };

    return creants_api;
}());

try {
    module.exports = creants_api;
}
catch (err) {
}
