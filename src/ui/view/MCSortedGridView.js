/**
 * Created by long.nguyen on 8/2/2017.
 */
mc.SortedGridView = ccui.Layout.extend({
    _enableEditButton: false,

    ctor: function (sampleView) {
        this._super();
        this.setInfoText("No. ");
        this.setNumberElementPerRow(5);
        this.setGridWidth(cc.winSize.width - 80);
        this.setPaddingHeight(5);
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        this.width = 730;
        this.height = 510;
        if (sampleView) {
            this.x = sampleView.x;
            this.y = sampleView.y;
            this.width = sampleView.width;
            this.height = sampleView.height;
            sampleView.removeFromParent();
        }
        this.setCascadeOpacityEnabled(true);
    },

    setCurrentSortIndex: function (sortIndex) {
        this._currSortIndex = sortIndex;
        return this;
    },

    setCurrentFilterIndex: function (filterIndex) {
        this._currFilterIndex = filterIndex;
    },

    setNumberElementPerRow: function (numElementPerRow) {
        this._numElementPerRow = numElementPerRow;
        return this;
    },

    setGridWidth: function (width) {
        this._gridWidth = width;
        return this;
    },

    setPaddingHeight: function (paddingHeight) {
        this._paddingHeigt = paddingHeight;
        return this;
    },

    setInfoText: function (title, txtTotal,width) {
        this._infoTitle = title;
        this._infoTotal = txtTotal;
        this._infoWidth = width || this._infoWidth;
        return this;
    },

    setEditButton: function (editTitle, editCallback) {
        this.setEditButton1(editTitle, editCallback);
    },

    setEditButton1: function (editTitle, editCallback) {
        this._editText1 = editTitle;
        this._editCallback1 = editCallback;
        return this;
    },
    setEditButton2: function (editTitle, editCallback) {
        this._editText2 = editTitle;
        this._editCallback2 = editCallback;
        return this;
    },

    getEditButton1: function () {
        return this._editButton1;
    },

    setSortingDataSource: function (arrSource, getAttrFunc) {
        this._arrSortSource = arrSource;
        this._getSortingAttrFunc = getAttrFunc;
        return this;
    },

    setFilteringDataSource: function (arrSource, getAttrFunc, minFilteringData) {
        this._arrFilterSource = arrSource;
        this._getFilteringAttrFunc = getAttrFunc;
        this._minFilteringData = minFilteringData;
        return this;
    },

    setBackgroundUrl: function (brkUrl) {
        this._brkUrl = brkUrl;
        return this;
    },

    getBackgroundView: function () {
        return this._brkView;
    },

    forceRefresh: function (setSize) {
        this.updateAllElementView(this.getAllElementView(), setSize);
    },

    removeElementView: function (child) {
        this._scrollView.removeChild(child, true);
        var widget = this._funcCreateView(this._maxElement);
        widget && this._scrollView.addChild(widget);
        this.forceRefresh();
    },

    removeArrayElementView: function (arrChild) {
        for (var i = 0; i < arrChild.length; i++) {
            this._scrollView.removeChild(arrChild[i], true);
            var widget = this._funcCreateView(this._maxElement + i);
            widget && this._scrollView.addChild(widget);
        }
        this.forceRefresh();
    },

    addArrayElementView: function (arrChild) {
        for (var i = 0; i < arrChild.length; i++) {
            this._scrollView.addChild(arrChild[i]);
        }
        this.forceRefresh();
    },

    getAllElementView: function () {
        return this._scrollView.getChildren();
    },

    updateAllElementView: function (arrChild, setSize) {
        var scrollView = this._scrollView;
        var filterIndexAttr = this._currFilterIndex || 0;
        var arrResultChild = [];
        var numIgnore = 0;
        var numPick = undefined;
        if (this._getFilteringAttrFunc) {
            numPick = 0;
            for (var i = 0; i < arrChild.length; i++) {
                arrChild[i].setVisible(false);
                var val = this._getFilteringAttrFunc(arrChild[i], filterIndexAttr);
                if (val >= 0) {
                    if (val > 0) {
                        numPick++;
                    }
                    arrResultChild.push(arrChild[i]);
                }
                else {
                    numIgnore++;
                }
            }
        }
        else {
            arrResultChild = arrChild;
        }
        var sortIndexAttr = this._currSortIndex || 0;
        if (this._getSortingAttrFunc) {
            arrResultChild.sort(function (child1, child2) {
                var comp = this._getSortingAttrFunc(child2, sortIndexAttr) - this._getSortingAttrFunc(child1, sortIndexAttr);
                if (comp === 0) {
                    comp = this._getSortingAttrFunc(child2, -1) - this._getSortingAttrFunc(child1, -1);
                }
                return comp;
            }.bind(this));
        }
        var minFilteringData = this._minFilteringData || 0;
        var numElement = Math.max(this._maxElement - numIgnore, minFilteringData);
        var numCol = this._numElementPerRow;
        var numRow = Math.ceil(numElement / numCol);
        var maxW = arrResultChild[0].width;
        var maxH = arrResultChild[0].height;
        for (var i = 0; i < arrResultChild.length && i < numElement; i++) {
            var view = arrResultChild[i];
            if (view) {
                maxW = Math.max(maxW, view.width);
                maxH = Math.max(maxH, view.height);
            }
        }
        var contentWidth = this._gridWidth;
        var xLeft = (this.width - contentWidth) * 0.5;
        var paddingW = (contentWidth - (numCol * maxW)) / (numCol + 1);
        var paddingH = this._paddingHeigt;
        var contentHeight = numRow * maxH + paddingH * 2 + (numRow - 1) * paddingH;
        for (var i = 0; i < arrResultChild.length && i < numElement; i++) {
            var view = arrResultChild[i];
            if (view) {
                view.setVisible(true);
                view.setSwallowTouches(false);
                var col = i % numCol;
                var row = Math.floor(i / numCol);
                view.x = xLeft + (col + 1) * paddingW + col * maxW + (view.width * view.anchorX);
                view.y = contentHeight - (row + 1) * paddingH - (row + 1) * maxH + (view.height * view.anchorY);
            }
        }
        setSize && scrollView.setInnerContainerSize(cc.size(contentWidth, contentHeight));
        if (numPick != undefined) {
            this.setInfoText(this._infoTitle, numPick);
            this._lblNumMax.setString(numPick);
        }
    },

    updateInfoText:function(){
        this._maxInfoPanel && (this._maxInfoPanel.removeFromParent());
        var maxInfoPanel = this._maxInfoPanel = new ccui.ImageView("patch9/Small_Brown_Panel.png", ccui.Widget.PLIST_TEXTURE);
        var lblInfoText = mc.GUIFactory.createText(this._infoTitle);
        var lblNumMax = this._lblNumMax = mc.GUIFactory.createText(this._infoTotal);
        lblNumMax.setColor(mc.color.BLUE_SOFT);
        maxInfoPanel.anchorX = 0;
        maxInfoPanel.setScale9Enabled(true);
        maxInfoPanel.addChild(lblInfoText);
        maxInfoPanel.addChild(lblNumMax);
        maxInfoPanel.width = this._infoWidth || 140;
        lblInfoText.anchorX = 0;
        lblInfoText.x = 15;
        lblInfoText.y = maxInfoPanel.height * 0.65;
        lblNumMax.anchorX = 1.0;
        lblNumMax.x = maxInfoPanel.width - 15;
        lblNumMax.y = maxInfoPanel.height * 0.65;
        maxInfoPanel.setCascadeOpacityEnabled(true);
        maxInfoPanel.x = 35;
        maxInfoPanel.y = this.height - maxInfoPanel.height - 15;
        this.addChild(maxInfoPanel);
        return maxInfoPanel;
    },

    setDataSource: function (maxElement, funcCreateView) {
        this._maxElement = maxElement;
        this._funcCreateView = funcCreateView;

        cc.spriteFrameCache.addSpriteFrames(res.patch9_1_plist);


        var self = this;
        var sortComboBox = null;
        var filterComboBox = null;
        var currSortIndex = this._currSortIndex || 0;
        var currFilterIndex = this._currFilterIndex || 0;
        if (this._arrSortSource) {
            sortComboBox = this._sortComboBox = new mc.ComboBox("Sort");
            sortComboBox.setDataSource(this._arrSortSource, currSortIndex, function (comboBox, index) {
                this._currSortIndex = index;
                this.forceRefresh(true);
            }.bind(this));
        }
        if (this._arrFilterSource) {
            filterComboBox = this._filterComboBox = new mc.ComboBox("Filter");
            filterComboBox.setDataSource(this._arrFilterSource, currFilterIndex, function (comboBox, index) {
                this._currFilterIndex = index;
                this.forceRefresh(true);
            }.bind(this));
        }
        if (this._editText1 && this._editCallback1) {
            var editButton1 = this._editButton1 = mc.GUIFactory.createButton(this._editText1);
            editButton1.scale = 0.75;
            editButton1.registerTouchEvent(function (sender) {
                editButton1.setVisible(!this._editButton2 || this._editButton2.isVisible());
                this._editButton2 && this._editButton2.setVisible(true);
                this._editCallback1 && this._editCallback1();
            }.bind(this));
        }
        if (this._editText2 && this._editCallback2) {
            var editButton2 = this._editButton2 = mc.GUIFactory.createButton(this._editText2);
            editButton2.scale = 0.75;
            editButton2.loadTexture("button/Blue_Button.png", ccui.Widget.PLIST_TEXTURE);
            editButton2.registerTouchEvent(function () {
                editButton2.setVisible(!this._editButton1 || this._editButton1.isVisible());
                this._editButton1 && this._editButton1.setVisible(true);
                this._editCallback2 && this._editCallback2();
            }.bind(this));
        }
        var brk = null;
        if (this._brkUrl != undefined) {
            if (this._brkUrl === "") {
                brk = new ccui.Layout();
            }
            else {
                brk = new ccui.ImageView(this._brkUrl, ccui.Widget.PLIST_TEXTURE);
                brk.setScale9Enabled(true);
            }
        }
        else {
            brk = new ccui.ImageView("patch9/Grid_Panel.png", ccui.Widget.PLIST_TEXTURE);
            brk.setScale9Enabled(true);
        }
        this._brkView = brk;
        var scrollView = this._scrollView = new ccui.ScrollView();
        scrollView.setCascadeOpacityEnabled(true);
        scrollView.anchorX = 0.5;
        scrollView.anchorY = 0.5;
        scrollView.width = this.width;
        scrollView.height = this.height - 140;

        brk.x = this.width * 0.5;
        brk.y = this.height * 0.5;
        brk.width = this.width;
        brk.height = this.height;

        this.addChild(brk);
        this.addChild(scrollView);
        var maxInfoPanel = this.updateInfoText();

        var pw = 15;
        var xLayout = maxInfoPanel.x + maxInfoPanel.width + pw;
        if (sortComboBox) {
            xLayout += sortComboBox.width * 0.5;
            sortComboBox.x = xLayout;
            sortComboBox.y = maxInfoPanel.y;
            xLayout += sortComboBox.width * 0.5 + pw;
        }
        if (filterComboBox) {
            xLayout += filterComboBox.width * 0.5;
            filterComboBox.x = xLayout;
            filterComboBox.y = maxInfoPanel.y;
            xLayout += filterComboBox.width * 0.5 + pw;
        }
        if (editButton1) {
            editButton1.y = maxInfoPanel.y;
            editButton1.x = this._gridWidth - editButton1.width * 0.5 * editButton1.scale;
        }
        if (editButton2) {
            editButton2.y = maxInfoPanel.y;
            editButton2.x = this._gridWidth - editButton2.width * 0.5 * editButton2.scale;
        }
        scrollView.x = this.width * 0.5;
        scrollView.y = maxInfoPanel.y - maxInfoPanel.height * 0.5 - 10 - scrollView.height * 0.5;

        if (sortComboBox) {
            this.addChild(sortComboBox);
        }
        if (filterComboBox) {
            this.addChild(filterComboBox);
        }
        if (editButton1) {
            this.addChild(editButton1);
            editButton1.setLocalZOrder(1);
            editButton1.setVisible(true);
        }
        if (editButton2) {
            this.addChild(editButton2);
            editButton2.setVisible(false);
        }

        // populate data.
        for (var i = 0; i < this._maxElement; i++) {
            var widget = this._funcCreateView(i);
            widget && scrollView.addChild(widget);
        }
        if (this._minFilteringData != undefined) {
            for (var i = 0; i < this._minFilteringData; i++) {
                var widget1 = this._funcCreateView(this._maxElement + i);
                widget1 && scrollView.addChild(widget1);
            }
        }
        this.forceRefresh(true);
        return this;
    },
    getCurrentPercentY: function () {
        return bb.utility.getCurrentPercentY(this._scrollView);
    },
    restorePercentY: function (percent) {
        var maxH = this._scrollView.getInnerContainer().height - this._scrollView.height;
        if (maxH > 0) {
            this._scrollView.getInnerContainer().y = percent * maxH / 100 - maxH;
        }
    },
    scrollToItem:function(itemView,time){
        bb.utility.scrollTo(this._scrollView,itemView.y - this._scrollView.height*0.5,time);
    },

    getScrollView:function () {
        return this._scrollView;
    }

});