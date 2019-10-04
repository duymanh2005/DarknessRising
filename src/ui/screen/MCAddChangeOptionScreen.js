/**
 * Created by long.nguyen on 11/15/2017.
 */
var changeOptionRecipe = "11001/200#11002/100#11006/100#11999/300";

mc.AddChangeOptionScreen = mc.Screen.extend({
    _arrMaterialView: null,
    _mapEnableSlotBySlotIndex: null,
    _mapParticleBySlotIndex: null,
    _arrItemRecipeOption: [],
    _actionType: null,


    ctor: function (action) {
        this._super();
        this._arrMaterialView = [];
        this._equipment = mc.GameData.guiState.getCurrentRefineOptionEquip();
        this._mapItemViewByIndex = {};
        this._arrCraftMaterialInfo = [];
        this._actionType = action;
        this._initItemRecipeOption();
    },
    initResources: function () {
        var screen = mc.loadGUI(res.screen_refine_item_option_json);
        this.addChild(screen);

        var rootNode = this._rootNode = screen.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(rootNode.getChildren(), function (child) {
            return child.getName();
        });

        var slotBless = rootMap["slotBless"];
        var slotMoney = rootMap["slotMoney"];
        var particleFar = rootMap["par_far"];
        var particleBackGoblin = rootMap["par_back_Goblin"];

        var par1 = new cc.ParticleSystem(res.b_firefly_plist);
        var par2 = new cc.ParticleSystem(res.f_firefly_plist);
        particleFar.addChild(par1);
        particleBackGoblin.addChild(par2);

        var btnBack = rootMap["btnBack"];
        var brkRebase1 = this._brkRebase1 = rootMap["brkRebase1"];
        this._nodeAsset = rootMap["nodeAsset"];
        var btnUpgrade = this._btnUpgrade = rootMap["btnRefine"];
        var nodeGoblin = rootMap["nodeGoblin"];
        var nodeChaosMachine = rootMap["nodeChaosMachine"];
        this._nodeEffect = rootMap["nodeEffect"];
        var nodePanelUpgrade = this._nodePanelUpgrade = rootMap["nodePanelUpgrade"];
        this._nodeParticleUnder = rootMap["nodeParticle"];
        this._nodeParticleTopper = new cc.Node();
        this._nodeParticleTopper.x = this._nodeParticleUnder.x;
        this._nodeParticleTopper.y = this._nodeParticleUnder.y;
        rootNode.addChild(this._nodeParticleTopper);

        var reBaseMap = bb.utility.arrayToMap(brkRebase1.getChildren(), function (child) {
            return child.getName();
        });
        var slot1 = reBaseMap["slot1"];
        var slot2 = reBaseMap["slot2"];
        var slot3 = reBaseMap["slot3"];
        var slot4 = reBaseMap["slot4"];
        var slot5 = reBaseMap["slot5"];
        slot1._slotIndex = 2;
        slot2._slotIndex = 3;
        slot3._slotIndex = 4;
        slot4._slotIndex = 5;
        slot5._slotIndex = 6;
        this._nodeNewItem = reBaseMap["nodeNewItem"];

        btnUpgrade.setString(mc.dictionary.getGUIString("Add Option"));
        this._bindUpgradeBtnText();


        this._spineChaosMachine = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chaosmachine_json, res.spine_ui_chaosmachine_atlas, 1.0);
        nodeChaosMachine.addChild(this._spineChaosMachine);
        this._spineChaosMachine.setScale(0.75);

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

        this._arrSlot = [slot1, slot2, slot3, slot4, slot5];
        var notifySystem = mc.GameData.notifySystem;

        btnUpgrade.registerTouchEvent(function () {
            if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.ADD) {
                var materialInEquipping = bb.collection.findBy(this._arrCraftMaterialInfo, function (materialInfo) {
                    var stockInfo = mc.GameData.itemStock.getItemById(materialInfo["id"]) || materialInfo;
                    return mc.ItemStock.getHeroIdEquipping(stockInfo) != null;
                });
                var materialIsEquipButLower11 = bb.collection.findBy(this._arrCraftMaterialInfo, function (materialInfo) {
                    return mc.ItemStock.isItemEquipment(materialInfo) && mc.ItemStock.getItemLevel(materialInfo) < 11;
                });
                if (!materialInEquipping && !materialIsEquipButLower11) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.optionForItem(mc.ItemStock.getItemIndex(this._equipment._itemOptionInfo), this._arrCraftMaterialInfo, function (data) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (data) {
                            this.newItemInfo = data;
                            this._animateLvlUpItem(1);
                        }
                    }.bind(this));
                } else {
                    if (materialInEquipping) {
                        mc.GUIFactory.createWarningDialog(mc.dictionary.getGUIString("txtDoNotCraftingIfEquipmentOwning"), function () {
                            var stockInfo = mc.GameData.itemStock.getItemById(materialInEquipping["id"]);
                            mc.createItemPopupDialog(stockInfo).registerUnEquipping(mc.ItemStock.getHeroIdEquipping(stockInfo), undefined, true).show();
                        }.bind(this)).show();
                    } else {
                        mc.GUIFactory.createWarningDialog(mc.dictionary.getGUIString("txtDoNotAddOptionIfEquipmentLevelLower11"), function () {
                            var stockInfo = mc.GameData.itemStock.getItemById(materialIsEquipButLower11["id"]);
                            mc.createItemPopupDialog(stockInfo).disableSell(true).show();
                        }.bind(this)).show();

                    }
                }
            }
            else if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.CHANGE) {
                var materialInEquipping = bb.collection.findBy(this._arrCraftMaterialInfo, function (materialInfo) {
                    var stockInfo = mc.GameData.itemStock.getItemById(materialInfo["id"]) || materialInfo;
                    return mc.ItemStock.getHeroIdEquipping(stockInfo) != null;
                });

                if (!materialInEquipping) {
                    var waitingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.optionForItem(mc.ItemStock.getItemIndex(this._equipment._itemOptionInfo), this._arrCraftMaterialInfo, function (data) {
                        mc.view_utility.hideLoadingDialogById(waitingId);
                        if (data) {
                            this.newItemInfo = data;
                            this._animateLvlUpItem(1);
                        }
                    }.bind(this));
                } else {
                    mc.GUIFactory.createWarningDialog(mc.dictionary.getGUIString("txtDoNotCraftingIfEquipmentOwning"), function () {
                        var stockInfo = mc.GameData.itemStock.getItemById(materialInEquipping["id"]);
                        mc.createItemPopupDialog(stockInfo).registerUnEquipping(mc.ItemStock.getHeroIdEquipping(stockInfo), undefined, true).show();
                    }.bind(this)).show();
                }
            }

        }.bind(this));

        this.scheduleUpdate();
        this._updateSelectedItemInfo();
        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, null, btnBack);

        var d = cc.winSize.width * 0.5;
        nodeGoblin.x += d;
        nodeGoblin.runAction(cc.sequence([cc.delayTime(0.3), cc.moveBy(0.25, -d, 0)]));

        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
        var brk = new ccui.ImageView("patch9/Grid_Panel.png", ccui.Widget.PLIST_TEXTURE);
        brk.anchorY = 0;
        brk.x = cc.winSize.width * 0.5;
        brk.setScale9Enabled(true);
        brk.width = cc.winSize.width;
        brk.height = 400;
        rootNode.addChild(brk);

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
            popUpDialog = mc.createItemPopupDialog(itemView.getUserData()).registerClearButton();
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
                if (!(itemDict._itemOptionInfo)) {
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
        var _loadEquipment = function (arrEquipDict, name) {
            if (this._addOptionsGridView && cc.sys.isObjectValid(this._addOptionsGridView)) {
                this._addOptionsGridView.removeFromParent();
                this._addOptionsGridView = null;
            }

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
            sampleView.height = 410;
            var minView = 10;

            var arrFighterClassName = cc.copyArray(mc.dictionary.getGUIString("arrLblFighterClassName"));
            cc.arrayAppendObjectsToIndex(arrFighterClassName, mc.dictionary.getGUIString("lblAll"), 0);
            var numMaxItem = Math.max(minView, (Math.floor(arrEquipDict.length / 5) + (arrEquipDict.length % 5 == 0 ? 0 : 1)) * 5);
            var scroll = this._addOptionsGridView = new mc.SortedGridView(sampleView)
                .setInfoText("No. ", arrEquipDict.length)
                .setPaddingHeight(1);
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
            }, 15);
            scroll.setDataSource(numMaxItem, function (index) {
                return _createEquipmentWidget(arrEquipDict[index], name);
            });
            scroll.getBackgroundView().setVisible(false);
            scroll.anchorY = 0;
            scroll.setName(name);
            this._rootNode.addChild(scroll);
            return scroll;
        }.bind(this);

        var _updateGridView = function (showHint) {
            var arrayItems = [];
            var text = "";
            if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.ADD) {
                arrayItems = this._getItemAddOption();
                text = mc.dictionary.getGUIString("AddOptionEmpty");
            }
            else if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.CHANGE) {
                arrayItems = this._getItemChangeOption();
                text = mc.dictionary.getGUIString("ChangeOptionEmpty");
            }
            _loadEquipment(arrayItems, "equipments");

            if (showHint && arrayItems.length <= 0) {
                var infoDialog = bb.framework.getGUIFactory().createInfoDialog(text);
                infoDialog.show();
            }

        }.bind(this);

        _updateGridView(true);

        this.traceDataChange(mc.GameData.itemStock, function (rs) {
            if (rs) {
                _updateGridView(false);
            }
        }.bind(this));
    },

    _initItemRecipeOption: function () {
        this._arrItemRecipeOption = [];
        for (var equipIndex in mc.dictionary.equipmentMapByIndex) {
            var equipment = mc.dictionary.equipmentMapByIndex[equipIndex];
            if (mc.ItemStock.getAddOptionRecipe(equipment) || mc.ItemStock.hasItemSkillOption(equipment)) {
                this._arrItemRecipeOption.push(equipment);
            }
        }
    },

    _getItemAddOption: function () {
        var arr = [];
        if (this._arrItemRecipeOption && this._arrItemRecipeOption.length > 0) {
            for (var i = 0; i < this._arrItemRecipeOption.length; i++) {
                var item = this._arrItemRecipeOption[i];
                var recipe = mc.ItemStock.getAddOptionRecipe(item);
                if(recipe){
                    var arrMaterial = mc.ItemStock.createArrJsonItemFromStr(recipe);
                    for (var m = 0; m < arrMaterial.length; m++) {
                        var materialInfo = arrMaterial[m];
                        var indexRequired = mc.ItemStock.getItemIndex(materialInfo);
                        if (mc.ItemStock.isItemEquipment(materialInfo)) {
                            var arrEquip = mc.GameData.itemStock.getArrayItemByIndex(indexRequired);
                            for (var e = 0; e < arrEquip.length; e++) {
                                var temp = arrEquip[e];
                                if (mc.ItemStock.getItemLevel(temp) >= 11) {
                                    temp._itemOptionInfo = item;
                                    arr.push(temp);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
        return arr;
    },

    _getItemChangeOption: function () {
        var arr = [];
        if (this._arrItemRecipeOption && this._arrItemRecipeOption.length > 0) {
            for (var i = 0; i < this._arrItemRecipeOption.length; i++) {
                var item = this._arrItemRecipeOption[i];
                var indexRequired = mc.ItemStock.getItemIndex(item);
                var arrEquip = mc.GameData.itemStock.getArrayItemByIndex(indexRequired);
                for (var j = 0; j < arrEquip.length; j++) {
                    var temp = arrEquip[j];
                    if (mc.ItemStock.hasItemSkillOption(temp)) {
                        temp._itemOptionInfo = item;
                        arr.push(temp);
                    }
                }
            }
        }
        return arr;
    },


    onTriggerTutorial: function () {
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
        this._btnUpgrade.setGrayForAll(true);
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
                var newItemInfo = this.newItemInfo;
                var newItemView = new mc.ItemView(newItemInfo);
                newItemView.setNewScale(0.8);
                newItemView.registerTouchEvent(function () {
                    mc.createItemPopupDialog(newItemInfo).registerClearButton().show();
                });
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
                newItemView.setName("newItemView");
                spineWarn.setAnimation(0, success ? "text_upgrade_success" : "text_upgrade_fail", false);
                spineWarn.setCompleteListener(function (trackEntry) {
                    if (trackEntry.trackIndex === 0) {
                        if (success) glory.runAction(cc.sequence([cc.fadeIn(0.3), cc.delayTime(1.0), cc.removeSelf()]));
                        var pos = this._nodeNewItem.getParent().convertToWorldSpace(cc.p(this._nodeNewItem.x, this._nodeNewItem.y));
                        newItemView.runAction(cc.sequence([cc.fadeIn(0.3), cc.delayTime(1.0), cc.moveTo(0.3, pos.x, pos.y), cc.callFunc(function () {
                            this.enableInput(true);
                        }.bind(this)), cc.callFunc(function () {
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
        for (var i = 0; i < arrView.length; i++) {
            arrView[i].setCascadeOpacityEnabled(true);
            arrView[i].runAction(cc.spawn(cc.moveTo(dur / 2, this._nodeEffect.x, this._nodeEffect.y), cc.fadeOut(0.2)));
        }
        var exportItemView = this._nodeNewItem.getChildren()[0];
        exportItemView.runAction(cc.fadeOut(dur / 2));

        this._setChaosMachineWork(code === 1, function () {

        }.bind(this));
    },
    _selectCraftItemView: function (itemView) {
        this._equipment = itemView.getUserData();
        this._updateSelectedItemInfo();
        mc.GameData.guiState.setCurrentRefineOptionEquip(this._equipment);
    },

    _bindUpgradeBtnText: function () {
        if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.ADD) {
            this._btnUpgrade.setString(mc.dictionary.getGUIString("lblUpgrade"));
        }
        else if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.CHANGE) {
            this._btnUpgrade.setString(mc.dictionary.getGUIString("Change"));
        }
    },

    _updateSelectedItemInfo: function () {
        this._arrCraftMaterialInfo = [];
        var nodeItem = this._rootNode.getChildByName("newItemView");
        if (nodeItem) {
            nodeItem.removeFromParent();
        }
        this._nodeNewItem.removeAllChildren();
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

        this._mapEnableSlotBySlotIndex = {};
        if (this._equipment) {
            var itemInfo = this._equipment;
            //this._btnUpgrade.setString(mc.dictionary.getGUIString("lblUpgrade"));
            this._bindUpgradeBtnText();
            var recipe = mc.ItemStock.getAddOptionRecipe(itemInfo._itemOptionInfo);
            if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.CHANGE) {
                recipe = changeOptionRecipe;
                this._arrCraftMaterialInfo.push(this._equipment);
            }
            if (recipe) {
                var recipeMaterialMap = mc.dictionary.getRecipeMaterialOptionMap(recipe);
                var isSatisfy = true;
                for (var itemIndex in recipeMaterialMap) {
                    if (itemIndex == mc.const.ITEM_INDEX_BLESS) {
                        var arrRecipeCost = [recipeMaterialMap[itemIndex]];
                        var assetView = bb.layout.linear(bb.collection.createArray(arrRecipeCost.length, function (index) {
                            var recipeCost = arrRecipeCost[index];
                            var costView = mc.view_utility.createAssetView(recipeCost);
                            if (mc.ItemStock.isNotEnoughCost(recipeCost)) {
                                costView.getChildByName("lbl").setColor(mc.color.RED);
                            }
                            return costView;
                        }), 10, bb.layout.LINEAR_HORIZONTAL, true);
                        this._nodeAsset.addChild(assetView);
                    } else {
                        var materialRequired = recipeMaterialMap[itemIndex];
                        var materialIndex = mc.ItemStock.getItemIndex(materialRequired);
                        var materialInStock = mc.GameData.itemStock.getOverlapItemByIndex(materialIndex);

                        var numInStock = materialInStock ? mc.ItemStock.getItemQuantity(materialInStock) : 0;


                        var numInRequired = mc.ItemStock.getItemQuantity(materialRequired);
                        var materialIconURL = mc.ItemStock.getItemRes(materialRequired);

                        if (mc.ItemStock.isItemEquipment(materialRequired)) {
                            var itemRequireInfo = mc.ItemStock.createJsonItemInfo(materialIndex, numInRequired, mc.ItemStock.getItemId(this._equipment));
                            itemRequireInfo.level = mc.ItemStock.getItemLevel(this._equipment);
                            this._arrCraftMaterialInfo.push(itemRequireInfo);
                        } else {
                            var itemRequireInfo = mc.ItemStock.createJsonItemInfo(materialIndex, numInRequired, mc.ItemStock.getItemId(materialInStock));
                            this._arrCraftMaterialInfo.push(itemRequireInfo);
                        }

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
                        }, function (materialWidget) {
                            mc.createItemPopupDialog(materialWidget.getUserData()).registerClearButton().show();
                        }.bind(this));
                        materialWidget.addChild(imgMaterial);
                        materialWidget.addChild(lblNumInStock);

                        this._brkRebase1.addChild(materialWidget);
                        this._arrMaterialView.push(materialWidget);
                        materialWidget.setOpacity(0);
                        materialWidget.runAction(cc.fadeIn(0.3));
                        materialWidget.setUserData(itemRequireInfo);
                        slotView.setUserData(materialRequired);
                    }
                }

                this._btnUpgrade.setGrayForAll(!isSatisfy);

                var newItemInfo = mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo._itemOptionInfo), 1);
                newItemInfo.level = mc.ItemStock.getItemLevel(this._equipment);
                if (this._actionType === mc.AddChangeOptionScreen.ACTION_TYPE.ADD) {
                    newItemInfo["optSkills"] = itemInfo["optSkills"];
                }
                var newItemView = new mc.ItemView(newItemInfo);
                newItemView.setNewScale(0.8);
                newItemView.registerTouchEvent(function () {
                    mc.createItemPopupDialog(newItemInfo).show();
                }.bind(this));
                this._nodeNewItem.addChild(newItemView);
                this._mapEnableSlotBySlotIndex[1] = true;
                this._nodeAsset.setVisible(true);
            }
            else {
                this._nodeAsset.setVisible(false);
                this._btnUpgrade.setGrayForAll(true);
            }
            this._mapEnableSlotBySlotIndex[2] = true;
        }
        else {
            this._nodeAsset.setVisible(false);
            this._btnUpgrade.setGrayForAll(true);
        }

        for (var slotIndex in this._mapParticleBySlotIndex) {
            if (this._mapEnableSlotBySlotIndex[slotIndex]) {
                var arrParticle = this._mapParticleBySlotIndex[slotIndex];
                for (var i = 0; i < arrParticle.length; i++) {
                    arrParticle[i].setVisible(true);
                }
            }
        }
    }
    ,

    _findEmptySlotView: function () {
        var slotView = null;
        for (var i = 0; i < this._arrSlot.length; i++) {
            if (!this._arrSlot[i].getUserData()) {
                slotView = this._arrSlot[i];
                break;
            }
        }
        return slotView;
    }
    ,
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
mc.AddChangeOptionScreen.ACTION_TYPE = {ADD: 1, CHANGE: 2};