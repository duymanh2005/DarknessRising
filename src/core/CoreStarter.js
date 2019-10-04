/**
 * Created by longnguyen on 4/6/2016.
 */
var bobo = bobo || {};
bobo.utility = {};
bobo.utility.widget = {};
bobo.utility.format = {};
bobo.language = {};
bobo._tagMap = {};
bobo.enableTag = function (tags) {
    for (var i = 0; i < tags.length; i++) {
        bobo._tagMap[tags[i]] = true;
    }
};
bobo.log = function (tag, obj) {
    if (bobo._tagMap[tag] != undefined) {
        cc.error(obj);
    }
};
bobo.postHTTP = function (url, param, callback) {
    var xhr = cc.loader.getXMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var args = "";
    for (var key in param) {
        args += (key + "=" + param[key]);
        args += "&";
    }
    args = args.slice(0, -1);
    xhr.send(args);
    xhr.onreadystatechange = function () {
        cc.log("xhr.onreadystatechange: " + xhr.readyState + ", " + xhr.status);
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            var httpStatus = xhr.statusText;
            var response = xhr.responseText;
            callback && callback(httpStatus, response);
        }
    }
};
bobo.getHTTP = function (url, param, callback) {
    var xhr = cc.loader.getXMLHttpRequest();
    var args = "";
    for (var key in param) {
        args += (key + "=" + param[key]);
        args += "&";
    }
    args = args.slice(0, -1);
    xhr.open("GET", url + args, true);
    xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            var httpStatus = xhr.statusText;
            var response = xhr.responseText;
            callback && callback(httpStatus, response);
        } else {
            var httpStatus = xhr.statusText;
            callback && callback(httpStatus, null);
        }
    }
};

bobo.loadRemoteImage = function (view, url) {
    cc.textureCache.addImageAsync(url, function (texture) {
        var spr = null;
        if (view.getVirtualRenderer) {
            spr = view.getVirtualRenderer();
        } else {
            spr = view;
        }
        spr.setTexture(texture);
        spr.setTextureRect(cc.rect(0, 0, texture.width, texture.height));
    });
}

bobo.formatMoney = function (num) {
    return ("" + num).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

bobo.writeObject = function (key, obj) {
    cc.sys.localStorage.setItem(key, JSON.stringify(obj));
};

bobo.readObject = function (key) {
    var str = cc.sys.localStorage.getItem(key);
    if (str) {
        return JSON.parse(str);
    }
    return null;
};
bobo.cleanObject = function (key) {
    cc.sys.localStorage.removeItem(key);
};

(function () {
    bobo.msTime = function () {
        return Date.now();
    };
}());

(function (utility) {
    /**
     * Extend OOP helper function.
     * @param {ccui.Widget} child
     * @param {ccui.Widget} parent
     */
    var extendClass = function (child, parent) {
        var copyParent = Object.create(parent.prototype); // get all property of parent.
        copyParent.constructor = child; // assign the right constructor for child.
        child.prototype = copyParent; // now, the child has all parent's property.
    };

    var initArrWithJSONArr = function (objSample, arrJson) {
        var arrObj = [];
        for (var i = 0; i < arrJson.length; i++) {
            arrObj.push(objSample.getSample().initWithJSon(arrJson[i]));
        }
        return arrObj;
    };

    utility.extendClass = extendClass;
    utility.initArrWithJSONArr = initArrWithJSONArr;
}(bobo.utility));

(function (widgetUtility) {

    var _setWidgetText = function (widget, text, font) {
        if (widget && widget.getDescription) {
            if (widget.setString != undefined) {
                //var lbl = new ccui.TextBMFont(text,font||res.font_roboto_24_light_fnt);
                //lbl.setName(widget.getName());
                //lbl.x = widget.x;
                //lbl.y = widget.y;
                //lbl.anchorX = widget.anchorX;
                //lbl.anchorY = widget.anchorY;
                //var parent = widget.getParent();
                //parent.addChild(lbl);
                //widget.removeFromParent();
                widget.setString(text);
                return widget;
            }
        }
        return null;
    };
    var setWidgetText = function (widget, text, font) {
        var lbl = _setWidgetText(widget, text, font);
        if (!lbl) {
            var childs = widget.getChildren();
            for (var i = 0; i < childs.length; i++) {
                lbl = _setWidgetText(childs[i], text, font);
                if (lbl) {
                    break;
                }
            }
        }
        return lbl;
    };
    /*
    * Get the children's node map name.
    * @param {ccui.Widget} parentNode
    * @param {Array} arrName
    * */
    var getChildMapper = function (parentNode, arrName) {
        var mapper = {};
        var mapName = null;
        if (arrName != null && arrName.length > 0) {
            mapName = {};
            for (var i = 0; i < arrName.length; i++) {
                if (arrName[i] != null) {
                    mapName[arrName[i]] = 1;
                }
            }
        }
        var childs = parentNode.getChildren();
        for (var i = 0; i < childs.length; i++) {
            var name = childs[i].getName();
            if (mapper[name] == undefined) {
                if (!mapName) {
                    mapper[name] = childs[i];
                } else {
                    mapName[name] && (mapper[name] = childs[i]);
                }
            }
        }
        return mapper;
    };

    widgetUtility.setWidgetText = setWidgetText;
    widgetUtility.getChildMapper = getChildMapper;
}(bobo.utility.widget));

(function (formalUtility) {

}(bobo.utility.format));

bobo.start = function () {
}.bind(bobo);
bobo.start();