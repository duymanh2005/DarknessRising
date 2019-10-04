/**
 * Created by long.nguyen on 10/23/2017.
 */
mc.ResultInBattle = bb.Class.extend({
    setResult: function (json) {
        this.win = json["win"];
        json["star"] && (this._numStar = json["star"]);
        var newFriend = this._newFriend = json["newFriend"];
        this._stageId = json["stgid"];
        var currPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        if (currPartInBattle) {
            currPartInBattle.setEnd();
        }
        json["secret_reward"] && (this._arrSecretRewardItem = json["secret_reward"]["items"]);
        this._isFinish = true;
    },

    isFinish: function () {
        return this._isFinish;
    },

    setRewardInfo: function (reward) {
        this._zen = reward["zen"];
        var items = reward["items"];
        if (items) {
            this._rewardItem = items;
        }
        var items_bonus = reward["items_bonus"];
        if (items_bonus) {
            this._rewardItemBonus = items_bonus;
        }
    },

    setIncr_Exp: function (incr_exp) {
        this._arrIncr_exp = incr_exp;
    },

    getIncr_exp: function () {
        return this._arrIncr_exp;
    },

    setMapHeroGainExp: function (heroMap) {
        this._mapHeroIdGainExpById = heroMap;
    },

    getMapHeroGainExp: function () {
        return this._mapHeroIdGainExpById;
    },

    setMapHeroStatus: function (mapHeroStatus) {
        this._mapHeroStatusById = mapHeroStatus;
    },

    getMapHeroStatus: function () {
        return this._mapHeroStatusById;
    },

    getZen: function () {
        return this._zen;
    },

    getNumStar: function () {
        return this._numStar;
    },

    getRewardItem: function () {
        return this._rewardItem;
    },

    getRewardItemBonus: function () {
        return this._rewardItemBonus;
    },

    getArraySecretRewardItem: function () {
        return this._arrSecretRewardItem;
    },

    getNewFriend: function () {
        return this._newFriend;
    },

    getStageId: function () {
        return this._stageId;
    },

    isWin: function () {
        return this.win;
    },

    clearData: function () {
        this._rewardItem = null;
        this._arrIncr_exp = null;
        this._rewardItemBonus = null;
        this._mapHeroIdGainExpById = null;
        this._mapHeroStatusById = null;
        this._newFriend = null;
        this._arrSecretRewardItem = null;
        this._zen = 0;
        this._numStar = 0;
        this._stageId = null;
        this.win = false;
        this._isFinish = false;
    }

});