/**
 * Created by long.nguyen on 10/18/2017.
 */
mc.QuestTrigger = bb.Class.extend({
    _mapTracingQuestByTaskType: null,

    updateArrTracingQuest: function (arrQuest) {
        if (!this._mapTracingQuestByTaskType) {
            this._mapTracingQuestByTaskType = {};
        }
        for (var i = 0; i < arrQuest.length; i++) {
            var questInfo = arrQuest[i];
            var taskType = mc.QuestManager.getQuestTaskType(questInfo);
            if (!this._mapTracingQuestByTaskType[taskType]) {
                this._mapTracingQuestByTaskType[taskType] = [];
            }
            if (!mc.QuestManager.isQuestClaim(questInfo)) {
                this._mapTracingQuestByTaskType[taskType].push(questInfo);
            }
        }
    },

    _iterateQuestByTaskType: function (taskType, callback, param) {
        var arrQuestByTaskType = this._mapTracingQuestByTaskType[taskType];
        if (arrQuestByTaskType) {
            bb.utility.arrayTraverse(arrQuestByTaskType, callback, param)
        }
    },

    removeTracingQuestByIndex: function (questIndex) {
        var taskType = mc.QuestManager.getQuestTaskType(questIndex);
        var arrQuestByTaskType = this._mapTracingQuestByTaskType[taskType];
        if (arrQuestByTaskType) {
            for (var i = 0; i < arrQuestByTaskType.length; i++) {
                if (mc.QuestManager.getQuestIndex(arrQuestByTaskType[i]) === questIndex) {
                    arrQuestByTaskType.splice(i, 1);
                    break;
                }
            }
        }
    },

    triggerFinishStage: function (stage, isWin) {
        if (isWin) {
            this.triggerKillMonsters(stage.getMonsterCountMap());
        } else {
        }
    },

    triggerFinishArena: function () {

    },

    triggerFinishBloodCastle: function () {

    },

    triggerKillMonsters: function (monsterCountMap) {
        for (var monsterIndex in monsterCountMap) {
            monsterIndex = parseInt(monsterIndex);
            var numMonster = monsterCountMap[monsterIndex];
            this._iterateQuestByTaskType(mc.QuestTrigger.TASK_TYPE_KILL, function (questInfo) {
                var idTaskObj = parseInt(mc.QuestManager.getQuestTaskObject(questInfo));
                if (idTaskObj === monsterIndex) {
                    mc.protocol.finishQuest(mc.QuestManager.getQuestId(questInfo), numMonster);
                }
            });
        }
    },

    triggerLevelUpHero: function (heroLevelMap) {

    },

    triggerSetUpHero: function (heroIndex) {

    },

    triggerClickButton: function (buttonId) {

    },

    triggerKillHero: function (heroIndex, value) {
        value = value || 1;

    }

});
mc.QuestTrigger.TASK_TYPE_KILL = 1;
mc.QuestTrigger.TASK_TYPE_LEVEL_UP = 1;
mc.QuestTrigger.TASK_TYPE_WIN = 1;