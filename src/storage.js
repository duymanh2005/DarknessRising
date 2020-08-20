/**
 * Created by long.nguyen on 7/28/2017.
 */
mc.storage = {};
mc.storage.isChange = false;
mc.storage.testServer = false;
mc.storage.setting = null;
mc.storage.custom = null;
mc.storage.iapNotify = null;
mc.storage.goblinShop = null;
mc.storage.confirmEggGame = null;
mc.storage.eggGameLog = null;
mc.storage.showedServerInfo = false;
mc.storage.needUpdateDefArenaTeam = false;
mc.storage.rankRewardTouched = false;
mc.storage.checkNewHeroesList = false;
mc.storage.itemTabTouched = {
    equip: true,
    potion: true,
    soul: true,
    other: true
};
mc.storage.settingChanger = new mc.AttributeChanger();
mc.storage.readCustom = function () {
    if (!mc.storage.custom) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_CUSTOM);
        if (!cus) {
            cus = {
                freshPlayer: true,
                agreeTermAndPrivacy: undefined
            };
        } else {
            cus = JSON.parse(cus);
        }
        mc.storage.custom = cus;
    }
    return mc.storage.custom;
};
mc.storage.saveCustom = function () {
    if (mc.storage.custom) {
        cc.sys.localStorage.setItem(mc.const.KEY_STORAGE_CUSTOM, JSON.stringify(mc.storage.custom));
    }
};

mc.storage.readLastNewsVersion = function () {
    try {
        if (!mc.storage.lastNewsVersion) {
            var str = cc.sys.localStorage.getItem(mc.const.NEWS_LAST_VERSION);
            if (str) {
                mc.storage.lastNewsVersion = JSON.parse(str);
            }
        }
    } catch (e) {

    }
    return mc.storage.lastNewsVersion
};
mc.storage.saveLastNewsVersion = function () {
    cc.sys.localStorage.setItem(mc.const.NEWS_LAST_VERSION, JSON.stringify(mc.storage.lastNewsVersion));
};

//Lưu xử lý 1 số gói giới hạn lần mua dưới local, nếu user cheat xóa cache có thể mua lại.
mc.storage.readObjIAPBuyTimes = function () {
    try {
        if (!mc.storage.objIAPBuyTimes) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_IAP_BUY_TIMES) || "{}";
            if (str) {
                mc.storage.objIAPBuyTimes = JSON.parse(str);
            }
        }
    } catch (e) {
        mc.storage.objIAPBuyTimes = {};
    }
    return mc.storage.objIAPBuyTimes;
};

/**
 * @param makeIAPId id dc tạo từ mc.PaymentSystem.getGeneratedItemId
 * @param IAPId package id IAP
 */
mc.storage.pushObjIAPBuyTimes = function (makeIAPId, IAPId) {
    var objIAPBuyTimes = mc.storage.objIAPBuyTimes || {};
    var obj = objIAPBuyTimes[makeIAPId] || {};
    obj["id"] = IAPId;
    if (!cc.isNumber(obj["buytimes"]))
        obj["buytimes"] = 0;
    obj["buytimes"]++;
    objIAPBuyTimes[makeIAPId] = obj;
    mc.storage.objIAPBuyTimes = objIAPBuyTimes;
};
mc.storage.saveObjIAPBuyTimes = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_IAP_BUY_TIMES, JSON.stringify(mc.storage.objIAPBuyTimes));
};

mc.storage.savedInappToken = new bb.Class();
mc.storage.savePerchaseInfoByPlayerId = function (token, orderId, playerId) {
    var str = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_INAPP_TOKEN);
    var tokenMap = str ? JSON.parse(str) : null;
    var arrPurchaseInfo = null;
    if (tokenMap && tokenMap[playerId]) {
        arrPurchaseInfo = tokenMap[playerId];
    } else {
        !tokenMap && (tokenMap = {});
        arrPurchaseInfo = [];
        tokenMap[playerId] = arrPurchaseInfo;
    }

    arrPurchaseInfo.push({
        token: token,
        orderId: orderId
    });

    cc.sys.localStorage.setItem(mc.const.KEY_STORAGE_INAPP_TOKEN, JSON.stringify(tokenMap));
    mc.storage.savedInappToken.notifyDataChanged();
};
mc.storage.readPurchaseInfosByPlayerId = function (playerId) {
    var str = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_INAPP_TOKEN);
    var tokenMap = str ? JSON.parse(str) : null;
    if (tokenMap) {
        return tokenMap[playerId];
    }
    return null;
};
mc.storage.removePurchaseInfoToken = function (token, playerId) {
    var str = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_INAPP_TOKEN);
    var tokenMap = str ? JSON.parse(str) : null;
    if (tokenMap && tokenMap[playerId]) {
        var arrPurchaseInfo = tokenMap[playerId];
        if (arrPurchaseInfo) {
            for (var i = arrPurchaseInfo.length - 1; i >= 0; i--) {
                if (token === arrPurchaseInfo[i].token) {
                    arrPurchaseInfo.splice(i, 1);
                    break;
                }
            }
        }
        if (arrPurchaseInfo && !arrPurchaseInfo.length) {
            delete tokenMap[playerId];
        }

        cc.sys.localStorage.setItem(mc.const.KEY_STORAGE_INAPP_TOKEN, JSON.stringify(tokenMap));
        mc.storage.savedInappToken.notifyDataChanged();
    }
};
mc.storage.readSetting = function () {
    if (!mc.storage.setting) {
        var setting = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_SETTING);
        if (!setting) {
            setting = {
                // DO NOT DELETE THE FOLLOWING KEY.
                auto_battle: false,
                language: mc.const.LANGUAGE_DEFAULT,
                xSpeedBattle: mc.const.SPEED_BATTLE_X1,
                soundVol: 50,
                musicVol: 50
            };
        } else {
            setting = JSON.parse(setting);
        }
        if (setting.xSpeedBattle === undefined) {
            setting.xSpeedBattle = mc.const.SPEED_BATTLE_X1;
        }
        !setting["language"] && (setting["language"] = mc.const.LANGUAGE_DEFAULT);
        mc.storage.setting = setting;
        mc.storage.settingChanger.setData(mc.storage.setting);
    }
    return mc.storage.setting;
};

mc.storage.readConsumableSlotMap = function () {
    var map = null;
    var str = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_CONSUMABLE_SLOT_MAP);
    if (str) {
        map = JSON.parse(str);
    }
    return map;
};
mc.storage.saveConsumableSlotMap = function (mapConsumableIdBySlotId) {
    if (mapConsumableIdBySlotId) {
        cc.sys.localStorage.setItem(mc.const.KEY_STORAGE_CONSUMABLE_SLOT_MAP, JSON.stringify(mapConsumableIdBySlotId));
    }
};

mc.storage.readLastVersion = function () {
    try {
        if (!mc.storage.lastVersion) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_LAST_VERSION);
            if (str) {
                mc.storage.lastVersion = JSON.parse(str);
            }
        }
    } catch (e) {

    }
    return mc.storage.lastVersion
};
mc.storage.saveLastVersion = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_LAST_VERSION, JSON.stringify(mc.storage.lastVersion));
};

mc.storage.readJoinedServer = function () {
    try {
        if (!mc.storage.joinedServer) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_JOINED_SERVER);
            if (str) {
                mc.storage.joinedServer = JSON.parse(str);
            }
        }
    } catch (e) {
    }
    return mc.storage.joinedServer
};
mc.storage.saveJoinedServer = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_JOINED_SERVER, JSON.stringify(mc.storage.joinedServer));
};

mc.storage.readJoinedServer2 = function () {
    try {
        if (!mc.storage.joinedServer_2) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_JOINED_SERVER_2);
            if (str) {
                mc.storage.joinedServer_2 = JSON.parse(str);
            }
        }
    } catch (e) {
    }
    return mc.storage.joinedServer_2
};
mc.storage.saveJoinedServer2 = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_JOINED_SERVER_2, JSON.stringify(mc.storage.joinedServer_2));
};

mc.storage.readLoginServer = function () {
    if (!mc.storage.loginServer) {
        var str = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_LOGIN_SERVER);
        if (str) {
            mc.storage.loginServer = JSON.parse(str);
        }
    }
    return mc.storage.loginServer;
};

mc.storage.saveLoginServer = function (loginServer) {
    if (loginServer) {
        mc.storage.loginServer = loginServer;
        var str = JSON.stringify(loginServer);
        cc.sys.localStorage.setItem(mc.const.KEY_STORAGE_LOGIN_SERVER, str);
    }
};

mc.storage.saveSetting = function (cb) {
    if (mc.storage.setting) {
        var isLanguageChange = false;
        var strLocalSetting = cc.sys.localStorage.getItem(mc.const.KEY_STORAGE_SETTING);
        if (strLocalSetting) {
            var localSetting = JSON.parse(strLocalSetting);
            if (localSetting["language"] != mc.storage.setting["language"]) {
                isLanguageChange = true;
            }
        }
        var str = JSON.stringify(mc.storage.setting);
        cc.sys.localStorage.setItem(mc.const.KEY_STORAGE_SETTING, str);
        if (isLanguageChange) {
            mc.dictionary.loadLanguage(function () {
                mc.storage.settingChanger.setDataChange(mc.storage.setting);
                cb && cb();
            });
        } else {
            mc.storage.settingChanger.setDataChange(mc.storage.setting);
            cb && cb();
        }
    }
};

mc.storage.readIapNotify = function () {
    if (!mc.storage.iapNotify) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_IAP_NOTIFY);
        if (!cus) {
            cus = {};
        } else {
            cus = JSON.parse(cus);
        }
        mc.storage.iapNotify = cus;
    }
    return mc.storage.iapNotify;
};

mc.storage.readGameEventNotify = function () {
    if (!mc.storage.gameEventNotify) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_GAME_EVENT_NOTIFY);
        if (!cus) {
            cus = 0;
        } else {
            cus = JSON.parse(cus);
        }
        mc.storage.gameEventNotify = cus;
    }
    return mc.storage.gameEventNotify;
};

mc.storage.saveGameEventNotify = function () {
    mc.storage.gameEventNotify = bb.now();
    if (mc.storage.gameEventNotify) {
        cc.sys.localStorage.setItem(mc.const.KEY_GAME_EVENT_NOTIFY, JSON.stringify(mc.storage.gameEventNotify));
    }
};
mc.storage.saveIapNotify = function () {
    if (mc.storage.iapNotify) {
        cc.sys.localStorage.setItem(mc.const.KEY_IAP_NOTIFY, JSON.stringify(mc.storage.iapNotify));
    }
};
mc.storage.readGoblinShop = function () {
    if (!mc.storage.goblinShop) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_GOBLIN_SHOP);
        if (!cus) {
            cus = {
                nextCome: 0,
                markTime: 0
            };
        } else {
            cus = JSON.parse(cus);
        }
        mc.storage.goblinShop = cus;
    }
    return mc.storage.goblinShop;
};

mc.storage.saveGoblinShop = function () {
    if (mc.storage.goblinShop) {
        cc.sys.localStorage.setItem(mc.const.KEY_GOBLIN_SHOP, JSON.stringify(mc.storage.goblinShop));
    }
};
mc.storage.readTestServerConfig = function () {
    if (!mc.storage.testServer) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_TEST_SERVERS);
        mc.storage.testServer = cus || false;
    }
    return mc.storage.testServer;
};

mc.storage.saveTestServerConfig = function () {
    mc.storage.testServer = true;
    cc.sys.localStorage.setItem(mc.const.KEY_TEST_SERVERS, JSON.stringify(mc.storage.testServer));
};
mc.storage.readAutoRetryConfig = function () {
    if (mc.storage.autoRetryConfig === undefined) {
        var cus = cc.sys.localStorage.getItem(mc.const.AUTO_RETRY) || false;
        mc.storage.autoRetryConfig = JSON.parse(cus);
    }
    return mc.storage.autoRetryConfig;
};

mc.storage.saveAutoRetryConfig = function () {
    cc.sys.localStorage.setItem(mc.const.AUTO_RETRY, JSON.stringify(mc.storage.autoRetryConfig));
};

mc.storage.saveChatLastIndex = function () {
    cc.sys.localStorage.setItem(mc.const.CHAT_INDEX, JSON.stringify(mc.storage.chatLastIndex));
};

mc.storage.readChatLastIndex = function () {
    if (!mc.storage.chatLastIndex) {
        var cus = cc.sys.localStorage.getItem(mc.const.CHAT_INDEX);
        mc.storage.chatLastIndex = JSON.parse(cus) || {};
    }
    return mc.storage.chatLastIndex;
};

mc.storage.getClaimedLevelUpReward = function () {
    var levelUpInfo = cc.sys.localStorage.getItem(mc.const.CLAIMED_LEVEL_UP_REWARD_MAP);
    return levelUpInfo && JSON.parse(levelUpInfo);
};

mc.storage.setClaimedLevelUpReward = function (data) {
    cc.sys.localStorage.setItem(mc.const.CLAIMED_LEVEL_UP_REWARD_MAP, JSON.stringify(data));
};

mc.storage.saveEggGameLog = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_EGG_GAME_LOG, JSON.stringify(mc.storage.eggGameLog));
};

mc.storage.readEggGameLog = function () {
    if (!mc.storage.eggGameLog) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_EGG_GAME_LOG);
        mc.storage.eggGameLog = JSON.parse(cus) || {};
    }
    return mc.storage.eggGameLog;
};

mc.storage.saveNewHeroes = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_NEW_HEROES, JSON.stringify(mc.storage.newHeroes));
};

mc.storage.readNewHeroes = function () {
    if (!mc.storage.newHeroes) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_NEW_HEROES);
        mc.storage.newHeroes = JSON.parse(cus) || {};
    }
    return mc.storage.newHeroes;
};

mc.storage.saveNewItems = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_NEW_ITEMS, JSON.stringify(mc.storage.newItems));
};

mc.storage.readNewItems = function () {
    if (!mc.storage.newItems) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_NEW_ITEMS);
        mc.storage.newItems = JSON.parse(cus) || {};
    }
    return mc.storage.newItems;
};

mc.storage.saveItemTabTouched = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_ITEM_TAB, JSON.stringify(mc.storage.itemTabTouched));
};

mc.storage.readItemTabTouched = function () {
    if (!mc.storage.itemTabTouched) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_ITEM_TAB);
        mc.storage.itemTabTouched = JSON.parse(cus) || {};
    }
    return mc.storage.itemTabTouched;
};

mc.storage.saveFeatureNotify = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_FEATURE_NOTIFY, JSON.stringify(mc.storage.featureNotify));
};

mc.storage.readFeatureNotify = function () {
    if (!mc.storage.featureNotify) {
        var cus = cc.sys.localStorage.getItem(mc.const.KEY_FEATURE_NOTIFY);
        mc.storage.featureNotify = JSON.parse(cus) || {};
    }
    return mc.storage.featureNotify;
};

mc.storage.clearNotifyInfo = function () {
    mc.storage.rankRewardTouched = false;
    mc.storage.needUpdateDefArenaTeam = false;
    mc.storage.showedServerInfo = false;
    mc.storage.itemTabTouched = {
        equip: true,
        potion: true,
        soul: true,
        other: true
    };
    mc.storage.featureNotify = {};
    mc.storage.eggGameLog = {};
    mc.storage.newHeroes = {};
    mc.storage.newItems = {};
    mc.storage.addFriendTouched = {};


    mc.storage.saveNewItems();
    mc.storage.saveRankRewardTouched();
    mc.storage.saveNeedUpdateDefArenaTeam();
    mc.storage.saveItemTabTouched();
    mc.storage.saveEggGameLog();
    mc.storage.saveNewHeroes();
    mc.storage.saveFeatureNotify();
    mc.storage.saveAddFriendTouched();
};

mc.storage.readAutoModeTouched = function () {
    try {
        if (!mc.storage.autoModeTouched) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_AUTO_MODE_TOUCHED);
            if (str) {
                mc.storage.autoModeTouched = JSON.parse(str);
            }
        }
    } catch (e) {

    }
    return mc.storage.autoModeTouched;
};


mc.storage.saveRankRewardTouched = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_RANK_REWARDS_TOUCHED, JSON.stringify(mc.storage.rankRewardTouched));
};

mc.storage.readRankRewardTouched = function () {
    try {
        if (!mc.storage.rankRewardTouched) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_RANK_REWARDS_TOUCHED);
            if (str) {
                mc.storage.rankRewardTouched = JSON.parse(str);
            }
        }
    } catch (e) {

    }
    return mc.storage.rankRewardTouched;
};


mc.storage.saveNeedUpdateDefArenaTeam = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_NEED_UPDATE_ARENA_DEF_TEAM, JSON.stringify(mc.storage.needUpdateDefArenaTeam));
};

mc.storage.readNeedUpdateDefArenaTeam = function () {
    try {
        if (!mc.storage.needUpdateDefArenaTeam) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_NEED_UPDATE_ARENA_DEF_TEAM);
            if (str) {
                mc.storage.needUpdateDefArenaTeam = JSON.parse(str);
            }
        }
    } catch (e) {

    }
    return mc.storage.needUpdateDefArenaTeam;
};

mc.storage.saveAutoModeTouched = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_AUTO_MODE_TOUCHED, JSON.stringify(mc.storage.autoModeTouched));
};

mc.storage.readAddFriendTouched = function () {
    try {
        if (!mc.storage.addFriendTouched) {
            var str = cc.sys.localStorage.getItem(mc.const.KEY_ADD_FRIEND_TOUCHED);
            if (str) {
                mc.storage.addFriendTouched = JSON.parse(str);
            }
        }
    } catch (e) {

    }
    return mc.storage.addFriendTouched;
};
mc.storage.saveAddFriendTouched = function () {
    cc.sys.localStorage.setItem(mc.const.KEY_ADD_FRIEND_TOUCHED, JSON.stringify(mc.storage.addFriendTouched));

};

//mc.storage.saveConfirmEggGame = function () {
//    cc.sys.localStorage.setItem(mc.const.KEY_CONFIRM_EGG_GAME, JSON.stringify(mc.storage.confirmEggGame));
//};
//
//mc.storage.readConfirmEggGame = function () {
//    if (!mc.storage.confirmEggGame) {
//        var str = cc.sys.localStorage.getItem(mc.const.KEY_CONFIRM_EGG_GAME);
//        mc.storage.confirmEggGame =  JSON.parse(str);
//    }
//    return mc.storage.confirmEggGame;
//};

mc.storage.MAP_SERVER_STATUS_BY_CODE = {
    "-2": {
        "name": "lblSVClosed",
        "color": mc.color.RED
    },
    "-1": {
        "name": "lblSVFull",
        "color": mc.color.RED
    },
    "1": {
        "name": "lblSVNormal",
        "color": mc.color.GREEN
    },
    "2": {
        "name": "lblSVGood",
        "color": mc.color.GREEN
    },
    "3": {
        "name": "lblSVExcellent",
        "color": mc.color.YELLOW
    },
    "4": {
        "name": "lblSVNew",
        "color": mc.color.YELLOW
    }
};
