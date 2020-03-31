/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.CreditDialog = bb.Dialog.extend({

    ctor: function () {
        this._super();
        var node = ccs.load(res.widget_credit_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });

        var content = {
            vi: [
                {header: "CEO", content: ["Bui Duc Ky Anh"]},
                {header: "Project Manager", content: ["Nguyen Tuan Dung"]},
                {
                    header: "Front-End Developer",
                    content: ["Nguyen Thanh Long"]
                },
                {header: "Back-End Developer", content: ["Ha Manh Lam"]},
                {header: "Network Engineer", content: ["Nguyen Vu"]},
                {
                    header: "Game Artist",
                    content: ["Nguyen Thuy Doan Trang", "Tran Nguyen Dung", "Vuong Bao My", "Nguyen Hoai Ngoc Luan", "Hoang Thanh Son", "To Minh Thuan", "Huynh My Van"]
                },
                {
                    header: "Game Animator",
                    content: ["Nguyen Minh Toan", "Tran Nguyen Dung", "Nguyen Tuan Dung", "Nguyen Hoai Ngoc Luan", "Nguyen Van Quang"]
                },
                {header: "Game Designer", content: ["Nguyen Tuan Dung", "Nguyen Van Quang"]},
                {header: "Sound & Music", content: ["Nguyen Tuan Dung", "Nguyen Trong Truong An"]},
                {
                    header: "Quality Assurance",
                    content: ["Phan Hung Son", "Pham Phuong Lam", "Nguyen Van Quang"]
                },
                {
                    header: "Special Thanks To", content: ["All you players, thank you for your patience ,\n" +
                    "for your support\n" +
                    "And most of all, thank you for playing our game \n" +
                    "with passion."], color: ""
                }
            ],
            en: [
                {header: "CEO", content: ["Bui Duc Ky Anh"]},
                {header: "Project Manager", content: ["Nguyen Tuan Dung"]},
                {
                    header: "Front-End Developer",
                    content: ["Nguyen Thanh Long"]
                },
                {header: "Back-End Developer", content: ["Ha Manh Lam"]},
                {header: "Network Engineer", content: ["Nguyen Vu"]},
                {
                    header: "Game Artist",
                    content: ["Nguyen Thuy Doan Trang", "Tran Nguyen Dung", "Vuong Bao My", "Nguyen Hoai Ngoc Luan", "Hoang Thanh Son", "To Minh Thuan", "Huynh My Van"]
                },
                {
                    header: "Game Animator",
                    content: ["Nguyen Minh Toan", "Tran Nguyen Dung", "Nguyen Tuan Dung", "Nguyen Hoai Ngoc Luan", "Nguyen Van Quang"]
                },
                {header: "Game Designer", content: ["Nguyen Tuan Dung", "Nguyen Van Quang"]},
                {header: "Sound & Music", content: ["Nguyen Tuan Dung", "Nguyen Trong Truong An"]},
                {
                    header: "Quality Assurance",
                    content: ["Phan Hung Son", "Pham Phuong Lam", "Nguyen Van Quang"]
                },
                {
                    header: "Special Thanks To", content: ["All you players, thank you for your patience ,\n" +
                    "for your support\n" +
                    "And most of all, thank you for playing our game \n" +
                    "with passion."], color: ""
                }
            ]
        };

        var icon = rootMap["icon"];

        var iconAnimate = sp.SkeletonAnimation.createWithJsonFile(res.spine_ico_logo_json, res.spine_ico_logo_atlas, 1.0);
        root.addChild(iconAnimate);
        iconAnimate.setLocalZOrder(1);
        iconAnimate.setPosition(icon.x, icon.y);
        iconAnimate.setAnimation(0, "idle", true);
        icon.removeFromParent();

        var logo = rootMap["logo"];
        var lblProduceOf = rootMap["lblProduceOf"];
        var lblCreant = rootMap["lblCreant"];
        var lblCocos = rootMap["lblCocos"];
        this.lblTitle = rootMap["lblTitle"];
        this.lblContent = rootMap["lblContent"];
        this.listView = rootMap["list_view"];
        var btnBack = rootMap["btnBack"];
        btnBack.registerTouchEvent(this.close.bind(this));


        lblProduceOf.setColor(mc.color.BROWN_SOFT);
        lblProduceOf.setString(mc.dictionary.getGUIString("lblProduceOf"));
        lblCreant.setColor(mc.color.BROWN_SOFT);
        lblCreant.setString(mc.dictionary.getGUIString("lblCreant"));
        lblCocos.setColor(mc.color.BROWN_SOFT);
        lblCocos.setString(mc.dictionary.getGUIString("lblCocos"));

        var lan = mc.storage.readSetting()["language"];
        var creditContent = content[lan || "en"];

        for (var i in creditContent) {
            var ob = creditContent[i];
            this.addHeader(ob["header"], ob["color"]);
            this.addContent(ob["content"]);
            this.addSeperator();
        }


    },

    addHeader: function (header, color) {
        var lbl = this.lblTitle.clone();
        lbl.setScale(0.8);
        lbl.setVisible(true);
        lbl.setString(header);
        lbl.setColor(mc.color.YELLOW_SOFT);
        this.listView.pushBackCustomItem(lbl);
    },
    addContent: function (content) {
        for (var i in content) {
            var lbl = this.lblContent.clone();
            lbl.setString(content[i]);
            lbl.setVisible(true);
            this.listView.pushBackCustomItem(lbl);
        }
    },
    addSeperator: function () {
        var lbl = this.lblContent.clone();
        lbl.setString("     ");
        lbl.setVisible(true);
        this.listView.pushBackCustomItem(lbl);
    },


    overrideCloseAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    },
    overrideShowAnimation: function () {
        this.setCascadeOpacityEnabled(true);
        this.setOpacity(0);
        this.runAction(cc.sequence([cc.fadeIn(0.3)]));
        return 0.3;
    }

});