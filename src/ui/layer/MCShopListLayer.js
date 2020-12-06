/**
 * Created by long.nguyen on 5/19/2018.
 */
mc.ShopListLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();

        var root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelMiddle = rootMap["panelMiddle"];
        var nodeBrk = rootMap["nodeBrk"];
        mc.storage.featureNotify.shopLayerShowed = true;
        mc.storage.saveFeatureNotify();
        nodeBrk.y = 0;
        var btBrk = new ccui.ImageView(res.brk_shop_open, ccui.Widget.LOCAL_TEXTURE);
        btBrk.anchorY = 0.0;
        nodeBrk.addChild(btBrk);
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblShop"));

        var blessShopId = "bless_shop";
        var _showShop = function (param) {
            if (param === blessShopId) {
                mc.IAPShopDialog.showIAPBless();
            } else if (param === mc.ShopManager.SHOP_PROMOTION) {
                mc.IAPShopDialog.showIAPPromo();
            } else {
                mc.GUIFactory.showShopScreen(param);
            }
        }.bind(this);

        var _createBanner = function (url, param, isPage, lbl, ignorLanguage) {
            var urlFinal = "res/png/banner/shop/" + url;
            if (!ignorLanguage) {
                var lan = mc.storage.readSetting()["language"];
                urlFinal += "_" + lan + ".png";
            } else {
                urlFinal += ".png";
            }
            var imgView = new ccui.ImageView(urlFinal, ccui.Widget.LOCAL_TEXTURE);
            imgView.setScale(0.8);
            imgView.setUserData(param);
            imgView.registerTouchEvent(function (imgView) {
                var param = imgView.getUserData();
                _showShop(param);
            });
            if (lbl) {
                var string = imgView.setString(mc.dictionary.getGUIString(lbl), res.font_cam_stroke_32_export_fnt);
                string.setScale(0.75);
                string.y = imgView.height * 0.27;
            }
            imgView.setName("banner");
            if (isPage) {
                var container = new ccui.Layout();
                container.anchorX = container.anchorY = 0.5;
                container.width = cc.winSize.width;
                container.height = imgView.height;
                imgView.x = container.width * 0.5;
                imgView.y = container.height * 0.5;
                container.addChild(imgView);
                return container;
            }
            return imgView;
        };

        var arrInAppTop = mc.GameData.paymentSystem.getInAppItem(mc.PaymentSystem.POSITION_PROMOTION);
        arrInAppTop = [];
        var arrHeaderView = bb.collection.createArray(arrInAppTop.length, function (index) {
            var createBanner = _createBanner("banner_" + arrInAppTop[index]["image"], index, false);
            createBanner.getReturnKey = function () {
                return arrInAppTop[index]["id"];
            };
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(createBanner, mc.GameData.notifySystem.checkIapNotify(arrInAppTop[index]["id"]));
            if (notifyIcon) {
                notifyIcon.x = createBanner.width;
                notifyIcon.y = createBanner.height;
            }
            return createBanner;
        });


        var arrMiddleURL = [
            "icon_promotionshop", "ico_relicshop", "ico_gemshop", "ico_packageshop", "ico_petshop", "ico_chaosshop"
        ];
        var arrMiddleLbl = [
            "Promotion Shop", "Relic Shop", "Bless Shop", "Common Shop", "Pet Shop", "Chaos Shop"
        ];

        var arrShopCategoryId = [mc.ShopManager.SHOP_PROMOTION, mc.ShopManager.SHOP_RELIC, blessShopId, mc.ShopManager.SHOP_COMMON, mc.ShopManager.SHOP_PET, mc.ShopManager.SHOP_CHAOS];

        if (mc.GameData.guildManager.getGuildInfo()) {
            arrMiddleURL.push("ico_guildshop");
            arrMiddleLbl.push("Guild Shop");
            arrShopCategoryId.push(mc.ShopManager.SHOP_GUILD);
        }
        if (mc.GameData.shopManager.isGoblinShopOpen()) {
            arrMiddleURL.push("ico_goblinshop");
            arrMiddleLbl.push("Goblin Shop");
            arrShopCategoryId.push(mc.ShopManager.SHOP_GOBLIN);
        }

        var phTableByNumElement = {
            1: 15, 2: 15, 3: 15, 4: 15, 5: 15, 6: 15,
            7: -10, 8: -10,
            9: -50, 10: -50
        };
        var middleLayout = bb.layout.grid(bb.collection.createArray(arrMiddleURL.length, function (index) {
            return _createBanner(arrMiddleURL[index], arrShopCategoryId[index], false, arrMiddleLbl[index], true);
        }), 2, cc.winSize.width - 20, phTableByNumElement[arrMiddleURL.length] ? phTableByNumElement[arrMiddleURL.length] : -70);

        middleLayout.x = root.width * 0.5;
        middleLayout.y = root.height * 0.47;
        this.addChild(middleLayout);

        var layout = mc.widget_utility.createScrollNode(arrHeaderView, null, 536, cc.p(panelMiddle.width, 165), {
            clickFunc: function (id) {
                mc.GameData.notifySystem.resetIapNotify(id);
                mc.MCIapPackDialog.showIAPItem(mc.dictionary.IAPMap[id]);
            }
        });
        layout.toggleScaleAnimate();
        layout.setLoopScroll(false);
        layout.setPosition(panelMiddle.width / 2, panelMiddle.height * 0.9);
        if (arrInAppTop.length > 0)
            layout.focusAt(bb.utility.randomInt(0, arrInAppTop.length), false, true);
        panelMiddle.addChild(layout);

        // var btnLeft = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
        // var btnRight = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
        // btnRight.scaleX = -1;
        //
        // panelMiddle.addChild(btnLeft);
        // panelMiddle.addChild(btnRight);
        //
        // btnLeft.runAction(cc.sequence([cc.moveBy(0.3, -10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, 10, 0), cc.delayTime(1)]).repeatForever());
        // btnRight.runAction(cc.sequence([cc.moveBy(0.3, 10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, -10, 0), cc.delayTime(1)]).repeatForever());
        //
        // btnLeft.x = panelMiddle.width * 0.07;
        // btnRight.x = panelMiddle.width * 0.93;
        // btnLeft.y = btnRight.y = panelMiddle.height * 0.9;
        //
        // btnLeft.registerTouchEvent(function () {
        //     layout.preItem();
        // });
        // btnRight.registerTouchEvent(function () {
        //     layout.nextItem();
        // });

        // layout.setScrollListener({
        //     atBegin: function () {
        //         btnLeft.setVisible(false);
        //         btnRight.setVisible(true);
        //     },
        //     atMid: function () {
        //         btnLeft.setVisible(true);
        //         btnRight.setVisible(true);
        //     },
        //     atEnd: function () {
        //         btnLeft.setVisible(true);
        //         btnRight.setVisible(false);
        //     }
        // });


        this.traceDataChange(mc.GameData.paymentSystem, function () {
            for (var i = 0; i < arrHeaderView.length; i++) {
                if (i < arrInAppTop.length &&
                    !mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(arrInAppTop[i]))) {
                    arrHeaderView[i].setColor(mc.Color.BLACK_DISABLE_SOFT);
                    arrHeaderView[i].setEnabled(false);
                }
            }
        });
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_SHOP_LIST;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return false;
    },
    onLayerClose: function () {
        mc.GameData.notifySystem.notifyDataChanged();
    },

    onLayerClearStack: function () {
        mc.GameData.notifySystem.notifyDataChanged();
    }

});