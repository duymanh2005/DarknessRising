/**
 * Created by long.nguyen on 12/13/2017.
 */
mc.JoinerListRelicArenaLayer = mc.LoadingLayer.extend({
    _data : [],

    ctor: function () {
        this._super();


        var root = this._root = this.parseCCStudio(res.layer_joiner_list_relic_arena);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = rootMap["imgTitle"];
        var nodeBrk = rootMap["nodeBrk"];
        var lvRecord = this._lvRecord = rootMap["lvJoiner"];
        var lblEmpty = this._lblEmpty = rootMap["lblEmpty"];
        var cellRecord = this._cellRecord = rootMap["cell"];
        lblEmpty.setString(mc.dictionary.getGUIString("No Result"));
        lblEmpty.setVisible(false);
        cellRecord.setVisible(false);

        imgTitle.setString(mc.dictionary.getGUIString("lblJoinerList"));

        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        var blackPanel = mc.view_utility.createBlackPanel();
        blackPanel.anchorY = 0;
        nodeBrk.addChild(sprBrk);
        nodeBrk.addChild(blackPanel);
        this.traceDataChange(mc.GameData.relicArenaManager,function(data,a,b){
           this._checkVisibleList();
        }.bind(this));
    },

    setData : function(data)
    {
        this._lvRecord.removeAllChildren();
        if(data && data.length >0)
        {
            var temp = this._checkAndRemoveInvalidData(data);
            this._data = temp;
            if (this._data) {
                for (var i = 0; i < this._data.length; i++) {
                    var cell = this._reloadRecord(this._cellRecord.clone(), this._data[i]);
                    this._lvRecord.pushBackCustomItem(cell);
                }
            }
        }
        else{
            this._data = [];
        }
       this._checkVisibleList();
    },

    _checkVisibleList : function(){
        var relicArenaManager = mc.GameData.relicArenaManager;
        if(relicArenaManager.isWaitingVS())
        {
            this._lvRecord.setVisible(false);
            this._lblEmpty.setString(mc.dictionary.getGUIString("Waiting Opponent"));
            this._lblEmpty.setVisible(true);
        }
        else
        {
            if(this._data && this._data.length)
            {
                this._lvRecord.setVisible(true);
                this._lblEmpty.setVisible(false);
            }
            else
            {
                this._lvRecord.setVisible(false);
                this._lblEmpty.setString(mc.dictionary.getGUIString("No Result"));
                this._lblEmpty.setVisible(true);
            }
        }

    },

    appendData : function(data){
        if(data)
        {
            if(!this._data)
            {
                this._data = [];
            }
            var temp = this._checkAndRemoveInvalidData(data);
            this._data = this._data.concat(temp);
            for (var i = 0; i < data.length; i++) {
                var cell = this._reloadRecord(this._cellRecord.clone(), data[i]);
                this._lvRecord.pushBackCustomItem(cell);
            }
        }
        this._checkVisibleList();
    },

    _checkAndRemoveInvalidData :function(data)
    {
        var temp = bb.utility.cloneJSON(data);
        for(var i = temp.length - 1;i >= 0;i--)
        {
            if((bb.now() - temp[i].startTime)/1000 > mc.const.TIME_REQUEST_COUNT_DOWN)
            {
                temp.splice(i,1);
            }
        }
        return temp;
    },

    onLoading: function () {
        var self = this;
        var relicArenaManager = mc.GameData.relicArenaManager;
        if(relicArenaManager.isWaitingVS())
        {
            self.performDone([]);
        }
        else
        {

            var arrMatchId = mc.GameData.relicArenaManager.getArrMatchIdForRequestJoinerList();
            //arrMatchId[0] = 15;
            if(arrMatchId && arrMatchId.length )
            {
                for(var i = 0;i<arrMatchId.length;i++)
                {
                    mc.protocol.getJoinerRequestListInRelicArena(arrMatchId[i], function (result) {
                        var arrOpponent = result.request_list;
                        if (arrOpponent) {
                            self.performDone(arrOpponent);
                            if(arrOpponent.length<1)
                            {
                                mc.GameData.relicArenaManager.removeMatchIdForRequestJoinerList(arrMatchId[i]);
                            }
                        }
                    });
                }
            }
            else
            {
                self.performDone([]);
            }
        }


    },

    onLoadDone: function (arrOpponent) {
        if (arrOpponent) {
           this.appendData(arrOpponent);
        }
    },

    _reloadRecord: function (cell, opponentInfo) {
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
        var lblRemain = cellMap["lblRemain"];
        var lblRemainTime = cellMap["lblRemainTime"];
        //var nodeLeague = cellMap["nodeLeague"];
        //var nodeHero = cellMap["nodeHero"];
        var lblGainWin = cellMap["lblGainWin"];
        var lblGainLose = cellMap["lblGainLose"];
        lblRemain.setString(mc.dictionary.getGUIString("lblTime") + " :");

        lblLeagueName.setColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblTime.setColor(mc.color.BROWN_SOFT);
        lblRemain.setColor(mc.color.BROWN_SOFT);
        lblRemainTime.setColor(mc.color.BROWN_SOFT);

        var remainRequestTime = mc.const.TIME_REQUEST_COUNT_DOWN -  Math.round((bb.now() - opponentInfo.startTime)/1000);
        lblRemainTime.setString(mc.view_utility.formatDurationTime(remainRequestTime * 1000));
        this.schedule(function(){
            remainRequestTime -= 1;
            if(remainRequestTime<15)
            {
                lblRemainTime.setColor(mc.color.RED_SOFT);
                if(remainRequestTime<=0)
                {
                    var ind = this._data.indexOf(opponentInfo);
                    if(ind >= 0)
                    {
                        this._data.splice(ind,1);
                        this.setData(this._data);
                    }

                }
            }
            else
            {
                lblRemainTime.setColor(mc.color.BROWN_SOFT);
            }
            lblRemainTime.setString(mc.view_utility.formatDurationTime(remainRequestTime * 1000));
        }.bind(this),1.0,remainRequestTime - 1);

        var pnlGuild = cellMap["pnlGuild"]
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");
        var guildInfo = opponentInfo.guild_info;
        var name = mc.RelicArenaManager.getOpponentName(opponentInfo);
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


        lblName.setString(name);
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + mc.RelicArenaManager.getOpponentLevel(opponentInfo));
        lblPower.setString(bb.utility.formatNumber(mc.RelicArenaManager.getOpponentTeamPower(opponentInfo)));


        var nodeHero = new cc.Node();
        nodeHero.scale = 0.685;
        nodeHero.x = cell.width * 0.365;
        nodeHero.y = cell.height * 0.42;
        var oppArrHeroInfo = mc.RelicArenaManager.getOpponentArrayHeroes(opponentInfo);
        var oppTeamFormation = [];
        for (var i = 0; i < oppArrHeroInfo.length; i++) {
            oppTeamFormation.push(oppArrHeroInfo[i].id);
        }
        mc.view_utility.layoutHiddenHeroTeamFormation({
            arrTeamFormation: oppTeamFormation,
            mapHeroInfo: bb.utility.arrayToMap(oppArrHeroInfo, function (heroInfo) {
                return mc.HeroStock.getHeroId(heroInfo);
            }),
            enableClick: true
        }, {
            nodeHero: nodeHero
        }, true);
        cell.addChild(nodeHero);
        var oppPickHeroTime = mc.RelicArenaManager.getOpponentPickHeroTime(opponentInfo);
        var oppWinPoint = mc.RelicArenaManager.getOpponentWinNo(opponentInfo);
        var oppLosePoint = mc.RelicArenaManager.getOpponentLoseNo(opponentInfo);
        var level = mc.RelicArenaManager.getOpponentLevel(opponentInfo);

        lblGainWin.setString(oppWinPoint > 0 ? ("+" + oppWinPoint) : "" + oppWinPoint);
        lblGainLose.setString(oppLosePoint > 0 ? "-" + oppLosePoint : "" + oppLosePoint);
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + level);
        lblTime.setString(bb.utility.formatNumber(oppPickHeroTime));
        btnFight.setString(mc.dictionary.getGUIString("Accept"));
        btnFight.setUserData(opponentInfo);
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


                //var loadingId = mc.view_utility.showLoadingDialog();
                //
                //mc.view_utility.hideLoadingDialogById(loadingId);
            mc.protocol.acceptJoinerRequestInRelicArena(opponentInfo.requestId,function(result){
                if(result && result.start)
                {
                    //mc.GUIFactory.infoDialog("abc","123");
                    //mc.GameData.relicArenaManager.setWaitingVS(true);
                    var matchInfo = mc.GameData.relicArenaManager.getMatchInfo();
                    var data = {you : {name : mc.GameData.playerInfo.getName()}, opp : opponentInfo , remainTime : mc.const.TIME_BEFORE_PICK_HERO_COUNT_DOWN, action : "pick_hero"};
                    mc.GUIFactory.notifyVSRelicMatch(data);
                    //var dialog = new mc.DialogVSBeforePickHero(matchInfo);
                    //dialog.show();
                }
            }.bind(this));
        }.bind(this));
        return cell;
    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_JOINER_LIST_RELIC_ARENA;
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