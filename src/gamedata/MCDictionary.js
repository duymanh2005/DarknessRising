/**
 * Created by long.nguyen on 5/17/2017.
 */
(function () {

    mc.CreatureAssetDesc = cc.Class.extend({
        ctor: function (data) {
            this._data = data;
            var arrKey = ["attackSound", "attackHitEffect",
                "skillActiveSound", "skillActiveHitEffect",
                "skillAutoSound", "skillAutoHitEffect"];
            for (var i = 0; i < arrKey.length; i++) {
                var name = arrKey[i];
                if (this._data[name]) {
                    this._data[name] = this._data[name].split('#');
                }
            }
        },

        getIndex: function () {
            return this._data["index"];
        },

        getAvatarURL: function () {
            var url = cc.formatStr("res/png/char/avatar/%s.png", this._data["resChar"]);
            return url;
        },

        getIconURL: function () {
            var url = cc.formatStr("png/char/icon/%s.png", this._data["resChar"]);
            return url;
        },

        getPngString: function () {
            var url = cc.formatStr("res/spine/char/%s", this._data["resChar"]);
            return url;
        },

        getSpineString: function () {
            var url = cc.formatStr("res/spine/char/%s", this._data["jsonChar"]);
            return url;
        },

        getCharString: function () {
            return this._data["jsonChar"];
        },

        getSoundHurt: function () {
            var url = this._data["hurtSound"];
            if (url) {
                return "res/sound/effect/" + url + ".mp3";
            }
            return null;
        },

        getSoundByName: function (name) {
            return "res/sound/effect/" + name + ".mp3";
        },

        getHitData: function (skillType) {
            var hitData = null;
            if (skillType) {
                if (skillType === mc.const.SKILL_TYPE_ACTIVE) {
                    hitData = {
                        attackCount: this._data["skillActiveHit"],
                        attackSound: this._data["skillActiveSound"],
                        attackHitEffect: this._data["skillActiveHitEffect"],
                        attackHitPosition: this._data["skillActiveHitPosition"]
                    };
                } else if (skillType === mc.const.SKILL_TYPE_AUTO_CAST) {
                    hitData = {
                        attackCount: this._data["skillAutoHit"],
                        attackSound: this._data["skillAutoSound"],
                        attackHitEffect: this._data["skillAutoHitEffect"],
                        attackHitPosition: this._data["skillAutoHitPosition"]
                    };
                }
            } else {
                hitData = {
                    attackCount: this._data["attackHit"],
                    attackSound: this._data["attackSound"],
                    attackHitEffect: this._data["attackHitEffect"],
                    attackHitPosition: this._data["attackHitPosition"]
                };
            }
            return hitData;
        },

        getData: function () {
            return this._data;
        }

    });

    var _getIdForKey = function (element) {
        return element.id;
    };
    var _getIndexForKey = function (element) {
        return element.index;
    };
    mc.dictionary = {};
    mc.dictionary.getStageDictByIndex = function (index) {
        if (mc.dictionary.stageMapByIndex[index]) {
            return mc.dictionary.stageMapByIndex[index];
        }
        return null;
    };
    mc.dictionary.getArrayStageDictByChapter = function (chapterIndex) {
        if (mc.dictionary.stageMapByIndex) {
            var dict = mc.dictionary.stageMapByIndex;
            var arr = [];
            for (var key in dict) {
                if (dict[key]["chapterIndex"] === chapterIndex) {
                    arr.push(dict[key]);
                }
            }
            return arr;
        }
        return null;
    };
    mc.dictionary.getSkillByIndex = function (index) {
        if (mc.dictionary.skillMapByIndex[index]) {
            return mc.dictionary.skillMapByIndex[index];
        }
        cc.log("DO NOT FOUND SKILL INDEX: " + index);
        return null;
    };
    mc.dictionary.getEffectByIndex = function (index) {
        if (mc.dictionary.effectMapByIndex[index]) {
            return mc.dictionary.effectMapByIndex[index];
        }
        cc.log("DO NOT FOUND EFFECT INDEX: " + index);
        return null;
    };
    mc.dictionary.getItemByIndex = function (index) {
        if (mc.dictionary.consumableMapByIndex[index]) {
            return mc.dictionary.consumableMapByIndex[index];
        } else if (mc.dictionary.equipmentMapByIndex[index]) {
            return mc.dictionary.equipmentMapByIndex[index];
        }
        cc.log("DO NOT FOUND ITEM INDEX: " + index);
        return null;
    };
    mc.dictionary.getCreatureAssetByIndex = function (index) {
        if (mc.dictionary.creatureAssetByIndex[index]) {
            return mc.dictionary.creatureAssetByIndex[index];
        }
        cc.log("DO NOT FOUND CREATURE_ASSET INDEX: " + index);
        return mc.dictionary.creatureAssetByIndex[0];
    };
    mc.dictionary.getQuestGroupDataById = function (id) {
        if (mc.dictionary.mapQuestGroupById[id]) {
            return mc.dictionary.mapQuestGroupById[id]
        }
        return null;
    };
    mc.dictionary.getQuestDetailByIndex = function (index) {
        if (mc.dictionary.questMapByIndex[index]) {
            return mc.dictionary.questMapByIndex[index];
        }
        return null;
    };
    mc.dictionary.getItemShopById = function (shopId) {
        if (mc.dictionary.itemShopMapById[shopId]) {
            return mc.dictionary.itemShopMapById[shopId];
        }
        return null;
    };
    mc.dictionary.getHeroDictByIndex = function (index) {
        if (mc.dictionary.heroInfoMapByIndex[index]) {
            return mc.dictionary.heroInfoMapByIndex[index];
        }
        cc.log("DO NOT FOUND HERO INDEX: " + index);
        return null;
    };
    mc.dictionary.getCreatureDictByIndex = function (index) {
        if (mc.dictionary.heroInfoMapByIndex[index]) {
            return mc.dictionary.heroInfoMapByIndex[index];
        } else if (mc.dictionary.monsterMap[index]) {
            return mc.dictionary.monsterMap[index];
        }
        cc.log("DO NOT FOUND CREATURE INDEX: " + index);
        return null;
    };
    mc.dictionary.getHeroLevelByHeroExp = function (currLvl, extraHeroExp, rank) {
        var arrExp = mc.dictionary.mapHeroExpInfo["heroExpByLevelIndex"];
        var level = 1;
        var exp = 0;
        var usedExp = 0;
        var remain = 0;
        var i = 0;
        for (; i < arrExp.length; i++) {
            if (currLvl <= i) {
                usedExp = exp;
                exp += arrExp[i];
            }
            if (extraHeroExp < exp) {
                level = i;
                remain = extraHeroExp - usedExp;
                break;
            }
        }
        var maxLv = mc.const.MAX_HERO_LEVEL_BY_RANK[rank];
        if (maxLv <= level || (i === arrExp.length)) {
            level = maxLv;
            remain = 0;
        }
        return {level: level, remain: remain};
    };
    mc.dictionary.getHeroExpByHeroLevel = function (heroLevel) {
        var arrExp = mc.dictionary.mapHeroExpInfo["heroExpByLevelIndex"];
        if (heroLevel < 0 || heroLevel > arrExp.length) {
            return -1;
        }
        return arrExp[heroLevel - 1];
    };
    mc.dictionary.getRecipeLvlUpHeroByItem = function (itemIndex) {
        var recipe = mc.dictionary.mapRecipeByItemIndex["levelUpHeroByItems"];
        if (recipe) {
            return recipe[itemIndex];
        }
        return null;
    };
    mc.dictionary.getRecipeLvlUpHeroByHero = function (rank) {
        var recipe = mc.dictionary.mapRecipeByItemIndex["levelUpHeroByHeroes"];
        if (recipe) {
            return recipe[rank];
        }
        return null;
    };
    mc.dictionary.getBonusStatsOfEquipment = function (itemInfo, key) {
        var itemDict = mc.dictionary.equipmentMapByIndex[mc.ItemStock.getItemIndex(itemInfo)];
        if (itemDict) {
            var maxVal = 0;
            var maxKey = null;
            var arrKey = ['atk', 'mag', 'hp', 'def', 'res', 'spd'];
            for (var i = 0; i < arrKey.length; i++) {
                var val = itemDict[arrKey[i]];
                if (val > maxVal) {
                    maxVal = val;
                    maxKey = arrKey[i];
                }
            }
            if (key === maxKey) {
                var statsMap = mc.dictionary.mapRecipeByItemIndex["equipBonusStatsMap"];
                return statsMap[mc.ItemStock.getItemLevel(itemInfo) + "/" + mc.ItemStock.getItemRank(itemInfo)][maxKey];
            }
        }
        return 0;
    };
    mc.dictionary.getRecipeLvlUpItem = function (itemInfo) {
        var rank = mc.ItemStock.getItemRank(itemInfo);
        var level = mc.ItemStock.getItemLevel(itemInfo) + 1;
        var recipeMap = mc.dictionary.mapRecipeByItemIndex["levelUpEquipmentsLT3"];
        if (rank >= 3) {
            recipeMap = mc.dictionary.mapRecipeByItemIndex["levelUpEquipmentsGT3"];
        }
        return recipeMap[level];
    };
    mc.dictionary.getRecipeValueSameElemental = function (recipe) {
        return recipe.sameElementals;
    };
    mc.dictionary.getRecipeValueDiffElemental = function (recipe) {
        return recipe.differentElementals;
    };
    mc.dictionary.getRecipeZenCostPerSlotBook = function (recipe) {
        return recipe.costPerSlot;
    };
    mc.dictionary.getAllRecipeInvolveHero = function () {
        return mc.dictionary.mapRecipeByItemIndex["evolveHeroes"];
    };
    mc.dictionary.getExtendInvolveHeroMaterial = function (rank, element) {
        element && (element = element.toLowerCase());
        var material = null;
        var extendMap = mc.dictionary.mapRecipeByItemIndex["evolveHeroExtends"];
        for (var key in extendMap) {
            var strs = key.split('/');
            if (strs[0].toLowerCase() === element &&
                parseInt(strs[1]) === rank) {
                material = extendMap[key]["material"];
                break;
            }
        }
        return material;
    };
    mc.dictionary.getRecipeInvolveHeroByParam = function (classGroup, rank, element) {
        var mapRecipe = mc.dictionary.getAllRecipeInvolveHero();
        var recipe = null;
        for (var recipeId in mapRecipe) {
            var tempRecipe = mapRecipe[recipeId];
            if (mc.dictionary.getRecipeClassGroup(tempRecipe) === classGroup &&
                mc.dictionary.getRecipeRank(tempRecipe) === rank) {
                recipe = tempRecipe;
                break;
            }
        }
        if (recipe) { // inject the extend material.
            recipe.ext_material = mc.dictionary.getExtendInvolveHeroMaterial(rank, element);
        }
        return recipe;
    };
    mc.dictionary.getRecipeRank = function (recipe) {
        return recipe.rank;
    };
    mc.dictionary.getRecipeClassGroup = function (recipe) {
        return recipe.classGroup;
    };
    mc.dictionary.getRecipeCost = function (recipe) {
        return recipe.cost;
    };
    mc.dictionary.getRecipeZenCost = function (recipe) {
        var str = recipe.zenCost || recipe.cost || 0;
        if (str) {
            return mc.ItemStock.getItemQuantity(mc.ItemStock.createJsonItemFromStr(str));
        }
        return 0;
    };
    mc.dictionary.getRecipeBlessCost = function (recipe) {
        return recipe.blessCost || recipe.cost || 0;
    };
    mc.dictionary.getSuccessRatePercent = function (recipe) {
        return recipe.successRatePercent;
    };
    mc.dictionary.getRecipeMaterialMap = function (recipe) {
        var arrStrRecipe = null;
        if (recipe.material) {
            arrStrRecipe = recipe.material.split('#');
        }
        if (!arrStrRecipe && recipe.combineMaterial) {
            arrStrRecipe = recipe.combineMaterial.split('#');
        }
        if (recipe.ext_material) {
            !arrStrRecipe && (arrStrRecipe = []);
            arrStrRecipe.push(recipe.ext_material);
        }
        var mapItem = {};
        if (arrStrRecipe) {
            for (var i = 0; i < arrStrRecipe.length; i++) {
                var strs = arrStrRecipe[i].split('/');
                var index = parseInt(strs[0]);
                var no = parseInt(strs[1]);
                mapItem[index] = mc.ItemStock.createJsonItemInfo(index, no);
            }
        }
        return mapItem;
    };
    mc.dictionary.getDisarmEquipRecipeByAttr = function (level, rank) {
        rank = "rank" + rank;
        var disarmEquipMap = mc.dictionary.mapRecipeByItemIndex["dissembleEquips"];
        if (disarmEquipMap[level]) {
            var strRecipe = disarmEquipMap[level][rank];
            return strRecipe ? mc.ItemStock.createArrJsonItemFromStr(strRecipe) : null;
        }
        return null;
    };
    mc.dictionary.getDisarmHeroRecipeBonus = function (level, element) {
        if (element) {
            element = element.toLowerCase();
            var disarmHeroMap = mc.dictionary.mapRecipeByItemIndex["disassembleHeroes"];
            if (disarmHeroMap && disarmHeroMap[level]) {
                var strRecipe = disarmHeroMap[level][element];
                return strRecipe ? mc.ItemStock.createArrJsonItemFromStr(strRecipe) : null;
            }
        }
    };
    mc.dictionary.getRecipeMaterialOptionMap = function (recipe) {
        var arrStrRecipe = null;
        if (recipe) {
            arrStrRecipe = recipe.split('#');
        }
        var mapItem = {};
        if (arrStrRecipe) {
            for (var i = 0; i < arrStrRecipe.length; i++) {
                var strs = arrStrRecipe[i].split('/');
                var index = parseInt(strs[0]);
                var no = parseInt(strs[1]);
                mapItem[index] = mc.ItemStock.createJsonItemInfo(index, no);
            }
        }
        return mapItem;
    };
    mc.dictionary.getSummonPackage = function (packageIndex) {
        if (mc.dictionary.summonPackageMapByIndex) {
            return mc.dictionary.summonPackageMapByIndex[packageIndex];
        }
        return null;
    };
    mc.dictionary.getMiningRuleByChapterIndex = function (chapterIndex) {
        if (mc.dictionary.miningRule) {
            return mc.dictionary.miningRule["chapterList"][chapterIndex];
        }
        return null;
    };
    mc.dictionary.getMiningBonusListByHeroRank = function (heroRank) {
        if (mc.dictionary.miningRule) {
            return mc.dictionary.miningRule["bonusList"][heroRank - 1];
        }
        return null;
    };
    mc.dictionary.getArrChallengeStageByGroupIndex = function (groupIndex) {
        return bb.collection.filterBy(mc.dictionary.arrChallengeStage, function (dict) {
            return dict["groupIndex"] === groupIndex;
        }, groupIndex);
    };
    mc.dictionary.getChallengeStageByIndex = function (stageIndex) {
        var arrChallengeStage = mc.dictionary.arrChallengeStage;
        var challengeStage = bb.collection.findBy(arrChallengeStage, function (challengeStage, stageIndex) {
            return challengeStage["index"] === stageIndex;
        }, stageIndex);
        return challengeStage;
    };
    mc.dictionary.getArrayBloodCastleStageDataByLevelIndex = function (index) {
        return mc.dictionary.mapBloodCastleStagesByLvl[index];
    };
    mc.dictionary.getInAppItemByProvider = function (provider, position) {
        var arrActiveInApp = [];
        for (var id in mc.dictionary.IAPMap) {
            var inappItem = mc.dictionary.IAPMap[id];
            if (inappItem && inappItem["provider"] === provider && inappItem["active"]) {
                if (!position || position === inappItem["position"]) {
                    arrActiveInApp.push(inappItem);
                }
            }
        }
        if (arrActiveInApp.length > 0) {
            arrActiveInApp.sort(function (inapp1, inapp2) {
                return inapp1["order"] - inapp2["order"];
            });
        }
        return arrActiveInApp;
    };

    mc.dictionary.getInAppItemActiveById = function (packageId) {
        var arrActiveInApp = [];
        var arrActiveInAppId = [];
        for (var id in mc.dictionary.IAPMap) {
            if (packageId && packageId === id) {
                return mc.dictionary.IAPMap[id];
            }
        }
        return null;
    };
    mc.dictionary.getWorldBossInfoByIndex = function (bossIndex) {
        var arrWorldBossInfo = mc.dictionary.worldBossMap["bossList"];
        var mapWorldBossInfo = bb.utility.arrayToMap(arrWorldBossInfo, function (worldBossInfo) {
            return worldBossInfo["index"];
        });
        return mapWorldBossInfo[bossIndex];
    };
    mc.dictionary.getAllInAppItemIdActive = function () {
        var arrActiveInApp = [];
        var arrActiveInAppId = [];
        for (var id in mc.dictionary.IAPMap) {
            var inappItem = mc.dictionary.IAPMap[id];
            if (inappItem && inappItem["provider"] && inappItem["active"]) {
                arrActiveInApp.push(inappItem);
            }
        }
        if (arrActiveInApp.length > 0) {
            arrActiveInApp.sort(function (inapp1, inapp2) {
                return inapp1["order"] - inapp2["order"];
            });
            for (var i = 0; i < arrActiveInApp.length; i++) {
                arrActiveInAppId.push(arrActiveInApp[i]["id"]);
            }
        }
        return arrActiveInAppId;
    };

    mc.dictionary.getAllInAppItemIdActive = function () {
        var arrActiveInApp = [];
        var objsActiveInAppId = {};
        for (var id in mc.dictionary.IAPMap) {
            var inappItem = mc.dictionary.IAPMap[id];
            if (inappItem && inappItem["provider"] && inappItem["active"]) {
                arrActiveInApp.push(inappItem);
            }
        }
        if (arrActiveInApp.length > 0) {
            arrActiveInApp.sort(function (inapp1, inapp2) {
                return inapp1["order"] - inapp2["order"];
            });
            for (var i = 0; i < arrActiveInApp.length; i++) {
                objsActiveInAppId[arrActiveInApp[i]["id"]] = {};
            }
        }
        return objsActiveInAppId;
    };

    mc.dictionary.getI18String = function (code) {
        if (mc.dictionary.i18GUIStr) {
            return mc.dictionary.i18GUIStr[code] || code;
        }
        return code;
    };

    mc.dictionary.getI18nMsg = function (code) {
        if (mc.dictionary.i18n) {
            return mc.dictionary.i18n[code] || code;
        }
        return code;
    };

    mc.dictionary.getGUIString = function (code) {
        var mapStr = mc.dictionary.getI18String("arrGUITxt");
        var mapStrElement = mapStr[code];
        return mapStrElement || code;
    };

    mc.dictionary.getExceptionString = function (code) {
        var mapStr = mc.dictionary.getI18String("arrExceptionTxt");
        return mapStr[code] || code;
    };

    mc.dictionary.cleanData = function () {
        cc.log("Do nothing: mc.dictionary.cleanData");
    };

    mc.dictionary.loadLanguage = function (callback) {
        var lan = mc.storage.readSetting()["language"];
        var arrRes = [
            "res/json/data/language/gui-i18" + lan + ".json",
            "res/json/data/language/" + lan + ".json",
            "res/json/data/language/news.json"
        ];
        var preload = function () {
            mc.dictionary.i18GUIStr = cc.loader.getRes(arrRes[0]);
            mc.dictionary.i18n = cc.loader.getRes(arrRes[1]);
            mc.dictionary.news = cc.loader.getRes(arrRes[2]);
            cc.loader.release(arrRes[0]);
            cc.loader.release(arrRes[1]);
            cc.loader.release(arrRes[2]);
        };
        if (!cc.sys.isNative) {
            cc.loader.load(arrRes, function () {
            }, function () {
                preload();
                callback && callback();
            });
        } else {
            preload();
            callback && callback();
        }
    };

    mc.dictionary.isSupportFunction = function (funcCode, isSupportVip) {
        if (mc.dictionary.gameFunctionByCode) {
            var funcInfo = mc.dictionary.gameFunctionByCode[funcCode];
            if (funcInfo && funcInfo["enable"]) {
                return !isSupportVip ? funcInfo["enable"] >= 1 : funcInfo["enable"] >= 2;
            }
        }
        return false;
    };

    mc.dictionary.getVipFunctionValue = function (funcCode) {
        if (mc.dictionary.vipFunctionValueByCode && mc.dictionary.vipFunctionValueByCode[funcCode]) {
            return mc.dictionary.vipFunctionValueByCode[funcCode]["value"];
        }
        return 0;
    };

    mc.dictionary.loadData = function () {
        var datas = [
            res.data_monsters_json,
            res.data_stages_json,
            res.data_skills_json,
            res.data_effects_json,
            res.data_equipment_json,
            res.data_consumable_json,
            res.data_creature_asset_json,
            res.data_upgrade_system_json,
            res.data_hero_exp_json,
            res.data_heroes_json,
            res.data_quest_group_json,
            res.data_quests_json,
            res.data_shop_dictionary_json,
            res.data_shop_daily_func_refresh_json,
            res.data_summon_package_json,
            res.data_mining_rule_json,
            res.data_challenge_event_json,
            res.data_blood_castle_json,
            res.data_dynamic_daily_event_json,
            res.data_IAP_json,
            res.data_world_boss_json,
            res.data_lucky_round_json,
            res.data_arena_rewards_json,
            res.data_config_json
        ];

        var i = 0;
        var arrMonster = cc.loader.getRes(datas[i]);
        i++;
        var arrStage = cc.loader.getRes(datas[i]);
        i++;
        var arrSkill = cc.loader.getRes(datas[i]);
        i++;
        var arrEffect = cc.loader.getRes(datas[i]);
        i++;
        var arrEquipment = cc.loader.getRes(datas[i]);
        i++;
        var arrConsumable = cc.loader.getRes(datas[i]);
        i++;
        var arrCreatureAnimation = cc.loader.getRes(datas[i]);
        i++;
        var mapRecipeByItemIndex = cc.loader.getRes(datas[i]);
        i++;
        var mapHeroExpInfo = cc.loader.getRes(datas[i]);
        i++;
        var arrHeroes = cc.loader.getRes(datas[i]);
        i++;
        var arrQuestGroup = cc.loader.getRes(datas[i]);
        i++;
        var arrQuest = cc.loader.getRes(datas[i]);
        i++;
        var arrItemShop = cc.loader.getRes(datas[i]);
        i++;
        var arrBuyFuncList = cc.loader.getRes(datas[i]);
        i++;
        var arrSummonPackage = cc.loader.getRes(datas[i]);
        i++;
        var miningRule = cc.loader.getRes(datas[i]);
        i++;
        var arrChallengeEvent = cc.loader.getRes(datas[i]);
        i++;
        var mapBloodCastle = cc.loader.getRes(datas[i]);
        i++;
        var arrDynamicDailyEvent = cc.loader.getRes(datas[i]);
        i++;
        var arrIAP = cc.loader.getRes(datas[i]);
        i++;
        var mapWorldBoss = cc.loader.getRes(datas[i]);
        i++;
        var mapSpin = cc.loader.getRes(datas[i]);
        i++;
        var mapArena = cc.loader.getRes(datas[i]);
        i++;
        var config = cc.loader.getRes(datas[i]);
        i++;

        var _parseGameConfig = function () {
            mc.dictionary.gameFunctionByCode = bb.utility.arrayToMap(config["unblockFunctionList"], _getIdForKey);
            mc.dictionary.vipFunctionValueByCode = bb.utility.arrayToMap(config["vipTableList"], _getIdForKey);

            var _const = bb.utility.arrayToMap(config["constantList"], _getIdForKey);
            mc.const.MAX_ARENA_TICKET = _const["max_arena_ticket"]["value"];
            mc.const.PRODUCTION_SPIN_PER_SECOND = _const["spin_ticket_per_second"]["value"];
            mc.const.MAX_SPIN_TICKET = _const["max_spin_ticket"]["value"];
            mc.const.MAX_DAILY_REWARD = _const["max_daily_reward"]["value"];
        };
        _parseGameConfig();

        mc.dictionary.worldBossMap = mapWorldBoss;
        if (mc.dictionary.worldBossMap["topDameRewardList"]) {
            mc.dictionary.worldBossMap["topDameRewardList"].push({
                "top": 0,
                "bossIndex": 9998,
                "reward": "11999/30#11051/20"
            });
        }
        mc.dictionary.spinData = mapSpin;

        mc.dictionary.guildData = cc.loader.getRes(res.data_guild_json);
        mc.dictionary.guildBossData = cc.loader.getRes(res.data_guild_boss_json);
        mc.dictionary.rankingHeroesData = cc.loader.getRes(res.data_ranking_heroes_json);
        mc.dictionary.battleRelicData = cc.loader.getRes(res.data_battle_relic_json);


        mc.dictionary.campaignBattleRules = cc.loader.getRes(res.data_campaign_battlte_rules_json);
        mc.dictionary.guildBossRulesData = cc.loader.getRes(res.data_guild_boss_rules_json);
        mc.dictionary.chaosRulesData = cc.loader.getRes(res.data_chaos_rules_json);
        mc.dictionary.worldBossRulesData = cc.loader.getRes(res.data_world_boss_rules_json);
        mc.dictionary.clanRankingRulesData = cc.loader.getRes(res.data_clan_ranking_rules_json);

        mc.dictionary.monsterMap = bb.utility.arrayToMap(arrMonster, _getIndexForKey);
        mc.dictionary.stageMapByIndex = bb.utility.arrayToMap(arrStage, _getIndexForKey);
        mc.dictionary.skillMapByIndex = bb.utility.arrayToMap(arrSkill, _getIndexForKey);
        mc.dictionary.effectMapByIndex = bb.utility.arrayToMap(arrEffect, _getIndexForKey);
        mc.dictionary.equipmentMapByIndex = bb.utility.arrayToMap(arrEquipment, _getIndexForKey);
        mc.dictionary.consumableMapByIndex = bb.utility.arrayToMap(arrConsumable, _getIndexForKey);
        mc.dictionary.questMapByIndex = bb.utility.arrayToMap(arrQuest, _getIndexForKey);
        mc.dictionary.summonPackageMapByIndex = bb.utility.arrayToMap(arrSummonPackage, _getIndexForKey);
        mc.dictionary.miningRule = miningRule;
        mc.dictionary.mapRecipeByItemIndex = mapRecipeByItemIndex;
        mc.dictionary.mapHeroExpInfo = mapHeroExpInfo;
        mc.dictionary.heroInfoMapByIndex = bb.utility.arrayToMap(arrHeroes, _getIndexForKey);
        mc.dictionary.mapQuestGroupById = {};
        for (var i = 0; i < arrQuestGroup.length; i++) {
            var questGroup = arrQuestGroup[i];
            questGroup.order = i;
            mc.dictionary.mapQuestGroupById[questGroup.id] = questGroup;
        }

        mc.dictionary.itemShopMapById = bb.utility.arrayToMap(arrItemShop, function (obj) {
            return obj["shopId"];
        });
        mc.dictionary.buyFunctionMapById = bb.utility.arrayToMap(arrBuyFuncList, function (obj) {
            return obj["function"];
        });

        mc.dictionary.getAllEquipmentFromData = function () {
            return arrEquipment;
        };

        mc.dictionary.getAllConsumableFromData = function () {
            return arrConsumable;
        };

        mc.dictionary.getAllMonster = function () {
            return arrMonster;
        }

        arrCreatureAnimation = bb.utility.cloneJSON(arrCreatureAnimation);
        mc.dictionary.creatureAssetByIndex = {};
        for (var i = 0; i < arrCreatureAnimation.length; i++) {
            var animationData = arrCreatureAnimation[i];
            mc.dictionary.creatureAssetByIndex[animationData.index] = new mc.CreatureAssetDesc(animationData);
        }

        mc.dictionary.arrChallengeStage = arrChallengeEvent;

        mc.dictionary.mapBloodCastleStagesByLvl = {};
        var arrBloodCastleStage = mapBloodCastle["bloodCastleList"];
        for (var i = 0; i < arrBloodCastleStage.length; i++) {
            var stage = arrBloodCastleStage[i];
            var lvlIndex = stage["index"];
            if (!mc.dictionary.mapBloodCastleStagesByLvl[lvlIndex]) {
                mc.dictionary.mapBloodCastleStagesByLvl[lvlIndex] = [];
            }
            mc.dictionary.mapBloodCastleStagesByLvl[lvlIndex].push(stage);
        }

        mc.dictionary.arrDynamicDailyEvent = bb.utility.arrayToMap(arrDynamicDailyEvent, function (obj) {
            return obj["seasonEventID"];
        });
        mc.dictionary.IAPMap = bb.utility.arrayToMap(arrIAP, function (pack) {
            return mc.PaymentSystem.getGeneratedItemId(pack);
        });

        //var Base64 = bb.base64Object();
        //var str = test["content"];
        //var arrPick = [259,179,89];
        //for(var i = 0; i < arrPick.length; i++ ){
        //    var suffix = str.slice(0,arrPick[i]);
        //    var prefix = str.slice(arrPick[i],str.length);
        //    str = prefix + suffix;
        //}
        //str = Base64.decode(str);
        //cc.log(JSON.parse(str));

        //var en = XXTEA.encryptToBase64("Hello world", "abcxyz");
        //cc.log(en);
        //var de = XXTEA.decryptFromBase64(en, "abcxyz");
        //cc.log(de);

        mc.dictionary.arenaDictionary = function () {
            var result = {};
            parseArenaLeagueRewards = function (json) {
                var result = {};
                if (cc.isString(json)) {
                    json = JSON.parse(json);
                }
                var rewardsList = json["topRewardList"];
                var leagueList = json["leagueList"];
                if (rewardsList) {
                    for (var i in rewardsList) {
                        var rewardsInfo = rewardsList[i];
                        if (!result[rewardsInfo["league"]]) {
                            result[rewardsInfo["league"]] = {league: rewardsInfo["league"], listGroupRewards: []};
                        }
                        result[rewardsInfo["league"]].listGroupRewards.push(rewardsInfo);
                    }
                }
                if (leagueList) {
                    for (var j in leagueList) {
                        var league = leagueList[j];
                        if (!result[league["league"]]) {
                            result[league["league"]] = {league: league["league"], listGroupRewards: []};
                        }
                        result[league["league"]].info = league;
                    }
                }

                return result;
            };
            result.arena = mapArena;
            result.leagueMap = parseArenaLeagueRewards(result.arena);
            var array = bb.utility.mapToArray(result.leagueMap);
            array.sort(function (a, b) {
                return a["info"]["arenaPointsRequire"] - b["info"]["arenaPointsRequire"];
            });
            result.dataRank = bb.collection.createArray(array.length, function (index) {
                return array[index]["info"]["name"];
            });
            result.dataRankCode = bb.collection.createArray(array.length, function (index) {
                return {index: index, league: array[index]["info"]["league"], name: array[index]["info"]["name"]};
            });

            result.mapRank = bb.utility.arrayToMap(result.dataRankCode, function (child) {
                return child.index;
            });
            result.mapLeague = bb.utility.arrayToMap(result.dataRankCode, function (child) {
                return child.league;
            });
            return result;
        }();

        mc.dictionary.illusionDict = (function () {
            var data, stageNum;
            var prepare = function () {
                var illusion = cc.loader.getRes(res.data_illusion_json);
                data = {};
                stageNum = illusion["illusionRewardList"].length;
                data = bb.utility.toMaps(illusion["illusionRewardList"], "index");
                for (var dataKey in data) {
                    var firstTimeRewards = data[dataKey]["firstTimeRewards"].split("#");
                    var randomRewards = data[dataKey]["randomRewards"].split("#");
                    var monsters = data[dataKey]["team"].split("#");
                    data[dataKey]["team"] = monsters;

                    var firstTimeRewards_extract = [];
                    var randomRewards_extract = [];
                    //extract item infomations
                    var j = 0;
                    for (j = 0; j < firstTimeRewards.length; j++) {
                        var reward = firstTimeRewards[j];
                        var strs = reward.split('/');
                        var itemInfo = mc.ItemStock.createJsonItemInfo(strs[0], strs[1]);
                        itemInfo["isFirstTimeReward"] = true;
                        firstTimeRewards_extract.push(itemInfo);
                    }
                    for (j = 0; j < randomRewards.length; j++) {
                        var reward = randomRewards[j];
                        var strs = reward.split('/');
                        var itemInfo = mc.ItemStock.createJsonItemInfo(strs[0], strs[1]);
                        randomRewards_extract.push(itemInfo);
                    }
                    //gán lại sau khi extract
                    data[dataKey]["firstTimeRewards"] = firstTimeRewards_extract;
                    data[dataKey]["randomRewards"] = randomRewards_extract;
                    //merge reward
                    data[dataKey]["rewardItems"] = firstTimeRewards_extract.concat(randomRewards_extract);
                }
                cc.loader.release(res.data_illusion_json);
            };
            prepare();
            return {
                getDataByStageIndex: function (stageIndex) {
                    return data[stageIndex];
                },

                getData: function () {
                    return data;
                },

                getStageNumber: function () {
                    return stageNum;
                }
            };
        })();

        if (mc.const.TEST_TEXT_MISSING) {
            var arrRes = ["res/json/data/language/en.json",
                "res/json/data/language/vi.json"];
            cc.loader.load(arrRes, function () {
            }, function (datas) {
                var i18en = cc.loader.getRes(arrRes[0]);
                var i18vi = cc.loader.getRes(arrRes[1]);
                var _checkMissingKey = function (keyName, obj) {
                    if (obj && obj[keyName]) {
                        if (!i18en[obj[keyName]]) {
                            cc.log("missing [EN]" + obj[keyName]);
                        }
                        if (!i18vi[obj[keyName]]) {
                            cc.log("missing [VI]" + obj[keyName]);
                        }
                    }
                };

                var _checkDataMap = function (aliasName, arrKey, mapObj) {
                    cc.log("Check " + aliasName + "............................");
                    for (var keyId in mapObj) {
                        var obj = mapObj[keyId];
                        for (var i = 0; i < arrKey.length; i++) {
                            _checkMissingKey(arrKey[i], obj);
                        }
                    }
                };

                _checkDataMap('Equipment', ['name', 'textCaution'], mc.dictionary.equipmentMapByIndex);
                _checkDataMap('Consumable', ['name', 'desc'], mc.dictionary.consumableMapByIndex);
                _checkDataMap('Skill', ['name', 'desc'], mc.dictionary.skillMapByIndex);
                _checkDataMap('Quest', ['name', 'desc'], mc.dictionary.questMapByIndex);

            });

        }
    };
}());