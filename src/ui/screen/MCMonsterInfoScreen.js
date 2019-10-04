/**
 * Created by long.nguyen on 5/14/2018.
 */


mc.MonsterInfoScreen = mc.Screen.extend({
    _monsterInfo: null,
    _monsterList: null,

    ctor: function (monsterList, index) {
        this._super();
        this.setMonster(monsterList, index);
    },

    setMonster: function (monsterList, index) {
        //var heroInfo = mc.dictionary.getHeroDictByIndex(heroIndex);
        this._monsterList = monsterList;
        var heroInfo = monsterList[index];
        this._loadMonster(heroInfo);
        this._initMonsterList(monsterList, index);
    },

    _bindMonsterSkill: function (monsterIcon, monsterInfo) {
        if (monsterInfo) {
            var bossInfo = monsList[index];
            var widget = this._widget.clone();
            widget.setVisible(true);
            widget.registerTouchEvent(function () {
                this._viewMonsterInfo(monsList, index);
            }.bind(this));
            var icon = widget.getChildByName("icon");
            var elementIcon = widget.getChildByName("ele");

            var spriteFrame = cc.spriteFrameCache.getSpriteFrame("png/monster/icon/" + bossInfo.img + ".png");
            if (!spriteFrame) {
                cc.log("Not Found: png/monster/icon/" + bossInfo.img);
                icon.loadTexture("png/monster/icon/unknow.png", ccui.Widget.PLIST_TEXTURE);
            }
            else {
                icon.loadTexture("png/monster/icon/" + bossInfo.img + ".png", ccui.Widget.PLIST_TEXTURE);
            }

            var element = mc.HeroStock.getHeroElement(bossInfo);
            if (!element) {
                element = "fire";
            }
            element = element.toLowerCase();
            var urlBrk = null;
            if (element === mc.const.ELEMENT_FIRE) {
                urlBrk = "patch9/Fire_Panel.png";
            }
            else if (element === mc.const.ELEMENT_WATER) {
                urlBrk = "patch9/Water_Panel.png";
            }
            else if (element === mc.const.ELEMENT_EARTH) {
                urlBrk = "patch9/Earth_Panel.png";
            }
            else if (element === mc.const.ELEMENT_DARK) {
                urlBrk = "patch9/Dark_Panel.png";
            }
            else if (element === mc.const.ELEMENT_LIGHT) {
                urlBrk = "patch9/Light_Panel.png";
            }

            widget.loadTexture(urlBrk, ccui.Widget.PLIST_TEXTURE);

            var crystalView = mc.view_utility.createHeroCrystalView(bossInfo);
            elementIcon.addChild(crystalView);
            crystalView.setPosition(elementIcon.width / 2, elementIcon.height / 2);
            widget.setCascadeOpacityEnabled(true);
            widget.setCascadeColorEnabled(true);
            widget.scale = 0.9;
            return widget;
        }
        return monsterIcon;
    },

    _initMonsterList: function (arrMonster, selectAt) {
        this._LvMonsterList && this._LvMonsterList.removeFromParent();
        var arrMonsterWidgets = bb.collection.createArray(arrMonster.length, function (index) {
            var bossInfo = arrMonster[index];
            var widget = this._monsterIcon.clone();
            widget.setVisible(true);
            widget.registerTouchEvent(function () {
                this._loadMonster(bossInfo);
            }.bind(this));
            var icon = widget.getChildByName("icon");
            var elementIcon = widget.getChildByName("ele");

            var spriteFrame = cc.spriteFrameCache.getSpriteFrame("png/monster/icon/" + bossInfo.img + ".png");
            if (!spriteFrame) {
                cc.log("Not Found: png/monster/icon/" + bossInfo.img);
                icon.loadTexture("png/monster/icon/unknow.png", ccui.Widget.PLIST_TEXTURE);
            }
            else {
                icon.loadTexture("png/monster/icon/" + bossInfo.img + ".png", ccui.Widget.PLIST_TEXTURE);
            }

            var element = mc.HeroStock.getHeroElement(bossInfo);
            if (!element) {
                element = "fire";
            }
            element = element.toLowerCase();
            var urlBrk = null;
            if (element === mc.const.ELEMENT_FIRE) {
                urlBrk = "patch9/Fire_Panel.png";
            }
            else if (element === mc.const.ELEMENT_WATER) {
                urlBrk = "patch9/Water_Panel.png";
            }
            else if (element === mc.const.ELEMENT_EARTH) {
                urlBrk = "patch9/Earth_Panel.png";
            }
            else if (element === mc.const.ELEMENT_DARK) {
                urlBrk = "patch9/Dark_Panel.png";
            }
            else if (element === mc.const.ELEMENT_LIGHT) {
                urlBrk = "patch9/Light_Panel.png";
            }

            widget.loadTexture(urlBrk, ccui.Widget.PLIST_TEXTURE);

            var crystalView = mc.view_utility.createHeroCrystalView(bossInfo);
            elementIcon.addChild(crystalView);
            crystalView.setPosition(elementIcon.width / 2, elementIcon.height / 2);
            widget.setCascadeOpacityEnabled(true);
            widget.setCascadeColorEnabled(true);
            widget.scale = 0.9;
            return widget;
        }.bind(this));

        var focus = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_focus_json, res.spine_ui_item_panel_focus_atlas, 1.0);
        focus.setName("itemFocus");
        focus.setScale(0.9, 0.9);
        focus.setAnimation(0, "focus_idle", true);
        // focus.setLocalZOrder(10);

        var layout = this._LvMonsterList = mc.widget_utility.createScrollNode(arrMonsterWidgets, focus, 137, cc.p(cc.winSize.width, 190), {
            clickFunc: function (id) {
                if (this._monsterInfo.index != this._monsterList[id].index) {
                    this._loadingMonsterById(this._monsterList[id].index);
                }
            }.bind(this),
            autoFocusFunc: function (id) {
                if (this._monsterInfo.index != this._monsterList[id].index) {
                    this._loadingMonsterById(this._monsterList[id].index);
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

    _loadingMonsterById: function (id) {
        for (var i = 0; i < this._monsterList.length; i++) {
            if (this._monsterList[i].index === id) {
                this._loadMonster(this._monsterList[i]);
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

    _upgradeMaxLvForHero: function (heroInfo) {
        var newHero = heroInfo;
        var maxLv = mc.HeroStock.getHeroMaxLevel(heroInfo);
        var attr = mc.HeroStock.getHeroTotalAttrByLevel(heroInfo, maxLv);
        for (var key in attr) {
            newHero[key] = attr[key];
        }
        newHero.level = maxLv;
        return newHero
    },

    _loadMonster: function (viewMonsterInfo) {
        this._rootNode && this._rootNode.removeFromParent();

        this._monsterInfo = viewMonsterInfo;
        //var heroInfo = mc.dictionary.getHeroDictByIndex(heroIndex);
        //var viewHeroInfo = this._monsterInfo = JSON.parse(JSON.stringify(heroInfo));
        //viewHeroInfo = this._upgradeMaxLvForHero(viewHeroInfo);
        //viewHeroInfo = this._upgradeMaxLvSkillsForHero(viewHeroInfo);
        //var root = this._rootNode = this.parseCCStudio(res.layer_hero_max_lv_info);
        var node = mc.loadGUI(res.screen_monster_info_json);
        this.addChild(node);
        var root = this._rootNode = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var imgTitle = this._imgTitle = rootMap["imgTitle"];
        var nodeSpine = rootMap["nodeSpine"];
        var lblClass = this._lblClass = rootMap["lblClass"];
        var lblNumPower = this._lblNumDamage = rootMap["lblNumPower"];
        var panelInfo = this._panelInfo = rootMap["panelInfo"];
        this._monsterIcon = rootMap["monsterIcon"];

        this._lvSkill = panelInfo.getChildByName("lvSkill");
        this._cellSkill = panelInfo.getChildByName("cellSkill");


        var btnBack = new ccui.ImageView("button/Back_button.png", ccui.Widget.PLIST_TEXTURE);
        btnBack.x = 50;
        btnBack.y = imgTitle.y;
        btnBack.registerTouchEvent(function () {
            var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_TIER_HERO_STOCK);
            layer.loadRankingHeroes();
        }.bind(this));
        root.addChild(btnBack);
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        var nodeSkillList = this._nodeSkillList = new cc.Node();
        nodeSkillList.setCascadeOpacityEnabled(true);
        panelInfo.addChild(nodeSkillList);


        var panelInfoMap = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });

        var lblName = panelInfoMap["lblName"];
        var nodeElement = panelInfoMap["nodeElement"];
        var lblSkill = panelInfoMap["lblSkill"];
        lblSkill.setString(mc.dictionary.getGUIString("lblSkill"));
        lblSkill.setColor(mc.color.YELLOW_SOFT);



        lblName.setString(mc.HeroStock.getHeroName(viewMonsterInfo));
        lblName.setColor(mc.color.ELEMENTS[mc.HeroStock.getHeroElement(viewMonsterInfo)]);
        nodeElement.addChild(mc.view_utility.createHeroCrystalView(viewMonsterInfo));
        nodeElement.scale = 1.35;


        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("Monster"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);


        var tempBossIndex = viewMonsterInfo.index;
        var _loadFunc = function (bossIndex) {
            var pos = cc.p(0, 0);
            var creatureView = this._bossView = mc.BattleViewFactory.createCreatureGUIByIndex(bossIndex);
            creatureView.setPosition(pos.x, pos.y);
            creatureView.scale = 1.0;
            creatureView.setDirection(mc.CreatureView.DIRECTION_LEFT);
            nodeSpine.addChild(creatureView, 10);
            creatureView.idle();


        }.bind(this);


        var assetData = mc.dictionary.getCreatureAssetByIndex(tempBossIndex);
        if (assetData) {
            var atlasStr = assetData.getSpineString();
            var arrRes = [
                atlasStr + ".json", atlasStr + ".atlas"
            ];
            if (!cc.sys.isNative) {
                cc.loader.load(arrRes, function () {
                }, function () {
                    _loadFunc(tempBossIndex);
                });
            } else {
                _loadFunc(tempBossIndex);
            }
        }

        //var spineView = this._spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(viewMonsterInfo));
        //spineView.scale = 1.4;
        //spineView.setClickAble(true, undefined, viewMonsterInfo);
        //nodeSpine.addChild(spineView);


        //this._updateHeroAttr();
        this._loadSkillList();
    },

    _getSkillList: function (monsterInfo) {
        var skillList = null;
        if (monsterInfo) {
            skillList = monsterInfo.skillIndex;
            if (skillList ) {
                var strs = skillList.split('#');
                skillList = [];
                for (var i = 0; i < strs.length; i++) {
                    skillList.push(mc.dictionary.getSkillByIndex(parseInt(strs[i])));
                }
            }
        }
        return skillList;
    },


    _loadSkillList: function () {
        var skillList = this._getSkillList(this._monsterInfo);
        this._lvSkill.removeAllChildren();

        if (skillList && skillList.length > 0) {
            for (var i = 0; i < skillList.length; i++) {
                var strName = mc.HeroStock.getSkillNameOfHero(skillList[i]);
                var strInfo = mc.HeroStock.getSkillDescriptionOfHero(skillList[i]);
                if (strInfo !== "NONE") {
                    var cell = this._cellSkill.clone();
                    var lblSkillName = cell.getChildByName("lblSkillName");
                    var lblSkillInfo = cell.getChildByName("lblSkillInfo");
                    lblSkillName.setColor(mc.color.BLUE_SOFT);
                    lblSkillName.setString(strName);
                    lblSkillInfo.setString(strInfo);
                    this._lvSkill.pushBackCustomItem(cell);
                }

            }
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

        var monsterInfo = this._monsterInfo;
        var passiveAttr = mc.HeroStock.getPassiveSkillValueAttr(monsterInfo);
        var equipAtk = mc.HeroStock.getItemEquippingValue(monsterInfo, "atk") + passiveAttr["atk"];
        var equipMag = mc.HeroStock.getItemEquippingValue(monsterInfo, "mag") + passiveAttr["mag"];
        var equipHp = mc.HeroStock.getItemEquippingValue(monsterInfo, "hp") + passiveAttr["hp"];
        var equipDef = mc.HeroStock.getItemEquippingValue(monsterInfo, "def") + passiveAttr["def"];
        var equipRes = mc.HeroStock.getItemEquippingValue(monsterInfo, "res") + passiveAttr["res"];
        var equipSpd = mc.HeroStock.getItemEquippingValue(monsterInfo, "spd") + passiveAttr["spd"];

        var exp = mc.HeroStock.getHeroExp(monsterInfo);
        lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + cc.formatStr("%d/%d", mc.HeroStock.getHeroLevel(monsterInfo), mc.HeroStock.getHeroMaxLevel(monsterInfo)));
        //if (exp.total < 0 || mc.HeroStock.isHeroMaxLevel(heroInfo)) {
        lblExp.setString(mc.dictionary.getGUIString("lblMax"));
        lblExp.setColor(mc.color.GREEN_NORMAL);
        progressExp.setPercent(100);
        //}
        //else {
        //    lblExp.setString(bb.utility.formatNumber(exp.curr) + "/" + bb.utility.formatNumber(exp.total));
        //    progressExp.setPercent((exp.curr / exp.total) * 100);
        //}
        lblNumAtk.setString(bb.utility.formatNumber(mc.HeroStock.getHeroAttack(monsterInfo)));
        equipAtk > 0 && lblNumAtk.setDecoratorLabel("+" + bb.utility.formatNumber(equipAtk), mc.color.GREEN);
        lblNumHP.setString(bb.utility.formatNumber(mc.HeroStock.getHeroHp(monsterInfo)));
        equipHp > 0 && lblNumHP.setDecoratorLabel("+" + bb.utility.formatNumber(equipHp), mc.color.GREEN);
        lblNumDef.setString(bb.utility.formatNumber(mc.HeroStock.getHeroDefense(monsterInfo)));
        equipDef > 0 && lblNumDef.setDecoratorLabel("+" + bb.utility.formatNumber(equipDef), mc.color.GREEN);
        lblNumRes.setString(bb.utility.formatNumber(mc.HeroStock.getHeroResistant(monsterInfo)));
        equipRes > 0 && lblNumRes.setDecoratorLabel("+" + bb.utility.formatNumber(equipRes), mc.color.GREEN);
        lblNumMag.setString(bb.utility.formatNumber(mc.HeroStock.getHeroMagic(monsterInfo)));
        equipMag > 0 && lblNumMag.setDecoratorLabel("+" + bb.utility.formatNumber(equipMag), mc.color.GREEN);
        lblNumSpd.setString(bb.utility.formatNumber(mc.HeroStock.getHeroSpeed(monsterInfo)));
        equipSpd > 0 && lblNumSpd.setDecoratorLabel("+" + bb.utility.formatNumber(equipSpd), mc.color.GREEN);
        lblNumPower.setString(bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(monsterInfo)));
        lblClass.setString(mc.HeroStock.getHeroBattleRole(monsterInfo));

    },

    //initResources: function () {
    //
    //},


    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_MONSTER_INFO;
    }

});