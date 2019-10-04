/**
 * Created by long.nguyen on 9/20/2017.
 */
mc.EditFormationScreen = mc.Screen.extend({
    _mapFakeWidgetBySlotId: null,
    _mapSpineViewBySlotId: null,

    _arrSlotViewForDraggable: null,
    _arrSpineViewForSorting: null,
    _maxSlot: 0,

    _isSetLeaderMode: false,
    _currLeaderSlotId: 0,
    _currSelectHeroId: null,

    _isShowHpMpBar: false,

    _statusCreatureManager: null,

    ctor: function (statusCreatureManager) {
        this._super();
        this._statusCreatureManager = statusCreatureManager;
    },

    getPreLoadURL: function () {
        return mc.resource.getBattleTeamPreLoadURL(mc.GameData.guiState.getCurrentEditFormationTeamId());
    },

    initResources: function () {
        this._super();
        bb.framework.addSpriteFrames(res.patch9_4_plist);
        var screen = mc.loadGUI(res.layer_edit_formation);
        this.addChild(screen);
        var root = this._rootNode = screen.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var nodeFormation = rootMap["nodeFormation"];
        var panelInfo = this._panelInfo = rootMap["panelInfo"];
        var panelHero = rootMap["panelHero"];
        var btnBack = this._btnBack = rootMap["btnBack"];
        var lblNumTeamPower = this._lblNumTeamPower = rootMap["lblNumPower"];

        mc.LayoutHeroForBattle._init(nodeFormation);
        var formationMap = bb.utility.arrayToMap(nodeFormation.getChildren(), function (child) {
            return child.getName();
        });
        var mapTeamInfo = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });
        var lblFormation = mapTeamInfo["lblFormation"];

        var nodeSkill = this._nodeSkill = mapTeamInfo["nodeSkill"];
        var lblNumPower = this._lblNumDamage = mapTeamInfo["lblNumPower"];
        var lblNumRes = this._lblNumRes = mapTeamInfo["lblNumRes"];
        var lblRes = mapTeamInfo["lblRes"];
        var lblNumHp = this._lblNumHp = mapTeamInfo["lblNumHp"];
        var lblHp = mapTeamInfo["lblHp"];
        var lblNumDef = this._lblNumDef = mapTeamInfo["lblNumDef"];
        var lblDef = mapTeamInfo["lblDef"];
        var lblNumAtk = this._lblNumAtk = mapTeamInfo["lblNumAtk"];
        var lblAtk = mapTeamInfo["lblAtk"];
        var lblNumMag = this._lblNumMag = mapTeamInfo["lblNumMag"];
        var lblMag = mapTeamInfo["lblMag"];
        var lblNumSpd = this._lblNumSpd = mapTeamInfo["lblNumSpd"];
        var lblSpd = mapTeamInfo["lblSpd"];
        var lblName = this._lblName = mapTeamInfo["lblName"];
        var nodeAvt = this._nodeAvt = mapTeamInfo["nodeAvt"];
        var lblLeaderSkill = mapTeamInfo["lblLeaderSkill"];
        var lblLeaderSkillName = this._lblLeaderSkillName = mapTeamInfo["lblLeaderSkillName"];
        var lblLeaderSkillInfo = this._lblInfoLeaderSkill = mapTeamInfo["lblLeaderSkillInfo"];
        var btnSetLeader = this._btnSetLeader = mapTeamInfo["btnSetLeader"];
        var btnClear = this._btnClear = mapTeamInfo["btnClear"];

        lblLeaderSkill.setColor(mc.color.YELLOW);
        lblLeaderSkillName.setColor(mc.color.BLUE);
        btnSetLeader.setString(mc.dictionary.getGUIString("lblDone"));
        btnClear.setString(mc.dictionary.getGUIString("lblClear"));


        if (mc.enableReplaceFontBM()) {
            this._lblName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this._lblName);
            this._lblNumDamage = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this._lblNumDamage);
            this._lblNumDamage.y -= 10;

        }

        lblAtk.setColor(mc.color.BLUE);
        lblHp.setColor(mc.color.BLUE);
        lblRes.setColor(mc.color.BLUE);
        lblDef.setColor(mc.color.BLUE);
        lblMag.setColor(mc.color.BLUE);
        lblSpd.setColor(mc.color.BLUE);

        var currentEditFormationTeamId = mc.GameData.guiState.getCurrentEditFormationTeamId();

        brkTitle._maxLblWidth = brkTitle.width - 100;
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblEditTeam") + " - " + mc.dictionary.getGUIString(currentEditFormationTeamId), res.font_UTMBienvenue_stroke_32_export_fnt);

        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var bossInfo = null;
        var bossIndex = mc.GameData.guiState.getShowingBossIndex();
        if (bossIndex) {
            var bossInfo = mc.dictionary.getWorldBossInfoByIndex(bossIndex);
        }
        var brkWorldBossKey = (bossInfo && bossInfo["bg"]) ? bossInfo["bg"] : mc.BossMainLayer.DEFAULT_WORLD_BOSS_BRK_KEY;
        var mapBrk = {};
        mapBrk[mc.TeamFormationManager.TEAM_CAMPAIGN] = [
            "res/png/brk/loren1.png",
            "res/png/brk/noria1.png"
        ];
        mapBrk[mc.TeamFormationManager.TEAM_ILLUSION] = [
            "res/png/brk/losttower2.png",
            "res/png/brk/losttower1.png"
        ];
        mapBrk[mc.TeamFormationManager.TEAM_ATTACK_ARENA] = [
            "res/png/brk/arena1.png"
        ];
        mapBrk[mc.TeamFormationManager.TEAM_DEFENSE_ARENA] = [
            "res/png/brk/arena1.png"
        ];
        mapBrk[mc.TeamFormationManager.TEAM_CHAOSCASTLE] = [
            "res/png/brk/chaoscastle1.png",
            "res/png/brk/chaoscastle2.png"
        ];
        mapBrk[mc.TeamFormationManager.TEAM_WORLD_BOSS] = [
            cc.formatStr("res/png/brk/%s.png", brkWorldBossKey)
        ];
        mapBrk[mc.TeamFormationManager.TEAM_GUILD_BOSS] = [
            "res/png/brk/losttower2.png"
        ];
        mapBrk[mc.TeamFormationManager.TEAM_GUILD_BOSS_ARENA] = [
            "res/png/brk/losttower2.png"
        ];
        mapBrk[mc.TeamFormationManager.TEAM_BLOODCASTLE] = [
            "res/png/brk/blood2.png"
        ];

        var getMapBrk = function (id) {
            return mapBrk[id] || [];
        };

        this._isShowHpMpBar = (this._statusCreatureManager != null);

        var brk = new cc.Sprite(bb.utility.randomElement(getMapBrk(currentEditFormationTeamId)));
        brk.setLocalZOrder(-1);
        brk.anchorY = 1.0;
        brk.x = cc.winSize.width * 0.5;
        brk.y = mc.const.DEFAULT_HEIGHT;
        root.addChild(brk);

        var nodeFormaion5 = formationMap["5_1"];

        this._mapFakeWidgetBySlotId = {};
        this._mapSpineViewBySlotId = {};
        this._mapSlotViewBySlotId = {};
        this._mapStockHeroViewByHeroId = {};

        this._maxSlot = 5;
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = currentEditFormationTeamId;
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        this._currLeaderSlotId = teamFormationManager.getLeaderFormationByIndex(teamId, teamIndex);
        var arrHeroId = teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);
        if (this._currLeaderSlotId >= 0) {
            this._currSelectHeroId = arrHeroId[this._currLeaderSlotId];
        }
        var arrSlotView = nodeFormaion5.getChildren();
        for (var i = 0; i < 5; i++) {
            var slotView = arrSlotView[i];
            var slotId = parseInt(slotView.getName()) - 1;
            this._mapSlotViewBySlotId[slotId] = slotView;
            this._mapFakeWidgetBySlotId[slotId] = null;
            this._mapSpineViewBySlotId[slotId] = null;
        }

        this._arrSpineViewForSorting = [];
        this._arrSlotViewForDraggable = [];
        for (var slotId in this._mapSlotViewBySlotId) {
            var slotView = this._mapSlotViewBySlotId[slotId];
            this._arrSlotViewForDraggable.push(slotView);
        }

        var arrEmptyWidget = this._arrEmptyWidget = [];
        var heroStock = mc.GameData.heroStock;
        var heroes = heroStock.getHeroList();
        var mapHeroInInFormation = mc.GameData.teamFormationManager.getMapHeroIdInFormation();
        var minView = 30;
        var numMaxHero = Math.max((Math.ceil(heroes.length / 5)) * 5, this._isShowHpMpBar ? 10 : 15);
        var self = this;
        var grid = this._gridView = new mc.SortedGridView(panelHero)
            .setCurrentSortIndex(mc.GameData.guiState.getCurrentSortingHeroStockIndex())
            .setInfoText("Heroes ", heroes.length)
            .setSortingDataSource(["Power", "Level", "Star", "Attack", "Defense", "Hp", "Recovery"], function (widget, indexAttr) {
                var heroInfo = widget.getUserData();
                var val = -1000000 * 2;
                if (heroInfo) {
                    switch (indexAttr) {
                        case -1:
                            val = mc.HeroStock.getHeroId(heroInfo);
                            break;
                        case 0:
                            val = mc.HeroStock.getHeroBattlePower(heroInfo);
                            break;
                        case 1:
                            val = mc.HeroStock.getHeroLevel(heroInfo);
                            break;
                        case 2:
                            val = mc.HeroStock.getHeroRank(heroInfo);
                            break;
                        case 3:
                            val = mc.HeroStock.getHeroTotalAttack(heroInfo);
                            break;
                        case 4:
                            val = mc.HeroStock.getHeroTotalDefense(heroInfo);
                            break;
                        case 5:
                            val = mc.HeroStock.getHeroTotalHp(heroInfo);
                            break;
                        case 6:
                            val = mc.HeroStock.getHeroTotalResistant(heroInfo);
                            break;
                    }
                    var heroId = mc.HeroStock.getHeroId(heroInfo);
                    if (this._isHeroIdPartIn(heroId)) {
                        val += 1000000;
                    }
                    var statusObject = null;
                    if (this._statusCreatureManager) {
                        statusObject = this._statusCreatureManager.getStatusCreatureById(heroId, mc.HeroStock.getHeroIndex(heroInfo));
                    }
                    if (statusObject && statusObject.hpPercent <= 0) {
                        val -= 1000000;
                    }
                }
                indexAttr >= 0 && mc.GameData.guiState.setCurrentSortingHeroStockIndex(indexAttr);
                return val;
            }.bind(this))
            .setDataSource(numMaxHero, function (index) {
                var widget = null;
                if (index < heroes.length) {
                    var heroInfo = heroes[index];

                    var widget = self._createHero(heroInfo);
                }
                else {
                    widget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                    arrEmptyWidget.push(widget);
                }
                return widget;
            }.bind(this));
        root.addChild(grid);
        self._arrSlotViewForDraggable.push(grid.getBackgroundView());

        if (this._isShowHpMpBar) {
            for (var i = 0; i < arrEmptyWidget.length; i++) {
                arrEmptyWidget[i].y += 50;
            }
        }

        var heroStock = mc.GameData.heroStock;
        var pickingHeroIds = teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);

        var heroes = heroStock.getHeroList();
        bb.utility.arrayTraverse(pickingHeroIds, function (pickId, slotIndex) {
            var heroInfo = heroStock.getHeroById(pickId);
            if (heroInfo) {
                self.pickHero(heroInfo, slotIndex);
            }
        });

        btnBack.registerTouchEvent(function () {
            this._quitEditFormation();
        }.bind(this));
        btnSetLeader.registerTouchEvent(function () {
            this._submitBattleTeam();
            mc.GameData.tutorialManager.submitTutorialDoneById(mc.TutorialManager.ID_EDIT_TEAM);
        }.bind(this));
        btnClear.registerTouchEvent(function () {
            for (var slotId in self._mapFakeWidgetBySlotId) {
                if (self._mapFakeWidgetBySlotId[slotId]) {
                    var isOk = self.unPickHero(slotId);
                    if (!isOk) {
                        self._currSelectHeroId = mc.HeroStock.getHeroId(self._mapSpineViewBySlotId[slotId].getUserData());
                    }
                }
            }
            self._updateTeamFormation();
            this._forceRefresh();
        }.bind(this));

        this._forceRefresh();
        this._updateTeamFormation();
        this.scheduleUpdate();

        mc.view_utility.registerShowServerNotify(this);
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_EDIT_FORMATION);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_SPINE) {
                var fakeWidget = null;
                var maxSlot = -1;
                for (var slotId in this._mapFakeWidgetBySlotId) {
                    slotId = parseInt(slotId);
                    if (this._mapSpineViewBySlotId[slotId]) {
                        if (mc.HeroStock.getHeroRank(this._mapSpineViewBySlotId[slotId].getUserData()) >= 3 &&
                            maxSlot < slotId) {
                            maxSlot = slotId;
                            fakeWidget = this._mapFakeWidgetBySlotId[slotId];
                        }
                    }
                }
                if (fakeWidget) {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(fakeWidget)
                        .setScaleHole(1.5)
                        .setCharPositionY(cc.winSize.height * 0.4)
                        .show();
                }
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnSetLeader)
                    .setScaleHole(1.5)
                    .setCharPositionY(cc.winSize.height * 0.75)
                    .show();
                this._btnSetLeader.setGrayForAll(false);
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_WIDGET) {
                var heroWidget = null;
                for (var heroId in this._mapStockHeroViewByHeroId) {
                    var isPicked = false;
                    for (var slotId in this._mapSpineViewBySlotId) {
                        if (this._mapSpineViewBySlotId[slotId]) {
                            var heroInfo = this._mapSpineViewBySlotId[slotId].getUserData();
                            if (mc.HeroStock.getHeroId(heroInfo) == heroId) {
                                isPicked = true;
                                break;
                            }
                        }
                    }
                    if (!isPicked) {
                        heroWidget = this._mapStockHeroViewByHeroId[heroId];
                        break;
                    }
                }
                if (heroWidget) {
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(heroWidget)
                        .setScaleHole(1.5)
                        .setCharPositionY(cc.winSize.height * 0.4)
                        .show();
                }
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_BACK_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnBack)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
        }
    },

    onBackEvent: function () {
        this._quitEditFormation();
        return true;
    },

    _setKingIcon: function (spineView, isEnable) {
        if (isEnable) {
            if (!this._containerKingIcon) {
                var containerKingIcon = this._containerKingIcon = new cc.Node();
                containerKingIcon.setLocalZOrder(9999999);
                var kingIcon = new cc.Sprite("#icon/Crown.png");
                kingIcon.runAction(cc.sequence([cc.moveBy(0.3, 0, 8), cc.moveBy(0.3, 0, -8)]).repeatForever());

                this.addChild(containerKingIcon);
                containerKingIcon.addChild(kingIcon);
            }
        }
    },

    _quitEditFormation: function () {
        var _quitFunc = function () {
            if (this._isChangeFormation() || this._isChangeLeader()) {
                this._submitBattleTeam(function () {
                    mc.GameData.guiState.popScreen();
                }.bind(this));
            }
            else {
                mc.GameData.guiState.popScreen();
            }
        }.bind(this);
        if (this._isChangeFormation() || this._isChangeLeader()) {
            mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtDoUWantSaveAnyChances"), _quitFunc, function () {
                mc.GameData.guiState.popScreen();
            });
        }
        else {
            _quitFunc();
        }
    },

    _updateTeamFormation: function () {
        this._panelInfo.setVisible(!this._isEmpty());
        var heroStock = mc.GameData.heroStock;
        var isChangeFormation = this._isChangeFormation();
        var arrHeroId = this._getArrPickingHeroId();
        var leaderHeroId = this._currSelectHeroId;
        var leaderHeroInfo = null;
        var leaderSkill = null;
        if (leaderHeroId != -1) {
            leaderHeroInfo = heroStock.getHeroById(leaderHeroId);
            if (leaderHeroInfo) {
                leaderSkill = mc.HeroStock.getHeroLeaderSkill(leaderHeroInfo);
                if (mc.enableReplaceFontBM()) {
                    this._lblInfoLeaderSkill = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this._lblInfoLeaderSkill);
                    this._lblInfoLeaderSkill.setBoundingWidth(400);
                    this._lblLeaderSkillName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this._lblLeaderSkillName);
                }
                else {
                    this._lblInfoLeaderSkill.getVirtualRenderer().setBoundingWidth(480);
                }
                if (leaderSkill) {
                    this._lblInfoLeaderSkill.setString(mc.HeroStock.getSkillDescriptionOfHero(leaderSkill));
                    this._lblLeaderSkillName.setString(mc.HeroStock.getSkillNameOfHero(leaderSkill));
                    this._lblInfoLeaderSkill.setColor(cc.color.WHITE);
                }
                else {
                    this._lblInfoLeaderSkill.setString(cc.formatStr(mc.dictionary.getGUIString("lblRequireXStarHero"), 3));
                    this._lblLeaderSkillName.setString(mc.dictionary.getGUIString("lblNone"));
                    this._lblInfoLeaderSkill.setColor(mc.color.RED);
                }

                var heroInfo = leaderHeroInfo;
                this._nodeAvt.removeAllChildren();
                var heroAvtView = new mc.HeroAvatarView(heroInfo);
                heroAvtView.scale = 0.75;
                this._nodeAvt.addChild(heroAvtView);

                this._lblName.setMultiLineString(mc.HeroStock.getHeroName(heroInfo), 350);
                this._lblNumDamage.setString(mc.dictionary.getGUIString("lblPower") + " " + bb.utility.formatNumber(mc.HeroStock.getHeroBattlePower(heroInfo)));


                var passiveAttr = mc.HeroStock.getPassiveSkillValueAttr(heroInfo);
                var equipAtk = mc.HeroStock.getItemEquippingValue(heroInfo, "atk") + passiveAttr["atk"];
                var equipMag = mc.HeroStock.getItemEquippingValue(heroInfo, "mag") + passiveAttr["mag"];
                var equipHp = mc.HeroStock.getItemEquippingValue(heroInfo, "hp") + passiveAttr["hp"];
                var equipDef = mc.HeroStock.getItemEquippingValue(heroInfo, "def") + passiveAttr["def"];
                var equipRes = mc.HeroStock.getItemEquippingValue(heroInfo, "res") + passiveAttr["res"];
                var equipSpd = mc.HeroStock.getItemEquippingValue(heroInfo, "spd") + passiveAttr["spd"];
                var def = mc.HeroStock.getHeroDefense(heroInfo) + equipDef;
                var atk = mc.HeroStock.getHeroAttack(heroInfo) + equipAtk;
                var hp = mc.HeroStock.getHeroHp(heroInfo) + equipHp;
                var res = mc.HeroStock.getHeroResistant(heroInfo) + equipRes;
                var mag = mc.HeroStock.getHeroMagic(heroInfo) + equipMag;
                var spd = mc.HeroStock.getHeroSpeed(heroInfo) + equipSpd;
                this._lblNumAtk.setString(bb.utility.formatNumber(atk));
                this._lblNumHp.setString(bb.utility.formatNumber(hp));
                this._lblNumDef.setString(bb.utility.formatNumber(def));
                this._lblNumRes.setString(bb.utility.formatNumber(res));
                this._lblNumMag.setString(bb.utility.formatNumber(mag));
                this._lblNumSpd.setString(bb.utility.formatNumber(spd));

                //this._lblNumAtk.setDecoratorLabel(equipAtk > 0 ? ("+" + bb.utility.formatNumber(equipAtk)) : null, mc.color.GREEN);
                //this._lblNumHp.setDecoratorLabel(equipHp > 0 ? ("+" + bb.utility.formatNumber(equipHp)) : null, mc.color.GREEN);
                //this._lblNumDef.setDecoratorLabel(equipDef > 0 ? ("+" + bb.utility.formatNumber(equipDef)) : null, mc.color.GREEN);
                //this._lblNumRes.setDecoratorLabel(equipRes > 0 ? ("+" + bb.utility.formatNumber(equipRes)) : null, mc.color.GREEN);
                //this._lblNumMag.setDecoratorLabel(equipMag > 0 ? ("+" + bb.utility.formatNumber(equipMag)) : null, mc.color.GREEN);
                //this._lblNumSpd.setDecoratorLabel(equipSpd > 0 ? ("+" + bb.utility.formatNumber(equipSpd)) : null, mc.color.GREEN);
            }
        }

        var arrHeroInfo = [];
        for (var i = 0; i < arrHeroId.length; i++) {
            if (arrHeroId[i] >= 0) {
                arrHeroInfo.push(heroStock.getHeroById(arrHeroId[i]));
            }
        }
        this._lblNumTeamPower.setString(bb.utility.formatNumber(Math.round(mc.HeroStock.getBattlePowerForArrHero(arrHeroInfo))));
        var imgSkill = null;
        if (leaderSkill) {
            imgSkill = mc.view_utility.createSkillInfoIcon(leaderSkill);
        }
        else {
            imgSkill = new cc.Sprite("#patch9/pnl_lockedskillslot.png");
        }
        this._nodeSkill.removeAllChildren();
        this._nodeSkill.addChild(imgSkill);

        this._btnSetLeader.setGrayForAll(!this._isChangeLeader() && !this._isChangeFormation());
        //this._gridView.getEditButton1().setGray(!this._isChangeFormation());
    },

    _sortSpineByY: function (spine1, spine2) {
        return spine2.y - spine1.y;
    },

    update: function (dt) {
        var draggingSpine = null;
        for (var slotId in this._mapFakeWidgetBySlotId) {
            var fakeWidget = this._mapFakeWidgetBySlotId[slotId];
            var spineView = this._mapSpineViewBySlotId[slotId];
            if (spineView && fakeWidget) {
                spineView.x = fakeWidget.x;
                spineView.y = fakeWidget.y;
                spineView.setLocalZOrder(fakeWidget.getLocalZOrder());
                if (this._containerKingIcon && this._isLeaderSlot(slotId)) {
                    var pos = spineView.getParent().convertToNodeSpace(cc.p(spineView.x, spineView.y));
                    var statusPos = spineView.getStatusPosition("top");
                    this._containerKingIcon.x = pos.x + statusPos.x;
                    this._containerKingIcon.y = pos.y + statusPos.y + 20;
                }
                if (fakeWidget._isDragging) {
                    draggingSpine = spineView;
                }
            }
        }

        if (this._arrSpineViewForSorting.length > 1) {
            this._arrSpineViewForSorting.sort(this._sortSpineByY);
            for (var i = 0; i < this._arrSpineViewForSorting.length; i++) {
                var spineView = this._arrSpineViewForSorting[i];
                if (spineView != draggingSpine) {
                    spineView.setLocalZOrder(10 + i);
                }
            }
        }

    },

    _isSlotLeaderEmpty: function () {
        var isEmptySlotLeader = true;
        for (var slotId in this._mapSpineViewBySlotId) {
            var spineView = this._mapSpineViewBySlotId[slotId];
            if (spineView && parseInt(slotId) === this._currLeaderSlotId) {
                isEmptySlotLeader = false;
                break;
            }
        }
        return isEmptySlotLeader;
    },

    _isEmpty: function () {
        var isEmpty = true;
        for (var slotId in this._mapSpineViewBySlotId) {
            var spineView = this._mapSpineViewBySlotId[slotId];
            if (spineView) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    },

    _getAcquiredSlotCount: function () {
        var slotCount = 0;
        for (var slotId in this._mapSpineViewBySlotId) {
            var spineView = this._mapSpineViewBySlotId[slotId];
            if (spineView) {
                slotCount++;
            }
        }
        return slotCount;
    },

    _getEmptySlot: function () {
        var emptySlotId = -1;
        for (var slotId in this._mapSpineViewBySlotId) {
            var spineView = this._mapSpineViewBySlotId[slotId];
            if (!spineView) {
                emptySlotId = parseInt(slotId);
                break;
            }
        }
        return emptySlotId;
    },

    _getAcquiredSlot: function () {
        var acquiredSlotId = -1;
        for (var slotId in this._mapSpineViewBySlotId) {
            var spineView = this._mapSpineViewBySlotId[slotId];
            if (spineView) {
                acquiredSlotId = parseInt(slotId);
                break;
            }
        }
        return acquiredSlotId;
    },

    _viewHeroInfo: function (heroInfo) {
        mc.GameData.guiState.setCurrentViewHeroId(mc.HeroStock.getHeroId(heroInfo));
        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_INFO);
    },

    _forceRefresh: function () {
        this._gridView.forceRefresh();
        if (this._isShowHpMpBar) {
            var arrEmptyWidget = this._arrEmptyWidget;
            for (var i = 0; i < arrEmptyWidget.length; i++) {
                arrEmptyWidget[i].y += 50;
            }
        }
    },

    _isHeroIdPartIn: function (heroId) {
        var isPartIn = false;
        for (var key in this._mapSpineViewBySlotId) {
            var heroView = this._mapSpineViewBySlotId[key];
            if (heroView) {
                var heroInfo = heroView.getUserData();
                if (heroInfo && mc.HeroStock.getHeroId(heroInfo) === heroId) {
                    isPartIn = true;
                    break;
                }
            }
        }
        return isPartIn;
    },

    _getArrPickingHeroId: function () {
        var arrHeroId = [];
        for (var key in this._mapSpineViewBySlotId) {
            var heroView = this._mapSpineViewBySlotId[key];
            if (heroView) {
                var heroInfo = heroView.getUserData();
                if (heroInfo) {
                    arrHeroId.push(mc.HeroStock.getHeroId(heroInfo));
                }
            }
            else {
                arrHeroId.push(-1);
            }
        }
        return arrHeroId;
    },

    _getSlotIdFromHeroId: function (heroId) {
        var foundSlotId = null;
        for (var slotId in this._mapSpineViewBySlotId) {
            var heroView = this._mapSpineViewBySlotId[slotId];
            if (heroView) {
                var heroInfo = heroView.getUserData();
                if (heroInfo && (mc.HeroStock.getHeroId(heroInfo) === heroId)) {
                    foundSlotId = slotId;
                    break;
                }
            }
        }
        return foundSlotId;
    },

    _isChangeFormation: function () {
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var currArrTeamHeroId = teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);
        var isChange = false;
        var arrHeroId = this._getArrPickingHeroId();
        for (var i = 0; i < arrHeroId.length; i++) {
            if (arrHeroId[i] != currArrTeamHeroId[i]) {
                isChange = true;
                break;
            }
        }
        return isChange;
    },

    _isChangeLeader: function () {
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var currArrTeamHeroId = teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);
        var currLeaderSlotId = teamFormationManager.getLeaderFormationByIndex(teamId, teamIndex);
        return this._currSelectHeroId != currArrTeamHeroId[currLeaderSlotId];
    },

    _submitBattleTeam: function (callback) {
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        if (teamId === mc.TeamFormationManager.TEAM_ATTACK_ARENA && !mc.storage.needUpdateDefArenaTeam) {
            mc.storage.needUpdateDefArenaTeam = true;
            mc.storage.saveNeedUpdateDefArenaTeam();
        }
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var arrHeroId = this._getArrPickingHeroId();
        var dialogId = mc.view_utility.showLoadingDialog();
        teamFormationManager.submitBattleTeam(teamId, teamIndex, arrHeroId, this._currLeaderSlotId, undefined, function () {
            mc.view_utility.hideLoadingDialogById(dialogId);
            this._updateTeamFormation();
            callback && callback();
        }.bind(this));
    },

    _registerClickableForSpineView: function (spineView, slotId, isEnable) {
        var layout = spineView.setClickAble(isEnable, this._setLeaderForHero.bind(this));
        if (layout) {
            layout.width = 150;
            layout.height = 150;
        }
    },

    _setLeaderForHero: function (spineView) {
        var heroId = mc.HeroStock.getHeroId(spineView.getUserData());
        var heroInfo = this._mapStockHeroViewByHeroId[heroId].getUserData();
        var leaderSkill = mc.HeroStock.getHeroLeaderSkill(heroInfo);

        var preLeaderSlotId = this._currLeaderSlotId;
        var currLeaderSlotId = this._getSlotIdFromHeroId(heroId);
        currLeaderSlotId = parseInt(currLeaderSlotId);
        if (preLeaderSlotId != currLeaderSlotId) {
            this._currLeaderSlotId = currLeaderSlotId;

            var heroWidget = this._mapStockHeroViewByHeroId[spineView.getUserData().id];
            heroWidget.setStatusText("Leader");
            this._setKingIcon(spineView, true);

            var spineView = this._mapSpineViewBySlotId[preLeaderSlotId];
            if (spineView) {
                this._setKingIcon(spineView, false);

                var heroWidget = this._mapStockHeroViewByHeroId[spineView.getUserData().id];
                heroWidget.setStatusText("Party");
            }

            this._updateTeamFormation();
        }
    },

    _isLeaderSlot: function (slotId) {
        return this._currLeaderSlotId === parseInt(slotId);
    },

    _createHero: function (heroInfo) {
        var statusObject = null;
        if (this._statusCreatureManager) {
            statusObject = this._statusCreatureManager.getStatusCreatureById(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getHeroIndex(heroInfo));
        }
        var widget = new mc.HeroAvatarView(heroInfo, statusObject);
        widget.registerTouchEvent(function (widget) {
            var hrInfo = widget.getUserData();
            var slotId = this._getSlotIdFromHeroId(hrInfo.id);
            if (slotId) {
                this.unPickHero(slotId);
            }
            else {
                var emptySlotId = this._getEmptySlot();
                if (emptySlotId >= 0) {
                    var arrRes = [];
                    arrRes = mc.resource.getPreLoadSpineURL(mc.HeroStock.getHeroIndex(hrInfo), arrRes);
                    var loadingId = mc.view_utility.showLoadingDialog();
                    this.loadMoreURL(arrRes, function () {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        this.pickHero(hrInfo, emptySlotId);
                    }.bind(this));
                }
                else {
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtFullTeamFormation"));
                }
            }
            if (this._currSelectHeroId === -1) {
                this._currSelectHeroId = heroInfo.id;
            }
            this._updateTeamFormation();
            this._forceRefresh();
        }.bind(this), function (widget) {
            new mc.HeroInfoDialog(widget.getUserData()).show();
        }.bind(this));
        this._mapStockHeroViewByHeroId[heroInfo.id] = widget;
        return widget;
    },

    pickHero: function (heroInfo, slotId) {
        if (cc.isString(slotId)) {
            slotId = parseInt(slotId);
        }
        if (heroInfo && slotId >= 0) {

            var slotWidget = this._mapSlotViewBySlotId[slotId];
            var pickView = slotWidget.getParent();

            var fakeWidget = new ccui.Layout();
            fakeWidget.anchorX = 0.5;
            fakeWidget.width = 150;
            fakeWidget.height = 150;
            //fakeWidget.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            var pos = pickView.convertToWorldSpace(cc.p(slotWidget.x, slotWidget.y));
            fakeWidget.x = pos.x;
            fakeWidget.y = pos.y;
            this.addChild(fakeWidget);
            fakeWidget._checkDraggbleByPointInSize = true;
            fakeWidget.setUserData(slotId);
            mc.view_utility.registerDragAble(fakeWidget, this._arrSlotViewForDraggable, function (widget, swapIndex) {
                var currSlot = widget.getUserData();
                if (swapIndex >= 0) {
                    if (swapIndex < this._maxSlot) {
                        this.swapHero(currSlot, swapIndex);
                    }
                    else {
                        this.unPickHero(currSlot);
                        this._updateTeamFormation();
                        this._forceRefresh();
                    }
                }
            }.bind(this), undefined, undefined, function (widget) {
                var slotId = widget.getUserData();
                if (slotId >= 0) {
                    this._setLeaderForHero(this._mapSpineViewBySlotId[slotId]);
                    var heroInfo = this._mapSpineViewBySlotId[slotId].getUserData();
                    this._currSelectHeroId = mc.HeroStock.getHeroId(heroInfo);
                    this._updateTeamFormation();
                }
            }.bind(this));

            var spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(heroInfo));
            spineView.x = fakeWidget.x;
            spineView.y = fakeWidget.y;
            spineView.scale = 1.0;
            spineView.setUserData(heroInfo);
            var statusObj = null;
            if (this._statusCreatureManager) {
                statusObj = this._statusCreatureManager.getStatusCreatureById(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getHeroIndex(heroInfo));
            }
            spineView.enableBar(true, statusObj);
            this._registerClickableForSpineView(spineView, slotId, this._isSetLeaderMode);
            this.addChild(spineView);

            this._mapFakeWidgetBySlotId[slotId] = fakeWidget;
            this._mapSpineViewBySlotId[slotId] = spineView;
            this._arrSpineViewForSorting.push(spineView);

            var heroWidget = this._mapStockHeroViewByHeroId[heroInfo.id];
            this._setKingIcon(spineView, this._isLeaderSlot(slotId));
            heroWidget.setStatusText(this._isLeaderSlot(slotId) ? "Leader" : "Party");

            if (!this._currSelectHeroId) {
                this._currSelectHeroId = mc.HeroStock.getHeroId(heroInfo);
            }
        }

    },

    swapHero: function (slotId1, slotId2) {
        if (slotId1 != slotId2) {
            var widget1 = this._mapFakeWidgetBySlotId[slotId1];
            var widget2 = this._mapFakeWidgetBySlotId[slotId2];
            var slotView1 = this._mapSlotViewBySlotId[slotId1];
            var slotView2 = this._mapSlotViewBySlotId[slotId2];
            var pos1 = slotView1.getParent().convertToWorldSpace(cc.p(slotView1.x, slotView1.y));
            var pos2 = slotView2.getParent().convertToWorldSpace(cc.p(slotView2.x, slotView2.y));
            var _swap = function () {
                var tempWidget = this._mapFakeWidgetBySlotId[slotId1];
                tempWidget.setEnabled(true);
                this._mapFakeWidgetBySlotId[slotId1] = this._mapFakeWidgetBySlotId[slotId2];
                this._mapFakeWidgetBySlotId[slotId2] = tempWidget;

                this._mapFakeWidgetBySlotId[slotId1] && this._mapFakeWidgetBySlotId[slotId1].setUserData(slotId1);
                this._mapFakeWidgetBySlotId[slotId2] && this._mapFakeWidgetBySlotId[slotId2].setUserData(slotId2);

                if (slotId1 === this._currLeaderSlotId) {
                    this._currLeaderSlotId = slotId2;
                }
                else if (slotId2 === this._currLeaderSlotId) {
                    this._currLeaderSlotId = slotId1;
                }

                var tempSpine = this._mapSpineViewBySlotId[slotId1];
                this._mapSpineViewBySlotId[slotId1] = this._mapSpineViewBySlotId[slotId2];
                this._mapSpineViewBySlotId[slotId2] = tempSpine;
                if (this._mapSpineViewBySlotId[slotId1]) {
                    this._setKingIcon(this._mapSpineViewBySlotId[slotId1], this._isLeaderSlot(slotId1));

                    var heroInfo1 = this._mapSpineViewBySlotId[slotId1].getUserData();
                    var heroWidget1 = this._mapStockHeroViewByHeroId[heroInfo1.id];
                    heroWidget1.setStatusText(this._isLeaderSlot(slotId1) ? "Leader" : "Party");
                }
                if (this._mapSpineViewBySlotId[slotId2]) {
                    this._setKingIcon(this._mapSpineViewBySlotId[slotId2], this._isLeaderSlot(slotId2));

                    var heroInfo2 = this._mapSpineViewBySlotId[slotId2].getUserData();
                    var heroWidget2 = this._mapStockHeroViewByHeroId[heroInfo2.id];
                    heroWidget2.setStatusText(this._isLeaderSlot(slotId2) ? "Leader" : "Party");
                }

                this._updateTeamFormation();
            }.bind(this);
            if (widget1) {
                var delay = 0.1;
                widget1.stopAllActions();
                if (widget2) {
                    widget1.runAction(cc.sequence([cc.moveTo(delay, pos2), cc.callFunc(function () {
                        _swap();
                    }.bind(this))]));
                    widget2.runAction(cc.moveTo(delay, pos1));
                }
                else {
                    widget1.runAction(cc.sequence([cc.moveTo(delay, pos2), cc.callFunc(function () {
                        _swap();
                    }.bind(this))]));
                }
            }

        }
    },

    unPickHero: function (slotId) {
        var isOk = false;
        if (this._getAcquiredSlotCount() > 1) {
            slotId = parseInt(slotId);
            var fakeWidget = this._mapFakeWidgetBySlotId[slotId];
            if (fakeWidget) {
                fakeWidget.removeFromParent();
                this._mapFakeWidgetBySlotId[slotId] = null;
            }

            var spine = this._mapSpineViewBySlotId[slotId];
            if (spine) {
                cc.arrayRemoveObject(this._arrSpineViewForSorting, spine);
                var heroInfo = spine.getUserData();
                this._setKingIcon(spine, false);

                spine.removeFromParent();
                this._mapSpineViewBySlotId[slotId] = null;

                var heroWidget = this._mapStockHeroViewByHeroId[heroInfo.id];
                heroWidget.setStatusText(null);
            }

            if (slotId === this._currLeaderSlotId) {
                var accquiredSlotId = this._getAcquiredSlot();
                if (accquiredSlotId >= 0) {
                    this._currLeaderSlotId = accquiredSlotId;

                    var spine = this._mapSpineViewBySlotId[accquiredSlotId];
                    this._setKingIcon(spine, this._isLeaderSlot(accquiredSlotId));
                    var heroInfo = spine.getUserData();
                    var heroWidget = this._mapStockHeroViewByHeroId[heroInfo.id];
                    heroWidget.setStatusText(this._isLeaderSlot(accquiredSlotId) ? "Leader" : "Party");
                    this._currSelectHeroId = heroInfo.id;
                }
            }
            isOk = true;
        }
        else {
            mc.view_utility.showSuggestText("The Team need at least one Hero!");
        }
        return isOk;
    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_EDITFORMATION;
    }

});
