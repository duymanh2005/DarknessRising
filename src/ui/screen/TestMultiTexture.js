/**
 * Created by longnguyen on 8/1/2017.
 */
cc.GLNode = cc.GLNode || cc.Node.extend({
    ctor: function () {
        this._super();
        this.init();
    },
    init: function () {
        this._renderCmd._needDraw = true;
        this._renderCmd._matrix = new cc.math.Matrix4();
        this._renderCmd._matrix.identity();
        this._renderCmd.rendering = function (ctx) {
            var wt = this._worldTransform;
            this._matrix.mat[0] = wt.a;
            this._matrix.mat[4] = wt.c;
            this._matrix.mat[12] = wt.tx;
            this._matrix.mat[1] = wt.b;
            this._matrix.mat[5] = wt.d;
            this._matrix.mat[13] = wt.ty;

            cc.kmGLMatrixMode(cc.KM_GL_MODELVIEW);
            cc.kmGLPushMatrix();
            cc.kmGLLoadMatrix(this._matrix);

            this._node.draw(ctx);

            cc.kmGLPopMatrix();
        };
    },
    draw: function (ctx) {
        this._super(ctx);
    }
});

var MultiTexturesLayer = bb.Screen.extend({

    ctor: function () {
        this._super();

        if ('opengl' in cc.sys.capabilities) {

            var node1 = new cc.Sprite(res.test_z1_png);
            var node2 = new cc.Sprite(res.test_z1_alpha_png);

            node1.x = 500;
            node2.x = 200;
            node1.y = node2.y = 400;

            var glnode = new cc.GLNode();
            glnode.width = 215;
            glnode.height = 240;
            glnode.anchorX = 0.5;
            glnode.anchorY = 0.5;
            glnode.scaleY = -1;
            this.glnode = glnode;

            this.addChild(node1);
            this.addChild(node2);

            var containerNode = new cc.Node();
            glnode.x = glnode.width*0.5;
            glnode.y = glnode.height*0.5;
            containerNode.addChild(glnode);
            var winSize = cc.director.getWinSize();
            containerNode.width = glnode.width;
            containerNode.height = glnode.height;
            containerNode.anchorX = 0.5;
            containerNode.anchorY = 0.5;
            containerNode.x = winSize.width - containerNode.width*0.5;
            containerNode.y = winSize.height - containerNode.height*0.5;
            this.addChild(containerNode);

            var MULTI_TEXTURES_FRAGMENT_SHADER =
                "precision lowp float;   \n"
                + "varying vec2 v_texCoord;  \n"
                + "uniform sampler2D tex0; \n"
                + "uniform sampler2D tex1; \n"
                + "void main() \n"
                + "{  \n"
                + "    vec4 color1 =  texture2D(tex0, v_texCoord);   \n"
                + "    vec4 color2 =  texture2D(tex1, v_texCoord);   \n"
                + "    gl_FragColor = vec4(color1.r*color2.r, color1.g*color2.g, color1.b*color2.b, color1.a*color2.a);   \n"
                + "}";

            var DEFAULT_VERTEX_SHADER =
                "attribute vec4 a_position; \n"
                + "attribute vec2 a_texCoord; \n"
                + "varying mediump vec2 v_texCoord; \n"
                + "void main() \n"
                + "{ \n"
                + "    gl_Position = (CC_PMatrix * CC_MVMatrix) * a_position;  \n"
                + "    v_texCoord = a_texCoord;               \n"
                + "}";

            this.shader = new cc.GLProgram();
            this.shader.initWithString(DEFAULT_VERTEX_SHADER, MULTI_TEXTURES_FRAGMENT_SHADER);
            if (!cc.sys.isNative) {
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_POSITION, cc.VERTEX_ATTRIB_POSITION);
                this.shader.addAttribute(cc.ATTRIBUTE_NAME_TEX_COORD, cc.VERTEX_ATTRIB_TEX_COORDS);
                //this.shader.addAttribute(cc.ATTRIBUTE_NAME_COLOR, cc.VERTEX_ATTRIB_COLOR);
            }
            this.shader.link();
            this.shader.updateUniforms();
            this.shader.retain();
            this.initGL();

            var p = this.shader.getProgram();
            this.tex1Location = gl.getUniformLocation(p, "tex0");
            this.tex2Location = gl.getUniformLocation(p, "tex1");

            glnode.draw = function () {
                this.shader.use();
                this.shader.setUniformsForBuiltins();

                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, this.tex1.getName());
                gl.uniform1i(this.tex1Location, 1);
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, this.tex2.getName());
                gl.uniform1i(this.tex2Location, 2);

                gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_POSITION);
                gl.enableVertexAttribArray(cc.VERTEX_ATTRIB_TEX_COORDS);

                // Draw fullscreen Square
                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
                gl.vertexAttribPointer(cc.VERTEX_ATTRIB_POSITION, 2, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexTextureBuffer);
                gl.vertexAttribPointer(cc.VERTEX_ATTRIB_TEX_COORDS, 2, gl.FLOAT, false, 0, 0);

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.activeTexture(gl.TEXTURE2);
                gl.bindTexture(gl.TEXTURE_2D, null);
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.activeTexture(gl.TEXTURE0); // cocos2d-x texture default.
            }.bind(this);

        }
    },

    onExit: function () {
        this._super();
        this.shader.release();
    },

    initGL: function () {
        var tex1 = cc.textureCache.getTextureForKey(res.test_z1_png);
        var tex2 = cc.textureCache.getTextureForKey(res.test_z1_alpha_png);
        this.tex1 = tex1;
        this.tex2 = tex2;

        //
        // Square
        //
        var squareVertexPositionBuffer = this.squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        var vertices = [
            215,  240,
            0,    240,
            215,  0,
            0,    0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        var squareVertexTextureBuffer = this.squareVertexTextureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexTextureBuffer);
        var texcoords = [
            1, 1,
            0, 1,
            1, 0,
            0, 0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
});