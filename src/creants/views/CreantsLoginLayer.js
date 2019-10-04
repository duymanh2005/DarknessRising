/**
 * Created by longnguyen on 6/6/2016.
 */
var kgamble = {};
kgamble.scaleRatio = 1.0;
kgamble.registerTouchListener = function(widget,callback){
    widget.registerTouchEvent(callback);
};
var CreantsLoginLayer = bb.Screen.extend({
    TEXTFIELD_WIDTH:432,
    TEXTFIELD_HEIGHT:56,

    onScreenShow:function(){
        cc.spriteFrameCache.addSpriteFrames(res.gui_plist);

        var nodeLogin = ccs.load(res.screen_login_json,"res/").node;
        this.addChild(nodeLogin);

        var root = nodeLogin.getChildByName("root");
        root.scale = kgamble.scaleRatio;
        root.x = cc.winSize.width*0.5;
        root.y *= kgamble.scaleRatio;

        this._initLoginPanel(root);
        this._initRegisterPanel(root);

        //var userInfo = bobo.readObject(kgamble.const.RECORD_LOGIN_INFO);
        //var loginName = null;
        //if (userInfo) {
        //    loginName = userInfo.login_name;
        //}
        this._showLoginPanel("");

        this.traceDataChange(mc.GameData.playerInfo,function(data){
            if( data ){
                new mc.MainScreen().show();
            }
        });
    },

    //onEnterTransitionDidFinish:function(){
    //    this.panelLogin.isVisible() && this._setLoginEditBoxEnable(true);
    //    this.panelRegister.isVisible() && this._setRegisterEditBoxEnable(true);
    //},
    //
    //onExit:function(){
    //    this.panelLogin.isVisible() && this._setLoginEditBoxEnable(false);
    //    this.panelRegister.isVisible() && this._setRegisterEditBoxEnable(false);
    //},

    _createEditBox:function(inputMode,inputFlag,placeHolder,panelOwner,nodeOwner){
        var bgr = new cc.Scale9Sprite("gui/textBoxBG.png");
        var editBox = new cc.EditBox(cc.size(this.TEXTFIELD_WIDTH-16,this.TEXTFIELD_HEIGHT),
                                     bgr,null,null);
        editBox.scale = kgamble.scaleRatio;
        editBox.setFontSize(26);
        editBox.setPlaceholderFontSize(26);
        editBox.setMaxLength(30);
        (inputMode!=null) && editBox.setInputMode(inputMode);
        (inputFlag!=null) && editBox.setInputFlag(inputFlag);
        (placeHolder!=null) && editBox.setPlaceHolder(placeHolder);
        editBox.setReturnType(cc.KEYBOARD_RETURNTYPE_SEND);
        editBox.setDelegate({
            editBoxTextChanged:function(editBox,text){
            },
            editBoxReturn:function(editBox){
            },
            editBoxEditingDidBegin:function(editBox){
            },
            editBoxEditingDidEnd:function(editBox){
            }
        });
        this.addChild(editBox);
        var p = panelOwner.convertToWorldSpace(nodeOwner);
        editBox.setPosition(p.x, p.y);
        bgr.setVisible(false);
        return editBox;
    },

    _cloneFakeEditBox:function(node){
        var spr = new cc.Scale9Sprite("gui/textBoxBG.png");
        spr.width = this.TEXTFIELD_WIDTH;
        spr.height = this.TEXTFIELD_HEIGHT;
        spr.x = node.x;
        spr.y = node.y;
        return spr;
    },

    _setLoginEditBoxEnable:function(isEnable){
        var panelLogin = this.panelLogin
        var nodePlayerNameOfLogin = this.nodePlayerNameOfLogin;
        var nodePasswordOfLogin = this.nodePasswordOfLogin;
        var editPlayerName = null;
        var editPassword = null;
        if( isEnable ){
            if( !this.editLoginName ){
                editPlayerName = this.editLoginName = this._createEditBox(cc.EDITBOX_INPUT_MODE_SINGLELINE,cc.EDITBOX_INPUT_FLAG_SENSITIVE,"Your Account",
                                                                           panelLogin,nodePlayerNameOfLogin);
            }

            if( !this.editLoginPassword ){
                var editPassword = this.editLoginPassword = this._createEditBox(cc.EDITBOX_INPUT_MODE_SINGLELINE,cc.EDITBOX_INPUT_FLAG_PASSWORD,"Your Password",
                                                                                panelLogin,nodePasswordOfLogin);
            }
        }
        if( !this.sprLoginName ){
            this.sprLoginName = this._cloneFakeEditBox(nodePlayerNameOfLogin);
            panelLogin.addChild(this.sprLoginName);
        }

        if( !this.sprLoginPassword){
            this.sprLoginPassword = this._cloneFakeEditBox(nodePasswordOfLogin);
            panelLogin.addChild(this.sprLoginPassword);
        }

        this.editLoginName && this.editLoginName.setVisible(isEnable);
        this.editLoginPassword && this.editLoginPassword.setVisible(isEnable);
        this.sprLoginName && this.sprLoginName.setVisible(true);
        this.sprLoginPassword && this.sprLoginPassword.setVisible(true);

    },

    _setRegisterEditBoxEnable:function(isEnable){
        var panelRegister = this.panelRegister;
        var nodePlayerNameOfRegister = this.nodePlayerNameOfRegister;
        var nodePasswordOfRegister = this.nodePasswordOfRegister;
        var nodeRePasswordOfRegister = this.nodeRePasswordOfRegister;
        var nodeEmail = this.nodePlayerEmail;

        var editPlayerName = null;
        var editPassword = null;
        var editRePassword = null;
        var editEmail = null;
        if( isEnable ){
            if( !this.editRegisterName){
                editPlayerName = this.editRegisterName = this._createEditBox(cc.EDITBOX_INPUT_MODE_SINGLELINE,cc.EDITBOX_INPUT_FLAG_SENSITIVE,"Your Account",
                    panelRegister,nodePlayerNameOfRegister);
            }

            if( !this.editRegisterPassword){
                editPassword = this.editRegisterPassword = this._createEditBox(cc.EDITBOX_INPUT_MODE_SINGLELINE,cc.EDITBOX_INPUT_FLAG_PASSWORD,"Your Password",
                    panelRegister,nodePasswordOfRegister);
            }

            if( !this.editRegisterRePassword){
                editRePassword = this.editRegisterRePassword = this._createEditBox(cc.EDITBOX_INPUT_MODE_SINGLELINE,cc.EDITBOX_INPUT_FLAG_PASSWORD,"Your Password Again",
                    panelRegister,nodeRePasswordOfRegister);
            }

            if( !this.editRegisterEmail ){
                editEmail = this.editRegisterEmail = this._createEditBox(cc.EDITBOX_INPUT_MODE_EMAILADDR | cc.EDITBOX_INPUT_MODE_SINGLELINE,cc.EDITBOX_INPUT_FLAG_SENSITIVE,"Your Email",
                    panelRegister,nodeEmail);
                editEmail.setInputMode(cc.EDITBOX_INPUT_MODE_EMAILADDR);
            }
        }
        if( !this.sprRegisterName ){
            this.sprRegisterName = this._cloneFakeEditBox(nodePlayerNameOfRegister);
            panelRegister.addChild(this.sprRegisterName);
        }

        if( !this.sprRegisterPassword ){
            this.sprRegisterPassword = this._cloneFakeEditBox(nodePasswordOfRegister);
            panelRegister.addChild(this.sprRegisterPassword);
        }

        if( !this.sprRegisterRePassword ){
            this.sprRegisterRePassword = this._cloneFakeEditBox(nodeRePasswordOfRegister);
            panelRegister.addChild(this.sprRegisterRePassword);
        }

        if( !this.sprRegisterEmail ){
            this.sprRegisterEmail = this._cloneFakeEditBox(nodeEmail);
            panelRegister.addChild(this.sprRegisterEmail);
        }
        this.editRegisterName && this.editRegisterName.setVisible(isEnable);
        this.editRegisterPassword && this.editRegisterPassword.setVisible(isEnable);
        this.editRegisterRePassword && this.editRegisterRePassword.setVisible(isEnable);
        this.editRegisterEmail && this.editRegisterEmail.setVisible(isEnable);
        this.sprRegisterName && this.sprRegisterName.setVisible(true);
        this.sprRegisterPassword && this.sprRegisterPassword.setVisible(true);
        this.sprRegisterRePassword && this.sprRegisterRePassword.setVisible(true);
        this.sprRegisterEmail && this.sprRegisterEmail.setVisible(true);
    },

    _initLoginPanel:function(root){
        var panelLogin = this.panelLogin = root.getChildByName("panelLogin");
        var panelLoginMapper = bobo.utility.widget.getChildMapper(panelLogin);
        var nodePlayerName = this.nodePlayerNameOfLogin = panelLoginMapper["inputPlayerName"];
        var nodePassword = this.nodePasswordOfLogin = panelLoginMapper["inputPlayerPassword"];
        var btnLogin = panelLoginMapper["btnLogin"];
        var btnLoginByFB = panelLoginMapper["btnLoginByFB"];
        var lblRegister = panelLoginMapper["lblRegister"];
        var lblForgetPassword = panelLoginMapper["lblForgetPassword"];

        lblRegister = bobo.utility.widget.setWidgetText(lblRegister,"Register now");
        bobo.utility.widget.setWidgetText(lblForgetPassword,"Forget Password");
        bobo.utility.widget.setWidgetText(btnLogin,"Login");
        bobo.utility.widget.setWidgetText(btnLoginByFB,"Login By Facebook");

        this._setLoginEditBoxEnable(true);

        kgamble.registerTouchListener(btnLogin,function(){
            var playerName = this.editLoginName.getString();
            var password = this.editLoginPassword.getString();
            if( playerName && password){
                var dialog = bb.framework.getGUIFactory().createLoadingDialog().show();
                CreantsCocosAPI.signInByCreants(playerName,password,function(result){
                    dialog.close();
                    if( result ){
                        mc.protocol.logInMUGame(result);
                    }
                    else{

                    }
                }.bind(this));
                //var loadingDialog = new kgamble.DialogVNPokerLoading();
                //loadingDialog.show();
                //ServiceFacade.getService(kgamble.const.SERVICE_LOGIN).loginCREANT(playerName.toLowerCase(), password,
                //    function(token){
                //        loadingDialog.hide();
                //        if( token ){
                //            cc.director.runScene(new kgamble.SceneVNPokerHome());
                //        }
                //        else{
                //            kgamble.GUIFactory.createNoticeDialog(bobo.language.txt_wrong_username_or_password).show()
                //        }
                //    });
            }
        }.bind(this),this);

        kgamble.registerTouchListener(btnLoginByFB,function(){
           var dialog = bb.framework.getGUIFactory().createLoadingDialog().show();
           CreantsCocosAPI.signInByFaceBook(function(result,fail){
               dialog.close();
               if( result ){
                   mc.protocol.logInMUGame(result);
               }
           });
        }.bind(this),this);

        var layout = new ccui.Layout();
        layout.x = lblRegister.x;
        layout.y = lblRegister.y;
        layout.width = lblRegister.width;
        layout.height = lblRegister.height;
        layout.anchorX = lblRegister.anchorX;
        layout.anchorY = lblRegister.anchorY;
        panelLogin.addChild(layout);
        kgamble.registerTouchListener(layout,function(){
            this._showRegisterPanel(this.editLoginName.getString(),"","");
        }.bind(this),this);

    },

    _accept_register_legacy:function(isAccept){
        this._registerIconCheck.setVisible(isAccept)
        this._registerIconUnCheck.setVisible(!isAccept);
        this._btnRegister.setVisible(isAccept);
    },

    _initRegisterPanel:function(root){
        var panelRegister = this.panelRegister = root.getChildByName("panelRegister");
        var panelRegisterMapper = bobo.utility.widget.getChildMapper(panelRegister);
        var nodePlayerName = this.nodePlayerNameOfRegister = panelRegisterMapper["inputPlayerName"];
        var nodePassword = this.nodePasswordOfRegister = panelRegisterMapper["inputPlayerPassword"];
        var nodeRePassword = this.nodeRePasswordOfRegister = panelRegisterMapper["inputPlayerRePassword"];
        var nodeEmail = this.nodePlayerEmail = panelRegisterMapper["inputPlayerEmail"];
        var btnRegister = this._btnRegister = panelRegisterMapper["btnRegister"];
        var lblLienceInfo = panelRegisterMapper["lblLienceInfo"];
        var lblCancelRegister = panelRegisterMapper["lblCancelRegister"];
        var iconUncheck = this._registerIconUnCheck = panelRegisterMapper["iconUncheck"];
        var iconCheck = this._registerIconCheck = panelRegisterMapper["iconCheck"];

        bobo.utility.widget.setWidgetText(btnRegister,"Register Account");
        bobo.utility.widget.setWidgetText(lblLienceInfo,"Agree Licences");
        bobo.utility.widget.setWidgetText(lblCancelRegister,"Cancel Register");

        this._setRegisterEditBoxEnable(true);

        var panelLicenceInfo = new ccui.Layout();
        panelLicenceInfo.anchorY = 0.5;
        panelLicenceInfo.setContentSize(cc.size(lblLienceInfo.width,lblLienceInfo.height*2));
        panelLicenceInfo.setPosition(lblLienceInfo.getPosition());
        panelRegister.addChild(panelLicenceInfo);

        kgamble.registerTouchListener(panelLicenceInfo,function(){
            kgamble.GUIFactory.createNoticeDialog(bobo.language.txt_policy_contents).show();
        }.bind(this));
        kgamble.registerTouchListener(btnRegister,function(){
            var playerName = this.editRegisterName.getString();
            var password = this.editRegisterPassword.getString();
            var rePassword = this.editRegisterRePassword.getString();
            var email = this.editRegisterEmail.getString();
            if( playerName && password && rePassword &&
                this._checkSamePassword(password,rePassword)){
                var loadingDialog = new kgamble.DialogVNPokerLoading();
                loadingDialog.show();
                ServiceFacade.getService(kgamble.const.SERVICE_LOGIN).registerCREANT_Account(playerName,password,rePassword,
                    function(obj){
                    loadingDialog.hide();
                    if( obj != null ){
                        if( obj.code >= NetworkConstant.CODE_REGISTER_CREANT_ACCOUNT_FAIL ){
                            kgamble.GUIFactory.createNoticeDialog(obj.msg).show();
                        }
                        else if( obj.code === NetworkConstant.CODE_REGISTER_CREANT_ACCOUNT_SUCCESS) {
                            this._showLoginPanel(playerName,password);
                            kgamble.GUIFactory.createNoticeDialog(bobo.language.txt_register_account_success).show();
                        }
                    }
                }.bind(this));
            }
        }.bind(this),this);

        kgamble.registerTouchListener(iconCheck,function(){
            this._accept_register_legacy(false);
        }.bind(this));
        kgamble.registerTouchListener(iconUncheck,function(){
            kgamble.GUIFactory.createNoticeDialog(bobo.language.txt_policy_contents).show();
            this._accept_register_legacy(true);
        }.bind(this));

        var layout = new ccui.Layout();
        layout.x = lblCancelRegister.x;
        layout.y = lblCancelRegister.y;
        layout.width = lblCancelRegister.width;
        layout.height = lblCancelRegister.height;
        layout.anchorX = lblCancelRegister.anchorX;
        layout.anchorY = lblCancelRegister.anchorY;
        panelRegister.addChild(layout);
        kgamble.registerTouchListener(layout,function(){
            this._showLoginPanel();
        }.bind(this),this);

    },

    _checkEmptyText:function(strContent,strWarning){
        if( !strContent ){

            return true;
        }
        return false;
    },

    _checkSamePassword:function(password,repassword){
        if( password != repassword ){
            kgamble.GUIFactory.createNoticeDialog(bobo.language.txt_not_same_password).show();
            return false;
        }
        return true;
    },

    _showRegisterPanel:function(username,password,repassword){
        this.panelLogin.setVisible(false);
        this.panelRegister.setVisible(true);
        this.editLoginName.setVisible(false);
        this.editLoginPassword.setVisible(false);
        this.editRegisterName.setVisible(true);
        this.editRegisterPassword.setVisible(true);
        this.editRegisterRePassword.setVisible(true);
        this.editRegisterEmail.setVisible(true);
        this._accept_register_legacy(false);

        username!=undefined && this.editRegisterName.setString(username);
        password!=undefined && this.editRegisterPassword.setString(password);
        repassword!=undefined && this.editRegisterRePassword.setString(repassword);
    },

    _showLoginPanel:function(username,password){
        this.panelLogin.setVisible(true);
        this.panelRegister.setVisible(false);
        this.editLoginName.setVisible(true);
        this.editLoginPassword.setVisible(true);
        this.editRegisterName.setVisible(false);
        this.editRegisterPassword.setVisible(false);
        this.editRegisterRePassword.setVisible(false);
        this.editRegisterEmail.setVisible(false);

        username!=undefined && this.editLoginName.setString(username);
        password!=undefined && this.editLoginPassword.setString(password);
    }

});