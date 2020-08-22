mc.MCLevelUpEventDialog = bb.Dialog.extend({
    ctor: function (packData, product) {
        this._super();
        var node = ccs.load(res.widget_level_up_event_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        root.y = 110;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var msgBgLbl = rootMap["brk"].getChildByName("msg_bg");
        msgBgLbl.runAction(cc.sequence(cc.delayTime(0.8), cc.show()));
        var btnOk = rootMap["btnClaim"];
        var levelUpReward = mc.storage.getClaimedLevelUpReward();
        if (levelUpReward && levelUpReward["isEnableBonus"]) {
            btnOk.setGrayForAll(true);
        }

        var rewardsList = this.listView = rootMap["brk"].getChildByName("lvl");
        this.rewardCell = rootMap["brk"].getChildByName("cell");

        var lan = mc.storage.readSetting()["language"];
        if (product) {
            var lbl = new cc.LabelTTF(cc.formatStr("%s %s", product["price"], product["currencyCode"]), res.font_regular_ttf, 30);
            lbl.x = btnOk.width * 0.5;
            lbl.y = btnOk.height * 0.5;
            btnOk.addChild(lbl);
        }
        else {
            var buyCost = (lan === "vi" && packData["costVND"]) ? packData["costVND"] : packData["cost"];
            if (lan === "vi") {
                buyCost = bb.utility.formatNumber(buyCost) + " VND";
            } else {
                buyCost = buyCost + " USD";
            }
            btnOk.setString(buyCost, res.font_cam_stroke_48_export_fnt, mc.const.FONT_SIZE_24);
        }

        btnOk.registerTouchEvent(function () {
            if (!mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(packData))) {
                bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtPurchaseFailed"),
                    mc.dictionary.getGUIString("txtPurchaseFailedReasonCode")["-2"])).show();
                return;
            }
            this.buy(packData);

            mc.protocol.registerLevelUpEventBuySuccess( function () {
                btnOk.setGrayForAll(true);
                this.bindRewards(rewardsList, packData);
            }.bind(this));

        }.bind(this));

        this.bindRewards(rewardsList, packData);

        var node_fairy = rootMap["brk"].getChildByName("fairy");
        node_fairy.rotationX = 1;
        var lbl_fairy = rootMap["brk"].getChildByName("lbl");
        this.loadNoMailAnimate = function () {
            var spineFairy = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json, res.spine_ui_story_teller_atlas, 1.0);
            spineFairy.scale = 0.2;
            spineFairy.scaleX *= -1;
            spineFairy.setAnimation(0, "default", true);
            spineFairy.setVisible(false);
            root.addChild(spineFairy);
            spineFairy.setPosition(0, root.height);
            spineFairy.runAction(cc.sequence(cc.delayTime(0.5), cc.show(), cc.moveTo(0.5, (node_fairy.getPosition().x + 35), (node_fairy.getPosition().y + 120)).easing(cc.easeBackOut()), cc.callFunc(function () {
                msgBgLbl.runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(function () {
                    var msg = "Get #fc823c_100 Relic# instantly. You can get a total of #3D4FFF_18.000 Bless# after reaching a specified level. Unlock now!";
                    mc.GUIFactory.applyComplexString(lbl_fairy, bb.utility.stringBreakLines(msg, 15, 550), mc.color.BROWN_SOFT);
                    lbl_fairy.setVisible(true);
                    //lbl_fairy.runAction(cc.fadeIn(0.3));
                }, this)));
            }, this)));
        };

        this.loadNoMailAnimate();

    },

    bindRewards: function () {
        this.listView.setScrollBarEnabled && this.listView.setScrollBarEnabled(false);
        this.listView.removeAllChildren();
        this.listView.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList());
        for (var i = 0; i < 20; i++) {
            var row = this.rewardCell.clone();
            this.listView.pushBackCustomItem(row);

        }
        this.listView.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList());

        var index = 1;//(index=1) ignore item padding at index 0
        this.listView.schedule(function () {//for smooth show dialog
            var row = this.listView.getItem(index);
            var btnClaim = row.getChildByName("btn");
            var lblCountLvl = row.getChildByName("lblCount");
            lblCountLvl.setString("");
            var lblLevel = row.getChildByName("lblLevel");
            var pnlRewards = row.getChildByName("pnlRewards");
            lblLevel.setString("Reach Level " + (index * 10));
            var levelUpRewardBase = mc.dictionary.levelUpReward[index - 1];
            btnClaim.setString("Claim");
            btnClaim.setUserData(levelUpRewardBase["level"]);
            var isCanClaim = this._checkCanClaim(levelUpRewardBase, btnClaim);
            btnClaim.setGrayForAll(!isCanClaim);
            var self = this;
            if (isCanClaim) {
                btnClaim.registerTouchEvent(function () {
                    mc.protocol.claimLevelUpReward(btnClaim.getUserData(), function () {
                        btnClaim.setGrayForAll(true);
                        pnlRewards.removeChildByTag(999);
                        pnlRewards.addChild(self._createRewardRowView(levelUpRewardBase));
                    }.bind(this));
                }.bind(this));
            }
            pnlRewards.addChild(this._createRewardRowView(levelUpRewardBase));
            index++;
        }.bind(this), 0.02, 20 - 1);
    },

    _checkCanClaim: function (levelUpRewardBase, btnClaim) {
        var playerLevel = mc.GameData.playerInfo.getLevel();
        if (playerLevel >= levelUpRewardBase["level"]) {
            var levelUpReward = mc.storage.getClaimedLevelUpReward();
            var claimedIndex = levelUpReward['claimedMap'][levelUpRewardBase["level"]];
            if (claimedIndex == null)
                return true;

            if (claimedIndex < 0)
                return true;

            if (levelUpReward["isEnableBonus"]) {
                if (claimedIndex < 1)
                    return true;

                btnClaim.setString("Claimed");
                return false;
            }
        }

        return false;
    },

    _createRewardRowView: function (rewardInfo) {
        var arrReward = mc.ItemStock.createArrJsonItemFromStr(rewardInfo['rewardString']);
        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
            var itemView = new mc.ItemView(arrReward[index]);
            itemView.scale = 0.65;
            itemView.registerViewItemInfo();
            itemView.setSwallowTouches(false);

            var claimedLevelUpReward = mc.storage.getClaimedLevelUpReward();
            if (index == 1 && !claimedLevelUpReward['isEnableBonus']) {
                var iconLock = new cc.Sprite("#icon/ico_lock.png");
                iconLock.scale = 0.5;
                iconLock.x = itemView.width / 2;
                iconLock.y = itemView.height / 2;
                itemView.setBlack(true);
                itemView.addChild(iconLock);
            }

            var level = rewardInfo['level'];
            var claimedIndex = claimedLevelUpReward['claimedMap'][level];
            if(claimedIndex != null && claimedIndex >= index){
                var lbl = new cc.LabelTTF("Claimed", res.font_regular_ttf, 30);
                lbl.x = itemView.width * 0.5;
                lbl.y = itemView.width * 0.5;
                    itemView.setBlack(true);
                itemView.addChild(lbl);
            }

            return itemView;
        }), 10);

        var wrapWidget = mc.view_utility.wrapWidget(layoutReward, 425, false, {
            top: 7,
            left: 5,
            bottom: 10,
            a1: -32,
            a2: -32
        });

        wrapWidget.x = wrapWidget.width / 2;
        wrapWidget.y = wrapWidget.height / 2;
        wrapWidget.setTag(999);
        return wrapWidget;
    },

    buy: function (packData) {
        var self = this;
        mc.view_utility.purchaseInAppItem(packData, function () {
            if (!mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(packData))) {
                self.close();
            }
        });
    }

});
mc.MCLevelUpEventDialog.showIAPItem = function (inappDict) {
    mc.view_utility.requestIAPItems(function (arrProducts) {
        var product = null;
        if (arrProducts && arrProducts.length > 0) {
            product = bb.collection.findBy(arrProducts, function (product, inappDict) {
                var ids = inappDict["id"].split(['.']);
                return product["name"] === ids[ids.length - 1];
            }, inappDict);
        }
        new mc.MCLevelUpEventDialog(inappDict, product).show();
    });
};