function vec(x, y, z) {
    this.x = x || 0;
    this.y = !y && y !== 0 ? x : y;
    this.z = !z && z !== 0 ? x : z;
}
vec.prototype.ineg = function() {
    this.x *= -1;
    this.y *= -1;
    this.z *= -1;
    return this;
}
vec.prototype.neg = function() { return new vec(-this.x, -this.y, -this.z); }
vec.prototype.iadd = function(v2) {
    if(1 * v2 === v2) {
        this.x += v2;
        this.y += v2;
        this.z += v2;
        return;
    }
    this.x += v2.x;
    this.y += v2.y;
    this.z += v2.z;
    return this;
}
vec.prototype.add = function(v2) {
    if(1 * v2 === v2) {
        return new vec(this.x + v2, this.y + v2, this.z + v2);
    }
    return new vec(this.x + v2.x, this.y + v2.y, this.z + v2.z);
}
vec.prototype.isub = function(v2) {
    if(1 * v2 === v2) {
        this.x -= v2;
        this.y -= v2;
        this.z -= v2;
        return;
    }
    this.x -= v2.x;
    this.y -= v2.y;
    this.z -= v2.z;
    return this;
}
vec.prototype.sub = function(v2) {
    if(1 * v2 === v2) {
        return new vec(this.x - v2, this.y - v2, this.z - v2);
    }
    return new vec(this.x - v2.x, this.y - v2.y, this.z - v2.z);
}
vec.prototype.idiv = function(v2) {
    if(1 * v2 === v2) {
        this.x /= v2;
        this.y /= v2;
        this.z /= v2;
        return;
    }
    this.x /= v2.x;
    this.y /= v2.y;
    this.z /= v2.z;
    return this;
}
vec.prototype.div = function(v2) {
    if(1 * v2 === v2) {
        return new vec(this.x / v2, this.y / v2, this.z / v2);
    }
    return new vec(this.x / v2.x, this.y / v2.y, this.z / v2.z);
}
vec.prototype.imult = function(v2) {
    if(1 * v2 === v2) {
        this.x *= v2;
        this.y *= v2;
        this.z *= v2;
        return;
    }
    this.x *= v2.x;
    this.y *= v2.y;
    this.z *= v2.z;
    return this;
}
vec.prototype.mult = function(v2) {
    if(1 * v2 === v2) {
        return new vec(this.x * v2, this.y * v2, this.z * v2);
    }
    return new vec(this.x * v2.x, this.y * v2.y, this.z * v2.z);
}
vec.prototype.dot = function(v2) { return this.x * v2.x + this.y * v2.y + this.z * v2.z; }
vec.prototype.cross = function(v2) { return new vec(this.y * v2.z - this.z * v2.y, this.z * v2.x - this.x * v2.z, this.x * v2.y - this.y * v2.x); }
vec.prototype.mag = function() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z); }
vec.prototype.inormalize = function() {
    this.idiv(this.mag());
    return this;
}
vec.prototype.normalize = function() { return this.div(this.mag()); }
function map(a, b, c, d, e) { return d + (e - d) * (a - b) / (c - b); }
function ccCol(x, y, z, w, h, d, x2, y2, z2, w2, h2, d2) {
    x -= w / 2;
    y -= h / 2;
    z -= d / 2;
    x2 -= w2 / 2;
    y2 -= h2 / 2;
    z2 -= d2 / 2;
    return x > x2 - w && y > y2 - h && z > z2 - d && x < x2 + w2 && y < y2 + h2 && z < z2 + d2;
}
function constrain(a, b, c) { return Math.max(Math.min(a, c), b); }
const D2R = Math.PI / 180;
function yRotate(theta, p) {
    const x = p.x, y = p.y, z = p.z;
    const s = Math.sin(theta * D2R);
    const c = Math.cos(theta * D2R);
    return v(x * c + z * s, y, z * c - x * s);
}
function xRotate(theta, p) {
    const x = p.x, y = p.y, z = p.z;
    const s = Math.sin(theta * D2R);
    const c = Math.cos(theta * D2R);
    return v(x, y * c - z * s, z * c + y * s);
}
function zRotate(theta, p) {
    const x = p.x, y = p.y, z = p.z;
    const s = Math.sin(theta * D2R);
    const c = Math.cos(theta * D2R);
    return v(x * c - y * s, y * c + x * s, z);
}
function v(x, y, z) { return new vec(x, y, z); }
const m4b = {
    identity: function(x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    },
    translate: function(x, y, z) {
        return [
             1, 0, 0, 0,
             0, 1, 0, 0,
             0, 0, 1, 0,
             x, y, z, 1
        ];
    },
    scale: function(x, y, z) {
        return [
             x,  0,  0,  0,
             0,  y,  0,  0,
             0,  0,  z,  0,
             0,  0,  0,  1,
        ];
    },
    xRot: function(t) {
        const c = Math.cos(t);
        const s = Math.sin(t);
        return [
             1,  0,  0,  0,
             0,  c,  s,  0,
             0, -s,  c,  0,
             0,  0,  0,  1,
        ];
    },
    yRot: function(t) {
        const c = Math.cos(t);
        const s = Math.sin(t);
        return [
             c,  0, -s,  0,
             0,  1,  0,  0,
             s,  0,  c,  0,
             0,  0,  0,  1,
        ];
    },
    zRot: function(t) {
        const c = Math.cos(t);
        const s = Math.sin(t);
        return [
             c,  s,  0,  0,
            -s,  c,  0,  0,
             0,  0,  1,  0,
             0,  0,  0,  1,
        ];
    },
};
const m4 = {
    translate: function(m, x, y, z) { return m4.multiply(m, m4b.translate(x, y, z)); },
    xRot: function(m, t) { return m4.multiply(m, m4b.xRot(t)); },
    yRot: function(m, t) { return m4.multiply(m, m4b.yRot(t)); },
    zRot: function(m, t) { return m4.multiply(m, m4b.zRot(t)); },
    scale: function(m, x, y, z) { return m4.multiply(m, m4b.scale(x, y, z)); },
    multiply: function(a, b) {
        const b00 = b[0], b01 = b[1], b02 = b[2], b03 = b[3], b10 = b[4], b11 = b[5], b12 = b[6], b13 = b[7], b20 = b[8], b21 = b[9], b22 = b[10], b23 = b[11], b30 = b[12], b31 = b[13], b32 = b[14], b33 = b[15], a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3], a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7], a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11], a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30, b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31, b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32, b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30, b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31, b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32, b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30, b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31, b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32, b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30, b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31, b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32, b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },
    invert: function(m) {
        const r = [];
         r[0] =  m[5] * m[10] * m[15] - m[5] * m[14] * m[11] - m[6] * m[9] * m[15] + m[6] * m[13] * m[11] + m[7] * m[9] * m[14] - m[7] * m[13] * m[10];
         r[1] = -m[1] * m[10] * m[15] + m[1] * m[14] * m[11] + m[2] * m[9] * m[15] - m[2] * m[13] * m[11] - m[3] * m[9] * m[14] + m[3] * m[13] * m[10];
         r[2] =  m[1] *  m[6] * m[15] - m[1] * m[14] *  m[7] - m[2] * m[5] * m[15] + m[2] * m[13] *  m[7] + m[3] * m[5] * m[14] - m[3] * m[13] *  m[6];
         r[3] = -m[1] *  m[6] * m[11] + m[1] * m[10] *  m[7] + m[2] * m[5] * m[11] - m[2] *  m[9] *  m[7] - m[3] * m[5] * m[10] + m[3] *  m[9] *  m[6];
         r[4] = -m[4] * m[10] * m[15] + m[4] * m[14] * m[11] + m[6] * m[8] * m[15] - m[6] * m[12] * m[11] - m[7] * m[8] * m[14] + m[7] * m[12] * m[10];
         r[5] =  m[0] * m[10] * m[15] - m[0] * m[14] * m[11] - m[2] * m[8] * m[15] + m[2] * m[12] * m[11] + m[3] * m[8] * m[14] - m[3] * m[12] * m[10];
         r[6] = -m[0] *  m[6] * m[15] + m[0] * m[14] *  m[7] + m[2] * m[4] * m[15] - m[2] * m[12] *  m[7] - m[3] * m[4] * m[14] + m[3] * m[12] *  m[6];
         r[7] =  m[0] *  m[6] * m[11] - m[0] * m[10] *  m[7] - m[2] * m[4] * m[11] + m[2] *  m[8] *  m[7] + m[3] * m[4] * m[10] - m[3] *  m[8] *  m[6];
         r[8] =  m[4] *  m[9] * m[15] - m[4] * m[13] * m[11] - m[5] * m[8] * m[15] + m[5] * m[12] * m[11] + m[7] * m[8] * m[13] - m[7] * m[12] *  m[9];
         r[9] = -m[0] *  m[9] * m[15] + m[0] * m[13] * m[11] + m[1] * m[8] * m[15] - m[1] * m[12] * m[11] - m[3] * m[8] * m[13] + m[3] * m[12] *  m[9];
        r[10] =  m[0] *  m[5] * m[15] - m[0] * m[13] *  m[7] - m[1] * m[4] * m[15] + m[1] * m[12] *  m[7] + m[3] * m[4] * m[13] - m[3] * m[12] *  m[5];
        r[11] = -m[0] *  m[5] * m[11] + m[0] *  m[9] *  m[7] + m[1] * m[4] * m[11] - m[1] *  m[8] *  m[7] - m[3] * m[4] *  m[9] + m[3] *  m[8] *  m[5];
        r[12] = -m[4] *  m[9] * m[14] + m[4] * m[13] * m[10] + m[5] * m[8] * m[14] - m[5] * m[12] * m[10] - m[6] * m[8] * m[13] + m[6] * m[12] *  m[9];
        r[13] =  m[0] *  m[9] * m[14] - m[0] * m[13] * m[10] - m[1] * m[8] * m[14] + m[1] * m[12] * m[10] + m[2] * m[8] * m[13] - m[2] * m[12] *  m[9];
        r[14] = -m[0] *  m[5] * m[14] + m[0] * m[13] *  m[6] + m[1] * m[4] * m[14] - m[1] * m[12] *  m[6] - m[2] * m[4] * m[13] + m[2] * m[12] *  m[5];
        r[15] =  m[0] *  m[5] * m[10] - m[0] *  m[9] *  m[6] - m[1] * m[4] * m[10] + m[1] *  m[8] *  m[6] + m[2] * m[4] *  m[9] - m[2] *  m[8] *  m[5];
        const invDet = 1 / (m[0] * r[0] + m[1] * r[4] + m[2] * r[8] + m[3] * r[12]);
        for(let i = 0; i < 16; i += 1) { r[i] *= invDet; }
        return r;
    }
};
