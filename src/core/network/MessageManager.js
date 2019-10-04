/**
 * Created by longnguyen on 5/21/2016.
 */
var MessageManager = cc.Class.extend({
    _decoder: null,
    _encoder: null,
    _webSocket: null,
    _isConnected: false,
    _ips: null,
    _enableLog:false,

    _mapReceiveCallback: null,
    _mapFailCallback: null,
    _mapReceiveStaticCallback: null,

    _connectListener: null,

    setRemoteIps: function (ips) {
        this._ips = ips;
    },

    connect: function (listener) {
        this._mapReceiveCallback = {};
        this._mapFailCallback = {};
        this._mapReceiveStaticCallback = {};
        this._decoder = new MessageDecoder();
        this._encoder = new MessageEncoder();

        this._connectListener = listener;
        this._webSocket = new WebSocket(this._ips);
        this._webSocket.binaryType = 'arraybuffer';
        this._webSocket.onopen = this._onSocketOpen.bind(this);
        this._webSocket.onmessage = this._onSocketMessage.bind(this);
        this._webSocket.onerror = this._onSocketError.bind(this);
        this._webSocket.onclose = this._onSocketClose.bind(this);
    },

    closeSocket:function(){
        this._webSocket && this._webSocket.close();
    },

    setEnableLog:function(isLog){
        this._enableLog = isLog;
    },

    _onSocketOpen: function (event) {
        this._log("WebSocket OPEN");
        this._isConnected = true;
        this._connectListener && this._connectListener.onOpen && this._connectListener.onOpen(event);
    },

    _responseNo: 0,
    _toString: function (msgReceive, commandColor, target) {
        //var cmdAction = msgReceive.getCmdAction();
        //var message = "<br> <span style='color: " + commandColor + ";'>" + (target != null ? target : '') + QANT2X.SystemEvent[cmdAction]; + "</span><br><br>";
        //message += msgReceive.dump();
        //return message;
    },

    _onSocketMessage: function (event) {
        this._log("-------------------- onSocketMessage --------------------------");
        var message = QAntObject.newFromBinaryData(new Int8Array(event.data, 0));
        QANT2X.enqueueMessage(message);
        var isStatic = true;
        var msgID = message.getCmdAction();
        if(msgID == QANT2X.SystemRequest.CallExtension){
            var extObject = message.getValue("p");
            msgID = extObject.getValue("c");
            message = extObject.getValue("p");
        }else{
            message = message.getValue("p");
        }

        if (msgID != 0) {
            var arrCb = this._mapReceiveCallback[msgID];
            if (arrCb) {
                isStatic = false;
                if( this._enableLog ){
                    cc.log(msgID);
                    cc.log(message.toJson());
                }
                this._forwardMessage(message, arrCb);
                //this._mapReceiveCallback[msgID] = null;
            }
        }
        else {
            var arrFailCb = this._mapFailCallback[msgID];
            if (arrFailCb) {
                isStatic = false;
                this._forwardMessage(message, arrFailCb);
                //this._mapFailCallback[msgID] = null;
            }
        }

        if (isStatic) {
            var arrStaticCb = this._mapReceiveStaticCallback[msgID];
            if (arrStaticCb) {
                this._forwardMessage(message, arrStaticCb);
            }
        }
    },

    _forwardMessage: function (msgReceive, arrCb) {
        if (arrCb) {
            for (var i = 0; i < arrCb.length; i++) {
                var cb = arrCb[i];
                cb(msgReceive);
            }
        }
    },

    _onSocketError: function (event) {
        this._log("WebSocket ERROR");
        this._log(event);
        this._isConnected = false;
        this._connectListener && this._connectListener.onError && this._connectListener.onError(event);
    },

    _onSocketClose: function (event) {
        this._log("WebSocket CLOSE");
        this._log(event);
        this._isConnected = false;
        this._connectListener && this._connectListener.onClose && this._connectListener.onClose(event);
    },

    registerStaticCallback: function (staticReceiverID, staticCallback) {
        if (this._mapReceiveStaticCallback) {
            !this._mapReceiveStaticCallback[staticReceiverID] && (this._mapReceiveStaticCallback[staticReceiverID] = []);
            this._mapReceiveStaticCallback[staticReceiverID].push(staticCallback);
        }
    },

    unRegisterStaticCallback: function (staticReceiverID, callBack) {
        if (callBack && this._mapReceiveStaticCallback) {
            if (this._mapReceiveStaticCallback[staticReceiverID]) {
                var index = this._mapReceiveStaticCallback[staticReceiverID].indexOf(callBack);
                this._mapReceiveStaticCallback[staticReceiverID].splice(index, 1);
            }
        }
    },

    send_v2: function (object) {
        var message = object.toBinary();
        //this._log("----------> send: " + message);
        this._webSocket && this._webSocket.send(message);
    },


    addReceiveCallback: function (receiveID, receiverCallback) {
        !this._mapReceiveCallback[receiveID] && (this._mapReceiveCallback[receiveID] = []);
        this._mapReceiveCallback[receiveID].push(receiverCallback);
    },

    addFailCallback: function (failID, failCallback) {
        !this._mapFailCallback[failID] && (this._mapFailCallback[failID] = []);
        this._mapFailCallback[failID].push(failCallback);
    },

    _log: function (str) {
        this._enableLog && cc.log("[MessageManager] " + str);
    }

});
MessageManager = new MessageManager();
MessageManager.createMessage = function () {
    return new MessagePacket();
};
