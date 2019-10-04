/**
 * Created by long.nguyen on 4/5/2018.
 */

var flagDir = "UI_Asset_Flag/ico_flag/colour_base/";
var flags = ["guildflag_green.png", "guildflag_mix1.png", "guildflag_purple.png", "guildflag_red.png"];
var iconDir = "UI_Asset_Flag/ico_flag/symbol/";
var icons = ["symbol_1.png", "symbol_2.png", "symbol_3.png", "symbol_4.png"];
var tabId = {TAB_MEM: 1, TAB_DONATE: 2, TAB_LOG: 3};

mc.GuildSearchLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();
        var root = this.parseCCStudio(parseNode || res.layer_guild_search);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var lblTitle = brkTitle.setString(mc.dictionary.getGUIString("lblSearchGuild"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var createGuild = rootMap["create_guild"];
        var cell = this.cell = rootMap["cell"];
        cell.setVisible(false);
        createGuild.setVisible(false);
        var btnSearch = rootMap["btnSearch"];
        var btnCreate = rootMap["btnCreate"];
        var btnRefresh = rootMap["btnRefresh"];
        btnRefresh.setString(mc.dictionary.getGUIString("lblRefresh"));
        var lvlGuildList = this.lvlGuildList = rootMap["lvlGuildList"];
        var lblEmpty = this.lblEmpty = rootMap["lblEmpty"];
        lvlGuildList.setVisible(false);
        lblEmpty.setVisible(false);
        btnRefresh.setVisible(false);
        btnRefresh.registerTouchEvent(function () {
            mc.protocol.guildList(function (result) {
                this.bindGuildList(result);
            }.bind(this));
        }.bind(this));
        var onBtnSearch = function () {
            btnCreate.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnSearch.loadTexture("icon/tab_on.png", ccui.Widget.PLIST_TEXTURE);
            btnRefresh.setVisible(true);
            lvlGuildList.setVisible(true);
            createGuild.setVisible(false);
            lblEmpty.setVisible(true);
            if (mc.GameData.guiState.getGuildCreateState().suggestGuilds) {
                this.bindGuildList(mc.GameData.guiState.getGuildCreateState().suggestGuilds);
            } else {
                mc.protocol.guildList(function (result) {
                    this.bindGuildList(result);
                }.bind(this));
            }
            // new mc.SearchGuildDialog(function () {
            // }.bind(this)).show();
        }.bind(this);
        btnSearch.registerTouchEvent(onBtnSearch.bind(this));
        var onBtnCreate = function () {
            btnSearch.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnCreate.loadTexture("icon/tab_on.png", ccui.Widget.PLIST_TEXTURE);
            btnRefresh.setVisible(false);
            lvlGuildList.setVisible(false);
            createGuild.setVisible(true);
            lblEmpty.setVisible(false);
        };
        btnCreate.registerTouchEvent(onBtnCreate.bind(this));
        this.bindCreateNode(createGuild);
        onBtnCreate();
        //this.traceDataChange(mc.GameData.guildManager, function () {
        //    if (mc.GameData.guildManager.isAcceptJoin()) {
        //        mc.protocol.checkGuildStatus(function (result) {
        //            if (result) {
        //                if (mc.GameData.guildManager.getGuildInfo()) {
        //                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_MANAGER);
        //                }
        //            }
        //        }.bind(this));
        //    }
        //}.bind(this));
        this._getRequestedJoinGuild();
    },

    _getRequestedJoinGuild: function () {
        mc.protocol.getRequestedJoinGuildList(function (result) {
            if (result) {
                return true;
            }
        })
    },

    onEnterTransitionDidFinish: function () {
        this._super();
        if (mc.GameData.guildManager.getGuildInfo()) {
            this.getMainScreen().popLayer();
        }
    },

    bindGuildList: function (guildList) {
        this.lvlGuildList.removeAllChildren();

        if (guildList.length > 0) {
            this.lblEmpty.setVisible(false);
            guildList.sort(function (a, b) {
                return a.level - b.level;
            })
        } else {
            this.lblEmpty.setVisible(true);
            this.lblEmpty.setString(mc.dictionary.getGUIString("No Result"));
        }

        var array = bb.collection.createArray(guildList.length, function (index) {
            var cell = this.cell.clone();
            this.bindGuildInfoCell(cell, guildList[index]);
            cell.setVisible(true);
            return cell;
        }.bind(this));
        var layout = bb.layout.linear(array, 0, bb.layout.LINEAR_VERTICAL);
        this.lvlGuildList.pushBackCustomItem(layout);
    },

    bindGuildInfoCell: function (cell, info) {
        var rootMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        var name = rootMap["lblName"];
        var member = rootMap["lblMember"];
        var level = rootMap["lblLv"];
        var pnlCup = rootMap["pnlCup"];
        var lblOwner = rootMap["lblOwner"];
        var points = pnlCup.getChildByName("lblPoints");
        var btnInfo = rootMap["btnInfo"];
        var btnJoin = rootMap["btnJoin"];
        var flag = rootMap["flag"];
        var flag_icon = rootMap["flag_icon"];
        lblOwner.setVisible(false);


        name.setString(info["name"] || "?????");
        member.setString(info["memberNo"] + "/" + info["maxMemberNo"]);
        flag.loadTexture(flagDir + flags[info["flag"]], ccui.Widget.PLIST_TEXTURE);
        flag_icon.loadTexture(iconDir + icons[info["logo"]], ccui.Widget.PLIST_TEXTURE);
        level.setString(mc.dictionary.getGUIString("Level") + " " + info["level"]);
        points.setString(bb.utility.formatNumber(info["arenaPoint"]));
        lblOwner.setString(info["ownerName"]);


        name.setColor(mc.color.BROWN_SOFT);
        member.setColor(mc.color.BROWN_SOFT);
        level.setColor(mc.color.BROWN_SOFT);
        lblOwner.setColor(mc.color.BROWN_SOFT);

        btnJoin.setString(mc.dictionary.getGUIString("lblJoin"));
        btnInfo.setString(mc.dictionary.getGUIString("lblInfo"));

        if (mc.GameData.guildManager.getGuildInfo()) {
            btnJoin.setVisible(false);
        }
        else {
            btnJoin.setVisible(true);
            var requestedJoin = mc.GameData.guildManager.getRequestedJoinGuild();
            if (requestedJoin) {
                for (var i = 0; i < requestedJoin.length; i++) {
                    var req = requestedJoin[i];
                    if (info["id"] === req["id"]) {
                        var lbl = btnJoin.setString(mc.dictionary.getGUIString("lblResend"));
                        lbl.setColor(mc.color.YELLOW_ELEMENT)
                        break;
                    }
                }
            }

            btnJoin.registerTouchEvent(function () {
                mc.protocol.requestJoinGuild(function (result) {
                    this._getRequestedJoinGuild();
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("Send Request Success"));
                    btnJoin.setGray(true);
                }.bind(this), info["id"])
            }.bind(this));
        }

        btnInfo.registerTouchEvent(function () {
            //mc.view_utility.showComingSoon();
            var dialog = new mc.GuildPopupInfoDialog(info);
            //dialog.set
            dialog.setJoinButtonVisible(false);
            dialog.show();

        }.bind(this));

    },

    bindCreateNode: function (node) {
        var rootMap = bb.utility.arrayToMap(node.getChildren(), function (child) {
            return child.getName();
        });
        var lblIcon = rootMap["lblIcon"];
        var bgIcon = rootMap["iconBg"];
        var lblName = rootMap["lblName"];
        var lblNameNote = rootMap["lblNameNote"];
        var nameInput = rootMap["nameInput"];
        var level = rootMap["lblLevel"];
        var rank = rootMap["lblRank"];
        var level_require = rootMap["require_level"];
        var rank_require = rootMap["require_rank"];
        var lblDesc = rootMap["lblDesc"];
        var lblDescNote = rootMap["lblDescNote"];
        var descInput = rootMap["descInput"];
        var lblRequirement = rootMap["lblRequire"];
        var lblRequirementAccLevel = rootMap["lblRequireLevelAcc"];
        var btnCreate = this.btnCreate = rootMap["btnCreate"];
        var nodeAsset = rootMap["node_asset"];
        lblRequirementAccLevel.setString(mc.dictionary.getGUIString("txtRequireAccLv") + mc.GameData.guildManager.getRequireLevelCreate());
        lblRequirementAccLevel.setVisible(mc.GameData.playerInfo.getLevel() < mc.GameData.guildManager.getRequireLevelCreate());

        btnCreate.setString(mc.dictionary.getGUIString("Create Guild"));

        var arrRecipeCost = mc.ItemStock.createArrJsonItemFromStr(mc.GameData.guildManager.getRequireAssetCreate());
        var assetView = bb.layout.linear(bb.collection.createArray(arrRecipeCost.length, function (index) {
            var recipeCost = arrRecipeCost[index];
            var costView = mc.view_utility.createAssetView(recipeCost);
            if (mc.ItemStock.isNotEnoughCost(recipeCost)) {
                costView.getChildByName("lbl").setColor(mc.color.RED);
            }
            return costView;
        }), 10, bb.layout.LINEAR_HORIZONTAL, true);

        nodeAsset.addChild(assetView);

        var flag = bgIcon.getChildByName("flag");
        var flag_icon = bgIcon.getChildByName("flag_icon");
        var btnChange = bgIcon.getChildByName("btn_change");
        var lblRule = bgIcon.getChildByName("lblRule");
        lblRule.setColor(mc.color.BROWN_SOFT);
        var join_rule = bgIcon.getChildByName("join_rule");

        //btnChange.setString(mc.dictionary.getGUIString("lblChange"));
        var lblChange = btnChange.getChildByName("lbl");
        lblChange.setString(mc.dictionary.getGUIString("lblChange"));
        lblRule.setString(mc.dictionary.getGUIString("lblRuleJoin"));

        var flagData = mc.GameData.guiState.getGuildCreateState().flag;
        flag.loadTexture(flagDir + flags[flagData["base"]], ccui.Widget.PLIST_TEXTURE);
        flag_icon.loadTexture(iconDir + icons[flagData["icon"]], ccui.Widget.PLIST_TEXTURE);

        lblIcon.setString(mc.dictionary.getGUIString("Guild Flag"));
        lblName.setString(mc.dictionary.getGUIString("Guild Name"));
        lblNameNote.setString(mc.dictionary.getGUIString("Guild Name note"));
        lblDesc.setString(mc.dictionary.getGUIString("Guild Desc"));
        lblDescNote.setString(mc.dictionary.getGUIString("Guild Desc note"));
        lblRequirement.setString(mc.dictionary.getGUIString("Requirement"));
        level.setString(mc.dictionary.getGUIString("lblLevelMin"));
        rank.setString(mc.dictionary.getGUIString("lblRankMin"));
        lblIcon.setColor(mc.color.BROWN_SOFT);
        lblName.setColor(mc.color.BROWN_SOFT);
        lblDesc.setColor(mc.color.BROWN_SOFT);
        lblRequirement.setColor(mc.color.BROWN_SOFT);
        lblDescNote.setColor(mc.color.ORANGE_TEXT);
        lblNameNote.setColor(mc.color.ORANGE_TEXT);

        var comboBoxRank = new mc.ComboBox("", rank_require);
        var arenaDict = mc.dictionary.arenaDictionary;
        comboBoxRank.setDataSource(arenaDict.dataRank,
            arenaDict.mapLeague[mc.GameData.guiState.getGuildCreateState().minRank].index || 0,
            function (cbBox, index) {
                mc.GameData.guiState.getGuildCreateState().minRank = arenaDict.mapRank[index].league;
            }.bind(this));
        node.addChild(comboBoxRank);
        comboBoxRank.setPosition(rank_require.x, rank_require.y);
        var comboBoxLevel = new mc.ComboBox("", level_require);
        var dataLevel = bb.collection.createArray(100, function (index) {
            return index + 1;
        });
        var dataLevelCode = bb.collection.createArray(100, function (index) {
            return {index: index, level: index + 1};
        });

        var mapLevelIndex = bb.utility.arrayToMap(dataLevelCode, function (child) {
            return child.index;
        });
        var mapLevelCode = bb.utility.arrayToMap(dataLevelCode, function (child) {
            return child.level;
        });

        comboBoxLevel.setDataSource(dataLevel,
            mapLevelCode[mc.GameData.guiState.getGuildCreateState().minLevel].index || 0,
            function (cbBox, index) {
                mc.GameData.guiState.getGuildCreateState().minLevel = mapLevelIndex[index].level;
            }.bind(this));
        node.addChild(comboBoxLevel);
        comboBoxLevel.setPosition(level_require.x, level_require.y);

        var comboBoxJoinRule = new mc.ComboBox("", join_rule);
        comboBoxJoinRule.setDataSource([mc.dictionary.getGUIString("Accept All"), mc.dictionary.getGUIString("Invite Only")],
            mc.GameData.guiState.getGuildCreateState().joinRule || 0,
            function (cbBox, index) {
                mc.GameData.guiState.getGuildCreateState().joinRule = index;
            }.bind(this));
        bgIcon.addChild(comboBoxJoinRule);
        comboBoxJoinRule.setPosition(join_rule.x, join_rule.y);
        var anchor = {x: 0, y: 0};
        this.txtName = mc.view_utility.createTextFieldWithPadding(nameInput, 15, anchor, this.onTextChange.bind(this));
        this.txtDesc = mc.view_utility.createTextFieldWithPadding(descInput, 15, anchor, this.onTextChange.bind(this));
        this.btnCreate.setGray(true);
        this.txtDesc.setMaxLength(100);
        this.txtDesc.setInputMode(cc.EDITBOX_INPUT_MODE_ANY);
        this.txtName.setMaxLength(16);
        this.txtName.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE || cc.EDITBOX_INPUT_MODE_ANY);
        this.txtName.setFontColor(mc.color.GRAY);
        this.txtDesc.setFontColor(mc.color.GRAY);

        if (mc.GameData.guiState.getGuildCreateState().guildName) {
            this.txtName.setString(mc.GameData.guiState.getGuildCreateState().guildName);
        }
        if (mc.GameData.guiState.getGuildCreateState().guildDesc) {
            this.txtDesc.setString(mc.GameData.guiState.getGuildCreateState().guildDesc);
        }

        this.onTextChange();

        btnChange.registerTouchEvent(this.onBtnChange.bind(this));
        flag.registerTouchEvent(this.onBtnChange.bind(this));
        btnCreate.registerTouchEvent(function () {
            mc.GameData.guiState.getGuildCreateState().guildName = this.txtName.getString();
            mc.GameData.guiState.getGuildCreateState().guildDesc = this.txtDesc.getString();
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.guildCreate(function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_MANAGER);
                }
            }.bind(this));
        }.bind(this));
    },

    onBtnChange: function () {
        mc.GameData.guiState.getGuildCreateState().guildName = this.txtName.getString();
        mc.GameData.guiState.getGuildCreateState().guildDesc = this.txtDesc.getString();
        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_FLAG);
    },

    parseArenaLeagueRewards: function (json) {
        var result = {};
        if (cc.isString(json)) {
            json = JSON.parse(json);
        }
        var leagueList = json["leagueList"];
        if (leagueList) {
            for (var j in leagueList) {
                var league = leagueList[j];
                if (!result[league["league"]]) {
                    result[league["league"]] = {league: league["league"], listGroupRewards: []};
                }
                result[league["league"]].info = league;
            }
        }
        return result;
    },

    onTextChange: function () {
        var text1 = this.txtName.getString();
        var text2 = this.txtDesc.getString();
        this.btnCreate.setGray(text1 === "" || text1.length < 5 || text2 === "" || text2.length <= 3);
    },

    //bindCell: function (cell) {
    //    var rootMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
    //        return child.getName();
    //    });
    //    var name = rootMap["lblName"];
    //    var member = rootMap["lblMember"];
    //    var power = rootMap["lblPower"];
    //    var btnJoin = rootMap["btnJoin"];
    //    var btnInfo = rootMap["btnInfo"];
    //    var iconFlag = rootMap["icon_flag"];
    //    name.setColor(mc.color.BROWN_SOFT);
    //    member.setColor(mc.color.BROWN_SOFT);
    //    power.setColor(mc.color.BROWN_SOFT);
    //    btnInfo.setString(mc.dictionary.getGUIString("lblInfo"));
    //    btnJoin.setString(mc.dictionary.getGUIString("lblJoin"));
    //    btnInfo.registerTouchEvent(function () {
    //
    //    });
    //    btnJoin.registerTouchEvent(function () {
    //
    //    });
    //},

    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_SEARCH;
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

mc.GuildManagerLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_guild_home);
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        this.updateAssetList = [];

        var nodeBrk = rootMap["nodeBrk"];
        var imageView = new ccui.ImageView("res/brk/bg_mail.png", ccui.Widget.LOCAL_TEXTURE);
        nodeBrk.addChild(imageView);
        var imgTitle = rootMap["imgTitle"];
        var btnChat = rootMap['btnChat'];
        var btnSearchGuild = rootMap['btnSearch'];
        btnSearchGuild.setVisible(true);

        var chatSystem = mc.GameData.chatSystem;
        var _updateNotifyWidget = function () {
            mc.view_utility.setNotifyIconForWidget(btnChat, mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_CLAN_ID), 0.8);
        };
        _updateNotifyWidget();
        this.traceDataChange(chatSystem, function () {
            _updateNotifyWidget();
        });

        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblGuild"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);
        var onBtnChat = function () {
            mc.view_utility.setNotifyIconForWidget(btnChat, 0, 0.8);
            mc.GameData.guiState.setCurrentGroupChatId(mc.ChatSystem.GROUP_CHAT_CLAN_ID);
            mc.ChatDialog.showChat();
        };

        var onBtnSearchGuild = function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_SEARCH_MORE);
        }

        var bg = this._bg = rootMap["bg"];
        this.listBg = rootMap["listBg"];
        this.lvlMember = rootMap["lvlMember"];
        this.lvlLog = rootMap["lvlLog"];
        this.lvlDonate = rootMap["lvlDonate"];
        var cell = this.cell = rootMap["cell"];
        cell.setVisible(false);
        var cellDonate = this.cellDonate = rootMap["cell_donate"];
        cellDonate.setVisible(false);

        var cellRequest = this._cellRequest = rootMap["cell_request"];
        var cellDonateCell = this._cellDonateInfo = rootMap["cell_donate_info"];
        cellRequest.setVisible(false);
        cellDonateCell.setVisible(false);
        this.bindBG(bg);
        btnChat.registerTouchEvent(onBtnChat.bind(this));
        btnSearchGuild.registerTouchEvent(onBtnSearchGuild.bind(this));

        this.traceDataChange(mc.GameData.guildManager, function () {
            if (mc.GameData.guildManager.kickOutMember === mc.GameData.playerInfo.getId()) {
                mc.GameData.guildManager.kickOutMember = null;
                mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("You has been kick out from Guild"), function () {
                    this.getMainScreen().popLayer();
                }.bind(this)).show();
                return;
            }
            this.lvlMember.removeAllChildren();
            //this.bindRequestList(this.lvlMember);
            this.bindRequestCell(this.lvlMember, this._cellRequest);
            this.bindMemberList(this.lvlMember);
            this.bindLogsList(this.lvlLog);
            this.updateDonate();

            var myInfo = mc.GameData.guildManager.getMyInfo();
            if (myInfo) {
                if (myInfo["role"] === BANG_CHU) {
                    this.btnEdit.setVisible(true);
                    this.btnLeave.setVisible(false);
                } else {
                    this.btnEdit.setVisible(false);
                    this.btnLeave.setVisible(true);
                }
            }

            var info = mc.GameData.guildManager;
            this.guildName.setString(info.getName() || "?????");
            //this.lblMember.setString(info.getMemberNo() + "/" + info.getMaxMemberNo());
            this._bindMemNo();
            this.flag.loadTexture(flagDir + flags[info.getFlag()], ccui.Widget.PLIST_TEXTURE);
            this.flag_icon.loadTexture(iconDir + icons[info.getLogo()], ccui.Widget.PLIST_TEXTURE);
            this.lblSlogan.setString(info.getDesc() || "?????");

            var guildInfoElement = info.getGuildInfo()["guildReqs"] || {};
            this.rankRequire.setString(mc.dictionary.arenaDictionary.mapLeague[guildInfoElement.rank || "D"].name);
            this.levelRequire.setString(guildInfoElement.level || "1");
            this.guildID = info.getGuildId();
            this.lblId.setString(this.guildID);
            this.joinType.setString(mc.dictionary.getGUIString("Accept All"));

        }.bind(this));
    },

    _bindMemNo: function () {
        var info = mc.GameData.guildManager;
        this.lblMember.setString(info.getMemberNo() + "/" + info.getMaxMemberNo());
        //if(info.getMemberNo() >= info.getMaxMemberNo())
        //{
        //    this.lblMember.setColor(mc.color.RED_SOFT);
        //}
        //else
        //{
        //    this.lblMember.setColor(mc.color.GREEN_NORMAL);
        //}
        //this.lblMember.setDecoratorLabel(, mc.color.BROWN_SOFT);
    },

    updateDonate: function () {
        for (var i in this.updateAssetList) {
            var view = this.updateAssetList[i];
            view.updateAsset && view.updateAsset();
        }
        var myRule = mc.GameData.guildManager.getMyInfo()["role"];
        this.btnUpgradeGuild.setVisible(myRule === BANG_CHU || myRule === PHO_BANG);
    },

    bindBG: function (bg) {
        var rootMap = this._rootMap = bb.utility.arrayToMap(bg.getChildren(), function (child) {
            return child.getName();
        });
        var flag = this.flag = rootMap["flag"];
        var flag_icon = this.flag_icon = rootMap["flag_icon"];
        var guildName = this.guildName = rootMap["guild_name"];
        var guildMamber = this.lblMember = rootMap["guild_member"];

        var btnMember = rootMap["btnMember"];
        var btnShop = rootMap["btn_shop"];
        var btnLog = rootMap["btn_log"];
        var btnDonate = rootMap["btn_donate"];
        var btnBoss = rootMap["btn_boss"];

        var lblBtnMember = btnMember.getChildByName("lbl");
        var lblBtnBoss = btnBoss.getChildByName("lbl");
        var lblBtnDonate = btnDonate.getChildByName("lbl");
        var lblBtnShop = btnShop.getChildByName("lbl");
        var lblBtnLog = btnLog.getChildByName("lbl");




        var panel_home = rootMap["panel_home"];
        var panel_donate = rootMap["panel_donate"];

        var donateMap = bb.utility.arrayToMap(panel_donate.getChildren(), function (child) {
            return child.getName();
        });
        var homeMap = bb.utility.arrayToMap(panel_home.getChildren(), function (child) {
            return child.getName();
        });

        var btnLeave = this.btnLeave = homeMap["btn_leave"];
        var btnEdit = this.btnEdit = homeMap["btn_edit"];
        this.btnEditIcon = btnEdit.getChildByName("icon");
        var btnCheckin = this.btnCheckin = homeMap["btn_checkin"];
        var lblCheckin = this.lblCheckIn = btnCheckin.setString(mc.dictionary.getGUIString("Checkin"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        var lblEdit = this.lblEdit = btnEdit.setString(mc.dictionary.getGUIString("Change"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);

        if(mc.enableReplaceFontBM())
        {
            var fontSize = 20;
            this.lblCheckIn.setFontSize(fontSize);
            this.lblEdit.setFontSize(fontSize);
            lblBtnMember = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblBtnMember);
            lblBtnBoss = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblBtnBoss);
            lblBtnDonate = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblBtnDonate);
            lblBtnShop = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblBtnShop);
            lblBtnLog = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblBtnLog);
            guildMamber = this.lblMember = mc.view_utility.replaceBitmapFontAndApplyTextStyle(guildMamber);
            guildMamber.setFontSize(fontSize);
        }

        lblBtnMember.setString(mc.dictionary.getGUIString("Member"));
        lblBtnBoss.setString(mc.dictionary.getGUIString("Boss"));
        lblBtnDonate.setString(mc.dictionary.getGUIString("Donate"));
        lblBtnShop.setString(mc.dictionary.getGUIString("Shop"));
        lblBtnLog.setString(mc.dictionary.getGUIString("Log"));

        lblEdit.x = btnEdit.width * 0.55;
        lblCheckin.x = btnCheckin.width * 0.55;
        lblEdit.y = btnEdit.height * 0.65;
        lblCheckin.y = btnCheckin.height * 0.65;

        this.btnEdit.loadTexture("button/btn_change.png", ccui.Widget.PLIST_TEXTURE);
        this.btnEditIcon.loadTexture("icon/Setting.png", ccui.Widget.PLIST_TEXTURE);


        var myInfo = mc.GameData.guildManager.getMyInfo();
        if (myInfo) {
            if (myInfo["role"] === BANG_CHU) {
                this.btnEdit.setVisible(true);
                this.btnLeave.setVisible(false);
            } else {
                this.btnEdit.setVisible(false);
                this.btnLeave.setVisible(true);
            }
        }

        var btnUpgrade = this.btnUpgradeGuild = donateMap["btn_upgrade"];
        var lblLevel = donateMap["lbl_level"];
        var lvlRes = donateMap["lvlRes"];
        var itemRes = donateMap["itemRes"];


        itemRes.setVisible(false);
        var levelGuild = mc.GameData.guildManager.getLevel();
        lblLevel.setString(mc.dictionary.getGUIString("lblLevel") + " " + levelGuild);
        if(mc.enableReplaceFontBM())
        {
            lblLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLevel);
        }
        lblLevel.setColor(mc.color.BROWN_SOFT);
        btnUpgrade.setString(mc.dictionary.getGUIString("lblUpgrade"));
        btnUpgrade.registerTouchEvent(function () {
            mc.protocol.guildUpgrade(function () {
            }.bind(this));
        });

        var self = this;

        var guildNextLevelInfo = mc.GameData.guildManager.getGuildLevel(levelGuild + 1);

        if (guildNextLevelInfo) {
            var arrRewards = mc.ItemStock.createArrJsonItemFromStr(guildNextLevelInfo["reqItems"]);
            var assetView = bb.layout.linear(bb.collection.createArray(arrRewards.length, function (index) {
                var recipeCost = arrRewards[index];
                var view = itemRes.clone();
                view.setVisible(true);

                var quantity = mc.ItemStock.getItemQuantity(recipeCost);

                var url = null;
                var scale = 1;
                var opt = ccui.Widget.LOCAL_TEXTURE;
                if (mc.ItemStock.getItemIndex(recipeCost) === mc.const.ITEM_INDEX_ZEN) {
                    url = "icon/coin.png";
                    opt = ccui.Widget.PLIST_TEXTURE;
                    scale = 0.8;
                }
                else if (mc.ItemStock.getItemIndex(recipeCost) === mc.const.ITEM_INDEX_BLESS) {
                    url = "icon/bless.png";
                    scale = 0.8;
                    opt = ccui.Widget.PLIST_TEXTURE;
                }
                else if (mc.ItemStock.getItemIndex(recipeCost) === mc.const.ITEM_INDEX_FRIEND_POINTS) {
                    url = "icon/heart.png";
                    scale = 0.8;
                    opt = ccui.Widget.PLIST_TEXTURE;
                }
                else {
                    url = mc.ItemStock.getItemRes(recipeCost);
                }

                var icon = view.getChildByName("icon");
                icon.loadTexture(url, opt);
                icon.setScale(icon.getScale() * scale);
                var lblCur = view.getChildByName("lblCur");
                var lblMax = view.getChildByName("lblMax");
                if(mc.enableReplaceFontBM())
                {
                    lblCur = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblCur);
                    lblMax = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblMax);
                    lblCur.y -= 3;
                    lblMax.y -= 3;
                    var fSize = 20;
                    lblCur.setFontSize(fSize);
                    lblMax.setFontSize(fSize);
                }

                lblCur._assetIndex = recipeCost["index"];
                view.updateAsset = function () {
                    lblCur.setString(bb.utility.formatNumber(mc.GameData.guildManager.getGuildDonateAsset(lblCur._assetIndex)));
                    if (mc.GameData.guildManager.getGuildDonateAsset(lblCur._assetIndex) < quantity) {
                        lblCur.setColor(mc.color.RED);
                    }
                    else {
                        lblCur.setColor(mc.color.GREEN_NORMAL);
                    }
                    lblMax.setString(bb.utility.formatNumber(quantity));
                };
                view.updateAsset();
                self.updateAssetList.push(view);
                return view;
            }), 12, bb.layout.LINEAR_VERTICAL, true);
            lvlRes.pushBackCustomItem(assetView);
        } else {
            btnUpgrade.setVisible(false);
        }


        var slogan = homeMap["slogan"];
        var requireLevel = homeMap["require_level"];
        var level = this.levelRequire = homeMap["lbl_level"];
        var requireRank = homeMap["require_rank"];
        var rank = this.rankRequire = homeMap["rank"];
        var guildId = homeMap["guild_id"];
        var lblId = this.lblId = homeMap["lblId"];
        var lblJoinType = this.lblJoinType = homeMap["lblJoinType"];
        var joinType = this.joinType = homeMap["joinType"];

        if(mc.enableReplaceFontBM())
        {
            guildName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(guildName);
            requireLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(requireLevel);
            level = this.levelRequire = mc.view_utility.replaceBitmapFontAndApplyTextStyle(level);
            requireRank = mc.view_utility.replaceBitmapFontAndApplyTextStyle(requireRank);
            rank  = this.rankRequire = mc.view_utility.replaceBitmapFontAndApplyTextStyle(rank);
            guildId = mc.view_utility.replaceBitmapFontAndApplyTextStyle(guildId);
            lblId = this.lblId = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblId);
            lblJoinType = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblJoinType);
            joinType = this.joinType = mc.view_utility.replaceBitmapFontAndApplyTextStyle(joinType);
        }

        guildName.setColor(mc.color.ORANGE_TEXT);
        guildMamber.setColor(mc.color.BROWN_SOFT);
        requireLevel.setColor(mc.color.BROWN_SOFT);
        requireRank.setColor(mc.color.BROWN_SOFT);
        rank.setColor(mc.color.BROWN_SOFT);
        level.setColor(mc.color.BROWN_SOFT);
        guildId.setColor(mc.color.BROWN_SOFT);
        lblId.setColor(mc.color.BROWN_SOFT);
        lblJoinType.setColor(mc.color.BROWN_SOFT);
        joinType.setColor(mc.color.BROWN_SOFT);


        var onBtnLeave = function () {
            var myInfo = mc.GameData.guildManager.getMyInfo();
            if (!myInfo) {
                this.getMainScreen().popLayer();
                return;
            }
            mc.GUIFactory.confirm(mc.dictionary.getGUIString("Confirm Leave Guild"), function () {
                mc.protocol.leaveGuild(function (result) {
                    if (result) {
                        this.getMainScreen().popLayer();
                    }
                }.bind(this));
            }.bind(this), function () {

            }.bind(this));
        }.bind(this);
        var onBtnEdit = function () {
            //var myInfo = mc.GameData.guildManager.getMyInfo();
            //if (!myInfo) {
            //    this.getMainScreen().popLayer();
            //    return;
            //}
            //if (myInfo) {
            //    if (myInfo["role"] === BANG_CHU) {
            //        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_EDIT);
            //    }
            //    // mc.view_utility.showComingSoon();
            //}
            mc.view_utility.showComingSoon();
        }.bind(this);
        var onBtnBoss = function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_BOSS);
        }.bind(this);
        var onBtnShop = function () {
            mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_GUILD);
        }.bind(this);
        var onBtnLog = function () {
            panel_home.setVisible(true);
            panel_donate.setVisible(false);
            btnLog.loadTexture("icon/tab_on.png", ccui.Widget.PLIST_TEXTURE);
            btnMember.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnBoss.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnDonate.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            this.listBg.setVisible(true);
            this.lvlLog.setVisible(true);
            this.lvlMember.setVisible(false);
            this.lvlDonate.setVisible(false);
            this.bindLogsList(this.lvlLog);
            mc.GameData.guiState._guildHomeTab = tabId.TAB_LOG;
        }.bind(this);
        var onBtnMember = function () {
            panel_home.setVisible(true);
            panel_donate.setVisible(false);
            btnMember.loadTexture("icon/tab_on.png", ccui.Widget.PLIST_TEXTURE);
            btnBoss.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnLog.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnDonate.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            this.listBg.setVisible(false);
            this.lvlMember.setVisible(true);
            this.lvlLog.setVisible(false);
            this.lvlDonate.setVisible(false);
            this.lvlMember.removeAllChildren();
            //this.bindRequestList(this.lvlMember);
            this.bindRequestCell(this.lvlMember);
            this.bindMemberList(this.lvlMember);
            mc.GameData.guiState._guildHomeTab = tabId.TAB_MEM;
        }.bind(this);
        var onBtnDonate = function () {
            panel_home.setVisible(false);
            panel_donate.setVisible(true);
            btnDonate.loadTexture("icon/tab_on.png", ccui.Widget.PLIST_TEXTURE);
            btnBoss.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnMember.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnLog.loadTexture("icon/tab_normal.png", ccui.Widget.PLIST_TEXTURE);
            this.listBg.setVisible(false);
            this.lvlMember.setVisible(false);
            this.lvlLog.setVisible(false);
            this.lvlDonate.setVisible(true);
            this.lvlDonate.removeAllChildren();
            this.bindDonationCell(this.lvlDonate);
            this.bindDonateList(this.lvlDonate);
            this.updateDonate();
            mc.GameData.guiState._guildHomeTab = tabId.TAB_DONATE;
        }.bind(this);

        var updateCurrTab = function () {
            switch (mc.GameData.guiState._guildHomeTab) {
                case tabId.TAB_DONATE :
                    onBtnDonate();
                    break;
                case tabId.TAB_LOG :
                    onBtnLog();
                    break;
                default :
                    onBtnMember();
                    break;
            }
        }.bind(this);
        btnLeave.registerTouchEvent(onBtnLeave.bind(this));
        btnEdit.registerTouchEvent(onBtnEdit.bind(this));
        btnLog.registerTouchEvent(onBtnLog.bind(this));
        btnShop.registerTouchEvent(onBtnShop.bind(this));
        btnBoss.registerTouchEvent(onBtnBoss.bind(this));
        btnMember.registerTouchEvent(onBtnMember.bind(this));
        btnDonate.registerTouchEvent(onBtnDonate.bind(this));

        var info = mc.GameData.guildManager;

        guildName.setString(info.getName() || "?????");
        //guildMamber.setString(info.getMemberNo() + "/" + info.getMaxMemberNo());
        this._bindMemNo();
        flag.loadTexture(flagDir + flags[info.getFlag()], ccui.Widget.PLIST_TEXTURE);
        flag_icon.loadTexture(iconDir + icons[info.getLogo()], ccui.Widget.PLIST_TEXTURE);
        var lblSlogan = this.lblSlogan = slogan.getChildByName("lbl");
        lblSlogan.setString(info.getDesc() || "?????");
        lblSlogan.setColor(mc.color.BROWN_SOFT);

        requireLevel.setString(mc.dictionary.getGUIString("Require Level"));
        requireRank.setString(mc.dictionary.getGUIString("Require Rank"));
        guildId.setString(mc.dictionary.getGUIString("Guild ID"));
        lblJoinType.setString(mc.dictionary.getGUIString("lblRuleJoin"));
        var guildInfoElement = info.getGuildInfo()["guildReqs"] || {};
        rank.setString(mc.dictionary.arenaDictionary.mapLeague[guildInfoElement.rank || "D"].name);
        level.setString(guildInfoElement.level || "1");
        this.guildID = info.getGuildId();
        lblId.setString(this.guildID);
        joinType.setString(mc.dictionary.getGUIString("Accept All"));

        updateCurrTab();
        //onBtnMember();
    },


    bindMemberList: function (listView) {
        var createList = function (members) {
            members.sort(function (a, b) {
                return rolePoint(b["role"]) - rolePoint(a["role"]);
            });
            var totalCheckin = 0;
            var array = bb.collection.createArray(members.length, function (index) {
                var cell = this.cell.clone();
                this.bindMemberInfoCell(cell, members[index]);
                cell.setVisible(true);
                if (members[index]["isCheckIn"]) {
                    totalCheckin++;
                }
                return cell;
            }.bind(this));
            this.updateCheckinLbl(totalCheckin);
            var layout = bb.layout.linear(array, 0, bb.layout.LINEAR_VERTICAL);
            listView.pushBackCustomItem(layout);
        }.bind(this);
        if (mc.GameData.guildManager.getMembers()) {
            createList(mc.GameData.guildManager.getMembers());
        } else {
            mc.protocol.listGuildMember(function (result) {
                if (result) {
                    createList(mc.GameData.guildManager.getMembers());
                }
            }.bind(this), this.guildID);
        }
    },

    updateCheckinLbl: function (total) {
        var levelGuild = mc.GameData.guildManager.getLevel();
        var guildLevelInfo = mc.GameData.guildManager.getGuildLevel(levelGuild);
        var myInfo = mc.GameData.guildManager.getMyInfo();
        if (myInfo) {
            if (total >= guildLevelInfo["checkinRequireNo"]) {
                var claimCheckin = myInfo["claimedCheckIn"];
                this.btnCheckin.setGray(claimCheckin);
                if (!claimCheckin) {
                    this.lblCheckIn.setString(mc.dictionary.getGUIString("Claim"));
                    this.btnCheckin.registerTouchEvent(function () {
                        mc.protocol.guildCheckinRewards(function () {
                        });
                    }.bind(this));
                    mc.view_utility.setNotifyIconForWidget(this.btnCheckin, true, 1);
                } else {
                    this.lblCheckIn.setString(mc.dictionary.getGUIString("Claimed"));
                    mc.view_utility.setNotifyIconForWidget(this.btnCheckin, false, 1);
                }
            } else {
                this.lblCheckIn.setString(mc.dictionary.getGUIString("Checkin") + " " + total + "/" + guildLevelInfo["checkinRequireNo"]);
                this.btnCheckin.setGray(myInfo["isCheckIn"]);
                this.btnCheckin.registerTouchEvent(function () {
                    //mc.protocol.guildCheckin(function () {
                    //});
                    var dialog = new mc.GuildBossRewardByCheckInDialog(guildLevelInfo["checkinRewards"], false);
                    dialog.show();
                }.bind(this));
                mc.view_utility.setNotifyIconForWidget(this.btnCheckin, !myInfo["isCheckIn"], 1);
            }
        }
    },

    bindLogsList: function (listView) {
        listView.removeAllChildren();
        var createList = function (members) {
            members.sort(function (a, b) {
                return a["logTimeMilis"] - b["logTimeMilis"]
            });

            var array = bb.collection.createArray(members.length, function (index) {
                var cell = mc.GUIFactory.createComplexString(bb.utility.stringBreakLines(this.buildMsg(members[index]), 15, listView.width * (2 - 0.75)), mc.color.WHITE_NORMAL, res.font_cam_stroke_32_export_fnt);
                // this.bindMemberInfoCell(cell, members[index], 2);
                cell.setVisible(true);
                cell.setScale(0.75);
                return cell;
            }.bind(this));
            var layout = bb.layout.linear(array, 0, bb.layout.LINEAR_VERTICAL);
            listView.pushBackCustomItem(layout);
        }.bind(this);
        if (mc.GameData.guildManager.getLogs()) {
            createList(mc.GameData.guildManager.getLogs());
        } else {
            mc.protocol.guildGetLogs(function (result) {
                if (result) {
                    createList(mc.GameData.guildManager.getLogs());
                }
            }.bind(this), this.guildID);
        }
    },

    buildMsg: function (log) {
        var result = "";
        var date = new Date(log["logTimeMilis"]);
        result += "[" + date.getHours() + ":" + date.getMinutes() + "]  ";
        var array = log["properties"];
        result += cc.formatStr(mc.dictionary.getI18nMsg(log["content"]), array[0] || "", array[1] || "", array[2] || "", array[3] || "");
        result += "\n";
        return result;
    },

    bindDonateList: function (listView) {

        var createList = function (donates) {
            var array = bb.collection.createArray(donates.length, function (index) {
                var cell = this.cellDonate.clone();
                this.bindDonateInfoCell(cell, donates[index]);
                cell.setVisible(true);
                return cell;
            }.bind(this));
            var layout = bb.layout.linear(array, 0, bb.layout.LINEAR_VERTICAL);
            listView.pushBackCustomItem(layout);
        }.bind(this);
        createList(mc.GameData.guildManager.getDonates());
    },

    bindRequestCell: function (listView) {
        if (mc.GameData.guildManager.getRequests() && mc.GameData.guildManager.getRequests().length > 0) {
            //createList(mc.GameData.guildManager.getRequests());
            var cell = this._cellRequest.clone();
            cell.setCascadeOpacityEnabled(true);
            cell.setVisible(true);
            var lblRequestText = cell.getChildByName("lblRequestInfo");
            var btnView = cell.getChildByName("btnViewMore");
            if(mc.enableReplaceFontBM())
            {
                lblRequestText = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRequestText);
                var lblBtnView = btnView.setString(mc.dictionary.getGUIString("View"));
                lblBtnView.setFontSize(34);
            }
            else
            {
                btnView.setString(mc.dictionary.getGUIString("View"));
            }

            lblRequestText.setColor(mc.color.BROWN_SOFT);
            btnView.registerTouchEvent(function () {
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_REQUEST_JOIN);
            }.bind(this));
            lblRequestText.setString(cc.formatStr(mc.dictionary.getGUIString("Request join clan"), mc.GameData.guildManager.getRequests().length));
            //mc.view_utility.setNotifyIconForWidget(btnView, true,1);
            listView.pushBackCustomItem(cell);
        } else {
            mc.protocol.listJoinRequest(function (result) {
                if (result && mc.GameData.guildManager.getRequests() && mc.GameData.guildManager.getRequests().length) {
                    var cell = this._cellRequest.clone();
                    cell.setCascadeOpacityEnabled(true);
                    cell.setVisible(true);
                    var lblRequestText = cell.getChildByName("lblRequestInfo");
                    var btnView = cell.getChildByName("btnViewMore");
                    if(mc.enableReplaceFontBM())
                    {
                        lblRequestText = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblRequestText);
                        var lblBtnView = btnView.setString(mc.dictionary.getGUIString("View"));
                        lblBtnView.setFontSize(34);
                    }
                    else
                    {
                        btnView.setString(mc.dictionary.getGUIString("View"));
                    }

                    lblRequestText.setColor(mc.color.BROWN_SOFT);
                    btnView.registerTouchEvent(function () {
                        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_REQUEST_JOIN);
                    }.bind(this));
                    lblRequestText.setString(cc.formatStr(mc.dictionary.getGUIString("Request join clan"), mc.GameData.guildManager.getRequests().length));
                    //mc.view_utility.setNotifyIconForWidget(btnView, true,1);
                    listView.pushBackCustomItem(cell);
                }
            }.bind(this), this.guildID);
        }
    },

    bindDonationCell: function (listView) {
        var cell = this._cellDonateInfo.clone();
        cell.setCascadeOpacityEnabled(true);
        cell.setVisible(true);
        var lblInfo = cell.getChildByName("lblInfo");
        if(mc.enableReplaceFontBM())
        {
            lblInfo = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblInfo);
        }
        lblInfo.setColor(mc.color.BROWN_SOFT);
        var btnView = cell.getChildByName("btnViewMore");
        btnView.getChildByName("lbl").setString(mc.dictionary.getGUIString("lblDetail"));
        btnView.registerTouchEvent(function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.getGuildDontionInfo(function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                var layer = this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_DONATE_INFO);
                if (result && result.donateList && result.donateList.length) {
                    layer.setData(result);
                }
                else {
                    layer.setData();
                }

            }.bind(this));


        }.bind(this));
        //mc.view_utility.setNotifyIconForWidget(btnView, true,1);
        lblInfo.setString(mc.dictionary.getGUIString("Together donate to the mighty clan"));
        listView.pushBackCustomItem(cell);

    },

    bindDonateInfoCell: function (cell, info) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        cell.setVisible(true);

        var lblLevel = cellMap["lblLvl"];
        var btnAccept = cellMap["btnAccept"];

        btnAccept._backupColor = btnAccept.getColor();
        var lbl = btnAccept.getChildByName("lbl");
        //btnAccept.setString(mc.dictionary.getGUIString("Donate"));
        lbl.setString(mc.dictionary.getGUIString("Donate"));
        lbl._backupColor = lbl.getColor();
        btnAccept.setBlack = function (value) {
            if (value) {
                btnAccept.setColor(mc.color.BLACK_DISABLE_STRONG);
                lbl.setColor(mc.color.BLACK_DISABLE_STRONG);
                btnAccept.setEnabled(false);
            }
            else {
                btnAccept.setColor(btnAccept._backupColor);
                lbl.setColor(lbl._backupColor);
                btnAccept.setEnabled(true);
            }
        };

        btnAccept.registerTouchEvent(function (btnAccept) {
            var loadingId = mc.view_utility.showLoadingDialog(5);
            mc.protocol.guildDonate(function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
            }.bind(this), info["itemIndex"])
        }.bind(this));

        var itemView = new mc.ItemView(mc.ItemStock.createJsonItemByStr(info["donateItem"]));
        itemView.scale = 0.85;
        itemView.registerViewItemInfo();
        cell.addChild(itemView);

        var itemViewRewards = new mc.ItemView(mc.ItemStock.createJsonItemByStr(info["reward"]));
        itemViewRewards.scale = 0.85;
        itemViewRewards.registerViewItemInfo();
        cell.addChild(itemViewRewards);
        itemView.setPosition(cell.width * 0.25, cell.height / 2);
        itemViewRewards.setPosition(cell.width * 0.55, cell.height / 2);

        cell._assetIndex = info["itemIndex"];
        cell.updateAsset = function () {
            var maxDonateTime = mc.GameData.playerInfo.isVIP() ? parseInt(mc.dictionary.getVipFunctionValue(mc.const.VIP_FUNCTION_DONATE_CLAN_MAX_TIMES)) : info["maxDonateTimes"];
            var myDonateTime = mc.GameData.guildManager.getMyDonateTime(cell._assetIndex);
            if(mc.enableReplaceFontBM())
            {
                lblLevel = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLevel);
            }
            lblLevel.setString(myDonateTime + "/" + maxDonateTime);
            if (myDonateTime >= maxDonateTime ) {
                lblLevel.setColor(mc.color.RED_SOFT);
                //btnAccept.setGray(true);
                btnAccept.setBlack(true);
            } else {
                lblLevel.setColor(mc.color.BROWN_SOFT);
                //btnAccept.setGray(false);
                btnAccept.setBlack(false);
            }
        };
        cell.updateAsset();
        this.updateAssetList.push(cell);

    },

    doGuildAction: function (action, memberId) {
        switch (action) {
            case mc.const.GuildAction.KICK:
                var dialog = new mc.DefaultDialog()
                    .setTitle(mc.dictionary.getGUIString("lblWarning"))
                    .setMessage(mc.dictionary.getGUIString("lblDoYouWantToKick"))
                    .enableYesNoButton(function () {
                        dialog.close();
                        mc.protocol.guildKick(function (rs) {
                            if (rs) {
                                mc.protocol.checkGuildStatus(function (result) {
                                    if (result) {
                                        this.bindBG(this._bg);
                                    }
                                }.bind(this));
                            }
                        }.bind(this), memberId);
                    }.bind(this), function(){
                        dialog.close();
                    });
                dialog.show();
                break;
            case mc.const.GuildAction.PROMOTE:
                mc.protocol.guildPromote(function () {

                }.bind(this), memberId, true);
                break;
            case mc.const.GuildAction.GIVE_LEADER:
                mc.protocol.guildSendLeader(function () {

                }.bind(this), memberId);
                break;
            case mc.const.GuildAction.DEMOTE:
                mc.protocol.guildPromote(function () {

                }.bind(this), memberId, false);
                break;
            //case mc.const.GuildAction.CHAT:
            //    mc.GameData.guiState.setCurrentConversationPrivateId(memberId);
            //    mc.ChatDialog.showChat();
            //    break;
        }
    },

    buildGuildAction: function (role, targetRole) {
        var actions = [];
        switch (role) {
            case BANG_CHU:
                if (targetRole === PHO_BANG)
                    actions.push(mc.const.GuildAction.GIVE_LEADER);
                if (targetRole !== PHO_BANG && targetRole !== BANG_CHU)
                    actions.push(mc.const.GuildAction.PROMOTE);
                if (targetRole !== TINH_ANH && targetRole !== BANG_CHU)
                    actions.push(mc.const.GuildAction.DEMOTE);
                if (targetRole === TINH_ANH)
                    actions.push(mc.const.GuildAction.KICK);
                actions.push(mc.const.GuildAction.CHAT);
                break;
            case PHO_BANG:
                if (targetRole !== PHO_BANG && targetRole !== BANG_CHU && targetRole !== TRUONG_LAO)
                    actions.push(mc.const.GuildAction.PROMOTE);
                if (targetRole !== TINH_ANH && targetRole !== PHO_BANG && targetRole !== BANG_CHU)
                    actions.push(mc.const.GuildAction.DEMOTE);
                if (targetRole === TINH_ANH)
                    actions.push(mc.const.GuildAction.KICK);
                actions.push(mc.const.GuildAction.CHAT);
                break;
            case TRUONG_LAO:
                if (targetRole === TINH_ANH)
                    actions.push(mc.const.GuildAction.KICK);
                actions.push(mc.const.GuildAction.CHAT);
                break;
            case TINH_ANH:
                actions.push(mc.const.GuildAction.CHAT);
                break;
            default:
                actions.push(mc.const.GuildAction.CHAT);
                break;
        }
        return actions;
    },

    bindMemberInfoCell: function (cell, info) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        cell.setVisible(true);

        var lblName = cellMap["lblName"];
        var lblLvl = cellMap["lblLvl"];
        var lblPower = cellMap["lblPower"];
        var imgPower = cellMap["icon_power"];
        var iconRank = cellMap["icon_rank"];
        var lblOnline = cellMap["lblOnline"];
        var checkinIcon = cellMap["checkin"];
        var btnMatch = cellMap['btnMatch'];
        var btnRelic = cellMap["btnRelic"];
        var pnlCup = cellMap["pnlCup"];
        var lblPoints = pnlCup.getChildByName("lblPoints");
        var iconRelic = btnRelic.getChildByName("icon");
        iconRelic.loadTexture("res/png/consumable/reliccoins.png",ccui.Widget.LOCAL_TEXTURE);
        iconRelic.scale = 1.5;
        var checkin = checkinIcon.getChildByName("check");
        checkinIcon.setVisible(info["isCheckIn"]);

        if(mc.enableReplaceFontBM())
        {
            lblLvl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLvl) ;
            mc.view_utility.applyLevelStyle(lblLvl);
            lblOnline = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblOnline);
            lblPoints = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPoints);
            lblPower = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPower);
        }

        lblName.setTextColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLvl.setColor(mc.color.BROWN_SOFT);
        lblOnline.setColor(mc.color.BROWN_SOFT);

        cell._touchScale = 0;
        var myInfo = mc.GameData.guildManager.getMyInfo();
        var actions = this.buildGuildAction(myInfo["role"], info["role"]);
        var actionStrings = bb.collection.createArray(actions.length, function (index) {
            return mc.dictionary.getGUIString(actions[index]["lbl"]);
        });
        var selectFunc = function (cbBox, index) {
            var action = actions[index];
            this.doGuildAction(action, info["gameHeroId"]);
        }.bind(this);
        cell.registerTouchEvent(function () {
            new mc.PopupDialog(this, actionStrings, function (index) {
                if (index != undefined) {
                    selectFunc && selectFunc(this, index);
                }
            }.bind(this), true).show();
        }.bind(cell));
        var ownerName = info["name"] || info["gameHeroName"];
        if (mc.GameData.playerInfo.getId() === info["gameHeroId"]) {
            btnMatch.setVisible(false);
        }
        btnMatch.registerTouchEvent(function () {

            mc.GameData.friendSoloManager.setFriendSoloId(info["gameHeroId"]);
            this._requestFriendSolo();

        }.bind(this));

        if( info["gameHeroId"] === mc.GameData.playerInfo.getId())
        {
            btnRelic.setVisible(false);
        }
        else
        {
            btnRelic.setVisible(true);
        }
        btnRelic.registerTouchEvent(function () {
            mc.view_utility.showTransferRelicDialog(info);
        }.bind(this));
        var getRankIcon = function (rank) {
            switch (rank) {
                case BANG_CHU:
                    return "icon/guild_leader.png";
                case PHO_BANG:
                    return "icon/guild_viceleader.png";
                case TRUONG_LAO:
                    return "icon/guild_truonglao.png";
                default:
                    return "icon/guild_member.png";
            }
        };


        // btnAccept.setString(mc.dictionary.getGUIString("lblAddFriend"));
        // btnAccept.setVisible(true);
        // btnAccept.registerTouchEvent(function (btnAccept) {
        //     var loadingId = mc.view_utility.showLoadingDialog();
        //     mc.protocol.requestAddFriend(info["gameHeroId"], function (result) {
        //         mc.view_utility.hideLoadingDialogById(loadingId);
        //         if (result) {
        //             mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtYourRequestSent"));
        //         }
        //     }.bind(this));
        // }.bind(this));
        lblOnline.setVisible(true);
        var onlineAgo = info["now"];
        if (onlineAgo && onlineAgo !== -1) {
            lblOnline.setString(cc.formatStr(mc.dictionary.getGUIString("Offline"), mc.view_utility.formatDurationTime(bb.now() - onlineAgo)));
            lblOnline.setColor(mc.color.BROWN_SOFT);
        } else {
            lblOnline.setString(mc.dictionary.getGUIString("Online"));
            lblOnline.setColor(mc.color.BLUE_SOFT);
        }

        iconRank.loadTexture(getRankIcon(info["role"]), ccui.Widget.PLIST_TEXTURE);
        iconRank.ignoreContentAdaptWithSize(true);


        lblName.setString(info["name"] || info["gameHeroName"]);
        lblLvl.setString(mc.dictionary.getGUIString("lblLv.") + info["level"]);
        lblPower.setString(info["teamPower"] ? bb.utility.formatNumber(info["teamPower"]) : "?????");
        lblPoints.setString(bb.utility.formatNumber(info["arenaPoint"]));
        if (info["teamPower"]) {
            lblPower.setVisible(true);
            imgPower.setVisible(true);
            lblPower.setString(bb.utility.formatNumber(info["teamPower"]));
        }
        else {
            lblPower.setVisible(false);
            imgPower.setVisible(false);
        }
        var isVIP = info.vip;
        var avt = mc.view_utility.createAvatarPlayer(parseInt(info["avatar"]),isVIP);
        avt.x = cell.width * 0.145;
        avt.y = cell.height * 0.5;
        cell.addChild(avt);

        avt.registerTouchEvent(function () {
            var tempHeroId = info["gameHeroId"];
            if (!tempHeroId) {
                var id = info["id"];
                if (id) {
                    var tempId = id.split("_");
                    if (tempId[0]) {
                        tempHeroId = tempId[0];
                    }
                }
            }
            mc.view_utility.showUserInfo(tempHeroId, info);
        });

        cell.setCascadeColorEnabled(true);
        avt.setCascadeColorEnabled(true);
        cell.setCascadeOpacityEnabled(true);
        avt.setCascadeOpacityEnabled(true);
        return cell;

    },

    _requestFriendSolo: function () {
        if (mc.GameData.friendSoloManager.getFriendSoloId()) {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.requestFriendSolo(mc.GameData.friendSoloManager.getFriendSoloId(), function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    mc.GameData.friendSoloManager.setSelectFriendVS(result.opponent);
                    this._showDialogVS();
                }

            }.bind(this));
        }

    },

    _showDialogVS: function () {
        var oppInfo = mc.GameData.friendSoloManager.getSelectFriendVS();
        if (oppInfo) {
            var oppName = mc.FriendSoloManager.getOpponentName(oppInfo);
            var oppPower = mc.FriendSoloManager.getOpponentTeamPower(oppInfo);
            var oppLeague = mc.FriendSoloManager.getOpponentLeague(oppInfo);
            var arrayHeroes = mc.FriendSoloManager.getOpponentArrayHeroes(oppInfo);
            var mapHeroes = bb.utility.arrayToMap(arrayHeroes, function (heroInfo) {
                var id = mc.HeroStock.getHeroId(heroInfo);
                return id;
            });
            var teamFormation = mc.FriendSoloManager.getOpponentTeamFormation(oppInfo);
            var leaderIndex = mc.FriendSoloManager.getOpponentLeaderIndex(oppInfo);
            mc.GameData.guiState.setCurrentEditFormationTeamId(mc.TeamFormationManager.TEAM_ATTACK_ARENA);
            var dialogVS = new mc.DialogVS(oppName, oppPower, oppLeague, mapHeroes, teamFormation, leaderIndex);
            dialogVS.setStartCallback(function () {
                mc.GUIFactory.showFriendSoloBattleScreen();
            });
            dialogVS.show();
        }

    },

    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    onLayerShow: function () {
        var self = this;
        var arrStackDialogData = mc.GameData.guiState.popDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN);
        if (arrStackDialogData.length > 0) {
            for (var i = 0; i < arrStackDialogData.length; i++) {
                var dialogData = arrStackDialogData[i];
                if (dialogData.id === mc.GUIState.ID_DIALOG_VS) {
                    this._requestFriendSolo();
                    //this._showDialogVS();
                }
            }
        }
    },

    onLayerClose: function () {
        this._super();
        mc.GameData.friendManager.setArraySearchInfo(null); // clear the searching data.
        var allDialog = bb.director.getAllDialog();
        for (var i = 0; i < allDialog.length; i++) {
            var dialog = allDialog[i];
            if (dialog instanceof mc.DialogVS) {
                mc.GameData.guiState.pushDialogStackIdForScreen(mc.GUIState.ID_SCREEN_MAIN, mc.GUIState.ID_DIALOG_VS, this._revegingRecordInfo);
            }
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_MANAGER;
    },

    isShowHeader: function () {
        return false;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }
});

mc.GuildFlagLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_guild_flag);
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var createFlag = rootMap["create_flag"];
        this.bindBG(createFlag);
    },
    bindBG: function (bg) {
        var rootMap = this._rootMap = bb.utility.arrayToMap(bg.getChildren(), function (child) {
            return child.getName();
        });
        this.iconIndex = 0;
        this.baseIndex = 0;
        var lblTitle = rootMap["lblTitle"];
        var lblFlag = rootMap["lblFlag"];
        var selectFlag = rootMap["select_flag"];
        var lblIcon = rootMap["lblIcon"];
        var selectIcon = rootMap["select_icon"];
        var btnCreate = rootMap["btnCreate"];
        var flagBG = rootMap["flagBG"];
        var flagBase = flagBG.getChildByName("flag_base");
        var flagIcon = flagBG.getChildByName("flagIcon");

        btnCreate.setString(mc.dictionary.getGUIString("Create"));
        btnCreate.registerTouchEvent(function () {
            var guildCreateState = mc.GameData.guiState.getGuildCreateState();
            guildCreateState.flag = {base: this.baseIndex, icon: this.iconIndex};
            mc.GameData.guiState.getGuildCreateState().createGuild = true;
            this.getMainScreen().popLayer();
        }.bind(this));

        lblTitle.setString(mc.dictionary.getGUIString("Create Flag"));
        lblFlag.setString(mc.dictionary.getGUIString("Select Flag"));
        lblIcon.setString(mc.dictionary.getGUIString("Select Icon"));
        lblTitle.setColor(mc.color.BROWN_SOFT);
        lblFlag.setColor(mc.color.BROWN_SOFT);
        lblIcon.setColor(mc.color.BROWN_SOFT);

        var updateIcon = function (id) {
            this.iconIndex = id;
            flagIcon.loadTexture(iconDir + icons[id], ccui.Widget.PLIST_TEXTURE);
        }.bind(this);
        var updateBase = function (id) {
            this.baseIndex = id;
            flagBase.loadTexture(flagDir + flags[id], ccui.Widget.PLIST_TEXTURE);
        }.bind(this);

        var listFlags = bb.collection.createArray(flags.length, function (index) {
            var widget = new ccui.ImageView(flagDir + flags[index], ccui.Widget.PLIST_TEXTURE);
            widget.setScale(0.4);
            return widget;
        });
        var listIcons = bb.collection.createArray(icons.length, function (index) {
            var widget = new ccui.ImageView(iconDir + icons[index], ccui.Widget.PLIST_TEXTURE);
            widget.setScale(0.5);
            return widget;
        });
        var scrollFlags = mc.widget_utility.createScrollNode(listFlags, new ccui.ImageView("patch9/pnl_selectedlang.png", ccui.Widget.PLIST_TEXTURE), 250, cc.p(selectFlag.width - 40, selectFlag.height), {
            clickFunc: function (id) {
                updateBase(id);
            },
            autoFocusFunc: function (id) {
                updateBase(id);
            }
        });
        var scrollIcons = mc.widget_utility.createScrollNode(listIcons, new ccui.ImageView("patch9/pnl_selectedlang.png", ccui.Widget.PLIST_TEXTURE), 250, cc.p(selectIcon.width - 40, selectIcon.height), {
            clickFunc: function (id) {
                updateIcon(id);
            },
            autoFocusFunc: function (id) {
                updateIcon(id);
            }
        });
        var guildCreate = mc.GameData.guiState.getGuildCreateState();
        scrollFlags.setLoopScroll(true, 3);
        scrollFlags.setAnchorPoint(0.5, 0.5);
        scrollFlags.focusAt(guildCreate.flag["base"] || 0, true);

        scrollIcons.setLoopScroll(true, 3);
        scrollIcons.setAnchorPoint(0.5, 0.5);
        scrollIcons.focusAt(guildCreate.flag["icon"] || 0, true);

        bg.addChild(scrollFlags);
        bg.addChild(scrollIcons);
        scrollFlags.setPosition(selectFlag.x, selectFlag.y);
        scrollIcons.setPosition(selectIcon.x, selectIcon.y);
        scrollIcons.setClippingEnabled(true);
        scrollFlags.setClippingEnabled(true);
        // scrollIcons.setBackGroundColor(mc.color.BROWN_SOFT);
        // scrollIcons.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);

    },


    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_FLAG;
    },

    isShowHeader: function () {
        return false;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});

mc.GuildEditLayer = mc.MainBaseLayer.extend({

    ctor: function (parseNode) {
        this._super();
        var root = this.parseCCStudio(parseNode || res.layer_guild_edit);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        brkTitle.setString(mc.dictionary.getGUIString("Edit Guild"), res.font_UTMBienvenue_stroke_32_export_fnt);
        var createGuild = rootMap["create_guild"];
        this.bindCreateNode(createGuild);
    },

    bindCreateNode: function (node) {
        var rootMap = bb.utility.arrayToMap(node.getChildren(), function (child) {
            return child.getName();
        });
        var lblIcon = rootMap["lblIcon"];
        var bgIcon = rootMap["iconBg"];
        var lblName = rootMap["lblName"];
        var nameInput = rootMap["nameInput"];
        var level = rootMap["lblLevel"];
        var rank = rootMap["lblRank"];
        var level_require = rootMap["require_level"];
        var rank_require = rootMap["require_rank"];
        var lblDesc = rootMap["lblDesc"];
        var lblDescNote = rootMap["lblDescNote"];
        var descInput = rootMap["descInput"];
        var lblRequirement = rootMap["lblRequire"];
        var btnCreate = this.btnCreate = rootMap["btnCreate"];
        btnCreate.setString(mc.dictionary.getGUIString("lblDone"));

        var info = mc.GameData.guildManager.getGuildInfo();
        var infoElement = info["guildReqs"] || {};
        mc.GameData.guiState._guildCreateState = {
            guildName: info["name"],
            guildDesc: info["notice"],
            minRank: infoElement["rank"] || "D",
            minLevel: infoElement["level"] || 1,
            joinRule: 0,
            flag: {base: info["base"] || 0, icon: info["logo"] || 0}
        };

        var flag = bgIcon.getChildByName("flag");
        var flag_icon = bgIcon.getChildByName("flag_icon");
        var btnChange = bgIcon.getChildByName("btn_change");
        var lblRule = bgIcon.getChildByName("lblRule");
        lblRule.setColor(mc.color.BROWN_SOFT);
        var join_rule = bgIcon.getChildByName("join_rule");

        btnChange.setString(mc.dictionary.getGUIString("lblChange"));
        lblRule.setString(mc.dictionary.getGUIString("lblRuleJoin"));

        var flagData = mc.GameData.guiState.getGuildCreateState().flag;
        flag.loadTexture(flagDir + flags[info["flag"]], ccui.Widget.PLIST_TEXTURE);
        flag_icon.loadTexture(iconDir + icons[flagData["icon"]], ccui.Widget.PLIST_TEXTURE);

        lblIcon.setString(mc.dictionary.getGUIString("Guild Flag"));
        lblName.setString(mc.dictionary.getGUIString("Guild Name"));
        lblDesc.setString(mc.dictionary.getGUIString("Guild Desc"));
        lblDescNote.setString(mc.dictionary.getGUIString("Guild Desc note"));
        lblRequirement.setString(mc.dictionary.getGUIString("Requirement"));
        level.setString(mc.dictionary.getGUIString("lblLevelMin"));
        rank.setString(mc.dictionary.getGUIString("lblRankMin"));
        lblIcon.setColor(mc.color.BROWN_SOFT);
        lblName.setColor(mc.color.BROWN_SOFT);
        lblDesc.setColor(mc.color.BROWN_SOFT);
        lblRequirement.setColor(mc.color.BROWN_SOFT);
        lblDescNote.setColor(mc.color.ORANGE_TEXT);
        nameInput.setColor(mc.color.ORANGE_TEXT);

        var comboBoxRank = new mc.ComboBox("", rank_require);
        var arenaDict = mc.dictionary.arenaDictionary;
        comboBoxRank.setDataSource(arenaDict.dataRank,
            arenaDict.mapLeague[mc.GameData.guiState.getGuildCreateState().minRank].index || 0,
            function (cbBox, index) {
                mc.GameData.guiState.getGuildCreateState().minRank = arenaDict.mapRank[index].league;
            }.bind(this));
        node.addChild(comboBoxRank);
        comboBoxRank.setPosition(rank_require.x, rank_require.y);
        var comboBoxLevel = new mc.ComboBox("", level_require);
        var dataLevel = bb.collection.createArray(100, function (index) {
            return index + 1;
        });
        var dataLevelCode = bb.collection.createArray(100, function (index) {
            return {index: index, level: index + 1};
        });

        var mapLevelIndex = bb.utility.arrayToMap(dataLevelCode, function (child) {
            return child.index;
        });
        var mapLevelCode = bb.utility.arrayToMap(dataLevelCode, function (child) {
            return child.level;
        });

        comboBoxLevel.setDataSource(dataLevel,
            mapLevelCode[mc.GameData.guiState.getGuildCreateState().minLevel].index || 0,
            function (cbBox, index) {
                mc.GameData.guiState.getGuildCreateState().minLevel = mapLevelIndex[index].level;
            }.bind(this));
        node.addChild(comboBoxLevel);
        comboBoxLevel.setPosition(level_require.x, level_require.y);

        var comboBoxJoinRule = new mc.ComboBox("", join_rule);
        comboBoxJoinRule.setDataSource([mc.dictionary.getGUIString("Accept All"), mc.dictionary.getGUIString("Invite Only")],
            mc.GameData.guiState.getGuildCreateState().joinRule || 0,
            function (cbBox, index) {
                mc.GameData.guiState.getGuildCreateState().joinRule = index;
            }.bind(this));
        bgIcon.addChild(comboBoxJoinRule);
        comboBoxJoinRule.setPosition(join_rule.x, join_rule.y);

        this.txtDesc = mc.view_utility.createTextField(descInput, this.onTextChange.bind(this));
        this.btnCreate.setGray(true);
        this.txtDesc.setMaxLength(100);
        this.txtDesc.setInputMode(cc.EDITBOX_INPUT_MODE_ANY);
        this.txtDesc.setFontColor(mc.color.GRAY);

        if (mc.GameData.guiState.getGuildCreateState().guildName) {
            nameInput.setString(mc.GameData.guiState.getGuildCreateState().guildName);
        }
        if (mc.GameData.guiState.getGuildCreateState().guildDesc) {
            this.txtDesc.setString(mc.GameData.guiState.getGuildCreateState().guildDesc);
        }

        this.onTextChange();

        btnChange.registerTouchEvent(this.onBtnChange.bind(this));
        flag.registerTouchEvent(this.onBtnChange.bind(this));
        btnCreate.registerTouchEvent(function () {
            mc.GameData.guiState.getGuildCreateState().guildDesc = this.txtDesc.getString();
            // mc.protocol.guildCreate(function (result) {
            //     if (result) {
            //         this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_MANAGER);
            //     } else {
            //         var dialog = bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("Create Guild Fail"));
            //         dialog.show();
            //     }
            // }.bind(this));
            mc.view_utility.showComingSoon();
        }.bind(this));
    },

    onBtnChange: function () {
        mc.GameData.guiState.getGuildCreateState().guildDesc = this.txtDesc.getString();
        this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_FLAG);
    },

    parseArenaLeagueRewards: function (json) {
        var result = {};
        if (cc.isString(json)) {
            json = JSON.parse(json);
        }
        var leagueList = json["leagueList"];
        if (leagueList) {
            for (var j in leagueList) {
                var league = leagueList[j];
                if (!result[league["league"]]) {
                    result[league["league"]] = {league: league["league"], listGroupRewards: []};
                }
                result[league["league"]].info = league;
            }
        }
        return result;
    },

    onTextChange: function () {
        var text2 = this.txtDesc.getString();
        this.btnCreate.setGray(text2 === "" || text2.length <= 3);
    },


    getLayerId: function () {
        return mc.MainScreen.LAYER_GUILD_EDIT;
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