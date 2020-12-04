/**
 * Created by long.nguyen on 8/21/2017.
 */

mc.LoginScreen = bb.Screen.extend({
    _needDownloadNewApk: false,

    initResources: function () {
        // fix for all screen.
        mc.GameData.cleanGUIState(); // refresh the GUI state.
        var ratio = cc.winSize.width / cc.winSize.height;
        if (ratio >= 0.57) {
            cc.view.setDesignResolutionSize(750, 1334, cc.ResolutionPolicy.SHOW_ALL);
        }

        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.button_plist);
        var setting = mc.storage.readSetting();
        if(setting && setting.language && setting.language === mc.const.LANGUAGE_EN)
        {
            mc.const.IS_EN_LANGUAGE = true;
        }
        else
        {
            mc.const.IS_EN_LANGUAGE = false;
        }
        bb.sound.setEffectsVolume(setting.soundVol);
        bb.sound.setMusicVolume(setting.musicVol);
        !bb.sound.isMusicPlaying() && bb.sound.playMusic(res.sound_bgm_login);
        this.initLoadingGUI();
        this.runAction(cc.sequence([cc.delayTime(0.75), cc.callFunc(function () {
            // load the current language
            mc.dictionary.loadLanguage(function () {
                if (!this._needDownloadNewApk) {
                    this.runAction(cc.callFunc(this._startLoadingGameResource.bind(this)));
                }
                else {
                    this.runAction(cc.callFunc(this._showDownloadNewApk.bind(this)));
                }

            }.bind(this));
        }.bind(this))]));

        CreantsCocosAPI.setEnableAutoSavingToken(false);
        CreantsCocosAPI.loadDeviceString();

        //if( bb.framework.isAndroid() ){
        //    //get the package name
        //    var packageName = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "jsGetPlayerGoogleId", "()Ljava/lang/String;");
        //    if( !packageName ||
        //        packageName == '' ||
        //        packageName != mc.const.PACKAGE_NAME ){
        //        this._needDownloadNewApk = true;
        //    }
        //}
    },

    getPreLoadURL: function () {
        return [
            res.font_davidLibre_regular_ttf,
            res.font_utm_bienvenue_ttf,
            res.font_coiny_regular_ttf,
            res.font_cam_stroke_32_export_fnt,
            res.font_cam_stroke_32_export_png,
            res.font_UTMBienvenue_none_32_export_fnt,
            res.font_UTMBienvenue_none_32_export_png,
            res.button_plist,
            res.button_png,
            res.patch9_1_plist,
            res.patch9_1_png,
            res.sound_bgm_login,
            res.widget_select_server_dialog,
            res.widget_select_login_provider_dialog,
            "res/button/Start_button.png",
            "res/bar/Loading_Gauge.png",
            "res/bar/Loading_Gauge_Outline.png",
            "res/spine/Cover_Animation_Night.atlas", "res/spine/Cover_Animation_Night.json", "res/spine/Cover_Animation_Night.png",
            "res/spine/waterfallAnim_spine.atlas", "res/spine/waterfallAnim_spine.json", "res/spine/waterfallAnim_spine.png",
            "res/spine/atlas2-xhdpi.jpg", "res/spine/atlas2-xhdpi.plist"
        ];
    },

    _showDownloadNewApk: function () {
        var dialog = bb.framework.getGUIFactory().createWarningDialog(mc.dictionary.getGUIString("New Version Found"), function () {
            cc.sys.openURL("http://play.google.com/store/apps/details?id=" + mc.const.PACKAGE_NAME);
            this._showDownloadNewApk();
        }.bind(this), mc.dictionary.getGUIString("Download"));
        dialog.setEnableClickOutSize(false);
        dialog.show();
    },

    _showCover: function () {
        cc.log("Show Cover: " );
        var scale = cc.winSize.height / mc.const.DEFAULT_HEIGHT;
        var imgCover = this.getChildByName("_cover_image");
        if (imgCover) {
            imgCover.runAction(cc.sequence([cc.fadeOut(0.3), cc.removeSelf()]));
        }

        var spineCover = sp.SkeletonAnimation.createWithJsonFile("res/spine/Cover_Animation_Night.json", "res/spine/Cover_Animation_Night.atlas", scale);
        spineCover.setName("_cover_spine");
        spineCover.anchorX = spineCover.anchorY = 0.5;
        spineCover.x = cc.winSize.width * 0.5;
        spineCover.y = cc.winSize.height * 0.5;
        spineCover.width = 750 * scale;
        spineCover.height = cc.winSize.height;
        spineCover.setAnimation(0, "animation", true);
        spineCover.setLocalZOrder(-1);
        spineCover.opacity = 0;
        spineCover.runAction(cc.fadeIn(0.3));
        this.addChild(spineCover);

        //var spineCover1 = sp.SkeletonAnimation.createWithJsonFile("res/spine/waterfallAnim_spine.json", "res/spine/waterfallAnim_spine.atlas", scale);
        //spineCover1.x = cc.winSize.width * 0.1;
        //spineCover1.y = cc.winSize.height;
        //spineCover1.width = 70*scale;
        //spineCover1.setAnimation(0, "waterfallLoop", true);
        //this.addChild(spineCover1);

        cc.spriteFrameCache.addSpriteFrame("res/spine/atlas2-xhdpi.plist", "atlas2-xhdpi.jpg")
        var brkView = new ccui.ImageView("seq_01_leaves_32.jpg", ccui.Widget.PLIST_TEXTURE);
        brkView.setScale9Enabled(true);
        brkView.width = 500;
        brkView.anchorX = 0;
        brkView.anchorY = 0;
        this.addChild(brkView);

    },

    _loadServerConfigList: function (callback) {
        cc.log("MCLoginScreen._loadServerConfigList");
        // update GUI
        var self = this;
        if (self._pickServer && self._serverList) {
            callback && callback();
        }
        else {
            var strLocalManifest = cc.sys.isNative ? jsb.fileUtils.getStringFromFile("res/project.manifest") : null;
            if (!strLocalManifest) {
                strLocalManifest = cc.formatStr('{"packageUrl":"%s"}', "http://muheroes-cdn.creants.net/assets_manager/");
            }
            if (strLocalManifest) {
                self._lblStatus.setString(mc.dictionary.getGUIString("lblLoadingServerList") + "...");
                var localManifest = JSON.parse(strLocalManifest);
                var url = localManifest["packageUrl"];
                cc.log("MCLoginScreen._loadServerConfigList load local manifest with url: " + url);
                cc.log(localManifest);
                var isFail = true;
                var processServerList = function (str) {
                    cc.log("process server list");
                    if (str) {
                        var obj = null;
                        if (cc.isString(str)) {
                            obj = JSON.parse(str);
                        }
                        else {
                            obj = str;
                        }
                        var serverList = obj["servers"];
                        var arrEnableServer = [];
                        if (serverList) {
                            isFail = false;
                            for (var i = 0; i < serverList.length; i++) {
                                var serverData = serverList[i];
                                if ((serverData["type"] === "REAL") ||
                                    (serverData["type"] === "TEST" && mc.const.DEBUG_GAME)) { // show test server in debug-mode
                                    arrEnableServer.push(serverData);
                                }
                            }
                            var loginServer = mc.storage.readLoginServer();
                            if (!loginServer) {
                                var bestServer = bb.collection.findBestWith(arrEnableServer, function (serverData1, serverData2) {
                                    var val1 = serverData1["statusCode"];
                                    var val2 = serverData2["statusCode"];
                                    if (mc.const.DEBUG_GAME && serverData1["type"] === "TEST") {
                                        val1 += 10;
                                    }
                                    if (mc.const.DEBUG_GAME && serverData2["type"] === "TEST") {
                                        val2 += 10;
                                    }
                                    return val1 > val2;
                                });
                                loginServer = bestServer;
                            }
                            else {
                                // update new save server information
                                loginServer = bb.collection.findBy(arrEnableServer, function (serverData, savedServer) {
                                    return serverData["id"] === savedServer["id"];
                                }, loginServer);
                            }
                            if (!loginServer) {
                                loginServer = arrEnableServer[0];
                            }
                            self._pickServer = loginServer;
                            self._serverList = arrEnableServer;
                            cc.log(self._pickServer + ", " + self._serverList);
                            self._createPickServerContainer();
                            callback && callback();
                        }
                    }
                    isFail && bb.framework.getGUIFactory().createWarningDialog(mc.dictionary.getGUIString("txtFailCanNotLoadServerList")).show();
                }.bind(this);

                if (mc.storage.readTestServerConfig() || !cc.sys.isNative) {
                    cc.log("MCLoginScreen._loadServerConfigList read test server config or is not native ");
                    var resServer = "res/server-list.json";
                    cc.loader.load(resServer, function () {
                    }, function () {
                        var str = cc.loader.getRes(resServer);
                        processServerList(str);
                    });
                } else {
                    var reqUrl = url + "manifest/mufantasy/res/server-list.json";
                    cc.log("req manifest: " + reqUrl);
                    processServerList(mc.const.SERVERS);
                    // bb.utility.getJsonData(reqUrl, function (str) {
                    //     processServerList(str);
                    // }.bind(this));

                }
            }
        }
    },

    initLoadingGUI: function () {
        cc.log("MCLoginScreen.initLoadingGUI ....");
        const layer = this;

        this._showCover();

        const btnStartGame = this._btnStartGame = new ccui.ImageView("res/button/Start_button.png", ccui.Widget.LOCAL_TEXTURE);
        btnStartGame.x = cc.winSize.width * 0.5;
        btnStartGame.y = cc.winSize.height * 0.07;
        btnStartGame.opacity = 0;
        layer.addChild(btnStartGame);

        // var video = new ccui.VideoPlayer();
        // var scrWidth = cc.winSize.width;
        // var scrHeight = cc.winSize.height;
        // video.setContentSize(scrWidth, scrHeight);
        // video.setPosition(scrWidth/2,scrHeight/2);
        // window.video = video;
        // layer.addChild(video);
        // video.setURL('res/video/okbaby.mp4');
        // video.play();

        const btnSetting = new ccui.ImageView("button/roundSetting.png", ccui.Widget.PLIST_TEXTURE);
        btnSetting.x = cc.winSize.width - btnSetting.width * 0.5 - 10;
        btnSetting.y = cc.winSize.height - btnSetting.height * 0.5 - 10;
        btnSetting.registerTouchEvent(function () {
            new mc.DialogMenu(true).show();
        });
        layer.addChild(btnSetting);

        const progressContainer = this._progressContainer = new ccui.Widget();
        progressContainer.scale = 0.8;
        progressContainer.x = cc.winSize.width * 0.5;
        progressContainer.y = cc.winSize.height * 0.07;
        const brkProgress = new cc.Sprite("res/bar/Loading_Gauge_Outline.png");
        const progress = this._progressLoading = new cc.ProgressTimer(new cc.Sprite("res/bar/Loading_Gauge.png"));
        const lblStatus = this._lblStatus = new ccui.TextBMFont("", res.font_cam_stroke_32_export_fnt);
        lblStatus.anchorX = 0.5;
        lblStatus.y = 50;
        progress.barChangeRate = cc.p(1.0, 0.0);
        progress.midPoint = cc.p(0.0, 1.0);
        progress.type = cc.ProgressTimer.TYPE_BAR;
        progressContainer.addChild(progress);
        progressContainer.addChild(brkProgress);
        progressContainer.addChild(lblStatus);
        layer.addChild(progressContainer);
        this._progressContainer.setVisible(false);

        const lblVersion = this.lblVersion = bb.framework.getGUIFactory().createText("");
        lblVersion.anchorX = 1.0;
        lblVersion.x = cc.winSize.width * 0.985;
        lblVersion.y = 25;
        if (!mc.const.DEBUG_GAME) {
            var count = 0;
            lblVersion._touchScale = 0.001;
            lblVersion._disableClickSound = true;
            lblVersion.registerTouchEvent(function () {
                count++;
                if (count >= 20) {
                    mc.const.DEBUG_GAME = true;
                }
            });
        }
        layer.addChild(lblVersion);
        return layer;
    },

    _startLoadingGameResource: function () {
        var self = this;
        cc.log("_startLoadingGameResource ??");
        if(cc.sys.isNative){
            var strLocalManifest = jsb.fileUtils.getStringFromFile("res/project.manifest");
            var localManifest = JSON.parse(strLocalManifest);
            this.lblVersion.setString("Build: " + localManifest["version"] +" "+  mc.dictionary.getGUIString("lblVersion") + mc.const.VERSION);
        }else{
            this.lblVersion.setString(mc.dictionary.getGUIString("lblVersion") + mc.const.VERSION);
        }

        var _checkLoadServerList = function () {
            cc.log("MCLoginScreen._startLoadingGameResource check load server list");
            // load game data.
            mc.dictionary.loadData();
            //bb.pluginBox.ads.init();
            bb.pluginBox.iap.init();
            //bb.pluginBox.analytics.init();
            self.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function () {
                bb.pluginBox.ads.cache();
            })]));
            cc.log("MCLoginScreen._startLoadingGameResource: Do load config");
            CreantsCocosAPI.loadConfig();

            cc.log("MCLoginScreen._startLoadingGameResource: readLoginServer");
            var savedLoginServer = mc.storage.readLoginServer();
            cc.log("MCLoginScreen savedLoginServer: " + savedLoginServer);

            if((!savedLoginServer || !CreantsCocosAPI.getItem(creants_api.KEY_LOGIN_TOKEN)) || !this._loginBySavedToken()){
                this._showBtnStartGame();
            }

        }.bind(this);


        if (!cc.sys.isNative) {
            this._progressContainer.setVisible(true);
            var arrRes = cc.copyArray(mc.resource.data_res);
            arrRes = bb.collection.arrayAppendArray(arrRes, mc.resource.main_res);
            arrRes = bb.collection.arrayAppendArray(arrRes, mc.resource.battle_effect);
            cc.loader.load(arrRes, function (result, count, loadedCount) {
                var percent = (loadedCount / count * 100) | 0;
                percent = Math.min(percent, 100);
                self.displayPercent(percent);
            }, function () {
                self.displayPercent(100);
                _checkLoadServerList();
            })
        }
        else {
            _checkLoadServerList();
        }
    },

    displayPercent: function (percent) {
        var newProgress = percent;
        this._progressLoading.setPercentage(newProgress);
        this._lblStatus.setString(mc.dictionary.getGUIString("lblLoading") + " " + percent + "%");
    },

    _createPickServerContainer: function () {
        var selectServerPanel = this._pickServerContainer;
        if (this._pickServerContainer) {
            this._pickServerContainer.removeAllChildren(true);
        }
        else {
            selectServerPanel = this._pickServerContainer = new ccui.Layout();
            this.addChild(selectServerPanel);
        }

        var pickServer = this._pickServer;
        var serverList = this._serverList;
        selectServerPanel.anchorX = selectServerPanel.anchorY = 0.5;
        selectServerPanel.width = 404;
        selectServerPanel.height = 59;
        var brk = new ccui.ImageView("patch9/Map_Tittle_Name.png", ccui.Widget.PLIST_TEXTURE);
        brk.setScale9Enabled(true);
        brk.width = selectServerPanel.width;
        brk.height = selectServerPanel.height;
        var lblName = bb.framework.getGUIFactory().createText(pickServer["name"]);
        lblName.anchorX = 0;
        var lblStatus = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString(mc.storage.MAP_SERVER_STATUS_BY_CODE[pickServer["statusCode"]]['name']));
        lblStatus.setColor(mc.storage.MAP_SERVER_STATUS_BY_CODE[pickServer["statusCode"]]['color']);
        lblStatus.anchorX = 1.0;
        selectServerPanel.addChild(brk);
        selectServerPanel.addChild(lblName);
        selectServerPanel.addChild(lblStatus);
        brk.x = selectServerPanel.width * 0.5;
        brk.y = selectServerPanel.height * 0.5;
        lblName.x = selectServerPanel.width * 0.14;
        lblStatus.x = selectServerPanel.width * 0.80;
        lblName.y = lblStatus.y = selectServerPanel.height * 0.57;
        selectServerPanel.x = cc.winSize.width * 0.5;
        selectServerPanel.y = this._btnStartGame.y + selectServerPanel.height + 50;
        selectServerPanel.registerTouchEvent(function () {
            new mc.SelectServerDialog(pickServer, serverList, function (selectServer) {
                this._pickServer = selectServer;
                this._createPickServerContainer();
            }.bind(this)).show();
        }.bind(this));

        serverList && this._pickServerContainer.setVisible(serverList.length > 1);

        this._updateStartButtonStatus();
    },

    _updateStartButtonStatus: function () {
        var self = this;
        if (self._pickServer) {
            if (parseInt(self._pickServer["statusCode"]) <= -2) {
                self._btnStartGame.setColor(mc.color.BLACK_DISABLE_STRONG);
                self._btnStartGame.setEnabled(false);
            }
            else {
                self._btnStartGame.setColor(mc.color.WHITE_NORMAL);
                self._btnStartGame.setEnabled(true);
            }
        }
    },

    _unRegisterAllListener: function () {
        this._socketStateTrack && bb.director.unTrackGlueObject(this._socketStateTrack);
        this._playerInfoTrack && bb.director.unTrackGlueObject(this._playerInfoTrack);
        this._exeptionTrack && bb.director.unTrackGlueObject(this._exeptionTrack);

        this._socketStateTrack = null;
        this._playerInfoTrack = null;
        this._exeptionTrack = null;
    },

    _registerPlayerInfoListener: function () {
        var self = this;
        var _showGame = function () {
            self._facebookToken && CreantsCocosAPI.linkFacebook(self._facebookToken, mc.GameData.playerInfo.getId());
            self._accountKitToken && CreantsCocosAPI.linkAccountKit(self._accountKitToken, mc.GameData.playerInfo.getId());
            self._pickServer && mc.storage.saveLoginServer(self._pickServer);
            CreantsCocosAPI.saveLoginToken();
            if (mc.const.SKIP_TUTORIAL_BATTLE) {
                new mc.MainScreen().show();
            }
            else {
                if (mc.GameData.storyManager.getStoryIndex() === 0) {
                    new mc.BackgroundStoryScreen().show();
                }
                else {
                    new mc.MainScreen().show();
                }
            }
        };
        self._playerInfoTrack = bb.director.trackGlueObject(mc.GameData.playerInfo, function (data) {
            if (self._waitLoginId) {
                mc.view_utility.hideLoadingDialogById(self._waitLoginId);
            }
            if (mc.GameData.playerInfo.isHaveMuAcc()) {
                _showGame();
            }
        });
    },

    _registerExceptionListener: function () {
        var self = this;
        self._exeptionTrack = bb.director.trackGlueObject(mc.GameData.exception, function () {
            if (self._waitLoginId) {
                mc.view_utility.hideLoadingDialogById(self._waitLoginId);
            }
            var excData = mc.GameData.exception.getExceptionData();
            if (excData["ec"]) { // expire token, error code
                CreantsCocosAPI.clearFacebookToken();
                self._showBtnStartGame();
            }
        });

    },

    _loginBySavedToken: function () {
        cc.log("_loginBySavedToken");
        var self = this;
        var isNotFirstTimeLogin = cc.sys.localStorage.getItem("FIRST_TIME_LOGIN");
        if(!isNotFirstTimeLogin){
            CreantsCocosAPI.removeItem(creants_api.KEY_LOGIN_TOKEN);
            cc.sys.localStorage.setItem("FIRST_TIME_LOGIN", true);
        }

        var str = CreantsCocosAPI.getItem(creants_api.KEY_LOGIN_TOKEN);

        cc.log("token: ");
        cc.log(str);
        var tokenObj = null;
        if (str) {
            tokenObj = JSON.parse(str);
        }
        if (tokenObj && !mc.const.TEST_DEVICE) {
            self._lblStatus.setString(mc.dictionary.getGUIString("lblConnectingServer") + "...");
            cc.log('_loginBySavedToken: ' + tokenObj.token);
            var pickServer = self._pickServer || mc.storage.readLoginServer();
            if (pickServer["msg"]) {
                self._lblStatus.setString("");
                var strMsg = pickServer["msg"][mc.storage.setting.language];
                if (!strMsg) {
                    strMsg = pickServer["msg"]["en"];
                }
                bb.framework.getGUIFactory().createWarningDialog(strMsg).show();
            }
            else {
                self._waitLoginId = mc.view_utility.showLoadingDialog(20, function () {
                    bb.framework.getGUIFactory().createConnectionSupport().show();
                    self._showBtnStartGame();
                });
                cc.log('startConnect: ' + pickServer["auth"] + ", " + pickServer["ws"]);
                mc.protocol.startConnect(pickServer["auth"], pickServer["ws"]);
                self._unRegisterAllListener();
                self._socketStateTrack = bb.director.trackGlueObject(mc.GameData.connectionState, function (state) {
                    if (!mc.GameData.connectionState || mc.GameData.connectionState.isClose()) {
                        mc.view_utility.hideLoadingDialogById(self._waitLoginId);
                        bb.framework.getGUIFactory().createConnectionSupport().show();
                        self._showBtnStartGame();
                    }
                    if (mc.GameData.connectionState && mc.GameData.connectionState.isOpen()) {
                        mc.protocol.logInMUGame(tokenObj);
                    }
                });
                self._registerPlayerInfoListener();
                self._registerExceptionListener();
                return true;
            }
        }
        return false;
    },

    _loginByType: function (loginType) {
        var self = this;
        if (mc.GameData.connectionState && mc.GameData.connectionState.isOpen()) {
            var _showFail = function (fail) {
                var msg = fail.msg;
                if (!msg) {
                    msg = "Code: " + fail.code;
                }
                cc.log("LOGIN_FAIL: " + msg);
                bb.framework.getGUIFactory().createConnectionSupport().show();
                self._showBtnStartGame();
            };

            var _signInByTokenTest = function() {
                cc.log("_singInByTokenTest");
                self._waitLoginId = mc.view_utility.showLoadingDialog();
                var result = {"token": mc.const.TEST_GAME_TOKEN};
                mc.protocol.logInMUGame(result);
            }

            var _signInByFacebook = function () {
                cc.log("_signInByFacebook");
                var dialogId = mc.view_utility.showLoadingDialog(20, function () {
                    bb.framework.getGUIFactory().createWarningDialog(mc.dictionary.getGUIString("txtFailCanNotLoginByFaceBook")).show();
                    self._showBtnStartGame();
                });
                CreantsCocosAPI.signInByFaceBook(function (result, fail) {
                    mc.view_utility.hideLoadingDialogById(dialogId);
                    if (result) {
                        self._waitLoginId = mc.view_utility.showLoadingDialog();
                        self._facebookToken = result.token;
                        mc.protocol.logInMUGame(result);
                    }
                    else {
                        _showFail(fail);
                    }
                });
            };
            var _signInByGuest = function () {
                var dialogId = mc.view_utility.showLoadingDialog(20, function () {
                    bb.framework.getGUIFactory().createConnectionSupport().show();
                    self._showBtnStartGame();
                });
                CreantsCocosAPI.signInByGuest(function (result, fail) {
                    mc.view_utility.hideLoadingDialogById(dialogId);
                    if (result) {
                        self._waitLoginId = mc.view_utility.showLoadingDialog();
                        mc.protocol.logInMUGame(result);
                    }
                    else {
                        _showFail(fail);
                    }
                });
            };
            var _signInByGoogle = function () {
            };
            var _signInByApple = function () {
            };
            var _signInByPhone = function () {
                var dialogId = mc.view_utility.showLoadingDialog(60, function () {
                    bb.framework.getGUIFactory().createConnectionSupport().show();
                    self._showBtnStartGame();
                });
                CreantsCocosAPI.signInByAccountKit(function (result, fail) {
                    mc.view_utility.hideLoadingDialogById(dialogId);
                    if (result) {
                        self._waitLoginId = mc.view_utility.showLoadingDialog();
                        self._accountKitToken = result.token;
                        mc.protocol.logInMUGame(result);
                    }
                    else {
                        _showFail(fail);
                    }
                });
            };
            if(mc.const.TEST_GAME_TOKEN){
                _signInByTokenTest();
            }
            else if (loginType === "google") {
                _signInByGoogle();
            }
            else if (loginType === "apple") {
                _signInByApple();
            }
            else if (loginType === "phone") {
                _signInByPhone();
            }
            else if (loginType === "facebook") {
                _signInByFacebook();
            }
            else if (loginType === "guest") {
                if (mc.const.TEST_DEVICE) {
                    _signInByGuest();
                }
                else {
                    var dialogId = mc.view_utility.showLoadingDialog(20);
                    CreantsCocosAPI.loadDeviceString(function (strDeviceId) {
                        mc.view_utility.hideLoadingDialogById(dialogId);
                        if (strDeviceId) {
                            _signInByGuest();
                        }
                        else {
                            bb.framework.getGUIFactory().createWarningDialog(mc.dictionary.getGUIString("txtFailCanNotLoginByDevice")).show();
                            self._showBtnStartGame();
                        }
                    });
                }
            }
        }
        else {
            var pickServer = self._pickServer || mc.storage.readLoginServer();
            var _connectToPickingServer = function () {
                self._lblStatus.setString(mc.dictionary.getGUIString("lblConnectingServer") + "...");
                mc.protocol.startConnect(pickServer["auth"], pickServer["ws"]);
                self._unRegisterAllListener();
                self._socketStateTrack = bb.director.trackGlueObject(mc.GameData.connectionState, function (state) {
                    if (mc.GameData.connectionState.isClose()) {
                        bb.framework.getGUIFactory().createConnectionSupport().show();
                        self._showBtnStartGame();
                    }
                    if (mc.GameData.connectionState.isOpen()) {
                        CreantsCocosAPI.loadConfig();
                        self._loginByType(loginType);
                    }
                });
                self._registerPlayerInfoListener();
                self._registerExceptionListener();
                self._hideBtnStartGame();
            }.bind(this);
            if (pickServer["msg"]) {
                self._lblStatus.setString("");
                var strMsg = pickServer["msg"][mc.storage.setting.language];
                if (!strMsg) {
                    strMsg = pickServer["msg"]["en"];
                }
                var dialog = bb.framework.getGUIFactory().createWarningDialog(strMsg, function () {
                    mc.const.DEBUG_GAME && _connectToPickingServer();
                });
                dialog.show();
                self._showBtnStartGame();
            }
            else {
                _connectToPickingServer();
            }
        }
    },

    _hideBtnStartGame: function () {
        var self = this;
        if (self._pickServerContainer) {
            self._pickServerContainer.stopAllActions();
            self._pickServerContainer.runAction(cc.fadeOut(0.3));
        }
        self._btnStartGame.runAction(cc.fadeOut(0.3));
        self._btnStartGame.setEnabled(false);
        self._lblStatus.opacity = 255;
    },

    _showBtnStartGame: function () {
        cc.log("Start Game!!!");
        this._lblStatus.setString("");
        var self = this;
        var _showBtnStart = function () {
            if (self._pickServerContainer) {
                self._pickServerContainer.stopAllActions();
                self._pickServerContainer.setCascadeOpacityEnabled(true);
                self._pickServerContainer.opacity = 0;
                self._pickServerContainer.runAction(cc.fadeIn(0.3));
            }
            self._progressContainer.fadeAll(0.3);
            self._btnStartGame.runAction(cc.sequence([cc.fadeIn(0.3)]));
            self._btnStartGame.setEnabled(true);
            self._btnStartGame.registerTouchEvent(function () {
                new mc.SelectLoginProviderDialog(bb.framework.isIos() ? "apple" : "google", function (loginType) {
                    self._hideBtnStartGame();
                    self._loginByType(loginType);
                }.bind(this)).show();
            });
        };

        self._loadServerConfigList(function () {
            _showBtnStart();
            self._updateStartButtonStatus();
        });
    },

    onExit: function () {
        this._super();
        this._unRegisterAllListener();
    }

});
