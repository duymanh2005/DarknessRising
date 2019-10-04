/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.BossMainLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.screen_boss_main_scene_json);
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var nodeBrk = this._nodeBrk = new cc.Node();
        nodeBrk.setLocalZOrder(-1);

        this._currBrkKey = mc.BossMainLayer.DEFAULT_WORLD_BOSS_BRK_KEY;
        var brk = nodeBrk._currBrk = new ccui.ImageView(cc.formatStr("res/png/brk/%s.png",this._currBrkKey),
            ccui.Widget.LOCAL_TEXTURE);
        brk.anchorY = 1.0;
        brk.x = cc.winSize.width * 0.5;
        brk.y = mc.const.DEFAULT_HEIGHT;
        nodeBrk.addChild(brk);
        root.addChild(nodeBrk);

        var brkTitle = rootMap["brkTitle"];
        var spin_node = this._spine_node = rootMap["spine_node"];
        var btnStart = spin_node.getChildByName("btn_start");
        btnStart.setLocalZOrder(-1);
        var btnRank = spin_node.getChildByName("btn_rank");
        var btnEditTeam = spin_node.getChildByName("btn_edit_team");
        this._lblNumDamage = rootMap["lblDamage"];
        if(mc.enableReplaceFontBM())
        {
            this._lblNumDamage = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this._lblNumDamage);
        }
        this._btnRules = rootMap["btn_rule"];
        this._btnRules.registerTouchEvent(function () {
            new mc.RulesDialog().show();
        }.bind(this));

        btnStart.setString(mc.dictionary.getGUIString("lblStart"), res.font_cam_stroke_48_export_fnt);
        var lblRank = btnRank.setString(mc.dictionary.getGUIString("lblRanking"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var lblEditTeam = btnEditTeam.setString(mc.dictionary.getGUIString("lblEditTeam"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblRank.setPosition(btnRank.width / 2, btnRank.height * 0.55);
        lblEditTeam.setPosition(btnEditTeam.width / 2, btnEditTeam.height * 0.55);


        btnStart.registerTouchEvent(function () {
            if( !mc.GameData.worldBossSystem.getBossReviveCountDownSeconds() ){
                if (!this._isEmptyTeam()) {
                    var isShow = mc.view_utility.showSuggestBuyItemSlotsIfAny();
                    if (!isShow) {
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.fightWorldBoss(function (result) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            if (result) {
                                mc.GUIFactory.showWorldBossBattleScreen();
                            }
                        });
                    }
                }
                else {
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtShouldToSetUpFormation"));
                }
            }
        }.bind(this));
        btnEditTeam.registerTouchEvent(function () {
            mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_WORLD_BOSS);
            mc.GUIFactory.showEditFormationScreen(mc.GameData.worldBossSystem);
        });
        btnRank.registerTouchEvent(function () {
                // mc.view_utility.showBossRank();
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS_RANKING);
            }.bind(this)
        );

        var panelChars = spin_node.getChildByName("panelChars");
        var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_battle_boss_json, res.spine_battle_boss_atlas, 1.0);
        iconAnimate.setAnimation(0, "animation", true);
        iconAnimate.setPosition(panelChars.width / 2, 0);
        panelChars.addChild(iconAnimate);
        var _rootMapSpine = this._rootMapSpine = bb.utility.arrayToMap(spin_node.getChildren(), function (child) {
            return child.getName();
        });

        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.joinWorldBoss(function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (result) {
                this._initBoss(result);
                this._loadHeroes(this._spine_node, this._rootMapSpine);
                this._initFightTimes();
            }
        }.bind(this));

        var msShowOtherDamage = bb.now();
        this.traceDataChange(mc.GameData.worldBossSystem, function (result) {
            if (result && result.param) {
                if (result.param["hp"]) {
                    if (this._bossView) {
                        if( bb.now() - msShowOtherDamage >= 1000 ){
                            msShowOtherDamage = bb.now();
                            var monsterInfo = this._bossView.getUserData();
                            var totalHp = monsterInfo["hp"];
                            var dmg = mc.GameData.worldBossSystem.getTotalOtherPlayerDamage();
                            var newHp = result.param["hp"];
                            var prevHp =  newHp + dmg;
                            var ttOtherPlayerDamage = Math.abs(prevHp - newHp);
                            if( ttOtherPlayerDamage > 1000 ){
                                var colorNumberView = new mc.ColorNumberView();
                                var statusPos = this._bossView.getStatusPosition("top");
                                colorNumberView.x = this._bossView.x + statusPos.x;
                                colorNumberView.y = this._bossView.y + statusPos.y;
                                colorNumberView.setLocalZOrder(99999);
                                colorNumberView.setTypeNumber(mc.ColorNumberView.TYPE_NUM_PHYSIC, -ttOtherPlayerDamage);
                                colorNumberView.runAction(cc.sequence([cc.moveBy(0.3, 0, 120), cc.fadeOut(0.2), cc.removeSelf()]));
                                this._spine_node.addChild(colorNumberView);

                                this._bossView.updateHpBar(newHp,totalHp);
                                this._bossView.hurt();
                            }
                        }
                    }
                }
                if (result.param["isBossDead"]) {
                    var dialog = bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtWarnBossBeKilledByOthers")
                        , result.param["gameHeroName"], bb.utility.formatNumber(0)), function () {
                        // join boss room again.
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.joinWorldBoss(function (result) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            if (result) {
                                this._isBossRevive = true;
                                this._initBoss(result);
                                this._loadHeroes(this._spine_node, this._rootMapSpine);
                                this._initFightTimes();
                            }
                        }.bind(this));
                    }.bind(this));
                    dialog.setEnableClickOutSize(false);
                    dialog.show();
                }
            }
        }.bind(this));
    },

    onLayerClearStack: function () {
        mc.protocol.leaveRoomWorldBoss();
        mc.GameData.guiState.setShowingBossIndex(null);
    },

    _initFightTimes: function () {
        var nodeSwords = this._spine_node.getChildByName("node_swords");
        nodeSwords.removeAllChildren();

        var numChance = mc.GameData.worldBossSystem.getTicketNo();
        var layoutSwords = bb.layout.linear(bb.collection.createArray(3, function (index) {
            var spr = new cc.Sprite("#icon/ico_battle.png");
            spr.swordIndex = index;
            if (index >= numChance) {
                spr.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            return spr;
        }), 5, bb.layout.LINEAR_HORIZONTAL);
        nodeSwords.addChild(layoutSwords);
    },

    _initBoss: function (bossData) {
        var self = this;
        this._bossView && this._bossView.removeFromParent();
        this._lblRevive && this._lblRevive.removeFromParent();
        this._portal && this._portal.removeFromParent();
        this._bossView = null;
        this._lblRevive = null;
        this._portal = null;

        this._bossData = bossData;
        var bossLevelInfo = bossData["bossInfo"];
        var killBossInfo = bossData["killBossInfo"];
        var bossRefillTime = bossData["countDownSeconds"];
        if (bossRefillTime) {
            var markTime = bb.now();
            var joinAgain = false;
            var _updateTextRevive = function () {
                var durationInS = bossRefillTime - ((bb.now() - markTime) / 1000);
                if (durationInS <= 0) {
                    if (!joinAgain) {
                        joinAgain = true;
                        this._lblRevive.stopAllActions();
                        this._lblRevive.runAction(cc.sequence([cc.delayTime(1.5), cc.callFunc(function () {
                            var loadingId = mc.view_utility.showLoadingDialog(10, function () { // time out.
                                joinAgain = false;
                                _startCountDown();
                            }.bind(this));
                            mc.protocol.joinWorldBoss(function (result) {
                                mc.view_utility.hideLoadingDialogById(loadingId);
                                if (result) {
                                    this._isBossRevive = true;
                                    this._initBoss(result);
                                    this._loadHeroes(this._spine_node, this._rootMapSpine);
                                    this._initFightTimes();
                                }
                            }.bind(this));
                        }.bind(this))]));
                    }
                }
                else {
                    lblRevive.setString(mc.dictionary.getGUIString("lblRespawnIn") + mc.view_utility.formatDurationTime(durationInS * 1000));
                }
            }.bind(this);
            var pos = this._rootMapSpine["1"];
            var lblRevive = this._lblRevive = bb.framework.getGUIFactory().createText("Revive In: ");
            lblRevive.x = this._root.width - pos.x - 100;
            lblRevive.y = pos.y + 320;
            lblRevive.setColor(mc.color.GREEN_NORMAL);
            var _startCountDown = function () {
                this._lblRevive.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function () {
                    _updateTextRevive();
                }.bind(this))]).repeatForever());
            }.bind(this);
            _updateTextRevive();
            _startCountDown();
            this._spine_node.addChild(lblRevive, 12);

            var portal = this._portal = sp.SkeletonAnimation.createWithJsonFile(res.spine_portal_json, res.spine_portal_atlas, 1.0);
            portal.setAnimation(0, "idle", true);
            portal.x = lblRevive.x;
            portal.y = pos.y + 170;
            portal.setName("portal");
            this._spine_node.addChild(portal);
        }
        else {
            var bossIndex = bossLevelInfo["bossIndex"];
            var monsterInfo = bossLevelInfo["monster"];
            var currHp = bossLevelInfo["hp"];
            var totalHp = monsterInfo["hp"];
            var _loadFunc = function () {
                var pos = this._rootMapSpine["1"];
                var creatureView = this._bossView = mc.BattleViewFactory.createCreatureGUIByIndex(bossIndex);
                creatureView.setPosition(this._root.width - pos.x, pos.y);
                creatureView.scale = 1.0;
                creatureView.setDirection(mc.CreatureView.DIRECTION_RIGHT);
                creatureView.setUserData(monsterInfo);
                creatureView.enableBar(true, {
                    index: mc.HeroStock.getHeroIndex(monsterInfo),
                    id: mc.HeroStock.getHeroId(monsterInfo),
                    level: mc.HeroStock.getHeroLevel(monsterInfo),
                    hpPercent: (currHp / totalHp) * mc.CreatureInfo.CAST_LONG_RATE,
                    mpPercent: 0
                });
                this._spine_node.addChild(creatureView, 10);
                if( this._isBossRevive ){
                    creatureView.x = creatureView.x - cc.winSize.width;
                    creatureView.startComming();
                }
                else{
                    creatureView.idle();
                }
                this._isBossRevive = false;
                this._lblNumDamage.setString(bb.utility.formatNumber(killBossInfo["dame"]));
            }.bind(this);
            var assetData = mc.dictionary.getCreatureAssetByIndex(bossIndex);
            if (assetData) {
                var atlasStr = assetData.getSpineString();
                var arrRes = [
                    atlasStr + ".json", atlasStr + ".atlas"
                ];
                if (!cc.sys.isNative) {
                    cc.loader.load(arrRes, function () {
                    }, function () {
                        _loadFunc(arrRes);
                    });
                } else {
                    _loadFunc(arrRes);
                }
            }

            mc.GameData.guiState.setShowingBossIndex(bossIndex);
            var bossInfo = mc.dictionary.getWorldBossInfoByIndex(bossIndex);
            var brkKey = (bossInfo && bossInfo["bg"]) ? bossInfo["bg"] : mc.BossMainLayer.DEFAULT_WORLD_BOSS_BRK_KEY;
            if( this._currBrkKey != brkKey ){
                var newBrk = new ccui.ImageView("res/png/brk/"+brkKey+".png",ccui.Widget.LOCAL_TEXTURE);
                newBrk.anchorY = 1.0;
                newBrk.x = cc.winSize.width * 0.5;
                newBrk.y = mc.const.DEFAULT_HEIGHT;
                this._nodeBrk.addChild(newBrk);
                var currBrk = this._nodeBrk._currBrk;
                if( currBrk ){
                    currBrk.runAction(cc.sequence([cc.fadeOut(0.3),cc.removeSelf()]));
                    newBrk.opacity = 0;
                    newBrk.runAction(cc.sequence([cc.fadeIn(0.4),cc.callFunc(function(){
                        self._nodeBrk._currBrk = newBrk;
                    })]));
                }
            }
        }
    },

    _loadHeroes: function (widget, rootMap) {
        if (this._mapHeroViewById) {
            for (var id in this._mapHeroViewById) {
                this._mapHeroViewById[id] && this._mapHeroViewById[id].removeFromParent();
            }
        }
        this._mapHeroViewById = {};
        var node1 = rootMap["1"];
        var node2 = rootMap["2"];
        var node3 = rootMap["3"];
        var node4 = rootMap["4"];
        var node5 = rootMap["5"];
        var slotMap = {
            slot1: {
                x: node1.x,
                y: node1.y,
                scale: 1.0,
                z: 4
            },
            slot2: {
                x: node2.x,
                y: node2.y,
                scale: 1,
                z: 2
            },
            slot3: {
                x: node3.x,
                y: node3.y,
                scale: 1,
                z: 1
            },
            slot4: {
                x: node4.x,
                y: node4.y,
                scale: 1,
                z: 3
            },
            slot5: {
                x: node5.x,
                y: node5.y,
                scale: 1,
                z: 5
            }
        };
        var num = 1;
        var arrHeroInfo = [];
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.TeamFormationManager.TEAM_WORLD_BOSS;
        var mainHeroIds = teamFormationManager.getTeamFormationByIndex(teamId);
        var leaderIndex = teamFormationManager.getLeaderFormationByIndex(teamId);
        for (var i = 0; i < mainHeroIds.length; i++) {
            var heroInfo = mc.GameData.heroStock.getHeroById(mainHeroIds[i]);
            if (heroInfo) {
                arrHeroInfo.push(heroInfo);
                var heroView = mc.BattleViewFactory.createCreatureGUIByIndex(heroInfo.index);
                var slot = slotMap["slot" + (num++)];
                heroView.x = slot.x;
                heroView.y = slot.y;
                heroView.setLocalZOrder(slot.z);
                heroView.scale = slot.scale;
                heroView.setUserData(heroInfo);
                heroView.enableBar(true);
                widget.addChild(heroView);
                if (leaderIndex === i) {
                    var containerKingIcon = new cc.Node();
                    containerKingIcon.setLocalZOrder(9999999);
                    var kingIcon = new cc.Sprite("#icon/Crown.png");
                    kingIcon.runAction(cc.sequence([cc.moveBy(0.3, 0, 8), cc.moveBy(0.3, 0, -8)]).repeatForever());

                    containerKingIcon.addChild(kingIcon);
                    heroView.addChild(containerKingIcon);

                    var statusPos = heroView.getStatusPosition("top");
                    containerKingIcon.x = statusPos.x;
                    containerKingIcon.y = statusPos.y + 20;
                }
                this._mapHeroViewById[mc.HeroStock.getHeroId(heroInfo)] = heroView;
            }
            else{
                num++;
            }
        }
    },

    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    _isEmptyTeam: function () {
        var isEmpty = true;
        var teamId = mc.TeamFormationManager.TEAM_WORLD_BOSS;
        var mainHeroIds = mc.GameData.teamFormationManager.getTeamFormationByIndex(teamId);
        for (var i = 0; i < mainHeroIds.length; i++) {
            if (mainHeroIds[i] > 0) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_WORLD_BOSS;
    },

    isShowHeader: function () {
        return false;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});

mc.BossMainLayer.DEFAULT_WORLD_BOSS_BRK_KEY = "losttower1";