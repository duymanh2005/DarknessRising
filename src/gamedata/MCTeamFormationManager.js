/**
 * Created by long.nguyen on 11/7/2017.
 */
mc.TeamFormationManager = bb.Class.extend({
    _mapFormationById: null,

    setupTeamFormation: function (teamId, arrFormationData) {
        if (!this._mapFormationById) {
            this._mapFormationById = {};
        }
        this._mapFormationById[teamId] = arrFormationData;
    },

    _setupByJSON: function (teamId, json) {
        json = json || {
            battleTeam: [-1, -1, -1, -1, -1],
            leaderIndex: 0
        };
        this.setupTeamFormation(teamId, [{
            heroes: json["battleTeam"] || json["heroes"] || [-1, -1, -1, -1, -1],
            leader_index: json["leaderIndex"] || json["leader_index"] || 0
        }]);
    },

    setupTutorialTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_TUTORIAL, json);
    },

    setupCampaignTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_CAMPAIGN, json);
    },

    setupChaosCastleTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_CHAOSCASTLE, json);
    },

    setupIllusionTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_ILLUSION, json);
    },

    setupWorldBossTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_WORLD_BOSS, json);
    },

    setupGuildBossTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_GUILD_BOSS, json);
    },

    setupGuildArenaBossTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_GUILD_BOSS_ARENA, json);
    },

    setupBloodCastleTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_BLOODCASTLE, json);
    },

    setupAttackArenaTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_ATTACK_ARENA, json);
    },

    setupDefenseArenaTeamFormation: function (json) {
        this._setupByJSON(mc.TeamFormationManager.TEAM_DEFENSE_ARENA, json);
    },

    submitBattleTeam: function (teamId, index, arrHeroId, leaderIndex, name, callback) {
        if (teamId === mc.TeamFormationManager.TEAM_ILLUSION) {
            mc.protocol.setupIllusionCastleTeam(index, arrHeroId, leaderIndex, callback);
        }
        else if( teamId === mc.TeamFormationManager.TEAM_BLOODCASTLE ){
            mc.protocol.setupBloodCastleTeam(index, arrHeroId, leaderIndex, callback);
        }
        else if (teamId === mc.TeamFormationManager.TEAM_CAMPAIGN) {
            mc.protocol.setupCampaignTeam(index, arrHeroId, leaderIndex, name, callback);
        } else if (teamId === mc.TeamFormationManager.TEAM_ATTACK_ARENA) {
            mc.protocol.setupArenaTeam(index, arrHeroId, leaderIndex, false, callback);
        } else if (teamId === mc.TeamFormationManager.TEAM_DEFENSE_ARENA) {
            mc.protocol.setupArenaTeam(index, arrHeroId, leaderIndex, true, callback);
        } else if (teamId === mc.TeamFormationManager.TEAM_CHAOSCASTLE) {
            mc.protocol.setupChaosCastleTeam(index, arrHeroId, leaderIndex, callback);
        } else if (teamId === mc.TeamFormationManager.TEAM_WORLD_BOSS) {
            mc.protocol.setupWorldBossTeam(index, arrHeroId, leaderIndex, callback);
        } else if (teamId === mc.TeamFormationManager.TEAM_GUILD_BOSS) {
            var bossType = mc.GameData.guildBossSystem.getCurrBoss().bossType;
            var bossIndex = mc.GameData.guildBossSystem.getCurrBossStage();
            mc.protocol.setupGuildBossTeam(index, arrHeroId, leaderIndex, bossType, bossIndex, callback);
        } else if (teamId === mc.TeamFormationManager.TEAM_GUILD_BOSS_ARENA) {
            var bossType = mc.GameData.guildBossSystem.getArenaBoss().bossType;
            var bossIndex = mc.GameData.guildBossSystem.getArenaBossStage();
            mc.protocol.setupGuildBossTeam(index, arrHeroId, leaderIndex, bossType, bossIndex, callback);
        } else if (teamId === mc.TeamFormationManager.TEAM_PICKED_RELIC_ARENA) {
            //mc.protocol.setupWorldBossTeam(index, arrHeroId, leaderIndex, callback);
            var i = 10;
        }
        //else if( teamId === mc.TeamFormationManager.TEAM_BLOODCASTLE ){
        //
        //}
    },

    correctFormationAllTeams: function (teamId) {
        //var arrFormation = this._mapFormationById[teamId];
        //for(var i = 0; i < arrFormation.length; i++ ){
        //    this._correctFormatTeams(teamId,i);
        //}
    },

    _correctFormatTeams: function (teamId, teamIndex) {
        teamId = teamId || mc.TeamFormationManager.TEAM_CAMPAIGN;
        teamIndex = teamIndex || 0;
        var arrHeroId = this.getTeamFormationByIndex(teamId, teamIndex);
        var leaderIndex = this.getLeaderFormationByIndex(teamId, teamIndex);
        var isHaveLeader = true;
        if (leaderIndex >= 0 && leaderIndex < arrHeroId.length) {
            isHaveLeader = mc.GameData.heroStock.getHeroById(arrHeroId[leaderIndex]) != null;
        }
        var newArrHeroId = [];
        for (var i = 0; i < arrHeroId.length; i++) {
            if (arrHeroId[i] != -1) {
                var heroInfo = mc.GameData.heroStock.getHeroById(arrHeroId[i]);
                if (!heroInfo) {
                    newArrHeroId.push(arrHeroId[i]);
                } else if (!isHaveLeader) {
                    newArrHeroId.push(arrHeroId[i]);
                }
            }
        }
        if (newArrHeroId.length > 0) { // need correct format teams.
            while (newArrHeroId.length < 5) {
                newArrHeroId.push(-1);
            }
            this.submitBattleTeam(teamId, teamIndex, newArrHeroId);
        }
    },

    getTeamFormationByCreatureObject: function (teamId, teamIndex) {
        var arrFormation = this.getTeamFormationByIndex(teamId, teamIndex);
        var mapCreatureByHeroId = {};
        for (var h = 0; h < arrFormation.length; h++) {
            if (arrFormation[h] >= 0) {
                mapCreatureByHeroId[arrFormation[h]] = mc.GameLogicFactory.createCreature({
                    battleId: arrFormation[h],
                    info: new mc.CreatureInfo().copyHeroInfo(mc.GameData.heroStock.getHeroById(arrFormation[h]))
                })
            }
        }
        return mapCreatureByHeroId;
    },

    getTeamFormationByIndex: function (teamId, teamIndex) {
        teamId = teamId || mc.TeamFormationManager.TEAM_CAMPAIGN;
        teamIndex = teamIndex || 0;
        if (!this._mapFormationById[teamId]) {
            this._mapFormationById[teamId] = [];
        }
        var formation = this._mapFormationById[teamId][teamIndex];
        return formation ? formation.heroes : [-1,-1,-1,-1,-1];
    },

    getLeaderFormationByIndex: function (teamId, teamIndex) {
        teamId = teamId || mc.TeamFormationManager.TEAM_CAMPAIGN;
        teamIndex = teamIndex || 0;
        var formation = this._mapFormationById[teamId][teamIndex];
        return formation.leader_index;
    },

    getRoleInFormationByHeroId: function (heroId, teamId, teamIndex) {
        teamId = teamId || mc.TeamFormationManager.TEAM_CAMPAIGN;
        teamIndex = teamIndex || 0;
        var heroStock = mc.GameData.heroStock;
        var leaderSlot = this.getLeaderFormationByIndex(teamId, teamIndex);
        var arrHeroIds = this.getTeamFormationByIndex(teamId, teamIndex);
        var role = null;
        for (var i = 0; i < arrHeroIds.length; i++) {
            if (arrHeroIds[i] === heroId) {
                var heroInfo = heroStock.getHeroById(arrHeroIds[i]);
                if (heroInfo) {
                    role = (leaderSlot === i) ? "leader" : "party";
                    break;
                }
            }
        }
        return role;
    },

    getMapHeroIdInFormation: function (teamId) {
        var mapHeroId = {};
        var _fillHeroIdByTeamId = function (teamId) {
            var formation = this._mapFormationById[teamId][0];
            var arrHeroId = formation.heroes;
            for (var i = 0; i < arrHeroId.length; i++) {
                var heroId = arrHeroId[i];
                if (heroId >= 0 && !mapHeroId[heroId]) {
                    mapHeroId[heroId] = teamId;
                }
            }
        }.bind(this);
        if (!teamId) {
            for (var teamId in this._mapFormationById) {
                _fillHeroIdByTeamId(teamId);
            }
        } else {
            _fillHeroIdByTeamId(teamId);
        }
        return mapHeroId;
    },

    getPowerByTeamIndex: function (teamId, teamIndex) {
        teamId = teamId || mc.TeamFormationManager.TEAM_CAMPAIGN;
        teamIndex = teamIndex || 0;
        var arrHeroInfo = [];
        var arrHeroId = this.getTeamFormationByIndex(teamId, teamIndex);
        var heroStock = mc.GameData.heroStock;
        for (var i = 0; i < arrHeroId.length; i++) {
            if (arrHeroId[i] >= 0) {
                var heroInfo = heroStock.getHeroById(arrHeroId[i]);
                if (heroInfo) {
                    arrHeroInfo.push(heroInfo);
                }
            }
        }
        return mc.HeroStock.getBattlePowerForArrHero(arrHeroInfo);
    }

});

mc.TeamFormationManager.TEAM_CAMPAIGN = "team_campaign";
mc.TeamFormationManager.TEAM_ATTACK_ARENA = "team_attack_arena";
mc.TeamFormationManager.TEAM_DEFENSE_ARENA = "team_defense_arena";
mc.TeamFormationManager.TEAM_BLOODCASTLE = "team_bloodcastle";
mc.TeamFormationManager.TEAM_CHAOSCASTLE = "team_chaoscastle";
mc.TeamFormationManager.TEAM_TUTORIAL = "team_tutorial";
mc.TeamFormationManager.TEAM_WORLD_BOSS = "team_boss";
mc.TeamFormationManager.TEAM_GUILD_BOSS = "team_guild_boss";
mc.TeamFormationManager.TEAM_GUILD_BOSS_ARENA = "team_guild_boss_arena";
mc.TeamFormationManager.TEAM_PICKED_RELIC_ARENA = "team_picked_relic_arena";
mc.TeamFormationManager.TEAM_ILLUSION = "team_illusion";
