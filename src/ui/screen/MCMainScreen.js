/**
 * Created by long.nguyen on 5/9/2017.
 */
mc.Screen = bb.Screen.extend({

    initResources: function () {
        this._super();
        this.triggerTutorial();
    },

    triggerTutorial: function () {
        this.enableInput(false);
        this.runAction(cc.sequence([cc.delayTime(0.2), cc.callFunc(function () {
            this.onTriggerTutorial();
            this.traceDataChange(mc.GameData.tutorialManager, function () {
                this.onTriggerTutorial();
            }.bind(this));
            this.enableInput(true);
        }.bind(this))]));
    },

    onTriggerTutorial: function () {
    },

    onBackEvent: function () {
        var isDone = mc.GameData.guiState.popScreen();
        if (isDone) {
            return true;
        }
        return this._super();
    }

});

mc.BattleScreen = bb.Screen.extend({

    initResources: function () {
        this._super();

        mc.GameData.resultInBattle.clearData();
        mc.view_utility.registerShowServerNotify(this);
    }

});

mc.MainScreen = mc.Screen.extend({
    _isShowAnimation: false,
    _mapLayerCacheById: null,

    _loadCommonResource: function () {
        // load all texture
        cc.spriteFrameCache.addSpriteFrames(res.sprite_plist);
        cc.spriteFrameCache.addSpriteFrames(res.avatar1_plist);

        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_4_plist);
        cc.spriteFrameCache.addSpriteFrames(res.text_plist);
        cc.spriteFrameCache.addSpriteFrames(res.bar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.button_plist);

        var custom = mc.storage.readCustom();
        if (custom.freshPlayer) {
            custom.freshPlayer = false;
            mc.storage.saveCustom();
        }
    },

    getPreLoadURL: function () {
        return mc.resource.getBattleTeamPreLoadURL();
    },

    initResources: function () {
        this._loadCommonResource();

        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_CAMPAIGN);
        var screen = this._screen = mc.loadGUI(res.screen_main_json);
        this.addChild(screen);

        var mapView = bb.utility.arrayToMap(screen.getChildren(), function (child) {
            return child.getName();
        });

        var brkTop = mapView["brkTop"];
        var brkBottom = mapView["brkBottom"];
        var imgInfo = mapView["imgInfo"];
        var pnl_cover_top = mapView["pnl_cover_top"];
        var pnl_cover_bottom = mapView["pnl_cover_bottom"];
        var btnBack = this._btnBack = mapView["btnBack"];

        this._mapLayerCacheById = {};
        //this._mapLayerCacheById[mc.MainScreen.LAYER_WORD_MAP] = new mc.WorldMapLayer();
        //this._mapLayerCacheById[mc.MainScreen.LAYER_HOME] = new mc.HomeLayer();
        //for(var layerId in this._mapLayerCacheById ){
        //    this._mapLayerCacheById[layerId].setVisible(false);
        //    this.getScreenNode().addChild(this._mapLayerCacheById[layerId]);
        //}

        var headerView = this._headerView = new mc.PlayerInfoHeaderView(brkTop);
        var footerView = this._footerView = new mc.BottomBarView(brkBottom);
        var tipView = this._tipView = new mc.TipView(imgInfo);
        var currLayerId = mc.GameData.guiState.getCurrentLayerIdForMainScreen() || mc.MainScreen.LAYER_HOME;
        var numLayerId = mc.GameData.guiState.getStackLayerIdForMainScreen().length;
        if (numLayerId > 0) {
            this.popLayer();
        }
        else {
            this.showLayerWithId(currLayerId);
        }

        mc.GameData.tutorialManager.injectTutorialStepNavigationIfAny();

        screen.addChild(headerView);
        screen.addChild(footerView);
        screen.addChild(tipView);

        headerView.setLocalZOrder(7);
        footerView.setLocalZOrder(8);
        btnBack.setLocalZOrder(9);
        tipView.setLocalZOrder(10);
        pnl_cover_bottom.setLocalZOrder(11);
        pnl_cover_top.setLocalZOrder(12);

        btnBack.registerTouchEvent(function () {
            var currLayer = this._getCurrentLayer();
            if (currLayer.isConfirmExit()) {
                mc.GUIFactory.confirm(mc.dictionary.getGUIString("lblDoYouWantToExit"), function () {
                    this.popLayer();
                }.bind(this))
            }
            else {
                this.popLayer();
            }
        }.bind(this));

        this.traceDataChange(mc.GameData.itemStock, function () {
            var arrNewComingItem = mc.GameData.itemStock.popArrayNewComingItem();
            if (arrNewComingItem) {
                mc.view_utility.showNewComingItem(arrNewComingItem);
            }
        }.bind(this));

        this.traceDataChange(mc.GameData.notifySystem, function () {
            var sysMessage = mc.GameData.notifySystem.countSysMessage();
            if (sysMessage > 0) {
                if (!this.getChildByName("banner_msg")) {
                    var popSysMessage = mc.GameData.notifySystem.popSysMessage();
                    var bannerView = new mc.BannerView(cc.winSize.height * 0.9, popSysMessage["content"] || popSysMessage["message"], 3, 0 , popSysMessage["contentp"]);
                    bannerView.setName("banner_msg");
                    this.addChild(bannerView, 100);
                }
            }
        }.bind(this));

        var _processLevelUpEvent = function () {
            mc.GameData.lvlUpEvent.performChanging({
                "maxStamina": function (oldMaxStamina, maxStamina) {
                    new mc.AccountLevelUpDialog(mc.GameData.lvlUpEvent.getAttachData()).setBlackBackgroundEnable(true).show();
                }
            });
        };

        _processLevelUpEvent();
        this.traceDataChange(mc.GameData.lvlUpEvent, function (data) {
            _processLevelUpEvent();
        }.bind(this));
    },

    onScreenShow: function () {
        bb.sound.playMusic(res.sound_bgm_home);
    },

    onScreenClose: function () {

        var backTrack = mc.GameData.guiState.getBackTrackLayerForMainScreen();
        if (backTrack) {
            mc.GameData.guiState.setStackLayerIdForMainScreen(backTrack);
            mc.GameData.guiState.setBackTrackLayerForMainScreen(null);
        }
        else {
            var layerStackId = mc.GameData.guiState.getStackLayerIdForMainScreen();
            var currLayerId = this.getCurrentLayerId();
            if (currLayerId) { // save the current layer into stack.
                layerStackId.push(currLayerId);
            }
        }
        this._getCurrentLayer() && this._getCurrentLayer().onLayerClose();
    },

    onBackEvent: function () {
        if (this._isShowAnimation) {
            return true;
        }
        if (mc.GameData.guiState.getStackLayerIdForMainScreen().length > 0) {
            this.popLayer();
            return true;
        }
        return this._super();
    },

    getScreenNode: function () {
        return this._screen;
    },

    _getCurrentLayer: function () {
        var scrNode = this.getScreenNode();
        return scrNode ? scrNode.getChildByName("current_layer") : null;
    },

    popLayer: function () {
        var currLayer = this._getCurrentLayer();
        currLayer && currLayer.onLayerClearStack();

        var layerStackId = mc.GameData.guiState.getStackLayerIdForMainScreen();
        if (layerStackId.length > 0) {
            var layerId = layerStackId.pop();
            this._showLayer(this._createLayer(layerId), false, true);
            return true;
        }
        return false;
    },

    getCurrentLayerId: function () {
        var currLayer = this._getCurrentLayer();
        if (currLayer) {
            return currLayer.getLayerId();
        }
        return currLayer;
    },

    pushLayerWithId: function (layerId) {
        if (this.getCurrentLayerId() != layerId && !this._isShowAnimation) {
            var currLayer = this._getCurrentLayer();
            var layerStackId = mc.GameData.guiState.getStackLayerIdForMainScreen();
            var indexOf = layerStackId.indexOf(layerId);
            if (indexOf >= 0) {
                layerStackId.splice(indexOf, layerStackId - indexOf);
            }
            return this._showLayer(this._createLayer(layerId), indexOf < 0, indexOf >= 0);
        }
    },

    showLayerWithId: function (layerId, isRefresh) {
        if (this.getCurrentLayerId() != layerId && !this._isShowAnimation) {
            mc.GameData.guiState.setCurrentLayerIdForMainScreen(layerId);
            mc.GameData.guiState.clearStackLayerIdForMainScreen();
            this._showLayer(this._createLayer(layerId));
        }
        else if (this.getCurrentLayerId() === layerId && isRefresh) {
            this._showLayer(this._createLayer(layerId), false, true);
        }
    },

    _createLayer: function (layerId) {
        var layer = null;
        if (this._mapLayerCacheById && this._mapLayerCacheById[layerId]) {
            layer = this._mapLayerCacheById[layerId];
        }
        if (!layer) {
            if (layerId === mc.MainScreen.LAYER_HOME) {
                layer = new mc.HomeLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_WORD_MAP) {
                layer = new mc.WorldMapLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_HERO_STOCK) {
                layer = new mc.HeroStockLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_TIER_HERO_STOCK) {
                layer = new mc.TierHeroStockLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_HERO_INFO) {
                layer = new mc.HeroInfoLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_HERO_MAX_LV_INFO) {
                layer = new mc.HeroMaxLvInfoLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_ARENA) {
                layer = new mc.ArenaLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_IN_APP_PACKAGE_LIST) {
                layer = new mc.InAppPackageListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_ARENA_RANKING) {
                layer = new mc.ArenaRankingLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_ARENA_REWARDS) {
                layer = new mc.ArenaRewardsLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_DAILY_EVENT) {
                layer = new mc.ArenaDailyEventLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_PAGES_EVENT) {
                layer = new mc.EventPagesLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SEASON_EVENT) {
                layer = new mc.SeasonEventPagesLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_MANAGER) {
                layer = new mc.GuildManagerLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_FLAG) {
                layer = new mc.GuildFlagLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_EDIT) {
                layer = new mc.GuildEditLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_SEARCH) {
                layer = new mc.GuildSearchLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_SEARCH_MORE) {
                layer = new mc.GuildSearchMoreLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_REQUEST_JOIN) {
                layer = new mc.GuildRequestJoinLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_DONATE_INFO) {
                layer = new mc.GuildDonationInfoLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_LUCKY_SPIN) {
                layer = new mc.LuckyRoundLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_WORLD_BOSS) {
                layer = new mc.BossMainLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_WORLD_BOSS_RANKING) {
                layer = new mc.BossRankingLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_BOSS_RANKING) {
                layer = new mc.GuildBossRankingLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_GUILD_BOSS) {
                layer = new mc.GuildBossLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_FRIEND_SOLO_RECORD) {
                layer = new mc.FriendSoloRecordLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_ARENA_RECORD) {
                layer = new mc.ArenaRecordLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_LEVEL_UP_HERO) {
                layer = new mc.LevelUpHeroLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_INVOLVE_HERO) {
                layer = new mc.InvolveHeroLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_ITEM_STOCK) {
                layer = new mc.ItemStockLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SUMMON_LIST) {
                layer = new mc.SummonListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_QUEST_LIST) {
                layer = new mc.QuestGroupListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SHOP_LIST) {
                layer = new mc.ShopListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SHOP) {
                layer = new mc.ShopLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_QUEST_DETAIL_LIST) {
                layer = new mc.QuestDetailListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_BLACK_SMITH) {
                layer = new mc.BlackSmithLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_ILLUSION) {
                layer = new mc.IllusionLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_MAIL) {
                layer = new mc.MailLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_ALL_EVENT) {
                layer = new mc.AllEventLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_CHALLENGE_LIST) {
                layer = new mc.ChallengeListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST) {
                layer = new mc.ChallengeStageListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SUMMON_ITEM) {
                layer = new mc.SummonItemLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_FRIEND) {
                layer = new mc.FriendLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST) {
                layer = new mc.StageCampaignListLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SELECT_CAMPAIGN_HERO) {
                layer = new mc.SelectCampaignHeroLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SELECT_CAMPAIGN_FRIEND) {
                layer = new mc.SelectCampaignFriendLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_RELIC_ARENA) {
                layer = new mc.RelicArenaLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_SELECT_ARENA) {
                layer = new mc.SelectArenaLayer();
            }
            else if (layerId === mc.MainScreen.LAYER_CREATE_RELIC_MATCH) {
                layer = new mc.EditFormationLayer();
            }
            else if(layerId === mc.MainScreen.LAYER_JOIN_REQUEST_RELIC_ARENA)
            {
                layer = new mc.JoinRelicArenaMatchLayer();
            }
            else if(layerId === mc.MainScreen.LAYER_JOINER_LIST_RELIC_ARENA)
            {
                layer = new mc.JoinerListRelicArenaLayer();
            }
            else if(layerId === mc.MainScreen.LAYER_PICK_HERO_RELIC_ARENA)
            {
                layer = new mc.PickHeroFromServerInRelicArenaLayer();
            }
            else if(layerId === mc.MainScreen.LAYER_RELIC_ARENA_RECORD)
            {
                layer = new mc.RelicArenaRecordLayer();
            }
            else if( layerId === mc.MainScreen.LAYER_STAGE_LIST_WORLD_CHALLENGE ){
                layer = new mc.StageListWorldChanllengeLayer();
            }
            else if( layerId === mc.MainScreen.LAYER_BLOOD_CASTLE_STAGE_LIST ){
                layer = new mc.BloodCastleStageListLayer();
            }
        }
        return layer;
    },

    _showLayer: function (layer, inStack, noRefresh, dur) {
        var layerStackId = mc.GameData.guiState.getStackLayerIdForMainScreen();
        var dur = mc.MainScreen.FADE_DURATION;
        var isShowingHeader = true;
        var isShowingFooter = true;
        var isShowingInfo = true;
        this._isShowAnimation = true;
        this._btnBack.setEnabled(false);
        var currentLayer = this._getCurrentLayer();
        if (currentLayer) {
            currentLayer.setName("prev_layer");
            currentLayer.onFade(false, dur);
            currentLayer.fadeAll(dur);

            isShowingHeader = currentLayer.isShowHeader();
            isShowingFooter = currentLayer.isShowFooter();
            isShowingInfo = currentLayer.isShowTip();

            if (inStack) {
                layerStackId.push(currentLayer.getLayerId());
            }
            else {
                if (!noRefresh) {
                    mc.GameData.guiState.clearStackLayerIdForMainScreen();
                }
            }
            currentLayer.runAction(cc.sequence([cc.delayTime(dur), cc.callFunc(function (currentLayer) {
                if (currentLayer.isCache()) {
                    this._mapLayerCacheById[currentLayer.getLayerId()] = currentLayer;
                }
                if (this._mapLayerCacheById[currentLayer.getLayerId()] === currentLayer) {
                    this._mapLayerCacheById[currentLayer.getLayerId()].setVisible(false);
                }
                else {
                    currentLayer.runAction(cc.removeSelf());
                }
            }.bind(this))]));
            this.scheduleOnce(function () {
                this._isShowAnimation = false;
                this._btnBack.setEnabled(true);
            }.bind(this), dur);
        }
        else {
            this._isShowAnimation = false;
            this._btnBack.setEnabled(true);
        }

        if ((layer.isShowHeader() - isShowingHeader) != 0) {
            this.setShowingHeaderAnimation(layer.isShowHeader());
        }

        if ((layer.isShowFooter() - isShowingFooter) != 0) {
            this.setShowingFooterAnimation(layer.isShowFooter());
        }

        if ((layer.isShowTip() - isShowingInfo) != 0) {
            if (layer.isShowTip()) {
                this._tipView.fadeAll(dur, true);
            }
            else {
                this._tipView.fadeAll(dur, false);
            }
        }

        if (layer.isShowHeader()) {
            this._btnBack.x = 52;
            this._btnBack.y = 1089;
        }
        else {
            this._btnBack.x = 48;
            this._btnBack.y = 1288;
        }

        this._btnBack.setVisible(layerStackId.length > 0);

        layer.setVisible(true);
        layer.setName("current_layer");
        layer.setLocalZOrder(1);
        layer.setOpacityForAll(0);
        layer.onFade(true, dur);
        layer.fadeAll(dur, true);
        layer.onStart();

        var childs = this.getScreenNode().getChildren();
        var i = childs.indexOf(layer);
        if (i < 0) {
            this.getScreenNode().addChild(layer);
        }
        return layer;
    },

    setShowingHeaderAnimation: function (isShow) {
        var dur = mc.MainScreen.FADE_DURATION;
        if (isShow) {
            this._headerView.runAction(cc.moveTo(dur * 0.25, cc.p(this._headerView.x, mc.const.DEFAULT_HEIGHT)));
        }
        else {
            this._headerView.runAction(cc.moveTo(dur * 0.25, cc.p(this._headerView.x, mc.const.DEFAULT_HEIGHT + 260)));
        }
    },

    setShowingFooterAnimation: function (isShow) {
        var dur = mc.MainScreen.FADE_DURATION;
        if (isShow) {
            this._footerView.runAction(cc.sequence([cc.moveTo(dur * 0.25, cc.p(this._footerView.x, 0)), cc.callFunc(function (footerView) {
                footerView.onShow();
            })]));
        }
        else {
            this._footerView.runAction(cc.sequence([cc.moveTo(dur * 0.25, cc.p(this._footerView.x, -373)), cc.callFunc(function (footerView) {
                footerView.onClose();
            })]));
        }
    },

    getButtonBack: function () {
        return this._btnBack;
    },

    getFooterView: function () {
        return this._footerView;
    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_MAIN;
    }

});

mc.MainScreen.LAYER_HOME = "layer_home";
mc.MainScreen.LAYER_WORD_MAP = "layer_world_map";
mc.MainScreen.LAYER_SUMMON_ITEM = "layer_summon_item";
mc.MainScreen.LAYER_HERO_STOCK = "layer_hero_stock";
mc.MainScreen.LAYER_TIER_HERO_STOCK = "layer_tier_hero_stock";
mc.MainScreen.LAYER_HERO_INFO = "layer_hero_info";
mc.MainScreen.LAYER_HERO_MAX_LV_INFO = "layer_hero_max_lv_info";
mc.MainScreen.LAYER_JOIN_REQUEST_RELIC_ARENA = "layer_join_request_relic_arena";
mc.MainScreen.LAYER_EDIT_FORMATION = "layer_edit_formation";
mc.MainScreen.LAYER_LEVEL_UP_HERO = "layer_level_up_hero";
mc.MainScreen.LAYER_INVOLVE_HERO = "layer_involve_hero";
mc.MainScreen.LAYER_ITEM_STOCK = "layer_item_stock";
mc.MainScreen.LAYER_SUMMON_LIST = "layer_summon_list";
mc.MainScreen.LAYER_ALL_EVENT = "layer_all_event";
mc.MainScreen.LAYER_CHALLENGE_LIST = "layer_challenge_list";
mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST = "layer_challenge_stage_list";
mc.MainScreen.LAYER_BLOOD_CASTLE_STAGE_LIST = "layer_blood_castle_stage_list";
mc.MainScreen.LAYER_ARENA = "layer_arena";
mc.MainScreen.LAYER_QUEST_LIST = "layer_quest_list";
mc.MainScreen.LAYER_SHOP_LIST = "layer_shop_list";
mc.MainScreen.LAYER_SHOP = "layer_shop";
mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST = "layer_stage_campaign_list";
mc.MainScreen.LAYER_SELECT_CAMPAIGN_HERO = "layer_select_campaign_hero";
mc.MainScreen.LAYER_SELECT_CAMPAIGN_FRIEND = "layer_select_campaign_friend";
mc.MainScreen.LAYER_QUEST_DETAIL_LIST = "layer_quest_detail_list";
mc.MainScreen.LAYER_BLACK_SMITH = "layer_black_smith";
mc.MainScreen.LAYER_MAIL = "layer_mail";
mc.MainScreen.LAYER_FRIEND = "layer_friend";
mc.MainScreen.LAYER_ARENA_RANKING = "layer_arena_ranking";
mc.MainScreen.LAYER_ARENA_REWARDS = "layer_arena_rewards";
mc.MainScreen.LAYER_ARENA_RECORD = "layer_arena_record";
mc.MainScreen.LAYER_FRIEND_SOLO_RECORD = "layer_friend_solo_record";
mc.MainScreen.LAYER_DAILY_EVENT = "layer_daily_event";
mc.MainScreen.LAYER_PAGES_EVENT = "layer_pages_event";
mc.MainScreen.LAYER_WORLD_BOSS = "layer_world_boss";
mc.MainScreen.LAYER_WORLD_BOSS_RANKING = "layer_world_boss_ranking";
mc.MainScreen.LAYER_GUILD_BOSS_RANKING = "layer_guild_boss_ranking";
mc.MainScreen.LAYER_LUCKY_SPIN = "layer_lucky_spin";
mc.MainScreen.LAYER_SEASON_EVENT = "layer_season_event";
mc.MainScreen.LAYER_GUILD_SEARCH = "layer_guild_search";
mc.MainScreen.LAYER_GUILD_SEARCH_MORE = "layer_guild_search_more";
mc.MainScreen.LAYER_GUILD_REQUEST_JOIN = "layer_guild_request_join";
mc.MainScreen.LAYER_GUILD_DONATE_INFO = "layer_guild_donation_info";
mc.MainScreen.LAYER_GUILD_MANAGER = "layer_guild_manager";
mc.MainScreen.LAYER_GUILD_FLAG = "layer_guild_flag";
mc.MainScreen.LAYER_GUILD_EDIT = "layer_guild_edit";
mc.MainScreen.LAYER_GUILD_BOSS = "layer_guild_boss";
mc.MainScreen.LAYER_IN_APP_PACKAGE_LIST = "layer_inapp_package_list";
mc.MainScreen.LAYER_RELIC_ARENA = "layer_relic_arena";
mc.MainScreen.LAYER_SELECT_ARENA = "layer_select_arena";
mc.MainScreen.LAYER_JOINER_LIST_RELIC_ARENA = "layer_joiner_list_relic_arena";
mc.MainScreen.LAYER_PICK_HERO_RELIC_ARENA = "layer_pick_hero_relic_arena";
mc.MainScreen.LAYER_ILLUSION = "layer_Illusion";
mc.MainScreen.LAYER_RELIC_ARENA_RECORD = "layer_relic_arena_record";
mc.MainScreen.LAYER_CREATE_RELIC_MATCH = "layer_create_relic_match";
mc.MainScreen.LAYER_STAGE_LIST_WORLD_CHALLENGE = "layer_stage_list_world_challenge";

mc.MainBaseLayer = cc.Node.extend({

    parseCCStudio: function (urlOrNode) {
        return mc.parseCCStudioNode(this, urlOrNode);
    },

    onStart: function () {
    },

    onFade: function (isIn, duration) {
    },

    onLayerShow: function () {
    },

    onTriggerTutorial: function () {
    },

    traceDataChange: function (glueObject, cb) {
        if (!this.__arrTrackingKey) {
            this.__arrTrackingKey = [];
        }
        var trackingKey = bb.director.trackGlueObject(glueObject, cb);
        this.__arrTrackingKey.push(trackingKey);
    },

    onEnterTransitionDidFinish: function () {
        this._super();
        this.onLayerShow();
        this.getMainScreen().enableInput(false);
        cc.log("enableInput false;");
        this.getMainScreen().runAction(cc.sequence([cc.delayTime(0.2), cc.callFunc(function () {
            this.onTriggerTutorial();
            this.traceDataChange(mc.GameData.tutorialManager, function () {
                this.onTriggerTutorial();
            }.bind(this));
            cc.log("enableInput true;");
            this.getMainScreen().enableInput(true);
        }.bind(this))]));
    },

    onLayerClose: function () {
    },

    onLayerClearStack: function () {
    },

    onExit: function () {
        this._super();
        if (this.__arrTrackingKey) {
            for (var i = 0; i < this.__arrTrackingKey.length; i++) {
                bb.director.unTrackGlueObject(this.__arrTrackingKey[i]);
            }
        }
    },

    getRootNode: function () {
        return this.getChildByName("root");
    },

    getMainScreen: function () {
        return this.getParent().getParent();
    },

    getLayerId: function () {
        return null;
    },

    isCache: function () {
        return false;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isConfirmExit : function(){
        return false;
    },

    isShowTip: function () {
        return true;
    },

    loadMoreURL: function (arrURL, cb, progressCb) {
        if (!cc.sys.isNative) {
            cc.loader.load(arrURL, function (result, count, loadedCount) {
                var percent = (loadedCount / count * 100) | 0;
                progressCb && progressCb(percent);
            }, function () {
                cb && cb();
            }.bind(this));
        }
        else {
            cb && cb();
        }
    }

});

mc.LoadingLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();

        this._containerLoading = new ccui.Layout();
        //this._containerLoading.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        //this._containerLoading.setColor(cc.color.BLACK);
        this._containerLoading.width = cc.winSize.width;
        this._containerLoading.height = cc.winSize.height;
        this._containerLoading.setTouchEnabled(true);
        this._containerLoading.setLocalZOrder(9999);

        bb.framework.getGUIFactory().createLoadingAnimation(this._containerLoading);
        this.addChild(this._containerLoading);
    },


    onEnterTransitionDidFinish: function () {
        this._super();
        this.onLoading();
    },

    onLoading: function () {
    },

    onLoadDone: function (data) {
    },

    performDone: function (data) {
        var self = this;
        this.stopAllActions();
        if (self._containerLoading) {
            self._containerLoading.removeFromParent();
            self._containerLoading = null;
        }
        self.onLoadDone(data);
    },

    enableTimeOut: function (timeOut) {

    }

});
mc.MainScreen.FADE_DURATION = 0.5;