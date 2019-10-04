/**
 * Created by long.nguyen on 8/9/2018.
 */
mc.RefreshFunctionSystem = bb.Class.extend({
    _mapRefreshTimeByCode: null,

    ctor: function () {
        this._super();
        this._mapRefreshTimeByCode = {};
    },

    setRefreshFunctionList: function (arrFuncList) {
        if (arrFuncList.length > 0) {
            this._mapRefreshTimeByCode = bb.utility.arrayToMap(arrFuncList, function (element) {
                return element["func"];
            });
        }
    },

    updateRefreshFunctionObject: function (funcObj) {
        if (this._mapRefreshTimeByCode && funcObj) {
            this._mapRefreshTimeByCode[funcObj["func"]] = funcObj;
        }
    },

    getRefreshFunctionTimeByCode: function (funcCode) {
        var time = 0;
        if (this._mapRefreshTimeByCode[funcCode]) {
            time = this._mapRefreshTimeByCode[funcCode]["refreshNo"];
        }
        return time;
    },

    getRefreshFunctionPriceByCode: function (funcCode) {
        var time = this.getRefreshFunctionTimeByCode(funcCode);
        var price = null;
        if (mc.dictionary.buyFunctionMapById) {
            var buyFuncObj = mc.dictionary.buyFunctionMapById[funcCode];
            if (buyFuncObj) {
                var isLimit = buyFuncObj["limitRefresh"];
                var arrPrices = mc.ItemStock.createArrJsonItemFromStr(buyFuncObj["refreshFee"]);
                if (time < arrPrices.length) {
                    price = arrPrices[time];
                } else if (!isLimit) {
                    price = arrPrices[arrPrices.length - 1];
                }
            }
        }
        return price;
    }

});