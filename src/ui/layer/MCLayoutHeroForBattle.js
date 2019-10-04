/**
 * Created by long.nguyen on 8/22/2017.
 */
mc.LayoutHeroForBattle = cc.Class.extend({

    _init:function(node){
        if( !mc.LayoutHeroForBattle._mapPosition ){
            var node = node || ccs.load(res.widget_layout_hero_for_battle,"res/").node;
            var mapNode = bb.utility.arrayToMap(node.getChildren(), function (child) {
                return child.getName();
            });

            var mapPosition = mc.LayoutHeroForBattle._mapPosition = {};
            for(var key in mapNode ){
                var containerNode = mapNode[key];
                var strs = key.split('_');
                var numMember = parseInt(strs[0]);
                var caseId = parseInt(strs[1]);
                var patternMap = mapPosition[numMember];
                if( !mapPosition[numMember] ){
                    mapPosition[numMember] = patternMap ={};
                }
                var pattern = patternMap[caseId];
                if( !pattern ){
                    patternMap[caseId] = pattern = {};
                    var childs = containerNode.getChildren();
                    for(var c = 0; c < childs.length; c++ ){
                        var name = childs[c].getName();
                        pattern[name] = cc.p(childs[c].x,childs[c].y);
                    }
                }
            }
        }
    },

    _randomPattern:function(patternMap){

        return bb.utility.randomElement(arrPattern);
    },

    layoutArrayHero:function(teamId,creatureGroup){
        this._init();
        var arrCreature = creatureGroup.toArray();
        var mapCreatureByBattleId = bb.utility.arrayToMap(arrCreature,function(creature){
            return creature.battleId;
        });

        var mapPosition = mc.LayoutHeroForBattle._mapPosition;
        var pattern = null;
        var idFormation = creatureGroup.getIdFormation();
        if( idFormation === mc.BattleCreatureGroup.FORMATION_5_FIGHTER){
            pattern = mapPosition["5"]["1"];
        }
        else if( idFormation === mc.BattleCreatureGroup.FORMATION_RANDOM_BY_LENGTH ){
            var lengthId = 5;
            var patternMap = mapPosition[lengthId];
            var arrPattern = [];
            for(var caseId in patternMap ){
                arrPattern.push(patternMap[caseId]);
            }
            pattern = bb.utility.randomElement(arrPattern);
        }
        else if( idFormation === mc.BattleCreatureGroup.FORMATION_BLOOD_CASTLE ){
            pattern = mapPosition["4"]["2"];
        }

        var arrFighterIdByFormation = creatureGroup.getArrFighterIdByFormation();
        for(var f = 0; f < arrFighterIdByFormation.length; f++ ){
            var fighterId = arrFighterIdByFormation[f];
            var pos = pattern[(f+1)];
            var cr = mapCreatureByBattleId[fighterId];
            if( cr && pos ){
                var x = pos.x;
                var y = pos.y;
                if( teamId === mc.const.TEAM_LEFT ){
                    x = cc.winSize.width - pos.x;
                }
                cr.setIndexFormatPosition(f);
                cr.setBattleCellPosition(x,y);
                cc.log(cc.formatStr("%s stand at %d,%d",cr.getName(),cr.colBattleCell,cr.rowBattleCell));
            }
        }
        var attachCreature = creatureGroup.getAttachCreature();
        if( attachCreature ){
            var cr = mapCreatureByBattleId[attachCreature.battleId];
            if( cr){
                var x = 525;
                var y = 1100;
                if( teamId === mc.const.TEAM_LEFT ){
                    x = cc.winSize.width - pos.x;
                }
                cr.setBattleCellPosition(x,y);
            }
        }
    }

});
mc.LayoutHeroForBattle = new mc.LayoutHeroForBattle();
mc.LayoutHeroForBattle._mapPosition = null;