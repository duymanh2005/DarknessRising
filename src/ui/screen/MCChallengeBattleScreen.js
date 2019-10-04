/**
 * Created by long.nguyen on 5/10/2018.
 */
mc.ChallengeBattleScreen = mc.BattleScreen.extend({

    getPreLoadURL:function(){
        return mc.resource.getBattlePreLoadURLs(mc.GameData.challengeInBattle);
    },

    initResources: function () {
        this._super();

        mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN,mc.GUIState.ID_DIALOG_SELECT_BATTLE_HERO_NORMAL);
        var screen = this;
        var _showBattle = function (isBegin) {

            var stageResult = mc.GameData.resultInBattle;
            var challenge = this._challenge = mc.GameData.challengeInBattle;
            mc.GameData.playerInfo.setCurrentPartInBattle(challenge);
            var battleView = this._battleView = challenge.createBattleViewRefactor();
            battleView.showTempBlackPanel(!isBegin);
            battleView.preLoadBattleEffect(challenge.getArrayAllCreatureIndex());
            this.addChild(battleView);
            var boardCotroller = battleView.getControlBoardView();
            if(boardCotroller)
            {
                boardCotroller.setRound(challenge.getCurrentRoundIndex() + 1,challenge.getNumberOfRound());
            }
            var battleField = this._battleView.getBattleField();
            battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
                var winGroupId = battleField.getWinningTeamId();
                if (winGroupId === mc.const.TEAM_RIGHT) {
                    var nextRound = challenge.nextRound();
                    if(boardCotroller && !nextRound)
                    {
                        boardCotroller.runAction(cc.sequence([cc.delayTime(0.6),cc.callFunc(function(){
                            boardCotroller.setRound(challenge.getCurrentRoundIndex() + 1,challenge.getNumberOfRound());
                        })]))

                    }
                    if (challenge.isInLastRound() || (mc.const.CHEAT_WIN_BATTLE_DURATION > 0)) {
                        battleView.cheerWinTeam();
                        this.scheduleOnce(function(){
                            screen.traceDataChange(stageResult, function (data) {
                                mc.view_utility.hideLoadingDialogById(loadingId);
                                screen._showDialogBattleEnd();
                            });
                            mc.GameData.resultInBattle.setMapHeroStatus(challenge.buildMapStatusCreature(battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT)));
                            var loadingId = mc.view_utility.showLoadingDialog();
                            var arrCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                            var numStar = challenge.calculateNumStarInBattle(arrCreature, battleField.getBattleDurationInMs());
                            mc.protocol.finishChallengeStage(challenge.getStageId(), numStar);
                        }.bind(this),1.5);
                    }
                    else {
                        battleView.runTransitionAnimation(function () {
                            challenge.updateHeroInfoFromBattle(battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT));
                            battleView.setupNewTeamGroup(mc.GameLogicFactory.createCurrentMonsterGroupForStage(challenge),mc.const.TEAM_LEFT);
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
                    mc.protocol.finishChallengeStage(challenge.getStageId(), 0);
                }
            }.bind(this));

            battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,function(data){
                this.showDialogPauseBattle();
            }.bind(this));

        }.bind(this);

        _showBattle(true);
    },

    _showDialogBattleEnd: function () {
        new mc.DialogBattleEndView().setRetryCallback(function () {
            bb.framework.getGUIFactory().createLoadingDialog().show();
            mc.protocol.fightChallengeStage(this._challenge.getStageId(),function(result){
                if( result ){
                    new mc.ChallengeBattleScreen().show();
                }
            });
        }.bind(this)).show();
    },

    _showDialogBattleStart: function () {
        new mc.DialogBattleStart(this._challenge, function () {
            this._battleView.getBattleField().startToCombat();
        }.bind(this)).setBattleView(this._battleView).startAnimation().show();
    },

    onScreenPause:function(){
        if( this._battleView && this._battleView.getBattleField() ){
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,undefined,true);
        }
    },

    onScreenShow: function () {
        this._showDialogBattleStart();
        bb.sound.playMusic(res.sound_bgm_battle_pve);
    },

    onScreenClose: function () {
        bb.sound.stopMusic();
        var currentPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        if( currentPartInBattle && currentPartInBattle.isEnd() ){
            mc.GameData.playerInfo.setCurrentPartInBattle(null);
            mc.GameData.resultInBattle.clearData();
        }
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
            new mc.DialogPauseBattle(this._battleView, function () {
                this.traceDataChange(mc.GameData.resultInBattle, function () {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    mc.GameData.guiState.popScreen();
                });
                var loadingId = mc.view_utility.showLoadingDialog(20,function(){
                    mc.GameData.guiState.popScreen();
                });
                mc.protocol.finishChallengeStage(this._challenge.getStageId(), 0);
            }.bind(this)).show();
        }
    },

    onBackEvent: function () {
        if( this._battleView && this._battleView.getBattleField() ){
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,undefined,true);
        }
    }
});