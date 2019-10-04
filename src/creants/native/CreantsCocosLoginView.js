/**
 * Created by long.nguyen on 5/5/2017.
 */
var CreantsCocosLoginView = cc.Node.extend({

    ctor:function(callback){
        this._super();

        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = cc.winSize.width;
        this.height = cc.winSize.height;

        var self = this;
        var loginController = this.loginController = new CreantsLoginController(CreantsCocosAPI, function (str) {
            cc.sys.localStorage.setItem("message_send_from_cocos_native",str);
        },callback);

        var webView = new ccui.WebView("src/creants/index1.html");
        webView.setContentSize(cc.winSize.width, cc.winSize.height);
        webView.setPosition(webView.width*0.5, webView.height*0.5);

        this.runAction(cc.sequence([cc.callFunc(function(){
            var str = cc.sys.localStorage.getItem("message_received_from_login_webview");
            var obj = null;
            if( str ){
                obj = JSON.parse(str);
                cc.sys.localStorage.removeItem("message_received_from_login_webview");
                loginController.catchMessageFromWebViewToNative(obj);
            }
        }.bind(this)),cc.delayTime(0.5)]).repeatForever());

        this.addChild(webView);
    },

    onEnter:function(){
        this._super();
        cc.log("Check Token");
        this.loginController.checkCurrentToken();
    }

});