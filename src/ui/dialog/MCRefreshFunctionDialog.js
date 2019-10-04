/**
 * Created by long.nguyen on 6/29/2018.
 */
mc.RefreshFunctionDialog = mc.DefaultDialog.extend({

    ctor: function (funcCode, refreshName, refreshTicket, refreshPrice, callback) {
        this._super();
        var h1 = null;
        if (refreshTicket > 0) {
            var lblText = bb.framework.getGUIFactory().createText("lblDoYou");
            var lblTicket = bb.framework.getGUIFactory().createText("lbl1Ticket");
            lblTicket.setColor(mc.color.GREEN);
            h1 = bb.layout.linear([lblText, lblTicket], 5);
        }
        else {
            var lblText = this._lblText = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblDoYou"));
            var assetNode = mc.view_utility.createAssetView(refreshPrice);
            h1 = bb.layout.linear([lblText, assetNode], 15);

            if(mc.enableReplaceFontBM())
            {
                assetNode.y = h1.height * 0.8;
            }
            else{
                assetNode.y = h1.height * 0.625;
            }
        }
        var color = mc.color.YELLOW;
        var font = res.font_cam_stroke_32_export_fnt;
        if(mc.enableReplaceFontBM())
        {
            color = mc.color.YELLOW_ELEMENT;
        }


        if (funcCode === mc.const.EXCHANGE_FUNC_ZEN) {
            this._lblTo = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblExchangeZen"));
            this._lblTo.setDecoratorLabel(refreshName, color,font);
        } else if (funcCode === mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT) {
            this._lblTo = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblItemSlot"));
            this._lblTo.setDecoratorLabel(refreshName, color,font);
        } else if (funcCode === mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT) {
            this._lblTo = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblHeroSlot"));
            this._lblTo.setDecoratorLabel(refreshName, color,font);
        }
        else if (funcCode === mc.const.REFRESH_FUNCTION_BUY_VAULT_SLOT) {
            this._lblTo = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblVaultSlot"));
            this._lblTo.setDecoratorLabel(refreshName, color,font);
        }
        else if (funcCode === mc.const.EXCHANGE_FUNC_CHAOS_TICKET) {
            this._lblTo = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblBuyChaoTicket"));
            this._lblTo.setDecoratorLabel(refreshName, color,font);
        } else if (funcCode === mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET) {
            this._lblTo = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblBuyArenaTicket"));
            this._lblTo.setDecoratorLabel(refreshName, color,font);
        } else {
            this._lblTo = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("lblToRefresh"));
            this._lblTo.setDecoratorLabel(refreshName, color,font);
        }

        var h2 = this._h2 = bb.layout.linear([this._lblTo, h1], 5, bb.layout.LINEAR_VERTICAL);

        this.setTitle(mc.dictionary.getGUIString("lblInfo"));
        this.enableYesNoButton(function () {
            this.close();
            callback && callback();
        }.bind(this));
        var btn1 = this.getButton1();
        if (btn1) {
            btn1.loadTexture("button/Blue_Button.png", ccui.Widget.PLIST_TEXTURE);
        }
        this.setContentView(h2);
    },

    reCalculatePositionAndContentSize: function () {
        this._super();
        if(mc.enableReplaceFontBM())
        {
            if (this._lblText) {
                this._lblText.y += 22;
            }
            if (this._lblTo) {
                this._lblTo.x = this._h2.width * 0.5 - 80;
            }
            this._h2.y += 7;
        }
        else
        {
            if (this._lblText) {
                this._lblText.y += 22;
            }
            if (this._lblTo) {
                this._lblTo.x = this._h2.width * 0.5;
            }
            this._h2.y += 7;
        }

    }

});

mc.RefreshShopDialog = mc.RefreshFunctionDialog.extend({

    ctor: function (shopId, callback) {
        this._super(shopId, mc.ShopManager.getShopName(shopId),
            mc.GameData.shopManager.getShopRefreshTicketNo(shopId),
            mc.GameData.shopManager.getShopRefreshPrice(shopId),
            callback);
    }

});