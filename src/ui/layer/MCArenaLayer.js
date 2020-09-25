/**
 * Created by long.nguyen on 10/4/2017.
 */

mc.ArenaLayer = mc.LoadingLayer.extend({

    ctor: function () {
        this._super();

        mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_ATTACK_ARENA);

        var root = this._root = this.parseCCStudio(res.layer_arena);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var panelArena = rootMap["panelArena"];
        var nodeTicket = rootMap["nodeTicket"];
        var btnEnter = this._btnEnter = rootMap["btnEnter"];
        var btnRecord = this._btnRecord = rootMap["btnRecord"];
        var btnRanking = rootMap["btnRanking"];
        var btnDefenseTeam = this._btnDefenseTeam = rootMap["btnEditTeam"];
        var nodeBrk = rootMap["nodeBrk"];
        var btnInfo = rootMap["btnInfo"];


        mc.storage.readRankRewardTouched();

        var arenaMap = bb.utility.arrayToMap(panelArena.getChildren(), function (child) {
            return child.getName();
        });

        this._iconRank = arenaMap["iconRank"];
        var imgRankName = this._imgRankName = arenaMap["imgRankName"];

        mc.view_utility.setNotifyIconForWidget(imgRankName, !mc.storage.rankRewardTouched, 0.95,0.95);

        var imgRankTouch = arenaMap["rankTouch"];
        var lblWin = arenaMap["lblWin"];
        lblWin.setString(mc.dictionary.getGUIString("lblWin"));
        var lblCurrRank = arenaMap["lblCurrRank"];
        lblCurrRank.setString(mc.dictionary.getGUIString("lblCurrRank"));
        var nodeShield = this._nodeShield = arenaMap["nodeShield"];
        var lblNumWin = this._lblNumWin = arenaMap["lblNumWin"];
        var lblPoint = arenaMap["lblPoint"];
        lblPoint.setString(mc.dictionary.getGUIString("lblPoint"));
        var lblNumPoint = this._lblNumPoint = arenaMap["lblNumPoint"];
        var lblCoin = arenaMap["lblCoin"];
        lblCoin.setString(mc.dictionary.getGUIString("lblCoin"));
        var lblNumCoin = this._lblNumCoin = arenaMap["lblNumCoin"];
        var lblYourTeam = arenaMap["lblYourTeam"];
        lblYourTeam.setString(mc.dictionary.getGUIString("lblArenaAttackTeam"));
        var nodeHero = this._nodeHero = arenaMap["nodeHero"];
        var lblLeaderSkillInfo = this._lblLeaderSkillInfo = arenaMap["lblLeaderSkillInfo"];
        var btnShop = arenaMap["btnShop"];
        var lblShop = btnShop.setString(mc.dictionary.getGUIString("lblExchange"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblShop.x = btnShop.width * 0.625;
        lblShop.y = btnShop.height * 0.55;
        lblShop.setScale(0.6);


        var nodeSkill = this._nodeSkill = arenaMap["nodeSkill"];
        var lblTeamPower = this._lblTeamPower = arenaMap["lblTeamPower"];

        if(mc.enableReplaceFontBM())
        {
            lblCurrRank = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblCurrRank);
            lblWin = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblWin);
            lblNumWin = this._lblNumWin = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblNumWin);
            lblPoint = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPoint);
            lblNumPoint = this._lblNumPoint = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblNumPoint);
            lblCoin = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblCoin);
            lblNumCoin = this._lblNumCoin = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblNumCoin);
            lblTeamPower = this._lblTeamPower = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblTeamPower);
            lblYourTeam = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblYourTeam);
            lblLeaderSkillInfo = this._lblLeaderSkillInfo = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLeaderSkillInfo);
        }

        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblArena"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        lblNumWin.setColor(mc.color.BROWN_SOFT);
        lblWin.setColor(mc.color.BROWN_SOFT);
        lblPoint.setColor(mc.color.BROWN_SOFT);
        lblNumPoint.setColor(mc.color.BROWN_SOFT);
        lblCoin.setColor(mc.color.BROWN_SOFT);
        lblNumCoin.setColor(mc.color.BROWN_SOFT);
        lblCurrRank.setColor(mc.color.BROWN_SOFT);
        lblYourTeam.setColor(mc.color.BROWN_SOFT);
        lblLeaderSkillInfo.setColor(mc.color.BROWN_SOFT);
        lblTeamPower.setColor(mc.color.BROWN_SOFT);
        nodeHero.scale = 0.94;

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
        var lbl = btnDefenseTeam.setString(mc.dictionary.getGUIString("lblDefenseTeam"), res.font_UTMBienvenue_none_32_export_fnt);
        lbl.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        lbl.x = btnRecord.width * 0.64;
        lbl.y += 3;
        lbl.scale = 0.7;
        var lblSearch = btnEnter.setString(mc.dictionary.getGUIString("lblSearch"));
        lblSearch.scale = 1;
        lblSearch.x = btnEnter.width * 0.575;
        lblSearch.y = btnEnter.height * 0.5;

        var particle = new cc.ParticleSystem(res.particle_button_stargrow_plist);
        particle.x = btnEnter.width * 0.5;
        particle.y = btnEnter.height * 0.5;
        btnEnter.addChild(particle);

        var priceInfo = mc.ItemStock.createJsonItemZen(mc.const.SEARCH_ARENA_OPPONENT_GOLD);
        nodeTicket.addChild(mc.view_utility.createAssetView(priceInfo));

        var self = this;
        var _searchOpp = function (data) {
            var isShow = mc.view_utility.showExchangingIfAny(priceInfo);
            if (!isShow) {
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.searchArenaOpponent(function (data) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (data) {
                        self._showDialogVS();
                    }
                });
            }
        };
        btnEnter.registerTouchEvent(function () {
            _searchOpp();
        });
        btnRecord.registerTouchEvent(function () {
            self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA_RECORD);
        });
        btnRanking.registerTouchEvent(function () {
            self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA_RANKING);
        });
        btnShop.registerTouchEvent(function () {
            mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_ARENA);
        });
        btnDefenseTeam.registerTouchEvent(function () {
            mc.storage.needUpdateDefArenaTeam = "ok";
            mc.storage.saveNeedUpdateDefArenaTeam();
            mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_DEFENSE_ARENA);
            mc.GUIFactory.showEditFormationScreen();
        });
        imgRankTouch.registerTouchEvent(function () {
            mc.storage.rankRewardTouched = true;
            mc.storage.saveRankRewardTouched();
            mc.view_utility.setNotifyIconForWidget(imgRankName, !mc.storage.rankRewardTouched, 0.95,0.95);
            self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA_REWARDS);
        });
        btnInfo.registerTouchEvent(function(){
            self.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_ARENA_REWARDS);
        });

        if(mc.const.ARENA_NPC_ENABLE){
            btnInfo.runAction(cc.sequence([cc.delayTime(2), cc.callFunc(function () {
                _searchOpp();
            }.bind(this))]));
        }
    },

    _showDialogVS: function () {
        new mc.ArenaVSDialog().show();
    },

    onLayerShow: function () {
        var self = this;
        var arrStackDialogData = mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN);
        if (arrStackDialogData.length > 0) {
            for (var i = 0; i < arrStackDialogData.length; i++) {
                var dialogData = arrStackDialogData[i];
                if (dialogData.id === mc.GUIState.ID_DIALOG_VS) {
                    self._showDialogVS();
                }
            }
        }
    },

    onLayerClose: function () {
        var allDialog = bb.director.getAllDialog();
        for (var i = 0; i < allDialog.length; i++) {
            var dialog = allDialog[i];
            if (dialog instanceof mc.DialogVS) {
                mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_VS, null);
            }
        }
    },

    onTriggerTutorial: function () {
        var tutorialTrigger = mc.GameData.tutorialManager.getTutorialTriggerScript(mc.TutorialManager.LAYER_ARENA);
        if (tutorialTrigger) {
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_HERO_WIDGET) {
                var widget = this._nodeHero.getChildren()[0].getChildren()[2];
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(widget)
                    .setScaleHole(1.5)
                    .show();
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnEnter)
                    .setScaleHole(1.5)
                    .show();
            }
            if (tutorialTrigger.trigger === mc.TutorialManager.CLICK_SUBMIT_BUTTON_2) {
                new mc.LayerTutorial(tutorialTrigger)
                    .setTargetWidget(this._btnDefenseTeam)
                    .setScaleHole(1.5)
                    .setCharPositionY(cc.winSize.height * 0.5)
                    .show();
            }
        }
    },

    onLoading: function () {
        this.scheduleOnce(function () {
            var arenaManager = mc.GameData.arenaManager;
            if (arenaManager.isChange()) {
                mc.protocol.joinArena(function (data) {
                    if (data) {
                        this.performDone();
                    }
                }.bind(this));
            }
            else {
                this.performDone();
            }
        }.bind(this), 0.0001);
    },

    _updateShieldTime: function () {
        var durShield = mc.GameData.arenaManager.getShieldTime() - bb.now();
        durShield > 0 && (this._lblShieldTime.setString(mc.view_utility.formatDurationTime(durShield)));
        this._nodeShield.setVisible(durShield > 0);
    },

    onLoadDone: function () {
        var arenaManager = mc.GameData.arenaManager;
        var playerInfo = mc.GameData.playerInfo;
        if (arenaManager.getShieldTime() > 0) {
            this._nodeShield.setVisible(true);
            var layoutShield = this._nodeShield.getChildByName("layoutShield");
            if (!layoutShield) {
                var lblShield = this._lblShieldTime = bb.framework.getGUIFactory().createText("", res.font_UTMBienvenue_none_32_export_fnt);
                lblShield.setColor(mc.color.BROWN_SOFT);
                this._updateShieldTime();
                var layoutShield = bb.layout.linear([new cc.Sprite("#icon/ico_shield.png"), lblShield], 10);
                lblShield.y += 7;
                layoutShield.setName("layoutShield");
                this._nodeShield.addChild(layoutShield);
            }
            if (this._lblShieldTime) {
                this._lblShieldTime.stopAllActions();
                this._lblShieldTime.runAction(cc.sequence([cc.delayTime(1.0), cc.callFunc(this._updateShieldTime.bind(this))]).repeatForever());
            }
        }
        else {
            this._nodeShield.setVisible(false);
        }
        mc.storage.readNeedUpdateDefArenaTeam();
        if(mc.storage.needUpdateDefArenaTeam && mc.storage.needUpdateDefArenaTeam != "ok")
        {
            var timeDuration = 0.3;
            mc.view_utility.setNotifyIconForWidget(this._btnDefenseTeam,true,0.96,0.96);
            this._btnDefenseTeam.runAction(cc.sequence([cc.moveBy(timeDuration, 0, 10), cc.moveBy(timeDuration, 0, -10)]).repeatForever());
        }
        this._lblNumWin.setString(bb.utility.formatNumber(arenaManager.getArenaWinNo()));
        this._lblNumPoint.setString(bb.utility.formatNumber(arenaManager.getArenaWinPoint()));
        this._lblNumCoin.setString(bb.utility.formatNumber(playerInfo.getArenaCoins()));
        cc.log("League: " + playerInfo.getLeague());
        var leagueInfo = mc.const.MAP_LEAGUE_BY_CODE[playerInfo.getLeague()];
        this._iconRank.loadTexture(leagueInfo.url, ccui.Widget.PLIST_TEXTURE);
        this._imgRankName.setString(leagueInfo.name);

        var self = this;
        var heroStock = mc.GameData.heroStock;
        var teamFormationManager = mc.GameData.teamFormationManager;
        var teamId = mc.GameData.guiState.getCurrentEditFormationTeamId();
        var teamIndex = mc.GameData.guiState.getCurrentEditFormationTeamIndex();
        var dataTeam = {
            arrTeamFormation: teamFormationManager.getTeamFormationByIndex(teamId, teamIndex),
            leaderIndex: teamFormationManager.getLeaderFormationByIndex(teamId, teamIndex),
            mapHeroInfo: heroStock.getHeroMap()
        };
        mc.view_utility.layoutTeamFormation(dataTeam, {
            nodeHero: self._nodeHero,
            lblLeaderSkillInfo: this._lblLeaderSkillInfo,
            showNotifyIfNotHero : true
        });
        this._lblTeamPower.setString(bb.utility.formatNumber(Math.round(mc.HeroStock.getBattlePowerForTeamId(teamId, teamIndex))));
        this._lblLeaderSkillInfo.setColor(mc.color.BROWN_SOFT);
        var leaderHeroId = dataTeam.arrTeamFormation[dataTeam.leaderIndex];
        var leaderSkill = null;
        if (leaderHeroId != -1) {
            leaderSkill = mc.HeroStock.getHeroLeaderSkill(mc.GameData.heroStock.getHeroById(leaderHeroId));

        }
        var imgSkill = null;
        if (leaderSkill) {
            imgSkill = mc.view_utility.createSkillInfoIcon(leaderSkill);
        }
        else {
            imgSkill = new cc.Sprite("#patch9/pnl_lockedskillslot.png");
        }
        this._nodeSkill.addChild(imgSkill);

        var notifySystem = mc.GameData.notifySystem;
        var _updateNotifyForWidget = function () {
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(this._btnRecord, notifySystem.doHaveArenaBattleLog(), 0.8);
        }.bind(this);

        _updateNotifyForWidget();
        this.traceDataChange(notifySystem, function () {
            _updateNotifyForWidget();
        });
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_ARENA;
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