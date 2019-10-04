/**
 * Created by long.nguyen on 10/4/2017.
 */
mc.RelicArenaLayer = mc.LoadingLayer.extend({

    ctor: function () {
        this._super();


        var root = this._root = this.parseCCStudio(res.layer_arena_relic);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelArena = rootMap["panelArena"];
        var nodeTicket = rootMap["nodeTicket"];

        var btnEnter = this._btnEnter = rootMap["btnEnter"];
        var btnCreate = this._btnCreate = rootMap["btnCreate"];

        var btnRecord = this._btnRecord = rootMap["btnRecord"];
        var btnRanking = rootMap["btnRanking"];
        var btnWaitingAccept = this._btnWaitingAccept = rootMap["btnWaitingAccept"];

        var nodeBrk = rootMap["nodeBrk"];

        var arenaMap = bb.utility.arrayToMap(panelArena.getChildren(), function (child) {
            return child.getName();
        });

        this._iconRank = arenaMap["iconRank"];
        var imgRankName = this._imgRankName = arenaMap["imgRankName"];
        mc.view_utility.setNotifyIconForWidget(imgRankName, true, 0.5, 1);


        //var iconRelic = arenaMap["iconRelic"];
        //iconRelic.loadTexture("res/png/consumable/reliccoins.png",ccui.Widget.LOCAL_TEXTURE);
        //iconRelic.scale = 1;

        var imgRankTouch = arenaMap["rankTouch"];
        var lblInfo = arenaMap["lblInfo"];
        lblInfo.setString(mc.dictionary.getGUIString("lblInfo"));

        var lblWin = arenaMap["lblWin"];
        lblWin.setString(mc.dictionary.getGUIString("lblWin"));
        var lblNumWin = this._lblNumWin = arenaMap["lblNumWin"];


        var lblLose = arenaMap["lblLose"];
        lblLose.setString(mc.dictionary.getGUIString("lblLose"));
        var lblNumLose = this._lblNumLose = arenaMap["lblNumLose"];

        var lblRelic = arenaMap["lblRelic"];
        lblRelic.setString(mc.dictionary.getGUIString("lblRelic"));
        var lblNumCoin = this._lblNumCoin = arenaMap["lblNumCoin"];

        var lblDes = arenaMap["lblDes"];
        lblDes.setString(mc.dictionary.getGUIString("lblDescription"));

        var lvlDescrContent = this._lvlDescrContent = arenaMap["lvlContent"];
        var lblContentRow = this._lblContentRow = arenaMap["lblContent"];


        var btnShop = arenaMap["btnShop"];
        var imgRelic = btnShop.getChildByName("img");
        //imgRelic.loadTexture("res/png/consumable/reliccoins.png",ccui.Widget.LOCAL_TEXTURE);
        //imgRelic.scale = 1.5;
        var lblShop = btnShop.setString(mc.dictionary.getGUIString("lblShop"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblShop.x = btnShop.width * 0.5;
        lblShop.y = btnShop.height * 0.55;
        lblShop.setScale(0.6);

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblRelicArena"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        lblWin.setColor(mc.color.BROWN_SOFT);
        lblLose.setColor(mc.color.BROWN_SOFT);
        lblRelic.setColor(mc.color.BROWN_SOFT);

        lblNumWin.setColor(mc.color.BROWN_SOFT);
        lblNumLose.setColor(mc.color.BROWN_SOFT);
        lblNumCoin.setColor(mc.color.BROWN_SOFT);

        lblInfo.setColor(mc.color.BROWN_SOFT);
        lblDes.setColor(mc.color.BROWN_SOFT);

        var sprBrk = new ccui.ImageView("res/png/brk/arena1.png", ccui.Widget.LOCAL_TEXTURE);
        sprBrk.anchorY = 0.0;
        sprBrk.scale = 1.35;
        nodeBrk.addChild(sprBrk);

        imgRankName.setString(mc.dictionary.getGUIString("lblLegend"), res.font_UTMBienvenue_none_32_export_fnt);
        var lbl = btnRecord.setString(mc.dictionary.getGUIString("lblRecord"), res.font_UTMBienvenue_none_32_export_fnt);
        lbl.x = btnRecord.width * 0.64;
        lbl.y += 3;
        lbl.scale = 0.7;
        var lbl = btnRanking.setString(mc.dictionary.getGUIString("lblRanking"), res.font_UTMBienvenue_none_32_export_fnt);
        lbl.x = btnRecord.width * 0.64;
        lbl.y += 3;
        lbl.scale = 0.7;
        var lbl = btnWaitingAccept.setString(mc.dictionary.getGUIString("lblJoinerList"), res.font_UTMBienvenue_none_32_export_fnt);
        lbl.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lbl.x = btnRecord.width * 0.64;
        lbl.y += 3;
        lbl.scale = 0.7;
        var lblSearch = btnEnter.setString(mc.dictionary.getGUIString("lblSearch"));
        lblSearch.scale = 1;
        lblSearch.x = btnEnter.width * 0.5;
        lblSearch.y = btnEnter.height * 0.6;

        var lblCreate = btnCreate.setString(mc.dictionary.getGUIString("lblCreate"));
        lblCreate.scale = 0.75;
        lblCreate.x = btnCreate.width * 0.5;
        lblCreate.y = btnCreate.height * 0.6;

        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = btnEnter.width * 0.5;
        particle.y = btnEnter.height * 0.5;
        btnEnter.addChild(particle);


        //var priceInfo = mc.ItemStock.createJsonItemZen(mc.const.SEARCH_ARENA_OPPONENT_GOLD);
        //nodeTicket.addChild(mc.view_utility.createAssetView(priceInfo));
        //nodeTicket.setVisible(false);


        var self = this;
        btnEnter.registerTouchEvent(function () {
            mc.GameData.guiState.reloadRelicArenaVSDlg = true;
            this._searchOpp();
        }.bind(this));
        btnRecord.registerTouchEvent(function () {
            self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_RELIC_ARENA_RECORD);
        });
        btnRanking.registerTouchEvent(function () {
            self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA_RANKING);
        });
        btnShop.registerTouchEvent(function () {
            mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_RELIC);
        });

        btnCreate.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_CREATE_RELIC_MATCH);
        }.bind(this));

        //btnDefenseTeam.setGray(true);
        btnWaitingAccept.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_JOINER_LIST_RELIC_ARENA);
        }.bind(this));


        //imgRankTouch.registerTouchEvent(function () {
        //    self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA_REWARDS);
        //});

    },

    _searchOpp: function () {

        var loadingId = mc.view_utility.showLoadingDialog();
        mc.protocol.findMatchInRelicArena(function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (result) {
                this._showDialogVS();
            }
        }.bind(this));
    },


    _showDialogVS: function () {
        new mc.RelicArenaVSDialog().show();
    },

    onLayerShow: function () {
        //this._super();
        //var arrStackDialogData = mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN);
        //if (arrStackDialogData.length > 0) {
        //    for (var i = 0; i < arrStackDialogData.length; i++) {
        //        var dialogData = arrStackDialogData[i];
        //        if (dialogData.id === mc.GUIState.ID_DIALOG_VS) {
        //            self._showDialogVS();
        //        }
        //    }
        //}
        if (mc.GameData.guiState.reloadRelicArenaVSDlg) {
            this._searchOpp();
        }
    },
    //
    //onLayerClose: function () {
    //    var allDialog = bb.director.getAllDialog();
    //    for (var i = 0; i < allDialog.length; i++) {
    //        var dialog = allDialog[i];
    //        if (dialog instanceof mc.DialogVS) {
    //            mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_VS, null);
    //        }
    //    }
    //},


    onLoading: function () {
        this.scheduleOnce(function () {

                mc.protocol.getRelicArenaInfo(function (data) {
                    if (data) {
                        this.performDone();
                    }
                }.bind(this));

        }.bind(this), 0.0001);
        this.performDone();
    },

    //_updateShieldTime: function () {
    //    var durShield = mc.GameData.arenaManager.getShieldTime() - bb.now();
    //    durShield > 0 && (this._lblShieldTime.setString(mc.view_utility.formatDurationTime(durShield)));
    //    this._nodeShield.setVisible(durShield > 0);
    //},

    onLoadDone: function () {
        var relicArenaManager = mc.GameData.relicArenaManager;
        if(this._lblNumWin)
        {
            this._lblNumWin.setString(relicArenaManager.getArenaWinNo());
        }
        if(this._lblNumLose)
        {
            this._lblNumLose.setString(relicArenaManager.getArenaLoseNo());
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_RELIC_ARENA;
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