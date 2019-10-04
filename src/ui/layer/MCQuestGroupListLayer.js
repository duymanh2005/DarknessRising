/**
 * Created by long.nguyen on 10/11/2017.
 */
mc.QuestGroupListLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();

        var root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelMiddle = rootMap["panelMiddle"];
        var nodeBrk = rootMap["nodeBrk"];

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblQuest"));

        var notifySystem = mc.GameData.notifySystem;
        var questCompleteNotification = notifySystem.getQuestCompleteNotification();
        var arrQuestGroup = mc.GameData.questManager.getArrQuestGroup();
        var contentView = bb.layout.linear(bb.collection.createArray(arrQuestGroup.length, function (i) {
            var questGroup = arrQuestGroup[i];
            var banner = new ccui.ImageView("res/png/banner/" + mc.QuestManager.getQuestGroupURL(questGroup), ccui.Widget.LOCAL_TEXTURE);
            banner.setUserData(questGroup);
            var lblBanner = banner.setString(mc.QuestManager.getQuestGroupName(questGroup), res.font_UTMBienvenue_stroke_32_export_fnt);
            lblBanner.setOverlayColor(mc.color.RED);
            lblBanner.anchorX = 0;
            lblBanner.x = banner.width * 0.05;
            lblBanner.y = banner.height * 0.45;
            lblBanner.scale = 1.5;
            banner.registerTouchEvent(function (banner) {
                var questGroup = banner.getUserData();
                if (mc.QuestManager.isQuestGroupUnlock(questGroup)) {
                    mc.GameData.guiState.setCurrentQuestGroupId(mc.QuestManager.getQuestGroupId(questGroup));
                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_QUEST_DETAIL_LIST);
                }
                else {

                }
                mc.view_utility.seenNotify(banner);
            }.bind(this));
            var questGroupId = mc.QuestManager.getQuestGroupId(questGroup);
            if (questCompleteNotification && questCompleteNotification[questGroupId]) {
                mc.view_utility.setNotifyIconForWidget(banner, mc.QuestManager.getNumberQuestCompleteInGroup(questCompleteNotification[questGroupId]) > 0, 0.8);
            }
            return banner;
        }.bind(this)), 0, bb.layout.LINEAR_VERTICAL);
        contentView.anchorY = 1;
        contentView.x = panelMiddle.width * 0.5;
        contentView.y = panelMiddle.height + 45;
        panelMiddle.addChild(contentView);

        nodeBrk.y = 0;
        var spineWorldMap = this._spineWorldMap = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_world_map_json, res.spine_ui_world_map_atlas, 1.0);
        spineWorldMap.setAnimation(0, "animation", true);
        spineWorldMap.setLocalZOrder(-1);
        spineWorldMap.x = -600;
        spineWorldMap.y = -500;
        nodeBrk.addChild(spineWorldMap);
        var blackBrk = new ccui.Layout();
        blackBrk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        blackBrk.setBackGroundColorOpacity(bb.framework.getTrueOpacity(128));
        blackBrk.setBackGroundColor(cc.color.BLACK);
        blackBrk.anchorX = 0.5;
        blackBrk.width = cc.winSize.width;
        blackBrk.height = mc.const.DEFAULT_HEIGHT;
        nodeBrk.addChild(blackBrk);
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_QUEST_LIST;
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