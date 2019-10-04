/**
 * Created by long.nguyen on 10/23/2017.
 */
mc.FriendSoloBattleScreen = mc.BattleScreen.extend({

    getPreLoadURL: function () {
        return mc.resource.getBattlePreLoadURLs(mc.GameData.friendSoloInBattle);
    },

    initResources: function () {
        this._super();

        mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_VS);
        var screen = this;
        var friendSoloInBattle = mc.GameData.friendSoloInBattle;
        mc.GameData.playerInfo.setCurrentPartInBattle(friendSoloInBattle);
        var battleView = this._battleView = friendSoloInBattle.createBattleViewRefactor().showTempBlackPanel(false);
        battleView.preLoadBattleEffect(friendSoloInBattle.getArrayAllCreatureIndex());
        this.addChild(battleView);

        battleView.loadTeamName && battleView.loadTeamName(friendSoloInBattle.getBattleTeamPlayerInfo(), friendSoloInBattle.getBattleTeamOpponentInfo(), friendSoloInBattle.getPlayerTeamSide());

        var battleField = this._battleView.getBattleField();
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
            var winGroupId = battleField.getWinningTeamId();
            winGroupId && battleView.cheerWinTeam();
            if (winGroupId === mc.const.TEAM_RIGHT) {
                this.scheduleOnce(function () {
                    var arrCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                    var numStar = friendSoloInBattle.calculateNumStarInBattle(arrCreature, battleField.getBattleDurationInMs());
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.GameData.resultInBattle.setMapHeroStatus(friendSoloInBattle.buildMapStatusCreature(battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT)));
                    mc.GameData.resultInBattle.setResult({win: true, star: numStar});
                    mc.protocol.submitFriendSoloResult(true,friendSoloInBattle.buildScriptString(battleField),function(){
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        screen._showDialogBattleEnd();
                    });
                }.bind(this), 1.5);
            }
            else {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.submitFriendSoloResult(false,friendSoloInBattle.buildScriptString(battleField),function(){
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    screen._showDialogBattleEnd();
                });
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, function (data) {
            this.showDialogPauseBattle();
        }.bind(this));
    },

    _showDialogBattleEnd: function () {
        new mc.DialogBattleEndView(null,this._battleView.getBattleField()).show();
    },

    onScreenPause: function () {
        if (this._battleView && this._battleView.getBattleField()) {
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
        }
    },

    onScreenShow: function () {
        this._battleView.getBattleField().startToCombat();
        bb.sound.playMusic(res.sound_bgm_battle_pvp);
    },


    onScreenClose: function () {
        mc.GameData.playerInfo.setCurrentPartInBattle(null);
        mc.GameData.resultInBattle.clearData();
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
            new mc.DialogPauseBattle(this._battleView, function () {
                var loadingId = mc.view_utility.showLoadingDialog(20, function () {
                    mc.GameData.guiState.popScreen();
                });
                mc.protocol.submitFriendSoloResult(false,null,function(){
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    mc.GameData.guiState.popScreen();
                });
            }.bind(this)).show();
        }
    },

    onBackEvent: function () {
        if (this._battleView && this._battleView.getBattleField()) {
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
        }
    }

});