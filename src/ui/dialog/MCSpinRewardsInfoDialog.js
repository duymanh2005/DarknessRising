mc.SpinRewardsInfoDialog = bb.Dialog.extend({
    ctor: function () {
        this._super();

        var node = ccs.load(res.widget_spin_rewards_info_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var btnClose = rootMap["btnClose"];
        var lblTitle = rootMap["lbl_title"];
        var listText = rootMap["list_text"];
        var item = rootMap["cell"];
        item.setVisible(false);


        lblTitle.setColor(mc.color.YELLOW_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblSpinInfo"));


        var data = mc.dictionary.spinData;
        var firstTime = true;
        for (var i in data) {
            if (!firstTime) {
                var seperator = new ccui.ImageView("patch9/seperation_line.png", ccui.Widget.PLIST_TEXTURE);
                listText.pushBackCustomItem(seperator);
            } else {
                firstTime = false;
            }
            var clone = item.clone();
            this.bindCell(clone, data[i]);
            listText.pushBackCustomItem(clone);
        }


        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));

    },

    getNameByIndex: function (index) {
        switch (index) {
            case 0:
                return "Bless Group";
            case 1:
                return "Gem Group";
            case 2:
                return "Crystal Group";
            case 3:
                return "Exp Book Group";
            case 4:
                return "Weapon Group";
            case 5:
                return "Equip Group";
            case 6:
                return "Mics Group";
            case 7:
                return "Zen Group";
        }
    },

    bindCell: function (cell, data) {
        cell.setVisible(true);
        var lblRate = cell.getChildByName("lblRate");
        lblRate.setString(mc.dictionary.getGUIString(this.getNameByIndex(data["index"])));
        lblRate.setColor(mc.color.BLUE_SOFT);
        this._getLayoutReward(cell, data);
    },

    _getLayoutReward: function (cell, data) {
        var layoutReward = cell.getChildByName("layoutReward");
        if (!layoutReward) {
            var focusItemView = null;
            var arrReward = mc.ItemStock.createArrJsonItemFromStr(data["rewardString"]);
            var linearReward = bb.layout.linear(bb.collection.createArray(arrReward.length, function (index) {
                if (index < arrReward.length) {
                    var itemView = new mc.ItemView(arrReward[index]);
                    itemView.scale = 0.9;
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
                    return itemView;
                }
                return this._createEmptySlot();
            }.bind(this)), 5);
            var vw = cell.width;
            layoutReward = mc.view_utility.wrapWidget(linearReward, vw, false, {
                top: 7,
                left: 10,
                bottom: 10,
                a1: -32,
                a2: -32
            });
            layoutReward.setName("layoutReward");
            layoutReward.anchorX = 0.5;
            layoutReward.anchorY = 0.5;
            layoutReward.x = cell.width / 2;
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
    }


});