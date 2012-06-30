function add1(s1, s2) {
    return s1 + s2;
}

function sub1(s1, s2) {
    return s1 - s2;
}

function mul1(s1, s2) {
    return s1 * s2;
}

function div1(s1, s2) {
    return s1 / s2;
}

function inv1(s) {
    return -s;
}

function lerp1(a, b, t) {
    return (1 - t) * a + t * b;
}

function quad1(s1, s2, s3, t) {
    var t1 = 1 - t;
    var left = t1 * s1 + t * s2;
    var right = t1 * s2 + t * s3;
    return t1 * left + t * right;
}

function cube1(s1, s2, s3, s4, t) {
    var t1 = 1 - t;
    return t1 * quad1(s1, s2, s3, t) + t * quad1(s2, s3, s4, t);
}

// --- //

function point2(x, y) {
    return { x: x, y: y };
}

function add2(p1, p2) {
    return point2(p1.x + p2.x, p1.y + p2.y);
}

function sub2(p1, p2) {
    return point2(p1.x - p2.x, p1.y - p2.y);
}

function mul2(p, s) {
    return point2(p.x * s, p.y * s);
}

function div2(p, s) {
    return point2(p.x / s, p.y / s);
}

function inv2(p) {
    return point2(-p.x, -p.y);
}

function dot2(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}

function lerp2(p1, p2, t) {
    return point2(lerp1(p1.x, p2.x, t),
                  lerp1(p1.y, p2.y, t));
}

function quad2(p1, p2, p3, t) {
    return point2(quad1(p1.x, p2.x, p3.x, t),
                  quad1(p1.y, p2.y, p3.y, t));
}

function cube2(p1, p2, p3, p4, t) {
    return point2(cube1(p1.x, p2.x, p3.x, p4.x, t),
                  cube1(p1.y, p2.y, p3.y, p4.y, t));
}

// --- //

function point3(x, y, z) {
    return { x: x, y: y, z: z };
}

function add3(p1, p2) {
    return point3(p1.x + p2.x, p1.y + p2.y, p1.z + p2.z);
}

function sub3(p1, p2) {
    return point3(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);
}

function mul3(p, s) {
    return point3(p.x * s, p.y * s, p.z * s);
}

function div3(p, s) {
    return point3(p.x / s, p.y / s, p.z / s);
}

function inv3(p) {
    return point2(-p.x, -p.y, -p.z);
}

function dot3(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
}

function cross3(p1, p2) {
    return point3(p1.y * p2.z - p1.z * p2.y,
                  p1.z * p2.x - p1.x * p2.z,
                  p1.x * p2.y - p1.y * p2.x);
}

function lerp3(p1, p2, t) {
    return point3(lerp1(p1.x, p2.x, t),
                  lerp1(p1.y, p2.y, t),
                  lerp1(p1.z, p2.z, t));
}

function quad3(p1, p2, p3, t) {
    return point3(quad1(p1.x, p2.x, p3.x, t),
                  quad1(p1.y, p2.y, p3.y, t),
                  quad1(p1.z, p2.z, p3.z, t));
}

function cube3(p1, p2, p3, p4, t) {
    return point3(cube1(p1.x, p2.x, p3.x, p4.x, t),
                  cube1(p1.y, p2.y, p3.y, p4.y, t),
                  cube1(p1.z, p2.z, p3.z, p4.z, t));
}

