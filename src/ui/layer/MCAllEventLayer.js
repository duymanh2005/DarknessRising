/**
 * Created by long.nguyen on 4/5/2018.
 */
mc.AllEventLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();

        var self = this;
        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_5_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_6_plist);
        cc.spriteFrameCache.addSpriteFrames(res.bar_plist);

        var root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelTop = rootMap["panelTop"];
        var nodeBrk = rootMap["nodeBrk"];
        var panelMiddle = this._panelMidel = rootMap["panelMiddle"];
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblEvents"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Event.png", ccui.Widget.LOCAL_TEXTURE));

        var arrFunctionCode = [
            mc.const.FUNCTION_DAILY_CHALLENGE,
            mc.const.FUNCTION_DAILY_CHALLENGE,
            mc.const.FUNCTION_DAILY_CHALLENGE,
            mc.const.FUNCTION_CHAOS_CASTLE,
            mc.const.FUNCTION_KALIMA,
            mc.const.FUNCTION_GUILD,
            mc.const.FUNCTION_BLOOD_CASTLE,
            mc.const.FUNCTION_ILLUSION_TOWER,
            mc.const.FUNCTION_DEVIL_SQUARE
        ];

        var arrObj = [
            {
                path: [res.spine_ui_IconGoldenDragon_json, res.spine_ui_IconEventList_atlas],
                animation: "IconGoldenDragon",
                label: mc.dictionary.getGUIString("lblGoldenDragon"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[0], function () {
                        mc.GameData.guiState.setCurrentChallengeGroupIndex(0);
                        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST);
                    }.bind(this));
                }.bind(this)
            },
            {
                path: [res.spine_ui_IconWhiteWizard_json, res.spine_ui_IconEventList_atlas],
                animation: "IconWhiteWizard",
                label: mc.dictionary.getGUIString("lblWhiteWizard"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[1], function () {
                        mc.GameData.guiState.setCurrentChallengeGroupIndex(1);
                        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST);
                    }.bind(this));
                }.bind(this)
            },
            {
                path: [res.spine_ui_IconMoonRabbit_json, res.spine_ui_IconEventList_atlas],
                animation: "IconMoonRabbit",
                label: mc.dictionary.getGUIString("lblMoonRabbit"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[2], function () {
                        mc.GameData.guiState.setCurrentChallengeGroupIndex(2);
                        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST);
                    }.bind(this));
                }.bind(this)
            },
            {
                path: [res.spine_ui_IconChaosCastle_json, res.spine_ui_IconEventList_atlas],
                animation: "IconChaosCastle",
                label: mc.dictionary.getGUIString("lblChaosCastle"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[3], function () {
                        mc.GUIFactory.showChaosCastleScreen();
                    }.bind(this));
                }.bind(this)
            },
            {
                path: [res.spine_ui_IconWorldBoss_json, res.spine_ui_IconEventList_atlas],
                animation: "IconWorldBoss",
                label: mc.dictionary.getGUIString("lblKalima"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[4], function () {
                        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS);
                    }.bind(this));
                }.bind(this)
            }
            //fixme Chưa có event tạm tắt.
            ,
            /*      {
                      path: [res.spine_ui_IconSeasonEvent_json, res.spine_ui_IconSeasonEvent_atlas],
                      animation: "IconSeasonEvent",
                      label: mc.dictionary.getGUIString("lblEvents"),
                      callback: function () {
                          mc.view_utility.confirmFunction(arrFunctionCode[5], function () {
                              var eventDuration = mc.GameData.dynamicDailyEvent.getEventDuration();
                              if (eventDuration) {
                                  this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SEASON_EVENT);
                              } else {
                                  mc.view_utility.showSuggestText(mc.dictionary.getGUIString("No Event Active now"));
                              }
                          }.bind(this));
                      }.bind(this)
                  },*/
            {
                path: [res.spine_ui_IconClanHall_json, res.spine_ui_IconEventList_atlas],
                animation: "IconClanHall",
                label: mc.dictionary.getGUIString("lblGuild"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[5], function () {
                        if (mc.GameData.guildManager.getGuildInfo()) {
                            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_MANAGER);
                        } else {
                            mc.protocol.checkGuildStatus(function (result) {
                                if (result) {
                                    if (mc.GameData.guildManager.getGuildInfo()) {
                                        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_MANAGER);
                                    } else {
                                        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_SEARCH);
                                    }
                                } else {
                                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_SEARCH);
                                }
                            }.bind(this));
                        }
                    }.bind(this));
                }.bind(this)
            },
            {
                path: [res.spine_ui_IconBloodCastle_json, res.spine_ui_IconEventList_atlas],
                animation: "IconBloodCastle",
                label: mc.dictionary.getGUIString("lblBloodCastle"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[6], function () {
                        self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_BLOOD_CASTLE_STAGE_LIST);
                        var loadingId = mc.view_utility.showLoadingDialog();
                        mc.protocol.getBloodCastleInfo(function (result) {
                            mc.view_utility.hideLoadingDialogById(loadingId);
                            if (result) {
                                self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_BLOOD_CASTLE_STAGE_LIST);
                            }
                        });

                    }.bind(this));
                }.bind(this)
            },
            {
                path: [res.spine_ui_IconIllusionTower_json, res.spine_ui_IconEventList_atlas],
                animation: "IconIllusionTower",
                label: mc.dictionary.getGUIString("lblIllusionTower"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[7], function () {
                        if (!mc.GameData.illusionManager.getPlayerInfo()) {
                            var waitingId = mc.view_utility.showLoadingDialog(5);
                            mc.protocol.joinIllusionCastle(function (result) {
                                mc.view_utility.hideLoadingDialogById(waitingId);
                                if (result) {
                                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ILLUSION);
                                }
                            }.bind(this));
                        } else {
                            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ILLUSION);
                        }
                    }.bind(this));
                }.bind(this)
            },

            {
                path: [res.spine_ui_IconDevilSquare_json, res.spine_ui_IconEventList_atlas],
                animation: "IconDevilSquare",
                label: mc.dictionary.getGUIString("lblDevilSquare"),
                callback: function () {
                    mc.view_utility.confirmFunction(arrFunctionCode[8], function () {
                        //todo comming soon!!
                    }.bind(this));
                }.bind(this)
            }

        ];
        var arrView = this._arrView = bb.collection.createArray(arrObj.length, function (index) {
            var widget = new ccui.Layout();
            widget.setCascadeOpacityEnabled(true);
            widget.anchorX = widget.anchorY = 0.5;
            widget.width = 144;
            widget.height = 146;
            widget.setUserData(index);
            var iconInfo = arrObj[index];
            widget.registerTouchEvent(iconInfo.callback);
            var brk = new cc.Sprite("#patch9/pnl_circle.png");
            var icon = sp.SkeletonAnimation.createWithJsonFile(iconInfo.path[0], iconInfo.path[1], 1.7);
            icon.addAnimation(0, iconInfo.animation, true, bb.utility.randomInt(0, 10) * 0.1);
            var brkTxt = new ccui.ImageView("patch9/pnl_eventname.png", ccui.Widget.PLIST_TEXTURE);
            var lbl = brkTxt.setString(iconInfo.label, res.font_UTMBienvenue_none_32_export_fnt);
            lbl.scale = 0.55;
            lbl.y += 5;
            lbl.setColor(mc.color.BROWN_SOFT);

            brk.x = icon.x = brkTxt.x = widget.width * 0.5;
            brk.y = widget.height * 0.52;
            icon.y = widget.height * 0.60 + 10;
            brkTxt.y = widget.height * 0.18;

            widget.addChild(brk);
            widget.addChild(icon);
            widget.addChild(brkTxt);
            widget.setBlack = function () {
                brk.setColor(mc.color.BLACK_DISABLE_STRONG);
                icon.setColor(mc.color.BLACK_DISABLE_STRONG);
                brkTxt.setColor(mc.color.BLACK_DISABLE_STRONG);
                lbl.setColor(mc.color.BROWN_DISABLE);
            };
            return widget;
        });

        var challengeFunc = mc.GameData.canUnlockFunction(mc.const.FUNCTION_DAILY_CHALLENGE);
        if (challengeFunc && challengeFunc.isUnlock) {
            mc.view_utility.setNotifyIconForWidget(arrView[0], mc.GameData.notifySystem.doHaveDragonChallengeNotification());
            mc.view_utility.setNotifyIconForWidget(arrView[1], mc.GameData.notifySystem.doHaveWizardChallengeNotification());
            mc.view_utility.setNotifyIconForWidget(arrView[2], mc.GameData.notifySystem.doHaveRabbitChallengeNotification());
        }
        mc.view_utility.setNotifyIconForWidget(arrView[4], mc.GameData.notifySystem.doHaveWorldBossFightChance());

        var grid = bb.layout.grid(arrView, 3, panelMiddle.width, 150);
        grid.x = panelMiddle.width * 0.5;
        grid.y = panelMiddle.height * 0.5;
        panelMiddle.addChild(grid);

        for (var i = 0; i < arrView.length; i++) {
            var unlockFunc = mc.GameData.canUnlockFunction(arrFunctionCode[i]);
            if (!unlockFunc || !unlockFunc.isUnlock) {
                var txtLock = mc.view_utility.createUnlockFunctionText(unlockFunc);
                txtLock.setName("txtLock");
                txtLock.scale = 0.75;
                txtLock.x = arrView[i].x;
                txtLock.y = arrView[i].y;
                grid.addChild(txtLock);
                arrView[i].setBlack();
                arrView[i].setEnabled(false);
            }
        }

        panelMiddle.setCascadeOpacityEnabled(true);
        grid.setCascadeOpacityEnabled(true);
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_ALL_EVENT);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_CHALLENGE_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._arrView[0])
                    .setScaleHole(1.5)
                    .show();
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_CHAOSCASTLE_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._arrView[3])
                    .setScaleHole(1.5)
                    .show();
            }
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_ALL_EVENT;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return false;
    }

});
