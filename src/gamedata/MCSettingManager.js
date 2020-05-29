/**
 * Created by long.nguyen on 1/4/2018.
 */
mc.SettingManager = bb.Class.extend({
    _clientData: null,
    _rating: null,

    setSettingData: function (settingData) {
        this._version = settingData["version"];
        this._location = settingData["location"];

        if (settingData["clientData"]) {
            this._clientData = JSON.parse(settingData["clientData"]);
            this._loadAll();
        } else {
            this._clientData = {};
        }
    },

    _loadAll: function () {
        mc.GameData.storyManager.setStoryIndex(this._clientData["currStoryIndex"]);
        mc.GameData.tutorialManager.setTutorialDoneMap(this._clientData["tutorial"]);
        mc.GameData.ratingManager.setRatingData(this._clientData["rating"]);
        cc.log("---- Tutorial ----");
        cc.log(this.getClientData()["tutorial"]);
    },

    saveAll: function () {
        this._clientData["currStoryIndex"] = mc.GameData.storyManager.getStoryIndex();
        this._clientData["tutorial"] = mc.GameData.tutorialManager.getTutorialDoneMap();
        this._clientData["rating"] = mc.GameData.ratingManager.getRatingData();
        this._location = mc.storage.readSetting().language;
    },

    skipAllTutorial: function () {
        this._clientData["currStoryIndex"] = mc.GameData.storyManager.getAndSetLastStoryIndex();
        this._clientData["tutorial"] = mc.GameData.tutorialManager.skipAll();
        this._clientData["rating"] = mc.GameData.ratingManager.getRatingData();
        this._location = mc.storage.readSetting().language;
    },

    flush: function (callback) {
        mc.protocol.updateSetting(callback);
    },

    getClientData: function () {
        return this._clientData;
    }

});