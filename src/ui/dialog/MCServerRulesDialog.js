/**
 * Created by long.nguyen on 3/21/2018.
 */
mc.ServerRulesDialog = bb.Dialog.extend({

    ctor: function (serverIndex,onJoinPressed) {
        this._super();
        var node = ccs.load(res.widget_server_rules_dialog, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var title = rootMap["lblDialogTitle"];
        var txt = serverIndex === 2 ? mc.dictionary.getGUIString("lblServer2") : mc.dictionary.getGUIString("lblServer1")
        title.setString(txt);
        title.setColor(mc.color.YELLOW_SOFT);
        var brk = rootMap["brk"];
        this.title = rootMap["title"];
        this.content = rootMap["content"];
        var btnJoin = brk.getChildByName("btnJoin");
        this.listView = brk.getChildByName("list_view");
        this.listView.setGravity(ccui.ListView.GRAVITY_LEFT);
        btnJoin.setString(mc.dictionary.getGUIString("lblJoin"));

        btnJoin.registerTouchEvent(function () {
            onJoinPressed && onJoinPressed();
            this.close();

        }.bind(this));

        var data1 = {
            vi: [
                {
                    header: "Máy chủ dành cho những game\n thủ thích khám phá nhanh \n hòa nhập nhanh",
                    content: [
                        " - Kinh nghiệm x 2",
                        " - Tỉ lệ rớt item x 2",
                        " - Tỉ lệ Sum Tướng  x 2"]
                }
            ],
            en: [
                {
                    header: "Servers for gamers who like fast \n integration and fast discovery,\n high resistance",
                    content: [
                        " - Exp x 2",
                        " - Drop rate x 2",
                        " - Sum rate x 2"]
                }
            ]
        };

        var data2 = {
            vi: [
                {
                    header: "Máy chủ dành cho những game thủ\n thích thử thách, độ khó cao, cạnh \n tranh cao đòi hỏi tính kiên trì cao",
                    content: [
                        " - Kinh nghiệm x 1",
                        " - Tỉ lệ rớt item x 1",
                        " - Tỉ lệ Sum Tướng  x 1",
                        " - Mở : 03/05/2019"]
                }

            ],
            en: [
                {
                    header: "Server for gamers who like challenges, \n high difficulty, high competition,\n requires high perseverance",
                    content: [
                        " - Exp x 1",
                        " - Drop rate x 1",
                        " - Summon rate x 1",
                        " - Open : 3rd of May 2019"]
                }
            ]
        };

        var data = data1;
        if(serverIndex === 2)
        {
            data = data2;
        }


        var lan = mc.storage.readSetting()["language"];
        var creditContent = data[lan || "en"];

        for (var i in creditContent) {
            var ob = creditContent[i];
            this.addHeader(ob["header"]);
            this.addContent(ob["content"]);
            this.addSeperator();
        }

    },

    addHeader: function (header) {
        var lbl = this.title.clone();
        lbl.setScale(1);
        lbl.setVisible(true);
        lbl.setString(header);
        lbl.setColor(mc.color.YELLOW_SOFT);
        this.listView.pushBackCustomItem(lbl);
    },
    addContent: function (content) {
        for (var i in content) {
            var lbl = this.content.clone();
            lbl.setScale(1);
            lbl.setMultiLineString(content[i], this.listView.width * 0.9 * (2 - lbl.getScaleX()), cc.TEXT_ALIGNMENT_LEFT);
            lbl.setVisible(true);
            this.listView.pushBackCustomItem(lbl);
        }
    },
    addSeperator: function () {
        var lbl = this.title.clone();
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