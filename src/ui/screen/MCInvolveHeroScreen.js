/**
 * Created by long.nguyen on 2/7/2018.
 */
mc.InvolveHeroScreen = mc.Screen.extend({
    _mapMaterialEnable: null,
    _isShowHeader: true,

    getPreLoadURL: function () {
        var heroInfo = mc.GameData.heroStock.getHeroById(mc.GameData.guiState.getViewHeroId());
        var localData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
        var evolveToIndex = localData.evolveTo;
        return mc.resource.getPreLoadSpineURL(evolveToIndex);
    },

    initResources: function () {
        this._super();

        this._mapMaterialEnable = {};

        var viewHeroId = mc.GameData.guiState.getViewHeroId();
        this._currHeroId = viewHeroId;
        var currHeroInfo = this._getViewHeroInfo();

        var node = this._screenInvolve = mc.loadGUI(res.screen_involve_hero_json);
        this.addChild(node);

        var root = this._rootNode = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var nodeSpine = this._nodeSpine = rootMap["nodeSpine"];
        var nodeInvolveSpine = this._nodeInvolveSpine = rootMap["nodeInvolveSpine"];
        this._nodeParInvolveSpine = rootMap["nodeParInvolveSpine"];
        var lblCurrPower = this._lblCurrPower = rootMap["lblCurrPower"];
        var lblPower = this._lblPower = rootMap["lblPower"];
        var btnBack = rootMap["btnBack"];
        var btnChangeHero = rootMap["btnChangeHero"];
        var btnInfo = rootMap["btnInfo"];
        var panelInfo = this._panelInfo = rootMap["panelInfo"];
        var slotMoney = rootMap["slotMoney"];
        var slotBless = rootMap["slotBless"];
        var slotFriend = rootMap["slotFriend"];
        panelInfo.setCascadeOpacityEnabled(true);
        var panelInfoMap = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });

        slotFriend.setVisible(false);
        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, slotFriend, btnBack);

        var torch1 = new cc.ParticleSystem(res.particle_torch_plist);
        var torch2 = new cc.ParticleSystem(res.particle_torch_plist);
        var torch3 = new cc.ParticleSystem(res.particle_torch_plist);
        torch1.scale = 0.3;
        torch1.x = cc.winSize.width * 0.17;
        torch1.y = mc.const.DEFAULT_HEIGHT * 0.885;
        torch2.scale = 0.3;
        torch2.x = cc.winSize.width * 0.83;
        torch2.y = mc.const.DEFAULT_HEIGHT * 0.885;
        torch3.scale = 0.3;
        torch3.x = cc.winSize.width * 0.5;
        torch3.y = mc.const.DEFAULT_HEIGHT * 0.90;
        root.addChild(torch1);
        root.addChild(torch2);
        root.addChild(torch3);

        var nodeAvt = this._nodeAvt = panelInfoMap["nodeAvt"];
        var tabStats = panelInfoMap["tabStats"];
        var tabSkill = panelInfoMap["tabSkill"];
        var lblNumAtk = this._lblNumAtk = panelInfoMap["lblNumAtk"];
        var lblNumHP = this._lblNumHp = panelInfoMap["lblNumHp"];
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
        var iconArrowRank = this._iconArrowRank = panelInfoMap["iconArrowRank"];
        var iconArrowAtk = this._iconArrowAtk = panelInfoMap["iconArrowAtk"];
        var iconArrowDef = this._iconArrowDef = panelInfoMap["iconArrowDef"];
        var iconArrowHp = this._iconArrowHp = panelInfoMap["iconArrowHp"];
        var iconArrowRec = this._iconArrowRec = panelInfoMap["iconArrowRec"];
        var lblIncreaseRank = this._lblIncreaseRank = panelInfoMap["lblIncreaseRank"];
        var lblIncreaseAtk = this._lblIncreaseAtk = panelInfoMap["lblIncreaseAtk"];
        var lblIncreaseHp = this._lblIncreaseHp = panelInfoMap["lblIncreaseHp"];
        var lblIncreaseRes = this._lblIncreaseRes = panelInfoMap["lblIncreaseRes"];
        var lblIncreaseDef = this._lblIncreaseDef = panelInfoMap["lblIncreaseDef"];
        var lblIncreaseMag = this._lblIncreaseMag = panelInfoMap["lblIncreaseMag"];
        var lblIncreaseSpd = this._lblIncreaseSpd = panelInfoMap["lblIncreaseSpd"];
        var lblRequireLevel = this._lblRequireLevel = panelInfoMap["lblRequireLevel"];
        var nodeMaterial = this._nodeMaterial = rootMap["nodeMaterial"];

        var nodeSkillContainer = this._nodeSkillContainer = new cc.Node();
        nodeSkillContainer.setCascadeOpacityEnabled(true);
        panelInfo.addChild(nodeSkillContainer);

        var lblZen = panelInfoMap["lblZen"];
        var lblBless = panelInfoMap["lblBless"];
        lblBless.setString(mc.dictionary.getGUIString("lblBlessCost"));
        lblZen.setString(mc.dictionary.getGUIString("lblZenCost"));
        var lblName = this._lblName = panelInfoMap["lblName"];
        var lblLevel = panelInfoMap["lblLevel"];
        var lblNumLevel = this._lblNumLevel = panelInfoMap["lblNumLevel"];
        var lblNumZen = this._lblNumZen = panelInfoMap["lblNumZen"];
        var lblNumBless = this._lblNumBless = panelInfoMap["lblNumBless"];
        var btnUpgrade = this._btnUpgrade = panelInfoMap["btnUpgrade"];

        btnUpgrade.setString(mc.dictionary.getGUIString("lblEvolve"));
        btnChangeHero._maxLblWidth = btnChangeHero.width - 20;
        btnChangeHero.setString(mc.dictionary.getGUIString("lblChangeHero"));

        lblAtk.setColor(mc.color.BLUE);
        lblHp.setColor(mc.color.BLUE);
        lblRes.setColor(mc.color.BLUE);
        lblDef.setColor(mc.color.BLUE);
        lblMag.setColor(mc.color.BLUE);
        lblSpd.setColor(mc.color.BLUE);
        //lblLevel.setColor(mc.color.BLUE);
        lblIncreaseAtk.setColor(mc.color.GREEN);
        lblIncreaseHp.setColor(mc.color.GREEN);
        lblIncreaseDef.setColor(mc.color.GREEN);
        lblIncreaseRes.setColor(mc.color.GREEN);
        lblIncreaseMag.setColor(mc.color.GREEN);
        lblIncreaseSpd.setColor(mc.color.GREEN);
        lblNumZen.setColor(mc.color.YELLOW);
        lblNumBless.setColor(mc.color.VIOLET_ELEMENT);

        this._setupSpineHero();

        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_EVOLVE_HERO);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnUpgrade)
                    .setCharPositionY(cc.winSize.height * 0.5)
                    .show();
            }
        }
    },

    _setupSpineHero: function (heroInfo) {
        if (!heroInfo) {
            var viewHeroId = mc.GameData.guiState.getViewHeroId();
            this._currHeroId = viewHeroId;
            heroInfo = this._getViewHeroInfo();
        }
        else {
            var viewHeroId = mc.HeroStock.getHeroId(heroInfo);
            mc.GameData.guiState.setCurrentViewHeroId(viewHeroId);
            this._currHeroId = viewHeroId;
            heroInfo = this._getViewHeroInfo();
        }

        if (mc.HeroStock.getHeroLevel(heroInfo) >= mc.HeroStock.getHeroMaxLevel(heroInfo)) {
            this._btnUpgrade.setVisible(true);
            this._lblRequireLevel.setVisible(false);
        }
        else {
            this._btnUpgrade.setVisible(false);
            this._lblRequireLevel.setVisible(true);
            this._lblRequireLevel.setString(mc.dictionary.getGUIString("txtRequireHeroLv") + mc.HeroStock.getHeroMaxLevel(heroInfo));
            this._lblRequireLevel.setColor(mc.color.RED);
        }

        var itemStock = mc.GameData.itemStock;
        if (this._nodeSpine) {
            this._nodeSpine.removeAllChildren();
        }
        if (this._nodeInvolveSpine) {
            this._nodeInvolveSpine.removeAllChildren();
        }
        if (this._nodeAvt) {
            this._nodeAvt.removeAllChildren();
        }
        if (this._nodeMaterial) {
            this._nodeMaterial.removeAllChildren();
        }
        var self = this;
        var isOk = false;

        this._oldHeroIndex = mc.HeroStock.getHeroIndex(heroInfo);
        var spineView = this._spineView = mc.BattleViewFactory.createCreatureGUIByIndex(this._oldHeroIndex);
        spineView.setClickAble(true, undefined, heroInfo);
        this._nodeSpine.addChild(spineView);

        var localData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(this._getViewHeroInfo()));
        var evolveToIndex = this._evolveToIndex = localData.evolveTo;
        if (evolveToIndex) {
            var recipe = mc.dictionary.getRecipeInvolveHeroByParam(mc.HeroStock.getHeroClassGroup(heroInfo), mc.HeroStock.getHeroRank(heroInfo) + 1,mc.HeroStock.getHeroElement(heroInfo));
            var arrMaterial = this._arrMaterial = bb.utility.mapToArray(mc.dictionary.getRecipeMaterialMap(recipe));
            var layoutSlot = bb.layout.grid(bb.collection.createArray(arrMaterial.length, function (index) {
                var materialRequired = arrMaterial[index];
                var materialIndex = mc.ItemStock.getItemIndex(materialRequired);
                var numTotalMaterial = mc.ItemStock.getTotalQuantityByItemArray(itemStock.getArrayItemByIndex(materialIndex));
                var materialInStock = mc.ItemStock.createJsonItemInfo(materialIndex, numTotalMaterial);
                var enoughMaterial = numTotalMaterial >= mc.ItemStock.getItemQuantity(materialRequired);
                self._mapMaterialEnable[materialIndex] = enoughMaterial;
                var itemView = new mc.ItemView(materialInStock);
                if (!itemView.getChildByName("not_enough")) {
                    var notEnoughSpine = sp.SkeletonAnimation.createWithJsonFile(res.spine_item_panel_lacking_json, res.spine_item_panel_lacking_atlas, 1.0);
                    itemView.addChild(notEnoughSpine);
                    notEnoughSpine.setName("not_enough");
                }
                var spine = itemView.getChildByName("not_enough");
                spine.setVisible(!enoughMaterial);
                if (!enoughMaterial) {
                    spine.setAnimation(0, "lacking_idle", true);
                }
                itemView.setNewScale(0.7);
                itemView.setDetailQuantityMode(mc.ItemStock.getItemQuantity(materialRequired));
                notEnoughSpine.setPosition(itemView.width / 2, itemView.height / 2);
                itemView.registerTouchEvent(function (itemView) {
                    new mc.HowToGetDialog(itemView.getUserData()).show();
                });
                return itemView;
            }), arrMaterial.length, this._panelInfo.width - 20);
            layoutSlot.anchorY = 0;
            layoutSlot.setCascadeOpacityEnabled(true);
            layoutSlot.setCascadeColorEnabled(true);
            this._nodeMaterial.addChild(layoutSlot);

            var enableUpgrade = true;
            for (var materialId in this._mapMaterialEnable) {
                if (!this._mapMaterialEnable[materialId]) {
                    enableUpgrade = false;
                    break;
                }
            }

            var evolveHero = mc.dictionary.getHeroDictByIndex(evolveToIndex);
            if (evolveHero) {
                this._lblName.setString(mc.HeroStock.getHeroName(evolveHero));
                this._lblNumLevel.setString(1 + "/" + mc.HeroStock.getHeroMaxLevel(evolveHero));
                var avtView = new mc.HeroAvatarView(evolveHero);
                avtView.getLabelLevel().setVisible(false);
                avtView.scale = 0.75;
                this._nodeAvt.addChild(avtView);

                var evolveHeroInfo = bb.utility.cloneJSON(evolveHero);
                evolveHeroInfo.id = mc.HeroStock.getHeroId(this._getViewHeroInfo());
                var spineView = this.nextSpine = mc.BattleViewFactory.createCreatureGUIByIndex(evolveToIndex);
                spineView.setClickAble(true);
                spineView.setName("spine");
                this._nodeInvolveSpine.addChild(spineView);

                var involveAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_char_evolve_json, res.spine_char_evolve_atlas, 1.0);
                this._nodeInvolveSpine.addChild(involveAnimate);
                involveAnimate.setLocalZOrder(1);
                involveAnimate.setScale(0.75);
                involveAnimate.setPositionX(this._nodeInvolveSpine.width / 2);
                involveAnimate.setAnimation(0, "idle" + (enableUpgrade ? "2" : ""), true);
                var involveAnimate_back = sp.SkeletonAnimation.createWithJsonFile(res.spine_char_evolve_back_json, res.spine_char_evolve_back_atlas, 1.0);
                this._nodeInvolveSpine.addChild(involveAnimate_back);
                involveAnimate_back.setLocalZOrder(-1);
                involveAnimate_back.setScale(0.75);
                involveAnimate_back.setPositionX(this._nodeInvolveSpine.width / 2);
                involveAnimate_back.setAnimation(0, "idle" + (enableUpgrade ? "2" : ""), true);

                var heroRank = mc.HeroStock.getHeroRank(evolveHeroInfo);
                var layoutStar = null;
                if(heroRank >= 6){
                    layoutStar = bb.layout.linear(bb.collection.createArray(heroRank - 5, function (index) {
                        return new ccui.ImageView("icon/star_purple_small.png", ccui.Widget.PLIST_TEXTURE);
                    }), 0);
                }else{
                    layoutStar = bb.layout.linear(bb.collection.createArray(heroRank, function (index) {
                        return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
                    }), 0)
                }

                layoutStar.setCascadeOpacityEnabled(true);
                layoutStar.setCascadeColorEnabled(true);
                layoutStar.scale = 0.75;
                layoutStar.y = -45;
                this._nodeInvolveSpine.addChild(layoutStar);
                this._lblPower.setString(mc.dictionary.getGUIString("lblPower") + bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(evolveHeroInfo)));
                this._loadSkillList(evolveHeroInfo);
            }
            this._lblCurrPower.setString(mc.dictionary.getGUIString("lblPower") + bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(this._getViewHeroInfo())));

            var heroRank2 = mc.HeroStock.getHeroRank(heroInfo);
            var layoutStar = null;
            if(heroRank2 >= 6){
                layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(heroRank2 - 5, function (index) {
                    return new ccui.ImageView("icon/star_purple_small.png", ccui.Widget.PLIST_TEXTURE);
                }), 0);
            }else{
                layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(heroRank2, function (index) {
                    return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
                }), 0);
            }

            layoutStar.setCascadeOpacityEnabled(true);
            layoutStar.setCascadeColorEnabled(true);
            layoutStar.scale = 0.75;
            layoutStar.y = -45;
            this._nodeSpine.addChild(layoutStar);


            this._updateInvolveUpInfo(recipe);

            this._btnUpgrade.registerTouchEvent(function () {
                var heroInfo = this._getViewHeroInfo();
                var recipe = mc.dictionary.getRecipeInvolveHeroByParam(mc.HeroStock.getHeroClassGroup(heroInfo), mc.HeroStock.getHeroRank(heroInfo) + 1,mc.HeroStock.getHeroElement(heroInfo));
                var arrCostInfo = mc.ItemStock.createArrJsonItemFromStr(mc.dictionary.getRecipeCost(recipe));
                var isShowExchange = mc.view_utility.showExchangingIfNotEnoughManyCost(arrCostInfo);
                if (!isShowExchange) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.rankUpHero(mc.HeroStock.getHeroId(this._getViewHeroInfo()), this._getPickingArrayItem(), function (heroInfo) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (heroInfo) {
                            var childByName = this._nodeParInvolveSpine.getChildByName("parInvolve");
                            if (childByName) {
                                childByName.removeFromParent();
                            }
                            this._animateInvolveUp(heroInfo);
                        }
                    }.bind(this));
                }
            }.bind(this));
            isOk = true;
        }
        return isOk;
    },

    _animateInvolveUp: function (heroInfo) {
        var layerColor = new cc.LayerColor(cc.color.WHITE);
        layerColor.setLocalZOrder(99);
        layerColor.opacity = 0;
        layerColor.runAction(cc.sequence([cc.delayTime(1), cc.fadeIn(0.5), cc.delayTime(0.5), cc.callFunc(function () {
            this._loadSummonScreen();
        }.bind(this)), cc.delayTime(0.3), cc.fadeOut(0.5), cc.removeSelf()]));
        this.addChild(layerColor);
    },

    _loadSummonScreen: function () {
        var heroInfo = this._getViewHeroInfo();
        this._screenInvolve.setVisible(false);

        var node = this._nodeShowHero = ccs.load(res.layer_hero_summon, "res/").node;
        var root = node.getChildByName("root");
        var nodeParticle = root.getChildByName("nodeParticle");
        var hero = this._nodeHero = root.getChildByName("hero");
        var panelInfo = root.getChildByName("panelInfo");
        var btnDone = this._btnDone = root.getChildByName("btnDone");
        var btnBack = this._btnBack = root.getChildByName("btnBack");
        var btnOk = this._btnOk = root.getChildByName("btnOk");
        var char = this._nodeChar = hero.getChildByName("char");
        var imgWheel = hero.getChildByName("containerWheel").getChildByName("imgWheel");
        imgWheel.runAction(cc.rotateBy(0.01, -1).repeatForever());
        btnOk.setVisible(false);
        var torch1 = new cc.ParticleSystem(res.particle_torch_plist);
        var torch2 = new cc.ParticleSystem(res.particle_torch_plist);
        var torch3 = new cc.ParticleSystem(res.particle_torch_plist);
        torch1.scale = 0.3;
        torch1.x = cc.winSize.width * 0.205;
        torch1.y = mc.const.DEFAULT_HEIGHT * 0.8;
        torch2.scale = 0.3;
        torch2.x = cc.winSize.width * 0.81;
        torch2.y = mc.const.DEFAULT_HEIGHT * 0.8;
        torch3.scale = 0.3;
        torch3.x = cc.winSize.width * 0.5;
        torch3.y = mc.const.DEFAULT_HEIGHT * 0.81;
        nodeParticle.addChild(torch1);
        nodeParticle.addChild(torch2);
        nodeParticle.addChild(torch3);
        this.addChild(node);
        this._btnDone.setString(mc.dictionary.getGUIString("lblViewInfo"));

        this._btnDone.opacity = 0;
        this._btnBack.opacity = 0;
        var oldSpineView = mc.BattleViewFactory.createCreatureGUIByIndex(this._oldHeroIndex);
        oldSpineView.scale = 1.4;
        oldSpineView.x = this._nodeChar.width * 0.5;
        this._nodeChar.addChild(oldSpineView);
        oldSpineView.setClickAble(true);
        oldSpineView.cheerDelay();

        var spineView = mc.BattleViewFactory.createCreatureGUIByIndex(this._evolveToIndex);
        spineView.scale = 1.4;
        spineView.x = this._nodeChar.width * 0.5;
        this._nodeChar.addChild(spineView);
        spineView.setClickAble(true);
        spineView.setVisible(false);
        spineView.setOpacity(0);


        var involveAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_char_evolve_json, res.spine_char_evolve_atlas, 1.0);
        var involveAnimate_back = sp.SkeletonAnimation.createWithJsonFile(res.spine_char_evolve_back_json, res.spine_char_evolve_back_atlas, 1.0);
        this._nodeChar.addChild(involveAnimate);
        this._nodeChar.addChild(involveAnimate_back);
        involveAnimate.setLocalZOrder(1);
        involveAnimate_back.setLocalZOrder(-1);
        involveAnimate.setPositionX(this._nodeChar.width / 2);
        involveAnimate_back.setPositionX(this._nodeChar.width / 2);
        involveAnimate.setEventListener(function (trackEntry, event) {
            var key = event.data.name;
            if (key === "character_appear") {
                oldSpineView.runAction(cc.hide());
                spineView.setVisible(true);
                spineView.runAction(cc.fadeIn(0.3));
                var particleStar = new cc.ParticleSystem(res.particle_star1);
                particleStar.x = spineView.x;
                particleStar.y = spineView.y + 100;
                this._nodeChar.addChild(particleStar);
                var delay = 0.15;
                var dur = 0.25;
                var rank = mc.HeroStock.getHeroRank(heroInfo);
                this.scheduleOnce(function () {
                    spineView.attack();
                    var starLayout = null;
                    if(rank >= 6){
                        starLayout = bb.layout.linear(bb.collection.createArray(rank - 5, function (index) {
                            var icon = new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
                            icon.ignoreContentAdaptWithSize(true);
                            var newScale = 1.0;
                            icon.scale = newScale;
                            icon.scale = 0.0;
                            icon.runAction(cc.sequence([cc.delayTime(delay * (index + 1) + dur * index), cc.scaleTo(0.25, newScale, newScale).easing(cc.easeBackOut())]));
                            return icon;
                        }), 32);
                    }else{
                        starLayout = bb.layout.linear(bb.collection.createArray(rank, function (index) {
                            var icon = new ccui.ImageView("icon/star_purple_small.png", ccui.Widget.PLIST_TEXTURE);
                            icon.ignoreContentAdaptWithSize(true);
                            var newScale = 1.0;
                            icon.scale = newScale;
                            icon.scale = 0.0;
                            icon.runAction(cc.sequence([cc.delayTime(delay * (index + 1) + dur * index), cc.scaleTo(0.25, newScale, newScale).easing(cc.easeBackOut())]));
                            return icon;
                        }), 32);
                    }

                    starLayout.x = this._nodeChar.width * 0.5;
                    starLayout.y = -35;
                    this._nodeChar.addChild(starLayout);

                    var lblHeroName = bb.framework.getGUIFactory().createText(mc.HeroStock.getHeroName(heroInfo), res.font_UTMBienvenue_none_32_export_fnt);
                    lblHeroName.x = this._nodeChar.width * 0.5;
                    lblHeroName.y -= 80;
                    lblHeroName.opacity = 0;
                    lblHeroName.runAction(cc.fadeIn(0.2));
                    this._nodeChar.addChild(lblHeroName);

                    bb.framework.addSpriteFrames(res.patch9_5_plist);
                    var imgBrkPower = new ccui.ImageView("patch9/gradian_black.png", ccui.Widget.PLIST_TEXTURE);
                    imgBrkPower.setString(mc.dictionary.getGUIString("lblPower") + bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(heroInfo)));
                    imgBrkPower.x = this._nodeChar.width * 0.5;
                    imgBrkPower.opacity = 0;
                    imgBrkPower.setCascadeOpacityEnabled(true);
                    imgBrkPower.runAction(cc.sequence([cc.delayTime(delay * (rank) + dur * rank), cc.fadeIn(0.35)]));
                    imgBrkPower.y += 350;
                    this._nodeChar.addChild(imgBrkPower);

                    this._btnDone.runAction(cc.fadeIn(0.5));
                    this._btnBack.runAction(cc.fadeIn(0.5));
                    this._btnBack.registerTouchEvent(function () {
                        var isOk = this._setupSpineHero();
                        if (isOk) {
                            this._nodeShowHero.runAction(cc.sequence([cc.fadeOut(0.5), cc.removeSelf()]));
                            this._screenInvolve.opacity = 0;
                            this._screenInvolve.setVisible(true);
                            this._screenInvolve.runAction(cc.fadeIn(0.5));
                        }
                        else {
                            mc.GameData.guiState.popScreen();
                        }
                    }.bind(this));
                    this._btnDone.registerTouchEvent(function () {
                        new mc.HeroInfoDialog(this._getViewHeroInfo()).show();
                    }.bind(this));
                    involveAnimate.setAnimation(0, "idle", true);
                    involveAnimate_back.setAnimation(0, "idle", true);
                }.bind(this), 0.5);
            } else if (key === "ui_evolve_appear") {
                bb.sound.playEffect(res.sound_ui_evolve_appear);
            } else if (key === "ui_evolve_start") {
                bb.sound.playEffect(res.sound_ui_evolve_start);
            } else if (key === "ui_evolve_ready") {
                bb.sound.playEffect(res.sound_ui_evolve_ready);
            }
        }.bind(this));

        this._nodeChar.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(function () {
            involveAnimate.setAnimation(0, "evolve", false);
            involveAnimate_back.setAnimation(0, "evolve", false);
        }, this)));
    },

    _getPickingArrayItem: function () {
        var _splitByNum = function (arrMaterial, numRequired) {
            var arr = [];
            for (var i = 0; i < arrMaterial.length; i++) {
                var material = arrMaterial[i];
                var num = mc.ItemStock.getItemQuantity(material);
                if (numRequired > num) {
                    numRequired -= num;
                    arr.push(material);
                }
                else {
                    arr.push(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(material), numRequired, mc.ItemStock.getItemId(material)));
                }
            }
            return arr;
        };
        var arrUsedItem = [];
        for (var m = 0; m < this._arrMaterial.length; m++) {
            var material = this._arrMaterial[m];
            var materialIndex = mc.ItemStock.getItemIndex(material);
            var numMaterialRequired = mc.ItemStock.getItemQuantity(material);
            var arrMaterialInStock = mc.GameData.itemStock.getArrayItemByIndex(materialIndex);
            var arr = _splitByNum(arrMaterialInStock, numMaterialRequired);
            arrUsedItem = bb.collection.arrayAppendArray(arrUsedItem, arr);
        }
        return arrUsedItem;
    },

    _getViewHeroInfo: function () {
        return mc.GameData.heroStock.getHeroById(this._currHeroId);
    },

    _updateInvolveUpInfo: function (recipe) {
        var self = this;
        var currHeroInfo = this._getViewHeroInfo();

        var enableUpgrade = true;

        var arrCost = mc.ItemStock.createArrJsonItemFromStr(mc.dictionary.getRecipeCost(recipe));
        var mapCost = bb.utility.arrayToMap(arrCost, function (costInfo) {
            return mc.ItemStock.getItemIndex(costInfo);
        });
        var requiredZen = mapCost[mc.const.ITEM_INDEX_ZEN] ? mc.ItemStock.getItemQuantity(mapCost[mc.const.ITEM_INDEX_ZEN]) : 0;
        var requireBless = mapCost[mc.const.ITEM_INDEX_BLESS] ? mc.ItemStock.getItemQuantity(mapCost[mc.const.ITEM_INDEX_BLESS]) : 0;
        this._lblNumZen.setString(bb.utility.formatNumber(requiredZen));
        this._lblNumBless.setString(bb.utility.formatNumber(requireBless));

        var heroAttr = mc.HeroStock.getHeroTotalAttrByLevel(mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(currHeroInfo)), 1);
        this._lblNumAtk.setString(bb.utility.formatNumber(heroAttr.atk));
        this._lblNumHp.setString(bb.utility.formatNumber(heroAttr.hp));
        this._lblNumDef.setString(bb.utility.formatNumber(heroAttr.def));
        this._lblNumRes.setString(bb.utility.formatNumber(heroAttr.res));
        this._lblNumMag.setString(bb.utility.formatNumber(heroAttr.mag));
        this._lblNumSpd.setString(bb.utility.formatNumber(heroAttr.spd));

        var arrView = [this._lblNumZen, this._lblNumBless];
        for (var c = 0; c < arrCost.length; c++) {
            if (mc.ItemStock.isNotEnoughCost(arrCost[c]) && c < arrView.length) {
                arrView[c].setColor(mc.color.RED);
            }
        }

        for (var materialId in this._mapMaterialEnable) {
            if (!this._mapMaterialEnable[materialId]) {
                enableUpgrade = false;
                break;
            }
        }

        var childByName = this._nodeParInvolveSpine.getChildByName("parInvolve");
        if (childByName) {
            childByName.removeFromParent();
        }


        var evolveHero = mc.dictionary.getHeroDictByIndex(this._evolveToIndex);
        var totalAttrInvolve = mc.HeroStock.getHeroTotalAttrByLevel(evolveHero, 1);
        if (totalAttrInvolve) {
            self._lblIncreaseAtk.setString(bb.utility.formatNumber(totalAttrInvolve.atk));
            self._lblIncreaseHp.setString(bb.utility.formatNumber(totalAttrInvolve.hp));
            self._lblIncreaseDef.setString(bb.utility.formatNumber(totalAttrInvolve.def));
            self._lblIncreaseRes.setString(bb.utility.formatNumber(totalAttrInvolve.res));
            self._lblIncreaseMag.setString(bb.utility.formatNumber(totalAttrInvolve.mag));
            self._lblIncreaseSpd.setString(bb.utility.formatNumber(totalAttrInvolve.spd));
            this._btnUpgrade.setGrayForAll(!enableUpgrade);
        }
        else {
            this._btnUpgrade.setVisible(false);
            this._lblIncreaseAtk.setVisible(false);
            this._lblIncreaseHp.setVisible(false);
            this._lblIncreaseDef.setVisible(false);
            this._lblIncreaseRes.setVisible(false);
            this._lblIncreaseRank.setVisible(false);

            this._iconArrowRank.setVisible(false);
            this._iconArrowAtk.setVisible(false);
            this._iconArrowDef.setVisible(false);
            this._iconArrowHp.setVisible(false);
            this._iconArrowRec.setVisible(false);

            this._nodeMaterial.setVisible(false);
            this._lblNumZen.setString(0);
        }
    },

    _loadSkillList: function (heroInfo) {
        var arrPos = [
            cc.p(115.00, 221), cc.p(281, 221), cc.p(446, 221), cc.p(602, 221)
        ];
        var dialog = null;
        var _clickSkillInfo = function (widget, type) {
            var skillInfo = widget.getUserData();
            if (type === ccui.Widget.TOUCH_BEGAN) {
                dialog = new mc.SkillInfoDialog(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getSkillIndexOfHero(skillInfo), undefined, this._evolveToIndex)
                    .setShowPosition(widget)
                    .show();
            }
            else if (type === ccui.Widget.TOUCH_ENDED ||
                type === ccui.Widget.TOUCH_CANCELED) {
                if (dialog) {
                    dialog.close();
                }
            }
        }.bind(this);
        var skillList = mc.HeroStock.getHeroSkillList(heroInfo);
        skillList.sort(function (skillInfo1, skillInfo2) {
            return mc.HeroStock.getSkillPriorityOfHero(skillInfo2) - mc.HeroStock.getSkillPriorityOfHero(skillInfo1);
        });
        var arrSkillWidget = [];
        if (skillList && skillList.length > 0) {
            for (var i = 0; i < skillList.length; i++) {
                var skillWidget = mc.view_utility.createSkillInfoIcon(skillList[i]);
                skillWidget.addTouchEventListener(_clickSkillInfo);
                skillWidget.setTouchEnabled(true);
                skillWidget.x = arrPos[i].x;
                skillWidget.y = arrPos[i].y;
                this._nodeSkillContainer.addChild(skillWidget);
                arrSkillWidget.push(skillWidget);
            }
        }
        while (arrSkillWidget.length < 4) {
            var widget = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
            widget.x = arrPos[arrSkillWidget.length].x;
            widget.y = arrPos[arrSkillWidget.length].y;
            this._nodeSkillContainer.addChild(widget);
            arrSkillWidget.push(widget);
        }
    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_INVOLVE_HERO;
    }

});