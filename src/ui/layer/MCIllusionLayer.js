/**
 * Created by Thanh.Vo on 5/20/2019.
 */

mc.IllusionLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_ILLUSION);
        this.root = this.parseCCStudio(res.layer_scroll);
        this.__doLayout();
    },

    __doLayout: function () {
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_ILLUSION);
        var root = this.root;
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var listView = this.listView = rootMap["lvl"];
        var onStage = mc.GameData.illusionManager.getMaxLevelReach();
        for (var i = onStage; i > Math.max(0, onStage - mc.IllusionLayer.CREATE_PREV_UNLOCKED_STAGE); i--) {
            listView.pushBackCustomItem(this.createStage(i));
        }
        for (var j = onStage + 1; j <= Math.min(mc.GameData.illusionManager.getTotalNumStage(), onStage + mc.IllusionLayer.CREATE_NEXT_LOCKED_STAGE + 1); j++) {
            listView.insertCustomItem(this.createStage(j), 0);
        }
        listView.setScrollBarEnabled && listView.setScrollBarEnabled(false);
        //push comming sooon
        listView.insertCustomItem(this.createCommingSoonStage(), 0);

        var _initFightTimes = function () {
            root.removeChildByTag(1100524);
            root.removeChildByTag(1100525);
            var numChance = mc.GameData.illusionManager.getRemainAttackChance();
            var layoutSwords = bb.layout.linear(bb.collection.createArray(5, function (index) {
                var spr = new cc.Sprite("#icon/ico_battle.png");
                spr.swordIndex = index;
                if (index >= numChance) {
                    spr.setColor(mc.color.BLACK_DISABLE_SOFT);
                }
                return spr;
            }), 5, bb.layout.LINEAR_HORIZONTAL);
            layoutSwords.x = root.width / 2;
            layoutSwords.y = root.height * 0.82;
            var layoutSwBg = new ccui.ImageView("patch9/pnl_score.png", ccui.Widget.PLIST_TEXTURE);
            layoutSwBg.setScale9Enabled(true);
            layoutSwBg.setContentSize(layoutSwords.width + 40, layoutSwords.height + 40);
            layoutSwBg.x = layoutSwords.x;
            layoutSwBg.y = layoutSwords.y;
            root.addChild(layoutSwBg, 0, 1100524);
            root.addChild(layoutSwords, 0, 1100525);
        };
        _initFightTimes();
        var rankingButton = new ccui.ImageView("button/btn_leader.png", ccui.Widget.PLIST_TEXTURE);
        root.addChild(rankingButton);
        rankingButton.setPosition(root.width - rankingButton.width / 2 - 15, root.height * 0.82);
        rankingButton.setScale(1.35);
        rankingButton.registerTouchEvent(function () {
            mc.protocol.rankIllusionCastle(function (object) {
                new IllusionRankDialog(object).show();
            });
        });
        var rewardInfoButton = new ccui.ImageView("button/reward_Button.PNG", ccui.Widget.PLIST_TEXTURE);
        root.addChild(rewardInfoButton);
        rewardInfoButton.setPosition(rankingButton.x - rankingButton.width / 2 - rewardInfoButton.width / 2 - 40, root.height * 0.82);
        rewardInfoButton.setScale(1.35);
        rewardInfoButton.registerTouchEvent(function () {
            new IllusionRewardDialog().show();
        });
        this.traceDataChange(mc.GameData.illusionManager, function () {
            _initFightTimes();
        });
        this.scheduleOnce(function () {
            this.listView.scrollToItem(3, cc.p(0.5, 0.5), cc.p(0.5, 0.5), 0.5);
        }.bind(this));

    },

    createCommingSoonStage: function () {
        var img = new ccui.ImageView(res.illusion_bg, ccui.Widget.LOCAL_TEXTURE);
        var towerGate = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_IllusionTowerGate_json, res.spine_ui_IllusionTowerGate_atlas, 1.0);
        towerGate.addAnimation(0, "IllusionTowerGateClose", true, bb.utility.randomInt(0, 10) * 0.1);
        towerGate.x = img.width / 2;
        towerGate.y = img.height / 2 + 15;
        img.addChild(towerGate);

        var clound = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_FogFlow_json, res.spine_ui_FogFlow_atlas, 1.0);
        clound.addAnimation(0, "FogFlow", true, bb.utility.randomInt(0, 10) * 0.1);
        clound.x = img.width / 2;
        clound.y = img.height / 2;
        img.addChild(clound);
        return img;
    },
    createStage: function (id) {
        var stage = mc.GameData.illusionManager.getStage(id);
        var img = new ccui.ImageView(res.illusion_bg, ccui.Widget.LOCAL_TEXTURE);
        this.bindStage(img, stage);
        return img;
    },

    /**
     * @param widget
     * @param {mc.IllusionStage}stage
     */
    bindStage: function (widget, stage) {
        /*    widget._touchScale = -0.0001;
            widget.registerTouchEvent(function () {
                    this._showDialogStartBattle(stage.stageIndex);
                }.bind(this)
            );*/
        var stageName = widget.setString(stage.stageIndex, res.font_cam_outer_32_export_fnt, mc.const.FONT_SIZE_24);
        stageName.setPosition(widget.width / 2, widget.height * 0.95);
        var self = this;
        var illusionManager = mc.GameData.illusionManager;
        var stageRecord = illusionManager.getStageRecord(stage.stageIndex);
        var unlocked = stageRecord && stageRecord["unlock"];
        var win = stageRecord && stageRecord["win"];
        var claimed = stageRecord && stageRecord["clamed"];
        if (!win) {
            var towerGate = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_IllusionTowerGate_json, res.spine_ui_IllusionTowerGate_atlas, 1.0);
            if (unlocked) {
                towerGate.addAnimation(0, "IllusionTowerGateOpen", true, bb.utility.randomInt(0, 10) * 0.1);
            } else {
                towerGate.addAnimation(0, "IllusionTowerGateClose", true, bb.utility.randomInt(0, 10) * 0.1);
            }
            towerGate.x = widget.width / 2;
            towerGate.y = widget.height / 2 + 15;
            widget.addChild(towerGate);
        }
        //get my Hero infomation
        var teamFormation = mc.GameData.teamFormationManager;
        var teamId = mc.TeamFormationManager.TEAM_ILLUSION;
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var arrHeroId = teamFormation.getTeamFormationByIndex(teamId, teamIndex);
        var leaderHeroIndex = teamFormation.getLeaderFormationByIndex(teamId, teamIndex);
        var leaderInfo = mc.GameData.heroStock.getHeroById(arrHeroId[leaderHeroIndex]);
        var heroIndex = leaderInfo && mc.HeroStock.getHeroIndex(leaderInfo);

        widget.lazyInitHeroView = function () {
            if (!win) {
                var opponentView = mc.BattleViewFactory.createCreatureGUIByIndex(stage.monsters[0]);
                opponentView.x = this.width * 0.20;
                opponentView.y = this.height * 0.25;
                opponentView.setDirection(mc.CreatureView.DIRECTION_RIGHT);
                opponentView.scale = 0.95;
                /*  opponentView.setClickAble(true, function () {
                      self._showDialogStartBattle(stage.stageIndex);
                  }.bind(self));*/
                this.addChild(opponentView);
                this.setTouchEnabled(false);
            }

            if (!!leaderInfo && unlocked && !claimed && !win) {
                var playerView = mc.BattleViewFactory.createCreatureGUIByIndex(heroIndex);
                playerView.x = this.width + playerView.width;
                playerView.y = this.height * 0.25;
                playerView.scale = 0.95;
                playerView.setDirection(mc.CreatureView.DIRECTION_LEFT);
                playerView && this.addChild(playerView);
                playerView.runAction(cc.moveTo(0.3, this.width * 0.80, playerView.y).easing(cc.easeSineIn()));
            }
            if (win) {
                var treasureBox = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json, res.spine_ui_chest_atlas, 1.0);
                treasureBox.setSkin(mc.GuildBossLayer.ARRAY_TREASUREBOX_SKIN[0]);
                treasureBox.addAnimation(0, "opened", true, bb.utility.randomInt(0, 10) * 0.1);
                treasureBox.x = widget.width / 2;
                treasureBox.y = widget.height * 0.15 + 40;
                widget.addChild(treasureBox);
            }
        }.bind(widget);
        if (!win) {
            var layoutTouch = new ccui.Layout();
            layoutTouch.setContentSize(widget.getContentSize());
            layoutTouch.setAnchorPoint(0.5, 0.5);
            widget.addChild(layoutTouch, 999);
            layoutTouch.registerTouchEvent(function () {
                    this._showDialogStartBattle(stage.stageIndex);
                }.bind(this)
            );
            layoutTouch.setPosition(widget.width / 2, widget.height / 2);
        }
        var arrRes = [];
        arrRes = mc.resource.getPreLoadSpineURL(stage.monsters[0], arrRes);
        if (!!leaderInfo && unlocked && !claimed && !win) {//preload res my hero
            arrRes = mc.resource.getPreLoadSpineURL(heroIndex, arrRes);
        }
        this.loadMoreURL(arrRes, function () {
            this.lazyInitHeroView();
        }.bind(widget));


    },

    _showDialogStartBattle: function (stageIndex, getFromCache) {
        if (mc.GameData.illusionManager.getRemainAttackChance() <= 0) {
            mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_ILLUSION);
        } else {
            mc.GameData.guiState.setCurrentIllusionStageIndex(stageIndex);
            var illusionManager = mc.GameData.illusionManager;
            var stage = illusionManager.getStage(stageIndex);
            var stageRecord = illusionManager.getStageRecord(stageIndex);
            if (stage) {
                var dialogStartBattle = new IllusionStartBattleDialog(stage);
                if (stageRecord && stageRecord["unlock"]) {
                    dialogStartBattle.setStartCallback(function () {
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.startBattleIllusionCastle(stageIndex, function (data, err) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            if (data) {
                                mc.GUIFactory.showIllusionBattleScreen();
                            }
                        }.bind(this));
                    });
                }
                dialogStartBattle.show();
            } else {
                if (!getFromCache) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.viewIllusionCastleStage(stageIndex, function () {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        this._showDialogStartBattle(stageIndex, true);
                    }.bind(this));
                }
            }
        }

    },

    onLayerShow: function () {
        var currentIllusionStageIndex = mc.GameData.guiState.getCurrentIllusionStageIndex();
        if (currentIllusionStageIndex)
            this._showDialogStartBattle(currentIllusionStageIndex);
    },

    onLayerClearStack: function () {
        mc.GameData.guiState.setCurrentIllusionStageIndex(null);
    },


    onStart: function () {
        this._super();
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_ILLUSION;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});


var IllusionRankDialog = bb.Dialog.extend({

    ctor: function (logs) {
        this._super();
        this.logs = logs;
        var node = ccs.load(res.illusion_rank_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var lblTittle = rootMap["top_lbl"];
        var lblNameCol = rootMap["name"];
        var lblFloorCol = rootMap["score"];
        var lblStarCol = rootMap["star"];

        if(mc.enableReplaceFontBM())
        {
            lblTittle = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblTittle);
            lblNameCol = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblNameCol);
            lblFloorCol = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblFloorCol);
            lblStarCol = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblStarCol);

            lblTittle.x -= 20;
            var fontSize = 26;
            lblNameCol.setFontSize(fontSize);
            lblFloorCol.setFontSize(fontSize);
            lblStarCol.setFontSize(fontSize);
            lblStarCol.setColor(mc.color.WHITE_NORMAL);
        }

        lblTittle.setString(mc.dictionary.getGUIString("Top Player"));
        lblNameCol.setString(mc.dictionary.getGUIString("lblName"));
        lblFloorCol.setString(mc.dictionary.getGUIString("lblFloor"));
        lblStarCol.setString(mc.dictionary.getGUIString("lblStar"));

        var btnClose = rootMap["btn_close"];
        var log = rootMap["log"];
        var score = rootMap["score"];
        score.setString("Floor");
        log.setVisible(false);
        var list = rootMap["list"];
        list.setScrollBarEnabled && list.setScrollBarEnabled(false);
        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        this.setEnableClickOutSize(true);
        var tops = logs["top"];
        for (var i in tops) {
            var top = tops[i];

            var mine = top["gameHeroId"] === mc.GameData.playerInfo.getId();
            if (mine) {
                this.bindRecord(log, top, mine);
            }
            var logClone = log.clone();
            this.bindRecord(logClone, top, mine);
            list.pushBackCustomItem(logClone);
        }
    },


    bindRecord: function (log, data, mine) {
        var rank = log.getChildByName("rank");
        var name = log.getChildByName("name");
        var score = log.getChildByName("score");
        var star = log.getChildByName("star");

        if(mc.enableReplaceFontBM())
        {
            rank = mc.view_utility.replaceBitmapFontAndApplyTextStyle(rank);
            name = mc.view_utility.replaceBitmapFontAndApplyTextStyle(name);
            score = mc.view_utility.replaceBitmapFontAndApplyTextStyle(score);
            star = mc.view_utility.replaceBitmapFontAndApplyTextStyle(star);
        }
        rank.setString(data["rank"] || "?");
        rank.setColor(mc.color.GREEN_NORMAL);
        name.setString(data["name"] || "?");
        name.setColor(mine ? mc.color.GREEN : mc.color.YELLOW_SOFT);
        score.setString(bb.utility.formatNumber(data["maxLevel"] || 0, ","));
        score.setColor(mc.color.BLUE_SOFT);
        star.setColor(mc.color.BLUE_SOFT);
        star.setString(bb.utility.formatNumber(data["totalStar"] || 0, ","));
        log.setVisible(true);
    }

});

var IllusionStartBattleDialog = bb.Dialog.extend({
    /**
     * @param {mc.IllusionStage}stage
     */
    ctor: function (stage) {
        this._super();
        var node = ccs.load(res.widget_DialogVsBattleIllusion, "res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var panelPlayer = this._panelPlayer = rootMap["panelPlayer"];
        var panelEnemy = this._panelEnemy = rootMap["panelEnemy"];
        var btnCancel = this._btnCancel = rootMap["btnCancel"];
        var btnStart = this._btnStart = rootMap["btnStart"];
        var nodeVS = rootMap["nodeVS"];
        btnStart.setString(mc.dictionary.getGUIString("lblStart"));
        btnCancel.setString(mc.dictionary.getGUIString("lblCancel"));

        var monsterStock = mc.dictionary.monsterMap;
        var arrFormation = stage.monsters;
        this._reloadTopPanel(panelEnemy, mc.dictionary.getGUIString("lblFloor") + " " + stage.stageIndex, monsterStock, arrFormation);
        this._reloadBottomPanel(panelPlayer, stage);

        var textVSEffect = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_text_vs_effect_json, res.spine_ui_text_vs_effect_atlas, 1.0);
        nodeVS.addChild(textVSEffect);
        nodeVS.setVisible(false);

        btnStart.registerTouchEvent(function () {
            bb.sound.stopMusic();
            this.enableInput(false);
            textVSEffect.setAnimation(0, "vs_battle", false);
            this.scheduleOnce(function () {
                if (this._startCallback) {
                    bb.sound.playEffect(res.sound_ui_button_start_battle);
                    this._startCallback();
                    this.scheduleOnce(function () {
                        this.enableInput(true);
                    }.bind(this), 1.0);
                }
            }.bind(this), 1.0);
            nodeVS.setVisible(true);
        }.bind(this));
        btnStart.setGrayForAll(true);

        btnCancel.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    },


    setStartCallback: function (callback) {
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var arrFormation = teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);
        var canStartBattle = false;
        for (var f = 0; f < arrFormation.length; f++) {
            if (arrFormation[f] >= 0) {
                canStartBattle = true;
                break;
            }
        }
        this._startCallback = callback;
        if (canStartBattle) {
            this._btnStart.setGrayForAll(false);
        }
        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = this._btnStart.width * 0.5;
        particle.y = this._btnStart.height * 0.5;
        this._btnStart.addChild(particle);
        //str && this._btnStart.setString(str);
        return this;
    },

    overrideShowAnimation: function () {
        var dur = 0.2;
        this._panelPlayer.x = cc.winSize.width * -0.5;
        this._panelPlayer.runAction(cc.moveTo(0.2, cc.winSize.width * 0.5, this._panelPlayer.y).easing(cc.easeBackOut()));

        this._panelEnemy.x = cc.winSize.width * 1.5;
        this._panelEnemy.runAction(cc.moveTo(0.2, cc.winSize.width * 0.5, this._panelEnemy.y).easing(cc.easeBackOut()));

        this._btnCancel.opacity = 0;
        this._btnCancel.runAction(cc.fadeIn(dur));
        this._btnStart.opacity = 0;
        this._btnStart.runAction(cc.fadeIn(dur));
        return dur;
    },

    overrideCloseAnimation: function () {
        var dur = 0.2;
        this._panelPlayer.runAction(cc.moveTo(0.2, cc.winSize.width * -0.5, this._panelPlayer.y));

        this._panelEnemy.runAction(cc.moveTo(0.2, cc.winSize.width * 1.5, this._panelEnemy.y));

        this._btnCancel.runAction(cc.fadeOut(dur));
        this._btnStart.runAction(cc.fadeOut(dur));
        return dur;
    },

    _reloadTopPanel: function (panel, name, mapMonster, arrFormation) {
        var panelMap = bb.utility.arrayToMap(panel.getChildren(), function (child) {
            return child.getName();
        });
        var lblName = panelMap["lblName"];
        var nodeAvt = panelMap["nodeAvt"];
        lblName.setString(name);
        lblName.setColor(mc.color.BROWN_SOFT);
        mc.view_utility.layoutTeamMonsters({
            arrTeamFormation: arrFormation,
            mapHeroInfo: mapMonster
        }, {
            nodeHero: nodeAvt
        }, true, -5);
    },

    _reloadBottomPanel: function (panel, stage) {
        var rootMap = bb.utility.arrayToMap(panel.getChildren(), function (child) {
            return child.getName();
        });

        var lblTeam = rootMap["lblTeam"];
        var lblReward = rootMap["lblReward"];
        var nodeHero = rootMap["nodeHero"];
        var nodeReward = this._nodeReward = rootMap["nodeReward"];
        nodeHero.scale = 0.965;

        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.TeamFormationManager.TEAM_ILLUSION;
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var heroStock = mc.GameData.heroStock;
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_ILLUSION);

        var dataTeam = {
            arrTeamFormation: teamFormationManager.getTeamFormationByIndex(teamId, teamIndex),
            leaderIndex: teamFormationManager.getLeaderFormationByIndex(teamId, teamIndex),
            mapHeroInfo: heroStock.getHeroMap()
        };
        mc.view_utility.layoutTeamFormation(dataTeam, {
            nodeHero: nodeHero,
            showNotifyIfNotHero: true
        });

        var arrReward = stage.rewardItems;
        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
            var itemView = new mc.ItemView(arrReward[index]).registerViewItemInfo();
            itemView.setSwallowTouches(false);
            if (arrReward[index]["isFirstTimeReward"] == true) {
                var icon = new cc.Sprite("#icon/ico_clear.png");
                icon.x = itemView.width * 0.085;
                icon.y = itemView.height * 0.85;
                itemView.addChild(icon);
            }
            return itemView;
        }), 10);
        var wrapWidget = mc.view_utility.wrapWidget(layoutReward, 598, false, {top: 12, bottom: 12});
        nodeReward.addChild(wrapWidget);

        lblTeam.setColor(mc.color.BROWN_SOFT);
        lblReward.setColor(mc.color.BROWN_SOFT);
        lblReward.setString(mc.dictionary.getGUIString("lblRewards"));
        lblTeam.setString(mc.dictionary.getGUIString("lblBattleTeam"));
    }

});

var IllusionRewardDialog = bb.Dialog.extend({
    ctor: function () {
        this._super();
        var node = ccs.load(res.illusion_rewards_dialog, "res/").node;
        this.addChild(node);
        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title = rootMap["title"];
        var btnCancel = rootMap["btn_close"];
        title.setString(mc.dictionary.getGUIString("lblIllusionTower"));
        var list = rootMap["list"];
        var illusions = mc.dictionary.illusionDict.getData();
        var stageLength = mc.dictionary.illusionDict.getStageNumber();
        for (var i = 0; i < stageLength; i++) {
            var illusion = illusions[i + 1];//i+1 = stage index
            if ((i+1) % 10 == 0&&!!illusion)
                list.pushBackCustomItem(this.createItemRewardInfo(illusion));
        }
        btnCancel.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    },


    createItemRewardInfo: function (illusionIndict) {
        var panel = new ccui.ImageView("patch9/pnl_event_stage.png", ccui.Widget.PLIST_TEXTURE);
        var stageIdex = new ccui.TextBMFont(illusionIndict.index, res.font_cam_outer_48_export_fnt);
        stageIdex.setOverlayColor(mc.color.BLUE);
        var monsterStock = mc.dictionary.monsterMap;
        var arrFormation = illusionIndict.team;
        var widget = new mc.HeroAvatarView(monsterStock[arrFormation[0]]);
        panel.addChild(stageIdex);
        panel.addChild(widget);
        stageIdex.setPosition(95, panel.height / 2);
        widget.setPosition(panel.width - widget.width / 2 - 50, panel.height / 2);
        var arrReward = illusionIndict.rewardItems;
        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
            var itemView = new mc.ItemView(arrReward[index]);
            itemView.scale = 0.75;
            itemView.registerViewItemInfo();
            itemView.setSwallowTouches(false);
            if (arrReward[index]["isFirstTimeReward"] == true) {
                var icon = new cc.Sprite("#icon/ico_clear.png");
                icon.x = itemView.width * 0.085;
                icon.y = itemView.height * 0.85;
                itemView.addChild(icon);
            }
            return itemView;
        }), 10);
        var wrapWidget = mc.view_utility.wrapWidget(layoutReward, 350, false, {
            top: 7,
            left: -10,
            bottom: 10,
            a1: -32,
            a2: -32
        });
        wrapWidget.x = panel.width * 0.455;
        wrapWidget.y = panel.height * 0.5;
        panel.addChild(wrapWidget);
        return panel;
    }
});


mc.IllusionLayer.CREATE_PREV_UNLOCKED_STAGE = 2;
mc.IllusionLayer.CREATE_NEXT_LOCKED_STAGE = 2;
mc.IllusionLayer.LIMIT_ITEM_FOR_SHOW = 1000;

