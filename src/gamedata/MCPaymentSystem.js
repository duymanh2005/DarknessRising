/**
 * Created by long.nguyen on 9/6/2018.
 */
mc.PaymentSystem = bb.Class.extend({
    _mapBuyTimeById: null,

    setBuyTimes: function (arrBuyTime) {
        this._mapBuyTimeById = {};
        if (arrBuyTime) {
            for (var i = 0; i < arrBuyTime.length; i++) {
                var inApp = arrBuyTime[i];
                this._mapBuyTimeById[inApp["productId"]] = inApp["buyTimes"];
            }
        }
    },

    getInAppItem: function (position) {
        var providerType = "android";
        if (bb.framework.isIos()) {
            providerType = "ios";
        }
        var arrInAppDict = mc.dictionary.getInAppItemByProvider(providerType, position);
        arrInAppDict.sort(function (a, b) {
            return a.displayOrder - b.displayOrder;
        });
        return arrInAppDict;
    },

    canBuyMore: function (id) {
        if (this._mapBuyTimeById) {
            var dict = mc.dictionary.IAPMap[id];
            if (dict["buyTimes"] > 0) {
                var boughtTimes = this._mapBuyTimeById[id] || 0;
                //check local
                var mapBuyedIAP = mc.storage.readObjIAPBuyTimes();
                var buyedObj = mapBuyedIAP[id];
                var localBoughtTime = buyedObj ? buyedObj["buytimes"] : 0;
                boughtTimes = Math.max(boughtTimes, localBoughtTime);
                return boughtTimes < dict["buyTimes"];
            }


        }
        return true;
    }

});

mc.PaymentSystem.isActiveIAPItem = function (iapItem) {
    return iapItem["active"];
};

mc.PaymentSystem.getGeneratedItemId = function (iapItem) {
    return iapItem["id"] + "_" + iapItem["order"];
};

mc.PaymentSystem.POSITION_PROMOTION = "promo";
mc.PaymentSystem.POSITION_MONTHLY = "monthly";
mc.PaymentSystem.POSITION_BLESS = "bless";
mc.PaymentSystem.POSITION_OFFER = "offer";