/**
 * Created by long.nguyen on 5/26/2017.
 */
mc.DialogDailyReward = bb.Dialog.extend({
    ctor: function (dailyGift) {
        this._super();
        new mc.ItemView(mc.ItemStock.createJsonItemZen(1)); // load the sprite frames.

        var node = ccs.load(res.widget_daily_reward, "res/").node;
        node.anchorX = 0.5;
        node.anchorY = 0.5;
        node.x = cc.winSize.width * 0.5;
        node.y = cc.winSize.height * 0.4;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        node.width = root.width;
        node.height = root.height;


        var self = this;
        var imgTitle = rootMap["imgTitle"];
        var bgr = rootMap["brk"];
        var ribbon = bgr.getChildByName("ribbon");
        var text = ribbon.getChildByName("text");
        var lan = mc.storage.readSetting()["language"] || "en";
        text.loadTexture("patch9/txt_" + lan + ".png", ccui.Widget.PLIST_TEXTURE);
        var btnClaim = rootMap["btnClaim"];
        var msg_bg = bgr.getChildByName("msg_bg");
        var lbl = bgr.getChildByName("lbl");
        var node_fairy = bgr.getChildByName("fairy");
        lbl.setMultiLineString(mc.dictionary.getGUIString("txtDailyGift"), msg_bg.width);
        lbl.setColor(mc.color.BROWN_SOFT);


        var spineFairy = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json, res.spine_ui_story_teller_atlas, 1.0);
        spineFairy.scale = 0.2;
        spineFairy.scaleX *= -1;
        spineFairy.setAnimation(0, "default", true);
        spineFairy.setVisible(false);
        bgr.addChild(spineFairy);
        lbl.setOpacity(0);
        msg_bg.setScale(0, 0);
        spineFairy.setPosition(-bgr.width * 0.3, bgr.height * 1.2);
        spineFairy.runAction(cc.sequence(cc.delayTime(0.5), cc.show(), cc.moveTo(0.5, node_fairy.getPosition().x, node_fairy.getPosition().y).easing(cc.easeBackOut()), cc.callFunc(function () {
            msg_bg.runAction(cc.sequence(cc.delayTime(0.3), cc.scaleTo(0.3, 1).easing(cc.easeBackOut()), cc.callFunc(function () {
                lbl.setVisible(true);
                lbl.runAction(cc.fadeIn(0.3));
            }, this)));
        }, this)));

        btnClaim.setString(mc.dictionary.getGUIString("lblClaim"));

        var arrNodeItem = [];
        var _createRewardContainer = function (index) {
            var container = new ccui.Widget();
            var node = new cc.Node();
            var brkDay = new ccui.ImageView("patch9/pnl_daily_small.png", ccui.Widget.PLIST_TEXTURE);
            var lbl = brkDay.setString(mc.dictionary.getGUIString("lblDay") + (index + 1), res.font_UTMBienvenue_none_32_export_fnt);
            lbl.scale = 0.65;
            lbl.y += 3;
            container.anchorX = container.anchorY = 0.5;
            container.width = brkDay.width;
            container.height = brkDay.height * 5;
            container.addChild(brkDay);
            container.addChild(node);
            brkDay.x = container.width * 0.5;
            brkDay.y = brkDay.height * 0.5;
            node.x = container.width * 0.5;
            node.y = container.height * 0.5;
            arrNodeItem.push(node);
            return container;
        };

        var layout1 = bb.layout.linear(bb.collection.createArray(4, function (index) {
            return _createRewardContainer(index);
        }), 20, bb.layout.LINEAR_HORIZONTAL);
        var layout2 = bb.layout.linear(bb.collection.createArray(3, function (index) {
            return _createRewardContainer(index + 4);
        }), 20, bb.layout.LINEAR_HORIZONTAL);

        layout1.x = layout2.x = bgr.width / 2;
        layout1.y = bgr.height * 0.7;
        layout2.y = bgr.height * 0.32;
        bgr.addChild(layout1);
        bgr.addChild(layout2);

        var arrReward = arrNodeItem;
        var _checkForWidget = function (widget, isCheck) {
            var check = widget.getParent().getChildByName("__check__" + widget.getName());
            if (!check) {
                check = new cc.Sprite("#icon/Check.png");
                check.setName("__check__" + widget.getName());
                check.x = widget.x;
                check.y = widget.y;
                widget.getParent().addChild(check);
            }
            check.setVisible(isCheck);
        };

        var giftList = dailyGift["giftList"];
        var claim = dailyGift["allowClaim"];
        var claimed = dailyGift["claimed"];
        var rewardGiftIndex = claim[0];

        var _popularReward = function (pack, nodeContainer, index) {
            nodeContainer.stopAllActions();
            var childByName = nodeContainer.getChildByName("itemFocus");
            if (childByName) {
                childByName.removeFromParent();
            }
            nodeContainer.setCascadeOpacityEnabled(true);
            nodeContainer.setCascadeColorEnabled(true);
            var claimed = pack.claimed;
            var claim = pack.claim;
            var itemView = new mc.ItemView(pack.item);
            itemView.scale = 0.9;
            itemView.registerViewItemInfo();
            nodeContainer.addChild(itemView, 1);
            _checkForWidget(nodeContainer, false);
            if (claimed) {
                itemView.setBlack(true);
                _checkForWidget(nodeContainer, true);
            }
            else if (!claim) {
                //
            }
            else {
                if (!nodeContainer.getChildByName("itemFocus")) {
                    var focus = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_focus_json, res.spine_ui_item_panel_focus_atlas, 1.0);
                    focus.setName("itemFocus");
                    focus.setPosition(nodeContainer.width / 2, nodeContainer.height / 2);
                    focus.setScale(0.9, 0.9);
                    nodeContainer.addChild(focus);
                }
                nodeContainer.getChildByName("itemFocus").setAnimation(0, "focus_idle", true);
                nodeContainer.getChildren()[0].registerTouchEvent(function () {
                    _getReward();
                });
            }
        };

        var _updateRewards = function (arrPack) {
            for (var i = 0; i < arrReward.length; i++) {
                _popularReward(arrPack[i], arrReward[i], i);
            }
            btnClaim.setColor(rewardGiftIndex >= 0 ?  cc.color.WHITE:mc.color.BLACK_DISABLE_SOFT);
            btnClaim.setEnabled(rewardGiftIndex >= 0);
        };

        var arrPack = [];
        for(var i = 0; i < giftList.length; i++ ){
            var itemPack = giftList[i];
            var giftString = itemPack["giftString"];
            var splitItem = giftString.split("/");
            var itemInfo = {index:splitItem[0], no:splitItem[1]};

            arrPack.push({item:itemInfo,
                claimed: (claimed.indexOf(i) >= 0),
                claim:(claim.indexOf(i) >= 0)});
        }
        _updateRewards(arrPack);

        //nhan thuong
        var _getReward = function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.claimGiftEvent(rewardGiftIndex, rewardGiftIndex, function () {
                mc.view_utility.hideLoadingDialogById(loadingId);
                self.close();
            });
        };

        btnClaim.registerTouchEvent(function () {
            _getReward();
        });

        bgr.setTouchEnabled(true);
        root.setTouchEnabled(false);
    }

});

mc.DialogDailyReward.FROM_QUEST = 1;
mc.DialogDailyReward.FROM_CAMPAIGN = 2;