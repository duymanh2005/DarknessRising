/**
 * Created by longnguyen on 10/19/2016.
 */
var bb = bb || {};
bb.Framework = cc.Class.extend({
    _guiFactory: null,
    _config: null,
    _guiParserManager: null,

    setConfig: function (config) {
        this._config = config;
    },

    getConfig: function () {
        return this._config;
    },

    setGUIFactory: function (guiFactory) {
        this._guiFactory = guiFactory;
    },

    getGUIFactory: function () {
        return this._guiFactory;
    },

    getGUIParserManager: function () {
        if (!this._guiParserManager) {
            this._guiParserManager = this._guiFactory.createGUIParserManager();
        }
        return this._guiParserManager;
    },

    runNow: function () {
        if (cc.sys.isNative) {
            var searchPaths = jsb.fileUtils.getSearchPaths();
            searchPaths.push('script');
            searchPaths.push('src');
            searchPaths.push('res');
            jsb.fileUtils.setSearchPaths(searchPaths);
        }

        this._config = this._config || new bb.Config();
        // Pass true to enable retina display, on Android disabled by default to improve performance
        cc.view.enableRetina(cc.sys.os === cc.sys.OS_IOS ? true : false);
        // Adjust viewport meta
        cc.view.adjustViewPort(true);

        // Instead of set design resolution, you can also set the real pixel resolution size
        // Uncomment the following line and delete the previous line.
        // cc.view.setRealPixelResolution(960, 640, cc.ResolutionPolicy.SHOW_ALL);
        // Setup the resolution policy and design resolution size
        if (this._config.isHorizontalScreen()) {
            cc.view.setDesignResolutionSize(1334, 750, cc.ResolutionPolicy.FIXED_WIDTH);
            !cc.sys.isNative && cc.view.setDesignResolutionSize(1334, 750, cc.ResolutionPolicy.SHOW_ALL);
        } else {
            cc.view.setDesignResolutionSize(750, 1334, cc.ResolutionPolicy.FIXED_WIDTH);
            !cc.sys.isNative && cc.view.setDesignResolutionSize(750, 1334, cc.ResolutionPolicy.SHOW_ALL);
        }

        var ratio = cc.winSize.width / cc.winSize.height;
        if (ratio >= 0.57) {
            cc.view.setDesignResolutionSize(750, 1334, cc.ResolutionPolicy.SHOW_ALL);
        }

        // The game will be resized when browser size change
        cc.view.resizeWithBrowserSize(true);

        var splashLayer = new bb.DefaultSplashLayer(function () {
            cc.log("Show login screen");
            var loginScreen = new mc.LoginScreen();
            var _showScene = function () {
                const newScene = new cc.Scene();
                newScene.addChild(loginScreen);
                loginScreen.initResources();
                var transitionScene = bb.framework.getGUIFactory().createTransitionScene(newScene);
                cc.director.runScene(transitionScene ? transitionScene : newScene);
            };

            if (cc.sys.isNative) {
                cc.log("Show Native login screen");
                _showScene();
            } else {
                cc.loader.load(loginScreen.getPreLoadURL(), function () {
                }, function () {
                    _showScene();
                })
            }
        });
        var plashScene = new cc.Scene();
        plashScene.addChild(splashLayer);
        cc.director.runScene(plashScene);
    },

    getTrueOpacity: function (opacity) {
        if (cc.sys.isNative) {
            return opacity;
        }
        return opacity + 50;
    },

    isAndroid: function () {
        return cc.sys.os === cc.sys.OS_ANDROID;
    },

    isIos: function () {
        return cc.sys.os === cc.sys.OS_IOS;
    },

    addSpriteFrames: function (url) {
        cc.spriteFrameCache.addSpriteFrames(url);
    }

});
bb.DELTA_TIME = 0;
bb.CALCULATE_DELTA_TIME = function (time) {
    bb.DELTA_TIME = time - Date.now();
};
bb.now = function () {
    return Date.now() + bb.DELTA_TIME;
};
bb.base64Object = function () {
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", encode: function (e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = Base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = (n & 3) << 4 | r >> 4;
                u = (r & 15) << 2 | i >> 6;
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64
                } else if (isNaN(i)) {
                    a = 64
                }
                t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a)
            }
            return t
        }, decode: function (e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9+/=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r)
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i)
                }
            }
            t = Base64._utf8_decode(t);
            return t
        }, _utf8_encode: function (e) {
            e = e.replace(/rn/g, "n");
            var t = "";
            for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r)
                } else if (r > 127 && r < 2048) {
                    t += String.fromCharCode(r >> 6 | 192);
                    t += String.fromCharCode(r & 63 | 128)
                } else {
                    t += String.fromCharCode(r >> 12 | 224);
                    t += String.fromCharCode(r >> 6 & 63 | 128);
                    t += String.fromCharCode(r & 63 | 128)
                }
            }
            return t
        }, _utf8_decode: function (e) {
            var t = "";
            var n = 0;
            var r = c1 = c2 = 0;
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                    n += 2
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    n += 3
                }
            }
            return t
        }
    }
    return Base64;
};
bb.framework = new bb.Framework();
bb.framework.const = {
    EVENT_CLICK: "__event__click__",
    FONT_SMALL: 0,
    FONT_MEDIUM: 1,
    FONT_LARGE: 2,
    FONT_SUPER_LARGE: 3
};
