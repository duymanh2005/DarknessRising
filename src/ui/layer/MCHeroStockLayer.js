/**
 * Created by long.nguyen on 7/27/2017.
 */
mc.HeroStockLayer = mc.MainBaseLayer.extend({
    _mapEmptySlot: 0,
    _mapPickHeroView: null,
    _mapStockHeroView: null,

    ctor: function (parseNode) {
        this._super();
        mc.storage.featureNotify.heroesLayerShowed = true;
        mc.storage.saveFeatureNotify();

        var root = this.root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelTop = rootMap["panelTop"];
        var panelMiddle = this.panelMiddle = rootMap["panelMiddle"];
        var nodeBrk = rootMap["nodeBrk"];

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblHeroList"));
        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Event.png", ccui.Widget.LOCAL_TEXTURE));

        var btnEditTeam = this._btnEditTeam = new ccui.ImageView("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
        btnEditTeam.scale = 0.8;
        btnEditTeam.setString(mc.dictionary.getGUIString("lblEditTeam"));
        btnEditTeam.x = brkTitle.x + brkTitle.width * 0.5 + btnEditTeam.width * 0.5 + 20;
        btnEditTeam.y = brkTitle.y;
        btnEditTeam.registerTouchEvent(function () {
            this.scheduleOnce(function () {
                mc.GUIFactory.showEditFormationScreen();
            });
        }.bind(this));
        root.addChild(btnEditTeam);

        var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.icon_book_json, res.icon_book_atlas, 1.0);
        iconAnimate.setLocalZOrder(1);
        iconAnimate.anchorX = iconAnimate.anchorY = 0.5;
        iconAnimate.setAnimation(0, "idle", true);

        var touchLayout = new ccui.Layout();
        touchLayout.anchorX = touchLayout.anchorY = 0.5;
        touchLayout.width = 100;
        touchLayout.height = 100;

        this._checkAndCleanHeroInvalidInNewHeroes();

        touchLayout.registerTouchEvent(function () {
            mc.GameData.guiState.setCurrTierHeroesMode(mc.TierHeroStockScreen.VIEW_MODE.RANKING);
            mc.GUIFactory.showTierHeroesScreen();

        }.bind(this));

        touchLayout.x = brkTitle.x - 87 - 125;
        touchLayout.y = brkTitle.y + 10;
        if( cc.sys.isNative ){
            iconAnimate.x = touchLayout.width*0.5;
            iconAnimate.y = touchLayout.height*0.5;
        }
        else{
            iconAnimate.x = 80;
            iconAnimate.y = 80;
        }
        touchLayout.addChild(iconAnimate);
        root.addChild(touchLayout);
        touchLayout.setCascadeOpacityEnabled(true);
        this.initGrid();

        this.traceDataChange(mc.GameData.playerInfo, function (data) {
            if (this.maxSlot !== mc.GameData.playerInfo.getMaxHeroSlot()) {
                this._gridView.setInfoText(this._getInfoTitle(), this._getInfoDesc(), this._getInfoWidth());
                this._gridView.updateInfoText();
                this.applyNewSlotSize();
            }
        }.bind(this));
    },

    _checkAndCleanHeroInvalidInNewHeroes : function(){

        if(!bb.utility.isEmptyObj(mc.storage.newHeroes) && !mc.storage.checkNewHeroesList)
        {
            var arrHero = mc.GameData.heroStock.getHeroList();
            for(var j in mc.storage.newHeroes)
            {
                for(var i in arrHero)
                {
                    var heroId = arrHero[i].id + "";
                    if(j === heroId)
                    {
                        break;
                    }
                }
                delete mc.storage.newHeroes[j];
            }
            mc.storage.checkNewHeroesList = true;
        }

    },

    _getInfoTitle: function () {
        return mc.dictionary.getGUIString("lblHeroes");
    },

    _getInfoDesc: function () {
        var arrHero = mc.GameData.heroStock.getHeroList();
        return arrHero.length + "/" + mc.GameData.playerInfo.getMaxHeroSlot()
    },

    _getInfoWidth: function () {
        return 210;
    },

    applyNewSlotSize: function () {
        if (this._gridView) {
            var childs = this._gridView.getScrollView().getChildren();
            for (var i in childs) {
                var child = childs[i];
                var oldBtnAdd = child.getChildByName("btnAdd");
                var OldLock = child.getChildByName("lock");
                oldBtnAdd && oldBtnAdd.removeFromParent();
                OldLock && OldLock.removeFromParent();

                var index = child.rangeIndex;
                if (index !== undefined) {
                    if (index < mc.GameData.playerInfo.getMaxHeroSlot()) {

                    } else if (index < mc.const.MAX_HERO_SLOT) {
                        var btnAdd = new ccui.ImageView("button/Cross_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                        btnAdd.setName("btnAdd");
                        child.addChild(btnAdd);
                        btnAdd.setPosition(child.width / 2, child.height / 2);
                        btnAdd.registerTouchEvent(function (widget) {
                            mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT);
                        }.bind(this));
                        btnAdd.setSwallowTouches(false);
                    } else {
                        var lock = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
                        lock.setName("lock");
                        child.addChild(lock);
                        lock.setPosition(child.width / 2, child.height / 2);

                    }
                }
            }
        }
    },


    initGrid: function () {
        var root = this.root;
        if (this._gridView) {
            // var restoreY = this._gridView.getCurrentPercentY();
            this._gridView.removeFromParent();

        }
        this.maxSlot = mc.GameData.playerInfo.getMaxHeroSlot();
        var arrFighterClassName = cc.copyArray(mc.dictionary.getGUIString("arrLblFighterBattleRole"));
        cc.arrayAppendObjectsToIndex(arrFighterClassName, mc.dictionary.getGUIString("lblAll"), 0);
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_CAMPAIGN);
        var emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        var self = this;
        var playerInfo = mc.GameData.playerInfo;
        var heroStock = mc.GameData.heroStock;
        var notifySystem = mc.GameData.notifySystem;
        var arrHero = heroStock.getHeroList();
        var numMaxHero = mc.const.MAX_HERO_SLOT + 10;
        var mapHeroInInFormation = mc.GameData.teamFormationManager.getMapHeroIdInFormation();
        var gridView = this._gridView = new mc.SortedGridView(this.panelMiddle)
            .setCurrentSortIndex(mc.GameData.guiState.getCurrentSortingHeroStockIndex())
            .setSortingDataSource(["Power", "Level", "Star", "Attack", "Defense", "Hp", "Resistance"], function (widget, indexAttr) {
                var heroInfo = widget.getUserData();
                var val = -1000;
                if (heroInfo) {
                    return mc.HeroStock.getHeroValueByAttr(heroInfo, indexAttr, mapHeroInInFormation);
                }
                return (widget._value + val);
            })
            .setInfoText(this._getInfoTitle(), this._getInfoDesc(), this._getInfoWidth())
            //.setFilteringDataSource(arrFighterClassName, function (widget, indexAttr) {
            //    var heroInfo = widget.getUserData();
            //    if (heroInfo) {
            //        if (mc.HeroStock.getHeroBattleRole(heroInfo).toLowerCase() === arrFighterClassName[indexAttr].toLowerCase() ||
            //            indexAttr === 0) {
            //            return 1;
            //        }
            //        return -1;
            //    }
            //    return 0;
            //}, 0)
            .setDataSource(numMaxHero, function (index) {
                var widget = null;
                if (index < arrHero.length) {
                    var heroInfo = arrHero[index];
                    var widget = new mc.HeroAvatarView(heroInfo);
                    widget.scale = 1.0;
                    var partInTeamId = mapHeroInInFormation[mc.HeroStock.getHeroId(heroInfo)];
                    if (partInTeamId) {
                        if (partInTeamId === mc.TeamFormationManager.TEAM_CAMPAIGN) {
                            widget.setStatusText("PartyCampaign", mc.color.GREEN_NORMAL);
                        }
                        else if (partInTeamId === mc.TeamFormationManager.TEAM_ATTACK_ARENA ||
                            partInTeamId === mc.TeamFormationManager.TEAM_DEFENSE_ARENA) {
                            widget.setStatusText("PartyArena", mc.color.YELLOW_ELEMENT);
                        }
                        else if (partInTeamId === mc.TeamFormationManager.TEAM_CHAOSCASTLE) {
                            widget.setStatusText("PartyChaos", mc.color.VIOLET_ELEMENT);
                        }
                        else {
                            widget.setStatusText("Party");
                        }
                    }
                    widget.registerTouchEvent(function (widget) {
                        var notifyIcon = widget.getChildByName("__notify__");
                        if(notifyIcon)
                        {
                            notifyIcon.setVisible(false);
                        }
                        self._viewHeroInfo(widget.getUserData());
                    }.bind(this), function () {
                        self._showPopupInfo(widget.getUserData());
                    });
                    var isNotify = false;
                    var equipmentNotification = notifySystem.getHeroEquipmentNotification();
                    if (equipmentNotification) {
                        if(partInTeamId)
                        {
                            isNotify = equipmentNotification[mc.HeroStock.getHeroId(heroInfo)] != null;
                        }
                    }
                    //var involveNotification = notifySystem.getHeroInvolveNotification();
                    //if (!isNotify && involveNotification) {
                    //    isNotify = involveNotification[mc.HeroStock.getHeroId(heroInfo)] != null;
                    //}
                    var newHeroes = mc.storage.readNewHeroes();
                    if (newHeroes) {
                        if (!isNotify) {
                            for (var i in newHeroes) {
                                var heroId = heroInfo.id + "";
                                if(i === heroId){
                                    isNotify = true;
                                    break;
                                }
                            }
                        }


                    }
                    mc.view_utility.setNotifyIconForWidget(widget, isNotify, 0.95, 0.95);
                }
                else {
                    widget = emptyWidget.clone();
                    widget._value = 0;
                    widget.rangeIndex = index;
                    widget.scale = 0.9;
                    widget.setCascadeOpacityEnabled(true);
                    if (index < mc.GameData.playerInfo.getMaxHeroSlot()) {

                    } else if (index < mc.const.MAX_HERO_SLOT) {
                        var btnAdd = new ccui.ImageView("button/Cross_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                        btnAdd.setName("btnAdd");
                        widget.addChild(btnAdd);
                        btnAdd.setPosition(widget.width / 2, widget.height / 2);
                        btnAdd.registerTouchEvent(function (widget) {
                            mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT);
                        }.bind(this));
                        btnAdd.setSwallowTouches(false);
                        widget._value = -1;
                    } else {
                        var lock = new ccui.ImageView("patch9/pnl_lockedskillslot.png", ccui.Widget.PLIST_TEXTURE);
                        lock.setName("lock");
                        widget.addChild(lock);
                        lock.setPosition(widget.width / 2, widget.height / 2);
                        widget._value = -2;
                    }
                }
                return widget;
            });
        gridView.width = this.panelMiddle.width;
        gridView.height = this.panelMiddle.height;
        gridView.y += 30;
        // if (restoreY) {
        //     gridView.restorePercentY(restoreY);
        // }
        root.addChild(gridView);
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_HERO_STOCK);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_WIDGET) {
                var allHeroView = this._gridView.getAllElementView();
                for (var i = 0; i < allHeroView.length; i++) {
                    var userData = allHeroView[i].getUserData();
                    if (userData && mc.HeroStock.getHeroIndex(userData) === tutorialTrigger.param) {
                        new mc.LayerTutorial(tutorialTrigger)
                            .setTargetWidget(allHeroView[i])
                            .setScaleHole(1.5)
                            .setCharPositionY(cc.winSize.height * 0.4)
                            .show();
                        break;
                    }
                }
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnEditTeam)
                    .setScaleHole(1.5)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
        }
    },

    _showPopupInfo: function (heroInfo, quickExchange) {
        var callback = function(result){
            if(result)
            {
                var percentY = this._gridView.getCurrentPercentY();
                this.initGrid();
                this._gridView.restorePercentY(percentY);
            }
        }.bind(this);
        new mc.HeroInfoDialog(heroInfo, true, !!quickExchange, callback).show();
    },

    _viewHeroInfo: function (heroInfo) {
        mc.GameData.guiState.setCurrentViewHeroId(mc.HeroStock.getHeroId(heroInfo));
        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_INFO);
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_HERO_STOCK;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return false;
    }
});
mc.HeroStockLayer.currentFormation = null;