/**
 * Created by long.nguyen on 10/11/2017.
 */
mc.InAppPackageListLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();

        mc.storage.featureNotify.promotionLayerShowed = true;
        mc.storage.saveFeatureNotify();
        mc.GameData.notifySystem.updateCurrInApp();

        var root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelMiddle = rootMap["panelMiddle"];
        var nodeBrk = rootMap["nodeBrk"];

        brkTitle.setString(mc.dictionary.getGUIString("Promotion"));

        var _createBanner = function (url, param, isPage, lbl, ignorLanguage) {
            var urlFinal = "res/png/banner/shop/" + url;
            if (!ignorLanguage) {
                var lan = mc.storage.readSetting()["language"];
                urlFinal += "_" + lan + ".png";
            } else {
                urlFinal += ".png";
            }
            var imgView = new ccui.ImageView(urlFinal, ccui.Widget.LOCAL_TEXTURE);
            imgView.setUserData(param);
            imgView.registerTouchEvent(function (imgView) {
                var id = imgView.getUserData();
                mc.GameData.notifySystem.resetIapNotify(id);
                mc.MCIapPackDialog.showIAPItem(mc.dictionary.IAPMap[id]);
                if(mc.storage.featureNotify && mc.storage.featureNotify.arrInAppId)
                {
                    if( mc.storage.featureNotify.arrInAppId[id] ){
                        mc.storage.featureNotify.arrInAppId[id]["isShowed"] = true;
                        mc.storage.saveFeatureNotify();
                        var notifyIcon = imgView.getChildByName("__notify__");
                        if(notifyIcon)
                        {
                            notifyIcon.setVisible(false);
                        }
                    }
                }

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
        var arrInAppBot = mc.GameData.paymentSystem.getInAppItem(mc.PaymentSystem.POSITION_PROMOTION);
        arrInAppTop = bb.collection.arrayAppendArray(arrInAppTop, arrInAppBot);
        arrInAppTop.sort(function (cr1, cr2) {
            var order1 = cr1["order"];
            var order2 = cr2["order"];
            return order2 - order1;
        });
        var arrHeaderView = bb.collection.createArray(arrInAppTop.length, function (index) {
            var createBanner = _createBanner(arrInAppTop[index]["banner"], mc.PaymentSystem.getGeneratedItemId(arrInAppTop[index]), false, mc.dictionary.getI18nMsg(arrInAppTop[index]["name"]), true);
            //var notifyIcon = mc.view_utility.setNotifyIconForWidget(createBanner, mc.GameData.notifySystem.checkIapNotify(arrInAppTop[index]["id"]));
            //if (notifyIcon) {
            //    notifyIcon.x = createBanner.width;
            //    notifyIcon.y = createBanner.height * 0.8;
            //}
            var isShowed = false;
            if (mc.storage.featureNotify.arrInAppId) {
                var packageId = arrInAppTop[index]["id"];
                isShowed = mc.storage.featureNotify.arrInAppId[packageId]["isShowed"];

            }
            //var notifyIcon = mc.view_utility.setNotifyIconForWidget(createBanner, mc.GameData.notifySystem.checkIapNotify(arrInAppTop[index]["id"]));
            if (!isShowed) {
                var notifyIcon = mc.view_utility.setNotifyIconForWidget(createBanner, !isShowed);
                if (notifyIcon) {
                    notifyIcon.x = createBanner.width;
                    notifyIcon.y = createBanner.height * 0.8;
                }
            }

            return createBanner;
        });
        var contentView = bb.layout.grid(arrHeaderView, 2, panelMiddle.width - 20);

        var scroll = new ccui.ListView();
        scroll.anchorX = scroll.anchorY = 0.5;
        scroll.x = panelMiddle.width / 2;
        scroll.y = panelMiddle.height / 2;
        scroll.width = panelMiddle.width;

        scroll.height = panelMiddle.height;
        scroll.pushBackCustomItem(contentView);
        panelMiddle.addChild(scroll);

        nodeBrk.y = 0;
        var btBrk = new ccui.ImageView(res.brk_shop_open, ccui.Widget.LOCAL_TEXTURE);
        btBrk.anchorY = 0.0;
        nodeBrk.addChild(btBrk);
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_IN_APP_PACKAGE_LIST;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return false;
    }

});