/**
 * Created by long.nguyen on 4/4/2018.
 */
mc.RequestFriendDialog = mc.DefaultDialogType2.extend({

    ctor:function(friendInfo){
        this._super(mc.dictionary.getGUIString("lblFriendRequest"));

        var lblName = new cc.LabelTTF(mc.FriendManager.getFriendName(friendInfo),'Arial', 32, cc.size(320,32), cc.TEXT_ALIGNMENT_CENTER);
        lblName.setColor(mc.color.GREEN_NORMAL);
        var txtFriendRequest = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtDoUWantMakeFriendWith"));
        var avatar = mc.view_utility.createAvatarPlayer(mc.FriendManager.getFriendAvatarIndex(friendInfo),mc.FriendManager.getFriendVIP(friendInfo));

        var layout = bb.layout.linear([lblName,txtFriendRequest,avatar],10,bb.layout.LINEAR_VERTICAL);

        this.setContentView(layout,{
            left : 30,
            right: 30
        });

        lblName.x = layout.width*0.5;
        txtFriendRequest.x = layout.width*0.5;
        avatar.x = layout.width*0.5;

        this.enableYesNoButton(function(){
            var friendManager = mc.GameData.friendManager;
            if (friendManager && friendManager.getArrayFriendInfo() && friendManager.getArrayFriendInfo().length >= mc.const.MAX_FRIEND) {

                var dialog = new mc.DefaultDialog()
                    .setTitle(mc.dictionary.getGUIString("lblWarning"))
                    .setMessage(mc.dictionary.getExceptionString("lblMaxFriend"))
                    .enableOkButton(function () {
                        dialog.close();
                        closeFunc();
                    }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                dialog.show();

            }
            else
            {

                _performAddFriend = function()
                {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.requestAddFriend(mc.FriendManager.getFriendId(friendInfo),function(result){
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if( result ){
                            mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtYourRequestSent"));
                            this.close();
                        }
                    }.bind(this));
                }.bind(this);
                mc.storage.readAddFriendTouched();
                if(!mc.storage.addFriendTouched)
                {
                    mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblInfo"),mc.dictionary.getGUIString("lblAddFriendInfo"),function(){
                        _performAddFriend();
                        mc.storage.addFriendTouched = true;
                        mc.storage.saveAddFriendTouched();
                    }.bind(this));
                }
                else
                {
                    _performAddFriend();
                }
            }
        }.bind(this));
    }

});