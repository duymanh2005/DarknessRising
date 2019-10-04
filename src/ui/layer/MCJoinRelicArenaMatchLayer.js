/**
 * Created by long.nguyen on 8/9/2017.
 */
mc.JoinRelicArenaMatchLayer = mc.MainBaseLayer.extend({
    _mapFakeWidgetBySlotId: null,
    _mapSpineViewBySlotId: null,

    _arrSlotViewForDraggable: null,
    _arrSpineViewForSorting: null,
    _maxSlot: 0,

    _isSetLeaderMode: false,
    _currLeaderSlotId: 0,
    _currSelectHeroId: null,


    _statusCreatureManager: null,

    ctor: function (parseNode) {
        this._super();
        bb.framework.addSpriteFrames(res.patch9_4_plist);
        //this.setMaxSlot(5);

    },

    setMaxSlot: function (maxSlot) {
        maxSlot = Math.min(maxSlot, 5);
        maxSlot = Math.max(maxSlot, 0);
        var root = this._root = this.parseCCStudio(res.layer_join_relic_arena_hidden_hero);
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var nodeFormation = rootMap["nodeFormation"];
        var panelInfo = this._panelInfo = rootMap["panelInfo"];

        var panelHero = this._panelHero = rootMap["panelHero"];

        var lblNumTeamPower = this._lblNumTeamPower = rootMap["lblNumPower"];
        var iconPower = this._iconPower = rootMap["iconPower"];


        mc.LayoutHeroForBattle._init(nodeFormation);
        var formationMap = bb.utility.arrayToMap(nodeFormation.getChildren(), function (child) {
            return child.getName();
        });
        var mapTeamInfo = bb.utility.arrayToMap(panelInfo.getChildren(), function (child) {
            return child.getName();
        });
        var lvlInfo = this._lvlInfo = mapTeamInfo["lvlInfo"];
        var lblFormation = mapTeamInfo["lblFormation"];
        this._contentCell = mapTeamInfo["pnlHeader"];
        this._pnlMatchHost = mapTeamInfo["pnlMatchHost"];
        this._pnlTime = mapTeamInfo["pnlTime"];
        this._pnlRelicBet = mapTeamInfo["pnlRelicBet"];
        this._pnlPower = mapTeamInfo["pnlPower"];

        //var nodeSkill = this._nodeSkill = mapTeamInfo["nodeSkill"];
        //var lblNumPower = this._lblNumDamage = mapTeamInfo["lblNumPower"];
        //var lblNumRes = this._lblNumRes = mapTeamInfo["lblNumRes"];
        //var lblRes = mapTeamInfo["lblRes"];
        //var lblNumHp = this._lblNumHp = mapTeamInfo["lblNumHp"];
        //var lblHp = mapTeamInfo["lblHp"];
        //var lblNumDef = this._lblNumDef = mapTeamInfo["lblNumDef"];
        //var lblDef = mapTeamInfo["lblDef"];
        //var lblNumAtk = this._lblNumAtk = mapTeamInfo["lblNumAtk"];
        //var lblAtk = mapTeamInfo["lblAtk"];
        //var lblNumMag = this._lblNumMag = mapTeamInfo["lblNumMag"];
        //var lblMag = mapTeamInfo["lblMag"];
        //var lblNumSpd = this._lblNumSpd = mapTeamInfo["lblNumSpd"];
        //var lblSpd = mapTeamInfo["lblSpd"];
        //var lblName = this._lblName = mapTeamInfo["lblName"];
        //var nodeAvt = this._nodeAvt = mapTeamInfo["nodeAvt"];
        //var lblLeaderSkill = mapTeamInfo["lblLeaderSkill"];
        //var lblLeaderSkillName = this._lblLeaderSkillName = mapTeamInfo["lblLeaderSkillName"];
        //var lblLeaderSkillInfo = this._lblInfoLeaderSkill = mapTeamInfo["lblLeaderSkillInfo"];

        var btnDone = this._btnDone = mapTeamInfo["btnDone"];
        var btnClear = this._btnClear = mapTeamInfo["btnClear"];

        btnDone.setString(mc.dictionary.getGUIString("lblDone"));
        btnClear.setString(mc.dictionary.getGUIString("lblClear"));

        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.GameData.guiState.TEAM_PICKED_RELIC_ARENA);
        var currentEditFormationTeamId = mc.GameData.guiState.getCurrentEditFormationTeamId();

        brkTitle._maxLblWidth = brkTitle.width - 100;
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("JoinMatch"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);


        var brk = new cc.Sprite("res/png/brk/arena1.png");
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

        this._maxSlot = maxSlot;
        var arrSlotView = nodeFormaion5.getChildren();
        for (var i = 0; i < 5; i++) {
            var slotView = arrSlotView[i];

            if (i < this._maxSlot) {
                var slotId = parseInt(slotView.getName()) - 1;
                this._mapSlotViewBySlotId[slotId] = slotView;
                this._mapFakeWidgetBySlotId[slotId] = null;
                this._mapSpineViewBySlotId[slotId] = null;
            }
            else {
                slotView.setVisible(false);
            }

        }

        this._arrSpineViewForSorting = [];
        this._arrSlotViewForDraggable = [];
        for (var slotId in this._mapSlotViewBySlotId) {
            var slotView = this._mapSlotViewBySlotId[slotId];
            this._arrSlotViewForDraggable.push(slotView);
        }


        btnDone.registerTouchEvent(function () {
            if (mc.GameData.playerInfo.getRelicCoin() >= this._matchInfo.relic) {
                mc.GUIFactory.confirm(mc.dictionary.getGUIString("lblAcceptTheFight"), function () {
                    this._submitBattleTeam();
                }.bind(this));
            }
            else {
                mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblWarning"), mc.dictionary.getGUIString("lblNotEnoughRelic"));
            }


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
        this._bindGridView();
        this._loadMatchInfo();
        this._forceRefresh();
        this._updateTeamFormation();
        this.scheduleUpdate();

    },

    _bindGridView: function () {
        var arrEmptyWidget = this._arrEmptyWidget = [];
        var heroStock = mc.GameData.heroStock;
        var heroes = heroStock.getHeroList();
        var minView = 30;
        var numMaxHero = Math.max((Math.ceil(heroes.length / 5)) * 5, this._isShowHpMpBar ? 10 : 15);
        var self = this;
        var grid = this._gridView = new mc.SortedGridView(this._panelHero)
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
                        //if( this._currLeaderSlotId >= 0 ){
                        //    var spineView = this._mapSpineViewBySlotId[this._currLeaderSlotId];
                        //    if( spineView && mc.HeroStock.getHeroId(spineView.getUserData()) === heroId){
                        //        val += 10000;
                        //    }
                        //}
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
        this._root.addChild(grid);
        self._arrSlotViewForDraggable.push(grid.getBackgroundView());

        if (this._isShowHpMpBar) {
            for (var i = 0; i < arrEmptyWidget.length; i++) {
                arrEmptyWidget[i].y += 50;
            }
        }

        var heroStock = mc.GameData.heroStock;
        var pickingHeroIds = [];//teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);

        var heroes = heroStock.getHeroList();
        bb.utility.arrayTraverse(pickingHeroIds, function (pickId, slotIndex) {
            var heroInfo = heroStock.getHeroById(pickId);
            if (heroInfo) {
                self.pickHero(heroInfo, slotIndex);
            }
        });
    },

    loadMoreURL: function (arrURL, cb, progressCb) {
        if (!cc.sys.isNative) {
            cc.loader.load(arrURL, function (result, count, loadedCount) {
                var percent = (loadedCount / count * 100) | 0;
                progressCb && progressCb(percent);
            }, function () {
                cb && cb();
            }.bind(this));
        }
        else {
            cb && cb();
        }
    },

    setMatchInfo: function (matchInfo) {
        this._matchInfo = matchInfo;
        this._maxSlot = matchInfo.heroes.length;
        this.setMaxSlot(this._maxSlot);
    },

    _loadMatchInfo: function () {
        var matchInfo = this._matchInfo;
        this._lvlInfo.removeAllChildren();
        var data = bb.utility.cloneJSON(mc.dictionary.battleRelicData);
        var curIndex = 0;
        this._resultMatchInfo = {};

        _initTimeRow = function (matchInfo) {
            var time = matchInfo.time;
            var view = this._pnlTime.clone();
            var lblPickingTime = view.getChildByName("lblPickingTime");
            var lblTime = view.getChildByName("lblTime");
            lblPickingTime.setString(mc.dictionary.getGUIString("lblPickHeroTime"));
            lblTime.setString(time + "s");
            lblPickingTime.setColor(mc.color.YELLOW_SOFT);
            lblTime.setColor(mc.color.WHITE_NORMAL);
            this._lvlInfo.pushBackCustomItem(view);
        }.bind(this);

        _initRelicRow = function (matchInfo) {
            var relicBet = matchInfo.relic;
            var pnlRelic = this._pnlRelicBet.clone();
            var lblRelic = pnlRelic.getChildByName("lblRelic");
            var lblRelicNum = pnlRelic.getChildByName("lblRelicNum");
            lblRelic.setString(mc.dictionary.getGUIString("lblRelic"));
            lblRelicNum.setString(bb.utility.formatNumber(relicBet));
            lblRelic.setColor(mc.color.YELLOW_SOFT);
            lblRelicNum.setColor(mc.color.WHITE_NORMAL);
            this._lvlInfo.pushBackCustomItem(pnlRelic);
        }.bind(this);



        _initHostInfo = function (matchInfo) {
            var relicBet = matchInfo.relic;
            var pnlMatchHost = this._pnlMatchHost.clone();
            var lblHost = pnlMatchHost.getChildByName("lblHost");
            var lblHostName = pnlMatchHost.getChildByName("lblHostName");
            lblHost.setString(mc.dictionary.getGUIString("lblHost"));
            lblHostName.setString(matchInfo.name)
            lblHost.setColor(mc.color.YELLOW_SOFT);
            lblHostName.setColor(mc.color.WHITE_NORMAL);
            this._lvlInfo.pushBackCustomItem(pnlMatchHost);


        }.bind(this);


        _initFormation = function (matchInfo) {

            var pnlPower = this._pnlPower.clone();
            var lblPowerNum = pnlPower.getChildByName("lblPowerNum");
            lblPowerNum.setString(bb.utility.formatNumber(matchInfo.power));
            lblPowerNum.setColor(mc.color.WHITE_NORMAL);
            this._lvlInfo.pushBackCustomItem(pnlPower);


            var nodeHero = new cc.Node();
            var heroView = this._pnlPower.clone();
            heroView.removeAllChildren();
            heroView.setContentSize({width: heroView.width, height: heroView.height + 130});
            heroView.addChild(nodeHero);
            nodeHero.x = heroView.width * 0.5;
            nodeHero.y = heroView.height * 0.5;

            var oppArrHeroInfo = mc.RelicArenaManager.getOpponentArrayHeroes(matchInfo);
            var oppTeamFormation = [];
            for (var i = 0; i < oppArrHeroInfo.length; i++) {
                oppTeamFormation.push(oppArrHeroInfo[i].id);
            }
            mc.view_utility.layoutHiddenHeroTeamFormationWithGrid({
                arrTeamFormation: oppTeamFormation,
                mapHeroInfo: bb.utility.arrayToMap(oppArrHeroInfo, function (heroInfo) {
                    return mc.HeroStock.getHeroId(heroInfo);
                }),
                enableClick: true
            }, {
                nodeHero: nodeHero
            }, true, 4,  heroView.width + 180, 10);
            heroView.scale = 0.6;
            this._lvlInfo.pushBackCustomItem(heroView);


        }.bind(this);

        _initSeparator = function(){
            var sep = new ccui.Layout();
            sep.removeAllChildren();
            sep.height = 30;
            this._lvlInfo.pushBackCustomItem(sep);
        }.bind(this);


        _initHostInfo(matchInfo);
        _initFormation(matchInfo);
        _initSeparator();
        _initTimeRow(matchInfo);
        _initRelicRow(matchInfo);


    },

    _quitEditFormation: function () {
        //var _quitFunc = function () {
        //    if (this._isChangeFormation() || this._isChangeLeader()) {
        //        this._submitBattleTeam(function () {
        //            //mc.GameData.guiState.popScreen();
        //        }.bind(this));
        //    }
        //    else {
        //        mc.GameData.guiState.popScreen();
        //    }
        //}.bind(this);
        //if (this._isChangeFormation() || this._isChangeLeader()) {
        //    mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtDoUWantSaveAnyChances"), _quitFunc, function () {
        //        //mc.GameData.guiState.popScreen();
        //    });
        //}
        //else {
        //    _quitFunc();
        //}
    },

    _updateTeamFormation: function () {
        var heroStock = mc.GameData.heroStock;
        var arrHeroId = this._getArrPickingHeroId();

        var arrHeroInfo = [];
        for (var i = 0; i < arrHeroId.length; i++) {
            if (arrHeroId[i] >= 0) {
                arrHeroInfo.push(heroStock.getHeroById(arrHeroId[i]));
            }
        }
        this._lblNumTeamPower.setString(bb.utility.formatNumber(Math.round(mc.HeroStock.getBattlePowerForArrHero(arrHeroInfo))));
        this._btnDone.setGrayForAll(!this._isValidMatchInfo());
    },

    _sortSpineByY: function (spine1, spine2) {
        return spine2.y - spine1.y;
    },


    _isEmpty: function () {
        //var isEmpty = true;
        var i = 0;
        for (var slotId in this._mapSpineViewBySlotId) {
            var spineView = this._mapSpineViewBySlotId[slotId];
            if (spineView) {
                //isEmpty = false;
                //break;
                i++;
            }
        }
        if(i>= this._maxSlot)
        {
            return false;
        }
        return true;
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

    _isValidMatchInfo: function () {
        if (!this._isEmpty()) {
            return true;
        }
        return false;
    },

    _submitBattleTeam: function () {
        var arrHeroId = this._getArrPickingHeroId();
        var dialogId = mc.view_utility.showLoadingDialog();


        mc.protocol.joinerRequestMatchInRelicArena(this._matchInfo["battleId"], arrHeroId,function (result) {
            if(result && result.code === 1)
            {
                mc.GameData.guiState.reloadRelicArenaVSDlg = false;
                mc.view_utility.hideLoadingDialogById(dialogId);
                this.getMainScreen().popLayer();
                mc.GameData.relicArenaManager.setWaitingVS(true);
                var data = {you : {name : mc.GameData.playerInfo.getName()}, opp : this._matchInfo, remainTime : mc.const.TIME_REQUEST_COUNT_DOWN};
                mc.GUIFactory.notifyVSRelicMatch(data);
            }

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
            heroWidget.setStatusText("Picked");

            var spineView = this._mapSpineViewBySlotId[preLeaderSlotId];
            if (spineView) {
                var heroWidget = this._mapStockHeroViewByHeroId[spineView.getUserData().id];
                heroWidget.setStatusText("Picked");
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
            new mc.HeroInfoDialog(widget.getUserData(), true).show();
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
            heroWidget.setStatusText("Picked");

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

                    var heroInfo1 = this._mapSpineViewBySlotId[slotId1].getUserData();
                    var heroWidget1 = this._mapStockHeroViewByHeroId[heroInfo1.id];
                    heroWidget1.setStatusText("Picked");
                }
                if (this._mapSpineViewBySlotId[slotId2]) {

                    var heroInfo2 = this._mapSpineViewBySlotId[slotId2].getUserData();
                    var heroWidget2 = this._mapStockHeroViewByHeroId[heroInfo2.id];
                    heroWidget2.setStatusText("Picked");
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
                    var heroInfo = spine.getUserData();
                    var heroWidget = this._mapStockHeroViewByHeroId[heroInfo.id];
                    heroWidget.setStatusText("Picked");
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

    getLayerId: function () {
        return mc.MainScreen.LAYER_JOIN_REQUEST_RELIC_ARENA;
    },

    isConfirmExit : function(){
        return true;
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