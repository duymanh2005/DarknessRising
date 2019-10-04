/**
 * Created by long.nguyen on 2/27/2019.
 */
mc.BattleStatsDialog = bb.Dialog.extend({

    ctor: function (statsContainer) {
        this._super();
        var currBattle = mc.GameData.playerInfo.getCurrentPartInBattle();

        var node = ccs.load(res.widget_dialog_battle_result, "res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (element) {
            return element.getName();
        });

        var lblTitle = rootMap["lblTitle"];
        var pnlInfo = rootMap["pnlInfo"];
        var pnlPlayerL = rootMap["pnlPlayerL"];
        var pnlPlayerR = rootMap["pnlPlayerR"];
        var tabBuf = rootMap["tabBufPassive"];
        var tabDam = rootMap["tabDamPassive"];
        var tabDef = rootMap["tabDefPassive"];
        var tabBufActive = rootMap["tabBuf"];
        var tabDamActive = rootMap["tabDam"];
        var tabDefActive = rootMap["tabDef"];
        var btnClose = rootMap["btnClose"];

        tabDam.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblDamage"));
        tabDamActive.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblDamage"));
        tabDef.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblDefense"));
        tabDefActive.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblDefense"));
        tabBuf.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblSupport"));
        tabBufActive.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblSupport"));
        lblTitle.setString(mc.dictionary.getGUIString("lblBattleStatics"));
        lblTitle.setColor(mc.color.YELLOW_SOFT);

        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));
        var _selectBuf = function(){
            tabBufActive.setVisible(true);
            tabDef.setVisible(true);
            tabDam.setVisible(true);

            tabBuf.setVisible(false);
            tabDefActive.setVisible(false);
            tabDamActive.setVisible(false);
            _populateStatsDataByType("buff");
        };
        var _selectDam = function(){
            tabDamActive.setVisible(true);
            tabDef.setVisible(true);
            tabBuf.setVisible(true);

            tabDam.setVisible(false);
            tabDefActive.setVisible(false);
            tabBufActive.setVisible(false);
            _populateStatsDataByType("damage");
        };
        var _selectDef = function(){
            tabDefActive.setVisible(true);
            tabBuf.setVisible(true);
            tabDam.setVisible(true);

            tabDef.setVisible(false);
            tabBufActive.setVisible(false);
            tabDamActive.setVisible(false);
            _populateStatsDataByType("defense");
        };
        tabBuf.registerTouchEvent(function(){
            _selectBuf();
        });
        tabDam.registerTouchEvent(function(){
            _selectDam();
        });
        tabDef.registerTouchEvent(function(){
            _selectDef();
        });

        var pnlInfoMap = bb.utility.arrayToMap(pnlInfo.getChildren(), function (element) {
            return element.getName();
        });
        var pnlCell_L1 = pnlInfoMap["pnlCell_L1"];
        var pnlCell_L2 = pnlInfoMap["pnlCell_L2"];
        var pnlCell_L3 = pnlInfoMap["pnlCell_L3"];
        var pnlCell_L4 = pnlInfoMap["pnlCell_L4"];
        var pnlCell_L5 = pnlInfoMap["pnlCell_L5"];
        var pnlCell_R1 = pnlInfoMap["pnlCell_R1"];
        var pnlCell_R2 = pnlInfoMap["pnlCell_R2"];
        var pnlCell_R3 = pnlInfoMap["pnlCell_R3"];
        var pnlCell_R4 = pnlInfoMap["pnlCell_R4"];
        var pnlCell_R5 = pnlInfoMap["pnlCell_R5"];

        var arrCellR = [pnlCell_R1,pnlCell_R2,pnlCell_R3,pnlCell_R4,pnlCell_R5];
        var arrCellL = [pnlCell_L1,pnlCell_L2,pnlCell_L3,pnlCell_L4,pnlCell_L5];
        var _getStatsValueBy = function(heroId,statsType){
            if( statsType === "damage" ){
                return statsContainer.getTotalDamageByCreatureId(heroId);
            }
            else if( statsType === "defense" ){
                return statsContainer.getTotalIncurByCreatureId(heroId);
            }
            else if( statsType === "buff" ){
                return statsContainer.getTotalBuffByCreatureId(heroId);
            }
            return 1000000;
        };
        var _getStatsMaxValueByType = function(statsType){
            if( statsType === "damage" ){
                return statsContainer.getMaxStatDamage();
            }
            else if( statsType === "defense" ){
                return statsContainer.getMaxStatIncur();
            }
            else if( statsType === "buff" ){
                return statsContainer.getMaxStatBuff();
            }
            return 1000000;
        };
        var _populateStatsDataByType = function(statsType){
            for(var i = 0; i < arrPlayerCreatureInfo.length; i++ ){
                arrCellR[i].setVisible(false);
                if( arrPlayerCreatureInfo[i] ){
                    arrCellR[i].setVisible(true);
                    this._reloadCell(arrCellR[i],arrPlayerCreatureInfo[i],_getStatsValueBy(arrPlayerCreatureInfo[i].serverId,statsType),_getStatsMaxValueByType(statsType),true);
                }
            }
            for(var i = 0; i < arrOpponentCreatureInfo.length; i++ ){
                arrCellL[i].setVisible(false);
                if( arrOpponentCreatureInfo[i] ){
                    arrCellL[i].setVisible(true);
                    this._reloadCell(arrCellL[i],arrOpponentCreatureInfo[i],_getStatsValueBy(arrOpponentCreatureInfo[i].serverId,statsType),_getStatsMaxValueByType(statsType));
                }
            }
        }.bind(this);

        var _parseArrHeroInfo = function(battleTeamInfo){
            var formation = battleTeamInfo["formation"];
            var mapCreatureInfo = bb.utility.arrayToMap(battleTeamInfo["arrCreatureInfo"],function(creatureInfo){
                return creatureInfo.serverId;
            });
            var arrInfo = [];
            for(var i = 0; i < formation.length; i++ ){
                formation[i] >= 0 && arrInfo.push(mapCreatureInfo[formation[i]]);
            }
            while( arrInfo.length < 5 ){
                arrInfo.push(null);
            }
            return arrInfo;
        };
        var arrPlayerCreatureInfo = _parseArrHeroInfo(currBattle.getBattleTeamPlayerInfo());
        var arrOpponentCreatureInfo = _parseArrHeroInfo(currBattle.getBattleTeamOpponentInfo());

        this._reloadPanelPlayer(pnlPlayerL,currBattle.getBattleTeamOpponentInfo());
        this._reloadPanelPlayer(pnlPlayerR,currBattle.getBattleTeamPlayerInfo());

        _selectDam();
    },

    _reloadCell:function(cell,creatureInfo,value,maxValue,isRight){
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (element) {
            return element.getName();
        });
        var imgProgressBkr = cellMap["imgProgressBkr"];
        var lbl = cellMap["lbl"];
        var nodeAva = cellMap["nodeAva"];
        var nodeProgress = cellMap["nodeProgress"];

        lbl.setString(bb.utility.formatNumber(value));
        if( !cell._avatar ){
            var avt = cell._avatar = new mc.HeroAvatarView(mc.HeroStock.createJsonHeroInfo(creatureInfo.serverId,creatureInfo.resourceId,creatureInfo.level));
            avt.scale = 0.9;
            nodeAva.addChild(avt);
        }
        if( !cell._progress ){
            var progress = cell._progress = new cc.ProgressTimer(new cc.Sprite("#bar/Small_MP.png"));
            progress.setCascadeOpacityEnabled(true);
            progress.barChangeRate = cc.p(1.0,0.0);
            progress.midPoint = isRight ? cc.p(1.0,0.0) : cc.p(0.0,1.0);
            progress.type = cc.ProgressTimer.TYPE_BAR;
            nodeProgress.addChild(progress);
        }
        var pc = maxValue > 0 ? Math.round(value/maxValue*100) : 0;
        cell._progress.setPercentage(pc);
    },

    _reloadPanelPlayer:function(pnlPlayer,playerInfo){
        var pnlInfoMap = bb.utility.arrayToMap(pnlPlayer.getChildren(), function (element) {
            return element.getName();
        });

        var lbl = pnlInfoMap["lbl"];
        var nodeAva = pnlInfoMap["nodeAva"];
        var pnlGuild = pnlInfoMap["pnlGuild"];

        nodeAva.scale = 0.9;

        var pnlGuildMap = bb.utility.arrayToMap(pnlGuild.getChildren(), function (element) {
            return element.getName();
        });
        var flag = pnlGuildMap["flag"];
        var flag_icon = pnlGuildMap["flag_icon"];
        var lblName = pnlGuildMap["lblName"];

        var playerTeamName = bb.utility.formatWidth(playerInfo["heroName"] || "", 50, 1);
        var playerAvt = playerInfo["avatar"] || "1";

        lbl.setString(playerTeamName);
        var avt = mc.view_utility.createAvatarPlayer(parseInt(playerAvt));
        nodeAva.addChild(avt);
    }

});