/**
 * Created by long.nguyen on 8/3/2017.
 */
mc.ComboBox = ccui.Layout.extend({

    ctor: function (title, brk) {
        this._super();

        var xLR = 8;

        cc.spriteFrameCache.addSpriteFrames(res.patch9_2_plist);
        var updatePos = false;
        if (!brk) {
            brk = new ccui.ImageView("patch9/Small_Brown_Panel.png", ccui.Widget.PLIST_TEXTURE);
            brk.width = 246;
            brk.setScale9Enabled(true);
            this.addChild(brk);
            updatePos = true;
        }

        var lblTitle = mc.GUIFactory.createText(title || "", res.font_cam_stroke_32_export_fnt);
        var lblSelect = this._lblSelect = mc.GUIFactory.createText("Rarity", res.font_cam_stroke_32_export_fnt);
        lblSelect.setColor(mc.color.BLUE_SOFT);
        lblSelect.anchorX = 1.0;
        var iconArrow = new cc.Sprite("#button/Yellow_Arrow.png");
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = brk.width;
        this.height = brk.height;

        if (updatePos) {
            brk.x = this.width * 0.5;
            brk.y = this.height * 0.5;
        }

        lblTitle.x = xLR + lblTitle.width * 0.5;
        lblTitle.y = this.height * 0.65;
        lblSelect.x = this.width * 0.85;
        lblSelect.y = this.height * 0.65;
        iconArrow.x = this.width - xLR - iconArrow.width * 0.5;
        iconArrow.y = this.height * 0.48;

        this.addChild(lblTitle);
        this.addChild(lblSelect);
        this.addChild(iconArrow);
        this.setCascadeOpacityEnabled(true);
    },

    getCurrentIndex: function () {
        return this._currIndex;
    },

    setDataSource: function (arrSource, currIndex, selectFunc) {
        this._currIndex = currIndex;
        this._lblSelect.setString(arrSource[currIndex]);
        this.registerTouchEvent(function () {
            this.setEnabled(false);
            new mc.PopupDialog(this, arrSource, function (index) {
                this.setEnabled(true);
                if (index != undefined) {
                    if (this._currIndex != index) {
                        this._currIndex = index;
                        this._lblSelect.setString(arrSource[index]);
                        selectFunc && selectFunc(this, index);
                    }
                }
            }.bind(this)).show();
        }.bind(this));
    }

});