import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Đọc bounding box của FBX nhị phân (version 7x) mà không cần three.js.
// Chỉ lấy mảng "Vertices" trong các node Geometry — đủ để biết asset đang ở
// đơn vị nào (m hay cm), tức là hệ số canonicalScale cần dùng.

function readFbx(file) {
  const buf = fs.readFileSync(file);
  if (buf.slice(0, 20).toString('binary') !== 'Kaydara FBX Binary  ') return null;
  const version = buf.readUInt32LE(23);
  const wide = version >= 7500;
  const verts = [];

  function readNode(off) {
    const end = wide ? Number(buf.readBigUInt64LE(off)) : buf.readUInt32LE(off);
    const numProps = wide ? Number(buf.readBigUInt64LE(off + 8)) : buf.readUInt32LE(off + 4);
    let p = off + (wide ? 24 : 12);
    const nameLen = buf.readUInt8(p); p += 1;
    const name = buf.slice(p, p + nameLen).toString('utf8'); p += nameLen;
    if (end === 0) return { end: 0 };

    const props = [];
    for (let i = 0; i < numProps; i++) {
      const type = String.fromCharCode(buf.readUInt8(p)); p += 1;
      if (type === 'Y') { props.push(buf.readInt16LE(p)); p += 2; }
      else if (type === 'C') { props.push(!!buf.readUInt8(p)); p += 1; }
      else if (type === 'I') { props.push(buf.readInt32LE(p)); p += 4; }
      else if (type === 'F') { props.push(buf.readFloatLE(p)); p += 4; }
      else if (type === 'D') { props.push(buf.readDoubleLE(p)); p += 8; }
      else if (type === 'L') { props.push(Number(buf.readBigInt64LE(p))); p += 8; }
      else if (type === 'S' || type === 'R') {
        const len = buf.readUInt32LE(p); p += 4;
        props.push(type === 'S' ? buf.slice(p, p + len).toString('utf8') : null);
        p += len;
      } else if ('fdlib'.includes(type)) {
        const arrLen = buf.readUInt32LE(p);
        const enc = buf.readUInt32LE(p + 4);
        const cLen = buf.readUInt32LE(p + 8);
        p += 12;
        let data = buf.slice(p, p + cLen);
        p += cLen;
        if (enc === 1) { try { data = zlib.inflateSync(data); } catch { data = null; } }
        if (data && type === 'd' && name === 'Vertices') {
          for (let k = 0; k + 8 <= data.length && k / 8 < arrLen; k += 8) verts.push(data.readDoubleLE(k));
        }
        props.push(null);
      } else return { end }; // kiểu lạ: bỏ qua nhánh này
    }

    // Các node con nằm giữa vị trí hiện tại và end
    const nullLen = wide ? 25 : 13;
    while (p + nullLen <= end) {
      const child = readNode(p);
      if (!child || child.end === 0 || child.end <= p) break;
      p = child.end;
    }
    return { end, name };
  }

  let off = 27;
  while (off + (wide ? 25 : 13) < buf.length) {
    const n = readNode(off);
    if (!n || n.end === 0 || n.end <= off) break;
    off = n.end;
  }

  if (verts.length < 3) return null;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i + 2 < verts.length; i += 3) {
    for (let a = 0; a < 3; a++) {
      const v = verts[i + a];
      if (v < min[a]) min[a] = v;
      if (v > max[a]) max[a] = v;
    }
  }
  // FBX của Blender xuất ra thường là Z-up: trục "cao" là Z, không phải Y.
  const dx = max[0] - min[0], dy = max[1] - min[1], dz = max[2] - min[2];
  return {
    version,
    x: +dx.toFixed(2), y: +dy.toFixed(2), z: +dz.toFixed(2),
    tallest: +Math.max(dx, dy, dz).toFixed(2),
    verts: verts.length / 3,
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
      else if (/\.fbx$/i.test(e.name)) files.push(p);
    }
  };
  walk(root);
}

console.log(['file', 'dx', 'dy', 'dz', 'max', 'verts', 'kb'].join('\t'));
let ok = 0;
for (const f of files.sort()) {
  try {
    const r = readFbx(f);
    if (!r) { console.error('SKIP', f); continue; }
    ok++;
    console.log([
      f.replace('public/models/', ''),
      r.x, r.y, r.z, r.tallest, r.verts, Math.round(r.bytes / 1024),
    ].join('\t'));
  } catch (e) { console.error('FAIL', f, e.message); }
}
console.error(`\n${ok}/${files.length} FBX measured`);
