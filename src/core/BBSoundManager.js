/**
 * Created by longnguyen on 10/18/2016.
 */
bb.SoundManager = cc.Class.extend({
    _enableEffect: false,
    _enableMusic: false,
    _currMusicURL: null,
    _currMusicLoop: false,

    ctor: function () {
        this._enableMusic = true;
        this._enableEffect = true;
    },

    enableEffect: function (isEnable) {
        this._enableEffect = isEnable;
        if (!this._enableEffect) {
            cc.audioEngine.stopAllEffects();
        }
    },

    enableMusic: function (isEnable) {
        this._enableMusic = isEnable;
        if (!this._enableMusic) {
            cc.audioEngine.stopMusic();
        } else {
            this.playMusic(this._currMusicURL, this._currMusicLoop);
        }
    },

    stopMusic: function (url) {
        if (this._enableMusic) {
            cc.audioEngine.stopMusic(url || this._currMusicURL);
            this._currMusicURL = null;
        }
    },

    pauseMusic: function (url) {
        if (this._enableMusic) {
            cc.audioEngine.pauseMusic();
        }
    },

    resumeMusic: function () {
        if (this._enableMusic) {
            cc.audioEngine.resumeMusic();
        }
    },

    playEffect: function (url, loop) {
        if (this._enableEffect) {
            return cc.audioEngine.playEffect(url, loop);
        }
    },

    stopEffect: function (effectId) {
        if (effectId) {
            cc.audioEngine.stopEffect(effectId);
        }
    },
    stopAllEffect: function () {
        cc.audioEngine.stopAllEffects && cc.audioEngine.stopAllEffects();
    },

    isMusicPlaying: function () {
        return cc.audioEngine.isMusicPlaying();
    },

    playMusic: function (url, loop) {
        if (this._enableMusic) {
            if (this._currMusicURL != url) {
                this._currMusicURL = url;
                this._currMusicLoop = loop != undefined ? loop : true;
                cc.audioEngine.playMusic(url, this._currMusicLoop);
            }
        }
    },

    preloadEffect: function (url) {
        if (cc.sys.isNative) {
            mc.log("preload: " + url);
            cc.audioEngine.preloadEffect(url);
        }
    },

    unloadEffect: function (url) {
        if (cc.sys.isNative) {
            cc.audioEngine.unloadEffect(url);
        }
    },

    getEffectsVolume: function () {
        return Math.floor(cc.audioEngine.getEffectsVolume() * 100);
    },

    getMusicVolume: function () {
        return Math.floor(cc.audioEngine.getMusicVolume() * 100);
    },

    setEffectsVolume: function (volume) {
        this._enableEffect = volume > 0;
        cc.audioEngine.setEffectsVolume(volume / 100);
    },

    setMusicVolume: function (volume) {
        this._enableMusic = volume > 0;
        cc.audioEngine.setMusicVolume(volume / 100);
    }

});
bb.sound = new bb.SoundManager();