/**
 * Created by longnguyen on 12/23/2016.
 *
 */
//'use strict';
//
//const FBSDK = require('react-native-fbsdk');
//const {
//    LoginManager,
//    AccessToken
//    } = FBSDK;
//
//var creants_api = require('../js/creants_api');
//global.creants_api = creants_api;
//
//var DeviceInfo = require('react-native-device-info');
//import { Platform } from 'react-native';
//
//import {
//    AsyncStorage
//    } from 'react-native';
//
//creants_api.setConfig(require('../config.json'));
//
//var CreantsReactAPI = new creants_api.PlatformAPI();
//CreantsReactAPI.prototype.postHTTP = function (url, param, callback) {
//    let formBody = [];
//    for (var key in param) {
//        formBody.push(key + "=" + param[key]);
//    }
//    formBody = formBody.join("&");
//    fetch(url, {
//        method: "POST",
//        headers: {
//            'Accept': 'application/json',
//            'Content-Type': 'application/x-www-form-urlencoded'
//        },
//        body: formBody
//    })
//        .then((response) => response.json())
//        .then((responseJson) => {
//            callback && callback(JSON.parse(response));
//        })
//        .catch((error) => {
//            callback && callback(null, creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
//        })
//        .done();
//};
//
//CreantsCocosAPI.prototype.requestFacebook = function (callback) {
//
//};
//
//CreantsCocosAPI.prototype.getPlatformOS = function () {
//    var pos = "adr";
//    if (Platform.OS === 'ios') {
//        pos = "ios";
//    }
//    return pos;
//};
//
//CreantsReactAPI.prototype.getDeviceString = function () {
//    return DeviceInfo.getUniqueID();
//};
//
//CreantsReactAPI.prototype.setItem = function (key, val) {
//    AsyncStorage.setItem(key, val).then().done();
//}
//
//CreantsReactAPI.prototype.getItem = function (key) {
//    return AsyncStorage.getItem(key).then().done();
//}
//
//CreantsReactAPI.prototype.removeItem = function (key) {
//    AsyncStorage.removeItem(key).then().done();
//}
//
////var CreantsReactAPI = {
////
////    getCurrentToken: function(callback) {
////        AsyncStorage.getItem(creants_api.KEY_LOGIN_TOKEN).then((token) => {
////            if (!token) {
////                callback && callback(null,creants_api.createClientFailCode());
////            } else {
////                fetch(creants_api.getValidateTokenRest(), {
////                        method: "POST",
////                        headers: {
////                            'Accept': 'application/json',
////                            'Content-Type': 'application/x-www-form-urlencoded'
////                        },
////                        body: "token" + "=" + token
////                    })
////                    .then((response) => response.json())
////                    .then((responseJson) => {
////                        if (!creants_api.isFailCode(responseJson.code)) {
////                            creants_api._setLoginSession(responseJson);
////                            callback && callback(responseJson);
////                        } else {
////                            AsyncStorage.removeItem(creants_api.KEY_LOGIN_TOKEN).then().done(); // remove the expire token.
////                            callback && callback(null,responseJson);
////                        }
////                    })
////                    .catch((error) => {
////                        callback && callback(null,creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
////                    })
////                    .done();
////            }
////        }).done();
////
////    },
////
////    signInByGuest: function(callback) {
////        var pos = "adr";
////        if( Platform.OS === 'ios'){
////            pos = "ios";
////        }
////        fetch(creants_api.getSignInByGuestREST(), {
////                method: "POST",
////                headers: {
////                    'Accept': 'application/json',
////                    'Content-Type': 'application/x-www-form-urlencoded'
////                },
////                body: "device_id="+pos+"##"+DeviceInfo.getUniqueID()+"##"+creants_api.APP_ID
////            })
////            .then((response) => response.json())
////            .then((responseJson) => {
////                if (!creants_api.isFailCode(responseJson.code)) {
////                    creants_api._setLoginSession(responseJson);
////                    CreantsReactAPI.saveCurrentToken(responseJson.token);
////                    callback && callback(responseJson);
////                } else {
////                    callback && callback(null,responseJson);
////                }
////            })
////            .catch((error) => {
////                callback && callback(null,creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
////            })
////            .done();
////    },
////
////    signInByFaceBook: function(callback) {
////        LoginManager.logInWithReadPermissions(['public_profile', 'email']).then(
////            function(result) {
////                if (result.isCancelled) {
////                    console.log('Login cancelled');
////                    callback && callback(null,creants_api.createClientFailCode());
////                } else {
////                    console.log('Login success with permissions: ' +
////                        result.grantedPermissions.toString());
////                    AccessToken.getCurrentAccessToken().then(
////                        (data) => {
////                            console.log(data.accessToken.toString());
////                            let formBody = [];
////                            formBody.push("app_id" + "=" + creants_api.APP_ID);
////                            formBody.push("fb_token" + "=" + data.accessToken.toString());
////                            formBody = formBody.join("&");
////                            fetch(creants_api.getOauthREST(), {
////                                    method: "POST",
////                                    headers: {
////                                        'Accept': 'application/json',
////                                        'Content-Type': 'application/x-www-form-urlencoded'
////                                    },
////                                    body: formBody
////                                })
////                                .then((response) => response.json())
////                                .then((responseJson) => {
////                                    if (!creants_api.isFailCode(responseJson.code)) {
////                                        creants_api._setLoginSession(responseJson);
////                                        CreantsReactAPI.saveCurrentToken(responseJson.token);
////                                        callback && callback(responseJson);
////                                    } else {
////                                        callback && callback(null,responseJson);
////                                    }
////                                })
////                                .catch((error) => {
////                                    callback && callback(null,creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
////                                })
////                                .done();
////                        }
////                    )
////                }
////            },
////            function(error) {
////                console.log('Login fail with error: ' + error);
////            }
////        );
////    },
////
////    signInByCreants: function(username,password,callback) {
////        let formBody = [];
////        formBody.push("app_id" + "=" + creants_api.APP_ID);
////        formBody.push("username" + "=" + username);
////        formBody.push("password" + "=" + password);
////        formBody = formBody.join("&");
////        fetch(creants_api.getSignInByCreantsREST(), {
////                method: "POST",
////                headers: {
////                    'Accept': 'application/json',
////                    'Content-Type': 'application/x-www-form-urlencoded'
////                },
////                body: formBody
////            })
////            .then((response) => response.json())
////            .then((responseJson) => {
////                if (!creants_api.isFailCode(responseJson.code)) {
////                    creants_api._setLoginSession(responseJson);
////                    CreantsReactAPI.saveCurrentToken(responseJson.token);
////                    callback && callback(responseJson);
////                } else {
////                    callback && callback(null,responseJson);
////                }
////            })
////            .catch((error) => {
////                callback && callback(null,creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
////            })
////            .done();
////    },
////
////    logout:function(token,callback){
////        console.log("log out");
////      fetch(creants_api.getSignOutREST(), {
////              method: "POST",
////              headers: {
////                  'Accept': 'application/json',
////                  'Content-Type': 'application/x-www-form-urlencoded'
////              },
////              body: "token="+token
////          })
////          .then((response) => response.json())
////          .then((responseJson) => {
////              console.log("reponse");
////              console.log(responseJson);
////              if (!creants_api.isFailCode(responseJson.code)) {
////                  creants_api.clearCurrentUser();
////                  AsyncStorage.removeItem(creants_api.KEY_LOGIN_TOKEN).then().done();
////                  callback && callback(token);
////              } else {
////                  callback && callback(null,responseJson);
////              }
////          })
////          .catch((error) => {
////              console.log("catch");
////              console.log(error);
////              callback && callback(null,creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
////          })
////          .done();
////    },
////
////    saveCurrentToken: function(token) {
////        AsyncStorage.setItem(creants_api.KEY_LOGIN_TOKEN, token).then().done();
////    },
////
////    getAPI: function() {
////        return creants_api;
////    }
////
////};
//
//export default CreantsReactAPI;
