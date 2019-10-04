/**
 * Created by long.nguyen on 8/28/2017.
 */
mc.DialogLogin = mc.DefaultDialog.extend({

    ctor: function () {
        this._super();
        var contentView = ccs.load(res.widget_login, "res/").node.getChildByName("root");
        this.setContentView(contentView,{
            top:1
        });

        var panelRegister = contentView.getChildByName("panelRegister");
        var panelLogin = contentView.getChildByName("panelLogin");

        panelRegister.setVisible(false);

    }

});