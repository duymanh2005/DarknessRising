/**
 * Created by long.nguyen on 9/12/2017.
 */
mc.BattleEnvinronment = cc.Class.extend({
    _brkUrl: null,

    ctor: function (brkURL) {
        this._brkUrl = brkURL;
    },

    getBrkURL: function () {
        return this._brkUrl;
    }

});