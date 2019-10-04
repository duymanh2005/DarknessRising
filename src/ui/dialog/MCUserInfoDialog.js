/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.UserInfoDialog = bb.Dialog.extend({

    ctor: function (playerInfo, modelInfo, ignorChat) {
        this._super();
        var node = ccs.load(res.user_info_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var info = playerInfo["info"];

        var userPanel = rootMap["userPanel"];
        var teamPanel = rootMap["teamPanel"];
        var btnAction = rootMap["btnAction"];
        var btnGuild = rootMap["btnGuild"];
        var btnClose = rootMap["btnClose"];
        var lblGuild = rootMap["lblGuild"];
        var lblTitle = rootMap["lblTitle"];

        var lblBattleTeam = rootMap["lblBattleTeam"];
        var avtNode = userPanel.getChildByName("nodeAvt");
        var nodeTeam = teamPanel.getChildByName("nodeTeam");
        var name = userPanel.getChildByName("lblName");
        var power = userPanel.getChildByName("lblPower");
        var iconPower = userPanel.getChildByName("iconPower");
        var level = userPanel.getChildByName("lvl");
        var league = userPanel.getChildByName("lblLeague");
        var iconLeague = userPanel.getChildByName("iconLeague");
        lblTitle.setString(mc.dictionary.getGUIString("lblInfo"));
        lblBattleTeam.setString(mc.dictionary.getGUIString("lblBattleTeam"));

        var guildInfo = playerInfo["guild_info"];
        var pnlGuild = userPanel.getChildByName("pnlGuild");
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");
        //var guildInfo = modelInfo.guildInfo;
        if (guildInfo) {
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
            btnGuild.setVisible(false);
        } else {
            var myGuild = mc.GameData.guildManager.getGuildInfo();
            pnlGuild.setVisible(false);
            if (myGuild) {
                btnGuild.setVisible(true);
                btnGuild.setString(mc.dictionary.getGUIString("Invite Clan"));
                var clickGuildInvite = function () {
                    mc.protocol.inviteJoinGuild(function () {
                        mc.view_utility.showSuggestText(mc.dictionary.getGUIString("Send Request Success"));
                        btnGuild.setGray(true);
                    }.bind(this), playerInfo["gameHeroId"]);
                }.bind(this);
                btnGuild.registerTouchEvent(function () {
                    clickGuildInvite();
                }.bind(this));
            } else {
                btnGuild.setVisible(false);
            }
        }

        var btnRelic = rootMap["btnRelic"];
        //var iconRelic = btnRelic.getChildByName("icon");
        //iconRelic.loadTexture("res/png/consumable/reliccoins.png",ccui.Widget.LOCAL_TEXTURE);
        //iconRelic.scale = 1.5;
        btnRelic.setString(mc.dictionary.getGUIString("lblTransferRelicCoin"));
        btnRelic.setUserData(modelInfo);
        if(modelInfo["gameHeroId"] === mc.GameData.playerInfo.getId())
        {
            btnRelic.setVisible(false);
        }
        else
        {
            btnRelic.setVisible(true);
        }
        btnRelic.registerTouchEvent(function () {
            mc.view_utility.showTransferRelicDialog(modelInfo);
        }.bind(this));

        name.setString(info["gameHeroName"]);

        if (modelInfo["teamPower"]) {
            power.setVisible(true);
            iconPower.setVisible(true);
            power.setString(bb.utility.formatNumber(modelInfo["teamPower"]));
        }
        else {
            power.setVisible(false);
            iconPower.setVisible(false);
        }
        level.setString(mc.dictionary.getGUIString("lblLv.") + ((playerInfo["info"] && playerInfo["info"]["level"]) || modelInfo["level"] || mc.RankingManager.getRankerLevel(modelInfo) || "??"));

        var leagueRes = mc.const.MAP_LEAGUE_BY_CODE[info["league"]];
        iconLeague.loadTexture(leagueRes.url, ccui.Widget.PLIST_TEXTURE);
        league.setString(leagueRes.name);
        var isVIP = playerInfo.vip;
        var avt = mc.view_utility.createAvatarPlayer(parseInt(modelInfo["avatar"]),isVIP);
        avt.x = avtNode.x;
        avt.y = avtNode.y;
        userPanel.addChild(avt);
        userPanel.setCascadeOpacityEnabled(true);

        var lbl = mc.dictionary.getGUIString("lblChat");
        var clickAction = function () {
            mc.view_utility.showComingSoon();
        }.bind(this);

        var isFriendNow = false;
        var arrFriendInfo = mc.GameData.friendManager.getArrayFriendInfo();
        if (arrFriendInfo) {
            isFriendNow = bb.collection.findBy(arrFriendInfo, function (friendInfo, modelInfo) {
                return friendInfo["gameHeroId"] === modelInfo["gameHeroId"];
            }, modelInfo);
        }

        if (!isFriendNow) {
            lbl = mc.dictionary.getGUIString("lblAddFriend");
            clickAction = function () {
                var friendManager = mc.GameData.friendManager;
                if (friendManager && friendManager.getArrayFriendInfo() && friendManager.getArrayFriendInfo().length >= mc.const.MAX_FRIEND) {

                    var dialog = new mc.DefaultDialog()
                        .setTitle(mc.dictionary.getGUIString("lblWarning"))
                        .setMessage(mc.dictionary.getExceptionString("lblMaxFriend"))
                        .enableOkButton(function () {
                            dialog.close();
                            closeFunc();
                        }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                    dialog.show();

                }
                else {

                    _performAddFriend = function()
                    {
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.requestAddFriend(modelInfo["gameHeroId"], function (result) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            if (result) {
                                btnAction.setColor(mc.color.BLACK_DISABLE_STRONG);
                                btnAction.setEnabled(false);
                                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtYourRequestSent"));
                            }
                        });
                    }.bind(this);
                    mc.storage.readAddFriendTouched();
                    if(!mc.storage.addFriendTouched)
                    {
                        mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblInfo"),mc.dictionary.getGUIString("lblAddFriendInfo"),function(){
                            _performAddFriend();
                            mc.storage.addFriendTouched = true;
                            mc.storage.saveAddFriendTouched();
                        }.bind(this));
                    }
                    else
                    {
                        _performAddFriend();
                    }

                }

            }.bind(this);
        }

        if (ignorChat && isFriendNow) {
            btnAction.setVisible(false);
            if(!btnGuild.isVisible())
            {
                btnClose.x = root.width / 2;
            }
        }

        var actionLbl = btnAction.setString(lbl);
        btnAction.registerTouchEvent(function () {
            clickAction();
        }.bind(this));
        var closeLbl = btnClose.setString(mc.dictionary.getGUIString("lblClose"));
        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        nodeTeam.setScale(0.8);
        mc.view_utility.layoutTeamFormation({
            arrTeamFormation: info["battleTeam"],
            leaderIndex: info["leaderIndex"],
            mapHeroInfo: bb.utility.arrayToMap(info["heroes"], function (heroInfo) {
                return mc.HeroStock.getHeroId(heroInfo);
            })
        }, {
            nodeHero: nodeTeam
        }, true);

        this.setEnableClickOutSize(true);

    }

});

mc.view_utility.showUserInfo = function (userId, modelInfo, ignorChat) {
    if (!userId)
        return;
    var loadingId = mc.view_utility.showLoadingDialog();
    mc.protocol.viewPlayerProfile(userId, function (playerInfo) {
        mc.view_utility.hideLoadingDialogById(loadingId);
        if (playerInfo) {
            new mc.UserInfoDialog(playerInfo, modelInfo, ignorChat).show();
        }
    });
};