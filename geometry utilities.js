

// Triangle
function threePointNormal(v1, v2, v3, neg) {
    const n = v2.sub(v1).cross(v3.sub(v2));
    return neg ? n.ineg() : n;
}
function tri(v1, v2, v3, fn, n, n2, n3, id, m, r) {
    if(fn === 1) {
        tri(v1, v2, v3, 0, n, n2, n3, id, m, r);
        return tri(v1, v2, v3, -1, n, n2, n3, id, m, r);
    }
    if(!id && id !== 0) {
        return tri(v1, v2, v3, fn, fn, fn, fn, n, n2, n3);
    }
    tris.push({
        v1: v1,
        v2: v2,
        v3: v3,
        get normal() {
            return (fn === -1 ? threePointNormal(this.v1, this.v2, this.v3, true) : (fn || threePointNormal(this.v1, this.v2, this.v3)));
        },
        get normal1() {
            return (n === -1 ? threePointNormal(this.v1, this.v2, this.v3, true) : (n || threePointNormal(this.v1, this.v2, this.v3)));
        },
        get normal2() {
            return (n2 === -1 ? threePointNormal(this.v1, this.v2, this.v3, true) : (n2 || threePointNormal(this.v1, this.v2, this.v3)));
        },
        get normal3() {
            return (n3 === -1 ? threePointNormal(this.v1, this.v2, this.v3, true) : (n3 || threePointNormal(this.v1, this.v2, this.v3)));
        },
        id: id,
        metallic: m,
        roughness: r,
    });
}
function glVert(p, id, n, fn, m, r) {
    indices.push(vertices.length / 12);
    vertices.push(p.x, p.y, p.z);
    vertices.push(id);
    vertices.push(n.x, n.y, n.z);
    vertices.push(fn.x, fn.y, fn.z);
    vertices.push(m);
    vertices.push(r);
};
function glTri(v1, v2, v3, n, n2, n3, fn, id, m, r) {
    glVert(v1, id, n, fn, m, r);
    glVert(v2, id, n2, fn, m, r);
    glVert(v3, id, n3, fn, m, r);
};
function dispTri(t) {
    glTri(t.v1, t.v2, t.v3, t.normal1, t.normal2, t.normal3, t.normal, t.id, t.metallic, t.roughness);
}

function random(a, b) {
    if(!b && b !== 0) {
        return Math.random() * a;
    }
    return Math.min(a, b) + Math.random() * (Math.max(a, b) - Math.min(a, b));
}

// Ellipsoid
const ellipsoid = (function() {
    function getVertex(vs, ex, ey, ez, w, h, d, x, y, z) {
        const D = Math.hypot(x, y, z);
        x /= D;
        y /= D;
        z /= D;
        x *= w / 2;
        y *= h / 2;
        z *= d / 2;
        x += ex;
        y += ey;
        z += ez;
        let p = vs.indexOf(x + "," + y + "," + z);
        if(p < 0) {
            p = vs.length;
            vs.push(x + "," + y + "," + z);
        }
        return p;
    }
    function genVertex(vs, p) {
        const bruh = vs[p].split(",");
        return v(bruh[0], bruh[1], bruh[2]);
    }
    return function(x, y, z, w, h, d, id, q, m, r) {
        const vs = [];
        const fs = [];
        for(let i = -q / 2; i < q / 2; i += 1) {
            for(let j = -q / 2; j < q / 2; j += 1) {
                var p1 = getVertex(vs, x, y, z, w, h, d, i, j, -q / 2);
                var p2 = getVertex(vs, x, y, z, w, h, d, i + 1, j, -q / 2);
                var p3 = getVertex(vs, x, y, z, w, h, d, i + 1, j + 1, -q / 2);
                var p4 = getVertex(vs, x, y, z, w, h, d, i, j + 1, -q / 2);
                fs.push([p1, p3, p2]);
                fs.push([p1, p4, p3]);
                var p1 = getVertex(vs, x, y, z, w, h, d, i, j, q / 2);
                var p2 = getVertex(vs, x, y, z, w, h, d, i + 1, j, q / 2);
                var p3 = getVertex(vs, x, y, z, w, h, d, i + 1, j + 1, q / 2);
                var p4 = getVertex(vs, x, y, z, w, h, d, i, j + 1, q / 2);
                fs.push([p1, p2, p3]);
                fs.push([p1, p3, p4]);
            }
        }
        for(let i = -q / 2; i < q / 2; i += 1) {
            for(let j = -q / 2; j < q / 2; j += 1) {
                var p1 = getVertex(vs, x, y, z, w, h, d, -q / 2, j, i);
                var p2 = getVertex(vs, x, y, z, w, h, d, -q / 2, j, i + 1);
                var p3 = getVertex(vs, x, y, z, w, h, d, -q / 2, j + 1, i + 1);
                var p4 = getVertex(vs, x, y, z, w, h, d, -q / 2, j + 1, i);
                fs.push([p1, p2, p3]);
                fs.push([p1, p3, p4]);
                var p1 = getVertex(vs, x, y, z, w, h, d, q / 2, j, i);
                var p2 = getVertex(vs, x, y, z, w, h, d, q / 2, j, i + 1);
                var p3 = getVertex(vs, x, y, z, w, h, d, q / 2, j + 1, i + 1);
                var p4 = getVertex(vs, x, y, z, w, h, d, q / 2, j + 1, i);
                fs.push([p1, p3, p2]);
                fs.push([p1, p4, p3]);
            }
        }
        for(let i = -q / 2; i < q / 2; i += 1) {
            for(let j = -q / 2; j < q / 2; j += 1) {
                var p1 = getVertex(vs, x, y, z, w, h, d, j, -q / 2, i);
                var p2 = getVertex(vs, x, y, z, w, h, d, j, -q / 2, i + 1);
                var p3 = getVertex(vs, x, y, z, w, h, d, j + 1, -q / 2, i + 1);
                var p4 = getVertex(vs, x, y, z, w, h, d, j + 1, -q / 2, i);
                fs.push([p1, p3, p2]);
                fs.push([p1, p4, p3]);
                var p1 = getVertex(vs, x, y, z, w, h, d, j, q / 2, i);
                var p2 = getVertex(vs, x, y, z, w, h, d, j, q / 2, i + 1);
                var p3 = getVertex(vs, x, y, z, w, h, d, j + 1, q / 2, i + 1);
                var p4 = getVertex(vs, x, y, z, w, h, d, j + 1, q / 2, i);
                fs.push([p1, p2, p3]);
                fs.push([p1, p3, p4]);
            }
        }
        for(let i = 0; i < fs.length; i += 1) {
            const f1 = fs[i];
            const v1 = genVertex(vs, f1[0]),
                v2 = genVertex(vs, f1[1]),
                v3 = genVertex(vs, f1[2]);
            const n1 = threePointNormal(v1, v2, v3),
                n2 = threePointNormal(v1, v2, v3),
                n3 = threePointNormal(v1, v2, v3);
            for(let j = 0; j < fs.length; j += 1) {
                const f2 = fs[j];
                if(j === i) {
                    continue;
                }
                if(f1[0] === f2[0] || f1[0] === f2[1] || f1[0] === f2[2]) {
                    n1.iadd(threePointNormal(genVertex(vs, f2[0]), genVertex(vs, f2[1]), genVertex(vs, f2[2])));
                }
                if(f1[1] === f2[0] || f1[1] === f2[1] || f1[1] === f2[2]) {
                    n2.iadd(threePointNormal(genVertex(vs, f2[0]), genVertex(vs, f2[1]), genVertex(vs, f2[2])));
                }
                if(f1[2] === f2[0] || f1[2] === f2[1] || f1[2] === f2[2]) {
                    n3.iadd(threePointNormal(genVertex(vs, f2[0]), genVertex(vs, f2[1]), genVertex(vs, f2[2])));
                }
            }
            tri(
                v1, v2, v3,
                0, n1, n2, n3,
                id, m, r
            );
        }
    };
})();