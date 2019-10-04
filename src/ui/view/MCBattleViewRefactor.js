/**
 * Created by long.nguyen on 1/11/2018.
 */
mc.BattleViewRefactor = cc.Node.extend({
    _mapCreatureViewByServerId: null,
    _mapCreatureViewByBattleId: null,
    _allBattleElementView: null,
    _mapBattleEffectPool: null,
    _mapBattleElementPool: null,
    _arrIdleColorNumberView: null,
    _numberViewOrder: 0,

    ctor: function (groupLeft, groupRight, playerTeamSide, environment, randomSeed) {
        this._super();

        bb.framework.addSpriteFrames(res.skill_status_plist);

        //load effect
        bb.sound.preloadEffect(res.sound_ui_battle_lose);
        bb.sound.preloadEffect(res.sound_ui_battle_win);
        bb.sound.preloadEffect(res.sound_ui_battle_win_star1);
        bb.sound.preloadEffect(res.sound_ui_battle_win_star2);
        bb.sound.preloadEffect(res.sound_ui_battle_win_star3);
        var currentPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        if (currentPartInBattle.haveAChest()) {
            bb.sound.preloadEffect(res.sound_ui_battle_chest_drop);
            bb.sound.preloadEffect(res.sound_ui_battle_zen_drop);
        }
        if (currentPartInBattle.haveABoss()) {
            bb.sound.preloadEffect(res.sound_ui_battle_bossarlet);
        }
        if (currentPartInBattle.isUsedItem()) {
            bb.sound.preloadEffect(res.sound_ui_battle_item_use);
        }
        bb.sound.preloadEffect(res.sound_ui_battle_start_round);

        this._mapBattleEffectPool = {};
        this._mapBattleElementPool = {};
        this._arrIdleColorNumberView = [];
        this._allBattleElementView = [];

        this.x = cc.winSize.width * 0.5;
        this.y = cc.winSize.height * 0.5;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = cc.winSize.width;
        this.height = mc.const.DEFAULT_HEIGHT;

        this._groupLeft = groupLeft;
        this._groupRight = groupRight;
        this._envinroment = environment;

        this._setupBattleField(playerTeamSide, randomSeed);
        this.scheduleUpdate();
    },

    onExit: function () {
        this._super();
        mc.storage.saveSetting();
        cc.director.getScheduler().setTimeScale(1.0);
        this.getBattleField().setTimeScale(1.0);
        bb.director.unTrackGlueObject(this._socketStateTracking);
        if (this._allSoundURL) {
            var mapSoundURL = {};
            for (var u = 0; u < this._allSoundURL.length; u++) {
                var url = this._allSoundURL[u];
                if (!mapSoundURL[url]) {
                    mapSoundURL[url] = true;
                    bb.sound.unloadEffect("res/sound/effect/" + url + ".mp3");
                }
            }
        }
    },

    addEffectView: function (effectView) {
        this._effectNode.addChild(effectView);
    },

    addGUIView: function (guiView) {
        this._guiNode.addChild(guiView);
    },

    _compareBattleElementView: function (elementView1, elementView2) {
        var dz = elementView2._zBattle - elementView1._zBattle;
        if (dz === 0) {
            var dy = elementView2.y - elementView1.y;
            return dy;
        }
        return dz;
    },

    _sort: function () {
        this._allBattleElementView = this._allBattleElementView.sort(this._compareBattleElementView.bind(this));
        for (var i = 0; i < this._allBattleElementView.length; i++) {
            this._allBattleElementView[i].setLocalZOrder(i + 1);
        }
    },

    getBattleEffectCacheBy: function (url) {
        var battleEffect = null;
        if (url) {
            url = "res/spine/battle_effect/" + url;
            if (this._mapBattleEffectPool && this._mapBattleEffectPool[url]) {
                var arrObj = this._mapBattleEffectPool[url];
                for (var i = 0; i < arrObj.length; i++) {
                    if (!arrObj[i].isVisible()) {
                        battleEffect = arrObj[i];
                        this._mapBattleEffectPool[url].splice(i, 1);
                        break;
                    }
                }
            }
            if (!battleEffect) {
                battleEffect = sp.SkeletonAnimation.createWithJsonFile(url + ".json", url + ".atlas", mc.const.SPINE_SCALE);
                battleEffect._cacheURL = url;
                this.addEffectView(battleEffect);
            }
            battleEffect.setVisible(true);
        }
        return battleEffect;
    },

    cacheBattleEffectBy: function (battleEffect) {
        var url = battleEffect._cacheURL;
        if (url) {
            if (!this._mapBattleEffectPool[url]) {
                this._mapBattleEffectPool[url] = [];
            }
            if (this._mapBattleEffectPool[url].length < 5) {
                this._mapBattleEffectPool[url].push(battleEffect);
                battleEffect.setVisible(false);
            }
            else {
                battleEffect.runAction(cc.removeSelf());
            }
        }
        return battleEffect;
    },

    getBattleElementCacheBy: function (url) {
        var battleElement = null;
        if (!this._mapBattleElementPool[url]) {
            battleElement = sp.SkeletonAnimation.createWithJsonFile(url + ".json", url + ".atlas", 1.0);
            battleElement._cacheURL = url;
            this.addBattleElementView(battleElement);
        }
        else {
            battleElement = this._mapBattleElementPool[url].pop();
            battleElement.setVisible(true);
            if (this._mapBattleElementPool[url].length === 0) {
                this._mapBattleElementPool[url] = null;
            }
        }
        return battleElement;
    },

    cacheBattleElementBy: function (battleElement) {
        var url = battleElement._cacheURL;
        if (url) {
            if (!this._mapBattleElementPool[url]) {
                this._mapBattleElementPool[url] = [];
            }
            this._mapBattleElementPool[url].push(battleElement);
            battleElement.setVisible(false);
        }
    },

    preLoadBattleEffect: function (arrCreatureIndex) {
        var allSoundURL = [];
        var allSpineURL = [];
        for (var c = 0; c < arrCreatureIndex.length; c++) {
            var asset = mc.dictionary.getCreatureAssetByIndex(arrCreatureIndex[c]);
            if (asset) {
                asset = asset.getData();
                var arrSpine = asset["attackHitEffect"];
                if (arrSpine) {
                    allSpineURL = bb.collection.arrayAppendArray(allSpineURL, arrSpine);
                }
                arrSpine = asset["skillAutoHitEffect"];
                if (arrSpine) {
                    allSpineURL = bb.collection.arrayAppendArray(allSpineURL, arrSpine);
                }
                arrSpine = asset["skillActiveHitEffect"];
                if (arrSpine) {
                    allSpineURL = bb.collection.arrayAppendArray(allSpineURL, arrSpine);
                }

                var arrSound = asset["attackSound"];
                if (arrSound) {
                    allSoundURL = bb.collection.arrayAppendArray(allSoundURL, arrSound);
                }
                var arrSound = asset["skillActiveSound"];
                if (arrSound) {
                    allSoundURL = bb.collection.arrayAppendArray(allSoundURL, arrSound);
                }
                arrSound = asset["skillAutoSound"];
                if (arrSound) {
                    allSoundURL = bb.collection.arrayAppendArray(allSoundURL, arrSound);
                }
                if (asset["hurtSound"]) {
                    allSoundURL.push(asset["hurtSound"]);
                }
            }
        }

        var mapLazyLoadEffect = {};
        mapLazyLoadEffect["hitIceQueenStorm"] = "hitIceQueenStorm";
        var mapSpineURL = {};
        for (var u = 0; u < allSpineURL.length; u++) {
            var url = allSpineURL[u];
            if (!mapSpineURL[url]) {
                mapSpineURL[url] = true;
                if (mapLazyLoadEffect[url]) {
                    var arrEff = [];
                    var spineEff = this.cacheBattleEffectBy(this.getBattleEffectCacheBy(url));
                    spineEff.setVisible(true);
                    arrEff.push(spineEff);
                    spineEff = this.cacheBattleEffectBy(this.getBattleEffectCacheBy(url));
                    spineEff.setVisible(true);
                    arrEff.push(spineEff);
                    spineEff = this.cacheBattleEffectBy(this.getBattleEffectCacheBy(url));
                    arrEff.push(spineEff);
                    for (var e = 0; e < arrEff.length; e++) {
                        arrEff[e].setVisible(false);
                    }
                }
                else {
                    this.getBattleEffectCacheBy(url);
                }
            }
        }

        var arrCacheStatsView = [];
        for (var i = 0; i < 5; i++) {
            var buffStatsView = this.cacheBattleEffectBy(this.getBattleEffectCacheBy("hitBuffStats"));
            buffStatsView.setVisible(true);
            var deBuffStatsView = this.cacheBattleEffectBy(this.getBattleEffectCacheBy("hitDeBuffStats"));
            deBuffStatsView.setVisible(true);
            arrCacheStatsView.push(buffStatsView);
            arrCacheStatsView.push(deBuffStatsView);
        }
        for (var i = 0; i < arrCacheStatsView.length; i++) {
            arrCacheStatsView[i].setVisible(false);
        }

        var mapSoundURL = {};
        for (var u = 0; u < allSoundURL.length; u++) {
            var url = allSoundURL[u];
            if (!mapSoundURL[url]) {
                mapSoundURL[url] = true;
                mc.log("preloadEffect:" + url);
                bb.sound.preloadEffect("res/sound/effect/" + url + ".mp3");
            }
        }

        if (mc.GameData.playerInfo.getCurrentPartInBattle() === mc.GameData.stageInBattle) {
            this.cacheBattleElementBy(this.getBattleElementCacheBy("res/spine/ui/chest"));
        }

        this._allSoundURL = allSoundURL;
    },

    update: function (dt) {
        this._sort();
    },

    _setupBattleField: function (playerTeamSide, randomSeed) {
        var group1 = this._groupLeft;
        var group2 = this._groupRight;
        var environment = this._envinroment;

        this._mapCreatureViewByBattleId = {};
        this._mapCreatureViewByServerId = {};

        cc.log("INIT BATTLE FIELD");
        cc.log("BATTLE_FIELD_SEED: "+randomSeed);
        this._battleFieldNode = new mc.BattleFieldRefactor(playerTeamSide, randomSeed);
        this._battleFieldNode.setMaxBattleDurationInMs( mc.GameData.playerInfo.getCurrentPartInBattle().getMaxBattleDurationInMs());
        this._battleNode = new cc.Node();
        this._effectNode = new cc.Node();
        this._guiNode = new cc.Node();

        this.addChild(this._battleFieldNode);
        this.addChild(this._battleNode);
        this.addChild(this._effectNode, 9);
        this.addChild(this._guiNode, 10);

        this._registerBattleFieldEvent();

        var self = this;
        this._mapInfo = {
            xOffset: 50,
            yOffset: 600,
            widthTile: cc.winSize.width / mc.BattleFieldRefactor.MAX_COLUMN,
            heightTile: 100
        };

        var brk = this.loadNewEnvironment(environment);

        var brkBlack = this._brkBlack = new ccui.Layout();
        brkBlack.width = cc.winSize.width;
        brkBlack.height = cc.winSize.height;
        brkBlack.setBackGroundColor(cc.color.BLACK);
        brkBlack.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        brkBlack.setLocalZOrder(-9);
        brkBlack.setBackGroundColorOpacity(bb.framework.getTrueOpacity(128));
        brkBlack.setVisible(false);
        this.addChild(brkBlack);

        mc.BattleBgEffectFactory.buildBGEffect(this, brk, mc.GameData.playerInfo.getCurrentPartInBattle().getBgKey());

        if (this._isShowTempBlackPanel) {
            var blackPanel = this._blackPanel = new ccui.Layout();
            blackPanel.width = cc.winSize.width;
            blackPanel.height = cc.winSize.height;
            blackPanel.setBackGroundColor(cc.color.BLACK);
            blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            this.addEffectView(blackPanel);
        }

        var controlBoardView = this._controlBoardView = new mc.BattleControllBoardViewRefactor(this);
        this.addGUIView(controlBoardView);

        this._battleFieldNode.addGroup(group1, mc.const.TEAM_LEFT);
        this._battleFieldNode.addGroup(group2, mc.const.TEAM_RIGHT);
        this._battleFieldNode.setupBattle();
        this._setupGroupFormation(mc.const.TEAM_LEFT, group1);
        this._setupGroupFormation(mc.const.TEAM_RIGHT, group2);
        this._battleFieldNode.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_SETUP_FORMATION);

        var socketState = mc.GameData.connectionState;
        if (socketState.isClose()) {
            this.scheduleOnce(function () {
                var inBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
                if (inBattle && !inBattle.isEnd()) {
                    this._battleFieldNode.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
                }
            }.bind(this), 0.5);
        }
        this._socketStateTracking = bb.director.trackGlueObject(socketState, function () {
            if (socketState.isClose()) {
                var inBattle = mc.GameData.playerInfo ? mc.GameData.playerInfo.getCurrentPartInBattle() : null;
                if (inBattle && !inBattle.isEnd()) {
                    this._battleFieldNode.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
                }
            }
        }.bind(this));

        if (mc.const.CHEAT_WIN_BATTLE_DURATION > 0) {
            this.runAction(cc.sequence([cc.delayTime(mc.const.CHEAT_WIN_BATTLE_DURATION), cc.callFunc(function () {
                this.getBattleField().endBattleWithWinGroupId(mc.const.TEAM_RIGHT);
            }.bind(this))]));
        }
        else if (mc.const.CHEAT_WIN_WAVE_DURATION > 0) {
            this.runAction(cc.sequence([cc.delayTime(mc.const.CHEAT_WIN_WAVE_DURATION), cc.callFunc(function () {
                this.getBattleField().endBattleWithWinGroupId(mc.const.TEAM_RIGHT);
            }.bind(this))]));
        }
    },

    loadNewEnvironment:function(enviroment){
        this._battleBrk && this._battleBrk.removeFromParent();

        var brk = this._battleBrk = mc.BattleViewFactory.createBattleBackground(enviroment);
        brk.anchorY = 1.0;
        brk.x = cc.winSize.width * 0.5;
        brk.y = mc.const.DEFAULT_HEIGHT;
        brk.setLocalZOrder(-10);
        this.addChild(brk);
        return brk;
    },

    setupNewTeamGroup: function (newGroup, teamId) {
        var oldGroup = (teamId === mc.const.TEAM_LEFT) ? this._groupLeft : this._groupRight;
        this._battleFieldNode.removeGroup(oldGroup);
        this._battleFieldNode.addGroup(newGroup, teamId);
        var another = null;
        if (teamId === mc.const.TEAM_RIGHT) {
            this._groupRight = newGroup;
            another = this._groupLeft;
        }
        else {
            this._groupLeft = newGroup;
            another = this._groupRight;
        }
        this._battleFieldNode.setupBattle();
        this._setupGroupFormation(mc.const.TEAM_LEFT, teamId === mc.const.TEAM_LEFT ? newGroup : another);
        this._setupGroupFormation(mc.const.TEAM_RIGHT, teamId === mc.const.TEAM_RIGHT ? newGroup : another);
    },

    setDarkBackground: function (isDark) {
        this._brkBlack.stopAllActions();
        if (isDark) {
            this._brkBlack.setVisible(true);
            this._brkBlack.opacity = 0;
            this._brkBlack.runAction(cc.sequence([cc.fadeIn(0.2), cc.callFunc(function () {
            }.bind(this))]));
        }
        else {
            this._brkBlack.opacity = 255;
            this._brkBlack.runAction(cc.sequence([cc.fadeOut(0.2), cc.callFunc(function () {
                this._brkBlack.setVisible(false);
            }.bind(this))]));
        }
    },

    showTempBlackPanel: function (tempBlackPanel) {
        this._isShowTempBlackPanel = tempBlackPanel;
        return this;
    },

    getBattleField: function () {
        return this._battleFieldNode;
    },

    getControlBoardView: function () {
        return this._controlBoardView;
    },

    _registerBattleFieldEvent: function () {
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_OUT_OF_COMBAT, function (data) {
            var teamId = data.data;
            if (this._blackPanel) {
                this._blackPanel.removeFromParent();
                this._blackPanel = null;
            }
            for (var battleId in this._mapCreatureViewByBattleId) {
                var creatureView = this._mapCreatureViewByBattleId[battleId];
                if (creatureView.getUserData().getTeamId() === teamId) {
                    creatureView.outCombat();
                }
            }
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_READY, function (data) {
            for (var battleId in this._mapCreatureViewByBattleId) {
                var creatureView = this._mapCreatureViewByBattleId[battleId];
                creatureView.startComming();
            }
            if (data && data.data) {// have a boss.
                bb.sound.playMusic(res.sound_bgm_battle_boss);
            }
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_START, function (data) {
            for (var battleId in this._mapCreatureViewByBattleId) {
                var creatureView = this._mapCreatureViewByBattleId[battleId];
                creatureView.showBar();
            }
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function (data) {
            var controlBoard = this.getControlBoardView();
            var partInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
            var arrSlotItem = controlBoard.getArrayBattleSlotItem();
            if (arrSlotItem && partInBattle) {
                for (var i = 0; i < arrSlotItem.length; i++) {
                    var slot = arrSlotItem[i];
                    var consumeInfo = slot.getUserData();
                    if (consumeInfo) {
                        partInBattle.updateCountdownUsingByItemId(mc.ItemStock.getItemId(consumeInfo), slot.getCurrentCountDown());
                    }
                }
            }
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_COUNT_TURN, function (data) {
            var creature = data.creature;
            var creature = data.creature;
            var isLostTurn = creature.isLostTurn();
            if (isLostTurn && !creature.isDead()) {
                var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
                this.showBuffText(creatureView, -1, "tur");
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_ENTER, function (data) {
            var creature = data.creature;
            var isForeign = data.data;
            if (!creature.isDead()) {
                if (!this._mapCreatureViewByBattleId[creature.battleId] && !this._mapCreatureViewByServerId[creature.getServerId()]) {
                    var creatureView = mc.BattleViewFactory.createCreatureView(creature);
                    creatureView.enableBar(true);
                    creatureView.enableFullHpEffect();
                    this._mapCreatureViewByBattleId[creature.battleId] = creatureView;
                    this._mapCreatureViewByServerId[creature.getServerId()] = creatureView;
                    this._allBattleElementView.push(creatureView);
                    this._battleNode.addChild(creatureView);
                    if (isForeign) {
                        creatureView.setDirection(creatureView.getUserData().getTeamId() === mc.const.TEAM_LEFT ? mc.CreatureView.DIRECTION_RIGHT : mc.CreatureView.DIRECTION_LEFT);
                        creatureView.x = creature.colBattleCell;
                        creatureView.y = creature.rowBattleCell;
                        creatureView._zBattle = creatureView.y;
                        creatureView.setupStartingPosition();
                        creatureView.startComming();
                    }
                }
            }
            else {
                if (this._mapCreatureViewByBattleId[creature.battleId]) {
                    this._mapCreatureViewByBattleId[creature.battleId].enableBar(false);
                }
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_EXIT, function (data) {
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            cc.arrayRemoveObject(this._allBattleElementView, creatureView);
            delete this._mapCreatureViewByServerId[creature.getServerId()];
            delete this._mapCreatureViewByBattleId[creature.battleId];
            creatureView && creatureView.removeFromParent();
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_MOVETO, function (data) {
            var creature = data.creature;
            var skill = data.data;
            var aimTarget = creature.getArrayAimingTarget()[0];
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            var targetView = this._mapCreatureViewByBattleId[aimTarget.battleId];
            creatureView._posMoveTo = cc.p(cc.p(aimTarget.colBattleCell - targetView.getDirection() * (creature.isBoss() ? 310 : 220), aimTarget.rowBattleCell - 1.0));
            creatureView.moveTo(creatureView._posMoveTo);
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_MOVETOLINE, function (data) {
            var creature = data.creature;
            var skill = data.data;
            var aimTarget = creature.getArrayAimingTarget()[0];
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            var targetView = this._mapCreatureViewByBattleId[aimTarget.battleId];
            creatureView._posMoveTo = cc.p(cc.p(aimTarget.colBattleCell - targetView.getDirection() * 310, aimTarget.rowBattleCell - 1.0));
            creatureView.moveTo(creatureView._posMoveTo);
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_BACKTO, function (data) {
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            var startPos = cc.p(creature.colBattleCell, creature.rowBattleCell);
            creature.stopDoing();
            creatureView.backTo(cc.p(startPos.x, startPos.y));
            if (this._isDarkingBy === creature.getServerId()) {
                this.setDarkBackground(false);
                this._isDarkingBy = null;
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_DO_SOTHING, function (data) {
            var creature = data.creature;
            var skill = data.data;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            if (creatureView._posMoveTo) {
                creatureView.x = creatureView._posMoveTo.x;
                creatureView.y = creatureView._posMoveTo.y;
                creatureView._posMoveTo = null;
            }
            if (skill) {
                creatureView.attack(skill.isActive() ? "skillActive" : "skillAuto");
            }
            else {
                creatureView.attack();
            }
            if (skill && skill.isActive() && !creature.isMonster()) {
                this.setDarkBackground(true);
                this._isDarkingBy = creature.getServerId();
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_HURT, function (data) {
            var collision = data.data;
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            creatureView && creatureView.hurt();
        }.bind(this), true);
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_HP, function (data) {
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            if (creatureView) {
                creatureView.updateHpBar();
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_MP, function (data) {
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            if (creatureView) {
                creatureView.updateMpBar();
            }
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_DEAD, function (data) {
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            if (creatureView) {
                creatureView.dead();
                creatureView.clearAllStatusViewIfAny();
            }
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_REVIVE, function (data) {
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            var strPrefixSpine = "res/spine/battle_effect/hitRevive";
            if (creatureView) {
                bb.utility.loadSpine(strPrefixSpine, function (statusEffectSpine) {
                    statusEffectSpine.scaleX = creatureView.getDirection();
                    statusEffectSpine.x = creatureView.x;
                    statusEffectSpine.y = creatureView.y;
                    statusEffectSpine.setAnimation(0, "hitRevive", false);
                    statusEffectSpine.setCompleteListener(function (trackEntry) {
                        if (trackEntry.trackIndex === 0) {
                            statusEffectSpine.runAction(cc.removeSelf());
                        }
                    }.bind(this));
                    this.addEffectView(statusEffectSpine);
                }.bind(this), mc.const.SPINE_SCALE);
            }
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_CHEER, function (data) {
            var creature = data.creature;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_COLLISION_HIT, function (data) {
            var collision = data.data;
            var defender = collision.getTarget();
            var damage = collision.getDamage();
            var damageType = collision.getDamageType();
            var isCritical = collision.isCritical();
            var defenderView = this._mapCreatureViewByBattleId[defender.battleId];
            this.showDamageText(defenderView, damage, damageType, isCritical);
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_COLLISION_HIT_SHIELD, function (data) {
            var collision = data.data;
            var defender = collision.getTarget();
            var damage = collision.getDamage();
            var damageType = collision.getDamageType();
            var isCritical = collision.isCritical();
            var defenderView = this._mapCreatureViewByBattleId[defender.battleId];
            this.showDamageText(defenderView, damage, damageType, isCritical, true);
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_SHOW_HIT_EFFECT, function (data) {
            var hitData = data.data.hitData;
            var hitIndex = data.data.hitIndex;
            var targetView = this._mapCreatureViewByBattleId[data.creature.battleId];
            if (hitData && hitData["attackHitEffect"]) {
                var strPrefixSpine = hitData["attackHitEffect"][hitIndex];
                if (strPrefixSpine) {
                    var hitPosition = hitData["attackHitPosition"];
                    var posEff = targetView.getStatusPosition(hitPosition);
                    var hitEffect = this.getBattleEffectCacheBy(strPrefixSpine);
                    hitEffect.scaleX *= (-targetView.getDirection());
                    hitEffect.x = targetView.x + posEff.x;
                    hitEffect.y = targetView.y + posEff.y;
                    hitEffect.setAnimation(0, strPrefixSpine, false);
                    hitEffect.setCompleteListener(function (trackEntry) {
                        if (trackEntry.trackIndex === 0) {
                            hitEffect.runAction(cc.sequence([cc.callFunc(function (hitEffect) {
                                this.cacheBattleEffectBy(hitEffect);
                            }.bind(this))]));
                        }
                    }.bind(this));
                }
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_COLLISION_BUFF, function (data) {
            var collision = data.data.collision;
            var defender = collision.getTarget();
            var defenderView = this._mapCreatureViewByBattleId[defender.battleId];
            defenderView.beBuff();
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_ACTIVE_BUFF, function (data) {
            var skill = data.data.skill;
            var buffType = data.data.buffType;
            var value = data.data.value;
            var defender = data.creature;
            var defenderView = this._mapCreatureViewByBattleId[defender.battleId];
            if (buffType === mc.const.BUFF_TYPE_HEAL ||
                buffType === mc.const.BUFF_TYPE_HPPORTION) {
                this.showRecoveryText(defenderView, mc.ColorNumberView.TYPE_NUM_HP_HEAL, "+" + value);
                this.showSpineStatsEffect(defenderView, 'hp');
            }
            else if (buffType === mc.const.BUFF_TYPE_REMOVAL) {
                this.showSpineStatsEffect(defenderView, 'removal', true);
            }
            else if (buffType === mc.const.BUFF_TYPE_HPSHIELD ||
                buffType === mc.const.BUFF_TYPE_MAGSHIELD) {
                this.showBuffText(defenderView, value, "shd");
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_ADD_STATUS_EFFECT, function (data) {
            var creature = data.creature;
            var statusEffect = data.data;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            if (statusEffect && creatureView) {
                var skillId = statusEffect.getSkillId();
                creatureView.beEffecting();
                if (!creatureView.hasStatusEffectSpine(statusEffect.getSkillId())) {
                    var statusImage = mc.HeroStock.getSkillStatusResource({index: skillId});
                    if (statusImage) {
                        var strs = statusImage.split('.');
                        var name = strs[0];
                        if (!strs[1] || strs[1] === "json") {
                            var strPrefixSpine = "res/spine/battle_effect/" + name;
                            bb.utility.loadSpine(strPrefixSpine, function (statusEffectSpine) {
                                statusEffectSpine.scaleX = creatureView.getDirection();
                                statusEffectSpine.setUserData(statusEffect);
                                statusEffectSpine.setAnimation(0, name, true);
                                creatureView.addStatusEffectSpine(statusEffectSpine);
                            }, 0.15);
                        }
                    }
                }

                if (!creatureView.hasTransformBody(statusEffect) && mc.CreatureEffect.isTransformEffect(statusEffect) ) {
                    var transformImage = mc.HeroStock.getSkillTransformResource({index: skillId});
                    if (transformImage) {
                        var strs = transformImage.split('.');
                        var name = strs[0];
                        if (!strs[1] || strs[1] === "json") {
                            var strPrefixSpine = "res/spine/char/" + name;
                            bb.utility.loadSpine(strPrefixSpine, function (newBody) {
                                newBody.scaleX = creatureView.getDirection();
                                newBody.setUserData(statusEffect);
                                creatureView.replaceNewBody(newBody, statusEffect);
                            }, 0.15);
                        }
                    }
                }
                var hasStatusIcon = creatureView.hasStatusIcon(statusEffect.getEffectId(), statusEffect.getSkillId());
                if (!hasStatusIcon || (hasStatusIcon.getUserData() && hasStatusIcon.getUserData().isRemoved && hasStatusIcon.getUserData().isRemoved())) {
                    var effectDict = mc.dictionary.getEffectByIndex(statusEffect.getEffectId());
                    var iconUrl = effectDict["statusImage"];
                    if (iconUrl) {
                        var icon = new cc.Sprite("#png/status/" + iconUrl);
                        icon.scale = 0.75;
                        var lbl = bb.framework.getGUIFactory().createText((statusEffect.getEffectTimes() > 0) ? "" + statusEffect.getEffectTimes() : "");
                        lbl.setColor(mc.color.GREEN_NORMAL);
                        lbl.x = icon.width - lbl.width * 0.5;
                        lbl.y = icon.height * 0.45;
                        icon.addChild(lbl);
                        icon.setUserData(statusEffect);
                        creatureView.addStatusIcon(icon);
                    }
                }
                if (statusEffect.getEffectTimes() > 0 && statusEffect instanceof mc.StatsEffect) {
                    var attributeInfo = statusEffect.getAttributeInfo();
                    if (attributeInfo) {
                        this.showBuffText(creatureView, attributeInfo.valueAttr, attributeInfo.keyAttr);
                        if (statusEffect.getTotalEffectValue() > 0) {
                            this.showSpineStatsEffect(creatureView, attributeInfo.keyAttr.toUpperCase());
                        }
                        else if (statusEffect.getTotalEffectValue() < 0) {
                            this.showSpineStatsEffect(creatureView, attributeInfo.keyAttr.toUpperCase(), true);
                        }
                    }
                }
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_REMOVE_STATUS_EFFECT, function (data) {
            var creature = data.creature;
            var statusEffect = data.data;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            if (creatureView) {
                creatureView.clearAllStatusViewIfAny();
            }
            if ( mc.CreatureEffect.isTransformEffect(statusEffect) ) {
                creatureView.reverseOriginalBody(statusEffect);
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_LATE_UPDATE, function (data) {
            var creature = data.creature;
            var lateUpdate = data.data;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            if (creatureView) {
                if (lateUpdate.getKey() === mc.const.LATE_UPDATE_LIFE_STEAL) {
                    this.showRecoveryText(creatureView, mc.ColorNumberView.TYPE_NUM_HP_HEAL, "+" + lateUpdate.getValue());
                }
                else if (lateUpdate.getKey() === mc.const.LATE_UPDATE_REFLECT_DAMAGE) {
                    this.showDamageText(creatureView, Math.abs(lateUpdate.getValue()), mc.ColorNumberView.TYPE_NUM_MAGIC);
                }
                if (lateUpdate.getKey() === mc.const.LATE_UPDATE_BURN_MANA) {
                    this.showRecoveryText(creatureView, mc.ColorNumberView.TYPE_NUM_MP_HEAL, "-" + Math.abs(lateUpdate.getValue()));
                }
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_DROP_ITEM, function (data) {
            var defender = data.creature;
            var defenderView = this._mapCreatureViewByBattleId[defender.battleId];
            var arrDropItem = data.data;
            for (var i = 0; i < arrDropItem.length; i++) {
                var dropItem = arrDropItem[i];
                bb.sound.playEffect(res.sound_ui_battle_chest_drop);
                var chestURL = "res/spine/ui/chest";
                var dropChest = this.getBattleElementCacheBy(chestURL);
                dropChest.clearTracks();
                dropChest.setToSetupPose();
                if (mc.ItemStock.getItemRank(dropItem) <= 3) {
                    dropChest.setSkin("chest_bronze_blue");
                }
                else if (mc.ItemStock.getItemRank(dropItem) <= 4) {
                    dropChest.setSkin("chest_bronze_green");
                }
                else if (mc.ItemStock.getItemRank(dropItem) <= 5) {
                    dropChest.setSkin("chest_bronze_red");
                }
                else {
                    dropChest.setSkin("chest_platinum");
                }
                dropChest.x = defenderView.x;
                dropChest.y = defenderView.y;
                dropChest.setAnimation(0, "drop", false);
                dropChest.runAction(cc.sequence([this._delayTime(1.0), cc.callFunc(function (dropChest) {
                    dropChest.setAnimation(1, "open", false);
                    var dropItemView = new mc.ItemView(dropItem);
                    dropItemView.scale = 0.0;
                    dropItemView.x = dropChest.x;
                    dropItemView.y = dropChest.y + 30;
                    dropItemView.opacity = 0;
                    dropItemView.runAction(cc.fadeIn(0.3));
                    dropItemView.runAction(cc.sequence([this._delayTime(0.25), cc.moveBy(0.3, 0, 100), this._delayTime(0.8), cc.moveTo(0.2, 0, cc.winSize.height), cc.callFunc(function () {
                        var userData = dropItemView.getUserData();
                        if (userData) {
                            switch (userData["index"]) {
                                case mc.const.ITEM_INDEX_BLESS:
                                case mc.const.ITEM_INDEX_CHAOS:
                                case mc.const.ITEM_INDEX_LIFE:
                                case mc.const.ITEM_INDEX_CREATION:
                                case mc.const.ITEM_INDEX_SOUL:
                                    bb.sound.playEffect(res.sound_ui_battle_jewel_drop);
                                    break;
                            }
                        }
                        this.getBattleField().countDropItem(-1);
                        this.cacheBattleElementBy(dropChest);
                    }.bind(this)), cc.removeSelf()]));
                    dropItemView.runAction(cc.sequence([this._delayTime(0.25), cc.scaleTo(0.3, 0.65, 0.65)]));
                    this.addBattleElementView(dropItemView);
                }.bind(this))]));
                dropChest._zBattle = defenderView._zBattle - 1;
            }
        }.bind(this));

        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_DROP_ZEN, function (data) {
            var zen = 0;
            var defender = data.creature;
            var arrDropZen = data.data;
            var arrZenView = [];
            var defenderView = this._mapCreatureViewByBattleId[defender.battleId];
            bb.sound.playEffect(res.sound_ui_battle_zen_drop);
            for (var z = 0; z < arrDropZen.length; z++) {
                zen += arrDropZen[z];
                var numZen = arrDropZen[z];
                var dropObj = this._createDroppingView("#icon/coin.png", cc.p(defenderView.x, defenderView.y));
                dropObj.dropView.scale = 0.8;
                this.addBattleElementView(dropObj.dropView, defenderView._zBattle - 1);
                this.addBattleElementView(dropObj.shadowView, 99999);
                arrZenView.push(dropObj.dropView);
            }
            this._controlBoardView.collectZen(arrZenView, zen, function () {
                this.getBattleField().countDropItem(-1);
            }.bind(this));
        }.bind(this));
        this.getBattleField().addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_UPDATE_STATUS_EFFECT, function (data) {
            var creature = data.creature;
            var effect = data.data;
            var creatureView = this._mapCreatureViewByBattleId[creature.battleId];
            var equationKey = effect.getEquationKey();
            if (equationKey === mc.const.UPDATE_EFFECT_TYPE_DPS) {
                this.showDamageText(creatureView, effect.getDeltaEffectValue(), mc.const.DAMAGE_TYPE_MAGIC);
            }
            else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_MPS) {
                this.showBuffText(creatureView, effect.getDeltaEffectValue(), "mp");
            }
            else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_HP ||
                equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_HP_OPTION ) {
                this.showRecoveryText(creatureView, mc.ColorNumberView.TYPE_NUM_HP_HEAL, "+" + effect.getDeltaEffectValue());
            }
            else if (equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_MP ||
                equationKey === mc.const.UPDATE_EFFECT_TYPE_REGEN_MP_OPTION) {
                this.showRecoveryText(creatureView, mc.ColorNumberView.TYPE_NUM_MP_HEAL, "+" + effect.getDeltaEffectValue());
            }
        }.bind(this));
    },

    addBattleElementView: function (elementView, zBattle, zGroup) {
        this._battleNode.addChild(elementView);
        if (zBattle != undefined) {
            zBattle = Math.floor(zBattle);
        }
        else {
            zBattle = 0;
        }
        elementView._zBattle = zBattle;
        elementView.zGroup = zGroup || 0;
        this._allBattleElementView.push(elementView);
        var self = this;
        elementView.onExit = function () {
            cc.Node.prototype.onExit.call(this);
            cc.arrayRemoveObject(self._allBattleElementView, this);
        };
    },

    getArrayCreatureView: function (teamId) {
        var arr = [];
        for (var battleId in this._mapCreatureViewByBattleId) {
            var creature = this._mapCreatureViewByBattleId[battleId].getUserData();
            if (creature.getTeamId() === teamId) {
                arr.push(this._mapCreatureViewByBattleId[battleId]);
            }
        }
        return arr;
    },

    getCreatureViewByBattleId: function (id) {
        return this._mapCreatureViewByBattleId[id];
    },

    _delayTime: function (delay) {
        return cc.delayTime(delay / mc.const.BATTLE_TIME_SCALE);
    },

    _createDroppingView: function (urlOrSprite, pos, jump) {
        var spr = null;
        if (cc.isString(urlOrSprite)) {
            spr = new cc.Sprite(urlOrSprite);
        }
        else {
            spr = urlOrSprite;
        }
        spr.scale = 0.25;
        spr.x = pos.x;
        spr.y = pos.y;
        spr.anchorY = 0;
        var jump = jump || bb.utility.randomInt(2, 4);
        var dir = bb.utility.randomInt(2) === 0 ? -1 : 1;
        var w = bb.utility.randomInt(60);
        var h = bb.utility.randomInt(8, 12) * 10;
        var dUnder = -bb.utility.randomInt(15, 50);
        w = w * dir;
        var tFly = 0.4;
        spr.opacity = 0;

        var shadowView = new cc.Sprite("#sprite/shadow.png");
        shadowView.scale = 0;
        shadowView.x = pos.x;
        shadowView.y = pos.y + 10;
        shadowView.scale = 0.2;

        spr._shadowView = shadowView;

        var arrSprJump = [
            cc.jumpBy(tFly + 0.2, cc.p(w, 0), h, 1),
            cc.jumpBy(tFly, cc.p(w / 2, dUnder / 2), h / 2, 1),
            cc.jumpBy(tFly, cc.p(w / 4, dUnder / 4), h / 4, 1),
            cc.jumpBy(tFly, cc.p(w / 8, dUnder / 8), h / 8, 1)
        ];
        var arrShadowJump = [
            cc.moveBy(tFly + 0.2, cc.p(w, 0)),
            cc.moveBy(tFly, cc.p(w / 2, dUnder / 2)),
            cc.moveBy(tFly, cc.p(w / 4, dUnder / 4)),
            cc.moveBy(tFly, cc.p(w / 8, dUnder / 8))
        ]

        if (jump === 1) {
            arrSprJump = [arrSprJump[0]];
            arrShadowJump = [arrShadowJump[0]];
        }
        else if (jump === 2) {
            arrSprJump = [arrSprJump[0], arrSprJump[1]];
            arrShadowJump = [arrShadowJump[0], arrShadowJump[1]];
        }
        else if (jump === 3) {
            arrSprJump = [arrSprJump[0], arrSprJump[1], arrSprJump[2]];
            arrShadowJump = [arrShadowJump[0], arrShadowJump[1], arrShadowJump[2]];
        }

        spr.runAction(cc.fadeIn(tFly + 0.2));
        spr.runAction(cc.sequence(arrSprJump));

        shadowView.runAction(cc.scaleTo(tFly + 0.2, 0.2, 0.2));
        shadowView.runAction(cc.sequence(arrShadowJump));

        return {dropView: spr, shadowView: shadowView};
    },

    _setupGroupFormation: function (teamId, creatureGroup) {
        var arrCreature = creatureGroup.toArray();
        mc.LayoutHeroForBattle.layoutArrayHero(teamId, creatureGroup);
        for (var i = 0; i < arrCreature.length; i++) {
            var cr = arrCreature[i];
            var view = this._mapCreatureViewByBattleId[cr.battleId];
            if( view ){
                view.x = cr.colBattleCell;
                view.y = cr.rowBattleCell;
                view._zBattle = view.y;
                view.setDirection(teamId === mc.const.TEAM_LEFT ? mc.CreatureView.DIRECTION_RIGHT : mc.CreatureView.DIRECTION_LEFT);
                view.setupStartingPosition();
            }
        }
    },

    requestLabel: function (lifeTime, type, str) {
        var colorNumberView = null;
        if (this._arrIdleColorNumberView.length > 0) {
            colorNumberView = this._arrIdleColorNumberView.pop();
            colorNumberView.setVisible(true);
        }
        else {
            colorNumberView = new mc.ColorNumberView();
            this.addEffectView(colorNumberView);
        }
        colorNumberView.opacity = 255;
        colorNumberView.setTypeNumber(type, str);
        colorNumberView.runAction(cc.sequence([cc.delayTime(lifeTime), cc.callFunc(function () {
            colorNumberView.setVisible(false);
            this._arrIdleColorNumberView.push(colorNumberView);
            while (this._arrIdleColorNumberView.length > 20) {// max cache number view
                var numberView = this._arrIdleColorNumberView.pop();
                numberView.removeFromParent();
            }
        }.bind(this))]));
        colorNumberView.setLocalZOrder(this._numberViewOrder++);
        return colorNumberView;
    },

    showSpineStatsEffect: function (creatureView, key, isDeBuff) {
        if (key) {
            key = key.toUpperCase();
            if (key != 'SHD') {
                var posEff = creatureView.getStatusPosition("bottom");
                var statsEffect = this.getBattleEffectCacheBy(!isDeBuff ? "hitBuffStats" : "hitDeBuffStats");
                statsEffect.x = creatureView.x + posEff.x;
                statsEffect.y = creatureView.y + posEff.y;
                if (key === "REMOVAL") {
                    statsEffect.setSkin(key);
                }
                else {
                    statsEffect.setSkin(!isDeBuff ? key : "DE" + key);
                }
                statsEffect.setAnimation(0, !isDeBuff ? "hitBuffStats" : "hitDeBuffStats", false);
                statsEffect.setCompleteListener(function (trackEntry) {
                    if (trackEntry.trackIndex === 0) {
                        statsEffect.runAction(cc.sequence([cc.callFunc(function (statsEffect) {
                            this.cacheBattleEffectBy(statsEffect);
                        }.bind(this))]));
                    }
                }.bind(this));
            }
        }
    },

    showRecoveryText: function (ownerView, type, str) {
        var dy = mc.BattleViewRefactor.DY_HIT_EFFECT;
        var recoveryColorLabel = this.requestLabel(0.75, type, str);
        recoveryColorLabel.scale = 1.0;
        recoveryColorLabel.x = ownerView.x;
        recoveryColorLabel.y = ownerView.y + 150;
        recoveryColorLabel.runAction(cc.moveBy(0.75, 0, dy));
        recoveryColorLabel.runAction(cc.sequence([cc.delayTime(0.35), cc.fadeOut(0.3)]));
        return recoveryColorLabel;
    },

    showBuffText: function (ownerView, buffValue, keyAttribute) {
        var dy = mc.BattleViewRefactor.DY_HIT_EFFECT;
        var type = mc.ColorNumberView.TYPE_NUM_PLUS_ATTRIBUTE;
        if (buffValue < 0) {
            type = mc.ColorNumberView.TYPE_NUM_MINUS_ATTRIBUTE;
        }
        var str = buffValue > 0 ? "+" : "-";
        str += Math.abs(buffValue) + keyAttribute;
        if (!ownerView._buffCount) {
            ownerView._buffCount = 0;
        }
        ownerView._buffCount++;
        var tBuff = (ownerView._buffCount - 1) * 0.35;
        var tMove = 0.75;
        var attackText = this.requestLabel(tBuff + tMove, type, str);
        attackText.scale = 1.0;
        attackText.x = ownerView.x;
        attackText.y = ownerView.y + 150;
        attackText.setVisible(false);
        attackText.runAction(cc.sequence([cc.delayTime(tBuff), cc.callFunc(function (attackText) {
            attackText.setVisible(true);
        }), cc.moveBy(tMove, 0, dy), cc.callFunc(function (attackText, ownerView) {
            ownerView._buffCount--;
            ownerView._buffCount < 0 && (ownerView._buffCount = 0);
        }, attackText, ownerView)]));
    },

    showDamageText: function (ownerView, damge, damageType, critical, hitShield) {
        var type = mc.ColorNumberView.TYPE_NUM_CRITICAL;
        if (damageType === mc.const.DAMAGE_TYPE_PHYSIC) {
            type = mc.ColorNumberView.TYPE_NUM_PHYSIC;
        }
        else if (damageType === mc.const.DAMAGE_TYPE_MAGIC) {
            type = mc.ColorNumberView.TYPE_NUM_MAGIC;
        }
        else if (damageType === mc.const.DAMAGE_TYPE_PUREATK) {
            type = mc.ColorNumberView.TYPE_NUM_HP_HEAL;
        }
        else if (damageType === mc.const.DAMAGE_TYPE_PUREMAG) {
            type = mc.ColorNumberView.TYPE_NUM_MP_HEAL;
        }
        var str = damge;
        if (damge <= 0) {
            type = mc.ColorNumberView.TYPE_TXT_BLOCK;
        }
        if (hitShield) {
            type = mc.ColorNumberView.TYPE_NUM_MINUS_ATTRIBUTE;
            str = str + 'shd';
        }
        var dy = mc.BattleViewRefactor.DY_HIT_EFFECT;
        var attackText = this.requestLabel(0.75, type, "-" + str);
        attackText.scale = 1.0;
        attackText.x = ownerView.x;
        attackText.y = ownerView.y + 150;
        attackText.runAction(cc.moveBy(0.75, 0, dy));
        if (critical) {
            var critText = this.requestLabel(1.0, mc.ColorNumberView.TYPE_TXT_CRITICAL, "");
            critText.scale = 1.0;
            critText.x = ownerView.x;
            critText.y = ownerView.y + 200;
            critText.runAction(cc.moveBy(0.75, 0, dy));
        }
        return attackText;
    },

    cheerWinTeam: function () {
        var self = this;
        var winGroupId = this.getBattleField().getWinningTeamId();
        for (var battleId in this._mapCreatureViewByBattleId) {
            var creatureView = this._mapCreatureViewByBattleId[battleId];
            var creatureModel = creatureView.getUserData();
            if (creatureModel.getTeamId() === winGroupId && !creatureModel.isDead()) {
                creatureView.cheerDelay();
            }
        }
    },

    runTransitionAnimation: function (callback, name) {
        var transition = new cc.Sprite("res/effect/transition_effect.png");
        transition.scaleX = (name === "end") ? -1 : 1;
        transition.x = cc.winSize.width;
        transition.y = mc.const.DEFAULT_HEIGHT;
        transition.anchorX = 0;
        transition.anchorY = 1;
        var delta = (transition.scaleX === -1) ? 0 : transition.width;

        var blackPanel = new ccui.Layout();
        blackPanel.setBackGroundColor(cc.color.BLACK);
        blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        blackPanel.x = transition.x;
        blackPanel.y = transition.y;
        blackPanel.anchorX = (name === "end") ? 0 : 1;
        blackPanel.anchorY = 1;
        blackPanel.width = cc.winSize.width;
        blackPanel.height = cc.winSize.height;

        transition.runAction(cc.sequence([cc.moveBy(0.5, -cc.winSize.width - delta, 0), cc.removeSelf(), cc.callFunc(callback)]));
        blackPanel.runAction(cc.sequence([cc.moveBy(0.5, -cc.winSize.width - delta, 0), cc.removeSelf()]));
        this.addEffectView(transition);
        this.addEffectView(blackPanel);
    },

    loadTeamName: function (player, opp, playerSide) {
        if (player && opp)
            this._controlBoardView.loadTeamName && this._controlBoardView.loadTeamName(player, opp, playerSide);
    },

    pauseAll: function () {
        this.pause();
        this._battleFieldNode.pauseCombat();
        this._controlBoardView.pauseClock();
        var arrBattleNode = this._battleNode.getChildren();
        for (var i = 0; i < arrBattleNode.length; i++) {
            arrBattleNode[i].pause();
        }
        var arrGUINode = this._guiNode.getChildren();
        for (var i = 0; i < arrGUINode.length; i++) {
            arrGUINode[i].pause();
        }
        var arrEffectNode = this._effectNode.getChildren();
        for (var i = 0; i < arrEffectNode.length; i++) {
            arrEffectNode[i].pause();
        }
    },

    resumeAll: function () {
        this.resume();
        this._battleFieldNode.resumeCombat();
        this._controlBoardView.resumeClock();
        var arrBattleNode = this._battleNode.getChildren();
        for (var i = 0; i < arrBattleNode.length; i++) {
            arrBattleNode[i].resume();
        }
        var arrGUINode = this._guiNode.getChildren();
        for (var i = 0; i < arrGUINode.length; i++) {
            arrGUINode[i].resume();
        }
        var arrEffectNode = this._effectNode.getChildren();
        for (var i = 0; i < arrEffectNode.length; i++) {
            arrEffectNode[i].resume();
        }
        this._battleFieldNode.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_RESUME, undefined, true);
    }

});
mc.BattleViewRefactor.DY_HIT_EFFECT = 80;