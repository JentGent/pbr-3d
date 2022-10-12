
// Globals
var tris = [],
    vertices = [],
    indices = [];
var cam = v(0, 0, -4),
    yaw = 0, ryaw = 0,
    pitch = 0, rpitch = 0,
    FOV = 0.003;

// Mouse
let mouseIsPressed = false, mouseX = 0, mouseY = 0, pmouseX = 0, pmouseY = 0;
document.onmousedown = function(e) {
    mouseIsPressed = true;
}
document.onmouseup = function(e) {
    mouseIsPressed = false;
}
document.onmousemove = function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
}

// Keys
let keys = {};
document.onkeydown = function(e) {
    keys[e.key.toLowerCase()] = true;
}
document.onkeyup = function(e) {
    keys[e.key.toLowerCase()] = false;
}

// Insert geometry
const platformRadius = 4, platformHeight = -3;
tri(v(-platformRadius, platformHeight, platformRadius), v(platformRadius, platformHeight, platformRadius), v(platformRadius, platformHeight, -platformRadius), v(0, 1, 0), 0, 0, 0.5);
tri(v(-platformRadius, platformHeight, platformRadius), v(-platformRadius, platformHeight, -platformRadius), v(platformRadius, platformHeight, -platformRadius), v(0, 1, 0), 0, 0, 0.5);
let sphereID = 0;
for(let i = 0; i <= 1; i += (1. / 6.)) {
    for(let j = 0; j <= 1; j += (1. / 6.)) {
        sphereID += 1;
        ellipsoid((i - 0.5) * 5, (j - 0.5) * 5, 0, 1, 1, 1, sphereID, 4, i, j * (1 - 0.05) + 0.05);
    }
}
vertices.length = indices.length = 0;
for(var i = 0; i < tris.length; i += 1) {
    dispTri(tris[i], cam, false);
}

// Game Logic
function update(dt) {
    if(mouseIsPressed) {
        yaw += (mouseX - pmouseX) * 0.02 * dt;
        pitch += (mouseY - pmouseY) * 0.02 * dt;
        pitch = constrain(pitch, -Math.PI / 2, Math.PI / 2);
    }
    const spd = 0.05 * dt;
    if(keys.w) {
        cam.x -= Math.sin(-yaw) * spd;
        cam.z += Math.cos(-yaw) * spd;
    }
    if(keys.s) {
        cam.x += Math.sin(-yaw) * spd;
        cam.z -= Math.cos(-yaw) * spd;
    }
    if(keys.d) {
        cam.x += Math.cos(-yaw) * spd;
        cam.z += Math.sin(-yaw) * spd;
    }
    if(keys.a) {
        cam.x -= Math.cos(-yaw) * spd;
        cam.z -= Math.sin(-yaw) * spd;
    }
    if(keys[" "]) {
        cam.y += spd;
    }
    if(keys.shift) {
        cam.y -= spd;
    }
    pmouseX = mouseX;
    pmouseY = mouseY;
}
