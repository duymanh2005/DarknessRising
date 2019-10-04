/**
 * Created by long.nguyen on 12/13/2017.
 */
mc.FriendSoloRecordLayer = mc.LoadingLayer.extend({

    ctor: function () {
        this._super();

        var root = this._root = this.parseCCStudio(res.layer_arena_record);

        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = rootMap["imgTitle"];
        var nodeBrk = rootMap["nodeBrk"];
        var lvRecord = this._lvRecord = rootMap["lvRecord"];
        var cellRecord = this._cellRecord = rootMap["cellRecord"];
        cellRecord.setVisible(false);

        imgTitle.setString(mc.dictionary.getGUIString("lblRecord"));

        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        var blackPanel = mc.view_utility.createBlackPanel();
        blackPanel.anchorY = 0;
        nodeBrk.addChild(sprBrk);
        nodeBrk.addChild(blackPanel);
    },

    //onLayerShow: function () {
    //    var self = this;
    //    var arrStackDialogData = mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN);
    //    if (arrStackDialogData.length > 0) {
    //        for (var i = 0; i < arrStackDialogData.length; i++) {
    //            var dialogData = arrStackDialogData[i];
    //            if (dialogData.id === mc.GUIState.ID_DIALOG_VS) {
    //                self._showRevengeDialog(dialogData.data);
    //            }
    //        }
    //    }
    //},
    //
    //onLayerClose: function () {
    //    var allDialog = bb.director.getAllDialog();
    //    for (var i = 0; i < allDialog.length; i++) {
    //        var dialog = allDialog[i];
    //        if (dialog instanceof mc.DialogVS) {
    //            mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_VS, this._revegingRecordInfo);
    //        }
    //    }
    //},

    onLoading: function () {
        var self = this;
        mc.protocol.getFriendSoloHistory(0, function (result) {
            if (result) {
                this.performDone(result.historyList);
            }
        }.bind(this));
    },

    onLoadDone: function (arrRecordInfo) {
        if (arrRecordInfo) {
            for (var i = 0; i < arrRecordInfo.length; i++) {
                var cell = this._reloadRecord(this._cellRecord.clone(), arrRecordInfo[i]);
                this._lvRecord.pushBackCustomItem(cell);
            }
        }
    },

    _reloadRecord: function (cell, recordInfo) {
        cell.setVisible(true);
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });

        var brk = cellMap["brk"];
        var lblName = cellMap["lblName"];
        var lblAgo = cellMap["lblAgo"];
        var lblLevel = cellMap["lblLevel"];
        var lblGainLeague = cellMap["lblGainLeague"];
        var lblPower = cellMap["lblPower"];
        var lblLeague = cellMap["lblLeague"];
        var imgStatusText = cellMap["imgStatusText"];
        var iconStatus = cellMap["iconStatus"];
        var iconGainLeague = cellMap["iconGainLeague"];
        var brkLeague = cellMap["brkLeague"];

        lblGainLeague.setVisible(false);
        brkLeague.setVisible(false);
        iconGainLeague.setVisible(false);
        var imgSeparator = cellMap["imgSeparator"];

        brk.ignoreContentAdaptWithSize(true);
        iconStatus.ignoreContentAdaptWithSize(true);

        var recordTakePoint = mc.BattleRecordManager.getRecordTakePoint(recordInfo);
        var opponentInfo = mc.BattleRecordManager.getRecordOpponent(recordInfo);

        if(mc.enableReplaceFontBM())
        {
            lblPower = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPower);
            mc.view_utility.applyPowerStyle(lblPower);
            lblLeague = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeague);
            mc.view_utility.applyArenaPointStyle(lblLeague);
            lblLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLevel);
            mc.view_utility.applyLevelStyle(lblLevel);
            lblAgo = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblAgo);
            mc.view_utility.applyRecordTimeAgoStyle(lblAgo);
        }

        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLeague.setColor(mc.color.BROWN_SOFT);
        lblAgo.setColor(mc.color.BROWN_SOFT);
        recordTakePoint > 0 && (lblGainLeague.setColor(mc.color.GREEN_NORMAL));


        lblName.setString(mc.BattleRecordManager.getRecordOpponentName(opponentInfo));
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + mc.BattleRecordManager.getRecordOpponentLevel(opponentInfo));
        lblPower.setString(bb.utility.formatNumber(mc.BattleRecordManager.getRecordOpponentPower(opponentInfo)));
        lblLeague.setString(bb.utility.formatNumber(mc.BattleRecordManager.getRecordOpponentPoint(opponentInfo)));
        lblGainLeague.setString(recordTakePoint > 0 ? ("+" + recordTakePoint) : recordTakePoint);
        lblAgo.setString(mc.view_utility.formatDurationTime(bb.now() - mc.BattleRecordManager.getRecordStartTimeInMs(recordInfo)) + " ago");

        var nodeHero = new cc.Node();
        nodeHero.scale = 0.65;
        nodeHero.x = cell.width * 0.365;
        nodeHero.y = cell.height * 0.42;
        cell.addChild(nodeHero);
        mc.view_utility.layoutTeamFormation({
            arrTeamFormation: mc.BattleRecordManager.getRecordOpponentTeams(opponentInfo),
            leaderIndex: mc.BattleRecordManager.getRecordOpponentLeaderIndex(opponentInfo),
            mapHeroInfo: bb.utility.arrayToMap(mc.BattleRecordManager.getRecordOpponentHeroes(opponentInfo), function (heroInfo) {
                return mc.HeroStock.getHeroId(heroInfo);
            }),
            enableClick: false
        }, {
            nodeHero: nodeHero
        }, true, 10);


        var pnlGuild = cellMap["pnlGuild"];
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");
        var guildInfo = opponentInfo.guild_info;
        var name = opponentInfo.gameHeroName;
        if (guildInfo) {
            var nameWidth = (lblName.fontSize / 1.621) * name.length;
            pnlGuild.x = lblName.x + nameWidth + 5;
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

        var btnReplay = mc.GUIFactory.createButton(mc.dictionary.getGUIString("lblReplay"));
        btnReplay.scale = 0.7;
        btnReplay.x = brkLeague.x;
        btnReplay.y = cell.height * 0.42;
        btnReplay.setUserData(recordInfo);
        btnReplay.registerTouchEvent(function (btnReplay) {
            var recordInfo = btnReplay.getUserData();
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.getFriendSoloReplay(mc.BattleRecordManager.getRecordId(recordInfo), function (data) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (data) {
                    mc.GUIFactory.showRelayFriendBattleScreen();
                }
            });
        });
        if (!mc.BattleRecordManager.canRecordReplay(recordInfo)) {
            btnReplay.setGray(true);
        }
        cell.addChild(btnReplay);

        var y = cell.height * 0.18;
        if (!mc.BattleRecordManager.isRecordWinBattle(recordInfo)) {
            brk.loadTexture("patch9/pnl_name_grey.png", ccui.Widget.PLIST_TEXTURE);
            imgSeparator.loadTexture("patch9/seperation_line_horizon_grey.png", ccui.Widget.PLIST_TEXTURE);
        }
        else {
            imgStatusText.ignoreContentAdaptWithSize(false);
            imgStatusText.loadTexture("text/txt_win.png", ccui.Widget.PLIST_TEXTURE);
            brk.loadTexture("patch9/pnl_name_pink.png", ccui.Widget.PLIST_TEXTURE);
        }
        if (!mc.BattleRecordManager.isAttacker(recordInfo)) {
            iconStatus.loadTexture("icon/ico_defense.png", ccui.Widget.PLIST_TEXTURE);
        }

        var self = this;
        var status = mc.BattleRecordManager.getRecordStatus(recordInfo);
        if (status === mc.BattleRecordManager.STATUS_UNREVENGE) {
            var brk = new ccui.ImageView("patch9/pnl_numberslot_lose.png", ccui.Widget.PLIST_TEXTURE);
            brk.x = brkLeague.x;
            brk.y = y;
            cell.addChild(brk);
            var lbl = brk.setString(mc.dictionary.getGUIString("lblUnavailable"), res.font_UTMBienvenue_none_32_export_fnt);
            lbl.scale = 0.5;
        }
        return cell;
    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_FRIEND_SOLO_RECORD;
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