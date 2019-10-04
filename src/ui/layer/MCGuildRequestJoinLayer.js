/**
 * Created by long.nguyen on 4/5/2018.
 */


mc.GuildRequestJoinLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this.parseCCStudio(res.layer_guild_request_join);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("Request"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var cell = this.cell = rootMap["cell"];
        cell.setVisible(false);
        var btnRefresh = rootMap["btnRefresh"];
        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        var lvlMem = this.lvlMem = rootMap["lvlMem"];
        var lblEmpty = this.lblEmpty = rootMap["lblEmpty"];
        lblEmpty.setString(mc.dictionary.getGUIString("No Result"));
        lvlMem.setVisible(false);
        lblEmpty.setVisible(false);
        btnRefresh.setVisible(true);
        btnRefresh.registerTouchEvent(function () {
            this.bindRequestList(lvlMem, true);
        }.bind(this));
        this.bindRequestList(lvlMem, false)
    },


    bindRequestList: function (listView, isFromServer) {
        listView.removeAllChildren();
        var createList = function (members) {
            var array = bb.collection.createArray(members.length, function (index) {
                var cell = this.cell.clone();
                this.bindMemberInfoCell(cell, members[index]);
                cell.setVisible(true);
                return cell;
            }.bind(this));
            var layout = bb.layout.linear(array, 0, bb.layout.LINEAR_VERTICAL);
            listView.pushBackCustomItem(layout);
        }.bind(this);
        if (mc.GameData.guildManager.getRequests() && !isFromServer) {
            listView.setVisible(true);
            this.lblEmpty.setVisible(false);
            createList(mc.GameData.guildManager.getRequests());
        } else {
            mc.protocol.listJoinRequest(function (result) {
                if (result && mc.GameData.guildManager.getRequests() && mc.GameData.guildManager.getRequests().length > 0) {
                    listView.setVisible(true);
                    this.lblEmpty.setVisible(false);
                    createList(mc.GameData.guildManager.getRequests());
                }
                else {
                    listView.setVisible(false);
                    this.lblEmpty.setVisible(true);
                }
            }.bind(this), this.guildID);
        }
    },

    bindMemberInfoCell: function (cell, info) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        cell.setVisible(true);

        var lblName = cellMap["lblName"];
        var lblLvl = cellMap["lblLvl"];
        var lblPower = cellMap["lblPower"];
        var imgPower = cellMap["icon_power"];
        var btnReject = cellMap["btnReject"];
        var btnAccept = cellMap["btnAccept"];
        var iconRank = cellMap["icon_rank"];


        lblName.setTextColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLvl.setColor(mc.color.BROWN_SOFT);

        btnAccept.setVisible(false);
        btnReject.setVisible(false);
        btnAccept.setString(mc.dictionary.getGUIString("lblAccept"));
        btnReject.setString(mc.dictionary.getGUIString("lblDeny"));

        cell._touchScale = 0;
        var myInfo = mc.GameData.guildManager.getMyInfo();

        btnAccept.setString(mc.dictionary.getGUIString("lblAccept"));
        btnReject.setString(mc.dictionary.getGUIString("lblDeny"));
        btnAccept.setVisible(true);
        btnReject.setVisible(true);
        btnAccept.registerTouchEvent(function (btnAccept) {
            var loadingId = mc.view_utility.showLoadingDialog();
            cell.removeFromParent();
            mc.protocol.acceptRequest(function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("You accept this request Join"), function () {
                    }).show();
                }
                this.bindRequestList(this.lvlMem, true);
            }.bind(this), info["id"])

        }.bind(this));

        btnReject.registerTouchEvent(function (btnReject) {
            var loadingId = mc.view_utility.showLoadingDialog();
            cell.removeFromParent();
            mc.protocol.declineRequest(function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("You reject this request Join"), function () {
                    }).show();
                }
                this.bindRequestList(this.lvlMem, true);
            }.bind(this), info["id"])

        }.bind(this));


        lblName.setString(info["name"] || info["gameHeroName"]);
        lblLvl.setString(mc.dictionary.getGUIString("lblLv.") + info["level"]);
        lblPower.setString(info["teamPower"] ? bb.utility.formatNumber(info["teamPower"]) : "?????");
        if (info["teamPower"]) {
            lblPower.setVisible(true);
            imgPower.setVisible(true);
            lblPower.setString(bb.utility.formatNumber(info["teamPower"]));
        }
        else {
            lblPower.setVisible(false);
            imgPower.setVisible(false);
        }

        var avt = mc.view_utility.createAvatarPlayer(parseInt(info["avatar"]));
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
        btnAccept.setCascadeColorEnabled(true);
        btnReject.setCascadeColorEnabled(true);
        avt.setCascadeColorEnabled(true);
        cell.setCascadeOpacityEnabled(true);
        avt.setCascadeOpacityEnabled(true);
        return cell;

    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_REQUEST_JOIN;
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


