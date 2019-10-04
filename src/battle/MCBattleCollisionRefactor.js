/**
 * Created by long.nguyen on 1/15/2018.
 */
var ELEMENTAL_PENALTY_RATE = {};
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_FIRE] = {};
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_WATER] = {};
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_EARTH] = {};
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_DARK] = {};
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_LIGHT] = {};

ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_FIRE][mc.const.ELEMENT_FIRE] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_FIRE][mc.const.ELEMENT_WATER] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_FIRE][mc.const.ELEMENT_EARTH] = 120;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_FIRE][mc.const.ELEMENT_DARK] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_FIRE][mc.const.ELEMENT_LIGHT] = 120;

ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_WATER][mc.const.ELEMENT_FIRE] = 120;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_WATER][mc.const.ELEMENT_WATER] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_WATER][mc.const.ELEMENT_EARTH] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_WATER][mc.const.ELEMENT_DARK] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_WATER][mc.const.ELEMENT_LIGHT] = 120;

ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_EARTH][mc.const.ELEMENT_FIRE] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_EARTH][mc.const.ELEMENT_WATER] = 120;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_EARTH][mc.const.ELEMENT_EARTH] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_EARTH][mc.const.ELEMENT_DARK] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_EARTH][mc.const.ELEMENT_LIGHT] = 120;

ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_DARK][mc.const.ELEMENT_FIRE] = 120;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_DARK][mc.const.ELEMENT_WATER] = 120;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_DARK][mc.const.ELEMENT_EARTH] = 120;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_DARK][mc.const.ELEMENT_DARK] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_DARK][mc.const.ELEMENT_LIGHT] = 100;

ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_LIGHT][mc.const.ELEMENT_FIRE] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_LIGHT][mc.const.ELEMENT_WATER] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_LIGHT][mc.const.ELEMENT_EARTH] = 100;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_LIGHT][mc.const.ELEMENT_DARK] = 150;
ELEMENTAL_PENALTY_RATE[mc.const.ELEMENT_LIGHT][mc.const.ELEMENT_LIGHT] = 100;

var RATE_REGEN_MP_WHEN_BE_HIT = 0.5;
var RATE_REGEN_MP_WHEN_BE_KILLER = 0.5;

mc.BattleCollisionRefactor = cc.Class.extend({

    ctor: function (owner, target, skill) {
        this._owner = owner;
        this._target = target;
        this._skill = skill;
    },

    setHitData: function (currHit, hitData) {
        this._currHit = currHit;
        this._hitData = hitData;
        return this;
    },

    setDamage: function (damage, damageType, isCrit) {
        this._damage = damage;
        this._isCrit = isCrit;
        this._damageType = damageType;
        return this;
    },

    getCurrentHit: function () {
        return this._currHit;
    },

    getHitData: function () {
        return this._hitData;
    },

    getOwner: function () {
        return this._owner;
    },

    getTarget: function () {
        return this._target;
    },

    getDamage: function () {
        return this._damage;
    },

    getDamageType: function () {
        return this._damageType;
    },

    isCritical: function () {
        return this._isCrit;
    },

    performCollision: function (battleField) {
    }

});

mc.HitCollision = mc.BattleCollisionRefactor.extend({

    performCollision: function (battleField) {
        var attacker = this._owner;
        var defender = this._target;

        var isJustDead = defender.isDead();

        var skill = this._skill;
        if (skill) {
            skill.addBonusStatsForOwner(attacker);
            skill.addBonusStatsForTarget(defender);
        }

        var hitData = this._hitData;
        var attackCount = hitData["attackCount"] || 1;
        var numTarget = attacker.getArrayAimingTarget() != null ? attacker.getArrayAimingTarget().length : 1;

        var damageType = (skill != null) ? skill.getDamageType() : attacker.getAttackType();
        !damageType && (damageType = mc.const.DAMAGE_TYPE_PHYSIC);
        var atk = 0;
        var mag = 0;
        var isExcellent = attacker.isExcellentAttack(defender.getServerId());
        var isCritical = attacker.isCriticalAttack(defender.getServerId());
        if (isExcellent) {
            isCritical = false;
            if (damageType.indexOf('atk') >= 0) {
                damageType = mc.const.DAMAGE_TYPE_PUREATK;
            } else if (damageType.indexOf('mag') >= 0) {
                damageType = mc.const.DAMAGE_TYPE_PUREMAG;
            } else {
                damageType = mc.const.DAMAGE_TYPE_PUREATK;
            }
        }
        var elementalPenaltyRate = (ELEMENTAL_PENALTY_RATE[attacker.getElement().toLowerCase()][defender.getElement().toLowerCase()] + attacker.getBonusElementalRateFor(defender)) / 100;
        var dmg = 0;
        if (damageType === mc.const.DAMAGE_TYPE_PHYSIC) {
            var totalAtk = attacker.getTotalAtk();
            var damageMultiplierAtk = defender.getDamageMultiplierAtk();
            dmg = atk = (totalAtk * damageMultiplierAtk * elementalPenaltyRate);
            dmg = dmg * (100 - defender.PercentDecreaseDamageTaken) / 100;
            dmg = defender.isPhysicImmunity() ? 0 : dmg;
            damageType = mc.const.DAMAGE_TYPE_PHYSIC;
        } else if (damageType === mc.const.DAMAGE_TYPE_MAGIC) {
            var totalMag = attacker.getTotalMag();
            var damageMultiplierMag = defender.getDamageMultiplierMag();
            dmg = mag = (totalMag * damageMultiplierMag * elementalPenaltyRate);
            dmg = dmg * (100 - defender.PercentDecreaseDamageTaken) / 100;
            dmg = defender.isMagicImmunity() ? 0 : dmg;
            damageType = mc.const.DAMAGE_TYPE_MAGIC;
        } else if (damageType === mc.const.DAMAGE_TYPE_HYBIRD) {
            var totalAtk = attacker.getTotalAtk();
            var totalMag = attacker.getTotalMag();
            totalAtk = defender.isPhysicImmunity() ? 0 : totalAtk;
            totalMag = defender.isMagicImmunity() ? 0 : totalMag;
            var damageMultiplierAtk = defender.getDamageMultiplierAtk();
            var damageMultiplierMag = defender.getDamageMultiplierMag();
            dmg = ((totalAtk * damageMultiplierAtk) + (totalMag * damageMultiplierMag)) * elementalPenaltyRate;
            dmg = dmg * (100 - defender.PercentDecreaseDamageTaken) / 100;
        } else if (damageType === mc.const.DAMAGE_TYPE_PUREATK) {
            var pureAtk = attacker.getTotalAtk() * elementalPenaltyRate;
            dmg = pureAtk + attacker.FlatDamageEXCE;
            dmg = dmg * (100 - defender.PercentDecreaseDamageTaken) / 100;
            dmg = defender.isPhysicImmunity() ? 0 : dmg;
            damageType = mc.const.DAMAGE_TYPE_PUREATK;
        } else if (damageType === mc.const.DAMAGE_TYPE_PUREMAG) {
            var pureMag = attacker.getTotalMag() * elementalPenaltyRate;
            dmg = pureMag + attacker.FlatDamageEXCE;
            dmg = dmg * (100 - defender.PercentDecreaseDamageTaken) / 100;
            dmg = defender.isMagicImmunity() ? 0 : dmg;
            damageType = mc.const.DAMAGE_TYPE_PUREMAG;
        } else if (damageType === mc.const.DAMAGE_TYPE_COMBOATKHP) {
            var totalAtk = attacker.getTotalAtk();
            var damageMultiplierAtk = defender.getDamageMultiplierAtk();
            var totalDmgAtk = (totalAtk * damageMultiplierAtk * elementalPenaltyRate);
            var costHp = defender.getTotalMaxHp() * defender.PercentHPRecovery / 100;
            dmg = totalDmgAtk + costHp;
            dmg = dmg * (100 - defender.PercentDecreaseDamageTaken) / 100;
            dmg = defender.isPhysicImmunity() ? 0 : dmg;
            dmg = (dmg > mc.const.MAX_HPD) ? mc.const.MAX_HPD : dmg;
            damageType = mc.const.DAMAGE_TYPE_PHYSIC;
        } else if (damageType === mc.const.DAMAGE_TYPE_COMBOMAGHP) {
            var totalMag = attacker.getTotalMag();
            var damageMultiplierMag = defender.getDamageMultiplierMag();
            var totalDmgMag = (totalMag * damageMultiplierMag * elementalPenaltyRate);
            var costHp = defender.getTotalMaxHp() * defender.PercentHPRecovery / 100;
            dmg = totalDmgMag + costHp;
            dmg = dmg * (100 - defender.PercentDecreaseDamageTaken) / 100;
            dmg = defender.isMagicImmunity() ? 0 : dmg;
            dmg = (dmg > mc.const.MAX_HPD) ? mc.const.MAX_HPD : dmg;
            damageType = mc.const.DAMAGE_TYPE_MAGIC;
        }

        dmg += (dmg * bb.utility.randomInt(0, 10, battleField.getRandomGenerator()) * 0.01);


        var damage = dmg * (100 + attacker.PercentDamage) / 100 + (dmg > 0 ? attacker.FlatDamage : 0);
        if (isCritical && damage > 0) {
            var criticalStrikeMultiplier = 1.5 + (attacker.getTotalCRTChance()) / 100;
            damage = damage * criticalStrikeMultiplier * (100 + attacker.PercentCriticalDamage) / 100 + attacker.FlatCriticalDamage;
        }

        damage = Math.round(damage / attackCount);
        damage = defender.isInvincibility() ? 0 : damage;
        var isHitShield = false;
        var absorbDamage = 0;
        if (damage > 0 && defender.isShielding()) {
            absorbDamage = Math.round(defender.lostShieldPoints(damage));
            damage -= absorbDamage;
            (damage < 0) && (damage = 0);
            absorbDamage > 0 && (isHitShield = true);
            this.setDamage(absorbDamage, damageType, isCritical);
        } else {
            this.setDamage(damage, damageType, isCritical);
        }

        mc.const.ENABLE_BATTLE_LOG && mc.log(cc.formatStr("(%s) %s (%s): %d, seed: ", attacker.getShortName(), !skill ? "ATTACK" : (skill.isActive() ? "SKILL_ACTIVE" : "SKILL_AUTO"), defender.getShortName(), damage, battleField.getRandomGenerator()._curr));

        defender.adjustHp(-damage);

        attacker.lostHittingCountByCreature(defender);
        defender.lostWillHitCount();

        battleField.fireEvent(!isHitShield ? mc.BattleFieldRefactor.EVENT_COLLISION_HIT : mc.BattleFieldRefactor.EVENT_COLLISION_HIT_SHIELD, undefined, this);
        if (defender.isDead()) {
            var actionTag = defender.getCurrentActionTag();
            actionTag && battleField.stopActionByTag(actionTag);
            var isDone = mc.HitCollision.fireDeadEventIfAny(attacker, defender, battleField);
            if (!isDone) {
                battleField.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_HURT, defender);
            }
        } else {
            !isHitShield && battleField.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_HURT, defender);
        }

        if (!defender.isDead() || (defender.isDead() && !isJustDead)) {
            var mpDef = Math.round((defender.mpRec / attackCount) * RATE_REGEN_MP_WHEN_BE_HIT);
            !defender.isDead() && defender.adjustMp(mpDef);

            var mp = Math.round(attacker.mpRec / (attackCount * numTarget));
            if (defender.isDead() && !isJustDead) {
                mp += (attacker.mpRec * RATE_REGEN_MP_WHEN_BE_KILLER);
            }
            attacker.adjustMp(mp);
        }

        // add late update object.
        if (!isHitShield) {
            if (defender.isReflectDamage()) {
                var lostHp = -Math.round(damage * defender.PercentReflectDamage / 100);
                attacker.addLateUpdateObject(mc.const.LATE_UPDATE_REFLECT_DAMAGE, lostHp);
            }
            if (attacker.isLifeSteal()) {
                var stealHp = Math.round(damage * attacker.PercentLifeSteal / 100);
                attacker.addLateUpdateObject(mc.const.LATE_UPDATE_LIFE_STEAL, stealHp);
            }
            if (attacker.isBurnMana()) {
                var burnMp = -Math.round(((attacker.PercentBurnMana / 100) / attackCount) * defender.getTotalMaxMp());
                defender.addLateUpdateObject(mc.const.LATE_UPDATE_BURN_MANA, burnMp);
            }
        }

        map = attacker.PercentHitBountyChanceMap;
        map && mc.HitCollision._performTriggerBuffSkillByMap(map, attacker);

        map = attacker.PercentHitCurseChanceMap;
        map && mc.HitCollision._performTriggerBuffSkillByMap(map, defender);

        if (!defender.isDead()) {
            var map = defender.PercentBelowHPBountyChanceMap;
            if (map) {
                var percentHp = defender.getHP() * 100 / defender.getTotalMaxHp();
                for (var skillId in map) {
                    var conditionalVal = parseInt(map[skillId]);
                    if (conditionalVal <= percentHp) {
                        defender.addSkillLateUpdateObject(mc.const.LATE_UPDATE_BUFF, {
                            skillId: skillId,
                            target: defender
                        });
                        defender.removeEffectIdOfSkillId(mc.const.BATTLE_EFFECT_BELOWHP, skillId);
                    }
                }
            }

            map = defender.PercentBeHitBountyChanceMap;
            map && mc.HitCollision._performTriggerBuffSkillByMap(map, defender);

            map = defender.PercentBeHitCurseChanceMap;
            map && mc.HitCollision._performTriggerBuffSkillByMap(map, attacker);
        }

        if (skill) {
            skill.removeBonusStatsForOwner(attacker);
            skill.removeBonusStatsForTarget(defender);
        }

        battleField.addMoreDamageByCreatureId(damage + absorbDamage, attacker.getServerId());
        battleField.addMoreIncurByCreatureId(damage + absorbDamage, defender.getServerId());
    }

});

mc.HitCollision._performTriggerBuffSkillByMap = function (mapSkillId, target) {
    if (mapSkillId) {
        for (var skillId in mapSkillId) {
            target.addSkillLateUpdateObject(mc.const.LATE_UPDATE_BUFF, {skillId: skillId, target: target});
        }
    }
};

mc.HitCollision.fireDeadEventIfAny = function (attacker, defender, battleField) {
    if (defender.isDead() && attacker.getHittingCountByCreature(defender) <= 0 && defender.getWillHitCount() <= 0) {
        var arrAllyAttacker = attacker.getArrayAlly();
        if (arrAllyAttacker) {
            for (var i = 0; i < arrAllyAttacker.length; i++) {
                var allyAttacker = arrAllyAttacker[i];
                mc.HitCollision._performTriggerBuffSkillByMap(allyAttacker.PercentLostEnemyBountyChanceMap, allyAttacker);
                mc.HitCollision._performTriggerBuffSkillByMap(allyAttacker.PercentLostAnyBountyChanceMap, allyAttacker);
            }
        }
        var arrAllyDefender = defender.getArrayAlly();
        if (arrAllyDefender) {
            for (var i = 0; i < arrAllyDefender.length; i++) {
                var allyDefender = arrAllyDefender[i];
                mc.HitCollision._performTriggerBuffSkillByMap(allyDefender.PercentLostAllyBountyChanceMap, allyDefender);
                mc.HitCollision._performTriggerBuffSkillByMap(allyDefender.PercentLostAnyBountyChanceMap, allyDefender);
            }
        }
        mc.HitCollision._performTriggerBuffSkillByMap(defender.PercentDeadCurseChanceMap, attacker);
        mc.HitCollision._performTriggerBuffSkillByMap(attacker.PercentKillerBountyChanceMap, attacker);

        battleField.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_DEAD, defender);

        var currPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        if (currPartInBattle && defender.isMonster() && defender.isDead()) {
            var arrDropItem = currPartInBattle.dropItem(defender.getServerId());
            var arrDropZen = currPartInBattle.dropZen(defender.getServerId());
            if (arrDropItem) {
                battleField.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_DROP_ITEM, defender, arrDropItem);
            }
            if (arrDropZen) {
                battleField.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_DROP_ZEN, defender, arrDropZen);
            }
            if (arrDropItem != null) {
                battleField.countDropItem(1);
            }
            if (arrDropZen != null) {
                battleField.countDropItem(1);
            }
        }
        return true;
    }
    return false;
};

mc.BuffCollision = mc.BattleCollisionRefactor.extend({

    performCollision: function (battleField) {
        var skill = this._skill;
        var defender = this._target;
        if (skill) {
            if (!defender.isDead() || defender.isReviving()) {
                var hitData = this._hitData;
                if (hitData) {
                    var attacker = this._owner;
                    var attackCount = hitData["attackCount"] || 1;
                    var numTarget = attacker.getArrayAimingTarget() != null ? attacker.getArrayAimingTarget().length : 1;
                    var mp = Math.round(this._owner.mpRec / (attackCount * numTarget));
                    attacker.adjustMp(mp);
                }

                skill.addBonusStatsForOwner(this._owner);
                skill.addBonusStatsForTarget(defender);

                var pointBuff = 0;
                var arrBuffType = skill.getArrBuffType();
                if (arrBuffType) {
                    for (var i = 0; i < arrBuffType.length; i++) {
                        var point = mc.BattleCollisionRefactor.calculateBuff(arrBuffType[i], this._owner, defender, skill, this._usingByItem);
                        (this._owner != defender) && (pointBuff += point);
                    }
                }
                battleField.addMoreBuffByCreatureId(pointBuff, this._owner.getServerId());
                battleField.fireEvent(mc.BattleFieldRefactor.EVENT_COLLISION_BUFF, undefined, {
                    collision: this
                });

                skill.removeBonusStatsForOwner(this._owner);
                skill.removeBonusStatsForTarget(defender);
            }
        }
    },

    setUsingByItem: function (usingByItem) {
        this._usingByItem = usingByItem;
        return this;
    }

});

mc.EffectCollision = mc.BattleCollisionRefactor.extend({

    performCollision: function (battleField) {
        var skill = this._skill;
        var attacker = this._owner;
        var arrDefender = this._target;
        if (skill) {
            var percentEffectChance = skill ? skill.getEffectChance() : 0;
            var percent = percentEffectChance + attacker.getEffectPercentRate();
            if (percent > 0) {
                var isDone = false;
                var oriPercent = percent;
                for (var d = 0; d < arrDefender.length; d++) {
                    var defender = arrDefender[d];
                    if (attacker != defender && attacker.getTeamId() != defender.getTeamId()) {
                        percent -= defender.getEffectDecreasePercentRate()
                    }
                    if (percent > 0) {
                        var rand = bb.utility.randomInt(0, 100, battleField.getRandomGenerator());
                        if (rand <= percent) {
                            if (defender.canTarget()) {
                                isDone = true;
                                var retArrEffect = (this._owner != defender) ? [] : null;
                                var preDisableState = defender.isDisable();
                                skill.doMagicForTarget(defender, retArrEffect);
                                if (!preDisableState && defender.isDisable()) {
                                    battleField.addMoreBuffByCreatureId(Math.round((defender.getTotalAtk() + defender.getTotalMag()) * 0.1), this._owner.getServerId());
                                }
                                if (retArrEffect) {
                                    for (var e = 0; e < retArrEffect.length; e++) {
                                        if (retArrEffect[e] && retArrEffect[e].getAttributeInfo) {
                                            var attributeInfo = retArrEffect[e].getAttributeInfo();
                                            if (attributeInfo) {
                                                var valEff = attributeInfo.valueAttr;
                                                battleField.addMoreBuffByCreatureId(Math.abs(parseInt(valEff)), this._owner.getServerId());
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    percent = oriPercent;
                }
                isDone && (skill.doMagicForOwner(attacker));
            }
        }
    }

});

mc.BattleCollisionRefactor.calculateBuff = function (buffType, owner, target, skill, usingByItem) {
    var pointBuff = 0;
    var value = null;
    if (buffType === mc.const.BUFF_TYPE_HEAL) {
        var heal = Math.round(target.getTotalMaxHp() * target.PercentHPRecovery / 100 + target.FlatHPRecovery + owner.getTotalMag() * 0.1);
        heal = target.isDecover() ? 0 : heal;
        target.adjustHp(heal);
        value = heal;
        pointBuff += value;
    } else if (buffType === mc.const.BUFF_TYPE_HPPORTION) {
        var heal = Math.round(target.getTotalMaxHp() * target.PercentHPRecovery / 100 + target.FlatHPRecovery);
        heal = target.isDecover() ? 0 : heal;
        target.adjustHp(heal);
        value = heal;
    } else if (buffType === mc.const.BUFF_TYPE_COSTHP) {//PercentHPRecovery, FlatHPRecovery is negative value
        var costHp = target.FlatHPRecovery + Math.round(target.getTotalMaxHp() * target.PercentHPRecovery / 100);
        target.adjustHp(costHp, true);
        value = costHp;
    } else if (buffType === mc.const.BUFF_TYPE_COSTMP) {//PercentMPRecovery, FlatMPRecovery is negative value
        var costMp = target.FlatMPRecovery + Math.round(target.getTotalMaxHp() * target.PercentMPRecovery / 100);
        target.adjustMp(costMp);
        value = costMp;
    } else if (buffType === mc.const.BUFF_TYPE_MAGSHIELD) {
        var magShield = owner.FlatShield + Math.round(owner.getTotalMag() * owner.PercentBuffShield / 100);
        target.acquireShieldPoints(magShield);
        value = magShield;
        pointBuff += value;
    } else if (buffType === mc.const.BUFF_TYPE_HPSHIELD) {
        var hpShield = owner.FlatShield + Math.round(owner.getTotalMaxHp() * owner.PercentBuffShield / 100);
        target.acquireShieldPoints(hpShield);
        value = hpShield;
        pointBuff += value;
    } else if (buffType === mc.const.BUFF_TYPE_REMOVAL) {
        target.removeAllEffectByType("debuff");
        pointBuff += Math.round((target.getTotalDef() + target.getTotalRes()) * 0.1);
    } else if (buffType === mc.const.BUFF_TYPE_ATTRIBUTE) {
        mc.const.ENABLE_BATTLE_LOG && mc.log("mc.const.BUFF_TYPE_ATTRIBUTE");
    }
    target.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_ACTIVE_BUFF, target, {
        skill: skill,
        usingByItem: usingByItem,
        buffType: buffType,
        value: value
    });
    return pointBuff;
};

mc.BattleCollisionRefactor.calculateUpdateEffect = function (owner, effect) {
    var equationKey = effect.getEquationKey();
    if (equationKey === mc.const.UPDATE_EFFECT_TYPE_DPS) {
        var damage = Math.abs(Math.round(effect.getTotalEffectValue() * owner.getTotalMaxHp() / 100));
        damage = (damage > mc.const.MAX_DPS) ? mc.const.MAX_DPS : damage;
        effect.setDeltaEffectValue(damage);
        owner.adjustHp(-damage);
        owner.getBattleField().fireEvent(owner.isDead() ? mc.BattleFieldRefactor.EVENT_CREATURE_DEAD : mc.BattleFieldRefactor.EVENT_CREATURE_HURT, owner);
        owner.getBattleField().addMoreIncurByCreatureId(damage, owner.getServerId());
    } else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_MPS) {
        var drainMp = Math.abs(Math.round(effect.getTotalEffectValue() * owner.getTotalMaxMp() / 100));
        drainMp = (drainMp > mc.const.MAX_DPS) ? mc.const.MAX_DPS : drainMp;
        effect.setDeltaEffectValue(drainMp);
        owner.adjustMp(-drainMp);
    } else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_HP) {
        var regenHp = Math.round(owner.getTotalMaxHp() * owner.PercentRegenHP / 100 + owner.FlatRegenHP);
        regenHp = owner.isDecover() ? 0 : regenHp;
        effect.setDeltaEffectValue(regenHp);
        owner.adjustHp(regenHp);
    } else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_MP) {
        var regenMp = Math.round(owner.getTotalMaxMp() * owner.PercentRegenMP / 100 + owner.FlatRegenMP);
        effect.setDeltaEffectValue(regenMp);
        owner.adjustMp(regenMp);
    } else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_HP_OPTION) {
        var regenHp = Math.round(owner.getTotalMaxHp() * owner.PercentRegenHPOption / 100 + owner.FlatRegenHPOption);
        regenHp = owner.isDecover() ? 0 : regenHp;
        effect.setDeltaEffectValue(regenHp);
        owner.adjustHp(regenHp);
    } else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_MP_OPTION) {
        var regenMp = Math.round(owner.getTotalMaxMp() * owner.PercentRegenMPOption / 100 + owner.FlatRegenMPOption);
        effect.setDeltaEffectValue(regenMp);
        owner.adjustMp(regenMp);
    } else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_ATTRIBUTE) {
        var skillId = effect.getTotalEffectValue();
        var target = owner;
        var skillInfo = new mc.CreatureSkill(target, mc.CreatureSkill.createJsonSkill(skillId, 1));
        new mc.BuffCollision(target, target, skillInfo).performCollision(target.getBattleField());
        new mc.EffectCollision(target, [target], skillInfo).performCollision(target.getBattleField());
    }
    owner.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_UPDATE_STATUS_EFFECT, owner, effect);
};

mc.BattleCollisionRefactor.calculateLateUpdateObject = function (owner, lateUpdate) {
    if (!owner.isDead() || owner.isReviving()) {
        var key = lateUpdate.getKey();
        var value = 0;
        if (key === mc.const.LATE_UPDATE_LIFE_STEAL) {
            value = lateUpdate.getValue();
            value = owner.isDecover() ? 0 : value;
            owner.adjustHp(value);
        } else if (key === mc.const.LATE_UPDATE_REFLECT_DAMAGE) {
            value = lateUpdate.getValue();
            owner.adjustHp(value);
            owner.getBattleField().fireEvent(owner.isDead() ? mc.BattleFieldRefactor.EVENT_CREATURE_DEAD : mc.BattleFieldRefactor.EVENT_CREATURE_HURT, owner);
        } else if (key === mc.const.LATE_UPDATE_BURN_MANA) {
            value = lateUpdate.getValue();
            owner.adjustMp(value);
        } else if (key === mc.const.LATE_UPDATE_BUFF) {
            var arrObj = lateUpdate.getArrayObj();
            for (var i = 0; i < arrObj.length; i++) {
                var obj = arrObj[i];
                var target = obj.target;
                var skillId = obj.skillId;
                var skillInfo = new mc.CreatureSkill(target, mc.CreatureSkill.createJsonSkill(skillId, 1));
                new mc.BuffCollision(target, target, skillInfo).performCollision(target.getBattleField());
                new mc.EffectCollision(target, [target], skillInfo).performCollision(target.getBattleField());
            }
        }
        owner.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_LATE_UPDATE, owner, lateUpdate);
    }
};