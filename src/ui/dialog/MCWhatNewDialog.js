/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.WhatNewDialog = bb.Dialog.extend({

    ctor: function () {
        this._super();
        bb.framework.addSpriteFrames(res.text_plist);
        bb.framework.addSpriteFrames(res.icon_plist);
        bb.framework.addSpriteFrames(res.patch9_2_plist);
        var node = ccs.load(res.widget_what_news_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var msg_bg = rootMap["msg_bg"];
        var brk = rootMap["brk"];
        brk.setOpacity(0);
        brk.setCascadeOpacityEnabled(true);
        var btnClose = brk.getChildByName("btnClose");
        btnClose.setOpacity(0);
        btnClose.setString(mc.dictionary.getGUIString("lblClose"));
        var title = brk.getChildByName("lblDialogTitle");
        title.setString(mc.dictionary.getGUIString("lblWhatNew"));
        title.setColor(mc.color.YELLOW_ELEMENT);
        this.title = brk.getChildByName("title");
        this.content = brk.getChildByName("content");
        this._pnlView = brk.getChildByName("pnlView");
        var list_view = this.listView = brk.getChildByName("list_view");
        //list_view.setOpacity(0);
        //list_view.setCascadeOpacityEnabled(true);
        this.listView.setGravity(ccui.ListView.GRAVITY_LEFT);
        var node_fairy = rootMap["fairy"];
        this.loadFairyAnimate = function () {
            var spineFairy = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json, res.spine_ui_story_teller_atlas, 1.0);
            spineFairy.scale = 0.2;
            spineFairy.setAnimation(0, "default", true);
            spineFairy.setVisible(false);
            root.addChild(spineFairy);
            spineFairy.setPosition(root.width * 1.3, root.height * 0.5);
            spineFairy.runAction(cc.sequence(cc.delayTime(0.2), cc.show(), cc.moveTo(0.5, node_fairy.getPosition().x, node_fairy.getPosition().y).easing(cc.easeBackOut()), cc.callFunc(function () {
                brk.runAction(cc.sequence(cc.delayTime(0.2), cc.scaleTo(0.3, 1).easing(cc.easeBackOut()), cc.callFunc(function () {
                    brk.setVisible(true);
                    brk.runAction(cc.fadeIn(0.3));
                    btnClose.setVisible(true);
                    btnClose.runAction(cc.fadeIn(0.3));
                }, this)));
            }, this)));
        };
        this.loadFairyAnimate();

        btnClose.registerTouchEvent(function () {
            mc.storage.lastVersion = mc.const.VERSION;
            mc.storage.saveLastVersion();
            //mc.storage.saveLastVersion(1);
            this.close();
        }.bind(this));

        var data = mc.dictionary.news;


        var lan = mc.storage.readSetting()["language"];
        var creditContent = data[lan !== "vi" ? "en" : "vi"];

        for (var i in creditContent) {
            var ob = creditContent[i];
            this.addHeader(ob["header"]);
            this.addContent(ob["content"]);
            this.addSeperator();
        }

        //try{
        //    this._spine_node = new cc.Node();
        //    this._pnlView.runAction(cc.sequence(cc.delayTime(1.5),cc.callFunc(function(){
        //        //try
        //        //{
        //            var bossMap ;
        //            bossMap = bb.utility.arrayToMap(mc.dictionary.guildBossData, function (child) {
        //                return child["stageIndex"];
        //            });
        //            var bossIndex = bossMap["100"]["bossIndex"];
        //            var _loadFunc = function () {
        //                var pos = cc.p(0, 0);
        //                var creatureView = this._bossView = mc.BattleViewFactory.createCreatureGUIByIndex(bossIndex);
        //                creatureView.setPosition(pos.x, pos.y);
        //                creatureView.scale = 0.4;
        //                creatureView.setDirection(mc.CreatureView.DIRECTION_LEFT);
        //                this._spine_node.addChild(creatureView, 10);
        //                //if (this._isBossRevive) {
        //                //    creatureView.x = creatureView.x - cc.winSize.width;
        //                //    creatureView.startComming();
        //                //}
        //                //else {
        //                creatureView.idle();
        //                //}
        //                //this._isBossRevive = false;
        //
        //
        //            }.bind(this);
        //
        //
        //            var assetData = mc.dictionary.getCreatureAssetByIndex(bossIndex);
        //            if (assetData) {
        //                var atlasStr = assetData.getSpineString();
        //                var arrRes = [
        //                    atlasStr + ".json", atlasStr + ".atlas"
        //                ];
        //                if (!cc.sys.isNative) {
        //                    cc.loader.load(arrRes, function () {
        //                    }, function () {
        //                        _loadFunc(arrRes);
        //                    });
        //                } else {
        //                    _loadFunc(arrRes);
        //                }
        //            }
        //            var view = this._pnlView.clone();
        //            //view.removeAllChildren();
        //            view.addChild(this._spine_node);
        //            this._spine_node.anchorX = 0.5;
        //            this._spine_node.anchorY = 0.5;
        //            this._spine_node.x = view.width/2;
        //            this._spine_node.y = view.height/2 - 60;
        //            //view.x += this.listView.width/2;
        //            this.listView.pushBackCustomItem(view);
        //        //}
        //        //catch(e)
        //        //{
        //        //
        //        //}
        //    }.bind(this))));
        //
        //}
        //catch(e)
        //{
        //
        //}


    },

    addButton: function (resource, title, func) {
        var button = new ccui.ImageView(resource, ccui.Widget.PLIST_TEXTURE);
        button.setScale9Enabled(true);
        button.width = 300;
        button.setAnchorPoint(0, 0.5);
        button.setString(title, res.font_UTMBienvenue_stroke_32_export_fnt, mc.const.FONT_SIZE_24);
        button.registerTouchEvent(func.bind(this));
        this.listView.pushBackCustomItem(button);
    },

    _clickOutSize: function () {
        this._super();
        mc.storage.lastVersion = mc.const.VERSION;
        mc.storage.saveLastVersion();
        //mc.storage.saveLastVersion(1);
    },


    addHeader: function (header) {
        var lbl = this.title.clone();
        lbl.setVisible(true);
        lbl.setString(header);
        lbl.setColor(mc.color.YELLOW_SOFT);
        this.listView.pushBackCustomItem(lbl);
    },
    addContent: function (content) {
        for (var i in content) {
            var lbl = this.content.clone();
            lbl.setMultiLineString(content[i], this.listView.width * (2 - lbl.getScaleX()), cc.TEXT_ALIGNMENT_LEFT);
            lbl.setColor(mc.color.BLACK_DISABLE_SOFT);
            lbl.setVisible(true);
            this.listView.pushBackCustomItem(lbl);
        }
    },
    addSeperator: function () {
        var lbl = this.title.clone();
        lbl.setString("     ");
        lbl.setVisible(true);
        this.listView.pushBackCustomItem(lbl);
    },


    overrideCloseAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    },
    overrideShowAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.setOpacity(0);
        this.runAction(cc.sequence([cc.fadeIn(0.3)]));
        return 0.3;
    }

});
