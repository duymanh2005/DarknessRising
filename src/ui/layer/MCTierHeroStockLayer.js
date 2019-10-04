/**
 * Created by long.nguyen on 7/27/2017.
 */
var LOAD_TYPE = { RANKING : 1, CHAOS : 2};
var LAST_LOADED = null;
mc.TierHeroStockLayer = mc.MainBaseLayer.extend({
    _rankingHeroesData: null,
    _mapEmptySlot: 0,
    _mapPickHeroView: null,
    _mapStockHeroView: null,
    //_heroes: [{rank: "Rank S", arrHero: [324, 124, 614, 734, 234, 814, 364, 344, 134]},
    //    {
    //        rank: "Rank A",
    //        arrHero: [114, 154, 204, 214, 314, 334, 354, 414, 424, 504, 524, 534, 604, 704, 804, 224, 564, 724, 164]
    //    },
    //    {rank: "Rank B", arrHero: [104, 714]},
    //    {rank: "Rank C", arrHero: [303, 402, 452, 512, 552]}
    //],
     _loadHeroesType : null,
    _heroes: [],


    ctor: function (parseNode) {
        this._super();
        this._rankingHeroesData = mc.dictionary.rankingHeroesData;

        var root = this.root = this.parseCCStudio(parseNode || res.layer_tier_hero_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("Tier Heroes"));
        var lvlHeroes = this._lvlHeroes = rootMap["lvlHeroes"];
        var lblHeader = this._lblHeader = rootMap["lblHeader"];
        lblHeader.setCascadeOpacityEnabled(true);
        if(LAST_LOADED)
        {
            if(LAST_LOADED === LOAD_TYPE.RANKING)
            {
                this.loadRankingHeroes();
            }
            else if(LAST_LOADED === LOAD_TYPE.CHAOS)
            {
                this.loadChaosHeroes();
            }
        }

    },

    loadRankingHeroes: function(){
        LAST_LOADED = LOAD_TYPE.RANKING;
        this._parseRankingHeroes();
        this._initRankingHeroesList();
    },

    loadChaosHeroes: function(){
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
                this._heroes.push({ arrHero: arrChaos});
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

    _initChaosHeroesList:function()
    {
        this._lvlHeroes.removeAllChildren();
        for (var i = 0; i < this._heroes.length; i++) {
            var layout = this._initRow(this._heroes[i]);
            if(this._heroes[i].rank)
            {
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
                    if (this._checkHeroesExisting(heroInfo,currHeroes[j])) {
                        heroInfo.isHas = true;
                        break;
                    }
                }
                heroList.push(heroInfo);
            }
        }

        return heroList;
    },

    _checkHeroesExisting :function(heroMax, curHero){
        var delta = Math.abs(heroMax.index - curHero.index);
        if(delta<5)
        {
            return true;
        }
        return false;
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
        var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_MAX_LV_INFO);
        layer.setHero(heroList, index);
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_TIER_HERO_STOCK;
    },

    isShowHeader: function () {
        return false;
    },

    onLayerClearStack : function(){
        LAST_LOADED = null;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }
});
//mc.TierHeroStockLayer.LAST_LOAD = null;