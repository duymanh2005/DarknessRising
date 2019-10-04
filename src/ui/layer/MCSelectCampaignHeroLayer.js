/**
 * Created by long.nguyen on 5/28/2018.
 */
mc.SelectCampaignHeroLayer = mc.MainBaseLayer.extend({
    _mapHeroAvtByHeroId: null,
    _mapHeroAvtBySlotId: null,
    _mapBtnChangeBySlotId: null,

    ctor: function () {
        this._super();
        this._isHasBoss = false;

        var chapterIndex = mc.GameData.guiState.getSelectChapterIndex();
        var stageIndex = mc.GameData.guiState.getSelectStageCampaignIndex();
        var stageInfo = mc.GameData.campaignManager.getStageInfoByStageIndex(stageIndex);
        var stageDict = mc.dictionary.getStageDictByIndex(stageIndex);

        var root = this.parseCCStudio(res.layer_select_campaign_hero);
        var contentView = root.getChildByName("content");
        var topView = this._topView = root.getChildByName("top");
        var contentMap = bb.utility.arrayToMap(contentView.getChildren(), function (child) {
            return child.getName();
        });

        var lblTeam = contentMap["lblTeam"];
        var imgBoss = contentMap["imgBoss"];
        imgBoss.setOpacity(0);
        if (!contentView.getChildByName("iconBoss")) {
            var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_timing_boss_json, res.spine_ui_timing_boss_atlas, 1.0);
            contentView.addChild(iconAnimate);
            iconAnimate.setLocalZOrder(20);
            iconAnimate.setPosition(imgBoss.x, imgBoss.y);
            iconAnimate.setAnimation(0, "idle", true);
            iconAnimate.setVisible(false);
            iconAnimate.setName("iconBoss");
        }
        this._checkBoss(stageIndex, function (result) {
            var bossAnimate = contentView.getChildByName("iconBoss");
            if (result && result["boss_appear"]) {
                this._isHasBoss = true;
                bossAnimate && bossAnimate.setVisible(true);
                imgBoss.registerTouchEvent(function () {
                    mc.GameData.stageBossSystem.setStageIndex(stageIndex);
                    mc.protocol.joinStageBoss(stageIndex, function (result) {
                        if (result.bossDeath) {
                            var dialog = bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("Boss was killed"));
                            dialog.show();
                        }
                        else {
                            mc.GUIFactory.showStageBossBattleScreen();
                        }
                    }.bind(this));
                }.bind(this));
            } else {
                bossAnimate && bossAnimate.setVisible(false);
                imgBoss.registerTouchEvent(function () {

                });
            }
        }.bind(this));

        var imgTitle = contentMap["imgTitle"];
        var lblReward = contentMap["lblReward"];
        var nodeHero = contentMap["nodeHero"];
        var nodeReward = contentMap["nodeReward"];
        var nodeBtnFriend = contentMap["nodeBtnFriend"];
        var nodeStamina = contentMap["nodeStamina"];
        var nodeRaid = contentMap["nodeRaid"];
        var btnRaid = contentMap["btnRaid"];
        var nodeRaid5 = contentMap["nodeRaid_multi"];
        var btnRaid5 = contentMap["btnRaid_multi"];
        var btnBattle = this._btnBattle = contentMap["btnBattle"];

        this._initBattleAutoTrain(topView, stageDict);

        imgTitle._maxLblWidth = imgTitle.width - 140;
        var lblView = imgTitle.setString(mc.CampaignManger.getStageNameByStageIndex(stageIndex), res.font_UTMBienvenue_none_32_export_fnt);
        lblView.setColor(mc.color.BROWN_SOFT);

        var spineWorldMap = this._spineWorldMap = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_world_map_json, res.spine_ui_world_map_atlas, 1.0);
        spineWorldMap.setAnimation(0, "animation", true);
        spineWorldMap.setLocalZOrder(-1);
        spineWorldMap.x = -300;
        spineWorldMap.y = -500;
        root.addChild(spineWorldMap);

        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.TeamFormationManager.TEAM_CAMPAIGN;
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var heroStock = mc.GameData.heroStock;
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_CAMPAIGN);
        var leaderFormationIndex = teamFormationManager.getLeaderFormationByIndex(teamId, teamIndex);
        mc.view_utility.layoutTeamFormation({
            arrTeamFormation: teamFormationManager.getTeamFormationByIndex(teamId, teamIndex),
            leaderIndex: leaderFormationIndex,
            mapHeroInfo: heroStock.getHeroMap()
        }, {
            nodeHero: nodeHero
        });

        this._mapBtnChangeBySlotId = {};
        this._mapHeroAvtBySlotId = {};
        this._mapHeroAvtByHeroId = {};
        var arrButton = [];
        var layoutHeroContainer = this._layoutHeroContainer = nodeHero.getChildren()[0];
        var childs = layoutHeroContainer.getChildren();
        for (var i = 0; i < childs.length; i++) {
            var slotId = "slot_" + i;
            var heroInfo = childs[i].getUserData();
            var btn = new ccui.ImageView("button/btn_FriendChange.png", ccui.Widget.PLIST_TEXTURE);
            var lblFriend = btn.setString(mc.dictionary.getGUIString("lblFriend"), res.font_UTMBienvenue_stroke_32_export_fnt);
            lblFriend.x = btn.width * 0.6;
            lblFriend.setScale(0.6);
            btn.setUserData(slotId);
            btn.setVisible(leaderFormationIndex !== i);
            this._registerPickFriend(btn, stageIndex);
            if (heroInfo) {
                this._mapHeroAvtByHeroId[mc.HeroStock.getHeroId(heroInfo)] = childs[i];
                mc.view_utility.setNotifyIconForWidget(btn, false, 0.96, 0.96);
            }
            else {
                mc.view_utility.setNotifyIconForWidget(btn, true, 0.96, 0.96);
            }
            arrButton.push(btn);
            this._mapBtnChangeBySlotId[slotId] = btn;
            this._mapHeroAvtBySlotId[slotId] = childs[i];
        }

        var layoutBtnFriend = bb.layout.linear(arrButton, 21);
        nodeBtnFriend.addChild(layoutBtnFriend);

        nodeHero.scale = 0.95;
        nodeBtnFriend.scale = 0.95;

        var arrReward = mc.CampaignManger.getArrayRewardByStageIndex(stageIndex);
        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
            var itemView = new mc.ItemView(arrReward[index]);
            itemView.scale = 0.65;
            itemView.registerViewItemInfo();
            itemView.setSwallowTouches(false);

            return itemView;
        }), 15);
        var wrapWidget = mc.view_utility.wrapWidget(layoutReward, 598, false, {top: 12, bottom: 12});
        nodeReward.addChild(wrapWidget);

        lblTeam.setColor(mc.color.BROWN_SOFT);
        lblReward.setColor(mc.color.BROWN_SOFT);

        lblTeam.setString(mc.dictionary.getGUIString("lblBattleTeam"));
        lblReward.setString(mc.dictionary.getGUIString("lblRewards"));

        var numRequiredStamina = mc.CampaignManger.getStaminaCostByStageDict(stageDict);
        nodeStamina.addChild(mc.view_utility.createAssetView(mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_STAMINA, numRequiredStamina), undefined, 1));
        //lblStamina.setDecoratorLabel(""+mc.CampaignManger.getStaminaCostByStageDict(stageDict),mc.color.GREEN_NORMAL);
        var starNo = mc.CampaignManger.getStarNo(stageInfo);
        btnRaid.setString(mc.dictionary.getGUIString("lblRaid"));
        btnRaid5.setString(mc.dictionary.getGUIString("lblRaid5"));
        var lblBattle = btnBattle.setString(mc.dictionary.getGUIString("lblBattle"));
        lblBattle.scale = 1.15;
        lblBattle.x = btnBattle.width * 0.6;
        lblBattle.y = btnBattle.height * 0.5;

        var _updateRaidGUI = function () {
            var raidTicketInfo = mc.GameData.itemStock.getOverlapItemByIndex(mc.const.ITEM_INDEX_RAID_TICKET);
            var numTicketInStock = raidTicketInfo ? mc.ItemStock.getItemQuantity(raidTicketInfo) : 0;
            nodeRaid.removeAllChildren();
            nodeRaid5.removeAllChildren();
            btnRaid.setGrayForAll(starNo < 3);
            btnRaid5.setGrayForAll(starNo < 3);
            if (starNo < 3) {
                var lblRaid = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblRequire3Star"), res.font_UTMBienvenue_stroke_32_export_fnt);
                lblRaid.setColor(mc.color.RED);
                nodeRaid.addChild(lblRaid);
            }
            else {
                var layoutRaid = mc.view_utility.createAssetView(mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_RAID_TICKET, numTicketInStock), undefined, 1);
                var lbl = layoutRaid.getChildByName("lbl");
                lbl.setColor(numTicketInStock >= 1 ? mc.color.GREEN_NORMAL : mc.color.RED);
                lbl.setDecoratorLabel("/1", mc.color.WHITE_NORMAL);
                nodeRaid.addChild(layoutRaid);
                nodeRaid.setVisible(starNo >= 3);

                var layoutRaid5 = mc.view_utility.createAssetView(mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_RAID_TICKET, numTicketInStock), undefined, 1);
                var lbl5 = layoutRaid5.getChildByName("lbl");
                lbl5.setColor(numTicketInStock >= 5 ? mc.color.GREEN_NORMAL : mc.color.RED);
                lbl5.setDecoratorLabel("/5", mc.color.WHITE_NORMAL);
                nodeRaid5.addChild(layoutRaid5);
                nodeRaid5.setVisible(starNo >= 3);
            }
        };

        var self = this;
        var raidLoadingId = null;
        btnRaid.registerTouchEvent(function () {
            var isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_RAID_TICKET, 1);
            if (!isShow) {
                isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_STAMINA, Math.ceil(numRequiredStamina * 0.5));
                if (!isShow) {
                    raidLoadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.raidStage(stageIndex, function (result) {
                        mc.view_utility.hideLoadingDialogById(raidLoadingId);
                        self._showHeroGetExpAnimation();
                    });
                }
            }
        }.bind(this));
        btnRaid5.registerTouchEvent(function () {
            // mc.view_utility.showComingSoon();
            var isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_RAID_TICKET, 5);
            if (!isShow) {
                isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_STAMINA, Math.ceil(numRequiredStamina * 5 * 0.5));
                if (!isShow) {
                    raidLoadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.raidStage5(stageIndex, function (result) {
                        mc.view_utility.hideLoadingDialogById(raidLoadingId);
                        self._showHeroGetExpAnimation();
                    });
                }
            }
        }.bind(this));
        btnBattle._soundId = res.sound_ui_button_start_battle;
        var loadingId = null;
        btnBattle.registerTouchEvent(function () {

            var fightNormalMode = function()
            {
                var isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_STAMINA, numRequiredStamina);
                if (!isShow) {
                    bb.sound.stopMusic();
                    this._setPausingCombat(true);
                    var loadingId = mc.view_utility.showLoadingDialog(mc.const.REQUEST_TIME_OUT, function () {
                        this._setPausingCombat(false);
                    }.bind(this));
                    var heroFriendId = mc.GameData.guiState.getCurrentSuggestFriendHeroId();
                    var replaceSlotId = mc.GameData.guiState.getCurrentSlotReplaceFriendHero();
                    replaceSlotId && (replaceSlotId = replaceSlotId.split('_')[1]);
                    mc.protocol.comeToStage(stageIndex, heroFriendId, replaceSlotId, function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            mc.GameData.playerInfo.countPlayingCampaignBattleTimeInLaugh();
                            mc.GameData.guiState.setBackTrackLayerForMainScreen([
                                mc.MainScreen.LAYER_HOME,
                                mc.MainScreen.LAYER_WORD_MAP,
                                (chapterIndex != mc.CampaignManger.SPECIAL_CHAP_INDEX) ? mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST : mc.MainScreen.LAYER_STAGE_LIST_WORLD_CHALLENGE
                            ]);
                            mc.GameData.guiState.setCurrentSuggestFriendHeroId(null);
                            mc.GameData.guiState.setCurrentSlotReplaceFriendHero(null);
                            mc.GUIFactory.showCampaignBattleScreen();
                        }
                        else {
                            this._setPausingCombat(false);
                        }
                    }.bind(this));
                }
            }.bind(this);

            if (this._isHasBoss) {
                var dialog = new mc.DefaultDialog()
                    .setTitle(mc.dictionary.getGUIString("lblWarning"))
                    .setMessage(mc.dictionary.getGUIString("lblDoYouWantFightStageBoss"))
                    .enableYesNoButton(function () {
                        dialog.close();
                        mc.GameData.stageBossSystem.setStageIndex(stageIndex);
                        mc.protocol.joinStageBoss(stageIndex, function (result) {
                            if (result.bossDeath) {
                                var dialog = bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("Boss was killed"));
                                dialog.show();
                            }
                            else {
                                mc.GUIFactory.showStageBossBattleScreen();
                            }
                        }.bind(this));
                    }.bind(this), function(){
                        dialog.close();
                        fightNormalMode();
                    }.bind(this)).disableExitButton();
                dialog.show();

            }
            else {
                fightNormalMode();
            }
        }.bind(this));

        _updateRaidGUI();
        this._updateGUIWithCurrentSuggestHero();

        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = btnBattle.width * 0.5;
        particle.y = btnBattle.height * 0.5;
        btnBattle.addChild(particle);

        this.traceDataChange(mc.GameData.resultInBattle, function (data) {
            mc.view_utility.hideLoadingDialogById(raidLoadingId);
            if (data) {
                _updateRaidGUI();
                this._showHeroGetExpAnimation(mc.GameData.resultInBattle.getIncr_exp());
                new mc.DialogBattleEndView(mc.DialogBattleEndView.BATTLE_IN.CAMPAIGN).show();
            }
        }.bind(this));
    },

    _checkBoss: function (stageIndex, cb) {
        mc.protocol.checkStageBoss(stageIndex, function (result) {
            cb && cb(result);
        }.bind(this))
    },

    _setPausingCombat: function (isPause) {
        if (isPause) {
            this._nodeBattleField.pause();
            cc.sys.isNative && cc.audioEngine.pauseAllEffects();
        }
        else {
            this._nodeBattleField.resume();
            cc.sys.isNative && cc.audioEngine.resumeAllEffects();
        }
        var childs = this._nodeBattleField.getChildren();
        for (var i = 0; i < childs.length; i++) {
            if (isPause) {
                childs[i].pause();
            }
            else {
                childs[i].resume();
            }
        }
    },

    _initBattleAutoTrain: function (topView, stageDict) {
        // auto battle train
        var topMap = bb.utility.arrayToMap(topView.getChildren(), function (child) {
            return child.getName();
        });
        var brkTop = topMap["brk"];
        var nodeBrkBattle = topMap["nodeBrkBattle"];
        var nodeBattleField = this._nodeBattleField = topMap["nodeBattleField"];
        var lblExp = this._lblTotalExp = topMap["lblExp"];
        var lblGold = this._lblTotalZen = topMap["lblGold"];
        var btnGet = this._btnCollect = topMap["btnGet"];
        var btnLoot = this._btnLoot = topMap["btnLoot"];
        var lblMiningInfo = topMap["lblMiningInfo"];

        var urlBrk = mc.GameData.campaignManager.getPreLoadBrkURL();
        var brkBattleField = new cc.Sprite(urlBrk);
        brkBattleField.setLocalZOrder(-1);
        brkBattleField.scale = 0.92;
        brkBattleField.y = -brkBattleField.height * 0.15;
        nodeBrkBattle.addChild(brkBattleField);

        var currCreatureDoingIndex = 1;
        var arrCreatureView = [];
        var creatureScale = 0.7;
        var arrMonsterView = [];

        var currMonsterHp = null;
        var _preLoadSound = function (creatureIndex) {
            var allSoundURL = [];
            var asset = mc.dictionary.getCreatureAssetByIndex(creatureIndex);
            if (asset) {
                asset = asset.getData();
                var arrSound = asset["attackSound"];
                if (arrSound) {
                    allSoundURL = bb.collection.arrayAppendArray(allSoundURL, arrSound);
                }
                if (asset["hurtSound"]) {
                    allSoundURL.push(asset["hurtSound"]);
                }
                var mapSoundURL = {};
                for (var u = 0; u < allSoundURL.length; u++) {
                    var url = allSoundURL[u];
                    if (!mapSoundURL[url]) {
                        mapSoundURL[url] = true;
                        bb.sound.preloadEffect("res/sound/effect/" + url + ".mp3");
                    }
                }
            }
        };
        var _createMonster = function () {
            var arrPreLoadMonsterIndex = mc.GameData.campaignManager.getArrPreLoadMonster(stageDict);
            if (arrPreLoadMonsterIndex) {
                var monsterIndex = bb.utility.randomElement(arrPreLoadMonsterIndex);
                var monsterView = mc.BattleViewFactory.createCreatureGUIByIndex(monsterIndex);
                monsterView.scale = creatureScale;
                monsterView.setUserData(mc.dictionary.getCreatureDictByIndex(monsterIndex));
                monsterView.scaleX *= -1;
                monsterView.x = -200;
                monsterView.y = -50;
                arrMonsterView.push(monsterView);
                arrCreatureView.push(monsterView);
                nodeBattleField.addChild(monsterView);
                currMonsterHp = monsterView.getUserData().hp;
                _preLoadSound(monsterIndex);
                return monsterView;
            }
            return null;
        };

        lblMiningInfo.setString(mc.dictionary.getGUIString("lblAutoTrain"));
        lblMiningInfo.setColor(mc.color.YELLOW_ELEMENT);

        var monsterView = _createMonster();
        var arrHeroId = mc.GameData.teamFormationManager.getTeamFormationByIndex(mc.TeamFormationManager.TEAM_CAMPAIGN, 0);
        var arrHeroPos = [cc.p(120, -50), cc.p(200, 15), cc.p(280, -75)];
        var arrHeroZ = [5, 4, 6];
        var arrHeroView = [];
        var ip = 0;
        for (var i = 0; i < arrHeroId.length && ip < arrHeroPos.length; i++) {
            if (arrHeroId[i] > 0) {
                var heroInfo = mc.GameData.heroStock.getHeroById(arrHeroId[i]);
                var heroIndex = mc.HeroStock.getHeroIndex(heroInfo);
                var heroView = mc.BattleViewFactory.createCreatureGUIByIndex(heroIndex);
                heroView._arrTargetView = arrMonsterView;
                heroView.setUserData(heroInfo);
                heroView.scale = creatureScale;
                heroView.x = arrHeroPos[ip].x;
                heroView.y = arrHeroPos[ip].y;
                heroView.setLocalZOrder(arrHeroZ[ip]);
                ip++;
                nodeBattleField.addChild(heroView);
                arrHeroView.push(heroView);
                arrCreatureView.push(heroView);
                _preLoadSound(heroIndex);
            }
        }
        monsterView._arrTargetView = arrHeroView;

        var startX = 0;
        var startY = 0;
        var isRenew = false;
        var _doAttackFor = function (spineView) {
            var isRange = mc.HeroStock.isRangerHero(spineView.getUserData());
            if (isRange) {
                spineView._currTargetView = bb.utility.randomElement(spineView._arrTargetView);
                spineView.attack();
            }
            else {
                startX = spineView.x;
                startY = spineView.y;
                var targetView = spineView._currTargetView = bb.utility.randomElement(spineView._arrTargetView);
                if (targetView && spineView) {
                    spineView.runAction(cc.sequence([cc.moveTo(0.15, cc.p(targetView.x - targetView.scaleX * 220, targetView.y - 5)), cc.callFunc(function () {
                        spineView.attack();
                    })]));
                }
            }
        };
        var _nextTurn = function () {
            if (!isRenew) {
                if (currMonsterHp <= 0) {
                    isRenew = true;
                    nodeBattleField.runAction(cc.sequence([cc.delayTime(1.5), cc.callFunc(function () {
                        cc.arrayRemoveObject(arrCreatureView, monsterView);
                        cc.arrayRemoveObject(arrMonsterView, monsterView);
                        monsterView.removeFromParent();
                        monsterView = _createMonster();
                        if (arrHeroView && monsterView) {
                            monsterView._arrTargetView = arrHeroView;
                            for (var i = 0; i < arrHeroView.length; i++) {
                                arrHeroView[i]._arrTargetView = arrMonsterView;
                            }
                            monsterView.setCustomCallbackMapSpineEvent(mapCallbackSpineEvent);
                            monsterView.appear();
                        }
                    }), cc.delayTime(1.0), cc.callFunc(function () {
                        isRenew = false;
                        _doAttackFor(arrCreatureView[currCreatureDoingIndex]);
                    })]));
                }
                else {
                    currCreatureDoingIndex++;
                    if (currCreatureDoingIndex >= arrCreatureView.length) {
                        currCreatureDoingIndex = 0;
                    }
                    _doAttackFor(arrCreatureView[currCreatureDoingIndex]);
                }
            }
        };

        var mapCallbackSpineEvent = {
            attackHit: function (assetData, spineView, priority) {
                if (spineView._currTargetView === monsterView) {
                    var heroInfo = spineView.getUserData();
                    currMonsterHp -= heroInfo.atk * 0.15;
                    if (currMonsterHp <= 0) {
                        currMonsterHp = 0;
                    }
                }
                if (currMonsterHp <= 0 && spineView._currTargetView === monsterView) {
                    spineView._currTargetView && spineView._currTargetView.dead(true);
                }
                else {
                    spineView._currTargetView && spineView._currTargetView.hurt();
                }
            },
            attackSound: function (assetData, spineView, index) {
                var arrName = assetData["attackSound"];
                if (arrName && arrName.length > index) {
                    spineView.runAction(cc.sound("res/sound/effect/" + arrName[index] + ".mp3"));
                }
            },
            attackHitEffect: function (assetData, spineView, index) {
                var targetView = spineView._currTargetView;
                if (targetView) {
                    var posEff = targetView.getStatusPosition("center");
                    var hitEffect = sp.SkeletonAnimation.createWithJsonFile(res.spine_default_hit_effect_json, res.spine_default_hit_effect_atlas, mc.const.SPINE_SCALE);
                    hitEffect.scaleX *= targetView.scaleX;
                    hitEffect.x = targetView.x + posEff.x;
                    hitEffect.y = targetView.y + posEff.y;
                    hitEffect._isHitEff = true;
                    hitEffect.setAnimation(0, "hitImpactRed2", false);
                    hitEffect.setCompleteListener(function (trackEntry) {
                        if (trackEntry.trackIndex === 0) {
                            hitEffect.runAction(cc.removeSelf());
                        }
                    }.bind(this));
                    nodeBattleField.addChild(hitEffect);
                }
            },
            back: function (assetData, spineView) {
                var isRange = mc.HeroStock.isRangerHero(spineView.getUserData());
                if (isRange) {
                    _nextTurn();
                }
                else {
                    spineView.runAction(cc.sequence([cc.moveTo(0.15, cc.p(startX, startY)), cc.callFunc(function () {
                        _nextTurn();
                    })]));
                }
            }
        }
        for (var i = 0; i < arrCreatureView.length; i++) {
            arrCreatureView[i].setCustomCallbackMapSpineEvent(mapCallbackSpineEvent);
        }
        _nextTurn();
        nodeBattleField.update = function (dt) {
            var childs = nodeBattleField.getChildren();
            var arrChildren = cc.copyArray(childs);
            arrChildren.sort(function (child1, child2) {
                return child2.y - child1.y;
            });
            for (var i = 0; i < arrChildren.length; i++) {
                arrChildren[i].setLocalZOrder(i);
                if (arrChildren[i]._isHitEff) {
                    arrChildren[i].setLocalZOrder(arrChildren.length);
                }
            }
        }.bind(nodeBattleField);
        nodeBattleField.scheduleUpdate();
        // end

        var self = this;
        var _updateMining = function () {
            this._miningZenAndExp();
            this._miningItem();
        }.bind(this);

        var lbl = btnGet.setString(mc.dictionary.getGUIString("lblGet"));
        lbl.scale = 1.05;
        lbl = btnLoot.setString(mc.dictionary.getGUIString("lblLoot"));
        lbl.scale = 0.7;
        lbl.x = btnLoot.width * 0.625;
        lbl.y -= 3;
        var onBtnGet = function () {
            var mineSystem = mc.GameData.mineSystem;
            var productionZen = mineSystem.getMineZen().getAllProductionValue();
            var productionExp = mineSystem.getMineEXP().getAllProductionValue();
            var arrMiningItemInfo = mineSystem.getMineItem().getAllProductionValue();
            arrMiningItemInfo.push(mc.ItemStock.createJsonItemInfo(11905, productionZen)); // hash code for protect code from 'cheat engine'

            var arrHeroIds = mineSystem.getArrayMiningHeroId();
            var count = arrHeroIds.length;
            (count <= 0) && (count = 1);
            var expPerHero = Math.floor(productionExp / count);
            var arrMiningHeroInfo = [];
            for (var i = 0; i < arrHeroIds.length; i++) {
                arrMiningHeroInfo.push({
                    id: arrHeroIds[i],
                    exp: expPerHero
                });
            }
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.collectMine(arrMiningItemInfo, arrMiningHeroInfo, function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result && result["heroExpArr"]) {
                    var arr = result["heroExpArr"];
                    this._showHeroGetExpAnimation(arr);
                    _updateMining();
                }
            }.bind(this));
            _updateMining();
        }.bind(this);
        btnLoot.registerTouchEvent(function () {
            var mineSystem = mc.GameData.mineSystem;
            new mc.LootItemListDialog(mineSystem.getMineItem().getAllProductionValue(), onBtnGet).show()
        }.bind(this));
        btnGet.registerTouchEvent(onBtnGet);

        _updateMining();
        this._topView.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function () {
            this._miningZenAndExp(true);
        }.bind(this))]).repeatForever());
        this._topView.runAction(cc.sequence([cc.delayTime(10.0), cc.callFunc(function () {
            this._miningItem(true);
        }.bind(this))]).repeatForever());
    },

    _showHeroGetExpAnimation: function (arrHeroExp) {
        for (var h = 0; h < arrHeroExp.length; h++) {
            var info = arrHeroExp[h];
            var heroId = info["heroId"];
            var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
            var exp = info["exp"];
            var avtView = this._mapHeroAvtByHeroId[heroId];
            mc.GameData.heroInfoChangerCollection.getChanger(heroId).performChanging({
                "level": function (oldLevel, newLevel, changer) {
                    avtView.setHeroInfo(mc.GameData.heroStock.getHeroById(heroId));
                    mc.view_utility.showLevelUpText(avtView, 2.0);
                },
                "exp": function (oldExp, newExp, changer) {
                    var lbl = null;
                    if (mc.HeroStock.isHeroMaxLevel(heroInfo)) {
                        lbl = bb.framework.getGUIFactory().createText("Max");
                        lbl.setColor(mc.color.GREEN_NORMAL);
                        lbl.x = avtView.x;
                        lbl.y = avtView.y + 30;
                    }
                    else {
                        lbl = bb.framework.getGUIFactory().createText("+" + exp + " Exp");
                        lbl.setColor(mc.color.GREEN_NORMAL);
                        lbl.x = avtView.x;
                        lbl.y = avtView.y;
                        lbl.runAction(cc.sequence([cc.moveBy(0.3, 0, 30), cc.delayTime(1.5), cc.fadeOut(1.0), cc.removeSelf()]));
                    }
                    avtView.getParent().addChild(lbl);
                }
            });
        }
    },

    _miningZenAndExp: function (animate) {
        if (mc.GameData.mineSystem.isMining()) {
            var mineSystem = mc.GameData.mineSystem;
            var productionZen = mineSystem.getMineZen().getAllProductionValue();
            var maxMiningZen = mineSystem.getMineZen().getTotalMaxProductionValue();
            var productionExp = mineSystem.getMineEXP().getAllProductionValue();
            var maxMiningExp = mineSystem.getMineEXP().getTotalMaxProductionValue();

            maxMiningZen <= 0 && (maxMiningZen = 1);
            maxMiningExp <= 0 && (maxMiningExp = 1);

            this._lblTotalZen.setString(bb.utility.formatNumber(productionZen));
            this._lblTotalExp.setString(bb.utility.formatNumber(productionExp));

            if (animate) {
                var oldVal = this._lblTotalZen.getUserData() || 0;
                var delta = productionZen - oldVal;
                if (delta > 0) {
                    var lblDelta = bb.framework.getGUIFactory().createText("+" + delta);
                    lblDelta.setColor(mc.color.GREEN_NORMAL);
                    lblDelta.x = this._lblTotalZen.x;
                    lblDelta.y = this._lblTotalZen.y;
                    lblDelta.runAction(cc.sequence([cc.moveBy(0.25, 0, 50), cc.fadeOut(1.5), cc.removeSelf()]));
                    this._topView.addChild(lblDelta);
                }

                var oldVal = this._lblTotalExp.getUserData() || 0;
                var delta = productionExp - oldVal;
                if (delta > 0) {
                    var lblDelta = bb.framework.getGUIFactory().createText("+" + delta);
                    lblDelta.setColor(mc.color.GREEN_NORMAL);
                    lblDelta.x = this._lblTotalExp.x;
                    lblDelta.y = this._lblTotalExp.y;
                    lblDelta.runAction(cc.sequence([cc.moveBy(0.25, 0, 50), cc.fadeOut(1.5), cc.removeSelf()]));
                    this._topView.addChild(lblDelta);
                }
            }

            this._lblTotalExp.setUserData(productionExp);
            this._lblTotalZen.setUserData(productionZen);

            this._collectZenAndExpEnable = (productionExp > 0 || productionExp > 0);
            this._btnCollect.setVisible(this._collectZenAndExpEnable || this._collectItemEnable);
        }
        else {
            this._lblTotalZen.setString("0");
            this._lblTotalExp.setString("0");
        }
    },

    _miningItem: function (animate) {
        var mineSystem = mc.GameData.mineSystem;
        if (mineSystem.isMining()) {
            var arrMiningItemInfo = mineSystem.getMineItem().getAllProductionValue();
            if (arrMiningItemInfo) {
                var canCollect = false;
                for (var i = 0; i < arrMiningItemInfo.length; i++) {
                    var itemInfo = arrMiningItemInfo[i];
                    var productionVal = mc.ItemStock.getItemQuantity(itemInfo);
                    if (productionVal > 0) {
                        canCollect = true;
                    }
                }
                this._collectItemEnable = canCollect;
                this._btnCollect.setVisible(this._collectZenAndExpEnable || this._collectItemEnable);
                this._btnLoot.setVisible(this._collectItemEnable);
                mc.view_utility.setNotifyIconForWidget(this._btnLoot, this._collectItemEnable, 0.8)
            }
        }
    },

    _registerPickFriend: function (btn, stageIndex) {
        btn.registerTouchEvent(function (btn) {
            var slotId = btn.getUserData();
            mc.GameData.guiState.setCurrentSlotReplaceFriendHero(slotId);
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SELECT_CAMPAIGN_FRIEND);
        }.bind(this));
    },

    _updateGUIWithCurrentSuggestHero: function () {
        var slotId = mc.GameData.guiState.getCurrentSlotReplaceFriendHero();
        var suggestFriendInfo = mc.GameData.friendManager.getSuggestFriendInfoById(mc.GameData.guiState.getCurrentSuggestFriendHeroId());
        if (suggestFriendInfo && slotId) {
            var teamId = mc.TeamFormationManager.TEAM_CAMPAIGN;
            var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
            var leaderFormationIndex = mc.GameData.teamFormationManager.getLeaderFormationByIndex(teamId, teamIndex);
            if ("slot_" + leaderFormationIndex == slotId) {
                mc.GameData.guiState.setCurrentEditFormationTeamIndex(undefined);
                mc.GameData.guiState.setCurrentSuggestFriendHeroId(undefined);
                return;
            }
            var heroFriendAvt = this._layoutHeroContainer.getChildByName("heroFriendAvatar");
            if (heroFriendAvt) {
                var oldReplaceHeroId = heroFriendAvt._replaceId;
                this._mapBtnChangeBySlotId[oldReplaceHeroId].loadTexture("button/btn_FriendChange.png", ccui.Widget.PLIST_TEXTURE);
                this._mapHeroAvtBySlotId[oldReplaceHeroId].setVisible(true);
                mc.view_utility.setNotifyIconForWidget(this._mapBtnChangeBySlotId[slotId], true, 0.96, 0.96);
                heroFriendAvt.removeFromParent();
            }
            this._mapHeroAvtBySlotId[slotId].setVisible(false);
            this._mapBtnChangeBySlotId[slotId].loadTexture("button/btn_FriendChange_selected.png", ccui.Widget.PLIST_TEXTURE);
            mc.view_utility.setNotifyIconForWidget(this._mapBtnChangeBySlotId[slotId], false, 0.96, 0.96);
            var friendHeroInfo = mc.FriendManager.getSuggestHeroInfoOfPlayer(suggestFriendInfo);
            if (friendHeroInfo) {
                friendHeroInfo.element = mc.dictionary.getHeroDictByIndex(friendHeroInfo.index).element;
            }

            var avtView = this._mapHeroAvtBySlotId[slotId];
            heroFriendAvt = new mc.HeroAvatarView(friendHeroInfo);
            heroFriendAvt.setName("heroFriendAvatar");
            heroFriendAvt.x = avtView.x;
            heroFriendAvt.y = avtView.y;
            heroFriendAvt._replaceId = slotId;
            heroFriendAvt.registerTouchEvent(function (heroFriendAvt) {
                heroFriendAvt.removeFromParent();
                mc.GameData.guiState.setCurrentSuggestFriendHeroId(null);
                mc.GameData.guiState.setCurrentSlotReplaceFriendHero(null);
                var replaceId = heroFriendAvt._replaceId;
                this._mapHeroAvtBySlotId[replaceId].setVisible(true);
                this._mapBtnChangeBySlotId[replaceId].loadTexture("button/btn_FriendChange.png", ccui.Widget.PLIST_TEXTURE);
            }.bind(this));
            this._layoutHeroContainer.addChild(heroFriendAvt);
        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_SELECT_CAMPAIGN_HERO);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_START_CP_BATTLE_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnBattle)
                    .setCharPositionY(cc.winSize.height * 0.7)
                    .show();
            }
        }
    },


    onLayerClearStack: function () {
        mc.GameData.guiState.setSelectStageCampaignIndex(null);
        mc.GameData.guiState.setCurrentSuggestFriendHeroId(null);
        mc.GameData.guiState.setCurrentSlotReplaceFriendHero(null);
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_SELECT_CAMPAIGN_HERO;
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