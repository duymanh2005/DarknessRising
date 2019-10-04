/**
 * Created by long.nguyen on 10/18/2018.
 */
mc.BonusStageBossSystem = bb.Class.extend({
    _bossInfo: null,
    _killBosInfo: 0,
    _newHp: 0,
    _otherPlayerDamage: null,
    _stage_index: 0,

    setBossInfo: function (bossInfo) {
        this._bossInfo = bossInfo;
    },

    setKillBossInfo: function (killBossInfo) {
        this._killBosInfo = killBossInfo;
        this.cleanAllStatusCreature();
        this.updateAllStatusCreature(killBossInfo["properties"]);
    },

    setBossReviveCountDownSeconds: function (seconds) {
        this._bossReviveCountDownSeconds = seconds;
    },

    getBossReviveCountDownSeconds: function () {
        return this._bossReviveCountDownSeconds;
    },

    setStageIndex: function (stageIndex) {
        this._stage_index = stageIndex;
    },

    getStageIndex: function () {
        return this._stage_index;
    },

    getBossInfo: function () {
        return this._bossInfo;
    },

    setNewBossHp: function (newHp) {
        this._newHp = mc.CreatureInfo.encryptNumber(newHp);
    },

    setNewOtherPlayerDamage: function (damage) {
        this._otherPlayerDamage = mc.CreatureInfo.encryptNumber(damage);
    },

    getNewBossHp: function () {
        return mc.CreatureInfo.decryptNumber(this._newHp);
    },

    getTotalOtherPlayerDamage: function () {
        return this._otherPlayerDamage ? mc.CreatureInfo.decryptNumber(this._otherPlayerDamage) : 0;
    },

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