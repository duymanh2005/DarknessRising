/**
 * Created by long.nguyen on 5/29/2017.
 */
mc.BattleProgressBar = cc.Node.extend({
    _currProgressValue:0,
    _maxProgressValue:0,

    ctor:function(type){
        this._super();

        var folder = "bar/";
        var barChangeRate = cc.p(1.0,0.0);
        var midPoint = cc.p(0.0,1.0);
        var brk = new cc.Sprite("#"+ folder + "Small_Frame.png");
        var urlProgress = folder + "Small_HP.png";
        var urlForeGroundProgress = null;
        var scaleText = 0.5;
        switch (type){
            case mc.BattleProgressBar.TYPE_MP:
                urlProgress = folder+"Small_MP.png";
                break;
            case mc.BattleProgressBar.TYPE_CREATURE_HP:
                urlForeGroundProgress = folder+"Monster_HP_small.png";
                urlProgress = folder+"Monster_HP_small_light.png";
                brk.setSpriteFrame("bar/Monster_HP_Frame_small.png");
                break;
            case mc.BattleProgressBar.TYPE_CREATURE_MP:
                urlProgress = folder+"Monster_MN_small.png";
                brk.setSpriteFrame("bar/Monster_MN_Frame_small.png");
                break;
            case mc.BattleProgressBar.TYPE_EXP:
                urlProgress = folder+"Small_EXP_gauge.png";
                break;
            case mc.BattleProgressBar.TYPE_PLAYER_EXP:
                urlProgress = folder+"exp_gauge_inside.png";
                brk.setSpriteFrame("bar/exp_gauge outside.png");
                break;
            case mc.BattleProgressBar.TYPE_CIRCLE_COMBO:
                urlProgress = folder + "Combo_Skill.png";
                brk.setSpriteFrame("bar/Combo_Trasparent_Circle.png");
                barChangeRate = cc.p(0.0,1.0);
                midPoint = cc.p(0.0,0.0);
                break;
            case mc.BattleProgressBar.TYPE_LARGE_HP:
                urlForeGroundProgress = folder+"Monster_HP.png";
                urlProgress = folder+"Monster_HP_light.png";
                brk.setSpriteFrame("bar/Monster_HP_Frame.png");
                scaleText = 1.0;
                break;
        };
        var progress = new cc.ProgressTimer(new cc.Sprite("#"+urlProgress));
        progress.setCascadeOpacityEnabled(true);
        progress.barChangeRate = barChangeRate;
        progress.midPoint = midPoint;
        progress.type = cc.ProgressTimer.TYPE_BAR;
        progress.setName("progress");

        var foreGroundProgress = null;
        if( urlForeGroundProgress ){
            var foreGroundProgress = new cc.ProgressTimer(new cc.Sprite("#"+urlForeGroundProgress));
            foreGroundProgress.setCascadeOpacityEnabled(true);
            foreGroundProgress.barChangeRate = barChangeRate;
            foreGroundProgress.midPoint = midPoint;
            foreGroundProgress.type = cc.ProgressTimer.TYPE_BAR;
            foreGroundProgress.setName("foregroundProgress");
        }
        var lblInfo = new ccui.TextBMFont("",res.font_cam_outer_32_export_fnt);
        lblInfo.setName("lblInfo");
        var lblProgress = new ccui.TextBMFont("",res.font_cam_outer_32_export_fnt);
        lblProgress.scale = scaleText;
        lblProgress.setName("lblProgress");

        this.addChild(progress);
        if( foreGroundProgress ){
            this.addChild(foreGroundProgress);
        }
        this.addChild(brk);
        this.addChild(lblProgress);
        this.addChild(lblInfo);

        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = brk.width;
        this.height = brk.height;

        lblProgress.x = this.width*0.5;
        lblProgress.y = this.height*0.75;
        lblInfo.x = this.width*0.5;
        lblInfo.y = this.height + lblInfo.height;
        brk.x = this.width*0.5;
        brk.y = this.height*0.5;
        progress.x = this.width*0.5;
        progress.y = this.height*0.5;
        if( foreGroundProgress ){
            foreGroundProgress.x = this.width*0.5;
            foreGroundProgress.y = this.height*0.5;
        }

        this.setColorForChilds = function(color){
            brk.setColor(color);
            progress.setColor(color);
            lblProgress.setColor(color);
            foreGroundProgress && foreGroundProgress.setColor(color);
        }.bind(this);
        this.setCascadeOpacityEnabled(true);
    },

    addElementDecorator:function(heroInfo,level){
        var elementView = mc.view_utility.createHeroCrystalView(heroInfo);
        elementView.y += 3;
        this.addChild(elementView);

        var lblLevel = bb.framework.getGUIFactory().createText(""+level);
        lblLevel.anchorX = 1.0;
        lblLevel.x -= 10;
        lblLevel.y += 10;
        this.addChild(lblLevel);
    },

    fadeIn:function(dur){
        var childs = this.getChildren();
        for(var c = 0; c < childs.length; c++ ){
            var child = childs[c];
            child.setOpacity(0);
            child.runAction(cc.sequence([cc.fadeIn(dur),cc.callFunc(function(){
                this.setVisible(true);
            }.bind(this))]));
        }

    },

    fadeOut:function(dur){
        var childs = this.getChildren();
        for(var c = 0; c < childs.length; c++ ){
            var child = childs[c];
            if( dur > 0 ){
                child.setOpacity(255);
                child.runAction(cc.sequence([cc.fadeIn(dur),cc.callFunc(function(){
                    this.setVisible(false);
                }.bind(this))]));
            }
            else{
                child.opacity = 0;
            }
        }

    },

    setClickAble: function (isClickAble, func,data) {
        var layout = this.getChildByName("__clickable_widget__");
        layout && layout.removeFromParent();
        var self = this;
        if (isClickAble) {
            layout = new ccui.Layout();
            layout.width = this.width;
            layout.height = this.height;
            layout.setName("__clickable_widget__");
            layout.registerTouchEvent(function(){
                func(self,data);
            })
            this.addChild(layout);
        }
        else{
            layout = null;
        }
        return layout;
    },

    setShowValueLabel:function(isShow){
        this.getChildByName("lblProgress").setVisible(isShow);
    },

    addCreatureDecorator:function(creature){
        this.setUserData(creature);
        var name = creature.getName();
        if( !name ){
            var dict = mc.dictionary.getCreatureDictByIndex(creature.getResourceId());
            if( dict ){
                name = dict.name;
            }
        }
        var icon = mc.view_utility.createHeroCrystalView({index:creature.getResourceId()});
        icon.scale = 1.35;
        var lblName = bb.framework.getGUIFactory().createText(name);
        lblName.anchorX = 0;

        icon.x = this.width*0.1;
        icon.y = 65;

        lblName.x = this.width*0.175;
        lblName.y = 68;

        this.addChild(icon);
        this.addChild(lblName);
    },

    getLabelProgress:function(){
        return this.getChildByName("lblProgress");
    },

    setCurrentProgressValue:function(value,maxValue,callback){
        this._currProgressValue = Math.round(value < 0 ? 0 : value) ;
        this._maxProgressValue = Math.round(maxValue || this._maxProgressValue);
        var foregroundProgressView = this.getChildByName("foregroundProgress");
        var currProgress = this.getChildByName("progress").getPercentage();
        var newProgress = (this._currProgressValue/this._maxProgressValue) * 100;
        newProgress < 0 && (newProgress = 0);
        var duration = Math.abs(newProgress - currProgress)*0.01;
        if( callback ){
            if( cc.isFunction(callback) ){
                if( duration > 0.0 ){
                    this.getChildByName("progress").runAction(cc.sequence([
                        cc.delayTime(foregroundProgressView ? 0.35 : 0.01),
                        cc.progressTo(duration,newProgress),
                        cc.callFunc(callback)]));
                }
                else{
                    this.getChildByName("progress").setPercentage(newProgress);
                    callback();
                }
            }
            else{
                this.getChildByName("progress").stopAllActions();
                this.getChildByName("progress").runAction(cc.sequence([
                    cc.delayTime(foregroundProgressView ? 0.35 : 0.01),
                    cc.progressTo(duration,newProgress)]));
            }
        }
        else{
            this.getChildByName("progress").setPercentage(newProgress);
        }
        this.getLabelProgress().setString(this._currProgressValue + "/" + this._maxProgressValue);

        if( foregroundProgressView ){
            foregroundProgressView.setPercentage(newProgress);
        }
        return duration;
    }

});

mc.BattleProgressBar.TYPE_HP = "TYPE_HP";
mc.BattleProgressBar.TYPE_CREATURE_HP = "TYPE_CREATURE_HP";
mc.BattleProgressBar.TYPE_CREATURE_MP = "TYPE_CREATURE_MP";
mc.BattleProgressBar.TYPE_PLAYER_EXP = "PLAYER_EXP";
mc.BattleProgressBar.TYPE_MP = "TYPE_MP";
mc.BattleProgressBar.TYPE_EXP = "TYPE_EXP";
mc.BattleProgressBar.TYPE_LARGE_HP = "TYPE_LARGE_HP";
mc.BattleProgressBar.TYPE_CIRCLE_COMBO = "TYPE_CIRCLE_COMBO";