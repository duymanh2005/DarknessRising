/**
 * Created by long.nguyen on 11/7/2017.
 */
mc.ArenaManager = bb.Class.extend({
    _isChange: true,
    _notifyCount: 0,
    _selectRevegingOpponent: null,

    setInfo: function (arenaInfo) {
        this._arenaWinNo = arenaInfo["winNo"];
        this._arenaWinPoint = arenaInfo["arenaPoint"];
        this._shieldTime = arenaInfo["shieldTime"];
        mc.GameData.playerInfo.setLeague(arenaInfo["league"]);
        mc.GameData.playerInfo.setRank(arenaInfo["rank"]);
        this.setChange(false);
    },

    setRankingSeconds: function (arenaInfo) {
        var arenaInfoElement = arenaInfo["rankingSeconds"];
        if (arenaInfoElement) {
            this._rankingSeconds = bb.now() + arenaInfoElement * 1000;
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

    isChange: function () {
        return this._isChange;
    },

    setSelectRevengingOpponent: function (opponentInfo) {
        this._selectRevegingOpponent = opponentInfo;
    },

    getSelectRevengingOpponent: function () {
        return this._selectRevegingOpponent;
    },

    setArraySearchOpponent: function (arrOpponent) {
        this._arrOpponent = arrOpponent;
        if (this._arrOpponent) {
            this._arrOpponent.sort(function (oppInfo1, oppInfo2) {
                return oppInfo2.winPoint - oppInfo1.winPoint;
            });
        }
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

    getArenaWinPoint: function () {
        return this._arenaWinPoint;
    },

    getShieldTime: function () {
        return this._shieldTime;
    },
    getRankingSeconds: function () {
        return this._rankingSeconds;
    }

});

mc.ArenaManager.getOpponentArenaPoint = function (opponentInfo) {
    return opponentInfo.arenaPoint;
};

mc.ArenaManager.getOpponentGuild = function (opponetInfo) {
    return opponetInfo.guild_info;
};

mc.ArenaManager.getOpponentWinPoint = function (opponentInfo) {
    return opponentInfo.winPoint;
};

mc.ArenaManager.getOpponentLosePoint = function (opponentInfo) {
    return opponentInfo.losePoint;
};

mc.ArenaManager.getOpponentHeroId = function (opponentInfo) {
    return opponentInfo.gameHeroId;
};

mc.ArenaManager.getOpponentTeamFormation = function (opponentInfo) {
    return opponentInfo.battleTeam;
};

mc.ArenaManager.getOpponentName = function (opponentInfo) {
    return opponentInfo.gameHeroName;
};

mc.ArenaManager.getOpponentLeague = function (opponentInfo) {
    return opponentInfo.league;
};

mc.ArenaManager.getOpponentLeaderIndex = function (opponentInfo) {
    return opponentInfo.leaderIndex;
};

mc.ArenaManager.getOpponentArrayHeroes = function (opponentInfo) {
    return opponentInfo.heroes;
};

mc.ArenaManager.getOpponentTeamPower = function (opponentInfo) {
    return opponentInfo.teamPower;
};

mc.ArenaManager.getOpponentLevel = function (opponentInfo) {
    return opponentInfo.level;
};