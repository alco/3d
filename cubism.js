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

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uProjMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");

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

    gl.clearColor(0, 0, 0, 1);

    return gl;
}

function initBuffers(gl) {
    var triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    var vertices = [
         0.0,  1.0,  0.0,
        -1.0, -1.0,  0.0,
         1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    var squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    return [triangleVertexPositionBuffer, squareVertexPositionBuffer];
}

function setMatrixUniforms(gl, program, projMat, mvMat) {
    gl.uniformMatrix4fv(program.pMatrixUniform, false, projMat);
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, mvMat);
}


function drawScene(gl, program, projMat, mvMat, buffers) {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, projMat);

    mat4.identity(mvMat);

    mat4.translate(mvMat, [-1.5, 0.0, -7.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[0]);
    gl.vertexAttribPointer(program.vertexPositionAttribute, buffers[0].itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(gl, program, projMat, mvMat);
    gl.drawArrays(gl.TRIANGLES, 0, buffers[0].numItems);

    mat4.translate(mvMat, [3.0, 0.0, 0.0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers[1]);
    gl.vertexAttribPointer(program.vertexPositionAttribute, buffers[1].itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms(gl, program, projMat, mvMat);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers[1].numItems);
}

function startGL() {
    var canvas = document.getElementById("canvas");
    var gl = initGL(canvas);
    var program = initShaders(gl, ["vshader", "fshader"]);
    var buffers = initBuffers(gl);

    var projMat = mat4.create();
    var mvMat = mat4.create();
    drawScene(gl, program, projMat, mvMat, buffers);

    return gl;
}
