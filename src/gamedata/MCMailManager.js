/**
 * Created by long.nguyen on 12/22/2017.
 */
mc.MailManager = bb.Class.extend({
    _mapMailInfoById: null,

    ctor: function () {
        this._super();
        this._mapMailInfoById = {};
    },

    setNotifyCount: function (notifyCount) {
        this._notifyCount = notifyCount;
    },

    getNotifyCount: function () {
        return this._notifyCount;
    },

    setMailInfoById: function (mailId, mailInfo) {
        this._mapMailInfoById[mailId] = mailInfo;
    },

    doActionCodeById: function (mailId, actionCode) {
        if (this._mapMailInfoById[mailId]) {
            if (actionCode === mc.MailManager.ACTION_CLAIM) {
                this._mapMailInfoById[mailId]["claim"] = false;
                this._mapMailInfoById[mailId]["seen"] = true;
            } else if (actionCode === mc.MailManager.ACTION_REMOVE) {
                this._mapMailInfoById[mailId]["remove"] = true;
                this._mapMailInfoById[mailId]["seen"] = true;
            }
        }
    },

    getMailInfoById: function (mailId) {
        return this._mapMailInfoById[mailId];
    },

    setArrayMailInfo: function (arrMail) {
        this._mapMailInfoById = bb.utility.arrayToMap(arrMail, function (mailInfo) {
            return mc.MailManager.getMailId(mailInfo);
        });
    },

    getArrayMailInfo: function () {
        var arrMail = bb.utility.mapToArray(this._mapMailInfoById);
        arrMail.sort(function (mailInfo1, mailInfo2) {
            var val1 = mc.MailManager.isGiftMail(mailInfo1) ? 10 : 0;
            val1 += (!mc.MailManager.isMailClaimed(mailInfo1) ? 10 : 0);
            val1 += (!mc.MailManager.isMailSeen(mailInfo1) ? 30 : 0);
            var val2 = mc.MailManager.isGiftMail(mailInfo2) ? 10 : 0;
            val2 += (!mc.MailManager.isMailClaimed(mailInfo2) ? 10 : 0);
            val2 += (!mc.MailManager.isMailSeen(mailInfo2) ? 30 : 0);
            return val2 - val1;
        });
        return arrMail;
    }

});
mc.MailManager.isMailSeen = function (mailInfo) {
    return mailInfo.seen;
};
mc.MailManager.getMailTitle = function (mailInfo) {
    return mc.dictionary.getI18nMsg(mailInfo.title || "");
};
mc.MailManager.getMailDesc = function (mailInfo) {
    var str = mailInfo.shortContent || mailInfo.content;
    if (mailInfo.properties) {
        var arr = cc.copyArray(mailInfo.properties);
        cc.arrayAppendObjectsToIndex(arr, mc.dictionary.getI18nMsg(str), 0);
        return cc.formatStr.apply(null, arr);
    }
    return mc.dictionary.getI18nMsg(str);
};
mc.MailManager.isMailClaimed = function (mailInfo) {
    return !mailInfo["claim"];
};
mc.MailManager.isMailRemoved = function (mailInfo) {
    return mailInfo["remove"];
};
mc.MailManager.getMailId = function (mailInfo) {
    return mailInfo.id;
};
mc.MailManager.isGiftMail = function (mailInfo) {
    return mailInfo["claim"] != undefined;
};
mc.MailManager.getMailContentGift = function (mailInfo) {
    return mailInfo.giftString;
};
mc.MailManager.getMailHeroGift = function (mailInfo) {
    return mailInfo["heroString"];
};
mc.MailManager.getMailContentText = function (mailInfo) {
    var str = mailInfo.content || mailInfo.shortContent;
    if (mailInfo.properties) {
        var arr = cc.copyArray(mailInfo.properties);
        cc.arrayAppendObjectsToIndex(arr, mc.dictionary.getI18nMsg(str), 0);
        return cc.formatStr.apply(null, arr);
    }
    return mc.dictionary.getI18nMsg(str);
};
mc.MailManager.getMailContentActions = function (mailInfo) {
    return mailInfo.actions;
};
mc.MailManager.ACTION_UPDATE = "update";
mc.MailManager.ACTION_REMOVE = "remove";
mc.MailManager.ACTION_CLAIM = "claim";
mc.MailManager.ACTION_ACCEPT = "accept";