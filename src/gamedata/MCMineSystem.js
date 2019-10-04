/**
 * Created by long.nguyen on 3/6/2018.
 */
mc.MineSystem = bb.Class.extend({
    _miningChapterIndex: -1,
    _miningTimeMs: -1,
    _arrMiningObject: null,
    _arrMiningHeroId: null,
    _isInit: false,

    initMining: function (mineInfo) {
        this._arrMiningHeroId = [];
        this._arrMiningObject = [];
        this._isInit = true;
        if (mineInfo) {
            var chapterIndex = this._miningChapterIndex = mineInfo["chapterIndex"];
            var mineTime = mineInfo["miningTime"];
            chapterIndex < 0 && (chapterIndex = 0);

            var miningRule = mc.dictionary.getMiningRuleByChapterIndex(chapterIndex);
            var mineZen = new mc.MiningObject(mc.MiningObject.TYPE_ZEN, miningRule["mSeconds"], miningRule["miningZenPerMSeconds"], miningRule["maxZen"]);
            var mineExp = new mc.MiningObject(mc.MiningObject.TYPE_EXP, miningRule["mSeconds"], miningRule["miningExpPerMSeconds"], miningRule["maxExp"]);
            var mineItem = new mc.MiningItemObject(mc.MiningObject.TYPE_ITEM,
                [miningRule["lSeconds1"], miningRule["lSeconds2"], miningRule["lSeconds3"], miningRule["lSeconds4"]],
                [miningRule["miningItemPerLSeconds1"], miningRule["miningItemPerLSeconds2"], miningRule["miningItemPerLSeconds3"], miningRule["miningItemPerLSeconds4"]],
                miningRule["maxItem"]);
            this._arrMiningObject = [mineZen, mineExp, mineItem];
            this._arrMiningHeroId = this.updateMiningHeroes();
            this._miningTimeMs = mineTime;
            if (this.isMining()) {
                for (var i = 0; i < this._arrMiningObject.length; i++) {
                    this._arrMiningObject[i].startMining(this._miningTimeMs);
                }
                for (var i = 0; i < this._arrMiningHeroId.length; i++) {
                    var heroInfo = mc.GameData.heroStock.getHeroById(this._arrMiningHeroId[i]);
                    if (heroInfo) {
                        this._addBonusByHeroRank(mc.HeroStock.getHeroRank(heroInfo));
                    }
                }
            }
        }
    },

    startMining: function (mineInfo) {
        var chapterIndex = this._miningChapterIndex = mineInfo["chapterIndex"];
        var miningMs = mineInfo["miningTime"];
        var heroIds = mineInfo["heroIds"];
        this._miningTimeMs = miningMs;
        if (heroIds != undefined) {
            this._arrMiningHeroId = heroIds;
        }
        for (var i = 0; i < this._arrMiningObject.length; i++) {
            this._arrMiningObject[i].startMining(miningMs);
        }
    },

    stopMining: function () {
        this._miningTimeMs = -1;
        this.clearAllTempMiningHero();
        for (var i = 0; i < this._arrMiningObject.length; i++) {
            this._arrMiningObject[i].stopMining();
        }
    },

    updateMiningHeroes: function () {
        var arrHeroIds = mc.GameData.teamFormationManager.getTeamFormationByIndex(mc.TeamFormationManager.TEAM_CAMPAIGN, 0);
        var arr = [];
        for (var i = 0; i < arrHeroIds.length; i++) {
            if (arrHeroIds[i] > 0) {
                arr.push(arrHeroIds[i]);
            }
        }
        this._arrMiningHeroId = arr;
        return arr;
    },

    collectMining: function (mineInfo) {
        this.startMining(mineInfo);
    },

    getMiningChapterIndex: function () {
        return this._miningChapterIndex;
    },

    isInit: function () {
        return this._isInit;
    },

    isMining: function () {
        return this._miningTimeMs >= 0;
    },

    addMiningHero: function (heroInfo) {
        var found = false;
        for (var i = 0; i < this._arrMiningHeroId.length; i++) {
            if (this._arrMiningHeroId[i] === mc.HeroStock.getHeroId(heroInfo)) {
                found = true;
                break;
            }
        }
        if (!found) {
            this._arrMiningHeroId.push(mc.HeroStock.getHeroId(heroInfo));
            this._addBonusByHeroRank(mc.HeroStock.getHeroRank(heroInfo));
        }
    },

    _addBonusByHeroRank: function (rank) {
        var bonusList = mc.dictionary.getMiningBonusListByHeroRank(rank);
        for (var i = 0; i < this._arrMiningObject.length; i++) {
            var miningObj = this._arrMiningObject[i];
            if (miningObj.getType() === mc.MiningObject.TYPE_ZEN) {
                miningObj.adjustDeltaMaxValue(Math.round(bonusList["bonusZenPercent"] / 100 * miningObj.getMaxProductionValue()));
            } else if (miningObj.getType() === mc.MiningObject.TYPE_EXP) {
                miningObj.adjustDeltaMaxValue(Math.round(bonusList["bonusExpPercent"] / 100 * miningObj.getMaxProductionValue()));
            } else if (miningObj.getType() === mc.MiningObject.TYPE_ITEM) {
                miningObj.adjustDeltaMaxValue(bonusList["bonusMaxItem"]);
                miningObj.adjustDeltaProductionDuration(-bonusList["bonusItemTimeSeconds"]);
            }
        }
    },

    removeMiningHero: function (heroInfo) {
        var found = false;
        for (var i = 0; i < this._arrMiningHeroId.length; i++) {
            if (this._arrMiningHeroId[i] === mc.HeroStock.getHeroId(heroInfo)) {
                this._arrMiningHeroId.splice(i, 1);
                found = true;
                break;
            }
        }
        if (found) {
            this._removeBonusByHeroRank(mc.HeroStock.getHeroRank(heroInfo))
        }
    },

    _removeBonusByHeroRank: function (rank) {
        var bonusList = mc.dictionary.getMiningBonusListByHeroRank(rank);
        for (var i = 0; i < this._arrMiningObject.length; i++) {
            var miningObj = this._arrMiningObject[i];
            if (miningObj.getType() === mc.MiningObject.TYPE_ZEN) {
                miningObj.adjustDeltaMaxValue(-Math.round(bonusList["bonusZenPercent"] / 100 * miningObj.getMaxProductionValue()));
            } else if (miningObj.getType() === mc.MiningObject.TYPE_EXP) {
                miningObj.adjustDeltaMaxValue(-Math.round(bonusList["bonusExpPercent"] / 100 * miningObj.getMaxProductionValue()));
            } else if (miningObj.getType() === mc.MiningObject.TYPE_ITEM) {
                miningObj.adjustDeltaMaxValue(-bonusList["bonusMaxItem"]);
                miningObj.adjustDeltaProductionDuration(bonusList["bonusItemTimeSeconds"]);
            }
        }
    },

    clearAllTempMiningHero: function () {
        if (!this.isMining()) {
            for (var i = 0; i < this._arrMiningHeroId.length; i++) {
                var heroInfo = mc.GameData.heroStock.getHeroById(this._arrMiningHeroId[i]);
                if (heroInfo) {
                    this._removeBonusByHeroRank(mc.HeroStock.getHeroRank(heroInfo));
                }
            }
            this._arrMiningHeroId = [];
        }
    },

    getArrayMiningHeroId: function () {
        if (!this._arrMiningHeroId) {
            this._arrMiningHeroId = [];
        }
        return cc.copyArray(this._arrMiningHeroId);
    },

    getMineEXP: function () {
        return this.getMineObjectById(mc.MiningObject.TYPE_EXP);
    },

    getMineZen: function () {
        return this.getMineObjectById(mc.MiningObject.TYPE_ZEN);
    },

    getMineItem: function () {
        return this.getMineObjectById(mc.MiningObject.TYPE_ITEM);
    },

    getMineObjectById: function (id) {
        var allMineObj = this.getAllMiningObjects();
        var mineObj = null;
        for (var i = 0; i < allMineObj.length; i++) {
            var miningObject = allMineObj[i];
            if (miningObject.getType() === id) {
                mineObj = miningObject;
                break;
            } else if (miningObject.getType() === id) {
                mineObj = miningObject;
                break;
            } else if (miningObject.getType() === id) {
                mineObj = miningObject;
                break;
            }
        }
        return mineObj;
    },

    getAllMiningObjects: function () {
        return this._arrMiningObject;
    }

});

mc.MiningObject = cc.Class.extend({
    _msStartMine: -1,
    _deltaMaxVal: 0,
    _deltaProductionDur: 0,
    _deltaProductionVal: 0,

    ctor: function (type, productionDuration, productionValue, maxProductionValue) {
        this._type = type;
        this._productionDur = productionDuration;
        this._productionValue = productionValue;
        this._maxProductionVal = maxProductionValue;
    },

    adjustDeltaMaxValue: function (deltaMaxProductionVal) {
        this._deltaMaxVal += deltaMaxProductionVal;
    },

    adjustDeltaProductionDuration: function (deltaProductionDur) {
        this._deltaProductionDur += deltaProductionDur;
    },

    adjustDeltaProductionValue: function (deltaProductionVal) {
        this._deltaProductionVal += deltaProductionVal;
    },

    startMining: function (ms) {
        this._msStartMine = ms;
    },

    stopMining: function () {
        this._msStartMine = -1;
    },

    getType: function () {
        return this._type;
    },

    getMaxProductionValue: function () {
        return this._maxProductionVal;
    },

    getTotalMaxProductionValue: function () {
        return this._maxProductionVal + this._deltaMaxVal;
    },

    getTotalProductionDuration: function () {
        return this._productionDur + this._deltaProductionDur;
    },

    getAllProductionValue: function () {
        if (this._msStartMine > 0) {
            var durS = (mc.GameData.svNow() - this._msStartMine) / 1000;
            durS < 0 && (durS = 0);
            var productionVal = this._productionValue + this._deltaProductionVal;
            var productionDur = this.getTotalProductionDuration();
            var maxVal = this.getTotalMaxProductionValue();
            var totalProductionVal = (durS / productionDur) * productionVal;
            if (totalProductionVal >= maxVal) {
                return maxVal;
            }
            return Math.floor(totalProductionVal / productionVal) * productionVal;
        }
        return 0;
    }

});

mc.MiningObject.TYPE_ITEM = 1;
mc.MiningObject.TYPE_ZEN = 2;
mc.MiningObject.TYPE_EXP = 3;

mc.MiningItemObject = mc.MiningObject.extend({
    _arrOfArrMiningItemSpec: null,

    ctor: function (type, arrProductionDuration, arrProductionValue, maxProductionValue) {
        this._super(type, arrProductionDuration, arrProductionValue, maxProductionValue);
        this._arrOfArrMiningItemSpec = [];
        for (var pv = 0; pv < arrProductionValue.length; pv++) {
            var arrStrItem = arrProductionValue[pv].split('#');
            var arrItemMining = [];
            for (var i = 0; i < arrStrItem.length; i++) {
                var arr = arrStrItem[i].split('%');
                var index = parseInt(arr[0]);
                arr = arr[1].split('$');
                var successRate = parseInt(arr[0]);
                var maxNo = parseInt(arr[1]);
                arrItemMining.push({
                    index: mc.CreatureInfo.encryptNumber(index),
                    maxNo: mc.CreatureInfo.encryptNumber(maxNo),
                    baseSuccessRate: mc.CreatureInfo.encryptNumber(successRate),
                    successRate: successRate
                });
            }
            this._arrOfArrMiningItemSpec.push(arrItemMining);
        }

    },

    getArrayMiningItem: function () {
        return this._arrOfArrMiningItemSpec[0];
    },

    getTotalProductionDuration: function () {
        return this._productionDur[0];
    },

    getAllProductionValue: function () {
        if (this._msStartMine > 0) {
            var durS = (mc.GameData.svNow() - this._msStartMine) / 1000;
            durS < 0 && (durS = 0);
            var productionDur = this._productionDur[0];
            var maxVal = this._maxProductionVal;
            var randObj = new bb.Random(this._msStartMine);

            // reset success rate.
            var cloneArrOffArrMiningItemSpec = [];
            for (var m = 0; m < this._arrOfArrMiningItemSpec.length; m++) {
                var arrItemMiningSpec = this._arrOfArrMiningItemSpec[m];
                var arr = [];
                cloneArrOffArrMiningItemSpec.push(arr);
                for (var j = 0; j < arrItemMiningSpec.length; j++) {
                    var itemMiningSpec = arrItemMiningSpec[j];
                    itemMiningSpec.successRate = mc.CreatureInfo.decryptNumber(itemMiningSpec.baseSuccessRate);
                    arr.push(itemMiningSpec);
                }
            }
            if (productionDur <= 0) {
                productionDur = 1;
            }
            var mapGotItemInfoByIndex = {};
            if (durS >= productionDur) {
                var arrTime = [];
                for (var p = 0; p < this._productionDur.length; p++) {
                    arrTime.push(this._productionDur[p] / 60);
                }
                var times = Math.floor(durS / productionDur);
                var maxT = (60 * 60 * 24 * 7) / productionDur; // 1 week
                times = Math.min(times, maxT);
                var t = 1;
                var no = 0;
                var s = 0;
                while (t <= times && no < maxVal && s < cloneArrOffArrMiningItemSpec.length) {
                    if (t % arrTime[3] === 0) {
                        s = 3;
                    } else if (t % arrTime[2] === 0) {
                        s = 2;
                    } else if (t % arrTime[1] === 0) {
                        s = 1;
                    } else {
                        s = 0;
                    }
                    var isSuccess = false;
                    var arrItemMiningSpec = cloneArrOffArrMiningItemSpec[s];
                    if (arrItemMiningSpec.length > 0) {
                        isSuccess = false;
                        var itemMiningSpec = bb.utility.randomElement(arrItemMiningSpec, randObj);
                        var itemIndex = mc.CreatureInfo.decryptNumber(itemMiningSpec["index"]);
                        var maxNo = mc.CreatureInfo.decryptNumber(itemMiningSpec["maxNo"]);
                        var baseSuccessRate = mc.CreatureInfo.decryptNumber(itemMiningSpec["baseSuccessRate"]);
                        var percent = bb.utility.randomInt(1, 100, randObj);
                        var successRate = itemMiningSpec.successRate;
                        if (percent <= successRate) {
                            no++;
                            if (!mapGotItemInfoByIndex[itemIndex]) {
                                mapGotItemInfoByIndex[itemIndex] = mc.ItemStock.createJsonItemInfo(itemIndex, 1);
                            } else {
                                mapGotItemInfoByIndex[itemIndex].no += 1;
                            }
                            if (mapGotItemInfoByIndex[itemIndex].no === maxNo) {
                                cc.arrayRemoveObject(arrItemMiningSpec, itemMiningSpec);
                            } else {
                                itemMiningSpec.successRate = baseSuccessRate;
                            }
                            isSuccess = true;
                        } else {
                            itemMiningSpec.successRate += baseSuccessRate;
                        }
                    }
                    t++;
                }
            }

            return bb.utility.mapToArray(mapGotItemInfoByIndex);
        }
        return null;
    }

});

