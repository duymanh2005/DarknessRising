/**
 * Created by long.nguyen on 5/24/2017.
 */
cc.ShakeAction = cc.DelayTime.extend({
    _localPoint: null,

    ctor: function (duration, shakeSize) {
        this._super(duration || 0.3);
        this._shakeSize = shakeSize || cc.size(10, 10);
    },

    update: function (dt) {
        this._super(dt);

        var target = this.getTarget();
        if (!this._localPoint) {
            this._localPoint = cc.p(target.x, target.y);
        }
        if (this.isDone()) {
            target.x = this._localPoint.x;
            target.y = this._localPoint.y;
        } else {
            var hx = this._shakeSize.width * 0.5;
            var hy = this._shakeSize.height * 0.5;

            var sx = bb.utility.randomInt(-hx, hx);
            var sy = bb.utility.randomInt(-hy, hy);

            target.x = this._localPoint.x + sx;
            target.y = this._localPoint.y + sy;
        }

    }

});

/*
*  NOTE: FUCKED BUG will occur when use 'cc.sequence()'.
* */
cc.CountText = cc.DelayTime.extend({
    _currVal: 0,
    _newVal: 0,
    _valPerStep: 0,
    _beforeText: null,
    _afterText: null,

    ctor: function (duration, currVal, newVal) {
        this._super(duration || 0.5);
        this._currVal = currVal;
        this._newVal = newVal;
        var deltaVal = newVal - currVal;
        this._valPerStep = (deltaVal / this.getDuration());
    },

    setExtraText: function (beforeText, afterText) {
        this._beforeText = beforeText;
        this._afterText = afterText;
        return this;
    },

    update: function (dt) {
        this._super(dt);

        var target = this.getTarget();
        var currText = null;
        if (this.isDone()) {
            currText = "" + this._newVal;
            this.setDuration(0.0);
        } else {
            var runVal = Math.round(this.getElapsed() * this._valPerStep);
            currText = "" + (this._currVal + runVal);
        }
        currText = bb.utility.formatNumber(currText);
        this._beforeText && (currText = this._beforeText + currText);
        this._afterText && (currText = currText + this._afterText);
        target.setString(currText);
    }

});

cc.shake = function (duration, amount) {
    return new cc.ShakeAction(duration, amount).repeat(1);
};

cc.countText = function (duration, currVal, newVal) {
    return new cc.CountText(duration, currVal, newVal).repeat(1);
};

cc.sound = function (url) {
    return cc.callFunc(function () {
        bb.sound.playEffect(url);
    });
};

cc.doAfter = function (duration, func) {
    return new cc.Sequence([cc.delayTime(duration), cc.callFunc(func)]);
};