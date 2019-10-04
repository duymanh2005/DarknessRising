/**
 * Created by long.nguyen on 6/19/2018.
 */
var MAX_DELTA_QUANTITY = 100;
mc.TransferRelicDialog = bb.Dialog.extend({

    ctor: function (userInfo) {
        this._super();

        var node = ccs.load(res.widget_transfer_relic_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var brkItem = rootMap["brkItem"];
        var btnClose = rootMap["btnClose"];
        var lblTitle = rootMap["lblTitle"];
        var lblMsg = rootMap["lblmsg"];
        var lblName = rootMap["lblName"];
        var lblQuantity= this.lblQuantity = rootMap["lblQuantity"];
        var lblQuantityNext = this.lblQuantityNext = rootMap["lblQuantityNext"];
        var lblTotal = rootMap["lblTotal"];
        var btnTransfer = rootMap["btnTransfer"];
        var lblSep = rootMap["lblSep"];
        var lblRemain = rootMap["lblRemain"];
        var lblSep_0 = rootMap["lblSep_0"];
        var lblRemainNum = rootMap["lblRemainNum"];
        var lblSep_1 = this.lblSep_1 = rootMap["lblSep_1"];
        var lblRequire = rootMap["lblRequire"];
        lblRequire.setColor(mc.color.RED_SOFT);
        lblRequire.setString(cc.formatStr(mc.dictionary.getGUIString("lblRequireNumLevel"),mc.const.REQUIRE_LEVEL_TRANSFER_RELIC));
        lblRequire.setVisible(false);
        if(!this.checkTransferAvailable())
        {
            lblRequire.setVisible(true);
        }

        var btnAdd = this.btnAdd = rootMap["btnAdd"];
        var btnSub = this.btnSub = rootMap["btnSub"];
        var lblQuantityTotal = this.lblQuantityTotal = rootMap["lblQuantityTotal"];
        btnAdd.setVisible(true);
        btnSub.setVisible(true);
        lblQuantityTotal.setVisible(false);

        var itemInfo = mc.ItemStock.createJsonItemInfo(this.getItemCode(), this.getItemQuantityPerPack());
        var itemView = new mc.ItemView(itemInfo);
        itemView.x = brkItem.width * 0.5;
        itemView.y = brkItem.height * 0.5;
        brkItem.addChild(itemView);

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblTotal.setColor(mc.color.BROWN_SOFT);
        lblMsg.setColor(mc.color.BROWN_SOFT);
        lblName.setColor(mc.color.RED_SOFT);
        lblRemain.setColor(mc.color.BROWN_SOFT);
        lblSep_0.setColor(mc.color.BROWN_SOFT);
        lblRemainNum.setColor(mc.color.BROWN_SOFT);
        lblSep.setColor(mc.color.BROWN_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblTransferRelicCoin"));
        lblTotal.setString(mc.dictionary.getGUIString("lblTransfer"));
        lblMsg.setString(mc.dictionary.getGUIString("lblTo"));
        lblRemain.setString(mc.dictionary.getGUIString("Remain"))
        var relicCoin = Math.floor(mc.GameData.playerInfo.getRelicCoin());
        if(relicCoin > 0)
        {
            lblRemainNum.setColor(mc.color.BROWN_SOFT);
        }
        else
        {
            lblRemainNum.setColor(mc.color.RED_SOFT);
        }
        lblRemainNum.setString(relicCoin);
        lblName.setString(userInfo["name"] || userInfo["gameHeroName"]);
        btnTransfer.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
        btnTransfer.setString(mc.dictionary.getGUIString("lblTransfer"));
        btnClose.setString(mc.dictionary.getGUIString("lblCancel"));
        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        this.multifly = this.getQuantityStep();
        var self = this;
        btnTransfer.registerTouchEvent(function () {
            //var isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_BLESS, currQuantity);
            //if (!isShow && self.getExchangeFunc()) {
            //    var loadingId = mc.view_utility.showLoadingDialog();
            //    mc.protocol.exchangeGameFunction(self.getExchangeFunc(), this.getSubmitVal(), function (result) {
            //        mc.view_utility.hideLoadingDialogById(loadingId);
            //        self.close();
            //    });
            //}
            new mc.ConfirmTransferDialog(userInfo,this.getItemCode(),this.multifly).show();
        }.bind(this));
        var updateUI = function (mul) {
            if(Math.floor(mc.GameData.playerInfo.getRelicCoin()) > 0)
            {
                var relicCoin = Math.floor(mc.GameData.playerInfo.getRelicCoin()) - mul;
                if(relicCoin > 0)
                {
                    lblRemainNum.setColor(mc.color.BROWN_SOFT);
                    this.setQuantityLbl(mul,Math.floor(mc.GameData.playerInfo.getRelicCoin()));
                }
                else
                {
                    lblRemainNum.setColor(mc.color.RED_SOFT);
                    this.setTotalBuyLbl(this.getUnitString(mul));
                }
                lblRemainNum.setString(relicCoin);
                btnTransfer.setGray(false);
            }
            else
            {
                lblRemainNum.setColor(mc.color.RED_SOFT);
                this.setTotalBuyLbl(this.getUnitString(0));
                lblRemainNum.setString(0);
                btnTransfer.setGray(true);

            }
            btnTransfer.setGray(!this.checkTransferAvailable());

        }.bind(this);

        this.traceDataChange(mc.GameData.assetChanger,function(){
            if(Math.floor(mc.GameData.playerInfo.getRelicCoin()) > 0)
            {
                if(Math.floor(mc.GameData.playerInfo.getRelicCoin()) < this.multifly)
                {
                    this.multifly = self.getQuantityStep();
                }
            }
            else
            {
                this.multifly = 0;
            }

            updateUI(this.multifly);
        }.bind(this));


        var deltaQuantity = 1;
        var _adjustQuantity = function (deltaQuantity) {
            this.multifly += deltaQuantity;
            if (this.multifly <= self.getQuantityStep()) {
                this.multifly = self.getQuantityStep();
            }
            var number = Math.max(Math.floor(mc.GameData.playerInfo.getRelicCoin()), self.getQuantityStep());
            if (this.multifly >= number) {
                this.multifly = number;
            }
            updateUI(this.multifly)
        }.bind(this);

        btnSub.registerTouchEvent(function () {
            _adjustQuantity(-self.getQuantityStep());
        }, function () {
            deltaQuantity += deltaQuantity;
            if(deltaQuantity > MAX_DELTA_QUANTITY)
            {
                deltaQuantity = MAX_DELTA_QUANTITY;
            }
            _adjustQuantity(-deltaQuantity);
        }, true, function () {
            deltaQuantity = self.getQuantityStep();
        });

        btnAdd.registerTouchEvent(function () {
            _adjustQuantity(self.getQuantityStep());
        }, function () {
            deltaQuantity += deltaQuantity;
            if(deltaQuantity > MAX_DELTA_QUANTITY)
            {
                deltaQuantity = MAX_DELTA_QUANTITY;
            }
            _adjustQuantity(deltaQuantity);
        }, true, function () {
            deltaQuantity = self.getQuantityStep();
        });
        updateUI(this.multifly);
        btnTransfer.setGray(!this.checkTransferAvailable());


    },


    getUnitString: function (mul) {
        return mul;
    },

    getItemQuantityPerPack: function () {
        return 1;
    },

    getQuantityStep: function () {
        return 1;
    },


    checkTransferAvailable: function () {
        return mc.GameData.playerInfo.getRelicCoin() > 0 && mc.GameData.playerInfo.getLevel() >= mc.const.REQUIRE_LEVEL_TRANSFER_RELIC;
    },
    getItemCode: function () {
        return mc.const.ITEM_INDEX_RELIC_COIN;
    },

    setTotalBuyLbl: function (string) {
        this.lblQuantity.setVisible(false);
        this.lblQuantityNext.setVisible(false);
        this.lblQuantityTotal.setVisible(true);
        this.lblSep_1.setVisible(false);
        this.lblQuantityTotal.setString(string);
    },

    setQuantityLbl: function (quantity1, quantity2) {
        this.lblQuantityTotal.setVisible(false);
        this.lblQuantity.setVisible(true);
        this.lblQuantityNext.setVisible(true);
        this.lblSep_1.setVisible(true);
        this.lblQuantity.setString(quantity2);
        this.lblQuantityNext.setString(quantity1);
        this.lblQuantityNext.setColor(mc.color.GREEN_NORMAL);
    }

});

