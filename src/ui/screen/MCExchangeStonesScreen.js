/**
 * Created by long.nguyen on 6/26/2018.
 */
mc.ExchangeStonesScreen = mc.Screen.extend({
    _mapPickHeroViewById: null,
    _mapHeroWidgetById:null,

    initResources: function () {
        this._super();

        this._mapPickHeroViewById = {};
        this._mapHeroWidgetById = {};
        var node = this._screen = mc.loadGUI(res.screen_exchange_stones_json);
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var brk = rootMap["brk"];
        var imgTitle = rootMap["imgTitle"];
        var bottomPanel = rootMap["bottomPanel"];
        var topPanel = rootMap["topPanel"];
        var btnExchange = this._btnExchange = rootMap["btnExchange"];
        var btnBack = rootMap["btnBack"];
        var slotMoney = rootMap["slotMoney"];
        var slotBless = rootMap["slotBless"];
        slotBless.setVisible(false);
        slotMoney.setVisible(false);

        var bottomMap = bb.utility.arrayToMap(bottomPanel.getChildren(), function (child) {
            return child.getName();
        });

        var nodeItem = this._nodeItem = bottomMap["nodeItem"];
        var lblResult = bottomMap["lblResult"];
        if(mc.enableReplaceFontBM())
        {
            lblResult = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblResult);
        }
        lblResult.setColor(mc.color.BROWN_SOFT);
        lblResult.setString(mc.dictionary.getGUIString("lblResult"));
        imgTitle._maxLblWidth = imgTitle.width - 100;
        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblExchangeStones"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var arrFighterClassName = cc.copyArray(mc.dictionary.getGUIString("arrLblFighterBattleRole"));
        cc.arrayAppendObjectsToIndex(arrFighterClassName, mc.dictionary.getGUIString("lblAll"), 0);
        var emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        emptyWidget.setVisible(false);
        this.addChild(emptyWidget);
        var self = this;
        var heroStock = mc.GameData.heroStock;
        var arrHero = heroStock.getHeroList();
        var minView = 30;
        var numMaxHero = Math.max(minView, (Math.round(arrHero.length / 5) + 1) * 5);
        var mapHeroInInFormation = mc.GameData.teamFormationManager.getMapHeroIdInFormation();
        var gridView = this._gridView = new mc.SortedGridView(topPanel)
            .setCurrentSortIndex(mc.GameData.guiState.getCurrentSortingHeroStockIndex())
            .setInfoText("No. ", arrHero.length)
            .setSortingDataSource(["Power", "Level", "Star", "Attack", "Defense", "Hp", "Resistance"], function (widget, indexAttr) {
                var heroInfo = widget.getUserData();
                return mc.HeroStock.getHeroValueByAttr(heroInfo, indexAttr, mapHeroInInFormation);
            })
            .setFilteringDataSource(arrFighterClassName, function (widget, indexAttr) {
                var heroInfo = widget.getUserData();
                if (heroInfo) {
                    if (mc.HeroStock.getHeroBattleRole(heroInfo).toLowerCase() === arrFighterClassName[indexAttr].toLowerCase() ||
                        indexAttr === 0) {
                        return 1;
                    }
                    return -1;
                }
                return 0;
            }, 30)
            .setDataSource(numMaxHero, function (index) {
                var widget = null;
                if (index < arrHero.length) {
                    var heroInfo = arrHero[index];
                    var widget = new mc.HeroAvatarView(heroInfo);
                    self._mapHeroWidgetById[mc.HeroStock.getHeroId(heroInfo)] = widget;
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
                        var canPick = true;
                        var heroInfo = widget.getUserData();
                        var heroId = mc.HeroStock.getHeroId(heroInfo);
                        if (mapHeroInInFormation[heroId]) {
                            mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtHeroIsInFormation"));
                            canPick = false;
                        }
                        if( canPick ){
                            var mapEquipBySlot = mc.GameData.itemStock.getMapEquippingItemByHeroId(heroId);
                            if( mapEquipBySlot ){
                                for(var key in mapEquipBySlot ){
                                    mapEquipBySlot[key] && (canPick = false);
                                }
                                !canPick && mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtSuggestUnEquipToExchange"));
                            }
                        }
                        if( canPick) {
                            widget.setPick(!widget.isBlack);
                            self._mapPickHeroViewById[heroId] = widget.isBlack ? widget : null;
                            self._updateResult();
                        }
                    });
                }
                else {
                    widget = emptyWidget.clone();
                    widget.setVisible(true);
                    widget.scale = 0.9;
                }
                return widget;
            });
        gridView.width = topPanel.width;
        gridView.height = topPanel.height;
        root.addChild(gridView);

        btnExchange.setGray(true);
        btnExchange.setString(mc.dictionary.getGUIString("lblExchange"));
        btnExchange.registerTouchEvent(function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            var arrHeroId = [];
            for (var heroId in self._mapPickHeroViewById) {
                if (self._mapPickHeroViewById[heroId]) {
                    arrHeroId.push(heroId);
                }
            }
            mc.protocol.exchangeStoneByHeroIds(arrHeroId, function (rs) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (rs) {
                    var newHeroes = mc.storage.readNewHeroes();
                    if (newHeroes) {
                        for(var j in arrHeroId)
                        {
                            for (var i in newHeroes) {
                                var heroId = arrHeroId[j] + "";
                                if(i === heroId){
                                    delete mc.storage.newHeroes[i];
                                    mc.storage.saveNewHeroes();
                                    break;
                                }
                            }
                        }
                        if(mc.storage.newHeroes && !bb.utility.isEmptyObj(mc.storage.newHeroes))
                        {
                            mc.storage.featureNotify.heroesLayerShowed = false;
                        }
                        else
                        {
                            mc.storage.featureNotify.heroesLayerShowed = true;
                        }
                        mc.storage.saveFeatureNotify();
                    }
                    var arrRemoveAvtView = [];
                    for (var heroId in self._mapPickHeroViewById) {
                        if (self._mapPickHeroViewById[heroId]) {
                            arrRemoveAvtView.push(self._mapPickHeroViewById[heroId]);
                        }
                    }
                    self._gridView.removeArrayElementView(arrRemoveAvtView);
                    self._mapPickHeroViewById = {};
                    self._updateResult();
                }
            });
            bb.sound.playEffect(res.sound_ui_item_gettobag);
        });
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        var currExchangeHeroId = mc.GameData.guiState.getCurrentExchangeHeroId();
        if( currExchangeHeroId ){
            var heroWidget = self._mapHeroWidgetById[currExchangeHeroId];
            if( heroWidget ){
                heroWidget.setPick(true);
                self._mapPickHeroViewById[currExchangeHeroId] = heroWidget;
                gridView.scrollToItem(heroWidget,0.01);
            }
            mc.GameData.guiState.setCurrentExchangeHeroId(null);
        }
        self._updateResult();

        this.traceDataChange(mc.GameData.itemStock, function () {
            var arrNewComingItem = mc.GameData.itemStock.popArrayNewComingItem();
            if (arrNewComingItem) {
                mc.view_utility.showNewComingItem(arrNewComingItem);
            }
        }.bind(this));
    },

    _updateResult: function () {
        this._nodeItem.removeAllChildren();
        var arrBonusInfoByLevel = [];
        var mapNumStoneByElement = {};
        var mapBonusInfoByIndex = {};
        for (var heroId in this._mapPickHeroViewById) {
            if (this._mapPickHeroViewById[heroId]) {
                var heroInfo = this._mapPickHeroViewById[heroId].getUserData();
                var rank = mc.HeroStock.getHeroRank(heroInfo);
                var element = mc.HeroStock.getHeroElement(heroInfo).toLowerCase();
                if (!mapNumStoneByElement[element]) {
                    mapNumStoneByElement[element] = 0;
                }
                mapNumStoneByElement[element] += mc.const.MAP_RANK_BY_STONES[rank];
                var arrBonus = mc.dictionary.getDisarmHeroRecipeBonus(mc.HeroStock.getHeroLevel(heroInfo),element);
                if( arrBonus ){
                    for(var i = 0; i < arrBonus.length; i++ ){
                        var bonusIndex = mc.ItemStock.getItemIndex(arrBonus[i]);
                        if( !mapBonusInfoByIndex[bonusIndex] ){
                            mapBonusInfoByIndex[bonusIndex] = arrBonus[i];
                        }
                        else{
                            mapBonusInfoByIndex[bonusIndex].no += arrBonus[i].no;
                        }
                    }
                }
            }
        }

        var arrItemView = [];
        var mapItemIndexByElement = {};
        mapItemIndexByElement["light"] = mc.const.ITEM_INDEX_LIGHT_SPHERE;
        mapItemIndexByElement["dark"] = mc.const.ITEM_INDEX_DARK_SPHERE;
        mapItemIndexByElement["fire"] = mc.const.ITEM_INDEX_FIRE_SPHERE;
        mapItemIndexByElement["earth"] = mc.const.ITEM_INDEX_EARTH_SPHERE;
        mapItemIndexByElement["water"] = mc.const.ITEM_INDEX_WATER_SPHERE;
        for (var element in mapNumStoneByElement) {
            var itemIndex = mapItemIndexByElement[element];
            arrBonusInfoByLevel.push(mc.ItemStock.createJsonItemInfo(itemIndex, mapNumStoneByElement[element]));
        }
        var arrBonusInfo = bb.utility.mapToArray(mapBonusInfoByIndex);
        if( arrBonusInfo && arrBonusInfo.length > 0 ){
            arrBonusInfoByLevel = bb.collection.arrayAppendArray(arrBonusInfoByLevel,arrBonusInfo);
        }

        for(var i = 0; i < arrBonusInfoByLevel.length; i++ ){
            var itemView = new mc.ItemView(arrBonusInfoByLevel[i]);
            itemView.setNewScale(0.75);
            itemView.registerViewItemInfo();
            arrItemView.push(itemView);
        }

        if (arrItemView.length > 0) {
            var layoutItem = bb.layout.linear(arrItemView, 40, bb.layout.LINEAR_HORIZONTAL);
            var scrollWidth = 650;
            if( layoutItem.width > scrollWidth ){
                var scrollView = new ccui.ScrollView();
                scrollView.setDirection(ccui.ScrollView.DIR_HORIZONTAL);
                scrollView.width = scrollWidth;
                scrollView.height = 120;
                scrollView.anchorX = scrollView.anchorY = 0.5;
                scrollView.setInnerContainerSize(cc.size(layoutItem.width,layoutItem.height));
                layoutItem.x = layoutItem.width*0.5;
                layoutItem.y = scrollView.height*0.5;
                scrollView.addChild(layoutItem);
                this._nodeItem.addChild(scrollView);
            }
            else{
                this._nodeItem.addChild(layoutItem);
            }
        }
        else {
            var lbl = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtUseHeroToExchange"), res.font_UTMBienvenue_none_32_export_fnt);
            lbl.setColor(mc.color.BROWN_SOFT);
            this._nodeItem.addChild(lbl);
        }

        this._btnExchange.setGray(arrItemView.length === 0);
    }

});