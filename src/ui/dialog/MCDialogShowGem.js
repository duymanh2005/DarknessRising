/**
 * Created by long.nguyen on 7/10/2017.
 */
mc.DialogShowGem = bb.Dialog.extend({

    ctor:function(){
        this._super();

        var heroSummonInfo = mc.GameData.summonManager.getHeroSummonWithMaxRank();
        var summonURL = mc.view_utility.getSummonResourceFromHeroInfo(heroSummonInfo);
        var imgGem = new ccui.ImageView(summonURL.gemURL,ccui.Widget.LOCAL_TEXTURE);
        var particle1 = new cc.ParticleSystem(res.particle_star1);
        var particle2 = new cc.ParticleSystem(res.particle_star2);

        imgGem.x = cc.winSize.width*0.5;
        imgGem.y = cc.winSize.height*0.55;
        particle1.x = imgGem.x;
        particle1.y = imgGem.y;
        particle2.x = imgGem.x;
        particle2.y = imgGem.y;

        var glory = mc.view_utility.createGlory(summonURL.gloryCode);
        glory.x = imgGem.x;
        glory.y = imgGem.y;
        this.addChild(glory);
        this.addChild(imgGem);
        this.addChild(particle1);
        this.addChild(particle2);

        imgGem.scale = 0;
        var self = this;
        imgGem.runAction(cc.sequence([cc.scaleTo(0.25,1.0),cc.callFunc(function(){
            imgGem.registerTouchEvent(function(){
                imgGem.setEnabled(false);
                imgGem.runAction(cc.sequence([cc.shake(1.66),cc.callFunc(function(){

                }.bind(this)),cc.moveTo(0.25,imgGem.x,cc.winSize.height*1.5)]));
                var layerColor = new cc.LayerColor(cc.color.WHITE);
                cc.director.getRunningScene().addChild(layerColor);
                layerColor.opacity = 0;
                layerColor.runAction(cc.sequence([cc.fadeIn(1.5),cc.callFunc(function(){
                    new mc.HeroSummonScreen().show(new cc.LayerColor(cc.color.WHITE));
                }),cc.removeSelf()]));

            });
        }.bind(this))]));

        var particle = new cc.ParticleSystem(res.particle_summon_center_explosion_plist);
        particle.x = imgGem.x;
        particle.y = imgGem.y;
        this.addChild(particle);

        this.setEnableClickOutSize(false);
    },

    _createLayerHero:function(){

    },

    overrideShowAnimation:function(){
        return 0.25;
    }

});