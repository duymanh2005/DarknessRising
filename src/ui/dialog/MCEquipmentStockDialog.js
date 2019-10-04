/**
 * Created by long.nguyen on 8/9/2017.
 */
mc.EquipmentStockDialog = bb.Dialog.extend({
    _isAutoClose: true,

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);

        var contentView = this._contentView = new ccui.Layout();
        contentView.setTouchEnabled(true);
        contentView.anchorX = 0.5;
        contentView.anchorY = 1.0;
        contentView.x = cc.winSize.width * 0.5;
        contentView.width = cc.winSize.width - 20;
        contentView.height = mc.const.DEFAULT_HEIGHT - 300;
        this.addChild(contentView);
    },

    setFilterForHero: function (heroInfo, equipSlotId, selectItemFunc) {
        return this.setFilter(function (itemInfo) {
            return mc.ItemStock.isItemMatchSlot(itemInfo, equipSlotId) &&
                mc.ItemStock.isItemAvailableForHero(itemInfo, heroInfo) &&
                mc.ItemStock.getHeroIdEquipping(itemInfo) != mc.HeroStock.getHeroId(heroInfo);
        }, function (itemView) {
            var itemInfo = itemView.getUserData();
            if (mc.HeroStock.getHeroRank(heroInfo) < mc.ItemStock.getItemRequireHeroRank(itemInfo)) {
                this._isAutoClose = false;
                mc.view_utility.showSuggestText(cc.formatStr(mc.dictionary.getGUIString("txtItemRequireHeroRank"), mc.ItemStock.getItemRequireHeroRank(itemInfo)));
            }
            else {
                if (mc.ItemStock.getHeroIdEquipping(itemView.getUserData()) != null) {
                    this._isAutoClose = false;
                    new mc.ConfirmEquipmentDialog(itemView.getUserData(), mc.HeroStock.getHeroId(heroInfo), function () {
                        selectItemFunc(itemView);
                        this.close();
                    }.bind(this)).registerShowHeroEquip(true).show();
                }
                else {
                    this._isAutoClose = true;
                    selectItemFunc(itemView);
                }
            }
        }.bind(this));
    },

    setItemList: function (itemList, selectItemFunc) {
        this._itemList = itemList;
        return this.setFilter(null, selectItemFunc);
    },

    setTravelItemCb: function (func) {
        this._extraItemFuc = func;
        return this;
    },

    setFilter: function (filterFunc, selectItemFunc) {
        var contentView = this._contentView;
        var panelGrid = new ccui.Layout();
        panelGrid.anchorX = 0.5;
        panelGrid.anchorY = 0.5;
        panelGrid.x = contentView.width * 0.5;
        panelGrid.y = contentView.height * 0.5;
        panelGrid.width = contentView.width;
        panelGrid.height = contentView.height;

        var emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        var itemStock = mc.GameData.itemStock;
        var items = this._itemList || itemStock.getItemList(filterFunc);
        var minView = 30;
        var numMaxItem = Math.max(minView, (Math.round(items.length / 5) + 1) * 5);
        var gridView = this._gridView = new mc.SortedGridView(panelGrid);
        gridView.setInfoText("No. ", items.length + "/" + numMaxItem)
            .setSortingDataSource(["Power", "Rank"], function (widget, indexAttr) {
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
                            val = mc.ItemStock.getItemRank(itemInfo);
                            break;
                    }
                }
                return val;
            })
            .setDataSource(numMaxItem, function (index) {
                var widget = null;
                if (index < items.length) {
                    var itemInfo = items[index];
                    widget = new mc.ItemView(itemInfo);
                    widget.scale = 0.9;
                    widget.registerTouchEvent(function (widget) {
                        selectItemFunc && selectItemFunc(widget);
                        if (this._isAutoClose) {
                            this.close();
                        }
                    }.bind(this), function (widget) {
                        mc.createItemPopupDialog(widget.getUserData()).registerClearButton().registerShowHeroEquip().show();
                    });
                    if (this._extraItemFuc) {
                        this._extraItemFuc(widget, itemInfo);
                    }
                }
                else {
                    widget = emptyWidget.clone();
                    widget.scale = 0.9;
                }
                return widget;
            }.bind(this));

        contentView.addChild(gridView);
        return this;
    },

    _showTutorial: function () {
        var allItemView = this._gridView.getAllElementView();
        if (allItemView && allItemView.length > 0) {
            var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_ITEM_STOCK);
            if (tutorialTrigger) {
                if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_ITEM_WIDGET) {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(allItemView[0])
                        .setScaleHole(1.25)
                        .setCharPositionY(cc.winSize.height * 0.4)
                        .show();
                }
            }
        }
    },

    overrideShowAnimation: function () {
        this._contentView.y = 0;
        this._contentView.runAction(cc.sequence([cc.moveBy(0.3, 0, this._contentView.height), cc.callFunc(function () {
            this._showTutorial();
        }.bind(this))]));
        return 0.3;
    },

    overrideCloseAnimation: function () {
        this._contentView.runAction(cc.sequence([cc.moveBy(0.3, 0, -this._contentView.height), cc.callFunc(function () {

        })]));
        return 0.3;
    }

});