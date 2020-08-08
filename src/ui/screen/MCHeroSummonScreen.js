/**
 * Created by long.nguyen on 7/11/2017.
 */
mc.HeroSummonScreen = mc.Screen.extend({

    ctor: function (summonHeroPuzzle, backToScreenCallback) {
        this._super();
        bb.sound.preloadEffect(res.sound_ui_summon_iconhero_appear);
        bb.sound.preloadEffect(res.sound_ui_summon_hero_appear);
        this.summonHeroPuzzle = summonHeroPuzzle;
        this.backToScreenCallback = backToScreenCallback;
    },

    getPreLoadURL: function () {
        return mc.resource.getSummonHeroesPreLoadURL();
    },

    _animateStarDropDown: function (heroInfo) {

        var spineView = this._spineView;
        var summonURL = mc.view_utility.getSummonResourceFromHeroInfo(heroInfo);

        var particleStarTail = new cc.ParticleSystem(summonURL.particleStarTailURL);
        particleStarTail.x = cc.winSize.width * 0.5;
        particleStarTail.y = cc.winSize.height;
        particleStarTail.runAction(cc.sequence([cc.moveTo(0.25, cc.p(this._nodeHero.x, this._nodeHero.y)), cc.removeSelf(), cc.callFunc(function () {
            var particleExplosion = new cc.ParticleSystem(summonURL.particleExplosionURL);
            particleExplosion.scale = 1.5;
            particleExplosion.x = this._nodeHero.x;
            particleExplosion.y = this._nodeHero.y;
            particleExplosion.runAction(cc.sequence([cc.delayTime(2.0), cc.removeSelf()]));
            this.addChild(particleExplosion);
            bb.sound.playEffect(res.sound_ui_summon_hero_appear);
        }.bind(this))]));
        this.addChild(particleStarTail);

        var front = sp.SkeletonAnimation.createWithJsonFile(res.spine_summon_end_front_json, res.spine_summon_end_front_atlas, 1.0);
        front.scale = 1.5;
        front.x = this._nodeChar.width * 0.5;
        var back = sp.SkeletonAnimation.createWithJsonFile(res.spine_summon_end_back_json, res.spine_summon_end_back_atlas, 1.0);
        back.scale = 1.5;
        back.x = this._nodeChar.width * 0.5;

        front.setAnimation(0, "summon_end_front", false);
        back.setAnimation(0, "summon_end_back", false);

        back.setLocalZOrder(-1);
        this._nodeChar.addChild(front);
        this._nodeChar.addChild(back);
        spineView && spineView.setVisible(false);
        this._nodeChar.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(function () {
            spineView && spineView.setVisible(true);
            var particleStar = new cc.ParticleSystem(res.particle_star1);
            if( spineView ){
                particleStar.x = spineView.x;
                particleStar.y = spineView.y + 100;
            }
            this._nodeChar.addChild(particleStar);
            var delay = 0.15;
            var dur = 0.25;
            var rank = mc.HeroStock.getHeroRank(heroInfo);
            this.scheduleOnce(function () {
                spineView && spineView.attack();
                var starLayout = bb.layout.linear(bb.collection.createArray(rank, function (index) {
                    var icon = new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
                    icon.ignoreContentAdaptWithSize(true);
                    var newScale = 1.0;
                    icon.scale = newScale;
                    icon.scale = 0.0;
                    icon.runAction(cc.sequence([cc.delayTime(delay * (index + 1) + dur * index), cc.scaleTo(0.25, newScale, newScale).easing(cc.easeBackOut())]));
                    return icon;
                }), 32);
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

                this._btnOk.runAction(cc.fadeIn(0.5));
                this._btnDone.runAction(cc.fadeIn(0.5));
                this._btnBack.runAction(cc.fadeIn(0.5));
                this._btnDone.registerTouchEvent(function () {
                    this._showHeroInfoScreen(heroInfo);
                }.bind(this));
                if (!this._isSummonTenth()) {
                    var clickFunc = function () {
                        if (this._spineView) {
                            this._spineView.unloadAllEffectSound();
                            this._spineView = null;
                        }
                        if (this.summonHeroPuzzle) {
                            if(this.backToScreenCallback){
                                this.backToScreenCallback();
                            }else{
                                this._showHomeWithItemsScreen();
                            }
                        } else {
                            this._showSummonScreen();
                        }
                    }.bind(this);
                    this._btnBack.registerTouchEvent(clickFunc);
                    this._btnOk.registerTouchEvent(clickFunc);
                }
                else {
                    var clickFunc1 = function () {
                        if (this._spineView) {
                            this._spineView.unloadAllEffectSound();
                            this._spineView = null;
                        }
                        if (this._arrNodeGem && (this._currShowNodeGem < this._arrNodeGem.length)) {
                            this._nodeChar.removeAllChildren();
                            var nodeGem = this._arrNodeGem[this._currShowNodeGem];
                            nodeGem.runAction(cc.sequence([cc.fadeOut(0.5)]));
                            var pos = nodeGem.getParent().convertToWorldSpace(cc.p(nodeGem.x, nodeGem.y));
                            var avtView = new mc.HeroAvatarView(nodeGem.getUserData());
                            avtView.x = pos.x;
                            avtView.y = pos.y;
                            avtView.opacity = 0;
                            avtView.runAction(cc.sequence([cc.fadeIn(0.5), cc.callFunc(function () {
                                var sprNew = mc.view_utility.createTextNew(cc.scaleTo(0.35, 1.0).easing(cc.easeBackOut()));
                                sprNew.x = sprNew.width * 0.5;
                                sprNew.y = avtView.height - sprNew.height * 0.5;
                                sprNew.scale = 0;
                                avtView.addChild(sprNew);
                            }.bind(this))]));
                            this._panelShowTenthGem.addChild(avtView);

                            this._currShowNodeGem++;
                            if (this._currShowNodeGem < this._arrNodeGem.length) {
                                var nodeGem = this._arrNodeGem[this._currShowNodeGem];
                                this._showGemExplosion(nodeGem);
                            }
                            else {
                                this._panelShowTenthGem.setVisible(true);
                                this._nodeShowHero.setVisible(false);
                                this._onEndAnimation();
                            }
                        }
                    }.bind(this);
                    this._btnBack.registerTouchEvent(clickFunc1);
                    this._btnOk.registerTouchEvent(clickFunc1);
                }

                this.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(this.onCompleteSummon.bind(this))]));
            }.bind(this), 0.5);

        }.bind(this))]));

        var dur = 2.0;
        front.runAction(cc.sequence([cc.delayTime(dur), cc.removeSelf()]));
        back.runAction(cc.sequence([cc.delayTime(dur), cc.removeSelf()]));
    },

    onCompleteSummon: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_HERO_SUMMON);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_BACK_BUTTON) {
                var btn = this._btnBack || this._btnDone;
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(btn)
                    .setScaleHole(1.5)
                    .show();
            }
        }
    },

    initResources: function () {
        var screen = this._nodeShowHero = mc.loadGUI(res.layer_hero_summon);
        var root = screen.getChildByName("root");
        var nodeParticle = root.getChildByName("nodeParticle");
        var hero = this._nodeHero = root.getChildByName("hero");
        var panelInfo = root.getChildByName("panelInfo");
        var btnDone = this._btnDone = root.getChildByName("btnDone");
        var btnOk = this._btnOk = root.getChildByName("btnOk");
        var btnBack = this._btnBack = root.getChildByName("btnBack");
        var char = this._nodeChar = hero.getChildByName("char");
        var imgWheel = hero.getChildByName("containerWheel").getChildByName("imgWheel");
        imgWheel.runAction(cc.rotateBy(0.01, -1).repeatForever());

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
        this.addChild(this._nodeShowHero);

        btnOk.opacity = 0;
        btnDone.opacity = 0;
        btnBack.opacity = 0;
        btnDone.setString(mc.dictionary.getGUIString("lblViewInfo"));
        btnOk.setString(mc.dictionary.getGUIString("lblOk"));

        var arrHeroSummonInfo = mc.GameData.summonManager.getArraySummonHero();
        if (!arrHeroSummonInfo) {
            arrHeroSummonInfo = mc.GameData.heroStock.getHeroList();
        }
        if (arrHeroSummonInfo.length > 1) {
            this._showTenthGem(arrHeroSummonInfo);

        }
        else {
            this._showHero(arrHeroSummonInfo[0]);
        }
    },

    _onEndAnimation: function () {
        var btnBack = new ccui.ImageView("button/Back_button.png", ccui.Widget.PLIST_TEXTURE);
        btnBack.registerTouchEvent(function () {
            if (this.summonHeroPuzzle) {
                if(this.backToScreenCallback){
                    this.backToScreenCallback();
                }else{
                    this._showHomeWithItemsScreen();
                }
            } else {
                this._showSummonScreen();
            }
        }.bind(this));
        btnBack.scale = 0;
        btnBack.x = 67.50;
        btnBack.y = (cc.winSize.height - mc.const.DEFAULT_HEIGHT) * 0.5 + mc.const.DEFAULT_HEIGHT * 0.95;
        btnBack.runAction(cc.scaleTo(0.3, 1.0).easing(cc.easeBackOut()));
        btnBack.setLocalZOrder(99999);
        this.addChild(btnBack);
        if (this._btnSkip) {
            this._btnSkip.runAction(cc.fadeOut(0.2));
        }
        this._registerViewHeroInfo();
    },

    _registerViewHeroInfo: function () {
        var arrAvtHero = this._panelShowTenthGem.getChildren();
        for (var h = 0; h < arrAvtHero.length; h++) {
            var avt = arrAvtHero[h];
            if (avt instanceof mc.HeroAvatarView) {
                avt.registerTouchEvent(function (widget) {
                    var heroInfo = widget.getUserData();
                    this._showHeroInfoScreen(heroInfo);
                }.bind(this));
            }
        }
    },

    onScreenClose: function () {
        mc.GameData.summonManager.clearSummonData();
    },

    _isSummonTenth: function () {
        return this._panelShowTenthGem != null;
    },

    _showSummonScreen: function () {
        mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_SUMMON_LIST);
        mc.GameData.guiState.setStackLayerIdForMainScreen([
            mc.MainScreen.LAYER_HOME,
            mc.MainScreen.LAYER_SUMMON_LIST
        ]);
        new mc.MainScreen().show();
    },

    _showHomeWithItemsScreen: function () {
        mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_ITEM_STOCK);
        mc.GameData.guiState.setStackLayerIdForMainScreen([
            mc.MainScreen.LAYER_HOME,
            mc.MainScreen.LAYER_ITEM_STOCK
        ]);
        new mc.MainScreen().show();
    },

    _showHeroInfoScreen: function (heroInfo) {
        //mc.GameData.guiState.setCurrentViewHeroId(mc.HeroStock.getHeroId(heroInfo));
        //mc.GameData.guiState.setStackLayerIdForMainScreen([
        //    mc.MainScreen.LAYER_HOME,
        //    mc.MainScreen.LAYER_HERO_STOCK,
        //    mc.MainScreen.LAYER_HERO_INFO
        //]);
        //new mc.MainScreen().show();
        new mc.HeroInfoDialog(heroInfo).show();
    },

    _showHero: function (heroInfo) {
        var layerColor = new cc.LayerColor(cc.color.WHITE);
        layerColor.setLocalZOrder(99);
        this.addChild(layerColor);
        layerColor.runAction(cc.sequence([cc.fadeOut(1.0), cc.removeSelf(), cc.callFunc(function () {
            this._animateStarDropDown(heroInfo);
        }.bind(this))]));
        if (this._panelShowTenthGem) {
            this._panelShowTenthGem.setVisible(false);
        }
        this._nodeShowHero.setVisible(true);
        this._btnDone.opacity = 0;
        this._btnOk.opacity = 0;

        var spineView = this._spineView = mc.BattleViewFactory.createCreatureViewByIndex(mc.HeroStock.getHeroIndex(heroInfo));
        spineView.scale = 1.5;
        spineView.x = this._nodeChar.width * 0.5;
        this._nodeChar.addChild(spineView);
        spineView.setClickAble(true, undefined, heroInfo);
        spineView.setVisible(false);
    },

    _showTenthGem: function (arrHeroSummonInfo) {
        var panelShowTenthGem = this._panelShowTenthGem = new ccui.Layout();
        panelShowTenthGem.width = cc.winSize.width;
        panelShowTenthGem.height = cc.winSize.height;
        panelShowTenthGem.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        panelShowTenthGem.setBackGroundColor(cc.color.BLACK);
        this.addChild(this._panelShowTenthGem);
        var layerColor = new cc.LayerColor(cc.color.WHITE);
        layerColor.setLocalZOrder(99);
        panelShowTenthGem.addChild(layerColor);
        layerColor.runAction(cc.sequence([cc.fadeOut(2.0), cc.removeSelf(), cc.callFunc(function () {
        }.bind(this))]));
        this._initTenthGem(arrHeroSummonInfo);
        this._panelShowTenthGem.setVisible(true);
        this._nodeShowHero.setVisible(false);

        var btnSkip = this._btnSkip = new ccui.ImageView("button/btn_skip.png", ccui.Widget.PLIST_TEXTURE);
        var lblRedeem = btnSkip.setString(mc.dictionary.getGUIString("lblSkip"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblRedeem.x = btnSkip.width * 0.63;
        lblRedeem.setScale(0.7);
        btnSkip.registerTouchEvent(function () {
            bb.sound.playEffect(res.sound_ui_summon_iconhero_appear);
            this._btnSkip.runAction(cc.fadeOut(0.3));
            this._btnSkip.setEnabled(false);
            this._skipShowTenGemAnimation();
        }.bind(this));
        btnSkip.x = cc.winSize.width - 127.50;
        btnSkip.y = (cc.winSize.height - mc.const.DEFAULT_HEIGHT) * 0.5 + mc.const.DEFAULT_HEIGHT * 0.95;
        this._panelShowTenthGem.addChild(btnSkip);
    },

    _initTenthGem: function (arrHeroSummonInfo) {
        var _createGem = function (heroInfo) {
            var summonRes = mc.view_utility.getSummonResourceFromHeroInfo(heroInfo);
            var imgGem = new cc.Sprite(summonRes.gemURL);
            imgGem.scale = 0.5;
            var glory = mc.view_utility.createGlory(summonRes.gloryCode);
            glory.scale = 0.25;
            var node = new cc.Node();
            node.anchorX = node.anchorY = 0.5;
            node.width = imgGem.width
            node.height = imgGem.height;
            imgGem.x = glory.x = node.width * 0.5;
            imgGem.y = glory.y = node.height * 0.5;
            node.addChild(glory);
            node.addChild(imgGem);
            node.setCascadeOpacityEnabled(true);
            node.setUserData(heroInfo);
            return node;
        };
        var i = 0;
        var arrNodeGem = this._arrNodeGem = [];
        var arrHero1 = [arrHeroSummonInfo[i++], arrHeroSummonInfo[i++], arrHeroSummonInfo[i++]];
        var layout1 = bb.layout.linear(bb.collection.createArray(3, function (index) {
            var imgGem = _createGem(arrHero1[index]);
            arrNodeGem.push(imgGem);
            return imgGem;
        }), 20);

        var arrHero2 = [arrHeroSummonInfo[i++], arrHeroSummonInfo[i++], arrHeroSummonInfo[i++]];
        var layout2 = bb.layout.linear(bb.collection.createArray(3, function (index) {
            var imgGem = _createGem(arrHero2[index]);
            arrNodeGem.push(imgGem);
            return imgGem;
        }), 20);

        var arrHero3 = [arrHeroSummonInfo[i++], arrHeroSummonInfo[i++], arrHeroSummonInfo[i++]];
        var layout3 = bb.layout.linear(bb.collection.createArray(3, function (index) {
            var imgGem = _createGem(arrHero3[index]);
            arrNodeGem.push(imgGem);
            return imgGem;
        }), 20);

        var arrHero4 = [];
        for (; i < arrHeroSummonInfo.length; i++) {
            arrHero4.push(arrHeroSummonInfo[i]);
        }
        var layout4 = bb.layout.linear(bb.collection.createArray(arrHero4.length, function (index) {
            var imgGem = _createGem(arrHero4[index]);
            arrNodeGem.push(imgGem);
            return imgGem;
        }), 20);

        layout1.x = cc.winSize.width * 0.5;
        layout1.y = cc.winSize.height * 0.8;
        layout2.x = cc.winSize.width * 0.5;
        layout2.y = cc.winSize.height * 0.6;
        layout3.x = cc.winSize.width * 0.5;
        layout3.y = cc.winSize.height * 0.4;
        layout4.x = cc.winSize.width * 0.5;
        layout4.y = cc.winSize.height * 0.2;

        var self = this;
        this._currShowNodeGem = 0;
        this.scheduleOnce(function () {
            self._showGemExplosion(this._arrNodeGem[this._currShowNodeGem]);
        }, 1.5);

        this._panelShowTenthGem.addChild(layout1);
        this._panelShowTenthGem.addChild(layout2);
        this._panelShowTenthGem.addChild(layout3);
        this._panelShowTenthGem.addChild(layout4);
    },

    _skipShowTenGemAnimation: function () {
        this._isSkipAnimation = true;
        for (var i = this._currShowNodeGem; i < this._arrNodeGem.length; i++) {
            var nodeGem = this._arrNodeGem[i];
            var particleCharge = new cc.ParticleSystem(res.particle_summon_center_charge_plist);
            particleCharge.x = nodeGem.width * 0.5;
            particleCharge.y = nodeGem.height * 0.5;
            particleCharge.scale = 0.65;
            var pos = nodeGem.getParent().convertToWorldSpace(cc.p(nodeGem.x, nodeGem.y));
            nodeGem.addChild(particleCharge);
            var particleExplode = new cc.ParticleSystem(res.particle_summon_center_explosion_plist);
            particleExplode.x = pos.x;
            particleExplode.y = pos.y;
            this.addChild(particleExplode);
            var avtView = new mc.HeroAvatarView(nodeGem.getUserData());
            avtView.x = pos.x;
            avtView.y = pos.y;
            avtView.opacity = 0;
            avtView.runAction(cc.sequence([cc.fadeIn(0.5), cc.callFunc(function () {
                particleExplode.removeFromParent();
            })]));
            if (mc.GameData.summonManager.isNewSummonHero(nodeGem.getUserData())) {
                var sprNew = mc.view_utility.createTextNew(cc.scaleTo(0.35, 1.0).easing(cc.easeBackOut()));
                sprNew.x = sprNew.width * 0.5;
                sprNew.y = avtView.height - sprNew.height * 0.5;
                sprNew.scale = 0;
                avtView.addChild(sprNew);
            }
            this._panelShowTenthGem.addChild(avtView);
            nodeGem.runAction(cc.fadeOut(0.5));
        }
        this._onEndAnimation();
    },

    _showGemExplosion: function (nodeGem) {
        this._btnSkip && this._btnSkip.setEnabled(true);
        if (!this._isSkipAnimation) {
            this._panelShowTenthGem.setVisible(true);
            this._nodeShowHero.setVisible(false);
            var self = this;
            var particleCharge = new cc.ParticleSystem(res.particle_summon_center_charge_plist);
            particleCharge.x = nodeGem.width * 0.5;
            particleCharge.y = nodeGem.height * 0.5;
            particleCharge.scale = 0.65;
            var pos = nodeGem.getParent().convertToWorldSpace(cc.p(nodeGem.x, nodeGem.y));
            nodeGem.addChild(particleCharge);
            nodeGem.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function () {
                var particleExplode = new cc.ParticleSystem(res.particle_summon_center_explosion_plist);
                particleExplode.x = pos.x;
                particleExplode.y = pos.y;
                self.addChild(particleExplode);
                if (self._currShowNodeGem < self._arrNodeGem.length) {
                    bb.sound.playEffect(res.sound_ui_summon_iconhero_appear);
                    if (mc.GameData.summonManager.isNewSummonHero(nodeGem.getUserData())) {
                        this._btnSkip && this._btnSkip.setEnabled(false);
                        var layerColor = new cc.LayerColor(cc.color.WHITE);
                        layerColor.setLocalZOrder(99);
                        layerColor.opacity = 0;
                        layerColor.runAction(cc.sequence([cc.fadeIn(0.5), cc.callFunc(function () {
                            var nodeGem = self._arrNodeGem[self._currShowNodeGem];
                            if (!self._isSkipAnimation) {
                                self._showHero(nodeGem.getUserData());
                            }
                        }), cc.removeSelf()]));
                        self.addChild(layerColor);
                    }
                    else {
                        nodeGem.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(function () {
                            nodeGem.runAction(cc.sequence([cc.fadeOut(0.5)]));
                            var avtView = new mc.HeroAvatarView(nodeGem.getUserData());
                            avtView.x = pos.x;
                            avtView.y = pos.y;
                            avtView.opacity = 0;
                            avtView.runAction(cc.sequence([cc.fadeIn(0.5), cc.callFunc(function () {
                                //particleCharge.stopSystem();
                                particleExplode.removeFromParent();
                            })]));
                            self._panelShowTenthGem.addChild(avtView);
                            self._currShowNodeGem++;
                            if (self._currShowNodeGem < self._arrNodeGem.length) {
                                self._showGemExplosion(self._arrNodeGem[self._currShowNodeGem]);
                            }
                            else {
                                self._onEndAnimation();
                            }
                        })]));
                    }
                }
            })]));
        }
    },

    onBackEvent: function () {
        return true;
    }

});