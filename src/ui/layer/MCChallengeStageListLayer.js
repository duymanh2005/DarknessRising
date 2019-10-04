/**
 * Created by long.nguyen on 4/6/2018.
 */
mc.ChallengeStageListLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);

        var groupIndex = mc.GameData.guiState.getCurrentChallengeGroupIndex();
        var allChallengeGroup = mc.GameData.challengeManager.getAllChallengeGroup();
        var challengeGroup = allChallengeGroup[groupIndex];

        var numChance = this._numChance = challengeGroup["chance"];
        var isOpen = challengeGroup["isOpen"];
        var endSeconds = challengeGroup["endSeconds"];
        var waitSeconds = challengeGroup["waitSeconds"];

        var arrChallengeStage = mc.dictionary.getArrChallengeStageByGroupIndex(groupIndex);
        var challengeStage = arrChallengeStage[0];

        var eventName = challengeStage["eventName"];

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
        var cell = this._cellEventStage = rootMap["cell"];
        cell.setVisible(false);

        btnAdd.registerTouchEvent(this.onBuyMoreChance.bind(this));

        lblRemainingBattle.setString(mc.dictionary.getGUIString("lblBattleChance"));

        var _startRefreshIfAny = function(numChance){
            lblRefreshIn.setVisible(true);
            lblRefreshIn.stopAllActions();
            if (numChance <= 0) {
                lblRefreshIn.setString(mc.dictionary.getGUIString("*****"));
                lblRefreshIn.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function (lbl) {
                    var actualTime = new Date(bb.now());

                    var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);

                    var timeRemaining = endOfDay.getTime() - actualTime.getTime();

                    this.setString(mc.dictionary.getGUIString("lblRefillIn")+"\n" + mc.view_utility.formatDurationTime(timeRemaining));
                }.bind(lblRefreshIn))]).repeatForever());
            }
            else {
                lblRefreshIn.setVisible(false);
            }
        };

        _startRefreshIfAny(numChance);
        btnAdd.setVisible(numChance <= 0);

        var vipValue = mc.dictionary.getVipFunctionValue(mc.const.VIP_FUNCTION_CHALLENGE_MAX_CHANCE);
        vipValue = vipValue || 0;
        var totalChance = mc.GameData.playerInfo.isVIP() ? parseInt(vipValue) : mc.const.MAX_CHALLENGE_CHANCE;
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
        var lblTitle = brkTitle.setString(eventName, res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Hero_Info.png", ccui.Widget.LOCAL_TEXTURE));

        var arrItems = [];

        var scrollToItem = null;
        var unlockIndex = 0;
        for (var i = 0; i < arrChallengeStage.length; i++) {
            var item = this._createStage(arrChallengeStage[i], i);
            if( item._unlockIndex && item._unlockIndex >= unlockIndex ){
                unlockIndex = item._unlockIndex;
                scrollToItem = item;
            }
            this._list.pushBackCustomItem(item);
            arrItems.push(item);
        }
        this._list.doLayout();
        scrollToItem && bb.utility.scrollTo(this._list,scrollToItem.y-this._list.height*0.5,0.2);

        this.traceDataChange(mc.GameData.challengeManager, function () {
            var swords = layoutSwords.getChildren();
            var groupIndex = mc.GameData.guiState.getCurrentChallengeGroupIndex();
            var allChallengeGroup = mc.GameData.challengeManager.getAllChallengeGroup();
            var challengeGroup = allChallengeGroup[groupIndex];

            var numChance = this._numChance = challengeGroup["chance"];
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
        mc.view_utility.showBuyingFunctionIfAny(mc.const["EXCHANGE_FUNC_DAILY_CHALLENGER_" + mc.GameData.guiState.getCurrentChallengeGroupIndex()]);
    },

    _createStage: function (challengeStageDict, index) {

        var arrReward = mc.ItemStock.createArrJsonItemFromStr(challengeStageDict["reward"]);
        var requireLevel = challengeStageDict["reqLevel"];
        var stageIndex = challengeStageDict["index"];

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
            var itemView = new mc.ItemView(mc.ItemStock.createJsonItemInfo(itemInfo["index"], itemInfo["no"] * xBonux, itemInfo["index"]));
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
        }
        else {
            if (this._numChance <= 0) {
                btnBattle.setGrayForAll(true);
            }
            cell._unlockIndex = index;
        }

        btnBattle.registerTouchEvent(function () {
            new mc.DialogSelectBattleHeroNoral(stageIndex).show();
        }.bind(this));
        return cell;
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_CHALLENGE_STAGE_LIST);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._list.getChildren()[0]._btnBattle)
                    .setScaleHole(1.5)
                    .setCharPositionY(cc.winSize.height*0.4)
                    .show();
            }
        }
    },

    onLayerShow: function () {
        var arrStackDialogData = mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN);
        if (arrStackDialogData.length > 0) {
            for (var i = 0; i < arrStackDialogData.length; i++) {
                var dialogData = arrStackDialogData[i];
                if (dialogData.id === mc.GUIState.ID_DIALOG_SELECT_BATTLE_HERO_NORMAL) {
                    new mc.DialogSelectBattleHeroNoral(dialogData.data).show(function (dialog) {
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
            if (dialog instanceof mc.DialogSelectBattleHeroNoral) {
                mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_SELECT_BATTLE_HERO_NORMAL,
                    mc.GameData.guiState.getCurrentChallengeStageIndex());
            }
        }
    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST;
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