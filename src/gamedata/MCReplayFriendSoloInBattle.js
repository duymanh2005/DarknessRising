/**
 * Created by long.nguyen on 6/5/2018.
 */
mc.ReplayFriendSoloInBattle = mc.AbstractInBattle.extend({

    setBattleData: function (json) {
        this._super(json);
        this.setBackgroundURL(bb.utility.randomElement([
            res.brk_arena1_png
        ]));
        var seed = this._randomSeed = json["script"]["seed"];
        this._teamSide = json["isAttacker"] ? mc.const.TEAM_RIGHT : mc.const.TEAM_LEFT;
    },

    getPlayerTeamSide: function () {
        return this._teamSide;
    },

    isAutoCombatMode: function () {
        return true;
    },

    createBattleViewRefactor: function () {
        return mc.GameLogicFactory.createBattleViewRefactorForAbstractBattle(this, new mc.BattleEnvinronment(this.getBackgroundURL()), this._randomSeed);
    }

});