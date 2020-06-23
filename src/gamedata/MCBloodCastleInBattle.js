/**
 * Created by long.nguyen on 1/9/2019.
 */
mc.BloodCastleInBattle = mc.StageInBattle.extend({

    setBattleData: function (json) {
        this._super(json);
        this.setCanRetry(false);
        this.setBackgroundURL(res.brk_losttower1_png);
    },

    isDealItemForPerRound:function(){
        return true;
    },

    getMaxBattleDurationInMs:function(){
        return mc.const.MAX_BATTLE_BLOOD_CASTLE_IN_MS;
    },

    getCurrentWaveIndex:function(){
        var currRound = this.getCurrentRoundIndex();
        var arrWaveData = mc.dictionary.getArrayBloodCastleStageDataByLevelIndex(this.getStageId());
        if( arrWaveData && currRound < arrWaveData.length ){
            return arrWaveData[currRound]["waveIndex"];
        }
        return 10;
    },

    createBattleFieldRefactor: function (randomSeed) {
        return mc.GameLogicFactory.createBattleForStage(this,mc.TeamFormationManager.TEAM_BLOODCASTLE, true);
    },

    createBattleViewRefactor: function () {
        return mc.GameLogicFactory.createBattleForStage(this,mc.TeamFormationManager.TEAM_BLOODCASTLE);
    }

});