/**
 * Created by long.nguyen on 1/19/2018.
 */
mc.MailContentDialog = mc.DefaultDialogType2.extend({

    ctor: function (mailId) {
        this._super();

        var arrAllView = [];
        var mailInfo = mc.GameData.mailManager.getMailInfoById(mailId);
        this.setTitle(mc.MailManager.getMailTitle(mailInfo), mc.color.YELLOW);

        var lblDes = null;

        if(mc.enableReplaceFontBM())
        {
            lblDes = new ccui.Layout();

            var desText = mc.view_utility.createTextFromFontBitmap(res.font_cam_stroke_32_export_fnt);
            var sc = 0.75;
            var width = cc.winSize.width * (sc);
            desText.setFontSize(sc * desText.getFontSize());
            desText.setBoundingWidth(width)
            var cs = desText.getContentSize();
            //lblDes.anchorX = 0;
            //lblDes.setBoundingWidth(cc.winSize.width/2);
            //desTest.width = 0;
            desText.setComplexString(mc.MailManager.getMailContentText(mailInfo));
            lblDes.addChild(desText);
            lblDes.height = desText.height;
            lblDes.width = width + 30;
            desText.x += 15;
            desText.y = lblDes.height/3;
        }
        else
        {
            lblDes = new cc.LabelBMFont("", res.font_cam_stroke_32_export_fnt);
            lblDes.scale = 0.75;
            lblDes.setBoundingWidth(cc.winSize.width * (2 - lblDes.scale));
            lblDes.setComplexString(mc.MailManager.getMailContentText(mailInfo));
        }


        var arrItem = [];
        var strHero = mc.MailManager.getMailHeroGift(mailInfo);
        if (strHero) {
            var arrStr = strHero.split('#');
            for (var i = 0; i < arrStr.length; i++) {
                var heroDict = mc.dictionary.getHeroDictByIndex(parseInt(arrStr[i]));
                arrItem.push(mc.ItemStock.createJsonItemHeroSoul(1, heroDict));
            }
        }
        var strGift = mc.MailManager.getMailContentGift(mailInfo);
        if (strGift) {
            arrItem = bb.collection.arrayAppendArray(arrItem, mc.ItemStock.createArrJsonItemFromStr(strGift));
        }
        var arrView = null;
        if (arrItem.length > 0) {
            arrView = bb.collection.createArray(arrItem.length, function (index) {
                var itemView = new mc.ItemView(arrItem[index]);
                itemView.scale = 0.75;
                if (mc.MailManager.isMailClaimed(mailInfo)) {
                    itemView.setBlack(true);
                }
                itemView.registerViewItemInfo();
                return itemView;
            });
        }

        var gridView = null;
        if (arrView) {
            gridView = bb.layout.grid(arrView, Math.min(4, arrView.length), 400, 5);
        }
        gridView && arrAllView.push(gridView);
        arrAllView.push(lblDes);

        var contentView = bb.layout.linear(arrAllView, 20, bb.layout.LINEAR_VERTICAL);
        this.setContentView(contentView);

        gridView && (gridView.x = contentView.width * 0.5);

        var actions = mc.MailManager.getMailContentActions(mailInfo);
        if (actions && actions[0]) {
            var act = actions[0].actId;
            if (act === mc.MailManager.ACTION_REMOVE) {
                var btn1 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblRemove"));
                btn1.loadTexture("button/Orange_Round.png", ccui.Widget.PLIST_TEXTURE);
                this.setButton_1View(btn1, function () {
                    mc.protocol.actionWithMail(mc.MailManager.getMailId(mailInfo), act, function () {
                    }.bind(this));
                    this.close();
                }.bind(this));
            }
            else if (act === mc.MailManager.ACTION_CLAIM) {
                var btn1 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("lblClaim"));
                btn1.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
                this.setButton_1View(btn1, function () {
                    var loadingId = mc.view_utility.showLoadingDialog(3);
                    mc.protocol.actionWithMail(mc.MailManager.getMailId(mailInfo), act, function () {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        this.close();
                    }.bind(this));
                }.bind(this));
            }

        }
        if (actions && actions[1]) {
            var act2 = actions[1].actId;
            if (act2 === mc.MailManager.ACTION_ACCEPT) {
                var btn2 = bb.framework.getGUIFactory().createButton(mc.dictionary.getGUIString("Accept"));
                btn2.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
                this.setButton_2View(btn2, function () {
                    var loadingId = mc.view_utility.showLoadingDialog(3);
                    mc.protocol.actionWithMail(mc.MailManager.getMailId(mailInfo), act2, function () {
                        mc.view_utility.hideLoadingDialogById(loadingId);
                        this.close();
                    }.bind(this));
                }.bind(this));
            }

        }
    }

});