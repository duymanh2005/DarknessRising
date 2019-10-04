/**
 * Created by long.nguyen on 10/23/2017.
 */
mc.ChaosCastleInBattle = mc.AbstractInBattle.extend({

    setBattleData: function (json) {
        this._super(json);
        this._chaosStageIndex = json["index"];
        this.setBackgroundURL(bb.utility.randomElement([
            res.brk_chaoscastle1_png,
            res.brk_chaoscastle2_png
        ]));
        var chaosCastleManager = mc.GameData.chaosCastleManager;
        var arrHeroInfo = this.getBattleTeamPlayerInfo().arrCreatureInfo;
        for (var i = 0; i < arrHeroInfo.length; i++) {
            var info = arrHeroInfo[i];
            var curr = chaosCastleManager.getStatusCreatureById(info.serverId, info.resourceId);
            if (curr) {
                info.setCurrentHpPercentByLong(curr.hpPercent);
                info.setCurrentMpPercentByLong(curr.mpPercent);
            }
        }
        var arrOppInfo = this.getBattleTeamOpponentInfo().arrCreatureInfo;
        for (var i = 0; i < arrOppInfo.length; i++) {
            var info = arrOppInfo[i];
            var curr = chaosCastleManager.getStatusCreatureById(info.serverId, info.resourceId);
            if (curr) {
                info.setCurrentHpPercentByLong(curr.hpPercent);
                info.setCurrentMpPercentByLong(curr.mpPercent);
            }
        }
    },

    isUsedItem: function () {
        return false;
    },

    isSupportX3: function () {
        return true;
    },

    getBackgroundMusic: function () {
        return res.sound_bgm_battle_pvp;
    },

    getChaosStageIndex: function () {
        return this._chaosStageIndex;
    }

});