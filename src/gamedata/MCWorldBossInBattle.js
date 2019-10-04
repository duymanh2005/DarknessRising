/**
 * Created by long.nguyen on 10/16/2018.
 */
mc.WorldBossInBattle = mc.AbstractInBattle.extend({

    setBattleData: function (json) {
        var bossIndex = mc.GameData.guiState.getShowingBossIndex();
        var bossInfo = mc.dictionary.getWorldBossInfoByIndex(bossIndex);
        var brkKey = (bossInfo && bossInfo["bg"]) ? bossInfo["bg"] : mc.BossMainLayer.DEFAULT_WORLD_BOSS_BRK_KEY;
        this.setBackgroundURL(cc.formatStr("res/png/brk/%s.png",brkKey));

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
mc.GuildBossInBattle = mc.AbstractInBattle.extend({

    setBattleData: function (json) {
        this.setBackgroundURL(bb.utility.randomElement([
            "res/png/brk/losttower2.png"
        ]));

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