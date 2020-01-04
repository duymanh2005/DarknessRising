/**
 * Created by long.nguyen on 8/9/2017.
 */
mc.ItemStockLayer = mc.MainBaseLayer.extend({
    _mapItemViewById: null,

    ctor: function (parseNode) {
        this._super();
        mc.storage.featureNotify.itemLayerShowed = true;
        mc.storage.saveFeatureNotify();
        this._mapItemViewById = {};
        this.maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
        var root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelTop = rootMap["panelTop"];
        var panelMiddle = rootMap["panelMiddle"];
        var nodeBrk = rootMap["nodeBrk"];

        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Event.png", ccui.Widget.LOCAL_TEXTURE));

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

        tabWeaponActive.x = root.width * 0.15;
        tabWeaponActive.y = root.height * 0.76;
        tabWeaponNormal.x = root.width * 0.15;
        tabWeaponNormal.y = root.height * 0.76;
        tabItemActive.x = root.width * 0.385;
        tabItemActive.y = root.height * 0.76;
        tabItemNormal.x = root.width * 0.385;
        tabItemNormal.y = root.height * 0.76;
        tabMaterialActive.x = root.width * 0.615;
        tabMaterialActive.y = root.height * 0.76;
        tabMaterialNormal.x = root.width * 0.615;
        tabMaterialNormal.y = root.height * 0.76;
        tabPuzzleActive.x = root.width * 0.85;
        tabPuzzleActive.y = root.height * 0.76;
        tabPuzzleNormal.x = root.width * 0.85;
        tabPuzzleNormal.y = root.height * 0.76;

        root.addChild(tabWeaponNormal);
        root.addChild(tabWeaponActive);
        root.addChild(tabItemActive);
        root.addChild(tabItemNormal);
        root.addChild(tabMaterialActive);
        root.addChild(tabMaterialNormal);
        root.addChild(tabPuzzleActive);
        root.addChild(tabPuzzleNormal);

        var btnItemWiki = new ccui.ImageView("icon/ico_library.png", ccui.Widget.PLIST_TEXTURE);

        //btnTierHero.x = brkTitle.x - brkTitle.width * 0.5 - btnEditTeam.width * 0.5 - 20;
        btnItemWiki.x = brkTitle.x - btnItemWiki.width - 125;
        btnItemWiki.y = brkTitle.y + 10;
        btnItemWiki.registerTouchEvent(function () {
            mc.GUIFactory.showItemsWikiScreen();
        }.bind(this));
        root.addChild(btnItemWiki);
        btnItemWiki.setVisible(false);

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblItemList"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var btnInventory = new ccui.ImageView("icon/ico_vault.png", ccui.Widget.PLIST_TEXTURE);
        btnInventory.scale = 0.54;
        btnInventory.x = cc.winSize.width - btnInventory.width * 0.5 - 10;
        btnInventory.y = root.height * 0.82;
        btnInventory.registerTouchEvent(function () {
            mc.GUIFactory.showInventoryScreen();
        });
        root.addChild(btnInventory);

        var notifySystem = mc.GameData.notifySystem;
        var lvUpNotification = notifySystem.getEquipmentLevelUpNotification();

        var _createItemWidget = function (itemInfo) {
            var widget = new mc.ItemView(itemInfo);
            var shardUpNotification = notifySystem.getShardUpNotification();
            widget.scale = 0.9;
            if (mc.ItemStock.getHeroIdEquipping(itemInfo)) {
                widget.setStatusText("Equip");
            }
            //if (lvUpNotification && mc.ItemStock.isItemEquipment(itemInfo)) {
            //    mc.view_utility.setNotifyIconForWidget(widget, lvUpNotification[mc.ItemStock.getItemId(itemInfo)], 0.95, 0.99);
            //} else if (shardUpNotification && _isTabSoul(itemInfo)) {
            //    mc.view_utility.setNotifyIconForWidget(widget, shardUpNotification[mc.ItemStock.getItemId(itemInfo)], 0.95, 0.99);
            //}
            var newItems = mc.storage.readNewItems();
            if (shardUpNotification && _isTabSoul(itemInfo)) {
                mc.view_utility.setNotifyIconForWidget(widget, shardUpNotification[mc.ItemStock.getItemId(itemInfo)], 0.95, 0.99);
            } else if (newItems && newItems[itemInfo["id"]]) {
                mc.view_utility.setNotifyIconForWidget(widget, true, 0.95, 0.99);
            }
            widget.registerTouchEvent(self._viewItemInfo.bind(self), self._viewItemInfo.bind(self));
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
                } else {
                    var lock = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
                    lock.setName("lock");
                    widget.addChild(lock);
                    lock.setPosition(widget.width / 2, widget.height / 2);
                    widget._value = -2;
                }
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
                if (!mc.ItemStock.getItemQuantity(itemInfo)) {
                    widget.setBlack(true);
                }
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
                itemType === mc.const.ITEM_TYPE_HERO_TICKET ||
                itemType === mc.const.ITEM_TYPE_GIFT_RANDOM ||
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
        var soulNotify = false;
        for (var heroIndex in mc.dictionary.heroInfoMapByIndex) {
            var recipe = mc.HeroStock.getHeroRecipe(mc.dictionary.heroInfoMapByIndex[heroIndex]);
            if (recipe) {
                var soulInfoRequire = mc.ItemStock.createJsonItemByStr(recipe);
                var soulIndex = mc.ItemStock.getItemIndex(soulInfoRequire);
                var soulNum = mc.ItemStock.getItemQuantity(soulInfoRequire);
                var soulInfoInStock = mc.GameData.itemStock.getOverlapItemByIndex(soulIndex);
                var soulInfoTemp = mc.ItemStock.createJsonItemInfo(soulIndex, mc.ItemStock.getItemQuantity(soulInfoInStock), soulInfoInStock ? mc.ItemStock.getItemId(soulInfoInStock) : "1");
                soulInfoTemp["value"] = heroIndex;
                soulInfoTemp["maxValue"] = soulNum;
                arrItem3.push(soulInfoTemp);
                if (!soulNotify && soulInfoTemp["no"] >= soulNotify["maxValue"]) {
                    soulNotify = true;
                }
            }
        }
        var _updateAllItemModel = function () {
            var itemStock = mc.GameData.itemStock;
            var arrItemAll = itemStock.getItemList();
            var arrItemListByTab = [[], [], []];
            for (var i = 0; i < arrItemAll.length; i++) {
                var item = arrItemAll[i];
                if (_isTabEquip(item)) {
                    arrItemListByTab[0].push(item);
                }
                else {
                    if (_isTabPotion(item)) {
                        arrItemListByTab[1].push(item);
                    }
                    else {
                        if (mc.ItemStock.getItemType(item) !== mc.const.ITEM_TYPE_SOUL)
                            arrItemListByTab[2].push(item);
                    }
                }
            }
            arrItem = arrItemListByTab[0];
            arrItem1 = arrItemListByTab[1];
            arrItem2 = arrItemListByTab[2];
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

        var numMaxItem = mc.const.MAX_ITEM_SLOT + 5;
        var gridViewEquipment = this._gridEquipmentInventory = new mc.SortedGridView(panelMiddle)
            .setInfoText(this._getInfoTitle(), this._getInfoDesc(), this._getInfoWidth())
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
                    if (mc.ItemStock.getHeroIdEquipping(itemInfo)) {
                        val += 100000;
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

        this.traceDataChange(mc.GameData.itemStock, function (rs) {
            if (rs) {
                _updateAllItemModel();
                this.maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
                var arrAddItemViewByTabIndex = [[], [], [], []];
                var arrUpdateItem = rs.param;
                if (arrUpdateItem) {
                    for (var i = 0; i < arrUpdateItem.length; i++) {
                        var updateItemInfo = arrUpdateItem[i];
                        if (mc.ItemStock.getItemQuantity(updateItemInfo) > 0) {
                            if (!self._mapItemViewById[mc.ItemStock.getItemId(updateItemInfo)]) {// do not found item view
                                var tabIndex = 0;
                                if (_isTabEquip(updateItemInfo)) {
                                    tabIndex = 0;
                                }
                                else if (_isTabPotion(updateItemInfo)) {
                                    tabIndex = 1;
                                }
                                else if (_isTabSoul(updateItemInfo)) {
                                    tabIndex = 3;
                                }
                                else {
                                    tabIndex = 2;
                                }
                                arrAddItemViewByTabIndex[tabIndex].push(_createItemWidget(updateItemInfo));
                            }
                        }
                    }
                }
                this._countEquipViewByType();
                for (var t = 0; t < this._arrGridView.length; t++) {
                    _updateGridView(this._arrGridView[t], arrAddItemViewByTabIndex[t]);
                    if (t === 0) {
                        this._gridEquipmentInventory.setInfoText(this._getInfoTitle(), this._getInfoDesc(), this._getInfoWidth());
                        this._gridEquipmentInventory.updateInfoText();
                    }
                }
                this._countEquipViewByType();
            }
        }.bind(this));

        this.traceDataChange(mc.GameData.playerInfo, function (rs) {
            if (this.maxSlot !== mc.GameData.playerInfo.getMaxItemSlot()) {
                this.maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
                this._gridEquipmentInventory.setInfoText(this._getInfoTitle(), this._getInfoDesc(), this._getInfoWidth());
                this._gridEquipmentInventory.updateInfoText();
                this.applyNewSlotSize();
            }
        }.bind(this));

        tabWeaponNormal.setName("weapon");
        tabItemNormal.setName("item");
        tabMaterialNormal.setName("material");
        tabPuzzleNormal.setName("puzzle");
        var _selectTab = function (tabName) {
            mc.GameData.guiState.itemActiveTab = tabName;
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
                this._checkAndClearNotifyPotionAndMaterailTab();
                mc.storage.itemTabTouched["equip"] = true;
                mc.storage.saveItemTabTouched();
                tabWeaponActive.setVisible(true);
                tabItemNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                tabPuzzleNormal.setVisible(true);
                gridViewEquipment.setVisible(true);
            }
            else if (tabName === "item") {
                this._checkAndClearNotifyPotionAndMaterailTab();
                mc.storage.itemTabTouched["potion"] = true;
                mc.storage.saveItemTabTouched();
                tabItemActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                tabPuzzleNormal.setVisible(true);
                gridViewConsumable.setVisible(true);
            }
            else if (tabName === "material") {
                this._checkAndClearNotifyPotionAndMaterailTab();
                mc.storage.itemTabTouched["other"] = true;
                mc.storage.saveItemTabTouched();
                tabMaterialActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabItemNormal.setVisible(true);
                tabPuzzleNormal.setVisible(true);
                gridViewMaterial.setVisible(true);
            }
            else if (tabName === "puzzle") {
                this._checkAndClearNotifyPotionAndMaterailTab();
                mc.storage.itemTabTouched["soul"] = true;
                mc.storage.saveItemTabTouched();
                tabPuzzleActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabItemNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                gridViewSoul.setVisible(true);
            }
        }.bind(this);

        tabItemNormal.registerTouchEvent(function () {
            _updateNotifyForTab();
            _selectTab(tabItemNormal.getName());
        }.bind(this));

        tabWeaponNormal.registerTouchEvent(function () {
            _updateNotifyForTab();
            _selectTab(tabWeaponNormal.getName());
        }.bind(this));

        tabMaterialNormal.registerTouchEvent(function () {
            _updateNotifyForTab();
            _selectTab(tabMaterialNormal.getName());
        }.bind(this));

        tabPuzzleNormal.registerTouchEvent(function () {
            _updateNotifyForTab();
            _selectTab(tabPuzzleNormal.getName());
        }.bind(this));



        var _updateNotifyForTab = function () {
            var notifyIcon = null;
            //notifyIcon = mc.view_utility.setNotifyIconForWidget(tabWeaponActive, notifySystem.getEquipmentLevelUpNotification(), 0.8);
            //notifyIcon = mc.view_utility.setNotifyIconForWidget(tabWeaponNormal, notifySystem.getEquipmentLevelUpNotification(), 0.8);

            var notifyIcon = mc.view_utility.setNotifyIconForWidget(tabWeaponActive, !mc.storage.itemTabTouched["equip"], 0.8);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(tabWeaponNormal, !mc.storage.itemTabTouched["equip"], 0.8);

            var notifyIcon = mc.view_utility.setNotifyIconForWidget(tabItemActive, !mc.storage.itemTabTouched["potion"], 0.8);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(tabItemNormal, !mc.storage.itemTabTouched["potion"], 0.8);

            var notifyIcon = mc.view_utility.setNotifyIconForWidget(tabMaterialActive, !mc.storage.itemTabTouched["other"], 0.8);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(tabMaterialActive, !mc.storage.itemTabTouched["other"], 0.8);

            notifyIcon = mc.view_utility.setNotifyIconForWidget(tabPuzzleActive, notifySystem.getShardUpNotification() && !mc.storage.itemTabTouched["soul"] , 0.8);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(tabPuzzleNormal, notifySystem.getShardUpNotification() && !mc.storage.itemTabTouched["soul"], 0.8);
        };

        _updateNotifyForTab();
        _selectTab(mc.GameData.guiState.itemActiveTab || tabWeaponNormal.getName());
        this.traceDataChange(notifySystem, function () {
            _updateNotifyForTab();
        });
    },

    _checkAndClearNotifyPotionAndMaterailTab : function(){
        if(mc.storage.itemTabTouched["potion"] && !bb.utility.isEmptyObj(mc.storage.newItems) && !mc.storage.potionItemTabNotifyClear)
        {
            for(var i in mc.storage.newItems)
            {
                var itemInfo =  mc.GameData.itemStock.getItemById(i);
                if(itemInfo)
                {
                    if(mc.ItemStock.isItemPotion(itemInfo))
                    {
                        delete mc.storage.newItems[i];
                    }
                }
                else
                {
                    delete mc.storage.newItems[i];
                }
            }
            var  arrItem = this._gridConsumable.getAllElementView();
            if(arrItem)
            {
                for(var j = 0;j<arrItem.length;j++)
                {
                    var notifyIcon = arrItem[j].getChildByName("__notify__");
                    if (notifyIcon) {
                        notifyIcon.setVisible(false);
                    }
                }
            }
            mc.storage.potionItemTabNotifyClear = true;
        }
        if(mc.storage.itemTabTouched["other"] && !bb.utility.isEmptyObj(mc.storage.newItems) && !mc.storage.otherItemTabNotifyClear)
        {
            for(var i in mc.storage.newItems)
            {
                var itemInfo = mc.GameData.itemStock.getItemById(i);
                if(itemInfo)
                {
                    if(!mc.ItemStock.isItemEquipment(itemInfo) && !mc.ItemStock.isItemSoul(itemInfo) && !mc.ItemStock.isItemPotion(itemInfo))
                    {
                        delete mc.storage.newItems[i];
                    }
                }
                else
                {
                    delete mc.storage.newItems[i];
                }
            }
            var  arrItem = this._gridMaterial.getAllElementView();
            if(arrItem)
            {
                for(var j = 0;j<arrItem.length;j++)
                {
                    var notifyIcon = arrItem[j].getChildByName("__notify__");
                    if (notifyIcon) {
                        notifyIcon.setVisible(false);
                    }
                }
            }
            mc.storage.otherItemTabNotifyClear = true;
        }
        if(mc.storage.itemTabTouched["soul"] && !bb.utility.isEmptyObj(mc.storage.newItems) && !mc.storage.soulItemTabNotifyClear)
        {
            for(var i in mc.storage.newItems)
            {
                var itemInfo = mc.GameData.itemStock.getItemById(i);
                if(itemInfo)
                {
                    var shardUpNotification = mc.GameData.notifySystem.getShardUpNotification();
                    if(mc.ItemStock.isItemSoul(itemInfo))
                    {
                        if(!shardUpNotification || (shardUpNotification && !shardUpNotification[mc.ItemStock.getItemId(itemInfo)]))
                        {
                            delete mc.storage.newItems[i];
                        }
                    }
                }
                else
                {
                    delete mc.storage.newItems[i];
                }
            }
            var  arrItem = this._gridSoul.getAllElementView();
            if(arrItem)
            {
                for(var j = 0;j<arrItem.length;j++)
                {
                    var notifyIcon = arrItem[j].getChildByName("__notify__");
                    if (notifyIcon) {
                        notifyIcon.setVisible(false);
                    }
                }
            }
            mc.storage.soulItemTabNotifyClear = true;
        }
    },

    _getInfoTitle: function () {
        return mc.dictionary.getGUIString("Equips");
    },

    _getInfoDesc: function () {
        var arrItem = mc.GameData.itemStock.getItemList(this._isTabEquipment);
        return arrItem.length + "/" + mc.GameData.playerInfo.getMaxItemSlot();
    },

    _getInfoWidth: function () {
        return 210;
    },

    applyNewSlotSize: function () {
        if (this._gridEquipmentInventory) {
            var childs = this._gridEquipmentInventory.getScrollView().getChildren();
            var arrSlotPlus = [];
            var arrItem = mc.GameData.itemStock.getItemList(this._isTabEquipment);
            var count = mc.GameData.playerInfo.getMaxItemSlot() - arrItem.length;
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
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_TAB) {
                if (tutorialTrigger.param === "shard") {
                    if (mc.GameData.guiState.itemActiveTab != "puzzle") {
                        new mc.LayerTutorial(tutorialTrigger)
                            .setTargetWidget(this._tabPuzzleInActive)
                            .setScaleHole(1.5)
                            .setCharPositionY(cc.winSize.height * 0.4)
                            .show();
                    }
                    else {
                        mc.GameData.tutorialManager.nextTutorial();
                        mc.GameData.tutorialManager.notifyDataChanged();
                    }
                }

            }
        }
    },

    _findItemViewByIndex: function (index, findInGrid) {
        var _findIn = function (gridView) {
            var findView = null;
            var allView = gridView.getAllElementView();
            for (var i = 0; i < allView.length; i++) {
                var itemInfo = allView[i].getUserData();
                if (itemInfo && mc.ItemStock.getItemIndex(itemInfo) === index) {
                    findView = allView[i];
                    break;
                }
            }
            return findView;
        };

        if (findInGrid) {
            var findView = _findIn(findInGrid)
        }
        else {
            var findView = _findIn(this._gridEquipmentInventory);
            if (!findView) {
                findView = _findIn(this._gridMaterial);
            }
            if (!findView) {
                findView = _findIn(this._gridConsumable);
            }
            if (!findView) {
                findView = _findIn(this._gridSoul);
            }
        }
        return findView;
    },

    _viewSoulInfo: function (itemView) {
        mc.createItemPopupDialog(itemView.getUserData()).registerSummon(function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            var itemInfo = itemView.getUserData();
            mc.protocol.summonHeroPuzzle(mc.ItemStock.getItemValue(itemInfo), function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    new mc.HeroSummonScreen(true).show(new cc.LayerColor(cc.color.WHITE));
                }
            });
        }).show();
    },

    _viewItemInfo: function (itemView) {
        var notifyIcon = itemView.getChildByName("__notify__");
        if (notifyIcon) {
            notifyIcon.setVisible(false);
        }
        var itemInfo = itemView.getUserData();
        if (mc.storage.newItems && mc.storage.newItems[itemInfo["id"]]) {
            delete mc.storage.newItems[itemInfo["id"]];
            mc.storage.saveNewItems();
        }
        mc.createItemPopupDialog(itemView.getUserData()).registerShowHeroEquip().show();
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_ITEM_STOCK;
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