mc.DynamicDailyEvent = bb.Class.extend({
    _runningEvent: null,
    _duration: null,


    ctor: function () {
        this._super();
    },

    addDailyEvent: function (events) {
        if (events) {
            this._runningEvent = events["seasonEventID"];
            this._duration = events["durationSeconds"];
        } else {
            this._runningEvent = null;
            this._duration = null;
        }
    },

    getRunningEvent: function () {
        return this._runningEvent;
    },

    getEventDuration: function () {
        return this._duration;
    }


});