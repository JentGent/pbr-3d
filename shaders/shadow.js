const SHADOW_V = `#version 300 es
precision highp float;

in vec3 a_position;
in float a_ID;
in vec3 a_vertexNormal;
in vec3 a_faceNormal;

out float v_z;

uniform mat4 u_projectionMatrix;
uniform mat4 u_shadowMatrix;
uniform vec3 u_sun;

const float NEAR = 1.;
const float INV_DEPTH_RANGE = 1. / (5000. - NEAR);

float map(float a, float b, float c, float d, float e) {
    return d + (a - b) / (c - b) * (e - d);
}

void main() {
    vec4 vPos = vec4(a_position, 1);
    vec4 vert4 = u_shadowMatrix * vPos;
    v_z = vert4.z;
    vec3 vert = (u_projectionMatrix * vert4).xyz;
    gl_Position = vec4(vert.xy, (vert.z - NEAR) * INV_DEPTH_RANGE, 0.02);
}`;
const SHADOW_F = `#version 300 es
precision highp float;

in float v_z;

out vec4 final;

void main() {
    final = vec4(v_z, 1, 0, 1);
}`;