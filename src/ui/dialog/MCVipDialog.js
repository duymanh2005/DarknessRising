/**
 * Created by Thanh.Vo on 6/14/2019.
 * Show dialog buy item IAP.
 * @example
 * mc.VipDialog.showIAPBless()
 * mc.VipDialog.showIAPPromo()
 * mc.VipDialog.showIAPMonthly()
 * mc.VipDialog.showIAPBestOffer()
 */
mc.VipDialog = bb.Dialog.extend({
    _currentVisitContent: null,
    _bottomPanel: null,
    ctor: function (withPosition) {
        this._super();
        var contentView = ccs.load(res.widget_VipDialog_json, "res/").node;
        this.addChild(contentView);
        var root = contentView.getChildByName("root");
        root.y = cc.winSize.height / 2;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        cc.spriteFrameCache.addSpriteFrames(res.patch9_8_plist);
        this._bottomPanel = rootMap["bottomPanel"];
        this.gift_shop_content = rootMap["gift_shop_content"];
        this.monthly_card_content = rootMap["monthly_card_content"];
        this.promo_content = rootMap["promo_content"];
        this.best_offer_content = rootMap["offer_content"];
        var btn_close = this.close_btn = rootMap["btn_close"];
        this._bindBottonBar();
        this._loadTabBuyIndex(withPosition);
        btn_close.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    },

    _preset: function () {
        var bottomPanel = this._bottomPanel;
        this.gift_shop_content.setVisible(false);
        this.promo_content.setVisible(false);
        this.monthly_card_content.setVisible(false);
        this.best_offer_content.setVisible(false);
        bottomPanel.getChildByName("widget1").setOpacity(170);
        bottomPanel.getChildByName("widget3").setOpacity(170);
    },

    /**
     * @param {mc.PaymentSystem.POSITION_PROMOTION||mc.PaymentSystem.POSITION_MONTHLY||mc.PaymentSystem.POSITION_BLESS}pos
     * @private
     */
    _loadTabBuyIndex: function (pos) {
        var bottomPanel = this._bottomPanel;
        this._preset();
        this.gift_shop_content.setVisible(true);
        this._currentVisitContent = this.gift_shop_content;
        bottomPanel.getChildByName("widget3").setOpacity(255);
        !this.giftShopCtrl && (this.giftShopCtrl = new mc._BlessContentBinder(this.gift_shop_content));
        this.giftShopCtrl.loadContent();
    },

    _bindBottonBar: function () {
        var bottomPanel = this._bottomPanel;
        var widgetPromotion = bottomPanel.getChildByName("widget1");
        widgetPromotion.x = cc.winSize.width/4 - 50;
        widgetPromotion.setVisible(false);
        var widgetBuyBless = bottomPanel.getChildByName("widget3");
        widgetBuyBless.x = cc.winSize.width/2;
        widgetBuyBless.setVisible(false);
    },

    overrideShowAnimation: function () {
        var dur = 0.2;
        this._currentVisitContent.setScale(0.8);
        this._currentVisitContent.runAction(cc.scaleTo(dur, 1).easing(cc.easeBackOut()));
        this.close_btn.setOpacity(0);
        this.close_btn.runAction(cc.fadeIn(0.2));
        this._bottomPanel.y = -this._bottomPanel.height;
        this._bottomPanel.runAction(cc.moveTo(0.2, cc.winSize.width * 0.5, 0).easing(cc.easeBackOut()));


        return dur;
    },

    overrideCloseAnimation: function () {
        var dur = 0.2;
        this._bottomPanel.runAction(cc.moveTo(0.2, cc.winSize.width * 0.5, -this._bottomPanel.height));
        this.close_btn.runAction(cc.fadeOut(0.2));
        this._currentVisitContent.runAction(cc.scaleTo(dur, 0.5).easing(cc.easeBackIn()));

        return dur;
    }
});

mc._BlessContentBinder = cc.Class.extend({
    _hasLoadProduct: null,
    ctor: function (view) {
        var root = view;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title1 = rootMap["title0"];
        this.listView = rootMap["ListView"];
        var btn_close = rootMap["btn_close"];
        var image_2_0 = rootMap["Image_2_0"];
        image_2_0.setVisible(false);
        title1.setString("");
    },

    loadContent: function () {
        if (!this._hasLoadProduct) {
            mc.view_utility.requestIAPItems(function (arrProducts) {
                this._hasLoadProduct = true;
                this._loadContent(arrProducts);
            }.bind(this));
        }
    },

    _loadContent: function (arrProduct) {
        this._mapInAppProductByName = {};
        if (arrProduct) {
            this._mapInAppProductByName = bb.utility.arrayToMap(arrProduct, function (product) {
                return product["name"];
            });
        }
        var arrInAppDict = mc.GameData.paymentSystem.getInAppItem(mc.PaymentSystem.POSITION_BLESS);
        this.listView.setScrollBarEnabled && this.listView.setScrollBarEnabled(false);
        this.listView.removeAllChildren();
        this.listView.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList());
        for (var i = 0; i < arrInAppDict.length; i++) {
            var inAppDictElement = arrInAppDict[i];
            this.listView.pushBackCustomItem(this._bindItemBuyBless(inAppDictElement));

        }
        this.listView.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList());
    },

    _bindItemBuyBless: function (inAppDict) {
        var self = this;
        var promotionItem = inAppDict["promotion"] ? mc.ItemStock.createJsonItemByStr(inAppDict["promotion"]) : null;
        var widget = new ccui.ImageView("patch9/pnl_pop_up_circle_star.png", ccui.Widget.PLIST_TEXTURE);
        widget.setScale9Enabled(true);
        widget.setCapInsets(cc.rect(200, 30, 50, 30));
        widget.setContentSize(695, widget.height);
        var buyBtn = new ccui.ImageView("button/btn_BuyBless.png", ccui.Widget.PLIST_TEXTURE);
        var lblName = bb.framework.getGUIFactory().createText(mc.dictionary.getI18nMsg(inAppDict["name"]), res.font_UTMBienvenue_none_32_export_fnt);
        var icon = widget._icon = new cc.Sprite("#patch9/" + inAppDict["image"] + ".png");
        var lblVal = bb.framework.getGUIFactory().createText(bb.utility.formatNumber(inAppDict["bless"]), res.font_UTMBienvenue_stroke_32_export_fnt);
        var lblRelic = null;
        if (promotionItem) {
            lblRelic = bb.framework.getGUIFactory().createText(bb.utility.formatNumber(mc.ItemStock.getItemQuantity(promotionItem)),
                res.font_UTMBienvenue_stroke_32_export_fnt);
            lblRelic.setColor(mc.color.GREEN);

        }
        var ids = inAppDict["id"].split('.');
        var product = self._mapInAppProductByName[ids[ids.length - 1]];
        var lblPrice = widget._lblPrice = new cc.LabelTTF(product ? cc.formatStr("%s %s", product["price"], product["currencyCode"]) : inAppDict["cost"] + " usd", res.font_regular_ttf, 24);
        //lblPrice.setColor(mc.color.BROWN_SOFT);
        lblPrice.enableStroke(mc.color.BLACK, 2);
        buyBtn.addChild(lblPrice);
        lblPrice.setPosition(buyBtn.width / 2, buyBtn.height / 2 - 4);
        buyBtn.setPosition(widget.width - buyBtn.width / 2 - 20, widget.height / 2 - 14);

        lblVal.setColor(mc.color.GREEN);
        lblName.setColor(mc.color.BROWN_SOFT);
        icon.setPosition(icon.width / 2 + 20, widget.height / 2 - 6);
        lblVal.setPosition(icon.x, icon.y - icon.height / 4);
        widget.addChild(icon);
        widget.addChild(lblVal);
        widget.addChild(lblName);
        widget.addChild(buyBtn);
        if (mc.enableReplaceFontBM()) {
            lblName.setPosition(widget.width / 2, widget.height - lblName.height / 2 - 22);
        } else {
            lblName.setPosition(widget.width / 2, widget.height - lblName.height / 2 - 14);
        }
        if (lblRelic) {
            var bgRelic = new cc.Sprite("#icon/pnl_check.png");
            var iconRelic = new cc.Sprite("#icon/ico_relic_small.png");
            widget.addChild(bgRelic);
            bgRelic.addChild(iconRelic);
            bgRelic.setScale(1.2);
            iconRelic.setPosition(bgRelic.width / 2, bgRelic.height / 2);
            bgRelic.setPosition(icon.x + icon.width / 2 + bgRelic.width / 2 + 30, icon.y - 5);
            lblRelic.setPosition(bgRelic.x, bgRelic.y - bgRelic.height / 2 - 3);
            widget.addChild(lblRelic);
        }

        if (!!inAppDict["promoLabel"]) {
            var bgdiscount = new cc.Sprite("#patch9/pnl_sale.png");
            var lbldiscount = bb.framework.getGUIFactory().createText(inAppDict["promoLabel"] + "%", res.font_UTMBienvenue_stroke_32_export_fnt);
            widget.addChild(bgdiscount);
            bgdiscount.addChild(lbldiscount);
            lbldiscount.setPosition(bgdiscount.width / 2 - 10, bgdiscount.height / 2 + 4);
            bgdiscount.setPosition(bgdiscount.width / 2, widget.height - bgdiscount.height / 2);
            bgdiscount.setScale(1.2);
        }
        var _updateStatus = function (widget) {
            if (!mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(inAppDict)) ||
                !mc.PaymentSystem.isActiveIAPItem(inAppDict)) {
                widget.setColor(mc.color.BLACK_DISABLE_SOFT);
                widget.setEnabled(false);
            } else {
                widget.setColor(mc.color.WHITE_NORMAL);
                widget.setEnabled(true);
            }
        };
        buyBtn.registerTouchEvent(function (target) {
            var inAppDict = this.getUserData();
            mc.view_utility.purchaseInAppItem(inAppDict, function () {
                _updateStatus(target);
            }.bind(widget));
        }.bind(widget));
        // widget.setSwallowTouches(false);
        widget.setUserData(inAppDict);
        widget.setCascadeColorEnabled(true);
        _updateStatus(widget);
        return widget;
    }
});

mc.VipDialog.showIAPBless = function () {
    new mc.VipDialog(mc.PaymentSystem.POSITION_BLESS).show();
};
