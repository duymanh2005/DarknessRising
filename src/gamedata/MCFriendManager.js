/**
 * Created by long.nguyen on 4/4/2018.
 */
mc.FriendManager = bb.Class.extend({
    _arrFriendSuggest: null,

    setFriendSuggestData: function (data) {
        this._arrFriendSuggest = data;
    },

    getArrayFriendSuggest: function () {
        return this._arrFriendSuggest;
    },

    getSuggestFriendInfoById: function (friendId) {
        var info = null;
        if (this._arrFriendSuggest) {
            for (var i = 0; i < this._arrFriendSuggest.length; i++) {
                if (mc.FriendManager.getSuggestPlayerId(this._arrFriendSuggest[i]) === friendId) {
                    info = this._arrFriendSuggest[i];
                    break;
                }
            }
        }
        return info;
    },

    getFriendInfoById: function (friendId) {
        var info = null;
        if (this._arrFriendInfo) {
            for (var i = 0; i < this._arrFriendInfo.length; i++) {
                if (mc.FriendManager.getFriendId(this._arrFriendInfo[i]) === friendId) {
                    info = this._arrFriendInfo[i];
                    break;
                }
            }
        }
        return info;
    },

    setArrayFriendInfo: function (friendList) {
        this._arrFriendInfo = friendList;
    },

    getArrayFriendInfo: function () {
        return this._arrFriendInfo;
    },

    setArrayFriendRequest: function (arrFriendRequest) {
        this._arrFriendRequest = arrFriendRequest;
    },

    getArrayFriendRequest: function () {
        return this._arrFriendRequest;
    },

    setArraySearchInfo: function (arrSearchInfo, searchName, page, maxPage) {
        this._arrSearchInfo = arrSearchInfo;
        this._searchName = searchName;
        this._searchPage = page;
        this._searchMaxPage = maxPage;
    },

    getCurrentSearthName: function () {
        return this._searchName;
    },

    getCurrentSearchPage: function () {
        return this._searchPage;
    },

    getCurrentSearchMaxPage: function () {
        return this._searchMaxPage;
    },

    getArraySearchInfo: function () {
        return this._arrSearchInfo;
    },

    removeFriendById: function (gameHeroId) {
        if (gameHeroId && this._arrFriendInfo) {
            for (var i = 0; i < this._arrFriendInfo.length; i++) {
                if (this._arrFriendInfo[i].gameHeroId === gameHeroId) {
                    this._arrFriendInfo.splice(i, 1);
                }
            }
        }
    }

});

mc.FriendManager.getSuggestPlayerId = function (suggestFriendInfo) {
    return suggestFriendInfo.gameHeroId;
};
mc.FriendManager.getSuggestPlayerName = function (suggestFriendInfo) {
    return suggestFriendInfo.name;
};
mc.FriendManager.getSuggestHeroInfoOfPlayer = function (suggestFriendInfo) {
    return suggestFriendInfo.leader;
};
mc.FriendManager.getFriendName = function (friendInfo) {
    return friendInfo.name;
};
mc.FriendManager.getFriendAvatarIndex = function (friendInfo) {
    return friendInfo.avatar;
};
mc.FriendManager.getFriendVIP = function (friendInfo) {
    return friendInfo.vip;
};
mc.FriendManager.getFriendId = function (friendInfo) {
    return friendInfo.gameHeroId;
};
mc.FriendManager.isReceivedFP = function (friendInfo) {
    return friendInfo.receivedFP;
};