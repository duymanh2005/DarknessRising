/**
 * Created by long.nguyen on 6/5/2018.
 */
mc.ReplayFriendSoloBattleScreen = mc.BattleScreen.extend({

    getPreLoadURL: function () {
        return mc.resource.getBattlePreLoadURLs(mc.GameData.replayFriendSoloInBattle);
    },

    initResources: function () {
        this._super();

        var screen = this;
        var replayFriendSoloInBattle = mc.GameData.replayFriendSoloInBattle;
        mc.GameData.playerInfo.setCurrentPartInBattle(replayFriendSoloInBattle);
        var battleView = this._battleView = replayFriendSoloInBattle.createBattleViewRefactor().showTempBlackPanel(false);
        battleView.preLoadBattleEffect(replayFriendSoloInBattle.getArrayAllCreatureIndex());
        this.addChild(battleView);

        battleView.loadTeamName && battleView.loadTeamName(replayFriendSoloInBattle.getBattleTeamPlayerInfo(), replayFriendSoloInBattle.getBattleTeamOpponentInfo(), replayFriendSoloInBattle.getPlayerTeamSide());

        var battleField = this._battleView.getBattleField();
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
            var winGroupId = battleField.getWinningTeamId();
            winGroupId && battleView.cheerWinTeam();
            var teamPlayerId = replayFriendSoloInBattle.getPlayerTeamSide();
            if (winGroupId === teamPlayerId) {
                this.scheduleOnce(function () {
                    var arrCreature = battleField.getAllCreatureOfTeam(teamPlayerId);
                    var numStar = replayFriendSoloInBattle.calculateNumStarInBattle(arrCreature, battleField.getBattleDurationInMs());
                    mc.GameData.resultInBattle.setMapHeroStatus(replayFriendSoloInBattle.buildMapStatusCreature(battleField.getAllCreatureOfTeam(teamPlayerId)));
                    mc.GameData.resultInBattle.setResult({win: true, star: numStar});
                    screen._showDialogBattleEnd();
                }.bind(this), 1.5);
            }
            else {
                mc.GameData.resultInBattle.setResult({win: false, star: 0});
                screen._showDialogBattleEnd();
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, function (data) {
            this.showDialogPauseBattle();
        }.bind(this));
    },

    _showDialogBattleEnd: function () {
        new mc.DialogBattleEndView().show();
    },

    onScreenShow: function () {
        this._battleView.getBattleField().startToCombat();
        bb.sound.playMusic(res.sound_bgm_battle_pve);
    },

    onScreenClose: function () {
        mc.GameData.playerInfo.setCurrentPartInBattle(null);
        mc.GameData.resultInBattle.clearData();
    },

    showDialogPauseBattle: function () {
        new mc.DialogPauseBattle(this._battleView, function () {
            mc.GameData.guiState.popScreen();
        }.bind(this)).show();
    },

    onBackEvent: function () {
        this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
    }

});