// Sort a pile of fishing photos and clips into catch-collection outings by when they were taken.
//
//   cd _tools && npm install
//   node sort-catch-photos.mjs [inbox]                    report: which day each file belongs to, and whether an outing exists for it
//   node sort-catch-photos.mjs [inbox] --sheets <dir>     also write a contact sheet per day, for picking the keepers
//   node sort-catch-photos.mjs [inbox] --copy a.jpg,b.jpg  copy chosen files into assets/catches/photos/<date>/,
//                                                          resized to 1600px with all metadata (GPS included) stripped,
//                                                          and print the `photos:` entries to paste into the outing
//                                                          (caption goes after the |)
//
// The inbox defaults to ../_photo-inbox, which git ignores. Timestamps come from EXIF, then from camera file names
// (DJI_20261006143012_..., PXL_20261006_143012..., IMG_20261006_143012...), then from the file's modified time.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import exifr from 'exifr';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '..');
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? null : args.splice(i, 2)[1]; };
const sheetsDir = flag('--sheets');
const copyList = flag('--copy');
const inbox = path.resolve(args[0] || path.join(repo, '_photo-inbox'));

const IMAGE = /\.(jpe?g|heic|heif|png|webp|dng|arw|cr2|nef)$/i;
const VIDEO = /\.(mp4|mov|lrv|insv)$/i;
const pad = (n) => String(n).padStart(2, '0');
const day = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const clock = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function fromName(name) {
  const m = name.match(/(20\d\d)(\d\d)(\d\d)[_-]?(\d\d)(\d\d)(\d\d)/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
}

async function takenAt(file) {
  if (IMAGE.test(file)) {
    try {
      const e = await exifr.parse(file, { pick: ['DateTimeOriginal', 'CreateDate', 'latitude', 'longitude'], gps: true });
      const t = e && (e.DateTimeOriginal || e.CreateDate);
      if (t instanceof Date && !isNaN(t)) return { t, how: 'exif', gps: e.latitude != null };
    } catch {}
  }
  const n = fromName(path.basename(file));
  if (n) return { t: n, how: 'name', gps: false };
  return { t: fs.statSync(file).mtime, how: 'mtime', gps: false };
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : IMAGE.test(e.name) || VIDEO.test(e.name) ? [p] : [];
  });
}

function outingsByDay() {
  const dir = path.join(repo, '_catches');
  const map = {};
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const fm = fs.readFileSync(path.join(dir, f), 'utf8').split('---')[1] || '';
    const d = (fm.match(/^date:\s*(\S+)/m) || [])[1];
    const w = (fm.match(/^water:\s*(\S+)/m) || [])[1];
    if (d) (map[d] = map[d] || []).push(`${f} (${w})`);
  }
  return map;
}

if (!fs.existsSync(inbox)) { console.error(`No inbox at ${inbox}. Drop photos there, or pass a folder.`); process.exit(1); }

if (copyList) {
  for (const name of copyList.split(',').map((s) => s.trim()).filter(Boolean)) {
    const src = walk(inbox).find((p) => path.basename(p) === name);
    if (!src) { console.error(`not in the inbox: ${name}`); continue; }
    if (!IMAGE.test(src)) { console.error(`skipping ${name}: only photos can be copied (grab a still from a clip first)`); continue; }
    const { t } = await takenAt(src);
    const outDir = path.join(repo, 'assets', 'catches', 'photos', day(t));
    fs.mkdirSync(outDir, { recursive: true });
    const out = path.join(outDir, path.basename(name).replace(/\.\w+$/, '.jpg').toLowerCase());
    await sharp(src).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    console.log(`  - "/${path.relative(repo, out).split(path.sep).join('/')} | "`);
  }
  process.exit(0);
}

const files = walk(inbox);
const items = [];
for (const f of files) items.push({ f, ...(await takenAt(f)) });
items.sort((a, b) => a.t - b.t);

const outings = outingsByDay();
const days = {};
for (const it of items) (days[day(it.t)] = days[day(it.t)] || []).push(it);

let gps = 0, guessed = 0;
for (const [d, list] of Object.entries(days)) {
  const o = outings[d];
  console.log(`\n${d}  ${list.length} file${list.length > 1 ? 's' : ''}  ${o ? '-> ' + o.join(', ') : '-> no outing yet'}`);
  for (const it of list) {
    if (it.gps) gps++;
    if (it.how === 'mtime') guessed++;
    console.log(`   ${clock(it.t)}  ${path.relative(inbox, it.f)}${VIDEO.test(it.f) ? '  [clip]' : ''}${it.how === 'mtime' ? '  [time guessed from file date]' : ''}${it.gps ? '  [has GPS]' : ''}`);
  }
}
console.log(`\n${items.length} files over ${Object.keys(days).length} days.`);
if (guessed) console.log(`${guessed} had no timestamp of their own; their day is a guess from the file date.`);
if (gps) console.log(`${gps} carry GPS. --copy strips it, so nothing published gives away a spot.`);

if (sheetsDir) {
  fs.mkdirSync(sheetsDir, { recursive: true });
  for (const [d, list] of Object.entries(days)) {
    const stills = list.filter((it) => IMAGE.test(it.f));
    if (!stills.length) continue;
    const W = 300, H = 300, cols = 5;
    const tiles = [];
    for (const it of stills) {
      try {
        const img = await sharp(it.f).rotate().resize(W, H - 24, { fit: 'contain', background: '#808080' }).toBuffer();
        const label = Buffer.from(`<svg width="${W}" height="24"><rect width="${W}" height="24" fill="#fff"/><text x="6" y="17" font-size="14" font-family="Arial">${clock(it.t)} ${path.basename(it.f).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text></svg>`);
        tiles.push(await sharp({ create: { width: W, height: H, channels: 3, background: '#fff' } }).composite([{ input: img, top: 0, left: 0 }, { input: label, top: H - 24, left: 0 }]).png().toBuffer());
      } catch (e) { console.error(`could not read ${it.f}: ${e.message}`); }
    }
    if (!tiles.length) continue;
    const rows = Math.ceil(tiles.length / cols);
    await sharp({ create: { width: cols * (W + 4), height: rows * (H + 4), channels: 3, background: '#ddd' } })
      .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * (W + 4), top: Math.floor(i / cols) * (H + 4) })))
      .jpeg({ quality: 70 }).toFile(path.join(sheetsDir, `${d}.jpg`));
  }
  console.log(`Contact sheets written to ${sheetsDir}`);
}
