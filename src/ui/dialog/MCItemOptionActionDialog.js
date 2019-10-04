/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.ItemOptionActionDialog = bb.Dialog.extend({


    ctor: function () {
        this._super();
        this._rankingHeroesData = mc.dictionary.rankingHeroesData;
        var node = ccs.load(res.widget_action_item_op_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var brk = root.getChildByName("brk");
        var rootMap = this._rootMap = bb.utility.arrayToMap(brk.getChildren(), function (child) {
            return child.getName();
        });
        var title = rootMap["lblTitle"];
        title.setString(mc.dictionary.getGUIString("Item Option"));
        title.setColor(mc.color.WHITE_NORMAL);
        var btnClose = rootMap["btnClose"];
        var brkHowTo = rootMap["brkHowTo"];
        var cellAdd = brkHowTo.getChildByName("cellAdd");
        var lblAdd = cellAdd.getChildByName("brk").setString(mc.dictionary.getGUIString("Create Option"));
        lblAdd.y = lblAdd.y - 5;
        var cellChange = brkHowTo.getChildByName("cellChange");
        var lblChange =cellChange.getChildByName("brk").setString(mc.dictionary.getGUIString("Change Option"));
        lblChange.y = lblChange.y - 5;

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        cellAdd.registerTouchEvent(function () {
            mc.GUIFactory.showAddChangeOptionScreen(mc.AddChangeOptionScreen.ACTION_TYPE.ADD);
            this.close();
        }.bind(this));

        cellChange.registerTouchEvent(function () {
            mc.GUIFactory.showAddChangeOptionScreen(mc.AddChangeOptionScreen.ACTION_TYPE.CHANGE);
            this.close();
        }.bind(this));
    },


    overrideCloseAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    },
    overrideShowAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.setOpacity(0);
        this.runAction(cc.sequence([cc.fadeIn(0.3)]));
        return 0.3;
    }

});