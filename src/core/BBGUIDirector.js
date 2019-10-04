/**
 * Created by longnguyen on 10/18/2016.
 */
bb.GUIDirector = cc.Class.extend({
    _dialogStack: null,
    _runningScene: null,
    _arrTrackObjMapByEventName: null,

    ctor: function () {
        this._dialogStack = [];
        this._arrTrackObjMapByEventName = {};
        this.__preventGeneratorId = 0;
        var isHiding = false;
        cc.eventManager.addCustomListener(cc.game.EVENT_HIDE, function () {
            //mrkTime = bobo.msTime();
            cc.log("hide game!");
            if (!isHiding) {
                isHiding = true;
                var scr = this.getCurrentScreen();
                scr && scr.onScreenPause && scr.onScreenPause();
            }
        }.bind(this));
        cc.eventManager.addCustomListener(cc.game.EVENT_SHOW, function () {
            //var sleepTimeInMs = bobo.msTime() - mrkTime;
            //cc.log("show game! " + sleepTimeInMs);
            //new bobo.Event(bb.const.EVEN_GAME_RESUME).setData(sleepTimeInMs).send();
            if (isHiding) {
                isHiding = false;
                var scr = this.getCurrentScreen();
                scr && scr.onScreenResume && scr.onScreenResume();
            }
        }.bind(this));
    },

    trackGlueObject: function (glueObjectOrName, cb) {
        var glueName = cc.isObject(glueObjectOrName) ? glueObjectOrName.getGlueName() : glueObjectOrName;
        if (!this._arrTrackObjMapByEventName[glueName]) {
            this._arrTrackObjMapByEventName[glueName] = [];
        }
        var trackObj = {name: glueName, cb: cb};
        this._arrTrackObjMapByEventName[glueName].push(trackObj);
        return trackObj;
    },

    unTrackGlueObject: function (retTrackObj) {
        var glueName = retTrackObj.name;
        if (this._arrTrackObjMapByEventName[glueName]) {
            cc.arrayRemoveObject(this._arrTrackObjMapByEventName[glueName], retTrackObj)
        }
    },

    notifyTrackingDataChanged: function (trackEvent) {
        var arrTrackObj = this._arrTrackObjMapByEventName[trackEvent.getGlueName()];
        if (arrTrackObj) {
            for (var i = 0; i < arrTrackObj.length; i++) {
                var cb = arrTrackObj[i].cb;
                cb && cb(trackEvent.getUserData());
            }
        }
    },

    getCurrentScreen: function () {
        var scr = null;
        var scene = this._runningScene;
        if (scene) {
            var childs = scene.getChildren();
            for (var i = 0; i < childs.length; i++) {
                if (childs[i] instanceof bb.Screen) {
                    scr = childs[i];
                    break;
                }
            }
        }
        return scr;
    },

    getCurrentRunningScene: function () {
        return this._runningScene || cc.director.getRunningScene();
    },

    runScreen: function (newScreen, loadingLayer) {
        var oldScreen = this.getCurrentScreen();

        var arrReleaseURL = null;
        var arrLoadURL = !cc.sys.isNative ? newScreen.getPreLoadURL() : [];
        if (oldScreen) {
            oldScreen.onScreenClose();
            this._arrTrackObjMapByEventName = {}; // clear all track.
            bb.director._dialogStack.length = 0; // release all dialog stack in previous screen.

            var mapReleaseURL = !cc.sys.isNative ? oldScreen._getMapPreLoadURL() : {};
            for (var i = arrLoadURL.length - 1; i >= 0; i--) {
                var url = arrLoadURL[i];
                if (mapReleaseURL[url]) {
                    delete mapReleaseURL[url]; // no need release
                    arrLoadURL.splice(i, 1); // no need loading
                }
            }
            arrReleaseURL = bb.utility.mapToArray(mapReleaseURL);
        }


        var newScene = this._runningScene = new cc.Scene();
        var loadLayer = loadingLayer || null;
        if (!loadLayer) {
            loadLayer = bb.framework.getGUIFactory().createLoadingLayer();
        }
        var notifyData = null;
        if (this._notifyRelicMatch) {
            //this._notifyRelicMatch.runAction(cc.callFunc(function () {
            //    this._notifyRelicMatch.removeFromParent();
            //    newScreen.addChild(this._notifyRelicMatch);
            //    this._notifyRelicMatch.reload();
            //}.bind(this)));
            var notifyData = this._notifyRelicMatch.getData();
            this._notifyRelicMatch.forceClose();
        }

        newScene.addChild(newScreen);
        newScene.addChild(loadLayer);

        loadLayer.scheduleOnce(function () {
            if (!cc.sys.isNative) {
                if (arrReleaseURL) {
                    for (var i = 0; i < arrReleaseURL.length; i++) {
                        cc.loader.release(arrLoadURL[i]);
                    }
                }
                cc.loader.load(arrLoadURL, function (result, count, loadedCount) {
                    var percent = (loadedCount / count * 100) | 0;
                }, function () {
                    newScreen._appendPreLoadURL(arrLoadURL);
                    newScreen.initResources();
                    newScreen._isInitRes = true;
                    cc.sys.isNative && cc.textureCache.removeUnusedTextures();
                    loadLayer.runAction(cc.sequence([cc.fadeOut(0.3), cc.callFunc(function () {
                        loadLayer.setVisible(false);
                        loadLayer.runAction(cc.removeSelf());
                        newScreen.onScreenShow();
                    })]));
                });
            } else {
                newScreen.initResources();
                newScreen._isInitRes = true;
                cc.sys.isNative && cc.textureCache.removeUnusedTextures();
                loadLayer.runAction(cc.sequence([cc.fadeOut(0.3), cc.callFunc(function () {
                    loadLayer.setVisible(false);
                    loadLayer.runAction(cc.removeSelf());
                    newScreen.onScreenShow();
                })]));
            }
        }, 1.0);

        var transitionScene = bb.framework.getGUIFactory().createTransitionScene(newScene);
        cc.director.runScene(transitionScene ? transitionScene : newScene);
        if (notifyData) {
            mc.GUIFactory._notifyVSRelicMatch = null;
            mc.GUIFactory.notifyVSRelicMatch(notifyData, false);
        }

    },

    getAllDialog: function () {
        return this._dialogStack;
    },

    getTopMostDialog: function () {
        if (this._dialogStack.length > 0) {
            return this._dialogStack[this._dialogStack.length - 1];
        }
        return null;
    },

    getDialogByName: function (name) {
        if (this._dialogStack.length > 0) {
            for (var i = 0; i < this._dialogStack.length; i++) {
                if (this._dialogStack[i].getName() === name) {
                    return this._dialogStack[i];
                }
            }
        }
        return null;
    },

    _processBackKey: function () {
        var topMostDialog = this.getTopMostDialog();
        var isBack = false;
        if (topMostDialog) {
            if (topMostDialog.isAnimating()) {
                isBack = true; // cancel back event.
            } else {
                isBack = topMostDialog.onBackEvent();
            }
        }
        if (!isBack) {
            var childs = this._runningScene.getChildren();
            var layer = cc.sys.isNative ? childs[1] : childs[0];
            layer && layer.onBackEvent && layer.onBackEvent();
        }
    },

    _createLayerColor: function () {
        var layerColor = new cc.LayerColor(cc.color(0, 0, 0, 0));
        //var preventWidget = new ccui.Layout();
        //preventWidget.width = cc.winSize.width;
        //preventWidget.height = cc.winSize.height;
        //preventWidget._touchScale = 0.0001;
        //preventWidget.registerTouchEvent(function(){
        //    var topMostDialog = this.getTopMostDialog();
        //    topMostDialog && !topMostDialog.isAnimating() && topMostDialog._clickOutSize();
        //}.bind(this));
        //layerColor.addChild(preventWidget);
        layerColor.setName("layer_color");
        return layerColor;
    },

    _updateZOrderLayerColor: function () {
        var layerColor = this._runningScene.getChildByName("layer_color");
        if (layerColor) {
            var maxLocalZ = 0;
            var topDialog = null;
            for (var i = 0; i < this._dialogStack.length; i++) {
                if (this._dialogStack[i].getLocalZOrder() > maxLocalZ) {
                    topDialog = this._dialogStack[i];
                    maxLocalZ = this._dialogStack[i].getLocalZOrder();
                }
            }
            layerColor.setLocalZOrder(maxLocalZ - 1);
        }
    },

    _createPreventLayer: function (dialog) {
        var layout = new ccui.Layout();
        layout.width = cc.winSize.width;
        layout.height = cc.winSize.height;
        layout.setTouchEnabled(true);
        layout.setLocalZOrder(9999999999999);
        layout.__preventGeneratorId = this.__preventGeneratorId++;
        dialog.__preventGeneratorId = layout.__preventGeneratorId;
        this._runningScene.addChild(layout);
    },

    _removePreventLayer: function (dialog) {
        var childs = this._runningScene.getChildren();
        for (var i = 0; i < childs.length; i++) {
            if (childs[i].__preventGeneratorId != undefined) {
                if (childs[i] != dialog &&
                    childs[i].__preventGeneratorId === dialog.__preventGeneratorId) {
                    childs[i].removeFromParent();
                    break;
                }
            }
        }
    },

    showNotification: function (notifyView, animation) {
        if (!this._runningScene) {
            this._runningScene = cc.director.getRunningScene();
        }
        notifyView.setLocalZOrder(99999999 + notifyView.priorityView());
        notifyView._isAnimating = true;
        var _callbackAction = cc.callFunc(function (notifyView) {
            notifyView.onShow();
        }.bind(this), notifyView);
        var _callbackClose = cc.callFunc(function (notifyView) {
            notifyView.onClose();
        }.bind(this), notifyView);
        var timeFinish = 0;

        if (!timeFinish) {
            timeFinish = notifyView.overrideShowAnimation();
        }
        if (!timeFinish) {
            timeFinish = 0.3;
            if (!animation) {
                timeFinish = 0;
            }
            notifyView._showAction = notifyView.runAction(cc.sequence([cc.moveTo(timeFinish, cc.p(notifyView.x, notifyView.y - notifyView.height)), _callbackAction]));
        } else {
            notifyView._showAction = notifyView.runAction(cc.sequence([cc.delayTime(timeFinish), _callbackAction]));
        }
        this.getCurrentScreen().addChild(notifyView);
        notifyView._closeAction = notifyView.runAction(cc.sequence([cc.delayTime(notifyView.overrideVisibleTimeAnimation()), cc.moveTo(timeFinish, cc.p(notifyView.x, cc.winSize.height)), _callbackClose]))
    },

    forceCloseNotification: function (notifyView) {
        var timeFinish = 0;
        if (!timeFinish) {
            timeFinish = notifyView.overrideShowAnimation();
        }
        if (!timeFinish) {
            timeFinish = 0.3;
        }
        var _callbackClose = cc.callFunc(function (notifyView) {
            notifyView.onClose();
        }.bind(this), notifyView);
        if (notifyView._closeAction) {
            notifyView.stopAction(notifyView._closeAction);
        }
        notifyView._closeAction = notifyView.runAction(cc.sequence([cc.moveTo(timeFinish, cc.p(notifyView.x, cc.winSize.height)), _callbackClose]));
    },

    updateVisibleTimeNotification: function (notifyView, time) {
        var timeFinish = 0;
        if (!timeFinish) {
            timeFinish = notifyView.overrideShowAnimation();
        }
        if (!timeFinish) {
            timeFinish = 0.3;
        }
        var _callbackClose = cc.callFunc(function (notifyView) {
            notifyView.onClose();
        }.bind(this), notifyView);
        if (notifyView._closeAction) {
            notifyView.stopAction(notifyView._closeAction);
        }
        notifyView._closeAction = notifyView.runAction(cc.sequence([cc.delayTime(time), cc.moveTo(timeFinish, cc.p(notifyView.x, cc.winSize.height)), _callbackClose]));
    },


    showDialog: function (dialog, transitionFunc) {
        if (!this._runningScene) {
            this._runningScene = cc.director.getRunningScene();
        }
        dialog.setLocalZOrder(9999999 + (this._dialogStack.length * 10) + (dialog._isTopMost ? 10 : 0));
        dialog._isAnimating = true;
        this._createPreventLayer(dialog);
        var _callbackAction = cc.callFunc(function (dialog) {
            this._removePreventLayer(dialog);
            dialog._isAnimating = false;
            dialog.onShow();
        }.bind(this), dialog);
        var timeFinish = 0;
        if (transitionFunc) {
            timeFinish = transitionFunc(dialog);
        }
        if (!timeFinish) {
            timeFinish = dialog.overrideShowAnimation();
        }
        if (!timeFinish) {
            timeFinish = 0.3;
            dialog.setScale(0, 0);
            dialog.runAction(cc.sequence([cc.scaleTo(timeFinish, 1, 1).easing(cc.easeBackOut()), _callbackAction]));
        } else {
            dialog.runAction(cc.sequence([cc.delayTime(timeFinish), _callbackAction]));
        }

        var layerColor = this._runningScene.getChildByName("layer_color");
        if (layerColor && layerColor._isClosing) {
            layerColor.removeFromParent();
            layerColor = null;
        }
        if (!layerColor) {
            layerColor = this._createLayerColor();
            dialog._needShowUnderLayer && layerColor.runAction(cc.sequence([cc.fadeTo(timeFinish, bb.framework.getTrueOpacity(128))]));
            this._runningScene.addChild(layerColor);
        }

        this._runningScene.addChild(dialog);
        this._dialogStack.push(dialog);
        this._updateZOrderLayerColor();
    },

    closeDialog: function (dialog) {
        if (this._dialogStack.length > 0) {
            var self = this;
            var isAnimation = (dialog === this._dialogStack[this._dialogStack.length - 1]);
            cc.arrayRemoveObject(this._dialogStack, dialog);
            var _callbackAction = cc.callFunc(function (dialog) {
                this._removePreventLayer(dialog);
                dialog._isAnimating = false;
                dialog.onClose();
                dialog.removeFromParent();
                this._updateZOrderLayerColor();
            }.bind(this), dialog);
            if (isAnimation) {
                dialog._isAnimating = true;
                var timeFinish = dialog.overrideCloseAnimation();
                if (timeFinish <= 0) {
                    timeFinish = 0.3;
                    dialog.runAction(cc.sequence([cc.scaleTo(timeFinish, 0, 0).easing(cc.easeBackIn()), _callbackAction]));
                } else {
                    dialog.runAction(cc.sequence([cc.delayTime(timeFinish), _callbackAction]));
                }

                if (this._dialogStack.length === 0) {
                    var layerColor = this._runningScene.getChildByName("layer_color");
                    if (layerColor) {
                        layerColor._isClosing = true;
                        layerColor.runAction(cc.sequence([cc.fadeOut(timeFinish), cc.removeSelf(true)]));
                    }
                }
            } else {
                dialog.runAction(_callbackAction);
            }
        }
    }
});
bb.director = new bb.GUIDirector();

bb.TrackingData = cc.Class.extend({
    _arrGlueName: null,
    _cb: null,

    ctor: function (arrGlueName, cb) {
        this._arrGlueName = arrGlueName;
        this._cb = cb;
    }

});