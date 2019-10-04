/**
 * Created by long.nguyen on 11/7/2017.
 */
mc.RelicArenaManager = bb.Class.extend({
    _isChange: true,
    _notifyCount: 0,
    _arrMatchId: [],
    _isWaitingVS: false,
    _pickiingStatus: null,

    setInfo: function (arenaInfo) {
        this._arenaWinNo = arenaInfo["numOfBattleWin"];
        this._arenaLoseNo = arenaInfo["numOfBattleLose"];
        this._relicWin = arenaInfo["relicCoin"];

        //mc.GameData.playerInfo.setLeague(arenaInfo["league"]);
        //mc.GameData.playerInfo.setRank(arenaInfo["rank"]);
        this.setChange(false);
    },

    removeOpponentInArrayByIndex: function (index) {
        if (this._arrOpponent && index >= 0 && index < this._arrOpponent.length) {
            return this._arrOpponent.splice(index, 1);
        }
        return null;
    },

    getArrMatchIdForRequestJoinerList: function () {
        return this._arrMatchId;
    },

    addMatchIdForRequestJoinerList: function (id) {
        if (id) {
            if (this._arrMatchId.indexOf(id) < 0) {
                this._arrMatchId.push(id);
            }
        }

    },

    updateMatchInfo: function (info) {
        this._matchInfo = info;
    },

    getMatchInfo: function () {
        return this._matchInfo;
    },

    setWaitingVS: function (value) {
        this._isWaitingVS = value;
        this.notifyDataChanged({waitingVS: value});
    },

    isWaitingVS: function () {
        return this._isWaitingVS;
    },

    removeMatchIdForRequestJoinerList: function (id) {
        if (id) {
            var ind = this._arrMatchId.indexOf(id)
            if (ind >= 0) {
                this._arrMatchId.splice(ind, 0);
            }
        }

    },

    setNotifyCount: function (notifyCount) {
        this._notifyCount = notifyCount;
    },

    getNotifyCount: function () {
        return this._notifyCount;
    },

    setChange: function (isChange) {
        this._isChange = isChange;
    },

    setPickingStatus: function (data) {
        this._pickiingStatus = data;
    },

    getPickingStatus: function () {
        return this._pickiingStatus;
    },

    isChange: function () {
        return this._isChange;
    },

    setArraySearchOpponent: function (arrOpponent) {
        this._arrOpponent = arrOpponent;
        //if (this._arrOpponent) {
        //    this._arrOpponent.sort(function (oppInfo1, oppInfo2) {
        //        return oppInfo2.winPoint - oppInfo1.winPoint;
        //    });
        //}
    },

    getArraySearchOpponent: function () {
        return this._arrOpponent;
    },

    getSearchOpponentByIndex: function (index) {
        return this._arrOpponent[index];
    },

    getArenaWinNo: function () {
        return this._arenaWinNo;
    },

    getArenaLoseNo: function () {
        return this._arenaLoseNo;
    },

    getRelicWin: function () {
        return this._relicWin;
    },


});


mc.RelicArenaManager.getOpponentGuild = function (opponetInfo) {
    return opponetInfo.guild_info;
};

mc.RelicArenaManager.getOpponentHeroId = function (opponentInfo) {
    return opponentInfo.gameHeroId;
};

mc.RelicArenaManager.getOpponentTeamFormation = function (opponentInfo) {
    return opponentInfo.battleTeam;
};

mc.RelicArenaManager.getOpponentName = function (opponentInfo) {
    return opponentInfo.name;
};

mc.RelicArenaManager.getOpponentLeague = function (opponentInfo) {
    return opponentInfo.league;
};

mc.RelicArenaManager.getOpponentWinNo = function (opponentInfo) {
    //return opponentInfo.win;
    return opponentInfo.relic;
};

mc.RelicArenaManager.getOpponentLoseNo = function (opponentInfo) {
    //return opponentInfo.lose;
    return opponentInfo.relic;
};

mc.RelicArenaManager.getOpponentLeaderIndex = function (opponentInfo) {
    return opponentInfo.leaderIndex;
};

mc.RelicArenaManager.getOpponentArrayHeroes = function (opponentInfo) {
    return opponentInfo.heroes;
};

mc.RelicArenaManager.getOpponentTeamPower = function (opponentInfo) {
    return opponentInfo.power;
};

mc.RelicArenaManager.getOpponentLevel = function (opponentInfo) {
    return opponentInfo.level;
};

mc.RelicArenaManager.getOpponentPickHeroTime = function (opponentInfo) {
    return opponentInfo.time;
};

mc.RelicArenaManager.isOwner = function (opponentInfo) {
    return opponentInfo.owner;
};