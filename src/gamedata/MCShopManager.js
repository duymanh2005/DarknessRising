/**
 * Created by long.nguyen on 10/5/2017.
 */

var GOBLIN_INTERVAL = 1000 * 60 * 60 * 12;
var GOBLIN_RESET_INTERVAL = 1000 * 60 * 60 * 24 * 2;

mc.ShopManager = bb.Class.extend({
    _arrItemByCategoryId: null,
    _infoByCategoryId: null,
    _goblinArriveTime: null,
    _goblinLeaveTime: null,
    _goblinComingInterval: null,

    ctor: function () {
        this._super();
        this._arrItemByCategoryId = {};
        this._infoByCategoryId = {};

    },

    checkGoblin: function (checkAndWakeup) {
        var goblinShop = mc.storage.readGoblinShop();
        if (goblinShop) {
            var markTime = goblinShop["markTime"];
            if ((bb.now() > markTime)) {
                if (bb.now() - markTime < GOBLIN_INTERVAL) {
                    return true;
                } else if (bb.now() > goblinShop["nextCome"]) {
                    if (checkAndWakeup)
                        this.resetGoblin();
                }
                return false;
            } else {
                return true;
            }
        } else {
            if (checkAndWakeup)
                this.resetGoblin();
            return false;
        }
    },

    resetGoblin: function () {
        var randomInt = bb.utility.randomInt(1, 1000);
        var goblinShop = mc.storage.readGoblinShop();
        if (randomInt > 900) {
            goblinShop["markTime"] = bb.now();
            goblinShop["nextCome"] = bb.now() + GOBLIN_RESET_INTERVAL;
            mc.storage.saveGoblinShop();
        }
    },
    hideGoblin: function () {
        var goblinShop = mc.storage.readGoblinShop();
        goblinShop["markTime"] = bb.now() - GOBLIN_RESET_INTERVAL;
        goblinShop["nextCome"] = bb.now() + GOBLIN_RESET_INTERVAL;
        mc.storage.saveGoblinShop();
    },

    isGoblinShopOpen: function (checkAndWakeup) {
        return this.checkGoblin(checkAndWakeup);
    },

    setShopData: function (shopInfo, categoryId) {
        var arrItem = shopInfo["items"];
        categoryId = categoryId || mc.ShopManager.SHOP_COMMON;
        this._arrItemByCategoryId[categoryId] = [];
        for (var i = 0; i < arrItem.length; i++) {
            var obj = arrItem[i];
            var item = obj["item"];
            var price = obj["price"];
            var strItems = item.split('/');
            var strPrices = obj["price"].split('/');
            obj.product = mc.ItemStock.createJsonItemInfo(parseInt(strItems[0]), parseInt(strItems[1]));
            obj.price = mc.ItemStock.createJsonItemInfo(parseInt(strPrices[0]), parseInt(strPrices[1]));
            this._arrItemByCategoryId[categoryId].push(obj);
        }
        this._arrItemByCategoryId[categoryId].sort(function (shopItem1, shopItem2) {
            return mc.ItemStock.getItemIndex(shopItem1.product) - mc.ItemStock.getItemIndex(shopItem2.product);
        });
        if (!this._infoByCategoryId[categoryId]) {
            this._infoByCategoryId[categoryId] = {};
        }
        this._infoByCategoryId[categoryId].refreshNo = shopInfo["refreshNo"];
        this._infoByCategoryId[categoryId].refreshTime = shopInfo["refreshTime"];
        this._infoByCategoryId[categoryId].refreshTicketNo = shopInfo["refreshTicketNo"];
    },

    getShopRefreshPrice: function (categoryId) {
        var refreshNo = this._infoByCategoryId[categoryId].refreshNo;
        var priceList = mc.ShopManager.getShopRefreshPriceList(categoryId);
        if (refreshNo >= priceList.length) {
            refreshNo = priceList.length - 1;
        }
        return priceList[refreshNo];
    },

    getShopRefreshTicketNo: function (categoryId) {
        return this._infoByCategoryId[categoryId].refreshTicketNo
    },

    getRemainShopRefreshDuration: function (categoryId) {
        var durationInSecond = mc.ShopManager.getShopLifeTime(categoryId);
        var deltaInMs = durationInSecond * 1000 - (bb.now() - this._infoByCategoryId[categoryId].refreshTime);
        if (deltaInMs < 0) {
            deltaInMs = 0;
        }
        return deltaInMs;
    },

    getShopItemByCategoryId: function (categoryId) {
        categoryId = categoryId || mc.ShopManager.SHOP_COMMON;
        return this._arrItemByCategoryId[categoryId];
    }

});
mc.ShopManager.SHOP_COMMON = "Shop_Common";
mc.ShopManager.SHOP_ICECREAM = "Shop_IceCream";
mc.ShopManager.SHOP_ARENA = "Shop_Arena";
mc.ShopManager.SHOP_EVENT = "Shop_LifeOrb";
mc.ShopManager.SHOP_CHAOS = "Shop_Chaos";
mc.ShopManager.SHOP_BLOOD = "Shop_Blood";
mc.ShopManager.SHOP_EVENTA = "Shop_Event";
mc.ShopManager.SHOP_EVENTB = "Shop_Halloween";
mc.ShopManager.SHOP_GUILD = "Shop_Guild";
mc.ShopManager.SHOP_GOBLIN = "Shop_Goblin";
mc.ShopManager.SHOP_RELIC = "Shop_Relic";
mc.ShopManager.SHOP_PROMGOTION = "Shop_Promotion";
mc.ShopManager.SHOP_EGG = "Shop_Egg";

mc.ShopManager.getShopName = function (shopId) {
    var shopDict = mc.dictionary.getItemShopById(shopId);
    return mc.dictionary.getGUIString(shopDict.shopName);
};
mc.ShopManager.getShopLifeTime = function (shopId) {
    var shopDict = mc.dictionary.getItemShopById(shopId);
    return shopDict.lifeTimeSeconds;
};
mc.ShopManager.getShopRefreshPriceList = function (shopId) {
    var shopDict = mc.dictionary.getItemShopById(shopId);
    var str = shopDict.refreshPriceList;
    var strs = str.split('#');
    var arrPriceInfo = [];
    for (var i = 0; i < strs.length; i++) {
        var values = strs[i].split('/');
        arrPriceInfo.push(mc.ItemStock.createJsonItemInfo(parseInt(values[0]), parseInt(values[1])));
    }
    return arrPriceInfo;
};

mc.ShopManager.getShopCurrency = function (shopId) {
    var shopDict = mc.dictionary.getItemShopById(shopId);
    var str = shopDict.currency;
    return str.split('#');
};

mc.ShopManager.getPackageIndex = function (packageInfo) {
    return packageInfo.index;
};
mc.ShopManager.getProductItem = function (packageInfo) {
    return packageInfo.product;
};
mc.ShopManager.getPriceItem = function (packageInfo) {
    return packageInfo.price;
};
mc.ShopManager.isBoughtItem = function (packageInfo) {
    return packageInfo.bought;
};
mc.ShopManager.getSaleOff = function (packageInfo) {
    return packageInfo.saleOff;
};
mc.ShopManager.getCategoryId = function (packageInfo) {
    return packageInfo.catId;
};