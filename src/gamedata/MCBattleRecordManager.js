/**
 * Created by long.nguyen on 12/22/2017.
 */
mc.BattleRecordManager = bb.Class.extend({});
mc.BattleRecordManager.STATUS_UNREVENGE = 0;
mc.BattleRecordManager.STATUS_REVENGE = 1;
mc.BattleRecordManager.STATUS_REVENGED = 2;

mc.BattleRecordManager.isAttacker = function (recordInfo) {
    return recordInfo.isAttacker;
};
mc.BattleRecordManager.getRecordTakePoint = function (recordInfo) {
    return recordInfo.arenaPoint;
};
mc.BattleRecordManager.getRecordStartTimeInMs = function (recordInfo) {
    return recordInfo.battleTime;
};
mc.BattleRecordManager.getRecordStatus = function (recordInfo) {
    return recordInfo.revengeStatus;
};
mc.BattleRecordManager.isRecordWinBattle = function (recordInfo) {
    return recordInfo.isWin;
};
mc.BattleRecordManager.getRecordOpponent = function (recordInfo) {
    return JSON.parse(recordInfo.opponentInfo);
};
mc.BattleRecordManager.getRecordId = function (recordInfo) {
    return recordInfo.id;
};
mc.BattleRecordManager.canRecordReplay = function (recordInfo) {
    return recordInfo.replay;
};
mc.BattleRecordManager.getRecordOwnerId = function (recordInfo) {
    return recordInfo.gameHeroId;
};
mc.BattleRecordManager.getRecordOpponentId = function (recordOpponentInfo) {
    return recordOpponentInfo.gameHeroId;
};
mc.BattleRecordManager.getRecordOpponentName = function (recordOpponentInfo) {
    return recordOpponentInfo.gameHeroName;
};
mc.BattleRecordManager.getRecordOpponentLevel = function (recordOpponentInfo) {
    return recordOpponentInfo.level || 1;
};
mc.BattleRecordManager.getRecordOpponentPoint = function (recordOpponentInfo) {
    return recordOpponentInfo.arenaPoint;
};
mc.BattleRecordManager.getRecordOpponentPower = function (recordOpponentInfo) {
    return recordOpponentInfo.teamPower;
};
mc.BattleRecordManager.getRecordOpponentTeams = function (recordOpponentInfo) {
    return recordOpponentInfo.battleTeam;
};
mc.BattleRecordManager.getRecordOpponentLeaderIndex = function (recordOpponentInfo) {
    return recordOpponentInfo.leaderIndex;
};
mc.BattleRecordManager.getRecordOpponentHeroes = function (recordOpponentInfo) {
    return recordOpponentInfo.heroes;
};