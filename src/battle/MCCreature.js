/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.Creature = mc.BattleEntity.extend({
    _effectManager: null,
    _skillManager: null,

    _battleField: null,
    _teamId: null,
    _isDisable: false,
    _bonusDamageAfterDead: 0,
    _isReviving: false,

    _msTotalUpdateTime: 0,
    _state: null,

    containCrystal: false,
    info: null,

    _cooldownMap: null,
    ctor: function () {
        this._effectManager = new mc.CreatureEffectManager();
        this._skillManager = new mc.CreatureSkillManager(this);
    },

    _refresh: function () {
        this._bonusDamageAfterDead = 0;
        this.mpRec = 1;
        this.currentShieldPoints = -1;
        this.basicCrit = 0;
        this.PercentCRT = 0;
        this.FlatATK = 0;
        this.PercentATK = 0;
        this.FlatDamage = 0;
        this.PercentDamage = 0;
        this.PercentDEF = 0;
        this.FlatDEF = 0;
        this.totalShieldPoints = 0;
        this.FlatMAG = 0;
        this.PercentMAG = 0;
        this.PercentRES = 0;
        this.FlatRES = 0;
        this.FlatSPD = 0;
        this.PercentSPD = 0;
        this.FlatCriticalDamage = 0;
        this.PercentCriticalDamage = 0;
        this.PercentHPRecovery = 0;
        this.FlatHPRecovery = 0;
        this.PercentMPRecovery = 0;
        this.FlatMPRecovery = 0;
        this.FlatmaxHP = 0;
        this.PercentmaxHP = 0;
        this.FlatMPRec = 0;
        this.PercentMPRec = 0;
        this.FlatDamageEXCE = 0;
        this.PercentExcellentChance = 0;
        this.FlatShield = 0;
        this.PercentBuffShield = 0;
        this.PercentRegenMP = 0;
        this.FlatRegenMP = 0;
        this.PercentRegenHP = 0;
        this.FlatRegenHP = 0;
        this.PercentRegenMPOption = 0;
        this.FlatRegenMPOption = 0;
        this.PercentRegenHPOption = 0;
        this.FlatRegenHPOption = 0;
        this.PercentLifeStealChance = 0;
        this.PercentReflectDamageChance = 0;
        this.PercentLifeSteal = 0;
        this.PercentReflectDamage = 0;
        this.PercentBurnMana = 0;
        this.PercentEffectRate = 0;
        this.PercentDecreaseEffectRate = 0;
        this.PercentDecreaseDamageTaken = 0;
        this.PercentPassStun = 0;
        this.PercentLostEnemyBountyChanceMap = null;
        this.PercentLostAllyBountyChanceMap = null;
        this.PercentLostAnyBountyChanceMap = null;
        this.PercentBeHitBountyChanceMap = null;
        this.PercentBeHitCurseChanceMap = null;
        this.PercentHitBountyChanceMap = null;
        this.PercentHitCurseChanceMap = null;
        this.PercentKillerBountyChanceMap = null;
        this.PercentBelowHPBountyChanceMap = null;
        this.PercentDeadCurseChanceMap = null;
        this.PercentReviveBountyChanceMap = null;
        this.BEPRfire = 0;
        this.BEPRwater = 0;
        this.BEPRearth = 0;
        this.BEPRlight = 0;
        this.BEPRdark = 0;

        this.UndeadCount = 0;
        this.InvincibilityCount = 0;
        this.MagicImmunityCount = 0;
        this.PhysicImmunityCount = 0;
        this.StatusImmunityCount = 0;
        this.RejectDeathCount = 0;
        this.MissCount = 0;
        this.SleepCount = 0;
        this.RootsCount = 0;
        this.SilenceCount = 0;
        this.DecoverCount = 0;
        this.DisableCount = 0;
        this.FreezeCount = 0;
        this.HexCount = 0;
        this.HidingCount = 0;
        this.HiddenCount = 0;

        this._isEnterBattleField = false;
    },

    isEnterBattleField: function () {
        return this._isEnterBattleField;
    },

    setEnterBattleField: function (isEnterBattleField) {
        this._isEnterBattleField = isEnterBattleField;
        this._willHitCount = 0;
        this._mapHittingCountByBattleId = {};
        this._arrAimingTarget = [];
    },

    getElement: function () {
        return this.info.element;
    },

    getBattleRole: function () {
        var dict = mc.dictionary.getCreatureDictByIndex(this.getResourceId());
        return dict["battleRole"];
    },

    getLevel: function () {
        return this.info ? this.info.level : 1;
    },

    getName: function () {
        return this.info.name;
    },

    getShortName: function () {
        if (this.info.name) {
            return this.info.name.split('-')[0];
        }
        return null;
    },

    setInfo: function (info) {
        this.info = info;
    },

    getInfo: function () {
        return this.info;
    },

    getAttackType: function () {
        return this.info.attackType;
    },

    setArrayAimingTarget: function (arrTarget) {
        this._arrAimingTarget = arrTarget;
    },

    getArrayAimingTarget: function () {
        return this._arrAimingTarget;
    },

    setEffectPercentRate: function (percentRate) {
        this._effectPercentRate = percentRate;
    },

    getEffectPercentRate: function () {
        if (mc.const.CHEAT_EFFECT_PERCENT_RATE) {
            return 100;
        } else if (this._effectPercentRate) {
            return this._effectPercentRate;
        }
        return this.PercentEffectRate;
    },

    getEffectDecreasePercentRate: function () {
        return this.PercentDecreaseEffectRate;
    },

    setTeamLeader: function (isTeamLeader) {
        this._isTeamLeader = isTeamLeader;
    },

    isTeamLeader: function () {
        return this._isTeamLeader;
    },

    calculatePersonalInfo: function () {
        this._refresh();

        var info = this.info;
        this.entityId = info.resourceId;
        this._cooldownMap = info.cooldownMap;

        this.mpRec = info.mpRec || 0;
        this.basicCrit = info.crit || 0;


        this._skillManager.cleanup();
        this._effectManager.cleanup();
        this._skillManager.setHeroSkill(info.skillList);
        this._skillManager.setItemSkill(info.optionSkillList);

        this.updateInfo();
        this.setDisable(this.isDead());
    },

    calculateApplyingSkillForOthers: function (arrCreatureInBattle) {
        if (!this._mapApplyingSkillOthersById) {
            this._mapApplyingSkillOthersById = {};
        }
        for (var i = 0; i < arrCreatureInBattle.length; i++) {
            var cr = arrCreatureInBattle[i];
            if (!this._mapApplyingSkillOthersById[cr.getServerId()]) {
                this._mapApplyingSkillOthersById[cr.getServerId()] = true;
                (arrCreatureInBattle[i] != this) && this._skillManager.doPassiveMagicForTarget(arrCreatureInBattle[i]);
                if (this.isTeamLeader()) {
                    this._skillManager.doLeaderMagicForTarget(arrCreatureInBattle[i]);
                }
            }
        }
    },

    calculatePassiveSkill: function () {
        this._skillManager.doPassiveMagicForOwner();
        this._skillManager.doPassiveMagicForTarget(this);
    },

    updateInfo: function () {
        var info = this.info;
        var percentHp = (info.getCurrentHpPercentByLong() / mc.CreatureInfo.CAST_LONG_RATE);
        var percentMp = (info.getCurrentMpPercentByLong() / mc.CreatureInfo.CAST_LONG_RATE);
        var hp = percentHp * this.getTotalMaxHp();
        var mp = percentMp * this.getTotalMaxMp();
        if (mc.const.CHEAT_GOD_HP) {
            hp = mc.const.CHEAT_GOD_HP;
        }
        if (mc.const.CHEAT_GOD_MP) {
            mp = mc.const.CHEAT_GOD_MP;
        }
        this.encryptFirstHp = mc.CreatureInfo.encryptNumber(hp);
        this.encryptCurrHp = mc.CreatureInfo.encryptNumber(hp);
        this.encryptcurrMp = mc.CreatureInfo.encryptNumber(mp);
    },

    lostWillHitCount: function (totalHitCount) {
        totalHitCount = totalHitCount || 1;
        this._willHitCount -= totalHitCount;
        if (this._willHitCount < 0) {
            this._willHitCount = 0;
        }
    },

    lostHittingCountByCreature: function (creature, totalHitCount) {
        totalHitCount = totalHitCount || 1;
        if (this._mapHittingCountByBattleId[creature.battleId]) {
            this._mapHittingCountByBattleId[creature.battleId] -= totalHitCount;
            if (this._mapHittingCountByBattleId[creature.battleId] < 0) {
                this._mapHittingCountByBattleId[creature.battleId] = 0;
            }
        }
    },

    getWillHitCount: function () {
        return this._willHitCount;
    },

    getHittingCountByCreature: function (creature) {
        if (this._mapHittingCountByBattleId[creature.battleId]) {
            return this._mapHittingCountByBattleId[creature.battleId];
        }
        return 0;
    },

    setBattleFieldRefactor: function (battleField) {
        this._battleField = battleField;
    },

    getBattleField: function () {
        return this._battleField;
    },

    setEnableInput: function (enableInput) {
        this._enableInput = enableInput;
    },

    isEnableInput: function () {
        return this._enableInput;
    },

    setDisable: function (isDisable) {
        this._isDisable = isDisable;
    },

    setContainCrystal: function (containCrystal) {
        this.containCrystal = containCrystal;
        return this;
    },

    getTotalMaxHp: function () {
        return this.info.getBasicHp() * (100 + this.PercentmaxHP) / 100 + this.FlatmaxHP;
    },

    getTotalMaxMp: function () {
        return this.info.getBasicMp();
    },

    getTotalMag: function () {
        return this.info.getBasicMagic() * (100 + this.PercentMAG) / 100 + this.FlatMAG;
    },

    getTotalAtk: function () {
        return this.info.getBasicAttack() * (100 + this.PercentATK) / 100 + this.FlatATK;
    },

    getTotalDef: function () {
        return this.info.getBasicDefense() * (100 + this.PercentDEF) / 100 + this.FlatDEF;
    },

    getTotalRes: function () {
        return this.info.getBasicResistant() * (100 + this.PercentRES) / 100 + this.FlatRES;
    },

    getValueAttributeByKey: function (key) {
        var val = 0;
        if (key === "atk") {
            val = this.getTotalAtk();
        } else if (key === "mag") {
            val = this.getTotalMag();
        } else if (key === "def") {
            val = this.getTotalDef();
        } else if (key === "res") {
            val = this.getTotalRes();
        } else if (key === "spd") {
            val = this.getTotalSpeed();
        } else if (key === "shield") {
            val = this.totalShieldPoints;
        }
        return val;
    },

    getDamageMultiplierAtk: function () {
        var totalDef = this.getTotalDef();
        var damageMultiplierAtk = 1;
        if (!this.isShielding()) {
            if (totalDef >= 0) {
                damageMultiplierAtk = 1000 / (1000 + totalDef);
            }
        }
        return damageMultiplierAtk;
    },

    getDamageMultiplierMag: function () {
        var totalRes = this.getTotalRes();
        var damageMultiplierMag = 1;
        if (!this.isShielding()) {
            if (totalRes >= 0) {
                damageMultiplierMag = 1000 / (1000 + totalRes);
            }
        }
        return damageMultiplierMag;
    },

    getBonusElementalRateFor: function (defender) {
        return this["BEPR" + defender.getElement().toLowerCase()];
    },

    getTotalSpeed: function () {
        return Math.round(this.info.getBasicSpeed() * (100 + this.PercentSPD) / 100 + this.FlatSPD);
    },

    getTotalCRTChance: function () {
        return this.basicCrit + this.PercentCRT;
    },

    getTotalEXEChance: function () {
        return this.PercentExcellentChance;
    },

    getTotalMpRec: function () {
        return this.mpRec * (100 + this.PercentMPRec) / 100 + this.FlatMPRec;
    },

    isDisable: function () {
        return this._isDisable || this.isStunning() || this.isFreezing() || this.isHex() || this.isHidden();
    },

    isHex: function () {
        return this.HexCount > 0;
    },

    isHiding: function () {
        return this.HidingCount > 0;
    },

    isHidden: function () {
        return this.HiddenCount > 0;
    },

    isStunning: function () {
        return this.DisableCount > 0;
    },

    isFreezing: function () {
        return this.FreezeCount > 0;
    },

    isUndead: function () {
        return this.UndeadCount > 0;
    },

    isInvincibility: function () {
        return this.InvincibilityCount > 0;
    },

    isMagicImmunity: function () {
        return this.MagicImmunityCount > 0;
    },

    isPhysicImmunity: function () {
        return this.PhysicImmunityCount > 0;
    },

    isStatusImmunity: function () {
        return this.StatusImmunityCount > 0;
    },

    isRejectDeath: function () {
        return this.RejectDeathCount > 0;
    },

    isMiss: function () {
        return this.MissCount > 0;
    },

    isSleep: function () {
        return this.SleepCount > 0;
    },

    isRoots: function () {
        return this.RootsCount > 0;
    },

    isSilence: function () {
        return this.SilenceCount > 0;
    },

    isDecover: function () {
        return this.DecoverCount > 0;
    },

    isBurnMana: function () {
        if (this.PercentBurnMana > 0) {
            return true;
        }
        return false;
    },

    isPassStun: function () {
        if (this.PercentPassStun > 0) {
            var rand = bb.utility.randomInt(1, 100, this.getBattleField().getRandomGenerator());
            return rand <= this.PercentPassStun;
        }
        return false;
    },

    isLifeSteal: function () {
        if (this.PercentLifeSteal > 0) {
            var rand = bb.utility.randomInt(1, 100, this.getBattleField().getRandomGenerator());
            return rand <= this.PercentLifeStealChance;
        }
        return false;
    },

    isReflectDamage: function () {
        if (this.PercentReflectDamage > 0) {
            var rand = bb.utility.randomInt(1, 100, this.getBattleField().getRandomGenerator());
            return rand <= this.PercentReflectDamageChance;
        }
        return false;
    },

    isBoss: function () {
        var dict = mc.dictionary.getCreatureDictByIndex(this.getResourceId());
        if (dict && dict.type === "boss") {
            return true;
        }
        return false;
    },

    isShielding: function () {
        return this.totalShieldPoints > 0;
    },

    isGettingTurn: function () {
        if (this.getBattleField()) {
            return this.getBattleField().isCreatureGettingTurn(this);
        }
        return false;
    },

    renewEffect: function (effect) {
        this._effectManager.setEffect(effect, this);
    },

    applyEffect: function (effect) {
        this._effectManager.addEffect(effect, this);
    },

    applyItemEffect: function (effect) {
        this._effectManager.addItemEffect(effect, this);
    },

    getStatusEffect: function (effectId, skillId) {
        return this._effectManager.getStatusEffect(effectId, skillId);
    },

    getStatusEffectSameRootSkill: function (effectId, skillId) {
        return this._effectManager.getStatusEffectSameRootSkill(effectId, skillId);
    },

    getArrayStatusItemEffectSameRootSkill: function (effectId, skillId) {
        return this._effectManager.getArrayStatusItemEffectSameRootSkill(effectId, skillId);
    },

    removeItemEffect: function (effect) {
        this._effectManager.removeItemEffect(effect, this);
    },

    removeEffect: function (effect) {
        this._effectManager.removeEffect(effect, this);
    },

    removeEffectWithIds: function (arrEffectId) {
        this._effectManager.removeEffectWithIds(arrEffectId, this);
    },

    removeEffectIdOfSkillId: function (effectId, skillId) {
        this._effectManager.removeEffectIdOfSkillId(effectId, skillId, this);
    },

    removeAllDurationEffects: function () {
        var allEffect = this._effectManager.getAllEffect();
        for (var i = 0; i < allEffect.length; i++) {
            if (allEffect[i]) {
                if (allEffect[i].getTotalDuration() > 0) {
                    this._effectManager.removeEffect(allEffect[i], this);
                }
            }
        }
    },

    removeAllEffectByType: function (type) {
        var allEffect = this._effectManager.getAllEffect();
        for (var i = 0; i < allEffect.length; i++) {
            if (allEffect[i]) {
                var local = mc.dictionary.getEffectByIndex(allEffect[i].getEffectId());
                if (local["effectType"] === type && allEffect[i].getTotalDuration() > 0) {
                    this._effectManager.removeEffect(allEffect[i], this);
                }
            }
        }
    },

    getUpdatingEffects: function () {
        return this._effectManager.getUpdatingEffects(this);
    },

    addLateUpdateObject: function (key, value) {
        value = value || 0;
        this._mapLateUpdateById = this._mapLateUpdateById || {};
        if (!this._mapLateUpdateById[key]) {
            this._mapLateUpdateById[key] = new mc.LateUpdate(key);
        }
        this._mapLateUpdateById[key].addValue(value);
    },

    addSkillLateUpdateObject: function (key, obj) {
        this._mapLateUpdateById = this._mapLateUpdateById || {};
        if (!this._mapLateUpdateById[key]) {
            this._mapLateUpdateById[key] = new mc.LateUpdate(key);
        }
        this._mapLateUpdateById[key].addObj(obj);
    },

    getArrayLateUpdateObject: function () {
        var arr = this._mapLateUpdateById ? bb.utility.mapToArray(this._mapLateUpdateById) : null;
        if (arr) {
            var tb = mc.LateUpdate.TABLE_PRIORITY_SKILL_LATE_UPDATE;
            arr.sort(function (late1, late2) {
                return tb[late1.getKey()] - tb[late2.getKey()];
            });
        }
        return arr;
    },

    countDownPerTurn: function () {
        var isCount = false;
        if (!this.isDead()) {
            this._skillManager.countDownAllSkill();
            isCount = this._effectManager.onCountDown(this);
        }
        return isCount;
    },

    cleanEffects: function () {
        this._effectManager.cleanEffects(this);
    },

    resetVariable: function () {
        this.cleanBreakingShieldIfAny();
    },

    _waitToByTime: function (dt, duration) {
        this._msTotalUpdateTime += dt;
        return this._msTotalUpdateTime >= duration;
    },

    _doUpdatingEffect: function () {
        var creature = this;
        if (creature._arrUpdatingEffectObject && creature._currUpdatingEffectIndex < creature._arrUpdatingEffectObject.length) {
            mc.BattleCollisionRefactor.calculateUpdateEffect(creature, creature._arrUpdatingEffectObject[creature._currUpdatingEffectIndex]);
            creature._currUpdatingEffectIndex++;
            if (creature._currUpdatingEffectIndex >= creature._arrUpdatingEffectObject.length) {
                creature._currUpdatingEffectIndex = 0;
                creature._arrUpdatingEffectObject = null;
            }
        }
    },

    getArraySkillEnable: function () {
        var arrSkillEnable = null;
        var arrActiveSkill = this._skillManager.getArrayActiveSkill();
        if (this._isAutoUseUltimate || this._needUseUltimate) {
            for (var i = 0; i < arrActiveSkill.length; i++) {
                var skill = arrActiveSkill[i];
                if (this.isFullMp() || this._needUseUltimate) {
                    !arrSkillEnable && (arrSkillEnable = []);
                    arrSkillEnable.push(skill);
                }
            }
        }
        var arrAutoCastSkill = this._skillManager.getArrayAutoCastSkill();
        for (var i = 0; i < arrAutoCastSkill.length; i++) {
            var skill = arrAutoCastSkill[i];
            if (skill.isCoolDownElapsed()) {
                !arrSkillEnable && (arrSkillEnable = []);
                arrSkillEnable.push(skill);
            }
        }
        return arrSkillEnable;
    },

    getActiveSkill: function () {
        return this._skillManager.getArrayActiveSkill()[0];
    },

    getAutoCastSkill: function () {
        return this._skillManager.getArrayAutoCastSkill()[0];
    },

    isUltimateSkill: function (skill) {
        return this._skillManager.isUltimateSkill(skill);
    },

    adjustMp: function (mp) {
        var totalMaxMp = this.getTotalMaxMp();
        var currMp = this.getMp();
        currMp += mp;
        if (currMp <= 0) {
            currMp = 0;
        }
        if (currMp >= totalMaxMp) {
            currMp = totalMaxMp;
        }
        this.encryptcurrMp = mc.CreatureInfo.encryptNumber(currMp);
        this.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_MP, this, mp);
    },

    adjustHp: function (hp, undead) {
        var totalMaxHp = this.getTotalMaxHp();
        var currentHp = this.getHP();
        var deadCount = this.isDead() ? 1 : 0;
        currentHp += hp;
        if (currentHp <= 0) {
            this._bonusDamageAfterDead += Math.abs(currentHp);
            if (this.isUndead() || undead) {
                currentHp = 1;
            } else {
                deadCount++;
                currentHp = 0;
                var map = this.PercentReviveBountyChanceMap;
                if (map) { // can reviving
                    for (var skillId in map) {
                        this.addSkillLateUpdateObject(mc.const.LATE_UPDATE_BUFF, {skillId: skillId, target: this});
                    }
                    this.removeEffectWithIds([mc.const.BATTLE_EFFECT_REVIVE]);
                    this.getBattleField().setRevivingForCreature(this);
                }
            }
            var mp = -this.getMp();
            this.adjustMp(mp);
            this.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_MP, this, mp);
        }
        if (currentHp >= totalMaxHp) {
            currentHp = totalMaxHp;
        }
        this.encryptCurrHp = mc.CreatureInfo.encryptNumber(currentHp);
        this.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_HP, this, hp);
        var isDead = this.isDead();
        this.setDisable(isDead);
        isDead && this.removeAllDurationEffects();
        mc.const.ENABLE_BATTLE_LOG && deadCount === 1 && mc.log(this.getShortName() + " DEAD!!!!!!!!!!!!!" + this.getBattleField().getRandomGenerator()._curr);
    },

    setReviving: function (isReviving) {
        this._isReviving = isReviving;
    },

    isReviving: function () {
        return this._isReviving;
    },

    cleanBreakingShieldIfAny: function () {
        if (this.totalShieldPoints > 0 && this.currentShieldPoints === 0) {
            this.currentShieldPoints = -1; // reset for next.
            this.totalShieldPoints = 0;
            this.removeEffectWithIds([mc.const.BATTLE_EFFECT_SHIELD]);
        }
    },

    lostShieldPoints: function (absorbDamage) {
        if (this.currentShieldPoints >= 0) {
            this.currentShieldPoints -= absorbDamage;
            if (this.currentShieldPoints <= 0) {
                this.currentShieldPoints = 0; // wait for clean shielding.
            }
            return absorbDamage;
        }
        return 0;
    },

    acquireShieldPoints: function (point) {
        this.totalShieldPoints += point;
        if (this.currentShieldPoints == -1) {// start calculate shielding.
            this.currentShieldPoints = this.totalShieldPoints;
        } else {// bonus shield.
            this.currentShieldPoints += point;
        }
    },

    isFullMp: function () {
        return this.getMp() >= this.getTotalMaxMp();
    },

    setTeamId: function (teamId) {
        this._teamId = teamId;
    },

    getTeamId: function () {
        return this._teamId;
    },

    getServerId: function () {
        return this.info.serverId;
    },

    getResourceId: function () {
        return this.entityId || this.info.resourceId;
    },

    isRanger: function () {
        return this.info.ranger;
    },

    isExcellentAttack: function (targetId) {
        if (!this._isExcellentChainMap) {
            this._isExcellentChainMap = {};
        }
        if (this._isExcellentChainMap[targetId] === undefined) {
            var rand = bb.utility.randomInt(1, 100, this.getBattleField().getRandomGenerator());
            this._isExcellentChainMap[targetId] = (rand <= this.getTotalEXEChance());
        }
        return this._isExcellentChainMap[targetId];
    },

    isCriticalAttack: function (targetId) {
        if (!this._isCriticalChainMap) {
            this._isCriticalChainMap = {};
        }
        if (this._isCriticalChainMap[targetId] === undefined) {
            var rand = bb.utility.randomInt(1, 100, this.getBattleField().getRandomGenerator());
            this._isCriticalChainMap[targetId] = (rand <= this.getTotalCRTChance());
        }
        return this._isCriticalChainMap[targetId];
    },

    _cleanTemp: function () {
        this._currActionTag = null;
        this._isCriticalChainMap = null;
        this._isExcellentChainMap = null;
    },

    canTarget: function () {
        return !this.isDead() && !this.isHidden() && !this.isReviving();
    },

    isDead: function () {
        return this.getHP() <= 0 && !this.getInfo().hpServerControl;
    },

    getMp: function () {
        return mc.CreatureInfo.decryptNumber(this.encryptcurrMp);
    },

    getFirstHP: function () {
        return mc.CreatureInfo.decryptNumber(this.encryptFirstHp);
    },

    getHP: function (noTrim) {
        var num = mc.CreatureInfo.decryptNumber(this.encryptCurrHp);
        return num;
    },

    getBonusDamageAfterDead: function () {
        return this._bonusDamageAfterDead;
    },

    setAutoUseUltimate: function (isAutoUseUltimate) {
        this._isAutoUseUltimate = isAutoUseUltimate;
    },

    getArrayMember: function () {
        if (this.getBattleField()) {
            var arrMember = this.getBattleField().getAllCreatureOfTeam(this.getTeamId());
            if (arrMember) {
                var arrResult = [];
                for (var i = 0; i < arrMember.length; i++) {
                    var ally = arrMember[i];
                    if (ally.canTarget()) {
                        arrResult.push(ally);
                    }
                }
                return arrResult;
            }
        }
        return null;
    },

    getArrayOpponent: function () {
        if (this.getBattleField()) {
            var arrOpp = this.getBattleField().getOpponentOfCreature(this);
            if (arrOpp) {
                var arrResult = [];
                for (var i = 0; i < arrOpp.length; i++) {
                    var opp = arrOpp[i];
                    if (opp.canTarget() &&
                        !opp.isHiding()) {
                        arrResult.push(opp);
                    }
                }
                return arrResult;
            }
        }
        return null;
    },

    getArrayAlly: function () {
        if (this.getBattleField()) {
            var arrAlly = this.getBattleField().getAlliesOfCreature(this);
            if (arrAlly) {
                var arrResult = [];
                for (var i = 0; i < arrAlly.length; i++) {
                    var ally = arrAlly[i];
                    if (ally.canTarget()) {
                        arrResult.push(ally);
                    }
                }
                return arrResult;
            }
        }
        return null;
    },

    getNearest: function (arrCreature) {
        var min = 999999;
        if (arrCreature) {
            var cr = arrCreature[0];
            var p = cc.p(this.colBattleCell, this.rowBattleCell);
            for (var i = 0; i < arrCreature.length; i++) {
                var p2 = cc.p(arrCreature[i].colBattleCell, arrCreature[i].rowBattleCell);
                var dis = cc.pDistance(p2, p);
                if (dis < min) {
                    min = dis;
                    cr = arrCreature[i];
                }
            }
            return cr;
        }
        return null;
    },

    getCurrentActionTag: function () {
        return this._currActionTag;
    },

    requestDoUltimateAction: function () {
        this.getBattleField()._doUltimateActionForCreature(this);
    },

    doUsingItem: function (itemInfo) {
        if (!this.isDead()) {
            var skillIndex = mc.ItemStock.getItemSkillIndex(itemInfo);
            var skillInfo = new mc.CreatureSkill(null, mc.CreatureSkill.createJsonSkill(skillIndex, 1));
            new mc.BuffCollision(this, this, skillInfo).setUsingByItem(true).performCollision(this.getBattleField());
            new mc.EffectCollision(this, [this], skillInfo).performCollision(this.getBattleField());
        }
    },

    _doUltimateAction: function () {
        if (this._currActionTag) {
            if (this._arrWillHitCountTarget) {
                for (var i = 0; i < this._arrWillHitCountTarget.length; i++) {
                    var creature = this._arrWillHitCountTarget[i];
                    var remain = this._mapHittingCountByBattleId[creature.battleId];
                    this._arrWillHitCountTarget[i].lostWillHitCount(remain);
                    this.lostHittingCountByCreature(creature, remain);
                    mc.HitCollision.fireDeadEventIfAny(this, creature, this.getBattleField());
                }
            }
            this.getBattleField().stopActionByTag(this._currActionTag);
        }
        var auto = this._isAutoUseUltimate;
        this.setAutoUseUltimate(true);
        var tt = this.doAction(true);
        this.setAutoUseUltimate(auto);
        return tt;
    },

    setNeedUseUltimate: function (needUseUltimate) {
        this._needUseUltimate = needUseUltimate;
        if (needUseUltimate) {
            this.adjustMp(-this.getMp());
        }
    },

    isNeedUseUltimate: function () {
        return this._needUseUltimate;
    },

    isLostTurn: function () {
        var skill = null;
        var isRanger = this.isRanger();
        var arrSkill = null;
        if (!this.isSilence()) {
            arrSkill = this.getArraySkillEnable();
            if (arrSkill && arrSkill.length > 0) {
                skill = arrSkill[0];
            }
        }
        skill && (isRanger = mc.HeroStock.isSkillRange(skill.skillInfo));
        return (this.isRoots() && !isRanger) || this.isDisable();
    },

    stopDoing: function () {
        this._cleanTemp();
        var arrAimingTarget = this.getArrayAimingTarget();
        for (var i = 0; i < arrAimingTarget.length; i++) {
            if (arrAimingTarget[i]) {
                var lostCount = arrAimingTarget[i].getWillHitCount();
                if (arrAimingTarget[i].isDead() && lostCount > 0) {
                    cc.log("AUTO LOST HIT COUNT FOR CREATURE INDEX: " + this.getResourceId());
                    var remain = this._mapHittingCountByBattleId[arrAimingTarget[i].battleId];
                    this.lostHittingCountByCreature(arrAimingTarget[i], remain);
                    arrAimingTarget[i].lostWillHitCount(lostCount);
                    mc.HitCollision.fireDeadEventIfAny(this, arrAimingTarget[i], this.getBattleField());
                }
            }
        }

    },

    doAction: function (byUser) {

        var totalTime = 0;
        if (this.isDead() || this.isReviving()) {
            totalTime = mc.BattleFieldRefactor.TIME_CREATURE_DO_NO_THING;
            return totalTime;
        }
        var skill = null;
        var isRanger = this.isRanger();
        var arrSkill = null;
        if (!this.isSilence()) {
            arrSkill = this.getArraySkillEnable();
            if (arrSkill && arrSkill.length > 0) {
                skill = arrSkill[0];
            }
        } else if (byUser) {
            totalTime = mc.BattleFieldRefactor.TIME_CREATURE_DO_NO_THING;
            return totalTime;
        }

        var randomGenerator = this.getBattleField().getRandomGenerator();
        var isBuff = false;
        var arrTarget = null;
        if (skill) {
            isRanger = mc.HeroStock.isSkillRange(skill.skillInfo);
            isBuff = skill.getArrBuffType() != null;
            if (skill.isTargetAllies() ||
                skill.isTargetSelfAndAllies()) {
                arrTarget = this.getArrayAlly();
            } else if (skill.isTargetSelf()) {
                arrTarget = [this];
            } else if (skill.isTargetSameTeam()) {
                arrTarget = this.getArrayMember();
            } else {
                arrTarget = this.getArrayOpponent();
            }

            if (arrTarget && arrTarget.length > 0) {
                var maxNumberTarget = skill.getNumberTargetInRegion();
                if (arrTarget.length > maxNumberTarget) {
                    if (skill.isTargetAllies() ||
                        skill.isTargetSelfAndAllies()) {
                        cc.arrayRemoveObject(arrTarget, this);// do not affect to self when have alliances in team.
                    }
                    if (skill.isTargetSelfAndAllies()) {
                        maxNumberTarget -= 1;// add self for later.
                    }
                }
                var arrTargetSatisfySkill = bb.collection.filterBy(arrTarget, mc.Creature.isSatisfySkillAimTo, skill);
                var arrAND = bb.collection.arrayANDArray(arrTarget, arrTargetSatisfySkill, mc.Creature.isSameBattleId);
                arrAND = skill.sortTargetsBySkillAimTo(arrAND, randomGenerator); // sort if any.
                if (arrAND) {
                    if (arrAND.length > maxNumberTarget) {
                        while (arrAND.length > maxNumberTarget) {// get the best result
                            arrAND.splice(0, 1);
                        }
                    } else if (arrAND.length < maxNumberTarget) {
                        for (var i = 0; i < arrAND.length; i++) { // sure to do not duplicate
                            cc.arrayRemoveObject(arrTarget, arrAND[i]);
                        }
                        while (arrAND.length < maxNumberTarget && arrTarget.length > 0) { // random pick any.
                            var randObj = bb.utility.randomElement(arrTarget, randomGenerator);
                            arrAND.push(randObj);
                            cc.arrayRemoveObject(arrTarget, randObj);
                        }
                    }
                    if (skill.isTargetSelfAndAllies()) {//sure for always have self in team.
                        cc.arrayRemoveObject(arrAND, this);
                        arrAND.push(this);
                    }
                    arrTarget = arrAND;
                }
            }
        } else {
            arrTarget = this.getArrayOpponent();
            if (arrTarget && arrTarget.length > 0) {
                var nearestTarget = this.getNearest(arrTarget);
                if (nearestTarget) {
                    arrTarget = [nearestTarget];
                }
            }
        }
        if (!arrTarget || !arrTarget.length) {
            totalTime = mc.BattleFieldRefactor.TIME_CREATURE_DO_NO_THING;
            return totalTime;
        }
        this.setArrayAimingTarget(arrTarget);
        var _setup = function (battleField, arrTarget) {
            if (!isBuff) {
                var atkCount = mc.dictionary.getCreatureAssetByIndex(this.getResourceId())
                    .getHitData(skill ? skill.getSkillType() : null)["attackCount"];
                this._arrWillHitCountTarget = arrTarget;
                this._mapHittingCountByBattleId = {};
                for (var i = 0; i < this._arrWillHitCountTarget.length; i++) {
                    var cr = this._arrWillHitCountTarget[i];
                    cr._willHitCount += atkCount;
                    this._mapHittingCountByBattleId[cr.battleId] = atkCount;
                }
            }
            if (skill) {
                if (skill.isActive() && skill.getManaCost() > 0) {
                    this.adjustMp(-this.getMp());
                } else if (skill.isAutoCast() && skill.isCoolDownElapsed()) {
                    skill.resetCoolDown();
                }
            }
        }.bind(this);
        if (!this.getBattleField()._executeNow) {
            var arrAction = [cc.callFunc(_setup, this.getBattleField(), arrTarget)];
            if (isRanger) {
                arrAction.push(cc.callFunc(function () {
                    !this.isDead() && !this.isDisable() && this.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_DO_SOTHING, this, skill);
                }.bind(this)));
            } else {
                var isLine = mc.HeroStock.isLineHero({index: this.getResourceId()});
                if (skill) {
                    isLine = mc.HeroStock.isSkillLine(skill.skillInfo);
                }
                arrAction.push(cc.callFunc(function () {
                    this.getBattleField().fireEvent(!isLine ? mc.BattleFieldRefactor.EVENT_CREATURE_MOVETO : mc.BattleFieldRefactor.EVENT_CREATURE_MOVETOLINE, this, skill);
                }.bind(this)));
                arrAction.push(cc.delayTime(mc.BattleFieldRefactor.TIME_CREATURE_MOVETO));
                arrAction.push(cc.callFunc(function () {
                    !this.isDead() && !this.isDisable() && this.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_DO_SOTHING, this, skill);
                }.bind(this)));
            }
            this._currActionTag = this.getBattleField().executeActions(arrAction);
        } else {
            totalTime = -1;
            _setup(this.getBattleField(), arrTarget);
            var atkCount = mc.dictionary.getCreatureAssetByIndex(this.getResourceId())
                .getHitData(skill ? skill.getSkillType() : null)["attackCount"];
            for (var hitIndex = 0; hitIndex < atkCount; hitIndex++) {
                if (skill) {
                    if (skill.isActive()) {
                        this.processActiveHitEvent(hitIndex);
                    } else {
                        this.processAutoHitEvent(hitIndex);
                    }
                } else {
                    this.processNormalHitEvent(hitIndex);
                }
            }
            this.processBackEvent(true);
        }
        return totalTime;
    },

    processNormalHitEvent: function (hitIndex) {
        var creature = this;
        if (creature && creature.getBattleField && creature.getBattleField()) {
            var arrTarget = creature.getArrayAimingTarget();
            var hitData = mc.dictionary.getCreatureAssetByIndex(creature.getResourceId()).getHitData();
            for (var i = 0; i < arrTarget.length; i++) {
                var collision = new mc.HitCollision(creature, arrTarget[i]);
                collision.setHitData(hitIndex - 1, hitData).performCollision(creature.getBattleField());
            }
        }
    },

    processActiveHitEvent: function (hitIndex) {
        var creature = this;
        if (creature && creature.getBattleField && creature.getBattleField()) {
            var arrTarget = creature.getArrayAimingTarget();
            var skill = creature.getActiveSkill();
            if (arrTarget && skill) {
                if (skill.getArrBuffType() != null) {
                    var collision = new mc.EffectCollision(creature, arrTarget, skill);
                    collision.performCollision(creature.getBattleField());
                } else {
                    creature._cacheActiveEffectData = {arrTarget: cc.copyArray(arrTarget), skill: skill};
                }

                var hitData = mc.dictionary.getCreatureAssetByIndex(creature.getResourceId()).getHitData(mc.const.SKILL_TYPE_ACTIVE);
                for (var i = 0; i < arrTarget.length; i++) {
                    var collision = skill.getArrBuffType() != null ? new mc.BuffCollision(creature, arrTarget[i], skill) : new mc.HitCollision(creature, arrTarget[i], skill);
                    collision.setHitData(hitIndex - 1, hitData).performCollision(creature.getBattleField());
                }
            }
        }
    },

    processAutoHitEvent: function (hitIndex) {
        var creature = this;
        if (creature && creature.getBattleField && creature.getBattleField()) {
            var arrTarget = creature.getArrayAimingTarget();
            var skill = creature.getAutoCastSkill();
            if (arrTarget && skill) {
                if (skill.getArrBuffType() != null) {
                    var collision = new mc.EffectCollision(creature, arrTarget, skill);
                    collision.performCollision(creature.getBattleField());
                } else {
                    creature._cacheAutoEffectData = {arrTarget: cc.copyArray(arrTarget), skill: skill};
                }

                var hitData = mc.dictionary.getCreatureAssetByIndex(creature.getResourceId()).getHitData(mc.const.SKILL_TYPE_AUTO_CAST);
                for (var i = 0; i < arrTarget.length; i++) {
                    var collision = skill.getArrBuffType() != null ? new mc.BuffCollision(creature, arrTarget[i], skill) : new mc.HitCollision(creature, arrTarget[i], skill);
                    collision.setHitData(hitIndex - 1, hitData).performCollision(creature.getBattleField());
                }
            }
        }
    },

    processBackEvent: function (endTurnNow) {
        var isBack = false;
        var creature = this;
        if (creature && creature.getBattleField && creature.getBattleField() && creature.isGettingTurn()) {

            if (creature._cacheActiveEffectData) {
                var data = creature._cacheActiveEffectData;
                var collision = new mc.EffectCollision(creature, data.arrTarget, data.skill);
                collision.performCollision(creature.getBattleField());
                creature._cacheActiveEffectData = null;
            }

            if (creature._cacheAutoEffectData) {
                var data = creature._cacheAutoEffectData;
                var collision = new mc.EffectCollision(creature, data.arrTarget, data.skill);
                collision.performCollision(creature.getBattleField());
                creature._cacheAutoEffectData = null;
            }

            if (endTurnNow) {
                creature.stopDoing();
                creature.getBattleField().endActionFor(creature);
            } else {
                creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_BACKTO, creature);
            }
            isBack = true;
        }
        return isBack;
    },

    isMonster: function () {
        return this.info.monster;
    },

    setEnableAvatar: function (enableAvatar) {
        this._enableAvatar = enableAvatar;
    },

    isEnableAvatar: function () {
        if (this._enableAvatar === undefined) {
            this._enableAvatar = true;
        }
        return this._enableAvatar;
    },

    toInfo: function () {
        this.info.setCurrentHpPercent(this.getHP() / this.getTotalMaxHp());
        this.info.setCurrentMpPercent(this.getMp() / this.getTotalMaxMp());
        this.info.setCooldownMap(this._cooldownMap);
        return this.info;
    },

    toIDString: function () {
        return this.entityId + "[" + this.battleId + "] ";
    }

});

mc.Creature.isAlive = function (creature) {
    return !creature.isDead();
};

mc.Creature.isSameBattleId = function (creature1, creature2) {
    return creature1.battleId === creature2.battleId;
};

mc.Creature.notSame = function (creature, ignore) {
    return creature != ignore;
};

mc.Creature.isSatisfySkillAimTo = function (creature, skill) {
    return skill.isValidAimTo(creature);
};

mc.Creature.isSameTeamId = function (creature, teamId) {
    return creature.getTeamId() === teamId;
};

mc.Creature.isGreaterHp = function (creature1, creature2) {
    return creature1.getHP() > creature2.getHP();
};

mc.Creature.isLowerHp = function (creature1, creature2) {
    //return (creature1.getHP() / creature1.getTotalMaxHp()) < (creature2.getHP() / creature2.getTotalMaxHp()) ;
    return (creature1.getTotalMaxHp()) < (creature2.getTotalMaxHp());
};

mc.Creature.MAP_NEAR_ENEMY_POS_BY_POS = {
    0: [0, 1, 3, 4, 2],
    1: [1, 0, 3, 2, 4],
    2: [1, 2, 3, 0, 4],
    4: [0, 4, 3, 1, 2]
};
mc.Creature.MAP_NEAR_ALLY_POS_BY_POS = {
    0: [0, 1, 3, 4, 2],
    1: [1, 0, 3, 2, 4],
    2: [1, 2, 3, 0, 4],
    4: [0, 4, 3, 1, 2]
};

mc.CreatureTeamShareInformation = cc.Class.extend({
    ultimatePower: 0,

    addUltimatePower: function (power) {
        this.ultimatePower += power;
        if (this.ultimatePower > 100) {
            this.ultimatePower = 100;
        }
    },

    getUltimatePower: function () {
        return this.ultimatePower;
    },

    isFullUltimatePower: function () {
        return this.ultimatePower >= 100;
    },

    usingUltimatePower: function () {
        this.ultimatePower = 0;
    }
});

mc.LateUpdate = cc.Class.extend({
    _value: 0,
    _arrObj: null,
    _key: null,

    ctor: function (key) {
        this._key = key;
    },

    addValue: function (value) {
        this._value += value;
    },

    getValue: function () {
        return this._value;
    },

    addObj: function (obj) {
        !this._arrObj && (this._arrObj = []);
        this._arrObj.push(obj);
    },

    getArrayObj: function () {
        return this._arrObj;
    },

    getKey: function () {
        return this._key;
    }

});

mc.LateUpdate.TABLE_PRIORITY_SKILL_LATE_UPDATE = {};
mc.LateUpdate.TABLE_PRIORITY_SKILL_LATE_UPDATE[mc.const.LATE_UPDATE_REFLECT_DAMAGE] = 0;
mc.LateUpdate.TABLE_PRIORITY_SKILL_LATE_UPDATE[mc.const.LATE_UPDATE_LIFE_STEAL] = 1;
mc.LateUpdate.TABLE_PRIORITY_SKILL_LATE_UPDATE[mc.const.LATE_UPDATE_BURN_MANA] = 2;
mc.LateUpdate.TABLE_PRIORITY_SKILL_LATE_UPDATE[mc.const.LATE_UPDATE_BUFF] = 3;

mc.CreatureInfo = cc.Class.extend({
    serverId: null,
    resourceId: 0,
    attack: 0,
    defense: 0,
    magic: 0,
    resistant: 0,
    speed: 0,
    hp: 0,
    mp: 0,
    level: 0,
    element: mc.const.ELEMENT_NONE,

    arrCrit: null,
    currCrit: 0,
    skillList: null,
    optionSkillList: null,
    currHpPercentByLong: 0,
    currMpPercentByLong: 0,
    ultimate: false,
    petEquipment:null,

    cooldownMap: null,

    hpServerControl: false,

    ctor: function () {
        this.skillList = [];
        this.optionSkillList = [];
    },

    copyHeroInfo: function (heroInfo) {
        cc.log("******* copy hero info");
        cc.log(heroInfo);
        cc.log("*****************");
        this.resourceId = heroInfo.index;
        this.attack = mc.CreatureInfo.encryptNumber((mc.const.CHEAT_GOD_DAMAGE * 100000 + heroInfo.atk) || 1);
        this.defense = mc.CreatureInfo.encryptNumber(heroInfo.def || 1);
        this.magic = mc.CreatureInfo.encryptNumber(heroInfo.mag || 1);
        this.resistant = mc.CreatureInfo.encryptNumber(heroInfo.res || 1);
        this.speed = mc.CreatureInfo.encryptNumber(heroInfo.spd || 1);
        this.hp = mc.CreatureInfo.encryptNumber(heroInfo.hp || 1);
        this.mp = mc.CreatureInfo.encryptNumber(heroInfo.maxMp || 1000);
        this.mpRec = heroInfo.mpRec;
        this.crit = heroInfo.crit;
        this.level = heroInfo.level;
        this.ranger = heroInfo.range || mc.HeroStock.isRangerHero(heroInfo);
        this.skillList = mc.HeroStock.getHeroSkillList(heroInfo);
        this.optionSkillList = mc.HeroStock.getHeroOptionsSkillList(heroInfo);
        this.element = heroInfo.element;
        this.name = heroInfo.name;
        this.attackType = heroInfo.attackType;
        var local = mc.dictionary.getHeroDictByIndex(this.resourceId);
        if (local) {
            if (!this.attackType) {
                this.attackType = local.attackType;
            }
            if (!this.element) {
                this.element = local.element;
            }
        }
        this.serverId = heroInfo.id;
        this.monster = false;
        this.petEquipment = heroInfo.petEquipment
        this.gameHeroId = heroInfo.gameHeroId;
        this.currHpPercentByLong = 1 * mc.CreatureInfo.CAST_LONG_RATE;
        this.currMpPercentByLong = 0;
        return this;
    },

    copyMonsterInfo: function (monsterInfo, id) {
        this.resourceId = monsterInfo.index;
        this.attack = mc.CreatureInfo.encryptNumber(monsterInfo.atk || 1);
        this.magic = mc.CreatureInfo.encryptNumber(monsterInfo.mag || 1);
        this.defense = mc.CreatureInfo.encryptNumber(monsterInfo.def || 1);
        this.resistant = mc.CreatureInfo.encryptNumber(monsterInfo.res || 1);
        this.speed = mc.CreatureInfo.encryptNumber(monsterInfo.spd || 1);
        this.hp = mc.CreatureInfo.encryptNumber(monsterInfo.hp || 1);
        this.mp = mc.CreatureInfo.encryptNumber(monsterInfo.maxMP || 1000);
        this.mpRec = monsterInfo.mpRec;
        this.crit = monsterInfo.crit || 0;
        this.level = monsterInfo.level;
        this.ranger = monsterInfo.range;
        this.element = monsterInfo.element;
        this.name = monsterInfo.name;
        this.attackType = monsterInfo.attackType;
        var local = mc.dictionary.getCreatureDictByIndex(this.resourceId);
        if (local) {
            if (!this.attackType) {
                this.attackType = local.attackType;
            }
            if (!this.element) {
                this.element = local.element;
            }
        }
        this.serverId = id || monsterInfo.id;
        this.monster = true;
        var arrSkill = [];
        var strSkill = monsterInfo.skillIndex;
        if (strSkill) {
            var arrStrIndex = strSkill.split('#');
            for (var i = 0; i < arrStrIndex.length; i++) {
                arrSkill.push({
                    index: parseInt(arrStrIndex[i]),
                    level: 1
                })
            }
        }
        this.skillList = arrSkill;
        this.currHpPercentByLong = 1 * mc.CreatureInfo.CAST_LONG_RATE;
        this.currMpPercentByLong = 0;
        return this;
    },

    getBasicAttack: function () {
        return mc.CreatureInfo.decryptNumber(this.attack);
    },

    getBasicMagic: function () {
        return mc.CreatureInfo.decryptNumber(this.magic);
    },

    getBasicDefense: function () {
        return mc.CreatureInfo.decryptNumber(this.defense);
    },

    getBasicResistant: function () {
        return mc.CreatureInfo.decryptNumber(this.resistant);
    },

    getBasicSpeed: function () {
        return mc.CreatureInfo.decryptNumber(this.speed);
    },

    getBasicHp: function () {
        return mc.CreatureInfo.decryptNumber(this.hp);
    },

    getBasicMp: function () {
        return mc.CreatureInfo.decryptNumber(this.mp);
    },

    setCurrentHpPercent: function (hpPercent) {
        this.currHpPercentByLong = hpPercent * mc.CreatureInfo.CAST_LONG_RATE;
        return this;
    },

    setCurrentMpPercent: function (mpPercent) {
        this.currMpPercentByLong = mpPercent * mc.CreatureInfo.CAST_LONG_RATE;
        return this;
    },

    setCurrentHpPercentByLong: function (hpPercent) {
        this.currHpPercentByLong = hpPercent;
        return this;
    },

    setCurrentMpPercentByLong: function (mpPercent) {
        this.currMpPercentByLong = mpPercent;
        return this;
    },

    setCooldownMap: function (cooldownMap) {
        this.cooldownMap = cooldownMap;
        return this;
    },

    getCurrentHpPercentByLong: function () {
        return this.currHpPercentByLong;
    },

    getCurrentMpPercentByLong: function () {
        return this.currMpPercentByLong;
    }

});

mc.CreatureInfo.CAST_LONG_RATE = 1000000;
mc.CreatureInfo.encryptNumber = function (num) {
    var neg = 1;
    if (num < 0) {
        num = Math.abs(num);
        neg = -1;
    }
    var str = "" + Math.floor(num);
    var arrNum = [];
    for (var i = 0; i < str.length; i++) {
        arrNum[i] = parseInt(str[i]) * neg;
        neg = 1;
    }
    return arrNum;
};

mc.CreatureInfo.decryptNumber = function (arrNum) {
    var num = 0;
    if (arrNum) {
        var neg = 1;
        if (arrNum[0] < 0) {
            arrNum[0] = Math.abs(arrNum[0]);
            neg = -1;
        }
        var base = 1;
        for (var i = arrNum.length - 1; i >= 0; i--) {
            num += (arrNum[i] * base);
            base = base * 10;
        }
        arrNum[0] = arrNum[0] * neg;
        num *= neg;
    }
    return num
};
