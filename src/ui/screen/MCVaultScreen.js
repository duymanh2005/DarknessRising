/**
 * Created by long.nguyen on 6/26/2018.
 */
mc.VaultScreen = mc.Screen.extend({
    _mapItemViewInVaultById: null,
    _mapItemViewInBagById: null,
    _mapPickItemsViewToVaultById: null,
    _mapPickItemsViewToBagById: null,
    _mapCountViewByName: null,

    initResources: function () {
        this._super();

        bb.sound.preloadEffect(res.sound_ui_button_exchange_item);

        this._mapItemViewInVaultById = {};
        this._mapItemViewInBagById = {};
        this._mapPickItemsViewToVaultById = {};
        this._mapPickItemsViewToBagById = {};
        this._mapCountViewByName = {};
        this._mapCountViewByName["inventory"] = {
            _emptyEquipViewCount: 0,
            _plusEquipViewCount: 0
        };
        this._mapCountViewByName["vault"] = {
            _emptyEquipViewCount: 0,
            _plusEquipViewCount: 0
        };
        var node = this._screen = mc.loadGUI(res.screen_inventory_json);
        this.addChild(node);

        var root = this.root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var brk = rootMap["brk"];
        var imgTitle = rootMap["imgTitle"];
        var bottomPanel = this.botPanel = rootMap["botPanel"];
        var topPanel = this.topPanel = rootMap["topPanel"];
        var btnToVault = this._btnToVault = rootMap["btnToBag"];
        var btnToBag = this._btnToBag = rootMap["btnToInventory"];
        btnToVault.y -= 25;
        btnToBag.y -= 25;
        btnToVault.setString(mc.dictionary.getGUIString("lblImport"));
        btnToBag.setString(mc.dictionary.getGUIString("lblExport"));
        var btnBack = rootMap["btnBack"];
        imgTitle.setString(mc.dictionary.getGUIString("lblVault"));
        var lblMsg = rootMap["msg"];
        if(mc.enableReplaceFontBM())
        {
            lblMsg = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblMsg);
            lblMsg.setFontSize(28);
        }
        lblMsg.setString(mc.dictionary.getGUIString("lblSuggestToUseVault"));

        var emptyWidget = this._emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        emptyWidget.setVisible(false);
        this.addChild(emptyWidget);

        this.initInventoryBag(root, this.topPanel);
        this.botPanel.setVisible(false);
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });
    },

    onScreenShow: function () {
        if (mc.GameData.itemStock.isEmptyVault()) {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.getItemsFromVault(function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                this.initVaultBag(this.root, this.botPanel);
                this.botPanel.setVisible(true);
            }.bind(this))
        }
        else {
            this.initVaultBag(this.root, this.botPanel);
            this.botPanel.setVisible(true);
        }
    },

    initInventoryBag: function (root, topPanel) {
        var self = this;
        var itemStock = mc.GameData.itemStock;
        var arrEquipments = self._arrEquipInInventory = itemStock.getItemList(function (itemInfo) {
            return mc.ItemStock.isItemEquipment(itemInfo);
        });

        var minView = 30;
        var _populateEquipment = function (arrEquipment) {
            this._gridEquipmentInventory && this._gridEquipmentInventory.removeFromParent();
            var numMaxItem = mc.const.MAX_ITEM_SLOT + 5;
            var gridViewEquipment = this._gridEquipmentInventory = new mc.SortedGridView(topPanel.clone())
                .setInfoText(mc.dictionary.getGUIString("lblTotal"), arrEquipment.length, 210)
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
                .setDataSource(numMaxItem, function (index) {
                    return self._createItemWidgetByIndex(index, self._arrEquipInInventory, self._mapPickItemsViewToVaultById, self._mapItemViewInBagById);
                });
            gridViewEquipment.setName("inventory");
            root.addChild(gridViewEquipment);
        }.bind(this);

        _populateEquipment(arrEquipments);

        this._btnToVault.registerTouchEvent(function () {
            var arrPickItemIds = [];
            for (var itemId in self._mapPickItemsViewToVaultById) {
                if (self._mapPickItemsViewToVaultById[itemId]) {
                    arrPickItemIds.push(parseInt(itemId));
                }
            }
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.doItemsWithVaults(arrPickItemIds, true, function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
            });
            self._mapPickItemsViewToVaultById = {};
            self._updateResult();
        });
        self._updateResult();

        this.traceDataChange(itemStock, function (rs) {
            if (rs) {
                var arrUpdateItem = rs.param;
                if (arrUpdateItem) {
                    this._updateEquipmentModels();
                    this._updateGridText();

                    var arrNewItemViewInBag = [];
                    var arrNewItemViewInVault = [];
                    for (var i = 0; i < arrUpdateItem.length; i++) {
                        var updateItemInfo = arrUpdateItem[i];
                        var itemId = mc.ItemStock.getItemId(updateItemInfo);
                        if (mc.ItemStock.getItemQuantity(updateItemInfo) > 0) {
                            if (!self._mapItemViewInBagById[itemId]) {// do not found item view
                                arrNewItemViewInBag.push(this._createItemWidget(updateItemInfo, self._mapPickItemsViewToVaultById, self._mapItemViewInBagById));
                                delete self._mapItemViewInVaultById[itemId];
                            }
                        }
                        else if (mc.ItemStock.isItemCofferState(updateItemInfo)) {
                            if (!self._mapItemViewInVaultById[itemId]) {// do not found item view
                                arrNewItemViewInVault.push(this._createItemWidget(updateItemInfo, self._mapPickItemsViewToBagById, self._mapItemViewInVaultById));
                                delete self._mapItemViewInBagById[itemId];
                            }
                        }
                    }
                    this._updateGridView(this._gridEquipmentInventory, arrNewItemViewInBag, false);
                    this._countEquipViewByType(this._gridEquipmentInventory);

                    this._updateGridView(this._gridEquipmentVault, arrNewItemViewInVault, true);
                    this._countEquipViewByType(this._gridEquipmentVault);
                }
            }
        }.bind(this));

        this._localMaxVaultSlot = mc.GameData.playerInfo.getMaxVaultSlot();
        this._localMaxItemSlot = mc.GameData.playerInfo.getMaxItemSlot();
        this.traceDataChange(mc.GameData.playerInfo, function (data) {
            this._updateGridText();
            if (this._localMaxVaultSlot != mc.GameData.playerInfo.getMaxVaultSlot()) {
                this._applyNewSlotSize(this._gridEquipmentVault);
            }
            if (this._localMaxItemSlot != mc.GameData.playerInfo.getMaxItemSlot()) {
                this._applyNewSlotSize(this._gridEquipmentInventory);
            }
        }.bind(this));

        this._updateGridText();
    },

    _updateEquipmentModels: function () {
        this._arrEquipInInventory = mc.GameData.itemStock.getItemList(function (itemInfo) {
            return mc.ItemStock.isItemEquipment(itemInfo);
        });
        this._arrEquipInVault = mc.GameData.itemStock.getArrayItemsInVault();
    },

    _updateGridText: function () {
        var arrEquipmentsInInventory = this._arrEquipInInventory;
        var playerInfo = mc.GameData.playerInfo;
        this._gridEquipmentInventory.setInfoText(mc.dictionary.getGUIString("Equips"), (arrEquipmentsInInventory ? arrEquipmentsInInventory.length : 0) + "/" + playerInfo.getMaxItemSlot(), 210);
        this._gridEquipmentInventory.updateInfoText();
        if (this._gridEquipmentVault) {
            var arrEquipmentsInVault = this._arrEquipInVault;
            this._gridEquipmentVault.setInfoText(mc.dictionary.getGUIString("Equips"), (arrEquipmentsInVault ? arrEquipmentsInVault.length : 0) + "/" + playerInfo.getMaxVaultSlot(), 210);
            this._gridEquipmentVault.updateInfoText();
        }
    },

    _showSuggestBuySlotIfAny: function (mapPickItem) {
        var self = this;
        var arrPickItemToVaultIds = [];
        for (var itemId in mapPickItem) {
            if (mapPickItem[itemId]) {
                arrPickItemToVaultIds.push(parseInt(itemId));
            }
        }
        var isPickToVault = mapPickItem === self._mapPickItemsViewToVaultById;
        var maxSlot = isPickToVault ? mc.GameData.playerInfo.getMaxVaultSlot() : mc.GameData.playerInfo.getMaxItemSlot();
        var arrEquipIn = isPickToVault ? this._arrEquipInVault : this._arrEquipInInventory;
        var currSlot = (arrEquipIn ? arrEquipIn.length : 0) + arrPickItemToVaultIds.length;
        var limit = isPickToVault ? mc.const.MAX_VAULT_SLOT : mc.const.MAX_ITEM_SLOT;
        var buyMore = false;
        var availableSlots = maxSlot - currSlot;
        if (availableSlots <= 0) {
            buyMore = maxSlot < limit;
        }
        var avaiSlots = availableSlots;
        if (avaiSlots <= 0) {
            if (buyMore) {
                mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFull"), function () {
                    mc.view_utility.showBuyingFunctionIfAny(isPickToVault ? mc.const.REFRESH_FUNCTION_BUY_VAULT_SLOT : mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT);
                }, mc.dictionary.getGUIString("lblBuy")).show();
            } else {
                mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFullLimit"), function () {
                }, mc.dictionary.getGUIString("lblOk")).show();
            }
            return true;
        }
        return false;

    },

    _selectFuncToBag: function (widget) {
        this._selectFunc(widget, this._mapPickItemsViewToBagById);
    },

    _selectFuncToVault: function (widget) {
        this._selectFunc(widget, this._mapPickItemsViewToVaultById);
    },

    _getSelectFuncByPickMap: function (pickMap) {
        return (pickMap === this._mapPickItemsViewToVaultById) ? this._selectFuncToVault.bind(this) : this._selectFuncToBag.bind(this);
    },

    _selectFunc: function (widget, pickMap) {
        var itemInfo = widget.getUserData();
        if (mc.ItemStock.getHeroIdEquipping(itemInfo)) {
            mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtItemIsUsing"));
        }
        else {
            var isShowSuggest = false;
            if( pickMap === this._mapPickItemsViewToVaultById && !widget.isBlack ){
                isShowSuggest = this._showSuggestBuySlotIfAny(this._mapPickItemsViewToVaultById);
            }
            if( pickMap === this._mapPickItemsViewToBagById && !widget.isBlack ){
                isShowSuggest = this._showSuggestBuySlotIfAny(this._mapPickItemsViewToBagById);
            }
            if( !isShowSuggest ){
                widget.setPick(!widget.isBlack);
                pickMap[mc.ItemStock.getItemId(itemInfo)] = widget.isBlack ? widget : null;
                this._updateResult();
            }
        }
    },

    _createItemWidget: function (itemInfo, pickMap, containerMap) {
        var widget = new mc.ItemView(itemInfo);
        widget.scale = 0.9;
        if (mc.ItemStock.getHeroIdEquipping(itemInfo)) {
            widget.setStatusText("Equip");
        }
        widget.registerTouchEvent(this._getSelectFuncByPickMap(pickMap));
        widget.registerTouchEvent(this._getSelectFuncByPickMap(pickMap), function (widget) {
            mc.createItemPopupDialog(widget.getUserData()).registerClearButton().registerShowHeroEquip().show();
        });
        containerMap[mc.ItemStock.getItemId(itemInfo)] = widget;
        return widget;
    },

    _createItemWidgetByIndex: function (index, arrItem, pickMap, containerMap) {
        var widget = null;
        if (index < arrItem.length) {
            var itemInfo = arrItem[index];
            widget = this._createItemWidget(itemInfo, pickMap, containerMap);
        }
        else {
            widget = this._emptyWidget.clone();
            widget.setVisible(true);
            widget._value = 0;
            widget.rangeIndex = index;
            widget.setVisible(true);
            widget.scale = 0.9;
            widget.setCascadeOpacityEnabled(true);

            var mapCount = this._mapCountViewByName["inventory"];
            var maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
            var refreshFuncId = mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT;
            if (containerMap === this._mapItemViewInVaultById) {
                mapCount = this._mapCountViewByName["vault"];
                maxSlot = mc.GameData.playerInfo.getMaxVaultSlot();
                refreshFuncId = mc.const.REFRESH_FUNCTION_BUY_VAULT_SLOT;
            }
            var emptyEquipViewCount = mapCount._emptyEquipViewCount;
            var plusEquipViewCount = mapCount._plusEquipViewCount;
            if (emptyEquipViewCount + arrItem.length < maxSlot) {
                emptyEquipViewCount++;
                mapCount._emptyEquipViewCount = emptyEquipViewCount;
            } else if (emptyEquipViewCount + arrItem.length + plusEquipViewCount < mc.const.MAX_ITEM_SLOT) {
                var btnAdd = new ccui.ImageView("button/Cross_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                btnAdd.setName("btnAdd");
                widget.addChild(btnAdd);
                btnAdd.setPosition(widget.width / 2, widget.height / 2);
                btnAdd.registerTouchEvent(function (widget) {
                    mc.view_utility.showBuyingFunctionIfAny(refreshFuncId);
                }.bind(this));
                btnAdd.setSwallowTouches(false);
                widget._value = -1;
                plusEquipViewCount++;
                mapCount._plusEquipViewCount = plusEquipViewCount;
            } else {
                var lock = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
                lock.setName("lock");
                widget.addChild(lock);
                lock.setPosition(widget.width / 2, widget.height / 2);
                widget._value = -2;
            }
        }
        return widget;
    },

    _countEquipViewByType: function (gridView) {
        var mapCount = this._mapCountViewByName[gridView.getName()];
        if (mapCount) {
            mapCount._emptyEquipViewCount = 0;
            mapCount._plusEquipViewCount = 0;
            var arrView = gridView.getAllElementView();
            for (var i = 0; i < arrView.length; i++) {
                if (arrView[i]._value == 0) {
                    mapCount._emptyEquipViewCount++;
                }
                if (arrView[i]._value == -1) {
                    mapCount._plusEquipViewCount++;
                }
            }
        }
    },

    _applyNewSlotSize: function (gridView) {
        if (gridView) {
            var childs = gridView.getScrollView().getChildren();
            var arrSlotPlus = [];
            var maxSlot = mc.GameData.playerInfo.getMaxItemSlot();
            var arrItem = this._arrEquipInInventory;
            if (gridView === this._gridEquipmentVault) {
                arrItem = this._arrEquipInVault;
                maxSlot = mc.GameData.playerInfo.getMaxVaultSlot();
            }
            var name = gridView.getName();
            var count = maxSlot - arrItem.length;
            count = Math.min(count, name==="vault" ? 20 : 10);
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
                gridView.removeArrayElementView(arrSlotPlus);
                this._countEquipViewByType(gridView);
            }
        }
    },

    _updateGridView: function (gridView, arrAddItemView, searchInVault) {
        var itemStock = mc.GameData.itemStock;
        var arrBlockView = [];
        var arrRemoveView = [];
        var allItemView = gridView.getAllElementView();
        for (var i = 0; i < allItemView.length; i++) {
            var itemView = allItemView[i];
            var itemInfo = itemView.getUserData();
            var isEmpty = true;
            if (itemInfo) {
                isEmpty = false;
                var foundItemInfo = !searchInVault ? itemStock.getItemById(mc.ItemStock.getItemId(itemInfo)) : itemStock.getFromVault(mc.ItemStock.getItemId(itemInfo));
                if (!foundItemInfo) {
                    arrRemoveView.push(itemView);
                    isEmpty = true;
                }
            }
            else {
                arrBlockView.push(itemView);
            }
        }
        gridView.removeArrayElementView(arrRemoveView);
        if (arrAddItemView && arrAddItemView.length > 0) {
            gridView.addArrayElementView(arrAddItemView);
            var c = 0;
            var num = arrAddItemView.length;
            for (var i = 0; i < arrBlockView.length && c < num; i++) {
                if (!arrBlockView[i]._value) {
                    arrBlockView[i].removeFromParent();
                    c++;
                }
            }
            gridView.forceRefresh();
        }

    },

    initVaultBag: function (root, topPanel) {
        var self = this;

        var itemStock = mc.GameData.itemStock;
        var arrEquipments = this._arrEquipInVault = itemStock.getArrayItemsInVault();
        var _populateEquipment = function (arrEquipment) {
            this._gridEquipmentVault && this._gridEquipmentVault.removeFromParent();
            var numMaxItem = mc.const.MAX_VAULT_SLOT + 5;
            var gridViewEquipment = this._gridEquipmentVault = new mc.SortedGridView(topPanel.clone())
                .setInfoText(mc.dictionary.getGUIString("lblTotal"), arrEquipment.length, 210)
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
                .setDataSource(numMaxItem, function (index) {
                    return self._createItemWidgetByIndex(index, self._arrEquipInVault, self._mapPickItemsViewToBagById, self._mapItemViewInVaultById);
                });
            gridViewEquipment.setName("vault");
            root.addChild(gridViewEquipment);
        }.bind(this);

        _populateEquipment(arrEquipments);

        this._btnToBag.registerTouchEvent(function () {
            var arrItemIds = [];
            for (var itemId in self._mapPickItemsViewToBagById) {
                if (self._mapPickItemsViewToBagById[itemId]) {
                    arrItemIds.push(parseInt(itemId));
                }
            }
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.doItemsWithVaults(arrItemIds, false, function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
            });
            self._mapPickItemsViewToBagById = {};
            self._updateResult();
        });
        self._updateResult();
        self._updateGridText();
    },

    _updateResult: function () {
        var isFoundInBag = false;
        for (var id in this._mapPickItemsViewToVaultById) {
            if (this._mapPickItemsViewToVaultById[id]) {
                isFoundInBag = true;
                break;
            }
        }

        var isFoundInVault = false;
        for (var id in this._mapPickItemsViewToBagById) {
            if (this._mapPickItemsViewToBagById[id]) {
                isFoundInVault = true;
                break;
            }
        }

        this._btnToVault.setEnabled(isFoundInBag);
        this._btnToVault.setColor(isFoundInBag ? cc.color.WHITE : mc.color.BLACK_DISABLE_SOFT);

        this._btnToBag.setEnabled(isFoundInVault);
        this._btnToBag.setColor(isFoundInVault ? cc.color.WHITE : mc.color.BLACK_DISABLE_SOFT);
    }

});