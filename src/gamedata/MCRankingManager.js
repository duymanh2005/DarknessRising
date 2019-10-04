/**
 * Created by long.nguyen on 12/5/2017.
 */
mc.RankingManager = bb.Class.extend({});
mc.RankingManager.getRankerName = function (rankerInfo) {
    return rankerInfo.gameHeroName;
};
mc.RankingManager.getRankerAvatar = function (rankerInfo) {
    return rankerInfo.avatar;
};
mc.RankingManager.getRankerVIP = function (rankerInfo) {
    return rankerInfo.vip;
};
mc.RankingManager.getRankerLevel = function (rankerInfo) {
    return rankerInfo.accLevel;
};
mc.RankingManager.getRankerRank = function (rankerInfo) {
    return rankerInfo.rank;
};
mc.RankingManager.getRankerTeamPower = function (rankerInfo) {
    return rankerInfo.teamPower;
};
mc.RankingManager.getRankerWinNo = function (rankerInfo) {
    return rankerInfo.winNo;
};
mc.RankingManager.getRankerTrophy = function (rankerInfo) {
    return rankerInfo.arenaPoint;
};
mc.RankingManager.getRankerLeagueKey = function (rankerInfo) {
    return rankerInfo.league;
};
mc.RankingManager.getRankerId = function (rankerInfo) {
    return rankerInfo.gameHeroName;
};