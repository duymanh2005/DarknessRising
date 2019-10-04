/**
 * Created by long.nguyen on 8/3/2017.
 */
mc.PopupDialog = bb.Dialog.extend({

    ctor: function (attachView, arrString, selectFunc, isBottomToTop) {
        this._super();

        var contentView = new ccui.Layout();
        contentView.width = cc.winSize.width;
        contentView.height = cc.winSize.height;
        contentView.registerTouchEvent(function () {
            selectFunc && selectFunc();
            this.close();
        }.bind(this));

        var scrPos = attachView.getParent().convertToWorldSpace(cc.p(attachView.x, attachView.y));
        var brk = this._brk = new ccui.Layout();
        brk.setBackGroundColor(mc.color.BROWN_SOFT);
        brk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        var listView = new ccui.ListView();
        listView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        listView.setGravity(ccui.ListView.GRAVITY_CENTER_HORIZONTAL);
        listView.setBounceEnabled(true);
        var ww =  attachView.width ;// > cc.winSize.width*2/3 ? cc.winSize.width*2/3 : attachView.width;
        for (var i = 0; i < arrString.length; i++) {
            var lbl = mc.GUIFactory.createText(arrString[i]);
            lbl.anchorX = 0;
            var row = new ccui.Widget();
            row.width = ww;//attachView.width;
            row.height = lbl.height + 20;
            lbl.x = 10;
            lbl.y = row.height*0.5 + 5;
            row._touchScale = -0.01;
            row.registerTouchEvent(function (row) {
                selectFunc && selectFunc(row.getUserData());
                this.close();
            }.bind(this));
            row.setSwallowTouches(false);
            row.setUserData(i);

            row.addChild(lbl);
            listView.pushBackCustomItem(row);
        }
        listView.doLayout();

        var contentH = listView.getInnerContainer().height;
        var vh = contentH;
        if( !isBottomToTop ){
            var dh = scrPos.y - contentH;
            if( dh < 0 ){
                vh = scrPos.y - attachView.height*0.5;
            }
        }
        else{
            var dh = scrPos.y + contentH;
            if( dh + contentH > cc.winSize.height ){
                vh = cc.winSize.height - scrPos.y + attachView.height*0.5;
            }
        }

        listView.width = ww;//attachView.width;
        listView.height = vh;
        brk.width = ww;//attachView.width;
        brk.height = vh;

        this.addChild(contentView);
        this.addChild(brk);
        brk.addChild(listView);


        brk.x = scrPos.x;
        brk.y = scrPos.y - attachView.height * attachView.anchorY;

        brk.anchorX = attachView.anchorX;
        brk.anchorY = isBottomToTop ? 0 : 1;

        listView.anchorY = 1.0;
        listView.y = brk.height;
        var dy = brk.y - brk.height;
        //if (dy < 0) {
        //    listView.height += dy;
        //}
        if(brk.y<0)
        {
            brk.y = 10;
        }
    },

    overrideShowAnimation: function () {
        this._brk.scaleY = 0;
        this._brk.runAction(cc.scaleTo(0.2, 1.0, 1.0));
        return 0.2;
    },

    overrideCloseAnimation: function () {
        this._brk.scaleY = 1.0;
        this._brk.runAction(cc.scaleTo(0.2, 1.0, 0.0));
        return 0.2;
    }

});