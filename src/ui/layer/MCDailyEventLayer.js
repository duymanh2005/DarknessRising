/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.ArenaDailyEventLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_daily_event);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var brkTitle = rootMap["brkTitle"];
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblWeeklyEvent"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.BROWN_SOFT);
        brkTitle.setLocalZOrder(10);


        var nodeBrk = rootMap["nodeBrk"];
        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        nodeBrk.addChild(sprBrk);

        var eventItem = this._eventItem = rootMap["event_item"];
        eventItem.setVisible(false);
        var arrDynamicDailyEvent = mc.dictionary.arrDynamicDailyEvent;

        var listLeaguePanel = [];
        var index = 0;
        for (var i in arrDynamicDailyEvent) {
            var event = arrDynamicDailyEvent[i];
            if (mc.GameData.dynamicDailyEvent.getRunningEvent() && event["seasonEventID"] === mc.GameData.dynamicDailyEvent.getRunningEvent()) {
                listLeaguePanel.push(this.bindActiveEvent(event));
                this.focusIndex = index;
            } else {
                listLeaguePanel.push(this.bindInactiveEvent(event));
            }
            index++;
        }

        var layout = mc.widget_utility.createScrollNode(listLeaguePanel, null, 613, cc.p(cc.winSize.width, eventItem.height));
        layout.setLoopScroll(false);
        this._root.addChild(layout);
        layout.setPosition(this._root.width / 2, this._root.height * 0.42);
        layout.focusAt(this.focusIndex, true);

    },


    bindActiveEvent: function (event) {
        var layer = this._eventItem.clone();
        layer.setVisible(true);
        var img = layer.getChildByName("img");
        img.loadTexture("res/png/banner/" + event["eventBanner"], ccui.Widget.LOCAL_TEXTURE);
        img.setOpacity(255 * 0.84);
        var btnQuest = layer.getChildByName("btnQuest");
        var btnRewards = layer.getChildByName("btnRewards");
        var lblQuest = btnQuest.setString(mc.dictionary.getGUIString("lblGoToQuest"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var lblRewards = btnRewards.setString(mc.dictionary.getGUIString("lblRewards"), res.font_UTMBienvenue_stroke_32_export_fnt);

        var btnInfo = img.getChildByName("btnInfo");
        var self = this;
        var InfoCB = function () {
            new mc.MCEventInfoDialog().show();
        };
        btnInfo.registerTouchEvent(InfoCB.bind(this));
        btnQuest.registerTouchEvent(function () {
            mc.GameData.guiState.setCurrentQuestGroupId(mc.QuestManager.EVENT);
            self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_QUEST_DETAIL_LIST);
        });
        btnRewards.registerTouchEvent(function () {
            new mc.MCExchangeMedalDialog(event).show();
        });

        return layer;
    },


    bindInactiveEvent: function (event) {
        var layer = this._eventItem.clone();
        layer.setVisible(true);
        var img = layer.getChildByName("img");
        img.loadTexture("res/png/banner/" + event["eventBanner"]);
        img.setGray(true);
        img.setSwallowTouches(false);
        var btnQuest = layer.getChildByName("btnQuest");
        var btnRewards = layer.getChildByName("btnRewards");
        var btnInfo = img.getChildByName("btnInfo");
        btnQuest.setVisible(false);
        btnRewards.setVisible(false);
        btnInfo.setVisible(false);
        return layer;
    },


    onLoading: function () {
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.getTopArena(0, function (arrRanker) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (arrRanker) {
                this.performDone(arrRanker);
            }
        }.bind(this));
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            for (var i = 0; i < arrRanker.length; i++) {
                this._lvlMyLeague.pushBackCustomItem(this._reloadCell(this._cellRank.clone(), arrRanker[i]));
            }
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_DAILY_EVENT;
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
