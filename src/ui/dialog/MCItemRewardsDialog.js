/**
 * Created by long.nguyen on 7/20/2018.
 */
mc.ItemRewardsDialog = bb.Dialog.extend({

    ctor: function (itemInfos, cb) {
        this._super();
        this.cb = cb;
        var node = ccs.load(res.widget_item_rewards_dialog, "res/").node;
        this.addChild(node);

        var root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var base = this._base = sp.SkeletonAnimation.createWithJsonFile(res.spine_light_ray_json, res.spine_light_ray_atlas, 1.0);
        root.addChild(base);
        base.setPosition(root.width / 2, mc.const.DEFAULT_HEIGHT / 2);
        var congrats = this._congrats = sp.SkeletonAnimation.createWithJsonFile(res.spine_text_congrats_json, res.spine_text_congrats_atlas, 1.0);
        root.addChild(congrats);
        congrats.setPosition(root.width / 2, mc.const.DEFAULT_HEIGHT * 0.7);

        var rank = 1;

        var horLayout = bb.layout.linear(bb.collection.createArray(itemInfos.length, function (index) {
            var itemRank = mc.ItemStock.getItemRankByIndex(itemInfos[index]["index"]);
            rank = Math.max(rank, itemRank);
            var itemView = new mc.ItemView(itemInfos[index]);
            itemView.registerViewItemInfo();
            return itemView;
        }), 40);

        base.setAnimation(0, "rank" + rank + "_big_idle", true);

        var lan = mc.storage.readSetting()["language"];

        congrats.setAnimation(0, "appear_" + lan, false);
        congrats.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 0) {
                congrats.setAnimation(1, "idle_" + lan, true);
            }
        }.bind(this));

        root.addChild(horLayout);
        horLayout.setPosition(root.width / 2, mc.const.DEFAULT_HEIGHT / 2);
        var lblRewards = rootMap["lbl_rewards"];
        var btnGet = rootMap["btnGet"];
        var btnBack = rootMap["btnBack"];
        btnBack.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        btnGet.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        btnGet.setString(mc.dictionary.getGUIString("lblGetReward"));
        lblRewards.setString(mc.dictionary.getGUIString("lblSpinRewards"));
    },
    onClose: function () {
        this.cb && this.cb();
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