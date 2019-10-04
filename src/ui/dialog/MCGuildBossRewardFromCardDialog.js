/**
 * Created by long.nguyen on 4/7/2018.
 */
mc.GuildBossRewardFromCardDialog = bb.Dialog.extend({

    ctor: function (receivedBoxData, percent, isClaimed,totalRewards,stageIndex, onClaimChangedcb) {

        this._super();
        var node = ccs.load(res.widget_guild_reward_by_card_info, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        this._percent = percent;

        var lvlCard = rootMap["lvlCard"];
        var cell = rootMap["cell"];
        cell.setVisible(false);
        var lblTitle = rootMap["lblTitle"];
        var lblRemain = rootMap["remain"];
        var panelRemainViews = rootMap["pnlRemainReward"];
        var lblRemainRewards = panelRemainViews.getChildByName("lblRemain");
        var lblReMainRewardsText = panelRemainViews.getChildByName("lblRemainText");
        lblTitle.setString(mc.dictionary.getGUIString("lblRewards"));
        lblRemain.setString(cc.formatStr(mc.dictionary.getGUIString("Remain your chest"), isClaimed ? "0" : "1"));
        if(isClaimed)
        {
            lblRemain.setColor(cc.color.RED);
        }
        else
        {
            lblRemain.setColor(cc.color.GREEN);
        }
        lblRemainRewards.setString(cc.formatStr(mc.dictionary.getGUIString("Remain rewards")));

        var self = this;

        var parseRewarsdFromData = function(data){
            var arr =[];
            for(var j = 0;j<data.length;j++)
            {
                var strReward = data[j].itemString;
                arr.push(mc.ItemStock.createJsonItemFromStr(strReward));
            }
            return arr;
        }

        var calRemainRewards = function(total, rewardsClaimed){
            var totalItems = mc.ItemStock.createArrJsonItemPackFromStr(total);
            if(rewardsClaimed)
            {
                var arr =[];
                //for(var j = 0;j<rewardsClaimed.length;j++)
                //{
                //    var strReward = rewardsClaimed[j].itemString;
                //    arr.push(mc.ItemStock.createJsonItemFromStr(strReward));
                //}
                arr = rewardsClaimed;
                for(var j1 = 0;j1<arr.length;j1++)
                {
                    var tempItem = arr[j1];
                    for(var e1 = 0;e1<totalItems.length;e1++)
                    {
                        var totalItem = totalItems[e1];
                        if(totalItem.index === tempItem.index && totalItem.no === tempItem.no)
                        {
                            totalItem.remainPacks = totalItem.remainPacks - 1;
                        }
                    }
                }
            }
            return totalItems;

        }

        var updateReceivedReward = function (view, itemInfo) {
            var oldView = view.getChildByName("rewardItem");
            if (oldView) {
                oldView.removeFromParent();
            }
            var itemView = new mc.ItemView(itemInfo);
            itemView.setNewScale(0.66);
            itemView.x = view.width * 0.5;
            itemView.y = view.height * 0.45;
            itemView.registerViewItemInfo();
            itemView.setName("rewardItem");
            view.addChild(itemView);

            var chest = view.getChildByName("chest");
            chest.setVisible(false);

            var title = view.getChildByName("title");
            title.setString(mc.dictionary.getGUIString("Opened"));
            title.setColor(cc.color.YELLOW);

        };

        var updateMemName = function (view, name) {
            var lblMemName = view.getChildByName("name");
            lblMemName.setString(name);
            lblMemName.setVisible(true);
        };

        var updateRemainReward = function (remainRewardData) {

            if (this.horLayout) {
                this.horLayout.removeFromParent();
            }
            //if (remainRewardData) {
                lblReMainRewardsText.setVisible(false);
                var horLayout = this.horLayout = bb.layout.linear(bb.collection.createArray(remainRewardData.length, function (index) {
                    var element = remainRewardData[index];
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
                horLayout.y = panelRemainViews.height * 0.3;
                //horLayout.y = panelRemainViews.h ;
            //}
            //else {
            //    lblReMainRewardsText.setVisible(true);
            //    lblReMainRewardsText.setString("0");
            //}

        }.bind(this);

        var _createLayout = function () {
            var amountViews = 64;
            var tempReceivedBoxData = new Array(amountViews);
            if (receivedBoxData) {
                for (var i in receivedBoxData) {
                    var item = receivedBoxData[i];
                    tempReceivedBoxData[item.boxIndex] = item;
                }
            }
            var layout = bb.layout.grid(bb.collection.createArray(amountViews, function (index) {
                var widget = cell.clone();
                widget.setVisible(true);

                var chest = widget.getChildByName("chest");
                chest.loadTexture("icon/chestgai_dong.png", ccui.Widget.PLIST_TEXTURE);
                chest.setVisible(true);

                var name = widget.getChildByName("name");
                name.setVisible(false);
                var title = widget.getChildByName("title");
                title.setString(mc.dictionary.getGUIString("Open Now"));
                title.setColor(cc.color.WHITE);
                chest.loadTexture("icon/chestgai_dong.png", ccui.Widget.PLIST_TEXTURE);
                if (!isClaimed) {
                    widget.registerTouchEvent(function (widget) {
                        var itemData = widget.getUserData();
                        if (!itemData) {
                            mc.protocol.getGuildBossRewardFromCard(percent, index,mc.GameData.guiState.getCurrGuildBossShow().bossType,stageIndex, function (result) {
                                if (result) {
                                    var name = mc.GameData.playerInfo.getName();
                                    updateMemName(widget, name);
                                    updateReceivedReward(widget, result.reward.items[0]);
                                    updateRemainReward(calRemainRewards(totalRewards,result.reward.items));
                                    lblRemain.setString(cc.formatStr(mc.dictionary.getGUIString("Remain your chest"), "0"));
                                    lblRemain.setColor(cc.color.RED);
                                    if(result.stageId ===  mc.GameData.guildBossSystem.getCurrBossStage)
                                    {
                                        mc.GameData.guildBossSystem.getClaimedList().push(self._percent);
                                        mc.GameData.guildBossSystem.notifyDataChanged();
                                    }
                                    onClaimChangedcb && onClaimChangedcb(true,percent);
                                }
                            }.bind(this));
                        }
                    }.bind(this));
                }
                var tempData = tempReceivedBoxData[index];
                if (tempData) {
                    widget.setUserData(tempData);
                    var itemInfo = mc.ItemStock.createJsonItemFromStr(tempData.itemString)
                    updateMemName(widget, tempData.name);
                    updateReceivedReward(widget, itemInfo);

                }
                var arrRewards = parseRewarsdFromData(receivedBoxData);
                updateRemainReward(calRemainRewards(totalRewards,arrRewards));
                widget.setSwallowTouches(false);
                widget.setCascadeColorEnabled(true);
                //_updateStatus(widget);
                return widget;
            }.bind(this)), 4, lvlCard.width * 0.98, 5);
            return layout;
        };

        var layout1 = _createLayout();
        lvlCard.pushBackCustomItem(layout1);


    },

    getScrollWidget: function () {
        return this.scrollWidget;
    }

});