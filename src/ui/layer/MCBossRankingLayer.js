/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.BossRankingLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_boss_ranking);
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var nodeBrk = rootMap["nodeBrk"];
        var imageView = new ccui.ImageView("res/brk/bg_mail.png", ccui.Widget.LOCAL_TEXTURE);
        nodeBrk.addChild(imageView);
        var imgTitle = rootMap["imgTitle"];
        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblRanking"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var bg = this.userRank = rootMap["bg"];
        var listBg = this.listBg = rootMap["listBg"];
        var lbl_msg = this.lbl_msg = rootMap["lbl_msg"];
        if(mc.enableReplaceFontBM())
        {
            lbl_msg = this.lbl_msg = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl_msg);
            lbl_msg.y += 10;
        }
        lbl_msg.setColor(mc.color.BROWN_SOFT);
        var lvlTopReward = this.lvlTopReward = rootMap["lvlTopReward"];
        var lvlTopDmgReward = this.lvlTopDmgReward = rootMap["lvlDMGReward"];
        var lvlRanking = this.lvlRanking = rootMap["lvlRanking"];

        this.cellRank = rootMap["cellRank"];
        this.top = rootMap["top"];
        this.dmg = rootMap["dmg"];

        var btnRanking = this.btnRanking = bg.getChildByName("tabRanking");
        var btnDMGReward = this.btnDMGReward = bg.getChildByName("tabDMGReward");
        var btnTopReward = this.btnTopReward = bg.getChildByName("tabTopReward");
        var lblRanking = btnRanking.setString(mc.dictionary.getGUIString("lblRanking"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        var lblDMGReward = btnDMGReward.setString(mc.dictionary.getGUIString("lblDMGReward"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        var lblTopReward = btnTopReward.setString(mc.dictionary.getGUIString("lblTopReward"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        if(mc.enableReplaceFontBM())
        {
            var yPost = 0.6;
            lblRanking.setPosition(btnRanking.width / 2, btnRanking.height * yPost);
            lblDMGReward.setPosition(btnDMGReward.width / 2, btnDMGReward.height * yPost);
            lblTopReward.setPosition(btnTopReward.width / 2, btnTopReward.height * yPost);
        }
        else
        {
            lblRanking.setPosition(btnRanking.width / 2, btnRanking.height * 0.65);
            lblDMGReward.setPosition(btnDMGReward.width / 2, btnDMGReward.height * 0.65);
            lblTopReward.setPosition(btnTopReward.width / 2, btnTopReward.height * 0.65);
        }

        this.bindMyRanking();
        this.bindTopLayer();
        this.onBtnRanking();
        btnRanking.registerTouchEvent(this.onBtnRanking.bind(this));
        btnDMGReward.registerTouchEvent(this.onBtnDMGRewards.bind(this));
        btnTopReward.registerTouchEvent(this.onBtnTopRewards.bind(this));
    },

    onBtnRanking: function () {
        this.btnRanking.loadTexture("button/btn_tab_on.png", ccui.Widget.PLIST_TEXTURE);
        this.btnDMGReward.loadTexture("button/btn_tab_off.png", ccui.Widget.PLIST_TEXTURE);
        this.btnTopReward.loadTexture("button/btn_tab_off.png", ccui.Widget.PLIST_TEXTURE);
        this.lvlRanking.setVisible(true);
        this.lvlTopDmgReward.setVisible(false);
        this.lvlTopReward.setVisible(false);
        this.listBg.setVisible(false);
        this.lbl_msg.setVisible(false);
    },
    onBtnDMGRewards: function () {
        this.btnDMGReward.loadTexture("button/btn_tab_on.png", ccui.Widget.PLIST_TEXTURE);
        this.btnRanking.loadTexture("button/btn_tab_off.png", ccui.Widget.PLIST_TEXTURE);
        this.btnTopReward.loadTexture("button/btn_tab_off.png", ccui.Widget.PLIST_TEXTURE);
        this.lvlTopDmgReward.setVisible(true);
        this.lvlRanking.setVisible(false);
        this.lvlTopReward.setVisible(false);
        this.listBg.setVisible(true);
        this.lbl_msg.setVisible(true);
        this.lbl_msg.setString(mc.dictionary.getGUIString("lblTopDMGRewardsMsg"));
    },
    onBtnTopRewards: function () {
        this.btnTopReward.loadTexture("button/btn_tab_on.png", ccui.Widget.PLIST_TEXTURE);
        this.btnDMGReward.loadTexture("button/btn_tab_off.png", ccui.Widget.PLIST_TEXTURE);
        this.btnRanking.loadTexture("button/btn_tab_off.png", ccui.Widget.PLIST_TEXTURE);
        this.lvlTopReward.setVisible(true);
        this.lvlTopDmgReward.setVisible(false);
        this.lvlRanking.setVisible(false);
        this.listBg.setVisible(true);
        this.lbl_msg.setVisible(true);
        this.lbl_msg.setString(mc.dictionary.getGUIString("lblTopRewardsMsg"));
    },

    bindRecord: function (cell, modelInfo) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        cell.setVisible(true);

        var lblName = cellMap["lblName"];
        var lblLvl = cellMap["lblLevel"];
        var lblDMG = cellMap["lblDmg"];
        var brk = cellMap["brk"];

        lblDMG.setColor(mc.color.BROWN_SOFT);

        lblName.setString(modelInfo["name"]);
        if(mc.enableReplaceFontBM())
        {
            lblLvl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLvl);
            mc.view_utility.applyLevelStyle(lblLvl);
            lblDMG = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblDMG);
            mc.view_utility.applyPowerStyle(lblDMG);
        }
        lblLvl.setString(mc.dictionary.getGUIString("lblLv.") + (modelInfo["level"] || "??"));
        lblDMG.setString(modelInfo["dame"] != undefined ? bb.utility.formatNumber(modelInfo["dame"]) : "???.???");
        var isVIP = modelInfo.vip;
        var avt = mc.view_utility.createAvatarPlayer(parseInt(modelInfo["avatar"]),isVIP);
        avt.x = cell.width * 0.145;
        avt.y = cell.height * 0.5;
        cell.addChild(avt);

        avt.registerTouchEvent(function () {
            mc.view_utility.showUserInfo(modelInfo["gameHeroId"], modelInfo);
        });
        switch (modelInfo["rank"]) {
            case 1:
                var rank1 = new ccui.ImageView("icon/ico_rank_gold.png", ccui.Widget.PLIST_TEXTURE);
                rank1.setPosition(575, 80);
                cell.addChild(rank1);
                break;
            case 2:
                var rank2 = new ccui.ImageView("icon/ico_rank_silver.png", ccui.Widget.PLIST_TEXTURE);
                rank2.setPosition(575, 80);
                cell.addChild(rank2);
                break;
            case 3:
                var rank3 = new ccui.ImageView("icon/ico_rank_bronze.png", ccui.Widget.PLIST_TEXTURE);
                rank3.setPosition(575, 80);
                cell.addChild(rank3);
                break;
            default:
                var colorNumberView = new mc.ColorNumberView();
                colorNumberView.setTypeNumber(mc.ColorNumberView.TYPE_NUM_LEVEL_UP, modelInfo["rank"], 0, 0);
                colorNumberView.setPosition(575, 80);
                cell.addChild(colorNumberView);
                break;
        }

        if (mc.GameData.playerInfo.getName() === modelInfo["name"]) {
            brk.loadTexture("patch9/pnl_name_pink.png", ccui.Widget.PLIST_TEXTURE);
        }

        cell.setCascadeColorEnabled(true);
        avt.setCascadeColorEnabled(true);
        return cell;
    },


    bindTopRewards: function () {
        var item = this.top;
        var rewards = mc.dictionary.worldBossMap["topDameRewardList"];
        rewards.sort(function (a, b) {
            return a["top"] - b["top"];
        });
        for (var i in rewards) {
            var reward = rewards[i];
            var logClone = item.clone();
            logClone.setVisible(true);
            var onRank = false;
            this._bindTopReward(logClone, reward, onRank);
            this.lvlTopReward.pushBackCustomItem(logClone);
        }
    },

    _bindTopReward: function (logClone, top) {
        var me = logClone.getChildByName("me");
        var rank = this.myRank;
        if (rank !== undefined) {
            var rankInfo = top["top"] + "";
            var array = rankInfo.split("~");
            var min = array[0];
            var max = array[1] || array[0];
            me.setVisible(rank !== 0 && rank <= max && rank >= min);
        } else {
            me.setVisible(false)
        }
        var arrRewards = mc.ItemStock.createArrJsonItemFromStr(top["reward"]);
        var assetView = bb.layout.linear(bb.collection.createArray(arrRewards.length, function (index) {
            var recipeCost = arrRewards[index];
            var view = mc.view_utility.createAssetView(recipeCost);
            view.setScale(0.9);
            return view;
        }), 0, bb.layout.LINEAR_HORIZONTAL, true);
        assetView.setAnchorPoint(1, 0.5);
        assetView.setPosition(logClone.width, logClone.height / 2);
        logClone.addChild(assetView);

        var rankUser = this.ranking[top["top"]];
        var string = logClone.setString(top["top"] === "0" ? mc.dictionary.getGUIString("(Last Hit)") : mc.dictionary.getGUIString("(Empty)"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        string.setColor(mc.color.GRAY);
        string.x = logClone.width * 0.3;
        switch (top["top"]) {
            case 0:
                var lastHit = new ccui.ImageView("icon/ico_bosskill.png", ccui.Widget.PLIST_TEXTURE);
                lastHit.setPosition(40, 35);
                logClone.addChild(lastHit);
                if (this.ranking["killer"]) {
                    string.setString(this.ranking["killer"]["name"]);
                    string.setColor(mc.color.BROWN_SOFT);
                }
                break;
            case 1:
                var rank1 = new ccui.ImageView("icon/ico_rank_gold.png", ccui.Widget.PLIST_TEXTURE);
                rank1.setPosition(40, 35);
                rank1.setScale(0.6);
                logClone.addChild(rank1);
                if (rankUser) {
                    string.setString(rankUser["name"]);
                    string.setColor(mc.color.BROWN_SOFT);
                }
                break;
            case 2:
                var rank2 = new ccui.ImageView("icon/ico_rank_silver.png", ccui.Widget.PLIST_TEXTURE);
                rank2.setPosition(40, 35);
                rank2.setScale(0.6);
                logClone.addChild(rank2);
                if (rankUser) {
                    string.setString(rankUser["name"]);
                    string.setColor(mc.color.BROWN_SOFT);
                }
                break;
            case 3:
                var rank3 = new ccui.ImageView("icon/ico_rank_bronze.png", ccui.Widget.PLIST_TEXTURE);
                rank3.setPosition(40, 35);
                rank3.setScale(0.6);
                logClone.addChild(rank3);
                if (rankUser) {
                    string.setString(rankUser["name"]);
                    string.setColor(mc.color.BROWN_SOFT);
                }
                break;
            default:
                var colorNumberView = new mc.ColorNumberView();
                colorNumberView.setTypeNumber(mc.ColorNumberView.TYPE_NUM_LEVEL_UP, top["top"], 0, 0);
                colorNumberView.setPosition(40, 35);
                colorNumberView.setScale(0.6);
                logClone.addChild(colorNumberView);
                if (rankUser) {
                    string.setString(rankUser["name"]);
                    string.setColor(mc.color.BROWN_SOFT);
                }
                break;
        }

    },

    _bindTopDMGReward: function (logClone, top) {
        var me = logClone.getChildByName("me");
        var iconDmg = logClone.getChildByName("icon_dmg");
        var lblDmg = logClone.getChildByName("lbl_dmg");
        lblDmg.setColor(mc.color.BROWN_SOFT);

        var arrRewards = mc.ItemStock.createArrJsonItemFromStr(top["rewards"]);
        var assetView = bb.layout.linear(bb.collection.createArray(arrRewards.length, function (index) {
            var recipeCost = arrRewards[index];
            var view = mc.view_utility.createAssetView(recipeCost);
            view.setScale(0.9);
            return view;
        }), 0, bb.layout.LINEAR_HORIZONTAL, true);
        assetView.setAnchorPoint(1, 0.5);
        assetView.setPosition(logClone.width, logClone.height / 2);
        logClone.addChild(assetView);

        if(mc.enableReplaceFontBM())
        {
            lblDmg = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblDmg);
        }
        lblDmg.setString(bb.utility.formatNumber(top["dame"], ","));

        switch (top["order"]) {
            case 1:
                var rank1 = new ccui.ImageView("icon/ico_rank_gold.png", ccui.Widget.PLIST_TEXTURE);
                rank1.setPosition(40, 35);
                rank1.setScale(0.6);
                logClone.addChild(rank1);
                break;
            case 2:
                var rank2 = new ccui.ImageView("icon/ico_rank_silver.png", ccui.Widget.PLIST_TEXTURE);
                rank2.setPosition(40, 35);
                rank2.setScale(0.6);
                logClone.addChild(rank2);
                break;
            case 3:
                var rank3 = new ccui.ImageView("icon/ico_rank_bronze.png", ccui.Widget.PLIST_TEXTURE);
                rank3.setPosition(40, 35);
                rank3.setScale(0.6);
                logClone.addChild(rank3);
                break;
            default:
                var colorNumberView = new mc.ColorNumberView();
                colorNumberView.setTypeNumber(mc.ColorNumberView.TYPE_NUM_LEVEL_UP, top["order"], 0, 0);
                colorNumberView.setPosition(40, 35);
                colorNumberView.setScale(0.6);
                logClone.addChild(colorNumberView);
                break;
        }
    },

    bindTopDMGRewards: function () {
        var item = this.dmg;
        var rewards = mc.dictionary.worldBossMap["maxDameRewardList"];
        for (var i in rewards) {
            var reward = rewards[i];
            var logClone = item.clone();
            logClone.setVisible(true);
            this._bindTopDMGReward(logClone, reward);
            this.lvlTopDmgReward.pushBackCustomItem(logClone);
        }
    },

    bindTopLayer: function () {
        mc.protocol.getTopDamageWorldBoss(function (result) {
            if (result) {
                this._bindRanking(result);
            }
        }.bind(this));
    },

    bindMyRanking: function (top) {
        var cellMap = bb.utility.arrayToMap(this.userRank.getChildren(), function (child) {
            return child.getName();
        });

        var my_rank = cellMap["my_rank"];
        var dmg_ranking = cellMap["dmg_ranking"];
        var icon_crown = cellMap["icon_crown"];
        var node_rank = cellMap["node_rank"];
        var icon_dmg = cellMap["icon_dmg"];
        var lbl_total_dmg = cellMap["lbl_total_dmg"];
        var lbl_my_dmg = cellMap["lbl_my_dmg"];
        var hero_img = cellMap["hero_img"];

        if(mc.enableReplaceFontBM())
        {
            my_rank = mc.view_utility.replaceBitmapFontAndApplyTextStyle(my_rank);
            dmg_ranking = mc.view_utility.replaceBitmapFontAndApplyTextStyle(dmg_ranking);
            lbl_total_dmg = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl_total_dmg);
        }


        my_rank.setColor(mc.color.BROWN_SOFT);
        dmg_ranking.setColor(mc.color.BROWN_SOFT);
        lbl_total_dmg.setColor(mc.color.BROWN_SOFT);
        lbl_my_dmg.setColor(mc.color.BROWN_SOFT);

        my_rank.setString(mc.dictionary.getGUIString("My Rank"));
        dmg_ranking.setString(mc.dictionary.getGUIString("Damage Ranking"));
        lbl_total_dmg.setString(mc.dictionary.getGUIString("Total Damage"));

        var colorNumberView = new mc.ColorNumberView();
        var topElement = this.myRank = top ? top["rank"] : "0";
        colorNumberView.setTypeNumber(mc.ColorNumberView.TYPE_NUM_LEVEL_UP, topElement, 0, 0);
        node_rank.removeAllChildren();
        colorNumberView.setPosition(0, 0);
        node_rank.addChild(colorNumberView);
        lbl_my_dmg.setString(top ? bb.utility.formatNumber(top["dame"]) : "???");

        if (!this._bossView) {
            var bossInfo = mc.GameData.worldBossSystem.getBossInfo();
            if (bossInfo) {
                var bossIndex = bossInfo["bossIndex"];
                var creatureView = this._bossView = mc.BattleViewFactory.createCreatureGUIByIndex(bossIndex);
                creatureView.scale = 0.6;
                creatureView.setPosition(hero_img.x - (cc.sys.isNative ? 0 : hero_img.width * 0.25), hero_img.y - hero_img.height * 0.4);
                this.userRank.addChild(creatureView);
            }
        }
    },

    _bindRanking: function (result) {
        this.ranking = bb.utility.arrayToMap(result["top"], function (ob) {
            return ob["rank"];
        });
        this.ranking["killer"] = result["killer"];

        var tops = result["top"];
        var item = this.cellRank;
        for (var i in tops) {
            var top = tops[i];

            var mine = top["gameHeroId"] === mc.GameData.playerInfo.getId();
            if (mine) {
                this.bindMyRanking(top);
            }
            var logClone = item.clone();
            this.bindRecord(logClone, top, mine);
            this.lvlRanking.pushBackCustomItem(logClone);
        }
        this.bindTopDMGRewards();
        this.bindTopRewards();
    },

    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_WORLD_BOSS_RANKING;
    },

    isShowHeader: function () {
        return false;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});
