/**
 * Created by long.nguyen on 10/19/2017.
 */
mc.ChaosCastleScreen = mc.Screen.extend({

    getPreLoadURL: function () {
        return mc.resource.getChaosCastlePreLoadURLs();
    },

    initResources: function () {
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_CHAOSCASTLE);
        bb.framework.addSpriteFrames(res.sprite_plist);

        var node = this._screen = mc.loadGUI(res.screen_chaos_castle_json);
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(node.getChildByName("root").getChildren(), function (child) {
            return child.getName();
        });
        var scroll = this._scroll = rootMap["scroll"];
        var btnRestart = this._btnRestart = rootMap["btnRestart"];
        var btnBack = rootMap["btnBack"];
        var slotMoney = rootMap["slotMoney"];
        var slotBless = rootMap["slotBless"];
        var slotFriend = rootMap["slotFriend"];
        var btnRedeem = rootMap["btnRedeem"];
        this.lblTimeRemain = rootMap["lblTimeRemain"];
        this.lblTimeRemain.setVisible(false);
        var lblRedeem = btnRedeem.setString(mc.dictionary.getGUIString("lblRedeem"));
        lblRedeem.x = btnRedeem.width * 0.6;
        lblRedeem.y = btnRedeem.height * 0.55;
        lblRedeem.setScale(0.75);
        var nodeBrk = this._nodeBrk = scroll.getChildByName("nodeBrk");
        var lblChanceLeft = rootMap["lblChanceLeft"];

        var lblRestart = this.lblRestart = btnRestart.setString(mc.dictionary.getGUIString("lblRestart"));
        lblChanceLeft.setString(mc.dictionary.getGUIString("lblChaosTicket"));
        var spineMap = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_bg_chaoscastle_json, res.spine_ui_bg_chaoscastle_atlas, 1.0);
        this._nodeBrk.addChild(spineMap);
        spineMap.setAnimation(0, "idle", true);

        var lblTicket = this._lblNumTicket = lblChanceLeft.setDecoratorLabel("0", mc.color.YELLOW);

        btnRestart.registerTouchEvent(function () {
            if (chaosCastleManager.getTicketNo() <= 0) {
                mc.view_utility.showBuyingFunctionIfAny(mc.const.EXCHANGE_FUNC_CHAOS_TICKET);
            } else {
                if(mc.GameData.chaosCastleManager.hasClaimAbleChest()){
                    bb.framework.getGUIFactory().createWarningDialog(mc.dictionary.getGUIString("lblHasChestChaosNeedOpen")).show();
                }else{
                    mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtConfirmRestartChaosCastle"), function () {
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.restartChaosCastle(function (result) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            if (result) {
                                this._loadData();
                                var arrNewComingItem = mc.GameData.itemStock.popArrayNewComingItem();
                                if (arrNewComingItem) {
                                    mc.view_utility.showNewComingItem(arrNewComingItem);
                                }
                            }
                        }.bind(this));
                    }.bind(this));
                }
            }
        }.bind(this));
        btnRedeem.registerTouchEvent(function () {
            mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_CHAOS);
        });
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        var btnTierHero = new ccui.ImageView("button/btn_tutorial.png", ccui.Widget.PLIST_TEXTURE);

        btnTierHero.x = slotFriend.x + slotFriend.width*0.5  ;
        btnTierHero.y = slotFriend.y - slotFriend.height;
        btnTierHero.registerTouchEvent(function () {
            //mc.GameData.guiState.setCurrTierHeroesMode(mc.TierHeroStockScreen.VIEW_MODE.CHAOS);
            //mc.GUIFactory.showTierHeroesScreen();
            var dialog = new mc.ChaosRulesDialog();
            dialog.show();
        }.bind(this));
        root.addChild(btnTierHero);
        btnTierHero.anchorX = 1;
        btnTierHero.anchorY = 1;

        var chaosCastleManager = mc.GameData.chaosCastleManager;
        if (chaosCastleManager.isChange()) {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.joinChaosCastle(function () {
                mc.view_utility.hideLoadingDialogById(loadingId);
                this._loadData();
            }.bind(this));
        }
        else {
            this._loadData();
        }

        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, slotFriend, btnBack, mc.const.ITEM_INDEX_CHAOS_COINS);

        this.traceDataChange(mc.GameData.connectionState, function () {
            if (mc.GameData.connectionState.isOpened()) {
                if (mc.GameData.chaosCastleManager.isChange()) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.joinChaosCastle(function () {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        this._loadData();
                    }.bind(this));
                }
            }
        }.bind(this));

        var _animateChanger = function () {
            var ticket = mc.GameData.playerInfo.getChaosTicket();
            lblTicket && lblTicket.setString(ticket);
            var refreshFunctionPriceByCode = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionPriceByCode(mc.const.EXCHANGE_FUNC_CHAOS_TICKET);
            if (ticket > 0) {
                lblRestart.setString(mc.dictionary.getGUIString("lblRestart"));
            } else if (refreshFunctionPriceByCode) {
                lblRestart.setString(mc.dictionary.getGUIString("lblBuy"));
            } else {
                lblRestart.setString(mc.dictionary.getGUIString("lblBuy"));
            }
        }.bind(this);

        this.traceDataChange(mc.GameData.itemStock, function () {
            _animateChanger();
        }.bind(this));
        _animateChanger();
    },

    onScreenShow: function () {
        var arrStackDialogData = mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_CHAOSCASTLE);
        if (arrStackDialogData.length > 0) {
            for (var i = 0; i < arrStackDialogData.length; i++) {
                var dialogData = arrStackDialogData[i];
                if (dialogData.id === mc.GUIState.ID_DIALOG_VS) {
                    this._showDialogVS(dialogData.data);
                }
                else if (dialogData.id === mc.GUIState.ID_DIALOG_CHAOS_RULES) {
                    var dialog = new mc.ChaosRulesDialog();
                    dialog.srollToBottom();
                    dialog.show();
                }
            }
        }
    },

    onScreenClose: function () {
        var allDialog = bb.director.getAllDialog();
        for (var i = 0; i < allDialog.length; i++) {
            var dialog = allDialog[i];
            if (dialog instanceof mc.DialogVS) {
                mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_CHAOSCASTLE, mc.GUIState.ID_DIALOG_VS,
                    mc.GameData.guiState.getCurrentChaosCastleStageIndex());
            }
            else if(dialog instanceof mc.ChaosRulesDialog)
            {
                mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_CHAOSCASTLE, mc.GUIState.ID_DIALOG_CHAOS_RULES,
                    mc.GameData.guiState.getCurrentChaosCastleStageIndex());
            }

        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_CHAOS);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_SPINE) {
                var widget = this._arrHeroView[0].getChildByName("__clickable_widget__");
                if (widget) {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(widget)
                        .setScaleHole(1.5)
                        .setCharPositionY(cc.winSize.height * 0.4)
                        .show();
                }
            }
        }
    },

    _showDialogVS: function (stageIndex, getFromCache) {
        mc.GameData.guiState.setCurrentChaosCastleStageIndex(stageIndex);
        var chaosCastleManager = mc.GameData.chaosCastleManager;
        var chaosCastleStage = chaosCastleManager.getChaosCastleStageByIndex(stageIndex);
        var opponentFormation = chaosCastleManager.getOpponentFormationByStageIndex(stageIndex);
        if (opponentFormation) {
            var oppName = mc.ChaosCastleManager.getOpponentFormationChaosStageName(chaosCastleStage);
            var oppPower = mc.ChaosCastleManager.getOpponentFormationChaosStagePower(opponentFormation);
            var oppLeague = mc.ChaosCastleManager.getOpponentFormationChaosStageLeague(opponentFormation);
            var mapHeroes = bb.utility.arrayToMap(mc.ChaosCastleManager.getOpponentFormationChaosStageArrayHero(opponentFormation), function (heroInfo) {
                var id = mc.HeroStock.getHeroId(heroInfo);
                return id;
            });

            var teamFormation = mc.ChaosCastleManager.getOpponentFormationChaosStageTeam(opponentFormation);
            var leaderIndex = mc.ChaosCastleManager.getOpponentFormationChaosStageLeaderIndex(opponentFormation);
            var dialogVS = new mc.DialogVS(oppName, oppPower, oppLeague, mapHeroes, teamFormation, leaderIndex, chaosCastleManager);
            if (mc.ChaosCastleManager.isUnlockChaosCastleStage(chaosCastleStage) &&
                !mc.ChaosCastleManager.isWinChaosCastleStage(chaosCastleStage)) {
                dialogVS.setStartCallback(function () {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.startBattleChaosCastle(stageIndex, function (data, err) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (data) {
                            mc.GUIFactory.showChaosCastleBattleScreen();
                        }
                    }.bind(this));
                });
            }
            dialogVS.show();
        }
        else {
            if (!getFromCache) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.viewChaosCastleStage(stageIndex, function () {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    this._showDialogVS(stageIndex, true);
                }.bind(this));
            }
        }

    },

    _loadChaosHero: function (chaosCastleStage, x, y) {
        var opponentHeroIndex = mc.HeroStock.getHeroIndex(mc.ChaosCastleManager.getChaosCastleStageLeaderHero(chaosCastleStage));
        var opponentView = mc.BattleViewFactory.createCreatureGUIByIndex(opponentHeroIndex);
        opponentView.x = x;
        opponentView.y = y;
        opponentView.scale = 0.95;
        opponentView.setClickAble(true, function () {
            this._showDialogVS(mc.ChaosCastleManager.getChaosCastleStageIndex(chaosCastleStage));
        }.bind(this));

        var blackBrk = new ccui.ImageView("patch9/gradian_black.png", ccui.Widget.PLIST_TEXTURE);
        blackBrk.setScale9Enabled(true);
        blackBrk.setCascadeOpacityEnabled(true);
        blackBrk.height = 40;
        blackBrk.width = 500;
        blackBrk.y = -15;

        var lblName = new cc.LabelTTF(mc.ChaosCastleManager.getOpponentFormationChaosStageName(chaosCastleStage), res.font_regular_ttf, 32);
        blackBrk.addChild(lblName);
        lblName.setPosition(blackBrk.width / 2, blackBrk.height / 2);
        opponentView.addChild(blackBrk);
        this._scroll.addChild(opponentView);
        this._arrHeroView.push(opponentView);
        return opponentView;
    },

    _registerTouchTreasureBox: function (treasureBox) {
        var screen = this;
        var chaosCastleManager = mc.GameData.chaosCastleManager;
        var clickLayout = treasureBox.getChildByName("__click__box__");
        if (!clickLayout) {
            clickLayout = new ccui.Layout();
            //clickLayout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            clickLayout.setName("__click__box__");
            clickLayout.width = 125;
            clickLayout.height = 125;
            clickLayout.x = clickLayout.width * -0.5;
            treasureBox.addChild(clickLayout);
        }
        clickLayout.setEnabled(true);
        clickLayout.setUserData(treasureBox.getUserData());
        clickLayout.registerTouchEvent(function (widget) {
            var chaosCastleStage = widget.getUserData();
            var isClaimed = mc.ChaosCastleManager.canChaosCastleStageClaimReward(chaosCastleStage);
            var isWin = mc.ChaosCastleManager.isWinChaosCastleStage(chaosCastleStage);
            if (isWin && !isClaimed) {
                var loadingDialogId = mc.view_utility.showLoadingDialog();
                mc.protocol.claimRewardChaosCastle(mc.ChaosCastleManager.getChaosCastleStageIndex(chaosCastleStage), function (data, error) {
                    mc.view_utility.hideLoadingDialogById(loadingDialogId);
                    if (data["reward"]) {
                        var items = data["reward"]["items"];
                        var arrNewItem = mc.GameData.itemStock.popArrayNewComingItem();
                        mc.ReceiveItemDialog.openTreasureBox(widget.getParent(), screen, arrNewItem);
                    }
                    widget.setEnabled(false);
                });
            }
            else {
                new mc.RewardListDialog(mc.ChaosCastleManager.getChaosCastleStageArrayReward(chaosCastleStage)).show();
            }
        }.bind(this));
        clickLayout.setSwallowTouches(false);
    },

    _registerTouchChaosStone: function (chaosStone) {
        var clickLayout = chaosStone.getChildByName("__click__box__");
        if (!clickLayout) {
            clickLayout = new ccui.Layout();
            //clickLayout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            clickLayout.setName("__click__box__");
            clickLayout.width = 305;
            clickLayout.height = 305;
            clickLayout.x = clickLayout.width * -0.5;
            chaosStone.addChild(clickLayout);
        }
        clickLayout.registerTouchEvent(function () {

        });
        clickLayout.setSwallowTouches(false);
    },

    _loadData: function () {

        if (this._arrFLagView) {
            for (var i = 0; i < this._arrFLagView.length; i++) {
                this._arrFLagView[i].removeFromParent();
            }
        }
        if (this._arrHeroView) {
            for (var i = 0; i < this._arrHeroView.length; i++) {
                this._arrHeroView[i].removeFromParent();
            }
        }
        if (this._arrTreasureBoxView) {
            for (var i = 0; i < this._arrTreasureBoxView.length; i++) {
                this._arrTreasureBoxView[i].removeFromParent();
            }
        }

        var screen = this;
        var playerInfo = mc.GameData.playerInfo;
        var chaosCastleManager = mc.GameData.chaosCastleManager;
        var currChaosStageIndex = chaosCastleManager.getCurrentChaosStageIndex();
        var nodePositionMap = bb.utility.arrayToMap(this._scroll.getChildren(), function (child) {
            return child.getName();
        });

        this._lblNumTicket.setString("" + chaosCastleManager.getTicketNo());

        if (chaosCastleManager.getTicketNo() <= 0) {
            this.lblTimeRemain.setVisible(true);
            this.lblTimeRemain.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function (lbl) {
                var actualTime = new Date(bb.now());

                var endOfDay = new Date(actualTime.getFullYear(), actualTime.getMonth(), actualTime.getDate() + 1, 0, 0, 0);

                var timeRemaining = endOfDay.getTime() - actualTime.getTime();

                this.setString(mc.dictionary.getGUIString("lblRefillIn") + mc.view_utility.formatDurationTime(timeRemaining));
            }.bind(this.lblTimeRemain))]).repeatForever());
        } else {
            this.lblTimeRemain.setVisible(false);
            this.lblTimeRemain.stopAllActions();
        }

        var refreshFunctionPriceByCode = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionPriceByCode(mc.const.EXCHANGE_FUNC_CHAOS_TICKET);
        this._btnRestart.setGray(!(refreshFunctionPriceByCode || chaosCastleManager.getTicketNo() > 0));

        if (chaosCastleManager.getTicketNo() > 0) {
            this.lblRestart.setString(mc.dictionary.getGUIString("lblRestart"));
        } else if (refreshFunctionPriceByCode) {
            this.lblRestart.setString(mc.dictionary.getGUIString("lblBuy"));
        } else {
            this.lblRestart.setString(mc.dictionary.getGUIString("lblBuy"));
        }

        this._arrFLagView = [];
        this._arrTreasureBoxView = [];
        this._arrHeroView = [];
        var numTotalNode = 20;
        var arrChestName = mc.ChaosCastleScreen.ARRAY_TREASUREBOX_SKIN;
        var indexStage = 0;
        var indexChest = 0;
        var focusView = null;
        var allChaosCastleStage = mc.GameData.chaosCastleManager.getAllChaosCastleStage();
        for (var childName in nodePositionMap) {
            var childNode = nodePositionMap[childName];
            var strs = childName.split('_');
            if (strs[0] === "node") {
                var indexNode = parseInt(strs[1]);
                var x = childNode.x;
                var y = childNode.y;
                if (indexNode % 2 === 0) {
                    var chaosCastleStage = allChaosCastleStage[indexStage];
                    if (!mc.ChaosCastleManager.isWinChaosCastleStage(chaosCastleStage)) {
                        var opponentView = this._loadChaosHero(chaosCastleStage, x, y);
                        opponentView.setLocalZOrder(numTotalNode - indexNode);
                        if (currChaosStageIndex === indexStage) {
                            focusView = opponentView;
                        }
                    }
                    else {
                        var flagView = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_flag_json, res.spine_ui_flag_atlas, 1.0);
                        flagView.setLocalZOrder(numTotalNode - indexNode);
                        flagView.scale = 0.35;
                        flagView.setAnimation(0, "idle", true);
                        flagView.x = x;
                        flagView.y = y;
                        flagView.anchorY = 0.0;
                        this._scroll.addChild(flagView);
                        this._arrFLagView.push(flagView);
                    }
                    indexStage++;
                }
                else {
                    var chaosCastleStage = allChaosCastleStage[indexChest];
                    var isWin = mc.ChaosCastleManager.isWinChaosCastleStage(chaosCastleStage);
                    var treasureBox = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json, res.spine_ui_chest_atlas, 1.0);
                    treasureBox.setSkin(arrChestName[indexChest]);
                    treasureBox.setLocalZOrder(numTotalNode - indexNode);
                    var canClick = true;
                    if (!isWin) {
                        treasureBox.addAnimation(0, "idle", true, bb.utility.randomInt(0, 10) * 0.1);
                    }
                    else {
                        var isClaimed = mc.ChaosCastleManager.canChaosCastleStageClaimReward(chaosCastleStage);
                        if (isClaimed) {
                            focusView = treasureBox;
                            treasureBox.setAnimation(0, "opened", true);
                            canClick = false;
                        }
                        else {
                            treasureBox.setAnimation(0, "ready", true);
                        }
                    }
                    treasureBox.anchorX = 0.1;
                    treasureBox.anchorY = 0.1;
                    treasureBox.x = x;
                    treasureBox.y = y;
                    if (cc.sys.isNative) {
                        treasureBox.y -= 10;
                    }
                    treasureBox.scale = 0.85;
                    treasureBox.opacity = 0;
                    treasureBox.setUserData(chaosCastleStage);
                    treasureBox.runAction(cc.fadeIn(0.5));
                    this._scroll.addChild(treasureBox);
                    this._arrTreasureBoxView.push(treasureBox);
                    indexChest++;
                    canClick && this._registerTouchTreasureBox(treasureBox);
                }
            }
        }

        if (focusView) {
            this._scroll.scrollTo(focusView.y - this._scroll.height * 0.5, 0.5);
        }

        this.triggerTutorial();
    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_CHAOSCASTLE;
    }

});
mc.ChaosCastleScreen.ARRAY_TREASUREBOX_SKIN = [
    "chest_bronze_blue", "chest_bronze_blue", "chest_bronze_red",
    "chest_bronze_blue", "chest_bronze_blue", "chest_bronze_red",
    "chest_bronze_blue", "chest_bronze_blue", "chest_bronze_red",
    "chest_platinum"
];
