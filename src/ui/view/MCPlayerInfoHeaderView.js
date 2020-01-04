/**
 * Created by long.nguyen on 6/28/2017.
 */
mc.PlayerInfoHeaderView = cc.Node.extend({

    ctor: function (parseNode) {
        this._super();

        var root = mc.parseCCStudioNode(this, parseNode);
        var mapChild = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var lblLevel = mapChild["lblLv"];
        var icon = mapChild["imgLeague"];

        var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_ico_logo_json, res.spine_ico_logo_atlas, 1.0);
        root.addChild(iconAnimate);
        iconAnimate.setLocalZOrder(1);
        iconAnimate.setPosition(icon.x, icon.y);
        iconAnimate.setAnimation(0, "idle", true);
        icon.removeFromParent();

        var lblName = mapChild["lblName"];
        var brkExpProgress = mapChild["brkExpProgress"];
        var lblArenaTicket = mapChild["widgetArena"].getChildByName("lblValue");
        var lblStaminaInfo = mapChild["widgetStamina"].getChildByName("lblValue");
        var lblBless = mapChild["widgetDiamond"].getChildByName("lblValue");
        var lblMoney = mapChild["widgetMoney"].getChildByName("lblValue");
        var lblHeart = mapChild["widgetHeart"].getChildByName("lblValue");
        var iconHeart = mapChild["widgetHeart"].getChildByName("Image_48");
        var iconPremium = mapChild["iconVIP"];
        iconPremium.setVisible(false);
        iconHeart.loadTexture("res/png/consumable/reliccoins.png", ccui.Widget.LOCAL_TEXTURE);
        iconHeart.scale = 1.5;


        var progressExp = new cc.ProgressTimer(new cc.Sprite("#bar/Main_Menu_exp_inside.png"));
        progressExp.setCascadeOpacityEnabled(true);
        progressExp.barChangeRate = cc.p(1.0, 0.0);
        progressExp.midPoint = cc.p(0.0, 1.0);
        progressExp.type = cc.ProgressTimer.TYPE_BAR;
        root.addChild(progressExp);
        progressExp.x = brkExpProgress.x;
        progressExp.y = brkExpProgress.y;
        if(mc.enableReplaceFontBM())
        {
            lblLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLevel);
        }

        lblLevel.setColor(mc.color.BROWN_SOFT);

        mapChild["widgetArena"].registerTouchEvent(function () {
            if (mc.GameData.playerInfo.getArenaTicket() < mc.const.MAX_ARENA_TICKET) {
                mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET);
            } else {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("lblArenaTicketFull"));
            }
        });
        var lblDurPerTicketArena = mapChild["widgetArena"].getChildByName("lblSubValue");
        mapChild["widgetStamina"].registerTouchEvent(function () {
            if (mc.GameData.playerInfo.getStamina() < mc.GameData.playerInfo.getMaxStamina()) {
                mc.ExchangeByBlessDialog.showExchange(mc.const.REFRESH_FUNCTION_BUY_STAMINA);
            } else {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("lblStaminaFull"));
            }
        });
        var lblDurPerStamina = mapChild["widgetStamina"].getChildByName("lblSubValue");
        mapChild["widgetDiamond"].registerTouchEvent(function () {
            mc.IAPShopDialog.showIAPBless();

        });
        mapChild["widgetMoney"].registerTouchEvent(function () {
            mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNC_ZEN);
        });
        mapChild["widgetHeart"].registerTouchEvent(function () {
            //self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_FRIEND);
            mc.IAPShopDialog.showIAPPromo();
        });

        lblDurPerTicketArena.setColor(mc.color.GREEN_NORMAL);
        lblDurPerStamina.setColor(mc.color.GREEN_NORMAL);

        var _animateChanger = function () {
            var assetChanger = mc.GameData.assetChanger;
            var funcObj = {};
            funcObj[mc.const.ITEM_INDEX_ZEN] = function (oldZen, zen) {
                lblMoney.runAction(cc.countText(1.0, oldZen, zen));
            };
            funcObj[mc.const.ITEM_INDEX_BLESS] = function (oldBless, bless) {
                lblBless.runAction(cc.countText(1.0, oldBless, bless));
            };
            funcObj[mc.const.ITEM_INDEX_ARENA_TICKET] = function (oldCoin, coin) {
                lblArenaTicket && lblArenaTicket.setString(coin + "/" + mc.const.MAX_ARENA_TICKET);
                if (coin === mc.const.MAX_ARENA_TICKET)
                    lblDurPerTicketArena.setString(mc.dictionary.getGUIString("lblShortFull"));
            };
            //funcObj[mc.const.ITEM_INDEX_FRIEND_POINTS] = function (oldCoin, coin) {
            //    lblHeart && lblHeart.runAction(cc.countText(1.0, oldCoin, coin));
            //};
            funcObj[mc.const.ITEM_INDEX_RELIC_COIN] = function (oldCoin, coin) {
                lblHeart && lblHeart.runAction(cc.countText(1.0, oldCoin, coin));
            };
            assetChanger.performChanging(funcObj);
        };

        var _updatePlayerInfo = function () {
            var playerInfo = mc.GameData.playerInfo;
            if (playerInfo) {
                lblHeart.setString(bb.utility.formatNumber(playerInfo.getRelicCoin()));
                lblMoney.setUserData(playerInfo.getZen());
                lblMoney.setString(bb.utility.formatNumber(playerInfo.getZen()));
                lblArenaTicket.setString(Math.floor(playerInfo.getArenaTicket()) + "/" + mc.const.MAX_ARENA_TICKET);
                lblName.setString(playerInfo.getName());
                lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + playerInfo.getLevel());
                lblBless.setString(bb.utility.formatNumber(playerInfo.getBless()));
                progressExp.setPercentage((playerInfo.getExp() / playerInfo.getMaxExp()) * 100);
                lblStaminaInfo.setString(cc.formatStr("%d/%d",
                    Math.floor(playerInfo.getStamina()), playerInfo.getMaxStamina()));

                //iconPremium.setVisible(playerInfo.isVIP());
                iconPremium.setVisible(false);
            }
        };

        var _updateProgress = function () {
            if (mc.GameData.playerInfo) {
                var msDur = mc.GameData.playerInfo.getDurationProductionPerStamina();
                lblDurPerStamina.setString((msDur != -1) ? mc.view_utility.formatDurationTime2(msDur) : mc.dictionary.getGUIString("lblShortFull"));
                var msDurArenaTicket = mc.GameData.playerInfo.getDurationProductionPerArenaTicket();
                lblDurPerTicketArena.setString((msDurArenaTicket != -1) ? mc.view_utility.formatDurationTime2(msDurArenaTicket) : mc.dictionary.getGUIString("lblShortFull"));
            }
        };

        var _updateLanguage = function () {
            var playerInfo = mc.GameData.playerInfo;
            lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + playerInfo.getLevel());
        };

        _updateProgress();
        _updatePlayerInfo();
        _animateChanger();
        this._assetChangerTrack = bb.director.trackGlueObject(mc.GameData.assetChanger, function () {
            _animateChanger();
        });
        this._playerInfoTrack = bb.director.trackGlueObject(mc.GameData.playerInfo, function () {
            _updatePlayerInfo();
        });

        _updateLanguage();
        this._settingChangerTrack = bb.director.trackGlueObject(mc.storage.settingChanger, function (data) {
            mc.storage.settingChanger.performChanging({
                "language": function (oldLan, newLan) {
                    _updateLanguage();
                }
            }, true);
        });

        this.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function () {
            _updateProgress();

            var playerInfo = mc.GameData.playerInfo;
            if (playerInfo) {
                var stamina = Math.floor(playerInfo.getStamina());
                var maxStamina = playerInfo.getMaxStamina();
                var ticket = Math.floor(playerInfo.getArenaTicket());
                var maxTicket = mc.const.MAX_ARENA_TICKET;
                lblStaminaInfo.setString(cc.formatStr("%d/%d", stamina, maxStamina));
                lblArenaTicket.setString(cc.formatStr("%d/%d", ticket, maxTicket));
                //iconPremium.setVisible(playerInfo.isVIP());
                iconPremium.setVisible(false);
            }
        }.bind(this))]).repeatForever());
    },

    onExit: function () {
        this._super();
        this._assetChangerTrack && bb.director.unTrackGlueObject(this._assetChangerTrack);
        this._playerInfoTrack && bb.director.unTrackGlueObject(this._playerInfoTrack);
        this._settingChangerTrack && bb.director.unTrackGlueObject(this._settingChangerTrack);
    },

    getMainScreen: function () {
        return this.getParent().getParent();
    }

});