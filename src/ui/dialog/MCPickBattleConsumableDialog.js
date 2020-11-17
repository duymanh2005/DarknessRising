/**
 * Created by long.nguyen on 7/3/2018.
 */
mc.PickBattleConsumableDialog = bb.Dialog.extend({
    _mapSlotViewBySlotId:null,
    _mapConsumableViewById:null,

    ctor:function(battleView,callback){
        this._super();

        this._battleView = battleView;
        this._mapSlotViewBySlotId = {};
        this._mapConsumableViewById = {};

        var node = ccs.load(res.widget_pick_battle_consumable_dialog,"res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var lblTitle = rootMap["lblTitle"];
        var btnClose = rootMap["btnClose"];
        var lblDes = rootMap["lblDes"];
        var nodeSlots = rootMap["nodeSlots"];
        var btnOk = rootMap["btnOk"];
        var nodeItems = rootMap["nodeItems"];

        lblDes.setColor(mc.color.BROWN_SOFT);
        lblTitle.setColor(mc.color.BROWN_SOFT);
        btnOk.setString(mc.dictionary.getGUIString("lblOk"));
        lblDes.setString(mc.dictionary.getGUIString("lblPickItemDes"));
        lblTitle.setString(mc.dictionary.getGUIString("lblItemBag"));
        var self = this;

        var arrSlots = bb.collection.createArray(4,function(index){
            var slotView = new ccui.ImageView("button/Item_Panel.png",ccui.Widget.PLIST_TEXTURE);
            slotView.setUserData(index);
            self._mapSlotViewBySlotId[index] = slotView;
            slotView.registerTouchEvent(function(slotView){
                var slotId = slotView.getUserData();
                self._unpickItem(slotId);
            },function(slotView){
                var itemView = slotView.getChildByName("pickItem");
                if( itemView ){
                    var itemInfo = itemView.getUserData();
                    mc.createItemPopupDialog(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo),mc.ItemStock.getItemQuantity(itemInfo))).show();
                }
            });
            return slotView;
        });
        var layout = bb.layout.linear(arrSlots,20,bb.layout.LINEAR_HORIZONTAL,15);
        nodeSlots.addChild(layout);

        var arrConsumableInStock = mc.GameData.itemStock.getItemList(function(itemInfo){
            return mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_POTION;
        });
        cc.log("array consume item");
        cc.log(arrConsumableInStock);
        var arrConsumableInUsing = [];
        var mapConsumableInUsingById = {};
        var partInBattle = mc.GameData.playerInfo.getCurrentPartInBattle();
        for(var i = 0; i < arrConsumableInStock.length; i++ ){
            var consumableInUsing = bb.utility.cloneJSON(arrConsumableInStock[i]);
            var remainNo = mc.ItemStock.getItemQuantity(arrConsumableInStock[i]) - partInBattle.getQuantityUsedByItemId(mc.ItemStock.getItemId(arrConsumableInStock[i]));
            if( remainNo > 0 ){
                consumableInUsing.no = remainNo;
                arrConsumableInUsing.push(consumableInUsing);
                mapConsumableInUsingById[mc.ItemStock.getItemId(consumableInUsing)] = consumableInUsing;
            }
            else{
                arrConsumableInStock.splice(i,1);
            }
        }

        var scroll = new ccui.ScrollView();
        scroll.anchorX = scroll.anchorY = 0.5;
        var minView = 10;
        var numMax = Math.max(minView,(Math.round(arrConsumableInUsing.length/5)+1)*5) ;
        var layout = bb.layout.grid(bb.collection.createArray(numMax,function(index){
            var widget = null;
            if( index < arrConsumableInUsing.length ){
                var itemView = widget = new mc.ItemView(arrConsumableInUsing[index]);
                itemView.scale = 0.75;
                self._mapConsumableViewById[mc.ItemStock.getItemId(arrConsumableInUsing[index])] = itemView;
                itemView.registerTouchEvent(function(itemView){
                    var itemInfo = itemView.getUserData();
                    var pickingSlot = self._getPickingSlot(itemInfo);
                    if( !pickingSlot ){
                        self._pickItem(itemInfo);
                    }
                    else{
                        self._unpickItem(pickingSlot);
                    }
                },function(itemView){
                    var itemInfo = itemView.getUserData();
                    mc.createItemPopupDialog(mc.ItemStock.createJsonItemInfo(mc.ItemStock.getItemIndex(itemInfo),mc.ItemStock.getItemQuantity(itemInfo))).show();
                });
                return itemView;
            }
            widget = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
            widget.scale = 0.75;
            return widget;
        }),5,root.width-100,-1);
        scroll.addChild(layout);
        scroll.width = root.width -50;
        scroll.height = 280;
        layout.x = scroll.width*0.5;
        layout.y = layout.height*0.5;
        scroll.setInnerContainerSize(cc.size(layout.width,layout.height));
        nodeItems.addChild(scroll);

        var mapConsumableIdBySlotId = mc.GameData.itemStock.getMapConsumableIdBySlotId();
        for(var slotId in mapConsumableIdBySlotId ){
            var consumeId = mapConsumableIdBySlotId[slotId];
            mapConsumableInUsingById[consumeId] && self._pickItem(mapConsumableInUsingById[consumeId]);
        }

        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));
        btnOk.registerTouchEvent(function(){
            self.close();
            var isChange = self._isChange();
            if( isChange ){
                var curMapConsumableIdBySlot = this._getMapPickingConsumableIdBySlotId();
                mc.GameData.itemStock.setupConsumableSlots(curMapConsumableIdBySlot);
                callback && callback(true);
            }
        }.bind(this));
    },

    onEnter:function(){
        this._super();
        this._battleView.pauseAll();
    },

    onExit:function(){
        this._super();
        this._battleView.resumeAll();
    },

    _getMapPickingConsumableIdBySlotId:function(){
        var curMapConsumableBySlot = {};
        for(var slotId in this._mapSlotViewBySlotId ){
            var itemView = this._mapSlotViewBySlotId[slotId].getChildByName("pickItem");
            if( itemView ){
                curMapConsumableBySlot[slotId] = mc.ItemStock.getItemId(itemView.getUserData());
            }
        }
        return curMapConsumableBySlot;
    },

    _isChange:function(){
        var preMapConsumableIdBySlot = mc.GameData.itemStock.getMapConsumableIdBySlotId() || {};
        var curMapConsumableIdBySlot = this._getMapPickingConsumableIdBySlotId() || {};
        var isChange = false;
        for(var slotId = 0; slotId < 4; slotId++ ){
            var preConsumableId = preMapConsumableIdBySlot[slotId];
            var curConsumableId = curMapConsumableIdBySlot[slotId];
            if( preConsumableId && curConsumableId ){
                if( preConsumableId != curConsumableId){
                    isChange = true;
                    break;
                }
            }
            else if( !preConsumableId && !curConsumableId){
                isChange = false;
            }
            else{
                isChange = true;
                break;
            }
        }
        return isChange;
    },

    _getPickingSlot:function(itemInfo){
        var pickingSlot = null;
        for(var slotId in this._mapSlotViewBySlotId ){
            var slotView = this._mapSlotViewBySlotId[slotId];
            var itemView = slotView.getChildByName("pickItem");
            if( itemView && mc.ItemStock.getItemId(itemInfo) === mc.ItemStock.getItemId(itemView.getUserData()) ){
                pickingSlot = slotId;
                break;
            }
        }
        return pickingSlot;
    },

    _pickItem:function(itemInfo){
        for(var slotId in this._mapSlotViewBySlotId ){
            var slotView = this._mapSlotViewBySlotId[slotId];
            var itemView = slotView.getChildByName("pickItem");
            if( !itemView ){
                var itemView = new mc.ItemView(itemInfo);
                itemView.setName("pickItem");
                itemView.x = slotView.width*0.5;
                itemView.y = slotView.height*0.5;
                itemView.scale = 0.79;
                slotView.addChild(itemView);

                this._mapConsumableViewById[mc.ItemStock.getItemId(itemInfo)].setStatusText("Picked");
                break;
            }
        }
    },

    _unpickItem:function(slotId){
        var slotView = this._mapSlotViewBySlotId[slotId];
        var itemView = slotView.getChildByName("pickItem");
        if( itemView ){
            var itemId = mc.ItemStock.getItemId(itemView.getUserData());
            this._mapConsumableViewById[itemId].setStatusText("");
            itemView.removeFromParent();
        }
    }

});