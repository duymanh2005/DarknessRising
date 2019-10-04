/**
 * Created by long.nguyen on 9/19/2017.
 */
mc.GUIState = bb.Class.extend({
    _currViewHeroId: null,
    _currChapterName: null,
    _arrDialogIdByScreenId: null,

    _currLayerIdOfMainScreen: null,
    _stackLayerIdOfManScreen: null,
    _stackScreenId: null,
    _guildCreateState: null,
    _currExchangeHeroId: null,
    _currDisarmItemId: null,

    ctor: function () {
        this._arrDialogIdByScreenId = {};
        this._guildCreateState = {
            guildName: null,
            guildDesc: null,
            minRank: "D",
            minLevel: 1,
            joinRule: 0,
            flag: {base: 0, icon: 0}
        };
        this._stackLayerIdOfManScreen = [];
        this._stackScreenId = [];
    },

    getGuildCreateState: function () {
        return this._guildCreateState;
    },

    getGuildHomeTab: function () {
        return this._guildHomeTab;
    },

    setCurrGuildBossShow: function (boss) {
        this._currGuildBossShow = boss;
    },

    getCurrGuildBossShow: function () {
        return this._currGuildBossShow;
    },

    setBackTrackLayerForMainScreen: function (stackId) {
        this._backTrackLayerId = stackId;
    },

    getBackTrackLayerForMainScreen: function () {
        return this._backTrackLayerId;
    },

    setCurrTierHeroesMode: function (mode) {
        this._currTierHeroesMode = mode;
    },

    getCurrTierHeroesMode: function () {
        return this._currTierHeroesMode;
    },

    setStackLayerIdForMainScreen: function (stackId) {
        this._stackLayerIdOfManScreen = stackId;
    },

    getStackLayerIdForMainScreen: function () {
        return this._stackLayerIdOfManScreen;
    },

    clearStackLayerIdForMainScreen: function () {
        this._stackLayerIdOfManScreen = [];
    },

    setCurrentLayerIdForMainScreen: function (layerId) {
        this._currLayerIdOfMainScreen = layerId;
    },

    getCurrentLayerIdForMainScreen: function () {
        return this._currLayerIdOfMainScreen;
    },

    setCurrentViewHeroId: function (heroId) {
        this._currViewHeroId = heroId;
    },

    setCurrentExchangeHeroId: function (heroId) {
        this._currExchangeHeroId = heroId;
    },

    setCurrentDisarmItemId: function (itemId) {
        this._currDisarmItemId = itemId;
    },

    setSelectChapterIndex: function (chapterIndex) {
        this._selectChapterIndex = chapterIndex;
    },

    setSelectStageCampaignIndex: function (stageInfo) {
        this._selectStageIndex = stageInfo;
    },

    setViewStageCampaignModeId: function (viewStageModeId) {
        this._viewStageModeId = viewStageModeId;
    },

    setShowingBossIndex: function(showBossIndex){
        this._showingBossIndex = showBossIndex;
    },

    setCurrentChaosCastleStageIndex: function (chaosCastleStageIndex) {
        this._currChaosCastleStageIndex = chaosCastleStageIndex;
    },
    setCurrentIllusionStageIndex: function (chaosCastleStageIndex) {
        this._currillusionStageIndex = chaosCastleStageIndex;
    },

    setCurrentHardStageModeIndex: function (key, hardStageModeIndex) {
        if (!this._currHardStageModeIndex) {
            this._currHardStageModeIndex = {};
        }
        this._currHardStageModeIndex[key] = hardStageModeIndex;
    },

    getCurrentHardStageModeIndex: function (key) {
        if (!this._currHardStageModeIndex) {
            this._currHardStageModeIndex = {};
        }
        if (this._currHardStageModeIndex[key] != undefined) {
            return this._currHardStageModeIndex[key];
        }
        return -1;
    },

    getShowingBossIndex:function(){
        return this._showingBossIndex;
    },

    getCurrentIllusionStageIndex: function () {
        return this._currillusionStageIndex;
    },

    getCurrentChaosCastleStageIndex: function () {
        return this._currChaosCastleStageIndex;
    },

    setCurrentEditFormationTeamId: function (teamId) {
        this._currFormationTeamId = teamId;
    },

    setCurrentShopCategory: function (shopCategoryId) {
        this._currShopCategoryId = shopCategoryId;
    },

    getCurrentShopCategoryId: function () {
        if (!this._currShopCategoryId) {
            this._currShopCategoryId = mc.ShopManager.SHOP_COMMON;
        }
        return this._currShopCategoryId;
    },

    setCurrentSuggestFriendHeroId: function (suggestFriendHeroId) {
        this._currSuggestFriendHeroId = suggestFriendHeroId;
    },

    setCurrentSlotReplaceFriendHero: function (slotId) {
        this._replaceFriendBySlotId = slotId;
    },

    getCurrentSlotReplaceFriendHero: function () {
        return this._replaceFriendBySlotId;
    },

    getCurrentSuggestFriendHeroId: function () {
        return this._currSuggestFriendHeroId;
    },

    getCurrentEditFormationTeamId: function () {
        if (!this._currFormationTeamId) {
            this._currFormationTeamId = mc.TeamFormationManager.TEAM_CAMPAIGN;
        }
        return this._currFormationTeamId;
    },

    setCurrentChallengeGroupIndex: function (groupIndex) {
        this._currChallengeGroupIndex = groupIndex;
    },

    getCurrentChallengeGroupIndex: function () {
        if (!this._currChallengeGroupIndex) {
            this._currChallengeGroupIndex = 0;
        }
        return this._currChallengeGroupIndex;
    },

    setCurrentChallengeStageIndex: function (challengeStageIndex) {
        this._currChallengeStageIndex = challengeStageIndex;
    },

    getCurrentChallengeStageIndex: function () {
        if (!this._currChallengeStageIndex) {
            this._currChallengeStageIndex = 0;
        }
        return this._currChallengeStageIndex;
    },

    setCurrentEditFormationTeamIndex: function (teamIndex) {
        this._currFormationTeamIndex = teamIndex;
    },

    getCurrentEditFormationTeamIndex: function () {
        if (!this._currFormationTeamIndex) {
            this._currFormationTeamIndex = 0;
        }
        return this._currFormationTeamIndex;
    },

    setCurrentSortingHeroStockIndex: function (filterHeroIndex) {
        this._currSortingHeroStockIndex = filterHeroIndex;
    },

    getCurrentSortingHeroStockIndex: function () {
        if (!this._currSortingHeroStockIndex) {
            this._currSortingHeroStockIndex = 0;
        }
        return this._currSortingHeroStockIndex;
    },

    setCurrentCraftEquipIndex: function (equipIndex) {
        this._currCraftEquipIndex = equipIndex;
    },

    getCurrentCraftEquipIndex: function () {
        if (!this._currCraftEquipIndex) {
            this._currCraftEquipIndex = 0;
        }
        return this._currCraftEquipIndex;
    },

    setCurrentRefineEquipId: function (equipId) {
        this._currRefineEquipId = equipId;
    },

    getCurrentRefineEquipId: function () {
        return this._currRefineEquipId;
    },

    setCurrentRefineOptionEquip: function (equip) {
        this._currRefineOptionEquip = equip;
    },

    getCurrentRefineOptionEquip: function () {
        return this._currRefineOptionEquip;
    },

    setCurrentPageHalloweenFocus: function (currPage) {
        this._currIndexPageHalloweenFocus = currPage;
    },

    getCurrentPageHalloweenFocus: function () {
        if (!this._currIndexPageHalloweenFocus) {
            this._currIndexPageHalloweenFocus = 0;
        }
        return this._currIndexPageHalloweenFocus;
    },

    getViewStageCampaignModeId: function () {
        if (!this._viewStageModeId) {
            this._viewStageModeId = mc.GUIState.VIEW_STAGE_MODE_REWARD;
        }
        return this._viewStageModeId;
    },

    getSelectChapterIndex: function () {
        return this._selectChapterIndex;
    },

    getSelectStageCampaignIndex: function () {
        return this._selectStageIndex;
    },

    setCurrentFindingItemIndex: function (itemIndex) {
        this._currFindingItemIndex = itemIndex;
    },

    getCurrentFindingItemIndex: function () {
        return this._currFindingItemIndex;
    },

    setCurrentFindingMonsterIndex: function (monsterIndex) {
        this._currFindingMonsterIndex = monsterIndex;
    },

    getCurrentFindingMonsterIndex: function () {
        return this._currFindingMonsterIndex;
    },

    getViewHeroId: function () {
        if (!this._currViewHeroId) {
            var heroMap = mc.GameData.heroStock.getHeroMap();
            for (var heroId in heroMap) {
                if (heroMap[heroId]) {
                    this._currViewHeroId = heroId;
                    break;
                }
            }
        }
        return this._currViewHeroId;
    },

    getCurrentExchangeHeroId: function () {
        return this._currExchangeHeroId;
    },

    getCurrentDisarmItemId: function () {
        return this._currDisarmItemId;
    },

    setCurrentQuestGroupId: function (questGroupId) {
        this._currQuestGroupId = questGroupId;
    },

    getCurrentQuestGroupId: function () {
        return this._currQuestGroupId;
    },

    setCurrentSummonPackageGroupId: function (summonGroupId) {
        this._currSummonPackageGroupId = summonGroupId;
    },

    getCurrentSummonPackageGroupId: function () {
        return this._currSummonPackageGroupId;
    },

    setCurrentConversationPrivateId: function (currConversationId) {
        this._currConversationPrivateId = currConversationId;
    },

    setCurrentGroupChatId: function (currGroupChatId) {
        this._currGroupChatId = currGroupChatId;
    },

    //Lấy id Group hiện tại gần nhất user đang xem, 3 Group (World, Clan, Private)
    getCurrentGroupChatId: function () {
        if (!this._currGroupChatId) {
            this._currGroupChatId = mc.ChatSystem.GROUP_CHAT_WORLD_ID;
        }
        return this._currGroupChatId;
    },

    getCurrentConversationPrivateId: function () {
        return this._currConversationPrivateId;
    },

    setReconnecting: function (isReconnect) {
        this._isReconnecting = isReconnect;
    },

    isReconnecting: function () {
        return this._isReconnecting;
    },

    setCurrentSelectBloodCastleLevel:function(currBloodCastleLvl){
        this._currBloodCastleLvl = currBloodCastleLvl;
    },

    getCurrentSelectBloodCastleLevel:function(){
        return this._currBloodCastleLvl || 0;
    },

    pushCurrentScreenId: function () {
        this.pushScreenId(bb.director.getCurrentScreen().getScreenId());
    },

    pushScreenId: function (screenId) {
        if (screenId) {
            this._stackScreenId.push(screenId);
        } else {
            cc.log("CAN NOT PUSH SCREEN_ID = " + screenId);
        }
    },

    popScreen: function () {
        var isDone = false;
        var currScreenId = bb.director.getCurrentScreen().getScreenId();
        if (currScreenId === mc.GUIState.ID_SCREEN_REFINE_ITEM) {
            this.setCurrentRefineEquipId(null);
        } else if (currScreenId === mc.GUIState.ID_SCREEN_CRAFT_ITEM) {
            this.setCurrentCraftEquipIndex(null);
        } else if (currScreenId === mc.GUIState.ID_SCREEN_TIER_HEROES) {
            this.setCurrTierHeroesMode(null);
        }

        var nextScreenId = this._stackScreenId.pop();
        if (nextScreenId === mc.GUIState.ID_SCREEN_CHAOSCASTLE) {
            new mc.ChaosCastleScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_MAIN) {
            new mc.MainScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_EDITFORMATION) {
            new mc.EditFormationScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_INVOLVE_HERO) {
            new mc.InvolveHeroScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_SUMMON_ITEM) {
            new mc.SummonItemScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_SHOP) {
            new mc.ShopScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_REFINE_ITEM) {
            new mc.UpgradeEquipmentScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_CRAFT_ITEM) {
            new mc.CraftItemScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_TIER_HEROES) {
            new mc.TierHeroStockScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_ITEM_WIKI) {
            new mc.ItemsWikiScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_MONSTER_WIKI) {
            new mc.MonsterWikiScreen().show();
            isDone = true;
        } else if (nextScreenId === mc.GUIState.ID_SCREEN_EGG_GAME) {
            new mc.EggGameScreen().show();
            isDone = true;
        } else {
            cc.log("DO NOT IMPLEMENT POP SCREEN: " + nextScreenId);
            cc.log("RETURN TO MAIN SCREEN: " + nextScreenId);
        }

        return isDone;
    },

    pushDialogStackIdForScreen: function (screenId, dialogId, data) {
        if (!this._arrDialogIdByScreenId[screenId]) {
            this._arrDialogIdByScreenId[screenId] = [];
        }
        this._arrDialogIdByScreenId[screenId].push({id: dialogId, data: data});
    },

    popDialogStackIdForScreen: function (screenId, dialogId) {
        if (!this._arrDialogIdByScreenId[screenId]) {
            this._arrDialogIdByScreenId[screenId] = [];
        }
        var arr = null;
        if (dialogId) {
            for (var i = 0; i < this._arrDialogIdByScreenId[screenId].length; i++) {
                if (this._arrDialogIdByScreenId[screenId][i].id === dialogId) {
                    this._arrDialogIdByScreenId[screenId].splice(i, 1);
                    break;
                }
            }
            arr = this._arrDialogIdByScreenId[screenId];
        } else {
            arr = [];
            for (var i = 0; i < this._arrDialogIdByScreenId[screenId].length; i++) {
                arr[i] = this._arrDialogIdByScreenId[screenId][i];
            }
            this._arrDialogIdByScreenId[screenId] = [];
        }
        return arr;
    }

});
mc.GUIState.ID_SCREEN_MAIN = "screen_main";
mc.GUIState.ID_SCREEN_CHAOSCASTLE = "screen_chaos_castle";
mc.GUIState.ID_SCREEN_EDITFORMATION = "screen_edit_formation";
mc.GUIState.ID_SCREEN_SHOP = "screen_shop";
mc.GUIState.ID_SCREEN_CRAFT_ITEM = "screen_craft_item";
mc.GUIState.ID_SCREEN_TIER_HEROES = "screen_tier_heroes";
mc.GUIState.ID_SCREEN_ITEM_WIKI = "screen_item_wiki";
mc.GUIState.ID_SCREEN_MONSTER_WIKI = "screen_mosnter_wiki";
mc.GUIState.ID_SCREEN_EGG_GAME = "screen_egg_game";
mc.GUIState.ID_SCREEN_HERO_MAX_LV_INFO = "screen_hero_max_lv_info";
mc.GUIState.ID_SCREEN_MONSTER_INFO = "screen_monster_info";
mc.GUIState.ID_SCREEN_REFINE_ITEM = "screen_refine_item";
mc.GUIState.ID_SCREEN_INVOLVE_HERO = "screen_involve_hero";
mc.GUIState.ID_SCREEN_SUMMON_ITEM = "screen_summon_item";
mc.GUIState.ID_DIALOG_STAGE_LIST = "dialog_stage_list";
mc.GUIState.ID_DIALOG_SELECT_HERO = "dialog_select_hero";
mc.GUIState.ID_DIALOG_SELECT_BATTLE_HERO_NORMAL = "dialog_select_battle_hero_normal";
mc.GUIState.ID_DIALOG_VS = "dialog_vs";
mc.GUIState.ID_DIALOG_CHAOS_RULES = "dialog_chaos_rules";
mc.GUIState.VIEW_STAGE_MODE_REWARD = "view_stage_mode_reward";
mc.GUIState.VIEW_STAGE_MODE_MONSTER = "view_stage_mode_monster";
