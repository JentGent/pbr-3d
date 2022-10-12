
let sun = v(0.57735026919, -0.57735026919, 0.57735026919);

function renderSky(time) {
    gl.useProgram(sky);
    gl.disable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    uniform(sky, "u_viewMatrix", "Matrix4fv", m4.xRot(m4.yRot(m4b.identity(), ryaw), rpitch));
    uniform(sky, "u_sun", "3fv", [sun.x, sun.y, sun.z]);
    uniform(sky, "u_res", "2fv", [width, height]);
    uniform(sky, "u_FOV", "1fv", [1]);
    buffer(gl.ARRAY_BUFFER, FULLSCREEN_VERTS, gl.STATIC_DRAW);
    attribute(sky, "a_position", 2, gl.FLOAT, false, 2 * bpe, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    ctx.drawImage(c, 0, 0, 600, 600);
}

function renderShadowMap(time, shadowMatrix) {
    gl.bindVertexArray(vao);

    gl.viewport(0, 0, shadowWidth, shadowHeight);
    gl.useProgram(shadow);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    uniform(shadow, "u_time", "1fv", [time]);
    uniform(shadow, "u_cam", "3fv", [cam.x, cam.y, cam.z]);
    uniform(shadow, "u_sun", "3fv", [sun.x, sun.y, sun.z]);
    uniform(shadow, "u_projectionMatrix", "Matrix4fv", [
        2 / width,          0, 0, 0,
                0, 2 / height, 0, 0,
                0,          0, 1, 0,
                0,          0, 0, 0,
    ]);
    uniform(shadow, "u_shadowMatrix", "Matrix4fv", shadowMatrix);
    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG32F, shadowWidth, shadowHeight, 0, gl.RG, gl.FLOAT, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, shadowTexture, 0);
    gl.bindRenderbuffer(gl.RENDERBUFFER, shadowDepthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, shadowWidth, shadowHeight);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, shadowDepthBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderPrepass(time, cameraMatrix) {
    gl.viewport(0, 0, width, height);
    gl.useProgram(prepass);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
    uniform(prepass, "u_time", "1fv", [time]);
    uniform(prepass, "u_cam", "3fv", [cam.x, cam.y, cam.z]);
    uniform(prepass, "u_sun", "3fv", [sun.x, sun.y, sun.z]);
    uniform(prepass, "u_FOV", "1fv", [FOV]);
    uniform(prepass, "u_projectionMatrix", "Matrix4fv", [
        2 / width,          0, 0, 0,
                0, 2 / height, 0, 0,
                0,          0, 1, 0,
                0,          0, 0, 0,
    ]);
    uniform(prepass, "u_viewMatrix", "Matrix4fv", cameraMatrix);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, prepassFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, prepassTexture, 0);
    gl.bindRenderbuffer(gl.RENDERBUFFER, prepassDepthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, prepassDepthBuffer);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    // ctx.drawImage(c, 0, 0, 600, 600);
}

function renderColor(time, cameraMatrix, shadowMatrix) {
    gl.viewport(0, 0, width, height);
    gl.useProgram(color);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);
    uniform(color, "u_time", "1fv", [time]);
    uniform(color, "u_cam", "3fv", [cam.x, cam.y, cam.z]);
    uniform(color, "u_sun", "3fv", [sun.x, sun.y, sun.z]);
    uniform(color, "u_FOV", "1fv", [FOV]);
    uniform(color, "u_projectionMatrix", "Matrix4fv", [
        2 / width,          0, 0, 0,
                0, 2 / height, 0, 0,
                0,          0, 1, 0,
                0,          0, 0, 0,
    ]);
    uniform(color, "u_viewMatrix", "Matrix4fv", cameraMatrix);
    uniform(color, "u_shadowMatrix", "Matrix4fv", shadowMatrix);
    uniform(color, "u_albedo", "3fv", [1, 0, 0]);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

const FULLSCREEN_VERTS = new Float32Array([
    -1, -1,
    1, -1,
    1, 1,
    -1, -1,
    -1, 1,
    1, 1,
]);
function draw(dt, time) {
    ryaw += (yaw - ryaw) * 0.3 * dt;
    rpitch += (pitch - rpitch) * 0.3 * dt;
    ctx.clearRect(0, 0, 600, 600);
    
    sun = yRotate(-0.4 * dt, sun);
    const right = sun.cross(v(0, -1, 0)), up = sun.cross(right);
    const cameraMatrix = m4.translate(m4.yRot(m4.xRot(m4b.identity(), -rpitch), -ryaw), -cam.x, -cam.y, -cam.z), shadowMatrix = m4.invert([right.x, right.y, right.z, 0, up.x, up.y, up.z, 0, sun.x, sun.y, sun.z, 0, -sun.x * 8, -sun.y * 8, -sun.z * 8, 1]);

    renderSky(time);
    renderShadowMap(time, shadowMatrix);
    renderPrepass(time, cameraMatrix);
    renderColor(time, cameraMatrix, shadowMatrix);
    
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindVertexArray(null);
}
