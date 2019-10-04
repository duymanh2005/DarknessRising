/**
 * Created by long.nguyen on 9/22/2018.
 */
mc.RatingManager = bb.Class.extend({
    _ratingData: null,

    setRatingData: function (data) {
        this._ratingData = data;
        if (!this._ratingData) {
            this._ratingData = {
                msSleep: -1,
                noShowAgain: false
            }
        }
    },

    getRatingData: function () {
        return this._ratingData;
    },

    saveRatingChange: function (nothank, later) {
        var rating = this._ratingData;
        if (nothank) {
            rating.noShowAgain = true;
        }
        if (later) {
            rating.noShowAgain = false;
            rating.msSleep = bb.now();
        }
    },

    canShow: function () {
        var canShow = false;
        var rating = this._ratingData;
        var unlock = mc.GameData.canUnlockFunction(mc.const.FUNCTION_RATE);
        if (unlock && unlock.isUnlock && !rating.noShowAgain) {
            if (rating.msSleep <= 0 ||
                (((bb.now() - rating.msSleep) / 1000) >= mc.const.MAX_RATING_SLEEP_IN_SECOND && (mc.GameData.playerInfo.getPlayCampaignBattleTimeInLaugh() >= mc.const.MAX_PLAY_BATTLE_TIME_IN_LAUGH))) {
                canShow = true;
            }
        }
        return canShow;
    }

});