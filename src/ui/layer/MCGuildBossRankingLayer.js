/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.GuildBossRankingLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_guild_boss_ranking);
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = rootMap["imgTitle"];
        var lblEmpty = this.lblEmpty = rootMap["lblEmpty"];
        this.lblEmpty.setString(mc.dictionary.getGUIString("No Result"));
        this.lblEmpty.setVisible(false);
        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblDMGReward"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var lvlRanking = this.lvlRanking = rootMap["lvlRanking"];

        this.cellRank = rootMap["cellRank"];


    },

    setData: function (data) {


        if (data && data.bossType) {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.getDamgeHistoryGuildBossInfo(data.bossType,data.stageIndex, function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result && result.dam_records && result.dam_records.length > 0) {
                    this.lblEmpty.setVisible(false);
                    var arrPlayer = result.dam_records;
                    arrPlayer = result.dam_records.sort(function (a, b) {
                        return b.dam - a.dam;
                    })
                    this._bindRanking(arrPlayer);
                }
                else {
                    this.lblEmpty.setVisible(true);
                }
            }.bind(this));
        }
    },


    bindRecord: function (cell, modelInfo) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        cell.setVisible(true);

        var lblName = cellMap["lblName"];
        var lblDMG = cellMap["lblDmg"];
        var brk = cellMap["brk"];

        lblDMG.setColor(mc.color.BROWN_SOFT);

        lblName.setString(modelInfo["name"]);
        lblDMG.setString(modelInfo["dam"] != undefined ? bb.utility.formatNumber(modelInfo["dam"]) : "???.???");

        var avt = mc.view_utility.createAvatarPlayer(parseInt(modelInfo["avatar"]),modelInfo.vip);
        avt.x = cell.width * 0.145;
        avt.y = cell.height * 0.5;
        cell.addChild(avt);

        //avt.registerTouchEvent(function () {
        //    mc.view_utility.showUserInfo(modelInfo["gameHeroId"], modelInfo);
        //});
        //switch (modelInfo["rank"]) {
        //    case 1:
        //        var rank1 = new ccui.ImageView("icon/ico_rank_gold.png", ccui.Widget.PLIST_TEXTURE);
        //        rank1.setPosition(575, 80);
        //        cell.addChild(rank1);
        //        break;
        //    case 2:
        //        var rank2 = new ccui.ImageView("icon/ico_rank_silver.png", ccui.Widget.PLIST_TEXTURE);
        //        rank2.setPosition(575, 80);
        //        cell.addChild(rank2);
        //        break;
        //    case 3:
        //        var rank3 = new ccui.ImageView("icon/ico_rank_bronze.png", ccui.Widget.PLIST_TEXTURE);
        //        rank3.setPosition(575, 80);
        //        cell.addChild(rank3);
        //        break;
        //    default:
        //        var colorNumberView = new mc.ColorNumberView();
        //        colorNumberView.setTypeNumber(mc.ColorNumberView.TYPE_NUM_LEVEL_UP, modelInfo["rank"], 0, 0);
        //        colorNumberView.setPosition(575, 80);
        //        cell.addChild(colorNumberView);
        //        break;
        //}

        if (mc.GameData.playerInfo.getName() === modelInfo["name"]) {
            brk.loadTexture("patch9/pnl_name_pink.png", ccui.Widget.PLIST_TEXTURE);
        }

        cell.setCascadeColorEnabled(true);
        avt.setCascadeColorEnabled(true);
        return cell;
    },

    _bindRanking: function (result) {
        //this.ranking = bb.utility.arrayToMap(result["top"], function (ob) {
        //    return ob["rank"];
        //});
        //this.ranking["killer"] = result["killer"];

        var tops = result;
        var item = this.cellRank;
        for (var i in tops) {
            var top = tops[i];

            var mine = top["name"] === mc.GameData.playerInfo.getName();
            //if (mine) {
            //    this.bindMyRanking(top);
            //}
            var logClone = item.clone();
            this.bindRecord(logClone, top, mine);
            this.lvlRanking.pushBackCustomItem(logClone);
        }
    },

    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_BOSS_RANKING;
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
