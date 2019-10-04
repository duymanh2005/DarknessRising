/**
 * Created by long.nguyen on 5/23/2017.
 */
mc.QuestManager = bb.Class.extend({
    _mapQuestByGroupId: null,

    updateArrQuestGroup: function (arrQuestGroup) {
        if (arrQuestGroup) {
            arrQuestGroup = bb.collection.filterBy(arrQuestGroup, function (questGroup) {
                return questGroup.group !== "combo";
            });
            if (!this._mapQuestByGroupId) {
                this._mapQuestByGroupId = bb.utility.arrayToMap(arrQuestGroup, function (questGroup) {
                    return questGroup.group;
                });
                var mapQuestGroupDict = mc.dictionary.mapQuestGroupById;
                for (var questGroupId in mapQuestGroupDict) {
                    if (!this._mapQuestByGroupId[questGroupId]) { // fill the empty data.
                        this._mapQuestByGroupId[questGroupId] = {};
                        this._mapQuestByGroupId[questGroupId].group = questGroupId;
                        this._mapQuestByGroupId[questGroupId].no = 0;
                    }
                    this._mapQuestByGroupId[questGroupId].isChange = true;
                }
            } else {
                for (var i = 0; i < arrQuestGroup.length; i++) {
                    var questGroup = arrQuestGroup[i];
                    if (questGroup && this._mapQuestByGroupId[questGroup.group]) {
                        if (this._mapQuestByGroupId[questGroup.group].no != questGroup.no) {
                            this._mapQuestByGroupId[questGroup.group].no = questGroup.no;
                            this._mapQuestByGroupId[questGroup.group].isChange = true;
                        }
                    }
                }
            }
        }
    },

    updateArrQuestInfoByGroupId: function (questGroupId, arrQuestInfo) {
        this._mapQuestByGroupId[questGroupId].arrQuestInfo = arrQuestInfo;
        this._mapQuestByGroupId[questGroupId].isChange = true;
    },

    notifyArrQuestInfoByGroupIdChanging: function (questGroupId) {
        this._mapQuestByGroupId[questGroupId].isChange = true;
    },

    isArrayQuestChangingByGroupId: function (questGroupId) {
        return this._mapQuestByGroupId[questGroupId].isChange;
    },

    removeQuestInfoByQuestId: function (questId) {
        if (questId) {
            for (var questGroupId in this._mapQuestByGroupId) {
                var delObj = null;
                var questGroup = this.getQuestGroupById(questGroupId);
                if (questGroup) {
                    var arrQuestInfo = questGroup.arrQuestInfo;
                    if (arrQuestInfo) {
                        delObj = bb.collection.removeBy(arrQuestInfo, function (questInfo, questId) {
                            return mc.QuestManager.getQuestId(questInfo) === questId;
                        }, questId);
                    }
                    if (delObj) {
                        break;
                    }
                }
            }
        }
    },

    getQuestGroupById: function (id) {
        return this._mapQuestByGroupId[id];
    },

    getArrQuestGroup: function () {
        return bb.utility.mapToArray(this._mapQuestByGroupId).sort(function (questGroup1, questGroup2) {
            var questGroupData1 = mc.dictionary.getQuestGroupDataById(questGroup1.group);
            var questGroupData2 = mc.dictionary.getQuestGroupDataById(questGroup2.group);
            return questGroupData1.order - questGroupData2.order;
        });
    },

    getArrayQuestInfoByGroupId: function (questGroupId) {
        return this._mapQuestByGroupId[questGroupId].arrQuestInfo;
    },

    getMapQuestGroup: function () {
        return this._mapQuestByGroupId;
    }

});

mc.QuestManager.getQuestGroupId = function (questGroup) {
    return questGroup.group;
};

mc.QuestManager.getNumberQuestCompleteInGroup = function (questGroup) {
    return questGroup.no;
};

mc.QuestManager.getQuestGroupName = function (questGroup) {
    var questGroupData = mc.dictionary.getQuestGroupDataById(questGroup.group);
    return mc.dictionary.getGUIString(questGroupData.name);
};

mc.QuestManager.getQuestGroupURL = function (questGroup) {
    var questGroupData = mc.dictionary.getQuestGroupDataById(questGroup.group);
    return questGroupData.url;
};

mc.QuestManager.isQuestGroupUnlock = function (questGroup) {
    return questGroup.no >= 0;
};

mc.QuestManager.getQuestIndex = function (questInfo) {
    return questInfo.questIndex;
};

mc.QuestManager.isQuestClaim = function (questInfo) {
    return questInfo["claim"];
};

mc.QuestManager.getQuestId = function (questInfo) {
    return questInfo.id;
};

mc.QuestManager.isQuestSeen = function (questInfo) {
    return questInfo.seen;
};

mc.QuestManager.getQuestGoToCode = function (questInfo) {
    var questDict = mc.dictionary.getQuestDetailByIndex(mc.QuestManager.getQuestIndex(questInfo));
    return questDict.goTo;
};

mc.QuestManager.getArrayReward = function (questInfo) {
    var questDict = mc.dictionary.getQuestDetailByIndex(mc.QuestManager.getQuestIndex(questInfo));
    var arrReward = questDict.itemReward;
    var arrItemInfo = null;
    if (arrReward && arrReward.length > 0) {
        arrItemInfo = [];
        for (var i = 0; i < arrReward.length; i++) {
            var strRewards = arrReward[i].split('/');
            arrItemInfo.push(mc.ItemStock.createJsonItemInfo(parseInt(strRewards[0]), parseInt(strRewards[1])));
        }
    }
    var zenReward = questDict.zenReward;
    if (zenReward > 0) {
        arrItemInfo.push(mc.ItemStock.createJsonItemZen(zenReward));
    }
    return arrItemInfo;
};

mc.QuestManager.getCurrentQuestCount = function (questInfo) {
    return questInfo.count;
};

mc.QuestManager.getRequireQuestCount = function (questInfo) {
    var questDict = mc.dictionary.getQuestDetailByIndex(mc.QuestManager.getQuestIndex(questInfo));
    return questDict.count;
};

mc.QuestManager.getQuestDescription = function (questInfo) {
    var questDict = mc.dictionary.getQuestDetailByIndex(mc.QuestManager.getQuestIndex(questInfo));
    return mc.dictionary.getI18nMsg(questDict.desc);
};

mc.QuestManager.getQuestName = function (questInfo) {
    var questDict = mc.dictionary.getQuestDetailByIndex(mc.QuestManager.getQuestIndex(questInfo));
    return mc.dictionary.getI18nMsg(questDict.name);
};

mc.QuestManager.getQuestTaskType = function (questInfo) {
    return mc.QuestManager.getQuestTaskTypeByIndex(mc.QuestManager.getQuestIndex(questInfo));
};

mc.QuestManager.getQuestTaskTypeByIndex = function (index) {
    var questDict = mc.dictionary.getQuestDetailByIndex(index);
    if (questDict) {
        return questDict.taskType;
    }
    mc.log("questIndex: " + index);
    return null;
};

mc.QuestManager.getQuestTaskObject = function (questInfo) {
    var questDict = mc.dictionary.getQuestDetailByIndex(mc.QuestManager.getQuestIndex(questInfo));
    return questDict.task;
};

mc.QuestManager.CHAPTER = "chapter";
mc.QuestManager.WORLD = "world";
mc.QuestManager.DAILY = "daily";
mc.QuestManager.EVENT = "event";