/**
 * Created by long.nguyen on 5/19/2017.
 */
mc.LoadingDialog = bb.Dialog.extend({

    ctor:function(dataInit,blackOpacity){
        this._super();

        this.initGUI(dataInit);

        var layout = new ccui.Layout();
        layout.setCascadeColorEnabled(true);
        layout.opacity = 0;
        var opacity = blackOpacity ? blackOpacity : 128;
        layout.runAction(cc.sequence([cc.delayTime(1.0),cc.fadeTo(0.3,opacity)]));
        layout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        layout.setBackGroundColor(cc.color.BLACK);
        layout.setLocalZOrder(9999);
        layout.setName("__loading__layer__");
        layout.width = cc.winSize.width;
        layout.height = cc.winSize.height;
        layout.setTouchEnabled(true);
        this.addChild(layout);

        bb.framework.getGUIFactory().createLoadingAnimation(this);

        this.enableTimeOut();
        this.setAutoClose(false);

        this.onLoading(dataInit);
        this.setShowUnderLayer(false);
    },

    addText : function(text){
        var lblStr = bb.framework.getGUIFactory().createText(text, res.font_UTMBienvenue_none_32_export_fnt);
        lblStr.anchorX = 0;
        lblStr.anchorY = 0.5;
        var w = lblStr.width;
        if(this._spine)
        {
            this._spine.x -= w*0.5;
        }
        if(this._particle)
        {
            this._particle.x -= w*0.5;
        }
        lblStr.x = this._spine.x + this._spine.width;
        lblStr.y = this._spine.y + 15;
        this.addChild(lblStr);
        lblStr.setLocalZOrder(this._spine.getLocalZOrder());

    },

    initGUI:function(dataInit){
    },

    onLoading:function(dataInit){
    },

    onLoadDone:function(data){
    },

    performDone:function(data){
        var self = this;
        this.stopActionByTag(mc.LoadingDialog.ACTION_TIMEOUT_TAG);
        self.setAutoClose(true);
        var loadingLayer = self.getChildByName("__loading__layer__");
        loadingLayer.removeFromParent();
        self.onLoadDone(data);
    },

    enableTimeOut:function(timeOut,callback){
        this.stopActionByTag(mc.LoadingDialog.ACTION_TIMEOUT_TAG);
        var actionTimeOut = cc.sequence([cc.delayTime(timeOut || mc.const.REQUEST_TIME_OUT),cc.callFunc(function(){
            callback && callback(this);
            if( !this.isAnimating() ){
                this.close();
            }
        }.bind(this))]);
        actionTimeOut.setTag(mc.LoadingDialog.ACTION_TIMEOUT_TAG);
        this.runAction(actionTimeOut);
        return this;
    },

    overrideShowAnimation:function(){
        this.opacity = 0;
        this.runAction(cc.fadeIn(0.05));
        return 0.05;
    },

    overrideCloseAnimation:function(){
        this.runAction(cc.fadeOut(0.05));
        return 0.05;
    }

});
mc.LoadingDialog.ACTION_TIMEOUT_TAG = 17643;