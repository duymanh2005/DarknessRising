/**
 * Created by long.nguyen on 10/24/2017.
 */
mc.ReceiveItemDialog = bb.Dialog.extend({

    ctor:function(arrNewItem){
        this._super();
        if( arrNewItem ){
            arrNewItem = bb.utility.mapToArray(mc.ItemStock.groupItem(arrNewItem));
        }
        this._arrNewItem =  arrNewItem || [
            mc.ItemStock.createJsonItemZen(-99999),mc.ItemStock.createJsonItemZen(-99999),mc.ItemStock.createJsonItemZen(-99999),
            mc.ItemStock.createJsonItemZen(-99999),mc.ItemStock.createJsonItemZen(-99999),mc.ItemStock.createJsonItemZen(-99999)
        ];
        this.setAutoClose(false);
    },

    _showReward:function(itemInfo){
        if( itemInfo ){
            var self = this;
            var treasureBox = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json,res.spine_ui_chest_atlas, 1.0);
            treasureBox.scale = 1.5;
            if( mc.ItemStock.getItemRank(itemInfo) <= 3 ){
                treasureBox.setSkin("chest_bronze_blue");
            }
            else if( mc.ItemStock.getItemRank(itemInfo) <= 4 ){
                treasureBox.setSkin("chest_bronze_green");
            }
            else if( mc.ItemStock.getItemRank(itemInfo) <= 5 ){
                treasureBox.setSkin("chest_bronze_red");
            }
            else{
                treasureBox.setSkin("chest_platinum");
            }
            treasureBox.x = cc.winSize.width*0.5;
            treasureBox.y = cc.winSize.height*0.45;
            treasureBox.setAnimation(0,"drop",false);
            treasureBox.runAction(cc.sequence([cc.delayTime(1.0),cc.callFunc(function(){
                mc.ReceiveItemDialog.openTreasureBox(treasureBox,this,this._arrNewItem);
            }.bind(this)),cc.delayTime(1.5),cc.removeSelf()]));
            this.addChild(treasureBox);
        }

        this.scheduleOnce(function(){
            this.close();
        }.bind(this),3.0);
    },

    onShow:function(){
        this._showReward(this._arrNewItem[0]);
    }

});
mc.ReceiveItemDialog.openTreasureBox = function(treasureBox,layer,arrItem){
    if( arrItem && arrItem.length > 0 ){
        treasureBox.setAnimation(1111,"open_special",false);
        treasureBox.runAction(cc.sequence([cc.delayTime(0.75),cc.callFunc(function(){
            mc.view_utility.showNewComingItem(arrItem);
        })]));
    }
};