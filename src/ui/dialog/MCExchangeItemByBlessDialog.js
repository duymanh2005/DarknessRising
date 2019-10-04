/**
 * Created by long.nguyen on 4/2/2018.
 */
mc.ExchangeItemByBlessDialog = bb.Dialog.extend({

    ctor:function(itemInfo){
        this._super();

        var node = ccs.load(res.widget_selling_item,"res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var brkItem = rootMap["brkItem"];
        var btnClose = rootMap["btnClose"];
        var lblTitle = rootMap["lblTitle"];
        var btnBuy = rootMap["btnSell"];
        var icon = rootMap["icon"];
        var lblPrice = rootMap["lblPrice"];
        var btnMinus = rootMap["btnMinus"];
        var btnPlus = rootMap["btnPlus"];
        var lblQuantity = rootMap["lblQuantity"];

        var itemView = new mc.ItemView(itemInfo);
        itemView.x = brkItem.width*0.5;
        itemView.y = brkItem.height*0.5;
        brkItem.addChild(itemView);

        var itemBuyFeeInfo = mc.ItemStock.getItemBuyFee(itemInfo);
        var numBuyFee = mc.ItemStock.getItemQuantity(itemBuyFeeInfo);

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblBuy ") +mc.ItemStock.getItemName(itemInfo));
        btnBuy.loadTexture("button/Green_Round.png",ccui.Widget.PLIST_TEXTURE);
        icon.loadTexture("icon/bless.png",ccui.Widget.PLIST_TEXTURE);
        icon.ignoreContentAdaptWithSize(true);
        btnBuy.setString(mc.dictionary.getGUIString("lblBuy"));
        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        var maxBless = mc.GameData.playerInfo.getBless();
        var currQuantity = 1;
        var deltaQuantity = numBuyFee || 1;
        var refundCost = mc.ItemStock.getItemRefundCost(itemInfo);
        var _adjustQuantity = function(deltaQuantity){
            currQuantity += deltaQuantity;
            if( currQuantity <= 1 ){
                currQuantity = 1;
            }
            if( currQuantity >= maxBless ){
                currQuantity = maxBless;
            }
            lblQuantity.setString(""+bb.utility.formatNumber(currQuantity));
            lblPrice.setString(""+bb.utility.formatNumber(currQuantity*refundCost));
            itemView.getQuantityLabel().setString("x"+bb.utility.formatNumber(maxBless-currQuantity));
        };

        btnMinus.registerTouchEvent(function(){
            _adjustQuantity(-1);
        },function(){
            deltaQuantity += deltaQuantity;
            _adjustQuantity(-deltaQuantity);
        },true,function(){
            deltaQuantity = 1;
        });

        btnPlus.registerTouchEvent(function(){
            _adjustQuantity(1);
        },function(){
            deltaQuantity += deltaQuantity;
            _adjustQuantity(deltaQuantity);
        },true,function(){
            deltaQuantity = 1;
        });

        var self = this;
        btnBuy.registerTouchEvent(function(){
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.exchageItem(mc.ItemStock.getItemIndex(itemInfo),currQuantity,function(data){
                mc.view_utility.hideLoadingDialogById(loadingId);
            });
        }.bind(this));

        _adjustQuantity(0);
    }

});