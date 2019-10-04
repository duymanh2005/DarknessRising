/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.InputTextDialog = bb.Dialog.extend({
    txtBox: null,

    ctor: function (callback) {
        this._super();
        var node = ccs.load(res.widget_search_friend_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        this.__callback = callback;

        var lblTitle = rootMap["lblTitle"];
        var lblDes1 = rootMap["lblDes1"];
        var brkTxt = rootMap["brkTxt"];
        var btnSearch = rootMap["btnSearch"];
        var btnClose = rootMap["btnClose"];

        lblTitle.setColor(mc.color.YELLOW_SOFT);
        lblTitle.setString(this.getTitleI18n());
        lblDes1.setString(this.getDescI18n());

        var txtBox = this.txtBox = mc.view_utility.createTextField(brkTxt, btnSearch);
        this.scheduleOnce(function () {
            txtBox.setFocus();
        }, 0.5);

        btnSearch.setString(this.getBtnTextI18n());
        btnSearch.registerTouchEvent(function () {
            this.onBtnAction(txtBox.getString());
        }.bind(this));

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    },

    onBtnAction: function (txt) {
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.searchFriendByName(txt, 0, function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (result) {
                this.__callback && this.__callback();
                this.close();
            }
        }.bind(this));
    },

    getBtnTextI18n: function () {
        return mc.dictionary.getGUIString("lblSearchFriend");
    },

    getTitleI18n: function () {
        return mc.dictionary.getGUIString("lblTitleSearchFriend");
    },
    getDescI18n: function () {
        return mc.dictionary.getGUIString("lblDescSearchFriend");
    }

});

mc.SearchFriendDialog = mc.InputTextDialog.extend({

    ctor: function (callback) {
        this._super(callback);

    },

    onBtnAction: function (txt) {
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.searchFriendByName(txt, 0, function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (result) {
                this.__callback && this.__callback();
                this.close();
            }
        }.bind(this));
    },

    getTitleI18n: function () {
        return mc.dictionary.getGUIString("lblTitleSearchFriend");
    },
    getDescI18n: function () {
        return mc.dictionary.getGUIString("lblDescSearchFriend");
    }
});
mc.SearchGuildDialog = mc.InputTextDialog.extend({

    ctor: function (callback) {
        this._super(callback);
    },

    onBtnAction: function (txt) {
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.searchFriendByName(txt, 0, function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (result) {
                this.__callback && this.__callback();
                this.close();
            }
        }.bind(this));
    },

    getTitleI18n: function () {
        return mc.dictionary.getGUIString("lblTitleSearchGuild");
    },
    getDescI18n: function () {
        return mc.dictionary.getGUIString("lblDescSearchGuild");
    }
});

mc.ChangeNameDialog = mc.InputTextDialog.extend({

    ctor: function (callback) {
        this._super(callback);
        this.txtBox.setMaxLength(mc.const.MAX_NAME_LENGTH);
    },

    onBtnAction: function (txt) {
        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.changePlayerProfile(txt, null, function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (result) {
                this.__callback && this.__callback(result);
                this.close();
            }
        }.bind(this));

    },

    getBtnTextI18n: function () {
        return mc.dictionary.getGUIString("lblOk");
    },

    getTitleI18n: function () {
        return mc.dictionary.getGUIString("lblRename");
    },
    getDescI18n: function () {
        return mc.dictionary.getGUIString("lblNameLength");
    }
});