/**
 * Created by long.nguyen on 10/21/2017.
 */
mc.DialogVS = bb.Dialog.extend({

    ctor:function(opponentName,opponentPower,opponentLeague,mapOpponentHeroInfo,opponentTeamFormation,opponentLeaderIndex,statusCreatureManager){
        this._super();

        var node = ccs.load(res.widget_vs,"res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var panelPlayer = this._panelPlayer = rootMap["panelPlayer"];
        var panelEnemy = this._panelEnemy = rootMap["panelEnemy"];
        var btnCancel = this._btnCancel = rootMap["btnCancel"];
        var btnStart = this._btnStart = rootMap["btnStart"];
        var nodeAsset = this._nodeAsset = rootMap["nodeAsset"];
        var nodeVS = rootMap["nodeVS"];

        btnStart.setString(mc.dictionary.getGUIString("lblStart"));
        btnCancel.setString(mc.dictionary.getGUIString("lblCancel"));

        var playerInfo = mc.GameData.playerInfo;
        var heroStock = mc.GameData.heroStock;
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var league = mc.GameData.playerInfo.getLeague();
        var arrFormation = teamFormationManager.getTeamFormationByIndex(teamId,teamIndex);
        var leaderIndex = teamFormationManager.getLeaderFormationByIndex(teamId,teamIndex);
        this._canStartBattle = false;
        for(var f = 0; f < arrFormation.length; f++ ){
            if( arrFormation[f] >= 0 ){
                this._canStartBattle = true;
                break;
            }
        }

        this._reloadVSPanel(panelPlayer,playerInfo.getName(),teamFormationManager.getPowerByTeamIndex(teamId,teamIndex),league,
            heroStock.getHeroMap(),arrFormation,leaderIndex,statusCreatureManager,false, true);
        this._reloadVSPanel(panelEnemy,opponentName,opponentPower,opponentLeague,mapOpponentHeroInfo,opponentTeamFormation,opponentLeaderIndex,statusCreatureManager,true);

        var textVSEffect = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_text_vs_effect_json,res.spine_ui_text_vs_effect_atlas, 1.0);
        nodeVS.addChild(textVSEffect);
        nodeVS.setVisible(false);

        btnStart.registerTouchEvent(function(){
            bb.sound.stopMusic();
            this.enableInput(false);
            textVSEffect.setAnimation(0,"vs_battle",false);
            this.scheduleOnce(function(){
                if( this._startCallback ){
                    bb.sound.playEffect(res.sound_ui_button_start_battle);
                    this._startCallback();
                    this.scheduleOnce(function(){
                        this.enableInput(true);
                    }.bind(this),1.0);
                }
            }.bind(this),1.0);
            nodeVS.setVisible(true);
        }.bind(this));
        btnStart.setGrayForAll(true);

        btnCancel.registerTouchEvent(function(){
            this.close();
        }.bind(this));
    },

    setStartCallback:function(callback,str){
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var arrFormation = teamFormationManager.getTeamFormationByIndex(teamId,teamIndex);
        var canStartBattle = false;
        for(var f = 0; f < arrFormation.length; f++ ){
            if( arrFormation[f] >= 0 ){
                canStartBattle = true;
                break;
            }
        }
        this._startCallback = callback;
        if( canStartBattle ){
            this._btnStart.setGrayForAll(false);
        }
        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = this._btnStart.width*0.5;
        particle.y = this._btnStart.height*0.5;
        this._btnStart.addChild(particle);
        str && this._btnStart.setString(str);
        return this;
    },

    setAssetConsume:function(consumeInfo){
        var consumeView = mc.view_utility.createAssetView(consumeInfo);
        this._nodeAsset.addChild(consumeView);
        return this;
    },

    onShow:function(){
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_CHAOS_OPPONENT);
        if( tutorialTrigger ){
            if( tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_WIDGET ){
                var node = this._panelPlayer.getChildByName("nodeAvt");
                if( node ){
                    var widget = node.getChildren()[0].getChildren()[2];
                    new mc.LayerTutorial(tutorialTrigger)
                        .setTargetWidget(widget)
                        .setCharPositionY(cc.winSize.height*0.7)
                        .show();
                }
            }
            if( tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON ){
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnStart)
                    .setCharPositionY(cc.winSize.height*0.7)
                    .show();
            }
        }
    },

    overrideShowAnimation:function(){
        var dur = 0.2;
        this._panelPlayer.x = cc.winSize.width*-0.5;
        this._panelPlayer.runAction(cc.moveTo(0.2,cc.winSize.width*0.5,this._panelPlayer.y).easing(cc.easeBackOut()));

        this._panelEnemy.x = cc.winSize.width*1.5;
        this._panelEnemy.runAction(cc.moveTo(0.2,cc.winSize.width*0.5,this._panelEnemy.y).easing(cc.easeBackOut()));

        this._btnCancel.opacity = 0;
        this._btnCancel.runAction(cc.fadeIn(dur));
        this._btnStart.opacity = 0;
        this._btnStart.runAction(cc.fadeIn(dur));
        return dur;
    },

    overrideCloseAnimation:function(){
        var dur = 0.2;
        this._panelPlayer.runAction(cc.moveTo(0.2,cc.winSize.width*-0.5,this._panelPlayer.y));

        this._panelEnemy.runAction(cc.moveTo(0.2,cc.winSize.width*1.5,this._panelEnemy.y));

        this._btnCancel.runAction(cc.fadeOut(dur));
        this._btnStart.runAction(cc.fadeOut(dur));
        return dur;
    },

    _reloadVSPanel:function(panel,name,power,league,mapHeroInfo,arrFormation,leaderIndex,statusCreatureManager,disableEdit,isYourTeam){
        var panelMap = bb.utility.arrayToMap(panel.getChildren(),function(child){
            return child.getName();
        });
        var lblName = panelMap["lblName"];
        var lblPower = panelMap["lblPower"];
        var nodeAvt = panelMap["nodeAvt"];
        var lblLevel = panelMap["lblLevel"];
        var lblLeaderSkillInfo = panelMap["lblLeaderSkillInfo"];
        var nodeSkill = panelMap["nodeSkill"];
        var iconRank = new ccui.ImageView(mc.const.MAP_LEAGUE_BY_CODE[league].url,ccui.Widget.PLIST_TEXTURE);
        if( iconRank ){
            iconRank.scale = 0.8;
            iconRank.x = panel.width*0.05;
            iconRank.y = panel.height*0.92;
            panel.addChild(iconRank);
        }

        if(mc.enableReplaceFontBM())
        {
            lblPower = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPower);
            mc.view_utility.applyPowerStyle(lblPower);
            lblLeaderSkillInfo = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeaderSkillInfo);
            lblLeaderSkillInfo.setColor(mc.color.BROWN_SOFT);
        }

        lblLevel.setColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLevel.setVisible(false);

        lblName.setString(name);
        lblPower.setString(bb.utility.formatNumber(power));

        var imgSkill = null;
        var leaderHeroId = arrFormation[leaderIndex];
        var leaderSkill = null;
        if (leaderHeroId != -1) {
            leaderSkill = mc.HeroStock.getHeroLeaderSkill(mapHeroInfo[leaderHeroId]);

        }
        if (leaderSkill) {
            imgSkill = mc.view_utility.createSkillInfoIcon(leaderSkill);
        }
        else {
            imgSkill = new cc.Sprite("#patch9/pnl_lockedskillslot.png");
        }
        nodeSkill.addChild(imgSkill);

        mc.view_utility.layoutTeamFormation({
            arrTeamFormation:arrFormation,
            leaderIndex:leaderIndex,
            mapHeroInfo:mapHeroInfo,
            statusCreatureManager:statusCreatureManager
        },{
            nodeHero:nodeAvt,
            lblLeaderSkillInfo:lblLeaderSkillInfo,
            showNotifyIfNotHero : isYourTeam
        },disableEdit,-5);
    }

});