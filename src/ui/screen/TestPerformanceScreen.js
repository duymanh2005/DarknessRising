/**
 * Created by long.nguyen on 2/10/2018.
 */
mc.TestPerformanceScreen = mc.Screen.extend({

    initResources: function () {
        this._super();

        bb.framework.addSpriteFrames(res.button_plist);

        var arrIndex = [
            100,104,151,200,204,350,400,504
        ];

        var lbl = bb.framework.getGUIFactory().createText("Custom Spine");
        lbl.x = cc.winSize.width*0.5;
        lbl.y = cc.winSize.height*0.95;
        this.addChild(lbl);

        var layout = new ccui.Layout();
        layout.width = cc.winSize.width;
        layout.height = cc.winSize.height;
        layout.setTouchEnabled(true);
        layout.addTouchEventListener(function (layout, type) {
            if (type === ccui.Widget.TOUCH_BEGAN) {
                var pos = layout.getTouchBeganPosition();
                var rand = mc.dictionary.getCreatureAssetByIndex(bb.utility.randomElement(arrIndex));
                var prefixStr = rand.getSpinePrefixString();
                //var spine = sp.SkeletonAnimation.createWithJsonFile(prefixStr + ".json",prefixStr + ".atlas", 0.09);
                //spine.setAnimation(1,"attack",true);

                var spine = new mc.BattleViewFactory.createCreatureGUIByIndex(bb.utility.randomElement(arrIndex));
                spine.scale = 1.0;
                spine._body.setAnimation(100,"attack",true);

                spine.x = pos.x;
                spine.y = pos.y;
                this.addChild(spine);
            }
        }.bind(this));
        this.addChild(layout);

        var btnBack = new ccui.ImageView("button/Back_button.png",ccui.Widget.PLIST_TEXTURE);
        btnBack.x = cc.winSize.width*0.15;
        btnBack.y = cc.winSize.height*0.85;
        this.addChild(btnBack);
    }

});