/**
 * Created by long.nguyen on 10/23/2017.
 */
mc.RelicArenaBattleScreen = mc.BattleScreen.extend({

    getPreLoadURL: function () {
        return mc.resource.getBattlePreLoadURLs(mc.GameData.relicArenaInBattle);
    },

    initResources: function () {
        this._super();

        mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_VS);
        var screen = this;
        var arenaPartInBattle = mc.GameData.relicArenaInBattle;
        mc.GameData.playerInfo.setCurrentPartInBattle(arenaPartInBattle);
        var battleView = this._battleView = arenaPartInBattle.createBattleViewRefactor().showTempBlackPanel(false);
        battleView.preLoadBattleEffect(arenaPartInBattle.getArrayAllCreatureIndex());
        this.addChild(battleView);

        battleView.loadTeamName && battleView.loadTeamName(arenaPartInBattle.getBattleTeamPlayerInfo(), arenaPartInBattle.getBattleTeamOpponentInfo(), arenaPartInBattle.getPlayerTeamSide());

        var battleField = this._battleView.getBattleField();
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
            var winGroupId = battleField.getWinningTeamId();
            winGroupId && battleView.cheerWinTeam();
            var playerSide = arenaPartInBattle.getPlayerTeamSide();
            if (winGroupId === playerSide) {
                this.scheduleOnce(function () {
                    var arrCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                    var numStar = arenaPartInBattle.calculateNumStarInBattle(arrCreature, battleField.getBattleDurationInMs());
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.GameData.resultInBattle.setMapHeroStatus(arenaPartInBattle.buildMapStatusCreature(battleField.getAllCreatureOfTeam(winGroupId)));
                    mc.GameData.resultInBattle.setResult({win: true, star: numStar});
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.submitScriptInRelicArena(mc.GameData.relicArenaManager.getMatchInfo().requestId,mc.GameData.playerInfo.getId(),function(rs){
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        screen._showDialogBattleEnd();
                    }.bind(this));
                }.bind(this), 1.5);
            }
            else {
                var loadingId = mc.view_utility.showLoadingDialog();
                var winnerId = arenaPartInBattle.getData().opponent.gameHeroId;
                if(arenaPartInBattle.getData().opponent.gameHeroId === mc.GameData.playerInfo.getId())
                {
                    winnerId = arenaPartInBattle.getData().your_team.gameHeroId;
                }
                mc.protocol.submitScriptInRelicArena(mc.GameData.relicArenaManager.getMatchInfo().requestId,winnerId,function(rs){
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    screen._showDialogBattleEnd();
                }.bind(this));
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, function (data) {
            this.showDialogPauseBattle();
        }.bind(this));
    },

    _showDialogBattleEnd: function () {
        //new mc.DialogBattleEndView(battleIn,statsContainer).show();
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
                //mc.protocol.finishArena(0, null, function () {
                //    mc.view_utility.hideLoadingDialogById(loadingId);
                //    mc.GameData.guiState.popScreen();
                //});
            }.bind(this)).show();
        }
    },

    onBackEvent: function () {
        if (this._battleView && this._battleView.getBattleField()) {
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
        }
    }

});