/**
 * Created by long.nguyen on 12/13/2017.
 */
mc.RelicArenaRecordLayer = mc.LoadingLayer.extend({

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
    //
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
        mc.protocol.getRelicArenaHistoryList(0, function (arrRecordInfo) {
            if (arrRecordInfo) {
                self.performDone(arrRecordInfo);
            }
        });
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
        var lblGainLeague = cellMap["lblRelic"];
        var lblPower = cellMap["lblPower"];
        var lblLeague = cellMap["lblLeague"];
        var imgStatusText = cellMap["imgStatusText"];
        var iconStatus = cellMap["iconStatus"];
        var brkLeague = cellMap["brkLeague"];
        var imgSeparator = cellMap["imgSeparator"];

        brk.ignoreContentAdaptWithSize(true);
        iconStatus.ignoreContentAdaptWithSize(true);

        var recordTakePoint = mc.BattleRecordManager.getRecordTakePoint(recordInfo);
        var opponentInfo = mc.BattleRecordManager.getRecordOpponent(recordInfo);

        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLeague.setColor(mc.color.BROWN_SOFT);
        lblAgo.setColor(mc.color.BROWN_SOFT);
        recordTakePoint > 0 && (lblGainLeague.setColor(mc.color.GREEN_NORMAL));

        var pnlGuild = cellMap["pnlGuild"]
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");
        var guildInfo = opponentInfo.guild_info;
        var name = mc.BattleRecordManager.getRecordOpponentName(opponentInfo);
        if (guildInfo) {
            var nameWidth = (lblName.fontSize / 1.621) * name.length;
            pnlGuild.x = lblName.x + nameWidth + 5;
            pnlGuild.setVisible(true);
            flag.loadTexture(flagDir + flags[guildInfo["flag"]], ccui.Widget.PLIST_TEXTURE);
            flag_icon.loadTexture(iconDir + icons[guildInfo["icon"] || guildInfo["logo"]], ccui.Widget.PLIST_TEXTURE);
            //var flagData = mc.GameData.guiState.getGuildCreateState().flag;
            //flag_icon.loadTexture(iconDir + icons[flagData["icon"]], ccui.Widget.PLIST_TEXTURE);
            if (guildInfo.guildId && mc.GameData.guildManager.getGuildId() && guildInfo.guildId === mc.GameData.guildManager.getGuildId()) {
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

        var btnReplay = mc.GUIFactory.createButton(mc.dictionary.getGUIString("lblReplay"));
        btnReplay.scale = 0.7;
        btnReplay.x = brkLeague.x;
        btnReplay.y = cell.height * 0.42;
        btnReplay.setUserData(recordInfo);
        btnReplay.registerTouchEvent(function (btnReplay) {
            var recordInfo = btnReplay.getUserData();
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.replayArenaBattle(mc.BattleRecordManager.getRecordId(recordInfo), function (data) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (data) {
                    //var battleField = mc.GameData.replayArenaInBattle.createBattleFieldRefactor();
                    //self.addChild(battleField);
                    //battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function (data) {
                    //    cc.log("------------- STOP BATTLE--------------");
                    //    cc.log("--------------WIN TEAM: "+battleField.getWinningTeamId()+"------------");
                    //    cc.log("--------------SEED: " + battleField.getRandomGenerator().getSeed());
                    //    mc.GameData.arenaInBattle.setPreSetSeed(battleField.getRandomGenerator().getSeed());
                    //    mc.GUIFactory.showRelayArenaBattleScreen();
                    //}.bind(this));
                    //battleField.runCombatToEnd();
                    mc.GUIFactory.showRelayArenaBattleScreen();
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
        //if (status === mc.BattleRecordManager.STATUS_UNREVENGE) {
        //    var brk = new ccui.ImageView("patch9/pnl_numberslot_lose.png", ccui.Widget.PLIST_TEXTURE);
        //    brk.x = brkLeague.x;
        //    brk.y = y;
        //    cell.addChild(brk);
        //    var lbl = brk.setString(mc.dictionary.getGUIString("lblUnavailable"), res.font_UTMBienvenue_none_32_export_fnt);
        //    lbl.scale = 0.5;
        //}
        //else if (status === mc.BattleRecordManager.STATUS_REVENGE) {
        //    var btnRevenge = mc.GUIFactory.createButton(mc.dictionary.getGUIString("lblRevenge"));
        //    btnRevenge.scale = 0.7;
        //    btnRevenge.loadTexture("button/Orange_Round.png", ccui.Widget.PLIST_TEXTURE);
        //    btnRevenge.x = brkLeague.x;
        //    btnRevenge.y = y;
        //    btnRevenge.registerTouchEvent(function () {
        //        var loadingId = mc.view_utility.showLoadingDialog();
        //        var recordInfo = btnReplay.getUserData();
        //        mc.protocol.getOpponentDefenseTeam(mc.BattleRecordManager.getRecordOpponentId(opponentInfo), function (data) {
        //            mc.view_utility.hideLoadingDialogById(loadingId);
        //            if (data) {
        //                self._showRevengeDialog(recordInfo);
        //            }
        //        });
        //    });
        //    btnRevenge.setUserData(recordInfo);
        //    cell.addChild(btnRevenge);
        //}
        //else if (status === mc.BattleRecordManager.STATUS_REVENGED) {
        //    var brk = new ccui.ImageView("patch9/pnl_numberslot_lose.png", ccui.Widget.PLIST_TEXTURE);
        //    brk.x = brkLeague.x;
        //    brk.y = y;
        //    cell.addChild(brk);
        //    var lbl = brk.setString(mc.dictionary.getGUIString("lblRevenged"), res.font_UTMBienvenue_none_32_export_fnt);
        //    lbl.scale = 0.7;
        //    lbl.setColor(mc.color.RED_SOFT);
        //}
        return cell;
    },

    _showRevengeDialog: function (recordInfo) {
        this._revegingRecordInfo = recordInfo;
        var opponentInfo = mc.GameData.arenaManager.getSelectRevengingOpponent();
        var oppName = mc.ArenaManager.getOpponentName(opponentInfo);
        var oppPower = mc.ArenaManager.getOpponentTeamPower(opponentInfo);
        var oppLeague = mc.ArenaManager.getOpponentLeague(opponentInfo);
        var mapHeroes = bb.utility.arrayToMap(mc.ArenaManager.getOpponentArrayHeroes(opponentInfo), function (heroInfo) {
            var id = mc.HeroStock.getHeroId(heroInfo);
            return id;
        });
        var teamFormation = mc.ArenaManager.getOpponentTeamFormation(opponentInfo);
        var leaderIndex = mc.ArenaManager.getOpponentLeaderIndex(opponentInfo);
        var dialogVS = new mc.DialogVS(oppName, oppPower, oppLeague, mapHeroes, teamFormation, leaderIndex);
        dialogVS.setStartCallback(function () {
            if (mc.GameData.playerInfo.getArenaTicket() < 1) {
                mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtNoTicketForAFight"), function () {
                    mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET);
                }.bind(this));
            }
            else {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.revengeArenaBattle(mc.BattleRecordManager.getRecordId(recordInfo), function (data) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (data) {
                        mc.GUIFactory.showArenaBattleScreen();
                    }
                });
            }
        }, mc.dictionary.getGUIString("lblRevenge"));
        dialogVS.show();
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_RELIC_ARENA_RECORD;
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