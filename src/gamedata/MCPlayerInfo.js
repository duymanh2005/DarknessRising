/**
 * Created by long.nguyen on 6/30/2017.
 */

mc.PlayerInfo = bb.Class.extend({
    _staminaProgress: null,
    _arenaTicketProgress: null,
    _currPartInBattle: null,
    maxItemSlot: null,
    maxHeroSlot: null,
    maxVaulItemSlot: 0,
    maxVaultSlot: null,
    _lastEarningStageExp: null,

    _playBattleCampaignTimeInLaugh: 0,

    ctor: function () {
        this._super();
        this._staminaProgress = new mc.Progress();
        this._arenaTicketProgress = new mc.Progress();
        this._spinTicketProgress = new mc.Progress();
    },

    onWillChangeItemInfo: function (itemInfo) {
    },

    onDidChangeItemInfo: function (itemInfo) {
        if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_SPIN_TICKET) {
            this._initSpinTicketProgress(); // the temp code for working...
            if (this.getSpinTicket() === 0) {
                mc.storage.featureNotify.spinLayerShowFirstTime = false;
                mc.storage.saveFeatureNotify();
            }
        }
    },

    setCreantsSAcc: function (json) {
        this.copyAttr(json);
    },

    setLastEarningStageExp: function (value) {
        this._lastEarningStageExp = value;
    },

    getLastEarningStageExp: function () {
        return this._lastEarningStageExp;
    },

    setMUAcc: function (jsonMuInfo) {
        this.copyAttr(jsonMuInfo).ignoreAttr(["heroes", "quest"]);
    },

    initProgress: function () {
        this._initStaminaProgress();
        this._initArenaTicketProgress();
        this._initSpinTicketProgress();
    },

    setAssetMap: function (assetMap) {
        if (!this["assetMap"]) {
            this["assetMap"] = {};
        }
        for (var key in assetMap) {
            this["assetMap"][key] = assetMap[key];
            if (key == mc.const.ITEM_INDEX_STAMINA) {
                this._initStaminaProgress();
            } else if (key == mc.const.ITEM_INDEX_ARENA_TICKET) {
                this._initArenaTicketProgress();
            } else if (key === mc.const.ITEM_INDEX_SPIN_TICKET) {
                this._initSpinTicketProgress();
            }
        }
    },

    updateRelicCoin: function (delta) {
        var assetMap = this["assetMap"];
        var curr = assetMap[mc.const.ITEM_INDEX_RELIC_COIN];
        curr = curr + delta;
        if (curr < 0) {
            curr = 0;
        }
        assetMap[mc.const.ITEM_INDEX_RELIC_COIN] = curr;
    },

    countPlayingCampaignBattleTimeInLaugh: function () {
        this._playBattleCampaignTimeInLaugh++;
    },

    getPlayCampaignBattleTimeInLaugh: function () {
        return this._playBattleCampaignTimeInLaugh;
    },

    setAccountLvlUp: function (lvlUpInfo) {
        this.copyAttr(lvlUpInfo).ignoreAttr(["reward", "update"]);
        this._initStaminaProgress();
    },

    setName: function (name) {
        this.name = name;
    },

    setAvatar: function (avatar) {
        this.avatar = avatar;
    },

    setCurrentPartInBattle: function (currBattle) {
        this._currPartInBattle = currBattle;
    },

    setChapter: function (json) {
        this.copyAttr(json);
    },

    isRated: function () {
        return this.rated;
    },

    setRated: function (rate) {
        this.rated = rate;
    },

    setArenaTicketTime: function (arenaTicketTime) {
        this.arenaTicketTime = arenaTicketTime || bb.now();
    },
    setStaminaTime: function (staminaTime) {
        this.staminaTime = staminaTime || bb.now();
    },
    setSpinTicketTime: function (spinTicketTime) {
        this.spinTicketTime = spinTicketTime || bb.now();
    },

    _initStaminaProgress: function () {
        var assetMap = this["assetMap"];
        this._staminaProgress.setValue(assetMap[mc.const.ITEM_INDEX_STAMINA], this.maxStamina);
        this._staminaProgress.setStartProgressTime(this.staminaTime);
        this._staminaProgress.setProductionValuePerSecond(mc.const.PRODUCTION_STAMINA_PER_SECOND);
    },

    _initArenaTicketProgress: function () {
        var assetMap = this["assetMap"];
        this._arenaTicketProgress.setValue(assetMap[mc.const.ITEM_INDEX_ARENA_TICKET], mc.const.MAX_ARENA_TICKET);
        this._arenaTicketProgress.setStartProgressTime(this.arenaTicketTime);
        this._arenaTicketProgress.setProductionValuePerSecond(mc.const.PRODUCTION_ARENA_PER_SECOND);
    },

    _initSpinTicketProgress: function () {
        var assetMap = this["assetMap"];
        var spinTicketInfo = mc.GameData.itemStock.getOverlapItemByIndex(mc.const.ITEM_INDEX_SPIN_TICKET);
        this._spinTicketProgress.setValue(spinTicketInfo ? mc.ItemStock.getItemQuantity(spinTicketInfo) : 0, mc.const.MAX_SPIN_TICKET);
        this._spinTicketProgress.setStartProgressTime(this.spinTicketTime);
        this._spinTicketProgress.setProductionValuePerSecond(mc.const.PRODUCTION_SPIN_PER_SECOND);
    },

    reloadSpinTicketProgress : function(){
        this._initSpinTicketProgress();
    },

    getCurrentPartInBattle: function () {
        return this._currPartInBattle;
    },

    getCurrentChapterIndex: function () {
        return this.chapter_index;
    },

    getCurrentStageIndex: function () {
        return this.stage_index;
    },

    getDurationProductionPerStamina: function () {
        return this._staminaProgress.getDurationProductionPerValue();
    },

    getDurationProductionPerArenaTicket: function () {
        return this._arenaTicketProgress.getDurationProductionPerValue();
    },

    getDurationProductionPerSpinTicket: function () {
        return this._spinTicketProgress.getDurationProductionPerValue();
    },

    getStamina: function () {
        return this._staminaProgress.getCurrentValue();
    },

    getMaxStamina: function () {
        return this._staminaProgress.getMaxValue();
    },
    getMaxItemSlot: function () {
        return this.maxItemSlot;
    },
    getMaxHeroSlot: function () {
        return this.maxHeroSlot;
    },
    getMaxVaultSlot: function () {
        return this.maxVaulItemSlot;
    },

    getExp: function () {
        return this.exp || 0;
    },

    getMaxExp: function () {
        return this.maxExp || 1;
    },

    getZen: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_ZEN] || 0;
    },

    getFriendPoint: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_FRIEND_POINTS] || 0;
    },

    getArenaTicket: function () {
        return this._arenaTicketProgress.getCurrentValue();
    },

    getSpinTicket: function () {
        return this._spinTicketProgress.getCurrentValue();
    },

    getArenaCoins: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_ARENA_COINS] || 0;
    },

    getChaosCoins: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_CHAOS_COINS] || 0;
    },

    getBless: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_BLESS] || 0;
    },

    getIceCream: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_ICE_CREAM] || 0;
    },

    getHalloweenCoin: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_HALLOWEEN_COIN] || 0;
    },

    getGuildCoin: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_GUILD_COIN] || 0;
    },

    getRelicCoin: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_RELIC_COIN] || 0;
    },

    getLifeOrb: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_LIFEORB] || 0;
    },

    getBloodStone:function(){
        return this["assetMap"][mc.const.ITEM_INDEX_BLOODSTONE] || 0;
    },

    getBorrowFriendTicket: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_BORROW_FRIEND_TICKET] || 0;
    },

    getIllusionTicket: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_ILLUSION_TICKET] || 0;
    },

    getBloodCastleTicket: function () {
        return this["assetMap"][mc.const.ITEM_INDEX_BLOODCASTLE_TICKET] || 0;
    },

    getNumberOfCurrencyByKey:function(key){
        return this["assetMap"][key] || 0;
    },

    setVIPTimer: function (vipTimer) {
        this.vipTimer = vipTimer;
    },

    getVIPTimer: function () {
        return this.vipTimer ? this.vipTimer : 0;
    },

    isVIP: function () {
        var vipTimer = this.getVIPTimer();
        var dur = mc.GameData.liveTime();
        return vipTimer > 0 && dur < vipTimer;
    },

    getAsset: function (key) {
        return this["assetMap"][key];
    },

    getChaosTicket: function () {
        return mc.ItemStock.getItemQuantity(mc.GameData.itemStock.getOverlapItemByIndex(mc.const.ITEM_INDEX_CHAOS_TICKET));
    },

    getSummonTicket: function () {
        return mc.ItemStock.getItemQuantity(mc.GameData.itemStock.getOverlapItemByIndex(mc.const.ITEM_INDEX_SUMMON_TICKET));
    },

    setRehilSeconds: function (rehilSeconds) {
        this.rehilSeconds = rehilSeconds;
    },

    getRehilSecondById: function (id) {
        return (this.rehilSeconds && this.rehilSeconds[id]) ? this.rehilSeconds[id] : 0;
    },

    setArenaWinNo: function (winNo) {
        this._arenaWinNo = winNo;
    },

    setLeague: function (league) {
        this._league = league || "D";
    },

    getLeague: function () {
        return this._league;
    },

    setRank: function (rank) {
        this._rank = rank;
    },

    getRank: function () {
        return this._rank;
    },

    getAvatarIndex: function () {
        return parseInt(this.avatar);
    },

    getName: function () {
        return this.name;
    },

    getLevel: function () {
        return this.level;
    },

    getId: function () {
        return this.id;
    },

    getUserId: function () {
        return this.userId;
    },

    isHaveMuAcc: function () {
        return this.id != null;
    },

    isLoggedIn: function () {
        return this.isHaveMuAcc();
    },

    setLogOut: function () {
        this.id = null;
    },

    newObject: function () {
        return new mc.PlayerInfo();
    }

});