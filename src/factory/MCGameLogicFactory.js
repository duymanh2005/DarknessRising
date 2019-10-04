/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.GameLogicFactory = (function () {

    var generatorBattleId = 0;
    var factory = {};
    factory.createCreature = function (creatureDes) {
        var creature = new mc.Creature();
        creature.battleId = creatureDes.battleId;
        creature.setInfo(creatureDes.info);
        return creature;
    };

    factory.createCurrentMonsterGroupForStage = function (stage) {
        var round = stage.getCurrentRoundData();
        var arrMonster = [];
        for (var i = 0; i < round.length; i++) {
            var monsterId = round[i];
            var creature = factory.createCreature({
                battleId: ++generatorBattleId,
                info: stage.getMonsterByIndex(monsterId)
            }).setContainCrystal(true);
            arrMonster.push(creature);
            creature.setEnableAvatar(false);
            if (creature.isBoss()) {
                creature.setTeamLeader(true);
            }
        }
        var group1 = new mc.BattleCreatureGroup(arrMonster, mc.BattleCreatureGroup.createFormation(
            mc.BattleCreatureGroup.FORMATION_RANDOM_BY_LENGTH,
            bb.utility.arrayAttr(arrMonster, 'battleId'),
            -1));
        return group1;
    };

    factory.createBattleForStage = function (stage, currTeamId, isCreateBattleField) {
        var teamFormation = mc.GameData.teamFormationManager;
        var teamId = currTeamId || mc.TeamFormationManager.TEAM_CAMPAIGN;
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var teamByHeroId = teamFormation.getTeamFormationByIndex(teamId, teamIndex);
        var leaderHeroIndex = teamFormation.getLeaderFormationByIndex(teamId, teamIndex);
        var formationByBattleId = [-1, -1, -1, -1, -1];
        var arrHeroCreature = [null, null, null, null, null];
        var arrOwnerCreatureInfo = stage.getArrayOwnerCreatureInfo();
        var leaderCreature = null;
        var mapCreatureByServerId = {};
        for (var i = 0; i < arrOwnerCreatureInfo.length; i++) {
            var battleId = ++generatorBattleId;
            var info = arrOwnerCreatureInfo[i];
            var heroCreature = factory.createCreature({
                battleId: battleId,
                info: info
            });
            mapCreatureByServerId[info.serverId] = heroCreature;
        }
        var replaceHeroIdBySlotId = stage.getReplaceHeroIdBySlotId();
        for (var h = 0; h < teamByHeroId.length; h++) {
            var heroId = teamByHeroId[h];
            var heroCreature = mapCreatureByServerId[heroId];
            if (replaceHeroIdBySlotId && replaceHeroIdBySlotId[h]) {
                heroId = replaceHeroIdBySlotId[h];
                heroCreature = mapCreatureByServerId[heroId];
            }
            if (heroCreature) {
                arrHeroCreature[h] = heroCreature;
                formationByBattleId[h] = heroCreature.battleId;
            }
            if (leaderHeroIndex === h) {
                leaderCreature = heroCreature;
                leaderCreature && leaderCreature.setTeamLeader(true);
            }
        }
        for (var i = arrHeroCreature.length - 1; i >= 0; i--) {
            if (!arrHeroCreature[i]) {
                arrHeroCreature.splice(i, 1);
            }
        }
        var group2 = new mc.BattleCreatureGroup(arrHeroCreature, mc.BattleCreatureGroup.createFormation(
            mc.BattleCreatureGroup.FORMATION_5_FIGHTER,
            formationByBattleId,
            teamFormation.getLeaderFormationByIndex(teamId, teamIndex)));
        var group1 = factory.createCurrentMonsterGroupForStage(stage);

        if (!isCreateBattleField) {
            var environment = new mc.BattleEnvinronment(stage.getBackgroundURL());
            return new mc.BattleViewRefactor(group1, group2, stage.getPlayerTeamSide(), environment);
        }
        var battleField = new mc.BattleFieldRefactor(stage.getPlayerTeamSide(), bb.now());
        battleField.addGroup(group1, mc.const.TEAM_LEFT);
        battleField.addGroup(group2, mc.const.TEAM_RIGHT);
        battleField.setMaxBattleDurationInMs(stage.getMaxBattleDurationInMs());
        return battleField;
    };

    factory.createCreatureGroup = function (groupInfo) {
        var arrHeroInfo = groupInfo.arrCreatureInfo;
        var formationByHeroId = groupInfo.formation;
        var leaderIndex = groupInfo.leaderIndex;
        var formationByBattleId = [-1, -1, -1, -1, -1];
        var arrCreature = [null, null, null, null, null];
        var leaderHero = null;
        for (var i = 0; i < arrHeroInfo.length; i++) {
            var battleId = ++generatorBattleId;
            var hInfo = arrHeroInfo[i];
            var creature = factory.createCreature({
                battleId: battleId,
                info: hInfo
            }).setContainCrystal(true);
            for (var h = 0; h < formationByHeroId.length; h++) {
                if (formationByHeroId[h] === hInfo.serverId) {
                    formationByBattleId[h] = battleId;
                    arrCreature[h] = creature;
                    if (leaderIndex === h) {
                        leaderHero = creature;
                        leaderHero.setTeamLeader(true);
                    }
                    break;
                }
            }
        }
        for (var i = arrCreature.length - 1; i >= 0; i--) {
            if (!arrCreature[i]) {
                arrCreature.splice(i, 1);
            }
        }
        return new mc.BattleCreatureGroup(arrCreature, mc.BattleCreatureGroup.createFormation(
            mc.BattleCreatureGroup.FORMATION_5_FIGHTER,
            formationByBattleId,
            leaderIndex));
    };

    factory.createBattleViewRefactorForAbstractBattle = function (abstractBattle, environment, randomSeed) {
        var heroOpponentInfo = abstractBattle.getBattleTeamOpponentInfo();
        var heroPlayerInfo = abstractBattle.getBattleTeamPlayerInfo();
        var groupOpponent = factory.createCreatureGroup(heroOpponentInfo);
        var groupPlayer = factory.createCreatureGroup(heroPlayerInfo);
        var playerTeamSide = abstractBattle.getPlayerTeamSide();
        var groupLeft = playerTeamSide === mc.const.TEAM_LEFT ? groupPlayer : groupOpponent;
        var groupRight = playerTeamSide === mc.const.TEAM_RIGHT ? groupPlayer : groupOpponent;
        return new mc.BattleViewRefactor(groupLeft, groupRight, playerTeamSide, environment, randomSeed);
    };

    return factory;
}());