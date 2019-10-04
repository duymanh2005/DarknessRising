/**
 * Created by long.nguyen on 6/8/2018.
 */
mc.RewardListDialog = bb.Dialog.extend({

    ctor: function (arrItem, title, desc) {
        this._super();

        var node = ccs.load(res.widget_reward_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        this._brk = rootMap["brk"];
        var lblTitle = rootMap["lblTitle"];
        var lblDes = rootMap["lblDes"];
        var brkSlot = rootMap["brkSlot"];
        var nodeItems = rootMap["nodeItems"];
        var btnClose = rootMap["btnClose"];

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblDes.setColor(mc.color.BROWN_SOFT);
        lblTitle.setString(title || mc.dictionary.getGUIString("lblRewards"));
        lblDes.setString(desc || mc.dictionary.getGUIString("txtWillGetRewardList"));

        var gridLayout = bb.layout.grid(bb.collection.createArray(arrItem.length, function (index) {
            var itemView = new mc.ItemView(arrItem[index]);
            itemView.scale = 0.75;
            itemView.registerViewItemInfo();
            return itemView;
        }), 4, 480, -10);
        var scroll = new ccui.ScrollView();
        scroll.anchorX = scroll.anchorY = 0.5;
        scroll.addChild(gridLayout);
        scroll.width = root.width - 50;
        scroll.height = 460;
        gridLayout.x = scroll.width * 0.5;
        gridLayout.y = gridLayout.height * 0.5;
        if (gridLayout.height < scroll.height) {
            gridLayout.y = scroll.height - gridLayout.height + gridLayout.height * 0.5;
        }
        scroll.setInnerContainerSize(cc.size(gridLayout.width, gridLayout.height));
        nodeItems.addChild(scroll);

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    }

});

mc.LootItemListDialog = mc.RewardListDialog.extend({

    ctor: function (arrItem, cb, title, desc) {
        this._super(arrItem,  title || mc.dictionary.getGUIString("lblLoot"), desc ||  mc.dictionary.getGUIString("txtLootRewardList"));
        if (this._brk) {
            if( cb ){
                var btnGet = new ccui.ImageView("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
                this._brk.addChild(btnGet);
                btnGet.setPosition(this._brk.width / 2, -btnGet.height * 0.8);
                btnGet.setString(mc.dictionary.getGUIString("lblGet"), res.font_UTMBienvenue_stroke_32_export_fnt);
                btnGet.registerTouchEvent(function () {
                    this.close();
                    cb && cb();
                }.bind(this));
            }
        }

    }

});