import fs from 'fs';
import path from 'path';

// ---- tiny 4x4 matrix helpers (column-major like glTF) ----
const ident = () => [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++)
        o[c*4+r] += a[k*4+r] * b[c*4+k];
  return o;
}

function fromTRS(t, r, s) {
  const [x,y,z,w] = r || [0,0,0,1];
  const [sx,sy,sz] = s || [1,1,1];
  const [tx,ty,tz] = t || [0,0,0];
  const x2=x+x, y2=y+y, z2=z+z;
  const xx=x*x2, xy=x*y2, xz=x*z2;
  const yy=y*y2, yz=y*z2, zz=z*z2;
  const wx=w*x2, wy=w*y2, wz=w*z2;
  return [
    (1-(yy+zz))*sx, (xy+wz)*sx,     (xz-wy)*sx,     0,
    (xy-wz)*sy,     (1-(xx+zz))*sy, (yz+wx)*sy,     0,
    (xz+wy)*sz,     (yz-wx)*sz,     (1-(xx+yy))*sz, 0,
    tx,             ty,             tz,             1,
  ];
}

function applyMat(m, p) {
  const [x,y,z] = p;
  return [
    m[0]*x + m[4]*y + m[8]*z  + m[12],
    m[1]*x + m[5]*y + m[9]*z  + m[13],
    m[2]*x + m[6]*y + m[10]*z + m[14],
  ];
}

function nodeMatrix(n) {
  if (n.matrix) return n.matrix.slice();
  return fromTRS(n.translation, n.rotation, n.scale);
}

// ---- GLB / glTF reader ----
function readGltfJson(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(0, 4).toString('ascii') === 'glTF') {
    let off = 12;
    while (off < buf.length) {
      const len = buf.readUInt32LE(off);
      const type = buf.readUInt32LE(off + 4);
      const data = buf.slice(off + 8, off + 8 + len);
      if (type === 0x4E4F534A) return JSON.parse(data.toString('utf8'));
      off += 8 + len + ((4 - (len % 4)) % 4 === 0 ? 0 : 0);
      off = off + 0;
      if (len % 4 !== 0) off += 4 - (len % 4);
    }
    throw new Error('no JSON chunk');
  }
  return JSON.parse(buf.toString('utf8'));
}

function audit(file) {
  const g = readGltfJson(file);
  const accessors = g.accessors || [];
  const meshes = g.meshes || [];
  const nodes = g.nodes || [];
  const scene = g.scenes?.[g.scene ?? 0] ?? g.scenes?.[0];
  if (!scene) return null;

  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  let tris = 0;
  let meshCount = 0;
  const matIdx = new Set();

  function visit(ni, parent) {
    const n = nodes[ni];
    if (!n) return;
    const world = mul(parent, nodeMatrix(n));
    if (n.mesh !== undefined) {
      meshCount++;
      for (const prim of meshes[n.mesh].primitives || []) {
        if (prim.material !== undefined) matIdx.add(prim.material);
        const posA = accessors[prim.attributes?.POSITION];
        if (posA?.min && posA?.max) {
          const [x0,y0,z0] = posA.min, [x1,y1,z1] = posA.max;
          for (const corner of [[x0,y0,z0],[x1,y0,z0],[x0,y1,z0],[x0,y0,z1],
                                [x1,y1,z0],[x1,y0,z1],[x0,y1,z1],[x1,y1,z1]]) {
            const p = applyMat(world, corner);
            for (let i = 0; i < 3; i++) {
              if (p[i] < min[i]) min[i] = p[i];
              if (p[i] > max[i]) max[i] = p[i];
            }
          }
        }
        const count = prim.indices !== undefined
          ? accessors[prim.indices]?.count ?? 0
          : posA?.count ?? 0;
        tris += Math.floor(count / 3);
      }
    }
    for (const c of n.children || []) visit(c, world);
  }

  for (const r of scene.nodes || []) visit(r, ident());
  if (!isFinite(min[0])) return null;

  return {
    file,
    w: +(max[0] - min[0]).toFixed(2),
    h: +(max[1] - min[1]).toFixed(2),
    d: +(max[2] - min[2]).toFixed(2),
    yMin: +min[1].toFixed(2),
    tris,
    meshes: meshCount,
    mats: matIdx.size,
    bytes: fs.statSync(file).size,
  };
}

const roots = process.argv.slice(2);
const files = [];
for (const root of roots) {
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(glb|gltf)$/i.test(e.name)) files.push(p);
    }
  };
  walk(root);
}

const rows = [];
for (const f of files.sort()) {
  try { const r = audit(f); if (r) rows.push(r); }
  catch (e) { console.error('FAIL', f, e.message); }
}

console.log(['file','w','h','d','yMin','tris','meshes','mats','kb'].join('\t'));
for (const r of rows) {
  console.log([
    r.file.replace('public/models/', ''),
    r.w, r.h, r.d, r.yMin, r.tris, r.meshes, r.mats, Math.round(r.bytes / 1024),
  ].join('\t'));
}
console.error(`\n${rows.length} models audited`);
