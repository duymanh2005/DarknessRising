/**
 * Created by longnguyen on 10/18/2016.
 */
bb.GUIFactory = cc.Class.extend({

    createSplashScene: function () {
        return new bb.DefaultSplashScene();
    },

    createGameIntroductionScene: function () {
        return null;
    },

    createLoadingDialog: function () {
        return new bb.DefaultLoadingDialog();
    },

    createTransitionScene: function (scene) {
        return new cc.TransitionFade(0.5, scene);
    },

    createLoadingScene: function () {
        return new bb.DefaultLoadingScene();
    },

    createButtonSoundEffect: function () {
        return null;
    },

    createExitGameDialog: function () {
        var brk = new ccui.Layout();
        brk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        brk.setBackGroundColor(cc.color.GRAY);
        return new bb.DefaultDialog()
            .setTitle(mc.dictionary.getGUIString("lblWarning"))
            .setMessage("Do u want to quit?")
            .setBackgroundView(brk)
            .enableExitButton()
            .enableYesNoButton(function () {
                cc.director.end();
            });
    },

    createDialog: function (title, strWarning, funcOk, lblBtn) {
        var brk = new ccui.Layout();
        brk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        brk.setBackGroundColor(cc.color.GRAY);
        var dialog = new bb.DefaultDialog()
            .setTitle(title)
            .setMessage(strWarning)
            .setBackgroundView(brk)
            .enableExitButton();
        (funcOk && lblBtn) && dialog.enableOkButton(funcOk, lblBtn);
    },

    createWarningDialog: function (strWarning, funcOk, lblBtn) {
        return this.createDialog("Warning", strWarning, funcOk, lblBtn);
    },

    createConnectionSupport: function () {
        var dialog = new mc.DefaultDialog()
            .setTitle("Warning")
            .setMessage(mc.dictionary.getGUIString("txtCanNotLoginByInternetConnection"));
        var btn1 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblSupport"));
        var btn2 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblClose"));
        dialog.setButton_1View(btn1, function () {
            cc.sys.openURL("https://www.facebook.com/groups/173043833624803/");
        }.bind(this));
        dialog.setButton_2View(btn2, function () {
            dialog.close();
        }.bind(this));
        return dialog;
    },

    createInfoDialog: function (strWarning, funcOk, lblBtn) {
        return this.createDialog("Info", strWarning, funcOk, lblBtn);
    },

    createGUIParserManager: function () {
        return new bb.GUIParserManager();
    },

    createButton: function (title, callback) {
        var btn = new ccui.Button();
        btn.setTitleLabel(title);
        btn.setScale9Enabled(true);
        btn.width = 150;
        btn.height = 70;
        btn.registerTouchEvent(callback);
        return btn;
    },

    createText: function (text, fontType, fontSize) {
        var fontSize = 26;
        switch (fontType) {
            case  bb.framework.const.FONT_SMALL:
                var fontSize = 16;
                break;
            case  bb.framework.const.FONT_LARGE:
                var fontSize = 36;
                break;
            case  bb.framework.const.FONT_SUPER_LARGE:
                var fontSize = 46;
                break;
            default :
                break;
        }
        return new ccui.Text(mc.dictionary.getGUIString(text), "Arial", fontSize);
    }

});

bb.DefaultLoadingScene = cc.Scene.extend({
    /**
     * Contructor of cc.LoaderScene
     * @returns {boolean}
     */
    ctor: function (defaultColor, urlLoad) {
        this._super();
        defaultColor = defaultColor || cc.color(0, 0, 0, 255);
        this._urlForPreload = urlLoad || [];
        var bgLayer = new cc.LayerColor(defaultColor);
        bgLayer.setName("layer_color");
        this.addChild(bgLayer);
        return true;
    },

    _loadGUI: function () {
        cc.loader.load(this._urlForPreload,
            function (result, count, loadedCount) {
                cc.log(count);
            }.bind(this),
            function (error, result) {
                var newLayer = this.initLoadingGUI();
                if (newLayer) {
                    var child = this.getChildByName("layer_color");
                    if (child) {
                        child.removeFromParent();
                    }
                    this.addChild(newLayer);
                }

                this.scheduleOnce(function () {
                    this._startLoading();
                }.bind(this), 0.01);
                this.displayPercent(0);

            }.bind(this));
    },

    initLoadingGUI: function () {
        return null;
    },

    displayPercent: function (percent) {

    },

    finishLoad: function () {

    },

    /**
     * custom onEnter
     */
    onEnterTransitionDidFinish: function () {
        this._super();
        this.scheduleOnce(function () {
            this._loadGUI();
        }.bind(this));
    },
    /**
     * custom onExit
     */
    onExit: function () {
        this._super();
        this.displayPercent(100);
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} cb
     */
    initWithResources: function (resources, cb, delayCallback) {
        this.resources = resources || [];
        this.cb = cb;
        this.delayCallback = delayCallback;
    },

    _startLoading: function () {
        var seft = this;
        cc.loader.load(this.resources,
            function (result, count, loadedCount) {
                var percent = (loadedCount / count * 100) | 0;
                percent = Math.min(percent, 100);
                seft.displayPercent(percent);
            }, function () {
                seft.displayPercent(100);
                seft.finishLoad();
                if (seft.delayCallback) {
                    seft.scheduleOnce(function () {
                        seft.cb && seft.cb();
                    }, seft.delayCallback);
                } else {
                    seft.cb && seft.cb();
                }
            });

    }

});

// Class For debug mode.
bb.DefaultSplashScene = bb.DefaultLoadingScene.extend({
    _callback: null,

    ctor: function () {
        this._super(null, [
            res.logo_png
        ]);
    },

    initLoadingGUI: function () {
        var bgLayer = new cc.LayerColor(cc.hexToColor("#f0f0f0"));
        bgLayer.setName("layer_color");
        bgLayer.opacity = 0;
        bgLayer.setCascadeOpacityEnabled(true);
        bgLayer.runAction(cc.fadeIn(0.2));

        var winSize = cc.director.getWinSize();
        var imgLogo = new cc.Sprite(res.logo_png);
        imgLogo.setPosition(winSize.width / 2, winSize.height / 2);
        imgLogo.x = cc.winSize.width * 0.5;
        bgLayer.addChild(imgLogo);

        return bgLayer;
    }

});

// Class For debug mode.
bb.DefaultSplashLayer = cc.LayerColor.extend({
    _callback: null,

    ctor: function (cb, delayTime) {
        this._super(cc.hexToColor("#f0f0f0"));
        this._callback = cb;
        delayTime = delayTime || 1.0;
        var _func = function () {
            this.initLoadingGUI();
            this.runAction(cc.sequence([cc.delayTime(delayTime), cc.callFunc(function () {
                this._callback && this._callback();
            }.bind(this))]));
        }.bind(this);
        if (!cc.sys.isNative) {
            cc.loader.load(splash_res, function () {
                _func();
            }.bind(this));
        } else {
            this.initLoadingGUI();
            var self = this;
            var lblProgress = new cc.LabelBMFont("", res.font_cam_stroke_32_export_fnt);
            lblProgress.x = cc.winSize.width * 0.5;
            lblProgress.y = cc.winSize.height * 0.15;
            this.addChild(lblProgress);
            this._imgLogo.registerTouchEvent(function () {
                new mc.GetStringDialog("192.168", function (ip) {
                    var manifest;
                    var strManifest = jsb.fileUtils.getStringFromFile("res/project.manifest");
                    cc.log("strManifest2: " + strManifest);
                    strManifest && (manifest = JSON.parse(strManifest));
                    manifest["packageUrl"] = cc.formatStr("http://%s:8000/", ip);
                    manifest["remoteManifestUrl"] = cc.formatStr("http://%s:8000/project.manifest", ip);
                    manifest["remoteVersionUrl"] = cc.formatStr("http://%s:8000/version.manifest", ip);
                    cc.log("manifest: " + manifest["remoteManifestUrl"]);

                    var storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : "/") + "remote_assets/");
                    jsb.fileUtils.writeStringToFile(JSON.stringify(manifest), storagePath + "res/project.manifest");
                    // Register the manifest's search path
                    cc.sys.localStorage.setItem("_search_path_", JSON.stringify([storagePath]));
                    cc.game.restart();
                }).show();
            });


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
            this.addChild(progressContainer);
            this._progressContainer.setVisible(false);

            var assetManager = new bb.AssetManager();
            assetManager.startCheckUpdate({
                alreadyUpdate: function () {
                    self._callback && self._callback();
                },
                updateDownloadSize: function (totalSize, downloadedSize) {
                    var downloadPercent = Math.round(downloadedSize * 100 / totalSize);
                    downloadPercent = Math.min(downloadPercent, 100);
                    self.displayPercent(downloadPercent);
                },
                failManifest: function () {
                    lblProgress.setString("Can not read Manifest1a!!!");
                },
                doNewVersionFound: function(){
                    self._progressContainer.setVisible(true);
                }
            }, true);
        }
    },

    displayPercent: function (percent) {
        var newProgress = percent;
        this._progressLoading.setPercentage(newProgress);
        this._lblStatus.setString("Loading " + percent + "%");
    },


    initLoadingGUI: function () {
        var winSize = cc.director.getWinSize();
        var imgLogo = this._imgLogo = new ccui.ImageView(splash_res[0]);
        imgLogo.setPosition(winSize.width / 2, winSize.height / 2);
        imgLogo.x = cc.winSize.width * 0.5;
        imgLogo.y = cc.winSize.height * 0.5;
        this.addChild(imgLogo);
        return this;
    }

});
