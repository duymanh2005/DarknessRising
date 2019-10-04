/**
 * Created by longnguyen on 4/6/2016.
 */
bobo.EventReceiver = cc.Class.extend({
    _mapCallback: null,
    _nodeTarget: null,
    _isSetAutoUnRegister: false,

    ctor: function (nodeTarget) {
        this._nodeTarget = nodeTarget;
        this._mapCallback = {};
    },

    getWith: function (eventKey, callback, contextKey) {
        var id = bobo.Event._generateID(eventKey, contextKey);
        bobo.EventDispatcher._addCallback(id, callback);
        bobo.EventDispatcher._dispatchEvent(bobo.EventDispatcher._getFromPipe(id));
        !this._mapCallback[id] && (this._mapCallback[id] = callback);
        if (this._nodeTarget && !this._isSetAutoUnRegister) {
            this._isSetAutoUnRegister = true;
            var _superOnExit = this._nodeTarget.onExit.bind(this._nodeTarget);
            this._nodeTarget.onExit = function () {
                _superOnExit();
                this.unRegister();
            }.bind(this);
        }
        return this;
    },

    unRegister: function () {
        for (var id in this._mapCallback) {
            bobo.EventDispatcher._removeCallback(id, this._mapCallback[id]);
        }
        this._mapCallback = null;
        this._nodeTarget = null;
        this._isSetAutoUnRegister = false;
    }

});