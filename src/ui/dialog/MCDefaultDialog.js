/**
 * Created by long.nguyen on 5/22/2017.
 */
mc.DefaultDialog = bb.DefaultDialog.extend({

    ctor: function (title, color) {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.button_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_8_plist);

        this.setTitle(title || "", color);
        this.enableExitButton();

        var brkView = new ccui.ImageView("patch9/Grid_Panel.png", ccui.Widget.PLIST_TEXTURE);
        brkView.setScale9Enabled(true);
        brkView.width = 500;
        brkView.anchorX = 0;
        brkView.anchorY = 0;
        this.setBackgroundView(brkView);
        this.setAutoClose(true);
    },

    enableExitButton: function (funcExit) {
        var exitBtn = new ccui.ImageView("button/quit_button.png", ccui.Widget.PLIST_TEXTURE);
        exitBtn.scale = 0.75;
        this.setExitButton(exitBtn, function () {
            funcExit && funcExit();
        });
        return this;
    },

    enableYesNoButton: function (funcYes, funcNo) {
        var btn1 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblYes"));
        var btn2 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblNo"), undefined, undefined, "button/Orange_Round.png");
        this.setButton_1View(btn1, funcYes);
        this.setButton_2View(btn2, funcNo);
        return this;
    },

    setTitle: function (title, color) {
        var lbl = null;
        if(mc.enableReplaceFontBM())
        {
            lbl = this.titleLbl = mc.view_utility.createTextFromFontBitmap(res.font_UTMBienvenue_none_32_export_fnt);
            lbl.setString(title);
        }
        else
        {
            lbl = this.titleLbl = new ccui.TextBMFont(title, res.font_UTMBienvenue_none_32_export_fnt);
        }
        lbl.setColor(color || mc.color.BROWN_SOFT);
        var imgSpr = new ccui.ImageView("patch9/sep_header_pattern.png", ccui.Widget.PLIST_TEXTURE);
        var container = bb.layout.linear([imgSpr, lbl], 20, bb.layout.LINEAR_VERTICAL);
        lbl.x = imgSpr.x = container.width * 0.5;
        if(mc.enableReplaceFontBM())
        {
            lbl.y -= 15;
        }
        this.setTitleView(container);
        return this;
    },

    setMessage: function (message, color, align) {
        var lblMsg = bb.framework.getGUIFactory().createText("", res.font_UTMBienvenue_none_32_export_fnt);


        if(mc.enableReplaceFontBM())
        {
            lblMsg.getVirtualRenderer().setBoundingWidth(450);
            lblMsg.getVirtualRenderer().setAlignment(align || cc.TEXT_ALIGNMENT_CENTER);
        }
        else
        {
            lblMsg.getVirtualRenderer().setBoundingWidth(500);
            lblMsg.getVirtualRenderer().setAlignment(align || cc.TEXT_ALIGNMENT_CENTER);
        }
        lblMsg.setColor(color || mc.color.BROWN_SOFT);
        lblMsg.setString(message);
        if(mc.enableReplaceFontBM())
        {
            this.setContentView(lblMsg,20);
        }
        else
        {
            this.setContentView(lblMsg);
        }
        return this;
    },

    setContentView: function (contentView, margin) {
        if (contentView.height < 250) {
            this._dialogMargin = {
                top: (margin && margin.top) || 10,
                left: (margin && margin.left) || 30,
                bottom: (margin && margin.bottom) || 40,
                right: (margin && margin.right) || 30,
                ptContent: 40,
                pbContent: 50
            };
        } else {
            this._dialogMargin = {
                top: (margin && margin.top) || 10,
                left: (margin && margin.left) || 30,
                bottom: (margin && margin.bottom) || 20,
                right: (margin && margin.right) || 30,
                ptContent: 10,
                pbContent: 10
            };
        }
        this._super(contentView);
        return this;
    },

    reCalculatePositionAndContentSize: function () {
        this._super();
        var exitBtn = this.getButtonExit();
        if (exitBtn) {
            exitBtn.x = this._container.width - exitBtn.width * 0.5 * exitBtn.scale;
            exitBtn.y = this._container.height - exitBtn.height * 0.5 * exitBtn.scale;
        }
    }

});

mc.DefaultDialogType2 = bb.DefaultDialog.extend({

    ctor: function (title, color, bground) {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.button_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_5_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_6_plist);

        this.setTitle(title || "", color);
        this.enableExitButton();
        var brkView = new ccui.ImageView(bground ? bground : "patch9/pnl_Popup.png", ccui.Widget.PLIST_TEXTURE);
        brkView.setScale9Enabled(true);
        brkView.anchorX = 0;
        brkView.anchorY = 0;
        this.setBackgroundView(brkView);
        this.setAutoClose(true);
    },

    enableYesNoButton: function (funcYes, funcNo) {
        var btn1 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblYes"));
        var btn2 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblNo"), undefined, undefined, "button/Orange_Round.png");
        this.setButton_1View(btn1, funcYes);
        this.setButton_2View(btn2, funcNo);
        return this;
    },

    enableExitButton: function (funcExit) {
        this.setExitButton(new ccui.ImageView("button/quit_button.png", ccui.Widget.PLIST_TEXTURE));
        this._funcExit = funcExit;
        return this;
    },

    setTitle: function (title, color) {
        var brkTitle = new ccui.ImageView("patch9/Map_Tittle_Name.png", ccui.Widget.PLIST_TEXTURE);
        brkTitle._maxLblWidth = 150;
        var lbl = brkTitle.setString(title);
        lbl.setColor(color || mc.color.YELLOW);
        this.setTitleView(brkTitle);
        return this;
    },

    setMessage: function (message, color) {
        var lblMsg = bb.framework.getGUIFactory().createText("", res.font_cam_stroke_32_export_fnt);
        lblMsg.getVirtualRenderer().setBoundingWidth(500);
        lblMsg.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lblMsg.setString(message);
        this.setContentView(lblMsg);
        return this;
    },

    setContentView: function (contentView, margin) {
        if (contentView.height < 250) {
            this._dialogMargin = {
                top: (margin && margin.top) || 20,
                left: (margin && margin.left) || 15,
                bottom: (margin && margin.bottom) || 30,
                right: (margin && margin.right) || 15,
                ptContent: 10,
                pbContent: 10
            };
        } else {
            this._dialogMargin = {
                top: (margin && margin.top) || 20,
                left: (margin && margin.left) || 15,
                bottom: (margin && margin.bottom) || 30,
                right: (margin && margin.right) || 15,
                ptContent: 10,
                pbContent: 10
            };
        }
        this._super(contentView);
        return this;
    },

    reCalculatePositionAndContentSize: function () {
        this._super();
        var exitBtn = this.getButtonExit();
        if (exitBtn) {
            exitBtn.scale = 0.75;
            exitBtn.registerTouchEvent(function () {
                this._funcExit && this._funcExit();
                this.close();
            }.bind(this));
            exitBtn.x = this._container.width - exitBtn.width * 0.5 * exitBtn.scale;
            exitBtn.y = this._container.height - exitBtn.height * 0.5 * exitBtn.scale;
        }
    }

});