/**
 * Created by long.nguyen on 4/10/2017.
 */
(function () {

    mc.CampainBattleScreen = mc.BattleScreen.extend({

        getPreLoadURL: function () {
            return mc.resource.getBattlePreLoadURLs(mc.GameData.stageInBattle);
        },

        initResources: function () {
            this._super();

            mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_SELECT_HERO);
            var screen = this;
            var _showBattle = function (isBegin) {

                var stageResult = mc.GameData.resultInBattle;
                var stage = this._stage = mc.GameData.stageInBattle;
                var battleView = this._battleView = stage.createBattleViewRefactor();
                battleView.showTempBlackPanel(!isBegin);
                battleView.preLoadBattleEffect(stage.getArrayAllCreatureIndex());
                this.addChild(battleView);

                var battleField = this._battleView.getBattleField();
                battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
                    var winGroupId = battleField.getWinningTeamId();
                    if (winGroupId === mc.const.TEAM_RIGHT) {
                        stage.nextRound();
                        if (stage.isInLastRound() || (mc.const.CHEAT_WIN_BATTLE_DURATION > 0)) {
                            battleView.cheerWinTeam();
                            this.scheduleOnce(function () {
                                screen.traceDataChange(stageResult, function (data) {
                                    mc.view_utility.hideLoadingDialogById(loadingId);
                                    screen._showDialogBattleEnd(mc.DialogBattleEndView.BATTLE_IN.CAMPAIGN);
                                });
                                var loadingId = mc.view_utility.showLoadingDialog();
                                var arrCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                                var numStar = stage.calculateNumStarInBattle(arrCreature, battleField.getBattleDurationInMs());
                                var arrHeroGainExp = [];
                                bb.utility.arrayTraverse(arrCreature, function (creature) {
                                    if (!creature.isDead()) {
                                        arrHeroGainExp.push(creature.getInfo().serverId);
                                    }
                                });
                                mc.protocol.finishStage(stage.getStageId(), true, numStar, arrHeroGainExp);
                            }.bind(this), 1.5);
                        }
                        else {
                            battleView.runTransitionAnimation(function () {
                                stage.updateHeroInfoFromBattle(battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT));
                                battleView.setupNewTeamGroup(mc.GameLogicFactory.createCurrentMonsterGroupForStage(stage), mc.const.TEAM_LEFT);
                                screen._showDialogBattleStart();
                            }.bind(this), "end");
                        }
                    }
                    else {
                        screen.traceDataChange(stageResult, function (data) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            screen._showDialogBattleEnd();
                        });
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.finishStage(stage.getStageId(), false);
                    }
                }.bind(this));

                battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, function (data) {
                    this.showDialogPauseBattle();
                }.bind(this));
            }.bind(this);

            _showBattle(true);

        },

        _showDialogBattleEnd: function (battleIn) {
            new mc.DialogBattleEndView(battleIn).toggleAutoRetry().setRetryCallback(function () {
                var stageDict = mc.dictionary.getStageDictByIndex(this._stage.getStageId());
                var isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_STAMINA,
                    mc.CampaignManger.getStaminaCostByStageDict(stageDict));
                if (!isShow) {
                    isShow = mc.view_utility.showSuggestBuyItemSlotsIfAny();
                    if (isShow) {
                        return;
                    }
                    this.traceDataChange(mc.GameData.stageInBattle, function (mission) {
                        cc.log("START MISSION!");
                        new mc.CampainBattleScreen().show();
                    });
                    bb.framework.getGUIFactory().createLoadingDialog().show();
                    mc.protocol.comeToStage(this._stage.getStageId());
                }
            }.bind(this)).show();
        },

        _showDialogBattleStart: function () {
            new mc.DialogBattleStart(this._stage, function () {
                this._battleView.getBattleField().startToCombat();
            }.bind(this)).setBattleView(this._battleView).startAnimation().show();
        },

        onScreenShow: function () {
            this._showDialogBattleStart();
            bb.sound.playMusic(res.sound_bgm_battle_pve);
        },

        onScreenClose: function () {
            bb.sound.stopMusic();
            var currentPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
            if (currentPartInBattle && currentPartInBattle.isEnd()) {
                mc.GameData.playerInfo.setCurrentPartInBattle(null);
                mc.GameData.resultInBattle.clearData();
            }
        },

        onScreenPause: function () {
            if (this._battleView && this._battleView.getBattleField()) {
                this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
            }
        },

        showDialogPauseBattle: function () {
            var allDialog = bb.director.getAllDialog();
            var isShowPauseDialog = false;
            for (var i = 0; i < allDialog.length; i++) {
                if (allDialog[i] instanceof mc.DialogPauseBattle) {
                    isShowPauseDialog = true;
                    break;
                }
            }
            if (!isShowPauseDialog) {
                var canNotSubmit = false;
                new mc.DialogPauseBattle(this._battleView, function () {
                    this.traceDataChange(mc.GameData.resultInBattle, function () {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        mc.GameData.guiState.popScreen();
                    });
                    var loadingId = mc.view_utility.showLoadingDialog(20, function () {
                        mc.GameData.guiState.popScreen();
                    });
                    mc.protocol.finishStage(this._stage.getStageId(), false);
                }.bind(this)).show();
            }
        },

        onBackEvent: function () {
            if (this._battleView && this._battleView.getBattleField()) {
                this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
            }
        }

    });

}());
