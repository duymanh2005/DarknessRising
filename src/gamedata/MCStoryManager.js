/**
 * Created by long.nguyen on 1/8/2018.
 */
mc.StoryManager = bb.Class.extend({
    _currStoryIndex: 0,
    _currTalkIndex: 0,

    ctor: function () {
        this._super();
        this.STORY_TRIGGER = [
            {
                conditions: {
                    containerId: mc.StoryManager.SCREEN_TUTORIAL_BATTLE,
                    storyIndex: 0
                },
                text: ["scn_1_elf_1", "scn_1_elf_2", "scn_1_dk", "scn_1_kundun"],
                trigger: mc.StoryManager.TRIGGER_SCREEN_START
            },
            {
                conditions: {
                    containerId: mc.StoryManager.SCREEN_TUTORIAL_BATTLE,
                    storyIndex: 1
                },
                text: ["scn_2_elf"],
                trigger: mc.StoryManager.TRIGGER_CREATURE_FULL_MANA
            },
            {
                conditions: {
                    containerId: mc.StoryManager.SCREEN_TUTORIAL_BATTLE,
                    storyIndex: 2
                },
                text: ["scn_3_dk"],
                trigger: mc.StoryManager.TRIGGER_CREATURE_FULL_MANA
            },
            {
                conditions: {
                    containerId: mc.StoryManager.SCREEN_TUTORIAL_BATTLE,
                    storyIndex: 3
                },
                text: ["scn_4_kundun", "scn_4_dk"],
                trigger: mc.StoryManager.TRIGGER_SCREEN_START
            },
            {
                conditions: {
                    containerId: mc.StoryManager.SCREEN_TUTORIAL_BATTLE,
                    storyIndex: 4
                },
                text: ["scn_5_dw"],
                trigger: mc.StoryManager.TRIGGER_BATTLE_FIELD_COUNT_TURN_3
            },
            {
                conditions: {
                    containerId: mc.StoryManager.SCREEN_TUTORIAL_BATTLE,
                    storyIndex: 5
                },
                text: ["scn_6_kundun"],
                trigger: mc.StoryManager.TRIGGER_CREATURE_DISABLE
            },
            {
                conditions: {
                    containerId: mc.StoryManager.SCREEN_TUTORIAL_BATTLE,
                    storyIndex: 6
                },
                text: ["scn_7_des"],
                trigger: mc.StoryManager.TRIGGER_BATTLE_END
            },
        ]
    },

    setStoryIndex: function (storySceneIndex) {
        this._currStoryIndex = storySceneIndex || 0;
    },

    getStoryIndex: function () {
        return this._currStoryIndex;
    },

    getCurrentStoryString: function () {
        var arr = [];
        var trigger = this.getCurrentTrigger();
        if (trigger) {
            var text = trigger.text;
            var txtDict = mc.dictionary.getI18String("arrTxtStoryTalk");
            for (var i = 0; i < text.length; i++) {
                arr.push(txtDict[text[i]]);
            }
        }
        return arr;
    },

    nextStory: function () {
        this._currTalkIndex = 0;
        this._currStoryIndex++;
        if (this._currStoryIndex >= this.STORY_TRIGGER.length) {
            this._currStoryIndex = this.STORY_TRIGGER.length;
        }
        this.notifyDataChanged();
    },

    getCurrentTalkString: function () {
        var trigger = this.getCurrentTrigger();
        if (trigger) {
            var text = trigger.text;
            if (this._currTalkIndex < text.length) {
                var txtDict = mc.dictionary.getI18String("arrTxtStoryTalk");
                return txtDict[text[this._currTalkIndex]];
            }
        }
        return null;
    },

    nextTalk: function () {
        var trigger = this.getCurrentTrigger();
        if (trigger) {
            var text = trigger.text;
            this._currTalkIndex++;
            if (this._currTalkIndex >= text.length) {
                return true;
            }
        }
        return false;
    },

    getCurrentTrigger: function () {
        if (this._currStoryIndex < this.STORY_TRIGGER.length) {
            return this.STORY_TRIGGER[this._currStoryIndex];
        }
        return null;
    },

    getStoryTrigger: function (containerId) {
        var storyIndex = mc.GameData.storyManager.getStoryIndex();
        var currData = {
            containerId: containerId,
            storyIndex: storyIndex
        };
        var arrTrigger = this.STORY_TRIGGER;
        var retTrigger = null;
        for (var i = 0; i < arrTrigger.length; i++) {
            var trigger = arrTrigger[i];
            var conditions = trigger.conditions;
            var foundTrigger = true;
            for (var name in conditions) {
                if (conditions[name] != currData[name]) {
                    foundTrigger = false;
                    break;
                }
            }
            if (foundTrigger) {
                retTrigger = trigger;
                break;
            }
        }
        return retTrigger;
    }

});
mc.StoryManager.SCREEN_TUTORIAL_BATTLE = "screen_tutorial_battle";
mc.StoryManager.TRIGGER_SCREEN_START = "trigger_screen_start";
mc.StoryManager.TRIGGER_CREATURE_FULL_MANA = "trigger_creature_full_mana";
mc.StoryManager.TRIGGER_BATTLE_FIELD_COUNT_TURN_3 = "trigger_battle_field_count_turn_3";
mc.StoryManager.TRIGGER_CREATURE_DISABLE = "trigger_creature_disable";
mc.StoryManager.TRIGGER_BATTLE_END = "trigger_battle_end";