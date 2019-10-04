/**
 * Created by long.nguyen on 1/4/2018.
 */
mc.StoryTalkingDialog = bb.Dialog.extend({
    _RUN_W:0,

    ctor:function(){
        this._super();

        this._RUN_W = cc.winSize.width*1.85;
        cc.spriteFrameCache.addSpriteFrames(res.button_plist);
        cc.spriteFrameCache.addSpriteFrames(res.text_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_3_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_4_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_5_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_6_plist);

        this.MAP_FULL_NAME_BY_NAME = {
            "DK":mc.HeroStock.getHeroName(mc.dictionary.getCreatureDictByIndex(mc.const.TUTORIAL_CHARACTER_DRAGON)),
            "Elf":mc.HeroStock.getHeroName(mc.dictionary.getCreatureDictByIndex(mc.const.TUTORIAL_CHARACTER_ELF)),
            "DW":mc.HeroStock.getHeroName(mc.dictionary.getCreatureDictByIndex(mc.const.TUTORIAL_CHARACTER_WIZARD)),
            "Kundun": mc.HeroStock.getHeroName(mc.dictionary.getCreatureDictByIndex(mc.const.TUTORIAL_MONSTER_KUNDUN))
        };

        var storyManager = mc.GameData.storyManager;
        var arrTalk = storyManager.getCurrentStoryString();
        this._arrSpineView = [];
        for(var i = 0; i < arrTalk.length; i++ ){
            var strs = arrTalk[i].split(':');
            var names = strs[0].split('_');
            var name = names[0];
            var dir = names[1];
            var spineView = null;
            var scl = 0.25;
            if( name === "DK" ){
                var assetData = mc.dictionary.getCreatureAssetByIndex(mc.const.TUTORIAL_CHARACTER_DRAGON);
                var spineStr = assetData.getSpineString();
                spineView = sp.SkeletonAnimation.createWithJsonFile(spineStr + ".json", spineStr + ".atlas", 1.0);
            }
            else if( name === "Elf" ){
                var assetData = mc.dictionary.getCreatureAssetByIndex(mc.const.TUTORIAL_CHARACTER_ELF);
                var spineStr = assetData.getSpineString();
                spineView = sp.SkeletonAnimation.createWithJsonFile(spineStr + ".json", spineStr + ".atlas", 1.0);
            }
            else if( name === "DW" ){
                var assetData = mc.dictionary.getCreatureAssetByIndex(mc.const.TUTORIAL_CHARACTER_WIZARD);
                var spineStr = assetData.getSpineString();
                spineView = sp.SkeletonAnimation.createWithJsonFile(spineStr + ".json", spineStr + ".atlas", 1.0);
            }
            else if( name === "Kundun" ){
                scl = 0.15;
                var assetData = mc.dictionary.getCreatureAssetByIndex(mc.const.TUTORIAL_MONSTER_KUNDUN);
                var spineStr = assetData.getSpineString();
                spineView = sp.SkeletonAnimation.createWithJsonFile(spineStr + ".json", spineStr + ".atlas", 1.0);
            }
            if( spineView ){
                spineView.scale = scl;
                spineView.scaleX = dir === "L" ? -spineView.scale : spineView.scale;
                spineView.x = dir === "L" ? cc.winSize.width*0.22 : cc.winSize.width*0.78;
                spineView.y = cc.winSize.height*0.15;
                spineView.setAnimation(0,"idle",true);
                spineView.setUserData(name);
                this.addChild(spineView);
                this._arrSpineView.push(spineView);
            }
        }

        var blackPanel = this._blackPanel = new ccui.Layout();
        blackPanel.setBackGroundColor(cc.color.BLACK);
        blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        blackPanel.setBackGroundColorOpacity(128);
        blackPanel.width = cc.winSize.width;
        blackPanel.height = cc.winSize.height;
        blackPanel._touchScale = 0.001;
        blackPanel.registerTouchEvent(function(){
            if( !this._isTalkAnimation ){
                var isEnd = storyManager.nextTalk();
                if( isEnd ){
                    this.close();
                }
                else{
                    this._talkNow();
                }
            }
        }.bind(this));

        var brk = this._brk = new ccui.ImageView("patch9/pnl_Popup.png",ccui.Widget.PLIST_TEXTURE);
        brk.setCascadeOpacityEnabled(true);
        brk.setScale9Enabled(true);
        brk.width = cc.winSize.width - 20;
        brk.height = 200;
        brk.anchorY = 0;
        brk.x = cc.winSize.width*0.5;
        brk.y = 70;
        brk.setLocalZOrder(5);

        var brkName = this._brkName = new ccui.ImageView("patch9/Map_Tittle_Name.png",ccui.Widget.PLIST_TEXTURE);
        brkName.setScale9Enabled(true);
        brkName.width = 250;
        brkName.setScale9Enabled(true);
        brkName.x = brk.width*0.75;
        brkName.y = brk.height-6;
        brkName.setVisible(false);
        brkName._baseWidth = brkName.width;
        brkName._maxLblWidth = brkName.width - 30;

        var btnArrow = this._btnArrow = new ccui.ImageView("button/Left_arrow.png",ccui.Widget.PLIST_TEXTURE);
        btnArrow.rotation = -90;
        btnArrow.x = brk.width*0.9;
        btnArrow.y = 50;
        btnArrow.setVisible(false);

        var lblTalk = this._lblTalk = bb.framework.getGUIFactory().createText("");
        lblTalk.anchorX = 0;
        lblTalk.x = brk.width*0.05;
        lblTalk.y = brk.height*0.55;
        lblTalk.getVirtualRenderer().setBoundingWidth(brk.width);

        var btnSkip = new ccui.ImageView("button/btn_skip.png",ccui.Widget.PLIST_TEXTURE);
        var lblRedeem = btnSkip.setString(mc.dictionary.getGUIString("lblSkip"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblRedeem.x = btnSkip.width * 0.63;
        lblRedeem.setScale(0.7);
        btnSkip.registerTouchEvent(function(){
            this.close();
        }.bind(this));
        btnSkip.x = cc.winSize.width*0.85;
        btnSkip.y = mc.const.DEFAULT_HEIGHT*0.95;
        btnSkip.setLocalZOrder(5);

        this.addChild(blackPanel);
        brk.addChild(btnArrow);
        brk.addChild(brkName);
        brk.addChild(lblTalk);
        this.addChild(brk);
        this.addChild(btnSkip);

        this.setEnableClickOutSize(false);
        this.setEnableBackEvent(true);
    },

    setCompleteCallback:function(callback){
        this._completeCb = callback;
        return this;
    },

    _talkNow:function(){
        var currTalkStr = mc.GameData.storyManager.getCurrentTalkString();
        if( currTalkStr ){
            this._isTalkAnimation = true;
            var strs = currTalkStr.split(':');
            var names = strs[0].split('_');
            var talk = strs[1];
            var name = names[0];
            var dir = names[1];

            var targetSpineView = null;
            var sameTargetSpineView = null;
            this._brkName.setVisible(true);
            this._blackPanel.setLocalZOrder(2);
            for(var i = 0; i < this._arrSpineView.length; i++ ){
                var spineView = this._arrSpineView[i];
                spineView.setLocalZOrder(1);
                if( spineView.getUserData() === name ){
                    spineView.setLocalZOrder(3);
                    targetSpineView = spineView;
                }
                else if( spineView._isEnterTalk ){
                    if( (spineView.scaleX > 0 && dir === "R") ||
                        (spineView.scaleX < 0 && dir === "L") ){
                        sameTargetSpineView = spineView;
                    }
                }
            }

            if( targetSpineView ){
                if (sameTargetSpineView) {
                    var dx = this._RUN_W;
                    sameTargetSpineView.runAction(cc.sequence([cc.moveBy(0.1, sameTargetSpineView.scaleX > 0 ? dx : -dx, 0), cc.callFunc(function (spineView) {
                        spineView._isEnterTalk = false;
                    }.bind(this))]));
                }
                if( !targetSpineView._isEnterTalk ){
                    var dx = this._RUN_W;
                    targetSpineView.runAction(cc.sequence([cc.moveBy(0.1,targetSpineView.scaleX > 0 ? -dx : +dx,0),cc.callFunc(function(targetSpineView){
                        targetSpineView._isEnterTalk = true;
                        this._runTalkAnimation(name,dir,talk);
                    }.bind(this))]));
                }
                else{
                    this._runTalkAnimation(name,dir,talk);
                }
            }
        }
    },

    _runTalkAnimation:function(name,dir,talk){
        this._lblTalk.runAction(cc.sequence([cc.fadeOut(0.15),cc.callFunc(function(){
            this._brkName.x = dir === "L" ? this._brk.width*0.3 : this._brk.width*0.7;
            this._brkName.width = this._brkName._baseWidth;
            this._brkName.setString((this.MAP_FULL_NAME_BY_NAME[name] != undefined) ? this.MAP_FULL_NAME_BY_NAME[name] : name);
            var lblTalk = this._lblTalk = this._lblTalk.clone();
            lblTalk.getVirtualRenderer().setBoundingWidth(this._brk.width);
            lblTalk.setString(talk);
            lblTalk.opacity = 0;
            lblTalk.runAction(cc.sequence([cc.fadeIn(0.15),cc.callFunc(function(){
                this._isTalkAnimation = false;
            }.bind(this))]));
            this._brk.addChild(lblTalk);
        }.bind(this)),cc.removeSelf()]));
    },

    overrideShowAnimation: function () {
        this._blackPanel.setEnabled(false);
        this.opacity = 0;
        for(var i = 0; i < this._arrSpineView.length; i++ ){
            var spineView = this._arrSpineView[i];
            var dx = this._RUN_W;
            spineView.x += spineView.scaleX > 0 ? dx : -dx;
        }
        this.runAction(cc.sequence([cc.fadeIn(0.15),cc.delayTime(0.15),cc.callFunc(function(){
            this._blackPanel.setEnabled(true);
            this._talkNow();
        }.bind(this))]));
        return 0.15;
    },

    overrideCloseAnimation: function () {
        for(var i = 0; i < this._arrSpineView.length; i++ ){
            var spineView = this._arrSpineView[i];
            var dx = -this._RUN_W;
            spineView.runAction(cc.moveBy(0.1,spineView.scaleX > 0 ? -dx : +dx,0));
        }
        this.runAction(cc.sequence([cc.fadeOut(0.15),cc.callFunc(function(){
            mc.GameData.storyManager.nextStory();
            this._completeCb && this._completeCb();
        }.bind(this))]));
        return 0.15;
    }

});