/**
 * Created by long.nguyen on 7/27/2017.
 */
mc.HeroMaxLvInfoLayer = mc.MainBaseLayer.extend({

    _heroInfo : null,
    _heroList : null,

    ctor: function () {
        this._super();

    },

    setHero: function (heroesList,index) {
        //var heroInfo = mc.dictionary.getHeroDictByIndex(heroIndex);
        this._heroList = heroesList;
        var heroInfo = heroesList[index];
        this._loadHero(heroInfo);
        this._initHeroList(heroesList,index);
    },

    _initHeroList:function(arrHeroes,selectAt){
        var arrHero = arrHeroes;
        this._lvlHeroList && this._lvlHeroList.removeFromParent();
        var arrHeroesWidgets = bb.collection.createArray(arrHero.length, function (index) {
            var heroInfo = arrHero[index];
            var widget = new mc.HeroAvatarView(heroInfo);
            widget.scale = 0.95;
            var heroId = mc.HeroStock.getHeroIndex(heroInfo);
            widget.heroId = heroId;
            //if (heroId === mc.GameData.guiState.getViewHeroId()) {
            //    self.focusIndex = index;
            //}
            widget.setBlack(!heroInfo.isHas)
            widget.getReturnKey = function () {
                return this.heroId;
            }.bind(widget);

            return widget;
        });

        var focus = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_focus_json, res.spine_ui_item_panel_focus_atlas, 1.0);
        focus.setName("itemFocus");
        focus.setScale(0.9, 0.9);
        focus.setAnimation(0, "focus_idle", true);
        // focus.setLocalZOrder(10);

        var layout = this._lvlHeroList =  mc.widget_utility.createScrollNode(arrHeroesWidgets, focus, 137, cc.p(cc.winSize.width, 190), {
            clickFunc: function (id) {
                if (this._heroInfo.index != id) {
                    this._loadingHeroResById(id);
                }
            }.bind(this),
            autoFocusFunc: function (id) {
                if (this._heroInfo.index != id) {
                    this._loadingHeroResById(id);
                }
            }.bind(this)
        });
        layout.setLoopScroll(true, 5);
        layout.setAnchorPoint(0.5, 0.5);
        layout.setPosition(cc.winSize.width / 2, layout.height / 2);
        layout.focusAt(selectAt || 0, true);
        layout.setLocalZOrder(9);
        this.addChild(layout);
    },

    _loadingHeroResById:function(id){
        for(var i = 0;i<this._heroList.length;i++)
        {
            if(this._heroList[i].index === id)
            {
                this._loadHero(this._heroList[i]);
            }
        }
    },

    _getMaxSkill: function (skillIndex) {
        var skillInfo = mc.dictionary.getSkillByIndex(skillIndex);
        for (var i = 0; i < 10; i++) {
            if (skillInfo.upgradeTo > 0) {
                skillInfo = mc.dictionary.getSkillByIndex(skillInfo.upgradeTo);
            }
            else {
                skillInfo.upgradeTo = null;
                return skillInfo;
            }
        }
        return skillInfo;
    },

    _upgradeMaxLvSkillsForHero: function (heroInfo) {
        var newHero = heroInfo;
        if (heroInfo && heroInfo.skillList) {
            var skillList = heroInfo.skillList;
            for (var i = 0; i < skillList.length; i++) {
                skillList[i] = this._getMaxSkill(skillList[i].index);
            }
            newHero.skillList = skillList;
        }
        return newHero;

    },

    _upgradeMaxLvForHero:function(heroInfo)
    {
        var newHero = heroInfo;
        var maxLv = mc.HeroStock.getHeroMaxLevel(heroInfo);
        var attr = mc.HeroStock.getHeroTotalAttrByLevel(heroInfo,maxLv);
        for(var key in attr ){
            newHero[key] = attr[key];
        }
        newHero.level = maxLv;
        return newHero
    },

    _loadHero: function (viewHeroInfo) {
        this._rootNode && this._rootNode.removeFromParent();

        this._heroInfo = viewHeroInfo;
        //var heroInfo = mc.dictionary.getHeroDictByIndex(heroIndex);
        //var viewHeroInfo = this._heroInfo = JSON.parse(JSON.stringify(heroInfo));
        //viewHeroInfo = this._upgradeMaxLvForHero(viewHeroInfo);
        //viewHeroInfo = this._upgradeMaxLvSkillsForHero(viewHeroInfo);
        var root = this._rootNode = this.parseCCStudio(res.layer_hero_max_lv_info);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = this._imgTitle = rootMap["imgTitle"];
        var nodeSpine = rootMap["nodeSpine"];
        var lblClass = this._lblClass = rootMap["lblClass"];
        var lblNumPower = this._lblNumDamage = rootMap["lblNumPower"];
        var panelInfo = this._panelInfo = rootMap["panelInfo"];

        var nodeSkillList = this._nodeSkillList = new cc.Node();
        nodeSkillList.setCascadeOpacityEnabled(true);
        panelInfo.addChild(nodeSkillList);


        var panelInfoMap = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });

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


        lblName.setString(mc.HeroStock.getHeroName(viewHeroInfo));
        lblName.setColor(mc.color.ELEMENTS[mc.HeroStock.getHeroElement(viewHeroInfo)]);
        nodeElement.addChild(mc.view_utility.createHeroCrystalView(viewHeroInfo));
        nodeElement.scale = 1.35;

        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblHeroInfo"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var spineView = this._spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(viewHeroInfo));
        spineView.scale = 1.4;
        spineView.setClickAble(true, undefined, viewHeroInfo);
        nodeSpine.addChild(spineView);

        var layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(mc.HeroStock.getHeroMaxRank(viewHeroInfo), function (index) {
            if (index < mc.HeroStock.getHeroRank(viewHeroInfo)) {
                return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
            }
            return new ccui.ImageView("icon/Disable_Star.png", ccui.Widget.PLIST_TEXTURE);
        }), 0);
        layoutStar.setCascadeOpacityEnabled(true);
        layoutStar.setCascadeColorEnabled(true);
        layoutStar.scale = 0.75;
        layoutStar.y = -45;
        nodeSpine.addChild(layoutStar);


        this._updateHeroAttr();
        this._loadSkillList();
    },


    onLayerClearStack: function () {
        this._spineView.unloadAllEffectSound();
    },


    _loadSkillList: function () {
        var _clickSkillInfo = function (widget) {
            var skillInfo = widget.getUserData();
            new mc.SkillInfoDialog(this._heroInfo.index, mc.HeroStock.getSkillIndexOfHero(skillInfo), function () {
                this._updateHeroAttr();
                this._loadSkillList();
                this._lblNumDamage.setString(bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(this._getViewHeroInfo())));
            }.bind(this)).show();
        }.bind(this);

        var arrPos = [
            cc.p(111.46, 85), cc.p(268.89, 85), cc.p(432.96, 85), cc.p(588.96, 85)
        ];
        this._nodeSkillList.removeAllChildren();
        var heroInfo = this._heroInfo;
        //var heroInfo = this._getViewHeroInfo();
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
                        var plusBtn = new ccui.ImageView("button/btn_cross.png", ccui.Widget.PLIST_TEXTURE);
                        plusBtn.scale = 0.8;
                        plusBtn.x = skillWidget.width - plusBtn.width * 0.5;
                        plusBtn.y = plusBtn.height * 0.5;
                        skillWidget.addChild(plusBtn);
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

        var heroInfo = this._heroInfo;
        var passiveAttr = mc.HeroStock.getPassiveSkillValueAttr(heroInfo);
        var equipAtk = mc.HeroStock.getItemEquippingValue(heroInfo, "atk") + passiveAttr["atk"];
        var equipMag = mc.HeroStock.getItemEquippingValue(heroInfo, "mag") + passiveAttr["mag"];
        var equipHp = mc.HeroStock.getItemEquippingValue(heroInfo, "hp") + passiveAttr["hp"];
        var equipDef = mc.HeroStock.getItemEquippingValue(heroInfo, "def") + passiveAttr["def"];
        var equipRes = mc.HeroStock.getItemEquippingValue(heroInfo, "res") + passiveAttr["res"];
        var equipSpd = mc.HeroStock.getItemEquippingValue(heroInfo, "spd") + passiveAttr["spd"];

        var exp = mc.HeroStock.getHeroExp(heroInfo);
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + cc.formatStr("%d/%d", mc.HeroStock.getHeroLevel(heroInfo), mc.HeroStock.getHeroMaxLevel(heroInfo)));
        //if (exp.total < 0 || mc.HeroStock.isHeroMaxLevel(heroInfo)) {
        lblExp.setString(mc.dictionary.getGUIString("lblMax"));
        lblExp.setColor(mc.color.GREEN_NORMAL);
        progressExp.setPercent(100);
        //}
        //else {
        //    lblExp.setString(bb.utility.formatNumber(exp.curr) + "/" + bb.utility.formatNumber(exp.total));
        //    progressExp.setPercent((exp.curr / exp.total) * 100);
        //}
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


    getLayerId: function () {
        return mc.MainScreen.LAYER_HERO_MAX_LV_INFO;
    },

    isShowHeader: function () {
        return false;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }
});

