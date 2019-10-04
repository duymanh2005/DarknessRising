/**
 * Created by long.nguyen on 10/19/2017.
 */
mc.ChaosCastleManager = bb.Class.extend({
    _arrStageChaosCastle: null,
    _mapArrOpponentHeroByStageIndex: null,

    _info: null,
    _ticketNo: 0,
    _isChange: true,
    _mapStatusCreatureById: null,

    ctor: function () {
        this._super();
        this._mapArrOpponentHeroByStageIndex = {};
    },

    unlockNextStage: function (currStageIndex) {
        var currStage = this._arrStageChaosCastle[currStageIndex];
        currStage.win = true;

        currStageIndex++;
        if (currStageIndex < this._arrStageChaosCastle.length) {
            var stage = this._arrStageChaosCastle[currStageIndex];
            stage.unlock = true;
        }
    },

    claimRewardChaosStage: function (stageIndex) {
        var currStage = this._arrStageChaosCastle[stageIndex];
        currStage.clamed = true;
    },

    setChaosCastleData: function (json) {
        this._mapStatusCreatureById = null;
        this._mapArrOpponentHeroByStageIndex = {};
        this._info = json["chaos_info"] || this._info;
        this._arrStageChaosCastle = json["stages"];
        this._arrStageChaosCastle.sort(function (stage1, stage2) {
            return stage1.stageIndex - stage2.stageIndex;
        });
        this.updateAllStatusCreature(this._info["properties"]);
        cc.log("ARR CHAOS STAGE");
        cc.log(this._arrStageChaosCastle);
        this._isChange = false;

        mc.GameData.teamFormationManager.setupChaosCastleTeamFormation(this._info);
        mc.GameData.teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_CHAOSCASTLE);
    },

    getCurrentChaosStageIndex: function () {
        var index = 0;
        for (var i = 0; i < this._arrStageChaosCastle.length; i++) {
            if (!this._arrStageChaosCastle[i].win) {
                index = this._arrStageChaosCastle[i].stageIndex;
                break;
            }
        }
        return index;
    },

    isChange: function () {
        return this._isChange;
    },

    getAllChaosCastleStage: function () {
        return this._arrStageChaosCastle;
    },

    hasClaimAbleChest: function () {
        for (var i in this._arrStageChaosCastle) {
            var chaos = this._arrStageChaosCastle[i];
            var isClaimed = mc.ChaosCastleManager.canChaosCastleStageClaimReward(chaos);
            var isWin = mc.ChaosCastleManager.isWinChaosCastleStage(chaos);
            if (isWin && !isClaimed) {
                return true;
            }
        }
        return false;
    },

    getChaosCastleStageByIndex: function (stageIndex) {
        return this._arrStageChaosCastle[stageIndex];
    },

    getOpponentFormationByStageIndex: function (stageIndex) {
        return this._mapArrOpponentHeroByStageIndex[stageIndex];
    },

    setOpponentFormationByStageIndex: function (opponentTeam, stageIndex) {
        this._mapArrOpponentHeroByStageIndex[stageIndex] = opponentTeam;
    },

    getTicketNo: function () {
        return mc.GameData.playerInfo.getChaosTicket() || 0;
    },

    // Begin Status Creature Manager Interface
    updateAllStatusCreature: function (arrProperties) {
        this._mapStatusCreatureById = this._mapStatusCreatureById || {};
        if (arrProperties) {
            if (arrProperties) {
                for (var i = 0; i < arrProperties.length; i++) {
                    this._mapStatusCreatureById[arrProperties[i].heroId] = arrProperties[i];
                }
            }
        }

    },

    getStatusCreatureById: function (heroId, heroIndex) {
        var status = null;
        if (this._mapStatusCreatureById) {
            status = this._mapStatusCreatureById[heroId];
        }
        if (!status) {
            status = {
                id: heroId,
                index: heroIndex,
                level: 1,
                hpPercent: 1 * mc.CreatureInfo.CAST_LONG_RATE,
                mpPercent: 0
            };
        }
        var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
        if (heroInfo && status) {
            status.level = mc.HeroStock.getHeroLevel(heroInfo);
            status.index = heroIndex || mc.HeroStock.getHeroIndex(heroInfo);
        }
        return status;
    }
    // End Status Creature Manager Interface

});

mc.ChaosCastleManager.getOpponentFormationChaosStagePower = function (opponentFormation) {
    return opponentFormation.teamPower;
};

mc.ChaosCastleManager.getOpponentFormationChaosStageLeague = function (opponentFormation) {
    return opponentFormation.league;
};

mc.ChaosCastleManager.getOpponentFormationChaosStageLeaderIndex = function (opponentFormation) {
    return opponentFormation.leaderIndex;
};

mc.ChaosCastleManager.getOpponentFormationChaosStageArrayHero = function (opponentFormation) {
    return opponentFormation.heroes;
};

mc.ChaosCastleManager.getOpponentFormationChaosStageTeam = function (opponentFormation) {
    return opponentFormation.battleTeam;
};

mc.ChaosCastleManager.getOpponentFormationChaosStageName = function (opponentFormation) {
    return opponentFormation.opponentName;
};

mc.ChaosCastleManager.getChaosCastleStageArrayReward = function (chaosCastleStage) {
    var arrItemInfo = [];
    var arrStrReward = chaosCastleStage["reward"]["items"];
    for (var i = 0; i < arrStrReward.length; i++) {
        var strs = arrStrReward[i].split('/');
        var itemInfo = mc.ItemStock.createJsonItemInfo(strs[0], strs[1]);
        arrItemInfo.push(itemInfo);
    }
    return arrItemInfo;
};

mc.ChaosCastleManager.getChaosCastleStageIndex = function (chaosCastleStage) {
    return chaosCastleStage.stageIndex;
};

mc.ChaosCastleManager.getChaosCastleStageLeaderHero = function (chaosCastleStage) {
    return chaosCastleStage.leaderHero;
};

mc.ChaosCastleManager.isWinChaosCastleStage = function (chaosCastleStage) {
    return chaosCastleStage.win;
};

mc.ChaosCastleManager.isUnlockChaosCastleStage = function (chaosCastleStage) {
    return chaosCastleStage.unlock;
};

mc.ChaosCastleManager.canChaosCastleStageClaimReward = function (chaosCastleStage) {
    return chaosCastleStage.clamed;
};
