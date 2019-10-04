/**
 * Created by long.nguyen on 4/7/2018.
 */
mc.GuildBossRewardByCheckInDialog = bb.Dialog.extend({

    ctor: function (totalRewards, isChecked, onCheckInChanged) {

        this._super();
        var node = ccs.load(res.widget_guild_reward_by_check_in, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var lblTitle = rootMap["lblTitle"];
        var lblMoreInfo = rootMap["lblMoreInfo"];
        var lblUpgradeLv = rootMap["lblUpgradeLv"];
        var panelRemainViews = rootMap["pnlRemainReward"];
        var btnCheckin = rootMap["btnCheckin"];
        lblMoreInfo.setString(mc.dictionary.getGUIString("lblGuildCheckInInfo"));
        lblUpgradeLv.setString(mc.dictionary.getGUIString("lblGuildUpgradeMoreRewards"));
        btnCheckin.setString(mc.dictionary.getGUIString("Checkin"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        lblTitle.setString(mc.dictionary.getGUIString("lblRewards"));

        if (isChecked) {
            btnCheckin.setGray(true);
        }
        else {
            btnCheckin.setGray(false);
        }

        btnCheckin.registerTouchEvent(function () {
            mc.protocol.guildCheckin(function () {
                btnCheckin.setGray(true);
                onCheckInChanged && onCheckInChanged(true);
                this.close();
            }.bind(this));
        }.bind(this));
        var createRewardsLayout = function (rewardList) {

            if (this.horLayout) {
                this.horLayout.removeFromParent();
            }
            //if (remainRewardData) {
            var rewards = rewardList ? rewardList : [];
            var horLayout = this.horLayout = bb.layout.linear(bb.collection.createArray(rewards.length, function (index) {
                var element = rewards[index];
                var itemView = new mc.ItemView(element);
                itemView.setNewScale(0.75);
                if (element["remainPacks"]) {
                    itemView.setPackNumberText("x" + element["remainPacks"]);
                }
                return itemView;
            }), 40);
            horLayout = mc.view_utility.wrapWidget(horLayout, panelRemainViews.width, false, {
                top: 7,
                left: -10,
                bottom: 10,
                a1: -32,
                a2: -32
            });

            panelRemainViews.addChild(horLayout);
            horLayout.x = panelRemainViews.width / 2;
            horLayout.y = panelRemainViews.height * 0.5;
            //horLayout.y = panelRemainViews.h ;
            //}
            //else {
            //    lblReMainRewardsText.setVisible(true);
            //    lblReMainRewardsText.setString("0");
            //}

        }.bind(this);
        var arrTotalRewards = mc.ItemStock.createArrJsonItemPackFromStr(totalRewards);
        createRewardsLayout(arrTotalRewards);

    },


});