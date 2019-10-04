/**
 * Created by long.nguyen on 5/25/2017.
 */
(function (bb) {

    var _KEY_GLUE_NAME = "GLUE_OBJECT_";
    var _generateID = 0;

    bb.Class = cc.Class.extend({
        _isPauseNotify_: false,

        ctor: function (json) {
            this.__glueName__ = _KEY_GLUE_NAME + "_" + (_generateID++);
            json && this.copyAttr(json);
        },

        getGlueName: function () {
            if (!this.__glueName__) {
                cc.log("DO NOT SUPER bb.Class");
            }
            return this.__glueName__;
        },

        setPauseNotify: function (isPause) {
            this._isPauseNotify_ = isPause;
        },

        notifyDataChanged: function () {
            //var data = new cc.EventCustom(this.getGlueName());
            //data.setUserData(this);
            //cc.eventManager.dispatchEvent(data);
            !this._isPauseNotify_ && bb.director.notifyTrackingDataChanged(new bb.TrackEvent(this.getGlueName()).setUserData(this));
        },

        notifyDataChangedWithParameter: function (param) {
            //var data = new cc.EventCustom(this.getGlueName());
            //data.setUserData({
            //    data:this,
            //    param:param
            //});
            //cc.eventManager.dispatchEvent(data);
            !this._isPauseNotify_ && bb.director.notifyTrackingDataChanged(new bb.TrackEvent(this.getGlueName()).setUserData({
                data: this,
                param: param
            }));
        },

        copyAttr: function (json) {
            for (var key in json) {
                if (bb.Class.isValidKey(key)) {
                    this[key] = json[key];
                }
            }
            return this;
        },

        ignoreAttr: function (arrIgnoreAtrr) {
            for (var key in arrIgnoreAtrr) {
                var atrr = arrIgnoreAtrr[key];
                if (atrr) {
                    delete this[atrr];
                }
            }
            return this;
        },

        _copyAttrFromThisTo: function (target, keyInObj) {
            keyInObj = keyInObj || this;
            target = target || {};
            for (var key in keyInObj) {
                if (bb.Class.isValidKey(key)) {
                    target[key] = this[key];
                }
            }
            return target;
        },

        toJSONWithKeysFrom: function (obj) {
            return this._copyAttrFromThisTo({}, obj);
        },

        newObject: function () {
            return new bb.Class();
        },

        clone: function () {
            return this._copyAttrFromThisTo(this.newObject(), this);
        },

        copyGlueNameOf: function (bbObject) {
            if (bbObject) {
                this.__glueName__ = bbObject.getGlueName();
            }
            return this;
        }

    });
    bb.Class.isValidKey = function (key) {
        return key != "$C" && key != "__instanceId" && key != "__glueName__";
    };
    bb.TrackEvent = cc.Class.extend({
        _glueName: null,
        _userData: null,

        ctor: function (glueName) {
            this._glueName = glueName;
        },

        getGlueName: function () {
            return this._glueName;
        },

        setUserData: function (data) {
            this._userData = data;
            return this;
        },

        getUserData: function () {
            return this._userData;
        }
    });

}(bb));

