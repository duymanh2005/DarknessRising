/**
 * Created by long.nguyen on 10/23/2017.
 */
mc.IllusionInBattle = mc.StageInBattle.extend({

    setBattleData: function (json) {
        this._super(json);
        this.setBackgroundURL(bb.utility.randomElement([
            res.illusion_battle_bg
        ]));
    },

    isUsedItem: function () {
        return false;
    },

    getBackgroundMusic: function () {
        return res.sound_bgm_battle_pvp;
    },


    createBattleFieldRefactor: function (randomSeed) {
        return mc.GameLogicFactory.createBattleForStage(this,mc.TeamFormationManager.TEAM_ILLUSION, true);
    },

    createBattleViewRefactor: function () {
        return mc.GameLogicFactory.createBattleForStage(this,mc.TeamFormationManager.TEAM_ILLUSION);
    }

});