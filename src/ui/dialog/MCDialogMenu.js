/**
 * Created by long.nguyen on 8/28/2017.
 */
mc.DialogMenu = mc.DefaultDialog.extend({

    ctor: function (isSimple) {
        this._super(mc.dictionary.getGUIString("lblSetting"));

        cc.spriteFrameCache.addSpriteFrames(res.icon_plist);
        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
        var contentView = ccs.load(isSimple ? res.widget_simple_menu : res.widget_menu, "res/").node.getChildByName("root");
        this.setContentView(contentView);

        var mapView = bb.utility.arrayToMap(contentView.getChildren(), function (child) {
            return child.getName();
        });

        var sliderSound = mapView["sliderSound"];
        var sliderMusic = mapView["sliderMusic"];
        var btnSupport = mapView["btnSupport"];
        var btnCredits = mapView["btnCredits"];
        var lblPlayerId = mapView["lblPlayerId"];
        var lblPlayerName = mapView["lblPlayerName"];
        var btnChangeName = mapView["btn_change_name"];
        var imgVip = mapView["img_vip"];
        var lblServer = mapView["lblServer"];
        var btnLogOut = mapView["btnLogOut"];
        var btnNews = mapView["btnNews"];

        var lblPlayerLevel = mapView["lblPlayerLevel"];
        var lblLanguage = mapView["lblLanguage"];
        var btnLanguage = mapView["btnLanguage"];
        var brkLanguage = mapView["brkLanguage"];
        var btnLinkAcc = mapView["btnLinkAcc"];
        var btnGiftCode = mapView["btnGiftCode"];
        var btnOfficeSite = mapView["btnOfficeSite"];
        var iconSpeaker = mapView["iconSpeaker"];
        var iconMusic = mapView["iconMusic"];
        var btnTerm = mapView["btnTerm"];
        var lblVersion = mapView["lblVersion"];
        var nodeAvt = mapView["nodeAvt"];
        var nodeLanguage = mapView["nodeLanguage"];
        var lblExp = mapView["lblExp"];
        var progressExp = mapView["progressExp"];

        lblLanguage.setColor(mc.color.BROWN_SOFT);
        lblVersion.setColor(mc.color.BROWN_SOFT);
        lblVersion.setString(mc.dictionary.getGUIString("lblVersion") + mc.const.VERSION);
        if(mc.enableReplaceFontBM())
        {
            lblVersion = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblVersion);
            lblPlayerLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPlayerLevel);
            lblLanguage = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLanguage);
            lblServer = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblServer);
            lblPlayerId = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPlayerId);
        }

        var baseURL = "icon/Language/";
        var widgetEnglish = new ccui.ImageView(baseURL + "en_normal.png", ccui.Widget.PLIST_TEXTURE);
        var widgetVietNam = new ccui.ImageView(baseURL + "vi_normal.png", ccui.Widget.PLIST_TEXTURE);

        widgetEnglish.language = mc.const.LANGUAGE_EN;
        widgetVietNam.language = mc.const.LANGUAGE_VI;

        var chooseLanguage = function (locale) {
            if (locale) {
                mc.storage.readSetting().language = locale;
                mc.storage.saveSetting();
                if(locale === "en")
                {
                    mc.const.IS_EN_LANGUAGE = true;
                }
                else
                {
                    mc.const.IS_EN_LANGUAGE = false;
                }
                if (mc.GameData.settingManager) {
                    mc.GameData.settingManager.saveAll();
                    mc.GameData.settingManager.flush(function () {
                    });
                }
            }
        };

        var arrFlagView = {en: widgetEnglish, vi: widgetVietNam};
        var arrFlag = [widgetEnglish, widgetVietNam];

        if (!isSimple) {
            var playerInfo = mc.GameData.playerInfo;
            lblPlayerId && lblPlayerId.setColor(mc.color.BROWN_SOFT);
            lblServer && lblServer.setColor(mc.color.BROWN_SOFT);
            lblPlayerLevel && lblPlayerLevel.setColor(mc.color.BROWN_SOFT);
            lblPlayerId && lblPlayerId.setString("Id: " + mc.GameData.playerInfo.getUserId());
            lblPlayerName && lblPlayerName.setString(mc.GameData.playerInfo.getName());
            lblPlayerLevel && lblPlayerLevel.setString(mc.dictionary.getGUIString("lblLv.") + mc.GameData.playerInfo.getLevel());
            lblExp && lblExp.setString(bb.utility.formatNumber(playerInfo.getExp()) + "/");
            lblExp && lblExp.setDecoratorLabel(bb.utility.formatNumber(playerInfo.getMaxExp()), mc.color.BLUE_ELEMENT);
            progressExp && progressExp.setPercent(playerInfo.getExp() / playerInfo.getMaxExp() * 100);

            var _createAvatarPlayer = function () {
                nodeAvt.removeAllChildren();
                var avt = mc.view_utility.createAvatarPlayer(mc.GameData.playerInfo.getAvatarIndex(), mc.GameData.playerInfo.isVIP());
                avt.registerTouchEvent(function () {
                    new mc.ChangeAvatarDialog(function () {
                        _createAvatarPlayer();
                    }).show()
                });
                nodeAvt.addChild(avt);

            };
            _createAvatarPlayer();

            var str = CreantsCocosAPI.getItem(creants_api.KEY_LOGIN_TOKEN);
            var tokenObj = null;
            if (str) {
                tokenObj = JSON.parse(str);
            }

            btnLogOut.registerTouchEvent(function (sender, type) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.logOutMUGame(function (rs) {
                    if (tokenObj.type === creants_api.const_key.LOGIN_TYPE_FACEBOOK) {
                        bb.pluginBox.facebook.logOut();
                    }
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (rs) {
                        CreantsCocosAPI.clearToken();
                        new mc.LoginScreen().show();
                    }
                    mc.storage.clearNotifyInfo();
                });
            });

            btnNews.registerTouchEvent(function (sender, type) {
                new mc.WhatNewDialog().show();

            });

            btnLinkAcc.setColor(mc.color.BLACK_DISABLE_SOFT);
            btnLinkAcc.setEnabled(false);
            if (!CreantsCocosAPI.isLinkedAccount(mc.GameData.playerInfo.getId())) {
                btnLinkAcc.setColor(mc.color.WHITE_NORMAL);
                btnLinkAcc.setEnabled(true);
            }

            btnChangeName.registerTouchEvent(function (sender, type) {
                new mc.ChangeNameDialog(function (rs) {
                    if (rs) {
                        lblPlayerName && lblPlayerName.setString(mc.GameData.playerInfo.getName());
                    }
                }).show();
            }.bind(this));

            btnLinkAcc.registerTouchEvent(function (sender, type) {
                new mc.DialogLinkAccount().show();
            });
            btnGiftCode.registerTouchEvent(function (sender, type) {
                new mc.GetRewardByGiftCodeDialog().show();
            });

            var loginServer = mc.storage.readLoginServer();
            if (loginServer) {
                if (lblServer) {
                    lblServer.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function () {
                        this.setString(loginServer["name"] + ": " + new Date(bb.now()).toLocaleString());
                    }.bind(lblServer), this)).repeatForever());
                }
            }
        }

        var showFocus = function (widget) {
            widgetEnglish.loadTexture(baseURL + "en_normal.png", ccui.Widget.PLIST_TEXTURE);
            widgetVietNam.loadTexture(baseURL + "vi_normal.png", ccui.Widget.PLIST_TEXTURE);
            if (widget === widgetEnglish) {
                widgetEnglish.loadTexture(baseURL + "en_focus.png", ccui.Widget.PLIST_TEXTURE);
            } else if (widget === widgetVietNam) {
                widgetVietNam.loadTexture(baseURL + "vi_focus.png", ccui.Widget.PLIST_TEXTURE);
            }
        };

        var focusAt = arrFlagView[mc.storage.readSetting().language];
        if (focusAt) {
            showFocus(focusAt);
        }

        for (var i in arrFlagView) {
            arrFlagView[i].registerTouchEvent(function (flagView) {
                showFocus(flagView);
                chooseLanguage(flagView.language);
            });
        }

        btnOfficeSite.registerTouchEvent(function (sender, type) {
            //var lan = mc.storage.readSetting()["language"];
            //if (lan === "vi") {
            //    cc.sys.openURL("https://www.facebook.com/MUofHeroes/");
            //} else {
            //    cc.sys.openURL("https://www.facebook.com/MUofHeroesGlobal/");
            //}
            cc.sys.openURL("https://www.facebook.com/MUofHeroes/");
        });
        btnTerm.registerTouchEvent(function (sender, type) {
            cc.sys.openURL(mc.const.URL_TERM);
        });

        btnSupport.registerTouchEvent(function (sender, type) {
            cc.log("show support!!!!!");
            new mc.SupportDialog().show();
        });

        btnCredits.registerTouchEvent(function (sender, type) {
            new mc.CreditDialog().show();
        });

        mc.view_utility.registerSoundAndMusicSlider(iconSpeaker, iconMusic, sliderSound, sliderMusic);
        btnLanguage.registerTouchEvent(function () {
            new mc.ListGameLanguage().show();
        });
        var self = this;
        var _updateLanguage = function () {
            var titleView = self.titleLbl;
            if (titleView) {
                titleView.setString(mc.dictionary.getGUIString("lblSetting"));
                //if(mc.const.ENABLE_REPLACE_FONT_BM)
                //{
                //    self.titleLbl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(titleView);
                //}
            }
            lblVersion.setString(mc.dictionary.getGUIString("lblVersion") + mc.const.VERSION);
            lblLanguage.setString(mc.dictionary.getGUIString("lblLanguage"));
            btnLanguage.setString(mc.languageConfig.languages[mc.storage.readSetting().language],null, mc.const.FONT_SIZE_24);
            var lbl = btnSupport.setString(mc.dictionary.getGUIString("lblSupport"));
            lbl.scale = 0.8;
            lbl = btnCredits.setString(mc.dictionary.getGUIString("lblCredits"));
            lbl.scale = 0.8;
            lbl = btnOfficeSite.setString(mc.dictionary.getGUIString("lblOfficialSite"));
            lbl.scale = 0.8;
            lbl = btnTerm.setString(mc.dictionary.getGUIString("lblTerm"));
            lbl.scale = 0.8;
            if (btnLinkAcc) {
                var lblLink = btnLinkAcc.setString(mc.dictionary.getGUIString("lblLink"), res.font_UTMBienvenue_stroke_32_export_fnt);
                lblLink.x = btnLinkAcc.width * 0.6;
            }
            if (btnGiftCode) {
                var lblGift = btnGiftCode.setString(mc.dictionary.getGUIString("lblGiftCode"), res.font_UTMBienvenue_stroke_32_export_fnt);
                lblGift.x = btnGiftCode.width * 0.6;
            }
            if (btnLogOut) {
                var lblRedeem = btnLogOut.setString(mc.dictionary.getGUIString("lblLogOut"),null, mc.const.FONT_SIZE_24);
            }
            if (btnNews) {
                var lblRedeem = btnNews.setString(mc.dictionary.getGUIString("lblWhatNew"),null, mc.const.FONT_SIZE_24);
            }
        };

        _updateLanguage();
        this.traceDataChange(mc.storage.settingChanger, function (data) {
            mc.storage.settingChanger.performChanging({
                "language": function (oldLan, newLan) {
                    _updateLanguage();
                }
            }, true);
        });

        var _showVIPInfo = function () {
            if (imgVip) {
                var lblVIPInfo = contentView.getChildByName("lblVipInfo");
                imgVip.loadTexture("icon/ico_standard.png", ccui.Widget.PLIST_TEXTURE);
                if (mc.GameData.playerInfo.isVIP()) {
                    imgVip.loadTexture("icon/ico_premium.png", ccui.Widget.PLIST_TEXTURE);
                    if (!lblVIPInfo) {
                        lblVIPInfo = bb.framework.getGUIFactory().createText();
                        lblVIPInfo.anchorX = 0;
                        lblVIPInfo.setColor(mc.color.GREEN_NORMAL);
                        lblVIPInfo.x = imgVip.x + imgVip.width * 0.5 + 5;
                        lblVIPInfo.y = imgVip.y;
                        contentView.addChild(lblVIPInfo);
                        lblVIPInfo.setName("lblVipInfo");
                    }
                }
                if (lblVIPInfo) {
                    lblVIPInfo.setVisible(false);
                    lblVIPInfo.stopAllActions();
                    if (mc.GameData.playerInfo.isVIP()) {
                        lblVIPInfo.setVisible(true);
                        var _formatVIPStrDate = function () {
                            if (mc.GameData.playerInfo) {
                                var durationInSecond = mc.GameData.playerInfo.getVIPTimer();
                                var deltaInMs = durationInSecond - (bb.now() - mc.GameData.svStartTime());
                                if (deltaInMs < 0) {
                                    deltaInMs = 0;
                                }
                                lblVIPInfo.setString(mc.view_utility.formatDurationTime(deltaInMs));
                            }
                        };
                        lblVIPInfo.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function () {
                            _formatVIPStrDate();
                        })]).repeatForever());
                        _formatVIPStrDate();
                    } else {
                        lblVIPInfo.removeFromParent(true);
                    }
                }
            }
        };

        _showVIPInfo();
        this.traceDataChange(mc.GameData.playerInfo, function () {
            _showVIPInfo();
        });

    },

    onExit: function () {
        this._super();
        if (mc.storage.isChange) {
            mc.storage.isChange = false;
            mc.storage.saveSetting();
        }
    }

});


/**
 * Created by Thanh.Vo on 6/01/2019.
 */
mc.ListGameLanguage = mc.DefaultDialogType2.extend({
    ctor: function () {
        this._super(mc.dictionary.getGUIString("lblLanguage"));
        var gridLayout = bb.layout.grid(bb.collection.createArray(mc.languageConfig.support_lang_code.length, function (index) {
            return this.createLangButton(mc.languageConfig.support_lang_code[index]);
        }.bind(this)), 2, 500, 3);
        this.setContentView(gridLayout, {
            top: 40,
            bottom: 80
        });
        this.setBlackBackgroundEnable(false);
    },

    createLangButton: function (code) {
        var button = new ccui.ImageView("button/btn_setting.png", ccui.Widget.PLIST_TEXTURE);
        button.setScale9Enabled(true);
        button.setScale(0.7);
        if(mc.enableReplaceFontBM())
        {
            var lbl = button.setString(mc.languageConfig.languages[code],null, mc.const.FONT_SIZE_24);
            lbl.setFontSize(34)
        }
        else
        {
            button.setString(mc.languageConfig.languages[code],null, mc.const.FONT_SIZE_24);
        }

        button.setUserData(code);
        var commingSoons = mc.languageConfig.comming_soon;
        var flag = false;
        for (var i = 0; i < commingSoons.length; i++) {
            var id = commingSoons[i];
            if (code == id) {
                flag = true;
            }
        }

        if (flag) {
            button.registerTouchEvent(function () {
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtComingSoon"));
            });
        } else
            button.registerTouchEvent(this._onClickButtonLang.bind(this));
        return button;
    },

    _onClickButtonLang: function (button) {
        var code = button.getUserData();
        this.chooseLanguage(code);
        this.close();
    },

    chooseLanguage: function (locale) {
        if (locale) {
            mc.storage.readSetting().language = locale;
            if(locale === mc.const.LANGUAGE_EN)
            {
                mc.const.IS_EN_LANGUAGE = true;
            }
            else
            {
                mc.const.IS_EN_LANGUAGE = false;
            }
            mc.storage.saveSetting();
            if (mc.GameData.settingManager) {
                mc.GameData.settingManager.saveAll();
                mc.GameData.settingManager.flush(function () {
                });
            }
        }
    }
});