/**
 * Created by long.nguyen on 10/4/2017.
 */
const NORMAL_ARENA = 1;
const RELIC_ARENA = 2;
var lastSelectedAreana = NORMAL_ARENA;
mc.SelectArenaLayer = mc.MainBaseLayer.extend({


    ctor: function () {
        this._super();

        var root = this._root = this.parseCCStudio(res.layer_select_arena);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];


        var btnEnter = this._btnEnter = rootMap["btnJoin"];

        var nodeBrk = rootMap["nodeBrk"];


        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        nodeBrk.addChild(sprBrk);

        var lblRelicArena = rootMap["lblRelicArena"];
        var lblNormalArena = rootMap["lblNormalArena"];

        lblNormalArena.setString(mc.dictionary.getGUIString("lblArena"));
        lblRelicArena.setString(mc.dictionary.getGUIString("lblRelicArena"));
        var pnlNormalArena = rootMap["pnlNormalArena"];
        var normalArenaItem = pnlNormalArena.getChildByName("imgBorder");
        var pnlRelicArena = rootMap["pnlRelicArena"];
        var relicArenaItem = pnlRelicArena.getChildByName("imgBorder");

        var onSelectItem = function(value){
            this._currSelected = value;
            lastSelectedAreana = value;
            if(value === NORMAL_ARENA)
            {
                pnlNormalArena.getChildByName("imgHighLight").setVisible(true);
                pnlNormalArena.getChildByName("pnlBlack").setVisible(false);
                pnlRelicArena.getChildByName("imgHighLight").setVisible(false);
                pnlRelicArena.getChildByName("pnlBlack").setVisible(true);
            }
            else
            {
                pnlNormalArena.getChildByName("imgHighLight").setVisible(false);
                pnlNormalArena.getChildByName("pnlBlack").setVisible(true);
                pnlRelicArena.getChildByName("imgHighLight").setVisible(true);
                pnlRelicArena.getChildByName("pnlBlack").setVisible(false);
            }
        }.bind(this);
        onSelectItem(lastSelectedAreana);
        pnlNormalArena.registerTouchEvent(function(){
            onSelectItem(NORMAL_ARENA);
        }.bind(this),function(){
            onSelectItem(NORMAL_ARENA);
        }.bind(this));
        pnlRelicArena.registerTouchEvent(function(){
            onSelectItem(RELIC_ARENA);
        }.bind(this),function(){
            onSelectItem(RELIC_ARENA);
        }.bind(this));


        var self = this;
        var lblSearch = btnEnter.setString(mc.dictionary.getGUIString("lblJoin"));
        lblSearch.scale = 1.1;
        lblSearch.x = btnEnter.width * 0.5;
        lblSearch.y = btnEnter.height * 0.6;
        btnEnter.registerTouchEvent(function () {
            if(this._currSelected === NORMAL_ARENA)
            {
                //this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA);
                mc.view_utility.confirmFunction(mc.const.FUNCTION_ARENA, function () {
                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA);
                }.bind(this));
            }
            else
            {
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_RELIC_ARENA);
            }
        }.bind(this));


        //imgRankTouch.registerTouchEvent(function () {
        //    self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA_REWARDS);
        //});

    },



    getLayerId: function () {
        return mc.MainScreen.LAYER_SELECT_ARENA;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});