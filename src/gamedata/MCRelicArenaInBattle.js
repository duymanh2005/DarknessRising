/**
 * Created by long.nguyen on 11/7/2017.
 */
mc.RelicArenaInBattle = mc.AbstractInBattle.extend({
    setBattleData: function (json) {
        this._super(json);
        this.setBackgroundURL(bb.utility.randomElement([
            res.brk_arena1_png
        ]));
        this.setPreSetSeed(json["seed"]);
        this.setPlayerTeamSide(json["playerSide"]);
        this._data = json;
    },
    getData: function () {
        return this._data;
    },

    isAutoCombatMode: function () {
        return true;
    },

    isFixSpeedX2: function () {
        return true;
    },

    isUsedItem: function () {
        return false;
    },

    getBackgroundMusic: function () {
        return res.sound_bgm_battle_pvp;
    },

    buildScriptString: function (battleField) {
        return JSON.stringify({
            seed: battleField.getRandomGenerator().getSeed(),
            battleVersion: mc.const.BATTLE_VERSION
        });
    }

});