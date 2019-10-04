/**
 * Created by long.nguyen on 5/22/2017.
 */
mc.CampaignManger = bb.Class.extend({
    _mapArrStageByChapterIndex: null,
    _arrPreLoadMonsterURL: null,
    _preLoadBrkURL: null,

    ctor: function () {
        this._super();
        this._mapArrStageByChapterIndex = {};
    },

    setArrayStageByChapterIndex: function (chapterIndex, arrStage) {
        if (arrStage) {
            var map = {};
            for (var i = 0; i < arrStage.length; i++) {
                var stage = arrStage[i];
                if (!map[stage.index]) {
                    map[stage.index] = stage;
                }
            }
            arrStage = bb.utility.mapToArray(map);
            arrStage.sort(function (stage1, stage2) {
                return stage1.index - stage2.index;
            });
        }
        this._mapArrStageByChapterIndex[chapterIndex] = arrStage;
    },

    updateStage: function (stage) {
        var stageIndex = mc.CampaignManger.getStageIndex(stage);
        var chapterIndex = mc.CampaignManger.getChapterIndexByStageIndex(stageIndex);
        var arrStage = this._mapArrStageByChapterIndex[chapterIndex];
        if (arrStage) {
            var found = false;
            for (var i = 0; i < arrStage.length; i++) {
                if (mc.CampaignManger.getStageIndex(arrStage[i]) === stageIndex) {
                    arrStage[i] = stage;
                    found = true;
                    break;
                }
            }
            if (!found) {
                !arrStage && (arrStage = []);
                arrStage.push(stage);
                this.setArrayStageByChapterIndex(chapterIndex, arrStage);
            }
        }
        return chapterIndex;
    },

    getStageInfoByStageIndex: function (stageIndex) {
        var chapterIndex = mc.CampaignManger.getChapterIndexByStageIndex(stageIndex);
        if (chapterIndex != null && this._mapArrStageByChapterIndex[chapterIndex]) {
            return bb.collection.findBy(this._mapArrStageByChapterIndex[chapterIndex], function (stageInfo, stageIndex) {
                return stageInfo.index === stageIndex;
            }, stageIndex);
        }
        return null;
    },

    getArrayStageByChapterIndex: function (chapterIndex) {
        var arrStageInfo = null;
        if (this._mapArrStageByChapterIndex[chapterIndex]) {
            arrStageInfo = this._mapArrStageByChapterIndex[chapterIndex];
        }
        //if( chapterIndex === mc.CampaignManger.SPECIAL_CHAP_INDEX ){
        //    if( !arrStageInfo || !arrStageInfo.length ){ // auto generate data
        //        arrStageInfo = [];
        //        var arrChallengeStageDict = mc.dictionary.getArrayStageDictByChapter(mc.CampaignManger.SPECIAL_CHAP_INDEX);
        //        var currChapterIndex = mc.GameData.playerInfo.getCurrentChapterIndex();
        //        for(var c = 0; c <= currChapterIndex; c++ ){
        //            var arrStageDict = mc.dictionary.getArrayStageDictByChapter(c);
        //            if( arrStageDict && arrStageDict.length > 0 ){
        //                var lastStageIndex = mc.CampaignManger.getStageIndex(arrStageDict[arrStageDict.length-1]);
        //                var lastStageInfo = this.getStageInfoByStageIndex(lastStageIndex);
        //                if( lastStageInfo && mc.CampaignManger.isClearStage(lastStageInfo) ){
        //                    arrStageInfo.push({
        //                        chapterIndex: mc.CampaignManger.SPECIAL_CHAP_INDEX,
        //                        clear: false,
        //                        index: mc.CampaignManger.getStageIndex(arrChallengeStageDict[c]),
        //                        mode: "challenge",
        //                        starNo: 0,
        //                        unlock: true
        //                    });
        //                }
        //            }
        //        }
        //        if( !arrStageInfo.length ){
        //            arrStageInfo.push({
        //                chapterIndex: mc.CampaignManger.SPECIAL_CHAP_INDEX,
        //                clear: false,
        //                index: mc.CampaignManger.getStageIndex(arrChallengeStageDict[0]),
        //                mode: "challenge",
        //                starNo: 0,
        //                unlock: true
        //            });
        //        }
        //        this._mapArrStageByChapterIndex[chapterIndex] = arrStageInfo;
        //    }
        //}
        return arrStageInfo;
    },

    updatePreLoadResourceURL: function (stageDict) {
        var arrMonsterNoBoss = bb.collection.filterBy(mc.CampaignManger.getArrayMonsterIndexByStageDict(stageDict), function (monsterIndex) {
            var monsterDict = mc.dictionary.getCreatureDictByIndex(monsterIndex);
            return monsterDict.type != "boss";
        });
        this._arrPreLoadMonsterURL = [];
        var monsterIndex = bb.utility.randomElement(arrMonsterNoBoss);
        this._arrPreLoadMonsterURL.push(monsterIndex);
        cc.arrayRemoveObject(arrMonsterNoBoss, monsterIndex);
        var monsterIndex = bb.utility.randomElement(arrMonsterNoBoss);
        this._arrPreLoadMonsterURL.push(monsterIndex);
        cc.arrayRemoveObject(arrMonsterNoBoss, monsterIndex);

        var arrBrkUrl = (stageDict && stageDict["battleBG"]) ? stageDict["battleBG"].split(',') : ["loren1", "loren2"];
        var urlBrk = "res/png/brk/" + bb.utility.randomElement(arrBrkUrl) + ".png";
        this._preLoadBrkURL = urlBrk;
        return {
            monsters: this._arrPreLoadMonsterURL,
            brk: urlBrk
        };
    },

    getArrPreLoadMonster: function () {
        return this._arrPreLoadMonsterURL;
    },

    getPreLoadBrkURL: function () {
        return this._preLoadBrkURL;
    }

});

mc.CampaignManger.SPECIAL_CHAP_INDEX = 100;

mc.CampaignManger.createUnlockStage = function (stageIndex) {
    return {
        index: stageIndex,
        chapterIndex: mc.CampaignManger.getChapterIndexByStageIndex(stageIndex),
        mode: mc.CampaignManger.getStageModeByStageIndex(stageIndex),
        clear: false,
        starNo: 0,
        unlock: true
    };
};
mc.CampaignManger.getStageIndex = function (stageInfo) {
    return stageInfo.index;
};
mc.CampaignManger.isClearStage = function (stageInfo) {
    return stageInfo.clear;
};
mc.CampaignManger.getSweepTimes = function (stageInfo) {
    return stageInfo.sweepTimes;
};
mc.CampaignManger.getStarNo = function (stageInfo) {
    return stageInfo.starNo;
};
mc.CampaignManger.getChapterIndexByStageIndex = function (stageIndex) {
    var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
    return stageDict ? stageDict.chapterIndex : null;
};
mc.CampaignManger.getStageModeByStageIndex = function (stageIndex) {
    var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
    return stageDict ? stageDict.mode : null;
};
mc.CampaignManger.getArrayUnlockStageByStageIndex = function (stageIndex) {
    var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
    return stageDict ? stageDict.unlockStage.split('#') : null;
};
mc.CampaignManger.getStageNameByStageIndex = function (stageIndex) {
    var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
    return stageDict ? stageDict.name : null;
};
mc.CampaignManger.getUnlockCodeByStageIndex = function (stageIndex) {
    var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
    return stageDict ? stageDict.unlockFunction : null;
};
mc.CampaignManger.getRequiredStageByStageIndex = function(stageIndex){
    var stageMap = mc.dictionary.stageMapByIndex;
    var foundStageDict = null;
    for( var stageId in stageMap ){
        if( stageMap[stageId] ){
            var arrUnlockStage = mc.CampaignManger.getArrayUnlockStageByStageIndex(stageId);
            if( arrUnlockStage ){
                var foundIndex = bb.collection.findBy(arrUnlockStage,function(index,needIndex){
                    return parseInt(index) === needIndex;
                },stageIndex);
                if( foundIndex ){
                    foundStageDict = stageMap[stageId];
                }
            }
        }
    }
    return foundStageDict;
};
mc.CampaignManger.getArrayRewardByStageIndex = function (stageIndex) {
    var stageInfo = mc.GameData.campaignManager.getStageInfoByStageIndex(stageIndex);
    var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
    var arrReward = [];
    var firstTimeReward = stageDict["firstTimeReward"];
    var randomBonus = stageDict["randomBonus"];
    var zen = stageDict["zenReward"];
    if (firstTimeReward && (!stageInfo || !mc.CampaignManger.isClearStage(stageInfo))) {
        var arrFirstTimeReward = mc.ItemStock.createArrJsonItemFromStr(firstTimeReward);
        for (var i = 0; i < arrFirstTimeReward.length; i++) {
            arrFirstTimeReward[i].firstTime = true;
        }
        arrReward = bb.collection.arrayAppendArray(arrReward, arrFirstTimeReward);
    }
    if (randomBonus) {
        arrReward = bb.collection.arrayAppendArray(arrReward, mc.ItemStock.createArrJsonItemFromStr(randomBonus));
    }
    arrReward.push(mc.ItemStock.createJsonItemZen(zen));
    //arrReward = mc.ItemStock.groupItem(arrReward);
    return arrReward;
};

mc.CampaignManger.getMapArrayStageIndexByChapterIndexOf = function (rewardIndex) {
    var mapArrStageIndexByChapterIndex = {};
    var stageMap = mc.dictionary.stageMapByIndex;
    for (var stageIndex in stageMap) {
        var stageDict = stageMap[stageIndex];
        var randomBonus = stageDict["randomBonus"];
        if (randomBonus) {
            var arrRewardDict = mc.ItemStock.createArrJsonItemFromStr(randomBonus);
            for (var r = 0; r < arrRewardDict.length; r++) {
                if (mc.ItemStock.getItemIndex(arrRewardDict[r]) === rewardIndex) {
                    var chapterIndex = mc.CampaignManger.getChapterIndexByStageIndex(parseInt(stageIndex));
                    if (!mapArrStageIndexByChapterIndex[chapterIndex]) {
                        mapArrStageIndexByChapterIndex[chapterIndex] = [];
                    }
                    mapArrStageIndexByChapterIndex[chapterIndex].push(stageIndex);
                }
            }
        }
    }
    return mapArrStageIndexByChapterIndex;
};
mc.CampaignManger.getArrayMonsterIndexByStageDict = function (stageDict) {
    return stageDict.monsters;
};
mc.CampaignManger.getStaminaCostByStageDict = function (stageDict) {
    return stageDict.staminaCost;
};
mc.CampaignManger.getMonsterCountMapByStageIndex = function (stageIndex) {
    var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
    return stageDict.monsterCountMap;
};