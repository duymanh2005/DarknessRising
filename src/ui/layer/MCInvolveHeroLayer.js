/**
 * Created by long.nguyen on 8/9/2017.
 */
mc.InvolveHeroLayer = mc.MainBaseLayer.extend({
    _mapMaterialEnable: null,
    _isShowHeader: true,

    ctor: function (parseNode) {
        this._super();

        this._mapMaterialEnable = {};

        var viewHeroId = mc.GameData.guiState.getViewHeroId();
        this._currHeroId = viewHeroId;
        var currHeroInfo = this._getViewHeroInfo();

        var root = this.parseCCStudio(parseNode || res.layer_involve_hero);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var imgTitle = this._imgTitle = rootMap["imgTitle"];
        var nodeSpine = this._nodeSpine = rootMap["nodeSpine"];
        var btnInfo = rootMap["btnInfo"];
        var panelInfo = this._panelInfo = rootMap["panelInfo"];
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

        var nodeAvt = this._nodeAvt = panelInfoMap["nodeAvt"];
        var tabStats = panelInfoMap["tabStats"];
        var tabSkill = panelInfoMap["tabSkill"];
        var lblRank = this._lblRank = panelInfoMap["lblRank"];
        var lblNumAtk = this._lblNumAtk = panelInfoMap["lblNumAtk"];
        var lblNumHP = this._lblNumHP = panelInfoMap["lblNumHP"];
        var lblNumDef = this._lblNumDef = panelInfoMap["lblNumDef"];
        var lblNumReS = this._lblNumRec = panelInfoMap["lblNumRes"];
        var lblAtk = panelInfoMap["lblAtk"];
        var lblHp = panelInfoMap["lblHp"];
        var lblRec = panelInfoMap["lblRec"];
        var lblDef = panelInfoMap["lblDef"];
        var iconArrowRank = this._iconArrowRank = panelInfoMap["iconArrowRank"];
        var iconArrowAtk = this._iconArrowAtk = panelInfoMap["iconArrowAtk"];
        var iconArrowDef = this._iconArrowDef = panelInfoMap["iconArrowDef"];
        var iconArrowHp = this._iconArrowHp = panelInfoMap["iconArrowHp"];
        var iconArrowRec = this._iconArrowRec = panelInfoMap["iconArrowRec"];
        var lblIncreaseRank = this._lblIncreaseRank = panelInfoMap["lblIncreaseRank"];
        var lblIncreaseAtk = this._lblIncreaseAtk = panelInfoMap["lblIncreaseAtk"];
        var lblIncreaseHp = this._lblIncreaseHp = panelInfoMap["lblIncreaseHp"];
        var lblIncreaseRec = this._lblIncreaseRec = panelInfoMap["lblIncreaseRec"];
        var lblIncreaseDef = this._lblIncreaseDef = panelInfoMap["lblIncreaseDef"];
        var nodeEquipExp = this._nodeEquipExp = panelInfoMap["nodeEquipExp"];

        var lblZen = panelInfoMap["lblZen"];
        var lblNumZen = this._lblNumZen = panelInfoMap["lblNumZen"];
        var btnUpgrade = this._btnUpgrade = panelInfoMap["btnUpgrade"];

        btnUpgrade.setString(mc.dictionary.getGUIString("lblInvolve"), res.font_cam_stroke_32_export_fnt, mc.const.FONT_SIZE_32);

        lblRank.setColor(mc.color.YELLOW);
        lblAtk.setColor(mc.color.BLUE);
        lblHp.setColor(mc.color.BLUE);
        lblRec.setColor(mc.color.BLUE);
        lblDef.setColor(mc.color.BLUE);
        lblIncreaseAtk.setColor(mc.color.GREEN);
        lblIncreaseHp.setColor(mc.color.GREEN);
        lblIncreaseDef.setColor(mc.color.GREEN);
        lblIncreaseRec.setColor(mc.color.GREEN);
        lblNumZen.setColor(mc.color.YELLOW);

        this._setupSpineHero();
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
        }

        var itemStock = mc.GameData.itemStock;
        if (this._spineView) {
            this._spineView.removeFromParent();
        }
        if (this._layoutStar) {
            this._layoutStar.removeFromParent();
        }
        if (this._nodeAvt) {
            this._nodeAvt.removeAllChildren();
        }
        if (this._nodeEquipExp) {
            this._nodeEquipExp.removeAllChildren();
        }
        var self = this;

        var nodeSpine = this._nodeSpine;
        var nodeAvt = this._nodeAvt;
        var spineView = this._spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(heroInfo));
        spineView.scale = 1.5;
        spineView.setClickAble(true, undefined, heroInfo);
        nodeSpine.addChild(spineView);
        nodeAvt.addChild(new mc.HeroAvatarView(heroInfo).setVisibleSurfaceInfo(false));

        var heroRank = mc.HeroStock.getHeroRank(heroInfo);
        var layoutStar = null;
        if(heroRank >= 6){
            layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(heroRank - 5, function (index) {
                return new ccui.ImageView("icon/star_purple_small.png", ccui.Widget.PLIST_TEXTURE);
            }), 0);
        }else{
            layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(heroRank, function (index) {
                return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
            }), 0);
        }
        layoutStar.setCascadeOpacityEnabled(true);
        layoutStar.setCascadeColorEnabled(true);
        layoutStar.scale = 0.75;
        layoutStar.y = -45;
        nodeSpine.addChild(layoutStar);

        var recipe = mc.dictionary.getRecipeInvolveHeroByParam(mc.HeroStock.getHeroClassGroup(heroInfo), mc.HeroStock.getHeroRank(heroInfo) + 1,mc.HeroStock.getHeroElement(heroInfo));
        var arrMaterial = this._arrMaterial = bb.utility.mapToArray(mc.dictionary.getRecipeMaterialMap(recipe));
        var layoutSlot = bb.layout.grid(bb.collection.createArray(arrMaterial.length, function (index) {
            var materialRequired = arrMaterial[index];
            var materialIndex = mc.ItemStock.getItemIndex(materialRequired);
            var numTotalMaterial = mc.ItemStock.getTotalQuantityByItemArray(itemStock.getArrayItemByIndex(materialIndex));
            var materialInStock = mc.ItemStock.createJsonItemInfo(materialIndex, numTotalMaterial);
            self._mapMaterialEnable[materialIndex] = numTotalMaterial >= mc.ItemStock.getItemQuantity(materialRequired);
            var itemView = new mc.ItemView(materialInStock);
            itemView.setDetailQuantityMode(mc.ItemStock.getItemQuantity(materialRequired));
            return itemView;
        }), arrMaterial.length, this._panelInfo.width - 20);
        layoutSlot.setCascadeOpacityEnabled(true);
        layoutSlot.setCascadeColorEnabled(true);
        this._nodeEquipExp.addChild(layoutSlot);

        this._updateInvolveUpInfo(recipe);

        this._imgTitle._maxLblWidth = this._imgTitle.width - 80;
        var lblTitle = this._imgTitle.setString(heroInfo.name, res.font_UTMBienvenue_none_32_export_fnt);
        if (lblTitle) {
            lblTitle.y = this._imgTitle.height * 0.65;
        }

        this._btnUpgrade.registerTouchEvent(function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.rankUpHero(mc.HeroStock.getHeroId(this._getViewHeroInfo()), this._getPickingArrayItem(), function (heroInfo) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (heroInfo) {
                    this._animateInvolveUp(heroInfo);
                }
            }.bind(this));
        }.bind(this));
    },

    _animateInvolveUp: function (heroInfo) {
        var mainScreen = this.getMainScreen();
        this._isShowHeader = false;
        mainScreen.setShowingHeaderAnimation(false);
        mainScreen.getButtonBack().runAction(cc.fadeOut(0.3));
        this._imgTitle.runAction(cc.fadeOut(0.3));
        this._panelInfo.runAction(cc.fadeOut(0.3));

        var _summonHero = function () {
            var summonURL = mc.view_utility.getSummonResourceFromHeroInfo(heroInfo);
            var particleStarTail = new cc.ParticleSystem(summonURL.particleStarTailURL);
            particleStarTail.x = cc.winSize.width * 0.5;
            particleStarTail.y = cc.winSize.height;
            particleStarTail.runAction(cc.sequence([cc.moveTo(0.25, cc.p(this._nodeSpine.x, this._nodeSpine.y)), cc.removeSelf(), cc.callFunc(function () {
                var particleExplosion = new cc.ParticleSystem(summonURL.particleExplosionURL);
                particleExplosion.scale = 1.5;
                particleExplosion.x = this._nodeSpine.x;
                particleExplosion.y = this._nodeSpine.y;
                particleExplosion.runAction(cc.sequence([cc.delayTime(2.0), cc.removeSelf()]));
                this.addChild(particleExplosion);
            }.bind(this)), cc.removeSelf()]));
            this.addChild(particleStarTail);

            var front = sp.SkeletonAnimation.createWithJsonFile(res.spine_summon_end_front_json, res.spine_summon_end_front_atlas, 1.0);
            front.scale = 1.5;
            var back = sp.SkeletonAnimation.createWithJsonFile(res.spine_summon_end_back_json, res.spine_summon_end_back_atlas, 1.0);
            back.scale = 1.5;
            front.setLocalZOrder(1);
            back.setLocalZOrder(1);
            this._nodeSpine.addChild(front);
            this._nodeSpine.addChild(back);
            front.setAnimation(0, "summon_end_front", false);
            back.setAnimation(0, "summon_end_back", false);

            this.runAction(cc.sequence([cc.delayTime(0.4), cc.callFunc(function () {
                this._spineView.removeFromParent();
                //this._setupSpineHero(heroInfo);
            }.bind(this))]));

            this.runAction(cc.sequence([cc.delayTime(0.3), cc.callFunc(function () {
                //this._spineView.attack();
                //mainScreen.setShowingHeaderAnimation(true);
                //mainScreen.getButtonBack().runAction(cc.fadeIn(0.3));
                //this._imgTitle.runAction(cc.fadeIn(0.3));
                //this._panelInfo.runAction(cc.fadeIn(0.3));
                //front.removeFromParent();
                //back.removeFromParent();
            }.bind(this))]));
            var viewHeroId = mc.HeroStock.getHeroId(heroInfo);
            mc.GameData.guiState.setCurrentViewHeroId(viewHeroId);
            var layerColor = new cc.LayerColor(cc.color.WHITE);
            layerColor.setLocalZOrder(99);
            layerColor.opacity = 0;
            layerColor.runAction(cc.sequence([cc.fadeIn(0.5), cc.delayTime(0.5), cc.callFunc(function () {
                mainScreen.getButtonBack().runAction(cc.fadeIn(0.3));
                this.getMainScreen().showLayerWithId(mc.MainScreen.LAYER_HERO_INFO);
            }.bind(this))]));
            this.addChild(layerColor);
        }.bind(this);
        this.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(_summonHero)]));
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

        var enableUpgrade = false;
        var requiredZen = mc.dictionary.getRecipeZenCost(recipe);
        this._lblNumZen.setString(bb.utility.formatNumber(requiredZen));

        var heroAttr = mc.HeroStock.getHeroTotalAttr(currHeroInfo);
        this._lblRank.setString(mc.dictionary.getGUIString("lblRank") + " " + mc.HeroStock.getHeroRank(currHeroInfo));
        this._lblIncreaseRank.setString(mc.HeroStock.getHeroRank(currHeroInfo) + 1);
        this._lblNumAtk.setString(bb.utility.formatNumber(heroAttr.atk));
        this._lblNumHP.setString(bb.utility.formatNumber(heroAttr.hp));
        this._lblNumDef.setString(bb.utility.formatNumber(heroAttr.def));
        this._lblNumRec.setString(bb.utility.formatNumber(heroAttr.rec));

        enableUpgrade = mc.GameData.playerInfo.getZen() >= requiredZen;
        if (enableUpgrade) {
            for (var materialId in this._mapMaterialEnable) {
                if (!this._mapMaterialEnable[materialId]) {
                    enableUpgrade = false;
                    break;
                }
            }
        }

        var totalAttrByRank = mc.HeroStock.getHeroTotalAttrByRank(currHeroInfo, mc.HeroStock.getHeroRank(currHeroInfo) + 1);
        if (totalAttrByRank) {
            self._lblIncreaseAtk.setString(bb.utility.formatNumber(totalAttrByRank.atk));
            self._lblIncreaseHp.setString(bb.utility.formatNumber(totalAttrByRank.hp));
            self._lblIncreaseDef.setString(bb.utility.formatNumber(totalAttrByRank.def));
            self._lblIncreaseRec.setString(bb.utility.formatNumber(totalAttrByRank.rec));
            this._btnUpgrade.setGray(!enableUpgrade);
        }
        else {
            this._btnUpgrade.setVisible(false);
            this._lblIncreaseAtk.setVisible(false);
            this._lblIncreaseHp.setVisible(false);
            this._lblIncreaseDef.setVisible(false);
            this._lblIncreaseRec.setVisible(false);
            this._lblIncreaseRank.setVisible(false);

            this._iconArrowRank.setVisible(false);
            this._iconArrowAtk.setVisible(false);
            this._iconArrowDef.setVisible(false);
            this._iconArrowHp.setVisible(false);
            this._iconArrowRec.setVisible(false);

            this._nodeEquipExp.setVisible(false);
            this._lblNumZen.setString(0);
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_INVOLVE_HERO;
    },

    isShowHeader: function () {
        return this._isShowHeader;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});