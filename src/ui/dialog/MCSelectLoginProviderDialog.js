/**
 * Created by long.nguyen on 8/10/2018.
 */
mc.SelectLoginProviderDialog = bb.Dialog.extend({

    ctor:function(provider,callback){
        this._super();

        var node = ccs.load(res.widget_select_login_provider_dialog, "res/").node;
        this.addChild(node);

        var mapView = bb.utility.arrayToMap(node.getChildByName("root").getChildren(),function(child){
            return child.getName();
        });

        var lblTitle = mapView["lblTitle"];
        var lblDes = mapView["lblDes"];
        var btnProvider = mapView["btnProvider"];
        var btnFacebook = mapView["btnFacebook"];
        var btnGuest = mapView["btnGuest"];
        var lblGuest = btnGuest.setString(mc.dictionary.getGUIString("lblGuestPlay"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblGuest.x = btnGuest.width * 0.6;
        if(mc.enableReplaceFontBM())
        {
            lblGuest.setFontSize(32);
        }
        var btnClose = mapView["btnClose"];
        var node_term = mapView["node_term"];

        var mapTerm = bb.utility.arrayToMap(node_term.getChildren(),function(child){
            return child.getName();
        });

        var checkbox = mapTerm["checkbox"];
        var checkImage = checkbox.getChildByName("check");
        var linkPrivacy = mapTerm["linkPrivacy"];
        var linkTerm =  mapTerm["linkTerm"];
        var lblAgree = mapTerm["lblAgree"];
        var lblAnd = mapTerm["lblAnd"];

        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblDes.setColor(mc.color.BROWN_SOFT);
        linkPrivacy.setColor(mc.color.BLUE_SOFT);
        linkTerm.setColor(mc.color.BLUE_SOFT);


        linkPrivacy.registerTouchEvent(function(){
            cc.sys.openURL(mc.const.URL_PRIVACY);
        });

        linkTerm.registerTouchEvent(function(){
            cc.sys.openURL(mc.const.URL_TERM);
        });

        lblAgree.setString(mc.dictionary.getGUIString("lblIAgreeTo"));
        linkTerm.setString(mc.dictionary.getGUIString("lblTerms"));
        lblAnd.setString(mc.dictionary.getGUIString("lblAnd"));
        linkPrivacy.setString(mc.dictionary.getGUIString("lblPrivacyPolicy"));
        var lan = mc.storage.readSetting()["language"];
        linkTerm.orgX = linkTerm.x;
        lblAnd.orgX = lblAnd.x;
        linkPrivacy.orgX = linkPrivacy.x;
        if(lan && lan === "en")
        {
            lblAnd.x = lblAnd.orgX;
            linkPrivacy.x = linkPrivacy.orgX;
        }
        else{
            lblAnd.x = lblAnd.orgX + 70;
            linkPrivacy.x = linkPrivacy.orgX + 45;
        }

        checkbox.registerTouchEvent(function(){
            checkImage.setVisible(!checkImage.isVisible());
        });

        checkImage.setVisible(true);
        node_term.setVisible(true);

        lblTitle.setString(mc.dictionary.getGUIString("lblLogIn"));
        lblDes.setString(mc.dictionary.getGUIString("txtChooseYourAccountToLogIn"));

        btnProvider.loadTexture("button/btn_mobile.png",ccui.Widget.PLIST_TEXTURE);
        if( provider === "apple" ){
            cc.log("provider: "+provider);
            //btnProvider.loadTexture("button/btn_gamecenter.png",ccui.Widget.PLIST_TEXTURE);
        }

        var _showWarningAgreeTerm = function(){
            if( !checkImage.isVisible() ){
                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtUNeedAgreeTermAndPrivacy"),null,3);
                return true;
            }
            return false;
        };

        var self = this;
        btnProvider.registerTouchEvent(function(){
            var isWarn = _showWarningAgreeTerm();
            if( !isWarn ){
                callback && callback("phone");
                self.close();
            }
        });
        btnFacebook.registerTouchEvent(function(){
            var isWarn = _showWarningAgreeTerm();
            if( !isWarn ){
                callback && callback("facebook");
                self.close();
            }
        });
        btnGuest.registerTouchEvent(function(){
            var isWarn = _showWarningAgreeTerm();
            if( !isWarn ){
                callback && callback("guest");
                self.close();
            }
        });
        btnClose.registerTouchEvent(function(){
            self.close();
        });

        if( true || !cc.sys.isNative ){
            btnProvider.setVisible(false);
            btnFacebook.y += 50;
            btnGuest.y += 50;
        }

    },

    overrideShowAnimation:function(){
        return 0.01;
    },

    overrideCloseAnimation:function(){
        return 0.01;
    }
});