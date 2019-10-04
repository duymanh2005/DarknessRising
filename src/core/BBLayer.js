/**
 * Created by longnguyen on 11/13/2016.
 */
bb.Layer = cc.Layer.extend({
    _keyboardListener: null,

    loadGUI: function (urlJson, ref, guiParser) {
        guiParser = guiParser || bb.framework.getGUIParserManager();
        var layer = guiParser.parseGUI(ref, urlJson);
        this.addChild(layer);
    },

    show: function () {
    },

    close: function () {
    },

    onBackEvent: function () {
        var dialog = bb.framework.getGUIFactory().createExitGameDialog();
        dialog && dialog.show();
        return dialog != null;
    },

    getPointInScreen: function (x, y) {
        return bb.utility.getPointInScreen(x, y);
    }

});