/**
 * Created by long.nguyen on 5/28/2018.
 */
var arrMode = ["easy", "hard", "hell"];
mc.StageCampaignListLayer = mc.LoadingLayer.extend({

    ctor: function () {
        this._super();

        var root = this._root = this.parseCCStudio(res.widget_stage_list);
        var mapRootView = bb.utility.arrayToMap(root.getChildren(), function (element) {
            return element.getName();
        });

        var imgTitle = mapRootView["imgTitle"];
        var brkAdd = mapRootView["brk_add"];
        if (brkAdd) {
            brkAdd.setVisible(false);
        }
        var btnEventShop = mapRootView["btn_event_shop"];
        btnEventShop.getChildByName("lbl").setString(mc.dictionary.getGUIString("Halloween Shop"));
        btnEventShop.setVisible(false);
        // btnEventShop.registerTouchEvent(function () {
        //     mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_EVENTB);
        // }.bind(this));


        var nodeBoxDrop = mapRootView["nodeBoxDrop"];
        var nodeBoxLevel = mapRootView["nodeBoxLevel"];
        var lvlStage = this._lvlStage = mapRootView["lvlStage"];
        var lvlStageHard = this._lvlStageHard = mapRootView["lvlStageHard"];
        var lvlStageHell = this._lvlStageHell = mapRootView["lvlStageHell"];
        var cell = this._cellClone = mapRootView["cell"];
        var nodeLock = this._nodeLock = mapRootView["nodeLock"];
        cell.setVisible(false);

        var chapterIndex = mc.GameData.guiState.getSelectChapterIndex();
        var chapName = mc.const.ARR_CHAPTER_NAME[chapterIndex];

        var spineWorldMap = this._spineWorldMap = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_world_map_json, res.spine_ui_world_map_atlas, 1.0);
        spineWorldMap.setAnimation(0, "animation", true);
        spineWorldMap.setLocalZOrder(-1);
        spineWorldMap.x = -300;
        spineWorldMap.y = -500;
        root.addChild(spineWorldMap);

        this._arrLvlStage = [lvlStage, lvlStageHard, lvlStageHell];

        var comboBox = new mc.ComboBox("Drop");
        comboBox.setDataSource(["Rewards", "Monsters"],
            mc.GameData.guiState.getViewStageCampaignModeId() === mc.GUIState.VIEW_STAGE_MODE_MONSTER ? 1 : 0,
            function (cbBox, index) {
                for (var lv = 0; lv < this._arrLvlStage.length; lv++) {
                    var lvlView = this._arrLvlStage[lv];
                    if (lvlView._isLoadModel) {
                        var arrCell = lvlView.getChildren();
                        for (var i = 0; i < arrCell.length; i++) {
                            this._flipCell(arrCell[i], index === 0);
                        }
                        if (index === 0) {
                            mc.GameData.guiState.setViewStageCampaignModeId(mc.GUIState.VIEW_STAGE_MODE_REWARD);
                        }
                        else if (index === 1) {
                            mc.GameData.guiState.setViewStageCampaignModeId(mc.GUIState.VIEW_STAGE_MODE_MONSTER);
                        }
                    }
                }
            }.bind(this));
        nodeBoxDrop.addChild(comboBox);


        var layoutModeOn = this._layoutModeOn = bb.layout.linear(bb.collection.createArray(arrMode.length, function (index) {
            var imgMode = new ccui.ImageView(cc.formatStr("icon/ico_%s.png", arrMode[index]), ccui.Widget.PLIST_TEXTURE);
            return imgMode;
        }), 10);
        layoutModeOn.x = 450;
        nodeBoxDrop.addChild(layoutModeOn);
        var layoutModeOff = this._layoutModeOff = bb.layout.linear(bb.collection.createArray(arrMode.length, function (index) {
            var imgMode = new ccui.ImageView(cc.formatStr("icon/ico_%s_off.png", arrMode[index]), ccui.Widget.PLIST_TEXTURE);
            imgMode.setUserData(index);
            imgMode.registerTouchEvent(function (imgMode) {
                this._selectMode(imgMode.getUserData());
                this._loadStageListByMode(imgMode.getUserData());
            }.bind(this));
            return imgMode;
        }.bind(this)), 10);
        layoutModeOff.x = layoutModeOn.x;
        nodeBoxDrop.addChild(layoutModeOff);


        imgTitle._maxLblWidth = imgTitle.width - 140;
        var lblView = imgTitle.setString(chapName, res.font_UTMBienvenue_none_32_export_fnt);
        lblView.setColor(mc.color.BROWN_SOFT);

    },

    _selectMode: function (modeIndex) {
        this._currModeIndex = modeIndex;
        mc.GameData.guiState.setCurrentHardStageModeIndex(mc.GameData.guiState.getSelectChapterIndex(), modeIndex);
        var childOn = this._layoutModeOn.getChildren();
        var childOff = this._layoutModeOff.getChildren();
        for (var i = 0; i < childOn.length; i++) {
            childOn[i].setVisible(false);
        }
        for (var i = 0; i < childOff.length; i++) {
            childOff[i].setVisible(false);
        }
        for (var i = 0; i < this._arrLvlStage.length; i++) {
            this._arrLvlStage[i].setVisible(false);
        }
        var selectIndex = modeIndex;
        childOn[selectIndex].setVisible(true);
        this._arrLvlStage[selectIndex].setVisible(true);


        if (this._focusArrow) {
            this._focusArrow.runAction(cc.removeSelf());
            this._textSelected.runAction(cc.removeSelf());
        }
        this.runAction(cc.callFunc(function () {
            var focusArrow = new ccui.ImageView("button/Red_arrow.png", ccui.Widget.PLIST_TEXTURE);
            focusArrow.scale = 0.8;
            //focusArrow.setUserData(selectIndex);
            focusArrow.runAction(cc.sequence([cc.moveBy(0.2, 0, 10), cc.moveBy(0.2, 0, -10)]).repeatForever());
            childOn[selectIndex].getParent().addChild(focusArrow);
            this._focusArrow = focusArrow;
            this._focusArrow.y = childOn[selectIndex].y + this._focusArrow.height + 10;
            this._focusArrow.x = childOn[selectIndex].x;
            var text = null;
            if(mc.enableReplaceFontBM())
            {
                text = mc.view_utility.createTextFromFontBitmap(res.font_cam_stroke_32_export_fnt);
            }
            else
            {
                text = new ccui.TextBMFont("", res.font_cam_stroke_32_export_fnt);
            }
            text.setString(mc.dictionary.getGUIString(arrMode[modeIndex]));
            text.scale = 0.7;
            this._textSelected = text;
            this._textSelected.y = childOn[selectIndex].y + this._focusArrow.height + this._textSelected.height + 5;
            this._textSelected.x = childOn[selectIndex].x;
            text.runAction(cc.sequence([cc.moveBy(0.2, 0, 10), cc.moveBy(0.2, 0, -10)]).repeatForever());
            childOn[selectIndex].getParent().addChild(text);

        }.bind(this)));


        for (var i = 0; i < childOff.length; i++) {
            if (i != selectIndex) {
                childOff[i].setVisible(true);
            }
        }
    },

    onLayerClearStack: function () {
        mc.GameData.guiState.setCurrentFindingItemIndex(null);
        mc.GameData.guiState.setCurrentFindingMonsterIndex(null);
    },

    onLoading: function () {
        var chapterIndex = mc.GameData.guiState.getSelectChapterIndex();
        var stageIndex = mc.GameData.guiState.getSelectStageCampaignIndex();
        var campaignManager = mc.GameData.campaignManager;

        var arrStageInfo = campaignManager.getArrayStageByChapterIndex(chapterIndex);
        if (!arrStageInfo) {
            mc.protocol.comeToChapter(chapterIndex, function () {
                this.performDone();
            }.bind(this));
        }
        else {
            this.performDone();
        }
    },

    _loadStageListByMode: function (modeIndex) {
        var stageIndex = this._stageIndex;
        modeIndex = modeIndex || 0;
        var selectCell = null;
        var campaignManager = mc.GameData.campaignManager;
        var arrStageInfo = this._arrStageInfoByModeIndex[modeIndex];
        var arrStageDict = this._arrStageDictByModeIndex[modeIndex];
        var selectIndex = 0;
        this._nodeLock.setVisible(false);
        var lvlStage = this._arrLvlStage[modeIndex];
        if (!lvlStage._isLoadModel) {
            lvlStage._isLoadModel = true;
            for (var i = 0; i < arrStageDict.length; i++) {
                var cellClone = this._cellClone.clone();
                cellClone.setVisible(true);
                var stageInfo = null;
                if (i < arrStageInfo.length) {
                    stageInfo = arrStageInfo[i];
                }
                this._reloadCell(cellClone, arrStageDict[i], stageInfo, i);
                lvlStage.pushBackCustomItem(cellClone);
                if (stageInfo) {
                    if (stageIndex != undefined && stageIndex === mc.CampaignManger.getStageIndex(stageInfo)) {
                        selectCell = cellClone;
                        selectIndex = i;
                    }
                    else {
                        if (!stageInfo.clear && stageInfo.unlock) {
                            selectCell = cellClone;
                            selectIndex = i;
                        }
                    }
                }
                if( cellClone._findItemIndex || cellClone._findMonsterIndex ){
                    selectCell = cellClone;
                    selectIndex = i;
                }
            }
            this._selectIndex = selectIndex;
            lvlStage.doLayout();

            this._yFocus = 0;
            if (selectCell) {
                this._yFocus = selectCell.y - lvlStage.height * 0.5;
            }

            lvlStage.opacity = 0;
            lvlStage.setCascadeOpacityEnabled(true);
            lvlStage.runAction(cc.fadeIn(0.3));

            this.scheduleOnce(function () {
                bb.utility.scrollTo(lvlStage, this._yFocus, 0.01);
            }.bind(this), 0.01);
        }
        if (arrStageInfo.length === 0) {
            lvlStage.setEnabled(false);
            var containerLock = this._nodeLock.getChildByName("containerLock");
            if (!containerLock) {
                var imgLock = new ccui.ImageView("icon/ico_lock.png", ccui.Widget.PLIST_TEXTURE);
                var lblLock = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtUnlockDifficultyLevel"));
                lblLock.scale = 1.2;
                lblLock.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
                containerLock = bb.layout.linear([lblLock, imgLock], 5, bb.layout.LINEAR_VERTICAL);
                containerLock.setName("containerLock");
                imgLock.x = lblLock.x = containerLock.width * 0.5;
                this._nodeLock.addChild(containerLock);
            }
            this._nodeLock.setVisible(true);
        }
    },

    onLoadDone: function () {
        var chapterIndex = mc.GameData.guiState.getSelectChapterIndex();
        var stageIndex = mc.GameData.guiState.getSelectStageCampaignIndex();
        var findItemIndex = mc.GameData.guiState.getCurrentFindingItemIndex();
        var findMonsterIndex = mc.GameData.guiState.getCurrentFindingMonsterIndex();
        var findingMode = null;

        var mappingKey = {"easy": 0, "hard": 1, "hell": 2};
        var mapModeByItemIndex = {};
        this._arrStageDictByModeIndex = [[], [], []];
        var arrStageDict = mc.dictionary.getArrayStageDictByChapter(chapterIndex);
        for (var i = 0; i < arrStageDict.length; i++) {
            var dictStage = arrStageDict[i];
            this._arrStageDictByModeIndex[mappingKey[dictStage.mode]].push(dictStage);
            if (findItemIndex) {
                var arrReward = mc.CampaignManger.getArrayRewardByStageIndex(dictStage["index"]);
                var obj = bb.collection.findBy(arrReward, function (rewardInfo) {
                    return mc.ItemStock.getItemIndex(rewardInfo) === findItemIndex;
                }, findItemIndex);
                if (obj && !findingMode) {
                    findingMode = dictStage["mode"];
                }
            } else if (findMonsterIndex) {
                var arrMonster = mc.CampaignManger.getArrayMonsterIndexByStageDict(dictStage);
                var found = bb.collection.findBy(arrMonster, function (monsterID) {
                    return monsterID === findMonsterIndex;
                }, findMonsterIndex);
                if (found && !findingMode) {
                    findingMode = dictStage["mode"];
                }
            }
        }
        this._arrStageInfoByModeIndex = [[], [], []];
        var arrStageInfo = mc.GameData.campaignManager.getArrayStageByChapterIndex(chapterIndex);
        var maxHardKey = "easy";
        for (var i = 0; i < arrStageInfo.length; i++) {
            var dictInfo = arrStageInfo[i];
            var key = mappingKey[dictInfo.mode];
            this._arrStageInfoByModeIndex[key].push(dictInfo);
            if (!maxHardKey || (mappingKey[dictInfo.mode] > mappingKey[maxHardKey])) {
                maxHardKey = dictInfo.mode;
            }
        }

        var currHardStageModeIndex = null;
        if (findItemIndex || findMonsterIndex) {
            currHardStageModeIndex = findingMode ? mappingKey[findingMode] : 0;
        }
        else {
            currHardStageModeIndex = mappingKey[maxHardKey] || 0;
            if (mc.GameData.guiState.getCurrentHardStageModeIndex(mc.GameData.guiState.getSelectChapterIndex()) === -1) {
                currHardStageModeIndex = mappingKey[maxHardKey] || 0;
            } else {
                currHardStageModeIndex = Math.min(mc.GameData.guiState.getCurrentHardStageModeIndex(mc.GameData.guiState.getSelectChapterIndex()), currHardStageModeIndex);
            }
        }
        this._selectMode(currHardStageModeIndex);
        this._loadStageListByMode(currHardStageModeIndex);

        this._isLoadDone = true;
        this.scheduleOnce(function () {
            this.onTriggerTutorial();
        }.bind(this), 0.03);
        this.traceDataChange(mc.GameData.tutorialManager, function () {
            this.onTriggerTutorial();
        }.bind(this));
    },

    onTriggerTutorial: function () {
        if (this._isLoadDone) {
            var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_STAGE_CAMPAIGN_LIST);
            if (tutorialTrigger) {
                if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_STAGE_BATTLE_BUTTON) {
                    var items = this._lvlStage.getItems();
                    if (items && items[this._selectIndex] && items[this._selectIndex].getChildByName("btnBattle")) {
                        new mc.LayerTutorial(tutorialTrigger)
                            .setTargetWidget(items[this._selectIndex].getChildByName("btnBattle"))
                            .setCharPositionY(cc.winSize.height * 0.8)
                            .show();
                    }
                }
            }
        }
    },

    _createEmptySlot: function () {
        var emptyWidget = new ccui.Widget();
        emptyWidget.anchorX = 0.5;
        emptyWidget.anchorY = 0.5;
        emptyWidget.width = 100;
        emptyWidget.height = 100;
        return emptyWidget;
    },

    _getLayoutReward: function (cell) {
        var layoutReward = cell.getChildByName("layoutReward");
        if (!layoutReward) {
            var focusItemView = null;
            var currFindingItemIndex = mc.GameData.guiState.getCurrentFindingItemIndex();
            var arrReward = mc.CampaignManger.getArrayRewardByStageIndex(cell.getUserData().index);
            var linearReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
                if (index < arrReward.length) {
                    var itemView = new mc.ItemView(arrReward[index]);
                    itemView.scale = 0.7;
                    itemView.setBlack(cell._isBlack);
                    if (arrReward[index].firstTime) {
                        var icon = new cc.Sprite("#icon/ico_clear.png");
                        icon.x = itemView.width * 0.085;
                        icon.y = itemView.height * 0.85;
                        itemView.addChild(icon);
                        if (cell._isBlack) {
                            icon.setColor(mc.color.BLACK_DISABLE_SOFT);
                        }
                    }
                    mc.view_utility.registerShowPopupItemInfo(itemView);
                    if (currFindingItemIndex && currFindingItemIndex === mc.ItemStock.getItemIndex(arrReward[index])) {
                        focusItemView = itemView;
                        mc.view_utility.setNotifyIconForWidget(itemView, true);
                        cell._findItemIndex = currFindingItemIndex
                    }
                    return itemView;
                }
                return this._createEmptySlot();
            }.bind(this)), 5);
            var vw = 430;
            layoutReward = mc.view_utility.wrapWidget(linearReward, vw, false, {
                top: 7,
                left: 10,
                bottom: 10,
                a1: -32,
                a2: -32
            });
            layoutReward.setName("layoutReward");
            layoutReward.anchorX = 0;
            layoutReward.x = cell.width * 0.034;
            layoutReward.y = cell.height * 0.375;
            cell.addChild(layoutReward);
            if (cell._isBlack) {
                layoutReward.setCascadeColorEnabled(true);
                layoutReward.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            else {
                if (focusItemView) {
                    layoutReward.moveViewPort && layoutReward.moveViewPort(0, focusItemView.x - vw * 0.5);
                }
            }
        }
        return layoutReward;
    },

    _getLayoutMonster: function (cell) {
        var layoutMonster = cell.getChildByName("layoutMonster");
        if (!layoutMonster) {
            var focusMonsterView = null;
            var currFindingMonsterIndex = mc.GameData.guiState.getCurrentFindingMonsterIndex();
            var arrMonster = mc.CampaignManger.getArrayMonsterIndexByStageDict(cell.getUserData());
            layoutMonster = bb.layout.linear(bb.collection.createArray(arrMonster.length, function (index) {
                if (index < arrMonster.length) {
                    var assetData = mc.dictionary.getCreatureDictByIndex(arrMonster[index]);
                    var brk = new ccui.ImageView("patch9/Monster_Panel.png", ccui.Widget.PLIST_TEXTURE);
                    brk.scale = 0.9;
                    var icon = null;
                    var spriteFrame = cc.spriteFrameCache.getSpriteFrame("png/monster/icon/" + assetData.img + ".png");
                    if (!spriteFrame) {
                        cc.log("Not Found: png/monster/icon/" + assetData.img);
                        icon = new ccui.ImageView("png/monster/icon/unknow.png", ccui.Widget.PLIST_TEXTURE);
                    }
                    else {
                        icon = new ccui.ImageView("png/monster/icon/" + assetData.img + ".png", ccui.Widget.PLIST_TEXTURE);
                    }
                    icon.x = brk.width * 0.5;
                    icon.y = brk.height * 0.5;
                    brk.addChild(icon);
                    brk.setCascadeOpacityEnabled(true);
                    brk.setCascadeColorEnabled(true);
                    if (cell._isBlack) {
                        brk.setColor(mc.color.BLACK_DISABLE_SOFT);
                    }
                    if (currFindingMonsterIndex && currFindingMonsterIndex === arrMonster[index]) {
                        focusMonsterView = brk;
                        mc.view_utility.setNotifyIconForWidget(brk, true);
                        cell._findMonsterIndex = currFindingMonsterIndex
                    }
                    return brk;
                }
                return this._createEmptySlot();
            }.bind(this)), 10);
            var vw = 430;
            layoutMonster = mc.view_utility.wrapWidget(layoutMonster, vw, false, {
                top: 7,
                left: 5,
                bottom: 10,
                a1: -32,
                a2: -32
            });
            layoutMonster.setName("layoutMonster");
            layoutMonster.anchorX = 0;
            layoutMonster.x = cell.width * 0.034;
            layoutMonster.y = cell.height * 0.375;
            cell.addChild(layoutMonster);
            if (cell._isBlack) {
                layoutMonster.setCascadeColorEnabled(true);
                layoutMonster.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            else {
                if (focusMonsterView) {
                    layoutMonster.moveViewPort && layoutMonster.moveViewPort(0, focusMonsterView.x - vw * 0.5);
                }
            }
        }
        return layoutMonster;
    },

    _reloadCell: function (cell, stageDict, stageData, index) {
        var mapCell = bb.utility.arrayToMap(cell.getChildren(), function (element) {
            return element.getName();
        });

        var lblPath = mapCell["lblPath"];
        var btnBattle = mapCell["btnBattle"];
        cell.setUserData(stageDict);
        cell._isBlack = !stageData || !stageData.unlock;

        var currViewStageModeId = mc.GameData.guiState.getViewStageCampaignModeId();
        if (currViewStageModeId === mc.GUIState.VIEW_STAGE_MODE_MONSTER) {
            this._getLayoutMonster(cell);
        }
        else {
            this._getLayoutReward(cell);
        }

        var starNo = stageData ? mc.CampaignManger.getStarNo(stageData) : 0;
        var layoutStar = bb.layout.linear(bb.collection.createArray(3, function (index) {
            var star = new ccui.ImageView((index < starNo) ? "icon/Star.png" : "icon/Disable_Star.png", ccui.Widget.PLIST_TEXTURE);
            star.scale = 1.0;
            return star;
        }), 6);
        layoutStar.x = cell.width * 0.845;
        layoutStar.y = cell.height * 0.79;

        var assetNo = mc.view_utility.createAssetView(mc.ItemStock.createJsonItemInfo(mc.const.ITEM_INDEX_STAMINA, mc.CampaignManger.getStaminaCostByStageDict(stageDict)));
        assetNo.x = cell.width * 0.845;
        assetNo.y = cell.height * 0.225;
        cell.addChild(assetNo);

        cell.addChild(layoutStar);

        btnBattle.setString(mc.dictionary.getGUIString("lblBattle"));
        if(mc.enableReplaceFontBM())
        {
            lblPath = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPath);
        }
        lblPath.setString(mc.CampaignManger.getStageNameByStageIndex(stageDict.index));
        cell.setCascadeOpacityEnabled(true);

        btnBattle.registerTouchEvent(function (btn) {
            var checkForAvailableSlot = mc.GameData.checkForAvailableSlot(mc.GameData.CHECK_SLOT_TYPE_ITEM);
            var buyMore = checkForAvailableSlot["buyMore"];
            var avaiSlots = checkForAvailableSlot["avaiSlots"];
            if (avaiSlots <= 0) {
                if (buyMore) {
                    mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFull"), function () {
                        mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT);
                    }, mc.dictionary.getGUIString("lblBuy")).show();
                } else {
                    mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFullLimit"), function () {
                    }, mc.dictionary.getGUIString("lblOk")).show();
                }
                return;
            }

            var stageData = btn.getUserData();
            var obj = mc.GameData.campaignManager.updatePreLoadResourceURL(mc.dictionary.getStageDictByIndex(stageData["index"]));
            var arrPreLoadMonsterIndex = obj.monsters;
            var arrRes = [];
            for (var m = 0; m < arrPreLoadMonsterIndex.length; m++) {
                arrRes = mc.resource.getPreLoadSpineURL(arrPreLoadMonsterIndex[m], arrRes);
                arrRes = mc.resource.getPreLoadSoundURL(arrPreLoadMonsterIndex[m], arrRes);
            }
            arrRes.push(res.spine_default_hit_effect_json);
            arrRes.push(res.spine_default_hit_effect_png);
            !cc.sys.isNative && arrRes.push(res.spine_default_hit_effect_atlas);
            arrRes.push(obj.brk);
            var loadingId = mc.view_utility.showLoadingDialog();
            this.getMainScreen().loadMoreURL(arrRes, function () {
                mc.view_utility.hideLoadingDialogById(loadingId);
                mc.GameData.guiState.setSelectStageCampaignIndex(mc.CampaignManger.getStageIndex(stageData));
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SELECT_CAMPAIGN_HERO);
            }.bind(this));
        }.bind(this));
        btnBattle.setUserData(stageData);

        if (cell._isBlack) {
            layoutStar.setCascadeColorEnabled(true);
            cell.setCascadeColorEnabled(true);
            btnBattle.setCascadeColorEnabled(true);
            cell.setColor(mc.color.BLACK_DISABLE_SOFT);
            assetNo.setColor(mc.color.BLACK_DISABLE_SOFT);
            btnBattle.setColor(mc.color.BLACK_DISABLE_SOFT);
            btnBattle.setEnabled(false);
        }
        else if (stageData && !stageData.clear) {
            var sprNew = mc.view_utility.createTextNew();
            sprNew.runAction(cc.sequence([cc.delayTime(2.0), cc.shake(0.2, cc.size(10, 0))]).repeatForever());
            sprNew.x = lblPath.x + lblPath.width * lblPath.scale + 15 + sprNew.width * 0.5;
            sprNew.y = lblPath.y - 3;
            cell.addChild(sprNew);
        }


    },

    _flipCell: function (cell, isFlipReward) {
        var delayTime = 0.2;
        var layoutMonster = this._getLayoutMonster(cell);
        var layoutReward = this._getLayoutReward(cell);
        if (!isFlipReward) {
            layoutMonster.setVisible(true);
            layoutMonster.opacity = 0;
            layoutMonster.runAction(cc.fadeIn(delayTime));
            layoutReward.runAction(cc.sequence([cc.fadeOut(delayTime), cc.callFunc(function () {
                layoutReward.setVisible(false);
            })]));
        }
        else {
            layoutReward.setVisible(true);
            layoutReward.opacity = 0;
            layoutReward.runAction(cc.fadeIn(delayTime));
            layoutMonster.runAction(cc.sequence([cc.fadeOut(delayTime), cc.callFunc(function () {
                layoutMonster.setVisible(false);
            })]));
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST;
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