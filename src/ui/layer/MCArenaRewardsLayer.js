/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.ArenaRewardsLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();

        var root = this._root = this.parseCCStudio(res.layer_arena_rewards);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var arena = mc.dictionary.arenaDictionary.arena;

        var brkTitle = rootMap["brkTitle"];
        var lblTips = rootMap["lbl_tips"];
        var nodeBrk = rootMap["nodeBrk"];
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblArena"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        if(mc.enableReplaceFontBM())
        {
            lblTips = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblTips);
        }
        lblTips.setColor(mc.color.GREEN_NORMAL);
        lblTips.setString(mc.dictionary.getGUIString("lblClimbUpLeague"));

        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        nodeBrk.addChild(sprBrk);


        var leagueMap = this.parseArenaLeagueRewards(arena);
        var array = bb.utility.mapToArray(leagueMap);
        array.sort(function (a, b) {
            return a["info"]["arenaPointsRequire"] - b["info"]["arenaPointsRequire"];
        });

        var layer1 = this._otherLeague = rootMap["panelArena_require"];
        var layer2 = this._myLeague = rootMap["panelArena_rewards"];
        this.top1 = rootMap["top_1"];
        layer1.setVisible(false);
        layer2.setVisible(false);
        this.top1.setVisible(false);

        var listLeaguePanel = [];
        for (var i in array) {
            var league = array[i];
            if (league["league"] === mc.GameData.playerInfo.getLeague()) {
                listLeaguePanel.push(this.bindMyLeague(league));
            } else {
                listLeaguePanel.push(this.bindOtherLeague(league));
            }
        }
        var index = 0;
        for (var j in listLeaguePanel) {
            var league = listLeaguePanel[j];
            if (league.leagueInfo.league === mc.GameData.playerInfo.getLeague()) {
                this.focusIndex = index;
                break;
            }
            index++;
        }

        var layout = mc.widget_utility.createScrollNode(listLeaguePanel, null, 680, cc.p(cc.winSize.width, layer1.height));
        layout.setLoopScroll(false);
        this._root.addChild(layout);
        layout.setPosition(this._root.width / 2, this._root.height * 0.37);
        layout.focusAt(this.focusIndex, true);

    },

    parseArenaLeagueRewards: function (json) {
        var result = {};
        if (cc.isString(json)) {
            json = JSON.parse(json);
        }
        var rewardsList = json["topRewardList"];
        var leagueList = json["leagueList"];
        if (rewardsList) {
            for (var i in rewardsList) {
                var rewardsInfo = rewardsList[i];
                if (!result[rewardsInfo["league"]]) {
                    result[rewardsInfo["league"]] = {league: rewardsInfo["league"], listGroupRewards: []};
                }
                result[rewardsInfo["league"]].listGroupRewards.push(rewardsInfo);
            }
        }
        if (leagueList) {
            for (var j in leagueList) {
                var league = leagueList[j];
                if (!result[league["league"]]) {
                    result[league["league"]] = {league: league["league"], listGroupRewards: []};
                }
                result[league["league"]].info = league;
            }
        }

        return result;
    },

    bindMyLeague: function (leagueInfo) {
        var leagueLayer = this._myLeague.clone();
        leagueLayer.leagueInfo = leagueInfo;
        var rewards_bg = leagueLayer.getChildByName("rewards_bg");
        var lblRewards = leagueLayer.getChildByName("lbl_rewards");
        var lblLeagueName = leagueLayer.getChildByName("lbl_league_name");
        var iconLeague = leagueLayer.getChildByName("icon_league");
        var lblComeIn = leagueLayer.getChildByName("lbl_rewards_comming");
        var lblLeagueRewards = leagueLayer.getChildByName("lbl_rank_info");
        var lblRank = leagueLayer.getChildByName("lbl_rank");
        var lvlTop = leagueLayer.getChildByName("lvlTop");

        lblRewards.setString(mc.dictionary.getGUIString("lblLeagueRewards"));
        lblComeIn.setString("");
        var _updateShieldTime = function () {
            var rankingSeconds = mc.GameData.arenaManager.getRankingSeconds();
            if (rankingSeconds) {
                (lblComeIn.setString(mc.dictionary.getGUIString("lblArenaRewardsComeIn") + " " + mc.view_utility.formatDurationTime(rankingSeconds - bb.now())));
            }
        };
        if (lblComeIn) {
            lblComeIn.stopAllActions();
            lblComeIn.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(_updateShieldTime.bind(this))).repeatForever());
        }
        lblLeagueRewards.setString(mc.dictionary.getGUIString("lblRankingInformation"));
        var rank = mc.GameData.playerInfo.getRank();
        if (rank > 0) {
            lblRank.setString(mc.dictionary.getGUIString("lblRank:") + rank);
        } else {
            lblRank.setString(mc.dictionary.getGUIString("lblNoRank"));
        }

        if (mc.enableReplaceFontBM()) {
            lblRewards = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRewards);
            lblLeagueName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeagueName);
            lblComeIn = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblComeIn);
            lblLeagueRewards = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeagueRewards);
            lblRank = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRank);
            lblLeagueName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeagueName);
        }

        lblRewards.setColor(mc.color.BROWN_SOFT);
        lblLeagueName.setColor(mc.color.BROWN_SOFT);
        lblComeIn.setColor(mc.color.BROWN_SOFT);
        lblLeagueRewards.setColor(mc.color.BROWN_SOFT);
        lblRank.setColor(mc.color.BROWN_SOFT);

        var leagueRes = mc.const.MAP_LEAGUE_BY_CODE[leagueInfo.league];
        iconLeague.loadTexture(leagueRes.url, ccui.Widget.PLIST_TEXTURE);
        lblLeagueName.setString(leagueRes.name);


        var listRewards = leagueInfo["listGroupRewards"];

        var haveRewards = false;

        for (var i in listRewards) {
            var rewards = listRewards[i];
            if (rank === rewards.rank || (rank >= 21 && rewards.rank === 21)) {
                var arrReward = mc.ItemStock.createArrJsonItemFromStr(rewards["reward"]);
                var linearReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
                    if (index < arrReward.length) {
                        var itemView = new mc.ItemView(arrReward[index]);
                        mc.view_utility.registerShowPopupItemInfo(itemView);
                        return itemView;
                    }
                }.bind(this)), 5);
                linearReward.setPosition(rewards_bg.width / 2, rewards_bg.height / 2);
                rewards_bg.addChild(linearReward);
                haveRewards = true;
                break;
            }

        }
        if (!haveRewards) {
            var string = rewards_bg.setString(mc.dictionary.getGUIString("lblNoRewards"));
            string.y = rewards_bg.height / 2;
        }
        this.bindRewards(lvlTop, leagueLayer, listRewards, rank);
        return leagueLayer;
    },


    bindOtherLeague: function (leagueInfo) {
        var leagueLayer = this._otherLeague.clone();
        leagueLayer.leagueInfo = leagueInfo;
        var lblRewards = leagueLayer.getChildByName("lbl_rewards");
        var lblLeagueName = leagueLayer.getChildByName("lbl_league_name");
        var iconLeague = leagueLayer.getChildByName("icon_rank");
        var lblRequire = leagueLayer.getChildByName("lbl_requirement");
        var lblTrophy = leagueLayer.getChildByName("rank_trophy_bg").getChildByName("lbl");
        var lblLeagueRewards = leagueLayer.getChildByName("lbl_rank_info");
        var lvlTop = leagueLayer.getChildByName("lvlTop");

        if (mc.enableReplaceFontBM()) {
            lblTrophy = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblTrophy);
            lblRewards = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRewards);
            lblRequire = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRequire);
            lblRequire.y -= 5;
            lblLeagueRewards = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeagueRewards);
            lblLeagueName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeagueName);
        }

        lblTrophy.setString(bb.utility.formatNumber(leagueInfo.info["arenaPointsRequire"]));
        lblRewards.setString(mc.dictionary.getGUIString("lblLeagueRewards"));
        lblRequire.setString(mc.dictionary.getGUIString("lblRequirement"));
        lblLeagueRewards.setString(mc.dictionary.getGUIString("lblRankingInformation"));

        lblRewards.setColor(mc.color.BROWN_SOFT);
        lblLeagueName.setColor(mc.color.BROWN_SOFT);
        lblRequire.setColor(mc.color.BROWN_SOFT);
        lblLeagueRewards.setColor(mc.color.BROWN_SOFT);

        var leagueRes = mc.const.MAP_LEAGUE_BY_CODE[leagueInfo.league];
        iconLeague.loadTexture(leagueRes.url, ccui.Widget.PLIST_TEXTURE);
        lblLeagueName.setString(leagueRes.name);

        this.bindRewards(lvlTop, leagueLayer, leagueInfo["listGroupRewards"]);

        return leagueLayer;
    },

    bindRewards: function (lvl, widget, listRewards, rank) {
        var top = this.top1;
        for (var i in listRewards) {
            var rewards = listRewards[i];
            var arrRewards = mc.ItemStock.createArrJsonItemFromStr(rewards["reward"]);
            var topClone = top.clone();
            this.bindTopRewards(topClone, arrRewards, rewards, rank);
            lvl.pushBackCustomItem(topClone);
        }
    },

    bindTopRewards: function (top, arrRewards, rewards, rank) {
        top.setVisible(true);
        var lblTop = top.getChildByName("lbl_top");
        if(mc.enableReplaceFontBM())
        {
            lblTop = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblTop);
        }
        lblTop.setColor(mc.color.BROWN_SOFT);
        lblTop.setString(mc.dictionary.getGUIString("Top") + " " + (rewards.rank === 21 ? "20+" : rewards.rank));
        lblTop.x -= 20;

        // var linearReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
        //     var itemView = new mc.ItemView(arrReward[index]);
        //     itemView.scale = 0.5;
        //     if (arrReward[index].firstTime) {
        //         var icon = new cc.Sprite("#icon/ico_clear.png");
        //         icon.x = itemView.width * 0.085;
        //         icon.y = itemView.height * 0.85;
        //         itemView.addChild(icon);
        //     }
        //     mc.view_utility.registerShowPopupItemInfo(itemView);
        //     return itemView;
        // }.bind(this)), 5);

        // lvlRewards.pushBackCustomItem(linearReward);

        var assetView = bb.layout.linear(bb.collection.createArray(arrRewards.length, function (index) {
            var recipeCost = arrRewards[index];
            var view = mc.view_utility.createAssetView(recipeCost);
            view.setScale(0.8);
            return view;
        }), 0, bb.layout.LINEAR_HORIZONTAL, true);
        assetView.setAnchorPoint(1, 0.5);
        assetView.setPosition(top.width, top.height / 2);
        top.addChild(assetView);

        if (rank !== undefined) {
            var rankInfo = rewards["rank"];
            if (rank === rankInfo) {
                top.loadTexture("patch9/pnl_selectedlang.png", ccui.Widget.PLIST_TEXTURE);
            }


        }

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
            for (var i = 0; i < arrRanker.length; i++) {
                this._lvlMyLeague.pushBackCustomItem(this._reloadCell(this._cellRank.clone(), arrRanker[i]));
            }
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_ARENA_REWARDS;
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
