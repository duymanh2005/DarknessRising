/**
 * Created by long.nguyen on 12/6/2017.
 */
mc.SellingItemDialog = bb.Dialog.extend({

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
        var btnSell = rootMap["btnSell"];
        var icon = rootMap["icon"];
        var lblPrice = rootMap["lblPrice"];
        var btnMinus = rootMap["btnMinus"];
        var btnPlus = rootMap["btnPlus"];
        var lblQuantity = rootMap["lblQuantity"];

        var itemView = new mc.ItemView(itemInfo);
        itemView.x = brkItem.width*0.5;
        itemView.y = brkItem.height*0.5;
        brkItem.addChild(itemView);

        lblTitle.setColor(mc.color.BROWN_SOFT);
        btnSell.setString(mc.dictionary.getGUIString("lblSell"));
        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        var maxQuantity = mc.ItemStock.getItemQuantity(itemInfo);
        var currQuantity = 1;
        var deltaQuantity = 1;
        var arrRefundCostInfo = mc.ItemStock.getItemRefundCost(itemInfo);
        var lastRefundCostInfo = arrRefundCostInfo[arrRefundCostInfo.length-1];
        var refundCost = mc.ItemStock.getItemQuantity(lastRefundCostInfo);
        var refundIcon = mc.ItemStock.getItemRes(lastRefundCostInfo);
        var _adjustQuantity = function(deltaQuantity){
            currQuantity += deltaQuantity;
            if( currQuantity <= 1 ){
                currQuantity = 1;
            }
            if( currQuantity >= maxQuantity ){
                currQuantity = maxQuantity;
            }
            lblQuantity.setString(""+bb.utility.formatNumber(currQuantity));
            lblPrice.setString(""+bb.utility.formatNumber(currQuantity*refundCost));
            itemView.getQuantityLabel().setString("x"+bb.utility.formatNumber(maxQuantity-currQuantity));
            if( mc.ItemStock.getItemIndex(lastRefundCostInfo) != mc.const.ITEM_INDEX_ZEN ){
                icon.scale = 0.8;
                icon.ignoreContentAdaptWithSize(true);
                icon.loadTexture(refundIcon,ccui.Widget.LOCAL_TEXTURE);
            }
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
        btnSell.registerTouchEvent(function(){
            var loadingId = mc.view_utility.showLoadingDialog();
            bb.sound.playEffect(res.sound_ui_button_exchange_item);
            mc.protocol.sellItem(mc.ItemStock.getItemId(itemInfo),currQuantity,function(rs){
                mc.view_utility.hideLoadingDialogById(loadingId);
                if( rs ){
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtSellItemSuccessfully"));
                    self.close();
                }
            }.bind(this));
        }.bind(this));

        _adjustQuantity(0);
    }

});