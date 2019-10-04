/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.CreatureEffect = cc.Class.extend({
    effectId: null,
    skillId: null,
    effectOwnerId: null,
    effectValue: null,
    effectLevel: null,
    effectTimes: 0, // forever
    effectGroupTimes: 0,
    maxValue: -1,
    conditionalValue: -1,
    _totalDuration: 0,
    isPassATurnCountDown: false,
    _isRemove: false,
    _isSilentEvent: false,

    setEffectParameter: function (effectId, skillId, effectOwnerId, effectValue, effectTime, effectLevel) {
        this.effectId = effectId;
        this.skillId = skillId;
        this.effectOwnerId = effectOwnerId;
        this.effectValue = effectValue;
        this.effectTimes = effectTime || this.effectTimes;
        this._totalDuration = this.effectTimes;
        this.effectLevel = effectLevel;
        this._isRemove = false;
    },

    setMaxValue: function (val) {
        this.maxValue = val;
    },

    getMaxValue: function () {
        return this.maxValue;
    },

    setConditionalValue: function (val) {
        this.conditionalValue = val;
    },

    getConditionalValue: function () {
        return this.conditionalValue;
    },

    setSilentEvent: function (isSilentEvent) {
        this._isSilentEvent = isSilentEvent;
    },

    getOwnerId: function () {
        return this.effectOwnerId;
    },

    isSilentEvent: function () {
        return this._isSilentEvent;
    },

    setSkillPriority: function (skillPriority) {
        this._skillPriority = skillPriority;
    },

    getSkillPriority: function () {
        return this._skillPriority;
    },

    setTimes: function (times) {
        this.effectGroupTimes = 0;
        this.effectTimes = times;
    },

    setEquationKey: function (equationKey) {
        this.equationKey = equationKey;
    },

    getEquationKey: function () {
        return this.equationKey;
    },

    setGroupTimes: function (groupTimes) {
        this.effectTimes = 0;
        this.effectGroupTimes = groupTimes;
        return this;
    },

    getTotalEffectValue: function () {
        return this.effectValue;
    },

    setDeltaEffectValue: function (deltaValue) {
        this._deltaEffectValue = deltaValue;
        return deltaValue;
    },

    getDeltaEffectValue: function () {
        if (this._deltaEffectValue != undefined) {
            return this._deltaEffectValue;
        }
        return this.getTotalEffectValue();
    },

    onEnterEffect: function (effectManager, creature) {
    },

    isUpdateEffect: function (effectManager, creature) {
        return false;
    },

    isLateUpdateEffect: function (effectManager, creature) {
        return false;
    },

    onCountDown: function (effectManager, creature) {
        var isCount = false;
        if (this.effectTimes > 0 && !this.isPassATurnCountDown) {
            this.effectTimes--;
            if (this.effectTimes <= 0) {
                effectManager.removeEffect(this, creature);
                effectManager.removeItemEffect(this, creature);
            }
            isCount = true;
        }
        this.isPassATurnCountDown = false;
        return isCount;
    },

    onExitEffect: function (effectManager, creature) {
    },

    getSkillId: function () {
        return this.skillId;
    },

    getEffectId: function () {
        return this.effectId;
    },

    getEffectTimes: function () {
        return this.effectTimes;
    },

    getTotalDuration: function () {
        return this._totalDuration;
    },

    isElapsed: function () {
        return this.effectTimes < this._totalDuration;
    },

    isRemoved: function () {
        return this._isRemove;
    }

});

mc.CreatureEffect.MAP_KEY_ATTRIBUTE = {
    "atk": "atk",
    "mag": "mag",
    "spd": "spd",
    "def": "def",
    "res": "res",
    "shield": "shd"
};

mc.CreatureEffect.isTransformEffect = function (effect) {
    return effect.getEffectId() === mc.const.BATTLE_EFFECT_HEX;
};

mc.StatsEffect = mc.CreatureEffect.extend({
    _deltaAttribute: 0,

    onEnterEffect: function (effectManager, creature) {
        var eff = mc.dictionary.getEffectByIndex(this.getEffectId());
        if (eff) {
            var key = eff["effectTo"];
            var oldVal = null;
            if (!this.isSilentEvent()) {
                var keyAttributeName = this._getKeyAttributeName();
                keyAttributeName && (oldVal = creature.getValueAttributeByKey(keyAttributeName));
            }
            creature[key] += this.getTotalEffectValue();
            if (oldVal != null) {
                var newVal = creature.getValueAttributeByKey(keyAttributeName);
                this._keyAttribute = mc.CreatureEffect.MAP_KEY_ATTRIBUTE[keyAttributeName];
                this._deltaAttribute = Math.round(newVal - oldVal);
            }
        }
    },

    onExitEffect: function (effectManager, creature) {
        var eff = mc.dictionary.getEffectByIndex(this.getEffectId());
        if (eff) {
            var name = eff["effectTo"];
            creature[name] -= this.getTotalEffectValue();
        }
    },

    getAttributeInfo: function () {
        return (this._keyAttribute != null) ? {
            keyAttr: this._keyAttribute,
            valueAttr: this._deltaAttribute
        } : null;
    },

    _getKeyAttributeName: function () {
        var eff = mc.dictionary.getEffectByIndex(this.getEffectId());
        var key = null;
        if (eff) {
            var name = eff["effectTo"];
            var arrAttr = ["ATK", "MAG", "DEF", "RES", "SPD", "Shield"];
            for (var i = 0; i < arrAttr.length; i++) {
                if (name.search(arrAttr[i]) > 0) {
                    key = arrAttr[i];
                    break;
                }
            }
        }
        return key ? key.toLowerCase() : null;
    }

});

mc.UpdatePerTurnEffect = mc.CreatureEffect.extend({

    isUpdateEffect: function (effectManager, creature) {
        return true;
    }

});

mc.SpecialEffect = mc.CreatureEffect.extend({

    onEnterEffect: function (effectManager, creature) {
        var eff = mc.dictionary.getEffectByIndex(this.getEffectId());
        if (eff) {
            var name = eff["name"];
            if (creature[name + "Count"] === undefined) {
                creature[name + "Count"] = 0;
            }
            creature[name + "Count"]++;
        }
    },

    onExitEffect: function (effectManager, creature) {
        var eff = mc.dictionary.getEffectByIndex(this.getEffectId());
        if (eff) {
            var name = eff["name"];
            creature[name + "Count"]--;
        }
    }

});

mc.PointToSkillEffect = mc.CreatureEffect.extend({

    onEnterEffect: function (effectManager, creature) {
        var eff = mc.dictionary.getEffectByIndex(this.getEffectId());
        if (eff) {
            var name = eff["name"];
            if (!creature[name]) {
                creature[name] = {};
            }
            var skillId = this.getTotalEffectValue();
            skillId && (creature[name][skillId] = this.getConditionalValue());
        }
    },

    onExitEffect: function (effectManager, creature) {
        var eff = mc.dictionary.getEffectByIndex(this.getEffectId());
        if (eff) {
            var name = eff["name"];
            if (creature[name]) {
                var skillId = this.getTotalEffectValue();
                skillId && delete creature[name][skillId];
                if (JSON.stringify(creature[name]) == '{}') {
                    creature[name] = null;
                }
            }
        }
    }

});

mc.CreatureEffect.create = function (effectId, skillId, effectOwnerId, effectValue, effectTime, effectLevel) {
    var effect = null;
    var effDict = mc.dictionary.getEffectByIndex(effectId);
    if (effDict) {
        var effCat = effDict["category"];
        if (effCat === "basic") {
            effect = new mc.StatsEffect();
        } else if (effCat === "special") {
            effect = new mc.SpecialEffect();
        } else if (effCat === "update") {
            effect = new mc.UpdatePerTurnEffect();
        } else if (effCat === "toskill") {
            effect = new mc.PointToSkillEffect();
        } else {
            cc.log(cc.formatStr("DO NOT FOUND EFFECT CATEGORY: %s of EffectId %s", effCat, effectId));
        }
    } else {
        cc.log(cc.formatStr("Effect %s of Skill %s IS NOT FOUND!", "" + effectId, "" + skillId));
    }
    if (effect) {
        effect.setEffectParameter(effectId, skillId, effectOwnerId, effectValue, effectTime, effectLevel);
        effect.setEquationKey(effDict["effectTo"]);
    }
    return effect;
};

mc.CreatureEffectManager = cc.Class.extend({
    _effectMap: null,
    _arrItemEffectMap: null,

    ctor: function () {
        this.cleanup();
    },

    cleanup: function () {
        this._effectMap = {};
        this._arrItemEffectMap = {};
    },

    _getEffectKey: function (effect) {
        return effect.getEffectId() + "_" + effect.getSkillId();
    },

    addItemEffect: function (effect, creature) {
        var key = this._getEffectKey(effect);
        !this._arrItemEffectMap[key] && (this._arrItemEffectMap[key] = []);
        this._arrItemEffectMap[key].push(effect);
        creature.isGettingTurn() && (effect.isPassATurnCountDown = true);
        effect.onEnterEffect(this, creature);
        !effect.isSilentEvent() && creature.getBattleField() && creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_ADD_STATUS_EFFECT, creature, effect);
    },

    removeItemEffect: function (effect, creature) {
        var key = this._getEffectKey(effect);
        if (this._arrItemEffectMap[key] && this._arrItemEffectMap[key].length > 0) {
            effect.onExitEffect(this, creature);
            cc.arrayRemoveObject(this._arrItemEffectMap[key], effect);
            (this._arrItemEffectMap[key].length == 0) && (delete this._arrItemEffectMap[key]);
            !effect.isSilentEvent() && creature.getBattleField() && creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_REMOVE_STATUS_EFFECT, creature, effect);
        }
    },

    addEffect: function (effect, creature) {
        this._effectMap[this._getEffectKey(effect)] = effect;
        creature.isGettingTurn() && (effect.isPassATurnCountDown = true);
        effect.onEnterEffect(this, creature);
        !effect.isSilentEvent() && creature.getBattleField() && creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_ADD_STATUS_EFFECT, creature, effect);
    },

    setEffect: function (effect, creature) {
        this._effectMap[this._getEffectKey(effect)] = effect;
        creature.isGettingTurn() && (effect.isPassATurnCountDown = true);
        !effect.isSilentEvent() && creature.getBattleField() && creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_ADD_STATUS_EFFECT, creature, effect);
    },

    removeEffect: function (effect, creature) {
        effect._isRemove = true;
        var effectKey = this._getEffectKey(effect);
        this._effectMap[effectKey].onExitEffect(this, creature);
        this._effectMap[effectKey] = null;
        delete this._effectMap[effectKey];
        !effect.isSilentEvent() && creature.getBattleField() && creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_REMOVE_STATUS_EFFECT, creature, effect);
    },

    removeEffectWithIds: function (arrEffectId, creature) {
        for (var e = 0; e < arrEffectId.length; e++) {
            var effectId = arrEffectId[e];
            for (var key in this._effectMap) {
                var effectObj = this._effectMap[key];
                if (effectObj.getEffectId() === effectId) {
                    this.removeEffect(effectObj, creature);
                }
            }
            for (var key in this._arrItemEffectMap) {
                var effId = parseInt(key.split('_')[0]);
                if (effId == effectId) {
                    var arrItemEffect = this._arrItemEffectMap[key];
                    for (var i = 0; i < arrItemEffect.length; i++) {
                        this.removeItemEffect(arrItemEffect[i], creature);
                    }
                }
            }
        }
    },

    removeEffectIdOfSkillId: function (effectId, skillId, creature) {
        var key = effectId + "_" + skillId;
        if (this._effectMap) {
            var effObj = this._effectMap[key];
            effObj && this.removeEffect(effObj, creature);
        }
        var arrItemEffect = this._arrItemEffectMap[key];
        if (arrItemEffect) {
            for (var i = 0; i < arrItemEffect.length; i++) {
                this.removeItemEffect(arrItemEffect[i], creature);
            }
        }
    },

    getStatusEffectSameRootSkill: function (effectId, skillId) {
        var eff = null;
        for (var eId in this._effectMap) {
            var arrId = eId.split('_');
            if (parseInt(arrId[0]) === effectId) {
                if (mc.CreatureSkill.isSameRootSkill(skillId, parseInt(arrId[1]))) {
                    eff = this._effectMap[eId];
                    break;
                }
            }
        }
        return eff;
    },

    getArrayStatusItemEffectSameRootSkill: function (effectId, skillId) {
        var arrEff = null;
        for (var effectKey in this._arrItemEffectMap) {
            var arrId = effectKey.split('_');
            if (parseInt(arrId[0]) === effectId) {
                if (mc.CreatureSkill.isSameRootSkill(skillId, parseInt(arrId[1]))) {
                    arrEff = this._arrItemEffectMap[effectKey];
                    break;
                }
            }
        }
        return arrEff;
    },

    getStatusEffect: function (effectId, skillId) {
        return this._effectMap[effectId + "_" + skillId];
    },

    getUpdatingEffects: function (creature) {
        var arrUpdatingEff = null;
        for (var key in this._effectMap) {
            var ret = this._effectMap[key].isUpdateEffect(this, creature);
            if (ret) {
                !arrUpdatingEff && (arrUpdatingEff = []);
                arrUpdatingEff.push(this._effectMap[key]);
            }
        }
        for (var effectKey in this._arrItemEffectMap) {
            var arrEffect = this._arrItemEffectMap[effectKey];
            for (var e = 0; e < arrEffect.length; e++) {
                var ret = arrEffect[e].isUpdateEffect(this, creature);
                if (ret) {
                    !arrUpdatingEff && (arrUpdatingEff = []);
                    arrUpdatingEff.push(arrEffect[e]);
                }
            }
        }
        return arrUpdatingEff;
    },

    getAllEffect: function () {
        var allEff = bb.utility.mapToArray(this._effectMap);
        for (var effectKey in this._arrItemEffectMap) {
            var arrEffect = this._arrItemEffectMap[effectKey];
            for (var e = 0; e < arrEffect.length; e++) {
                allEff.push(arrEffect[i]);
            }
        }
        return allEff;
    },

    cleanEffects: function (creature) {
        for (var effectKey in this._effectMap) {
            if (this._effectMap[effectKey].isRemoved()) {
                this._effectMap[effectKey].onExitEffect(this, creature);
                this._effectMap[effectKey] = null;
                delete this._effectMap[effectKey];
            }
        }
        for (var effectKey in this._arrItemEffectMap) {
            var arrEffect = this._arrItemEffectMap[effectKey];
            if (arrEffect && arrEffect.length > 0) {
                for (var e = 0; e < arrEffect.length; e++) {
                    if (arrEffect[e] && arrEffect[e].isRemoved()) {
                        arrEffect[e].onExitEffect(this, creature);
                    }
                }
                this._arrItemEffectMap[effectKey].length === 0 && delete this._arrItemEffectMap[effectKey];
            }

        }
    },

    onCountDown: function (creature) {
        var isCount = false
        for (var key in this._effectMap) {
            if (this._effectMap[key] && this._effectMap[key].onCountDown(this, creature)) {
                isCount = true;
            }
        }
        for (var effectKey in this._arrItemEffectMap) {
            var arrEffect = this._arrItemEffectMap[effectKey];
            for (var e = 0; e < arrEffect.length; e++) {
                if (arrEffect[e] && arrEffect[e].onCountDown(this, creature)) {
                    isCount = true;
                }
            }
        }
        return isCount;
    }

});