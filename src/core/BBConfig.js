/**
 * Created by longnguyen on 10/19/2016.
 */
bb.Config = cc.Class.extend({

    isSupportAssetManager: function () {
        return false;
    },

    isSupportCreantAccount: function () {
        return false;
    },

    getFontsDefinition: function () {
        return null;
    },

    isHorizontalScreen: function () {
        return false;
    }

});