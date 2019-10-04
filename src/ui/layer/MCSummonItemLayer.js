/**
 * Created by long.nguyen on 4/13/2018.
 */
mc.SummonItemLayer = mc.MainBaseLayer.extend({

    ctor:function(parseNode){
        this._super();

        bb.sound.preloadEffect(res.sound_ui_summon_reward_3star);
        bb.sound.preloadEffect(res.sound_ui_summon_reward_4star);
        bb.sound.preloadEffect(res.sound_ui_summon_reward_5star);

        var root = this.parseCCStudio(parseNode || res.layer_Summon_item);
        var rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var self = this;
        var imgBrk = rootMap["imgBrk"];
        var lblSummon10 = rootMap["lblSummon10"];
        var lblSummon1 = rootMap["lblSummon1"];
        var nodeChest1 = rootMap["nodeChest1"];
        var nodeChest10 = rootMap["nodeChest10"];
        var nodeAsset10 = rootMap["nodeAsset10"];
        var nodeAsset1 = rootMap["nodeAsset1"];

        lblSummon1.setString(mc.dictionary.getGUIString("lblX1"));
        lblSummon1.setString(mc.dictionary.getGUIString("lblX1"));
        lblSummon10.setString(mc.dictionary.getGUIString("lblX10"));
        lblSummon10.setString(mc.dictionary.getGUIString("lblX1"));

        nodeAsset1.addChild(mc.view_utility.createAssetView(mc.ItemStock.createJsonItemZen(1000)));
        nodeAsset10.addChild(mc.view_utility.createAssetView(mc.ItemStock.createJsonItemZen(10000)));

        var spineChest1 = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json,res.spine_ui_chest_atlas, 1.0);
        spineChest1.setSkin("chest_bronze_blue");
        spineChest1.setAnimation(0,"idle",true,bb.utility.randomInt(0,10)*0.1);
        var spineChest10 = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json,res.spine_ui_chest_atlas, 1.0);
        spineChest10.setSkin("chest_platinum");
        spineChest10.setAnimation(0,"idle",true,bb.utility.randomInt(0,10)*0.1);

        nodeChest1.addChild(spineChest1);
        nodeChest10.addChild(spineChest10);

        this._registerTouchTreasureBox(spineChest1);
        this._registerTouchTreasureBox(spineChest10);
    },

    _registerTouchTreasureBox:function(treasureBox){
        var clickLayout = treasureBox.getChildByName("__click__box__");
        if( !clickLayout ){
            clickLayout = new ccui.Layout();
            //clickLayout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            clickLayout.setName("__click__box__");
            clickLayout.width = 125;
            clickLayout.height = 125;
            clickLayout.x = clickLayout.width*-0.5;
            treasureBox.addChild(clickLayout);
        }
        clickLayout.setEnabled(true);
        clickLayout.setUserData(treasureBox.getUserData());
        clickLayout.registerTouchEvent(function(widget){

        }.bind(this));
        clickLayout.setSwallowTouches(false);
    },

    onTriggerTutorial:function(){
    },

    getLayerId:function(){
        return mc.MainScreen.LAYER_SUMMON_ITEM;
    },

    isShowHeader:function(){
        return true;
    },

    isShowFooter:function(){
        return true;
    },

    isShowTip:function(){
        return false;
    }

});