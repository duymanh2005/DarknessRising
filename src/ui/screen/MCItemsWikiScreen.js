/**
 * Created by long.nguyen on 5/14/2018.
 */


mc.ItemsWikiScreen = mc.Screen.extend({

    _mapItemViewById: null,

    initResources: function () {
        this._super();

        this._mapItemViewById = {};
        this.maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
        var node  = mc.loadGUI(res.screen_item_wiki_json);
        this.addChild(node);
        var root = this.root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelMiddle = rootMap["panelMiddle"];
        var nodeBrk = rootMap["nodeBrk"];
        var btnBack = new ccui.ImageView("button/Back_button.png", ccui.Widget.PLIST_TEXTURE);
        btnBack.x = 50;
        btnBack.y = brkTitle.y ;
        root.addChild(btnBack);
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        nodeBrk.addChild(new ccui.ImageView("res/brk/home_bur.png", ccui.Widget.LOCAL_TEXTURE));

        var tabWeaponActive = this._tabWeaponActive = new ccui.ImageView("button/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
        var tabWeaponNormal = this._tabWeaponInActive = new ccui.ImageView("button/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
        var tabItemActive = this._tabItemActive = tabWeaponActive.clone();
        var tabItemNormal = this._tabItemInActive = tabWeaponNormal.clone();
        var tabMaterialActive = this._tabMaterialActive = tabWeaponActive.clone();
        var tabMaterialNormal = this._tabMaterialInActive = tabWeaponNormal.clone();
        var tabPuzzleActive = this._tabPuzzleActive = tabWeaponActive.clone();
        var tabPuzzleNormal = this._tabPuzzleInActive = tabWeaponNormal.clone();
        panelMiddle.height -= 70;
        panelMiddle.y -= 35;

        var iconWeapon1 = new ccui.ImageView("icon/ico_weapon.png", ccui.Widget.PLIST_TEXTURE);
        tabWeaponActive.addChild(iconWeapon1);
        var iconWeapon2 = iconWeapon1.clone();
        tabWeaponNormal.addChild(iconWeapon2);
        var iconPotion1 = new ccui.ImageView("icon/ico_items.png", ccui.Widget.PLIST_TEXTURE);
        tabItemActive.addChild(iconPotion1);
        var iconPotion2 = iconPotion1.clone();
        tabItemNormal.addChild(iconPotion2);
        var iconOther1 = new ccui.ImageView("icon/ico_other.png", ccui.Widget.PLIST_TEXTURE);
        tabMaterialActive.addChild(iconOther1);
        var iconOther2 = iconOther1.clone();
        tabMaterialNormal.addChild(iconOther2);
        var iconPuzzle1 = new ccui.ImageView("icon/ico_puzzle.png", ccui.Widget.PLIST_TEXTURE);
        tabPuzzleActive.addChild(iconPuzzle1);
        var iconPuzzle2 = iconPuzzle1.clone();
        tabPuzzleNormal.addChild(iconPuzzle2);
        iconWeapon1.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);
        iconWeapon2.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);
        iconPotion2.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);
        iconPotion1.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);
        iconOther1.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);
        iconOther2.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);
        iconPuzzle1.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);
        iconPuzzle2.setPosition(tabWeaponActive.width / 2, tabWeaponActive.height * 0.4);

        var heightRate = 0.83;
        tabWeaponActive.x = root.width * 0.15;
        tabWeaponActive.y = root.height * heightRate;
        tabWeaponNormal.x = root.width * 0.15;
        tabWeaponNormal.y = root.height * heightRate;
        tabItemActive.x = root.width * 0.385;
        tabItemActive.y = root.height * heightRate;
        tabItemNormal.x = root.width * 0.385;
        tabItemNormal.y = root.height * heightRate;
        tabMaterialActive.x = root.width * 0.615;
        tabMaterialActive.y = root.height * heightRate;
        tabMaterialNormal.x = root.width * 0.615;
        tabMaterialNormal.y = root.height * heightRate;
        tabPuzzleActive.x = root.width * 0.85;
        tabPuzzleActive.y = root.height * heightRate;
        tabPuzzleNormal.x = root.width * 0.85;
        tabPuzzleNormal.y = root.height * heightRate;

        root.addChild(tabWeaponNormal);
        root.addChild(tabWeaponActive);
        root.addChild(tabItemActive);
        root.addChild(tabItemNormal);
        root.addChild(tabMaterialActive);
        root.addChild(tabMaterialNormal);
        root.addChild(tabPuzzleActive);
        root.addChild(tabPuzzleNormal);

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblItemList"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var notifySystem = mc.GameData.notifySystem;

        var _createItemWidget = function (itemInfo) {
            var widget = new mc.ItemView(itemInfo);
            widget.scale = 0.9;
            var temp = mc.GameData.itemStock.getOverlapItemByIndex(mc.ItemStock.getItemIndex(itemInfo));
            widget.registerTouchEvent(self._viewItemInfo.bind(self), self._viewItemInfo.bind(self));
            if(!temp)
            {
                widget.setBlack(true);
            }
            self._mapItemViewById[mc.ItemStock.getItemId(itemInfo)] = widget;
            return widget;
        }.bind(this);

        var _createItemWidgetByIndex = this._createItemWidgetByIndex = function (index) {
            var widget = null;
            if (index < arrItem.length) {
                var itemInfo = arrItem[index];
                widget = _createItemWidget(itemInfo);
            }
            else {
                widget = emptyWidget.clone();
                widget._value = 0;
                widget.rangeIndex = index;
                widget.setVisible(true);
                widget.scale = 0.9;
                widget.setCascadeOpacityEnabled(true);
                if (emptyEquipViewCount + arrItem.length < mc.GameData.playerInfo.getMaxItemSlot()) {
                    emptyEquipViewCount++;
                } else if (emptyEquipViewCount + arrItem.length + plusEquipViewCount < mc.const.MAX_ITEM_SLOT) {
                    var btnAdd = new ccui.ImageView("button/Cross_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                    btnAdd.setName("btnAdd");
                    widget.addChild(btnAdd);
                    btnAdd.setPosition(widget.width / 2, widget.height / 2);
                    btnAdd.registerTouchEvent(function (widget) {
                        mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT);
                    }.bind(this));
                    btnAdd.setSwallowTouches(false);
                    widget._value = -1;
                    plusEquipViewCount++;
                }
                //else {
                //    var lock = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
                //    lock.setName("lock");
                //    widget.addChild(lock);
                //    lock.setPosition(widget.width / 2, widget.height / 2);
                //    widget._value = -2;
                //}
            }
            return widget;
        }.bind(this);
        var _createItemWidgetByIndex1 = function (index) {
            var widget = null;
            if (index < arrItem1.length) {
                var itemInfo = arrItem1[index];
                widget = _createItemWidget(itemInfo);
            }
            else {
                widget = emptyWidget.clone();
                widget.rangeIndex = index;
                widget.setVisible(true);
                widget.scale = 0.9;
                widget.setCascadeOpacityEnabled(true);
            }
            return widget;
        }.bind(this);
        var _createItemWidgetByIndex2 = function (index) {
            var widget = null;
            if (index < arrItem2.length) {
                var itemInfo = arrItem2[index];
                widget = _createItemWidget(itemInfo);
            }
            else {
                widget = emptyWidget.clone();
                widget.rangeIndex = index;
                widget.setVisible(true);
                widget.scale = 0.9;
                widget.setCascadeOpacityEnabled(true);
            }
            return widget;
        }.bind(this);
        var _createItemWidgetByIndex3 = function (index) {
            var widget = null;
            if (index < arrItem3.length) {
                var itemInfo = arrItem3[index];
                widget = _createItemWidget(itemInfo);
                widget.registerTouchEvent(self._viewSoulInfo.bind(self), self._viewSoulInfo.bind(self));
            }
            else {
                widget = emptyWidget.clone();
                widget.rangeIndex = index;
                widget.setVisible(true);
                widget.scale = 0.9;
                widget.setCascadeOpacityEnabled(true);
            }
            return widget;
        }.bind(this);
        var emptyWidget = this._emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        emptyWidget.setVisible(false);
        this.addChild(emptyWidget);

        var _isTabEquip = this._isTabEquipment = function (item) {
            return mc.ItemStock.isItemEquipment(item);
        };
        var _isTabPotion = function (item) {
            var itemType = mc.ItemStock.getItemType(item);
            if (itemType === mc.const.ITEM_TYPE_POTION ||
                itemType === mc.const.ITEM_TYPE_PACK ||
                itemType === mc.const.ITEM_TYPE_GIFT_RANDOM ||
                itemType === mc.const.ITEM_TYPE_HERO_TICKET ||
                itemType === mc.const.ITEM_TYPE_TICKET) {
                return true;
            }
            return false;
        };
        var _isTabSoul = function (item) {
            var itemType = mc.ItemStock.getItemType(item);
            if (itemType === mc.const.ITEM_TYPE_SOUL) {
                return true;
            }
            return false;
        };

        var self = this;
        var arrItem = null;
        var arrItem1 = null;
        var arrItem2 = null;
        var arrItem3 = [];
        var _updateAllItemModel = function () {
            //var itemStock = mc.GameData.itemStock;
            //var arrItemAll = itemStock.getItemList();
            //var arrItemListByTab = [[], [], []];
            //for (var i = 0; i < arrItemAll.length; i++) {
            //    var item = arrItemAll[i];
            //    if (_isTabEquip(item)) {
            //        arrItemListByTab[0].push(item);
            //    }
            //    else {
            //        if (_isTabPotion(item)) {
            //            arrItemListByTab[1].push(item);
            //        }
            //        else {
            //            if (mc.ItemStock.getItemType(item) !== mc.const.ITEM_TYPE_SOUL)
            //                arrItemListByTab[2].push(item);
            //        }
            //    }
            //}
            var arrTemp = bb.utility.cloneJSON(mc.dictionary.getAllEquipmentFromData());
            arrItem = [];
            for(var i = 0;i<arrTemp.length;i++)
            {
                if(!arrTemp[i].optionIndex)
                {
                    var temp = mc.ItemStock.getEquipItemInfoAtLv(arrTemp[i],1);
                    arrItem.push(temp);
                }
            }
            var arrTemp = bb.utility.cloneJSON(mc.dictionary.getAllConsumableFromData());

            arrItem1 =[];
            arrItem2 = [];
            for(var i = 0;i<arrTemp.length;i++)
            {
                var temp = arrTemp[i];
                if (_isTabPotion(temp)) {
                    var itemType = mc.ItemStock.getItemType(temp);
                    if(itemType !== mc.const.ITEM_TYPE_PACK && itemType !== mc.const.ITEM_TYPE_GIFT_RANDOM)
                    {
                        arrItem1.push(temp);
                    }
                }
                else if (_isTabSoul(temp)) {
                    arrItem3.push(temp);
                }
                else
                {
                    arrItem2.push(temp);
                }
            }
        };

        var emptyEquipViewCount = 0;
        var plusEquipViewCount = 0;
        var _countEquipViewByType = this._countEquipViewByType = function () {
            emptyEquipViewCount = 0;
            plusEquipViewCount = 0;
            if (this._gridEquipmentInventory) {
                var arrView = this._gridEquipmentInventory.getAllElementView();
                for (var i = 0; i < arrView.length; i++) {
                    if (arrView[i]._value == 0) {
                        emptyEquipViewCount++;
                    }
                    if (arrView[i]._value == -1) {
                        plusEquipViewCount++;
                    }
                }
            }
        }.bind(this);

        _updateAllItemModel();

        var mod =  arrItem.length % 5;

        var numMaxItem = arrItem.length + 5 - mod ;
        var gridViewEquipment = this._gridEquipmentInventory = new mc.SortedGridView(panelMiddle)
            .setInfoText(this._getInfoTitle(), arrItem.length , this._getInfoWidth())
            .setSortingDataSource(["Power", "Level", "Rank", "Attack", "Defense", "Hp", "Recovery"], function (widget, indexAttr) {
                var itemInfo = widget.getUserData();
                var val = -1000;
                if (itemInfo) {
                    switch (indexAttr) {
                        case -1:
                            val = mc.ItemStock.getItemId(itemInfo);
                            break;
                        case 0:
                            val = mc.ItemStock.getItemBattlePower(itemInfo);
                            break;
                        case 1:
                            val = mc.ItemStock.getItemLevel(itemInfo);
                            break;
                        case 2:
                            val = mc.ItemStock.getItemRank(itemInfo);
                            break;
                        case 3:
                            val = mc.ItemStock.getItemAttack(itemInfo);
                            break;
                        case 4:
                            val = mc.ItemStock.getItemDefense(itemInfo);
                            break;
                        case 5:
                            val = mc.ItemStock.getItemHp(itemInfo);
                            break;
                        case 6:
                            val = mc.ItemStock.getItemResistant(itemInfo);
                            break;
                    }
                }
                else {
                    val += widget._value;
                }
                return val;
            })
            .setDataSource(numMaxItem, _createItemWidgetByIndex);
        root.addChild(gridViewEquipment);

        _countEquipViewByType();

        var numMaxItem1 = Math.max((Math.round(arrItem1.length / 5) + 1) * 5, 30);
        var gridViewConsumable = this._gridConsumable = new mc.SortedGridView(panelMiddle.clone())
            .setInfoText("Consumable", arrItem1.length, 210)
            .setSortingDataSource(["Rank", "Quantity"], function (widget, indexAttr) {
                var itemInfo = widget.getUserData();
                var val = -1000;
                if (itemInfo) {
                    switch (indexAttr) {
                        case -1:
                            val = mc.ItemStock.getItemId(itemInfo);
                            break;
                        case 0:
                            val = mc.ItemStock.getItemRank(itemInfo);
                            break;
                        case 1:
                            val = mc.ItemStock.getItemQuantity(itemInfo);
                            break;
                    }
                }
                return val;
            })
            .setDataSource(numMaxItem1, _createItemWidgetByIndex1);
        root.addChild(gridViewConsumable);

        var numMaxItem2 = Math.max((Math.round(arrItem2.length / 5) + 1) * 5, 30);
        var gridViewMaterial = this._gridMaterial = new mc.SortedGridView(panelMiddle.clone())
            .setInfoText("Material", arrItem2.length, 210)
            .setSortingDataSource(["Element", "Quantity"], function (widget, indexAttr) {
                var itemInfo = widget.getUserData();
                var val = -1000;
                if (itemInfo) {
                    switch (indexAttr) {
                        case -1:
                            val = mc.ItemStock.getItemIndex(itemInfo);
                            break;
                        case 0:
                            val = mc.ItemStock.getItemIndex(itemInfo);
                            break;
                        case 1:
                            val = mc.ItemStock.getItemQuantity(itemInfo);
                            break;
                    }
                }
                return val;
            })
            .setDataSource(numMaxItem2, _createItemWidgetByIndex2);
        root.addChild(gridViewMaterial);

        var numMaxItem3 = Math.max((Math.round(arrItem3.length / 5) + 1) * 5, 30);
        var gridViewSoul = this._gridSoul = new mc.SortedGridView(panelMiddle.clone())
            .setInfoText("Soul", arrItem3.length, 210)
            .setDataSource(numMaxItem3, _createItemWidgetByIndex3);
        root.addChild(gridViewSoul);
        this._arrGridView = [gridViewEquipment, gridViewConsumable, gridViewMaterial, gridViewSoul];
        for (var i = 0; i < this._arrGridView.length; i++) {
            this._arrGridView[i].y += 40;
        }

        var _updateGridView = function (gridView, arrAddItemView) {
            var arrRemoveView = [];
            var allItemView = gridView.getAllElementView();
            for (var i = 0; i < allItemView.length; i++) {
                var itemView = allItemView[i];
                var itemInfo = itemView.getUserData();
                var isEmpty = true;
                if (itemInfo) {
                    isEmpty = false;
                    var itemId = mc.ItemStock.getItemId(itemInfo);
                    var foundItemInfo = mc.GameData.itemStock.getItemById(itemId);
                    if (!foundItemInfo) {
                        arrRemoveView.push(itemView);
                        isEmpty = true;
                        delete this._mapItemViewById[itemId];
                    }
                }
                if (!isEmpty) {
                    itemView.updateQuantity();
                }
            }
            gridView.removeArrayElementView(arrRemoveView);
            if (arrAddItemView && arrAddItemView.length > 0) {
                gridView.addArrayElementView(arrAddItemView);
            }

        }.bind(this);

        //this.traceDataChange(mc.GameData.itemStock, function (rs) {
        //    if (rs) {
        //        _updateAllItemModel();
        //        this.maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
        //        var arrAddItemViewByTabIndex = [[], [], [], []];
        //        var arrUpdateItem = rs.param;
        //        if (arrUpdateItem) {
        //            for (var i = 0; i < arrUpdateItem.length; i++) {
        //                var updateItemInfo = arrUpdateItem[i];
        //                if (mc.ItemStock.getItemQuantity(updateItemInfo) > 0) {
        //                    if (!self._mapItemViewById[mc.ItemStock.getItemId(updateItemInfo)]) {// do not found item view
        //                        var tabIndex = 0;
        //                        if (_isTabEquip(updateItemInfo)) {
        //                            tabIndex = 0;
        //                        }
        //                        else if (_isTabPotion(updateItemInfo)) {
        //                            tabIndex = 1;
        //                        }
        //                        else if (_isTabSoul(updateItemInfo)) {
        //                            tabIndex = 3;
        //                        }
        //                        else {
        //                            tabIndex = 2;
        //                        }
        //                        arrAddItemViewByTabIndex[tabIndex].push(_createItemWidget(updateItemInfo));
        //                    }
        //                }
        //            }
        //        }
        //        this._countEquipViewByType();
        //        for (var t = 0; t < this._arrGridView.length; t++) {
        //            _updateGridView(this._arrGridView[t], arrAddItemViewByTabIndex[t]);
        //            if (t === 0) {
        //                this._gridEquipmentInventory.setInfoText(this._getInfoTitle(), this._getInfoDesc(), this._getInfoWidth());
        //                this._gridEquipmentInventory.updateInfoText();
        //            }
        //        }
        //        this._countEquipViewByType();
        //    }
        //}.bind(this));
        //
        //this.traceDataChange(mc.GameData.playerInfo, function (rs) {
        //    if (this.maxSlot !== mc.GameData.playerInfo.getMaxItemSlot()) {
        //        this.maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
        //        this._gridEquipmentInventory.setInfoText(this._getInfoTitle(), this._getInfoDesc(), this._getInfoWidth());
        //        this._gridEquipmentInventory.updateInfoText();
        //        this.applyNewSlotSize();
        //    }
        //}.bind(this));

        tabWeaponNormal.setName("weapon");
        tabItemNormal.setName("item");
        tabMaterialNormal.setName("material");
        tabPuzzleNormal.setName("puzzle");
        var _selectTab = function (tabName) {
            tabWeaponActive.setVisible(false);
            tabWeaponNormal.setVisible(false);
            tabItemActive.setVisible(false);
            tabItemNormal.setVisible(false);
            tabMaterialActive.setVisible(false);
            tabMaterialNormal.setVisible(false);
            tabPuzzleActive.setVisible(false);
            tabPuzzleNormal.setVisible(false);
            gridViewEquipment.setVisible(false);
            gridViewConsumable.setVisible(false);
            gridViewMaterial.setVisible(false);
            gridViewSoul.setVisible(false);
            if (tabName === "weapon") {
                tabWeaponActive.setVisible(true);
                tabItemNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                tabPuzzleNormal.setVisible(true);
                gridViewEquipment.setVisible(true);
            }
            else if (tabName === "item") {
                tabItemActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                tabPuzzleNormal.setVisible(true);
                gridViewConsumable.setVisible(true);
            }
            else if (tabName === "material") {
                tabMaterialActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabItemNormal.setVisible(true);
                tabPuzzleNormal.setVisible(true);
                gridViewMaterial.setVisible(true);
            }
            else if (tabName === "puzzle") {
                tabPuzzleActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabItemNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                gridViewSoul.setVisible(true);
            }
        };

        tabItemNormal.registerTouchEvent(function () {
            _selectTab(tabItemNormal.getName());
        });

        tabWeaponNormal.registerTouchEvent(function () {
            _selectTab(tabWeaponNormal.getName());
        });

        tabMaterialNormal.registerTouchEvent(function () {
            _selectTab(tabMaterialNormal.getName());
        });

        tabPuzzleNormal.registerTouchEvent(function () {
            _selectTab(tabPuzzleNormal.getName());
        });

        _selectTab(tabWeaponNormal.getName());

    },


    _getInfoTitle: function () {
        return mc.dictionary.getGUIString("Equips");
    },

    _getInfoWidth: function () {
        return 210;
    },

    applyNewSlotSize: function () {
        if (this._gridEquipmentInventory) {
            var childs = this._gridEquipmentInventory.getScrollView().getChildren();
            var arrSlotPlus = [];
            var arrItem = mc.dictionary.getAllEquiment(); //mc.GameData.itemStock.getItemList(this._isTabEquipment);
            var count = arrItem.length;
            count = Math.min(count, 10);
            if (count > 0) {
                for (var i in childs) {
                    var child = childs[i];
                    if (child._value == -1) {
                        arrSlotPlus.push(child);
                        if (count > 1) {
                            count--;
                        }
                        else {
                            break;
                        }
                    }
                }
                this._gridEquipmentInventory.removeArrayElementView(arrSlotPlus);
                this._countEquipViewByType();
            }
        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_ITEM_STOCK);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_ITEM_WIDGET) {
                var findView = this._findItemViewByIndex(tutorialTrigger.param);
                if (findView) {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(findView)
                        .setScaleHole(1.5)
                        .setCharPositionY(cc.winSize.height * 0.75)
                        .show();
                }
            }
        }
    },

    _findItemViewByIndex: function (index) {
        var _findIn = function (gridView) {
            var findView = null;
            var allView = gridView.getAllElementView();
            for (var i = 0; i < allView.length; i++) {
                if (mc.ItemStock.getItemIndex(allView[i].getUserData()) === index) {
                    findView = allView[i];
                    break;
                }
            }
            return findView;
        };

        var findView = _findIn(this._gridEquipmentInventory);
        if (!findView) {
            findView = _findIn(this._gridMaterial);
        }
        if (!findView) {
            findView = _findIn(this._gridConsumable);
        }
        return findView;
    },

    _viewSoulInfo: function (itemView) {
        mc.createItemPopupDialog(itemView.getUserData()).show();
    },

    _viewItemInfo: function (itemView) {
        mc.createItemPopupDialog(itemView.getUserData()).show();
    },


    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_ITEM_WIKI;
    }

});
mc.TierHeroStockScreen.VIEW_MODE = { RANKING : 1, CHAOS : 2};