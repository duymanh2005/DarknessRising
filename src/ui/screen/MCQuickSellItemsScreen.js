/**
 * Created by long.nguyen on 6/26/2018.
 */
mc.QuickSellItemsScreen = mc.Screen.extend({
    _mapItemViewById: null,
    _mapPickItemsViewById: null,

    initResources: function () {
        this._super();

        bb.sound.preloadEffect(res.sound_ui_button_exchange_item);

        this._mapItemViewById = {};
        this._mapPickItemsViewById = {};
        var node = this._screen = mc.loadGUI(res.screen_exchange_stones_json);
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var brk = rootMap["brk"];
        var imgTitle = rootMap["imgTitle"];
        var bottomPanel = rootMap["bottomPanel"];
        var topPanel = this.topPanel = rootMap["topPanel"];
        var btnExchange = this._btnExchange = rootMap["btnExchange"];
        var btnBack = rootMap["btnBack"];
        var slotMoney = rootMap["slotMoney"];
        var slotBless = rootMap["slotBless"];
        imgTitle.setVisible(false);

        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, null, btnBack);

        var bottomMap = bb.utility.arrayToMap(bottomPanel.getChildren(), function (child) {
            return child.getName();
        });

        var nodeItem = this._nodeItem = bottomMap["nodeItem"];
        var lblResult = bottomMap["lblResult"];

        if(mc.enableReplaceFontBM())
        {
            lblResult = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblResult);
        }
        lblResult.setColor(mc.color.BROWN_SOFT);
        lblResult.setString(mc.dictionary.getGUIString("lblResult"));
        // imgTitle._maxLblWidth = imgTitle.width - 100;
        // var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblExchangeItems"), res.font_UTMBienvenue_stroke_32_export_fnt);
        // lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var self = this;

        var selectFunc = function (widget) {
            var itemInfo = widget.getUserData();
            if (mc.ItemStock.getHeroIdEquipping(itemInfo)) {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtItemIsUsing"));
            }
            else {
                widget.setPick(!widget.isBlack);
                self._mapPickItemsViewById[mc.ItemStock.getItemId(itemInfo)] = widget.isBlack ? widget : null;
                self._updateResult();
            }
        };


        var tabWeaponActive = this._tabWeaponActive = new ccui.ImageView("button/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
        var tabWeaponNormal = this._tabWeaponInActive = new ccui.ImageView("button/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
        var tabItemActive = this._tabItemActive = tabWeaponActive.clone();
        var tabItemNormal = this._tabItemInActive = tabWeaponNormal.clone();
        var tabMaterialActive = this._tabMaterialActive = tabWeaponActive.clone();
        var tabMaterialNormal = this._tabMaterialInActive = tabWeaponNormal.clone();
        this.topPanel.height -= 70;
        this.topPanel.y -= 89;

        var addIcon = function (widget, url) {
            var imageView = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
            widget.addChild(imageView);
            imageView.setPosition(widget.width / 2, widget.height * 0.4);
        };

        addIcon(tabWeaponActive, "icon/ico_weapon.png");
        addIcon(tabWeaponNormal, "icon/ico_weapon.png");
        addIcon(tabItemActive, "icon/ico_items.png");
        addIcon(tabItemNormal, "icon/ico_items.png");
        addIcon(tabMaterialActive, "icon/ico_other.png");
        addIcon(tabMaterialNormal, "icon/ico_other.png");

        tabWeaponActive.x = root.width * 0.2;
        tabWeaponActive.y = root.height * 0.86;
        tabWeaponNormal.x = root.width * 0.2;
        tabWeaponNormal.y = root.height * 0.86;
        tabItemActive.x = root.width * 0.5;
        tabItemActive.y = root.height * 0.86;
        tabItemNormal.x = root.width * 0.5;
        tabItemNormal.y = root.height * 0.86;
        tabMaterialActive.x = root.width * 0.8;
        tabMaterialActive.y = root.height * 0.86;
        tabMaterialNormal.x = root.width * 0.8;
        tabMaterialNormal.y = root.height * 0.86;

        root.addChild(tabWeaponNormal);
        root.addChild(tabWeaponActive);
        root.addChild(tabItemActive);
        root.addChild(tabItemNormal);
        root.addChild(tabMaterialActive);
        root.addChild(tabMaterialNormal);

        var notifySystem = mc.GameData.notifySystem;
        var lvUpNotification = notifySystem.getEquipmentLevelUpNotification();

        var _createItemWidget = function (itemInfo) {
            var widget = new mc.ItemView(itemInfo);
            widget.scale = 0.9;
            if (mc.ItemStock.getHeroIdEquipping(itemInfo)) {
                widget.setStatusText("Equip");
            }
            widget.registerTouchEvent(selectFunc);
            widget.registerTouchEvent(selectFunc.bind(this), function (widget) {
                mc.createItemPopupDialog(widget.getUserData()).registerClearButton().registerShowHeroEquip().show();
            });
            self._mapItemViewById[mc.ItemStock.getItemId(itemInfo)] = widget;
            return widget;
        }.bind(this);

        var emptyWidget = this._emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        emptyWidget.setVisible(false);
        this.addChild(emptyWidget);
        var _createItemWidgetByIndex = function (index, arrItem) {
            var widget = null;
            if (index < arrItem.length) {
                var itemInfo = arrItem[index];
                widget = _createItemWidget(itemInfo);
            }
            else {
                widget = this._emptyWidget.clone();
                widget.setVisible(true);
                widget.scale = 0.9;
            }
            return widget;
        }.bind(this);


        var _isTab1 = function (item) {
            return mc.ItemStock.isItemEquipment(item);
        };
        var _isTab2 = function (item) {
            var itemType = mc.ItemStock.getItemType(item);
            if (itemType === mc.const.ITEM_TYPE_POTION ||
                itemType === mc.const.ITEM_TYPE_PACK ||
                itemType === mc.const.ITEM_TYPE_HERO_TICKET ||
                itemType === mc.const.ITEM_TYPE_TICKET) {
                return true;
            }
            return false;
        };

        var itemStock = mc.GameData.itemStock;
        var arrItem = itemStock.getItemList();
        var arrItemListByTab = [[], [], []];
        for (var i = 0; i < arrItem.length; i++) {
            var item = arrItem[i];
            if (_isTab1(item)) {
                arrItemListByTab[0].push(item);
            }
            else {
                if (_isTab2(item)) {
                    arrItemListByTab[1].push(item);
                }
                else {
                    arrItemListByTab[2].push(item);
                }
            }
        }

        var minView = 30;
        var dyMove = 40;
        var _populateEquipment = function (arrEquipment) {
            this._gridEquipmentInventory && this._gridEquipmentInventory.removeFromParent();
            var numMaxItem = Math.max(minView, (Math.round(arrEquipment.length / 5) + 1) * 5);
            var gridViewEquipment = this._gridEquipmentInventory = new mc.SortedGridView(this.topPanel.clone())
                .setInfoText("No. ", arrEquipment.length)
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
                    return val;
                })
                .setDataSource(numMaxItem, function (index) {
                    return _createItemWidgetByIndex(index, arrEquipment);
                });
            gridViewEquipment.setName(TAB_WEAPON);;
            root.addChild(gridViewEquipment);
            gridViewEquipment.y += dyMove;
        }.bind(this);

        var _populatePotion = function (arrConsumable) {
            this._gridConsumable && this._gridConsumable.removeFromParent();
            var arrConsumable = mc.ItemStock.splitForArrayQuantity(arrConsumable);
            arrConsumable.sort(function (a, b) {
                if (mc.ItemStock.getItemIndex(a) === mc.ItemStock.getItemIndex(b)) {
                    return mc.ItemStock.getItemQuantity(b) - mc.ItemStock.getItemQuantity(a);
                }
                return mc.ItemStock.getItemIndex(b) - mc.ItemStock.getItemIndex(a);
            });
            var numMaxItem = Math.max(minView, (Math.round(arrConsumable.length / 5) + 1) * 5);
            var gridViewConsumable = this._gridConsumable = new mc.SortedGridView(this.topPanel.clone())
                .setInfoText("No. ", arrConsumable.length)
                .setDataSource(numMaxItem, function (index) {
                    return _createItemWidgetByIndex(index, arrConsumable);
                });
            root.addChild(gridViewConsumable);
            gridViewConsumable.setName(TAB_ITEM);
            gridViewConsumable.y += dyMove;
        }.bind(this);

        var _populateMaterial = function (arrMaterial) {
            this._gridMaterial && this._gridMaterial.removeFromParent();
            var arrMaterial = mc.ItemStock.splitForArrayQuantity(arrMaterial);
            arrMaterial.sort(function (a, b) {
                if (mc.ItemStock.getItemIndex(a) === mc.ItemStock.getItemIndex(b)) {
                    return mc.ItemStock.getItemQuantity(b) - mc.ItemStock.getItemQuantity(a);
                }
                return mc.ItemStock.getItemIndex(b) - mc.ItemStock.getItemIndex(a);
            });
            var numMaxItem = Math.max(minView, (Math.round(arrMaterial.length / 5) + 1) * 5);
            var gridViewMaterial = this._gridMaterial = new mc.SortedGridView(this.topPanel.clone())
                .setInfoText("No. ", arrMaterial.length)
                .setDataSource(numMaxItem, function (index) {
                    return _createItemWidgetByIndex(index, arrMaterial);
                });
            root.addChild(gridViewMaterial);
            gridViewMaterial.setName(TAB_MATERIAL);
            gridViewMaterial.y += dyMove;
        }.bind(this);

        var TAB_WEAPON = "weapon";
        var TAB_ITEM = "item";
        var TAB_MATERIAL = "material";

        _populateEquipment(arrItemListByTab[0]);
        _populatePotion(arrItemListByTab[1]);
        _populateMaterial(arrItemListByTab[2]);

        tabWeaponNormal.setName(TAB_WEAPON);
        tabItemNormal.setName(TAB_ITEM);
        tabMaterialNormal.setName(TAB_MATERIAL);
        tabWeaponActive.setName(TAB_WEAPON);
        tabItemActive.setName(TAB_ITEM);
        tabMaterialActive.setName(TAB_MATERIAL);
        var _selectTab = function (tabName) {
            tabWeaponActive.setVisible(false);
            tabWeaponNormal.setVisible(false);
            tabItemActive.setVisible(false);
            tabItemNormal.setVisible(false);
            tabMaterialActive.setVisible(false);
            tabMaterialNormal.setVisible(false);
            this._gridEquipmentInventory.setVisible(false);
            this._gridConsumable.setVisible(false);
            this._gridMaterial.setVisible(false);
            if (tabName === TAB_WEAPON) {
                tabWeaponActive.setVisible(true);
                tabItemNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                this._gridEquipmentInventory.setVisible(true);
            }
            else if (tabName === TAB_ITEM) {
                tabItemActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabMaterialNormal.setVisible(true);
                this._gridConsumable.setVisible(true);
            }
            else if (tabName === TAB_MATERIAL) {
                tabMaterialActive.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabItemNormal.setVisible(true);
                this._gridMaterial.setVisible(true);
            }
        }.bind(this);

        var _getSelectedTab = function () {
            var arrTab = [tabWeaponActive, tabItemActive, tabMaterialActive];
            for (var i = 0; i < arrTab.length; i++) {
                if (arrTab[i].isVisible()) {
                    return arrTab[i];
                }
            }
            return null;
        }.bind(this);

        tabWeaponActive._touchScale = 0.0005;
        tabItemActive._touchScale = 0.0005;
        tabWeaponActive._touchScale = 0.0005;

        tabItemNormal.registerTouchEvent(function () {
            _selectTab(tabItemNormal.getName());
        });

        tabWeaponNormal.registerTouchEvent(function () {
            _selectTab(tabWeaponNormal.getName());
        });

        tabMaterialNormal.registerTouchEvent(function () {
            _selectTab(tabMaterialNormal.getName());
        });
        _selectTab(tabWeaponNormal.getName());

        btnExchange.setGray(true);
        btnExchange.setString(mc.dictionary.getGUIString("lblExchange"));
        btnExchange.registerTouchEvent(function () {
            var mapQuantityByItemId = {};
            for (var itemId in self._mapPickItemsViewById) {
                if (self._mapPickItemsViewById[itemId]) {
                    var strs = itemId.split('_');
                    var trueId = strs[0];
                    var q = parseInt(strs[2] || 1);
                    if (!mapQuantityByItemId[trueId]) {
                        mapQuantityByItemId[trueId] = 0;
                    }
                    mapQuantityByItemId[trueId] += q;
                }
            }
            var arrItems = [];
            for (var i in mapQuantityByItemId) {
                var itemInfo = mc.GameData.itemStock.getItemById(i);
                arrItems.push(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo), mapQuantityByItemId[i], i));
            }
            new mc.MCItemsListDialogWithConfirm(arrItems, mc.dictionary.getGUIString("lblExchangeItems"), mc.dictionary.getGUIString("txtExchangeItems"), mc.dictionary.getGUIString("lblOk"), function (ok) {
                if (ok) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    bb.sound.playEffect(res.sound_ui_button_exchange_item);
                    mc.protocol.exchangeItems(arrItems, function (rs) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (rs) {
                            self._mapPickItemsViewById = {};
                            self._updateResult();
                        }
                    });
                }
            }).show();

        });
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        var currDisarmItemId = mc.GameData.guiState.getCurrentDisarmItemId();
        if( currDisarmItemId ){
            var widget = this._mapItemViewById[currDisarmItemId];
            if( widget ){
                widget.setPick(true);
                self._mapPickItemsViewById[currDisarmItemId] = widget;
                var gridView = this._findGridViewContainsItemView(widget);
                if( gridView ){
                    _selectTab(gridView.getName());
                    gridView.scrollToItem(widget,0.01);
                }
            }
            mc.GameData.guiState.setCurrentDisarmItemId(null);
        }
        self._updateResult();

        this.traceDataChange(itemStock, function (rs) {
            var arrNewComingItem = mc.GameData.itemStock.popArrayNewComingItem();
            if (arrNewComingItem) {
                mc.view_utility.showNewComingItem(arrNewComingItem);
            }
            if (rs) {
                var arrUpdateItem = rs.param;
                if (arrUpdateItem) {
                    var updateTab1 = false;
                    var updateTab2 = false;
                    var updateTab3 = false;
                    for (var i = 0; i < arrUpdateItem.length; i++) {
                        var updateItemInfo = arrUpdateItem[i];
                        if (_isTab1(updateItemInfo)) {
                            updateTab1 = true;
                        }
                        else if (_isTab2(updateItemInfo)) {
                            updateTab2 = true;
                        }
                        else {
                            updateTab3 = true;
                        }
                    }
                    if (updateTab1) {
                        var percentY = this._gridEquipmentInventory.getCurrentPercentY();
                        _populateEquipment(mc.GameData.itemStock.getItemList(function (itemInfo) {
                            return _isTab1(itemInfo);
                        }));
                        this._gridEquipmentInventory.restorePercentY(percentY);
                    }
                    if (updateTab2) {
                        var percentY = this._gridConsumable.getCurrentPercentY();
                        _populatePotion(mc.GameData.itemStock.getItemList(function (itemInfo) {
                            return _isTab2(itemInfo);
                        }));
                        this._gridConsumable.restorePercentY(percentY);
                    }
                    if (updateTab3) {
                        var percentY = this._gridMaterial.getCurrentPercentY();
                        _populateMaterial(mc.GameData.itemStock.getItemList(function (itemInfo) {
                            return !_isTab1(itemInfo) && !_isTab2(itemInfo);
                        }));
                        this._gridMaterial.restorePercentY(percentY);
                    }
                }
                var selectedTab = _getSelectedTab();
                selectedTab && _selectTab(selectedTab.getName());
            }
        }.bind(this));
    },

    _findGridViewContainsItemView:function(widget){
        var foundGrid = null;
        var arrGrid = [this._gridEquipmentInventory,this._gridConsumable,this._gridMaterial];
        for(var g = 0; g < arrGrid.length; g++ ){
            var gridView = arrGrid[g];
            var arrView = gridView.getAllElementView();
            for(var v = 0; v < arrView.length; v++ ){
                if( arrView[v] === widget ){
                    foundGrid = gridView;
                    break;
                }
            }
        }
        return foundGrid;
    },

    _updateResult: function () {

        this._nodeItem.removeAllChildren();
        var mapCostInfoByIndex = {};
        for (var itemId in this._mapPickItemsViewById) {
            if (this._mapPickItemsViewById[itemId] && this._mapPickItemsViewById[itemId].isBlack) {
                var itemInfo = this._mapPickItemsViewById[itemId].getUserData();
                var quantity = mc.ItemStock.getItemQuantity(itemInfo);
                var arrCostInfo = mc.ItemStock.getItemRefundCost(itemInfo);
                for(var i = 0; i < arrCostInfo.length; i++ ){
                    var costIndex = mc.ItemStock.getItemIndex(arrCostInfo[i]);
                    if( !mapCostInfoByIndex[costIndex] ){
                        mapCostInfoByIndex[costIndex] = arrCostInfo[i];
                        mapCostInfoByIndex[costIndex].no = (arrCostInfo[i].no*quantity);
                    }
                    else{
                        mapCostInfoByIndex[costIndex].no += (arrCostInfo[i].no*quantity);
                    }
                }
                if( mc.ItemStock.isItemEquipment(itemInfo) ){
                    var arrCostInfoByLevelAndRank = mc.dictionary.getDisarmEquipRecipeByAttr(mc.ItemStock.getItemLevel(itemInfo),mc.ItemStock.getItemRank(itemInfo));
                    if( arrCostInfoByLevelAndRank ){
                        for(var i = 0; i < arrCostInfoByLevelAndRank.length; i++ ){
                            var costIndex = mc.ItemStock.getItemIndex(arrCostInfoByLevelAndRank[i]);
                            if( !mapCostInfoByIndex[costIndex] ){
                                mapCostInfoByIndex[costIndex] = arrCostInfoByLevelAndRank[i];
                                mapCostInfoByIndex[costIndex].no = arrCostInfoByLevelAndRank[i].no;
                            }
                            else{
                                mapCostInfoByIndex[costIndex].no += arrCostInfoByLevelAndRank[i].no;
                            }
                        }
                    }
                }
            }
        }

        var arrItemView = [];
        for(var itemIndex in mapCostInfoByIndex ){
            arrItemView.push(new mc.ItemView(mapCostInfoByIndex[itemIndex]).setNewScale(0.75).registerViewItemInfo());
        }

        if (arrItemView.length > 0) {
            var layoutItem = bb.layout.linear(arrItemView, 40, bb.layout.LINEAR_HORIZONTAL);
            var scrollWidth = 650;
            if( layoutItem.width > scrollWidth ){
                var scrollView = new ccui.ScrollView();
                scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
                scrollView.width = scrollWidth;
                scrollView.height = 120;
                scrollView.anchorX = scrollView.anchorY = 0.5;
                scrollView.setInnerContainerSize(cc.size(layoutItem.width,layoutItem.height));
                layoutItem.x = layoutItem.width*0.5;
                layoutItem.y = scrollView.height*0.5;
                scrollView.addChild(layoutItem);
                this._nodeItem.addChild(scrollView);
            }
            else{
                this._nodeItem.addChild(layoutItem);
            }
        }
        else {
            var lbl = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtUseItemToExchange"), res.font_UTMBienvenue_none_32_export_fnt);
            lbl.setColor(mc.color.BROWN_SOFT);
            this._nodeItem.addChild(lbl);
        }

        this._btnExchange.setGray(arrItemView.length === 0);
    }

});