const COLOR_V =`#version 300 es
precision highp float;

in vec3 a_position;
in float a_ID;
in vec3 a_vertexNormal;
in vec3 a_faceNormal;
in float a_metallic;
in float a_roughness;

out vec3 v_worldPosition;
out vec3 v_shadowMapPosition;
out vec3 v_cameraPosition;
flat out float v_ID;
out vec3 v_normal;
out vec3 v_cameraNormal;
out vec3 v_faceNormal;
out float v_shade;
out float v_metallic;
out float v_roughness;

uniform float u_FOV;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_shadowMatrix;
uniform vec3 u_cam;
uniform vec3 u_sun;
uniform float u_time;

const float NEAR = 1.;
const float INV_DEPTH_RANGE = 1. / (5000. - NEAR);

float map(float a, float b, float c, float d, float e) {
    return d + (a - b) / (c - b) * (e - d);
}

void main() {
    vec4 vPos = vec4(a_position, 1);
    vec3 vert = vPos.xyz - u_cam;
    if(dot(vert, a_faceNormal) > 0.) { return; }
    v_shadowMapPosition = (u_shadowMatrix * vPos).xyz;
    v_shadowMapPosition.xy = v_shadowMapPosition.xy * 2. / 600. / 0.02 / 2. + vec2(0.5);
    v_shadowMapPosition.z = v_shadowMapPosition.z;
    v_cameraPosition = (u_viewMatrix * vPos).xyz;
    vert = (u_projectionMatrix * u_viewMatrix * vPos).xyz;
    v_worldPosition = vPos.xyz;
    v_ID = a_ID;
    v_normal = normalize(a_vertexNormal);
    v_metallic = a_metallic;
    v_roughness = max(a_roughness, 0.01);
    v_cameraNormal = (u_viewMatrix * vec4(v_normal, 0)).xyz; // 0 w negates translation
    v_faceNormal = normalize(a_faceNormal);
    gl_Position = vec4(vert.xy, (vert.z - NEAR) * INV_DEPTH_RANGE, vert.z * u_FOV);
}`;
const COLOR_F = `#version 300 es
precision highp float;

#define SSAO_RADIUS 0.8
#define SSAO_BIAS 0.02
#define SSAO_RANGE 1.
#define PI 3.14159265358979323
#define SSAO_SAMPLES 20

#define SHADOW_BIAS 0.1

in vec3 v_worldPosition;
in vec3 v_shadowMapPosition;
in vec3 v_cameraPosition;
flat in float v_ID;
in vec3 v_normal;
in vec3 v_cameraNormal;
in vec3 v_faceNormal;
in float v_shade;
in float v_metallic;
in float v_roughness;

uniform sampler2D u_prepass;
uniform sampler2D u_shadowMap;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform vec3 u_cam;
uniform vec3 u_sun;
uniform vec2 u_res;
uniform vec4 u_ambient;
uniform float u_FOV;
uniform vec3 u_albedo;
uniform vec3[SSAO_SAMPLES] u_ssaoSamples;
uniform uint u_randomSeed;

#define M1 1597334677U
#define M2 3812015801U
float hash(uvec2 q) {
    q.y += u_randomSeed;
    q *= uvec2(M1, M2);
    uint n = (q.x ^ q.y) * M1;
    return float(n) * (1.0/float(0xffffffffU));
}

float map(float a, float b, float c, float d, float e) {
    return d + (a - b) / (c - b) * (e - d);
}

// schlick
vec3 calculateFresnel(float incidence, vec3 specularity) {
    return specularity + (1. - specularity) * pow(max(1. - incidence, 0.), 5.);
}
vec3 calculatFresnelWithRoughness(float incidence, vec3 specularity, float roughness) {
    return specularity + (max(vec3(1. - roughness), specularity) - specularity) * pow(clamp(1. - incidence, 0., 1.), 5.);
}

// trowbridge-reitz
float calculateDistribution(vec3 surfaceNormal, vec3 microfacetNormal, float roughness) {
    float a = roughness * roughness;
    a *= a;
    float alignment = max(dot(surfaceNormal, microfacetNormal), 0.);
    float mathStuff = alignment * alignment * (a - 1.) + 1.;
    return a / (PI * mathStuff * mathStuff);
}

// schlick-ggx+smith
float calculateGeometry(vec3 surfaceNormal, vec3 reflection, vec3 incident, float roughness) {
    float reflectionAngle = max(dot(surfaceNormal, reflection), 0.);
    float incidentAngle = max(dot(surfaceNormal, incident), 0.);
    roughness += 1.;
    float k = (roughness * roughness) / 8.0;
    return reflectionAngle / (reflectionAngle * (1. - k) + k) * incidentAngle / (incidentAngle * (1. - k) + k);
}

out vec4 final;

void main() {
    vec3 surfaceNormal = normalize(v_normal);
    float shade = clamp(dot(surfaceNormal, -u_sun), 0., 1.);
    if(shade > 0.) {
        float shadow = 0.;
        float iterations = 0.;
        float zInv = 0.3 / (v_cameraPosition.z * u_FOV);
        int inc = max(17 - int(zInv), 0);
        for(int i = -2; i <= 2; i += 1) {
            for(int j = -2; j <= 2; j += 1) {
                final = texture(u_shadowMap, v_shadowMapPosition.xy + vec2(i, j) * 0.003);
                if(final.g == 1. && final.r < v_shadowMapPosition.z - SHADOW_BIAS) { shadow += 0.; }
                else { shadow += 1.; }
                iterations += 1.;
                j += inc;
            }
            i += inc;
        }
        shade *= shadow / iterations;
    }

    vec3 tangent = normalize(u_ssaoSamples[0] - surfaceNormal * dot(u_ssaoSamples[0], surfaceNormal));
    vec3 bitangent = cross(surfaceNormal, tangent);
    mat3 tangentToWorld = mat3(tangent, bitangent, surfaceNormal);
    float ambientOcclusion = 0.;
    float iterations = 0.;
    for(int i = 0; i < SSAO_SAMPLES; i += 1) {
        float randomAngle = hash(uvec2(gl_FragCoord.xy));
        float c = cos(randomAngle);
        float s = sin(randomAngle);
        vec3 rotatedSample = u_ssaoSamples[i];
        rotatedSample = vec3(c * rotatedSample.x - s * rotatedSample.y, s * rotatedSample.x + c * rotatedSample.y, rotatedSample.z);
        vec4 cameraSample = u_viewMatrix * vec4(v_worldPosition + tangentToWorld * rotatedSample, 1);
        vec4 projectedSample = u_projectionMatrix * cameraSample;
        vec4 value = texture(u_prepass, (projectedSample.xy / (projectedSample.z * u_FOV)) * 0.5 + vec2(0.5));
        if(value.z > cameraSample.z - SSAO_BIAS || value.z < cameraSample.z - SSAO_RANGE || value.a != 1.) { ambientOcclusion += 1.; }
        iterations += 1.;
    }
    ambientOcclusion /= iterations;

    vec3 pointToCamera = normalize(u_cam - v_worldPosition);
    vec3 microfacetNormal = normalize(pointToCamera - u_sun); // normal that makes incident and reflection have the same angle
    vec3 albedo = vec3(hash(uvec2(v_ID, 0)), hash(uvec2(v_ID, 1)), hash(uvec2(v_ID, 2)));
    vec3 fresnel = calculateFresnel(max(dot(microfacetNormal, pointToCamera), 0.), mix(vec3(0.04), albedo, v_metallic));
    final = vec4((((vec3(1) - fresnel) * (1. - v_metallic) * albedo / PI + calculateDistribution(surfaceNormal, microfacetNormal, v_roughness) * fresnel * calculateGeometry(surfaceNormal, pointToCamera, -u_sun, v_roughness) / max(4. * max(dot(surfaceNormal, pointToCamera), 0.) * max(dot(surfaceNormal, -u_sun), 0.), 0.001)) * shade) + (albedo * 0.5 + vec3(1. - 0.5)) * u_ambient.rgb * u_ambient.w * ambientOcclusion, 1);
    final.rgb = pow(final.rgb / (final.rgb + vec3(1)), vec3(1. / 2.2));
}`;