/**
 * Created by long.nguyen on 5/24/2017.
 */
mc.Progress = cc.Class.extend({
    _startTimeInMs: 0,
    _progressDurationInMs: 0,
    _valuePerSecond: 0,
    _baseValue: 0,
    _maxValue: 0,

    _markingValue: 0,

    setStartProgressTime: function (startTimeInMs) {
        if (!this._startTimeInMs) {
            this._startTimeInMs = startTimeInMs;
            this._markingValue = this._baseValue;
        } else {
            var val = this.getProductionValue();
            if (Math.floor(val) > 0 && this._markingValue != this._baseValue) { // sync ...
                var secondPerVal = 1 / this._valuePerSecond;
                this._startTimeInMs += Math.round(secondPerVal * 1000 * val);
                this._markingValue = this._baseValue;
            }
        }
    },

    setProgressDuration: function (duration) {
        if (duration) {
            this._progressDurationInMs = duration * 1000;
        }
    },

    setProductionValuePerSecond: function (valuePerSecond) {
        this._valuePerSecond = valuePerSecond;
    },

    setValue: function (baseValue, maxValue) {
        this._baseValue = baseValue;
        this._maxValue = maxValue;
    },

    getCurrentValue: function () {
        if (this._baseValue >= this._maxValue) {
            return this._baseValue;
        }
        var val = this._baseValue + this.getProductionValue();
        if (val > this._maxValue) {
            val = this._maxValue;
        }
        return val;
    },

    getMaxValue: function () {
        return this._maxValue;
    },

    getProductionValue: function () {
        var val = this.getDeltaDuration() * this._valuePerSecond;
        return val;
    },

    getDurationProductionPerValue: function () {
        if (this.getCurrentValue() >= this._maxValue) {
            return -1; // full
        }
        var msSecondPerVal = (1 / this._valuePerSecond) * 1000;
        var d = msSecondPerVal - this.getDeltaDurationInMs() % msSecondPerVal;
        return d;
    },

    getDeltaDuration: function () {
        var d = this.getDeltaDurationInMs();
        return d / 1000;
    },

    getDeltaDurationInMs: function () {
        return bb.now() - this._startTimeInMs;
    },

    getRemainDurationInMs: function () {
        var rm = this._progressDurationInMs - this.getDeltaDurationInMs();
        return rm;
    },

    getRemainTime: function () {
        var rm = this.getRemainDurationInMs();
        return rm / 1000;
    },

    isFinish: function () {
        var remainTime = this.getRemainDurationInMs();
        return remainTime <= 0;
    }

});