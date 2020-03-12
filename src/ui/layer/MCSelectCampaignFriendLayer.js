/**
 * Created by long.nguyen on 5/28/2018.
 */
mc.SelectCampaignFriendLayer = mc.LoadingLayer.extend({
    _currSuggestFriendId: null,
    _mapSuggestFriendCellById: null,

    ctor: function () {
        this._super();
        this._mapSuggestFriendCellById = {};

        var node = ccs.load(res.widget_select_friend, "res/").node;
        this.addChild(node);

        var root = this._root = this.parseCCStudio(res.layer_select_campaign_friend);
        var mapRootView = bb.utility.arrayToMap(root.getChildren(), function (element) {
            return element.getName();
        });

        var imgTitle = mapRootView["brkTitle"];
        var btnOk = this._btnOk = mapRootView["btnOk"];
        var lvlFriend = this._lvlFriend = mapRootView["lvlFriend"];
        var cell = this._cellClone = mapRootView["cell"];
        cell.setVisible(false);

        var spineWorldMap = this._spineWorldMap = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_world_map_json, res.spine_ui_world_map_atlas, 1.0);
        spineWorldMap.setAnimation(0, "animation", true);
        spineWorldMap.setLocalZOrder(-1);
        spineWorldMap.x = -300;
        spineWorldMap.y = -500;
        root.addChild(spineWorldMap);

        btnOk.setString(mc.dictionary.getGUIString("lblOk"));

        imgTitle._maxLblWidth = imgTitle.width - 140;
        var lblView = imgTitle.setString(mc.dictionary.getGUIString("lblFriends"), res.font_UTMBienvenue_none_32_export_fnt);
        lblView.setColor(mc.color.BROWN_SOFT);

        var lblCountDown = new ccui.Text("", "Arial", 25);
        lblCountDown.x = btnOk.x + 250;
        lblCountDown.y = btnOk.y + 30;
        root.addChild(lblCountDown);
        lblCountDown.setVisible(false);

        var numChance = mc.GameData.playerInfo.getBorrowFriendTicket();
        var layoutSwords = bb.layout.linear(bb.collection.createArray(5,function(index){
            var spr = new cc.Sprite("#icon/ico_battle.png");
            if(index < (5 - numChance) ){
                spr.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
            return spr;
        }),5,bb.layout.LINEAR_HORIZONTAL);


        layoutSwords.x = btnOk.x + 250;
        layoutSwords.y = btnOk.y;

        root.addChild(layoutSwords);

        if(numChance > 0){
            btnOk.registerTouchEvent(function () {
                mc.GameData.guiState.setCurrentSuggestFriendHeroId(this._currSuggestFriendId);
                this.getMainScreen().popLayer();
            }.bind(this));
        }else{
            btnOk.setGrayForAll(true);
            var markTime = bb.now();
            var _updateFreeTime = function (lbl) {
                lbl.setVisible(true);
                var countDownInS = mc.SummonManager.getSummonCountDown(1);
                if (countDownInS > 0) {
                    var durationInS = mc.GameData.playerInfo.getRehilSecondById(mc.const.ITEM_INDEX_SUMMON_TICKET);
                    durationInS = durationInS - ((bb.now() - markTime) / 1000);
                    if (durationInS <= 0) {
                        lbl.setString("Reset");
                        lbl.setVisible(false);
                    } else {
                        lbl.setVisible(true);
                        var strDur = mc.view_utility.formatDurationTimeHMS(durationInS * 1000);
                        lbl.setString("Reset: " + strDur);
                    }
                } else {
                    lbl.setVisible(false);
                }
            };

            btnOk.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(function (lblSummon) {
                _updateFreeTime(lblSummon);
            }, lblCountDown)]).repeatForever());
        }


        this.traceDataChange(bb.framework.const.EVENT_CLICK, function (widget) {
            if (this.getMainScreen().getButtonBack() === widget) {
                mc.GameData.guiState.setCurrentSuggestFriendHeroId(null);
                mc.GameData.guiState.setCurrentSlotReplaceFriendHero(null);
            }
        }.bind(this));
    },

    onLoading: function (data) {
        var friendManager = mc.GameData.friendManager;
        var arrHeroSuggest = friendManager.getArrayFriendSuggest();
        arrHeroSuggest = null;
        if (!arrHeroSuggest) {
            this.traceDataChange(friendManager, function () {
                this.performDone(data);
            }.bind(this));
            mc.protocol.getSuggestHeroList();
        }
        else {
            this.performDone(data);
        }
    },

    onLoadDone: function (data) {
        var arrFriendSuggest = mc.GameData.friendManager.getArrayFriendSuggest();
        for (var i = 0; i < arrFriendSuggest.length; i++) {
            var cell = this._reloadCell(this._cellClone.clone(), arrFriendSuggest[i]);
            this._mapSuggestFriendCellById[mc.FriendManager.getSuggestPlayerId(arrFriendSuggest[i])] = cell;
            this._lvlFriend.pushBackCustomItem(cell);
        }
        this._lvlFriend.doLayout();
        this._currSuggestFriendId = mc.GameData.guiState.getCurrentSuggestFriendHeroId();
        this._currSuggestFriendId && this._selectSuggestFriendId(this._currSuggestFriendId);
    },

    _selectSuggestFriendId: function (suggestFriendId) {
        if (this._currSuggestFriendId === suggestFriendId) {
            var cell = this._mapSuggestFriendCellById[this._currSuggestFriendId];
            if (cell) {
                var imgSelect = cell.getChildByName("imgSelect");
                imgSelect.setVisible(!imgSelect.isVisible());
                this._currSuggestFriendId = imgSelect.isVisible() ? suggestFriendId : null;
            }
        }
        else {

            var cell = this._mapSuggestFriendCellById[suggestFriendId];
            if (cell) {
                var imgSelect = cell.getChildByName("imgSelect");
                imgSelect.setVisible(true);
            }

            if (this._currSuggestFriendId) {
                var cell = this._mapSuggestFriendCellById[this._currSuggestFriendId];
                if (cell) {
                    var imgSelect = cell.getChildByName("imgSelect");
                    imgSelect.setVisible(false);
                }
            }
            this._currSuggestFriendId = suggestFriendId;
        }

    },

    _reloadCell: function (cell, suggestFriendInfo) {
        var mapCell = bb.utility.arrayToMap(cell.getChildren(), function (element) {
            return element.getName();
        });

        var lblName = mapCell["lblName"];
        var lblPower = mapCell["lblPower"];
        var lblLevel = mapCell["lblLvl"];
        lblLevel.setAnchorPoint(1, 0.5);
        lblLevel.x += 50;
        var lblFriendPoint = mapCell["lblFriendPoint"];

        lblFriendPoint.setColor(mc.color.GREEN_NORMAL);
        lblName.setColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLevel.setColor(mc.color.BROWN_SOFT);

        var leaderHeroInfo = mc.FriendManager.getSuggestHeroInfoOfPlayer(suggestFriendInfo);
        if (leaderHeroInfo) {
            leaderHeroInfo.element = mc.dictionary.getHeroDictByIndex(leaderHeroInfo.index).element;
        }
        var heroAvt = new mc.HeroAvatarView(leaderHeroInfo);
        heroAvt.x = heroAvt.width * 0.5 + 17;
        heroAvt.y = cell.height * 0.5;
        cell.addChild(heroAvt);

        lblName.setString(mc.FriendManager.getSuggestPlayerName(suggestFriendInfo));
        lblPower.setString(bb.utility.formatNumber(leaderHeroInfo.power));
        lblLevel.setString(mc.dictionary.getGUIString("lblLevel") + bb.utility.formatNumber(suggestFriendInfo.level));
        lblFriendPoint.setString("+ " + bb.utility.formatNumber(suggestFriendInfo.bonusFP));

        cell.setVisible(true);
        cell._touchScale = -0.01;
        cell.registerTouchEvent(function (cell) {
            this._selectSuggestFriendId(mc.FriendManager.getSuggestPlayerId(cell.getUserData()));
        }.bind(this));
        cell.setCascadeOpacityEnabled(true);
        cell.setUserData(suggestFriendInfo);

        return cell;
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_SELECT_CAMPAIGN_FRIEND;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});