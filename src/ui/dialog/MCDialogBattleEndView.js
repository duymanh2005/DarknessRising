/**
 * Created by long.nguyen on 6/12/2017.
 */
mc.DialogBattleEndView = bb.Dialog.extend({
    _currShowItemIndex: 0,
    _arrItemViews: null,
    _autoRetry: false,
    _battleIn: null,

    ctor: function (battleIn, statsContainer) {
        this._super();
        if (battleIn) {
            this._battleIn = battleIn;
        }
        var self = this;
        var node = ccs.load(res.widget_dialog_battle_end_view, "res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var panelLose = root.getChildByName("panelLose");
        var panelWin = root.getChildByName("panelWin");
        var progressExp = this._progressExp = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_PLAYER_EXP);
        progressExp.setCurrentProgressValue(mc.GameData.playerInfo.getExp(), mc.GameData.playerInfo.getMaxExp());
        progressExp.getLabelProgress().setVisible(false);
        progressExp.x = 375;
        progressExp.y = 790;
        panelWin.addChild(progressExp);

        if (statsContainer) {
            var btnShowBattleStats = new ccui.ImageView("icon/Menu.png", ccui.Widget.PLIST_TEXTURE);
            btnShowBattleStats.x = cc.winSize.width - btnShowBattleStats.width * 0.5 - 10;
            btnShowBattleStats.y = cc.winSize.height - btnShowBattleStats.height * 0.5 - 10;
            mc.view_utility.setNotifyIconForWidget(btnShowBattleStats, true);
            btnShowBattleStats.registerTouchEvent(function () {
                mc.view_utility.setNotifyIconForWidget(btnShowBattleStats, false);
                new mc.BattleStatsDialog(statsContainer).show();
            });
            root.addChild(btnShowBattleStats);
        }

        panelLose.setVisible(false);
        panelWin.setVisible(false);

        var currentPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        var lvlUpInfo = null;
        var unlockCode = null;
        var rankUpInfo = null;

        var self = this;
        var tempPnlArenaCup = root.getChildByName("pnlArenaCup");
        var tempPnlClanCup = root.getChildByName("pnlClanCup");
        var pnlArenaCup = null;//self._pnlArenaCup = root.getChildByName("pnlArenaCup");
        var pnlClanCup = null;//self._pnlClanCup = root.getChildByName("pnlClanCup");
        var lblArenaCup = null;
        var lblClanCup = null;

        var _processAccountChanger = function () {
            var expProgressAnimation = mc.view_utility.createAnimationExpProgress(self._progressExp);
            expProgressAnimation["unlockCode"] = function (oldUnlockCode, newUnlockCode) {
                unlockCode = newUnlockCode;
            };
            expProgressAnimation["league"] = function (oldLeague, newLeaague) {
                rankUpInfo = {curr: oldLeague, next: newLeaague};
            };
            mc.GameData.accountChanger.performChanging(expProgressAnimation);
        };
        var _processLvUpEvent = function () {
            mc.GameData.lvlUpEvent.performChanging({
                "maxStamina": function (oldMaxStamina, maxStamina) {
                    lvlUpInfo = mc.GameData.lvlUpEvent.getAttachData();
                }
            });
        };

        _processAccountChanger();
        _processLvUpEvent();
        var arrAttachDialogIdStack = ["friend", "unlock", "lvlUp", "rankUp", "secret_rewards"];
        var _startShowAttachDialog = function () {
            while (arrAttachDialogIdStack.length > 0) {
                var code = arrAttachDialogIdStack.pop();
                var isShow = _showAttachDialog(code);
                if (isShow) {
                    break;
                }
            }
        };
        var _showAttachDialog = function (code) {
            var newFriend = mc.GameData.resultInBattle.getNewFriend();
            var isShow = false;
            if (code === "lvlUp" && lvlUpInfo) {
                new mc.AccountLevelUpDialog(lvlUpInfo).setBlackBackgroundEnable(true).setCloseCallback(_startShowAttachDialog).show();
                isShow = true;
            }
            if (code === "unlock" && unlockCode) {
                if (mc.UnlockFunctionDialog.GUIDATABYCODE[unlockCode]) {
                    new mc.UnlockFunctionDialog(unlockCode).setBlackBackgroundEnable(true).setCloseCallback(_startShowAttachDialog).show();
                    isShow = true;
                }
            }
            if (code === "friend" && newFriend) {
                new mc.RequestFriendDialog(newFriend).setBlackBackgroundEnable(true).setCloseCallback(_startShowAttachDialog).show();
                isShow = true;
            }
            if (code === "rankUp" && rankUpInfo) {
                new mc.RankUpDialog(rankUpInfo.curr, rankUpInfo.next).setBlackBackgroundEnable(true).setCloseCallback(_startShowAttachDialog).show();
            }
            if (code === "secret_s" && mc.GameData.resultInBattle.getArraySecretRewardItem()) {
                new mc.SecretRewardsDialog(mc.GameData.resultInBattle.getArraySecretRewardItem()).show();
            }
            return isShow;
        };

        bb.sound.stopMusic();

        var numStar = mc.GameData.resultInBattle.getNumStar();

        var curOpp = null;
        if (this._battleIn === mc.DialogBattleEndView.BATTLE_IN.ARENA) {
            var arenaInBattle = mc.GameData.arenaInBattle;
            var opp = arenaInBattle.getBattleTeamOpponentInfo();
            var arena = mc.GameData.arenaManager;
            var arrOpp = arena.getArraySearchOpponent();
            if (arrOpp) {
                for (var i = 0; i < arrOpp.length; i++) {
                    if (arrOpp[i]["gameHeroName"] === opp["heroName"]) {
                        curOpp = arrOpp[i];
                        break;
                    }
                }
            }
            if (!curOpp) {
                var temp = arena.getSelectRevengingOpponent();
                if (temp && temp["gameHeroName"] === opp["heroName"]) {
                    curOpp = temp;
                }
            }
        }
        if (mc.GameData.resultInBattle.isWin()) {
            bb.sound.playEffect(res.sound_ui_battle_win);
            panelWin.setVisible(true);
            for (var i = 0; i < 5; i++) {
                this.scheduleOnce(function () {
                    for (var p = 0; p < 5; p++) {
                        var particleFireWork = new cc.ParticleSystem(res.particle_firework_plist);
                        particleFireWork.x = cc.winSize.width * 0.5 + bb.utility.randomInt(-200, 200);
                        particleFireWork.y = cc.winSize.height * 0.7 + bb.utility.randomInt(-200, 200);
                        this.addChild(particleFireWork);
                    }
                }.bind(this), (i) * 0.35);
            }

            var panelMap = bb.utility.arrayToMap(panelWin.getChildren(), function (element) {
                return element.getName();
            });
            var glory = panelMap["glory"];
            var sprVic = panelMap["sprVic"];
            var star1 = panelMap["star1"];
            var star2 = panelMap["star2"];
            var star3 = panelMap["star3"];
            var starOn1 = panelMap["starOn1"];
            var starOn2 = panelMap["starOn2"];
            var starOn3 = panelMap["starOn3"];
            var nodeButton = panelMap["nodeButton"];
            var blackText_0 = panelMap["blackText_0"];
            var blackTextHero = panelMap["blackTextHero"];
            var nodeItem = panelMap["nodeItem"];
            var lblReward = panelMap["lblReward"];
            var nodeAvatar = panelMap["nodeAvatar"];
            var lblPlayerName = panelMap["lblPlayerName"];
            var lblPlayerLv = panelMap["lblPlayerLv"];
            pnlArenaCup = self._pnlArenaCup = tempPnlArenaCup.clone();
            pnlClanCup = self._pnlClanCup = tempPnlClanCup.clone();
            pnlArenaCup.setCascadeOpacityEnabled(true);
            pnlClanCup.setCascadeOpacityEnabled(true);


            var lblIncrExp = null;
            var lblTotalExp = null;
            var lblCurExp = null;

            if (this._battleIn === mc.DialogBattleEndView.BATTLE_IN.CAMPAIGN) {
                var resultInBattle = mc.GameData.resultInBattle;
                lblIncrExp = lblPlayerLv.clone();
                lblTotalExp = lblPlayerLv.clone();
                lblCurExp = lblPlayerLv.clone();
                panelWin.addChild(lblIncrExp);
                panelWin.addChild(lblTotalExp);
                panelWin.addChild(lblCurExp);
                var scale = 0.7;

                lblIncrExp.scale = scale;
                lblIncrExp.anchorX = 0.5;
                lblIncrExp.x = progressExp.x;
                lblIncrExp.y = lblPlayerLv.y;
                lblIncrExp.opacity = 0;
                lblIncrExp.setColor(mc.color.GREEN_ELEMENT);
                lblIncrExp.setString("+" + mc.GameData.playerInfo.getLastEarningStageExp() + " Exp");

                lblCurExp.scale = scale;
                lblCurExp.anchorX = 1;
                lblCurExp.x = progressExp.x - 5;
                lblCurExp.y = progressExp.y + 6;
                lblCurExp.opacity = 0;
                lblCurExp.setString(mc.GameData.playerInfo.getExp());

                lblTotalExp.scale = scale;
                lblTotalExp.anchorX = 0;
                lblTotalExp.x = progressExp.x;
                lblTotalExp.y = progressExp.y + 6;
                lblTotalExp.opacity = 0;

                lblTotalExp.setString("/ " + mc.GameData.playerInfo.getMaxExp());


            } else if (this._battleIn === mc.DialogBattleEndView.BATTLE_IN.ARENA && curOpp) {
                pnlArenaCup.setVisible(true);
                lblArenaCup = pnlArenaCup.getChildByName("lbl");

                if (curOpp && mc.GameData.guildManager.getGuildInfo()) {
                    if (curOpp["guild_info"] && curOpp["guild_info"].guildId != mc.GameData.guildManager.getGuildId()) {
                        pnlClanCup.setVisible(true);
                        lblClanCup = pnlClanCup.getChildByName("lbl");
                    }
                }
            }

            lblPlayerName.setString(mc.GameData.playerInfo.getName());
            lblReward.setString(mc.dictionary.getGUIString("lblRewards"));
            lblPlayerLv.setString(mc.dictionary.getGUIString("lblLv.") + mc.GameData.playerInfo.getLevel());
            lblPlayerName.opacity = lblPlayerLv.opacity = 0;
            progressExp.fadeOut();

            blackTextHero.opacity = 0;
            blackText_0.opacity = 0;
            lblReward.opacity = 0;

            var delay = 0.3;
            var scaleStarDelay = 0.35;
            starOn1.scale = 0.0;
            starOn2.scale = 0.0;
            starOn3.scale = 0.0;

            panelWin.opacity = 0;
            panelWin.runAction(cc.fadeIn(0.5));
            var _showParticleStar = function (starView) {
                var particle = new cc.ParticleSystem(res.particle_win_star_explosion_plist);
                particle.x = starView.x;
                particle.y = starView.y;
                starView.getParent().addChild(particle);
            };
            var _showPlayerExp = function () {
                lblPlayerName.runAction(cc.fadeIn(0.2));
                lblPlayerLv.runAction(cc.fadeIn(0.2));
                progressExp.fadeIn(0.2);
                if (lblIncrExp) {
                    lblIncrExp.runAction(cc.fadeIn(0.2));
                }
                if (lblTotalExp) {
                    lblTotalExp.runAction(cc.fadeIn(0.2));
                }
                if (lblCurExp) {
                    lblCurExp.runAction(cc.fadeIn(0.2));
                }
            };

            this.scheduleOnce(function () {
                var i = 0;
                starOn1.runAction(cc.sequence([cc.delayTime(delay * (++i)), cc.sound(res.sound_ui_battle_win_star1), cc.callFunc(_showParticleStar), cc.scaleTo(scaleStarDelay, star1.scale).easing(cc.easeBackOut())]));
                if (numStar >= 2) {
                    starOn2.runAction(cc.sequence([cc.delayTime(delay * (++i)), cc.sound(res.sound_ui_battle_win_star2), cc.callFunc(_showParticleStar), cc.scaleTo(scaleStarDelay, star2.scale).easing(cc.easeBackOut())]));
                }
                if (numStar >= 3) {
                    starOn3.runAction(cc.sequence([cc.delayTime(delay * (++i)), cc.sound(res.sound_ui_battle_win_star3), cc.callFunc(_showParticleStar), cc.scaleTo(scaleStarDelay, star3.scale).easing(cc.easeBackOut())]));
                }
                this.scheduleOnce(function () {
                    _showPlayerExp();
                }, delay * (++i));
                this.scheduleOnce(function () {
                    _showAllHero();
                }, delay * (++i));
            }.bind(this), 0.5);
            glory.runAction(cc.rotateBy(0.01, 1).repeatForever());

            var btnRetry = self._btnRetry = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblRetry"));
            btnRetry.ignoreContentAdaptWithSize(true);
            btnRetry.loadTexture("button/Blue_Button.png", ccui.Widget.PLIST_TEXTURE);
            var btnNext = self._btnNext = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString(currentPartInBattle ? "lblNext" : "lblOk"));
            btnNext.scale = 0;
            btnRetry.scale = 0;
            btnRetry.x = -cc.winSize.width * 0.2;
            btnNext.x = cc.winSize.width * 0.2;
            //var y = btnRetry.y;
            nodeButton.addChild(btnRetry);
            nodeButton.addChild(btnNext);

            nodeButton.addChild(pnlArenaCup);
            nodeButton.addChild(pnlClanCup);

            pnlArenaCup.opacity = 0;
            pnlClanCup.opacity = 0;

            if (lblArenaCup) {
                var resultInBattle = mc.GameData.resultInBattle;
                btnRetry.y += -btnRetry.height;
                btnNext.y += -btnNext.height;
                var arenaPoint = curOpp.winPoint;
                arenaPoint > 0 && (lblArenaCup.setColor(mc.color.GREEN_NORMAL));
                var tempY = btnNext.y + btnNext.height + 30;
                pnlArenaCup.y = tempY;
                if (lblClanCup) {
                    pnlClanCup.x = cc.winSize.width * 0.2;
                    var clanPoint = Math.floor(arenaPoint * 1.5);
                    clanPoint > 0 && (lblClanCup.setColor(mc.color.GREEN_NORMAL));
                    pnlArenaCup.x = -cc.winSize.width * 0.2;
                    pnlClanCup.y = tempY
                    lblClanCup.setString(clanPoint > 0 ? ("+" + clanPoint) : clanPoint);
                } else {
                    pnlArenaCup.x = 0;
                }
                lblArenaCup.setString(arenaPoint > 0 ? ("+" + arenaPoint) : arenaPoint);
            }

            //btnRetry.y += 60;
            //btnNext.y += 60;

            var _showAllHero = function () {
                var resultInBattle = mc.GameData.resultInBattle;
                var newFriend = resultInBattle.getNewFriend();
                var arrHeroInfoPartIn = [];
                var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
                if (teamId === mc.TeamFormationManager.TEAM_CAMPAIGN) {
                    var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
                    var teamByHeroId = mc.GameData.teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);
                    var mapHeroInfoPartInById = null;
                    if (currentPartInBattle) {
                        mapHeroInfoPartInById = bb.utility.arrayToMap(currentPartInBattle.getArrayHeroInfoPartIn(), function (heroInfo) {
                            return mc.HeroStock.getHeroId(heroInfo);
                        });
                    } else {
                        mapHeroInfoPartInById = mc.GameData.heroStock.getHeroMap();
                    }
                    for (var f = 0; f < teamByHeroId.length; f++) {
                        if (teamByHeroId[f] > 0) {
                            var heroInfoPartIn = mapHeroInfoPartInById[teamByHeroId[f]];
                            if (newFriend && (teamByHeroId[f] === newFriend["replaceHeroId"])) {
                                heroInfoPartIn = mapHeroInfoPartInById[newFriend["heroId"]];
                            }
                            heroInfoPartIn && arrHeroInfoPartIn.push(heroInfoPartIn);
                        }
                    }
                } else {
                    if (currentPartInBattle) {
                        arrHeroInfoPartIn = currentPartInBattle.getArrayHeroInfoPartIn();
                    }
                }

                var friendHeroId = null;
                var mapHeroGainExp = resultInBattle.getMapHeroGainExp();
                // fill the friend hero if any.
                var friendInfo = resultInBattle.getNewFriend();
                if (!friendInfo && currentPartInBattle && currentPartInBattle.getNewFriendInfo) {
                    friendInfo = currentPartInBattle.getNewFriendInfo();
                }
                if (friendInfo) {
                    if (currentPartInBattle.getFriendHeroInfoById) {
                        friendHeroId = friendInfo["heroId"];
                        heroInfo = currentPartInBattle.getFriendHeroInfoById(friendHeroId);
                        arrHeroInfoPartIn[friendInfo["slotId"]] = heroInfo;
                    }
                }

                if (arrHeroInfoPartIn) {
                    var arrHeroView = [];
                    for (var index = 0; index < arrHeroInfoPartIn.length; index++) {
                        var heroInfo = arrHeroInfoPartIn[index];
                        if (heroInfo) {
                            var heroId = mc.HeroStock.getHeroId(heroInfo);
                            var newHeroInfo = mc.GameData.heroStock.getHeroById(heroId);
                            !newHeroInfo && (newHeroInfo = heroInfo);
                            var heroView = new mc.HeroAvatarView(newHeroInfo);
                            if (mapHeroGainExp) {
                                if (mapHeroGainExp[heroId]) {
                                    heroView.opacity = 0;
                                    heroView.runAction(cc.sequence([cc.delayTime(0.2 * index), cc.fadeIn(0.2), cc.callFunc(function (heroView) {
                                        var heroInfo = heroView.getUserData();
                                        var heroId = mc.HeroStock.getHeroId(heroInfo);
                                        var expProgress = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_EXP);
                                        expProgress.setCurrentProgressValue(heroInfo.exp, heroInfo.maxExp);
                                        if (mc.HeroStock.isHeroMaxLevel(heroInfo)) {
                                            expProgress.getLabelProgress().setString(mc.dictionary.getGUIString("lblMax"));
                                        }
                                        expProgress.x = heroView.width * 0.5;
                                        expProgress.y = -30;
                                        heroView.addChild(expProgress);
                                        var expProgressAnimation = mc.view_utility.createAnimationExpProgress(expProgress, function (expData) {
                                            var lblNumExp = new ccui.TextBMFont("+", res.font_cam_stroke_32_export_fnt);
                                            lblNumExp.setColor(mc.color.YELLOW);
                                            lblNumExp.scale = 0.8;
                                            lblNumExp.anchorX = 0.5;
                                            lblNumExp.x = heroView.width * 0.5;
                                            lblNumExp.y = -60;
                                            heroView.addChild(lblNumExp);
                                            lblNumExp.runAction(cc.countText(0.2, 0, expData.tte).setExtraText("+"));

                                        }, function (oldLevel, newLevel) {
                                            heroView._lblLvlUp && (heroView._lblLvlUp.removeFromParent());
                                            heroView._lblLvlArrow && (heroView._lblLvlArrow.removeFromParent());

                                            var lblLevelUp = heroView._lblLvlUp = new cc.Sprite("#text/Level_up.png");
                                            var lblLevelUpArrow = heroView._lblLvlArrow = new cc.Sprite("#icon/Lv_up_arrow.png");

                                            lblLevelUp.x = heroView.width * 0.4;
                                            lblLevelUp.y = heroView.height * 0.5;
                                            lblLevelUpArrow.x = heroView.width * 0.95;
                                            lblLevelUpArrow.y = heroView.height * 0.51;
                                            lblLevelUp.scale = 0;
                                            lblLevelUp.runAction(cc.scaleTo(0.1, 1.0));
                                            lblLevelUpArrow.scale = 0;
                                            lblLevelUpArrow.runAction(cc.sequence([cc.scaleTo(0.1, 1.0), cc.callFunc(function () {
                                                lblLevelUpArrow.runAction(cc.sequence([cc.moveBy(0.2, 0, 2), cc.moveBy(0.2, 0, -2)]).repeatForever());
                                                bb.sound.playEffect(res.sound_ui_hero_lvup);
                                            })]));
                                            heroView.addChild(lblLevelUp);
                                            heroView.addChild(lblLevelUpArrow);
                                        });
                                        mc.GameData.heroInfoChangerCollection.getChanger(heroId).performChanging(expProgressAnimation);
                                    })]));
                                } else {
                                    if (heroId != friendHeroId) {
                                        var sprDead = new cc.Sprite("#text/text_dead.png");
                                        sprDead.scale = 0.75;
                                        sprDead.x = heroView.width * 0.5;
                                        sprDead.y = heroView.height * 0.5;
                                        heroView.addChild(sprDead);
                                        heroView.setBlack(true);
                                        heroView.opacity = 0;
                                        heroView.runAction(cc.sequence([cc.delayTime(0.2 * index), cc.fadeIn(0.2)]));
                                    }
                                }
                            } else {
                                var mapHeroStatus = resultInBattle.getMapHeroStatus();
                                if (mapHeroStatus) {
                                    heroView.opacity = 0;
                                    heroView.setCascadeOpacityEnabled(true);
                                    heroView.runAction(cc.sequence([cc.delayTime(0.2 * index), cc.fadeIn(0.2), cc.callFunc(function (heroView) {
                                        var heroInfo = heroView.getUserData();
                                        var heroId = mc.HeroStock.getHeroId(heroInfo);
                                        var hpProgress = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_HP);
                                        var mpProgress = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_MP);
                                        if (mapHeroStatus[heroId]) {
                                            hpProgress.setCurrentProgressValue(mapHeroStatus[heroId].hpPercent / mc.CreatureInfo.CAST_LONG_RATE * 100, 100);
                                            mpProgress.setCurrentProgressValue(mapHeroStatus[heroId].mpPercent / mc.CreatureInfo.CAST_LONG_RATE * 100, 100);
                                        } else {
                                            hpProgress.setCurrentProgressValue(0, 100);
                                            mpProgress.setCurrentProgressValue(0, 100);
                                        }
                                        hpProgress.getLabelProgress().setVisible(false);
                                        mpProgress.getLabelProgress().setVisible(false);
                                        hpProgress.x = heroView.width * 0.5;
                                        hpProgress.y = -30;
                                        mpProgress.x = heroView.width * 0.5;
                                        mpProgress.y = -60;
                                        heroView.addChild(hpProgress);
                                        heroView.addChild(mpProgress);
                                        if (mapHeroStatus[heroId] && mapHeroStatus[heroId].hpPercent <= 0) {
                                            var sprDead = new cc.Sprite("#text/text_dead.png");
                                            sprDead.scale = 0.75;
                                            sprDead.x = heroView.width * 0.5;
                                            sprDead.y = heroView.height * 0.5;
                                            heroView.addChild(sprDead);
                                            heroView.setGray(true);
                                        }
                                    })]));
                                }
                            }
                            heroView.scale = 0.9;
                            arrHeroView.push(heroView);
                        }
                    }
                    var layoutAvtHero = bb.layout.linear(arrHeroView, 20);
                    nodeAvatar.addChild(layoutAvtHero);
                    blackTextHero.runAction(cc.fadeIn(0.75));
                    this.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(_showAllItem)]));
                }
            }.bind(this);

            var wrapRewardView = null;
            var _showAllItem = function () {
                var resultInBattle = mc.GameData.resultInBattle;
                var layoutReward = null;
                var arrReward = resultInBattle.getRewardItem();
                var zenItemInfo = null;
                if (resultInBattle.getZen() > 0) {
                    zenItemInfo = mc.ItemStock.createJsonItemZen(resultInBattle.getZen());
                    if (!arrReward) {
                        arrReward = [];
                    }
                    arrReward.push(zenItemInfo);
                }
                if (arrReward) {
                    lblReward.runAction(cc.fadeIn(0.3));
                    var arrBonusReward = resultInBattle.getRewardItemBonus();
                    if (arrBonusReward && arrBonusReward.length > 0) {
                        arrReward = bb.collection.arrayAppendArray(arrReward, arrBonusReward);
                    }
                    arrReward = mc.ItemStock.groupItem(arrReward);
                    layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
                        var itemView = new mc.ItemView(arrReward[arrReward.length - 1 - index]);
                        itemView.getQuantityLabel().y += 15;
                        return itemView;
                    }), 10);
                    wrapRewardView = mc.view_utility.wrapWidget(layoutReward, blackText_0.width - 100, false, {
                        top: 22,
                        bottom: 22
                    });
                    nodeItem.addChild(wrapRewardView);
                }

                if (layoutReward) {
                    bb.utility.arrayTraverse(layoutReward.getChildren(), function (view) {
                        view.scale = 0;
                    });
                }

                this.scheduleOnce(function () {
                    var _showButton = function () {
                        btnNext.runAction(cc.sequence([cc.scaleTo(0.2, 1.0).easing(cc.easeBackOut()), cc.callFunc(function () {
                            btnNext.registerTouchEvent(function () {
                                if (currentPartInBattle) {
                                    mc.GameData.guiState.popScreen();
                                } else {
                                    this.close();
                                }
                            }.bind(this));
                        }.bind(this))]));
                        btnRetry.runAction(cc.sequence([cc.scaleTo(0.2, 1.0).easing(cc.easeBackOut()), cc.callFunc(function () {
                            this.autoRetry(panelWin);
                            btnRetry.registerTouchEvent(function () {
                                self._retryCallback && self._retryCallback();
                            });
                        }.bind(this))]));
                        if (lblArenaCup) {
                            pnlArenaCup.runAction(cc.fadeIn(0.3));
                        }
                        if (lblClanCup) {
                            pnlClanCup.runAction(cc.fadeIn(0.3));
                        }
                    }.bind(this);
                    if (layoutReward) {
                        blackText_0.runAction(cc.fadeIn(0.3));
                        _showItem(layoutReward.getChildren(), function () {
                            _showButton();
                        }.bind(this));
                    } else {
                        _showButton();
                    }
                }, 0.5);

            }.bind(this);

            var currShowItemIndex = 0;
            var _showItem = function (arrView, callback) {
                arrView[currShowItemIndex].runAction(cc.sequence([cc.callFunc(function () {
                    if (wrapRewardView && wrapRewardView.moveViewPort && currShowItemIndex > 3) {
                        wrapRewardView.moveViewPort(0.1, 150, 0);
                    }
                }), cc.scaleTo(0.2, 0.9).easing(cc.easeBackOut()), cc.callFunc(function () {
                    currShowItemIndex++;
                    if (currShowItemIndex >= arrView.length) {
                        currShowItemIndex = 0;
                        _startShowAttachDialog();
                        callback && callback();
                    } else {
                        _showItem(arrView, callback);
                    }
                }.bind(this))]));
            }.bind(this);
        } else {
            bb.sound.playEffect(res.sound_ui_battle_lose);
            panelLose.setVisible(true);
            var panelMap = bb.utility.arrayToMap(panelLose.getChildren(), function (element) {
                return element.getName();
            });
            var glory = panelMap["glory"];
            var nodeButton = panelMap["nodeButton"];
            var nodeText = panelMap["nodeText"];

            var btnRetry = self._btnRetry = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblRetry"));
            var lblReward = panelMap["lblReward"];
            lblReward.setString(mc.dictionary.getGUIString("lblRewards"));
            var blackText_0 = panelMap["blackText_0"];
            lblReward.opacity = 0;
            blackText_0.opacity = 0;
            var nodeItem = panelMap["nodeItem"];
            btnRetry.ignoreContentAdaptWithSize(true);
            btnRetry.loadTexture("button/Blue_Button.png", ccui.Widget.PLIST_TEXTURE);
            var btnGiveUp = self._btnNext = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblBack"));
            btnGiveUp.x = -cc.winSize.width * 0.2;
            btnRetry.x = cc.winSize.width * 0.2;
            btnGiveUp.scale = 0;
            btnRetry.scale = 0;
            nodeButton.addChild(btnRetry);
            nodeButton.addChild(btnGiveUp);


            pnlArenaCup = self._pnlArenaCup = tempPnlArenaCup.clone();
            pnlClanCup = self._pnlClanCup = tempPnlClanCup.clone();
            pnlArenaCup.setCascadeOpacityEnabled(true);
            pnlClanCup.setCascadeOpacityEnabled(true);

            if (this._battleIn === mc.DialogBattleEndView.BATTLE_IN.ARENA && curOpp) {
                pnlArenaCup.setVisible(true);
                lblArenaCup = pnlArenaCup.getChildByName("lbl");

                if (mc.GameData.guildManager.getGuildInfo()) {
                    if (curOpp["guild_info"] && curOpp["guild_info"].guildId != mc.GameData.guildManager.getGuildId()) {
                        pnlClanCup.setVisible(true);
                        lblClanCup = pnlClanCup.getChildByName("lbl");
                    }
                }
            }

            nodeButton.addChild(pnlArenaCup);
            nodeButton.addChild(pnlClanCup);

            pnlArenaCup.opacity = 0;
            pnlClanCup.opacity = 0;

            if (lblArenaCup) {
                var resultInBattle = mc.GameData.resultInBattle;
                btnRetry.y += -btnRetry.height;
                btnGiveUp.y += -btnGiveUp.height;
                var arenaPoint = curOpp.losePoint;
                arenaPoint > 0 && (lblArenaCup.setColor(mc.color.GREEN_NORMAL));
                var tempY = btnRetry.y + btnRetry.height + 40;
                pnlArenaCup.y = tempY;
                if (lblClanCup) {
                    pnlClanCup.x = cc.winSize.width * 0.2;
                    var clanPoint = Math.floor(arenaPoint * 1.5);
                    clanPoint > 0 && (lblClanCup.setColor(mc.color.GREEN_NORMAL));
                    pnlArenaCup.x = -cc.winSize.width * 0.2;
                    pnlClanCup.y = tempY;
                    lblClanCup.setString(clanPoint > 0 ? ("+" + clanPoint) : clanPoint);
                } else {
                    pnlArenaCup.x = 0;
                }
                lblArenaCup.setString(arenaPoint > 0 ? ("+" + arenaPoint) : arenaPoint);
            }

            panelLose.opacity = 0;
            panelLose.runAction(cc.fadeIn(0.4));
            panelLose.scheduleOnce(function () {
                btnGiveUp.runAction(cc.sequence([cc.scaleTo(0.3, 1.0), cc.callFunc(function () {
                    _startShowAttachDialog();
                    btnGiveUp.registerTouchEvent(function () {
                        if (self._giveUpCallback) {
                            self._giveUpCallback();
                        } else {
                            mc.GameData.guiState.popScreen();
                        }
                    });
                }.bind(this))]));
                btnRetry.runAction(cc.sequence([cc.scaleTo(0.3, 1.0), cc.callFunc(function () {
                    btnRetry.registerTouchEvent(function () {
                        self._retryCallback && self._retryCallback();
                    });
                }.bind(this))]));
                if (lblArenaCup) {
                    pnlArenaCup.runAction(cc.fadeIn(0.3));
                }
                if (lblClanCup) {
                    pnlClanCup.runAction(cc.fadeIn(0.3));
                }
            }.bind(this), 0.4);

            var loseBtn = bb.layout.linear(bb.collection.createArray(3, function (index) {
                var clickFunc = function () {
                    mc.GUIFactory.showRefineItemScreen();
                };
                var png = "icon/Forge_equipment.png";
                var text = "Force Equip";
                switch (index) {
                    case 1:
                        clickFunc = function () {
                            mc.view_utility.goTo("summon");
                        };
                        png = "icon/summon_hero.png";
                        text = "Summon Hero";
                        break;
                    case 2:
                        clickFunc = function () {
                            mc.GameData.guiState.setStackLayerIdForMainScreen([
                                mc.MainScreen.LAYER_HOME,
                                mc.MainScreen.LAYER_HERO_STOCK
                            ]);
                            new mc.MainScreen().show();
                        };
                        png = "icon/Upgrade_hero.png";
                        text = "Upgrade Hero";
                        break;
                }
                var img = new ccui.ImageView(png, ccui.Widget.PLIST_TEXTURE);
                var lbl = img.setString(mc.dictionary.getGUIString(text), res.font_cam_stroke_32_export_fnt);
                lbl.x = img.width / 2;
                lbl.y = 0;
                lbl.setScale(1);
                img.setScale(0.75);
                img.registerTouchEvent(clickFunc);
                return img;
            }), 60, bb.layout.LINEAR_HORIZONTAL);

            var lblMsg = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblLoseTips"), res.font_cam_stroke_32_export_fnt, mc.const.FONT_SIZE_24);
            loseBtn.addChild(lblMsg);
            lblMsg.x = loseBtn.width / 2;
            lblMsg.y = loseBtn.height + 20;

            nodeText.addChild(loseBtn);

            lblReward.setVisible(false);
            nodeItem.setVisible(false);
            if (mc.GameData.resultInBattle.getRewardItem() && mc.GameData.resultInBattle.getRewardItem().length > 0) {
                lblReward.setVisible(true);
                nodeItem.setVisible(true);
            }
            var wrapRewardView = null;
            var _showAllItem = function () {
                var resultInBattle = mc.GameData.resultInBattle;
                lblReward.runAction(cc.fadeIn(0.3));
                var layoutReward = null;
                var arrReward = resultInBattle.getRewardItem();
                var zenItemInfo = null;
                if (resultInBattle.getZen() > 0) {
                    zenItemInfo = mc.ItemStock.createJsonItemZen(resultInBattle.getZen());
                    if (!arrReward) {
                        arrReward = [];
                    }
                    arrReward.push(zenItemInfo);
                }
                if (arrReward) {
                    var arrBonusReward = resultInBattle.getRewardItemBonus();
                    if (arrBonusReward && arrBonusReward.length > 0) {
                        arrReward = bb.collection.arrayAppendArray(arrReward, arrBonusReward);
                    }
                    arrReward = mc.ItemStock.groupItem(arrReward);
                    layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
                        var itemView = new mc.ItemView(arrReward[arrReward.length - 1 - index]);
                        itemView.getQuantityLabel().y += 15;
                        return itemView;
                    }), 10);
                    wrapRewardView = mc.view_utility.wrapWidget(layoutReward, blackText_0.width - 100, false, {
                        top: 22,
                        bottom: 22
                    });
                    nodeItem.addChild(wrapRewardView);
                }

                if (layoutReward) {
                    bb.utility.arrayTraverse(layoutReward.getChildren(), function (view) {
                        view.scale = 0;
                    });
                }

                this.scheduleOnce(function () {
                    if (layoutReward) {
                        blackText_0.runAction(cc.fadeIn(0.3));
                        _showItem(layoutReward.getChildren());
                    }
                }, 0.5);

            }.bind(this);
            var currShowItemIndex = 0;
            var _showItem = function (arrView, callback) {
                if( arrView && arrView[currShowItemIndex] ){
                    arrView[currShowItemIndex].runAction(cc.sequence([cc.callFunc(function () {
                        if (wrapRewardView && wrapRewardView.moveViewPort && currShowItemIndex > 3) {
                            wrapRewardView.moveViewPort(0.1, 150, 0);
                        }
                    }), cc.scaleTo(0.2, 0.9).easing(cc.easeBackOut()), cc.callFunc(function () {
                        currShowItemIndex++;
                        if (currShowItemIndex >= arrView.length) {
                            currShowItemIndex = 0;
                            _startShowAttachDialog();
                            callback && callback();
                        } else {
                            _showItem(arrView, callback);
                        }
                    }.bind(this))]));
                }
            }.bind(this);
            glory.runAction(cc.rotateBy(0.01, 1).repeatForever());
            this.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(_showAllItem)]));
        }

        if (!currentPartInBattle || !currentPartInBattle.canRetry()) {
            self._btnRetry && self._btnRetry.setVisible(false);
            if (self._btnNext) {
                self._btnNext.x = 0;
                self._btnNext.setVisible(true);
            }
        }

        this.setAutoClose(false);
        this.scheduleUpdate();
    },

    disableRetryButton: function () {
        this._btnRetry.setVisible(false);
        this._btnNext.x=0;
    },

    toggleAutoRetry: function () {
        this._autoRetry = true;
        return this;
    },

    update: function (dt) {
        if (this._autoRetry && this._autoRetryTime > 0) {
            var stageIndex = mc.GameData.guiState.getSelectStageCampaignIndex();
            var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);
            var value = mc.CampaignManger.getStaminaCostByStageDict(stageDict);
            if (!mc.ItemStock.isNotEnoughCost(mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_STAMINA, value))) {
                this._autoRetryTime -= dt;
                if (this._lblAutoRetry) {
                    this._lblAutoRetry.setString(cc.formatStr(mc.dictionary.getGUIString("Auto retry in( %s ) "), Math.ceil(this._autoRetryTime)));
                }
                if (this._autoRetryTime <= 0) {
                    this._retryCallback && this._retryCallback();
                }
            } else {
                this._lblAutoRetry.setString(cc.formatStr(mc.dictionary.getGUIString("Not Enough Stamina ( %s ) "), Math.floor(mc.GameData.playerInfo.getStamina()) + "/" + value));
            }
        }
    },

    autoRetry: function (widget) {
        var checkBox = widget.getChildByName("checkbox");
        if (checkBox && this._retryCallback && this._autoRetry) {
            checkBox.setOpacity(0);
            checkBox.runAction(cc.fadeIn(0.5));
            checkBox.setVisible(true);
            var check = checkBox.getChildByName("check");
            check.setVisible(mc.storage.readAutoRetryConfig());
            var lblAutoRetry = this._lblAutoRetry = checkBox.getChildByName("lblAutoRetry");
            lblAutoRetry.setString("");
            if (mc.storage.autoRetryConfig) {
                this._autoRetryTime = 5;
            } else {
                this._autoRetryTime = 0;
                this._lblAutoRetry.setString(cc.formatStr(mc.dictionary.getGUIString("Auto retry in( %s ) "), mc.dictionary.getGUIString("Off")));
            }
            checkBox.registerTouchEvent(function () {
                mc.storage.autoRetryConfig = !mc.storage.autoRetryConfig;
                mc.storage.saveAutoRetryConfig();
                check.setVisible(mc.storage.readAutoRetryConfig());
                if (mc.storage.autoRetryConfig) {
                    this._autoRetryTime = 5;
                } else {
                    this._autoRetryTime = 0;
                    this._lblAutoRetry.setString(cc.formatStr(mc.dictionary.getGUIString("Auto retry in( %s ) "), mc.dictionary.getGUIString("Off")));
                }
            }.bind(this));
        }
    },

    onClose: function () {
        this._super();
        mc.GameData.resultInBattle.clearData();
    },

    setGiveUpCallback: function (callback) {
        this._giveUpCallback = callback;
        return this;
    },

    setRetryCallback: function (callback) {
        this._retryCallback = callback;
        return this;
    },

    overrideShowAnimation: function () {
        return 0.01;
    },

    overrideCloseAnimation: function () {
        return 0.01;
    }

});
mc.DialogBattleEndView.BATTLE_IN = {CAMPAIGN: 1, ARENA: 2};

