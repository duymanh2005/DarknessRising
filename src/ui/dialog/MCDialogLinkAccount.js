/**
 * Created by long.nguyen on 7/9/2018.
 */
mc.DialogLinkAccount = bb.Dialog.extend({

    ctor:function(){
        this._super();

        var node = ccs.load(res.widget_link_account_dialog,"res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var lblTitle = rootMap["lblTitle"];
        var lblDes = rootMap["lblDes"];
        var btnFb = rootMap["btnFb"];
        var btnProvider = rootMap["btnProvider"];
        var btnClose = rootMap["btnClose"];

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblDes.setColor(mc.color.BROWN_SOFT);

        lblTitle.setString(mc.dictionary.getGUIString("lblLinkAccount"));
        lblDes.setString(mc.dictionary.getGUIString("txtChoseAccountToLink"));

        btnFb.registerTouchEvent(function(){
            var loadingId = mc.view_utility.showLoadingDialog();
            bb.pluginBox.facebook.logOut();
            CreantsCocosAPI.requestFacebook(function (fbToken) {
                mc.protocol.linkAccountFB(fbToken, function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (result) {
                        if (result["code"] === 1006) {
                            cc.log("Have a account!");
                            bb.framework.getGUIFactory().createWarningDialog(mc.dictionary.getGUIString("txtLinkAccountFBExistError")).show();
                        }
                        else if (result["code"] === 1) {
                            loadingId = mc.view_utility.showLoadingDialog();
                            mc.protocol.rateGame(function(result){ // continue to get the reward!
                                mc.view_utility.hideLoadingDialogById(loadingId);
                                if( result ){
                                    bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("txtLinkAccountFBSuccessfully"),function(){
                                        loadingId = mc.view_utility.showLoadingDialog();
                                        mc.protocol.logOutMUGame(function (rs) {
                                            mc.view_utility.hideLoadingDialogById(loadingId);
                                            if (rs) {
                                                CreantsCocosAPI.clearToken();
                                                mc.GameData.guiState.setBackTrackLayerForMainScreen([]);
                                                new mc.LoginScreen().show();
                                            }
                                        });
                                    }).show();
                                }
                            });

                        }
                        else {
                            cc.log("Link Acc: " + result["code"]);
                        }
                    }
                });
            });

        }.bind(this));
        btnProvider.registerTouchEvent(function(){

        }.bind(this));

        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        btnProvider.setVisible(false);
        btnFb.x = root.width*0.5;
    }

}) ;