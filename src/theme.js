/**
 * Created by long.nguyen on 8/17/2017.
 */
mc = mc || {};
mc.color = {
    WHITE_NORMAL: cc.color.WHITE,
    BLACK_DISABLE_SOFT: cc.hexToColor("#868686"),
    IAP_SHOP_TITLE: cc.hexToColor("#FFA800"),
    BLACK_OVER_ITEM: cc.hexToColor("#9b9b9b"),
    BLACK_DISABLE_STRONG: cc.hexToColor("#4A4A4A"),
    ORANGE_TITLE: cc.hexToColor("#ddae5b"),
    GREEN_RECOVERY: cc.hexToColor("#00ff00"),
    BLUE_RECOVERY: cc.hexToColor("#0000ff"),
    RED_BATTLE: cc.hexToColor("#ff0000"),

    GREEN_NORMAL: cc.hexToColor("#94ff2c"),
    BROWN_SOFT: cc.hexToColor("#935b37"),
    BROWN_STRONG: cc.hexToColor("#6d3614"),
    BROWN_DISABLE: cc.hexToColor("#180f09"),
    YELLOW_SOFT: cc.hexToColor("#ffe85b"),
    BLUE_SOFT: cc.hexToColor("#5de7f3"),

    RED: cc.hexToColor("#ff0000"),
    RED_SOFT: cc.hexToColor("#f9424f"),
    PINK: cc.hexToColor("#ee84db"),
    GREEN: cc.hexToColor("#94ff2c"),
    GRAY: cc.hexToColor("#935b37"),
    YELLOW: cc.hexToColor("#ffe85b"),
    BLUE: cc.hexToColor("#5de7f3"),

    YELLOW_ELEMENT: cc.hexToColor("#fff959"),
    GREEN_ELEMENT: cc.hexToColor("#cfff37"),
    RED_ELEMENT: cc.hexToColor("#ff6f3a"),
    BLUE_ELEMENT: cc.hexToColor("#00ffff"),
    VIOLET_ELEMENT: cc.hexToColor("#f055ff"),

    ORANGE_TEXT: cc.hexToColor("#db5b1b"),

    BLUE_OUTER: cc.hexToColor("#036972"),
    RED_OUTER: cc.hexToColor("#952107"),
    GREEN_OUTER: cc.hexToColor("#355906"),
    CHAT_USER_NAME: cc.hexToColor("#60b4fb"),
    CHAT_TEXT: cc.hexToColor("#fff8ea"),
    BLACK: cc.hexToColor("#000000")
};
mc.color.ELEMENTS = {};
mc.color.ELEMENTS[mc.const.ELEMENT_FIRE.toLowerCase()] = mc.color.RED_ELEMENT;
mc.color.ELEMENTS[mc.const.ELEMENT_WATER.toLowerCase()] = mc.color.BLUE_ELEMENT;
mc.color.ELEMENTS[mc.const.ELEMENT_LIGHT.toLowerCase()] = mc.color.YELLOW_ELEMENT;
mc.color.ELEMENTS[mc.const.ELEMENT_DARK.toLowerCase()] = mc.color.VIOLET_ELEMENT;
mc.color.ELEMENTS[mc.const.ELEMENT_EARTH.toLocaleLowerCase()] = mc.color.GREEN_ELEMENT;

mc.textStyle = {
    name : {
        textColor : mc.color.BLUE_SOFT,
        shadowSize : cc.size(1,-1),
        shadowColor : cc.hexToColor("#036972"),
        outlineColor : cc.hexToColor("#355906"),
        outlineSize : 1,
    },
    name_brown : {
        textColor : mc.color.BROWN_SOFT,
        shadowSize : cc.size(1,-1),
        shadowColor : cc.hexToColor("#036972"),
        outlineColor : cc.hexToColor("#355906"),
        outlineSize : 1,
    },
    level_browm : {
        textColor : mc.color.BROWN_SOFT,
        shadowSize : cc.size(1,-1),
        shadowColor : cc.hexToColor("#036972"),
        outlineColor : cc.hexToColor("#355906"),
        outlineSize : 1,
    },
    level_white : {
        textColor : cc.hexToColor("#000000"),
        shadowSize : cc.size(1,-1),
        shadowColor : cc.hexToColor("#036972"),
        outlineColor : cc.hexToColor("#355906"),
        outlineSize : 1,
    },
    power_brown : {
        textColor : mc.color.WHITE_NORMAL,
        shadowSize : cc.size(1,-1),
        shadowColor : mc.color.WHITE_NORMAL,
        outlineColor : mc.color.BLUE,
        outlineSize : 1,
        align :{
            horizontal: cc.TEXT_ALIGNMENT_LEFT,
            vertical : cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM
        },
        fontName : res.font_regular_ttf
    },
    content : {
        textColor : cc.hexToColor("#000000"),
        shadowSize : cc.size(1,-1),
        shadowColor : cc.hexToColor("#036972"),
        outlineColor : cc.hexToColor("#355906"),
        outlineSize : 1,
    },
    label : {
        textColor : cc.hexToColor("#000000"),
        shadowSize : cc.size(1,-1),
        shadowColor : cc.hexToColor("#036972"),
        outlineColor : cc.hexToColor("#355906"),
        outlineSize : 1,
    },
    font_size_32 : {
        fontSize : 32
    },
    font_size_32_stroke : {
        fontSize : 32,
        outlineColor : cc.hexToColor("#000000"),
        outlineSize : 1,
    },
    font_size_32_outline : {
        outlineColor : cc.hexToColor("#000000"),
        outlineSize : 1,
        fontSize : 32
    },
    dialogTitle : {
        fontSize : 36,
        textColor : mc.color.YELLOW_SOFT,
    },
    dialogHeader : {
        fontSize : 26,
        textColor : mc.color.YELLOW_SOFT,
    },
    dialogContent : {
        fontSize : 24,
        textColor : mc.color.WHITE_NORMAL,
    },
    powerLabel : {
        fontSize : 24
    },
    levelLabel : {
        fontSize : 24
    },
    arenaPointLabel : {
        fontSize : 24
    },
    memGuildLabel : {
        fontSize : 24,
        outlineColor : cc.hexToColor("#000000"),
        outlineSize : 1,
    },
    arenaWinLabel : {
        fontSize : 24
    },
    timeAgoLabel : {
        fontSize : 20
    }
};


ccui.ImageView.prototype.setString = function (str, fontType, fontSize) {
    fontType = fontType || res.font_UTMBienvenue_stroke_32_export_fnt;
    fontSize = fontSize || mc.const.FONT_SIZE_32;
    var lbl = bb.utility.setStringForWidget(this, str, fontType, fontSize);
    if(mc.enableReplaceFontBM())
    {
        if (fontType === res.font_UTMBienvenue_stroke_32_export_fnt) {
            lbl.y = this.height * 0.6;
            lbl.scale = 0.9;
        } else if (fontType === res.font_sfumachine_outer_32_export_fnt) {
            lbl.y = this.height * 0.55;
        } else if (fontType === res.font_UTMBienvenue_none_32_export_fnt) {
            lbl.y = this.height * 0.55;
        } else if (fontType === res.font_cam_stroke_32_export_fnt) {
            lbl.y = this.height * 0.625;
            lbl.scale = 0.8;
        }
    }
    else
    {
        if (fontType === res.font_UTMBienvenue_stroke_32_export_fnt) {
            lbl.y = this.height * 0.6;
            lbl.scale = 0.85;
        } else if (fontType === res.font_sfumachine_outer_32_export_fnt) {
            lbl.y = this.height * 0.55;
        } else if (fontType === res.font_UTMBienvenue_none_32_export_fnt) {
            lbl.y = this.height * 0.55;
        } else if (fontType === res.font_cam_stroke_32_export_fnt) {
            lbl.y = this.height * 0.625;
            lbl.scale = 0.75;
        }
    }

    return lbl;
};
