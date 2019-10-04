/**
 * Created by long.nguyen on 5/10/2019.
 */
mc.SeenGUIManager = bb.Class.extend({

    onWillChangeItemInfo: function (itemInfo) {
        var newItems = mc.storage.readNewItems();
        if (itemInfo && mc.ItemStock.getItemType(itemInfo) != mc.const.ITEM_TYPE_CURRENCY) {
            if (itemInfo.no > 0) {
                var itemInStock = mc.GameData.itemStock.getItemById(mc.ItemStock.getItemId(itemInfo));
                if (itemInStock) {
                    var noChange = itemInfo.no - itemInStock.no;
                    if (mc.ItemStock.isItemSoul(itemInfo) && noChange > 0 && itemInfo.no >= 100) {
                        mc.storage.itemTabTouched["soul"] = false;
                        mc.storage.featureNotify.itemLayerShowed = false;
                        mc.storage.saveFeatureNotify();
                        mc.storage.saveItemTabTouched();
                    }
                } else {
                    newItems[itemInfo.id] = {};
                    if (mc.ItemStock.isItemEquipment(itemInfo)) {
                        mc.storage.itemTabTouched["equip"] = false;
                    } else if (mc.ItemStock.isItemPotion(itemInfo)) {
                        mc.storage.itemTabTouched["potion"] = false;
                        mc.storage.potionItemTabNotifyClear = false;
                    } else if (mc.ItemStock.isItemSoul(itemInfo)) {
                        mc.storage.itemTabTouched["soul"] = false;
                    } else {
                        mc.storage.itemTabTouched["other"] = false;
                        mc.storage.otherItemTabNotifyClear = false;
                    }
                    mc.storage.saveItemTabTouched();
                    mc.storage.saveNewItems();
                    mc.storage.featureNotify.itemLayerShowed = false;
                    mc.storage.saveFeatureNotify();
                }
            } else {
                if (newItems[itemInfo.id]) {
                    delete newItems[itemInfo.id];
                    var tab = null;
                    if (mc.ItemStock.isItemEquipment(itemInfo)) {
                        tab = "equip";
                    } else if (mc.ItemStock.isItemPotion(itemInfo)) {
                        tab = "potion";
                    } else if (mc.ItemStock.isItemSoul(itemInfo)) {
                        tab = "soul";
                    } else {
                        tab = "other";
                    }
                    mc.storage.saveNewItems();
                    if (mc.storage.itemTabTouched[tab]) {
                        for (var j in newItems) {
                            var tempTab = null;
                            if (mc.ItemStock.isItemEquipment(itemInfo)) {
                                tempTab = "equip";
                            } else if (mc.ItemStock.isItemPotion(itemInfo)) {
                                tempTab = "potion";
                                mc.storage.potionItemTabNotifyClear = false;
                            } else if (mc.ItemStock.isItemSoul(itemInfo)) {
                                tempTab = "soul";
                            } else {
                                tempTab = "other";
                                mc.storage.otherItemTabNotifyClear = false;
                            }
                            if (tempTab === tab) {
                                mc.storage.itemTabTouched[tab] = false;
                                mc.storage.saveItemTabTouched();
                                break;
                            }
                        }
                    }
                }
            }
        }
    },

    onDidChangeItemInfo: function (itemInfo) {
    }

});