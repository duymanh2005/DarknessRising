/**
 * Created by longnguyen on 8/28/2016.
 */
bb.Notification = ccui.Layout.extend({
    _isAnimating: false,
    _isShowing: false,

    ctor: function () {
        this._super();

        this.anchorX = 0.5;
        this.anchorY = 0;
        this.x = cc.winSize.width * 0.5;
        this.y = cc.winSize.height;
        this.width = cc.winSize.width;
        this.height = 60;
        this.setCascadeOpacityEnabled(true);

    },

    isAnimating: function () {
        return this._isAnimating;
    },


    onShow: function () {
        this._isShowing = true;
    },

    onClose: function () {
        this._isShowing = false;
    },

    show: function (animation) {
        bb.director.showNotification(this, animation);
        return this;
    },

    updateVisibleTime: function (time) {
        this._data.remainTime = time;
        bb.director.updateVisibleTimeNotification(this, time);
        return this;
    },

    forceClose: function () {
        bb.director.forceCloseNotification(this);
    },

    traceDataChange: function (glueObject, cb) {
        if (!this.__arrTrackingKey) {
            this.__arrTrackingKey = [];
        }
        var trackingKey = bb.director.trackGlueObject(glueObject, cb);
        this.__arrTrackingKey.push(trackingKey);
        return trackingKey;
    },

    unTraceDataChange: function (glueObject) {
        if (this.__arrTrackingKey) {
            var trackingKey = bb.director.unTrackGlueObject(glueObject, true);
            var ind = this.__arrTrackingKey.indexOf(trackingKey);
            if (ind >= 0) {
                this.__arrTrackingKey.splice(ind, 1);
            }

        }

        return trackingKey;
    },

    getNotifyId: function () {
        return null;
    },

    overrideShowAnimation: function () {
        return 0;
    },

    overrideVisibleTimeAnimation: function () {
        return 3;
    },

    overrideCloseAnimation: function () {
        return 0;
    },

    isShowing: function () {
        return this._isShowing;
    },

    priorityView: function () {
        return 0;
    },

    close: function () {
        this.__closeCallback__ && this.__closeCallback__(this);
        if (this.__arrTrackingKey) {
            for (var i = 0; i < this.__arrTrackingKey.length; i++) {
                bb.director.unTrackGlueObject(this.__arrTrackingKey[i]);
            }
        }
        //bb.director.closeDialog(this);
        this.removeFromParent();


    },


});

bb.NotifyText = bb.Notification.extend({
    _arrayMsg: [],

    ctor: function () {
        this._super();

        //var brkView = this._container = new ccui.ImageView("patch9/Grid_Panel.png", ccui.Widget.PLIST_TEXTURE);
        //brkView.setScale9Enabled(true);
        ////var width = cc.winSize.width * 0.98;
        ////brkView.height = 40;
        //brkView.setContentSize({width : cc.winSize.width ,height :60 });
        //brkView.anchorX = 0.5;
        //brkView.anchorY = 0.5;
        //this.addChild(brkView);
        //brkView.x = this.width * 0.5;
        //brkView.y = this.height * 0.5;

        //this.setBackGroundColor(cc.color.BLACK);
        //this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        //this.setBackGroundColorOpacity(bb.framework.getTrueOpacity(128));
        var brk = new ccui.ImageView("patch9/pnl_waiting_accept.png", ccui.Widget.PLIST_TEXTURE);
        //this.height += 30;
        //this.width -= 180;
        brk.anchorX = 0.5;
        brk.anchorY = 0.5;
        brk.setScale9Enabled(true);
        brk.setContentSize({height: brk.height, width: brk.width + 120});
        this.height = brk.height + 16;
        this.width = brk.width;
        this.addChild(brk);
        brk.x = this.width * 0.5;
        brk.y = this.height * 0.5;

        var lblMsg = this._lblMsg = bb.framework.getGUIFactory().createText("", res.font_UTMBienvenue_none_32_export_fnt);
        lblMsg.setColor(mc.color.BROWN_SOFT);
        //lblMsg.getVirtualRenderer().setBoundingWidth(500);
        lblMsg.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_LEFT);
        lblMsg.anchorX = 0;
        lblMsg.anchorY = 0.5;
        lblMsg.height = 40;
        lblMsg.x = 20;
        lblMsg.y = this.height * 0.6;
        this.addChild(lblMsg);
        bb.director._notifyText = this;
    },


    showMessage: function (message, notifyId, data, callback, color) {
        var obj = {message: message, notifyId: notifyId, data: data, color: color};
        this._arrayMsg.push(obj);
        if (!this._isShowing) {
            this._setMsg(obj.message, obj.color);
            this.registerTouchEvent(function () {
                callback && callback(obj.notifyId, obj.data);
            });

            this.show();
        }
        return this;
    },

    _setMsg: function (message, color) {
        this._lblMsg.setString(message);
        var c = color ? color : mc.color.WHITE_NORMAL;
        this._lblMsg.setColor(c);
    },


    onShow: function () {
        this._super();
        if (this._arrayMsg.length) {
            this._arrayMsg.splice(0, 1);
        }
    },


    onClose: function () {
        this._super();
        if (this._arrayMsg.length) {
            var obj = this._arrayMsg[0];
            this._setMsg(obj.message, obj.color);
            this.registerTouchEvent(function () {
                callback && callback(obj.notifyId, obj.data);
            });
            this.show();
        }
    },

})

bb.NotifyRelicMatch = bb.Notification.extend({
    _data: null,
    _keyScheduleCb: "scheduleCb",

    ctor: function () {
        this._super();

        //var brkView = this._container = new ccui.ImageView("patch9/Grid_Panel.png", ccui.Widget.PLIST_TEXTURE);
        //brkView.setScale9Enabled(true);
        ////var width = cc.winSize.width * 0.98;
        ////brkView.height = 40;
        //brkView.setContentSize({width : cc.winSize.width ,height :60 });
        //brkView.anchorX = 0.5;
        //brkView.anchorY = 0.5;
        //this.addChild(brkView);
        //brkView.x = this.width * 0.5;
        //brkView.y = this.height * 0.5;

        //this.setBackGroundColor(cc.color.BLACK);
        //this.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        //this.setBackGroundColorOpacity(bb.framework.getTrueOpacity(128));


        var brk = new ccui.ImageView("patch9/pnl_waiting_accept.png", ccui.Widget.PLIST_TEXTURE);
        //this.height += 30;
        //this.width -= 180;
        brk.setScale9Enabled(true);
        brk.setContentSize({height: brk.height, width: brk.width + 120});
        brk.anchorX = 0.5;
        brk.anchorY = 0.5;
        this.height = brk.height + 16;
        this.width = brk.width;
        this.addChild(brk);
        brk.x = this.width * 0.5;
        brk.y = this.height * 0.5;
        //var lblName1 = this._lblName1 = bb.framework.getGUIFactory().createText("", res.font_UTMBienvenue_none_32_export_fnt);
        var lblName1 = this._lblName1 = new ccui.Text();
        lblName1.setFontSize(20);
        lblName1.setColor(mc.color.WHITE_NORMAL);
        //lblMsg.getVirtualRenderer().setBoundingWidth(500);
        //lblName1.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_LEFT);
        lblName1.anchorX = 0;
        lblName1.anchorY = 0.5;
        lblName1.height = 40;
        lblName1.x = 20;
        lblName1.y = this.height * 0.6;

        var lblName2 = this._lblName2 = lblName1.clone();
        lblName2.anchorX = 1;
        lblName2.y = this.height * 0.6;
        lblName2.x = this.width - 20;
        this.addChild(lblName1);
        this.addChild(lblName2);

        var vsImg = this._vsView = new ccui.ImageView("icon/ico_bigattack.png", ccui.Widget.PLIST_TEXTURE);
        vsImg.anchorX = 0.5;
        vsImg.anchorY = 0.5;
        vsImg.x = this.width * 0.5;
        vsImg.y = lblName1.y;
        vsImg.scale = 0.8;
        this.addChild(vsImg);

        var lblRemainTime = this._lblRemainTime = lblName1.clone();
        lblRemainTime.anchorX = 0.5;
        lblRemainTime.anchorY = 0.5;
        lblRemainTime.x = vsImg.x;
        lblRemainTime.y = vsImg.y - 30;

        this.addChild(lblRemainTime);

        bb.director._notifyRelicMatch = this;

    },

    //reload: function () {
    //    if (this._isShowing) {
    //        var data = this._data;
    //        if (this._scheduleCb) {
    //            //this.unschedule(this._keyScheduleCb);
    //            this.unscheduleAllCallbacks();
    //            this._scheduleCb = null;
    //        }
    //        if (data) {
    //            var myName = data.you.name;
    //            var oppName = data.opp.name;
    //            var time = this._time;
    //            this._lblName1.setString(oppName);
    //            this._lblName2.setString(myName);
    //            this._lblRemainTime.setString(mc.view_utility.formatDurationTime(time * 1000))
    //            var scheduleCb = this._scheduleCb = function (count) {
    //                this._time -= 1;
    //
    //                this._lblRemainTime.setString(mc.view_utility.formatDurationTime(this._time * 1000))
    //                if (this._time <= 0) {
    //                    mc.GameData.relicArenaManager.setWaitingVS(false);
    //                    if (scheduleCb) {
    //                        //this.unschedule(this._keyScheduleCb);
    //                        this.unscheduleAllCallbacks();
    //                    }
    //
    //                    if (data.action === "pick_hero") {
    //                        mc.protocol.(mc.GameData.relicArenaManager.getMatchInfo().requestId, function (result) {
    //                            if (this._dialogBeforePickHero) {
    //                                this._dialogBeforePickHero.close();
    //                                this._dialogBeforePickHero = null;
    //                            }
    //                            var screen = bb.director.getCurrentScreen();
    //                            if (screen.getScreenId() === mc.GUIState.ID_SCREEN_MAIN) {
    //                                var layer = screen.pushLayerWithId(mc.MainScreen.LAYER_PICK_HERO_RELIC_ARENA);
    //                                layer.setData(result);
    //                            }
    //                            else {
    //                                mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblWarning"), mc.dictionary.getGUIString("lblTheMatchCantStart"));
    //                            }
    //
    //                        }.bind(this));
    //                    }
    //                    this.forceClose();
    //                }
    //            }.bind(this);
    //            if (this._time >= 0) {
    //                this.schedule(scheduleCb, 1.0, this._time - 1, this._keyScheduleCb);
    //            }
    //            this.updateVisibleTime(this._time);
    //            if (this._trackingKey) {
    //                this.unTraceDataChange(this._trackingKey);
    //            }
    //            this._trackingKey = this.traceDataChange(mc.GameData.relicArenaManager, function (result) {
    //                if (result.isWaitingVS() && this._isShowing) {
    //                    try {
    //                        //this.unschedule(this._keyScheduleCb);
    //                        this.unscheduleAllCallbacks();
    //                    }
    //                    catch (e) {
    //
    //                    }
    //                    this._time = mc.const.TIME_BEFORE_PICK_HERO_COUNT_DOWN;
    //                    var screen = bb.director.getCurrentScreen();
    //                    if (screen.getScreenId() !== mc.GUIState.ID_SCREEN_MAIN) {
    //                        mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblWarning"), mc.dictionary.getGUIString("lblYouNeedBackScreenToJoinMatch"));
    //                    }
    //                    data["action"] = "pick_hero";
    //                    //var scheduleCb2 = function(){
    //                    //    time -= 1000;
    //                    //    this._lblRemainTime.setString(mc.view_utility.formatDurationTime(time));
    //                    //    this.forceClose();
    //                    //}.bind(this);
    //                    this.registerTouchEvent(function () {
    //                        var matchInfo = mc.GameData.relicArenaManager.getMatchInfo();
    //                        var dialog = this._dialogBeforePickHero = new mc.DialogVSBeforePickHero(matchInfo);
    //                        dialog.show();
    //                        callback && callback(data);
    //                    }.bind(this));
    //                    this.schedule(scheduleCb, 1.0, this._time - 1, this._keyScheduleCb);
    //                    this.updateVisibleTime(this._time);
    //
    //                }
    //            }.bind(this));
    //            if (this._data && this._data["action"] && this._data["action"] === "pick_hero") {
    //                this.registerTouchEvent(function () {
    //                    var matchInfo = mc.GameData.relicArenaManager.getMatchInfo();
    //                    var dialog = this._dialogBeforePickHero = new mc.DialogVSBeforePickHero(matchInfo);
    //                    dialog.show();
    //                    callback && callback(data);
    //                }.bind(this));
    //            }
    //
    //        }
    //    }
    //    else {
    //        if (this._scheduleCb) {
    //            //this.unschedule(this._scheduleCb);
    //            this.unscheduleAllCallbacks();
    //            this._scheduleCb = null;
    //        }
    //        if (this._trackingKey) {
    //            this.unTraceDataChange(this._trackingKey);
    //            this._trackingKey = null;
    //        }
    //    }
    //},

    getData: function () {
        return this._data;
    },

    showData: function (data, animation, callback, color) {
        this._data = data;
        if (data) {
            var myName = data.you.name;
            var oppName = data.opp.name;
            var time = this._time = data.remainTime;
            this._lblName1.setString(oppName);
            this._lblName2.setString(myName);
            this._lblRemainTime.setString(mc.view_utility.formatDurationTime(time * 1000))
            var scheduleCb = this._scheduleCb = function (count) {
                this._time -= 1;
                this._data.remainTime = this._time;
                this._lblRemainTime.setString(mc.view_utility.formatDurationTime(this._time * 1000));
                mc.log("-------time----- : " + this._time);
                if (this._time <= 0) {
                    mc.GameData.relicArenaManager.setWaitingVS(false);
                    if (scheduleCb) {
                        //this.unschedule(this._keyScheduleCb);
                        this.unscheduleAllCallbacks();
                    }
                    if (data.action === "pick_hero") {
                        var screen = bb.director.getCurrentScreen();
                        if (screen.getScreenId() === mc.GUIState.ID_SCREEN_MAIN) {

                            mc.protocol.pickHeroesInRelicArena(mc.GameData.relicArenaManager.getMatchInfo().requestId, function (result) {
                                if (this._dialogBeforePickHero) {
                                    this._dialogBeforePickHero.close();
                                    this._dialogBeforePickHero = null;
                                }
                                var layer = screen.pushLayerWithId(mc.MainScreen.LAYER_PICK_HERO_RELIC_ARENA);
                                layer.setData(result);
                            }.bind(this));
                        } else {
                            mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblWarning"), mc.dictionary.getGUIString("lblTheMatchCantStart"));
                        }

                    }
                    this.forceClose();
                }
            }.bind(this);
            if (!this._isShowing) {
                try {
                    //this.unschedule(this._keyScheduleCb);
                    this.unscheduleAllCallbacks();
                } catch (e) {

                }
                this.schedule(scheduleCb, 1.0, this._time - 1, this._keyScheduleCb);
                this.show(animation);
            }
            this.updateVisibleTime(this._time);
            if (!this._trackingKey) {
                this._trackingKey = this.traceDataChange(mc.GameData.relicArenaManager, function (result) {
                    if (result.isWaitingVS() && this._isShowing) {
                        try {
                            //this.unschedule(this._keyScheduleCb);
                            this.unscheduleAllCallbacks();
                        } catch (e) {

                        }
                        this._time = mc.const.TIME_BEFORE_PICK_HERO_COUNT_DOWN;
                        var screen = bb.director.getCurrentScreen();
                        if (screen.getScreenId() !== mc.GUIState.ID_SCREEN_MAIN) {
                            mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblWarning"), mc.dictionary.getGUIString("lblYouNeedBackScreenToJoinMatch"));
                        }
                        data["action"] = "pick_hero";
                        //var scheduleCb2 = function(){
                        //    time -= 1000;
                        //    this._lblRemainTime.setString(mc.view_utility.formatDurationTime(time));
                        //    this.forceClose();
                        //}.bind(this);
                        this.registerTouchEvent(function () {
                            var matchInfo = mc.GameData.relicArenaManager.getMatchInfo();
                            var dialog = this._dialogBeforePickHero = new mc.DialogVSBeforePickHero(matchInfo);
                            dialog.show();
                            callback && callback(data);
                        }.bind(this));
                        this.schedule(scheduleCb, 1.0, this._time - 1, this._keyScheduleCb);
                        this.updateVisibleTime(this._time);

                    }
                }.bind(this));
            }
            if (this._data && this._data["action"] && this._data["action"] === "pick_hero") {
                this.registerTouchEvent(function () {
                    var matchInfo = mc.GameData.relicArenaManager.getMatchInfo();
                    var dialog = this._dialogBeforePickHero = new mc.DialogVSBeforePickHero(matchInfo);
                    dialog.show();
                    callback && callback(data);
                }.bind(this));
            }

        }
        return this;
    },

    forceClose: function () {
        this._super();
        if (this._scheduleCb) {
            //this.unschedule(this._scheduleCb);
            //this.unscheduleAllCallbacks();
            this._scheduleCb = null;
        }
        this.unTraceDataChange(mc.GameData.relicArenaManager)
        this._trackingKey = null;
    },

    priorityView: function () {
        return 5;
    },


})
