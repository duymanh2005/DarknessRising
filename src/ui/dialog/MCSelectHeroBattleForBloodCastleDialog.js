/**
 * Created by long.nguyen on 5/25/2019.
 */
mc.SelectHeroBattleForBloodCastleDialog = bb.Dialog.extend({
    _mapHeroAvtById:null,
    _mapBtnChangeById:null,

    ctor:function(){
        this._super();

        var node = ccs.load(res.widget_select_battle_blood_castle,"res/").node;
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
        var nodeSkill = rootMap["nodeSkill"];
        var btnBattle = this._btnBattle = rootMap["btnBattle"];
        var lblRequireVIP = rootMap["lblRequireVIP"];
        var btnQuickBattle = rootMap["btnQuickBattle"]
        var btnClose = rootMap["btnClose"];
        var bg_rewards = rootMap["bg_rewards"];
        var listReward = bg_rewards.getChildByName("rewards");
        var cell = rootMap["cell"];
        cell.setVisible(false);
        nodeHero.scale = 0.965;
        btnBattle.x = root.width*0.5;

        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.TeamFormationManager.TEAM_BLOODCASTLE;
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var heroStock = mc.GameData.heroStock;
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_BLOODCASTLE);

        if(mc.enableReplaceFontBM())
        {
            lblLeaderSkillInfo = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeaderSkillInfo);
            lblRequireVIP = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRequireVIP);
        }
        lblLeaderSkillInfo.setColor(mc.color.BROWN_SOFT);

        var dataTeam = {
            arrTeamFormation:teamFormationManager.getTeamFormationByIndex(teamId,teamIndex),
            leaderIndex:teamFormationManager.getLeaderFormationByIndex(teamId,teamIndex),
            mapHeroInfo:heroStock.getHeroMap(),
            statusCreatureManager:mc.GameData.bloodCastleManager
        };
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

        var currLvl = mc.GameData.guiState.getCurrentSelectBloodCastleLevel();
        var arrBloodCastleStageData = mc.dictionary.getArrayBloodCastleStageDataByLevelIndex(currLvl);
        for(var i = 0; i < arrBloodCastleStageData.length ; i++ ){
            listReward.pushBackCustomItem(this._createRewardByWave(cell.clone(),arrBloodCastleStageData[i],i));
        }

        if(mc.enableReplaceFontBM())
        {
            lblTeam = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblTeam);
            lblReward = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblReward);
        }

        lblTeam.setColor(mc.color.BROWN_SOFT);
        lblReward.setColor(mc.color.BROWN_SOFT);
        lblReward.setString(mc.dictionary.getGUIString("lblRewards"));
        lblTeam.setString(mc.dictionary.getGUIString("lblBattleTeam"));

        lblRequireVIP.setString(mc.dictionary.getGUIString("lblRequireVIP"));
        lblRequireVIP.setColor(mc.color.RED);


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
            mc.protocol.fightBloodCastleStage(currLvl,function(result){
                mc.view_utility.hideLoadingDialogById(loadingId);
                if( result ){
                    mc.GUIFactory.showBloodCastleBattleScreen();
                }
            }.bind(this));
        }.bind(this));

        var quickFinishId = null;
        btnQuickBattle.registerTouchEvent(function(){
        });

        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = btnBattle.width*0.5;
        particle.y = btnBattle.height*0.5;
        btnBattle.addChild(particle);

        var _checkTeam = function(){
            var arrHeroId = teamFormationManager.getTeamFormationByIndex(teamId,teamIndex);
            var isSetUpTeam = false;
            if( arrHeroId ){
                for(var i = 0; i < arrHeroId.length; i++ ){
                    if( arrHeroId[i] > 0 ){
                        isSetUpTeam = true;
                        break;
                    }
                }
            }
            if( !isSetUpTeam ){
                btnBattle.setGray(true);
                btnBattle.setEnabled(false);
            }
            else{
                btnBattle.setGray(false);
                btnBattle.setEnabled(true);
            }
        };
        _checkTeam();

        this.traceDataChange(mc.GameData.resultInBattle, function (data) {
            mc.view_utility.hideLoadingDialogById(quickFinishId);
            if (data) {
                new mc.DialogBattleEndView().show();
            }
        }.bind(this));

        this.traceDataChange(mc.GameData.bloodCastleManager, function () {
            var numChance = this._numChance = mc.GameData.bloodCastleManager.getNumberOfChance();
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
        btnQuickBattle.setVisible(false);
        lblRequireVIP.setVisible(false);
    },

    _createRewardByWave:function(cell,waveData,index){
        var cellMap = bb.utility.arrayToMap(cell.getChildren(),function(child){
            return child.getName();
        });

        var lblLevel = cellMap["lblLevel"];
        var icon = cellMap["icon"];

        lblLevel.setString(mc.dictionary.getGUIString("lblWave")+" "+(index+1) );

        var arrRewards = mc.ItemStock.createArrJsonItemFromStr(waveData["reward"]);
        var layoutReward = bb.layout.linear(bb.collection.createArray(arrRewards.length,function(index){
            var itemView = new mc.ItemView(arrRewards[index]).registerViewItemInfo();
            itemView.setSwallowTouches(false);
            return itemView;
        }),10);
        var wrapWidget = mc.view_utility.wrapWidget(layoutReward,598,false,{top:12,bottom:12});
        cell.addChild(wrapWidget);
        cell.setVisible(true);
        wrapWidget.anchorX = 0;
        wrapWidget.scale = 0.75;
        wrapWidget.x = cell.width*0.25;
        wrapWidget.y = cell.height*0.5;
        return cell;
    }

});