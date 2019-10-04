/**
 * Created by long.nguyen on 10/12/2017.
 */
mc.QuestDetailListLayer = mc.LoadingLayer.extend({

    ctor: function (parseNode) {
        this._super();

        var questGroup = this._getQuestGroupInfo();
        var root = this.parseCCStudio(parseNode || res.layer_quest_detail_list);
        var mapRootView = bb.utility.arrayToMap(root.getChildren(), function (element) {
            return element.getName();
        });

        var btnBack = mapRootView["btnBack"];
        var imgTitle = mapRootView["imgTitle"];
        var imgQuantity = this._imgQuantity = mapRootView["imgQuantity"];
        var btnClaimAll = this._btnClaimAll = mapRootView["btnClaimAll"];
        var cell = this._cell = mapRootView["cell"];
        var lvlCell = this._lvlCell = mapRootView["lvlCell"];
        var nodeBrk = mapRootView["nodeBrk"];
        cell.setVisible(false);

        imgTitle._maxLblWidth = imgTitle.width - 100;
        var lblTitle = imgTitle.setString(mc.QuestManager.getQuestGroupName(questGroup), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var self = this;
        btnClaimAll.setVisible(false);
        btnClaimAll.setString(mc.dictionary.getGUIString("lblClaimAll"));
        btnClaimAll.registerTouchEvent(function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            var currQuestGroupId = mc.GameData.guiState.getCurrentQuestGroupId();
            var arrQuestInfo = mc.GameData.questManager.getArrayQuestInfoByGroupId(currQuestGroupId);
            var arrClaimQuestInfo = bb.collection.filterBy(arrQuestInfo, function (questInfo) {
                return mc.QuestManager.isQuestClaim(questInfo);
            });
            mc.protocol.claimAllQuest(mc.QuestManager.getQuestGroupId(questGroup), bb.collection.createArray(arrClaimQuestInfo.length, function (index) {
                return mc.QuestManager.getQuestId(arrClaimQuestInfo[index]);
            }), function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    var arrQuestId = result["qids"];
                    var allCellView = self._lvlCell.getItems();
                    bb.collection.findSameBetween(allCellView, arrQuestId, function (cellView, qId) {
                        return mc.QuestManager.getQuestId(cellView.getUserData()) === qId;
                    }, function (cellView, qId) {
                        cellView.getUserData()["claim"] = false;
                        self._setDisableForCell(cellView);
                    });
                    self._updateGUI();
                }
            });
        });

        var spineWorldMap = this._spineWorldMap = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_world_map_json, res.spine_ui_world_map_atlas, 1.0);
        spineWorldMap.setAnimation(0, "animation", true);
        spineWorldMap.setLocalZOrder(-1);
        spineWorldMap.x = -300;
        spineWorldMap.y = -500;
        nodeBrk.addChild(spineWorldMap);
    },

    _getQuestGroupInfo: function () {
        var currQuestGroupId = mc.GameData.guiState.getCurrentQuestGroupId();
        var questGroup = mc.GameData.questManager.getQuestGroupById(currQuestGroupId);
        return questGroup;
    },

    _updateGUI: function () {
        var currQuestGroupId = mc.GameData.guiState.getCurrentQuestGroupId();
        var arrQuestInfo = mc.GameData.questManager.getArrayQuestInfoByGroupId(currQuestGroupId);
        var claimCount = 0;
        var total = 0;
        if (arrQuestInfo) {
            total = arrQuestInfo.length;
            for (var i = 0; i < arrQuestInfo.length; i++) {
                var questInfo = arrQuestInfo[i];
                if (mc.QuestManager.isQuestClaim(questInfo)) {
                    claimCount++;
                }
            }
        }
        this._btnClaimAll.setVisible(claimCount > 0);
        this._imgQuantity.setString(claimCount + "/" + total);
    },

    onLoading: function () {
        var currQuestGroupId = mc.GameData.guiState.getCurrentQuestGroupId();
        var questManager = mc.GameData.questManager;
        if (questManager.isArrayQuestChangingByGroupId(currQuestGroupId)) {
            mc.protocol.getQuestList(currQuestGroupId, function (result) {
                this.performDone(result.arrQuest);
            }.bind(this));
        }
        else {
            this.performDone(questManager.getArrayQuestInfoByGroupId(currQuestGroupId));
        }
    },

    onLoadDone: function (arrQuestInfo) {
        arrQuestInfo.sort(function (questInfo1, questInfo2) {
            var num1 = mc.QuestManager.isQuestClaim(questInfo1) * -100000;
            var num2 = mc.QuestManager.isQuestClaim(questInfo2) * -100000;
            num1 += mc.QuestManager.getQuestIndex(questInfo1);
            num2 += mc.QuestManager.getQuestIndex(questInfo2);
            return num1 - num2;
        });
        this._lvlCell.removeAllChildren();
        var unSeenCount = 0;
        for (var i = 0; i < arrQuestInfo.length; i++) {
            var questInfo = arrQuestInfo[i];
            var cell = this._cell.clone();
            this._lvlCell.pushBackCustomItem(this._reloadCell(cell, questInfo));
            if (!mc.QuestManager.isQuestSeen(questInfo)) {
                unSeenCount++;
            }
        }
        if (unSeenCount > 0) {
            var currQuestGroupId = mc.GameData.guiState.getCurrentQuestGroupId();
            mc.GameData.questManager.notifyArrQuestInfoByGroupIdChanging(currQuestGroupId);
        }

        this._updateGUI();
    },

    _reloadCell: function (cell, questDetailInfo) {
        var mapCellView = bb.utility.arrayToMap(cell.getChildren(), function (element) {
            return element.getName();
        });

        var brk = mapCellView["brk"];
        var lblName = mapCellView["lblName"];
        var lblComplete = mapCellView["lblComplete"];
        var lblDesc = mapCellView["lblDes"];
        var btn = mapCellView["btn"];
        var imgQuantity = mapCellView["imgQuantity"];


        lblDesc.setString(mc.QuestManager.getQuestDescription(questDetailInfo));
        lblName.setString(mc.QuestManager.getQuestName(questDetailInfo));
        if(mc.enableReplaceFontBM())
        {
            lblDesc = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblDesc);
            lblName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblName);
        }
        lblComplete.setColor(mc.color.YELLOW);
        lblDesc.setColor(mc.color.BROWN_SOFT);
        var qc = bb.utility.formatNumber(mc.QuestManager.getCurrentQuestCount(questDetailInfo));
        var qr = bb.utility.formatNumber(mc.QuestManager.getRequireQuestCount(questDetailInfo));
        if (mc.QuestManager.getQuestTaskType(questDetailInfo) === 6) {
            lblComplete.setString((qc === qr ? 1 : 0) + "/" + 1);
        } else {
            lblComplete.setString(qc + "/" + qr);
        }
        if (lblComplete.x - lblComplete.width - 15 < imgQuantity.x - imgQuantity.width) {
            imgQuantity.width = imgQuantity.x - (lblComplete.x - lblComplete.width - 15);
        }

        var arrReward = mc.QuestManager.getArrayReward(questDetailInfo);
        var arrRewardView = [];
        var layoutReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
            if (index < arrReward.length) {
                var itemView = new mc.ItemView(arrReward[index]);
                itemView.setNewScale(0.75);
                mc.view_utility.registerShowPopupItemInfo(itemView);
                arrRewardView.push(itemView);
                return itemView;
            }
            return this._createEmptySlot();
        }.bind(this)), 35);
        layoutReward = mc.view_utility.wrapWidget(layoutReward, 480, false, {
            top: 7,
            left: -10,
            bottom: 10,
            a1: -32,
            a2: -32
        });
        layoutReward.setName("layoutReward");
        layoutReward.anchorX = 0;
        layoutReward.x = cell.width * 0.05;
        layoutReward.y = cell.height * 0.3;
        cell.addChild(layoutReward);
        cell._arrRewardView = arrRewardView;

        if (!mc.QuestManager.isQuestSeen(questDetailInfo)) {
            var sprNew = mc.view_utility.createTextNew();
            sprNew.setName("sprNew");
            sprNew.runAction(cc.sequence([cc.delayTime(2.0), cc.shake(0.2, cc.size(10, 0))]).repeatForever());
            sprNew.x = lblName.x + lblName.width * lblName.scale + 10 + sprNew.width * 0.5;
            sprNew.y = lblName.y - 3;
            cell.addChild(sprNew);
        }

        var isQuestClaim = mc.QuestManager.isQuestClaim(questDetailInfo);
        if(mc.enableReplaceFontBM())
        {
            var lblBtn = btn.setString(mc.dictionary.getGUIString(isQuestClaim ? "lblClaim" : "lblGo"));
            lblBtn.setFontSize(36);
        }
        else
        {
            btn.setString(mc.dictionary.getGUIString(isQuestClaim ? "lblClaim" : "lblGo"));
        }
        if (mc.QuestManager.isQuestClaim(questDetailInfo)) {
            btn.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
            btn.ignoreContentAdaptWithSize(true);
            brk.loadTexture("patch9/pnl_name_pink.png", ccui.Widget.PLIST_TEXTURE);
        }
        var self = this;
        btn.setUserData(questDetailInfo);
        btn.registerTouchEvent(function (widget) {
            var questInfo = widget.getUserData();
            if (mc.QuestManager.isQuestClaim(questInfo)) {
                var loadingDialogId = mc.view_utility.showLoadingDialog();
                mc.protocol.claimQuest(mc.QuestManager.getQuestId(questInfo), function (data) {
                    mc.view_utility.hideLoadingDialogById(loadingDialogId);
                    if (data) {
                        var cell = widget.getParent();
                        self._setDisableForCell(cell);
                        self._updateGUI();
                    }
                }.bind(this));
            }
            else {
                var goToCode = mc.QuestManager.getQuestGoToCode(questInfo);
                if (goToCode) {
                    var strs = goToCode.split('_');
                    if (strs[0] === "map") {
                        mc.GameData.guiState.setCurrentFindingMonsterIndex(parseInt(mc.QuestManager.getQuestTaskObject(questInfo)));
                    }
                    else if (strs[0] === "viewad") {
                        mc.view_utility.view_videoAd(function () {
                            var loadingId = mc.view_utility.showLoadingDialog();
                            mc.protocol.getQuestList(mc.GameData.guiState.getCurrentQuestGroupId(), function (result) {
                                mc.view_utility.hideLoadingDialogById(loadingId);
                                self.performDone(result.arrQuest);
                            });
                        });
                    }
                }
                mc.view_utility.goTo(goToCode);
            }
        }.bind(this));
        btn.setVisible(mc.QuestManager.getQuestGoToCode(questDetailInfo) != null);

        btn.setCascadeOpacityEnabled(true);
        btn.setCascadeColorEnabled(true);
        layoutReward.setCascadeOpacityEnabled(true);
        layoutReward.setCascadeColorEnabled(true);
        cell.setCascadeOpacityEnabled(true);
        cell.setCascadeColorEnabled(true);
        cell.setVisible(true);
        cell.setUserData(questDetailInfo);
        return cell;
    },

    _setDisableForCell: function (cell) {
        cell.setColor(mc.color.BLACK_DISABLE_SOFT);
        cell.getChildByName("layoutReward").setColor(mc.color.BLACK_DISABLE_SOFT);
        cell.getChildByName("btn").setVisible(false);
        var sprNew = cell.getChildByName("sprNew");
        sprNew && sprNew.setVisible(false);
        if (cell._arrRewardView) {
            for (var i = 0; i < cell._arrRewardView.length; i++) {
                cell._arrRewardView[i].setBlack(true);
            }
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_QUEST_DETAIL_LIST;
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