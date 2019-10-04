mc.ManaCoinManager = bb.Class.extend(
    {}
);

mc.ManaCoinManager.getName = function (info) {
    return mc.dictionary.getGUIString("Refill Rewards") + info["id"];
};


mc.ManaCoinManager.getRequireManaCoin = function (info) {
    return info.totalManaCoin;
};

mc.ManaCoinManager.getArrayReward = function (info) {

    var arrItemInfo = [];
    var rewardStr = info.itemString;
    var arrReward = rewardStr.split('#');
    for (var i = 0; i < arrReward.length; i++) {
        var strRewards = arrReward[i].split('/');

        arrItemInfo.push(mc.ItemStock.createJsonItemInfo(parseInt(strRewards[0]), parseInt(strRewards[1])));
    }

    return arrItemInfo;
};

mc.ManaCoinManager.isClaimReward = function (info, point) {
    return point >= info.totalManaCoin;
};

mc.ManaCoinManager.getManaCoinRewardId = function (info) {
    return info.id;
};

mc.ManaCoinManager.getManaCoinRewardTotalPoint = function (info) {
    return info.totalManaCoin;
};

