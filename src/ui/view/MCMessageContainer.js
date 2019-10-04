/**
 * Created by long.nguyen on 11/1/2018.
 */
mc.MessageContainer = cc.Node.extend({

    ctor:function(){
        this._super();

        this._arrText = [
            "Hello how do you do",
            "Johny Johny",
            "Yes papa",
            "Eating sugar?",
            "No papa",
            "Telling lies?",
            "No papa",
            "Open your mouth",
            "haha!",
            "Daddy Finger, Daddy Finger",
            "Where are you?",
            "Here i am, here i am, how do you do?",
            "Mommy Finger, Mommy Finger",
            "Where are you?",
            "Here i am, here i am, how do you do?",
            "Brother Finger, Brother Finger",
            "Where are you?",
            "Here i am, here i am, how do you do?",
            "Sister Finger, Sister Finger",
            "Where are you?",
            "Here i am, here i am, how do you do?",
            "Baby Finger, Baby Finger",
            "Where are you?",
            "Here i am, here i am, how do you do?"
        ];

        var tbView = new cc.TableView(this,cc.size(260, 750));
        tbView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tbView.setDelegate(this);
        this.addChild(tbView);
        tbView.reloadData();
    },

    scrollViewDidScroll:function (view) {
    },
    scrollViewDidZoom:function (view) {
    },

    tableCellTouched:function (table, cell) {
        cc.log("cell touched at index: " + cell.getIdx());
    },
    tableCellUnhighlight:function (table, cell) {
        cc.log("cell highlight at index: "+ cell.getIdx());
    },

    tableCellSizeForIndex: function (table, idx) {
        return cc.size(60, 60);
    },

    tableCellAtIndex: function (table, idx) {
        var strValue = idx.toFixed(0);
        var cell = table.dequeueCell();
        if (!cell) {
            cell = new cc.TableViewCell();
            var label = new cc.LabelTTF(strValue, "Helvetica", 20.0);
            label.x = 0;
            label.y = 0;
            label.anchorX = 0;
            label.anchorY = 0;
            label.tag = 123;
            cell.addChild(label);
            cell.setIdx(idx);
        } else {
            label = cell.getChildByTag(123);
        }
        label.setString(this._arrText[idx]);
        return cell;
    },

    numberOfCellsInTableView: function (table) {
        return this._arrText.length;
    }

});
