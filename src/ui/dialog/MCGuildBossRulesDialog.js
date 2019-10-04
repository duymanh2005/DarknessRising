/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.GuildBossRulesDialog = bb.Dialog.extend({

    ctor: function () {
        this._super();
        var node = ccs.load(res.widget_rules_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title = rootMap["lblDialogTitle"];
        title.setString(mc.dictionary.getGUIString("Guild Boss"));
        if(mc.enableReplaceFontBM())
        {
            title = mc.view_utility.replaceBitmapFontAndApplyTextStyle(title);
            mc.view_utility.applyDialogTitleStyle(title);
        }
        else
        {
            title.setColor(mc.color.YELLOW_SOFT);
        }
        var brk = rootMap["brk"];
        var btnExit = rootMap["btnExit"];
        this.title = rootMap["title"];
        this.content = rootMap["content"];
        this.listView = brk.getChildByName("list_view");
        this.listView.setGravity(ccui.ListView.GRAVITY_LEFT);

        btnExit.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        var data = mc.dictionary.guildBossRulesData;

        var lan = mc.storage.readSetting()["language"];
        var creditContent = data[lan || "en"];

        for (var i in creditContent) {
            var ob = creditContent[i];
            this.addHeader(ob["header"]);
            this.addContent(ob["content"]);
            this.addSeperator();
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