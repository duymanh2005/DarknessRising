/**
 * Created by long.nguyen on 6/19/2018.
 */
mc.ConfirmTransferDialog = bb.Dialog.extend({

    ctor: function (userInfo, itemIndex, number, callback) {
        this._super();

        var node = ccs.load(res.widget_confirm_transfer_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var lblTitle = rootMap["lblTitle"];
        var lblContent = rootMap["lblContent"];
        var lblMsg = rootMap["lblmsg"];
        var lblName = rootMap["lblName"];
        var btnOk = rootMap["btnOk"];
        var btnCancel = rootMap["btnCancel"];
        var lblSep = rootMap["lblSep"];
        //var lblNum = rootMap["lblNum"];
        //var lblX = rootMap["lblX"];


        var itemInfo = mc.ItemStock.createJsonItemInfo(itemIndex);
        var itemView = new mc.ItemView(itemInfo);
        root.addChild(itemView);
        itemView.scale = 0.4;

        itemView.y = lblContent.y;
        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblContent.setColor(mc.color.BROWN_SOFT);
        lblMsg.setColor(mc.color.BROWN_SOFT);
        lblName.setColor(mc.color.RED_SOFT);
        lblSep.setColor(mc.color.BROWN_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblTransactionConfirm"));

        lblMsg.setString(mc.dictionary.getGUIString("lblTo"));
        //lblNum.setString(number);
        //lblNum.setColor(mc.color.RED);
        //lblX.setString("x");
        //lblX.setColor(mc.color.RED);
        lblName.setString(userInfo["name"]);
        var txtTransfer = mc.dictionary.getGUIString("txtYouTransferRelicCoin");
        lblContent.setString(txtTransfer + " " + number);
        //var txtTransferWidth = (lblContent.fontSize / 1.621) * txtTransfer.length;
        itemView.x = lblContent.x + 40;

        btnOk.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
        btnOk.setString(mc.dictionary.getGUIString("lblOk"));
        btnCancel.setString(mc.dictionary.getGUIString("lblCancel"));
        var self = this;
        btnOk.registerTouchEvent(function () {
            //var isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_BLESS, currQuantity);
            //if (!isShow && self.getExchangeFunc()) {
            //    var loadingId = mc.view_utility.showLoadingDialog();
            //    mc.protocol.exchangeGameFunction(self.getExchangeFunc(), this.getSubmitVal(), function (result) {
            //        mc.view_utility.hideLoadingDialogById(loadingId);
            //        self.close();
            //    });
            //}
            this._loadingId = mc.view_utility.showLoadingDialog(5, function () {
                mc.GameData.assetChanger.notifyDataChanged();
                this.unsuccess = true;
            }.bind(this));
            mc.protocol.transferRelic(userInfo["gameHeroId"], number);
        }.bind(this));
        btnCancel.registerTouchEvent(function () {
            self.close();
        }.bind(this));

        this.traceDataChange(mc.GameData.assetChanger, function () {
            if (this._loadingId) {
                mc.view_utility.hideLoadingDialogById(this._loadingId);
                self.close();
                this._bindResult(!this.unsuccess);
            }
        }.bind(this));

    },

    _bindResult: function (result) {
        var msg = "";
        if (result) {
            msg = mc.dictionary.getGUIString("Transaction is successful");
        }
        else {
            msg = mc.dictionary.getGUIString("Transaction is fail");
        }
        var dialog = new mc.DefaultDialog()
            .setTitle(mc.dictionary.getGUIString("lblInfo"))
            .setMessage(msg)
            .enableOkButton(function () {
                dialog.close();
            }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
        dialog.show();
    }

});

