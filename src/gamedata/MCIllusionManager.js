/**
 * Created by long.nguyen on 10/19/2017.
 */
mc.IllusionManager = bb.Class.extend({
    _stages: null,
    _info: null,
    _mapStatusCreatureById: null,
    _mapIndexStages: null,
    _mapStagesRecord: null,
    _mapArrOpponentHeroByStageIndex: null,

    ctor: function () {
        this._super();
        this._mapArrOpponentHeroByStageIndex = {};
    },

    unlockNextStage: function (currStageIndex, nextStageIndex) {
        var currStage = this._mapStagesRecord[currStageIndex];
        currStage.win = true;

        if (nextStageIndex) {
            var stage = this._mapStagesRecord[nextStageIndex];
            if (!stage) {
                stage = {
                    unlock: true,
                    clamed: false,
                    win: false
                };
                this._mapStagesRecord[nextStageIndex] = stage;
            }
            stage.unlock = true;
        }
    },

    createStages: function (jsons) {
        var stages = [];
        if (jsons) {
            for (var i = 0; i < jsons.length; i++) {
                var stage = jsons[i];
                stages.push(new mc.IllusionStage(stage));
            }
            return stages;
        }
        return null;
    },

    setIllusionData: function (json) {
        this._mapStatusCreatureById = null;
        this._info = json["illusion_info"] || this._info;
        this._stages = this.createStages(json["stages"]) || this._stages;
        this._stages.sort(function (stage1, stage2) {
            return stage1.stageIndex - stage2.stageIndex;
        });
        this.updateAllStatusCreature(this._info["stageRecords"]);
        this.numOfStage = mc.dictionary.illusionDict.getStageNumber();
        this._mapIndexStages = bb.utility.makeMapsKeyIndex(this._stages, "stageIndex");
        this._mapStagesRecord = bb.utility.arrayToMap(this._info["stages"], function (stage) {
            return stage["index"];
        }, function (stage) {
            return stage["stage"];
        });

        mc.GameData.teamFormationManager.setupIllusionTeamFormation(this._info);
        mc.GameData.teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_ILLUSION);
    },

    claimRewardIllusionStage: function (stageIndex) {
        var currStage = this._mapStagesRecord[stageIndex];
        currStage.clamed = true;
    },

    updateIllusionInfo: function (json) {
        if (json)
            this._info = json;
    },
    getTotalNumStage: function () {
        return this.numOfStage;
    },

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
    },

    getPlayerInfo: function () {
        return this._info;
    },

    getRemainAttackChance: function () {
        return this._info["remainAttack"]
    },

    setRemainAttackChance: function (remain) {
        this._info["remainAttack"] = remain || 0;
    },

    getMaxLevelReach: function () {
        return this._info["maxLevel"] || 1;
    },

    getStage: function (stageId) {
        return this._stages[this._mapIndexStages[stageId]];
    },

    getListStages: function () {
        return this._stages || [];
    },

    getStageRecord: function (stageId) {
        return this._mapStagesRecord[stageId];
    },

    getOpponentFormationByStageIndex: function (stageIndex) {
        return this._mapArrOpponentHeroByStageIndex[stageIndex];
    },

    setOpponentFormationByStageIndex: function (opponentTeam, stageIndex) {
        this._mapArrOpponentHeroByStageIndex[stageIndex] = opponentTeam;
    }

});

mc.IllusionManager.getStageArrayReward = function (illusionStage) {
    var arrItemInfo = [];
    var arrStrReward = illusionStage["reward"]["items"];
    for (var i = 0; i < arrStrReward.length; i++) {
        var strs = arrStrReward[i].split('/');
        var itemInfo = mc.ItemStock.createJsonItemInfo(strs[0], strs[1]);
        arrItemInfo.push(itemInfo);
    }
    return arrItemInfo;
};

mc.IllusionStage = cc.Class.extend({
    monsters: null,
    reward: null,//items
    rewardItems: null,
    stageIndex: null,
    ctor: function (json) {
        if (json) {
            this.monsters = json["monsters"].split("#");
            for (var i = 0; i < this.monsters.length; i++) {
                this.monsters[i] = parseInt(this.monsters[i]);

            }
            this.stageIndex = json["stageIndex"];
            var rewardIllusionDict = mc.dictionary.illusionDict.getDataByStageIndex(this.stageIndex);
            this.reward = json["reward"];
            this.rewardItems = [];
            var arrStrReward = this.reward["items"];
            var tempListRandomReward = []; //lưu tạm reward dang random để push sau cùng layout sau cùng
            for (var i = 0; i < arrStrReward.length; i++) {
                var strs = arrStrReward[i].split('/');
                var itemInfo = mc.ItemStock.createJsonItemInfo(strs[0], strs[1]);
                var listFirstTimeRewards = rewardIllusionDict["firstTimeRewards"];
                for (var j = 0; j < listFirstTimeRewards.length; j++) {
                    var item = listFirstTimeRewards[j];
                    if (item.index === strs[0]) {
                        itemInfo["isFirstTimeReward"] = true;
                    }
                }
                if (itemInfo["isFirstTimeReward"] == true) {
                    this.rewardItems.push(itemInfo);
                } else {
                    tempListRandomReward.push(itemInfo);
                }
            }
            for (var i = 0; i < tempListRandomReward.length; i++) {
                var tempListRandomRewardElement = tempListRandomReward[i];
                this.rewardItems.push(tempListRandomRewardElement);

            }
        }
    }
});

