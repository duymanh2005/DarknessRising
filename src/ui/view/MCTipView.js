/**
 * Created by long.nguyen on 7/19/2017.
 */
mc.TipView = cc.Node.extend({

    ctor: function (parseNode) {
        this._super();
        var root = null;
        parseNode.removeFromParent();
        this.addChild(parseNode);
        root = parseNode;

        this.x = parseNode.x;
        this.y = parseNode.y;
        this.anchorX = parseNode.anchorX;
        this.anchorY = parseNode.anchorY;
        this.width = parseNode.width;
        this.height = parseNode.height;

        parseNode.x = this.width * 0.5;
        parseNode.y = this.height * 0.5;

        var lbl = root.getChildByName("clipPanel").getChildByName("lbl");
        if(mc.enableReplaceFontBM())
        {
            lbl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl);
        }
        var cloneTips = cc.copyArray(mc.dictionary.getGUIString("arrGameTips"));

        var width = this.width - 50;
        var xBegin = lbl.x;
        var yBegin = lbl.y;
        var show = false;
        var _showTip = function () {
            show = true;
            lbl.opacity = 0;
            lbl.x = xBegin;
            lbl.anchorX = 0;
            lbl.y = yBegin;
            if (cloneTips.length === 0) {
                cloneTips = cc.copyArray(mc.dictionary.getGUIString("arrGameTips"));
            }
            var str = bb.utility.randomElement(cloneTips);
            cc.arrayRemoveObject(cloneTips, str);
            lbl.setString(str);
            if (lbl.width > width - 20) {
                lbl.runAction(cc.sequence([cc.fadeIn(1.0),
                    cc.delayTime(2.0),
                    cc.moveTo(lbl.getString().length * 0.5, cc.p(-lbl.width, yBegin)), cc.callFunc(function () {
                        show = false;
                    })]));
            }
            else {
                lbl.anchorX = 0.5;
                lbl.x = width * 0.5;
                lbl.runAction(cc.sequence([cc.fadeIn(1.0),
                    cc.delayTime(5.0),
                    cc.callFunc(function () {
                        show = false;
                    })]));
            }
        }.bind(this);

        this.scheduleUpdate();
        this.update = function (dt) {
            if (!show) {
                _showTip();
            }
        };
        var _updateLanguage = function () {
            cloneTips.length = 0;
            _showTip();
        };
        this._settingChangerTrack = bb.director.trackGlueObject(mc.storage.settingChanger, function (data) {
            mc.storage.settingChanger.performChanging({
                "language": function (oldLan, newLan) {
                    _updateLanguage();
                }
            }, true);
        });

    },

    onExit: function () {
        this._super();
        this._settingChangerTrack && bb.director.unTrackGlueObject(this._settingChangerTrack);
    }


});

mc.BannerView = cc.Node.extend({
    ctor: function (y, text, loop, speed,strParam) {
        this._super();
        var root = ccs.load(res.widget_Banner_notify_mine, "res/").node;
        this.addChild(root);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var string = mc.dictionary.getI18nMsg(text);
        //if(strParam && strParam.length === 2)
        //{
        //    string = cc.formatStr( mc.dictionary.getI18nMsg(text),strParam[0],strParam[1]);
        //}
        string = bb.utility.formatStringWithParams(string,strParam);
        //var string = cc.formatStr( mc.dictionary.getI18nMsg(text),str) ;// mc.dictionary.getI18nMsg(text);
        this.string = string;
        this.yPos = y;
        this.loop = loop || 1;

        var icon = this.icon = rootMap["icon"];
        var richText = new ccui.RichText()
        var spineFairy = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json, res.spine_ui_story_teller_atlas, 1.0);
        spineFairy.scale = 0.1;
        spineFairy.setAnimation(0, "default", true);
        root.addChild(spineFairy);
        spineFairy.setPosition(icon.x, icon.y - icon.height * 0.8);
        icon.removeFromParent();

        var bg = this.bg = rootMap["bg"];
        bg.setScale9Enabled(true);
        var lbl = this.lbl = bg.getChildByName("lbl");
        if(mc.enableReplaceFontBM())
        {
            lbl = this.lbl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl);
        }
        lbl.setString(string);
        var lblWidth = lbl.width * lbl.getScaleX();
        bg.width = lblWidth + 150;
        this._speed = speed ? Math.abs(15 - speed) : 15;
        this.runNow();

    },

    runNow: function () {
        this.lbl.setString(this.string);
        var lblWidth = this.lbl.width * this.lbl.getScaleX();
        this.bg.width = lblWidth + 150;
        var xBegin = cc.winSize.width + this.icon.width;
        var duration = this._speed * (Math.max(1, this.bg.width / cc.winSize.width));
        this.runAction(cc.sequence(cc.sequence(cc.place(xBegin, this.yPos),
            cc.moveBy(duration, -(cc.winSize.width + this.bg.width * 1.5), 0)).repeat(this.loop), cc.delayTime(0.5), cc.callFunc(function () {
            this.nextMsg();
        }, this)));

    },
    nextMsg: function () {
        var popSysMessage = mc.GameData.notifySystem.popSysMessage();
        if (popSysMessage) {
            this.string = popSysMessage["content"] || popSysMessage["message"];
            this.runNow();
        } else {
            this.removeFromParent(true);
        }
    }

});

mc.ServerInfoBannerView = cc.Node.extend({
    ctor: function (y, string, loop, speed) {
        this._super();
        var root = ccs.load(res.widget_Banner_notify_mine, "res/").node;
        this.addChild(root);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        this.string = string;
        this.yPos = y;
        this.loop = loop || 1;

        var icon = this.icon = rootMap["icon"];

        var spineFairy = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json, res.spine_ui_story_teller_atlas, 1.0);
        spineFairy.scale = 0.1;
        spineFairy.setAnimation(0, "default", true);
        root.addChild(spineFairy);
        spineFairy.setPosition(icon.x, icon.y - icon.height * 0.8);
        icon.removeFromParent();

        var bg = this.bg = rootMap["bg"];
        bg.setScale9Enabled(true);
        var lbl = this.lbl = bg.getChildByName("lbl");
        if(mc.enableReplaceFontBM())
        {
            lbl = this.lbl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl);
        }
        lbl.setString(string);
        var lblWidth = lbl.width * lbl.getScaleX();
        bg.width = lblWidth + 150;
        this._speed = speed ? Math.abs(15 - speed) : 15;
        this.runNow();

    },

    runNow: function () {
        this.lbl.setString(this.string);
        var lblWidth = this.lbl.width * this.lbl.getScaleX();
        this.bg.width = lblWidth + 150;
        var xBegin = cc.winSize.width + this.icon.width;
        var duration = this._speed * (Math.max(1, this.bg.width / cc.winSize.width));
        this.runAction(cc.sequence(cc.sequence(cc.place(xBegin, this.yPos),
            cc.moveBy(duration, -(cc.winSize.width + this.bg.width * 1.5), 0)).repeat(this.loop), cc.delayTime(0.5), cc.callFunc(function () {
            this.removeFromParent(true);
        }, this)));

    }

});