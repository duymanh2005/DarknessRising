/**
 * Created by long.nguyen on 7/27/2017.
 */
bb.Toucher = cc.Class.extend({});

bb.Dragger = cc.Class.extend({

    registerWidget: function (widget) {
        widget.addTouchEventListener(function (widget, type) {
            if (type === ccui.Widget.TOUCH_BEGAN) {
                // TODO: create click sound
                if (widget._soundId != undefined) {
                    bb.sound.playEffect(widget._soundId);
                }
                widget.stopActionByTag(actionTag);
                widget.stopActionByTag(999);
                widget._isTouchEnd = false;
                widget._isMove = false;
                widget._callLongClick = false;
                runEndTouchAnimation = false;

                var action = cc.scaleTo(0.07, scaleX + deltaScale, scaleY + deltaScale);
                action.setTag(actionTag);
                widget.runAction(action);
                var actSequence = cc.sequence([cc.delayTime(0.5), cc.callFunc(function () {
                    if (!widget._isTouchEnd && !widget._isMove && !widget._callLongClick) {
                        longClickFunc && longClickFunc(widget, 0);
                        widget._callLongClick = true;
                        if (isRepeat) {
                            var rpCount = 0;
                            var repeatSeq = cc.sequence([cc.delayTime(0.15), cc.callFunc(function () {
                                rpCount++;
                                longClickFunc && longClickFunc(widget, rpCount);
                            })]).repeatForever();
                            repeatSeq.setTag(repeatTag);
                            widget.runAction(repeatSeq);
                        }
                    }
                })]);
                actSequence.setTag(999);
                widget.runAction(actSequence);
                pressed = true;
            } else if (type === ccui.Widget.TOUCH_MOVED || type === ccui.Widget.TOUCH_ENDED) {
                if (pressed === false || (type === ccui.Widget.TOUCH_MOVED && bb.utility.hitTest(widget.getTouchMovePosition(), widget))) {
                    var dMove = cc.pDistance(widget.getTouchBeganPosition(), widget.getTouchMovePosition());
                    widget._isMove = dMove > 10;
                    return false;
                }
                widget._isTouchEnd = true;
                pressed = false;
                widget.stopActionByTag(actionTag);
                isRepeat && widget.stopActionByTag(repeatTag);
                if (type === ccui.Widget.TOUCH_ENDED && bb.utility.hitTest(widget.getTouchEndPosition(), widget)) {
                    widget.setScale(scaleX, scaleY);
                    clickFunc && !widget._callLongClick && !widget._isMove && clickFunc(widget, type);
                } else {
                    runEndTouchAnimation = true;
                }
                type === ccui.Widget.TOUCH_ENDED && endCallback && endCallback(widget, type);
            } else { // CANCELED
                endCallback && endCallback(widget, type);
                runEndTouchAnimation = true;
            }
            if (runEndTouchAnimation) {
                var action = cc.scaleTo(0.07, scaleX, scaleY);
                action.setTag(actionTag);
                widget.runAction(action);
            }
        });
        widget.setTouchEnabled(true);
    }

});