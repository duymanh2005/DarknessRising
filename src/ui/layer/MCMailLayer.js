/**
 * Created by long.nguyen on 1/29/2018.
 */
mc.MailLayer = mc.LoadingLayer.extend({

    ctor: function (parseNode) {
        this._super();

        bb.framework.addSpriteFrames(res.text_plist);
        bb.framework.addSpriteFrames(res.icon_plist);
        bb.framework.addSpriteFrames(res.patch9_2_plist);

        var root = this.parseCCStudio(parseNode || res.layer_mail);
        var rootMap = bb.utility.arrayToMap(root.getChildren(), function (element) {
            return element.getName();
        });

        var imgTitle = rootMap["brkTitle"];
        var brkBlack = rootMap["brkBlack"];
        var lbl = brkBlack.getChildByName("lbl");
        lbl.setString(mc.dictionary.getGUIString("txtMailAutoDelete"));
        if(mc.enableReplaceFontBM())
        {
            lbl = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lbl);
        }
        var brkNumMail = this._brkNumMail = rootMap["brkNumMail"];
        var lvlMail = this._lvlMail = rootMap["lvlMail"];
        var cellMail = this._cellMail = rootMap["cellMail"];
        var btnClaimAll = this._btnClaimAll = rootMap["btnClaimAll"];
        var btnDeleteAll = this._btnDeleteAll = rootMap["btnDeleteAll"];

        var msg_bg = rootMap["msg_bg"];
        var lbl_fairy = rootMap["lbl"];
        var node_fairy = rootMap["fairy"];
        lbl_fairy.setMultiLineString(mc.dictionary.getGUIString("txtNoMail"), msg_bg.width);
        lbl_fairy.setColor(mc.color.BROWN_SOFT);
        lbl_fairy.setOpacity(0);
        msg_bg.setScale(0, 0);

        this.loadNoMailAnimate = function () {
            var spineFairy = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_story_teller_json, res.spine_ui_story_teller_atlas, 1.0);
            spineFairy.scale = 0.2;
            spineFairy.setAnimation(0, "default", true);
            spineFairy.setVisible(false);
            root.addChild(spineFairy);
            spineFairy.setPosition(root.width * 1.3, root.height * 0.5);
            spineFairy.runAction(cc.sequence(cc.delayTime(0.5), cc.show(), cc.moveTo(0.5, node_fairy.getPosition().x, node_fairy.getPosition().y).easing(cc.easeBackOut()), cc.callFunc(function () {
                msg_bg.runAction(cc.sequence(cc.delayTime(0.3), cc.scaleTo(0.3, 1).easing(cc.easeBackOut()), cc.callFunc(function () {
                    lbl_fairy.setVisible(true);
                    lbl_fairy.runAction(cc.fadeIn(0.3));
                }, this)));
            }, this)));
        };

        cellMail.setVisible(false);

        var lblTitle = imgTitle.setString(mc.dictionary.getGUIString("lblMailInbox"), res.font_UTMBienvenue_stroke_32_export_fnt);
        lblTitle.setOverlayColor(mc.color.GREEN_NORMAL);

        var self = this;
        this.traceDataChange(mc.GameData.mailManager, function (data) {
            if (data && data.param) {
                var arrMailId = data.param.arrMailId;
                var actId = data.param.actMailId;
                var delta = 0.3;
                for (var i = 0; i < arrMailId.length; i++) {
                    var mailId = arrMailId[i];
                    var indexCell = this._findMailCellIndexByMailId(mailId);
                    if (indexCell >= 0) {
                        var cell = this._lvlMail.getItem(indexCell);
                        if (actId === mc.MailManager.ACTION_REMOVE) {
                            cell.setCascadeOpacityEnabled(true);
                            cell._yFocus = cell.y - this._lvlMail.height * 0.5;
                            cell.runAction(cc.sequence(cc.delayTime(delta), cc.callFunc(function () {
                                this.runAction(cc.sequence(cc.spawn(cc.fadeOut(0.3), cc.scaleTo(0.3, 1, 0)), cc.delayTime(0.05), cc.callFunc(function () {
                                    this.runAction(
                                        cc.sequence(cc.delayTime(0.005), cc.callFunc(function () {
                                            var number = Math.max(0, this.height * 0.9);
                                            if (number <= 3) {
                                                number = 0;
                                                this.stopAllActions();
                                                this.removeFromParent();
                                            }
                                            this.setContentSize(this.width, number);
                                            self._lvlMail.forceDoLayout();
                                            bb.utility.scrollTo(self._lvlMail, this._yFocus, 0.01);
                                            this._yFocus = this.y - self._lvlMail.height * 0.5;
                                        }, this)).repeat(30)
                                    );
                                }.bind(this), this)));
                            }, cell)));
                            delta += 0.5;
                        }
                        else if (actId === mc.MailManager.ACTION_UPDATE ||
                            actId === mc.MailManager.ACTION_CLAIM) {
                            this._reloadCell(cell, mc.GameData.mailManager.getMailInfoById(mailId));
                        }
                    }
                }
                this._updateBtn();
            }
        }.bind(this));

        btnClaimAll.registerTouchEvent(function (btn) {
            var arrClaimMail = btnClaimAll.getUserData();
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.claimMails(bb.collection.createArray(arrClaimMail.length, function (index) {
                return mc.MailManager.getMailId(arrClaimMail[index]);
            }), function () {
                mc.view_utility.hideLoadingDialogById(loadingId);
            })
        });
        btnDeleteAll.registerTouchEvent(function (btn) {
            var arrFreeMail = btnDeleteAll.getUserData();
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.deleteMails(bb.collection.createArray(arrFreeMail.length, function (index) {
                return mc.MailManager.getMailId(arrFreeMail[index]);
            }), function () {
                mc.view_utility.hideLoadingDialogById(loadingId);
            })
        });

    },

    onLoading: function () {
        mc.protocol.getMailList(function () {
            this.performDone();
        }.bind(this));
    },

    onLoadDone: function () {
        this._reloadMailList();
        this._updateBtn();
    },

    _findMailCellIndexByMailId: function (mailId) {
        var index = -1;
        var allCellView = this._lvlMail.getItems();
        for (var i = 0; i < allCellView.length; i++) {
            var mailInfo = allCellView[i].getUserData();
            if (mailInfo && mc.MailManager.getMailId(mailInfo) === mailId) {
                index = i;
                break;
            }
        }
        return index;
    },

    _openMail: function (btn) {
        var mailInfo = btn.getUserData();
        var loadingId = mc.view_utility.showLoadingDialog();
        var mailId = mc.MailManager.getMailId(mailInfo);
        mc.protocol.openMail(mailId, function (result) {
            mc.view_utility.hideLoadingDialogById(loadingId);
            new mc.MailContentDialog(mailId).show();
        }.bind(this));
    },

    _reloadMailList: function () {
        var countUnSeenMail = 0;
        var arrMailInfo = mc.GameData.mailManager.getArrayMailInfo();
        for (var i = 0; i < arrMailInfo.length; i++) {
            var cellView = this._cellMail.clone();
            var mailInfo = arrMailInfo[i];
            if (!mc.MailManager.isMailSeen(mailInfo)) {
                countUnSeenMail++;
            }
            var cell = this._reloadCell(cellView, mailInfo);
            cell.setVisible(true);
            cell.setCascadeOpacityEnabled(true);
            this._lvlMail.pushBackCustomItem(cell);
        }
        this._brkNumMail.setString(countUnSeenMail + "/" + arrMailInfo.length, res.font_UTMBienvenue_stroke_32_export_fnt);
        if (arrMailInfo.length <= 0) {
            this.loadNoMailAnimate();
        }
    },

    _updateBtn: function () {
        var arrFreeMail = [];
        var arrClaimedMail = [];
        var arrMailInfo = mc.GameData.mailManager.getArrayMailInfo();
        for (var i = 0; i < arrMailInfo.length; i++) {
            var mailInfo = arrMailInfo[i];
            if (!mc.MailManager.isMailRemoved(mailInfo)) {
                if (mc.MailManager.isGiftMail(mailInfo)) {
                    if (!mc.MailManager.isMailClaimed(mailInfo)) {
                        arrClaimedMail.push(mailInfo);
                    }
                    else {
                        arrFreeMail.push(mailInfo);
                    }
                }
                else {
                    if (mc.MailManager.isMailSeen(mailInfo)) {
                        arrFreeMail.push(mailInfo);
                    }
                }
            }
        }
        var lblDeleteAll = this._btnDeleteAll.setString(cc.formatStr(mc.dictionary.getGUIString("lblDeleteN"), 0));
        var lblClaimAll = this._btnClaimAll.setString(cc.formatStr(mc.dictionary.getGUIString("lblClaimN"), 0));
        if(mc.enableReplaceFontBM())
        {
            //lblDeleteAll.setAnchorPoint(0.5, 0.6);
            //lblClaimAll.setAnchorPoint(0.5, 0.6);
            //lblClaimAll.setScale(0.7);
            //lblDeleteAll.setScale(0.7);
            lblClaimAll.x = this._btnClaimAll.width * 0.6;
            lblDeleteAll.x = this._btnDeleteAll.width * 0.6;
            lblClaimAll.y = this._btnClaimAll.height * 0.55;
            lblDeleteAll.y = this._btnDeleteAll.height * 0.55;
        }
        else
        {
            lblClaimAll.x = this._btnClaimAll.width * 0.6;
            lblDeleteAll.x = this._btnDeleteAll.width * 0.6;
            lblClaimAll.y = this._btnClaimAll.height * 0.5;
            lblDeleteAll.y = this._btnDeleteAll.height * 0.5;
        }

        this._btnDeleteAll.setGrayForAll(true);
        this._btnClaimAll.setGrayForAll(true);
        if (arrFreeMail.length > 0) {
            this._btnDeleteAll.setUserData(arrFreeMail);
            lblDeleteAll.setString(cc.formatStr(mc.dictionary.getGUIString("lblDeleteN"), arrFreeMail.length));
            this._btnDeleteAll.setGrayForAll(false);
        }
        if (arrClaimedMail.length > 0) {
            this._btnClaimAll.setUserData(arrClaimedMail);
            lblClaimAll.setString(cc.formatStr(mc.dictionary.getGUIString("lblClaimN"), arrClaimedMail.length));
            this._btnClaimAll.setGrayForAll(false);
        }
    },

    _reloadCell: function (cell, mailInfo) {
        var cellMap = bb.utility.arrayToMap(cell.getChildren(), function (child) {
            return child.getName();
        });

        var brkIcon = cellMap["brkIcon"];
        var brk = cellMap["brk"];
        var btnOpen = cell._btnOpen = cellMap["btnOpen"];
        var lblDes = cellMap["lblDes"];
        var lblName = cellMap["lblName"];
        var sprNew = cellMap["newtext"];
        if (sprNew) {
            sprNew.removeFromParent();
        }


        lblDes.setString("");
        if(mc.enableReplaceFontBM())
        {
            lblDes = mc.GUIFactory.applyComplexString(lblDes,bb.utility.stringBreakLines(mc.MailManager.getMailDesc(mailInfo), 12, 450),mc.color.BROWN_SOFT);
            lblName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblName);
        }
        else
        {
            mc.GUIFactory.applyComplexString(lblDes,bb.utility.stringBreakLines(mc.MailManager.getMailDesc(mailInfo), 15, 450),mc.color.BROWN_SOFT);
        }
        lblName.setString(mc.MailManager.getMailTitle(mailInfo));
        //if(mc.const.ENABLE_REPLACE_FONT_BM)
        //{
        //    lblDes.setFontSize(0.5*lblDes.getFontSize());
        //}
        var lbl = btnOpen.setString(mc.dictionary.getGUIString("lblOpen"));
        btnOpen.registerTouchEvent(this._openMail.bind(this));
        btnOpen.setUserData(mailInfo);

        lblName.setColor(mc.color.YELLOW);
        //lblDes.setColor(mc.color.BROWN_SOFT);
        var nameNewView = "newtext";
        if (!mc.MailManager.isMailSeen(mailInfo)) {
            var sprNew = new cc.Sprite("#text/New_text.png");
            sprNew.setName(nameNewView);
            sprNew.runAction(cc.sequence([cc.delayTime(2.0), cc.shake(0.2, cc.size(10, 0))]).repeatForever());
            sprNew.x = cell.width * 0.865;
            sprNew.y = cell.height * 0.76;
            cell.addChild(sprNew);
        }

        var icon = null;
        if (mc.MailManager.isGiftMail(mailInfo)) {
            icon = new ccui.ImageView(mc.MailManager.isMailClaimed(mailInfo) ? "icon/giftbox_red_open.png" : "icon/giftbox_red.png", ccui.Widget.PLIST_TEXTURE);
            if (mc.MailManager.isMailClaimed(mailInfo)) {
                brk.loadTexture("patch9/pnl_name_grey.png", ccui.Widget.PLIST_TEXTURE);
                var sprNew = cell.getChildByName(nameNewView);
                sprNew && (sprNew.setVisible(false));
            }
        }
        else {
            icon = new ccui.ImageView(mc.MailManager.isMailSeen(mailInfo) ? "icon/letter_open.png" : "icon/Letter.png", ccui.Widget.PLIST_TEXTURE);
            if (mc.MailManager.isMailSeen(mailInfo)) {
                brk.loadTexture("patch9/pnl_name_grey.png", ccui.Widget.PLIST_TEXTURE);
            }
        }
        icon.x = brkIcon.width * 0.5;
        icon.y = brkIcon.height * 0.5;
        brkIcon.removeAllChildren();
        brkIcon.addChild(icon);
        brkIcon.setCascadeOpacityEnabled(true);
        brkIcon.setCascadeColorEnabled(true);
        cell.setUserData(mailInfo);
        cell.setCascadeOpacityEnabled(true);
        cell.setCascadeColorEnabled(true);
        btnOpen.setCascadeOpacityEnabled(true);
        btnOpen.setCascadeColorEnabled(true);
        return cell;
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_MAIL;
    },

    isShowHeader: function () {
        return true;
    },

    isShowFooter: function () {
        return true;
    },

    isShowTip: function () {
        return false;
    }


});