/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.ChaosRulesDialog = bb.Dialog.extend({
    _heroes: [],
    _rankingHeroesData: null,

    ctor: function () {
        this._super();
        this._rankingHeroesData = mc.dictionary.rankingHeroesData;
        var node = ccs.load(res.widget_rules_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title = rootMap["lblDialogTitle"];


        if(mc.enableReplaceFontBM())
        {
            title = mc.view_utility.replaceBitmapFontAndApplyTextStyle(title);
            mc.view_utility.applyDialogTitleStyle(title);
        }
        else
        {
            title.setColor(mc.color.YELLOW_SOFT);
        }
        title.setString(mc.dictionary.getGUIString("lblChaosCastle"));

        var brk = rootMap["brk"];
        var btnExit = rootMap["btnExit"];
        this.title = rootMap["title"];
        this.content = rootMap["content"];
        this.listView = brk.getChildByName("list_view");
        this.listView.setGravity(ccui.ListView.GRAVITY_LEFT);


        btnExit.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        var data = mc.dictionary.chaosRulesData;

        var lan = mc.storage.readSetting()["language"];
        var creditContent = data[lan || "en"];

        for (var i in creditContent) {
            var ob = creditContent[i];
            this.addHeader(ob["header"]);
            this.addContent(ob["content"]);
            this.addSeperator();
        }
        this._initChaosHeroesList();
    },

    srollToBottom : function(){
        if(this.listView)
        {
            this.listView.scrollToBottom(100,false);
        }
    },

    addButton: function (resource, title, func) {
        var button = new ccui.ImageView(resource, ccui.Widget.PLIST_TEXTURE);
        button.setScale9Enabled(true);
        button.width = 300;
        button.setAnchorPoint(0, 0.5);
        button.setString(title, res.font_UTMBienvenue_stroke_32_export_fnt, mc.const.FONT_SIZE_24);
        button.registerTouchEvent(func.bind(this));
        this.listView.pushBackCustomItem(button);
    },


    addHeader: function (header) {
        var lbl = null;
        if(mc.enableReplaceFontBM())
        {
            lbl = mc.view_utility.createTextFromFontBitmap(this.title._fntFileName);
            mc.view_utility.applyDialogHeaderStyle(lbl);
        }
        else
        {
            lbl = this.title.clone();
            lbl.setScale(0.8);
            lbl.setColor(mc.color.YELLOW_SOFT);
        }
        lbl.setVisible(true);
        lbl.setString(header);
        this.listView.pushBackCustomItem(lbl);
    },
    addContent: function (content) {
        for (var i in content) {
            var lbl = null;
            if(mc.enableReplaceFontBM())
            {
                lbl = mc.view_utility.createTextFromFontBitmap(this.content._fntFileName);
                lbl.setMultiLineString(content[i],this.listView.width * 0.90 * (2 - lbl.getScaleX()), cc.TEXT_ALIGNMENT_LEFT);
                mc.view_utility.applyDialogContentStyle(lbl);
            }
            else
            {
                lbl = this.content.clone();
                lbl.setScale(0.75);
                lbl.setMultiLineString(content[i], this.listView.width * 0.90 * (2 - lbl.getScaleX()), cc.TEXT_ALIGNMENT_LEFT);
                lbl.setVisible(true);
            }
            this.listView.pushBackCustomItem(lbl);
        }
    },
    addSeperator: function () {
        var lbl = this.title.clone();
        lbl.setString("     ");
        lbl.setVisible(true);
        this.listView.pushBackCustomItem(lbl);
    },

    _parseChaosRankingHeroes: function () {
        this._heroes = [];
        if (this._rankingHeroesData) {
            var arrChaos = [];
            for (var i = 0; i < this._rankingHeroesData.length; i++) {
                var r = this._rankingHeroesData[i];
                if (r.chaos && parseInt(r.chaos) > 6) {
                    arrChaos.push(r.index);
                }
            }
            if (arrChaos.length > 0) {
                this._heroes.push({ arrHero: arrChaos});
            }

        }
    },

    _initChaosHeroesList:function()
    {
        //this._lvlHeroes.removeAllChildren();
        this._parseChaosRankingHeroes();
        for (var i = 0; i < this._heroes.length; i++) {
            var layout = this._initRow(this._heroes[i]);
            this.listView.pushBackCustomItem(layout);
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
                    if (this._checkHeroExisting(heroInfo,currHeroes[j])) {
                        heroInfo.isHas = true;
                        break;
                    }
                }
                heroList.push(heroInfo);
            }
        }

        return heroList;
    },

    _checkHeroExisting :function(heroMax, curHero){
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
            widget.scale = 0.8;
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

        }.bind(this)), 5, this.listView.width * 0.98, 5);
        layout.xPercent = 0.5;
        return layout;
    },

    _viewHeroInfo: function (heroList, index) {
        //var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_MAX_LV_INFO);
        //layer.setHero(heroList, index);
        mc.GUIFactory.showHeroMaxLvInfoScreen(heroList,index);
    },

    overrideCloseAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    },
    overrideShowAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.setOpacity(0);
        this.runAction(cc.sequence([cc.fadeIn(0.3)]));
        return 0.3;
    }

});