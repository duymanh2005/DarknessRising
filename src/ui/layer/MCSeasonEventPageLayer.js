/**
 * Created by long.nguyen on 11/15/2017.
 */
mc.SeasonEventPagesLayer = mc.MainBaseLayer.extend({

    ctor: function () {
        this._super();
        var root = this._root = this.parseCCStudio(res.layer_halloween_event);
        var content = root.getChildByName("content_event_1");
        var rootMap = bb.utility.arrayToMap(content.getChildren(), function (child) {
            return child.getName();
        });

        var img_bg = rootMap["img_bg"];
        var img_baner = rootMap["img_baner"];
        var banner = rootMap["banner"];
        var event1 = rootMap["event1"];
        var event2 = rootMap["event2"];
        var xMasEvent = rootMap["event3"];
        var event4 = rootMap["event4"];
        var halloweenEvent = rootMap["event5"];
        event1.setVisible(false);
        event2.setVisible(false);
        xMasEvent.setVisible(false);
        event4.setVisible(false);
        halloweenEvent.setVisible(false);

        var lan = mc.storage.readSetting()["language"];
        // var gotoUrl = (lan === "vi" ? "res/event_page/vi_event_1.png" : "res/event_page/event_1.png");

        // this.bindGoto(event1, {
        //     gotoUrl: gotoUrl,
        //     lblButton: "lblExchange",
        //     lblTitle: "lblShopXmasMsg",
        //     gotoFUnc: function () {
        //         mc.GUIFactory.showCraftItemScreen();
        //     }.bind(this)
        // });
        // var pack1 = bb.framework.isIos() ? "com.creants.muheroes.ios.hotpack" : "com.creants.mightyunionheroes.android.hotpack";
        // var pack2 = bb.framework.isIos() ? "com.creants.muheroes.ios.promopack2" : "com.creants.mightyunionheroes.android.promopack2";
        // var url1 = (lan === "vi" ? "res/event_page/vi_event_2.png" : "res/event_page/event_2.png");
        // var url2 = (lan === "vi" ? "res/event_page/vi_event_2_1.png" : "res/event_page/event_2_1.png");
        // var urlIcon1 = (lan === "vi" ? "res/event_page/vi_tab_1.png" : "res/event_page/tab_1.png");
        // var urlIcon2 = (lan === "vi" ? "res/event_page/vi_tab_2.png" : "res/event_page/tab_2.png");
        // this.bindPack(event2, {packId: pack1, resUrl: url1, urlIcon: urlIcon1}, {
        //     packId: pack2,
        //     resUrl: url2,
        //     urlIcon: urlIcon2
        // });
        // this.bindSummon(xMasEvent, {arrayIds: [134, 344, 814, 364, 234], resUrl: null});
        // this.bindSummon(xMasEvent, {arrayIds: [734, 164, 614], resUrl: "res/event_page/event_3_banner.png"});

        // this.bindSeasonEventDetail(event4);
        //
        // var listIcon = [event4];

        this.bindSeasonDetail(halloweenEvent);

        var listIcon = [halloweenEvent];

        var btnLeft = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
        var btnRight = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
        btnRight.scaleX = -2;
        btnLeft.scaleX = 2;

        root.addChild(btnLeft);
        root.addChild(btnRight);

        btnLeft.setVisible(false);
        btnRight.setVisible(false);

        btnLeft.runAction(cc.sequence([cc.moveBy(0.3, -10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, 10, 0), cc.delayTime(1)]).repeatForever());
        btnRight.runAction(cc.sequence([cc.moveBy(0.3, 10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, -10, 0), cc.delayTime(1)]).repeatForever());

        btnLeft.x = cc.winSize.width * 0.07;
        btnRight.x = cc.winSize.width * 0.93;
        btnLeft.y = btnRight.y = cc.winSize.height * 0.35;

        var lblTime = banner.getChildByName("time");
        var lblMsg = img_baner.getChildByName("lbl");
        lblMsg.setString(mc.dictionary.getGUIString("lblShopHalloweenMsg"));

        var eventDuration = mc.GameData.dynamicDailyEvent.getEventDuration();
        if (eventDuration) {
            lblTime.setVisible(true);
            lblTime.setString(mc.dictionary.getGUIString("lblEventTime") + mc.view_utility.formatDurationTime(eventDuration * 1000));
            lblTime.setColor(mc.color.GREEN_NORMAL);
            var _updateProgress = function () {
                var durationInSecond = eventDuration * 1000;
                var deltaInMs = durationInSecond - (bb.now() - mc.GameData.svLoginTime);
                if (deltaInMs < 0) {
                    deltaInMs = 0;
                }
                lblTime.setString(mc.dictionary.getGUIString("lblEventTime") + mc.view_utility.formatDurationTime(deltaInMs));
            };

            this.runAction(cc.sequence([cc.delayTime(1), cc.callFunc(function () {
                _updateProgress();
            }.bind(this))]).repeatForever());
        }
        var contentView = mc.widget_utility.createScrollNode(listIcon, null, event1.width, cc.p(img_bg.width, img_bg.height), {
            clickFunc: function (id) {
                mc.GameData.guiState.setCurrentPageHalloweenFocus(id);
            },
            autoFocusFunc: function (id) {
                mc.GameData.guiState.setCurrentPageHalloweenFocus(id);
            }
        });
        contentView.setClippingEnabled(true);
        contentView.setLoopScroll(false);
        contentView.focusAt(mc.GameData.guiState.getCurrentPageHalloweenFocus());
        img_bg.addChild(contentView);
        contentView.setPosition(img_bg.width / 2, img_bg.height / 2);
        btnLeft.registerTouchEvent(function () {
            contentView.preItem();
        });
        btnRight.registerTouchEvent(function () {
            contentView.nextItem();
        });
        // contentView.setScrollListener({
        //     atBegin: function () {
        //         btnLeft.setVisible(false);
        //         btnRight.setVisible(true);
        //     },
        //     atMid: function () {
        //         btnLeft.setVisible(true);
        //         btnRight.setVisible(true);
        //     },
        //     atEnd: function () {
        //         btnLeft.setVisible(true);
        //         btnRight.setVisible(false);
        //     }
        // });
    },

    bindSeasonDetail: function (widget) {
        widget.setVisible(true);
        var rootMap = bb.utility.arrayToMap(widget.getChildByName("layout").getChildren(), function (child) {
            return child.getName();
        });
        var group1 = rootMap["group1"];
        var group2 = rootMap["group2"];

        var title1 = group1.getChildByName("title");
        title1.setString(mc.dictionary.getGUIString("lblTrialEvent"), res.font_cam_stroke_32_export_fnt);

        var btnShop = group1.getChildByName("btn3");
        var string = btnShop.setString(mc.dictionary.getGUIString("Shop Event"), res.font_cam_stroke_32_export_fnt);
        string.setScale(0.75);
        string.y = btnShop.height * 0.27;
        btnShop.registerTouchEvent(function () {
            mc.GUIFactory.showShopScreen(mc.ShopManager.SHOP_EVENTB);
        }.bind(this));


        var groupBottomEvent = group2.getChildByName("title");
        groupBottomEvent.setString(mc.dictionary.getGUIString("lblHowToGet"), res.font_cam_stroke_32_export_fnt);
        var btn1 = group2.getChildByName("btn1");
        btn1.registerTouchEvent(function () {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_KALIMA, function () {
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_WORD_MAP);
            }.bind(this));
        }.bind(this));
        var btn2 = group2.getChildByName("btn2");
        btn2.registerTouchEvent(function () {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_KALIMA, function () {
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS);
            }.bind(this));
        }.bind(this));
        var btn3 = group2.getChildByName("btn3");
        btn3.registerTouchEvent(function () {
            mc.IAPShopDialog.showIAPPromo();
        }.bind(this));
        var btn4 = group2.getChildByName("btn4");
        btn4.registerTouchEvent(function () {
            mc.view_utility.confirmFunction(mc.const.FUNCTION_KALIMA, function () {
                this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SUMMON_LIST);
            }.bind(this));
            //this.getMainScreen().showLayerWithId(mc.MainScreen.LAYER_SUMMON_LIST);
        }.bind(this));

    },
    bindSeasonEventDetail: function (widget) {
        widget.setVisible(true);
        var rootMap = bb.utility.arrayToMap(widget.getChildren(), function (child) {
            return child.getName();
        });

        var KEY_TITILE = 1;
        var KEY_TITILE_SMALL = 2;
        var KEY_TITILE_SMALL_MSG = 3;
        var KEY_TABLE_TITLE = 4;
        var KEY_LVL_ITEM = 5;
        var KEY_LVL_ITEM_BASE = 6;
        var KEY_BTN = 7;
        var KEY_TABLE_MSG = 8;
        var KEY_SEPERATOR = 9;
        var KEY_SPACE = 10;
        var KEY_NEW_HEROES = 11;
        var lan = mc.storage.readSetting()["language"];
        //var datas = {
        //    vi: [
        //        {key: KEY_TITILE, content: "Sự kiện 1: Săn Tìm vật phẩm Tết "},
        //        {key: KEY_SPACE},
        //        {key: KEY_TABLE_TITLE, content: "Vật phẩm # Vị trí xuất hiện"},
        //        {key: KEY_TABLE_MSG, content: "11986#Hoa Mai # Thử Thách Rồng Vàng"},
        //        {key: KEY_TABLE_MSG, content: "11987#Hoa Đào # Thử Thách Thỏ Trắng"},
        //        {key: KEY_TABLE_MSG, content: "11985#Mâm Ngũ Quả # Các Màn Chơi Boss"},
        //        {key: KEY_TABLE_MSG, content: "11988#Bánh Chưng # Tháp Hỗn Nguyên"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "Kết hợp các vật phẩm trên để chế tạo các loại dây chuyền hoàn hảo cực xịn."
        //        },
        //        {key: KEY_SPACE},
        //        {key: KEY_LVL_ITEM, content: "9502#9512#9522#9532#9542#9552#9562#9572#9582#9592"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {key: KEY_TITILE, content: "Sự Kiện 2: Mở Bao Lì Xì Trúng Lớn"},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "Các loại Bao Lì Xì và Bao Lì Xì Hoàng Kim có thể mua trong Shop Bách Hóa hoặc thông qua gói Khuyến Mãi:"
        //        },
        //        {key: KEY_LVL_ITEM_BASE, content: "11976^11978/1#11985/40#11986/40#11987/40#11988/40#11006/40"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {key: KEY_LVL_ITEM_BASE, content: "11977^11979/1#11985/200#11986/200#11987/200#11988/200#11006/200"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "Bạn cũng có thể kiếm được Bao Lì Xì khi đạt top Boss thế giới"
        //        },
        //        {
        //            key: KEY_BTN,
        //            content: "lblGotoShop",
        //            action: function () {
        //                mc.showShopPackageList();
        //            }
        //        },
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_BTN,
        //            content: "Goto Boss",
        //            action: function () {
        //                var currScreen = bb.director.getCurrentScreen();
        //                currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS);
        //            }
        //        },
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "Các Anh hùng mới đã xuất hiện"
        //        },
        //        {
        //            key: KEY_NEW_HEROES,
        //            content: [134, 344, 814, 364, 234]
        //        },
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "Chúc các bạn năm mới vui vẻ!"
        //        }
        //    ],
        //    en: [
        //        {key: KEY_TITILE, content: "Event 1: Hunting and Exchange items:"},
        //        {key: KEY_SPACE},
        //        {key: KEY_TABLE_TITLE, content: "Items # Location"},
        //        {key: KEY_TABLE_MSG, content: "11986#Apricot Blossom # Golden Dragon Challenge"},
        //        {key: KEY_TABLE_MSG, content: "11987#Cherry Blossom # White Rabbit Challenge"},
        //        {key: KEY_TABLE_MSG, content: "11985#Five Fruit Tray #  Campaign Boss Stages"},
        //        {key: KEY_TABLE_MSG, content: "11988#Sticky Rice Cake # Chaos Tower"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "Combine the above items to create Great Excellent Pedants."
        //        },
        //        {key: KEY_SPACE},
        //        {key: KEY_LVL_ITEM, content: "9502#9512#9522#9532#9542#9552#9562#9572#9582#9592"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {key: KEY_TITILE, content: "Event 2: Open the Lucky Envelop"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "All kinds of Lucky Envelop and Golden Lucky Envelop can be purchased in the Common Shop or through the Promotion package:"
        //        },
        //        {key: KEY_LVL_ITEM_BASE, content: "11976^11978/1#11985/40#11986/40#11987/40#11988/40#11006/40"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {key: KEY_LVL_ITEM_BASE, content: "11977^11979/1#11985/200#11986/200#11987/200#11988/200#11006/200"},
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "You can also earn a Lucky Envelop when you reach the top of the World Boss"
        //        },
        //        {
        //            key: KEY_BTN,
        //            content: "lblGotoShop",
        //            action: function () {
        //                mc.showShopPackageList();
        //            }
        //        },
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_BTN,
        //            content: "Goto Boss",
        //            action: function () {
        //                var currScreen = bb.director.getCurrentScreen();
        //                currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS);
        //            }
        //        },
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "New Heroes For New Year"
        //        },
        //        {
        //            key: KEY_NEW_HEROES,
        //            content: [134, 344, 814, 364, 234]
        //        },
        //        {key: KEY_SPACE},
        //        {key: KEY_SEPERATOR},
        //        {key: KEY_SPACE},
        //        {
        //            key: KEY_TITILE_SMALL_MSG,
        //            content: "We wish you Happy Lunar New Year!"
        //        }
        //    ]
        //};
        var datas = {
            vi: [
                {
                    key: KEY_TITILE,
                    content: "Sự kiện 1: Săn Ngọc Sinh Linh Đổi Quà Giá Trị từ 14:00 ngày 11/5/2019 - đến 11:00 ngày 25/5/2019"
                },
                {key: KEY_SPACE},
                {key: KEY_TABLE_TITLE, content: "Vật phẩm # Vị trí xuất hiện"},
                {
                    key: KEY_TABLE_MSG,
                    content: "11913#Ngọc Sinh Linh # Toren, Fairy Land, Snowy Land, The Tomb, Evil Tower, Atlantic"
                },
                {key: KEY_TABLE_MSG, content: "11913#Ngọc Sinh Linh # Gói Ngọc Sinh Linh"},
                {key: KEY_SPACE},
                {
                    key: KEY_BTN,
                    content: "lblViewInfo",
                    action: function () {
                        var packInfo = bb.framework.isAndroid() ? mc.dictionary.IAPMap["com.rpgwikigames.darknessrising.android.promopack2"] : mc.dictionary.IAPMap["com.creants.muheroes.ios.promopack2"];
                        mc.MCIapPackDialog.showIAPItem(packInfo);
                    }
                },
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Dùng Ngọc Sinh Linh để đổi các vật phẩm cực kỳ giá trị."
                },
                {key: KEY_SPACE},
                {key: KEY_LVL_ITEM, content: "1201#6211#6701#5711#5721#5111#3701#2701#1701#11978"},
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {key: KEY_TITILE, content: "Sự Kiện 2: Nhân Đôi Quà Tặng Trong Thử Thách Hàng Ngày"},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Nhân đôi các phần quà trong các thử thách Rồng Vàng, Phù Thủy và Thỏ Trắng từ 14:00 ngày 11/5/2019 - 11:00 ngày 14/5/2019"

                },
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {key: KEY_TITILE, content: "Sự Kiện 3: Ra mắt các gói trang bị cho mọi nhân vật"},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Vào Shop Khuyến Mãi để tậu ngay các trang bị yêu thích cho nhân vật của bạn nhé"
                },
                {key: KEY_SPACE},
                {
                    key: KEY_BTN,
                    content: "lblGotoShop",
                    action: function () {
                        mc.showShopPackageList();
                    }
                },
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Chúc các bạn chơi game vui vẻ!"
                }
            ],
            en: [
                {
                    key: KEY_TITILE,
                    content: "Event 1: Collect Life Orb to exchange for valuable items from 14:00 5/11/2019 - to 11:00 5/25/2019"
                },
                {key: KEY_SPACE},
                {key: KEY_TABLE_TITLE, content: "Item # Location"},
                {
                    key: KEY_TABLE_MSG,
                    content: "11913#Life Orb # Toren, Fairy Land, Snowy Land, The Tomb, Evil Tower, Atlantic"
                },
                {key: KEY_TABLE_MSG, content: "11913#Life Orb # Life Orb Pack in Promotion Shop"},
                {key: KEY_SPACE},
                {
                    key: KEY_BTN,
                    content: "lblViewInfo",
                    action: function () {
                        var packInfo = bb.framework.isAndroid() ? mc.dictionary.IAPMap["com.rpgwikigames.darknessrising.android.promopack2"] : mc.dictionary.IAPMap["com.creants.muheroes.ios.promopack2"];
                        mc.MCIapPackDialog.showIAPItem(packInfo);
                    }
                },
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Use Life Orb to exchanges for valuable items."
                },
                {key: KEY_SPACE},
                {key: KEY_LVL_ITEM, content: "1201#6211#6701#5711#5721#5111#3701#2701#1701#11978"},
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {key: KEY_TITILE, content: "Event 2: Double Rewards in Daily Challenge"},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Double Rewards in Daily Challenge Dragon, Wizard and Bunny from 14:00 5/11/2019 - 11:00 ngày 5/25/2019"

                },
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {key: KEY_TITILE, content: "Event 3: Exclusive Equipments Pack for Heroes"},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Go to Promotion Shop to buy equipments for your favourite Heroes"
                },
                {key: KEY_SPACE},
                {
                    key: KEY_BTN,
                    content: "lblGotoShop",
                    action: function () {
                        mc.showShopPackageList();
                    }
                },
                {key: KEY_SPACE},
                {key: KEY_SEPERATOR},
                {key: KEY_SPACE},
                {
                    key: KEY_TITILE_SMALL_MSG,
                    content: "Have fun!"
                }
            ]
        };

        var arrayItem = [];

        var lvl = rootMap["lvl"];
        var title = rootMap["title"];
        var title_small = rootMap["title_small"];
        var title_small_msg = rootMap["title_small_msg"];
        var table_title = rootMap["table_title"];
        var table_Content = rootMap["table_content"];
        var seperator = rootMap["seperator"];
        var space = rootMap["space"];
        var newHeroes = rootMap["newHeroes"];

        var bindTableTitle = function (row, title, msg, colorTitle, colorMsg) {
            var item = row.getChildByName("item");
            var desc = row.getChildByName("desc");
            item.setColor(colorTitle || mc.color.BROWN_SOFT);
            desc.setColor(colorMsg || mc.color.BROWN_SOFT);
            item.setString(mc.dictionary.getGUIString(title));
            desc.setString(mc.dictionary.getGUIString(msg));
        };
        var bindTableContent = function (row, icon, title, msg, colorTitle, colorMsg) {
            var item = row.getChildByName("item");
            var desc = row.getChildByName("desc");
            var iconView = row.getChildByName("icon");
            item.setColor(colorTitle || mc.color.BROWN_SOFT);
            desc.setColor(colorMsg || mc.color.BROWN_SOFT);
            item.setString(mc.dictionary.getGUIString(title));
            desc.setString(bb.utility.stringBreakLines(mc.dictionary.getGUIString(msg), 15, 350));

            var dDesH = desc.height - item.height;
            row.height += dDesH;

            iconView.y += dDesH * 0.5;
            desc.y += dDesH * 0.5;
            item.y += dDesH * 0.5;

            var itemInfo = mc.ItemStock.createJsonItemInfo(icon, 0);
            iconView.loadTexture(mc.ItemStock.getItemRes(itemInfo), ccui.Widget.LOCAL_TEXTURE);
        };

        var lvl_items = rootMap["lvl_items"];
        var lvl_items_base = rootMap["lvl_items_base"];
        var btn = rootMap["btn"];
        var data = datas[lan];
        for (var i in data) {
            var fi = data[i];
            var content = fi["content"];
            switch (fi["key"]) {
                case KEY_TITILE:
                    var ob = title.clone();
                    ob.setVisible(true);
                    ob.setColor(mc.color.YELLOW_SOFT);
                    ob.setMultiLineString(mc.dictionary.getGUIString(content), widget.width + widget.width * (1 - ob.scale));
                    arrayItem.push(ob);
                    break;
                case KEY_TITILE_SMALL:
                    var ob = title_small.clone();
                    ob.setVisible(true);
                    ob.setMultiLineString(mc.dictionary.getGUIString(content), widget.width + widget.width * (1 - ob.scale));
                    ob.setColor(mc.color.YELLOW_SOFT);
                    arrayItem.push(ob);
                    break;
                case KEY_TITILE_SMALL_MSG:
                    var ob = title_small_msg.clone();
                    ob.setVisible(true);
                    ob.setMultiLineString(mc.dictionary.getGUIString(content), widget.width + widget.width * (1 - ob.scale));
                    arrayItem.push(ob);
                    break;
                case KEY_SEPERATOR:
                    var ob = seperator.clone();
                    ob.setVisible(true);
                    arrayItem.push(ob);
                    break;
                case KEY_SPACE:
                    var ob = space.clone();
                    ob.setVisible(true);
                    arrayItem.push(ob);
                    break;
                case KEY_TABLE_TITLE:
                    var ob = table_title.clone();
                    ob.setVisible(true);
                    var msg = content.split("#");
                    bindTableTitle(ob, msg[0], msg[1], mc.color.RED_SOFT, mc.color.RED_SOFT);
                    arrayItem.push(ob);
                    break;
                case KEY_TABLE_MSG:
                    var ob = table_Content.clone();
                    ob.setVisible(true);
                    var msg = content.split("#");
                    bindTableContent(ob, msg[0], msg[1], msg[2], mc.color.WHITE_NORMAL, mc.color.WHITE_NORMAL);
                    arrayItem.push(ob);
                    break;
                case KEY_NEW_HEROES:
                    var ob = newHeroes.clone();
                    ob.setVisible(true);
                    this.bindSummon(ob, {arrayIds: content, resUrl: null});
                    arrayItem.push(ob);
                    break;
                case KEY_LVL_ITEM:
                    var ob = lvl_items.clone();
                    var lvlItems = ob.getChildByName("lvl");
                    ob.setVisible(true);
                    var arrItem = mc.ItemStock.createArrJsonItemFromStr(content);
                    var array = bb.collection.createArray(arrItem.length, function (index) {
                        var itemView = new mc.ItemView(arrItem[index]);
                        itemView.scale = 0.75;
                        itemView.registerViewItemInfo();
                        itemView.setSwallowTouches(false);
                        return itemView;
                    });
                    lvlItems.pushBackCustomItem(bb.layout.grid(array, 5, lvlItems.width, 1));
                    arrayItem.push(ob);
                    break;
                case KEY_LVL_ITEM_BASE:
                    var ob = lvl_items_base.clone();
                    var lvlItems = ob.getChildByName("lvl");
                    var icon = ob.getChildByName("icon");
                    ob.setVisible(true);

                    var splitArray = content.split("^");

                    var itemView = new mc.ItemView(mc.ItemStock.createJsonItemInfo(splitArray[0], 0));
                    itemView.scale = 0.75;
                    itemView.registerViewItemInfo();
                    itemView.x = icon.width / 2;
                    itemView.y = icon.height / 2;
                    icon.addChild(itemView);

                    var arrItem = mc.ItemStock.createArrJsonItemFromStr(splitArray[1]);
                    var array = bb.collection.createArray(arrItem.length, function (index) {
                        var itemView = new mc.ItemView(arrItem[index]);
                        itemView.scale = 0.75;
                        itemView.registerViewItemInfo();
                        return itemView;
                    });
                    lvlItems.pushBackCustomItem(bb.layout.grid(array, 3, lvlItems.width, 1));
                    arrayItem.push(ob);
                    break;
                case KEY_BTN:
                    var ob = btn.clone();
                    ob.setVisible(true);
                    ob.setString(mc.dictionary.getGUIString(content), res.font_cam_stroke_32_export_fnt, mc.const.FONT_SIZE_24);
                    if (fi["action"]) {
                        ob.registerTouchEvent(fi["action"]);
                    }
                    arrayItem.push(ob);
                    break;
            }
        }

        lvl.pushBackCustomItem(bb.layout.linear(arrayItem.reverse(), 5, bb.layout.LINEAR_VERTICAL, true));
    },

    bindGoto: function (widget, data) {
        widget.setVisible(true);
        var bg = widget.getChildByName("bg");
        bg.ignoreContentAdaptWithSize(true);
        bg.loadTexture(data["gotoUrl"], ccui.Widget.LOCAL_TEXTURE);
        var btn = bg.getChildByName("btn_goto");
        var lbl = bg.getChildByName("lbl");
        lbl && lbl.setString(mc.dictionary.getGUIString(data["lblTitle"] || "lblShopHalloweenMsg"));
        var string = btn.setString(mc.dictionary.getGUIString(data["lblButton"] || "lblGotoShop"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_32);
        string.setPosition(btn.width * 0.5, btn.height * 0.6);
        btn.registerTouchEvent(function () {
            var cb = data["gotoFUnc"];
            cb && cb();
        }.bind(this))
    },

    bindPack: function (widget, data1, data2) {
        widget.setVisible(true);
        var bg = widget.getChildByName("bg");
        var pack1 = widget.getChildByName("pack1");
        var border1 = widget.getChildByName("border1");
        var pack2 = widget.getChildByName("pack2");
        var border2 = widget.getChildByName("border2");
        bg.ignoreContentAdaptWithSize(true);
        bg.loadTexture(data1["resUrl"], ccui.Widget.LOCAL_TEXTURE);
        pack1.loadTexture(data1["urlIcon"], ccui.Widget.LOCAL_TEXTURE);
        pack2.loadTexture(data2["urlIcon"], ccui.Widget.LOCAL_TEXTURE);
        var btn = bg.getChildByName("btn_buy");
        var string = btn.setString(mc.dictionary.getGUIString("lblBuyNow"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        string.setPosition(btn.width / 2, btn.height * 0.6);
        this.activePack = data1["packId"];
        border1.setVisible(true);
        border2.setVisible(false);
        bg.loadTexture(data1["resUrl"], ccui.Widget.LOCAL_TEXTURE);
        btn.registerTouchEvent(function () {
            mc.MCIapPackDialog.showIAPItem(mc.dictionary.IAPMap[this.activePack]);
        }.bind(this));
        pack1.registerTouchEvent(function () {
            this.activePack = data1["packId"];
            border1.setVisible(true);
            border2.setVisible(false);
            bg.loadTexture(data1["resUrl"], ccui.Widget.LOCAL_TEXTURE);
        }.bind(this));
        pack2.registerTouchEvent(function () {
            this.activePack = data2["packId"];
            border1.setVisible(false);
            border2.setVisible(true);
            bg.loadTexture(data2["resUrl"], ccui.Widget.LOCAL_TEXTURE);
        }.bind(this))
    },

    bindSummon: function (widgetEvent, data) {
        widgetEvent.setVisible(true);
        var bg = widgetEvent.getChildByName("bg");
        if (bg) {
            if (data["resUrl"]) {
                bg.ignoreContentAdaptWithSize(true);
                bg.loadTexture(data["resUrl"], ccui.Widget.LOCAL_TEXTURE);
            } else {
                bg.setVisible(false);
            }
        }
        var btn = widgetEvent.getChildByName("btn_summon");
        btn.scale = 0.75;
        var lblName = widgetEvent.getChildByName("name");

        var string = btn.setString(mc.dictionary.getGUIString("lblSummonNow"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        string.setPosition(btn.width / 2, btn.height * 0.6);
        btn.registerTouchEvent(function () {
            this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SUMMON_LIST);
        }.bind(this));

        var btnViewInfo = btn.clone();
        btnViewInfo.scale = 0.75;
        btnViewInfo.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
        var string = btnViewInfo.setString(mc.dictionary.getGUIString("lblViewInfo"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
        string.setPosition(btn.width / 2, btn.height * 0.6);
        btnViewInfo.registerTouchEvent(function () {
            if (self.lastActiveHero) {
                new mc.HeroInfoDialog(self.lastActiveHero.getUserData()).show();
            }
        }.bind(this));
        widgetEvent.addChild(btnViewInfo);

        btn.x = widgetEvent.width * 0.3;
        btnViewInfo.x = widgetEvent.width * 0.7;
        btn.scale = btnViewInfo.scale = 0.75;

        var self = this;
        var selectHero = function (widget) {
            if (self.lastActiveHero) {
                self.lastActiveHero.getChildByName("focus").setVisible(false);
            }
            self.lastActiveHero = widget;
            if (self.lastActiveHero) {
                self.lastActiveHero.getChildByName("focus").setVisible(true);
            }
            var lastView = widgetEvent.getChildByName("heroView");
            if (lastView) {
                lastView.removeFromParent();
            }
            var heroInfo = widget.heroData;
            var spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(heroInfo));
            spineView.scale = 1.4;
            spineView.setName("heroView");
            spineView.setClickAble(true, undefined, heroInfo);
            spineView.setPosition(widgetEvent.width / 2, widgetEvent.height * 0.42);
            widgetEvent.addChild(spineView);

            lblName.setString(mc.HeroStock.getHeroName(heroInfo));
            lblName.setColor(mc.color.ELEMENTS[mc.HeroStock.getHeroElement(heroInfo)]);
        };
        var _showPopupInfo = function (widget) {
            selectHero(widget);
            new mc.HeroInfoDialog(widget.heroData).show();
        };

        var arrayIds = data["arrayIds"] || [];
        var arrHeroesWidgets = bb.collection.createArray(arrayIds.length, function (index) {
            var heroInfo = mc.dictionary.getHeroDictByIndex(arrayIds[index]);
            var widget = new mc.HeroAvatarView(heroInfo);
            widget.scale = 1.0;
            widget.heroData = heroInfo;
            var focus = new ccui.ImageView("event_page/pnl_pickeditems.png", ccui.Widget.PLIST_TEXTURE);
            widget.addChild(focus);
            focus.setName("focus");
            focus.setVisible(false);
            focus.setPosition(widget.width / 2, widget.height / 2);
            widget.registerTouchEvent(function () {
                selectHero(this);
            }.bind(widget), function () {
                _showPopupInfo(this);
            }.bind(widget));
            if (!self.lastActiveHero) {
                selectHero(widget);
            }
            return widget;
        });

        var linear = bb.layout.linear(arrHeroesWidgets, 15);
        linear.setPosition(widgetEvent.width / 2, widgetEvent.height * 0.1);
        widgetEvent.addChild(linear);
    },


    onLoading: function () {
    },

    onLoadDone: function (arrRanker) {
        if (arrRanker) {
            cc.log("")
        }
    },

    getLayerId: function () {
        return mc.MainScreen.LAYER_SEASON_EVENT;
    },

    isShowHeader: function () {
        return false;
    },

    isShowFooter: function () {
        return false;
    },

    isShowTip: function () {
        return false;
    }

});
// mc.SeasonEventPagesLayer = mc.MainBaseLayer.extend({
//
//     ctor: function () {
//         this._super();
//         var root = this._root = this.parseCCStudio(res.layer_halloween_event);
//         var content = root.getChildByName("content_event_1");
//         var rootMap = bb.utility.arrayToMap(content.getChildren(), function (child) {
//             return child.getName();
//         });
//
//         var img_bg = rootMap["img_bg"];
//         var img_baner = rootMap["img_baner"];
//         var banner = rootMap["banner"];
//         var event1 = rootMap["event1"];
//         var event2 = rootMap["event2"];
//         var event3 = rootMap["event3"];
//         var event4 = rootMap["event4"];
//         event1.setVisible(false);
//         event2.setVisible(false);
//         event3.setVisible(false);
//         event4.setVisible(false);
//
//         var lan = mc.storage.readSetting()["language"];
//         // var gotoUrl = (lan === "vi" ? "res/event_page/vi_event_1.png" : "res/event_page/event_1.png");
//
//         // this.bindGoto(event1, {
//         //     gotoUrl: gotoUrl,
//         //     lblButton: "lblExchange",
//         //     lblTitle: "lblShopXmasMsg",
//         //     gotoFUnc: function () {
//         //         mc.GUIFactory.showCraftItemScreen();
//         //     }.bind(this)
//         // });
//         // var pack1 = bb.framework.isIos() ? "com.creants.muheroes.ios.hotpack" : "com.creants.mightyunionheroes.android.hotpack";
//         // var pack2 = bb.framework.isIos() ? "com.creants.muheroes.ios.promopack2" : "com.creants.mightyunionheroes.android.promopack2";
//         // var url1 = (lan === "vi" ? "res/event_page/vi_event_2.png" : "res/event_page/event_2.png");
//         // var url2 = (lan === "vi" ? "res/event_page/vi_event_2_1.png" : "res/event_page/event_2_1.png");
//         // var urlIcon1 = (lan === "vi" ? "res/event_page/vi_tab_1.png" : "res/event_page/tab_1.png");
//         // var urlIcon2 = (lan === "vi" ? "res/event_page/vi_tab_2.png" : "res/event_page/tab_2.png");
//         // this.bindPack(event2, {packId: pack1, resUrl: url1, urlIcon: urlIcon1}, {
//         //     packId: pack2,
//         //     resUrl: url2,
//         //     urlIcon: urlIcon2
//         // });
//         // this.bindSummon(event3, {arrayIds: [134, 344, 814, 364, 234], resUrl: null});
//         // this.bindSummon(event3, {arrayIds: [734, 164, 614], resUrl: "res/event_page/event_3_banner.png"});
//
//         this.bindSeasonEventDetail(event4);
//
//         var listIcon = [event4];
//
//         var btnLeft = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
//         var btnRight = new ccui.ImageView("button/Left_arrow.png", ccui.Widget.PLIST_TEXTURE);
//         btnRight.scaleX = -2;
//         btnLeft.scaleX = 2;
//
//         root.addChild(btnLeft);
//         root.addChild(btnRight);
//
//         btnLeft.setVisible(false);
//         btnRight.setVisible(false);
//
//         btnLeft.runAction(cc.sequence([cc.moveBy(0.3, -10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, 10, 0), cc.delayTime(1)]).repeatForever());
//         btnRight.runAction(cc.sequence([cc.moveBy(0.3, 10, 0).easing(cc.easeExponentialOut()), cc.moveBy(0.1, -10, 0), cc.delayTime(1)]).repeatForever());
//
//         btnLeft.x = cc.winSize.width * 0.07;
//         btnRight.x = cc.winSize.width * 0.93;
//         btnLeft.y = btnRight.y = cc.winSize.height * 0.35;
//
//         var lblTime = banner.getChildByName("time");
//         var lblMsg = img_baner.getChildByName("lbl");
//         lblMsg.setString(mc.dictionary.getGUIString("lblNewYearMsg"));
//         lblMsg.setString("");
//
//         var contentView = mc.widget_utility.createScrollNode(listIcon, null, event1.width, cc.p(img_bg.width, img_bg.height), {
//             clickFunc: function (id) {
//                 mc.GameData.guiState.setCurrentPageHalloweenFocus(id);
//             },
//             autoFocusFunc: function (id) {
//                 mc.GameData.guiState.setCurrentPageHalloweenFocus(id);
//             }
//         });
//         contentView.setClippingEnabled(true);
//         contentView.setLoopScroll(false);
//         contentView.focusAt(mc.GameData.guiState.getCurrentPageHalloweenFocus());
//         img_bg.addChild(contentView);
//         contentView.setPosition(img_bg.width / 2, img_bg.height / 2);
//         btnLeft.registerTouchEvent(function () {
//             contentView.preItem();
//         });
//         btnRight.registerTouchEvent(function () {
//             contentView.nextItem();
//         });
//         // contentView.setScrollListener({
//         //     atBegin: function () {
//         //         btnLeft.setVisible(false);
//         //         btnRight.setVisible(true);
//         //     },
//         //     atMid: function () {
//         //         btnLeft.setVisible(true);
//         //         btnRight.setVisible(true);
//         //     },
//         //     atEnd: function () {
//         //         btnLeft.setVisible(true);
//         //         btnRight.setVisible(false);
//         //     }
//         // });
//     },
//
//     bindSeasonEventDetail: function (widget) {
//         widget.setVisible(true);
//         var rootMap = bb.utility.arrayToMap(widget.getChildren(), function (child) {
//             return child.getName();
//         });
//
//         var KEY_TITILE = 1;
//         var KEY_TITILE_SMALL = 2;
//         var KEY_TITILE_SMALL_MSG = 3;
//         var KEY_TABLE_TITLE = 4;
//         var KEY_LVL_ITEM = 5;
//         var KEY_LVL_ITEM_BASE = 6;
//         var KEY_BTN = 7;
//         var KEY_TABLE_MSG = 8;
//         var KEY_SEPERATOR = 9;
//         var KEY_SPACE = 10;
//         var KEY_NEW_HEROES = 11;
//         var lan = mc.storage.readSetting()["language"];
//         //var datas = {
//         //    vi: [
//         //        {key: KEY_TITILE, content: "Sự kiện 1: Săn Tìm vật phẩm Tết "},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_TABLE_TITLE, content: "Vật phẩm # Vị trí xuất hiện"},
//         //        {key: KEY_TABLE_MSG, content: "11986#Hoa Mai # Thử Thách Rồng Vàng"},
//         //        {key: KEY_TABLE_MSG, content: "11987#Hoa Đào # Thử Thách Thỏ Trắng"},
//         //        {key: KEY_TABLE_MSG, content: "11985#Mâm Ngũ Quả # Các Màn Chơi Boss"},
//         //        {key: KEY_TABLE_MSG, content: "11988#Bánh Chưng # Tháp Hỗn Nguyên"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "Kết hợp các vật phẩm trên để chế tạo các loại dây chuyền hoàn hảo cực xịn."
//         //        },
//         //        {key: KEY_SPACE},
//         //        {key: KEY_LVL_ITEM, content: "9502#9512#9522#9532#9542#9552#9562#9572#9582#9592"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_TITILE, content: "Sự Kiện 2: Mở Bao Lì Xì Trúng Lớn"},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "Các loại Bao Lì Xì và Bao Lì Xì Hoàng Kim có thể mua trong Shop Bách Hóa hoặc thông qua gói Khuyến Mãi:"
//         //        },
//         //        {key: KEY_LVL_ITEM_BASE, content: "11976^11978/1#11985/40#11986/40#11987/40#11988/40#11006/40"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_LVL_ITEM_BASE, content: "11977^11979/1#11985/200#11986/200#11987/200#11988/200#11006/200"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "Bạn cũng có thể kiếm được Bao Lì Xì khi đạt top Boss thế giới"
//         //        },
//         //        {
//         //            key: KEY_BTN,
//         //            content: "lblGotoShop",
//         //            action: function () {
//         //                mc.showShopPackageList();
//         //            }
//         //        },
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_BTN,
//         //            content: "Goto Boss",
//         //            action: function () {
//         //                var currScreen = bb.director.getCurrentScreen();
//         //                currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS);
//         //            }
//         //        },
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "Các Anh hùng mới đã xuất hiện"
//         //        },
//         //        {
//         //            key: KEY_NEW_HEROES,
//         //            content: [134, 344, 814, 364, 234]
//         //        },
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "Chúc các bạn năm mới vui vẻ!"
//         //        }
//         //    ],
//         //    en: [
//         //        {key: KEY_TITILE, content: "Event 1: Hunting and Exchange items:"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_TABLE_TITLE, content: "Items # Location"},
//         //        {key: KEY_TABLE_MSG, content: "11986#Apricot Blossom # Golden Dragon Challenge"},
//         //        {key: KEY_TABLE_MSG, content: "11987#Cherry Blossom # White Rabbit Challenge"},
//         //        {key: KEY_TABLE_MSG, content: "11985#Five Fruit Tray #  Campaign Boss Stages"},
//         //        {key: KEY_TABLE_MSG, content: "11988#Sticky Rice Cake # Chaos Tower"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "Combine the above items to create Great Excellent Pedants."
//         //        },
//         //        {key: KEY_SPACE},
//         //        {key: KEY_LVL_ITEM, content: "9502#9512#9522#9532#9542#9552#9562#9572#9582#9592"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_TITILE, content: "Event 2: Open the Lucky Envelop"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "All kinds of Lucky Envelop and Golden Lucky Envelop can be purchased in the Common Shop or through the Promotion package:"
//         //        },
//         //        {key: KEY_LVL_ITEM_BASE, content: "11976^11978/1#11985/40#11986/40#11987/40#11988/40#11006/40"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_LVL_ITEM_BASE, content: "11977^11979/1#11985/200#11986/200#11987/200#11988/200#11006/200"},
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "You can also earn a Lucky Envelop when you reach the top of the World Boss"
//         //        },
//         //        {
//         //            key: KEY_BTN,
//         //            content: "lblGotoShop",
//         //            action: function () {
//         //                mc.showShopPackageList();
//         //            }
//         //        },
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_BTN,
//         //            content: "Goto Boss",
//         //            action: function () {
//         //                var currScreen = bb.director.getCurrentScreen();
//         //                currScreen.pushLayerWithId(mc.MainScreen.LAYER_WORLD_BOSS);
//         //            }
//         //        },
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "New Heroes For New Year"
//         //        },
//         //        {
//         //            key: KEY_NEW_HEROES,
//         //            content: [134, 344, 814, 364, 234]
//         //        },
//         //        {key: KEY_SPACE},
//         //        {key: KEY_SEPERATOR},
//         //        {key: KEY_SPACE},
//         //        {
//         //            key: KEY_TITILE_SMALL_MSG,
//         //            content: "We wish you Happy Lunar New Year!"
//         //        }
//         //    ]
//         //};
//         var datas = {
//             vi: [
//                 {
//                     key: KEY_TITILE,
//                     content: "Sự kiện 1: Săn Ngọc Sinh Linh Đổi Quà Giá Trị từ 14:00 ngày 11/5/2019 - đến 11:00 ngày 25/5/2019"
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_TABLE_TITLE, content: "Vật phẩm # Vị trí xuất hiện"},
//                 {
//                     key: KEY_TABLE_MSG,
//                     content: "11913#Ngọc Sinh Linh # Toren, Fairy Land, Snowy Land, The Tomb, Evil Tower, Atlantic"
//                 },
//                 {key: KEY_TABLE_MSG, content: "11913#Ngọc Sinh Linh # Gói Ngọc Sinh Linh"},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_BTN,
//                     content: "lblViewInfo",
//                     action: function () {
//                         var packInfo = bb.framework.isAndroid() ? mc.dictionary.IAPMap["com.creants.mightyunionheroes.android.promopack2"] : mc.dictionary.IAPMap["com.creants.muheroes.ios.promopack2"];
//                         mc.MCIapPackDialog.showIAPItem(packInfo);
//                     }
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Dùng Ngọc Sinh Linh để đổi các vật phẩm cực kỳ giá trị."
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_LVL_ITEM, content: "1201#6211#6701#5711#5721#5111#3701#2701#1701#11978"},
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {key: KEY_TITILE, content: "Sự Kiện 2: Nhân Đôi Quà Tặng Trong Thử Thách Hàng Ngày"},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Nhân đôi các phần quà trong các thử thách Rồng Vàng, Phù Thủy và Thỏ Trắng từ 14:00 ngày 11/5/2019 - 11:00 ngày 14/5/2019"
//
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {key: KEY_TITILE, content: "Sự Kiện 3: Ra mắt các gói trang bị cho mọi nhân vật"},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Vào Shop Khuyến Mãi để tậu ngay các trang bị yêu thích cho nhân vật của bạn nhé"
//                 },
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_BTN,
//                     content: "lblGotoShop",
//                     action: function () {
//                         mc.showShopPackageList();
//                     }
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Chúc các bạn chơi game vui vẻ!"
//                 }
//             ],
//             en: [
//                 {
//                     key: KEY_TITILE,
//                     content: "Event 1: Collect Life Orb to exchange for valuable items from 14:00 5/11/2019 - to 11:00 5/25/2019"
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_TABLE_TITLE, content: "Item # Location"},
//                 {
//                     key: KEY_TABLE_MSG,
//                     content: "11913#Life Orb # Toren, Fairy Land, Snowy Land, The Tomb, Evil Tower, Atlantic"
//                 },
//                 {key: KEY_TABLE_MSG, content: "11913#Life Orb # Life Orb Pack in Promotion Shop"},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_BTN,
//                     content: "lblViewInfo",
//                     action: function () {
//                         var packInfo = bb.framework.isAndroid() ? mc.dictionary.IAPMap["com.creants.mightyunionheroes.android.promopack2"] : mc.dictionary.IAPMap["com.creants.muheroes.ios.promopack2"];
//                         mc.MCIapPackDialog.showIAPItem(packInfo);
//                     }
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Use Life Orb to exchanges for valuable items."
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_LVL_ITEM, content: "1201#6211#6701#5711#5721#5111#3701#2701#1701#11978"},
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {key: KEY_TITILE, content: "Event 2: Double Rewards in Daily Challenge"},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Double Rewards in Daily Challenge Dragon, Wizard and Bunny from 14:00 5/11/2019 - 11:00 ngày 5/25/2019"
//
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {key: KEY_TITILE, content: "Event 3: Exclusive Equipments Pack for Heroes"},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Go to Promotion Shop to buy equipments for your favourite Heroes"
//                 },
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_BTN,
//                     content: "lblGotoShop",
//                     action: function () {
//                         mc.showShopPackageList();
//                     }
//                 },
//                 {key: KEY_SPACE},
//                 {key: KEY_SEPERATOR},
//                 {key: KEY_SPACE},
//                 {
//                     key: KEY_TITILE_SMALL_MSG,
//                     content: "Have fun!"
//                 }
//             ]
//         };
//
//         var arrayItem = [];
//
//         var lvl = rootMap["lvl"];
//         var title = rootMap["title"];
//         var title_small = rootMap["title_small"];
//         var title_small_msg = rootMap["title_small_msg"];
//         var table_title = rootMap["table_title"];
//         var table_Content = rootMap["table_content"];
//         var seperator = rootMap["seperator"];
//         var space = rootMap["space"];
//         var newHeroes = rootMap["newHeroes"];
//
//         var bindTableTitle = function (row, title, msg, colorTitle, colorMsg) {
//             var item = row.getChildByName("item");
//             var desc = row.getChildByName("desc");
//             item.setColor(colorTitle || mc.color.BROWN_SOFT);
//             desc.setColor(colorMsg || mc.color.BROWN_SOFT);
//             item.setString(mc.dictionary.getGUIString(title));
//             desc.setString(mc.dictionary.getGUIString(msg));
//         };
//         var bindTableContent = function (row, icon, title, msg, colorTitle, colorMsg) {
//             var item = row.getChildByName("item");
//             var desc = row.getChildByName("desc");
//             var iconView = row.getChildByName("icon");
//             item.setColor(colorTitle || mc.color.BROWN_SOFT);
//             desc.setColor(colorMsg || mc.color.BROWN_SOFT);
//             item.setString(mc.dictionary.getGUIString(title));
//             desc.setString(bb.utility.stringBreakLines(mc.dictionary.getGUIString(msg),15,350));
//
//             var dDesH = desc.height - item.height;
//             row.height += dDesH;
//
//             iconView.y += dDesH*0.5;
//             desc.y += dDesH*0.5;
//             item.y += dDesH*0.5;
//
//             var itemInfo = mc.ItemStock.createJsonItemInfo(icon, 0);
//             iconView.loadTexture(mc.ItemStock.getItemRes(itemInfo), ccui.Widget.LOCAL_TEXTURE);
//         };
//
//         var lvl_items = rootMap["lvl_items"];
//         var lvl_items_base = rootMap["lvl_items_base"];
//         var btn = rootMap["btn"];
//         var data = datas[lan];
//         for (var i in data) {
//             var fi = data[i];
//             var content = fi["content"];
//             switch (fi["key"]) {
//                 case KEY_TITILE:
//                     var ob = title.clone();
//                     ob.setVisible(true);
//                     ob.setColor(mc.color.YELLOW_SOFT);
//                     ob.setMultiLineString(mc.dictionary.getGUIString(content), widget.width + widget.width * (1 - ob.scale));
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_TITILE_SMALL:
//                     var ob = title_small.clone();
//                     ob.setVisible(true);
//                     ob.setMultiLineString(mc.dictionary.getGUIString(content), widget.width + widget.width * (1 - ob.scale));
//                     ob.setColor(mc.color.YELLOW_SOFT);
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_TITILE_SMALL_MSG:
//                     var ob = title_small_msg.clone();
//                     ob.setVisible(true);
//                     ob.setMultiLineString(mc.dictionary.getGUIString(content), widget.width + widget.width * (1 - ob.scale));
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_SEPERATOR:
//                     var ob = seperator.clone();
//                     ob.setVisible(true);
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_SPACE:
//                     var ob = space.clone();
//                     ob.setVisible(true);
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_TABLE_TITLE:
//                     var ob = table_title.clone();
//                     ob.setVisible(true);
//                     var msg = content.split("#");
//                     bindTableTitle(ob, msg[0], msg[1], mc.color.RED_SOFT, mc.color.RED_SOFT);
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_TABLE_MSG:
//                     var ob = table_Content.clone();
//                     ob.setVisible(true);
//                     var msg = content.split("#");
//                     bindTableContent(ob, msg[0], msg[1], msg[2], mc.color.WHITE_NORMAL, mc.color.WHITE_NORMAL);
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_NEW_HEROES:
//                     var ob = newHeroes.clone();
//                     ob.setVisible(true);
//                     this.bindSummon(ob, {arrayIds: content, resUrl: null});
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_LVL_ITEM:
//                     var ob = lvl_items.clone();
//                     var lvlItems = ob.getChildByName("lvl");
//                     ob.setVisible(true);
//                     var arrItem = mc.ItemStock.createArrJsonItemFromStr(content);
//                     var array = bb.collection.createArray(arrItem.length, function (index) {
//                         var itemView = new mc.ItemView(arrItem[index]);
//                         itemView.scale = 0.75;
//                         itemView.registerViewItemInfo();
//                         itemView.setSwallowTouches(false);
//                         return itemView;
//                     });
//                     lvlItems.pushBackCustomItem(bb.layout.grid(array, 5, lvlItems.width, 1));
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_LVL_ITEM_BASE:
//                     var ob = lvl_items_base.clone();
//                     var lvlItems = ob.getChildByName("lvl");
//                     var icon = ob.getChildByName("icon");
//                     ob.setVisible(true);
//
//                     var splitArray = content.split("^");
//
//                     var itemView = new mc.ItemView(mc.ItemStock.createJsonItemInfo(splitArray[0], 0));
//                     itemView.scale = 0.75;
//                     itemView.registerViewItemInfo();
//                     itemView.x = icon.width / 2;
//                     itemView.y = icon.height / 2;
//                     icon.addChild(itemView);
//
//                     var arrItem = mc.ItemStock.createArrJsonItemFromStr(splitArray[1]);
//                     var array = bb.collection.createArray(arrItem.length, function (index) {
//                         var itemView = new mc.ItemView(arrItem[index]);
//                         itemView.scale = 0.75;
//                         itemView.registerViewItemInfo();
//                         return itemView;
//                     });
//                     lvlItems.pushBackCustomItem(bb.layout.grid(array, 3, lvlItems.width, 1));
//                     arrayItem.push(ob);
//                     break;
//                 case KEY_BTN:
//                     var ob = btn.clone();
//                     ob.setVisible(true);
//                     ob.setString(mc.dictionary.getGUIString(content), res.font_cam_stroke_32_export_fnt, mc.const.FONT_SIZE_24);
//                     if (fi["action"]) {
//                         ob.registerTouchEvent(fi["action"]);
//                     }
//                     arrayItem.push(ob);
//                     break;
//             }
//         }
//
//         lvl.pushBackCustomItem(bb.layout.linear(arrayItem.reverse(), 5, bb.layout.LINEAR_VERTICAL, true));
//     },
//
//     bindGoto: function (widget, data) {
//         widget.setVisible(true);
//         var bg = widget.getChildByName("bg");
//         bg.ignoreContentAdaptWithSize(true);
//         bg.loadTexture(data["gotoUrl"], ccui.Widget.LOCAL_TEXTURE);
//         var btn = bg.getChildByName("btn_goto");
//         var lbl = bg.getChildByName("lbl");
//         lbl && lbl.setString(mc.dictionary.getGUIString(data["lblTitle"] || "lblShopHalloweenMsg"));
//         var string = btn.setString(mc.dictionary.getGUIString(data["lblButton"] || "lblGotoShop"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_32);
//         string.setPosition(btn.width * 0.5, btn.height * 0.6);
//         btn.registerTouchEvent(function () {
//             var cb = data["gotoFUnc"];
//             cb && cb();
//         }.bind(this))
//     },
//     bindPack: function (widget, data1, data2) {
//         widget.setVisible(true);
//         var bg = widget.getChildByName("bg");
//         var pack1 = widget.getChildByName("pack1");
//         var border1 = widget.getChildByName("border1");
//         var pack2 = widget.getChildByName("pack2");
//         var border2 = widget.getChildByName("border2");
//         bg.ignoreContentAdaptWithSize(true);
//         bg.loadTexture(data1["resUrl"], ccui.Widget.LOCAL_TEXTURE);
//         pack1.loadTexture(data1["urlIcon"], ccui.Widget.LOCAL_TEXTURE);
//         pack2.loadTexture(data2["urlIcon"], ccui.Widget.LOCAL_TEXTURE);
//         var btn = bg.getChildByName("btn_buy");
//         var string = btn.setString(mc.dictionary.getGUIString("lblBuyNow"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
//         string.setPosition(btn.width / 2, btn.height * 0.6);
//         this.activePack = data1["packId"];
//         border1.setVisible(true);
//         border2.setVisible(false);
//         bg.loadTexture(data1["resUrl"], ccui.Widget.LOCAL_TEXTURE);
//         btn.registerTouchEvent(function () {
//             mc.MCIapPackDialog.showIAPItem(mc.dictionary.IAPMap[this.activePack]);
//         }.bind(this));
//         pack1.registerTouchEvent(function () {
//             this.activePack = data1["packId"];
//             border1.setVisible(true);
//             border2.setVisible(false);
//             bg.loadTexture(data1["resUrl"], ccui.Widget.LOCAL_TEXTURE);
//         }.bind(this));
//         pack2.registerTouchEvent(function () {
//             this.activePack = data2["packId"];
//             border1.setVisible(false);
//             border2.setVisible(true);
//             bg.loadTexture(data2["resUrl"], ccui.Widget.LOCAL_TEXTURE);
//         }.bind(this))
//     },
//
//     bindSummon: function (widgetEvent, data) {
//         widgetEvent.setVisible(true);
//         var bg = widgetEvent.getChildByName("bg");
//         if (bg) {
//             if (data["resUrl"]) {
//                 bg.ignoreContentAdaptWithSize(true);
//                 bg.loadTexture(data["resUrl"], ccui.Widget.LOCAL_TEXTURE);
//             } else {
//                 bg.setVisible(false);
//             }
//         }
//         var btn = widgetEvent.getChildByName("btn_summon");
//         btn.scale = 0.75;
//         var lblName = widgetEvent.getChildByName("name");
//
//         var string = btn.setString(mc.dictionary.getGUIString("lblSummonNow"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
//         string.setPosition(btn.width / 2, btn.height * 0.6);
//         btn.registerTouchEvent(function () {
//             this.getMainScreen().pushLayerWithId(mc.MainScreen.LAYER_SUMMON_LIST);
//         }.bind(this));
//
//         var btnViewInfo = btn.clone();
//         btnViewInfo.scale = 0.75;
//         btnViewInfo.loadTexture("button/Green_Round.png", ccui.Widget.PLIST_TEXTURE);
//         var string = btnViewInfo.setString(mc.dictionary.getGUIString("lblViewInfo"), res.font_UTMBienvenue_none_32_export_fnt, mc.const.FONT_SIZE_24);
//         string.setPosition(btn.width / 2, btn.height * 0.6);
//         btnViewInfo.registerTouchEvent(function () {
//             if (self.lastActiveHero) {
//                 new mc.HeroInfoDialog(self.lastActiveHero.getUserData()).show();
//             }
//         }.bind(this));
//         widgetEvent.addChild(btnViewInfo);
//
//         btn.x = widgetEvent.width * 0.3;
//         btnViewInfo.x = widgetEvent.width * 0.7;
//         btn.scale = btnViewInfo.scale = 0.75;
//
//         var self = this;
//         var selectHero = function (widget) {
//             if (self.lastActiveHero) {
//                 self.lastActiveHero.getChildByName("focus").setVisible(false);
//             }
//             self.lastActiveHero = widget;
//             if (self.lastActiveHero) {
//                 self.lastActiveHero.getChildByName("focus").setVisible(true);
//             }
//             var lastView = widgetEvent.getChildByName("heroView");
//             if (lastView) {
//                 lastView.removeFromParent();
//             }
//             var heroInfo = widget.heroData;
//             var spineView = mc.BattleViewFactory.createCreatureGUIByIndex(mc.HeroStock.getHeroIndex(heroInfo));
//             spineView.scale = 1.4;
//             spineView.setName("heroView");
//             spineView.setClickAble(true, undefined, heroInfo);
//             spineView.setPosition(widgetEvent.width / 2, widgetEvent.height * 0.42);
//             widgetEvent.addChild(spineView);
//
//             lblName.setString(mc.HeroStock.getHeroName(heroInfo));
//             lblName.setColor(mc.color.ELEMENTS[mc.HeroStock.getHeroElement(heroInfo)]);
//         };
//         var _showPopupInfo = function (widget) {
//             selectHero(widget);
//             new mc.HeroInfoDialog(widget.heroData).show();
//         };
//
//         var arrayIds = data["arrayIds"] || [];
//         var arrHeroesWidgets = bb.collection.createArray(arrayIds.length, function (index) {
//             var heroInfo = mc.dictionary.getHeroDictByIndex(arrayIds[index]);
//             var widget = new mc.HeroAvatarView(heroInfo);
//             widget.scale = 1.0;
//             widget.heroData = heroInfo;
//             var focus = new ccui.ImageView("event_page/pnl_pickeditems.png", ccui.Widget.PLIST_TEXTURE);
//             widget.addChild(focus);
//             focus.setName("focus");
//             focus.setVisible(false);
//             focus.setPosition(widget.width / 2, widget.height / 2);
//             widget.registerTouchEvent(function () {
//                 selectHero(this);
//             }.bind(widget), function () {
//                 _showPopupInfo(this);
//             }.bind(widget));
//             if (!self.lastActiveHero) {
//                 selectHero(widget);
//             }
//             return widget;
//         });
//
//         var linear = bb.layout.linear(arrHeroesWidgets, 15);
//         linear.setPosition(widgetEvent.width / 2, widgetEvent.height * 0.1);
//         widgetEvent.addChild(linear);
//     },
//
//
//     onLoading: function () {
//     },
//
//     onLoadDone: function (arrRanker) {
//         if (arrRanker) {
//             cc.log("")
//         }
//     },
//
//     getLayerId: function () {
//         return mc.MainScreen.LAYER_SEASON_EVENT;
//     },
//
//     isShowHeader: function () {
//         return false;
//     },
//
//     isShowFooter: function () {
//         return false;
//     },
//
//     isShowTip: function () {
//         return false;
//     }
//
// });
