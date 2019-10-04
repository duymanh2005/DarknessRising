/**
 * Created by long.nguyen on 5/16/2017.
 */
mc.ItemStock = bb.Class.extend({
    _listArrNewCommingItem: null,
    _mapConsumableIdBySlotId: null,

    _itemInVaultMap: null,
    _arrItemChangeListener: null,
    _isPauseItemChangeListener: false,

    ctor: function () {
        this._super();
        this._itemMap = {};
        this._mapItemsByOwnerId = {};
        this._listArrNewCommingItem = [];
        this._itemInVaultMap = {};
        this._arrItemChangeListener = [];
    },

    setPauseItemChangeListener: function (isPause) {
        this._isPauseItemChangeListener = isPause;
    },

    registerItemChangeListener: function (listener) {
        cc.arrayRemoveObject(this._arrItemChangeListener, listener);
        this._arrItemChangeListener.push(listener);
    },

    unRegisterItemChangeListener: function (listener) {
        cc.arrayRemoveObject(this._arrItemChangeListener, listener);
    },

    _callWillChangeItemInfo: function (itemInfo) {
        if (!this._isPauseItemChangeListener) {
            for (var i = 0; i < this._arrItemChangeListener.length; i++) {
                var lis = this._arrItemChangeListener[i];
                lis && lis.onWillChangeItemInfo && lis.onWillChangeItemInfo(itemInfo);
            }
        }
    },

    _callDidChangeItemInfo: function (itemInfo) {
        if (!this._isPauseItemChangeListener) {
            for (var i = 0; i < this._arrItemChangeListener.length; i++) {
                var lis = this._arrItemChangeListener[i];
                lis && lis.onDidChangeItemInfo && lis.onDidChangeItemInfo(itemInfo);
            }
        }
    },

    pushArrayNewComingItem: function (arrItem) {
        this._listArrNewCommingItem.push(arrItem);
    },

    popArrayNewComingItem: function () {
        if (this._listArrNewCommingItem.length > 0) {
            var arrItem = this._listArrNewCommingItem[0];
            this._listArrNewCommingItem.splice(0, 1);
            return arrItem;
        }
        return null;
    },

    initMapConsumableIdBySlotId: function () {
        var mapConsumableIdBySlotId = mc.storage.readConsumableSlotMap();
        var isEmpty = !mapConsumableIdBySlotId ? true : false;
        if (mapConsumableIdBySlotId) {
            for (var slotId in mapConsumableIdBySlotId) {
                if (mapConsumableIdBySlotId[slotId]) {
                    var itemInfo = this.getItemById(mapConsumableIdBySlotId[slotId]);
                    if (mc.ItemStock.getItemQuantity(itemInfo) > 0) {
                        isEmpty = false;
                        break;
                    }
                }
            }
        }
        if (isEmpty) {
            var curMapConsumableIdBySlot = {};
            var arrConsumableInStock = mc.GameData.itemStock.getItemList(function (itemInfo) {
                return mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_POTION;
            });
            for (var i = 0; i < 4; i++) {
                var item = arrConsumableInStock[i];
                if (item) {
                    curMapConsumableIdBySlot[i] = mc.ItemStock.getItemId(item);
                }
            }
            this._mapConsumableIdBySlotId = curMapConsumableIdBySlot;
        } else {
            this._mapConsumableIdBySlotId = mapConsumableIdBySlotId;
        }
        return this._mapConsumableIdBySlotId;
    },

    setupInventory: function (arrItem) {
        for (var i = 0; i < arrItem.length; i++) {
            var itemInfo = arrItem[i];
            this._itemInVaultMap[mc.ItemStock.getItemId(itemInfo)] = itemInfo;
        }
    },

    putInVault: function (itemInfo) {
        if (mc.ItemStock.isItemCofferState(itemInfo)) {
            itemInfo.no = 0;
            this._itemInVaultMap[mc.ItemStock.getItemId(itemInfo)] = itemInfo;
            this.updateItem(itemInfo);
        }
    },

    popOutVault: function (itemId) {
        var itemInfo = this._itemInVaultMap[itemId];
        if (itemInfo && mc.ItemStock.isItemCofferState(itemInfo)) {
            itemInfo.no = 1;
            delete this._itemInVaultMap[itemId];
            this.updateItem(itemInfo);
        }
        return itemInfo;
    },

    getFromVault: function (itemId) {
        return this._itemInVaultMap[itemId];
    },

    isEmptyVault: function () {
        return this._itemInVaultMap ? JSON.stringify(this._itemInVaultMap) === "{}" : true;
    },

    getArrayItemsInVault: function () {
        var arr = bb.utility.mapToArray(this._itemInVaultMap);
        arr = bb.utility.arrayFilter(arr, function (itemInfo) {
            return mc.ItemStock.isItemCofferState(itemInfo);
        });
        return arr;
    },

    setupConsumableSlots: function (mapConsumableIdBySlotId) {
        this._mapConsumableIdBySlotId = mapConsumableIdBySlotId;
        mc.storage.saveConsumableSlotMap(this._mapConsumableIdBySlotId);
    },

    getMapConsumableIdBySlotId: function () {
        return this._mapConsumableIdBySlotId;
    },

    _checkAllSlotEmpty: function (map) {
        mc.log("_checkAllSlotEmpty");
        for (var i in map) {
            if (map[i]) {
                return false;
            }
        }
        return true;
    },

    updateItem: function (itemInfo, getChange) {
        this._callWillChangeItemInfo(itemInfo);
        var noChange = 0;
        if (itemInfo && mc.ItemStock.getItemType(itemInfo) != mc.const.ITEM_TYPE_CURRENCY) {
            if (itemInfo.no > 0) {
                if (this._itemMap[itemInfo.id]) {
                    noChange = itemInfo.no - this._itemMap[itemInfo.id].no;
                } else {
                    noChange = itemInfo.no;
                }
                this._itemMap[itemInfo.id] = itemInfo;
                this._addItemConstraint(itemInfo);
            } else {
                noChange = 0;
                this._itemMap[itemInfo.id] = null;
                delete this._itemMap[itemInfo.id];
            }
        }
        this._callDidChangeItemInfo(itemInfo);
        return getChange ? mc.ItemStock.createJsonItemInfo(itemInfo.index, noChange, itemInfo.id) : null;
    }
    ,

    removeItem: function (itemInfo) {
        if (itemInfo) {
            var itemId = mc.ItemStock.getItemId(itemInfo);
            if (itemId) {
                var currItemInfo = this.getItemById(itemId);
                currItemInfo.no -= itemInfo.no;
                this.updateItem(currItemInfo);
            }
        }
    }
    ,

    _addItemConstraint: function (itemInfo) {
        var isAdd = false;
        if (mc.ItemStock.isItemEquipment(itemInfo)) {
            var ownItemHeroId = mc.ItemStock.getHeroIdEquipping(itemInfo);
            if (ownItemHeroId) {
                var itemMapBySlotId = this._mapItemsByOwnerId[ownItemHeroId];
                if (!itemMapBySlotId) {
                    itemMapBySlotId = {};
                    this._mapItemsByOwnerId[ownItemHeroId] = itemMapBySlotId;
                }
                itemMapBySlotId[mc.ItemStock.getEquippingSlotIndex(itemInfo)] = itemInfo;
                isAdd = true;
            }
        }
        return isAdd;
    }
    ,

    _removeItemConstraint: function (itemInfo) {
        var isRemove = false;
        if (mc.ItemStock.isItemEquipment(itemInfo)) {
            var equipSlotId = mc.ItemStock.getEquippingSlotIndex(itemInfo);
            var heroId = mc.ItemStock.getHeroIdEquipping(itemInfo);
            var mapSlot = this._mapItemsByOwnerId[heroId];
            if (mapSlot && mapSlot[equipSlotId]) {
                mapSlot[equipSlotId] = null;
                isRemove = true;
            }
        }
        return isRemove;
    }
    ,

    updateArrayItem: function (items, getChangeList, skipCheckNewItem) {
        var arrItemChange = [];
        bb.utility.arrayTraverse(items, function (itemInfo) {
            var changeItem = this.updateItem(itemInfo, getChangeList, skipCheckNewItem);
            changeItem && arrItemChange.push(changeItem);
        }.bind(this));
        if (!this._isPauseItemChangeListener) {
            var notifySystem = mc.GameData.notifySystem;
            notifySystem.buildAllNotificationAboutItem();
            notifySystem.notifyDataChanged();
        }
        return arrItemChange;
    }
    ,

    getItemById: function (id) {
        return this._itemMap[id];
    }
    ,

    getOverlapItemByIndex: function (index) {
        if (index === mc.const.ITEM_INDEX_BLESS) {
            return mc.ItemStock.createJsonItemInfo(index, mc.GameData.playerInfo.getBless());
        } else if (index === mc.const.ITEM_INDEX_ZEN) {
            return mc.ItemStock.createJsonItemInfo(index, mc.GameData.playerInfo.getZen());
        } else if (index === mc.const.ITEM_INDEX_FRIEND_POINTS) {
            return mc.ItemStock.createJsonItemInfo(index, mc.GameData.playerInfo.getFriendPoint());
        } else if (index === mc.const.ITEM_INDEX_CHAOS_COINS) {
            return mc.ItemStock.createJsonItemInfo(index, mc.GameData.playerInfo.getChaosCoins());
        } else if (index === mc.const.ITEM_INDEX_ARENA_COINS) {
            return mc.ItemStock.createJsonItemInfo(index, mc.GameData.playerInfo.getArenaCoins());
        } else if (index === mc.const.ITEM_INDEX_RELIC_COIN) {
            return mc.ItemStock.createJsonItemInfo(index, mc.GameData.playerInfo.getRelicCoin());
        }
        var retItemInfo = null;
        for (var itemId in this._itemMap) {
            var itemInfo = this._itemMap[itemId];
            if (itemInfo.index === index) {
                retItemInfo = itemInfo;
                break;
            }
        }
        return retItemInfo;
    }
    ,

    getArrayItemByIndex: function (index) {
        var arrItemInfo = [];
        for (var itemId in this._itemMap) {
            var itemInfo = this._itemMap[itemId];
            if (itemInfo.index === index) {
                arrItemInfo.push(itemInfo);
            }
        }
        return arrItemInfo;
    }
    ,

    getItemList: function (filterFunc) {
        var arr = bb.utility.mapToArray(this._itemMap);
        if (filterFunc) {
            arr = bb.utility.arrayFilter(arr, filterFunc);
        }
        return arr;
    }
    ,

    getItemMap: function (filterFunc) {
        if (filterFunc) {
            return bb.utility.mapFilter(this._itemMap, filterFunc);
        }
        return this._itemMap;
    }
    ,

    getEquipmentByHeroId: function (heroId, slotId) {
        var mapEquipping = this.getMapEquippingItemByHeroId(heroId);
        if (mapEquipping) {
            return mapEquipping[parseInt(slotId)];
        }
        return null;
    }
    ,

    getMapEquippingItemByHeroId: function (heroId) {
        heroId = parseInt(heroId);
        return this._mapItemsByOwnerId[heroId];
    }
    ,

    equipItemIdForHeroId: function (itemId, slotIndex, heroId) {
        var itemInfo = this.getItemById(itemId);
        itemInfo.heroId = heroId;
        itemInfo.slotIndex = slotIndex;
        this._addItemConstraint(itemInfo);
        return itemInfo;
    }
    ,

    unequipItemId: function (itemId) {
        var itemInfo = this.getItemById(itemId);
        this._removeItemConstraint(itemInfo);
        itemInfo.heroId = null;
        itemInfo.slotIndex = null;
        return itemInfo;
    }

});
mc.ItemStock.createJsonItemByStr = function (str, c) {
    str = str || "11905/1000000000";
    c = c || '/';
    var strs = str.split(c);
    return mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(strs[1]));
};
mc.ItemStock.isNotEnoughCost = function (costInfo) {
    var itemIndex = mc.ItemStock.getItemIndex(costInfo);
    var itemQuantity = mc.ItemStock.getItemQuantity(costInfo);
    if (itemIndex === mc.const.ITEM_INDEX_BLESS) {
        return itemQuantity > mc.GameData.playerInfo.getBless();
    } else if (itemIndex === mc.const.ITEM_INDEX_ZEN) {
        return itemQuantity > mc.GameData.playerInfo.getZen();
    } else if (itemIndex === mc.const.ITEM_INDEX_STAMINA) {
        return itemQuantity > mc.GameData.playerInfo.getStamina();
    } else if (itemIndex === mc.const.ITEM_INDEX_CHAOS_COINS) {
        return itemQuantity > mc.GameData.playerInfo.getChaosCoins();
    } else if (itemIndex === mc.const.ITEM_INDEX_ARENA_COINS) {
        return itemQuantity > mc.GameData.playerInfo.getArenaCoins();
    } else if (itemIndex === mc.const.ITEM_INDEX_FRIEND_POINTS) {
        return itemQuantity > mc.GameData.playerInfo.getFriendPoint();
    } else if (itemIndex === mc.const.ITEM_INDEX_ARENA_TICKET) {
        return itemQuantity > mc.GameData.playerInfo.getArenaTicket();
    } else if (itemIndex === mc.const.ITEM_INDEX_RELIC_COIN) {
        return itemQuantity > mc.GameData.playerInfo.getRelicCoin();
    } else if (itemIndex === mc.const.ITEM_INDEX_GUILD_COIN) {
        return itemQuantity > mc.GameData.playerInfo.getGuildCoin();
    }
    else if( itemIndex === mc.const.ITEM_INDEX_BLOODSTONE ){
        return itemQuantity > mc.GameData.playerInfo.getBloodStone();
    } else if( itemIndex === mc.const.ITEM_INDEX_ICE_CREAM){
        return itemQuantity > mc.GameData.playerInfo.getIceCream();
    }
    //else if (itemIndex === mc.const.ITEM_INDEX_LIFEORB) {
    //    var itemInStock = mc.GameData.itemStock.getOverlapItemByIndex(mc.const.ITEM_INDEX_LIFEORB);
    //    return itemQuantity > (itemInStock ? mc.ItemStock.getItemQuantity(itemInStock) : 0);
    //}
    else if (itemIndex === mc.const.ITEM_INDEX_RAID_TICKET) {
        var itemInStock = mc.GameData.itemStock.getOverlapItemByIndex(mc.const.ITEM_INDEX_RAID_TICKET);
        return itemQuantity > (itemInStock ? mc.ItemStock.getItemQuantity(itemInStock) : 0);
    }
    return false;
};

mc.ItemStock.isEnoughManyCosts = function (arrCost) {
    var isEnough = true;
    for (var i = 0; i < arrCost.length; i++) {
        if (mc.ItemStock.isNotEnoughCost(arrCost[i])) {
            isEnough = false;
            break;
        }
    }
    return isEnough;
};
mc.ItemStock.isEnoughMaterial = function (materialItem) {
    var itemInStock = mc.GameData.itemStock.getOverlapItemByIndex(mc.ItemStock.getItemIndex(materialItem));
    var currItemQuantity = itemInStock ? mc.ItemStock.getItemQuantity(itemInStock) : 0;
    if (currItemQuantity >= mc.ItemStock.getItemQuantity(materialItem)) {
        return true;
    }
    return false;
};
mc.ItemStock.createJsonItemInfo = function (index, no, id) {
    return {index: index, no: no != undefined ? no : 1, id: id};
};
mc.ItemStock.createJsonItemZen = function (no) {
    return mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_ZEN, no);
};
mc.ItemStock.createJsonItemHeroSoul = function (id, heroInfo) {
    var itemInfo = mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_HEROSOUL);
    itemInfo.id = id;
    itemInfo.heroInfo = heroInfo;
    return itemInfo;
};
mc.ItemStock.createJsonItemBox = function (arrItemInfo) {
    var itemInfo = mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_BOX);
    itemInfo.value = arrItemInfo;
    return itemInfo;
};
mc.ItemStock.createArrJsonItemFromStr = function (strOrArr, parseCb) {
    var arrStr = cc.isString(strOrArr) ? strOrArr.split('#') : strOrArr;
    var arrItem = [];
    for (var i = 0; i < arrStr.length; i++) {
        var strs = arrStr[i].split('/');
        var itemInfo = mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(strs[1]));
        arrItem.push(itemInfo);
        parseCb && parseCb(itemInfo, strs);
    }
    return arrItem;
};
mc.ItemStock.createJsonItemFromStr = function (str) {
    if (str) {
        var strs = str.split('/');
        return mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(strs[1]));
    }
    return null;
};
mc.ItemStock.createArrJsonItemPackFromStr = function (strOrArr) {
    var arrStr = cc.isString(strOrArr) ? strOrArr.split('#') : strOrArr;
    var arrItem = [];
    for (var i = 0; i < arrStr.length; i++) {
        var strs = arrStr[i].split('/');
        var nextStr = strs[1].split("^");
        var items = mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(nextStr[0]));
        items.remainPacks = nextStr[1] || 0;
        arrItem.push(items);
    }
    return arrItem;
};
mc.ItemStock.groupItem = function (arrItem) {
    var itemMap = {};
    var arrItemInfo = [];
    for (var i = 0; i < arrItem.length; i++) {
        var itemInfo = arrItem[i];
        if (!itemMap[itemInfo.index]) {
            itemMap[itemInfo.index] = mc.ItemStock.createJsonItemInfo(itemInfo.index, itemInfo.no);
            arrItemInfo.push(itemMap[itemInfo.index]);
        } else {
            itemMap[itemInfo.index].no += itemInfo.no;
        }
    }
    return arrItemInfo;
};
mc.ItemStock.getTotalQuantityByItemArray = function (arrItem) {
    if (cc.isArray(arrItem)) {
        var quantity = 0;
        for (var i = 0; i < arrItem.length; i++) {
            quantity += mc.ItemStock.getItemQuantity(arrItem[i]);
        }
        return quantity;
    }
    return mc.ItemStock.getItemQuantity(arrItem);
};
mc.ItemStock.getItemSkillOption = function (itemInfo) {
    return itemInfo["optSkills"];
};

mc.ItemStock.hasItemSkillOption = function (itemInfo) {
    var itemByIndex = mc.dictionary.getItemByIndex(itemInfo["index"]);
    if (mc.ItemStock.getItemSkillOption(itemInfo) || (itemByIndex && itemByIndex["optionIndex"])) {
        return true;
    }
};
mc.ItemStock.getItemSkillOptionNumber = function (itemInfo) {
    var itemByIndex = mc.dictionary.getItemByIndex(itemInfo["index"]);
    var itemSkillOption = mc.ItemStock.getItemSkillOption(itemInfo);
    var numOwnSkill = (itemSkillOption && cc.isArray(itemSkillOption)) ? itemSkillOption.length : 0;
    var numSlotSkill = (itemByIndex && itemByIndex["optionIndex"]) ? itemByIndex["optionIndex"] : 0;
    return Math.max(numOwnSkill, numSlotSkill);
};
mc.ItemStock.getHowToGetCode = function (itemInfo) {
    var str = itemInfo.howToGet;
    if (!str) {
        str = mc.dictionary.getItemByIndex(itemInfo.index).howToGet;
    }
    return str;
};
mc.ItemStock.getItemHeroSoul = function (itemInfo) {
    return itemInfo.heroInfo;
};
mc.ItemStock.getItemId = function (itemInfo) {
    return itemInfo ? itemInfo.id : null;
};
mc.ItemStock.getItemIndex = function (itemInfo) {
    return itemInfo.index;
};
mc.ItemStock.getItemLevel = function (itemInfo) {
    return itemInfo.level || 1;
};
mc.ItemStock.getCraftingRecipe = function (itemInfo) {
    var recipe = itemInfo.recipe;
    if (!recipe) {
        recipe = mc.dictionary.getItemByIndex(itemInfo.index).recipe;
    }
    return recipe;
};
mc.ItemStock.getAddOptionRecipe = function (itemInfo) {
    var recipe = itemInfo.addOptionRecipe;
    if (!recipe) {
        recipe = mc.dictionary.getItemByIndex(itemInfo.index).addOptionRecipe;
    }
    return recipe;
};
mc.ItemStock.getCraftingEventRecipe = function (itemInfo) {
    var recipe = itemInfo.exchangeEvent;
    if (!recipe) {
        recipe = mc.dictionary.getItemByIndex(itemInfo.index).exchangeEvent;
    }
    return recipe;
};
mc.ItemStock.getItemBuyFee = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict && itemDict.buyFee) {
        return mc.ItemStock.createJsonItemByStr(itemDict.buyFee);
    }
    return null;
};
mc.ItemStock.getItemDesc = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        return mc.dictionary.getI18nMsg(itemDict.desc);
    }
    return "No Desc " + mc.ItemStock.getItemIndex(itemInfo);
};
mc.ItemStock.getItemTextCaution = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        return mc.dictionary.getI18nMsg(itemDict.textCaution);
    }
    return "No Text Caution " + mc.ItemStock.getItemIndex(itemInfo);
};
mc.ItemStock.getItemRefundCost = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict && itemDict.refunCost) {
        return mc.ItemStock.createArrJsonItemFromStr(itemDict.refunCost);
    }
    return null;
};
mc.ItemStock.getItemRank = function (itemInfo) {
    return mc.ItemStock.getItemRankByIndex(itemInfo.index);
};

mc.ItemStock.getItemRankByIndex = function (index) {
    var itemDict = mc.dictionary.getItemByIndex(index);
    if (itemDict) {
        return mc.dictionary.getI18nMsg(itemDict.itemRank);
    }
    return 1;
};

mc.ItemStock.getItemAttack = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        var lvUpATK = itemDict.lvUpATK || 0;
        var atk = itemDict.atk || 0;
        var upAtk = (mc.ItemStock.getItemLevel(itemInfo) - 1) * lvUpATK;
        var bonusAtk = mc.dictionary.getBonusStatsOfEquipment(itemInfo, 'atk');
        return atk + upAtk + bonusAtk;
    }
    return 0;
};
mc.ItemStock.getItemDefense = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        var upDef = (mc.ItemStock.getItemLevel(itemInfo) - 1) * itemDict.lvUpDEF;
        var bonusDef = mc.dictionary.getBonusStatsOfEquipment(itemInfo, 'def');
        return itemDict.def + upDef + bonusDef;
    }
    return 0;
};
mc.ItemStock.getItemResistant = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        var upREC = (mc.ItemStock.getItemLevel(itemInfo) - 1) * itemDict.lvUpRES;
        var bonusRes = mc.dictionary.getBonusStatsOfEquipment(itemInfo, 'res');
        return itemDict.res + upREC + bonusRes;
    }
    return 0;
};
mc.ItemStock.getItemHp = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        var upHP = (mc.ItemStock.getItemLevel(itemInfo) - 1) * itemDict.lvUpHP;
        var bonusHp = mc.dictionary.getBonusStatsOfEquipment(itemInfo, 'hp');
        return itemDict.hp + upHP + bonusHp;
    }
    return 0;
};
mc.ItemStock.getItemMagic = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        var lvUpMAG = itemDict.lvUpMAG || 0;
        var mag = itemDict.mag || 0;
        var upMag = (mc.ItemStock.getItemLevel(itemInfo) - 1) * lvUpMAG;
        var bonusMag = mc.dictionary.getBonusStatsOfEquipment(itemInfo, 'mag');
        return mag + upMag + bonusMag;
    }
    return 0;
};
mc.ItemStock.getItemSpeed = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        var upSpd = (mc.ItemStock.getItemLevel(itemInfo) - 1) * itemDict.lvUpSPD;
        var bonusSpd = mc.dictionary.getBonusStatsOfEquipment(itemInfo, 'spd');
        return itemDict.spd + upSpd + bonusSpd;
    }
    return 0;
};

mc.ItemStock.getEquipItemInfoAtLv = function (itemInfo, lv) {
    if (!lv) {
        lv = 1;
    }
    var itemDict = itemInfo;
    itemDict.level = lv;
    itemDict.atk = mc.ItemStock.getItemAttack(itemDict);
    itemDict.def = mc.ItemStock.getItemDefense(itemDict);
    itemDict.hp = mc.ItemStock.getItemHp(itemDict);
    itemDict.res = mc.ItemStock.getItemResistant(itemDict);
    itemDict.mag = mc.ItemStock.getItemMagic(itemDict);
    itemDict.spd = mc.ItemStock.getItemSpeed(itemDict);
    return itemDict;
};

mc.ItemStock.getItemName = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        return mc.dictionary.getI18nMsg(itemDict.name);
    }
    return "No Name " + mc.ItemStock.getItemIndex(itemInfo);
};
mc.ItemStock.getItemElement = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    if (itemDict) {
        return itemDict.elemental.toLowerCase();
    }
    return "No Elemental";
};
mc.ItemStock.getItemType = function (itemInfo) {
    return mc.dictionary.getItemByIndex(itemInfo.index).itemType;
};
mc.ItemStock.getItemValue = function (itemInfo) {
    if (itemInfo) {
        if (itemInfo["value"]) {
            return itemInfo["value"];
        }
        return mc.dictionary.getItemByIndex(itemInfo.index).value;
    }
    return null;
};
mc.ItemStock.getItemMaxValue = function (itemInfo) {
    return itemInfo ? itemInfo["maxValue"] : 0;
};

mc.ItemStock.getItemSkillIndex = function (itemInfo) {
    return mc.dictionary.getItemByIndex(itemInfo.index).skillIndex;
};
mc.ItemStock.getItemSkillInfo = function (itemInfo) {
    var skillIndex = mc.ItemStock.getItemSkillIndex(itemInfo);
    if (skillIndex) {
        return new mc.CreatureSkill(null, mc.CreatureSkill.createJsonSkill(skillIndex, 1));
    }
    return null;
};
mc.ItemStock.isItemEquipment = function (itemInfo) {
    return itemInfo.index < mc.const.SEPARATOR_NUMBER_CONSUMABLE_ITEM;
};
mc.ItemStock.isItemPotion = function (item) {
    var itemType = mc.ItemStock.getItemType(item);
    if (itemType === mc.const.ITEM_TYPE_POTION ||
        itemType === mc.const.ITEM_TYPE_PACK ||
        itemType === mc.const.ITEM_TYPE_HERO_TICKET ||
        itemType === mc.const.ITEM_TYPE_GIFT_RANDOM ||
        itemType === mc.const.ITEM_TYPE_TICKET) {
        return true;
    }
    return false;
};
mc.ItemStock.isItemSoul = function (item) {
    var itemType = mc.ItemStock.getItemType(item);
    if (itemType === mc.const.ITEM_TYPE_SOUL) {
        return true;
    }
    return false;
};
mc.ItemStock.isItemCofferState = function (itemInfo) {
    if (itemInfo.cofferState) {
        return itemInfo.cofferState === 1;
    }
    return false;
};
mc.ItemStock.isItemMaxLevel = function (itemInfo) {
    return mc.ItemStock.getItemLevel(itemInfo) >= mc.const.MAX_ITEM_LEVEL;
};
mc.ItemStock.isTwoHand = function (itemInfo) {
    var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
    return itemDict ? itemDict.twoHanded : false;
};
mc.ItemStock.getItemBattlePower = function (itemInfo) {
    if (mc.ItemStock.isItemEquipment(itemInfo)) {
        var itemDict = mc.dictionary.getItemByIndex(itemInfo.index);
        var val = Math.round(itemInfo.atk + itemInfo.mag + itemInfo.hp +
            itemInfo.def + itemInfo.res + itemInfo.spd +
            itemInfo.crit * (itemInfo.atk + itemInfo.mag) / 100 + itemInfo.mpRec);
        if (!isFinite(val)) {
            cc.log("Invalid Attribute Item!!");
            cc.log(itemInfo);
        }
        return val;
    }
    return 0;
};
mc.ItemStock.isItemMatchSlot = function (itemInfo, slotIndex) {
    var arrEnableSlots = mc.ItemStock.getItemEquipSlots(itemInfo);
    var isMatchSlot = false;
    if (arrEnableSlots) {
        isMatchSlot = bb.collection.findBy(arrEnableSlots, function (currSlot, slot) {
            return currSlot === slot;
        }, parseInt(slotIndex));
    }
    return isMatchSlot;
};
mc.ItemStock.getItemQuantity = function (itemInfo) {
    var val = itemInfo ? itemInfo.no : 0;
    val < 0 && (val = 0);
    return val;
};
mc.ItemStock.adjustItemQuantity = function (itemInfo, deltaNo) {
    itemInfo.no += deltaNo;
    itemInfo.no <= 0 && mc.GameData.itemStock.updateItem(itemInfo);
    return itemInfo.no;
};
mc.ItemStock.getEquippingSlotIndex = function (itemInfo) {
    if (itemInfo.slotIndex != undefined) {
        return itemInfo.slotIndex;
    }
    return null;
};
mc.ItemStock.getHeroIdEquipping = function (itemInfo) {
    if (itemInfo.heroId != undefined) {
        if (mc.GameData.heroStock.getHeroById(itemInfo.heroId))
            return itemInfo.heroId;
    }
    return null;
};
mc.ItemStock.getItemEquipSlots = function (itemInfo) {
    return mc.dictionary.getItemByIndex(itemInfo.index).equipSlot;
};
mc.ItemStock.getItemRequireHeroRank = function (itemInfo) {
    return mc.dictionary.getItemByIndex(itemInfo.index).heroRank;
};
mc.ItemStock.isItemAvailableForHero = function (itemInfo, heroInfo) {
    var arrClassgroup = mc.dictionary.getItemByIndex(itemInfo.index).availableClassGroups;
    if (arrClassgroup && arrClassgroup.length > 0) {
        if (arrClassgroup[0] < 0) {
            return true;
        }
        return bb.collection.findBy(arrClassgroup, function (currClassId, classHero) {
            return currClassId === classHero;
        }, mc.HeroStock.getHeroClassGroup(heroInfo)) != null;
    }
};
mc.ItemStock.getItemRes = function (itemInfo) {
    var obj = mc.dictionary.getItemByIndex(itemInfo.index);
    if (obj) {
        if (mc.ItemStock.isItemEquipment(itemInfo)) {
            return "res/png/equipment/" + (obj.icon);
        }
        return "res/png/consumable/" + (obj.icon);
    }
    cc.log("Unknown ItemDict: " + itemInfo.index);
    return "res/png/equipment/ico_equip_unknow.png";
};

mc.ItemStock.compareByPower = function (itemInfo1, itemInfo2) {
    return mc.ItemStock.getItemBattlePower(itemInfo2) - mc.ItemStock.getItemBattlePower(itemInfo1);
};
mc.ItemStock.compareByRank = function (itemInfo1, itemInfo2) {
    return mc.ItemStock.getItemRank(itemInfo2) - mc.ItemStock.getItemRank(itemInfo1);
};

var splitMask = [1, 1, 1, 1, 1, 5, 10, 10, 10, 10, 50, 100, 100, 100, 100, 500, 1000, 1000, 1000, 1000, 5000];
mc.ItemStock.splitForArrayQuantity = function (arrItem) {
    var arrSplitItem = [];
    for (var it in arrItem) {
        var itemInfo = arrItem[it];
        var quantity = mc.ItemStock.getItemQuantity(itemInfo);
        for (var i in splitMask) {
            var number = splitMask[i];
            if (quantity > number) {
                arrSplitItem.push(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo), number, mc.ItemStock.getItemId(itemInfo) + "_" + quantity + "_" + number));
                quantity -= number;
            } else {
                arrSplitItem.push(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo), quantity, mc.ItemStock.getItemId(itemInfo) + "_" + quantity + "_" + quantity));
                break;
            }
        }
    }
    return arrSplitItem;
};

