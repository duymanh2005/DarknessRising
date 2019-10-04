/**
 * Created by long.nguyen on 4/11/2017.
 */

bb.GUIParserManager = cc.Class.extend({
    _parserMap: null,

    ctor: function () {
        this._parserMap = {};
        this.registerParserComponent(bb.GUIParserManager.LABEL_COMPONENT, new bb.LabelParser());
        this.registerParserComponent(bb.GUIParserManager.BUTTON_COMPONENT, new bb.ButtonParser());
        this.registerParserComponent(bb.GUIParserManager.GRIDVIEW_COMPONENT, new bb.GridViewParser());
        this.registerParserComponent(bb.GUIParserManager.PROGRESSBAR_COMPONENT, new bb.ProgressBarParser());
    },

    parseGUI: function (varsMap, url) {
        var node = ccs.load(url, "res/").node;
        this._travelNode(varsMap, node);
        return node;
    },

    registerParserComponent: function (className, parserObj) {
        this._parserMap[className] = parserObj;
    },

    _travelNode: function (varsMap, node) {
        var children = node.getChildren();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var data = child.getComponent("ComExtensionData").getCustomProperty();
            if (data) {
                data = JSON.parse(data);
                var parser = this._parserMap[data.cl];
                if (parser) {
                    parser.doParsing(data);
                    varsMap["_" + child.getName()] = child;
                }
            } else {
                if (child.getChildren().length > 0) {
                    this._travelNode(child);
                }
            }
        }
    }

});
bb.GUIParserManager.LABEL_COMPONENT = "Label";
bb.GUIParserManager.BUTTON_COMPONENT = "Button";
bb.GUIParserManager.GRIDVIEW_COMPONENT = "GridView";
bb.GUIParserManager.PROGRESSBAR_COMPONENT = "ProgressBar";

bb.ComponentParser = cc.Class.extend({
    doParsing: function (data) {
    }
});

bb.LabelParser = bb.ComponentParser.extend({
    doParsing: function (data) {
        cc.log("hello ");
    }
});

bb.ButtonParser = bb.ComponentParser.extend({
    doParsing: function (data) {
    }
});

bb.GridViewParser = bb.ComponentParser.extend({
    doParsing: function (data) {
    }
});

bb.ProgressBarParser = bb.ComponentParser.extend({
    doParsing: function (data) {
    }
});