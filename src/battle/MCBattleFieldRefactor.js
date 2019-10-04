/**
 * Created by long.nguyen on 1/9/2018.
 */
mc.BattleFieldRefactor = cc.Node.extend({
    _arrCreature: null,
    _mapCreatureByServerId: null,
    _mapCreatureByBattleId: null,
    _arrCreatureGotTurn: null,
    _mapDoingActionByServerId: null,
    _tagGenerator: 0,
    _listenerGenerator: 0,
    _pauseMainLoop: false,
    _isEnd: false,
    _waitToAppear: true,
    _fireEndEvent: false,
    _countDropItem: 0,
    _isPausing: false,
    _executeNow: false,
    _totalBattleDurationInSecond: 0,
    _mapOfMapListenerByEventId: null,
    _mapTotalDamageByCreatureId: null,
    _mapTotalIncurByCreatureId: null,
    _mapTotalBuffByCreatureId: null,

    _arrEndTurnCreature:null,
    _arrCountDownCreature:null,
    _maxBattleDurationInMs:0,

    ctor: function (playerTeamSide, randomSeed) {
        this._super();
        this._playerTeamSide = playerTeamSide || mc.const.TEAM_RIGHT;
        this._mapTotalDamageByCreatureId = {};
        this._mapTotalIncurByCreatureId = {};
        this._mapTotalBuffByCreatureId = {};
        this._arrCreature = [];
        this._arrCreatureGotTurn = [];
        this._arrEndTurnCreature = [];
        this._arrCountDownCreature = [];
        this._mapCreatureByBattleId = {};
        this._mapCreatureByServerId = {};
        this._mapOfMapListenerByEventId = {};
        this._randomGenerator = new bb.Random(randomSeed || bb.now());
        this._maxBattleDurationInMs = mc.const.MAX_BATTLE_DURATION_IN_MS;
        this.scheduleUpdate();
    },

    onExit: function () {
        this._super();
        this._mapOfMapListenerByEventId = {};
    },

    setMaxBattleDurationInMs:function(durationInMs){
        this._maxBattleDurationInMs = durationInMs ||mc.const.MAX_BATTLE_DURATION_IN_MS ;
    },

    getRandomGenerator: function () {
        return this._randomGenerator;
    },

    _ccDelayTime: function (delay) {
        return cc.delayTime(delay / mc.const.BATTLE_TIME_SCALE);
    },

    countDropItem: function (count) {
        this._countDropItem += count;
    },

    isDropItem: function () {
        return this._countDropItem > 0;
    },

    executeActions: function (arrAction) {
        var act = cc.sequence(arrAction);
        act.setTag(++this._tagGenerator);
        this.runAction(act);
        return this._tagGenerator;
    },

    addBattleListener: function (eventId, callback) {
        if (!this._mapOfMapListenerByEventId[eventId]) {
            this._mapOfMapListenerByEventId[eventId] = {};
        }
        var key = ++this._listenerGenerator;
        this._mapOfMapListenerByEventId[eventId][key] = callback;
        return key;
    },

    removeBattleListenerByKey: function (eventId, key) {
        var mapListener = this._mapOfMapListenerByEventId[eventId];
        if (mapListener) {
            delete mapListener[key];
        }
    },

    removeBattleListener: function (eventId) {
        this._mapOfMapListenerByEventId[eventId] = {};
    },

    fireEvent: function (eventId, creatrue, data) {
        var mapListener = this._mapOfMapListenerByEventId[eventId];
        if (mapListener) {
            var arrListener = bb.utility.mapToArray(mapListener);
            for (var i = 0; i < arrListener.length; i++) {
                var cb = arrListener[i];
                if (cb) {
                    cb({
                        battleField: this,
                        creature: creatrue,
                        data: data
                    });
                }
            }
        }
    },

    addGroup: function (creatureGroup, teamId) {
        for (var i = 0; i < creatureGroup.numberOfCreature(); i++) {
            this.addCreature(creatureGroup.getCreatureAt(i), teamId);
        }
        var attachCreature = creatureGroup.getAttachCreature();
        if (attachCreature) {
            this._arrCreature.push(attachCreature);
            this._mapCreatureByServerId[attachCreature.getServerId()] = attachCreature;
            this._mapCreatureByBattleId[attachCreature.battleId] = attachCreature;
            attachCreature.setBattleFieldRefactor(this);
            attachCreature.setTeamId(teamId);
        }
    },

    removeGroup: function (creatureGroup) {
        for (var i = 0; i < creatureGroup.numberOfCreature(); i++) {
            this.removeCreature(creatureGroup.getCreatureAt(i));
        }
    },

    addMoreDamageByCreatureId: function (damage, creatureId) {
        if (!this._mapTotalDamageByCreatureId[creatureId]) {
            this._mapTotalDamageByCreatureId[creatureId] = 0;
        }
        this._mapTotalDamageByCreatureId[creatureId] += damage;
    },

    addMoreIncurByCreatureId: function (incur, creatureId) {
        if (!this._mapTotalIncurByCreatureId[creatureId]) {
            this._mapTotalIncurByCreatureId[creatureId] = 0;
        }
        this._mapTotalIncurByCreatureId[creatureId] += incur;
    },

    addMoreBuffByCreatureId: function (incur, creatureId) {
        if (!this._mapTotalBuffByCreatureId[creatureId]) {
            this._mapTotalBuffByCreatureId[creatureId] = 0;
        }
        this._mapTotalBuffByCreatureId[creatureId] += incur;
    },

    getTotalDamageByCreatureId: function (creatureId) {
        return this._mapTotalDamageByCreatureId[creatureId] ? this._mapTotalDamageByCreatureId[creatureId] : 0;
    },

    getMaxStatDamage: function () {
        var val = 0;
        if (this._mapTotalDamageByCreatureId) {
            for (var id in this._mapTotalDamageByCreatureId) {
                this._mapTotalDamageByCreatureId[id] && (val = Math.max(val, this._mapTotalDamageByCreatureId[id]));
            }
        }
        return val;
    },

    getTotalIncurByCreatureId: function (creatureId) {
        return this._mapTotalIncurByCreatureId[creatureId] ? this._mapTotalIncurByCreatureId[creatureId] : 0;
    },

    getMaxStatIncur: function () {
        var val = 0;
        if (this._mapTotalIncurByCreatureId) {
            for (var id in this._mapTotalIncurByCreatureId) {
                this._mapTotalIncurByCreatureId[id] && (val = Math.max(val, this._mapTotalIncurByCreatureId[id]));
            }
        }
        return val;
    },

    getTotalBuffByCreatureId: function (creatureId) {
        return this._mapTotalBuffByCreatureId[creatureId] ? this._mapTotalBuffByCreatureId[creatureId] : 0;
    },

    getMaxStatBuff: function () {
        var val = 0;
        if (this._mapTotalBuffByCreatureId) {
            for (var id in this._mapTotalBuffByCreatureId) {
                this._mapTotalBuffByCreatureId[id] && (val = Math.max(val, this._mapTotalBuffByCreatureId[id]));
            }
        }
        return val;
    },

    addForeignCreature: function (creature, teamId, pos) {
        var maxBattleId = 0;
        for (var i = 0; i < this._arrCreature.length; i++) {
            maxBattleId = Math.max(maxBattleId, this._arrCreature[i].battleId);
        }
        creature.battleId = maxBattleId + 1;
        this.addCreature(creature, teamId);
        creature.colBattleCell = pos.x;
        creature.rowBattleCell = pos.y;

        creature.calculatePersonalInfo();
        this.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_ENTER, creature, true);
        creature.calculatePassiveSkill();
        creature.calculateApplyingSkillForOthers(this._arrCreature);
        creature.updateInfo();
        creature.setEnterBattleField(true);
        this.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_ENTER, creature);
    },

    addCreature: function (creature, teamId) {
        this._arrCreature.push(creature);
        this._mapCreatureByServerId[creature.getServerId()] = creature;
        this._mapCreatureByBattleId[creature.battleId] = creature;
        creature.setBattleFieldRefactor(this);
        creature.setTeamId(teamId);
    },

    removeCreature: function (creature) {
        cc.arrayRemoveObject(this._arrCreature, creature);
        delete this._mapCreatureByServerId[creature.getServerId()];
        delete this._mapCreatureByBattleId[creature.battleId];
        creature.setBattleFieldRefactor(null);
        this.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_EXIT, creature);
    },

    _refreshTurn: function () {
        this._arrCreatureGotTurn = [];
        for (var i = 0; i < this._arrCreature.length; i++) {
            var creature = this._arrCreature[i];
            if (!creature.isDead()) {
                this._arrCreatureGotTurn.push(creature);
            }
        }
        this._arrCreatureGotTurn.sort(function (creature1, creature2) {
            return creature1.getTotalSpeed() - creature2.getTotalSpeed();
        });
    },

    getAllCreatureOfTeam: function (teamId) {
        var arr = [];
        for (var i = 0; i < this._arrCreature.length; i++) {
            var creature = this._arrCreature[i];
            if (creature.getTeamId() === teamId) {
                arr.push(creature);
            }
        }
        return arr;
    },

    getAllCreature: function () {
        return cc.copyArray(this._arrCreature);
    },

    getOpponentOfCreature: function (creature) {
        if (creature.getTeamId() === mc.const.TEAM_LEFT) {
            return this.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
        }
        return this.getAllCreatureOfTeam(mc.const.TEAM_LEFT);
    },

    getAlliesOfCreature: function (creature, ignoreCr) {
        if (!ignoreCr) {
            if (creature.getTeamId() === mc.const.TEAM_LEFT) {
                return this.getAllCreatureOfTeam(mc.const.TEAM_LEFT);
            }
            return this.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
        }
        if (creature.getTeamId() === mc.const.TEAM_LEFT) {
            return bb.collection.filterBy(this.getAllCreatureOfTeam(mc.const.TEAM_LEFT), mc.Creature.notSame, creature);
        }
        return bb.collection.filterBy(this.getAllCreatureOfTeam(mc.const.TEAM_RIGHT), mc.Creature.notSame, creature);
    },

    setupBattle: function () {
        // create the basic info.
        for (var i = this._arrCreature.length - 1; i >= 0; i--) {
            var creature = this._arrCreature[i];
            if (!creature.isEnterBattleField()) {
                creature.setAutoUseUltimate(true);
                creature.setEnableAvatar(false);
                if (creature.getTeamId() === this._playerTeamSide) {
                    creature.setAutoUseUltimate(this.isAuto());
                    creature.setEnableAvatar(true);
                }
                creature.calculatePersonalInfo();
            }
            this.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_ENTER, creature);// create UI
        }
        // update info with leader, passive skill.
        for (var i = 0; i < this._arrCreature.length; i++) {
            var creature = this._arrCreature[i];
            if (!creature.isEnterBattleField()) {
                creature.calculatePassiveSkill();
            }
            creature.calculateApplyingSkillForOthers(this._arrCreature);
        }

        //update UI
        for (var i = 0; i < this._arrCreature.length; i++) {
            var creature = this._arrCreature[i];
            creature.updateInfo();
            creature.setEnterBattleField(true);
            this.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_ENTER, creature); // Update UI
        }
    },

    setNoneResetBattleDuration:function(isNoneReset){
        this._isNoneResetBattleDuration = isNoneReset;
        this._fixedStartTimeInMs = null;
    },

    startToCombat: function (turnMode) {
        this._isEnd = false;
        this._waitToAppear = true;
        this._fireEndEvent = false;
        this._countDropItem = false;
        this._isWaiting = false;
        this._pauseMainLoop = false;
        this._forceWinGroupId = null;
        if( this._isNoneResetBattleDuration && !this._fixedStartTimeInMs ){
            this._fixedStartTimeInMs = Date.now();
        }
        this._markTimeStartBattleInMs = this._fixedStartTimeInMs || Date.now();
        this._totalBattleDurationInSecond = this._fixedStartTimeInMs ? this._totalBattleDurationInSecond : 0;
        this._turnCount = !turnMode ? undefined : Math.round(this._maxBattleDurationInMs/1000);
        var haveABoss = false;
        for (var i = 0; i < this._arrCreature.length; i++) {
            if (this._arrCreature[i].isBoss()) {
                haveABoss = true;
            }
        }
        this._refreshTurn();
        var _start = function () {
            for (var i = this._arrCreature.length - 1; i >= 0; i--) {
                var creature = this._arrCreature[i];
                creature.setEnableInput(true);
            }
            this._waitToAppear = false;
            this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_START);
        }.bind(this);
        if (!this._executeNow) {
            this.runAction(cc.sequence(this._ccDelayTime(haveABoss ? 3.0 : 1.0), cc.callFunc(_start)));
            this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_READY, null, haveABoss);
        } else {
            this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_READY, null, haveABoss);
            _start();
        }
    },

    getBattleDurationInMs: function () {
        var mrkTime = this._markTimeBattlePause || Date.now();
        var dur = (mrkTime - this._markTimeStartBattleInMs) * mc.const.BATTLE_TIME_SCALE;
        dur <= 0 && (dur = 0);
        return Math.round(this._totalBattleDurationInSecond) * 1000;
    },

    setTimeScale: function (scaleTime) {
        cc.director.getScheduler().setTimeScale(scaleTime);
        mc.const.BATTLE_TIME_SCALE = scaleTime;
    },

    pauseCombat: function () {
        this.pause();
        this._isPausing = true;
        this._markTimeBattlePause = Date.now();
    },

    resumeCombat: function () {
        this.resume();
        this._isPausing = false;
        if (this._markTimeBattlePause > 0) {
            var durPause = Date.now() - this._markTimeBattlePause;
            this._markTimeBattlePause = 0;
            this._markTimeStartBattleInMs += durPause;
        }
    },

    isPausing: function () {
        return this._isPausing;
    },

    endBattleWithWinGroupId: function (winGroupId) {
        this._forceWinGroupId = winGroupId;
        this.stopAllActions();
    },

    _checkWin: function () {
        var isDoingAction = this._arrEndTurnCreature.length > 0;
        if (!isDoingAction) {
            if (!this._isEnd) {
                var winTeamId = this.getWinningTeamId();
                if (winTeamId) {
                    this._isEnd = true;
                    for (var i = this._arrCreature.length - 1; i >= 0; i--) {
                        var creature = this._arrCreature[i];
                        creature.setEnableInput(false);
                    }
                    if (!this._executeNow) {
                        var delay = !this.isDropItem() ? mc.BattleFieldRefactor.TIME_END_BATTLE : mc.BattleFieldRefactor.TIME_END_BATTLE_WHEN_DROP_ITEM;
                        this.runAction(cc.sequence([cc.delayTime(delay), cc.callFunc(function () {
                            if (this._isEnd && !this._fireEndEvent) {
                                this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END);
                                this._fireEndEvent = true;
                                this.setTimeScale(1.0);
                            }
                        }.bind(this))]));
                    } else {
                        if (this._isEnd && !this._fireEndEvent) {
                            this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END);
                            this._fireEndEvent = true;
                        }
                    }
                } else {
                    this.runCombat();
                }
            }
        }
    },

    getWinningTeamId: function () {
        if (!this._forceWinGroupId) {
            var win = null;
            var isAliveLeft = false;
            var isAliveRight = false;
            for (var i = 0; i < this._arrCreature.length; i++) {
                var creature = this._arrCreature[i];
                if (!creature.isDead() || creature.isReviving()) {
                    if (creature.getTeamId() === mc.const.TEAM_LEFT) {
                        isAliveLeft = true;
                    } else if (creature.getTeamId() === mc.const.TEAM_RIGHT) {
                        isAliveRight = true;
                    }
                }
            }
            if (!isAliveLeft && !isAliveRight) {
                win = mc.const.TEAM_LEFT + "&" + mc.const.TEAM_RIGHT; // draw
            } else if (!isAliveRight) {
                win = mc.const.TEAM_LEFT; // left win
            } else if (!isAliveLeft) {
                win = mc.const.TEAM_RIGHT; // right win
            }
            if (!win) {
                var dur = this.getBattleDurationInMs();
                if ((this._maxBattleDurationInMs - dur) <= 0 ||
                    this._turnCount <= 0 ) {
                    win = mc.const.TEAM_LEFT;
                }
            }
            if (mc.const.CHEAT_WIN_WAVE_DURATION > 0) {
                win = mc.const.TEAM_RIGHT;
            }
            if (mc.const.CHEAT_WIN_BATTLE_DURATION > 0) {
                win = mc.const.TEAM_RIGHT;
            }
            return win;
        }
        return this._forceWinGroupId;
    },

    takeFirstTurnForCreature: function (creature) {
        this._arrCreatureGotTurn.push(creature);
    },

    _doUltimateActionForCreature: function (creature) {
        if (!creature.isLostTurn() && !creature.isDead()) {
            this._pauseMainLoop = true;
            cc.arrayRemoveObject(this._arrCreatureGotTurn, creature);
            this._pushUniqueCreatureTo(this._arrEndTurnCreature, creature);

            var delay = creature._doUltimateAction();
            if (delay > 0) {
                this.runAction(cc.sequence([this._ccDelayTime(delay), cc.callFunc(function (node, creature) {
                    this.endActionFor(creature);
                }.bind(this), this, creature)]));
            }
        }
    },

    _countDownPerTurn: function (node, creature) {
        this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_COUNT_TURN, creature);
        creature.countDownPerTurn();
        creature.cleanEffects();
    },

    _doActionForCreature: function (node, creature) {
        if (!this._isWaiting) {
            if (!this._executeNow) {
                var isLostTurn = creature.isLostTurn();
                if (isLostTurn && !creature.isDead()) {
                    this.runAction(cc.sequence([this._ccDelayTime(mc.BattleFieldRefactor.TIME_CREATURE_DO_NO_THING), cc.callFunc(function (node, creature) {
                        this.endActionFor(creature);
                    }.bind(this), this, creature)]));
                } else {
                    var delay = creature.doAction();
                    if (delay > 0) {
                        this.runAction(cc.sequence([this._ccDelayTime(delay), cc.callFunc(function (node, creature) {
                            this.endActionFor(creature);
                        }.bind(this), this, creature)]));
                    }
                }
            } else {
                var isLostTurn = creature.isLostTurn();
                if (isLostTurn && !creature.isDead()) {
                    this.endActionFor(creature);
                } else {
                    creature.doAction();
                    this.endActionFor(creature);
                }
            }
        }
    },

    _doUpdatingEffectFor: function (node, creature) {
        if (creature._arrUpdatingEffectObject && creature._currUpdatingEffectIndex < creature._arrUpdatingEffectObject.length) {
            mc.BattleCollisionRefactor.calculateUpdateEffect(creature, creature._arrUpdatingEffectObject[creature._currUpdatingEffectIndex]);
            creature._currUpdatingEffectIndex++;
            if (creature._currUpdatingEffectIndex >= creature._arrUpdatingEffectObject.length) {
                creature._currUpdatingEffectIndex = 0;
                creature._arrUpdatingEffectObject = null;
            }
        }
    },

    _doUpdatingArrayEffect: function (creature, arrEffect) {
        creature._arrUpdatingEffectObject = arrEffect;
        creature._currUpdatingEffectIndex = 0;
        if (!this._executeNow) {
            var arrAction = [];
            for (var i = 0; i < arrEffect.length; i++) {
                arrAction.push(cc.callFunc(this._doUpdatingEffectFor.bind(this), this, creature));
                arrAction.push(this._ccDelayTime(mc.BattleFieldRefactor.TIME_UPDATE));
            }
            arrAction.push(cc.callFunc(this._doActionForCreature.bind(this), this, creature));
            this.runAction(cc.sequence(arrAction));
        } else {
            for (var i = 0; i < arrEffect.length; i++) {
                this._doUpdatingEffectFor(this, creature);
            }
            this._doActionForCreature(this, creature);
        }
    },

    _doLateUpdatingFor: function (node, creature) {
        if (creature._arrLateUpdatingByObject && creature._currLateUpdatingIndex < creature._arrLateUpdatingByObject.length) {
            mc.BattleCollisionRefactor.calculateLateUpdateObject(creature, creature._arrLateUpdatingByObject[creature._currLateUpdatingIndex]);
            creature._currLateUpdatingIndex++;
            if (creature._currLateUpdatingIndex >= creature._arrLateUpdatingByObject.length) {
                creature._currLateUpdatingIndex = 0;
                if (creature._mapLateUpdateById) {
                    var arr = creature._arrLateUpdatingByObject;
                    for (var i = 0; i < arr.length; i++) {
                        delete creature._mapLateUpdateById[arr[i].getKey()];
                    }
                    if (JSON.stringify(creature._mapLateUpdateById) == "{}") {
                        creature._mapLateUpdateById = null;
                    }
                }
                creature._arrLateUpdatingByObject = null;
            }
        }
    },

    _doLateUpdatingArray: function (creature, arrLateUpdate) {
        if (!creature._arrLateUpdatingByObject) {
            creature._arrLateUpdatingByObject = arrLateUpdate;
            creature._currLateUpdatingIndex = 0;
        } else {
            bb.collection.arrayAppendArray(creature._arrLateUpdatingByObject, arrLateUpdate);
        }
    },

    endActionFor: function (creature) {
        for (var i = 0; i < this._arrCreature.length; i++) {
            var cr = this._arrCreature[i];
            if (!cr.isDead() && !cr.isReviving()) {
                var arrLateUpdate = cr.getArrayLateUpdateObject();
                if (arrLateUpdate) {
                    this._doLateUpdatingArray(cr, arrLateUpdate);
                }
            }
        }
        this._pushUniqueCreatureTo(this._arrCountDownCreature, creature);
    },

    setAuto: function (isAuto) {
        this._isAuto = isAuto;
        for (var i = this._arrCreature.length - 1; i >= 0; i--) {
            var creature = this._arrCreature[i];
            if (creature.getTeamId() === this._playerTeamSide) {
                creature.setAutoUseUltimate(this.isAuto());
            }
        }
        this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_CHANGE_MODE, undefined, isAuto);
    },

    isAuto: function () {
        return this._isAuto;
    },

    setWaiting: function (isWaiting) {
        this._isWaiting = isWaiting;
        this._pauseMainLoop = isWaiting;
    },

    outOfCombatWithTeamId: function (teamId) {
        this._pauseMainLoop = true;
        this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_OUT_OF_COMBAT, undefined, teamId);
    },


    update: function (dt) {
        if (!this._waitToAppear && !this._isWaiting) {
            var isDone = this._performUpdate(dt);
            !isDone && this._checkWin();
            this._totalBattleDurationInSecond += dt;
        }
    },

    _pushUniqueCreatureTo: function (arr, creature) {
        var isFound = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === creature) {
                isFound = true;
                break;
            }
        }
        !isFound && (arr.push(creature));
    },

    _performUpdate: function (dt) {
        var isDone = false;
        if (this._arrCreature) { // always update all creature in battle.
            for (var i = 0; i < this._arrCreature.length; i++) {
                var cr = this._arrCreature[i];
                if (cr && cr._arrLateUpdatingByObject) {
                    this._doLateUpdatingFor(this, cr);
                    isDone = true;
                }
            }

            if (!isDone && this._arrCountDownCreature.length > 0) {
                isDone = true;
                while (this._arrCountDownCreature.length > 0) {
                    var cr = this._arrCountDownCreature.pop();
                    this._countDownPerTurn(this, cr);
                    cc.arrayRemoveObject(this._arrEndTurnCreature, cr);
                }
            }

            if (!isDone && !this._arrEndTurnCreature.length && !this._isWaiting) {
                this._pauseMainLoop = false;
            }

            // if any creature is in 'end-turn' list but isn't in 'count-down' list.
            if (!isDone && !this._arrCountDownCreature.length && this._arrEndTurnCreature.length > 0) {
                var isFreeze = false;
                for (var i = 0; i < this._arrEndTurnCreature.length; i++) {
                    var cr = this._arrEndTurnCreature[i];
                    if (cr) {
                        isFreeze = cr.isDead() || cr.isDisable();
                        break;
                    }
                }
                if (isFreeze) {
                    if (!this._msFixFreeze) {
                        this._msFixFreeze = 0;
                    }
                    this._msFixFreeze += dt;
                    if (this._msFixFreeze >= 4.0) {
                        this._arrEndTurnCreature.length = 0;
                    }
                } else {
                    this._msFixFreeze = 0;
                }
            }
        }
        if (this._mapReviveForNextUpdate) {
            for (var id in this._mapReviveForNextUpdate) {
                this.setLiveAfterRevivingForCreature(this._mapReviveForNextUpdate[id]);
            }
            this._mapReviveForNextUpdate = null;
        }
        return isDone;
    },

    setRevivingForCreature: function (creature) {
        creature.setReviving(true);
        this._pushUniqueCreatureTo(this._arrEndTurnCreature, creature); // wait for creature revive
        if (this._executeNow) {
            if (!this._mapReviveForNextUpdate) {
                this._mapReviveForNextUpdate = {};
            }
            this._mapReviveForNextUpdate[creature.getServerId()] = creature;
        }
    },

    setLiveAfterRevivingForCreature: function (creature) {
        creature.adjustHp(1);
        creature.setReviving(false);
        this.endActionFor(creature);
        this.fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_REVIVE, creature);
    },

    isCreatureGettingTurn: function (creature) {
        var isGettingTurn = false;
        for (var i = 0; i < this._arrEndTurnCreature.length; i++) {
            if (this._arrEndTurnCreature[i] === creature) {
                isGettingTurn = true;
                break;
            }
        }
        return isGettingTurn;
    },

    runCombat: function () {
        if (!this._pauseMainLoop) {
            if (this._arrCreature) { // always update all creature in battle.
                for (var i = 0; i < this._arrCreature.length; i++) {
                    this._arrCreature[i] && this._arrCreature[i].resetVariable();
                }
            }
            if (this._arrCreatureGotTurn.length > 0) {// pick the highest speed creature for getting turn.
                var creature = this._arrCreatureGotTurn.pop();
                if (!creature.isDead() && !creature.isReviving()) {
                    this._pushUniqueCreatureTo(this._arrEndTurnCreature, creature);
                    var arrEffect = creature.getUpdatingEffects();
                    if (arrEffect && arrEffect.length > 0) {
                        this._doUpdatingArrayEffect(creature, arrEffect);
                    } else {
                        this._doActionForCreature(this, creature);
                    }

                    this._turnCount && --this._turnCount;
                }
            } else {
                this._refreshTurn();
                this.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_REFRESH_TURNS);
            }
        }
    },

    runCombatToEnd: function () {
        this._executeNow = true;
        this.setAuto(true);
        this.setupBattle();
        this.startToCombat(true);
    }

});
mc.BattleFieldRefactor.MAX_COLUMN = 8;
mc.BattleFieldRefactor.MAX_ROW = 4;
mc.BattleFieldRefactor.TIME_CREATURE_MOVETO = 0.1;
mc.BattleFieldRefactor.TIME_CREATURE_BACKTO = 0.1;
mc.BattleFieldRefactor.TIME_CREATURE_DO_NO_THING = 0.35;
mc.BattleFieldRefactor.TIME_END_ATTACK = 0.5;
mc.BattleFieldRefactor.TIME_END_BATTLE = 1.25;
mc.BattleFieldRefactor.TIME_END_BATTLE_WHEN_DROP_ITEM = 2.5;
mc.BattleFieldRefactor.TIME_COUNT_DOWN = 0.1;
mc.BattleFieldRefactor.TIME_UPDATE = 0.5;
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_START = "event_battlefield_start";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_READY = "event_battlefield_ready";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE = "event_battlefield_pause";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_RESUME = "event_battlefield_resume";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END = "event_battlefield_end";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_COUNT_TURN = "event_battlefield_count_turn";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_REFRESH_TURNS = "event_battlefield_refresh_turnS";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_CHANGE_MODE = "event_battlefield_change_mode";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_OUT_OF_COMBAT = "event_battlefield_out_off_combat";
mc.BattleFieldRefactor.EVENT_BATTLEFIELD_SETUP_FORMATION = "event_battlefield_setup_formation";
mc.BattleFieldRefactor.EVENT_CREATURE_ENTER = "event_creature_enter";
mc.BattleFieldRefactor.EVENT_CREATURE_EXIT = "event_creature_exit";
mc.BattleFieldRefactor.EVENT_CREATURE_MOVETO = "event_creature_moveto";
mc.BattleFieldRefactor.EVENT_CREATURE_MOVETOLINE = "event_creature_movetoline";
mc.BattleFieldRefactor.EVENT_CREATURE_BACKTO = "event_creature_backto";
mc.BattleFieldRefactor.EVENT_CREATURE_DO_SOTHING = "event_creature_do_something";
mc.BattleFieldRefactor.EVENT_CREATURE_HURT = "event_creature_hurt";
mc.BattleFieldRefactor.EVENT_CREATURE_DEAD = "event_creature_dead";
mc.BattleFieldRefactor.EVENT_CREATURE_REVIVE = "event_creature_revive";
mc.BattleFieldRefactor.EVENT_CREATURE_CHEER = "event_creature_cheer";
mc.BattleFieldRefactor.EVENT_CREATURE_DROP_ZEN = "event_creature_drop_zen";
mc.BattleFieldRefactor.EVENT_CREATURE_DROP_ITEM = "event_creature_drop_item";
mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_HP = "event_creature_change_hp";
mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_MP = "event_creature_change_mp";
mc.BattleFieldRefactor.EVENT_CREATURE_ADD_STATUS_EFFECT = "event_creature_add_effect";
mc.BattleFieldRefactor.EVENT_CREATURE_REMOVE_STATUS_EFFECT = "event_creature_remove_effect";
mc.BattleFieldRefactor.EVENT_CREATURE_UPDATE_STATUS_EFFECT = "event_creature_update_effect";
mc.BattleFieldRefactor.EVENT_CREATURE_LATE_UPDATE = "event_creature_late_update";
mc.BattleFieldRefactor.COMMAND_USE_ULTIMATE = "command_use_ultimate";
mc.BattleFieldRefactor.EVENT_COLLISION_HIT = "event_collision_hit";
mc.BattleFieldRefactor.EVENT_COLLISION_HIT_SHIELD = "event_collision_hit_shield";
mc.BattleFieldRefactor.EVENT_COLLISION_BUFF = "event_collision_buff";
mc.BattleFieldRefactor.EVENT_SHOW_HIT_EFFECT = "event_show_effect";
mc.BattleFieldRefactor.EVENT_ACTIVE_BUFF = "event_active_modifier";
