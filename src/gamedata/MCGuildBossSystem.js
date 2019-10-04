/**
 * Created by long.nguyen on 10/18/2018.
 */
mc.GuildBossSystem = bb.Class.extend({
    _bossInfo: null,
    _killBosInfo: 0,
    bossStage: 1,
    bossStageComplete: 0,
    bossMap: null,
    _newHp: 0,
    _otherPlayerDamage: null,
    _endTime: 0,

    _bossArenaInfo: null,
    _bossArenaStage: -1,
    _killBossArenaInfo: 0,
    bossArenaComplete: 0,
    _endTimeBossArena: 0,

    _BOSS_TYPE: {GUILD: "guild", ARENA: "arena"},

    //boss arena

    cleanGuildBossArenaInfo: function () {
        this._bossArenaInfo = null;
        this._bossArenaStage = -1;
        this._killBossArenaInfo = 0;
        this.bossArenaComplete = 0;
        this._endTimeBossArena = 0;
    },
    setGuildBossArenaInfo: function (bossInfo) {
        this._bossArenaInfo = bossInfo;
        this._bossArenaStage = this._bossArenaInfo.stageIndex;
        //if (this._bossInfo.death) {
        //    this.bossStageComplete = this.bossStage;
        //}
        if (this._bossArenaInfo.hp === 0) {
            this.bossArenaComplete = true;
        } else {
            this.bossArenaComplete = false;
        }
        this._endTimeBossArena = this._bossArenaInfo.endTimeSeconds * 1000 + bb.now();
    },

    getGuildBossArenaComplete: function () {
        return this.bossArenaComplete;
    },

    getGuildBossArenaInfo: function () {
        return this._bossArenaInfo;
    },

    getCurrArenaBossHp: function () {
        if (this._bossArenaInfo) {
            return this._bossArenaInfo.hp
        }
        return 0;
    },

    getArenaBoss: function () {
        if (this._bossArenaStage < 0) {
            return null;
        }
        if (!this.bossMap) {
            this.bossMap = bb.utility.arrayToMap(mc.dictionary.guildBossData, function (child) {
                return child["stageIndex"];
            });
        }
        return this.bossMap[this._bossArenaStage];
    },

    getArenaBossStage: function () {
        return this._bossArenaStage;
    },

    getArenaBossEndTime: function () {
        if (this._bossArenaInfo) {
            return this._endTimeBossArena;
        }
        return 0;
    },


    //kill boss arena

    setKillBossArenaInfo: function (killBossArenaInfo) {
        this._killBossArenaInfo = killBossArenaInfo;
        this.cleanAllStatusCreature();
        this.updateAllStatusCreature(killBossArenaInfo["properties"]);
    },

    getKillBossAreanInfo: function () {
        return this._killBossArenaInfo;
    },

    setBossArenaReviveCountDownSeconds: function (seconds) {
        this._bossArenaReviveCountDownSeconds = seconds;
    },

    getBossArenaReviveCountDownSeconds: function () {
        return this._bossArenaReviveCountDownSeconds;
    },

    getBossArenaTicketNo: function () {
        return this._killBossArenaInfo["ticketNo"];
    },

    getBossArenaClaimedList: function () {
        if (!this._killBossArenaInfo["claimedList"]) {
            this._killBossArenaInfo["claimedList"] = [];
        }
        return this._killBossArenaInfo["claimedList"];
    },


    // boss info
    setGuildBossInfo: function (bossInfo) {
        this._bossInfo = bossInfo;
        this.bossStage = this._bossInfo.stageIndex;
        //if (this._bossInfo.death) {
        //    this.bossStageComplete = this.bossStage;
        //}
        if (this._bossInfo.hp === 0) {
            this.bossStageComplete = this.bossStage;
        } else {
            this.bossStageComplete = this.bossStage - 1;
        }
        this._endTime = this._bossInfo.endTimeSeconds * 1000 + bb.now();
    },

    getBossEndTime: function () {
        if (this._bossInfo) {
            return this._endTime;
        }
        return 0;
    },

    getCurrBossHp: function () {
        if (mc.GameData.guiState.getCurrGuildBossShow() && mc.GameData.guiState.getCurrGuildBossShow().bossType === this._BOSS_TYPE.ARENA) {
            if (this._bossArenaInfo) {
                return this._bossArenaInfo.hp
            }
        } else {
            if (this._bossInfo) {
                return this._bossInfo.hp
            }
        }

        return 0;
    },


    getBossByStage: function (stage) {
        if (!this.bossMap) {
            this.bossMap = bb.utility.arrayToMap(mc.dictionary.guildBossData, function (child) {
                return child["stageIndex"];
            });
        }
        return this.bossMap[stage];
    }
    ,


    getCurrBoss: function () {
        if (!this.bossMap) {
            this.bossMap = bb.utility.arrayToMap(mc.dictionary.guildBossData, function (child) {
                return child["stageIndex"];
            });
        }
        return this.bossMap[this.bossStage];
    }
    ,

    getCurrBossStage: function () {
        return this.bossStage;
    }
    ,
    getCurrBossStageComplete: function () {
        return this.bossStageComplete;
    }
    ,

    setNewBossHp: function (newHp) {
        this._newHp = mc.CreatureInfo.encryptNumber(newHp);
    },

    getNewBossHp: function () {
        return mc.CreatureInfo.decryptNumber(this._newHp);
    },

    setNewOtherPlayerDamage: function (damage) {
        this._otherPlayerDamage = mc.CreatureInfo.encryptNumber(damage);
    },

    getTotalOtherPlayerDamage: function () {
        return this._otherPlayerDamage ? mc.CreatureInfo.decryptNumber(this._otherPlayerDamage) : 0;
    },

    //Kill boss info

    setKillBossInfo: function (killBossInfo) {
        this._killBosInfo = killBossInfo;
        this.cleanAllStatusCreature();
        this.updateAllStatusCreature(killBossInfo["properties"]);
    },
    getKillBossInfo: function () {
        return this._killBosInfo;
    },

    setBossReviveCountDownSeconds: function (seconds) {
        this._bossReviveCountDownSeconds = seconds;
    },

    getBossReviveCountDownSeconds: function () {
        return this._bossReviveCountDownSeconds;
    },

    getTicketNo: function () {
        return this._killBosInfo["ticketNo"];
    },

    getClaimedList: function () {
        if (mc.GameData.guiState.getCurrGuildBossShow().bossType === this._BOSS_TYPE.ARENA) {
            if (!this._killBossArenaInfo["claimedList"]) {
                this._killBossArenaInfo["claimedList"] = [];
            }
            return this._killBossArenaInfo["claimedList"];
        } else {
            if (!this._killBosInfo["claimedList"]) {
                this._killBosInfo["claimedList"] = [];
            }
            return this._killBosInfo["claimedList"];
        }

    },


    //getBossInfo: function () {
    //    //return this._bossInfo;
    //    if (!this._bossMap) {
    //        this._bossMap = bb.utility.arrayToMap(mc.dictionary.guildBossData, function (child) {
    //            return child["stageIndex"];
    //        });
    //    }
    //    return this._bossMap[this._bossStage];
    //},

    // Begin Status Creature Manager Interface
    cleanAllStatusCreature: function () {
        this._mapStatusCreatureById = {};
    },

    updateAllStatusCreature: function (arrProperties) {
        this._mapStatusCreatureById = this._mapStatusCreatureById || {};
        if (arrProperties) {
            for (var i = 0; i < arrProperties.length; i++) {
                this._mapStatusCreatureById[arrProperties[i].heroId] = arrProperties[i];
            }
        }
    },

    getStatusCreatureById: function (heroId, heroIndex) {
        var status = null;
        if (this._mapStatusCreatureById) {
            status = this._mapStatusCreatureById[heroId];
        }
        if (!status) {
            status = {
                id: heroId,
                index: heroIndex,
                level: 1,
                hpPercent: 1 * mc.CreatureInfo.CAST_LONG_RATE,
                mpPercent: 0
            };
        }
        var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
        if (heroInfo && status) {
            status.level = mc.HeroStock.getHeroLevel(heroInfo);
            status.index = heroIndex || mc.HeroStock.getHeroIndex(heroInfo);
        }
        !status.mpPercent && (status.mpPercent = 0);
        return status;
    }
    // End Status Creature Manager Interface

});