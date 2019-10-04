/**
 * Created by long.nguyen on 12/6/2017.
 */
mc.HeroInfoDialog = bb.Dialog.extend({

    ctor: function (heroInfo, canViewDetail, quickExchangeCheck, cb) {
        this._super();
        !canViewDetail && (canViewDetail = false);
        var quickExchange = quickExchangeCheck != null;
        //if(cb)
        //{
        //    quickExchange = true;
        //}
        var heroId = mc.HeroStock.getHeroId(heroInfo);
        if (quickExchangeCheck) {
             var mapHeroInInFormation = mc.GameData.teamFormationManager.getMapHeroIdInFormation();
             var partInTeamId = mapHeroInInFormation[heroId];
             var hasEquip = false;
             var mapEquipBySlot = mc.GameData.itemStock.getMapEquippingItemByHeroId(heroId);
             if (mapEquipBySlot) {
                 for (var key in mapEquipBySlot) {
                     if (!!mapEquipBySlot[key]) {
                         hasEquip = true;
                         break;
                     }
                 }
             }
             quickExchange = !partInTeamId && !hasEquip;
        }
        var node = ccs.load(res.widget_hero_popup_info, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var nodeAvt = rootMap["nodeAvt"];
        var lblName = rootMap["lblName"];
        var lblNumLevel = rootMap["lblNumLevel"];
        var lblAttr1 = rootMap["lblAttr1"];
        var lblNumAttr1 = rootMap["lblNumAttr1"];
        var lblAttr2 = rootMap["lblAttr2"];
        var lblNumAttr2 = rootMap["lblNumAttr2"];
        var lblAttr3 = rootMap["lblAttr3"];
        var lblNumAttr3 = rootMap["lblNumAttr3"];
        var lblAttr4 = rootMap["lblAttr4"];
        var lblNumAttr4 = rootMap["lblNumAttr4"];
        var lblAttr5 = rootMap["lblAttr5"];
        var lblNumAttr5 = rootMap["lblNumAttr5"];
        var lblAttr6 = rootMap["lblAttr6"];
        var lblNumAttr6 = rootMap["lblNumAttr6"];
        var btnDetail = rootMap["btnDetail"];
        var btnExchange = rootMap["btnExchange"];
        var btnClose = rootMap["btnClose"];
        var tips = rootMap["text"];

        lblAttr1.setColor(mc.color.BLUE);
        lblAttr2.setColor(mc.color.BLUE);
        lblAttr3.setColor(mc.color.BLUE);
        lblAttr4.setColor(mc.color.BLUE);
        lblAttr5.setColor(mc.color.BLUE);
        lblAttr6.setColor(mc.color.BLUE);

        var heroAvtView = new mc.HeroAvatarView(heroInfo);
        heroAvtView.scale = 0.9;
        heroAvtView.setVisibleSurfaceInfo(false);
        nodeAvt.addChild(heroAvtView);

        var layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(mc.HeroStock.getHeroMaxRank(heroInfo), function (index) {
            if (index < mc.HeroStock.getHeroRank(heroInfo)) {
                return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
            }
            return new ccui.ImageView("icon/Disable_Star.png", ccui.Widget.PLIST_TEXTURE);
        }), 0);
        layoutStar.anchorX = 0;
        layoutStar.x = lblName.x;
        layoutStar.y = lblName.y - 50;
        root.addChild(layoutStar);

        btnDetail.setString(mc.dictionary.getGUIString("lblDetail"));
        btnExchange.setString(mc.dictionary.getGUIString("lblDisarm"));
        lblName.setMultiLineString(mc.HeroStock.getHeroName(heroInfo), 400);
        lblName.setColor(mc.color.YELLOW_SOFT);
        lblNumLevel.setString("");



        var heroLevel = mc.HeroStock.getHeroLevel(heroInfo);
        var heroMaxLevel = mc.HeroStock.getHeroMaxLevel(heroInfo);
        var text = mc.dictionary.getGUIString("lblLv.") + (heroLevel < heroMaxLevel ? "#f9424f_" : "#5de7f3_") + " " + heroLevel + "# /" + heroMaxLevel;
        var lbl = mc.GUIFactory.applyComplexString(lblNumLevel, text, mc.color.GREEN_NORMAL, res.font_UTMBienvenue_stroke_32_export_fnt);
        lbl.setScale(0.75);
        if(mc.enableReplaceFontBM())
        {
            lbl.x -= 70;
            tips = mc.view_utility.replaceBitmapFontAndApplyTextStyle(tips);
            tips.setBoundingWidth(450);
        }
        tips.setString(mc.dictionary.getGUIString("Tip Exchange Hero to Stone"));

        var passiveAttr = mc.HeroStock.getPassiveSkillValueAttr(heroInfo);
        var equipAtk = mc.HeroStock.getItemEquippingValue(heroInfo, "atk") + passiveAttr["atk"];
        var equipMag = mc.HeroStock.getItemEquippingValue(heroInfo, "mag") + passiveAttr["mag"];
        var equipHp = mc.HeroStock.getItemEquippingValue(heroInfo, "hp") + passiveAttr["hp"];
        var equipDef = mc.HeroStock.getItemEquippingValue(heroInfo, "def") + passiveAttr["def"];
        var equipRes = mc.HeroStock.getItemEquippingValue(heroInfo, "res") + passiveAttr["res"];
        var equipSpd = mc.HeroStock.getItemEquippingValue(heroInfo, "spd") + passiveAttr["spd"];

        var def = mc.HeroStock.getHeroDefense(heroInfo);
        var atk = mc.HeroStock.getHeroAttack(heroInfo);
        var hp = mc.HeroStock.getHeroHp(heroInfo);
        var resis = mc.HeroStock.getHeroResistant(heroInfo);
        var mag = mc.HeroStock.getHeroMagic(heroInfo);
        var spd = mc.HeroStock.getHeroSpeed(heroInfo);
        lblNumAttr1.setString(bb.utility.formatNumber(hp));
        lblNumAttr2.setString(bb.utility.formatNumber(atk));
        lblNumAttr3.setString(bb.utility.formatNumber(mag));
        lblNumAttr4.setString(bb.utility.formatNumber(spd));
        lblNumAttr5.setString(bb.utility.formatNumber(def));
        lblNumAttr6.setString(bb.utility.formatNumber(resis));
        if (equipHp > 0) {
            lblNumAttr1.setDecoratorLabel("+" + bb.utility.formatNumber(equipHp), mc.color.GREEN);
        }
        if (equipAtk > 0) {
            lblNumAttr2.setDecoratorLabel("+" + bb.utility.formatNumber(equipAtk), mc.color.GREEN);
        }
        if (equipMag > 0) {
            lblNumAttr3.setDecoratorLabel("+" + bb.utility.formatNumber(equipMag), mc.color.GREEN);
        }
        if (equipSpd > 0) {
            lblNumAttr4.setDecoratorLabel("+" + bb.utility.formatNumber(equipSpd), mc.color.GREEN);
        }
        if (equipDef > 0) {
            lblNumAttr5.setDecoratorLabel("+" + bb.utility.formatNumber(equipDef), mc.color.GREEN);
        }
        if (equipRes > 0) {
            lblNumAttr6.setDecoratorLabel("+" + bb.utility.formatNumber(equipRes), mc.color.GREEN);
        }

        this._loadSkillList(heroInfo);

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        btnDetail.setVisible(canViewDetail);

        btnDetail.registerTouchEvent(function () {
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
        if (quickExchange) {
            btnDetail.x = root.width * 0.3;
        }

        var mapHeroInFormationById = mc.GameData.teamFormationManager.getMapHeroIdInFormation();
        var isInFormation = mapHeroInFormationById && mapHeroInFormationById[mc.HeroStock.getHeroId(heroInfo)];
        var hasEquip = false;
        var mapEquipBySlot = mc.GameData.itemStock.getMapEquippingItemByHeroId(heroId);
        if (mapEquipBySlot) {
            for (var key in mapEquipBySlot) {
                if (mapEquipBySlot[key]) {
                    hasEquip = true;
                    break;
                }
            }
        }
        btnExchange.setVisible(quickExchange);
        btnExchange.registerTouchEvent(function () {
            if( isInFormation ){
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtHeroIsInFormation"));
            }
            else if( hasEquip ){
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtSuggestUnEquipToExchange"));
            }
            else{
                this.close();
                mc.GameData.guiState.setCurrentExchangeHeroId(mc.HeroStock.getHeroId(heroInfo));
                mc.GUIFactory.showExchangeStonesScreen();
            }
        }.bind(this));
    },

    _loadSkillList: function (heroInfo) {
        var arrPos = [
            cc.p(85, 154), cc.p(212, 154), cc.p(335, 154), cc.p(452, 154)
        ];
        var dialog = null;
        var _clickSkillInfo = function (widget, type) {
            var skillInfo = widget.getUserData();
            if (type === ccui.Widget.TOUCH_BEGAN) {
                dialog = new mc.SkillInfoDialog(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getSkillIndexOfHero(skillInfo)).setShowPosition(widget).show();
            }
            else if (type === ccui.Widget.TOUCH_ENDED ||
                type === ccui.Widget.TOUCH_CANCELED) {
                if (dialog) {
                    dialog.close();
                }
            }
        };
        var skillList = mc.HeroStock.getHeroSkillList(heroInfo);
        skillList.sort(function (skillInfo1, skillInfo2) {
            return mc.HeroStock.getSkillPriorityOfHero(skillInfo2) - mc.HeroStock.getSkillPriorityOfHero(skillInfo1);
        });
        var arrSkillWidget = [];
        if (skillList && skillList.length > 0) {
            for (var i = 0; i < skillList.length; i++) {
                var skillWidget = mc.view_utility.createSkillInfoIcon(skillList[i]);
                skillWidget.scale = 0.75;
                skillWidget.addTouchEventListener(_clickSkillInfo);
                skillWidget.setTouchEnabled(true);
                skillWidget.x = arrPos[i].x;
                skillWidget.y = arrPos[i].y;
                this._root.addChild(skillWidget);
                arrSkillWidget.push(skillWidget);
            }
        }
        while (arrSkillWidget.length < 4) {
            var widget = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
            widget.scale = 0.75;
            widget.x = arrPos[arrSkillWidget.length].x;
            widget.y = arrPos[arrSkillWidget.length].y;
            this._root.addChild(widget);
            arrSkillWidget.push(widget);
        }
    },

    overrideShowAnimation: function () {
        this.opacity = 0;
        this.runAction(cc.fadeIn(0.3));
        return 0.3;
    },

    overrideCloseAnimation: function () {
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    }

});