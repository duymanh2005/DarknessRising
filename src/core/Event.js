/**
 * Created by longnguyen on 4/6/2016.
 */
bobo.Event = cc.Class.extend({
    _id: null,
    _eventKey: null,
    _contextKey: null,
    _data: null,

    ctor: function (eventKey, contextKey) {
        this._eventKey = eventKey;
        this._contextKey = contextKey || bobo.Event.KEY_DEFAULT_CONTEXT;
        this._id = bobo.Event._generateID(this._eventKey, this._contextKey);
    },

    setData: function (data) {
        this._data = data;
        return this;
    },

    getData: function (data) {
        return this._data;
    },

    send: function () {
        bobo.EventDispatcher._pushInPipe(this);
    }

});
bobo.Event.KEY_DEFAULT_CONTEXT = "default_context";
bobo.Event._generateID = function (eventKey, contextKey) {
    if (contextKey && !cc.isString(contextKey)) {
        contextKey = null;
        cc.error("[bobo.Event._generateID] set invalid context key!");
    }
    contextKey = contextKey || bobo.Event.KEY_DEFAULT_CONTEXT;
    return eventKey + "_" + contextKey;
}
