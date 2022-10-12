const SKY_V = `#version 300 es
precision highp float;

in vec2 a_position;

void main() {
    gl_Position = vec4(a_position.xy, 0, 1);
}`;
const SKY_F = `#version 300 es
#ifdef GL_ES
precision mediump float;
#endif

uniform float u_time;
uniform vec2 u_res;
uniform vec3 u_sun;
uniform vec3 u_cam;
uniform mat4 u_viewMatrix;
uniform float u_FOV;

float map(float v, float v1, float v2, float v3, float v4) {
    return v3 + (v - v1) / (v2 - v1) * (v4 - v3);
}

out vec4 final;

void main() {
    vec3 dir = vec3(map(gl_FragCoord.x, 0., u_res.x, -u_FOV, u_FOV), map(gl_FragCoord.y, 0., u_res.y, -u_FOV, u_FOV), 1.);
    dir = (u_viewMatrix * vec4(normalize(dir), 1)).xyz;
    
    final = vec4(0, map(clamp(dir.y, -0.3, 0.8), -0.3, 0.8, 0.8, 0.7), 1, 1);
    if(dot(dir, -u_sun) > 0.999) {
        final = vec4(1);
    }
}`;