// A stretch of trout stream seen from above. Current runs left to right; trout hold facing upstream.
// The water is a real (if simple) flow solve over a depth map, and the fish pick their lies from it.
(() => {
'use strict';

// index.html?strip is a thin moving window onto the river, for the bottom of the blog's home page: as wide as
// its frame at one pixel to one pixel, no angler, no controls, the view drifting slowly downstream.
const STRIP = new URLSearchParams(location.search).has('strip');
const VW = STRIP ? Math.max(384, Math.ceil(innerWidth)) : 384, REACHES = Math.max(1, Math.min(24, Number(new URLSearchParams(location.search).get('reaches')) || (STRIP ? 3 : 8))), W = VW * REACHES, H = 288;  // the screen shows one VW-wide window on a W-long river
const cv = document.getElementById('stream');
const ctx = cv.getContext('2d');
cv.width = VW; cv.height = H;
const $ = id => document.getElementById(id);
let g = ctx;  // where the pixel helpers draw; swapped to a layer while the world is being painted

// ---------- settings + saved fish ----------
const FLOWS = [['slow', 13], ['steady', 22], ['fast', 34]];
const LIGHTS = ['auto', 'dawn', 'day', 'dusk', 'night'];
const opts = { flow: 1, light: 0, lies: false, bug: 'mayfly', drift: false, preview: false, mode: 'cast' };  // preview = show where a fly would drift before you cast (off: work it out by casting)
const store = { nextId: 1, fish: [], rev: 0 };  // every trout this stream has ever held, whether or not it's in view right now
function load(key, into) { try { Object.assign(into, JSON.parse(localStorage.getItem(key) || '{}')); } catch (e) { /* no storage */ } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* no storage */ } }
// index.html?sandbox runs a throwaway river: nothing is read from or written to the saved fish
const SANDBOX = new URLSearchParams(location.search).has('sandbox');
// index.html?web (and anything served from alexjwang.com) is the public version: feed only (no line, no catches,
// no tasks, no server), with the fish kept in the visitor's own browser.
const WEB = STRIP || new URLSearchParams(location.search).has('web') || /(^|\.)alexjwang\.com$/.test(location.hostname);
const NOSERVER = SANDBOX || WEB;
if (WEB) document.body.classList.add('web');
if (STRIP) document.body.classList.add('strip');
// index.html?kiosk is the idle version for a small always-on screen: the river, today's list and the feed,
// and an angler who fishes by itself, landing a fish for each task you finish.
const KIOSK = new URLSearchParams(location.search).has('kiosk');
if (KIOSK) document.body.classList.add('kiosk');
load('blueline.opts', opts);
if (KIOSK) Object.assign(opts, { drift: true, preview: false, mode: 'cast' });
if (WEB) opts.mode = 'feed';
if (!SANDBOX) load('blueline.fish', store);

// ---------- helpers ----------
function mulberry32(a) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const today = () => { const d = new Date(); return [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(n => String(n).padStart(2, '0')).join('-'); };
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const bump = t => Math.exp(-t * t);

function disc(cx, cy, r, c) {
  g.fillStyle = c;
  const x0 = Math.round(cx), y0 = Math.round(cy), ri = Math.ceil(r);
  for (let dy = -ri; dy <= ri; dy++) {
    const h = r * r - dy * dy;
    if (h < 0) continue;
    const w = Math.floor(Math.sqrt(h) + 0.35);
    g.fillRect(x0 - w, y0 + dy, 2 * w + 1, 1);
  }
}
function dot(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
function ring(cx, cy, r, c) {
  g.fillStyle = c;
  cx = Math.round(cx); cy = Math.round(cy);
  let x = Math.round(r), y = 0, e = 1 - x;
  while (x >= y) {
    g.fillRect(cx + x, cy + y, 1, 1); g.fillRect(cx - x, cy + y, 1, 1);
    g.fillRect(cx + x, cy - y, 1, 1); g.fillRect(cx - x, cy - y, 1, 1);
    g.fillRect(cx + y, cy + x, 1, 1); g.fillRect(cx - y, cy + x, 1, 1);
    g.fillRect(cx + y, cy - x, 1, 1); g.fillRect(cx - y, cy - x, 1, 1);
    y++;
    if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
  }
}

// ---------- the stream bed ----------
// The river is REACHES screens long. Each reach runs riffle, run, bend pool, tailout; the pool and its
// undercut bank swap sides from one reach to the next, and each has its own boulders and wood.
const srand = mulberry32(1012);
const reaches = [];
for (let k = 0; k < REACHES; k++) {
  reaches.push({ k, x0: k * VW, flip: k % 2 === 1, poolX: k ? 265 + srand() * 40 : 285, bayX: 110 + srand() * 40, bay: k % 3 === 1 ? 0 : 15, riffle: k ? [30, 70] : [58, 100] });
}
const reachAt = x => reaches[clamp(Math.floor(x / VW), 0, REACHES - 1)];
const ucRange = r => [r.poolX - 39, r.poolX + 45];  // where the pool-side bank is undercut
// Bank edges for one reach in its own frame (pool against the bottom bank); flipped reaches mirror it.
const topL = (r, lx) => 30 + 8 * bump((lx - r.poolX) / 80) - r.bay * bump((lx - r.bayX) / 16);  // the dip is a slack bay
const botL = (r, lx) => H - 31 + 12 * bump((lx - r.poolX) / 70) - 5 * bump((lx - 120) / 60);
function edge(x, bottom) {
  const at = r => { const lx = x - r.x0; return r.flip ? H - (bottom ? topL(r, lx) : botL(r, lx)) : (bottom ? botL(r, lx) : topL(r, lx)); };
  const r = reachAt(x), lx = x - r.x0;
  let v = at(r);
  if (lx < 30 && r.k > 0) v += (at(reaches[r.k - 1]) - v) * (1 - sm(0, 30, lx)) * .5;  // ease across the joins
  if (lx > VW - 30 && r.k < REACHES - 1) v += (at(reaches[r.k + 1]) - v) * sm(VW - 30, VW, lx) * .5;
  return v;
}
const TOP = new Float32Array(W + 1), BOT = new Float32Array(W + 1);
for (let x = 0; x <= W; x++) { TOP[x] = Math.max(5, edge(x, false) + 2 * Math.sin(x * .07)); BOT[x] = Math.min(H - 5, edge(x, true) + 2 * Math.sin(x * .06 + 1)); }
const top = x => TOP[clamp(Math.round(x), 0, W)], bot = x => BOT[clamp(Math.round(x), 0, W)];
const inChannel = (x, y, m = 0) => y > top(x) + m && y < bot(x) - m;

const ROCKS = [  // [x, y, r] in each reach's own frame
  [[150, 142, 15], [161, 157, 9], [141, 129, 7], [96, 92, 8], [102, 214, 7], [232, 204, 7], [318, 118, 8], [302, 222, 6], [352, 168, 6], [196, 226, 5]],
  [[118, 168, 11], [130, 181, 7], [204, 112, 13], [216, 99, 7], [195, 124, 6], [250, 196, 6], [332, 150, 9], [92, 108, 6], [300, 92, 6]],
  [[108, 122, 10], [172, 172, 16], [185, 157, 8], [160, 188, 8], [242, 118, 7], [330, 204, 7], [346, 112, 9], [282, 232, 5]],
];
const LOGS = [  // [x, bank (0 far / 1 pool side), angle, length]
  [[212, 0, 1.05, 80]], [[160, 0, .9, 66], [306, 1, 1.2, 52]], [[92, 1, 1.0, 72], [246, 0, 1.15, 62]],
];
const rocks = [], logs = [];
for (const r of reaches) {
  const fy = y => (r.flip ? H - y : y);
  // past the first three reaches the same layouts come round again, shuffled so no two stretches match
  const again = r.k >= ROCKS.length, jig = n => (again ? (srand() - .5) * n : 0);
  for (const [lx, y, rad] of ROCKS[r.k % ROCKS.length]) {
    if (again && srand() < .2) continue;
    const x = r.x0 + lx + jig(36), yy = fy(y) + jig(30), rr = rad * (again ? .75 + srand() * .45 : 1);
    if (inChannel(x, yy, rr + 4)) rocks.push({ x, y: yy, r: rr });
  }
  for (let tries = 0, n = 0; tries < 200 && n < 6; tries++) {  // pocket water in the riffle
    const rad = 3 + srand() * 3.5, x = r.x0 + 10 + srand() * 66, y = srand() * H;
    if (inChannel(x, y, rad + 6) && !rocks.some(k => Math.hypot(k.x - x, k.y - y) < k.r + rad + 12)) { rocks.push({ x, y, r: rad }); n++; }
  }
  for (const [lx0, bank, ang, L0] of LOGS[r.k % LOGS.length]) {  // fallen trees, angled downstream off a bank
    const lx = lx0 + jig(50), L = L0 + jig(24);
    const x = r.x0 + lx, lower = r.flip ? !bank : !!bank;
    logs.push({ x, y: lower ? bot(x) + 3 : top(x) - 3, dx: Math.cos(ang), dy: lower ? -Math.sin(ang) : Math.sin(ang), L });
  }
}
for (const k of rocks) {
  k.blobs = [];
  for (let i = 0; i < 3; i++) k.blobs.push({ dx: (srand() - .5) * k.r, dy: (srand() - .5) * k.r, r: k.r * (.55 + srand() * .35) });
  k.moss = srand() < .45;
}
const solids = rocks.slice();  // everything the water has to go round
for (const l of logs) for (let d = 0; d <= l.L; d += 4) solids.push({ x: l.x + l.dx * d, y: l.y + l.dy * d, r: 3.5, log: true });
const SOLID = new Uint8Array(W * H);
for (const k of solids) {
  for (let y = Math.max(0, Math.floor(k.y - k.r)); y <= Math.min(H - 1, Math.ceil(k.y + k.r)); y++) {
    for (let x = Math.max(0, Math.floor(k.x - k.r)); x <= Math.min(W - 1, Math.ceil(k.x + k.r)); x++) if (Math.hypot(k.x - x, k.y - y) < k.r) SOLID[y * W + x] = 1;
  }
}
const inSolid = (x, y, m = 0) => (m ? solids.some(k => Math.abs(k.x - x) < k.r + m && Math.hypot(k.x - x, k.y - y) < k.r + m)
  : SOLID[clamp(Math.round(y), 0, H - 1) * W + clamp(Math.round(x), 0, W - 1)] === 1);

const canopies = [];  // branches hanging over the water
// the last few in the list are big trees leaning well out over the water
for (const r of reaches) for (const [lx, bank, big] of [[45, 0], [20, 1], [100, 1], [168, 0], [178, 1], [262, 0], [236, 1], [300, 1], [312, 0], [366, 1], [72, 0, 1], [140, 1, 1], [336, 0, 1], [208, 1, 1]]) {
  const x = clamp(r.x0 + lx + (srand() - .5) * 24, 4, W - 4), side = (r.flip ? !bank : !!bank) ? 1 : -1, leaves = [];
  for (let i = 0; i < (big ? 16 : 9); i++) leaves.push({ dx: (srand() - .5) * (big ? 46 : 30), dy: -side * (srand() * (big ? 34 : 13) - 3), r: 4 + srand() * (big ? 7 : 5) });
  canopies.push({ x, y: side < 0 ? top(x) : bot(x), side, leaves, big: !!big });
}

// Depth, 0 (dry) to about 1 (the bottom of a pool). Worked out once per pixel.
function depthAt(x, y) {
  const t = top(x), b = bot(x);
  if (y <= t || y >= b || inSolid(x, y)) return 0;
  const r = reachAt(x), lx = x - r.x0;
  const s = r.flip ? (b - y) / (b - t) : (y - t) / (b - t), toPool = r.flip ? y - t : b - y, toFar = r.flip ? b - y : y - t;
  const riffle = 1 - sm(r.riffle[0], r.riffle[1], lx), pool = bump((lx - r.poolX) / 52), tail = sm(332, 376, lx);
  const [u0, u1] = ucRange(r), uc = sm(u0, u0 + 16, lx) * (1 - sm(u1 - 16, u1, lx));  // no shelving where the bank is undercut
  const shelve = Math.max(.14, sm(0, 16, toFar) * sm(0, 16 * (1 - uc) + .01, toPool));
  const flat = .2 + .1 * (1 - riffle) * (1 - tail);
  const chan = (.22 * (1 - riffle) + .58 * pool) * (1 - .85 * tail);
  const thalweg = .5 + .2 * pool, wide = .36 - .1 * pool;  // the deep thread swings to the outside of the bend
  let d = shelve * (flat + chan * bump((s - thalweg) / wide)) + .03 * Math.sin(x * .21) * Math.sin(y * .17);
  for (const k of rocks) {  // scour behind the bigger rocks
    if (k.r <= 6 || Math.abs(x - k.x) > 60) continue;
    const big = k.r > 12;
    d += (big ? .55 : .22) * bump(Math.hypot(x - k.x - k.r - 8, y - k.y - (big ? 8 : 0)) / (big ? 17 : 9));
  }
  for (const l of logs) {  // and a hole off the end of each log
    const ex = l.x + l.dx * l.L, ey = l.y + l.dy * l.L;
    if (Math.abs(x - ex) < 60) d += .55 * bump(Math.hypot(x - ex - 10, y - ey + 4 * Math.sign(l.dy)) / 17);
  }
  return clamp(d, .08, 1.1);
}
const DEPTH = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) DEPTH[y * W + x] = depthAt(x, y);
const depth = (x, y) => DEPTH[clamp(Math.round(y), 0, H - 1) * W + clamp(Math.round(x), 0, W - 1)];

// ---------- the current ----------
// Depth-averaged flow: water piles through wherever it's deep and wide, so shallow riffles run fast,
// pools run slow, and the wakes behind rocks and wood go slack. Solved once on a coarse grid.
const C = 3, GW = W / C, GH = H / C;
const D = new Float32Array(GW * GH), U = new Float32Array(GW * GH), V = new Float32Array(GW * GH), S = new Float32Array(GW * GH);
(function solve() {
  const T = new Float32Array(GW * GH), h = new Float32Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const d = depth(i * C + 1, j * C + 1);
    D[j * GW + i] = d; T[j * GW + i] = Math.pow(d, 5 / 3);
  }
  for (const k of solids) {  // wake: a tapering tongue of dead water downstream of each obstacle
    const len = k.r * (k.log ? 5 : 4.5), i0 = Math.max(0, Math.floor(k.x / C)), i1 = Math.min(GW - 1, Math.ceil((k.x + len) / C));
    for (let j = 0; j < GH; j++) for (let i = i0; i <= i1; i++) {
      const dx = i * C + 1.5 - k.x, dy = Math.abs(j * C + 1.5 - k.y);
      if (dx > 0 && dx < len && dy < k.r * (1 - dx / len) + 1.5) T[j * GW + i] *= .1 + .9 * Math.pow(dx / len, 2);
    }
  }
  // Start from the answer for a river with no cross-currents (the water level falls fastest where the
  // channel is tightest), then relax to fill in the detail round every obstacle.
  const fall = new Float32Array(GW);
  let total = 0;
  for (let i = 0; i < GW; i++) { let kx = 0; for (let j = 0; j < GH; j++) kx += T[j * GW + i]; total += 1 / Math.max(kx, 1e-3); fall[i] = total; }
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) h[j * GW + i] = 1 - fall[i] / total;
  for (let it = 0; it < 420; it++) for (let j = 0; j < GH; j++) for (let i = 1; i < GW - 1; i++) {
    const n = j * GW + i, t = T[n];
    if (!t) continue;
    let num = 0, den = 0, m, tf;
    m = n - 1; if (T[m]) { tf = 2 * t * T[m] / (t + T[m]); num += tf * h[m]; den += tf; }
    m = n + 1; if (T[m]) { tf = 2 * t * T[m] / (t + T[m]); num += tf * h[m]; den += tf; }
    if (j > 0) { m = n - GW; if (T[m]) { tf = 2 * t * T[m] / (t + T[m]); num += tf * h[m]; den += tf; } }
    if (j < GH - 1) { m = n + GW; if (T[m]) { tf = 2 * t * T[m] / (t + T[m]); num += tf * h[m]; den += tf; } }
    if (den) h[n] += 1.9 * (num / den - h[n]);  // over-relaxed, or it takes far longer to settle
  }
  let sum = 0, cnt = 0;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const n = j * GW + i;
    if (!T[n]) continue;
    const at = m => (m >= 0 && m < GW * GH && T[m] ? h[m] : h[n]);
    const k = T[n] / D[n];
    U[n] = -k * (at(i < GW - 1 ? n + 1 : -1) - at(i > 0 ? n - 1 : -1));
    V[n] = -k * (at(n + GW) - at(n - GW));
    sum += Math.hypot(U[n], V[n]); cnt++;
  }
  const norm = cnt / sum;  // mean speed 1
  for (let n = 0; n < GW * GH; n++) {
    const s = Math.hypot(U[n], V[n]) * norm, cap = s > 2.6 ? 2.6 / s : 1;
    U[n] *= norm * cap; V[n] *= norm * cap; S[n] = s * cap;
  }
})();
const cell = (x, y) => clamp(Math.floor(y / C), 0, GH - 1) * GW + clamp(Math.floor(x / C), 0, GW - 1);
// Feeding lanes. Drift follows the water, so the food goes where most of the water goes: fast and deep.
// laneAt is 1 on the strongest thread of current across the river at that point, and near 0 in dead water.
const FLUX = new Float32Array(GW * GH), FLUXMAX = new Float32Array(GW);
for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const v = S[j * GW + i] * D[j * GW + i]; FLUX[j * GW + i] = v; if (v > FLUXMAX[i]) FLUXMAX[i] = v; }
const laneAt = (x, y) => { const n = cell(x, y), m = FLUXMAX[n % GW]; return m ? FLUX[n] / m : 0; };
let flowSpeed = FLOWS[opts.flow][1];
const fl = { u: 0, v: 0 };
function flow(x, y) {  // bilinear sample of the grid, in px/s
  const gx = clamp(x / C - .5, 0, GW - 1.001), gy = clamp(y / C - .5, 0, GH - 1.001);
  const i = Math.floor(gx), j = Math.floor(gy), a = gx - i, b = gy - j, n = j * GW + i;
  fl.u = ((U[n] * (1 - a) + U[n + 1] * a) * (1 - b) + (U[n + GW] * (1 - a) + U[n + GW + 1] * a) * b) * flowSpeed;
  fl.v = ((V[n] * (1 - a) + V[n + 1] * a) * (1 - b) + (V[n + GW] * (1 - a) + V[n + GW + 1] * a) * b) * flowSpeed;
  return fl;
}
// Keep p out of the obstacles; returns the one it's touching. With clear set, boulders get a wide enough
// berth that a trout (which can't get right up against one) can still reach p.
function pushOut(p, m, clear) {
  let hit = null;
  for (const k of solids) {
    const dx = p.x - k.x, r = clear && !k.log ? k.r * 1.25 + 5 : k.r + m;
    if (dx > r || dx < -r) continue;
    const dy = p.y - k.y, d = Math.hypot(dx, dy) || 1;
    if (d < r) { p.x = k.x + dx / d * r; p.y = k.y + dy / d * r; hit = k; }
  }
  return hit;
}
function wetPoint(margin, x0 = 0, x1 = W) {  // a random spot in the water, optionally only between x0 and x1
  x0 = clamp(x0, 0, W - 30); x1 = clamp(x1, x0 + 30, W);
  for (;;) { const x = rand(x0, x1), y = rand(0, H); if (D[cell(x, y)] && inChannel(x, y, margin)) return { x, y }; }
}
// The drift specks, foam and white water are only for looking at, so they're only kept going around the
// stretch on screen. Fish and bugs carry on everywhere.
const NEAR = 140;
const nearView = x => x > camX - NEAR && x < camX + VW + NEAR;

// ---------- holding water ----------
// A trout wants slow water to sit in, fast water alongside to bring food past, and somewhere to hide.
// Score every cell on that, keep the local best, and the biggest fish get first pick.
function describe(x, y) {
  for (const k of rocks) {
    if (Math.abs(x - k.x) > k.r + 11) continue;
    if (Math.hypot(x - k.x, y - k.y) - k.r < 11) return x > k.x ? 'in the slack behind a rock' : 'on the cushion ahead of a rock';
  }
  if (solids.some(k => k.log && Math.hypot(x - k.x, y - k.y) < 14)) return 'tucked under the log';
  const r = reachAt(x), lx = x - r.x0, [u0, u1] = ucRange(r);
  if (lx > u0 && lx < u1 && (r.flip ? y - top(x) : bot(x) - y) < 12) return 'under the cut bank';
  if (canopies.some(c => Math.hypot(x - c.x, y - c.y + c.side * (c.big ? 14 : 6)) < (c.big ? 24 : 15))) return 'under the branches';
  if (D[cell(x, y)] > .8) return 'deep in the pool';
  if (lx > 335) return 'in the tailout';
  if (lx < r.riffle[0] + 12) return 'in the riffle';
  return 'on a seam';
}
// Lies where a holding fish can't be seen from a distance: you find it by a rise, or by getting close.
const HIDING = ['tucked under the log', 'under the cut bank', 'under the branches', 'deep in the pool'];
function pickLies(score, spacing, perReach) {  // reach by reach, so every stretch gets its share and a long river stays quick to build
  const all = [];
  for (const r of reaches) all.push(...pickIn(score, spacing, perReach, Math.max(5, r.x0 / C), Math.min(GW - 9, (r.x0 + VW) / C)));
  return all.sort((a, b) => b.q - a.q);
}
function pickIn(score, spacing, count, i0, i1) {
  let cand = [];
  for (let j = 2; j < GH - 2; j++) for (let i = i0; i < i1; i++) {
    const n = j * GW + i;
    if (!D[n]) continue;
    const x = i * C + 1.5, y = j * C + 1.5, q = score(n, x, y);
    if (q > 0 && inChannel(x, y, 3) && !inSolid(x, y, 3)) cand.push({ x, y, q });
  }
  cand = cand.sort((a, b) => b.q - a.q).slice(0, 1700);
  for (const c of cand) { c.where = describe(c.x, c.y); c.hide = HIDING.includes(c.where); }
  const out = [], kinds = {};
  while (out.length < count) {  // best remaining each time, marked down if we already have plenty of its kind
    let best = null, bq = 0;
    for (const c of cand) {
      const q = c.q * Math.pow(.93, kinds[c.where] || 0);
      if (q > bq && !out.some(o => Math.abs(o.x - c.x) < spacing && Math.hypot(o.x - c.x, o.y - c.y) < spacing)) { best = c; bq = q; }
    }
    if (!best) break;
    out.push(best); kinds[best.where] = (kinds[best.where] || 0) + 1;
    // the lane this lie watches: the strongest current within about 30 px to either side of it
    const ci = Math.floor(best.x / C), j0 = Math.floor(best.y / C);
    let top = -1; best.feedY = best.y;
    for (let dj = -11; dj <= 11; dj++) {
      const j = j0 + dj;
      if (j < 0 || j >= GH) continue;
      const v = FLUX[j * GW + ci] * (1 - Math.abs(dj) / 14);
      if (v > top) { top = v; best.feedY = j * C + 1.5; }
    }
  }
  return out;
}
const lies = pickLies((n, x, y) => {
  if (D[n] < .2 || S[n] > 1) return 0;
  let near = 0;  // the fastest water within reach
  for (let dj = -4; dj <= 4; dj++) for (let di = -4; di <= 4; di++) {
    const m = n + dj * GW + di;
    if (m >= 0 && m < GW * GH && S[m] > near) near = S[m];
  }
  const where = describe(x, y), hide = where === 'on a seam' || where === 'in the tailout' || where === 'in the riffle' ? 0 : 1;
  return Math.min(near, 2.2) / 2.2 * (1 - Math.min(1, S[n] / .9)) + .5 * D[n] + .3 * hide;
}, 19, 22);
// this year's fish keep to thin, quiet water where the big ones can't follow
const fryLies = pickLies(n => (D[n] > .1 && D[n] < .34 && S[n] < .75 ? 1 - S[n] + srand() * .5 : 0), 11, 28);

const weeds = [];
for (let i = 2; i < fryLies.length; i += 9) {
  const l = fryLies[i], strands = [];
  for (let k = 0; k < 8; k++) strands.push({ x: l.x - 6 + (srand() - .5) * 10, y: l.y + (srand() - .5) * 14, l: 9 + srand() * 10, p: srand() * 6, c: srand() < .5 ? '#1f6a4a' : '#2b8a5e' });
  weeds.push({ x: l.x, strands });
}

// ---------- pre-painted layers ----------
const layer = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
const bed = layer(), veil = layer(), cover = layer(), liesLayer = layer();
(function paint() {
  const RAMP = ['#1b2c33', '#14232b', '#0e1a22', '#09131a', '#050c13', '#02060b'], BAYER = [0, .5, .75, .25];
  g = bed.getContext('2d');
  g.fillStyle = '#060b10'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!inChannel(x, y)) continue;
    const d = depth(x, y) || .3, t = clamp((d - .14) / .85, 0, 1) * (RAMP.length - 1);
    let c = RAMP[Math.min(RAMP.length - 1, Math.floor(t + BAYER[(x & 1) + (y & 1) * 2]))];
    if (d < .36) { const p = srand(); if (p < .015) c = '#3a525c'; else if (p < .09) c = '#24363f'; }  // gravel shows through thin water
    dot(x, y, c);
  }

  // Deep water is murky: this goes over the fish, so one lying in a pool is only a shadow.
  g = veil.getContext('2d');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const a = sm(.42, .95, depth(x, y)) * 4.2 + BAYER[(x & 1) + (y & 1) * 2];
    if (a >= 1) dot(x, y, `rgba(3,8,13,${Math.min(4, Math.floor(a)) * .2})`);
  }

  g = cover.getContext('2d');
  for (const k of rocks) {
    disc(k.x + 1, k.y + 2, k.r + 1, '#02050a');
    disc(k.x, k.y, k.r, '#3d4b53');
    for (const b of k.blobs) disc(k.x + b.dx, k.y + b.dy, b.r, '#3d4b53');
    disc(k.x - k.r * .25, k.y - k.r * .3, k.r * .55, '#566871');
    if (k.moss) { disc(k.x + k.r * .2, k.y + k.r * .15, k.r * .5, '#2fa37c'); disc(k.x - k.r * .1, k.y + k.r * .35, k.r * .3, '#238564'); }
  }
  const br = mulberry32(5);
  const limb = (x, y, ax, ay, n, fork) => {  // a branch, with a twig or two off it
    for (let i = 0; i < n; i++) {
      dot(x + ax * i, y + ay * i, i > n - 3 ? '#8a6a48' : '#5e4530');
      if (fork && (i === Math.floor(n * .45) || i === Math.floor(n * .75))) {
        const s = br() < .5 ? 1 : -1, c = Math.cos(.8 * s), sn = Math.sin(.8 * s);
        limb(x + ax * i, y + ay * i, ax * c - ay * sn, ax * sn + ay * c, Math.round(n * .4), false);
      }
    }
  };
  for (const log of logs) {
    for (let d = 0; d <= log.L; d += 2) disc(log.x + log.dx * d + 1, log.y + log.dy * d + 2, 3.5, '#02050a');
    for (let d = 0; d <= log.L; d += 2) disc(log.x + log.dx * d, log.y + log.dy * d, 3.2, '#4a3524');
    for (let d = 0; d <= log.L - 3; d += 1) dot(log.x + log.dx * d - 1, log.y + log.dy * d - 1, d % 9 < 6 ? '#6b4e33' : '#4a3524');
    disc(log.x + log.dx * log.L, log.y + log.dy * log.L, 2.4, '#8a6a48');
    for (const [t, s] of [[.22, 1], [.34, -1], [.45, 1], [.56, -1], [.68, 1], [.8, -1], [.9, 1], [1, -1]]) {
      const bx = log.x + log.dx * log.L * t, by = log.y + log.dy * log.L * t, lean = .35 + br() * .5;
      const ax = log.dy * s + log.dx * lean, ay = -log.dx * s + log.dy * lean, m = Math.hypot(ax, ay);
      limb(bx, by, ax / m, ay / m, 9 + Math.floor(br() * 13), true);
    }
  }
  for (let x = 0; x < W; x++) {
    const t = Math.round(top(x)), b = Math.round(bot(x));
    const rc = reachAt(x), [u0, u1] = ucRange(rc), lx = x - rc.x0;
    if (lx > u0 && lx < u1) {  // shadow of the hollowed bank
      const d = Math.round(Math.min(9, lx - u0, u1 - lx));
      g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x, rc.flip ? t : b - d, 1, d);
    }
    g.fillStyle = '#12382a'; g.fillRect(x, 0, 1, t); g.fillRect(x, b, 1, H - b);
    g.fillStyle = '#2a7a55'; g.fillRect(x, t - 1, 1, 1); g.fillRect(x, b, 1, 1);
    for (let i = 0; i < 2; i++) {  // tufts
      const yy = i ? b + 3 + srand() * (H - b - 3) : srand() * (t - 3);
      if (srand() < .5) { g.fillStyle = srand() < .5 ? '#1d5a3f' : '#0e2c21'; g.fillRect(x, Math.round(yy), 1, 2); }
    }
  }
  const dr = mulberry32(77), GRASS = ['#1d5a3f', '#2f8a5c', '#3aa873'];
  for (let x = 0; x < W; x++) {  // grass leaning out over the water's edge
    const t = Math.round(top(x)), b = Math.round(bot(x));
    for (const [edge, dir] of [[t, 1], [b, -1]]) {
      if (dr() < .55) { const n = 1 + Math.floor(dr() * 3); g.fillStyle = GRASS[Math.floor(dr() * 3)]; g.fillRect(x, dir > 0 ? edge - 1 : edge - n + 1, 1, n); }
      if (dr() < .3) dot(x, edge - dir * (3 + dr() * 9), dr() < .5 ? '#184a36' : '#0e2c21');
    }
  }
  for (let i = 0; i < 12 * REACHES; i++) {  // reed clumps standing in the margins
    const x0 = 6 + dr() * (W - 12), up = dr() < .5;
    for (let k = 0; k < 7; k++) {
      const x = Math.round(x0 + k * 1.5 + dr()), n = 4 + Math.floor(dr() * 5), e = Math.round(up ? top(x) : bot(x));
      g.fillStyle = GRASS[1 + Math.floor(dr() * 2)]; g.fillRect(x, up ? e - 2 : e - n + 2, 1, n);
      if (dr() < .4) dot(x, up ? e - 2 + n : e - n + 1, '#8a6a48');
    }
  }
  for (let i = 0; i < 16 * REACHES; i++) {  // trees back on the banks
    const x = dr() * W, up = dr() < .5, r = 6 + dr() * 6, y = up ? top(x) - r - dr() * 14 : bot(x) + r + dr() * 14;
    disc(x + 2, y + 3, r, '#0a231a');
    disc(x, y, r, '#17493a');
    for (let k = 0; k < 4; k++) disc(x + (dr() - .6) * r, y + (dr() - .6) * r, r * (.3 + dr() * .25), k % 2 ? '#23704c' : '#1c5a3e');
    dot(x - r * .3, y - r * .4, '#3a9c6a');
  }
  for (const c of canopies) for (const l of c.leaves) disc(c.x + l.dx + 2, c.y + l.dy + 3, l.r, 'rgba(0,0,0,.4)');
  for (const c of canopies) {
    for (const l of c.leaves) disc(c.x + l.dx, c.y + l.dy, l.r, '#17493a');
    for (const l of c.leaves) disc(c.x + l.dx - 1, c.y + l.dy - 1, l.r * .6, '#23704c');
    for (const l of c.leaves) dot(c.x + l.dx - 2, c.y + l.dy - 2, '#3a9c6a');
  }

  g = liesLayer.getContext('2d');  // the optional "show holding water" overlay
  lies.forEach((l, i) => ring(l.x, l.y, i < 6 * REACHES ? 5 : 3, i < 6 * REACHES ? '#e2b714' : '#8a6d2b'));
  for (const l of fryLies) dot(l.x, l.y, '#7fb685');
  g = ctx;
})();

// ---------- drift: specks, foam and white water ----------
const specks = [], foam = [], sparkles = [];
function resetSpeck(p, x0 = camX - NEAR, x1 = camX + VW + NEAR) { Object.assign(p, wetPoint(1, x0, x1)); p.life = rand(5, 14); p.b = Math.random() < .2; }
for (let i = 0; i < 440; i++) { const p = {}; resetSpeck(p, 0, VW + NEAR); p.life = rand(0, 14); specks.push(p); }
// Foam is born where the riffle's fastest tongues break, and then just rides the current — so it draws the bubble lines.
const tongues = [];
for (const r of reaches) {
  const x = r.x0 + r.riffle[1] - 16, i = Math.floor(x / C), col = [], mine = [];
  for (let j = 1; j < GH - 1; j++) { const n = j * GW + i; if (D[n] && S[n] >= S[n - GW] && S[n] >= S[n + GW]) col.push({ x, y: j * C + 1.5, s: S[n] }); }
  col.sort((a, b) => b.s - a.s);
  for (const t of col) if (mine.length < 3 && !mine.some(o => Math.abs(o.y - t.y) < 24)) mine.push(t);
  tongues.push(...mine);
}

// ---------- trout ----------
const N = 8;  // spine segments
const PROFILE = [.065, .09, .1, .096, .084, .066, .046, .03, .018];  // body half-width at each joint, as a fraction of length
// w = how often one turns up; cm = [smallest, largest]. Within a species, big ones are the rare ones.
const SPECIES = {
  yamame: { name: 'yamame', w: 40, cm: [10, 26], fill: '#5d6f5c', edge: '#c9d6c2', spot: '#1e2a20', parr: '#26342a' },
  iwana: { name: 'iwana', w: 28, cm: [14, 36], fill: '#3a4854', edge: '#9bb1c2', spot: '#eef3f5' },
  rainbow: { name: 'rainbow', w: 55, cm: [18, 58], fill: '#4c6a4b', edge: '#a5c4ac', spot: '#1b2a1e', flank: '#d98aa0' },
  brown: { name: 'brown', w: 5, cm: [22, 70], fill: '#7b5c2b', edge: '#dab66c', spot: '#23160a', spot2: '#cf4a33' },
  amemasu: { name: 'amemasu', w: 3, cm: [40, 75], fill: '#46545e', edge: '#bccad3', spot: '#f4f8fa' },
  // small stream char of the headwaters, olive with red spots
  oshorokoma: { name: 'Dolly Varden', w: 12, cm: [10, 26], fill: '#4d5e49', edge: '#bccbaa', spot: '#f0806e', spot2: '#f3e7c6' },
  // the giant: rarely seen, and never small
  ito: { name: 'itou', w: 1, cm: [60, 110], fill: '#5b4d45', edge: '#cdb9a6', spot: '#17110e', flank: '#b25a4b' },
};
const pxLen = cm => cm * .6;  // strictly to scale: a 60 cm fish is drawn twice as long as a 30 cm one
const FRY = 13;  // cm; below this a fish lives in the shallows
function pickSpecies() {
  const m = new Date().getMonth();
  const pool = Object.keys(SPECIES).filter(k => !SPECIES[k].months || SPECIES[k].months.includes(m));
  let t = Math.random() * pool.reduce((a, k) => a + SPECIES[k].w, 0);
  for (const k of pool) { if ((t -= SPECIES[k].w) <= 0) return k; }
  return pool[0];
}
const COMMON = ['yamame', 'yamame', 'yamame', 'yamame', 'yamame', 'rainbow', 'rainbow', 'rainbow', 'rainbow', 'iwana', 'iwana', 'oshorokoma'];  // the small fish: mostly yamame
// Most newcomers are this year's small fish; now and then a grown one moves in from another part of the river.
function newRecord(kind) {
  const sp = kind === 'fry' ? COMMON[Math.floor(Math.random() * COMMON.length)] : pickSpecies(), [lo, hi] = SPECIES[sp].cm;
  const cm = kind === 'fry' ? rand(6, 12) : lo + (hi - lo) * (kind === 'big' ? rand(.55, 1) : Math.pow(Math.random(), 2.6));
  return { id: store.nextId++, sp, cm, eaten: 0, fed: 0, seed: Math.floor(Math.random() * 1e9), first: today(), last: Date.now(), visits: 0 };
}
// Growth is asymptotic: quick for a young fish, then slower and slower the closer it gets to the biggest
// its species reaches. Halfway there it grows at a quarter of the rate; near the top it barely moves. With
// small fish always arriving, that keeps the average modest and a big fish a rare, old one.
function room(rec) { const [lo, hi] = SPECIES[rec.sp].cm, left = clamp(1 - (rec.cm - lo) / (hi - lo), 0, 1.2); return left * left; }
const grow = (rec, by) => { rec.cm = Math.max(rec.cm, Math.min(SPECIES[rec.sp].cm[1], rec.cm + by * room(rec))); };  // never shrinks a fish already past the usual top

// ---------- the log ----------
// Daily tallies and a rolling list of notable moments, saved with the fish. The dashboard reads these.
function tally() {
  const k = today();
  store.days = store.days || {};
  return store.days[k] || (store.days[k] = { rises: 0, taken: 0, fresh: 0, visits: 0 });
}
function note(type, rec, extra) {
  store.log = store.log || [];
  store.log.push(Object.assign({ t: Date.now(), type, id: rec.id, sp: rec.sp, cm: +rec.cm.toFixed(1) }, extra));
  if (store.log.length > 150) store.log.splice(0, store.log.length - 150);
}

const fish = [];
const holder = (l, not) => fish.find(o => o !== not && o.lie === l && !o.leaving);
// A lie is where the head sits; the body trails downstream, and it has to clear the boulders.
function fits(l, len) {
  for (let d = 0; d <= len; d += 3) if (rocks.some(k => Math.hypot(k.x - l.x - d, k.y - l.y) < k.r * 1.25 + 3)) return false;
  return true;
}
// Lists are sorted best-first. A fish takes the best water it can hold, bumping anything smaller off it.
function chooseLie(f) {
  const small = f.rec.cm < FRY, list = small ? fryLies : lies;
  const ok = list.filter(l => {
    if (l === f.lie || !fits(l, f.len)) return false;
    const h = holder(l, f);
    return !h || (!small && h.rec.cm < f.rec.cm);
  });
  let pick = ok.length ? ok[ok.length - 1] : list[Math.floor(Math.random() * list.length)];
  for (const l of ok) if (Math.random() < (small ? .15 : .5)) { pick = l; break; }
  const h = holder(pick, f);
  f.lie = pick;
  if (h && !small) { h.lie = null; chooseLie(h); h.state = 'move'; }
  return pick;
}
function place(f, swimIn) {
  chooseLie(f);
  f.x = f.lie.x; f.y = f.lie.y; f.vx = f.vy = 0; f.state = 'hold';
  if (swimIn) { f.x = f.lie.x > W / 2 ? W + f.len + rand(5, 30) : -f.len - rand(5, 30); f.y = clamp(f.lie.y + rand(-30, 30), H * .3, H * .7); f.state = 'move'; }
  for (let i = 0; i <= N; i++) { f.j[i].x = f.x + i * f.len / N; f.j[i].y = f.y; }
}
function spawn(rec, swimIn) {
  const sp = SPECIES[rec.sp], sr = mulberry32(rec.seed);
  // it has been feeding wherever it was
  delete rec.cap;  // from a short-lived version that gave each fish its own size limit
  grow(rec, (Date.now() - rec.last) / 864e5 * .05);
  rec.visits++; rec.last = Date.now();
  const f = {
    rec, sp, len: pxLen(rec.cm), lie: null, x: 0, y: 0, vx: 0, vy: 0, state: 'hold',
    t: rand(0, 100), wig: rand(0, 6), scan: rand(0, .3), moveIn: rand(60, 200), stay: rand(120, 600), target: null, wary: 0, down: 0, vis: 1, shown: 0, j: [], spots: [],
  };
  for (let i = 0; i <= N; i++) f.j.push({ x: 0, y: 0 });
  // a fish keeps its own markings; more of them show as it grows
  for (let i = 0; i < 26; i++) f.spots.push({ i: .8 + sr() * 4.8, s: sr() * 1.5 - .75, c: sp.spot2 && sr() < .3 ? sp.spot2 : sp.spot });
  place(f, swimIn);
  fish.push(f);
  return f;
}
// The fish live in data/state.json (via serve.py), with a copy in the browser in case the server isn't running.
let onDisk = false, watching = false, diskTimer = 0;
// Only one open window saves; a second one just watches until the first goes away, then takes over.
let clientId;
try { clientId = sessionStorage.getItem('blueline.client') || Math.random().toString(36).slice(2); sessionStorage.setItem('blueline.client', clientId); } catch (e) { clientId = Math.random().toString(36).slice(2); }
// keepalive lets a request outlive the page, but browsers cap those at 64 KB in total and reject anything over,
// so it's only for the last save on the way out, and only when that save is small enough.
const post = (path, body, last) => fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Client': clientId }, body, keepalive: !!last && body.length < 60000 });
let saving = false, saveAgain = false;
function toDisk(last) {
  clearTimeout(diskTimer); diskTimer = 0;
  if (watching || NOSERVER) return;
  if (saving && !last) { saveAgain = true; return; }  // one save at a time; the newest state goes next
  saving = true;
  post('api/state', JSON.stringify(store), last).then(async r => {
    onDisk = r.ok;
    if (r.status !== 409) return;
    const why = (await r.json()).error;
    if (why === 'busy') watching = true;
    else location.reload();  // the file is ahead of this window: start again from it
  }, () => { onDisk = false; }).finally(() => { saving = false; if (saveAgain) { saveAgain = false; toDisk(); } });
}
function saveFish() {
  if (watching) return;
  store.rev++;
  if (NOSERVER) return;
  save('blueline.fish', store);
  if (!diskTimer) diskTimer = setTimeout(toDisk, 1500);
  if (!$('settings').hidden) renderRoster();
}
setInterval(() => {
  if (NOSERVER) return;
  if (!watching) return toDisk();  // also tells the server this window is still here
  post('api/claim', '{}').then(r => r.json()).then(r => { if (r.ok) location.reload(); }, () => {});
}, 4000);
addEventListener('pagehide', () => { if (diskTimer) toDisk(true); });
// Fish wander in and out on their own. Usually it's one you know; sometimes it's a new face.
function arrive() {
  const here = new Set(fish.map(f => f.rec)), away = store.fish.filter(r => !here.has(r));
  // Mostly it's a fish you know. A brand-new one turns up every ten minutes or so at most, so the river fills over weeks, not hours.
  const due = Date.now() - (store.lastNew || 0) > (store.fish.length < 12 * REACHES ? 1 : 10) * 6e4;
  if (!away.length && !due) return;
  const isNew = !away.length || (due && Math.random() < .5);
  if (isNew) store.lastNew = Date.now();
  let rec;
  if (isNew) { const p = Math.random(); rec = newRecord(p < .85 ? 'fry' : p < .99 ? 'any' : 'big'); store.fish.push(rec); }
  else rec = away[Math.floor(Math.random() * away.length)];
  const days = Math.floor((Date.now() - rec.last) / 864e5), f = spawn(rec, true);
  if (isNew) { tally().fresh++; note('new', rec); } else { tally().visits++; if (days > 0) note('back', rec, { days }); }
  say(isNew ? `new fish: ${tag(f)}, ${rec.cm.toFixed(0)} cm` : `${tag(f)} is back` + (days > 0 ? ` after ${days} day${days === 1 ? '' : 's'}` : ''), 'fish');
  if (f.sp.w <= 5 || rec.cm > 40) {
    toast(isNew ? `a ${rec.cm > 40 ? 'big ' : ''}${f.sp.name} has come into the stretch`
      : `${tag(f)} is back` + (days > 0 ? ` after ${days} day${days === 1 ? '' : 's'}` : ''));
  }
  saveFish();
}
function depart(f) { say(`${tag(f)} has moved on`, 'fish'); f.leaving = true; f.exit = f.x > W / 2 ? 1 : -1; f.rec.last = Date.now(); saveFish(); }

// What falls on a Hokkaido stream, roughly by season. size = how much of a meal it is.
// general = a pattern fish will usually look at whatever they're feeding on (the mayfly, caddis and ant of any fly box).
const BUGS = {
  midge: { name: 'midge', jp: 'ユスリカ', size: 1, w: 40, months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], note: 'tiny, and there all year' },
  mayfly: { name: 'mayfly', jp: 'カゲロウ', size: 2, w: 20, months: [4, 5, 6, 7, 8], note: 'the classic spring and early-summer hatch', general: true },
  caddis: { name: 'caddis', jp: 'ヒゲナガ', size: 2, w: 20, months: [4, 5, 6, 7, 8, 9], note: 'spring to autumn; skitters across the surface', general: true },
  stonefly: { name: 'stonefly', jp: 'カワゲラ', size: 3, w: 5, months: [4, 5, 6], note: 'big, dark and clumsy; early season' },
  cicada: { name: 'cicada', jp: 'エゾハルゼミ', size: 4, w: 2, months: [4, 5, 6, 7], note: 'the spring cicada: late May and June, a whole meal' },
  ant: { name: 'ant', jp: 'アリ', size: 1, w: 15, months: [6, 7, 8], note: 'late summer, when the rivers run low', general: true },
  beetle: { name: 'beetle', jp: '甲虫', size: 2, w: 8, months: [5, 6, 7, 8, 9], note: 'summer into autumn' },
  hopper: { name: 'hopper', jp: 'バッタ', size: 3, w: 4, months: [6, 7, 8], note: 'blown in off grassy banks in summer' },
  stinkbug: { name: 'stink bug', jp: 'カメムシ', size: 2, w: 6, months: [7, 8, 9], note: 'the autumn terrestrial' },
  dragonfly: { name: 'dragonfly', jp: 'トンボ', size: 3, w: 1.5, months: [7, 8, 9], note: 'late season' },
  awafuki: { name: 'awafuki', jp: 'アワフキ', size: 1, w: 14, months: [6, 7, 8, 9], note: 'froghopper: tiny, but they can come down in numbers' },
  kususan: { name: 'kususan', jp: 'クスサン', size: 5, w: .6, months: [8, 9], note: 'giant silk moth of early autumn: rare, and a feast' },
};
const LAND_BUGS = ['ant', 'beetle', 'hopper', 'stinkbug', 'cicada', 'awafuki', 'kususan'];
const inSeason = k => BUGS[k].months.includes(new Date().getMonth());
// What the fish are keyed on right now. It shifts every so often, leaning on the time of day, and most of
// the natural drift is that bug — so you can tell by watching what's coming down and what gets eaten.
const FAVOURS = { dawn: ['midge', 'mayfly'], day: ['ant', 'beetle', 'hopper', 'stinkbug', 'cicada', 'dragonfly', 'awafuki'], dusk: ['caddis', 'mayfly', 'stonefly', 'kususan'], night: ['caddis', 'midge', 'kususan'] };
const menu = { kind: 'midge', until: 0 };
function weighted(lean) {
  const pool = Object.keys(BUGS).filter(inSeason), wt = k => BUGS[k].w * (lean && lean.includes(k) ? 3 : 1);
  let t = Math.random() * pool.reduce((a, k) => a + wt(k), 0);
  for (const k of pool) { if ((t -= wt(k)) <= 0) return k; }
  return 'midge';
}
// A hatch: one bug in numbers. While it lasts the fish key on it, the big ones most of all.
function startHatch(secs, power) {
  hatch = secs; hatchPower = power;
  menu.until = Math.max(menu.until, Date.now() + secs * 1000);
  say(`${BUGS[menu.kind].name} are coming off: a hatch`, 'fish');
}
function naturalBug() {
  if (Date.now() > menu.until) { menu.kind = weighted(FAVOURS[lightNow()]); menu.until = Date.now() + rand(8, 20) * 6e4;
    // now and then it comes off in numbers: about one change in eight, and never within 45 minutes of the last
    if (Date.now() - (store.lastHatch || 0) > 45 * 6e4 && Math.random() < .12) { store.lastHatch = Date.now(); startHatch(rand(120, 300), .7); }
  }
  return hatch > 0 || Math.random() < .65 ? menu.kind : weighted();
}
function drawBug(kind, x, y, t) {
  const flick = Math.sin(t * 9) > 0, kick = Math.sin(t * 7) > 0 ? 1 : 0;
  if (kind === 'midge') dot(x, y, '#e9dfae');
  else if (kind === 'mayfly') {
    dot(x, y, '#f6ecbc'); dot(x + 1, y, '#f6ecbc'); dot(x + 2, y, '#cfc594');
    if (flick) { dot(x, y - 1, '#bdb68e'); dot(x, y + 1, '#bdb68e'); }
  } else if (kind === 'caddis') {
    dot(x, y, '#d9b87a'); dot(x + 1, y, '#b08c55'); dot(x + 2, y, '#8f744a');
    dot(x + 1, y - 1, '#8f744a'); dot(x + 1, y + 1, '#8f744a');
  } else if (kind === 'stonefly') {
    for (let i = 0; i < 4; i++) dot(x + i, y, i ? '#6a6658' : '#d0a84a');
    if (flick) { dot(x + 1, y - 1, '#a8a391'); dot(x + 2, y + 1, '#a8a391'); } else { dot(x + 2, y - 1, '#a8a391'); dot(x + 1, y + 1, '#a8a391'); }
  } else if (kind === 'cicada') {
    for (let i = 0; i < 4; i++) { dot(x + i, y, i ? '#4d6140' : '#c98a3c'); dot(x + i, y + 1, i ? '#3a4a31' : '#c98a3c'); }
    for (const s of [-1, 2]) { dot(x + 1 + kick, y + s, '#cfe6ee'); dot(x + 2 + kick, y + s, '#cfe6ee'); dot(x + 3, y + s + Math.sign(s), '#8fb2bd'); }
  } else if (kind === 'ant') {
    dot(x, y, '#c2603a'); dot(x + 1, y, '#8a3f24');
  } else if (kind === 'beetle') {
    dot(x, y, '#2b7d63'); dot(x + 1, y, '#2b7d63'); dot(x, y + 1, '#1f5d4a'); dot(x + 1, y + 1, '#1f5d4a'); dot(x, y, '#7fe0b6');
    dot(x - 1, y + kick, '#8a8a7a');
  } else if (kind === 'hopper') {
    for (let i = -1; i <= 1; i++) dot(x + i, y, '#c9d65a');
    dot(x + 2, y, '#8fa03a');
    dot(x - 1 - kick, y - 1, '#e6ee9a'); dot(x - 1 - kick, y + 1, '#e6ee9a');
    dot(x + 1, y - 1 - kick, '#8fa03a'); dot(x + 1, y + 1 + kick, '#8fa03a');
  } else if (kind === 'stinkbug') {
    dot(x - 1, y, '#4f8a2c'); dot(x, y - 1, '#8ccf4a'); dot(x, y, '#8ccf4a'); dot(x, y + 1, '#6fae3c'); dot(x + 1, y, '#6fae3c');
    dot(x + 1, y - 1 - kick, '#4f8a2c'); dot(x + 1, y + 1 + kick, '#4f8a2c');
  } else if (kind === 'awafuki') {
    dot(x, y, '#cdb07a'); dot(x + 1, y, '#8f7446');
  } else if (kind === 'kususan') {
    for (let i = 0; i < 4; i++) dot(x + i, y, i ? '#b98a4a' : '#e6c98a');
    for (const s of [-1, 1]) {  // broad wings, each with an eye-spot
      const w = kick ? 3 : 2;
      for (let j = 1; j <= w; j++) for (let i = 0; i < 4 - (j > 2 ? 1 : 0); i++) dot(x + i + (j > 2 ? 1 : 0), y + s * j, j === 1 ? '#d7a85c' : '#c08f4a');
      dot(x + 1, y + s * 2, '#5a3a2a');
    }
  } else if (kind === 'dragonfly') {
    for (let i = 0; i < 5; i++) dot(x + i, y, i ? '#d2452f' : '#f08a5a');
    for (const s of [-1, 1]) { dot(x + 1, y + s, '#cfe6ee'); dot(x + 1 + kick, y + s * 2, '#cfe6ee'); dot(x + 2, y + s, '#9fc3cf'); }
  }
}
const bugs = [], rings = [];
// How a trout sizes up one of your flies. Small fish forgive nearly anything; a big one wants the fly in
// its lane, landed well upstream, drifting at the speed of the water, and to be what it's already eating.
function judge(f, b) {
  const cm = f.rec.cm, smart = clamp((cm - 12) / 50, 0, 1), size = BUGS[b.kind].size, eating = BUGS[menu.kind].size;
  // A fish watches its feeding lane, so a fly coming down that lane is "on line" even if the lie is off to one
  // side; and the stronger the current the fly is riding, the further off it gets noticed.
  const feedY = f.lie && f.lie.feedY !== undefined ? f.lie.feedY : f.y, inLane = b.x === undefined ? .5 : laneAt(b.x, b.y);
  const lane = (32 - 16 * smart) * (.75 + .6 * inLane),  // how far it will slide out to meet a fly
        off = Math.min(Math.abs(b.y - f.y), Math.abs(b.y - feedY));
  if (off > lane * 1.7) return { p: 0, far: true, smart };
  const checks = [
    ['it never came close enough', clamp(1.35 - off / lane, 0, 1)],
    ['it landed too close', clamp(.25 + .75 * b.age / (.3 + 1.2 * smart), .25, 1)],  // a fly needs a moment on the water first, longer for a big fish
    ['it was dragging across the current', clamp(1.3 - (b.drag || 0) / (1.4 - .6 * smart), 0, 1)],  // heavy: a clean drift costs nothing, a skating fly is nearly always refused
    [`they're on ${BUGS[menu.kind].name}`, b.kind === menu.kind ? 1 : BUGS[b.kind].general ? .85 - .25 * smart : size === eating ? .7 - .3 * smart : .45 - .3 * smart],
    // in a hatch they key on it: anything else is much less likely, and to a big fish hardly worth a look
    [`they're locked on the ${BUGS[menu.kind].name} hatch`, hatch > 0 && b.kind !== menu.kind ? (BUGS[b.kind].general ? .7 : .5) - .42 * smart : 1],
    ['it has seen too much', 1 - Math.min(1, f.wary)],
  ];
  let p = 1, why = checks[0];
  for (const c of checks) { p *= c[1]; if (c[1] < why[1]) why = c; }
  if (hatch > 0 && b.kind === menu.kind) p = Math.min(1, p * (1.3 + .5 * smart));  // ...while the right fly gets the benefit of the doubt
  return { p, why: why[0], smart };
}
function land(f, b) {  // a catch: only when a finished task has earned one
  const task = store.owed.shift(), cm = +f.rec.cm.toFixed(1);
  (f.rec.catches = f.rec.catches || []).push({ t: Date.now(), cm, bug: b.kind, task: task.text });
  const t = tally(); t.caught = (t.caught || 0) + 1;
  note('catch', f.rec, { bug: b.kind, task: task.text });
  toast(`caught ${tag(f)}, ${cm} cm — ${task.text}`);
  say(`caught ${tag(f)}, ${cm} cm — ${task.text}`, 'catch');
  showCatch(f, cm, b.kind, task.text);
  // it thrashes, is let go, and sulks for a good while
  f.state = 'spook'; f.spookT = 2.2; f.fx = clamp(f.x + rand(-50, 50), 20, W - 20); f.fy = clamp(f.y + rand(-40, 40), H * .25, H * .75);
  f.wary = 1; f.down = 120 + 300 * clamp((cm - 12) / 50, 0, 1);
  for (let i = 0; i < 3; i++) rings.push({ x: b.x, y: b.y, r: -i * 3, max: 16 + i * 4 });
  for (const o of fish) if (o !== f && Math.hypot(o.x - f.x, o.y - f.y) < 45) spookFish(o, 30 + 60 * smartness(o), f);  // the commotion clears the water round it
  status();
}
// Taking a fly isn't the same as being hooked. A small fish will have a go at a big fly but rarely gets the
// hook in its mouth; a big fish is held best by a big hook, and a tiny one tends to pull out.
function hookChance(cm, size) {
  const ideal = 1 + cm / 15;  // the fly size that suits this fish: 2 at 15 cm, 3 at 30, 5 at 60
  return clamp(.9 - .22 * Math.max(0, size - ideal) - .08 * Math.max(0, ideal - size), .1, .95);
}
function eat(f, b) {
  bugs.splice(bugs.indexOf(b), 1);
  if (b.cast && Math.random() > hookChance(f.rec.cm, b.size)) {  // it came up, and you missed it
    const ideal = 1 + f.rec.cm / 15, why = b.size > ideal + .5 ? ': too big a fly for that fish' : b.size < ideal - 1.5 ? ': too small a hook to hold it' : '';
    rings.push({ x: b.x, y: b.y, r: 1, max: 10 }, { x: b.x, y: b.y, r: -2, max: 6 });
    say(`${tag(f)} came up for your ${BUGS[b.kind].name} and wasn't hooked${why}`, 'you');
    { const day = tally(); day.missed = (day.missed || 0) + 1; }
    toast(`${tag(f)} wasn't hooked${why}`);
    spookFish(f, 12 + 80 * clamp((f.rec.cm - 12) / 50, 0, 1), b);  // feeling the hook and getting off frightens it properly
    if (cast && cast.bug === b) cast = null;
    return;
  }
  grow(f.rec, .004 * b.size * b.size);  // slow: a midge is 0.004 cm, a cicada sixteen times that
  f.rec.eaten++; f.rec.fed += b.size;
  f.shown = rand(6, 12);  // a rise gives it away for a little while
  tally().rises++;
  if (b.cast) {  // one of yours: remember who took it, and how big they were
    tally().taken++;
    f.rec.took = (f.rec.took || 0) + 1;
    f.rec.lastTook = { t: Date.now(), cm: +f.rec.cm.toFixed(1), bug: b.kind };
  }
  say(b.mine ? `${tag(f)} took the ${BUGS[b.kind].name} you dropped` : `${tag(f)} took ${b.cast ? 'your' : /^[aeiou]/.test(BUGS[b.kind].name) ? 'an' : 'a'} ${BUGS[b.kind].name}`, b.cast || b.mine ? 'you' : '');
  f.len = pxLen(f.rec.cm);
  const big = f.len > 18 || b.size > 2;
  rings.push({ x: b.x, y: b.y, r: 1, max: (big ? rand(12, 16) : rand(6, 10)) + b.size * 2 });
  if (big) rings.push({ x: b.x, y: b.y, r: -3, max: rand(7, 10) });
  const caught = b.cast && store.owed && store.owed.length > 0;
  if (caught) land(f, b);
  if (cast && cast.bug === b) cast = caught ? { phase: 'fight', t: 0, fish: f } : null;
  saveFish();
}

const SEE = 75;  // px: how close you have to be to make out a fish in cover
const LEAFY = new Uint8Array(W * H);  // water that has branches over it
for (const c of canopies) for (const l of c.leaves) {
  for (let y = Math.max(0, Math.floor(c.y + l.dy - l.r)); y <= Math.min(H - 1, Math.ceil(c.y + l.dy + l.r)); y++) {
    for (let x = Math.max(0, Math.floor(c.x + l.dx - l.r)); x <= Math.min(W - 1, Math.ceil(c.x + l.dx + l.r)); x++) if (Math.hypot(c.x + l.dx - x, c.y + l.dy - y) < l.r) LEAFY[y * W + x] = 1;
  }
}
const underLeaves = (x, y) => LEAFY[clamp(Math.round(y), 0, H - 1) * W + clamp(Math.round(x), 0, W - 1)] === 1;
function updateFish(f, dt) {
  f.t += dt;
  // In cover a holding fish is out of sight unless it has just shown itself or you're close enough to see into its lie.
  if (f.shown > 0) f.shown -= dt;
  if (f.state !== 'hold') f.shown = Math.max(f.shown, 3);
  const hidden = !f.leaving && f.lie && f.lie.hide && f.shown <= 0 && Math.hypot(f.x - angler.x, f.y - angler.y) > SEE;
  f.vis += ((hidden ? 0 : 1) - f.vis) * Math.min(1, dt * 2.5);
  let tx = f.lie.x, ty = f.lie.y, speed = 26;
  if (f.leaving) {
    tx = f.exit > 0 ? W + f.len + 60 : -f.len - 60; ty = clamp(f.y, H * .35, H * .65);
  } else if (f.state === 'hold') {
    tx += Math.sin(f.t * .5) * 2; ty += Math.sin(f.t * .31 + 2) * 2.5; speed = 10;
    f.wary = Math.max(0, f.wary - dt / (40 + 200 * clamp((f.rec.cm - 12) / 50, 0, 1)));
    if (f.down > 0) f.down -= dt;  // put down: it goes on eating naturals but won't look at a fly of yours
    if ((f.scan -= dt) <= 0) {
      f.scan = .25;
      for (const b of bugs) {
        const dx = b.x - f.x, dy = b.y - f.y, reach = (.6 + b.size * .3) * clamp(f.len / 14, .6, 1.6);
        if (b.claimed || b.gaveUp === f || dx < -50 * reach || dx > 24 * reach || Math.min(Math.abs(dy), Math.abs(b.y - f.lie.feedY)) > 24 * reach) continue;
        if (b.cast && f.down > 0) continue;
        if (!b.cast) {
          const keyed = hatch > 0 ? (b.kind === menu.kind ? 1.5 : .5 - .42 * clamp((f.rec.cm - 12) / 50, 0, 1)) : 1;  // same selectivity for the real thing
          if (b.pass && b.pass.has(f)) continue;
          if (Math.random() < .6 * keyed) { b.claimed = f; f.target = b; f.state = 'rise'; f.riseT = 0; }
          else if (keyed < 1) (b.pass = b.pass || new Set()).add(f);  // it has let this one go by, and won't change its mind
          break;
        }
        if (dx < -(12 + f.len) || (b.judged && b.judged.has(f))) continue;  // it makes up its mind as the fly arrives, not when it lands
        (b.judged = b.judged || new Set()).add(f);
        const v = judge(f, b);
        if (v.far) continue;
        f.target = b; f.riseT = 0;
        if (Math.random() < v.p) { b.claimed = f; f.state = 'rise'; }
        else {  // comes up for a look, then turns away a little warier
          f.state = 'look';
          f.wary = Math.min(1.2, f.wary + .22 + .16 * v.smart);
          f.down = Math.max(f.down, f.wary >= 1 ? 40 + 160 * v.smart : 4 + 30 * v.smart);  // a fluffed chance puts it off its food, the big ones for longest
          { const day = tally(); day.refused = (day.refused || 0) + 1; }
          toast(`${tag(f)} turned away: ${v.why}`);
          say(`${tag(f)} turned away: ${v.why}`, 'you');
        }
        break;
      }
    }
    if (f.state !== 'hold') { /* it has just gone for a fly */ }
    else if ((f.stay -= dt) <= 0) depart(f);
    else if ((f.moveIn -= dt) <= 0) { f.moveIn = rand(90, 300); chooseLie(f); f.state = 'move'; }
  } else if (f.state === 'rise') {
    const b = f.target;
    if (!bugs.includes(b)) f.state = 'move';
    else {
      tx = b.x; ty = b.y; speed = 85;
      if ((f.riseT += dt) > 5) { b.claimed = null; b.gaveUp = f; f.state = 'move'; }  // can't get to it: let it go for another fish
      if (Math.hypot(tx - f.x, ty - f.y) < 3.5) { eat(f, b); if (f.state === 'rise') f.state = 'move'; }
    }
  } else if (f.state === 'look') {
    const b = f.target;
    if (!bugs.includes(b) || (f.riseT += dt) > 3) f.state = 'move';
    else { tx = b.x; ty = b.y; speed = 40; if (Math.hypot(tx - f.x, ty - f.y) < 9) f.state = 'move'; }
  } else if (f.state === 'spook') {
    tx = f.fx; ty = f.fy; speed = 130;
    if ((f.spookT -= dt) <= 0) f.state = 'move';
  } else if (Math.hypot(tx - f.x, ty - f.y) < 3) {
    f.state = 'hold';
  }

  let dvx = (tx - f.x) * 2.5, dvy = (ty - f.y) * 2.5;
  const dv = Math.hypot(dvx, dvy);
  // a rising fish commits at full speed, or it would trail a drifting fly forever
  if (dv > speed || (f.state === 'rise' && dv > 0)) { dvx *= speed / dv; dvy *= speed / dv; }
  const ease = Math.min(1, dt * (f.state === 'spook' ? 12 : 4));
  f.vx += (dvx - f.vx) * ease; f.vy += (dvy - f.vy) * ease;
  f.x += f.vx * dt; f.y += f.vy * dt;
  // Boulders are solid (wood is on the surface, and a trout swims straight under it). When one is in the
  // way, the fish picks a side and follows the edge round, keeping to that side past the whole cluster.
  let touching = false;
  for (const k of rocks) {
    const rx = f.x - k.x, ry = f.y - k.y, rd = Math.hypot(rx, ry) || 1, m = k.r * 1.25 + 3;
    if (rd >= m) continue;
    const nx = rx / rd, ny = ry / rd;
    f.x = k.x + nx * m; f.y = k.y + ny * m;
    if (dvx * nx + dvy * ny >= 0) continue;  // already heading away from it
    if (!f.side) f.side = -ny * dvx + nx * dvy >= 0 ? 1 : -1;
    let ex = -ny * f.side, ey = nx * f.side;
    if (!inChannel(f.x + ex * 8, f.y + ey * 8, 2)) { f.side = -f.side; ex = -ex; ey = -ey; }  // no room between rock and bank
    const sp = Math.max(22, Math.min(speed, dv));
    f.x += ex * sp * dt; f.y += ey * sp * dt; f.vx = ex * sp; f.vy = ey * sp;
    touching = true;
  }
  f.clear = touching ? 0 : (f.clear || 0) + dt;
  if (f.clear > .7) f.side = 0;

  // The body trails from the head and is swept downstream by whatever current it's sitting in.
  const c = flow(f.x, f.y), seg = f.len / N, cu = c.u, cw = c.v;
  f.j[0].x = f.x; f.j[0].y = f.y;
  for (let i = 1; i <= N; i++) {
    const j = f.j[i], p = f.j[i - 1];
    j.x += (cu + 10) * dt * 2; j.y += cw * dt * 2;
    const dx = j.x - p.x, dy = j.y - p.y, d = Math.hypot(dx, dy) || 1;
    j.x = p.x + dx / d * seg; j.y = p.y + dy / d * seg;
    for (const k of rocks) {  // boulders break the surface: a fish bends round them, never under
      const rx = j.x - k.x, ry = j.y - k.y, rd = Math.hypot(rx, ry) || 1, m = k.r * 1.25 + 2;
      if (rd < m) { j.x = k.x + rx / rd * m; j.y = k.y + ry / rd * m; }
    }
  }
  // tail beats faster in quick water and for small fish
  f.wig += dt * (3 + Math.hypot(cu, cw) * .16 + Math.hypot(f.vx, f.vy) * .22) * clamp(16 / f.len, .5, 1.6);
}

const pts = [];
for (let i = 0; i <= N; i++) pts.push({ x: 0, y: 0, px: 0, py: 0, r: 0 });
function drawFish(f) {
  const sp = f.sp, amp = f.len * .05;
  for (let i = 0; i <= N; i++) {
    const a = f.j[Math.max(0, i - 1)], b = f.j[Math.min(N, i + 1)];
    const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    const off = Math.sin(f.wig - i * .85) * amp * Math.pow(i / N, 1.6);
    const p = pts[i];
    p.px = -dy / d; p.py = dx / d;
    p.x = f.j[i].x + p.px * off; p.y = f.j[i].y + p.py * off;
    p.r = PROFILE[i] * f.len;
  }
  const at = (t, o) => {  // point along the spine at fractional joint t
    const i = Math.min(N - 1, Math.floor(t)), k = t - i, a = pts[i], b = pts[i + 1];
    o.x = a.x + (b.x - a.x) * k; o.y = a.y + (b.y - a.y) * k; o.r = a.r + (b.r - a.r) * k;
    o.px = a.px; o.py = a.py;
    return o;
  };
  const q = {}, step = f.len > 40 ? .25 : .5;
  // fins first, so the body overlaps their roots
  const sh = pts[2], tl = pts[N], tdx = tl.py, tdy = -tl.px, fin = f.len < 9 ? 0 : Math.max(1, Math.round(f.len / 13));
  for (const s of [-1, 1]) {
    for (let i = 1; i <= fin; i++) dot(sh.x + sh.px * s * (sh.r + .6 + i) + tdx * i, sh.y + sh.py * s * (sh.r + .6 + i) + tdy * i, sp.edge);
    for (let i = 1; i <= fin + (fin ? 1 : 0); i++) dot(tl.x + tdx * i + tl.px * s * i * .9, tl.y + tdy * i + tl.py * s * i * .9, sp.edge);
  }
  for (let t = 0; t <= N; t += step) { at(t, q); disc(q.x, q.y, q.r + .75, sp.edge); }
  for (let t = 0; t <= N; t += step) { at(t, q); disc(q.x, q.y, q.r, sp.head && t < 1.5 ? sp.head : sp.fill); }
  if (sp.flank) for (let t = 2; t <= 5.5; t += step) { at(t, q); for (const s of [-1, 1]) dot(q.x + q.px * s * q.r, q.y + q.py * s * q.r, sp.flank); }
  if (sp.parr) for (let t = 1.5; t <= 5; t += 1) { at(t, q); for (const s of [-1, 1]) dot(q.x + q.px * s * q.r * .8, q.y + q.py * s * q.r * .8, sp.parr); }
  const nSpots = Math.min(f.spots.length, Math.round(f.len / 2.6));
  for (let i = 0; i < nSpots; i++) { const s = f.spots[i]; at(s.i, q); dot(q.x + q.px * s.s * q.r, q.y + q.py * s.s * q.r, s.c); }
}

// ---------- light + clock ----------
const TINT = {  // [darken, tint colour, tint alpha]
  dawn: [.12, '#ff9c7a', .07], day: [0, null, 0], dusk: [.2, '#b0508c', .09], night: [.5, '#0a1e46', .12],
};
const HATCH_RATE = { dawn: .25, day: .14, dusk: .45, night: .05 };  // naturals per second; dusk is the evening rise
function lightNow() {
  const m = LIGHTS[opts.light];
  if (m !== 'auto') return m;
  const h = new Date().getHours();
  return h >= 5 && h < 8 ? 'dawn' : h >= 8 && h < 17 ? 'day' : h >= 17 && h < 20 ? 'dusk' : 'night';
}
// seven-segment digits, LCD style: unlit segments stay faintly visible
const SEGS = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abfgcd'];
function digit(x, y, n) {
  const on = SEGS[n] || '', seg = (s, rx, ry, w, h) => { ctx.fillStyle = on.includes(s) ? '#c9e8b4' : '#1c4a37'; ctx.fillRect(x + rx, y + ry, w, h); };
  seg('a', 1, 0, 3, 1); seg('g', 1, 4, 3, 1); seg('d', 1, 8, 3, 1);
  seg('f', 0, 1, 1, 3); seg('b', 4, 1, 1, 3); seg('e', 0, 5, 1, 3); seg('c', 4, 5, 1, 3);
}
// 3x5 pixel letters for the date line, one bit per pixel, top row first
const FONT = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010',
  W: '101101111111101', Y: '101101010010010',
  0: '111101101101111', 1: '010110010010111', 2: '110001010100111', 3: '110001010001110', 4: '101101111001001',
  5: '111100110001110', 6: '011100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001110',
};
function text(x, y, str, c) {
  ctx.fillStyle = c;
  for (const ch of str) {
    const bits = FONT[ch];
    if (bits) for (let i = 0; i < 15; i++) if (bits[i] === '1') ctx.fillRect(x + i % 3, y + Math.floor(i / 3), 1, 1);
    x += 4;
  }
}
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
function drawClock() {
  const d = new Date(), h = d.getHours() % 12 || 12, mm = d.getMinutes(), x = VW - 46, y = 7, lit = '#c9e8b4', dim = '#1c4a37';
  ctx.fillStyle = '#0c241b'; ctx.fillRect(x - 4, y - 3, 47, 24);
  digit(x, y, h > 9 ? 1 : -1); digit(x + 7, y, h % 10); digit(x + 16, y, Math.floor(mm / 10)); digit(x + 23, y, mm % 10);
  ctx.fillStyle = d.getMilliseconds() < 500 ? lit : dim;
  ctx.fillRect(x + 13, y + 2, 1, 1); ctx.fillRect(x + 13, y + 6, 1, 1);
  text(x + 32, y + 4, d.getHours() < 12 ? 'AM' : 'PM', lit);
  text(x, y + 12, `${DAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`, '#8fb78a');
}

// ---------- the angler and the line ----------
// You fish on foot: along the banks, or wading wherever it's shallow enough. A cast only reaches so far,
// the fly only drifts until the line comes tight, and a line laid across a boulder or a log catches on it.
// Fish feel you coming, the big ones from furthest off, so where you stand and how you get there matter.
const RANGE = 185, WADE = .42;  // furthest cast in px; deepest water you can stand in
const angler = { x: 250, y: bot(250) + 5, goal: null, pending: null, face: { x: 0, y: -1 }, moving: false, wake: 0 };
let cast = null;  // { phase: 'air' | 'drift' | 'drag' | 'fight', ... }
const keys = new Set();
const onBank = (x, y) => !inChannel(x, y, 0);
function canStand(x, y) {
  if (x < 6 || x > W - 6) return false;
  if (onBank(x, y)) return y > top(x) - 12 && y < bot(x) + 12;
  return depth(x, y) < WADE && !inSolid(x, y, 2);
}
const rodTip = () => ({ x: angler.x + angler.face.x * 7, y: angler.y + angler.face.y * 7 });
function lineBlocked(a, b) {  // what the straight line from rod to fly lies across, if anything
  const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy || 1;
  for (const k of solids) {
    if (!k.log && k.r < 9) continue;  // the line rides over the small stones
    const t = clamp(((k.x - a.x) * dx + (k.y - a.y) * dy) / len2, 0, 1);
    if (Math.hypot(a.x + dx * t - k.x, a.y + dy * t - k.y) < (k.log ? 2.5 : k.r * .6)) return k.log ? 'a log' : 'a boulder';
  }
  return null;
}
function inBranches(a, b) {  // does a cast from a to b go through overhanging branches? (those right over your own head don't count)
  const dx = b.x - a.x, dy = b.y - a.y, len2 = dx * dx + dy * dy || 1;
  for (const c of canopies) if (c.big) for (const l of c.leaves) {  // only the big leaning trees; the bank fringe is low enough to cast over
    const lx = c.x + l.dx, ly = c.y + l.dy;
    if (Math.hypot(lx - a.x, ly - a.y) < 30) continue;
    const t = clamp(((lx - a.x) * dx + (ly - a.y) * dy) / len2, 0, 1);
    if (Math.hypot(a.x + dx * t - lx, a.y + dy * t - ly) < l.r * .75) return true;
  }
  return false;
}
// A frightened fish bolts from whatever scared it, and for a while afterwards won't look at a fly of yours.
function spookFish(f, secs, from) {
  if (f.leaving) return;
  const dx = f.x - from.x, dy = f.y - from.y, d = Math.hypot(dx, dy) || 1, run = rand(50, 90);
  if (f.target) f.target.claimed = null;
  f.state = 'spook'; f.spookT = rand(1.2, 2);
  f.fx = clamp(f.x + dx / d * run, 20, W - 20);
  f.fy = clamp(f.y + dy / d * run, top(f.fx) + 8, bot(f.fx) - 8);
  if (f.down <= 0) say(`${tag(f)} bolted`, 'fish');
  f.down = Math.max(f.down, secs); f.wary = 1;
}
const smartness = f => clamp((f.rec.cm - 12) / 50, 0, 1);
const slackFor = d => d * 1.35 + 34;  // line out for a cast of length d: the slack is what lets the fly drift
// Where a fly landed at (x, y) would go, and which fish would give it a chance. Shown under the cursor
// before you cast, so reading the water is something you can see rather than guess.
let aim = null, aimed = null;
function previewDrift(x, y) {
  const d0 = Math.hypot(x - angler.x, y - angler.y) || 1;
  if (d0 > RANGE) return { x, y, bad: true };
  const tip = { x: angler.x + (x - angler.x) / d0 * 7, y: angler.y + (y - angler.y) / d0 * 7 };
  if (underLeaves(x, y) || inBranches(tip, { x, y })) return { x, y, bad: true };
  const len = slackFor(Math.hypot(x - tip.x, y - tip.y)), pts = [], STEP_T = .1;
  let px = x, py = y, drag = 0, ps;
  for (let t = 0; t < 16; t += STEP_T) {
    const c = flow(px, py), sp = Math.hypot(c.u, c.v) / flowSpeed;
    drag = drag * Math.pow(.5, STEP_T / 1.5) + Math.abs(sp - (ps === undefined ? sp : ps)) * 1.2; ps = sp;
    px += c.u * STEP_T; py += c.v * STEP_T;
    if (px > W || Math.hypot(px - tip.x, py - tip.y) > len || lineBlocked(tip, { x: px, y: py })) break;
    pts.push({ x: px, y: py, t, drag });
  }
  const keen = [];
  for (const f of fish) {
    if (f.leaving || f.state !== 'hold' || f.down > 0 || f.vis < .4) continue;
    const at = pts.find(p => p.x - f.x > -(12 + f.len) && p.x - f.x < 20 && Math.abs(p.y - f.y) < 45);
    if (!at) continue;
    const v = judge(f, { x: at.x, y: at.y, age: at.t, drag: at.drag, kind: opts.bug });
    if (!v.far && v.p > .02) keen.push({ f, p: v.p * hookChance(f.rec.cm, BUGS[opts.bug].size) });
  }
  return { x, y, pts, keen };
}
function drawAim() {
  if (!opts.preview || !aim || cast || angler.goal) { aimed = null; return; }
  aimed = previewDrift(aim.x, aim.y);
  if (aimed.bad) {  // can't put a fly there from here
    for (let i = -2; i <= 2; i++) { dot(aim.x + i, aim.y + i, '#e0626e'); dot(aim.x + i, aim.y - i, '#e0626e'); }
    return;
  }
  ring(aim.x, aim.y, 2, '#f2ecd2');
  aimed.pts.forEach((p, i) => { if (i % 3 === 1) dot(p.x, p.y, '#bdb79e'); });
  for (const k of aimed.keen) {  // a mark over each fish this drift would tempt: green likely, amber possible, grey a long shot
    const c = k.p >= .5 ? '#8cc084' : k.p >= .2 ? '#e2b714' : '#7d8a8c', x = Math.round(k.f.x), y = Math.round(k.f.y) - 7;
    dot(x, y, c); dot(x - 1, y - 1, c); dot(x + 1, y - 1, c); dot(x - 2, y - 2, c); dot(x + 2, y - 2, c);
  }
}
function lift(why) {  // the drift is over: the fly skates and is picked up
  if (!cast || cast.phase !== 'drift') return;
  cast.phase = 'drag'; cast.t = 0; cast.bug.held = true; cast.bug.drag = 9;
  if (why) say(why, 'you');
}
function startCast(x, y) {
  const d0 = Math.hypot(x - angler.x, y - angler.y) || 1;
  angler.face = { x: (x - angler.x) / d0, y: (y - angler.y) / d0 };
  const tip = rodTip(), d = Math.hypot(x - tip.x, y - tip.y);
  if (cast && cast.bug) { const i = bugs.indexOf(cast.bug); if (i >= 0) bugs.splice(i, 1); }
  const day = tally(); day.casts = (day.casts || 0) + 1;
  cast = { phase: 'air', t: 0, dur: .3 + d / 420, to: { x, y }, kind: opts.bug, len: slackFor(d) };  // the slack you throw decides how far it can drift
}
function wantCast(x, y) {
  if (cast && (cast.phase === 'air' || cast.phase === 'fight')) return;
  if (Math.hypot(x - angler.x, y - angler.y) <= RANGE) { angler.goal = null; return startCast(x, y); }
  // too far. From a bank you'll walk along it to a spot a little downstream; in the water you have to wade there yourself
  const gx = clamp(x + (angler.x > x ? 1 : -1) * 40, 8, W - 8), lower = angler.y > H / 2, gy = lower ? bot(gx) + 5 : top(gx) - 5;
  if (onBank(angler.x, angler.y) && Math.hypot(x - gx, y - gy) <= RANGE) { angler.goal = { x: gx, y: gy }; angler.pending = { x, y }; }
  else toast('too far to reach from here: get closer (WASD to walk and wade, or shift-click where to stand)');
}
function stepAngler(dx, dy, dt) {  // returns false when there's nowhere to go that way
  const wet = !onBank(angler.x, angler.y), sp = (wet ? 42 : 105) * dt, d = Math.hypot(dx, dy) || 1;
  const ux = dx / d * sp, uy = dy / d * sp;
  const stone = inSolid(angler.x + ux * 4, angler.y + uy * 4, 3);  // a rock in the way: step round it
  for (const [mx, my] of stone ? [[ux, uy], [ux, 0], [0, uy], [-uy, ux], [uy, -ux]] : [[ux, uy], [ux, 0], [0, uy]]) {
    if ((mx || my) && canStand(angler.x + mx, angler.y + my)) {
      angler.x += mx; angler.y += my;
      if (onBank(angler.x, angler.y) && Math.abs(my) < Math.abs(mx)) angler.y += ((angler.y > H / 2 ? bot(angler.x) + 5 : top(angler.x) - 5) - angler.y) * .3;  // keep to the water's edge
      return true;
    }
  }
  return false;
}
let spookTick = 0;
function updateCast(dt) {
  // walking and wading
  const kx = (keys.has('d') ? 1 : 0) - (keys.has('a') ? 1 : 0), ky = (keys.has('s') ? 1 : 0) - (keys.has('w') ? 1 : 0);
  angler.moving = false;
  if (kx || ky) { angler.goal = null; angler.pending = null; angler.moving = stepAngler(kx, ky, dt); }
  else if (angler.goal) {
    const dx = angler.goal.x - angler.x, dy = angler.goal.y - angler.y;
    if (Math.hypot(dx, dy) < 2) { angler.goal = null; if (angler.pending) { startCast(angler.pending.x, angler.pending.y); angler.pending = null; } }
    else if (!(angler.moving = stepAngler(dx, dy, dt))) { angler.goal = null; angler.pending = null; say('too deep to wade any further that way', 'you'); }
  }
  if (angler.moving) {
    const cx = clamp(angler.x - VW / 2, 0, W - VW);
    if (angler.x < camX + 60 || angler.x > camX + VW - 60) { camX += (cx - camX) * Math.min(1, dt * 3); idle = 0; }  // keep yourself in view
    if (!onBank(angler.x, angler.y) && (angler.wake -= dt) <= 0) { angler.wake = .45; rings.push({ x: angler.x, y: angler.y, r: 2, max: 9 }); }
  }
  // fish notice you: from much further when you're in the water, and further still when you're moving
  if ((spookTick -= dt) <= 0) {
    spookTick = .2;
    const wet = !onBank(angler.x, angler.y), k = (wet ? 1 : .2) * (angler.moving ? 1.3 : .7);
    for (const f of fish) {
      if (f.leaving || f.state === 'spook') continue;
      // Inside `sure` it always bolts. From there out to `risk` it might, more likely the closer you are;
      // you can see into its lie from SEE, so getting a look at a hidden fish means taking that chance.
      const s = smartness(f), d = Math.hypot(f.x - angler.x, f.y - angler.y), sure = (10 + f.rec.cm * .8) * k * .6, risk = clamp(sure * 3.2, 24, SEE);
      if (d < sure || (d < risk && Math.random() < spookTick * .7 * ((risk - d) / (risk - sure)) ** 2)) spookFish(f, 15 + 90 * s, angler);
    }
  }

  if (!cast) return;
  cast.t += dt;
  const tip = rodTip();
  if (cast.phase === 'air') {
    if (cast.t < cast.dur) return;
    const { x, y } = cast.to;
    if (underLeaves(x, y) || inBranches(tip, cast.to)) {  // you can't drop a fly through leaves, only drift one in under them
      say('the fly hung up in the branches', 'you'); toast('hung up in the branches: land it in open water upstream and let it drift in under them'); cast = null; return;
    }
    cast.bug = dropBug(x, y, cast.kind, true); cast.phase = 'drift';
    say(`you cast ${/^[aeiou]/.test(BUGS[cast.kind].name) ? 'an' : 'a'} ${BUGS[cast.kind].name}`, 'you');
    for (const f of fish) if (Math.hypot(f.x - x, f.y - y) < 4) spookFish(f, 15 + 70 * smartness(f), { x, y });  // landing a fly right on its head
  } else if (cast.phase === 'drift') {
    const b = cast.bug;
    if (!bugs.includes(b)) { cast = null; return; }
    const hit = lineBlocked(tip, b);
    if (hit) lift(`the line caught on ${hit}`);
    else if (Math.hypot(b.x - tip.x, b.y - tip.y) > cast.len) lift('out of line: the fly swung round');
    else if (b.age > 16) lift();
  } else if (cast.phase === 'drag') {
    const b = cast.bug, d = Math.hypot(tip.x - b.x, tip.y - b.y) || 1;
    b.x += (tip.x - b.x) / d * 30 * dt; b.y += (tip.y - b.y) / d * 30 * dt;
    if (cast.t > .9) { const i = bugs.indexOf(b); if (i >= 0) bugs.splice(i, 1); rings.push({ x: b.x, y: b.y, r: 1, max: 4 }); cast = null; }
  } else if (cast.phase === 'fight' && cast.t > 2.4) cast = null;
}
function pixelLine(x0, y0, x1, y1, bend, c) {  // a thin line with a belly in it
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)), mx = (x0 + x1) / 2 + bend.x, my = (y0 + y1) / 2 + bend.y;
  for (let i = 0; i <= n; i++) { const t = i / (n || 1), u = 1 - t; dot(u * u * x0 + 2 * u * t * mx + t * t * x1, u * u * y0 + 2 * u * t * my + t * t * y1, c); }
}
function drawAngler() {
  const x = Math.round(angler.x), y = Math.round(angler.y), tip = rodTip(), wet = !onBank(angler.x, angler.y);
  dot(x, y - 2, '#e3d3a8'); dot(x - 1, y - 2, '#e3d3a8'); dot(x + 1, y - 2, '#e3d3a8');  // hat
  for (let i = -1; i <= 1; i++) { dot(x + i, y - 1, '#c25a3c'); dot(x + i, y, '#c25a3c'); }
  if (wet) { dot(x - 2, y + 1, '#7fa9bb'); dot(x + 2, y + 1, '#7fa9bb'); dot(x, y + 1, '#35596a'); }  // waist-deep
  else { dot(x - 1, y + 1, '#3d4b53'); dot(x + 1, y + 1, '#3d4b53'); }
  pixelLine(x, y - 1, tip.x, tip.y, { x: 0, y: 0 }, '#c9b58a');  // the rod
  if (!cast) return;
  const LINE = '#f2ecd2';
  if (cast.phase === 'air') {
    const k = clamp(cast.t / cast.dur, 0, 1), fx = tip.x + (cast.to.x - tip.x) * k, fy = tip.y + (cast.to.y - tip.y) * k;
    pixelLine(tip.x, tip.y, fx, fy, { x: -14 * Math.sin(k * Math.PI), y: -angler.face.y * 10 * Math.sin(k * Math.PI) }, LINE);  // the loop unrolling
    drawBug(cast.kind, Math.round(fx), Math.round(fy), 0);
  } else if (cast.phase === 'fight') {
    const f = cast.fish;
    pixelLine(tip.x, tip.y, f.x, f.y, { x: Math.sin(cast.t * 30) * 2, y: 0 }, LINE);
  } else {
    const b = cast.bug, slack = clamp(1 - Math.hypot(b.x - tip.x, b.y - tip.y) / cast.len, 0, 1);
    pixelLine(tip.x, tip.y, b.x, b.y, cast.phase === 'drag' ? { x: 0, y: 0 } : { x: 26 * slack, y: 0 }, LINE);  // slack bellies downstream
  }
}

// ---------- frame ----------
let hatch = 0, hatchPower = 2.4;  // seconds of hatch left, and how thick it is
let nextVisit = 15;   // seconds until another fish noses in
function dropBug(x, y, kind, cast) {
  const size = BUGS[kind].size;
  const b = { x, y, kind, size, cast, t: rand(0, 6), age: 0 };
  bugs.push(b);
  if (cast || size > 2) rings.push({ x, y, r: 1, max: 3 + size * 1.5 });
  return b;
}
function update(dt) {
  updateCast(dt);
  autoFish(dt);
  for (const p of specks) {
    const c = flow(p.x, p.y);
    p.x += c.u * dt; p.y += c.v * dt; p.s = Math.hypot(c.u, c.v) / flowSpeed;
    if ((p.life -= dt) <= 0 || !nearView(p.x) || !D[cell(p.x, p.y)]) resetSpeck(p);
  }
  // white water wherever it runs thin and fast
  for (let i = 0; i < 16 && sparkles.length < 170; i++) {
    const p = wetPoint(1, camX - NEAR, camX + VW + NEAR), n = cell(p.x, p.y);
    if (S[n] > 1.3 && D[n] < .45 && Math.random() < dt * flowSpeed * 2.5) sparkles.push({ x: p.x, y: p.y, life: rand(.15, .5), l: Math.random() < .4 ? 2 : 1 });
  }
  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.x += flowSpeed * 1.6 * dt;
    if ((s.life -= dt) <= 0) sparkles.splice(i, 1);
  }
  const live = tongues.filter(t => t.x > camX - VW * 1.3 && t.x < camX + VW + NEAR);  // riffles whose foam can reach the screen
  if (foam.length < 380 && Math.random() < dt * flowSpeed * .5 * Math.max(1, live.length / 3)) {
    const t = live[Math.floor(Math.random() * live.length)];
    if (t) foam.push({ x: t.x, y: t.y + rand(-1.5, 1.5), life: rand(25, 45), l: Math.random() < .25 ? 2 : 1 });
  }
  for (let i = foam.length - 1; i >= 0; i--) {
    const p = foam[i], c = flow(p.x, p.y);
    p.x += c.u * dt; p.y += c.v * dt + rand(-2, 2) * dt;
    pushOut(p, 1);
    p.life -= dt * (S[cell(p.x, p.y)] < .3 ? 5 : 1);  // bubbles that drift into dead water soon pop
    if (p.life <= 0 || p.x > W || p.x > camX + VW + NEAR || p.x < camX - VW * 1.4) foam.splice(i, 1);
  }

  // drift rides the main current, so the bubble lines are also where the food is
  hatch = Math.max(0, hatch - dt);
  if (Math.random() < dt * (HATCH_RATE[lightNow()] + (hatch > 0 ? hatchPower : 0)) * 2.2 * REACHES && bugs.length < 70 * REACHES) {
    const kind = naturalBug();
    if (LAND_BUGS.includes(kind) && Math.random() < .7) {  // land insects mostly fall in from the overhanging branches
      const c = canopies[Math.floor(Math.random() * canopies.length)], l = c.leaves[Math.floor(Math.random() * c.leaves.length)];
      const x = c.x + l.dx + rand(-3, 3), y = c.y + l.dy + rand(-3, 3);
      if (inChannel(x, y, 2) && !inSolid(x, y)) { dropBug(x, y, kind, false); rings.push({ x, y, r: 1, max: 3 }); }
    } else {
      const p = wetPoint(4), n = cell(p.x, p.y);
      if (p.x < W - 60 && Math.random() < S[n] * D[n] * 1.3 + .06) dropBug(p.x, p.y, kind, false);
    }
  }
  for (let i = bugs.length - 1; i >= 0; i--) {
    const b = bugs[i], c = flow(b.x, b.y);
    const sp = Math.hypot(c.u, c.v) / flowSpeed, px = b.x, py = b.y;
    if (!b.held) { b.x += c.u * dt; b.y += c.v * dt; }
    b.t += dt;
    // a fly pulled from one speed of water into another skates, and fish notice
    b.drag = (b.drag || 0) * Math.pow(.5, dt / 1.5) + Math.abs(sp - (b.ps === undefined ? sp : b.ps)) * 1.2; b.ps = sp;
    if (b.kind === 'caddis' && Math.sin(b.t * 2.3) > .8) b.y += Math.sin(b.t * 40) * 14 * dt;  // skittering
    if (b.kind === 'cicada' && Math.floor(b.t * 1.5) !== Math.floor((b.t - dt) * 1.5)) rings.push({ x: b.x + 1, y: b.y, r: 1, max: 4 });  // buzzing on the film
    const snag = pushOut(b, 1, true);
    if (snag && !snag.log) b.y += (b.y >= snag.y ? 1 : -1) * 12 * dt;  // roll off round the side of a boulder, not pin against it
    b.still = Math.abs(b.x - px) + Math.abs(b.y - py) < .02 ? (b.still || 0) + dt : 0;
    if (b.x > W + 4 || (b.age += dt) > 90 || b.still > 15) bugs.splice(i, 1);  // one that's hung up on wood eventually sinks
  }

  if ((nextVisit -= dt) <= 0) {
    nextVisit = rand(6, 20);
    if (fish.filter(f => !f.leaving).length < clamp(14 + store.fish.length * .4, 6 * REACHES, 15 * REACHES)) arrive();
  }
  for (let i = fish.length - 1; i >= 0; i--) {
    const f = fish[i];
    updateFish(f, dt);
    if (f.leaving && (f.x > W + f.len + 20 || f.x < -f.len - 20)) fish.splice(i, 1);
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    const r = rings[i], c = flow(r.x, r.y);
    r.r += 13 * dt; r.x += c.u * .5 * dt; r.y += c.v * .5 * dt;
    if (r.r > r.max) rings.splice(i, 1);
  }
}

let clock = 0;
function draw() {
  const cx = Math.round(camX), seen = (x, m) => x > cx - m && x < cx + VW + m;
  ctx.setTransform(1, 0, 0, 1, -cx, 0);  // everything below is drawn in river coordinates
  ctx.drawImage(bed, cx, 0, VW, H, cx, 0, VW, H);
  for (const p of specks) {  // quick water draws long streaks, slack water barely moves
    ctx.fillStyle = p.b ? '#5f93ab' : '#22404f';
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 1 + Math.min(4, Math.round((p.s || 0) * 1.5)), 1);
  }
  for (const s of sparkles) { ctx.fillStyle = s.life > .12 ? '#cfe6ee' : '#6c9cb0'; ctx.fillRect(Math.round(s.x), Math.round(s.y), s.l, 1); }
  for (const f of fish) if (seen(f.x, 90) && f.vis > .04) { ctx.globalAlpha = f.vis; drawFish(f); }
  ctx.globalAlpha = 1;
  for (const w of weeds) if (seen(w.x, 40)) for (const s of w.strands) {  // weed trails downstream and hides what sits in it
    for (let k = 0; k < s.l; k++) dot(s.x + k, s.y + Math.sin(clock * 1.6 + s.p - k * .45) * k * .07, k > s.l - 3 ? '#3aa873' : s.c);
  }
  ctx.drawImage(veil, cx, 0, VW, H, cx, 0, VW, H);
  for (const p of foam) { ctx.fillStyle = p.life > 4 ? '#a9c6cf' : '#56788a'; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.l, 1); }
  for (const r of rings) {
    if (r.r < 1 || !seen(r.x, 20)) continue;
    const k = r.r / r.max;
    ring(r.x, r.y, r.r, k < .4 ? '#d7ecf2' : k < .75 ? '#7fa9bb' : '#35596a');
  }
  for (const b of bugs) if (seen(b.x, 6)) drawBug(b.kind, Math.round(b.x), Math.round(b.y), b.t);
  ctx.drawImage(cover, cx, 0, VW, H, cx, 0, VW, H);
  // A fish under the branches that has shown itself, or that you're close enough to see, is drawn again
  // through the leaves: you peer in and make out the shape. Its rise rings show through too.
  for (const f of fish) {
    if (f.vis < .1 || !seen(f.x, 90) || !(underLeaves(f.x, f.y) || underLeaves(f.j[N].x, f.j[N].y))) continue;
    if (f.shown > 0 || Math.hypot(f.x - angler.x, f.y - angler.y) < SEE) { ctx.globalAlpha = .65 * f.vis; drawFish(f); }
  }
  ctx.globalAlpha = .8;
  for (const r of rings) if (r.r >= 1 && seen(r.x, 20) && underLeaves(r.x, r.y)) ring(r.x, r.y, r.r, '#d7ecf2');
  ctx.globalAlpha = 1;
  if (!STRIP) drawAngler();
  drawAim();
  if (opts.lies) ctx.drawImage(liesLayer, cx, 0, VW, H, cx, 0, VW, H);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const [dark, tint, a] = TINT[lightNow()];
  if (dark) { ctx.fillStyle = `rgba(0,0,0,${dark})`; ctx.fillRect(0, 0, VW, H); }
  if (tint) { ctx.globalAlpha = a; ctx.fillStyle = tint; ctx.fillRect(0, 0, VW, H); ctx.globalAlpha = 1; }
  drawClock();
}

// Fixed steps, so the stream runs at the same pace when the browser throttles frames.
const STEP = 1 / 30;  // thirty frames a second: plenty for pixel art, and about half the work of sixty
// The view: drag, scroll, arrow keys or the map move it; left alone, it wanders the river by itself.
let camX = 0, idle = 0, wander = 1;
function pan(to) { camX = clamp(to, 0, W - VW); idle = 0; }
let last = performance.now(), owed = 0;
function frame(now) {
  const real = Math.min(.25, (now - last) / 1000);
  if (STRIP) {  // a slow, steady drift down the river and back; at one pixel to one pixel each step is a single pixel
    camX += wander * 4 * real;
    if (camX <= 0 || camX >= W - VW) { wander = -wander; camX = clamp(camX, 0, W - VW); }
  } else if (opts.drift && (idle += real) > 15) {
    camX += wander * 6 * real;
    if (camX <= 0 || camX >= W - VW) { wander = -wander; camX = clamp(camX, 0, W - VW); }
  }
  owed = Math.min(.25, owed + (now - last) / 1000);
  last = now;
  if (owed >= STEP) {  // nothing has moved since the last picture, so don't redraw it
    for (; owed >= STEP; owed -= STEP) { update(STEP); clock += STEP; }
    draw();
  }
  if (STRIP && !stripVisible) { stripWaiting = true; return; }  // scrolled out of view: stop until it's back
  requestAnimationFrame(frame);
}
let stripVisible = true, stripWaiting = false;
if (STRIP) new IntersectionObserver(e => {
  stripVisible = e[0].isIntersecting;
  if (stripVisible && stripWaiting) { stripWaiting = false; last = performance.now(); requestAnimationFrame(frame); }
}).observe(cv);

// ---------- interface ----------
const tag = f => `#${String(f.rec.id).padStart(3, '0')} ${f.sp.name}`;
let toastTimer;
function toast(msg) {
  $('toast').textContent = msg; $('toast').classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('show'), 6000);
}
const ago = ms => ms < 36e5 ? Math.max(1, Math.round(ms / 6e4)) + 'm ago' : ms < 864e5 ? Math.round(ms / 36e5) + 'h ago' : Math.round(ms / 864e5) + 'd ago';
function renderRoster() {
  const here = new Set(fish.filter(f => !f.leaving).map(f => f.rec));
  for (const [id, head, recs] of [['rosterHere', 'In the river', store.fish.filter(r => here.has(r))], ['rosterAway', 'Elsewhere', store.fish.filter(r => !here.has(r))]]) {
    const ol = $(id);
    ol.textContent = '';
    ol.previousElementSibling.textContent = `${head} · ${recs.length}`;
    for (const r of recs.sort((a, b) => b.cm - a.cm)) {
      const li = document.createElement('li');
      const add = (cls, text) => { const c = document.createElement('span'); c.className = cls; c.textContent = text; li.append(c); return c; };
      add('sw', '').style.background = SPECIES[r.sp].fill;
      add('id', '#' + String(r.id).padStart(3, '0')); add('', SPECIES[r.sp].name);
      if (!here.has(r)) add('id', ago(Date.now() - r.last));
      add('cm', r.cm.toFixed(1) + ' cm');
      ol.append(li);
    }
  }
}
function status() {
  const n = (store.owed || []).length;
  $('status').textContent = [n ? `${n} catch${n === 1 ? '' : 'es'} owed` : '', hatch > 0 ? `${BUGS[menu.kind].name} hatch` : '',
    WEB ? '' : SANDBOX ? 'sandbox, nothing is saved' : watching ? 'open in another window, watching only' : onDisk ? '' : location.protocol === 'file:' ? 'opened as a file: use http://localhost:8790 to save' : 'not saved: is serve.py running?'].filter(Boolean).join(' · ');
}

for (const [el, list, key] of [[$('optLight'), LIGHTS, 'light'], [$('optFlow'), FLOWS.map(f => f[0]), 'flow']]) {
  list.forEach((name, i) => el.add(new Option(name, i)));
  el.value = opts[key];
  el.addEventListener('change', () => { opts[key] = Number(el.value); flowSpeed = FLOWS[opts.flow][1]; save('blueline.opts', opts); status(); });
}
$('optLies').checked = opts.lies;
$('optLies').addEventListener('change', () => { opts.lies = $('optLies').checked; save('blueline.opts', opts); });
$('optAim').checked = opts.preview;
$('optAim').addEventListener('change', () => { opts.preview = $('optAim').checked; save('blueline.opts', opts); });
$('optDrift').checked = opts.drift;
$('optDrift').addEventListener('change', () => { opts.drift = $('optDrift').checked; save('blueline.opts', opts); });
$('optHatch').addEventListener('click', () => { startHatch(25, 2.4); status(); });
$('gear').addEventListener('click', () => {
  const open = $('settings').hidden;
  $('settings').hidden = !open; $('gear').setAttribute('aria-expanded', open);
  if (open) renderRoster();
});

// ---------- the dashboard ----------
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const fishTag = r => `#${String(r.id).padStart(3, '0')} ${SPECIES[r.sp] ? SPECIES[r.sp].name : r.sp}`;
function barChart(title, days, key) {
  const box = el('section', 'chart'), max = Math.max(1, ...days.map(d => d.v[key] || 0));
  box.append(el('h3', '', title), el('div', 'ymax', String(max)));
  const plot = el('div', 'plot');
  for (const d of days) {
    const colEl = el('div', 'col'), bar = el('div', 'bar');
    bar.style.height = (d.v[key] || 0) / max * 100 + '%';
    colEl.append(bar, el('span', d.today ? 'now' : '', d.label));
    colEl.setAttribute('aria-label', `${d.long}: ${d.v[key] || 0}`);
    colEl.addEventListener('pointermove', e => {
      const tip = $('tip');
      tip.hidden = false; tip.textContent = `${d.long} · ${d.v[key] || 0}`;
      tip.style.left = Math.min(e.clientX + 12, innerWidth - tip.offsetWidth - 8) + 'px'; tip.style.top = e.clientY - 30 + 'px';
    });
    colEl.addEventListener('pointerleave', () => { $('tip').hidden = true; });
    plot.append(colEl);
  }
  box.append(plot);
  return box;
}
function renderDash() {
  const body = $('dashBody'), recs = store.fish, here = fish.filter(f => !f.leaving), t = tally();
  body.textContent = '';
  const biggest = recs.slice().sort((a, b) => b.cm - a.cm), kinds = new Set(recs.map(r => r.sp));

  const sum = (n, key) => { let a = 0; for (let i = 0; i < n; i++) { const d = new Date(Date.now() - i * 864e5), v = (store.days || {})[[d.getFullYear(), d.getMonth() + 1, d.getDate()].map(x => String(x).padStart(2, '0')).join('-')]; a += (v && v[key]) || 0; } return a; };
  const period = n => {
    const casts = sum(n, 'casts'), caught = sum(n, 'caught');
    return [['Catches', caught, casts ? `${Math.round(caught / casts * 100)}% of ${casts} casts` : 'no casts yet'], ['Refusals', sum(n, 'refused'), ''], ['Missed hooks', sum(n, 'missed'), ''],
      ['Rises', sum(n, 'rises'), ''], ['New fish', sum(n, 'fresh'), ''], ['Fish returning', sum(n, 'visits'), '']];
  };
  const allCatches = [];
  for (const r of recs) for (const c of r.catches || []) allCatches.push(Object.assign({ rec: r }, c));
  allCatches.sort((a, b) => b.t - a.t);
  const bestCatch = allCatches.slice().sort((a, b) => b.cm - a.cm)[0];
  for (const [title, items] of [
    ['Right now', [
      ['In the river', here.length, `${recs.length - here.length} elsewhere`],
      ['Fish are eating', BUGS[menu.kind].name, BUGS[menu.kind].jp],
      ['Catches owed', (store.owed || []).length, (store.owed || []).map(o => o.text).join(', ')],
    ]],
    ['Today', period(1)],
    ['Past 7 days', period(7)],
    ['All time', [
      ['Known fish', recs.length, ''],
      ['Biggest', biggest[0] ? biggest[0].cm.toFixed(1) + ' cm' : '–', biggest[0] ? fishTag(biggest[0]) : ''],
      ['Rises', recs.reduce((a, r) => a + r.eaten, 0), ''],
      ['Catches', allCatches.length, `${new Set(allCatches.map(c => c.rec.id)).size} different fish`],
      ['Biggest catch', bestCatch ? bestCatch.cm.toFixed(1) + ' cm' : '–', bestCatch ? `${fishTag(bestCatch.rec)} — ${bestCatch.task}` : 'nothing landed yet'],
      ['Species seen', `${kinds.size} of ${Object.keys(SPECIES).length}`, [...kinds].map(k => SPECIES[k].name).join(', ')],
    ]],
  ]) {
    const sec = el('section', 'period'), tiles = el('div', 'tiles');
    sec.append(el('h3', '', title));
    for (const [label, value, sub] of items) {
      const tile = el('div', 'tile');
      tile.append(el('div', 'label', label), el('div', 'value', String(value)));
      if (sub) tile.append(el('div', 'sub', sub));
      tiles.append(tile);
    }
    sec.append(tiles);
    body.append(sec);
  }

  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 864e5), k = [d.getFullYear(), d.getMonth() + 1, d.getDate()].map(n => String(n).padStart(2, '0')).join('-');
    days.push({ v: (store.days || {})[k] || { rises: 0, taken: 0, fresh: 0, visits: 0 }, label: String(d.getDate()), long: d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }), today: i === 0 });
  }
  const charts = el('div', 'charts');
  charts.append(barChart('Rises per day', days, 'rises'), barChart('Catches per day', days, 'caught'), barChart('New fish per day', days, 'fresh'));
  body.append(charts);

  const cols = el('div', 'cols');
  const table = (title, head, rows) => {
    const sec = el('section'), tb = el('table');
    sec.append(el('h3', '', title));
    const hr = el('tr'); head.forEach((h, i) => hr.append(el('th', i ? 'num' : '', h))); tb.append(hr);
    for (const row of rows) { const tr = el('tr'); row.forEach((c, i) => { const td = el('td', i ? 'num' : ''); td.append(c); tr.append(td); }); tb.append(tr); }
    sec.append(tb);
    return sec;
  };
  const named = (sp, text) => { const w = el('span', 'who'), sw = el('i'); sw.style.background = SPECIES[sp].fill; w.append(sw, text); return w; };
  cols.append(table('By species', ['', 'fish', 'biggest', 'average'], [...kinds].map(k => {
    const mine = recs.filter(r => r.sp === k);
    return [named(k, SPECIES[k].name), String(mine.length), Math.max(...mine.map(r => r.cm)).toFixed(1) + ' cm', (mine.reduce((a, r) => a + r.cm, 0) / mine.length).toFixed(1) + ' cm'];
  }).sort((a, b) => b[1] - a[1])));
  cols.append(table('Biggest fish', ['', 'size', 'bugs', 'visits'], biggest.slice(0, 8).map(r => [named(r.sp, fishTag(r)), r.cm.toFixed(1) + ' cm', String(r.eaten), String(r.visits)])));
  body.append(cols);

  // catches: the log itself, and what's been working
  const when = t => { const d = new Date(t); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); };
  const tallyBy = key => { const m = new Map(); for (const c of allCatches) { const k = key(c), v = m.get(k) || { n: 0, big: 0 }; v.n++; v.big = Math.max(v.big, c.cm); m.set(k, v); } return [...m].sort((a, b) => b[1].n - a[1].n); };
  const catchCols = el('div', 'cols');
  const logSec = table('Catches', ['', 'size', 'fly', 'when'], allCatches.slice(0, 15).map(c => {
    const who = el('span', 'catchrow');
    who.append(named(c.rec.sp, fishTag(c.rec)), el('span', 'task', c.task));
    return [who, c.cm.toFixed(1) + ' cm', BUGS[c.bug] ? BUGS[c.bug].name : c.bug, when(c.t)];
  }));
  if (!allCatches.length) logSec.append(el('p', 'empty', 'Nothing landed yet. Finish a task, then go and find a fish.'));
  const side = el('div', 'stack');
  side.append(
    table('By fly', ['', 'catches', 'biggest'], tallyBy(c => c.bug).map(([k, v]) => [BUGS[k] ? BUGS[k].name : k, String(v.n), v.big.toFixed(1) + ' cm'])),
    table('By species', ['', 'catches', 'biggest'], tallyBy(c => c.rec.sp).map(([k, v]) => [named(k, SPECIES[k].name), String(v.n), v.big.toFixed(1) + ' cm'])),
    table('Caught most often', ['', 'times', 'last'], recs.filter(r => (r.catches || []).length).sort((a, b) => b.catches.length - a.catches.length).slice(0, 5)
      .map(r => [named(r.sp, fishTag(r)), String(r.catches.length), ago(Date.now() - r.catches[r.catches.length - 1].t)])));
  catchCols.append(logSec, side);
  body.append(catchCols);

  const feed = el('section'), list = el('ul', 'feed');
  feed.append(el('h3', '', 'Recent'));
  const lines = (store.log || []).slice(-40).reverse();
  for (const e of lines) {
    const li = el('li'), when = new Date(e.t);
    const text = e.type === 'task' ? `added: ${e.text}` : e.type === 'done' ? `done: ${e.text}` + (e.n > 1 ? ` (${e.n} catches)` : '')
      : e.type === 'catch' ? `caught ${fishTag(e)}, ${e.cm} cm, on ${BUGS[e.bug] ? BUGS[e.bug].name : 'a fly'} — ${e.task}`
      : e.type === 'took' ? `${fishTag(e)} took your ${BUGS[e.bug] ? BUGS[e.bug].name : 'fly'} at ${e.cm} cm`
      : e.type === 'new' ? `new fish: ${fishTag(e)}, ${e.cm} cm`
      : `${fishTag(e)} came back after ${e.days} day${e.days === 1 ? '' : 's'}, now ${e.cm} cm`;
    li.append(el('time', '', when.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + when.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })), text);
    list.append(li);
  }
  if (!lines.length) list.append(el('li', 'empty', 'Nothing yet. New fish, returning fish and flies taken show up here.'));
  feed.append(list);
  body.append(feed);
}
let dashTimer = 0;
function toggleDash(open) {
  $('dash').hidden = !open; $('logBtn').setAttribute('aria-expanded', open);
  clearInterval(dashTimer);
  if (open) { renderDash(); dashTimer = setInterval(renderDash, 5000); }
}
$('logBtn').addEventListener('click', () => toggleDash($('dash').hidden));
$('dashClose').addEventListener('click', () => toggleDash(false));
$('dash').addEventListener('click', e => { if (e.target === $('dash')) toggleDash(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') toggleDash(false); });

const toWorld = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * VW + Math.round(camX), y: (e.clientY - r.top) / r.height * H }; };
function fishAt(x, y) {
  for (const f of fish) if (f.vis > .4) for (let i = 0; i <= N; i++) {
    if (Math.hypot(f.j[i].x - x, f.j[i].y - y) < PROFILE[i] * f.len + 3) return f;
  }
  return null;
}
let drag = null;
cv.addEventListener('pointerdown', e => { drag = { x: e.clientX, cam: camX, moved: false }; cv.setPointerCapture(e.pointerId); });
cv.addEventListener('pointercancel', () => { drag = null; });
cv.addEventListener('pointermove', e => {
  if (drag) {
    const dx = (e.clientX - drag.x) / cv.getBoundingClientRect().width * VW;
    if (Math.abs(dx) > 3) drag.moved = true;
    if (drag.moved) { pan(drag.cam - dx); $('tip').hidden = true; return; }
  }
  const p = toWorld(e), f = e.pointerType === 'mouse' ? fishAt(p.x, p.y) : null, tip = $('tip');
  aim = e.pointerType === 'mouse' && inChannel(p.x, p.y, 0) ? p : null;
  tip.hidden = !f;
  if (!f) return;
  const first = new Date(f.rec.first + 'T12:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  tip.textContent = `${tag(f)} · ${f.rec.cm.toFixed(1)} cm · `;
  const sub = document.createElement('span');
  sub.className = 'sub';
  const lc = (f.rec.catches || []).slice(-1)[0];
  sub.textContent = (f.down > 0 ? 'put down · ' : f.state === 'hold' && f.lie.where ? f.lie.where + ' · ' : '') + (lc ? `caught ${ago(Date.now() - lc.t)} at ${lc.cm} cm on “${lc.task}” · ` : '') + `${f.rec.eaten} bug${f.rec.eaten === 1 ? '' : 's'} · visit ${f.rec.visits} · first seen ${first}`;
  tip.append(sub);
  tip.style.left = Math.max(8, Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8)) + 'px';
  tip.style.top = Math.max(8, e.clientY - 30) + 'px';
});
cv.addEventListener('pointerleave', () => { $('tip').hidden = true; aim = null; });

cv.addEventListener('pointerup', e => {
  const dragged = drag && drag.moved;
  drag = null;
  const { x, y } = toWorld(e);
  if (dragged) return;
  if (!inChannel(x, y, 0) || e.shiftKey) {  // a click on a bank, or a shift-click in the shallows: go and stand there
    if (!canStand(x, y) && inChannel(x, y, 0)) return toast('too deep to stand there');
    const lower = y > H / 2;
    angler.goal = inChannel(x, y, 0) ? { x, y } : { x: clamp(x, 8, W - 8), y: lower ? bot(x) + 5 : top(x) - 5 };
    angler.pending = null;
    return;
  }
  if (rocks.some(k => Math.hypot(k.x - x, k.y - y) < k.r + 1)) return;
  if (WEB || opts.mode === 'feed' || e.altKey) {
    dropBug(x, y, opts.bug, false).mine = true; rings.push({ x, y, r: 1, max: 4 });
    say(`you dropped ${/^[aeiou]/.test(BUGS[opts.bug].name) ? 'an' : 'a'} ${BUGS[opts.bug].name}`, 'you');
    return;
  }  // a real bug, no line: just to see who's home
  wantCast(x, y);
});

// the catch card
let catchTimer;
function showCatch(f, cm, bug, task) {
  const cvs = $('catchFish'), len = Math.max(10, f.len), scale = clamp(Math.floor(200 / (len + 14)), 2, 6);
  cvs.width = Math.ceil(len) + 14; cvs.height = Math.ceil(len * .28) + 12;
  cvs.style.width = cvs.width * scale + 'px'; cvs.style.height = cvs.height * scale + 'px';
  const pose = { rec: f.rec, sp: f.sp, len, wig: 1.2, spots: f.spots, j: [] };
  for (let i = 0; i <= N; i++) pose.j.push({ x: 7 + i * len / N, y: cvs.height / 2 });
  g = cvs.getContext('2d'); g.clearRect(0, 0, cvs.width, cvs.height); drawFish(pose); g = ctx;
  $('catchName').textContent = `${tag(f)} · ${cm} cm`;
  $('catchTask').textContent = task;
  $('catchHow').textContent = `on ${BUGS[bug].name} · released`;
  $('catch').hidden = false;
  clearTimeout(catchTimer); catchTimer = setTimeout(() => { $('catch').hidden = true; }, 6000);
}
$('catch').addEventListener('click', () => { $('catch').hidden = true; });

// the fly box: pick what a click drops
function renderBox() {
  const box = $('box');
  box.textContent = '';
  for (const k of Object.keys(BUGS)) {
    const b = BUGS[k], btn = document.createElement('button'), icon = document.createElement('canvas');
    icon.width = 9; icon.height = 7;
    g = icon.getContext('2d'); drawBug(k, 3, 3, 0); g = ctx;
    btn.append(icon, b.name);
    btn.className = (k === opts.bug ? 'on' : '') + (inSeason(k) ? '' : ' off');
    btn.title = `${b.jp} · ${b.note}` + (b.general ? ' · a good all-rounder' : '') + (inSeason(k) ? '' : ' · out of season now');
    btn.setAttribute('aria-pressed', k === opts.bug);
    btn.addEventListener('click', () => { opts.bug = k; save('blueline.opts', opts); renderBox(); });
    box.append(btn);
  }
}
for (const b of document.querySelectorAll('#mode button')) {
  b.addEventListener('click', () => { opts.mode = b.dataset.mode; save('blueline.opts', opts); renderMode(); });
}
function renderMode() { for (const b of document.querySelectorAll('#mode button')) b.classList.toggle('on', b.dataset.mode === opts.mode); }
renderMode();
if (!BUGS[opts.bug]) opts.bug = 'mayfly';
renderBox();

cv.addEventListener('wheel', e => { e.preventDefault(); pan(camX + (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * .5); }, { passive: false });
addEventListener('keydown', e => {
  if ((e.target.closest && e.target.closest('input, select, textarea')) || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key === 'ArrowLeft') pan(camX - 48); else if (e.key === 'ArrowRight') pan(camX + 48);
  if ('wasd'.includes(e.key.toLowerCase()) && e.key.length === 1) keys.add(e.key.toLowerCase());
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());

// the map: the whole river, every fish in it, and a frame for what the screen is showing
const map = $('map'), mctx = map.getContext('2d'), MS = REACHES;  // the map is always one screen wide, however long the river
map.width = W / MS; map.height = H / MS;
const mapBase = document.createElement('canvas');
mapBase.width = map.width; mapBase.height = map.height;
{
  const b = mapBase.getContext('2d');
  b.drawImage(bed, 0, 0, W, H, 0, 0, map.width, map.height);
  b.drawImage(cover, 0, 0, W, H, 0, 0, map.width, map.height);
}
function drawMap() {
  mctx.drawImage(mapBase, 0, 0);
  for (const f of fish) {
    if (f.vis < .4) continue;  // the map only shows fish you can see
    mctx.fillStyle = f.sp.edge;
    mctx.fillRect(Math.round(f.x / MS), Math.round(f.y / MS), Math.max(2, Math.round(f.len / MS / 1.5)), f.len > 30 ? 2 : 1);
  }
  mctx.fillStyle = '#c25a3c'; mctx.fillRect(Math.round(angler.x / MS) - 1, Math.round(angler.y / MS) - 1, 3, 3);  // where you're standing
  mctx.strokeStyle = '#e2b714'; mctx.lineWidth = 1;
  mctx.strokeRect(Math.round(camX / MS) + .5, .5, VW / MS - 1, H / MS - 1);
}
const mapPan = e => { const r = map.getBoundingClientRect(); pan((e.clientX - r.left) / r.width * W - VW / 2); };
map.addEventListener('pointerdown', e => { map.setPointerCapture(e.pointerId); mapPan(e); });
map.addEventListener('pointermove', e => { if (e.buttons) mapPan(e); });
setInterval(drawMap, 150);

// ---------- today's tasks ----------
// The list is today's Obsidian daily note: boxes ticked there show up here, and boxes ticked or added
// here are written there. Finishing one earns a catch. Without a vault, the page keeps its own list.
let tasks = [], linked = false;
const send = (path, body) => post(path, JSON.stringify(body)).then(r => r.json()).catch(() => ({ ok: false }));
function credit(key, text, n) {  // once per task per day, however many times it's unticked and ticked
  store.credited = store.credited || {};
  if (watching || store.credited[key]) return false;
  store.credited[key] = Date.now();
  for (let i = 0; i < n; i++) store.owed.push({ text, t: Date.now() });
  (store.log = store.log || []).push({ t: Date.now(), type: 'done', text, n });
  say(`done: ${text}`, 'you');
  saveFish(); status();
  return true;
}
// Something big, like a day's Japanese: three catches, a hatch, and a good fish moves in.
function bigReward(key, text) {
  if (!credit(key, text, 3)) return;
  startHatch(40, 2.4);
  const rec = newRecord('big');
  store.fish.push(rec); tally().fresh++; note('new', rec);
  spawn(rec, true);
  toast(`${text}: three catches owed, a hatch is on, and something big has moved in`);
  say(`a ${rec.cm.toFixed(0)} cm ${SPECIES[rec.sp].name} has moved into the river`, 'fish');
  saveFish();
}
function renderTasks() {
  const ul = $('tasks');
  ul.textContent = '';
  for (const t of tasks) {
    const li = el('li', t.done ? 'done' : ''), lab = el('label'), cb = el('input');
    cb.type = 'checkbox'; cb.checked = t.done;
    cb.addEventListener('change', async () => {
      t.done = cb.checked;
      if (linked && !NOSERVER) await send('api/tasks', { toggle: t.text, done: t.done });
      else { store.tasks = tasks; saveFish(); }
      syncTasks();
    });
    lab.append(cb, el('span', '', t.text));
    li.append(lab); ul.append(li);
  }
  $('tasksNote').textContent = SANDBOX ? 'sandbox list' : linked ? 'from today’s Obsidian note' : 'not linked to Obsidian';
}
async function syncTasks() {
  if (!NOSERVER) {
    const d = await fetch('api/tasks').then(r => r.json()).catch(() => null);
    linked = !!(d && d.ok);
    if (linked) tasks = d.tasks;
  }
  for (const t of tasks) if (t.done) credit(`${today()}|${t.text}`, t.text, 1) && toast(`done: ${t.text} — one catch owed`);
  if (!$('tasks').contains(document.activeElement)) renderTasks();
}
async function syncStudy() {
  if (NOSERVER || watching) return;
  const d = await fetch('api/study').then(r => r.json()).catch(() => null);
  if (d && d.ok && d.count >= 50) bigReward(`${today()}|japanese`, `Japanese: ${d.count} cards today`);
}
$('creel').addEventListener('submit', async e => {
  e.preventDefault();
  const text = $('creelText').value.trim().replace(/\s+/g, ' ');
  if (watching) return toast('this window is only watching: use the other one');
  if (!text) return;
  $('creelText').value = '';
  if (linked && !NOSERVER) await send('api/tasks', { add: text });
  else { tasks.push({ text, done: false }); store.tasks = tasks; saveFish(); }
  (store.log = store.log || []).push({ t: Date.now(), type: 'task', text });
  say(`added: ${text}`, 'you');
  syncTasks();
});

// ---------- the feed: one line for everything that happens on the river ----------
const feedLines = [];
function say(text, kind) {
  feedLines.unshift({ t: new Date(), text, kind });
  if (feedLines.length > 40) feedLines.pop();
  const ul = $('feed');
  if (!ul) return;
  const li = el('li', kind || '');
  li.append(el('time', '', feedLines[0].t.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }).replace(/ ?[AP]M/i, '')), text);
  ul.prepend(li);
  while (ul.children.length > 40) ul.lastChild.remove();
}

// Keep the screen as big as the window allows: on a wide window the map, creel and fly box sit beside
// it, on a narrow one they go underneath.
// ---------- idle angler (kiosk) ----------
// Picks a fish it can see, walks the bank to a spot with a good drift to it, and casts whatever the fish are
// eating. With a catch owed it keeps at it every few seconds; otherwise it fishes now and then, for the look of it.
let autoNext = 6;
function autoFish(dt) {
  if (!KIOSK || cast || angler.goal || watching) return;
  if ((autoNext -= dt) > 0) return;
  const owing = (store.owed || []).length > 0;
  autoNext = owing ? rand(5, 9) : rand(35, 80);
  const pool = fish.filter(f => f.state === 'hold' && !f.leaving && f.down <= 0 && f.vis > .4 && f.rec.cm >= 11 && f.x > camX + 30 && f.x < camX + VW - 30);
  if (!pool.length) return;
  const target = pool[Math.floor(Math.random() * pool.length)];
  opts.bug = inSeason(menu.kind) ? menu.kind : 'caddis';
  const home = { x: angler.x, y: angler.y };
  let best = null;
  for (const lower of [true, false]) for (const off of [70, 30, -20, 110]) {
    const sx = clamp(target.x + off, 8, W - 8), sy = lower ? bot(sx) + 5 : top(sx) - 5;
    if (!canStand(sx, sy)) continue;
    angler.x = sx; angler.y = sy;
    for (let dx = -25; dx >= -85; dx -= 20) for (let dy = -16; dy <= 16; dy += 8) {
      const pv = previewDrift(target.x + dx, target.y + dy), k = !pv.bad && pv.keen.find(q => q.f === target);
      if (k && (!best || k.p > best.p)) best = { p: k.p, sx, sy, tx: target.x + dx, ty: target.y + dy };
    }
  }
  angler.x = home.x; angler.y = home.y;
  if (!best || best.p < .15) return;
  angler.goal = { x: best.sx, y: best.sy }; angler.pending = { x: best.tx, y: best.ty };
}

function fit() {
  if (STRIP) { cv.style.width = VW + 'px'; cv.style.height = H + 'px'; return; }
  if (KIOSK) {  // the river at the biggest whole-number scale that leaves room for the list beside it
    const s = Math.max(1, Math.floor(Math.min((innerWidth - 300) / VW, innerHeight / H)));
    document.querySelector('.pad').classList.add('wide');
    cv.style.width = VW * s + 'px'; cv.style.height = H * s + 'px';
    return;
  }
  const vh = innerHeight - (WEB ? 56 : 0);  // on the blog, the site header takes the top of the window
  const beside = Math.floor(Math.min((innerWidth - 60 - 336) / VW, (vh - 96) / H));
  const below = Math.floor(Math.min((innerWidth - 60) / VW, (vh - 300) / H));
  const wide = beside >= below && beside >= 1;
  let s = Math.max(1, wide ? beside : below);
  if (WEB && innerWidth - 38 < VW * s) s = (innerWidth - 38) / VW;  // a phone is narrower than one river: shrink to fit
  document.querySelector('.pad').classList.toggle('wide', wide);
  cv.style.width = VW * s + 'px'; cv.style.height = H * s + 'px';
}
addEventListener('resize', fit);
fit();

(async function boot() {
  if (!NOSERVER) try {  // whichever copy has seen more of the stream's history wins
    const r = await fetch('api/state'), disk = r.ok ? await r.json() : null;
    onDisk = r.ok;
    if (disk && Array.isArray(disk.fish) && disk.fish.length && (disk.rev || 0) >= (store.rev || 0)) Object.assign(store, disk);
  } catch (e) { /* no server: carry on from the browser's copy */ }
  if (!store.fish.length) {  // a new stream: mostly small fish, a few grown ones, one good one
    for (let i = 0; i < 12 * REACHES; i++) store.fish.push(newRecord(i % 12 < 7 ? 'fry' : i % 12 < 11 || i > 12 ? 'any' : 'big'));
  }
  store.fish = store.fish.filter(r => SPECIES[r.sp]);  // drop any species that's no longer in the river
  for (const r of store.fish) { r.first = r.first || r.since || today(); r.last = r.last || Date.now(); r.visits = r.visits || 0; }
  store.owed = store.owed || [];
  store.lastHatch = store.lastHatch || Date.now();
  if (store.log && store.log.length > 150) store.log = store.log.filter(e => e.type !== 'took').slice(-150);
  store.credited = store.credited || {};
  for (const k of Object.keys(store.credited)) if (Date.now() - store.credited[k] > 14 * 864e5) delete store.credited[k];
  if (store.tasks) tasks = store.tasks;
  for (const r of [...store.fish].sort(() => Math.random() - .5).slice(0, 7 * REACHES)) spawn(r, false);
  saveFish();
  status();
  setInterval(status, 500);
  syncTasks(); setInterval(syncTasks, 3000);
  syncStudy(); setInterval(syncStudy, 20000);
  requestAnimationFrame(frame);
})();
window.blueline = { fish, store, lies, fryLies, foam, bugs, grid: { C, GW, GH, D, S }, pan, menu, judge, angler, wantCast, get cast() { return cast; }, rocks, hookChance, previewDrift, laneAt, get hatch() { return hatch; }, set hatch(v) { hatch = v; }, skip: secs => { for (let t = 0; t < secs; t += STEP) update(STEP); } };  // for poking at from the console
})();
