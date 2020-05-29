/**
 * Created by long.nguyen on 1/4/2018.
 */
mc.TutorialManager = bb.Class.extend({
    _currTutorialIndex: 0,
    _currScriptText: 0,
    _mapTutorialDoneById: null,
    _currTriggerId: null,

    ctor: function () {
        this._super();

        this._mapTutorialDoneById = {};
        this.TUTORIAL_TRIGGER = {};
        var priority = 0;
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_HOW_TO_PLAY] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STORY,
                param: 1
            },
            script: [
                {
                    containerId: mc.TutorialManager.SCREEN_TUTORIAL_BATTLE,
                    text: ["t1_elf_click"],
                    trigger: mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_1
                },
                {
                    containerId: mc.TutorialManager.SCREEN_TUTORIAL_BATTLE,
                    text: ["t1_dk_click"],
                    trigger: mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_2
                },
                {
                    containerId: mc.TutorialManager.SCREEN_TUTORIAL_BATTLE,
                    text: ["t1_dw_click"],
                    trigger: mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_3,
                    save: true
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_START_FIRST_STAGE] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 100
            },
            des: ["t2_click_world_btn"],
            script: [
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t2_click_world_btn"],
                    trigger: mc.TutorialManager.CLICK_WORLD_BUTTON,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_WORLD,
                    text: ["t2_click_loren_btn"],
                    trigger: mc.TutorialManager.CLICK_LOREN_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_STAGE_CAMPAIGN_LIST,
                    text: ["t2_click_battle_btn1"],
                    trigger: mc.TutorialManager.CLICK_STAGE_BATTLE_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_SELECT_CAMPAIGN_HERO,
                    text: ["t2_click_battle_btn2"],
                    trigger: mc.TutorialManager.CLICK_START_CP_BATTLE_BUTTON,
                    save: true
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_EQUIP_ITEM] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 101
            },
            des: ["click_back_to_equip"],
            script: [
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t3_view_hero"],
                    trigger: mc.TutorialManager.CLICK_HERO_STOCK_TAB,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_STOCK,
                    text: ["t3_view_hero_detail"],
                    trigger: mc.TutorialManager.CLICK_HERO_WIDGET,
                    param: 100
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_INFO,
                    text: ["t3_equip_item"],
                    trigger: mc.TutorialManager.CLICK_EQUIP_ITEM_SLOT,
                    param: mc.const.SLOT_TYPE_WEAPON
                },
                {
                    containerId: mc.TutorialManager.DIALOG_ITEM_STOCK,
                    text: ["t3_click_item"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    save: true
                },
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["click_home_after_equip"],
                    trigger: mc.TutorialManager.CLICK_BACK_BUTTON
                },
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t4_click_home_tab"],
                    trigger: mc.TutorialManager.CLICK_HOME_TAB
                },
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t4_click_world"],
                    trigger: mc.TutorialManager.CLICK_WORLD_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_WORLD,
                    text: ["t4_click_loren"],
                    trigger: mc.TutorialManager.CLICK_LOREN_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_STAGE_CAMPAIGN_LIST,
                    text: ["t4_click_battle1"],
                    trigger: mc.TutorialManager.CLICK_STAGE_BATTLE_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_SELECT_CAMPAIGN_HERO,
                    text: ["t4_click_battle2"],
                    trigger: mc.TutorialManager.CLICK_START_CP_BATTLE_BUTTON
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_LVUP_HERO] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 102
            },
            des: ["click_back_to_lvlup"],
            script: [
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t5_view_hero"],
                    trigger: mc.TutorialManager.CLICK_HERO_STOCK_TAB,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_STOCK,
                    text: ["t5_view_hero_detail"],
                    trigger: mc.TutorialManager.CLICK_HERO_WIDGET,
                    param: 100
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_INFO,
                    text: ["t5_lvup_hero"],
                    trigger: mc.TutorialManager.CLICK_LVUP_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_LVUP,
                    text: ["t5_click_plus"],
                    trigger: mc.TutorialManager.CLICK_PLUS_BUTTON
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_material"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    param: 0
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_ok"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_LVUP,
                    text: ["t5_click_submit"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    save: true
                },
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["click_back_after_lvlup"],
                    trigger: mc.TutorialManager.CLICK_BACK_BUTTON
                },
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["click_back_button"],
                    trigger: mc.TutorialManager.CLICK_BACK_BUTTON
                },
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t4_click_home_tab"],
                    trigger: mc.TutorialManager.CLICK_HOME_TAB
                },
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t4_click_world"],
                    trigger: mc.TutorialManager.CLICK_WORLD_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_WORLD,
                    text: ["t4_click_loren"],
                    trigger: mc.TutorialManager.CLICK_LOREN_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_STAGE_CAMPAIGN_LIST,
                    text: ["t4_click_battle1"],
                    trigger: mc.TutorialManager.CLICK_STAGE_BATTLE_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_SELECT_CAMPAIGN_HERO,
                    text: ["t4_click_battle2"],
                    trigger: mc.TutorialManager.CLICK_START_CP_BATTLE_BUTTON
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_SUMMON_HERO] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 103
            },
            des: ["click_back_to_summon"],
            script: [
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t6_click_summon_tab"],
                    trigger: mc.TutorialManager.CLICK_SUMMON_TAB,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_SUMMON_LIST,
                    text: ["t6_click_summon"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    save: true
                },
                {
                    containerId: mc.TutorialManager.SCREEN_HERO_SUMMON,
                    text: ["click_back_button"],
                    trigger: mc.TutorialManager.CLICK_BACK_BUTTON
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_EDIT_TEAM] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_FINISH_X_TUTORIAL,
                param: mc.TutorialManager.ID_SUMMON_HERO,
                idSub: mc.TutorialManager.CONDITION_HAS_X_STAR_HERO,
                paramSub: 4
            },
            des: ["click_back_to_edit_team"],
            script: [
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t7_click_hero_stock"],
                    trigger: mc.TutorialManager.CLICK_HERO_STOCK_TAB,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_STOCK,
                    text: ["click_edit_team"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                },
                {
                    containerId: mc.TutorialManager.SCREEN_EDIT_FORMATION,
                    text: ["t7_pick_hero_widget"],
                    trigger: mc.TutorialManager.CLICK_HERO_WIDGET
                },
                {
                    containerId: mc.TutorialManager.SCREEN_EDIT_FORMATION,
                    text: ["t7_click_hero_spine"],
                    trigger: mc.TutorialManager.CLICK_HERO_SPINE
                },
                {
                    containerId: mc.TutorialManager.SCREEN_EDIT_FORMATION,
                    text: ["t7_click_submit_btn"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    save: true
                },
                {
                    containerId: mc.TutorialManager.SCREEN_EDIT_FORMATION,
                    text: ["t7_back_to_main"],
                    trigger: mc.TutorialManager.CLICK_BACK_BUTTON
                },
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t4_click_home_tab"],
                    trigger: mc.TutorialManager.CLICK_HOME_TAB
                },
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t4_click_world"],
                    trigger: mc.TutorialManager.CLICK_WORLD_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_WORLD,
                    text: ["t4_click_loren"],
                    trigger: mc.TutorialManager.CLICK_LOREN_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_STAGE_CAMPAIGN_LIST,
                    text: ["t4_click_battle1"],
                    trigger: mc.TutorialManager.CLICK_STAGE_BATTLE_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_SELECT_CAMPAIGN_HERO,
                    text: ["t4_click_battle2"],
                    trigger: mc.TutorialManager.CLICK_START_CP_BATTLE_BUTTON
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_CHALLENGE] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 105
            },
            des: ["click_back_to_daily_challenge"],
            script: [
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t4_click_event"],
                    trigger: mc.TutorialManager.CLICK_EVENT_BUTTON,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_ALL_EVENT,
                    text: ["t4_click_challenge"],
                    trigger: mc.TutorialManager.CLICK_CHALLENGE_BUTTON,
                    save: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_CHALLENGE_STAGE_LIST,
                    text: ["t4_click_battle1"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_HERO,
                    text: ["t4_click_battle1"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_CRAFT_ITEM] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 106,
                idSub: mc.TutorialManager.CONDITION_CRAFT_X_ITEM,
                paramSub: true
            },
            des: ["click_back_to_craft_item"],
            script: [
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t8_click_smithy"],
                    trigger: mc.TutorialManager.CLICK_GOBLIN_BUTTON,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_BLACK_SMITH,
                    text: ["t8_click_craft_item"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    param: "craft"
                },
                {
                    containerId: mc.TutorialManager.SCREEN_CRAFT_ITEM,
                    text: ["t8_click_craft_item"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    save: true
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_UPGRADE_ITEM] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 107,
                idSub: mc.TutorialManager.CONDITION_UPGRADE_X_ITEM,
                paramSub: true
            },
            des: ["click_back_to_lvlup_item"],
            script: [
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t8_click_smithy"],
                    trigger: mc.TutorialManager.CLICK_GOBLIN_BUTTON,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_BLACK_SMITH,
                    text: ["t8_click_lvlup_item"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    param: "upgrade"
                },
                {
                    containerId: mc.TutorialManager.SCREEN_UPDRAGE_ITEM,
                    text: ["t5_click_plus"],
                    trigger: mc.TutorialManager.CLICK_PLUS_BUTTON
                },
                {
                    containerId: mc.TutorialManager.DIALOG_ITEM_STOCK,
                    text: ["t3_click_item"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET
                },
                {
                    containerId: mc.TutorialManager.SCREEN_UPDRAGE_ITEM,
                    text: ["t8_click_lvlup_item"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    save: true
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_INVOLVE_HERO] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 400,
                idSub: mc.TutorialManager.CONDITION_INVOLVE_X_HERO,
                paramSub: 352
            },
            des: ["click_back_to_involve_hero"],
            script: [
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t5_view_hero"],
                    trigger: mc.TutorialManager.CLICK_HERO_STOCK_TAB,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_STOCK,
                    text: ["t5_view_hero_detail"],
                    trigger: mc.TutorialManager.CLICK_HERO_WIDGET,
                    param: 352
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_INFO,
                    text: ["t8_click_lvlup_to_evolve"],
                    trigger: mc.TutorialManager.CLICK_LVUP_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_LVUP,
                    text: ["t5_click_plus"],
                    trigger: mc.TutorialManager.CLICK_PLUS_BUTTON
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_material"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    param: {index: 11025, no: 5}
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_material"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    param: {index: 11025, no: 1}
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_material"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    param: {index: 11025, no: 1}
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_material"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    param: {index: 11025, no: 1}
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_material"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    param: {index: 11025, no: 1}
                },
                {
                    containerId: mc.TutorialManager.DIALOG_SELECT_MATERIAL,
                    text: ["t5_click_ok"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_LVUP,
                    text: ["t5_click_submit"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                },
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["click_back_after_lvlup"],
                    trigger: mc.TutorialManager.CLICK_BACK_BUTTON
                },
                {
                    containerId: mc.TutorialManager.LAYER_HERO_INFO,
                    text: ["t8_click_evolve_hero"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    param: "evolve"
                },
                {
                    containerId: mc.TutorialManager.SCREEN_EVOLVE_HERO,
                    text: ["t8_click_evolve_hero"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    save: true
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_ARENA] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 200
            },
            des: ["click_back_to_arena"],
            script: [
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["click_arena"],
                    trigger: mc.TutorialManager.CLICK_ARENA_BUTTON,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_ARENA,
                    text: ["click_arena_edit_team"],
                    trigger: mc.TutorialManager.CLICK_HERO_WIDGET
                },
                {
                    containerId: mc.TutorialManager.LAYER_ARENA,
                    text: ["click_arena_edit_defense_team"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON_2
                },
                {
                    containerId: mc.TutorialManager.LAYER_ARENA,
                    text: ["arena_find_opponent"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                },
                {
                    containerId: mc.TutorialManager.DIALOG_ARENA_OPPONENT,
                    text: ["arena_attack_opponent"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    save: true
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_CHAOSCASTLE] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 205
            },
            des: ["click_back_to_chaos"],
            script: [
                {
                    containerId: mc.TutorialManager.LAYER_HOME,
                    text: ["t4_click_event"],
                    trigger: mc.TutorialManager.CLICK_EVENT_BUTTON,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_ALL_EVENT,
                    text: ["click_chaos"],
                    trigger: mc.TutorialManager.CLICK_CHAOSCASTLE_BUTTON,
                    save: true
                },
                {
                    containerId: mc.TutorialManager.SCREEN_CHAOS,
                    text: ["click_chaos_hero"],
                    trigger: mc.TutorialManager.CLICK_HERO_SPINE
                },
                {
                    containerId: mc.TutorialManager.DIALOG_CHAOS_OPPONENT,
                    text: ["click_chaos_edit_team"],
                    trigger: mc.TutorialManager.CLICK_HERO_WIDGET
                },
                {
                    containerId: mc.TutorialManager.DIALOG_CHAOS_OPPONENT,
                    text: ["click_chaos_fight"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON
                }
            ]
        };
        this.TUTORIAL_TRIGGER[mc.TutorialManager.ID_SHARD_UP] = {
            priority: ++priority,
            conditions: {
                id: mc.TutorialManager.CONDITION_COME_X_STAGE,
                param: 300,
                idSub: mc.TutorialManager.CONDITION_SHARD_UP_X,
                paramSub: true
            },
            des: ["click_back_to_shard_up"],
            script: [
                {
                    containerId: mc.TutorialManager.SCREEN_MAIN,
                    text: ["t3_view_items"],
                    trigger: mc.TutorialManager.CLICK_ITEM_STOCK_TAB,
                    mark: true
                },
                {
                    containerId: mc.TutorialManager.LAYER_ITEM_STOCK,
                    text: ["t8_touch_tab"],
                    trigger: mc.TutorialManager.CLICK_TAB,
                    param: "shard"
                },
                {
                    containerId: mc.TutorialManager.LAYER_ITEM_STOCK,
                    text: ["t3_view_item_detail"],
                    trigger: mc.TutorialManager.CLICK_ITEM_WIDGET,
                    param: 11806
                },
                {
                    containerId: mc.TutorialManager.DIALOG_ITEM_INFO,
                    text: ["t6_click_summon"],
                    trigger: mc.TutorialManager.CLICK_SUBMIT_BUTTON,
                    param: "summon",
                    save: true
                }
            ]
        };

    },

    setTutorialDoneMap: function (map) {
        this._mapTutorialDoneById = map || {};
    },

    submitTutorialDoneById: function (id) {
        if (this._mapTutorialDoneById) {
            if (!this._mapTutorialDoneById[id]) {
                this._mapTutorialDoneById[id] = true;
                mc.GameData.settingManager.saveAll();
                mc.GameData.settingManager.flush();
            }
        }
    },

    getTutorialDoneMap: function () {
        return this._mapTutorialDoneById;
    },

    setAllTutorialDoneMap: function(){

    },

    lockScript: function (isLock) {
        this._isLockScript = isLock;
    },

    goToMarkPoint: function () {
        var trigger = this.getCurrentTrigger();
        var script = null;
        if (trigger) {
            var scrips = trigger.script;
            for (var i = 0; i < scrips.length; i++) {
                if (scrips[i].mark) {
                    this._currTutorialIndex = i;
                    script = scrips[i];
                    break;
                }
            }
        }
        return script;
    },

    injectTutorialStepNavigationIfAny: function () {
        if (this._currTutorialIndex === 0) {
            var trigger = this.getCurrentTrigger();
            if (trigger) {
                var scrips = trigger.script;

                var scr = bb.director.getCurrentScreen();
                if (scr instanceof mc.MainScreen) {
                    if (scr.getCurrentLayerId() === mc.MainScreen.LAYER_HOME) {
                        var script = this.goToMarkPoint();
                        script.text = trigger.des;
                    } else {
                        var backStack = mc.GameData.guiState.getStackLayerIdForMainScreen();
                        var shouldClickHomeTab = true;
                        if (backStack) {
                            if (backStack[0] === mc.MainScreen.LAYER_HOME) {
                                shouldClickHomeTab = false;
                                for (var i = 0; i < backStack.length; i++) {
                                    cc.arrayAppendObjectsToIndex(scrips, {
                                        containerId: mc.TutorialManager.SCREEN_MAIN,
                                        text: (i === backStack.length - 1) ? trigger.des : ["t5_click_x_btn"],
                                        trigger: mc.TutorialManager.CLICK_BACK_BUTTON
                                    }, 0);
                                }
                            }
                        }
                        if (shouldClickHomeTab) {
                            cc.arrayAppendObjectsToIndex(scrips, {
                                containerId: mc.TutorialManager.SCREEN_MAIN,
                                text: ["t4_click_home_tab"],
                                trigger: mc.TutorialManager.CLICK_HOME_TAB
                            }, 0);
                        }
                    }
                }
            }
        }
    },

    skip: function () {
        if (this._currTriggerId) {
            this._currScriptText = 0;
            this._currTutorialIndex = 0;
            this._mapTutorialDoneById[this._currTriggerId] = true;
            this._currTriggerId = null;
        }
        this.lockScript(false);
    },

    skipAll: function(){
        Object.keys(this.TUTORIAL_TRIGGER).forEach(function(key) {this
            this._mapTutorialDoneById[key] = true;
        }.bind(this));

        this.lockScript(false);
    },

    getCurrentTutorialString: function () {
        var trigger = this.getCurrentTrigger();
        if (trigger) {
            var script = trigger.script[this._currTutorialIndex];
            if (this._currScriptText < script.text.length) {
                return mc.dictionary.getI18String("arrTxtTutorialTalk")[script.text[this._currScriptText]];
            }
        }
        return null;
    },

    nextTutorial: function () {
        var trigger = this.getCurrentTrigger();
        var isSave = trigger.script[this._currTutorialIndex].save;
        var triggerId = this._currTriggerId;
        this._currTutorialIndex++;
        if (this._currTutorialIndex >= trigger.script.length) {
            isSave = true;
            this._currScriptText = 0;
            this._currTutorialIndex = 0;
            this._currTriggerId = null;
            this._mapTutorialDoneById[triggerId] = true;
        }

        this.lockScript(false);
        return isSave;
    },

    _evaluateConditionByID: function (id, param) {
        var satisfy = false;
        if (id === mc.TutorialManager.CONDITION_HAS_EQUIPMENT_X_SLOT) {
            var equipmentMap = mc.GameData.notifySystem.getHeroEquipmentNotification();
            if (equipmentMap) {
                satisfy = true;
            }
        } else if (id === mc.TutorialManager.CONDITION_HAS_X_STAR_HERO) {
            var heroMap = mc.GameData.heroStock.getHeroMap();
            for (var heroId in heroMap) {
                if (mc.HeroStock.getHeroRank(heroMap[heroId]) >= param) {
                    satisfy = true;
                    break;
                }
            }
        } else if (id === mc.TutorialManager.CONDITION_HAS_X_BLESS) {
            if (mc.GameData.playerInfo.getBless() >= param) {
                satisfy = true;
            }
        } else if (id === mc.TutorialManager.CONDITION_HAS_X_BOOK) {
            var count = 0;
            var itemMap = mc.GameData.itemStock.getItemMap();
            for (var itemId in itemMap) {
                var itemInfo = itemMap[itemId];
                if (mc.ItemStock.getItemType(itemInfo) === mc.const.ITEM_TYPE_HERO_MATERIAL) {
                    count++;
                }
            }
            count >= param && (satisfy = true);
        } else if (id === mc.TutorialManager.CONDITION_COME_X_STAGE) {
            satisfy = mc.GameData.playerInfo.getCurrentStageIndex() === param; // come this stage
        } else if (id === mc.TutorialManager.CONDITION_COME_X_STORY) {
            var storyIndex = mc.GameData.storyManager.getStoryIndex();
            if (storyIndex === param) {
                satisfy = true;
            }
        } else if (id === mc.TutorialManager.CONDITION_FINISH_X_TUTORIAL) {
            if (this._mapTutorialDoneById[param]) {
                satisfy = true;
            }
        }
        else if (id === mc.TutorialManager.CONDITION_CRAFT_X_ITEM) {
            var itemCraftNotification = mc.GameData.notifySystem.getItemCraftingNotification();
            if (itemCraftNotification) {
                for (var itemIndex in itemCraftNotification) {
                    satisfy = true;
                }
            }
        } else if (id === mc.TutorialManager.CONDITION_UPGRADE_X_ITEM) {
            var itemLvUpNotification = mc.GameData.notifySystem.getEquipmentLevelUpNotification();
            if (itemLvUpNotification) {
                for (var itemId in itemLvUpNotification) {
                    var itemInfo = mc.GameData.itemStock.getItemById(itemId);
                    if (itemInfo && (param === true || param === mc.ItemStock.getItemIndex(itemInfo))) {
                        satisfy = true;
                        break;
                    }
                }
            }
        } else if (id === mc.TutorialManager.CONDITION_INVOLVE_X_HERO) {
            var evolveHeroNotification = mc.GameData.notifySystem.getHeroInvolveNotification();
            if (evolveHeroNotification) {
                for (var heroId in evolveHeroNotification) {
                    var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
                    if (heroInfo && (param === true || param === mc.HeroStock.getHeroIndex(heroInfo))) {
                        satisfy = true;
                        break;
                    }
                }
            }
        } else if (id === mc.TutorialManager.CONDITION_SHARD_UP_X) {
            var shardUpNotification = mc.GameData.notifySystem.getShardUpNotification();
            if (shardUpNotification) {
                for (var itemId in shardUpNotification) {
                    var itemInfo = mc.GameData.itemStock.getItemById(itemId);
                    if (itemInfo && (param === true || param === mc.ItemStock.getItemIndex(itemInfo))) {
                        satisfy = true;
                        break;
                    }
                }
            }
        }
        return satisfy;
    },

    getCurrentTrigger: function () {
        var retTrigger = null;
        if (!this._currTriggerId) {
            var minPriority = 9999999;
            for (var triggerId in this.TUTORIAL_TRIGGER) {
                var trigger = this.TUTORIAL_TRIGGER[triggerId];
                if (!this._mapTutorialDoneById[triggerId]) {
                    var conditions = trigger.conditions;
                    if (conditions) {
                        var id = conditions.id;
                        var param = conditions.param;
                        var idSub = conditions.idSub;
                        var paramSub = conditions.paramSub;
                        var satisfy = true;
                        if (idSub != undefined && paramSub != undefined) {
                            satisfy = this._evaluateConditionByID(idSub, paramSub);
                        }
                        if (satisfy && id != undefined && param != undefined) {
                            satisfy = this._evaluateConditionByID(id, param);
                            if (satisfy) {
                                if (minPriority > trigger.priority) {
                                    retTrigger = trigger;
                                    this._currTriggerId = triggerId;
                                    minPriority = trigger.priority;
                                }
                            }
                        }
                    }

                }

            }
        } else {
            retTrigger = this.TUTORIAL_TRIGGER[this._currTriggerId];
        }
        return retTrigger;
    },

    getTutorialTriggerScript: function (containerId) {
        var retScript = null;
        if (!this._isLockScript) {
            var trigger = this.getCurrentTrigger();
            if (trigger) {
                var script = trigger.script[this._currTutorialIndex];
                if (script.containerId === containerId) {
                    retScript = script;
                    cc.log(script);
                }
            }
        }
        return retScript;
    }

});
mc.TutorialManager.ID_HOW_TO_PLAY = "id_how_to_play";
mc.TutorialManager.ID_START_FIRST_STAGE = "id_start_first_stage";
mc.TutorialManager.ID_EQUIP_ITEM = "id_equip_item";
mc.TutorialManager.ID_LVUP_HERO = "id_lvup_hero";
mc.TutorialManager.ID_INVOLVE_HERO = "id_involve_hero";
mc.TutorialManager.ID_SUMMON_HERO = "id_summon_hero";
mc.TutorialManager.ID_EDIT_TEAM = "id_edit_team";
mc.TutorialManager.ID_UPGRADE_ITEM = "id_upgrade_item";
mc.TutorialManager.ID_CRAFT_ITEM = "id_craft_item";
mc.TutorialManager.ID_CHALLENGE = "id_challenge";
mc.TutorialManager.ID_ARENA = "id_arena";
mc.TutorialManager.ID_ARENA_DEFENSE = "id_arena_defense";
mc.TutorialManager.ID_CHAOSCASTLE = "id_chaoscastle";
mc.TutorialManager.ID_SHARD_UP = "id_shard_up";
mc.TutorialManager.SCREEN_MAIN = "screen_main";
mc.TutorialManager.SCREEN_TUTORIAL_BATTLE = "screen_tutorial_battle";
mc.TutorialManager.SCREEN_CAMPAIGN_BATTLE = "screen_campaign_battle";
mc.TutorialManager.SCREEN_EDIT_FORMATION = "screen_edit_formation";
mc.TutorialManager.SCREEN_HERO_SUMMON = "screen_hero_summon";
mc.TutorialManager.SCREEN_UPDRAGE_ITEM = "screen_upgrade_item";
mc.TutorialManager.SCREEN_CRAFT_ITEM = "screen_craft_item";
mc.TutorialManager.SCREEN_CHAOS = "screen_chaos";
mc.TutorialManager.SCREEN_EVOLVE_HERO = "screen_evolve_hero";
mc.TutorialManager.LAYER_HOME = "layer_home";
mc.TutorialManager.LAYER_ARENA = "layer_arena";
mc.TutorialManager.LAYER_ALL_EVENT = "layer_all_event";
mc.TutorialManager.LAYER_CHALLENGE_LIST = "layer_event_list";
mc.TutorialManager.LAYER_CHALLENGE_STAGE_LIST = "layer_event_stage_list";
mc.TutorialManager.LAYER_WORLD = "layer_world";
mc.TutorialManager.LAYER_HERO_STOCK = "layer_hero_stock";
mc.TutorialManager.LAYER_HERO_INFO = "layer_hero_info";
mc.TutorialManager.LAYER_HERO_LVUP = "layer_hero_lvup";
mc.TutorialManager.LAYER_ITEM_STOCK = "layer_item_stock";
mc.TutorialManager.LAYER_SUMMON_LIST = "layer_summon_list";
mc.TutorialManager.LAYER_STAGE_CAMPAIGN_LIST = "layer_stage_campaign_list";
mc.TutorialManager.LAYER_SELECT_CAMPAIGN_HERO = "layer_select_campaign_hero";
mc.TutorialManager.LAYER_BLACK_SMITH = "layer_blacksmith";
mc.TutorialManager.DIALOG_ITEM_STOCK = "dialog_item_stock";
mc.TutorialManager.DIALOG_SELECT_MATERIAL = "dialog_select_material";
mc.TutorialManager.DIALOG_ITEM_INFO = "dialog_item_info";
mc.TutorialManager.DIALOG_SELECT_HERO = "dialog_select_hero";
mc.TutorialManager.DIALOG_ARENA_OPPONENT = "dialog_arena_opponent";
mc.TutorialManager.DIALOG_CHAOS_OPPONENT = "dialog_chaos_opponent";
mc.TutorialManager.NONE = "none";
mc.TutorialManager.CLICK_CHALLENGE_BUTTON = "click_challenge_button";
mc.TutorialManager.CLICK_CHAOSCASTLE_BUTTON = "click_chaoscastle_button";
mc.TutorialManager.CLICK_WORLD_BUTTON = "click_world_button";
mc.TutorialManager.CLICK_EVENT_BUTTON = "click_event_button";
mc.TutorialManager.CLICK_LOREN_BUTTON = "click_loren_button";
mc.TutorialManager.CLICK_ARENA_BUTTON = "click_arena_button";
mc.TutorialManager.CLICK_GOBLIN_BUTTON = "click_goblin_button";
mc.TutorialManager.CLICK_STAGE_BATTLE_BUTTON = "click_battle_button";
mc.TutorialManager.CLICK_BACK_BUTTON = "click_back_button";
mc.TutorialManager.CLICK_START_CP_BATTLE_BUTTON = "click_start_cp_battle_button";
mc.TutorialManager.CLICK_HERO_STOCK_TAB = "click_hero_stock_tab";
mc.TutorialManager.CLICK_ITEM_STOCK_TAB = "click_item_stock_tab";
mc.TutorialManager.CLICK_TAB = "click_tab";
mc.TutorialManager.CLICK_SHOP_TAB = "click_shop_tab";
mc.TutorialManager.CLICK_SUMMON_TAB = "click_summon_tab";
mc.TutorialManager.CLICK_HOME_TAB = "click_home_tab";
mc.TutorialManager.CLICK_HERO_WIDGET = "click_hero_widget";
mc.TutorialManager.CLICK_HERO_SPINE = "click_hero_spine";
mc.TutorialManager.CLICK_ITEM_WIDGET = "click_item_widget";
mc.TutorialManager.CLICK_LVUP_BUTTON = "click_lvup_button";
mc.TutorialManager.CLICK_EQUIP_ITEM_SLOT = "click_equip_item_slot";
mc.TutorialManager.CLICK_PLUS_BUTTON = "click_plus_button";
mc.TutorialManager.CLICK_SUBMIT_BUTTON = "click_submit_button";
mc.TutorialManager.CLICK_SUBMIT_BUTTON_2 = "click_submit_button_2";
mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_1 = "click_battke_avatar_widget_1";
mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_2 = "click_battke_avatar_widget_2";
mc.TutorialManager.CLICK_BATTLE_AVATAR_WIDGET_3 = "click_battke_avatar_widget_3";
mc.TutorialManager.CONDITION_HAS_X_BOOK = "condition_has_x_book";
mc.TutorialManager.CONDITION_HAS_EQUIPMENT_X_SLOT = "condition_has_equipment_x_slot";
mc.TutorialManager.CONDITION_HAS_X_STAR_HERO = "condition_has_x_star_hero";
mc.TutorialManager.CONDITION_HAS_X_BLESS = "condition_has_x_bless";
mc.TutorialManager.CONDITION_COME_X_STAGE = "condition_come_x_stage";
mc.TutorialManager.CONDITION_FINISH_X_TUTORIAL = "condition_finish_x_tutorial";
mc.TutorialManager.CONDITION_COME_X_STORY = "condition_come_x_story";
mc.TutorialManager.CONDITION_UPGRADE_X_ITEM = "condition_upgrade_x_item";
mc.TutorialManager.CONDITION_CRAFT_X_ITEM = "condition_craft_x_item";
mc.TutorialManager.CONDITION_INVOLVE_X_HERO = "condition_involve_x_hero";
mc.TutorialManager.CONDITION_SHARD_UP_X = "condition_shard_up_x";
mc.TutorialManager.CONDITION_UNLOCK_FUNCTION = "condition_unlock_function";