/**
 * Created by long.nguyen on 11/5/2018.
 */
mc.EggGameLogDialog = bb.Dialog.extend({
    ctor: function (jsonData) {
        this._super();
        var arenaDict = mc.dictionary.arenaDictionary;

        var node = ccs.load(res.widget_egg_game_log, "res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = this._rootMap = bb.utility.arrayToMap(root.getChildren(), function (child) {
            return child.getName();
        });
        var lblTitle = rootMap["lblTitle"];
        lblTitle.setString(mc.dictionary.getGUIString("lblEggGame"));
        var lvlContent = this._lvlContent = rootMap["lvlContent"];
        this._lblEmpty = rootMap["lblEmpty"];
        this._lblEmpty.setString(mc.dictionary.getGUIString("lblEggGameLogEmpty"));
        this._lblEmpty.setVisible(false);

        this._row = rootMap["row"];
        this._header = rootMap["header"];


        var btnClose = this._btnClose = rootMap["btnClose"];
        btnClose.setString(mc.dictionary.getGUIString("lblClose"));


        btnClose.registerTouchEvent(function () {
            this.close();
        }.bind(this));

        var btnClear = rootMap["btnClear"];
        btnClear.setString(mc.dictionary.getGUIString("lblDeleteAll"));
        var self = this;
        btnClear.registerTouchEvent(function () {

            var msg = mc.dictionary.getGUIString("lblConfirmClearEggGameLog")

            var dialog = new mc.DefaultDialog()
                .setTitle(mc.dictionary.getGUIString("lblWarning"))
                .setMessage(msg)
                .enableYesNoButton(function () {
                    dialog.close();
                    mc.storage.eggGameLog = null;
                    mc.storage.saveEggGameLog();
                    self._initContent();
                }, function(){
                    dialog.close();
                }).disableExitButton();

            dialog.show();
        }.bind(this));

        this._initContent();
    },

    _initContent: function () {
        this._lvlContent.removeAllChildren();
        if (mc.storage.eggGameLog && mc.storage.eggGameLog.time) {
            this._lvlContent.setVisible(true);
            this._lblEmpty.setVisible(false);
            _loadCostRow = function (cell, info) {
                var rowTotal = info.amount * info.price.no;
                var itemm = mc.ItemStock.createJsonItemInfo(info.price.index, rowTotal)
                var view = mc.view_utility.createAssetView(itemm);
                view.setScale(1);
                var lbl = cell.getChildByName("lblInfo");
                lbl.setString(  bb.utility.formatNumber(info.amount) + " x " + info.price.no + " : ");
                cell.addChild(view);
                view.anchorX = 1;
                view.anchorY = 0.5;
                lbl.x -= 10;
                view.x = lbl.x + 160;
                view.y += 35;

                var eggNode = new cc.Node();
                var spineEgg = null;
                var type = info.type;
                if (type) {
                    if (type === "1000") {
                        spineEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1000_json, res.spine_ui_egg_1000_atlas, 0.05);
                    }
                    else if (type === "1001") {
                        spineEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1001_json, res.spine_ui_egg_1001_atlas, 0.05);
                    }
                    else if (type === "1002") {
                        spineEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1002_json, res.spine_ui_egg_1002_atlas, 0.05);
                    }
                    else {
                        spineEgg = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_egg_1003_json, res.spine_ui_egg_1003_atlas, 0.05);
                    }
                }
                eggNode.addChild(spineEgg);
                eggNode.x = lbl.x - 160;
                eggNode.y += 5;
                cell.addChild(eggNode);
                return cell;
            };

            _loadRewardRow = function (cell, info) {
                var itemm = mc.ItemStock.createJsonItemInfo(info.index, info.no)
                var view = mc.view_utility.createAssetView(itemm);
                view.setScale(1);
                var lbl = cell.getChildByName("lblInfo");
                //lbl.setString(" X " + info.no );
                lbl.setVisible(false);
                cell.addChild(view);
                view.anchorX = 1;
                view.anchorY = 0.5;
                view.x = lbl.x + 150;
                view.y += 40;
                return cell;
            };

            _loadRewardGridRow = function ( arrItem) {
                var layout = bb.layout.grid(bb.collection.createArray(arrItem.length, function (index) {
                    var itemView = new mc.ItemView(arrItem[index]);
                    itemView.setNewScale(0.75);
                    itemView.registerViewItemInfo();
                    return itemView;
                }.bind(this)), 4, this._lvlContent.width * 0.98, 5);
                return layout;
            }.bind(this);

            _totalCostRow = function (cell, info) {
                var itemm = mc.ItemStock.createJsonItemInfo(info.index, info.no)
                var view = mc.view_utility.createAssetView(itemm);
                view.setScale(1);
                var lbl = cell.getChildByName("lblInfo");
                lbl.setString(mc.dictionary.getGUIString("lblTotal") + " : ");
                lbl.x -= 10;
                cell.addChild(view);
                view.anchorX = 1;
                view.anchorY = 0.5;
                view.x = lbl.x + 160;
                view.y += 35;
                return cell;
            };

            _bindHeader = function (cell, text) {
                var lbl = cell.getChildByName("lblInfo");
                lbl.setString(text);
                return cell;
            };

            _convertMSecToDateString = function (msec) {
                var curdate = new Date(null);
                curdate.setTime(msec);
                var month = curdate.getMonth()+1;
                var hour = curdate.getHours();
                if(hour<10)
                {
                    hour = "0" + hour;
                }
                var min = curdate.getMinutes();
                if(min<10)
                {
                    min = "0" + min;
                }
                var str = curdate.getDate() + "/" + month + "/" + curdate.getFullYear() + " " + hour + ":" + min;
                return str;
                //return curdate.toLocaleString();
            }

            _bindTime = function (cell, timeInfo) {
                var lbl = cell.getChildByName("lblInfo");
                lbl.anchorX = 0.5;
                lbl.anchorY = 0.5;
                lbl.x = cell.width/2;

                var text = mc.dictionary.getGUIString("lblTime") + " : " + _convertMSecToDateString(timeInfo.start) + " - " + _convertMSecToDateString(timeInfo.end);
                lbl.setString(text);
                return cell;
            };

            var total = 0;
            var itemIndex = 0;

            var timeCell = _bindTime(this._row.clone(), mc.storage.eggGameLog.time);
            this._lvlContent.pushBackCustomItem(timeCell);

            var headerCost = _bindHeader(this._header.clone(), mc.dictionary.getGUIString("lblEgg"));
            this._lvlContent.pushBackCustomItem(headerCost);
            var arrCost = []
            for (var i in mc.storage.eggGameLog.cost) {
                var row = mc.storage.eggGameLog.cost[i];
                arrCost.push(row);
                itemIndex = row.price.index;
                var amountRow = row.price.no * row.amount;
                total += amountRow;
            }
            arrCost.sort(function(a,b){
                return a.type - b.type;
            });
            for(var i = 0;i<arrCost.length;i++)
            {
                var cell = _loadCostRow(this._row.clone(), arrCost[i]);
                this._lvlContent.pushBackCustomItem(cell);
            }


            var totalCell = _totalCostRow(this._row.clone(), {index: itemIndex, no: total});
            this._lvlContent.pushBackCustomItem(totalCell);

            var headerReward = _bindHeader(this._header.clone(), mc.dictionary.getGUIString("lblGiftReceived"));

            this._lvlContent.pushBackCustomItem(headerReward);


            //for (var i in mc.storage.eggGameLog.reward) {
            //    var row = mc.storage.eggGameLog.reward[i];
            //    var cell = _loadRewardRow(this._row.clone(), row);
            //    this._lvlContent.pushBackCustomItem(cell);
            //}
            var arr = [];
            for (var i in mc.storage.eggGameLog.reward) {
                var row = mc.storage.eggGameLog.reward[i];
                arr.push(row);
            }
            if(arr && arr.length>0)
            {
                arr.sort(function(a,b){
                    return b.index - a.index;
                })
                var grid = _loadRewardGridRow(arr);
                this._lvlContent.pushBackCustomItem(grid);
            }
        }
        else {
            this._lvlContent.setVisible(false);
            this._lblEmpty.setVisible(true);
        }
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
