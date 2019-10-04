/**
 * Created by long.nguyen on 4/18/2018.
 */
mc.AccountLevelUpDialog = bb.Dialog.extend({

    ctor:function(lvlUpInfo){
        this._super();

        bb.sound.preloadEffect(res.sound_ui_lvlup_account);

        var node = ccs.load(res.widget_account_level_up_dialog, "res/").node;
        this.addChild(node);

        var mapView = bb.utility.arrayToMap(node.getChildByName("root").getChildren(),function(child){
            return child.getName();
        });

        var lblCurrStamina = mapView["lblCurrStamina"];
        var lblNextStamina = mapView["lblNextStamina"];
        var lblMaxStamina = mapView["lblMaxStamina"];
        var lblReward = mapView["lblReward"];
        var btnOk = mapView["btnOk"];
        var nodeItem = mapView["nodeItem"];
        var nodeSpine = mapView["nodeSpine"];
        lblReward.setString(mc.dictionary.getGUIString("lblRewards"));

        var spineAccLvlUp = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_account_lvl_up_json,res.spine_ui_account_lvl_up_atlas,1.0);
        spineAccLvlUp.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 0 ) {
                spineAccLvlUp.setAnimation(1,"accountlevelup_idle",true);
            }
        }.bind(this));
        spineAccLvlUp.setSkin("lv"+(lvlUpInfo ? lvlUpInfo.level : 1) );
        spineAccLvlUp.setAnimation(0,"accountlevelup_appear",false);
        nodeSpine.addChild(spineAccLvlUp);

        lblMaxStamina.setString(mc.dictionary.getGUIString("lblMaxStamina"));

        lblCurrStamina.setString(lvlUpInfo ? lvlUpInfo.oldMaxStamina : 0);
        lblNextStamina.setString(lvlUpInfo ? lvlUpInfo.maxStamina : 1);
        btnOk.setString(mc.dictionary.getGUIString("lblOk"));
        lblNextStamina.setColor(mc.color.GREEN_NORMAL);

        if( lvlUpInfo["reward"] && lvlUpInfo["reward"]["items"] ){
            var arrReward = lvlUpInfo["reward"]["items"];
            arrReward = mc.ItemStock.groupItem(arrReward);
            var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length,function(index){
                var itemView = new mc.ItemView(arrReward[index]);
                itemView.scale = 0.8;
                if( mc.ItemStock.getItemIndex(arrReward[index]) === mc.const.ITEM_INDEX_STAMINA ){
                    itemView.getQuantityLabel().setVisible(true);
                    itemView.getQuantityLabel().setString(mc.dictionary.getGUIString("lblFull"));
                    itemView.getQuantityLabel().setColor(mc.color.GREEN_NORMAL);
                }
                itemView.opacity = 0;
                itemView.runAction(cc.sequence([cc.delayTime(index*0.2),cc.fadeIn(0.2)]));
                return itemView;
            }),15);
            var wrapRewardView = mc.view_utility.wrapWidget(layoutReward,600,false,{top:22,bottom:22});
            nodeItem.addChild(wrapRewardView);
        }

        btnOk.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        this.setTopMost(true);
    },

    overrideShowAnimation: function () {
        this.opacity = 0;
        this.runAction(cc.sequence([cc.fadeIn(0.3),cc.sound(res.sound_ui_lvlup_account)]));
        return 0.3;
    },

    overrideCloseAnimation: function () {
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    }

});