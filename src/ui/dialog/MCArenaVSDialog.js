/**
 * Created by long.nguyen on 6/13/2018.
 */
var flagDir = "UI_Asset_Flag/ico_flag/colour_base/";
var flags = ["guildflag_green.png", "guildflag_mix1.png", "guildflag_purple.png", "guildflag_red.png"];
var iconDir = "UI_Asset_Flag/ico_flag/symbol/";
var icons = ["symbol_1.png", "symbol_2.png", "symbol_3.png", "symbol_4.png"];

mc.ArenaVSDialog = bb.Dialog.extend({

    ctor: function () {
        this._super();

        var node = ccs.load(res.widget_arena_vs_dialog, "res/").node;
        this.addChild(node);

        var root = this._rootView = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var cellRecord1 = this._cellRecord1 = rootMap["cellRecord1"];
        var cellRecord2 = this._cellRecord2 = rootMap["cellRecord2"];
        var cellRecord3 = this._cellRecord3 = rootMap["cellRecord3"];
        var btnRefresh = this._btnRefresh = rootMap["btnRefresh"];
        var btnBack = rootMap["btnBack"];
        var nodeAsset = rootMap["nodeAsset"];

        var self = this;
        var priceInfo = mc.ItemStock.createJsonItemZen(mc.const.SEARCH_ARENA_OPPONENT_GOLD);
        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        nodeAsset.addChild(mc.view_utility.createAssetView(priceInfo));
        btnRefresh.registerTouchEvent(function () {
            var isShow = mc.view_utility.showExchangingIfAny(priceInfo);
            if (!isShow) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.searchArenaOpponent(function (data) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (data) {
                        self._reloadAll();
                        self._showAllCell();
                    }
                });
            }
        });

        this._reloadAll();

        this._rootView.setCascadeOpacityEnabled(true);
        btnBack.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    },

    _showAllCell: function () {
        var dur = 0.25;
        this._cellRecord1.opacity = 0;
        this._cellRecord2.opacity = 0;
        this._cellRecord3.opacity = 0;

        this._btnRefresh.setEnabled(false);
        this._btnRefresh.setColor(mc.color.BLACK_DISABLE_SOFT);
        this._cellRecord1.runAction(cc.sequence([cc.delayTime(0.1), cc.fadeIn(dur)]));
        this._cellRecord2.runAction(cc.sequence([cc.delayTime(0.2), cc.fadeIn(dur)]));
        this._cellRecord3.runAction(cc.sequence([cc.delayTime(0.3), cc.fadeIn(dur), cc.callFunc(function () {
            this._btnRefresh.setEnabled(true);
            this._btnRefresh.setColor(mc.color.WHITE_NORMAL);
        }.bind(this))]));
    },

    _reloadAll: function () {
        this._reloadCell(this._cellRecord1, 0);
        this._reloadCell(this._cellRecord2, 1);
        this._reloadCell(this._cellRecord3, 2);
    },

    _reloadCell: function (cell, index) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });

        var lblName = cellMap["lblName"];
        var lblLevel = cellMap["lblLevel"];
        var lblPower = cellMap["lblPower"];
        var lblTrophy = cellMap["lblTrophy"];
        var btnFight = cellMap["btnFight"];
        var lblLeagueName = cellMap["lblLeagueName"];
        var nodeLeague = cellMap["nodeLeague"];
        var nodeHero = cellMap["nodeHero"];
        var lblGainWin = cellMap["lblGainWin"];
        var lblGainLose = cellMap["lblGainLose"];

        var pnlGuild = cellMap["pnlGuild"]
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");

        nodeHero.removeAllChildren();
        nodeLeague.removeAllChildren();
        lblLeagueName.setColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblTrophy.setColor(mc.color.BROWN_SOFT);

        btnFight.setString(mc.dictionary.getGUIString("lblFight"));
        nodeHero.scale = 0.685;

        var self = this;
        var arenaManager = mc.GameData.arenaManager;
        var oppInfo = mc.GameData.arenaManager.getSearchOpponentByIndex(index);
        var oppName = mc.ArenaManager.getOpponentName(oppInfo);
        var oppPower = mc.ArenaManager.getOpponentTeamPower(oppInfo);
        var oppLeague = mc.ArenaManager.getOpponentLeague(oppInfo);
        var oppArrHeroInfo = mc.ArenaManager.getOpponentArrayHeroes(oppInfo);
        var oppTeamFormation = mc.ArenaManager.getOpponentTeamFormation(oppInfo);
        var oppLeaderIndex = mc.ArenaManager.getOpponentLeaderIndex(oppInfo);
        var oppWinPoint = mc.ArenaManager.getOpponentWinPoint(oppInfo);
        var oppLosePoint = mc.ArenaManager.getOpponentLosePoint(oppInfo);
        var oppArenaPoint = mc.ArenaManager.getOpponentArenaPoint(oppInfo);
        var oppGuildInfo = mc.ArenaManager.getOpponentGuild(oppInfo);
        var level = mc.ArenaManager.getOpponentLevel(oppInfo);

        mc.view_utility.layoutTeamFormation({
            arrTeamFormation: oppTeamFormation,
            leaderIndex: oppLeaderIndex,
            mapHeroInfo: bb.utility.arrayToMap(oppArrHeroInfo, function (heroInfo) {
                return mc.HeroStock.getHeroId(heroInfo);
            })
        }, {
            nodeHero: nodeHero
        }, true);

        lblName.setString(oppName);
        if (oppGuildInfo) {
            var nameWidth = (lblName.fontSize / 1.621) * oppName.length;
            pnlGuild.x = lblName.x + nameWidth + 5;
            pnlGuild.setVisible(true);
            flag.loadTexture(flagDir + flags[oppGuildInfo["flag"]], ccui.Widget.PLIST_TEXTURE);
            flag_icon.loadTexture(iconDir + icons[oppGuildInfo["icon"] || oppGuildInfo["logo"]], ccui.Widget.PLIST_TEXTURE);
            //var flagData = mc.GameData.guiState.getGuildCreateState().flag;
            //flag_icon.loadTexture(iconDir + icons[flagData["icon"]], ccui.Widget.PLIST_TEXTURE);
            if(oppGuildInfo.guildId && mc.GameData.guildManager.getGuildId()&& oppGuildInfo.guildId === mc.GameData.guildManager.getGuildId())
            {
                lblGuildName.setColor(mc.color.GREEN_NORMAL);
            }
            else {
                lblGuildName.setColor(mc.color.WHITE_NORMAL);
            }
            lblGuildName.setString(oppGuildInfo.name);
        }
        else {
            pnlGuild.setVisible(false);
        }
        lblPower.setString(bb.utility.formatNumber(oppPower));
        var leagueInfo = mc.const.MAP_LEAGUE_BY_CODE[oppLeague];
        nodeLeague.addChild(new ccui.ImageView(leagueInfo.url, ccui.Widget.PLIST_TEXTURE));
        lblLeagueName.setString(leagueInfo.name);

        lblGainWin.setColor(mc.color.GREEN_NORMAL);
        btnFight.registerTouchEvent(function (btnFight) {
            if (mc.GameData.playerInfo.getArenaTicket() < 1) {
                mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtNoTicketForAFight"), function () {
                    mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET);
                }.bind(this));
            }
            else {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.fightArenaOpponent(btnFight.getUserData(), function (data) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (data) {
                        mc.GUIFactory.showArenaBattleScreen();
                    }
                });
            }
        });
        var opponentId = mc.ArenaManager.getOpponentHeroId(oppInfo);
        if(opponentId.startsWith("NPC")){
            cc.log("-------------");
        }
        btnFight.setUserData(opponentId);

        lblGainWin.setString(oppWinPoint > 0 ? ("+" + oppWinPoint) : "" + oppWinPoint);
        lblGainLose.setString(oppLosePoint > 0 ? "-" + oppLosePoint : "" + oppLosePoint);
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + level);
        lblTrophy.setString(bb.utility.formatNumber(oppArenaPoint));

        nodeHero.setCascadeOpacityEnabled(true);
        nodeLeague.setCascadeOpacityEnabled(true);
        cell.setCascadeOpacityEnabled(true);
    },

    overrideShowAnimation: function () {
        this._showAllCell();
        return 0.5;
    },

    overrideCloseAnimation: function () {
        this._rootView.runAction(cc.fadeOut(0.25));
        return 0.25;
    },

    onShow: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_ARENA_OPPONENT);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                var btnFight = this._cellRecord2.getChildByName("btnFight");
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(btnFight)
                    .setCharPositionY(cc.winSize.height * 0.7)
                    .show();
            }
        }
    }

});