
if(!gl.getExtension("EXT_color_buffer_float")) { error("\"render to floating point texture\" extension not available!"); }
if(!gl.getExtension("OES_texture_float_linear")) { error("\"linear filter floating point texture\" extension not available!"); }
var color = program("color", COLOR_V, COLOR_F);
var sky = program("sky", SKY_V, SKY_F);
var shadow = program("shadow", SHADOW_V, SHADOW_F);
var shadowFramebuffer = gl.createFramebuffer();
var shadowDepthBuffer = gl.createRenderbuffer();
var shadowWidth = 300, shadowHeight = 300;
var shadowTexture = texture(color, "u_shadowMap", 0, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR);
var prepass = program("prepass", PREPASS_V, PREPASS_F);
var prepassFramebuffer = gl.createFramebuffer();
var prepassDepthBuffer = gl.createRenderbuffer();
var prepassTexture = texture(color, "u_prepass", 1, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);

uniform(sky, "u_res", "2fv", [width, height]);
uniform(color, "u_res", "2fv", [width, height]);
// uniform(color, "u_ambient", "4fv", [0.1, 0.5, 1, 0.1]);
uniform(color, "u_ambient", "4fv", [0.5, 0.8, 1, 0.05]);
uniform(color, "u_randomSeed", "1ui", (Math.random() * 100) | 0);

// SSAO samples
const samples = [];
for(let i = 0; i < 20; i += 1) {
    let x = Math.random() * 2 - 1, y = Math.random() * 2 - 1, z = Math.random();
    while(x * x + y * y + z * z > 1) {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random();
    }
    const r = Math.random() * 0.5; // bias towards origin
    samples.push(x * r, y * r, z * r);
}
uniform(color, "u_ssaoSamples", "3fv", samples);

var bpe = Float32Array.BYTES_PER_ELEMENT;
var vao = gl.createVertexArray();
gl.bindVertexArray(vao);
buffer(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
buffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
attribute(shadow, "a_position", 3, gl.FLOAT, false, 12 * bpe, 0);
// attribute(shadow, "a_ID", 1, gl.INT, false, 12 * bpe, 3 * bpe);
// attribute(shadow, "a_vertexNormal", 3, gl.FLOAT, false, 12 * bpe, 4 * bpe);
// attribute(shadow, "a_faceNormal", 3, gl.FLOAT, false, 12 * bpe, 7 * bpe);
attribute(prepass, "a_position", 3, gl.FLOAT, false, 12 * bpe, 0);
attribute(prepass, "a_ID", 1, gl.FLOAT, false, 12 * bpe, 3 * bpe);
attribute(prepass, "a_vertexNormal", 3, gl.FLOAT, false, 12 * bpe, 4 * bpe);
attribute(prepass, "a_faceNormal", 3, gl.FLOAT, false, 12 * bpe, 7 * bpe);
attribute(color, "a_position", 3, gl.FLOAT, false, 12 * bpe, 0);
attribute(color, "a_ID", 1, gl.FLOAT, false, 12 * bpe, 3 * bpe);
attribute(color, "a_vertexNormal", 3, gl.FLOAT, false, 12 * bpe, 4 * bpe);
attribute(color, "a_faceNormal", 3, gl.FLOAT, false, 12 * bpe, 7 * bpe);
attribute(color, "a_metallic", 1, gl.FLOAT, false, 12 * bpe, 10 * bpe);
attribute(color, "a_roughness", 1, gl.FLOAT, false, 12 * bpe, 11 * bpe);
gl.bindVertexArray(null);
