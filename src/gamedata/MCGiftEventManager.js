/**
 * Created by long.nguyen on 8/14/2017.
 */
mc.GiftEventManager = bb.Class.extend({
    EVENT_DAILY: "dailyGift",
    _gifts: {},
    rvs: -1,

    setGiftData: function (gifts) {
        this._gifts = gifts;
    },

    getDailyGiftCount: function () {
        return this._gifts[this.EVENT_DAILY]["ntfCount"];
    },

    getDailyGifts: function () {
        return this._gifts[this.EVENT_DAILY]["giftList"];
    },

    _matchPackIndex: function (currPackIndex, packageIndex) {
        return currPackIndex === packageIndex
    },

    _isItemInList: function (claimed, packageIndex) {
        return bb.collection.findBy(claimed, this._matchPackIndex, packageIndex) != null;
    },

    haveFreeReward: function () {
        return this.getDailyGiftCount() > 0;
    },

    numMissingReward: function () {
        var gift = this._gifts[this.EVENT_DAILY];
        var claims = gift["missingClaim"];
        return claims ? claims.length : 0;
    },

    isAllowClaimIndex: function (index) {
        var gift = this._gifts[this.EVENT_DAILY];
        var claims = gift["allowClaim"];
        return claims ? this._isItemInList(claims, index) : false;
    },

    isMissingClaimIndex: function (index) {
        var gift = this._gifts[this.EVENT_DAILY];
        var claims = gift["missingClaim"];
        return claims ? this._isItemInList(claims, index) : false;
    },

    isClaimedIndex: function (index) {
        var gift = this._gifts[this.EVENT_DAILY];
        var claims = gift["claimed"];
        return claims ? this._isItemInList(claims, index) : false;
    },


    getRevision: function () {
        return this.rvs;
    }

});