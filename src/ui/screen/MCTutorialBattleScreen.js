/**
 */
mc.BackgroundStoryScreen = bb.Screen.extend({

    getPreLoadURL:function(){
        var arrRes = [];
        arrRes.push(res.spine_ui_storyline_json);
        arrRes.push(res.spine_ui_storyline_png);
        !cc.sys.isNative && arrRes.push(res.spine_ui_storyline_atlas);
        arrRes.push(res.sound_bgm_story1);
        return arrRes;
    },

    initResources:function(){
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.button_plist);

        bb.sound.playMusic(res.sound_bgm_story1);
        var spineStory = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_storyline_json,res.spine_ui_storyline_atlas, 1.0);
        spineStory.setAnimation(1,"story1",false);
        spineStory.x = cc.winSize.width*0.5;
        spineStory.y = cc.winSize.height*0.5;
        spineStory.setCompleteListener(function (trackEntry) {
            var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
            if (trackEntry.trackIndex === 1) {
                spineStory.clearTrack(trackEntry.trackIndex);
                _showTutorialScreen();
            }
        }.bind(this));
        this.addChild(spineStory);

        var btnSkip = new ccui.ImageView("button/btn_skip.png",ccui.Widget.PLIST_TEXTURE);
        btnSkip.setScaleX(1.3);
        var lblRedeem = btnSkip.setString(mc.dictionary.getGUIString("lblSkip"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblRedeem.x = btnSkip.width * 0.53;
        lblRedeem.y = lblRedeem.y - 5;
        lblRedeem.setScale(0.6);
        btnSkip.registerTouchEvent(function(){
            _showTutorialScreen();
        }.bind(this));
        btnSkip.x = cc.winSize.width - 350;
        btnSkip.y = cc.winSize.height * 0.95;
        btnSkip.setLocalZOrder(5);
        this.addChild(btnSkip);
        cc.log("************* show skip all 2");

        var btnSkipAll = btnSkip.clone();
        var lblRedeem1 = btnSkipAll.setString("Skip all", res.font_UTMBienvenue_stroke_32_export_fnt);
        lblRedeem1.x = btnSkip.width * 0.63;
        lblRedeem1.y = lblRedeem1.y - 5;
        lblRedeem1.setScale(0.6);
        btnSkipAll.x = btnSkip.x + 230;
        btnSkipAll.setLocalZOrder(999);

        btnSkipAll.registerTouchEvent(function(){
            mc.GameData.settingManager.skipAllTutorial();
            mc.GameData.settingManager.saveAll();
            mc.GameData.settingManager.flush(function(){
                new mc.MainScreen().show();
            });
        }.bind(this));
        this.addChild(btnSkipAll);

        var _showTutorialScreen = function(){
            new mc.TutorialBattleScreen().show();
        };
    }

});

mc.TutorialBattleScreen = bb.Screen.extend({

    getPreLoadURL:function(){
        var battleForReload = new mc.AbstractInBattle();
        var json1 = {
            "your_team" :{
                "battleTeam":[-1,-1,1,2,3],
                "leaderIndex":0,
                "heroes":[
                    {"id":1,"index":mc.const.TUTORIAL_CHARACTER_ELF,level:100,"classGroup":300,element:"Earth","rank":1,"atk":4000,"hp":12200,"mpRec":50,"maxMp":200,"def":80,"res":100,"exp":0,"maxExp":200,spd:100,range:false},
                    {"id":2,"index":mc.const.TUTORIAL_CHARACTER_DRAGON,level:100,"classGroup":100,element:"Fire","rank":1,"atk":5500,"hp":20200,"mpRec":50,"maxMp":800,"def":80,"res":100,"exp":0,"maxExp":200,spd:90,range:false},
                    {"id":3,"index":mc.const.TUTORIAL_CHARACTER_WIZARD,level:100,"classGroup":100,element:"Fire","rank":1,"atk":5500,"hp":20200,"mpRec":50,"maxMp":800,"def":80,"res":100,"exp":0,"maxExp":200,spd:90,range:false}
                ]
            },
            "opponent" : {
                "battleTeam":[3,4],
                "leaderIndex":0,
                "heroes":[
                    {"id":3,"index":mc.const.TUTORIAL_MONSTER_1,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1500,"mp":0,"hp":4400,"def":380,"res":370,"exp":0,"maxExp":200,spd:50,range:false},
                    {"id":4,"index":mc.const.TUTORIAL_MONSTER_2,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1500,"mp":0,"hp":4400,"def":380,"res":370,"exp":0,"maxExp":200,spd:40,range:false},
                    {"id":5,"index":mc.const.TUTORIAL_MONSTER_3,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1500,"mp":0,"hp":4400,"def":380,"res":370,"exp":0,"maxExp":200,spd:40,range:false},
                    {"id":6,"index":mc.const.TUTORIAL_MONSTER_KUNDUN,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1500,"mp":0,"hp":4400,"def":380,"res":370,"exp":0,"maxExp":200,spd:40,range:false}
                ]
            }
        };
        battleForReload.setBattleData(json1);
        battleForReload.setBackgroundURL(res.brk_losttower2_png);
        var arrRes = mc.resource.getBattlePreLoadURLs(battleForReload);
        arrRes.push(mc.TutorialBattleScreen.SOUND_KUNDUN_LAUGH);
        arrRes.push(res.sound_ui_battle_bossarlet);
        arrRes.push(res.spine_ui_boss_warning_json);
        arrRes.push(res.spine_ui_boss_warning_png);
        !cc.sys.isNative && arrRes.push(res.spine_ui_boss_warning_atlas);
        arrRes.push(res.spine_ui_storyline_json);
        arrRes.push(res.spine_ui_storyline_png);
        !cc.sys.isNative && arrRes.push(res.spine_ui_storyline_atlas);
        arrRes.push(res.sound_bgm_story2);
        var arrBattleRes = mc.resource.getBattlePreLoadURLs(battleForReload);
        arrRes = bb.collection.arrayAppendArray(arrRes,arrBattleRes);
        return arrRes;

    },

    ctor:function(){
        this._super();
        mc.TutorialBattleScreen.SOUND_KUNDUN_LAUGH = "res/sound/effect/kundun_l.mp3";
        var setting = mc.storage.readSetting();
        setting.auto_battle = false;
        mc.storage.saveSetting();

        cc.spriteFrameCache.addSpriteFrames(res.text_plist);
        cc.spriteFrameCache.addSpriteFrames(res.bar_plist);
        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);
        cc.spriteFrameCache.addSpriteFrames(res.sprite_plist);

        bb.sound.preloadEffect(mc.TutorialBattleScreen.SOUND_KUNDUN_LAUGH);
        bb.sound.preloadEffect(res.sound_ui_battle_bossarlet);

        var battle1 = new mc.AbstractInBattle();
        var json1 = {
            "your_team" :{
                "battleTeam":[-1,-1,1,2,3],
                "leaderIndex":0,
                "heroes":[
                    {"id":1,"index":mc.const.TUTORIAL_CHARACTER_ELF,level:100,"classGroup":300,element:"Earth","rank":1,"atk":4000,"hp":12200,"mpRec":50,"maxMp":200,"def":80,"res":100,"exp":0,"maxExp":200,spd:100,range:false},
                    {"id":2,"index":mc.const.TUTORIAL_CHARACTER_DRAGON,level:100,"classGroup":100,element:"Fire","rank":1,"atk":5500,"hp":20200,"mpRec":50,"maxMp":500,"def":80,"res":100,"exp":0,"maxExp":200,spd:90,range:false}
                ]
            },
            "opponent" : {
                "battleTeam":[3,4],
                "leaderIndex":0,
                "heroes":[
                    {"id":3,"index":mc.const.TUTORIAL_MONSTER_1,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1500,"mp":0,"hp":4400,"def":380,"res":370,"exp":0,"maxExp":200,spd:50,range:false},
                    {"id":4,"index":mc.const.TUTORIAL_MONSTER_1,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1500,"mp":0,"hp":4400,"def":380,"res":370,"exp":0,"maxExp":200,spd:40,range:false}
                ]
            }
        };
        battle1.setBattleData(json1);
        battle1.isUsedItem = function(){
            return false;
        };
        battle1.setBackgroundURL(res.brk_losttower2_png);

        var battle2 = new mc.AbstractInBattle();
        var json2 = {
            "your_team" :{
                "battleTeam":[-1,-1,1,2,3],
                "leaderIndex":0,
                "heroes":[
                    {"id":1,"index":mc.const.TUTORIAL_CHARACTER_ELF,level:100,"classGroup":300,element:"Earth","rank":1,"atk":4000,"hp":12200,"mpRec":50,"maxMp":250,"def":80,"res":100,spd:100,"exp":0,"maxExp":200,range:false},
                    {"id":2,"index":mc.const.TUTORIAL_CHARACTER_DRAGON,level:100,"classGroup":100,element:"Fire","rank":1,"atk":5500,"hp":17200,"mpRec":50,"maxMp":500,"def":80,"res":100,spd:100,"exp":0,"maxExp":200,range:false}
                ]
            },
            "opponent" : {
                "battleTeam":[3,4,5,6,-1],
                "leaderIndex":0,
                "heroes":[
                    {"id":3,"index":mc.const.TUTORIAL_MONSTER_1,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1000,"mp":0,"hp":6200,"def":380,"res":370,spd:50,"exp":0,"maxExp":200,range:false},
                    {"id":4,"index":mc.const.TUTORIAL_MONSTER_1,level:50,"classGroup":100,element:"Dark","rank":1,"atk":1000,"mp":0,"hp":6200,"def":380,"res":370,spd:40,"exp":0,"maxExp":200,range:false},
                    {"id":5,"index":mc.const.TUTORIAL_MONSTER_2,level:60,"classGroup":100,element:"Dark","rank":1,"atk":1500,"mp":0,"hp":2800,"def":380,"res":370,spd:30,"exp":0,"maxExp":200,range:true},
                    {"id":6,"index":mc.const.TUTORIAL_MONSTER_3,level:60,"classGroup":100,element:"Dark","rank":1,"atk":2000,"mp":0,"hp":7200,"def":380,"res":370,spd:20,"exp":0,"maxExp":200,range:false}
                ]
            }
        };
        battle2.setBattleData(json2);
        battle2.isUsedItem = function(){
            return false;
        };
        battle2.setBackgroundURL(res.brk_losttower2_png);

        var battle3 = new mc.AbstractInBattle();
        var json3 = {
            "your_team" :{
                "battleTeam":[-1,-1,1,2,3],
                "leaderIndex":0,
                "heroes":[
                    {"id":1,"index":mc.const.TUTORIAL_CHARACTER_ELF,level:100,"classGroup":300,element:"Earth","rank":1,"atk":4000,"hp":12200,"mpRec":100,"maxMp":1000,"def":80,"res":100,spd:100,"exp":0,"maxExp":200,range:false},
                    {"id":2,"index":mc.const.TUTORIAL_CHARACTER_DRAGON,level:100,"classGroup":100,element:"Fire","rank":1,"atk":5500,"hp":25200,"mpRec":50,"maxMp":1000,"def":80,"res":100,spd:100,"exp":0,"maxExp":200,range:false}
                ]
            },
            "opponent" : {
                "battleTeam":[3],
                "leaderIndex":0,
                "heroes":[
                    {"id":3,"index":mc.const.TUTORIAL_MONSTER_KUNDUN,level:300,"classGroup":100,element:"Dark","rank":1,"atk":7500,mag:10000,"hp":1000000,"mpRec":80,"maxMp":1000,"def":1000,"res":370,spd:100,"exp":0,"maxExp":200,range:true,"skillList": [
                        {
                            "index": 7800,
                            "level": 1
                        }
                    ]}
                ]
            }
        };
        battle3.setBattleData(json3);
        battle3.isUsedItem = function(){
            return false;
        };
        battle3.setBackgroundURL(res.brk_losttower2_png);

        mc.GameData.teamFormationManager.setupTutorialTeamFormation(json1["your_team"]);
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_TUTORIAL);
        this._arrBattleTutorial = [battle1,battle2,battle3];
        this._currBattle = 0;
    },

    initResources: function () {
        this._super();

        var ID_CHARACTER_KUNDUN = 9999;
        var ID_EFFECT_DISABLE = 74;

        var screen = this;
        var _showBattle = function (isBegin) {

            // load the kundun and wizard spine.
            var spine = new mc.CreatureSpine(ID_CHARACTER_KUNDUN);
            spine = new mc.CreatureSpine(mc.const.TUTORIAL_CHARACTER_WIZARD);
            //this._currBattle = 2;
            //mc.GameData.storyManager.setStoryIndex(4);
            //mc.GameData.tutorialManager.setTutorialIndex(2);
            var battleTutorial = this._arrBattleTutorial[this._currBattle];
            mc.GameData.playerInfo.setCurrentPartInBattle(battleTutorial);
            var battleView = this._battleView = battleTutorial.createBattleViewRefactor();
            var arrCreatureIndex = battleTutorial.getArrayAllCreatureIndex();
            arrCreatureIndex.push(ID_CHARACTER_KUNDUN);
            arrCreatureIndex.push(mc.const.TUTORIAL_CHARACTER_WIZARD);
            battleView.preLoadBattleEffect(arrCreatureIndex);

            cc.log("preLoadBattleEffect" + arrCreatureIndex.length);
            battleView.showTempBlackPanel(!isBegin);
            this.addChild(battleView);
            battleView.getControlBoardView().getButtonAuto().setGray(true);

            var battleField = this._battleView.getBattleField();
            battleField.setAuto(false);
            var mapTriggerDone = {};
            mapTriggerDone[mc.const.TUTORIAL_CHARACTER_DRAGON] = false;
            mapTriggerDone[mc.const.TUTORIAL_CHARACTER_ELF] = false;
            if( this._currBattle === 0 || this._currBattle === 1 ){
                battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_CHANGE_MP,function(data){
                    var mapCreatureById = bb.utility.arrayToMap(battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT),function(creature){
                        return creature.getServerId();
                    });
                    var creature = data.creature;
                    if( creature.isFullMp() && mapCreatureById[creature.getServerId()] && !mapTriggerDone[creature.getResourceId()] ){
                        mapTriggerDone[creature.getResourceId()] = true;
                        var storyTrigger = mc.GameData.storyManager.getStoryTrigger(mc.StoryManager.SCREEN_TUTORIAL_BATTLE);
                        if( storyTrigger ) {
                            if (storyTrigger.trigger === mc.StoryManager.TRIGGER_CREATURE_FULL_MANA) {
                                screen.enableInput(false);
                                this.runAction(cc.sequence([cc.delayTime(0.6),cc.callFunc(function(){
                                    var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_TUTORIAL_BATTLE);
                                    if( tutorialTrigger ){
                                        var arrHeroAvtWidget = this._battleView.getControlBoardView().getArrayBattleHeroAvatarWidget();
                                        if( tutorialTrigger.trigger === mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_1 &&
                                            creature.getResourceId() === mc.const.TUTORIAL_CHARACTER_ELF){
                                            this._battleView.pauseAll();
                                            screen.enableInput(true);
                                            new mc.StoryTalkingDialog().setCompleteCallback(function(){
                                                new mc.LayerTutorial(tutorialTrigger).setTargetWidget(arrHeroAvtWidget[0]).setCallback(function(){
                                                    this._battleView.resumeAll();
                                                }.bind(this)).setEnableSkip(false).show();
                                            }.bind(this)).show();
                                        }
                                        else if ( tutorialTrigger.trigger === mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_2 &&
                                            creature.getResourceId() === mc.const.TUTORIAL_CHARACTER_DRAGON){
                                            this._battleView.pauseAll();
                                            screen.enableInput(true);
                                            new mc.StoryTalkingDialog().setCompleteCallback(function(){
                                                new mc.LayerTutorial(tutorialTrigger).setTargetWidget(arrHeroAvtWidget[1]).setCallback(function(){
                                                    this._battleView.resumeAll();
                                                }.bind(this)).setEnableSkip(false).show();
                                            }.bind(this)).show();
                                        }
                                    }

                                }.bind(this))]));
                            }
                        }
                    }
                }.bind(this));
                battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_END, function () {
                    if( this._currBattle === 2 ){
                        var arrCreatureView = this._battleView.getArrayCreatureView(mc.const.TEAM_LEFT);
                        for(var i = 0; i < arrCreatureView.length; i++ ){
                            arrCreatureView[i].cheer();
                        }
                        bb.sound.playEffect(mc.TutorialBattleScreen.SOUND_KUNDUN_LAUGH);
                        var storyTrigger = mc.GameData.storyManager.getStoryTrigger(mc.StoryManager.SCREEN_TUTORIAL_BATTLE);
                        if( storyTrigger && storyTrigger.trigger === mc.StoryManager.TRIGGER_BATTLE_END ) {
                            this._showEndStory();
                        }
                        else{
                            screen._showDialogBattleEnd();
                        }
                    }
                    else{
                        var winGroupId = battleField.getWinningTeamId();
                        if (winGroupId === mc.const.TEAM_RIGHT) {
                            screen._currBattle++;
                            if (screen._currBattle >= screen._arrBattleTutorial.length || (mc.const.CHEAT_WIN_BATTLE_DURATION > 0)) {
                                screen._showDialogBattleEnd();
                            }
                            else {
                                var mapCreatureById = bb.utility.arrayToMap(battleField.getAllCreatureOfTeam(mc.const.TEAM_RIGHT),function(creature){
                                    return creature.getServerId();
                                });
                                var currBattle = this._arrBattleTutorial[this._currBattle-1];
                                var arrPlayerHeroInfo = currBattle.getBattleTeamPlayerInfo().arrCreatureInfo;
                                for(var i = 0; i < arrPlayerHeroInfo.length; i++ ){
                                    var creature = mapCreatureById[arrPlayerHeroInfo[i].serverId];
                                    arrPlayerHeroInfo[i].setCurrentHpPercent(creature.getHP()/creature.getTotalMaxHp());
                                    arrPlayerHeroInfo[i].setCurrentMpPercent(creature.getMp()/creature.getTotalMaxMp());
                                }
                                battleView.runTransitionAnimation(function () {
                                    var battleTutorial = this._arrBattleTutorial[this._currBattle];
                                    mc.GameData.playerInfo.setCurrentPartInBattle(battleTutorial);
                                    battleView.setupNewTeamGroup(mc.GameLogicFactory.createCreatureGroup(battleTutorial.getBattleTeamOpponentInfo()),mc.const.TEAM_LEFT);
                                    screen._showDialogBattleStart();
                                }.bind(this), "end");
                            }
                        }
                        else {
                            screen._showDialogBattleEnd();
                        }
                    }
                }.bind(this));

                var countTurn = 0;
                battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_COUNT_TURN,function(data){
                    if( this._currBattle === 2 ){
                        countTurn++;
                        if( countTurn >= 6 ){
                            var storyTrigger = mc.GameData.storyManager.getStoryTrigger(mc.StoryManager.SCREEN_TUTORIAL_BATTLE);
                            if( storyTrigger ) {
                                if( storyTrigger.trigger === mc.StoryManager.TRIGGER_BATTLE_FIELD_COUNT_TURN_3 && countTurn === 6){
                                    battleField.setWaiting(true);
                                    var creature = new mc.Creature();
                                    creature.setEnableInput(true);
                                    creature.setEnableAvatar(true);
                                    creature.setInfo(new mc.CreatureInfo().copyHeroInfo(
                                        {"id":4,"index":mc.const.TUTORIAL_CHARACTER_WIZARD,level:100,"classGroup":300,element:"Water","rank":1,"atk":2000,mag:3000,"hp":20200,"maxMp":200,"mpRec":50,"def":80,"rec":100,"exp":0,"maxExp":200}).setCurrentMpPercent(100));
                                    creature.setEffectPercentRate(100);
                                    battleField.addForeignCreature(creature,mc.const.TEAM_RIGHT,cc.p(cc.winSize.width*0.8,cc.winSize.height*0.5));
                                }
                            }
                        }
                    }
                }.bind(this));
                battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_ENTER,function(data){
                    if( this._currBattle === 2 ){
                        var creature = data.creature;
                        var isForeign = data.data;
                        if( isForeign ){
                            var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_TUTORIAL_BATTLE);
                            if( tutorialTrigger ){
                                var arrHeroAvtWidget = this._battleView.getControlBoardView().getArrayBattleHeroAvatarWidget();
                                if( tutorialTrigger.trigger === mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_3 ){
                                    this._battleView.pauseAll();
                                    screen.enableInput(true);
                                    new mc.StoryTalkingDialog().setCompleteCallback(function(){
                                        new mc.LayerTutorial(tutorialTrigger).setTargetWidget(arrHeroAvtWidget[2]).setCallback(function(){
                                            this._battleView.resumeAll();
                                            battleField.setWaiting(false);
                                        }.bind(this)).setEnableSkip(false).show();
                                    }.bind(this)).show();
                                }
                            }
                        }
                    }
                }.bind(this));
                var isTrigg = false;
                battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_CREATURE_REMOVE_STATUS_EFFECT,function(data){
                    if( this._currBattle === 2 ){
                        var creature = data.creature;
                        var effect = data.data;
                        if( creature.getResourceId() === ID_CHARACTER_KUNDUN &&
                            effect.getEffectId() === ID_EFFECT_DISABLE ){
                            var storyTrigger = mc.GameData.storyManager.getStoryTrigger(mc.StoryManager.SCREEN_TUTORIAL_BATTLE);
                            if( storyTrigger ) {
                                if( storyTrigger.trigger === mc.StoryManager.TRIGGER_CREATURE_DISABLE && !isTrigg){
                                    isTrigg = true;
                                    screen.enableInput(false);
                                    this.runAction(cc.sequence([cc.delayTime(0.5),cc.callFunc(function(){
                                        screen.enableInput(true);
                                        this._battleView.pauseAll();
                                        new mc.StoryTalkingDialog().setCompleteCallback(function(){
                                            this._battleView.resumeAll();
                                        }.bind(this)).show();
                                    }.bind(this))]));

                                }
                            }
                        }
                    }
                }.bind(this));
            }
            battleField.addBattleListener(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,function(data){
                this.showDialogPauseBattle();
            }.bind(this));

        }.bind(this);

        _showBattle(true);
    },

    _showEndStory:function(){
        var screen = this;
        this.runAction(cc.sequence([cc.delayTime(1.0),cc.callFunc(function(){
            var blackPanel = new ccui.Layout();
            blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            blackPanel.setBackGroundColor(cc.color.BLACK);
            blackPanel.opacity = 0;
            blackPanel.width = cc.winSize.width;
            blackPanel.height = cc.winSize.height;
            blackPanel.setTouchEnabled(true);
            blackPanel.runAction(cc.sequence([cc.fadeIn(1.5),cc.delayTime(0.5),cc.callFunc(function(){
                bb.sound.playMusic(res.sound_bgm_story2);
                var spineStory = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_storyline_json,res.spine_ui_storyline_atlas, 1.0);
                spineStory.setAnimation(1,"story2",false);
                spineStory.x = cc.winSize.width*0.5;
                spineStory.y = cc.winSize.height*0.5;
                spineStory.setCompleteListener(function (trackEntry) {
                    var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
                    if (trackEntry.trackIndex === 1) {
                        spineStory.clearTrack(trackEntry.trackIndex);
                        mc.GameData.settingManager.saveAll();
                        mc.GameData.settingManager.flush(function(){
                            new mc.SetPlayerNameDialog(function(){
                                new mc.MainScreen().show();
                            }).show();
                        });
                    }
                }.bind(this));
                blackPanel.addChild(spineStory);
                mc.GameData.storyManager.nextStory();
            }.bind(this))]));
            screen.addChild(blackPanel);
        }.bind(this))]));
    },

    _showDialogBattleEnd: function () {
        this._showEndStory();
    },

    _showDialogBattleStart: function () {
        var _start = function(){
            new mc.DialogBattleStart(this, function () {
                this._battleView.getBattleField().startToCombat();
            }.bind(this)).setBattleView(this._battleView).startAnimation().show();
        }.bind(this);

        var showStory = false;
        var storyTrigger = mc.GameData.storyManager.getStoryTrigger(mc.StoryManager.SCREEN_TUTORIAL_BATTLE);
        if( storyTrigger ){
            if( storyTrigger.trigger === mc.StoryManager.TRIGGER_SCREEN_START ){
                new mc.StoryTalkingDialog().setCompleteCallback(function(){
                    new mc.DialogBattleStart(this, function () {
                        this._battleView.getBattleField().startToCombat();
                    }.bind(this)).setBattleView(this._battleView).startAnimation().show();
                }.bind(this)).show();
                showStory = true;
            }
        }
        if( !showStory ){
            _start();
        }
    },

    isAMonsterBossRound:function(){
        return this._currBattle === this._arrBattleTutorial.length-1;
    },

    getCurrentRoundIndex:function(){
        return this._currBattle;
    },

    getNumberOfRound:function(){
        return this._arrBattleTutorial.length;
    },

    onScreenPause:function(){
        if( this._battleView && this._battleView.getBattleField() ){
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,undefined,true);
        }
    },

    onScreenShow: function () {
        this._showDialogBattleStart();
        bb.sound.playMusic(res.sound_bgm_battle_pve);
    },

    onScreenClose: function () {
        mc.GameData.playerInfo.setCurrentPartInBattle(null);
        mc.GameData.resultInBattle.clearData();
    },

    showDialogPauseBattle: function () {
        if( !this._battleView.getBattleField().isPausing() ){
            new mc.DialogPauseBattle(this._battleView).show();
        }
    },

    onBackEvent: function () {
        if( this._battleView && this._battleView.getBattleField() ){
            this._battleView.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_BATTLEFIELD_PAUSE,undefined,true);
        }
    }

});