/**
 * Created by long.nguyen on 1/3/2018.
 */
mc.LayerTutorial = cc.Layer.extend({
    _enableSkip:true,

    ctor:function(trigger){
        this._super();
        this._trigger = trigger;
    },

    setTargetWidget:function(widget){
        this._targetWidget = widget;
        return this;
    },

    setCallback:function(callback){
        this._callback = callback;
        return this;
    },

    setTrimClickSize:function(trimSize){
        this._trimClickSize = trimSize;
        return this;
    },

    setScaleHole:function(scaleHole){
        this._scaleHole = scaleHole;
        return this;
    },

    setCharPositionY:function(charY){
        this._charPositionY = charY;
        return this;
    },

    _init:function(){
        var widget = this._targetWidget;
        var thresholdSprite = this._thresholdSprite = new cc.Sprite("#icon/Fire_Element.png");
        thresholdSprite.scale = this._scaleHole || 1;
        var clipNode = this._clipNode = new cc.ClippingNode(thresholdSprite);
        clipNode.setCascadeOpacityEnabled(true);
        clipNode.setAlphaThreshold(0.95);
        clipNode.width = cc.winSize.width;
        clipNode.height = cc.winSize.height;
        clipNode.setInverted(true);
        this.addChild(clipNode);

        var particleFocus = this._particleFocus = new cc.ParticleSystem(res.particle_focus_tutorial_plist);
        this.addChild(particleFocus);

        var scroll = null;
        var parent = widget.getParent();
        while( parent ){
            if( parent instanceof ccui.ScrollView ||
                parent instanceof cc.ScrollView ){
                scroll = parent;
            }
            parent = parent.getParent();
        }

        var pos = widget.getParent().convertToWorldSpace(cc.p(widget.x + (thresholdSprite.anchorX - widget.anchorX)*widget.width,
                                                              widget.y + (thresholdSprite.anchorY - widget.anchorY)*widget.height));
        if( scroll ){
            scroll.setTouchEnabled && scroll.setTouchEnabled(false);
        }

        thresholdSprite.x = pos.x;
        thresholdSprite.y = pos.y;
        particleFocus.x = pos.x;
        particleFocus.y = pos.y;

        var pw = 0;
        var ph = 0;
        if( this._trimClickSize ){
            pw = this._trimClickSize.width;
            ph = this._trimClickSize.height;
        }
        var blackPanel = new ccui.Layout();
        blackPanel.setBackGroundColor(cc.color.BLACK);
        blackPanel.setBackGroundColorOpacity(128);
        blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        blackPanel.width = cc.winSize.width;
        blackPanel.height = cc.winSize.height;
        clipNode.addChild(blackPanel);

        var topPrevent = new ccui.Layout();
        var leftPrevent = new ccui.Layout();
        var rightPrevent = new ccui.Layout();
        var bottomPrevent = new ccui.Layout();

        topPrevent.setTouchEnabled(true);
        leftPrevent.setTouchEnabled(true);
        rightPrevent.setTouchEnabled(true);
        bottomPrevent.setTouchEnabled(true);

        this.addChild(topPrevent);
        this.addChild(leftPrevent);
        this.addChild(rightPrevent);
        this.addChild(bottomPrevent);

        var _updatePreventLayer = function(pos){
            var widget = this._targetWidget;
            topPrevent.anchorY = 1;
            topPrevent.y = cc.winSize.height;
            topPrevent.width = cc.winSize.width;
            topPrevent.height = cc.winSize.height - (pos.y+widget.height*0.5 - ph);
            leftPrevent.width = (pos.x - widget.width*0.5 + pw);
            leftPrevent.height = cc.winSize.height;
            rightPrevent.width = cc.winSize.width - (pos.x + widget.width*0.5 - pw);
            rightPrevent.height = cc.winSize.height;
            rightPrevent.anchorX = 1;
            rightPrevent.x = cc.winSize.width;
            bottomPrevent.width = cc.winSize.width;
            bottomPrevent.height = (pos.y - widget.height*0.5 + ph);
        }.bind(this);

        _updatePreventLayer(pos);

        bb.framework.addSpriteFrames(res.patch9_4_plist);
        var pos = cc.p(cc.winSize.width*0.75,this._charPositionY || cc.winSize.height*0.65);
        var brkBubble = this._brkBubble = new ccui.ImageView("patch9/pnl_talkingbubble.png",ccui.Widget.PLIST_TEXTURE);
        brkBubble.anchorX = 0.78;
        brkBubble.anchorY = 0;
        brkBubble.x = pos.x;
        brkBubble.y = pos.y;
        this.addChild(brkBubble);

        var lbl = this._lblTalk = new cc.LabelBMFont("",res.font_UTMBienvenue_none_32_export_fnt);
        if(mc.enableReplaceFontBM())
        {
            lbl = this._lblTalk = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl);
        }
        lbl.scale = 0.75;
        lbl.x = brkBubble.width * 0.5;
        lbl.y = brkBubble.height * 0.6;
        lbl.setBoundingWidth(brkBubble.width - 20);
        lbl.setComplexString(mc.GameData.tutorialManager.getCurrentTutorialString(),mc.color.BROWN_SOFT);
        brkBubble.addChild(lbl);

        var spine = this._spineView = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json,res.spine_ui_story_teller_atlas, 1.0);
        spine.scale = 0.15;
        spine.setAnimation(0, "default", true);
        spine.x = brkBubble.x + 10;
        spine.y = brkBubble.y - 100;
        this.addChild(spine);

        if( this._enableSkip ){
            var btnSkip = new ccui.ImageView("button/btn_skip.png",ccui.Widget.PLIST_TEXTURE);
            var lblRedeem = btnSkip.setString(mc.dictionary.getGUIString("lblSkip"), res.font_UTMBienvenue_stroke_32_export_fnt);
            lblRedeem.x = btnSkip.width * 0.63;
            lblRedeem.setScale(0.7);
            btnSkip.registerTouchEvent(function(){
                this.close(true);
            }.bind(this));
            btnSkip.x = cc.winSize.width*0.85;
            btnSkip.y = cc.winSize.height*0.95;
            btnSkip.setLocalZOrder(5);
            this.addChild(btnSkip);
        }

        this._eventClickTrack = bb.director.trackGlueObject(bb.framework.const.EVENT_CLICK,function(clickWidget){
            if( widget === clickWidget || widget.getName() === clickWidget.getName()){
                if( scroll ){
                    scroll.setTouchEnabled && scroll.setTouchEnabled(true);
                }
                this.close();
                this._callback && this._callback();
            }
        }.bind(this));

        this._thresholdSprite.retain();
        this._targetWidget.runAction(cc.sequence([cc.delayTime(0.5),cc.callFunc(function(widget){
            var thresholdSprite = this._thresholdSprite;
            var pos = widget.getParent().convertToWorldSpace(cc.p(widget.x + (thresholdSprite.anchorX - widget.anchorX)*widget.width,
                                                                  widget.y + (thresholdSprite.anchorY - widget.anchorY)*widget.height));
            thresholdSprite.x = pos.x;
            thresholdSprite.y = pos.y;
            this._particleFocus.x = pos.x;
            this._particleFocus.y = pos.y;
            _updatePreventLayer(pos);
        }.bind(this))]));
    },

    setEnableSkip:function(enableSkip){
        this._enableSkip = enableSkip;
        return this;
    },

    show:function(){
        mc.GameData.tutorialManager.lockScript(true);
        var screen = bb.director.getCurrentScreen();
        if( screen && screen.setEnableBackEvent ){
            screen.setEnableBackEvent(false);
        }
        var topMostDialog = bb.director.getTopMostDialog();
        if( topMostDialog ){
            this._enableDialogBackEvent = topMostDialog.isEnableBackEvent();
            topMostDialog.setEnableBackEvent(false);
        }
        this._init();
        this.setLocalZOrder(9999999);
        this._brkBubble.scale = 0;
        this._clipNode.opacity = 0;
        this._clipNode.runAction(cc.fadeIn(0.2));
        var dx = cc.winSize.width*0.5;
        this._spineView.x += dx;
        this._spineView.runAction(cc.sequence([cc.moveBy(0.2,-dx,0),cc.callFunc(function(){
            this._brkBubble.runAction(cc.sequence([cc.scaleTo(0.2,1.0,1.0).easing(cc.easeBackOut()),cc.callFunc(function(){

            }.bind(this))]));
        }.bind(this))]));
        bb.director.getCurrentRunningScene().addChild(this);
    },

    close:function(isSkip){
        this._eventClickTrack && bb.director.unTrackGlueObject(this._eventClickTrack);
        if( !this._isClosingTutorial ){
            this._isClosingTutorial = true;
            this._thresholdSprite.release();
            var screen = bb.director.getCurrentScreen();
            if( screen && screen.setEnableBackEvent ){
                screen.setEnableBackEvent(true);
            }
            var topMostDialog = bb.director.getTopMostDialog();
            if( topMostDialog ){
                topMostDialog.setEnableBackEvent(this._enableDialogBackEvent);
            }
            var isSave = mc.GameData.tutorialManager.nextTutorial();
            this._clipNode.runAction(cc.fadeOut(0.1));
            this._spineView.runAction(cc.moveBy(0.1,cc.winSize.width*0.5,0));
            this._brkBubble.runAction(cc.sequence([cc.fadeOut(0.1),cc.callFunc(function(){

            }.bind(this))]));
            this.runAction(cc.sequence([cc.delayTime(0.1),cc.callFunc(function(){
                if( isSkip ){
                    mc.GameData.tutorialManager.skip();
                }
                if ( isSave  || isSkip){
                    mc.GameData.settingManager.saveAll();
                    mc.GameData.settingManager.flush();
                }
                mc.GameData.tutorialManager.notifyDataChanged();
            }.bind(this)),cc.removeSelf()]));
        }
    }

});