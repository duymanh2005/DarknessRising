/**
 * Created by longnguyen on 10/18/2016.
 */
bb.Screen = bb.Layer.extend({
    _isInitRes: false,
    _isEnableInput: true,
    _enableBackEvent: true,
    _mapPreLoadURL: null,

    ctor: function () {
        this._super();
        this._mapPreLoadURL = {};
    },

    setEnableBackEvent: function (isEnableEvent) {
        this._enableBackEvent = isEnableEvent;
    },

    traceDataChange: function (glueObject, cb) {
        if (!this.__arrTrackingKey) {
            this.__arrTrackingKey = [];
        }
        var trackingKey = bb.director.trackGlueObject(glueObject, cb);
        this.__arrTrackingKey.push(trackingKey);
    },

    show: function (loadingLayer) {
        this.retain();
        loadingLayer && loadingLayer.retain();
        setTimeout(function () {
            bb.director.runScreen(this, loadingLayer);
            this.release();
            loadingLayer && loadingLayer.release();
        }.bind(this), 1);
    },

    isInitRes: function () {
        return this._isInitRes;
    },

    initResources: function () {
    },

    getPreLoadURL: function () {
        return [];
    },

    loadMoreURL: function (arrURL, cb, progressCb) {
        if (!cc.sys.isNative) {
            cc.loader.load(arrURL, function (result, count, loadedCount) {
                var percent = (loadedCount / count * 100) | 0;
                progressCb && progressCb(percent);
            }, function () {
                this._appendPreLoadURL(arrURL);
                cb && cb();
            }.bind(this));
        } else {
            cb && cb();
        }
    },

    _appendPreLoadURL: function (arrURL) {
        for (var i = 0; i < arrURL.length; i++) {
            this._mapPreLoadURL[arrURL[i]] = arrURL[i];
        }
    },

    _getMapPreLoadURL: function () {
        return this._mapPreLoadURL;
    },

    onEnterTransitionDidFinish: function () {
        this._super();
        var self = this;
        this.scheduleOnce(function () {
            var keyboardListener = self._keyboardListener = cc.EventListener.create({
                event: cc.EventListener.KEYBOARD,
                onKeyPressed: function (keyCode, event) {
                    if (self._isEnableInput && self._enableBackEvent) {
                        if (keyCode == cc.KEY.escape || keyCode === cc.KEY.back) {
                            self.isInitRes() && bb.director._processBackKey();
                        }
                    }
                }
            });
            cc.eventManager.addListener(keyboardListener, self);
        }, 0.1);
    },

    onExitTransitionDidStart: function () {
        this._super();
        var self = this;
        if (this.__arrTrackingKey) {
            for (var i = 0; i < this.__arrTrackingKey.length; i++) {
                bb.director.unTrackGlueObject(this.__arrTrackingKey[i]);
            }
        }

        cc.eventManager.removeListener(self._keyboardListener);
    },

    getScreenId: function () {
        return null;
    },

    enableInput: function (isEnable) {
        this._isEnableInput = isEnable;
        if (!isEnable) {
            var layout = this.getChildByName("_input_layer_");
            if (!layout) {
                layout = new ccui.Layout();
                layout.width = cc.winSize.width;
                layout.height = cc.winSize.height;
                layout.setTouchEnabled(true);
                layout.setName("_input_layer_");
                layout.setLocalZOrder(99999999 - 1);
                layout.registerTouchEvent(function () {
                    cc.log(" PREVENT TOUCH INPUT!!!");
                });
                this.addChild(layout);
            }
        } else {
            var child = this.getChildByName("_input_layer_");
            child && child.removeFromParent();
        }
    },

    onScreenPause: function () {
    },

    onScreenResume: function () {
    },

    onScreenShow: function () {
    },

    onScreenClose: function () {
    }

});