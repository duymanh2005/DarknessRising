/**
 * Created by long.nguyen on 5/25/2019.
 */
mc.BloodCastleStageListLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);
        //var numChance = this._numChance = mc.GameData.bloodCastleManager.getNumberOfChance();
        var numChance = this._numChance = mc.GameData.playerInfo.getBloodCastleTicket();

        var root = this._rootNode = this.parseCCStudio(parseNode || res.layer_event_stage_list);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var nodeBrk = rootMap["nodeBrk"];
        var lblRemainingBattle = rootMap["lblRemainingBattle"];
        var btnAdd = rootMap["btn_add"];
        var lblRefreshIn = rootMap["lblRefreshIn"];
        var lvlStage = this._list = rootMap["lvlStage"];
        var nodeSword = rootMap["nodeSword"];
        var shopButton = new ccui.ImageView("icon/shop_bloodstone.png", ccui.Widget.PLIST_TEXTURE);
        root.addChild(shopButton);
        shopButton.setPosition(brkTitle.x + 300, brkTitle.y);
        shopButton.registerTouchEvent(function () {
            mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_BLOOD);
        });

        var cell = this._cellEventStage = rootMap["cell"];
        cell.setVisible(false);

        btnAdd.registerTouchEvent(this.onBuyMoreChance.bind(this));

        if(mc.enableReplaceFontBM())
        {
            lblRemainingBattle = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRemainingBattle);
        }
        lblRemainingBattle.setString(mc.dictionary.getGUIString("lblBattleChance"));

        var _startRefreshIfAny = function (numChance) {
            lblRefreshIn.setVisible(true);
            lblRefreshIn.stopAllActions();
            if (numChance <= 0) {
                lblRefreshIn.setString(mc.dictionary.getGUIString("*****"));
                lblRefreshIn.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function (lbl) {
                    var actualTime = new Date(bb.now());

                    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);

                    var timeRemaining = endOfDay.getTime() - actualTime.getTime();

                    this.setString(mc.dictionary.getGUIString("lblRefillIn") + "\n" + mc.view_utility.formatDurationTime(timeRemaining));
                }.bind(lblRefreshIn))]).repeatForever());
            } else {
                lblRefreshIn.setVisible(false);
            }
        };

        _startRefreshIfAny(numChance);
        btnAdd.setVisible(numChance <= 0);

        var vipValue = mc.dictionary.getVipFunctionValue(mc.const.VIP_FUNCTION_BLOOD_CASTLE_MAX_CHANCE);
        vipValue = vipValue || 0;
        var totalChance = mc.GameData.playerInfo.isVIP() ? parseInt(vipValue) : mc.const.MAX_BLOOD_CASTLE_CHANCE;
        var layoutSwords = bb.layout.linear(bb.collection.createArray(totalChance, function (index) {
            var spr = new cc.Sprite("#icon/ico_battle.png");
            spr.swordIndex = index;
            if (index >= numChance) {
                spr.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            return spr;
        }), 5, bb.layout.LINEAR_HORIZONTAL);
        nodeSword.addChild(layoutSwords);

        brkTitle._maxLblWidth = brkTitle.width - 100;
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblBloodCastle"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Hero_Info.png", ccui.Widget.LOCAL_TEXTURE));

        cc.log("stage list by level");
        var arrItems = [];
        var arrBloodCastleLvl = [];
        for (var lvlIndex in mc.dictionary.mapBloodCastleStagesByLvl) {
            var arrStage = mc.dictionary.mapBloodCastleStagesByLvl[lvlIndex];

            var mapReward = {};
            for (var i = 0; i < arrStage.length; i++) {
                var stage = arrStage[i];
                var arrRewardInfo = mc.ItemStock.createArrJsonItemFromStr(stage["reward"]);
                for(var a = 0; a < arrRewardInfo.length; a++ ){
                    var rewardInfo = arrRewardInfo[a];
                    if( !mapReward[mc.ItemStock.getItemIndex(rewardInfo)] ){
                        mapReward[mc.ItemStock.getItemIndex(rewardInfo)] = mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(rewardInfo),0);
                    }
                    mapReward[mc.ItemStock.getItemIndex(rewardInfo)].no += mc.ItemStock.getItemQuantity(rewardInfo);
                }
            }
            arrBloodCastleLvl.push({
                index: arrStage[0]["index"],
                reqLevel: arrStage[0]["reqLevel"],
                rewards: bb.utility.mapToArray(mapReward)
            })
        }

        var scrollToItem = null;
        var unlockIndex = 0;
        for (var i = 0; i < arrBloodCastleLvl.length; i++) {
            var item = this._createStage(arrBloodCastleLvl[i], i);
            if (item._unlockIndex && item._unlockIndex >= unlockIndex) {
                unlockIndex = item._unlockIndex;
                scrollToItem = item;
            }
            this._list.pushBackCustomItem(item);
            arrItems.push(item);
        }
        this._list.doLayout();
        scrollToItem && bb.utility.scrollTo(this._list, scrollToItem.y - this._list.height * 0.5, 0.2);

        this.traceDataChange(mc.GameData.bloodCastleManager, function () {
            var swords = layoutSwords.getChildren();
            var numChance = this._numChance = mc.GameData.playerInfo.getBloodCastleTicket();
            for (var i in swords) {
                if (swords[i].swordIndex >= numChance) {
                    swords[i].setColor(mc.color.BLACK_DISABLE_SOFT);
                } else {
                    swords[i].setColor(mc.color.WHITE_NORMAL);
                }
            }
            for (var j in arrItems) {
                arrItems[j].trackFunc && arrItems[j].trackFunc();
            }
            _startRefreshIfAny(numChance);
            btnAdd.setVisible(numChance <= 0);
        }.bind(this));
    },

    onBuyMoreChance: function () {
        mc.view_utility.showBuyingFunctionIfAny(mc.const.FUNCTION_BLOOD_CASTLE);
    },

    _createStage: function (bloodCastleLvlDict, index) {

        var arrReward = bloodCastleLvlDict["rewards"];
        var requireLevel = bloodCastleLvlDict["reqLevel"];
        var bcLvl = bloodCastleLvlDict["index"];

        var cell = this._cellEventStage.clone();
        cell.setVisible(true);
        cell.setCascadeOpacityEnabled(true);
        cell.setCascadeColorEnabled(true);

        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });

        var icon = cellMap["icon"];
        var lblLevel = cellMap["lblLevel"];
        var btnBattle = cell._btnBattle = cellMap["btnBattle"];
        var lblRequire = cellMap["lblRequire"];

        if(mc.enableReplaceFontBM())
        {
            lblLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLevel);
            lblLevel.y += 5;
            lblRequire = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRequire);
            lblRequire.setFontSize(24);
            lblRequire.y -= 10;
        }
        lblLevel.setString(mc.dictionary.getGUIString("lblLevel") + " " + (index + 1));
        icon.loadTexture(index < 4 ? "icon/ico_boss_lv" + (index + 1) + ".png" : "icon/ico_boss_lv4.png", ccui.Widget.PLIST_TEXTURE);
        var lblBattle = btnBattle.setString(mc.dictionary.getGUIString("lblBattle"));
        lblRequire.setVisible(false);

        var isUnlock = mc.GameData.playerInfo.getLevel() >= requireLevel;

        var xBonux = mc.GameData.challengeManager.getChallengeXBonus();

        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
            var itemInfo = arrReward[index];
            var itemView = new mc.ItemView(mc.ItemStock.createJsonItemInfo(itemInfo["index"], itemInfo["no"] * xBonux));
            itemView.scale = 0.75;
            itemView.setBlack(!isUnlock);
            itemView.registerViewItemInfo();
            return itemView;
        }.bind(this)), 10);
        layoutReward = mc.view_utility.wrapWidget(layoutReward, 350, false, {
            top: 7,
            left: -10,
            bottom: 10,
            a1: -32,
            a2: -32
        });
        layoutReward.x = cell.width * 0.455;
        layoutReward.y = cell.height * 0.5;
        cell.addChild(layoutReward);

        cell.trackFunc = function () {
            isUnlock && btnBattle.setGrayForAll(this._numChance <= 0);
        }.bind(this);

        if (!isUnlock) {
            btnBattle.setGrayForAll(true);
            lblRequire.setVisible(true);
            lblBattle.setColor(mc.color.BLACK_DISABLE_SOFT);
            lblRequire.setColor(mc.color.RED);
            lblRequire.setString(cc.formatStr(mc.dictionary.getGUIString("lblRequireNumLevel"), requireLevel));
            cell.setColor(mc.color.BLACK_DISABLE_SOFT);
            layoutReward.setColor(mc.color.BLACK_DISABLE_SOFT);
        } else {
            if (this._numChance <= 0) {
                btnBattle.setGrayForAll(true);
            }
            cell._unlockIndex = index;
        }

        btnBattle.registerTouchEvent(function () {
            mc.GameData.guiState.setCurrentSelectBloodCastleLevel(bcLvl);
            new mc.SelectHeroBattleForBloodCastleDialog().show();
        }.bind(this));
        return cell;
    },

    onLayerShow: function () {
        var arrStackDialogData = mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN);
        if (arrStackDialogData.length > 0) {
            for (var i = 0; i < arrStackDialogData.length; i++) {
                var dialogData = arrStackDialogData[i];
                if (dialogData.id === mc.GUIState.ID_DIALOG_SELECT_BATTLE_HERO_NORMAL) {
                    new mc.SelectHeroBattleForBloodCastleDialog().show(function (dialog) {
                        dialog.opacity = 0;
                        dialog.runAction(cc.fadeIn(0.3));
                        return 0.3;
                    });
                }
            }
        }
    },

    onLayerClose: function () {
        var allDialog = bb.director.getAllDialog();
        for (var i = 0; i < allDialog.length; i++) {
            var dialog = allDialog[i];
            if (dialog instanceof mc.SelectHeroBattleForBloodCastleDialog) {
                mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_SELECT_BATTLE_HERO_NORMAL);
            }
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_BLOOD_CASTLE_STAGE_LIST;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return false;
    }

});