mc.BaseItemDialog = bb.Dialog.extend({

    _translate: function (y, dy) {
        //for (var key in this._rootMap) {
        //    if (this._rootMap[key].y > y) {
        //        this._rootMap[key].y -= dy;
        //    }
        //}
        //return dy;
        return 0;
    },

    onTriggerTutorial: function () {
    },

    registerUnEquipping: function () {
        return this;
    },

    registerShowItemBag: function () {
        return this;
    },

    registerClearButton: function () {
        return this;
    },

    registerSummon: function () {
        return this;
    },

    setShowPosition: function (widget) {
        var pos = widget.getParent().convertToWorldSpace(cc.p(widget.x, widget.y));
        if (pos.x - this._root.width * 0.5 <= 0) {
            pos.x = 5 + this._root.width * 0.5;
        }
        if (pos.x + this._root.width * 0.5 >= cc.winSize.width) {
            pos.x = cc.winSize.width - this._root.width * 0.5 - 5;
        }
        this._root.x = pos.x;
        this._root.y = pos.y + 25;
        this._root.anchorY = 0;
        return this;
    },

    setBuyPackage: function (buyPackage, buyCallback) {
        if (buyPackage && buyCallback) {
            this._buyMode = true;
            // let buy if have a buy package.
            this._btnSell.setVisible(false);
            this._btnUpgrade.x = this._root.width * 0.5;
            this._btnUpgrade.setVisible(true);
            this._btnUpgrade.setString(mc.dictionary.getGUIString("lblBuy"));
            this._btnUpgrade.registerTouchEvent(function () {
                buyCallback(buyPackage, this);
            }.bind(this));
            this._nodeAsset.removeAllChildren();
            this._nodeAsset.setVisible(true);
            var priceItem = mc.ShopManager.getPriceItem(buyPackage);
            var assetBuy = mc.view_utility.createAssetView(priceItem);
            this._nodeAsset.addChild(assetBuy);
            var increaseH = this._translate(this._btnSell.y, -120);
            this._nodeAsset.x = this._root.width * 0.5;

            if (mc.GameData.playerInfo.isVIP()) {
                var shopId = mc.GameData.guiState.getCurrentShopCategoryId();
                if (shopId) {
                    var mapVIPFunctionShopById = {};
                    mapVIPFunctionShopById[mc.ShopManager.SHOP_COMMON] = mc.const.VIP_FUNCTION_SHOP_COMMON_DISCOUNT;
                    mapVIPFunctionShopById[mc.ShopManager.SHOP_RELIC] = mc.const.VIP_FUNCTION_SHOP_RELIC_DISCOUNT;
                    if (mapVIPFunctionShopById[shopId]) {
                        var valueDiscount = parseInt(mc.dictionary.getVipFunctionValue(mapVIPFunctionShopById[shopId]));
                        var lblPrice = assetBuy.getChildByName("lbl");

                        var line = new cc.DrawNode();
                        line.drawSegment(cc.p(-lblPrice.width * lblPrice.getScale() / 2, 0), cc.p(lblPrice.width * lblPrice.getScale() / 2, 0), 2, mc.color.RED_SOFT);
                        assetBuy.addChild(line);

                        var quantity = mc.ItemStock.getItemQuantity(priceItem);
                        var lblDiscount = bb.framework.getGUIFactory().createText("" + bb.utility.formatNumber(quantity + Math.round(quantity * valueDiscount / 100)));
                        lblDiscount.x = lblPrice.x;
                        assetBuy.addChild(lblDiscount);

                        lblDiscount.setName("lbl");
                        lblPrice.setName("lbl2");
                        lblPrice.y += 15;
                        line.x = lblPrice.x + 1;
                        line.y = lblPrice.y - 5;
                        lblDiscount.y += 10;
                    }
                }
            }

            var _updatePrice = function (priceItem) {
                if (mc.ItemStock.isNotEnoughCost(priceItem)) {
                    assetBuy.getChildByName("lbl").setColor(mc.color.RED);
                    this._btnUpgrade.loadTexture("button/Orange_Round.png", ccui.Widget.PLIST_TEXTURE);
                }
                else {
                    assetBuy.getChildByName("lbl").setColor(mc.color.WHITE_NORMAL);
                    this._btnUpgrade.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
                }
            }.bind(this);

            _updatePrice(priceItem);
            this.traceDataChange(mc.GameData.assetChanger, function () {
                _updatePrice(priceItem);
            });
        }
        return this;
    }

});

mc.ItemInfoDialog = mc.BaseItemDialog.extend({
    /**
     * Created by long.nguyen on 11/13/2017.
     */

    ctor: function (itemInfo) {
        this._super();
        this._itemInfo = itemInfo;
        var node = ccs.load(res.widget_item_popup_info, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        this.viewDatas = {};

        var self = this;

        var basicPanel = this.basicPanel = rootMap["basicInfo"];
        var panelBtn = this.panelBtn = rootMap["panelBtn"];
        this.stats = rootMap["stats"];
        this.stats.setVisible(false);
        var basicMap = bb.utility.arrayToMap(basicPanel.getChildren(), function (child) {
            return child.getName();
        });
        var btnMap = bb.utility.arrayToMap(panelBtn.getChildren(), function (child) {
            return child.getName();
        });

        var nodeItem = basicMap["nodeItem"];
        var lblName = basicMap["lblName"];
        var lblLevel = basicMap["lblLevel"];
        var lblRare = basicMap["lblRare"];
        var lblInBag = basicMap["lblBag"];
        this._sepe_3 = basicMap["sepe_1"];
        var btnSell = this._btnSell = btnMap["btnSell"];
        var btnUpgrade = this._btnUpgrade = btnMap["btnUpgrade"];
        var nodeAsset = this._nodeAsset = btnMap["nodeAsset"];

        cc.log("*************** item info");
        cc.log(itemInfo);

        btnSell.setString(mc.dictionary.getGUIString(mc.ItemStock.isItemEquipment(itemInfo) ? "lblDisarm" : "lblSell"));
        btnUpgrade.setString(mc.dictionary.getGUIString(itemInfo.slotIndex != 6 ? "lblUpgrade" : "Evolution"));
        var rankObj = mc.ItemView.getRankText(mc.ItemStock.getItemRank(itemInfo));

        lblRare.setString("");
        var rareText = "#ffffff_" + mc.dictionary.getGUIString("Rarity") + " : #" + rankObj.text;
        var lblRareComplex = rootMap["lblRareComplex"] = mc.GUIFactory.applyComplexString(lblRare, rareText, rankObj.color, res.font_cam_stroke_32_export_fnt);
        lblRareComplex.setScale(0.75);

        lblName.setColor(rankObj.color);

        var notifySystem = mc.GameData.notifySystem;
        var lvUpNotification = notifySystem.getEquipmentLevelUpNotification();
        if (lvUpNotification && mc.ItemStock.isItemEquipment(itemInfo)) {
            mc.view_utility.setNotifyIconForWidget(btnUpgrade, lvUpNotification[mc.ItemStock.getItemId(itemInfo)]);
        }

        if(itemInfo.slotIndex == 6){
            btnUpgrade.registerTouchEvent(function () {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtComingSoon"));
            });
        }else{
            btnUpgrade.registerTouchEvent(function () {
                mc.GameData.guiState.setCurrentRefineEquipId(mc.ItemStock.getItemId(itemInfo));
                mc.GUIFactory.showRefineItemScreen();
            });
        }


        btnSell.registerTouchEvent(function () {
            if (mc.ItemStock.isItemEquipment(itemInfo)) {
                mc.GameData.guiState.setCurrentDisarmItemId(mc.ItemStock.getItemId(itemInfo));
                mc.GUIFactory.showQuickSellItemsScreen();
            }
            else {
                self.close();
                new mc.SellingItemDialog(itemInfo).show();
            }
        }.bind(this));

        var itemView = new mc.ItemView(itemInfo);
        itemView.setNewScale(0.9);

        nodeItem.addChild(itemView);
        lblName.setMultiLineString(mc.ItemStock.getItemName(itemInfo), root.width * 0.9);

        var attrArray = this.attrArray = [];

        var numHP = mc.ItemStock.getItemHp(itemInfo);
        numHP && attrArray.push({lbl: mc.dictionary.getGUIString("lblHP"), num: bb.utility.formatNumber(numHP)});
        var numATK = mc.ItemStock.getItemAttack(itemInfo);
        numATK && attrArray.push({lbl: mc.dictionary.getGUIString("lblATK"), num: bb.utility.formatNumber(numATK)});
        var numMag = mc.ItemStock.getItemMagic(itemInfo);
        numMag && attrArray.push({lbl: mc.dictionary.getGUIString("lblMAG"), num: bb.utility.formatNumber(numMag)});
        var numSpd = mc.ItemStock.getItemSpeed(itemInfo);
        numSpd && attrArray.push({lbl: mc.dictionary.getGUIString("lblSPD"), num: bb.utility.formatNumber(numSpd)});
        var numDEF = mc.ItemStock.getItemDefense(itemInfo);
        numDEF && attrArray.push({lbl: mc.dictionary.getGUIString("lblDEF"), num: bb.utility.formatNumber(numDEF)});
        var numRES = mc.ItemStock.getItemResistant(itemInfo);
        numRES && attrArray.push({lbl: mc.dictionary.getGUIString("lblRES"), num: bb.utility.formatNumber(numRES)});

        this.viewDatas["attrArray"] = attrArray;

        this.viewDatas["optSkills"] = mc.ItemStock.getItemSkillOption(itemInfo);

        var strDesc = mc.ItemStock.getItemDesc(itemInfo) || mc.ItemStock.getItemTextCaution(itemInfo);
        if (!strDesc) {
            strDesc = "Unknown index" + mc.ItemStock.getItemIndex(itemInfo);
        }
        //item 6
        cc.log("************** hero item");
        cc.log(itemInfo);
        if(itemInfo.slotIndex == 6 || !itemInfo.id){
            strDesc = mc.dictionary.getSkillDescByEquipmentIndex(itemInfo.index);
        }

        this.viewDatas["strDesc"] = strDesc;
        var assetSell = mc.view_utility.createAssetView(mc.ItemStock.createJsonItemZen(mc.ItemStock.getItemRefundCost(itemInfo)));
        nodeAsset.addChild(assetSell);

        var heroLevel = mc.ItemStock.getItemLevel(itemInfo);
        var text = mc.dictionary.getGUIString("Level") + " " + heroLevel;
        lblLevel.setString(text);
        var overlapItemInfo = mc.GameData.itemStock.getOverlapItemByIndex(mc.ItemStock.getItemIndex(itemInfo));
        var numInStock = overlapItemInfo ? mc.ItemStock.getItemQuantity(overlapItemInfo) : 0;
        lblInBag.setString(mc.dictionary.getGUIString("lblInBag") + ": " + bb.utility.formatNumber(numInStock));

        if (!mc.ItemStock.getItemId(itemInfo)) {
            // only view item info if it have no id.
            nodeAsset.setVisible(false);
            btnSell.setVisible(false);
            btnUpgrade.setVisible(false);

            if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_BOX) {
                var arrItemInfo = itemInfo.value;
                if (arrItemInfo) {
                    var layoutItemView = bb.layout.grid(bb.collection.createArray(arrItemInfo.length, function (index) {
                        return new mc.ItemView(arrItemInfo[index]).setNewScale(0.5);
                    }), 3, 350);
                    root.addChild(layoutItemView);
                    layoutItemView.x = root.width * 0.6;
                    layoutItemView.y = btnUpgrade.y;
                }
            }
        }
        else {
            nodeAsset.setVisible(!mc.ItemStock.isItemEquipment(itemInfo));
            itemView.getQuantityLabel().setVisible(false);
            if (!mc.ItemStock.isItemEquipment(itemInfo)) {
                // only let sell if it's consumable.
                btnUpgrade.setVisible(false);
                btnSell.x = root.width * 0.5;
                nodeAsset.x = root.width * 0.5;
            }
            else {

                var heroId = mc.ItemStock.getHeroIdEquipping(itemInfo);
                if (heroId) {
                    // only let upgrade if it's equipping equipment.
                    btnUpgrade.x = root.width * 0.5;
                    btnSell.setVisible(false);
                    nodeAsset.setVisible(false);
                }

                if (mc.ItemStock.isItemMaxLevel(itemInfo)) {
                    btnUpgrade.setVisible(false);
                    if (btnSell.isVisible()) {
                        btnSell.x = root.width * 0.5;
                    }
                    if (nodeAsset.isVisible()) {
                        nodeAsset.x = root.width * 0.5;
                    }

                    this.viewDatas["lblMax"] = mc.dictionary.getGUIString("txtEquipmentMaxLv");
                }

            }

        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_ITEM_INFO);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                if (tutorialTrigger.param === "upgrade") {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(this._btnUpgrade)
                        .setCharPositionY(cc.winSize.height * 0.75)
                        .show();
                }
            }
        }
    },

    registerUnEquipping: function (heroId, unEquipCallback, onlyUnEquip) {
        this._nodeAsset.removeAllChildren();
        this._nodeAsset.setVisible(true);
        var numGold = mc.const.NUM_GOLD_UNEQUIP_ITEM_FOR_RANK[mc.ItemStock.getItemRank(this._itemInfo)];
        var assetBuy = mc.view_utility.createAssetView(mc.ItemStock.createJsonItemZen(numGold));
        this._nodeAsset.addChild(assetBuy);
        this._btnSell.setGray(numGold > mc.GameData.playerInfo.getZen());
        this._btnSell.setVisible(true);
        this._btnUpgrade.setVisible(true);
        this._btnSell.x = this._root.width * 0.3;
        this._btnUpgrade.x = this._root.width * 0.7;
        this._btnSell.setString(mc.dictionary.getGUIString("lblUnEquip"));
        this._btnSell.registerTouchEvent(function () {
            this.close();
            //unpick
            var itemInfo = mc.GameData.itemStock.getItemById(mc.ItemStock.getItemId(this._itemInfo));
            var loadingDialogId = mc.view_utility.showLoadingDialog();
            mc.protocol.submitHeroTakeOffItem(mc.ItemStock.getHeroIdEquipping(itemInfo), mc.ItemStock.getItemId(itemInfo),
                function (unequipInfo) {
                    mc.view_utility.hideLoadingDialogById(loadingDialogId);
                    unEquipCallback && unEquipCallback(unequipInfo);
                });
        }.bind(this));
        if (this._lblMax) {
            var increaseH = this._translate(this._btnSell.y, -35);
            this._root.height -= increaseH;

            this._lblMax.y += 55;
            this._btnSell.x = this._root.width * 0.5;
            this._btnSell.y -= 20;
            this._nodeAsset.y -= 5;
            this._btnUpgrade.setVisible(false);
        }

        if (onlyUnEquip || this._lblMax) {
            this._btnSell.x = this._nodeAsset.x = this._root.width * 0.5;
            this._btnUpgrade.setVisible(false);
        }
        return this;
    },

    disableSell: function (disable) {
        this._btnSell && this._btnSell.setGray(disable);
        return this;
    },

    registerShowItemBag: function (heroId, callback) {
        return this;
    },

    registerClearButton: function () {
        this._btnSell.setVisible(false);
        this._btnUpgrade.setVisible(false);
        this._nodeAsset.setVisible(false);
        return this;
    },

    registerShowHeroEquip: function (noneViewing) {
        var heroId = mc.ItemStock.getHeroIdEquipping(this._itemInfo);
        var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
        if (heroInfo) {
            var heroAvtView = new mc.HeroAvatarView(heroInfo);
            heroAvtView.setName("heroAvatarView");
            heroAvtView._touchScale = -0.05;
            heroAvtView.scale = 0.35;
            heroAvtView.setVisibleSurfaceInfo(false);
            heroAvtView.x = this._root.width - (heroAvtView.width * 0.35);
            heroAvtView.y = this._root.height - (heroAvtView.height * 0.35);
            if (!noneViewing) {
                heroAvtView.registerTouchEvent(function () {
                    this.close();
                    mc.GameData.guiState.setCurrentViewHeroId(mc.HeroStock.getHeroId(heroInfo));
                    var currScreen = bb.director.getCurrentScreen();
                    if (currScreen instanceof mc.MainScreen) {
                        currScreen.pushLayerWithId(mc.MainScreen.LAYER_HERO_INFO);
                    }
                    else {
                        mc.GameData.guiState.setCurrentViewHeroId(mc.HeroStock.getHeroId(heroInfo));
                        mc.GameData.guiState.setStackLayerIdForMainScreen([
                            mc.MainScreen.LAYER_HOME,
                            mc.MainScreen.LAYER_HERO_STOCK,
                            mc.MainScreen.LAYER_HERO_INFO
                        ]);
                        new mc.MainScreen().show();
                    }
                }.bind(this));
            }
            this._root.addChild(heroAvtView);
        }
        return this;
    },

    show: function () {
        var data = this.viewDatas;
        var arrayViews = [];
        var datum = data["attrArray"];
        if (datum) {
            for (var i = 0; i < datum.length; i += 2) {
                var attr = this.stats.clone();
                var lblNumAttr1 = attr.getChildByName("lblNumAttr1");
                var lblNumAttr2 = attr.getChildByName("lblNumAttr2");
                var lblAttr1 = attr.getChildByName("lblAttr1");
                var lblAttr2 = attr.getChildByName("lblAttr2");
                var att1 = datum[i];
                lblAttr1.setColor(mc.color.BLUE);
                lblAttr2.setColor(mc.color.BLUE);
                if (att1) {
                    lblAttr1.setString(att1["lbl"]);
                    lblNumAttr1.setString(att1["num"]);
                } else {
                    lblAttr1.setVisible(false);
                    lblNumAttr1.setVisible(false);
                }
                var att2 = datum[i + 1];
                if (att2) {
                    lblAttr2.setString(att2["lbl"]);
                    lblNumAttr2.setString(att2["num"]);
                } else {
                    lblAttr2.setVisible(false);
                    lblNumAttr2.setVisible(false);
                }
                attr.setVisible(true);
                arrayViews.push(attr);
            }
            arrayViews.push(this._sepe_3.clone());
        }

        var optSkills = data["optSkills"];
        if (mc.ItemStock.hasItemSkillOption(this._itemInfo)) {
            var numOption = mc.ItemStock.getItemSkillOptionNumber(this._itemInfo);
            for (var j = 0; j < numOption; j++) {
                if (optSkills) {
                    var skill = optSkills[j];
                    if (skill) {
                        var skillInfo = mc.dictionary.getSkillByIndex(skill);
                        var lblDescSkill = bb.framework.getGUIFactory().createText(mc.HeroStock.getSkillDescriptionOfHero(skillInfo));
                        var tw = this._root.width + this._root.width * (1 - lblDescSkill.scale);
                        lblDescSkill.setMultiLineString(mc.HeroStock.getSkillDescriptionOfHero(skillInfo), tw, cc.TEXT_ALIGNMENT_CENTER);
                        lblDescSkill.setColor(mc.color.GREEN);
                        arrayViews.push(lblDescSkill);
                        continue;
                    }
                }
                var lblDescSkillHide = bb.framework.getGUIFactory().createText("");
                var twUnknown = this._root.width + this._root.width * (1 - lblDescSkillHide.scale);
                lblDescSkillHide.setMultiLineString(mc.dictionary.getGUIString("Option undefined") + "\n", twUnknown, cc.TEXT_ALIGNMENT_CENTER);
                lblDescSkillHide.setColor(mc.color.GREEN);
                arrayViews.push(lblDescSkillHide);
            }


            arrayViews.push(this._sepe_3.clone());
        }

        if (data["lblMax"]) {
            var lblMax = this._lblMax = bb.framework.getGUIFactory().createText(data["lblMax"]);
            lblMax.setColor(mc.color.RED);
            arrayViews.push(lblMax);
            arrayViews.push(this._sepe_3.clone());
        }
        if (data["strDesc"]) {
            var lblDesc = this._lblMax = bb.framework.getGUIFactory().createText(data["strDesc"]);
            lblDesc.setMultiLineString(data["strDesc"], this._root.width * 0.8, cc.TEXT_ALIGNMENT_CENTER);
            lblDesc.setColor(mc.color.YELLOW);
            arrayViews.push(lblDesc);
            arrayViews.push(this._sepe_3.clone());
        }
        arrayViews.reverse();
        var linear = bb.layout.linear(arrayViews, 20, bb.layout.LINEAR_VERTICAL, true);
        this._root.addChild(linear);
        linear.setAnchorPoint(0.5, 1);
        linear.x = this._root.width / 2;
        this._root.height += linear.height;
        this.panelBtn.y = 0;
        this.basicPanel.y = this._root.height;
        linear.y = this.basicPanel.y - this.basicPanel.height;
        var heroAvatar = this._root.getChildByName("heroAvatarView");
        if (heroAvatar) {
            heroAvatar.x = this._root.width - (heroAvatar.width * 0.35);
            heroAvatar.y = this._root.height - (heroAvatar.height * 0.35);
        }
        this._super();
    },

    overrideShowAnimation: function () {
        this.opacity = 0;
        this.runAction(cc.sequence([cc.fadeIn(0.3), cc.callFunc(this.onTriggerTutorial.bind(this))]));
        return 0.15;
    },

    overrideCloseAnimation: function () {
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.15;
    }

});
mc.ItemInfoConsumeDialog = mc.BaseItemDialog.extend({

    ctor: function (itemInfo) {
        this._super();
        this._itemInfo = itemInfo;
        var node = ccs.load(res.widget_item_popup_info_consum, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var self = this;
        var nodeItem = rootMap["nodeItem"];
        var lblName = rootMap["lblName"];
        var lblLevel = rootMap["lblLevel"];
        var lblRare = rootMap["lblRare"];
        var lblUsage = rootMap["lblUsage"];
        var lblUsageInfo = rootMap["lblUsageInfo"];
        var sepe_2 = this._sepe_2 = rootMap["sepe_2"];
        var sepe_3 = this._sepe_3 = rootMap["sepe_3"];
        var btnSell = this._btnUpgrade = this._btnSell = rootMap["btnSell"];
        var nodeAsset = this._nodeAsset = rootMap["nodeAsset"];

        lblLevel.setColor(mc.color.YELLOW_SOFT);
        lblUsage.setColor(mc.color.YELLOW_SOFT);


        lblUsage.setString(mc.dictionary.getGUIString("lblUsage"));
        var rankObj = mc.ItemView.getRankText(mc.ItemStock.getItemRank(itemInfo));
        lblRare.setString("");
        var rareText = "#ffffff_" + mc.dictionary.getGUIString("Rarity") + " : #" + rankObj.text;
        var lblRareComplex = rootMap["lblRareComplex"] = mc.GUIFactory.applyComplexString(lblRare, rareText, rankObj.color, res.font_cam_stroke_32_export_fnt);
        lblRareComplex.setScale(0.75);
        lblName.setColor(rankObj.color);

        var arrRefundCost = mc.ItemStock.getItemRefundCost(itemInfo);
        if (arrRefundCost) {
            if (arrRefundCost.length === 1) {
                var assetSell = mc.view_utility.createAssetView(arrRefundCost[0]);
                nodeAsset.addChild(assetSell);
            }
        }
        btnSell.setString(mc.dictionary.getGUIString((arrRefundCost && arrRefundCost.length === 1) ? "lblSell" : "lblDisarm"));
        btnSell.registerTouchEvent(function () {
            if (arrRefundCost.length === 1) {
                self.close();
                new mc.SellingItemDialog(itemInfo).show();
            }
            else {
                mc.GameData.guiState.setCurrentDisarmItemId(mc.ItemStock.getItemId(itemInfo));
                mc.GUIFactory.showQuickSellItemsScreen();
            }
        }.bind(this));

        var itemView = new mc.ItemView(itemInfo);
        itemView.setNewScale(0.9);

        nodeItem.addChild(itemView);
        lblName.setMultiLineString(mc.ItemStock.getItemName(itemInfo), root.width * 0.9);

        var decreaseH = 0;
        var strDesc = mc.ItemStock.getItemDesc(itemInfo);
        if (!strDesc) {
            strDesc = "Unknown index" + mc.ItemStock.getItemIndex(itemInfo);
        }
        lblUsageInfo.setMultiLineString(strDesc, this._root.width);


        var overlapItemInfo = mc.GameData.itemStock.getOverlapItemByIndex(mc.ItemStock.getItemIndex(itemInfo));
        var numInStock = overlapItemInfo ? mc.ItemStock.getItemQuantity(overlapItemInfo) : 0;
        lblLevel.setColor(mc.color.WHITE_NORMAL);
        lblLevel.setString(mc.dictionary.getGUIString("lblInBag") + ": " + bb.utility.formatNumber(numInStock));

        if (!mc.ItemStock.getItemId(itemInfo)) {
            // only view item info if it have no id.
            nodeAsset.setVisible(false);
            btnSell.setVisible(false);

            if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_BOX) {
                var arrItemInfo = itemInfo.value;
                if (arrItemInfo) {
                    var layoutItemView = bb.layout.grid(bb.collection.createArray(arrItemInfo.length, function (index) {
                        return new mc.ItemView(arrItemInfo[index]).setNewScale(0.5);
                    }), 3, 350);
                    root.addChild(layoutItemView);
                    layoutItemView.x = root.width * 0.6;
                }
            }
        }
        else {
            itemView.getQuantityLabel().setVisible(false);
            if (!mc.ItemStock.isItemEquipment(itemInfo)) {
                // only let sell if it's consumable.
                btnSell.x = root.width * 0.5;
                nodeAsset.x = root.width * 0.5;
                if (mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_PACK ||
                    mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_HERO_TICKET ||
                    mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_GIFT_RANDOM ||
                    mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_MONTHLY_VIP) {
                    nodeAsset.setVisible(false);
                    btnSell.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
                    btnSell.setString(mc.dictionary.getGUIString("lblOpen"));
                    btnSell.registerTouchEvent(function () {
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.openItemPack(mc.ItemStock.getItemId(this._itemInfo), function (result) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            if (result) {
                                this.close();
                                if (result["heroes"]) {
                                    new mc.HeroSummonScreen(true).show(new cc.LayerColor(cc.color.WHITE));
                                }
                                if (result["vipTimer"]) {
                                    var durationInSecond = mc.GameData.playerInfo.getVIPTimer();
                                    var deltaInMs = durationInSecond - (bb.now() - mc.GameData.svStartTime());
                                    if (deltaInMs < 0) {
                                        deltaInMs = 0;
                                    }
                                    bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("lblVIPActiveSuccess"), mc.view_utility.formatDurationTime(deltaInMs))).show();
                                }
                            }
                        }.bind(this));
                    }.bind(this));
                }
                else if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_RENAME) {
                    nodeAsset.setVisible(false);
                    btnSell.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
                    btnSell.setString(mc.dictionary.getGUIString("lblRename"));
                    btnSell.registerTouchEvent(function () {
                        this.close();
                        new mc.ChangeNameDialog(function (rs) {
                        }).show();
                    }.bind(this));

                }
            }
            else {

                var heroId = mc.ItemStock.getHeroIdEquipping(itemInfo);
                if (heroId) {
                    // only let upgrade if it's equipping equipment.
                    btnSell.setVisible(false);
                    nodeAsset.setVisible(false);
                }
            }

        }

        root.height -= decreaseH;
    },

    show: function () {
        this._super();
        if (!mc.ItemStock.getItemId(this._itemInfo) && !this._buyMode) {
            var dy = 175;
            for (var key in this._rootMap) {
                this._rootMap[key].y -= dy;
            }
            this._sepe_2 && this._sepe_2.setVisible(false);
            this._sepe_3 && this._sepe_3.setVisible(false);
            this._root.height -= dy;
        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_ITEM_INFO);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                if (tutorialTrigger.param === "summon") {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(this._btnUpgrade)
                        .setCharPositionY(cc.winSize.height * 0.75)
                        .show();
                }
            }
        }
    },

    registerShowHeroEquip: function (noneViewing) {
        return this;
    },

    registerSummon: function (callback) {
        this._btnUpgrade && this._btnUpgrade.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
        this._btnUpgrade && this._btnUpgrade.setVisible(true);
        this._btnUpgrade.setString(mc.dictionary.getGUIString("lblSummon"));
        this._btnUpgrade && this._btnUpgrade.registerTouchEvent(callback);
        if (this._nodeAsset) {
            this._nodeAsset.removeAllChildren();
            this._nodeAsset.setVisible(true);
            var lblNum = bb.framework.getGUIFactory().createText(mc.ItemStock.getItemQuantity(this._itemInfo));
            var maxVal = mc.ItemStock.getItemMaxValue(this._itemInfo);
            if (mc.ItemStock.getItemQuantity(this._itemInfo) >= maxVal) {
                lblNum.setColor(mc.color.GREEN);
                this._btnUpgrade.setEnabled(true);
                this._btnUpgrade.setColor(mc.color.WHITE_NORMAL);
            }
            else {
                lblNum.setColor(mc.color.RED);
                this._btnUpgrade.setEnabled(false);
                this._btnUpgrade.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            lblNum.setDecoratorLabel("/" + maxVal, mc.color.WHITE_NORMAL);
            this._nodeAsset.addChild(lblNum);
        }
        return this;
    },

    overrideShowAnimation: function () {
        this.opacity = 0;
        this.runAction(cc.sequence([cc.fadeIn(0.3), cc.callFunc(this.onTriggerTutorial.bind(this))]));
        return 0.15;
    },

    overrideCloseAnimation: function () {
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.15;
    }
});

mc.createItemPopupDialog = function (itemInfo) {
    if (mc.ItemStock.isItemEquipment(itemInfo)) {
        return new mc.ItemInfoDialog(itemInfo);
    }
    return new mc.ItemInfoConsumeDialog(itemInfo);
};