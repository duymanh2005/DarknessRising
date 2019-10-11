/**
 * Created by long.nguyen on 5/8/2017.
 */
(function (mc) {
    var LOG_PROTOCOL = mc.const.ENABLE_LOG;
    var protocol = {};
    var key = protocol.key = {};
    cc.log("protocol request socket config");
    key.NETWORK_URL = "ws://192.168.1.75:9494/ws";
    key.NETWORK_URL = "ws://112.78.15.60:9494/ws";
    if (!mc.const.DEBUG_GAME) {
        key.NETWORK_URL = "ws://gs1.mu-heroes.com:9494/ws";
        if (creants_config) {
            creants_config["REST_URL"] = "http://login.mu-heroes.com:9393/";
        }
    } else {
        key.NETWORK_URL = (mc.const.TEST_DEVICE != null) ? "ws://192.168.1.75:9494/ws" : "ws://muheroes-sk1.creants.net:9494/ws";
        key.NETWORK_URL = "ws://muheroes-sk1.creants.net:9494/ws";
        if (creants_config) {
            creants_config["REST_URL"] = "http://muheroes-login.creants.net:9393/";
        }
    }
    key.MU_EXTENSION = {
        JOIN_GAME: "join_game",
        JOIN_CHAPTER: "cmd_join_chapter",
        JOIN_STAGE: "cmd_join_stage",
        FINISH_STAGE: "cmd_stage_finish",
        QUEST: "cmd_quest",
        CHAT: "cmd_chat",
        PAYMENT: "cmd_payment",
        FINISH_QUEST: "cmd_quest_claim",
        ASSET_CHANGE: "cmd_assets_change",
        SUMMON: "cmd_summon",
        HEROES: "cmd_heroes",
        HERO: "cmd_hero",
        ACTION_WITH_ITEM: "cmd_item_req",
        GIFT_EVENTS: "cmd_gift_events",
        EXCEPTION: "cmd_exception",
        UPDATE_CAMPAIGN_TEAM: "cmd_upd_battle_team",
        UNLOCK_NOTIFICATION: "cmd_unlock_notification",
        NOTIFICATION: "cmd_notification",
        CHAOS_CASTLE: "cmd_chaos_castle",
        DAILY_CHALLENGE: "cmd_daily_event",
        BLOOD_CASTLE: "cmd_blood_castle",
        ARENA: "cmd_arena",
        FRIEND: "cmd_friend",
        MAIL: "cmd_mail",
        SHOP: "cmd_shop",
        ACCOUNT_LVL_UP: "cmd_acc_level_up",
        MINING: "cmd_mining",
        SETTING: "cmd_setting",
        COMMON: "cmd_common",
        PLAYER: "cmd_game_hero",
        MINI_GAME: "cmd_mini_game",
        WORLD_BOSS: "cmd_world_boss",
        GUILD: "cmd_guild",
        GUILD_BOSS: "cmd_guild_boss",
        STAGE_BOSS: "cmd_stage_boss",
        BATTLE_RELIC: "cmd_battle_relic",
        DEVICE: "cmd_device",
        ILLUSION: "cmd_illusion"

    };
    key.PARAMETER = {
        TOKEN: "tk",
        CHAPTER_ID: "cid",
        STAGE_ID: "stgid",
        WIN: "win",
        SCRIPT: "script",
        GID: "gid",
        QID: "qid"
    };

    var EXCEPTION_NOT_ENOUGH_BLESS = "NOT_ENOUGH_BLESS";
    var EXCEPTION_NOT_ENOUGH_ZEN = "NOT_ENOUGH_MONEY";
    var EXCEPTION_NOT_ENOUGH_STAMINA = "NOT_ENOUGH_STAMINA";
    var EXCEPTION_NOT_ENOUGH_TICKET = "NOT_ENOUGH_TICKET";
    var EXCEPTION_NOT_ENOUGH_FRIEND_POINT = "NOT_ENOUGH_FRIEND_POINT";
    var EXCEPTION_LOGIN_OTHER_DEVICE = 900;
    var EXCEPTION_GUILD_NOT_JOIN = 702;
    var EXCEPTION_GUILD_EXIST_GUILD_NAME = 714;

    var ITEM_ACTION_TAKE_ON = 1;
    var ITEM_ACTION_TAKE_OFF = 2;
    var ITEM_ACTION_CONSUME = 3;
    var ITEM_ACTION_SELL = 4;
    var ITEM_ACTION_UPGRADE = 5;
    var ITEM_ACTION_EXCHANGE = 6;
    var ITEM_ACTION_CRAFT = 7;
    var ITEM_ACTION_BUY_STAMINA = 8;
    var ITEM_ACTION_OPEN_CHEST = 10;
    var ITEM_LIST_CHUNK = 11;
    var ITEM_ACTION_EXCHANGE_LIST = 12;
    var ITEM_ACTION_INVENTORY = 13;
    var ITEM_ACTION_INVENTORY_INFO = 14;
    var ITEM_ACTION_CHANGE_OPTION = 15;

    var GIFT_GET_LIST = 1;
    var GIFT_CLAIM_PACKAGE = 2;

    var PRIVATE_CHAT = 1;
    var WORLD_CHAT = 2;
    var GUILD_CHAT = 3;
    var LIST_CHAT_LOGS = 4;
    var TRASLATE_CHAT = 5;
    var LIST_CONV_CHAT = 6;
    var UPDATE_CONV_CHAT = 7;

    var GUILD_CREATE = 1;
    var GUILD_LIST_GUILD = 2;
    var GUILD_LIST_MEMBER = 3;
    var GUILD_STATUS = 4;
    var GUILD_LEAVE = 5;
    var GUILD_JOIN = 6;
    var GUILD_LIST_JOIN_REQUEST = 7;
    var GUILD_ACCEPT_JOIN = 8;
    var GUILD_DECLINE_JOIN = 9;
    var GUILD_DONATE = 10;
    var GUILD_LOGS = 11;
    var GUILD_KICK = 12;
    var GUILD_PROMOTE = 13;
    var GUILD_SEND_LEADER = 14;
    var GUILD_UPGRADE = 15;
    var GUILD_CHECKIN = 16;
    var GUILD_GET_CHECKIN_REWARDS = 17;
    var GUILD_INVITE = 18;
    var GUILD_DONATE_INFO = 19;
    var GUILD_REQUESTED_LIST = 20;

    var GUILD_BOSS_INFO = 1;
    var GUILD_BOSS_BATTLE = 2;
    var GUILD_BOSS_DAMGE_SUBMIT = 3;
    var GUILD_BOSS_CHEST_INFO = 4;
    var GUILD_BOSS_REWARD_FROM_CARD = 5;
    var GUILD_BOSS_SUBMIT_TEAM = 6;
    var GUILD_BOSS_INFO_OLD_STAGE = 7;
    var GUILD_BOSS_DAMGE_INFO = 8;

    var STAGE_BOSS_JOIN_BOSS = 1;
    var STAGE_BOSS_FINISH = 3;
    var STAGE_BOSS_SUBMIT_DAM = 4;
    var STAGE_BOSS_DEAD = 5;
    var STAGE_BOSS_CHECK_BOSS = 8;
    var STAGE_BOSS_WORLD_MAP = 9;

    var HERO_UPGRADE_LEVEL = 1;
    var HERO_UPGRADE_RANK = 2;
    var HERO_EXCHANGE_STONES = 5;
    var HERO_SUMMON_PUZZLE = 6;
    var HERO_LIST_CHUNK = 11;
    var HERO_UPGRADE_SKILL = 12;

    var UNLOCK_TYPE_NEW_STAGE = 1;

    var SHOP_GET_ITEM_LIST = 1;
    var SHOP_BUY_ITEM = 2;
    var SHOP_REFRESH = 3;

    var QUEST_GET_LIST = 1;
    var QUEST_CLAIM = 2;
    var QUEST_FINISH = 3;
    var QUEST_CLAIM_ALL = 4;

    var SPIN_REWARDS = 0;
    var EGG_LIST = 1;
    var BEAT_EGG = 2;
    var REFRESH_EGG_LIST = 3;

    var WORLD_BOSS_JOIN = 1;
    var WORLD_BOSS_SETUP_TEAM = 6;
    var WORLD_BOSS_FIGHT = 2;
    var WORLD_BOSS_FINISH_BATTLE = 3;
    var WORLD_BOSS_SUBMIT_DAMAGE = 4;
    var WORLD_BOSS_NOTIFY_BOSS_DEAD = 5;
    var WORLD_BOSS_GET_TOP_DAMAGE = 7;
    var WORLD_BOSS_LEAVE_ROOM = 8;

    var NOTIFICATION_GROUP_QUEST = "quest";
    var NOTIFICATION_GROUP_ARENA = "arena";
    var NOTIFICATION_GROUP_MAIL = "mail";
    var NOTIFICATION_GROUP_FRIEND = "friend";
    var NOTIFICATION_GROUP_RELIC_BATTLE = "brelic";

    var ILLUSION_JOIN = 1;
    var ILLUSION_START_BATTLE = 2;
    var ILLUSION_FINISH = 3;
    var ILLUSION_CLAIM = 4;
    var ILLUSION_VIEW_STAGE = 5;
    var ILLUSION_SETUP_TEAM = 6;
    var ILLUSION_RANKING = 7;


    var CHAOS_CASTLE_JOIN = 1;
    var CHAOS_CASTLE_START_BATTLE = 2;
    var CHAOS_CASTLE_FINISH = 3;
    var CHAOS_CASTLE_CLAIM = 4;
    var CHAOS_CASTLE_VIEW_STAGE = 5;
    var CHAOS_CASTLE_SETUP_TEAM = 6;
    var CHAOS_CASTLE_RESTART = 7;

    var ARENA_JOIN = 1;
    var ARENA_FIND = 2;
    var ARENA_FIGHT = 3;
    var ARENA_FINISH = 4;
    var ARENA_SETUP_TEAM = 5;
    var ARENA_GET_TOP = 6;
    var ARENA_LIST_FRIENDS = 7;
    var ARENA_GET_BATTLE_RECORD = 10;
    var ARENA_BATTLE_REPLAY = 11;
    var ARENA_BATTLE_REVENGE = 12;
    var ARENA_GET_OPPONENT_DEFENSE_TEAM = 13;
    var ARENA_GET_TOP_CLAN = 14;

    var MAIL_OPEN = 1;
    var MAIL_ACTION = 2;
    var MAIL_CLAIM_ALL = 3;
    var MAIL_DELETE_ALL = 4;
    var MAIL_LIST = 5;

    var GET_SUMMON_PACKAGE_LIST = 0;
    var SUMMON_PACKAGE = 1;

    var SETTING_UPDATE = 2;

    var MINING_START = 0;
    var MINING_COLLECT = 1;
    var MINING_STOP = 10;
    var MINING_GET_INFO = 2;

    var PLAYER_UPDATE_INFO = 1;
    var PLAYER_LINK_ACCOUNT = 2;
    var PLAYER_VIEW_INFO = 3;
    var PLAYER_TRANSFER_RELIC = 4;


    var FRIEND_GET_SUGGEST_HERO_LIST = 1;
    var FRIEND_REQUEST_ADD = 2;
    var FRIEND_GET_FRIEND_LIST = 3;
    var FRIEND_GET_REQUEST_LIST = 4;
    var FRIEND_ACCEPT_REQUEST = 5;
    var FRIEND_DENY_REQUEST = 6;
    var FRIEND_SEARCH = 7;
    var FRIEND_SEND_POINT = 8;
    var FRIEND_UNFRIEND_SEND = 9;
    var FRIEND_SEND_ALL_POINT = 10;
    var FRIEND_SOLO_REQUEST = 20;
    var FRIEND_SOLO_FINISH = 21;
    var FRIEND_SOLO_HISTORY = 22;
    var FRIEND_SOLO_REPLAY = 23;

    var CHALLENGE_GET_LIST = 0;
    var CHALLENGE_FIGHT = 1;
    var CHALLENGE_FINISH = 2;
    var CHALLENGE_QUICK_FINISH = 3;

    var BLOOD_CASTLE_GET_LIST = 0;
    var BLOOD_CASTLE_FIGHT = 1;
    var BLOOD_CASTLE_FINISH = 2;
    var BLOOD_CASTLE_SETUP_TEAM = 3;

    var CAMPAIGN_RAID = 1;
    var CAMPAIGN_RAID_5 = 5;

    var COMMON_GET_GIFTCODE_REWARD = 1;
    var COMMON_GET_VIEWADS_REWARD = 2;
    var COMMON_GET_FUNCTION_LIST = 3;
    var COMMON_EXCHANGE_FUNCTION = 4;
    var COMMON_RATING_APP = 5;

    var PAYMENT_VERIFY_GOOGLE_INAP = 1;
    var PAYMENT_GET_BUY_TIMES = 2;
    var PAYMENT_VERIFY_APPLE_INAPP = 3;
    var PAYMENT_FIRST_TIME_CHECK = 4;
    var PAYMENT_MANA_COIN_REWARD_CHECK = 5;
    var PAYMENT_MANA_COIN_REWARD_CLAIM = 6;

    var BATTLE_RELIC_CREATE = 1;
    var BATTLE_RELIC_SEARCH = 2;
    var BATTLE_RELIC_REMOVE = 3;
    var BATTLE_RELIC_JOINER_REQUEST = 4;
    var BATTLE_RELIC_JOINER_REQUEST_LIST = 5;
    var BATTLE_RELIC_ACCEPT_JOINER_REQUEST = 6;
    var BATTLE_RELIC_PICK_HEROES = 7;
    var BATTLE_RELIC_SUBMIT_TEAM = 8;
    var BATTLE_RELIC_SUBMIT_RESULT = 9;
    var BATTLE_RELIC_INFO = 10;
    var BATTLE_RELIC_HISTORY = 11;

    protocol.startConnect = function (auth, ips) {
        auth && (creants_config["REST_URL"] = auth);
        ips && (key.NETWORK_URL = ips);
        var mapCallbackByName = {};
        var mapParameterByName = {};
        var _performCallback = function (callbackName, json) {
            var arrCb = mapCallbackByName[callbackName];
            if (arrCb && arrCb.length > 0) {
                var cb = arrCb[0];
                arrCb.splice(0, 1);
                cb && cb(json);
                if (arrCb.length === 0) {
                    delete mapCallbackByName[callbackName];
                }
            }
        };
        var _registerCallback = function (callbackName, callback, param) {
            if (!mapCallbackByName[callbackName]) {
                mapCallbackByName[callbackName] = [];
            }
            mapCallbackByName[callbackName].push(callback);
        };
        var _pushParameter = function (callbackName, param) {
            if (param) {
                !mapParameterByName[callbackName] && (mapParameterByName[callbackName] = []);
                mapParameterByName[callbackName].push(param);
            }
        };
        var _popParameter = function (callbackName) {
            if (mapParameterByName[callbackName]) {
                var arrParam = mapParameterByName[callbackName];
                if (arrParam && arrParam.length > 0) {
                    var param = arrParam[0];
                    arrParam.splice(0, 1);
                    !arrParam.length && (delete mapParameterByName[callbackName]);
                    return param;
                }
            }
            return null;
        };

        mc.GameData.initStaticData();
        var guiState = mc.GameData.guiState;
        var exception = mc.GameData.exception;
        var connectionState = mc.GameData.connectionState;
        var playerInfo = mc.GameData.playerInfo;
        var paymentSystem = mc.GameData.paymentSystem;
        var heroStock = mc.GameData.heroStock;
        var itemStock = mc.GameData.itemStock;
        var setting = mc.GameData.settingManager;
        var questManager = mc.GameData.questManager;
        var questTrigger = mc.GameData.questTrigger;
        var shop = mc.GameData.shopManager;
        var teamFormationManager = mc.GameData.teamFormationManager;
        var campaignManager = mc.GameData.campaignManager;
        var arenaManager = mc.GameData.arenaManager;
        var relicArenaManager = mc.GameData.relicArenaManager;
        var friendSoloManager = mc.GameData.friendSoloManager;
        var chaoCastleManager = mc.GameData.chaosCastleManager;
        var illusionManager = mc.GameData.illusionManager;
        var challengeManager = mc.GameData.challengeManager;
        var bloodCastleManager = mc.GameData.bloodCastleManager;
        var stageInBattle = mc.GameData.stageInBattle;
        var stageBossInBattle = mc.GameData.stageBossInBattle;
        var chaosCastleInBattle = mc.GameData.chaosCastleInBattle;
        var illusiionInBattle = mc.GameData.illusionInBattle;
        var arenaInBattle = mc.GameData.arenaInBattle;
        var friendSoloInBattle = mc.GameData.friendSoloInBattle;
        var replayArenaInBattle = mc.GameData.replayArenaInBattle;
        var replayFriendSoloInBattle = mc.GameData.replayFriendSoloInBattle;
        var challengeInBattle = mc.GameData.challengeInBattle;
        var worldBossInBattle = mc.GameData.worldBossInBattle;
        var guildBossInBattle = mc.GameData.guildBossInBattle;
        var bloodCastleInBattle = mc.GameData.bloodCastleInBattle;
        var resultInBattle = mc.GameData.resultInBattle;
        var summonManager = mc.GameData.summonManager;
        var assetChanger = mc.GameData.assetChanger;
        var stageChanger = mc.GameData.stageChanger;
        var accountChanger = mc.GameData.accountChanger;
        var lvlUpEvent = mc.GameData.lvlUpEvent;
        var heroInfoChangerCollection = mc.GameData.heroInfoChangerCollection;
        var giftEventManager = mc.GameData.giftEventManager;
        var mailManager = mc.GameData.mailManager;
        var notifySystem = mc.GameData.notifySystem;
        var mineSystem = mc.GameData.mineSystem;
        var worldBossSystem = mc.GameData.worldBossSystem;
        var guildBossSystem = mc.GameData.guildBossSystem;
        var stageBossSystem = mc.GameData.stageBossSystem;
        var friendManager = mc.GameData.friendManager;
        var refreshFunctionSystem = mc.GameData.refreshGameFunctionSystem;
        var dynamicDailyEvent = mc.GameData.dynamicDailyEvent;
        MessageManager.setEnableLog(LOG_PROTOCOL);
        MessageManager.setRemoteIps(key.NETWORK_URL);
        MessageManager.connect({

            onOpen: function (event) {
                connectionState.setState(mc.ConnectionState.SOCKET_STATE_OPEN);
                bb.utility.registerRunner("__PING_PONG__", function () {
                    protocol.ping();
                }, this, mc.const.PING_TIME_OUT);
            },

            onError: function (event) {
                cc.log(event);
                connectionState.setState(mc.ConnectionState.SOCKET_STATE_ERROR);
                bb.utility.unRegisterRunner("__PING_PONG__", this);
                if (!guiState.isReconnecting() && playerInfo.isLoggedIn()) {
                    new mc.DialogReconnect(event).show();
                }
            },

            onClose: function (event) {
                cc.log(event);
                connectionState.setState(mc.ConnectionState.SOCKET_STATE_CLOSE);
                bb.utility.unRegisterRunner("__PING_PONG__", this);
                if (!guiState.isReconnecting() && playerInfo.isLoggedIn()) {
                    new mc.DialogReconnect().show();
                }
            }

        });

        //SENDER
        protocol.logInMUGame = function (dataResult, svName, callback) {
            cc.log("protocol logInMUGame");
            mc.log("sign in MU Game!!");
            QANT2X.login(dataResult.token, "", svName || "mus1");
            callback && _registerCallback(QANT2X.SystemRequest.Login, callback);
        };
        protocol.logOutMUGame = function (callback) {
            mc.log("log out!!");
            QANT2X.logout();
            _registerCallback(QANT2X.SystemRequest.Logout, callback);
        };
        protocol.setDevice = function (deviceToken, deviceType) {
            var paramsObj = new QAntObject();
            if (deviceToken && deviceType) {
                paramsObj.putUtfString("dtok", deviceToken);
                paramsObj.putUtfString("dtyp", deviceType);
            }
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.DEVICE, paramsObj);
        };
        protocol.changePlayerProfile = function (name, avatarId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", PLAYER_UPDATE_INFO);
            (name != undefined) && paramsObj.putUtfString("name", name);
            (avatarId != undefined) && paramsObj.putInt("avatarIndex", avatarId);
            _registerCallback(key.MU_EXTENSION.PLAYER + "_" + PLAYER_UPDATE_INFO, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PLAYER, paramsObj);
        };

        protocol.transferRelic = function (userReceiveId, numRelic, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", PLAYER_TRANSFER_RELIC);
            paramsObj.putUtfString("toUser", userReceiveId);
            paramsObj.putInt("numRelic", numRelic);
            _registerCallback(key.MU_EXTENSION.PLAYER + "_" + PLAYER_TRANSFER_RELIC, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PLAYER, paramsObj);
        };
        protocol.viewPlayerProfile = function (userId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", PLAYER_VIEW_INFO);
            paramsObj.putUtfString("gameHeroId", userId);
            _registerCallback(key.MU_EXTENSION.PLAYER + "_" + PLAYER_VIEW_INFO, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PLAYER, paramsObj);
        };
        protocol.linkAccountFB = function (fbToken, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", PLAYER_LINK_ACCOUNT);
            (fbToken != undefined) && paramsObj.putUtfString("fb_token", fbToken);
            _registerCallback(key.MU_EXTENSION.PLAYER + "_" + PLAYER_LINK_ACCOUNT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PLAYER, paramsObj);
        };
        protocol.comeToStage = function (stageId, gameHeroId, slotId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt(key.PARAMETER.STAGE_ID, stageId);
            gameHeroId && paramsObj.putUtfString("gameHeroId", gameHeroId);
            slotId && paramsObj.putInt("slotId", slotId);
            mc.log("come to Stage: " + gameHeroId + ", " + slotId);
            _registerCallback(key.MU_EXTENSION.JOIN_STAGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.JOIN_STAGE, paramsObj);
        };
        protocol.finishStage = function (stageId, isWin, star, arrHeroGainExp) {
            var paramsObj = new QAntObject();
            paramsObj.putInt(key.PARAMETER.STAGE_ID, stageId);
            star && paramsObj.putInt("star", star);
            paramsObj.putBool(key.PARAMETER.WIN, isWin);

            var itemArr = new QAntArrayObject();
            var usedItemMapById = stageInBattle.getQuantityUsedItemMap();
            for (var itemId in usedItemMapById) {
                var quantity = usedItemMapById[itemId];
                if (quantity > 0) {
                    var itemSend = new QAntObject();
                    itemSend.putLong("id", parseInt(itemId));
                    itemSend.putInt("no", parseInt(quantity));
                    itemArr.addQAntObject(itemSend);
                }
            }
            paramsObj.putQAntArray("use_items", itemArr);
            arrHeroGainExp && paramsObj.putLongArray("heroIds", arrHeroGainExp);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FINISH_STAGE, paramsObj);
        };
        protocol.raidStage = function (stageId, callback) {
            var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
            var arrHeroGainExp = mc.GameData.teamFormationManager.getTeamFormationByIndex(mc.TeamFormationManager.TEAM_CAMPAIGN, teamIndex);

            var paramsObj = new QAntObject();
            paramsObj.putInt("act", CAMPAIGN_RAID);
            paramsObj.putInt(key.PARAMETER.STAGE_ID, stageId);
            arrHeroGainExp && paramsObj.putLongArray("heroIds", arrHeroGainExp);
            _registerCallback(key.MU_EXTENSION.FINISH_STAGE + "_" + CAMPAIGN_RAID, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FINISH_STAGE, paramsObj);
        };
        protocol.raidStage5 = function (stageId, callback) {
            var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
            var arrHeroGainExp = mc.GameData.teamFormationManager.getTeamFormationByIndex(mc.TeamFormationManager.TEAM_CAMPAIGN, teamIndex);

            var paramsObj = new QAntObject();
            paramsObj.putInt("act", CAMPAIGN_RAID_5);
            paramsObj.putInt(key.PARAMETER.STAGE_ID, stageId);
            arrHeroGainExp && paramsObj.putLongArray("heroIds", arrHeroGainExp);
            _registerCallback(key.MU_EXTENSION.FINISH_STAGE + "_" + CAMPAIGN_RAID, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FINISH_STAGE, paramsObj);
        };
        protocol.comeToChapter = function (chapterId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt(key.PARAMETER.CHAPTER_ID, chapterId);
            _registerCallback(key.MU_EXTENSION.JOIN_CHAPTER, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.JOIN_CHAPTER, paramsObj);
        };
        protocol.summon = function (packageIndex, isTicket, callback) {
            var act = SUMMON_PACKAGE;
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", act);
            paramsObj.putInt("packageIndex", packageIndex);
            paramsObj.putBool("isTicket", !!isTicket);
            _registerCallback(key.MU_EXTENSION.SUMMON + "_" + act, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.SUMMON, paramsObj);
        };
        protocol.setupCampaignTeam = function (index, arrHeroId, leaderIndex, name, callback) {
            var team1 = new QAntObject();
            if (leaderIndex != undefined) {
                team1.putInt("leaderIndex", leaderIndex);
            }
            name && team1.putUtfString("name", name);
            team1.putLongArray("heroes", arrHeroId);
            _registerCallback(key.MU_EXTENSION.UPDATE_CAMPAIGN_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.UPDATE_CAMPAIGN_TEAM, team1);
        };
        protocol.getGiftEvents = function (revision, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("rvs", revision || -1);
            paramsObj.putInt("act", GIFT_GET_LIST);
            _registerCallback(key.MU_EXTENSION.GIFT_EVENTS + "_" + GIFT_GET_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GIFT_EVENTS, paramsObj);
        };
        protocol.claimGiftEvent = function (claimMissing, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("rvs", giftEventManager.getRevision());
            paramsObj.putInt("act", GIFT_CLAIM_PACKAGE);
            paramsObj.putBool("claimMissing", claimMissing);
            _registerCallback(key.MU_EXTENSION.GIFT_EVENTS + "_" + GIFT_CLAIM_PACKAGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GIFT_EVENTS, paramsObj);
        };
        protocol.getHeroListByPageId = function (pageId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", HERO_LIST_CHUNK);
            paramsObj.putInt("page", pageId || 1);
            _registerCallback(key.MU_EXTENSION.HERO + "_" + HERO_LIST_CHUNK, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.HERO, paramsObj);
        };
        protocol.summonHeroPuzzle = function (heroIndex, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", HERO_SUMMON_PUZZLE);
            paramsObj.putInt("heroIndex", heroIndex);
            _registerCallback(key.MU_EXTENSION.HERO + "_" + HERO_SUMMON_PUZZLE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.HERO, paramsObj);
        };
        protocol.getItemListByPageId = function (pageId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_LIST_CHUNK);
            paramsObj.putInt("page", pageId || 1);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_LIST_CHUNK, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.lvlUpHero = function (heroId, arrItemInfo, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", HERO_UPGRADE_LEVEL);
            paramsObj.putLong("heroId", heroId);

            var haveItem = false;
            var arrHeroId = [];
            var itemArr = new QAntArrayObject();
            for (var i = 0; i < arrItemInfo.length; i++) {
                var itemInfo = arrItemInfo[i];
                var heroSoul = mc.ItemStock.getItemHeroSoul(itemInfo);
                if (heroSoul) {
                    arrHeroId.push(mc.HeroStock.getHeroId(heroSoul));
                } else {
                    if (mc.ItemStock.getItemQuantity(itemInfo) > 0) {
                        var itemObj1 = new QAntObject();
                        itemObj1.putLong("id", mc.ItemStock.getItemId(itemInfo));
                        itemObj1.putInt("no", mc.ItemStock.getItemQuantity(itemInfo));
                        itemObj1.putInt("index", mc.ItemStock.getItemIndex(itemInfo));
                        itemArr.addQAntObject(itemObj1);
                        haveItem = true;
                    }
                }
            }
            (arrHeroId.length > 0) && paramsObj.putLongArray("heroIds", arrHeroId);
            haveItem && paramsObj.putQAntArray("items", itemArr);
            _registerCallback(key.MU_EXTENSION.HERO + "_" + HERO_UPGRADE_LEVEL, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.HERO, paramsObj);
        };
        protocol.rankUpHero = function (heroId, arrItemInfo, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", HERO_UPGRADE_RANK);
            paramsObj.putLong("heroId", heroId);

            var haveItem = false;
            var itemArr = new QAntArrayObject();
            for (var i = 0; i < arrItemInfo.length; i++) {
                var itemInfo = arrItemInfo[i];
                if (mc.ItemStock.getItemQuantity(itemInfo) > 0) {
                    var itemObj1 = new QAntObject();
                    itemObj1.putLong("id", mc.ItemStock.getItemId(itemInfo));
                    itemObj1.putInt("no", mc.ItemStock.getItemQuantity(itemInfo));
                    itemArr.addQAntObject(itemObj1);
                    haveItem = true;
                }
            }
            haveItem && paramsObj.putQAntArray("items", itemArr);
            _registerCallback(key.MU_EXTENSION.HERO + "_" + HERO_UPGRADE_RANK, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.HERO, paramsObj);
        };
        protocol.upgradeSkill = function (heroId, skillIndex, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", HERO_UPGRADE_SKILL);
            paramsObj.putLong("heroId", heroId);
            paramsObj.putInt("skillIndex", skillIndex);
            _registerCallback(key.MU_EXTENSION.HERO + "_" + HERO_UPGRADE_SKILL, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.HERO, paramsObj);
        };
        protocol.exchangeStoneByHeroIds = function (heroIds, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", HERO_EXCHANGE_STONES);
            paramsObj.putLongArray("heroIds", heroIds);
            _registerCallback(key.MU_EXTENSION.HERO + "_" + HERO_EXCHANGE_STONES, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.HERO, paramsObj);
        };
        protocol.exchangeItems = function (arrItemInfo, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_EXCHANGE_LIST);

            var itemArr = new QAntArrayObject();
            for (var i = 0; i < arrItemInfo.length; i++) {
                var itemInfo = arrItemInfo[i];
                if (mc.ItemStock.getItemQuantity(itemInfo) > 0) {
                    var itemObj1 = new QAntObject();
                    itemObj1.putLong("id", mc.ItemStock.getItemId(itemInfo));
                    itemObj1.putInt("no", mc.ItemStock.getItemQuantity(itemInfo));
                    itemArr.addQAntObject(itemObj1);
                }
            }
            paramsObj.putQAntArray("items", itemArr);

            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_EXCHANGE_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.doItemsWithVaults = function (itemIds, isPutIn, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_INVENTORY);
            paramsObj.putBool("isPutIn", isPutIn);
            paramsObj.putLongArray("itemIds", itemIds);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_INVENTORY, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        var _requestItemFromVaultByPage = function (pageId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_INVENTORY_INFO);
            paramsObj.putInt("page", pageId || 1);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_INVENTORY_INFO, function (result) {
                var curr_page = result["page"];
                var max_page = result["max_page"];
                if (curr_page + 1 <= max_page) {
                    _requestItemFromVaultByPage(curr_page + 1, callback);
                } else {
                    callback && callback(result);
                }
            });
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.getItemsFromVault = function (callback) {
            _requestItemFromVaultByPage(null, callback);
        };
        protocol.sellItem = function (itemId, no, callback) {
            no = no || 1;
            if (no > 0) {
                var paramsObj = new QAntObject();
                paramsObj.putInt("act", ITEM_ACTION_SELL);
                paramsObj.putInt("no", no);
                paramsObj.putLong("itemId", itemId);
                _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_SELL, callback);
                QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
            }
        };
        protocol.openItemPack = function (itemId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_OPEN_CHEST);
            paramsObj.putLong("itemId", itemId);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_OPEN_CHEST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.submitHeroTakeOnItem = function (heroId, itemId, slotIndex, callback) {
            mc.log(heroId + " EQUIP " + itemId + " ON " + slotIndex);
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_TAKE_ON);
            paramsObj.putLong("heroId", heroId);
            paramsObj.putLong("itemId", itemId);
            paramsObj.putInt("slotIndex", slotIndex);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_TAKE_ON, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.submitHeroTakeOffItem = function (heroId, itemId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_TAKE_OFF);
            paramsObj.putLong("heroId", heroId);
            paramsObj.putLong("itemId", itemId);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_TAKE_OFF, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.requestItemShopByCategory = function (categoryId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", SHOP_GET_ITEM_LIST);
            categoryId && paramsObj.putUtfString("cat_id", categoryId);
            _registerCallback(key.MU_EXTENSION.SHOP + "_" + SHOP_GET_ITEM_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.SHOP, paramsObj);
        };
        protocol.refreshShopByCategory = function (categoryId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", SHOP_REFRESH);
            categoryId && paramsObj.putUtfString("cat_id", categoryId);
            _registerCallback(key.MU_EXTENSION.SHOP + "_" + SHOP_REFRESH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.SHOP, paramsObj);
        };
        protocol.buyItem = function (packageIndex, categoryId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", SHOP_BUY_ITEM);
            paramsObj.putInt("package_index", packageIndex);
            categoryId && paramsObj.putUtfString("cat_id", categoryId);
            _registerCallback(key.MU_EXTENSION.SHOP + "_" + SHOP_BUY_ITEM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.SHOP, paramsObj);
        };
        protocol.lvlUpItem = function (itemId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_UPGRADE);
            paramsObj.putLong("id", itemId);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_UPGRADE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.exchageItem = function (itemIndex, no, callback) {
            if (no > 0) {
                var paramsObj = new QAntObject();
                paramsObj.putInt("act", ITEM_ACTION_EXCHANGE);
                paramsObj.putInt("itemIndex", itemIndex);
                paramsObj.putInt("no", no);
                _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_EXCHANGE, callback);
                QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
            }
        };
        protocol.buyStamina = function (callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_BUY_STAMINA);
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_BUY_STAMINA, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.craftItem = function (itemIndex, arrMaterialInfo, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_CRAFT);
            paramsObj.putInt("itemIndex", itemIndex);
            if (arrMaterialInfo && arrMaterialInfo.length > 0) {
                var itemArr = new QAntArrayObject();
                for (var i = 0; i < arrMaterialInfo.length; i++) {
                    if (mc.ItemStock.getItemQuantity(arrMaterialInfo[i]) > 0) {
                        var itemSend = new QAntObject();
                        itemSend.putLong("id", mc.ItemStock.getItemId(arrMaterialInfo[i]));
                        itemSend.putInt("no", mc.ItemStock.getItemQuantity(arrMaterialInfo[i]));
                        itemArr.addQAntObject(itemSend);
                    }
                }
                paramsObj.putQAntArray("use_items", itemArr);
            }
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_CRAFT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.optionForItem = function (itemIndex, arrMaterialInfo, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ITEM_ACTION_CHANGE_OPTION);
            paramsObj.putInt("itemIndex", itemIndex);
            if (arrMaterialInfo && arrMaterialInfo.length > 0) {
                var itemArr = new QAntArrayObject();
                for (var i = 0; i < arrMaterialInfo.length; i++) {
                    if (mc.ItemStock.getItemQuantity(arrMaterialInfo[i]) > 0) {
                        var itemSend = new QAntObject();
                        itemSend.putLong("id", mc.ItemStock.getItemId(arrMaterialInfo[i]));
                        itemSend.putInt("no", mc.ItemStock.getItemQuantity(arrMaterialInfo[i]));
                        itemArr.addQAntObject(itemSend);
                    }
                }
                paramsObj.putQAntArray("use_items", itemArr);
            }
            _registerCallback(key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + ITEM_ACTION_CHANGE_OPTION, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ACTION_WITH_ITEM, paramsObj);
        };
        protocol.getQuestList = function (gid, callback) {
            var params = new QAntObject();
            params.putInt("act", QUEST_GET_LIST);
            params.putUtfString("group", gid);
            _registerCallback(key.MU_EXTENSION.QUEST + "_" + QUEST_GET_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.QUEST, params);
        };
        protocol.claimQuest = function (questId, callback) {
            var params = new QAntObject();
            params.putInt("act", QUEST_CLAIM);
            params.putLong("qid", questId);
            _registerCallback(key.MU_EXTENSION.QUEST + "_" + QUEST_CLAIM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.QUEST, params);
        };
        protocol.claimAllQuest = function (groupId, arrQuestId, callback) {
            var params = new QAntObject();
            params.putInt("act", QUEST_CLAIM_ALL);
            params.putUtfString("groupId", groupId);
            params.putLongArray("qids", arrQuestId);
            _registerCallback(key.MU_EXTENSION.QUEST + "_" + QUEST_CLAIM_ALL, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.QUEST, params);
        };
        protocol.finishQuest = function (qid, value, callback) {
            value = value || 1;
            var params = new QAntObject();
            params.putInt("act", QUEST_FINISH);
            params.putLong("qid", qid);
            params.putInt("value", value);
            _registerCallback(key.MU_EXTENSION.QUEST + "_" + QUEST_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.QUEST, params);
        };
        protocol.joinChaosCastle = function (callback) {
            var params = new QAntObject();
            params.putInt("act", CHAOS_CASTLE_JOIN);
            _registerCallback(key.MU_EXTENSION.CHAOS_CASTLE + "_" + CHAOS_CASTLE_JOIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAOS_CASTLE, params);
        };
        protocol.startBattleChaosCastle = function (stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", CHAOS_CASTLE_START_BATTLE);
            params.putInt("index", stageIndex);
            _registerCallback(key.MU_EXTENSION.CHAOS_CASTLE + "_" + CHAOS_CASTLE_START_BATTLE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAOS_CASTLE, params);
        };
        protocol.finishBattleChaosCastle = function (stageIndex, numStar, arrCreatureStatus, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", CHAOS_CASTLE_FINISH);
            numStar > 0 && paramsObj.putInt("star", numStar);
            paramsObj.putInt("index", stageIndex);
            paramsObj.putBool("win", numStar > 0);

            if (arrCreatureStatus) {
                var properties = new QAntArrayObject();
                for (var h = 0; h < arrCreatureStatus.length; h++) {
                    var property = new QAntObject();
                    property.putLong("heroId", arrCreatureStatus[h].id);
                    property.putLong("hpPercent", Math.floor(arrCreatureStatus[h].hpPercent));
                    property.putLong("mpPercent", Math.floor(arrCreatureStatus[h].mpPercent));
                    properties.addQAntObject(property);
                }
                paramsObj.putQAntArray("properties", properties);
            }

            var itemArr = new QAntArrayObject();
            var usedItemMapById = chaosCastleInBattle.getQuantityUsedByItemId();
            for (var itemId in usedItemMapById) {
                var quantity = usedItemMapById[itemId];
                quantity = parseInt(quantity);
                if (quantity > 0) {
                    var itemSend = new QAntObject();
                    itemSend.putLong("id", itemId);
                    itemSend.putInt("no", quantity);
                    itemArr.addQAntObject(itemSend);
                }
            }
            paramsObj.putQAntArray("use_items", itemArr);
            _registerCallback(key.MU_EXTENSION.CHAOS_CASTLE + "_" + CHAOS_CASTLE_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAOS_CASTLE, paramsObj);
        };
        protocol.claimRewardChaosCastle = function (stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", CHAOS_CASTLE_CLAIM);
            params.putInt("index", stageIndex);
            _registerCallback(key.MU_EXTENSION.CHAOS_CASTLE + "_" + CHAOS_CASTLE_CLAIM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAOS_CASTLE, params);
        };
        protocol.restartChaosCastle = function (callback) {
            var params = new QAntObject();
            params.putInt("act", CHAOS_CASTLE_RESTART);
            _registerCallback(key.MU_EXTENSION.CHAOS_CASTLE + "_" + CHAOS_CASTLE_RESTART, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAOS_CASTLE, params);
        };
        protocol.viewChaosCastleStage = function (stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", CHAOS_CASTLE_VIEW_STAGE);
            params.putInt("index", stageIndex);
            _registerCallback(key.MU_EXTENSION.CHAOS_CASTLE + "_" + CHAOS_CASTLE_VIEW_STAGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAOS_CASTLE, params);
        };
        protocol.setupChaosCastleTeam = function (index, arrHeroId, leaderIndex, callback) {
            leaderIndex = leaderIndex || 0;
            var params = new QAntObject();
            params.putInt("act", CHAOS_CASTLE_SETUP_TEAM);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", arrHeroId);
            _registerCallback(key.MU_EXTENSION.CHAOS_CASTLE + "_" + CHAOS_CASTLE_SETUP_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAOS_CASTLE, params);
        };
        protocol.joinArena = function (callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ARENA_JOIN);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_JOIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, paramsObj);
        };
        protocol.listFriendsArena = function (callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ARENA_LIST_FRIENDS);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_LIST_FRIENDS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, paramsObj);
        };
        protocol.getTopArena = function (topId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ARENA_GET_TOP);
            topId && paramsObj.putUtfString("league", topId);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_GET_TOP, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, paramsObj);
        };
        protocol.getBattleRecordArena = function (pageId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ARENA_GET_BATTLE_RECORD);
            pageId && paramsObj.putInt("pageId", pageId);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_GET_BATTLE_RECORD, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, paramsObj);
        };
        protocol.searchArenaOpponent = function (callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ARENA_FIND);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_FIND, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, paramsObj);
        };
        protocol.fightArenaOpponent = function (gameHeroId, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ARENA_FIGHT);
            paramsObj.putUtfString("defenderId", gameHeroId);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_FIGHT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, paramsObj);
        };
        protocol.finishArena = function (numStar, scriptStr, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ARENA_FINISH);
            numStar > 0 && paramsObj.putInt("star", numStar);
            paramsObj.putBool("win", numStar > 0);
            if (scriptStr) {
                paramsObj.putUtfString("script", scriptStr);
            }
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, paramsObj);
        };
        protocol.setupArenaTeam = function (index, arrHeroId, leaderIndex, isDefense, callback) {
            leaderIndex = leaderIndex || 0;
            var params = new QAntObject();
            params.putInt("act", ARENA_SETUP_TEAM);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", arrHeroId);
            isDefense && params.putBool("is_def", isDefense);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_SETUP_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, params);
        };
        protocol.setupDefenseArenaTeam = function (index, arrHeroId, leaderIndex, callback) {
            leaderIndex = leaderIndex || 0;
            var params = new QAntObject();
            params.putInt("act", ARENA_SETUP_TEAM);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", arrHeroId);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_SETUP_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, params);
        };
        protocol.replayArenaBattle = function (battleId, callback) {
            var params = new QAntObject();
            params.putInt("act", ARENA_BATTLE_REPLAY);
            params.putLong("battleId", battleId);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_BATTLE_REPLAY, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, params);
        };
        protocol.revengeArenaBattle = function (battleId, callback) {
            var params = new QAntObject();
            params.putInt("act", ARENA_BATTLE_REVENGE);
            params.putLong("battleId", battleId);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_BATTLE_REVENGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, params);
        };
        protocol.getOpponentDefenseTeam = function (gameHeroId, callback) {
            var params = new QAntObject();
            params.putInt("act", ARENA_GET_OPPONENT_DEFENSE_TEAM);
            params.putUtfString("gameHeroId", gameHeroId);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_GET_OPPONENT_DEFENSE_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, params);
        };
        protocol.getTopClanArena = function (callback) {
            var params = new QAntObject();
            params.putInt("act", ARENA_GET_TOP_CLAN);
            _registerCallback(key.MU_EXTENSION.ARENA + "_" + ARENA_GET_TOP_CLAN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ARENA, params);
        };
        protocol.getAllSummonPackage = function (callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", GET_SUMMON_PACKAGE_LIST);
            _registerCallback(key.MU_EXTENSION.SUMMON + "_" + GET_SUMMON_PACKAGE_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.SUMMON, paramsObj);
        };
        protocol.openMail = function (mailId, callback) {
            var params = new QAntObject();
            params.putInt("act", MAIL_OPEN);
            params.putLong("id", mailId);
            _registerCallback(key.MU_EXTENSION.MAIL + "_" + MAIL_OPEN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MAIL, params);
        };
        protocol.getMailList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", MAIL_LIST);
            _registerCallback(key.MU_EXTENSION.MAIL + "_" + MAIL_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MAIL, params);
        };
        protocol.actionWithMail = function (mailId, actMail, callback) {
            var params = new QAntObject();
            params.putInt("act", MAIL_ACTION);
            params.putLong("id", mailId);
            params.putUtfString("actId", actMail);
            _registerCallback(key.MU_EXTENSION.MAIL + "_" + MAIL_ACTION, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MAIL, params);
        };
        protocol.claimMails = function (arrMailId, callback) {
            var params = new QAntObject();
            params.putInt("act", MAIL_CLAIM_ALL);
            params.putLongArray("ids", arrMailId);
            _registerCallback(key.MU_EXTENSION.MAIL + "_" + MAIL_CLAIM_ALL, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MAIL, params);
        };
        protocol.deleteMails = function (arrMailId, callback) {
            var params = new QAntObject();
            params.putInt("act", MAIL_DELETE_ALL);
            params.putLongArray("ids", arrMailId);
            _registerCallback(key.MU_EXTENSION.MAIL + "_" + MAIL_DELETE_ALL, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MAIL, params);
        };
        protocol.updateSetting = function (callback) {
            var params = new QAntObject();
            params.putInt("act", SETTING_UPDATE);
            params.putUtfString("clientData", JSON.stringify(setting.getClientData()));
            callback && _registerCallback(key.MU_EXTENSION.SETTING + "_" + SETTING_UPDATE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.SETTING, params);
        };
        protocol.getMineInfo = function (callback) {
            var params = new QAntObject();
            params.putInt("act", MINING_GET_INFO);
            callback && _registerCallback(key.MU_EXTENSION.MINING + "_" + MINING_GET_INFO, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINING, params);
        };
        protocol.startMine = function (chapterIndex, arrHeroId, callback) {
            var params = new QAntObject();
            params.putInt("act", MINING_START);
            params.putInt("chapter_index", MINING_START);
            params.putLongArray("heroIds", arrHeroId);
            callback && _registerCallback(key.MU_EXTENSION.MINING + "_" + MINING_START, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINING, params);
        };
        protocol.stopMine = function (callback) {
            var params = new QAntObject();
            params.putInt("act", MINING_STOP);
            callback && _registerCallback(key.MU_EXTENSION.MINING + "_" + MINING_STOP, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINING, params);
        };
        protocol.collectMine = function (arrItemInfo, arrHeroInfo, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", MINING_COLLECT);

            var heroExpArr = new QAntArrayObject();
            for (var i = 0; i < arrHeroInfo.length; i++) {
                var heroExp = new QAntObject();
                heroExp.putLong("heroId", arrHeroInfo[i].id);
                heroExp.putInt("exp", arrHeroInfo[i].exp);
                heroExpArr.addQAntObject(heroExp);
            }

            var itemArr = new QAntArrayObject();
            for (var i = 0; i < arrItemInfo.length; i++) {
                if (mc.ItemStock.getItemQuantity(arrItemInfo[i]) > 0) {
                    var item = new QAntObject();
                    item.putInt("index", arrItemInfo[i].index);
                    item.putInt("no", mc.ItemStock.getItemQuantity(arrItemInfo[i]));
                    itemArr.addQAntObject(item);
                }
            }

            paramsObj.putQAntArray("heroExpArr", heroExpArr);
            paramsObj.putQAntArray("items", itemArr);
            callback && _registerCallback(key.MU_EXTENSION.MINING + "_" + MINING_COLLECT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINING, paramsObj);
        };
        protocol.getSuggestHeroList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_GET_SUGGEST_HERO_LIST);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_GET_SUGGEST_HERO_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.requestAddFriend = function (gameHeroId, callback) {
            if (!gameHeroId) {
                callback && callback(false);
                return;
            }
            var params = new QAntObject();
            params.putInt("act", FRIEND_REQUEST_ADD);
            params.putUtfString("gameHeroId", gameHeroId);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_REQUEST_ADD, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.requestSendFriendPoint = function (gameHeroId, callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_SEND_POINT);
            gameHeroId && params.putUtfString("gameHeroId", gameHeroId);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_SEND_POINT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.requestSendAllFriendPoint = function (callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_SEND_ALL_POINT);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_SEND_ALL_POINT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.requestUnFriend = function (gameHeroId, callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_UNFRIEND_SEND);
            gameHeroId && params.putUtfString("gameHeroId", gameHeroId);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_UNFRIEND_SEND, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.getFriendList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_GET_FRIEND_LIST);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_GET_FRIEND_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.getFriendRequestList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_GET_REQUEST_LIST);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_GET_REQUEST_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.searchFriendByName = function (name, currPage, callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_SEARCH);
            params.putUtfString("name", name);
            currPage && params.putUtfString("page", currPage);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_SEARCH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.responseFriendRequest = function (acceptOrDeny, gameHeroId, callback) {
            var act = acceptOrDeny ? FRIEND_ACCEPT_REQUEST : FRIEND_DENY_REQUEST;
            var params = new QAntObject();
            params.putInt("act", act);
            gameHeroId && params.putUtfString("gameHeroId", gameHeroId);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + act, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.requestFriendSolo = function (gameHeroId, callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_SOLO_REQUEST);
            gameHeroId && params.putUtfString("gameHeroId", gameHeroId);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_SOLO_REQUEST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.submitFriendSoloResult = function (win, script, callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_SOLO_FINISH);
            params.putBool("win", win);
            params.putUtfString("script", script);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_SOLO_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.getFriendSoloHistory = function (page, callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_SOLO_HISTORY);
            params.putInt("page", page);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_SOLO_HISTORY, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.getFriendSoloReplay = function (battleId, callback) {
            var params = new QAntObject();
            params.putInt("act", FRIEND_SOLO_REPLAY);
            params.putLong("battleId", battleId);
            callback && _registerCallback(key.MU_EXTENSION.FRIEND + "_" + FRIEND_SOLO_REPLAY, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.FRIEND, params);
        };
        protocol.getListChallengeGroup = function (callback) {
            var params = new QAntObject();
            params.putInt("act", CHALLENGE_GET_LIST);
            callback && _registerCallback(key.MU_EXTENSION.DAILY_CHALLENGE + "_" + CHALLENGE_GET_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.DAILY_CHALLENGE, params);
        };
        protocol.fightChallengeStage = function (stageChallengeId, callback) {
            var params = new QAntObject();
            params.putInt("act", CHALLENGE_FIGHT);
            params.putInt("stgid", stageChallengeId);
            callback && _registerCallback(key.MU_EXTENSION.DAILY_CHALLENGE + "_" + CHALLENGE_FIGHT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.DAILY_CHALLENGE, params);
        };
        protocol.finishChallengeStage = function (stageChallengeId, star, callback) {
            var params = new QAntObject();
            params.putInt("act", CHALLENGE_FINISH);
            params.putBool("win", star > 0);
            params.putInt("star", star);
            callback && _registerCallback(key.MU_EXTENSION.DAILY_CHALLENGE + "_" + CHALLENGE_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.DAILY_CHALLENGE, params);
        };
        protocol.getBloodCastleInfo = function (callback) {
            var params = new QAntObject();
            params.putInt("act", BLOOD_CASTLE_GET_LIST);
            callback && _registerCallback(key.MU_EXTENSION.BLOOD_CASTLE + "_" + BLOOD_CASTLE_GET_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BLOOD_CASTLE, params);
        };
        protocol.fightBloodCastleStage = function (stageBloodCastleId, callback) {
            var params = new QAntObject();
            params.putInt("act", BLOOD_CASTLE_FIGHT);
            params.putInt("bcIndex", stageBloodCastleId);
            callback && _registerCallback(key.MU_EXTENSION.BLOOD_CASTLE + "_" + BLOOD_CASTLE_FIGHT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BLOOD_CASTLE, params);
        };
        protocol.finishBloodCastleStage = function (bcIndex, star, finishTime, finishWaveIdx, callback) {
            var params = new QAntObject();
            params.putInt("act", BLOOD_CASTLE_FINISH);
            params.putInt("bcIndex", bcIndex);
            params.putBool("win", star > 0);
            params.putLong("finishTime", finishTime);
            params.putInt("finishWaveIdx", finishWaveIdx);

            var itemArr = new QAntArrayObject();
            var usedItemMapById = stageInBattle.getQuantityUsedItemMap();
            for (var itemId in usedItemMapById) {
                var quantity = usedItemMapById[itemId];
                if (quantity > 0) {
                    var itemSend = new QAntObject();
                    itemSend.putLong("id", parseInt(itemId));
                    itemSend.putInt("no", parseInt(quantity));
                    itemArr.addQAntObject(itemSend);
                }
            }

            var arrHeroId = mc.GameData.teamFormationManager.getTeamFormationByIndex(mc.TeamFormationManager.TEAM_BLOODCASTLE);
            var properties = new QAntArrayObject();
            for (var h = 0; h < arrHeroId.length; h++) {
                if (arrHeroId[h] > 0) {
                    var property = new QAntObject();
                    property.putLong("heroId", arrHeroId[h]);
                    property.putLong("hpPercent", 0);
                    properties.addQAntObject(property);
                }
            }
            params.putQAntArray("properties", properties);

            params.putQAntArray("use_items", itemArr);
            callback && _registerCallback(key.MU_EXTENSION.BLOOD_CASTLE + "_" + BLOOD_CASTLE_FINISH, callback);
            _pushParameter(key.MU_EXTENSION.BLOOD_CASTLE + "_" + BLOOD_CASTLE_FINISH, star);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BLOOD_CASTLE, params);
        };
        protocol.setupBloodCastleTeam = function (index, arrHeroId, leaderIndex, callback) {
            leaderIndex = leaderIndex || 0;
            var params = new QAntObject();
            params.putInt("act", BLOOD_CASTLE_SETUP_TEAM);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", arrHeroId);
            _registerCallback(key.MU_EXTENSION.BLOOD_CASTLE + "_" + BLOOD_CASTLE_SETUP_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BLOOD_CASTLE, params);
        };
        protocol.quickFinishChallengeStage = function (stageChallengeId, callback) {
            var params = new QAntObject();
            params.putInt("act", CHALLENGE_QUICK_FINISH);
            params.putInt("stgid", stageChallengeId);
            params.putBool("win", true);
            callback && _registerCallback(key.MU_EXTENSION.DAILY_CHALLENGE + "_" + CHALLENGE_QUICK_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.DAILY_CHALLENGE, params);
        };
        protocol.getGiftCodeReward = function (giftCode, callback) {
            var params = new QAntObject();
            params.putInt("act", COMMON_GET_GIFTCODE_REWARD);
            params.putUtfString("giftCode", giftCode);
            callback && _registerCallback(key.MU_EXTENSION.COMMON + "_" + COMMON_GET_GIFTCODE_REWARD, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.COMMON, params);
        };
        protocol.verifyPayment = function (strInAppItem, orderId, callback) {
            var inAppItem = bb.framework.isAndroid() ? JSON.parse(strInAppItem) : strInAppItem;
            var params = new QAntObject();
            var act = null;
            if (bb.framework.isAndroid()) {
                act = PAYMENT_VERIFY_GOOGLE_INAP;
                params.putInt("act", act);
                params.putUtfString("packageName", mc.const.PACKAGE_NAME);
                params.putUtfString("orderId", inAppItem["orderId"]);
                params.putUtfString("productId", inAppItem["productId"]);
                params.putUtfString("purchaseToken", inAppItem["purchaseToken"]);
            } else {
                act = PAYMENT_VERIFY_APPLE_INAPP;
                params.putInt("act", act);
                params.putUtfString("receipt", inAppItem);
            }
            params.putInt("order", orderId);
            callback && _registerCallback(key.MU_EXTENSION.PAYMENT + "_" + act, callback);
            _pushParameter(key.MU_EXTENSION.PAYMENT + "_" + act, strInAppItem);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PAYMENT, params);
        };
        protocol.getBuyTimesPayment = function (callback) {
            var params = new QAntObject();
            params.putInt("act", PAYMENT_GET_BUY_TIMES);
            callback && _registerCallback(key.MU_EXTENSION.PAYMENT + "_" + PAYMENT_GET_BUY_TIMES, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PAYMENT, params);
        };
        protocol.checkFirstTimeRewards = function (callback) {
            var params = new QAntObject();
            params.putInt("act", PAYMENT_FIRST_TIME_CHECK);
            params.putBool("isClaim", false);
            callback && _registerCallback(key.MU_EXTENSION.PAYMENT + "_" + PAYMENT_FIRST_TIME_CHECK, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PAYMENT, params);
        };
        protocol.checkManaCoinReward = function (callback) {
            var params = new QAntObject();
            params.putInt("act", PAYMENT_MANA_COIN_REWARD_CHECK);
            callback && _registerCallback(key.MU_EXTENSION.PAYMENT + "_" + PAYMENT_MANA_COIN_REWARD_CHECK, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PAYMENT, params);
        };
        protocol.claimManaCoinReward = function (claimId, callback) {
            var params = new QAntObject();
            params.putInt("act", PAYMENT_MANA_COIN_REWARD_CLAIM);
            params.putInt("claimId", claimId);
            callback && _registerCallback(key.MU_EXTENSION.PAYMENT + "_" + PAYMENT_MANA_COIN_REWARD_CLAIM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PAYMENT, params);
        };
        protocol.claimFirstTimeRewards = function (callback) {
            var params = new QAntObject();
            params.putInt("act", PAYMENT_FIRST_TIME_CHECK);
            params.putBool("isClaim", true);
            callback && _registerCallback(key.MU_EXTENSION.PAYMENT + "_" + PAYMENT_FIRST_TIME_CHECK, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.PAYMENT, params);
        };
        protocol.getGameFunctionList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", COMMON_GET_FUNCTION_LIST);
            callback && _registerCallback(key.MU_EXTENSION.COMMON + "_" + COMMON_GET_FUNCTION_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.COMMON, params);
        };
        protocol.exchangeGameFunction = function (gameFuncCode, no, callback) {
            var params = new QAntObject();
            params.putInt("act", COMMON_EXCHANGE_FUNCTION);
            params.putUtfString("func", gameFuncCode);
            if (no && no > 0) {
                params.putInt("no", no);
            }
            callback && _registerCallback(key.MU_EXTENSION.COMMON + "_" + COMMON_EXCHANGE_FUNCTION, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.COMMON, params);
        };
        protocol.rateGame = function (callback) {
            var params = new QAntObject();
            params.putInt("act", COMMON_RATING_APP);
            callback && _registerCallback(key.MU_EXTENSION.COMMON + "_" + COMMON_RATING_APP, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.COMMON, params);
        };

        protocol.traslate = function (locale, msg, callback) {
            var params = new QAntObject();
            params.putInt("act", TRASLATE_CHAT);
            params.putUtfString("locale", locale);
            params.putUtfString("msg", msg);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + TRASLATE_CHAT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };

        protocol.privateChat = function (receiverId, msg, callback) {
            var params = new QAntObject();
            params.putInt("act", PRIVATE_CHAT);
            params.putUtfString("msg", msg);
            params.putUtfString("receiverId", receiverId);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + PRIVATE_CHAT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };
        protocol.worldChat = function (msg, callback) {
            var params = new QAntObject();
            params.putInt("act", WORLD_CHAT);
            params.putUtfString("msg", msg);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + WORLD_CHAT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };
        protocol.guildChat = function (groupId, msg, callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_CHAT);
            params.putUtfString("msg", msg);
            params.putLong("guildId", groupId);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + GUILD_CHAT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };
        protocol.listChatLogs = function (type, id, pageIdx, callback) {
            var params = new QAntObject();
            params.putInt("act", LIST_CHAT_LOGS);
            params.putUtfString("groupId", type);
            if (id) {
                params.putLong("guildId", id);
            }
            pageIdx && params.putInt("page", pageIdx);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + LIST_CHAT_LOGS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };

        protocol.listPrivateChatLogs = function (id, callback) {
            var params = new QAntObject();
            params.putInt("act", LIST_CHAT_LOGS);
            params.putUtfString("groupId", "private");
            params.putUtfString("conversationId", id);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + LIST_CHAT_LOGS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };

        protocol.updateConversation = function (id, callback) {
            var params = new QAntObject();
            params.putInt("act", UPDATE_CONV_CHAT);
            params.putUtfString("conversationId", id);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + UPDATE_CONV_CHAT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };

        protocol.listConversation = function (callback, pageIdx) {
            var params = new QAntObject();
            params.putInt("act", LIST_CONV_CHAT);
            pageIdx && params.putInt("page", pageIdx);
            callback && _registerCallback(key.MU_EXTENSION.CHAT + "_" + LIST_CONV_CHAT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.CHAT, params);
        };


        protocol.spinRewards = function (callback) {
            var params = new QAntObject();
            params.putInt("act", SPIN_REWARDS);
            callback && _registerCallback(key.MU_EXTENSION.MINI_GAME + "_" + SPIN_REWARDS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINI_GAME, params);
        };
        protocol.beatEgg = function (eggId, packageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", BEAT_EGG);
            params.putUtfString("eggId", eggId);
            params.putInt("package_index", packageIndex);
            callback && _registerCallback(key.MU_EXTENSION.MINI_GAME + "_" + BEAT_EGG, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINI_GAME, params);
        };
        protocol.getEggList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", EGG_LIST);
            callback && _registerCallback(key.MU_EXTENSION.MINI_GAME + "_" + EGG_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINI_GAME, params);
        };
        protocol.refreshEggList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", REFRESH_EGG_LIST);
            callback && _registerCallback(key.MU_EXTENSION.MINI_GAME + "_" + REFRESH_EGG_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.MINI_GAME, params);
        };
        protocol.ping = function () {
            var paramsObj = new QAntObject();
            QANT2X.sendSystemMessage(QANT2X.SystemRequest.PingPong, paramsObj);
        };
        protocol.joinWorldBoss = function (callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", WORLD_BOSS_JOIN);
            _registerCallback(key.MU_EXTENSION.WORLD_BOSS + "_" + WORLD_BOSS_JOIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.WORLD_BOSS, paramsObj);
        };
        protocol.setupWorldBossTeam = function (index, arrHeroId, leaderIndex, callback) {
            leaderIndex = leaderIndex || 0;
            var params = new QAntObject();
            params.putInt("act", WORLD_BOSS_SETUP_TEAM);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", arrHeroId);
            _registerCallback(key.MU_EXTENSION.WORLD_BOSS + "_" + WORLD_BOSS_SETUP_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.WORLD_BOSS, params);
        };
        protocol.fightWorldBoss = function (callback) {
            var params = new QAntObject();
            params.putInt("act", WORLD_BOSS_FIGHT);
            _registerCallback(key.MU_EXTENSION.WORLD_BOSS + "_" + WORLD_BOSS_FIGHT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.WORLD_BOSS, params);
        };
        protocol.leaveRoomWorldBoss = function (callback) {
            var params = new QAntObject();
            params.putInt("act", WORLD_BOSS_LEAVE_ROOM);
            _registerCallback(key.MU_EXTENSION.WORLD_BOSS + "_" + WORLD_BOSS_LEAVE_ROOM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.WORLD_BOSS, params);
        };
        protocol.finishWorldBossBattle = function (damage, arrCreatureStatus, isCheck, callback) {
            var params = new QAntObject();
            params.putInt("act", WORLD_BOSS_FINISH_BATTLE);

            var itemArr = new QAntArrayObject();
            var usedItemMapById = worldBossInBattle.getQuantityUsedItemMap();
            for (var itemId in usedItemMapById) {
                var quantity = usedItemMapById[itemId];
                if (quantity > 0) {
                    var itemSend = new QAntObject();
                    itemSend.putLong("id", parseInt(itemId));
                    itemSend.putInt("no", parseInt(quantity));
                    itemArr.addQAntObject(itemSend);
                }
            }
            params.putQAntArray("use_items", itemArr);

            if (arrCreatureStatus) {
                var properties = new QAntArrayObject();
                for (var h = 0; h < arrCreatureStatus.length; h++) {
                    var property = new QAntObject();
                    property.putLong("heroId", arrCreatureStatus[h].id);
                    property.putLong("hpPercent", Math.floor(arrCreatureStatus[h].hpPercent));
                    properties.addQAntObject(property);
                }
                params.putQAntArray("properties", properties);
            }
            damage > 0 && params.putInt("dame", damage);
            isCheck && params.putBool("check", isCheck);

            _registerCallback(key.MU_EXTENSION.WORLD_BOSS + "_" + WORLD_BOSS_FINISH_BATTLE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.WORLD_BOSS, params);
        };
        protocol.getTopDamageWorldBoss = function (callback) {
            var params = new QAntObject();
            params.putInt("act", WORLD_BOSS_GET_TOP_DAMAGE);
            _registerCallback(key.MU_EXTENSION.WORLD_BOSS + "_" + WORLD_BOSS_GET_TOP_DAMAGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.WORLD_BOSS, params);
        };
        protocol.submitDamageWithWorldBoss = function (damage, callback) {
            var params = new QAntObject();
            params.putInt("act", WORLD_BOSS_SUBMIT_DAMAGE);
            damage != undefined && params.putInt("dame", damage);
            _registerCallback(key.MU_EXTENSION.WORLD_BOSS + "_" + WORLD_BOSS_SUBMIT_DAMAGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.WORLD_BOSS, params);
        };

        protocol.guildCreate = function (callback) {
            var guildObj = mc.GameData.guiState.getGuildCreateState();
            if (!guildObj) {
                callback && callback(false);
                return;
            }
            var name = guildObj.guildName;
            var desc = guildObj.guildDesc;
            var flag = guildObj.flag["base"] || 0;
            var icon = guildObj.flag["icon"] || 0;

            var guildReqs = new QAntArrayObject();
            var reqLvl = new QAntObject();
            reqLvl.putUtfString("reqType", "level");
            reqLvl.putUtfString("reqValue", guildObj.minLevel + "");
            guildReqs.addQAntObject(reqLvl);
            var reqRank = new QAntObject();
            reqRank.putUtfString("reqType", "rank");
            reqRank.putUtfString("reqValue", guildObj.minRank);
            guildReqs.addQAntObject(reqRank);

            var params = new QAntObject();
            params.putInt("act", GUILD_CREATE);
            params.putUtfString("name", name);
            params.putUtfString("notice", desc);
            params.putInt("flag", flag);
            params.putInt("logo", icon);
            params.putQAntArray("guildReqs", guildReqs);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_CREATE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_LIST_GUILD);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_LIST_GUILD, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };

        protocol.checkGuildStatus = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_STATUS);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_STATUS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.leaveGuild = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_LEAVE);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_LEAVE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.listGuildMember = function (callback, guildID, page) {
            var params = new QAntObject();
            params.putInt("act", GUILD_LIST_MEMBER);
            if (page) params.putInt("page", page);
            params.putLong("guildId", guildID);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_LIST_MEMBER, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.requestJoinGuild = function (callback, guildID) {
            var params = new QAntObject();
            params.putInt("act", GUILD_JOIN);
            params.putLong("guildId", guildID);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_JOIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.inviteJoinGuild = function (callback, gameHeroId) {
            var params = new QAntObject();
            params.putInt("act", GUILD_INVITE);
            params.putUtfString("gameHeroId", gameHeroId);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_INVITE, callback);
        };

        protocol.getGuildDontionInfo = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_DONATE_INFO);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_DONATE_INFO, callback);
        };


        protocol.getRequestedJoinGuildList = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_REQUESTED_LIST);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_REQUESTED_LIST, callback);
        };

        protocol.listJoinRequest = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_LIST_JOIN_REQUEST);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_LIST_JOIN_REQUEST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.acceptRequest = function (callback, id) {
            var params = new QAntObject();
            params.putInt("act", GUILD_ACCEPT_JOIN);
            params.putUtfString("requestId", id);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_ACCEPT_JOIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.declineRequest = function (callback, id) {
            var params = new QAntObject();
            params.putInt("act", GUILD_DECLINE_JOIN);
            params.putUtfString("requestId", id);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_DECLINE_JOIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildKick = function (callback, memberId) {
            var params = new QAntObject();
            params.putInt("act", GUILD_KICK);
            params.putUtfString("memberId", memberId);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_KICK, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildPromote = function (callback, memberId, isPromote) {
            var params = new QAntObject();
            params.putInt("act", GUILD_PROMOTE);
            params.putUtfString("memberId", memberId);
            params.putBool("isPromote", isPromote);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_PROMOTE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildSendLeader = function (callback, memberId) {
            var params = new QAntObject();
            params.putInt("act", GUILD_SEND_LEADER);
            params.putUtfString("memberId", memberId);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_SEND_LEADER, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildUpgrade = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_UPGRADE);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_UPGRADE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildCheckin = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_CHECKIN);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_CHECKIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildCheckinRewards = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_GET_CHECKIN_REWARDS);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_GET_CHECKIN_REWARDS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };

        protocol.guildDonate = function (callback, id) {
            var params = new QAntObject();
            params.putInt("act", GUILD_DONATE);
            params.putInt("itemIndex", id);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_DONATE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };
        protocol.guildGetLogs = function (callback, id) {
            var params = new QAntObject();
            params.putInt("act", GUILD_LOGS);
            params.putLong("guildId", id);
            _registerCallback(key.MU_EXTENSION.GUILD + "_" + GUILD_LOGS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD, params);
        };

        protocol.getGuildBossInfo = function (callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_INFO);
            callback && _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_INFO, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };

        protocol.getGuildBossChestInfo = function (percent, bossType, stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_CHEST_INFO);
            params.putInt("percent", percent);
            //params.putInt("stageIndex", stageIndex);
            params.putUtfString("bossType", bossType);
            params.putInt("stageId", stageIndex);
            callback && _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_CHEST_INFO, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };

        protocol.getGuildBossRewardFromCard = function (percent, boxIndex, bossType, stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_REWARD_FROM_CARD);
            params.putInt("percent", percent);
            params.putUtfString("bossType", bossType);
            params.putInt("boxIndex", boxIndex);
            params.putInt("stageId", stageIndex);
            callback && _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_REWARD_FROM_CARD, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };

        protocol.fightGuildBoss = function (bossType, stageId, callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_BATTLE);
            params.putUtfString("bossType", bossType);
            params.putInt("stageId", stageId);
            _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_BATTLE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };

        protocol.setupGuildBossTeam = function (index, arrHeroId, leaderIndex, bossType, stageIndex, callback) {
            leaderIndex = leaderIndex || 0;
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_SUBMIT_TEAM);
            params.putUtfString("bossType", bossType);
            params.putInt("stageId", stageIndex);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", arrHeroId);
            _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_SUBMIT_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };

        protocol.submitGuildBossDMG = function (damage, arrCreatureStatus, bossType, stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_DAMGE_SUBMIT);
            params.putUtfString("bossType", bossType);
            params.putInt("stageId", stageIndex);
            var itemArr = new QAntArrayObject();
            var usedItemMapById = guildBossInBattle.getQuantityUsedItemMap();
            for (var itemId in usedItemMapById) {
                var quantity = usedItemMapById[itemId];
                if (quantity > 0) {
                    var itemSend = new QAntObject();
                    itemSend.putLong("id", parseInt(itemId));
                    itemSend.putInt("no", parseInt(quantity));
                    itemArr.addQAntObject(itemSend);
                }
            }
            params.putQAntArray("use_items", itemArr);

            if (arrCreatureStatus) {
                var properties = new QAntArrayObject();
                for (var h = 0; h < arrCreatureStatus.length; h++) {
                    var property = new QAntObject();
                    property.putLong("heroId", arrCreatureStatus[h].id);
                    property.putLong("hpPercent", Math.floor(arrCreatureStatus[h].hpPercent));
                    properties.addQAntObject(property);
                }
                params.putQAntArray("properties", properties);
            }
            var testDam = 80000000;
            //damage = testDam;
            params.putInt("dame", damage);

            _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_DAMGE_SUBMIT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };

        protocol.getOldStageGuildBossInfo = function (bossType, stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_INFO_OLD_STAGE);
            //params.putInt("stageIndex", stageIndex);
            params.putUtfString("bossType", bossType);
            params.putInt("stageId", stageIndex);
            callback && _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_INFO_OLD_STAGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };

        protocol.getDamgeHistoryGuildBossInfo = function (bossType, stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", GUILD_BOSS_DAMGE_INFO);
            //params.putInt("stageIndex", stageIndex);
            params.putUtfString("bossType", bossType);
            params.putInt("stageId", stageIndex);
            callback && _registerCallback(key.MU_EXTENSION.GUILD_BOSS + "_" + GUILD_BOSS_DAMGE_INFO, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.GUILD_BOSS, params);
        };


        protocol.checkStageBoss = function (stageId, callback) {
            var params = new QAntObject();
            params.putInt("act", STAGE_BOSS_CHECK_BOSS);
            params.putInt("stage_index", stageId);
            callback && _registerCallback(key.MU_EXTENSION.STAGE_BOSS + "_" + STAGE_BOSS_CHECK_BOSS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.STAGE_BOSS, params);
        };

        protocol.checkStageBossWorldMap = function (stageId, callback) {
            var params = new QAntObject();
            params.putInt("act", STAGE_BOSS_WORLD_MAP);
            callback && _registerCallback(key.MU_EXTENSION.STAGE_BOSS + "_" + STAGE_BOSS_WORLD_MAP, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.STAGE_BOSS, params);
        };

        protocol.joinStageBoss = function (stageId, callback) {
            var params = new QAntObject();
            params.putInt("act", STAGE_BOSS_JOIN_BOSS);
            params.putInt("stage_index", stageId);
            callback && _registerCallback(key.MU_EXTENSION.STAGE_BOSS + "_" + STAGE_BOSS_JOIN_BOSS, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.STAGE_BOSS, params);
        };

        protocol.submitDamageStageBoss = function (damage, stageId, callback) {
            var params = new QAntObject();
            params.putInt("act", STAGE_BOSS_SUBMIT_DAM);
            params.putInt("dame", damage);
            params.putInt("stage_index", stageId);
            callback && _registerCallback(key.MU_EXTENSION.STAGE_BOSS + "_" + STAGE_BOSS_SUBMIT_DAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.STAGE_BOSS, params);
        };


        protocol.finishStageBoss = function (damage, stageId, callback) {
            var params = new QAntObject();
            params.putInt("act", STAGE_BOSS_FINISH);
            var itemArr = new QAntArrayObject();
            var usedItemMapById = stageBossInBattle.getQuantityUsedItemMap();
            for (var itemId in usedItemMapById) {
                var quantity = usedItemMapById[itemId];
                if (quantity > 0) {
                    var itemSend = new QAntObject();
                    itemSend.putLong("id", parseInt(itemId));
                    itemSend.putInt("no", parseInt(quantity));
                    itemArr.addQAntObject(itemSend);
                }
            }
            params.putQAntArray("use_items", itemArr);
            var t = 900000;
            t = damage;
            params.putInt("dame", t);
            params.putInt("stage_index", stageId);
            callback && _registerCallback(key.MU_EXTENSION.STAGE_BOSS + "_" + STAGE_BOSS_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.STAGE_BOSS, params);
        };

        protocol.createMatchInRelicArena = function (betIndex, relic, heroArr, time, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_CREATE);
            params.putInt("betIndex", betIndex);
            params.putInt("relic", relic);
            params.putLong("time", time);
            params.putLongArray("heroes", heroArr);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_CREATE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.getRelicArenaInfo = function (callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_INFO);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_INFO, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };


        protocol.getRelicArenaHistoryList = function (page, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_HISTORY);
            params.putInt("page", page);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_HISTORY, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.findMatchInRelicArena = function (callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_SEARCH);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_SEARCH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.removeMatchInRelicArena = function (battleId, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_REMOVE);
            params.putLong("battleId", battleId);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_REMOVE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.joinerRequestMatchInRelicArena = function (battleId, heroesArr, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_JOINER_REQUEST);
            params.putLong("battleId", battleId);
            params.putLongArray("heroes", heroesArr);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_JOINER_REQUEST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.getJoinerRequestListInRelicArena = function (battleId, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_JOINER_REQUEST_LIST);
            params.putLong("battleId", battleId);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_JOINER_REQUEST_LIST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.acceptJoinerRequestInRelicArena = function (requestId, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_ACCEPT_JOINER_REQUEST);
            params.putUtfString("requestId", requestId);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_ACCEPT_JOINER_REQUEST, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.pickHeroesInRelicArena = function (requestId, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_PICK_HEROES);
            params.putUtfString("requestId", requestId);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_PICK_HEROES, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.submitTeamInRelicArena = function (requestId, leaderIndex, heroes, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_SUBMIT_TEAM);
            params.putUtfString("requestId", requestId);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", heroes);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_SUBMIT_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.submitScriptInRelicArena = function (requestId, winnerId, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_SUBMIT_RESULT);
            params.putUtfString("requestId", requestId);
            params.putUtfString("winnerId", winnerId);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_SUBMIT_RESULT, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.getMatchesInRelicArenaByUserId = function (userId, callback) {
            var params = new QAntObject();
            params.putInt("act", BATTLE_RELIC_SEARCH);
            params.putUtfString("userId", userId);
            callback && _registerCallback(key.MU_EXTENSION.BATTLE_RELIC + "_" + BATTLE_RELIC_SEARCH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.BATTLE_RELIC, params);
        };

        protocol.joinIllusionCastle = function (callback) {
            var params = new QAntObject();
            params.putInt("act", ILLUSION_JOIN);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_JOIN, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, params);
        };

        /**
         * @param callback
         * @summary callback return object top infomation => rank["top"] = Array{ battleTeam: Array, leaderIndex: number, maxlevel: number, name: String, totalStar: number }
         */
        protocol.rankIllusionCastle = function (callback) {
            var params = new QAntObject();
            params.putInt("act", ILLUSION_RANKING);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_RANKING, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, params);
        };
        protocol.startBattleIllusionCastle = function (stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", ILLUSION_START_BATTLE);
            params.putInt("index", stageIndex);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_START_BATTLE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, params);
        };
        protocol.finishBattleIllusionCastle = function (stageIndex, numStar, arrCreatureStatus, callback) {
            var paramsObj = new QAntObject();
            paramsObj.putInt("act", ILLUSION_FINISH);
            paramsObj.putInt("star", numStar || 0);
            paramsObj.putInt("index", stageIndex);
            paramsObj.putBool("win", numStar > 0);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_FINISH, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, paramsObj);
        };
        protocol.claimRewardIllusionCastle = function (stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", ILLUSION_CLAIM);
            params.putInt("index", stageIndex);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_CLAIM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, params);
        };
        protocol.restartIllusionCastle = function (callback) {
            var params = new QAntObject();
            params.putInt("act", ILLUSION_RESTART);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_RESTART, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, params);
        };
        protocol.viewIllusionCastleStage = function (stageIndex, callback) {
            var params = new QAntObject();
            params.putInt("act", ILLUSION_VIEW_STAGE);
            params.putInt("index", stageIndex);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_VIEW_STAGE, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, params);
        };
        protocol.setupIllusionCastleTeam = function (index, arrHeroId, leaderIndex, callback) {
            leaderIndex = leaderIndex || 0;
            var params = new QAntObject();
            params.putInt("act", ILLUSION_SETUP_TEAM);
            params.putInt("leaderIndex", leaderIndex);
            params.putLongArray("heroes", arrHeroId);
            _registerCallback(key.MU_EXTENSION.ILLUSION + "_" + ILLUSION_SETUP_TEAM, callback);
            QANT2X.sendExtensionMessage(key.MU_EXTENSION.ILLUSION, params);
        };

        //RECEIVER
        MessageManager.addReceiveCallback(QANT2X.SystemRequest.PingPong, function (response) {
            var json = response.toJson();
            var time = json["svTime"];
            mc.GameData.svTime = time;
        });
        MessageManager.addReceiveCallback(QANT2X.SystemRequest.Login, function (response) {
            var json = response.toJson();
            if (json["uid"]) {
                cc.log("---- Login success");
                playerInfo.setCreantsSAcc({
                    creantId: response.getValue("uid"),
                    creantName: response.getValue("p").getValue("fn"),
                    creantAvatarURL: response.getValue("p").getValue("avt"),
                    creantToken: response.getValue("p").getValue("tk")
                });
            } else {
                exception.setExceptionData(json);
                exception.notifyDataChanged();
            }
            _performCallback(QANT2X.SystemRequest.Login, json);
        });
        MessageManager.addReceiveCallback(QANT2X.SystemRequest.Logout, function (response) {
            var json = response.toJson();
            mc.dictionary.cleanData();
            playerInfo.setLogOut();
            MessageManager.closeSocket();
            mc.GameData.cleanStaticData();
            _performCallback(QANT2X.SystemRequest.Logout, json);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.JOIN_GAME, function (response) {
            cc.log("Handle join game!");
            var json = response.toJson();
            var game_hero = json["game_hero"];
            var mapTeamByIndex = bb.utility.arrayToMap(json["teams"], function (team) {
                return team["index"];
            });
            var arrQuestGroup = json["quests"];
            var gifts = json["gifts"];
            var cur_chapter = json["cur_chapter"];
            var settingData = json["setting"];
            var events_running = json["events_running"];
            var rehilSeconds = json["rehilSeconds"];
            var arenaTicketTime = game_hero["arenaTicketUpdateTime"];
            var staminaTime = game_hero["staminaUpdateTime"];
            var spinTicketTime = game_hero["spinTicketUpdateTime"];

            playerInfo.setArenaTicketTime(arenaTicketTime);
            playerInfo.setStaminaTime(staminaTime);
            playerInfo.setSpinTicketTime(spinTicketTime);
            playerInfo.setRehilSeconds(rehilSeconds);

            bb.CALCULATE_DELTA_TIME(json["login_time"]);
            mc.GameData.svLoginTime = json["login_time"];
            mc.GameData.svTime = json["login_time"];

            dynamicDailyEvent.addDailyEvent(events_running);

            playerInfo.setMUAcc(game_hero);
            teamFormationManager.setupCampaignTeamFormation(mapTeamByIndex[0]);
            teamFormationManager.setupAttackArenaTeamFormation(mapTeamByIndex[1]);
            teamFormationManager.setupDefenseArenaTeamFormation(mapTeamByIndex[2]);
            playerInfo.setChapter(cur_chapter);

            assetChanger.setData(game_hero["assetMap"]);
            accountChanger.setData({
                exp: playerInfo.getExp(),
                level: playerInfo.getLevel(),
                unlockCode: ""
            });
            lvlUpEvent.setData({
                maxStamina: playerInfo.getMaxStamina()
            });
            questManager.updateArrQuestGroup(arrQuestGroup);
            json["arena"] && arenaManager.setNotifyCount(json["arena"]["countNoti"]);
            json["mails"] && mailManager.setNotifyCount(json["mails"]["no"]);
            stageChanger.setDataChange(cur_chapter, true);
            giftEventManager.setGiftData(gifts);

            var isGetAllHero = false;
            var isGetAllItem = false;
            var isJoinArena = false;
            var isGetFreeSummonInfo = false;
            var isGetMine = false;
            var isGetChallenge = false;
            var isGetRefreshFunc = false;
            var isGetInAppBuyTimes = false;
            var _joinGame = function () {
                if (isGetAllHero && isGetAllItem && isJoinArena && isGetFreeSummonInfo &&
                    isGetMine && isGetChallenge && isGetRefreshFunc && isGetInAppBuyTimes) {
                    protocol.setDevice(CreantsCocosAPI._strDeviceId || mc.const.TEST_DEVICE, mc.const.TEST_DEVICE ? cc.sys.OS_ANDROID : cc.sys.os);
                    playerInfo.initProgress();
                    itemStock.initMapConsumableIdBySlotId();
                    teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_CAMPAIGN);
                    notifySystem.buildAllNotificationAboutItem();
                    notifySystem.buildHeroInvolveNotification();
                    notifySystem.buildQuestGroupNotification();
                    // setting.setSettingData(settingData);
                    connectionState.setState(mc.ConnectionState.SOCKET_STATE_LOGON);
                    playerInfo.notifyDataChanged();
                    heroStock.notifyDataChanged();
                    itemStock.notifyDataChanged();
                    notifySystem.notifyDataChanged();
                    itemStock.setPauseItemChangeListener(false);
                }
            };
            var _updateHeroListByPageId = function (pageInfo) {
                var curr_page = pageInfo["page"];
                var max_page = pageInfo["max_page"];
                var heroes = pageInfo["heroes"];
                heroStock.updateArrayHero(heroes);
                if (curr_page + 1 <= max_page) {
                    mc.protocol.getHeroListByPageId(curr_page + 1, _updateHeroListByPageId);
                } else {
                    isGetAllHero = true;
                    mc.protocol.getItemListByPageId(undefined, _updateItemListByPageId);
                }
            };
            var _updateItemListByPageId = function (pageInfo) {
                var curr_page = pageInfo["page"];
                var max_page = pageInfo["max_page"];
                var items = pageInfo["items"];
                itemStock.updateArrayItem(items, null, true);
                if (curr_page + 1 <= max_page) {
                    mc.protocol.getItemListByPageId(curr_page + 1, _updateItemListByPageId);
                } else {
                    isGetAllItem = true;
                    _joinGame();
                }
            };

            itemStock.setPauseItemChangeListener(true);
            mc.protocol.getHeroListByPageId(undefined, _updateHeroListByPageId);
            mc.protocol.joinArena(function () {
                isJoinArena = true;
                accountChanger.setData({
                    league: playerInfo.getLeague()
                });
                _joinGame();
            });
            mc.protocol.getAllSummonPackage(function () {
                isGetFreeSummonInfo = true;
                _joinGame();
            });
            mc.protocol.getMineInfo(function () {
                isGetMine = true;
                _joinGame();
            });
            mc.protocol.getListChallengeGroup(function () {
                isGetChallenge = true;
                _joinGame();
            });
            mc.protocol.getGameFunctionList(function () {
                isGetRefreshFunc = true;
                _joinGame();
            });
            mc.protocol.getBuyTimesPayment(function () {
                isGetInAppBuyTimes = true;
                _joinGame();
            });
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.STAGE_BOSS, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            if (act === STAGE_BOSS_JOIN_BOSS) {
                stageBossSystem.setBossInfo(result["bossInfo"]);
                stageBossSystem.setKillBossInfo(result["killBossInfo"]);

                teamFormationManager.setupCampaignTeamFormation(result["killBossInfo"]);
                if (result["opponent"] && result["opponent"]["hp"]) {
                    stageBossSystem.setNewBossHp(result["opponent"]["hp"]);
                }
                stageBossInBattle.setBattleData(result);
                stageBossInBattle.notifyDataChanged();
            } else if (act === STAGE_BOSS_SUBMIT_DAM) {
                mc.GameData.stageBossSystem.setNewBossHp(result["hp"]);
                (result["gameHeroName"] != mc.GameData.playerInfo.getName()) && mc.GameData.stageBossSystem.setNewOtherPlayerDamage(result["dame"]);
                stageBossSystem.notifyDataChangedWithParameter(result);
            } else if (act === STAGE_BOSS_FINISH) {
                var update = result["update"];
                if (update) {
                    var updateItems = update["items"];
                    if (updateItems) {
                        itemStock.updateArrayItem(updateItems);
                        itemStock.notifyDataChanged();
                    }
                }
                result["reward"] && resultInBattle.setRewardInfo(result["reward"]);
                resultInBattle.setResult(json);
                resultInBattle.notifyDataChanged();
            } else if (act === STAGE_BOSS_DEAD) {
                stageBossSystem.notifyDataChangedWithParameter(result);
            } else if (act === STAGE_BOSS_WORLD_MAP) {
                mc.GameData.stageBossSystem.isBossAppear = {
                    appear: result["boss_appear"],
                    endTime: result["boss_appear_time"] || 0
                };
                stageBossSystem.notifyDataChanged();
            }
            var callbackName = key.MU_EXTENSION.STAGE_BOSS + "_" + act;
            _performCallback(callbackName, result);

        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.ILLUSION, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            if (act === ILLUSION_JOIN) {
                illusionManager.setIllusionData(json);
                illusionManager.notifyDataChanged();
            } else if (act === ILLUSION_SETUP_TEAM) {
                teamFormationManager.setupIllusionTeamFormation(result);
                teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_ILLUSION);
            } else if (act === ILLUSION_START_BATTLE) {
                illusiionInBattle.setBattleData(json);
                illusiionInBattle.notifyDataChanged();
            } else if (act === ILLUSION_FINISH) {
                var update = json["update"];
                if (update) {
                    var updateItems = update["items"];
                    itemStock.updateArrayItem(updateItems);
                }
                teamFormationManager.setupIllusionTeamFormation(result);
                teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_ILLUSION);
                illusionManager.updateAllStatusCreature(json["properties"]);
                illusionManager.setIllusionData(json);
                result["reward"] && resultInBattle.setRewardInfo(result["reward"]);
                resultInBattle.setResult(json);
                if (resultInBattle.isWin()) {
                    illusionManager.unlockNextStage(json["index"], json["next_stage"]);
                    if (json["next_stage"])
                        mc.GameData.guiState.setCurrentIllusionStageIndex(json["next_stage"]);
                    else
                        mc.GameData.guiState.setCurrentIllusionStageIndex(null);
                }
                resultInBattle.notifyDataChanged();
                illusionManager.notifyDataChanged();
            } else if (act === ILLUSION_CLAIM) {
            } else if (act === ILLUSION_VIEW_STAGE) {
                result = json["stage"];
                var indexStage = json["index"];
                illusionManager.setOpponentFormationByStageIndex(result, indexStage);
                result["properties"] && illusionManager.updateAllStatusCreature(result["properties"]);
                illusionManager.notifyDataChanged();
            }
            var callbackName = key.MU_EXTENSION.ILLUSION + "_" + act;
            _performCallback(callbackName, result);

        });

        MessageManager.addReceiveCallback(key.MU_EXTENSION.GUILD_BOSS, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            if (act === GUILD_BOSS_INFO) {
                guildBossSystem.setGuildBossInfo(result["guildBossStage"]);
                guildBossSystem.setKillBossInfo(result["killBossInfo"]);
                teamFormationManager.setupGuildBossTeamFormation(result["killBossInfo"]);

                if (result["guildBossArena"]) {
                    guildBossSystem.setGuildBossArenaInfo(result["guildBossArena"]);
                    guildBossSystem.setKillBossArenaInfo(result["killBossArenaInfo"]);
                    teamFormationManager.setupGuildArenaBossTeamFormation(result["killBossArenaInfo"]);
                } else {
                    guildBossSystem.cleanGuildBossArenaInfo();
                }


                //mc.GameData.guildManager.setGuildBossInfo(result);
            } else if (act === GUILD_BOSS_BATTLE) {
                if (result["opponent"] && result["opponent"]["hp"]) {
                    guildBossSystem.setNewBossHp(result["opponent"]["hp"]);
                    guildBossSystem.notifyDataChanged();
                }
                guildBossInBattle.setBattleData(result);
            } else if (act === GUILD_BOSS_DAMGE_SUBMIT) {
                if (mc.GameData.guiState.getCurrGuildBossShow().bossType === "arena") {
                    mc.GameData.guildBossSystem.setNewBossHp(result["hp"]);
                } else {
                    mc.GameData.guildBossSystem.setNewBossHp(result["hp"]);
                }
                (result["gameHeroName"] != mc.GameData.playerInfo.getName()) && mc.GameData.guildBossSystem.setNewOtherPlayerDamage(result["dame"]);
                guildBossSystem.notifyDataChangedWithParameter(result);

                var update = result["update"];
                if (update) {
                    var updateItems = update["items"];
                    if (updateItems) {
                        itemStock.updateArrayItem(updateItems);
                        itemStock.notifyDataChanged();
                    }
                }
                guildBossSystem.updateAllStatusCreature(result["properties"]);
                result["reward"] && resultInBattle.setRewardInfo(result["reward"]);
                resultInBattle.setResult(json);
                resultInBattle.notifyDataChanged();
                guildBossSystem.notifyDataChanged();
            } else if (act === GUILD_BOSS_SUBMIT_TEAM) {
                if (mc.GameData.guiState.getCurrentEditFormationTeamId() === mc.TeamFormationManager.TEAM_GUILD_BOSS_ARENA) {
                    teamFormationManager.setupGuildArenaBossTeamFormation(result["killBossInfo"]);
                } else {
                    teamFormationManager.setupGuildBossTeamFormation(result["killBossInfo"]);
                }

            } else if (act === GUILD_BOSS_CHEST_INFO) {
                var rs = result;
            } else if (act === GUILD_BOSS_REWARD_FROM_CARD) {
                var update = json["update"];
                if (update) {
                    var updateItems = update["items"];
                    itemStock.updateArrayItem(updateItems);
                }
                var reward = json["reward"];
                if (reward) {
                    var items = reward["items"];
                    itemStock.pushArrayNewComingItem(items);
                }
                itemStock.notifyDataChanged();
            } else if (act === GUILD_BOSS_INFO_OLD_STAGE) {
                var rs = result;
            } else if (act === GUILD_BOSS_DAMGE_INFO) {
                var rs = result;
            }
            var callbackName = key.MU_EXTENSION.GUILD_BOSS + "_" + act;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.PLAYER, function (response) {
            var json = response.toJson();
            var result = json;
            var act = json["act"];
            var code = json["code"];
            if (act === PLAYER_UPDATE_INFO) {
                if (code === 1) {
                    var name = json["name"];
                    var avatarIndex = json["avatarIndex"];
                    (name != undefined) && playerInfo.setName(name);
                    (avatarIndex != undefined) && playerInfo.setAvatar(avatarIndex);
                    if (json.update) {
                        var updateItems = json.update["items"];
                        if (updateItems) {
                            itemStock.updateArrayItem(updateItems);
                            itemStock.notifyDataChanged();
                        }
                    }
                    playerInfo.notifyDataChanged();
                }
            } else if (act === PLAYER_LINK_ACCOUNT) {
                mc.log("PLAYER_LINK_ACCOUNT");
                if (result["code"] === 1) {
                    CreantsCocosAPI.linkFacebook(result["token"], playerInfo.getId());
                }
            } else if (act === PLAYER_TRANSFER_RELIC) {
                result = true;
            }
            mc.log(act + "," + code);
            var callbackName = key.MU_EXTENSION.PLAYER + "_" + act;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.JOIN_STAGE, function (response) {
            var json = response.toJson();
            var result = json;
            stageInBattle.setBattleData(json);
            stageInBattle.notifyDataChanged();
            playerInfo.setCurrentPartInBattle(stageInBattle);
            var callbackName = key.MU_EXTENSION.JOIN_STAGE;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.CHAOS_CASTLE, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            if (act === CHAOS_CASTLE_JOIN) {
                chaoCastleManager.setChaosCastleData(json);
                chaoCastleManager.notifyDataChanged();
            } else if (act === CHAOS_CASTLE_SETUP_TEAM) {
                teamFormationManager.setupChaosCastleTeamFormation(result["chaos_info"]);
                teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_CHAOSCASTLE);
            } else if (act === CHAOS_CASTLE_START_BATTLE) {
                chaosCastleInBattle.setBattleData(json);
                chaosCastleInBattle.notifyDataChanged();
            } else if (act === CHAOS_CASTLE_FINISH) {
                teamFormationManager.setupChaosCastleTeamFormation(result);
                teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_CHAOSCASTLE);
                chaoCastleManager.updateAllStatusCreature(json["properties"]);
                result["reward"] && resultInBattle.setRewardInfo(result["reward"]);
                resultInBattle.setResult(json);
                if (resultInBattle.isWin()) {
                    chaoCastleManager.unlockNextStage(json["index"]);
                }
                resultInBattle.notifyDataChanged();
                chaoCastleManager.notifyDataChanged();
            } else if (act === CHAOS_CASTLE_CLAIM) {
                var update = json["update"];
                if (update) {
                    var updateItems = update["items"];
                    itemStock.updateArrayItem(updateItems);
                }
                var reward = json["reward"];
                if (reward) {
                    var items = reward["items"];
                    itemStock.pushArrayNewComingItem(items);
                }
                chaoCastleManager.claimRewardChaosStage(json["index"]);
                itemStock.notifyDataChanged();
            } else if (act === CHAOS_CASTLE_VIEW_STAGE) {
                result = json["stage"];
                var indexStage = json["index"];
                chaoCastleManager.setOpponentFormationByStageIndex(result, indexStage);
                result["properties"] && chaoCastleManager.updateAllStatusCreature(result["properties"]);
                chaoCastleManager.notifyDataChanged();
            } else if (act === CHAOS_CASTLE_RESTART) {
                var reward = json["reward"];
                var update = json["update"];
                var notify = false;
                if (reward) {
                    notify = true;
                    itemStock.pushArrayNewComingItem(reward["items"]);
                }
                if (update) {
                    notify = true;
                    itemStock.updateArrayItem(update["items"]);
                }
                notify && itemStock.notifyDataChanged();
                chaoCastleManager.setChaosCastleData(json);
                chaoCastleManager.notifyDataChanged();
            }
            var callbackName = key.MU_EXTENSION.CHAOS_CASTLE + "_" + act;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.FINISH_STAGE, function (response) {
            var json = response.toJson();
            var reward = json["reward"];
            var update = json["update"];

            if (reward) {
                var incr_exp = reward["incr_exp"];
                var mapHeroGainExp = {};
                bb.utility.arrayTraverse(incr_exp, function (exp) {
                    var heroId = exp.heroId;
                    var deltaExp = exp.exp;
                    var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
                    if (heroInfo) {
                        var changer = heroInfoChangerCollection.getChanger(heroId);
                        changer.setAttachData(deltaExp).setDataChange({
                            level: heroInfo.level,
                            exp: heroInfo.exp
                        });
                    }
                    mapHeroGainExp[heroId] = heroId;
                });

                resultInBattle.setIncr_Exp(incr_exp);
                resultInBattle.setMapHeroGainExp(mapHeroGainExp);
                resultInBattle.setRewardInfo(reward);
            }

            if (update) {
                var gameHero = update["gameHero"];
                var heroes = update["heroes"];
                var updateItems = update["items"];
                var stage = update["stage"];

                heroes && heroStock.updateArrayHero(heroes);
                updateItems && itemStock.updateArrayItem(updateItems);

                var changeObj = {};
                if (gameHero) {
                    var expEarning = gameHero["exp"] - playerInfo.getExp();
                    changeObj = gameHero;
                    playerInfo.copyAttr(gameHero);
                    playerInfo.setLastEarningStageExp(expEarning);
                }
                if (stage) {
                    var oldStage = campaignManager.getStageInfoByStageIndex(mc.CampaignManger.getStageIndex(stage));
                    campaignManager.updateStage(stage);
                    var arrUnlockStage = mc.CampaignManger.getArrayUnlockStageByStageIndex(mc.CampaignManger.getStageIndex(stage));
                    var oldChapterIndex = playerInfo.getCurrentChapterIndex();
                    var oldStageIndex = playerInfo.getCurrentStageIndex();
                    var dataChange = {};
                    for (var i = 0; i < arrUnlockStage.length; i++) {
                        var unlockStageIndex = parseInt(arrUnlockStage[i]);
                        var stageInfo = campaignManager.getStageInfoByStageIndex(unlockStageIndex);
                        // create local new stage.
                        if (!stageInfo || !mc.CampaignManger.isClearStage(stageInfo)) {
                            var unlockStage = mc.CampaignManger.createUnlockStage(unlockStageIndex);
                            if (unlockStage.mode === stage.mode && unlockStageIndex > oldStageIndex) {
                                dataChange.stage_index = unlockStageIndex;
                            }
                            var chapterIndex = campaignManager.updateStage(unlockStage);
                            if (chapterIndex > oldChapterIndex) {
                                dataChange.chapter_index = chapterIndex;
                                mc.GameData.guiState.setSelectChapterIndex(null); // auto select the new chapter.
                                mc.GameData.guiState.getStackLayerIdForMainScreen().pop(); // show the world map layer.
                            }
                        }
                    }
                    var unlockCode = mc.CampaignManger.getUnlockCodeByStageIndex(mc.CampaignManger.getStageIndex(stage));
                    if (unlockCode && !mc.CampaignManger.isClearStage(oldStage)) {
                        changeObj["unlockCode"] = unlockCode;
                    }
                    if (dataChange) {
                        playerInfo.setChapter(dataChange);
                        stageChanger.setDataChange(dataChange);
                    }
                    changeObj && accountChanger.setDataChange(changeObj);
                    campaignManager.notifyDataChanged();
                }

                heroes && heroStock.notifyDataChanged();
                updateItems && itemStock.notifyDataChanged();
                gameHero && playerInfo.notifyDataChanged();
            }
            resultInBattle.setResult(json);
            resultInBattle.notifyDataChanged();
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.JOIN_CHAPTER, function (response) {
            var json = response.toJson();
            campaignManager.setArrayStageByChapterIndex(json["cid"], json["stages"]);
            campaignManager.notifyDataChanged();
            var callbackName = key.MU_EXTENSION.JOIN_CHAPTER;
            _performCallback(callbackName);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.ASSET_CHANGE, function (response) {
            var json = response.toJson();
            playerInfo.setAssetMap(json);
            assetChanger.setDataChange(json);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.UPDATE_CAMPAIGN_TEAM, function (response) {
            var json = response.toJson();
            var team = json["team"];
            if (team) {
                teamFormationManager.setupCampaignTeamFormation(team);
                mineSystem.updateMiningHeroes()
            }
            var callbackName = key.MU_EXTENSION.UPDATE_CAMPAIGN_TEAM;
            _performCallback(callbackName);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.SUMMON, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var rs = json;
            var callbackName = key.MU_EXTENSION.SUMMON + "_" + act;
            if (act === GET_SUMMON_PACKAGE_LIST) {
                rs = json["summonInfo"];
                summonManager.setSummonInfo(rs);
                _performCallback(callbackName, rs);
                if (rs) {
                    mc.SummonManager.syncSummonCountDown(rs["countdownArr"] || []);
                }
            } else if (act === SUMMON_PACKAGE) {
                var autoCallNotifySystem = false;
                var heroes = rs = json["heroes"];
                if (heroes) {
                    summonManager.setSummonInfo(json["summonInfo"]);
                    summonManager.setSummonHeroes(heroes);
                    heroStock.updateArrayHero(heroes);
                }
                if (json["update"] && json["update"]["items"]) {
                    summonManager.setSummonItems(json["reward"]["items"]);
                    rs = json["update"];
                    itemStock.updateArrayItem(rs["items"]);
                    itemStock.notifyDataChanged();
                    autoCallNotifySystem = true;
                }

                heroStock.notifyDataChanged();
                summonManager.notifyDataChanged();

                if (!autoCallNotifySystem) {
                    notifySystem.buildHeroEquipmentNotification();
                    notifySystem.buildHeroInvolveNotification();
                    notifySystem.buildSummonNotificationByGroup();
                    notifySystem.notifyDataChanged();
                }
                _performCallback(callbackName, rs);
                var jsonElement = json["summonInfo"];
                if (jsonElement) {
                    mc.SummonManager.syncSummonCountDown(jsonElement["countdownArr"] || []);
                }
            }
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.ACTION_WITH_ITEM, function (response) {
            var json = response.toJson();
            var rs = null;
            var act = json["act"];
            if (act === ITEM_LIST_CHUNK) {
                var callbackName = key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + act;
                _performCallback(callbackName, json);
            } else {
                if (act === ITEM_ACTION_TAKE_ON) {
                    var heroId = json["heroId"];
                    var itemId = json["itemId"];
                    var slotIndex = json["slotIndex"];
                    rs = {};
                    rs.slotIndex = slotIndex;
                    rs.itemInfo = itemStock.equipItemIdForHeroId(itemId, slotIndex, heroId);
                } else if (act === ITEM_ACTION_TAKE_OFF) {
                    var heroId = json["heroId"];
                    var itemId = json["itemId"];
                    var slotIndex = json["slotIndex"];
                    rs = {};
                    rs.slotIndex = slotIndex;
                    rs.itemInfo = itemStock.unequipItemId(itemId);
                } else if (act === ITEM_ACTION_CRAFT ||
                    act === ITEM_ACTION_CHANGE_OPTION ||
                    act === ITEM_ACTION_UPGRADE ||
                    act === ITEM_ACTION_EXCHANGE) {
                    if (json["update"]) {
                        itemStock.updateArrayItem(json["update"]["items"]);
                        rs = json["code"] || json["opt_item"] || json["update"]["items"];
                        itemStock.notifyDataChanged();
                    }
                } else if (act === ITEM_ACTION_SELL) {
                    if (json["update"]) {
                        itemStock.updateArrayItem(json["update"]["items"]);
                        rs = json["update"]["items"];
                        itemStock.notifyDataChanged();
                    }
                } else if (act === ITEM_ACTION_BUY_STAMINA) {
                    rs = json["update"];
                } else if (act === ITEM_ACTION_OPEN_CHEST) {
                    if (json["update"]) {
                        rs = json["update"]["items"];
                        itemStock.updateArrayItem(rs);
                    }
                    if (json["reward"]) {
                        itemStock.pushArrayNewComingItem(json["reward"]["items"]);
                        itemStock.notifyDataChangedWithParameter(rs);
                    }
                    if (json["heroes"]) {
                        rs["heroes"] = json["heroes"];
                        var heroes = json["heroes"];
                        summonManager.setSummonHeroes(heroes);
                        heroStock.updateArrayHero(heroes);
                        heroStock.notifyDataChanged();
                    }
                    if (json["vipTimer"]) {
                        rs["vipTimer"] = json["vipTimer"];
                        playerInfo.setVIPTimer(json["vipTimer"]);
                        playerInfo.notifyDataChanged();
                    }
                    if (json["eventGroupList"]) {
                        challengeManager.setChallengeData(json);
                        challengeManager.setChallengeXBonus(json["event_bonus"] || 1);
                        challengeManager.notifyDataChanged();
                    }
                } else if (act === ITEM_ACTION_EXCHANGE_LIST) {
                    if (json["reward"]) {
                        itemStock.pushArrayNewComingItem(json["reward"]["items"]);
                    }
                    if (json["update"]) {
                        rs = json["update"]["items"];
                        itemStock.updateArrayItem(rs);
                        itemStock.notifyDataChangedWithParameter(rs);
                    }
                } else if (act === ITEM_ACTION_INVENTORY) {
                    var isPutIn = json["isPutIn"];
                    if (json["update"]) {
                        rs = json["update"]["items"];
                        for (var i = 0; i < rs.length; i++) {
                            if (isPutIn) {
                                itemStock.putInVault(rs[i]);
                            } else {
                                itemStock.popOutVault(mc.ItemStock.getItemId(rs[i]));
                            }
                        }
                        itemStock.notifyDataChangedWithParameter(rs);
                    }
                } else if (act === ITEM_ACTION_INVENTORY_INFO) {
                    rs = json;
                    itemStock.setupInventory(json["items"]);
                }
                notifySystem.buildHeroEquipmentNotification();
                var callbackName = key.MU_EXTENSION.ACTION_WITH_ITEM + "_" + act;
                _performCallback(callbackName, rs);
                notifySystem.notifyDataChanged();
            }
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.ARENA, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            if (act === ARENA_JOIN) {
                result = json["arena_info"];
                arenaManager.setInfo(result);
                arenaManager.setRankingSeconds(json);
                arenaManager.notifyDataChanged();
            } else if (act === ARENA_FIND) {
                result = json["opponents"];
                arenaManager.setArraySearchOpponent(result);
            } else if (act === ARENA_FIGHT || act === ARENA_BATTLE_REVENGE) {
                arenaInBattle.setBattleData(result);
                arenaInBattle.notifyDataChanged();
            } else if (act === ARENA_GET_OPPONENT_DEFENSE_TEAM) {
                arenaManager.setSelectRevengingOpponent(json["opponent"]);
                arenaManager.notifyDataChanged();
            } else if (act === ARENA_GET_TOP_CLAN) {
                result = json["topList"];
            } else if (act === ARENA_FINISH) {
                result = json;
                resultInBattle.setResult(json);
                result["arena_info"] && arenaManager.setInfo(result["arena_info"]);
                result["reward"] && resultInBattle.setRewardInfo(result["reward"]);
                resultInBattle.notifyDataChanged();
                arenaManager.notifyDataChanged();
                accountChanger.setDataChange({league: playerInfo.getLeague()});
            } else if (act === ARENA_SETUP_TEAM) {
                var team = json["team"];
                if (team) {
                    if (json["is_def"]) {
                        teamFormationManager.setupDefenseArenaTeamFormation(team);
                    } else {
                        teamFormationManager.setupAttackArenaTeamFormation(team);
                    }
                }
            } else if (act === ARENA_GET_TOP) {
                result = json["topList"];
            } else if (act === ARENA_LIST_FRIENDS) {
                result = json["topList"];
            } else if (act === ARENA_GET_BATTLE_RECORD) {
                result = json["historyList"];
            } else if (act === ARENA_BATTLE_REPLAY) {
                var recordBattle = json["battle"];
                if (recordBattle) {
                    var battleData = {
                        opponent: JSON.parse(recordBattle["opponent"]),
                        your_team: JSON.parse(recordBattle["your_team"]),
                        script: JSON.parse(recordBattle["script"]),
                        isAttacker: recordBattle["isAttacker"]
                    };
                    replayArenaInBattle.setBattleData(battleData);
                    replayArenaInBattle.notifyDataChanged();
                }
            }
            var callbackName = key.MU_EXTENSION.ARENA + "_" + act;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.WORLD_BOSS, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            if (act === WORLD_BOSS_JOIN) {
                worldBossSystem.setWorldBossInfo(result["bossInfo"]);
                worldBossSystem.setKillBossInfo(result["killBossInfo"]);
                worldBossSystem.setBossReviveCountDownSeconds(result["countDownSeconds"]);

                teamFormationManager.setupWorldBossTeamFormation(result["killBossInfo"]);
                worldBossSystem.notifyDataChanged();
            } else if (act === WORLD_BOSS_SETUP_TEAM) {
                teamFormationManager.setupWorldBossTeamFormation(result["killBossInfo"]);
            } else if (act === WORLD_BOSS_FIGHT) {
                if (result["opponent"] && result["opponent"]["hp"]) {
                    worldBossSystem.setNewBossHp(result["opponent"]["hp"]);
                    worldBossSystem.notifyDataChanged();
                }
                worldBossInBattle.setBattleData(result);
            } else if (act === WORLD_BOSS_SUBMIT_DAMAGE) {
                mc.GameData.worldBossSystem.setNewBossHp(result["hp"]);
                (result["gameHeroName"] != mc.GameData.playerInfo.getName()) && mc.GameData.worldBossSystem.setNewOtherPlayerDamage(result["dame"]);
                worldBossSystem.notifyDataChangedWithParameter(result);
            } else if (act === WORLD_BOSS_NOTIFY_BOSS_DEAD) {
                worldBossSystem.notifyDataChangedWithParameter(result);
            } else if (act === WORLD_BOSS_FINISH_BATTLE) {
                var update = result["update"];
                if (update) {
                    var updateItems = update["items"];
                    if (updateItems) {
                        itemStock.updateArrayItem(updateItems);
                        itemStock.notifyDataChanged();
                    }
                }
                worldBossSystem.updateAllStatusCreature(result["properties"]);
                result["reward"] && resultInBattle.setRewardInfo(result["reward"]);
                resultInBattle.setResult(json);
                resultInBattle.notifyDataChanged();
                worldBossSystem.notifyDataChanged();
            }
            var callbackName = key.MU_EXTENSION.WORLD_BOSS + "_" + act;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.GIFT_EVENTS, function (response) {
            var json = response.toJson();
            var act = json["act"];
            if (act === GIFT_CLAIM_PACKAGE) {
                var update = json["update"];
                var reward = json["reward"];
                if (update) {
                    itemStock.updateArrayItem(update["items"]);
                }
                if (reward) {
                    itemStock.pushArrayNewComingItem(reward["items"]);
                }
                giftEventManager.setGiftData(json["gifts"]);
                giftEventManager.notifyDataChanged();
                itemStock.notifyDataChanged();
                notifySystem.notifyDataChanged();
            }
            var callbackName = key.MU_EXTENSION.GIFT_EVENTS + "_" + act;
            _performCallback(callbackName, json["cmd_get_events"]);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.GUILD, function (response) {
            var json = response.toJson();
            var act = json["act"];
            if (act === GUILD_CREATE) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
            } else if (act === GUILD_LIST_GUILD) {
                json = json["guildList"];
                json && (mc.GameData.guiState.getGuildCreateState().suggestGuilds = json);
            } else if (act === GUILD_LEAVE) {
                mc.GameData.guildManager.setGuildInfo(null);
                mc.GameData.guildManager.setMyGuildInfo(null);
                mc.GameData.guildManager.resetData();
            } else if (act === GUILD_STATUS) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
            } else if (act === GUILD_LIST_MEMBER) {
                var guildMembers = json["guildMembers"];
                if (guildMembers) {
                    mc.GameData.guildManager.updateMembers(guildMembers, json["guildId"], json["max_page"]);
                }
            } else if (act === GUILD_LIST_JOIN_REQUEST) {
                var requestList = json["requestList"];
                if (requestList) {
                    mc.GameData.guildManager.updateRequests(requestList);
                }

            } else if (act === GUILD_REQUESTED_LIST) {
                var requestList = json["requestList"];
                if (requestList) {
                    mc.GameData.guildManager.updateRequestedJoinGuild(requestList);
                }

            }
            //else if (act === GUILD_JOIN) {
            //
            //
            //}
            //else if (act === GUILD_INVITE) {
            //
            //
            //}
            //else if(act === GUILD_DONATE_INFO)
            //{
            //
            //}
            else if (act === GUILD_CHECKIN) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
                mc.GameData.guildManager.needUpdateMembers();
                mc.GameData.guildManager.notifyDataChanged();

            } else if (act === GUILD_GET_CHECKIN_REWARDS) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
                mc.GameData.guildManager.notifyDataChanged();

                var update = json["update"];
                if (update) {
                    var items = update["items"];
                    if (items) {
                        itemStock.updateArrayItem(items);
                    }
                }
                var reward = json["reward"];
                if (reward) {
                    var rewards = reward["items"];
                    if (rewards) {
                        itemStock.updateArrayItem(rewards);
                        itemStock.pushArrayNewComingItem(rewards);
                    }
                }
                itemStock.notifyDataChanged();

            } else if (act === GUILD_ACCEPT_JOIN) {
                mc.GameData.guildManager.removeRequest();
                mc.GameData.guildManager.receiveAcceptJoin();
                mc.GameData.guildManager.needUpdateMembers();
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                mc.GameData.guildManager.notifyDataChanged();
            } else if (act === GUILD_DECLINE_JOIN) {
                mc.GameData.guildManager.removeRequest();
                mc.GameData.guildManager.notifyDataChanged();
            } else if (act === GUILD_DONATE) {
                var guild = json["guild"];

                var update = json["update"];
                if (update) {
                    var items = update["items"];
                    if (items) {
                        itemStock.updateArrayItem(items);
                    }
                }
                var reward = json["reward"];
                if (reward) {
                    var rewards = reward["items"];
                    if (rewards) {
                        itemStock.updateArrayItem(rewards);
                        itemStock.pushArrayNewComingItem(rewards);
                    }
                }
                itemStock.notifyDataChanged();

                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                mc.GameData.guildManager.incMyDonateTime(json["itemIndex"]);
                mc.GameData.guildManager.notifyDataChanged();
            } else if (act === GUILD_LOGS) {
                var guildLogs = json["logs"];
                if (guildLogs) {
                    mc.GameData.guildManager.updateLogs(guildLogs, json["guildId"], json["max_page"]);
                }
            } else if (act === GUILD_KICK) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
                mc.GameData.guildManager.removeRequest();
                mc.GameData.guildManager.receiveAcceptJoin();
                mc.GameData.guildManager.removeMember(json["memberId"]);
                mc.GameData.guildManager.notifyDataChanged();
            } else if (act === GUILD_PROMOTE) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
                mc.GameData.guildManager.applyPromote(json);
                mc.GameData.guildManager.notifyDataChanged();
            } else if (act === GUILD_SEND_LEADER) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
                mc.GameData.guildManager.applySendLeader(json);
                mc.GameData.guildManager.notifyDataChanged();
            } else if (act === GUILD_UPGRADE) {
                var guild = json["guild"];
                if (guild) {
                    mc.GameData.guildManager.setGuildInfo(guild);
                }
                var myInfo = json["guildMember"];
                if (myInfo) {
                    mc.GameData.guildManager.setMyGuildInfo(myInfo);
                }
                mc.GameData.guildManager.notifyDataChanged();
            }
            var callbackName = key.MU_EXTENSION.GUILD + "_" + act;
            _performCallback(callbackName, json);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.EXCEPTION, function (response) {
            var json = response.toJson();
            var callbackName = json["cmd"];
            if (json["act"]) {
                callbackName = callbackName + "_" + json["act"];
            }
            var errorCode = json["ec"];
            exception.setExceptionData(json);
            exception.notifyDataChanged();

            var parseNotEnoughTicket = function (name) {
                switch (name) {
                    case key.MU_EXTENSION.CHAOS_CASTLE:
                        return mc.const.ITEM_INDEX_CHAOS_TICKET;
                    case key.MU_EXTENSION.ARENA:
                        return mc.const.ITEM_INDEX_ARENA_TICKET;
                    default:
                        return null;
                }
            };

            var isResolve = _performCallback(callbackName, null, json);
            if (!isResolve) {
                var mapCurrencyIndexByMsgException = {};
                mapCurrencyIndexByMsgException[EXCEPTION_NOT_ENOUGH_BLESS] = mc.const.ITEM_INDEX_BLESS;
                mapCurrencyIndexByMsgException[EXCEPTION_NOT_ENOUGH_ZEN] = mc.const.ITEM_INDEX_ZEN;
                mapCurrencyIndexByMsgException[EXCEPTION_NOT_ENOUGH_STAMINA] = mc.const.ITEM_INDEX_STAMINA;
                mapCurrencyIndexByMsgException[EXCEPTION_NOT_ENOUGH_FRIEND_POINT] = mc.const.ITEM_INDEX_FRIEND_POINTS;
                mapCurrencyIndexByMsgException[EXCEPTION_NOT_ENOUGH_TICKET] = parseNotEnoughTicket(json["cmd"]);
                var needCurrencyIndex = mapCurrencyIndexByMsgException[json.msg];
                if (needCurrencyIndex) {
                    mc.view_utility.showExchangingIfAny(needCurrencyIndex);
                } else {
                    var msg = mc.buildExceptionMsg(errorCode, json["cmd"]);
                    var closeFunc = function () {
                        switch (errorCode) {
                            case EXCEPTION_LOGIN_OTHER_DEVICE:
                                new mc.LoginScreen().show();
                                break;
                        }
                    };
                    var dialog = new mc.DefaultDialog()
                        .setTitle(mc.dictionary.getGUIString("lblWarning"))
                        .setMessage(msg)
                        .enableOkButton(function () {
                            dialog.close();
                            closeFunc();
                        }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                    switch (errorCode) {
                        case EXCEPTION_LOGIN_OTHER_DEVICE:
                            dialog && dialog.setEnableClickOutSize(false);
                            break;
                        case EXCEPTION_GUILD_NOT_JOIN:
                            return;
                    }
                    dialog.show();
                }
            }
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.UNLOCK_NOTIFICATION, function (response) {
            var json = response.toJson();
            var type = json["type"];
            if (type === UNLOCK_TYPE_NEW_STAGE) {
                mc.log("NEED IMPLEMENT !!!!");
            }
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.NOTIFICATION, function (response) {
            var json = response.toJson();
            var group = json["group"];
            if (group === NOTIFICATION_GROUP_QUEST) {
                var arrQuestGroup = json["quests"];
                questManager.updateArrQuestGroup(arrQuestGroup);
                notifySystem.buildQuestGroupNotification();
                questManager.notifyDataChanged();
                notifySystem.notifyDataChanged();
            } else if (group === NOTIFICATION_GROUP_ARENA) {
                json["arena_info"] && arenaManager.setInfo(json["arena_info"]);
                if (json["type"] === "count") {
                    arenaManager.setNotifyCount(json["count"]);
                    notifySystem.notifyDataChanged();
                }
                arenaManager.notifyDataChanged();
            } else if (group === NOTIFICATION_GROUP_MAIL) {
                if (json["type"] === "count") {
                    mailManager.setNotifyCount(json["count"]);
                    notifySystem.notifyDataChanged();
                }
                mailManager.notifyDataChanged();
            } else if (group === NOTIFICATION_GROUP_FRIEND) {
                if (json["type"] && json["type"] === 'solo') {
                    friendSoloManager.setNotifyCount(json.count);
                    notifySystem.notifyDataChanged();
                } else {
                    var mapNotification = bb.utility.arrayToMap(json["mapNo"], function (notification) {
                        return notification["group"];
                    });
                    var noNewFriend = mapNotification["newFriend"]["no"];
                    var noNewRequestMakeFriend = mapNotification["request"]["no"];
                    noNewFriend > 0 && (friendManager.setArrayFriendInfo(null));
                    noNewRequestMakeFriend > 0 && (friendManager.setArrayFriendRequest(null));
                    notifySystem.buildFriendNotification(noNewFriend, noNewRequestMakeFriend);
                    friendManager.notifyDataChanged();
                    notifySystem.notifyDataChanged();
                }

            } else if (group === NOTIFICATION_GROUP_RELIC_BATTLE) {
                if (json["type"] && json["type"] === "count") {
                    var id = json["battleId"];
                    relicArenaManager.addMatchIdForRequestJoinerList(id);
                    relicArenaManager.setNotifyCount(json["count"]);
                    relicArenaManager.notifyDataChanged();
                    mc.GUIFactory.notifyText("battleId : " + json["battleId"] + " has " + json["count"] + " joiner", mc.const.NOTIFICATION.BEFORE_PICK_HERO, json, function () {
                        //var dialog = new mc.DialogVSBeforePickHero();
                        var screen = bb.director.getCurrentScreen();
                        if (screen.getScreenId() === mc.GUIState.ID_SCREEN_MAIN) {
                            screen.pushLayerWithId(mc.MainScreen.LAYER_JOINER_LIST_RELIC_ARENA);
                        }
                    });
                }
            }
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.SHOP, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var callbackName = key.MU_EXTENSION.SHOP + "_" + act;
            var cat_id = json["cat_id"];
            var rs = null;
            if (act === SHOP_GET_ITEM_LIST ||
                act === SHOP_REFRESH) {
                var shopInfo = json["shopInfo"];
                if (shopInfo) {
                    shop.setShopData(shopInfo, cat_id);
                    shop.notifyDataChanged();
                }
                rs = shopInfo;
            } else if (act === SHOP_BUY_ITEM) {
                var update = json["update"];
                if (update) {
                    var items = update["items"];
                    if (items) {
                        var arrChangeItem = itemStock.updateArrayItem(items, true);
                        arrChangeItem && arrChangeItem.length > 0 && itemStock.pushArrayNewComingItem(arrChangeItem);
                        itemStock.notifyDataChanged();
                    }
                }
                rs = update;
            }
            _performCallback(callbackName, rs);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.QUEST, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            var callbackName = key.MU_EXTENSION.QUEST + "_" + act;
            if (act === QUEST_GET_LIST) {
                result = {group: json["group"], arrQuest: json["quests"]};
                questManager.updateArrQuestInfoByGroupId(result.group, result.arrQuest);
                questTrigger.updateArrTracingQuest(result.arrQuest);
            } else if (act === QUEST_CLAIM ||
                act === QUEST_CLAIM_ALL) {
                var qid = json["qid"];
                if (qid) {
                    questManager.removeQuestInfoByQuestId(qid);
                }
                var arrQuestId = json["qids"];
                if (arrQuestId) {
                    for (var q = 0; q < arrQuestId.length; q++) {
                        questManager.removeQuestInfoByQuestId(arrQuestId[qid]);
                    }
                }
                var reward = json["reward"];
                var update = json["update"];
                var notify = false;
                if (reward) {
                    notify = true;
                    itemStock.pushArrayNewComingItem(reward["items"]);
                }
                if (update) {
                    notify = true;
                    itemStock.updateArrayItem(update["items"]);
                }
                notify && itemStock.notifyDataChanged();
            } else if (act === QUEST_FINISH) {
                mc.log("QUEST_FINISH");
            }
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.HERO, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var callbackName = key.MU_EXTENSION.HERO + "_" + act;
            var result = null;
            if (act === HERO_LIST_CHUNK) {
                _performCallback(callbackName, json);
            } else if (act === HERO_SUMMON_PUZZLE) {
                var heroes = json["heroes"];
                if (json["update"]) {
                    itemStock.updateArrayItem(json["update"]["items"]);
                    itemStock.notifyDataChanged();
                }
                if (heroes) {
                    summonManager.setSummonHeroes(heroes);
                    heroStock.updateArrayHero(heroes);
                    heroStock.notifyDataChanged();
                    _performCallback(callbackName, heroes);
                }

            } else {
                if (act === HERO_UPGRADE_LEVEL) {
                    var heroInfo = result = json["hero"];
                    heroStock.updateArrayHero([heroInfo]);

                    var arrUsedHeroId = json["heroIds"];
                    if (arrUsedHeroId) {
                        for (var i = 0; i < arrUsedHeroId.length; i++) {
                            heroStock.removeHeroById(arrUsedHeroId[i]);
                        }
                    }
                } else if (act === HERO_UPGRADE_RANK) {
                    var heroInfo = result = json["new_hero"];
                    heroStock.updateArrayHero([heroInfo]);
                } else if (act === HERO_UPGRADE_SKILL) {
                    var heroInfo = json["hero"];
                    heroStock.updateArrayHero([heroInfo]);
                    result = {
                        hero: heroInfo,
                        skillIndex: json["newSkillIndex"]
                    };
                } else if (act === HERO_EXCHANGE_STONES) {
                    result = json;
                    var arrUsedHeroId = json["heroIds"];
                    if (arrUsedHeroId) {
                        for (var i = 0; i < arrUsedHeroId.length; i++) {
                            heroStock.removeHeroById(arrUsedHeroId[i]);
                        }
                    }
                    if (json["reward"]) {
                        itemStock.pushArrayNewComingItem(json["reward"]["items"]);
                    }
                }
                if (json["update"]) {
                    itemStock.updateArrayItem(json["update"]["items"]);
                    itemStock.notifyDataChanged();
                }
                heroStock.notifyDataChanged();
                _performCallback(callbackName, result);
            }
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.MAIL, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var callbackName = key.MU_EXTENSION.MAIL + "_" + act;
            var result = null;
            if (act === MAIL_LIST) {
                result = json["mails"];
                mailManager.setArrayMailInfo(result);
                mailManager.notifyDataChanged();
            } else if (act === MAIL_OPEN) {
                result = json["detail"];
                var mailId = result["id"];
                mailManager.setMailInfoById(mailId, result);
                mailManager.notifyDataChangedWithParameter({
                    arrMailId: [mailId],
                    actMailId: mc.MailManager.ACTION_UPDATE
                });
            } else if (act === MAIL_ACTION ||
                act === MAIL_CLAIM_ALL) {
                var arrHeroInfo = json["heroes"];
                if (arrHeroInfo) {
                    heroStock.updateArrayHero(arrHeroInfo);
                    heroStock.notifyDataChanged();
                }
                var update = json["update"];
                if (update) {
                    var items = update["items"];
                    if (items && items.length > 0) {
                        itemStock.updateArrayItem(items);
                    }
                }
                var reward = json["reward"];
                if (reward) {
                    var items = reward["items"];
                    itemStock.pushArrayNewComingItem(items);
                }
                (update || reward) && itemStock.notifyDataChanged();
                var actMailId = json["actId"];
                if (json["id"]) {
                    mailManager.doActionCodeById(json["id"], actMailId);
                    mailManager.notifyDataChangedWithParameter({
                        arrMailId: [json["id"]],
                        actMailId: actMailId
                    });
                }
                if (json["ids"]) {
                    var arrIds = json["ids"];
                    var actMailId = mc.MailManager.ACTION_CLAIM;
                    for (var i = 0; i < arrIds.length; i++) {
                        mailManager.doActionCodeById(arrIds[i], actMailId);
                    }
                    mailManager.notifyDataChangedWithParameter({
                        arrMailId: arrIds,
                        actMailId: actMailId
                    });
                }
                notifySystem.buildSummonNotificationByGroup();
            } else if (act === MAIL_DELETE_ALL) {
                var arrIds = json["ids"];
                for (var i = 0; i < arrIds.length; i++) {
                    mailManager.doActionCodeById(arrIds[i], mc.MailManager.ACTION_REMOVE);
                }
                mailManager.notifyDataChangedWithParameter({
                    arrMailId: arrIds,
                    actMailId: mc.MailManager.ACTION_REMOVE
                });
            }
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.SETTING, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var callbackName = key.MU_EXTENSION.SETTING + "_" + act;
            var result = null;
            if (act === SETTING_UPDATE) {
                result = json;
                setting.setSettingData(json);
                setting.notifyDataChanged();
            }
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.MINING, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var callbackName = key.MU_EXTENSION.MINING + "_" + act;
            var result = null;
            if (act === MINING_GET_INFO) {
                result = json["data"];
                mineSystem.initMining(result);
            } else if (act === MINING_START) {
                result = json["data"];
                mineSystem.startMining(result);
            } else if (act === MINING_STOP) {
                result = json["data"];
                mineSystem.stopMining();
            } else if (act === MINING_COLLECT) {
                result = json;
                var items = json["items"];
                var heroExpArr = json["heroExpArr"];
                bb.utility.arrayTraverse(heroExpArr, function (exp) {
                    var heroId = exp.heroId;
                    var deltaExp = exp.exp;
                    var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
                    if (heroInfo) {
                        var changer = heroInfoChangerCollection.getChanger(heroId);
                        changer.setAttachData(deltaExp).setDataChange({
                            level: heroInfo.level,
                            exp: heroInfo.exp
                        });
                    }
                });
                if (items && items.length > 0) {
                    itemStock.pushArrayNewComingItem(items);
                }
                var update = json["update"];
                if (update) {
                    update["heroes"] && heroStock.updateArrayHero(update["heroes"]);
                    update["items"] && itemStock.updateArrayItem(update["items"]);
                }
                heroStock.notifyDataChanged();
                itemStock.notifyDataChanged();
                mineSystem.collectMining(json["data"]);
            }
            mineSystem.notifyDataChanged();
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.FRIEND, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var callbackName = key.MU_EXTENSION.FRIEND + "_" + act;
            var result = null;
            if (act === FRIEND_GET_SUGGEST_HERO_LIST) {
                result = json["suggest-list"];
                friendManager.setFriendSuggestData(result);
            } else if (act === FRIEND_REQUEST_ADD) {
                result = json;
                friendManager.setArrayFriendInfo(null);
            } else if (act === FRIEND_SEND_POINT) {
                result = json;
                var friendInfo = friendManager.getFriendInfoById(result["gameHeroId"]);
                if (friendInfo) {
                    friendInfo["receivedFP"] = true;
                }
            } else if (act === FRIEND_SEND_ALL_POINT) {
                result = json;
                var arrFriendInfo = friendManager.getArrayFriendInfo();
                if (arrFriendInfo) {
                    for (var i = 0; i < arrFriendInfo.length; i++) {
                        arrFriendInfo[i] && (arrFriendInfo[i]["receivedFP"] = true);
                    }
                }
            } else if (act === FRIEND_UNFRIEND_SEND) {
                result = json;
                friendManager.removeFriendById(json.gameHeroId);
            } else if (act === FRIEND_GET_FRIEND_LIST) {
                result = json["buddyList"];
                friendManager.setArrayFriendInfo(result);
            } else if (act === FRIEND_GET_REQUEST_LIST) {
                result = json["requestList"];
                friendManager.setArrayFriendRequest(result);
            } else if (act === FRIEND_ACCEPT_REQUEST ||
                act === FRIEND_DENY_REQUEST) {
                result = json;
                friendManager.setArrayFriendInfo(null);
                friendManager.setArrayFriendRequest(null);
            } else if (act === FRIEND_SEARCH) {
                result = json["buddyList"];
                friendManager.setArraySearchInfo(result, json["name"], json["page"], json["maxPage"]);
            } else if (act === FRIEND_SOLO_REQUEST) {
                result = json;
                friendSoloInBattle.setBattleData(json);
                friendSoloInBattle.notifyDataChanged();
            } else if (act === FRIEND_SOLO_FINISH) {
                result = json;
            } else if (act === FRIEND_SOLO_HISTORY) {
                result = json;
            } else if (act === FRIEND_SOLO_REPLAY) {
                result = json;
                var recordBattle = json["battle"];
                if (recordBattle) {
                    var battleData = {
                        opponent: JSON.parse(recordBattle["opponent"]),
                        your_team: JSON.parse(recordBattle["your_team"]),
                        script: JSON.parse(recordBattle["script"]),
                        isAttacker: recordBattle["isAttacker"]
                    };
                    replayFriendSoloInBattle.setBattleData(battleData);
                    replayFriendSoloInBattle.notifyDataChanged();
                }
            }
            friendManager.notifyDataChanged();
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.ACCOUNT_LVL_UP, function (response) {
            var json = response.toJson();
            json.oldMaxStamina = playerInfo.getMaxStamina();
            var update = json["update"];
            if (update && update["items"]) {
                itemStock.updateArrayItem(update["items"]);
                itemStock.notifyDataChanged();
            }
            playerInfo.setAccountLvlUp(json);
            if (json.level != undefined) {
                lvlUpEvent.setAttachData(json);
                lvlUpEvent.setDataChange({
                    maxStamina: playerInfo.getMaxStamina()
                });
            }
            playerInfo.notifyDataChanged();
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.DAILY_CHALLENGE, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = null;
            if (act === CHALLENGE_GET_LIST) {
                result = json;
                challengeManager.setChallengeData(json);
                challengeManager.setChallengeXBonus(json["event_bonus"] || 1);
                challengeManager.notifyDataChanged();
            } else if (act === CHALLENGE_FIGHT) {
                result = json;
                challengeInBattle.setBattleData(result);
            } else if (act === CHALLENGE_FINISH ||
                act === CHALLENGE_QUICK_FINISH) {
                result = json;
                act === CHALLENGE_QUICK_FINISH && (json["star"] = 3);
                var reward = json["reward"];
                var update = json["update"];
                resultInBattle.setResult(json);
                resultInBattle.notifyDataChanged();

                reward && resultInBattle.setRewardInfo(reward);

                if (update) {
                    var updateItems = update["items"];
                    itemStock.updateArrayItem(updateItems);
                    itemStock.notifyDataChanged();
                }
                if (resultInBattle.isWin()) {
                    var challengeStageDict = mc.dictionary.getChallengeStageByIndex(resultInBattle.getStageId());
                    if (challengeStageDict) {
                        var challengeGroupInfo = mc.GameData.challengeManager.getAllChallengeGroup()[challengeStageDict["groupIndex"]];
                        challengeGroupInfo["chance"]--;
                        if (challengeGroupInfo["chance"] <= 0) {
                            challengeGroupInfo["chance"] = 0;
                        }
                        mc.GameData.challengeManager.notifyDataChanged();
                    }
                }
            }
            var callbackName = key.MU_EXTENSION.DAILY_CHALLENGE + "_" + act;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.BLOOD_CASTLE, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var callbackName = key.MU_EXTENSION.BLOOD_CASTLE + "_" + act;
            var result = null;
            if (act === BLOOD_CASTLE_GET_LIST) {
                result = json;
                teamFormationManager.setupBloodCastleTeamFormation(result["bc"]);
                bloodCastleManager.setBloodCastleData(result);
                bloodCastleManager.notifyDataChanged();
            }
            else if (act === BLOOD_CASTLE_SETUP_TEAM) {
                result = json;
                teamFormationManager.setupBloodCastleTeamFormation(result["bc"]);
                teamFormationManager.correctFormationAllTeams(mc.TeamFormationManager.TEAM_BLOODCASTLE);
            }
            else if (act === BLOOD_CASTLE_FIGHT) {
                result = json;
                bloodCastleInBattle.setBattleData(result);
                bloodCastleManager.notifyDataChanged();
            } else if (act === BLOOD_CASTLE_FINISH) {
                json["star"] = _popParameter(callbackName);
                result = json;
                var reward = json["reward"];
                var update = json["update"];
                resultInBattle.setResult(json);
                reward && resultInBattle.setRewardInfo(reward);
                resultInBattle.notifyDataChanged();

                if (update) {
                    var updateItems = update["items"];
                    itemStock.updateArrayItem(updateItems);
                    itemStock.notifyDataChanged();
                }

                teamFormationManager.setupBloodCastleTeamFormation(mc.TeamFormationManager.TEAM_BLOODCASTLE);
                bloodCastleManager.updateAllStatusCreature(result["properties"]);

                var numChance = bloodCastleManager.getNumberOfChance();
                numChance--;
                numChance < 0 && (numChance = 0);
                bloodCastleManager.setNumberOfChance(numChance);
                bloodCastleManager.notifyDataChanged();
            }

            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.COMMON, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            if (act === COMMON_GET_GIFTCODE_REWARD) {
                cc.log("GET REWARD GIFT CODE");
            } else if (act === COMMON_GET_VIEWADS_REWARD) {
                result = json;
                var reward = json["reward"];
                if (reward) {
                    var items = reward["items"];
                    itemStock.pushArrayNewComingItem(items);
                    itemStock.notifyDataChanged();
                }
            } else if (act === COMMON_GET_FUNCTION_LIST) {
                refreshFunctionSystem.setRefreshFunctionList(json["funcList"]);
                refreshFunctionSystem.notifyDataChanged();
            } else if (act === COMMON_EXCHANGE_FUNCTION) {
                refreshFunctionSystem.updateRefreshFunctionObject(json["funcObj"]);

                var reward = json["reward"];
                var update = json["update"];
                var notify = false;
                if (reward) {
                    notify = true;
                    itemStock.pushArrayNewComingItem(reward["items"]);
                }
                if (update) {
                    notify = true;
                    itemStock.updateArrayItem(update["items"]);
                }
                switch (json["func"]) {
                    case mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_2:
                    case mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_1:
                    case mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_0:
                        var challengeGroupInfo = mc.GameData.challengeManager.getAllChallengeGroup()[json["groupIndex"]];
                        challengeGroupInfo["chance"] = json["chance"];
                        mc.GameData.challengeManager.notifyDataChanged();
                        break;
                    case mc.const.REFRESH_FUNCTION_ILLUSION:
                        illusionManager.updateIllusionInfo(update);
                        illusionManager.notifyDataChanged();
                        break;
                    case mc.const.FUNCTION_BLOOD_CASTLE:
                        bloodCastleManager.setBloodCastleData(json);
                        bloodCastleManager.notifyDataChanged();
                        break;
                }

                notify && itemStock.notifyDataChanged();
                refreshFunctionSystem.notifyDataChanged();
            } else if (act === COMMON_RATING_APP) {
                if (result["code"]) {
                    playerInfo.setRated(true);
                }
            }
            var callbackName = key.MU_EXTENSION.COMMON + "_" + act;
            _performCallback(callbackName, result);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.CHAT, function (response) {
            var json = response.toJson();
            var msgType = json.type;
            var act = json["act"];

            if (json["update"]) {
                var rs = json["update"]["items"];
                rs && itemStock.updateArrayItem(rs);
                itemStock.notifyDataChanged();
            }

            if (msgType === "ntf") {
                notifySystem.addSysMessage(json);
                notifySystem.notifyDataChanged();
            } else {
                if (msgType === "chatBox") {
                    switch (act) {
                        case WORLD_CHAT:
                        case GUILD_CHAT:
                            mc.GameData.chatSystem.getConversationById(json["groupId"]).addMessage(mc.Message.createFromJson(json));
                            mc.GameData.chatSystem.notifyDataChanged();
                            break;
                        case PRIVATE_CHAT://Tách private xử lý riêng list message theo chiều thuận
                            var privateMsg = mc.Message.createFromJson(json);
                            mc.GameData.chatSystem.getPrivateConversationById(privateMsg.getOwnerId()).addPrivateMessage(privateMsg);
                            mc.GameData.chatSystem.recentPrivateMsg = privateMsg;
                            mc.GameData.chatSystem.notifyDataChanged();
                            break;
                        case LIST_CHAT_LOGS:
                            var message = json["messages"];
                            if (message) {
                                if (json["groupId"] !== mc.ChatSystem.GROUP_CHAT_PRIVATE_ID) {
                                    var logConversation = mc.GameData.chatSystem.getConversationById(json["groupId"]);
                                    if (logConversation) {
                                        for (var i in message) {
                                            logConversation.addMessage(mc.Message.createFromJson(message[i]));
                                        }
                                        logConversation.setGetRemoteMsg(true);
                                    }
                                } else {//Tách private xử lý riêng list message theo chiều thuận
                                    for (var i in message) {
                                        var privateMsgTemp = mc.Message.createFromJson(message[i]);
                                        var logPrConversation = mc.GameData.chatSystem.getPrivateConversationById(privateMsgTemp.getOwnerId());
                                        logPrConversation.addPrivateMessage(privateMsgTemp);
                                        logPrConversation.setGetRemoteMsg(true);
                                    }
                                }
                            }
                            notifySystem.notifyDataChanged();
                            mc.GameData.chatSystem.notifyDataChanged();
                            break;

                    }
                }
            }
            var callbackName = key.MU_EXTENSION.CHAT + "_" + act;
            _performCallback(callbackName, json);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.MINI_GAME, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var update = json["update"];
            if (update) {
                var items = update["items"];
                if (items && items.length > 0) {
                    itemStock.updateArrayItem(items);
                    itemStock.notifyDataChanged();
                }
            }
            if (act === 0) {
                //updtate spin ticket countdown time
                var updateTime = json["update_time"];
                if (updateTime) {
                    playerInfo.setSpinTicketTime(updateTime);
                    playerInfo.reloadSpinTicketProgress();
                }
            }
            else if (act === EGG_LIST || act === REFRESH_EGG_LIST) {
                var cat_id = mc.ShopManager.SHOP_EGG;
                if (json["shopInfo"]) {
                    var shopInfo = json["shopInfo"];
                    if (shopInfo) {
                        shop.setShopData(shopInfo, cat_id);
                        shop.notifyDataChanged();
                    }
                    //rs = shopInfo;
                    json = shopInfo;
                }
            } else if (act === BEAT_EGG) {
                var reward = json["reward"];
                var items = reward["items"];

                if (items && items.length > 0) {
                    itemStock.updateArrayItem(items);
                    itemStock.notifyDataChanged();
                }
                //save egg gift
                var itemm = json["reward"].items;
                if (!mc.storage.eggGameLog) {
                    mc.storage.eggGameLog = {};
                }
                var reward = mc.storage.eggGameLog["reward"];
                if (!reward) {
                    reward = {};
                }
                var arrItemInfo = mc.ItemStock.groupItem(itemm);
                for (var e = 0; e < arrItemInfo.length; e++) {
                    if (!reward[arrItemInfo[e].index.toString()]) {
                        reward[arrItemInfo[e].index.toString()] = arrItemInfo[e];
                    } else {
                        reward[arrItemInfo[e].index.toString()].no += arrItemInfo[e].no;
                    }
                }
                mc.storage.eggGameLog["reward"] = reward;
                mc.storage.saveEggGameLog();


            }
            var callbackName = key.MU_EXTENSION.MINI_GAME + "_" + act;
            _performCallback(callbackName, json);
        });

        MessageManager.addReceiveCallback(key.MU_EXTENSION.BATTLE_RELIC, function (response) {
            var json = response.toJson();
            var act = json["act"];
            //if (update) {
            //    var items = update["items"];
            //    if (items && items.length > 0) {
            //        itemStock.updateArrayItem(items);
            //        itemStock.notifyDataChanged();
            //    }
            //}
            if (act === BATTLE_RELIC_SEARCH) {
                var opp = json["topList"];
                relicArenaManager.setArraySearchOpponent(opp);
            } else if (act === BATTLE_RELIC_ACCEPT_JOINER_REQUEST) {
                relicArenaManager.updateMatchInfo(json);
                if (json.start) {
                    relicArenaManager.setWaitingVS(true);
                }
            }
            //else if(act === BATTLE_RELIC_PICK_HEROES)
            //{
            //
            //}
            else if (act === BATTLE_RELIC_SUBMIT_TEAM) {
                if (json["code"] && json["code"] === 2) {
                    var tempJson = bb.utility.cloneJSON(json);
                    var oppTeam = {};
                    var yourTeam = {};
                    var playerSide = null;
                    if (json.host_team.gameHeroId === mc.GameData.playerInfo.getId()) {
                        playerSide = mc.const.TEAM_LEFT;
                        yourTeam = json.host_team;
                        oppTeam = json.request_team;
                    } else {
                        playerSide = mc.const.TEAM_RIGHT;
                        yourTeam = json.request_team;
                        oppTeam = json.host_team;
                    }
                    var data = {opponent: oppTeam, your_team: yourTeam, seed: json["seedTime"], playerSide: playerSide};
                    mc.GameData.relicArenaInBattle.setBattleData(data);
                }
                relicArenaManager.setPickingStatus(json);
                relicArenaManager.notifyDataChanged();
            } else if (act === BATTLE_RELIC_SUBMIT_RESULT) {
                if (json["count"] && json["count"] === 2) {
                    if (mc.GameData.playerInfo.getId() === json["winnerId"]) {
                        var result = {"items": [{index: 11998, no: json["relicWin"]}]};
                        resultInBattle.setRewardInfo(result);
                        resultInBattle.notifyDataChanged();
                    }
                }
            } else if (act === BATTLE_RELIC_INFO) {
                if (json.battle_power) {
                    relicArenaManager.setInfo(json.battle_power);
                    //relicArenaManager.notifyDataChanged();
                }
            } else if (act === BATTLE_RELIC_HISTORY) {
                var temp = json.historyList;
                json = temp;
            }

            var callbackName = key.MU_EXTENSION.BATTLE_RELIC + "_" + act;
            _performCallback(callbackName, json);
        });
        MessageManager.addReceiveCallback(key.MU_EXTENSION.PAYMENT, function (response) {
            var json = response.toJson();
            var act = json["act"];
            var result = json;
            var callbackName = key.MU_EXTENSION.PAYMENT + "_" + act;
            if (act === PAYMENT_VERIFY_GOOGLE_INAP ||
                act === PAYMENT_VERIFY_APPLE_INAPP) {
                var update = json["update"];
                if (update) {
                    var items = update["items"];
                    if (items && items.length > 0) {
                        itemStock.updateArrayItem(items);
                    }
                }
                var reward = json["reward"];
                if (reward) {
                    var items = reward["items"];
                    itemStock.pushArrayNewComingItem(items);
                }
                var strInAppItem = _popParameter(callbackName);
                strInAppItem && (mc.storage.removePurchaseInfoToken(strInAppItem, mc.GameData.playerInfo.getUserId()));
                (update || reward) && itemStock.notifyDataChanged();
                json["buyTimesArr"] && paymentSystem.setBuyTimes(json["buyTimesArr"]);
            } else if (act === PAYMENT_GET_BUY_TIMES) {
                json["buyTimesArr"] && paymentSystem.setBuyTimes(json["buyTimesArr"]);
            } else if (act === PAYMENT_FIRST_TIME_CHECK) {
                if (json["state"] !== undefined) {
                    mc.GameData.playerInfo.firstTimeRewards = json["state"];
                }
            } else if (act === PAYMENT_MANA_COIN_REWARD_CLAIM) {
                var update = json["update"];
                if (update) {
                    var items = update["items"];
                    if (items && items.length > 0) {
                        itemStock.updateArrayItem(items);
                    }
                }
                var reward = json["reward"];
                if (reward) {
                    var items = reward["items"];
                    itemStock.pushArrayNewComingItem(items);
                }
                (update || reward) && itemStock.notifyDataChanged();
            }

            paymentSystem.notifyDataChanged();
            _performCallback(callbackName, result);
        });
    };

    protocol.calculateNumStarInBattleIllusion = function (arrCreature, durBattleInMs) {
        var numHeroAlive = arrCreature.length;
        bb.utility.arrayTraverse(arrCreature, function (creature) {
            if (creature.isDead()) {
                numHeroAlive--;
            }
        });
        var oneMinute = 60 * 1000;
        // var remainInMs = mc.const.MAX_BATTLE_DURATION_IN_MS - durBattleInMs;
        var numStar = 1;
        if (durBattleInMs <= oneMinute) {
            if (numHeroAlive >= 3) {
                numStar = 3;
            } else if (numHeroAlive === 2) {
                numStar = 2;
            }
        } else {
            if (numHeroAlive >= 3) {
                numStar = 2;
            }
        }
        return numStar;
    };

    mc.protocol = protocol;
}(mc));

mc.buildExceptionMsg = function (code, cmd, act) {
    {
        var lbl = "Code " + code;
        switch (code) {
            case 0:
                lbl = "lblNotEnoughCurrencyItem";
                break;
            case 1:
                lbl = "lblNotEnoughStamina";
                break;
            case 2:
                lbl = "lblNotEnoughZen";
                break;
            case 3:
                lbl = "lblNotEnoughBless";
                break;
            case 4:
                lbl = "lblNotEnoughTicket";
                if (cmd && cmd === mc.protocol.key.MU_EXTENSION.CHAT) {
                    lbl = "lblNotEnoughSendMessage";
                } else if (cmd && cmd === mc.protocol.key.BATTLE_RELIC) {
                    lbl = "lblYouJoinedOtherBattle";
                }
                break;
            case 5:
                lbl = "lblNotEnoughChance";
                break;
            case 9:
                lbl = "lblNotEnoughRelic";
                break;
            case 10:
                lbl = "lblNotEnoughLevelTransferRelic";
                break;
            case 11:
                lbl = "lblVIPExpired";
                break;
            case 20:
                lbl = "lblStageNotFound";
                break;
            case 21 :
                lbl = "lblEggNotFound";
                break;
            case 30:
                lbl = "lblEventNotOPenYet";
                break;
            case 40:
                lbl = "lblCannotFindHero";
                break;
            case 41:
                lbl = "lblMaxFriend";
                break;
            case 50:
                lbl = "lblFeeNull";
                break;
            //case 51:
            //    lbl = "lblNotEnoughRelic";
            //    break;
            case 60:
                lbl = "lblMaterialCanNotUse";
                break;
            case 61:
                lbl = "lblUpdateBattleTeamFail";
                break;
            case 70:
                lbl = "lblLackInformation";
                break;
            case 71:
                lbl = "lblLackMaterial";
                break;
            case 80:
                lbl = "lblItemIsUsing";
                break;
            case 90:
                lbl = "lblItemNotExist";
                break;
            case 91:
                lbl = "lblQuestIsReceived";
                break;
            case 100:
                lbl = "lblCanNotUpgrade";
                break;
            case 120:
                lbl = "lblNotFound";
                break;
            case 121:
                lbl = "lblRewardsClaimed";
                break;
            case 122:
                lbl = "lblChaoStageNotUnlock";
                break;
            case 123:
                lbl = "lblOpponentInBattle";
                break;
            case 130:
                lbl = "lblExistGameHeroName";
                break;
            case 131:
                lbl = "lblName3To5Char";
                break;
            case 132:
                lbl = "lblAccountHasBeenLinkedFB";
                break;
            case 202:
                lbl = "lblRelicBattleNotExist";
                break;
            case 205:
                lbl = "lblRelicMatchInvalid";
                break;
            case 209:
                lbl = "lblOpponentOffline";
                break;
            case 600:
                lbl = "lblGiftCodeReceived";
                break;
            case 601:
                lbl = "lblGiftCodeNotFound";
                break;
            case 700:
                lbl = "lblGuildNotFound";
                break;
            case 701:
                lbl = "lblCreateGuildNotEnoughLevel";
                break;
            case 702:
                lbl = "lblGuildNotJoin";
                break;
            case 703:
                lbl = "lblGuildNotExist";
                break;
            case 704:
                lbl = "lblGuildMaxMember";
                break;
            case 705:
                lbl = "lblGuildNotEilgible";
                break;
            case 706:
                lbl = "lblGuildPermission";
                break;
            case 710:
                lbl = "lblJoinedAnotherGuild";
                mc.GameData.guildManager.removeRequest();
                mc.GameData.guildManager.receiveAcceptJoin();
                mc.GameData.guildManager.needUpdateMembers();
                mc.GameData.guildManager.notifyDataChanged();
                break;
            case 711:
                lbl = "lblLevelNotSuitable";
                break;
            case 713:
                lbl = "lblBanJoinGuild";
                break;
            case 714:
                lbl = "lblExistGuildName";
                break;
            case 715:
                lbl = "lblLeagueSRequire";
                break;
            case 900:
                lbl = "lblLogByOtherDevice";
                break;
            case 999:
                lbl = "lblUnknown";
                if (cmd === mc.protocol.key.MU_EXTENSION.GUILD_BOSS) {
                    if (act === mc.protocol.GUILD_BOSS_REWARD_FROM_CARD) {
                        lbl = "lblErrorRewardFromCard";
                    }
                }
                break;
        }
        return mc.dictionary.getExceptionString(lbl);
    }
};
