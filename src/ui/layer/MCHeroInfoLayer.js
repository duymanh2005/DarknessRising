/**
 * Created by long.nguyen on 7/27/2017.
 */
mc.HeroInfoLayer = mc.LoadingLayer.extend({
    _mapViewBySlotId: null,
    _mapEquippingItemBySlotId: null,

    onLoading: function () {
        var self = this;
        var mapHeroInInFormation = mc.GameData.teamFormationManager.getMapHeroIdInFormation();
        var indexAttr = mc.GameData.guiState.getCurrentSortingHeroStockIndex();
        var arrHero = null;
        if (!arrHero) {
            arrHero = mc.GameData.heroStock.getHeroList();
            arrHero.sort(function (heroInfo1, heroInfo2) {
                var comp = mc.HeroStock.getHeroValueByAttr(heroInfo2, indexAttr, mapHeroInInFormation) - mc.HeroStock.getHeroValueByAttr(heroInfo1, indexAttr, mapHeroInInFormation);
                if (comp === 0) {
                    comp = mc.HeroStock.getHeroValueByAttr(heroInfo2, -1, mapHeroInInFormation) - mc.HeroStock.getHeroValueByAttr(heroInfo1, -1, mapHeroInInFormation);
                }
                return comp;
            });
        }
        var _updateNotify = function (heroWidget) {
            var heroId = mc.HeroStock.getHeroId(heroWidget.getUserData());
            var isNotify = false;
            var equipmentNotification = mc.GameData.notifySystem.getHeroEquipmentNotification();
            if (equipmentNotification) {
                isNotify = equipmentNotification[heroId] != null;
            }
            var involveNotification = mc.GameData.notifySystem.getHeroInvolveNotification();
            if (!isNotify && involveNotification) {
                isNotify = involveNotification[heroId] != null;
            }
            mc.view_utility.setNotifyIconForWidget(heroWidget, isNotify, 0.95, 0.99);
        };
        var arrHeroesWidgets = bb.collection.createArray(arrHero.length, function (index) {
            var heroInfo = arrHero[index];
            var widget = new mc.HeroAvatarView(heroInfo);
            widget.scale = 1.0;
            var heroId = mc.HeroStock.getHeroId(heroInfo);
            widget.heroId = heroId;
            if (heroId === mc.GameData.guiState.getViewHeroId()) {
                self.focusIndex = index;
            }

            widget.getReturnKey = function () {
                return this.heroId;
            }.bind(widget);

            var partInTeamId = mapHeroInInFormation[heroId];
            if (partInTeamId) {
                if (partInTeamId === mc.TeamFormationManager.TEAM_CAMPAIGN) {
                    widget.setStatusText("PartyCampaign", mc.color.GREEN_NORMAL);
                }
                else if (partInTeamId === mc.TeamFormationManager.TEAM_ATTACK_ARENA) {
                    widget.setStatusText("PartyArena", mc.color.YELLOW_ELEMENT);
                }
                else if (partInTeamId === mc.TeamFormationManager.TEAM_DEFENSE_ARENA) {
                    widget.setStatusText("PartyArena", mc.color.YELLOW_ELEMENT);
                }
                else if (partInTeamId === mc.TeamFormationManager.TEAM_CHAOSCASTLE) {
                    widget.setStatusText("PartyChaos", mc.color.VIOLET_ELEMENT);
                }
                else {
                    widget.setStatusText("Party");
                }
            }
            _updateNotify(widget);
            return widget;
        });

        var focus = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_focus_json, res.spine_ui_item_panel_focus_atlas, 1.0);
        focus.setName("itemFocus");
        focus.setScale(0.9, 0.9);
        focus.setAnimation(0, "focus_idle", true);
        // focus.setLocalZOrder(10);

        var layout = mc.widget_utility.createScrollNode(arrHeroesWidgets, focus, 137, cc.p(cc.winSize.width, 190), {
            clickFunc: function (id) {
                if (self._currHeroId != id) {
                    self._loadingHeroResById(id);
                }
            },
            autoFocusFunc: function (id) {
                if (self._currHeroId != id) {
                    self._loadingHeroResById(id);
                }
            }
        });
        layout.setLoopScroll(true, 5);
        layout.setAnchorPoint(0.5, 0.5);
        layout.setPosition(cc.winSize.width / 2, layout.height / 2);
        layout.focusAt(self.focusIndex || 0, true);
        layout.setLocalZOrder(9);
        this.addChild(layout);
        this._loadingHeroResById(mc.GameData.guiState.getViewHeroId());
        this.traceDataChange(mc.GameData.notifySystem, function () {
            for (var i = 0; i < arrHeroesWidgets.length; i++) {
                _updateNotify(arrHeroesWidgets[i]);
            }
        });
    },

    _loadingHeroResById: function (heroId) {
        this._currHeroId = heroId;
        mc.GameData.guiState.setCurrentViewHeroId(heroId);
        var viewHeroInfo = this._getViewHeroInfo();
        var arrRes = [];
        arrRes = mc.resource.getPreLoadSpineURL(mc.HeroStock.getHeroIndex(viewHeroInfo), arrRes);
        arrRes = mc.resource.getPreLoadSoundURL(mc.HeroStock.getHeroIndex(viewHeroInfo), arrRes);
        this.getMainScreen().loadMoreURL(arrRes, function () {
            this.performDone();
        }.bind(this));
    },

    _checkShowHeroUsefulDialog: function () {
        var newHeroes = mc.storage.readNewHeroes();
        if (newHeroes) {
            for (var i in newHeroes) {
                var heroId = this._currHeroId + "";
                if (i === heroId) {
                    delete  mc.storage.newHeroes[i];
                    mc.storage.saveNewHeroes();
                    var heroInfo = this._getViewHeroInfo();
                    new mc.HeroUsefulInfoDialog(heroInfo.index).show();
                    break;
                }
            }

        }
    },


    _loadHero: function () {
        this._rootNode && this._rootNode.removeFromParent();

        this._mapViewBySlotId = {};
        var itemStock = mc.GameData.itemStock;
        var notifySystem = mc.GameData.notifySystem;
        var viewHeroId = mc.GameData.guiState.getViewHeroId();
        this._currHeroId = viewHeroId;

        var viewHeroInfo = this._getViewHeroInfo();

        var root = this._rootNode = this.parseCCStudio(res.layer_hero_info);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = this._imgTitle = rootMap["imgTitle"];
        var nodeSpine = rootMap["nodeSpine"];
        var lblClass = this._lblClass = rootMap["lblClass"];
        var lblNumPower = this._lblNumDamage = rootMap["lblNumPower"];
        var panelInfo = this._panelInfo = rootMap["panelInfo"];
        var btnLeft = rootMap["btnLeft"];
        var btnRight = rootMap["btnRight"];
        btnRight && btnRight.removeFromParent();
        btnLeft && btnLeft.removeFromParent();
        var nodeSkillList = this._nodeSkillList = new cc.Node();
        nodeSkillList.setCascadeOpacityEnabled(true);
        panelInfo.addChild(nodeSkillList);

        var torch1 = new cc.ParticleSystem(res.particle_torch_plist);
        var torch2 = new cc.ParticleSystem(res.particle_torch_plist);
        torch1.scale = 0.3;
        torch1.x = cc.winSize.width * 0.205;
        torch1.y = mc.const.DEFAULT_HEIGHT * 0.8;
        torch2.scale = 0.3;
        torch2.x = cc.winSize.width * 0.81;
        torch2.y = mc.const.DEFAULT_HEIGHT * 0.8;
        root.addChild(torch1);
        root.addChild(torch2);

        var slotItem0 = rootMap["slotItem0"];
        var slotItem1 = rootMap["slotItem1"];
        var slotItem2 = rootMap["slotItem2"];
        var slotItem3 = rootMap["slotItem3"];
        var slotItem4 = rootMap["slotItem4"];
        var slotItem5 = rootMap["slotItem5"];
        this._mapViewBySlotId[mc.const.SLOT_TYPE_WEAPON] = slotItem0;
        this._mapViewBySlotId[mc.const.SLOT_TYPE_WEAPONSHIELD] = slotItem1;
        this._mapViewBySlotId[mc.const.SLOT_TYPE_AMOR] = slotItem2;
        this._mapViewBySlotId[mc.const.SLOT_TYPE_CHARM] = slotItem3;
        this._mapViewBySlotId[mc.const.SLOT_TYPE_RING] = slotItem4;
        this._mapViewBySlotId[mc.const.SLOT_TYPE_ELEMENTAL] = slotItem5;
        this._mapEquippingItemBySlotId = {};

        this._MAP_SLOT_URL = {};
        this._MAP_SLOT_URL[mc.const.SLOT_TYPE_WEAPON] = "patch9/Weapon.png";
        this._MAP_SLOT_URL[mc.const.SLOT_TYPE_WEAPONSHIELD] = "patch9/Shield.png";
        this._MAP_SLOT_URL[mc.const.SLOT_TYPE_AMOR] = "patch9/Armor.png";
        this._MAP_SLOT_URL[mc.const.SLOT_TYPE_CHARM] = "patch9/Necklace.png";
        this._MAP_SLOT_URL[mc.const.SLOT_TYPE_RING] = "patch9/Ring.png";
        this._MAP_SLOT_URL[mc.const.SLOT_TYPE_ELEMENTAL] = "patch9/Element.png";
        //load slot.
        for (var slot in this._mapViewBySlotId) {
            cc.log("load slot **********");
            var img = new ccui.ImageView(this._MAP_SLOT_URL[slot], ccui.Widget.PLIST_TEXTURE);
            img.setName("item");
            this._mapViewBySlotId[slot].addChild(img);
        }

        var panelInfoMap = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });

        var btnLvlUp = this._btnLvlUp = rootMap["btnLvlUp"];
        var btnEvolve = this._btnEvolve = rootMap["btnEvolve"];
        var lblLevel = this._lblLevel = panelInfoMap["lblLevel"];
        var lblExp = this._lblExp = panelInfoMap["lblExp"];
        var lblName = panelInfoMap["lblName"];
        var progressExp = this._progressExp = panelInfoMap["progressExp"];
        var nodeElement = panelInfoMap["nodeElement"];
        var lblAtk = panelInfoMap["lblAtk"];
        var lblMag = panelInfoMap["lblMag"];
        var lblSpd = panelInfoMap["lblSpd"];
        var lblHp = panelInfoMap["lblHp"];
        var lblDef = panelInfoMap["lblDef"];
        var lblRes = panelInfoMap["lblRes"];
        var lblNumAtk = this._lblNumAtk = panelInfoMap["lblNumAtk"];
        var lblNumHp = this._lblNumHp = panelInfoMap["lblNumHp"];
        var lblNumDef = this._lblNumDef = panelInfoMap["lblNumDef"];
        var lblNumRes = this._lblNumRes = panelInfoMap["lblNumRes"];
        var lblNumSpd = this._lblNumSpd = panelInfoMap["lblNumSpd"];
        var lblNumMag = this._lblNumMag = panelInfoMap["lblNumMag"];

        lblLevel.setColor(mc.color.YELLOW);
        lblAtk.setColor(mc.color.BLUE);
        lblHp.setColor(mc.color.BLUE);
        lblDef.setColor(mc.color.BLUE);
        lblRes.setColor(mc.color.BLUE);
        lblMag.setColor(mc.color.BLUE);
        lblSpd.setColor(mc.color.BLUE);

        btnLvlUp.setString(mc.dictionary.getGUIString("lblLevelUp"), null, mc.const.FONT_SIZE_32);
        btnEvolve.setString(mc.dictionary.getGUIString("lblEvolve"), null, mc.const.FONT_SIZE_32);

        lblName.setString(mc.HeroStock.getHeroName(viewHeroInfo));
        lblName.setColor(mc.color.ELEMENTS[mc.HeroStock.getHeroElement(viewHeroInfo)]);
        nodeElement.addChild(mc.view_utility.createHeroCrystalView(viewHeroInfo));
        nodeElement.scale = 1.35;

        var recipe = mc.dictionary.getRecipeInvolveHeroByParam(mc.HeroStock.getHeroClassGroup(viewHeroInfo), mc.HeroStock.getHeroRank(viewHeroInfo) + 1, mc.HeroStock.getHeroElement(viewHeroInfo));
        btnEvolve.setGray(!recipe || !mc.HeroStock.isHeroInvolve(viewHeroInfo));

        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblHeroInfo"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        cc.log("*********** create spine view hero");
        var spineHeroView = this._spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(viewHeroInfo));
        spineHeroView.scale = 1.4;
        spineHeroView.setClickAble(true, undefined, viewHeroInfo);
        nodeSpine.addChild(spineHeroView);

        var heroMaxRank = mc.HeroStock.getHeroMaxRank(viewHeroInfo);
        var layoutStar = null;
        if(heroMaxRank >= 6){
            layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(heroMaxRank - 5, function (index) {
                if (index < mc.HeroStock.getHeroRank(viewHeroInfo)) {
                    return new ccui.ImageView("icon/star_purple_small.png", ccui.Widget.PLIST_TEXTURE);
                }
                return new ccui.ImageView("icon/Disable_Star.png", ccui.Widget.PLIST_TEXTURE);
            }), 0);
        }else{
            layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(heroMaxRank, function (index) {
                if (index < mc.HeroStock.getHeroRank(viewHeroInfo)) {
                    return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
                }
                return new ccui.ImageView("icon/Disable_Star.png", ccui.Widget.PLIST_TEXTURE);
            }), 0);
        }
        layoutStar.setCascadeOpacityEnabled(true);
        layoutStar.setCascadeColorEnabled(true);
        layoutStar.scale = 0.75;
        layoutStar.y = -45;
        nodeSpine.addChild(layoutStar);
        cc.log("******* get map equipment by hero");
        var mapEquipping = itemStock.getMapEquippingItemByHeroId(mc.HeroStock.getHeroId(viewHeroInfo));
        btnLvlUp.registerTouchEvent(function () {
            var viewHeroInfo = this._getViewHeroInfo();
            if (mc.HeroStock.isHeroMaxLevel(viewHeroInfo)) {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtHeroMaxLv"));
            }
            else {
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_LEVEL_UP_HERO);
            }
        }.bind(this));
        btnEvolve.registerTouchEvent(function () {
            var viewHeroInfo = this._getViewHeroInfo();
            if (mc.HeroStock.isHeroMaxRank(viewHeroInfo)) {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtHeroMaxRank"));
            }
            else {
                mc.GUIFactory.showInvolveHeroScreen(mc.HeroStock.getHeroId(viewHeroInfo));
            }
        }.bind(this));
        for (var slot in this._mapViewBySlotId) {
            if (mapEquipping && mapEquipping[slot]) {
                this._pickItem(slot, mapEquipping[slot]);
            }
            else {
                this._registerSlotTouchEvent(slot);
            }
        }

        var _updateEquipmentNotify = function () {
            var notifySlot = null;
            var equipmentNotification = notifySystem.getHeroEquipmentNotification();
            if (equipmentNotification) {
                notifySlot = equipmentNotification[mc.HeroStock.getHeroId(viewHeroInfo)];
            }
            for (var slotId in this._mapViewBySlotId) {
                var slotWidget = this._mapViewBySlotId[slotId];
                var child = slotWidget.getChildByName("item");
                if (child) {
                    mc.view_utility.setNotifyIconForWidget(child, notifySlot != null && notifySlot[slotId] != null, 0.95, 0.99);
                }
            }
        }.bind(this);
        var _updateInvolveUpNotify = function () {
            var isNotifyInvolve = false;
            var involveNotification = notifySystem.getHeroInvolveNotification();
            if (!isNotifyInvolve && involveNotification) {
                isNotifyInvolve = involveNotification[mc.HeroStock.getHeroId(viewHeroId)] != null;
            }
            mc.view_utility.setNotifyIconForWidget(this._btnEvolve, isNotifyInvolve, 0.95, 0.99);
        }.bind(this);

        _updateEquipmentNotify();
        _updateInvolveUpNotify();
        this.traceDataChange(notifySystem, function () {
            _updateEquipmentNotify();
            _updateInvolveUpNotify();
        }.bind(this));

        var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.icon_book_json, res.icon_book_atlas, 1.0);
        iconAnimate.setLocalZOrder(1);
        iconAnimate.setAnimation(0, "idle", true);

        var touchLayout = new ccui.Layout();
        touchLayout.anchorX = touchLayout.anchorY = 0.5;
        touchLayout.width = 100;
        touchLayout.height = 100;
        touchLayout.y = 25;

        touchLayout.registerTouchEvent(function () {
            var heroInfo = this._getViewHeroInfo();
            new mc.HeroUsefulInfoDialog(heroInfo.index).show();

        }.bind(this));

        touchLayout.x = imgTitle.x + imgTitle.width;
        touchLayout.y = imgTitle.y + 5;

        iconAnimate.x = touchLayout.width * 0.5;
        iconAnimate.y = touchLayout.height * 0.5;
        touchLayout.addChild(iconAnimate);
        root.addChild(touchLayout);
        var timeDuration = 0.5;
        touchLayout.runAction(cc.sequence([cc.moveBy(timeDuration, 0, 10), cc.moveBy(timeDuration, 0, -10)]).repeatForever());

        this._updateHeroAttr();
        this._loadSkillList();
    },

    onLoadDone: function (parseNode) {
        this._loadHero();
        this._checkShowHeroUsefulDialog();
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_HERO_INFO);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_EQUIP_ITEM_SLOT) {
                var slotId = tutorialTrigger.param;
                if (slotId) {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(this._mapViewBySlotId[slotId].getChildByName("item"))
                        .setCharPositionY(cc.winSize.height * 0.4)
                        .show();
                }
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_LVUP_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnLvlUp)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON &&
                tutorialTrigger.param === "evolve") {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnEvolve)
                    .setCharPositionY(cc.winSize.height * 0.7)
                    .show();
            }
        }
    },

    onLayerClearStack: function () {
        this._spineView.unloadAllEffectSound();
    },

    _getViewHeroInfo: function () {
        return mc.GameData.heroStock.getHeroById(this._currHeroId);
    },

    _loadSkillList: function () {
        var _clickSkillInfo = function (widget) {
            var skillInfo = widget.getUserData();
            new mc.SkillInfoDialog(this._currHeroId, mc.HeroStock.getSkillIndexOfHero(skillInfo), function () {
                this._updateHeroAttr();
                this._loadSkillList();
                this._lblNumDamage.setString(bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(this._getViewHeroInfo())));
            }.bind(this)).show();
        }.bind(this);

        var arrPos = [
            cc.p(111.46, 85), cc.p(268.89, 85), cc.p(432.96, 85), cc.p(588.96, 85)
        ];
        this._nodeSkillList.removeAllChildren();
        var heroInfo = this._getViewHeroInfo();
        var skillList = mc.HeroStock.getHeroSkillList(heroInfo);
        skillList.sort(function (skillInfo1, skillInfo2) {
            return mc.HeroStock.getSkillPriorityOfHero(skillInfo2) - mc.HeroStock.getSkillPriorityOfHero(skillInfo1);
        });
        var arrSkillWidget = [];
        var slotIndex = 0;
        if (skillList && skillList.length > 0) {
            for (var i = 0; i < skillList.length; i++) {
                var skillWidget = mc.view_utility.createSkillInfoIcon(skillList[i]);
                var skillDict = mc.dictionary.getSkillByIndex(skillList[i].index);
                skillWidget.registerTouchEvent(_clickSkillInfo, _clickSkillInfo);
                skillWidget.x = arrPos[i].x;
                skillWidget.y = arrPos[i].y;
                if (skillDict.skillType != mc.const.SKILL_TYPE_LEADER) {
                    var nextSkillIndex = mc.HeroStock.getSkillUpgradeOf(skillList[i]);
                    if (nextSkillIndex && nextSkillIndex > 0) {
                        var sphere = mc.HeroStock.getHeroSphere(heroInfo);
                        var numSphere = sphere ? mc.ItemStock.getItemQuantity(sphere) : 0;
                        var requireSphere = mc.HeroStock.getSkillUpgradePointOfHero(mc.dictionary.getSkillByIndex(nextSkillIndex));
                        var plusBtn = new ccui.ImageView("button/btn_cross.png", ccui.Widget.PLIST_TEXTURE);
                        plusBtn.scale = 0.8;
                        plusBtn.x = skillWidget.width - plusBtn.width * 0.5;
                        plusBtn.y = plusBtn.height * 0.5;
                        skillWidget.addChild(plusBtn);
                        if (numSphere >= requireSphere) {
                            mc.view_utility.setNotifyIconForWidget(skillWidget, true, 0.96, 0.96);
                        }
                    }
                }
                this._nodeSkillList.addChild(skillWidget);
                arrSkillWidget.push(skillWidget);
                slotIndex++;
            }
        }
        while (arrSkillWidget.length < 4) {
            var widget = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
            widget.setUserData(slotIndex++);
            widget.registerTouchEvent(function (widget) {
                var index = widget.getUserData();
                if (index === 1) {
                    mc.view_utility.showSuggestText(cc.formatStr(mc.dictionary.getGUIString("lblRequireXStarHero"), 3));
                }
                else if (index === 2) {
                    mc.view_utility.showSuggestText(cc.formatStr(mc.dictionary.getGUIString("lblRequireXStarHero"), 4));
                }
                else if (index === 3) {
                    mc.view_utility.showSuggestText(cc.formatStr(mc.dictionary.getGUIString("lblRequireXStarHero"), 5));
                }
            }.bind(this));
            widget.x = arrPos[arrSkillWidget.length].x;
            widget.y = arrPos[arrSkillWidget.length].y;
            this._nodeSkillList.addChild(widget);
            arrSkillWidget.push(widget);
        }
    },

    _updateHeroAttr: function () {
        var lblLevel = this._lblLevel;
        var lblExp = this._lblExp;
        var progressExp = this._progressExp;
        var lblNumAtk = this._lblNumAtk;
        var lblNumHP = this._lblNumHp;
        var lblNumDef = this._lblNumDef;
        var lblNumRes = this._lblNumRes;
        var lblNumSpd = this._lblNumSpd;
        var lblNumMag = this._lblNumMag;
        var lblNumPower = this._lblNumDamage;
        var lblClass = this._lblClass;

        lblNumAtk.removeAllChildren();
        lblNumHP.removeAllChildren();
        lblNumDef.removeAllChildren();
        lblNumRes.removeAllChildren();
        lblNumSpd.removeAllChildren();
        lblNumMag.removeAllChildren();

        var heroInfo = this._getViewHeroInfo();
        var passiveAttr = mc.HeroStock.getPassiveSkillValueAttr(heroInfo);
        var equipAtk = mc.HeroStock.getItemEquippingValue(heroInfo, "atk") + passiveAttr["atk"];
        var equipMag = mc.HeroStock.getItemEquippingValue(heroInfo, "mag") + passiveAttr["mag"];
        var equipHp = mc.HeroStock.getItemEquippingValue(heroInfo, "hp") + passiveAttr["hp"];
        var equipDef = mc.HeroStock.getItemEquippingValue(heroInfo, "def") + passiveAttr["def"];
        var equipRes = mc.HeroStock.getItemEquippingValue(heroInfo, "res") + passiveAttr["res"];
        var equipSpd = mc.HeroStock.getItemEquippingValue(heroInfo, "spd") + passiveAttr["spd"];

        var exp = mc.HeroStock.getHeroExp(heroInfo);
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + cc.formatStr("%d/%d", mc.HeroStock.getHeroLevel(heroInfo), mc.HeroStock.getHeroMaxLevel(heroInfo)));
        if (exp.total < 0 || mc.HeroStock.isHeroMaxLevel(heroInfo)) {
            lblExp.setString(mc.dictionary.getGUIString("lblMax"));
            lblExp.setColor(mc.color.GREEN_NORMAL);
            progressExp.setPercent(100);
        }
        else {
            lblExp.setString(bb.utility.formatNumber(exp.curr) + "/" + bb.utility.formatNumber(exp.total));
            progressExp.setPercent((exp.curr / exp.total) * 100);
        }
        lblNumAtk.setString(bb.utility.formatNumber(mc.HeroStock.getHeroAttack(heroInfo)));
        equipAtk > 0 && lblNumAtk.setDecoratorLabel("+" + bb.utility.formatNumber(equipAtk), mc.color.GREEN);
        lblNumHP.setString(bb.utility.formatNumber(mc.HeroStock.getHeroHp(heroInfo)));
        equipHp > 0 && lblNumHP.setDecoratorLabel("+" + bb.utility.formatNumber(equipHp), mc.color.GREEN);
        lblNumDef.setString(bb.utility.formatNumber(mc.HeroStock.getHeroDefense(heroInfo)));
        equipDef > 0 && lblNumDef.setDecoratorLabel("+" + bb.utility.formatNumber(equipDef), mc.color.GREEN);
        lblNumRes.setString(bb.utility.formatNumber(mc.HeroStock.getHeroResistant(heroInfo)));
        equipRes > 0 && lblNumRes.setDecoratorLabel("+" + bb.utility.formatNumber(equipRes), mc.color.GREEN);
        lblNumMag.setString(bb.utility.formatNumber(mc.HeroStock.getHeroMagic(heroInfo)));
        equipMag > 0 && lblNumMag.setDecoratorLabel("+" + bb.utility.formatNumber(equipMag), mc.color.GREEN);
        lblNumSpd.setString(bb.utility.formatNumber(mc.HeroStock.getHeroSpeed(heroInfo)));
        equipSpd > 0 && lblNumSpd.setDecoratorLabel("+" + bb.utility.formatNumber(equipSpd), mc.color.GREEN);
        lblNumPower.setString(bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(heroInfo)));
        lblClass.setString(mc.HeroStock.getHeroBattleRole(heroInfo));

    },

    _getSlotIgnoreTwoHanded: function () {
        return "2";
    },

    _showEquipStockByType: function (equipType) {
        //if (equipType === "6") {
        //    cc.log("-------- show item 6");
        //    mc.view_utility.showComingSoon();
        //    return;
        //}
        var self = this;

        var heroInfo = this._getViewHeroInfo();
        var _takeOn = function (itemInfo) {
            var loadingDialogId = mc.view_utility.showLoadingDialog();
            mc.protocol.submitHeroTakeOnItem(mc.HeroStock.getHeroId(heroInfo), mc.ItemStock.getItemId(itemInfo), parseInt(equipType),
                function (equipInfo) {
                    if (equipInfo) {
                        mc.view_utility.hideLoadingDialogById(loadingDialogId);
                        self._pickItem(equipInfo.slotIndex, equipInfo.itemInfo);
                        bb.sound.playEffect(res.sound_ui_equip_on);
                        self._updateHeroAttr();


                    }
                });
        };

        new mc.EquipmentStockDialog().setTravelItemCb(function (itemWidget, itemInfo) {
            if (mc.ItemStock.getHeroIdEquipping(itemWidget.getUserData()) != null) {
                itemWidget.setStatusText(mc.dictionary.getGUIString("lblPicked"));
            }
            if (mc.HeroStock.getHeroRank(heroInfo) < mc.ItemStock.getItemRequireHeroRank(itemWidget.getUserData())) {
                var lbl = itemWidget.setStatusText(mc.dictionary.getGUIString("lblRequireHeroRankForItem") + mc.ItemStock.getItemRequireHeroRank(itemWidget.getUserData()));
                lbl.setColor(mc.color.RED);
            }
            var equipNotification = mc.GameData.notifySystem.getHeroEquipmentNotification();
            if (equipNotification && equipNotification[self._currHeroId] && equipNotification[self._currHeroId][equipType]) {
                mc.view_utility.setNotifyIconForWidget(itemWidget, true, 0.95, 0.99);
            }
        }).setFilterForHero(heroInfo, equipType, function (itemView) {
            var itemInfo = itemView.getUserData();
            var slotIgnoreTwoHanded = self._getSlotIgnoreTwoHanded();
            var isTakeOffSlotIgnore = mc.ItemStock.isTwoHand(itemInfo) && self._mapEquippingItemBySlotId[slotIgnoreTwoHanded] != null;
            if (isTakeOffSlotIgnore) {
                var itemOfIgnoreSlot = self._mapEquippingItemBySlotId[slotIgnoreTwoHanded];
                var loadingDialogId = mc.view_utility.showLoadingDialog();
                mc.protocol.submitHeroTakeOffItem(mc.HeroStock.getHeroId(heroInfo), mc.ItemStock.getItemId(itemOfIgnoreSlot), function (unequipInfo) {
                    mc.view_utility.hideLoadingDialogById(loadingDialogId);
                    self._unpickItem(unequipInfo.slotIndex, unequipInfo.itemInfo);
                    _takeOn(itemInfo);
                });
                mc.GameData.tutorialManager.submitTutorialDoneById(mc.TutorialManager.ID_EQUIP_ITEM);
            }
            else {
                _takeOn(itemInfo);
            }
        }).show();
    },

    _registerSlotTouchEvent: function (slot) {
        var self = this;

        var _clickSlot = function (widget) {
            var slot = widget.getUserData();
            self._showEquipStockByType(slot);
        };

        this._mapViewBySlotId[slot].getChildByName("item").registerTouchEvent(_clickSlot, _clickSlot);
        this._mapViewBySlotId[slot].getChildByName("item").setUserData(slot);
    },

    _pickItem: function (slot, itemInfo) {
        var self = this;
        var _clickItem = function (itemView) {
            mc.createItemPopupDialog(itemView.getUserData()).registerUnEquipping(mc.HeroStock.getHeroId(this._getViewHeroInfo()), function (unequipInfo) {
                unequipInfo && self._unpickItem(unequipInfo.slotIndex, unequipInfo.itemInfo);
            }).registerShowItemBag(mc.HeroStock.getHeroId(this._getViewHeroInfo()), function () {
                self._showEquipStockByType(slot);
            }).show();
        }.bind(this);

        var slotIgnoreTwoHanded = self._getSlotIgnoreTwoHanded();
        var slotNode = this._mapViewBySlotId[slot];
        slotNode.removeAllChildren();

        var itemView = new mc.ItemView(itemInfo);
        itemView.scale = 0.75;
        itemView.setName("item");
        itemView.registerTouchEvent(_clickItem, _clickItem);
        slotNode.addChild(itemView);
        if (mc.ItemStock.isTwoHand(itemInfo)) {
            var slot2Widget = self._mapViewBySlotId[slotIgnoreTwoHanded].getChildByName("item");
            slot2Widget && slot2Widget.setGray && slot2Widget.setGray(true);
        }
        this._mapEquippingItemBySlotId[slot] = itemInfo;
        cc.log("***************** Show item info");
        cc.log(itemInfo);
        if(slot == 6){
            var skillByEquipmentIndex = mc.dictionary.getSkillByEquipmentIndex(itemInfo.index);
            var statusImage = mc.HeroStock.getSkillStatusResource({index: skillByEquipmentIndex});
            if (statusImage) {
                var strs = statusImage.split('.');
                if (!strs[1] || strs[1] === "json") {
                    var name = strs[0];
                    var strPrefixSpine = "res/spine/battle_effect/" + name;
                    this._spineView.showPet(strPrefixSpine, name);
                }
            }
        }
    },

    _unpickItem: function (slot, itemInfo) {
        var self = this;
        self._mapViewBySlotId[slot].removeAllChildren();
        self._mapEquippingItemBySlotId[slot] = null;
        var img = new ccui.ImageView(this._MAP_SLOT_URL[slot], ccui.Widget.PLIST_TEXTURE);
        img.setName("item");
        this._mapViewBySlotId[slot].addChild(img);
        self._registerSlotTouchEvent(slot);
        if (mc.ItemStock.isTwoHand(itemInfo)) {
            var slot2Widget = self._mapViewBySlotId[self._getSlotIgnoreTwoHanded()].getChildByName("item");
            slot2Widget && slot2Widget.setGray && slot2Widget.setGray(false);
        }
        self._updateHeroAttr();
        bb.sound.playEffect(res.sound_ui_equip_off);

        if(slot == 6){
            self._spineView.releasePet();
        }

    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_HERO_INFO;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }
});

mc.ConfirmEquipmentDialog = mc.DefaultDialogType2.extend({

    ctor: function (itemInfo, heroId, callback, data) {
        this._super(mc.dictionary.getGUIString("lblInfo"));
        this._itemInfo = itemInfo;
        var numGold = mc.const.NUM_GOLD_UNEQUIP_ITEM_FOR_RANK[mc.ItemStock.getItemRank(itemInfo)];

        var lblConfirm = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtDoUWantEquipThisItem"));
        var assetBuy = mc.view_utility.createAssetView(mc.ItemStock.createJsonItemZen(numGold));
        var itemView = new mc.ItemView(itemInfo);
        var containerItem = new ccui.Layout();
        containerItem.anchorX = containerItem.anchorY = 0.5;
        containerItem.addChild(assetBuy);
        containerItem.addChild(itemView);
        containerItem.width = 200;
        containerItem.height = itemView.height + assetBuy.height;
        assetBuy.x = itemView.x = containerItem.width * 0.5;
        assetBuy.y = assetBuy.height * 0.5;
        itemView.y = assetBuy.height + itemView.height * 0.5;

        var layout = this.layoutItem = bb.layout.linear([containerItem, lblConfirm], 25, bb.layout.LINEAR_VERTICAL);
        this.setContentView(layout, {
            left: 30,
            right: 30
        });
        containerItem.x = lblConfirm.x = layout.width * 0.5;
        this.enableYesNoButton(function () {
            this.close();
            callback && callback(data);
        }.bind(this));
        this.getButton1().setGray(numGold > mc.GameData.playerInfo.getZen());
    },

    registerShowHeroEquip: function (noneViewing) {
        var heroId = mc.ItemStock.getHeroIdEquipping(this._itemInfo);
        var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
        if (heroInfo) {
            var heroAvtView = new mc.HeroAvatarView(heroInfo);
            heroAvtView._touchScale = -0.05;
            heroAvtView.scale = 0.75;
            heroAvtView.setVisibleSurfaceInfo(false);
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
            heroAvtView.setPosition(this.width * 0.21, this.height * 0.645);
            this.addChild(heroAvtView);
        }
        return this;
    }

});