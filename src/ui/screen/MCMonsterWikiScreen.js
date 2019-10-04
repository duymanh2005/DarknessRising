/**
 * Created by long.nguyen on 5/14/2018.
 */


mc.MonsterWikiScreen = mc.Screen.extend({

    _data : null,

    initResources: function () {
        this._super();

        var node  = mc.loadGUI(res.screen_monster_wiki_json);
        this.addChild(node);
        var root = this.root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("Monster"));
        var lvlMons = this._lvlMons = rootMap["lvlMonster"];
        var widget = this._widget = rootMap["monsterIcon"];
        var lblHeader = this._lblHeader = rootMap["lblHeader"];
        lblHeader.setCascadeOpacityEnabled(true);
        var btnBack = new ccui.ImageView("button/Back_button.png", ccui.Widget.PLIST_TEXTURE);
        btnBack.x = 50;
        btnBack.y = brkTitle.y ;
        root.addChild(btnBack);
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });
        var arrMonster = bb.utility.cloneJSON(mc.dictionary.getAllMonster());
        this._data = this._parseMonsterByType(arrMonster);
        this._initList(lvlMons);

    },

    _initList : function(listView){
        listView.removeAllChildren();
        var data = this._data;
        for(var i = 0;i<data.length;i++)
        {
            var item = data[i];
            var layout = this._initMonsterRow(item.data);
            var header = this._lblHeader.clone();
            header.getChildByName("lblBkg").getChildByName("lbl").setString(mc.dictionary.getGUIString(item.type));
            listView.pushBackCustomItem(header);
            listView.pushBackCustomItem(layout);
        }
    },

    _viewHeroInfo: function (heroList, index) {
        //var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_MAX_LV_INFO);
        //layer.setHero(heroList, index);
        mc.GUIFactory.showHeroMaxLvInfoScreen(heroList,index);
    },

    _parseMonsterByType : function(arrMons)
    {
        var arr = [];
        for(var i= 0;i<arrMons.length;i++)
        {
            var item = arrMons[i];
            var arrItem = null;
            for(var j = 0;j<arr.length;j++)
            {
                if(arr[j].type === item.type)
                {
                    arrItem = arr[j];
                }
            }
            var itemExisting = false;
            if(!arrItem)
            {
                arrItem = { type : item.type, data : []};
                arr.push(arrItem);
            }
            else
            {
                for(var m = 0;m<arrItem.data.length;m++)
                {
                    if(item.img === arrItem.data[m].img)
                    {
                        itemExisting = true;
                        break;
                    }
                }

            }
            if(!itemExisting)
            {
                var spriteFrame = cc.spriteFrameCache.getSpriteFrame("png/monster/icon/" + item.img + ".png");
                if (spriteFrame) {
                    arrItem.data.push(item);
                }
            }
        }
        return arr;
    }
    ,

    _initMonsterRow : function(arrMonster){


        var createMonsterView = function(bossInfo)
        {
            var widget = this._widget.clone();
            widget.setVisible(true);
            widget.registerTouchEvent(function(){
                this._viewHeroInfo(heroList, index);
            });
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
        }.bind(this);

        var initRow = function (arrMons) {
            var monsList = arrMons;
            var amountViews = monsList.length;
            var layout = bb.layout.grid(bb.collection.createArray(amountViews, function (index) {
                var bossInfo = monsList[index];
                var widget = this._widget.clone();
                widget.setVisible(true);
                widget.registerTouchEvent(function(){
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

            }.bind(this)), 5, this._lvlMons.width * 0.98, 5);
            layout.xPercent = 0.5;
            return layout;
        }.bind(this);
        var row = initRow(arrMonster);
        return row;
    },

    _viewMonsterInfo: function (monsterList, index) {
        //var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_MAX_LV_INFO);
        //layer.setHero(heroList, index);
        mc.GUIFactory.showMonsterInfoScreen(monsterList,index);
    },


    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_MONSTER_WIKI;
    }

});
mc.TierHeroStockScreen.VIEW_MODE = { RANKING : 1, CHAOS : 2};