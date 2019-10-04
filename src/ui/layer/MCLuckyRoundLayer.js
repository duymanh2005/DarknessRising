/**
 * Created by long.nguyen on 10/4/2018.
 */
var STATE_IDLE = 0;
var STATE_ROLLING = 1;
var STATE_GET_REWARDS = 2;
var STATE_SHOW_REWARDDS = 3;
mc.LuckyRoundLayer = mc.MainBaseLayer.extend({
    _state: null,
    _speedR: 550,

    ctor: function () {
        this._super();

        bb.sound.preloadEffect(res.sound_ui_wheel_start);
        bb.sound.preloadEffect(res.sound_ui_wheel_slow_stop);
        mc.storage.featureNotify.spinLayerShowFirstTime = true;
        mc.storage.saveFeatureNotify();

        this._state = STATE_IDLE;
        var root = this.parseCCStudio(res.layer_spin);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (element) {
            return element.getName();
        });

        var luckyRound = this._luckyRound = sp.SkeletonAnimation.createWithJsonFile(res.spine_lucky_wheel_json, res.spine_lucky_wheel_atlas, 1.0);
        var light = this._luckyRoundLight = sp.SkeletonAnimation.createWithJsonFile(res.spine_lucky_wheel_idle_light_json, res.spine_lucky_wheel_idle_light_atlas, 1.0);
        light.setAnimation(0, "luckywheel_idle_light", true);
        var base = this._base = sp.SkeletonAnimation.createWithJsonFile(res.spine_lucky_wheel_idle_json, res.spine_lucky_wheel_idle_atlas, 1.0);
        base.setAnimation(0, "luckywheel_panel_idle", true);

        var btnStart = this._btnStart = new ccui.ImageView("spin/btn_spin.png", ccui.Widget.PLIST_TEXTURE);
        this.lblStart = btnStart.setString(mc.dictionary.getGUIString("lblSpin"), res.font_UTMBienvenue_stroke_32_export_fnt, mc.const.FONT_SIZE_48);
        this.lblStart.setPosition(btnStart.width / 2, btnStart.height / 2);
        this.lblStart.setScale(1.2);

        var rotate = [0, 337.5, 22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5];

        cc.each(mc.dictionary.spinData, function (value, index) {
            var number = ((index + 1) % 8 + 1);
            var bone = luckyRound.findBone("item" + number);
            var strs = value["randomReward"].split('/');
            var itemView = new mc.ItemView(mc.ItemStock.createJsonItemInfo(parseInt(strs[0]), parseInt(strs[1])));
            itemView.scale = 0.9;
            itemView.hideBrk();
            mc.view_utility.registerShowPopupItemInfo(itemView);
            luckyRound.addChild(itemView);
            itemView.setPosition(bone.x, bone.y);
            itemView.setRotation(rotate[number]);
        });


        var brk = new ccui.ImageView("res/brk/home_bur.png", ccui.Widget.LOCAL_TEXTURE);
        var nodeBrk = rootMap["nodeBrk"];
        var btnInfo = rootMap["btnInfo"];
        var brkTitle = rootMap["brkTitle"];
        var lblInBag = rootMap["widgetSpinTicket"].getChildByName("lblValue");
        var lblFreeIn = rootMap["widgetSpinTicket"].getChildByName("lblSubValue");
        var iconSpinTicket = rootMap["widgetSpinTicket"].getChildByName("icon");
        var plusBtn = rootMap["widgetSpinTicket"].getChildByName("plus");

        lblFreeIn.setColor(mc.color.GREEN_NORMAL);

        rootMap["widgetSpinTicket"].setVisible(true);
        iconSpinTicket.scale = 0.6;
        iconSpinTicket.ignoreContentAdaptWithSize(true);
        iconSpinTicket.loadTexture("res/png/consumable/luckywheel.png", ccui.Widget.LOCAL_TEXTURE);
        rootMap["widgetSpinTicket"].registerTouchEvent(function () {
            mc.ExchangeByBlessDialog.showExchange(mc.const.REFRESH_FUNCTION_BUY_SPIN_TICKET);
        });
        btnInfo.setVisible(false);
        //btnInfo.setScale(1.25);
        //btnInfo.registerTouchEvent(function () {
        //    new mc.SpinRewardsInfoDialog().show();
        //});

        var _updateFreeTime = function () {
            if (mc.GameData.playerInfo) {
                var msDur = mc.GameData.playerInfo.getDurationProductionPerSpinTicket();
                lblFreeIn.setString((msDur != -1) ? mc.view_utility.formatDurationTime(msDur) : mc.dictionary.getGUIString("lblShortFull"));
                lblInBag.setString(Math.floor(mc.GameData.playerInfo.getSpinTicket()) + "/" + mc.const.MAX_SPIN_TICKET);
            }
        };

        _updateFreeTime();
        lblFreeIn.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function () {
            _updateFreeTime();
        })]).repeatForever());

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblLuckySpin"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        brk.setAnchorPoint(0.5, 0);
        nodeBrk.addChild(brk);
        this.addChild(luckyRound);
        this.addChild(base);
        this.addChild(btnStart);
        this.addChild(light);
        var winSize = cc.winSize;
        luckyRound.setPosition(winSize.width / 2, mc.const.DEFAULT_HEIGHT / 2);
        base.setPosition(winSize.width / 2, mc.const.DEFAULT_HEIGHT / 2);
        light.setPosition(winSize.width / 2, mc.const.DEFAULT_HEIGHT / 2);
        btnStart.setPosition(winSize.width / 2, mc.const.DEFAULT_HEIGHT / 2 - 325);
        luckyRound.rotation = bb.utility.randomInt(0, 7) * 45;

        btnStart.registerTouchEvent(function () {
            if (this._state === STATE_IDLE) {
                if (Math.floor(mc.GameData.playerInfo.getSpinTicket()) > 0) {
                    var isShow = mc.view_utility.showSuggestBuyItemSlotsIfAny();
                    if (!isShow) {
                        this._startSpin();
                    }
                } else {
                    var staminaInfo = mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_SPIN_TICKET);
                    var name = mc.ItemStock.getItemName(staminaInfo);
                    mc.GUIFactory.confirm(cc.formatStr(mc.dictionary.getGUIString("txtSuggestBuySomeCurrency"), name, name),
                        function () {
                            mc.ExchangeByBlessDialog.showExchange(mc.const.REFRESH_FUNCTION_BUY_SPIN_TICKET);
                        });
                }
            }
            else {
                this.stopSpin();
            }
        }.bind(this));

        this._updateGUI();
        this.scheduleUpdate();

        this.traceDataChange(mc.GameData.itemStock, function (rs) {
            if (rs) {
                _updateFreeTime();
            }
        }.bind(this));
    },

    onLayerClearStack: function () {
        bb.sound.unloadEffect(res.sound_ui_wheel_start);
        bb.sound.unloadEffect(res.sound_ui_wheel_slow_stop);
        bb.sound.unloadEffect(res.sound_ui_equip_upgrade_success);
        bb.sound.unloadEffect(res.sound_ui_summon_reward_5star);
        mc.GameData.assetChanger.setPauseNotify(false);
    },

    buildParticle: function () {
        var particle = new cc.ParticleSystem(res.particle_win_star_explosion_plist);
        particle.setPosition(cc.winSize.width / 2, cc.winSize.height / 2 + 175);
        this.addChild(particle);
    },

    stopSpin: function () {
        if (this._state === STATE_ROLLING) {
            if (this.result) {
                this._btnStart.stopAllActions();
                this._state = STATE_GET_REWARDS;
                this._rollFinish(this.result["index"], this.result["reward"]);
            } else {
                if ((bb.now() - this.markStartTime > 3000)) {
                    this._state = STATE_GET_REWARDS;
                    this._rollFinish(7, null);
                }
            }
        }

    },

    _updateGUI: function () {
        if (this._state === STATE_ROLLING) {
            this.lblStart.setString(mc.dictionary.getGUIString("lblStopSpin"));
            this._btnStart.loadTexture("spin/btn_stop.png", ccui.Widget.PLIST_TEXTURE);
            this._btnStart.setLocalZOrder(99999999 + 1);
        } else {
            this.lblStart.setString(mc.dictionary.getGUIString("lblSpin"));
            this._btnStart.loadTexture("spin/btn_spin.png", ccui.Widget.PLIST_TEXTURE);
            this._btnStart.setLocalZOrder(1);
        }
    },

    _startSpin: function () {
        this.markStartTime = bb.now();
        this._state = STATE_ROLLING;
        this._targetR = 360 * 1000000;
        this._luckyRound.rotation = this._luckyRound.rotation % 360;
        this._updateGUI();
        this._btnStart.runAction(cc.sequence(cc.delayTime(3), cc.callFunc(function () {
            this.stopSpin();
        }, this)));
        mc.GameData.assetChanger.setPauseNotify(true);
        mc.protocol.spinRewards(function (result) {
            this.result = result;
        }.bind(this));
        this.enableInput(false);
        bb.sound.playEffect(res.sound_ui_wheel_start, true);
    },

    enableInput: function (isEnable) {
        this.getMainScreen().setEnableBackEvent(isEnable);
        this.getMainScreen().getButtonBack().setTouchEnabled(isEnable);
    },

    update: function (dt) {
        if (this._targetR) {
            var dr = this._targetR - this._luckyRound.rotation;
            var fdr = Math.floor(dr);
            if (dr > 0 && fdr > 0) {
                var spd = dr / 0.1;
                if (dr <= 640) {
                    spd = dr;
                }
                if (spd > this._speedR) {
                    spd = this._speedR;
                }
                if (spd < 1.0) {
                    spd = 1.0;
                }
                var r = this._luckyRound.rotation;
                r += spd * dt;
                if (r > this._targetR) {
                    r = this._targetR;
                }
                this._luckyRound.rotation = r;
            }
            else {
                var name = "luckywheel_win" + this._rewardIndex;
                this._targetR = 0;
                this._luckyRoundLight.setAnimation(0, "luckywheel_idle_light", true);
                if (this.arrRewards && this.arrRewards["items"]) {
                    this._luckyRound.setAnimation(0, name, false);
                    this.buildParticle();
                    bb.sound.preloadEffect(res.sound_ui_equip_upgrade_success);
                    bb.sound.preloadEffect(res.sound_ui_summon_reward_5star);
                    this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(function () {
                        bb.sound.playEffect(res.sound_ui_equip_upgrade_success);
                        new mc.ItemRewardsDialog(this.arrRewards["items"], function () {
                            this.resetSpin(this.arrRewards["items"]);
                        }.bind(this)).show();
                    }, this)));
                } else {
                    var infoDialog = bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("Spin Fail"));
                    infoDialog.setCloseCallback(function () {
                        this.resetSpin();
                    }.bind(this));
                    infoDialog.show();

                }
            }
        }
    },

    resetSpin: function (rewards) {
        this._state = STATE_IDLE;
        this.markStartTime = 0;
        this._updateGUI();
        if (rewards) {
            bb.sound.playEffect(res.sound_ui_summon_reward_5star);
            mc.view_utility.showNewComingItem(rewards || {});
            mc.GameData.assetChanger.setPauseNotify(false);
            mc.GameData.assetChanger.notifyDataChanged();
        }
        this.enableInput(true);
    },

    _rollFinish: function (index, arrReward) {
        cc.log("_rollFinish: " + index);
        this._rewardIndex = index;
        this._targetR = (Math.floor(this._luckyRound.rotation / 360) + 3) * 360 + (7 - this._rewardIndex) * 45 + bb.utility.randomInt(2, 43);
        cc.log("_targetR: " + this._targetR + ", " + (this._targetR % 360));
        this.arrRewards = arrReward;
        delete this.result;
        bb.sound.stopAllEffect();
        bb.sound.playEffect(res.sound_ui_wheel_slow_stop);
    },

    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_LUCKY_SPIN;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    },
    onLayerClose: function () {
        mc.GameData.assetChanger.setPauseNotify(false);
        mc.GameData.notifySystem.notifyDataChanged();
    }

});