/**
 * Created by long.nguyen on 10/23/2017.
 */
mc.ChaosCastleBattleScreen = mc.BattleScreen.extend({

    getPreLoadURL:function(){
        return mc.resource.getBattlePreLoadURLs(mc.GameData.chaosCastleInBattle);
    },

    initResources: function () {
        this._super();

        mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_CHAOSCASTLE,mc.GUIState.ID_DIALOG_VS);
        var screen = this;
        var chaosCastleInBattle = mc.GameData.chaosCastleInBattle;
        mc.GameData.playerInfo.setCurrentPartInBattle(chaosCastleInBattle);
        var battleView = this._battleView = chaosCastleInBattle.createBattleViewRefactor().showTempBlackPanel(false);
        battleView.preLoadBattleEffect(chaosCastleInBattle.getArrayAllCreatureIndex());
        this.addChild(battleView);

        var battleField = this._battleView.getBattleField();
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
            var winGroupId = battleField.getWinningTeamId();
            winGroupId && battleView.cheerWinTeam();
            var allCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
            allCreature = bb.collection.arrayAppendArray(allCreature,battleField.getAllCreatureOfTeam(mc.const.TEAM_LEFT));
            var mapHeroStatus = chaosCastleInBattle.buildMapStatusCreature(allCreature);
            mc.GameData.resultInBattle.setMapHeroStatus(mapHeroStatus);
            var arrCreatureStatus = bb.utility.mapToArray(mapHeroStatus);
            if (winGroupId === mc.const.TEAM_RIGHT) {
                this.scheduleOnce(function(){
                    var arrCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                    var numStar = chaosCastleInBattle.calculateNumStarInBattle(arrCreature, battleField.getBattleDurationInMs());
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.finishBattleChaosCastle(chaosCastleInBattle.getChaosStageIndex(),numStar,arrCreatureStatus,function(){
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        screen._showDialogBattleEnd();
                    });
                }.bind(this),1.5);
            }
            else {
                var loadingId = mc.view_utility.showLoadingDialog();
                screen._setDeadForPlayerHero(allCreature,arrCreatureStatus);
                mc.protocol.finishBattleChaosCastle(chaosCastleInBattle.getChaosStageIndex(),0,arrCreatureStatus,function(){
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    screen._showDialogBattleEnd();
                });
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,function(data){
            this.showDialogPauseBattle();
        }.bind(this));
    },

    _setDeadForPlayerHero:function(allCreature,arrCreatureStatus){
        var mapCreatureById = bb.utility.arrayToMap(allCreature,function(creature){
            return creature.getServerId();
        });
        for(var c = 0; c < arrCreatureStatus.length; c++ ){
            var status = arrCreatureStatus[c];
            var id = status.id;
            if( mapCreatureById[id] && mapCreatureById[id].getTeamId() === mc.const.TEAM_RIGHT ){
                status.hpPercent = 0;
                status.mpPercent = 0;
            }
        }
    },

    _showDialogBattleEnd:function(){
        new mc.DialogBattleEndView(null,this._battleView.getBattleField()).show();
    },

    onScreenPause:function(){
        if( this._battleView && this._battleView.getBattleField() ){
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,undefined,true);
        }
    },

    onScreenShow:function(){
        this._battleView.getBattleField().startToCombat();
        bb.sound.playMusic(res.sound_bgm_battle_pvp);
    },

    onScreenClose:function(){
        mc.GameData.playerInfo.setCurrentPartInBattle(null);
        mc.GameData.resultInBattle.clearData();
    },

    showDialogPauseBattle: function () {
        var allDialog = bb.director.getAllDialog();
        var isShowPauseDialog = false;
        for(var i = 0; i < allDialog.length; i++ ){
            if( allDialog[i] instanceof mc.DialogPauseBattle ){
                isShowPauseDialog = true;
                break;
            }
        }
        if( !isShowPauseDialog ){
            var screen = this;
            var chaosCastleInBattle = mc.GameData.chaosCastleInBattle;
            new mc.DialogPauseBattle(this._battleView, function(){
                var allCreature = this._battleView.getBattleField().getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                var mapHeroStatus = chaosCastleInBattle.buildMapStatusCreature(allCreature);
                mc.GameData.resultInBattle.setMapHeroStatus(mapHeroStatus);
                var arrCreatureStatus = bb.utility.mapToArray(mapHeroStatus);
                var loadingId = mc.view_utility.showLoadingDialog(20,function(){
                    mc.GameData.guiState.popScreen();
                });
                screen._setDeadForPlayerHero(allCreature,arrCreatureStatus);
                mc.protocol.finishBattleChaosCastle(chaosCastleInBattle.getChaosStageIndex(),0,arrCreatureStatus,function(){
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    mc.GameData.guiState.popScreen();
                });
            }.bind(this)).show();
        }
    },

    onBackEvent: function () {
        if( this._battleView.getBattleField() ){
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,undefined,true);
        }
    }

});