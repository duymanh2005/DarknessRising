/**
 * Created by long.nguyen on 1/15/2018.
 */
mc.DialogBattleStart = bb.Dialog.extend({

    ctor: function (battleRoundInterface, onCompleteCallback) {
        this._super();

        this._onCompleteCallback = onCompleteCallback;

        if( battleRoundInterface.isAMonsterBossRound() ){
            bb.sound.playEffect(res.sound_ui_battle_bossarlet);
            var spineBossWarning = this._spineBossWarning = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_boss_warning_json,res.spine_ui_boss_warning_atlas,1.0);
            spineBossWarning.setCompleteListener(function (trackEntry) {
                if (trackEntry.trackIndex === 0 ) {
                    this.close();
                }
            }.bind(this));
            spineBossWarning.x = cc.winSize.width*0.5;
            spineBossWarning.y = cc.winSize.height*0.8 - 518*0.5;
            this.addChild(spineBossWarning);
        }
        else{
            bb.sound.playEffect(res.sound_ui_battle_start_round);
            cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
            cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);
            cc.spriteFrameCache.addSpriteFrames(res.text_plist);

            var imgBattle = new cc.Sprite("#text/Battle.png");
            var imgEffect = new cc.Sprite("res/effect/Battle_effect.png");
            var round = (battleRoundInterface.getCurrentRoundIndex() + 1);
            var numRound = battleRoundInterface.getNumberOfRound();
            var missionLabel = this._missionLabel = new bb.BitmapLabel(round + '/' + numRound, "text/large_number", -40);
            var c1 = missionLabel.getChildByIndex(0);
            var c4 = missionLabel.getChildByIndex(2);
            var c5 = missionLabel.getChildByIndex(3);
            var splash = missionLabel.getChildByIndex(1);
            c4.scale = 0.75;
            c5 && (c5.scale = 0.75);
            c4.y -= 12;
            c5 && (c5.y -= 12);
            splash.y -= 12;
            c1.setVisible(false);
            var hor = this._hor = bb.layout.linear([imgBattle, missionLabel], 0, bb.layout.LINEAR_HORIZONTAL);

            var yLayout = cc.winSize.height * 0.8;

            imgEffect.x = cc.winSize.width * 0.5;
            imgEffect.y = yLayout - imgEffect.height * 0.5;
            yLayout -= imgEffect.height;

            hor.x = cc.winSize.width * 0.5; // after animation
            hor.y = imgEffect.y + 30;
            var pos = c1.getParent().convertToWorldSpace(c1);
            var fakeChar1 = this._fakeChar1 = new cc.Sprite("#text/large_number/" + round + ".png");
            fakeChar1.setPosition(pos);
            fakeChar1.setVisible(false);

            hor.x = cc.winSize.width * 1.5;// before animation
            hor.y = imgEffect.y + 30;

            this.addChild(imgEffect);
            this.addChild(hor);
            this.addChild(fakeChar1);

            this._hor.opacity = 0;
            this._missionLabel.setOpacityForAll(0);
        }

        this.width = cc.winSize.width;
        this.height = cc.winSize.height;
        this.anchorX = 0.5;
        this.anchorY = 1.0;
        this.x = cc.winSize.width * 0.5;
        this.y = cc.winSize.height;
        this.setEnableClickOutSize(false);
    },

    onExit: function () {
        this._super();
        this._battleView.getBattleField().removeBattleListenerByKey(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,this._pauseKey);
        this._battleView.getBattleField().removeBattleListenerByKey(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_RESUME,this._resumeKey);
        this._onCompleteCallback && this._onCompleteCallback();

    },

    overrideShowAnimation: function () {
        return 0.1;
    },

    overrideCloseAnimation: function () {
        return 0.1;
    },

    setBattleView:function(battleView){
        this._battleView = battleView;
        this._pauseKey = battleView.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,this.pauseAnimation.bind(this));
        this._resumeKey = battleView.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_RESUME,this.resumeAnimation.bind(this));
        return this;
    },

    pauseAnimation:function(){
        this.pause();
        var childs = this.getChildren();
        for(var i = 0; i < childs.length; i++ ){
            childs[i].pause();
        }
    },

    resumeAnimation:function(){
        this.resume();
        var childs = this.getChildren();
        for(var i = 0; i < childs.length; i++ ){
            childs[i].resume();
        }
    },

    startAnimation: function () {
        if( this._spineBossWarning ){
            this._spineBossWarning.setAnimation(0,"BossWarning",true);
        }
        else{
            var fakeChar1 = this._fakeChar1;
            fakeChar1.setVisible(true);
            fakeChar1.scale = 2.0;
            fakeChar1.runAction(cc.sequence([cc.scaleTo(0.5, 1.0), cc.delayTime(1), cc.callFunc(function () {
                fakeChar1.runAction(cc.spawn([cc.scaleTo(0.5, 2.0), cc.fadeOut(0.5)]));
                this.fadeAll(0.5);
                this._hor.fadeAll(0.5);
                this._missionLabel.fadeAll(0.5);
                this.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(function () {
                    this.close();
                }.bind(this))]));
            }.bind(this))]));
            this.fadeAll(0.5, true);
            this._hor.fadeAll(0.5, true);
            this._missionLabel.fadeAll(0.5, true);
            this._hor.runAction(cc.sequence([cc.moveTo(0.3, cc.p(cc.winSize.width * 0.5, this._hor.y)), cc.callFunc(function () {
            }.bind(this))]));
        }
        return this;
    }

});