mc.MCExchangeMedalDialog = bb.Dialog.extend({
    ctor: function (eventData) {
        this._super();

        var node = ccs.load(res.widget_exchange_medal_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var btnClose = rootMap["btnClose"];
        var lblTitle = rootMap["lbl_title"];
        lblTitle.setColor(mc.color.YELLOW_SOFT);
        var lblMsg = rootMap["lbl_msg"];
        var btnHero = rootMap["btn_hero"];
        var btnItem = rootMap["btn_item"];
        var bg = rootMap["bg"];
        var lblInbag = bg.getChildByName("lbl_in_bag");
        var lblInbagValue = bg.getChildByName("lbl_in_bag_value");
        lblTitle.setString(mc.dictionary.getGUIString("lblRewards"));
        lblInbag.setString(mc.dictionary.getGUIString("lblInBag"));
        var itemInfo = mc.GameData.itemStock.getOverlapItemByIndex(eventData["indexCoin"]);
        lblInbagValue.setString(itemInfo ? bb.utility.formatNumber(mc.ItemStock.getItemQuantity(itemInfo)) : 0);
        lblMsg.setMultiLineString(mc.dictionary.getGUIString("lblExchangeMedal"), this.width * 0.9);
        // btnHero.setString(mc.dictionary.getGUIString("lblExchangeHeroes"), res.font_UTMBienvenue_stroke_32_export_fnt);
        // btnItem.setString(mc.dictionary.getGUIString("lblExchangeUItems"), res.font_UTMBienvenue_stroke_32_export_fnt);


        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        btnHero.registerTouchEvent(function () {
        }.bind(this));
        btnItem.registerTouchEvent(function () {
        }.bind(this));

    }

});