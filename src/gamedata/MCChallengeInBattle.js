/**
 * Created by long.nguyen on 5/10/2018.
 */
mc.ChallengeInBattle = mc.StageInBattle.extend({

    getZenReward: function () {
        return 0;
    },

    getBattleBackgroundURL: function () {
        var challengeStage = mc.dictionary.getChallengeStageByIndex(this.getStageId());
        return challengeStage["battleBG"].split(',');
    },

    canRetry: function () {
        return false;
    }

});