/**
 * Created by long.nguyen on 11/7/2017.
 */
mc.FriendSoloManager = bb.Class.extend({
    _selectFriendVS: null,
    _friendSoloId: null,
    _notifyCount: 0,

    setNotifyCount: function (notifyCount) {
        this._notifyCount = notifyCount;
    },

    getNotifyCount: function () {
        return this._notifyCount;
    },

    setSelectFriendVS: function (opponentInfo) {
        this._selectFriendVS = opponentInfo;
    },

    getSelectFriendVS: function () {
        return this._selectFriendVS;
    },

    setFriendSoloId: function (gameId) {
        this._friendSoloId = gameId;
    },

    getFriendSoloId: function () {
        return this._friendSoloId;
    }

});


mc.FriendSoloManager.getOpponentHeroId = function (opponentInfo) {
    return opponentInfo.gameHeroId;
};

mc.FriendSoloManager.getOpponentTeamFormation = function (opponentInfo) {
    return opponentInfo.battleTeam;
};

mc.FriendSoloManager.getOpponentName = function (opponentInfo) {
    return opponentInfo.gameHeroName;
};

mc.FriendSoloManager.getOpponentLeague = function (opponentInfo) {
    return opponentInfo.league;
};

mc.FriendSoloManager.getOpponentLeaderIndex = function (opponentInfo) {
    return opponentInfo.leaderIndex;
};

mc.FriendSoloManager.getOpponentArrayHeroes = function (opponentInfo) {
    return opponentInfo.heroes;
};

mc.FriendSoloManager.getOpponentTeamPower = function (opponentInfo) {
    return opponentInfo.teamPower;
};

mc.FriendSoloManager.getOpponentLevel = function (opponentInfo) {
    return opponentInfo.level;
};