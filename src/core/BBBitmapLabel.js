/**
 * Created by long.nguyen on 6/7/2017.
 */
bb.BitmapLabel = cc.Node.extend({
    _url: null,
    _padding: 0,

    ctor: function (str, url, padding) {
        this._super();
        this._url = url;
        this.setPadding(padding);
        this.setString(str);
    },

    setPadding: function (padding) {
        this._padding = padding;
    },

    setString: function (str) {
        this.removeAllChildren();
        var folder = "#" + this._url + "/";
        var xLayout = 0;
        var w = 0;
        var h = 0;
        for (var i = 0; i < str.length; i++) {
            var name = str[i];
            if (name === '/') {
                name = "splash";
            }
            var spr = new cc.Sprite(folder + name + ".png");
            spr.x = xLayout + spr.width * 0.5;
            spr.y = spr.height * 0.5;
            spr.setName(str[i]);
            this.addChild(spr);

            w += spr.width + this._padding;
            h = Math.max(h, spr.height);

            xLayout += spr.width + this._padding;
        }

        this.width = w - this._padding;
        this.height = h;
        this.anchorX = 0.5;
        this.anchorY = 0.5;
    },

    getChildByIndex: function (index) {
        return this.getChildren()[index];
    }

});