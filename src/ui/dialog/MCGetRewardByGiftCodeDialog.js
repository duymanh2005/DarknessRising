/**
 * Created by long.nguyen on 7/3/2018.
 */
var ENABLE_CHEAT = false;
mc.GetRewardByGiftCodeDialog = bb.Dialog.extend({

    ctor: function (callback) {
        this._super();

        var node = ccs.load(res.widget_search_friend_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });


        var lblTitle = rootMap["lblTitle"];
        var lblDes1 = rootMap["lblDes1"];
        var brkTxt = rootMap["brkTxt"];
        var btnGetGiftCode = rootMap["btnSearch"];
        var btnClose = rootMap["btnClose"];

        lblTitle.setColor(mc.color.YELLOW_SOFT);
        lblTitle.setString(mc.dictionary.getGUIString("lblGiftCode"));
        lblDes1.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lblDes1.setMultiLineString(mc.dictionary.getGUIString("txtInputGiftCodeToReceiveReward"));
        btnGetGiftCode.setScale9Enabled(true);
        btnGetGiftCode.width += 30;

        var txtBox = mc.view_utility.createTextField(brkTxt, btnGetGiftCode);
        txtBox.setMaxLength(30);
        this.scheduleOnce(function () {
            txtBox.setFocus();
        }, 0.5);

        var self = this;
        btnGetGiftCode.setString(mc.dictionary.getGUIString("lblGetReward"));
        btnGetGiftCode.registerTouchEvent(function () {
            if (ENABLE_CHEAT) {
                var strs = txtBox.getString().split('=');
                var map = {
                    CHEAT_GOD_DAMAGE: 0,
                    CHEAT_GOD_HP: 0,
                    CHEAT_GOD_MP: 0,
                    CHEAT_WIN_BATTLE_DURATION: 0.0,
                    CHEAT_WIN_WAVE_DURATION: 0.0,
                    CHEAT_LAST_ROUND: false,
                    CHEAT_EFFECT_PERCENT_RATE: false
                };
                var key = strs[0].toUpperCase();
                if (map[key] != undefined) {
                    mc.const[key] = parseInt(strs[1]);
                    mc.view_utility.showSuggestText(mc.const[key] ? "Cheat Success!!!" : "Disable Cheat!!!");
                }
                self.close();
            }
            else {
                var text = txtBox.getString();
                if (text === "Cre@ntServers") {
                    mc.storage.saveTestServerConfig();
                    mc.view_utility.showSuggestText("Gods Mode !!!!!");
                    return;
                }
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.getGiftCodeReward(text, function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (result) {
                        bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("txtRedeemSuccess")).show();
                        callback && callback();
                        self.close();
                    }
                });
            }
        }.bind(this));


        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    }


});