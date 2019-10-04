/**
 * Created by long.nguyen on 10/24/2017.
 */
mc.Exception = bb.Class.extend({

    setExceptionData: function (data) {
        this._exceptionData = data;
    },

    getExceptionData: function () {
        return this._exceptionData;
    }

});