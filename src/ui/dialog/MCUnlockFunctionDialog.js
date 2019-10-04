/**
 * Created by long.nguyen on 4/18/2018.
 */
mc.UnlockFunctionDialog = bb.Dialog.extend({

    ctor:function(unlockCode){
        this._super();

        bb.sound.preloadEffect(res.sound_ui_unlock_function);

        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_6_plist);
        cc.spriteFrameCache.addSpriteFrames(res.bar_plist);

        var mapGUIDataByCode = mc.UnlockFunctionDialog.GUIDATABYCODE;
        var node = ccs.load(res.widget_unlock_function_dialog, "res/").node;
        this.addChild(node);

        var mapView = bb.utility.arrayToMap(node.getChildByName("root").getChildren(),function(child){
            return child.getName();
        });

        var node = mapView["node"];
        var sprUnlock = mapView["sprUnlock"];
        var lblUnlock = mapView["lblUnlock"];
        var btnOk = mapView["btnOk"];

        var glory = mc.view_utility.createGlory("yellow");
        node.addChild(glory);

        sprUnlock.runAction(cc.sequence([cc.delayTime(2.0),cc.shake(0.2,cc.size(10,0))]).repeatForever());
        if( mapGUIDataByCode[unlockCode] ){
            node.addChild(this._createWidget(mapGUIDataByCode[unlockCode]));
        }
        else{
            node.addChild(bb.framework.getGUIFactory().createText(mapGUIDataByCode[unlockCode][1]));
        }

        lblUnlock.setString(mc.dictionary.getGUIString("txtUnlockedNewFunction"));
        btnOk.setString(mc.dictionary.getGUIString("lblOk"));

        btnOk.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        this.setTopMost(true);
    },

    _createWidget:function(guiData){
        var widget = new ccui.Layout();
        widget.setCascadeOpacityEnabled(true);
        widget.anchorX = widget.anchorY = 0.5;
        widget.width = 160;
        widget.height = 180;
        var brk = new cc.Sprite("#bar/Small_Circle.png");
        var icon = new cc.Sprite("#"+guiData[0]+".png");
        var brkTxt = new ccui.ImageView("patch9/pnl_eventname.png",ccui.Widget.PLIST_TEXTURE);
        var lbl = brkTxt.setString(mc.dictionary.getGUIString(guiData[1]),res.font_UTMBienvenue_none_32_export_fnt);
        lbl.scale = 0.65;
        lbl.y += 5;
        lbl.setColor(mc.color.BROWN_SOFT);

        brk.x = icon.x = brkTxt.x = widget.width*0.5;
        brk.y = widget.height*0.52;
        icon.y = widget.height*0.60;
        brkTxt.y = widget.height*0.18;

        widget.addChild(brk);
        widget.addChild(icon);
        widget.addChild(brkTxt);
        return widget;
    },

    overrideShowAnimation: function () {
        this.opacity = 0;
        this.runAction(cc.sequence([cc.fadeIn(0.3),cc.sound(res.sound_ui_unlock_function)]));
        return 0.3;
    },

    overrideCloseAnimation: function () {
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    }

});

mc.UnlockFunctionDialog.GUIDATABYCODE = {};
mc.UnlockFunctionDialog.GUIDATABYCODE[mc.const.FUNCTION_CHAOS_CASTLE] = ["icon/ico_chaos","lblChaosCastle"];
mc.UnlockFunctionDialog.GUIDATABYCODE[mc.const.FUNCTION_ARENA] = ["icon/arena","lblArena"];
mc.UnlockFunctionDialog.GUIDATABYCODE[mc.const.FUNCTION_DAILY_CHALLENGE] = ["icon/ico_event","lblDailyChallenge"];
mc.UnlockFunctionDialog.GUIDATABYCODE[mc.const.FUNCTION_BLOOD_CASTLE] = ["icon/ico_blood","lblBloodCastle"];
mc.UnlockFunctionDialog.GUIDATABYCODE[mc.const.FUNCTION_ILLUSION_TOWER] = ["icon/ico_illusion","lblIllusionTower"];