/**
 * Created by long.nguyen on 12/13/2017.
 */
mc.RecordArenaScreen = mc.Screen.extend({

    initResources: function () {
        var node = ccs.load(res.screen_record_arena_json, "res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var btnBack = rootMap["btnBack"];
        var imgTitle = rootMap["imgTitle"];
        var lvRecord = rootMap["lvRecord"];
        var cellRecord = rootMap["cellRecord"];
        cellRecord.setVisible(false);

        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblRecord"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        var self = this;
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.getBattleRecordArena(0, function (arrRecordInfo) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (arrRecordInfo) {
                for (var i = 0; i < arrRecordInfo.length; i++) {
                    var cell = self._reloadRecord(cellRecord.clone(), arrRecordInfo[i]);
                    lvRecord.pushBackCustomItem(cell);
                }
            }
        });
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
        var brkLeague = cellMap["brkLeague"];
        var imgSeparator = cellMap["imgSeparator"];

        var pnlGuild = cellMap["pnlGuild"]
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");

        brk.ignoreContentAdaptWithSize(true);
        iconStatus.ignoreContentAdaptWithSize(true);

        var recordTakePoint = mc.BattleRecordManager.getRecordTakePoint(recordInfo);
        var opponentInfo = mc.BattleRecordManager.getRecordOpponent(recordInfo);

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



        var guildInfo = null;

        if (guildInfo) {
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

        var status = mc.BattleRecordManager.getRecordStatus(recordInfo);
        if (status === mc.BattleRecordManager.STATUS_UNREVENGE) {
            var brk = new ccui.ImageView("patch9/pnl_numberslot_lose.png", ccui.Widget.PLIST_TEXTURE);
            brk.x = brkLeague.x;
            brk.y = y;
            cell.addChild(brk);
            var lbl = brk.setString(mc.dictionary.getGUIString("lblUnavailable"), res.font_UTMBienvenue_none_32_export_fnt);
            lbl.scale = 0.5;
        }
        else if (status === mc.BattleRecordManager.STATUS_REVENGE) {
            var btnRevenge = mc.GUIFactory.createButton(mc.dictionary.getGUIString("lblRevenge"));
            btnRevenge.scale = 0.7;
            btnRevenge.loadTexture("button/Orange_Round.png", ccui.Widget.PLIST_TEXTURE);
            btnRevenge.x = brkLeague.x;
            btnRevenge.y = y;
            btnRevenge.registerTouchEvent(function () {
                if (mc.GameData.playerInfo.getArenaTicket() < 1) {
                    mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtNoTicketForAFight"), function () {
                        mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET);
                    }.bind(this));
                }
                else {
                    var recordInfo = btnReplay.getUserData();
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.revengeArenaBattle(mc.BattleRecordManager.getRecordId(recordInfo), function (data) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (data) {
                            mc.GUIFactory.showArenaBattleScreen();
                        }
                    });
                }
            });
            btnRevenge.setUserData(recordInfo);
            cell.addChild(btnRevenge);
        }
        else if (status === mc.BattleRecordManager.STATUS_REVENGED) {
            var brk = new ccui.ImageView("patch9/pnl_numberslot_lose.png", ccui.Widget.PLIST_TEXTURE);
            brk.x = brkLeague.x;
            brk.y = y;
            cell.addChild(brk);
            var lbl = brk.setString(mc.dictionary.getGUIString("lblRevenged"), res.font_UTMBienvenue_none_32_export_fnt);
            lbl.scale = 0.7;
            lbl.setColor(mc.color.RED_SOFT);
        }
        return cell;
    }

});