/**
 * Created by long.nguyen on 6/26/2018.
 */
mc.GetStringDialog = bb.Dialog.extend({

    ctor:function(str,callback){
        this._super();

        str = str || "None";

        var node = ccs.load(res.widget_search_friend_dialog,"res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var lblTitle = rootMap["lblTitle"];
        var lblDes1 = rootMap["lblDes1"];
        var brkTxt = rootMap["brkTxt"];
        var btnSearch = rootMap["btnSearch"];
        var btnClose = rootMap["btnClose"];

        lblTitle.setColor(mc.color.YELLOW_SOFT);
        btnSearch.setVisible(false);

        var txtBox = new cc.EditBox(cc.size(brkTxt.width, brkTxt.height),new cc.Scale9Sprite("#patch9/Map_Tittle_Name.png"));
        txtBox.setPlaceholderFontColor(cc.color(255, 0, 0));
        txtBox.setPlaceholderFontSize(30);
        txtBox.setFontSize(30);
        txtBox.setDelegate({
            editBoxEditingDidBegin: function (editBox) {
                cc.log("editBox " + " DidBegin !");
            },

            editBoxEditingDidEnd: function (editBox) {
                cc.log("editBox " + " DidEnd !");
            },

            editBoxTextChanged: function (editBox, text) {
                cc.log("editBox " +  ", TextChanged, text: " + text);
                btnSearch.setGray(text === "" || text.length <= 4);
            },

            editBoxReturn: function (editBox) {
                cc.log("editBox " + " was returned !");
            }
        });
        txtBox.setMaxLength(1000);
        txtBox.setFontColor(mc.color.BLUE);
        txtBox.anchorX = 0;
        txtBox.anchorY = 0.5;
        txtBox.x = 30;
        txtBox.y = brkTxt.height*0.35;
        txtBox.setString(str);
        brkTxt.addChild(txtBox);

        btnClose.registerTouchEvent(function(){
            callback && callback(txtBox.getString());
            this.close();
        }.bind(this));
    }
});