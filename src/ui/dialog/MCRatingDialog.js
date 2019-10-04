mc.MCRatingDialog = bb.Dialog.extend({
    ctor: function () {
        this._super();
        var node = ccs.load(res.widget_Rating_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        root.setCascadeColorEnabled(true);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var nodeFairy = rootMap["node_fairy"];

        var tips = rootMap["lblTitle"];
        tips.setString(mc.dictionary.getGUIString("lblRateMsg"));
        tips.setColor(mc.color.BROWN_SOFT);
        var btnRate = rootMap["btn_rate"];
        var lblRate = btnRate.setString(mc.dictionary.getGUIString("lblRateNow"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var btnLater = rootMap["btn_later"];
        var lblLater = btnLater.setString(mc.dictionary.getGUIString("lblRateLater"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var btnSkip = rootMap["btn_no_thk"];
        var lblSkip = btnSkip.setString(mc.dictionary.getGUIString("lblNoThk"), res.font_UTMBienvenue_stroke_32_export_fnt);

        var spineFairy = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json, res.spine_ui_story_teller_atlas, 1.0);
        spineFairy.scale = 0.15;
        spineFairy.scaleX *= -1;
        spineFairy.setAnimation(0, "default", true);
        nodeFairy.addChild(spineFairy);

        btnRate.registerTouchEvent(function () {
            this.rateGame();
        }.bind(this));
        btnLater.registerTouchEvent(function () {
            this.remindLater();
        }.bind(this));
        btnSkip.registerTouchEvent(function () {
            this.skipRate();
        }.bind(this));
        this.setEnableClickOutSize(false);
    },

    rateGame: function () {
        bb.pluginBox.review.rateGame();
        mc.GameData.ratingManager.saveRatingChange(true, false);
        mc.GameData.settingManager.saveAll();
        mc.GameData.settingManager.flush();

        bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("txtThankRating")).show();
        this.close();
    },
    remindLater: function () {
        mc.GameData.ratingManager.saveRatingChange(false, true);
        mc.GameData.settingManager.saveAll();
        mc.GameData.settingManager.flush();
        this.close();
    },
    skipRate: function () {
        mc.GameData.ratingManager.saveRatingChange(true, false);
        mc.GameData.settingManager.saveAll();
        mc.GameData.settingManager.flush();
        this.close();
    }

});