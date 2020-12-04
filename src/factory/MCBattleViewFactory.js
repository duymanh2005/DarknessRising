/**
 * Created by long.nguyen on 4/18/2017.
 */
mc.BattleViewFactory = (function () {
    var factory = {};
    factory.createCreatureView = function (creatureModel) {
        var resourceId = creatureModel.getResourceId();
        var creatureView = factory.createCreatureViewByIndex(resourceId);
        creatureView.setUserData(creatureModel);
        cc.log("show by createCreatureView");
        cc.log(creatureView);
        creatureView.onEnter = function () {
            cc.Node.prototype.onEnter.call(this);
            this.setVisible(true);
            var userData = this.userData.info;
            if (userData) {
                factory.showHeroAndPet(this, userData.petEquipment);
            }
        }.bind(creatureView);
        return creatureView;
    };

    factory.createCreatureViewByIndex = function (index) {
        return new mc.CreatureSpine(index);
    };

    factory.createCreatureGUIByIndex = function (index) {
        cc.log("show by createCreatureGUIByIndex");
        var heroView = factory.createCreatureViewByIndex(index);
        heroView.onEnter = function () {
            cc.Node.prototype.onEnter.call(this);
            this.setVisible(true);

            var userData = this.userData;
            if(userData){
                var petEquipment = mc.GameData.itemStock.getEquipmentByHeroId(userData.id, 6);
                factory.showHeroAndPet(this, petEquipment);
                cc.log(petEquipment);
            }

        }.bind(heroView);
        heroView.scale = 1.25;
        return heroView;
    };

    factory.showHeroAndPet = function(creature, petEquipment){
        if (petEquipment) {
            var skillByEquipmentIndex = mc.dictionary.getSkillByEquipmentIndex(petEquipment.index);
            var statusImage = mc.HeroStock.getSkillStatusResource({index: skillByEquipmentIndex});
            if (statusImage) {
                var strs = statusImage.split('.');
                if (!strs[1] || strs[1] === "json") {
                    var name = strs[0];
                    var strPrefixSpine = "res/spine/battle_effect/" + name;
                    creature.showPet(strPrefixSpine, name);
                }
            }
        }
    }


    factory.createBattleBackground = function (environment) {
        var brk = new cc.Sprite(environment.getBrkURL());
        return brk;
    };

    return factory;
}());

mc.BattleBgEffectFactory = {};

(function (ctx) {
    var effectData = {};
    var jsonRes;
    ctx.load = function () {
        var json = cc.loader.getRes(res.data_stage_particles_json);
        jsonRes = bb.utility.arrayToMap(json, function (j) {
            return j["battleBG"];
        })
    };

    ctx.loadData = function (key, callback) {
        if (!jsonRes) {
            ctx.load();
        }
        var bgJsons = jsonRes[key];
        if (!bgJsons) {
            cc.error("BattleBgEffectFactory Not Found Key :" + key);
            return;
        }
        cc.warn("BattleBgEffectFactory loadKey  Key :" + key);
        var arr = bgJsons["bgJson"].split('#');
        var keyRes = bb.utility.randomElement(arr);
        var resPath = "res/battleBGEffect/" + keyRes + ".json";
        if (!effectData[resPath]) {
            effectData[resPath] = cc.loader.getRes(resPath);
        }
        callback && callback(effectData[resPath]);
    };

    ctx.buildBGEffect = function (widget, brk, bgKey) {
        mc.BattleBgEffectFactory.loadData(bgKey, function (result) {
            if (result) {
                var bones = result["bones"];
                for (var i in bones) {
                    var bone = bones[i];
                    ctx.buildParticle(widget, brk, bone);
                }
            }
        });
    };

    ctx.buildParticle = function (widget, brk, data) {
        var arr = data["name"].split('#');
        if (arr.length !== 3) {
            return;
        }
        var childNode = new cc.ParticleSystem("res/battleBGEffect/particle/" + arr[1] + ".plist");
        childNode.setPositionType(cc.ParticleSystem.TYPE_GROUPED);
        switch (arr[0]) {
            case "back":
                childNode.setLocalZOrder(-9);
                break;
            case "center":
                childNode.setLocalZOrder(-1);
                break;
            case "front":
                childNode.setLocalZOrder(5);
                break;
        }
        childNode.x = brk.x - brk.width / 2 + data["x"];
        childNode.y = brk.y - brk.height + data["y"];
        widget.addChild(childNode);
    };

})(mc.BattleBgEffectFactory);