/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.GuildBossLayer = mc.MainBaseLayer.extend({

    _bossType: {GUILD: "guild", ARENA: "arena"},

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_guild_boss);
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var self = this;
        var nodeBrk = rootMap["nodeBrk"];
        this.swordBg = rootMap["swords_bg"];
        this._spine_node = rootMap["spine_node"];

        this.bossName = rootMap["boss_name"];
        this.lblTime = rootMap["lblTime"];
        this.time = rootMap["time"];
        this.killed = rootMap["killed"];
        this.bossHp1 = rootMap["boss_hp_bg"];
        this.bossHp2 = rootMap["boss_hp_bg_1"];
        this.bossHp3 = rootMap["boss_hp_bg_2"];
        this.bossPercentBG = rootMap["boss_percent_bg"];
        var btnBattle = this._btnBattle = rootMap["btn_battle"];
        var btnTeam = this._btnTeam = rootMap["btn_team"];
        var btnInfo = rootMap["btn_info"];
        var btnDamHis = rootMap["btnDamHis"];
        var btnQuest = rootMap["btn_quest"];


        var imageView = new ccui.ImageView("res/brk/UI_GuildBoss_BG.png", ccui.Widget.LOCAL_TEXTURE);
        nodeBrk.addChild(imageView);
        var imgTitle = rootMap["imgTitle"];
        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("Clan Boss"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.view_utility.hideLoadingDialogById(loadingId);
        this.time.setString('');
        this.time.setColor(mc.color.GREEN);
        this._getGuildBossInfo();
        btnQuest.setString(mc.dictionary.getGUIString("Quest"));
        btnBattle.setString(mc.dictionary.getGUIString("Battle"));
        btnTeam.setString(mc.dictionary.getGUIString("Team"));
        btnInfo.registerTouchEvent(function () {
            var dialog = new mc.GuildBossRulesDialog();
            dialog.show();
        }.bind(this));

        btnDamHis.registerTouchEvent(function () {
            var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_BOSS_RANKING);
            layer.setData(this._getCurrBossShow());

        }.bind(this));

        btnBattle.registerTouchEvent(function () {
            if (!this._isEmptyTeam()) {
                var isShow = mc.view_utility.showSuggestBuyItemSlotsIfAny();
                if (!isShow) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.fightGuildBoss(this._getCurrBossShow().bossType, this._getCurrBossShow().stageIndex, function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            mc.GUIFactory.showGuildBossBattleScreen();
                        }
                    });
                }
            }
            else {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtShouldToSetUpFormation"));
            }
        }.bind(this));

        btnTeam.registerTouchEvent(function () {
            if (this._isCurrArenaBoss()) {
                mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_GUILD_BOSS_ARENA);
            }
            else {
                mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_GUILD_BOSS);
            }

            mc.GUIFactory.showEditFormationScreen(mc.GameData.guildBossSystem);
        }.bind(this));

        btnQuest.registerTouchEvent(function () {
                // this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS_RANKING);
                mc.view_utility.showComingSoon();
            }.bind(this)
        );
    },

    _isCurrArenaBoss: function () {
        try {
            if (mc.GameData.guildBossSystem.getBossByStage(this._currStageBossIndexShow).bossType === this._bossType.ARENA) {
                return true;
            }
        }
        catch (e) {

        }
        return false;
    },

    _getCurrBossShow: function () {
        return mc.GameData.guildBossSystem.getBossByStage(this._currStageBossIndexShow);
    },

    _isEmptyTeam: function () {
        var isEmpty = true;
        var teamId = mc.TeamFormationManager.TEAM_GUILD_BOSS;
        if (this._isCurrArenaBoss()) {
            teamId = mc.TeamFormationManager.TEAM_GUILD_BOSS_ARENA;
        }
        var mainHeroIds = mc.GameData.teamFormationManager.getTeamFormationByIndex(teamId);
        for (var i = 0; i < mainHeroIds.length; i++) {
            if (mainHeroIds[i] > 0) {
                isEmpty = false;
                break;
            }
        }
        return isEmpty;
    },

    _initMonster: function () {
        var btnLeft = this._btnLeft = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
        var btnRight = this._btnRight = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
        btnRight.scaleX = -1;
        this._root.addChild(btnLeft);
        this._root.addChild(btnRight);
        btnLeft.runAction(cc.sequence([cc.moveBy(0.3, -10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, 10, 0), cc.delayTime(1)]).repeatForever());
        btnRight.runAction(cc.sequence([cc.moveBy(0.3, 10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, -10, 0), cc.delayTime(1)]).repeatForever());
        btnLeft.x = cc.winSize.width * 0.07;
        btnRight.x = cc.winSize.width * 0.93;
        btnLeft.y = btnRight.y = cc.winSize.height * 0.55;
        var currMonsterFocus = 0;
        this.monsterMap = {};
        var guildBossData = [].concat((mc.dictionary.guildBossData));
        var bossArena = null;
        for (var i = 0; i < mc.dictionary.guildBossData.length; i++) {
            if (guildBossData[i].bossType === this._bossType.ARENA) {
                bossArena = guildBossData.splice(i, 1);
                break;
            }
        }
        if (bossArena) {
            guildBossData = bossArena.concat(guildBossData);
        }

        //if(mc.GameData.guildManager.getGuildBossArenaInfo())
        //{
        //    guildBossData = [].concat(mc.dictionary.guildBossData);
        //}


        var arrMonster = this.arrayMonster = bb.collection.createArray(guildBossData.length, function (index) {
            var guildBossDatum = guildBossData[index];
            var bossInfo = mc.dictionary.getCreatureDictByIndex(guildBossDatum["bossIndex"]);
            var monsterIcon = this._rootMap["monsterIcon"];
            var widget = monsterIcon.clone();




            widget.setVisible(true);
            var icon = widget.getChildByName("icon");
            var elementIcon = widget.getChildByName("ele");
            var killed = widget.getChildByName("killed");
            var spriteFrame = cc.spriteFrameCache.getSpriteFrame("png/monster/icon/" + bossInfo.img + ".png");
            if (!spriteFrame) {
                cc.log("Not Found: png/monster/icon/" + bossInfo.img);
                icon.loadTexture("png/monster/icon/unknow.png", ccui.Widget.PLIST_TEXTURE);
            }
            else {
                icon.loadTexture("png/monster/icon/" + bossInfo.img + ".png", ccui.Widget.PLIST_TEXTURE);
            }

            var element = mc.HeroStock.getHeroElement(bossInfo);
            if (!element) {
                element = "fire";
            }
            element = element.toLowerCase();
            var urlBrk = null;
            if (element === mc.const.ELEMENT_FIRE) {
                urlBrk = "patch9/Fire_Panel.png";
            }
            else if (element === mc.const.ELEMENT_WATER) {
                urlBrk = "patch9/Water_Panel.png";
            }
            else if (element === mc.const.ELEMENT_EARTH) {
                urlBrk = "patch9/Earth_Panel.png";
            }
            else if (element === mc.const.ELEMENT_DARK) {
                urlBrk = "patch9/Dark_Panel.png";
            }
            else if (element === mc.const.ELEMENT_LIGHT) {
                urlBrk = "patch9/Light_Panel.png";
            }

            widget.loadTexture(urlBrk, ccui.Widget.PLIST_TEXTURE);

            var crystalView = mc.view_utility.createHeroCrystalView(bossInfo);
            elementIcon.addChild(crystalView);
            crystalView.setPosition(elementIcon.width / 2, elementIcon.height / 2);


            widget.stageIndex = guildBossDatum["stageIndex"];
            widget.getReturnKey = function () {
                return this.stageIndex;
            }.bind(widget);
            if(guildBossDatum.bossType === this._bossType.ARENA)
            {
                if(mc.GameData.guildBossSystem.getGuildBossArenaInfo() )
                {
                    killed.setVisible(mc.GameData.guildBossSystem.getGuildBossArenaComplete());
                }
                else
                {
                    var blackBrk = widget.getChildByName("pnlBlack");
                    if (blackBrk) {
                        blackBrk.setBackGroundColor(cc.color.BLACK);
                        blackBrk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
                        blackBrk.setBackGroundColorOpacity(bb.framework.getTrueOpacity(99));
                        blackBrk.setVisible(true);
                        blackBrk.registerTouchEvent(function () {
                            var result = mc.GameData.guildBossSystem.getBossByStage(widget.getReturnKey());
                            this._initBoss(result, widget.getReturnKey());
                            this.offForcus();
                            this.toggleFocus(widget, true);
                            currMonsterFocus = index;
                            bindBtnLeftRight();
                        }.bind(this));

                    }
                }
            }
            else
            {
                killed.setVisible(widget.stageIndex <= mc.GameData.guildBossSystem.getCurrBossStageComplete());
            }

            widget.registerTouchEvent(function () {
                var result = mc.GameData.guildBossSystem.getBossByStage(widget.getReturnKey());
                this._initBoss(result, widget.getReturnKey());
                this.offForcus();
                this.toggleFocus(widget, true);
                currMonsterFocus = index;
                bindBtnLeftRight();
            }.bind(this));
            this.monsterMap[widget.stageIndex] = widget;
            return widget;
        }.bind(this));
        var bindBtnLeftRight = function () {

            if (currMonsterFocus === 0) {
                btnLeft.setVisible(false);
                btnRight.setVisible(true);
            }
            else if (currMonsterFocus === arrMonster.length - 1) {
                btnLeft.setVisible(true);
                btnRight.setVisible(false);
            }
            else {
                btnLeft.setVisible(true);
                btnRight.setVisible(true);
            }
        }.bind(this);
        var bossListBg = this._rootMap["boss_list_bg"].getChildByName("lvl");

        // var layout = mc.widget_utility.createScrollNode(arrMonster, focusView, 100, cc.p(bossListBg.width - 20, bossListBg.height), {
        //     clickFunc: function (id) {
        //         var result = mc.GameData.guildBossSystem.getBossByStage(id);
        //         this._initBoss(result, id);
        //     }.bind(this),
        //     autoFocusFunc: function (id) {
        //         var result = mc.GameData.guildBossSystem.getBossByStage(id);
        //         this._initBoss(result, id);
        //     }.bind(this)
        // });
        // // layout.toggleScaleAnimate();
        // layout.setClippingEnabled(true);
        // layout.setLoopScroll(false, 7);
        // layout.setPosition(bossListBg.width / 2, bossListBg.height / 2);
        // //var focus = mc.GameData.guildBossSystem.getCurrBossStage() || 0;
        // var focus = mc.GameData.guildBossSystem.getCurrBossStage() - 1;
        // if (focus < 0) {
        //     focus = 0;
        // }
        // layout.focusAt(focus, true);
        btnLeft.registerTouchEvent(function () {
            currMonsterFocus = currMonsterFocus - 1;
            var widget = this.arrayMonster[currMonsterFocus];
            var result = mc.GameData.guildBossSystem.getBossByStage(widget.getReturnKey());
            this._initBoss(result, widget.getReturnKey());
            this.offForcus();
            bossListBg.scrollToPercentHorizontal((currMonsterFocus) / arrMonster.length * 100, 0.2);
            this.toggleFocus(widget, true);
            bindBtnLeftRight();
        }.bind(this));
        btnRight.registerTouchEvent(function () {
            currMonsterFocus = currMonsterFocus + 1;
            var widget = this.arrayMonster[currMonsterFocus];
            var result = mc.GameData.guildBossSystem.getBossByStage(widget.getReturnKey());
            this._initBoss(result, widget.getReturnKey());
            this.offForcus();
            bossListBg.scrollToPercentHorizontal((currMonsterFocus + 1) / arrMonster.length * 100, 0.2);
            this.toggleFocus(widget, true);
            bindBtnLeftRight();
        }.bind(this));
        // layout.setScrollListener({
        //     atBegin: function () {
        //         btnLeft.setVisible(false);
        //         btnRight.setVisible(true);
        //     },
        //     atMid: function () {
        //         btnLeft.setVisible(true);
        //         btnRight.setVisible(true);
        //     },
        //     atEnd: function () {
        //         btnLeft.setVisible(true);
        //         btnRight.setVisible(false);
        //     }
        // });
        this.offForcus();
        var ww = null;
        var stageIndex = 0;
        if (mc.GameData.guiState.getCurrGuildBossShow()) {
            stageIndex = mc.GameData.guiState.getCurrGuildBossShow().stageIndex;
        }
        else {
            if (mc.GameData.guildBossSystem.getGuildBossArenaInfo()) {
                stageIndex = mc.GameData.guildBossSystem.getArenaBossStage();
            }
            else {
                stageIndex = mc.GameData.guildBossSystem.getCurrBossStage()
            }
        }
        ww = this.monsterMap[stageIndex];


        this.toggleFocus(ww, true);
        currMonsterFocus = arrMonster.indexOf(ww);
        bindBtnLeftRight();
        var layout = bb.layout.linear(arrMonster, 20, bb.layout.LINEAR_HORIZONTAL);
        bossListBg.pushBackCustomItem(layout);
    },

    offForcus: function () {
        if (this.arrayMonster) {
            for (var i in this.arrayMonster) {
                this.toggleFocus(this.arrayMonster[i], false);
            }
        }
    },

    toggleFocus: function (widget, isShow) {
        if (!widget)
            return;
        if (!widget.getChildByName("itemFocus")) {
            var focusView = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_focus_json, res.spine_ui_item_panel_focus_atlas, 1.0);
            focusView.setName("itemFocus");
            focusView.setScale(0.9, 0.9);
            focusView.setAnimation(0, "focus_idle", true);
            widget.addChild(focusView);
            focusView.setPosition(widget.width / 2, widget.height / 2);

        }
        widget.getChildByName("itemFocus").setVisible(isShow);
    },

    _initFightTimes: function (numChance) {
        var nodeSwords = this.swordBg.getChildByName("nodeSword");
        nodeSwords.removeAllChildren();
        var layoutSwords = bb.layout.linear(bb.collection.createArray(2, function (index) {
            var spr = new cc.Sprite("#icon/ico_battle.png");
            spr.swordIndex = index;
            if (index >= numChance) {
                spr.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            return spr;
        }), 5, bb.layout.LINEAR_HORIZONTAL);
        nodeSwords.addChild(layoutSwords);
    },

    _initBoss: function (clanBossData, bossStageInd) {
        this._bossView && this._bossView.removeFromParent();
        this._lblRevive && this._lblRevive.removeFromParent();
        this._portal && this._portal.removeFromParent();
        this._bossView = null;
        this._lblRevive = null;
        this._portal = null;
        this._currStageBossIndexShow = bossStageInd;
        mc.GameData.guiState.setCurrGuildBossShow(clanBossData);

        var currBossStage = null;
        var bossHpPercent = 0;
        this._btnTeam.setGray(false);
        if (clanBossData.bossType === this._bossType.ARENA) {
            currBossStage = clanBossData.stageIndex;
            bossHpPercent = 100;
            this.killed.setVisible(false);
            this.setBlackBackgroundEnable(false);
            var rewardhasExpired = false;
            if (mc.GameData.guildBossSystem.getGuildBossArenaInfo()) {
                if (mc.GameData.guildBossSystem.getGuildBossArenaComplete()) {
                    bossHpPercent = 0;
                    this.killed.setVisible(true);
                    this._btnBattle.setGray(true);
                    this._btnTeam.setGray(true);
                    this.setBlackBackgroundEnable(true);
                }
                else {

                    var guildBossDatum = mc.GameData.guildBossSystem.getBossByStage(currBossStage);
                    var bossData = mc.dictionary.getCreatureDictByIndex(guildBossDatum["bossIndex"]);
                    var currHp = mc.GameData.guildBossSystem.getCurrArenaBossHp();
                    var totalHp = bossData.hp;
                    this._btnBattle.setGray(false);
                    bossHpPercent = currHp / totalHp * 100;
                }
            }
            else {
                this._btnBattle.setGray(true);
                this._btnTeam.setGray(true);
            }


            var claimList = mc.GameData.guildBossSystem.getBossArenaClaimedList();
            this.initBossHpPercentRewards(bossHpPercent, clanBossData, claimList, currBossStage);


        }
        else {
            currBossStage = mc.GameData.guildBossSystem.getCurrBossStage();
            this.killed.setVisible(false);
            this.setBlackBackgroundEnable(false);
            var rewardhasExpired = false;
            if (bossStageInd < currBossStage) {
                bossHpPercent = 0;
                this.killed.setVisible(true);
                this._btnBattle.setGray(true);
                this.setBlackBackgroundEnable(true);
                rewardhasExpired = true;
            }
            else if (bossStageInd > currBossStage) {
                bossHpPercent = 100;
                this._btnBattle.setGray(true);
            }
            else {
                if (mc.GameData.guildBossSystem.getCurrBossStage() === mc.GameData.guildBossSystem.getCurrBossStageComplete()) {
                    bossHpPercent = 0;
                    this.killed.setVisible(true);
                    this._btnBattle.setGray(true);
                    this.setBlackBackgroundEnable(true);
                }
                else {
                    var guildBossDatum = mc.GameData.guildBossSystem.getBossByStage(currBossStage);
                    var bossData = mc.dictionary.getCreatureDictByIndex(guildBossDatum["bossIndex"]);
                    var currHp = mc.GameData.guildBossSystem.getCurrBossHp();
                    var totalHp = bossData.hp;
                    this._btnBattle.setGray(false);
                    bossHpPercent = currHp / totalHp * 100;
                }
            }
            if (bossStageInd < currBossStage) {
                mc.protocol.getOldStageGuildBossInfo(clanBossData.bossType,bossStageInd, function (rs) {
                    var claimList = rs.killBossInfo.claimedList;
                    this.initBossHpPercentRewards(bossHpPercent, clanBossData, claimList, bossStageInd);
                }.bind(this))
            }
            else {
                var claimList = mc.GameData.guildBossSystem.getClaimedList();
                this.initBossHpPercentRewards(bossHpPercent, clanBossData, claimList, currBossStage);
            }
        }
        this._bindFightTimesAndEndTime();


        var bossIndex = clanBossData["bossIndex"];
        var _loadFunc = function () {
            var pos = cc.p(0, 0);
            var creatureView = this._bossView = mc.BattleViewFactory.createCreatureGUIByIndex(bossIndex);
            creatureView.setPosition(pos.x, pos.y);
            creatureView.scale = 1.0;
            creatureView.setDirection(mc.CreatureView.DIRECTION_LEFT);
            this._spine_node.addChild(creatureView, 10);
            if (this._isBossRevive) {
                creatureView.x = creatureView.x - cc.winSize.width;
                creatureView.startComming();
            }
            else {
                creatureView.idle();
            }
            this._isBossRevive = false;


        }.bind(this);


        var assetData = mc.dictionary.getCreatureAssetByIndex(clanBossData["bossIndex"]);
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

        if(mc.enableReplaceFontBM())
        {
            this.bossName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this.bossName);
            this.lblTime = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this.lblTime);
            //this.time = mc.view_utility.replaceBitmapFontAndApplyTextStyle(this.time);
        }
        this.bossName.setString(mc.dictionary.getI18nMsg(clanBossData["stageName"]));
        this.lblTime.setString(mc.dictionary.getGUIString("Remain Time"));
        //this.time.setString(mc.view_utility.formatDurationTime2(1000 * 60 * 60 * 24));
        this.bossHp2.setPercent(bossHpPercent);

    },

    setBlackBackgroundEnable: function (enable) {
        var blackBrk = this._spine_node.getChildByName("__blackBrk__");
        if (!blackBrk) {
            blackBrk = new ccui.Layout();
            blackBrk.setName("__blackBrk__");
            blackBrk.anchorX = blackBrk.anchorY = 0.5;
            blackBrk.x = 0;
            blackBrk.y = 0;
            blackBrk.width = cc.winSize.width * 1.4;
            blackBrk.height = cc.winSize.height * 1.4;
            blackBrk.setLocalZOrder(-1000);
            blackBrk.setBackGroundColor(cc.color.BLACK);
            blackBrk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            blackBrk.setBackGroundColorOpacity(bb.framework.getTrueOpacity(99));
            this._spine_node.addChild(blackBrk, 11);
        }
        blackBrk.setVisible(enable);
        return this;
    },

    _updateEndTime: function (ms) {
        var updateTime = function () {
            if (ms) {
                var deltaMs = ms - bb.now();
                if (deltaMs <= 0) {
                    if (this._countDownAction) {
                        this.stopAction(this._countDownAction);
                        this._countDownAction = null;
                    }
                    //this._getGuildBossInfo();
                }
                else {
                    this.time.setString(' ' + mc.view_utility.formatDurationTime(deltaMs));
                }
            }
            else
            {
                this.time.setString(' ' + mc.view_utility.formatDurationTime(deltaMs));
            }
        };
        this._countDownAction = this.time.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(updateTime.bind(this))).repeatForever());
    },

    _getGuildBossInfo: function () {
        mc.protocol.getGuildBossInfo(function (rs) {

            var boss = mc.GameData.guiState.getCurrGuildBossShow();
            if (!boss) {
                if (mc.GameData.guildBossSystem.getGuildBossArenaInfo()) {
                    this._initBoss(mc.GameData.guildBossSystem.getArenaBoss(), mc.GameData.guildBossSystem.getArenaBossStage());
                }
                else {
                    this._initBoss(mc.GameData.guildBossSystem.getCurrBoss(), mc.GameData.guildBossSystem.getCurrBossStage());
                }
            }
            else {
                this._initBoss(boss, boss.stageIndex);
            }
            this._initMonster();
            //this._bindFightTimesAndEndTime();

        }.bind(this));
    },

    _bindFightTimesAndEndTime: function () {
        if (this._countDownAction) {
            this.stopAction(this._countDownAction);
            this._countDownAction = null;
        }
        if (this._getCurrBossShow().bossType === this._bossType.ARENA) {
            if (mc.GameData.guildBossSystem.getGuildBossArenaInfo()) {
                this._initFightTimes(mc.GameData.guildBossSystem.getBossArenaTicketNo());
                this._updateEndTime(mc.GameData.guildBossSystem.getArenaBossEndTime())
                mc.GameData.guildBossSystem.setKillBossArenaInfo(mc.GameData.guildBossSystem.getKillBossAreanInfo());
            }
            else {
                this._initFightTimes(0);
                this._updateEndTime(0);
            }

        }
        else {
            this._initFightTimes(mc.GameData.guildBossSystem.getTicketNo());
            this._updateEndTime(mc.GameData.guildBossSystem.getBossEndTime());
            mc.GameData.guildBossSystem.setKillBossInfo(mc.GameData.guildBossSystem.getKillBossInfo());
        }
    },

    checkClaimed: function (claimedList, p) {
        var claimed = false;
        for (var i in claimedList) {
            if (claimedList[i] === p) {
                claimed = true;
                break;
            }
        }
        return claimed;
    },

    initBossHpPercentRewards: function (bossHpPercent, clanBossData, claimList, stageIndex) {
        var percent = this.bossPercentBG.getChildByName("percent");
        var bossReversePercent = Math.floor(100 - bossHpPercent);
        percent.setPercent(bossReversePercent);
        var circle = this.bossPercentBG.getChildByName("circle");
        var lblPercent = circle.getChildByName("lbl");
        lblPercent.setString((bossReversePercent) + "%");
        lblPercent.setColor(mc.color.GREEN);

        var chest1 = this.bossPercentBG.getChildByName("chest1");
        var chest2 = this.bossPercentBG.getChildByName("chest2");
        var chest3 = this.bossPercentBG.getChildByName("chest3");
        var chest4 = this.bossPercentBG.getChildByName("chest4");
        var arrChestName = mc.GuildBossLayer.ARRAY_TREASUREBOX_SKIN;
        if (this._treasureBox) {
            for (var i = 0; i < 4; i++) {
                if (this._treasureBox[i]) {
                    this._treasureBox[i].removeFromParent();
                }
                this._treasureBox[i] = null;
            }
        }
        else {
            this._treasureBox = []
        }
        for (var i = 1; i < 5; i++) {
            var isWin = false;
            if (bossReversePercent >= 25 * i) {
                isWin = true;
            }
            var chest = chest1;
            var data = null;// clanBossData["bonus25"]
            switch (i) {
                case 1:
                    chest = chest1;
                    data = clanBossData["bonus25"];
                    break;
                case 2:
                    chest = chest2;
                    data = clanBossData["bonus50"];
                    break;
                case 3:
                    chest = chest3;
                    data = clanBossData["bonus75"];
                    break;
                case 4:
                    chest = chest4;
                    data = clanBossData["bonus100"];
                    break;
            }
            var x = chest.x;
            var y = chest.y;
            var treasureBox = this._treasureBox[i - 1] = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json, res.spine_ui_chest_atlas, 1.0);
            treasureBox.setSkin(arrChestName[i - 1]);
            //treasureBox.setLocalZOrder(numTotalNode - indexNode);
            var canClick = true;
            if (!isWin) {
                treasureBox.addAnimation(0, "idle", true, bb.utility.randomInt(0, 10) * 0.1);
            }
            else {

                var p = 25 * i;
                var isClaimed = this.checkClaimed(claimList, p);
                if (isClaimed) {
                    focusView = treasureBox;
                    treasureBox.setAnimation(0, "opened", true);
                    canClick = false;
                }
                else {
                    treasureBox.setAnimation(0, "ready", true);
                }


            }

            this.bossPercentBG.addChild(treasureBox);
            treasureBox.anchorX = 0.05;
            treasureBox.anchorY = 0.1;
            treasureBox.x = x;
            treasureBox.y = y + 25;
            if (cc.sys.isNative) {
                treasureBox.y -= 10;
            }
            treasureBox.scale = 0.85;
            treasureBox.opacity = 0;
            treasureBox.setUserData(data);
            treasureBox.runAction(cc.fadeIn(0.5));
        }


        chest1.getChildByName("lbl").setString("25%");
        chest2.getChildByName("lbl").setString("50%");
        chest3.getChildByName("lbl").setString("75%");
        chest4.getChildByName("lbl").setString("100%");
        chest1.setEnabled(true);
        chest2.setEnabled(true);
        chest3.setEnabled(true);
        chest4.setEnabled(true);
        var onClaimChanged = function (isClaim, percent) {
            if (isClaim) {
                switch (percent) {
                    case 25:
                        this._treasureBox[0].setAnimation(0, "opened", true);
                        break;
                    case 50:
                        this._treasureBox[1].setAnimation(0, "opened", true);
                        break;
                    case 75:
                        this._treasureBox[2].setAnimation(0, "opened", true);
                        break;
                    case 100:
                        this._treasureBox[3].setAnimation(0, "opened", true);
                        break;
                }
            }

        }.bind(this);


        chest1.registerTouchEvent(function () {
            var p = 25;

            var claimed = this.checkClaimed(claimList, p);
            if (bossReversePercent >= p) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getGuildBossChestInfo(p,clanBossData.bossType, stageIndex, function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    var dialog = new mc.GuildBossRewardFromCardDialog(result.receivedBox, p, claimed, clanBossData["bonus25"], stageIndex, onClaimChanged);
                    dialog.show();
                });

            }
            else {

                var dialogRewardList = new mc.RewardListDialog(mc.ItemStock.createArrJsonItemPackFromStr(clanBossData["bonus25"]));
                dialogRewardList.show();
            }


        }.bind(this));
        chest2.registerTouchEvent(function () {
            var p = 50;

            var claimed = this.checkClaimed(claimList, p);
            if (bossReversePercent >= p) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getGuildBossChestInfo(p,clanBossData.bossType, stageIndex, function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    var dialog = new mc.GuildBossRewardFromCardDialog(result.receivedBox, p, claimed, clanBossData["bonus50"], stageIndex, onClaimChanged);
                    dialog.show();
                });
            }
            else {
                var dialogRewardList = new mc.RewardListDialog(mc.ItemStock.createArrJsonItemPackFromStr(clanBossData["bonus50"]));
                dialogRewardList.show();
            }


        }.bind(this));
        chest3.registerTouchEvent(function () {
            var p = 75;
            var claimed = this.checkClaimed(claimList, p);
            if (bossReversePercent >= p) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getGuildBossChestInfo(p,clanBossData.bossType, stageIndex, function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    var dialog = new mc.GuildBossRewardFromCardDialog(result.receivedBox, p, claimed, clanBossData["bonus75"], stageIndex, onClaimChanged);
                    dialog.show();
                });
            }
            else {
                var dialogRewardList = new mc.RewardListDialog(mc.ItemStock.createArrJsonItemPackFromStr(clanBossData["bonus75"]));
                dialogRewardList.show();
            }

        }.bind(this));
        chest4.registerTouchEvent(function () {
            var p = 100;
            var claimed = this.checkClaimed(claimList, p);
            if (bossReversePercent >= p) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getGuildBossChestInfo(p,clanBossData.bossType, stageIndex, function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    var dialog = new mc.GuildBossRewardFromCardDialog(result.receivedBox, p, claimed, clanBossData["bonus100"], stageIndex, onClaimChanged);
                    dialog.show();
                });
            }
            else {
                var dialogRewardList = new mc.RewardListDialog(mc.ItemStock.createArrJsonItemPackFromStr(clanBossData["bonus100"]));
                dialogRewardList.show();
            }

        }.bind(this));


    },

    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    onLayerClearStack: function () {
        mc.GameData.guiState.setCurrGuildBossShow(null);
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_BOSS;
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
mc.GuildBossLayer.ARRAY_TREASUREBOX_SKIN = [
    "chest_bronze_red", "chest_bronze_red", "chest_bronze_red", "chest_platinum"
];

