/**
 * Created by longnguyen on 12/23/2016.
 *
 */

var CreantsCocosAPI = new creants_api.PlatformAPI();
CreantsCocosAPI.loadConfig = function(){
    cc.log("CreantsCocosAPI.loadConfig");
    creants_config && creants_api.setConfig(creants_config);
};
CreantsCocosAPI.postHTTP = function(url,param,callback){
    try {
        var xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST",url);
        xhr.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
        var args = "";
        for(var key in param ){
            args += (key+"="+param[key]);
            args += "&";
        }
        args = args.slice(0,-1);
        xhr.send( args );
        xhr.onreadystatechange = function ()
        {
            if ( xhr.readyState == 4 && ( xhr.status >= 200 && xhr.status <= 207 ) )
            {
                var httpStatus = xhr.statusText;
                var response = xhr.responseText;
                callback && callback(JSON.parse(response));
            }
            else if( xhr.readyState === 4 && (xhr.status >= 500 || xhr.status === 401)){
                callback && callback(creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
            }
        }
        xhr.onerror = function(){
            callback && callback(creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
        }
    }
    catch ( err ){
        callback && callback(creants_api.createClientFailCode(creants_api.const_key.FAIL_CLIENT_NETWORK_ERROR));
    }
};

CreantsCocosAPI.requestFacebook = function(callback){
    if( mc.const.TEST_FACEBOOK_TOKEN ){
        callback && callback(mc.const.TEST_FACEBOOK_TOKEN);
    }
    else{
        bb.pluginBox.facebook.logIn(callback);
    }
};

CreantsCocosAPI.clearFacebookToken = function(){
    bb.pluginBox.facebook.logOut();
};

CreantsCocosAPI.requestAccountKit = function(callback){
    bb.ack.loginByPhone(callback);
};
CreantsCocosAPI.clearAccountKitToken = function(){
    bb.ack.logoutByPhone();
};

CreantsCocosAPI.getPlatformOS = function(){
    var pos = "adr";
    if (bb.framework.isIos()) {
        pos = "ios";
    }
    return pos;
};

CreantsCocosAPI.getDeviceString = function () {
    return CreantsCocosAPI._strDeviceId;
};

CreantsCocosAPI.setItem = function(key,val){
    cc.sys.localStorage.setItem(key,val);
};

CreantsCocosAPI.getItem = function(key){
    return cc.sys.localStorage.getItem(key);
};

CreantsCocosAPI.removeItem = function(key){
    cc.sys.localStorage.removeItem(key);
};

CreantsCocosAPI.log = function(str){
    cc.log(str);
};

CreantsCocosAPI.loadDeviceString = function(callback){
    if( cc.sys.isNative ){
        if( !CreantsCocosAPI._strDeviceId ){
            var _registerRunner = function (name, callback, target, interval, delay) {
                interval = interval || 1;
                delay = delay || 0;
                cc.director.getScheduler().schedule(callback, target, interval, cc.REPEAT_FOREVER, delay, false, name);
            };
            var _unRegisterRunner = function (name, target) {
                cc.director.getScheduler().unschedule(name, target);
            };
            cc.log("CreantsCocosAPI.loadDeviceString");
            var count = 0;
            _registerRunner("getDiveString",function(){
                count++;
                if( bb.framework.isAndroid() ){
                    cc.log("CreantsCocosAPI.loadDeviceString  read android device id");
                    CreantsCocosAPI._strDeviceId = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getUserNames", "()Ljava/lang/String;");
                }
                else if( bb.framework.isIos() ){
                    // cc.log("******** CALL APPController");
                    // var ret = jsb.reflection.callStaticMethod("AppController",
                    //                        "callNativeUIWithTitle:andContent:",
                    //                        "cocos2d-js",
                    //                        "Yes! you call a Native UI from Reflection");
                    // cc.log("******* TEST *******: " + ret);
                    cc.log("CreantsCocosAPI.loadDeviceString  read ios device id");
                    // CreantsCocosAPI._strDeviceId = jsb.reflection.callStaticMethod("AppController", "getUUID");
                    CreantsCocosAPI._strDeviceId = jsb.reflection.callStaticMethod("AppController", "getUUID:andContent:","title","content");
                }
                else{
                    cc.log("read system" + cc.sys.os +" device id");
                }
                cc.log("--------------------");
                cc.log("CreantsCocosAPI.loadDeviceString  read str Device Id = " + CreantsCocosAPI._strDeviceId);
                if( CreantsCocosAPI._strDeviceId || count >= 3){
                    _unRegisterRunner("getDiveString",CreantsCocosAPI);
                    callback && callback(CreantsCocosAPI._strDeviceId);
                }
            },CreantsCocosAPI,4,0.1);
        }
        else{
            callback && callback(CreantsCocosAPI._strDeviceId);
        }
    }
};
