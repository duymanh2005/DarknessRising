/**
 * Created by long.nguyen on 5/14/2018.
 */

var TAB_WEAPON = "tab_1";
var TAB_ARMOR = "tab_2";
var TAB_ACCESSORY = "tab_3";
var TAB_OTHER = "tab_4";
mc.CraftItemScreen = mc.Screen.extend({
    _mapItemViewByIndex: null,
    _mapTabIdByItemIndex: null,
    _arrCraftMaterialInfo: null,
    _mapPickingEquipById: null,
    _prevFocusItemView: null,
    _materialPanelW: 0,
    _materialPanelH: 0,

    initResources: function () {
        this._super();
        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);
        this._mapItemViewByIndex = {};
        this._mapTabIdByItemIndex = {};
        this._mapPickingEquipById = {};
        var node = this._screen = mc.loadGUI(res.screen_craft_item_json);
        this.addChild(node);

        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var btnBack = rootMap["btnBack"];
        var nodeChar = this._nodeChar = rootMap["nodeChar"];
        var slotMoney = rootMap["slotMoney"];
        var slotBless = rootMap["slotBless"];
        var slotFriend = rootMap["slotFriend"];
        var nodeTab = rootMap["nodeTab"];
        var nodeBrkTop = rootMap["nodeBrkTop"];
        var nodeCraftUI = rootMap["nodeCraftUI"];
        var imgBrkMaterial = this._imgBrkMaterial = rootMap["imgBrkMaterial"];
        var btnCraft = this._btnCraft = rootMap["btnCraft"];
        var nodeAsset = this._nodeAsset = rootMap["nodeAsset"];
        var nodeItemCraft = this._nodeItemCraft = rootMap["nodeItemCraft"];
        var nodeItemMaterial = this._nodeItemMaterial = rootMap["scrollMaterial"];
        this._materialPanelW = nodeItemMaterial.width;
        this._materialPanelH = nodeItemMaterial.height;

        this._nodeItemCraft.setCascadeOpacityEnabled(true);
        this._nodeItemMaterial.setCascadeOpacityEnabled(true);

        var craftUI = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_craft_json, res.spine_ui_craft_atlas, 1.0);
        craftUI.setAnimation(0, "idle", true);
        craftUI.setEventListener(function (trackEntry, event) {
            var key = event.data.name;
            if (key === "ui_craft_effect") {
                var spineCraftEff = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_craft_effect_json, res.spine_ui_craft_effect_atlas, 1.0);
                spineCraftEff.setAnimation(0, "ui_craft_effect", false);
                spineCraftEff.setCompleteListener(function (trackEntry) {
                    spineCraftEff.runAction(cc.removeSelf());
                    var itemView = this._mapItemViewByIndex[this._currCraftIndex];
                    this._currCraftIndex = null;
                    this._selectCraftItemView(itemView);


                    this._nodeItemCraft.setVisible(true);
                    this._nodeItemMaterial.setVisible(true);
                    this._nodeItemCraft.opacity = 0;
                    this._nodeItemMaterial.opacity = 0;
                    this._nodeItemCraft.runAction(cc.fadeIn(0.2));
                    this._nodeItemMaterial.runAction(cc.fadeIn(0.2));
                    this.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function () {
                        this.enableInput(true);
                    }.bind(this))]));
                    var widget = this._nodeItemCraft.getChildByName("bigItem");
                    widget.setVisible(true);
                    var rankAppear = "rank" + widget.itemRank + "_appear";
                    var rankIdle = "rank" + widget.itemRank + "_idle";
                    var back = widget.spineBack;
                    var front = widget.spineFront;

                    bb.sound.playEffect(res.sound_ui_battle_chest_drop);
                    widget.runAction(cc.sequence(cc.spawn(cc.scaleTo(0.3, 1), cc.fadeIn(0.3)), cc.callFunc(function () {
                        front.setAnimation(0, rankAppear, false);
                    })));
                    var item = widget.itemView;
                    front.setEventListener(function (trackEntry, event) {
                        var key = event.data.name;
                        if (key === "item_appear") {
                            item.setVisible(true);
                            back.setAnimation(0, rankIdle, true);
                            back.setVisible(true);
                            var particle = new cc.ParticleSystem(res["particle_appear_rank" + widget.itemRank + "_plist"]);
                            particle.setPosition(widget.width / 2, widget.height / 2);
                            particle.runAction(cc.sequence([cc.delayTime(2.0), cc.removeSelf()]));
                            widget.addChild(particle, 10);
                            bb.sound.playEffect(widget.itemRank >= 3 ? res.sound_ui_battle_win_star2 : res.sound_ui_battle_win_star1);
                        }
                    }.bind(this));
                    front.setCompleteListener(function () {
                        front.setAnimation(0, rankIdle, true);
                        front.setCompleteListener(null);
                        mc.view_utility.showNewComingItem([item.getUserData()]);
                    }.bind(this));
                    front.setVisible(true);
                    widget.setScale(0.1);
                    widget.setOpacity(0);
                }.bind(this));
                nodeCraftUI.addChild(spineCraftEff);
            }
        }.bind(this));
        nodeCraftUI.addChild(craftUI);
        btnCraft.setString(mc.dictionary.getGUIString("lblCraft"));
        btnCraft.registerTouchEvent(function () {
            var materialInEquipping = bb.collection.findBy(self._arrCraftMaterialInfo, function (materialInfo) {
                return mc.ItemStock.getHeroIdEquipping(materialInfo) != null;
            });
            if (!materialInEquipping) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.craftItem(this._currCraftIndex, this._arrCraftMaterialInfo, function (data) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (data) {
                        this._mapPickingEquipById = {};
                        this.enableInput(false);
                        this._nodeItemCraft.setVisible(false);
                        this._nodeItemMaterial.setVisible(false);
                        craftUI.setAnimation(1, "craft", false);
                    }
                }.bind(this));
            }
            else {
                mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtDoNotCraftingIfEquipmentOwning"), function () {
                    var itemInfo = mc.GameData.itemStock.getItemById(mc.ItemStock.getItemId(materialInEquipping));
                    if (itemInfo) {
                        new mc.ItemInfoDialog(itemInfo).registerUnEquipping(mc.ItemStock.getHeroIdEquipping(itemInfo), function (unequipInfo) {
                            if (unequipInfo) {
                                self._refreshSelected();
                            }
                        }, true).show();
                    }
                });
            }
        }.bind(this));

        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, slotFriend, btnBack, mc.const.ITEM_INDEX_RELIC_COIN);

        var tabWeaponActive = new ccui.ImageView("button/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
        var tabWeaponNormal = new ccui.ImageView("button/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
        var tabArmorActive = tabWeaponActive.clone();
        var tabArmorNormal = tabWeaponNormal.clone();
        var tabOtherActive = tabWeaponActive.clone();
        var tabOtherNormal = tabWeaponNormal.clone();
        var tabAccessoryActive = tabWeaponActive.clone();
        var tabAccessoryNormal = tabWeaponNormal.clone();

        tabWeaponActive.setScale9Enabled(true);
        tabWeaponNormal.setScale9Enabled(true);
        tabArmorActive.setScale9Enabled(true);
        tabArmorNormal.setScale9Enabled(true);
        tabOtherActive.setScale9Enabled(true);
        tabOtherNormal.setScale9Enabled(true);
        tabAccessoryActive.setScale9Enabled(true);
        tabAccessoryNormal.setScale9Enabled(true);

        tabWeaponActive.width = tabWeaponNormal.width = tabArmorActive.width = tabArmorNormal.width =
            tabOtherActive.width = tabOtherNormal.width = tabAccessoryActive.width = tabAccessoryNormal.width = 180;

        var addIcon = function (widget, url) {
            var imageView = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
            widget.addChild(imageView);
            imageView.setPosition(widget.width / 2, widget.height * 0.4);
        };

        addIcon(tabWeaponActive, "icon/ico_weapon.png");
        addIcon(tabWeaponNormal, "icon/ico_weapon.png");
        addIcon(tabArmorActive, "icon/ico_armor.png");
        addIcon(tabArmorNormal, "icon/ico_armor.png");
        addIcon(tabAccessoryActive, "icon/ico_accessory.png");
        addIcon(tabAccessoryNormal, "icon/ico_accessory.png");
        addIcon(tabOtherActive, "icon/ico_other.png");
        addIcon(tabOtherNormal, "icon/ico_other.png");


        tabWeaponActive.scale = tabWeaponNormal.scale = tabArmorActive.scale = tabArmorNormal.scale =
            tabOtherActive.scale = tabOtherNormal.scale = tabAccessoryActive.scale = tabAccessoryNormal.scale = 0.85;

        tabWeaponActive.x = root.width * 0.15;
        tabWeaponActive.y = root.height * 0.532;
        tabWeaponNormal.x = root.width * 0.15;
        tabWeaponNormal.y = root.height * 0.532;
        tabArmorActive.x = root.width * 0.385;
        tabArmorActive.y = root.height * 0.532;
        tabArmorNormal.x = root.width * 0.385;
        tabArmorNormal.y = root.height * 0.532;
        tabAccessoryActive.x = root.width * 0.615;
        tabAccessoryActive.y = root.height * 0.532;
        tabAccessoryNormal.x = root.width * 0.615;
        tabAccessoryNormal.y = root.height * 0.532;
        tabOtherNormal.x = root.width * 0.85;
        tabOtherNormal.y = root.height * 0.532;
        tabOtherActive.x = root.width * 0.85;
        tabOtherActive.y = root.height * 0.532;

        root.addChild(tabWeaponNormal);
        root.addChild(tabWeaponActive);
        root.addChild(tabArmorActive);
        root.addChild(tabArmorNormal);
        root.addChild(tabAccessoryActive);
        root.addChild(tabAccessoryNormal);
        root.addChild(tabOtherActive);
        root.addChild(tabOtherNormal);

        var _getTabIdByEquipment = function (equipment) {
            var tabId = null;
            var slots = mc.ItemStock.getItemEquipSlots(equipment);
            for (var i = 0; i < slots.length; i++) {
                var slotId = "" + slots[i];
                if (slotId === mc.const.SLOT_TYPE_AMOR) {
                    tabId = TAB_ARMOR;
                }
                else if (slotId === mc.const.SLOT_TYPE_CHARM ||
                    slotId === mc.const.SLOT_TYPE_RING) {
                    tabId = TAB_ACCESSORY;
                }
                else if (slotId === mc.const.SLOT_TYPE_WEAPON ||
                    slotId === mc.const.SLOT_TYPE_WEAPONSHIELD) {
                    tabId = TAB_WEAPON;
                }
            }
            return tabId;
        };

        //filter all equipment
        var arrWeapon = [];
        var arrArmor = [];
        var arrAccessory = [];
        var arrOther = [];
        var mapArrEquipmentByTabId = {};
        mapArrEquipmentByTabId[TAB_WEAPON] = arrWeapon;
        mapArrEquipmentByTabId[TAB_ARMOR] = arrArmor;
        mapArrEquipmentByTabId[TAB_ACCESSORY] = arrAccessory;
        mapArrEquipmentByTabId[TAB_OTHER] = arrOther;
        var mapArrTabViewByTabId = {};
        mapArrTabViewByTabId[TAB_WEAPON] = [tabWeaponNormal, tabWeaponActive];
        mapArrTabViewByTabId[TAB_ARMOR] = [tabArmorNormal, tabArmorActive];
        mapArrTabViewByTabId[TAB_ACCESSORY] = [tabAccessoryNormal, tabAccessoryActive];
        mapArrTabViewByTabId[TAB_OTHER] = [tabOtherNormal, tabOtherActive];
        for (var equipIndex in mc.dictionary.equipmentMapByIndex) {
            var equipment = mc.dictionary.equipmentMapByIndex[equipIndex];
            var tabId = _getTabIdByEquipment(equipment);
            if (tabId && mc.ItemStock.getCraftingRecipe(equipment)) {
                this._mapTabIdByItemIndex[equipIndex] = tabId;
                mapArrEquipmentByTabId[tabId].push(equipment);
            }
        }
        for (var itemIndex in mc.dictionary.consumableMapByIndex) {
            var consumable = mc.dictionary.consumableMapByIndex[itemIndex];
            if (mc.ItemStock.getCraftingRecipe(consumable)) {
                this._mapTabIdByItemIndex[itemIndex] = TAB_OTHER;
                arrOther.push(consumable);
            }
        }

        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
        var brk = new ccui.ImageView("patch9/Grid_Panel.png", ccui.Widget.PLIST_TEXTURE);
        brk.anchorY = 0;
        brk.x = cc.winSize.width * 0.5;
        brk.setScale9Enabled(true);
        brk.width = cc.winSize.width;
        brk.height = 690;
        root.addChild(brk);

        var mapArrClassGroupBySpecificClassName = {
            "knight": [100, 150],
            "wizard": [200],
            "elf": [300, 350],
            "fighter": [400, 450],
            "gladiator": [500, 550],
            "summoner": [600],
            "lancer": [700]
        };

        var popUpDialog = null;
        var _viewItemInfo = function (itemView) {
            _closePopupDialog();
            popUpDialog = mc.createItemPopupDialog(itemView.getUserData());
            popUpDialog.show();
        };

        var _closePopupDialog = function () {
            popUpDialog && popUpDialog.close();
            popUpDialog = null;
        };

        var _createEquipmentWidget = function (itemDict, tabName) {
            if (itemDict) {
                var itemView = new mc.ItemView(itemDict);
                itemView.scale = 0.9;
                itemView._tabId = tabName;
                this._mapItemViewByIndex[mc.ItemStock.getItemIndex(itemDict)] = itemView;
                if (!(mc.ItemStock.getCraftingRecipe(itemDict) || mc.ItemStock.getCraftingEventRecipe(itemDict))) {
                    itemView.setBlack(true);
                    var sprLock = new cc.Sprite("#icon/ico_lock.png");
                    sprLock.x = itemView.width * 0.5;
                    sprLock.y = itemView.height * 0.5;
                    sprLock.scale = 0.25;
                    itemView.addChild(sprLock);
                }
                itemView.registerTouchEvent(this._selectCraftItemView.bind(this), _viewItemInfo, false, _closePopupDialog);
                return itemView;
            }
            var emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
            emptyWidget.scale = 0.9;
            return emptyWidget;
        }.bind(this);

        var prevScroll = null;
        var _loadEquipment = function (arrEquipDict, name) {
            var scroll = root.getChildByName(name);
            if (!scroll) {
                arrEquipDict.sort(function (equipInfo2, equipInfo1) {
                    var comp = mc.ItemStock.getItemRank(equipInfo2) - mc.ItemStock.getItemRank(equipInfo1);
                    if (!comp) {
                        return mc.ItemStock.getItemIndex(equipInfo2) - mc.ItemStock.getItemIndex(equipInfo1);
                    }
                    return comp;
                });

                var sampleView = new ccui.Layout();
                sampleView.anchorX = 0.5;
                sampleView.x = brk.x;
                sampleView.y = brk.y;
                sampleView.width = 730;
                sampleView.height = 700;
                var minView = 20;

                var arrFighterClassName = cc.copyArray(mc.dictionary.getGUIString("arrLblFighterClassName"));
                cc.arrayAppendObjectsToIndex(arrFighterClassName, mc.dictionary.getGUIString("lblAll"), 0);
                var numMaxItem = Math.max(minView, (Math.floor(arrEquipDict.length / 5) + (arrEquipDict.length % 5 == 0 ? 0 : 1)) * 5);
                scroll = new mc.SortedGridView(sampleView)
                    .setInfoText("No. ", arrEquipDict.length)
                    .setPaddingHeight(1);
                if (arrEquipDict === arrWeapon ||
                    arrEquipDict === arrArmor) {
                    scroll.setFilteringDataSource(arrFighterClassName, function (widget, indexAttr) {
                        var itemInfo = widget.getUserData();
                        if (itemInfo) {
                            var specificName = arrFighterClassName[indexAttr].toLowerCase();
                            var arrClassGroup = mapArrClassGroupBySpecificClassName[specificName];
                            var val = indexAttr === 0 ? 1 : -1;
                            if (arrClassGroup) {
                                for (var c = 0; c < arrClassGroup.length; c++) {
                                    if (mc.ItemStock.isItemAvailableForHero(itemInfo, {classGroup: arrClassGroup[c]})) {
                                        val = 1;
                                        break;
                                    }
                                }
                            }
                            return val;
                        }
                        return 0;
                    }, 20)
                }
                scroll.setDataSource(numMaxItem, function (index) {
                    return _createEquipmentWidget(arrEquipDict[index], name);
                });
                scroll.getBackgroundView().setVisible(false);
                scroll.anchorY = 0;
                scroll.setName(name);
                root.addChild(scroll);

                _updateNotificationCrafting();
            }
            return scroll;
        }.bind(this);

        this._selectTab = function (tabId, showEquipIndex) {
            tabWeaponActive.setVisible(false);
            tabWeaponNormal.setVisible(false);
            tabArmorActive.setVisible(false);
            tabArmorNormal.setVisible(false);
            tabOtherActive.setVisible(false);
            tabOtherNormal.setVisible(false);
            tabAccessoryActive.setVisible(false);
            tabAccessoryNormal.setVisible(false);
            if (prevScroll) {
                prevScroll.setVisible(false);
            }
            if (tabId === TAB_WEAPON) {
                var scrollWeapon = prevScroll = _loadEquipment(arrWeapon, TAB_WEAPON);
                scrollWeapon.setVisible(true);
                tabWeaponActive.setVisible(true);
                tabOtherNormal.setVisible(true);
                tabArmorNormal.setVisible(true);
                tabAccessoryNormal.setVisible(true);
            }
            else if (tabId === TAB_ARMOR) {
                var scrollArmor = prevScroll = _loadEquipment(arrArmor, TAB_ARMOR);
                scrollArmor.setVisible(true);
                tabArmorActive.setVisible(true);
                tabOtherNormal.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabAccessoryNormal.setVisible(true);
            }
            else if (tabId === TAB_ACCESSORY) {
                var scrollAccessory = prevScroll = _loadEquipment(arrAccessory, TAB_ACCESSORY);
                scrollAccessory.setVisible(true);
                tabAccessoryActive.setVisible(true);
                tabArmorNormal.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabOtherNormal.setVisible(true);
            }
            else if (tabId === TAB_OTHER) {
                var scrollOther = prevScroll = _loadEquipment(arrOther, TAB_OTHER);
                scrollOther.setVisible(true);
                tabOtherActive.setVisible(true);
                tabArmorNormal.setVisible(true);
                tabWeaponNormal.setVisible(true);
                tabAccessoryNormal.setVisible(true);
            }
            if (prevScroll) {
                var childs = prevScroll.getAllElementView();
                var showChild = null;
                if (showEquipIndex) {
                    showChild = bb.collection.findBy(childs, function (child, showEquipIndex) {
                        return mc.ItemStock.getItemIndex(child.getUserData()) === showEquipIndex;
                    }, showEquipIndex);
                }
                if (!showChild) {
                    showChild = bb.collection.findBy(childs, function (child) {
                        return child.getUserData() != null;
                    });
                }
                if (showChild) {
                    this._selectCraftItemView(showChild);
                    if (showChild.getUserData()) {
                        var tabId = self._mapTabIdByItemIndex[mc.ItemStock.getItemIndex(showChild.getUserData())];
                        if (tabId) {
                            var scrollView = this._root.getChildByName(tabId);
                            scrollView && scrollView.scrollToItem(showChild, 0.2);
                        }
                    }
                }
            }
        }.bind(this);

        tabWeaponNormal.registerTouchEvent(function () {
            this._selectTab(TAB_WEAPON);
        }.bind(this));
        tabArmorNormal.registerTouchEvent(function () {
            this._selectTab(TAB_ARMOR);
        }.bind(this));
        tabAccessoryNormal.registerTouchEvent(function () {
            this._selectTab(TAB_ACCESSORY);
        }.bind(this));
        tabOtherNormal.registerTouchEvent(function () {
            this._selectTab(TAB_OTHER);
        }.bind(this));

        var self = this;
        var notifySystem = mc.GameData.notifySystem;
        var _updateNotificationCrafting = function () {
            // reset the notify!
            for (var tabId in mapArrTabViewByTabId) {
                var arrTabView = mapArrTabViewByTabId[tabId];
                for (var t = 0; t < arrTabView.length; t++) {
                    mc.view_utility.setNotifyIconForWidget(arrTabView[t], false);
                }
                for (var equipCraftingIndex in self._mapItemViewByIndex) {
                    self._mapItemViewByIndex[equipCraftingIndex].setBlack(true);
                }
            }

            var craftingNotificationByIndex = mc.GameData.notifySystem.getItemCraftingNotification();
            if (craftingNotificationByIndex) {
                for (var itemIndex in craftingNotificationByIndex) {
                    var itemInfo = mc.dictionary.getItemByIndex(itemIndex);
                    if (itemInfo) {
                        var tabId = mc.ItemStock.isItemEquipment(itemInfo) ? _getTabIdByEquipment(itemInfo) : TAB_OTHER;
                        if (tabId) {
                            var arrTabView = mapArrTabViewByTabId[tabId];
                            for (var t = 0; t < arrTabView.length; t++) {
                                mc.view_utility.setNotifyIconForWidget(arrTabView[t], true);
                            }
                        }
                        for (var equipCraftingIndex in self._mapItemViewByIndex) {
                            if (itemIndex === equipCraftingIndex) {
                                self._mapItemViewByIndex[equipCraftingIndex].setBlack(false);
                                break;
                            }
                        }
                    }

                }
            }
        };

        this.traceDataChange(notifySystem, function () {
            _updateNotificationCrafting();
        }.bind(this));

        var currCraftEquipIndex = mc.GameData.guiState.getCurrentCraftEquipIndex();
        if (currCraftEquipIndex) {
            this.selectCraftItemIndex(currCraftEquipIndex);
        }
        else {
            this._selectTab(TAB_WEAPON);
        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_CRAFT_ITEM);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnCraft)
                    .setCharPositionY(cc.winSize.height * 0.75)
                    .show();
            }
        }
    },


    onClose: function () {
        mc.GameData.guiState.setCurrentCraftEquipIndex(null);
    },

    selectCraftItemIndex: function (itemIndex) {
        this._selectTab(this._mapTabIdByItemIndex[itemIndex], itemIndex);
    },

    _registerSelectEquip: function (materialWidget, requiredLvl) {
        requiredLvl = requiredLvl || 1;
        var self = this;
        materialWidget.registerTouchEvent(function (materialWidget) {
            new mc.EquipmentStockDialog().setTravelItemCb(function (itemWidget, itemInfo) {
                var craftItemNotification = mc.GameData.notifySystem.getItemCraftingNotification();
                if (craftItemNotification) {
                    mc.view_utility.setNotifyIconForWidget(itemWidget, craftItemNotification[mc.ItemStock.getItemId(itemInfo)], 0.85, 0.1);
                }
                if (mc.ItemStock.getHeroIdEquipping(itemWidget.getUserData())) {
                    itemWidget.setStatusText("Equip");
                }
            }).setFilter(function (itemInfo) {
                return mc.ItemStock.isItemEquipment(itemInfo) &&
                    mc.ItemStock.getItemIndex(itemInfo) === mc.ItemStock.getItemIndex(materialWidget.getUserData()) &&
                    mc.ItemStock.getItemLevel(itemInfo) >= requiredLvl;
            }, function (itemView) {
                var pickId = mc.ItemStock.getItemId(itemView.getUserData());
                self._mapPickingEquipById = {};
                self._mapPickingEquipById[pickId] = pickId;
                self._refreshSelected();
            }.bind(this)).show();
        }, function (materialWidget) {
            var itemInfo = materialWidget.getUserData();
            var dialog = mc.createItemPopupDialog(itemInfo);
            var heroId = mc.ItemStock.getHeroIdEquipping(itemInfo);
            if (mc.ItemStock.getHeroIdEquipping(itemInfo)) {
                dialog.registerUnEquipping(heroId, function (unequipInfo) {
                    unequipInfo && self._refreshSelected();
                }, true);
            }
            dialog.show();
        });
    },

    _refreshSelected: function () {
        var self = this;
        var currCraftItemView = self._mapItemViewByIndex[self._currCraftIndex];
        self._currCraftIndex = null;
        self._selectCraftItemView(currCraftItemView);
    },

    _selectCraftItemView: function (itemView) {
        var self = this;
        this._prevFocusItemView && this._prevFocusItemView.setClickFocus(false);
        itemView && (itemView.setClickFocus(true));
        this._prevFocusItemView = itemView;

        var equipDict = itemView.getUserData();
        if (!equipDict || this._currCraftIndex != mc.ItemStock.getItemIndex(equipDict)) {
            this._nodeAsset.removeAllChildren();
            this._nodeItemCraft.removeAllChildren();
            this._nodeItemMaterial.removeAllChildren();
            this._arrCraftMaterialInfo = null;
            this._btnCraft.setVisible(false);
        }
        if (equipDict && this._currCraftIndex != mc.ItemStock.getItemIndex(equipDict)) {
            var lh = 0;
            var lw = 0;
            var itemScale = 1.0;
            this._currCraftIndex = mc.ItemStock.getItemIndex(equipDict);
            mc.GameData.guiState.setCurrentCraftEquipIndex(this._currCraftIndex);
            this._btnCraft.setVisible(true);
            this._arrCraftMaterialInfo = [];
            var recipe = mc.ItemStock.getCraftingRecipe(equipDict) || mc.ItemStock.getCraftingEventRecipe(equipDict);
            if (recipe) {
                var arrMaterial = mc.ItemStock.createArrJsonItemFromStr(recipe, function (materialInfo, strs) {
                    if (strs && strs.length > 2 && materialInfo) {
                        materialInfo.level = parseInt(strs[2]);
                    }
                });
                var isSatisfy = true;
                var arrMaterialView = [];
                for (var i = 0; i < arrMaterial.length; i++) {
                    if (mc.ItemStock.getItemType(arrMaterial[i]) === mc.const.ITEM_TYPE_CURRENCY) {
                        var assetView = mc.view_utility.createAssetView(arrMaterial[i]);
                        this._nodeAsset.addChild(assetView);
                        if (mc.ItemStock.getItemQuantity(arrMaterial[i]) > mc.GameData.playerInfo.getZen()) {
                            assetView.getChildByName("lbl").setColor(mc.color.RED);
                            isSatisfy = false;
                        }
                    }
                    else {
                        var materialRequired = arrMaterial[i];
                        var materialIndex = mc.ItemStock.getItemIndex(materialRequired);
                        var materialInStock = mc.GameData.itemStock.getOverlapItemByIndex(materialIndex);
                        var qInStock = mc.ItemStock.getItemQuantity(materialInStock);
                        var numInRequired = mc.ItemStock.getItemQuantity(materialRequired);
                        if (mc.ItemStock.isItemEquipment(materialRequired)) {
                            var numLvlRequired = mc.ItemStock.getItemLevel(materialRequired);
                            var arrItem = mc.GameData.itemStock.getArrayItemByIndex(materialIndex);
                            arrItem = bb.collection.filterBy(arrItem, function (itInfo, numLvlRequired) {
                                return mc.ItemStock.getItemLevel(itInfo) >= numLvlRequired;
                            }, numLvlRequired);
                            var countOk = 0;
                            if (arrItem && arrItem.length > 0) {
                                for (var c = countOk; countOk < numInRequired && c < arrItem.length; c++) {
                                    var pickItem = arrItem[c];
                                    if (this._mapPickingEquipById[mc.ItemStock.getItemId(pickItem)]) {
                                        this._arrCraftMaterialInfo.push(pickItem);
                                        var itemView = new mc.ItemView(pickItem);
                                        itemView.scale = itemScale;
                                        self._registerSelectEquip(itemView, numLvlRequired);
                                        var heroId = mc.ItemStock.getHeroIdEquipping(pickItem);
                                        if (heroId) {
                                            var heroAvtView = new mc.HeroAvatarView(mc.GameData.heroStock.getHeroById(heroId));
                                            heroAvtView.scale = 0.35;
                                            heroAvtView.setVisibleSurfaceInfo(false);
                                            heroAvtView.x = itemView.width * 0.8;
                                            heroAvtView.y = itemView.height * 0.2;
                                            itemView.addChild(heroAvtView);
                                        }
                                        arrMaterialView.push(itemView);
                                        countOk++;
                                    }
                                }

                                for (var c = countOk; countOk < numInRequired && c < arrItem.length; c++) {
                                    var materialInfo = mc.ItemStock.createJsonItemInfo(materialIndex);
                                    materialInfo.level = numLvlRequired;
                                    var itemView = new mc.ItemView(materialInfo);
                                    itemView.scale = itemScale;
                                    itemView.setBlack(true);
                                    self._registerSelectEquip(itemView, numLvlRequired);
                                    itemView.getLevelLabel().setColor(mc.color.GREEN);
                                    mc.view_utility.setNotifyIconForWidget(itemView, true, 0.85, 0.1);
                                    arrMaterialView.push(itemView);
                                    countOk++;
                                    isSatisfy = false;
                                }

                            } // arrItem.length > 0
                            else {
                                isSatisfy = false;
                            }
                            for (var c = countOk; c < numInRequired; c++) {
                                var materialInfo = mc.ItemStock.createJsonItemInfo(materialIndex);
                                materialInfo.level = numLvlRequired;
                                var itemView = new mc.ItemView(materialInfo);
                                itemView.scale = itemScale;
                                itemView.setBlack(true);
                                itemView.registerTouchEvent(function (materialWidget) {
                                    new mc.HowToGetDialog(materialWidget.getUserData()).show();
                                }, function (materialWidget) {
                                    mc.createItemPopupDialog(materialWidget.getUserData()).show();
                                });
                                itemView.getLevelLabel().setColor(mc.color.RED);
                                arrMaterialView.push(itemView);
                            }
                        }
                        else {
                            var numInStock = materialInStock ? qInStock : 0;
                            var itemView = new mc.ItemView(materialRequired);
                            itemView.getQuantityLabel().setVisible(false);
                            itemView.scale = itemScale;
                            var lblNumInStock = bb.framework.getGUIFactory().createText("" + bb.utility.formatNumber(numInStock));
                            if (numInStock >= numInRequired) {
                                lblNumInStock.setColor(mc.color.GREEN);
                                this._arrCraftMaterialInfo.push(mc.ItemStock.createJsonItemInfo(materialIndex, numInRequired, mc.ItemStock.getItemId(materialInStock)));
                                itemView.registerTouchEvent(function (materialWidget) {
                                    var itemInfo = materialWidget.getUserData();
                                    new mc.HowToGetDialog(materialWidget.getUserData()).show();
                                    //mc.createItemPopupDialog(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo), mc.ItemStock.getItemQuantity(itemInfo))).show();
                                }, function (materialWidget) {
                                    mc.createItemPopupDialog(materialWidget.getUserData()).show();
                                });
                            }
                            else {
                                lblNumInStock.setColor(mc.color.RED);
                                isSatisfy = false;
                                itemView.registerTouchEvent(function (materialWidget) {
                                    new mc.HowToGetDialog(materialWidget.getUserData()).show();
                                }, function (materialWidget) {
                                    mc.createItemPopupDialog(materialWidget.getUserData()).show();
                                });
                                itemView.setBlack(true);
                            }
                            lblNumInStock.setDecoratorLabel("/" + numInRequired, cc.color.WHITE);
                            lblNumInStock.x = itemView.width * 0.5;
                            if(mc.enableReplaceFontBM())
                            {
                                lblNumInStock.x -= lblNumInStock.width/2;
                            }
                            lblNumInStock.y = itemView.height * 0.15;
                            itemView.addChild(lblNumInStock);
                            arrMaterialView.push(itemView);
                        }

                    }
                }

                var layout = bb.layout.grid(arrMaterialView, 2, this._nodeItemMaterial.width + 80, -5);
                layout.anchorY = 1.0;
                layout.scale = 0.75;
                layout.x = this._nodeItemMaterial.width * 0.5;
                var trueH = layout.height * layout.scale;
                layout.y = this._nodeItemMaterial.height < trueH ? trueH : this._nodeItemMaterial.height;
                this._nodeItemMaterial.setInnerContainerSize(cc.size(layout.width, trueH));
                this._nodeItemMaterial.jumpToPercentVertical(100);
                this._nodeItemMaterial.addChild(layout);
            }
            else {
                var lbl = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtNoRecipe"));
                lw = lbl.width;
                lbl.setColor(mc.color.RED);
                this._nodeItemMaterial.addChild(lbl);
            }

            var optSkills = null;
            var itemLevel = 0;
            for (var i = 0; i < this._arrCraftMaterialInfo.length; i++) {
                var equipInfo = mc.GameData.itemStock.getItemById(mc.ItemStock.getItemId(this._arrCraftMaterialInfo[i]));
                if (equipInfo && mc.ItemStock.isItemEquipment(equipInfo)) {
                    optSkills = mc.ItemStock.getItemSkillOption(equipInfo);
                    itemLevel = mc.ItemStock.getItemLevel(equipInfo);
                }
            }
            this._btnCraft.setGray(!isSatisfy);
            var craftIndex = mc.ItemStock.getItemIndex(equipDict);
            var arrCraftItem = mc.GameData.itemStock.getArrayItemByIndex(craftIndex);
            var jsonItemInfo = mc.ItemStock.createJsonItemInfo(craftIndex, arrCraftItem ? arrCraftItem.length : 0);
            jsonItemInfo["level"] = this.getFinalLevel(itemLevel || 0, mc.ItemStock.getItemRank(jsonItemInfo) || 1);
            optSkills && (jsonItemInfo["optSkills"] = optSkills);
            var itemViewBig = new mc.ItemView(jsonItemInfo);
            itemViewBig.registerViewItemInfo();
            itemViewBig.getQuantityLabel().setVisible(false);

            var clone = itemViewBig;
            var widget = new ccui.Widget();
            widget.setContentSize(clone.width, clone.height);
            widget.addChild(clone, 2);
            var front = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_front_json, res.spine_ui_item_panel_front_atlas, 1.0);
            var back = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_back_json, res.spine_ui_item_panel_back_atlas, 1.0);
            widget.addChild(front, 3);
            widget.addChild(back, 1);
            widget.itemView = clone;
            widget.spineBack = back;
            widget.spineFront = front;
            widget.itemRank = mc.ItemStock.getItemRank(jsonItemInfo);
            front.setPosition(widget.width / 2, widget.height / 2);
            clone.setPosition(widget.width / 2, widget.height / 2);
            back.setPosition(widget.width / 2, widget.height / 2);
            front.setVisible(false);
            back.setVisible(false);
            clone.setVisible(true);
            widget.setName("bigItem");
            this._nodeItemCraft.addChild(widget);
        }
    },

    getFinalLevel: function (inputLevel, toRank) {
        var levelMap = mc.dictionary.mapRecipeByItemIndex["craftingWithLevels"];
        var craftInfo = levelMap[inputLevel];
        if (!craftInfo) {
            return 0;
        }
        var rank = "rank" + toRank;
        return parseInt(craftInfo[rank]);
    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_CRAFT_ITEM;
    }

});