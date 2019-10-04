/**
 * Created by longnguyen on 4/6/2016.
 */
//(function(ctx){
//
//    var _EventDispatcher = ctx.EventDispatcher = {
//        _eventList:[]
//    };
//    _EventDispatcher._registerReceiver = function(receiver){
//
//    };
//    _EventDispatcher._addSender = function(sender){
//
//    };
//
//})(bobo.core);

bobo.EventDispatcher = cc.Class.extend({
    _eventPipe: null,
    _eventMap: null,
    _arrFuncMap: null,

    ctor: function () {
        this._eventPipe = [];
        this._eventMap = {};
        this._arrFuncMap = {};
    },

    _addCallback: function (id, callback) {
        if (!this._arrFuncMap[id]) {
            this._arrFuncMap[id] = [];
        }
        this._arrFuncMap[id].push(callback);
    },

    _removeCallback: function (id, callback) {
        cc.arrayRemoveObject(this._arrFuncMap[id], callback);
        if (this._arrFuncMap[id].length === 0) {
            delete this._arrFuncMap[id];
        }
    },

    _removeArrCallback: function (id, arrCallback) {
        cc.arrayRemoveArray(this._arrFuncMap[id], arrCallback)
        if (this._arrFuncMap[id].length === 0) {
            delete this._arrFuncMap[id];
        }
    },

    _pushInPipe: function (event) {
        var ev = event;
        if (!this._eventMap[event._id]) {
            this._eventPipe.push(event);
            this._eventMap[event._id] = event;
        } else {
            var oldEvent = this._eventMap[event._id];
            oldEvent._data = event._data;
            ev = event;
        }
        this._dispatchEvent(ev);
    },

    _dispatchEvent: function (event) {
        if (event) {
            var arrCallback = this._arrFuncMap[event._id];
            if (arrCallback) {
                for (var i = 0; i < arrCallback.length; i++) {
                    arrCallback[i](event);
                }
                this._popOutPipe(event);
            }
        }
    },

    _popOutPipe: function (event) {
        var index = this._eventPipe.indexOf(event);
        index >= 0 && this._eventPipe.splice(index, 1);
        this._eventMap[event._id] = null;
        delete this._eventMap[event._id];
    },

    _getFromPipe: function (id) {
        var event = this._eventMap[id];
        return event;
    }

});
bobo.EventDispatcher = new bobo.EventDispatcher();