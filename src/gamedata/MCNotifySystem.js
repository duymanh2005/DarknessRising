/**
 * Created by long.nguyen on 8/15/2017.
 */

var IAP_NOTIFY_INTERVAL = 1000 * 10;
var IAP_NOTIFY_RESET_INTERVAL = 1000 * 20;

mc.NotifySystem = bb.Class.extend({
    _summonNotificationByGroup: null,
    _summonNotificationByEvent: null,
    _equipmentNotificationByHeroId: null,
    _equipmentLevelUpNotificationById: null,
    _shardUpNotificationById: null,
    _involveNotificationByHeroId: null,
    _questCompleteNotification: null,

    _heroIdByClassAndRank: null,
    _lockItemNotification: true,
    shouldFilterHeroClassAndGroup: true,
    _sysMessage: [],
    _isNewInAppPackage: false,

    ctor: function () {
        this._super();
        var arrId = mc.dictionary.getAllInAppItemIdActive();
        mc.storage.readFeatureNotify();
        mc.storage.readNewHeroes();
        mc.storage.readNewItems();
        mc.storage.readItemTabTouched();
        if (!mc.storage.itemTabTouched) {
            mc.storage.itemTabTouched = {};
        }
        if (!mc.storage.newItems) {
            mc.storage.newItems = {};
        }
        if (mc.storage.featureNotify.arrInAppId) {
            for (var i in arrId) {
                var isOld = false;
                for (var j in mc.storage.featureNotify.arrInAppId) {
                    if (i === j) {
                        isOld = true;
                        break;
                    }
                }
                if (!isOld) {
                    this._isNewInAppPackage = true;
                    break;
                }
            }
        } else {
            mc.storage.featureNotify.arrInAppId = bb.utility.cloneJSON(arrId);
            for (var i in arrId) {
                mc.storage.featureNotify.arrInAppId[i]["isShowed"] = false;
            }
            this._isNewInAppPackage = true;
            mc.storage.saveFeatureNotify();
        }
        var lastTime = mc.storage.featureNotify.lastTimeShowSummonEvent;
        if (!lastTime) {
            lastTime = 0;
        }
        if (bb.now() - lastTime > 24 * 60 * 60 * 1000) {
            this._summonNotificationByEvent = true;
        }
    },

    touchSummon: function(){
        if(this._summonNotificationByEvent) {
            this._summonNotificationByEvent = false;
            mc.storage.featureNotify["lastTimeShowSummonEvent"] = bb.now();
            mc.storage.saveFeatureNotify();
        }
    },

    buildAllNotificationAboutItem: function () {
        this.buildHeroEquipmentNotification();
        this.buildHeroInvolveNotification();
        this.buildEquipmentLvlupNotification();
        this.buildItemCraftingNotification();
        this.buildEquipmentAddOptionNotification();
        this.buildShardUpNotificationById();
    },

    updateCurrInApp: function () {
        var arrId = mc.dictionary.getAllInAppItemIdActive();
        var tempArrInAppId = bb.utility.cloneJSON(mc.storage.featureNotify.arrInAppId);
        var isNeedUpdate = false;
        for (var i in arrId) {
            var isHas = false;
            for (var j in mc.storage.featureNotify.arrInAppId) {
                if (i === j) {
                    isHas = true;
                    break;
                }
            }
            if (!isHas) {
                tempArrInAppId[i] = {};
                tempArrInAppId[i]["isShowed"] = false;
                isNeedUpdate = true;
            }
        }
        if (isNeedUpdate) {
            mc.storage.featureNotify.arrInAppId = tempArrInAppId;
            mc.storage.saveFeatureNotify();
        }
        this._isNewInAppPackage = false;
    },

    hasNewInAppPackage: function () {
        return this._isNewInAppPackage;
    },

    lockItemNotification: function (lock) {
        this._lockItemNotification = lock;
    },

    _checkSummonNotify: function (pack) {
        var summonTicket = mc.SummonManager.getSummonTicket(pack);
        if (summonTicket) {
            return mc.GameData.playerInfo.getAsset(summonTicket.index) >= summonTicket["no"];
        }
    },

    hasIapNotify: function () {
        var iapNotifyData = mc.storage.readIapNotify();
        for (var i in iapNotifyData) {
            if (this.checkIapNotify(i))
                return true;
        }
        return false;
    },

    checkIapNotify: function (pack) {
        if (!pack)
            return false;
        var iapNotifyData = mc.storage.readIapNotify();
        if (iapNotifyData[pack]) {
            if ((bb.now() > iapNotifyData[pack])) {
                if (bb.now() > iapNotifyData[pack] + IAP_NOTIFY_RESET_INTERVAL) {
                    iapNotifyData[pack] = bb.now() + IAP_NOTIFY_INTERVAL;
                    mc.storage.saveIapNotify();
                    return true;
                }
                return false;
            } else {
                return true;
            }
        } else {
            iapNotifyData[pack] = bb.now() + IAP_NOTIFY_INTERVAL;
            mc.storage.saveIapNotify();
            return true;
        }
    },


    resetIapNotify: function (pack) {
        if (!pack)
            return;
        var iapNotifyData = mc.storage.readIapNotify();
        iapNotifyData[pack] = bb.now();
        mc.storage.saveIapNotify();
        return true;
    },

    buildSummonNotificationByGroup: function () {
        this._summonNotificationByGroup = {};
        var allSummonPackageGroup = mc.SummonManager.getArraySummonPackage();
        for (var i in allSummonPackageGroup) {
            var summonPack = allSummonPackageGroup[i];
            if (this._checkSummonNotify(summonPack)) {
                if (!this._summonNotificationByGroup[summonPack["groupId"]]) {
                    this._summonNotificationByGroup[summonPack["groupId"]] = {};
                }
                this._summonNotificationByGroup[summonPack["groupId"]][summonPack["index"]] = summonPack;
            }
        }
    },

    buildHeroEquipmentNotification: function () {
        this._equipmentNotificationByHeroId = null;
        var itemStock = mc.GameData.itemStock;
        var heroStock = mc.GameData.heroStock;

        var mapArrEquipmentNoOwnerBySlotId = {};
        var _splitArrItemBySlotId = function (slotId, index, itemInfo) {
            var arrEquip = mapArrEquipmentNoOwnerBySlotId[slotId];
            if (!arrEquip) {
                arrEquip = [];
                mapArrEquipmentNoOwnerBySlotId[slotId] = arrEquip;
            }
            arrEquip.push(itemInfo);
        };
        var _filterEquipmentNoOwner = function (itemInfo) {
            if (mc.ItemStock.isItemEquipment(itemInfo) && mc.ItemStock.getHeroIdEquipping(itemInfo) === null) {
                var arrEnableSlot = mc.ItemStock.getItemEquipSlots(itemInfo);
                bb.utility.arrayTraverse(arrEnableSlot, _splitArrItemBySlotId, itemInfo);
            }
        };
        bb.utility.mapTraverse(itemStock.getItemMap(), _filterEquipmentNoOwner);

        for (var slotId in mapArrEquipmentNoOwnerBySlotId) {
            var arrEquip = mapArrEquipmentNoOwnerBySlotId[slotId];
            arrEquip.sort(mc.ItemStock.compareByPower);
        }

        var heroList = heroStock.getHeroList();
        for (var h = 0; h < heroList.length; h++) {
            var heroInfo = heroList[h];
            for (var slotId in mapArrEquipmentNoOwnerBySlotId) {
                var arrEquipment = mapArrEquipmentNoOwnerBySlotId[slotId];
                for (var e = 0; e < arrEquipment.length; e++) {
                    var bestEquipment = arrEquipment[e];
                    if (mc.ItemStock.isItemAvailableForHero(bestEquipment, heroInfo) && mc.ItemStock.getItemRequireHeroRank(bestEquipment) <= mc.HeroStock.getHeroRank(heroInfo)) {
                        var heroId = mc.HeroStock.getHeroId(heroInfo);
                        var currEquipment = itemStock.getEquipmentByHeroId(heroId, slotId);
                        if (!currEquipment || mc.ItemStock.compareByPower(currEquipment, bestEquipment) > 0) {
                            if (!this._equipmentNotificationByHeroId) {
                                this._equipmentNotificationByHeroId = {};
                            }
                            if (!this._equipmentNotificationByHeroId[heroId]) {
                                this._equipmentNotificationByHeroId[heroId] = {};
                            }
                            this._equipmentNotificationByHeroId[heroId][slotId] = mc.ItemStock.getItemId(bestEquipment);
                            break;
                        }
                    }
                }
            }
        }
        return this._equipmentNotificationByHeroId;
    },

    filterHeroIdByClassGroupAndRank: function () {
        var heroStock = mc.GameData.heroStock;
        var mapHeroIdByClassGroupAndRank = {};
        var heroMap = heroStock.getHeroMap();
        for (var heroId in heroMap) {
            var heroInfo = heroMap[heroId];
            var classGroup = mc.HeroStock.getHeroClassGroup(heroInfo);
            var nextRank = mc.HeroStock.getHeroRank(heroInfo) + 1;
            if (nextRank <= mc.const.MAX_HERO_RANK) {
                var recipeId = classGroup + "/" + nextRank;
                if (!mapHeroIdByClassGroupAndRank[recipeId]) {
                    mapHeroIdByClassGroupAndRank[recipeId] = [];
                }
                mapHeroIdByClassGroupAndRank[recipeId].push(heroId);
            }
        }
        this._heroIdByClassAndRank = mapHeroIdByClassGroupAndRank;
    },

    buildHeroInvolveNotification: function () {
        this._involveNotificationByHeroId = null;
        var playerInfo = mc.GameData.playerInfo;
        var itemStock = mc.GameData.itemStock;

        if (!this._heroIdByClassAndRank || this.shouldFilterHeroClassAndGroup) {
            this.filterHeroIdByClassGroupAndRank();
        }
        var mapHeroIdByClassGroupAndRank = this._heroIdByClassAndRank;

        var allRecipe = mc.dictionary.getAllRecipeInvolveHero();
        for (var recipeId in allRecipe) {
            var recipe = allRecipe[recipeId];
            var recipeZenCost = mc.dictionary.getRecipeZenCost(recipe);
            var recipeMapItem = mc.dictionary.getRecipeMaterialMap(recipe);
            if (playerInfo.getZen() >= recipeZenCost) {
                var isValid = true;
                for (var itemIndex in recipeMapItem) {
                    itemIndex = parseInt(itemIndex);
                    var itemRecipe = recipeMapItem[itemIndex];
                    var itemInStock = itemStock.getOverlapItemByIndex(itemIndex);
                    var currItemQuantity = itemInStock ? mc.ItemStock.getItemQuantity(itemInStock) : 0;
                    if (currItemQuantity < mc.ItemStock.getItemQuantity(itemRecipe)) {
                        isValid = false;
                        break;
                    }
                }
                if (isValid) {
                    var arrHeroId = mapHeroIdByClassGroupAndRank[recipeId];
                    if (arrHeroId) {
                        for (var h = 0; h < arrHeroId.length; h++) {
                            var heroId = arrHeroId[h];
                            var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
                            var extendMaterial = mc.dictionary.getExtendInvolveHeroMaterial(mc.HeroStock.getHeroRank(heroInfo), mc.HeroStock.getHeroElement(heroInfo));
                            if (!extendMaterial || mc.ItemStock.isEnoughMaterial(mc.ItemStock.createJsonItemByStr(extendMaterial))) { // if has 'extend recipe'
                                if (!this._involveNotificationByHeroId) {
                                    this._involveNotificationByHeroId = {};
                                }
                                this._involveNotificationByHeroId[heroId] = true;
                            }
                        }
                    }
                }
            }
        }

        return this._involveNotificationByHeroId;
    },

    buildQuestGroupNotification: function () {
        this._questCompleteNotification = null;
        var mapQuestGroup = mc.GameData.questManager.getMapQuestGroup();
        for (var gid in mapQuestGroup) {
            var questGroup = mapQuestGroup[gid];
            var num = mc.QuestManager.getNumberQuestCompleteInGroup(questGroup);
            if (num > 0) {
                if (!this._questCompleteNotification) {
                    this._questCompleteNotification = {};
                }
                this._questCompleteNotification[gid] = questGroup;
            }
        }
        return this._questCompleteNotification;
    },

    buildFriendNotification: function (noNewFriend, noNewRequestMakeFriend) {
        this._noNewFriend = noNewFriend;
        this._noNewRequestMakeFriend = noNewRequestMakeFriend;
    },

    buildEquipmentLvlupNotification: function () {
        this._equipmentLevelUpNotificationById = null;
        var itemInfoMap = mc.GameData.itemStock.getItemMap();
        for (var itemId in itemInfoMap) {
            var itemInfo = itemInfoMap[itemId];
            if (mc.ItemStock.isItemEquipment(itemInfo)) {
                var recipe = mc.dictionary.getRecipeLvlUpItem(itemInfo);
                if (recipe) {
                    var recipeMaterialMap = mc.dictionary.getRecipeMaterialMap(recipe);
                    var strRecipeCost = mc.dictionary.getRecipeCost(recipe);
                    if (strRecipeCost) {
                        var arrCost = mc.ItemStock.createArrJsonItemFromStr(strRecipeCost);
                        var isEnoughCost = mc.ItemStock.isEnoughManyCosts(arrCost);
                        if (isEnoughCost) {
                            var isSatisfy = true;
                            for (var itemIndex in recipeMaterialMap) {
                                var materialRequired = recipeMaterialMap[itemIndex];
                                var materialIndex = mc.ItemStock.getItemIndex(materialRequired);
                                var materialInStock = mc.GameData.itemStock.getOverlapItemByIndex(materialIndex);

                                var numInStock = materialInStock ? mc.ItemStock.getItemQuantity(materialInStock) : 0;
                                var numInRequired = mc.ItemStock.getItemQuantity(materialRequired);

                                if (numInStock < numInRequired) {
                                    isSatisfy = false;
                                    break;
                                }
                            }
                            if (isSatisfy) {
                                !this._equipmentLevelUpNotificationById && (this._equipmentLevelUpNotificationById = {});
                                this._equipmentLevelUpNotificationById[itemId] = recipe;
                            }
                        }
                    }
                }

            }
        }
        return this._equipmentLevelUpNotificationById;
    },

    buildShardUpNotificationById: function () {
        this._shardUpNotificationById = null;
        var itemInfoMap = mc.GameData.itemStock.getItemMap();
        for (var itemId in itemInfoMap) {
            var itemInfo = itemInfoMap[itemId];
            var itemType = mc.ItemStock.getItemType(itemInfo);
            if (itemType === mc.const.ITEM_TYPE_SOUL && mc.ItemStock.getItemQuantity(itemInfo) >= 100) {
                !this._shardUpNotificationById && (this._shardUpNotificationById = {});
                this._shardUpNotificationById[mc.ItemStock.getItemId(itemInfo)] = itemInfo;
            }
        }
        return this._shardUpNotificationById;
    },

    _getCraftingRecipeEnableBy: function (itemInfo) {
        var recipe = mc.ItemStock.getCraftingRecipe(itemInfo);
        var isSatisfy = false;
        if (recipe) {
            isSatisfy = true;
            var arrMaterial = mc.ItemStock.createArrJsonItemFromStr(recipe, function (materialInfo, strs) {
                if (strs && strs.length > 2 && materialInfo) {
                    materialInfo.level = parseInt(strs[2]);
                }
            });
            for (var m = 0; m < arrMaterial.length; m++) {
                var materialInfo = arrMaterial[m];
                var indexRequired = mc.ItemStock.getItemIndex(materialInfo);
                var numRequired = mc.ItemStock.getItemQuantity(materialInfo);
                var numInStock = 0;
                if (indexRequired === mc.const.ITEM_INDEX_ZEN) {
                    numInStock = mc.GameData.playerInfo.getZen();
                } else {
                    if (mc.ItemStock.isItemEquipment(materialInfo)) {
                        var numLvlRequired = mc.ItemStock.getItemLevel(materialInfo);
                        var arrEquip = mc.GameData.itemStock.getArrayItemByIndex(indexRequired);
                        if (arrEquip && arrEquip.length > 0) {
                            arrEquip = bb.collection.filterBy(arrEquip, function (itInfo, numLvlRequired) {
                                return mc.ItemStock.getItemLevel(itInfo) >= numLvlRequired;
                            }, numLvlRequired);
                        }
                        numInStock = arrEquip ? arrEquip.length : 0;
                    } else {
                        var itemInStock = mc.GameData.itemStock.getOverlapItemByIndex(indexRequired);
                        if (itemInStock) {
                            numInStock = mc.ItemStock.getItemQuantity(itemInStock)
                        }
                    }
                }
                if (numInStock < numRequired) {
                    isSatisfy = false;
                    break;
                }
            }
        }
        return isSatisfy ? recipe : null;
    },

    buildItemCraftingNotification: function () {
        this._itemCraftingNotificationByIndex = null;
        var equipmentMapByIndex = mc.dictionary.equipmentMapByIndex;
        var consumableMapByIndex = mc.dictionary.consumableMapByIndex;
        for (var itemIndex in  equipmentMapByIndex) {
            var recipe = this._getCraftingRecipeEnableBy(equipmentMapByIndex[itemIndex]);
            if (recipe) {
                !this._itemCraftingNotificationByIndex && (this._itemCraftingNotificationByIndex = {});
                this._itemCraftingNotificationByIndex[itemIndex] = recipe;
            }
        }
        for (var itemIndex in  consumableMapByIndex) {
            var recipe = this._getCraftingRecipeEnableBy(consumableMapByIndex[itemIndex]);
            if (recipe) {
                !this._itemCraftingNotificationByIndex && (this._itemCraftingNotificationByIndex = {});
                this._itemCraftingNotificationByIndex[itemIndex] = recipe;
            }
        }
        return this._itemCraftingNotificationByIndex;
    },

    buildEquipmentAddOptionNotification: function () {
        this._equipmentAddOptionsNotificationByIndex = null;
        var equipmentMapByIndex = mc.dictionary.equipmentMapByIndex;
        for (var itemIndex in  equipmentMapByIndex) {
            var recipe = mc.ItemStock.getAddOptionRecipe(equipmentMapByIndex[itemIndex]);
            if (recipe) {
                var arrMaterial = mc.ItemStock.createArrJsonItemFromStr(recipe);
                var isSatisfy = true;
                for (var m = 0; m < arrMaterial.length; m++) {
                    var materialInfo = arrMaterial[m];
                    var indexRequired = mc.ItemStock.getItemIndex(materialInfo);
                    var numRequired = mc.ItemStock.getItemQuantity(materialInfo);
                    var numInStock = 0;
                    if (indexRequired === mc.const.ITEM_INDEX_BLESS) {
                        numInStock = mc.GameData.playerInfo.getBless();
                    } else {
                        if (mc.ItemStock.isItemEquipment(materialInfo)) {
                            var arrEquip = mc.GameData.itemStock.getArrayItemByIndex(indexRequired);
                            var numOkEquip = 0;
                            for (var e = 0; e < arrEquip.length; e++) {
                                if (mc.ItemStock.getItemLevel(arrEquip[e]) >= 11) {
                                    numOkEquip++;
                                }
                            }
                            numInStock = numOkEquip;
                        } else {
                            var itemInStock = mc.GameData.itemStock.getOverlapItemByIndex(indexRequired);
                            if (itemInStock) {
                                numInStock = mc.ItemStock.getItemQuantity(itemInStock)
                            }
                        }
                    }
                    if (numInStock < numRequired) {
                        isSatisfy = false;
                        break;
                    }
                }
                if (isSatisfy) {
                    !this._equipmentAddOptionsNotificationByIndex && (this._equipmentAddOptionsNotificationByIndex = {});
                    this._equipmentAddOptionsNotificationByIndex[itemIndex] = recipe;
                }
            }
        }
        return this._equipmentAddOptionsNotificationByIndex;
    },

    doHaveDailyGiftNotification: function () {
        return mc.GameData.giftEventManager.getDailyGiftCount() > 0;
    },

    doHaveArenaBattleLog: function () {
        return mc.GameData.arenaManager.getNotifyCount() > 0;
    },

    doHaveMail: function () {
        return mc.GameData.mailManager.getNotifyCount() > 0;
    },

    checkEmptyObject: function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    },

    doHaveFreeSummonPackage: function (groupID) {
        if (groupID === undefined) {
            return (this._summonNotificationByGroup && !this.checkEmptyObject(this._summonNotificationByGroup));
        }
        return (this._summonNotificationByGroup && !this.checkEmptyObject(this._summonNotificationByGroup[groupID]));
    },
    doHaveFreeSummonPackageByIndex: function (groupID, index) {
        if (index === undefined) {
            return;
        }
        return (this._summonNotificationByGroup && this._summonNotificationByGroup[groupID] && this._summonNotificationByGroup[groupID][index]);
    },

    haveSummonNotificationByEvent: function(){
      return this._summonNotificationByEvent;
    },

    getEquipmentLevelUpNotification: function () {
        return this._equipmentLevelUpNotificationById;
    },
    getShardUpNotification: function () {
        return this._shardUpNotificationById;
    },

    getItemCraftingNotification: function () {
        return this._itemCraftingNotificationByIndex;
    },

    getEquipmentAddOptionNotification: function () {
        return this._equipmentAddOptionsNotificationByIndex;
    },

    getQuestCompleteNotification: function () {
        return this._questCompleteNotification;
    },

    doHaveNewFriend: function () {
        return this._noNewFriend > 0;
    },

    doHaveNewRequestMakeFriend: function () {
        return this._noNewRequestMakeFriend > 0;
    },

    doHaveFriendSolo: function () {
        return mc.GameData.friendSoloManager.getNotifyCount() > 0;
    },

    doHaveAds: function () {
        var refreshFee = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionPriceByCode(mc.const.REFRESH_FUNCTION_ADS);
        if (refreshFee && bb.pluginBox.ads.isAvailable()) {
            return true;
        }
        return false;
    },

    _doHaveChallengeNotification: function (indexChallenge) {
        indexChallenge = indexChallenge || 0;
        var allChallengeGroup = mc.GameData.challengeManager.getAllChallengeGroup();
        var challengeGroup = allChallengeGroup[indexChallenge];
        var numChance = challengeGroup["chance"];
        return numChance;
    },

    doHaveDragonChallengeNotification: function () {
        return this._doHaveChallengeNotification(0);
    },

    doHaveWizardChallengeNotification: function () {
        return this._doHaveChallengeNotification(1);
    },

    doHaveRabbitChallengeNotification: function () {
        return this._doHaveChallengeNotification(2);
    },

    doHaveWorldBossFightChance: function () {
        return mc.GameData.worldBossSystem.getTicketNo() > 0;
    },

    getHeroInvolveNotification: function () {
        return this._involveNotificationByHeroId;
    },

    getHeroEquipmentNotification: function () {
        return this._equipmentNotificationByHeroId;
    },

    addSysMessage: function (msg) {
        this._sysMessage.push(msg);
    },

    popSysMessage: function () {
        return this._sysMessage.pop();
    },
    countSysMessage: function () {
        return this._sysMessage.length;
    }


});
