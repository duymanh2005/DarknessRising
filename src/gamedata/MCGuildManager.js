/**
 * Created by long.nguyen on 11/2/2018.
 */
var GUILD_REFRESH_INTERVAL = 10000;

var BANG_CHU = "bang_chu";
var PHO_BANG = "bang_pho";
var TRUONG_LAO = "truong_lao";
var TINH_ANH = "tinh_anh";


var GuildRoleMap = {};
GuildRoleMap[BANG_CHU] = {pre: PHO_BANG, next: null, point: 1};
GuildRoleMap[PHO_BANG] = {pre: TRUONG_LAO, next: BANG_CHU, point: 2};
GuildRoleMap[TRUONG_LAO] = {pre: TINH_ANH, next: PHO_BANG, point: 3};
GuildRoleMap[TINH_ANH] = {pre: null, next: TRUONG_LAO, point: 4};

var rolePoint = function (role) {
    var guildRoleMapElement = GuildRoleMap[role];
    return guildRoleMapElement ? guildRoleMapElement["point"] : 100;
};

mc.GuildManager = bb.Class.extend({
    guildInfo: null,
    myInfo: null,
    members: null,
    logs: null,
    requests: null,
    requestsMarkTime: null,
    membersMarkTime: null,
    maxPage: null,
    acceptJoin: false,
    requestedJoin: null,
    requestedJoinTime: null,

    setGuildInfo: function (info) {
        this.guildInfo = info;
    }

    ,

    receiveAcceptJoin: function () {
        this.acceptJoin = true;
    }
    ,
    isAcceptJoin: function () {
        return !this.guildInfo && this.acceptJoin;
    }
    ,

    setMyGuildInfo: function (info) {
        if (this.myInfo) {
            for (var i in info) {
                this.myInfo[i] = info[i];
            }
        } else {
            this.myInfo = info;
        }
    }
    ,

    applyPromote: function (json) {
        var isPromote = json["isPromote"];
        var memberId = json["memberId"];
        var nextRole = null;
        for (var i in this.members) {
            var member = this.members[i];
            if (member["gameHeroId"] === memberId) {
                var currRole = member["role"];
                var roleData = GuildRoleMap[currRole];
                if (roleData) {
                    if (isPromote && roleData["next"]) {
                        nextRole = member["role"] = roleData["next"];
                    } else if (!isPromote && roleData["pre"]) {
                        nextRole = member["role"] = roleData["pre"];
                    }
                }
            }
        }
        if (this.myInfo && this.myInfo["gameHeroId"] === memberId && nextRole) {
            this.myInfo["role"] = nextRole;
        }
    }
    ,

    applySendLeader: function (json) {
        var memberId = json["memberId"];
        var leader;
        var newLeader;
        for (var i in this.members) {
            var member = this.members[i];
            if (member["gameHeroId"] === memberId) {
                newLeader = member;
            } else if (member["role"] === BANG_CHU) {
                leader = member;
            }
        }
        if (this.myInfo) {
            if (this.myInfo["gameHeroId"] === leader["gameHeroId"]) {
                this.myInfo["role"] = PHO_BANG;
            }
            if (this.myInfo["gameHeroId"] === newLeader["gameHeroId"]) {
                this.myInfo["role"] = BANG_CHU;
            }
        }
        if (leader && newLeader) {
            leader["role"] = PHO_BANG;
            newLeader["role"] = BANG_CHU;
        }
    }
    ,


    getGuildDonateAsset: function (itemIndex) {
        if (this.guildInfo) {
            var donateMap = this.guildInfo["donateMap"];
            if (donateMap[itemIndex] === undefined) {
                donateMap[itemIndex] = 0;
            }
            return donateMap[itemIndex];
        }
        return 0;
    }
    ,
    getMyDonateTime: function (itemIndex) {
        if (this.myInfo) {
            var donateTimes = this.myInfo["donateTimes"];
            if (donateTimes[itemIndex] === undefined) {
                donateTimes[itemIndex] = 0;
            }
            return donateTimes[itemIndex];
        }
        return 0;
    }
    ,

    incMyDonateTime: function (itemIndex) {
        if (this.myInfo) {
            var donateTimes = this.myInfo["donateTimes"];
            if (donateTimes[itemIndex] === undefined) {
                donateTimes[itemIndex] = 0;
            }
            donateTimes[itemIndex]++;
        }
    }
    ,


    getGuildInfo: function () {
        return this.guildInfo;
    }
    ,

    getMyInfo: function () {
        return this.myInfo;
    }
    ,

    getGuildId: function () {
        if (this.guildInfo) {
            return this.guildInfo["id"];
        }
        return null;
    }
    ,
    getLevel: function () {
        if (this.guildInfo) {
            return this.guildInfo["level"];
        }
    }
    ,
    getLogo: function () {
        if (this.guildInfo) {
            return this.guildInfo["logo"];
        }
    }
    ,
    getFlag: function () {
        if (this.guildInfo) {
            return this.guildInfo["flag"];
        }
    }
    ,
    getMaxMemberNo: function () {
        if (this.guildInfo) {
            return this.guildInfo["maxMemberNo"];
        }
    }
    ,
    getMemberNo: function () {
        if (this.guildInfo) {
            return this.guildInfo["memberNo"];
        }
    }
    ,
    getName: function () {
        if (this.guildInfo) {
            return this.guildInfo["name"];
        }
    }
    ,
    getDesc: function () {
        if (this.guildInfo) {
            return this.guildInfo["notice"];
        }
    }
    ,
    getReqDesc: function () {
        if (this.guildInfo) {
            return this.guildInfo["reqDesc"];
        }
    }
    ,
    getReqType: function () {
        if (this.guildInfo) {
            return this.guildInfo["reqType"];
        }
    }
    ,
    getReqValue: function () {
        if (this.guildInfo) {
            return this.guildInfo["reqValue"];
        }
    }
    ,

    getRequestItemMap: function () {
        if (this.guildInfo) {
            return this.guildInfo["requestItemMap"];
        }
    }
    ,

    getRequireLevelCreate: function () {
        return mc.dictionary.guildData["createGuildRequirement"]["level"];
    }
    ,

    getDonates: function () {
        return mc.dictionary.guildData["donateInfoList"];
    }
    ,

    getRequireAssetCreate: function () {
        return mc.dictionary.guildData["createGuildRequirement"]["createFee"];
    }
    ,

    getGuildLevel: function (level) {
        if (!this.guildLevels && this.guildInfo) {
            this.guildLevels = bb.utility.arrayToMap(mc.dictionary.guildData["guildLevelList"], function (levelData) {
                return levelData["level"];
            })
        }
        return this.guildLevels[level];
    }
    ,

    getAssetRequireForNextLevel: function () {
        if (this.guildInfo) {
            var guildLevel = this.guildInfo["level"]
        }
    }
    ,

    updateMembers: function (members, guildId, maxPage) {
        this.members = members;
        this.membersMarkTime = bb.now();

        if (this.myInfo) {
            for (var i in this.members) {
                var member = this.members[i];
                if (member["gameHeroId"] === this.myInfo["gameHeroId"]) {
                    this.myInfo["role"] = member["role"];
                }
            }
        }
    }
    ,

    getMembers: function () {
        if (bb.now() - this.membersMarkTime > GUILD_REFRESH_INTERVAL) {
            return null;
        }
        return this.members;
    }
    ,
    updateLogs: function (logs) {
        this.logs = logs;
        this.logsMarkTime = bb.now();
    }
    ,

    getLogs: function () {
        if (bb.now() - this.logsMarkTime > GUILD_REFRESH_INTERVAL) {
            return null;
        }
        return this.logs;
    }
    ,

    updateRequests: function (requests, guildId, maxPage) {
        this.requests = requests;
        this.requestsMarkTime = bb.now();
    }
    ,

    updateRequestedJoinGuild: function (requests) {
        this.requestedJoin = requests;
        this.requestedJoinTime = bb.now();
    }
    ,

    getRequestedJoinGuild: function () {
        return this.requestedJoin;
    },

    removeMember: function (memberId) {
        this.kickOutMember = memberId;
        if (this.kickOutMember === mc.GameData.playerInfo.getId()) {
            this.setGuildInfo(null);
            this.setMyGuildInfo(null);
            this.resetData();
            return;
        }
        if (this.members) {
            for (var i in this.members) {
                if (this.members[i]["gameHeroId"] === memberId) {
                    this.members.splice(i, 1);
                }
            }
        }
    }
    ,

    getRequests: function () {
        if (bb.now() - this.requestsMarkTime > GUILD_REFRESH_INTERVAL) {
            return null;
        }
        return this.requests;
    }
    ,

    removeRequest: function () {
        this.requestsMarkTime = 0;
    }
    ,

    needUpdateMembers: function () {
        this.membersMarkTime = 0;
    }
    ,

    resetData: function () {
        this.members = null;
        this.requests = null;
        this.guildInfo = null;
        this.acceptJoin = false;
    }


})
;
