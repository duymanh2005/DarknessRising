/**
 * Created by long.nguyen on 1/9/2019.
 */

mc.BloodCastleBattleScreen = mc.BattleScreen.extend({

    getPreLoadURL: function () {
        return mc.resource.getBattlePreLoadURLs(mc.GameData.bloodCastleInBattle);
    },

    initResources: function () {
        this._super();

        mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_SELECT_BATTLE_HERO_NORMAL);
        var screen = this;
        var _showBattle = function (isBegin) {

            var resultInBattle = mc.GameData.resultInBattle;
            var bloodCastle = this._bloodCastle = mc.GameData.bloodCastleInBattle;
            mc.GameData.playerInfo.setCurrentPartInBattle(bloodCastle);
            var battleView = this._battleView = bloodCastle.createBattleViewRefactor();
            battleView.showTempBlackPanel(!isBegin);
            battleView.preLoadBattleEffect(bloodCastle.getArrayAllCreatureIndex());
            this.addChild(battleView);

            var battleField = this._battleView.getBattleField();
            battleField.setNoneResetBattleDuration(true);
            battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
                var winGroupId = battleField.getWinningTeamId();
                if (winGroupId === mc.const.TEAM_RIGHT) {
                    bloodCastle.nextRound();
                    if (bloodCastle.isInLastRound() || (mc.const.CHEAT_WIN_BATTLE_DURATION > 0)) {
                        battleView.cheerWinTeam();
                        this.scheduleOnce(function () {
                            screen.traceDataChange(resultInBattle, function (data) {
                                mc.view_utility.hideLoadingDialogById(loadingId);
                                screen._showDialogBattleEnd();
                            });
                            var loadingId = mc.view_utility.showLoadingDialog();
                            var arrCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                            var numStar = bloodCastle.calculateNumStarInBattle(arrCreature, battleField.getBattleDurationInMs());
                            var arrHeroGainExp = [];
                            bb.utility.arrayTraverse(arrCreature, function (creature) {
                                if (!creature.isDead()) {
                                    arrHeroGainExp.push(creature.getInfo().serverId);
                                }
                            });
                            mc.protocol.finishBloodCastleStage(bloodCastle.getStageId(), numStar, battleField.getBattleDurationInMs(),bloodCastle.getCurrentWaveIndex());
                        }.bind(this), 1.5);
                    }
                    else {
                        battleView.runTransitionAnimation(function () {
                            bloodCastle.updateHeroInfoFromBattle(battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT));
                            battleView.setupNewTeamGroup(mc.GameLogicFactory.createCurrentMonsterGroupForStage(bloodCastle), mc.const.TEAM_LEFT);
                            if( bloodCastle.getCurrentRoundIndex() === bloodCastle.getNumberOfRound() - 1){
                                battleView.loadNewEnvironment(new mc.BattleEnvinronment(res.brk_bloodcastle2_png));
                            }
                            screen._showDialogBattleStart();
                        }.bind(this), "end");
                    }
                }
                else {
                    screen.traceDataChange(resultInBattle, function (data) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        screen._showDialogBattleEnd();
                    });
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.finishBloodCastleStage(bloodCastle.getStageId(), 0, battleField.getBattleDurationInMs(),bloodCastle.getCurrentWaveIndex());
                }
            }.bind(this));

            battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, function (data) {
                this.showDialogPauseBattle();
            }.bind(this));
        }.bind(this);

        _showBattle(true);

    },

    _showDialogBattleEnd: function () {
        new mc.DialogBattleEndView().show();
    },

    _showDialogBattleStart: function () {
        new mc.DialogBattleStart(this._bloodCastle, function () {
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
                mc.GameData.guiState.popScreen();
            }.bind(this)).show();
        }
    },

    onBackEvent: function () {
        if (this._battleView && this._battleView.getBattleField()) {
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
        }
    }

});