const PREPASS_V = `#version 300 es
precision highp float;

in vec3 a_position;
in float a_ID;
in vec3 a_vertexNormal;
in vec3 a_faceNormal;

out vec3 v_worldPosition;
out vec3 v_cameraPosition;
out float v_ID;
out vec3 v_normal;
out float v_shade;

uniform float u_FOV;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform vec3 u_cam;
uniform vec3 u_sun;
uniform float u_time;

const float NEAR = 1.;
const float INV_DEPTH_RANGE = 1. / (5000. - NEAR);

void main() {
    vec4 vPos = vec4(a_position, 1);
    vec3 vert = vPos.xyz - u_cam;
    if(dot(vert, a_faceNormal) > 0.) { return; }
    v_cameraPosition = (u_viewMatrix * vPos).xyz;
    vert = (u_projectionMatrix * u_viewMatrix * vPos).xyz;
    v_worldPosition = vPos.xyz;
    v_ID = a_ID;
    v_normal = normalize(a_vertexNormal);
    v_shade = clamp(dot(v_normal, -u_sun), 0., 1.);
    gl_Position = vec4(vert.xy, (vert.z - NEAR) * INV_DEPTH_RANGE + 0.00001, vert.z * u_FOV);
}`;
const PREPASS_F = `#version 300 es
precision highp float;

in vec3 v_worldPosition;
in vec3 v_cameraPosition;
in float v_ID;
in vec3 v_normal;
in float v_shade;

uniform sampler2D u_shadowMap;
uniform vec3 u_cam;
uniform vec3 u_sun;
uniform vec2 u_res;
uniform vec4 u_ambient;

float map(float a, float b, float c, float d, float e) {
    return d + (a - b) / (c - b) * (e - d);
}

out vec4 final;

void main() {
    final = vec4(v_cameraPosition, 1);
}`;