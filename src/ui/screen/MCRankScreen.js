/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.RankScreen = mc.Screen.extend({

    initResources:function(){
        this._super();

        var node = ccs.load(res.screen_rank_json,"res/").node;
        this.addChild(node);

        var rootMap = bb.utility.arrayToMap(node.getChildByName("root").getChildren(),function(child){
            return child.getName();
        });

        var btnBack = rootMap["btnBack"];
        var imgTitle = rootMap["imgTitle"];
        var tabMyLeague = this._tabMyLeague = rootMap["tabMyLeague"];
        var tabMyLeaguePassive = this._tabMyLeaguePassive = rootMap["tabMyLeaguePassive"];
        var tabFriendLeague = this._tabFriendLeague = rootMap["tabFriendLeague"];
        var tabFriendLeaguePassive = this._tabFriendLeaguePassive = rootMap["tabFriendLeaguePassive"];
        var tabTopLeague = this._tabTopLeague = rootMap["tabTopLeague"];
        var tabTopLeaguePassive = this._tabTopLeaguePassive = rootMap["tabTopLeaguePassive"];
        var lvlMyLeague = this._lvlMyLeague = rootMap["lvlMyLeague"];
        var lvlFriendLeague = this._lvlFriendLeague = rootMap["lvlFriendLeague"];
        var lvlTopLeague = this._lvlTopLeague = rootMap["lvlTopLeague"];
        var cellRank = this._cellRank = rootMap["cellRank"];
        cellRank.setVisible(false);
        var panelBottom = rootMap["panelBottom"];

        var bottomMap = bb.utility.arrayToMap(panelBottom.getChildren(),function(child){
            return child.getName();
        });

        var btnReward = bottomMap["btnReward"];
        var lblEnd = bottomMap["lblEnd"];
        var lblEndTime = bottomMap["lblEndTime"];

        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblRanking"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        btnReward.setString(mc.dictionary.getGUIString("lblReward"));
        lblEndTime.setColor(mc.color.YELLOW);

        btnBack.registerTouchEvent(function(){
           mc.GameData.guiState.popScreen();
        });
        btnReward.registerTouchEvent(function(){

        });

        tabMyLeaguePassive.registerTouchEvent(function(){
            this.selectTab(tabMyLeague.getName());
        }.bind(this));

        tabFriendLeaguePassive.registerTouchEvent(function(){
            this.selectTab(tabFriendLeague.getName());
        }.bind(this));

        tabTopLeaguePassive.registerTouchEvent(function(){
            this.selectTab(tabTopLeague.getName());
        }.bind(this));

        this.selectTab(tabMyLeague.getName());

        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.getTopArena(0,function(arrRanker){
            mc.view_utility.hideLoadingDialogById(loadingId);
            if( arrRanker ){
                for(var i =0; i< arrRanker.length; i++ ){
                    this._lvlMyLeague.pushBackCustomItem(this._reloadCell(this._cellRank.clone(),arrRanker[i]));
                }
            }
        }.bind(this));
    },

    selectTab:function(tabName){
        this._tabMyLeague.setVisible(false);
        this._tabFriendLeague.setVisible(false);
        this._tabTopLeague.setVisible(false);
        this._tabMyLeaguePassive.setVisible(false);
        this._tabFriendLeaguePassive.setVisible(false);
        this._tabTopLeaguePassive.setVisible(false);
        this._lvlMyLeague.setVisible(false);
        this._lvlFriendLeague.setVisible(false);
        this._lvlTopLeague.setVisible(false);

        if( tabName === this._tabMyLeague.getName() ){
            this._tabMyLeague.setVisible(true);
            this._tabFriendLeaguePassive.setVisible(true);
            this._tabTopLeaguePassive.setVisible(true);

            this._lvlMyLeague.setVisible(true);
        }
        else if( tabName === this._tabFriendLeague.getName() ){
            this._tabFriendLeague.setVisible(true);
            this._tabMyLeaguePassive.setVisible(true);
            this._tabTopLeaguePassive.setVisible(true);

            this._lvlFriendLeague.setVisible(true);
        }
        else if( tabName === this._tabTopLeague.getName() ){
            this._tabTopLeague.setVisible(true);
            this._tabMyLeaguePassive.setVisible(true);
            this._tabFriendLeaguePassive.setVisible(true);

            this._lvlTopLeague.setVisible(true);
            if( this._lvlTopLeague.getItems().length === 0 ){
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getTopArena("S",function(arrRanker){
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if( arrRanker ){
                        for(var i =0; i< arrRanker.length; i++ ){
                            this._lvlTopLeague.pushBackCustomItem(this._reloadCell(this._cellRank.clone(),arrRanker[i]));
                        }
                    }
                }.bind(this));
            }
        }
    },

    _reloadCell:function(cell,rankerInfo){
        var cellMap = bb.utility.arrayToMap(cell.getChildren(),function(child){
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

        imgRank.setVisible(false);
        lblRank.setVisible(false);
        lblNumRank.setVisible(false);

        var avt = mc.view_utility.createAvatarPlayer(parseInt(mc.RankingManager.getRankerAvatar(rankerInfo)));
        avt.x = cell.width*0.125;
        avt.y = cell.height*0.5;
        cell.addChild(avt);

        lblPower.setColor(mc.color.BROWN_SOFT);
        lblNumRank.setColor(mc.color.BROWN_SOFT);
        lblRank.setColor(mc.color.BROWN_SOFT);

        lblName.setString(mc.RankingManager.getRankerName(rankerInfo));
        lblPoints.setString(bb.utility.formatNumber(mc.RankingManager.getRankerTrophy(rankerInfo)));
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + mc.RankingManager.getRankerLevel(rankerInfo));
        lblWin.setString(bb.utility.formatNumber(mc.RankingManager.getRankerWinNo(rankerInfo)));
        lblPower.setString(bb.utility.formatNumber(mc.RankingManager.getRankerTeamPower(rankerInfo)));
        iconLeague.ignoreContentAdaptWithSize(true);
        iconLeague.loadTexture(mc.const.MAP_LEAGUE_BY_CODE[mc.RankingManager.getRankerLeagueKey(rankerInfo)]["url"],ccui.Widget.PLIST_TEXTURE);
        var rank = mc.RankingManager.getRankerRank(rankerInfo);
        if( rank <= 3 ){
            if( rank === 2 ){
                imgRank.loadTexture("icon/ico_rank_silver.png",ccui.Widget.PLIST_TEXTURE);
            }
            else if( rank === 3 ){
                imgRank.loadTexture("icon/ico_rank_bronze.png",ccui.Widget.PLIST_TEXTURE);
            }
            imgRank.setVisible(true);
            imgRank.ignoreContentAdaptWithSize(true);
        }
        else{
            lblRank.setVisible(true);
            lblNumRank.setVisible(true);
            lblNumRank.setString(bb.utility.formatNumber(rank));
        }
        if( mc.GameData.playerInfo.getName() === mc.RankingManager.getRankerId(rankerInfo) ){
            brk.loadTexture("patch9/pnl_name_pink.png",ccui.Widget.PLIST_TEXTURE);
        }
        cell.setVisible(true);
        return cell;
    }

});

mc.RankScreen.createAvatarPlayer = function(avatarIndex){

};