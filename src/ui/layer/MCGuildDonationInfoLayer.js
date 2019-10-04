/**
 * Created by long.nguyen on 4/5/2018.
 */


mc.GuildDonationInfoLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this.parseCCStudio(res.layer_guild_donation_info);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("Donate"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var cell = this.cell = rootMap["cell"];
        cell.setVisible(false);
        var lvlMem = this.lvlMem = rootMap["lvlMem"];
        var lblEmpty = this.lblEmpty = rootMap["lblEmpty"];
        lblEmpty.setString(mc.dictionary.getGUIString("No Result"));
        lvlMem.setVisible(false);
        lblEmpty.setVisible(true);
        //btnRefresh.registerTouchEvent(function () {
        //    this.bindRequestList(lvlMem,true);
        //}.bind(this));
        //this.bindDonationList();
    },

    setData: function (data) {
        if (data && data.donateList && data.donateList.length) {
            this.lblEmpty.setVisible(false);
            this.lvlMem.setVisible(true);
            this.bindDonationList(data.donateList);
        }
        else {
            this.lblEmpty.setVisible(true);
            this.lvlMem.setVisible(false);
        }
    },
    bindDonationList: function (data) {
        this.lvlMem.removeAllChildren();
        var donateData = mc.GameData.guildManager.getDonates();
        var array = bb.collection.createArray(data.length, function (index) {
            var cell = this.cell.clone();
            this.bindMemberInfoCell(cell, data[index],donateData);
            cell.setVisible(true);
            return cell;
        }.bind(this));
        var layout = bb.layout.linear(array, 0, bb.layout.LINEAR_VERTICAL);
        this.lvlMem.pushBackCustomItem(layout);

    },

    _createDataDonate: function (donateTimes, donateData) {
        var str = null;
        for (var i = 0; i < donateData.length; i++) {
            var item = donateData[i];
            var time = donateTimes[item.itemIndex];
            if (time) {
                var total = item.value * time;
                if (!str) {
                    str = '';
                }
                str += item.itemIndex + "/" + total + "#";
            }
        }
        if(str)
        {
            str = str.substring(0,str.length - 1);
        }
        return str;
    },

    bindMemberInfoCell: function (cell, info, donateData) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        cell.setVisible(true);
        var str = this._createDataDonate(info.donateTimes,donateData);

        var lblName = cellMap["lblName"];
        var lblLvl = cellMap["lblLvl"];
        var iconRank = cellMap["icon_rank"];
        var pnlItems = cellMap["pnlItems"];
        if(str)
        {
            var arrItems = mc.ItemStock.createArrJsonItemFromStr(str);
            var horLayout = this.horLayout = bb.layout.linear(bb.collection.createArray(arrItems.length, function (index) {
                var element = arrItems[index];
                var itemView = new mc.ItemView(element);
                itemView.setNewScale(0.67);
                itemView.registerViewItemInfo();
                //if (element["remainPacks"]) {
                //    itemView.setPackNumberText("x" + element["remainPacks"]);
                //}
                return itemView;
            }), 40);
            horLayout = mc.view_utility.wrapWidget(horLayout, pnlItems.width, false, {
                top: 7,
                left: -10,
                bottom: 10,
                a1: -32,
                a2: -32
            });
            pnlItems.addChild(horLayout);
            horLayout.anchorX = 0;
            horLayout.x = 0;
            horLayout.y = pnlItems.height * 0.5;
        }


        lblName.setTextColor(mc.color.BROWN_SOFT);
        lblLvl.setColor(mc.color.BROWN_SOFT);


        cell._touchScale = 0;
        var myInfo = mc.GameData.guildManager.getMyInfo();

        var getRankIcon = function (rank) {
            switch (rank) {
                case BANG_CHU:
                    return "icon/guild_leader.png";
                case PHO_BANG:
                    return "icon/guild_viceleader.png";
                case TRUONG_LAO:
                    return "icon/guild_truonglao.png";
                default:
                    return "icon/guild_member.png";
            }
        };

        iconRank.loadTexture(getRankIcon(info["role"]), ccui.Widget.PLIST_TEXTURE);
        iconRank.ignoreContentAdaptWithSize(true);

        lblName.setString(info["name"] || info["gameHeroName"]);
        lblLvl.setString(mc.dictionary.getGUIString("lblLv.") + info["level"]);


        var avt = mc.view_utility.createAvatarPlayer(parseInt(info["avatar"]),info.vip);
        avt.x = cell.width * 0.145;
        avt.y = cell.height * 0.5;
        cell.addChild(avt);

        avt.registerTouchEvent(function () {
            var tempHeroId = info["gameHeroId"];
            if (!tempHeroId) {
                var id = info["id"];
                if (id) {
                    var tempId = id.split("_");
                    if (tempId[0]) {
                        tempHeroId = tempId[0];
                    }
                }
            }
            mc.view_utility.showUserInfo(tempHeroId, info);
        });

        cell.setCascadeColorEnabled(true);
        avt.setCascadeColorEnabled(true);
        cell.setCascadeOpacityEnabled(true);
        avt.setCascadeOpacityEnabled(true);
        return cell;

    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_DONATE_INFO;
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


