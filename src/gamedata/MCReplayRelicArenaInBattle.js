/**
 * Created by long.nguyen on 6/5/2018.
 */
mc.ReplayRelicArenaInBattle = mc.AbstractInBattle.extend({

    setBattleData: function (json) {
        this._super(json);
        this.setBackgroundURL(bb.utility.randomElement([
            res.brk_arena1_png
        ]));
        this.setPreSetSeed(json["script"]["seed"]);
        this.setPlayerTeamSide(json["isAttacker"] ? mc.const.TEAM_RIGHT : mc.const.TEAM_LEFT);
    },

    isAutoCombatMode: function () {
        return true;
    }

});