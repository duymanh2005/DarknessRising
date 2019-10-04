/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.ClanArenaRulesDialog = bb.Dialog.extend({

    _arenaRewardsData: [
        {
            "rank": 1,
            "reward": "11998/1000"
        },
        {
            "rank": 2,
            "reward": "11998/700"
        },
        {
            "rank": 3,
            "reward": "11998/500"
        },
        //{
        //    "rank": 4,
        //    "reward": "11998/200"
        //}

    ],

    ctor: function () {
        this._super();
        var node = ccs.load(res.widget_rules_clan_arena_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title = rootMap["lblDialogTitle"];
        if(mc.enableReplaceFontBM())
        {
            title = mc.view_utility.replaceBitmapFontAndApplyTextStyle(title);
            mc.view_utility.applyDialogTitleStyle(title);
        }
        else
        {
            title.setColor(mc.color.YELLOW_SOFT);
        }
        title.setString(mc.dictionary.getGUIString("lblClanArena"));
        var brk = rootMap["brk"];
        var btnExit = rootMap["btnExit"];
        var cell = this._cell = rootMap["pnlTop"];
        this.title = rootMap["title"];
        this.content = rootMap["content"];
        this.listView = brk.getChildByName("list_view");
        this.listView.setGravity(ccui.ListView.GRAVITY_LEFT);

        btnExit.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        var data = mc.dictionary.clanRankingRulesData;

        var lan = mc.storage.readSetting()["language"];
        var creditContent = data[lan || "en"];

        for (var i in creditContent) {
            var ob = creditContent[i];
            this.addHeader(ob["header"]);
            this.addContent(ob["content"]);
            this.addSeperator();
        }
        this._initTopReward();
    },

    _initTopReward: function () {
        //    - Top 1: 1000 Relic + Trong Clan có thêm Boss Arena (với giải thưởng HOT) trong 1 tuần tiếp theo
        //- Top 2: 700 Relic
        //- Top 3: 500 Relic
        //- Top 4-10: 200 Relic
        var listRewards = this._arenaRewardsData;
        var top = this._cell;
        for (var i in listRewards) {
            var rewards = listRewards[i];
            var arrRewards = mc.ItemStock.createArrJsonItemFromStr(rewards["reward"]);
            var topClone = top.clone();
            this._bindTopRewards(topClone, arrRewards, rewards);
            this.listView.pushBackCustomItem(topClone);
        }

    },

    _bindTopRewards: function (cell, arrRewards, rewards, rank) {
        var top = cell.getChildByName("top");
        top.setVisible(true);
        var lblTop = top.getChildByName("lbl_top");
        //lblTop.setColor(mc.color.BROWN_SOFT);
        lblTop.setString(mc.dictionary.getGUIString("Top") + " " + (rewards.rank === 21 ? "20+" : rewards.rank));

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
            view.setScale(0.9);
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


    addButton: function (resource, title, func) {
        var button = new ccui.ImageView(resource, ccui.Widget.PLIST_TEXTURE);
        button.setScale9Enabled(true);
        button.width = 300;
        button.setAnchorPoint(0, 0.5);
        button.setString(title, res.font_UTMBienvenue_stroke_32_export_fnt, mc.const.FONT_SIZE_24);
        button.registerTouchEvent(func.bind(this));
        this.listView.pushBackCustomItem(button);
    },


    addHeader: function (header) {
        var lbl = null;
        if(mc.enableReplaceFontBM())
        {
            lbl = mc.view_utility.createTextFromFontBitmap(this.title._fntFileName);
            mc.view_utility.applyDialogHeaderStyle(lbl);
        }
        else
        {
            lbl = this.title.clone();
            lbl.setScale(0.8);
            lbl.setColor(mc.color.YELLOW_SOFT);
        }
        lbl.setVisible(true);
        lbl.setString(header);
        this.listView.pushBackCustomItem(lbl);
    },
    addContent: function (content) {
        for (var i in content) {
            var lbl = null;
            if(mc.enableReplaceFontBM())
            {
                lbl = mc.view_utility.createTextFromFontBitmap(this.content._fntFileName);
                lbl.setMultiLineString(content[i],this.listView.width * 0.90 * (2 - lbl.getScaleX()), cc.TEXT_ALIGNMENT_LEFT);
                mc.view_utility.applyDialogContentStyle(lbl);
            }
            else
            {
                lbl = this.content.clone();
                lbl.setScale(0.75);
                lbl.setMultiLineString(content[i], this.listView.width * 0.90 * (2 - lbl.getScaleX()), cc.TEXT_ALIGNMENT_LEFT);
                lbl.setVisible(true);
            }
            lbl.setVisible(true);
            this.listView.pushBackCustomItem(lbl);
        }
    },
    addSeperator: function () {
        var lbl = this.title.clone();
        lbl.setString("     ");
        lbl.setVisible(true);
        this.listView.pushBackCustomItem(lbl);
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