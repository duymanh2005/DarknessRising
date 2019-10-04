/**
 * Created by long.nguyen on 12/6/2017.
 */
mc.SkillInfoDialog = bb.Dialog.extend({

    ctor:function(heroId,skillIndex,upgradeCb,backUpHeroIndex){
        this._super();
        this._heroId = heroId;
        this._skillIndex = skillIndex;
        this._upgradeCb = upgradeCb;
        this._backUpheroIndex = backUpHeroIndex;

        var node = ccs.load(res.widget_skill_popup_info,"res/").node;
        this.addChild(node);
        var root = this._root = node.getChildByName("root");
        var rootMap = bb.utility.arrayToMap(root.getChildren(),function(child){
            return child.getName();
        });

        var nodeAvt = this._nodeAvt = rootMap["nodeAvt"];
        var lblName = this._lblName = rootMap["lblName"];
        var lblType = this._lblType = rootMap["lblType"];
        var lblInfo = this._lblInfo = rootMap["lblInfo"];
        if(mc.enableReplaceFontBM())
        {
            lblName = this._lblName = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblName);
            lblType = this._lblType = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblType);
            lblInfo = this._lblInfo = mc.view_utility.replaceBitmapFontAndApplyTextStyle(lblInfo);
        }
        var btnUpgrade = this._btnUpgrade = rootMap["btnUpgrade"];
        var btnClose = rootMap["btnClose"];

        btnUpgrade.setString(mc.dictionary.getGUIString("lblUpgrade"));
        btnClose.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        this._loadSkillInfo();

        var skillDict = mc.dictionary.getSkillByIndex(skillIndex);
        var isLastUpgradeSkill = mc.HeroStock.getSkillUpgradeOf(skillDict) === null;
        if( !this._canUpgradable() || (skillDict && skillDict.skillType === mc.const.SKILL_TYPE_LEADER) || isLastUpgradeSkill){
            btnUpgrade.setVisible(false);
            btnClose.setVisible(false);
            this._assetUpgrade && this._assetUpgrade.setVisible(false);
            this.setAutoClose(true);

            var delta = 140;
            root.height -= delta;
            lblName.y -= delta;
            nodeAvt.y -= delta;
            lblType.y -= delta;
            lblInfo.y -= delta;
            btnUpgrade.y -= delta;
            btnClose.y -= delta;
        }

        if( !this._canUpgradable() ){
            var blackBrk = new ccui.Layout();
            blackBrk.setLocalZOrder(-1);
            blackBrk.setBackGroundColorType(ccui.Layout.BG_COLOR_SOLID);
            blackBrk.setBackGroundColor(cc.color.BLACK);
            blackBrk.setBackGroundColorOpacity(bb.framework.getTrueOpacity(128));
            blackBrk.width = cc.winSize.width;
            blackBrk.height = cc.winSize.height;
            this.addChild(blackBrk);
        }
    },

    _canUpgradable:function(){
        return this._upgradeCb != null;
    },

    _isLeaderSkill:function(){
        var skillDict = mc.dictionary.getSkillByIndex(this._skillIndex);
        if( skillDict ){
            return skillDict.skillType === mc.const.SKILL_TYPE_LEADER;
        }
        return false;
    },

    _loadSkillInfo:function(){

        var heroInfo = mc.GameData.heroStock.getHeroById(this._heroId);
        if( heroInfo ){
            var skillList = mc.HeroStock.getHeroSkillList(heroInfo);
            var skillInfo = bb.collection.findBy(skillList,function(skillInfo,skillIndex){
                return mc.HeroStock.getSkillIndexOfHero(skillInfo) === skillIndex;
            },this._skillIndex);
            if( !skillInfo ){
                var dict = mc.dictionary.getHeroDictByIndex(this._backUpheroIndex);
                if( dict ){
                    skillList = dict.skillList;
                }
                skillInfo = bb.collection.findBy(skillList,function(skillInfo,skillIndex){
                    return mc.HeroStock.getSkillIndexOfHero(skillInfo) === skillIndex;
                },this._skillIndex);
            }

            var nodeAvt = this._nodeAvt ;
            var lblName = this._lblName ;
            var lblType = this._lblType ;
            var lblInfo = this._lblInfo ;
            nodeAvt.removeAllChildren();
            this._assetUpgrade && this._assetUpgrade.removeFromParent();

            var isLeader = mc.HeroStock.getSkillTypeOfHero(skillInfo) === mc.const.SKILL_TYPE_LEADER;
            var skillWidget = mc.view_utility.createSkillInfoIcon(skillInfo);
            nodeAvt.addChild(skillWidget);
            nodeAvt.width = skillWidget.width;
            nodeAvt.height = skillWidget.height;

            lblName.setString(mc.HeroStock.getSkillNameOfHero(skillInfo));
            lblType.setColor(isLeader ? mc.color.YELLOW : mc.color.BLUE);
            var skillType = mc.HeroStock.getSkillTypeOfHero(skillInfo);
            if( skillType === mc.const.SKILL_TYPE_LEADER ){
                lblType.setString(mc.dictionary.getGUIString("lblLeaderSkill"));
            }
            else if( skillType === mc.const.SKILL_TYPE_ACTIVE ){
                lblType.setString(mc.dictionary.getGUIString("lblActiveSkill"));
            }
            else if( skillType === mc.const.SKILL_TYPE_PASSIVE ){
                lblType.setString(mc.dictionary.getGUIString("lblPassiveSkill"));
            }
            else if( skillType === mc.const.SKILL_TYPE_AUTO_CAST ){
                lblType.setString(mc.dictionary.getGUIString("lblAutoCastSkill"));
            }

            if(mc.enableReplaceFontBM())
            {
                lblInfo.getVirtualRenderer().setBoundingWidth(this._root.width*0.85);
            }
            else
            {
                lblInfo.getVirtualRenderer().setBoundingWidth(this._root.width*0.95);
            }
            lblInfo.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
            lblInfo.setString(mc.HeroStock.getSkillDescriptionOfHero(skillInfo));

            var itemStock = mc.GameData.itemStock;
            var element = mc.HeroStock.getHeroElement(heroInfo);
            var url = null;
            element = element.toLowerCase();
            var sphere = null;
            if( element === mc.const.ELEMENT_FIRE ){
                url = mc.ItemStock.getItemRes({index:mc.const.ITEM_INDEX_FIRE_SPHERE});
                sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_FIRE_SPHERE))[0];
            }
            else if( element === mc.const.ELEMENT_WATER ){
                url = mc.ItemStock.getItemRes({index:mc.const.ITEM_INDEX_WATER_SPHERE});
                sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_WATER_SPHERE))[0];
            }
            else if( element === mc.const.ELEMENT_LIGHT ){
                url = mc.ItemStock.getItemRes({index:mc.const.ITEM_INDEX_LIGHT_SPHERE});
                sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_LIGHT_SPHERE))[0];
            }
            else if( element === mc.const.ELEMENT_EARTH ){
                url = mc.ItemStock.getItemRes({index:mc.const.ITEM_INDEX_EARTH_SPHERE});
                sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_EARTH_SPHERE))[0];
            }
            else if( element === mc.const.ELEMENT_DARK ){
                url = mc.ItemStock.getItemRes({index:mc.const.ITEM_INDEX_DARK_SPHERE});
                sphere = mc.ItemStock.groupItem(itemStock.getArrayItemByIndex(mc.const.ITEM_INDEX_DARK_SPHERE))[0];
            }
            var numSphere = sphere ? mc.ItemStock.getItemQuantity(sphere) : 0;
            var crystalView = new ccui.ImageView(url,ccui.Widget.LOCAL_TEXTURE);
            crystalView.scale = 0.5;

            var nextSkillIndex = mc.HeroStock.getSkillUpgradeOf(skillInfo);
            if( nextSkillIndex){
                if(  nextSkillIndex != -1 ){
                    var requireSphere = mc.HeroStock.getSkillUpgradePointOfHero(mc.dictionary.getSkillByIndex(nextSkillIndex));
                    var lbl = bb.framework.getGUIFactory().createText(""+bb.utility.formatNumber(numSphere));
                    if( numSphere >= requireSphere ){
                        lbl.setColor(mc.color.GREEN);
                    }
                    else{
                        lbl.setColor(mc.color.RED);
                        this._btnUpgrade.setGrayForAll(true);
                    }
                    lbl.setDecoratorLabel("/"+bb.utility.formatNumber(requireSphere),mc.color.WHITE_NORMAL);

                    var assetUpgrade = this._assetUpgrade = bb.layout.linear([lbl,crystalView],requireSphere >= 100 ? 65 : 40);
                    assetUpgrade.x = this._root.width*0.525;
                    assetUpgrade.y = this._btnUpgrade.y - this._btnUpgrade.height*0.5 - 20;
                    lbl.y = assetUpgrade.height*0.55;
                    this._root.addChild(assetUpgrade);

                    this._btnUpgrade.registerTouchEvent(function(){
                        var loadingDialog = mc.view_utility.showLoadingDialog();
                        mc.protocol.upgradeSkill(this._heroId,skillInfo.index,function(result){
                            mc.view_utility.hideLoadingDialogById(loadingDialog);
                            if( result ){
                                mc.view_utility.showSuggestText(mc.dictionary.getGUIString("txtUpgradeSkillSuccessful"));
                                this._skillIndex = result.skillIndex;
                                this._loadSkillInfo();
                                mc.view_utility.showLevelUpText(nodeAvt.getChildren()[0],3);
                                this._upgradeCb && this._upgradeCb();
                            }
                        }.bind(this));
                    }.bind(this));
                }
                else{
                    if( !this._isLeaderSkill() ){
                        this._btnUpgrade.setVisible(false);
                        if( this._canUpgradable() ){
                            var lblMax = bb.framework.getGUIFactory().createText(mc.dictionary.getGUIString("txtSkillMaxLevel"));
                            lblMax.setColor(mc.color.RED);
                            lblMax.x = this._btnUpgrade.x;
                            lblMax.y = this._btnUpgrade.y;
                            this._root.addChild(lblMax);
                        }
                    }
                }
            }
        }
        else{
            var nodeAvt = this._nodeAvt ;
            var lblName = this._lblName ;
            var lblType = this._lblType ;
            var lblInfo = this._lblInfo ;
            var skillInfo = mc.dictionary.getSkillByIndex(this._skillIndex);
            var isLeader = mc.HeroStock.getSkillTypeOfHero(skillInfo) === mc.const.SKILL_TYPE_LEADER;
            var skillWidget = mc.view_utility.createSkillInfoIcon(skillInfo);
            nodeAvt.addChild(skillWidget);
            nodeAvt.width = skillWidget.width;
            nodeAvt.height = skillWidget.height;

            lblName.setString(mc.HeroStock.getSkillNameOfHero(skillInfo));
            lblType.setColor(isLeader ? mc.color.YELLOW : mc.color.BLUE);
            var skillType = mc.HeroStock.getSkillTypeOfHero(skillInfo);
            if( skillType === mc.const.SKILL_TYPE_LEADER ){
                lblType.setString(mc.dictionary.getGUIString("lblLeaderSkill"));
            }
            else if( skillType === mc.const.SKILL_TYPE_ACTIVE ){
                lblType.setString(mc.dictionary.getGUIString("lblActiveSkill"));
            }
            else if( skillType === mc.const.SKILL_TYPE_PASSIVE ){
                lblType.setString(mc.dictionary.getGUIString("lblPassiveSkill"));
            }
            else if( skillType === mc.const.SKILL_TYPE_AUTO_CAST ){
                lblType.setString(mc.dictionary.getGUIString("lblAutoCastSkill"));
            }

            lblInfo.getVirtualRenderer().setBoundingWidth(this._root.width*0.95);
            lblInfo.getVirtualRenderer().setAlignment(cc.TEXT_ALIGNMENT_CENTER);
            lblInfo.setString(mc.HeroStock.getSkillDescriptionOfHero(skillInfo));
        }
    },

    setShowPosition:function(widget){
        var pos = widget.getParent().convertToWorldSpace(cc.p(widget.x,widget.y));
        if( pos.x - this._root.width*0.5 <= 0 ){
            pos.x = 5 + this._root.width*0.5;
        }
        if( pos.x + this._root.width*0.5 >= cc.winSize.width ){
            pos.x = cc.winSize.width - this._root.width*0.5 - 5;
        }
        this._root.x = pos.x;
        this._root.y = pos.y + 25;
        this._root.anchorY = 0;
        return this;
    },

    overrideShowAnimation: function () {
        this.opacity = 0;
        this.runAction(cc.fadeIn(0.3));
        return 0.15;
    },

    overrideCloseAnimation: function () {
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.15;
    }
});