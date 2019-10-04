/**
 * Created by long.nguyen on 1/11/2018.
 */
mc.BattleControllBoardViewRefactor = cc.Node.extend({
    _mapPlayerHeroAvtByBattleId: null,
    _mapOpponentGauseByBattleId: null,
    _mapFakePlayerWidgetByBattleId: null,

    ctor: function (battleView) {
        this._super();

        this._mapPlayerHeroAvtByBattleId = {};
        this._mapOpponentGauseByBattleId = {};
        this._mapFakePlayerWidgetByBattleId = {};

        var battleField = battleView.getBattleField();
        cc.spriteFrameCache.addSpriteFrames(res.button_plist);

        this.battleView = battleView;

        var self = this;
        var screen = ccs.load(res.screen_battle_json, "res/").node;
        var root = this._root = screen.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var lblZen = this._lblZen = rootMap["lblZen"];
        var iconZen = this._iconZen = rootMap["iconZen"];
        var infoBtn = this._infoBtn = rootMap["element"];
        infoBtn.registerTouchEvent(function () {
            new mc.TutorialPopupDialog().show();
        });
        var iconTime = this._iconTime = rootMap["iconTime"];
        var lblTimeUp = this._lblTimeUp = rootMap["lblTimeUp"];
        this._nodeVs = rootMap["nodeVs"];
        this._nodeVs && this._nodeVs.setVisible(false);
        var panelChars = this._panelChars = rootMap["panelChars"];
        var charsMap = bb.utility.arrayToMap(panelChars.getChildren(), function (child) {
            return child.getName();
        });

        this._pnlRound = rootMap["pnlRound"];
        if(this._pnlRound)
        {
            this._lblCurr = this._pnlRound.getChildByName("lblCurr");
            this._lblSep = this._pnlRound.getChildByName("lblSep");
            this._lblTotal = this._pnlRound.getChildByName("lblTotal");
            if(this._lblCurr)
            {
                this._lblCurr.setColor(mc.color.YELLOW_SOFT);
            }
            if(this._lblSep)
            {
                this._lblSep.setColor(mc.color.YELLOW_SOFT);
            }
            if(this._lblTotal)
            {
                this._lblTotal.setColor(mc.color.YELLOW_SOFT);
            }
        }

        var btnAuto = this._btnAuto = charsMap["btnAuto"];
        var lblAuto = this._lblAuto = btnAuto.setString(mc.dictionary.getGUIString("lblAuto"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var btnXspeed = this._btnX2 = charsMap["btnX2"];
        var iconMonster = panelChars.getChildByName("iconMonster");
        if (iconMonster) {
            var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_monster_icon_json, res.spine_monster_icon_atlas, 1.0);
            panelChars.addChild(iconAnimate);
            iconAnimate.setLocalZOrder(1);
            iconAnimate.setPosition(iconMonster.x, iconMonster.y);
            iconAnimate.setAnimation(0, "idle", true);
            iconMonster.removeFromParent();
        }
        var lblX2 = btnXspeed.setString(mc.dictionary.getGUIString("lblX2"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var btnMoreItem = this._btnMoreItem = charsMap["btnMoreItem"];
        var lblMoreItems = btnMoreItem.setString(mc.dictionary.getGUIString("lblMoreItem"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var btnMenu = charsMap["btnMenu"];
        var lblMenu = btnMenu.setString(mc.dictionary.getGUIString("lblMenu"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblMenu.setScale(0.5);

        lblX2.setScale(0.5);
        lblX2.x += 20;
        lblAuto.setScale(0.5);
        lblAuto.x += 20;
        lblMoreItems.setScale(0.5);
        lblMoreItems.x += 20;
        lblMenu.setScale(0.5);
        lblMenu.x += 20;

        var monsterPos = this._monsterPos = charsMap["monsterPos"];

        root.x = cc.winSize.width * 0.5;

        var maxElement = 5;
        var allAvatar = bb.collection.createArray(5, function (index) {
            var avtView = new ccui.ImageView("res/gui/battle/Empty_Chara_Frame.png", ccui.Widget.LOCAL_TEXTURE);
            avtView.setUserData(index);
            return avtView;
        });

        var layout = this._layoutAvt = bb.layout.grid(allAvatar, maxElement, cc.winSize.width);
        layout.x = panelChars.width * 0.5;
        layout.y = panelChars.height - layout.height * 0.5 - 75;
        panelChars.addChild(layout);

        var nodeFakeBattle = this._nodeFakeBattle = new cc.Node();
        for (var i = 0; i < 5; i++) {
            var fakeLayout = new ccui.Layout();
            fakeLayout.anchorX = 0.5;
            fakeLayout.width = 100;
            fakeLayout.height = 150;
            fakeLayout.setVisible(false);
            nodeFakeBattle.addChild(fakeLayout);
        }
        this.addChild(nodeFakeBattle);

        this._hookupBattleFieldEvent(battleField);
        this.addChild(screen);

        // load GUI
        var currPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        this._lblZen.setUserData(currPartInBattle.getCurrentDropZen());
        this._lblZen.setString("x " + bb.utility.formatNumber(this._lblZen.getUserData()));

        self.updateBattleDurationString();
        self._loadConsumableItem();

        var setting = mc.storage.readSetting();
        if (currPartInBattle.isAutoCombatMode()) {
            battleField.setAuto(true);
            btnAuto.setColor(mc.color.BLACK_DISABLE_SOFT);
            btnAuto.setEnabled(false);
            btnMoreItem.setColor(mc.color.BLACK_DISABLE_SOFT);
            btnMoreItem.setEnabled(false);
            for (var i = 0; i < this._arrItemSlot.length; i++) {
                this._arrItemSlot[i].setEnableSlot(false);
            }
        }
        else {
            if (!currPartInBattle.isUsedItem()) {
                btnMoreItem.setColor(mc.color.BLACK_DISABLE_SOFT);
                btnMoreItem.setEnabled(false);
            }
            battleField.setAuto(setting.auto_battle);
        }
        btnAuto.registerTouchEvent(function () {
            var autoModeTouched = mc.storage.readAutoModeTouched();
            _performAutoMode = function(){
                battleField.setAuto(!battleField.isAuto());
                setting.auto_battle = battleField.isAuto();
            }.bind(this);
            if(!autoModeTouched)
            {
                battleField.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
                btnAuto.runAction(cc.sequence([cc.delayTime(0.5),cc.callFunc(function(){
                    mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblInfo"),mc.dictionary.getGUIString("lblAutoMode"));
                }.bind(this))]));
                _performAutoMode();
                mc.storage.autoModeTouched = true;
                mc.storage.saveAutoModeTouched();
            }
            else
            {
                _performAutoMode();
            }
        }.bind(this));
        btnMenu.registerTouchEvent(function () {
            battleField.fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE, undefined, true);
        }.bind(this));
        btnMoreItem.registerTouchEvent(function () {
            new mc.PickBattleConsumableDialog(battleView, function (isChange) {
                if (isChange) {
                    this._loadConsumableItem();
                }
            }.bind(this)).show();
        }.bind(this));

        var mapBtnURLBySpeed = {};
        mapBtnURLBySpeed[mc.const.SPEED_BATTLE_X1] = "button/btn_x1_off.png";
        mapBtnURLBySpeed[mc.const.SPEED_BATTLE_X2] = "button/btn_x2_on.png";
        mapBtnURLBySpeed[mc.const.SPEED_BATTLE_X3] = "button/btn_x3_on.png";
        var mapColorBySpeed = {};
        mapColorBySpeed[mc.const.SPEED_BATTLE_X1] = mc.color.WHITE_NORMAL;
        mapColorBySpeed[mc.const.SPEED_BATTLE_X2] = mc.color.GREEN_NORMAL;
        mapColorBySpeed[mc.const.SPEED_BATTLE_X3] = mc.color.YELLOW;
        var mapIndexBySpeed = {};
        mapIndexBySpeed[mc.const.SPEED_BATTLE_X1] = 0;
        mapIndexBySpeed[mc.const.SPEED_BATTLE_X2] = 1;
        mapIndexBySpeed[mc.const.SPEED_BATTLE_X3] = 2;
        var arrSpeedBattle = mc.GameData.playerInfo.isVIP() && mc.GameData.playerInfo.getCurrentPartInBattle().isSupportX3()?
            [mc.const.SPEED_BATTLE_X1,mc.const.SPEED_BATTLE_X2,mc.const.SPEED_BATTLE_X3] :
            [mc.const.SPEED_BATTLE_X1,mc.const.SPEED_BATTLE_X2];
        var currSpeedBattleIndex = 0;

        var _updateSpeedBattle = function () {
            currSpeedBattleIndex = mapIndexBySpeed[setting.xSpeedBattle];
            if( currSpeedBattleIndex >= arrSpeedBattle.length ){
                currSpeedBattleIndex = arrSpeedBattle.length-1;
                setting.xSpeedBattle = arrSpeedBattle[currSpeedBattleIndex];
            }
            var url = mapBtnURLBySpeed[setting.xSpeedBattle];
            url && btnXspeed.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
            var color = mapColorBySpeed[setting.xSpeedBattle];
            color && lblX2.setColor(color);
            var scaleTime = mc.const.BATTLE_SCALE_TIME_BY_SPEED[setting.xSpeedBattle];
            scaleTime && battleField.setTimeScale(scaleTime);
        };

        if (currPartInBattle.isFixSpeedX2()) {
            setting.xSpeedBattle = mc.const.SPEED_BATTLE_X2;
            _updateSpeedBattle();
            btnXspeed.setColor(mc.color.BLACK_DISABLE_SOFT);
            btnXspeed.setEnabled(false);
        }

        btnXspeed.registerTouchEvent(function () {
            currSpeedBattleIndex++;
            if( currSpeedBattleIndex >= arrSpeedBattle.length ){
                currSpeedBattleIndex = 0;
            }
            setting.xSpeedBattle = arrSpeedBattle[currSpeedBattleIndex];
            _updateSpeedBattle();
        });
        _updateSpeedBattle();

        this.scheduleUpdate();
    },

    setRound :function(curr,total){
        curr > total && (curr = total);
        if(this._pnlRound)
        {
            this._pnlRound.setVisible(true);
            if(this._lblCurr)
            {
                this._lblCurr.setString(curr);
            }
            if(this._lblTotal)
            {
                this._lblTotal.setString(total);
            }
        }
    },

    enableTeamName: function (isEnable) {
        this._nodeVs.setVisible(isEnable);
        this._iconZen.setVisible(!isEnable);
        this._lblZen.setVisible(!isEnable);
        this._infoBtn.setVisible(!isEnable);
    },

    loadTeamName: function (playerTeam, oppTeam, playerTeamSide) {
        this.enableTeamName(true);
        var teamLeft = this._nodeVs.getChildByName("lblTeamLeft");
        var teamRight = this._nodeVs.getChildByName("lblTeamRight");
        var avtL = this._nodeVs.getChildByName("avtL");
        var avtR = this._nodeVs.getChildByName("avtR");
        var oppTeamName = bb.utility.formatWidth(oppTeam["heroName"] || "", 20, 1);
        var playerTeamName = bb.utility.formatWidth(playerTeam["heroName"] || "", 20, 1);
        var oppTeamAvt = oppTeam["avatar"] || "1";
        var playerTeamAvt = playerTeam["avatar"] || "2";
        teamLeft.setString(playerTeamSide === mc.const.TEAM_RIGHT ? oppTeamName : playerTeamName);
        teamRight.setString(playerTeamSide === mc.const.TEAM_LEFT ? oppTeamName : playerTeamName);
        var avatarL = mc.view_utility.createAvatarPlayer(parseInt(playerTeamSide === mc.const.TEAM_RIGHT ? oppTeamAvt : playerTeamAvt ));
        var avatarR = mc.view_utility.createAvatarPlayer(parseInt(playerTeamSide === mc.const.TEAM_LEFT ? oppTeamAvt : playerTeamAvt));
        // avatarL.setScale(0.5);
        // avatarR.setScale(0.5);
        avtL.addChild(avatarL);
        avtR.addChild(avatarR);
        avatarL.setPosition(avtL.width / 2, avtL.height / 2);
        avatarR.setPosition(avtR.width / 2, avtR.height / 2);
    },

    update: function (dt) {
        for (var id in this._mapFakePlayerWidgetByBattleId) {
            var fakeWidget = this._mapFakePlayerWidgetByBattleId[id];
            var creatureView = this.battleView.getCreatureViewByBattleId(id);
            if (creatureView && fakeWidget) {
                fakeWidget.x = creatureView.x;
                fakeWidget.y = creatureView.y;
            }
        }
    },

    _startCountDown: function (battleField) {
        var cache = {m: 0, s: 0};
        this._lblTimeUp.setColor(cc.color.WHITE);
        this._lblTimeUp.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(function () {
            var remain = this.updateBattleDurationString(battleField.getBattleDurationInMs(), cache);
            this.startTimeWarning(remain);
        }.bind(this))]).repeatForever());
    },

    pauseClock: function () {
        this._lblTimeUp.pause();
    },

    resumeClock: function () {
        this._lblTimeUp.resume();
    },

    _hookupBattleFieldEvent: function (battleField) {
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_READY, function (data) {
            this.updateBattleDurationString(battleField.getBattleDurationInMs());
            this._startCountDown(battleField);
            var setting = mc.storage.readSetting();
            var scaleTime = mc.const.BATTLE_SCALE_TIME_BY_SPEED[setting.xSpeedBattle];
            scaleTime && battleField.setTimeScale(scaleTime);
        }.bind(this));
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function (data) {
            this._lblTimeUp.stopAllActions();
            var currPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
            if( currPartInBattle && currPartInBattle.getCurrentRoundData && currPartInBattle.getNumberOfRound ){
                if( !currPartInBattle.isInLastRound() ){
                    this.runAction(cc.sequence([cc.delayTime(0.6),cc.callFunc(function(){
                        this.setRound(currPartInBattle.getCurrentRoundIndex() + 1,currPartInBattle.getNumberOfRound());
                    }.bind(this))]));
                }
            }
        }.bind(this));
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_ENTER, function (data) {
            var creature = data.creature;
            if (creature.isEnableAvatar()) {
                if (!this._mapPlayerHeroAvtByBattleId[creature.battleId]) {
                    // setup the fake widget for dragging item.
                    var fakeChilds = this._nodeFakeBattle.getChildren();
                    for (var i = 0; i < fakeChilds.length; i++) {
                        if (!fakeChilds[i].getUserData()) {
                            fakeChilds[i].setUserData(creature);
                            this._mapFakePlayerWidgetByBattleId[creature.battleId] = fakeChilds[i];
                            break;
                        }
                    }

                    //set up the battle avatar.
                    var avt = new mc.BattleHeroAvatarView(creature, function (gause, creature) {
                        creature.requestDoUltimateAction();
                    });
                    this._mapPlayerHeroAvtByBattleId[creature.battleId] = avt;
                    avt.setEnableBar(!battleField.isAuto());
                    var allBattleAvt = this._layoutAvt.getChildren();
                    for (var i = 0; i < allBattleAvt.length; i++) {
                        var view = allBattleAvt[i];
                        if (!(view instanceof mc.BattleHeroAvatarView)) {
                            avt.x = view.x;
                            avt.y = view.y;
                            this._layoutAvt.addChild(avt);
                            this.registerDragAbleItem();
                            view.removeFromParent();
                            break;
                        }
                    }
                }
                else {
                    var heroAvtView = this._mapPlayerHeroAvtByBattleId[creature.battleId];
                    if (heroAvtView) {
                        heroAvtView.changePercentHp();
                        heroAvtView.changePercentMp();
                    }
                }
            }
            else {
                if (!this._mapOpponentGauseByBattleId[creature.battleId]) {
                    var gause = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_LARGE_HP);
                    gause.addCreatureDecorator(creature);
                    gause.setShowValueLabel(false);
                    gause.setUserData(creature);
                    gause.setCurrentProgressValue(creature.getHP(), creature.getTotalMaxHp());
                    gause.setVisible(false);
                    this._mapOpponentGauseByBattleId[creature.battleId] = gause;
                    this._monsterPos.addChild(gause);

                }
            }
        }.bind(this));
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_EXIT, function (data) {
            var creature = data.creature;
            if (this._mapOpponentGauseByBattleId[creature.battleId]) {
                this._mapOpponentGauseByBattleId[creature.battleId].removeFromParent();
                this._mapOpponentGauseByBattleId[creature.battleId] = null;
            }
        }.bind(this));
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_SETUP_FORMATION, function (data) {
            var allBattleAvt = this._layoutAvt.getChildren();
            for (var i = 0; i < allBattleAvt.length; i++) {
                var avtView_1 = allBattleAvt[i];
                var creature_1 = allBattleAvt[i].getUserData();
                for (var a = 0; a < allBattleAvt.length; a++) {
                    var avtView_2 = allBattleAvt[a];
                    var creature_2 = allBattleAvt[a].getUserData();
                    if (creature_1.indexFormationPosition > creature_2.indexFormationPosition) {
                        var tx = avtView_1.x;
                        var ty = avtView_1.y;
                        avtView_1.x = avtView_2.x;
                        avtView_1.y = avtView_2.y;
                        avtView_2.x = tx;
                        avtView_2.y = ty;
                    }
                }
            }
            var currPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
            if( currPartInBattle && currPartInBattle.getCurrentRoundData && currPartInBattle.getNumberOfRound ){
                this.setRound(currPartInBattle.getCurrentRoundIndex() + 1,currPartInBattle.getNumberOfRound());
            }
        }.bind(this));
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_HP, function (data) {
            var creature = data.creature;
            var heroAvtView = this._mapPlayerHeroAvtByBattleId[creature.battleId];
            if (heroAvtView) {
                heroAvtView.changePercentHp();
            }
            var monsGauseView = this._mapOpponentGauseByBattleId[creature.battleId];
            if (monsGauseView) {
                for (var battleId in this._mapOpponentGauseByBattleId) {
                    if (this._mapOpponentGauseByBattleId[battleId]) {
                        this._mapOpponentGauseByBattleId[battleId].setVisible(false);
                    }
                }
                monsGauseView.setVisible(true);
                monsGauseView.setCurrentProgressValue(creature.getHP(), creature.getTotalMaxHp(), true);
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_MP, function (data) {
            var creature = data.creature;
            var heroAvtView = this._mapPlayerHeroAvtByBattleId[creature.battleId];
            if (heroAvtView) {
                heroAvtView.changePercentMp();
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_DEAD, function (data) {
            var creature = data.creature;
            var heroAvtView = this._mapPlayerHeroAvtByBattleId[creature.battleId];
            if (heroAvtView) {
                this.registerDragAbleItem();
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_REVIVE, function (data) {
            var creature = data.creature;
            var heroAvtView = this._mapPlayerHeroAvtByBattleId[creature.battleId];
            if (heroAvtView) {
                heroAvtView.markReviving();
                this.registerDragAbleItem();
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_COUNT_TURN, function (data) {
            var arrItemSlot = this._arrItemSlot;
            for (var i = 0; i < arrItemSlot.length; i++) {
                arrItemSlot[i].countDown();
            }
        }.bind(this));

        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_CHANGE_MODE, function (data) {
            var isAuto = data.data;
            if (isAuto) {
                this._btnAuto.loadTexture("button/Manual.png", ccui.Widget.PLIST_TEXTURE);
                this._lblAuto.setColor(mc.color.GREEN_NORMAL);
            }
            else {
                this._btnAuto.loadTexture("button/Auto.png", ccui.Widget.PLIST_TEXTURE);
                this._lblAuto.setColor(mc.color.WHITE_NORMAL);
            }
            for (var battleId in this._mapPlayerHeroAvtByBattleId) {
                this._mapPlayerHeroAvtByBattleId[battleId].setEnableBar(!isAuto);
            }
        }.bind(this));
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_ACTIVE_BUFF, function (data) {
            if (data.data.usingByItem) {
                var skill = data.data.skill;
                var buffType = data.data.buffType;
                var value = data.data.value;
                var defender = data.creature;
                var avtView = this._mapPlayerHeroAvtByBattleId[defender.battleId];
                if (buffType === mc.const.BUFF_TYPE_HEAL ||
                    buffType === mc.const.BUFF_TYPE_HPPORTION) {
                    this.showBuffText(avtView, value, "hp");
                    this.showSpineStatsEffect(avtView, 'hp');
                }
                else if (buffType === mc.const.BUFF_TYPE_REMOVAL) {
                    this.showSpineStatsEffect(avtView, 'removal', true);
                }
                else if (buffType === mc.const.BUFF_TYPE_HPSHIELD ||
                    buffType === mc.const.BUFF_TYPE_MAGSHIELD) {
                    this.showBuffText(avtView, value, "shd");
                }
            }
        }.bind(this));
        battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_ADD_STATUS_EFFECT, function (data) {
            var creature = data.creature;
            var statusEffect = data.data;
            var avtView = this._mapPlayerHeroAvtByBattleId[creature.battleId];
            if (statusEffect && avtView && !statusEffect.getOwnerId()) {
                if (statusEffect.getEffectTimes() > 0 && statusEffect instanceof mc.StatsEffect) {
                    var attributeInfo = statusEffect.getAttributeInfo();
                    if (attributeInfo) {
                        this.showBuffText(avtView, attributeInfo.valueAttr, attributeInfo.keyAttr);
                    }
                }
            }
        }.bind(this));
    },

    showSpineStatsEffect: function (avtView, key, isDeBuff) {
        key = key.toUpperCase();
        var url = "res/spine/battle_effect/" + (!isDeBuff ? "hitBuffStats" : "hitDeBuffStats");
        var statsEffect = sp.SkeletonAnimation.createWithJsonFile(url + ".json", url + ".atlas", mc.const.SPINE_SCALE);
        statsEffect.x = avtView.width * 0.5;
        statsEffect.y = avtView.height * 0.25;
        if (key === "REMOVAL") {
            statsEffect.setSkin(key);
        }
        else {
            statsEffect.setSkin(!isDeBuff ? key : "DE" + key);
        }
        statsEffect.setAnimation(0, !isDeBuff ? "hitBuffStats" : "hitDeBuffStats", false);
        statsEffect.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 0) {
                statsEffect.runAction(cc.removeSelf());
            }
        }.bind(this));
        avtView.addChild(statsEffect);
    },

    showBuffText: function (avtView, buffValue, keyAttribute) {
        var dy = mc.BattleViewRefactor.DY_HIT_EFFECT;
        var type = mc.ColorNumberView.TYPE_NUM_PLUS_ATTRIBUTE;
        if (buffValue < 0) {
            type = mc.ColorNumberView.TYPE_NUM_MINUS_ATTRIBUTE;
        }
        if (keyAttribute === 'hp') {
            keyAttribute = '';
            type = mc.ColorNumberView.TYPE_NUM_HP_HEAL;
        }
        var str = buffValue > 0 ? "+" : "-";
        str += Math.abs(buffValue) + keyAttribute;
        var colorNumberView = new mc.ColorNumberView();
        colorNumberView.setTypeNumber(type, str);
        colorNumberView.x = avtView.x + avtView.width * 0.45;
        colorNumberView.y = avtView.y;
        if (!avtView._buffCount) {
            avtView._buffCount = 0;
        }
        avtView._buffCount++;
        var tBuff = (avtView._buffCount - 1) * 0.35;
        var tMove = 0.75;
        colorNumberView.setVisible(false);
        colorNumberView.runAction(cc.sequence([cc.delayTime(tBuff), cc.callFunc(function (colorNumberView) {
            colorNumberView.setVisible(true);
        }, colorNumberView), cc.moveBy(tMove, 0, dy), cc.callFunc(function (attackText, ownerView) {
            ownerView._buffCount--;
            ownerView._buffCount < 0 && (ownerView._buffCount = 0);
        }, colorNumberView, avtView), cc.removeSelf()]));
        avtView.getParent().addChild(colorNumberView);
    },

    collectZen: function (arrZenView, dropZen, callback) {
        var xLbl = this._lblZen.x;
        var yLbl = this._lblZen.y;
        var delayTime = 1.5;
        var flyTime = 0.3;
        for (var i = 0; i < arrZenView.length; i++) {
            var zenView = arrZenView[i];
            zenView.runAction(cc.sequence([cc.delayTime(delayTime), cc.moveTo(flyTime, xLbl, yLbl), cc.removeSelf()]));
            if (zenView._shadowView) {
                zenView._shadowView.removeFromParent();
            }
        }

        var currZen = this._lblZen.getUserData();
        this._lblZen.setUserData(currZen + dropZen);
        this.runAction(cc.sequence([cc.delayTime(delayTime + flyTime), cc.callFunc(function () {
            this._lblZen.stopAllActions();
            this._lblZen.runAction(cc.countText(1.0, currZen, currZen + dropZen).setExtraText("x "));
            callback && callback();
        }.bind(this))]));
    },

    startTimeWarning: function (remainInMs) {
        if (Math.floor(remainInMs / 1000) <= 10) {
            if (!this._isStartTimeWarning) {
                this._isStartTimeWarning = true;
                this._lblTimeUp.setColor(mc.color.RED);
                this._lblTimeUp.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function () {
                    this._iconTime.runAction(cc.shake(0.2));
                    bb.sound.playEffect(res.sound_ui_battle_time_warnning);
                }.bind(this))]).repeatForever());
            }
        }
    },

    updateBattleDurationString: function (dTime, cache) {
        var partInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        dTime = dTime || 0;
        var delta = partInBattle.getMaxBattleDurationInMs() - dTime;
        delta < 0 && (delta = 0);
        var time = bb.utility.toTimeFromMs(delta, cache);
        var minute = time.m < 10 ? ("0" + time.m) : ("" + time.m);
        var second = time.s < 10 ? ("0" + time.s) : ("" + time.s);
        this._lblTimeUp.setString(minute + ":" + second);
        return delta;
    },

    getArrayBattleHeroAvatarWidget: function () {
        return bb.utility.mapToArray(this._mapPlayerHeroAvtByBattleId);
    },

    getArrayBattleSlotItem: function () {
        return this._arrItemSlot;
    },

    getButtonAuto: function () {
        return this._btnAuto;
    },

    registerDragAbleItem: function () {
        var allHeroAvatar = bb.utility.mapToArray(this._mapPlayerHeroAvtByBattleId);
        var allFakeWidget = bb.utility.mapToArray(this._mapFakePlayerWidgetByBattleId);
        var allHeroWidget = bb.collection.arrayAppendArray(allHeroAvatar, allFakeWidget);
        var _getArrActiveHeroWidget = function () {
            var arrHeroAvatar = bb.utility.arrayFilter(allHeroWidget, function (heroAvt) {
                var creature = heroAvt.getUserData();
                return !creature.isDead();
            }.bind(this));
            return arrHeroAvatar;
        }.bind(this);
        var _funcDrag = function (slotItemView, dragIndex) {
            var consumeInfo = slotItemView.getUserData();
            if (dragIndex >= 0) {
                var consumeId = mc.ItemStock.getItemId(consumeInfo);
                var currPartInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
                if (currPartInBattle) {
                    currPartInBattle.updateQuantityUsingByItemId(consumeId, 1);
                }

                var heroWidget = _getArrActiveHeroWidget()[dragIndex];
                if (heroWidget) {
                    var creature = heroWidget.getUserData();
                    creature.doUsingItem(consumeInfo);
                }
                slotItemView.useItem(currPartInBattle.getQuantityUsedByItemId(consumeId));
            }
        }.bind(this);

        for (var i = 0; i < this._arrItemSlot.length; i++) {
            var slotItemView = this._arrItemSlot[i];
            slotItemView.registerDragAble(_getArrActiveHeroWidget(), _funcDrag);
        }
    },

    _loadConsumableItem: function () {
        var layoutSlotItem = this._panelChars.getChildByName("layoutSlotItem");
        layoutSlotItem && (layoutSlotItem.removeFromParent());

        this._arrItemSlot = [];
        var partInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        var mapConsumableIdBySlotId = mc.GameData.itemStock.getMapConsumableIdBySlotId();

        var arrConsumable = [];
        for (var slotId in mapConsumableIdBySlotId) {
            if (mapConsumableIdBySlotId[slotId]) {
                arrConsumable.push(mc.GameData.itemStock.getItemById(mapConsumableIdBySlotId[slotId]));
            }
        }
        layoutSlotItem = bb.layout.linear(bb.collection.createArray(4, function (index) {
            var consumeInfo = null;
            var slotView = null;
            if (index < arrConsumable.length) {
                consumeInfo = arrConsumable[index];
            }
            if (consumeInfo && partInBattle.isUsedItem()) {
                var consumeId = mc.ItemStock.getItemId(consumeInfo);
                slotView = new mc.BattleSlotItem(consumeInfo, partInBattle.getQuantityUsedByItemId(consumeId), partInBattle.getCountDownUsedByItemId(consumeId));
            }
            else {
                slotView = new mc.BattleSlotItem();
                if (partInBattle.isUsedItem()) {
                    var brk = slotView.getChildByName("brk");
                    if (brk) {
                        brk.registerTouchEvent(function () {
                            new mc.PickBattleConsumableDialog(this.battleView, function (isChange) {
                                if (isChange) {
                                    this._loadConsumableItem();
                                }
                            }.bind(this)).show();
                        }.bind(this));
                    }
                }
                else {
                    slotView.setEnableSlot(false);
                }
            }
            this._arrItemSlot.push(slotView);
            return slotView;
        }.bind(this)), 7);
        layoutSlotItem.setName("layoutSlotItem");
        layoutSlotItem.x = this._panelChars.width * 0.5;
        layoutSlotItem.y = this._panelChars.height * 0.15;
        this._panelChars.addChild(layoutSlotItem);
        this.registerDragAbleItem();
    }

});