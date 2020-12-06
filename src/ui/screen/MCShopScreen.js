/**
 * Created by long.nguyen on 10/25/2017.
 */
mc.ShopScreen = mc.Screen.extend({

    initResources: function () {
        var node = this._screen = mc.loadGUI(res.screen_shop_json);
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var self = this;
        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_5_plist);

        var btnBack = rootMap["btnBack"];
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

        var shopId = this._currShopId = mc.GameData.guiState.getCurrentShopCategoryId();
        if (shopId === mc.ShopManager.SHOP_GOBLIN) {
            var spineGirl = this._spineGirl = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chaos_goblin_json, res.spine_ui_chaos_goblin_atlas, 0.25);
            spineGirl.setCompleteListener(function (trackEntry) {
                if (trackEntry.trackIndex === 1 ||
                    trackEntry.trackIndex === 2 ||
                    trackEntry.trackIndex === 3) {
                    this._spineGirl.clearTrack(trackEntry.trackIndex);
                    this._spineGirl.setAnimation(0, "idle", true);
                    sexTouchLayout.setEnabled(true);
                    this.lblTalkWelcome && this.lblTalkWelcome.setComplexString(this.buildWelcome(), mc.color.BROWN_SOFT);
                }
            }.bind(this));
            this._spineGirl.setAnimation(0, "idle", true);
            this._spineGirl.setScale(2.5);
            this._spineGirl.y -= 100;
            nodeChar.addChild(spineGirl);
        } else {
            var spineGirl = this._spineGirl = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_elfshop_json, res.spine_ui_elfshop_atlas, 0.25);
            spineGirl.setCompleteListener(function (trackEntry) {
                if (trackEntry.trackIndex === 1 ||
                    trackEntry.trackIndex === 2 ||
                    trackEntry.trackIndex === 3) {
                    this._spineGirl.clearTrack(trackEntry.trackIndex);
                    this._spineGirl.setAnimation(0, "idle", true);
                    sexTouchLayout.setEnabled(true);
                    this.lblTalkWelcome && this.lblTalkWelcome.setComplexString(this.buildWelcome(), mc.color.BROWN_SOFT);
                }
            }.bind(this));
            this._spineGirl.setAnimation(0, "idle", true);
            var sexTouchLayout = new ccui.Layout();
            sexTouchLayout.anchorX = sexTouchLayout.anchorY = 0.5;
            sexTouchLayout.width = 150;
            sexTouchLayout.height = 150;
            sexTouchLayout.y = 25;
            sexTouchLayout.registerTouchEvent(function () {
                sexTouchLayout.runAction(cc.callFunc(function () {
                    sexTouchLayout.setEnabled(false);
                }));
                this._spineGirl.setAnimation(3, "touch", false);
            }.bind(this));
            nodeChar.addChild(spineGirl);
            nodeChar.addChild(sexTouchLayout);
        }

        var urlBrkTop = res.brk_shop_normal;
        if (shopId === mc.ShopManager.SHOP_CHAOS) {
            urlBrkTop = res.brk_shop_chaos;
        }if (shopId === mc.ShopManager.SHOP_PET) {
            urlBrkTop = res.brk_shop_pet;
        } else if (shopId === mc.ShopManager.SHOP_ARENA) {
            urlBrkTop = res.brk_shop_arena;
        } else if (shopId === mc.ShopManager.SHOP_EVENTB) {
            urlBrkTop = res.brk_shop_halloween;
            this._brkBottom.setTexture(res.brk_shop_halloween_bottom);
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
        if (strCurrency.length > 2 || strCurrency.length === 1) {
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
            } else {
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

    onScreenShow: function () {
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
                popup.y = 1000;
                popup.width += 20;
                popup.anchorX = 0.78;
                popup.anchorY = 0;
                popup.scale = 0;
                var lblTalkWelcome = bb.framework.getGUIFactory().createText("Welcome to", res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_32);
                lblTalkWelcome.x = popup.width * 0.5;
                lblTalkWelcome.y = popup.height * 0.6;
                lblTalkWelcome.setScale(0.85);
                popup.addChild(lblTalkWelcome);
                lblTalkWelcome.setString("");
                lblTalkWelcome.setAnchorPoint(0.5, 0.5);
                if (mc.enableReplaceFontBM()) {
                    lblTalkWelcome.setString("");
                    lblTalkWelcome.setAnchorPoint(0, 0.5);
                    lblTalkWelcome.x = 60;
                    lblTalkWelcome.y = popup.height * 0.6;
                }


                this.lblTalkWelcome = mc.GUIFactory.applyComplexString(lblTalkWelcome, this.buildWelcome(), mc.color.BROWN_SOFT, res.font_UTMBienvenue_none_32_export_fnt);

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

    buildWelcome: function () {
        var welcomeText = mc.dictionary.getGUIString("Welcome to");
        welcomeText += " #0000ff_" + mc.ShopManager.getShopName(this._currShopId) + "#";
        welcomeText += "\n" + mc.dictionary.getGUIString("May I help you?");
        return welcomeText;
    },
    buildThank: function () {
        var welcomeText = mc.dictionary.getGUIString("Thank you !!!!");
        welcomeText += "\n" + mc.dictionary.getGUIString("Buy anything else ?");
        return welcomeText;
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
                        this.lblTalkWelcome.setComplexString(this.buildThank(), mc.color.BROWN_SOFT);
                    } else {
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

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_SHOP;
    }

});

mc.ShopItemView = ccui.Widget.extend({

    ctor: function (buyPackage, calback) {
        this._super();

        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = 100;
        this.height = 180;

        var productItem = mc.ShopManager.getProductItem(buyPackage);
        var priceItem = mc.ShopManager.getPriceItem(buyPackage);
        var isBought = mc.ShopManager.isBoughtItem(buyPackage);
        var saleOffValue = mc.ShopManager.getSaleOff(buyPackage);
        var url = mc.ItemStock.getItemRes(productItem);
        //var imgItem = new ccui.ImageView(url,ccui.Widget.PLIST_TEXTURE);
        var imgItem = this.itemView = new mc.ItemView(productItem);
        imgItem.getQuantityLabel().setVisible(false);
        imgItem.scale = 0.9;
        imgItem.anchorY = 0;
        this.addChild(imgItem);

        var lblQuantity = bb.framework.getGUIFactory().createText("x" + bb.utility.formatNumber(mc.ItemStock.getItemQuantity(productItem)));
        lblQuantity.anchorX = 1;
        this.addChild(lblQuantity);

        var brkMoney = new ccui.ImageView("patch9/pnl_shop_price.png", ccui.Widget.PLIST_TEXTURE);
        brkMoney.setCascadeOpacityEnabled(true);
        var assetView = mc.view_utility.createAssetView(priceItem);
        assetView.x = brkMoney.width * 0.5;
        assetView.y = brkMoney.height * 0.5;
        if (mc.ItemStock.getItemIndex(priceItem) === mc.const.ITEM_INDEX_ZEN) {
            assetView.getChildByName("icon").scale = 0.7;
        } else if (mc.ItemStock.getItemIndex(priceItem) === mc.const.ITEM_INDEX_BLESS) {
            assetView.getChildByName("icon").scale = 0.7;
        } else {
            assetView.getChildByName("icon").scale = 0.4;
        }

        brkMoney.addChild(assetView);

        if (saleOffValue) {
            assetView.x = brkMoney.width * 0.7;
            // var bg = new ccui.ImageView("patch9/pnl_maskname.png", ccui.Widget.PLIST_TEXTURE);
            var lblValX2 = bb.framework.getGUIFactory().createText(bb.utility.formatNumberKM(saleOffValue), res.font_cam_stroke_32_export_fnt);
            lblValX2.scale = 0.65;
            lblValX2.x = brkMoney.width * 0.3;
            lblValX2.y = brkMoney.height * 0.6;
            // bg.x = brkMoney.width * 0.2;
            // bg.y = brkMoney.height * 0.5;
            // brkMoney.addChild(bg);
            brkMoney.addChild(lblValX2);
            lblValX2.setString(bb.utility.formatNumberKM(saleOffValue));
            var line = new cc.DrawNode();
            line.drawSegment(cc.p(-lblValX2.width * lblValX2.getScale() / 2, 0), cc.p(lblValX2.width * lblValX2.getScale() / 2, 0), 2, mc.color.RED_SOFT);
            brkMoney.addChild(line);
            line.setPosition(lblValX2.x, lblValX2.y - 5);
        }

        this.addChild(brkMoney);
        var self = this;
        var _setBought = function () {
            self.itemView.setCascadeColorEnabled(true);
            self.itemView.setGrayForAll(true);
            this.setEnabled(false);
        }.bind(this);
        if (isBought) {
            _setBought();
        }

        brkMoney.x = this.width * 0.5;
        brkMoney.y = brkMoney.height * 0.5;
        imgItem.x = this.width * 0.5;
        imgItem.y = this.height * 0.25;
        lblQuantity.x = this.width;
        lblQuantity.y = this.height * 0.35;

        var _buyPackage = function (buyPackage, dialog) {
            var priceItem = mc.ShopManager.getPriceItem(buyPackage);
            var isShow = mc.view_utility.showExchangingIfAny(mc.ItemStock.getItemIndex(priceItem), mc.ItemStock.getItemQuantity(priceItem));
            if (!isShow) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.buyItem(mc.ShopManager.getPackageIndex(buyPackage), mc.ShopManager.getCategoryId(buyPackage), function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (result) {
                        _setBought();
                    }
                    calback && calback(result);
                    dialog.close();
                });
            }
        };

        var _showItemInfo = function () {
            var itemInfoDialog = mc.createItemPopupDialog(productItem);
            itemInfoDialog.setBuyPackage(buyPackage, function (buyPackage, dialog) {
                var checkForAvailableSlot = mc.GameData.checkForAvailableSlot(mc.GameData.CHECK_SLOT_TYPE_ITEM);
                var buyMore = checkForAvailableSlot["buyMore"];
                var avaiSlots = checkForAvailableSlot["avaiSlots"];
                if (avaiSlots <= 0) {
                    if (buyMore) {
                        mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFull"), function () {
                            mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT);
                        }, mc.dictionary.getGUIString("lblBuy")).show();
                    } else {
                        mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFullLimit"), function () {
                        }, mc.dictionary.getGUIString("lblOk")).show();
                    }
                    return;
                }
                _buyPackage(buyPackage, dialog);
            });
            itemInfoDialog.show();
        };
        this.registerTouchEvent(_showItemInfo, _showItemInfo);
        this.setCascadeOpacityEnabled(true);
    }

});