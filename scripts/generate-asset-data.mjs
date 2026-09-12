import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

// Sinh ra 2 file:
//   src/constants/assetsExtra.ts            — map đường dẫn cho các pack chưa đăng ký tay
//   src/constants/assetHeights.generated.json — chiều cao gốc (native) của asset dùng trong gameplay
//
// Chạy lại sau mỗi lần thêm pack mới:  node scripts/generate-asset-data.mjs

const ROOT = process.cwd();
const PUBLIC_MODELS = path.join(ROOT, 'public', 'models');

// --- 1. Các pack cần đăng ký, và thư mục con nào được lấy -------------------
// Với pack có cả .gltf (kèm .bin rời) lẫn *_raw_glb (GLB tự chứa) thì luôn ưu
// tiên GLB: một request thay vì ba, và không vỡ khi thiếu file .bin.
const PACKS = [
  { key: 'NATUREKIT', sources: [{ dir: 'naturekit', ext: ['.glb'] }] },
  { key: 'QUATERNIUS', sources: [{ dir: 'quaternius_raw_glb', ext: ['.glb'] }] },
  { key: 'VILLAGES', sources: [{ dir: 'villages_raw_glb', ext: ['.glb'] }] },
  {
    key: 'DECORATION',
    sources: [
      { dir: 'decoration/nature_raw_glb', ext: ['.glb'], prefix: 'NATURE' },
      { dir: 'decoration/props_raw_glb', ext: ['.glb'], prefix: 'PROPS' },
    ],
  },
  {
    key: 'BUILDINGS',
    // CHỈ green/blue. neutral, red, yellow bị lỗi export tích luỹ (18–20 mesh
    // mỗi file, có cả SNature_Tree lẫn vào) — xem QUARANTINE bên dưới.
    sources: [
      { dir: 'buildings/green_glb_raw', ext: ['.glb'], prefix: 'GREEN' },
      { dir: 'buildings/blue_glb_raw', ext: ['.glb'], prefix: 'BLUE' },
    ],
  },
  { key: 'RESOURCEBITS', sources: [{ dir: 'resourcebits_raw_glb', ext: ['.glb'] }] },
];

// Pack KHÔNG đăng ký vì file hỏng sau khi convert FBX -> GLB. Sửa xong thì
// chuyển ngược lên PACKS.
//   nature_raw_glb              : export tích luỹ, file thứ N chứa cả N-1 model trước
//   buildings/{neutral,red,yellow}_raw_glb : như trên, 18–20 mesh mỗi file
//   wild_raw_glb                : hình học đúng mét nhưng node gốc còn scale 0.01
//                                 (bear ra 2 cm); SCharacter_* còn nhỏ hơn 100 lần nữa
const QUARANTINE = ['nature_raw_glb', 'wild_raw_glb', 'buildings/neutral_raw_glb',
  'buildings/red_raw_glb', 'buildings/yellow_raw_glb'];

// --- 2. Pack nào cần bảng chiều cao (để chuẩn hoá theo chiều cao mục tiêu) ---
const HEIGHT_PACKS = ['forest', 'forest1', 'trees', 'flowers', 'naturekit',
  'quaternius_raw_glb', 'decoration', 'objects', 'villages_raw_glb'];

function toKey(file, prefix) {
  const base = file.replace(/\.(gltf|glb|fbx)$/i, '').replace(/\.gltf$/i, '');
  const key = base
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+/, '')
    .replace(/_+$/, '')
    .toUpperCase();
  return prefix ? `${prefix}_${key}` : key;
}

function collect(source) {
  const abs = path.join(PUBLIC_MODELS, source.dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => source.ext.some((e) => f.toLowerCase().endsWith(e)))
    .sort()
    .map((f) => ({ key: toKey(f, source.prefix), value: `/models/${source.dir}/${f}` }));
}

// --- Sinh assetsExtra.ts ----------------------------------------------------
let ts = `// FILE ĐƯỢC SINH TỰ ĐỘNG — đừng sửa tay.
// Chạy lại: node scripts/generate-asset-data.mjs
//
// Các pack này trước đây nằm trong public/models nhưng KHÔNG có trong
// GAME_ASSETS, nên game không tham chiếu được. assets.ts trộn chúng vào
// GAME_ASSETS.MODELS.

export const EXTRA_MODELS = {
`;

for (const pack of PACKS) {
  const entries = pack.sources.flatMap(collect);
  if (entries.length === 0) continue;
  const seen = new Set();
  ts += `  ${pack.key}: {\n`;
  for (const { key, value } of entries) {
    if (seen.has(key)) {
      console.error(`trùng key, bỏ qua: ${pack.key}.${key} -> ${value}`);
      continue;
    }
    seen.add(key);
    ts += `    ${key}: '${value}',\n`;
  }
  ts += `  },\n`;
  console.error(`${pack.key}: ${seen.size} asset`);
}
ts += `} as const;\n`;

fs.writeFileSync(path.join(ROOT, 'src', 'constants', 'assetsExtra.ts'), ts);

for (const q of QUARANTINE) {
  if (fs.existsSync(path.join(PUBLIC_MODELS, q))) {
    console.error(`cách ly (không đăng ký): ${q} — cần export lại`);
  }
}

// --- Sinh bảng chiều cao ----------------------------------------------------
// Dùng lại 2 script đo đã có thay vì lặp lại logic parse.
const heights = {};

function ingestTsv(tsv, heightCol) {
  for (const line of tsv.trim().split('\n').slice(1)) {
    const cols = line.split('\t');
    if (cols.length < 5) continue;
    // Script đo trả về đường dẫn đã bỏ tiền tố "public/models/". Vẫn cắt lại
    // phòng khi được gọi với đường dẫn tuyệt đối.
    const rel = cols[0]
      .replace(/^.*public\/models\//, '')
      .replace(new RegExp(`^${ROOT.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}/`), '')
      .replace(/^\/+/, '');
    const h = Number(cols[heightCol]);
    if (!Number.isFinite(h) || h <= 0) continue;
    heights[`/models/${rel}`] = Math.round(h * 100) / 100;
  }
}

for (const pack of HEIGHT_PACKS) {
  const dir = path.join('public', 'models', pack); // phải là đường dẫn tương đối
  if (!fs.existsSync(path.join(ROOT, dir))) continue;
  const out = execFileSync('node', [path.join('scripts', 'audit-models.mjs'), dir], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  // audit-models.mjs: file,w,h,d,... -> cột chỉ số 2 là chiều cao (trục Y)
  ingestTsv(out, 2);
}

fs.writeFileSync(
  path.join(ROOT, 'src', 'constants', 'assetHeights.generated.json'),
  JSON.stringify(heights, null, 0) + '\n'
);
console.error(`\nassetHeights.generated.json: ${Object.keys(heights).length} asset`);
