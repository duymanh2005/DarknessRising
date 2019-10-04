/**
 * Created by long.nguyen on 1/9/2019.
 */
mc.BloodCastleManager = bb.Class.extend({

    setBloodCastleData:function(data){
        this._bloodData = data["bc"];
        this.cleanAllStatusCreature();
        this._bloodData["properties"] && this.updateAllStatusCreature(this._bloodData["properties"]);
    },

    getNumberOfChance:function(){
        return this._bloodData ? this._bloodData["chance"] : 0;
    },

    setNumberOfChance:function(numberOfChance){
        this._bloodData && (this._bloodData["chance"] = numberOfChance);
    },

    // Begin Status Creature Manager Interface
    cleanAllStatusCreature: function () {
        this._mapStatusCreatureById = {};
    },

    updateAllStatusCreature: function (arrProperties) {
        this._mapStatusCreatureById = this._mapStatusCreatureById || {};
        if (arrProperties) {
            for (var i = 0; i < arrProperties.length; i++) {
                this._mapStatusCreatureById[arrProperties[i].heroId] = arrProperties[i];
            }
        }
    },

    getStatusCreatureById: function (heroId, heroIndex) {
        var status = null;
        if (this._mapStatusCreatureById) {
            status = this._mapStatusCreatureById[heroId];
        }
        if (!status) {
            status = {
                id: heroId,
                index: heroIndex,
                level: 1,
                hpPercent: 1 * mc.CreatureInfo.CAST_LONG_RATE,
                mpPercent: 0
            };
        }
        var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
        if (heroInfo && status) {
            status.level = mc.HeroStock.getHeroLevel(heroInfo);
            status.index = heroIndex || mc.HeroStock.getHeroIndex(heroInfo);
        }
        !status.mpPercent && (status.mpPercent = 0);
        return status;
    }
    // End Status Creature Manager Interface

});