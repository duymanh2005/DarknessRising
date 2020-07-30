/**
 * Created by Thanh.Vo on 6/14/2019.
 * Show dialog buy item IAP.
 * @example
 * mc.IAPShopDialog.showIAPBless()
 * mc.IAPShopDialog.showIAPPromo()
 * mc.IAPShopDialog.showIAPMonthly()
 * mc.IAPShopDialog.showIAPBestOffer()
 */
mc.IAPShopDialog = bb.Dialog.extend({
    _currentVisitContent: null,
    _bottomPanel: null,
    ctor: function (withPosition) {
        this._super();
        var contentView = ccs.load(res.widget_IAPShop_json, "res/").node;
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
        bottomPanel.getChildByName("widget2").setOpacity(170);
        bottomPanel.getChildByName("widget3").setOpacity(170);
        bottomPanel.getChildByName("widget4").setOpacity(170);

    },

    /**
     * @param {mc.PaymentSystem.POSITION_PROMOTION||mc.PaymentSystem.POSITION_MONTHLY||mc.PaymentSystem.POSITION_BLESS}pos
     * @private
     */
    _loadTabBuyIndex: function (pos) {
        var bottomPanel = this._bottomPanel;
        this._preset();
        pos = pos || mc.PaymentSystem.POSITION_BLESS;
        switch (pos) {
            case mc.PaymentSystem.POSITION_PROMOTION:
                this.promo_content.setVisible(true);
                this._currentVisitContent = this.promo_content;
                bottomPanel.getChildByName("widget1").setOpacity(255);
                !this.promoShopCtrl && (this.promoShopCtrl = new mc._PromoContentBinder(this.promo_content));
                this.promoShopCtrl.loadContent();
                break;
            case mc.PaymentSystem.POSITION_MONTHLY:
                this.monthly_card_content.setVisible(true);
                this._currentVisitContent = this.monthly_card_content;
                bottomPanel.getChildByName("widget2").setOpacity(255);
                !this.monthlyShopCtrl && (this.monthlyShopCtrl = new mc._MonthlyContentBinder(this.monthly_card_content));
                this.monthlyShopCtrl.loadContent();
                break;
            case mc.PaymentSystem.POSITION_BLESS:
                this.gift_shop_content.setVisible(true);
                this._currentVisitContent = this.gift_shop_content;
                bottomPanel.getChildByName("widget3").setOpacity(255);
                !this.giftShopCtrl && (this.giftShopCtrl = new mc._BlessContentBinder(this.gift_shop_content));
                this.giftShopCtrl.loadContent();
                break;
            case mc.PaymentSystem.POSITION_OFFER:
                this.best_offer_content.setVisible(true);
                this._currentVisitContent = this.best_offer_content;
                bottomPanel.getChildByName("widget4").setOpacity(255);
                !this.bestOfferCtrl && (this.bestOfferCtrl = new mc._BestOfferContentBinder(this.best_offer_content));
                this.bestOfferCtrl.loadContent();
                break;

        }
    },

    _bindBottonBar: function () {
        var bottomPanel = this._bottomPanel;
        var applyLbl = function (widget, lblKey) {
            if (widget) {
                var lbl = widget.getChildByName("BitmapFontLabel_1");
                lbl && lbl.setString(mc.dictionary.getGUIString(lblKey));
            }
        };
        var widgetPromotion = bottomPanel.getChildByName("widget1");
        widgetPromotion.x = cc.winSize.width/4 - 50;
        var widgetMonthly = bottomPanel.getChildByName("widget2");
        widgetMonthly.setVisible(false);
        var widgetBuyBless = bottomPanel.getChildByName("widget3");
        widgetBuyBless.x = cc.winSize.width/2;
        var widgetBuyBestOff = bottomPanel.getChildByName("widget4");
        widgetBuyBestOff.x = cc.winSize.width*3/4 + 50;
        applyLbl(widgetPromotion, "Newcomer's Bundle");
        applyLbl(widgetMonthly, "lblmonthly");
        applyLbl(widgetBuyBless, "lblBuyBless");
        applyLbl(widgetBuyBestOff, "lblBestOff");

        widgetPromotion.registerTouchEvent(function (widget) {
            this._loadTabBuyIndex(mc.PaymentSystem.POSITION_PROMOTION);
        }.bind(this));
        widgetMonthly.registerTouchEvent(function (widget) {
            this._loadTabBuyIndex(mc.PaymentSystem.POSITION_MONTHLY);
        }.bind(this));
        widgetBuyBless.registerTouchEvent(function (widget) {
            this._loadTabBuyIndex(mc.PaymentSystem.POSITION_BLESS);
        }.bind(this));
        widgetBuyBestOff.registerTouchEvent(function (widget) {
            this._loadTabBuyIndex(mc.PaymentSystem.POSITION_OFFER);
        }.bind(this));
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
        // title1.setColor(mc.color.YELLOW);
        title1.setString(mc.dictionary.getGUIString("lblBuyBless"));
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
mc._PromoContentBinder = cc.Class.extend({
    _hasLoadProduct: null,
    ctor: function (view) {
        var root = this.root = view;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title1 = rootMap["title0"];
        this.listView = rootMap["ListView"];
        var btn_close = rootMap["btn_close"];
        // title1.setColor(mc.color.YELLOW);
        title1.setString(mc.dictionary.getGUIString("Promotion"));
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
        var arrInAppDict = mc.GameData.paymentSystem.getInAppItem(mc.PaymentSystem.POSITION_PROMOTION);
        this.listView.setScrollBarEnabled && this.listView.setScrollBarEnabled(false);
        this.listView.removeAllChildren();
        this.listView.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList());
        for (var i = 0; i < arrInAppDict.length; i++) {
            this.listView.pushBackCustomItem(this._createEmptyItemPromo());

        }
        this.listView.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList());
        //load full item content
        this._mapInAppProductByName = {};
        if (arrProduct) {
            this._mapInAppProductByName = bb.utility.arrayToMap(arrProduct, function (product) {
                return product["name"];
            });
        }
        var index = 1;//(index=1) ignore item padding at index 0
        this.root.schedule(function () {//for smooth show dialog
            var promoItemView = this.listView.getItem(index);
            this._bindItemBuyPromo(arrInAppDict[index - 1], promoItemView);
            index++;
        }.bind(this), 0.02, arrInAppDict.length - 1);

    },

    _createEmptyItemPromo: function () {
        var widget = new ccui.ImageView("patch9/pnl_pop_up.png", ccui.Widget.PLIST_TEXTURE);
        widget.setScale9Enabled(true);
        widget._capInsets = cc.rect({x: 100, y: 30, width: 100, height: 10});
        widget.setContentSize(695, 210);
        return widget;
    },

    _bindItemBuyPromo: function (inAppDict, widget) {
        var self = this;
        var buyBtn = new ccui.ImageView("button/btn_BuyBless.png", ccui.Widget.PLIST_TEXTURE);
        var lblName = bb.framework.getGUIFactory().createText(mc.dictionary.getI18nMsg(inAppDict["name"]), res.font_UTMBienvenue_none_32_export_fnt);

        var txtLimit = "";
        if(inAppDict["buyTimes"] >= 1){
            txtLimit = mc.dictionary.getI18nMsg("txtLimit") + " : " + inAppDict["buyTimes"];
        }
        var lblLimit = bb.framework.getGUIFactory().createText(txtLimit, res.font_UTMBienvenue_none_32_export_fnt);
        var ids = inAppDict["id"].split('.');
        var product = self._mapInAppProductByName[ids[ids.length - 1]];
        var lblPrice = widget._lblPrice = new cc.LabelTTF(product ? cc.formatStr("%s %s", product["price"], product["currencyCode"]) : inAppDict["cost"] + " usd", res.font_regular_ttf, 24);

        //lblPrice.setColor(mc.color.BROWN_SOFT);
        lblPrice.enableStroke(mc.color.BLACK, 2);
        buyBtn.addChild(lblPrice);
        lblPrice.setPosition(buyBtn.width / 2, buyBtn.height / 2 - 4);
        buyBtn.setPosition(widget.width - buyBtn.width / 2 - 20, widget.height / 2 - 14);

        lblName.anchorX = 0;
        //lblLimit.anchorY = lblLimit.getWidth();
        lblName.setColor(mc.color.BROWN_SOFT);
        widget.addChild(lblName);
        lblLimit.setColor(mc.color.BROWN_SOFT);
        widget.addChild(lblLimit);
        widget.addChild(buyBtn);
        if (mc.enableReplaceFontBM()) {
            lblName.setPosition(50, widget.height - 38);
            lblLimit.setPosition(widget.width - 150, widget.height - 38 );
        } else {
            lblName.setPosition(50, widget.height - 38);
            lblLimit.setPosition(widget.width - 150, widget.height - 38);
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

        var rewardPanel = this._createRewardsListView(inAppDict);
        widget.addChild(rewardPanel);
        rewardPanel.x = rewardPanel.width / 2 + 30;
        rewardPanel.y = rewardPanel.height / 2 + 20;
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
        buyBtn.setUserData(mc.PaymentSystem.getGeneratedItemId(inAppDict));
        buyBtn.registerTouchEvent(
            function (imgView) {
                var id = imgView.getUserData();
                mc.GameData.notifySystem.resetIapNotify(id);
                mc.MCIapPackDialog.showIAPItem(mc.dictionary.IAPMap[id]);
                if (mc.storage.featureNotify && mc.storage.featureNotify.arrInAppId) {
                    if (mc.storage.featureNotify.arrInAppId[id]) {
                        mc.storage.featureNotify.arrInAppId[id]["isShowed"] = true;
                        mc.storage.saveFeatureNotify();
                        var notifyIcon = imgView.getChildByName("__notify__");
                        if (notifyIcon) {
                            notifyIcon.setVisible(false);
                        }
                    }
                }

            });


        // widget.setSwallowTouches(false);
        widget.setUserData(inAppDict);
        widget.setCascadeColorEnabled(true);
        _updateStatus(widget);
        return widget;
    },

    _createRewardsListView: function (packData) {
        var promotionData = packData["promotion"];
        if (packData["bless"]) {
            promotionData = "11999/" + packData["bless"] + "#" + promotionData;
        }

        var arrReward = mc.ItemStock.createArrJsonItemFromStr(promotionData);
        if(packData["heroes"]){
            var arrStr = packData["heroes"].split('#');
            for (var i = 0; i < arrStr.length; i++) {
                var heroDict = mc.dictionary.getHeroDictByIndex(parseInt(arrStr[i]));
                arrReward.unshift(mc.ItemStock.createJsonItemHeroSoul(1, heroDict));
            }
        }

        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
            var itemView = new mc.ItemView(arrReward[index]);
            itemView.scale = 0.75;
            itemView.registerViewItemInfo();
            itemView.setSwallowTouches(false);
            /* if (arrReward[index]["isFirstTimeReward"] == true) {
             var icon = new cc.Sprite("#icon/ico_clear.png");
             icon.x = itemView.width * 0.085;
             icon.y = itemView.height * 0.85;
             itemView.addChild(icon);
             }*/
            return itemView;
        }), 2);
        var wrapWidget = mc.view_utility.wrapWidget(layoutReward, 425, false, {
            top: 7,
            left: 5,
            bottom: 10,
            a1: -32,
            a2: -32
        });
        return wrapWidget;
    }
});
mc._MonthlyContentBinder = cc.Class.extend({
    _hasLoadProduct: null,
    ctor: function (view) {
        var root = view;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        this.buyBtn = rootMap["buyBtn"];
        var title1 = rootMap["title0"];
        this.listView = rootMap["ListView"];
        // title1.setColor(mc.color.YELLOW);
        title1.setString(mc.dictionary.getGUIString("lblmonthly"));
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
        var self = this;
        this._mapInAppProductByName = {};
        if (arrProduct) {
            this._mapInAppProductByName = bb.utility.arrayToMap(arrProduct, function (product) {
                return product["name"];
            });
        }
        var arrInAppDict = mc.GameData.paymentSystem.getInAppItem(mc.PaymentSystem.POSITION_MONTHLY);

        this.listView.setScrollBarEnabled && this.listView.setScrollBarEnabled(false);
        var inAppDict = arrInAppDict[0];// hiện tại chỉ 1 gói tháng
        var ids = inAppDict["id"].split('.');
        var product = self._mapInAppProductByName[ids[ids.length - 1]];
        var buyBtn = this.buyBtn;
        var lblPrice = new cc.LabelTTF(product ? cc.formatStr("%s %s", product["price"], product["currencyCode"]) : inAppDict["cost"] + " usd", res.font_regular_ttf, 24);
        //lblPrice.setColor(mc.color.BROWN_SOFT);
        lblPrice.enableStroke(mc.color.BLACK, 2);
        buyBtn.addChild(lblPrice);
        lblPrice.setPosition(buyBtn.width / 2, buyBtn.height / 2 - 4);
        var _updateStatus = function (widget) {
            if (!mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(inAppDict)) ||
                !mc.PaymentSystem.isActiveIAPItem(inAppDict)) {
                buyBtn.setColor(mc.color.BLACK_DISABLE_SOFT);
                buyBtn.setEnabled(false);
            } else {
                buyBtn.setColor(mc.color.WHITE_NORMAL);
                buyBtn.setEnabled(true);
            }
        };
        buyBtn.registerTouchEvent(function (buyBtn) {
            var inAppDict = this.getUserData();
            mc.view_utility.purchaseInAppItem(inAppDict, function () {
                _updateStatus(buyBtn);
            }.bind(buyBtn));
        }.bind(buyBtn));
        // widget.setSwallowTouches(false);
        buyBtn.setUserData(inAppDict);
        buyBtn.setCascadeColorEnabled(true);
        _updateStatus(buyBtn);

    }


});
mc._BestOfferContentBinder = cc.Class.extend({
    _hasLoadProduct: null,
    ctor: function (view) {
        var root = view;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        this.buyBtn = rootMap["buyBtn"];
        var title1 = rootMap["title0"];
        this.bgList = rootMap["bgList"];
        this.listView = rootMap["ListView"];
        // title1.setColor(mc.color.YELLOW);
        title1.setString(mc.dictionary.getGUIString("lblBestOff"));
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
        var self = this;
        this._mapInAppProductByName = {};
        if (arrProduct) {
            this._mapInAppProductByName = bb.utility.arrayToMap(arrProduct, function (product) {
                return product["name"];
            });
        }
        var arrInAppDict = mc.GameData.paymentSystem.getInAppItem(mc.PaymentSystem.POSITION_OFFER);
        this.listView.setScrollBarEnabled && this.listView.setScrollBarEnabled(false);
        var inAppDict = arrInAppDict[0];// hiện tại chỉ 1 gói best offer
        var ids = inAppDict["id"].split('.');
        var product = self._mapInAppProductByName[ids[ids.length - 1]];
        var list = this.listView;
        list.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList(cc.size(100, 70)));
        var promotionData = inAppDict["promotion"];
        if (inAppDict["bless"]) {
            promotionData = "11999/" + inAppDict["bless"] + "#" + promotionData;
        }
        var arrItems = mc.ItemStock.createArrJsonItemFromStr(promotionData);
        var layoutItems = bb.layout.grid(bb.collection.createArray(arrItems.length, function (index) {
            var itemInfo = arrItems[index];
            var itemView = new mc.ItemView(itemInfo);
            itemView.scale = 0.75;
            itemView.registerViewItemInfo();
            itemView.setSwallowTouches(false);
            return itemView;
        }), 4, this.bgList.width - 200, 5);
        layoutItems.setScale(1.2);
        list.pushBackCustomItem(layoutItems);
        list.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList(cc.size(100, 100)));
        var buyBtn = this.buyBtn;
        var lblPrice = new cc.LabelTTF(product ? cc.formatStr("%s %s", product["price"], product["currencyCode"]) : inAppDict["cost"] + " usd", res.font_regular_ttf, 24);
        //lblPrice.setColor(mc.color.BROWN_SOFT);
        lblPrice.enableStroke(mc.color.BLACK, 2);
        buyBtn.addChild(lblPrice);
        lblPrice.setPosition(buyBtn.width / 2, buyBtn.height / 2 - 4);

        buyBtn.setUserData(mc.PaymentSystem.getGeneratedItemId(inAppDict));
        buyBtn.registerTouchEvent(
            function (imgView) {
                var id = imgView.getUserData();
                mc.GameData.notifySystem.resetIapNotify(id);
                mc.MCIapPackDialog.showIAPItem(mc.dictionary.IAPMap[id]);
                if (mc.storage.featureNotify && mc.storage.featureNotify.arrInAppId) {
                    if (mc.storage.featureNotify.arrInAppId[id]) {
                        mc.storage.featureNotify.arrInAppId[id]["isShowed"] = true;
                        mc.storage.saveFeatureNotify();
                        var notifyIcon = imgView.getChildByName("__notify__");
                        if (notifyIcon) {
                            notifyIcon.setVisible(false);
                        }
                    }
                }

            });


        // widget.setSwallowTouches(false);
        // buyBtn.setUserData(inAppDict);
        // buyBtn.setCascadeColorEnabled(true);


    }


});
mc.IAPShopDialog.showIAPBless = function () {
    new mc.IAPShopDialog(mc.PaymentSystem.POSITION_BLESS).show();
};
mc.IAPShopDialog.showIAPPromo = function () {
    new mc.IAPShopDialog(mc.PaymentSystem.POSITION_PROMOTION).show();
};
mc.IAPShopDialog.showIAPMonthly = function () {
    new mc.IAPShopDialog(mc.PaymentSystem.POSITION_MONTHLY).show();
};
mc.IAPShopDialog.showIAPBestOffer = function () {
    new mc.IAPShopDialog(mc.PaymentSystem.POSITION_OFFER).show();
};