/**
 * Created by long.nguyen on 5/7/2018.
 */
mc.TestSpineScreen = mc.Screen.extend({

    initResources:function(){
        var spineView = mc.BattleViewFactory.createCreatureGUIByIndex(350);
        this.scheduleOnce(function(){
           spineView.attack("skillAuto");
        });
        this.addChild(spineView);

    }

});