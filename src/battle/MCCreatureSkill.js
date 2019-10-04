/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.CreatureSkill = cc.Class.extend({
    skillInfo: null,
    skillItemDict: null,
    _skillPriority: 0,
    _ownerId: null,
    _currCountDown: 0,

    ctor: function (owner, skillInfo) {
        this._ownerId = owner ? owner.getServerId() : null;
        var skillIndex = skillInfo.index;
        this.skillInfo = skillInfo;
        this.skillItemDict = mc.dictionary.getSkillByIndex(skillIndex);

        if (owner) {
            var skillList = null;
            var creatureDict = mc.dictionary.getCreatureDictByIndex(owner.getResourceId());
            if (creatureDict) {
                skillList = creatureDict.skillList;
            }
            if (!skillList) {
                var monsterDict = mc.dictionary.getCreatureDictByIndex(owner.getResourceId());
                if (monsterDict) {
                    var strSkill = monsterDict.skillIndex;
                    if (strSkill) {
                        skillList = [];
                        var arrStrIndex = strSkill.split('#');
                        for (var i = 0; i < arrStrIndex.length; i++) {
                            skillList.push({
                                index: parseInt(arrStrIndex[i]),
                                level: 1
                            })
                        }
                    }
                }
            }
            if (skillList) {
                for (var i = 0; i < skillList.length; i++) {
                    var skillDict = mc.dictionary.getSkillByIndex(skillList[i].index);
                    if (skillDict) {
                        if (skillDict.parentIndex === skillIndex) {
                            this._skillPriority = i;
                            break;
                        }
                    }
                }
            }
        }
    },

    countDown: function () {
        this._currCountDown++;
        if (this.isCoolDownElapsed()) {
            this._currCountDown = this.getCooldown();
        }
    },

    isCoolDownElapsed: function () {
        return this._currCountDown >= this.getCooldown();
    },

    resetCoolDown: function () {
        this._currCountDown = 0;
    },

    doMagicForTarget: function (target, retArrEffect) {
        if (!target.isStatusImmunity()) {
            var skillItemDict = this.skillItemDict;
            this._doMagic(target, skillItemDict["targetEffectIndex"], retArrEffect);
        }
    },

    doMagicForOwner: function (target) {
        if (!target.isStatusImmunity()) {
            var skillItemDict = this.skillItemDict;
            this._doMagic(target, skillItemDict["ownerEffectIndex"]);
        }
    },

    // used for trigger skills
    doMagicByBonusStats: function (target) {
        var skillItemDict = this.skillItemDict;
        if (this._ownerId === target.getServerId()) {
            this._doMagic(target, skillItemDict["ownerBonusStats"]);
        } else {
            this._doMagic(target, skillItemDict["targetBonusStats"]);
        }
    },

    _doMagic: function (creature, strEffectIndex, retArrEffect) {
        if (strEffectIndex) {
            var allEff = strEffectIndex.split('#');
            for (var e = 0; e < allEff.length; e++) {
                var strEffs = allEff[e].split('/');
                if (strEffs[0]) {
                    var max = -1;
                    var conditionParam = -1;
                    var effectId = parseInt(strEffs[0]);
                    var value = strEffs[1] ? parseInt(strEffs[1]) : 0;
                    var duration = strEffs[2] ? parseInt(strEffs[2]) : -1;
                    var maxVal = strEffs[3] ? parseInt(strEffs[3]) : -1;
                    var conditionVal = strEffs[4] ? parseInt(strEffs[4]) : -1;

                    var effect = null;
                    if (this.isItem()) {
                        var arrItemEffect = creature.getArrayStatusItemEffectSameRootSkill(effectId, this.getSkillId());
                        if (arrItemEffect && arrItemEffect.length > 0 &&
                            !(arrItemEffect[0] instanceof mc.StatsEffect) && // only Item's StatsEffect will be duplicate!
                            arrItemEffect[0].getSkillId() <= this.getSkillId()) {
                            creature.removeItemEffect(arrItemEffect[0]); // remove for applying new effect!
                        }
                        effect = mc.CreatureEffect.create(effectId, this.getSkillId(),
                            this._ownerId,
                            value,
                            duration,
                            1);
                        if (effect) {
                            effect.setSkillPriority(this._skillPriority);
                            creature.applyItemEffect(effect);
                        }
                    } else {
                        var sameEffect = creature.getStatusEffectSameRootSkill(effectId, this.getSkillId());
                        if (sameEffect && sameEffect.getSkillId() < this.getSkillId()) {
                            creature.removeEffect(sameEffect); // remove for applying new effect!
                            sameEffect = null;
                        }
                        effect = creature.getStatusEffect(effectId, this.getSkillId());
                        if (effect) {
                            effect.setEffectParameter(effectId, this.getSkillId(),
                                this._ownerId,
                                value,
                                duration,
                                1);
                            creature.renewEffect(effect);
                        }
                        if (!effect && !sameEffect) {
                            effect = mc.CreatureEffect.create(effectId, this.getSkillId(),
                                this._ownerId,
                                value,
                                duration,
                                1);
                            if (effect) {
                                effect.setSkillPriority(this._skillPriority);
                                creature.applyEffect(effect);
                            }
                        }
                    }
                    if (effect) {
                        effect.setMaxValue(maxVal);
                        effect.setConditionalValue(conditionVal);
                        retArrEffect && retArrEffect.push(effect);
                    }
                }
            }
        }
    },

    addBonusStatsForOwner: function (owner) {
        this._addBonusStats(owner, this.skillItemDict["ownerBonusStats"]);
    },

    addBonusStatsForTarget: function (target) {
        this._addBonusStats(target, this.skillItemDict["targetBonusStats"]);
    },

    _addBonusStats: function (creature, strEffectBonusStats) {
        if (strEffectBonusStats) {
            var strAllEffs = strEffectBonusStats.split('#');
            for (var i = 0; i < strAllEffs.length; i++) {
                if (strAllEffs[i]) {
                    var strEff = strAllEffs[i].split('/');
                    if (strEff[0]) {
                        var effectId = parseInt(strEff[0]);
                        var effectVal = 0;
                        if (strEff[1]) {
                            effectVal = parseInt(strEff[1]);
                        }
                        var effect = creature.getStatusEffect(effectId, this.getSkillId());
                        if (effect) {
                            effect.setEffectParameter(effectId, this.getSkillId(),
                                this._ownerId,
                                effectVal,
                                1,
                                1);
                        }
                        if (!effect) {
                            effect = mc.CreatureEffect.create(effectId, this.getSkillId(),
                                this._ownerId,
                                effectVal,
                                1,
                                1);
                            effect.setSilentEvent(true);
                            creature.applyEffect(effect);
                        }
                    }
                }
            }
        }
    },

    removeBonusStatsForOwner: function (owner) {
        this._removeBonusStats(owner, this.skillItemDict["ownerBonusStats"]);
    },

    removeBonusStatsForTarget: function (target) {
        this._removeBonusStats(target, this.skillItemDict["targetBonusStats"]);
    },

    _removeBonusStats: function (creature, strEffectBonusStats) {
        if (strEffectBonusStats) {
            var strAllEffs = strEffectBonusStats.split('#');
            for (var i = 0; i < strAllEffs.length; i++) {
                if (strAllEffs[i]) {
                    var strEff = strAllEffs[i].split('/');
                    if (strEff[0]) {
                        var effectId = parseInt(strEff[0]);
                        var skillId = this.getSkillId();
                        var buffEffect = creature.getStatusEffect(effectId, skillId);
                        buffEffect && creature.removeEffect(buffEffect);
                    }
                }
            }
        }
    },

    getSkillPriority: function () {
        return this._skillPriority;
    },

    getCooldown: function () {
        return this.skillItemDict.cooldown;
    },

    getManaCost: function () {
        return this.skillItemDict.manaCost;
    },

    isValidTarget: function (target, teamId) {
        var isValid = false;
        if (target.getTeamId() === teamId) {
            if (this.isTargetAllies() || this.isTargetSelfAndAllies()) {
                isValid = true;
            } else if (this.isTargetSelf() && (target.getServerId() === this.getOwnerId())) {
                isValid = true;
            }
        } else {
            if (this.isTargetEnemies()) {
                isValid = true;
            }
        }
        return isValid;
    },

    isValidAimTo: function (target) {
        var isValid = false;
        if (target) {
            var aimTo = this.skillItemDict["aimTo"];
            if (aimTo) {
                aimTo = aimTo.toLowerCase();
                if (aimTo === "random" ||
                    aimTo === "nearest" ||
                    aimTo === "lowhp" ||
                    aimTo === "highhp" ||
                    aimTo === target.getElement().toLowerCase() ||
                    aimTo === target.getBattleRole().toLowerCase()) {
                    isValid = true;
                } else if (aimTo === "ranger" && target.isRanger()) {
                    isValid = true;
                } else if (aimTo === "front") {
                    isValid = target.isStandingFront();
                } else if (aimTo === "back") {
                    isValid = target.isStandingBack();
                }
            }
        }
        return isValid;
    },

    sortTargetsBySkillAimTo: function (arrTarget, randomSeed) {
        var aimTo = this.getAimToCode();
        if (aimTo === "lowhp") {
            arrTarget.sort(function (cr1, cr2) {
                return cr2.getHP() / cr2.getTotalMaxHp() - cr1.getHP() / cr1.getTotalMaxHp();
            });
        } else if (aimTo === "highhp") {
            arrTarget.sort(function (cr1, cr2) {
                return cr1.getHP() / cr1.getTotalMaxHp() - cr2.getHP() / cr2.getTotalMaxHp();
            });
        } else {
            for (var i = 0; i < arrTarget.length; i++) {
                var index = bb.utility.randomInt(0, arrTarget.length - 1, randomSeed);
                var temp = arrTarget[i];
                arrTarget[i] = arrTarget[index];
                arrTarget[index] = temp;
            }
        }
        return arrTarget;
    },

    getAimToCode: function () {
        var aimTo = this.skillItemDict["aimTo"];
        return aimTo;
    },

    getNumberTargetInRegion: function () {
        var targetType = this.skillItemDict.targetType;
        return mc.const.MAP_NUMBER_TARGET_BY_REGION[targetType.toLowerCase()];
    },

    isTargetSelf: function () {
        return this.skillItemDict.affects === mc.const.SKILL_AFFECT_TYPE_SELF;
    },

    isTargetSameTeam: function () {
        return this.skillItemDict.affects === mc.const.SKILL_AFFECT_TYPE_SAME_TEAM;
    },

    isTargetAllies: function () {
        return this.skillItemDict.affects === mc.const.SKILL_AFFECT_TYPE_ALLIES;
    },

    isTargetSelfAndAllies: function () {
        return this.skillItemDict.affects === mc.const.SKILL_AFFECT_TYPE_SELF_AND_ALLIES;
    },

    isTargetEnemies: function () {
        return this.skillItemDict.affects === mc.const.SKILL_AFFECT_TYPE_ENEMIES;
    },

    getSkillType: function () {
        return this.skillItemDict.skillType;
    },

    isLeader: function () {
        return this.skillItemDict.skillType === mc.const.SKILL_TYPE_LEADER;
    },

    isActive: function () {
        return this.skillItemDict.skillType === mc.const.SKILL_TYPE_ACTIVE;
    },

    isPassive: function () {
        return this.skillItemDict.skillType === mc.const.SKILL_TYPE_PASSIVE;
    },

    isItem: function () {
        return this.skillItemDict.skillType === mc.const.SKILL_TYPE_ITEM;
    },

    isAutoCast: function () {
        return this.skillItemDict.skillType === mc.const.SKILL_TYPE_AUTO_CAST;
    },

    isSingleRegion: function () {
        return this.skillItemDict.targetType === mc.const.SKILL_TARGET_TYPE_SINGLE;
    },

    isAoeRegion: function () {
        return this.skillItemDict.targetType === mc.const.SKILL_TARGET_TYPE_AOE;
    },

    isFrontRegion: function () {
        return this.skillItemDict.targetType === mc.const.SKILL_TARGET_TYPE_AOE;
    },

    getDamageType: function () {
        return this.skillItemDict.damageType;
    },

    getArrBuffType: function () {
        if (this.skillItemDict["buffType"]) {
            return this.skillItemDict["buffType"].split('#');
        }
        return null;
    },

    getEffectChance: function () {
        var effectChance = this.skillItemDict.effectChance;
        return effectChance ? parseInt(effectChance) : 0;
    },

    getOwnerId: function () {
        return this._ownerId;
    },

    getLevel: function () {
        return this.skillInfo.level;
    },

    getSkillId: function () {
        return this.skillInfo.index;
    }

});
mc.CreatureSkill.createJsonSkill = function (index, level, itemId) {
    return {index: index, level: level};
};
mc.CreatureSkill.isSameRootSkill = function (skillIndex1, skillIndex2) {
    var skillInfo1 = mc.dictionary.getSkillByIndex(skillIndex1);
    var skillInfo2 = mc.dictionary.getSkillByIndex(skillIndex2);
    if (skillInfo1 && skillInfo2) {
        return skillInfo1["parentIndex"] === skillInfo2["parentIndex"];
    }
    return false;
};

mc.CreatureSkillManager = cc.Class.extend({
    _skillMap: null,
    _leaderSkill: null,
    _arrPassiveSkill: null,
    _arrAutoCastSkill: null,
    _owner: null,

    ctor: function (owner) {
        this._owner = owner;
        this.cleanup();
    },

    cleanup: function () {
        this._skillMap = {};
        this._arrPassiveSkill = [];
        this._arrAutoCastSkill = [];
        this._arrActiveSkill = [];
    },

    _importSkill: function (skillInfo) {
        if (!mc.HeroStock.isNullSkill(skillInfo)) {
            var skillObj = new mc.CreatureSkill(this._owner, skillInfo);
            this._skillMap[skillObj.getSkillId()] = skillObj;
            if (skillObj.isPassive() || skillObj.isItem()) {
                this._arrPassiveSkill.push(skillObj);
            } else if (skillObj.isAutoCast()) {
                this._arrAutoCastSkill.push(skillObj);
            } else if (skillObj.isActive()) {
                this._arrActiveSkill.push(skillObj);
            } else if (skillObj.isLeader()) {
                this._leaderSkill = skillObj;
            }
        }
    },

    setHeroSkill: function (arrSkillInfo) {
        if (arrSkillInfo) {
            for (var i = 0; i < arrSkillInfo.length; i++) {
                this._importSkill(arrSkillInfo[i]);
            }
        }
    },

    setItemSkill: function (arrSkillInfo) {
        if (arrSkillInfo) {
            for (var i = 0; i < arrSkillInfo.length; i++) {
                this._importSkill(arrSkillInfo[i]);
            }
        }
    },

    isUltimateSkill: function (skill) {
        if (this._arrActiveSkill && this._arrActiveSkill.length > 0) {
            return skill === this._arrActiveSkill[0];
        }
        return false;
    },

    countDownAllSkill: function () {
        for (var i = 0; i < this._arrAutoCastSkill.length; i++) {
            this._arrAutoCastSkill[i].countDown();
        }
    },

    getArrayActiveSkill: function () {
        return this._arrActiveSkill;
    },

    getArrayAutoCastSkill: function () {
        return this._arrAutoCastSkill;
    },

    doPassiveMagicForOwner: function () {
        for (var i = 0; i < this._arrPassiveSkill.length; i++) {
            if (this._arrPassiveSkill[i].isValidAimTo(this._owner)) {
                this._arrPassiveSkill[i].doMagicForOwner(this._owner);
            }
        }
    },

    doLeaderMagicForTarget: function (target) {
        if (this._leaderSkill && this._leaderSkill.isValidTarget(target, this._owner.getTeamId()) && this._leaderSkill.isValidAimTo(target)) {
            this._leaderSkill.doMagicForTarget(target);
        }
    },

    doPassiveMagicForTarget: function (target) {
        for (var i = 0; i < this._arrPassiveSkill.length; i++) {
            if (this._arrPassiveSkill[i].isValidTarget(target, this._owner.getTeamId()) && this._arrPassiveSkill[i].isValidAimTo(target)) {
                this._arrPassiveSkill[i].doMagicForTarget(target);
            }
        }
    }

});