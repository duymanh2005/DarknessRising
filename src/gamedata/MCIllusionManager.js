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
        cc.log("currStage: " + currStageIndex + ", nextStageIndex: " + nextStageIndex);
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
                cc.log("================== stageIndex: " + nextStageIndex);
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
        this._stages = this.createStages(mc.dictionary.illusionDict.getStages()) || this._stages;
        //this._stages = this.createStages(json["stages"]) || this._stages;
        cc.log("set illusion data =================");
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

        //mc.GameData.teamFormationManager.setupIllusionTeamFormation(this._info);
    },

    claimRewardIllusionStage: function (stageIndex) {
        var currStage = this._mapStagesRecord[stageIndex];
        currStage.clamed = true;
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
            this.monsters = json["monsters"];
            this.stageIndex = json["stageIndex"];
            this.rewardItems = [];
            var arrStrReward = json["rewardItems"];
            var tempListRandomReward = []; //lưu tạm reward dang random để push sau cùng layout sau cùng
            var listFirstTimeRewards = json["firstTimeRewards"];
            for (var i = 0; i < arrStrReward.length; i++) {
                var rewardObj = arrStrReward[i];
                var itemInfo = mc.ItemStock.createJsonItemInfo(rewardObj.index, rewardObj.no);
                for (var j = 0; j < listFirstTimeRewards.length; j++) {
                    var item = listFirstTimeRewards[j];
                    //bo label first time reward set = false
                    if (item.index === rewardObj.index) {
                        itemInfo["isFirstTimeReward"] = false;
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

