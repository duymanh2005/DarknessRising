/**
 * Created by long.nguyen on 4/25/2018.
 */
mc.FriendLayer = mc.MainBaseLayer.extend({
    _isOpenFriendSolo: true,

    ctor: function (parseNode) {
        this._super();

        var root = this.parseCCStudio(parseNode || res.layer_friend);

        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var brkTitle = rootMap["brkTitle"];
        var btnSendAll = this._btnSendAll = rootMap["btnSendAll"];
        var imgQuantity = rootMap["imgQuantity"];
        var lblEmpty = this._lblEmpty = rootMap["lblEmpty"];
        var btnFriendOff = rootMap["btnFriendOff"];
        var btnFriendOn = rootMap["btnFriendOn"];
        var btnRequestOff = rootMap["btnRequestOff"];
        var btnRequestOn = rootMap["btnRequestOn"];
        var btnSearchOff = rootMap["btnSearchOff"];
        var btnSearchOn = rootMap["btnSearchOn"];
        var lblQuantity = this._lblQuantity = imgQuantity.getChildByName("lblQuantity");
        var btnAddMoreSlot = imgQuantity.getChildByName("btnAddMoreSlot");
        var lvlSearchList = this._lvlSearchList = rootMap["lvlSearchList"];
        var lvlFriendList = this._lvlFriendList = rootMap["lvlFriendList"];
        var lvlFriendRequestList = this._lvlFriendRequestList = rootMap["lvlFriendRequestList"];

        var cell = this._cell = rootMap["cell"];
        cell.setVisible(false);

        brkTitle.setString(mc.dictionary.getGUIString("lblFriends"), res.font_UTMBienvenue_stroke_32_export_fnt);
        btnSendAll.setCascadeColorEnabled(true);
        btnSendAll.setCascadeOpacityEnabled(true);
        var lblSendAll = btnSendAll.setString(mc.dictionary.getGUIString("lblSendAll"));
        lblSendAll.scale = 0.7;
        lblSendAll.x = btnSendAll.width * 0.62;

        var _selectTab = this._selectTab = function (tabId) {
            btnFriendOn.setVisible(false);
            btnFriendOff.setVisible(false);
            btnRequestOff.setVisible(false);
            btnRequestOn.setVisible(false);
            btnSearchOn.setVisible(false);
            btnSearchOff.setVisible(false);
            lvlFriendList.setVisible(false);
            lvlFriendRequestList.setVisible(false);
            lvlSearchList.setVisible(false);
            lblEmpty.setVisible(false);
            if (tabId === "friend") {
                lvlFriendList.setVisible(true);
                btnFriendOn.setVisible(true);
                btnRequestOff.setVisible(true);
                btnSearchOff.setVisible(true);
                var friendList = mc.GameData.friendManager.getArrayFriendInfo();
                if (!friendList) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.getFriendList(function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            this._populateFriendList();
                        }
                    }.bind(this))
                } else {
                    this._populateFriendList();
                }
                mc.GameData.friendManager.setArraySearchInfo(null); // clear the searching data.
            } else if (tabId === "request") {
                lvlFriendRequestList.setVisible(true);
                btnFriendOff.setVisible(true);
                btnRequestOn.setVisible(true);
                btnSearchOff.setVisible(true);
                var arrFriendRequest = mc.GameData.friendManager.getArrayFriendRequest();
                if (!arrFriendRequest) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.getFriendRequestList(function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            this._populateFriendRequest();
                        }
                    }.bind(this));
                } else {
                    this._populateFriendRequest();
                }
                mc.GameData.friendManager.setArraySearchInfo(null); // clear the searching data.
            } else if (tabId === "search") {
                lvlSearchList.setVisible(true);
                btnSearchOn.setVisible(true);
                btnFriendOff.setVisible(true);
                btnRequestOff.setVisible(true);
                var searchList = mc.GameData.friendManager.getArraySearchInfo();
                if (!searchList) {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.searchFriendByName("", 0, function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            this._populateSearchRequest();
                        }
                    }.bind(this));
                } else {
                    this._populateSearchRequest();
                }
            }
        }.bind(this);

        btnSendAll.registerTouchEvent(function () {
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.requestSendAllFriendPoint(function (result) {
                mc.view_utility.hideLoadingDialogById(loadingId);
                if (result) {
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtYourRequestSent"));
                    this._updateGUI();
                }
            }.bind(this));
        }.bind(this));

        btnFriendOff.registerTouchEvent(function () {
            _selectTab("friend");
        });
        btnRequestOff.registerTouchEvent(function () {
            _selectTab("request");
        });
        var btnRecord = rootMap["btnRecord"];
        if (this._isOpenFriendSolo) {
            btnRecord && btnRecord.setVisible(true);
            btnRecord && btnRecord.registerTouchEvent(function () {
                mc.GameData.friendSoloManager.setNotifyCount(0);
                mc.GameData.notifySystem.notifyDataChanged();
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_FRIEND_SOLO_RECORD);
            }.bind(this));
        } else {
            btnRecord && btnRecord.setVisible(false);
        }

        var _search = this._search = function (showSearchDialog) {
            if (showSearchDialog) {
                new mc.SearchFriendDialog(function () {
                    this._populateSearchRequest();
                }.bind(this)).show();
            }
            _selectTab("search");
        }.bind(this);

        btnSearchOn.registerTouchEvent(function () {
            _search(true);
        }.bind(this));
        btnSearchOff.registerTouchEvent(function () {
            _search(true);
        }.bind(this));
        btnAddMoreSlot.registerTouchEvent(function () {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_ADD_MORE_FRIEND, function () {
                cc.log("addMoreFriend!");
            }.bind(this));
        });

        this._isFirstTime = true;
        _selectTab("friend");

        var notifySystem = mc.GameData.notifySystem;
        var _updateNotifyWidget = function () {
            var notifyIcon = mc.view_utility.setNotifyIconForWidget(btnFriendOff, notifySystem.doHaveNewFriend(), 0.8);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnFriendOn, notifySystem.doHaveNewFriend(), 0.8);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnRequestOff, notifySystem.doHaveNewRequestMakeFriend(), 0.8);
            notifyIcon = mc.view_utility.setNotifyIconForWidget(btnRequestOn, notifySystem.doHaveNewRequestMakeFriend(), 0.8);
            if (btnRecord) {
                mc.view_utility.setNotifyIconForWidget(btnRecord, notifySystem.doHaveFriendSolo(), 0.8);
            }
        };
        _updateNotifyWidget();
        this.traceDataChange(notifySystem, function () {
            _updateNotifyWidget();
        });
    },

    _updateGUI: function () {
        var friendList = mc.GameData.friendManager.getArrayFriendInfo();
        this._btnSendAll.setEnabled(false);
        this._btnSendAll.setColor(mc.color.BLACK_DISABLE_SOFT);
        if (friendList) {
            for (var i = 0; i < friendList.length; i++) {
                if (!mc.FriendManager.isReceivedFP(friendList[i])) {
                    this._btnSendAll.setEnabled(true);
                    this._btnSendAll.setColor(mc.color.WHITE_NORMAL);
                    break;
                }
            }
        }
        var allCellFriend = this._lvlFriendList.getChildren();
        if (allCellFriend) {
            for (var i = 0; i < allCellFriend.length; i++) {
                var friendInfo = allCellFriend[i].getUserData();
                var btnSendPoint = allCellFriend[i].getChildByName("btnSend");
                if (friendInfo && btnSendPoint) {
                    if (mc.FriendManager.isReceivedFP(friendInfo)) {
                        btnSendPoint.setEnabled(false);
                        btnSendPoint.setColor(mc.color.BLACK_DISABLE_SOFT);
                    } else {
                        btnSendPoint.setEnabled(true);
                        btnSendPoint.setColor(mc.color.WHITE_NORMAL);
                    }
                }
            }
        }
    },

    _populateFriendList: function () {
        var numFriend = 0;
        var friendList = mc.GameData.friendManager.getArrayFriendInfo();
        if (friendList) {
            friendList.sort(function (a, b) {
                var at = a["now"] === -1 ? bb.now() : a["now"];
                var bt = b["now"] === -1 ? bb.now() : b["now"];
                return bt - at;
            });
        }
        if (this._lvlFriendList.getUserData() != friendList) {
            this._lvlFriendList.setUserData(friendList);
            this._lvlFriendList.removeAllItems();
            if (friendList) {
                for (var i = 0; i < friendList.length; i++) {
                    this._lvlFriendList.pushBackCustomItem(this._reloadCell(this._cell.clone(), friendList[i], 1));
                }
            }
        }
        this._lblEmpty.setString(mc.dictionary.getGUIString("lblNoFriend"));
        if (friendList) {
            numFriend = friendList.length;
            this._lblEmpty.setVisible(numFriend === 0);
        }
        this._lblQuantity.setString(numFriend + "/" + mc.const.MAX_FRIEND);
        if (this._isFirstTime && numFriend === 0) {
            this._isFirstTime = false;
            this._search();
        }
        this._updateGUI();
    },

    _populateFriendRequest: function () {
        var requestList = mc.GameData.friendManager.getArrayFriendRequest();
        if (this._lvlFriendRequestList.getUserData() != requestList) {
            this._lvlFriendRequestList.setUserData(requestList);
            this._lvlFriendRequestList.removeAllItems();
            if (requestList) {
                for (var i = 0; i < requestList.length; i++) {
                    this._lvlFriendRequestList.pushBackCustomItem(this._reloadCell(this._cell.clone(), requestList[i], 2));
                }
            }
        }
        this._lblEmpty.setString(mc.dictionary.getGUIString("lblNoRequest"));
        requestList && this._lblEmpty.setVisible(requestList.length === 0);
    },

    _populateSearchRequest: function () {
        var self = this;
        var searchList = mc.GameData.friendManager.getArraySearchInfo();
        if (this._lvlSearchList.getUserData() != searchList) {
            this._lvlSearchList.setUserData(searchList);
            this._lvlSearchList.removeAllItems();
            if (searchList) {
                for (var i = 0; i < searchList.length; i++) {
                    this._lvlSearchList.pushBackCustomItem(this._reloadCell(this._cell.clone(), searchList[i], 3));
                }
            }

            var friendManager = mc.GameData.friendManager;
            if (friendManager.getCurrentSearchMaxPage() > 1) {
                var panelLoadMore = new ccui.Layout();
                panelLoadMore.width = cc.winSize.width;
                panelLoadMore.height = 80;
                panelLoadMore.anchorX = panelLoadMore.anchorY = 0.5;
                var nextBtn = new ccui.ImageView("button/btn_blue_big.png", ccui.Widget.PLIST_TEXTURE);
                nextBtn.x = panelLoadMore.width * 0.7;
                nextBtn.y = panelLoadMore.height * 0.5;
                nextBtn.scale = 0.8;
                nextBtn.setCascadeColorEnabled(true);
                nextBtn.setString(mc.dictionary.getGUIString("lblNext"));
                nextBtn.registerTouchEvent(function () {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.searchFriendByName(friendManager.getCurrentSearthName(), friendManager.getCurrentSearchPage() + 1, function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            self._populateSearchRequest();
                        }
                    }.bind(this));
                });
                panelLoadMore.addChild(nextBtn);

                var prevBtn = new ccui.ImageView("button/btn_blue_big.png", ccui.Widget.PLIST_TEXTURE);
                prevBtn.x = panelLoadMore.width * 0.3;
                prevBtn.y = panelLoadMore.height * 0.5;
                prevBtn.scale = 0.8;
                prevBtn.setCascadeColorEnabled(true);
                prevBtn.setString(mc.dictionary.getGUIString("lblPrevious"));
                prevBtn.registerTouchEvent(function () {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.searchFriendByName(friendManager.getCurrentSearthName(), friendManager.getCurrentSearchPage() - 1, function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            self._populateSearchRequest();
                        }
                    }.bind(this));
                });
                panelLoadMore.addChild(prevBtn);

                if (friendManager.getCurrentSearchPage() >= friendManager.getCurrentSearchMaxPage()) {
                    nextBtn.setColor(mc.color.BLACK_DISABLE_SOFT);
                    nextBtn.setEnabled(false);
                }
                if (friendManager.getCurrentSearchPage() <= 1) {
                    prevBtn.setColor(mc.color.BLACK_DISABLE_SOFT);
                    prevBtn.setEnabled(false);
                }

                this._lvlSearchList.pushBackCustomItem(panelLoadMore);
            }
        }

        this._lblEmpty.setString(mc.dictionary.getGUIString("lblNotFound"));
        searchList && this._lblEmpty.setVisible(searchList.length === 0);
    },

    _reloadCell: function (cell, modelInfo, viewMode) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });
        cell.setVisible(true);

        var lblName = cellMap["lblName"];
        var lblLvl = cellMap["lblLvl"];
        var lblPower = cellMap["lblPower"];
        var btnReject = cellMap["btnReject"];
        var btnAccept = cellMap["btnAccept"];
        var btnChat = cellMap["btnChat"];
        var btnSend = cellMap["btnSend"];
        var btnMatch = cellMap["btnMatch"];
        var btnUnFriend = cellMap["btnUnFriend"];
        var btnRelic = cellMap["btnRelic"];
        var iconRelic = btnRelic.getChildByName("icon");
        iconRelic.loadTexture("res/png/consumable/reliccoins.png", ccui.Widget.LOCAL_TEXTURE);
        iconRelic.scale = 1.5;

        var lblOnline = cellMap["lblOnline"];

        lblName.setTextColor(mc.color.BROWN_SOFT);
        lblPower.setColor(mc.color.BROWN_SOFT);
        lblLvl.setColor(mc.color.BROWN_SOFT);

        btnSend.setVisible(false);
        btnAccept.setVisible(false);
        btnReject.setVisible(false);
        btnMatch.setVisible(false);
        btnChat.setVisible(false);
        btnUnFriend.setVisible(false);
        btnRelic.setVisible(false);
        btnAccept.setString(mc.dictionary.getGUIString("lblAccept"));
        btnReject.setString(mc.dictionary.getGUIString("lblDeny"));

        var pnlGuild = cellMap["pnlGuild"]
        var flag = pnlGuild.getChildByName("flag");
        var flag_icon = pnlGuild.getChildByName("flag_icon");
        var lblGuildName = pnlGuild.getChildByName("lblName");
        var guildInfo = modelInfo.guildInfo;
        var name = modelInfo["name"];
        if (guildInfo) {
            var nameWidth = (lblName.fontSize / 1.7) * name.length;
            pnlGuild.x = lblName.x + nameWidth;
            pnlGuild.setVisible(true);
            flag.loadTexture(flagDir + flags[guildInfo["flag"]], ccui.Widget.PLIST_TEXTURE);
            flag_icon.loadTexture(iconDir + icons[guildInfo["icon"] || guildInfo["logo"]], ccui.Widget.PLIST_TEXTURE);
            //var flagData = mc.GameData.guiState.getGuildCreateState().flag;
            //flag_icon.loadTexture(iconDir + icons[flagData["icon"]], ccui.Widget.PLIST_TEXTURE);
            if (guildInfo.guildId && mc.GameData.guildManager.getGuildId() && guildInfo.guildId === mc.GameData.guildManager.getGuildId()) {
                lblGuildName.setColor(mc.color.GREEN_NORMAL);
            } else {
                lblGuildName.setColor(mc.color.BROWN_SOFT);
            }
            lblGuildName.setString(guildInfo.name);
        } else {
            pnlGuild.setVisible(false);
        }

        cell.setUserData(modelInfo);
        btnAccept.setUserData(modelInfo);
        btnSend.setUserData(modelInfo);
        btnChat.setUserData(modelInfo);
        btnMatch.setUserData(modelInfo);
        btnReject.setUserData(modelInfo);
        btnUnFriend.setUserData(modelInfo);
        btnRelic.setUserData(modelInfo);
        var self = this;
        if (viewMode === 1) {
            btnSend.setVisible(true);
            btnChat.setVisible(true);
            btnMatch.setVisible(true);
            btnUnFriend.setVisible(true);
            btnRelic.setVisible(true);
            btnMatch.registerTouchEvent(function () {
                if (this._isOpenFriendSolo) {
                    mc.GameData.friendSoloManager.setFriendSoloId(modelInfo["gameHeroId"]);
                    this._requestFriendSolo();
                } else {
                    mc.view_utility.showComingSoon();
                }
            }.bind(this));
            btnChat.registerTouchEvent(function () {
                //Báo cho mc.ChatDialog hiển thị tab private va player "gameHeroId"
                mc.GameData.guiState.setCurrentGroupChatId(mc.ChatSystem.GROUP_CHAT_PRIVATE_ID);
                mc.GameData.guiState.setCurrentConversationPrivateId(modelInfo["gameHeroId"]);
                mc.ChatDialog.showChat();
            });

            btnUnFriend.registerTouchEvent(function () {
                mc.GUIFactory.confirm(cc.formatStr(mc.dictionary.getGUIString("txtUnFriendSomeOne"), mc.FriendManager.getFriendName(modelInfo)), function () {
                    modelInfo = btnUnFriend.getUserData();
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.requestUnFriend(modelInfo["gameHeroId"], function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            cell.removeFromParent(true);
                            this._populateFriendList();
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this));
            if (modelInfo["gameHeroId"] === mc.GameData.playerInfo.getId()) {
                btnRelic.setVisible(false);
            } else {
                btnRelic.setVisible(true);
            }
            btnRelic.registerTouchEvent(function () {
                mc.view_utility.showTransferRelicDialog(modelInfo);
            }.bind(this));


            btnSend.registerTouchEvent(function () {
                modelInfo = btnSend.getUserData();
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.requestSendFriendPoint(modelInfo["gameHeroId"], function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (result) {
                        mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtYourRequestSent"));
                        this._updateGUI();
                    }
                }.bind(this));
            }.bind(this));

            if (mc.FriendManager.isReceivedFP(modelInfo)) {
                btnSend.setEnabled(false);
                btnSend.setColor(mc.color.BLACK_DISABLE_SOFT);
            }
        } else if (viewMode === 2) {
            btnAccept.setVisible(true);
            btnReject.setVisible(true);
            btnAccept.registerTouchEvent(function (btnAccept) {
                modelInfo = btnAccept.getUserData();
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.responseFriendRequest(true, modelInfo["userRequestId"], function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (result) {
                        cell.setColor(mc.color.BLACK_DISABLE_STRONG);
                        btnAccept.setEnabled(false);
                        btnReject.setEnabled(false);
                        mc.view_utility.showSuggestText(cc.formatStr(mc.dictionary.getGUIString("txtSomebodyIsUrFriend"), modelInfo["name"]));
                    }
                });
            });

            btnReject.registerTouchEvent(function (btnReject) {
                modelInfo = btnReject.getUserData();
                var loadingId = mc.view_utility.showLoadingDialog();
                mc.protocol.responseFriendRequest(false, modelInfo["userRequestId"], function (result) {
                    mc.view_utility.hideLoadingDialogById(loadingId);
                    if (result) {
                        cell.setColor(mc.color.BLACK_DISABLE_STRONG);
                        btnAccept.setEnabled(false);
                        btnReject.setEnabled(false);
                    }
                });
            });
        } else if (viewMode === 3) {
            var isFriendNow = false;
            var arrFriendInfo = mc.GameData.friendManager.getArrayFriendInfo();
            if (arrFriendInfo) {
                isFriendNow = bb.collection.findBy(arrFriendInfo, function (friendInfo, modelInfo) {
                    return friendInfo["gameHeroId"] === modelInfo["gameHeroId"];
                }, modelInfo);
                if (modelInfo["gameHeroId"] === mc.GameData.playerInfo.getId()) {
                    isFriendNow = true;
                }
            }
            if (!isFriendNow) {
                btnAccept.setVisible(true);
                btnAccept.setString(mc.dictionary.getGUIString("lblAddFriend"));
                btnAccept.registerTouchEvent(function (btnAccept) {
                    var friendManager = mc.GameData.friendManager;
                    if (friendManager && friendManager.getArrayFriendInfo() && friendManager.getArrayFriendInfo().length >= mc.const.MAX_FRIEND) {

                        var dialog = new mc.DefaultDialog()
                            .setTitle(mc.dictionary.getGUIString("lblWarning"))
                            .setMessage(mc.dictionary.getExceptionString("lblMaxFriend"))
                            .enableOkButton(function () {
                                dialog.close();
                                closeFunc();
                            }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                        dialog.show();

                    } else {
                        modelInfo = btnAccept.getUserData();

                        _performAddFriend = function () {
                            var loadingId = mc.view_utility.showLoadingDialog();
                            mc.protocol.requestAddFriend(modelInfo["gameHeroId"], function (result) {
                                mc.view_utility.hideLoadingDialogById(loadingId);
                                if (result) {
                                    cell.setColor(mc.color.BLACK_DISABLE_STRONG);
                                    btnAccept.setEnabled(false);
                                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtYourRequestSent"));
                                }
                            }.bind(this));
                        }.bind(this);
                        mc.storage.readAddFriendTouched();
                        if (!mc.storage.addFriendTouched) {
                            mc.GUIFactory.infoDialog(mc.dictionary.getGUIString("lblInfo"), mc.dictionary.getGUIString("lblAddFriendInfo"), function () {
                                _performAddFriend();
                                mc.storage.addFriendTouched = true;
                                mc.storage.saveAddFriendTouched();
                            }.bind(this));


                        } else {
                            _performAddFriend();
                        }

                    }

                });
            } else {
                btnSend.setVisible(true);
                btnSend.registerTouchEvent(function () {
                    modelInfo = btnSend.getUserData();
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.requestSendFriendPoint(modelInfo["gameHeroId"], function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            cell.setColor(mc.color.BLACK_DISABLE_STRONG);
                            btnSend.setEnabled(false);
                            mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtYourRequestSent"));
                        }
                    });
                });
            }
        }

        lblName.setString(modelInfo["name"]);
        if(mc.enableReplaceFontBM())
        {
            lblLvl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblLvl,mc.textStyle.font_size_32);
            mc.view_utility.applyLevelStyle(lblLvl);
            lblLvl.setColor(mc.color.BROWN_SOFT)
            lblPower =  mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblPower,mc.textStyle.font_size_32);
            mc.view_utility.applyPowerStyle(lblPower);
            lblPower.setColor(mc.color.BROWN_SOFT)
            lblOnline = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblOnline);
            lblOnline.setFontSize(20);
        }
        lblLvl.setString(mc.dictionary.getGUIString("lblLv.") + modelInfo["level"]);
        lblPower.setString(bb.utility.formatNumber(modelInfo["teamPower"]));

        lblOnline.setVisible(true);
        var onlineAgo = modelInfo["now"];
        if (onlineAgo && onlineAgo !== -1) {
            var logoutAgo = bb.now() - onlineAgo;
            if(logoutAgo > 172800000){
                logoutAgo = this._getMsAfterStartOfDate(bb.now()) - 24*60*60*1000 + this._getMsAfterStartOfDate(logoutAgo);
            }
            lblOnline.setString(cc.formatStr(mc.dictionary.getGUIString("Offline"), mc.view_utility.formatDurationTime(logoutAgo)));
            lblOnline.setColor(mc.color.BROWN_SOFT);
        } else {
            lblOnline.setString(mc.dictionary.getGUIString("Online"));
            lblOnline.setColor(mc.color.BLUE_SOFT);
        }
        var isVIP = modelInfo.vip;
        var avt = mc.view_utility.createAvatarPlayer(parseInt(modelInfo["avatar"]), isVIP);
        avt.x = cell.width * 0.145;
        avt.y = cell.height * 0.5;
        cell.addChild(avt);

        avt.registerTouchEvent(function () {
            mc.view_utility.showUserInfo(modelInfo["gameHeroId"] || modelInfo["userRequestId"], modelInfo);
        });

        cell.setCascadeColorEnabled(true);
        btnMatch.setCascadeColorEnabled(true);
        btnUnFriend.setCascadeColorEnabled(true);
        btnSend.setCascadeColorEnabled(true);
        btnAccept.setCascadeColorEnabled(true);
        btnReject.setCascadeColorEnabled(true);
        avt.setCascadeColorEnabled(true);
        btnMatch.setCascadeOpacityEnabled(true);
        btnUnFriend.setCascadeOpacityEnabled(true);
        cell.setCascadeOpacityEnabled(true);
        btnSend.setCascadeOpacityEnabled(true);
        avt.setCascadeOpacityEnabled(true);
        return cell;
    },

    _getMsAfterStartOfDate: function (date) {
        var currentDate = new Date(date);
        var startCurrentDate = new Date(date);
        startCurrentDate.setHours(0, 0, 0, 0);
        cc.log("------------------------");
        cc.log(currentDate.getTime() + "/" + startCurrentDate.getTime());
        return currentDate.getTime() - startCurrentDate.getTime();
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

    getLayerId: function () {
        return mc.MainScreen.LAYER_FRIEND;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return false;
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
    }

});