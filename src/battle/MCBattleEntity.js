/**
 * Created by long.nguyen on 4/10/2017.
 */
mc.BattleEntity = cc.Class.extend({
    entityId: null,
    playerOwnerId: null,
    battleId: null,
    colBattleCell: 0,
    rowBattleCell: 0,
    indexFormationPosition: 0,

    setBattleCellPosition: function (colCel, rowCel) {
        this.colBattleCell = colCel;
        this.rowBattleCell = rowCel;
    },

    setIndexFormatPosition: function (index) {
        this.indexFormationPosition = index;
    },

    isStandingFront: function () {
        return this.indexFormationPosition === 0 ||
            this.indexFormationPosition === 1;
    },

    isStandingBack: function () {
        return this.indexFormationPosition === 2 ||
            this.indexFormationPosition === 3 ||
            this.indexFormationPosition === 4;
    }

});