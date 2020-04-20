/**
 * Created by long.nguyen on 5/14/2018.
 */

var TAB_LIGHT = "Light";
var TAB_EARTH = "Earth";
var TAB_WATER = "Water";
var TAB_FIRE = "Fire";
var TAB_DARK = "Dark";
mc.TierHeroStockScreen = mc.Screen.extend({
    _rankingHeroesData: null,
    _heroes: [],

    initResources: function () {
        cc.log("load resource *********");
        var node = mc.loadGUI(res.screen_item_wiki_json);
        this.addChild(node);
        var root = this.root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelMiddle = rootMap["panelMiddle"];
        var nodeBrk = rootMap["nodeBrk"];
        var btnBack = new ccui.ImageView("button/Back_button.png", ccui.Widget.PLIST_TEXTURE);
        btnBack.x = 50;
        btnBack.y = brkTitle.y;
        root.addChild(btnBack);
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Event.png", ccui.Widget.LOCAL_TEXTURE));

        var tabFireActive = new ccui.ImageView("button/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
        var tabFireNormal = new ccui.ImageView("button/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
        var tabEarthActive = tabFireActive.clone();
        var tabEarthNormal = tabFireNormal.clone();
        var tabDarkActive = tabFireActive.clone();
        var tabDarkNormal = tabFireNormal.clone();
        var tabWaterActive = tabFireActive.clone();
        var tabWaterNormal = tabFireNormal.clone();
        var tabLightActive = tabFireActive.clone();
        var tabLightNormal = tabFireNormal.clone();
        panelMiddle.height -= 50;
        panelMiddle.y += 1;

        root.addChild(tabLightActive);
        root.addChild(tabLightNormal);
        root.addChild(tabWaterActive);
        root.addChild(tabWaterNormal);
        root.addChild(tabFireNormal);
        root.addChild(tabFireActive);
        root.addChild(tabEarthActive);
        root.addChild(tabEarthNormal);
        root.addChild(tabDarkActive);
        root.addChild(tabDarkNormal);

        var iconFire1 = new ccui.ImageView("icon/Fire_Element.png", ccui.Widget.PLIST_TEXTURE);
        var iconFire2 = iconFire1.clone();
        tabFireActive.addChild(iconFire1);
        tabFireNormal.addChild(iconFire2);

        var iconEarth1 = new ccui.ImageView("icon/Earth_Element.png", ccui.Widget.PLIST_TEXTURE);
        var iconEarth2 = iconEarth1.clone();
        tabEarthActive.addChild(iconEarth1);
        tabEarthNormal.addChild(iconEarth2);

        var iconWater1 = new ccui.ImageView("icon/Water_Element.png", ccui.Widget.PLIST_TEXTURE);
        var iconWater2 = iconWater1.clone();
        tabWaterActive.addChild(iconWater1);
        tabWaterNormal.addChild(iconWater2);

        var iconLight1 = new ccui.ImageView("icon/Light_Element.png", ccui.Widget.PLIST_TEXTURE);
        var iconLight2 = iconLight1.clone();
        tabLightActive.addChild(iconLight1);
        tabLightNormal.addChild(iconLight2);

        var iconDark1 = new ccui.ImageView("icon/Dark_Element.png", ccui.Widget.PLIST_TEXTURE);
        var iconDark2 = iconDark1.clone();
        tabDarkActive.addChild(iconDark1);
        tabDarkNormal.addChild(iconDark2);
        iconFire1.scale = iconFire2.scale =
            iconEarth1.scale = iconEarth2.scale =
                iconWater1.scale = iconWater2.scale =
                    iconLight1.scale = iconLight2.scale =
                        iconDark1.scale = iconDark2.scale = 0.3;

        iconFire1.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconFire2.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconEarth2.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconEarth1.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconWater1.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconWater2.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconLight1.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconLight2.setPosition(tabFireActive.width / 2, tabFireActive.height * 0.4);
        iconDark1.setPosition(tabDarkActive.width / 2, tabDarkActive.height * 0.4);
        iconDark2.setPosition(tabDarkActive.width / 2, tabDarkActive.height * 0.4);

        tabFireActive.scale = tabFireNormal.scale = tabEarthActive.scale = tabEarthNormal.scale =
            tabWaterActive.scale = tabWaterNormal.scale = tabLightActive.scale = tabLightNormal.scale =
                tabDarkActive.scale = tabDarkNormal.scale = 0.82;
        var heightRate = 0.83;
        tabFireActive.x = root.width * 0.12;
        tabFireActive.y = root.height * heightRate;
        tabFireNormal.x = root.width * 0.12;
        tabFireNormal.y = root.height * heightRate;


        tabEarthActive.x = root.width * 0.31;
        tabEarthActive.y = root.height * heightRate;
        tabEarthNormal.x = root.width * 0.31;
        tabEarthNormal.y = root.height * heightRate;

        tabWaterActive.x = root.width * 0.50;
        tabWaterActive.y = root.height * heightRate;
        tabWaterNormal.x = root.width * 0.50;
        tabWaterNormal.y = root.height * heightRate;

        tabLightActive.x = root.width * 0.69;
        tabLightActive.y = root.height * heightRate;
        tabLightNormal.x = root.width * 0.69;
        tabLightNormal.y = root.height * heightRate;

        tabDarkActive.x = root.width * 0.88;
        tabDarkActive.y = root.height * heightRate;
        tabDarkNormal.x = root.width * 0.88;
        tabDarkNormal.y = root.height * heightRate;

        var lblTitle = brkTitle.setString("Heroes", res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var emptyWidget = this._emptyWidget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
        emptyWidget.setVisible(false);
        this.addChild(emptyWidget);

        var heroStock = mc.GameData.heroStock;
        var currHeroes = heroStock.getHeroList();
        var allHeroFire = this._cloneHeroByType("Fire");
        var allHeroLight = this._cloneHeroByType("Light");
        var allHeroDark = this._cloneHeroByType("Dark");
        var allHeroEarth = this._cloneHeroByType("Earth");
        var allHeroWater = this._cloneHeroByType("Water");
        var _createHeroWidget = function (allHero, index) {
            var widget = null;
            if (index < allHero.length) {
                var heroInfo = allHero[index];
                widget = new mc.HeroAvatarView(heroInfo);
                widget.registerTouchEvent(function (widget) {
                    this._viewHeroInfo(allHero, index);
                }.bind(this), function () {
                });
                widget.scale = 1.0;
                var isExistHero = false;
                for (var j = 0; j < currHeroes.length; j++) {
                    if (this._checkHeroExisting(heroInfo, currHeroes[j])) {
                        isExistHero = true;
                        break;
                    }
                }
                if (!isExistHero)
                    widget.setStatusText(" ", mc.color.GREEN_NORMAL);
            } else {
                widget = emptyWidget.clone();
                widget._value = 0;
                widget.rangeIndex = index;
                widget.scale = 0.9;
                widget.setCascadeOpacityEnabled(true);
            }

            return widget;
        }.bind(this);

        var _createFireHeroWidgetByIndex = function (index) {
            return _createHeroWidget(allHeroFire, index);
        }.bind(this);

        var _createWaterHeroWidgetByIndex = function (index) {
            return _createHeroWidget(allHeroWater, index);
        }.bind(this);

        var _createEarthHeroWidgetByIndex = function (index) {
            return _createHeroWidget(allHeroEarth, index);
        }.bind(this);

        var _createLightHeroWidgetByIndex = function (index) {
            return _createHeroWidget(allHeroLight, index);
        }.bind(this);

        var _createDarkHeroWidgetByIndex = function (index) {
            return _createHeroWidget(allHeroDark, index);
        }.bind(this);

        var gridViewFireHero = this._createGridViewHero("Fire", panelMiddle, _createFireHeroWidgetByIndex);
        var gridViewWaterHero = this._createGridViewHero("Water", panelMiddle, _createWaterHeroWidgetByIndex);
        var gridViewEarthHero = this._createGridViewHero("Earth", panelMiddle, _createEarthHeroWidgetByIndex);
        var gridViewLightHero = this._createGridViewHero("Light", panelMiddle, _createLightHeroWidgetByIndex);
        var gridViewDarkHero = this._createGridViewHero("Dark", panelMiddle, _createDarkHeroWidgetByIndex);

        root.addChild(gridViewFireHero);
        root.addChild(gridViewWaterHero);
        root.addChild(gridViewEarthHero);
        root.addChild(gridViewLightHero);
        root.addChild(gridViewDarkHero);
        gridViewWaterHero.setVisible(false);
        gridViewEarthHero.setVisible(false);
        gridViewDarkHero.setVisible(false);
        gridViewLightHero.setVisible(false);

        this._selectTab = function (tabId) {
            tabFireActive.setVisible(false);
            tabFireNormal.setVisible(false);
            tabLightActive.setVisible(false);
            tabLightNormal.setVisible(false);
            tabEarthActive.setVisible(false);
            tabEarthNormal.setVisible(false);
            tabDarkActive.setVisible(false);
            tabDarkNormal.setVisible(false);
            tabWaterActive.setVisible(false);
            tabWaterNormal.setVisible(false);
            gridViewFireHero.setVisible(false);
            gridViewWaterHero.setVisible(false);
            gridViewEarthHero.setVisible(false);
            gridViewDarkHero.setVisible(false);
            gridViewLightHero.setVisible(false);
            brkTitle.setString(tabId, res.font_UTMBienvenue_stroke_32_export_fnt);
            if (tabId === TAB_FIRE) {
                tabFireActive.setVisible(true);
                tabLightNormal.setVisible(true);
                tabDarkNormal.setVisible(true);
                tabWaterNormal.setVisible(true);
                tabEarthNormal.setVisible(true);
                gridViewFireHero.setVisible(true);
            }
            else if (tabId === TAB_EARTH) {
                tabEarthActive.setVisible(true);
                tabLightNormal.setVisible(true);
                tabDarkNormal.setVisible(true);
                tabWaterNormal.setVisible(true);
                tabFireNormal.setVisible(true);
                gridViewEarthHero.setVisible(true);
            }
            else if (tabId === TAB_WATER) {
                tabWaterActive.setVisible(true);
                tabLightNormal.setVisible(true);
                tabDarkNormal.setVisible(true);
                tabEarthNormal.setVisible(true);
                tabFireNormal.setVisible(true);
                gridViewWaterHero.setVisible(true);
            }
            else if (tabId === TAB_LIGHT) {
                tabLightActive.setVisible(true);
                tabEarthNormal.setVisible(true);
                tabDarkNormal.setVisible(true);
                tabWaterNormal.setVisible(true);
                tabFireNormal.setVisible(true);
                gridViewLightHero.setVisible(true);
            } else if (tabId === TAB_DARK) {
                tabDarkActive.setVisible(true);
                tabLightNormal.setVisible(true);
                tabEarthNormal.setVisible(true);
                tabWaterNormal.setVisible(true);
                tabFireNormal.setVisible(true);
                gridViewDarkHero.setVisible(true);
            }

        }.bind(this);

        tabFireNormal.registerTouchEvent(function () {
            this._selectTab(TAB_FIRE);
        }.bind(this));
        tabEarthNormal.registerTouchEvent(function () {
            this._selectTab(TAB_EARTH);
        }.bind(this));
        tabLightNormal.registerTouchEvent(function () {
            this._selectTab(TAB_LIGHT);
        }.bind(this));
        tabWaterNormal.registerTouchEvent(function () {
            this._selectTab(TAB_WATER);
        }.bind(this));
        tabDarkNormal.registerTouchEvent(function () {
            this._selectTab(TAB_DARK);
        }.bind(this));
    },

    _cloneHeroByType: function (heroType) {
        var allHeroClone = [];
        var allHero = mc.dictionary.getAllHeroByElement(heroType);
        for (var i = 0; i < allHero.length; i++) {
            var heroInfo = JSON.parse(JSON.stringify(allHero[i]));
            heroInfo = this._upgradeMaxLvForHero(heroInfo);
            heroInfo = this._upgradeMaxLvSkillsForHero(heroInfo);
            allHeroClone.push(heroInfo);
        }
        return allHeroClone;

    },
    _createGridViewHero: function (tabId, panelMiddle, createHeroWidgetByIndex) {
        var allHero = mc.dictionary.getAllHeroByElement(tabId);
        return new mc.SortedGridView(panelMiddle)
            .setSortingDataSource(["Power", "Attack", "Defense", "Hp", "Resistance"], function (widget, indexAttr) {
                var heroInfo = widget.getUserData();
                var val = -1000;
                if (heroInfo) {
                    return mc.HeroStock.getHeroValueByAttr(heroInfo, indexAttr, allHero);
                }
                return (widget._value + val);
            }).setInfoText(tabId, 0, this._getInfoWidth())

            .setDataSource(40, createHeroWidgetByIndex);
    },
    _getInfoTitle: function () {
        return "Water.";
    },

    _getInfoWidth: function () {
        return 210;
    },

    loadRankingHeroes: function () {
        LAST_LOADED = LOAD_TYPE.RANKING;
        this._parseRankingHeroes();
        this._initRankingHeroesList();
    },

    loadChaosHeroes: function () {
        LAST_LOADED = LOAD_TYPE.CHAOS;
        this._parseChaosRankingHeroes();
        this._initChaosHeroesList();
    },

    _parseRankingHeroes: function () {
        this._heroes = [];
        if (this._rankingHeroesData) {
            var arrSS = [];
            var arrS = [];
            var arrA = [];
            var arrB = [];
            var arrC = [];
            for (var i = 0; i < this._rankingHeroesData.length; i++) {
                var r = this._rankingHeroesData[i];
                var rank = r.rank;
                if (rank) {
                    rank = rank.toLowerCase();
                    if (r.rank === 'ss') {
                        arrSS.push(r.index);
                    }
                    else if (r.rank === 's') {
                        arrS.push(r.index);
                    }
                    else if (r.rank === 'a') {
                        arrA.push(r.index);
                    }
                    else if (r.rank === 'b') {
                        arrB.push(r.index);
                    }
                    else if (r.rank === 'c') {
                        arrC.push(r.index);
                    }
                }
            }
            if (arrS.length > 0) {
                this._heroes.push({rank: "Rank SS", arrHero: arrSS});
            }
            if (arrS.length > 0) {
                this._heroes.push({rank: "Rank S", arrHero: arrS});
            }
            if (arrA.length > 0) {
                this._heroes.push({rank: "Rank A", arrHero: arrA});
            }
            if (arrB.length > 0) {
                this._heroes.push({rank: "Rank B", arrHero: arrB});
            }
            if (arrC.length > 0) {
                this._heroes.push({rank: "Rank C", arrHero: arrC});
            }
        }
    },

    _parseChaosRankingHeroes: function () {
        this._heroes = [];
        if (this._rankingHeroesData) {
            var arrChaos = [];
            for (var i = 0; i < this._rankingHeroesData.length; i++) {
                var r = this._rankingHeroesData[i];
                if (r.chaos) {
                    arrChaos.push(r.index);
                }
            }
            if (arrChaos.length > 0) {
                this._heroes.push({arrHero: arrChaos});
            }

        }
    },


    _initRankingHeroesList: function () {
        this._lvlHeroes.removeAllChildren();
        for (var i = 0; i < this._heroes.length; i++) {
            var layout = this._initRow(this._heroes[i]);
            var header = this._lblHeader.clone();
            header.getChildByName("lblBkg").getChildByName("lbl").setString(mc.dictionary.getGUIString(this._heroes[i].rank));
            this._lvlHeroes.pushBackCustomItem(header);
            this._lvlHeroes.pushBackCustomItem(layout);
        }
    },

    _initChaosHeroesList: function () {
        this._lvlHeroes.removeAllChildren();
        for (var i = 0; i < this._heroes.length; i++) {
            var layout = this._initRow(this._heroes[i]);
            if (this._heroes[i].rank) {
                var header = this._lblHeader.clone();
                header.getChildByName("lblBkg").getChildByName("lbl").setString(mc.dictionary.getGUIString(this._heroes[i].rank));
                this._lvlHeroes.pushBackCustomItem(header);
            }
            this._lvlHeroes.pushBackCustomItem(layout);
        }
    },

    _createHeroList: function (arrHeroIndex) {
        var heroList = [];
        var currHeroes = mc.GameData.heroStock.getHeroList();
        if (arrHeroIndex) {
            for (var i = 0; i < arrHeroIndex.length; i++) {
                var heroInfo = JSON.parse(JSON.stringify(mc.dictionary.getHeroDictByIndex(arrHeroIndex[i])));
                heroInfo = this._upgradeMaxLvForHero(heroInfo);
                heroInfo = this._upgradeMaxLvSkillsForHero(heroInfo);
                heroInfo.isHas = false;
                for (var j = 0; j < currHeroes.length; j++) {
                    if (this._checkHeroExisting(heroInfo, currHeroes[j])) {
                        heroInfo.isHas = true;
                        break;
                    }
                }
                heroList.push(heroInfo);
            }
        }

        return heroList;
    },

    _checkHeroExisting: function (heroMax, curHero) {
        return Math.abs(heroMax.index - curHero.index) < 5;
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
        var maxLv = heroInfo["maxLevel"];
        var attr = mc.HeroStock.getHeroTotalAttrByLevel(heroInfo, maxLv);
        for (var key in attr) {
            newHero[key] = attr[key];
        }
        newHero.level = maxLv;
        return newHero
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


    _initRow: function (rankdData) {
        var heroList = this._createHeroList(rankdData.arrHero);
        var amountViews = heroList.length;
        var layout = bb.layout.grid(bb.collection.createArray(amountViews, function (index) {
            var heroInfo = heroList[index];
            var widget = new mc.HeroAvatarView(heroInfo);
            widget.scale = 0.95;
            widget.registerTouchEvent(function (widget) {
                this._viewHeroInfo(heroList, index);
            }.bind(this), function () {
                //this._showPopupInfo(widget.getUserData(), true);
            });
            widget.setSwallowTouches(false);
            widget.setCascadeColorEnabled(true);
            widget.setBlack(!heroInfo.isHas);
            //_updateStatus(widget);
            return widget;

        }.bind(this)), 5, this._lvlHeroes.width * 0.98, 5);
        layout.xPercent = 0.5;
        return layout;
    },


    _showPopupInfo: function (heroInfo, quickExchange) {
        new mc.HeroInfoDialog(heroInfo, true, !!quickExchange).show();
    },

    _viewHeroInfo: function (heroList, index) {
        //var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_MAX_LV_INFO);
        //layer.setHero(heroList, index);
        mc.GUIFactory.showHeroMaxLvInfoScreen(heroList, index);
    },


    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_TIER_HEROES;
    }

});
mc.TierHeroStockScreen.VIEW_MODE = {RANKING: 1, CHAOS: 2};