/**
 * Created by long.nguyen on 1/29/2018.
 */
mc.BlackSmithLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();

        var root = this.parseCCStudio(parseNode || res.layer_stock);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var nodeBrk = rootMap["nodeBrk"];
        var panelMiddle = rootMap["panelMiddle"];

        var notifySystem = mc.GameData.notifySystem;
        nodeBrk.addChild(new ccui.ImageView("res/brk/BG_Upgarde_Before.png", ccui.Widget.LOCAL_TEXTURE));
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblHomeGoblin"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var contentView = this._contentView = bb.layout.linear(bb.collection.createArray(5, function (i) {
            var url = null;
            var name = "";
            var param = null;
            switch (i) {
                case 0:
                    url = "res/png/banner/pnl_Exchange_stone.png";
                    name = mc.dictionary.getGUIString("lblExchangeStones");
                    param = "exchange";
                    break;
                case 1:
                    url = "res/png/banner/pnl_Exchange_item.png";
                    name = mc.dictionary.getGUIString("lblExchangeItems");
                    param = "sell";
                    break;
                case 2:
                    url = "res/png/banner/pnl_Upgrade_option.png";
                    name = mc.dictionary.getGUIString("Create Option");
                    param = "option";
                    break;
                case 3:
                    url = "res/png/banner/pnl_Enhance_Item.png";
                    name = mc.dictionary.getGUIString("lblCraftWeapon");
                    param = "craft";
                    break;
                case 4:
                    url = "res/png/banner/pnl_Upgrade_weapon.png";
                    name = mc.dictionary.getGUIString("lblUpgradeWeapon");
                    param = "upgrade";
                    break;
            }

            if (url) {
                var bg = new ccui.ImageView("res/png/banner/pnl_Upgrade_wood.png", ccui.Widget.LOCAL_TEXTURE);
                var imgView = new ccui.ImageView(url, ccui.Widget.LOCAL_TEXTURE);
                bg.setUserData(param);
                bg.addChild(imgView);
                imgView.setPosition(15, bg.height / 2);
                bg.registerTouchEvent(function (bg) {
                    var par = bg.getUserData();
                    if( par === "exchange" ){
                        mc.view_utility.confirmFunction(mc.const.FUNCTION_EXCHANGE_HERO, function () {
                            mc.GUIFactory.showExchangeStonesScreen();
                        }.bind(this));
                    }
                    else if( par === "sell" ){
                        mc.view_utility.confirmFunction(mc.const.FUNCTION_EXCHANGE_ITEM, function () {
                            mc.GUIFactory.showQuickSellItemsScreen();
                        }.bind(this));
                    }
                    else if( par === "option" ){
                        // mc.view_utility.showComingSoon();
                        //mc.GUIFactory.showAddChangeOptionScreen();
                        mc.GameData.guiState.setCurrentRefineOptionEquip(null);
                        new mc.ItemOptionActionDialog().show();
                    }
                    else if( par === "craft" ){
                        mc.view_utility.confirmFunction(mc.const.FUNCTION_CRAFT_ITEM, function () {
                            mc.GUIFactory.showCraftItemScreen();
                        }.bind(this));
                    }
                    else if( par === "upgrade" ){
                        mc.GUIFactory.showRefineItemScreen();
                    }
                });
                //if (i === 4) {
                //    mc.view_utility.setNotifyIconForWidget(bg, notifySystem.getEquipmentLevelUpNotification() != null, 0.9, 0.9);
                //}
                //else if (i === 3) {
                //    mc.view_utility.setNotifyIconForWidget(bg, notifySystem.getEquipmentCraftingNotification() != null, 0.9, 0.9);
                //}
                //else if (i === 2) {
                //    mc.view_utility.setNotifyIconForWidget(bg, notifySystem.getEquipmentAddOptionNotification() != null, 0.9, 0.9);
                //}
                var lbl = bg.setString(name, res.font_UTMBienvenue_none_32_export_fnt);
                lbl.setColor(mc.color.BROWN_SOFT);
                lbl.scale = 1.1;
                lbl.x = bg.width * 0.55;
                lbl.y = bg.height * 0.6;
                return bg;
            }
            return null;
        }.bind(this)), 50, bb.layout.LINEAR_VERTICAL);
        contentView.anchorY = 1;
        contentView.x = panelMiddle.width * 0.55;
        contentView.y = panelMiddle.height;
        panelMiddle.addChild(contentView);
    },

    _findButtonByFunction:function(param){
        var childs = this._contentView.getChildren();
        var btn = bb.collection.findBy(childs,function(child,param){
            return child.getUserData() === param;
        },param);
        return btn != null ? btn : childs[0];
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_BLACK_SMITH);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON &&
                tutorialTrigger.param === "upgrade") {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._findButtonByFunction("upgrade"))
                    .setScaleHole(1.5)
                    .setCharPositionY(cc.winSize.height*0.4)
                    .show();
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON &&
                tutorialTrigger.param === "craft") {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._findButtonByFunction("craft"))
                    .setScaleHole(1.5)
                    .show();
            }
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_BLACK_SMITH;
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