/**
 * Created by longnguyen on 4/6/2016.
 */
bobo.EventSender = cc.Class.extend({
    _arrEvent: null,

    ctor: function () {
        this._arrEvent = [];
    },

    setWith: function (eventKey, contextKey) {
        this._arrEvent.push(new bobo.Event(eventKey, contextKey));
        return this;
    },

    send: function () {
        for (var i = 0; i < this._arrEvent.length; i++) {
            bobo.EventDispatcher._pushInPipe(this._arrEvent[i]);
        }
        this._arrEvent.length = 0;
    }

});