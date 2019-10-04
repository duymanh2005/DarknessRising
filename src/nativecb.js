/**
 * Created by long.nguyen on 4/11/2019.
 */
bb.ack = bb.Class.extend({
    _id: null,
    _phoneNumber: null,
    _infoCb: null,

    cbSetInfo: function (info) {
        if (info) {
            this._id = info["id"];
            this._phoneNumber = info["phoneNumber"];
            this._token = info["token"];

            cc.log("--------ACCOUNT KIT ---------setInfo: " + this.getAccountId() + "," + this.getPhoneNumber() + ", " + this.getToken());
            this.notifyDataChangedWithParameter(info);
            if (this._infoCb) {
                this._infoCb(info);
                this._infoCb = null;
            }
        } else {
            cc.log("not found info");
        }
    },

    cbErrorInfo: function (err) {
        this.notifyDataChangedWithParameter(err);
        if (this._infoCb) {
            this._infoCb(err);
            this._infoCb = null;
        }
    },

    loginByPhone: function (callback) {
        if (cc.sys.isNative) {
            this._infoCb = callback;
            if (bb.framework.isAndroid()) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "loginByPhone", "()Ljava/lang/String;");
            } else if (bb.framework.isIos()) {
                jsb.reflection.callStaticMethod("AppController", "loginByPhone");
            }
        }
    },

    logoutByPhone: function () {
        if (cc.sys.isNative) {
            if (bb.framework.isAndroid()) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "logoutByPhone", "()Ljava/lang/String;");
            } else if (bb.framework.isIos()) {
                jsb.reflection.callStaticMethod("AppController", "logoutByPhone");
            }
        }
    },

    getToken: function () {
        return this._token;
    },

    getAccountId: function () {
        return this._id;
    },

    getPhoneNumber: function () {
        return this._phoneNumber;
    }
});
bb.ack = new bb.ack();

bb.fbm = bb.Class.extend({
    _token: null,
    _tokenCb: null,

    cbSetFireBaseMessagingToken: function (token) {
        this._token = token;
        this.notifyDataChangedWithParameter(token);
        if (this._tokenCb) {
            this._tokenCb(token);
            this._tokenCb = null;
        }
    },

    getAsyncFireBaseMessagingToken: function (callback) {
        if (cc.sys.isNative) {
            this._tokenCb = callback;
            if (bb.framework.isAndroid()) {
                jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getAsyncFireBaseMessagingToken", "()Ljava/lang/String;");
            } else if (bb.framework.isIos()) {
                var token = jsb.reflection.callStaticMethod("AppController", "getAsyncFireBaseMessagingToken");
                this.cbSetFireBaseMessagingToken(token);
            }
        }
    },

    getToken: function () {
        return this._token;
    }

});
bb.fbm = new bb.fbm();

