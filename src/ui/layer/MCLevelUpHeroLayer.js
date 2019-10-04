/**
 * Created by long.nguyen on 8/9/2017.
 */
mc.LevelUpHeroLayer = mc.MainBaseLayer.extend({
    _mapPickItemById: null,
    _mapPickWidgetById: null,
    _currLvlToUp: -1,

    ctor: function (parseNode) {
        this._super();

        var lvlUpController = mc.GameData.guiController.lvlUp;
        lvlUpController.mapPickQuantityItemById = {};
        this._mapPickItemById = {};
        this._mapPickWidgetById = {};
        var self = this;
        var playerInfo = mc.GameData.playerInfo;
        var viewHeroId = mc.GameData.guiState.getViewHeroId();
        this._currHeroId = viewHeroId;
        var currHeroInfo = this._getViewHeroInfo();

        var root = this.parseCCStudio(parseNode || res.layer_level_up_hero);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var imgTitle = rootMap["imgTitle"];
        var nodeSpine = this._nodeSpine = rootMap["nodeSpine"];
        var btnInfo = rootMap["btnInfo"];
        var panelInfo = rootMap["panelInfo"];
        var panelItem = this._panelItem = rootMap["panelItem"];
        var panelInfoMap = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });

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


        var nodeAvt = panelInfoMap["nodeAvt"];
        var tabStats = panelInfoMap["tabStats"];
        var tabSkill = panelInfoMap["tabSkill"];
        var lblLevel = this._lblLevel = panelInfoMap["lblLevel"];
        var lblExp = this._lblExp = panelInfoMap["lblExp"];
        var imgProgress = panelInfoMap["imgProgress"];
        var progressExp = this._progressExp = new cc.ProgressTimer(new cc.Sprite("#bar/EXP_gauge.png"));
        progressExp.barChangeRate = cc.p(1.0, 0.0);
        progressExp.midPoint = cc.p(0.0, 1.0);
        progressExp.type = cc.ProgressTimer.TYPE_BAR;
        var newProgressExp = this._newProgressExp = new cc.ProgressTimer(new cc.Sprite("#bar/EXP_gauge.png"));
        newProgressExp.barChangeRate = cc.p(1.0, 0.0);
        newProgressExp.midPoint = cc.p(0.0, 1.0);
        newProgressExp.type = cc.ProgressTimer.TYPE_BAR;
        newProgressExp.setColor(cc.hexToColor("#008000"));
        progressExp.scaleX = newProgressExp.scaleX = 1.14;
        progressExp.width = newProgressExp.width = imgProgress.width;
        progressExp.x = newProgressExp.x = imgProgress.width * 0.575;
        progressExp.y = newProgressExp.y = imgProgress.height * 0.5;
        imgProgress.addChild(newProgressExp);
        imgProgress.addChild(progressExp);
        var lblNumAtk = this._lblNumAtk = panelInfoMap["lblNumAtk"];
        var lblNumHp = this._lblNumHp = panelInfoMap["lblNumHp"];
        var lblNumDef = this._lblNumDef = panelInfoMap["lblNumDef"];
        var lblNumRes = this._lblNumRes = panelInfoMap["lblNumRes"];
        var lblNumMag = this._lblNumMag = panelInfoMap["lblNumMag"];
        var lblNumSpd = this._lblNumSpd = panelInfoMap["lblNumSpd"];
        var lblAtk = panelInfoMap["lblAtk"];
        var lblHp = panelInfoMap["lblHp"];
        var lblRes = panelInfoMap["lblRes"];
        var lblDef = panelInfoMap["lblDef"];
        var lblMag = panelInfoMap["lblMag"];
        var lblSpd = panelInfoMap["lblSpd"];
        var iconArrowLv = this._iconArrowLv = panelInfoMap["iconArrowLv"];
        var iconArrowAtk = this._iconArrowAtk = panelInfoMap["iconArrowAtk"];
        var iconArrowDef = this._iconArrowDef = panelInfoMap["iconArrowDef"];
        var iconArrowHp = this._iconArrowHp = panelInfoMap["iconArrowHp"];
        var iconArrowRes = this._iconArrowRes = panelInfoMap["iconArrowRes"];
        var iconArrowMag = this._iconArrowMag = panelInfoMap["iconArrowMag"];
        var iconArrowSpd = this._iconArrowSpd = panelInfoMap["iconArrowSpd"];
        var lblIncreaseLevel = this._lblIncreaseLevel = panelInfoMap["lblIncreaseLevel"];
        var lblIncreaseAtk = this._lblIncreaseAtk = panelInfoMap["lblIncreaseAtk"];
        var lblIncreaseHp = this._lblIncreaseHp = panelInfoMap["lblIncreaseHp"];
        var lblIncreaseRes = this._lblIncreaseRes = panelInfoMap["lblIncreaseRes"];
        var lblIncreaseDef = this._lblIncreaseDef = panelInfoMap["lblIncreaseDef"];
        var lblIncreaseMag = this._lblIncreaseMag = panelInfoMap["lblIncreaseMag"];
        var lblIncreaseSpd = this._lblIncreaseSpd = panelInfoMap["lblIncreaseSpd"];
        var lblMaxLevel = this._lblMaxLevel = panelInfoMap["lblMaxLevel"];
        var nodeEquipExp = panelInfoMap["nodeEquipExp"];

        var lblAccquiredExp = panelInfoMap["lblAccquiredExp"];
        var lblZen = panelInfoMap["lblZen"];
        var lblNumAccquiredExp = this._lblNumAccquiredExp = panelInfoMap["lblNumAccquiredExp"];
        var lblNumZen = this._lblNumZen = panelInfoMap["lblNumZen"];
        var btnUpgrade = this._btnUpgrade = panelInfoMap["btnUpgrade"];

        btnUpgrade.setString(mc.dictionary.getGUIString("lblUpgrade"));
        imgTitle._maxLblWidth = imgTitle.width - 100;
        var lblTitle = imgTitle.setString(mc.HeroStock.getHeroName(currHeroInfo), res.font_UTMBienvenue_none_32_export_fnt);
        if (lblTitle) {
            lblTitle.y = imgTitle.height * 0.65;
        }

        lblLevel.setColor(mc.color.YELLOW);
        lblIncreaseLevel.setColor(mc.color.YELLOW);
        lblMaxLevel.setColor(mc.color.YELLOW);
        lblNumAccquiredExp.setColor(mc.color.BLUE);
        lblAtk.setColor(mc.color.BLUE);
        lblHp.setColor(mc.color.BLUE);
        lblRes.setColor(mc.color.BLUE);
        lblDef.setColor(mc.color.BLUE);
        lblMag.setColor(mc.color.BLUE);
        lblSpd.setColor(mc.color.BLUE);
        lblIncreaseAtk.setColor(mc.color.GREEN);
        lblIncreaseHp.setColor(mc.color.GREEN);
        lblIncreaseDef.setColor(mc.color.GREEN);
        lblIncreaseRes.setColor(mc.color.GREEN);
        lblIncreaseMag.setColor(mc.color.GREEN);
        lblIncreaseSpd.setColor(mc.color.GREEN);
        lblNumZen.setColor(mc.color.YELLOW);

        var spineView = this._spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(currHeroInfo));
        spineView.scale = 1.4;
        spineView.setClickAble(true, undefined, currHeroInfo);
        nodeSpine.addChild(spineView);
        nodeAvt.addChild(new mc.HeroAvatarView(currHeroInfo).setVisibleSurfaceInfo(false));

        var layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(mc.HeroStock.getHeroRank(currHeroInfo), function (index) {
            return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
        }), 0);
        layoutStar.setCascadeOpacityEnabled(true);
        layoutStar.setCascadeColorEnabled(true);
        layoutStar.scale = 0.75;
        layoutStar.y = -45;
        nodeSpine.addChild(layoutStar);

        var layoutSlot = this._layoutSlot = bb.layout.grid(bb.collection.createArray(10, function (index) {
            var equipBtn = new ccui.ImageView("button/Cross_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
            equipBtn.scale = 0.9;
            equipBtn.registerTouchEvent(function (widget) {
                if (mc.HeroStock.isHeroMaxLevel(self._getViewHeroInfo())) {
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtHeroMaxLv"));
                }
                else {
                    var arrMaterialItem = mc.GameData.itemStock.getItemList(function (itemInfo) {
                        return mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_HERO_MATERIAL;
                    });
                    var arrLvlUpItem = mc.ItemStock.splitForArrayQuantity(arrMaterialItem);
                    var heroMap = mc.GameData.heroStock.getHeroMap();
                    var arrHeroSoul = [];
                    var idGenerator = 0;
                    for (var heroId in heroMap) {
                        var heroInfo = heroMap[heroId];
                        if (self._currHeroId != mc.HeroStock.getHeroId(heroInfo)) {
                            var teamFormationManager = mc.GameData.teamFormationManager;
                            var role = teamFormationManager.getRoleInFormationByHeroId(mc.HeroStock.getHeroId(heroInfo), mc.TeamFormationManager.TEAM_CAMPAIGN, 0);
                            if (!role) {
                                role = teamFormationManager.getRoleInFormationByHeroId(mc.HeroStock.getHeroId(heroInfo), mc.TeamFormationManager.TEAM_ATTACK_ARENA, 0);
                            }
                            if (!role) {
                                arrHeroSoul.push(mc.ItemStock.createJsonItemHeroSoul("heroSoul_" + (idGenerator++), heroInfo));
                            }
                        }
                    }
                    new mc.MultiSelectingMaterialLevelUp(arrLvlUpItem, arrHeroSoul, function (itemView) {
                        if (self._mapPickItemById[mc.ItemStock.getItemId(itemView.getUserData())]) {
                            itemView.setStatusText(mc.dictionary.getGUIString("lblPicked"));
                        }
                    }, function (itemView) {
                        var lvlUpController = mc.GameData.guiController.lvlUp;
                        var consumableItem = itemView.getUserData();
                        if (self._mapPickItemById[mc.ItemStock.getItemId(consumableItem)]) {
                            itemView.setStatusText("");
                            self._unpickConsumableItem(mc.ItemStock.getItemId(consumableItem));
                        }
                        else {
                            var canPick = true;
                            var heroInfo = mc.GameData.heroStock.getHeroById(lvlUpController.heroId);
                            if (lvlUpController.nextLv >= mc.const.MAX_HERO_LEVEL_BY_RANK[mc.HeroStock.getHeroRank(heroInfo)]) {
                                canPick = false;
                            }
                            if (canPick) {
                                if (!self._isContainConsumableItem(widget)) {
                                    self._pickConsumableItem(widget, consumableItem);
                                }
                                else {
                                    var emptySlot = self._findEmptySlot();
                                    if (emptySlot) {
                                        self._pickConsumableItem(emptySlot, consumableItem);
                                    }
                                    canPick = emptySlot != null;
                                }
                                if (canPick) {
                                    itemView.setStatusText("Picked");
                                }
                                else {
                                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtFullLvlUpSlot"));
                                }
                            }
                            else {
                                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtHeroMaxLv"));
                            }
                        }
                    }).show();
                }
            });
            equipBtn.setName(index);
            return equipBtn;
        }), 5, panelInfo.width - 20);
        layoutSlot.setCascadeOpacityEnabled(true);
        layoutSlot.setCascadeColorEnabled(true);
        nodeEquipExp.addChild(layoutSlot);

        this._updateLvlUpInfo();

        btnUpgrade.registerTouchEvent(function () {
            var currHeroInfo = this._getViewHeroInfo();
            var dialogId = mc.view_utility.showLoadingDialog();
            var mapQuantityByItemId = {};
            var arrItemLvlUp = [];
            for (var itemId in self._mapPickItemById) {
                if (mc.ItemStock.getItemHeroSoul(self._mapPickItemById[itemId])) {
                    arrItemLvlUp.push(self._mapPickItemById[itemId]);
                }
                else {
                    var strs = itemId.split('_');
                    var trueId = strs[0];
                    var q = parseInt(strs[2]);
                    if (!mapQuantityByItemId[trueId]) {
                        mapQuantityByItemId[trueId] = 0;
                    }
                    mapQuantityByItemId[trueId] += q;
                }
            }

            for (var itemId in mapQuantityByItemId) {
                var itemInfo = mc.GameData.itemStock.getItemById(itemId);
                arrItemLvlUp.push(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo), mapQuantityByItemId[itemId], itemId));
            }
            if (arrItemLvlUp.length > 0) {
                var currLevel = mc.HeroStock.getHeroLevel(currHeroInfo);
                mc.protocol.lvlUpHero(mc.HeroStock.getHeroId(currHeroInfo), arrItemLvlUp, function (newHeroInfo) {
                    mc.view_utility.hideLoadingDialogById(dialogId);
                    if (newHeroInfo) {
                        var deltaLevel = mc.HeroStock.getHeroLevel(newHeroInfo) - currLevel;
                        if (deltaLevel > 0) {
                            this._animateLvlUp(currLevel, deltaLevel);
                        }
                        else {
                            this._animateExpGain();
                        }
                        this._consumeAllItem();
                    }
                }.bind(this));
                mc.GameData.tutorialManager.submitTutorialDoneById(mc.TutorialManager.ID_LVUP_HERO);
            }
        }.bind(this));
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_HERO_LVUP);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_PLUS_BUTTON) {
                var allSlot = this._layoutSlot.getChildren();
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(allSlot[0])
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnUpgrade)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
        }
    },

    _animateExpGain: function () {
        var particle = new cc.ParticleSystem(res.spine_lvlup_particle_plist);
        particle.x = particle.y = 0;

        this._nodeSpine.addChild(particle);

        var dur = 0.75;
        this._spineView.beBuff();
        particle.runAction(cc.sequence([cc.delayTime(dur), cc.removeSelf()]));
        this._progressExp.stopAllActions();
        this._progressExp.runAction(cc.sequence([cc.progressTo(dur, this._newProgressExp.getPercentage()), cc.callFunc(function () {
            this._updateLvlUpInfo();
        }.bind(this))]));
        bb.sound.playEffect(res.sound_ui_hero_expbook_use);
    },

    _animateLvlUp: function (currLevel, count) {
        count = count || 1;
        var _animate = function () {
            var dur = 2.0;
            var particle = new cc.ParticleSystem(res.spine_lvlup_particle_plist);
            var front = sp.SkeletonAnimation.createWithJsonFile(res.spine_lvlup_front_json, res.spine_lvlup_front_atlas, 1.0);
            var back = sp.SkeletonAnimation.createWithJsonFile(res.spine_lvlup_back_json, res.spine_lvlup_back_atlas, 1.0);

            back.setAnimation(0, "levelup_back", false);
            front.setAnimation(0, "levelup_front", false);
            particle.x = particle.y = 0;

            back.setLocalZOrder(-1);
            this._nodeSpine.addChild(back);
            this._nodeSpine.addChild(particle);
            this._nodeSpine.addChild(front);

            particle.runAction(cc.sequence([cc.delayTime(dur), cc.removeSelf()]));
            front.runAction(cc.sequence([cc.delayTime(dur), cc.removeSelf()]));
            back.runAction(cc.sequence([cc.delayTime(dur), cc.removeSelf()]));
        }.bind(this);

        var progressDur = 0.2;
        this._spineView.beBuff();
        for (var i = 0; i < count; i++) {
            this.scheduleOnce(function () {
                _animate();
                bb.sound.playEffect(res.sound_ui_hero_lvup);
            }.bind(this), progressDur * i);
        }

        var min_dx = -100;
        var max_dx = 100;
        var dH = 100;
        var min_dy = -10;
        var max_dy = 50;
        var currHeroInfo = this._getViewHeroInfo();
        var totalAttrByCurrLevel = mc.HeroStock.getHeroTotalAttrByLevelNonEquipping(currHeroInfo, currLevel);
        var arrAction = [];
        for (var i = 0; i < count; i++) {
            arrAction.push(cc.callFunc(function () {
                this._lblExp.setVisible(false);
                this._progressExp.setPercentage(0);
            }.bind(this)));
            arrAction.push(cc.progressTo(progressDur, 100));
            arrAction.push(cc.callFunc(function (node, data) {
                var newLevel = currLevel + data;
                var totalAttrByNewLevel = mc.HeroStock.getHeroTotalAttrByLevelNonEquipping(currHeroInfo, newLevel);
                this._lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + newLevel);
                this._lblNumAtk.setString(bb.utility.formatNumber(totalAttrByNewLevel.atk));
                this._lblNumHp.setString(bb.utility.formatNumber(totalAttrByNewLevel.hp));
                this._lblNumDef.setString(bb.utility.formatNumber(totalAttrByNewLevel.def));
                this._lblNumRes.setString(bb.utility.formatNumber(totalAttrByNewLevel.res));
                this._lblNumMag.setString(bb.utility.formatNumber(totalAttrByNewLevel.mag));
                this._lblNumSpd.setString(bb.utility.formatNumber(totalAttrByNewLevel.spd));

                var lblTextAtk = bb.framework.getGUIFactory().createText("+" + bb.utility.formatNumber(totalAttrByNewLevel.atk - totalAttrByCurrLevel.atk) + " ATK");
                var lblTextDef = bb.framework.getGUIFactory().createText("+" + bb.utility.formatNumber(totalAttrByNewLevel.def - totalAttrByCurrLevel.def) + " DEF");
                var lblTextRes = bb.framework.getGUIFactory().createText("+" + bb.utility.formatNumber(totalAttrByNewLevel.res - totalAttrByCurrLevel.res) + " RES");
                var lblTextHp = bb.framework.getGUIFactory().createText("+" + bb.utility.formatNumber(totalAttrByNewLevel.hp - totalAttrByCurrLevel.hp) + " HP");
                var lblTextMag = bb.framework.getGUIFactory().createText("+" + bb.utility.formatNumber(totalAttrByNewLevel.mag - totalAttrByCurrLevel.mag) + " MAG");
                var lblTextSpd = bb.framework.getGUIFactory().createText("+" + bb.utility.formatNumber(totalAttrByNewLevel.spd - totalAttrByCurrLevel.spd) + " SPD");

                lblTextAtk.setColor(mc.color.GREEN_NORMAL);
                lblTextDef.setColor(mc.color.GREEN_NORMAL);
                lblTextRes.setColor(mc.color.GREEN_NORMAL);
                lblTextHp.setColor(mc.color.GREEN_NORMAL);
                lblTextMag.setColor(mc.color.GREEN_NORMAL);
                lblTextSpd.setColor(mc.color.GREEN_NORMAL);

                lblTextAtk.x = bb.utility.randomInt(min_dx, max_dx);
                lblTextAtk.y = dH + bb.utility.randomInt(min_dy, max_dy);
                lblTextDef.x = bb.utility.randomInt(min_dx, max_dx);
                lblTextDef.y = dH + bb.utility.randomInt(min_dy, max_dy);
                lblTextRes.x = bb.utility.randomInt(min_dx, max_dx);
                lblTextRes.y = dH + bb.utility.randomInt(min_dy, max_dy);
                lblTextHp.x = bb.utility.randomInt(min_dx, max_dx);
                lblTextHp.y = dH + bb.utility.randomInt(min_dy, max_dy);
                lblTextMag.x = bb.utility.randomInt(min_dx, max_dx);
                lblTextMag.y = dH + bb.utility.randomInt(min_dy, max_dy);
                lblTextSpd.x = bb.utility.randomInt(min_dx, max_dx);
                lblTextSpd.y = dH + bb.utility.randomInt(min_dy, max_dy);

                lblTextAtk.runAction(cc.sequence([cc.moveBy(0.35, 0, 80), cc.removeSelf()]));
                lblTextAtk.runAction(cc.fadeOut(0.75));
                lblTextDef.runAction(cc.sequence([cc.moveBy(0.35, 0, 80), cc.removeSelf()]));
                lblTextDef.runAction(cc.fadeOut(0.75));
                lblTextRes.runAction(cc.sequence([cc.moveBy(0.35, 0, 80), cc.removeSelf()]));
                lblTextRes.runAction(cc.fadeOut(0.75));
                lblTextHp.runAction(cc.sequence([cc.moveBy(0.35, 0, 80), cc.removeSelf()]));
                lblTextHp.runAction(cc.fadeOut(0.75));
                lblTextMag.runAction(cc.sequence([cc.moveBy(0.35, 0, 80), cc.removeSelf()]));
                lblTextMag.runAction(cc.fadeOut(0.75));
                lblTextSpd.runAction(cc.sequence([cc.moveBy(0.35, 0, 80), cc.removeSelf()]));
                lblTextSpd.runAction(cc.fadeOut(0.75));

                this._nodeSpine.addChild(lblTextAtk);
                this._nodeSpine.addChild(lblTextDef);
                this._nodeSpine.addChild(lblTextRes);
                this._nodeSpine.addChild(lblTextHp);
                this._nodeSpine.addChild(lblTextMag);
                this._nodeSpine.addChild(lblTextSpd);

                totalAttrByCurrLevel = totalAttrByNewLevel;

            }.bind(this), this._progressExp, i + 1));
        }
        arrAction.push(cc.callFunc(function () {
            this._progressExp.setPercentage(0);
        }.bind(this)));
        arrAction.push(cc.progressTo(progressDur, this._newProgressExp.getPercentage()));
        arrAction.push(cc.callFunc(function () {
            this._lblExp.setVisible(true);
            this._updateLvlUpInfo();
        }.bind(this)));
        this._newProgressExp.setPercentage(0);
        this._progressExp.runAction(cc.sequence(arrAction));
    },

    _getViewHeroInfo: function () {
        return mc.GameData.heroStock.getHeroById(this._currHeroId);
    },

    _updateLvlUpInfo: function () {
        var self = this;
        var currHeroInfo = this._getViewHeroInfo();
        var arrItemLvlUp = bb.utility.mapToArray(this._mapPickItemById);
        var currLevel = mc.HeroStock.getHeroLevel(currHeroInfo);
        var exp = mc.HeroStock.getHeroExp(currHeroInfo);
        var baseExp = exp.curr;
        var totalSelectExp = 0;
        var slotCount = 0;
        var ttZen = 0;
        for (var i = 0; i < arrItemLvlUp.length; i++) {
            var itemInfo = arrItemLvlUp[i];
            if (itemInfo) {
                var sc = 1;
                var heroSoul = mc.ItemStock.getItemHeroSoul(itemInfo);
                if (heroSoul) {
                    var recipe = mc.dictionary.getRecipeLvlUpHeroByHero(mc.HeroStock.getHeroRank(heroSoul));
                    if (recipe) {
                        totalSelectExp += (mc.HeroStock.getHeroElement(heroSoul) === mc.HeroStock.getHeroElement(currHeroInfo)) ?
                            mc.dictionary.getRecipeValueSameElemental(recipe) :
                            mc.dictionary.getRecipeValueDiffElemental(recipe);
                    }
                }
                else {
                    var recipe = mc.dictionary.getRecipeLvlUpHeroByItem(mc.ItemStock.getItemIndex(itemInfo));
                    if (recipe) {
                        var q = 0;
                        var numQuantity = mc.ItemStock.getItemQuantity(itemInfo);
                        var lv = mc.HeroStock.getHeroLevel(currHeroInfo);
                        var maxLv = mc.HeroStock.getHeroMaxLevel(currHeroInfo);
                        var isSameElement = (mc.ItemStock.getItemElement(itemInfo) === mc.HeroStock.getHeroElement(currHeroInfo));
                        var objExp = mc.dictionary.getHeroLevelByHeroExp(currLevel, totalSelectExp + baseExp, mc.HeroStock.getHeroRank(currHeroInfo));
                        lv = objExp.level;
                        q++;
                        totalSelectExp += isSameElement ?
                            mc.dictionary.getRecipeValueSameElemental(recipe) * numQuantity :
                            mc.dictionary.getRecipeValueDiffElemental(recipe) * numQuantity;
                        sc = numQuantity;
                        ttZen += (mc.dictionary.getRecipeZenCostPerSlotBook(recipe) * numQuantity);
                    }
                }
                slotCount += sc;
            }
        }
        var enableUpgrade = (slotCount > 0);

        var totalZen = ttZen;
        this._lblNumZen.setString(bb.utility.formatNumber(totalZen));
        this._lblNumAccquiredExp.setString("+" + bb.utility.formatNumber(totalSelectExp));

        var heroAttr = mc.HeroStock.getHeroTotalAttr(currHeroInfo);
        this._lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + mc.HeroStock.getHeroLevel(currHeroInfo));
        this._lblMaxLevel.setString(mc.dictionary.getGUIString("lblMax.") + mc.HeroStock.getHeroMaxLevel(currHeroInfo));
        this._lblNumAtk.setString(bb.utility.formatNumber(currHeroInfo.atk));
        this._lblNumHp.setString(bb.utility.formatNumber(currHeroInfo.hp));
        this._lblNumDef.setString(bb.utility.formatNumber(currHeroInfo.def));
        this._lblNumRes.setString(bb.utility.formatNumber(currHeroInfo.res));
        this._lblNumMag.setString(bb.utility.formatNumber(currHeroInfo.mag));
        this._lblNumSpd.setString(bb.utility.formatNumber(currHeroInfo.spd));


        this._btnUpgrade.setGray(!enableUpgrade);
        this._iconArrowAtk.setVisible(enableUpgrade);
        this._iconArrowLv.setVisible(enableUpgrade);
        this._iconArrowDef.setVisible(enableUpgrade);
        this._iconArrowHp.setVisible(enableUpgrade);
        this._iconArrowRes.setVisible(enableUpgrade);
        this._iconArrowMag.setVisible(enableUpgrade);
        this._iconArrowSpd.setVisible(enableUpgrade);

        this._lblIncreaseAtk.setVisible(enableUpgrade);
        this._lblIncreaseHp.setVisible(enableUpgrade);
        this._lblIncreaseDef.setVisible(enableUpgrade);
        this._lblIncreaseRes.setVisible(enableUpgrade);
        this._lblIncreaseMag.setVisible(enableUpgrade);
        this._lblIncreaseSpd.setVisible(enableUpgrade);
        this._lblIncreaseLevel.setVisible(enableUpgrade);
        this._progressExp.setPercentage(Math.round((exp.curr / exp.total) * 100));


        var objExp = mc.dictionary.getHeroLevelByHeroExp(currLevel, totalSelectExp + baseExp, mc.HeroStock.getHeroRank(currHeroInfo));
        var newLevel = objExp.level;
        var remainExp = objExp.remain;

        var maxExpAtNewLvl = -1;
        if (newLevel != this._currLvlToUp) {
            self._currLvlToUp = newLevel;
            var totalAttrByLevel = mc.HeroStock.getHeroTotalAttrByLevelNonEquipping(currHeroInfo, newLevel);
            self._lblIncreaseAtk.setString(bb.utility.formatNumber(totalAttrByLevel.atk));
            self._lblIncreaseHp.setString(bb.utility.formatNumber(totalAttrByLevel.hp));
            self._lblIncreaseDef.setString(bb.utility.formatNumber(totalAttrByLevel.def));
            self._lblIncreaseRes.setString(bb.utility.formatNumber(totalAttrByLevel.res));
            self._lblIncreaseMag.setString(bb.utility.formatNumber(totalAttrByLevel.mag));
            self._lblIncreaseSpd.setString(bb.utility.formatNumber(totalAttrByLevel.spd));

            maxExpAtNewLvl = mc.dictionary.getHeroExpByHeroLevel(newLevel + 1);

            self._lblIncreaseLevel.setString(newLevel);
            self._lblExp.setString(bb.utility.formatNumber(remainExp) + "/" + bb.utility.formatNumber(maxExpAtNewLvl));
            if (newLevel > mc.HeroStock.getHeroLevel(currHeroInfo)) {
                this._progressExp.setPercentage(0);
                this._newProgressExp.setPercentage(Math.round((remainExp / maxExpAtNewLvl) * 100));
            }
            else {
                this._newProgressExp.setPercentage(0);
                this._progressExp.setPercentage(Math.round((remainExp / maxExpAtNewLvl) * 100));
            }
        }
        else {
            maxExpAtNewLvl = mc.dictionary.getHeroExpByHeroLevel(newLevel + 1);
            self._lblExp.setString(bb.utility.formatNumber(remainExp) + "/" + bb.utility.formatNumber(maxExpAtNewLvl));
            this._newProgressExp.setPercentage(Math.round((remainExp / maxExpAtNewLvl) * 100));
        }
        if (maxExpAtNewLvl < 0) {
            self._lblExp.setString(mc.dictionary.getGUIString("lblMax"));
            self._lblExp.setColor(mc.color.GREEN_NORMAL);
        }
        var lvlUpController = mc.GameData.guiController.lvlUp;
        lvlUpController.heroId = mc.HeroStock.getHeroId(currHeroInfo);
        lvlUpController.totalLvlUpExp = totalSelectExp;
        lvlUpController.totalLvlUpZen = totalZen;
        lvlUpController.currLv = mc.HeroStock.getHeroLevel(currHeroInfo);
        lvlUpController.nextLv = newLevel;
        lvlUpController.currExp = baseExp;
        lvlUpController.nextExp = remainExp;
        lvlUpController.maxLv = mc.HeroStock.getHeroMaxLevel(currHeroInfo);
        mc.GameData.guiController.notifyDataChanged();
    },

    _pickConsumableItem: function (widget, consumableItem) {
        var itemId = mc.ItemStock.getItemId(consumableItem);
        var itemView = new mc.ItemView(consumableItem);

        this._mapPickWidgetById[itemId] = itemView;
        this._mapPickItemById[itemId] = consumableItem;

        itemView.x = widget.x;
        itemView.y = widget.y;
        itemView.scale = 0.75;
        itemView.registerTouchEvent(function (itemView) {
            this._unpickConsumableItem(mc.ItemStock.getItemId(itemView.getUserData()));
        }.bind(this));
        widget.setVisible(false);
        widget.getParent().addChild(itemView);
        itemView._slotView = widget;
        this._updateLvlUpInfo();
    },

    _consumeAllItem: function () {
        var enableUpgrade = false;
        this._btnUpgrade.setGray(!enableUpgrade);
        this._iconArrowAtk.setVisible(enableUpgrade);
        this._iconArrowLv.setVisible(enableUpgrade);
        this._iconArrowDef.setVisible(enableUpgrade);
        this._iconArrowHp.setVisible(enableUpgrade);
        this._iconArrowRes.setVisible(enableUpgrade);
        this._iconArrowMag.setVisible(enableUpgrade);
        this._iconArrowSpd.setVisible(enableUpgrade);

        this._lblIncreaseAtk.setVisible(enableUpgrade);
        this._lblIncreaseHp.setVisible(enableUpgrade);
        this._lblIncreaseDef.setVisible(enableUpgrade);
        this._lblIncreaseRes.setVisible(enableUpgrade);
        this._lblIncreaseMag.setVisible(enableUpgrade);
        this._lblIncreaseSpd.setVisible(enableUpgrade);
        this._lblIncreaseLevel.setVisible(enableUpgrade);

        for (var itemId in this._mapPickWidgetById) {
            this._mapPickWidgetById[itemId].runAction(cc.sequence([cc.fadeOut(0.5), cc.removeSelf()]));
        }
        var allSlot = this._layoutSlot.getChildren();
        for (var i = 0; i < allSlot.length; i++) {
            allSlot[i].setVisible(true);
        }
        this._mapPickWidgetById = {};
        this._mapPickItemById = {};
        var lvlUpController = mc.GameData.guiController.lvlUp;
        lvlUpController.mapPickQuantityItemById = {};
    },

    _unpickConsumableItem: function (itemId) {
        this._mapPickItemById[itemId] = null;
        var itemView = this._mapPickWidgetById[itemId];
        if (itemView) {
            if (itemView._slotView) {
                itemView._slotView.setVisible(true);
            }
            this._mapPickWidgetById[itemId].removeFromParent();
            this._mapPickWidgetById[itemId] = null;
            delete this._mapPickItemById[itemId];
            delete this._mapPickWidgetById[itemId];
            this._updateLvlUpInfo();
        }
    },

    _isContainConsumableItem: function (widgetSlot) {
        return !widgetSlot.isVisible();
    },

    _findEmptySlot: function () {
        var arrSlot = this._layoutSlot.getChildren();
        var emptySlot = null;
        for (var i = 0; i < arrSlot.length; i++) {
            if (!this._isContainConsumableItem(arrSlot[i]) &&
                arrSlot[i] instanceof ccui.ImageView) {
                emptySlot = arrSlot[i];
                break;
            }
        }
        return emptySlot;
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_LEVEL_UP_HERO;
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

mc.MultiSelectingMaterialLevelUp = bb.Dialog.extend({

    ctor: function (arrLvUpItem, arrHeroSoul, extraItemFuc, selectItemFunc) {
        this._super();

        var node = ccs.load(res.widget_multi_select_material, "res/").node;
        this.addChild(node);

        var root = this._contentView = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var tabBookActive = this._tabWeaponActive = new ccui.ImageView("button/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
        var tabBookNormal = this._tabWeaponInActive = new ccui.ImageView("button/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
        var tabHeroActive = this._tabItemActive = tabBookActive.clone();
        var tabHeroNormal = this._tabItemInActive = tabBookNormal.clone();

        var btnOk = this._btnOk = rootMap["btnOk"];
        var panelGrid = rootMap["panelGrid"];
        var lblCurrLv = rootMap["lblCurrLv"];
        var lblCurrExp = rootMap["lblCurrExp"];
        var lblNextLv = rootMap["lblNextLv"];
        var lblNextExp = rootMap["lblNextExp"];
        var iconArrow = rootMap["iconArrow"];
        var lblNumAccquiredExp = rootMap["lblNumAccquiredExp"];
        var emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);

        tabBookActive.x = root.width * 0.2;
        tabBookActive.y = root.height * 1.02;
        tabBookNormal.x = root.width * 0.2;
        tabBookNormal.y = root.height * 1.02;
        tabHeroActive.x = root.width * 0.51;
        tabHeroActive.y = root.height * 1.02;
        tabHeroNormal.x = root.width * 0.51;
        tabHeroNormal.y = root.height * 1.02;
        tabBookActive.setString(mc.dictionary.getGUIString("lblBook"), res.font_UTMBienvenue_none_32_export_fnt);
        tabBookNormal.setString(mc.dictionary.getGUIString("lblBook"), res.font_UTMBienvenue_none_32_export_fnt);
        tabHeroActive.setString(mc.dictionary.getGUIString("lblHero"), res.font_UTMBienvenue_none_32_export_fnt);
        tabHeroNormal.setString(mc.dictionary.getGUIString("lblHero"), res.font_UTMBienvenue_none_32_export_fnt);
        lblNumAccquiredExp.setColor(mc.color.BLUE);
        btnOk.setString(mc.dictionary.getGUIString("lblDone"));

        root.addChild(tabBookActive);
        root.addChild(tabBookNormal);
        root.addChild(tabHeroActive);
        root.addChild(tabHeroNormal);

        var lvlUpController = mc.GameData.guiController.lvlUp;
        var _updateAssetView = function () {
            lblNextExp.setColor(cc.color.WHITE);
            lblCurrLv.setString(mc.dictionary.getGUIString("lblLv.") + lvlUpController.currLv);
            lblNextLv.setString(mc.dictionary.getGUIString("lblLv.") + lvlUpController.nextLv);
            lblCurrExp.setString("Exp " + bb.utility.formatNumber(lvlUpController.currExp));
            lblNextExp.setString("Exp " + bb.utility.formatNumber(lvlUpController.nextExp));
            lblNumAccquiredExp.setString("+" + bb.utility.formatNumber(lvlUpController.totalLvlUpExp) + " Exp");
            if (lvlUpController.totalLvlUpExp <= 0) {
                lblNextLv.setVisible(false);
                lblNextExp.setVisible(false);
                iconArrow.setVisible(false);
                lblNumAccquiredExp.setVisible(false);
            }
            else {
                lblNextLv.setVisible(true);
                lblNextExp.setVisible(true);
                iconArrow.setVisible(true);
                lblNumAccquiredExp.setVisible(true);
            }

            var heroInfo = mc.GameData.heroStock.getHeroById(lvlUpController.heroId);
            if (lvlUpController.nextLv >= mc.const.MAX_HERO_LEVEL_BY_RANK[mc.HeroStock.getHeroRank(heroInfo)]) {
                lblNextExp.setString(mc.dictionary.getGUIString("lblFull"));
                lblNextExp.setColor(mc.color.GREEN_NORMAL);
            }

            var assetView = root.getChildByName("asset_view");
            if (assetView) {
                assetView.removeFromParent();
            }
            assetView = mc.view_utility.createAssetView(mc.ItemStock.createJsonItemZen(lvlUpController.totalLvlUpZen));
            assetView.setName("asset_view");
            assetView.x = btnOk.x;
            assetView.y = btnOk.y - btnOk.height * btnOk.scale * 0.5 - 20;
            root.addChild(assetView);
        };

        btnOk.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        var heroInfo = mc.GameData.heroStock.getHeroById(lvlUpController.heroId);
        var heroElement = mc.HeroStock.getHeroElement(heroInfo);
        var heroView = new mc.HeroAvatarView(heroInfo);
        heroView.getLabelLevel().setString(mc.dictionary.getGUIString("lblLv.") + lvlUpController.currLv + "/" + lvlUpController.maxLv);
        heroView.scale = 0.9;
        heroView.x = 102;
        heroView.y = 123;
        root.addChild(heroView);

        _updateAssetView();
        this.traceDataChange(mc.GameData.guiController, function () {
            _updateAssetView();
        });

        this.traceDataChange(mc.GameData.tutorialManager, function () {
            this.onTriggerTutorial();
        }.bind(this));

        var items = arrLvUpItem;
        var minView = 30;
        var numMaxItem = Math.max(minView, (Math.round(items.length / 5) + 1) * 5);
        var mapVal = {};
        var maxVal = 100000;
        mapVal[mc.const.ELEMENT_FIRE] = 50000;
        mapVal[mc.const.ELEMENT_WATER] = 40000;
        mapVal[mc.const.ELEMENT_DARK] = 30000;
        mapVal[mc.const.ELEMENT_EARTH] = 20000;
        mapVal[mc.const.ELEMENT_LIGHT] = 10000;
        var bookGridView = this._bookGridView = new mc.SortedGridView(panelGrid);
        bookGridView.setGridWidth(panelGrid.width - 10);
        bookGridView.setInfoText("Total", items.length)
            .setSortingDataSource(["Element", "Experience"], function (widget, indexAttr) {
                var itemInfo = widget.getUserData();
                var val = 0;
                if (itemInfo) {
                    var valItem = mc.ItemStock.getItemValue(itemInfo);
                    if (valItem) {
                        valItem = (parseInt(valItem) / 1000 + mc.ItemStock.getItemQuantity(itemInfo));
                    }
                    switch (indexAttr) {
                        case -1:
                            val = mc.ItemStock.getItemIndex(itemInfo);
                            break;
                        case 0:
                            var itemElement = mc.ItemStock.getItemElement(itemInfo);
                            if (itemElement) {
                                if (heroElement.toLowerCase() === itemElement.toLowerCase()) {
                                    val += (maxVal + valItem);
                                }
                                else {
                                    val += (mapVal[itemElement.toLowerCase()] + valItem);
                                }
                            }
                            break;
                        case 1:
                            val = valItem;
                            break;
                        default :
                            break;
                    }
                }
                else {
                    val = -1000;
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
                        var itemInfo = widget.getUserData();
                        var itemId = mc.ItemStock.getItemId(itemInfo);
                        selectItemFunc && selectItemFunc(widget);
                    }.bind(this), function (widget) {
                        mc.createItemPopupDialog(widget.getUserData()).registerClearButton().show();
                    });
                    if (extraItemFuc) {
                        extraItemFuc(widget, itemInfo);
                    }
                }
                else {
                    widget = emptyWidget.clone();
                    widget.scale = 0.9;
                }
                return widget;
            }.bind(this));
        bookGridView.getBackgroundView().setVisible(false);
        root.addChild(bookGridView);

        var heroGridView = null;
        //var items = arrHeroSoul;
        //var minView = 30;
        //var numMaxItem = Math.max(minView, (Math.round(items.length / 5) + 1) * 5);
        //heroGridView = this._heroGridView = new mc.SortedGridView(panelGrid);
        //heroGridView.setGridWidth(panelGrid.width-10);
        //heroGridView.setInfoText("No. ", items.length)
        //    .setSortingDataSource(["Power", "Level","Rank"], function (widget, indexAttr) {
        //        var itemInfo = widget.getUserData();
        //        var val = -1000;
        //        if (itemInfo) {
        //            var heroSoul = mc.ItemStock.getItemHeroSoul(itemInfo);
        //            if (heroSoul) {
        //                switch (indexAttr) {
        //                    case -1:
        //                        val = mc.HeroStock.getHeroId(heroSoul);
        //                        break;
        //                    case 0:
        //                        val = mc.HeroStock.getHeroBattlePower(heroSoul);
        //                        break;
        //                    case 1:
        //                        val = mc.HeroStock.getHeroLevel(heroSoul);
        //                        break;
        //                    case 2:
        //                        val = mc.HeroStock.getHeroRank(heroSoul);
        //                        break;
        //                }
        //            }
        //        }
        //        return val;
        //    })
        //    .setDataSource(numMaxItem, function (index) {
        //        var widget = null;
        //        if (index < items.length) {
        //            var itemInfo = items[index];
        //            widget = new mc.ItemView(itemInfo);
        //            widget.scale = 0.9;
        //            widget.registerTouchEvent(function (widget) {
        //                selectItemFunc && selectItemFunc(widget);
        //            }.bind(this),function(widget){
        //                if( widget.getHeroAvatarView() ){
        //                    new mc.HeroInfoDialog(widget.getHeroAvatarView().getUserData()).show();
        //                }
        //            });
        //            if (extraItemFuc) {
        //                extraItemFuc(widget, itemInfo);
        //            }
        //        }
        //        else {
        //            widget = emptyWidget.clone();
        //            widget.scale = 0.9;
        //        }
        //        return widget;
        //    }.bind(this));
        //heroGridView.getBackgroundView().setVisible(false);
        //root.addChild(heroGridView);
        //
        //tabBookNormal.registerTouchEvent(function(){
        //    _selectTab("book");
        //});
        //tabBookActive.setTouchEnabled(true);
        //
        //tabHeroNormal.registerTouchEvent(function(){
        //    _selectTab("hero");
        //});
        //tabHeroActive.setTouchEnabled(true);
        //
        //tabBookNormal.setName("book");
        //tabHeroNormal.setName("hero");
        var _selectTab = function (tabName) {
            tabBookNormal.setVisible(false);
            tabBookActive.setVisible(false);
            tabHeroActive.setVisible(false);
            tabHeroNormal.setVisible(false);
            bookGridView.setVisible(false);
            heroGridView && heroGridView.setVisible(false);
            if (tabName === "book") {
                bookGridView.setVisible(true);
                tabBookActive.setVisible(true);
                tabHeroNormal.setVisible(true);
            }
            else if (tabName === "hero") {
                heroGridView && heroGridView.setVisible(true);
                tabHeroActive.setVisible(true);
                tabBookNormal.setVisible(true);
            }
        };

        _selectTab("");
        bookGridView.setVisible(true);
    },

    _findBookViewByIndex:function(index,quantity){
        var view = null;
        var allItem = this._bookGridView.getAllElementView();
        for(var i = 0; i < allItem.length; i++ ){
            var itemInfo = allItem[i].getUserData();
            if( itemInfo &&
                mc.ItemStock.getItemIndex(itemInfo) === index &&
                mc.ItemStock.getItemQuantity(itemInfo) === quantity &&
                !allItem[i].isBlack){
                view = allItem[i];
                break;
            }
        }
        return view;
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_SELECT_MATERIAL);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_ITEM_WIDGET) {
                var focusView = null;
                if( tutorialTrigger.param ){
                    focusView = this._findBookViewByIndex(tutorialTrigger.param.index,tutorialTrigger.param.no);
                }
                if( !focusView ){
                    var allItem = this._bookGridView.getAllElementView();
                    focusView = allItem[0];
                }
                if( focusView ){
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(focusView)
                        .setScaleHole(1.25)
                        .setCharPositionY(cc.winSize.height * 0.4)
                        .show();
                }
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnOk)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
        }
    },

    overrideShowAnimation: function () {
        this._contentView.y = 0;
        this._contentView.runAction(cc.sequence([cc.moveBy(0.3, 0, this._contentView.height), cc.callFunc(function () {
            this.onTriggerTutorial();
        }.bind(this))]));
        return 0.3;
    },

    overrideCloseAnimation: function () {
        this._contentView.runAction(cc.sequence([cc.moveBy(0.3, 0, -this._contentView.height), cc.callFunc(function () {
        })]));
        return 0.3;
    }

});