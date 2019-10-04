/**
 * Created by long.nguyen on 5/28/2018.
 */
mc.SummonItemScreen = mc.Screen.extend({

    onScreenShow: function () {
        var screen = this._nodeShowHero = mc.loadGUI(res.layer_hero_summon);
        this.addChild(screen);

        var root = screen.getChildByName("root");
        var nodeParticle = root.getChildByName("nodeParticle");
        var hero = this._nodeHero = root.getChildByName("hero");
        var panelInfo = root.getChildByName("panelInfo");
        var btnDone = this._btnDone = root.getChildByName("btnDone");
        var btnOk = this._btnOk = root.getChildByName("btnOk");
        var btnBack = this._btnBack = root.getChildByName("btnBack");
        var char = this._nodeChar = hero.getChildByName("char");

        btnBack.setLocalZOrder(999);
        btnBack.y += 20;

        btnOk.setVisible(false);
        btnDone.setVisible(false);
        var containerItem = new ccui.Layout();
        containerItem.x = char.x;
        containerItem.y = char.y;
        containerItem.anchorX = char.anchorX;
        containerItem.anchorY = char.anchorY;
        containerItem.width = char.width;
        containerItem.height = char.height;
        hero.addChild(containerItem);

        btnBack.setVisible(false);
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });

        var arrItem = mc.GameData.summonManager.getArraySummonItem();
        mc.createBigTreasureBox(arrItem, char, root, function () {
            btnBack.setVisible(true);
            btnBack.setLocalZOrder(99);
        });
    },

    onScreenClose: function () {
        mc.GameData.summonManager.clearSummonData();
    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_SUMMON_ITEM;
    }

});

mc.createBigTreasureBox = function (arrItem, nodePosition, container, completeCb) {
    bb.sound.preloadEffect(res.sound_ui_summon_reward_5star);
    bb.sound.preloadEffect(res.sound_ui_battle_win_star1);
    bb.sound.preloadEffect(res.sound_ui_battle_win_star2);
    bb.sound.preloadEffect(res.sound_ui_battle_chest_drop);

    if (!arrItem || arrItem.length === 0) {
        arrItem = [];
        for (var i = 0; i < 10; i++) {
            arrItem.push(mc.ItemStock.createJsonItemZen(1000));
        }
    }
    var maxRank = -1;
    for (var i = 0; i < arrItem.length; i++) {
        var rank = mc.ItemStock.getItemRank(arrItem[i]);
        if (rank >= maxRank) {
            maxRank = rank;
        }
    }
    var animation = "idle";
    if (maxRank == 3) {
        animation = "idle3";
    } else if (maxRank == 4) {
        animation = "idle4";
    }

    var chestIndex = 0;
    if (maxRank <= 3) {
        chestIndex = 0;
    } else if (maxRank >= 4) {
        chestIndex = 1;
    } else {
        chestIndex = 2;
    }
    var treasureBox = container._treasureBox = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_summon_json, res.spine_ui_chest_summon_atlas, 1.0);
    treasureBox.x = nodePosition.width * 0.5;
    treasureBox.setAnimation(0, animation, true);
    nodePosition.addChild(treasureBox);
    var treasureRectangle = new ccui.Layout();
    treasureRectangle.anchorX = 0.5;
    treasureRectangle.x = treasureBox.x;
    treasureRectangle.width = 120;
    treasureRectangle.height = 100;
    nodePosition.addChild(treasureRectangle);

    var layout = container._layout = bb.layout.grid(bb.collection.createArray(arrItem.length, function (index) {
        var itemView = new mc.ItemView(arrItem[index]);
        var widget = new ccui.Widget();
        widget.setContentSize(itemView.width, itemView.height);
        widget.addChild(itemView, 2);
        var front = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_front_json, res.spine_ui_item_panel_front_atlas, 1.0);
        var back = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_back_json, res.spine_ui_item_panel_back_atlas, 1.0);
        widget.addChild(front, 3);
        widget.addChild(back, 1);
        widget.itemView = itemView;
        widget.spineBack = back;
        widget.spineFront = front;
        widget.itemRank = mc.ItemStock.getItemRank(arrItem[index]);

        front.setPosition(widget.width / 2, widget.height / 2);
        itemView.setPosition(widget.width / 2, widget.height / 2);
        back.setPosition(widget.width / 2, widget.height / 2);
        front.setVisible(false);
        back.setVisible(false);
        itemView.setVisible(false);
        return widget;
    }), arrItem.length > 1 ? 3 : 1, cc.winSize.width, 35);
    layout.setVisible(false);
    layout.x = cc.winSize.width * 0.5;
    layout.y = arrItem.length > 1 ? cc.winSize.height * 0.65 : cc.winSize.height * 0.8;
    container.addChild(layout);

    treasureRectangle.registerTouchEvent(function () {
        treasureRectangle.setEnabled(false);
        var treasureBox = container._treasureBox;
        var layout = container._layout;
        treasureBox.clearTrack(0);
        treasureBox.setToSetupPose();
        treasureBox.setAnimation(1, "open", false);

        bb.sound.playEffect(res.sound_ui_summon_reward_5star);
        var blackPanel = new ccui.Layout();
        blackPanel.width = cc.winSize.width;
        blackPanel.height = cc.winSize.height;
        blackPanel.setBackGroundColor(cc.color.BLACK);
        blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        blackPanel.setLocalZOrder(10);
        blackPanel.opacity = bb.framework.getTrueOpacity(0);
        blackPanel.runAction(cc.fadeTo(0.3, 150));
        layout.setLocalZOrder(11);
        container.addChild(blackPanel);
        treasureBox.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 1) {
                treasureBox.clearTrack(1);
                treasureBox.setToSetupPose();
                treasureBox.setAnimation(2, "opened", true);
            }
        }.bind(this));
        treasureBox.setEventListener(function (trackEntry, event) {
            var key = event.data.name;
            if (key === "item_show") {
                layout.setVisible(true);
                var allItemView = layout.getChildren();
                allItemView = cc.copyArray(allItemView);
                var _showItemView = function () {
                    if (allItemView.length > 0) {
                        var itemWidget = allItemView[0];
                        itemWidget.setVisible(true);

                        var rankAppear = "rank" + itemWidget.itemRank + "_appear";
                        var rankIdle = "rank" + itemWidget.itemRank + "_idle";

                        var pos = itemWidget.getPosition();
                        bb.sound.playEffect(res.sound_ui_battle_chest_drop);
                        itemWidget.setPosition(layout.convertToNodeSpace(cc.p(cc.winSize.width / 2, cc.winSize.height * 0.6)));
                        itemWidget.runAction(cc.sequence(cc.spawn(cc.moveTo(0.1, pos.x, pos.y), cc.scaleTo(0.3, 0.9), cc.fadeIn(0.3)), cc.callFunc(function () {
                            front.setAnimation(0, rankAppear, false);
                            allItemView.splice(0, 1);
                            _showItemView();
                        })));
                        var back = itemWidget.spineBack;
                        var front = itemWidget.spineFront;
                        var item = itemWidget.itemView;
                        front.setEventListener(function (trackEntry, event) {
                            var key = event.data.name;
                            if (key === "item_appear") {
                                item.setVisible(true);
                                back.setAnimation(0, rankIdle, true);
                                back.setVisible(true);
                                item.registerViewItemInfo();
                                var particle = new cc.ParticleSystem(res["particle_appear_rank" + itemWidget.itemRank + "_plist"]);
                                particle.setPosition(itemWidget.width / 2, itemWidget.height / 2);
                                particle.runAction(cc.sequence([cc.delayTime(2.0), cc.removeSelf()]));
                                itemWidget.addChild(particle, 10);
                                bb.sound.playEffect(itemWidget.itemRank >= 3 ? res.sound_ui_battle_win_star2 : res.sound_ui_battle_win_star1);
                            }
                        }.bind(this));
                        front.setCompleteListener(function () {
                            front.setAnimation(0, rankIdle, true);
                            front.setCompleteListener(null);
                        }.bind(this));
                        front.setVisible(true);
                        itemWidget.setScale(0.1);
                        itemWidget.setOpacity(0);
                    } else {
                        completeCb && completeCb();
                    }
                };
                for (var i = 0; i < allItemView.length; i++) {
                    var itemView = allItemView[i];
                    itemView.setVisible(false);
                }
                _showItemView();
            }
        }.bind(this));
    }.bind(this));
};