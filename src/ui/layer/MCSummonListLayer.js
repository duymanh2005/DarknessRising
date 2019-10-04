/**
 * Created by long.nguyen on 10/6/2017.
 */
mc.SummonListLayer = mc.MainBaseLayer.extend({
    _allowCacheGroupId: false,
    ctor: function (parseNode) {
        this._super();
        bb.sound.preloadEffect(res.sound_ui_summon_start);

        cc.log("(1)- SUMMON LIST LAYER-------------)");
        var root = this.parseCCStudio(parseNode || res.layer_summon_list);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelTop = rootMap["panelTop"];
        var nodeContent = rootMap["nodeContent"];
        nodeContent.setCascadeOpacityEnabled(true);
        var btnSummon1 = this._btnSummon1 = rootMap["btnSummon1"];
        var btnSummon10 = rootMap["btnSummon10"];
        var lblSummon1 = rootMap["lblSummon1"];
        var lblSummon10 = rootMap["lblSummon10"];
        var nodeAsset1 = rootMap["nodeAsset1"];
        var nodeAsset10 = rootMap["nodeAsset10"];
        var panelWheel = rootMap["panelWheel"];
        var black = rootMap["black"];
        var nodeCenterParticle = rootMap["particleCenter"];

        var self = this;

        var mapWeel = bb.utility.arrayToMap(panelWheel.getChildren(), function (child) {
            return child.getName();
        });
        var imgWheel = mapWeel["imgWheel"];
        var imgTriangleWheelUnder = mapWeel["imgTriangleWheelUnder"];
        var imgElementContainer = mapWeel["imgElementContainer"];
        var imgTriangleWheelUpper = mapWeel["imgTriangleWheelUpper"];
        var panelElement = mapWeel["panelElement"];
        var imgSixthEdge = mapWeel["imgSixthEdge"];

        var elementLeft = panelElement.getChildByName("elementLeft");
        var elementUp = panelElement.getChildByName("elementUp");
        var elementRight = panelElement.getChildByName("elementRight");

        elementLeft.runAction(cc.rotateBy(0.1, 5).repeatForever());
        elementUp.runAction(cc.rotateBy(0.1, 5).repeatForever());
        elementRight.runAction(cc.rotateBy(0.1, 5).repeatForever());
        var timeEffect = 2.5;

        imgWheel.runAction(cc.rotateBy(0.1, -5).repeatForever());
        var _startAnimation = function () {
            var heroSummonInfo = mc.GameData.summonManager.getHeroSummonWithMaxRank();
            if (mc.HeroStock.getHeroRank(heroSummonInfo) === 5) {
                this._soundGemURL = res.sound_ui_summon_reward_5star;
            } else if (mc.HeroStock.getHeroRank(heroSummonInfo) === 4) {
                this._soundGemURL = res.sound_ui_summon_reward_4star;
            } else {
                this._soundGemURL = res.sound_ui_summon_reward_3star;
            }
            bb.sound.preloadEffect(this._soundGemURL);
            bb.sound.playEffect(res.sound_ui_summon_start);
            elementLeft.stopAllActions();
            elementUp.stopAllActions();
            elementRight.stopAllActions();
            elementLeft.runAction(cc.spawn([cc.fadeOut(timeEffect + 0.5), cc.rotateBy(0.1, 5)]).repeatForever());
            elementUp.runAction(cc.spawn([cc.fadeOut(timeEffect + 0.5), cc.rotateBy(0.1, 5)]).repeatForever());
            elementRight.runAction(cc.spawn([cc.fadeOut(timeEffect + 0.5), cc.rotateBy(0.1, 5)]).repeatForever());

            var particleLeft = new cc.ParticleSystem(res.particle_summon_water_charge_plist);
            var particleUp = new cc.ParticleSystem(res.particle_summon_earth_charge_plist);
            var particleRight = new cc.ParticleSystem(res.particle_summon_fire_charge_plist);
            particleLeft.x = elementLeft.x;
            particleLeft.y = elementLeft.y;
            particleUp.x = elementUp.x;
            particleUp.y = elementUp.y;
            particleRight.x = elementRight.x;
            particleRight.y = elementRight.y;
            panelElement.addChild(particleLeft);
            panelElement.addChild(particleUp);
            panelElement.addChild(particleRight);

            panelElement.runAction(cc.sequence([cc.delayTime(0.4), cc.callFunc(function () {
                var particle = new cc.ParticleSystem(res.particle_glow3);
                particle.x = -5;
                particle.y = -5;
                particle.setName("particle_glow");
                nodeCenterParticle.addChild(particle);

                var particle = new cc.ParticleSystem(res.particle_summon_center_charge_plist);
                particle.x = -5;
                particle.y = -5;
                particle.setName("particle_center");
                nodeCenterParticle.addChild(particle);

            })]));

            self.runAction(cc.sequence([cc.delayTime(timeEffect), cc.callFunc(function () {
                elementLeft.runAction(cc.fadeOut(0.5));
                elementUp.runAction(cc.fadeOut(0.5));
                elementRight.runAction(cc.fadeOut(0.5));
                nodeCenterParticle.getChildByName("particle_glow").stopSystem();
                nodeCenterParticle.getChildByName("particle_center").stopSystem();
                particleLeft.stopSystem();
                particleRight.stopSystem();
                particleUp.stopSystem();
                imgWheel.stopAllActions();

                bb.sound.playEffect(this._soundGemURL);
                new mc.DialogShowGem().show();
            }.bind(this))]));
        }.bind(this);

        var _enableSummonButton = function (enable) {
            btnSummon1.stopAllActions();
            lblSummon1.stopAllActions();
            btnSummon10.stopAllActions();
            lblSummon10.stopAllActions();
            if (!enable) {
                btnSummon1.setEnabled(false);
                btnSummon1.runAction(cc.fadeOut(0.5));
                lblSummon1.runAction(cc.fadeOut(0.5));

                btnSummon10.setEnabled(false);
                btnSummon10.runAction(cc.fadeOut(0.5));
                lblSummon10.runAction(cc.fadeOut(0.5));

                nodeContent.runAction(cc.sequence([cc.fadeOut(0.5), cc.blink(0.01, 1)]));
                self._footerView.runAction(cc.sequence([cc.fadeOut(0.5), cc.blink(0.01, 1)]));
                black.runAction(cc.sequence([cc.fadeOut(0.5), cc.blink(0.01, 1)]));
                nodeAsset1.setVisible(false);
                nodeAsset10.setVisible(false);
            } else {
                btnSummon1.setEnabled(true);
                btnSummon1.runAction(cc.fadeIn(0.5));
                lblSummon1.runAction(cc.fadeIn(0.5));

                btnSummon10.setEnabled(true);
                btnSummon10.runAction(cc.fadeIn(0.5));
                lblSummon10.runAction(cc.fadeIn(0.5));

                nodeContent.runAction(cc.fadeIn(0.5));
                self._footerView.runAction(cc.fadeIn(0.5));
                black.runAction(cc.fadeIn(0.5));
                nodeAsset1.setVisible(true);
                nodeAsset10.setVisible(true);
            }
            self.getMainScreen().enableInput(enable);
        };
        var loadingId = null;
        var self = this;
        var _summonCallback = function (btn) {
            var summonPackage = btn.getUserData();
            var checkForAvailableSlot = mc.GameData.checkForAvailableSlot(summonPackage["summonType"]);
            var buyMore = checkForAvailableSlot["buyMore"];
            var avaiSlots = checkForAvailableSlot["avaiSlots"];
            if (avaiSlots <= 0) {
                switch (summonPackage["summonType"]) {
                    case mc.GameData.CHECK_SLOT_TYPE_HERO:
                        if (buyMore) {
                            mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtHeroSlotFull"), function () {
                                mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT);
                            }, mc.dictionary.getGUIString("lblBuy")).show();
                        } else {
                            mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtHeroSlotFullLimit"), function () {
                            }, mc.dictionary.getGUIString("lblOk")).show();
                        }
                        break;
                    case mc.GameData.CHECK_SLOT_TYPE_ITEM:
                        if (buyMore) {
                            mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFull"), function () {
                                mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT);
                            }, mc.dictionary.getGUIString("lblBuy")).show();
                        } else {
                            mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFullLimit"), function () {
                            }, mc.dictionary.getGUIString("lblOk")).show();
                        }
                        break;
                }
                return;
            }

            var price = mc.SummonManager.getSummonPrices(summonPackage);
            var isShow = false;
            var isTicket = btn.buyByTicket;
            if (!isTicket) {
                isShow = mc.view_utility.showExchangingIfAny(price);
            }
            if (!isShow) {
                _enableSummonButton(false);
                loadingId = mc.view_utility.showLoadingDialog(undefined, function () {
                    _enableSummonButton(true);
                });
                mc.protocol.summon(mc.SummonManager.getSummonPackageIndex(summonPackage), isTicket, function (data) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (data) {
                        this._allowCacheGroupId = true;
                        if (data["items"]) {
                            mc.GUIFactory.showSummonItemScreen();
                        } else {
                            _startAnimation();
                        }
                    } else {
                        _enableSummonButton(true);
                    }
                }.bind(this));
                mc.GameData.tutorialManager.submitTutorialDoneById(mc.TutorialManager.ID_SUMMON_HERO);
            }
        }.bind(this);
        btnSummon1.registerTouchEvent(_summonCallback);
        btnSummon10.registerTouchEvent(_summonCallback);

        if (!cc.sys.isNative) {
            rootMap["Particle_1"].removeFromParent();
            root.addChild(rootMap["Particle_1"].clone());
        }

        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = btnSummon10.width * 0.5;
        particle.y = btnSummon10.height * 0.5;
        btnSummon10.addChild(particle);

        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = btnSummon1.width * 0.5;
        particle.y = btnSummon1.height * 0.5;
        btnSummon1.addChild(particle);

        var _updateSummonGUI = function () {

            btnSummon1.setVisible(false);
            lblSummon1.setVisible(false);
            btnSummon10.setVisible(false);
            lblSummon10.setVisible(false);

            var markTime = bb.now();
            var _updateFreeTime = function (btn, lbl) {
                lbl.setVisible(true);
                var summonPackage = btn.getUserData();
                var countDownInS = mc.SummonManager.getSummonCountDown(summonPackage["index"]);
                if (countDownInS > 0) {
                    var durationInS = mc.GameData.playerInfo.getRehilSecondById(mc.const.ITEM_INDEX_SUMMON_TICKET);
                    durationInS = durationInS - ((bb.now() - markTime) / 1000);
                    if (durationInS <= 0) {
                        lbl.setString(mc.dictionary.getGUIString("lblFree "));
                        btnSummon.stopAllActions();
                        lbl.setVisible(false);
                    } else {
                        lbl.setVisible(true);
                        var strDur = mc.view_utility.formatDurationTimeHMS(durationInS * 1000);
                        lbl.setString(mc.dictionary.getGUIString("lblFree") + strDur);
                    }
                } else {
                    lbl.setVisible(false);
                }
            };

            btnSummon1.stopAllActions();
            btnSummon1.setGray(false);
            nodeAsset1.removeAllChildren();
            nodeAsset10.removeAllChildren();
            lblSummon1.setVisible(false);
            lblSummon10.setVisible(false);

            var currSummonGroupId = mc.GameData.guiState.getCurrentSummonPackageGroupId();
            var arrSummonPackage = mc.SummonManager.getArraySummonPackage(currSummonGroupId);
            for (var i = 0; i < arrSummonPackage.length; i++) {
                var summonPackage = arrSummonPackage[i];
                var openTimes = mc.SummonManager.getSummonOpenTimes(summonPackage);
                var btnSummon = null;
                var assetNode = null;
                var lblSummon = null;
                if (openTimes === 1) {
                    btnSummon = btnSummon1;
                    assetNode = nodeAsset1;
                    lblSummon = lblSummon1;
                } else if (openTimes === 10) {
                    btnSummon = btnSummon10;
                    assetNode = nodeAsset10;
                    lblSummon = lblSummon10;
                }
                if (btnSummon) {
                    btnSummon.setVisible(true);
                    btnSummon.setUserData(summonPackage);

                    var summonTicket = mc.SummonManager.getSummonTicket(summonPackage);
                    var showCost = function () {
                        var assetView = mc.view_utility.createAssetView(mc.SummonManager.getSummonPrices(summonPackage));
                        var info = mc.SummonManager.getSummonPrices(summonPackage);
                        if (info.index === 11906) {
                            var quantity = mc.ItemStock.getItemQuantity(info);
                            var lbl = assetView.getChildByName("lbl");
                            var currPoints = bb.utility.formatNumberKM(mc.GameData.playerInfo.getFriendPoint());
                            var price = bb.utility.formatNumberKM(quantity)
                            lbl.setString(currPoints + " / " + price);
                            lbl.anchorX = 1;
                            lbl.x = assetView.getChildByName("icon").x - 30;
                        }
                        assetNode.addChild(assetView);
                        _updateFreeTime(btnSummon, lblSummon);
                        btnSummon.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function (btnSummon, lblSummon) {
                            _updateFreeTime(btnSummon, lblSummon);
                        }, btnSummon, lblSummon)]).repeatForever());
                    };

                    var showTicket = function (quantity) {
                        var summonTicket1 = mc.SummonManager.getSummonTicket(summonPackage);
                        quantity && (summonTicket1.no = quantity);
                        var assetView = mc.view_utility.createAssetView(summonTicket1, null, 2);
                        assetNode.addChild(assetView);
                    };

                    if (summonTicket) {
                        var byTicket = mc.GameData.playerInfo.getAsset(summonTicket.index) >= summonTicket["no"];
                        btnSummon.buyByTicket = byTicket;
                        if (byTicket) {
                            showTicket(summonTicket["no"]);
                        } else {
                            // showTicket();
                            showCost()
                        }
                    } else {
                        btnSummon.buyByTicket = false;
                        showCost();
                    }
                    var userData = btnSummon.getUserData();
                    var notifyIcon = mc.view_utility.setNotifyIconForWidget(btnSummon, notifySystem.doHaveFreeSummonPackageByIndex(userData["groupId"], userData["index"]));
                    if (notifyIcon) {
                        notifyIcon.y = btnSummon.height * 0.8;
                    }
                }
            }
            if (arrSummonPackage.length <= 1) {
                btnSummon1.x = root.width * 0.5;
                lblSummon1.x = root.width * 0.5;
                btnSummon10.x = root.width * 0.5;
                lblSummon10.x = root.width * 0.5;
                nodeAsset1.x = nodeAsset10.x = root.width * 0.5;
            } else {
                btnSummon1.x = root.width * 0.27;
                lblSummon1.x = root.width * 0.27;
                btnSummon10.x = root.width * 0.73;
                lblSummon10.x = root.width * 0.73;
                nodeAsset1.x = root.width * 0.27;
                nodeAsset10.x = root.width * 0.73;
            }

        };

        btnSummon1.setString(mc.dictionary.getGUIString("lblSX1"));
        btnSummon10.setString(mc.dictionary.getGUIString("lblSX11"));

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblSummon"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var currSummonPackageGroupId = mc.GameData.guiState.getCurrentSummonPackageGroupId();
        var notifySystem = mc.GameData.notifySystem;
        var _updateNotify = function (focusAtNotifyGroup) {
            //focusAtNotifyGroup ưu focus vào group đầu tiên đang có notify.
            var hasFocus = false;
            var currSummonPackageGroupId = mc.GameData.guiState.getCurrentSummonPackageGroupId();
            for (var i in arrHeaderView) {
                var view = arrHeaderView[i];
                var groupID = view.getUserData();
                var flag = notifySystem.doHaveFreeSummonPackage(groupID);
                if (focusAtNotifyGroup && flag && !hasFocus&&!cc.isNumber(currSummonPackageGroupId)) {
                    hasFocus = true;
                    currSummonPackageGroupId = groupID;
                    mc.GameData.guiState.setCurrentSummonPackageGroupId(groupID);
                }
                var notifyIcon = mc.view_utility.setNotifyIconForWidget(view, flag);
                if (notifyIcon) {
                    notifyIcon.y = 180;
                    notifyIcon.x = 350;
                }
            }
        };

        _updateNotify(true);
        // load footer
        var arrPackages = [];
        var allSummonPackageGroup = mc.SummonManager.getAllSummonPackageGroup();
        for (var i = 0; i < allSummonPackageGroup.length; i++) {
            var groupId = mc.SummonManager.getSummonPackageGroupId(allSummonPackageGroup[i]);
            var event = mc.SummonManager.getSummonPackageEvent(allSummonPackageGroup[i]);
            if (event == "event" && !cc.isNumber(currSummonPackageGroupId)) {//Focus nhom event
                mc.GameData.guiState.setCurrentSummonPackageGroupId(5);
            }
            arrPackages.push({
                groupId: groupId,
                url: mc.SummonManager.getSummonPackageImage(allSummonPackageGroup[i])
            });

        }

        var mapPackages = bb.utility.arrayToMap(arrPackages, function (p) {
            return p["groupId"];
        });

        var _setFocusSummonView = function (index) {
            nodeContent.removeAllChildren();
            nodeContent.addChild(new ccui.ImageView("res/png/banner/summon/" + mapPackages[index]["url"], ccui.Widget.LOCAL_TEXTURE));
            mc.GameData.guiState.setCurrentSummonPackageGroupId(index);
            _updateSummonGUI();
        };

        var arrHeaderView = bb.collection.createArray(arrPackages.length, function (index) {
            var itemView = new ccui.ImageView("res/png/banner/summon/small_" + arrPackages[index]["url"], ccui.Widget.LOCAL_TEXTURE);
            itemView.setUserData(arrPackages[index]["groupId"]);
            itemView.getReturnKey = function () {
                return arrPackages[index]["groupId"];
            };
            itemView.setCascadeOpacityEnabled(true);
            return itemView;
        });


        currSummonPackageGroupId = mc.GameData.guiState.getCurrentSummonPackageGroupId() || 0;
        this._notifySystemTrack = bb.director.trackGlueObject(notifySystem, function () {
            _updateNotify();
        });

        var layout = this._layoutBottomPackge = mc.widget_utility.createScrollNode(arrHeaderView, new ccui.ImageView("res/png/banner/summon/banner_selected.png", ccui.Widget.LOCAL_TEXTURE), 360, cc.p(root.width, 190), {
            clickFunc: function (id) {
                _setFocusSummonView(id);
            },
            autoFocusFunc: function (id) {
                _setFocusSummonView(id);
            }
        });

        layout.setLoopScroll(true);
        layout.setAnchorPoint(0.5, 0);
        layout.setPosition(root.width / 2, 30);
        this._footerView = layout;
        root.addChild(layout);
        var indexforShow = 0;
        for (var i = 0; i < arrPackages.length; i++) {
            var summonPackage = arrPackages[i];
            if (summonPackage.groupId === currSummonPackageGroupId) {
                indexforShow = i;
            }
        }
        layout.focusAt(indexforShow, true);
        _setFocusSummonView(currSummonPackageGroupId);

    },

    onExit: function () {
        this._super();
        this._notifySystemTrack && bb.director.unTrackGlueObject(this._notifySystemTrack);
        if (!this._allowCacheGroupId)
            mc.GameData.guiState.setCurrentSummonPackageGroupId(null);

    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_SUMMON_LIST);
        if (tutorialTrigger) {
            this._layoutBottomPackge.focusAt(0, true);
            this._layoutBottomPackge.returnCb.clickFunc(0);
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_ITEM_WIDGET) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._layoutBottomPackge.getChildren()[1])
                    .setScaleHole(2.0)
                    .setCharPositionY(cc.winSize.height * 0.7)
                    .show();
            } else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnSummon1)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
        }
    },

    onLayerClose: function () {
        this._super();
        bb.sound.unloadEffect(res.sound_ui_summon_start);
        bb.sound.unloadEffect(this._soundGemURL);

    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_SUMMON_LIST;
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