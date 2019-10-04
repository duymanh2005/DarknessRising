/**
 * Created by long.nguyen on 10/21/2017.
 */
mc.DialogVSAfterPickHero = bb.Dialog.extend({
    _time: 0,

    ctor: function (matchInfo) {
        this._super();

        var node = ccs.load(res.widget_vs, "res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var panelPlayer = this._panelPlayer = rootMap["panelPlayer"];
        var panelEnemy = this._panelEnemy = rootMap["panelEnemy"];
        var btnCancel = this._btnCancel = rootMap["btnCancel"];
        var btnStart = this._btnStart = rootMap["btnStart"];
        var nodeAsset = this._nodeAsset = rootMap["nodeAsset"];
        var nodeVS = this._nodeVS = rootMap["nodeVS"];

        btnStart.setString(mc.dictionary.getGUIString("lblStart"));
        btnCancel.setString(mc.dictionary.getGUIString("lblCancel"));

        //var playerInfo = mc.GameData.playerInfo;
        //var heroStock = mc.GameData.heroStock;
        //var teamFormationManager = mc.GameData.teamFormationManager;
        //var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        //var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        //var league = mc.GameData.playerInfo.getLeague();
        //var arrFormation = teamFormationManager.getTeamFormationByIndex(teamId,teamIndex);
        //var leaderIndex = teamFormationManager.getLeaderFormationByIndex(teamId,teamIndex);
        //this._canStartBattle = false;
        //for(var f = 0; f < arrFormation.length; f++ ){
        //    if( arrFormation[f] >= 0 ){
        //        this._canStartBattle = true;
        //        break;
        //    }
        //}

        var hostArrHero = matchInfo.host_team.heroes;
        var hostName = matchInfo.host_team.gameHeroName;
        var hostPower = matchInfo.power;
        var hostLeader = matchInfo.host_team.leaderIndex;
        var oppArrHero = matchInfo.request_team.heroes;
        var oppName = matchInfo.request_team.gameHeroName;
        var oppPower = matchInfo.power;
        var oppLeader = matchInfo.request_team.leaderIndex;

        this._reloadVSPanel(panelEnemy, oppArrHero, oppName, oppPower, oppLeader);
        this._reloadVSPanel(panelPlayer, hostArrHero, hostName, hostPower, hostLeader);

        var textVSEffect = this._textVSEffect = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_text_vs_effect_json, res.spine_ui_text_vs_effect_atlas, 1.0);
        nodeVS.addChild(textVSEffect);
        nodeVS.setVisible(false);

        //btnStart.registerTouchEvent(function(){
        //    bb.sound.stopMusic();
        //    this.enableInput(false);
        //    textVSEffect.setAnimation(0,"vs_battle",false);
        //    this.scheduleOnce(function(){
        //        if( this._startCallback ){
        //            bb.sound.playEffect(res.sound_ui_button_start_battle);
        //            this._startCallback();
        //            this.scheduleOnce(function(){
        //                this.enableInput(true);
        //            }.bind(this),1.0);
        //        }
        //    }.bind(this),1.0);
        //    nodeVS.setVisible(true);
        //}.bind(this));
        //btnStart.setGrayForAll(true);
        //
        //btnCancel.registerTouchEvent(function(){
        //    this.close();
        //}.bind(this));
        btnStart.setVisible(false);
        btnCancel.setVisible(false);
        this._animationVS();
        this.scheduleOnce(function () {
            this.close();
            mc.GUIFactory.showRelicArenaBattleScreen();
        }, 3.0);
    },

    _animationVS: function () {
        bb.sound.stopMusic();
        this._textVSEffect.setAnimation(0, "vs_battle", false);
        this.scheduleOnce(function () {

            bb.sound.playEffect(res.sound_ui_button_start_battle);
            //this._startCallback();
            //this.scheduleOnce(function(){
            //    this.enableInput(true);
            //}.bind(this),1.0);

        }.bind(this), 1.0);
        this._nodeVS.setVisible(true);
    },


    setStartCallback: function (callback, str) {
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var arrFormation = teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);
        var canStartBattle = false;
        for (var f = 0; f < arrFormation.length; f++) {
            if (arrFormation[f] >= 0) {
                canStartBattle = true;
                break;
            }
        }
        this._startCallback = callback;
        if (canStartBattle) {
            this._btnStart.setGrayForAll(false);
        }
        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = this._btnStart.width * 0.5;
        particle.y = this._btnStart.height * 0.5;
        this._btnStart.addChild(particle);
        str && this._btnStart.setString(str);
        return this;
    },

    setAssetConsume: function (consumeInfo) {
        var consumeView = mc.view_utility.createAssetView(consumeInfo);
        this._nodeAsset.addChild(consumeView);
        return this;
    },

    //onShow:function(){
    //    var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_CHAOS_OPPONENT);
    //    if( tutorialTrigger ){
    //        if( tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_WIDGET ){
    //            var node = this._panelPlayer.getChildByName("nodeAvt");
    //            if( node ){
    //                var widget = node.getChildren()[0].getChildren()[2];
    //                new mc.LayerTutorial(tutorialTrigger)
    //                    .setTargetWidget(widget)
    //                    .setCharPositionY(cc.winSize.height*0.7)
    //                    .show();
    //            }
    //        }
    //        if( tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON ){
    //            new mc.LayerTutorial(tutorialTrigger)
    //                .setTargetWidget(this._btnStart)
    //                .setCharPositionY(cc.winSize.height*0.7)
    //                .show();
    //        }
    //    }
    //},

    overrideShowAnimation: function () {
        var dur = 0.2;
        this._panelPlayer.x = cc.winSize.width * -0.5;
        this._panelPlayer.runAction(cc.moveTo(0.2, cc.winSize.width * 0.5, this._panelPlayer.y).easing(cc.easeBackOut()));

        this._panelEnemy.x = cc.winSize.width * 1.5;
        this._panelEnemy.runAction(cc.moveTo(0.2, cc.winSize.width * 0.5, this._panelEnemy.y).easing(cc.easeBackOut()));

        return dur;
    },

    overrideCloseAnimation: function () {
        var dur = 0.2;
        this._panelPlayer.runAction(cc.moveTo(0.2, cc.winSize.width * -0.5, this._panelPlayer.y));

        this._panelEnemy.runAction(cc.moveTo(0.2, cc.winSize.width * 1.5, this._panelEnemy.y));

        return dur;
    },

    _reloadVSPanel: function (panel, arrHeroInfo, name, power, leaderHeroId) {
        var panelMap = bb.utility.arrayToMap(panel.getChildren(), function (child) {
            return child.getName();
        });
        var lblName = panelMap["lblName"];
        var lblPower = panelMap["lblPower"];
        var nodeAvt = panelMap["nodeAvt"];
        var lblLevel = panelMap["lblLevel"];
        var lblLeaderSkillInfo = panelMap["lblLeaderSkillInfo"];
        lblLeaderSkillInfo.setString(mc.dictionary.getGUIString("lblLeaderSkillWillUpdateNextStep"));
        var nodeSkill = panelMap["nodeSkill"];
        //var iconRank = new ccui.ImageView(mc.const.MAP_LEAGUE_BY_CODE[league].url,ccui.Widget.PLIST_TEXTURE);
        //if( iconRank ){
        //    iconRank.scale = 0.8;
        //    iconRank.x = panel.width*0.05;
        //    iconRank.y = panel.height*0.92;
        //    panel.addChild(iconRank);
        //}

        lblLevel.setColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLevel.setVisible(false);

        lblName.setString(name);

        lblPower.setString(bb.utility.formatNumber(power));


        var oppTeamFormation = [];
        for (var i = 0; i < arrHeroInfo.length; i++) {
            oppTeamFormation.push(arrHeroInfo[i].id);
        }

        var imgSkill = null;
        var leaderSkill = null;
        if (leaderHeroId != -1) {
            var leaderHeroIndex = -1;
            for(var i = 0;i<oppTeamFormation.length;i++)
            {
                if( oppTeamFormation[i] === leaderHeroId)
                {
                    leaderHeroIndex = i;
                    break;
                }
            }
            leaderSkill = mc.HeroStock.getHeroLeaderSkill(arrHeroInfo[leaderHeroIndex]);

        }
        if (leaderSkill) {
            imgSkill = mc.view_utility.createSkillInfoIcon(leaderSkill);
        }
        else {
            imgSkill = new cc.Sprite("#patch9/pnl_lockedskillslot.png");
        }
        nodeSkill.addChild(imgSkill);

        //mc.view_utility.layoutTeamFormation({
        //    arrTeamFormation:arrFormation,
        //    leaderIndex:leaderIndex,
        //    mapHeroInfo:mapHeroInfo,
        //    statusCreatureManager:statusCreatureManager
        //},{
        //    nodeHero:nodeAvt,
        //    lblLeaderSkillInfo:lblLeaderSkillInfo
        //},disableEdit,-5);


        mc.view_utility.layoutHiddenHeroTeamFormation({
            arrTeamFormation: oppTeamFormation,
            leaderHeroId: leaderHeroId,
            mapHeroInfo: bb.utility.arrayToMap(arrHeroInfo, function (heroInfo) {
                return mc.HeroStock.getHeroId(heroInfo);
            }),
            enableClick: true
        }, {
            nodeHero: nodeAvt,
            lblLeaderSkillInfo: lblLeaderSkillInfo
        }, true);
    }


});