/**
 * Created by long.nguyen on 5/17/2017.
 */
mc.StageInBattle = mc.AbstractInBattle.extend({
    _arrCreatureIndex: null,
    _mapMonsterTakeZenById: null,
    _mapMonsterTakeItemById: null,

    setBattleData: function (json) {
        this._isEnd = false;
        this._mapCountdownUsingByItemId = {};
        this._mapQuantityUsingByItemId = {};
        this._mapMonsterInfoCreatureById = {};
        this._arrOwnerCreatureInfo = [];
        var battleRound = this._arrBattleRound = json["round"];
        this._currentRound = mc.const.CHEAT_LAST_ROUND ? battleRound.length - 1 : 0;
        this._stageId = json["stgid"];
        this._newFriend = json["newFriend"];
        this.setMaxBattleDurationInMs(mc.const.MAX_BATTLE_DURATION_IN_MS);
        var chapterIndex = mc.CampaignManger.getChapterIndexByStageIndex(this._stageId);
        if( chapterIndex === mc.CampaignManger.SPECIAL_CHAP_INDEX){
            this.setMaxBattleDurationInMs(mc.const.MAX_BATTLE_WORD_CHALLENGE_DURATION_IN_MS);
        }
        var items = json["items"];
        var itemBonus = json["items_bonus"];
        var rewardGold = 0;

        this._mapCreatureByIndex = {};
        var arrMissionMonster = json["monsters"];
        var arrHeroInfo = json["script"]["heroes"];
        var arrMonsterInfo = json["script"]["monsters"];
        if (mc.const.TEST_CREATURE_BY_CAMPAIGN) {
            for (var i = 0; i < arrMissionMonster.length; i++) {
                arrMissionMonster[i].index = mc.const.TEST_CREATURE_BY_CAMPAIGN;
            }
            for (var i = 0; i < arrMonsterInfo.length; i++) {
                arrMonsterInfo[i].index = mc.const.TEST_CREATURE_BY_CAMPAIGN;
                arrMonsterInfo[i] = bb.utility.cloneJSON(mc.dictionary.getCreatureDictByIndex(arrMonsterInfo[i].index));
            }
        }
        var mapMonsterInfoByIndex = bb.utility.arrayToMap(arrMonsterInfo, function (monsterInfo) {
            return mc.HeroStock.getHeroIndex(monsterInfo);
        });

        this.setArrayHeroInfoPartIn(arrHeroInfo);
        this.setArrayOpponentInfoPartIn(arrMonsterInfo);

        var maxPowerMonsterId = null;
        var maxPower = 0;
        var mapAllMonsterById = {};
        for (var i = 0; i < arrMissionMonster.length; i++) {
            var id = arrMissionMonster[i].id;
            var index = arrMissionMonster[i].index;
            var monsterInfo = mapMonsterInfoByIndex[index];
            var infoCreature = new mc.CreatureInfo().copyMonsterInfo(monsterInfo, id);
            this._mapMonsterInfoCreatureById[id] = infoCreature;
            this._mapCreatureByIndex[index] = index;
            mapAllMonsterById[id] = id;
            var power = mc.HeroStock.getMonsterBattlePower(monsterInfo);
            if (power > maxPower) {
                maxPower = power;
                maxPowerMonsterId = id;
            }
        }
        for (var i = 0; i < arrHeroInfo.length; i++) {
            var heroInfo = arrHeroInfo[i];
            var index = mc.HeroStock.getHeroIndex(heroInfo);
            var infoCreature = new mc.CreatureInfo().copyHeroInfo(heroInfo);
            this._mapCreatureByIndex[index] = index;
            this._arrOwnerCreatureInfo.push(infoCreature);
        }

        this._currDropZen = 0;
        this._mapMonsterTakeZenById = {};
        this._mapMonsterTakeItemById = {};

        var totalZen = this.getZenReward();
        totalZen += rewardGold;
        totalZen = totalZen < 1000 ? 1000 : totalZen;
        var zenPrice = Math.max(50, Math.floor(totalZen / 2000) * 100);
        var numZenForBoss = (Math.floor(totalZen / (3 * zenPrice))) * zenPrice;
        var currDropZen = 0;
        //zen and reward for boss.
        while (currDropZen < numZenForBoss) {
            var zen = zenPrice;
            currDropZen += zen;
            if (!this._mapMonsterTakeZenById[maxPowerMonsterId]) {
                this._mapMonsterTakeZenById[maxPowerMonsterId] = [];
            }
            this._mapMonsterTakeZenById[maxPowerMonsterId].push(zen);
        }

        var arrMonsterId = bb.utility.mapToArray(mapAllMonsterById);
        var _dealAnItemForAMonster = function (monsterId, itemInfo) {
            if (!this._mapMonsterTakeItemById[monsterId]) {
                this._mapMonsterTakeItemById[monsterId] = [];
            }
            this._mapMonsterTakeItemById[monsterId].push(itemInfo);
            cc.arrayRemoveObject(arrMonsterId, monsterId);
        }.bind(this);

        if (items) {
            if( this.isDealItemForPerRound() && items[0] && cc.isArray(items[0]) ){
                for (var i = 0; i < items.length; i++) {
                    var arrItem = items[i];
                    for(var a = 0; a < arrItem.length; a++ ){
                        (i < battleRound.length) && _dealAnItemForAMonster(bb.utility.randomElement(battleRound[i]),arrItem[a]);
                    }
                }
            }
            else{
                _dealAnItemForAMonster(maxPowerMonsterId, items[0]);
                for (var i = 1; i < items.length; i++) {
                    _dealAnItemForAMonster(bb.utility.randomElement(arrMonsterId), items[i]);
                }
            }
        }

        // zen and reward for once monster per round.
        var numZenForPerRound = (Math.floor((totalZen - numZenForBoss) / (battleRound.length * zenPrice))) * zenPrice;
        var roundIndex = 0;
        while (currDropZen < totalZen) {
            var arrMonsId = battleRound[roundIndex];
            var currDropZenPerRound = 0;
            while (currDropZenPerRound < numZenForPerRound &&
            currDropZen < totalZen) {
                var monsterId = bb.utility.randomElement(arrMonsId);
                var zen = zenPrice;
                currDropZenPerRound += zen;
                currDropZen += zen;
                if (!this._mapMonsterTakeZenById[monsterId]) {
                    this._mapMonsterTakeZenById[monsterId] = [];
                }
                this._mapMonsterTakeZenById[monsterId].push(zen);
            }
            roundIndex++;
            if (roundIndex >= battleRound.length) {
                roundIndex = bb.utility.randomInt(battleRound.length - 1);
            }
        }

        if( itemBonus ){
            for (var i = 0; i < itemBonus.length; i++) {
                _dealAnItemForAMonster(bb.utility.randomElement(arrMonsterId), itemBonus[i]);
            }
        }

        var stageDict = mc.dictionary.getStageDictByIndex(this.getStageId());
        var arrBrkUrl = (stageDict && stageDict["battleBG"]) ? stageDict["battleBG"].split(',') : ["loren1", "loren2"];
        var bgKey = bb.utility.randomElement(arrBrkUrl);
        this.setBackgroundURL("res/png/brk/" + bgKey + ".png");
        this.setCanRetry(true);
    },

    getArrayAllCreatureIndex: function () {
        return bb.utility.mapToArray(this._mapCreatureByIndex);
    },

    updateHeroInfoFromBattle: function (arrCreature) {
        this._arrOwnerCreatureInfo = [];
        for (var i = 0; i < arrCreature.length; i++) {
            var creature = arrCreature[i];
            var info = creature.toInfo();
            this._arrOwnerCreatureInfo.push(info);
        }
    },

    getZenReward: function () {
        var stageDict = mc.dictionary.getStageDictByIndex(this.getStageId());
        return stageDict ? stageDict["zenReward"] : 0;
    },

    getStageId: function () {
        return this._stageId;
    },

    getReplaceHeroIdBySlotId: function () {
        if (this._newFriend) {
            var map = {};
            map[this._newFriend["slotId"]] = this._newFriend["heroId"];
            return map;
        }
        return null;
    },

    getNewFriendInfo: function () {
        return this._newFriend;
    },

    getFriendHeroInfoById: function (id) {
        var friendHeroInfo = null;
        for (var i = 0; i < this._arrOwnerCreatureInfo.length; i++) {
            if (this._arrOwnerCreatureInfo[i].id === id) {
                friendHeroInfo = this._arrOwnerCreatureInfo[i];
                break;
            }
        }
        return friendHeroInfo;
    },

    getMonsterCountMap: function () {
        return mc.CampaignManger.getMonsterCountMapByStageIndex(this.getStageId());
    },

    getArrayOwnerCreatureInfo: function () {
        return this._arrOwnerCreatureInfo;
    },

    getMonsterByIndex: function (id) {
        return this._mapMonsterInfoCreatureById[id];
    },

    getCurrentRoundData: function () {
        return this._arrBattleRound[this._currentRound];
    },

    getNumberOfRound: function () {
        return this._arrBattleRound.length;
    },

    getCurrentRoundIndex: function () {
        return this._currentRound;
    },

    dropZen: function (monsterId) {
        var arrDropZen = this._mapMonsterTakeZenById[monsterId];
        if (arrDropZen) {
            for (var i = 0; i < arrDropZen.length; i++) {
                this._currDropZen += arrDropZen[i];
            }
        }
        this._mapMonsterTakeZenById[monsterId] = null;
        return arrDropZen;
    },

    dropItem: function (monsterId) {
        var arrItem = this._mapMonsterTakeItemById[monsterId];
        this._mapMonsterTakeItemById[monsterId] = null;
        return arrItem;
    },

    getCurrentDropZen: function () {
        return this._currDropZen;
    },

    isAMonsterBossRound: function () {
        var isBossRound = false;
        var arrMonsterId = this._arrBattleRound[this._currentRound];
        for (var i = 0; i < arrMonsterId.length; i++) {
            var monsterCreatureInfo = this._mapMonsterInfoCreatureById[arrMonsterId[i]];
            var monsterDict = mc.dictionary.getCreatureDictByIndex(monsterCreatureInfo.resourceId);
            if (monsterDict && monsterDict.type === "boss") {
                isBossRound = true;
                break;
            }
        }
        return isBossRound;
    },

    nextRound: function () {
        this._currentRound++;
        if (this._currentRound >= this._arrBattleRound.length) {
            this._currentRound = this._arrBattleRound.length;
            return true;
        }
        return false;
    },

    haveAChest: function () {
        return true;
    },

    haveABoss: function () {
        return true;
    },

    isPvP: function () {
        return false;
    },

    isUsedItem: function () {
        return true;
    },

    isSupportX3: function () {
        return true;
    },

    isDealItemForPerRound:function(){
        return false;
    },

    isInLastRound: function () {
        return this._currentRound >= this._arrBattleRound.length;
    },

    createBattleFieldRefactor: function (randomSeed) {
        return mc.GameLogicFactory.createBattleForStage(this,mc.TeamFormationManager.TEAM_CAMPAIGN, true);
    },

    createBattleViewRefactor: function () {
        return mc.GameLogicFactory.createBattleForStage(this,mc.TeamFormationManager.TEAM_CAMPAIGN);
    }

});