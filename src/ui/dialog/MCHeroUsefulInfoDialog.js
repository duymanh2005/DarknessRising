/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.HeroUsefulInfoDialog = bb.Dialog.extend({
    _heroInfo: null,
    _rankingHeroesData: null,

    ctor: function (heroIndex) {
        this._super();
        this._rankingHeroesData = mc.dictionary.rankingHeroesData;
        this._heroInfo = this._getHeroInfo(heroIndex);
        var node = ccs.load(res.widget_hero_userful_info_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title = rootMap["lblDialogTitle"];
        title.setString(mc.dictionary.getGUIString("lblInfo"));
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
        this.pnlHero = rootMap["pnlHero"];


        btnExit.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        this._initAvatar(this._heroInfo);
        this._initHeroName(this._heroInfo);
        this.addSeperator();
        this._initProgressCell(this._heroInfo);
        this.addSeperator();
        this._initDescription(this._heroInfo);
    },

    _initAvatar : function(hero)
    {
        var panel = this.pnlHero.clone();
        panel.removeAllChildren();
        var heroInfo = mc.dictionary.getHeroDictByIndex(hero.index);
        var widget = new mc.HeroAvatarView(heroInfo);
        widget.setVisibleSurfaceInfo(false);

        widget.scale = 1.0;
        widget.anchorX = 0.5;
        widget.anchorY = 0.5;
        panel.setContentSize({width : panel.width,height : widget.height});
        panel.addChild(widget);
        widget.x = panel.width*0.5;
        widget.y = panel.height*0.5;
        this.listView.pushBackCustomItem(panel);
    },

    _initHeroName : function(hero)
    {
        var pnlHero = this.pnlHero.clone();
        var lblHeroName = pnlHero.getChildByName("lblName");
        var lblHeroCLass = pnlHero.getChildByName("lblClass");
        var h = mc.dictionary.getHeroDictByIndex(hero.index);
        if(mc.enableReplaceFontBM())
        {
            lblHeroName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblHeroName);
            lblHeroName.setFontSize(0.9*lblHeroName.getFontSize());
            lblHeroName.setColor(mc.color.YELLOW_SOFT);
            lblHeroCLass = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblHeroCLass);
            lblHeroCLass.setFontSize(0.75*lblHeroCLass.getFontSize());
        }
        else
        {
            lblHeroName.setVisible(true);
            lblHeroName.scale = 0.9;
            lblHeroName.setColor(mc.color.YELLOW_SOFT);
            lblHeroCLass.setVisible(true);
            lblHeroCLass.scale = 0.75;
        }

        lblHeroName.setString(h.name);
        var element = mc.dictionary.getGUIString("lblElement") + " : " + mc.dictionary.getGUIString(h.element);
        lblHeroCLass.setString(element);
        lblHeroCLass.setColor(mc.color.WHITE_NORMAL);
        this.listView.pushBackCustomItem(pnlHero);
    },

    _getHeroInfo: function (index) {
        for (var i in this._rankingHeroesData) {
            var hero = this._rankingHeroesData[i];
            var tempIndex = parseInt(hero.index);
            var delta = Math.abs(tempIndex - index);
            if (delta < 5) {
                return hero;
            }
        }
        return null;
    },

    _initDescription: function (data) {
        var lan = mc.storage.readSetting()["language"];
        var description = lan === "vi" ? data.description_vi : data.description_en;
        if (description) {
            var header = this._createHeader(mc.dictionary.getGUIString("lblMoreInfo"));
            this.listView.pushBackCustomItem(header);
            var content = description.split(",");
            var str = "";
            for (var i = 0; i < content.length; i++) {
                str += "- " + this._upperFirstChar(content[i]) + "\n";
            }
            this.addContent([str]);

            //var str = [];
            //for (var i = 0; i < content.length; i++) {
            //    str.push("- " + this._upperFirstChar(content[i]) );
            //}
            //this.addContent(str);
        }
    },

    _upperFirstChar: function (str) {
        var newStr = str;
        if (str) {
            newStr = str.charAt(0).toUpperCase() + str.substring(1);
        }
        return newStr;
    },

    addContent: function (content) {
        for (var i in content) {
            var lbl = null;
            if(mc.enableReplaceFontBM())
            {
                lbl = mc.view_utility.createTextFromFontBitmap(this.content._fntFileName);
                lbl.setMultiLineString(content[i],this.listView.width * 0.85 * (2 - lbl.getScaleX()), cc.TEXT_ALIGNMENT_LEFT);
                mc.view_utility.applyDialogContentStyle(lbl);
                lbl.x += 30
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

    _initProgressCell: function (data) {
        var header = this._createHeader(mc.dictionary.getGUIString("lblUseful"));
        this.listView.pushBackCustomItem(header);
        _createProgress = function (current, max, text) {
            //var nodeProgress = new ccui.Node();
            var cur = parseInt(current);
            var layoutProgress = new ccui.Layout();
            layoutProgress.width = this.listView.width;
            layoutProgress.height = 40;
            layoutProgress.anchorX = 0.5;
            layoutProgress.anchorY = 0.5;

            var lblMsg = this._lblMsg = bb.framework.getGUIFactory().createText("", res.font_cam_stroke_32_export_fnt);
            lblMsg.setColor(mc.color.WHITE_NORMAL);
            //lblMsg.getVirtualRenderer().setBoundingWidth(500);
            lblMsg.setString(text);
            if(mc.enableReplaceFontBM())
            {
                lblMsg = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblMsg);
                lblMsg.setFontSize(18);
            }
            //lblMsg.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_LEFT);
            //lblMsg.setAlignment(cc.TEXT_ALIGNMENT_LEFT);
            lblMsg.anchorX = 0;
            lblMsg.anchorY = 0.5;
            lblMsg.height = 40;
            lblMsg.setScale = 0.75;
            lblMsg.width = layoutProgress.width * 0.25;
            lblMsg.x = layoutProgress.width * 0.17;
            lblMsg.y = layoutProgress.height * 0.6;
            layoutProgress.addChild(lblMsg);


            var progressBrk = new ccui.ImageView("bar/Small_Frame.png", ccui.Widget.PLIST_TEXTURE);
            progressBrk.setScale9Enabled(true);
            //progressBrk.width = this.listView.width * 0.4;
            progressBrk.x = layoutProgress.width * 0.6;
            progressBrk.y = layoutProgress.height * 0.5;
            progressBrk.scaleX = 1.5;
            //progressBrk.height = 20;
            progressBrk.anchorX = 0;
            progressBrk.anchorY = 0.5;
            layoutProgress.addChild(progressBrk);
            layoutProgress.setCascadeOpacityEnabled(true);

            var progress = new cc.ProgressTimer(new cc.Sprite("#bar/Small_MP.png"));
            //progress.width = progressBrk.width;
            //progress.height = 20;
            progress.anchorX = 0;
            progress.anchorY = 0.5;
            progress.x = progressBrk.x;
            progress.y = progressBrk.y;
            progress.setCascadeOpacityEnabled(true);
            progress.setBarChangeRate(cc.p(1.0, 0.0));
            progress.setMidpoint(cc.p(0.0, 1.0));
            progress.scaleX = 1.5;
            progress.type = cc.ProgressTimer.TYPE_BAR;
            var pc = cur > 0 ? Math.round(cur / max * 100) : 0;
            progress.setPercentage(pc);
            layoutProgress.addChild(progress);
            return layoutProgress;

        }.bind(this);

        var layout = new ccui.Layout();
        layout.width = this.listView.width;
        layout.height = 160;
        layout.anchorX = 0.5;
        layout.anchorY = 0.5;
        layout.setCascadeOpacityEnabled(true);
        var maxValue = 10;
        for (var i in data) {
            var progress = null;
            if (i === "world") {
                progress = _createProgress(data[i], maxValue, mc.dictionary.getGUIString("World"));
                progress.x = layout.width * 0.5;
                progress.y = layout.height * 0.75;
            }
            else if (i === "arena") {
                progress = _createProgress(data[i], maxValue, mc.dictionary.getGUIString("lblArena"));
                progress.x = layout.width * 0.5;
                progress.y = layout.height * 0.5;
            }
            else if (i === "boss") {
                progress = _createProgress(data[i], maxValue, mc.dictionary.getGUIString("Boss"));
                progress.x = layout.width * 0.5;
                progress.y = layout.height * 0.25;
            }
            else if (i === "chaos") {
                progress = _createProgress(data[i], maxValue, mc.dictionary.getGUIString("lblChaosCastle"));
                progress.x = layout.width * 0.5;
                progress.y = layout.height * 0;
            }
            if (progress) {
                layout.addChild(progress);
            }
        }
        this.listView.pushBackCustomItem(layout);
    },

    //srollToBottom: function () {
    //    if (this.listView) {
    //        this.listView.scrollToBottom(100, false);
    //    }
    //},


    _createHeader: function (header) {
        var lbl = null;
        if(mc.enableReplaceFontBM())
        {
            lbl = mc.view_utility.createTextFromFontBitmap(this.title._fntFileName);
            mc.view_utility.applyDialogHeaderStyle(lbl);
            lbl.setColor(mc.color.YELLOW_SOFT);
            lbl.x += 30;
        }
        else
        {
            lbl = this.title.clone();
            lbl.setScale(0.8);
            lbl.setVisible(true);
            lbl.setColor(mc.color.YELLOW_SOFT);
        }
        lbl.setString(header);
        return lbl;
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