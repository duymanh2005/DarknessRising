/**
 * Created by long.nguyen on 10/3/2017.
 */
mc.DialogReconnect = mc.DefaultDialog.extend({

    ctor:function(){
        this._super(mc.dictionary.getGUIString("lblWarning"));

        var reconnectDialogId = null;
        var loginDialogId = null;
        var self = this;
        this.setMessage(mc.dictionary.getGUIString("txtCheckInternetConnection"))
            .disableExitButton()
            .enableOkButton(function(){
                reconnectDialogId = mc.view_utility.showLoadingDialog(7);
                mc.protocol.startConnect();
            },mc.dictionary.getGUIString("lblReconnect"));

        var _showFail = function(fail){
            if( fail ){
                var msg = fail.msg;
                if( !msg ){
                    msg = "Code: "+fail.code;
                }
                cc.log(msg);
            }
            bb.framework.getGUIFactory().createWarningDialog(mc.dictionary.getGUIString("txtCannotReconnect")).enableOkButton(function(){
                cc.loader.releaseAll();
                cc.director.purgeCachedData();
                cc.game.restart();
            },mc.dictionary.getGUIString("lblRestart")).show();
        };

        this.traceDataChange(mc.GameData.connectionState,function(state){
            if( mc.GameData.connectionState.isOpen() ){
                mc.view_utility.hideLoadingDialogById(reconnectDialogId);
                loginDialogId = mc.view_utility.showLoadingDialog();
                var str = CreantsCocosAPI.getItem(creants_api.KEY_LOGIN_TOKEN);
                var tokenObj = null;
                if( str ){
                    tokenObj = JSON.parse(str);
                }
                if( tokenObj ){
                    var pickServer = mc.storage.readLoginServer();
                    mc.protocol.logInMUGame(tokenObj,pickServer["svn"]);
                }
            }
        });

        this.traceDataChange(mc.GameData.playerInfo,function(){
            mc.view_utility.hideLoadingDialogById(loginDialogId);
            if ( mc.GameData.playerInfo.isHaveMuAcc() ) {
                self.close();
            }
        });
        this.setAutoClose(false);
        this.setTopMost(true);
    },

    show:function(){
        this._super();
        mc.GameData.guiState.setReconnecting(true);
    },

    close:function(){
        this._super();
        mc.GameData.guiState.setReconnecting(false);
    }

});