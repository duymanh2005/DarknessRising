/**
 * Created by long.nguyen on 12/11/2017.
 */
mc.GUIController = bb.Class.extend({
    lvlUp: null,

    ctor: function () {
        this._super();
        this.lvlUp = {};
    },

    isFullLvlUpExp: function () {
        var heroId = this.lvlUp.heroId;
        var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
        return
    }

});