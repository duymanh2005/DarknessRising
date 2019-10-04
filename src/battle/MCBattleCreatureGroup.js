/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.BattleCreatureGroup = cc.Class.extend({
    _arrCreature: null,
    _groupFormation: null,
    _attachCreature: null,

    ctor: function (creatureList, formation) {
        this._arrCreature = creatureList;
        this._groupFormation = formation;
    },

    getIdFormation: function () {
        return this._groupFormation.id;
    },

    getArrFighterIdByFormation: function () {
        return this._groupFormation.fighters;
    },

    getLeaderSlotFormation: function () {
        return this._groupFormation.leaderSlotIndex;
    },

    isAlive: function () {
        var arr = bb.collection.filterBy(this._arrCreature, mc.Creature.isAlive);
        return (arr && arr.length > 0) ? true : false;
    },

    getCreatureAt: function (index) {
        return this._arrCreature[index];
    },

    getCreatureByServerId: function (serverId) {
        return bb.collection.findBy(this._arrCreature, function (creature, serverId) {
            return creature.getServerId() === serverId;
        }, serverId);
    },

    numberOfCreature: function () {
        return this._arrCreature.length;
    },

    setAttachCreature: function (creature) {
        this._attachCreature = creature;
    },

    getAttachCreature: function () {
        return this._attachCreature;
    },

    getGroupFormation: function () {
        return this._groupFormation;
    },

    toArray: function () {
        return cc.copyArray(this._arrCreature);
    }

});
mc.BattleCreatureGroup.createFormation = function (id, arrBattleId, leaderSlotIndex) {
    return {
        id: id,
        fighters: arrBattleId,
        leaderSlotIndex: leaderSlotIndex
    }
};
mc.BattleCreatureGroup.FORMATION_5_FIGHTER = "FORMATION_5_FIGHTER";
mc.BattleCreatureGroup.FORMATION_RANDOM_BY_LENGTH = "FORMATION_RANDOM_BY_LENGTH";
mc.BattleCreatureGroup.FORMATION_BLOOD_CASTLE = "FORMATION_BLOOD_CASTLE";