/**
 * Created by long.nguyen on 2/7/2017.
 */

cc.Node.prototype.traceDataChange = function (glueObject, changeDataCb, ignoreTrack) {
    var listener = cc.EventListener.create({
        event: cc.EventListener.CUSTOM,
        eventName: cc.isObject(glueObject) ? glueObject.getGlueName() : glueObject,
        callback: function (eventData) {
            changeDataCb && changeDataCb(eventData.getUserData());
        }
    });
    if (!ignoreTrack) {
        this.onExit = function () {
            cc.Node.prototype.onExit.call(this);
            cc.eventManager.removeListener(listener);
        }.bind(this);
    }
    cc.eventManager.addListener(listener, this);
    return listener;
};

cc.Node.prototype.setOpacityForAll = function (opacity) {
    this.setOpacity(opacity);
    var childs = this.getChildren();
    for (var i = 0; i < childs.length; i++) {
        childs[i].setOpacity(opacity);
    }
};

cc.Node.prototype.fadeAll = function (duration, isIn) {
    var childs = this.getChildren();
    for (var i = 0; i < childs.length; i++) {
        childs[i].setCascadeOpacityEnabled(true);
        if (isIn) {
            childs[i].runAction(cc.fadeIn(duration));
        } else {
            childs[i].runAction(cc.fadeOut(duration));
        }
    }
};

ccui.ImageView.prototype.setString = function (str, fontType, fontSize) {
    return bb.utility.setStringForWidget(this, str, fontType, fontSize);
};
ccui.Button.prototype.setString = function (str, fontType, fontSize) {
    var originalEnable = this.isEnabled();
    var lbl1 = bb.utility.setStringForWidget(this.getVirtualRenderer(), str, fontType, fontSize);

    this.setEnabled(!originalEnable);
    var lbl2 = bb.utility.setStringForWidget(this.getVirtualRenderer(), str, fontType, fontSize);

    this.setEnabled(originalEnable);
};
ccui.TextBMFont.prototype.setMultiLineString = function (str, maxW, align) {
    if (!this._maxStrWidth) {
        this._maxStrWidth = maxW || this.width;
    }
    align = align || cc.TEXT_ALIGNMENT_LEFT;
    this.getVirtualRenderer().setBoundingWidth(this._maxStrWidth);
    this.getVirtualRenderer().setAlignment(align);
    this.setString(str);
};
ccui.TextBMFont.prototype.setShortenString = function (str, maxW) {
    if (!this._maxStrWidth) {
        this._maxStrWidth = maxW || this.width;
        this._maxStrLength = this.getStringLength();
    }
    this.setString(str);
    if (this.width > maxW) {
        var newStr = this.getString();
        this.setString(newStr.slice(0, this._maxStrLength - 3) + "...");
    }
};
ccui.TextBMFont.prototype.setComplexString = function (str, color) {
    //if( str ){
    //    var strs = str.split('#');
    //    var arrMark = [];
    //    var newStr = "";
    //    if( strs && strs.length > 1 ){
    //        var i = 0;
    //        for(; i < strs.length; ){
    //            newStr += strs[i];
    //            if( i + 1 < strs.length ){
    //                var parseStrs = strs[i+1].split('_');
    //                var strColor = parseStrs[0];
    //                var index = newStr.length;
    //                newStr += parseStrs[1];
    //                if( i + 2 < strs.length ){
    //                    arrMark.push({
    //                        index: index,
    //                        length:parseStrs[1].length,
    //                        color: cc.hexToColor("#"+strColor)
    //                    });
    //                }
    //            }
    //            i += 2;
    //        }
    //    }
    //    else{
    //        newStr = strs[0];
    //    }
    //    this.setString(newStr);
    //    var virtualRenderer = this.getVirtualRenderer();
    //    virtualRenderer.setColor(color||cc.color.WHITE);
    //    for(var i = 0; i < arrMark.length; i++ ){
    //        var mark = arrMark[i];
    //        for(var m = 0; m < mark.length; m++ ){
    //            var pos = mark.index+m;
    //            virtualRenderer.getChildByTag(pos).setColor(mark.color);
    //        }
    //    }
    //}
    this.setString(str);
    this.setColor(color || cc.color.WHITE);
};
cc.LabelBMFont.prototype.setComplexString = function (str, color) {
    if (str) {
        var strs = str.split('#');
        var arrMark = [];
        var newStr = "";
        if (strs && strs.length > 1) {
            var i = 0;
            for (; i < strs.length;) {
                newStr += strs[i];
                if (i + 1 < strs.length) {
                    var parseStrs = strs[i + 1].split('_');
                    var strColor = parseStrs[0];
                    var index = newStr.length;
                    newStr += parseStrs[1];
                    if (i + 2 < strs.length) {
                        arrMark.push({
                            index: index,
                            length: parseStrs[1].length,
                            color: cc.hexToColor("#" + strColor)
                        });
                    }
                }
                i += 2;
            }
        } else {
            newStr = strs[0];
        }
        var parenColor = color || this.getColor() || cc.color.WHITE;
        this.setString(newStr);
        var children = this.getChildren();
        for (var i in children) {
            var child = children[i];
            if (child && child.setColor) {
                child.setColor(parenColor);
            }
        }

        for (var i = 0; i < arrMark.length; i++) {
            var mark = arrMark[i];
            for (var m = 0; m < mark.length; m++) {
                var pos = mark.index + m;
                var childByTag = this.getChildByTag(pos);
                if (childByTag) {
                    childByTag.setColor(mark.color);
                } else {
                    mc.log("setComplexString false: " + pos);
                    mc.log("setComplexString false: " + JSON.stringify(arrMark));
                }
            }
        }
    }
};


/*****************************/
cc.LabelTTF.prototype.setComplexString = function (str, color, font) {
    if (str) {
        var strByEnter = str.split('\n');

        var renderTextLine = function(text, newColor , newFont){
            var strs = text.split('#');
            var arrMark = [];
            var newStr = "";
            var textField = mc.view_utility.createTextFromFontBitmap(newFont);
            if (strs && strs.length > 1) {
                var i = 0;
                for (; i < strs.length;) {
                    newStr += strs[i];
                    if (i + 1 < strs.length) {
                        var parseStrs = strs[i + 1].split('_');
                        var strColor = parseStrs[0];
                        var index = newStr.length;
                        newStr += parseStrs[1];
                        if (i + 2 < strs.length) {
                            //arrMark.push({
                            //    index: index,
                            //    length: parseStrs[1].length,
                            //    color: cc.hexToColor("#" + strColor)
                            //});
                            this.setString("");
                            var scale = 1;
                            textField.height = this.height;

                            //this.setDecoratorLabel(strs[0], color, font, true);
                            var lbl = textField.setDecoratorLabel(strs[0], color, newFont, true);
                            var lbl1 = lbl.setDecoratorLabel(parseStrs[1], cc.hexToColor("#" + strColor), newFont, true);
                            lbl1.setDecoratorLabel(strs[2], newColor, newFont, true);
                            textField.setCascadeOpacityEnabled(true);
                            lbl.setCascadeOpacityEnabled(true);
                            lbl1.setCascadeOpacityEnabled(true);
                            return textField;
                        }
                    }
                    i += 2;
                }
            } else {
                textField = mc.view_utility.createTextFromFontBitmap(font);
                textField.setString(text);
                textField.setColor(newColor);
            }
            return textField;
        }.bind(this);
        if (strByEnter.length > 1) {
            var hh = 0;
            this.setString("");
            for(var i =0;i<strByEnter.length;i++)
            {

                var li = renderTextLine(strByEnter[i],color,font);
                this.addChild(li);
                li.x = -this.width/2;
                li.anchorX = 0;
                li.anchorY = 0;
                li.y = hh ;
                hh -= this.height*(i+1) + 10;
            }
            this.setCascadeOpacityEnabled(true);
            //this.anchorX = -0.5;
            //this.anchorY = -0.5;
            this.height = Math.abs(hh);
        }
        else {
            this.setString("");
            var line = renderTextLine(str, color,font);
            this.addChild(line);
            line.y = this.height/2;
            line.x = -this.width/2;
            line.anchorX = 0;
            this.setCascadeOpacityEnabled(true);

        }

    }
};

ccui.Text.prototype.setMultiLineString = function (str, maxW, align) {
    if (!this._maxStrWidth) {
        this._maxStrWidth = maxW || this.width;
    }
    align = align || cc.TEXT_ALIGNMENT_LEFT;
    this.getVirtualRenderer().setBoundingWidth(this._maxStrWidth);
    this.getVirtualRenderer().setAlignment(align);
    this.setString(str);
};
ccui.Text.prototype.setShortenString = function (str, maxW) {
    if (!this._maxStrWidth) {
        this._maxStrWidth = maxW || this.width;
        this._maxStrLength = this.getStringLength();
    }
    this.setString(str);
    if (this.width > maxW) {
        var newStr = this.getString();
        this.setString(newStr.slice(0, this._maxStrLength - 3) + "...");
    }
};

/*************custom ui text********************/
//ccui.Text.prototype.setColor = function(color)
//{
//  if(this.getVirtualRenderer())
//  {
//      this.getVirtualRenderer().setFontFillColor(color);
//  }
//};

//ccui.Text.prototype.setBoundingWidth= function (width) {
//    if(width)
//    {
//        this.width = width;
//        this.getVirtualRenderer().setBoundingWidth(width);
//    }
//};
//ccui.Text.prototype.setComplexString = function (str, color, font) {
//    //if( str ){
//    //    var strs = str.split('#');
//    //    var arrMark = [];
//    //    var newStr = "";
//    //    if( strs && strs.length > 1 ){
//    //        var i = 0;
//    //        for(; i < strs.length; ){
//    //            newStr += strs[i];
//    //            if( i + 1 < strs.length ){
//    //                var parseStrs = strs[i+1].split('_');
//    //                var strColor = parseStrs[0];
//    //                var index = newStr.length;
//    //                newStr += parseStrs[1];
//    //                if( i + 2 < strs.length ){
//    //                    arrMark.push({
//    //                        index: index,
//    //                        length:parseStrs[1].length,
//    //                        color: cc.hexToColor("#"+strColor)
//    //                    });
//    //                }
//    //            }
//    //            i += 2;
//    //        }
//    //    }
//    //    else{
//    //        newStr = strs[0];
//    //    }
//    //    this.setString(newStr);
//    //    var virtualRenderer = this.getVirtualRenderer();
//    //    virtualRenderer.setColor(color||cc.color.WHITE);
//    //    for(var i = 0; i < arrMark.length; i++ ){
//    //        var mark = arrMark[i];
//    //        for(var m = 0; m < mark.length; m++ ){
//    //            var pos = mark.index+m;
//    //            virtualRenderer.getChildByTag(pos).setColor(mark.color);
//    //        }
//    //    }
//    //}
//    //this.getVirtualRenderer().setComplexString(str,color);
//    //this.setColor(color || cc.color.WHITE);
//
//    if (str) {
//        var strByEnter = str.split('\n');
//
//        var renderTextLine = function(text, newColor , newFont){
//            var strs = text.split('#');
//            var newStr = "";
//            var textField = null;
//            if(newFont)
//            {
//                textField = mc.view_utility.createTextFromFontBitmap(newFont);
//                textField.setColor(newColor);
//            }
//            else
//            {
//                textField = new ccui.Text();
//                textField.setFontName(this.getFontName());
//                textField.setFontSize(this.getFontSize());
//                textField.setColor(this.getColor());
//                textField.setBoundingWidth(this._customSize.width);
//            }
//            if (strs && strs.length > 1) {
//                var i = 0;
//                for (; i < strs.length;) {
//                    newStr += strs[i];
//                    if (i + 1 < strs.length) {
//                        var parseStrs = strs[i + 1].split('_');
//                        var strColor = parseStrs[0];
//                        var index = newStr.length;
//                        newStr += parseStrs[1];
//                        if (i + 2 < strs.length) {
//                            var scale = 1;
//                            textField.height = this.height;
//                            var lbl = textField.setDecoratorLabel(strs[0], color, newFont, true);
//                            textField.width += lbl.width;
//                            if(parseStrs[1])
//                            {
//                                var lbl1 = lbl.setDecoratorLabel(parseStrs[1], cc.hexToColor("#" + strColor), newFont, true);
//                                textField.width +=  lbl1.width;
//                                if(strs[2])
//                                {
//                                    lbl1.setDecoratorLabel(strs[2], newColor, newFont, true);
//                                    textField.width += lbl.width;
//                                }
//                            }
//
//                            //textField.setString(str[0]);
//                            //textField.width += 50;
//                            //var lbl = textField.setDecoratorLabel(parseStrs[1], cc.hexToColor("#" + strColor), newFont);
//                            //textField.width += lbl.width;
//                            //if(parseStrs[1])
//                            //{
//                            //    var lbl1 = lbl.setDecoratorLabel(strs[2], newColor, newFont, true);
//                            //    textField.width +=  lbl1.width;
//                            //}
//                            //return textField;
//
//                        }
//                    }
//                    i += 2;
//                }
//            } else {
//                textField.setString(text);
//            }
//            return textField;
//        }.bind(this);
//        if (strByEnter.length > 1) {
//            //var hh = strByEnter.length * this.height;
//            //this.setString("");
//            //for(var i =0;i<strByEnter.length;i++)
//            //{
//            //    var li = renderTextLine(strByEnter[i],color,font);
//            //    this.addChild(li);
//            //    li.x = 0;
//            //    li.anchorX = 0;
//            //    li.anchorY = 1;
//            //    li.y = hh - (li.height) - this.height/2 - 10;
//            //}
//            var hh = -5;
//            this.setString("");
//            for(var i = strByEnter.length -1;i>=0 ;i--)
//            {
//                var li = renderTextLine(strByEnter[i],color,font);
//                this.addChild(li);
//                li.x = 0;
//                li.anchorX = 0;
//                li.anchorY = 1;
//                li.y = hh ;
//                hh += li.height + 10;
//            }
//            this.setCascadeOpacityEnabled(true);
//            this.height = hh ;
//            this.anchorX = 0;
//            var cs = this.getContentSize();
//            this._contentSize = cc.size(cs.width,hh + this.height);
//            //this.anchorX = -0.5;
//            //this.anchorY = -0.5;
//            //this.height += hh;
//        }
//        else {
//            this.setString("");
//            var line = renderTextLine(str, color,font);
//            line.y = this.height/2;
//            line.anchorX = 0;
//            line.x = 0;
//            this.width = line.width;
//            var cs = this.getContentSize();
//            this._contentSize = cc.size(line.width,line.height);
//            this.addChild(line);
//            this.setCascadeOpacityEnabled(true);
//        }
//
//    }
//};
//
//ccui.Text.prototype.setDecoratorLabel = function (str, color, font) {
//    str = str || "";
//    var lbl = null;
//
//    this.getChildByName("__decorator_label__");
//
//
//    if (!lbl) {
//        //lbl = font ? bb.framework.getGUIFactory().createText("Welcome to", font, mc.const.FONT_SIZE_32) : this.clone();
//        if(font)
//        {
//            lbl = mc.view_utility.createTextFromFontBitmap(font);
//        }
//        else
//        {
//            lbl = new ccui.Text();
//            lbl.setFontName(this.getFontName());
//        }
//        lbl.setFontSize(this.getFontSize());
//        lbl.setName("__decorator_label__");
//
//        //lbl.scale = 1.0;
//        //lbl.anchorX = 0;
//        color && lbl.setColor(color);
//        this.addChild(lbl);
//    }
//    lbl.setString(str);
//    var align = 0;
//    lbl.anchorX = 0;
//    lbl.anchorY = 0.5;
//    lbl.x = this.width + align;
//    lbl.y = this.height * 0.5;
//    var dW = lbl.width + align;
//    if (!this._baseAnchorX) {
//        this._baseAnchorX = this.anchorX;
//    }
//    //this.anchorX = this._baseAnchorX + ((dW / this.width) * this._baseAnchorX);
//    this.setCascadeOpacityEnabled(true);
//    lbl && (lbl.setVisible(str != ""));
//    return lbl;
//};
//
//ccui.Text.prototype.setOverlayColor = function (color) {
//    this.enableOutline(color, 1);
//}
/*************end custom ui text********************/

cc.LabelTTF.prototype.setAlignment = function (alignType) {
    this.setVerticalAlignment(cc.VERTICAL_TEXT_ALIGNMENT_CENTER);
    this.anchorY = 0.5;
    if (alignType === cc.TEXT_ALIGNMENT_CENTER) {
        this.setHorizontalAlignment(cc.TEXT_ALIGNMENT_CENTER);
    }
    else if (alignType === cc.TEXT_ALIGNMENT_LEFT) {
        this.setHorizontalAlignment(cc.TEXT_ALIGNMENT_LEFT);
    }
    else if (alignType === cc.TEXT_ALIGNMENT_RIGHT) {
        this.setHorizontalAlignment(cc.TEXT_ALIGNMENT_RIGHT);
    }
}

cc.LabelTTF.prototype.setBoundingWidth = function (width) {
    this._setBoundingWidth(width);
}

cc.LabelTTF.prototype.setBoundingHeight = function (height) {
    this._setBoundingHeight(height);
}

/*****************************/

ccui.ImageView.prototype.setGray = function (isGray) {
    this.setEnabled(!isGray);
    //this.setColor(isGray ? cc.hexToColor("#413535") : cc.color.WHITE);
    var program = null;
    if (isGray) {
        program = bb.utility.getGrayShaderProgram();
    } else {
        program = bb.utility.getDefaultShaderProgram();
    }
    this.getVirtualRenderer().setShaderProgram(program);
};

cc.Sprite.prototype.setGray = function (isGray) {
    var program = null;
    if (isGray) {
        program = bb.utility.getGrayShaderProgram();
    } else {
        program = bb.utility.getDefaultShaderProgram();
    }
    this.setShaderProgram(program);
};

ccui.TextBMFont.prototype.setGray = function (isGray) {
    this.setEnabled(!isGray);
    //this.setColor(isGray ? cc.hexToColor("#413535") : cc.color.WHITE);
    var program = null;
    if (isGray) {
        program = bb.utility.getGrayShaderProgram();
    } else {
        program = bb.utility.getDefaultShaderProgram();
    }
    this.getVirtualRenderer().setShaderProgram(program);
};

ccui.Widget.prototype.setGrayForAll = function (isGray) {
    this.setGray && this.setGray(isGray);
    bb.utility.travelNode(this, function (node) {
        node.setGray && node.setGray(isGray);
    });
};

ccui.ImageView.prototype.setOutline = function (isOutline, color) {
    var program = null;
    if (isOutline) {
        program = bb.utility.getOutlineShaderProgram();
        if (cc.sys.isNative) {
            this.getVirtualRenderer().setGLProgramState(program);
        } else {
            this.getVirtualRenderer().setShaderProgram(program);
        }
    } else {
        program = bb.utility.getDefaultShaderProgram();
        this.getVirtualRenderer().setShaderProgram(program);
    }
};

ccui.Widget.prototype.registerTouchEvent = function (clickFunc, longClickFunc, isRepeat, endCallback) {
    var widget = this;
    var deltaScale = widget._touchScale || -0.1,
        scaleX = widget.getScaleX(),
        scaleY = widget.getScaleY(),
        pressed = false,
        actionTag = 99999,
        repeatTag = 55555,
        runEndTouchAnimation = false,
        self = this;
    widget.setTouchEnabled(true);
    widget._disableClickSound = widget._disableClickSound || false;
    widget.addTouchEventListener(function (widget, type) {
        if (type === ccui.Widget.TOUCH_BEGAN) {
            // TODO: create click sound
            if (!widget._disableClickSound) {
                if (widget._soundId != undefined) {
                    bb.sound.playEffect(widget._soundId);
                } else {
                    var defaultSoundId = bb.framework.getGUIFactory().createButtonSoundEffect();
                    defaultSoundId && bb.sound.playEffect(defaultSoundId);
                }
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
                widget.setScale(scaleX, scaleY);
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
        }
        if (runEndTouchAnimation) {
            var action = cc.scaleTo(0.07, scaleX, scaleY);
            action.setTag(actionTag);
            widget.runAction(action);
        }
    });

};

// In the result, the anchor's UITextBitMapFont will be changed.
ccui.TextBMFont.prototype.setDecoratorLabel = function (str, color, font) {
    str = str || "";
    var lbl = this.getChildByName("__decorator_label__");
    if (!lbl) {
        lbl = font ? bb.framework.getGUIFactory().createText("Welcome to", font, mc.const.FONT_SIZE_32) : this.clone();
        lbl.setName("__decorator_label__");
        lbl.scale = 1.0;
        lbl.anchorX = 0;
        color && lbl.setColor(color);
        this.addChild(lbl);
    }
    lbl.setString(str);
    var align = this._paddingDecorator || 8;
    lbl.x = this.width + align;
    lbl.y = this.height * 0.5;
    var dW = lbl.width + align;
    if (!this._baseAnchorX) {
        this._baseAnchorX = this.anchorX;
    }
    this.anchorX = this._baseAnchorX + ((dW / this.width) * this._baseAnchorX);
    this.setCascadeOpacityEnabled(true);
    lbl && (lbl.setVisible(str != ""));
    return lbl;
};

ccui.TextBMFont.prototype.setOverlayColor = function (color) {
    this.setColor(color);
    this.getVirtualRenderer().setShaderProgram(bb.utility.getOverlayShaderProgram());
};

ccui.ScrollView.prototype.scrollTo = function (offset, time) {
    var isHorizontal = this.getDirection() === ccui.ScrollView.DIR_HORIZONTAL;
    bb.utility.scrollTo(this, offset, time, isHorizontal);
};