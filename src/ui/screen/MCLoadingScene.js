/**
 * Created by long.nguyen on 5/8/2017.
 */
mc.LoadingScene = bb.DefaultLoadingScene.extend({

    ctor:function(){
        this._super(null,[
            res.particle_fairy_dust_plist,
            res.spine_ui_loading_fairy_json,
            res.spine_ui_loading_fairy_atlas,
            res.spine_ui_loading_fairy_png]);
    },

    initLoadingGUI : function(){
        var layer = new cc.Layer();

        bb.framework.getGUIFactory().createLoadingAnimation(layer);

        return layer;
    }

});

mc.LoadingFairyLayer = cc.LayerColor.extend({

    ctor:function(cb,preloadURL){
        this._super(cc.color.BLACK);
        bb.framework.getGUIFactory().createLoadingAnimation(this);
    }

});