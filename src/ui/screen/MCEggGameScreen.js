/**
 * Created by long.nguyen on 5/14/2018.
 */

var isBeating = false;
mc.EggGameScreen = mc.Screen.extend({
    _eggListData: null,

    initResources: function () {

        //var root = this.root = this.parseCCStudio(parseNode || res.layer_tier_hero_stock);
        //mc.storage.readConfirmEggGame();

        mc.storage.readEggGameLog();
        var node = mc.loadGUI(res.screen_egg_game_json);
        this.addChild(node);
        var root = this.root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var btnBack = rootMap["btnBack"];
        var slotMoney = rootMap["slotMoney"];
        var slotBless = rootMap["slotBless"];
        var nodeChar = this._nodeChar = rootMap["nodeChar"];
        var slotFriend = rootMap["slotFriend"];
        var brkBottom = this._brkBottom = rootMap["imgBrk"];
        var btnRefresh = this._btnRefresh = rootMap["btnRefresh"];
        var btnLog = rootMap["btnLog"];
        //var lblRefeshIn = this._lblRefeshIn = rootMap["lblRefeshIn"];
        //var lblTimesLeft = this._lblTimesLeft = rootMap["lblTimesLeft"];

        var sexTouchLayout = new ccui.Layout();
        sexTouchLayout.anchorX = sexTouchLayout.anchorY = 0.5;
        sexTouchLayout.width = 150;
        sexTouchLayout.height = 150;
        sexTouchLayout.y = 25;
        sexTouchLayout.registerTouchEvent(function () {
            sexTouchLayout.runAction(cc.callFunc(function () {
                sexTouchLayout.setEnabled(false);
            }));
            this._spineGirl.setAnimation(3, "touch", false);
        }.bind(this));
        var spineGirl = this._spineGirl = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_elfshop_json, res.spine_ui_elfshop_atlas, 0.25);
        spineGirl.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 1 ||
                trackEntry.trackIndex === 2 ||
                trackEntry.trackIndex === 3) {
                this._spineGirl.clearTrack(trackEntry.trackIndex);
                this._spineGirl.setAnimation(0, "idle", true);
                sexTouchLayout.setEnabled(true);
                this.lblTalkWelcome && this.lblTalkWelcome.setComplexString(this.buildWelcome(), mc.color.BROWN_SOFT);
            }
        }.bind(this));
        this._spineGirl.setAnimation(0, "idle", true);


        this._nodeChar.addChild(spineGirl);
        this._nodeChar.addChild(sexTouchLayout);

        this._SPRITE_MOVE = 300;
        this._nodeChar.x += this._SPRITE_MOVE;

        //this.traceDataChange(mc.GameData.itemStock, function () {
        //    var arrNewComingItem = mc.GameData.itemStock.popArrayNewComingItem();
        //    if (arrNewComingItem) {
        //        mc.view_utility.showNewComingItem(arrNewComingItem);
        //    }
        //}.bind(this));


        mc.view_utility.registerAssetTopBar(this, slotMoney, slotBless, slotFriend, btnBack, mc.const.ITEM_INDEX_RELIC_COIN);

        var shopId = this._currShopId = mc.ShopManager.SHOP_EGG;

        btnLog.setString(mc.dictionary.getGUIString("lblDetail"));
        btnLog.registerTouchEvent(function(){
            new mc.EggGameLogDialog().show();
        })

        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        btnRefresh.registerTouchEvent(function () {
            new mc.RefreshShopDialog(shopId, function () {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.refreshEggList(function (rs) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (rs) {
                        self._reloadListItem();
                        self._showShoppingList();
                    }
                });
            }).show();
        });

        var loadingId = mc.view_utility.showLoadingDialog();
        var self = this;

        mc.protocol.getEggList(function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (result) {
                //mc.protocol.beatEgg()
                this._eggListData = result.items;
                self._reloadListItem();
                //if (self._isScreenShow) {
                self._showShoppingList();
                //}
            }
        }.bind(this));

        var btnBack = rootMap["btnBack"];
        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        });
    },


    _reloadListItem: function () {
        var shopId = this._currShopId;
        var shopManager = mc.GameData.shopManager;
        //var items = this._eggListData;
        var items = shopManager.getShopItemByCategoryId(shopId);
        this._brkBottom.removeAllChildren();
        //this._lblRefeshIn.removeAllChildren();
        //this._lblTimesLeft.removeAllChildren();
        this._itemGrid = bb.layout.grid(bb.collection.createArray(items.length, function (index) {
            if (index < items.length) {
                var pack = items[index];
                var eggView = new mc.EggView(pack, function (result) {
                    if (result) {
                        this._spineGirl.setAnimation(1, "happy", false);
                        this.lblTalkWelcome.setComplexString(this.buildThank(), mc.color.BROWN_SOFT);
                        mc.view_utility.showNewComingItem(result.items, 0.7);
                    }
                    else {
                        this._spineGirl.setAnimation(2, "sorry", false);
                        this.lblTalkWelcome.setComplexString(this.buildSorry(), mc.color.BROWN_SOFT);
                    }
                }.bind(this));
                eggView.opacity = 0;
                return eggView;
            }
            return null;
        }.bind(this)), 3, this._brkBottom.width);
        this._itemGrid.x = this._brkBottom.width * 0.5;
        this._itemGrid.y = this._brkBottom.height * 0.438;
        this._brkBottom.addChild(this._itemGrid);

        //this._lblRefeshIn.setString(mc.dictionary.getGUIString("lblRefresh:"));
        //this._lblTimesLeft.setString(mc.dictionary.getGUIString("lblRefreshNo"));
        //this._lblTimesLeft.setDecoratorLabel("" + bb.utility.formatNumber(shopManager.getShopRefreshTicketNo(shopId)), mc.color.GREEN_NORMAL);
        var self = this;
        //var _updateTime = function () {
        //    var remainRefreshInMs = shopManager.getRemainShopRefreshDuration(shopId);
        //    if (remainRefreshInMs <= 0) {
        //        self._lblRefeshIn.stopAllActions();
        //        self._lblRefeshIn.runAction(cc.sequence([cc.delayTime(5.0), cc.callFunc(function () {
        //            var loadingId = mc.view_utility.showLoadingDialog();
        //            mc.protocol.requestItemShopByCategory(shopId, function () {
        //                mc.view_utility.hideLoadingDialogById(loadingId);
        //                self._reloadListItem();
        //                self._showShoppingList();
        //            }.bind(this));
        //        }.bind(this))]));
        //    }
        //    this._lblRefeshIn.setDecoratorLabel(mc.view_utility.formatDurationTime(remainRefreshInMs), mc.color.GREEN_NORMAL);
        //}.bind(this);
        //this._lblRefeshIn.stopAllActions();
        //this._lblRefeshIn.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(_updateTime)]).repeatForever());
        //_updateTime();
    },

    _showShoppingList: function () {
        if (!this._nodeChar._isWelcome) {
            this._nodeChar.runAction(cc.sequence([cc.moveBy(0.3, -this._SPRITE_MOVE, 0).easing(cc.easeBackOut()), cc.callFunc(function () {
                this._nodeChar._isWelcome = true;
                var popup = new ccui.ImageView("patch9/pnl_talkingbubble.png", ccui.Widget.PLIST_TEXTURE);
                popup.setScale9Enabled(true);
                popup.x = 389.04;
                popup.y = 1000;
                popup.width += 20;
                popup.anchorX = 0.78;
                popup.anchorY = 0;
                popup.scale = 0;
                var lblTalkWelcome = bb.framework.getGUIFactory().createText("Welcome to", res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_32);
                lblTalkWelcome.x = popup.width * 0.5;
                lblTalkWelcome.y = popup.height * 0.6;
                lblTalkWelcome.setScale(0.85);
                popup.addChild(lblTalkWelcome);
                lblTalkWelcome.setString("");
                lblTalkWelcome.setAnchorPoint(0.5, 0.5);


                this.lblTalkWelcome = mc.GUIFactory.applyComplexString(lblTalkWelcome, this.buildWelcome(), mc.color.BROWN_SOFT, res.font_UTMBienvenue_none_32_export_fnt);

                popup.runAction(cc.sequence([cc.scaleTo(0.2, 1.0, 1.0).easing(cc.easeBackOut()), cc.callFunc(function () {
                }.bind(this))]));
                this.addChild(popup);
            }.bind(this))]));
        }
        var arrShopItemView = this._itemGrid.getChildren();
        for (var i = 0; i < arrShopItemView.length; i++) {
            arrShopItemView[i].runAction(cc.sequence([cc.delayTime(0.15 + i * 0.1), cc.fadeIn(0.1)]));
        }
    },

    //onScreenShow: function () {
    //    this._isScreenShow = true;
    //    if (this._eggListData) { // if have data.
    //        this._showShoppingList();
    //    }
    //},


    _removeAllEgg: function () {
        var rows = 4;
        var cols = 3;
        for (var i = 0; i < rows; i++) {
            for (var j = 0; j < cols; j++) {
                var spin = this._mapEggNode[i][j].getChildByName("spingEgg");
                if (spin) {
                    spin.removeFromParent();
                }
            }
        }
    },

    buildWelcome: function () {
        var welcomeText = mc.dictionary.getGUIString("Welcome to");
        welcomeText += " #0000ff_" + mc.dictionary.getGUIString("lblEggGame") + "#";
        return welcomeText;
    },

    buildThank: function () {
        var arr = [mc.dictionary.getGUIString("Nice"), mc.dictionary.getGUIString("Oh Yeah")];
        var rand = Math.round((arr.length - 1) * Math.random());
        var text = arr[rand];
        return text;
    },

    buildSorry: function () {
        var arr = [mc.dictionary.getGUIString("Try again"), mc.dictionary.getGUIString("Oh No")];
        var rand = Math.round((arr.length - 1) * Math.random());
        var text = arr[rand];
        return text;
    },

    getScreenId: function () {
        return mc.GUIState.ID_SCREEN_EGG_GAME;
    }

});
mc.EggView = ccui.Widget.extend({

    ctor: function (eggInfo, callback) {
        this._super();
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = 100;
        this.height = 180;

        var priceItem = mc.ShopManager.getPriceItem(eggInfo);

        //var item = obj["item"];
        //var price = obj["price"];
        //var strItems = item.split('/');
        //var strPrices = obj["price"].split('/');
        //obj.product = mc.ItemStock.createJsonItemInfo(parseInt(strItems[0]), parseInt(strItems[1]));
        //obj.price = mc.ItemStock.createJsonItemInfo(parseInt(strPrices[0]), parseInt(strPrices[1]));

        var beated = mc.ShopManager.isBoughtItem(eggInfo);
        var saleOffValue = mc.ShopManager.getSaleOff(eggInfo);
        //var url = mc.ItemStock.getItemRes(productItem);
        //var imgItem = new ccui.ImageView(url,ccui.Widget.PLIST_TEXTURE);
        //var imgItem = new mc.ItemView(productItem);
        //imgItem.getQuantityLabel().setVisible(false);
        //imgItem.scale = 0.9;
        //imgItem.anchorY = 0;


        var eggNode = new cc.Node();
        eggNode.setUserData(eggInfo);
        this._initSpinEgg(eggNode, callback);
        eggNode.setName("eggNode");
        this.addChild(eggNode);

        //var lblQuantity = bb.framework.getGUIFactory().createText("x" + bb.utility.formatNumber(mc.ItemStock.getItemQuantity(productItem)));
        //lblQuantity.anchorX = 1;
        //this.addChild(lblQuantity);

        var brkMoney = new ccui.ImageView("patch9/pnl_shop_price.png", ccui.Widget.PLIST_TEXTURE);
        brkMoney.setCascadeOpacityEnabled(true);
        var assetView = mc.view_utility.createAssetView(priceItem);
        assetView.x = brkMoney.width * 0.5;
        assetView.y = brkMoney.height * 0.5;
        //priceItem.no = 0;
        if (mc.ItemStock.getItemIndex(priceItem) === mc.const.ITEM_INDEX_ZEN) {
            assetView.getChildByName("icon").scale = 0.7;
        }
        else if (mc.ItemStock.getItemIndex(priceItem) === mc.const.ITEM_INDEX_BLESS) {
            assetView.getChildByName("icon").scale = 0.7;
        }
        else {
            assetView.getChildByName("icon").scale = 0.4;
        }

        if (priceItem.no === 0) {
            assetView.getChildByName("lbl").setString("FREE");
            assetView.getChildByName("icon").x += 15;
        }

        brkMoney.addChild(assetView);

        if (saleOffValue) {
            assetView.x = brkMoney.width * 0.7;
            // var bg = new ccui.ImageView("patch9/pnl_maskname.png", ccui.Widget.PLIST_TEXTURE);
            var lblValX2 = bb.framework.getGUIFactory().createText(bb.utility.formatNumberKM(saleOffValue), res.font_cam_stroke_32_export_fnt);
            lblValX2.scale = 0.65;
            lblValX2.x = brkMoney.width * 0.3;
            lblValX2.y = brkMoney.height * 0.6;
            // bg.x = brkMoney.width * 0.2;
            // bg.y = brkMoney.height * 0.5;
            // brkMoney.addChild(bg);
            brkMoney.addChild(lblValX2);
            lblValX2.setString(bb.utility.formatNumberKM(saleOffValue));
            var line = new cc.DrawNode();
            line.drawSegment(cc.p(-lblValX2.width * lblValX2.getScale() / 2, 0), cc.p(lblValX2.width * lblValX2.getScale() / 2, 0), 2, mc.color.RED_SOFT);
            brkMoney.addChild(line);
            line.setPosition(lblValX2.x, lblValX2.y - 5);
        }

        this.addChild(brkMoney);
        var self = this;
        var _setBeated = function () {
            eggNode.spineEgg.setAnimation(7, "idle_broken", true);
            eggNode.clickView.setEnabled(false);
        }.bind(this);
        if (beated) {
            _setBeated();
        }

        brkMoney.x = this.width * 0.5;
        brkMoney.y = brkMoney.height * 0.5;
        eggNode.x = this.width * 0.5;
        eggNode.y = this.height * 0.25;
        this.setCascadeOpacityEnabled(true);
    },
    _initSpinEgg: function (node, callback) {
        var item = node.getUserData();
        var spinEgg = null; //sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_chest_json, res.spine_ui_chest_atlas, 1);
        if (item && item.item) {
            if (item.item === "1000") {
                spinEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1000_json, res.spine_ui_egg_1000_atlas, 0.1);
            }
            else if (item.item === "1001") {
                spinEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1001_json, res.spine_ui_egg_1001_atlas, 0.1);
            }
            else if (item.item === "1002") {
                spinEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1002_json, res.spine_ui_egg_1002_atlas, 0.1);
            }
            else {
                spinEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1003_json, res.spine_ui_egg_1003_atlas, 0.1);
            }
        }
        spinEgg.setName("spingEgg");
        var broken_gift = spinEgg.findAnimation("broken_gift");
        //broken_gift.duration = broken_gift.duration *0.5;
        var broken_fail = spinEgg.findAnimation("broken_fail");
        //broken_fail.duration = broken_fail.duration *0.5;
        var random = Math.random();
        if (random > 0.7) {
            random -= 0.25;
        }
        spinEgg.runAction(cc.sequence([cc.delayTime(random), cc.callFunc(function () {
            spinEgg.setAnimation(0, "idle", true);
        })]));

        spinEgg.y -= 15;
        var eggTouchLayout = new ccui.Layout();
        eggTouchLayout.anchorX = eggTouchLayout.anchorY = 0.5;
        eggTouchLayout.width = 150;
        eggTouchLayout.height = 150;
        eggTouchLayout.y = 25;
        var soundHit = "res/sound/ui/ui_egg_hit.mp3";
        var soundExplosion = "res/sound/ui/ui_egg_explosion.mp3";
        var soundGift = "res/sound/ui/ui_item_strengthen.mp3";
        spinEgg.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 1) {
                if(isBeating <= 1)
                {
                    spinEgg.runAction(cc.sound(soundHit));
                    isBeating = 2;
                }
                spinEgg.setAnimation(2, "attack2", false);
            }
            if (trackEntry.trackIndex === 2) {
                if(isBeating <= 2)
                {
                    spinEgg.runAction(cc.sound(soundHit));

                    isBeating = 3;

                }
                spinEgg.setAnimation(3, "attack3", true);
            }
            else if (trackEntry.trackIndex === 3) {
                var rs = spinEgg.rs;
                if (rs) {
                    isBeating = 0;
                    spinEgg.runAction(cc.callFunc(function () {

                        spinEgg.clearTracks();
                        spinEgg.setToSetupPose();
                        if (rs && rs["reward"]) {
                            if (rs["reward"].items && rs["reward"].items.length) {
                                spinEgg.setAnimation(4, "broken_gift", false);
                            }
                            else {
                                spinEgg.setAnimation(5, "broken_fail", false);
                            }
                            spinEgg.runAction(cc.sequence([cc.delayTime(spinEgg.findAnimation("broken_gift").duration*2/3),cc.callFunc(function(){
                                spinEgg.runAction(cc.sound(soundExplosion));
                            })]));


                        }
                    }));
                }
                //else
                //{
                //    bb.sound.playEffect("res/sound/effect/hit_punch12.mp3");
                //}
            }
            else if (trackEntry.trackIndex === 4) {
                var rs = spinEgg.rs;
                spinEgg.runAction(cc.callFunc(function () {
                    spinEgg.clearTrack(4);
                    spinEgg.setToSetupPose();
                    spinEgg.setAnimation(6, "idle_gift", true);
                    spinEgg.runAction(cc.sound(soundGift));
                }));
                callback && callback(rs.reward);
            }
            else if (trackEntry.trackIndex === 5) {
                spinEgg.runAction(cc.callFunc(function () {
                    spinEgg.clearTrack(5);
                    spinEgg.setToSetupPose();
                    spinEgg.setAnimation(7, "idle_broken", true);
                }));

                callback && callback(false);
            }

        }.bind(this));

        eggTouchLayout.registerTouchEvent(function () {


            var beatFunc = function(){
                eggTouchLayout.runAction(cc.callFunc(function () {
                    eggTouchLayout.setEnabled(false);
                }));
                if (item.price.no <= mc.GameData.playerInfo.getRelicCoin()) {

                    spinEgg.runAction(cc.callFunc(function () {
                        spinEgg.clearTracks();
                        if(!isBeating)
                        {
                            spinEgg.runAction(cc.sound(soundHit));
                        }
                        isBeating = 1;
                        spinEgg.setAnimation(1, "attack1", false);
                    }));
                }
                else {
                    eggTouchLayout.runAction(cc.callFunc(function () {
                        eggTouchLayout.setEnabled(true);
                    }));
                }
                mc.protocol.beatEgg(item.item, item.index, function (rs) {
                    spinEgg.rs = rs;
                }.bind(this));
                if(!mc.storage.eggGameLog)
                {
                    mc.storage.eggGameLog = {};
                }
                if(!mc.storage.eggGameLog["time"])
                {
                    mc.storage.eggGameLog["time"] = {start : bb.now(), end : bb.now()};
                }
                var cost = mc.storage.eggGameLog["cost"];
                if(!cost)
                {
                    cost = {};
                }
                if(!cost[item.item])
                {
                    var priceItem = mc.ShopManager.getPriceItem(item);
                    cost[item.item] = { price : priceItem , amount : 0, type : item.item};
                }
                cost[item.item].amount +=1 ;
                mc.storage.eggGameLog["cost"] = cost;
                mc.storage.eggGameLog["time"]["end"] = bb.now();
            };


            var isShow = mc.view_utility.showSuggestBuyItemSlotsIfAny();
            if (!isShow) {
                if (mc.storage.confirmEggGame && mc.storage.confirmEggGame[item.item]) {
                    beatFunc();
                }
                else {
                    var msg = mc.dictionary.getGUIString("confirmEggGame") + item.price.no + " Relic!";
                    var dialog = new mc.DefaultDialog()
                        .setTitle(mc.dictionary.getGUIString("lblWarning"))
                        .setMessage(msg)
                        .enableOkButton(function () {
                            beatFunc();
                            if(!mc.storage.confirmEggGame)
                            {
                                mc.storage.confirmEggGame = {};
                            }
                            mc.storage.confirmEggGame[item.item] = true ;
                            //mc.storage.saveConfirmEggGame();
                            dialog.close();
                        }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                    dialog.show();
                }
            }



        }.bind(this));
        node.addChild(spinEgg);
        node.addChild(eggTouchLayout);
        node.spineEgg = spinEgg;
        node.clickView = eggTouchLayout;
        return node;
    },

});