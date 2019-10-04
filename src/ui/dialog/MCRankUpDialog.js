/**
 * Created by long.nguyen on 4/18/2018.
 */
mc.RankUpDialog = bb.Dialog.extend({

    ctor:function(currRank,nextRank){
        this._super();

        bb.sound.preloadEffect(res.sound_ui_lvlup_account);

        var node = ccs.load(res.widget_rank_up_dialog, "res/").node;
        this.addChild(node);

        var mapView = bb.utility.arrayToMap(node.getChildByName("root").getChildren(),function(child){
            return child.getName();
        });

        var rankPrior = mc.const.MAP_LEAGUE_BY_CODE[currRank].priority - mc.const.MAP_LEAGUE_BY_CODE[nextRank].priority;
        var code = (rankPrior < 0) ? ("up"+nextRank) : ("down"+nextRank);

        var lblCurrRank = mapView["lblCurrRank"];
        var lblNextRank = mapView["lblNextRank"];
        var lblNewRank = mapView["lblNewRank"];
        var btnOk = mapView["btnOk"];
        var nodeSpine = mapView["nodeSpine"];

        var spineAccLvlUp = sp.SkeletonAnimation.createWithJsonFile(res.spine_ui_account_lvl_up_json,res.spine_ui_account_lvl_up_atlas,1.0);
        spineAccLvlUp.setCompleteListener(function (trackEntry) {
            if (trackEntry.trackIndex === 0 ) {
                spineAccLvlUp.setAnimation(1,cc.formatStr("arenarank%s_idle",code),true);
            }
        }.bind(this));
        spineAccLvlUp.setSkin("rank");
        spineAccLvlUp.setAnimation(0,cc.formatStr("arenarank%s_appear",code),false);
        nodeSpine.addChild(spineAccLvlUp);

        lblNewRank.setString(mc.dictionary.getGUIString("lblNewRank"));
        lblCurrRank.setString(mc.const.MAP_LEAGUE_BY_CODE[currRank].name);
        lblNextRank.setString(mc.const.MAP_LEAGUE_BY_CODE[nextRank].name);
        btnOk.setString(mc.dictionary.getGUIString("lblOk"));
        lblNextRank.setColor(mc.color.GREEN_NORMAL);

        btnOk.registerTouchEvent(function(){
            this.close();
        }.bind(this));

        this.setTopMost(true);
    },

    overrideShowAnimation: function () {
        this.opacity = 0;
        this.runAction(cc.sequence([cc.fadeIn(0.3),cc.sound(res.sound_ui_lvlup_account)]));
        return 0.3;
    },

    overrideCloseAnimation: function () {
        this.runAction(cc.sequence([cc.fadeOut(0.3)]));
        return 0.3;
    }

});