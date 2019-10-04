mc.widget_utility = mc.view_utility || {};

var FOCUS_INTERVAL = 500;
var BASE_SCALE = 0.5;
var DELTA_SCALE = 0.5;

var MCScrollLayout = ccui.Layout.extend({
    _iconList: null,
    _iconListForPos: null,
    _itemMargin: 5,
    _maxItemViews: 3,
    _loop: true,
    _scaleAnimate: false,

    ctor: function (listWidgets, focusWidget, iconWidth, contentSize, cb) {
        this._super();
        this._iconList = [];
        this._iconListForPos = [];
        this.returnCb = cb;
        // if (this.returnCb) {
        //     if (!this.returnCb.autoFocusFunc)
        //         this.returnCb.autoFocusFunc = this.returnCb.clickFunc;
        // }
        contentSize = contentSize || cc.p(cc.winSize.width, cc.winSize.height * 0.15);
        this.width = contentSize.x;
        this.height = contentSize.y;
        this._focus = focusWidget;

        this.maxWidth = iconWidth || 0;

        this.setCascadeOpacityEnabled && this.setCascadeOpacityEnabled(true);

        var layer = this;
        var iconIndex = 0;
        var layoutIndex = 0;
        for (var i in listWidgets) {
            var icon = listWidgets[i];
            if (icon.getParent()) {
                icon.removeFromParent();
            }
            icon.setVisible(true);
            this.addChild(icon, 10);
            this._iconList.push(icon);
            this._iconListForPos.push(icon);
            icon.iconIndex = iconIndex;
            icon.layoutIndex = layoutIndex;
            icon._touchScale = 0;
            iconIndex++;
            layoutIndex++;
            icon.registerTouchEvent = function (clickFunc, longClickFunc, isRepeat, endCallback) {
                var widget = this;
                var skipScale = true;
                var deltaScale = widget._touchScale || -0.005,
                    scaleX = widget.getScaleX(),
                    scaleY = widget.getScaleY(),
                    pressed = false,
                    actionTag = 99999,
                    repeatTag = 55555,
                    runEndTouchAnimation = false;
                widget.setTouchEnabled(true);
                widget.addTouchEventListener(function (widget, type) {
                    if (type === ccui.Widget.TOUCH_BEGAN) {
                        // TODO: create click sound
                        if (widget._soundId != undefined) {
                            bb.sound.playEffect(widget._soundId);
                        } else {
                            var defaultSoundId = bb.framework.getGUIFactory().createButtonSoundEffect();
                            defaultSoundId && bb.sound.playEffect(defaultSoundId);
                        }
                        widget.stopActionByTag(actionTag);
                        widget.stopActionByTag(999);
                        widget._isTouchEnd = false;
                        widget._isMove = false;
                        widget._callLongClick = false;
                        runEndTouchAnimation = false;
                        if (!skipScale) {
                            var action = cc.scaleTo(0.07, scaleX + deltaScale, scaleY + deltaScale);
                            action.setTag(actionTag);
                            widget.runAction(action);
                        }
                        var actSequence = cc.sequence([cc.delayTime(0.3), cc.callFunc(function () {
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
                        var p = widget.getTouchBeganPosition();
                        widget._movePos = cc.p(p.x, p.y);
                    } else if (type === ccui.Widget.TOUCH_MOVED || type === ccui.Widget.TOUCH_ENDED) {
                        if (pressed === false || (type === ccui.Widget.TOUCH_MOVED && bb.utility.hitTest(widget.getTouchMovePosition(), widget))) {
                            var dMove = cc.pDistance(widget.getTouchBeganPosition(), widget.getTouchMovePosition());
                            widget._isMove = dMove > 20;
                            return false;
                        }
                        widget._isTouchEnd = true;
                        pressed = false;
                        widget.stopActionByTag(actionTag);
                        isRepeat && widget.stopActionByTag(repeatTag);
                        if (type === ccui.Widget.TOUCH_ENDED && bb.utility.hitTest(widget.getTouchEndPosition(), widget)) {
                            !skipScale && widget.setScale(scaleX, scaleY);
                            if (clickFunc && !widget._callLongClick && !widget._isMove) {
                                clickFunc(widget, type);
                                bb.director.notifyTrackingDataChanged(new bb.TrackEvent(bb.framework.const.EVENT_CLICK).setUserData(widget));
                            }
                        } else {
                            runEndTouchAnimation = true;
                        }
                        type === ccui.Widget.TOUCH_ENDED && endCallback && endCallback(widget, type);
                    } else { // CANCELED
                        endCallback && endCallback(widget, type);
                        runEndTouchAnimation = true;
                        widget._isMove && layer.calculateFocusItem();
                    }
                    if (!skipScale && runEndTouchAnimation) {
                        var action = cc.scaleTo(0.07, scaleX, scaleY);
                        action.setTag(actionTag);
                        widget.runAction(action);
                    }
                });

            };
            icon.registerTouchEvent(function (widget) {
                this.focusAt(widget.iconIndex, false);
            }.bind(this));
            icon.setSwallowTouches(false);
            icon.setCascadeOpacityEnabled && icon.setCascadeOpacityEnabled(true);
        }
        this._focus && this.addChild(this._focus);
        this.setAnchorPoint(0.5, 0.5);
        this.addScrollEvent();
        this.calculateOffset();
    },

    nextItem: function () {
        this.moveToDir(1, 2);
    },

    preItem: function () {
        this.moveToDir(-1, 2);
    },

    toggleScaleAnimate: function (baseScale, deltaScale) {
        this._scaleAnimate = true;
        this.baseScale = baseScale;
        this.deltaScale = deltaScale;
    },

    setLoopScroll: function (bool, numItemsView) {
        if (this._iconList.length >= 3) {
            this._loop = bool;
            this.moveChild(0, true);
        } else {
            this._loop = false;
        }
        this._maxItemViews = numItemsView || 3;
        this.reLayout(true);
    },

    setItemMargin: function (margin) {
        this._itemMargin = margin;
        this.reLayout(true);
    },

    reLayout: function (ignorAnimate) {
        this.calculateOffset();
        this.iconLayout();
        this.calculateFocusItem(ignorAnimate);
    },

    calculateOffset: function () {
        for (var i in this._iconList) {
            var icon = this._iconList[i];
            this.maxWidth = Math.max(this.maxWidth, icon.width * icon.getScale());
        }

        this._startX = this.maxWidth / 2;
        this._deltaX = Math.abs((this.width - (this._maxItemViews * this.maxWidth)) / (this._maxItemViews - 1));
        if (this._deltaX <= this._itemMargin + this.maxWidth) {
            this._deltaX = this._itemMargin + this.maxWidth;
        }
    },

    addScrollEvent: function () {
        this.setTouchEnabled(true);
        this.addTouchEventListener(function (widget, type) {
            if (type === ccui.Widget.TOUCH_BEGAN) {
                var p = widget.getTouchBeganPosition();
                widget._BeginPos = cc.p(p.x, p.y);
                widget._movePos = cc.p(p.x, p.y);
                widget._isMove = false;
                this.count = 0;
                this.dir = 0;
            } else if (type === ccui.Widget.TOUCH_MOVED) {
                if (this.dir === 3)
                    return;

                var dMove = cc.pDistance(widget._BeginPos, widget.getTouchMovePosition());
                widget._isMove = dMove > 20;

                var p = widget.getTouchMovePosition();
                var dx = this._movePos.x - p.x;
                if (this.dir === 0) {
                    if (dx < 0) {
                        this.dir = -1;
                    }
                    if (dx > 0) {
                        this.dir = 1;
                    }
                } else {
                    if (dx / Math.abs(dx) !== this.dir) {
                        this.count = 0;
                        if (dx < 0) {
                            this.dir = -1;
                        }
                        if (dx > 0) {
                            this.dir = 1;
                        }
                    } else {
                        this.count++;
                    }
                }
                var dy = this._movePos.y - p.y;
                widget._movePos = cc.p(p.x, p.y);
                this.moveChild(dx, true);
            } else {
                if (this.count >= 3) {
                    this.moveToDir(this.dir);
                    this.dir = 3;
                    return;
                }
                widget._isMove && this.calculateFocusItem();
            }
        }, this);
    },

    moveToDir: function (dir, delta) {
        delta = delta || 1;
        switch (dir) {
            case -1:
                this.calculateFocusItem(false, this.maxWidth * 0.3 * dir * delta);
                break;
            case 1:
                this.calculateFocusItem(false, this.maxWidth * 0.3 * dir * delta);
                break;
        }
    },


    moveChild: function (dx, ignorAnimate) {
        var deltaX = this.width / 2;
        for (var i in this._iconList) {
            var icon = this._iconList[i];
            icon.stopAllActions();
            var nextX = icon.nextX = icon.x - dx;
            var percent = icon.getScale();
            var opacity = 255;
            if (this._scaleAnimate) {
                var iconXToCenter = Math.min(deltaX, Math.max(0, Math.abs(icon.nextX - deltaX)));
                var basescale = this.baseScale || BASE_SCALE;
                var deltascale = this.deltaScale || DELTA_SCALE;
                percent = basescale + deltascale * (1 - (iconXToCenter / deltaX));
                opacity = Math.min(percent * 255, 255);
            }
            if (ignorAnimate) {
                icon.x = nextX;
                icon.setOpacity(opacity);
                icon.setScale(percent);
            } else {
                icon.runAction(cc.spawn(cc.moveBy(0.2, -dx, 0), cc.fadeTo(0.2, opacity), cc.scaleTo(0.2, percent)));
            }
        }
        for (var j = 0; j < this._maxItemViews / 2; j++) {
            this._iconListForPos.sort(function (a, b) {
                return a.nextX - b.nextX;
            });
            var min = this._iconListForPos[0];
            var max = this._iconListForPos[this._iconList.length - 1];
            if (this._loop) {
                if (min && max) {
                    if (dx > 0) {
                        if (min.nextX < -this.maxWidth / 2) {
                            min.x = max.x + this._deltaX;
                            min.nextX = min.x;
                        }
                    } else if (dx < 0) {
                        if (max.nextX > this.width + this.maxWidth / 2) {
                            max.x = min.x - this._deltaX;
                            max.nextX = max.x;
                        }
                    }
                }
            }
        }
        this._focus && this._focus.setOpacity(0);
    },

    calculateFocusItem: function (ignorAnimate, delta) {
        delta = delta || 0;
        var deltaX = 10000;
        var nearest = null;
        for (var i in this._iconList) {
            var icon = this._iconList[i];
            var number = this.width / 2 - icon.x;
            if (Math.abs(number + delta) - delta < Math.abs(deltaX + delta)) {
                deltaX = number;
                nearest = icon;
            }
        }

        if (nearest) {
            this.moveChild(-(deltaX), ignorAnimate);
            var index = this.lastFocusIndex = nearest.iconIndex;
            if (this._focus) {
                this._focus.stopAllActions();
                this._focus.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeIn(0.3), cc.callFunc(function () {
                    if (nearest && !ignorAnimate) {
                        if (this.lastFocus === index && (!this.lastFocusTime || (Date.now() - this.lastFocusTime) < FOCUS_INTERVAL)) {
                            return;
                        }
                        this.lastFocus = index;
                        this.lastFocusTime = Date.now();
                        this.returnCb && this.returnCb.autoFocusFunc && this.returnCb.autoFocusFunc(nearest.getReturnKey ? nearest.getReturnKey() : nearest.iconIndex);
                    }
                }, this)));
            } else {
                if (nearest && !ignorAnimate) {
                    if (this.lastFocus === index && (!this.lastFocusTime || (Date.now() - this.lastFocusTime) < FOCUS_INTERVAL)) {
                        return;
                    }
                    this.lastFocus = index;
                    this.lastFocusTime = Date.now();
                    this.returnCb && this.returnCb.autoFocusFunc && this.returnCb.autoFocusFunc(nearest.getReturnKey ? nearest.getReturnKey() : nearest.iconIndex);
                }
            }

            if (this.lastFocusIndex === 0) {
                this.atBegin && this.atBegin();
            } else if (this.lastFocusIndex === this._iconList.length - 1) {
                this.atEnd && this.atEnd();
            } else {
                this.atMid && this.atMid();
            }

        }
    },

    setScrollListener: function (listener) {
        if (listener) {
            this.atBegin = listener["atBegin"];
            this.atMid = listener["atMid"];
            this.atEnd = listener["atEnd"];
        }
    },

    focusAt: function (index, ignorAnimate, focusOnly) {
        var nearest = this._iconList[index];
        if (nearest) {
            var deltaX = this.width / 2 - nearest.x;
            this.moveChild(-deltaX, ignorAnimate);
            if (this._focus) {
                this._focus.stopAllActions();
                this._focus.runAction(cc.sequence(cc.delayTime(0.3), cc.fadeIn(0.3), cc.callFunc(function () {
                    if (nearest && !ignorAnimate) {
                        if (this.lastFocus === index && (!this.lastFocusTime || (Date.now() - this.lastFocusTime) < FOCUS_INTERVAL)) {
                            return;
                        }
                        this.lastFocus = index;
                        this.lastFocusTime = Date.now();
                        !focusOnly && this.returnCb && this.returnCb.clickFunc && this.returnCb.clickFunc(nearest.getReturnKey ? nearest.getReturnKey() : nearest.iconIndex);
                    }
                }, this)));
            } else {
                if (nearest && !ignorAnimate) {
                    if (this.lastFocus === index && (!this.lastFocusTime || (Date.now() - this.lastFocusTime) < FOCUS_INTERVAL)) {
                        return;
                    }
                    this.lastFocus = index;
                    this.lastFocusTime = Date.now();
                    !focusOnly && this.returnCb && this.returnCb.clickFunc && this.returnCb.clickFunc(nearest.getReturnKey ? nearest.getReturnKey() : nearest.iconIndex);
                }
            }
        }
    },

    iconLayout: function () {
        for (var i in this._iconList) {
            var icon = this._iconList[i];
            icon.setAnchorPoint(0.5, 0.5);
            icon.x = this._startX + this._deltaX * icon.layoutIndex;
            icon.y = this.height / 2;
        }
        this._focus && this._focus.setPosition(this.width / 2, this.height / 2);
    },

    getItemAt: function (index) {
        return this._iconList[index];
    }

});


(function (ctx) {
    ctx.createScrollNode = function (listIcon, focus, iconWidth, size, cb) {
        return new MCScrollLayout(listIcon, focus, iconWidth, size, cb);
    };
})(mc.widget_utility);

mc.gesture = {};
(function (ctx) {
    var DELTA_CANCEL = 10;
    var gestureIdx = 0;
    var Gesture = cc.Class.extend({
        _btPoint: null,
        _btTime: 0,
        _enabled: true,
        _clientCb: null,
        _detectorCb: null,

        ctor: function (clientCb) {
            this._clientCb = clientCb;
            this._btPoint = new cc.p();
            this.__id = gestureIdx++;
        },

        getId: function () {
            return this.__id;
        },

        _leaveFromActiveQueue: function () {
        },

        _goToActiveQueue: function () {
        },

        _onTouchBegan: function (p) {
            this._updateTouch(p);
            this._doBegin();
        },

        _updateTouch: function (p) {
            var bp = this._btPoint;
            bp.x = p.x;
            bp.y = p.y;
            this._btTime = Date.now();
        },

        _onTouchMoved: function (p) {
        },

        _onTouchEnded: function (p) {
        },

        _doBegin: function () {
            var clientCb = this._clientCb;
            var detectorCb = this._detectorCb;
            if (clientCb && clientCb["onGestureBegan"]) {
                var clientAccepted = clientCb["onGestureBegan"].call(clientCb, this, this._btPoint);
                if (!clientAccepted) {
                    detectorCb.onGestureCancelled(this);
                }
            }
        },

        _doComplete: function () {
            var clientCb = this._clientCb;
            var detectorCb = this._detectorCb;
            if (clientCb && clientCb["onGestureCompleted"]) {
                var clientAccepted = clientCb["onGestureCompleted"].call(clientCb, this, this._btPoint);
                if (!clientAccepted) {
                    detectorCb.onGestureCancelled(this);
                    return;
                }
            }
            detectorCb.onGestureCompleted(this);
        },

        _doCancel: function () {
            var clientCb = this._clientCb;
            var detectorCb = this._detectorCb;
            if (clientCb && clientCb["onGestureCancelled"]) {
                clientCb["onGestureCancelled"].call(clientCb, this);
            }
            detectorCb.onGestureCancelled(this);
        }
    });
    var DIRECTS = ctx.directions = {LEFT: 1, RIGHT: 2, UP: 3, DOWN: 4};
    ctx.DragGesture = Gesture.extend({
        _direction: 0,

        ctor: function (direction, listener) {
            this._super(listener);
            this._direction = direction;
        },

        _onTouchMoved: function (p) {
            var direction = this._direction;
            var btPoint = this._btPoint;
            var btTime = this._btTime;
            var completed = false;
            var cancelled = false;
            switch (direction) {
                case DIRECTS.LEFT:
                    var dy = Math.abs(btPoint.y - p.y);
                    var dx = btPoint.x - p.x;
                    if (dx < dy && dx > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dx * 100 / (Date.now() - btTime) > cc.visibleRect.width / 30;
                    }
                    break;

                case DIRECTS.RIGHT:
                    var dy = Math.abs(btPoint.y - p.y);
                    var dx = p.x - btPoint.x;
                    if (dx < dy && dx > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dx * 100 / (Date.now() - btTime) > cc.visibleRect.width / 30;
                    }
                    break;

                case DIRECTS.UP:
                    var dy = p.y - btPoint.y;
                    var dx = Math.abs(p.x - btPoint.x);
                    if (dy < dx && dy > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dy * 100 / (Date.now() - btTime) > cc.visibleRect.height / 30;
                    }
                    break;

                case DIRECTS.DOWN:
                    var dy = btPoint.y - p.y;
                    var dx = Math.abs(p.x - btPoint.x);
                    if (dy < dx && dy > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dy * 100 / (Date.now() - btTime) > cc.visibleRect.height / 30;
                    }
                    break;
            }

            if (cancelled) {
                this._doCancel();
            } else if (completed) {
                this._doComplete();
            }
        },

        _onTouchEnded: function (p) {
            if (Date.now() - this._btTime > 200) {
                this._doCancel();
                return;
            }

            var type = this._type;
            var btPoint = this._btPoint;
            var completed = false;
            var cancelled = false;
            switch (type) {
                case DIRECTS.LEFT:
                    var dy = Math.abs(btPoint.y - p.y);
                    var dx = btPoint.x - p.x;
                    if (dx < dy && dx > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dx > cc.visibleRect.width / 40;
                    }
                    break;

                case DIRECTS.RIGHT:
                    var dy = Math.abs(btPoint.y - p.y);
                    var dx = p.x - btPoint.x;
                    if (dx < dy && dx > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dx > cc.visibleRect.width / 40;
                    }
                    break;

                case DIRECTS.UP:
                    var dy = p.y - btPoint.y;
                    var dx = Math.abs(p.x - btPoint.x);
                    if (dy < dx && dy > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dy > cc.visibleRect.height / 40;
                    }
                    break;

                case DIRECTS.DOWN:
                    var dy = btPoint.y - p.y;
                    var dx = Math.abs(p.x - btPoint.x);
                    if (dy < dx && dy > DELTA_CANCEL) {
                        cancelled = true;
                    } else {
                        completed = dy > cc.visibleRect.height / 40;
                    }
                    break;
            }

            if (cancelled) {
                this._doCancel();
            } else if (completed) {
                this._doComplete();
            }
        }
    });
    ctx.Detector = cc.Class.extend({
        _touchLis: null,
        _gestures: null,
        _gesturesInActiveQueue: null,
        _pause: false,
        _waitingTouchEnded: false,
        _lastUpdated: 0,
        _delayedInterval: 10000,
        _gestureStateLis: null,
        _stopSession: false,

        ctor: function (node) {
            var self = this;
            self._gestures = {};
            self._gesturesInActiveQueue = {};
            self._gestureStateLis = {

                onGestureCancelled: function (gesture) {
                    gesture._leaveFromActiveQueue();
                    delete self._gesturesInActiveQueue[gesture.__id];
                    delete self._touchEvent;
                },

                onGestureCompleted: function () {
                    self._stopSession = true;
                    self._waitingTouchEnded = false;
                    self._cleanupActiveQueue();
                    var event = self._touchEvent;
                    delete self._touchEvent;
                    event && cc.sys.isObjectValid(event) && event.stopPropagation();
                }
            };

            /* Touch */
            var touchLis = self._touchLis = cc.EventListener.create({
                event: cc.EventListener.TOUCH_ONE_BY_ONE,
                swallowTouches: false,

                onTouchBegan: function (touchEvt, evt) {
                    if (self._pause || self._waitingTouchEnded)
                        return false;

                    self._lastUpdated = Date.now();
                    self._waitingTouchEnded = true;
                    self._stopSession = false;

                    // pick
                    var gestures = self._gestures;
                    var activeQueue = self._gesturesInActiveQueue;
                    for (var id in gestures) {
                        var gesture = gestures[id];
                        if (gesture._enabled && !activeQueue[id]) {
                            activeQueue[id] = gesture;
                            gesture._goToActiveQueue();
                        }
                    }

                    this._dispatchEvent("_onTouchBegan", touchEvt, evt);
                    return true;
                },

                onTouchMoved: function (touchEvt, evt) {
                    if (self._stopSession || !self._assertInInterval()) {
                        self._stopSession && evt.stopPropagation();
                        return;
                    }
                    this._dispatchEvent("_onTouchMoved", touchEvt, evt);
                },

                onTouchEnded: function (touchEvt, evt) {
                    self._waitingTouchEnded = false;
                    if (self._stopSession || !self._assertInInterval()) {
                        self._stopSession && evt.stopPropagation();
                        return;
                    }

                    this._dispatchEvent("_onTouchEnded", touchEvt, evt);
                },

                onTouchCancelled: function (touchEvt, evt) {
                    self._waitingTouchEnded = false;
                    self._stopSession && evt.stopPropagation();
                    self._cleanupActiveQueue();
                },

                _dispatchEvent: function (eventName, touchPoint, evt) {
                    self._touchEvent = evt;
                    var p = touchPoint.getLocation();
                    var activeQueue = self._gesturesInActiveQueue;
                    for (var id in activeQueue) {
                        if (self._stopSession)
                            break;

                        var gesture = activeQueue[id];
                        if (!gesture._enabled) {
                            gesture._leaveFromActiveQueue();
                            delete activeQueue[id];
                            continue;
                        }
                        gesture[eventName] && gesture[eventName](p);
                    }
                }

            });
            cc.eventManager.addListener(touchLis, node);
        },

        swallowTouch: function (enabled) {
            this._touchLis.setSwallowTouches(!!enabled);
        },

        _cleanupActiveQueue: function () {
            var activeQueue = this._gesturesInActiveQueue;
            for (var i in activeQueue) {
                activeQueue[i]._leaveFromActiveQueue();
                delete activeQueue[i];
            }
        },

        /**
         * @param gesture {Gesture}
         */
        addGesture: function (gesture) {
            var gestures = this._gestures;
            var id = gesture.__id;
            if (gestures[id])
                return;

            gesture._detectorCb = this._gestureStateLis;
            this._gestures[id] = gesture;
        },

        removeGesture: function (gesture) {
            var gestures = this._gestures;
            var activeQueue = this._gesturesInActiveQueue;
            var id = gesture.__id;
            if (!gestures[id])
                return;

            delete gestures[id];
            if (activeQueue[id]) {
                gesture._leaveFromActiveQueue();
                delete activeQueue[id];
            }
        },

        pauseGesture: function (gesture) {
            var gestures = this._gestures;
            var id = gesture.__id;
            if (!gestures[id] || !gesture._enabled)
                return;

            gesture._enabled = false;

            var activeQueue = this._gesturesInActiveQueue;
            if (activeQueue[id]) {
                gesture._leaveFromActiveQueue();
                delete activeQueue[id];
            }
        },

        resumeGesture: function (gesture) {
            var gestures = this._gestures;
            var id = gesture.__id;
            if (!gestures[id] || gesture._enabled)
                return;

            gesture._enabled = true;
        },

        resume: function () {
            this._pause = false;
        },

        pause: function () {
            if (this._pause)
                return;

            this._pause = true;
            this._stopSession = true;
            this._cleanupActiveQueue();
        },

        clear: function () {
            this._gestures = {};
            this._stopSession = true;
            this._waitingTouchEnded = false;
            this._cleanupActiveQueue();

        },

        _assertInInterval: function () {
            var curr = Date.now();
            var old = this._lastUpdated || curr;
            var flag = curr - old <= this._delayedInterval;
            if (!flag) {
                this._cleanupActiveQueue();
            }
            this._lastUpdated = curr;
            return flag;
        }
    });
})(mc.gesture);