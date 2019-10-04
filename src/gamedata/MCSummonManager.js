/**
 * Created by long.nguyen on 10/17/2017.
 */
mc.SummonManager = bb.Class.extend({
    _newSummonMapByHeroId: null,
    _ticketNo: 0,
    _msCountDown: 0,

    ctor: function () {
        this._super();
        this._arrSummonHero = [];
        this._newSummonMapByHeroId = {};
    },

    setSummonInfo: function (info) {
        this._ticketNo = info["ticketNo"];
        this._msCountDown = info["countdownTimeMili"];
    },

    getFreeSummonTicketByGroupId: function (groupId) {
        if (groupId === 0) {
            return this._ticketNo;
        }
        return -1;
    },

    getFreeSummonCountdownByGroupId: function (groupId) {
        if (groupId === 0) {
            return this._msCountDown;
        }
        return -1;
    },

    setSummonHeroes: function (arrHero) {
        this._arrSummonHero = arrHero;
        var heroMap = mc.GameData.heroStock.getHeroMap();
        var alvailableHeroMapByIndex = {};
        for (var heroId in heroMap) {
            var heroInfo = heroMap[heroId];
            alvailableHeroMapByIndex[mc.HeroStock.getHeroIndex(heroInfo)] = true;
        }
        for (var i = 0; i < arrHero.length; i++) {
            var heroInfo = arrHero[i];
            if (!alvailableHeroMapByIndex[mc.HeroStock.getHeroIndex(heroInfo)]) {
                this._newSummonMapByHeroId[mc.HeroStock.getHeroId(heroInfo)] = true;
                alvailableHeroMapByIndex[mc.HeroStock.getHeroIndex(heroInfo)] = true;
            } else {
                this._newSummonMapByHeroId[mc.HeroStock.getHeroId(heroInfo)] = false;
            }
        }
        if (this._newSummonMapByHeroId) {
            var arrNewHero = {};
            var arrHeroTemp = [];
            for (var i = 0; i < arrHero.length; i++) {
                var h = arrHero[i];
                var ind = h.index;
                var isExisting = false;
                for (var j = 0; j < arrHeroTemp.length; j++) {
                    var hj = arrHeroTemp[j];
                    if (hj.index === ind) {
                        isExisting = true;
                        break;
                    }
                }
                if (!isExisting) {
                    var tempId = mc.HeroStock.getHeroId(h)
                    if (tempId && this._newSummonMapByHeroId[tempId]) {
                        arrNewHero[tempId] = {isNew: true};
                    }
                }
            }
            var hasUpdate = false;
            for (var i in arrNewHero) {
                if (!mc.storage.newHeroes) {
                    mc.storage.newHeroes = {};
                }
                if (!mc.storage.newHeroes[i]) {
                    mc.storage.newHeroes[i] = arrNewHero[i];
                    hasUpdate = true;
                }
            }
            if (hasUpdate) {
                mc.storage.saveNewHeroes();
                mc.storage.featureNotify.heroesLayerShowed = false;
                mc.storage.saveFeatureNotify();
            }

        }

    },

    setSummonItems: function (arrItem) {
        this._arrSummonItem = arrItem;
    },

    clearSummonData: function () {
        this._arrSummonHero = [];
        this._arrSummonItem = [];
        this._newSummonMapByHeroId = {};
    },

    getArraySummonHero: function () {
        return this._arrSummonHero;
    },

    getArraySummonItem: function () {
        return this._arrSummonItem;
    },

    getHeroSummonWithMaxRank: function () {
        var heroInfo = null;
        if (this._arrSummonHero) {
            var maxRank = 0;
            for (var i = 0; i < this._arrSummonHero.length; i++) {
                var heroInfoSummon = this._arrSummonHero[i];
                if (maxRank < mc.HeroStock.getHeroRank(heroInfoSummon)) {
                    maxRank = mc.HeroStock.getHeroRank(heroInfoSummon);
                    heroInfo = heroInfoSummon;
                }
            }
        }
        return heroInfo;
    },

    isNewSummonHero: function (heroInfo) {
        return this._newSummonMapByHeroId[mc.HeroStock.getHeroId(heroInfo)];
    },

    hasFreeSummonInfo: function () {
        return this._ticketNo != undefined && this._msCountDown != undefined;
    }

});

mc.SummonManager.getArraySummonPackage = function (groupId) {
    if (groupId === undefined) {
        return mc.dictionary.summonPackageMapByIndex;
    }
    var allPackage = mc.dictionary.summonPackageMapByIndex;
    var arr = [];
    for (var key in allPackage) {
        if (allPackage[key].groupId === groupId) {
            arr.push(allPackage[key]);
        }
    }
    return arr;
};

mc.SummonManager.syncSummonCountDown = function (arr) {
    arr = arr || [];
    mc.dictionary.summonCountDownArr = bb.utility.arrayToMap(arr, function (ob) {
        ob["countdownSeconds"] += bb.now() / 1000;
        return ob["packageIndex"];
    });
};

mc.SummonManager.getSummonCountDown = function (index) {
    mc.dictionary.summonCountDownArr = mc.dictionary.summonCountDownArr || {};
    if (mc.dictionary.summonCountDownArr[index]) {
        return mc.dictionary.summonCountDownArr[index]["countdownSeconds"];
    }
    return -1;
};

mc.SummonManager.getSummonPackageByIndex = function (index) {
    var allPackage = mc.dictionary.summonPackageMapByIndex;
    for (var key in allPackage) {
        if (allPackage[key].index === index) {
            return allPackage[key];
        }
    }
    return null;
};
mc.SummonManager.getAllSummonPackageGroup = function () {
    var arr = [];
    var mapByGroupId = {};
    var allPackage = mc.dictionary.summonPackageMapByIndex;
    for (var key in allPackage) {
        var groupId = allPackage[key].groupId;
        if (!mapByGroupId[groupId] && mapByGroupId[groupId] !== 0) {
            arr.push(allPackage[key]);
            mapByGroupId[groupId] = groupId;
        }
    }
    return arr;
};

mc.SummonManager.getSummonOpenTimes = function (pack) {
    return pack.openTimes
};
mc.SummonManager.getSummonPrices = function (pack) {
    var strs = pack.currency.split('/');
    return mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(strs[1]));
};
mc.SummonManager.getSummonTicket = function (pack) {
    var sumTicket = pack["sumTicket"];
    if (sumTicket) {
        var strs = sumTicket.split('/');
        return mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(strs[1]));
    }
};
mc.SummonManager.getSummonPackageGroupId = function (pack) {
    return pack.groupId;
};
mc.SummonManager.getSummonPackageEvent = function (pack) {
    return pack.event;
};
mc.SummonManager.getSummonPackageIndex = function (pack) {
    return pack.index;
};
mc.SummonManager.getSummonPackageImage = function (pack) {
    return pack.packageImage;
};
mc.SummonManager.getDurationSummonFreeInMs = function (pack) {
    var summonManager = mc.GameData.summonManager;
    if (summonManager.getFreeSummonTicketByGroupId(0) <= 0) {
        var durAfterSummonInMs = (bb.now() - summonManager.getFreeSummonCountdownByGroupId(0));
        return pack.countdownSeconds * 1000 - durAfterSummonInMs;
    }
    return -1;
};