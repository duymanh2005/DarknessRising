/**
 * Created by long.nguyen on 4/5/2018.
 */
mc.ChallengeListLayer = mc.MainBaseLayer.extend({

    ctor:function(parseNode){
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);

        var root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelTop = rootMap["panelTop"];
        var nodeBrk = rootMap["nodeBrk"];
        var panelMiddle = this._panelMidel = rootMap["panelMiddle"];

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblChallenge"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Hero_Info.png",ccui.Widget.LOCAL_TEXTURE));

        var list = this._list = new ccui.ListView();
        list.width = panelMiddle.width;
        list.height = panelMiddle.height;
        list.anchorX = 0.5;
        list.anchorY = 0.5;
        list.x = panelMiddle.x;
        list.y = panelMiddle.y;
        list.setDirection(ccui.ScrollView.DIR_VERTICAL);
        list.setGravity(ccui.ListView.GRAVITY_CENTER_HORIZONTAL);
        list.setBounceEnabled(true);
        list.setClippingEnabled(true);
        root.addChild(list);

        this.bannerRes = [
            "res/png/banner/banner_DragonAttack.png",
            "res/png/banner/banner_WhiteWizard.png",
            "res/png/banner/banner_MoonRabbit.png"
        ];
    },

    onLayerShow:function(){
        var allChallengeGroup = mc.GameData.challengeManager.getAllChallengeGroup();
        if( allChallengeGroup ){
            this._populateAllChallengeGroup();
        }
        else{
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.getListChallengeGroup(function(result){
                mc.view_utility.hideLoadingDialogById(loadingId);
                if( result ){
                    this._populateAllChallengeGroup();
                }
            }.bind(this));
        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_CHALLENGE_LIST);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._list.getChildren()[0])
                    .setScaleHole(1.5)
                    .show();
            }
        }
    },

    _populateAllChallengeGroup:function(){
        var allChallengeGroup = mc.GameData.challengeManager.getAllChallengeGroup();
        for(var groupIndex in allChallengeGroup ){
            this._list.pushBackCustomItem(this._createChallengeGroupView(allChallengeGroup[groupIndex]));
        }
    },

    _createChallengeGroupView:function(challengeGroup){
        var numChance = challengeGroup["chance"];
        var startTime = parseInt(challengeGroup["startTime"]);
        var groupIndex = challengeGroup["groupIndex"];

        var widget = new ccui.Layout();
        widget.setCascadeOpacityEnabled(true);
        widget.anchorX = widget.anchorY = 0.5;
        var brk = new cc.Sprite(this.bannerRes[groupIndex]);

        var lblBattle = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblBattle"));
        var lblRefillIn = bb.framework.getGUIFactory().createText("");
        var layoutSwords = bb.layout.linear(bb.collection.createArray(3,function(index){
            var spr = new cc.Sprite("#icon/ico_battle.png");
            if( (index + 1) > numChance ){
                spr.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            return spr;
        }),5,bb.layout.LINEAR_HORIZONTAL);

        if( startTime > 0){
            lblRefillIn.setString(mc.dictionary.getGUIString("lblRefillIn"));
            lblRefillIn.setDecoratorLabel(mc.view_utility.formatDurationTime(bb.now() - startTime),mc.color.GREEN_NORMAL);
            lblRefillIn.runAction(cc.sequence([cc.delayTime(30.0),cc.callFunc(function(lbl){
                lblRefillIn.setDecoratorLabel(mc.view_utility.formatDurationTime(bb.now() - startTime),mc.color.GREEN_NORMAL);
                lblRefillIn.anchorX = 0;
            })]).repeatForever());
        }

        lblBattle.anchorX = lblRefillIn.anchorX = layoutSwords.anchorX = 0;

        lblBattle.x = 55;
        lblBattle.y = 105;
        layoutSwords.x = lblBattle.x + lblBattle.width*lblBattle.scale;
        layoutSwords.y = 105;
        lblRefillIn.x = layoutSwords.x + layoutSwords.width+30;
        lblRefillIn.y = 105;

        widget.addChild(brk);
        widget.addChild(lblBattle);
        widget.addChild(layoutSwords);
        widget.addChild(lblRefillIn);
        widget.width = brk.width;
        widget.height = brk.height-50;
        brk.x = brk.width*0.5;
        brk.y = brk.height*0.5;
        widget.registerTouchEvent(function(){
            mc.GameData.guiState.setCurrentChallengeGroupIndex(groupIndex);
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST);
        }.bind(this));
        return widget;
    },

    getLayerId:function(){
        return mc.MainScreen.LAYER_CHALLENGE_LIST;
    },

    isShowHeader:function(){
        return true;
    },

    isShowFooter:function(){
        return true;
    },

    isShowTip:function(){
        return false;
    }

});