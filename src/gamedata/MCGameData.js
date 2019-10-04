/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.GameData = cc.Class.extend({
    svTime: 0,
    svLoginTime: 0,

    initStaticData: function () {
        !this.exception && (this.exception = new mc.Exception());
        !this.connectionState && (this.connectionState = new mc.ConnectionState());
        !this.tutorialManager && (this.tutorialManager = new mc.TutorialManager());
        !this.storyManager && (this.storyManager = new mc.StoryManager());
        !this.settingManager && (this.settingManager = new mc.SettingManager());
        !this.playerInfo && (this.playerInfo = new mc.PlayerInfo());
        !this.paymentSystem && (this.paymentSystem = new mc.PaymentSystem());
        !this.teamFormationManager && (this.teamFormationManager = new mc.TeamFormationManager());
        !this.refreshGameFunctionSystem && (this.refreshGameFunctionSystem = new mc.RefreshFunctionSystem());
        !this.assetChanger && (this.assetChanger = new mc.AttributeChanger());
        !this.stageChanger && (this.stageChanger = new mc.AttributeChanger());
        !this.accountChanger && (this.accountChanger = new mc.AttributeChanger());
        !this.lvlUpEvent && (this.lvlUpEvent = new mc.AttributeChanger());
        !this.heroInfoChangerCollection && (this.heroInfoChangerCollection = new mc.DataChangerCollection());
        !this.summonManager && (this.summonManager = new mc.SummonManager());
        !this.questManager && (this.questManager = new mc.QuestManager());
        !this.questTrigger && (this.questTrigger = new mc.QuestTrigger());
        !this.shopManager && (this.shopManager = new mc.ShopManager());
        !this.campaignManager && (this.campaignManager = new mc.CampaignManger());
        !this.chaosCastleManager && (this.chaosCastleManager = new mc.ChaosCastleManager());
        !this.illusionManager && (this.illusionManager = new mc.IllusionManager());
        !this.friendManager && (this.friendManager = new mc.FriendManager());
        !this.stageInBattle && (this.stageInBattle = new mc.StageInBattle());
        !this.stageBossInBattle && (this.stageBossInBattle = new mc.StageBossInBattle());
        !this.chaosCastleInBattle && (this.chaosCastleInBattle = new mc.ChaosCastleInBattle());
        !this.illusionInBattle && (this.illusionInBattle = new mc.IllusionInBattle());
        !this.worldBossInBattle && (this.worldBossInBattle = new mc.WorldBossInBattle());
        !this.guildBossInBattle && (this.guildBossInBattle = new mc.GuildBossInBattle());
        !this.arenaInBattle && (this.arenaInBattle = new mc.ArenaInBattle());
        !this.friendSoloInBattle && (this.friendSoloInBattle = new mc.FriendSoloInBattle());
        !this.replayArenaInBattle && (this.replayArenaInBattle = new mc.ReplayArenaInBattle());
        !this.replayFriendSoloInBattle && (this.replayFriendSoloInBattle = new mc.ReplayFriendSoloInBattle());
        !this.challengeInBattle && (this.challengeInBattle = new mc.ChallengeInBattle());
        !this.bloodCastleInBattle && (this.bloodCastleInBattle = new mc.BloodCastleInBattle());
        !this.bloodCastleManager && (this.bloodCastleManager = new mc.BloodCastleManager());
        !this.arenaManager && (this.arenaManager = new mc.ArenaManager());
        !this.relicArenaManager && (this.relicArenaManager = new mc.RelicArenaManager());
        !this.friendSoloManager && (this.friendSoloManager = new mc.FriendSoloManager());
        !this.challengeManager && (this.challengeManager = new mc.ChallengeManager());
        !this.mailManager && (this.mailManager = new mc.MailManager());
        !this.resultInBattle && (this.resultInBattle = new mc.ResultInBattle());
        !this.heroStock && (this.heroStock = new mc.HeroStock());
        !this.itemStock && (this.itemStock = new mc.ItemStock());
        !this.giftEventManager && (this.giftEventManager = new mc.GiftEventManager());
        !this.ratingManager && (this.ratingManager = new mc.RatingManager());
        !this.notifySystem && (this.notifySystem = new mc.NotifySystem());
        !this.mineSystem && (this.mineSystem = new mc.MineSystem());
        !this.worldBossSystem && (this.worldBossSystem = new mc.WorldBossSystem());
        !this.guildBossSystem && (this.guildBossSystem = new mc.GuildBossSystem());
        !this.stageBossSystem && (this.stageBossSystem = new mc.BonusStageBossSystem());

        !this.guiController && (this.guiController = new mc.GUIController());
        !this.dynamicDailyEvent && (this.dynamicDailyEvent = new mc.DynamicDailyEvent());
        !this.chatSystem && (this.chatSystem = new mc.ChatSystem());
        !this.guildManager && (this.guildManager = new mc.GuildManager());
        !this.relicArenaInBattle && (this.relicArenaInBattle = new mc.RelicArenaInBattle());
        !this.replayRelicArenaInBattle && (this.replayRelicArenaInBattle = new mc.ReplayRelicArenaInBattle());
        !this.seenGUIManager && (this.seenGUIManager = new mc.SeenGUIManager());
        // remember clearStaticData

        this.itemStock.registerItemChangeListener(this.seenGUIManager);
        this.itemStock.registerItemChangeListener(this.playerInfo);
    },

    cleanStaticData: function () {
        this.heroInfoChangerCollection = null;
        // clear all bb.Class
        for(var key in this){
            if( this[key] && this[key].getGlueName &&
                this[key] != this.guiState ){
                this[key] = null;
                delete  this[key];
            }
        }
    },

    cleanGUIState: function () {
        this.guiState = new mc.GUIState();
    },

    canUnlockFunction: function (funcCode) {
        var unlock = null;
        var isSupport = mc.dictionary.isSupportFunction(funcCode);
        if (isSupport) {
            var stageMap = mc.dictionary.stageMapByIndex;
            if (funcCode === mc.const.FUNCTION_SPECIAL_EVENT) {
                unlock = {};
                unlock.isUnlock = true; // clear this stage
                unlock.stageIndex = -1;
            } else {
                for (var stageIndex in stageMap) {
                    stageIndex = parseInt(stageIndex);
                    var unlockCode = mc.CampaignManger.getUnlockCodeByStageIndex(stageIndex);
                    if (unlockCode === funcCode) {
                        unlock = {};
                        unlock.isUnlock = mc.const.CHEAT_UNLOCK_ALL || (mc.GameData.playerInfo.getCurrentStageIndex() > stageIndex); // clear this stage
                        unlock.stageIndex = stageIndex;
                        break;
                    }
                }
            }
        }
        return unlock;
    },

    svNow: function () {
        return this.svTime;
    },

    svStartTime: function () {
        return this.svLoginTime;
    },

    liveTime: function () {
        return this.svNow() - this.svStartTime();
    }

});
mc.GameData = new mc.GameData();
mc.GameData.guiState = new mc.GUIState();

mc.ConnectionState = bb.Class.extend({
    _state: null,

    setState: function (state) {
        this._state = state;
        this.notifyDataChanged();
    },

    getState: function () {
        return this._state;
    },

    isClose: function () {
        return this._state === mc.ConnectionState.SOCKET_STATE_CLOSE;
    },

    isError: function () {
        return this._state === mc.ConnectionState.SOCKET_STATE_ERROR;
    },

    isOpen: function () {
        return this._state === mc.ConnectionState.SOCKET_STATE_OPEN;
    },

    isOpened: function () {
        return this._state === mc.ConnectionState.SOCKET_STATE_LOGON;
    }
});
mc.ConnectionState.SOCKET_STATE_OPEN = "open";
mc.ConnectionState.SOCKET_STATE_ERROR = "error";
mc.ConnectionState.SOCKET_STATE_CLOSE = "close";
mc.ConnectionState.SOCKET_STATE_LOGON = "logon";

mc.LoginState = bb.Class.extend({

    setState: function (state) {
        this._state = state;
        this.notifyDataChanged();
    },

    getState: function () {
        return this._state;
    }

});
mc.LoginState.STATE_LOAD_HERO = "load_heroes";
mc.LoginState.STATE_LOAD_ITEM = "load_items";
mc.LoginState.STATE_LOAD_ITEM = "load_items";

mc.AttributeChanger = bb.Class.extend({
    _isDataChanged: false,
    _oldJson: null,
    _curJson: null,

    setData: function (json) {
        if (!this._oldJson) {
            this._oldJson = {};
        }
        if (this._curJson) {
            for (var key in this._curJson) {
                this._oldJson[key] = this._curJson[key];
            }
        } else {
            for (var key in json) {
                this._oldJson[key] = "T_T";
            }
        }

        if (!this._curJson) {
            this._curJson = {};
        }
        for (var key in json) {
            this._curJson[key] = json[key];
        }
    },

    setAttachData: function (json) {
        this._attachData = json;
        return this;
    },

    getAttachData: function () {
        return this._attachData;
    },

    setDataChange: function (json, ignoreNotify) {
        this.setData(json);
        if (!ignoreNotify) {
            this._isDataChanged = true;
            this.notifyDataChanged();
        }
        return this;
    },

    _iterate: function (callback) {
        var curJson = this.getCurrentJson();
        var oldJson = this.getOldJson();
        for (var key in curJson) {
            var oldVal = oldJson[key];
            var curVal = curJson[key];
            if (oldVal != curVal) {
                callback && callback(oldVal, curVal, key);
            }
        }
    },

    getChangingMap: function () {
        if (this._isDataChanged) {
            var map = {};
            var haveChange = false;
            this._iterate(function (oldVal, curVal, key) {
                haveChange = true;
                map[key] = {o: oldVal, c: curVal};
            });
            return haveChange ? map : null;
        }
        return null;
    },

    performChanging: function (mapCallback, force) {
        if (this._isDataChanged || force) {
            if (mapCallback) {
                this._iterate(function (oldVal, curVal, key) {
                    mapCallback[key] && mapCallback[key](oldVal, curVal, this);
                }.bind(this));
            }
            this._isDataChanged = false;
            return true;
        }
        return false;
    },

    getOldJson: function () {
        return this._oldJson;
    },

    getCurrentJson: function () {
        return this._curJson;
    }

});

mc.DataChangerCollection = cc.Class.extend({
    _mapChanger: null,

    ctor: function () {
        this._mapChanger = {};
    },

    removeChanger: function (id) {
        if (this._mapChanger[id]) {
            delete this._mapChanger[id];
        }
    },

    getChanger: function (id) {
        if (!this._mapChanger[id]) {
            this._mapChanger[id] = new mc.AttributeChanger();
        }
        return this._mapChanger[id];
    },

    getMap: function () {
        return this._mapChanger;
    }
});

mc.GameData.CHECK_SLOT_TYPE_HERO = "hero";
mc.GameData.CHECK_SLOT_TYPE_ITEM = "item";
mc.GameData.checkForAvailableSlot = function (type) {
    var maxSlot = 0;
    var currSlot = 0;
    var limit = 0;
    switch (type) {
        case mc.GameData.CHECK_SLOT_TYPE_HERO:
            maxSlot = mc.GameData.playerInfo.getMaxHeroSlot();
            currSlot = mc.GameData.heroStock.getHeroList().length;
            limit = mc.const.MAX_HERO_SLOT;
            break;
        case mc.GameData.CHECK_SLOT_TYPE_ITEM:
            maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
            var arrEquipInStock = mc.GameData.itemStock.getItemList(function (itemInfo) {
                return mc.ItemStock.isItemEquipment(itemInfo);
            });
            currSlot = arrEquipInStock.length;
            limit = mc.const.MAX_ITEM_SLOT;
            break;
    }
    var buyMore = false;
    var availableSlots = maxSlot - currSlot;
    if (availableSlots <= 0) {
        buyMore = maxSlot < limit;
    }
    return {buyMore: buyMore, avaiSlots: availableSlots};

};
