/**
 * Created by long.nguyen on 5/12/2017.
 */
mc.BattleHeroAvatarView = ccui.Widget.extend({
    _isGlow:false,
    _enableBar:null,

    _createElementFrame:function(element){
        var url = null;
        element = element.toLowerCase();
        if( element === mc.const.ELEMENT_FIRE ){
            url = "res/gui/battle/Fire_Element_Chara_Frame.png";
        }
        else if( element === mc.const.ELEMENT_WATER ){
            url = "res/gui/battle/Water_Element_Chara_Frame.png";
        }
        else if( element === mc.const.ELEMENT_LIGHT ){
            url = "res/gui/battle/Light_Element_Chara_Frame.png";
        }
        else if( element === mc.const.ELEMENT_EARTH ){
            url = "res/gui/battle/Earth_Element_Chara_Frame.png";
        }
        else if( element === mc.const.ELEMENT_DARK ){
            url = "res/gui/battle/Dark_Element_Chara_Frame.png";
        }
        return new ccui.ImageView(url,ccui.Widget.LOCAL_TEXTURE);
    },

    ctor:function(creature,selectAvatarFunc){
        this._super();
        this.setUserData(creature);
        var assetData = mc.dictionary.getCreatureAssetByIndex(creature.getResourceId());
        var brk = this._brk = this._createElementFrame(creature.getElement());
        var classGroup = mc.HeroStock.getHeroBattleRole({index:creature.getResourceId()}).toLowerCase();
        var sprClass = new cc.Sprite("#icon/hero/ico_"+classGroup+".png");
        sprClass.scale = 1.5;
        var img = this._img = new ccui.ImageView(assetData.getAvatarURL(),ccui.Widget.LOCAL_TEXTURE);
        this.addChild(brk);
        this.addChild(img);
        this.addChild(sprClass);

        var root = this;
        root.width = brk.width;
        root.height = brk.height;
        root.anchorX = 0.5;
        root.anchorY = 0.5;

        brk.x = root.width*0.5;
        brk.y = root.height*0.5;
        sprClass.x = root.width*0.18;
        sprClass.y = root.height*0.92;
        img.x = root.width*0.5;
        img.y = root.height*0.5;
        var hpProgress = this.hpProgress = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_HP);
        var mpProgress = this.mpProgress = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_MP);
        this._initGlowNode();

        mpProgress.getChildByName("lblProgress").setVisible(false);

        var progressX = root.width*0.5;
        hpProgress.x = progressX;
        hpProgress.y = root.height*0.15;
        mpProgress.x = progressX;
        mpProgress.y = root.height*0.07;

        hpProgress.setCurrentProgressValue(creature.getHP(),creature.getTotalMaxHp());
        mpProgress.setCurrentProgressValue(creature.getMp(),creature.getTotalMaxMp());

        root.addChild(hpProgress);
        root.addChild(mpProgress);

        var currHp = creature.getHP();
        var currMp = creature.getMp();
        var currMaxHp = creature.getTotalMaxHp();
        var currMaxMp = creature.getTotalMaxMp();
        var self = this;
        this.changePercentHp = function(newHp){
            if( newHp ){
                hpProgress.setCurrentProgressValue(newHp,creature.getTotalMaxHp(),true);
                currHp = newHp;
                if( creature.isDead() ){
                    this.setEnableBar(false);
                    self.runAction(cc.sequence([cc.delayTime(1.0),cc.callFunc(function(){
                        self.markDead();
                    })]));
                }
            }
            else {
                var hp = creature.getHP();
                var maxHp = creature.getTotalMaxHp();
                if( currHp != hp || currMaxHp != maxHp ){
                    hpProgress.setCurrentProgressValue(hp,maxHp,true);
                    currHp = hp;
                    currMaxHp = maxHp;
                    if( creature.isDead() ){
                        self.runAction(cc.sequence([cc.delayTime(1.0),cc.callFunc(function(){
                            self.markDead();
                        })]));
                    }
                }
            }
        };
        this.changePercentMp = function(){
            var mp = creature.getMp();
            var maxMp = creature.getTotalMaxMp();
            if( currMp != mp || currMaxMp != maxMp ){
                mpProgress.setCurrentProgressValue(mp,maxMp,function(){
                    self.setGlow(creature.isFullMp());
                });
                currMp = mp;
                currMaxMp = maxMp;
                if( !creature.isFullMp() ){
                    self.setGlow(false);
                }
            }
        };
        this.setEnableBar = function(isEnable){
            if( this._enableBar != isEnable ){
                this._enableBar = isEnable;
                var isDead = this.getUserData().isDead();
                this.setEnabled(this._enableBar && this._isGlow &&!isDead);
                if(  isEnable && !isDead){
                    brk.setColor(mc.color.WHITE_NORMAL);
                    img.setColor(mc.color.WHITE_NORMAL);
                    sprClass.setColor(mc.color.WHITE_NORMAL);
                    hpProgress.setColorForChilds(mc.color.WHITE_NORMAL);
                    mpProgress.setColorForChilds(mc.color.WHITE_NORMAL);
                }
                else{
                    brk.setColor(mc.color.BLACK_DISABLE_SOFT);
                    img.setColor(mc.color.BLACK_DISABLE_SOFT);
                    sprClass.setColor(mc.color.BLACK_DISABLE_SOFT);
                    hpProgress.setColorForChilds(mc.color.BLACK_DISABLE_SOFT);
                    mpProgress.setColorForChilds(mc.color.BLACK_DISABLE_SOFT);
                }
            }
        }

        this._canClick = true;
        selectAvatarFunc && root.registerTouchEvent(function(){
            if( this._canClick && this.getUserData().isEnableInput() ){
                this._canClick = false;
                selectAvatarFunc && selectAvatarFunc(this,creature);
                this.runAction(cc.sequence([cc.delayTime(1.0),cc.callFunc(function(){
                    this._canClick = true;
                }.bind(this))]));
            }
        }.bind(this));

        this.width = root.width;
        this.height = root.height;
        if( creature.isDead() ){
            this.markDead();
        }
        else{
            this.setEnableBar(true);
            if( creature.isFullMp() ){
                this.setGlow(true);
            }
        }

    },

    _initGlowNode:function(){
        var glowNode = new cc.Node();
        glowNode.anchorX = 0.5;
        glowNode.anchorY = 0.5;
        glowNode.width = this._brk.width;
        glowNode.height = this._brk.height;
        glowNode.x = this._brk.x + this._brk.width*0.5;
        glowNode.y = this._brk.y + this._brk.height*0.5;
        glowNode.setName("glow");
        this.addChild(glowNode);

        var spineEff = sp.SkeletonAnimation.createWithJsonFile(res.res_spine_battle_effect_fullmana_battlepanel_json,res.res_spine_battle_effect_fullmana_battlepanel_atlas,1.0);
        spineEff.setAnimation(0,"fullmana_battlepanel",true);
        glowNode.addChild(spineEff);

        //var color = mc.color.ELEMENTS[this.getUserData().getElement().toLowerCase()];
        //var glowView = new cc.Sprite("res/gui/battle/Chara_Frame_Glow.png");
        //glowView.runAction(cc.sequence(cc.fadeTo(0.3,150),cc.fadeTo(0.3,255)).repeatForever());
        //glowView.setColor(color);
        //glowNode.addChild(glowView);
        //
        //var particleLight1 = new cc.ParticleSystem(res.particle_castskill_Eff_Lightning_SparkA_plist);
        //var particleLight2 = new cc.ParticleSystem(res.particle_castskill_Eff_Lightning_SparkB_plist);
        //var particleLight3 = new cc.ParticleSystem(res.particle_castskill_Eff_Lightning_SparkC_plist);
        //var particleLight4 = new cc.ParticleSystem(res.particle_castskill_Eff_Lightning_SparkD_plist);
        //var particleLight5 = new cc.ParticleSystem(res.particle_castskill_Eff_Lightning_SparkE_plist);
        //particleLight1.setStartColor(color);
        //particleLight1.setEndColor(cc.color.BLACK);
        //particleLight2.setStartColor(color);
        //particleLight2.setEndColor(cc.color.BLACK);
        //particleLight3.setStartColor(color);
        //particleLight3.setEndColor(cc.color.BLACK);
        //particleLight4.setStartColor(color);
        //particleLight4.setEndColor(cc.color.BLACK);
        //particleLight5.setStartColor(color);
        //particleLight5.setEndColor(cc.color.BLACK);
        //var w = this._brk.width*0.5;
        //var h = this._brk.height*0.5;
        //particleLight1.x = particleLight1.y = 0;
        //particleLight2.x = particleLight2.y = 0;
        //particleLight3.x = particleLight3.y = 0;
        //particleLight4.x = particleLight4.y = 0;
        //particleLight5.x = particleLight5.y = 0;
        //glowNode.addChild(particleLight1);
        //glowNode.addChild(particleLight2);
        //glowNode.addChild(particleLight3);
        //glowNode.addChild(particleLight4);
        //glowNode.addChild(particleLight5);
        glowNode.setVisible(false);
    },

    setOutline:function(isOutline){
        this._brk.setOutline(isOutline);
    },

    setGlow:function(isGlow){
        this._isGlow = isGlow;
        var glowNode = this.getChildByName("glow");
        glowNode.setVisible(isGlow);
        this.setEnabled(this._enableBar && this._isGlow);
    },

    markReviving:function(){
        this.runAction(cc.sequence([cc.delayTime(0.5),cc.callFunc(function(){
            var sprTxtDead = this.getChildByName("sprTxtDead");
            sprTxtDead && sprTxtDead.removeFromParent(true);
            var cr = this.getUserData();
            this.setEnableBar(!cr.getBattleField().isAuto());
        }.bind(this))]));
    },

    markDead:function(){
        this.setEnableBar(false);
        var sprTxtDead = this.getChildByName("sprTxtDead");
        if( !sprTxtDead ){
            sprTxtDead = new cc.Sprite("#text/text_dead.png");
            sprTxtDead.setName("sprTxtDead");
            sprTxtDead.x = this._brk.width*0.5;
            sprTxtDead.y = this._brk.height*0.5;
            this.addChild(sprTxtDead);
        }
        this.setGlow(false);
    },

    getHpProgress:function(){
        return this.hpProgress;
    },

    getMpProgress:function(){
        return this.mpProgress;
    }

});
