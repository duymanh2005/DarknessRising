/**
 * Created by long.nguyen on 5/23/2017.
 */
bb.layout = {};
bb.layout.linear = function (arr, padding, dir, center) {
    padding = padding || 0;
    dir = dir || 1;

    var layout = new ccui.Layout();
    layout.setCascadeOpacityEnabled(true);
    layout.anchorX = 0.5;
    layout.anchorY = 0.5;
    var xLayout = padding;
    var yLayout = 0;
    var max = 0;
    if (dir === bb.layout.LINEAR_VERTICAL) {
        xLayout = 0;
        yLayout = padding;
    }
    for (var i = 0; i < arr.length; i++) {
        var view = arr[i];
        if (view) {
            if (cc.isNumber(view)) {
                if (dir === bb.layout.LINEAR_HORIZONTAL) {
                    xLayout += view + padding;
                }
                if (dir === bb.layout.LINEAR_VERTICAL) {
                    yLayout += view + padding;
                }
            } else {
                var vw = view.width * view.scaleX;
                var vh = view.height * view.scaleY;
                view.x = xLayout + view.anchorX * vw;
                view.y = yLayout + view.anchorY * vh;
                view.removeFromParent();
                layout.addChild(view);
                if (dir === bb.layout.LINEAR_HORIZONTAL) {
                    xLayout += vw + padding;
                    max = Math.max(vh, max);
                }
                if (dir === bb.layout.LINEAR_VERTICAL) {
                    yLayout += vh + padding;
                    max = Math.max(vw, max);
                }
            }
        }
    }
    if (dir === bb.layout.LINEAR_HORIZONTAL) {
        layout.width = xLayout;
        layout.height = max;
        if (center) {
            for (var i = 0; i < arr.length; i++) {
                arr[i].y = layout.height * 0.5;
            }
        }
    }
    if (dir === bb.layout.LINEAR_VERTICAL) {
        layout.width = max;
        layout.height = yLayout;
        if (center) {
            for (var i = 0; i < arr.length; i++) {
                arr[i].x = layout.width * 0.5;
            }
        }
    }
    return layout;
};

bb.layout.grid = function (arrView, numCol, width, paddingH, container) {
    numCol = numCol || 5;
    var numRow = Math.ceil(arrView.length / numCol);
    var layout = container || new ccui.Layout();
    layout.setCascadeOpacityEnabled(true);
    layout.anchorX = 0.5;
    layout.anchorY = 0.5;
    var maxW = arrView[0].width;
    var maxH = arrView[0].height;
    for (var i = 0; i < arrView.length; i++) {
        var view = arrView[i];
        if (view) {
            maxW = Math.max(maxW, view.width);
            maxH = Math.max(maxH, view.height);
        }
    }
    var paddingW = (width - (numCol * maxW)) / (numCol + 1);
    paddingH = paddingH || 5;
    var height = numRow * maxH + paddingH * 2 + (numRow - 1) * paddingH;
    for (var i = 0; i < arrView.length; i++) {
        var view = arrView[i];
        if (view) {
            var col = i % numCol;
            var row = Math.floor(i / numCol);
            view.x = (col + 1) * paddingW + col * maxW + (view.width * view.anchorX);
            view.y = height - (row + 1) * paddingH - (row + 1) * maxH + (view.height * view.anchorY);
            if (view.getParent()) {
                if (view.getParent() != container) {
                    view.retain();
                    view.removeFromParent();
                    layout.addChild(view);
                    view.release();
                }
            } else {
                layout.addChild(view);
            }
        }
    }
    layout.width = width;
    layout.height = height;
    return layout;
};
bb.layout.LINEAR_HORIZONTAL = 1;
bb.layout.LINEAR_VERTICAL = 2;