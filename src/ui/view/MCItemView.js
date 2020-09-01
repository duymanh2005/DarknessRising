/**
 * Created by long.nguyen on 7/28/2017.
 */
mc.ItemView = ccui.Widget.extend({

    ctor: function (itemInfo) {
        this._super();
        this.setItemInfo(itemInfo);
    },

    registerViewItemInfo: function () {
        this._registerTouchEvent();
        return this;
    },

    _createItemRank: function (rank) {
        var url = "patch9/Item_Rank1.png";
        if (rank === 2) {
            url = "patch9/Item_Rank2.png";
        }
        else if (rank === 3) {
            url = "patch9/Item_Rank3.png";
        }
        else if (rank === 4) {
            url = "patch9/Item_Rank4.png";
        }
        else if (rank === 5) {
            url = "patch9/Item_Rank5.png";
        }
        return new ccui.ImageView(url, ccui.Widget.PLIST_TEXTURE);
    },

    setStatusText: function (statusText) {
        statusText = statusText || "";
        var lblPartyStatus = this.getChildByName("lblPartyStatus");
        if (!lblPartyStatus) {
            lblPartyStatus = this._lblPartyStatus = bb.framework.getGUIFactory().createText(statusText);
            lblPartyStatus.setColor(mc.color.GREEN_NORMAL);
            lblPartyStatus.setName("lblPartyStatus");
            lblPartyStatus.x = this.width * 0.5;
            lblPartyStatus.y = this.height * 0.5;
            lblPartyStatus.setLocalZOrder(99);
            this.addChild(lblPartyStatus);
        }
        lblPartyStatus.setString(mc.dictionary.getGUIString(statusText));
        lblPartyStatus.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        this.setBlack(statusText != "");
        return lblPartyStatus;
    },

    setPackNumberText: function (statusText) {
        statusText = statusText || "";
        var lblPartyStatus = this.getChildByName("lblPackNumberStatus");
        if (!lblPartyStatus) {
            lblPartyStatus = this._lblPackNumberStatus = bb.framework.getGUIFactory().createText(statusText, res.font_cam_stroke_32_export_fnt, mc.const.FONT_SIZE_32);
            lblPartyStatus.setColor(mc.color.GREEN_NORMAL);
            lblPartyStatus.setName("lblPackNumberStatus");
            lblPartyStatus.x = this.width * 0.5;
            lblPartyStatus.y = this.height * 0.8;
            lblPartyStatus.setLocalZOrder(99);
            this.addChild(lblPartyStatus);
        }
        lblPartyStatus.setString(mc.dictionary.getGUIString(statusText));
        lblPartyStatus.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
        return lblPartyStatus;
    },

    setItemInfo: function (itemInfo) {
        this.removeAllChildren();
        this.setUserData(itemInfo);
        var heroSoul = mc.ItemStock.getItemHeroSoul(itemInfo);
        if (heroSoul) {
            var heroAvtView = this._heroAvtView = new mc.HeroAvatarView(heroSoul, null, true);
            heroAvtView.x = heroAvtView.width * 0.5;
            heroAvtView.y = heroAvtView.height * 0.5;
            this.width = heroAvtView.width;
            this.height = heroAvtView.height;
            this.addChild(heroAvtView);

            var animateShiny = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_shiny_icon_fx_json, res.spine_ui_shiny_icon_fx_atlas, 1.1);
            this.addChild(animateShiny);
            animateShiny.setPosition(heroAvtView.x, heroAvtView.y);
            animateShiny.setAnimation(0, "shinyIconfx", true);

            var animateVip = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_vip_avatar_json, res.spine_ui_vip_avatar_atlas, 1.1);
            this.addChild(animateVip);
            animateVip.anchorX = 0.5;
            animateVip.anchorY = 0.5;
            animateVip.setPosition(heroAvtView.width / 2, heroAvtView.height / 2);
            animateVip.setAnimation(0, "Avatar", true);
        }
        else {
            var brk = this._brk = this._createItemRank(mc.ItemStock.getItemRank(itemInfo));
            brk.setName("_brk");
            this.addChild(brk);
            var itemURL = mc.ItemStock.getItemRes(itemInfo);
            var img = this._img = new ccui.ImageView(itemURL, ccui.Widget.LOCAL_TEXTURE);
            this.addChild(img);

            this.updateQuantity();

            var level = mc.ItemStock.getItemLevel(itemInfo);
            var lvlBG = this._lblLevelBG = new ccui.ImageView("patch9/pnl_maskname.png", ccui.Widget.PLIST_TEXTURE);
            var lblLevel = this._lblLevel = mc.GUIFactory.createText("+" + level);
            img.addChild(lblLevel, 1);
            lblLevel.setAnchorPoint(1, 0.5);
            lblLevel.setScale(0.75);
            img.addChild(lvlBG);
            img.setCascadeOpacityEnabled(true);
            this._lblLevelBG.x = this._img.width * 0.61;
            this._lblLevelBG.y = this._img.height * 0.79;
            lblLevel.x = lvlBG.x + lvlBG.width / 2;
            lblLevel.y = lvlBG.y + lvlBG.height * 0.2;
            lvlBG.setVisible(level > 1);
            lblLevel.setVisible(level > 1);

            if(level >= 7){
                var animateShiny = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_shiny_icon_fx_json, res.spine_ui_shiny_icon_fx_atlas, 1.1);
                img.addChild(animateShiny);
                animateShiny.anchorX = 0;
                animateShiny.anchorY = 0;
                animateShiny.setPosition(img.width/2, img.height/2);
                animateShiny.setAnimation(0, "shinyIconfx", true);
            }

            this.setNewContentSize(cc.size(brk.width, brk.height));
        }
        this.setEnabled = function (isEnable) {
            ccui.Widget.prototype.setEnabled.call(this, isEnable);
            if (this._heroAvtView) {
                this._heroAvtView.setEnabled(isEnable);
            }
        }.bind(this);
        this.setCascadeOpacityEnabled(true);
        var itemByIndex = mc.dictionary.getItemByIndex(itemInfo["index"]);
        var itemSkillOption = mc.ItemStock.getItemSkillOption(itemInfo);
        if (itemSkillOption && itemSkillOption.length > 0 || (itemByIndex && itemByIndex["optionIndex"])) {
            var numOwnSkill = itemSkillOption ? itemSkillOption.length : 0;
            var numNextSkill = itemByIndex ? itemByIndex["optionIndex"] : 1;
            this.initItemOption(Math.max(numNextSkill, numOwnSkill));
        }
        return this;
    },

    hideBrk: function () {
        var brk = this.getChildByName("_brk");
        if (brk) {
            brk.setVisible(false);
        }
    },

    initItemOption: function (numOption) {
        var spineOption = this.getChildByName("itemOption");
        if (spineOption) {
            spineOption.removeFromParent();
        }
        if (this._img) {
            var x = 30;
            for (var i = 0; i < numOption; i++) {
                spineOption = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_optiondot_json, res.spine_ui_optiondot_atlas, 1.0);
                spineOption.setAnimation(0, "optiondot", true);
                spineOption.setPosition(x, 30);
                spineOption.setScale(1.5);
                this._img.addChild(spineOption);
                x += 15 * 1.5;
            }
        }
    },

    setBlack: function (isBlack) {
        this.isBlack = isBlack;
        if (!isBlack) {
            this._brk && this._brk.setColor(mc.color.WHITE_NORMAL);
            this._img && this._img.setColor(mc.color.WHITE_NORMAL);
            this._lblQuantity && this._lblQuantity.setColor(mc.color.WHITE_NORMAL);
            this._lblLevel && this._lblLevel.setColor(mc.color.WHITE_NORMAL);
        }
        else {
            this._brk && this._brk.setColor(mc.color.BLACK_OVER_ITEM);
            this._img && this._img.setColor(mc.color.BLACK_OVER_ITEM);
            this._lblQuantity && this._lblQuantity.setColor(mc.color.BLACK_OVER_ITEM);
            this._lblLevel && this._lblLevel.setColor(mc.color.BLACK_OVER_ITEM);
        }
        this._heroAvtView && this._heroAvtView.setBlack(isBlack);
    },

    setClickFocus: function (focus) {
        var focusView = this._focusClickView;
        if (!focusView) {
            var focusView = this._focusClickView = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_item_panel_focus_json, res.spine_ui_item_panel_focus_atlas, 1.0);
            focusView.setName("itemFocus");
            focusView.scale = 0.95;
            focusView.x = 70;
            focusView.y = 75;
            focusView.setAnimation(0, "focus_idle", true);
            this.addChild(focusView);
        }
        focusView.setVisible(focus);
    },

    getQuantityLabel: function () {
        return this._lblQuantity;
    },

    getLevelLabel: function () {
        return this._lblLevel;
    },

    getLevelLabelBrk: function () {
        return this._lblLevelBG;
    },

    getHeroAvatarView: function () {
        return this._heroAvtView;
    },

    getBackground: function () {
        return this._brk;
    },

    updateQuantity: function (itemInfo) {
        if (!this._lblQuantity) {
            this._lblQuantity = mc.GUIFactory.createText("");
            this.addChild(this._lblQuantity);
        }
        else {
            this.setUserData(itemInfo || mc.GameData.itemStock.getItemById(mc.ItemStock.getItemId(this.getUserData())));
        }
        var quantity = mc.ItemStock.getItemQuantity(this.getUserData());
        if (mc.ItemStock.getItemIndex(this.getUserData()) === mc.const.ITEM_INDEX_RELIC_COIN) {
            this._lblQuantity.setString("x" + bb.utility.formatNumber(quantity));
        }
        else {
            this._lblQuantity.setString("x" + bb.utility.formatNumberKM(quantity));
        }
        this._lblQuantity.setVisible(quantity > 1);
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

    setDetailQuantityMode: function (needQuantity) {
        if (this._lblQuantity) {
            this._lblQuantity.setVisible(false);
        }
        var lblQuantityDetail = this.getChildByName("lblQuantityDetail");
        if (lblQuantityDetail) {
            lblQuantityDetail.removeFromParent();
        }
        var currQuantity = mc.ItemStock.getItemQuantity(this.getUserData());
        lblQuantityDetail = mc.GUIFactory.createText("x" + bb.utility.formatNumber(currQuantity));
        lblQuantityDetail.setName("lblQuantityDetail");
        this.addChild(lblQuantityDetail);
        lblQuantityDetail.setDecoratorLabel("/" + bb.utility.formatNumber(needQuantity));
        if (currQuantity < needQuantity) {
            lblQuantityDetail.setColor(mc.color.RED);
        }
        else {
            lblQuantityDetail.setColor(mc.color.GREEN);
        }
        lblQuantityDetail.x = this.width * 0.5;
        lblQuantityDetail.y = 8;
        return lblQuantityDetail;
    },

    setNewScale: function (scale) {
        this.scale = scale;
        this.setNewContentSize(cc.size(this.width * this.scale, this.height * this.scale));
        return this;
    },

    _registerTouchEvent: function () {
        var cb = function (itemView) {
            if (itemView.getHeroAvatarView()) {
                new mc.HeroInfoDialog(itemView.getHeroAvatarView().getUserData()).show();
            }
            else {
                mc.createItemPopupDialog(itemView.getUserData()).show();
            }
        };
        this.registerTouchEvent(cb, cb);
        this.setSwallowTouches(false);
    },

    setNewContentSize: function (size) {
        this.width = size.width;
        this.height = size.height;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        if (this._brk && this._img && this._lblQuantity) {
            this._brk.x = this.width * 0.5;
            this._brk.y = this.height * 0.5;
            this._img.x = this.width * 0.5;
            this._img.y = this.height * 0.5;
            this._lblQuantity.x = this.width * 0.5;
            this._lblQuantity.y = 8;
        }
        if (this._lblPartyStatus) {
            this._lblPartyStatus.x = this.width * 0.5;
            this._lblPartyStatus.y = this.height * 0.5;
        }
        if (this._lblPackNumberStatus) {
            this._lblPackNumberStatus.x = this.width * 0.5;
            this._lblPackNumberStatus.y = this.height * 0.8;
        }
        if (this._heroAvtView) {
            this._heroAvtView.x = this.width * 0.5;
            this._heroAvtView.y = this.height * 0.5;
        }
        this.ignoreContentAdaptWithSize(true);
    }

});
mc.ItemView.getRankText = function (rank) {
    var text = "Normal";
    var color = mc.color.WHITE_NORMAL;
    if (rank === 2) {
        text = "Special";
        color = cc.hexToColor("#488fff");
    }
    else if (rank === 3) {
        text = "Excellent";
        color = cc.hexToColor("#33c20e");
    }
    else if (rank === 4) {
        text = "Epic";
        color = cc.hexToColor("#b852f4");
    }
    else if (rank === 5) {
        text = "Legend";
        color = cc.hexToColor("#ebc309");
    }
    var s = mc.dictionary.getGUIString("lblRank" + text);
    return {text: s, color: color};
};
