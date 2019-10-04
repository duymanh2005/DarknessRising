/**
 * Created by long.nguyen on 10/19/2018.
 */
mc.SecretRewardsDialog = bb.Dialog.extend({

    ctor:function(arrReward){
        this._super();

        var blackPanel = new ccui.Layout();
        blackPanel.width = cc.winSize.width;
        blackPanel.height = cc.winSize.height;
        blackPanel.opacity = bb.framework.getTrueOpacity(120);
        blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        blackPanel.setBackGroundColor(cc.color.BLACK);
        this.addChild(blackPanel);

        var nodePos = new ccui.Layout();
        nodePos.x = cc.winSize.width*0.5;
        nodePos.y = mc.const.DEFAULT_HEIGHT*0.35;
        this.addChild(nodePos);

        this.setEnableClickOutSize(false);

        mc.createBigTreasureBox(arrReward,nodePos,this,function(){
            this.runAction(cc.sequence([cc.delayTime(1.5),cc.callFunc(function(){
                this.setEnableClickOutSize(true);
            }.bind(this))]));
        }.bind(this));
    },

    overrideShowAnimation:function(){
        return 0.1;
    },

    overrideCloseAnimation:function(){
        return 0.1;
    }

});