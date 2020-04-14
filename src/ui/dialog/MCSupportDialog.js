mc.SupportDialog = bb.Dialog.extend({
    ctor: function () {
        this._super();

        var node = ccs.load(res.widget_support_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var btnClose = rootMap["btnClose"];
        var lblTitle = rootMap["lbl_title"];
        var listText = rootMap["list_text"];
        var suportButton = rootMap["suportButton"];

        var text1 = lblTitle.clone();
        var tw = listText.width + listText.width * (1 - text1.scale);
        var layout = new ccui.Layout();
        text1.addChild(layout);
        text1.setMultiLineString(mc.dictionary.getGUIString("txtSupport1"), tw);
        var text2 = lblTitle.clone();
        text2.setMultiLineString(mc.dictionary.getGUIString("txtSupport2"), tw);
        text2.setColor(mc.color.BLUE_SOFT);
        var text3 = lblTitle.clone();
        text3.setMultiLineString(mc.dictionary.getGUIString("txtSupport3"), tw);

        listText.setItemsMargin(5);

        listText.pushBackCustomItem(text1);
        listText.pushBackCustomItem(text2);
        listText.pushBackCustomItem(text3);

        listText.forceDoLayout();

        lblTitle.setColor(mc.color.YELLOW_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblSupport"));
        suportButton.registerTouchEvent(function () {
            cc.sys.openURL("http://m.me/DarknessRisingGlobal");
        }.bind(this));
        var labelButtonSP = suportButton.setString(mc.dictionary.getGUIString("Live Chat"), res.font_sfumachine_outer_32_export_fnt);
        labelButtonSP.setScale(0.7);

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));

    }
});
