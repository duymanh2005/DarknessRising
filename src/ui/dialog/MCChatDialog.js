/**
 * Created by Thanh.Vo on 4/2019.
 */
var TOP_MSG_TAG = 1;
var MID_MSG_TAG = 2;
var BOTTOM_MSG_TAG = 3;
var ALONE_MSG_TAG = 4;
var LIMIT_MSG_VIEW = 100;
var PADDING_LEFT = 70;
var PADDING_RIGHT = 25;
mc.ChatDialog = bb.Dialog.extend({
    _mapTableView: null,
    _maxLength: 100,
    _listMsgCache: null,
    _loaddingView: null,
    _allowRefreshChatlogPage: true,
    _baseBgrListSize: null,
    _firstPrivateTabSelected: false,
    ctor: function () {
        this._super();
        this._mapTableView = {};
        var node = ccs.load(res.widget_chat_dialog, "res/").node;
        this.setEnableClickOutSize(false);
        this.setBlackBackgroundEnable(true);
        var black = this.getChildByName("__blackBrk__");
        black.setBackGroundColorOpacity(200);
        this.addChild(node);
        var root = this.root = node.getChildByName("root");
        var mapRoot = this.mapRoot = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        this._loaddingView = mc.view_utility.showLoadingDialog();//1119,1158

    },

    onShow: function () {
        var root = this.root;
        var mapRoot = this.mapRoot;
        var bgList = this.bgList = mapRoot["bgList"];
        var btnChat = this.btnChat = mapRoot["btnChat"];
        var btnExit = mapRoot["btnExit"];
        var btnGuild = mapRoot["btnGuild"];
        var btnPrivate = mapRoot["btnPrivate"];
        var btnWorld = mapRoot["btnWorld"];
        var chatBg = this.chatBg = mapRoot["chatBg"];
        this._baseBgrListSize = chatBg.getContentSize();
        var self = this;
        var _createTextField = function () {
            var onTextChanged = function () {
                var len = this._txtBox.getString().length;
                var remain = this._maxLength - len;
            }.bind(this);
            var txtBox = this._txtBox = mc.view_utility.createTextField(chatBg, onTextChanged);
            txtBox.setMaxLength(this._maxLength);
            txtBox.setPlaceholderFontColor(cc.color.GRAY);
            txtBox.setPlaceholderFontSize(24);
            txtBox.setFontSize(24);
            txtBox.setInputFlag(cc.EDITBOX_INPUT_FLAG_INITIAL_CAPS_SENTENCE);
            txtBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
            txtBox.setReturnType(cc.KEYBOARD_RETURNTYPE_SEND);
            txtBox.setPlaceHolder(mc.dictionary.getGUIString("txtPlzTapHere"));
            txtBox.setFontColor(mc.color.BLACK_DISABLE_STRONG);
            txtBox.anchorX = 0;
            txtBox.anchorY = 0.5;
            txtBox.x = 15;
            txtBox.y = (chatBg.height) / 2;
            txtBox.clearText = function () {
                if (this.clearString) {
                    this.clearString();
                } else {
                    this.setString("");
                }

            }
        }.bind(this);

        var createHistoryPanel = function (name) {
            var historyPanel = root.getChildByName(name);
            if (!self.historyPrivateChatPanel) {
                self.historyPrivateChatPanel = historyPanel = new HistoryPanel(bgList.width, root.height - 100);
                root.addChild(self.historyPrivateChatPanel);
                self.historyPrivateChatPanel.setName(name);
                self.historyPrivateChatPanel.setAnchorPoint(0.5, 0.5);
                self.historyPrivateChatPanel.setPosition(root.width / 2, root.height / 2);
                self.historyPrivateChatPanel.setSelectHistoryTagCallBack(
                    /**
                     * @param {mc.HistoryConversation}conv
                     */
                    function (conv) {
                        self.historyPrivateChatPanel.hide();
                        mc.GameData.guiState.setCurrentConversationPrivateId(conv.gameHeroId);
                        self.initPrivateChatPanel();
                        self._proceedShowPrivateChat(true);
                        self.privateChatPanel.preloadWithId(conv.gameHeroId);
                    });
            }
            return self.historyPrivateChatPanel;
        };


        var _updateListChat = function (name, conversation) {
            var listChat = root.getChildByName(name);
            if (!listChat) {
                listChat = new ccui.ListView();
                listChat.setContentSize(bgList.width - 55, bgList.height - 10);
                listChat.setInnerContainerSize(cc.size(bgList.width - 55, 300));
                listChat.setName(name);
                listChat.setBounceEnabled(true);
                listChat.setGravity(ccui.ListView.GRAVITY_CENTER_HORIZONTAL);
                listChat.setBackGroundColorType(ccui.Layout.BG_COLOR_NONE);
                listChat.setItemsMargin(2);
                listChat.setScrollBarEnabled && listChat.setScrollBarEnabled(false);
                listChat.anchorX = listChat.anchorY = 0.5;
                listChat.x = bgList.x;
                listChat.y = bgList.y;
                listChat.lastMessageTime = 0;
                root.addChild(listChat);
                listChat.pushBackCustomItem(mc.view_utility.createEmptyPaddingItemList());
            }
            var numberOfMessage = conversation.getNumberOfMessage();
            for (var i = numberOfMessage - 1; i >= 0; i--) {
                var messageByIndex = conversation.getMessageByIndex(i);
                if (messageByIndex.getTimeStamp() > listChat.lastMessageTime) {
                    listChat.lastMessageTime = messageByIndex.getTimeStamp();
                    switch (name) {
                        case "tbWorld":
                            listChat.pushBackCustomItem(self.bindWorldTextChatContentPanel(self.createWorldMessView(), messageByIndex));
                            break;
                        case "tbGuild":
                            listChat.pushBackCustomItem(self.bindWorldTextChatContentPanel(self.createWorldMessView(), messageByIndex));
                            break;
                    }

                }
            }
            listChat.jumpToPercentVertical(98);
            listChat.scrollToPercentVertical(100, 0.1, false);
            var items = listChat.getItems();
            for (var j in items) {
                var item = items[j];
                item.updateTimer && item.updateTimer();
            }
            return listChat;
        }.bind(this);

        var _updateTabState = function () {
            btnGuild.loadTexture("chat/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnGuild.setEnabled(true);
            btnGuild.setLocalZOrder(-1);
            btnWorld.loadTexture("chat/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnWorld.setEnabled(true);
            btnWorld.setLocalZOrder(-1);
            btnPrivate.loadTexture("chat/tab_item_normal.png", ccui.Widget.PLIST_TEXTURE);
            btnPrivate.setEnabled(true);
            btnPrivate.setLocalZOrder(-1);
            btnChat.setVisible(true);
            chatBg.setVisible(true);
            bgList.setVisible(true);
            var firstLoad = this._firstPrivateTabSelected;

            var currentGroupId = mc.GameData.guiState.getCurrentGroupChatId();
            var currentConversationPrivateId = mc.GameData.guiState.getCurrentConversationPrivateId();
            mc.view_utility.setNotifyIconForWidget(btnWorld, currentGroupId !== mc.ChatSystem.GROUP_CHAT_WORLD_ID && mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_WORLD_ID), 0.8);
            mc.view_utility.setNotifyIconForWidget(btnPrivate, currentGroupId !== mc.ChatSystem.GROUP_CHAT_PRIVATE_ID && mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_PRIVATE_ID), 0.8);
            mc.view_utility.setNotifyIconForWidget(btnGuild, currentGroupId !== mc.ChatSystem.GROUP_CHAT_CLAN_ID && mc.GameData.chatSystem.haveNewMessage(mc.ChatSystem.GROUP_CHAT_CLAN_ID), 0.8);

            for (var id in this._mapTableView) {
                this._mapTableView[id].setVisible(false);
                this.privateChatPanel && this.privateChatPanel.hide(false);
            }
            if (currentGroupId === mc.ChatSystem.GROUP_CHAT_CLAN_ID) {
                btnGuild.loadTexture("chat/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
                btnGuild.setEnabled(false);
                btnGuild.setLocalZOrder(20);
                var conv = mc.GameData.chatSystem.getConversationById(mc.ChatSystem.GROUP_CHAT_CLAN_ID);
                if (!conv.needGetRemoteMsg()) {
                    mc.protocol.listChatLogs(mc.ChatSystem.GROUP_CHAT_CLAN_ID, null, null, function (result) {
                        if (result) {
                            this._mapTableView[mc.ChatSystem.GROUP_CHAT_CLAN_ID] = _updateListChat("tbGuild", conv);
                            this._mapTableView[mc.ChatSystem.GROUP_CHAT_CLAN_ID].setVisible(true);
                            mc.GameData.chatSystem.storeMsgIndex(mc.ChatSystem.GROUP_CHAT_CLAN_ID);
                        }
                    }.bind(this));
                } else {
                    this._mapTableView[mc.ChatSystem.GROUP_CHAT_CLAN_ID] = _updateListChat("tbGuild", conv);
                    this._mapTableView[mc.ChatSystem.GROUP_CHAT_CLAN_ID].setVisible(true);
                    mc.GameData.chatSystem.storeMsgIndex(mc.ChatSystem.GROUP_CHAT_CLAN_ID);
                }
            } else if (currentGroupId === mc.ChatSystem.GROUP_CHAT_WORLD_ID) {
                btnWorld.loadTexture("chat/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
                btnWorld.setEnabled(false);
                btnWorld.setLocalZOrder(20);
                var conv = mc.GameData.chatSystem.getConversationById(mc.ChatSystem.GROUP_CHAT_WORLD_ID);
                if (!conv.needGetRemoteMsg()) {
                    mc.protocol.listChatLogs(mc.ChatSystem.GROUP_CHAT_WORLD_ID, null, null, function (result) {
                        if (result) {
                            this._mapTableView[mc.ChatSystem.GROUP_CHAT_WORLD_ID] = _updateListChat("tbWorld", mc.GameData.chatSystem.getConversationById(mc.ChatSystem.GROUP_CHAT_WORLD_ID));
                            this._mapTableView[mc.ChatSystem.GROUP_CHAT_WORLD_ID].setVisible(true);
                            mc.GameData.chatSystem.storeMsgIndex(mc.ChatSystem.GROUP_CHAT_WORLD_ID);
                        }
                    }.bind(this));
                } else {
                    this._mapTableView[mc.ChatSystem.GROUP_CHAT_WORLD_ID] = _updateListChat("tbWorld", mc.GameData.chatSystem.getConversationById(mc.ChatSystem.GROUP_CHAT_WORLD_ID));
                    this._mapTableView[mc.ChatSystem.GROUP_CHAT_WORLD_ID].setVisible(true);
                    mc.GameData.chatSystem.storeMsgIndex(mc.ChatSystem.GROUP_CHAT_WORLD_ID);
                }

            } else if (currentGroupId === mc.ChatSystem.GROUP_CHAT_PRIVATE_ID) {
                btnPrivate.loadTexture("chat/tab_item_picked.png", ccui.Widget.PLIST_TEXTURE);
                btnPrivate.setEnabled(false);
                btnPrivate.setLocalZOrder(20);
                mc.GameData.guiState.setCurrentGroupChatId(mc.ChatSystem.GROUP_CHAT_PRIVATE_ID);
                if (!this.historyPrivateChatPanel) {
                    this._mapTableView[mc.ChatSystem.GROUP_CHAT_PRIVATE_ID] = createHistoryPanel("tbPrivate");
                    this.historyPrivateChatPanel.preload();//online load view
                }
                /**@type {mc.Message}*/
                var recentMsg = mc.GameData.chatSystem.recentPrivateMsg;
                if (!recentMsg) {
                    this._mapTableView[mc.ChatSystem.GROUP_CHAT_PRIVATE_ID].setVisible(true);
                    btnChat.setVisible(false);
                    chatBg.setVisible(false);
                }
                if (recentMsg && (!currentConversationPrivateId || recentMsg.getOwnerId() != currentConversationPrivateId)) {
                    this.historyPrivateChatPanel.syncDataHistoryOffline(recentMsg.getOwnerId(), recentMsg.getContent(), recentMsg.getTimeStamp());
                    this.historyPrivateChatPanel.refreshView();//offline load view
                }
                mc.GameData.chatSystem.recentPrivateMsg = null;


                mc.GameData.chatSystem.storeMsgIndex(mc.ChatSystem.GROUP_CHAT_PRIVATE_ID);
                if (!!currentConversationPrivateId && !firstLoad) {
                    this.initPrivateChatPanel();
                    this._proceedShowPrivateChat(false);
                    this.privateChatPanel.preloadWithId(currentConversationPrivateId);
                    this._firstPrivateTabSelected = true;
                }

            }
        }.bind(this);


        btnExit.registerTouchEvent(function () {
            this.close();
        }.bind(this));
        btnChat.registerTouchEvent(function () {
            btnChat.scheduleOnce(function () {
                this._txtBox.clearText();
            }.bind(this));
            var msg = new mc.Message(mc.GameData.playerInfo.getId(), this._txtBox.getString(), bb.now());
            var currId = mc.GameData.guiState.getCurrentGroupChatId();
            if (currId === mc.ChatSystem.GROUP_CHAT_PRIVATE_ID) {
                this.privateChatPanel.sendMessage(msg);
            } else {
                this.sendMessage(currId, msg);
            }

        }.bind(this));
        btnGuild.registerTouchEvent(function () {
            if (mc.GameData.guildManager.getGuildInfo()) {
                mc.GameData.guiState.setCurrentGroupChatId(mc.ChatSystem.GROUP_CHAT_CLAN_ID);
                _updateTabState();
            } else {
                bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("Join Guild Now"), function () {
                    this.close();
                    mc.protocol.checkGuildStatus(function (result) {
                        if (result) {
                            if (mc.GameData.guildManager.getGuildInfo()) {
                                bb.director.getCurrentScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_MANAGER);
                            } else {
                                bb.director.getCurrentScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_SEARCH);
                            }
                        } else {
                            bb.director.getCurrentScreen().pushLayerWithId(mc.MainScreen.LAYER_GUILD_SEARCH);
                        }
                    }.bind(this));
                }.bind(this), mc.dictionary.getGUIString("Join Now")).show();
            }
        }.bind(this));


        btnPrivate.registerTouchEvent(function () {
            mc.view_utility.showComingSoon();
            return;
            //mc.GameData.guiState.setCurrentGroupChatId(mc.ChatSystem.GROUP_CHAT_PRIVATE_ID);
            //_updateTabState();
        }.bind(this));

        btnWorld.registerTouchEvent(function () {
            mc.GameData.guiState.setCurrentGroupChatId(mc.ChatSystem.GROUP_CHAT_WORLD_ID);
            _updateTabState();
        }.bind(this));

        _updateTabState();
        _createTextField();

        this.setCloseCallback(function () {
            mc.GameData.notifySystem.notifyDataChanged();
        });

        this.traceDataChange(mc.GameData.chatSystem, function (a) {
            _updateTabState();
        });
        mc.view_utility.hideLoadingDialogById(this._loaddingView);
    },


    _proceedShowPrivateChat: function (animation) {
        this.privateChatPanel.show(animation);
        this.btnChat.setVisible(true);
        this.chatBg.setVisible(true);
        this.bgList.setVisible(false);
    },

    _proceedHidePrivateChat: function (animation) {
        this.privateChatPanel.hide(animation);
        this.bgList.setVisible(false);
        this.historyPrivateChatPanel.show();
        this.btnChat.setVisible(false);
        this.chatBg.setVisible(false);
    },

    initPrivateChatPanel: function () {
        var root = this.root;
        this.privateChatPanel = root.getChildByName("privateChatPanel");
        if (!this.privateChatPanel) {
            this.privateChatPanel = new PrivateChatPanel(this.bgList.width, root.height - 300, function () {
                this._proceedHidePrivateChat(true);
            }.bind(this));
            root.addChild(this.privateChatPanel);
            this.privateChatPanel.setName("privateChatPanel");
            this.privateChatPanel.setAnchorPoint(0.5, 0.5);
            this.privateChatPanel.setPosition(root.width / 2, root.height / 2);
        }
    },

    onClose: function () {

    },


    sendMessage: function (curId, msg, func) {
        if (!msg || msg["_content"] === "")
            return;
        switch (curId) {
            case mc.ChatSystem.GROUP_CHAT_WORLD_ID:
                if (!this.lastSend || (bb.now() - this.lastSend > 2000)) {
                    mc.protocol.worldChat(msg.getContent(), function (result) {
                        func && func(result);
                    });
                    this.lastSend = bb.now();
                } else {
                    mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("Time interval for send next message")).show();
                }
                break;
            case mc.ChatSystem.GROUP_CHAT_CLAN_ID:
                if (!this.lastSend || (bb.now() - this.lastSend > 1000)) {
                    var guild = mc.GameData.guildManager.getGuildInfo();
                    if (guild) {
                        var guildId = guild["id"];
                        mc.protocol.guildChat(guildId, msg.getContent(), function (result) {
                            func && func(result);
                        });
                    }
                    this.lastSend = bb.now();
                } else {
                    mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("Time interval for send next message")).show();
                }

                break;
            case mc.ChatSystem.GROUP_CHAT_PRIVATE_ID:
                if (!this.lastSend || (bb.now() - this.lastSend > 1000)) {
                    var receiveId = mc.GameData.guiState.getCurrentConversationPrivateId();
                    if (receiveId) {
                        mc.protocol.privateChat(receiveId, msg.getContent(), function (result) {
                            func && func(result);
                        });
                    }
                    this.lastSend = bb.now();
                } else {
                    mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("Time interval for send next message")).show();
                }
                break;
        }
    },


    enableShadowLabel: function (lbl, color, size) {
        color = color || mc.color.BLACK;
        size = size || cc.size(1, -1);
        if (cc.sys.isNative && !(lbl instanceof ccui.Text)) {
            lbl.enableShadow(color, size, 1, 1);
        } else {
            lbl.enableShadow(color, size, 2);
        }
    },


    createWorldMessView: function () {
        var layout = new ccui.Layout();
        //layout.setScale9Enabled(true);
        //layout.setClippingEnabled(false);
        layout.setContentSize(570, 100);
        var baloon = new ccui.ImageView("chat/chatBalloonGreen.png", ccui.Widget.PLIST_TEXTURE);
        baloon.setScale9Enabled(true);
        var avatar = new ccui.ImageView("patch9/pnl_avatar.png", ccui.Widget.PLIST_TEXTURE);
        var traslateButton = new ccui.ImageView("chat/icon_translate.png", ccui.Widget.PLIST_TEXTURE);
        traslateButton.setOpacity(90);
        traslateButton.setName("traslateButton");
        traslateButton.setScale(0.7);
        var created_time_label = new cc.LabelTTF("00:44", res.font_regular_ttf, 22);
        created_time_label.setColor(mc.color.BLACK);
        created_time_label.setOpacity(50);
        var msg_label = new cc.LabelTTF("", res.font_regular_ttf, 25);
        var username = new cc.LabelTTF("unknown", res.font_regular_ttf, 22);
        this.enableShadowLabel(username);
        username.setColor(mc.color.CHAT_USER_NAME);
        baloon.setName("bloon");
        avatar.setName("avatar");
        avatar.setScale9Enabled(true);
        avatar.setContentSize(60, 60);
        created_time_label.setName("created_time_label");
        msg_label.setName("msg_label");
        username.setName("username");
        layout.addChild(baloon);
        layout.addChild(avatar);
        baloon.addChild(created_time_label);
        baloon.addChild(msg_label);
        baloon.addChild(username);
        baloon.addChild(traslateButton);
        var self = this;
        traslateButton.registerTouchEvent(function (widget, type) {
            mc.view_utility.showComingSoon();
            //fixme Bỏ cmt mở tính năng translate
            /*var pal = widget.getParent().getParent();
             var list = pal.getParent();
             var msg = pal.getUserData();
             msg.setIsOriginalLangShowed(!msg.isOriginalLangShowed());
             if (!msg.getTraslatedContent()) {
             var loadingId = mc.view_utility.showLoadingDialog();
             mc.protocol.traslate(bb.utility.getLanguageCode(), msg.getContent(), function (msgRemoteObj) {
             mc.view_utility.hideLoadingDialogById(loadingId);
             var text = "";
             if (parseInt(msgRemoteObj["messages"]) === -1) {
             text = "Currently the server does not support this feature...";
             } else {
             text = msgRemoteObj["msg"];
             }
             msg.setTraslateContent(text);
             self.bindWorldTextChatContentPanel(pal, msg);
             list.requestDoLayout();
             });
             } else {
             self.bindWorldTextChatContentPanel(pal, msg);
             list.requestDoLayout();
             }*/
        });
        return layout;
    },


    /**
     * @param panel
     * @param msg {mc.Message}
     */
    bindWorldTextChatContentPanel: function (panel, msg) {
        const messageViewWidth = 480;
        var chatContent = msg.getContentForShow();
        panel.setUserData(msg);
        var bloon = panel.getChildByName("bloon");
        var avatar = panel.getChildByName("avatar");
        var username = bloon.getChildByName("username");
        var traslateButton = bloon.getChildByName("traslateButton");
        var created_time_label = bloon.getChildByName("created_time_label");
        created_time_label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
        var itMe =msg.getOwnerId() === mc.GameData.playerInfo.getId();
        var isSystemMsg = (msg.getOwnerId() === "sys");
        if (isSystemMsg) {
            username.setColor(mc.color.RED);
        }
        bloon.loadTexture("chat/chatBalloonWhite.png", ccui.Widget.PLIST_TEXTURE);
        bloon.setAnchorPoint(0, 0.5);
        created_time_label.setAnchorPoint(1, 1);
        bloon.x = PADDING_LEFT;
        avatar.setVisible(true);
        var isVip = msg.isVIP();
        var avt = mc.view_utility.createAvatarPlayer(parseInt(msg.getOwnerAvatarIndex()), isVip);
        avt.setScale(0.5);
        avt.x = avatar.width * 0.5;
        avt.y = avatar.height * 0.5;
        avatar.addChild(avt);
        if (!isSystemMsg) {
            avatar.registerTouchEvent(function () {
                mc.view_utility.showUserInfo(msg["_ownerId"], {
                    teamPower: 0,
                    level: 1,
                    avatar: msg.getOwnerAvatarIndex(),
                    gameHeroId: msg["_ownerId"]
                }, true);
            });
        }
        panel._timeStamp = msg.getTimeStamp();
        panel.updateTimer = function () {
            var timeMs = bb.now() - this._timeStamp;
            created_time_label.setString(mc.view_utility.formatDurationTime(timeMs));
        }.bind(panel);
        panel.updateTimer();

        username.setString(username.isVisible() ? "@" + msg.getOwnerName() : "");
        username.setAnchorPoint(0, 1);
        username.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        var msg_label = bloon.getChildByName("msg_label");
        msg_label.setString(chatContent);
        msg_label.setFontFillColor(mc.color.BLACK_DISABLE_STRONG);
        var dim = cc.size(messageViewWidth, 0);
        msg_label.setDimensions(dim);

        var itemView = null;
        var itemHeight = 0;
        var scale = 0.5;
        var heroItems = msg.getItem();
        if (heroItems) {
            var itemView = bb.layout.linear(bb.collection.createArray(heroItems.length, function (index) {
                var element = heroItems[index];
                var itemV = new mc.ItemView(element);
                itemV.setNewScale(scale);
                itemV.anchorY = 1;
                itemV.registerViewItemInfo();
                itemHeight = itemV.height;
                return itemV;
            }), 40);
            itemView = mc.view_utility.wrapWidget(itemView, msg_label.width - 10, false, {
                top: 15,
                left: -10,
                bottom: 25,
                a1: -32,
                a2: -32
            });

            bloon.addChild(itemView);
            itemView.anchorX = 0.5;
            itemView.anchorY = 1;
            itemView.height = itemHeight + 10;
            itemHeight += 20;
            itemView.x = 60;
        }

        var goToAction = msg.getActions();
        var panelAction = null;
        var panelHeight = 0;
        if(goToAction)
        {

            panelAction = new ccui.Layout();
            panelAction.setContentSize(cc.size(messageViewWidth, 0));
            var actionGo =  new ccui.ImageView("button/btn_blue_big.png", ccui.Widget.PLIST_TEXTURE);
            actionGo.setString(mc.dictionary.getGUIString("lblGo"));
            const btnScale = 0.6;
            actionGo.scale = btnScale;
            actionGo.registerTouchEvent(function(){
                this.close();
                mc.view_utility.goTo(goToAction);
            }.bind(this))
            actionGo.anchorX = 0.5;
            actionGo.anchorY = 0.5;
            actionGo.x = panelAction.width*0.5;
            panelAction.addChild(actionGo);
            panelHeight = panelAction.height = actionGo.height*btnScale + 20;
            panelAction.anchorX = 0;
            bloon.addChild(panelAction);
        }
        var msgSize = msg_label.getContentSize();
        var nameSize = username.isVisible() ? username.getContentSize() : cc.size(0, 0);
        bloon.height = msgSize.height + 30 + nameSize.height + itemHeight * scale + 20 + panelHeight;

        bloon.width = Math.max(msg_label.width + 20, nameSize.width + 20);
        panel.height = bloon.height;
        avatar.setPosition(avatar.width / 2 + 5, panel.height - avatar.height / 2);
        username.setPosition(10, bloon.height - 10);
        traslateButton.setPosition(username.x + nameSize.width + 30, username.y - 10);
        created_time_label.x = bloon.width - 10;
        msg_label.x = bloon.width / 2;

        //panel.height = bloon.height + 30;
        created_time_label.y = bloon.height - 10;
        bloon.y = panel.height / 2 + 15;
        msg_label.y = bloon.height / 2 - nameSize.height / 1.8;
        if (itemView) {
            itemView.y = bloon.height - 50;
            msg_label.y = itemView.y - itemHeight - 15;
        }
        if(panelHeight)
        {
            panelAction.y = msg_label.y - msg_label.height ;
        }
        avatar.y = panel.height - avatar.height / 2;

        if(isSystemMsg){
           mc.GUIFactory.applyMixComplexString(msg_label, bb.utility.stringBreakLines(chatContent), mc.color.BLACK_DISABLE_STRONG, res.font_cam_stroke_32_export_fnt);
        }

        return panel;
    },

    _runApearMsgAction: function (widget) {
        widget.setScale(0.5);
        widget && widget.runAction(cc.scaleTo(0.5, 1).easing(cc.easeBackOut()));
    }
});

mc.ChatDialog.showChat = function () {
    new mc.ChatDialog().show();
};


var _chatUtil = {
    /**
     * @param {mc.Message}msg1
     * @param {mc.Message}msg2
     */
    setupTagMsg: function (msg1, msg2) {//chưa có sticker
        /*if (msg1 && msg2 && msg1.getContent().type == 2) {//msg trước là loại sticker thì sau đó cũng mở nhóm mới
         msg1["tag"] = ALONE_MSG_TAG;
         msg2["tag"] = ALONE_MSG_TAG;
         return;
         }*/
        if (msg1 && msg2 && ((msg1.getCreatedTime() - msg2.getCreatedTime() > 50 * 1000) /*|| msg2.getContent().type == 2*/)) {//Quá 50 giây hoặc là loại sticker thì tạo nhóm mới
            if (msg1["tag"] != ALONE_MSG_TAG) {
                msg1["tag"] = BOTTOM_MSG_TAG;
            }
            msg2["tag"] = ALONE_MSG_TAG;
            return;
        }
        if (msg1 && !msg1["tag"]) {
            msg1["tag"] = ALONE_MSG_TAG;
        }
        if (msg1 && msg2 && msg1.getOwnerId() === msg2.getOwnerId()) {
            msg2["tag"] = BOTTOM_MSG_TAG;
            if (msg1["tag"] == ALONE_MSG_TAG) {
                msg1["tag"] = TOP_MSG_TAG;
            } else if (msg1["tag"] == BOTTOM_MSG_TAG) {
                msg1["tag"] = MID_MSG_TAG;
            }
        }

    },

    setupTagMsgs: function (msgs) {
        if (msgs)
            for (var i = 0; i < msgs.length; i++) {
                if (i < msgs.length - 1) {
                    this.setupTagMsg(msgs[i], msgs[i + 1]);
                } else {
                    this.setupTagMsg(msgs[i], null);
                }

            }
    },

    isLastMsg: function (msg) {
        var tag = msg["tag"];
        if (tag === BOTTOM_MSG_TAG || tag === ALONE_MSG_TAG) {
            return true;
        }
    },

    loadBloonTexture: function (isMe, tag) {
        var path = "";
        if (isMe) {
            path = "chat/chatBalloonGreen.png";
            if (tag == TOP_MSG_TAG) {
                path = "chat/chatBalloonGreen_top.png";
            } else if (tag == MID_MSG_TAG) {
                path = "chat/chatBalloonGreen_mid.png";
            } else if (tag == BOTTOM_MSG_TAG) {
                path = "chat/chatBalloonGreen_bottom.png";
            }
        } else {
            path = "chat/chatBalloonWhite.png";
            if (tag == TOP_MSG_TAG) {
                path = "chat/chatBalloonWhite_top.png";
            } else if (tag == MID_MSG_TAG) {
                path = "chat/chatBalloonWhite_mid.png";
            } else if (tag == BOTTOM_MSG_TAG) {
                path = "chat/chatBalloonWhite_bottom.png";
            }
        }
        return path;
    }
};

var HistoryPanel = ccui.Layout.extend({
    _listView: null,
    _historyList: null,
    ctor: function (width, hight) {
        this._super();
        this.setBackGroundImage("chat/pnl_chat.png", ccui.Widget.PLIST_TEXTURE);
        this.setBackGroundImageScale9Enabled(true);
        this.setContentSize(width, hight);
        this._listView = new ccui.ListView();
        this._listView.setContentSize(width, hight);
        this._listView.setInnerContainerSize(cc.size(width, 300));
        this._listView.setName("history_list");
        this._listView.setBounceEnabled(true);
        this._listView.setGravity(ccui.ListView.GRAVITY_CENTER_HORIZONTAL);
        this._listView.setBackGroundColorType(ccui.Layout.BG_COLOR_NONE);
        this._listView.setItemsMargin(3);
        this._listView.anchorX = this._listView.anchorY = 0.5;
        this._listView.setPosition(width / 2, hight / 2);
        this._listView.setScrollBarEnabled && this._listView.setScrollBarEnabled(false);
        this.addChild(this._listView);
        this._historyList = [];
    },
    //client chủ đông sync offline hạn chế call mc.protocol.listConversation nhiều lần mổi khi có tin mới
    syncDataHistoryOffline: function (gameHeroId, lastMsg, timeStamp) {
        for (var i = 0; i < this._historyList.length; i++) {
            /**@type{ mc.HistoryConversation}*/
            var conversation = this._historyList[i];
            if (conversation.gameHeroId == gameHeroId) {
                conversation.lastMessage = lastMsg;
                conversation.timeStamp = timeStamp;
                conversation.notifyCount++;
            }
        }
    },

    preload: function () {
        mc.protocol.listConversation(function (history) {
            if (history) {
                var conversations = history["conversations"];
                for (var i = 0; i < conversations.length; i++) {
                    var conversation = conversations[i];
                    conversation = new mc.HistoryConversation(conversation);
                }
                conversations.sort(function (a, b) {
                    return a.timeStamp - b.timeStamp;
                });
                this._historyList = conversations;
                this.refreshView(conversations);
            }
        }.bind(this));
    },

    refreshView: function (historyList) {
        !historyList && (historyList = this._historyList);
        if (!historyList) return;
        var listView = this._listView;
        var idx = 0;
        this.schedule(function () {
            var item = listView.getItem(idx);
            if (!item) {
                listView.pushBackCustomItem(this._bindHistoryTag(this.createHistoryTag(), historyList[idx]));
            } else {
                this._bindHistoryTag(item, historyList[idx]);
            }

            idx++;
        }.bind(this), 0.02, historyList.length - 1);

    },


    createHistoryTag: function () {
        var layout = new ccui.ImageView("chat/Rounded-Rectangle.png", ccui.Widget.PLIST_TEXTURE);
        layout.setScale9Enabled(true);
        layout.setContentSize(570, 150);
        var username = new cc.LabelTTF("unknown", res.font_regular_ttf, 30);
        username.setColor(mc.color.CHAT_USER_NAME);
        this.enableShadowLabel(username);
        var msg_label = new cc.LabelTTF("unknown", res.font_regular_ttf, 25);
        msg_label.setColor(mc.color.CHAT_TEXT);
        var created_time_label = new cc.LabelTTF("00:44", res.font_regular_ttf, 22);
        created_time_label.setColor(mc.color.BLACK);
        created_time_label.setOpacity(50);
        layout.addChild(username);
        layout.addChild(msg_label);
        layout.addChild(created_time_label);
        username.setName("username");
        msg_label.setName("msg_label");
        created_time_label.setName("created_time_label");
        return layout;
    },


    enableShadowLabel: function (lbl, color, size) {
        color = color || mc.color.BLACK;
        size = size || cc.size(1, -1);
        if (cc.sys.isNative && !(lbl instanceof ccui.Text)) {
            lbl.enableShadow(color, size, 1, 1);
        } else {
            lbl.enableShadow(color, size, 2);
        }
    },

    setSelectHistoryTagCallBack: function (callback) {
        this._callback = callback;
    },

    hide: function () {
        this.setVisible(false);
    },

    show: function () {
        this.setVisible(true);
    },

    /**
     * @param panel
     * @param { mc.HistoryConversation}model
     * @private
     */
    _bindHistoryTag: function (panel, model) {
        var username = panel.getChildByName("username");
        var msg_label = panel.getChildByName("msg_label");
        var created_time_label = panel.getChildByName("created_time_label");
        created_time_label.setOpacity(128);
        var isVIP = model.vip;
        var avt = mc.view_utility.createAvatarPlayer(parseInt(model.avatar), isVIP);
        //avt.setScale(0.8);
        avt.x = avt.width / 2 + 20;
        avt.y = panel.height / 2;
        panel.addChild(avt);
        avt.registerTouchEvent(function () {
            mc.view_utility.showUserInfo(model.conversationId, {
                teamPower: 0,
                level: 1,
                avatar: parseInt(model.avatar),
                gameHeroId: model.gameHeroId
            }, true);
        });
        panel.setUserData(model);
        panel.registerTouchEvent(function (wg) {
            var conv = wg.getUserData();
            this._callback && this._callback(conv);
        }.bind(this));

        username.setString(username.isVisible() ? "@" + model.conversationName : "");
        username.setAnchorPoint(0, 1);
        username.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        msg_label.setString(bb.utility.stringFormatWidth(model.lastMessage, 300, 25, "..."));
        msg_label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
        msg_label.setFontFillColor(mc.color.BLACK_DISABLE_STRONG);
        msg_label.setAnchorPoint(0, 0.5);
        //msg_label.setDimensions(cc.size(480, 0));
        var unreadCount = parseInt(model.notifyCount);
        var unreadNumBg = panel.getChildByName("unreadNum");
        if (unreadCount > 0) {
            panel.setOpacity(255);
            if (!unreadNumBg) {
                unreadNumBg = new ccui.ImageView("chat/round_noti_number.png", ccui.Widget.PLIST_TEXTURE);
                var num = new cc.LabelBMFont("", res.font_cam_outer_32_export_fnt);
                num.setColor(mc.color.WHITE_NORMAL);
                num.setPosition(unreadNumBg.width / 2, unreadNumBg.height / 2 + 5);
                unreadNumBg.addChild(num);
                panel.addChild(unreadNumBg);
                unreadNumBg.setPosition(panel.width - unreadNumBg.width, panel.height / 2 - unreadNumBg.height / 2);
            }
            unreadNumBg.setVisible(true);
            num.setString(unreadCount);
        } else {
            unreadNumBg && unreadNumBg.setVisible(false);
            panel.setOpacity(200);
        }

        panel._timeStamp = model.timeStamp;
        panel.updateTimer = function () {
            var timeMs = bb.now() - this._timeStamp;
            created_time_label.setString(mc.view_utility.formatDurationTime(timeMs));
        }.bind(panel);
        panel.updateTimer();

        var msgSize = msg_label.getContentSize();
        var nameSize = username.isVisible() ? username.getContentSize() : cc.size(0, 0);
        //panel.height = msgSize.height + 30 + nameSize.height;
        //panel.width = Math.max(msg_label.width + 20, nameSize.width + 20);
        username.setPosition(avt.width + 30, panel.height - 30);
        created_time_label.x = panel.width - 40;
        msg_label.x = avt.width + 30;
        created_time_label.y = panel.height - 45;
        msg_label.y = panel.height / 2 - nameSize.height / 1.8;
        return panel;
    }
});

var PrivateChatPanel = ccui.Layout.extend({
        _listView: null,
        _lastPreloadTime: null,
        _preloadInterval: null,
        _listMsgCache: null,
        _bottomDock: null,
        _topPanel: null,
        _receiverId: null,
        _mainPage: null,
        _topListPadding: null,
        isShowing: false,
        ctor: function (width, hight, backCallback) {
            this._super();
            this._listMsgCache = [];
            this._preloadInterval = 30 * 1000;
            this._lastPreloadTime = 0;

            this.setBackGroundImage("chat/pnl_chat.png", ccui.Widget.PLIST_TEXTURE);
            this.setBackGroundImageScale9Enabled(true);
            this.setContentSize(width, hight);
            this._listView = new ccui.ListView();
            this._listView.setContentSize(width, hight - 10);
            this._listView.setInnerContainerSize(cc.size(width, 300));
            this._listView.setName("history_list");
            this._listView.setBounceEnabled(true);
            this._listView.setGravity(ccui.ListView.GRAVITY_CENTER_HORIZONTAL);
            this._listView.setBackGroundColorType(ccui.Layout.BG_COLOR_NONE);
            this._listView.setItemsMargin(3);
            this._listView.anchorX = this._listView.anchorY = 0.5;
            this._listView.setPosition(width / 2, hight / 2);
            this._listView.setScrollBarEnabled && this._listView.setScrollBarEnabled(false);
            this.addChild(this._listView);
            var backButton = new ccui.ImageView("button/btn_back.png", ccui.Widget.PLIST_TEXTURE);
            this.addChild(backButton);
            backButton.setPosition(backButton.width / 2 + 20, hight + backButton.height / 2 + 20);
            backButton.registerTouchEvent(function () {
                backCallback();
            }.bind(this));
        },


        hide: function (animation) {
            this.setVisible(false);
            this.isShowing = false;
            mc.GameData.guiState.setCurrentConversationPrivateId(null);
        },

        show: function (animation) {
            this.setVisible(true);
            this.isShowing = true;
        },


        setPreloadInterval: function (val) {
            this._preloadInterval = val;
        },

        isAllowedPreload: function () {
            return Date.now() - this._lastPreloadTime > this._preloadInterval;
        },


        layoutOldMsg: function () {
            var listMsg = this._listMsgCache;
            this._listView.removeAllChildren();
            var top_padding = this._topListPadding = mc.view_utility.createEmptyPaddingItemList(cc.size(620, 40));
            top_padding.setName("top_padding");
            this._listView.pushBackCustomItem(top_padding);
            if (!!listMsg) {
                for (var i = 0; i < listMsg.length; i++) {
                    this._pushBackMsg(listMsg[i])
                }
            }
            var bottom_padding = mc.view_utility.createEmptyPaddingItemList(cc.size(620, 60));
            bottom_padding.setName("bottom_padding");
            this._listView.pushBackCustomItem(bottom_padding);
            this._listView.doLayout();
            this._listView.jumpToBottom();
        },

        _pushBackMsg: function (msg, animation) {
            this.limitMsgView(this._listView);
            var panel = this._createMsgView(msg, animation);
            var bottom_padding = this._listView.getChildByName("bottom_padding");
            if (panel) {
                panel.setUserData(msg);
                if (bottom_padding) {
                    this._listView.insertCustomItem(panel, this._listView.getItems().length - 1);
                } else {
                    this._listView.pushBackCustomItem(panel);
                }
            }
        },

        pushBackMsg: function (msg, animation) {
            this._pushBackMsg(msg, animation);
            if (animation === true) {
                this._listView.scheduleOnce(function () {
                    this.scrollToBottom(0.5, true);
                });
            } else {
                this._listView.scheduleOnce(function () {
                    this.jumpToBottom();
                });
            }
        },

        limitMsgView: function (list) {
            if (list && list.getItems().length > LIMIT_MSG_VIEW) {
                this.removeTopMsgView();
            }
        },

        removeTopMsgView: function () {
            if (!this._listView || this._listView.getItems().length < 2) return;
            var top_padding = this._listView.getChildByName("top_padding");
            if (top_padding) {
                this._listView.removeItem(1);
            } else {
                this._listView.removeItem(0);
            }
        },

        getLastMsgView: function () {
            if (!this._listView || this._listView.getItems().length < 2) return null;
            var bottom_padding = this._listView.getChildByName("bottom_padding");
            if (bottom_padding) {
                return this._listView.getItem(this._listView.getItems().length - 2);
            } else {
                return this._listView.getItem(this._listView.getItems().length - 1);
            }
        },

        onReceiveMsgP2P: function (msg) {
            if (msg.getSenderId() === this._receiverId)
                this._proceedPushMsg(msg);
        },


        preloadWithId: function (id) {
            if (!id) return;
            this.isShowing = true;
            this._receiverId = id;
            var enabled = !!this._receiverId;
            if (!this._receiverId /*|| this._receiverId == this._currentChatReceiverId*/) return;
            var self = this;
            this._currentChatReceiverId = this._receiverId;
            var conv = mc.GameData.chatSystem.getPrivateConversationById(this._receiverId);
            if (!conv.needGetRemoteMsg()) {
                mc.protocol.listPrivateChatLogs(this._receiverId,
                    function (result) {
                        if (result) {
                            var convNew = mc.GameData.chatSystem.getPrivateConversationById(self._receiverId);
                            self._listMsgCache = convNew.getListMsg();
                            _chatUtil.setupTagMsgs(self._listMsgCache);
                            self.layoutOldMsg();
                        }
                    });
            } else {
                self._listMsgCache = conv.getListMsg();
                _chatUtil.setupTagMsgs(self._listMsgCache);
                self.layoutOldMsg();
            }


        },


        _proceedPushMsg: function (msg) {
            _chatUtil.setupTagMsg(this._listMsgCache[this._listMsgCache.length - 1], msg);
            this._changeMsgView(this.getLastMsgView(), this._listMsgCache[this._listMsgCache.length - 1]);
            this.pushBackMsg(msg);
            this._listMsgCache.push(msg);
        },


        /**
         * @param {mc.Message}msg
         */
        sendMessage: function (msg) {
            if (!msg.getContent()) return;
            var self = this;
            mc.protocol.privateChat(self._receiverId, msg.getContent(), function (msg) {
                msg = mc.Message.createFromJson(msg);
                self._proceedPushMsg(msg);
            });

        },


        _createMsgView: function (msg, animation) {
            var chatContent = msg.getContent();
            var panelTextChat = this.createMessView();
            this.bindTextChatContentPanel(panelTextChat, msg, animation);
            return panelTextChat;

        },

        _changeMsgView: function (panel, msg) {
            if (msg && panel) {
                var chatContent = msg.getContent();
                this.bindTextChatContentPanel(panel, msg);

            }
        },

        enableShadowLabel: function (lbl, color, size) {
            color = color || mc.color.BLACK;
            size = size || cc.size(1, -1);
            if (cc.sys.isNative && !(lbl instanceof ccui.Text)) {
                lbl.enableShadow(color, size, 1, 1);
            } else {
                lbl.enableShadow(color, size, 2);
            }
        },

        createMessView: function () {
            var layout = new ccui.ImageView();
            layout.setScale9Enabled(true);
            layout.setContentSize(570, 100);
            var baloon = new ccui.ImageView("chat/chatBalloonGreen.png", ccui.Widget.PLIST_TEXTURE);
            baloon.setScale9Enabled(true);
            var avatar = new ccui.ImageView("patch9/pnl_avatar.png", ccui.Widget.PLIST_TEXTURE);
            var created_time_label = new cc.LabelBMFont("0:00", res.font_cam_stroke_32_export_fnt, 150, cc.TEXT_ALIGNMENT_RIGHT);
            created_time_label.setScale(0.5);
            created_time_label.setColor(mc.color.CHAT_TEXT);
            var msg_label = new cc.LabelTTF("", res.font_regular_ttf, 25);
            baloon.setName("bloon");
            avatar.setName("avatar");
            avatar.setScale9Enabled(true);
            avatar.setContentSize(60, 60);
            created_time_label.setName("created_time_label");
            msg_label.setName("msg_label");
            layout.addChild(baloon);
            layout.addChild(avatar);
            layout.addChild(created_time_label);
            baloon.addChild(msg_label);
            return layout;
        },

        bindTextChatContentPanel: function (panel, msg, animation) {
            var chatContent = msg.getContent();
            var bloon = panel.getChildByName("bloon");
            var avatar = panel.getChildByName("avatar");
            var created_time_label = panel.getChildByName("created_time_label");
            created_time_label.setOpacity(128);
            created_time_label.setVisible(false);
            var itMe = msg.getOwnerId() === mc.GameData.playerInfo.getId();
            avatar.setVisible(false);
            bloon.loadTexture(_chatUtil.loadBloonTexture(itMe, msg["tag"]), ccui.Widget.PLIST_TEXTURE);
            var isLastMsg = _chatUtil.isLastMsg(msg);
            if (itMe) {
                avatar.setVisible(false);
                bloon.setAnchorPoint(1, 0.5);
                created_time_label.setAnchorPoint(1, 0.5);
                bloon.x = panel.width - PADDING_RIGHT;
                created_time_label.x = panel.width - PADDING_RIGHT;
            } else {
                bloon.setAnchorPoint(0, 0.5);
                created_time_label.setAnchorPoint(0, 0.5);
                bloon.x = PADDING_LEFT;
                created_time_label.x = (PADDING_LEFT + 3);
                if (isLastMsg) {
                    avatar.setVisible(true);
                    var avt = mc.view_utility.createAvatarPlayer(parseInt(msg.getOwnerAvatarIndex()));
                    avt.setScale(0.5);
                    avt.x = avatar.width * 0.5;
                    avt.y = avatar.height * 0.5;
                    avatar.addChild(avt);
                    avatar.registerTouchEvent(function () {
                        mc.view_utility.showUserInfo(msg["_ownerId"], {
                            teamPower: 0,
                            level: 1,
                            avatar: msg.getOwnerAvatarIndex(),
                            gameHeroId: msg["_ownerId"]
                        }, true);
                    });
                }
            }
            panel._timeStamp = msg.getTimeStamp();
            panel.updateTimer = function () {
                created_time_label.setString(mc.view_utility.formatDurationTime(msg.getCreatedTime()));
            }.bind(panel);
            panel.updateTimer();

            var msg_label = bloon.getChildByName("msg_label");
            msg_label.setString(chatContent);
            msg_label.setFontFillColor(mc.color.BLACK_DISABLE_STRONG);
            if (msg_label.width > 300) {
                msg_label.setDimensions(cc.size(450, 0));
            } else if (msg_label.width < 150) {
                itMe && msg_label.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
                msg_label.setDimensions(cc.size(150, 0));
            }

            var msgSize = msg_label.getContentSize();
            bloon.height = msgSize.height + 30;
            bloon.width = msg_label.width + 20;
            panel.height = bloon.height;
            avatar.setPosition(avatar.width / 2 + 5, panel.height - avatar.height / 2);
            msg_label.x = bloon.width / 2;
            if (isLastMsg) {
                created_time_label.setVisible(true);
                panel.height = bloon.height + 30;
                created_time_label.y = 20;
                bloon.y = panel.height / 2 + 15;
            } else {
                panel.height = bloon.height;
                created_time_label.y = -12;
                bloon.y = panel.height / 2;
            }

            msg_label.y = bloon.height / 2;
            avatar.y = panel.height - avatar.height / 2;
            return panel;
        }
    })
    ;