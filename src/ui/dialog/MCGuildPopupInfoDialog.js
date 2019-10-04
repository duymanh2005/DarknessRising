/**
 * Created by long.nguyen on 11/5/2018.
 */
mc.GuildPopupInfoDialog = bb.Dialog.extend({
    ctor: function (jsonData) {
        this._super();
        var arenaDict = mc.dictionary.arenaDictionary;

        var node = ccs.load(res.widget_guild_popup_info, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var lblInfomation = rootMap["lblInfomation"];
        var lblGuildHost = rootMap["lblGuildHost"];
        lblGuildHost.setColor(mc.color.YELLOW);
        lblInfomation.setString(mc.dictionary.getGUIString("lblInfo"));
        lblInfomation.setColor(mc.color.YELLOW);
        var panelInfo = rootMap["pnlGuildInfo"];
        var panelInfoMap = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });

        var flagBG = panelInfoMap["flagBG"];
        var flagBGMap = bb.utility.arrayToMap(flagBG.getChildren(), function (child) {
            return child.getName();
        });
        var flag_base = flagBGMap["flag_base"];
        var flagIcon = flagBGMap["flagIcon"];

        var lblGuildName = rootMap["lblGuildName"];
        var lblGuildMem = panelInfoMap["lblGuildMem"];
        var lblId = panelInfoMap["lblId"];
        var lblLevel = panelInfoMap["lblLevel"];
        lblLevel.setString(mc.dictionary.getGUIString("Require Level"));
        var lblLevelCode = panelInfoMap["lblLevelReq"];
        var lblRank = panelInfoMap["lblRank"];
        lblRank.setString(mc.dictionary.getGUIString("Require Rank"));
        var lblRankCode = panelInfoMap["lblRankCode"];
        var lblType = panelInfoMap["lblType"];
        var lblTypeText = panelInfoMap["lblTypeText"];
        lblType.setString(mc.dictionary.getGUIString("JoinType"));
        lblTypeText.setString(mc.dictionary.getGUIString("Accept All"));

        var lblNotice = rootMap["lblNotice"];
        lblNotice.setString(mc.dictionary.getGUIString("Notice"));
        var pnlNotice = rootMap["pnlNotice"];
        var pnlNoticeMap = bb.utility.arrayToMap(pnlNotice.getChildren(), function (child) {
            return child.getName();
        });
        var lblNoticeInfo = pnlNoticeMap["lblNoticeInfo"];

        var btnClose = this._btnClose = rootMap["btnClose"];
        var btnJoin = this._btnJoin =  rootMap["btnJoin"];
        btnClose.setString(mc.dictionary.getGUIString("lblClose"));
        btnJoin.setString(mc.dictionary.getGUIString("lblJoin"));


        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        btnJoin.registerTouchEvent(function () {
            mc.protocol.requestJoinGuild(function (result) {
                bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("Send Request Success"), function () {
                }).show();
            }.bind(this), jsonData["id"]);
            this.close();
        }.bind(this));


        //bind data
        if (jsonData["ownerName"]) {
            lblGuildHost.setString(jsonData["ownerName"]);
            lblGuildHost.setVisible(true);
        }
        else {
            lblGuildHost.setVisible(false);
        }

        lblGuildName.setString(jsonData.name);
        lblGuildName.setColor(mc.color.YELLOW);
        lblGuildMem.setString(jsonData.memberNo + '/' + jsonData.maxMemberNo);
        lblId.setString('ID : ' + jsonData.id);
        var jsonDatum = jsonData["guildReqs"] || {};
        lblLevelCode.setString(jsonDatum.level || "1");
        lblRankCode.setString(arenaDict.mapLeague[jsonDatum.rank || "D"].name);
        if (jsonData.notice) {
            lblNoticeInfo.setMultiLineString(jsonData.notice, pnlNotice.width * 0.99);
        }
        else {
            lblNoticeInfo.setString('');
        }

        var flagDir = "UI_Asset_Flag/ico_flag/colour_base/";
        var flags = ["guildflag_green.png", "guildflag_mix1.png", "guildflag_purple.png", "guildflag_red.png"];
        flag_base.loadTexture(flagDir + flags[jsonData["flag"]], ccui.Widget.PLIST_TEXTURE);
        flagIcon.loadTexture(iconDir + icons[jsonData["logo"]], ccui.Widget.PLIST_TEXTURE);
    },

    setJoinButtonVisible:function(value)
    {
        if(!value )
        {
            this._btnClose.x = this._root.width/2;
            this._btnJoin.setVisible(false);
        }
    },

    overrideCloseAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    },
    overrideShowAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.setOpacity(0);
        this.runAction(cc.sequence([cc.fadeIn(0.3)]));
        return 0.3;
    }

});
