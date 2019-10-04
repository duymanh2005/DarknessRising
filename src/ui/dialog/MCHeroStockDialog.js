/**
 * Created by long.nguyen on 3/6/2018.
 */
mc.HeroStockDialog = bb.Dialog.extend({

    ctor: function () {
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);

        var contentView = this._contentView = new ccui.Layout();
        contentView.setTouchEnabled(true);
        contentView.anchorX = 0.5;
        contentView.anchorY = 1.0;
        contentView.x = cc.winSize.width * 0.5;
        contentView.width = cc.winSize.width - 20;
        contentView.height = cc.winSize.height - 300;

        this.addChild(contentView);
    },

    setHeroList: function (itemList, selectHeroFunc) {
        this._heroList = itemList;
        return this.setFilter(null, selectHeroFunc);
    },

    setExtraHeroFunc: function (func) {
        this._extraHeroFunc = func;
        return this;
    },

    setMultiSelectMode: function (isMultiSelect) {
        this._isMultiSelect = isMultiSelect;
        return this;
    },

    setEnablePartInOtherTeam:function(enablePartInOtherTeam){
        this._enablePartInOtherTeam = enablePartInOtherTeam;
    },

    setFilter: function (filterFunc, selectHeroFunc) {
        var contentView = this._contentView;
        var panelGrid = new ccui.Layout();
        panelGrid.anchorX = 0.5;
        panelGrid.anchorY = 0.5;
        panelGrid.x = contentView.width * 0.5;
        panelGrid.y = contentView.height * 0.5;
        panelGrid.width = contentView.width;
        panelGrid.height = contentView.height;

        var emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        var self = this;
        var heroStock = mc.GameData.heroStock;
        var arrHero = this._heroList || heroStock.getHeroList(filterFunc) ;
        var minView = 30;
        var numMaxHero = Math.max(minView,(Math.round(arrHero.length/5)+1)*5) ;
        var mapHeroInInFormation = this._enablePartInOtherTeam ? mc.GameData.teamFormationManager.getMapHeroIdInFormation() : null;
        var gridView = this._gridView = new mc.SortedGridView(panelGrid)
            .setCurrentSortIndex(mc.GameData.guiState.getCurrentSortingHeroStockIndex())
            .setInfoText("Hero", arrHero.length + "/" + mc.const.MAX_HERO_IN_STOCK)
            .setSortingDataSource(["Power","Level","Star","Attack","Defense","Hp","Recovery"],function (widget,indexAttr){
                var heroInfo = widget.getUserData();
                var val = -1000;
                if( heroInfo ){
                    switch (indexAttr ){
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
                    if( mapHeroInInFormation ){
                        var partInTeamId = mapHeroInInFormation[mc.HeroStock.getHeroId(heroInfo)];
                        if( partInTeamId ){
                            if( partInTeamId === mc.TeamFormationManager.TEAM_CAMPAIGN ){
                                val += 3000000;
                            }
                            else if( partInTeamId === mc.TeamFormationManager.TEAM_ATTACK_ARENA ){
                                val += 2000000;
                            }
                            else if( partInTeamId === mc.TeamFormationManager.TEAM_CHAOSCASTLE ){
                                val += 1000000;
                            }
                        }
                    }
                }
                indexAttr >= 0 && mc.GameData.guiState.setCurrentSortingHeroStockIndex(indexAttr);
                return val;
            })
            .setDataSource(numMaxHero, function (index) {
                var widget = null;
                if (index < arrHero.length) {
                    var heroInfo = arrHero[index];
                    var widget = new mc.HeroAvatarView(heroInfo);
                    widget.scale = 0.9;
                    if( mapHeroInInFormation ){
                        var partInTeamId = mapHeroInInFormation[mc.HeroStock.getHeroId(heroInfo)];
                        if( partInTeamId ){
                            if (partInTeamId === mc.TeamFormationManager.TEAM_CAMPAIGN) {
                                widget.setStatusText("PartyCampaign", mc.color.GREEN_NORMAL);
                            }
                            else if (partInTeamId === mc.TeamFormationManager.TEAM_ATTACK_ARENA) {
                                widget.setStatusText("PartyArena", mc.color.YELLOW_ELEMENT);
                            }
                            else if (partInTeamId === mc.TeamFormationManager.TEAM_CHAOSCASTLE) {
                                widget.setStatusText("PartyChaos", mc.color.VIOLET_ELEMENT);
                            }
                            else {
                                widget.setStatusText("Party");
                            }
                            widget.setEnabled(false);
                        }
                    }
                    widget.registerTouchEvent(function (widget) {
                        selectHeroFunc && selectHeroFunc(widget);
                        if (!this._isMultiSelect) {
                            this.close();
                        }
                    }.bind(this),function(widget){
                        new mc.HeroInfoDialog(widget.getUserData()).show();
                    });
                    if (this._extraHeroFunc) {
                        this._extraHeroFunc(widget, heroInfo);
                    }
                }
                else {
                    widget = emptyWidget.clone();
                    widget.scale = 0.9;
                }
                return widget;
            }.bind(this));
        contentView.addChild(gridView);

        var btnClose = new ccui.ImageView("button/quit_button.png",ccui.Widget.PLIST_TEXTURE);
        btnClose.x = contentView.width - 40;
        btnClose.y = contentView.height - 40;
        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));
        contentView.addChild(btnClose);
        return this;
    },

    _showTutorial:function(){
    },

    overrideShowAnimation: function () {
        this._contentView.y = 0;
        this._contentView.runAction(cc.sequence([cc.moveBy(0.3, 0, this._contentView.height), cc.callFunc(function () {
            this._showTutorial();
        }.bind(this))]));
        return 0.3;
    },

    overrideCloseAnimation: function () {
        this._contentView.runAction(cc.sequence([cc.moveBy(0.3, 0, -this._contentView.height), cc.callFunc(function () {

        })]));
        return 0.3;
    }

});;