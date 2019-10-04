/**
 * Created by long.nguyen on 5/10/2018.
 */
mc.StageBossInBattle = mc.AbstractInBattle.extend({


    //getBattleBackgroundURL:function(){
    //
    //    var stageDict = mc.dictionary.getStageDictByIndex(mc.GameData.stageBossSystem.getStageId());
    //    var arrBrkUrl = (stageDict && stageDict["battleBG"]) ? stageDict["battleBG"].split(',') : ["loren1", "loren2"];
    //    var bgKey = bb.utility.randomElement(arrBrkUrl);
    //    return "res/png/brk/" + bgKey + ".png";
    //},


    setBattleData: function (json) {

        //this.setBackgroundURL(bb.utility.randomElement([
        //    "res/png/brk/boss1.png"
        //]));

        var stageDict = mc.dictionary.getStageDictByIndex(mc.GameData.stageBossSystem.getStageIndex());
        var arrBrkUrl = (stageDict && stageDict["battleBG"]) ? stageDict["battleBG"].split(',') : ["loren1", "loren2"];
        var bgKey = bb.utility.randomElement(arrBrkUrl);

        this.setBackgroundURL("res/png/brk/" + bgKey + ".png");

        var opponent = json["opponent"];
        var yourTeam = json["your_team"];

        this._isEnd = false;
        this._mapHeroIndexByIndex = {};
        this._mapCountdownUsingByItemId = {};
        this._mapQuantityUsingByItemId = {};
        var _parseHeroes = function (data) {
            var heroes = data["heroes"];
            var formation = data["battleTeam"];
            var leaderIndex = data["leaderIndex"];

            var arrCreatureInfo = [];
            if (heroes) {
                for (var i = 0; i < heroes.length; i++) {
                    var heroInfo = heroes[i];
                    var id = mc.HeroStock.getHeroId(heroInfo);
                    var index = mc.HeroStock.getHeroIndex(heroInfo);

                    var infoCreature = null;
                    infoCreature = new mc.CreatureInfo().copyHeroInfo(heroInfo);
                    arrCreatureInfo.push(infoCreature);
                    this._mapHeroIndexByIndex[index] = index;
                }
            }
            return {
                arrCreatureInfo: arrCreatureInfo,
                formation: formation,
                leaderIndex: leaderIndex
            }
        }.bind(this);

        var _parseBoss = function (data) {
            var monster = data["monster"];
            monster.id = monster.id || data["id"];
            var currHp = data["hp"];
            var index = mc.HeroStock.getHeroIndex(monster);

            var infoBoss = new mc.CreatureInfo().copyMonsterInfo(monster, monster.id);
            this._mapHeroIndexByIndex[index] = index;
            infoBoss.hpServerControl = true;
            infoBoss.setCurrentHpPercentByLong(Math.round(currHp / monster.hp * mc.CreatureInfo.CAST_LONG_RATE));
            infoBoss.setCurrentMpPercentByLong(0);

            return {
                arrCreatureInfo: [infoBoss],
                formation: [mc.HeroStock.getHeroId(monster), -1, -1, -1, -1],
                leaderIndex: 0
            }
        }.bind(this);

        this._battleTeamPlayerInfo = _parseHeroes(yourTeam);
        this._battleTeamOpponentInfo = _parseBoss(opponent);
        this.setArrayHeroInfoPartIn(yourTeam["heroes"]);
        this.setArrayOpponentInfoPartIn(opponent["heroes"]);
        this.setCanRetry(false);
    },

    haveABoss: function () {
        return true;
    },

    isAMonsterBossRound: function () {
        return true;
    },

    getBackgroundMusic: function () {
        return res.sound_bgm_battle_boss;
    }

});