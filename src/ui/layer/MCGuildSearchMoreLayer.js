/**
 * Created by long.nguyen on 4/5/2018.
 */


mc.GuildSearchMoreLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this.parseCCStudio(res.layer_guild_search_more);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblSearchGuild"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var cell = this.cell = rootMap["cell"];
        cell.setVisible(false);
        var btnRefresh = rootMap["btnRefresh"];
        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        var lvlGuildList = this.lvlGuildList = rootMap["lvlGuildList"];
        var lblEmpty = this.lblEmpty = rootMap["lblEmpty"];
        lblEmpty.setString(mc.dictionary.getGUIString("No Result"));
        lvlGuildList.setVisible(false);
        lblEmpty.setVisible(false);
        btnRefresh.setVisible(true);
        btnRefresh.registerTouchEvent(function () {
            mc.protocol.guildList(function (result) {
                this.bindGuildList(result);
            }.bind(this));
        }.bind(this));
        this._loadGuildList();
    },

    _loadGuildList: function () {
        mc.protocol.guildList(function (result) {
            this.bindGuildList(result);
        }.bind(this));
    },

    bindGuildList: function (guildList) {
        this.lvlGuildList.removeAllChildren();

        if (guildList.length > 0) {
            this.lvlGuildList.setVisible(true);
            this.lblEmpty.setVisible(false);
            guildList.sort(function (a, b) {
                return a.level - b.level;
            })
        } else {
            this.lblEmpty.setVisible(true);
            this.lvlGuildList.setVisible(false);
            return;
        }


        var array = bb.collection.createArray(guildList.length, function (index) {
            var cell = this.cell.clone();
            this.bindGuildInfoCell(cell, guildList[index]);
            cell.setVisible(true);
            return cell;
        }.bind(this));
        var layout = bb.layout.linear(array, 0, bb.layout.LINEAR_VERTICAL);
        this.lvlGuildList.pushBackCustomItem(layout);
    },

    bindGuildInfoCell: function (cell, info) {
        var rootMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        var name = rootMap["lblName"];
        var member = rootMap["lblMember"];
        var level = rootMap["lblLv"];
        var pnlCup = rootMap["pnlCup"];
        var lblOwner = rootMap["lblOwner"];
        var points = pnlCup.getChildByName("lblPoints");
        var btnInfo = rootMap["btnInfo"];
        var flag = rootMap["flag"];
        var flag_icon = rootMap["flag_icon"];
        lblOwner.setVisible(false);


        name.setString(info["name"] || "?????");
        member.setString(info["memberNo"] + "/" + info["maxMemberNo"]);
        flag.loadTexture(flagDir + flags[info["flag"]], ccui.Widget.PLIST_TEXTURE);
        flag_icon.loadTexture(iconDir + icons[info["logo"]], ccui.Widget.PLIST_TEXTURE);
        level.setString(mc.dictionary.getGUIString("Level") + " " + info["level"]);
        points.setString(bb.utility.formatNumber(info["arenaPoint"]));
        lblOwner.setString(info["ownerName"]);


        name.setColor(mc.color.BROWN_SOFT);
        member.setColor(mc.color.BROWN_SOFT);
        level.setColor(mc.color.BROWN_SOFT);
        lblOwner.setColor(mc.color.BROWN_SOFT);

        btnInfo.setString(mc.dictionary.getGUIString("lblInfo"));

        btnInfo.registerTouchEvent(function () {
            //mc.view_utility.showComingSoon();
            var dialog = new mc.GuildPopupInfoDialog(info);
            //dialog.set
            dialog.setJoinButtonVisible(false);
            dialog.show();

        }.bind(this));

    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_SEARCH_MORE;
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


