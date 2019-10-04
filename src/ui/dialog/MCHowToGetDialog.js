/**
 * Created by long.nguyen on 2/8/2018.
 */
mc.HowToGetDialog = bb.Dialog.extend({

    ctor: function (itemInfo) {
        this._super();

        var node = ccs.load(res.widget_how_to_get_dialog, "res/").node;
        this.addChild(node);

        var mapView = bb.utility.arrayToMap(node.getChildByName("root").getChildren(), function (child) {
            return child.getName();
        });

        var lblTitle = mapView["lblTitle"];
        var lblDes = mapView["lblDes"];
        var nodeItem = mapView["nodeItem"];
        var lblHowToGet = mapView["lblHowToGet"];
        var btnClose = mapView["btnClose"];
        var lvl = mapView["lvl"];
        var cell = this._cell = mapView["cell"];

        cell.setVisible(false);
        lblTitle.setColor(mc.color.YELLOW_SOFT);
        lblHowToGet.setColor(mc.color.YELLOW_SOFT);

        lblHowToGet.setString(mc.dictionary.getGUIString("lblHowToGet"));
        lblTitle.setString(mc.ItemStock.getItemName(itemInfo));
        lblDes.setMultiLineString(mc.ItemStock.getItemDesc(itemInfo) || mc.ItemStock.getItemTextCaution(itemInfo), 400, cc.TEXT_ALIGNMENT_LEFT);

        var itemView = new mc.ItemView(itemInfo);
        itemView.scale = 0.85;
        itemView.getQuantityLabel().setVisible(false);
        nodeItem.addChild(itemView);

        var craftRecipe = mc.ItemStock.getCraftingRecipe(itemInfo) || mc.ItemStock.getCraftingEventRecipe(itemInfo);
        var itemIndex = mc.ItemStock.getItemIndex(itemInfo);
        //var arrStageDictByRewardIndex = mc.CampaignManger.getArrayStageDictByRewardIndex(itemIndex);
        var mapArrayStageIndexByChapterIndex = mc.CampaignManger.getMapArrayStageIndexByChapterIndexOf(itemIndex);
        var arrChallengeStageDictByRewardIndex = mc.ChallengeManager.getArrayChallengeStageDictByRewardIndex(itemIndex);
        var strHowToGetCode = mc.ItemStock.getHowToGetCode(itemInfo);

        if (craftRecipe) {
            var howToViewByCraft = this._reloadCell("icon/ico_howto_craft.png", mc.dictionary.getGUIString("lblCraftWeapon"), function () {
                var currScr = bb.director.getCurrentScreen();
                if (currScr instanceof mc.CraftItemScreen) {
                    currScr.selectCraftItemIndex(itemIndex);
                }
                else {
                    mc.GameData.guiState.setCurrentCraftEquipIndex(itemIndex);
                    mc.GUIFactory.showCraftItemScreen();
                }
            });
            lvl.pushBackCustomItem(howToViewByCraft);
        }

        var self = this;
        var mapCreateHowToGetViewByCode = {};
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_CHAOS_CASTLE] = function () {
            var howToViewByChaos = self._reloadCell("icon/Chaos_Castle.png", mc.dictionary.getGUIString("lblChaosCastle"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_CHAOS_CASTLE);
            }, 0.65);
            lvl.pushBackCustomItem(howToViewByChaos);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_ARENA] = function () {
            var howToViewByChaos = self._reloadCell("icon/arena.png", mc.dictionary.getGUIString("lblArena"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_ARENA);
            }, 0.65);
            lvl.pushBackCustomItem(howToViewByChaos);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_SUMMON_ITEM] = function () {
            var howToViewBySummon = self._reloadCell("icon/Summon.png", mc.dictionary.getGUIString("lblSummon"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_SUMMON_ITEM);
            });
            lvl.pushBackCustomItem(howToViewBySummon);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_SHOP_COMMON] = function () {
            var howToViewByShop = self._reloadCell("icon/ico_howto_shop.png", mc.dictionary.getGUIString("lblShop"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_SHOP_COMMON);
            });
            lvl.pushBackCustomItem(howToViewByShop);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_SHOP_ARENA] = function () {
            var howToViewByShop = self._reloadCell("icon/ico_howto_shop.png", mc.dictionary.getGUIString("lblShop") + " " + mc.dictionary.getGUIString("lblArena"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_SHOP_ARENA);
            });
            lvl.pushBackCustomItem(howToViewByShop);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_SHOP_CHAOS] = function () {
            var howToViewByShop = self._reloadCell("icon/ico_howto_shop.png", mc.dictionary.getGUIString("lblShop") + " " + mc.dictionary.getGUIString("lblChaosCastle"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_SHOP_CHAOS);
            });
            lvl.pushBackCustomItem(howToViewByShop);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_DAILY_CHALLENGE1] = function () {
            var howToViewByShop = self._reloadCell("icon/ico_howto_event.png", mc.dictionary.getGUIString("lblGoldenDragon"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_DAILY_CHALLENGE1);
            });
            lvl.pushBackCustomItem(howToViewByShop);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_DAILY_CHALLENGE2] = function () {
            var howToViewByShop = self._reloadCell("icon/ico_howto_event.png", mc.dictionary.getGUIString("lblWhiteWizard"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_DAILY_CHALLENGE2);
            });
            lvl.pushBackCustomItem(howToViewByShop);
        };
        mapCreateHowToGetViewByCode[mc.const.FUNCTION_DAILY_CHALLENGE3] = function () {
            var howToViewByShop = self._reloadCell("icon/ico_howto_event.png", mc.dictionary.getGUIString("lblMoonRabbit"), function () {
                mc.view_utility.goTo(mc.const.FUNCTION_DAILY_CHALLENGE3);
            });
            lvl.pushBackCustomItem(howToViewByShop);
        };

        if (strHowToGetCode) {
            var arrHowToGetCode = strHowToGetCode.split('#');
            for (var i = 0; i < arrHowToGetCode.length; i++) {
                arrHowToGetCode[i] && mapCreateHowToGetViewByCode[arrHowToGetCode[i]] && mapCreateHowToGetViewByCode[arrHowToGetCode[i]]();
            }
        }
        else {
            mapCreateHowToGetViewByCode[mc.const.FUNCTION_SUMMON_ITEM]();
            mapCreateHowToGetViewByCode[mc.const.FUNCTION_SHOP_COMMON]();
        }

        var _goToCampaignStageCb = function (howToGetView) {
            var chapterIndex = howToGetView.getUserData();
            mc.GameData.guiState.setCurrentFindingItemIndex(mc.ItemStock.getItemIndex(itemInfo));
            mc.view_utility.goTo("map_" + chapterIndex)
        };
        if (mapArrayStageIndexByChapterIndex) {
            for (var chapterIndex in mapArrayStageIndexByChapterIndex) {
                chapterIndex = parseInt(chapterIndex);
                var passStageIndex = bb.collection.findBy(mapArrayStageIndexByChapterIndex[chapterIndex], function (stageIndex) {
                    return mc.GameData.playerInfo.getCurrentStageIndex() >= stageIndex;
                });
                var howToViewByStageCampaign = this._reloadCell("icon/ico_howto_map.png", mc.const.ARR_CHAPTER_NAME[chapterIndex], _goToCampaignStageCb);
                howToViewByStageCampaign.setUserData(chapterIndex);
                howToViewByStageCampaign.setEnabled(passStageIndex && (mc.GameData.playerInfo.getCurrentChapterIndex() >= chapterIndex));
                if (!howToViewByStageCampaign.isEnabled()) {
                    howToViewByStageCampaign.setColor(mc.color.BLACK_DISABLE_STRONG);
                }
                lvl.pushBackCustomItem(howToViewByStageCampaign);
            }
        }

        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));
    },

    _reloadCell: function (iconURL, name, callback, scale) {
        var cellView = this._cell.clone();
        cellView.setVisible(true);
        cellView.setCascadeOpacityEnabled(true);
        cellView.setCascadeColorEnabled(true);

        var mapCell = bb.utility.arrayToMap(cellView.getChildren(), function (child) {
            return child.getName();
        });

        var icon = mapCell["icon"];
        var brk = mapCell["brk"];
        brk.setCascadeColorEnabled(true);

        icon.ignoreContentAdaptWithSize(true);
        icon.loadTexture(iconURL, ccui.Widget.PLIST_TEXTURE);
        icon.scale = scale || 1.0;
        var lbl = brk.setString(name, res.font_UTMBienvenue_none_32_export_fnt);
        lbl.setColor(mc.color.BROWN_SOFT);
        lbl.scale = 0.75;

        cellView.registerTouchEvent(function (cell) {
            this.close();
            callback && callback(cell);
        }.bind(this));
        return cellView;
    }

});