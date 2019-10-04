/**
 * Created by long.nguyen on 5/12/2017.
 */
mc.HeroAvatarView = ccui.Widget.extend({
    isBlack: false,

    ctor: function (heroInfo, statusObject) {
        this._super();
        this.setHeroInfo(heroInfo, statusObject);
    },

    setStatusText: function (statusText, color) {
        statusText = statusText || "";
        color = color || mc.color.GREEN_NORMAL;
        var lblPartyStatus = this.getChildByName("lblPartyStatus");
        if (!lblPartyStatus) {
            lblPartyStatus = bb.framework.getGUIFactory().createText(statusText);
            if(mc.enableReplaceFontBM())
            {
                lblPartyStatus.scale = 0.8;
            }
            lblPartyStatus.setColor(color);
            lblPartyStatus.setName("lblPartyStatus");
            lblPartyStatus.x = this.width * 0.5;
            lblPartyStatus.y = (this.height - this._brk.height) + this._brk.height * 0.5;
            lblPartyStatus.setLocalZOrder(99);
            this.addChild(lblPartyStatus);
        } else {
            lblPartyStatus.setString(mc.dictionary.getGUIString(statusText));
        }
        lblPartyStatus.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.setBlack(statusText != "");
    },

    setPick: function (isPick) {
        this.setBlack(isPick);
        var iconPick = this.getChildByName("iconPick");
        if (!iconPick) {
            iconPick = new ccui.ImageView("icon/Check.png", ccui.Widget.PLIST_TEXTURE);
            iconPick.setName("iconPick");
            iconPick.scale = 0.5;
            iconPick.x = this.width * 0.8;
            iconPick.y = this.height * 0.8;
            this.addChild(iconPick);
        }
        iconPick.setVisible(isPick);
    },

    setHeroInfo: function (heroInfo, statusObject) {
        var brk = null;
        this.removeAllChildren();
        var heightBar = 0;
        if (heroInfo) {

            var element = mc.HeroStock.getHeroElement(heroInfo);
            if (!element) {
                element = mc.dictionary.getHeroDictByIndex(mc.HeroStock.getHeroIndex(heroInfo)).element;
            }
            element = element.toLowerCase();
            var urlBrk = null;
            var asset = mc.dictionary.getCreatureAssetByIndex(heroInfo.index);
            var urlIcon = asset && asset.getIconURL();
            if (!cc.spriteFrameCache.getSpriteFrame(urlIcon)) {
                urlIcon = "png/char/icon/Unknow.png";
            }
            if (element === mc.const.ELEMENT_FIRE) {
                urlBrk = "patch9/Fire_Panel.png";
            } else if (element === mc.const.ELEMENT_WATER) {
                urlBrk = "patch9/Water_Panel.png";
            } else if (element === mc.const.ELEMENT_EARTH) {
                urlBrk = "patch9/Earth_Panel.png";
            } else if (element === mc.const.ELEMENT_DARK) {
                urlBrk = "patch9/Dark_Panel.png";
            } else if (element === mc.const.ELEMENT_LIGHT) {
                urlBrk = "patch9/Light_Panel.png";
            }

            brk = this._brk = new ccui.ImageView(urlBrk, ccui.Widget.PLIST_TEXTURE);
            this.addChild(brk);

            var avt = this._avt = new ccui.ImageView(urlIcon, ccui.Widget.PLIST_TEXTURE);
            this.addChild(avt);

            var crystalView = this._crystalView = mc.view_utility.createHeroCrystalView(heroInfo);
            this.addChild(crystalView);

            var yBar = 0;
            if (statusObject) {
                var margin = 5;
                var brkProgressHp = new cc.Sprite("#bar/Small_Frame.png");
                var hpProgress = new cc.ProgressTimer(new cc.Sprite("#bar/Small_HP.png"));
                hpProgress.barChangeRate = cc.p(1.0, 0.0);
                hpProgress.midPoint = cc.p(0.0, 1.0);
                hpProgress.type = cc.ProgressTimer.TYPE_BAR;
                var brkProgressMp = new cc.Sprite("#bar/Small_Frame.png");
                var mpProgress = new cc.ProgressTimer(new cc.Sprite("#bar/Small_MP.png"));
                mpProgress.barChangeRate = cc.p(1.0, 0.0);
                mpProgress.midPoint = cc.p(0.0, 1.0);
                mpProgress.type = cc.ProgressTimer.TYPE_BAR;

                brkProgressHp.scaleX = hpProgress.scaleX = brkProgressMp.scaleX = mpProgress.scaleX = 1.1;
                hpProgress.setPercentage(statusObject.hpPercent / mc.CreatureInfo.CAST_LONG_RATE * 100);
                mpProgress.setPercentage(statusObject.mpPercent / mc.CreatureInfo.CAST_LONG_RATE * 100);

                this.addChild(brkProgressHp);
                this.addChild(hpProgress);
                this.addChild(brkProgressMp);
                this.addChild(mpProgress);

                var xProgress = brk.width * 0.5;

                brkProgressHp.x = brkProgressMp.x = hpProgress.x = mpProgress.x = xProgress;
                brkProgressMp.y = mpProgress.y = margin * 2 + brkProgressMp.height * 0.5;
                brkProgressHp.y = hpProgress.y = margin * 3 + brkProgressHp.height * 1.5;

                heightBar = brkProgressHp.height * 2 + margin * 3;
                yBar += heightBar;

                if (statusObject.hpPercent <= 0) {
                    var sprDead = this._sprDead = new cc.Sprite("#text/text_dead.png");
                    sprDead.scale = 0.75;
                }
            }

            crystalView.x = 28.5;
            crystalView.y = 112 + yBar;

            var rank = mc.HeroStock.getHeroRank(heroInfo);
            var lvl = mc.HeroStock.getHeroLevel(heroInfo);

            var layoutStar = this._layoutStar = bb.layout.linear(bb.collection.createArray(rank, function (index) {
                return new ccui.ImageView("icon/Star.png", ccui.Widget.PLIST_TEXTURE);
            }), 0);
            layoutStar.setCascadeOpacityEnabled(true);
            layoutStar.setCascadeColorEnabled(true);
            layoutStar.scale = 0.6;
            layoutStar.x = brk.width * 0.5;
            layoutStar.y = layoutStar.height * 0.5 + yBar;
            this.addChild(layoutStar);

            var lvlBG = this._lblLevelBG = new ccui.ImageView("patch9/pnl_maskname.png", ccui.Widget.PLIST_TEXTURE);

            if(mc.enableReplaceFontBM())
            {
                var lblLevel = this._lblLvl = mc.view_utility.createTextFromFontBitmap(res.font_cam_stroke_32_export_fnt);
                lblLevel.setString("Lv." + lvl);
                lblLevel.setFontSize(22);
                lblLevel.setAnchorPoint(1, 0.5);
                lvlBG.addChild(lblLevel);
                lblLevel.x = lvlBG.width - 5;
                lblLevel.y = lvlBG.height * 0.5 - 5;
            }
            else
            {
                var lblLevel = this._lblLvl = mc.GUIFactory.createText("Lv." + lvl);
                lblLevel.setAnchorPoint(1, 0.5);
                lvlBG.addChild(lblLevel);
                lblLevel.x = lvlBG.width;
                lblLevel.y = lvlBG.height * 0.6;
            }

            avt.addChild(lvlBG);
            lvlBG.setCascadeOpacityEnabled(true);
            avt.setCascadeOpacityEnabled(true);
            this._lblLevelBG.x = avt.width * 0.57;
            this._lblLevelBG.y = avt.height * 0.79;
            this.setCascadeOpacityEnabled(true);

        } else {
            brk = new ccui.ImageView("patch9/Unavailable.png", ccui.Widget.PLIST_TEXTURE);
            this.addChild(brk);
        }

        brk.x = brk.width * 0.5;
        brk.y = heightBar + brk.height * 0.5;
        avt.x = brk.x;
        avt.y = brk.y;
        if (this._sprDead) {
            this._sprDead.x = brk.x;
            this._sprDead.y = brk.y;
            this.setGray(true);
            this.addChild(this._sprDead);
        }
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = brk.width;
        this.height = brk.height + heightBar;
        this.setUserData(heroInfo);
    },

    setBlack: function (isBlack) {
        this.isBlack = isBlack;
        if (!isBlack) {
            this._brk.setColor(mc.color.WHITE_NORMAL);
            this._avt.setColor(mc.color.WHITE_NORMAL);
            this._lblLvl.setColor(mc.color.WHITE_NORMAL);
            this._layoutStar.setColor(mc.color.WHITE_NORMAL);
            this._crystalView.setColor(mc.color.WHITE_NORMAL);
        } else {
            this._brk.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._avt.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._lblLvl.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._layoutStar.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._crystalView.setColor(mc.color.BLACK_DISABLE_SOFT);
        }
    },

    isGray: function () {
        return this._isGray;
    },

    setGray: function (isGray) {
        this._isGray = isGray;
        this._brk && this._brk.setGray && this._brk.setGray(isGray);
        this._avt && this._avt.setGray && this._avt.setGray(isGray);
        this._lblLvl && this._lblLvl.setGray && this._lblLvl.setGray(isGray);
        var childs = this._crystalView.getChildren();
        if (childs) {
            for (var i = 0; i < childs.length; i++) {
                childs[i].setGray && childs[i].setGray(isGray);
            }
        }
        childs = this._layoutStar.getChildren();
        if (childs) {
            for (var i = 0; i < childs.length; i++) {
                childs[i].setGray && childs[i].setGray(isGray);
            }
        }
        this.setEnabled(false);
    },

    getLabelLevel: function () {
        return this._lblLvl;
    },

    setNewContentSize: function (size) {
        this.width = size.width;
        this.height = size.height;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        if (this._brk && this._lblLvl && this._avt) {
            this._brk.x = this.width * 0.5;
            this._brk.y = this.height * 0.5;
            this._avt.x = this.width * 0.5;
            this._avt.y = this.height * 0.5;
            this._lblLvl.x = this.width * 0.5;
            this._lblLvl.y = this.height - 17;
            this._layoutStar.x = this.width * 0.5;
            this._layoutStar.y = 8;
        }
        if (this._lblPartyStatus) {
            this._lblPartyStatus.x = this.width * 0.5;
            this._lblPartyStatus.y = this.height * 0.5;
        }
        this.ignoreContentAdaptWithSize(true);
    },

    setSelected: function (isSelected) {
        var selectSpr = this.getChildByName("selectSpr");
        if (!selectSpr) {
            selectSpr = new cc.Sprite("#patch9/pnl_selected.png");
            selectSpr.setName("selectSpr");
            this.addChild(selectSpr);
        }
        selectSpr.x = this.width * 0.5;
        selectSpr.y = this.height * 0.5;
        selectSpr.setVisible(isSelected);
    },

    setNewScale: function (scale) {
        this.scale = scale;
        this.setNewContentSize(cc.size(this.width * this.scale, this.height * this.scale));
    },

    setVisibleSurfaceInfo: function (isVisible) {
        this._layoutStar.setVisible(isVisible);
        this._lblLvl.setVisible(isVisible);
        this._lblLevelBG.setVisible(isVisible);
        return this;
    },

    getLayoutStar: function () {
        return this._layoutStar;
    },

    clone: function () {
        var view = new mc.HeroAvatarView(this.getUserData());
        view.x = this.x;
        view.y = this.y;
        return view;
    }

});