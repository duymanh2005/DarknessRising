/**
 * Created by long.nguyen on 10/23/2017.
 */

mc.AbstractInBattle = bb.Class.extend({
    _enableAutoCombat: true,
    _mapCountdownUsingByItemId: null,
    _mapQuantityUsingByItemId: null,
    _isEnd: false,
    _brkURL: null,

    ctor: function () {
        this._super();
        this._mapCountdownUsingByItemId = {};
        this._mapQuantityUsingByItemId = {};
    },

    setPreSetSeed: function (seed) {
        this._preSetSeed = seed;
    },

    getPreSetSeed: function () {
        return this._preSetSeed;
    },

    setEnd: function () {
        this._isEnd = true;
    },

    isEnd: function () {
        return this._isEnd;
    },

    setBattleData: function (json) {
        var opponent = json["opponent"];
        var yourTeam = json["your_team"];

        this._isEnd = false;
        this._mapHeroIndexByIndex = {};
        this._mapCountdownUsingByItemId = {};
        this._mapQuantityUsingByItemId = {};
        var _parse = function (data) {
            var heroes = data["heroes"];
            var avatar = data["avatar"];
            var formation = data["battleTeam"];
            var leaderIndex = data["leaderIndex"];

            var arrCreatureInfo = [];
            var mapCreatureInfo = {};
            if (heroes) {
                for (var i = 0; i < heroes.length; i++) {
                    var heroInfo = heroes[i];
                    var id = mc.HeroStock.getHeroId(heroInfo);
                    var index = mc.HeroStock.getHeroIndex(heroInfo);

                    var infoCreature = null;
                    infoCreature = new mc.CreatureInfo().copyHeroInfo(heroInfo);
                    arrCreatureInfo.push(infoCreature);
                    mapCreatureInfo[id] = infoCreature;
                    this._mapHeroIndexByIndex[index] = index;
                }
            }
            return {
                arrCreatureInfo: arrCreatureInfo,
                formation: formation,
                avatar: avatar,
                leaderIndex: leaderIndex,
                heroName: data["gameHeroName"]
            }
        }.bind(this);

        this._battleTeamPlayerInfo = _parse(yourTeam);
        this._battleTeamOpponentInfo = _parse(opponent);
        this.setArrayHeroInfoPartIn(yourTeam["heroes"]);
        this.setArrayOpponentInfoPartIn(opponent["heroes"]);
        this.setCanRetry(false);
    },

    setMaxBattleDurationInMs:function(durationInMs){
        this._maxBattleDurationInMs = durationInMs;
    },

    getMaxBattleDurationInMs:function(){
        return this._maxBattleDurationInMs || mc.const.MAX_BATTLE_DURATION_IN_MS;
    },

    getArrayHeroInfoPartIn: function () {
        return this._arrHeroInfoPartIn;
    },

    setArrayHeroInfoPartIn: function (arrHeroInfo) {
        this._arrHeroInfoPartIn = arrHeroInfo;
    },

    getArrayOpponentInfoPartIn: function () {
        return this._arrOpponentInfoPartIn;
    },

    setArrayOpponentInfoPartIn: function (arrHeroInfo) {
        this._arrOpponentInfoPartIn = arrHeroInfo;
    },

    setCanRetry: function (canRetry) {
        this._canRetry = canRetry;
    },

    buildMapStatusCreature: function (arrCreature) {
        var mapStatus = [];
        for (var i = 0; i < arrCreature.length; i++) {
            var creature = arrCreature[i];
            var toInfo = creature.toInfo();
            mapStatus[creature.getServerId()] = {
                index: creature.getResourceId(),
                id: creature.getServerId(),
                hpPercent: toInfo.getCurrentHpPercentByLong(),
                mpPercent: toInfo.getCurrentMpPercentByLong()
            };
        }
        return mapStatus;
    },

    canRetry: function () {
        return this._canRetry;
    },

    setBackgroundURL: function (brkURL) {
        var strs = brkURL.split('/');
        this.bgKey = strs[strs.length - 1].split('.')[0];
        this._brkURL = brkURL;
    },

    getBgKey: function () {
        return this.bgKey;
    },

    getBackgroundURL: function () {
        return this._brkURL;
    },

    getBackgroundMusic: function () {
        return res.sound_bgm_battle_pve;
    },

    getArrayAllCreatureIndex: function () {
        return bb.utility.mapToArray(this._mapHeroIndexByIndex);
    },

    getBattleTeamOpponentInfo: function () {
        return this._battleTeamOpponentInfo;
    },

    getBattleTeamPlayerInfo: function () {
        return this._battleTeamPlayerInfo;
    },

    updateQuantityUsingByItemId: function (itemId, usingNo) {
        usingNo = usingNo || 0;
        if (!this._mapQuantityUsingByItemId[itemId]) {
            this._mapQuantityUsingByItemId[itemId] = 0;
        }
        this._mapQuantityUsingByItemId[itemId] += usingNo;
    },

    updateCountdownUsingByItemId: function (itemId, countDown) {
        countDown = countDown || 0;
        if (!this._mapCountdownUsingByItemId[itemId]) {
            this._mapCountdownUsingByItemId[itemId] = 0;
        }
        this._mapCountdownUsingByItemId[itemId] = countDown;
    },

    getCountDownUsedByItemId: function (itemId) {
        if (!this._mapCountdownUsingByItemId[itemId]) {
            this._mapCountdownUsingByItemId[itemId] = 0;
        }
        return this._mapCountdownUsingByItemId[itemId];
    },

    getQuantityUsedByItemId: function (itemId) {
        if (!this._mapQuantityUsingByItemId[itemId]) {
            this._mapQuantityUsingByItemId[itemId] = 0;
        }
        return this._mapQuantityUsingByItemId[itemId];
    },

    getCountDownUsedItemMap: function () {
        return this._mapCountdownUsingByItemId;
    },

    getQuantityUsedItemMap: function () {
        return this._mapQuantityUsingByItemId;
    },

    calculateNumStarInBattle: function (arrCreature, durBattleInMs) {
        var numHeroDead = 0;
        bb.utility.arrayTraverse(arrCreature, function (creature) {
            if (creature.isDead()) {
                numHeroDead++;
            }
        });
        var maxRemainInMS = Math.round(this.getMaxBattleDurationInMs()/mc.const.MAX_BATTLE_DURATION_IN_MS*60*1000);
        var remainInMs = this.getMaxBattleDurationInMs() - durBattleInMs;
        var numStar = 1;
        if (numHeroDead === 0) {
            if (remainInMs >= maxRemainInMS) {
                numStar = 3;
            } else {
                numStar = 2;
            }
        } else {
            if (numHeroDead === 1 &&
                remainInMs >= maxRemainInMS) {
                numStar = 2;
            } else {
                numStar = 1;
            }
        }
        return numStar;
    },

    getCurrentDropZen: function () {
        return 0;
    },

    dropZen: function () {
        var dropZen = 0;
        return dropZen;
    },

    dropItem: function () {
        var itemInfo = null;
        return itemInfo;
    },

    getZenPrice: function () {
        return 0;
    },

    haveAChest: function () {
        return false;
    },

    haveABoss: function () {
        return false;
    },

    isPvP: function () {
        return true;
    },

    isUsedItem: function () {
        return true;
    },

    setPlayerTeamSide: function (teamSide) {
        this._playerTeamSide = teamSide;
    },

    getPlayerTeamSide: function () {
        return this._playerTeamSide || mc.const.TEAM_RIGHT;
    },

    createBattleFieldRefactor: function () {
        var playerTeamSide = this.getPlayerTeamSide();
        var opponentTeamSide = playerTeamSide === mc.const.TEAM_RIGHT ? mc.const.TEAM_LEFT : mc.const.TEAM_RIGHT;
        var heroOpponentInfo = this.getBattleTeamOpponentInfo();
        var heroPlayerInfo = this.getBattleTeamPlayerInfo();
        var groupOpponent = mc.GameLogicFactory.createCreatureGroup(heroOpponentInfo);
        var groupPlayer = mc.GameLogicFactory.createCreatureGroup(heroPlayerInfo);
        var battleField = new mc.BattleFieldRefactor(playerTeamSide, this.getPreSetSeed());
        battleField.addGroup(groupOpponent, opponentTeamSide);
        battleField.addGroup(groupPlayer, playerTeamSide);
        battleField.setMaxBattleDurationInMs(this.getMaxBattleDurationInMs());
        mc.LayoutHeroForBattle.layoutArrayHero(playerTeamSide, groupPlayer);
        mc.LayoutHeroForBattle.layoutArrayHero(opponentTeamSide, groupOpponent);
        return battleField;
    },

    createBattleViewRefactor: function () {
        return mc.GameLogicFactory.createBattleViewRefactorForAbstractBattle(this, new mc.BattleEnvinronment(this.getBackgroundURL()), this.getPreSetSeed());
    },

    isAutoCombatMode: function () {
        return false;
    },

    isSupportX3: function () {
        return false;
    },

    isFixSpeedX2: function () {
        return false;
    }


});