/**
 * Created by long.nguyen on 10/23/2017.
 */
mc.FriendSoloInBattle = mc.AbstractInBattle.extend({
    setBattleData: function (json) {
        this._super(json);
        this.setBackgroundURL(bb.utility.randomElement([
            res.brk_arena1_png
        ]));
    },

    isAutoCombatMode: function () {
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