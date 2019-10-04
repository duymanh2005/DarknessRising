/**
 * Created by long.nguyen on 6/28/2017.
 */
mc.BottomBarView = cc.Node.extend({
    _isShow: true,

    ctor: function (parseNode) {
        this._super();

        var notifySystem = mc.GameData.notifySystem;

        var root = mc.parseCCStudioNode(this, parseNode || res.widget_bottom_bar);
        var mapChild = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var widgetHome = this._widgetHome = mapChild["widgetHome"];
        var widgetHero = this._widgetHero = mapChild["widgetHero"];
        var widgetSummon = this._widgetSummon = mapChild["widgetSummon"];
        var widgetShop = this._widgetShop = mapChild["widgetShop"];
        var widgetItem = this._widgetItem = mapChild["widgetItem"];

        var applyLbl = function (widget, lblKey) {
            if (widget) {
                var lbl = widget.getChildByName("BitmapFontLabel_1");
                lbl && lbl.setString(mc.dictionary.getGUIString(lblKey));
            }
        };

        applyLbl(widgetHero, "lblHeroes");
        applyLbl(widgetHome, "lblHome");
        applyLbl(widgetSummon, "lblSummon");
        applyLbl(widgetShop, "lblShop");
        applyLbl(widgetItem, "lblItems");

        this.applySpine(widgetHero, "hero_idle");
        this.applySpine(widgetHome, "home_idle");
        this.applySpine(widgetSummon, "summon_idle");
        this.applySpine(widgetShop, "shop_idle");
        this.applySpine(widgetItem, "items_idle");

        widgetHome.registerTouchEvent(function () {
            this.getMainScreen().showLayerWithId(mc.MainScreen.LAYER_HOME);
        }.bind(this));
        widgetHero.registerTouchEvent(function () {
            bb.sound.playEffect(res.sound_ui_bag_open);
            var notifyIcon = widgetHero.getChildByName("__notify__");
            if(notifyIcon)
            {
                notifyIcon.setVisible(false);
            }
            this.getMainScreen().showLayerWithId(mc.MainScreen.LAYER_HERO_STOCK);
        }.bind(this));
        widgetSummon.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SUMMON_LIST);
            notifySystem.touchSummon();
        }.bind(this));
        widgetShop.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SHOP_LIST);
        }.bind(this));
        widgetItem.registerTouchEvent(function () {
            bb.sound.playEffect(res.sound_ui_bag_open);
            var notifyIcon = widgetItem.getChildByName("__notify__");
            if(notifyIcon)
            {
                notifyIcon.setVisible(false);
            }
            this.getMainScreen().showLayerWithId(mc.MainScreen.LAYER_ITEM_STOCK);
        }.bind(this));

        var _updateLanguage = function () {
            applyLbl(widgetHero, "lblHeroes");
            applyLbl(widgetHome, "lblHome");
            applyLbl(widgetSummon, "lblSummon");
            applyLbl(widgetShop, "lblShop");
            applyLbl(widgetItem, "lblItems");
        };

        var _updateNotify = function () {
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(widgetHero, (notifySystem.getHeroEquipmentNotification() != null && !mc.storage.featureNotify.heroesLayerShowed ));
            if (notifyIcon) {
                notifyIcon.setLocalZOrder(4);
                notifyIcon.y = widgetHero.height * 0.8;
            }
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(widgetSummon, notifySystem.doHaveFreeSummonPackage()||notifySystem.haveSummonNotificationByEvent());
            if (notifyIcon) {
                notifyIcon.setLocalZOrder(4);
                notifyIcon.y = widgetHero.height * 0.8;
            }
            //var notifyIcon = mc.view_utility.setNotifyIconForWidget(widgetItem, notifySystem.getEquipmentLevelUpNotification(), 0.8);
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(widgetItem,!bb.utility.isEmptyObj(mc.storage.newItems) && !mc.storage.featureNotify.itemLayerShowed , 0.8);
            if (notifyIcon) {
                notifyIcon.setLocalZOrder(4);
            }
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(widgetShop, notifySystem.hasIapNotify() && !mc.storage.featureNotify.shopLayerShowed, 0.8);
            if (notifyIcon) {
                notifyIcon.setLocalZOrder(4);
            }
        };

        _updateNotify();
        this._notifySystemTrack = bb.director.trackGlueObject(notifySystem, function () {
            _updateNotify();
        });

        this._tutorialManagerTrack = bb.director.trackGlueObject(mc.GameData.tutorialManager, function () {
            this.onTriggerTutorial();
        }.bind(this));

        _updateLanguage();
        this._settingTrack = bb.director.trackGlueObject(mc.storage.settingChanger, function (data) {
            mc.storage.settingChanger.performChanging({
                "language": function (oldLan, newLan) {
                    _updateLanguage();
                }
            }, true);
        });
    },

    applySpine: function (widget, animateCode) {
        var spine = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_home_button_json, res.spine_ui_home_button_atlas, 1.0);
        spine.setAnimation(0, animateCode, true);
        spine.x = widget.width * 0.5;
        spine.y = widget.height * 0.3;
        widget.addChild(spine, 2);
        var lbl = widget.getChildByName("BitmapFontLabel_1");
        if (lbl) {
            lbl.setLocalZOrder(3);
        }
    },

    onExit: function () {
        this._super();
        this._notifySystemTrack && bb.director.unTrackGlueObject(this._notifySystemTrack);
        this._tutorialManagerTrack && bb.director.unTrackGlueObject(this._tutorialManagerTrack);
        this._settingTrack && bb.director.unTrackGlueObject(this._settingTrack);
    },

    onEnterTransitionDidFinish: function () {
        this.onTriggerTutorial();
    },

    onShow: function () {
    },

    onClose: function () {
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.SCREEN_MAIN);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_STOCK_TAB) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._widgetHero)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUMMON_TAB) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._widgetSummon)
                    .setCharPositionY(cc.winSize.height * 0.3)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_HOME_TAB) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._widgetHome)
                    .setCharPositionY(cc.winSize.height * 0.3)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_BACK_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this.getMainScreen().getButtonBack())
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
            else if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_ITEM_STOCK_TAB) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._widgetItem)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
        }
    },

    getMainScreen: function () {
        return this.getParent().getParent();
    }

});