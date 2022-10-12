
let THERE_WAS_AN_ERROR = false;
function error(t) {
    THERE_WAS_AN_ERROR = true;
    alert(t);
}
function id(i) { return document.getElementById(i); }

// Setup
const c = id("render");
const width = c.width, height = c.height;
const gl = c.getContext("webgl2");
if(!gl) { error("yo webgl2 doesn't work on your browser xd imagine lol noob"); }
const can = id("display");
const ctx = can.getContext("2d");

// Program
function shader(n, s, t) {
    var base = gl.createShader(t);
    gl.shaderSource(base, s);
    gl.compileShader(base);
    if(!gl.getShaderParameter(base, gl.COMPILE_STATUS)) { return error("error in \"" + n + "\" " + ((t === gl.FRAGMENT_SHADER) ? "fragment" : "vertex") + " shader: " + gl.getShaderInfoLog(base)); }
    return base;
}
function program(n, v, f) {
    var p = gl.createProgram();
    gl.attachShader(p, shader(n, v, gl.VERTEX_SHADER));
    gl.attachShader(p, shader(n, f, gl.FRAGMENT_SHADER));
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS)) { return error("error in \"" + n + "\" shader: " + gl.getProgramInfoLog(p)); }
    gl.validateProgram(p);
    if(!gl.getProgramParameter(p, gl.VALIDATE_STATUS)) { return error("error validating \"" + n + "\": " + gl.getProgramInfoLog(p)); }
    return p;
}

// Uniform
function uniform(p, n, t, v) {
    t = "uniform" + t;
    if(gl[t]) {
        try {
            gl.useProgram(p);
            if(t[7] === "M") { gl[t](gl.getUniformLocation(p, n), false, v); }
            else { gl[t](gl.getUniformLocation(p, n), v); }
        }
        catch(e) {
            error("error setting uniform \"" + n + "\": " + e)
        }
        return;
    }
    error("no uniform type \"" + t + "\"");
}

// Attribute
function attribute(p, n, s, t, no, j, o) {
    try {
        var l = gl.getAttribLocation(p, n);
        gl.vertexAttribPointer(l, s, t, no, j, o);
        gl.enableVertexAttribArray(l);
        return l;
    }
    catch(e) { return error("error setting attribute \"" + n + "\": " + e); }
};

// Buffer
function buffer(t, a, o) {
    var b = gl.createBuffer();
    gl.bindBuffer(t, b);
    gl.bufferData(t, a, o);
    return b;
}

// Texture
function texture(p, n, i, ws, wt, mf, Mf) {
    gl.activeTexture(gl.TEXTURE0 + i);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    uniform(p, n, "1iv", [i]);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, ws || gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wt || gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mf || gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, Mf || gl.NEAREST);
    return tex;
}

