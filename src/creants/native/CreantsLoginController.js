/**
 * Created by long.nguyen on 5/5/2017.
 */
var CreantsLoginController = function(api,postToWebViewFunc,callback){
    var messageQueue = [];
    var _processLoginInfo = function(result,fail) {
        if (result && !creants_api.isFailCode(result.code)) {
            // this.setState({
            //     loginSuccess: true
            // });
            callback && callback.login && callback.login(result);
        } else {
            callback && callback.login && callback.login(null);
        }
        if( result ){
            _queueEventToWebView(creants_api.event.HAD_CURRENT_TOKEN, result); // notify for WebView
        }
        else if( fail ){
            _queueEventToWebView(creants_api.event.FAIL,fail); // notify for WebView
        }
    };

    var _queueEventToWebView = function(event,data){
        messageQueue.push({
            event: event,
            data: data
        });
    };

    this.catchMessageFromWebViewToNative = function(obj){
        if (obj.event === creants_api.event.KNOCK_KNOCK) {
            if ( messageQueue.length > 0) {
                var rms = messageQueue.splice(0, 1);
                var str = JSON.stringify(rms[0]);
                postToWebViewFunc(str);
            }
        } else if (obj.event === creants_api.event.LOGIN_FB_CLICK) {
            api.signInByFaceBook(function(result,fail) {
                _processLoginInfo(result,fail);
            });
        } else if (obj.event === creants_api.event.LOGIN_BY_GUEST_CLICK) {
            api.signInByGuest(function(result,fail) {
                _processLoginInfo(result, fail);
            });
        }
        else if( obj.event === creants_api.event.LOGIN_CREANTS_CLICK ){
            var param = obj.data;
            api.signInByCreants(param.username, param.password, function (result, fail) {
                _processLoginInfo(result, fail);
            });
        }
        else if( obj.event === creants_api.event.LOGOUT ) {
            var currToken = obj.data.token;
            api.logOut(currToken, function (lostToken, fail) {
                if (lostToken) {
                    _queueEventToWebView(creants_api.event.LOSE_TOKEN, {}); // notify for WebView
                    callback && callback.logout && callback.logout(lostToken);
                }
                else if (fail) {
                    _queueEventToWebView(creants_api.event.FAIL, fail); // notify for WebView
                }
            });
        }
    };

    this.checkCurrentToken = function() {
        api.validateToken(function(result,fail){
            _processLoginInfo(result,fail);
        }.bind(this));
    };

};

try {
    module.exports = CreantsLoginController;
}
catch (err) {
}