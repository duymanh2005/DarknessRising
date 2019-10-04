/**
 * Created by long.nguyen on 7/9/2018.
 */
mc.ChangeAvatarDialog = bb.Dialog.extend({

    ctor:function(callback){
        this._super();

        var node = ccs.load(res.widget_reward_dialog,"res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var lblTitle = rootMap["lblTitle"];
        var lblDes = rootMap["lblDes"];
        var brkSlot = rootMap["brkSlot"];
        var nodeItems = rootMap["nodeItems"];
        var btnClose = rootMap["btnClose"];

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblDes.setColor(mc.color.BROWN_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblChangeAvatar"));
        lblDes.setString(mc.dictionary.getGUIString("txtPickUrFavouriteAvatar"));

        var self = this;
        var gridLayout = bb.layout.grid(bb.collection.createArray(mc.const.MAX_PLAYER_AVATAR,function(index){
            var avtView = mc.view_utility.createAvatarPlayer(index);
            avtView.setUserData(index);
            avtView.registerTouchEvent(function(avtView){
                var index = avtView.getUserData();
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.changePlayerProfile(undefined,index,function(result){
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if( result ){
                        self.close();
                        callback && callback();
                    }
                });
            });
            avtView.setSwallowTouches(false);
            return avtView;
        }),4,480,2);
        var scroll = new ccui.ScrollView();
        scroll.anchorX = scroll.anchorY = 0.5;
        scroll.addChild(gridLayout);
        scroll.width = root.width -50;
        scroll.height = 460;
        gridLayout.x = scroll.width*0.5;
        gridLayout.y = gridLayout.height*0.5;
        if( gridLayout.height < scroll.height ){
            gridLayout.y = scroll.height - gridLayout.height + gridLayout.height*0.5;
        }
        scroll.setInnerContainerSize(cc.size(gridLayout.width,gridLayout.height));
        nodeItems.addChild(scroll);

        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));

    }

});