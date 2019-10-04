/**
 * Created by long.nguyen on 6/8/2018.
 */
mc.MCItemsListDialogWithConfirm = bb.Dialog.extend({

    ctor: function (arrItem, title, desc, lblOk, cb) {
        this._super();

        var node = ccs.load(res.items_confirm_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var lblTitle = rootMap["lblTitle"];
        var lblDes = rootMap["lblDes"];
        var brkSlot = rootMap["brkSlot"];
        var nodeItems = rootMap["nodeItems"];
        var btnClose = rootMap["btnClose"];
        var btnOk = rootMap["btn_ok"];

        btnOk.setString(lblOk || "lblOk", res.font_UTMBienvenue_stroke_32_export_fnt);

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblDes.setColor(mc.color.BROWN_SOFT);
        lblTitle.setString(title || mc.dictionary.getGUIString("lblCongratulation"));
        lblDes.setString(desc || mc.dictionary.getGUIString("txtGetRewardList"));

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
            cb && cb(false);
        }.bind(this));
        btnOk.registerTouchEvent(function () {
            this.close();
            cb && cb(true);
        }.bind(this));
    }

});
