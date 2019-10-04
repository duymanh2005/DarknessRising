/**
 * Created by long.nguyen on 12/13/2017.
 */
mc.RelicArenaHostLayer = mc.LoadingLayer.extend({

    ctor: function () {
        this._super();

        var root = this._root = this.parseCCStudio(res.layer_relic_arena_host);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = rootMap["imgTitle"];
        var nodeBrk = rootMap["nodeBrk"];
        var lvRecord = this._lvRecord = rootMap["lvRecord"];
        var cellRecord = this._cellRecord = rootMap["cellRecord"];
        cellRecord.setVisible(false);

        imgTitle.setString(mc.dictionary.getGUIString("lblHost"));

        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        var blackPanel = mc.view_utility.createBlackPanel();
        blackPanel.anchorY = 0;
        nodeBrk.addChild(sprBrk);
        nodeBrk.addChild(blackPanel);
        var btnRefresh = this._btnRefresh = rootMap["btnRefresh"];
        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        //nodeAsset.addChild(mc.view_utility.createAssetView(priceInfo));
        btnRefresh.registerTouchEvent(function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.findMatchInRelicArena(function (data) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (data) {
                   this._bindList(data);
                }
            }.bind(this));
        });
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
        mc.protocol.findMatchInRelicArena(function (arrRecordInfo) {
            if (arrRecordInfo) {
                self.performDone(arrRecordInfo);
            }
        });
    },

    onLoadDone: function (arrRecordInfo) {
        if (arrRecordInfo) {
            this._bindList(arrRecordInfo);
        }
    },

    _bindList : function(arrRecordInfo){
        if (arrRecordInfo) {
            for (var i = 0; i < arrRecordInfo.length; i++) {
                var cell = this._reloadCell(this._cellRecord.clone(), arrRecordInfo[i]);
                this._lvRecord.pushBackCustomItem(cell);
            }
        }
    },

    _reloadCell: function (cell, cellInfo) {
        var relicArenaManager = mc.GameData.relicArenaManager;
        var oppInfo = cellInfo;
        if(oppInfo)
        {
            cell.setVisible(true);
            var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
                return child.getName();
            });

            var lblName = cellMap["lblName"];
            var lblLevel = cellMap["lblLevel"];
            var lblPower = cellMap["lblPower"];
            var lblTime = cellMap["lblTime"];
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
            lblTime.setColor(mc.color.BROWN_SOFT);



            nodeHero.scale = 0.685;

            var self = this;
            var relicArenaManager = mc.GameData.relicArenaManager;

            var oppName = mc.RelicArenaManager.getOpponentName(oppInfo);
            var oppPower = mc.RelicArenaManager.getOpponentTeamPower(oppInfo);

            var oppWinPoint = mc.RelicArenaManager.getOpponentWinNo(oppInfo);
            var oppLosePoint = mc.RelicArenaManager.getOpponentLoseNo(oppInfo);
            var oppGuildInfo = mc.RelicArenaManager.getOpponentGuild(oppInfo);
            var oppPickHeroTime = mc.RelicArenaManager.getOpponentPickHeroTime(oppInfo);
            var owner = mc.RelicArenaManager.isOwner(oppInfo);
            var level = mc.RelicArenaManager.getOpponentLevel(oppInfo);
            var lblFightInfo = mc.dictionary.getGUIString("lblJoin");
            btnFight.loadTexture("button/Green_Round.png",ccui.Widget.PLIST_TEXTURE);
            if(owner)
            {
                lblFightInfo = mc.dictionary.getGUIString("lblRemove");
                btnFight.loadTexture("button/Orange_Round.png",ccui.Widget.PLIST_TEXTURE);
            }
            btnFight.setString(lblFightInfo);

            var oppArrHeroInfo = mc.RelicArenaManager.getOpponentArrayHeroes(oppInfo);
            var oppTeamFormation = [];
            for(var i = 0;i<oppArrHeroInfo.length;i++)
            {
                oppTeamFormation.push(oppArrHeroInfo[i].id);
            }
            mc.view_utility.layoutHiddenHeroTeamFormation({
                arrTeamFormation: oppTeamFormation,
                mapHeroInfo: bb.utility.arrayToMap(oppArrHeroInfo, function (heroInfo) {
                    return mc.HeroStock.getHeroId(heroInfo);
                }),
                enableClick : true
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
            //var leagueInfo = mc.const.MAP_LEAGUE_BY_CODE[oppLeague];
            //nodeLeague.addChild(new ccui.ImageView(leagueInfo.url, ccui.Widget.PLIST_TEXTURE));
            //lblLeagueName.setString(leagueInfo.name);

            lblGainWin.setColor(mc.color.GREEN_NORMAL);
            btnFight.setUserData(oppInfo);
            btnFight.registerTouchEvent(function (btnFight) {
                //if (mc.GameData.playerInfo.getArenaTicket() < 1) {
                //    mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtNoTicketForAFight"), function () {
                //        mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET);
                //    }.bind(this));
                //}
                //else {
                //    var loadingId = mc.view_utility.showLoadingDialog();
                //    mc.protocol.fightArenaOpponent(btnFight.getUserData(), function (data) {
                //        mc.view_utility.hideLoadingDialogById(loadingId);
                //        if (data) {
                //            mc.GUIFactory.showArenaBattleScreen();
                //        }
                //    });
                //}

                if(owner)
                {

                    mc.GUIFactory.confirm(mc.dictionary.getGUIString("lblDoYouWantRemove"),function(){
                        mc.protocol.removeMatchInRelicArena(oppInfo.battleId,function(result){
                            if(result){
                                var rs = mc.GameData.relicArenaManager.removeOpponentInArrayByIndex(index);
                                if(rs)
                                {
                                    this._reloadAll();
                                }
                            }
                        }.bind(this))

                    }.bind(this))

                }
                else
                {
                    //var loadingId = mc.view_utility.showLoadingDialog();
                    //
                    //mc.view_utility.hideLoadingDialogById(loadingId);
                    var currScreen = bb.director.getCurrentScreen();
                    var isInMainScreen = currScreen instanceof mc.MainScreen;
                    if(isInMainScreen)
                    {
                        this.close();
                        var layer = currScreen.pushLayerWithId(mc.MainScreen.LAYER_JOIN_REQUEST_RELIC_ARENA);
                        layer.setMatchInfo(oppInfo);
                    }

                }
            }.bind(this));


            lblGainWin.setString(oppWinPoint > 0 ? ("+" + oppWinPoint) : "" + oppWinPoint);
            lblGainLose.setString(oppLosePoint > 0 ? "-" + oppLosePoint : "" + oppLosePoint);
            lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + level);
            lblTime.setString(bb.utility.formatNumber(oppPickHeroTime));

            nodeHero.setCascadeOpacityEnabled(true);
            nodeLeague.setCascadeOpacityEnabled(true);
            cell.setCascadeOpacityEnabled(true);
        }
        else
        {
            cell.setVisible(false);
        }
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