/**
 * Created by long.nguyen on 11/2/2018.
 */
mc.ChatSystem = bb.Class.extend({
    _mapConversationById: null,
    _mapPrivateConversationById: null,
    recentPrivateMsg: null, //msg cá nhân mới nhất vừa nhận tin
    ctor: function () {
        this._super();
        this._mapConversationById = {};
        this._mapPrivateConversationById = {};

    },

    getConversationById: function (groupId) {
        // if (id != mc.ChatSystem.GROUP_CHAT_WORLD_ID &&
        //     id != mc.ChatSystem.GROUP_CHAT_CLAN_ID) {
        //     id = "c_" + id;
        // }
        if (!this._mapConversationById[groupId]) {
            this._mapConversationById[groupId] = new mc.Conversation(groupId);
        }
        var conversation = this._mapConversationById[groupId];
        conversation.sortMsg();
        return conversation;
    },

    getPrivateConversationById: function (id) {
        if (!this._mapPrivateConversationById[id]) {
            this._mapPrivateConversationById[id] = new mc.Conversation(id);
        }
        var conversation = this._mapPrivateConversationById[id];
        conversation.sortPrivateMsg();
        return conversation;
    },

    storeLastMsgIndex: function (group, index) {
        var chatStorage = mc.storage.readChatLastIndex();
        if (!chatStorage[group]) {
            chatStorage[group] = {last: 0, store: 0};
        }
        chatStorage[group]["last"] = Math.max(index, (chatStorage[group]["last"] || 0));
    },
    storeMsgIndex: function (group) {
        var chatStorage = mc.storage.readChatLastIndex();
        if (!chatStorage[group]) {
            chatStorage[group] = {last: 0, store: 0};
        }
        chatStorage[group]["store"] = chatStorage[group]["last"];
        mc.storage.saveChatLastIndex();
    },

    haveNewMessage: function (group) {
        var chatStorage = mc.storage.readChatLastIndex();
        var chatStorageElement = chatStorage[group];
        return chatStorageElement && chatStorageElement["last"] > chatStorageElement["store"];
    }

});


mc.Conversation = cc.Class.extend({
    _id: null,
    _editingText: null,
    _arrMsg: null,
    _lastMsgIndex: null,
    _isGetRemoteMsg: false,

    ctor: function (id) {
        this._id = id;
        this._editingText = "";
        this._arrMsg = [];
    },

    getID: function () {
        return this._id;
    },

    needGetRemoteMsg: function () {
        return this._isGetRemoteMsg;
    },

    setGetRemoteMsg: function (isGetRemote) {
        this._isGetRemoteMsg = isGetRemote;
    },

    getListMsg: function () {
        return this._arrMsg;
    },


    sortMsg: function () {
        this._arrMsg.sort(function (a, b) {
            return b._index - a._index;
        });
    },

    sortPrivateMsg: function () {
        this._arrMsg.sort(function (a, b) {
            return a._index - b._index;
        });
    },

    setEditingText: function (editingText) {
        this._editingText = editingText;
    },

    getEditingText: function (editingText) {
        return this._editingText;
    },

    addMessage: function (msg) {
        mc.GameData.chatSystem.storeLastMsgIndex(this._id, msg.getMsgIndex());
        this._arrMsg && (cc.arrayAppendObjectsToIndex(this._arrMsg, msg, 0));
    },

    addPrivateMessage: function (msg) {
        mc.GameData.chatSystem.storeLastMsgIndex(this._id, msg.getMsgIndex());
        this._arrMsg && (this._arrMsg.push(msg));
    },

    getMessageByIndex: function (index) {
        if (index < this._arrMsg.length) {
            return this._arrMsg[index];
        }
        return null;
    },


    getNumberOfMessage: function () {
        return this._arrMsg ? this._arrMsg.length : 0;
    }

});

mc.HistoryConversation = cc.Class.extend({
    avatar: null,
    conversationId: null,
    conversationName: null,
    gameHeroId: null,
    lastMessage: null,
    timeStamp: null,
    notifyCount: null,
    ctor: function (jsonObj) {
        if (jsonObj)
            bb.utility.copyProperties(this, jsonObj);
        !this.notifyCount && (this.notifyCount = 0);
    }
});


mc.Message = cc.Class.extend({
    _ownerId: null,
    _ownerName: null,
    _ownerAvtIndex: 0,
    _content: null,
    _timeStamp: 0,
    _index: 0,
    _translatedContent: null,
    _isOriginalLangShowed: true,
    _isVIP: false,
    _contentParam: null,
    _itemList : null,
    _actions : null,

    ctor: function (id, content, timeStamp, name, avtIndex, msgIndex, isVIP, contentParams, itemList, action) {
        this._ownerId = id;
        this._content = content;
        this._timeStamp = timeStamp;
        this._ownerName = name;
        this._ownerAvtIndex = avtIndex;
        this._index = msgIndex;
        this._isVIP = isVIP
        this._contentParam = contentParams;
        if(itemList)
        {
            this._itemList = itemList;
        }
        if (contentParams) {
            this._content = bb.utility.formatStringWithParams(mc.dictionary.getI18nMsg(content), contentParams);
        }
        if(action)
        {
            this._actions = action;
        }
    },

    getActions : function()
    {
        return this._actions;
    },

    getItem : function()
    {
        return this._itemList;
    },

    getOwnerId: function () {
        return this._ownerId;
    },

    setIsOriginalLangShowed: function (flag) {
        this._isOriginalLangShowed = flag;
    },

    isOriginalLangShowed: function () {
        return this._isOriginalLangShowed;
    },

    getTraslatedContent: function () {
        return this._translatedContent;
    },

    setTraslateContent: function (ctent) {
        this._translatedContent = ctent;
    },

    getContentForShow: function () {
        if (this.isOriginalLangShowed()) {
            return this.getContent();
        } else {
            return this.getTraslatedContent();
        }
    },


    getOwnerName: function () {
        return this._ownerName;
    },

    getOwnerAvatarIndex: function () {
        return this._ownerAvtIndex;
    },

    getContent: function () {
        return this._content;
    },

    getTimeStamp: function () {
        return this._timeStamp;
    },

    getCreatedTime: function () {
        return Math.max(bb.now() - this._timeStamp, 1000);
    },

    getMsgIndex: function () {
        return this._index;
    },

    isVIP: function () {
        return this._isVIP;
    }

});

mc.Message.createFromJson = function (json) {
    return new mc.Message(json["senderId"], json["message"], json["time"], json["senderName"], json["avatar"], json["index"], json["vip"], json["contentParams"], json["items"],json["goTo"])
};

mc.ChatSystem.GROUP_CHAT_WORLD_ID = "world";
mc.ChatSystem.GROUP_CHAT_CLAN_ID = "guild";
mc.ChatSystem.GROUP_CHAT_PRIVATE_ID = "private";