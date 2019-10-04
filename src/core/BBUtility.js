/**
 * Created by longnguyen on 11/3/2016.
 */

var bb = bb || {};
bb.utility = bb.utility || {};
(function () {
    bb.utility.scaleLayoutWithWidth = function (arrWidget) {
        var scale = 1 / kgamble.scaleRatio;
        for (var i = 0; i < arrWidget.length; i++) {
            arrWidget[i].width *= scale;
        }
    };
    bb.utility.scaleLayoutWithPosition = function (arrWidget) {
        var scale = 1 / kgamble.scaleRatio;
        var dScale = (cc.winSize.width * scale - cc.winSize.width) / 2;
        var minX = -dScale;
        var maxX = cc.winSize.width + dScale;
        for (var i = 0; i < arrWidget.length; i++) {
            var percentX = arrWidget[i].x / cc.winSize.width;
            arrWidget[i].x = minX + percentX * (maxX - minX);
        }
    };
    bb.utility.arrayORArray = function (arr1, arr2, filterFunc) {
        var cpArr1 = cc.copyArray(arr1);
        var cpArr2 = cc.copyArray(arr2);
        var sameArr = [];
        for (var i1 = cpArr1.length - 1; i1 >= 0; i1--) {
            for (var i2 = cpArr2.length - 1; i2 >= 0; i2--) {
                if (filterFunc(cpArr1[i1], cpArr2[i2])) {
                    sameArr.push(cpArr1[i1]);
                    cpArr1.splice(i1, 1);
                    cpArr2.splice(i2, 1);
                    break;
                }
            }
        }
        var arrResults = new Array(cpArr1.length + cpArr2.length + sameArr.length);
        var index = 0;
        for (var i = 0; i < cpArr1.length; i++) {
            arrResults[index++] = cpArr1[i];
        }
        for (var i = sameArr.length - 1; i >= 0; i--) {
            arrResults[index++] = sameArr[i];
        }
        for (var i = 0; i < cpArr2.length; i++) {
            arrResults[index++] = cpArr2[i];
        }
        return arrResults;
    };
    bb.utility.arrayANDArray = function (arr1, arr2, filterFunc) {
        var arrResults = [];
        if (arr1 && arr2 && filterFunc) {
            for (var i1 = 0; i1 < arr1.length; i1++) {
                for (var i2 = 0; i2 < arr2.length; i2++) {
                    if (filterFunc(arr1[i1], arr2[i2])) {
                        arrResults.push(arr1[i1]);
                    }
                }
            }
        }
        return arrResults;
    };
    bb.utility.arrayXORArray = function (arr1, arr2, filterFunc) {
        var cpArr1 = cc.copyArray(arr1);
        var cpArr2 = cc.copyArray(arr2);
        for (var i1 = cpArr1.length - 1; i1 >= 0; i1--) {
            for (var i2 = cpArr2.length - 1; i2 >= 0; i2--) {
                if (filterFunc(cpArr1[i1], cpArr2[i2])) {
                    cpArr1.splice(i1, 1);
                    cpArr2.splice(i2, 1);
                    break;
                }
            }
        }
        var arrResults = new Array(cpArr1.length + cpArr2.length);
        var index = 0;
        for (var i = 0; i < cpArr1.length; i++) {
            arrResults[index++] = cpArr1[i];
        }
        for (var i = 0; i < cpArr2.length; i++) {
            arrResults[index++] = cpArr2[i];
        }
        return arrResults;
    };
    bb.utility.mapTraverse = function (arr, cb, param) {
        if (arr) {
            for (var key in arr) {
                cb(arr[key], key, param);
            }
        }
    };
    bb.utility.arrayTraverse = function (arr, cb, param) {
        if (arr) {
            for (var i = 0; i < arr.length; i++) {
                cb(arr[i], i, param);
            }
        }
    };
    bb.utility.arrayAttr = function (arr, attr) {
        var arrResults = new Array(arr.length);
        for (var i = 0; i < arr.length; i++) {
            var obj = arr[i];
            arrResults[i] = (obj != null) ? obj[attr] : null;
        }
        return arrResults;
    };
    bb.utility.arrayFilter = function (arr, filterFunc) {
        var arrResults = [];
        for (var i = 0; i < arr.length; i++) {
            if (filterFunc(arr[i])) {
                arrResults.push(arr[i]);
            }
        }
        return arrResults;
    };
    bb.utility.mapFilter = function (map, filterFunc, isArray) {
        var mapResults = {};
        for (var key in map) {
            if (filterFunc(map[key])) {
                if (isArray) {
                    if (!mapResults[key]) {
                        mapResults[key] = [];
                    }
                    mapResults[key].push(map[key]);
                } else {
                    mapResults[key] = map[key];
                }
            }
        }
        return mapResults;
    };
    bb.utility.arrayToMap = function (arr, getKeyFunc, getAttrFunc) {
        var map = {};
        for (var i = 0; i < arr.length; i++) {
            map[getKeyFunc(arr[i])] = (getAttrFunc != null) ? getAttrFunc(arr[i]) : arr[i];
        }
        return map;
    };


    /**
     * Chuyển Array Object sang dạng Maps , dùng Id của Object làm key, nếu Object ko có Id gán key theo Index.
     * @param arrayObject
     */
    bb.utility.toMaps = function (arrayObject, fixProperty) {
        var data = {};
        if (cc.isArray(arrayObject)) {
            for (var i = 0, n = arrayObject.length; i < n; i++) {
                data[arrayObject[i][fixProperty || "id"] || i] = arrayObject[i];
            }
        } else {
            cc.error("toMaps(array)-> Wrong param!");
        }
        return data;
    };

    bb.utility.makeMapsKeyIndex = function (arrayObject, idKey) {
        var data = {};
        if (cc.isArray(arrayObject)) {
            for (var i = 0, n = arrayObject.length; i < n; i++) {
                var key = arrayObject[i][idKey ? idKey : "id"];
                if (key === undefined) {
                    key = i;
                }
                data[key] = i;
            }
        } else {
            cc.error("toMaps(array)-> Wrong param!");
        }
        return data;
    };

    bb.utility.copyProperties = function (src, properties) {
        for (var p in properties) {
            src[p] = properties[p];
        }
    };

    bb.utility.mapToArray = function (map) {
        var arrResults = null;
        if (map) {
            arrResults = [];
            for (var key in map) {
                arrResults.push(map[key]);
            }
        }
        return arrResults;
    };
    bb.utility.stringBreakLines = function (str, charW, lineW) {
        var arrAppendLineIndex = [];
        var currLineLength = 0;
        var lastSpaceIndex = -1;
        for (var c = 0; c < str.length; c++) {
            currLineLength += charW;
            if (str[c] === ' ') {
                lastSpaceIndex = c; //
            }
            if (currLineLength >= lineW) {
                if (lastSpaceIndex >= 0) {
                    arrAppendLineIndex.push(lastSpaceIndex);
                    lastSpaceIndex = -1;
                    currLineLength = 0;
                }
            }
        }
        var newStr = str;
        for (var i = 0; i < arrAppendLineIndex.length; i++) {
            var position = arrAppendLineIndex[i];
            newStr = newStr.substr(0, position + 1) + '\n' + newStr.substr(position + 1);
            if (i < arrAppendLineIndex.length - 1) {
                arrAppendLineIndex[i + 1] += (i + 1); // increment next line break index.
            }
        }
        return newStr;
    };

    bb.utility.stringFormatWidth = function (str, width, size, character) {
        if (str == null)
            return str;
        if (character == null) {
            character = "...";
        }
        var sliceIndex = parseInt(width / size);
        var lastIndex = str.length;
        if (lastIndex > sliceIndex) {
            str = str.slice(0, sliceIndex);
            str += character;
        }
        return str;
    };

    bb.utility.registerRunner = function (name, callback, target, interval, delay) {
        interval = interval || 1;
        delay = delay || 0;
        cc.director.getScheduler().schedule(callback, target, interval, cc.REPEAT_FOREVER, delay, false, name);
    };

    bb.utility.unRegisterRunner = function (name, target) {
        cc.director.getScheduler().unschedule(name, target);
    };

    bb.utility.getPointInScreen = function (x, y) {
        return cc.p(x, y);
    };

    bb.utility.getDataFromURL = function (url, cb) {
        try {
            var xhr = cc.loader.getXMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                    cb && cb(xhr.responseText);
                }
            };
            xhr.onerror = function () {
                cb && cb(null);
            }
            xhr.send();
        } catch (exception) {
            cb && cb(null);
        }
    };

    bb.utility.isEmptyObj = function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    };

    bb.utility.toTimeFromMs = function (millis, time) {
        time = time || {};
        var s = millis / 1000;
        var d = Math.floor(s / 86400);
        if (d > 0) {
            s -= d * 86400;
        }
        var h = Math.floor(s / 3600);
        if (h > 0) {
            s -= h * 3600;
        }
        var m = Math.floor(s / 60);
        if (m > 0) {
            s -= m * 60;
        }
        s = Math.floor(s);
        time.d = d;
        time.h = h;
        time.m = m;
        time.s = s;
        return time;
    };

    bb.utility.formatNumber = function (num, separator) {
        var sign = num < 0 ? '-' : '';
        num = Math.abs(num);
        var numAsStr = String(num);
        if (num < 1000)
            return sign + numAsStr;

        separator = separator || ',';
        for (var i = numAsStr.length - 3; i > 0; i -= 3) {
            numAsStr = numAsStr.substring(0, i) + separator + numAsStr.substring(i);
        }
        return sign + numAsStr;
    };
    bb.utility.formatNumberKM = function (num, separator) {
        if (num >= 1000000) {
            num = Math.floor(num / 100000) / 10;
            return bb.utility.formatNumber(num, separator) + "M"
        }
        if (num >= 10000) {
            num = Math.floor(num / 1000);
            return bb.utility.formatNumber(num, separator) + "K"
        }
        return bb.utility.formatNumber(num, separator);
    };

    /**
     * format number neu nho hon 10 thi them 0
     * @param number
     * @param character
     * @returns {*}
     */
    bb.utility.formatNumberNine = function (number, character) {
        if (number < 10) {
            if (character) {
                number = character + number;
            } else {
                number = "0" + number;
            }
        }
        return number;
    };

    /**
     * Tính chiều dai string nếu dài quá thì đổi thành ....
     * @param str
     * @param width
     * @param size
     * @param character
     * @returns {*}
     */
    bb.utility.formatWidth = function (str, width, size, character) {
        if (str == null)
            return str;
        if (character == null) {
            character = "...";
        }
        var sliceIndex = parseInt(width / size);
        var lastIndex = str.length;
        if (lastIndex > sliceIndex) {
            str = str.slice(0, sliceIndex);
            str += character;
        }
        return str;
    };

    bb.utility.getCurrentPercentY = function (scrollView) {
        var maxH = scrollView.getInnerContainer().height - scrollView.height;
        if (maxH > 0) {
            var y = scrollView.getInnerContainer().y;
            return ((y + maxH) * 100) / maxH;
        }
        return 0;
    };
    bb.utility.getLanguageCode = function () {
        var lanCode = "en";
        if (cc.sys.os === cc.sys.OS_ANDROID) {
            lanCode = jsb.reflection.callStaticMethod("org/cocos2dx/javascript/AppActivity", "getLanguageCode", "()Ljava/lang/String;");
        } else if (cc.sys.os === cc.sys.OS_IOS) {
            lanCode = jsb.reflection.callStaticMethod("AppController", "getLanguageCode");
        }
        return lanCode;
    };

    bb.utility.randomInt = function (min, max, randObj) {
        if (!min && !max) {
            return 0;
        }
        if (min === max) {
            return min;
        }
        if (max === undefined) {
            if (min != undefined) {
                max = min;
                min = 0;
            } else {
                max = 1;
                min = 0;
            }
        }
        var rand = (randObj != undefined) ? randObj.getRandNumber() : Math.random();
        return min + (Math.round(rand * 1000000) % (max - min));
    };

    bb.utility.randomElement = function (arr, randObj) {
        if (arr.length <= 1) {
            return arr[0];
        }
        var rand = (randObj != undefined) ? randObj.getRandNumber() : Math.random();
        return arr[(Math.round(rand * 100000)) % arr.length];
    };

    bb.utility.cloneJSON = function (json) {
        return JSON.parse(JSON.stringify(json));
    };

    bb.utility.setStringForWidget = function (widget, str, fontType, fontSize) {
        var lbl = widget.getChildByName("__lbl_font__");
        if (!lbl) {
            lbl = bb.framework.getGUIFactory().createText(str, fontType, fontSize);
            lbl.setName("__lbl_font__");
            widget.addChild(lbl)
        }
        lbl.setString(str);
        if (widget._maxLblWidth != undefined) {
            if (lbl.width > widget._maxLblWidth) {
                widget.width = lbl.width + (widget.width - widget._maxLblWidth);
                widget.setScale9Enabled(true);
            }
        }
        lbl.x = widget.width * 0.5;
        lbl.y = widget.height * 0.65;
        widget.setCascadeOpacityEnabled(true);
        return lbl;
    };

    bb.utility.hitTest = function (point, widget) {
        var bb = cc.rect(0, 0, widget.width, widget.height);
        return cc.rectContainsPoint(bb, widget.convertToNodeSpace(point));
    };

    bb.utility.loadSpine = function (url, cb, scale) {
        scale = scale || 1 / 0;
        if (!cc.sys.isNative) {
            cc.loader.load([url + ".json",
                url + ".atlas",
                url + ".png"], function () {
            }, function () {
                cb && cb(sp.SkeletonAnimation.createWithJsonFile(url + ".json", url + ".atlas", scale));
            });
        } else {
            cb && cb(sp.SkeletonAnimation.createWithJsonFile(url + ".json", url + ".atlas", scale));
        }
    };

    bb.utility.scrollTo = function (scrollView, yOrX, time, isHorizontal) {
        var list = scrollView;
        var innerContainer = list.getInnerContainer();
        if (!isHorizontal) {
            var contentHeight = list.height;
            var innerY = -yOrX;
            var innerH = innerContainer.height;
            var dH = innerH - contentHeight;
            var yTo = Math.min(100, ((dH + innerY) / dH) * 100);
            (yTo < 0) && (yTo = 0);
            if (time) {
                list.scrollToPercentVertical(yTo, time, false);
            } else {
                list.jumpToPercentVertical(yTo);
            }
        } else {
            var contentWidth = list.width;
            var innerX = -yOrX;
            var innerW = innerContainer.width;
            var dw = innerW - contentWidth;
            if (contentWidth < innerW) {
                var xTo = Math.min(100, ((dw + innerX) / dw) * 100);
                xTo = 100 - xTo;
                (xTo < 0) && (xTo = 0);
                if (time) {
                    list.scrollToPercentHorizontal(xTo, time, false);
                } else {
                    list.jumpToPercentHorizontal(xTo);
                }
            }
        }
    };

    bb.utility.hashString = function (str) {
        var hash = 0;
        if (this.length == 0) {
            return hash;
        }
        var char = 0;
        for (var i = 0; i < this.length; i++) {
            char = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    };

    bb.utility.capitalizeString = function (str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    bb.utility.travelNode = function (node, func) {
        func(node);
        var childs = node.getChildren();
        if (childs.length > 0) {
            for (var i = 0; i < childs.length; i++) {
                bb.utility.travelNode(childs[i], func);
            }
        }
    };

    bb.utility.formatStringWithParams = function (text, strParams) {
        var newString = text;
        if (strParams && strParams.length > 0) {
            //return cc.formatStr(text,...strParams);
            var paramLen = strParams.length;
            switch (paramLen) {
                case 1 :
                    newString = cc.formatStr(text, mc.dictionary.getI18nMsg(strParams[0]));
                    break;
                case 2 :
                    newString = cc.formatStr(text, mc.dictionary.getI18nMsg(strParams[0]), mc.dictionary.getI18nMsg(strParams[1]));
                    break;
                case 3:
                    newString = cc.formatStr(text, mc.dictionary.getI18nMsg(strParams[0]), mc.dictionary.getI18nMsg(strParams[1]), mc.dictionary.getI18nMsg(strParams[2]));
                    break;
                case 4:
                    newString = cc.formatStr(text, mc.dictionary.getI18nMsg(strParams[0]), mc.dictionary.getI18nMsg(strParams[1]), mc.dictionary.getI18nMsg(strParams[2]), mc.dictionary.getI18nMsg(strParams[3]));
                    break;
                case 5:
                    newString = cc.formatStr(text, mc.dictionary.getI18nMsg(strParams[0]), mc.dictionary.getI18nMsg(strParams[1]), mc.dictionary.getI18nMsg(strParams[2]), mc.dictionary.getI18nMsg(strParams[3]), mc.dictionary.getI18nMsg(strParams[4]));
                    break;
            }
        }
        return newString;

    };

    var programCache = {};
    var _createShaderProgram = function (vertexSource, fragmentSource) {
        var program = new cc.GLProgram();
        program.initWithString(vertexSource, fragmentSource);
        if (cc.sys.isNative) {
            program.link();
            program.updateUniforms();
        } else {
            program.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
            program.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
            program.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
            program.link();
            program.updateUniforms();
            program.use();
        }

        return program;
    };
    var normalVS = [
        "attribute vec4 a_position;",
        "attribute vec2 a_texCoord;",
        "attribute vec4 a_color;",
        "varying vec4 v_fragmentColor;",
        "varying vec2 v_texCoord;",
        "void main()",
        "{",
        "   gl_Position = CC_PMatrix * a_position;",
        "   v_fragmentColor = a_color;",
        "   v_texCoord = a_texCoord;",
        "}"
    ].join('\n');
    var normalViewPortVS = [
        "attribute vec4 a_position;",
        "attribute vec2 a_texCoord;",
        "attribute vec4 a_color;",
        "varying vec4 v_fragmentColor;",
        "varying vec2 v_texCoord;",
        "void main()",
        "{",
        "   gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;",
        "   v_fragmentColor = a_color;",
        "   v_texCoord = a_texCoord;",
        "}"
    ].join('\n');
    bb.utility.getOverlayShaderProgram = function () {
        var program = programCache["_program_overlay_"];
        if (!program) {
            var overlayFS = [
                "varying vec4 v_fragmentColor;",
                "varying vec2 v_texCoord;",
                "void main()",
                "{",
                "    vec4 base = texture2D(CC_Texture0, v_texCoord);",
                "    vec3 br = clamp(sign(base.rgb - vec3(0.5)), vec3(0.0), vec3(1.0));",
                "    vec3 multiply = 2.0 * base.rgb * v_fragmentColor.rgb;",
                "    vec3 screen = vec3(1.0) - 2.0 * (vec3(1.0) - base.rgb)*(vec3(1.0) - v_fragmentColor.rgb);",
                "    vec3 overlay = mix(multiply, screen, br);",
                "    vec3 finalColor = mix(base.rgb, overlay, base.a);",
                "    gl_FragColor = vec4(finalColor, base.a)*v_fragmentColor.a;",
                "}",
            ].join('\n');
            program = _createShaderProgram(normalVS, overlayFS);
            programCache["_program_overlay_"] = program;
        }
        return program;
    };
    bb.utility.getGrayShaderProgram = function (isViewPort) {
        var program = programCache["_program_gray_"];
        if (!program) {
            var grayFS = [
                "precision lowp float;",
                "varying vec4 v_fragmentColor;",
                "varying vec2 v_texCoord;",
                "void main(void)",
                "{",
                "     vec4 color = texture2D(CC_Texture0, v_texCoord);",
                "     float gray = (color.r + color.g + color.b)/3.75;",
                "     gl_FragColor = vec4(vec3(gray)*v_fragmentColor.rgb,v_fragmentColor.a*color.a);",
                "}"
            ].join('\n');
            program = _createShaderProgram(isViewPort ? normalViewPortVS : normalVS, grayFS);
            programCache["_program_gray_"] = program;
        }
        return program;
    };
    bb.utility.getOutlineShaderProgram = function (color, isViewPort) {
        color = color || cc.color(0, 255, 0);
        var program = programCache["_program_outline_"];
        if (!program) {
            var outlineFS = [
                "varying vec2 v_texCoord;",
                "varying vec4 v_fragmentColor;",

                "uniform vec3 u_outlineColor;",
                "uniform float u_threshold;",
                "uniform float u_radius;",

                "void main()",
                "{",
                "float radius = u_radius;",
                "vec4 accum = vec4(0.0);",
                "vec4 normal = vec4(0.0);",

                "normal = texture2D(CC_Texture0, vec2(v_texCoord.x, v_texCoord.y));",

                "accum += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y - radius));",
                "accum += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y - radius));",
                "accum += texture2D(CC_Texture0, vec2(v_texCoord.x + radius, v_texCoord.y + radius));",
                "accum += texture2D(CC_Texture0, vec2(v_texCoord.x - radius, v_texCoord.y + radius));",

                "accum *= u_threshold;",
                "accum.rgb = u_outlineColor * accum.a;",

                "normal = ( accum * (1.0 - normal.a)) + (normal * normal.a);",

                "gl_FragColor = v_fragmentColor * normal;",
                "}"
            ].join('\n');
            program = _createShaderProgram(isViewPort ? normalViewPortVS : normalVS, outlineFS);
            programCache["_program_outline_"] = program;
        }
        if (cc.sys.isNative) {
            var glProgram_state = cc.GLProgramState.getOrCreateWithGLProgram(program);
            glProgram_state.setUniformFloat("u_radius", 0.001);
            glProgram_state.setUniformFloat("u_threshold", 0.75);
            glProgram_state.setUniformVec3("u_outlineColor", {x: color.r / 255, y: color.g / 255, z: color.b / 255});
            return glProgram_state;
        }
        program.setUniformLocationWith1f('u_radius', 0.001);
        program.setUniformLocationWith1f('u_threshold', 0.75);
        program.setUniformLocationWith3f('u_outlineColor', color.r / 255, color.g / 255, color.b / 255);
        return program;
    };
    bb.utility.getDefaultShaderProgram = function (isViewPort) {
        var program = programCache["_program_default_"];
        if (!program) {
            var normalFS = [
                "precision lowp float;",
                "varying vec4 v_fragmentColor;",
                "varying vec2 v_texCoord;",
                "void main()",
                "{",
                "    gl_FragColor = v_fragmentColor * texture2D(CC_Texture0, v_texCoord);",
                "}"
            ].join('\n');
            program = _createShaderProgram(isViewPort ? normalViewPortVS : normalVS, normalFS);
            programCache["_program_default_"] = program;
        }
        return program;
    };

}());