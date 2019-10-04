/**
 * Created by long.nguyen on 5/10/2018.
 */
mc.DialogSelectBattleHeroNoral = bb.Dialog.extend({
    _mapHeroAvtById:null,
    _mapBtnChangeById:null,

    ctor:function(stageIndex,type){
        this._super();

        var node = ccs.load(res.widget_select_battle_hero_normal,"res/").node;
        node.anchorX = 0.5;
        node.anchorY = 0.5;
        node.x = cc.winSize.width*0.5;
        node.y = cc.winSize.height*0.5;
        this.addChild(node);

        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });
        node.width = root.width;
        node.height = root.height;

        var lblTeam = rootMap["lblTeam"];
        var lblLeaderSkillInfo = rootMap["lblLeaderSkillInfo"];
        var lblReward = rootMap["lblReward"];
        var nodeHero = rootMap["nodeHero"];
        var nodeReward = this._nodeReward = rootMap["nodeReward"];
        var nodeSkill = rootMap["nodeSkill"];
        var btnBattle = this._btnBattle = rootMap["btnBattle"];
        var lblRequireVIP = rootMap["lblRequireVIP"];
        var btnQuickBattle = rootMap["btnQuickBattle"];
        var btnClose = rootMap["btnClose"];
        nodeHero.scale = 0.965;

        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.TeamFormationManager.TEAM_CAMPAIGN;
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var heroStock = mc.GameData.heroStock;
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_CAMPAIGN);

        var dataTeam = {
            arrTeamFormation:teamFormationManager.getTeamFormationByIndex(teamId,teamIndex),
            leaderIndex:teamFormationManager.getLeaderFormationByIndex(teamId,teamIndex),
            mapHeroInfo:heroStock.getHeroMap()
        }
        mc.view_utility.layoutTeamFormation(dataTeam,{
            nodeHero:nodeHero,
            lblLeaderSkillInfo:lblLeaderSkillInfo,
            showNotifyIfNotHero : true
        });

        var leaderHeroId = dataTeam.arrTeamFormation[dataTeam.leaderIndex];
        var leaderSkill = null;
        if (leaderHeroId != -1) {
            leaderSkill = mc.HeroStock.getHeroLeaderSkill(mc.GameData.heroStock.getHeroById(leaderHeroId));

        }
        var imgSkill = null;
        if (leaderSkill) {
            imgSkill = mc.view_utility.createSkillInfoIcon(leaderSkill);
        }
        else {
            imgSkill = new cc.Sprite("#patch9/pnl_leaderskillslot_frame.png");
        }
        nodeSkill.addChild(imgSkill);

        mc.GameData.guiState.setCurrentChallengeStageIndex(stageIndex);
        var challengeStageDict = mc.dictionary.getChallengeStageByIndex(stageIndex);
        var challengeGroupInfo = mc.GameData.challengeManager.getAllChallengeGroup()[challengeStageDict["groupIndex"]];
        var arrReward = mc.ItemStock.createArrJsonItemFromStr(challengeStageDict["reward"]);
        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length,function(index){
            var itemView = new mc.ItemView(arrReward[index]).registerViewItemInfo();
            itemView.setSwallowTouches(false);
            return itemView;
        }),10);
        var wrapWidget = mc.view_utility.wrapWidget(layoutReward,598,false,{top:12,bottom:12});
        nodeReward.addChild(wrapWidget);

        lblTeam.setColor(mc.color.BROWN_SOFT);
        lblReward.setColor(mc.color.BROWN_SOFT);
        lblReward.setString(mc.dictionary.getGUIString("lblRewards"));
        lblTeam.setString(mc.dictionary.getGUIString("lblBattleTeam"));
        lblRequireVIP.setString(mc.dictionary.getGUIString("lblRequireVIP"));
        lblRequireVIP.setColor(mc.color.RED);
        lblLeaderSkillInfo.setColor(mc.color.BROWN_SOFT);

        var chance = challengeGroupInfo["chance"];
        var lblBattle = btnBattle.setString(mc.dictionary.getGUIString("lblBattle"));
        lblBattle.scale = 1.15;
        lblBattle.x = btnBattle.width * 0.6;
        lblBattle.y = btnBattle.height * 0.5;
        var lblQuickFinish = btnQuickBattle.setString(mc.dictionary.getGUIString("lblQuickFinish"));
        lblQuickFinish.scale = 0.75;

        var self = this;
        btnClose.registerTouchEvent(function(){
            self.close();
        });
        btnBattle._soundId = res.sound_ui_button_start_battle;
        btnBattle.registerTouchEvent(function(){
            bb.sound.stopMusic();
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.fightChallengeStage(stageIndex,function(result){
                mc.view_utility.hideLoadingDialogById(loadingId);
                if( result ){
                    mc.GameData.guiState.setCurrentSuggestFriendHeroId(null);
                    mc.GameData.guiState.setCurrentSlotReplaceFriendHero(null);
                    mc.GUIFactory.showChallengeBattleScreen();
                }
            }.bind(this));
            mc.GameData.tutorialManager.submitTutorialDoneById(mc.TutorialManager.ID_CHALLENGE);
        }.bind(this));

        var quickFinishId = null;
        btnQuickBattle.registerTouchEvent(function(){
            quickFinishId = mc.view_utility.showLoadingDialog();
            mc.protocol.quickFinishChallengeStage(stageIndex);
        });

        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = btnBattle.width*0.5;
        particle.y = btnBattle.height*0.5;
        btnBattle.addChild(particle);

        this.traceDataChange(mc.GameData.resultInBattle, function (data) {
            mc.view_utility.hideLoadingDialogById(quickFinishId);
            if (data) {
                new mc.DialogBattleEndView().show();
            }
        }.bind(this));

        this.traceDataChange(mc.GameData.challengeManager, function () {
            var groupIndex = mc.GameData.guiState.getCurrentChallengeGroupIndex();
            var allChallengeGroup = mc.GameData.challengeManager.getAllChallengeGroup();
            var challengeGroup = allChallengeGroup[groupIndex];

            var numChance = this._numChance = challengeGroup["chance"];
            if( numChance <= 0 ){
                this.close();
            }
        }.bind(this));

        btnQuickBattle.setEnabled(false);
        btnQuickBattle.setGray(true);
        lblRequireVIP.setVisible(true);
        if( mc.GameData.playerInfo.isVIP() ){
            lblRequireVIP.setVisible(false);
            btnQuickBattle.setEnabled(true);
            btnQuickBattle.setGray(false);
        }
    },

    onShow:function(){
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.DIALOG_SELECT_HERO);
        if( tutorialTrigger ){
            if( tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON ){
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnBattle)
                    .setCharPositionY(cc.winSize.height*0.7)
                    .show();
            }
        }
    }

});