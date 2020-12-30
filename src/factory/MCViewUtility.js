/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.view_utility = (function () {
    var DIALOG_GENERATOR_ID = 0;
    var NOTIFY_INTERVAL = 1000 * 60 * 60;
    var font_UTM_Bienvenue = "UTM Bienvenue";
    var font_DavidLibre_Regular = "DavidLibre-Regular";
    var font_Coiny_Regular = "Coiny-Regular";
    var font_Literata = "Literata";

    var _setImage = function (view, url) {
        if (view.setSpriteFrame) {
            view.setSpriteFrame("#" + url);
        } else if (view.loadTexture) {
            view.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
        }
    };

    var _getFontByLanguage = function () {

        //var font = 'FontCrossy';
        //if (cc.sys.isNative) {
        //    if(cc.sys.os == cc.sys.OS_ANDROID) {
        //        font = 'res/Fonts/Soup of Justice.ttf';
        //    }
        //    else {
        //        font = 'SoupofJustice';
        //    }
        //}
        var lan = mc.storage.readSetting().language;
        if (lan === mc.const.LANGUAGE_EN || lan === mc.const.LANGUAGE_VI) {
            //return res.font_regular_ttf;
            //return "Coiny-Regular";
            return getFontTTF(font_UTM_Bienvenue);
        }
        return getFontTTF(font_UTM_Bienvenue);
    };

    var getFontCamBMByLanguage = function () {
        var lan = mc.storage.readSetting().language;
        if (lan === mc.const.LANGUAGE_EN || lan === mc.const.LANGUAGE_VI) {
            //return res.font_regular_ttf;
            //return "Coiny-Regular";
            return getFontTTF(font_Literata);
        }
        return getFontTTF(font_Literata);
    };

    var getFontTTF = function (fontName) {
        if (cc.sys.isNative) {
            if (fontName === font_UTM_Bienvenue) {
                return res.font_regular_ttf;
            } else if (fontName === font_DavidLibre_Regular) {
                return res.font_davidLibre_regular_ttf;
            } else if (fontName === font_Literata) {
                return res.font_literata_ttf;
            } else if (fontName === font_Coiny_Regular) {
                return res.font_coiny_regular_ttf;
            }
        }
        return fontName;
    }

    var _checkCamFontAndSize = function (font) {
        if (font) {
            if (font === res.font_cam_stroke_32_export_fnt) {
                return 32;
            }
            if (font === res.font_cam_stroke_48_export_fnt) {
                return 48;
            }
        }
        return 0;
    }

    var _checkFontSize = function (font) {
        if (font) {
            if (font === res.font_cam_stroke_32_export_fnt ||
                font === res.font_cam_outer_32_export_fnt ||
                font === res.font_sfumachine_outer_32_export_fnt ||
                font === res.font_UTMBienvenue_none_32_export_fnt ||
                font === res.font_UTMBienvenue_stroke_32_export_fnt) {
                return 32;
            }
            if (font === res.font_cam_stroke_48_export_fnt ||
                font === res.font_cam_outer_48_export_fnt ||
                font === res.font_sfumachine_outer_48_export_fnt ||
                font === res.font_UTMBienvenue_none_48_export_fnt) {
                return 48;
            }
        }
        return 0;
    }

    var _checkCamFont = function (font) {
        if (font) {
            if (font === res.font_cam_stroke_32_export_fnt) {
                return true;
            }
            if (font === res.font_cam_stroke_48_export_fnt) {
                return true;
            }
        }
        return 0;
    }

    var _checkStrokeFont = function (font) {
        if (font) {
            if (font === res.font_cam_stroke_32_export_fnt) {
                return true;
            } else if (font === res.font_cam_stroke_48_export_fnt) {
                return true;
            } else if (font === res.font_UTMBienvenue_stroke_32_export_fnt) {
                return true;
            } else if (font === res.font_UTMBienvenue_none_48_export_fnt) {
                return false;
            } else if (font === res.font_UTMBienvenue_none_32_export_fnt) {
                return false;
            }
        }
        return false;
    }

    var utility = {};
    utility.createHeroCrystalView = function (heroInfo) {
        var node = new cc.Node();
        node.setCascadeColorEnabled(true);
        node.setCascadeOpacityEnabled(true);
        var element = mc.HeroStock.getHeroElement(heroInfo).toLowerCase();
        var classGroup = mc.HeroStock.getHeroBattleRole(heroInfo).toLowerCase();
        var sprElement = new cc.Sprite("#icon/hero/ico_" + element + ".png");
        var sprClass = new cc.Sprite("#icon/hero/ico_" + classGroup + ".png");
        node.addChild(sprElement);
        node.addChild(sprClass);
        return node;
    };
    utility.setLeagueForWidget = function (league, sprite) {
        return sprite;
    };
    utility.createAnimationExpProgress = function (progressBar, funcTrigger, funcLvlUp) {
        var expData = {ol: null, nl: null, oe: null, ne: null, ome: null, nme: null, tte: null};
        var _isStart = false;
        var _startAnimation = function () {
            if (!_isStart) {
                _isStart = true;
                progressBar.scheduleOnce(function () {
                    if (expData.ol && expData.nl) {
                        !progressBar._deltaLevel && (progressBar._deltaLevel = 0);
                        progressBar._deltaLevel += (expData.nl - expData.ol);
                        var progress = progressBar.getChildByName("progress");
                        var _runProgressAnimation = function () {
                            if (progressBar._deltaLevel > 0 && !progressBar._isAnimatingProgress) {
                                progressBar._isAnimatingProgress = true;
                                progress.runAction(cc.sequence([cc.progressTo(0.2, 100), cc.callFunc(function () {
                                    funcLvlUp && funcLvlUp();
                                    progress.setPercentage(0);
                                    progressBar._deltaLevel--;
                                    if (progressBar._deltaLevel <= 0) {
                                        progressBar.setCurrentProgressValue(expData.ne, null);
                                        progressBar._isAnimatingProgress = false;
                                    } else {
                                        progressBar._isAnimatingProgress = false;
                                        _runProgressAnimation();
                                    }
                                })]));
                            }
                        };
                        _runProgressAnimation();
                    } else {
                        progressBar.setCurrentProgressValue(expData.ne, null, true);
                    }
                    funcTrigger && funcTrigger(expData);
                }, 0.1);
            }
        };
        return {
            "level": function (oldLevel, newLevel, changer) {
                expData.ol = oldLevel;
                expData.nl = newLevel;
                expData.tte = changer.getAttachData();
                _startAnimation();
            },
            "exp": function (oldExp, newExp, changer) {
                expData.oe = oldExp;
                expData.ne = newExp;
                expData.tte = changer.getAttachData();
                _startAnimation();
            }
        };
    };
    utility.showTransferRelicDialog = function (info) {
        var functionIsOpened = true;
        if (functionIsOpened) {
            new mc.TransferRelicDialog(info).show();
        } else {
            mc.view_utility.showComingSoon();
        }
    };
    utility.showLoadingDialog = function (timeOut, timeOutCallback) {
        var dialog = mc.GUIFactory.createLoadingDialog();
        var name = "__loading_dialog__" + (DIALOG_GENERATOR_ID++);
        dialog.setName(name);
        if (timeOut != undefined || timeOutCallback != undefined) {
            dialog.enableTimeOut(timeOut, timeOutCallback);
        }
        dialog.show();
        return name;
    };
    utility.hideLoadingDialogById = function (id) {
        var dialog = bb.director.getDialogByName(id);
        if (dialog) {
            dialog.close();
        }
        return dialog != null;
    };
    utility.setNotifyIconForWidget = function (widget, isNotify, yPercent, xPercent) {
        var notifyIcon = widget.getChildByName("__notify__");
        if (!notifyIcon && isNotify) {
            notifyIcon = new cc.Sprite("#icon/Noticification.png");
            notifyIcon.setName("__notify__");
            notifyIcon.x = widget.width - notifyIcon.width * 0.5;
            notifyIcon.y = widget.height - notifyIcon.height * 0.5;
            notifyIcon.runAction(cc.sequence([cc.scaleTo(0.1, 1.15, 1.15), cc.scaleTo(0.2, 1.0, 1.0), cc.delayTime(3)]).repeatForever());
            widget.addChild(notifyIcon);
        }
        if (notifyIcon) {
            var canNotify = widget._lastSeenNotify === undefined || ((bb.now() - widget._lastSeenNotify) > NOTIFY_INTERVAL);
            notifyIcon.setVisible(canNotify && isNotify);
            if (yPercent) {
                notifyIcon.y = widget.height * yPercent;
            }
            if (xPercent) {
                notifyIcon.x = widget.width * xPercent;
            }
            widget.setCascadeOpacityEnabled(true);

        }
        return notifyIcon;
    };
    utility.enableShadowLabel = function (lbl, color, size) {
        color = color || mc.color.BLACK;
        size = size || cc.size(1, -1);
        if (cc.sys.isNative && !(lbl instanceof ccui.Text)) {
            lbl.enableShadow(color, size, 1, 1);
        } else {
            lbl.enableShadow(color, size, 2);
        }
    };
    utility.seenNotify = function (widget, skipInterval) {
        var notifyIcon = widget.getChildByName("__notify__");
        if (notifyIcon) {
            notifyIcon.setVisible(false);
            if (!skipInterval) {
                widget._lastSeenNotify = bb.now();
            } else {
                widget._lastSeenNotify = bb.now() - NOTIFY_INTERVAL + 2000;
            }
        }
    };
    utility.createAvatarPlayer = function (avatarIndex, isVIP) {
        bb.framework.addSpriteFrames(res.avatar_user_plist);
        avatarIndex = avatarIndex || 0;
        if (avatarIndex > mc.const.MAX_PLAYER_AVATAR) {
            avatarIndex = avatarIndex % mc.const.MAX_PLAYER_AVATAR;
        }
        var container = new ccui.Layout();
        var brk = new ccui.ImageView("patch9/pnl_avatar.png", ccui.Widget.PLIST_TEXTURE);
        avatarIndex++;
        var img = new ccui.ImageView("icon/avatar/avatar" + (avatarIndex < 10 ? "0" + avatarIndex : "" + avatarIndex) + ".png", ccui.Widget.PLIST_TEXTURE);
        container.addChild(img);
        container.addChild(brk);
        container.anchorX = container.anchorY = 0.5;
        container.width = brk.width;
        container.height = brk.height;
        brk.x = img.x = container.width * 0.5;
        brk.y = img.y = container.height * 0.5;
        if (isVIP) {
            var animateShiny = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_shiny_icon_fx_json, res.spine_ui_shiny_icon_fx_atlas, 1.0);
            container.addChild(animateShiny);
            animateShiny.setPosition(img.x, img.y);
            animateShiny.setAnimation(0, "shinyIconfx", true);

            var animateVip = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_vip_avatar_json, res.spine_ui_vip_avatar_atlas, 1.0);
            container.addChild(animateVip);
            animateVip.anchorX = 0.5;
            animateVip.anchorY = 0.5;
            animateVip.setPosition(brk.width / 2, brk.height / 2);
            animateVip.setAnimation(0, "Avatar", true);

        }
        return container;
    };
    utility.createEmptyPaddingItemList = function (size) {
        !size && (size = cc.size(cc.visibleRect.width, 10));
        var emptyItem = new ccui.Layout();
        emptyItem.setName("emptyItem");
        emptyItem.setContentSize(size);
        return emptyItem;
    };
    //utility.createAvatarPlayer = function (avatarIndex) {
    //    bb.framework.addSpriteFrames(res.avatar_user_plist);
    //    avatarIndex = avatarIndex || 0;
    //    if (avatarIndex > mc.const.MAX_PLAYER_AVATAR) {
    //        avatarIndex = avatarIndex % mc.const.MAX_PLAYER_AVATAR;
    //    }
    //    var container = new ccui.Layout();
    //    var brk = new ccui.ImageView("patch9/pnl_avatar.png", ccui.Widget.PLIST_TEXTURE);
    //    avatarIndex++;
    //    var img = new ccui.ImageView("icon/avatar/avatar" + (avatarIndex < 10 ? "0" + avatarIndex : "" + avatarIndex) + ".png", ccui.Widget.PLIST_TEXTURE);
    //    container.addChild(img);
    //    container.addChild(brk);
    //    container.anchorX = container.anchorY = 0.5;
    //    container.width = brk.width;
    //    container.height = brk.height;
    //    brk.x = img.x = container.width * 0.5;
    //    brk.y = img.y = container.height * 0.5;
    //    return container;
    //};

    utility.seenNotify = function (widget, skipInterval) {
        var notifyIcon = widget.getChildByName("__notify__");
        if (notifyIcon) {
            notifyIcon.setVisible(false);
            if (!skipInterval) {
                widget._lastSeenNotify = bb.now();
            } else {
                widget._lastSeenNotify = bb.now() - NOTIFY_INTERVAL + 2000;
            }
        }
    };


    utility.createAvatarPlayerWithHighlight = function (avatarIndex) {
        bb.framework.addSpriteFrames(res.avatar_user_plist);
        avatarIndex = avatarIndex || 0;
        if (avatarIndex > mc.const.MAX_PLAYER_AVATAR) {
            avatarIndex = avatarIndex % mc.const.MAX_PLAYER_AVATAR;
        }
        var container = new ccui.Layout();
        var brkHighlight = new ccui.ImageView("patch9/pnl_ready_glow.png", ccui.Widget.PLIST_TEXTURE);
        var brk = new ccui.ImageView("patch9/pnl_avatar.png", ccui.Widget.PLIST_TEXTURE);
        avatarIndex++;
        var img = new ccui.ImageView("icon/avatar/avatar" + (avatarIndex < 10 ? "0" + avatarIndex : "" + avatarIndex) + ".png", ccui.Widget.PLIST_TEXTURE);
        //brkHighlight.width = 150;
        //brkHighlight.height = 150;
        brkHighlight.setScale9Enabled(true);
        brkHighlight.setContentSize(140, 140);
        brkHighlight.setVisible(false);
        container.addChild(brkHighlight);
        container.addChild(img);
        var blackPanel = utility.createBlackPanel(128, img.width - 10, img.height - 10);
        container.addChild(blackPanel);
        container.addChild(brk);
        container.anchorX = container.anchorY = 0.5;
        container.width = brk.width;
        container.height = brk.height;
        blackPanel.x = brkHighlight.x = brk.x = img.x = container.width * 0.5;
        blackPanel.y = brkHighlight.y = brk.y = img.y = container.height * 0.5;

        container.setHighlight = function (value) {
            brkHighlight.setVisible(value);
        };

        container.setBlack = function (value) {
            blackPanel.setVisible(value);
        };
        return container;
    };

    utility.setKingIconForWidget = function (widget, isLeader) {
        var leaderIcon = widget.getChildByName("__leader_icon__");
        if (!leaderIcon && isLeader) {
            leaderIcon = new cc.Sprite("#icon/Crown.png");
            leaderIcon.setName("__leader_icon__");
            leaderIcon.x = widget.width * 0.5;
            leaderIcon.y = widget.height;
            widget.addChild(leaderIcon);
        }
        leaderIcon && leaderIcon.setVisible(isLeader);
        return leaderIcon;
    };
    utility.wrapWidget = function (widget, length, isVertical, m) {
        var margin = {left: 0, top: 0, bottom: 0, right: 0, a1: 0, a2: 0};
        if (m) {
            margin.left = m.left || margin.left;
            margin.top = m.top || margin.top;
            margin.bottom = m.bottom || margin.bottom;
            margin.right = m.right || margin.right;
            margin.a1 = m.a1 || margin.a1;
            margin.a2 = m.a2 || margin.a2;
        }
        widget.retain();
        widget.removeFromParent();
        var arrowLeftURL = widget._arrowLeftURL || "button/Left_arrow.png";
        var arrow1 = new ccui.ImageView(arrowLeftURL, ccui.Widget.PLIST_TEXTURE);
        var arrow2 = new ccui.ImageView(arrowLeftURL, ccui.Widget.PLIST_TEXTURE);
        arrow2.scaleX = -1;
        arrow1.setVisible(false);
        arrow2.setVisible(false);

        var container = new ccui.Layout();
        var fakeScroll = new ccui.Layout();
        fakeScroll._scrollVertical = isVertical;
        fakeScroll.anchorX = 0.5;
        fakeScroll.anchorY = 0.5;
        fakeScroll.addChild(widget);
        widget.release();
        fakeScroll.setClippingEnabled(true);

        container.addChild(fakeScroll);
        container.addChild(arrow1);
        container.addChild(arrow2);
        if (isVertical) {
            fakeScroll.width = margin.left + widget.width + margin.right;
            fakeScroll.height = margin.top + length + margin.bottom;
        } else {
            fakeScroll.width = margin.left + length + margin.right;
            fakeScroll.height = margin.top + widget.height + margin.bottom;
        }
        widget.x = margin.left + (1 - widget.anchorX) * widget.width;
        widget.y = margin.bottom + (1 - widget.anchorY) * widget.height;
        fakeScroll._movePos = cc.p(0, 0);
        fakeScroll._contentLength = isVertical ? (margin.top + widget.height + margin.bottom) : (margin.left + widget.width + margin.right);
        var d = fakeScroll._contentLength - (isVertical ? fakeScroll.height : fakeScroll.width);
        fakeScroll._startBound = (isVertical ? widget.y : widget.x) - d;
        fakeScroll._endBound = (isVertical ? widget.y : widget.x);
        if (length < fakeScroll._contentLength) {
            if (fakeScroll._scrollVertical) {
                arrow1.x = arrow2.x = fakeScroll.width * 0.5;
                arrow1.y = -arrow1.height - margin.a1;
                arrow2.y = fakeScroll.height + arrow2.height + margin.a2;
            } else {
                arrow1.y = arrow2.y = fakeScroll.height * 0.5;
                arrow1.x = -arrow1.width - margin.a1;
                arrow2.x = fakeScroll.width + arrow2.width + margin.a2;
            }
            container.moveViewPort = function (dur, dx, dy) {
                arrow1.setVisible(true);
                arrow2.setVisible(true);
                if (fakeScroll._scrollVertical) {
                    if (dur > 0) {
                        widget.runAction(cc.sequence([cc.moveBy(dur, 0, -dy), cc.callFunc(function () {
                            container.checkBound();
                        })]));
                    } else {
                        widget.y -= dy;
                        container.checkBound();
                    }
                } else {
                    if (dur > 0) {
                        widget.runAction(cc.sequence([cc.moveBy(dur, -dx, 0), cc.callFunc(function () {
                            container.checkBound();
                        })]));
                    } else {
                        widget.x -= dx;
                        container.checkBound();
                    }
                }
            }.bind(container);
            container.checkBound = function () {
                if (fakeScroll._scrollVertical) {
                    if (widget.y <= fakeScroll._startBound) {
                        widget.y = fakeScroll._startBound;
                        arrow2.setVisible(false);
                    }
                    if (widget.y >= fakeScroll._endBound) {
                        widget.y = fakeScroll._endBound;
                        arrow1.setVisible(false);
                    }
                } else {
                    if (widget.x <= fakeScroll._startBound) {
                        widget.x = fakeScroll._startBound;
                        arrow2.setVisible(false);
                    }
                    if (widget.x >= fakeScroll._endBound) {
                        widget.x = fakeScroll._endBound;
                        arrow1.setVisible(false);
                    }
                }
            }.bind(container);
            fakeScroll.addTouchEventListener(function (fakeScroll, type) {
                if (type === ccui.Widget.TOUCH_BEGAN) {
                    var p = fakeScroll.getTouchBeganPosition();
                    fakeScroll._movePos = cc.p(p.x, p.y);
                } else if (type === ccui.Widget.TOUCH_MOVED) {
                    var p = fakeScroll.getTouchMovePosition();
                    var dx = this._movePos.x - p.x;
                    var dy = this._movePos.y - p.y;
                    fakeScroll._movePos = cc.p(p.x, p.y);
                    container.moveViewPort(0, dx, dy);
                }
            });
            fakeScroll.setTouchEnabled(true);
            container.moveViewPort(0, 0, 0);
        } else {
            fakeScroll.width = margin.left + widget.width + margin.right;
            fakeScroll.height = margin.top + widget.height + margin.bottom;
        }
        container.width = fakeScroll.width;
        container.height = fakeScroll.height;
        container.anchorX = container.anchorY = 0.5;
        fakeScroll.x = fakeScroll.width * 0.5;
        fakeScroll.y = fakeScroll.height * 0.5;
        fakeScroll.setCascadeOpacityEnabled(true);
        container.setCascadeOpacityEnabled(true);
        container.setCascadeColorEnabled(true);
        fakeScroll.setCascadeColorEnabled(true);
        return container;
    };
    utility.registerPaging = function (widget) {

    };
    utility.registerDragAble = function (widget, arrTargetWidget, funcSwap, w_size, arrW_Size, clickFunc) {
        if (!widget._arrDragTargetWidget) {
            widget._arrDragTargetWidget = arrTargetWidget;
            widget._funcSwap = funcSwap;
            widget._w_size = w_size;
            widget._arrW_Size = arrW_Size;
            widget.stopDragAble = function () {
                var arrTargetWidget = widget._arrDragTargetWidget;
                var funcSwap = widget._funcSwap;
                widget._isDragging = false;
                widget.setLocalZOrder(oldLocalZ);
                widget.setEnabled(false);
                widget.runAction(cc.sequence([cc.moveTo(0.1, startX, startY), cc.callFunc(function (widget) {
                    widget.setEnabled(true);
                })]));
                if (swapIndex >= 0) {
                    for (var i = 0; i < arrTargetWidget.length; i++) {
                        arrTargetWidget[i].setOutline && arrTargetWidget[i].setOutline(false);
                    }
                    funcSwap && funcSwap(widget, swapIndex);
                    swapIndex = -1;
                }
            };
            var startX = null;
            var startY = null;
            var oldLocalZ = null;
            var swapIndex = -1;
            var startMove = false;
            var click = false;
            var release = false;
            var isCheckByPointInside = widget._checkDraggbleByPointInSize;
            widget.addTouchEventListener(function (widget, type) {
                if (type === ccui.Widget.TOUCH_BEGAN) {
                    widget._isDragging = true;
                    startMove = false;
                    click = false;
                    release = false;
                    startX = widget.x;
                    startY = widget.y;
                    oldLocalZ = widget.getLocalZOrder();
                    var actSeq = cc.sequence([cc.delayTime(0.2), cc.callFunc(function () {
                        if (!startMove && !click && release) {
                            click = true;
                        }
                    })]);
                    widget.setLocalZOrder(9999);
                    widget.runAction(actSeq);
                } else if (type === ccui.Widget.TOUCH_MOVED) {
                    if (!click) {
                        if (!startMove) {
                            var dMove = cc.pDistance(widget.getTouchBeganPosition(), widget.getTouchMovePosition());
                            startMove = dMove > 20;
                        } else {
                            widget.runAction(cc.fadeTo(0.1, 180));
                            var movePos = widget.getTouchMovePosition();
                            var locPos = widget.getParent().convertToNodeSpace(movePos);
                            var scrPos = bb.director.getCurrentScreen().convertToNodeSpace(movePos);
                            widget.setPosition(locPos.x, locPos.y);
                            var w = widget.width * widget.scale;
                            var h = widget.height * widget.scale;
                            var w_size = widget._w_size;
                            var arrW_Size = widget._arrW_Size;
                            if (w_size) {
                                w = w_size.width;
                                h = w_size.height;
                            }
                            var mx = scrPos.x - widget.anchorX * w;
                            var my = scrPos.y - widget.anchorY * h;
                            var dragRect = cc.rect(mx, my, w, h);
                            var maxRegion = 0;
                            swapIndex = -1;
                            var arrTargetWidget = widget._arrDragTargetWidget;
                            for (var i = 0; i < arrTargetWidget.length; i++) {
                                var targetWidget = arrTargetWidget[i];
                                if (widget != targetWidget) {
                                    var scrPos = targetWidget.getParent().convertToWorldSpace(cc.p(targetWidget.x, targetWidget.y));
                                    var w = targetWidget.width * targetWidget.scale;
                                    var h = targetWidget.height * targetWidget.scale;
                                    if (arrW_Size) {
                                        if (i < arrW_Size.length) {
                                            w = arrW_Size[i].width;
                                            h = arrW_Size[i].height;
                                        }
                                    }
                                    var targetRect = cc.rect(scrPos.x - targetWidget.anchorX * w, scrPos.y - targetWidget.anchorY * h,
                                        w, h);
                                    arrTargetWidget[i].setOutline && arrTargetWidget[i].setOutline(false);
                                    if (isCheckByPointInside) {
                                        if (cc.rectContainsPoint(targetRect, cc.p(locPos.x, locPos.y))) {
                                            swapIndex = i;
                                        }
                                    } else {
                                        if (cc.rectIntersectsRect(dragRect, targetRect)) {
                                            var intersection = cc.rectIntersection(dragRect, targetRect);
                                            var region = intersection.width * intersection.height;
                                            if (maxRegion < region) {
                                                maxRegion = region;
                                                swapIndex = i;
                                            }
                                        }
                                    }
                                }
                            }
                            if (swapIndex >= 0) {
                                arrTargetWidget[swapIndex].setOutline && arrTargetWidget[swapIndex].setOutline(true);
                            }
                        }
                    }
                } else if (type === ccui.Widget.TOUCH_CANCELED ||
                    type === ccui.Widget.TOUCH_ENDED) { // CANCELED
                    release = true;
                    (!startMove && !click) && (click = true);
                    if (click) {
                        clickFunc && clickFunc(widget);
                        bb.director.notifyTrackingDataChanged(new bb.TrackEvent(bb.framework.const.EVENT_CLICK).setUserData(widget));
                        widget._isDragging = false;
                        widget.setLocalZOrder(oldLocalZ);
                    } else {
                        widget && widget.stopDragAble && widget.stopDragAble();
                    }
                }

            });
            widget.setTouchEnabled(true);
        } else {
            widget._arrDragTargetWidget = arrTargetWidget;
            widget._funcSwap = funcSwap;
            widget._w_size = w_size;
            widget._arrW_Size = arrW_Size;
        }

    };
    utility.registerSoundAndMusicSlider = function (iconSound, iconMusic, sliderSound, sliderMusic) {
        iconSound.loadTexture(bb.sound.getEffectsVolume() > 0 ? "icon/Sound.png" : "icon/Sound_Mute.png", ccui.Widget.PLIST_TEXTURE);
        iconMusic.loadTexture(bb.sound.getMusicVolume() > 0 ? "icon/Music.png" : "icon/Music_Mute.png", ccui.Widget.PLIST_TEXTURE);
        sliderSound.setPercent(bb.sound.getEffectsVolume());
        sliderMusic.setPercent(bb.sound.getMusicVolume());
        sliderSound.setTouchEnabled(true);
        sliderMusic.setTouchEnabled(true);
        sliderSound.setEnabled(bb.sound.getEffectsVolume() > 0 ? true : false);
        sliderMusic.setEnabled(bb.sound.getMusicVolume() > 0 ? true : false);
        var setting = mc.storage.readSetting();
        iconSound.registerTouchEvent(function (iconSound) {
            var effectVolume = bb.sound.getEffectsVolume();
            bb.sound.setEffectsVolume(effectVolume > 0 ? 0 : 100);
            sliderSound.setPercent(bb.sound.getEffectsVolume());
            iconSound.loadTexture(bb.sound.getEffectsVolume() > 0 ? "icon/Sound.png" : "icon/Sound_Mute.png", ccui.Widget.PLIST_TEXTURE);
            setting.soundVol = bb.sound.getEffectsVolume();
            sliderSound.setEnabled(bb.sound.getEffectsVolume() > 0 ? true : false);
            mc.storage.isChange = true;
        });
        iconMusic.registerTouchEvent(function (iconMusic) {
            var musicVolume = bb.sound.getMusicVolume();
            bb.sound.setMusicVolume(musicVolume > 0 ? 0 : 100);
            sliderMusic.setPercent(bb.sound.getMusicVolume());
            iconMusic.loadTexture(bb.sound.getMusicVolume() > 0 ? "icon/Music.png" : "icon/Music_Mute.png", ccui.Widget.PLIST_TEXTURE);
            setting.musicVol = bb.sound.getMusicVolume();
            sliderMusic.setEnabled(bb.sound.getMusicVolume() > 0 ? true : false);
            mc.storage.isChange = true;
        });
        sliderSound.addEventListener(function (slider, event) {
            if (event === ccui.Slider.EVENT_PERCENT_CHANGED) {
                var percent = slider.getPercent().toFixed(0);
                percent <= 0 && (percent = 1);
                bb.sound.setEffectsVolume(percent);
                setting.soundVol = bb.sound.getEffectsVolume();
                mc.storage.isChange = true;
            }
        });
        sliderMusic.addEventListener(function (slider, event) {
            if (event === ccui.Slider.EVENT_PERCENT_CHANGED) {
                var percent = slider.getPercent().toFixed(0);
                percent <= 0 && (percent = 1);
                bb.sound.setMusicVolume(percent);
                setting.musicVol = bb.sound.getMusicVolume();
                mc.storage.isChange = true;
            }
        });
    };
    utility.setSkillInfoForLabel = function (label, skillInfo, charW, lineW) {
        if (skillInfo) {
            charW = charW || 15;
            lineW = lineW || 550;
            var strSkillDes = mc.HeroStock.getSkillDescriptionOfHero(skillInfo);
            var maxChar = Math.floor(lineW / charW);
            if (strSkillDes.length > maxChar) {
                label.setString(bb.utility.stringBreakLines(mc.HeroStock.getSkillDescriptionOfHero(skillInfo), charW, lineW));
            } else {
                label.setString(mc.HeroStock.getSkillDescriptionOfHero(skillInfo));
            }
        } else {
            label.setString(cc.formatStr(mc.dictionary.getGUIString("lblRequireXStarHero"), 3));
        }
    };
    utility.setSkillInfoForWidget = function (widget, skillInfo) {
        bb.framework.addSpriteFrames(res.skill_icon_plist);
        bb.framework.addSpriteFrames(res.skill_icon2_plist);
        var url = "png/skill/s" + mc.HeroStock.getSkillIndexOfHero(skillInfo) + ".png";
        var frame = cc.spriteFrameCache.getSpriteFrame(url);
        if (!frame) {
            cc.log("Unknow Skill: " + url);
            url = "png/skill/s0000.png";
        }
        if (!widget) {
            widget = new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
        } else {
            widget.loadTexture(url, ccui.Widget.PLIST_TEXTURE);
        }
        return widget;
    };
    utility.createSkillInfoIcon = function (skillInfo) {
        bb.framework.addSpriteFrames(res.skill_icon_plist);
        bb.framework.addSpriteFrames(res.skill_icon2_plist);
        bb.framework.addSpriteFrames(res.skill_icon3_plist);
        bb.framework.addSpriteFrames(res.patch9_1_plist);

        var isActive = mc.HeroStock.getSkillTypeOfHero(skillInfo) === mc.const.SKILL_TYPE_ACTIVE;
        var isLeader = mc.HeroStock.getSkillTypeOfHero(skillInfo) === mc.const.SKILL_TYPE_LEADER;
        var skillContainer = new ccui.Widget();
        skillContainer.setUserData(skillInfo);
        var brk = new cc.Sprite(isLeader ? "#patch9/pnl_leaderskillslot_frame.png" : "#patch9/pnl_skillslot_frame.png");
        skillContainer.width = brk.width;
        skillContainer.height = brk.height;
        skillContainer.anchorX = 0.5;
        skillContainer.anchorY = 0.5;

        var clipNode = new cc.ClippingNode(new cc.Sprite(isLeader ? "#patch9/pnl_leaderskillslot.png" : "#patch9/pnl_skillslot.png"));
        clipNode.setCascadeOpacityEnabled(true);
        clipNode.setAlphaThreshold(0.95);
        clipNode.width = skillContainer.width;
        clipNode.height = skillContainer.height;
        var url = "png/skill/" + mc.HeroStock.getSkillIconOfHero(skillInfo);
        var frame = cc.spriteFrameCache.getSpriteFrame(url);
        if (!frame) {
            cc.log("Unknow Skill: " + url);
            url = "png/skill/s0000.png";
        }

        var imgIcon = new cc.Sprite("#" + url);
        clipNode.addChild(imgIcon);
        var lblLevel = bb.framework.getGUIFactory().createText("");
        var nextSkillIndex = mc.HeroStock.getSkillUpgradeOf(skillInfo);
        if (nextSkillIndex && nextSkillIndex != -1) {
            lblLevel.setString(mc.dictionary.getGUIString("lblLv.") + mc.HeroStock.getSkillLevelOfHero(skillInfo));
        } else {
            lblLevel.setColor(mc.color.GREEN_NORMAL);
            lblLevel.setString(mc.dictionary.getGUIString("lblMax"));
        }
        lblLevel.scale = 0.6;
        if (isLeader) {
            lblLevel.setColor(mc.color.GREEN_NORMAL);
            lblLevel.setString(mc.dictionary.getGUIString("lblLeader"));
        }

        clipNode.x = skillContainer.width * 0.5;
        clipNode.y = skillContainer.height * 0.5;
        brk.x = skillContainer.width * 0.5;
        brk.y = skillContainer.height * 0.5;
        lblLevel.x = skillContainer.width * 0.5;
        lblLevel.y = skillContainer.height * 0.85;

        skillContainer.setCascadeOpacityEnabled(true);
        skillContainer.addChild(clipNode);
        skillContainer.addChild(brk);
        skillContainer.addChild(lblLevel);
        return skillContainer;
    };
    utility.createBlackPanel = function (opacity, width, height) {
        var blackPanel = new ccui.Layout();
        blackPanel.anchorX = blackPanel.anchorY = 0.5;
        blackPanel.width = width ? width : cc.winSize.width;
        blackPanel.height = height ? height : cc.winSize.height;
        blackPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        blackPanel.setBackGroundColor(cc.color.BLACK);
        blackPanel.setBackGroundColorOpacity(bb.framework.getTrueOpacity(opacity || 128));
        return blackPanel;
    };
    utility.layoutTeamFormation = function (data, view, disableEdit, padding) {
        padding = padding || 2;
        var arrFormation = data.arrTeamFormation;
        var leaderIndex = data.leaderIndex;
        var mapHeroInfo = data.mapHeroInfo;
        var statusCreatureManager = data.statusCreatureManager;
        var enableClick = data.enableClick != undefined ? data.enableClick : true;

        var nodeHero = view.nodeHero;
        var lblLeaderSkillInfo = view.lblLeaderSkillInfo;

        if (mc.enableReplaceFontBM()) {
            lblLeaderSkillInfo = this.replaceBitmapFontAndApplyTextStyle(lblLeaderSkillInfo);
        }

        var leaderHeroId = arrFormation[leaderIndex];
        var mainHeroIds = arrFormation;

        var sortedHeroIds = mainHeroIds;
        if (mc.const.SORT_TEAM_FORMATION) {
            leaderIndex = 0;
            if (leaderHeroId >= 0) {
                sortedHeroIds.push(leaderHeroId);
            }
            bb.utility.arrayTraverse(mainHeroIds, function (heroId) {
                if (heroId != -1 && heroId != leaderHeroId) {
                    if (mapHeroInfo[heroId]) {
                        sortedHeroIds.push(heroId);
                    }
                }
            });
            while (sortedHeroIds.length < mainHeroIds.length) {
                sortedHeroIds.push(-1);
            }
        }
        var layoutHero = bb.layout.linear(bb.collection.createArray(5, function (index) {
            var widget = null;
            var heroInfo = mapHeroInfo[sortedHeroIds[index]];
            if (heroInfo) {
                var status = null;
                if (statusCreatureManager) {
                    status = statusCreatureManager.getStatusCreatureById(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getHeroIndex(heroInfo));
                }
                widget = new mc.HeroAvatarView(heroInfo, status);
            } else {
                var widget = new ccui.Widget();
                var cross = new ccui.ImageView(!disableEdit ? "button/Cross_Unavailable.png" : "patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                cross.scale = !disableEdit ? 1.0 : 0.9;
                widget.addChild(cross);
                widget.width = 137;
                widget.height = 144 + (statusCreatureManager ? 50 : 0);
                widget.anchorX = 0.5;
                widget.anchorY = 0.5;
                cross.x = widget.width * 0.5;
                cross.y = 144 * 0.5 + (statusCreatureManager ? 50 : 0);
                if (view.showNotifyIfNotHero) {
                    mc.view_utility.setNotifyIconForWidget(widget, view.showNotifyIfNotHero, 0.94, 0.94);
                }
                widget.setCascadeOpacityEnabled(true);
            }
            if (leaderHeroId >= 0) {
                mc.view_utility.setKingIconForWidget(widget, index === leaderIndex);
            }
            if (enableClick) {
                if (!disableEdit) {
                    widget.registerTouchEvent(function (widget) {
                        mc.GUIFactory.showEditFormationScreen(statusCreatureManager);
                    }, function (widget) {
                        var hrInfo = widget.getUserData();
                        if (hrInfo) {
                            new mc.HeroInfoDialog(hrInfo).show()
                        }
                    });
                } else {
                    var _showHero = function (widget) {
                        var hrInfo = widget.getUserData();
                        if (hrInfo) {
                            var hr = mc.GameData.heroStock.getHeroById(mc.HeroStock.getHeroId(hrInfo)); // not found in stock
                            if (!hr) {
                                hr = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(hrInfo)); // get and create by index
                                if (hr) {
                                    hr = bb.utility.cloneJSON(hr);
                                    hr["level"] = mc.HeroStock.getHeroLevel(hrInfo);
                                    var attrs = mc.HeroStock.getHeroTotalAttrByLevel(hr);
                                    for (var key in attrs) {
                                        hr[key] = attrs[key];
                                    }
                                }
                            }
                            hr && new mc.HeroInfoDialog(hr).show()
                        }
                    };
                    widget.registerTouchEvent(_showHero, _showHero);
                    widget.setSwallowTouches(false);
                }
            }
            return widget;
        }), padding);
        nodeHero.addChild(layoutHero);

        if (lblLeaderSkillInfo) {
            var leaderHeroInfo = mapHeroInfo[leaderHeroId];
            mc.view_utility.setSkillInfoForLabel(lblLeaderSkillInfo, leaderHeroInfo ? mc.HeroStock.getHeroLeaderSkill(leaderHeroInfo) : null);
        }
    };

    utility.layoutHiddenHeroTeamFormation = function (data, view, disableEdit, padding) {
        padding = padding || 2;
        var arrFormation = data.arrTeamFormation;
        var leaderHeroId = data.leaderHeroId;
        var mapHeroInfo = data.mapHeroInfo;
        var statusCreatureManager = data.statusCreatureManager;
        var enableClick = data.enableClick != undefined ? data.enableClick : true;

        var nodeHero = view.nodeHero;
        var lblLeaderSkillInfo = view.lblLeaderSkillInfo;
        var mainHeroIds = arrFormation;

        var sortedHeroIds = mainHeroIds;
        if (mc.const.SORT_TEAM_FORMATION) {

            bb.utility.arrayTraverse(mainHeroIds, function (heroId) {
                if (heroId != -1) {
                    if (mapHeroInfo[heroId]) {
                        sortedHeroIds.push(heroId);
                    }
                }
            });
            while (sortedHeroIds.length < mainHeroIds.length) {
                sortedHeroIds.push(-1);
            }
        }
        var layoutHero = bb.layout.linear(bb.collection.createArray(5, function (index) {
            var widget = null;
            var heroInfo = mapHeroInfo[sortedHeroIds[index]];
            if (heroInfo) {
                var status = null;
                if (statusCreatureManager) {
                    status = statusCreatureManager.getStatusCreatureById(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getHeroIndex(heroInfo));
                }
                widget = new mc.HeroAvatarView(heroInfo, status);
            } else {
                var widget = new ccui.Widget();
                var cross = new ccui.ImageView("button/Question_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                cross.scale = !disableEdit ? 1.0 : 0.9;
                widget.addChild(cross);
                widget.width = 137;
                widget.height = 144 + (statusCreatureManager ? 50 : 0);
                widget.anchorX = 0.5;
                widget.anchorY = 0.5;
                cross.x = widget.width * 0.5;
                cross.y = 144 * 0.5 + (statusCreatureManager ? 50 : 0);
                widget.setCascadeOpacityEnabled(true);
            }
            if (enableClick) {
                if (!disableEdit) {
                    widget.registerTouchEvent(function (widget) {
                        mc.GUIFactory.showEditFormationScreen(statusCreatureManager);
                    }, function (widget) {
                        var hrInfo = widget.getUserData();
                        if (hrInfo) {
                            new mc.HeroInfoDialog(hrInfo).show()
                        }
                    });
                } else {
                    var _showHero = function (widget) {
                        var hrInfo = widget.getUserData();
                        if (hrInfo) {
                            var hr = mc.GameData.heroStock.getHeroById(mc.HeroStock.getHeroId(hrInfo)); // not found in stock
                            if (!hr) {
                                hr = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(hrInfo)); // get and create by index
                                if (hr) {
                                    hr = bb.utility.cloneJSON(hr);
                                    hr["level"] = mc.HeroStock.getHeroLevel(hrInfo);
                                    var attrs = mc.HeroStock.getHeroTotalAttrByLevel(hr);
                                    for (var key in attrs) {
                                        hr[key] = attrs[key];
                                    }
                                }
                            }
                            hr && new mc.HeroInfoDialog(hr).show()
                        } else {
                            var msg = mc.dictionary.getGUIString("lblHiddenHero");
                            var dialog = new mc.DefaultDialog()
                                .setTitle(mc.dictionary.getGUIString("lblWarning"))
                                .setMessage(msg)
                                .enableOkButton(function () {
                                    dialog.close();
                                }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                            dialog.show();
                        }
                    };
                    widget.registerTouchEvent(_showHero, _showHero);
                    widget.setSwallowTouches(false);
                }
            }
            return widget;
        }), padding);
        nodeHero.addChild(layoutHero);

        if (lblLeaderSkillInfo) {
            var leaderHeroInfo = mapHeroInfo[leaderHeroId];
            mc.view_utility.setSkillInfoForLabel(lblLeaderSkillInfo, leaderHeroInfo ? mc.HeroStock.getHeroLeaderSkill(leaderHeroInfo) : null);
        }
    };

    utility.layoutHiddenHeroTeamFormationWithGrid = function (data, view, disableEdit, numCol, width, padding) {
        padding = padding || 2;
        var arrFormation = data.arrTeamFormation;
        var leaderHeroId = data.leaderHeroId;
        var mapHeroInfo = data.mapHeroInfo;
        var statusCreatureManager = data.statusCreatureManager;
        var enableClick = data.enableClick != undefined ? data.enableClick : true;

        var nodeHero = view.nodeHero;
        var lblLeaderSkillInfo = view.lblLeaderSkillInfo;
        var mainHeroIds = arrFormation;

        var sortedHeroIds = mainHeroIds;
        if (mc.const.SORT_TEAM_FORMATION) {

            bb.utility.arrayTraverse(mainHeroIds, function (heroId) {
                if (heroId != -1) {
                    if (mapHeroInfo[heroId]) {
                        sortedHeroIds.push(heroId);
                    }
                }
            });
            while (sortedHeroIds.length < mainHeroIds.length) {
                sortedHeroIds.push(-1);
            }
        }

        var layoutHero = bb.layout.grid(bb.collection.createArray(5, function (index) {
            var widget = null;
            var heroInfo = mapHeroInfo[sortedHeroIds[index]];
            if (heroInfo) {
                var status = null;
                if (statusCreatureManager) {
                    status = statusCreatureManager.getStatusCreatureById(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getHeroIndex(heroInfo));
                }
                widget = new mc.HeroAvatarView(heroInfo, status);
            } else {
                var widget = new ccui.Widget();
                var cross = new ccui.ImageView("button/Question_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                cross.scale = !disableEdit ? 1.0 : 0.9;
                widget.addChild(cross);
                widget.width = 137;
                widget.height = 144 + (statusCreatureManager ? 50 : 0);
                widget.anchorX = 0.5;
                widget.anchorY = 0.5;
                cross.x = widget.width * 0.5;
                cross.y = 144 * 0.5 + (statusCreatureManager ? 50 : 0);
                widget.setCascadeOpacityEnabled(true);
            }
            widget.width += 30;
            if (enableClick) {
                if (!disableEdit) {
                    widget.registerTouchEvent(function (widget) {
                        mc.GUIFactory.showEditFormationScreen(statusCreatureManager);
                    }, function (widget) {
                        var hrInfo = widget.getUserData();
                        if (hrInfo) {
                            new mc.HeroInfoDialog(hrInfo).show()
                        }
                    });
                } else {
                    var _showHero = function (widget) {
                        var hrInfo = widget.getUserData();
                        if (hrInfo) {
                            var hr = mc.GameData.heroStock.getHeroById(mc.HeroStock.getHeroId(hrInfo)); // not found in stock
                            if (!hr) {
                                hr = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(hrInfo)); // get and create by index
                                if (hr) {
                                    hr = bb.utility.cloneJSON(hr);
                                    hr["level"] = mc.HeroStock.getHeroLevel(hrInfo);
                                    var attrs = mc.HeroStock.getHeroTotalAttrByLevel(hr);
                                    for (var key in attrs) {
                                        hr[key] = attrs[key];
                                    }
                                }
                            }
                            hr && new mc.HeroInfoDialog(hr).show()
                        } else {
                            var msg = mc.dictionary.getGUIString("lblHiddenHero");
                            var dialog = new mc.DefaultDialog()
                                .setTitle(mc.dictionary.getGUIString("lblWarning"))
                                .setMessage(msg)
                                .enableOkButton(function () {
                                    dialog.close();
                                }, mc.dictionary.getGUIString("lblOk")).disableExitButton();
                            dialog.show();
                        }
                    };
                    widget.registerTouchEvent(_showHero, _showHero);
                    widget.setSwallowTouches(false);
                }
            }
            return widget;
        }.bind(this)), numCol, width, padding);


        nodeHero.addChild(layoutHero);

        if (lblLeaderSkillInfo) {
            var leaderHeroInfo = mapHeroInfo[leaderHeroId];
            mc.view_utility.setSkillInfoForLabel(lblLeaderSkillInfo, leaderHeroInfo ? mc.HeroStock.getHeroLeaderSkill(leaderHeroInfo) : null);
        }
    };

    utility.layoutTeamMonsters = function (data, view, padding) {
        padding = padding || 2;
        var disableEdit = true;
        var arrFormation = data.arrTeamFormation;
        var mapMonsters = data.mapHeroInfo;
        var nodeHero = view.nodeHero;

        var mainHeroIds = arrFormation;

        var sortedHeroIds = mainHeroIds;

        var layoutHero = bb.layout.linear(bb.collection.createArray(5, function (index) {
            var widget = null;
            var heroInfo = mapMonsters[sortedHeroIds[index]];
            if (heroInfo) {
                var status = null;
                /* if (statusCreatureManager) {
                 status = statusCreatureManager.getStatusCreatureById(mc.HeroStock.getHeroId(heroInfo), mc.HeroStock.getHeroIndex(heroInfo));
                 }*/
                widget = new mc.HeroAvatarView(heroInfo, status);
            } else {
                var widget = new ccui.Widget();
                var cross = new ccui.ImageView(!disableEdit ? "button/Cross_Unavailable.png" : "patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
                cross.scale = !disableEdit ? 1.0 : 0.9;
                widget.addChild(cross);
                widget.width = 137;
                widget.height = 144;
                widget.anchorX = 0.5;
                widget.anchorY = 0.5;
                cross.x = widget.width * 0.5;
                cross.y = 144 * 0.5;
                widget.setCascadeOpacityEnabled(true);
            }
            return widget;
        }), padding);
        nodeHero.addChild(layoutHero);
    };

    utility.createTextFieldWithPadding = function (brkContainer, padding, anchorXY, btnSubmit) {
        var scale9 = new cc.Scale9Sprite("#patch9/Map_Tittle_Name.png");
        var txtBox = new cc.EditBox(cc.size(brkContainer.width - 30, brkContainer.height), scale9);
        txtBox.setPlaceholderFontColor(cc.color(255, 0, 0));
        txtBox.setPlaceholderFontSize(30);
        txtBox.setFontSize(30);
        txtBox.setPlaceHolder(mc.dictionary.getGUIString("txtPlzTapHere"));
        var tempPadding = padding ? padding : 0;
        var tempAnchorXY = anchorXY ? anchorXY : {x: 0, y: 0};
        txtBox.setDelegate({
            editBoxEditingDidBegin: function (editBox) {
                cc.log("editBox " + " DidBegin !");
            },

            editBoxEditingDidEnd: function (editBox) {
                cc.log("editBox " + " DidEnd !");
            },

            editBoxTextChanged: function (editBox, text) {
                cc.log("editBox " + ", TextChanged, text: " + text);
                if (cc.isFunction(btnSubmit)) {
                    btnSubmit && btnSubmit();
                } else {
                    btnSubmit.setGray(text === "" || text.length <= 3);
                }
            },

            editBoxReturn: function (editBox) {
                cc.log("editBox " + " was returned !");
            }
        });
        txtBox.setFontColor(mc.color.BLUE);
        txtBox.setMaxLength(15);
        txtBox.anchorX = tempAnchorXY.x;
        txtBox.anchorY = tempAnchorXY.y;
        txtBox.setContentSize(brkContainer.width - tempPadding * 2, brkContainer.height - tempPadding * 2)
        txtBox.x = tempPadding;
        txtBox.y = tempPadding;
        txtBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE || cc.EDITBOX_INPUT_MODE_ANY);
        brkContainer.addChild(txtBox);
        scale9.setVisible(false);
        var text = txtBox.getString();
        if (cc.isFunction(btnSubmit)) {
            // btnSubmit && btnSubmit();
        } else {
            btnSubmit.setGray(text === "" || text.length <= 3);
        }
        return txtBox;
    };

    utility.createTextField = function (brkContainer, btnSubmit, returnType) {
        returnType = returnType || cc.KEYBOARD_RETURNTYPE_DEFAULT;
        var scale9 = new cc.Scale9Sprite("#patch9/Map_Tittle_Name.png");
        var txtBox = new cc.EditBox(cc.size(brkContainer.width - 30, brkContainer.height), scale9);
        txtBox.setPlaceholderFontColor(cc.color(255, 0, 0));
        txtBox.setPlaceholderFontSize(30);
        txtBox.setFontSize(30);
        txtBox.setPlaceHolder(mc.dictionary.getGUIString("txtPlzTapHere"));
        txtBox.setDelegate({
            editBoxEditingDidBegin: function (editBox) {
                cc.log("editBox " + " DidBegin !");
            },

            editBoxEditingDidEnd: function (editBox) {
                cc.log("editBox " + " DidEnd !");
            },

            editBoxTextChanged: function (editBox, text) {
                cc.log("editBox " + ", TextChanged, text: " + text);
                if (cc.isFunction(btnSubmit)) {
                    btnSubmit && btnSubmit(text);
                } else {
                    btnSubmit.setGray(text === "" || text.length <= 3);
                }
            },

            editBoxReturn: function (editBox) {
                cc.log("editBox " + " was returned !");
            }
        });
        txtBox.setFontColor(mc.color.BLUE);
        txtBox.setMaxLength(15);
        txtBox.anchorX = 0;
        txtBox.anchorY = 0.5;
        txtBox.x = 15;
        txtBox.y = brkContainer.height * 0.475;
        txtBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE || cc.EDITBOX_INPUT_MODE_ANY);
        txtBox.setReturnType(returnType);
        brkContainer.addChild(txtBox);
        scale9.setVisible(false);
        var text = txtBox.getString();
        if (cc.isFunction(btnSubmit)) {
            // btnSubmit && btnSubmit();
        } else {
            btnSubmit.setGray(text === "" || text.length <= 3);
        }
        return txtBox;
    };
    utility.showNewComingItem = function (arrItemInfo, animationTime) {
        cc.spriteFrameCache.addSpriteFrames(res.patch9_5_plist);
        if (!animationTime) {
            animationTime = 0;
        }
        var arrItemInfo = mc.ItemStock.groupItem(arrItemInfo);
        for (var i = 0; i < arrItemInfo.length; i++) {
            var blackBrk = new ccui.ImageView("patch9/gradian_black.png", ccui.Widget.PLIST_TEXTURE);
            blackBrk.setScale9Enabled(true);
            blackBrk.setCascadeOpacityEnabled(true);
            blackBrk.height = 150;
            blackBrk.y = cc.winSize.height * 0.5;
            blackBrk.x = cc.winSize.width * 0.5;
            var itemView = new mc.ItemView(arrItemInfo[i]);
            itemView.setNewScale(0.75);
            itemView.x = itemView.width * 0.5 + 200;
            itemView.y = blackBrk.height * 0.5;
            blackBrk.addChild(itemView);
            var lblName = bb.framework.getGUIFactory().createText("");
            lblName.anchorX = 0;
            lblName.setMultiLineString(mc.ItemStock.getItemName(arrItemInfo[i]), blackBrk.width * 0.5);
            lblName.x = itemView.x + itemView.width * 0.5 + 20;
            lblName.y = blackBrk.height * 0.5;
            blackBrk.addChild(lblName);
            blackBrk.setLocalZOrder(99999999);
            blackBrk.scale = 0;
            blackBrk.runAction(cc.sequence([cc.delayTime(0.5 * i), cc.callFunc(function (node) {
                node.runAction(cc.scaleTo(0.15, 1.0));
                node.runAction(cc.sound(res.sound_ui_item_gettobag));
                node.runAction(cc.sequence([cc.moveBy(0.25, 0, 70), cc.delayTime(0.25), cc.delayTime(animationTime), cc.fadeOut(0.3), cc.removeSelf()]));
            })]));
            bb.director.getCurrentRunningScene().addChild(blackBrk);
        }

    };
    utility.confirmFunction = function (funcCode, callback) {
        var mapByCode = {};
        mapByCode[mc.const.FUNCTION_ARENA] = mc.dictionary.getGUIString("lblArena");
        mapByCode[mc.const.FUNCTION_CHAOS_CASTLE] = mc.dictionary.getGUIString("lblChaosCastle");
        mapByCode[mc.const.FUNCTION_DAILY_CHALLENGE] = mc.dictionary.getGUIString("lblChallenge");
        mapByCode[mc.const.FUNCTION_CRAFT_ITEM] = mc.dictionary.getGUIString("lblCraftWeapon");
        mapByCode[mc.const.FUNCTION_EXCHANGE_ITEM] = mc.dictionary.getGUIString("lblExchangeItems");
        mapByCode[mc.const.FUNCTION_EXCHANGE_HERO] = mc.dictionary.getGUIString("lblExchangeStones");
        var unlock = mc.GameData.canUnlockFunction(funcCode);
        if (unlock) {
            var isUnlock = unlock.isUnlock;
            if (isUnlock) {
                callback && callback();
            } else {
                mc.GUIFactory.createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txt_unlock_at_stage"),
                    mapByCode[funcCode],
                    mc.CampaignManger.getStageNameByStageIndex(unlock.stageIndex))).show();
            }
        } else {
            mc.view_utility.showComingSoon();
        }
    };
    utility.createUnlockFunctionText = function (unlock) {
        var container = null;
        if (unlock) {
            var stageIndex = unlock.stageIndex;
            var lblName = bb.framework.getGUIFactory().createText(mc.CampaignManger.getStageNameByStageIndex(stageIndex));
            lblName.setColor(mc.color.YELLOW);
            var lblUnlock = bb.framework.getGUIFactory().createText("lblUnlockAt");
            container = bb.layout.linear([lblName, lblUnlock], 5, bb.layout.LINEAR_VERTICAL);
            lblUnlock.x = container.width * 0.5;
        } else {
            var lblName = bb.framework.getGUIFactory().createText("lblComingSoon");
            lblName.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
            container = new ccui.Layout();
            container.anchorX = container.anchorY = 0.5;
            container.width = lblName.width;
            container.height = lblName.height;
            lblName.x = container.width * 0.5;
            lblName.y = container.height * 0.5;
            container.addChild(lblName);
        }
        container && (container.setCascadeOpacityEnabled(true));
        return container;
    };
    utility.showBuyingFunctionIfAny = function (codeFunction) {
        if (codeFunction &&
            (codeFunction === mc.const.EXCHANGE_FUNC_CHAOS_TICKET ||
            codeFunction === mc.const.REFRESH_FUNCTION_ILLUSION ||
            codeFunction === mc.const.FUNCTION_BLOOD_CASTLE ||
            codeFunction === mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT ||
            codeFunction === mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT ||
            codeFunction === mc.const.REFRESH_FUNCTION_BUY_VAULT_SLOT ||
            codeFunction === mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_0 ||
            codeFunction === mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_1 ||
            codeFunction === mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_2)) {
            var mapNameByCode = {};
            mapNameByCode[mc.const.REFRESH_FUNCTION_BUY_STAMINA] = mc.ItemStock.getItemName({index: mc.const.ITEM_INDEX_STAMINA});
            mapNameByCode[mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET] = mc.ItemStock.getItemName({index: mc.const.ITEM_INDEX_ARENA_TICKET});
            mapNameByCode[mc.const.EXCHANGE_FUNC_CHAOS_TICKET] = mc.ItemStock.getItemName({index: mc.const.ITEM_INDEX_CHAOS_TICKET});
            mapNameByCode[mc.const.EXCHANGE_FUNC_ZEN] = mc.ItemStock.getItemName({index: mc.const.ITEM_INDEX_ZEN});
            mapNameByCode[mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT] = mc.dictionary.getGUIString("lblBuyHeroSlot");
            mapNameByCode[mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT] = mc.dictionary.getGUIString("lblBuyItemSlot");
            mapNameByCode[mc.const.REFRESH_FUNCTION_BUY_VAULT_SLOT] = mc.dictionary.getGUIString("lblBuyVaultSlot");
            mapNameByCode[mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_0] = mc.dictionary.getGUIString("lblBuyChallener_0");
            mapNameByCode[mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_1] = mc.dictionary.getGUIString("lblBuyChallener_1");
            mapNameByCode[mc.const.EXCHANGE_FUNC_DAILY_CHALLENGER_2] = mc.dictionary.getGUIString("lblBuyChallener_2");
            mapNameByCode[mc.const.REFRESH_FUNCTION_ILLUSION] = mc.dictionary.getGUIString("lblBuyIllusionAttackChance");
            mapNameByCode[mc.const.FUNCTION_BLOOD_CASTLE] = mc.dictionary.getGUIString("lblBloodCastle");
            var price = mc.GameData.refreshGameFunctionSystem.getRefreshFunctionPriceByCode(codeFunction);
            if (price) {
                var refreshFuncDialog = new mc.RefreshFunctionDialog(codeFunction, mapNameByCode[codeFunction], 0, price, function () {
                    var loadingId = mc.view_utility.showLoadingDialog();
                    mc.protocol.exchangeGameFunction(codeFunction, price["no"], function (result) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (result) {
                            var maxSlot = result["maxSlot"];
                            if (maxSlot > 0) {
                                switch (result["func"]) {
                                    case mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT:
                                        mc.GameData.playerInfo.maxHeroSlot = maxSlot;
                                        break;
                                    case mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT:
                                        mc.GameData.playerInfo.maxItemSlot = maxSlot;
                                        break;
                                    case mc.const.REFRESH_FUNCTION_BUY_VAULT_SLOT:
                                        mc.GameData.playerInfo.maxVaulItemSlot = maxSlot;
                                        break;
                                }
                                mc.GameData.playerInfo.notifyDataChanged();
                            }
                        }
                    });
                });
                refreshFuncDialog.show();
            } else {
                var msg = "txtSuggestBuyRefreshFunctionMore";
                switch (codeFunction) {
                    case mc.const.REFRESH_FUNCTION_BUY_HERO_SLOT:
                    case mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT:
                    case mc.const.REFRESH_FUNCTION_BUY_VAULT_SLOT:
                        msg = "txtReachMaxSlot";
                        break;
                    default:
                        msg = "txtSuggestBuyRefreshFunctionMore";
                        break;
                }
                bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString(msg)).show();
            }
        }
    };
    utility.showExchangingIfNotEnoughManyCost = function (arrCostOrCost) {
        var isShowExchange = false;
        if (arrCostOrCost) {
            if (!cc.isArray(arrCostOrCost)) {
                arrCostOrCost = [arrCostOrCost];
            }
            for (var c = 0; c < arrCostOrCost.length; c++) {
                isShowExchange = mc.view_utility.showExchangingIfAny(arrCostOrCost[c]);
                if (isShowExchange) {
                    break;
                }
            }
        }
        return isShowExchange;
    };
    utility.showExchangingIfAny = function (index, value) {
        if (cc.isObject(index)) {
            value = mc.ItemStock.getItemQuantity(index);
            index = mc.ItemStock.getItemIndex(index);
        }
        if (!value || mc.ItemStock.isNotEnoughCost(mc.ItemStock.createJsonItemInfo(index, value))) {
            if (index === mc.const.ITEM_INDEX_BLESS) {
                mc.GUIFactory.confirm(mc.dictionary.getGUIString("txtSuggestBuyBless"), function () {
                    mc.IAPShopDialog.showIAPBless();
                });
            } else if (index === mc.const.ITEM_INDEX_ARENA_COINS ||
                index === mc.const.ITEM_INDEX_CHAOS_COINS) {
                var mapCode = {};
                mapCode[mc.const.ITEM_INDEX_ARENA_COINS] = {
                    name: mc.dictionary.getGUIString("lblArena"),
                    goto: mc.const.FUNCTION_ARENA
                };
                mapCode[mc.const.ITEM_INDEX_CHAOS_COINS] = {
                    name: mc.dictionary.getGUIString("lblChaosCastle"),
                    goto: mc.const.FUNCTION_CHAOS_CASTLE
                };
                var txt = cc.formatStr(mc.dictionary.getGUIString("txtSuggestGetCurrency"), mc.ItemStock.getItemName({index: index}), mapCode[index].name);
                var dialog = bb.framework.getGUIFactory().createInfoDialog(txt, function () {
                    mc.view_utility.goTo(mapCode[index].goto);
                }, mc.dictionary.getGUIString("lblGo"));
                dialog.show();
            } else if (index === mc.const.ITEM_INDEX_CHAOS_TICKET) {
                utility.showBuyingFunctionIfAny(mc.const.EXCHANGE_FUNC_CHAOS_TICKET);
            } else if (index === mc.const.ITEM_INDEX_STAMINA) {
                var staminaInfo = mc.ItemStock.createJsonItemInfo(index);
                var name = mc.ItemStock.getItemName(staminaInfo);
                mc.GUIFactory.confirm(cc.formatStr(mc.dictionary.getGUIString("txtSuggestBuySomeCurrency"), name, name),
                    function () {
                        mc.ExchangeByBlessDialog.showExchange(mc.const.REFRESH_FUNCTION_BUY_STAMINA);
                    });
            } else if (index === mc.const.ITEM_INDEX_FRIEND_POINTS) {
                bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("txtSuggestGetFriendPoint"), function () {
                    mc.view_utility.goTo("friendlist");
                }, mc.dictionary.getGUIString("lblFindFriend")).show();
            } else if (index === mc.const.ITEM_INDEX_RAID_TICKET) {
                bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("txtRaidTicketNotEnough"), function () {
                }, mc.dictionary.getGUIString("lblClose")).show();
            } else if (index === mc.const.ITEM_INDEX_RELIC_COIN) {
                bb.framework.getGUIFactory().createInfoDialog(mc.dictionary.getGUIString("txtRelicCoinNotEnough"), function () {
                }, mc.dictionary.getGUIString("lblClose")).show();
            } else {
                var itemInfo = mc.ItemStock.createJsonItemInfo(index);
                var itemName = mc.ItemStock.getItemName(itemInfo);
                mc.GUIFactory.confirm(cc.formatStr(mc.dictionary.getGUIString("txtSuggestBuySomeCurrency"), itemName, itemName), function () {
                    if (index === mc.const.ITEM_INDEX_ZEN) {
                        mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNC_ZEN);
                    } else if (index === mc.const.ITEM_INDEX_ARENA_TICKET) {
                        mc.ExchangeByBlessDialog.showExchange(mc.const.EXCHANGE_FUNCTION_BUY_ARENA_TICKET);
                    } else {
                        new mc.ExchangeItemByBlessDialog(itemInfo).show();
                    }
                });
            }
            return true;
        }
        return false;
    };
    utility.showLevelUpText = function (widget, lifeTime) {
        bb.framework.addSpriteFrames(res.text_plist);
        var lblLevelUp = new cc.Sprite("#text/Level_up.png");
        var lblLevelUpArrow = new cc.Sprite("#icon/Lv_up_arrow.png");

        lblLevelUp.x = widget.width * 0.4;
        lblLevelUp.y = widget.height * 0.5;
        lblLevelUpArrow.x = widget.width * 0.95;
        lblLevelUpArrow.y = widget.height * 0.51;
        lblLevelUp.scale = 0;
        lblLevelUp.runAction(cc.scaleTo(0.1, 1.0));
        lblLevelUpArrow.scale = 0;
        lblLevelUpArrow.runAction(cc.sequence([cc.scaleTo(0.1, 1.0), cc.callFunc(function () {
            lblLevelUpArrow.runAction(cc.sequence([cc.moveBy(0.2, 0, 2), cc.moveBy(0.2, 0, -2)]).repeatForever());
            bb.sound.playEffect(res.sound_ui_hero_lvup);
            if (lifeTime) {
                lblLevelUp.runAction(cc.sequence([cc.delayTime(lifeTime), cc.fadeOut(0.2), cc.removeSelf()]));
                lblLevelUpArrow.runAction(cc.sequence([cc.delayTime(lifeTime), cc.fadeOut(0.2), cc.removeSelf()]));
            }
        })]));
        widget.addChild(lblLevelUp);
        widget.addChild(lblLevelUpArrow);
    };
    utility.showSuggestText = function (strText, y, timeOut) {
        var delayTime = timeOut ? timeOut : 0.5;
        cc.spriteFrameCache.addSpriteFrames(res.patch9_5_plist);
        var blackBrk = new ccui.ImageView("patch9/gradian_black.png", ccui.Widget.PLIST_TEXTURE);
        blackBrk.setScale9Enabled(true);
        blackBrk.setCascadeOpacityEnabled(true);
        blackBrk.height = 150;
        blackBrk.x = cc.winSize.width * 0.5;
        blackBrk.y = y || cc.winSize.height * 0.5;
        var lblName = bb.framework.getGUIFactory().createText(strText);
        lblName.x = blackBrk.width * 0.5;
        lblName.y = blackBrk.height * 0.5;
        blackBrk.addChild(lblName);
        blackBrk.setLocalZOrder(99999999);
        blackBrk.scale = 0;
        blackBrk.runAction(cc.scaleTo(0.15, 1.0));
        blackBrk.runAction(cc.sequence([cc.moveBy(0.25, 0, 70), cc.delayTime(delayTime), cc.fadeOut(0.3), cc.removeSelf()]));
        bb.director.getCurrentRunningScene().addChild(blackBrk);
    };
    utility.showComingSoon = function () {
        mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtComingSoon"));
    };
    utility.createGlory = function (code) {
        var node = new cc.Node();
        var spark = null;
        var light = null;
        var spin = null;
        if (code === "white") {
            spark = new cc.Sprite(res.img_whitespark);
            light = new cc.Sprite(res.img_whitelight);
            spin = new cc.Sprite(res.img_whitespinninglight);
        } else if (code === "green") {
            spark = new cc.Sprite(res.img_greenspark);
            light = new cc.Sprite(res.img_greenlight);
            spin = new cc.Sprite(res.img_greenspinninglight);
        }
        if (code === "yellow") {
            spark = new cc.Sprite(res.img_yellowspark);
            light = new cc.Sprite(res.img_yellowlight);
            spin = new cc.Sprite(res.img_yellowspinninglight);
        } else if (code === "rainbow") {
            spark = new cc.Sprite(res.img_rainbowspark);
            light = new cc.Sprite(res.img_rainbowlight);
            spin = new cc.Sprite(res.img_rainbowspinninglight);
        } else {
            spark = new cc.Sprite(res.img_bluespark);
            light = new cc.Sprite(res.img_bluelight);
            spin = new cc.Sprite(res.img_bluespinninglight);
        }
        node.addChild(spark);
        node.addChild(spin);
        node.addChild(light);
        light.runAction(cc.rotateBy(0.1, 10).repeatForever());
        spin.runAction(cc.rotateBy(0.1, -10).repeatForever());
        node.setCascadeOpacityEnabled(true);
        return node;
    };
    utility.getSummonResourceFromHeroInfo = function (heroInfo) {
        var rank = mc.HeroStock.getHeroRank(heroInfo);
        var summon = {};
        if (rank <= 1) {
            summon.gemURL = res.img_gem_white;
            summon.gloryCode = "white";
            summon.particleExplosionURL = res.particle_summon_blue_explosion_plist;
            summon.particleStarTailURL = res.particle_startail_blue_plist;
        } else if (rank <= 2) {
            summon.gemURL = res.img_gem_green;
            summon.gloryCode = "green";
            summon.particleExplosionURL = res.particle_summon_blue_explosion_plist;
            summon.particleStarTailURL = res.particle_startail_blue_plist;
        } else if (rank <= 3) {
            summon.gemURL = res.img_gem_blue;
            summon.gloryCode = "blue";
            summon.particleExplosionURL = res.particle_summon_blue_explosion_plist;
            summon.particleStarTailURL = res.particle_startail_blue_plist;
        } else if (rank <= 4) {
            summon.gemURL = res.img_gem_yellow;
            summon.gloryCode = "yellow";
            summon.particleExplosionURL = res.particle_summon_yellow_explosion_plist;
            summon.particleStarTailURL = res.particle_startail_yellow_plist;
        } else {
            summon.gemURL = res.img_gem_rainbow;
            summon.gloryCode = "rainbow";
            summon.particleExplosionURL = res.particle_summon_rainbow_explosion_plist;
            summon.particleStarTailURL = res.particle_startail_blue_plist;
        }
        return summon;
    };
    utility.createTextNew = function (appearAction) {
        var spr = new cc.Sprite("#text/New_text.png");
        if (appearAction) {
            spr.runAction(cc.sequence([appearAction]));
        }
        return spr;
    };
    utility.formatDurationTime = function (timeMs) {
        var numElement = 0;
        var time = bb.utility.toTimeFromMs(timeMs);
        var strTime = "";
        var day = time.d;
        var hour = time.h;
        var minute = time.m;
        var second = time.s;
        if (day > 0 && numElement < 2) {
            strTime += (((day < 9) ? ("0" + day) : day) + "d");
            strTime += " ";
            numElement++;
        }
        if (hour > 0 && numElement < 2) {
            strTime += (((hour < 9) ? ("0" + hour) : hour) + "h");
            strTime += " ";
            numElement++;
        }
        if (minute > 0 && numElement < 2) {
            strTime += (((minute < 9) ? ("0" + minute) : minute) + "m");
            strTime += " ";
            numElement++;
        }
        if ((second === 0 && numElement === 0) || (second > 0 && numElement < 2)) {
            strTime += (((second < 9 && numElement >= 1) ? ("0" + second) : second) + "s");
            strTime += " ";
            numElement++;
        }
        return strTime;
    };

    utility.formatDurationTimeHMS = function (timeMs) {
        var time = bb.utility.toTimeFromMs(timeMs);
        var strTime = "";
        var day = time.d;
        var hour = time.h + day * 24;
        var minute = time.m;
        var second = time.s;
        strTime += (((hour < 10) ? ("0" + hour) : hour) + "h");
        strTime += " ";
        strTime += (((minute < 10) ? ("0" + minute) : minute) + "m");
        strTime += " ";
        strTime += (((second < 10) ? ("0" + second) : second) + "s");
        strTime += " ";
        return strTime;
    };
    utility.formatDurationTime2 = function (timeMs) {
        var numElement = 0;
        var time = bb.utility.toTimeFromMs(timeMs);
        var strTime = "";
        var day = time.d;
        var hour = time.h;
        var minute = time.m;
        var second = time.s;
        if (day > 0 && numElement < 2) {
            strTime += (((day < 9) ? ("0" + day) : day) + (numElement === 0 ? ":" : ""));
            numElement++;
        }
        if (hour > 0 && numElement < 2) {
            strTime += (((hour < 9) ? ("0" + hour) : hour) + (numElement === 0 ? ":" : ""));
            numElement++;
        }
        if (minute >= 0 && numElement < 2) {
            strTime += (((minute < 9) ? ("0" + minute) : minute) + (numElement === 0 ? ":" : ""));
            numElement++;
        }
        if (second >= 0 && numElement < 2) {
            strTime += (((second <= 9 && numElement >= 0) ? ("0" + second) : second) + "");
            numElement++;
        }
        return strTime;
    };
    utility.registerShowPopupItemInfo = function (itemView) {
        var dialog = null;
        itemView.registerTouchEvent(function (widget) {
            dialog = mc.createItemPopupDialog(itemView.getUserData()).setShowPosition(widget).show();
        }.bind(this), function (widget) {
            dialog = mc.createItemPopupDialog(itemView.getUserData()).setShowPosition(widget).show();
        }, false, function () {
            if (dialog) {
                dialog.close();
                dialog = null;
            }
        });
        itemView.setSwallowTouches(false);
    };
    utility.registerAssetTopBar = function (layer, slotZen, slotBless, slotHeart, btnBack, thirdCurrencyIndex) {
        thirdCurrencyIndex = thirdCurrencyIndex || mc.const.ITEM_INDEX_FRIEND_POINTS;
        var lblZen = slotZen.getChildByName("lbl");
        var lblBless = slotBless.getChildByName("lbl");
        var lblHeart = slotHeart ? slotHeart.getChildByName("lbl") : null;
        if (btnBack) {
            btnBack.registerTouchEvent(function () {
                mc.GameData.guiState.popScreen();
            });
        }

        var _animateChanger = function () {
            var assetChanger = mc.GameData.assetChanger;
            var funcObj = {};
            funcObj[mc.const.ITEM_INDEX_ZEN] = function (oldZen, zen) {
                lblZen.runAction(cc.countText(1.0, oldZen, zen));
            };
            funcObj[mc.const.ITEM_INDEX_BLESS] = function (oldBless, bless) {
                lblBless.runAction(cc.countText(1.0, oldBless, bless));
            };

            if (thirdCurrencyIndex) {
                funcObj[thirdCurrencyIndex] = function (oldCurrency, currency) {
                    lblHeart && lblHeart.runAction(cc.countText(1.0, oldCurrency, currency));
                };

                var itemInStock = mc.GameData.itemStock.getOverlapItemByIndex(thirdCurrencyIndex);
                if(itemInStock && itemInStock.itemType === 3){
                    var itemQuantity = (itemInStock ? mc.ItemStock.getItemQuantity(itemInStock) : 0);
                    var stringValue = lblHeart._stringValue;
                    lblHeart && lblHeart.runAction(cc.countText(1.0, parseInt(stringValue.replace(",","")) , itemQuantity));
                }
            }

            assetChanger.performChanging(funcObj);
        };

        var _updatePlayerInfo = function () {
            var playerInfo = mc.GameData.playerInfo;
            lblZen.setString(bb.utility.formatNumber(playerInfo.getZen()));
            lblBless.setString(bb.utility.formatNumber(playerInfo.getBless()));
            if (thirdCurrencyIndex) {
                lblHeart && lblHeart.setString(bb.utility.formatNumber(playerInfo.getNumberOfCurrencyByKey(thirdCurrencyIndex)));
            }

        }.bind(this);

        _updatePlayerInfo();
        var img = slotHeart ? slotHeart.getChildByName("icon") : null;
        if (img) {
            img.ignoreContentAdaptWithSize(true);
            if (thirdCurrencyIndex != mc.const.ITEM_INDEX_FRIEND_POINTS) {
                img.loadTexture(mc.ItemStock.getItemRes({index: thirdCurrencyIndex}), ccui.Widget.LOCAL_TEXTURE);
                img.scale = 0.65;
            }
        }
        _animateChanger();
        layer.traceDataChange(mc.GameData.assetChanger, function () {
            _animateChanger();
        });
        layer.traceDataChange(mc.GameData.playerInfo, function () {
            _updatePlayerInfo();
        });

        layer.traceDataChange(mc.GameData.itemStock, function () {
            _animateChanger();
        });
    };

    /**
     *
     * @param itemInfo
     * @param font
     * @param typeId  1: x ???  // 2: 1/???
     */
    utility.createAssetView = function (itemInfo, font, typeId) {
        var quantity = mc.ItemStock.getItemQuantity(itemInfo);
        var icon = null;
        var scale = 0.45;
        var anchorX = 0.5;
        var url = null;
        var opt = ccui.Widget.LOCAL_TEXTURE;
        if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_ZEN) {
            url = "icon/coin.png";
            opt = ccui.Widget.PLIST_TEXTURE;
            scale = 0.8;
        } else if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_BLESS) {
            url = "icon/bless.png";
            scale = 0.8;
            opt = ccui.Widget.PLIST_TEXTURE;
        } else if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_FRIEND_POINTS) {
            url = "icon/heart.png";
            scale = 0.8;
            opt = ccui.Widget.PLIST_TEXTURE;
        } else {
            url = mc.ItemStock.getItemRes(itemInfo);
        }
        icon = new ccui.ImageView(url, opt);
        icon.scale = scale;
        anchorX = 0.4;
        icon.setName("icon");
        var lbl = null;
        if (mc.ItemStock.getItemIndex(itemInfo) === mc.const.ITEM_INDEX_RELIC_COIN) {
            lbl = bb.framework.getGUIFactory().createText("" + bb.utility.formatNumber(quantity), font);
        } else {
            lbl = bb.framework.getGUIFactory().createText("" + bb.utility.formatNumberKM(quantity), font);
        }
        lbl.setName("lbl");
        var arrComp = [lbl, icon];
        if (typeId === 1) {
            anchorX = 0.5;
            arrComp = [icon, lbl];
            lbl.setString("x" + bb.utility.formatNumberKM(quantity));
        } else if (typeId === 2) {
            anchorX = 0.5;
            arrComp = [icon, lbl];
            lbl.setString("1/" + bb.utility.formatNumberKM(quantity));
        }
        var layout = bb.layout.linear(arrComp, 5);
        layout.anchorX = anchorX;
        lbl.y = layout.height * 0.6;
        layout.setCascadeColorEnabled(true);
        layout.setCascadeOpacityEnabled(true);
        return layout;
    };
    utility.goTo = function (goToCode) {
        var strs = goToCode.split('_');
        var currScreen = bb.director.getCurrentScreen();
        var isInMainScreen = currScreen instanceof mc.MainScreen;
        if (strs[0] === "stage") {
            if (strs.length > 1) {
                var stageIndex = parseInt((strs[1]));
                var chapIndex = mc.CampaignManger.getChapterIndexByStageIndex(stageIndex);
                mc.GameData.guiState.setSelectChapterIndex(chapIndex);
                if (isInMainScreen) {
                    if (strs[2] === "item") {
                        mc.GameData.guiState.setViewStageCampaignModeId(mc.GUIState.VIEW_STAGE_MODE_REWARD);
                    } else {
                        mc.GameData.guiState.setViewStageCampaignModeId(mc.GUIState.VIEW_STAGE_MODE_MONSTER);
                    }
                    currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORD_MAP);
                }
            } else {
                currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORD_MAP);
            }
        } else if (strs[0] === "map") {
            if (strs.length > 1) {
                var chapIndex = parseInt(strs[1]);
                if (mc.GameData.playerInfo.getCurrentChapterIndex() >= chapIndex) {
                    mc.GameData.guiState.setSelectChapterIndex(chapIndex);
                    if (isInMainScreen) {
                        if (strs[2] === "item") {
                            mc.GameData.guiState.setViewStageCampaignModeId(mc.GUIState.VIEW_STAGE_MODE_REWARD);
                        } else {
                            mc.GameData.guiState.setViewStageCampaignModeId(mc.GUIState.VIEW_STAGE_MODE_MONSTER);
                        }
                        currScreen.pushLayerWithId(mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST);
                    } else {
                        mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST);
                        mc.GameData.guiState.setStackLayerIdForMainScreen([
                            mc.MainScreen.LAYER_WORD_MAP,
                            mc.MainScreen.LAYER_STAGE_CAMPAIGN_LIST
                        ]);
                        new mc.MainScreen().show();
                    }
                } else {
                    mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtUnlockChapter"));
                }
            } else {
                if (isInMainScreen) {
                    currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORD_MAP);
                } else {
                    mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_WORD_MAP);
                    mc.GameData.guiState.setStackLayerIdForMainScreen([
                        mc.MainScreen.LAYER_WORD_MAP
                    ]);
                    new mc.MainScreen().show();
                }
            }
        } else if (strs[0] === "illusion" || strs[0] === "bloodcastle") {
            if (isInMainScreen) {
                currScreen.pushLayerWithId(mc.MainScreen.LAYER_ALL_EVENT);
            } else {
                mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_ALL_EVENT);
                mc.GameData.guiState.setStackLayerIdForMainScreen([
                    mc.MainScreen.LAYER_HOME,
                    mc.MainScreen.LAYER_ALL_EVENT
                ]);
                new mc.MainScreen().show();
            }
        } else if (strs[0] === "formation") {
            mc.GUIFactory.showEditFormationScreen();
        } else if (strs[0] === "chaoscastle") {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_CHAOS_CASTLE, function () {
                mc.GUIFactory.showChaosCastleScreen();
            });
        } else if (strs[0] === "worldmap" || strs[0] === "worldchallenge" || strs[0] === "usestamina") {
            currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORD_MAP);
        } else if (strs[0] === "friendlist") {
            if (isInMainScreen) {
                currScreen.pushLayerWithId(mc.MainScreen.LAYER_FRIEND);
            } else {
                mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_FRIEND);
                mc.GameData.guiState.setStackLayerIdForMainScreen([
                    mc.MainScreen.LAYER_HOME,
                    mc.MainScreen.LAYER_FRIEND
                ]);
                return new mc.MainScreen().show();
            }
        } else if (strs[0] === "summon" ||
            strs[0] === "summon5") {
            var gid = 0;
            if (strs["0"] === "summon5") {
                gid = 3;
            }
            mc.GameData.guiState.setCurrentSummonPackageGroupId(gid);
            if (isInMainScreen) {
                currScreen.pushLayerWithId(mc.MainScreen.LAYER_SUMMON_LIST);
            } else {
                mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_SUMMON_LIST);
                mc.GameData.guiState.setStackLayerIdForMainScreen([
                    mc.MainScreen.LAYER_HOME,
                    mc.MainScreen.LAYER_SUMMON_LIST
                ]);
                return new mc.MainScreen().show();
            }
        } else if (strs[0] === "dailychallenge" ||
            strs[0] === "dailychallenge1" ||
            strs[0] === "dailychallenge2" ||
            strs[0] === "dailychallenge3") {
            var _id = parseInt(strs[0].charAt(strs[0].length - 1)) - 1;
            _id < 0 && (_id = 0);
            _id > 2 && (_id = 2);
            mc.GameData.guiState.setCurrentChallengeGroupIndex(_id);
            if (isInMainScreen) {
                currScreen.pushLayerWithId(mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST);
            } else {
                mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST);
                mc.GameData.guiState.setStackLayerIdForMainScreen([
                    mc.MainScreen.LAYER_HOME,
                    mc.MainScreen.LAYER_ALL_EVENT,
                    mc.MainScreen.LAYER_CHALLENGE_STAGE_LIST
                ]);
                new mc.MainScreen().show();
            }
        } else if (strs[0] === "quest") {
        } else if (strs[0] === "upgrading") {
            if (strs[1] === "item") {
                mc.GUIFactory.showRefineItemScreen();
            }
        } else if (strs[0] === "craftingitem") {
            mc.GUIFactory.showCraftItemScreen();
        } else if (strs[0] === "shop" || strs[0] === "usebless") {
            var type = strs[1];
            if (type === "arena") {
                mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_ARENA);
            } else if (type === "chaos") {
                mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_CHAOS);
            } else {
                mc.GUIFactory.showShopScreen();
            }
        } else if (strs[0] === "character" || strs[0] === "upgradehero") {
            currScreen.pushLayerWithId(mc.MainScreen.LAYER_HERO_STOCK);
        } else if (strs[0] === "arena") {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_ARENA, function () {
                if (isInMainScreen) {
                    currScreen.pushLayerWithId(mc.MainScreen.LAYER_ARENA);
                } else {
                    mc.GameData.guiState.setCurrentLayerIdForMainScreen(mc.MainScreen.LAYER_ARENA);
                    mc.GameData.guiState.setStackLayerIdForMainScreen([
                        mc.MainScreen.LAYER_HOME,
                        mc.MainScreen.LAYER_ARENA
                    ]);
                    new mc.MainScreen().show();
                }
            });
        }
    };
    utility.registerShowServerNotify = function (screen) {
        var _showNotifyMsg = function () {
            var sysMessage = mc.GameData.notifySystem.countSysMessage();
            if (sysMessage > 0) {
                if (!screen.getChildByName("banner_msg")) {
                    var popSysMessage = mc.GameData.notifySystem.popSysMessage();
                    var bannerView = new mc.BannerView(cc.winSize.height * 0.9, popSysMessage["content"] || popSysMessage["message"], 3, 0, popSysMessage["contentp"]);
                    bannerView.setName("banner_msg");
                    screen.addChild(bannerView, 100);
                }
            }
        }.bind(screen);

        _showNotifyMsg();
        screen.traceDataChange(mc.GameData.notifySystem, function () {
            _showNotifyMsg();
        }.bind(screen));
    };
    utility.showSuggestBuyItemSlotsIfAny = function () {
        var checkForAvailableSlot = mc.GameData.checkForAvailableSlot(mc.GameData.CHECK_SLOT_TYPE_ITEM);
        var buyMore = checkForAvailableSlot["buyMore"];
        var avaiSlots = checkForAvailableSlot["avaiSlots"];
        if (avaiSlots <= 0) {
            if (buyMore) {
                mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFull"), function () {
                    mc.view_utility.showBuyingFunctionIfAny(mc.const.REFRESH_FUNCTION_BUY_ITEM_SLOT);
                }, mc.dictionary.getGUIString("lblBuy")).show();
            } else {
                mc.GUIFactory.createInfoDialog(mc.dictionary.getGUIString("txtItemSlotFullLimit"), function () {
                }, mc.dictionary.getGUIString("lblOk")).show();
            }
            return true;
        }
        return false;
    };
    utility.view_videoAd = function (callback) {
        bb.sound.pauseMusic();
        bb.pluginBox.ads.showVideo(function () {
            bb.framework.getGUIFactory().createCloseExecuteDialog(mc.dictionary.getGUIString("Congratulations"), mc.dictionary.getGUIString("Get Ads Rewards"), function () {
                mc.protocol.exchangeGameFunction(mc.const.FUNCTION_VIEW_ADS, undefined, function () {
                    callback && callback();
                });
            }, mc.dictionary.getGUIString("lblClaim")).show();
            bb.sound.resumeMusic();
        });
    };
    utility.requestIAPItems = function (callback) {
        var _printProduct = function (p) {
            cc.log("======The product info======");
            cc.log("name=", p.name);
            cc.log("title=", p.title);
            cc.log("description=", p.description);
            cc.log("price=", p.price);
            cc.log("priceValue=", p.priceValue);
            cc.log("currencyCode=", p.currencyCode);
            cc.log("receipt=", p.receipt);
            cc.log("receiptCipheredPayload=", p.receiptCipheredPayload);
            cc.log("transactionID=", p.transactionID);
        };
        var loadingId = mc.view_utility.showLoadingDialog();
        bb.pluginBox.iap.getItems(function (msg, arrProducts) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            callback && callback(arrProducts);
            if (arrProducts && arrProducts.length > 0) {
                for (var i = 0; i < arrProducts.length; i++) {
                    _printProduct(arrProducts[i]);
                }
            }
        });
    };
    utility.purchaseInAppItem = function (inAppDict, callback) {
        var _printProduct = function (p) {
            cc.log("======The product info======");
            cc.log("name=", p.name);
            cc.log("title=", p.title);
            cc.log("description=", p.description);
            cc.log("price=", p.price);
            cc.log("priceValue=", p.priceValue);
            cc.log("currencyCode=", p.currencyCode);
            cc.log("receipt=", p.receipt);
            cc.log("receiptCipheredPayload=", p.receiptCipheredPayload);
            cc.log("transactionID=", p.transactionID);
        };
        var loadingId = mc.view_utility.showLoadingDialog(5);
        bb.pluginBox.iap.getItems(function (msg, arrProducts) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            if (arrProducts) {
                var id = inAppDict["id"];
                var orderId = inAppDict["order"];
                if (mc.GameData.paymentSystem.canBuyMore(mc.PaymentSystem.getGeneratedItemId(inAppDict))) {
                    var strs = id.split('.');
                    var productName = strs[strs.length - 1];
                    cc.log("purchase: " + productName);
                    loadingId = mc.view_utility.showLoadingDialog();
                    bb.pluginBox.iap.purchase(productName, function (msg, product) {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        if (!msg && product) {
                            // for testing confirm
                            //new mc.GetStringDialog(product["receipt"]).show();
                            //new mc.GetStringDialog(product["receiptCipheredPayload"]).show();
                            var str = product["receipt"] || product["receiptCipheredPayload"];
                            if (str) {
                                mc.storage.savePerchaseInfoByPlayerId(str, orderId, mc.GameData.playerInfo.getUserId());
                                loadingId = mc.view_utility.showLoadingDialog();
                                mc.protocol.verifyPayment(str, orderId, function (result) {
                                    mc.view_utility.hideLoadingDialogById(loadingId);
                                    if (result) {
                                        mc.storage.pushObjIAPBuyTimes(mc.PaymentSystem.getGeneratedItemId({
                                            id: result["productId"],
                                            oder: orderId
                                        }), result["productId"]);
                                        mc.storage.saveObjIAPBuyTimes();
                                        bb.framework.getGUIFactory().createCongratulationDialog(mc.dictionary.getGUIString("txtPurchaseSuccessfully")).show();
                                    } else {
                                        bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtPurchaseFailed"),
                                            mc.dictionary.getGUIString("txtPurchaseFailedReasonCode")["-3"])).show();
                                    }
                                    callback && callback();
                                });
                            }
                        } else if (msg) {
                            bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtPurchaseFailed"), msg)).show();
                            callback && callback();
                        }
                    });
                } else {
                    bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtPurchaseFailed"),
                        mc.dictionary.getGUIString("txtPurchaseFailedReasonCode")["-2"])).show();
                    callback && callback();
                }
            } else {
                bb.framework.getGUIFactory().createInfoDialog(cc.formatStr(mc.dictionary.getGUIString("txtPurchaseFailed"),
                    mc.dictionary.getGUIString("txtPurchaseFailedReasonCode")["-1"])).show();
                callback && callback();
            }
        });
    };
    utility.applyTextStyle = function (textField, textStyle) {
        //if(mc.enableReplaceFontBM())
        //{
        //    //var fontName = _getFontByLanguage();
        //    //if (fontName) {
        //    //    textStyle.fontName = fontName;
        //    //}
        //
        //    if (textField && textStyle) {
        //
        //        if(textStyle.fontName)
        //        {
        //            textField.setFontName(textStyle.fontName);
        //        }
        //        if (textStyle.shadowSize) {
        //            textField.enableShadow(textStyle.shadowColor, textStyle.shadowSize);
        //        }
        //        if (textStyle.outlineSize) {
        //            textField.enableOutline(textStyle.outlineColor, textStyle.outlineSize);
        //        }
        //        if (textStyle.textColor !== undefined) {
        //            textField.setColor(textStyle.textColor);
        //        }
        //        if(textStyle.fontSize)
        //        {
        //            textField.setFontSize(textStyle.fontSize);
        //        }
        //        return textField;
        //    }
        //}

    };

    utility.createRichTextFromFontBitmap = function(contentSize){
        var textField = new ccui.RichText();
        textField.setContentSize(contentSize);
        textField.ignoreContentAdaptWithSize(false);
        return textField;
    }

    utility.createTextFromFontBitmap = function (fontBM) {
        //if(mc.enableReplaceFontBM())
        //{
        //    if (fontBM) {
        //        var textField = new ccui.Text();
        //        var fontName = _getFontByLanguage();
        //        if (_checkCamFont(fontBM)) {
        //           //fontName = getFontTTF(font_DavidLibre_Regular);
        //            fontName = getFontCamBMByLanguage();
        //        }
        //        var fontSize = _checkFontSize(fontBM);
        //        var stroke = 0;
        //        if (_checkStrokeFont(fontBM)) {
        //            stroke = 1;
        //        }
        //        if (fontName) {
        //            textField.setFontName(fontName);
        //        }
        //        if (stroke) {
        //            textField.enableOutline(mc.color.BLACK, stroke);
        //        }
        //        if (fontSize) {
        //            textField.setFontSize(fontSize);
        //        }
        //
        //        return textField;
        //    }
        //}
        return null;
    };

    utility.applyDialogTitleStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.dialogTitle;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyDialogHeaderStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.dialogHeader;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyDialogContentStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.dialogContent;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyPowerStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.powerLabel;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyLevelStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.levelLabel;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyArenaPointStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.arenaPointLabel;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyMemGuildStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.memGuildLabel;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyArenaWinNoStyle = function (uiText, titleStyle) {
        var newStyle = titleStyle || mc.textStyle.arenaWinLabel;
        this.applyTextStyle(uiText, newStyle);

    };

    utility.applyRecordTimeAgoStyle = function (uiText, titleStyle) {
        if (mc.enableReplaceFontBM()) {
            var newStyle = titleStyle || mc.textStyle.timeAgoLabel;
            this.applyTextStyle(uiText, newStyle);

        }

    };

    utility.replaceBitmapFontAndApplyTextStyle = function (textFieldBitmapFont, textStyleObj) {

        //if (mc.enableReplaceFontBM() && textFieldBitmapFont instanceof ccui.TextBMFont) {
        //    var textStyle = {};
        //     if(textStyleObj)
        //     {
        //         textStyle = bb.utility.cloneJSON(textStyleObj);
        //     }
        //    var fontName = _getFontByLanguage();
        //    var fontSize = 0;
        //
        //    var size = _checkFontSize(textFieldBitmapFont._fntFileName);
        //    var isCamFont = _checkCamFont(textFieldBitmapFont._fntFileName);
        //
        //    if (size) {
        //
        //        fontSize = size;
        //    }
        //    if (isCamFont) {
        //        //fontName = getFontTTF(font_DavidLibre_Regular);
        //        fontName = getFontCamBMByLanguage();
        //    }
        //    var stroke = 0;
        //    if (_checkStrokeFont(textFieldBitmapFont._fntFileName)) {
        //        stroke = 1;
        //    }
        //    if (textFieldBitmapFont && textStyle) {
        //        var color = textFieldBitmapFont.getColor();
        //        var textField = new ccui.Text();
        //        var parent = textFieldBitmapFont.getParent();
        //        var scale = textFieldBitmapFont.scale;
        //        textField.x = textFieldBitmapFont.x;
        //        textField.y = textFieldBitmapFont.y;
        //        textField.anchorX = textFieldBitmapFont.anchorX;
        //        textField.anchorY = textFieldBitmapFont.anchorY + 0.3;
        //        textField.width = textFieldBitmapFont.width;
        //        textField.height = textFieldBitmapFont.height;
        //        textField.setName(textFieldBitmapFont.getName());
        //
        //        if (parent) {
        //            parent.addChild(textField);
        //        }
        //        textField.setString(textFieldBitmapFont.getString());
        //
        //        textField.getParent();
        //
        //        if (textStyle.shadowSize) {
        //            textField.enableShadow(textStyle.shadowColor, textStyle.shadowSize);
        //        }
        //        //if (textStyle.outlineSize) {
        //        //    textField.enableOutline(textStyle.outlineColor, textStyle.outlineSize);
        //        //}
        //        //if (textStyle.textColor !== undefined) {
        //        //    textField.setColor(textStyle.textColor);
        //        //}
        //        var outlineColor = mc.color.BLACK;
        //        if (textStyle.outlineSize && textStyle.outlineColor) {
        //            outlineColor = textStyle.outlineColor;
        //        }
        //        if (stroke) {
        //            textField.enableOutline(outlineColor, stroke);
        //
        //        }
        //        textField.setColor(color);
        //
        //        if (fontSize) {
        //            textField.setFontSize(fontSize * scale);
        //        }
        //        else if (textStyle.fontSize) {
        //
        //            textField.setFontSize(textStyle.fontSize * scale);
        //        }
        //        else {
        //            fontSize = 28 * scale;
        //            textField.setFontSize(fontSize);
        //        }
        //        //if(textStyle.align)
        //        //{
        //        //    if(textStyle.align.horizontal)
        //        //    {
        //        //        textField.setTextHorizontalAlignment(textStyle.align.horizontal);
        //        //    }
        //        //    if(textStyle.align.vertical)
        //        //    {
        //        //        textField.setTextVerticalAlignment(textStyle.align.vertical);
        //        //    }
        //        //}
        //        if (fontName) {
        //            textField.setFontName(fontName);
        //        }
        //        else {
        //            textField.setFontName(textStyle.fontName);
        //        }
        //        textFieldBitmapFont.runAction(cc.removeSelf());
        //        return textField;
        //    }
        //}
        return textFieldBitmapFont;
    };
    return utility;
}());