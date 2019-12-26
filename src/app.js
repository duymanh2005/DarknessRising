var mc = mc || {};
mc.const = {
    ////////////////////////////////////////////////////
    // important code! do not forget to TURN-OFF!!!!!!!!!
    SERVER_MAINTENANCE: false,
    DEBUG_GAME: true,
    ENABLE_LOG: false,
    ENABLE_BATTLE_LOG: false,
    ENABLE_SPINE_LOG: false,
    ENABLE_TEST_FLIGHT: false,
    FULL_VERSION: false,
    ENABLE_REPLACE_FONT_BM: false,
    IS_EN_LANGUAGE : false,

    CHEAT_UNLOCK_ALL: false,
    CHEAT_GOD_DAMAGE: 0,
    CHEAT_GOD_HP: 0,
    CHEAT_GOD_MP: 0,
    CHEAT_WIN_BATTLE_DURATION: 0.0,
    CHEAT_WIN_WAVE_DURATION: 0.0,
    CHEAT_LAST_ROUND: false,
    CHEAT_EFFECT_PERCENT_RATE: false,
    TEST_DEVICE: null,
    TEST_TEXT_MISSING: false,
    TEST_CREATURE_BY_CAMPAIGN: null,
    SKIP_TUTORIAL_BATTLE: false,
    BATTLE_VERSION: "1.0",
    VERSION: "1.0.0",
    VERSION_NEWS: "1.0.6",
    SERVERS: {
        "servers": [
            {
                "id": 1,
                "svn": "mus1",
                "auth": "http://192.168.5.106:9393/",
                "ws": "ws://192.168.5.106:9494/ws",
                "name": "S1: Legendary",
                "type": "REAL",
                "statusCode": 2
            }
        ]
    },


    /////////////////////////////////////////////////////////

    ///////////////////// DO NOT EDIT
    KEY_STORAGE_SETTING: "storage_setting",
    KEY_IAP_BUY_TIMES: "save_obj_iap_buy_times",
    KEY_STORAGE_CONSUMABLE_SLOT_MAP: "storage_consumable_slot_map",
    KEY_STORAGE_LOGIN_SERVER: "storage_login_server",
    KEY_STORAGE_CUSTOM: "storage_custom",
    KEY_IAP_NOTIFY: "iap_notify",
    KEY_GAME_EVENT_NOTIFY: "game_event_notify",
    KEY_GOBLIN_SHOP: "goblin_shop",
    KEY_TEST_SERVERS: "test_server",
    KEY_LAST_VERSION: "last_version",
    KEY_CONFIRM_EGG_GAME: "confirm_egg_game",
    KEY_EGG_GAME_LOG: "egg_game_log",
    KEY_NEW_HEROES: "new_heroes",
    KEY_NEW_ITEMS: "new_items",
    KEY_FEATURE_NOTIFY: "feature_notify",
    AUTO_RETRY: "auto_retry",
    CHAT_INDEX: "chat_last_index",
    NEWS_LAST_VERSION: "NEWS_LAST_VERSION",
    KEY_ENCRYPT: "mu",
    KEY_JOINED_SERVER: "joined_server",
    KEY_JOINED_SERVER_2: "joined_server2",
    KEY_AUTO_MODE_TOUCHED: "auto_mode_touched",
    KEY_ADD_FRIEND_TOUCHED: "add_friend_touched",
    KEY_NEED_UPDATE_ARENA_DEF_TEAM: "need_update_arena_def_team",
    KEY_RANK_REWARDS_TOUCHED: "rank_rewards_touched",
    KEY_STORAGE_INAPP_TOKEN: "in_app_token",
    KEY_ITEM_TAB: "item_tab",
    //PACKAGE_NAME: "com.creants.muheroes",
    PACKAGE_NAME: "com.creants.mightyunionheroes",
    URL_TERM: "https://rpgwikigames.com/privacy-policy",
    URL_PRIVACY: "https://rpgwikigames.com/privacy-policy",
    DEFAULT_HEIGHT: 1334,

    LANGUAGE_DEFAULT: "en",
    LANGUAGE_EN: "en",
    LANGUAGE_VI: "vi",
    LANGUAGE_TH: "th",
    LANGUAGE_ID: "id",
    LANGUAGE_RU: "ru",
    LANGUAGE_IT: "it",
    LANGUAGE_ES: "es",
    //////////////////////////////////////////////

    ITEM_INDEX_BLESS: 11999,
    ITEM_INDEX_ICE_CREAM: 12998,
    ITEM_INDEX_SOUL: 11001,
    ITEM_INDEX_CHAOS: 11002,
    ITEM_INDEX_LIFE: 11006,
    ITEM_INDEX_CREATION: 11007,
    ITEM_INDEX_ZEN: 11905,
    ITEM_INDEX_FRIEND_POINTS: 11906,
    ITEM_INDEX_ARENA_COINS: 11907,
    ITEM_INDEX_CHAOS_COINS: 11908,
    ITEM_INDEX_ARENA_TICKET: 11919,
    ITEM_INDEX_CHAOS_TICKET: 11044,
    ITEM_INDEX_STAMINA: 11910,
    ITEM_INDEX_RENAME: 11950,
    ITEM_INDEX_RAID_TICKET: 11051,
    ITEM_INDEX_SUMMON_TICKET: 11909,
    ITEM_INDEX_LIGHT_SPHERE: 11052,
    ITEM_INDEX_DARK_SPHERE: 11053,
    ITEM_INDEX_FIRE_SPHERE: 11054,
    ITEM_INDEX_EARTH_SPHERE: 11055,
    ITEM_INDEX_WATER_SPHERE: 11056,
    ITEM_INDEX_HEROSOUL: 999999,
    ITEM_INDEX_BOX: 11057,
    ITEM_INDEX_SPIN_TICKET: 11960,
    ITEM_INDEX_HALLOWEEN_COIN: 11961,
    ITEM_INDEX_GUILD_COIN: 11964,
    ITEM_INDEX_WORLD_CHAT: 11965,
    ITEM_INDEX_RELIC_COIN: 11998,
    ITEM_INDEX_LIFEORB: 11913,
    ITEM_INDEX_BLOODSTONE: 11060,

    TUTORIAL_CHARACTER_DRAGON: 113,
    TUTORIAL_CHARACTER_ELF: 354,
    TUTORIAL_CHARACTER_WIZARD: 204,

    TUTORIAL_MONSTER_1: 1005,
    TUTORIAL_MONSTER_2: 1006,
    TUTORIAL_MONSTER_3: 1007,
    TUTORIAL_MONSTER_KUNDUN: 9999,

    TEST_GAME_TOKEN: null,

    PING_TIME_OUT: 5,
    REQUEST_TIME_OUT: 30,
    BATTLE_TIME_SCALE: 1.0,
    SPINE_SCALE: 0.1,
    PRODUCTION_STAMINA_PER_SECOND: 5 / (15 * 60),// 15m -> 5 ve
    PRODUCTION_ARENA_PER_SECOND: 1 / (20 * 60),//20m -> 1 vé
    PRODUCTION_SPIN_PER_SECOND: 0,// get from config.json
    SEARCH_ARENA_OPPONENT_GOLD: 10000,

    SEPARATOR_NUMBER_CONSUMABLE_ITEM: 11000,
    MAX_ITEM_IN_STOCK: 255,
    MAX_HERO_IN_STOCK: 255,
    MAX_HERO_RANK: 5,
    MAX_ITEM_RANK: 5,
    MAX_HERO_LEVEL: 100,
    MAX_ITEM_LEVEL: 15,
    MAX_ARENA_TICKET: null, // get from 'config.json'
    MAX_SPIN_TICKET: null, // get from 'config.json'
    MAX_DAILY_REWARD: null, // get from 'config.json'
    MAX_CHALLENGE_CHANCE: 3,
    MAX_BLOOD_CASTLE_CHANCE: 2,
    MAX_BATTLE_DURATION_IN_MS: 3 * 60 * 1000,
    MAX_BATTLE_WORD_CHALLENGE_DURATION_IN_MS: 5 * 60 * 1000,
    MAX_BATTLE_BLOOD_CASTLE_IN_MS: 10 * 60 * 1000,
    MAX_RATING_SLEEP_IN_SECOND: 2 * 60 * 60 * 24,
    MAX_PLAY_BATTLE_TIME_IN_LAUGH: 5,
    MAX_FRIEND: 50,
    MAX_REQUIRED_ITEM_OPT_LEVEL: 11,
    MAX_HERO_SLOT: 120,
    MAX_ITEM_SLOT: 120,
    MAX_VAULT_SLOT: 120,
    MAX_PLAYER_AVATAR: 26,
    MAX_MESSAGE_CHAR: 200,
    MAX_DPS: 200000,
    MAX_HPD: 300000,
    MAX_HERO_LEVEL_BY_RANK: {1: 20, 2: 40, 3: 60, 4: 80, 5: 100, 6: 120, 7: 140, 8: 160},
    MAX_HERO_SOUL: 100,
    MAX_NAME_LENGTH: 15,
    SPEED_BATTLE_X1: 0,
    SPEED_BATTLE_X2: 1,
    SPEED_BATTLE_X3: 2,
    BATTLE_SCALE_TIME_BY_SPEED: {
        0: 1.25,
        1: 2.00,
        2: 2.75
    },
    REQUIRE_LEVEL_TRANSFER_RELIC: 31,
    TIME_REQUEST_COUNT_DOWN: 60,
    TIME_BEFORE_PICK_HERO_COUNT_DOWN: 10,
    //MAX_BATTLE_DURATION_IN_MS : 20*1000,

    SKILL_AFFECT_TYPE_SELF: "self",
    SKILL_AFFECT_TYPE_ALLIES: "allies",
    SKILL_AFFECT_TYPE_ENEMIES: "enemy",
    SKILL_AFFECT_TYPE_SAME_TEAM: "team",
    SKILL_AFFECT_TYPE_SELF_AND_ALLIES: "self&allies",

    SKILL_TYPE_ACTIVE: "active",
    SKILL_TYPE_PASSIVE: "passive",
    SKILL_TYPE_LEADER: "leader",
    SKILL_TYPE_AUTO_CAST: "autocast",
    SKILL_TYPE_ITEM: "item",

    MAP_NUMBER_TARGET_BY_REGION: {
        "single": 1,
        "aoe": 5,
        "double": 2,
        "triple": 3,
        "quadra": 4
    },

    DAMAGE_TYPE_PHYSIC: "atk",
    DAMAGE_TYPE_MAGIC: "mag",
    DAMAGE_TYPE_HYBIRD: "hybird",
    DAMAGE_TYPE_PUREATK: "pureatk",
    DAMAGE_TYPE_PUREMAG: "puremag",
    DAMAGE_TYPE_COMBOATKHP: "comboatkhp",
    DAMAGE_TYPE_COMBOMAGHP: "combomaghp",

    BUFF_TYPE_HEAL: "heal",
    BUFF_TYPE_REMOVAL: "removal",
    BUFF_TYPE_ATTRIBUTE: "attribute",
    BUFF_TYPE_HPPORTION: "hppotion",
    BUFF_TYPE_COSTHP: "costhp",
    BUFF_TYPE_COSTMP: "costmp",
    BUFF_TYPE_MAGSHIELD: "magshield",
    BUFF_TYPE_HPSHIELD: "hpshield",

    UPDATE_EFFECT_TYPE_DPS: "dps",
    UPDATE_EFFECT_TYPE_MPS: "mps",
    UPDATE_EFFECT_TYPE_REGEN_HP: "regenhp",
    UPDATE_EFFECT_TYPE_REGEN_MP: "regenmp",
    UPDATE_EFFECT_TYPE_REGEN_HP_OPTION: "regenhpoption",
    UPDATE_EFFECT_TYPE_REGEN_MP_OPTION: "regenmpoption",
    UPDATE_EFFECT_TYPE_ATTRIBUTE: "increaseattr",

    LATE_UPDATE_LIFE_STEAL: "late_update_life_steal",
    LATE_UPDATE_REFLECT_DAMAGE: "late_update_reflect_damage",
    LATE_UPDATE_BUFF: "late_update_buff",
    LATE_UPDATE_BURN_MANA: "late_update_burn_mana",

    CRYSTAL_HEART: "crystal_heart",
    CRYSTAL_BATTLE: "crystal_battle",
    CRYSTAL_ULTIMATE: "crystal_ultimate",

    ELEMENT_FIRE: "fire",
    ELEMENT_WATER: "water",
    ELEMENT_LIGHT: "light",
    ELEMENT_EARTH: "earth",
    ELEMENT_DARK: "dark",
    ELEMENT_NONE: "none",

    CLASS_GROUP_FIGHTER: "fighter",
    CLASS_GROUP_ARCHER: "archer",
    CLASS_GROUP_ENCHANTER: "enchanter",
    CLASS_GROUP_GLADIATOR: "gladiator",
    CLASS_GROUP_LORD: "lord",
    CLASS_GROUP_MAGE: "wizard",
    CLASS_GROUP_SLAYER: "slayer",
    CLASS_GROUP_TANKER: "tanker",
    CLASS_GROUP_WARRIOR: "warrior",

    ITEM_TYPE_POTION: 1,
    ITEM_TYPE_TICKET: 2,
    ITEM_TYPE_EQUIP_MATERIAL: 3,
    ITEM_TYPE_HERO_MATERIAL: 4,
    ITEM_TYPE_EVOLVE_MATERIAL: 5,
    ITEM_TYPE_SPECIAL_MATERIAL: 6,
    ITEM_TYPE_LUCKY_CHARM: 7,
    ITEM_TYPE_CURRENCY: 9,
    ITEM_TYPE_PACK: 10,
    ITEM_TYPE_HERO_TICKET: 11,
    ITEM_TYPE_GIFT_RANDOM: 12,
    ITEM_TYPE_SOUL: 13,
    ITEM_TYPE_MONTHLY_VIP: 14,

    SLOT_TYPE_WEAPON: "1",
    SLOT_TYPE_WEAPONSHIELD: "2",
    SLOT_TYPE_AMOR: "3",
    SLOT_TYPE_RING: "4",
    SLOT_TYPE_CHARM: "5",
    SLOT_TYPE_ELEMENTAL: "6",

    BATTLE_EFFECT_HEX: 106,
    BATTLE_EFFECT_SHIELD: 90,
    BATTLE_EFFECT_BELOWHP: 119,
    BATTLE_EFFECT_REVIVE: 126,

    FUNCTION_CHAOS_CASTLE: "chaoscastle",
    FUNCTION_ARENA: "arena",
    FUNCTION_QUEST: "quest",
    FUNCTION_SHOP: "shop",
    FUNCTION_SHOP_ARENA: "shop_arena",
    FUNCTION_SHOP_COMMON: "shop_common",
    FUNCTION_SHOP_CHAOS: "shop_chaos",
    FUNCTION_RATE: "rate",
    FUNCTION_VIEW_ADS: "ads",
    FUNCTION_EXCHANGE_ITEM: "exchange_item",
    FUNCTION_CRAFT_ITEM: "craft_item",
    FUNCTION_EXCHANGE_HERO: "exchange_hero",
    FUNCTION_SUMMON_ITEM: "summon5",
    FUNCTION_EGGS_GAME: "eggs_game",
    FUNCTION_DAILY_CHALLENGE: "dailychallenge",
    FUNCTION_DAILY_CHALLENGE1: "dailychallenge1",
    FUNCTION_DAILY_CHALLENGE2: "dailychallenge2",
    FUNCTION_DAILY_CHALLENGE3: "dailychallenge3",
    FUNCTION_DEVIL_SQUARE: "devilsquare",

    FUNCTION_KALIMA: "kalima",
    FUNCTION_BLOOD_CASTLE: "bloodcastle",
    FUNCTION_ILLUSION_TOWER: "illusiontower",
    FUNCTION_GUILD: "guild",
    FUNCTION_SPECIAL_EVENT: "special_event",
    FUNCTION_ADD_MORE_FRIEND: "add_more_friend",
    FUNCTION_CHAPTER_LOREN: "chapter_loren",
    FUNCTION_CHAPTER_NORIA: "chapter_noria",
    FUNCTION_CHAPTER_DAVIAS: "chapter_davias",
    FUNCTION_CHAPTER_DUNGEON: "chapter_dungeon",
    FUNCTION_CHAPTER_LOSTTOWNER: "chapter_losttowner",
    FUNCTION_CHAPTER_ATLANS: "chapter_atlans",
    FUNCTION_CHAPTER_TARKAN: "chapter_tarkan",
    FUNCTION_CHAPTER_KANTURU: "chapter_kanturu",
    FUNCTION_CHAPTER_ICARUS: "chapter_icarus",

    VIP_FUNCTION_CHALLENGE_MAX_CHANCE: "max_challenge_chance",
    VIP_FUNCTION_BLOOD_CASTLE_MAX_CHANCE: "max_bloodcastle_chance",
    VIP_FUNCTION_DONATE_CLAN_MAX_TIMES: "max_donate_clan_times",
    VIP_FUNCTION_SHOP_COMMON_DISCOUNT: "shop_common_discount",
    VIP_FUNCTION_SHOP_RELIC_DISCOUNT: "shop_relic_discount",

    REFRESH_FUNCTION_BUY_STAMINA: "stamina",
    REFRESH_FUNCTION_BUY_SPIN_TICKET: "spin",
    EXCHANGE_FUNCTION_BUY_ARENA_TICKET: "arena",
    EXCHANGE_FUNCTION_BUY_SPIN_TICKET: "spin",
    REFRESH_FUNCTION_BUY_HERO_SLOT: "heroslots",
    REFRESH_FUNCTION_BUY_ITEM_SLOT: "itemslots",
    REFRESH_FUNCTION_BUY_VAULT_SLOT: "vaultslots",
    EXCHANGE_FUNC_ZEN: "zen",
    EXCHANGE_FUNC_CHAOS_TICKET: "chaoscastle",
    EXCHANGE_FUNC_DAILY_CHALLENGER_0: "dailychallenge_0",
    EXCHANGE_FUNC_DAILY_CHALLENGER_1: "dailychallenge_1",
    EXCHANGE_FUNC_DAILY_CHALLENGER_2: "dailychallenge_2",
    REFRESH_FUNCTION_ADS: "ads",
    REFRESH_FUNCTION_ILLUSION: "illusion",

    EXP_TYPE_CONSUMABLE: "exp_type_consumable",
    EXP_TYPE_HERO: "exp_type_hero",

    SORT_TEAM_FORMATION: false,

    TEAM_LEFT: "team_left",
    TEAM_RIGHT: "team_right",

    FONT_SIZE_24: "font_size_24",
    FONT_SIZE_32: "font_size_32",
    FONT_SIZE_48: "font_size_48",

    NUM_GOLD_UNEQUIP_ITEM_FOR_RANK: {1: 5000, 2: 10000, 3: 15000, 4: 30000, 5: 50000, 6: 100000},
    ARR_CHAPTER_NAME: ["Toren Town", "Fairy Land", "Snowy Land", "The Tomb", "The Evil Tower", "The Atlantic", "Deadly Desert", "Sky of Icarus"],
    MAP_LEAGUE_BY_CODE: {
        "S": {
            url: "icon/rank/ico_legend.png",
            name: "Legend",
            priority: 10
        },
        "A": {
            url: "icon/rank/ico_titan.png",
            name: "Titan",
            priority: 9
        },
        "B": {
            url: "icon/rank/ico_king.png",
            name: "King",
            priority: 8
        },
        "C": {
            url: "icon/rank/ico_master.png",
            name: "Master",
            priority: 7
        },
        "D": {
            url: "icon/rank/ico_hero.png",
            name: "Hero",
            priority: 6
        },
        "E": {
            url: "icon/rank/ico_novice.png",
            name: "Novice",
            priority: 5
        }
    },

    MAP_RANK_BY_STONES: {
        1: 100,
        2: 250,
        3: 500,
        4: 1000,
        5: 3000
    }

};

mc.enableReplaceFontBM = function()
{
    //return mc.const.ENABLE_REPLACE_FONT_BM && !mc.const.IS_EN_LANGUAGE;
    return false;
};

mc.const.NOTIFICATION = {
    BEFORE_PICK_HERO: 1
};

mc.languageConfig = {
    default_code: "en",
    support_lang_code: ["en", "vi","th","id","ru","it","es" , "de"/*, "nl", "fr"*/],
    languages: {
        "en": "English",
        "vi": "Vietnamese",
        "th": "Thai",
        "id" : "Indonesian",
        "ru" : "Russia",
        "it" : "Italian",
        "es" : "Spanish",
        "de": "Germany",
        "nl": "Netherlands",
        "fr": "France"
    },
    comming_soon: ["th","id","ru","it","es", "de", "nl", "fr"]
};

mc.log = function (obj) {
    mc.const.ENABLE_LOG && cc.log(obj);
};

mc.GUIFactory = bb.GUIFactory.extend({

    createLoadingLayer: function () {
        return new mc.LoadingFairyLayer();
    },

    createGameIntroductionScene: function () {
        return new mc.GameIntroductionScene();
    },

    createLoadingDialog: function (blackOpacity) {
        return new mc.LoadingDialog(null, blackOpacity);
    },

    createExitGameDialog: function () {
        mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtDoYouWantToQuitGame"), function () {
            if (cc.sys.isNative) {
                cc.director.end();
            } else {
                close();
            }
        });
    },

    createDialog: function (title, strWarning, funcOk, lblBtn, data) {
        var dialog = new mc.DefaultDialog()
            .setTitle(title)
            .setMessage(strWarning)
            .enableOkButton(function () {
                dialog.close();
                funcOk && funcOk(data);
            }, lblBtn);
        return dialog;
    },

    createCloseExecuteDialog: function (title, strWarning, funcOk, lblBtn, data) {
        var dialog = new mc.DefaultDialog()
            .setTitle(title)
            .setMessage(strWarning)
            .enableOkButton(function () {
                dialog.close();
                funcOk && funcOk(data);
            }, lblBtn).disableExitButton().setEnableClickOutSize(false).setEnableBackEvent(false);
        return dialog;
    },

    createWarningDialog: function (strWarning, funcOk, lblBtn, data) {
        return this.createDialog(mc.dictionary.getGUIString("lblWarning"), strWarning, funcOk, lblBtn, data);
    },

    createInfoDialog: function (strWarning, funcOk, lblBtn, data) {
        return this.createDialog(mc.dictionary.getGUIString("lblInfo"), strWarning, funcOk, lblBtn, data);
    },

    createCongratulationDialog: function (strWarning, funcOk, lblBtn, data) {
        return this.createDialog(mc.dictionary.getGUIString("lblCongratulation"), strWarning, funcOk, lblBtn, data);
    },

    createButtonSoundEffect: function () {
        return res.sound_ui_button_click;
    },

    createButton: function (title, fontType, fontSize, resUrl) {
        var btn = new ccui.ImageView(resUrl || "button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
        btn.scale = 0.8;
        title = title || "";
        fontType = fontType || res.font_sfumachine_outer_32_export_fnt;
        fontSize = fontSize || mc.const.FONT_SIZE_32;
        btn._maxLblWidth = btn.width * btn.scale;
        btn.setString(title, fontType, fontSize);

        btn.setCascadeOpacityEnabled(true);
        return btn;
    },

    createText: function (str, fontType, fontSize) {
        fontSize = fontSize || mc.const.FONT_SIZE_24;
        fontType = fontType || res.font_cam_stroke_32_export_fnt;
        var lbl = new ccui.TextBMFont(mc.dictionary.getGUIString(str), fontType);
        if (fontSize === mc.const.FONT_SIZE_24) {
            lbl.scale = 0.75;
        }
        lbl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl, fontType);
        lbl.x -= 8;
        lbl.y -= 8;
        return lbl;
    },

    createLoadingAnimation: function (container, noShowTip) {
        var spine = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_loading_fairy_json, res.spine_ui_loading_fairy_atlas, 1.0);
        spine.setAnimation(0, "animation", true);
        spine.x = cc.winSize.width * 0.5;
        spine.y = cc.winSize.height * 0.5;
        container._spine = spine;
        container.addChild(spine);

        var particle = new cc.ParticleSystem(res.particle_fairy_dust_plist);
        particle.x = cc.winSize.width * 0.5;
        particle.y = cc.winSize.height * 0.5;
        particle.setName("particle");
        container._particle = particle;
        container.addChild(particle);

        if (noShowTip) {
            cc.spriteFrameCache.addSpriteFrames(res.bar_plist);
            var tipView = new mc.TipView();
            tipView.x = cc.winSize.width * 0.5;
            tipView.y = cc.winSize.height * 0.25;
            container._tipView = tipView;
            container.addChild(tipView);
        }
    }

});
mc.GUIFactory = new mc.GUIFactory();
mc.GUIFactory.confirm = function (str, callbackYes, callbackNo) {
    var dialog = new mc.DefaultDialog()
        .setTitle(mc.dictionary.getGUIString("lblWarning"))
        .setMessage(str)
        .enableYesNoButton(function () {
            dialog.close();
            callbackYes && callbackYes();
        }, function () {
            dialog.close();
            callbackNo && callbackNo();
        });
    dialog.show();
    return dialog;
};
mc.GUIFactory.notifyText = function (message, notifyId, data, callback) {
    if (!mc.GUIFactory._notifyText) {
        mc.GUIFactory._notifyText = new bb.NotifyText();
    }
    mc.GUIFactory._notifyText.showMessage(message, notifyId, data, callback);
};

mc.GUIFactory.closeVSRelicMatchNotification = function () {
    if (mc.GUIFactory._notifyVSRelicMatch.isShowing()) {
        mc.GUIFactory._notifyVSRelicMatch.forceClose();
    }
};

mc.GUIFactory.notifyVSRelicMatch = function (data, animation) {
    if (!mc.GUIFactory._notifyVSRelicMatch) {
        mc.GUIFactory._notifyVSRelicMatch = new bb.NotifyRelicMatch();
    }
    mc.GUIFactory._notifyVSRelicMatch.showData(data, animation);
};


mc.GUIFactory.infoDialog = function (title, str, callbackOk) {
    var dialog = new mc.DefaultDialog()
        .setTitle(title)
        .setMessage(str)
        .enableOkButton(function () {
            callbackOk && callbackOk();
            dialog.close();
        });
    dialog.show();
    return dialog;
};
mc.GUIFactory.showChaosCastleScreen = function () {
    var _showScreen = function () {
        mc.GameData.guiState.pushCurrentScreenId();
        new mc.ChaosCastleScreen().show();
    };
    var chaosCastleManager = mc.GameData.chaosCastleManager;
    if (chaosCastleManager.isChange()) {
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.joinChaosCastle(function () {
            mc.view_utility.hideLoadingDialogById(loadingId);
            _showScreen();
        }.bind(this));
    } else {
        _showScreen();
    }
};
mc.GUIFactory.showEditFormationScreen = function (statusCreatureManager) {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.EditFormationScreen(statusCreatureManager).show();
};
mc.GUIFactory.showShopScreen = function (shopCategoryId) {
    shopCategoryId = shopCategoryId || mc.ShopManager.SHOP_COMMON;
    mc.GameData.guiState.setCurrentShopCategory(shopCategoryId);
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ShopScreen().show();
};
mc.GUIFactory.showCampaignBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.CampainBattleScreen().show();
};
mc.GUIFactory.showStageBossBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.StageBossBattleScreen().show();
};
mc.GUIFactory.showChallengeBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ChallengeBattleScreen().show();
};
mc.GUIFactory.showBloodCastleBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.BloodCastleBattleScreen().show();
};
mc.GUIFactory.showChaosCastleBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ChaosCastleBattleScreen().show();
};
mc.GUIFactory.showIllusionBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.IllusionBattleScreen().show();
};
mc.GUIFactory.showArenaBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ArenaBattleScreen().show();
};

mc.GUIFactory.showRelicArenaBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.RelicArenaBattleScreen().show();
};

mc.GUIFactory.showFriendSoloBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.FriendSoloBattleScreen().show();
};

mc.GUIFactory.showWorldBossBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.WorldBossBattleScreen().show();
};
mc.GUIFactory.showGuildBossBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.GuildBossBattleScreen().show();
};

mc.GUIFactory.showRefineItemScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.UpgradeEquipmentScreen().show();
};
mc.GUIFactory.showSummonItemScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    var layerColor = new cc.LayerColor(cc.color.WHITE);
    cc.director.getRunningScene().addChild(layerColor);
    layerColor.opacity = 0;
    layerColor.runAction(cc.sequence([cc.fadeIn(1.0), cc.callFunc(function () {
        new mc.SummonItemScreen().show(new cc.LayerColor(cc.color.WHITE));
    })]));
};
mc.GUIFactory.showInvolveHeroScreen = function (heroId) {
    mc.GameData.guiState.setCurrentViewHeroId(heroId);
    mc.GameData.guiState.pushCurrentScreenId();
    var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
    var localData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    var evolveToIndex = localData.evolveTo;
    new mc.InvolveHeroScreen().show();
};
mc.GUIFactory.showRecordArenaScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.RecordArenaScreen().show();
};
mc.GUIFactory.showMineScreen = function (selectChapterIndex) {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.MineScreen(selectChapterIndex).loadNow();
};
mc.GUIFactory.showCraftItemScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.CraftItemScreen().show();
};
mc.GUIFactory.showTierHeroesScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.TierHeroStockScreen().show();
};
mc.GUIFactory.showItemsWikiScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ItemsWikiScreen().show();
};

mc.GUIFactory.showMonsterWikiScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.MonsterWikiScreen().show();
};

mc.GUIFactory.showEggGameScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.EggGameScreen().show();
};

mc.GUIFactory.showMonsterInfoScreen = function (monsterList, index) {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.MonsterInfoScreen(monsterList, index).show();
};

mc.GUIFactory.showHeroMaxLvInfoScreen = function (heroList, index) {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.HeroMaxLvInfoScreen(heroList, index).show();
};
mc.GUIFactory.showAddChangeOptionScreen = function (action) {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.AddChangeOptionScreen(action).show();
};
mc.GUIFactory.showRelayArenaBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ReplayArenaBattleScreen().show();
};
mc.GUIFactory.showRelayRelicArenaBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ReplayRelicArenaBattleScreen().show();
};

mc.GUIFactory.showRelayFriendBattleScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ReplayFriendSoloBattleScreen().show();
};
mc.GUIFactory.showExchangeStonesScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.ExchangeStonesScreen().show();
};

mc.GUIFactory.showQuickSellItemsScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.QuickSellItemsScreen().show();
};

mc.GUIFactory.showInventoryScreen = function () {
    mc.GameData.guiState.pushCurrentScreenId();
    new mc.VaultScreen().show();
};

mc.parseCCStudioNode = function (ownerNode, urlOrContainerNode) {
    var node = null;
    if (cc.isString(urlOrContainerNode)) {
        node = ccs.load(urlOrContainerNode, "res/").node;
    } else {
        node = urlOrContainerNode;
        ownerNode.x = node.x;
        ownerNode.y = node.y;
        ownerNode.anchorX = node.anchorX;
        ownerNode.anchorY = node.anchorY;
    }

    var root = node.getChildByName("root");
    root.removeFromParent();
    ownerNode.addChild(root);
    return root;
};
mc.loadGUI = function (url) {
    var node = ccs.load(url, "res/").node;
    node.anchorX = node.anchorY = 0.5;
    node.x = cc.winSize.width * 0.5;
    node.y = cc.winSize.height * 0.5;
    return node;
};

mc.GUIFactory.applyComplexString = function (lblWidget, text, color, font) {
    var lbl = null;
    if(mc.enableReplaceFontBM())
    {
        lbl = new mc.view_utility.createTextFromFontBitmap(font || res.font_UTMBienvenue_none_32_export_fnt);
        lbl.setComplexString(text, color || mc.color.BROWN_SOFT, font || res.font_UTMBienvenue_none_32_export_fnt);
        lblWidget.getParent().addChild(lbl);
        lbl.setLocalZOrder(lblWidget.getLocalZOrder());
        lbl.setPosition(lblWidget.getPosition());
        lbl.setAnchorPoint(lblWidget.getAnchorPoint());
        lbl.scale = lblWidget.scale;
    }
    else
    {
        lbl = new cc.LabelBMFont(text, font || res.font_UTMBienvenue_none_32_export_fnt);
        lbl.setComplexString(text, color || mc.color.BROWN_SOFT, font || res.font_UTMBienvenue_none_32_export_fnt);
        lblWidget.getParent().addChild(lbl);
        lbl.setLocalZOrder(lblWidget.getLocalZOrder());
        lbl.setPosition(lblWidget.getPosition());
        lbl.setAnchorPoint(lblWidget.getAnchorPoint());
        lbl.scale = lblWidget.scale;
    }
    return lbl;
};
mc.GUIFactory.createComplexString = function (text, color, font) {
    var lbl = new cc.LabelBMFont(text, font || res.font_UTMBienvenue_none_32_export_fnt);
    lbl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl, mc.textStyle.font_size_32);
    lbl.setComplexString(text, color || mc.color.GREEN_NORMAL);
    return lbl;
};

mc.const.GuildAction = {
    KICK: {id: 1, lbl: "Kick"},
    PROMOTE: {id: 2, lbl: "Promote"},
    DEMOTE: {id: 3, lbl: "Demote"},
    CHAT: {id: 4, lbl: "Chat"},
    GIVE_LEADER: {id: 5, lbl: "Give Leader"}
};

mc.showShopPackageList = function () {
    /*  var currScreen = bb.director.getCurrentScreen();//bỏ show list promotion kiểu cũ
     currScreen.pushLayerWithId(mc.MainScreen.LAYER_IN_APP_PACKAGE_LIST);*/
    mc.IAPShopDialog.showIAPPromo();
};
