/**
 * Created by long.nguyen on 7/26/2018.
 * @deprecated use mc.ShopScreen
 */

mc.ShopLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();

        var root = this.parseCCStudio(res.screen_shop_json);

        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var self = this;

        var btnBack = rootMap["btnBack"];
        btnBack.setVisible(false);
        var nodeChar = this._nodeChar = rootMap["nodeChar"];
        var slotMoney = rootMap["slotMoney"];
        var slotBless = rootMap["slotBless"];
        var slotFriend = rootMap["slotFriend"];
        var nodeTab = rootMap["nodeTab"];
        var nodeBrkTop = rootMap["nodeBrkTop"];
        var lblRefeshIn = this._lblRefeshIn = rootMap["lblRefeshIn"];
        var lblTimesLeft = this._lblTimesLeft = rootMap["lblTimesLeft"];
        var btnRefresh = this._btnRefresh = rootMap["btnRefresh"];
        var brkBottom = this._brkBottom = rootMap["brkBottom"];

        var spineGirl = this._spineGirl = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_elfshop_json, res.spine_ui_elfshop_atlas, 0.25);
        spineGirl.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 1 ||
                trackEntry.trackIndex === 2) {
                this._spineGirl.clearTrack(trackEntry.trackIndex);
                this._spineGirl.setAnimation(0, "idle", true);
            }
        }.bind(this));
        this._spineGirl.setAnimation(0, "idle", true);
        nodeChar.addChild(spineGirl);

        var shopId = this._currShopId = mc.GameData.guiState.getCurrentShopCategoryId();
        var urlBrkTop = res.brk_shop_normal;
        if (shopId === mc.ShopManager.SHOP_CHAOS) {
            urlBrkTop = res.brk_shop_chaos;
        }
        var brkTop = new cc.Sprite(urlBrkTop);
        brkTop.anchorY = 1.0;
        nodeBrkTop.addChild(brkTop);

        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        btnRefresh.registerTouchEvent(function () {
            new mc.RefreshShopDialog(shopId, function () {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.refreshShopByCategory(shopId, function (rs) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (rs) {
                        self._reloadListItem();
                        self._showShoppingList();
                    }
                });
            }).show();
        });

        var strCurrency = mc.ShopManager.getShopCurrency(shopId);
        if (strCurrency.length > 2) {
            var currencyInfo = mc.ItemStock.createJsonItemInfo(strCurrency[strCurrency.length - 1]);
            var itemIndex = parseInt(mc.ItemStock.getItemIndex(currencyInfo));
        }
        else {
            slotFriend.setVisible(false);
        }

        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, slotFriend, btnBack, itemIndex);

        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.requestItemShopByCategory(shopId, function () {
            mc.view_utility.hideLoadingDialogById(loadingId);
            self._reloadListItem();
            if (self._isScreenShow) {
                self._showShoppingList();
            }
            else {
                // wait for onScreenShow call.
            }
        }.bind(this));

        this._SPRITE_MOVE = 300;
        this._nodeChar.x += this._SPRITE_MOVE;

        this.traceDataChange(mc.GameData.itemStock, function () {
            var arrNewComingItem = mc.GameData.itemStock.popArrayNewComingItem();
            if (arrNewComingItem) {
                mc.view_utility.showNewComingItem(arrNewComingItem);
            }
        }.bind(this));
    },

    onLayerShow: function () {
        this._isScreenShow = true;
        if (this._isPopulateData) { // if have data.
            this._showShoppingList();
        }
    },

    _showShoppingList: function () {
        if (!this._nodeChar._isWelcome) {
            this._nodeChar.runAction(cc.sequence([cc.moveBy(0.3, -this._SPRITE_MOVE, 0).easing(cc.easeBackOut()), cc.callFunc(function () {
                this._nodeChar._isWelcome = true;
                var popup = new ccui.ImageView("patch9/pnl_talkingbubble.png", ccui.Widget.PLIST_TEXTURE);
                popup.setScale9Enabled(true);
                popup.x = 389.04;
                popup.y = 1057.80;
                popup.width += 20;
                popup.anchorX = 0.78;
                popup.anchorY = 0;
                popup.scale = 0;
                var lblTalkWelcome = bb.framework.getGUIFactory().createText("Welcome to");
                var lblItemShop = lblTalkWelcome.setDecoratorLabel(mc.ShopManager.getShopName(this._currShopId), mc.color.YELLOW);
                lblTalkWelcome.x = popup.width * 0.5;
                lblTalkWelcome.y = popup.height * 0.75;
                var lblCanIHelpU = bb.framework.getGUIFactory().createText("May I help you?");
                lblCanIHelpU.x = popup.width * 0.5;
                lblCanIHelpU.y = popup.height * 0.5;
                popup.addChild(lblTalkWelcome);
                popup.addChild(lblCanIHelpU);
                popup.runAction(cc.sequence([cc.scaleTo(0.2, 1.0, 1.0).easing(cc.easeBackOut()), cc.callFunc(function () {

                }.bind(this))]));
                this.addChild(popup);
            }.bind(this))]));
        }
        var arrShopItemView = this._itemGrid.getChildren();
        for (var i = 0; i < arrShopItemView.length; i++) {
            arrShopItemView[i].runAction(cc.sequence([cc.delayTime(0.25 + i * 0.1), cc.fadeIn(0.1)]));
        }
    },

    _reloadListItem: function () {
        var shopId = this._currShopId;
        var shopManager = mc.GameData.shopManager;

        this._isPopulateData = true;
        this._brkBottom.removeAllChildren();
        this._lblRefeshIn.removeAllChildren();
        this._lblTimesLeft.removeAllChildren();
        var arrPackage = shopManager.getShopItemByCategoryId(shopId);
        var itemGrid = this._itemGrid = bb.layout.grid(bb.collection.createArray(arrPackage.length, function (index) {
            if (index < arrPackage.length) {
                var pack = arrPackage[index];
                var shopItemView = new mc.ShopItemView(pack, function (result) {
                    if (result) {
                        this._spineGirl.setAnimation(1, "happy", false);
                    }
                    else {
                        this._spineGirl.setAnimation(2, "sorry", false);
                    }
                }.bind(this));
                shopItemView.opacity = 0;
                return shopItemView;
            }
            return null;
        }.bind(this)), 3, this._brkBottom.width);

        this._itemGrid.x = this._brkBottom.width * 0.5;
        this._itemGrid.y = this._brkBottom.height * 0.438;
        this._brkBottom.addChild(this._itemGrid);

        this._lblRefeshIn.setString(mc.dictionary.getGUIString("lblRefresh:"));
        this._lblTimesLeft.setString(mc.dictionary.getGUIString("lblRefreshNo"));
        this._lblTimesLeft.setDecoratorLabel("" + bb.utility.formatNumber(shopManager.getShopRefreshTicketNo(shopId)), mc.color.GREEN_NORMAL);
        var self = this;
        var _updateTime = function () {
            var remainRefreshInMs = shopManager.getRemainShopRefreshDuration(shopId);
            if (remainRefreshInMs <= 0) {
                self._lblRefeshIn.stopAllActions();
                self._lblRefeshIn.runAction(cc.sequence([cc.delayTime(5.0), cc.callFunc(function () {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.requestItemShopByCategory(shopId, function () {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        self._reloadListItem();
                        self._showShoppingList();
                    }.bind(this));
                }.bind(this))]));
            }
            this._lblRefeshIn.setDecoratorLabel(mc.view_utility.formatDurationTime(remainRefreshInMs), mc.color.GREEN_NORMAL);
        }.bind(this);
        this._lblRefeshIn.stopAllActions();
        this._lblRefeshIn.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(_updateTime)]).repeatForever());
        _updateTime();
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_SHOP;
    },

    isShowHeader: function () {
        return false;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});