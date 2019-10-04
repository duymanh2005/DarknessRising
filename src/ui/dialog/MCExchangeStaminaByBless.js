/**
 * Created by long.nguyen on 6/19/2018.
 */
mc.ExchangeByBlessDialog = bb.Dialog.extend({

    ctor: function () {
        this._super();

        var node = ccs.load(res.widget_refill_items_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var brkItem = rootMap["brkItem"];
        var btnClose = rootMap["btnSell"];
        var lblTitle = rootMap["lblTitle"];
        var lblMsg = rootMap["lblmsg"];
        var lblTotal = rootMap["lblTotal"];
        var lblCost = rootMap["lblCost"];
        var btnBuy = rootMap["btnExchange"];
        var icon = rootMap["icon"];
        var lblPrice = rootMap["lblPrice"];
        var lblQuantity = this.lblQuantity = rootMap["lblQuantity"];
        var btnAdd = this.btnAdd = rootMap["btnAdd"];
        var btnSub = this.btnSub = rootMap["btnSub"];
        var lblQuantityNext = this.lblQuantityNext = rootMap["lblQuantityNext"];
        var lblQuantityTotal = this.lblQuantityTotal = rootMap["lblQuantityTotalBuy"];
        lblQuantity.setVisible(false);
        btnAdd.setVisible(false);
        btnSub.setVisible(false);
        lblQuantityNext.setVisible(false);
        lblQuantityTotal.setVisible(false);

        var itemInfo = mc.ItemStock.createJsonItemInfo(this.getItemCode(), this.getItemQuantityPerPack());
        var itemView = new mc.ItemView(itemInfo);
        itemView.x = brkItem.width * 0.5;
        itemView.y = brkItem.height * 0.5;
        brkItem.addChild(itemView);

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblTotal.setColor(mc.color.BROWN_SOFT);
        lblMsg.setColor(mc.color.BROWN_SOFT);
        lblCost.setColor(mc.color.BROWN_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblBuy") + " " + mc.ItemStock.getItemName(itemInfo));
        lblTotal.setString(mc.dictionary.getGUIString("lblTotal"));
        lblCost.setString(mc.dictionary.getGUIString("lblCost"));
        lblMsg.setString(mc.dictionary.getGUIString("lblBuyMore") + " " + mc.ItemStock.getItemName(itemInfo));
        btnBuy.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
        icon.loadTexture("icon/bless.png", ccui.Widget.PLIST_TEXTURE);
        icon.ignoreContentAdaptWithSize(true);
        btnBuy.setString(mc.dictionary.getGUIString("lblBuy"));
        btnClose.setString(mc.dictionary.getGUIString("lblCancel"));
        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        this.multifly = this.getQuantityStep();
        var price = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionPriceByCode(this.getExchangeFunc());
        var currQuantity = this.cost1Pack = price["no"];
        lblPrice.setString("x " + (this.multifly * currQuantity));
        var self = this;
        btnBuy.registerTouchEvent(function () {
            var isShow = mc.view_utility.showExchangingIfAny(mc.const.ITEM_INDEX_BLESS, currQuantity);
            if (!isShow && self.getExchangeFunc()) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.exchangeGameFunction(self.getExchangeFunc(), this.getSubmitVal(), function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    self.close();
                });
            }
        }.bind(this));
        var updateUI = function (mul) {
            lblPrice.setString("x " + (currQuantity * mul));
            this.setTotalBuyLbl(this.getUnitString(mul));
        }.bind(this);

        var number = Math.max(Math.floor(mc.GameData.playerInfo.getBless() / price["no"]), self.getQuantityStep());
        var deltaQuantity = 1;
        var _adjustQuantity = function (deltaQuantity) {
            this.multifly += deltaQuantity;
            if (this.multifly <= self.getQuantityStep()) {
                this.multifly = self.getQuantityStep();
            }
            if (this.multifly >= number) {
                this.multifly = number;
            }
            updateUI(this.multifly)
        }.bind(this);

        btnSub.registerTouchEvent(function () {
            _adjustQuantity(-self.getQuantityStep());
        }, function () {
            deltaQuantity += deltaQuantity;
            _adjustQuantity(-deltaQuantity);
        }, true, function () {
            deltaQuantity = self.getQuantityStep();
        });

        btnAdd.registerTouchEvent(function () {
            _adjustQuantity(self.getQuantityStep());
        }, function () {
            deltaQuantity += deltaQuantity;
            _adjustQuantity(deltaQuantity);
        }, true, function () {
            deltaQuantity = self.getQuantityStep();
        });
        btnBuy.setGray(!this.checkBuyAvailable());

    },

    getSubmitVal: function () {
        return this.cost1Pack * this.multifly;
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


    checkBuyAvailable: function () {
        return mc.GameData.playerInfo.getStamina() < mc.GameData.playerInfo.getMaxStamina();
    },
    getExchangeFunc: function () {
        return mc.const.REFRESH_FUNCTION_BUY_STAMINA;
    },
    getItemCode: function () {
        return mc.const.ITEM_INDEX_STAMINA;
    },

    setTotalBuyLbl: function (string) {
        this.lblQuantityTotal.setVisible(true);
        this.lblQuantity.setVisible(false);
        this.lblQuantityNext.setVisible(false);
        this.lblQuantityTotal.setString(string);
    },

    setQuantityLbl: function (quantity1, quantity2) {
        this.lblQuantityTotal.setVisible(false);
        this.lblQuantity.setVisible(true);
        this.lblQuantityNext.setVisible(true);
        this.lblQuantity.setString(quantity2);
        this.lblQuantityNext.setString(quantity1);
        this.lblQuantityNext.setColor(mc.color.GREEN_NORMAL);
    }

});

mc.ExchangeStaminaByBlessDialog = mc.ExchangeByBlessDialog.extend({

    ctor: function () {
        this._super();
        this.setQuantityLbl((mc.GameData.playerInfo.getMaxStamina() + Math.floor(mc.GameData.playerInfo.getStamina())), "/" + mc.GameData.playerInfo.getMaxStamina())
    },
    checkBuyAvailable: function () {
        return mc.GameData.playerInfo.getStamina() < mc.GameData.playerInfo.getMaxStamina();
    },
    getExchangeFunc: function () {
        return mc.const.REFRESH_FUNCTION_BUY_STAMINA;
    },
    getItemCode: function () {
        return mc.const.ITEM_INDEX_STAMINA;
    },
    getItemQuantityPerPack: function () {
        return mc.GameData.playerInfo.getMaxStamina();
    }

});
mc.ExchangeArenaTicketByBlessDialog = mc.ExchangeByBlessDialog.extend({

    ctor: function () {
        this._super();
        this.setQuantityLbl((mc.const.MAX_ARENA_TICKET + Math.floor(mc.GameData.playerInfo.getArenaTicket())), "/" + mc.const.MAX_ARENA_TICKET)
    },
    checkBuyAvailable: function () {
        return mc.GameData.playerInfo.getArenaTicket() < mc.const.MAX_ARENA_TICKET;
    },
    getExchangeFunc: function () {
        return mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET;
    },
    getItemCode: function () {
        return mc.const.ITEM_INDEX_ARENA_TICKET;
    }
    ,
    getItemQuantityPerPack: function () {
        return mc.const.MAX_ARENA_TICKET;
    }

});

mc.ExchangeSpinTicketByBlessDialog = mc.ExchangeByBlessDialog.extend({

    ctor: function () {
        this._super();
        this.setTotalBuyLbl(this.getUnitString(this.multifly));
        this.btnAdd.setVisible(true);
        this.btnSub.setVisible(true);

    },
    getUnitString: function (mul) {
        return bb.utility.formatNumber(mul * 1, ',');
    },


    checkBuyAvailable: function () {
        return true;
    },

    getSubmitVal: function () {
        return this.multifly;
    },
    getExchangeFunc: function () {
        return mc.const.EXCHANGE_FUNCTION_BUY_SPIN_TICKET;
    },
    getItemCode: function () {
        return mc.const.ITEM_INDEX_SPIN_TICKET;
    }
    ,
    getItemQuantityPerPack: function () {
        return 1;
    },
    getQuantityStep: function () {
        return 5;
    }

});


mc.ExchangeZenByBlessDialog = mc.ExchangeByBlessDialog.extend({

    ctor: function () {
        this._super();
        this.setTotalBuyLbl(this.getUnitString(this.multifly));
        this.btnAdd.setVisible(true);
        this.btnSub.setVisible(true);
    },
    getUnitString: function (mul) {
        return bb.utility.formatNumber(mul * 255000, ',');
    },
    checkBuyAvailable: function () {
        return true;
    },
    getExchangeFunc: function () {
        return mc.const.EXCHANGE_FUNC_ZEN;
    },
    getItemCode: function () {
        return mc.const.ITEM_INDEX_ZEN;
    },

    getItemQuantityPerPack: function () {
        return 255000;
    }

});

mc.ExchangeByBlessDialog.showExchange = function (code) {
    var price = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionPriceByCode(code);
    if (!price) {
        var msg = "txtSuggestBuyRefreshFunctionMore";
        switch (code) {
            case mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT:
            case mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT:
                msg = "txtReachMaxSlot";
                break;
            default:
                msg = "txtSuggestBuyRefreshFunctionMore";
                break;
        }
        bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString(msg)).show();
    } else {
        switch (code) {
            case mc.const.EXCHANGE_FUNC_ZEN:
                new mc.ExchangeZenByBlessDialog().show();
                break;
            case mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET:
                new mc.ExchangeArenaTicketByBlessDialog().show();
                break;
            case mc.const.EXCHANGE_FUNCTION_BUY_SPIN_TICKET:
                new mc.ExchangeSpinTicketByBlessDialog().show();
                break;
            case mc.const.REFRESH_FUNCTION_BUY_STAMINA:
                new mc.ExchangeStaminaByBlessDialog().show();
                break;
        }
    }
};

