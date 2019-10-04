/**
 * Created by long.nguyen on 6/28/2017.
 */
mc.WorldMapLayer = mc.MainBaseLayer.extend({
    _mapMapObjectViewByName: null,

    ctor: function (parseNode) {
        this._super();
        mc.protocol.checkStageBossWorldMap();
        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_CAMPAIGN);
        var root = this.__root = this.parseCCStudio(parseNode || res.layer_word_map);
        var scroll = this._scroll = root.getChildByName("scroll");
        //scroll.setScrollBarEnabled(false);
        scroll.setDirection(ccui.ScrollView.DIR_BOTH);
        var brkContainerMap = this._brkContainerMap = bb.utility.arrayToMap(scroll.getChildren(), function (child) {
            return child.getName();
        });
        var nodeBrk = brkContainerMap["nodeBrk"];
        var spineWorldMap = this._spineWorldMap = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_world_map_json, res.spine_ui_world_map_atlas, 1.0);
        spineWorldMap.setAnimation(0, "animation", true);
        nodeBrk.addChild(spineWorldMap);

        var btnWorldChallenge = new ccui.Layout();
        btnWorldChallenge.width = 120;
        btnWorldChallenge.height = 120;
        btnWorldChallenge.anchorX = btnWorldChallenge.anchorY = 0.5;
        btnWorldChallenge.x = root.width * 0.87;
        btnWorldChallenge.y = root.height * 0.8;
        btnWorldChallenge.registerTouchEvent(function () {
            mc.GameData.guiState.setSelectChapterIndex(mc.CampaignManger.SPECIAL_CHAP_INDEX);
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_STAGE_LIST_WORLD_CHALLENGE);
        }.bind(this));
        var spineWorldChallenge = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_world_challenge_json, res.spine_ui_world_challenge_atlas, 1.0);
        spineWorldChallenge.setAnimation(0, "WorldChallengeIdle", true);
        spineWorldChallenge.x = btnWorldChallenge.width * 0.5;
        spineWorldChallenge.y = btnWorldChallenge.height * 0.5;
        btnWorldChallenge.addChild(spineWorldChallenge);
        var textWorldChallenge = null;
        if(mc.enableReplaceFontBM())
        {
            textWorldChallenge = mc.view_utility.createTextFromFontBitmap(res.font_UTMBienvenue_stroke_32_export_fnt);
            textWorldChallenge.setString(mc.dictionary.getGUIString("lblChallenge"));
        }
        else
        {
            textWorldChallenge = new ccui.TextBMFont(mc.dictionary.getGUIString("lblChallenge"), res.font_sfumachine_outer_32_export_fnt);
        }
        textWorldChallenge.setScale(0.8);
        textWorldChallenge.setColor(mc.color.YELLOW);
        textWorldChallenge.x = spineWorldChallenge.x;
        textWorldChallenge.y = 0;
        btnWorldChallenge.addChild(textWorldChallenge);
        root.addChild(btnWorldChallenge);

        var self = this;
        var _clickChapter = function (chapterIndex) {
            var isSupport = mc.dictionary.isSupportFunction(arrFunction[chapterIndex]);
            if (isSupport) {
                self._isClickChapter = true;
                mc.GameData.guiState.setSelectChapterIndex(chapterIndex);
                self._showStageListLayer(chapterIndex);
            } else {
                mc.view_utility.showComingSoon();
            }
        };
        var selectChapterIndex = mc.GameData.guiState.getSelectChapterIndex();
        var currChapIndex = (selectChapterIndex != undefined && selectChapterIndex != mc.CampaignManger.SPECIAL_CHAP_INDEX)
            ? selectChapterIndex
            : mc.GameData.playerInfo.getCurrentChapterIndex();
        this._isClickChapter = false;
        var arrWidgetName = ["Loren", "Noria", "Davias", "Dungeon", "LostTower", "Atlans", "Tarkan", "Icarus"];
        var arrFunction = [
            mc.const.FUNCTION_CHAPTER_LOREN,
            mc.const.FUNCTION_CHAPTER_NORIA,
            mc.const.FUNCTION_CHAPTER_DAVIAS,
            mc.const.FUNCTION_CHAPTER_DUNGEON,
            mc.const.FUNCTION_CHAPTER_LOSTTOWNER,
            mc.const.FUNCTION_CHAPTER_ATLANS,
            mc.const.FUNCTION_CHAPTER_TARKAN,
            mc.const.FUNCTION_CHAPTER_ICARUS
        ];

        var bossAppear = function (icon) {
            if (mc.GameData.stageBossSystem.isBossAppear) {
                var appear = mc.GameData.stageBossSystem.isBossAppear["appear"];
                var endTime = mc.GameData.stageBossSystem.isBossAppear["endTime"];
                icon.setVisible(appear);
                if (endTime) {
                    icon.stopAllActions();
                    icon.runAction(cc.sequence(cc.delayTime((endTime - bb.now()) / 1000), cc.hide()));
                }
                return;
            }
            icon.setVisible(false);
        };

        this.listIconBoss = [];
        for (var i = 0; i < arrWidgetName.length; i++) {
            var chapterName = arrWidgetName[i];
            var chapterView = brkContainerMap[chapterName];
            var lblView = chapterView.getChildByName("img");
            lblView._maxLblWidth = lblView.width - 50;
            lblView.setString((i + 1) + ". " + mc.const.ARR_CHAPTER_NAME[i]);
            chapterView.setUserData(i);
            chapterView.registerTouchEvent(function (chapterView) {
                _clickChapter(chapterView.getUserData());
            });
            chapterView.setSwallowTouches(false);

            var iconAnimate = lblView.getChildByName("bossIcon");
            if (!iconAnimate) {
                iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_timing_boss_json, res.spine_ui_timing_boss_atlas, 1.0);
                lblView.addChild(iconAnimate);
                iconAnimate.setName("bossIcon");
                iconAnimate.setLocalZOrder(1);
                iconAnimate.setPosition(-5, lblView.height / 2);
                iconAnimate.setAnimation(0, "idle", true);
            }
            bossAppear(iconAnimate);
            this.listIconBoss.push(iconAnimate);
        }

        var stageBoss = mc.GameData.stageBossSystem;
        this.traceDataChange(stageBoss, function () {
            cc.each(this.listIconBoss, function (icon) {
                bossAppear(icon);
            })
        }.bind(this));

        for (var i = 0; i < arrWidgetName.length; i++) {
            var chapterName = arrWidgetName[i];
            var chapterView = brkContainerMap[chapterName];
            chapterView.setVisible(mc.GameData.playerInfo.getCurrentChapterIndex() >= i);
            if (currChapIndex < i) {
            } else if (currChapIndex === i) {
                var focusArrow = new ccui.ImageView("button/Red_arrow.png", ccui.Widget.PLIST_TEXTURE);
                focusArrow.setUserData(currChapIndex);
                focusArrow.x = chapterView.width * 0.5;
                focusArrow.y = 5;
                focusArrow.runAction(cc.sequence([cc.moveBy(0.2, 0, 10), cc.moveBy(0.2, 0, -10)]).repeatForever());
                chapterView.addChild(focusArrow);
            }

        }

        var mineSystem = mc.GameData.mineSystem;
        var _initMineView = function () {
            //if( this._spineMine ){
            //    this._spineMine.removeFromParent();
            //    this._spineMine = null;
            //}
            //var mineChapterIndex = mineSystem.getMiningChapterIndex();
            //if( mineChapterIndex >= 0){
            //    var chapterView = brkContainerMap[arrWidgetName[mineChapterIndex]];
            //    var spineMine = this._spineMine = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_mining_icon_json,res.spine_ui_mining_icon_atlas, 1.0);
            //    spineMine.scale = 0.5;
            //    spineMine.setAnimation(0,mineSystem.isMining() ? "mining" : "idle",true);
            //    spineMine.x = chapterView.width + 10;
            //    spineMine.y = chapterView.height*0.5;
            //    chapterView.addChild(spineMine);
            //}
        }.bind(this);

        this.traceDataChange(mineSystem, function () {
            _initMineView();
        }.bind(this));
        _initMineView();

        if (currChapIndex >= 0 && currChapIndex < arrWidgetName.length) {
            var chapView = brkContainerMap[arrWidgetName[currChapIndex]];
            if (chapterView) {
                this.scheduleOnce(function () {
                    bb.utility.scrollTo(scroll, chapView.x - scroll.width * 0.5, 0, true);
                    bb.utility.scrollTo(scroll, chapView.y - scroll.height * 0.5, 0, false);
                }.bind(this), 0.00001);
            }
        }

        if (!cc.sys.isNative) {
            brkContainerMap["Particle_1"].removeFromParent();
            brkContainerMap["Particle_2"].removeFromParent();
            brkContainerMap["Particle_3"].removeFromParent();
            brkContainerMap["Particle_4"].removeFromParent();
            brkContainerMap["Particle_6"].removeFromParent();
            brkContainerMap["Particle_7"].removeFromParent();
            brkContainerMap["Particle_8"].removeFromParent();
            brkContainerMap["Particle_9"].removeFromParent();
            brkContainerMap["Particle_10"].removeFromParent();
            brkContainerMap["Particle_11"].removeFromParent();
            brkContainerMap["Particle_12"].removeFromParent();
            brkContainerMap["Particle_13"].removeFromParent();
            brkContainerMap["Particle_14"].removeFromParent();
            brkContainerMap["Particle_15"].removeFromParent();
            scroll.addChild(brkContainerMap["Particle_1"].clone());
            scroll.addChild(brkContainerMap["Particle_2"].clone());
            scroll.addChild(brkContainerMap["Particle_3"].clone());
            scroll.addChild(brkContainerMap["Particle_4"].clone());
            scroll.addChild(brkContainerMap["Particle_6"].clone());
            scroll.addChild(brkContainerMap["Particle_7"].clone());
            scroll.addChild(brkContainerMap["Particle_8"].clone());
            scroll.addChild(brkContainerMap["Particle_9"].clone());
            scroll.addChild(brkContainerMap["Particle_10"].clone());
            scroll.addChild(brkContainerMap["Particle_11"].clone());
            scroll.addChild(brkContainerMap["Particle_12"].clone());
            scroll.addChild(brkContainerMap["Particle_13"].clone());
            scroll.addChild(brkContainerMap["Particle_14"].clone());
            scroll.addChild(brkContainerMap["Particle_15"].clone());
        }
        this._mapMapObjectViewByName = {};
        this._updateWorldMap();

        scroll.getInnerContainer().setTouchEnabled(true);
        //var touchScroll = new ccui.Layout();
        //touchScroll.width = scroll.getInnerContainerSize().width;
        //touchScroll.height = scroll.getInnerContainerSize().height;
        //touchScroll.setTouchEnabled(true);
        //scroll.addChild(touchScroll);

        this.scheduleOnce(function () {
            this._showRateDialogIfAny();
            this.goblinComing();
        }.bind(this), 0.1);
    },

    goblinComing: function () {
        mc.GameData.shopManager.isGoblinShopOpen(true);
    },

    onFade: function (isIn, duration) {
        if (this._spineWorldMap) {
            this._spineWorldMap.opacity = isIn ? 0 : 255;
            this._spineWorldMap.runAction(isIn ? cc.fadeIn(duration) : cc.fadeOut(duration));
        }
        if (this._spineMine) {
            this._spineMine.opacity = isIn ? 0 : 255;
            this._spineMine.runAction(isIn ? cc.fadeIn(duration) : cc.fadeOut(duration));
        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_WORLD);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_LOREN_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._brkContainerMap["Loren"])
                    .setScaleHole(1.5)
                    .setCharPositionY(cc.winSize.height * 0.4)
                    .show();
            }
        }
    },

    _showRateDialogIfAny: function () {
        if (mc.GameData.ratingManager.canShow()) {
            new mc.MCRatingDialog().show();
        }
    },

    _updateWorldMap: function () {
        var root = this._spineWorldMap.findBone("root");
        if (root) {
            var arrObjName = ["particle_map_chaosmachine.plist", "particle_map_fairystar.plist", "particle_map_waterlight.plist",
                "particle_map_snow.plist"];
            for (var i = 0; i < arrObjName.length; i++) {
                var strNames = arrObjName[i].split('.');
                var name = strNames[0];
                var suffix = strNames[1];
                var mapObj = this._spineWorldMap.findBone(name);
                if (mapObj) {
                    var childNode = this._mapMapObjectViewByName[name];
                    if (!childNode) {
                        if (suffix === "plist") {
                            childNode = new cc.ParticleSystem("res/particle/gui/" + name + "." + suffix);
                            childNode.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
                        }
                        childNode.setName(name);
                        this._scroll.addChild(childNode);
                        this._mapMapObjectViewByName[name] = childNode;
                    }
                    childNode.x = root.x + mapObj.x;
                    childNode.y = root.y + mapObj.y;
                }
            }
        }
    },

    _getChapterIndex: function (name) {
        var arrChap = mc.const.ARR_CHAPTER_NAME;
        var foundIndex = -1;
        for (var i = 0; i < arrChap.length; i++) {
            if (arrChap[i] === name) {
                foundIndex = i;
                break;
            }
        }
        return foundIndex;
    },

    _showStageListLayer: function (chapterIndex, stageIndex) {
        mc.GameData.guiState.setSelectStageCampaignIndex(stageIndex);
        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST);
    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_WORD_MAP;
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
mc.WorldMapLayer.chapter_name = null;