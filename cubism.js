function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(shader));
        return;
    }

    return shader;
}

function initShaders(gl, ids) {
    var shaders = [];
    for (var i = 0; i < ids.length; ++i) {
        shaders.push(getShader(gl, ids[i]));
    }

    var shaderProgram = gl.createProgram();
    for (var i = 0; i < shaders.length; i++) {
        gl.attachShader(shaderProgram, shaders[i]);
    };
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
        return;
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.colorAttribute = gl.getAttribLocation(shaderProgram, "aColor");
    gl.enableVertexAttribArray(shaderProgram.colorAttribute);
    shaderProgram.normalAttribute = gl.getAttribLocation(shaderProgram, "aNormal");
    gl.enableVertexAttribArray(shaderProgram.normalAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uProjMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
    shaderProgram.normMatrixUniform = gl.getUniformLocation(shaderProgram, "uNormalMatrix");

    return shaderProgram;
}

function initGL(canvas) {
    var gl;
    var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for (var i = 0; i < names.length; ++i) {
        try {
            gl = canvas.getContext(names[i]);
            gl.viewportWidth = canvas.width;
            gl.viewportHeight = canvas.height;
        } catch (e) {}
        if (gl)
            break;
    }

    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
        return;
    }

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return gl;
}

//
// makeBox
//
// Create a box with vertices, normals and texCoords. Create VBOs for each as well as the index array.
// Return an object with the following properties:
//
//  normalObject        WebGLBuffer object for normals
//  texCoordObject      WebGLBuffer object for texCoords
//  vertexObject        WebGLBuffer object for vertices
//  indexObject         WebGLBuffer object for indices
//  numIndices          The number of indices in the indexObject
//
function makeBox(ctx) {
    // box
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    //
    // vertex coords array
    var vertices = new Float32Array(
        [  1, 1, 1,  -1, 1, 1,  -1,-1, 1,   1,-1, 1,    // v0-v1-v2-v3 front
           1, 1, 1,   1,-1, 1,   1,-1,-1,   1, 1,-1,    // v0-v3-v4-v5 right
           1, 1, 1,   1, 1,-1,  -1, 1,-1,  -1, 1, 1,    // v0-v5-v6-v1 top
          -1, 1, 1,  -1, 1,-1,  -1,-1,-1,  -1,-1, 1,    // v1-v6-v7-v2 left
          -1,-1,-1,   1,-1,-1,   1,-1, 1,  -1,-1, 1,    // v7-v4-v3-v2 bottom
           1,-1,-1,  -1,-1,-1,  -1, 1,-1,   1, 1,-1 ]   // v4-v7-v6-v5 back
    );

    // normal array
    var normals = new Float32Array(
        [  0, 0, 1,   0, 0, 1,   0, 0, 1,   0, 0, 1,     // v0-v1-v2-v3 front
           1, 0, 0,   1, 0, 0,   1, 0, 0,   1, 0, 0,     // v0-v3-v4-v5 right
           0, 1, 0,   0, 1, 0,   0, 1, 0,   0, 1, 0,     // v0-v5-v6-v1 top
          -1, 0, 0,  -1, 0, 0,  -1, 0, 0,  -1, 0, 0,     // v1-v6-v7-v2 left
           0,-1, 0,   0,-1, 0,   0,-1, 0,   0,-1, 0,     // v7-v4-v3-v2 bottom
           0, 0,-1,   0, 0,-1,   0, 0,-1,   0, 0,-1 ]    // v4-v7-v6-v5 back
       );


    // texCoord array
    var colors = new Float32Array(
        [  1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,    // v0-v1-v2-v3 front
           0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,   0, 1, 0, 1,    // v0-v3-v4-v5 right
           0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,    // v0-v5-v6-v1 top
           1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,    // v1-v6-v7-v2 left
           1, .5, 0, 1,   1, .5, 0, 1,   1, .5, 0, 1,   1, .5, 0, 1,    // v7-v4-v3-v2 bottom
           1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1 ]   // v4-v7-v6-v5 back
       );

    // index array
    var indices = new Uint8Array(
        [  0, 1, 2,   0, 2, 3,    // front
           4, 5, 6,   4, 6, 7,    // right
           8, 9,10,   8,10,11,    // top
          12,13,14,  12,14,15,    // left
          16,17,18,  16,18,19,    // bottom
          20,21,22,  20,22,23 ]   // back
      );

    var retval = { };

    retval.normalObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.normalObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, normals, ctx.STATIC_DRAW);

    retval.colorObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.colorObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, colors, ctx.STATIC_DRAW);

    retval.vertexObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexObject);
    ctx.bufferData(ctx.ARRAY_BUFFER, vertices, ctx.STATIC_DRAW);

    retval.indexObject = ctx.createBuffer();
    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, retval.indexObject);
    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, indices, ctx.STATIC_DRAW);

    retval.numIndices = indices.length;

    return retval;
}

function setMatrixUniforms(gl, program, projMat, mvMat) {
    gl.uniformMatrix4fv(program.pMatrixUniform, false, projMat);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMat);

    normMat = mat4.create();
    mat4.inverse(mvMat, normMat);
    mat4.transpose(normMat);
    gl.uniformMatrix4fv(program.normMatrixUniform, false, normMat);
}

var interval;
var angle = 45;
var yangle = 0;
var zangle = 0;
var angleT = 1;
var yangleT = 1;
var zangleT = 1;

function startGL() {
    var canvas = document.getElementById("canvas");
    var gl = initGL(canvas);
    var program = initShaders(gl, ["vshader", "fshader"]);

    // Set some uniform variables for the shaders
    gl.uniform3f(gl.getUniformLocation(program, "lightDir"), 0, 0, 1);

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clearColor(0, 0, 0, 1);

    var projMat = mat4.create();
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, projMat);
    //mat4.ortho(-5, 5, -5, 5, -10, 10, projMat);

    var mvMat = mat4.create();
    mat4.identity(mvMat);
    mat4.translate(mvMat, [0, 0.0, -7.0]);

    var buf = makeBox(gl);

    // Set up all the vertex attributes for vertices, normals and texCoords
    gl.bindBuffer(gl.ARRAY_BUFFER, buf.vertexObject);
    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buf.normalObject);
    gl.vertexAttribPointer(program.normalAttribute, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buf.colorObject);
    gl.vertexAttribPointer(program.colorAttribute, 4, gl.FLOAT, false, 0, 0);

    // Bind the index array
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf.indexObject);

    interval = setInterval(function() {
        //angle += .01;
        mat4.identity(mvMat);
        mat4.translate(mvMat, [0, 0, -7]);
        mat4.rotateX(mvMat, (35.264) * Math.PI / 180);
        mat4.rotateY(mvMat, angle * Math.PI / 180);
        mat4.rotateX(mvMat, zangle * Math.PI / 180);
        mat4.rotateZ(mvMat, yangle * Math.PI / 180);

        drawBuffer(gl, program, projMat, mvMat, buf.numIndices);

        if (angleT < 1) {
            angle = lerp1(angleFrom, angleTo, cube1(0, 0, 1, 1, angleT));
            angleT += .1;
        }

        if (yangleT < 1) {
            yangle = lerp1(yangleFrom, yangleTo, cube1(0, 0, 1, 1, yangleT));
            yangleT += .1;
        }

        if (zangleT < 1) {
            zangle = lerp1(zangleFrom, zangleTo, cube1(0, 0, 1, 1, zangleT));
            zangleT += .1;
        }
    }, 32);

    return gl;
}

function stop() {
    clearInterval(interval);
}


function drawBuffer(gl, program, projMat, mvMat, numIndices) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    //gl.vertexAttribPointer(program.vertexPositionAttribute, buffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(gl, program, projMat, mvMat);
    gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_BYTE, 0);
}


$('#rot-right').click(function() {
    angleFrom = angle;
    angleTo = angle + 90;
    angleT = 0;
});

$('#rot-left').click(function() {
    angleFrom = angle;
    angleTo = angle - 90;
    angleT = 0;
});

$('#rot-fwd').click(function() {
    yangleFrom = yangle;
    yangleTo = yangle - 90;
    yangleT = 0;
});

$('#rot-bkw').click(function() {
    yangleFrom = yangle;
    yangleTo = yangle + 90;
    yangleT = 0;
});

$('#rot-roll-left').click(function() {
    zangleFrom = zangle;
    zangleTo = zangle - 90;
    zangleT = 0;
});

$('#rot-roll-right').click(function() {
    zangleFrom = zangle;
    zangleTo = zangle + 90;
    zangleT = 0;
});
