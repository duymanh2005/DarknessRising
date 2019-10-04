/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.UpgradeEquipmentScreen = mc.Screen.extend({
    _arrMaterialView: null,
    _mapEnableSlotBySlotIndex: null,
    _mapParticleBySlotIndex: null,

    ctor: function () {
        this._super();
        this._arrMaterialView = [];
        this._equipmentId = mc.GameData.guiState.getCurrentRefineEquipId();
    },

    initResources: function () {
        this._super();
        var screen = mc.loadGUI(res.screen_refine_item_json);
        this.addChild(screen);

        var rootNode = this._rootNode = screen.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(rootNode.getChildren(), function (child) {
            return child.getName();
        });

        var slotFriend = rootMap["slotFriend"];
        var slotBless = rootMap["slotBless"];
        var slotMoney = rootMap["slotMoney"];
        var particleFar = rootMap["par_far"];
        var particleBackGoblin = rootMap["par_back_Goblin"];

        var par1 = new cc.ParticleSystem(res.b_firefly_plist);
        var par2 = new cc.ParticleSystem(res.f_firefly_plist);
        particleFar.addChild(par1);
        particleBackGoblin.addChild(par2);

        var btnBack = this._btnBack = rootMap["btnBack"];
        var brkRebase1 = this._brkRebase1 = rootMap["brkRebase1"];
        var nodeAsset = this._nodeAsset = rootMap["nodeAsset"];
        var lblSuccessRate = this._lblSuccessRate = rootMap["lblSuccessRate"];
        var lblNumSuccessRate = this._lblNumSuccessRate = rootMap["lblNumSuccessRate"];
        var btnUpgrade = this._btnUpgrade = rootMap["btnRefine"];
        lblSuccessRate.setString(mc.dictionary.getGUIString("lblSuccessRate"));
        if(mc.enableReplaceFontBM())
        {
            lblNumSuccessRate = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblNumSuccessRate);
        }
        var nodeGoblin = rootMap["nodeGoblin"];
        var nodeChaosMachine = rootMap["nodeChaosMachine"];
        var nodeEffect = this._nodeEffect = rootMap["nodeEffect"];
        var nodePanelUpgrade = this._nodePanelUpgrade = rootMap["nodePanelUpgrade"];
        this._nodeParticleUnder = rootMap["nodeParticle"];
        this._nodeParticleTopper = new cc.Node();
        this._nodeParticleTopper.x = this._nodeParticleUnder.x;
        this._nodeParticleTopper.y = this._nodeParticleUnder.y;
        rootNode.addChild(this._nodeParticleTopper);

        var reBaseMap = bb.utility.arrayToMap(brkRebase1.getChildren(), function (child) {
            return child.getName();
        });
        var slot1 = this._slotItem = reBaseMap["slot1"];
        var slot2 = reBaseMap["slot2"];
        var slot3 = reBaseMap["slot3"];
        var slot4 = reBaseMap["slot4"];
        var slot5 = this._slotCharm = reBaseMap["slot5"];
        this._slotExport = reBaseMap["slotExport"];
        slot1._slotIndex = 2;
        slot2._slotIndex = 3;
        slot3._slotIndex = 4;
        slot4._slotIndex = 5;
        slot5._slotIndex = 6;
        this._nodeItem = reBaseMap["nodeItem"];
        this._nodeNewItem = reBaseMap["nodeNewItem"];

        lblSuccessRate.setColor(mc.color.BLUE);
        btnUpgrade.setString(mc.dictionary.getGUIString("lblUpgrade"));

        this._spineChaosMachine = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chaosmachine_json, res.spine_ui_chaosmachine_atlas, 1.0);
        nodeChaosMachine.addChild(this._spineChaosMachine);

        this._spinePanelUpgrade = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_pnl_upgrade_json, res.spine_ui_pnl_upgrade_atlas, 1.0);
        this._spinePanelUpgrade.setAnimation(0, "idle", true);
        nodePanelUpgrade.addChild(this._spinePanelUpgrade);

        this._spineGoblin = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chaos_goblin_json, res.spine_ui_chaos_goblin_atlas, 0.5);
        this._spineGoblin.setAnimation(0, "idle", true);
        nodeGoblin.addChild(this._spineGoblin);

        this._mapParticleBySlotIndex = {};
        var p1 = new cc.ParticleSystem(res.particle_dot_plist);
        var p2 = new cc.ParticleSystem(res.particle_dot_plist);
        this._mapParticleBySlotIndex[1] = [p1, p2];
        this._rootNode.addChild(p1);
        this._rootNode.addChild(p2);
        var p1 = new cc.ParticleSystem(res.particle_dot_plist);
        var p2 = new cc.ParticleSystem(res.particle_dot_plist);
        var p3 = new cc.ParticleSystem(res.particle_dot_plist);
        this._mapParticleBySlotIndex[2] = [p1, p2, p3];
        this._rootNode.addChild(p1);
        this._rootNode.addChild(p2);
        this._rootNode.addChild(p3);
        var p1 = new cc.ParticleSystem(res.particle_dot_plist);
        var p2 = new cc.ParticleSystem(res.particle_dot_plist);
        var p3 = new cc.ParticleSystem(res.particle_dot_plist);
        this._mapParticleBySlotIndex[3] = [p1, p2, p3];
        this._rootNode.addChild(p1);
        this._rootNode.addChild(p2);
        this._rootNode.addChild(p3);
        var p1 = new cc.ParticleSystem(res.particle_dot_plist);
        var p2 = new cc.ParticleSystem(res.particle_dot_plist);
        var p3 = new cc.ParticleSystem(res.particle_dot_plist);
        this._mapParticleBySlotIndex[4] = [p1, p2, p3];
        this._rootNode.addChild(p1);
        this._rootNode.addChild(p2);
        this._rootNode.addChild(p3);
        var p1 = new cc.ParticleSystem(res.particle_dot_plist);
        var p2 = new cc.ParticleSystem(res.particle_dot_plist);
        var p3 = new cc.ParticleSystem(res.particle_dot_plist);
        this._mapParticleBySlotIndex[5] = [p1, p2, p3];
        this._rootNode.addChild(p1);
        this._rootNode.addChild(p2);
        this._rootNode.addChild(p3);
        var p1 = new cc.ParticleSystem(res.particle_dot_plist);
        var p2 = new cc.ParticleSystem(res.particle_dot_plist);
        var p3 = new cc.ParticleSystem(res.particle_dot_plist);
        this._mapParticleBySlotIndex[6] = [p1, p2, p3];
        this._rootNode.addChild(p1);
        this._rootNode.addChild(p2);
        this._rootNode.addChild(p3);

        this._setChaosMachineIdle();

        this._arrSlot = [slot2, slot3, slot4];
        var notifySystem = mc.GameData.notifySystem;
        btnUpgrade.registerTouchEvent(function () {
            var itemInfo = mc.GameData.itemStock.getItemById(this._equipmentId);
            var recipe = mc.dictionary.getRecipeLvlUpItem(itemInfo);
            var strRecipeCost = mc.dictionary.getRecipeCost(recipe);
            var isShow = mc.view_utility.showExchangingIfAny(mc.ItemStock.createJsonItemByStr(strRecipeCost));
            if (!isShow) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.lvlUpItem(this._equipmentId, function (code) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    this._animateLvlUpItem(code);
                }.bind(this));
            }

        }.bind(this));
        this._slotItem.registerTouchEvent(function () {
            this._showEquipmentStock();
        }.bind(this));
        this._slotCharm.registerTouchEvent(function () {
        }.bind(this));

        this.traceDataChange(notifySystem, function () {
            mc.view_utility.setNotifyIconForWidget(this._slotItem, notifySystem.getEquipmentLevelUpNotification());
        }.bind(this));

        this.scheduleUpdate();
        this._updateSelectedItemInfo();
        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, slotFriend, btnBack,mc.const.ITEM_INDEX_RELIC_COIN);

        var d = cc.winSize.width * 0.5;
        nodeGoblin.x += d;
        nodeGoblin.runAction(cc.sequence([cc.delayTime(0.3), cc.moveBy(0.25, -d, 0)]));
    },

    _showEquipmentStock: function () {
        var notifySystem = mc.GameData.notifySystem;
        new mc.EquipmentStockDialog().setTravelItemCb(function (itemWidget, itemInfo) {
            var lvUpNotification = notifySystem.getEquipmentLevelUpNotification();
            if (lvUpNotification) {
                mc.view_utility.setNotifyIconForWidget(itemWidget, lvUpNotification[mc.ItemStock.getItemId(itemInfo)]);
            }
        }).setFilter(function (itemInfo) {
            return mc.ItemStock.isItemEquipment(itemInfo);
        }, function (itemView) {
            this._equipmentId = mc.ItemStock.getItemId(itemView.getUserData());
            this._updateSelectedItemInfo();
            mc.GameData.guiState.setCurrentRefineEquipId(this._equipmentId);
        }.bind(this)).show();
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_UPDRAGE_ITEM);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnUpgrade)
                    .setCharPositionY(cc.winSize.height * 0.75)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_BACK_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnBack)
                    .setCharPositionY(cc.winSize.height * 0.75)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_PLUS_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._slotItem)
                    .setCharPositionY(cc.winSize.height * 0.75)
                    .show();
            }
        }
    },

    update: function (dt) {
        if (this._mapEnableSlotBySlotIndex) {
            var x = this._nodePanelUpgrade.x;
            var y = this._nodePanelUpgrade.y;
            for (var slotIndex in this._mapEnableSlotBySlotIndex) {
                var arrParticle = this._mapParticleBySlotIndex[slotIndex];
                if (arrParticle) {
                    var suff = parseInt(slotIndex) - 1;
                    var slotBone = this._spinePanelUpgrade.findBone("slot" + suff);
                    if (slotBone) {
                        var dotABone = this._spinePanelUpgrade.findBone("dotA" + suff);
                        if (dotABone) {
                            arrParticle[0].x = x + slotBone.x + dotABone.x;
                            arrParticle[0].y = y + slotBone.y + dotABone.y;
                        }
                        var dotBBone = this._spinePanelUpgrade.findBone("dotB" + suff);
                        if (dotBBone) {
                            arrParticle[1].x = x + slotBone.x + dotBBone.x;
                            arrParticle[1].y = y + slotBone.y + dotBBone.y;
                        }
                        var dotCBone = this._spinePanelUpgrade.findBone("dotC" + suff);
                        if (dotCBone) {
                            arrParticle[2].x = x + slotBone.x + dotCBone.x;
                            arrParticle[2].y = y + slotBone.y + dotCBone.y;
                        }
                    }
                }
            }
        }
    },

    _setChaosMachineIdle: function () {
        this._nodeParticleUnder.removeAllChildren();
        var p1 = new cc.ParticleSystem(res.particle_chaosmachine_idle1_plist);
        var p2 = new cc.ParticleSystem(res.particle_chaosmachine_idle2_plist);
        p1.x = p1.y = p2.x = p2.y = 0;
        this._nodeParticleUnder.addChild(p1);
        this._nodeParticleUnder.addChild(p2);

        this._nodeParticleTopper.removeAllChildren();
        var p1 = new cc.ParticleSystem(res.particle_chaosmachine_preview_plist);
        p1.x = p1.y = 0;
        this._nodeParticleTopper.addChild(p1);

        this._spineChaosMachine.setAnimation(0, "idle", true);
    },

    _setChaosMachineWork: function (success, callback) {
        bb.sound.playEffect(res.sound_ui_equip_upgrade_start);
        this.enableInput(false);
        this._nodeParticleTopper.removeAllChildren();
        var p1 = new cc.ParticleSystem(res.particle_chaosmachine_work1_plist);
        var p2 = new cc.ParticleSystem(res.particle_chaosmachine_work2_plist);
        var p3 = new cc.ParticleSystem(res.particle_chaosmachine_work3_plist);
        p1.x = p1.y = p2.x = p2.y = p3.x = p3.y = 0;
        this._nodeParticleTopper.addChild(p1);
        this._nodeParticleTopper.addChild(p2);
        this._nodeParticleTopper.addChild(p3);

        this._spineChaosMachine.setAnimation(1, "work", true);
        this._spineChaosMachine.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 1) {
                this._spineChaosMachine.clearTrack(1);
                this._setChaosMachineIdle();
                callback && callback();
                var spineWarn = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_text_upgrade_json, res.spine_ui_text_upgrade_atlas, 1.0);
                var newItemInfo = mc.GameData.itemStock.getItemById(this._equipmentId);
                var newItemView = new mc.ItemView(newItemInfo);
                newItemView.setNewScale(0.8);
                var code = "rainbow";
                if (mc.ItemStock.getItemRank(newItemInfo) <= 3) {
                    code = "blue";
                }
                else if (mc.ItemStock.getItemRank(newItemInfo) <= 4) {
                    code = "yellow";
                }
                var glory = mc.view_utility.createGlory(code);
                glory.setOpacity(0);
                glory.scale = 0.5;

                newItemView.setOpacity(0);
                spineWarn.setAnimation(0, success ? "text_upgrade_success" : "text_upgrade_fail", false);
                spineWarn.setCompleteListener(function (trackEntry) {
                    if (trackEntry.trackIndex === 0) {
                        if (success) glory.runAction(cc.sequence([cc.fadeIn(0.3), cc.delayTime(1.0), cc.removeSelf()]));
                        var pos = this._nodeItem.getParent().convertToWorldSpace(cc.p(this._nodeItem.x, this._nodeItem.y));
                        newItemView.runAction(cc.sequence([cc.fadeIn(0.3), cc.delayTime(1.0), cc.moveTo(0.3, pos.x, pos.y), cc.callFunc(function () {
                            this.enableInput(true);
                            this._updateSelectedItemInfo();
                        }.bind(this)), cc.removeSelf(), cc.callFunc(function () {
                            spineWarn.runAction(cc.removeSelf());
                        })]));
                    }
                }.bind(this));
                spineWarn.x = this._nodeEffect.x;
                spineWarn.y = this._nodeEffect.y + 150;
                newItemView.x = this._nodeEffect.x;
                newItemView.y = this._nodeEffect.y;
                glory.x = this._nodeEffect.x;
                glory.y = this._nodeEffect.y;
                this._rootNode.addChild(glory);
                this._rootNode.addChild(spineWarn);
                this._rootNode.addChild(newItemView);

                var particleSuccess = new cc.ParticleSystem(success ? res.particle_chaosmachine_success_plist : res.particle_chaosmachine_fail_plist);
                particleSuccess.x = this._nodeEffect.x;
                particleSuccess.y = this._nodeEffect.y;
                particleSuccess.runAction(cc.sequence([cc.delayTime(1.5), cc.removeSelf()]));
                this._rootNode.addChild(particleSuccess);
                bb.sound.playEffect(success ? res.sound_ui_equip_upgrade_success : res.sound_ui_equip_upgrade_fail);
            }
        }.bind(this));
    },

    _animateLvlUpItem: function (code) {
        var dur = 1.5;
        var arrView = [];
        for (var i = 0; i < this._arrMaterialView.length; i++) {
            arrView.push(this._arrMaterialView[i]);
        }
        for (var slotIndex in this._mapParticleBySlotIndex) {
            var arrParticle = this._mapParticleBySlotIndex[slotIndex];
            for (var i = 0; i < arrParticle.length; i++) {
                arrParticle[i].setVisible(false);
            }
        }
        var itemView = this._nodeItem.getChildren()[0];
        arrView.push(itemView);
        for (var i = 0; i < arrView.length; i++) {
            arrView[i].runAction(cc.moveTo(dur / 2, this._nodeEffect.x, this._nodeEffect.y));
            arrView[i].runAction(cc.fadeOut(dur / 2));
        }
        var exportItemView = this._nodeNewItem.getChildren()[0];
        exportItemView.runAction(cc.fadeOut(dur / 2));

        this._slotItem.setVisible(true);
        this._slotExport.setVisible(true);
        this._setChaosMachineWork(code === 1, function () {

        }.bind(this));
    },

    _updateSelectedItemInfo: function () {
        this._nodeItem.removeAllChildren();
        this._nodeAsset.removeAllChildren();
        for (var slotIndex in this._mapParticleBySlotIndex) {
            var arrParticle = this._mapParticleBySlotIndex[slotIndex];
            for (var i = 0; i < arrParticle.length; i++) {
                arrParticle[i].setVisible(false);
            }
        }
        for (var i = 0; i < this._arrMaterialView.length; i++) {
            this._arrMaterialView[i].removeFromParent();
        }
        this._arrMaterialView.length = 0;
        for (var i = 0; i < this._arrSlot.length; i++) {
            this._arrSlot[i].setUserData(null);
        }
        if (this._lblMax) {
            this._lblMax.removeFromParent();
        }
        if (this._nodeNewItem) {
            this._nodeNewItem.removeAllChildren();
        }

        this._nodeAsset.setVisible(true);
        this._lblSuccessRate.setVisible(true);
        this._lblNumSuccessRate.setVisible(true);

        this._mapEnableSlotBySlotIndex = {};
        if (this._equipmentId) {
            var itemInfo = mc.GameData.itemStock.getItemById(this._equipmentId);
            var recipe = mc.dictionary.getRecipeLvlUpItem(itemInfo);
            if (recipe) {
                var recipeMaterialMap = mc.dictionary.getRecipeMaterialMap(recipe);
                var isSatisfy = true;
                for (var itemIndex in recipeMaterialMap) {
                    var materialRequired = recipeMaterialMap[itemIndex];
                    var materialIndex = mc.ItemStock.getItemIndex(materialRequired);
                    var materialInStock = mc.GameData.itemStock.getOverlapItemByIndex(materialIndex);

                    var numInStock = materialInStock ? mc.ItemStock.getItemQuantity(materialInStock) : 0;
                    var numInRequired = mc.ItemStock.getItemQuantity(materialRequired);
                    var materialIconURL = mc.ItemStock.getItemRes(materialRequired);

                    var slotView = this._findEmptySlotView();
                    var imgMaterial = new ccui.ImageView(materialIconURL, ccui.Widget.LOCAL_TEXTURE);
                    imgMaterial.scale = 0.65;
                    imgMaterial.x = imgMaterial.width * 0.5;
                    imgMaterial.y = imgMaterial.height * 0.5;
                    if (!imgMaterial.getChildByName("not_enough")) {
                        var notEnoughSpine = sp.SkeletonAnimation.createWithJsonFile(res.spine_item_panel_lacking_json, res.spine_item_panel_lacking_atlas, 1.0);
                        imgMaterial.addChild(notEnoughSpine);
                        notEnoughSpine.setName("not_enough");
                        notEnoughSpine.setPosition(imgMaterial.width / 2, imgMaterial.height / 2);
                    }
                    var lblNumInStock = bb.framework.getGUIFactory().createText("" + bb.utility.formatNumber(numInStock));
                    var enoughMaterial = numInStock >= numInRequired;
                    if (enoughMaterial) {
                        lblNumInStock.setColor(mc.color.GREEN);
                        this._mapEnableSlotBySlotIndex[slotView._slotIndex] = true;
                    }
                    else {
                        isSatisfy = false;
                        lblNumInStock.setColor(mc.color.RED);
                        this._mapEnableSlotBySlotIndex[slotView._slotIndex] = false;
                    }
                    var spine = imgMaterial.getChildByName("not_enough");
                    spine.setVisible(!enoughMaterial);
                    if (!enoughMaterial) {
                        spine.setAnimation(0, "lacking_idle", true);
                    }
                    lblNumInStock.setDecoratorLabel("/" + numInRequired, cc.color.WHITE);
                    lblNumInStock.x = imgMaterial.width * 0.5;
                    lblNumInStock.y = imgMaterial.height * 0.15;
                    var materialWidget = new ccui.Widget();
                    materialWidget.setCascadeOpacityEnabled(true);
                    materialWidget.anchorX = 0.5;
                    materialWidget.anchorY = 0.5;
                    materialWidget.width = imgMaterial.width;
                    materialWidget.height = imgMaterial.height;
                    materialWidget.x = slotView.x;
                    materialWidget.y = slotView.y;
                    materialWidget.registerTouchEvent(function (materialWidget) {
                        new mc.HowToGetDialog(materialWidget.getUserData()).show();
                    });
                    materialWidget.addChild(imgMaterial);
                    materialWidget.addChild(lblNumInStock);

                    this._brkRebase1.addChild(materialWidget);
                    this._arrMaterialView.push(materialWidget);
                    materialWidget.setOpacity(0);
                    materialWidget.runAction(cc.fadeIn(0.3));
                    materialWidget.setUserData(materialRequired);
                    slotView.setUserData(materialRequired);
                }
                var recipeCost = mc.dictionary.getRecipeCost(recipe);
                var arrRecipeCost = mc.ItemStock.createArrJsonItemFromStr(recipeCost);
                var assetView = bb.layout.linear(bb.collection.createArray(arrRecipeCost.length, function (index) {
                    var recipeCost = arrRecipeCost[index];
                    var costView = mc.view_utility.createAssetView(recipeCost);
                    if (mc.ItemStock.isNotEnoughCost(recipeCost)) {
                        costView.getChildByName("lbl").setColor(mc.color.RED);
                    }
                    return costView;
                }), 10, bb.layout.LINEAR_HORIZONTAL, true);

                this._lblNumSuccessRate.setString(mc.dictionary.getSuccessRatePercent(recipe) + "%");
                this._nodeAsset.addChild(assetView);

                this._btnUpgrade.setGrayForAll(!isSatisfy);

                var newItemInfo = mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo), 1);
                newItemInfo.level = recipe.level;
                var newItemView = new mc.ItemView(newItemInfo);
                newItemView.setNewScale(0.8);
                newItemView.registerTouchEvent(function () {
                    new mc.RefineItemDialog(itemInfo).show();
                }.bind(this));
                this._nodeNewItem.addChild(newItemView);
                this._slotExport.setVisible(false);
                this._mapEnableSlotBySlotIndex[1] = true;
                this._nodeAsset.setVisible(true);
            }
            else {

                this._lblSuccessRate.setVisible(false);
                this._lblNumSuccessRate.setVisible(false);
                this._nodeAsset.setVisible(false);

                var lblMax = this._lblMax = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtEquipmentMaxLv"));
                lblMax.setColor(mc.color.RED);
                lblMax.x = cc.winSize.width * 0.5;
                lblMax.y = this._lblSuccessRate.y;
                this._rootNode.addChild(lblMax);
                this._btnUpgrade.setGrayForAll(true);
            }

            var itemView = new mc.ItemView(itemInfo);
            itemView.setNewScale(0.8);
            itemView.registerTouchEvent(function () {
                //this._equipmentId = null;
                //this._updateSelectedItemInfo();
                this._showEquipmentStock();
            }.bind(this));
            this._nodeItem.addChild(itemView);
            this._slotItem.setVisible(false);
            this._mapEnableSlotBySlotIndex[2] = true;
        }
        else {
            this._nodeAsset.setVisible(false);
            this._lblNumSuccessRate.setString("0%");
            this._slotItem.setVisible(true);
            this._slotExport.setVisible(true);
            this._btnUpgrade.setGrayForAll(true);
            var notifySystem = mc.GameData.notifySystem;
            mc.view_utility.setNotifyIconForWidget(this._slotItem, notifySystem.getEquipmentLevelUpNotification());
        }

        for (var slotIndex in this._mapParticleBySlotIndex) {
            if (this._mapEnableSlotBySlotIndex[slotIndex]) {
                var arrParticle = this._mapParticleBySlotIndex[slotIndex];
                for (var i = 0; i < arrParticle.length; i++) {
                    arrParticle[i].setVisible(true);
                }
            }
        }
    },

    _findEmptySlotView: function () {
        var slotView = null;
        for (var i = 0; i < this._arrSlot.length; i++) {
            if (!this._arrSlot[i].getUserData()) {
                slotView = this._arrSlot[i];
                break;
            }
        }
        return slotView;
    },

    _showSelectItemDialog: function () {

    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_REFINE_ITEM;
    }

});

mc.RefineItemDialog = bb.Dialog.extend({

    ctor: function (itemInfo) {
        this._super();

        var node = ccs.load(res.widget_refine_item, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var recipe = mc.dictionary.getRecipeLvlUpItem(itemInfo);
        var newItemInfo = mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo), 1);
        newItemInfo.level = recipe.level;

        var nodeItem = rootMap["nodeItem"];
        var btnClose = rootMap["btnClose"];
        var nodeRefineItem = rootMap["nodeRefineItem"];
        var lblAtk = rootMap["lblAtk"];
        var lblHp = rootMap["lblHp"];
        var lblDef = rootMap["lblDef"];
        var lblRes = rootMap["lblRes"];
        var lblMag = rootMap["lblMag"];
        var lblSpd = rootMap["lblSpd"];
        var lblNewAtk = rootMap["lblNewAtk"];
        var lblNewHp = rootMap["lblNewHp"];
        var lblNewDef = rootMap["lblNewDef"];
        var lblNewRes = rootMap["lblNewRes"];
        var lblNewMag = rootMap["lblNewMag"];
        var lblNewSpd = rootMap["lblNewSpd"];

        var lblNumAtk = rootMap["lblNumAtk"];
        var lblNumHp = rootMap["lblNumHp"];
        var lblNumDef = rootMap["lblNumDef"];
        var lblNumRes = rootMap["lblNumRes"];
        var lblNumMag = rootMap["lblNumMag"];
        var lblNumSpd = rootMap["lblNumSpd"];
        var lblNumNewAtk = rootMap["lblNumNewAtk"];
        var lblNumNewHp = rootMap["lblNumNewHp"];
        var lblNumNewDef = rootMap["lblNumNewDef"];
        var lblNumNewRes = rootMap["lblNumNewRes"];
        var lblNumNewMag = rootMap["lblNumNewMag"];
        var lblNumNewSpd = rootMap["lblNumNewSpd"];

        lblAtk.setColor(mc.color.BLUE);
        lblHp.setColor(mc.color.BLUE);
        lblMag.setColor(mc.color.BLUE);
        lblRes.setColor(mc.color.BLUE);
        lblSpd.setColor(mc.color.BLUE);
        lblDef.setColor(mc.color.BLUE);
        lblNewAtk.setColor(mc.color.BLUE);
        lblNewHp.setColor(mc.color.BLUE);
        lblNewMag.setColor(mc.color.BLUE);
        lblNewRes.setColor(mc.color.BLUE);
        lblNewSpd.setColor(mc.color.BLUE);
        lblNewDef.setColor(mc.color.BLUE);

        lblNumNewAtk.setColor(mc.color.GREEN_NORMAL);
        lblNumNewHp.setColor(mc.color.GREEN_NORMAL);
        lblNumNewDef.setColor(mc.color.GREEN_NORMAL);
        lblNumNewRes.setColor(mc.color.GREEN_NORMAL);
        lblNumNewMag.setColor(mc.color.GREEN_NORMAL);
        lblNumNewSpd.setColor(mc.color.GREEN_NORMAL);

        lblNumAtk.setString(bb.utility.formatNumber(mc.ItemStock.getItemAttack(itemInfo)));
        lblNumHp.setString(bb.utility.formatNumber(mc.ItemStock.getItemHp(itemInfo)));
        lblNumDef.setString(bb.utility.formatNumber(mc.ItemStock.getItemDefense(itemInfo)));
        lblNumRes.setString(bb.utility.formatNumber(mc.ItemStock.getItemResistant(itemInfo)));
        lblNumMag.setString(bb.utility.formatNumber(mc.ItemStock.getItemMagic(itemInfo)));
        lblNumSpd.setString(bb.utility.formatNumber(mc.ItemStock.getItemSpeed(itemInfo)));

        lblNumNewAtk.setString(bb.utility.formatNumber(mc.ItemStock.getItemAttack(newItemInfo)));
        lblNumNewHp.setString(bb.utility.formatNumber(mc.ItemStock.getItemHp(newItemInfo)));
        lblNumNewDef.setString(bb.utility.formatNumber(mc.ItemStock.getItemDefense(newItemInfo)));
        lblNumNewRes.setString(bb.utility.formatNumber(mc.ItemStock.getItemResistant(newItemInfo)));
        lblNumNewMag.setString(bb.utility.formatNumber(mc.ItemStock.getItemMagic(newItemInfo)));
        lblNumNewSpd.setString(bb.utility.formatNumber(mc.ItemStock.getItemSpeed(newItemInfo)));

        var itemView = new mc.ItemView(itemInfo);
        nodeItem.addChild(itemView);

        var newItemView = new mc.ItemView(newItemInfo);
        nodeRefineItem.addChild(newItemView);

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));

    }

});