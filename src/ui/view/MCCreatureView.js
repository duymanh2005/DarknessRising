/**
 * Created by long.nguyen on 4/10/2017.
 */
(function () {
    var TRACK_IDLE = 0;
    var TRACK_ATTACK = 1;
    var TRACK_ACTIVE_SKILL = 2;
    var TRACK_AUTO_SKILL = 3;
    var TRACK_CAST = 4;
    var TRACK_BE_BUFF = 5;
    var TRACK_HURT = 6;
    var TRACK_DEAD = 7;
    var TRACK_IDLE_DEAD = 8;
    var TRACK_CHEER = 9;
    var TRACK_APPEAR = 10;
    var TRACK_BE_FREEZING = 11;
    var TRACK_BE_STUNNING = 12;
    var TRACK_LAST_IDLE = 1000;

    var TAG_BACK_TO = 91200;
    var TAG_MOVE_TO = 91201;
    var TAG_END_TURN = 91202;

    mc.CreatureView = cc.Node.extend({
        zGroup: 0,
        _direction: -1,
        _zBattle: 0,

        onEventPostCommand: function (creature, command) {
        },

        onEventRegen: function (creature, data) {
        },

        clearAllStatusViewIfAny: function () {
            this.clearStatusEffectView();
            this.clearStatusIcon();
            this.beEffecting(true);
        },

        hasStatusEffectSpine: function (skillId) {
            var isFound = false;
            if (this._arrStatusEffectView) {
                for (var i = this._arrStatusEffectView.length - 1; i >= 0; i--) {
                    var statusEffect = this._arrStatusEffectView[i].getUserData();
                    if (mc.CreatureSkill.isSameRootSkill(statusEffect.getSkillId(), skillId)) {
                        isFound = true;
                        break;
                    }
                }
            }
            return isFound;
        },

        addStatusEffectSpine: function (statusEffectView) {
            if (!this.getUserData().isDead()) {
                if (!this._arrStatusEffectView) {
                    this._arrStatusEffectView = [];
                }
                this.addChild(statusEffectView);
                statusEffectView.setLocalZOrder(10);
                this._arrStatusEffectView.push(statusEffectView);
            }
        },

        clearStatusEffectView: function () {
            if (this._arrStatusEffectView) {
                for (var i = this._arrStatusEffectView.length - 1; i >= 0; i--) {
                    if (this._arrStatusEffectView[i].getUserData().isRemoved()) {
                        this._arrStatusEffectView[i].runAction(cc.sequence([cc.fadeOut(0.3), cc.removeSelf()]));
                        this._arrStatusEffectView.splice(i, 1);
                    }
                }
            }
        },

        hasStatusIcon: function (effectId, skillId) {
            if (this._arrStatusIcon) {
                for (var i = this._arrStatusIcon.length - 1; i >= 0; i--) {
                    var statusIcon = this._arrStatusIcon[i].getUserData();
                    if (statusIcon.getEffectId() === effectId && mc.CreatureSkill.isSameRootSkill(statusIcon.getSkillId(), skillId)) {
                        return this._arrStatusIcon[i];
                    }
                }
            }
        },

        addStatusIcon: function (effectIcon) {
            if (!this.getUserData().isDead()) {
                if (!this._arrStatusIcon) {
                    this._arrStatusIcon = [];
                }
                this.addChild(effectIcon);
                this._arrStatusIcon.push(effectIcon);
            }
        },

        clearStatusIcon: function () {
            if (this._arrStatusIcon) {
                for (var i = this._arrStatusIcon.length - 1; i >= 0; i--) {
                    if (this._arrStatusIcon[i].getUserData().isRemoved()) {
                        this._arrStatusIcon[i].runAction(cc.sequence([cc.fadeOut(0.3), cc.removeSelf(), cc.callFunc(function (icon) {
                            cc.arrayRemoveObject(this._arrStatusIcon, icon);
                        }.bind(this))]));
                    }
                }
            }
        },

        getBattleView: function () {
            return this.getParent().getParent();
        },

        setTimeScale: function (timeScale) {
            var childs = this.getChildren();
            for (var i = 0; i < childs.length; i++) {
                var child = childs[i];
                if (child.setTimeScale) {
                    child.setTimeScale(timeScale);
                }
            }
        },

        setDirection: function (direction) {
            this._direction = direction;
        },

        isLeftDirection: function () {
            return this._direction === mc.CreatureView.DIRECTION_LEFT;
        },

        getAttackDuration: function () {
            return 0.35;
        },

        appear: function () {
            this.setVisible(true);
        },

        setupStartingPosition: function () {
            this.x += this.getDirection() * cc.winSize.width;
        },

        startComming: function () {
            this._hpBar && (this._hpBar.opacity = 0);
            this._mpBar && (this._mpBar.opacity = 0);
            var isBoss = false;
            var dt = this.getUserData();
            if (dt && dt.isBoss) {
                isBoss = dt.isBoss();
            }
            else {
                var dict = mc.dictionary.getCreatureDictByIndex(mc.HeroStock.getHeroIndex(dt));
                if (dict && dict["type"] === "boss") {
                    isBoss = true;
                }
            }

            this.setVisible(isBoss ? false : true);
            this.come(0.3);
            this.runAction(cc.sequence([cc.moveBy(0.3, -cc.winSize.width * this.getDirection(), 0), cc.callFunc(function () {
                if (isBoss) {
                    this.setVisible(true);
                    this._hpBar && this._hpBar.setVisible(false);
                    this._mpBar && this._mpBar.setVisible(false);
                    this._body.setAnimation(TRACK_APPEAR, "appear", false);
                }
                else {
                    if (this._hpBar) {
                        this._hpBar.runAction(cc.fadeIn(0.3));
                    }
                    if (this._mpBar) {
                        this._mpBar.runAction(cc.fadeIn(0.3));
                    }
                }
            }.bind(this))]));
        },

        outCombat: function () {
            this.setDirection(this.getDirection() * -1);
            this.runAction(cc.sequence([cc.moveBy(0.3, -cc.winSize.width * this.getDirection(), 0), cc.callFunc(function () {
            }.bind(this))]));
        },

        come: function () {
        },

        moveTo: function (pos) {
            this.runAction(cc.moveTo(mc.BattleFieldRefactor.TIME_CREATURE_MOVETO, pos));
        },

        backTo: function (pos) {
            this.runAction(cc.moveTo(mc.BattleFieldRefactor.TIME_CREATURE_BACKTO, pos));
        },

        attack: function () {
        },

        skill: function (skillId) {
        },

        idle: function () {

        },

        idleDelay: function () {
        },

        cheer: function (loop) {
        },

        cheerDelay: function () {
        },

        setIdleDead: function (idleDead) {
            this._idleDead = idleDead;
        },

        _animateDead: function () {
            var childs = this.getChildren();
            for (var i = 0; i < childs.length; i++) {
                if (cc.sys.isNative) {
                    childs[i].runAction(cc.sequence([cc.delayTime(0.1), cc.fadeOut(0.5)]));
                }
                else {
                    childs[i].runAction(cc.sequence([cc.delayTime(0.1), cc.blink(0.5, 3), cc.hide()]));
                }
            }
            this.runAction(cc.sequence([cc.delayTime(0.6), cc.callFunc(function () {
                !cc.sys.isNative && this.setVisible(false);
                this._animateReviving();
            }.bind(this))]));
            this.clearAllStatusViewIfAny();
        },

        _animateReviving: function () {
            var cr = this.getUserData();
            if (cr && cr.isReviving && cr.isReviving()) {
                this.runAction(cc.sequence([cc.delayTime(0.5), cc.callFunc(function () {
                    !cc.sys.isNative && this.setVisible(true);
                    var childs = this.getChildren();
                    for (var i = 0; i < childs.length; i++) {
                        if (cc.sys.isNative) {
                            childs[i].opacity = 0;
                            childs[i].runAction(cc.sequence([cc.delayTime(0.1), cc.fadeIn(0.5)]));
                        }
                        else {
                            childs[i].runAction(cc.sequence([cc.delayTime(0.1), cc.blink(0.5, 4), cc.show()]));
                        }
                    }
                    this.runAction(cc.sequence([cc.delayTime(0.6), cc.callFunc(function () {
                        this._isAnimateDead = false;
                        cr.getBattleField().setLiveAfterRevivingForCreature(cr);
                    }.bind(this))]))
                }.bind(this))]));
            }
        },

        dead: function () {
            if (!this._isAnimateDead) {
                this._isAnimateDead = true;
                this.runAction(cc.sequence([cc.shake(0.2, cc.size(10, 0)), cc.delayTime(0.1), cc.callFunc(function () {
                    this._animateDead();
                }.bind(this))]));
            }
        },

        hurt: function () {
            this.runAction(cc.shake(0.2, cc.size(10, 0)));
        },

        buff: function () {
        }

    });
    mc.CreatureView.DIRECTION_LEFT = 1;
    mc.CreatureView.DIRECTION_RIGHT = -1;
    var mappingAnimationFunc = {
        attackHit: function (assetData, spineView, priority) {
            var creature = spineView.getUserData();
            creature && creature.processNormalHitEvent && creature.processNormalHitEvent(priority);
        },
        attackSound: function (assetData, spineView, index) {
            var arrName = assetData["attackSound"];
            if (arrName && arrName.length > index) {
                bb.sound.playEffect("res/sound/effect/" + arrName[index] + ".mp3");
            }
        },
        attackHitEffect: function (assetData, spineView, index) {
            var creature = spineView.getUserData();
            if (creature && creature.getBattleField && creature.getBattleField()) {
                var arrTarget = creature.getArrayAimingTarget();
                var hitData = mc.dictionary.getCreatureAssetByIndex(creature.getResourceId()).getHitData();
                for (var i = 0; i < arrTarget.length; i++) {
                    creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_SHOW_HIT_EFFECT, arrTarget[i], {
                        hitData: hitData,
                        hitIndex: index - 1
                    });
                }
            }
        },
        skillActiveHit: function (assetData, spineView, index) {
            var creature = spineView.getUserData();
            creature && creature.processActiveHitEvent && creature.processActiveHitEvent(index);
        },
        skillActiveSound: function (assetData, spineView, index) {
            var arrName = assetData["skillActiveSound"];
            if (arrName && arrName.length > index) {
                bb.sound.playEffect("res/sound/effect/" + arrName[index] + ".mp3");
            }
        },
        skillActiveHitEffect: function (assetData, spineView, index) {
            var creature = spineView.getUserData();
            if (creature && creature.getBattleField && creature.getBattleField()) {
                var arrTarget = creature.getArrayAimingTarget();
                var hitData = mc.dictionary.getCreatureAssetByIndex(creature.getResourceId()).getHitData(mc.const.SKILL_TYPE_ACTIVE);
                if (arrTarget && hitData) {
                    for (var i = 0; i < arrTarget.length; i++) {
                        creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_SHOW_HIT_EFFECT, arrTarget[i], {
                            hitData: hitData,
                            hitIndex: index - 1
                        });
                    }
                }
            }
        },
        skillAutoHit: function (assetData, spineView, index) {
            var creature = spineView.getUserData();
            creature && creature.processAutoHitEvent && creature.processAutoHitEvent(index);
        },
        skillAutoSound: function (assetData, spineView, index) {
            var arrName = assetData["skillAutoSound"];
            if (arrName && arrName.length > index) {
                bb.sound.playEffect("res/sound/effect/" + arrName[index] + ".mp3");
            }
        },
        skillAutoHitEffect: function (assetData, spineView, index) {
            var creature = spineView.getUserData();
            if (creature && creature.getBattleField && creature.getBattleField()) {
                var arrTarget = creature.getArrayAimingTarget();
                var hitData = mc.dictionary.getCreatureAssetByIndex(creature.getResourceId()).getHitData(mc.const.SKILL_TYPE_AUTO_CAST);
                if (hitData) {
                    for (var i = 0; i < arrTarget.length; i++) {
                        creature.getBattleField().fireEvent(mc.BattleFieldRefactor.EVENT_SHOW_HIT_EFFECT, arrTarget[i], {
                            hitData: hitData,
                            hitIndex: index - 1
                        });
                    }
                }
            }
        },
        back: function (assetData, spineView) {
            if (!spineView._isBacking) {
                spineView._isBacking = true;
                var creature = spineView.getUserData();
                if (creature && creature.processBackEvent) {
                    var isBack = creature.processBackEvent();
                    if (isBack) {
                        spineView.runAction(cc.sequence([cc.delayTime(mc.BattleFieldRefactor.TIME_CREATURE_BACKTO), cc.callFunc(function () {
                            creature.getBattleField().endActionFor(creature);
                        })]));
                    }
                }
            }
        }
    };

    mc.CreatureSpine = mc.CreatureView.extend({
        _currTrackIndex: TRACK_IDLE,
        _charRoot: null,
        _charStatusBox: null,
        _charBodyBox: null,

        ctor: function (index) {
            this._super();
            this._indexResource = index;
            this.setDirection(mc.CreatureView.DIRECTION_LEFT);
            var assetData = mc.dictionary.getCreatureAssetByIndex(index);
            if (assetData) {
                var atlasStr = assetData.getSpineString();
                mc.log("-------------- create: " + atlasStr);
                var loadFunc = function (arr) {
                    var body = this._body = sp.SkeletonAnimation.createWithJsonFile(arr[0], arr[1], mc.const.SPINE_SCALE);
                    body.setName("_originalBody");
                    body.scale = 1.0;
                    this._registerCompleteListener();
                    this._registerEventListener();
                    this.addChild(body);

                    this._updateBox();
                    this.idleDelay();
                    this.scheduleUpdate();
                    this.setCascadeOpacityEnabled(true);
                }.bind(this);

                var self = this;
                var arrRes = [
                    atlasStr + ".json", atlasStr + ".atlas"
                ];
                if (!cc.sys.isNative) {
                    cc.loader.load(arrRes, function () {
                    }, function () {
                        loadFunc(arrRes);
                        self.setDirection(self.getDirection());
                    });
                } else {
                    loadFunc(arrRes);
                }
            }

        },

        showPet: function(spineUrl, animationName){
            var self = this;
            bb.utility.loadSpine(spineUrl, function (statusEffectSpine) {
                statusEffectSpine.scaleX = self.getDirection();
                statusEffectSpine.setAnimation(0, animationName, true);
                //statusEffectSpine.setPositionY(100);
                var tag = 999;
                self.addChild(statusEffectSpine, 55, tag);
            }, 0.15);
        },

        releasePet: function(){
            this.removeChildByTag(999);
            cc.log("-------- release pet");
            cc.log(this);
        },

        setCustomCallbackMapSpineEvent: function (mapCallback) {
            this._customMapCallbackSpineEvent = mapCallback;
        },

        _updateBox: function () {
            this._charRoot = this._body.findBone("char_root");
            this._charStatusBox = this._body.findBone("charStatusBox");
            this._charBodyBox = this._body.findBone("charBodyBox");
        },

        _registerCompleteListener: function () {
            this._body.setCompleteListener(function (trackEntry) {
                var loopCount = Math.floor(trackEntry.trackTime / trackEntry.animationEnd);
                //mc.log("%d complete: %d", trackEntry.trackIndex, loopCount);
                if (trackEntry.trackIndex === TRACK_ATTACK ||
                    trackEntry.trackIndex === TRACK_ACTIVE_SKILL ||
                    trackEntry.trackIndex === TRACK_AUTO_SKILL ||
                    trackEntry.trackIndex === TRACK_HURT ||
                    trackEntry.trackIndex === TRACK_DEAD ||
                    trackEntry.trackIndex === TRACK_CAST ||
                    trackEntry.trackIndex === TRACK_APPEAR ||
                    trackEntry.trackIndex === TRACK_BE_BUFF) {
                    this._body.clearTrack(trackEntry.trackIndex);
                    if (trackEntry.trackIndex != TRACK_DEAD) {
                        this.idle();
                    }
                    if (trackEntry.trackIndex === TRACK_APPEAR) {
                        this.showBar();
                    }
                    this._letAttack = true;
                }
                if (!this.isBeingEffecting()) {
                    this._currTrackIndex = TRACK_IDLE;
                }
            }.bind(this));

        },

        _registerEventListener: function () {
            this._body.setEventListener(function (trackEntry, event) {
                var key = event.data.name;
                var assetData = mc.dictionary.getCreatureAssetByIndex(this._indexResource);
                this.runAction(cc.callFunc(function (node, key) {
                    mc.const.ENABLE_SPINE_LOG && (mc.log(assetData.getData()["resChar"] + ": " + key));
                    if (key) {
                        var mapCallback = this._customMapCallbackSpineEvent || mappingAnimationFunc;
                        if (key === "Back") {
                            this.stopActionByTag(TAG_END_TURN); // stop the auto call 'back' event.
                            mapCallback[key.toLowerCase()] && mapCallback[key.toLowerCase()](assetData.getData(), this);
                        }
                        else {
                            var strs = key.split('#');
                            if (strs && strs.length > 1) {
                                var eventIndex = parseInt(strs[1]);
                                var keyName = strs[0].charAt(0).toLowerCase() + strs[0].slice(1);
                                mapCallback[keyName] && mapCallback[keyName](assetData.getData(), this, eventIndex);
                            }
                        }
                    }
                }.bind(this), this, key));
            }.bind(this));
        },

        update: function (dt) {
            if (this._arrStatusEffectView) {
                var char_root = this._charRoot;
                var charStatusBox = this._charStatusBox;
                if (char_root && charStatusBox) {
                    for (var i = this._arrStatusEffectView.length - 1; i >= 0; i--) {
                        var effectView = this._arrStatusEffectView[i];
                        if (effectView) {
                            var effect = effectView.getUserData();
                            var skillDict = mc.dictionary.getSkillByIndex(effect.getSkillId());
                            if (skillDict && skillDict["statusPosition"]) {
                                var statusPos = this.getStatusPosition(skillDict["statusPosition"].toLowerCase());
                                effectView.x = statusPos.x;
                                effectView.y = statusPos.y;
                            }
                        }
                    }

                }
            }
            if (this._arrStatusIcon) {
                var char_root = this._charRoot;
                var charStatusBox = this._charStatusBox;
                if (char_root && charStatusBox) {
                    var iconPos = this.getStatusPosition("top");
                    var widthIcon = this._arrStatusIcon.length * 40;
                    var startX = -widthIcon * 0.5;
                    for (var i = 0; i < this._arrStatusIcon.length; i++) {
                        var icon = this._arrStatusIcon[i];
                        if (icon) {
                            icon.x = iconPos.x + startX + icon.width * 0.5;
                            icon.y = iconPos.y + icon.height * 0.5;
                            startX += icon.width;

                            var childs = icon.getChildren();
                            if (childs && childs.length > 0) {
                                var eff = icon.getUserData();
                                childs[0].setString((eff.getEffectTimes() > 0 || this.getUserData().isDead()) ? "" + eff.getEffectTimes() : "");
                            }
                        }
                    }
                }
            }
            if (this._effectFullHpView) {
                if (this._charRoot) {
                    var statusPos = this.getStatusPosition("bottom");
                    this._effectFullHpView.x = statusPos.x;
                    this._effectFullHpView.y = statusPos.y;
                }
            }
            this._updateGauseBarPosition();
            this._zBattle = this.y;

        },

        _updateGauseBarPosition: function () {
            var statusPos = this.getStatusPosition("top");
            if (this._hpBar) {
                var hpBar = this._hpBar;
                hpBar.x = statusPos.x;
                hpBar.y = statusPos.y;
                hpBar.x += 8;
            }
            if (this._mpBar) {
                var mpBar = this._mpBar;
                mpBar.x = statusPos.x - 10;
                mpBar.y = statusPos.y - 12;
                mpBar.x += 8;
            }
        },

        getStatusPosition: function (positionName) {
            var x = 0;
            var y = 0;
            var bone = null;
            if (positionName === "center") {
                bone = this._charBodyBox;
            }
            else if (positionName === "bottom") {
                bone = this._charRoot;
            }
            else if (positionName === "top") {
                bone = this._charStatusBox;
            }
            if (bone) {
                var char_root = this._charRoot;
                if (char_root && positionName != "bottom") {
                    x = char_root.x;
                    y = char_root.y;
                }
                if (bone) {
                    x += bone.x;
                    y += bone.y;
                    x *= this._body.scaleX;
                    y *= this._body.scaleY;
                }
            }
            return cc.p(x, y);
        },

        pause: function () {
            this._super();
            var childs = this.getChildren();
            for (var i = 0; i < childs.length; i++) {
                childs[i].pause();
            }
        },

        resume: function () {
            this._super();
            var childs = this.getChildren();
            for (var i = 0; i < childs.length; i++) {
                childs[i].resume();
            }
        },

        hasTransformBody: function (effect) {
            var transformBody = this._getTransformBodyByEffect(effect);
            return transformBody != null;
        },

        replaceNewBody: function (newBody, effect) {
            var _originalBody = this.getChildByName("_originalBody");
            if (_originalBody) {
                _originalBody.setVisible(false);
                _originalBody.setCompleteListener(null);
                _originalBody.setEventListener(null);
            }

            var replaceBody = this.getChildByName("_replaceBody");
            if (!replaceBody) {
                replaceBody = new cc.Node();
                replaceBody.setName("_replaceBody");
                replaceBody.setCascadeOpacityEnabled(true);
                this.addChild(replaceBody);
            }
            var childsBody = replaceBody.getChildren();
            for (var i = 0; i < childsBody.length; i++) {
                childsBody[i].setVisible(false);
            }

            newBody.setUserData(effect);
            replaceBody.addChild(newBody);

            this._body = _originalBody;

            newBody.scale = 0;
            newBody.runAction(cc.sequence([cc.scaleTo(0.3, this.getDirection(), 1).easing(cc.easeBackOut()), cc.callFunc(function () {
                this._body = newBody;
                this._reverseBodyAnimation();
            }.bind(this))]));
        },

        reverseOriginalBody: function (effect) {
            var numTransform = 0;
            var transformBody = null;
            var _originalBody = this.getChildByName("_originalBody");
            var replaceBody = this.getChildByName("_replaceBody");
            if (replaceBody) {
                transformBody = this._getTransformBodyByEffect(effect);
                numTransform = replaceBody.getChildren() ? replaceBody.getChildren().length : 0;
            }
            if (_originalBody && transformBody) {
                if (numTransform > 1) {
                    transformBody.removeFromParent(true);
                    var childsBody = replaceBody.getChildren();
                    if (childsBody && childsBody.length > 0) {
                        var lastTransformBody = childsBody[childsBody.length - 1];
                        lastTransformBody.setVisible(true);
                        lastTransformBody.scale = 0;
                        lastTransformBody.runAction(cc.sequence([cc.scaleTo(0.3, this.getDirection(), 1).easing(cc.easeBackOut())]));
                    }
                }
                else {
                    _originalBody.setVisible(true);
                    _originalBody.scale = 0;
                    _originalBody.runAction(cc.sequence([cc.scaleTo(0.3, this.getDirection(), 1).easing(cc.easeBackOut()), cc.callFunc(function () {

                        transformBody.setCompleteListener(null);
                        transformBody.setEventListener(null);
                        transformBody.removeFromParent(true);

                        this._body = _originalBody;
                        this._reverseBodyAnimation();
                    }.bind(this))]));
                }
            }
        },

        _reverseBodyAnimation: function () {
            this._registerCompleteListener();
            this._registerEventListener();
            this._updateBox();
            this._body.setLocalZOrder(-1);
            this._body.clearTracks();
            this._body.setToSetupPose();
            if (this.getUserData().isFreezing()) {
                this._body.setAnimation(TRACK_BE_FREEZING, "freeze", true);
            }
            if (this.getUserData().isStunning()) {
                this._body.setAnimation(TRACK_BE_STUNNING, "stun", true);
            }
            else {
                this._body.setAnimation(TRACK_IDLE, "idle", true);
            }
        },

        _getTransformBodyByEffect: function (effect) {
            var transformBody = null;
            var replaceBody = this.getChildByName("_replaceBody");
            if (replaceBody) {
                var childsBody = replaceBody.getChildren();
                for (var i = 0; i < childsBody.length; i++) {
                    if (childsBody[i].getUserData() === effect) {
                        transformBody = childsBody[i];
                        break;
                    }
                }

            }
            return transformBody;
        },

        setDirection: function (direction) {
            this._super(direction);
            this._body && (this._body.scaleX = Math.abs(this._body.scaleX) * direction);
        },

        getDirection: function () {
            return this._direction || mc.const.DIRECTION_LEFT;
        },

        setShadow: function (isShow) {
        },

        cleanStatusBar: function () {
            this._hpBar && this._hpBar.removeFromParent();
            this._mpBar && this._mpBar.removeFromParent();
            this._hpBar = this._mpBar = null;
        },

        enableBar: function (enable, statusObject) {
            var hpBar = this._hpBar;
            var mpBar = this._mpBar;
            hpBar && hpBar.removeFromParent();
            mpBar && mpBar.removeFromParent();
            var creature = this.getUserData();
            if (!(creature instanceof mc.Creature)) {
                statusObject = statusObject || {
                    index: mc.HeroStock.getHeroIndex(creature),
                    id: mc.HeroStock.getHeroId(creature),
                    level: mc.HeroStock.getHeroLevel(creature),
                    hpPercent: 1 * mc.CreatureInfo.CAST_LONG_RATE,
                    mpPercent: 0
                };
            }
            if (enable) {
                if (!mpBar) {
                    mpBar = this._mpBar = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_CREATURE_MP);
                    if (statusObject) {
                        mpBar.setCurrentProgressValue(statusObject.mpPercent, 100);
                    }
                    else if (creature && creature.getTotalMaxMp() > 0) {
                        mpBar.setCurrentProgressValue(creature.getMp(), creature.getTotalMaxMp());
                    }
                    mpBar.setShowValueLabel(false);
                }
                this.addChild(mpBar);

                if (!hpBar) {
                    hpBar = this._hpBar = new mc.BattleProgressBar(mc.BattleProgressBar.TYPE_CREATURE_HP);
                    if (statusObject) {
                        hpBar.addElementDecorator({index: statusObject.index}, statusObject.level);
                        hpBar.setCurrentProgressValue(statusObject.hpPercent / mc.CreatureInfo.CAST_LONG_RATE * 100, 100);
                    }
                    else if (creature) {
                        hpBar.addElementDecorator({index: creature.getResourceId()}, creature.getLevel());
                        hpBar.setCurrentProgressValue(creature.getHP(), creature.getTotalMaxHp());
                    }
                    hpBar.setShowValueLabel(false);
                }
                this.addChild(hpBar);
            }
            else {
                this._hpBar = null;
                this._mpBar = null;
            }
        },

        showBar: function () {
            if (this._hpBar) {
                this._hpBar.setVisible(true);
                this._hpBar.runAction(cc.fadeIn(0.3));
            }
            if (this._mpBar) {
                this._mpBar.setVisible(true);
                this._mpBar.runAction(cc.fadeIn(0.3));
            }
        },

        enableFullHpEffect: function (enable) {
            if (!this._effectFullHpView) {
                this._effectFullHpView = sp.SkeletonAnimation.createWithJsonFile(res.res_spine_battle_effect_hitPowerFullAura_json, res.res_spine_battle_effect_hitPowerFullAura_atlas, mc.const.SPINE_SCALE);
                this._effectFullHpView.setSkin(this.getUserData().getElement().toUpperCase());
                this._effectFullHpView.setAnimation(0, "hitPowerFullAura", true);
                this._effectFullHpView.setVisible(false);
                this._effectFullHpView.setLocalZOrder(-9);
                this.addChild(this._effectFullHpView);
            }
            if (enable != undefined) {
                this._effectFullHpView.setVisible(enable);
            }
        },

        updateHpBar: function (newHp, totalMaxHp) {
            var creature = this.getUserData();
            var hpBar = this._hpBar;
            if (hpBar) {
                if (newHp) {
                    hpBar.setCurrentProgressValue(newHp, totalMaxHp || creature.getTotalMaxHp(), true);
                }
                else {
                    hpBar.setCurrentProgressValue(creature.getHP(), totalMaxHp || creature.getTotalMaxHp(), true);
                }
            }
        },

        updateMpBar: function (newMp) {
            var self = this;
            var creature = this.getUserData();
            if (creature.getTotalMaxMp() > 0) {
                var mpBar = this._mpBar;
                if (mpBar) {
                    if (newMp) {
                        mpBar.setCurrentProgressValue(newMp, creature.getTotalMaxMp(), true);
                    }
                    else {
                        mpBar.setCurrentProgressValue(creature.getMp(), creature.getTotalMaxMp(), function () {
                            self.enableFullHpEffect(creature.isFullMp());
                        });
                    }
                }
            }
        },

        setClickAble: function (isClickable, func, data) {
            var layout = this.getChildByName("__clickable_widget__");
            layout && layout.removeFromParent();
            var self = this;
            if (isClickable) {
                layout = new ccui.Layout();
                //layout.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
                //layout.opacity = 100;
                layout.anchorX = 0.5;
                layout.anchorY = 0;
                layout.width = 220;
                layout.height = 220;
                layout.setName("__clickable_widget__");
                if (func) {
                    layout.registerTouchEvent(function () {
                        func(self, data);
                    })
                }
                else {
                    var count = 0;
                    layout.registerTouchEvent(function (layout) {
                        var arrName = layout._arrName;
                        if (arrName) {
                            if (this._letAttack === undefined) {
                                this._letAttack = true;
                            }
                            if (this._letAttack) {
                                this._letAttack = false;
                                this.attack(arrName[count]);
                                count++;
                                if (count >= arrName.length) {
                                    count = 0;
                                }
                            }
                        }
                    }.bind(this));
                }
                layout.setSwallowTouches(false);
                this.addChild(layout);
            }
            else {
                layout = null;
            }
            if ((data || this.getUserData()) && layout && !func) {
                var heroInfo = this.getUserData() || data;
                var skillList = mc.HeroStock.getHeroSkillList(heroInfo);
                var arrName = [null];
                if (skillList) {
                    arrName = (bb.collection.findBy(skillList, function (skillInfo) {
                        var skillDict = mc.dictionary.getSkillByIndex(skillInfo["index"]);
                        if (skillDict && skillDict["skillType"] === mc.const.SKILL_TYPE_AUTO_CAST) {
                            return skillInfo;
                        }
                        return null;
                    }) != null) ? [null, "skillActive", "skillAuto"] : [null, "skillActive"];
                }
                layout._arrName = arrName;
                var asset = mc.dictionary.getCreatureAssetByIndex(mc.HeroStock.getHeroIndex(heroInfo));
                if (asset) {
                    var mapSoundByName = {
                        "null": "attackSound",
                        "skillActive": "skillActiveSound",
                        "skillAuto": "skillAutoSound"
                    };
                    asset = asset.getData();
                    var allSoundURL = [];
                    for (var i = 0; i < arrName.length; i++) {
                        var ss = arrName[i];
                        if (!ss) {
                            ss = "null";
                        }
                        var arrSound = asset[mapSoundByName[ss]];
                        if (arrSound) {
                            allSoundURL = bb.collection.arrayAppendArray(allSoundURL, arrSound);
                        }
                    }
                    layout._allSoundURL = allSoundURL;
                    for (var s = 0; s < layout._allSoundURL.length; s++) {
                        bb.sound.preloadEffect("res/sound/effect/" + layout._allSoundURL[s] + ".mp3");
                    }
                }
            }
            return layout;
        },

        unloadAllEffectSound: function () {
            var layout = this.getChildByName("__clickable_widget__");
            if (layout) {
                for (var s = 0; s < layout._allSoundURL.length; s++) {
                    bb.sound.unloadEffect("res/sound/effect/" + layout._allSoundURL[s] + ".mp3");
                }
            }
        },

        setKingIcon: function (isEnable) {
            var kingIcon = mc.view_utility.setKingIconForWidget(this, isEnable);
            if (kingIcon) {
                var statusPos = this.getStatusPosition("top");
                kingIcon.x = statusPos.x;
                kingIcon.y = statusPos.y + 20;
                kingIcon.stopAllActions();
                kingIcon.runAction(cc.sequence([cc.moveBy(0.3, 0, 8), cc.moveBy(0.3, 0, -8)]).repeatForever());
            }
        },

        onEnter: function () {
            this._super();
            this.setVisible(false);
        },

        appear: function () {
            this._super();
            if (cc.sys.isNative) {
                this._body.setOpacity(0);
                this._body.runAction(cc.sequence([cc.delayTime(0.5), cc.fadeIn(0.5)]));
            }
            else {
                this._body.setVisible(false);
                this._body.runAction(cc.sequence([cc.delayTime(0.5), cc.blink(0.5, 5), cc.show()]));
            }
        },

        come: function (delay) {
            //this._body.setAnimation(TRACK_CAST, "cast", false);
            //this.runAction(cc.sequence([cc.delayTime(delay),cc.callFunc(function(){
            //    this._body.clearTrack(TRACK_CAST);
            //    this.idleDelay();
            //}.bind(this))]));
        },

        moveTo: function (pos) {
            this._isBacking = false;
            var delay = mc.BattleFieldRefactor.TIME_CREATURE_MOVETO;
            var act = cc.moveTo(delay, pos);
            act.setTag(TAG_MOVE_TO);
            this.runAction(act);
        },

        backTo: function (pos, callback) {
            callback = callback || function () {
            };
            var delay = mc.BattleFieldRefactor.TIME_CREATURE_BACKTO;
            var act = cc.sequence([cc.moveTo(delay, pos), cc.callFunc(callback)]);
            act.setTag(TAG_BACK_TO);
            this.runAction(act);
            //this._body.setAnimation(TRACK_CAST, "cast", false);
            //this.runAction(cc.sequence([cc.delayTime(delay),cc.callFunc(function(){
            //    this._body.clearTrack(TRACK_CAST);
            //}.bind(this))]));
        },

        idle: function () {
            this._super();
            this._body.setAnimation(TRACK_IDLE, "idle", true);
            this._currTrackIndex = TRACK_IDLE;
        },

        idleDelay: function () {
            this._body.clearTracks();
            this._body.setToSetupPose();
            this._body.addAnimation(TRACK_IDLE, "idle", true, bb.utility.randomInt(1, 5) * 0.1);
            this._currTrackIndex = TRACK_IDLE;
        },

        attack: function (name) {
            this._isBacking = false;
            var trackIndex = TRACK_ATTACK;
            if (name === "skillActive") {
                trackIndex = TRACK_ACTIVE_SKILL;
            }
            else if (name === "skillAuto") {
                trackIndex = TRACK_AUTO_SKILL;
            }
            this.stopActionByTag(TAG_BACK_TO);
            this.stopActionByTag(TAG_MOVE_TO);
            this._body.clearTracks();
            this._body.setToSetupPose();
            this._body.setAnimation(trackIndex, name || "attack", false);
            this._currTrackIndex = trackIndex;

            // auto call 'back' event if animation do not trigger event 'back'
            var actionEndTurn = cc.sequence([cc.delayTime(3.5), cc.callFunc(function () {
                var mapCallback = this._customMapCallbackSpineEvent || mappingAnimationFunc;
                var userData = this.getUserData();
                var assetData = null;
                if (userData) {
                    if (userData.getResourceId) {
                        assetData = mc.dictionary.getCreatureAssetByIndex(userData.getResourceId());
                    }
                    else {
                        assetData = mc.dictionary.getCreatureAssetByIndex(mc.HeroStock.getHeroIndex(userData));
                    }
                }
                mapCallback["back"] && mapCallback["back"](assetData, this);
            }.bind(this))]);
            actionEndTurn.setTag(TAG_END_TURN);
            this.runAction(actionEndTurn);
        },

        _playSoundHurt: function () {
            var assetData = mc.dictionary.getCreatureAssetByIndex(this._indexResource);
            if (assetData) {
                var url = assetData.getSoundHurt();
                url && this.runAction(cc.sequence([cc.delayTime(0.001), cc.sound(url)]));
            }
        },

        isDoingAttackAnimation: function () {
            return this._currTrackIndex === TRACK_ATTACK ||
                this._currTrackIndex === TRACK_ACTIVE_SKILL ||
                this._currTrackIndex === TRACK_AUTO_SKILL;
        },

        isBeingEffecting: function () {
            return this._currTrackIndex === TRACK_BE_FREEZING ||
                this._currTrackIndex === TRACK_BE_STUNNING;
        },

        hurt: function () {
            this._body.runAction(cc.shake(0.2, cc.size(10, 0)));
            if (!this.isDoingAttackAnimation() && !this.isBeingEffecting()) {
                this._body.clearTracks();
                this._body.setToSetupPose();
                this._body.setAnimation(TRACK_HURT, "hurt", false);
                this._currTrackIndex = TRACK_HURT;
            }
            this._playSoundHurt();
        },

        beEffecting: function (isOver) {
            var creature = this.getUserData();
            if (creature.getBattleField && creature.getBattleField()) {
                if (creature.isFreezing()) {
                    if (this._currTrackIndex != TRACK_BE_FREEZING) {
                        this._body.clearTracks();
                        this._body.setToSetupPose();
                        this._body.setAnimation(TRACK_BE_FREEZING, "freeze", true);
                        this._currTrackIndex = TRACK_BE_FREEZING;

                        this._performBackEvent();
                    }
                }
                else if (creature.isStunning()) {
                    if (this._currTrackIndex != TRACK_BE_STUNNING) {
                        this._body.clearTracks();
                        this._body.setToSetupPose();
                        this._body.setAnimation(TRACK_BE_STUNNING, "stun", true);
                        this._currTrackIndex = TRACK_BE_STUNNING;

                        this._performBackEvent();
                    }
                }
                else if (creature.isHiding()) {
                    this._body.opacity = 128;
                    !cc.sys.isNative && (this._body.color = mc.color.BLACK_DISABLE_SOFT);
                }
                else {
                    if (isOver) {
                        this._body.opacity = 255;
                        !cc.sys.isNative && (this._body.color = mc.color.WHITE_NORMAL);
                        this._body.clearTracks();
                        this._body.setToSetupPose();
                        this.idle();
                    }
                }
            }
        },

        dead: function (noFireEvent) {
            this._super();
            this._body.clearTracks();
            this._body.setToSetupPose();
            this._body.setAnimation(TRACK_DEAD, "hurt", false);
            this._currTrackIndex = TRACK_DEAD;
            this._playSoundHurt();
            if (!noFireEvent) {
                var cr = this.getUserData();
                if (cr && !cr.isReviving()) {
                    this._performBackEvent();
                }
            }
        },

        _performBackEvent: function () {
            var mapCallback = this._customMapCallbackSpineEvent || mappingAnimationFunc;
            var userData = this.getUserData();
            var assetData = null;
            if (userData) {
                if (userData.getResourceId) {
                    assetData = mc.dictionary.getCreatureAssetByIndex(userData.getResourceId());
                }
                else {
                    assetData = mc.dictionary.getCreatureAssetByIndex(mc.HeroStock.getHeroIndex(userData));
                }
            }
            this.stopActionByTag(TAG_END_TURN);
            mapCallback["back"] && mapCallback["back"](assetData, this);
        },

        cheer: function (loop) {
            loop = loop || true;
            this._body.clearTracks();
            this._body.setToSetupPose();
            this._body.setAnimation(TRACK_CHEER, "cheer", loop);
            this._currTrackIndex = TRACK_CHEER;
        },

        beBuff: function () {
            if (this._currTrackIndex === TRACK_IDLE) {
                this._body.clearTracks();
                this._body.setToSetupPose();
                this._body.setAnimation(TRACK_BE_BUFF, "cheer", false);
                this._currTrackIndex = TRACK_BE_BUFF;
            }
        },

        cheerDelay: function () {
            this._body.clearTracks();
            this._body.setToSetupPose();
            this._body.addAnimation(TRACK_CHEER, "cheer", true, bb.utility.randomInt(1, 5) * 0.1);
            this._currTrackIndex = TRACK_CHEER;
        }

    });

}());
