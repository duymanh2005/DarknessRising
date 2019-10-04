mc.MCEventInfoDialog = bb.Dialog.extend({
    ctor: function () {
        this._super();

        var node = ccs.load(res.widget_event_info_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var btnClose = rootMap["btnClose"];
        var lblTitle = rootMap["lbl_title"];
        var listText = rootMap["list_text"];
        var text = rootMap["text"];
        var btnOk = rootMap["btn_ok"];
        lblTitle.setString(mc.dictionary.getGUIString("lblEventDetail"));
        btnOk.setString(mc.dictionary.getGUIString("lblOk"), res.font_UTMBienvenue_stroke_32_export_fnt);

        var guiString = mc.dictionary.getGUIString("txtEvent1");

        var arrayTxt = guiString.split("\n");

        for (var i in arrayTxt) {
            var text1 = new cc.LabelBMFont(arrayTxt[i], res.font_UTMBienvenue_none_32_export_fnt);
            text1 = mc.view_utility.replaceBitmapFontAndApplyTextStyle(text1,mc.textStyle.font_size_32 );
            text1.setVisible(true);
            var align = cc.TEXT_ALIGNMENT_LEFT;
            text1.setBoundingWidth(listText.width);
            text1.setAlignment(align);
            text1.setComplexString(arrayTxt[i]);
            // text1.setComplexString(guiString);
            var widget = new ccui.Layout();
            widget.setContentSize(text1.width, text1.height);
            widget.addChild(text1);
            text1.setPosition(widget.width / 2, widget.height / 2);
            listText.pushBackCustomItem(widget);
        }

        listText.forceDoLayout();

        lblTitle.setColor(mc.color.YELLOW_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblEvents"));

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        btnOk.registerTouchEvent(function () {
            this.close();
        }.bind(this));

    }

});