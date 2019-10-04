/**
 * Created by Thanh.Vo on 31/5/2019.
 */
mc.bubble = {};
mc.bubble.BubbleNode = cc.Sprite.extend({
    _moveToPoints: null,
    _opacityDefine: 160,
    _autoMoveToCornerEnabled: false,

    ctor: function ()  {
        cc.Sprite.prototype.ctor.apply(this, arguments);
        this._moveToPoints = [];

        var self = this, touchedId, dragged = false, touchedTime;
        var tListener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch) {
                if (touchedId != null || !self.isVisible())
                    return false;

                var touchP = touch.getLocation();
                if (!self.hitTest(touchP, self))
                    return false;

                touchedId = touch.getID();
                touchedTime = Date.now();
                self._onFocus(touchP);
                return true;
            },

            onTouchMoved: function (touch) {
                if (touch.getID() != touchedId)
                    return;

                var touchP = touch.getLocation();
                if (dragged)
                    return self._onDragging(touchP);

                if (Date.now() - touchedTime > 200 || !self.hitTest(touchP, self))
                    dragged = true;
            },

            onTouchEnded: function (touch) {
                if (touch.getID() != touchedId)
                    return;

                var touchP = touch.getLocation();
                if (dragged || !self.hitTest(touchP, self)) {
                    self._onDragFinished(touchP);
                } else if (Date.now() - touchedTime < 500) {
                    self._onClicked(touchP);
                }
                self._autoMoveToCornerEnabled = true;
                dragged = false;
                touchedId = undefined;
            },

            onTouchCancelled: function (touch) {
                if (touch.getID() != touchedId)
                    return;

                dragged && self._onDragFinished(touch.getLocation());
                self._autoMoveToCornerEnabled = true;

                dragged = false;
                touchedId = undefined;
            }
        };
        cc.eventManager.addListener(tListener, this);
        this.scheduleUpdate();
    },

    hitTest: function (pt, btn) {
        var bb = cc.rect(0, 0, btn.width, btn.height);
        return cc.rectContainsPoint(bb, btn.convertToNodeSpace(pt));
    },

    update: function (dt) {
        if (this._moveToPoints.length !== 0) {
            this.setPosition(this._moveToPoints.shift());
        } else if (this._autoMoveToCornerEnabled === true) {
            this._autoMoveToCornerEnabled = false;
            this._moveToCorner();
        }
    },

    _onFocus: function (p) {
        this._runSingleAction(cc.fadeIn(0.3),mc.bubble.FADE_TO_TAG);
        this._runSingleAction(cc.scaleTo(0.3, 1.1),mc.bubble.SCALE_TO_TAG);
    },

    _onDragging: function (p) {
        this._moveToPoints.push(p);
    },

    _onDragFinished: function (p) {
        this._moveToPoints.push(p);
    },

    _onClicked: function () {
    },

    _moveToCorner: function () {
        var x = this.x;
        var y = this.y;
        var w = this.width / 2 + 5;
        var h = this.height / 2 + 5;
        x = x < w ? w : (x > cc.visibleRect.width - w ? cc.visibleRect.width - w : x);
        y = y < h ? h : (y > cc.visibleRect.height - h ? cc.visibleRect.height - h : y);
        var dx = Math.min(cc.visibleRect.width - x, x);
        var dy = Math.min(cc.visibleRect.height - y, y);

        if (dx < dy) {
            this._runSingleAction(cc.moveTo(0.3, x < cc.visibleRect.width / 2 ? w : cc.visibleRect.width - w, y).easing(cc.easeSineIn()),mc.bubble.MOVE_TO_TAG);
        } else {
            this._runSingleAction(cc.moveTo(0.3, x, y < cc.visibleRect.height / 2 ? h : cc.visibleRect.height - h).easing(cc.easeSineIn()),mc.bubble.MOVE_TO_TAG );
        }
        this._runSingleAction(cc.sequence(cc.delayTime(2), cc.fadeTo(0.5, this._opacityDefine)),mc.bubble.FADE_TO_TAG);
        this._runSingleAction(cc.scaleTo(0.1, 1),mc.bubble.SCALE_TO_TAG);
    },

    _runSingleAction: function (action, tag) {
        this.stopActionByTag(tag);
        action.setTag(tag);
        this.runAction(action);
    }
});


mc.bubble.MOVE_TO_TAG = 1702;
mc.bubble.FADE_TO_TAG = 1703;
mc.bubble.SCALE_TO_TAG = 1704;