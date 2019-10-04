/**
 * Created by long.nguyen on 11/15/2017.
 */

var flagDir = "UI_Asset_Flag/ico_flag/colour_base/";
var flags = ["guildflag_green.png", "guildflag_mix1.png", "guildflag_purple.png", "guildflag_red.png"];
var iconDir = "UI_Asset_Flag/ico_flag/symbol/";
var icons = ["symbol_1.png", "symbol_2.png", "symbol_3.png", "symbol_4.png"];

mc.ArenaRankingLayer = mc.LoadingLayer.extend({

    ctor: function () {
        this._super();

        var root = this._root = this.parseCCStudio(res.layer_arena_ranking);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = this._imgTitle = rootMap["imgTitle"];
        var tabMyLeague = this._tabMyLeague = rootMap["tabMyLeague"];
        var tabMyLeaguePassive = this._tabMyLeaguePassive = rootMap["tabMyLeaguePassive"];
        var tabFriendLeague = this._tabFriendLeague = rootMap["tabFriendLeague"];
        var tabFriendLeaguePassive = this._tabFriendLeaguePassive = rootMap["tabFriendLeaguePassive"];
        var tabTopLeague = this._tabTopLeague = rootMap["tabTopLeague"];
        var tabTopLeaguePassive = this._tabTopLeaguePassive = rootMap["tabTopLeaguePassive"];
        var tabTopClan = this._tabTopClan = rootMap["tabTopClan"];
        var tabTopClanPassive = this._tabTopClanPassive = rootMap["tabTopClanPassive"];
        var lvlMyLeague = this._lvlMyLeague = rootMap["lvlMyLeague"];
        var lvlFriendLeague = this._lvlFriendLeague = rootMap["lvlFriendLeague"];
        var lvlTopLeague = this._lvlTopLeague = rootMap["lvlTopLeague"];
        var lvlTopClan = this._lvlTopClan = rootMap["lvlTopClan"];
        var cellRank = this._cellRank = rootMap["cellRank"];
        var cellClanRank = this._cellClanRank = rootMap["cellRankClan"];
        var btnInfo = this._btnInfo = rootMap["btnInfo"];
        var nodeBrk = rootMap["nodeBrk"];
        cellRank.setVisible(false);
        cellClanRank.setVisible(false);
        var panelBottom = rootMap["panelBottom"];

        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        var blackPanel = mc.view_utility.createBlackPanel();
        blackPanel.anchorY = 0;
        nodeBrk.addChild(sprBrk);
        nodeBrk.addChild(blackPanel);

        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblRanking"));



        if(mc.enableReplaceFontBM())
        {
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabMyLeague.getChildByName("lbl")).setString(mc.dictionary.getGUIString("My League"));
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabMyLeaguePassive.getChildByName("lbl")).setString(mc.dictionary.getGUIString("My League"));
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabFriendLeague.getChildByName("lbl")).setString(mc.dictionary.getGUIString("lblFriends"));
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabFriendLeaguePassive.getChildByName("lbl")).setString(mc.dictionary.getGUIString("lblFriends"));
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabTopLeague.getChildByName("lbl")).setString(mc.dictionary.getGUIString("Top Player"));
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabTopLeaguePassive.getChildByName("lbl")).setString(mc.dictionary.getGUIString("Top Player"));
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabTopClan.getChildByName("lbl")).setString(mc.dictionary.getGUIString("lblGuild"));
            mc.view_utility.replaceBitmapFontAndApplyTextStyle(tabTopClanPassive.getChildByName("lbl")).setString(mc.dictionary.getGUIString("lblGuild"));
        }
        else
        {
            tabMyLeague.getChildByName("lbl").setString(mc.dictionary.getGUIString("My League"));
            tabMyLeaguePassive.getChildByName("lbl").setString(mc.dictionary.getGUIString("My League"));
            tabFriendLeague.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblFriends"));
            tabFriendLeaguePassive.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblFriends"));
            tabTopLeague.getChildByName("lbl").setString(mc.dictionary.getGUIString("Top Player"));
            tabTopLeaguePassive.getChildByName("lbl").setString(mc.dictionary.getGUIString("Top Player"));
            tabTopClan.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblGuild"));
            tabTopClanPassive.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblGuild"));
        }

        tabMyLeaguePassive.registerTouchEvent(function () {
            this._btnInfo.setVisible(false);
            this.selectTab(tabMyLeague.getName());
        }.bind(this));

        tabFriendLeaguePassive.registerTouchEvent(function () {
            this._btnInfo.setVisible(false);
            this.selectTab(tabFriendLeague.getName());
        }.bind(this));

        tabTopLeaguePassive.registerTouchEvent(function () {
            this._btnInfo.setVisible(false);
            this.selectTab(tabTopLeague.getName());
        }.bind(this));

        tabTopClanPassive.registerTouchEvent(function () {
            this._btnInfo.setVisible(true);
            this.selectTab(tabTopClan.getName());
            //mc.view_utility.showComingSoon();
        }.bind(this));

        btnInfo.registerTouchEvent(function()
        {
            new mc.ClanArenaRulesDialog().show();
        }.bind(this));

        this.selectTab(tabMyLeague.getName());
    },

    onLoading: function () {
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.getTopArena(0, function (arrRanker) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (arrRanker) {
                this.performDone(arrRanker);
            }
        }.bind(this));
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            var focusCell = null;
            for (var i = 0; i < arrRanker.length; i++) {
                var cell = this._reloadCell(this._cellRank.clone(), arrRanker[i]);
                cell._isPlayer && (focusCell = cell);
                this._lvlMyLeague.pushBackCustomItem(cell);
            }
            focusCell && bb.utility.scrollTo(this._lvlMyLeague, focusCell.y + this._lvlMyLeague.height * 0.5, 0.1);
        }
    },

    selectTab: function (tabName) {
        this._tabMyLeague.setVisible(false);
        this._tabFriendLeague.setVisible(false);
        this._tabTopLeague.setVisible(false);
        this._tabMyLeaguePassive.setVisible(false);
        this._tabFriendLeaguePassive.setVisible(false);
        this._tabTopClanPassive.setVisible(false);
        this._tabTopLeaguePassive.setVisible(false);
        this._lvlMyLeague.setVisible(false);
        this._lvlFriendLeague.setVisible(false);
        this._lvlTopLeague.setVisible(false);
        this._lvlTopClan.setVisible(false);

        if (tabName === this._tabMyLeague.getName()) {
            this._tabMyLeague.setVisible(true);
            this._tabFriendLeaguePassive.setVisible(true);
            this._tabTopLeaguePassive.setVisible(true);
            this._tabTopClanPassive.setVisible(true);

            this._lvlMyLeague.setVisible(true);
        }
        else if (tabName === this._tabFriendLeague.getName()) {
            this._tabFriendLeague.setVisible(true);
            this._tabMyLeaguePassive.setVisible(true);
            this._tabTopLeaguePassive.setVisible(true);
            this._tabTopClanPassive.setVisible(true);

            this._lvlFriendLeague.setVisible(true);
            if (this._lvlFriendLeague.getItems().length === 0) {
                var loadId = mc.view_utility.showLoadingDialog();
                mc.protocol.listFriendsArena(function (arrRanker) {
                    mc.view_utility.hideLoadingDialogById(loadId);
                    if (arrRanker) {
                        var focusCell = null;
                        for (var i = 0; i < arrRanker.length; i++) {
                            var cell = this._reloadCell(this._cellRank.clone(), arrRanker[i]);
                            cell._isPlayer && (focusCell = cell);
                            this._lvlFriendLeague.pushBackCustomItem(cell);
                        }
                        focusCell && bb.utility.scrollTo(this._lvlFriendLeague, focusCell.y + this._lvlFriendLeague.height * 0.5);
                    }
                }.bind(this));
            }
        }
        else if (tabName === this._tabTopLeague.getName()) {
            this._tabTopLeague.setVisible(true);
            this._tabMyLeaguePassive.setVisible(true);
            this._tabFriendLeaguePassive.setVisible(true);
            this._tabTopClanPassive.setVisible(true);

            this._lvlTopLeague.setVisible(true);
            if (this._lvlTopLeague.getItems().length === 0) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getTopArena("S", function (arrRanker) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (arrRanker) {
                        var focusCell = null;
                        for (var i = 0; i < arrRanker.length; i++) {
                            var cell = this._reloadCell(this._cellRank.clone(), arrRanker[i]);
                            cell._isPlayer && (focusCell = cell);
                            this._lvlTopLeague.pushBackCustomItem(cell);
                        }
                        focusCell && bb.utility.scrollTo(this._lvlTopLeague, focusCell.y + this._lvlTopLeague.height * 0.5);
                    }
                }.bind(this));
            }
        }
        else  if (tabName === this._tabTopClan.getName()) {
            this._tabTopClan.setVisible(true);
            this._tabTopLeaguePassive.setVisible(true);
            this._tabMyLeaguePassive.setVisible(true);
            this._tabFriendLeaguePassive.setVisible(true);

            this._lvlTopClan.setVisible(true);
            if (this._lvlTopClan.getItems().length === 0) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getTopClanArena(function (arrRanker) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (arrRanker) {
                        //var focusCell = null;
                        for (var i = 0; i < arrRanker.length; i++) {
                            var cell = this._reloadClanCell(this._cellClanRank.clone(), arrRanker[i]);
                            //cell._isPlayer && (focusCell = cell);
                            this._lvlTopClan.pushBackCustomItem(cell);
                        }
                        //focusCell && bb.utility.scrollTo(this._lvlTopClan, focusCell.y + this._lvlTopClan.height * 0.5);
                    }
                }.bind(this));
            }
        }
    },

    _reloadClanCell: function (cell, info) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        var brk = cellMap["brk"];
        var lblName = cellMap["lblName"];
        var lblLv = cellMap["lblLv"];
        var lblMember = cellMap["lblMember"];
        var lblPoints = cellMap["pnlCup"].getChildByName("lblPoints");
        var btnInfo = cellMap["btnInfo"];
        var flag = cellMap["flag"];
        var flag_icon = cellMap["flag_icon"];
        var imgRank = cellMap["imgRank"];
        var lblRank = cellMap["lblRank"];
        var lblNumRank = cellMap["lblNumRank"];

        lblName.setString(info["name"]);
        lblRank.setString(mc.dictionary.getGUIString("Rank"))
        btnInfo.setString(mc.dictionary.getGUIString("lblInfo"));

        lblMember.setColor(mc.color.BROWN_SOFT);
        //lblLv.setColor(mc.color.BROWN_SOFT);
        lblName.setColor(mc.color.WHITE_NORMAL);
        lblRank.setColor(mc.color.BROWN_SOFT);
        lblNumRank.setColor(mc.color.BROWN_SOFT);
        if(mc.enableReplaceFontBM())
        {
            lblLv = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLv);
            mc.view_utility.applyLevelStyle(lblLv);
            lblPoints = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPoints)
            mc.view_utility.applyArenaPointStyle(lblPoints);
            lblMember = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblMember)
            mc.view_utility.applyMemGuildStyle(lblMember);
            lblMember.setColor(mc.color.WHITE_NORMAL);
        }

        lblLv.setString(mc.dictionary.getGUIString("Level") +" " + info["level"]);
        lblMember.setString(info["memberNo"] + "/" + info["maxMemberNo"]);
        lblPoints.setString(bb.utility.formatNumber(info["arenaPoint"]));



        lblRank.setVisible(false);
        lblNumRank.setVisible(false);
        imgRank.setVisible(false);
        var rank = info["arenaRank"];
        if( !rank ){
            lblRank.setVisible(false);
            lblNumRank.setVisible(false);
        }
        else{
            if (rank <= 3) {
                if (rank === 1) {
                    imgRank.loadTexture("icon/ico_rank_gold.png", ccui.Widget.PLIST_TEXTURE);
                }
                else if (rank === 2) {
                    imgRank.loadTexture("icon/ico_rank_silver.png", ccui.Widget.PLIST_TEXTURE);
                }
                else if (rank === 3) {
                    imgRank.loadTexture("icon/ico_rank_bronze.png", ccui.Widget.PLIST_TEXTURE);
                }
                imgRank.setVisible(true);
                imgRank.ignoreContentAdaptWithSize(true);
            }
            else {
                lblRank.setVisible(true);
                lblNumRank.setVisible(true);
                lblNumRank.setString(bb.utility.formatNumber(rank));
            }
        }

        if (mc.GameData.guildManager.getGuildId() === info["id"]) {
            brk.loadTexture("patch9/pnl_name_pink.png", ccui.Widget.PLIST_TEXTURE);
            //cell._isPlayer = true;
        }

        flag.loadTexture(flagDir + flags[info["flag"]], ccui.Widget.PLIST_TEXTURE);
        flag_icon.loadTexture(iconDir + icons[info["logo"]], ccui.Widget.PLIST_TEXTURE);

        //btnInfo.registerTouchEvent(function () {
        //    //mc.view_utility.showComingSoon();
        //    var dialog = new mc.GuildPopupInfoDialog(info);
        //    //dialog.set
        //    dialog.setJoinButtonVisible(false);
        //    dialog.show();
        //
        //}.bind(this));
        cell.registerTouchEvent(function () {
            //mc.view_utility.showComingSoon();
            var dialog = new mc.GuildPopupInfoDialog(info);
            //dialog.set
            dialog.setJoinButtonVisible(false);
            dialog.show();

        }.bind(this));
        cell.setVisible(true);
        return cell;
    },

    _reloadCell: function (cell, rankerInfo) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });

        var brk = cellMap["brk"];
        var lblName = cellMap["lblName"];
        var lbl = cellMap["lbl"];
        var lblWin = cellMap["lblWin"];
        var lblPoints = cellMap["lblPoints"];
        var lblLevel = cellMap["lblLevel"];
        var imgRank = cellMap["imgRank"];
        var lblNumRank = cellMap["lblNumRank"];
        var lblRank = cellMap["lblRank"];
        var lblPower = cellMap["lblPower"];
        var iconLeague = cellMap["iconLeague"];
        var pnlGuild = cellMap["pnlGuild"];


        var pnlGuild = cellMap["pnlGuild"]
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");
        var guildInfo = rankerInfo.guild_info
        var name = mc.RankingManager.getRankerName(rankerInfo);
        if (guildInfo) {
            var nameWidth = (lblName.fontSize / 1.621) * name.length;
            pnlGuild.x = lblName.x + nameWidth;
            pnlGuild.setVisible(true);
            flag.loadTexture(flagDir + flags[guildInfo["flag"]], ccui.Widget.PLIST_TEXTURE);
            flag_icon.loadTexture(iconDir + icons[guildInfo["icon"] || guildInfo["logo"]], ccui.Widget.PLIST_TEXTURE);
            //var flagData = mc.GameData.guiState.getGuildCreateState().flag;
            //flag_icon.loadTexture(iconDir + icons[flagData["icon"]], ccui.Widget.PLIST_TEXTURE);
            if(guildInfo.guildId && mc.GameData.guildManager.getGuildId()&& guildInfo.guildId === mc.GameData.guildManager.getGuildId())
            {
                lblGuildName.setColor(mc.color.GREEN_NORMAL);
            }
            else {
                lblGuildName.setColor(mc.color.WHITE_NORMAL);
            }
            lblGuildName.setString(guildInfo.name);
        }
        else {
            pnlGuild.setVisible(false);
        }

        imgRank.setVisible(false);
        lblRank.setVisible(false);
        lblNumRank.setVisible(false);
        var isVIP = mc.RankingManager.getRankerVIP(rankerInfo);
        var avt = mc.view_utility.createAvatarPlayer(parseInt(mc.RankingManager.getRankerAvatar(rankerInfo)),isVIP);
        avt.x = cell.width * 0.125;
        avt.y = cell.height * 0.5;
        cell.addChild(avt);

        avt.registerTouchEvent(function () {
            mc.view_utility.showUserInfo(rankerInfo["gameHeroId"], rankerInfo);
        });

        lblPower.setColor(mc.color.BROWN_SOFT);
        lblNumRank.setColor(mc.color.BROWN_SOFT);
        lblRank.setColor(mc.color.BROWN_SOFT);

        if(mc.enableReplaceFontBM())
        {
            lblPoints = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPoints);
            mc.view_utility.applyArenaPointStyle(lblPoints);
            lblPower = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPower);
            mc.view_utility.applyPowerStyle(lblPower);
            lblPower.setColor(mc.color.BROWN_SOFT);
            lblLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLevel);
            mc.view_utility.applyLevelStyle(lblLevel);
            lblWin = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblWin);
            mc.view_utility.applyArenaWinNoStyle(lblWin);

        }

        lblRank.setString(mc.dictionary.getGUIString("lblRank"));
        lblName.setString(mc.RankingManager.getRankerName(rankerInfo));
        lblPoints.setString(bb.utility.formatNumber(mc.RankingManager.getRankerTrophy(rankerInfo)));
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + mc.RankingManager.getRankerLevel(rankerInfo));
        lblWin.setString(bb.utility.formatNumber(mc.RankingManager.getRankerWinNo(rankerInfo)));
        lblPower.setString(bb.utility.formatNumber(mc.RankingManager.getRankerTeamPower(rankerInfo)));
        iconLeague.ignoreContentAdaptWithSize(true);
        iconLeague.loadTexture(mc.const.MAP_LEAGUE_BY_CODE[mc.RankingManager.getRankerLeagueKey(rankerInfo)]["url"], ccui.Widget.PLIST_TEXTURE);
        var rank = mc.RankingManager.getRankerRank(rankerInfo);
        if( !rank ){
            lblRank.setVisible(false);
            lblNumRank.setVisible(false);
        }
        else{
            if (rank <= 3) {
                if (rank === 2) {
                    imgRank.loadTexture("icon/ico_rank_silver.png", ccui.Widget.PLIST_TEXTURE);
                }
                else if (rank === 3) {
                    imgRank.loadTexture("icon/ico_rank_bronze.png", ccui.Widget.PLIST_TEXTURE);
                }
                imgRank.setVisible(true);
                imgRank.ignoreContentAdaptWithSize(true);
            }
            else {
                lblRank.setVisible(true);
                lblNumRank.setVisible(true);
                lblNumRank.setString(bb.utility.formatNumber(rank));
            }
        }
        if (mc.GameData.playerInfo.getName() === mc.RankingManager.getRankerId(rankerInfo)) {
            brk.loadTexture("patch9/pnl_name_pink.png", ccui.Widget.PLIST_TEXTURE);
            cell._isPlayer = true;
        }
        cell.setVisible(true);
        return cell;
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_ARENA_RANKING;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});

mc.RankScreen.createAvatarPlayer = function (avatarIndex ) {

};