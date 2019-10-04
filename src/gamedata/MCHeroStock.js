/**
 * Created by long.nguyen on 5/16/2017.
 */
mc.HeroStock = bb.Class.extend({

    ctor: function () {
        this._super();
        this._heroMap = {};
    },

    updateHero: function (heroInfo) {
        if (heroInfo) {
            this._heroMap[heroInfo.id] = heroInfo;
            mc.GameData.heroInfoChangerCollection.getChanger(heroInfo.id).setData({
                level: heroInfo.level,
                exp: heroInfo.exp
            });
        }
    },

    updateArrayHero: function (heroes) {
        bb.utility.arrayTraverse(heroes, function (heroInfo) {
            this.updateHero(heroInfo);
        }.bind(this));
        mc.GameData.notifySystem.shouldFilterHeroClassAndGroup = true;
    },

    removeHeroById: function (heroId) {
        if (heroId) {
            if (this._heroMap[heroId]) {
                delete this._heroMap[heroId];
            }
        }
    },

    getHeroById: function (id) {
        return this._heroMap[id];
    },

    getHeroList: function (filterFunc) {
        var arr = bb.utility.mapToArray(this._heroMap);
        if (filterFunc) {
            arr = bb.utility.arrayFilter(arr, filterFunc);
        }
        return arr;
    },

    getHeroMap: function () {
        return this._heroMap;
    }

});

mc.HeroStock.createJsonHeroInfo = function (id, index, level) {
    var heroInfo = {
        "id": id,
        "index": index,
        "level": level
    };
    var attr = mc.HeroStock.getHeroTotalAttrByLevel(heroInfo, level);
    for (var key in attr) {
        heroInfo[key] = attr[key];
    }
    return heroInfo;
};

mc.HeroStock.getHeroId = function (heroInfo) {
    return heroInfo["id"];
};
mc.HeroStock.getHeroName = function (heroInfo) {
    return mc.dictionary.getI18nMsg(heroInfo["name"]);
};
mc.HeroStock.getHeroLevel = function (heroInfo) {
    return heroInfo["level"] || 1;
};
mc.HeroStock.getHeroRank = function (heroInfo) {
    if (!heroInfo.rank) {
        var local = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
        return local["rank"];
    }
    return heroInfo["rank"];
};
mc.HeroStock.getHeroRecipe = function (heroInfo) {
    return heroInfo ? heroInfo["recipe"] : null;
};
mc.HeroStock.getHeroExp = function (heroInfo) {
    return {curr: heroInfo["exp"], total: heroInfo["maxExp"]};
};
mc.HeroStock.getHeroAttack = function (heroInfo) {
    return heroInfo["atk"];
};
mc.HeroStock.getHeroMagic = function (heroInfo) {
    return heroInfo["mag"];
};
mc.HeroStock.getHeroSpeed = function (heroInfo) {
    return heroInfo["spd"];
};
mc.HeroStock.getHeroDefense = function (heroInfo) {
    return heroInfo["def"];
};
mc.HeroStock.getHeroResistant = function (heroInfo) {
    return heroInfo["res"];
};
mc.HeroStock.getHeroHp = function (heroInfo) {
    return heroInfo["hp"];
};
mc.HeroStock.getItemEquippingValue = function (heroInfo, attrKey) {
    var value = 0;
    var mapEquipping = mc.GameData.itemStock.getMapEquippingItemByHeroId(mc.HeroStock.getHeroId(heroInfo));
    if (mapEquipping) {
        for (var slotId in mapEquipping) {
            var itemInfo = mapEquipping[slotId];
            if (itemInfo) {
                if (attrKey === "atk") {
                    value += mc.ItemStock.getItemAttack(itemInfo);
                } else if (attrKey === "def") {
                    value += mc.ItemStock.getItemDefense(itemInfo);
                } else if (attrKey === "res") {
                    value += mc.ItemStock.getItemResistant(itemInfo);
                } else if (attrKey === "hp") {
                    value += mc.ItemStock.getItemHp(itemInfo);
                } else if (attrKey === "mag") {
                    value += mc.ItemStock.getItemMagic(itemInfo);
                } else if (attrKey === "spd") {
                    value += mc.ItemStock.getItemSpeed(itemInfo);
                }
            }
        }
    }
    return value;
};

mc.HeroStock.getPassiveSkillValueAttr = function (heroInfo) {
    var value = 0;
    var creature = new mc.Creature();
    creature.setInfo(new mc.CreatureInfo().copyHeroInfo(heroInfo));
    creature.calculatePersonalInfo();
    creature.calculatePassiveSkill();
    creature.updateInfo();
    return {
        atk: Math.round(creature.getTotalAtk()) - mc.HeroStock.getHeroAttack(heroInfo),
        def: Math.round(creature.getTotalDef()) - mc.HeroStock.getHeroDefense(heroInfo),
        res: Math.round(creature.getTotalRes()) - mc.HeroStock.getHeroResistant(heroInfo),
        hp: Math.round(creature.getTotalMaxHp()) - mc.HeroStock.getHeroHp(heroInfo),
        mag: Math.round(creature.getTotalMag()) - mc.HeroStock.getHeroMagic(heroInfo),
        spd: Math.round(creature.getTotalSpeed()) - mc.HeroStock.getHeroSpeed(heroInfo)
    };
};

mc.HeroStock.getHeroTotalAttack = function (heroInfo) {
    var atk = mc.HeroStock.getHeroAttack(heroInfo) + mc.HeroStock.getItemEquippingValue(heroInfo, "atk");
    return atk;
};
mc.HeroStock.getHeroTotalMagic = function (heroInfo) {
    var mag = mc.HeroStock.getHeroMagic(heroInfo) + mc.HeroStock.getItemEquippingValue(heroInfo, "mag");
    return mag;
};
mc.HeroStock.getHeroTotalSpeed = function (heroInfo) {
    var atk = mc.HeroStock.getHeroSpeed(heroInfo) + mc.HeroStock.getItemEquippingValue(heroInfo, "spd");
    return atk;
};
mc.HeroStock.getHeroTotalDefense = function (heroInfo) {
    var def = mc.HeroStock.getHeroDefense(heroInfo) + mc.HeroStock.getItemEquippingValue(heroInfo, "def");
    return def;
};
mc.HeroStock.getHeroTotalResistant = function (heroInfo) {
    var res = mc.HeroStock.getHeroResistant(heroInfo) + mc.HeroStock.getItemEquippingValue(heroInfo, "res");
    return res;
};
mc.HeroStock.getHeroTotalHp = function (heroInfo) {
    var hp = mc.HeroStock.getHeroHp(heroInfo) + mc.HeroStock.getItemEquippingValue(heroInfo, "hp");
    return hp;
};
mc.HeroStock.getHeroBattlePower = function (heroInfo) {
    var allItempower = 0;
    var itemAtk = 0, itemMag = 0, itemDef = 0, itemRes = 0, itemSpd = 0, itemHp = 0;
    var mapEquipping = mc.GameData.itemStock.getMapEquippingItemByHeroId(mc.HeroStock.getHeroId(heroInfo));
    if (mapEquipping) {
        for (var slotId in mapEquipping) {
            var itemInfo = mapEquipping[slotId];
            if (itemInfo) {
                itemAtk += mc.ItemStock.getItemAttack(itemInfo);
                itemMag += mc.ItemStock.getItemMagic(itemInfo);
                itemHp += mc.ItemStock.getItemHp(itemInfo);
                itemDef += mc.ItemStock.getItemDefense(itemInfo);
                itemRes += mc.ItemStock.getItemResistant(itemInfo);
                itemSpd += mc.ItemStock.getItemSpeed(itemInfo);
                allItempower += mc.ItemStock.getItemBattlePower(itemInfo);
            }
        }
    }

    var allSkillPower = 0;
    var skillList = mc.HeroStock.getHeroSkillList(heroInfo);
    if (skillList) {
        for (var s = 0; s < skillList.length; s++) {
            var skillInfo = skillList[s];
            allSkillPower += mc.HeroStock.getSkillBattlePowerOfHero(skillInfo) +
                mc.HeroStock.getSkillLvUpBattlePowerOfHero(skillInfo) * mc.HeroStock.getSkillLevelOfHero(skillInfo);
        }
    }
    var heroPower = Math.round((heroInfo.atk + itemAtk) + (heroInfo.mag + itemMag) + (heroInfo.hp + itemHp) + (heroInfo.def + itemDef)
        + (heroInfo.res + itemRes) + (heroInfo.spd + itemSpd) + heroInfo.crit / 100 * (heroInfo.atk + heroInfo.mag + itemAtk + itemMag) + heroInfo.mpRec);
    heroPower = heroPower * mc.HeroStock.getHeroRank(heroInfo) * 2;
    return allItempower + allSkillPower + Math.round(heroPower);
};
mc.HeroStock.getMonsterBattlePower = function (monsterInfo) {
    var monsterPower = Math.round(monsterInfo.atk + monsterInfo.mag + monsterInfo.hp + monsterInfo.def
        + monsterInfo.res + monsterInfo.spd + monsterInfo.crit * (monsterInfo.atk + monsterInfo.mag) / 100 + monsterInfo.mpRec);
    return monsterPower;
};
mc.HeroStock.getBattlePowerForArrHero = function (arrHeroInfo) {
    var ttPower = 0;
    for (var i = 0; i < arrHeroInfo.length; i++) {
        if (arrHeroInfo[i]) {
            ttPower += mc.HeroStock.getHeroBattlePower(arrHeroInfo[i]);
        }
    }
    return Math.round(ttPower / 1);
};
mc.HeroStock.getBattlePowerForTeamId = function (teamId, teamIndex) {
    var arrHeroId = mc.GameData.teamFormationManager.getTeamFormationByIndex(teamId, teamIndex);
    var arrHeroInfo = [];
    for (var i = 0; i < arrHeroId.length; i++) {
        if (arrHeroId[i] >= 0) {
            arrHeroInfo.push(mc.GameData.heroStock.getHeroById(arrHeroId[i]));
        }
    }
    return mc.HeroStock.getBattlePowerForArrHero(arrHeroInfo);
};
mc.HeroStock.getHeroIndex = function (heroInfo) {
    return heroInfo.index;
};
mc.HeroStock.getHeroClassGroup = function (heroInfo) {
    return heroInfo.classGroup;
};
mc.HeroStock.getHeroBattleRole = function (heroInfo) {
    var battleRole = heroInfo.battleRole;
    if (!battleRole) {
        var heroLocalData = mc.dictionary.getCreatureDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
        heroLocalData && (battleRole = heroLocalData.battleRole);
    }
    return battleRole;
};
mc.HeroStock.isRangerHero = function (heroInfo) {
    var heroLocalData = mc.dictionary.getCreatureDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    if (heroLocalData) {
        return heroLocalData.range === 1;
    }
    return null;
};
mc.HeroStock.isLineHero = function (heroInfo) {
    var heroLocalData = mc.dictionary.getCreatureDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    if (heroLocalData) {
        return heroLocalData.range === 2;
    }
    return null;
};
mc.HeroStock.isMagicHero = function (heroInfo) {
    return mc.HeroStock.getHeroMagic(heroInfo) > 0;
};
mc.HeroStock.getHeroElement = function (heroInfo) {
    var element = heroInfo.element;
    if (!element) {
        var data = mc.dictionary.getCreatureDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
        data && (element = data.element);
    }
    element && (element = element.toLowerCase());
    return element;
};

mc.HeroStock.getHeroSphere = function (heroInfo) {
    var element = mc.HeroStock.getHeroElement(heroInfo);
    var sphere = null;
    var itemStock = mc.GameData.itemStock;
    if (element === mc.const.ELEMENT_FIRE) {
        sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_FIRE_SPHERE))[0];
    } else if (element === mc.const.ELEMENT_WATER) {
        sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_WATER_SPHERE))[0];
    } else if (element === mc.const.ELEMENT_LIGHT) {
        sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_LIGHT_SPHERE))[0];
    } else if (element === mc.const.ELEMENT_EARTH) {
        sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_EARTH_SPHERE))[0];
    } else if (element === mc.const.ELEMENT_DARK) {
        sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_DARK_SPHERE))[0];
    }
    return sphere;
};

mc.HeroStock.getHeroSkillList = function (heroInfo) {
    var skillList = null;
    if (heroInfo) {
        skillList = heroInfo.skillList;
        if (!skillList || skillList.length === 0) {
            var dict = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
            if (dict) {
                if (cc.isString(dict.skillList)) {
                    var strs = dict.skillList.split('#');
                    skillList = [];
                    for (var i = 0; i < strs.length; i++) {
                        skillList.push(parseInt(strs[i]));
                    }
                } else {
                    skillList = dict.skillList;
                }
            }
        }
    }
    return skillList;
};
mc.HeroStock.getHeroOptionsSkillList = function (heroInfo) {
    if (heroInfo) {
        var options = heroInfo["optionList"];
        if (!options) {
            var heroEquips = mc.GameData.itemStock.getMapEquippingItemByHeroId(mc.HeroStock.getHeroId(heroInfo));
            if (heroEquips) {
                options = [];
                for (var i in heroEquips) {
                    if (heroEquips[i]) {
                        var opts = heroEquips[i]["optSkills"];
                        if (opts) {
                            for (var i in opts) {
                                if (opts[i]) {
                                    options.push(opts[i]);
                                }
                            }
                        }
                    }
                }
            }
        }
        var skillList = [];
        if (options) {
            for (var i = 0; i < options.length; i++) {
                skillList.push(mc.CreatureSkill.createJsonSkill(parseInt(options[i]), 1));
            }
        }
        return skillList;
    }
    return null;
};

mc.HeroStock.getHeroSkillPoint = function (heroInfo) {
    return heroInfo.skillPoint;
};
mc.HeroStock.getHeroMaxRank = function (heroInfo) {
    var heroLocalData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    return heroLocalData.maxRank;
};
mc.HeroStock.getHeroMaxLevel = function (heroInfo) {
    return mc.const.MAX_HERO_LEVEL_BY_RANK[mc.HeroStock.getHeroRank(heroInfo)];
};
mc.HeroStock.isHeroMaxLevel = function (heroInfo) {
    return mc.HeroStock.getHeroLevel(heroInfo) >= mc.HeroStock.getHeroMaxLevel(heroInfo);
};
mc.HeroStock.isHeroMaxRank = function (heroInfo) {
    return mc.HeroStock.getHeroRank(heroInfo) >= mc.HeroStock.getHeroMaxRank(heroInfo);
};
mc.HeroStock.getHeroTotalAttr = function (heroInfo) {
    var atk = mc.HeroStock.getHeroTotalAttack(heroInfo);
    var def = mc.HeroStock.getHeroTotalDefense(heroInfo);
    var hp = mc.HeroStock.getHeroTotalHp(heroInfo);
    var res = mc.HeroStock.getHeroTotalResistant(heroInfo);
    var mag = mc.HeroStock.getHeroTotalMagic(heroInfo);
    var spd = mc.HeroStock.getHeroTotalSpeed(heroInfo);
    return {atk: atk, def: def, res: res, hp: hp, mag: mag, spd: spd};
};
mc.HeroStock.getHeroLeaderSkill = function (heroInfo) {
    var skillInfo = null;
    var skillList = mc.HeroStock.getHeroSkillList(heroInfo);
    if (skillList) {
        for (var i = 0; i < skillList.length; i++) {
            if (mc.HeroStock.getSkillTypeOfHero(skillList[i]) === mc.const.SKILL_TYPE_LEADER) {
                skillInfo = skillList[i];
                break;
            }
        }
    }
    return skillInfo;
};
mc.HeroStock.getHeroUltimateSkill = function (heroInfo) {
    var foundSkill = null;
    var skillList = heroInfo.skillList;
    for (var i = 0; i < skillList.length; i++) {
        var skillDict = mc.dictionary.getSkillByIndex(skillList[i].index);
        if (skillDict && (mc.HeroStock.getSkillTypeOfHero(skillDict) === mc.const.SKILL_TYPE_ACTIVE)) {
            foundSkill = skillDict;
            break;
        }
    }
    return foundSkill;
};
mc.HeroStock.getSkillLevelOfHero = function (skillInfo) {
    return skillInfo.level || 1;
};
mc.HeroStock.getSkillIndexOfHero = function (skillInfo) {
    return skillInfo.index;
};
mc.HeroStock.getSkillNameOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return mc.dictionary.getI18nMsg(skillDict.name);
};
mc.HeroStock.getSkillIconOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict.icon;
};
mc.HeroStock.getSkillDescriptionOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return mc.dictionary.getI18nMsg(skillDict.desc);
};
mc.HeroStock.getSkillRankOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict.rank;
};
mc.HeroStock.getSkillTypeOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict.skillType;
};
mc.HeroStock.getSkillPriorityOfHero = function (skillInfo) {
    var priority = 0;
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    if (skillDict.skillType === mc.const.SKILL_TYPE_ACTIVE) {
        priority = 9;
    } else if (skillDict.skillType === mc.const.SKILL_TYPE_LEADER) {
        priority = 10;
    }
    return priority;
};
mc.HeroStock.getSkillBattlePowerOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict ? parseInt(skillDict.battlePower) : 0;
};
mc.HeroStock.getSkillUpgradeOf = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict.upgradeTo;
};
mc.HeroStock.getSkillUpgradePointOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict.requirePoints;
};
mc.HeroStock.getSkillLvUpBattlePowerOfHero = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    //return skillDict.lvUpBattlePower;
    return 0;
};
mc.HeroStock.getSkillStatusResource = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict ? skillDict.statusImage : null;
};
mc.HeroStock.getSkillTransformResource = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict ? skillDict.transformImage : null;
};
mc.HeroStock.isSkillRange = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict ? skillDict.range === 1 : false;
};
mc.HeroStock.isSkillLine = function (skillInfo) {
    var skillDict = mc.dictionary.getSkillByIndex(skillInfo.index);
    return skillDict ? skillDict.range === 2 : false;
};
mc.HeroStock.isNullSkill = function (skillInfo) {
    return skillInfo.index === 9999 ||
        skillInfo.index === 9998 ||
        skillInfo.index === 9997 ||
        skillInfo.index === 9996;

};

mc.HeroStock.getHeroTotalAttrByLevel = function (heroInfo, level) {
    level = level || mc.HeroStock.getHeroLevel(heroInfo);
    var count = level - 1;
    var localData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    var atk = localData.atk + (localData.lvUpATK * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "atk");
    var def = localData.def + (localData.lvUpDEF * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "def");
    var res = localData.res + (localData.lvUpRES * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "res");
    var hp = localData.hp + (localData.lvUpHP * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "hp");
    var mag = localData.mag + (localData.lvUpMAG * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "mag");
    var spd = localData.spd + (localData.lvUpSPD * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "spd");
    return {atk: atk, def: def, res: res, hp: hp, mag: mag, spd: spd};
};

mc.HeroStock.getHeroTotalAttrByLevelNonEquipping = function (heroInfo, level) {
    level = level || mc.HeroStock.getHeroLevel(heroInfo);
    var count = level - 1;
    var localData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    var atk = localData.atk + (localData.lvUpATK * count);
    var def = localData.def + (localData.lvUpDEF * count);
    var res = localData.res + (localData.lvUpRES * count);
    var hp = localData.hp + (localData.lvUpHP * count);
    var mag = localData.mag + (localData.lvUpMAG * count);
    var spd = localData.spd + (localData.lvUpSPD * count);
    return {atk: atk, def: def, res: res, hp: hp, mag: mag, spd: spd};
};

mc.HeroStock.getHeroTotalAttrByRank = function (heroInfo, rank) {
    rank = rank || mc.HeroStock.getHeroRank(heroInfo);
    var count = mc.HeroStock.getHeroLevel(heroInfo) - 1;
    var localData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    var evolveToIndex = localData.evolveTo;
    var evolveData = mc.dictionary.getHeroDictByIndex(evolveToIndex);
    if (evolveData) {
        var atk = evolveData.atk + (evolveData.lvUpATK * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "atk");
        var def = evolveData.def + (evolveData.lvUpDEF * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "def");
        var res = evolveData.res + (evolveData.lvUpRES * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "res");
        var hp = evolveData.hp + (evolveData.lvUpHP * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "hp");
        var mag = evolveData.mag + (evolveData.lvUpMAG * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "mag");
        var spd = evolveData.spd + (evolveData.lvUpSPD * count) + mc.HeroStock.getItemEquippingValue(heroInfo, "spd");
        return {atk: atk, def: def, res: res, hp: hp, mag: mag, spd: spd};
    }
    return null;
};
mc.HeroStock.isHeroInvolve = function (heroInfo) {
    var localData = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo));
    return localData.evolveTo != null;
};
mc.HeroStock.getHeroValueByAttr = function (heroInfo, indexAttr, mapHeroInInFormation) {
    var val = -1000;
    if (heroInfo) {
        switch (indexAttr) {
            case -1:
                val = mc.HeroStock.getHeroId(heroInfo);
                break;
            case 0:
                val = mc.HeroStock.getHeroBattlePower(heroInfo);
                break;
            case 1:
                val = mc.HeroStock.getHeroLevel(heroInfo);
                break;
            case 2:
                val = mc.HeroStock.getHeroRank(heroInfo);
                break;
            case 3:
                val = mc.HeroStock.getHeroTotalAttack(heroInfo);
                break;
            case 4:
                val = mc.HeroStock.getHeroTotalDefense(heroInfo);
                break;
            case 5:
                val = mc.HeroStock.getHeroTotalHp(heroInfo);
                break;
            case 6:
                val = mc.HeroStock.getHeroTotalResistant(heroInfo);
                break;

        }
        if (mapHeroInInFormation) {
            var partInTeamId = mapHeroInInFormation[mc.HeroStock.getHeroId(heroInfo)];
            if (partInTeamId) {
                if (partInTeamId === mc.TeamFormationManager.TEAM_CAMPAIGN) {
                    val += 4000000;
                } else if (partInTeamId === mc.TeamFormationManager.TEAM_ATTACK_ARENA) {
                    val += 3000000;
                } else if (partInTeamId === mc.TeamFormationManager.TEAM_DEFENSE_ARENA) {
                    val += 2000000;
                } else if (partInTeamId === mc.TeamFormationManager.TEAM_CHAOSCASTLE) {
                    val += 1000000;
                }
            }
        }
    }
    indexAttr >= 0 && mc.GameData.guiState.setCurrentSortingHeroStockIndex(indexAttr);
    return val;
};