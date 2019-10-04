/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.ColorNumberView = cc.Node.extend({

    ctor: function () {
        this._super();
        this.setCascadeOpacityEnabled(true);
    },

    setCriticalEnable: function (crit) {
        this._isCrit = crit;
    },

    setTypeNumber: function (type, str, pad , ay) {
        this.removeAllChildren();
        str = "" + str;
        var prefix = null;
        var sufFix = false;
        if (type === mc.ColorNumberView.TYPE_NUM_HP_HEAL) {
            prefix = "#text/num_hpheal/";
        }
        else if (type === mc.ColorNumberView.TYPE_NUM_MP_HEAL) {
            prefix = "#text/num_mpheal/";
        }
        else if (type === mc.ColorNumberView.TYPE_NUM_MAGIC) {
            prefix = "#text/num_poison/";
        }
        else if (type === mc.ColorNumberView.TYPE_NUM_PHYSIC) {
            prefix = "#text/num_dam/";
        }
        else if (type === mc.ColorNumberView.TYPE_NUM_CRITICAL) {
            prefix = "#text/num_crit/";
        }
        else if (type === mc.ColorNumberView.TYPE_NUM_LEVEL_UP) {
            prefix = "#text/levelup_number/lvup_";
        }
        else if (type === mc.ColorNumberView.TYPE_NUM_PLUS_ATTRIBUTE) {
            prefix = "#text/num_plusattr/";
            sufFix = true;
        }
        else if (type === mc.ColorNumberView.TYPE_NUM_MINUS_ATTRIBUTE) {
            prefix = "#text/num_minusattr/";
            sufFix = true;
        }

        if (prefix) {
            var xLayout = 0;
            var padding = (pad != undefined) ? pad : -23;
            var alignY = (ay != undefined) ? ay : 4;
            var startIndex = 1;
            var c0 = str.charAt(0);
            if (c0 === "+") {
                var spr = new cc.Sprite(prefix + "plus.png");
                spr.x = spr.width * 0.5;
                spr.y = spr.height * 0.5;
                this.addChild(spr);
                xLayout += (spr.width + padding);
            }
            else if (c0 === "-") {
                var spr = new cc.Sprite(prefix + "sub.png");
                spr.x = spr.width * 0.5;
                spr.y = spr.height * 0.5;
                this.addChild(spr);
                xLayout += (spr.width + padding);
            }
            else {
                startIndex = 0;
            }

            var height = 0;
            var length = !sufFix ? str.length : str.length - 3;
            for (var i = startIndex; i < length; i++) {
                var spr = new cc.Sprite(prefix + str[i] + ".png");
                spr.x = xLayout + spr.width * 0.5;
                if ((i % 2 === 0) && length >= 3) {
                    spr.y = spr.height * 0.5 - alignY;
                }
                else {
                    spr.y = spr.height * 0.5;
                }
                this.addChild(spr);
                xLayout += (spr.width + padding);
                height = spr.height;
            }

            xLayout -= padding;
            if (sufFix) {
                var lastStr = str.substring(str.length - 3, str.length);
                var spr = new cc.Sprite(prefix + lastStr + ".png");
                spr.x = xLayout + spr.width * 0.5;
                spr.y = spr.height * 0.5;
                this.addChild(spr);
                xLayout += spr.width;
            }

            this.width = xLayout;
            this.height = height + alignY;
        }
        else {
            var spr = null;
            if (type === mc.ColorNumberView.TYPE_TXT_CRITICAL) {
                spr = new cc.Sprite("#text/text_critical.png");
            }
            else if (type === mc.ColorNumberView.TYPE_TXT_BLOCK) {
                spr = new cc.Sprite("#text/text_block.png");
            }
            else if (type === mc.ColorNumberView.TYPE_TXT_GUARD) {
                spr = new cc.Sprite("#text/text_guard.png");
            }
            if (spr) {
                spr.x = spr.width * 0.5;
                spr.y = spr.height * 0.5;
                this.addChild(spr);

                this.width = spr.width;
                this.height = spr.height;
            }
        }
        this.anchorX = 0.5;
        this.anchorY = 0.5;
    }

});
mc.ColorNumberView.TYPE_NUM_PHYSIC = "num_physic";
mc.ColorNumberView.TYPE_NUM_HP_HEAL = "num_hp_heal";
mc.ColorNumberView.TYPE_NUM_MP_HEAL = "num_mp_heal";
mc.ColorNumberView.TYPE_NUM_MAGIC = "num_magic";
mc.ColorNumberView.TYPE_NUM_CRITICAL = "num_critical";
mc.ColorNumberView.TYPE_NUM_PLUS_ATTRIBUTE = "num_plus_attribute";
mc.ColorNumberView.TYPE_NUM_MINUS_ATTRIBUTE = "num_minus_attribute";
mc.ColorNumberView.TYPE_NUM_LEVEL_UP = "num_level_up";

mc.ColorNumberView.TYPE_TXT_CRITICAL = "txt_critical";
mc.ColorNumberView.TYPE_TXT_BLOCK = "txt_block";
mc.ColorNumberView.TYPE_TXT_GUARD = "txt_guard";
