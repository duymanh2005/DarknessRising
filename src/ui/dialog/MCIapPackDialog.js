mc.MCIapPackDialog = bb.Dialog.extend({
    ctor: function (packData,product) {
        this._super();
        var node = ccs.load(res.widget_IapPack_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        root.y = cc.winSize.height / 2;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var lan = mc.storage.readSetting()["language"];
        var lblName = rootMap["banner_name"];
        lblName.setString(mc.dictionary.getI18nMsg(packData["name"]));
        lblName.setOverlayColor(mc.color.GREEN_NORMAL);

        var btnOk = rootMap["btn_ok"];
        var rewardsList = rootMap["bg_rewards"].getChildByName("rewards");
        var lblRewards = rootMap["lbl_rewards"];
        var tips = rootMap["tips"];
        tips.setMultiLineString(mc.dictionary.getGUIString("lblTips") + mc.dictionary.getI18nMsg(packData["description"]), cc.winSize.width);
        tips.setColor(mc.color.BROWN_SOFT);

        if( product ){
            var lbl = new cc.LabelTTF(cc.formatStr("%s %s",product["price"],product["currencyCode"]), res.font_regular_ttf, 30);
            lbl.x = btnOk.width*0.5;
            lbl.y = btnOk.height*0.5;
            btnOk.addChild(lbl);
        }
        else{
            var buyCost = (lan === "vi" && packData["costVND"]) ? packData["costVND"] : packData["cost"];
            if (lan === "vi") {
                buyCost = bb.utility.formatNumber(buyCost) + " VND";
            } else {
                buyCost = buyCost + " USD";
            }
            var lblOk = btnOk.setString(buyCost, res.font_cam_stroke_48_export_fnt, mc.const.FONT_SIZE_24);
        }
        lblRewards.setString(mc.dictionary.getGUIString("Rewards in pack"));
        lblRewards.setColor(mc.color.BROWN_SOFT);
        btnOk.registerTouchEvent(function () {
            if (!mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(packData))) {
                bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtPurchaseFailed"),
                    mc.dictionary.getGUIString("txtPurchaseFailedReasonCode")["-2"])).show();
                return;
            }
            this.buy(packData);
        }.bind(this));

        this.bindRewards(rewardsList, packData);
    },

    bindRewards: function (rewardsList, packData) {
        var lvlItems = rewardsList;
        var promotionData = packData["promotion"];
        if (packData["bless"]) {
            promotionData = "11999/" + packData["bless"] + "#" + promotionData;
        }
        var arrItem = mc.ItemStock.createArrJsonItemFromStr(promotionData);
        var array = bb.collection.createArray(arrItem.length, function (index) {
            var itemInfo = arrItem[index];
            var itemView = new mc.ItemView(itemInfo);
            itemView.scale = 0.75;
            itemView.registerViewItemInfo();
            return itemView;
        });
        lvlItems.pushBackCustomItem(bb.layout.grid(array.reverse(), 4, rewardsList.width));
    },

    buy: function (packData) {
        var self = this;
        mc.view_utility.purchaseInAppItem(packData, function () {
            if (!mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(packData))) {
                self.close();
            }
        });
    }

});
mc.MCIapPackDialog.showIAPItem = function(inappDict){
    mc.view_utility.requestIAPItems(function(arrProducts){
        var product = null;
        if( arrProducts && arrProducts.length > 0 ){
            product = bb.collection.findBy(arrProducts,function(product,inappDict){
                var ids = inappDict["id"].split(['.']);
                return product["name"] === ids[ids.length-1];
            },inappDict);
        }
        new mc.MCIapPackDialog(inappDict,product).show();
    });
};