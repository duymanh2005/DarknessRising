/**
 * Created by long.nguyen on 4/20/2018.
 */
mc.ChallengeManager = bb.Class.extend({
    _challengeGroupMapByGroupId: null,
    _xBonus: null,

    setChallengeData: function (data) {
        this._challengeGroupMapByGroupId = bb.utility.arrayToMap(data["eventGroupList"], function (challengeGroup) {
            return challengeGroup["groupIndex"];
        });
    },

    getAllChallengeGroup: function () {
        return this._challengeGroupMapByGroupId;
    },

    setChallengeXBonus: function (xBonus) {
        this._xBonus = xBonus;
    },

    getChallengeXBonus: function () {
        this._xBonus = this._xBonus || 1;
        return this._xBonus;
    }

});

mc.ChallengeManager.getArrayChallengeStageDictByRewardIndex = function (rewardIndex) {
    var arrChallengeStageDictByRewardIndex = [];
    var arrChallengeStage = mc.dictionary.arrChallengeStage;
    for (var c = 0; c < arrChallengeStage.length; c++) {
        var challengeStageDict = arrChallengeStage[c];
        var reward = challengeStageDict["reward"];
        if (reward) {
            var arrRewardDict = mc.ItemStock.createArrJsonItemFromStr(reward);
            for (var r = 0; r < arrRewardDict.length; r++) {
                if (mc.ItemStock.getItemIndex(arrRewardDict[r]) === rewardIndex) {
                    arrChallengeStageDictByRewardIndex.push(challengeStageDict);
                    break;
                }
            }
        }
    }
    return arrChallengeStageDictByRewardIndex;
};
