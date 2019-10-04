/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.StageBossBattleScreen = mc.BattleScreen.extend({
    _totalOtherDamageForDisplaying: 0,
    _totalOtherPlayerSourceDamage: 0,
    _isBossAlreadyDead: false,

    getPreLoadURL: function () {
        return mc.resource.getBattlePreLoadURLs(mc.GameData.stageBossInBattle);
    },

    initResources: function () {
        this._super();

        var screen = this;
        var stageBossInBattle = mc.GameData.stageBossInBattle;
        mc.GameData.playerInfo.setCurrentPartInBattle(stageBossInBattle);
        var battleView = this._battleView = stageBossInBattle.createBattleViewRefactor().showTempBlackPanel(false);
        battleView.preLoadBattleEffect(stageBossInBattle.getArrayAllCreatureIndex());
        this.addChild(battleView);

        var damageInfoContainer = new ccui.ImageView("patch9/gradian_black.png", ccui.Widget.PLIST_TEXTURE);
        damageInfoContainer.setLocalZOrder(999);
        damageInfoContainer.x = cc.winSize.width * 0.5;
        damageInfoContainer.y = mc.const.DEFAULT_HEIGHT * 0.9;
        var iconTotalDamage = new ccui.ImageView("icon/ico_dmg.png", ccui.Widget.PLIST_TEXTURE);
        var lblValue = this._damageValue = bb.framework.getGUIFactory().createText("0");
        lblValue.anchorX = 0;
        damageInfoContainer.addChild(iconTotalDamage);
        damageInfoContainer.addChild(lblValue);
        iconTotalDamage.x = damageInfoContainer.width * 0.4;
        lblValue.x = iconTotalDamage.x + iconTotalDamage.width * 0.5 + 10;
        iconTotalDamage.y = lblValue.y = damageInfoContainer.height * 0.5;
        this._battleView.addChild(damageInfoContainer);

        var battleField = this._battleView.getBattleField();
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
            var winGroupId = battleField.getWinningTeamId();
            winGroupId && battleView.cheerWinTeam();
            var allCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
            var mapHeroStatus = stageBossInBattle.buildMapStatusCreature(allCreature);
            mc.GameData.resultInBattle.setMapHeroStatus(mapHeroStatus);
            var arrCreatureStatus = bb.utility.mapToArray(mapHeroStatus);
            if (winGroupId === mc.const.TEAM_RIGHT) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.finishStageBoss(this._getTotalWorldBossIncur(), mc.GameData.stageBossSystem.getStageIndex(), function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    screen._showDialogBattleEnd();
                }.bind(this));
            }
            else {
                var loadingId = mc.view_utility.showLoadingDialog();
                screen._setDeadForPlayerHero(allCreature, arrCreatureStatus);
                mc.protocol.finishStageBoss(this._getTotalWorldBossIncur(), mc.GameData.stageBossSystem.getStageIndex(), function () {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    screen._showDialogBattleEnd();
                });
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_HP, function (data) {
            var creature = data.creature;
            if (creature.isBoss()) {
                var numDamage = this._getTotalWorldBossIncur();
                this._damageValue.setString(bb.utility.formatNumber(numDamage));
            }
        }.bind(this));

        var stopSubmitDamage = false;
        var prevIncur = 0;
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_REFRESH_TURNS, function (data) {
            var totalIncur = this._getTotalWorldBossIncur();
            var deltaIncur = totalIncur - prevIncur;
            prevIncur = totalIncur;
            cc.log("submit: " + deltaIncur);
            if (!stopSubmitDamage && deltaIncur > 0) {
                mc.protocol.submitDamageStageBoss(deltaIncur, mc.GameData.stageBossSystem.getStageIndex(), function (result) {
                }.bind(this));
            }
        }.bind(this));

        var msShowDamage = bb.now();
        this.traceDataChange(mc.GameData.stageBossSystem, function (result) {
            if (result && result.param) {
                if (result.param["hp"]) {
                    if (result.param["gameHeroName"] != mc.GameData.playerInfo.getName()) {
                        var boss = this._findWorldBossCreature();
                        if (boss) {
                            var bossView = this._battleView.getCreatureViewByBattleId(boss.battleId);
                            var otherPlayerSourceDamage = mc.GameData.stageBossSystem.getTotalOtherPlayerDamage();
                            if (otherPlayerSourceDamage > 0) {
                                this._totalOtherPlayerSourceDamage += otherPlayerSourceDamage;
                                boss.adjustHp(-otherPlayerSourceDamage);
                                if (bb.now() - msShowDamage > 1000) {
                                    msShowDamage = bb.now();
                                    this._battleView.showDamageText(bossView, otherPlayerSourceDamage, mc.const.DAMAGE_TYPE_PHYSIC);
                                }
                            }
                        }
                    }
                }
                if (result.param["isBossDead"]) {
                    this._isBossAlreadyDead = true;
                    stopSubmitDamage = true;
                    if (!mc.GameData.resultInBattle.isFinish()) {
                        var boss = this._findWorldBossCreature();
                        if (result.param["gameHeroId"] === mc.GameData.playerInfo.getId()) {
                            boss.getInfo().hpServerControl = false; // let boss dead!!
                            var fakeDamage = boss.getHP();
                            this._totalOtherPlayerSourceDamage += fakeDamage;
                            boss.adjustHp(-fakeDamage);
                            boss.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_CREATURE_DEAD, boss);
                        }
                        else {
                            this._battleView.pauseAll();
                            var incurDamage = this._getTotalWorldBossIncur();
                            var dialog = bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtWarnBossBeKilledByOthers")
                                , result.param["gameHeroName"], bb.utility.formatNumber(incurDamage)), function () {
                                var allCreature = battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                                var mapHeroStatus = stageBossInBattle.buildMapStatusCreature(allCreature);
                                mc.GameData.resultInBattle.setMapHeroStatus(mapHeroStatus);
                                var arrCreatureStatus = bb.utility.mapToArray(mapHeroStatus);
                                var loadingId = mc.view_utility.showLoadingDialog();
                                screen._setDeadForPlayerHero(allCreature, arrCreatureStatus);
                                screen._showDialogBattleEnd();
                            }.bind(this));
                            dialog.setEnableClickOutSize(false);
                            dialog.show();
                        }
                    }
                }
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, function (data) {
            this.showDialogPauseBattle();
        }.bind(this));

        var _showOtherPlayerDamage = function () {
            if (this._totalOtherDamageForDisplaying > 0) {
                var boss = this._findWorldBossCreature();
                if (boss) {
                    var bossView = this._battleView.getCreatureViewByBattleId(boss.getServerId());
                    if (bossView) {
                        var min = 100000;
                        var dmg = 0;
                        if (this._totalOtherDamageForDisplaying <= min) {
                            dmg = this._totalOtherDamageForDisplaying;
                            this._totalOtherDamageForDisplaying = 0;
                        }
                        else {
                            var rand = bb.utility.randomInt(10, 90);
                            var val = Math.round(min * rand / 100);
                            this._totalOtherDamageForDisplaying -= val;
                            if (this._totalOtherDamageForDisplaying < 0) {
                                val += this._totalOtherDamageForDisplaying;
                                this._totalOtherDamageForDisplaying = 0;
                            }
                            dmg = val;
                        }
                        if (dmg > 0) {
                            this._battleView.showDamageText(bossView, dmg);
                            cc.log("show damage ............................ " + dmg);
                        }
                    }
                }
            }

        }.bind(this);

        var tagId = 987;
        var act = cc.sequence([cc.delayTime(0.15), cc.callFunc(_showOtherPlayerDamage)]).repeatForever();
        act.setTag(tagId);
        this.runAction(act);

        this.traceDataChange(mc.GameData.connectionState, function () {
            if (mc.GameData.connectionState.isOpened()) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.joinWorldBoss(function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                }.bind(this));
            }
        }.bind(this));
    },

    _findWorldBossCreature: function () {
        var boss = null;
        var arrCreature = this._battleView.getBattleField().getAllCreatureOfTeam(mc.const.TEAM_LEFT);
        if (arrCreature && arrCreature.length > 0) {
            for (var i = 0; i < arrCreature.length; i++) {
                var cr = arrCreature[i];
                if (arrCreature[i].isBoss()) {
                    boss = cr;
                    break;
                }
            }
        }
        return boss;
    },

    _getTotalWorldBossIncur: function () {
        var incur = 0;
        var boss = this._findWorldBossCreature();
        if (boss) {
            var firstHp = boss.getFirstHP();
            var hp = boss.getHP();
            var otherSrcDamage = this._totalOtherPlayerSourceDamage;
            incur = firstHp - hp + boss.getBonusDamageAfterDead() - otherSrcDamage;
        }
        return incur;
    },

    _setDeadForPlayerHero: function (allCreature, arrCreatureStatus) {
        var mapCreatureById = bb.utility.arrayToMap(allCreature, function (creature) {
            return creature.getServerId();
        });
        for (var c = 0; c < arrCreatureStatus.length; c++) {
            var status = arrCreatureStatus[c];
            var id = status.id;
            if (mapCreatureById[id] && mapCreatureById[id].getTeamId() === mc.const.TEAM_RIGHT) {
                status.hpPercent = 0;
                status.mpPercent = 0;
            }
        }
    },

    _showDialogBattleEnd: function () {
        new mc.DialogBattleEndView().show();
    },

    onScreenPause: function () {
        if (this._battleView && this._battleView.getBattleField()) {
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
        }
    },

    onScreenShow: function () {
        new mc.DialogBattleStart(mc.GameData.stageBossInBattle, function () {
            !this._isBossAlreadyDead && this._battleView.getBattleField().startToCombat();
        }.bind(this)).setBattleView(this._battleView).startAnimation().show();
        bb.sound.playMusic(mc.GameData.stageBossInBattle.getBackgroundMusic());
    },

    onScreenClose: function () {
        mc.GameData.playerInfo.setCurrentPartInBattle(null);
        mc.GameData.resultInBattle.clearData();
    },

    showDialogPauseBattle: function () {
        var allDialog = bb.director.getAllDialog();
        var isShowPauseDialog = false;
        for (var i = 0; i < allDialog.length; i++) {
            if (allDialog[i] instanceof mc.DialogPauseBattle) {
                isShowPauseDialog = true;
                break;
            }
        }
        if (!isShowPauseDialog) {
            var screen = this;
            var stageBossInBattle = mc.GameData.stageBossInBattle;
            new mc.DialogPauseBattle(this._battleView, function () {
                var allCreature = this._battleView.getBattleField().getAllCreatureOfTeam(mc.const.TEAM_RIGHT);
                var mapHeroStatus = stageBossInBattle.buildMapStatusCreature(allCreature);
                mc.GameData.resultInBattle.setMapHeroStatus(mapHeroStatus);
                var arrCreatureStatus = bb.utility.mapToArray(mapHeroStatus);
                var loadingId = mc.view_utility.showLoadingDialog(20, function () {
                    mc.GameData.guiState.popScreen();
                });
                screen._setDeadForPlayerHero(allCreature, arrCreatureStatus);
                mc.protocol.finishWorldBossBattle(0, arrCreatureStatus, false, function () {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    mc.GameData.guiState.popScreen();
                });
            }.bind(this)).show();
        }
    },

    onBackEvent: function () {
        if (this._battleView.getBattleField()) {
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
        }
    }

});