/**
 * Created by long.nguyen on 6/29/2017.
 */

var xMasTime = false;
var waterFall = true;
var hasSunShine = false;
var hasWindSand = false;
var hasSnow = true;
var markEventNotify = 0;

mc.HomeLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();
        this.preloadTextures();
        var root = this.parseCCStudio(parseNode || res.layer_home);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var scrollBar = rootMap["scrollBar"];
        var nodeDecorator = this._nodeDecorator = rootMap["nodeDecorator"];
        nodeDecorator.setCascadeOpacityEnabled(true);
        var nodeDecoratorBG = this._nodeDecoratorBG = rootMap["nodeDecoratorBG"];
        nodeDecoratorBG.setCascadeOpacityEnabled(true);
        var btnDailyReward = rootMap["btnReward"];
        var brk = rootMap["brk"];
        var btnMenu = rootMap["btnMenu"];
        var btnUpgrade = rootMap["btnUpgrade"];
        var btnSummon = rootMap["btnSummon"];
        var btnSetting = rootMap["btnSetting"];
        var btnSpin = rootMap["btnSpin"];
        var btnEgg = rootMap["btnEgg"];
        var btnMail = rootMap["btnMail"];
        var btnBlackSmith = this._btnBlackSmith = rootMap["btnBlackSmith"];
        var btnLevelUpEvent = rootMap["btnLevelUpEvent"];
        var btnFriend = rootMap["btnFriend"];
        var btnEvent = rootMap["btnEvent"];
        var btnPromotion = rootMap["btnPromotion"];
        var btnAds = rootMap["btnAds"];
        var btnChat = rootMap["btnChat"];
        var btnFBPage = rootMap["btnFBPage"];
        var btnFirstTimeTopup = rootMap["btnFirstTime"];

        var botIcons = [btnPromotion, btnDailyReward, btnEvent, btnFirstTimeTopup, btnAds];

        this.botPos = bb.collection.createArray(botIcons.length, function (index) {
            return botIcons[index].getPosition();
        });

       this._getLevelUpRewardInfo();

        var arrangeFunc = function () {
            var checkPos = [btnPromotion, btnEgg, btnEvent, btnFirstTimeTopup, btnAds];
            var index = 0;
            for (var i in checkPos) {
                var icon = checkPos[i];
                if (icon.isVisible()) {
                    icon.setPosition(this.botPos[index]);
                    index++;
                }
            }
        }.bind(this);


        btnFirstTimeTopup.setVisible(true);
        var _showInAppTokenValidate = function () {
            var arrPurchaseInfo = mc.storage.readPurchaseInfosByPlayerId(mc.GameData.playerInfo.getUserId());
            var layout = root.getChildByName("btnInAppValidate");
            if (arrPurchaseInfo && arrPurchaseInfo.length > 0) {
                if (!layout) {
                    var treasureBox = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json, res.spine_ui_chest_atlas, 1.0);
                    treasureBox.setSkin("chest_platinum");
                    treasureBox.setAnimation(0, "ready", true);

                    var lblText = bb.framework.getGUIFactory().createText("In-app");
                    layout = new ccui.Layout();
                    layout.addChild(treasureBox);
                    layout.addChild(lblText);
                    layout.width = 100;
                    layout.height = 100;

                    treasureBox.x = lblText.x = layout.width * 0.5;
                    treasureBox.y = layout.height * 0.35;
                    lblText.y = layout.height * 0.1;

                    layout.setName("btnInAppValidate");
                    layout.x = btnPromotion.x;
                    layout.y = btnPromotion.y - 125;
                    layout.anchorX = layout.anchorY = 0.5;
                    layout.registerTouchEvent(function () {
                        var dialog = new mc.DefaultDialog()
                            .setTitle(mc.dictionary.getGUIString("lblInfo"))
                            .setMessage(cc.formatStr(mc.dictionary.getGUIString("txtFinishFailedPurchase"), arrPurchaseInfo.length))
                            .enableOkButton(function () {
                                arrPurchaseInfo = mc.storage.readPurchaseInfosByPlayerId(mc.GameData.playerInfo.getUserId());
                                dialog.close();
                                var _showDialog = function () {
                                    if (currResponse === currSuccess) {
                                        bb.framework.getGUIFactory().createCongratulationDialog(mc.dictionary.getGUIString("txtPurchaseSuccessfully")).show();
                                    } else {
                                        bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtPurchaseFailed"),
                                            mc.dictionary.getGUIString("txtPurchaseFailedReasonCode")["-3"])).show();
                                    }
                                };
                                var loadingId = mc.view_utility.showLoadingDialog(undefined, _showDialog);
                                var currSuccess = 0;
                                var currResponse = 0;
                                var totalRequest = arrPurchaseInfo.length;
                                var _cb = function (result) {
                                    currResponse++;
                                    if (result) {
                                        currSuccess++;
                                    }
                                    if (currResponse === totalRequest) {
                                        mc.view_utility.hideLoadingDialogById(loadingId);
                                        _showDialog();
                                    }
                                };
                                for (var i = 0; i < arrPurchaseInfo.length; i++) {
                                    var purchaseInfo = arrPurchaseInfo[i];
                                    mc.protocol.verifyPayment(purchaseInfo.token, purchaseInfo.orderId, _cb);
                                }
                            }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                        dialog.show();
                    });
                    root.addChild(layout);
                }
            }
            layout && layout.setVisible(arrPurchaseInfo && arrPurchaseInfo.length > 0);
        };


        var _updateNotifyWidget = function () {
            mc.view_utility.setNotifyIconForWidget(btnChat, mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_WORLD_ID) || mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_CLAN_ID), 0.8);
        };
        _updateNotifyWidget();
        var chatSystem = mc.GameData.chatSystem;
        this.traceDataChange(chatSystem, function () {
            _updateNotifyWidget();
        });

        if (!this._lblDailyEvent) {
            this._lblDailyEvent = btnEvent.getChildByName("BitmapFontLabel_11");
        }
        var eventIcon = btnEvent.getChildByName("Image_31");
        var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_icon_event_json, res.spine_icon_event_atlas, 1.0);
        btnEvent.addChild(iconAnimate);
        iconAnimate.setLocalZOrder(1);
        iconAnimate.setPosition(eventIcon.x, eventIcon.y);
        iconAnimate.setAnimation(0, "idle", true);
        eventIcon.removeFromParent();

        var promotionIcon = btnPromotion.getChildByName("Image_31");
        var promotionIconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_icon_promotion_json, res.spine_icon_promotion_atlas, 1.0);
        btnPromotion.addChild(promotionIconAnimate);
        promotionIconAnimate.setLocalZOrder(1);
        promotionIconAnimate.setPosition(promotionIcon.x, promotionIcon.y);
        promotionIconAnimate.setAnimation(0, "idle", true);
        promotionIcon.removeFromParent();

        var topupIcon = btnFirstTimeTopup.getChildByName("Image_31");
        var iconTopupAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_icon_relic_json, res.spine_icon_relic_atlas, 1.0);
        btnFirstTimeTopup.addChild(iconTopupAnimate);
        iconTopupAnimate.setName("animateIcon");
        iconTopupAnimate.setLocalZOrder(1);
        iconTopupAnimate.setPosition(topupIcon.x, topupIcon.y);
        iconTopupAnimate.setAnimation(0, "idle", true);
        topupIcon.setVisible(false);

        var levelUpIcon = btnLevelUpEvent.getChildByName("Image_31");
        var iconLevelUpAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_icon_level_up_event_json, res.spine_icon_level_up_event_atlas, 1.0);
        btnLevelUpEvent.addChild(iconLevelUpAnimate);
        iconLevelUpAnimate.setName("animateIcon");
        iconLevelUpAnimate.setLocalZOrder(1);
        iconLevelUpAnimate.setPosition(levelUpIcon.x, levelUpIcon.y);
        iconLevelUpAnimate.setAnimation(0, "idle", true);
        levelUpIcon.setVisible(false);

        //Remove Snow
        if (hasSnow) {
            var childNode = new cc.ParticleSystem(res.f_snow_plist);
            childNode.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            childNode.x = brk.width / 2;
            childNode.y = brk.height;
            nodeDecorator.addChild(childNode, 5);
        }

        if (hasSunShine) {
            var childNode = new cc.ParticleSystem(res.f_sunshinebig_plist);
            childNode.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            childNode.x = brk.width / 2;
            childNode.y = brk.height;
            nodeDecorator.addChild(childNode, 5);
        }

        if (hasWindSand) {
            var childNode = new cc.ParticleSystem(res.f_windsand_plist);
            childNode.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
            childNode.x = brk.width / 2;
            childNode.y = brk.height;
            nodeDecorator.addChild(childNode, 5);
        }


        var scrollBarMap = bb.utility.arrayToMap(scrollBar.getChildren(), function (child) {
            return child.getName();
        });

        var btnLeft = scrollBarMap["btnLeft"];
        var widgetEvent = this._widgetEvent = scrollBarMap["widgetEvent"];
        var widgetWorld = this._widgetWorld = scrollBarMap["widgetWorld"];
        var widgetArena = this._widgetArena = scrollBarMap["widgetArena"];
        var lblwidgetEvent = widgetEvent.getChildByName("lbl");
        var lblwidgetWorld = widgetWorld.getChildByName("lbl");
        var lblwidgetArena = widgetArena.getChildByName("lbl");

        this.applySpine(widgetEvent, "runestone_idle", 0.8);
        this.applySpine(widgetArena, "arena_idle", 0.8);
        this.applySpine(widgetWorld, "map_idle");

        var btnRight = scrollBarMap["btnRight"];
        var panelPage = scrollBarMap["panelPage"];

        if (mc.storage.showedServerInfo) {
            panelPage.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function () {
                var msg = " " + mc.dictionary.getGUIString("lblWelcomeTo") + " " + mc.dictionary.getGUIString("lblServer") + " : " + mc.dictionary.getGUIString(mc.storage.readLoginServer()["name"]);
                var bannerView = new mc.ServerInfoBannerView(cc.winSize.height * 0.9, msg, 1, 5);
                bannerView.setName("banner_serverInfo");
                this.getMainScreen().addChild(bannerView, 100);
            }.bind(this))]));
            mc.storage.showedServerInfo = true;
        }

        var self = this;
        mc.protocol.checkFirstTimeRewards(function () {}.bind(this));
        var _updateLanguage = function () {
            btnAds.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblHomeBonus"));
            btnAds.getChildByName("BitmapFontLabel_11").setString("");
            btnMenu.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblHomeQuest"));
            btnDailyReward.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblHomeReward"));
            btnBlackSmith.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblHomeGoblin"));
            btnFriend.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblHomeFriends"));
            btnMail.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblHomeMail"));
            btnSetting.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblHomeSetting"));
            btnSpin.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblSpin"));
            btnEgg.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblEgg"));
            btnPromotion.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("lblPromotion"));
            btnChat.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("Chat"));
            btnFirstTimeTopup.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("1St.Gift"));
            btnFBPage.getChildByName("BitmapFontLabel_11").setString(mc.dictionary.getGUIString("Group"));
            lblwidgetEvent.setString(mc.dictionary.getGUIString("lblEvents"));
            lblwidgetWorld.setString(mc.dictionary.getGUIString("lblWorld"));
            lblwidgetArena.setString(mc.dictionary.getGUIString("lblArena"));
            var dailyEventString = mc.dictionary.getGUIString("lblDailyEvent");
            var eventDuration = mc.GameData.dynamicDailyEvent.getEventDuration();
            if (eventDuration) {
                self._lblDailyEvent.setString(mc.view_utility.formatDurationTime(eventDuration * 1000));
                self._lblDailyEvent.setColor(mc.color.GREEN_NORMAL);
                var _updateProgress = function () {
                    var durationInSecond = eventDuration * 1000;
                    var deltaInMs = durationInSecond - (bb.now() - mc.GameData.svLoginTime);
                    if (deltaInMs < 0) {
                        deltaInMs = 0;
                    }
                    self._lblDailyEvent.setString(mc.view_utility.formatDurationTime(deltaInMs));
                };

                self.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function () {
                    _updateProgress();
                }.bind(self))]).repeatForever());

                //var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_HOME);
                //if (!tutorialTrigger) {
                //    var markGameEventNotify = mc.storage.readGameEventNotify();
                //    if (markGameEventNotify === 0 || bb.now() - markGameEventNotify > (1000 * 60 * 60 * 24)) {
                //        mc.storage.saveGameEventNotify();
                //        self.scheduleOnce(function () {
                //            if (!mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_HOME))
                //                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SEASON_EVENT);
                //        }.bind(self), 1);
                //    }
                //}

                var notifyIcon = mc.view_utility.setNotifyIconForWidget(btnEvent, markEventNotify === 0 || bb.now() - markEventNotify > (1000 * 60 * 60 * 24), 0.8);
                notifyIcon && notifyIcon.setLocalZOrder(4);
                btnEvent.registerTouchEvent(function () {
                    mc.GameData.guiState.eventPage = 2;
                   // this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_PAGES_EVENT);
                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SEASON_EVENT);
                    markEventNotify = bb.now();
                    var notifyIcon = mc.view_utility.setNotifyIconForWidget(btnEvent, markEventNotify === 0 || bb.now() - markEventNotify > (1000 * 60 * 60 * 24), 0.8);
                    notifyIcon && notifyIcon.setLocalZOrder(4);
                }.bind(this));

            } else {
                self._lblDailyEvent.setColor(mc.color.WHITE_NORMAL);
                self._lblDailyEvent.setString(dailyEventString);
                btnEvent.setVisible(false);
                btnEvent.registerTouchEvent(function () {
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("No Event Active now"));
                }.bind(this));
            }
            btnEgg.setVisible(false);
            arrangeFunc();
        }.bind(this);
        //mc.storage.lastVersion = 1;
        //mc.storage.saveLastVersion();
        //
        //mc.storage.readLastVersion();
        //if (!mc.storage.lastVersion || mc.storage.lastVersion !== mc.const.VERSION) {
        //    self.scheduleOnce(function () {
        //        new mc.WhatNewDialog().show();
        //    }.bind(self), 1.5);
        //
        //}

        widgetWorld.registerTouchEvent(function () {
            this.getMainScreen().showLayerWithId(mc.MainScreen.LAYER_WORD_MAP);
        }.bind(this));
        widgetEvent.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ALL_EVENT);
        }.bind(this));
        widgetArena.registerTouchEvent(function () {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_ARENA, function () {
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA);
            }.bind(this));

            //this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SELECT_ARENA);
        }.bind(this));
        btnMenu.registerTouchEvent(function () {
            this.getMainScreen().showLayerWithId(mc.MainScreen.LAYER_QUEST_LIST);
            mc.view_utility.seenNotify(btnMenu);
        }.bind(this));
        btnDailyReward.registerTouchEvent(function () {
            mc.GameData.guiState.eventPage = 3;
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_PAGES_EVENT);
            mc.view_utility.seenNotify(btnDailyReward);
        }.bind(this));
        btnSpin.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_LUCKY_SPIN);
            mc.view_utility.seenNotify(btnSpin);
        }.bind(this));
        btnEgg.registerTouchEvent(function () {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_EGGS_GAME, function () {
                mc.GUIFactory.showEggGameScreen();
            });
            mc.view_utility.seenNotify(btnEgg);
        }.bind(this));
        btnEgg.setVisible(false);
        btnDailyReward.setPosition(btnEgg.x, btnEgg.y);

        btnSetting.registerTouchEvent(function () {
            new mc.DialogMenu().show();
            mc.view_utility.seenNotify(btnSetting);
        }.bind(this));
        btnFriend.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_FRIEND);
            mc.view_utility.seenNotify(btnFriend, true);
        }.bind(this));
        btnPromotion.registerTouchEvent(function () {
            // this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_IN_APP_PACKAGE_LIST);//bỏ show promotion kiểu cũ
            mc.IAPShopDialog.showIAPPromo();
            mc.view_utility.seenNotify(btnPromotion);
        }.bind(this));
        btnMail.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_MAIL);
            mc.view_utility.seenNotify(btnMail, true);
        }.bind(this));
        btnBlackSmith.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_BLACK_SMITH);
            mc.view_utility.seenNotify(btnBlackSmith);
        }.bind(this));

        btnLevelUpEvent.registerTouchEvent(function () {
            mc.MCLevelUpEventDialog.showIAPItem(mc.dictionary.IAPMap["com.rpgwikigames.darknessrising.android.bless.price10p1_13"]);
            mc.view_utility.seenNotify(btnLevelUpEvent);
        }.bind(this));

        btnFBPage.registerTouchEvent(function () {
            cc.sys.openURL("https://www.facebook.com/DarknessRisingGlobal/");
            mc.view_utility.seenNotify(btnFBPage);
        }.bind(this));

        btnChat.registerTouchEvent(function () {
            //mc.GameData.guiState.setCurrentConversationPrivateId(null);
            mc.ChatDialog.showChat();
            mc.view_utility.seenNotify(btnChat, true);
        }.bind(this));

        btnChat.setVisible(true);
        btnFirstTimeTopup.registerTouchEvent(function () {
            if (mc.GameData.playerInfo.firstTimeRewards === 2) {
                mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_RELIC);
            } else {
                mc.GameData.guiState.eventPage = 1;
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_PAGES_EVENT);
            }
            mc.view_utility.seenNotify(btnFirstTimeTopup);
        }.bind(this));


        btnAds.registerTouchEvent(function () {
            if (mc.GameData.notifySystem.doHaveAds()) {
                mc.view_utility.view_videoAd();
            }
            mc.view_utility.seenNotify(btnAds);
        });


        this._loadHeroes();
        this.loadGoblinIfAny();

        var _updateNotifyForWidget = function () {
            cc.log("----------- update notify for all icon -------------");
            var notifySystem = mc.GameData.notifySystem;
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(btnMenu, (notifySystem.getQuestCompleteNotification() != null), 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            if (notifySystem.doHaveDailyGiftNotification()) {
                notifyIcon = mc.view_utility.setNotifyIconForWidget(btnDailyReward, notifySystem.doHaveDailyGiftNotification(), 0.8);
                notifyIcon && notifyIcon.setLocalZOrder(4);
                // btnDailyReward.setVisible(true);
            } else {
                // btnDailyReward.setVisible(false);
            }
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnMail, notifySystem.doHaveMail(), 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(widgetArena, notifySystem.doHaveArenaBattleLog(), 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            //notifyIcon = mc.view_utility.setNotifyIconForWidget(btnBlackSmith, notifySystem.getEquipmentAddOptionNotification() || notifySystem.getEquipmentCraftingNotification() || notifySystem.getEquipmentLevelUpNotification(), 0.8);
            //notifyIcon && notifyIcon.setLocalZOrder(4);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnFriend, notifySystem.doHaveNewFriend() || notifySystem.doHaveNewRequestMakeFriend() || notifySystem.doHaveFriendSolo(), 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnChat, mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_WORLD_ID) || mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_CLAN_ID) || mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_PRIVATE_ID), 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnFirstTimeTopup, true, 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnSpin, Math.floor(mc.GameData.playerInfo.getSpinTicket()) > 0, 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnPromotion, notifySystem.hasIapNotify() && mc.GameData.notifySystem.hasNewInAppPackage(), 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnLevelUpEvent, notifySystem.doHaveClaimLevelUpReward(), 0.8);
            notifyIcon && notifyIcon.setLocalZOrder(4);
            arrangeFunc();
        };

        _updateNotifyForWidget();
        this.traceDataChange(mc.GameData.notifySystem, function () {
            cc.log('===== notifySystem have data change');
            _updateNotifyForWidget();
        });

        _updateLanguage();
        this.traceDataChange(mc.storage.settingChanger, function (data) {
            mc.storage.settingChanger.performChanging({
                "language": function (oldLan, newLan) {
                    _updateLanguage();
                }
            }, true);
        });

        var _updateAds = function () {
            if (mc.GameData.notifySystem) {
                if (mc.GameData.notifySystem.doHaveAds()) {
                    var time = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionTimeByCode(mc.const.REFRESH_FUNCTION_ADS);
                    var nodeValue = btnAds.getChildByName("_price_");
                    if (nodeValue && nodeValue.getUserData() != time) {
                        nodeValue.removeFromParent(true);
                        nodeValue = null;
                    }
                    if (!nodeValue) {
                        var priceInfo = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionPriceByCode(mc.const.REFRESH_FUNCTION_ADS);
                        if (priceInfo) {
                            var lbl = bb.framework.getGUIFactory().createText("+" + bb.utility.formatNumber(mc.ItemStock.getItemQuantity(priceInfo)));
                            var icon = new ccui.ImageView(mc.ItemStock.getItemRes(priceInfo), ccui.Widget.LOCAL_TEXTURE);
                            icon.scale = 0.4;
                            nodeValue = bb.layout.linear([lbl, icon], -2, bb.layout.LINEAR_HORIZONTAL, true);
                            nodeValue.setUserData(time);
                            nodeValue.anchorX = nodeValue.anchorY = 0.5;
                            nodeValue.x = btnAds.width * 0.5;
                            nodeValue.y = 10;
                            nodeValue.setName("_price_");
                            btnAds.addChild(nodeValue);
                            nodeValue.runAction(cc.sequence([cc.delayTime(2.0), cc.scaleTo(0.2, 1.2), cc.scaleTo(0.2, 1.0)]).repeatForever());
                        }
                    }
                } else {
                    var nodeValue = btnAds.getChildByName("_price_");
                    nodeValue && nodeValue.removeFromParent(true);
                    nodeValue = null;
                }
                mc.view_utility.setNotifyIconForWidget(btnAds, mc.GameData.notifySystem.doHaveAds(), 0.8);
                btnAds.setVisible(mc.GameData.notifySystem.doHaveAds());
            }
        };

        _updateAds();
        this.traceDataChange(mc.GameData.refreshGameFunctionSystem, function () {
            _updateAds();
        });

        _showInAppTokenValidate();
        this.traceDataChange(mc.storage.savedInappToken, function () {
            _showInAppTokenValidate();
        });


        btnAds.runAction(cc.sequence([cc.delayTime(10), cc.callFunc(function () {
            _updateAds();
        })]).repeatForever());
        this._loadDecoratorGUI();
        this.scheduleOnce(this.checkService.bind(this), 2);
        //Show what new
        var doneMap = mc.GameData.tutorialManager.getTutorialDoneMap();
        if (doneMap[mc.TutorialManager.ID_START_FIRST_STAGE] == true) {
            var lastVersion = mc.storage.readLastNewsVersion();
            if (mc.const.VERSION_NEWS !== lastVersion) {
                mc.storage.lastNewsVersion = mc.const.VERSION_NEWS;
                mc.storage.saveLastNewsVersion();
                new mc.WhatNewDialog().show();
            }
        }
    },

    //Test bubble chat
    /*      onEnter: function(){
     this._super();  cc.spriteFrameCache.addSpriteFrames(res.chat_plist);

     var buff = new mc.bubble.BubbleNode("#chat/balloon_chat_84x84.png");
     var scenr  = new mc.Screen();
     scenr.addChild(buff);
     scenr.show();

     },*/

    preloadTextures: function () {
        cc.spriteFrameCache.addSpriteFrames(res.button_plist);
    },

    checkService: function () {
        cc.log("============ check guild info");
        var guildStatusChecked = mc.GameData.guildManager.isGuildStatusChecked();
        if(!guildStatusChecked){
            mc.protocol.checkGuildStatus(function (result) {
                mc.GameData.guildManager.setIsCheckGuildStatus(true);
                var guild = mc.GameData.guildManager.getGuildInfo();
                if (guild) {
                    mc.protocol.listChatLogs(mc.ChatSystem.GROUP_CHAT_CLAN_ID, guild["id"]);
                }
            }.bind(this));
        }
    },


    applySpine: function (widget, animateCode, scale) {
        var spine = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_home_button2_json, res.spine_ui_home_button2_atlas, scale || 1.0);
        spine.setAnimation(0, animateCode, true);
        spine.x = widget.width * 0.5;
        spine.y = widget.height * 0.5;
        widget.addChild(spine, 2);
        var lbl = widget.getChildByName("lbl");
        if (lbl) {
            lbl.setLocalZOrder(3);
        }
    },

    _getLevelUpRewardInfo: function(){
        //var claimedLevelUpReward = mc.storage.getClaimedLevelUpReward();
        //if (!claimedLevelUpReward) {
            mc.protocol.getLevelUpReward(function () {}.bind(this));
        //}
    },

    onStart: function () {
        mc.GameData.notifySystem.notifyDataChanged();
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_HOME);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_WORLD_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._widgetWorld)
                    .setScaleHole(1.5)
                    .show();
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_EVENT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._widgetEvent)
                    .setScaleHole(1.5)
                    .show();
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_ARENA_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._widgetArena)
                    .setScaleHole(1.5)
                    .show();
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_GOBLIN_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnBlackSmith)
                    .setScaleHole(1.5)
                    .setCharPositionY(cc.winSize.height * 0.5)
                    .show();
            }
        }
    },

    _loadDecoratorGUI: function () {
        var zOrder = 3;
        var nodeDecorator = this._nodeDecorator;
        nodeDecorator.setCascadeOpacityEnabled(true);
        var nodeDecoratorBG = this._nodeDecoratorBG;
        nodeDecoratorBG.setCascadeOpacityEnabled(true);
        if (!xMasTime) {
            var home1 = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_home_elements_json, res.spine_ui_home_elements_atlas, 1.0);
            //home1.findAnimation("idle") && home1.setAnimation(0, "idle", true);
            home1.setLocalZOrder(zOrder);
            home1.x = cc.winSize.width * 0.5;
            home1.y = mc.const.DEFAULT_HEIGHT * 0.235;
            nodeDecorator.addChild(home1);
        } else {
            var home1 = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_home_elements1_json, res.spine_ui_home_elements1_atlas, 1.0);
            //home1.findAnimation("idle") && home1.setAnimation(0, "idle", true);
            home1.x = cc.winSize.width * 0.5;
            home1.y = mc.const.DEFAULT_HEIGHT * 0.235;
            nodeDecoratorBG.addChild(home1);
            var home2 = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_home_elements2_json, res.spine_ui_home_elements2_atlas, 1.0);
            //home2.findAnimation("idle") && home2.setAnimation(0, "idle", true);
            home2.setLocalZOrder(zOrder);
            home2.x = cc.winSize.width * 0.5;
            home2.y = mc.const.DEFAULT_HEIGHT * 0.235;
            nodeDecorator.addChild(home2);
        }

        if (waterFall) {
            var wFall = new cc.ParticleSystem(res.particle_waterfall_botle1_plist);
            var wBottom = new cc.ParticleSystem(res.particle_waterfall_botleB1_plist);

            var wFall1 = new cc.ParticleSystem(res.particle_waterfall_botle2_plist);
            var wFall2 = new cc.ParticleSystem(res.particle_waterfall_botle2_plist);
            var wFall3 = new cc.ParticleSystem(res.particle_waterfall_botle2_plist);
            var wFall4 = new cc.ParticleSystem(res.particle_waterfall_botle2_plist);

            var wBottom1 = new cc.ParticleSystem(res.particle_waterfall_botleB2_plist);
            var wBottom2 = new cc.ParticleSystem(res.particle_waterfall_botleB2_plist);
            var wBottom3 = new cc.ParticleSystem(res.particle_waterfall_botleB2_plist);
            var wBottom4 = new cc.ParticleSystem(res.particle_waterfall_botleB2_plist);

            wFall.scale = 0.2;
            wFall1.scale = 0.2;
            wFall2.scale = 0.2;
            wFall3.scale = 0.2;
            wFall4.scale = 0.2;
            wBottom.scale = 0.2;
            wBottom1.scale = 0.2;
            wBottom2.scale = 0.2;
            wBottom3.scale = 0.2;
            wBottom4.scale = 0.2;

            wFall.x = 388.47;
            wFall.y = 834;
            wBottom.x = 389;
            wBottom.y = 760;
            wFall1.scaleX *= -1;
            wFall1.x = 316.15;
            wFall1.y = 762.46;
            wFall2.x = 354.21;
            wFall2.y = 752.46;
            wFall3.x = 405.37;

            wFall3.y = 751.82;
            wFall4.x = 449.05;
            wFall4.y = 756.79;
            wBottom1.x = 313.99;
            wBottom1.y = 722.53;
            wBottom2.x = 353.92;
            wBottom2.y = 711.59;
            wBottom3.x = 406.95;
            wBottom3.y = 705.34;
            wBottom4.x = 452.50;
            wBottom4.y = 714.05;

            wFall.setLocalZOrder(zOrder);
            wBottom.setLocalZOrder(zOrder);
            wFall1.setLocalZOrder(zOrder);
            wFall2.setLocalZOrder(zOrder);
            wFall3.setLocalZOrder(zOrder);
            wFall4.setLocalZOrder(zOrder);
            wBottom1.setLocalZOrder(zOrder);
            wBottom2.setLocalZOrder(zOrder);
            wBottom3.setLocalZOrder(zOrder);
            wBottom4.setLocalZOrder(zOrder);

            nodeDecorator.addChild(wFall);
            nodeDecorator.addChild(wBottom);
            nodeDecorator.addChild(wFall1);
            nodeDecorator.addChild(wFall2);
            nodeDecorator.addChild(wFall3);
            nodeDecorator.addChild(wFall4);
            nodeDecorator.addChild(wBottom1);
            nodeDecorator.addChild(wBottom2);
            nodeDecorator.addChild(wBottom3);
            nodeDecorator.addChild(wBottom4);
        }
    },

    loadGoblinIfAny: function () {
        if (mc.GameData.shopManager.isGoblinShopOpen()) {
            var goblinContainer = new cc.Node();
            goblinContainer.setLocalZOrder(6);
            this._nodeDecorator.addChild(goblinContainer);
            var goblin = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_goblin_json, res.spine_ui_goblin_atlas, 0.5);
            goblinContainer.addChild(goblin);
            var lblCountDown = new ccui.Text("", "Arial", 25);
            lblCountDown.name = "lblCountDown";
            goblinContainer.addChild(lblCountDown);


            var GOBLIN_INTERVAL = 1000 * 60 * 60;
            var goblinShop = mc.storage.readGoblinShop();
            var action = null;
            var markTime = goblinShop["markTime"];

            var _updateFreeTime = function (lbl) {
                var remainTimeSeconds = GOBLIN_INTERVAL - (bb.now() - markTime);
                if (remainTimeSeconds > 0){
                    lblCountDown.setString(mc.view_utility.formatDurationTimeHMS(remainTimeSeconds));
                } else{
                    goblinContainer.setVisible(false);
                    goblinContainer.stopAction(action);
                }
            };



            action = cc.sequence([cc.delayTime(1.0), cc.callFunc(function (lblCount) {
                _updateFreeTime(lblCount);
            }, lblCountDown)]).repeatForever();
            goblinContainer.runAction(action);


            var layout = new ccui.Layout();
            layout.anchorX = 0.5;
            layout.anchorY = 0;
            layout.width = 120;
            layout.height = 150;
            layout.registerTouchEvent(function () {
                mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_GOBLIN);
            });
            layout.setSwallowTouches(true);
            goblinContainer.addChild(layout);

            var STATE_REST = 1;
            var STATE_MOVE = 2;

            var msRestTime = bb.now();
            var maxRestTime = bb.utility.randomInt(5, 20);
            var xTarget = 150;
            var spdGoblin = 1.5;
            var goblinState = STATE_REST;
            goblin.setAnimation(0, "idle", true);
            // goblinContainer.x = bb.utility.randomInt(150, cc.winSize.width - 150);
            goblinContainer.x = cc.winSize.width - 150;
            goblinContainer.y = 500;
            // goblinContainer.scheduleUpdate();
            goblinContainer.update = function (dt) {
                switch (goblinState) {
                    case STATE_REST:
                        var dtRest = (bb.now() - msRestTime) / 1000;
                        if (dtRest >= maxRestTime) {
                            xTarget = bb.utility.randomInt(150, cc.winSize.width - 150);
                            goblinState = STATE_MOVE;
                            goblin.clearTracks();
                            goblin.setToSetupPose();
                            goblin.setAnimation(1, "walk", true);
                        }
                        break;

                    case STATE_MOVE:
                        var isCome = false;
                        if (xTarget > goblinContainer.x) {
                            goblinContainer.x += spdGoblin;
                            goblinContainer.scaleX = -1.0;
                            isCome = (xTarget <= goblinContainer.x);
                        } else {
                            goblinContainer.x -= spdGoblin;
                            goblinContainer.scaleX = 1.0;
                            isCome = (xTarget >= goblinContainer.x);
                        }
                        if (isCome) {
                            msRestTime = bb.now();
                            maxRestTime = bb.utility.randomInt(5, 20);
                            goblinState = STATE_REST;
                            goblin.clearTracks();
                            goblin.setToSetupPose();
                            goblin.setAnimation(0, "idle", true);
                        }
                        break;
                    default:
                        break;
                }
            }.bind(goblinContainer);
        }
    },

    _loadHeroes: function (panelHero) {
        var slotMap = xMasTime ? {
            slot1: {
                x: 375.00,
                y: 546.89,
                scale: 1.0,
                z: 5
            },
            slot2: {
                x: 146.75,
                y: 662.10,
                scale: 0.85,
                z: 4
            },
            slot3: {
                x: 252.62 - 50,
                y: 771.06,
                scale: 0.75,
                z: 2
            },
            slot4: {
                x: 516.73 + 50,
                y: 771.06,
                scale: 0.75,
                z: 1
            },
            slot5: {
                x: 625.14,
                y: 662.10,
                scale: 0.85,
                z: 4
            }
        } : {
            slot1: {
                x: 375.00,
                y: 546.89,
                scale: 1.0,
                z: 5
            },
            slot2: {
                x: 146.75,
                y: 662.10,
                scale: 0.85,
                z: 4
            },
            slot3: {
                x: 252.62,
                y: 771.06,
                scale: 0.75,
                z: 2
            },
            slot4: {
                x: 516.73,
                y: 771.06,
                scale: 0.75,
                z: 1
            },
            slot5: {
                x: 625.14,
                y: 662.10,
                scale: 0.85,
                z: 4
            }
        };
        var num = 1;
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.TeamFormationManager.TEAM_CAMPAIGN;
        var mainHeroIds = teamFormationManager.getTeamFormationByIndex(teamId);
        for (var i = 0; i < mainHeroIds.length; i++) {
            var heroInfo = mc.GameData.heroStock.getHeroById(mainHeroIds[i]);
            if (heroInfo) {
                var heroView = mc.BattleViewFactory.createCreatureGUIByIndex(heroInfo.index);
                var slot = slotMap["slot" + (num++)];
                heroView.x = slot.x;
                heroView.y = slot.y;
                heroView.setLocalZOrder(slot.z);
                heroView.scale = slot.scale;
                heroView.setUserData(heroInfo);
                heroView.setClickAble(true, function (spineView) {
                    var heroInfo = spineView.getUserData();
                    mc.GameData.guiState.setCurrentViewHeroId(mc.HeroStock.getHeroId(heroInfo));
                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_HERO_INFO);
                }.bind(this));
                this._nodeDecorator.addChild(heroView);
            }
        }
    },

    onFade: function (isIn, duration) {
        var childs = this._nodeDecorator.getChildren();
        for (var i = 0; i < childs.length; i++) {
            childs[i].opacity = isIn ? 0 : 255;
            childs[i].runAction(isIn ? cc.fadeIn(duration) : cc.fadeOut(duration));
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_HOME;
    },

    isCache: function () {
        return true;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return true;
    }

});