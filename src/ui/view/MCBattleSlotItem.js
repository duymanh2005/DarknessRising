/**
 * Created by long.nguyen on 11/24/2017.
 */
mc.BattleSlotItem = cc.Node.extend({
    _currCountDown: 0,
    _enableSlot: true,

    ctor: function (consumeInfo, useQuantity, currCountDown) {
        this._super();
        useQuantity = useQuantity || 0;
        var brk = this._brk = new ccui.ImageView("button/Item_Panel.png", ccui.Widget.PLIST_TEXTURE);
        brk.x = brk.width * 0.5;
        brk.y = brk.height * 0.5;
        brk.setName("brk");
        this.addChild(brk);

        if (consumeInfo) {
            var localZ = 0;
            var img = this._img = new ccui.ImageView(mc.ItemStock.getItemRes(consumeInfo), ccui.Widget.LOCAL_TEXTURE);
            img.setLocalZOrder(++localZ);
            img.scale = 0.75;
            img.x = brk.width * 0.5;
            img.y = brk.height * 0.5;

            var dragImage = this._dragImage = new ccui.ImageView(mc.ItemStock.getItemRes(consumeInfo), ccui.Widget.LOCAL_TEXTURE);
            dragImage.setLocalZOrder(++localZ);
            dragImage.scale = 0.75;
            dragImage.x = brk.width * 0.5;
            dragImage.y = brk.height * 0.5;

            var lblQuantity = this._lblQuantity = mc.GUIFactory.createText("x" + bb.utility.formatNumber(mc.ItemStock.getItemQuantity(consumeInfo) - useQuantity));
            lblQuantity.setLocalZOrder(++localZ);
            lblQuantity.x = brk.width * 0.5;
            lblQuantity.y = lblQuantity.height * 0.5;

            var coolDownPanel = this._coolDownPanel = new ccui.Layout();
            coolDownPanel.setVisible(false);
            coolDownPanel.setLocalZOrder(++localZ);
            coolDownPanel.x = brk.width * 0.5;
            coolDownPanel.y = brk.height * 0.5;
            coolDownPanel.x = 0.5;
            coolDownPanel.y = 0.5;
            coolDownPanel.width = brk.width - 3;
            coolDownPanel.height = brk.height - 3;
            coolDownPanel.setBackGroundColorOpacity(bb.framework.getTrueOpacity(100));
            coolDownPanel.setBackGroundColor(cc.color.BLACK);
            coolDownPanel.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);

            var lblCountDown = this._lblCountDown = mc.GUIFactory.createText("" + 0);
            lblCountDown.setVisible(false);
            lblCountDown.setLocalZOrder(++localZ);
            lblCountDown.x = brk.width * 0.5;
            lblCountDown.y = brk.height * 0.6;

            this.addChild(img);
            this.addChild(dragImage);
            this.addChild(lblQuantity);
            this.addChild(coolDownPanel);
            this.addChild(lblCountDown);
            this.setUserData(consumeInfo);
        }
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = brk.width;
        this.height = brk.height;
        this.setCountDown(currCountDown);
    },

    setEnableSlot: function (enable) {
        this._enableSlot = enable;
        if (enable) {
            this.setColor(mc.color.WHITE_NORMAL);
            this._img && this._img.setColor(mc.color.WHITE_NORMAL);
            this._dragImage && this._dragImage.setColor(mc.color.WHITE_NORMAL);
            this._lblQuantity && this._lblQuantity.setColor(mc.color.WHITE_NORMAL);
            this._brk && this._brk.setColor(mc.color.WHITE_NORMAL);
        }
        else {
            this.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._img && this._img.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._dragImage && this._dragImage.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._lblQuantity && this._lblQuantity.setColor(mc.color.BLACK_DISABLE_SOFT);
            this._brk && this._brk.setColor(mc.color.BLACK_DISABLE_SOFT);
        }
        this._dragImage && this._dragImage.setEnabled(this._enableSlot && this._currCountDown <= 0);
    },

    startCountDown: function () {
        var skillInfo = mc.ItemStock.getItemSkillInfo(this.getUserData());
        if (skillInfo) {
            this._currCountDown = skillInfo.getCooldown();
            this._updateCountDown();
        }
    },

    setCountDown: function (countDown) {
        this._currCountDown = countDown;
        this._updateCountDown();
    },

    getCurrentCountDown: function () {
        return this._currCountDown;
    },

    useItem: function (useQuantity) {
        this.startCountDown();
        var remainQuantity = mc.ItemStock.getItemQuantity(this.getUserData()) - useQuantity;
        if (remainQuantity <= 0) {
            this._img.removeFromParent();
            this._dragImage.removeFromParent();
            this._lblQuantity.removeFromParent();
            this._coolDownPanel.removeFromParent();
            this._lblCountDown.removeFromParent();
            this._img = null;
            this._dragImage = null;
            this._lblQuantity = null;
            this._coolDownPanel = null;
            this._lblCountDown = null;
        }
        else {
            this._lblQuantity && this._lblQuantity.setString("x" + bb.utility.formatNumber(remainQuantity));
            bb.sound.playEffect(res.sound_ui_battle_item_use);
        }
    },

    countDown: function () {
        if (this._currCountDown > 0) {
            this._currCountDown--;
            this._currCountDown < 0 && (this._currCountDown = 0);
            this._updateCountDown();
        }
    },

    _updateCountDown: function () {
        this._coolDownPanel && this._coolDownPanel.setVisible(this._currCountDown > 0);
        this._lblCountDown && this._lblCountDown.setVisible(this._currCountDown > 0);
        this._lblCountDown && this._lblCountDown.setString(this._currCountDown);
        this._lblQuantity && (this._lblQuantity.opacity = this._currCountDown <= 0 ? 255 : 75);
        this._dragImage && this._dragImage.setEnabled(this._enableSlot && this._currCountDown <= 0);
    },

    stopDragAble: function () {
        if (this._dragImage) {
            this._dragImage.stopDragAble();
        }
    },

    registerDragAble: function (arrSourceView, callback) {
        if (this._dragImage) {
            mc.view_utility.registerDragAble(this._dragImage, arrSourceView, function (dragImage, swapIndex) {
                if (this._enableSlot && this._currCountDown <= 0) {
                    var cloneItemView = dragImage.clone();
                    cloneItemView.setEnabled(false);
                    var pos = dragImage.getParent().convertToWorldSpace(cc.p(dragImage.x, dragImage.y));
                    cloneItemView.x = pos.x;
                    cloneItemView.y = pos.y;
                    cloneItemView.runAction(cc.sequence([cc.fadeOut(0.2), cc.moveBy(0.2, 0, 50), cc.removeSelf()]));
                    bb.director.getCurrentScreen().addChild(cloneItemView);

                    dragImage.setVisible(false);
                    dragImage.runAction(cc.sequence([cc.delayTime(0.15), cc.callFunc(function () {
                        dragImage.setVisible(true);
                        dragImage.setEnabled(false);
                    })]));

                    callback && callback(this, swapIndex);
                }
            }.bind(this), cc.size(this._dragImage.width * 0.5, this._dragImage.height * .65), bb.collection.createArray(arrSourceView.length, function (index) {
                return cc.size(arrSourceView[index].width * 0.8, arrSourceView[index].height * 0.8);
            }.bind(this)));
        }
    }

});