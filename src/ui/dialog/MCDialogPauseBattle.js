/**
 * Created by long.nguyen on 6/23/2017.
 */
mc.DialogPauseBattle = mc.DefaultDialog.extend({

    ctor:function(battleView,callback){
        this._super(mc.dictionary.getGUIString("Pause"));
        this._battleView = battleView;
        var contentView = ccs.load(res.widget_battle_pause,"res/").node.getChildByName("root");
        this.setContentView(contentView);

        var sliderSound = contentView.getChildByName("sliderSound");
        var sliderMusic = contentView.getChildByName("sliderMusic");
        var iconMusic = contentView.getChildByName("iconMusic");
        var iconSpeaker = contentView.getChildByName("iconSpeaker");
        var btnGiveUp = contentView.getChildByName("btnGiveUp");
        var btnResume = contentView.getChildByName("btnHome");

        btnResume.setString(mc.dictionary.getGUIString("lblResume"));
        btnGiveUp.setString(mc.dictionary.getGUIString("lblGiveUp"));

        var _submitFail = function(){
            callback && callback();
        }.bind(this);

        var self = this;
        if( callback ){
            btnGiveUp.registerTouchEvent(function(){
                _submitFail();
            });
        }
        else{
            btnGiveUp.setVisible(false);
            btnResume.x = contentView.width*0.5;
        }
        btnResume.registerTouchEvent(function(){
            self.close();
        });

        mc.view_utility.registerSoundAndMusicSlider(iconSpeaker,iconMusic,sliderSound,sliderMusic);
    },

    onEnter:function(){
        this._super();
        this._battleView.pauseAll();
    },

    onExit:function(){
        this._super();
        this._battleView.resumeAll();
        if( mc.storage.isChange ){
            mc.storage.isChange = false;
            mc.storage.saveSetting();
        }
    }

});