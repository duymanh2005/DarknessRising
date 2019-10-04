/**
 * Created by longnguyen on 8/28/2016.
 */
bb.Dialog = ccui.Layout.extend({
    _enableClickOutSize: true,
    _enableBackEvent: true,
    _isAnimating: false,
    _showImmediately: false,
    _needShowUnderLayer: true,

    ctor: function () {
        this._super();

        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.x = cc.winSize.width * 0.5;
        this.y = cc.winSize.height * 0.5;
        this.width = cc.winSize.width;
        this.height = cc.winSize.height;
        this.setCascadeOpacityEnabled(true);
        this._touchScale = 0.00001;
        this.registerTouchEvent(function () {
            this._clickOutSize();
        }.bind(this));
    },

    setTopMost: function (isTopMost) {
        this._isTopMost = isTopMost;
        return this;
    },

    setCloseCallback: function (callback) {
        this.__closeCallback__ = callback;
        return this;
    },

    isAnimating: function () {
        return this._isAnimating;
    },

    onBackEvent: function () {
        if (this._enableBackEvent) {
            this.close();
            return true;
        }
        return false;
    },

    onShow: function () {
    },

    onClose: function () {
    },

    show: function (transitionFunc) {
        bb.director.showDialog(this, transitionFunc);
        return this;
    },

    traceDataChange: function (glueObject, cb) {
        if (!this.__arrTrackingKey) {
            this.__arrTrackingKey = [];
        }
        var trackingKey = bb.director.trackGlueObject(glueObject, cb);
        this.__arrTrackingKey.push(trackingKey);
    },

    setBlackBackgroundEnable: function (enable) {
        var blackBrk = this.getChildByName("__blackBrk__");
        if (!blackBrk) {
            blackBrk = new ccui.Layout();
            blackBrk.setName("__blackBrk__");
            blackBrk.anchorX = blackBrk.anchorY = 0.5;
            blackBrk.x = cc.winSize.width * 0.5;
            blackBrk.y = cc.winSize.height * 0.5;
            blackBrk.width = cc.winSize.width;
            blackBrk.height = cc.winSize.height;
            blackBrk.setLocalZOrder(-1000);
            blackBrk.setBackGroundColor(cc.color.BLACK);
            blackBrk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            blackBrk.setBackGroundColorOpacity(bb.framework.getTrueOpacity(128));
            this.addChild(blackBrk);
        }
        blackBrk.setVisible(enable);
        return this;
    },

    setShowUnderLayer: function (isShow) {
        this._needShowUnderLayer = isShow;
        return this;
    },

    setAutoClose: function (isEnable) {
        this.setEnableBackEvent(isEnable);
        this.setEnableClickOutSize(isEnable);
        return this;
    },

    setEnableBackEvent: function (enable) {
        this._enableBackEvent = enable;
        return this;
    },

    isEnableBackEvent: function () {
        return this._enableBackEvent;
    },

    setEnableClickOutSize: function (enable) {
        this._enableClickOutSize = enable;
        return this;
    },

    _clickOutSize: function () {
        if (this._enableClickOutSize) {
            this.close();
            return true;
        }
        return false;
    },

    getDialogId: function () {
        return null;
    },

    overrideShowAnimation: function () {
        return 0;
    },

    overrideCloseAnimation: function () {
        return 0;
    },

    close: function () {
        this.__closeCallback__ && this.__closeCallback__(this);
        if (this.__arrTrackingKey) {
            for (var i = 0; i < this.__arrTrackingKey.length; i++) {
                bb.director.unTrackGlueObject(this.__arrTrackingKey[i]);
            }
        }
        bb.director.closeDialog(this);
    },

    enableInput: function (isEnable) {
        if (!isEnable) {
            var layout = new ccui.Layout();
            layout.width = cc.winSize.width;
            layout.height = cc.winSize.height;
            layout.setTouchEnabled(true);
            layout.setName("_input_layer_");
            layout.setLocalZOrder(99999999 - 1);
            this.addChild(layout);
            this._preEnableBackEvent = this._enableBackEvent;
            this._preEnableClickOutSide = this._enableClickOutSize;
            this.setAutoClose(false);
        } else {
            if (this._preEnableBackEvent != undefined) {
                this.setEnableBackEvent(this._preEnableBackEvent);
                delete this._preEnableBackEvent;
            }
            if (this._preEnableClickOutSide != undefined) {
                this.setEnableClickOutSize(this._preEnableClickOutSide);
                delete this._preEnableClickOutSide;
            }
            var child = this.getChildByName("_input_layer_");
            child && child.removeFromParent();
        }
    }

});

bb.DefaultDialog = bb.Dialog.extend({
    _dialogMargin: null,
    _dialogWidth: 0,

    ctor: function () {
        this._super();
        this._dialogMargin = {
            top: 10,
            left: 10,
            bottom: 10,
            right: 10,
            ptContent: 10,
            pbContent: 10
        };
        var container = this._container = new ccui.Layout();
        container.setName("__container__");
        container.x = cc.winSize.width * 0.5;
        container.y = cc.winSize.height * 0.5;
        container.anchorX = 0.5;
        container.anchorY = 0.5;
        this.addChild(container);
    },

    _validateView: function (view, name) {
        var temp = this._container.getChildByName(name);
        temp && temp.removeFromParent();
        view && view.removeFromParent();
        this._container.addChild(view);
        view.setName(name);
    },

    setExitButton: function (button, func) {
        this._validateView(button, "button_exit");
        button.registerTouchEvent(function () {
            func && func();
            this.close();
        }.bind(this));
        return this;
    },

    setButton_2View: function (button, func) {
        this._validateView(button, "button_2");
        button.registerTouchEvent(function () {
            if (func) {
                func();
            } else {
                this.close();
            }
        }.bind(this));
        return this;
    },

    setButton_1View: function (button, func) {
        this._validateView(button, "button_1");
        button.registerTouchEvent(function () {
            if (func) {
                func();
            } else {
                this.close();
            }
        }.bind(this));
        return this;
    },

    setDialogMargin: function (margin) {
        if (margin) {
            this._dialogMargin = margin;
        }
        return this;
    },

    setDialogWidth: function (width) {
        this._dialogWidth = width;
        return this;
    },

    setBackgroundView: function (backgroundView) {
        this._validateView(backgroundView, "background_view");
        return this;
    },

    setContentView: function (contentView) {
        this._validateView(contentView, "content_view");
        return this;
    },

    setTitleView: function (titleView) {
        this._validateView(titleView, "title_view");
        return this;
    },

    setTitle: function (title, color) {
        this.setTitleView(bb.framework.getGUIFactory().createText(title, res.font_cam_stroke_32_export_fnt, mc.const.FONT_SIZE_32));
        return this;
    },

    setMessage: function (message, color) {
        this.setContentView(bb.framework.getGUIFactory().createText(message, res.font_cam_stroke_32_export_fnt));
        return this;
    },

    enableYesNoButton: function (funcYes, funcNo) {
        var btn1 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblYes"));
        var btn2 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblNo"));
        this.setButton_1View(btn1, funcYes);
        this.setButton_2View(btn2, funcNo);
        return this;
    },

    enableOkButton: function (funcOk, text) {
        var btn1 = bb.framework.getGUIFactory().createButton(text || "Ok");
        this.setButton_1View(btn1, funcOk);
        return this;
    },

    enableExitButton: function (funcExit) {
        var btn = bb.framework.getGUIFactory().createButton("Exit");
        this.setExitButton(btn, funcExit);
        return this;
    },

    disableExitButton: function () {
        var exitBtn = this.getButtonExit();
        if (exitBtn) {
            exitBtn.removeFromParent();
        }
        return this;
    },

    getContentView: function () {
        return this._container.getChildByName("content_view");
    },

    getTitleView: function () {
        return this._container.getChildByName("title_view");
    },

    getButton1: function () {
        return this._container.getChildByName("button_1");
    },

    getButtonExit: function () {
        return this._container.getChildByName("button_exit");
    },

    getBackgroundView: function () {
        return this._container.getChildByName("background_view");
    },

    reCalculatePositionAndContentSize: function () {
        var container = this.getChildByName("__container__");
        var button_1 = container.getChildByName("button_1");
        var button_2 = container.getChildByName("button_2");
        var background_view = container.getChildByName("background_view");
        var content_view = container.getChildByName("content_view");
        var title_view = container.getChildByName("title_view");
        var exitBtn = container.getChildByName("button_exit");


        var brkW = 0;
        var minW = cc.winSize.width * 0.75;
        var margin = this._dialogMargin;
        if (!this._dialogWidth) {
            brkW = Math.max(content_view.width, title_view.width) + (margin.left + margin.right);
            brkW = Math.max(minW, brkW);
        } else {
            brkW = this._dialogWidth;
        }

        var button = button_1 || button_2;
        if (button_1 && button_2) {
            var maxWBtn = Math.max(button_1.width, button_2.width);
            var d = (brkW - maxWBtn * 2) / 3;
            button_1.x = d + button_1.width * 0.5;
            button_1.y = margin.bottom + button_1.height * 0.5;
            button_2.x = d + button_1.width + d + button_2.width * 0.5;
            button_2.y = margin.bottom + button_2.height * 0.5;
        } else {
            if (button) {
                button.x = brkW * 0.5;
                button.y = margin.bottom + button.height * 0.5;
            }
        }
        var ttH = title_view ? title_view.height : 0;
        var btnH = button ? button.height : 0;

        var yLayout = margin.bottom;
        if (button) {
            yLayout += button.height;
            yLayout += margin.pbContent;
        }

        content_view.x = (brkW - content_view.width) * 0.5 + content_view.width * content_view.anchorX;
        content_view.y = yLayout + content_view.height * content_view.anchorY;

        background_view.width = brkW;
        background_view.height = margin.bottom + margin.top + content_view.height + margin.ptContent + ttH + btnH + (btnH > 0 ? margin.pbContent : 0);
        container.width = background_view.width;
        container.height = background_view.height;
        container.setTouchEnabled(true);
        if (exitBtn) {
            exitBtn.x = brkW;
            exitBtn.y = container.height;
        }

        if (title_view) {
            title_view.x = brkW * 0.5;
            title_view.y = container.height - title_view.height * 0.5 - margin.top;
        }

        background_view.setLocalZOrder(0);
        content_view.setLocalZOrder(1);
        title_view.setLocalZOrder(1);
        button_1 && button_1.setLocalZOrder(2);
        button_2 && button_2.setLocalZOrder(2);
        exitBtn && exitBtn.setLocalZOrder(2);
    },

    show: function () {
        this.reCalculatePositionAndContentSize();
        this._super();
    }

});

bb.DefaultLoadingDialog = bb.Dialog.extend({

    ctor: function () {
        this._super();

        var currStrIndex = 0;
        var arrStrLoading = [".", "..", "..."];
        var text = bb.framework.getGUIFactory().createText("lblLoading", bb.framework.const.FONT_LARGE);
        text.x = cc.winSize.width * 0.5;
        text.y = cc.winSize.height * 0.5;
        text.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(function () {
            text.setString(mc.dictionary.getGUIString("lblLoading") + arrStrLoading[currStrIndex++]);
        })]).repeatForever());
        this.addChild(text);

        this.setEnableClickOutSize(false);
    }

});