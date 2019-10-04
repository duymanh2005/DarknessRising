/**
 * Created by long.nguyen on 3/30/2018.
 */
mc.MineScreen = mc.Screen.extend({

    ctor:function(selectChapterIndex){
        this._super();
        this._selectChapterIndex = selectChapterIndex;
    },

    initResources:function(){
        this._super();

        cc.spriteFrameCache.addSpriteFrames(res.consumable1_plist);
        cc.spriteFrameCache.addSpriteFrames(res.consumable2_plist);

        var root = this._rootNode = ccs.load(res.screen_mine_json,"res/").node;
        root.anchorX = root.anchorY = 0.5;
        root.x = cc.winSize.width*0.5;
        root.y = cc.winSize.height*0.5;
        this.addChild(root);

        var rootMap = bb.utility.arrayToMap(root.getChildByName("root").getChildren(),function(child){
            return child.getName();
        });

        this._mapItemProgressViewByItemIndex = {};
        this._mapHeroProgressViewBySlotIndex = {};
        this._mapItemViewByItemIndex = {};
        this._mapPlusBtnBySlotIndex = {};
        this._mapAvtViewByHeroId = {};
        var mineSystem = mc.GameData.mineSystem;

        var lblZenRate = rootMap["lblZenRate"];
        var lblExpRate = rootMap["lblExpRate"];
        var brkTitle = rootMap["brkTitle"];
        var progressZen = this._progressZenView = rootMap["progressZen"];
        var lblTotalZen = this._lblTotalZen = rootMap["lblTotalZen"];
        var progressExp = this._progressExpView = rootMap["progressExp"];
        var lblTotalExp = this._lblTotalExp = rootMap["lblTotalExp"];
        var nodeHero = rootMap["nodeHero"];
        var nodeItem = rootMap["nodeItem"];
        var lblZenRate = rootMap["lblZenRate"];
        var lblExpRate = rootMap["lblExpRate"];
        var lblItemRate = rootMap["lblItemRate"];
        var lblMaxItem = rootMap["lblMaxItem"];
        var btnStopMine = this._btnStopMine = rootMap["btnStop"];
        var btnCollect = this._btnCollect = rootMap["btnCollect"];
        var btnMine = this._btnMine = rootMap["btnMine"];
        var btnBack = rootMap["btnBack"];

        if( mineSystem.getMiningChapterIndex() >= 0 ){
            brkTitle.setString(mc.const.ARR_CHAPTER_NAME[mineSystem.getMiningChapterIndex()]+" Mine");
        }
        btnCollect.setString(mc.dictionary.getGUIString("lblCollect"));
        btnStopMine.setString(mc.dictionary.getGUIString("lblStop"));

        this._miningZenObject = null;
        this._miningItemObject = null;
        this._miningExpObject = null;

        var allMineObj = mineSystem.getAllMiningObjects();
        var arrItemInfo = [];
        for(var i = 0; i < allMineObj.length; i++ ){
            var miningObject = allMineObj[i];
            if( miningObject.getType() === mc.MiningObject.TYPE_ZEN ){
                this._miningZenObject = miningObject;
            }
            else if( miningObject.getType() === mc.MiningObject.TYPE_ITEM ){
                this._miningItemObject = miningObject;
                var arrMiningItem = miningObject.getArrayMiningItem();
                if( arrMiningItem ){
                    for(var m = 0; m < arrMiningItem.length; m++ ){
                        arrItemInfo.push(mc.ItemStock.createJsonItemInfo(arrMiningItem[m].index,arrMiningItem[m].quantity));
                    }
                }
            }
            else if( miningObject.getType() === mc.MiningObject.TYPE_EXP ){
                this._miningExpObject = miningObject;
            }
        }

        var arrProgressItemView = [];
        var layoutItemGrid = this._layoutItemGrid = bb.layout.grid(bb.collection.createArray(arrItemInfo.length,function(index){
            var itemInfo = arrItemInfo[index];
            var itemView = new mc.ItemView(itemInfo).setNewScale(0.7);
            var progress = this._createItemProgress(itemInfo);
            this._mapItemViewByItemIndex[mc.ItemStock.getItemIndex(itemInfo)] = itemView;
            this._mapItemProgressViewByItemIndex[mc.ItemStock.getItemIndex(itemInfo)] = progress;
            arrProgressItemView.push(progress);
            return itemView;
        }.bind(this)),5,610,20);

        var layoutProgressItemGrid = this._layoutProgressItemGrid = bb.layout.grid(arrProgressItemView,5,610,10);

        var arrProgressHeroView = [];
        var arrMiningHeroId = mineSystem.getArrayMiningHeroId();
        var layoutHeroGrid = this._layoutHeroGrid = bb.layout.grid(bb.collection.createArray(10,function(index){
            var plusBtn = new ccui.ImageView("button/Cross_Unavailable.png", ccui.Widget.PLIST_TEXTURE);
            plusBtn.setUserData(index);
            plusBtn.scale = 0.75;
            plusBtn.registerTouchEvent(function(plusBtn){
                new mc.HeroStockDialog().setMultiSelectMode(true).setExtraHeroFunc(function(heroWidget,heroInfo){
                    if( this._mapAvtViewByHeroId[mc.HeroStock.getHeroId(heroInfo)] ){
                        heroWidget.setStatusText("Mine");
                    }
                }.bind(this)).setFilter(null,function(heroWidget){
                    var heroId = mc.HeroStock.getHeroId(heroWidget.getUserData());
                    if( !heroWidget.isBlack ){
                        var slotIndex = this._findEmptySlot();
                        if( slotIndex >= 0 ){
                            this.addMiningHero(heroId,slotIndex);
                            this._updateGUI();
                            heroWidget.setStatusText("Mine");
                        }
                    }
                    else{
                        this.removeMiningHero(heroId);
                        heroWidget.setStatusText("");
                    }
                }.bind(this)).show();
            }.bind(this));
            this._mapPlusBtnBySlotIndex[index] = plusBtn;
            var progress = this._createHeroProgress(0);
            this._mapHeroProgressViewBySlotIndex[index] = progress;
            arrProgressHeroView.push(progress);
            return plusBtn
        }.bind(this)),5,610,10);

        var layoutProgressHeroGrid = this._layoutProgressHeroGrid = bb.layout.grid(arrProgressHeroView,5,610,10);

        for(var i = 0; i < arrMiningHeroId.length; i++ ){
            var heroId = arrMiningHeroId[i];
            if( heroId ){
                this.addMiningHero(heroId,this._findEmptySlot());
            }
        }

        nodeItem.addChild(layoutItemGrid);
        nodeItem.addChild(layoutProgressItemGrid);
        nodeHero.addChild(layoutHeroGrid);
        nodeHero.addChild(layoutProgressHeroGrid);

        root.runAction(cc.sequence([cc.delayTime(1.0),cc.callFunc(function(){
            this._miningZenAndExp(true);
        }.bind(this))]).repeatForever());
        root.runAction(cc.sequence([cc.delayTime(10.0),cc.callFunc(function(){
            this._miningItem(true);
        }.bind(this))]).repeatForever());

        var _updateMining = function(){
            this._updateGUI();
            this._miningZenAndExp();
            this._miningItem();
        }.bind(this);

        btnMine.registerTouchEvent(function(){
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.startMine(this._selectChapterIndex,this._getArrayMiningHeroIds(),function(){
                mc.view_utility.hideLoadingDialogById(loadingId);
                _updateMining();
            });
        }.bind(this));

        btnStopMine.registerTouchEvent(function(){
            for(var heroId in this._mapAvtViewByHeroId ){
                if( this._mapAvtViewByHeroId[heroId] ){
                    var slotIndex = this._mapAvtViewByHeroId[heroId]._slotIndex;
                    this._mapAvtViewByHeroId[heroId].removeFromParent();
                    this._mapAvtViewByHeroId[heroId] = null;
                    this._mapPlusBtnBySlotIndex[slotIndex].setVisible(true);
                }
            }
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.stopMine(function(){
                mc.view_utility.hideLoadingDialogById(loadingId);
                _updateMining();
            });
        }.bind(this));

        btnCollect.registerTouchEvent(function(){
            var productionZen = this._miningZenObject.getAllProductionValue();
            var productionExp = this._miningExpObject.getAllProductionValue();
            var arrMiningItemInfo = this._miningItemObject.getAllProductionValue();
            arrMiningItemInfo.push(mc.ItemStock.createJsonItemZen(productionZen));

            var arrHeroIds = this._getArrayMiningHeroIds();
            var count = arrHeroIds.length;
            (count <= 0) && (count = 1);
            var expPerHero = Math.floor(productionExp / count);
            var arrMiningHeroInfo = [];
            for(var i = 0; i < arrHeroIds.length; i++ ){
                arrMiningHeroInfo.push({
                    id:arrHeroIds[i],
                    exp:expPerHero
                });
            }
            var loadingId = mc.view_utility.showLoadingDialog();
            mc.protocol.collectMine(arrMiningItemInfo,arrMiningHeroInfo,function(result){
                mc.view_utility.hideLoadingDialogById(loadingId);
                if( result && result["heroExpArr"] ){
                    var arr = result["heroExpArr"];
                    for(var h = 0; h < arr.length; h++ ){
                        var heroId = arr[h].id;
                        if( this._mapAvtViewByHeroId[heroId] ){
                            this._mapAvtViewByHeroId[heroId].setHeroInfo(mc.GameData.heroStock.getHeroById(heroId));
                        }
                    }
                    _updateMining();
                }
            }.bind(this));
            _updateMining();
        }.bind(this));

        btnBack.registerTouchEvent(function () {
            mc.GameData.guiState.popScreen();
        }.bind(this));

        _updateMining();

        this.traceDataChange(mc.GameData.itemStock,function(){
            var arrNewComingItem = mc.GameData.itemStock.popArrayNewComingItem();
            if( arrNewComingItem){
                mc.view_utility.showNewComingItem(arrNewComingItem);
            }
        }.bind(this));
    },

    onScreenClose:function(){
        this._super();
        mc.GameData.mineSystem.clearAllTempMiningHero();
    },

    _getArrayMiningHeroIds:function(){
        var arrHeroIds = [];
        for(var heroId in this._mapAvtViewByHeroId ){
            if( this._mapAvtViewByHeroId[heroId] ){
                arrHeroIds.push(parseInt(heroId));
            }
        }
        return arrHeroIds;
    },

    _updateGUI:function(){
        var mineSystem = mc.GameData.mineSystem;
        var arrMiningHeroId = mineSystem.getArrayMiningHeroId();
        this._btnCollect.setVisible(false);
        this._btnMine.setGray(arrMiningHeroId.length === 0 );
        var isMining = mineSystem.isMining();
        if( isMining ){
            this._btnCollect.setVisible(true);
            this._btnStopMine.setVisible(true);
            this._btnMine.setVisible(false);
        }
        else{
            this._btnCollect.setVisible(false);
            this._btnStopMine.setVisible(false);
            this._btnMine.setVisible(true);
        }

        var mapEnableSlot = {};
        var allHeroAvtView = this._layoutHeroGrid.getChildren();
        for(var i = 0; i < allHeroAvtView.length; i++ ){
            if( allHeroAvtView[i] instanceof mc.HeroAvatarView ){
                allHeroAvtView[i].setStatusText(isMining ? "mining" : "");
                mapEnableSlot[allHeroAvtView[i]._slotIndex] = true;
            }
            else{
                allHeroAvtView[i].setColor(isMining ? mc.color.BLACK_DISABLE_SOFT : cc.color.WHITE);
            }
            allHeroAvtView[i].setEnabled(!isMining);
        }
        for(var slotIndex in this._mapHeroProgressViewBySlotIndex ){
            this._mapHeroProgressViewBySlotIndex[slotIndex].setVisible( (mapEnableSlot[slotIndex] && isMining) ? true : false);
        }
        for(var itemIndex in this._mapItemProgressViewByItemIndex ){
            this._mapItemProgressViewByItemIndex[itemIndex].setVisible(isMining);
        }

        //this._lblMaxGold.setDecoratorLabel(bb.utility.formatNumber(this._miningZenObject.getTotalMaxProductionValue()));
        //this._lblMaxItem.setDecoratorLabel(this._miningItemObject.getTotalMaxProductionValue());
        //this._lblMaxExp.setDecoratorLabel(bb.utility.formatNumber(this._miningExpObject.getTotalMaxProductionValue()));
        //this._lblDuration.setDecoratorLabel(mc.view_utility.formatDurationTime(this._miningItemObject.getTotalProductionDuration()*1000));
        //if( isMining ){
        //    if( this._spineMine._currTrack != 1){
        //        this._spineMine.clearTrack(0);
        //        this._spineMine.setAnimation(1,"mining",true);
        //        this._spineMine._currTrack = 1;
        //    }
        //}
        //else{
        //    if( this._spineMine._currTrack != 0){
        //        this._spineMine.clearTrack(1);
        //        this._spineMine.setAnimation(0,"idle",true);
        //        this._spineMine._currTrack = 0;
        //    }
        //}
    },

    _miningZenAndExp:function(animate){
        if( mc.GameData.mineSystem.isMining() ){
            var productionZen = this._miningZenObject.getAllProductionValue();
            var maxMiningZen = this._miningZenObject.getTotalMaxProductionValue();
            var productionExp = this._miningExpObject.getAllProductionValue();
            var maxMiningExp = this._miningExpObject.getTotalMaxProductionValue();

            maxMiningZen <= 0 && (maxMiningZen = 1);
            maxMiningExp <= 0 && (maxMiningExp = 1);

            this._progressZenView.setPercent(Math.round(productionZen/maxMiningZen));
            this._progressExpView.setPercent(Math.round(productionZen/maxMiningZen));
            this._lblTotalZen.setString(bb.utility.formatNumber(productionZen)+" / " + bb.utility.formatNumber(maxMiningZen));
            this._lblTotalExp.setString(bb.utility.formatNumber(productionExp)+" / " + bb.utility.formatNumber(maxMiningExp));

            if( animate ){
                var oldVal = this._progressZenView.getUserData() || 0;
                var delta = productionZen-oldVal;
                if( delta > 0 ){
                    var lblDelta = bb.framework.getGUIFactory().createText("+"+delta);
                    lblDelta.setColor(mc.color.GREEN_NORMAL);
                    lblDelta.x = this._progressZenView.x;
                    lblDelta.y = this._progressZenView.y;
                    lblDelta.runAction(cc.sequence([cc.moveBy(0.25,0,50),cc.fadeOut(1.5),cc.removeSelf()]));
                    this._rootNode.addChild(lblDelta);
                }

                var oldVal = this._progressExpView.getUserData() || 0;
                var delta = productionZen-oldVal;
                if( delta > 0 ){
                    var lblDelta = bb.framework.getGUIFactory().createText("+"+delta);
                    lblDelta.setColor(mc.color.GREEN_NORMAL);
                    lblDelta.x = this._progressExpView.x;
                    lblDelta.y = this._progressExpView.y;
                    lblDelta.runAction(cc.sequence([cc.moveBy(0.25,0,50),cc.fadeOut(1.5),cc.removeSelf()]));
                    this._rootNode.addChild(lblDelta);
                }
            }

            this._progressExpView.setUserData(productionZen);
            this._progressZenView.setUserData(productionZen);

            var count = this._getArrayMiningHeroIds().length;
            (count <= 0 ) && (count = 1);
            var expPerHero = Math.floor(productionExp/count);
            for(var heroId in this._mapAvtViewByHeroId ){
                var heroView = this._mapAvtViewByHeroId[heroId];
                if( heroView ){
                    var slotIndex = heroView._slotIndex;
                    var progressHero = this._mapHeroProgressViewBySlotIndex[slotIndex];
                    if( progressHero ){
                        var currHeroInfo = heroView.getUserData();
                        var exp = mc.HeroStock.getHeroExp(currHeroInfo);
                        var baseExp = exp.curr;
                        var currLevel = mc.HeroStock.getHeroLevel(currHeroInfo);

                        var objExp = mc.dictionary.getHeroLevelByHeroExp(currLevel,expPerHero + baseExp,mc.HeroStock.getHeroRank(currHeroInfo));
                        var newLevel = objExp.level;
                        var remainExp = objExp.remain;
                        var maxExpAtNewLvl = mc.dictionary.getHeroExpByHeroLevel(newLevel+1);
                        if( newLevel > currLevel ){
                            progressHero._oldProgress.setPercentage(0);
                            progressHero._newProgress.setPercentage(Math.round((remainExp/maxExpAtNewLvl)*100));
                        }
                        else{
                            progressHero._oldProgress.setPercentage(Math.round((exp.curr/exp.total)*100));
                            progressHero._newProgress.setPercentage(Math.round((remainExp/maxExpAtNewLvl)*100));
                        }
                    }
                }
            }

            this._collectZenAndExpEnable = (productionExp > 0 || productionExp > 0);
            this._btnCollect.setGray(!this._collectZenAndExpEnable && !this._collectItemEnable);
            this._btnStopMine.setGray(this._btnCollect.isEnabled());
        }
        else{
            this._progressZenView.setPercent(0);
            this._progressExpView.setPercent(0);
            this._lblTotalZen.setString(0+" / " +bb.utility.formatNumber(this._miningZenObject.getTotalMaxProductionValue()));
            this._lblTotalExp.setString(0+" / " +bb.utility.formatNumber(this._miningExpObject.getTotalMaxProductionValue()));
        }
    },

    _miningItem:function(animate){
        if( mc.GameData.mineSystem.isMining() ){
            var arrMiningItemInfo = this._miningItemObject.getAllProductionValue();
            if( arrMiningItemInfo ){
                var canCollect = false;
                for(var i = 0; i < arrMiningItemInfo.length; i++ ){
                    var itemInfo = arrMiningItemInfo[i];
                    var progressItem = this._mapItemProgressViewByItemIndex[mc.ItemStock.getItemIndex(itemInfo)];
                    var lblQuantity = progressItem.getChildByName("quantity");
                    var productionVal = mc.ItemStock.getItemQuantity(itemInfo);
                    if( productionVal > 0 ){
                        canCollect = true;
                    }
                    lblQuantity.setString("x"+productionVal);
                    if( animate ){
                        this._playMiningProgressAnimation(this._layoutProgressItemGrid,progressItem,productionVal);
                    }
                    lblQuantity.setUserData(productionVal);
                    lblQuantity.setVisible(productionVal > 0);
                    var itemView = this._mapItemViewByItemIndex[mc.ItemStock.getItemIndex(itemInfo)];
                    itemView.setBlack(productionVal === 0);
                }
                this._collectItemEnable = canCollect;
                this._btnCollect.setGray(!this._collectZenAndExpEnable && !this._collectItemEnable);
                this._btnStopMine.setGray(this._btnCollect.isEnabled());
            }
        }
    },

    _findEmptySlot:function(){
        var slotIndex = -1;
        for(var slotId in this._mapPlusBtnBySlotIndex ){
            if( this._mapPlusBtnBySlotIndex[slotId].isVisible() ){
                slotIndex = parseInt(slotId);
                break;
            }
        }
        return slotIndex;
    },

    _playMiningProgressAnimation:function(container,progressView,value){
        var lbl = progressView.getChildByName("quantity");
        var oldVal = lbl.getUserData() || 0;
        var delta = value-oldVal;
        lbl.setUserData(value);
        if( delta > 0){
            var lblDelta = bb.framework.getGUIFactory().createText("+"+delta);
            lblDelta.setColor(mc.color.GREEN_NORMAL);
            lblDelta.x = progressView.x;
            lblDelta.y = progressView.y;
            lblDelta.runAction(cc.sequence([cc.moveBy(0.25,0,50),cc.fadeOut(1.5),cc.removeSelf()]));
            container.addChild(lblDelta);
        }
    },

    _createItemProgress:function(itemInfo){
        var widget = new ccui.Layout();
        widget.anchorX = widget.anchorY = 0.5;
        widget.width = 100;
        widget.height = 120;
//         widget.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        var lblProgress = bb.framework.getGUIFactory().createText("x"+bb.utility.formatNumber(mc.ItemStock.getItemQuantity(itemInfo)));
        lblProgress.x = widget.width*0.5;
        lblProgress.y = lblProgress.height*0.5;
        lblProgress.setName("quantity");
        widget.addChild(lblProgress);
        return widget;
    },

    _createHeroProgress:function(exp){
        var widget = new ccui.Layout();
        widget.anchorX = widget.anchorY = 0.5;
        widget.width = 100;
        widget.height = 120;
//         widget.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
        var progressContainer = new cc.Node();
        progressContainer.anchorX = progressContainer.anchorY = 0.5;
        progressContainer.setName("progress");
        progressContainer.scale = 0.85;

        var brkProgress = new cc.Sprite("#bar/Small_Frame.png");
        var oldExpProgress = widget._oldProgress = new cc.ProgressTimer(new cc.Sprite("#bar/Small_EXP_gauge.png"));
        oldExpProgress.barChangeRate = cc.p(1.0,0.0);
        oldExpProgress.midPoint = cc.p(0.0,1.0);
        oldExpProgress.type = cc.ProgressTimer.TYPE_BAR;
        var spr = new cc.Sprite("#bar/Small_HP.png");
        var newExpProgress = widget._newProgress = new cc.ProgressTimer(spr);
        newExpProgress.barChangeRate = cc.p(1.0,0.0);
        newExpProgress.midPoint = cc.p(0.0,1.0);
        newExpProgress.type = cc.ProgressTimer.TYPE_BAR;

        progressContainer.width = brkProgress.width*0.85;
        progressContainer.height = brkProgress.height*0.85;
        progressContainer.x = widget.width*0.5;
        progressContainer.y = 0;
        brkProgress.x = progressContainer.width*0.5;
        brkProgress.y = progressContainer.height*0.5;
        oldExpProgress.x = brkProgress.x;
        oldExpProgress.y = brkProgress.y;
        newExpProgress.x = brkProgress.x;
        newExpProgress.y = brkProgress.y;

        progressContainer.addChild(newExpProgress);
        progressContainer.addChild(oldExpProgress);
        progressContainer.addChild(brkProgress);
        widget.addChild(progressContainer);
        return widget;
    },

    addMiningHero:function(heroId,slotIndex){
        var heroInfo = mc.GameData.heroStock.getHeroById(heroId);
        var heroView = new mc.HeroAvatarView(heroInfo);
        heroView._slotIndex = slotIndex;
        heroView.setNewScale(0.75);
        heroView.registerTouchEvent(function(heroView){
            var heroId = mc.HeroStock.getHeroId(heroView.getUserData());
            this.removeMiningHero(heroId);
        }.bind(this));

        var slotView = this._mapPlusBtnBySlotIndex[slotIndex];
        slotView.setVisible(false);
        heroView.x = slotView.x;
        heroView.y = slotView.y;
        this._layoutHeroGrid.addChild(heroView);
        this._mapAvtViewByHeroId[heroId] = heroView;
        mc.GameData.mineSystem.addMiningHero(heroInfo);
    },

    removeMiningHero:function(heroId){
        var heroView = this._mapAvtViewByHeroId[heroId];
        this._mapAvtViewByHeroId[heroId] = null;
        var heroInfo = heroView.getUserData();
        var slotIndex = heroView._slotIndex;
        heroView.removeFromParent();

        var slotView = this._mapPlusBtnBySlotIndex[slotIndex];
        slotView.setVisible(true);
        mc.GameData.mineSystem.removeMiningHero(heroInfo);
        this._updateGUI();
    }

});