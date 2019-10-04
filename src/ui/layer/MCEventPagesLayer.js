/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.EventPagesLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_pages_event);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var event1 = rootMap["content_event_1"];
        var event2 = rootMap["content_event_2"];
        var event3 = rootMap["content_event_3"];
        event1.setVisible(false);
        event2.setVisible(false);
        event3.setVisible(false);
        this.listPages = [0, event1, event2,event3];
        event1.setCascadeOpacityEnabled(true);
        event2.setCascadeOpacityEnabled(true);
        event3.setCascadeOpacityEnabled(true);
        this.bindEvent_1(event1);
        this.bindEvent_2(event2);
        this.bindEvent_3(event3);

        switch (mc.GameData.guiState.eventPage) {
            case 1:
                mc.protocol.checkFirstTimeRewards(function () {
                }.bind(this));
                this._showPageByIdx(1);
                break;
            case 2:
                this._showPageByIdx(2);
                break;
            case 3:
                this._showPageByIdx(3);
                break;
            default:
                this._showPageByIdx(2);
                break;
        }
    },

    _showPageByIdx: function (idx) {
        if (idx == 2) {
            mc.GameData.guiState.setCurrentShopCategory(mc.ShopManager.SHOP_ICECREAM);
        }
        var listPages = this.listPages;
        for (var i = 1; i < listPages.length; i++) {
            var page = listPages[i];
            if (idx !== i)
                page.setVisible(false);
            else {
                page.setVisible(true);
            }
        }
    },

    bindEvent_2: function (eventPage,fore) {
        var models = mc.GameData.shopManager.getShopItemByCategoryId(mc.ShopManager.SHOP_ICECREAM);
        if (!models||fore)
            mc.protocol.requestItemShopByCategory(mc.ShopManager.SHOP_ICECREAM, function () {
                models = mc.GameData.shopManager.getShopItemByCategoryId(mc.ShopManager.SHOP_ICECREAM);
                this._bindEvent2(models, eventPage);
            }.bind(this));
        else
            this._bindEvent2(models, eventPage);
    },

    _bindEvent2: function (models, eventPage) {
        var self = this;
        var shopManager = mc.GameData.shopManager;
        var itemClone = eventPage.getChildByName("itemClone");
        itemClone.setVisible(false);
        var desc = eventPage.getChildByName("desc");
        desc.setString("During the event, use [Ice Cream] to exchange for\n generous rewards in the event interface");
        var ice_cream_bg = eventPage.getChildByName("ice_cream_bg");
        var ice_cream_num = ice_cream_bg.getChildByName("ice_num");
        var banner_bot = eventPage.getChildByName("banner_bot");
        var list = eventPage.getChildByName("lvl");
        list.removeAllChildren();
        var lblRefeshIn = eventPage.getChildByName("lblRefeshIn");
        var lblTimesLeft = eventPage.getChildByName("lblTimesLeft");
        lblRefeshIn.setString(mc.dictionary.getGUIString("lblRefresh:"));
        lblTimesLeft.setString(mc.dictionary.getGUIString("lblRefreshNo"));
        lblTimesLeft.setDecoratorLabel("" + bb.utility.formatNumber(shopManager.getShopRefreshTicketNo(mc.ShopManager.SHOP_ICECREAM)), mc.color.GREEN_NORMAL);
        lblRefeshIn.setDecoratorLabel(mc.view_utility.formatDurationTime(shopManager.getRemainShopRefreshDuration(mc.ShopManager.SHOP_ICECREAM)), mc.color.GREEN_NORMAL);
        var btnRefresh = eventPage.getChildByName("btnRefresh");
        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        btnRefresh.registerTouchEvent(function () {
            new mc.RefreshShopDialog(mc.ShopManager.SHOP_ICECREAM, function () {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.refreshShopByCategory(mc.ShopManager.SHOP_ICECREAM, function (rs) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (rs) {
                        self.bindEvent_2(self.listPages[2]);
                    }
                });
            }).show();
        });
        ice_cream_num.setString(mc.GameData.playerInfo.getIceCream());

        var buyPack = function (buyPackage, dialog) {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.buyItem(mc.ShopManager.getPackageIndex(buyPackage), mc.ShopManager.getCategoryId(buyPackage), function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    self.bindEvent_2(self.listPages[2],true);
                }
                dialog.close();
            });
        };


        var _showItemInfo = function (productItem, buyPackage) {
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
                buyPack(buyPackage, dialog);
            });
            itemInfoDialog.show();
        };

        // var arrItems = mc.ItemStock.createArrJsonItemFromStr(promotionData);
        var layoutItems = bb.layout.grid(bb.collection.createArray(models.length, function (index) {
            var buyPackage = models[index];
            var productItem = mc.ShopManager.getProductItem(buyPackage);
            var priceItem = mc.ShopManager.getPriceItem(buyPackage);
            var isBought = mc.ShopManager.isBoughtItem(buyPackage);
            var saleOffValue = mc.ShopManager.getSaleOff(buyPackage);
            var itemStr = buyPackage["item"];
            var strs = itemStr.split('/');
            var itemInfo = mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(strs[1]));
            var itemView = new mc.ItemView(itemInfo);
            itemView.scale = 0.75;
            //itemView.registerViewItemInfo();
            itemView.setSwallowTouches(false);
            var itemPanel = itemClone.clone();
            itemPanel.setVisible(true);
            itemView.setName("itemView");
            itemPanel.addChild(itemView);
            itemView.setPosition(itemPanel.width / 2, itemPanel.height / 2);
            var ricebg = itemPanel.getChildByName("ricebg");
            ricebg.setString(priceItem.no, res.font_cam_stroke_32_export_fnt);
            itemPanel.setUserData({
                productItem: productItem,
                buyPackage: buyPackage
            });

            var _setBought = function (view) {
                var it = view.getChildByName("itemView");
                it.setCascadeColorEnabled(true);
                it.setGrayForAll(true);
                view.setEnabled(false);
            }.bind(this);
            if (isBought) {
                _setBought(itemPanel);
            }
            itemPanel.registerTouchEvent(function (sender) {
                var obj = sender.getUserData();
                _showItemInfo(obj.productItem, obj.buyPackage);
            });
            return itemPanel;
        }), 3, banner_bot.width, 60);
        list.pushBackCustomItem(layoutItems);
    },

    bindEvent_1: function (eventPage) {
        var firstPurchase = {
            item: "11001/30#11002/30#11034/1#11051/50#11019/2#11022/2#11025/2#11028/2#11031/2#11905/5000000",
            hero: 613
        };
        var banner = eventPage.getChildByName("banner");
        var list = eventPage.getChildByName("lvl");
        var lan = mc.storage.readSetting()["language"];
        banner.loadTexture(lan === "vi" ? "res/event_page/banner_top_firstpurchase_vi.png" : "res/event_page/banner_top_firstpurchase.png", ccui.Widget.LOCAL_TEXTURE);
        var btnBuy = eventPage.getChildByName("btnBuy");
        var desEvent = eventPage.getChildByName("desc");
        desEvent.setMultiLineString(mc.dictionary.getGUIString("ev4_des_event"), (2 - desEvent.getScale()) * cc.winSize.width);
        btnBuy.setString(mc.dictionary.getGUIString("lblClaim"), res.font_UTMBienvenue_stroke_32_export_fnt);
        btnBuy.y -= 30;
        btnBuy.registerTouchEvent(function () {
            if (mc.GameData.playerInfo.firstTimeRewards === 1) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.claimFirstTimeRewards(function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (result) {
                        bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("ev1_reward_at")).show();
                        mc.GameData.playerInfo.firstTimeRewards = 2;
                    }
                });
            } else if (mc.GameData.playerInfo.firstTimeRewards === 0) {
                var dialog = bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("ev4_des_event"), function () {
                    //this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SHOP_LIST);
                    mc.IAPShopDialog.showIAPPromo();
                }.bind(this), mc.dictionary.getGUIString("Buy"));
                dialog.show();
            } else {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("Rewards claimed"));
            }
        }.bind(this));

        var heroInfo = mc.dictionary.heroInfoMapByIndex[firstPurchase["hero"]];
        var heroView = new mc.HeroAvatarView(heroInfo);
        heroView.setUserData(heroInfo);
        heroView.registerTouchEvent(function (widget) {
            var hrInfo = widget.getUserData();
            if (hrInfo) {
                new mc.HeroInfoDialog(hrInfo).show()
            }
        });
        list.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList(cc.size(100, 50)));
        list.pushBackCustomItem(heroView);
        var arrItems = mc.ItemStock.createArrJsonItemFromStr(firstPurchase["item"]);
        var layoutItems = bb.layout.grid(bb.collection.createArray(arrItems.length, function (index) {
            var itemInfo = arrItems[index];
            var itemView = new mc.ItemView(itemInfo);
            itemView.scale = 0.75;
            itemView.registerViewItemInfo();
            itemView.setSwallowTouches(false);
            return itemView;
        }), 5, list.width - 150, 10);
        layoutItems.setScale(1.1);
        list.pushBackCustomItem(layoutItems);
    },

    bindEvent_3: function (eventPage) {
        var banner = eventPage.getChildByName("banner");
        var lan = mc.storage.readSetting()["language"];
        banner.loadTexture(lan === "vi" ? "res/event_page/banner_top_dailyevent_vi.png" : "res/event_page/banner_top_dailyevent_en.png", ccui.Widget.LOCAL_TEXTURE);

        var time = banner.getChildByName("lbl");
        var des = eventPage.getChildByName("banner_txt").getChildByName("lbl");
        des.setMultiLineString(mc.dictionary.getGUIString("ev2_des"), (2 - des.getScale()) * cc.winSize.width);
        var lblRewards = eventPage.getChildByName("lblRewards");
        lblRewards.setString(mc.dictionary.getGUIString("lblRewards"));
        time.setString(mc.dictionary.getGUIString("ev1_open_time"));
        var btnCheckin = eventPage.getChildByName("banner_bot").getChildByName("btn_checkin");
        var listview = eventPage.getChildByName("banner_bot").getChildByName("list_view");
        var lbl = btnCheckin.setString(mc.dictionary.getGUIString("lblCheckin"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lbl.x = btnCheckin.width * 0.55;

        var item = eventPage.getChildByName("item");

        var _getReward = function () {
            if (mc.GameData.giftEventManager.haveFreeReward()) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.claimGiftEvent(true, function () {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    _updateDailyRewardStatus();
                });
            }
        };

        btnCheckin.registerTouchEvent(function () {
            _getReward();
        });

        var self = this;
        self._mapDailyRewardViewByIndex = {};
        var _checkForWidget = function (widget, isCheck) {
            var check = widget.getChildByName("__check__" + widget.getName());
            if (!check && isCheck) {
                check = new cc.Sprite("#icon/Check.png");
                check.setName("__check__" + widget.getName());
                check.x = widget.width * 0.5;
                check.y = widget.height * 0.5;
                widget.addChild(check);
                widget.getChildByName("itemView").setBlack(true);
            }
            check && check.setVisible(isCheck);
        };
        var _setFocusForWidget = function (widget, isFocus) {
            var focus = widget.getChildByName("__focus__" + widget.getName());
            if (!focus && isFocus) {
                var item = widget.getChildByName("itemView");
                var focus = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_focus_json, res.spine_ui_item_panel_focus_atlas, 1.0);
                focus.setName("__focus__" + widget.getName());
                focus.x = item.x;
                focus.y = item.y;
                focus.setScale(item.getScale());
                widget.addChild(focus, -1);
            }
            focus && focus.setVisible(isFocus);
            focus && focus.setAnimation(0, "focus_idle", true);
        };

        var numberDisplayInGroup = 30;
        var _updateDailyRewardStatus = function () {
            for (var index in self._mapDailyRewardViewByIndex) {
                index = parseInt(index);
                var widget = self._mapDailyRewardViewByIndex[index];
                _checkForWidget(widget, mc.GameData.giftEventManager.isClaimedIndex(index));
                var isFocus = mc.GameData.giftEventManager.isAllowClaimIndex(index) || mc.GameData.giftEventManager.isMissingClaimIndex(index);
                _setFocusForWidget(widget, isFocus);
                if (isFocus) {
                    this.focusIndex = index;
                }
            }
            if (!mc.GameData.giftEventManager.haveFreeReward()) {
                btnCheckin.setColor(mc.color.BLACK_DISABLE_SOFT);
                btnCheckin.setEnabled(false);
            }
            else {
                btnCheckin.setColor(mc.color.WHITE_NORMAL);
                btnCheckin.setEnabled(true);
            }
        }.bind(this);
        var callback = function () {
            var gifts = mc.GameData.giftEventManager.getDailyGifts();
            var _createRewardContainer = function (clone, index) {
                var title = clone.getChildByName("title");
                var info = gifts[index];
                clone.info = info;
                title.setString(mc.dictionary.getGUIString("lblDay") + " " + (info.day));
                title.setColor(mc.color.BROWN_SOFT);
                var icon = clone.getChildByName("icon");
                var item = mc.ItemStock.createJsonItemByStr(info["giftString"]);
                var itemView = new mc.ItemView(item);
                itemView.scale = 0.9;
                itemView.getQuantityLabel().y += 15;
                itemView.registerViewItemInfo();
                itemView.setName("itemView");
                clone.addChild(itemView);
                itemView.setPosition(icon.x, icon.y);
                clone.setCascadeColorEnabled(true);
                clone.setCascadeOpacityEnabled(true);
                icon.removeFromParent();
                return clone;
            };

            var layout1 = bb.layout.grid(bb.collection.createArray(numberDisplayInGroup, function (index) {
                var rwIndex = index;
                if (rwIndex < mc.GameData.giftEventManager.getDailyGifts().length) {
                    var clone = item.clone();
                    self._mapDailyRewardViewByIndex[index] = _createRewardContainer(clone, rwIndex);
                    return clone;
                }
                var nullLayout = new ccui.Layout();
                nullLayout.anchorX = nullLayout.anchorY = 0.5;
                nullLayout.width = item.width;
                nullLayout.height = item.height;
                return nullLayout;
            }), 5, eventPage.width);

            listview.addChild(layout1);
            listview.forceDoLayout();

            self.scheduleOnce(function () {
                _updateDailyRewardStatus();
                var scrollIndex = self.focusIndex;
                if (scrollIndex >= 0 && self._mapDailyRewardViewByIndex[scrollIndex]) {
                    bb.utility.scrollTo(listview, self._mapDailyRewardViewByIndex[scrollIndex].y - listview.height * 0.5, 0.1);
                }
            }.bind(this));
        };
        if (mc.GameData.giftEventManager.getDailyGifts()) {
            callback && callback();
        }
    },

    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_PAGES_EVENT;
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
