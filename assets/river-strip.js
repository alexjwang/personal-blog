// The river strip at the bottom of the home page: two banks, the current drifting past, a few trout holding
// or swimming up, the odd rise. Clicking it opens blueline.
// Light theme: a black-and-white sketch. Dark theme (--strip-style: game): the same scene drawn with blueline's
// own artwork, ported from its stream.js: depth-dithered water, grassy banks, drift specks, and its trout.
(function () {
  const cv = document.getElementById('river-strip');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  let mode = '', P = 3, H = 22, HEIGHT = 66, W = 0, dpr = 1, g = ctx, bed = null, t = 0;
  let fish = [], drift = [], rings = [];
  const game = () => mode === 'game';

  // ---------- pixel helpers (as in blueline) ----------
  function dot(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); }
  function span(x, y, w, c) { g.fillStyle = c; g.fillRect(Math.round(x) * P, Math.round(y) * P, w * P, P); }
  function disc(cx, cy, r, c) {
    const x0 = Math.round(cx), y0 = Math.round(cy), ri = Math.ceil(r);
    for (let dy = -ri; dy <= ri; dy++) {
      const h = r * r - dy * dy;
      if (h < 0) continue;
      const w = Math.floor(Math.sqrt(h) + 0.35);
      span(x0 - w, y0 + dy, 2 * w + 1, c);
    }
  }
  function ring(cx, cy, r, c) {
    cx = Math.round(cx); cy = Math.round(cy);
    let x = Math.round(r), y = 0, e = 1 - x;
    while (x >= y) {
      for (const [a, b] of [[x, y], [-x, y], [x, -y], [-x, -y], [y, x], [-y, x], [y, -x], [-y, -x]]) dot(cx + a, cy + b, c);
      y++;
      if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
    }
  }
  function seeded(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let q = Math.imul(a ^ a >>> 15, 1 | a); q = q + Math.imul(q ^ q >>> 7, 61 | q) ^ q; return ((q ^ q >>> 14) >>> 0) / 4294967296; }; }

  // ---------- the light sketch ----------
  const SKETCH = [
    ['...####....', '.########.#', '##########.', '.########.#', '...##......'],
    ['...####....', '.#########.', '###########', '.#########.', '...##......'],
  ];

  // ---------- blueline's river ----------
  const SPECIES = [  // from blueline's SPECIES table
    { fill: '#5d6f5c', edge: '#c9d6c2', spot: '#1e2a20', parr: '#26342a', cm: [16, 26] },   // yamame
    { fill: '#3a4854', edge: '#9bb1c2', spot: '#eef3f5', cm: [18, 34] },                     // iwana
    { fill: '#4c6a4b', edge: '#a5c4ac', spot: '#1b2a1e', flank: '#d98aa0', cm: [22, 40] },   // rainbow
    { fill: '#4d5e49', edge: '#bccbaa', spot: '#f0806e', spot2: '#f3e7c6', cm: [16, 26] },   // Dolly Varden
    { fill: '#7b5c2b', edge: '#dab66c', spot: '#23160a', spot2: '#cf4a33', cm: [26, 42] },   // brown
  ];
  const N = 8, PROFILE = [.065, .09, .1, .096, .084, .066, .046, .03, .018];
  const RAMP = ['#1b2c33', '#14232b', '#0e1a22', '#09131a', '#050c13', '#02060b'], BAYER = [0, .5, .75, .25];
  const GRASS = ['#1d5a3f', '#2f8a5c', '#3aa873'];
  const TOP = 4, BOT = () => H - 5;      // water between these rows

  const FLOW = 14;                       // the current, art px per second, left to right
  const lieAt = (len, x) => ({ x: x === undefined ? rand(len, W - len) : x, y: rand(TOP + 5, BOT() - 5) });
  function newFish(i, swimIn) {
    const sp = SPECIES[i % SPECIES.length], cm = rand(sp.cm[0], sp.cm[1]), len = cm * .6, sr = seeded(i * 97 + 13 + Math.floor(rand(0, 1e4))), spots = [];
    for (let k = 0; k < 26; k++) spots.push({ i: .8 + sr() * 4.8, s: sr() * 1.5 - .75, c: sp.spot2 && sr() < .3 ? sp.spot2 : sp.spot });
    const lie = lieAt(len), f = { sp, len, spots, lie, t: rand(0, 50), wig: rand(0, 6), vx: 0, vy: 0, state: 'hold',
      moveIn: rand(8, 25), riseIn: rand(6, 30), stay: rand(40, 120), j: [] };
    f.x = swimIn ? W + len + rand(4, 30) : lie.x; f.y = lie.y;
    if (swimIn) f.state = 'move';
    for (let k = 0; k <= N; k++) f.j.push({ x: f.x + k * len / N, y: f.y });
    return f;
  }

  // blueline's updateFish, without the angler, bugs or rocks: hold a lie with a little sway, now and then move
  // to another, rise to something on the surface, or move on downstream and out of the strip
  function updateFish(f, dt) {
    f.t += dt;
    let tx = f.lie.x, ty = f.lie.y, speed = 26;
    if (f.state === 'leave') { tx = W + f.len + 60; ty = f.y; speed = 30; }
    else if (f.state === 'hold') {
      tx += Math.sin(f.t * .5) * 2; ty += Math.sin(f.t * .31 + 2) * 2.5; speed = 10;
      if ((f.stay -= dt) <= 0) f.state = 'leave';
      else if ((f.riseIn -= dt) <= 0) { f.riseIn = rand(10, 40); f.state = 'rise'; f.rise = { x: f.x - rand(6, 16), y: f.y + rand(-4, 4), t: 0 }; }
      else if ((f.moveIn -= dt) <= 0) { f.moveIn = rand(15, 40); f.lie = lieAt(f.len, Math.max(f.len, Math.min(W - f.len, f.x + rand(-60, 60)))); f.state = 'move'; }
    } else if (f.state === 'rise') {
      tx = f.rise.x; ty = f.rise.y; speed = 85;
      if (Math.hypot(tx - f.x, ty - f.y) < 3.5 || (f.rise.t += dt) > 3) {
        rings.push({ x: f.x, y: f.y, r: 1, max: f.len > 20 ? rand(9, 12) : rand(5, 8) }, { x: f.x, y: f.y, r: -3, max: rand(4, 6) });
        f.state = 'move';
      }
    } else if (Math.hypot(tx - f.x, ty - f.y) < 3) f.state = 'hold';
    let dvx = (tx - f.x) * 2.5, dvy = (ty - f.y) * 2.5;
    const dv = Math.hypot(dvx, dvy);
    if (dv > speed || (f.state === 'rise' && dv > 0)) { dvx *= speed / dv; dvy *= speed / dv; }
    const ease = Math.min(1, dt * 4);
    f.vx += (dvx - f.vx) * ease; f.vy += (dvy - f.vy) * ease;
    f.x += f.vx * dt; f.y = Math.max(TOP + 2, Math.min(BOT() - 2, f.y + f.vy * dt));
    // the body trails from the head and is swept downstream by the current
    const seg = f.len / N;
    f.j[0].x = f.x; f.j[0].y = f.y;
    for (let i = 1; i <= N; i++) {
      const j = f.j[i], p = f.j[i - 1];
      j.x += (FLOW + 10) * dt * 2;
      const dx = j.x - p.x, dy = j.y - p.y, d = Math.hypot(dx, dy) || 1;
      j.x = p.x + dx / d * seg; j.y = p.y + dy / d * seg;
    }
    // tail beats faster in quick water and for small fish
    f.wig += dt * (3 + FLOW * .16 + Math.hypot(f.vx, f.vy) * .22) * Math.max(.5, Math.min(1.6, 16 / f.len));
  }

  // drawFish from blueline, with the spine laid straight along the current (head upstream, to the left)
  const pts = Array.from({ length: N + 1 }, () => ({}));
  function drawFish(f) {
    const sp = f.sp, amp = f.len * .05;
    for (let i = 0; i <= N; i++) {
      const a = f.j[Math.max(0, i - 1)], b = f.j[Math.min(N, i + 1)];
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      const off = Math.sin(f.wig - i * .85) * amp * Math.pow(i / N, 1.6), p = pts[i];
      p.px = -dy / d; p.py = dx / d;
      p.x = f.j[i].x + p.px * off; p.y = f.j[i].y + p.py * off; p.r = PROFILE[i] * f.len;
    }
    const at = (s, o) => {
      const i = Math.min(N - 1, Math.floor(s)), k = s - i, a = pts[i], b = pts[i + 1];
      o.x = a.x + (b.x - a.x) * k; o.y = a.y + (b.y - a.y) * k; o.r = a.r + (b.r - a.r) * k; o.px = a.px; o.py = a.py;
      return o;
    };
    const q = {}, step = f.len > 40 ? .25 : .5;
    const sh = pts[2], tl = pts[N], tdx = tl.py, tdy = -tl.px, fin = f.len < 9 ? 0 : Math.max(1, Math.round(f.len / 13));
    for (const s of [-1, 1]) {
      for (let i = 1; i <= fin; i++) dot(sh.x + sh.px * s * (sh.r + .6 + i) + tdx * i, sh.y + sh.py * s * (sh.r + .6 + i) + tdy * i, sp.edge);
      for (let i = 1; i <= fin + (fin ? 1 : 0); i++) dot(tl.x + tdx * i + tl.px * s * i * .9, tl.y + tdy * i + tl.py * s * i * .9, sp.edge);
    }
    for (let s = 0; s <= N; s += step) { at(s, q); disc(q.x, q.y, q.r + .75, sp.edge); }
    for (let s = 0; s <= N; s += step) { at(s, q); disc(q.x, q.y, q.r, sp.fill); }
    if (sp.flank) for (let s = 2; s <= 5.5; s += step) { at(s, q); for (const d of [-1, 1]) dot(q.x + q.px * d * q.r, q.y + q.py * d * q.r, sp.flank); }
    if (sp.parr) for (let s = 1.5; s <= 5; s += 1) { at(s, q); for (const d of [-1, 1]) dot(q.x + q.px * d * q.r * .8, q.y + q.py * d * q.r * .8, sp.parr); }
    const nSpots = Math.min(f.spots.length, Math.round(f.len / 2.6));
    for (let i = 0; i < nSpots; i++) { const s = f.spots[i]; at(s.i, q); dot(q.x + q.px * s.s * q.r, q.y + q.py * s.s * q.r, s.c); }
  }

  // the still part: the bed (depth-dithered water, gravel in the shallows), banks with grass, reeds and trees
  function paintBed() {
    const o = document.createElement('canvas'); o.width = W * P; o.height = H * P;
    const keep = g; g = o.getContext('2d');
    const r = seeded(77), top = x => TOP + Math.round(.8 * Math.sin(x * .09) + .6 * Math.sin(x * .23 + 1)), bot = x => BOT() + Math.round(.8 * Math.sin(x * .07 + 2) + .6 * Math.sin(x * .19));
    span(0, 0, W, '#060b10'); g.fillStyle = '#060b10'; g.fillRect(0, 0, W * P, H * P);
    for (let x = 0; x < W; x++) {
      const a = top(x), b = bot(x);
      for (let y = 0; y < H; y++) {
        if (y < a || y > b) { dot(x, y, '#12382a'); continue; }
        const d = Math.min(y - a, b - y) / ((b - a) / 2), tt = Math.max(0, Math.min(1, (d - .14) / .85)) * (RAMP.length - 1);
        let c = RAMP[Math.min(RAMP.length - 1, Math.floor(tt + BAYER[(x & 1) + (y & 1) * 2]))];
        if (d < .36) { const p = r(); if (p < .015) c = '#3a525c'; else if (p < .09) c = '#24363f'; }   // gravel through thin water
        dot(x, y, c);
      }
      dot(x, a - 1, '#2a7a55'); dot(x, b + 1, '#2a7a55');
      for (const [edge, dir] of [[a, 1], [b, -1]]) {                                                   // grass leaning over the edge
        if (r() < .55) { const n = 1 + Math.floor(r() * 3), c = GRASS[Math.floor(r() * 3)]; for (let k = 0; k < n; k++) dot(x, dir > 0 ? edge - 1 + k * 0 : edge + 1 - k * 0, c); if (n > 1) dot(x, dir > 0 ? edge : edge, c); }
      }
    }
    for (let i = 0; i < W / 40; i++) {                                                                 // reed clumps in the margins
      const x0 = 4 + r() * (W - 8), up = r() < .5;
      for (let k = 0; k < 5; k++) {
        const x = Math.round(x0 + k * 1.5 + r()), n = 2 + Math.floor(r() * 3), e = up ? top(x) : bot(x);
        for (let m = 0; m < n; m++) dot(x, up ? e - 1 + m : e + 1 - m, GRASS[1 + Math.floor(r() * 2)]);
        if (r() < .4) dot(x, up ? e - 1 + n : e + 1 - n, '#8a6a48');
      }
    }
    for (let i = 0; i < W / 14; i++) {                                                                 // trees back on the banks, just peeking in
      const x = r() * W, up = r() < .5, rad = 4 + r() * 4, y = up ? -rad * .35 : H - 1 + rad * .35;
      disc(x + 1, y + 1.5, rad, '#0a231a'); disc(x, y, rad, '#17493a');
      for (let k = 0; k < 4; k++) disc(x + (r() - .6) * rad, y + (r() - .6) * rad, rad * (.3 + r() * .25), k % 2 ? '#23704c' : '#1c5a3e');
      dot(x - rad * .3, y - rad * .4, '#3a9c6a');
    }
    g = keep;
    return o;
  }

  function fit() {
    mode = getComputedStyle(cv).getPropertyValue('--strip-style').trim() || 'sketch';
    HEIGHT = game() ? 144 : 66;            // css px: the dark river is taller, the light sketch stays slim
    P = game() ? 2 : 3; H = Math.round(HEIGHT / P);
    dpr = window.devicePixelRatio || 1;
    cv.style.height = HEIGHT + 'px';
    const w = cv.clientWidth;
    if (!w) { W = 0; return; }
    cv.width = w * dpr; cv.height = HEIGHT * dpr;
    W = Math.floor(w / P);
    fish = []; drift = []; rings = [];
    if (game()) {
      for (let i = 0; i < 6; i++) fish.push(newFish(i));
      for (let i = 0; i < 140; i++) drift.push({ x: rand(0, W), y: rand(TOP + 1, BOT() - 1), v: rand(4, 10), b: Math.random() < .2, life: rand(0, 14) });
      bed = paintBed();
    } else {
      for (let i = 0; i < 5; i++) fish.push({ x: rand(0, W), y: Math.round(rand(3, H - 8)), v: rand(.02, .08), ph: rand(0, 6), hold: Math.random() < .5 });
      for (let i = 0; i < 40; i++) drift.push({ x: rand(0, W), y: Math.floor(rand(1, H - 1)), len: Math.round(rand(2, 6)), v: rand(.15, .35) });
    }
  }

  function draw() {
    if (!W) return;
    g = ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W * P, H * P);
    if (game()) {
      ctx.drawImage(bed, 0, 0);
      for (const p of drift) { g.fillStyle = p.b ? '#5f93ab' : '#22404f'; g.fillRect(Math.round(p.x) * P, Math.round(p.y) * P, (1 + Math.min(4, Math.round(p.v / 4))) * P, P); }
      for (const r of rings) { const k = r.r / r.max; ring(r.x, r.y, r.r, k < .4 ? '#d7ecf2' : k < .75 ? '#7fa9bb' : '#35596a'); }
      for (const f of fish) drawFish(f);
    } else {
      for (let x = 0; x < W; x += 2) { dot(x, 0, '#e8e8e8'); dot(x + 1, H - 1, '#e8e8e8'); }   // banks
      for (const d of drift) for (let i = 0; i < d.len; i++) dot((d.x + i) % W, d.y, '#dcdcdc');
      for (const r of rings) {
        const k = Math.round(r.age * 6), shade = r.age < .5 ? '#bdbdbd' : '#dedede';
        for (let a = 0; a < 16; a++) dot(r.x + Math.cos(a / 16 * 6.283) * k * 1.6, r.y + Math.sin(a / 16 * 6.283) * k * .8, shade);
      }
      for (const f of fish) {
        SKETCH[Math.floor(f.ph) % 2].forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch === '#') dot(f.x + rx, f.y + ry, '#111'); }));
        dot(f.x + 1, f.y + 2, '#fff');
      }
    }
  }

  function step(dt) {
    t++;
    if (game()) {
      for (const p of drift) { p.x += p.v * dt; if ((p.life -= dt) <= 0 || p.x > W) { p.x = rand(0, W); p.y = rand(TOP + 1, BOT() - 1); p.life = rand(5, 14); } }
      fish.forEach((f, i) => { updateFish(f, dt); if (f.state === 'leave' && f.x > W + f.len + 20) fish[i] = newFish(i + Math.floor(rand(0, 5)), true); });
      for (const r of rings) { r.r += 13 * dt; r.x += FLOW * .5 * dt; }
      rings = rings.filter(r => r.r <= r.max);
    } else {
      for (const d of drift) { d.x += d.v; if (d.x > W) { d.x = -d.len; d.y = Math.floor(rand(1, H - 1)); } }
      for (const f of fish) {
        f.ph += .08;
        f.x -= f.hold ? Math.sin(t / 90 + f.y) * .02 : f.v;
        if (Math.random() < .002) f.hold = !f.hold;
        if (f.x < -12) { f.x = W + rand(2, 30); f.y = Math.round(rand(3, H - 8)); }
        if (Math.random() < .0015) rings.push({ x: f.x - 2, y: f.y + 1, age: 0 });
      }
      rings = rings.filter(r => (r.age += .012) < 1);
    }
  }

  let on = true, last = 0;
  function frame(now) {
    const want = getComputedStyle(cv).getPropertyValue('--strip-style').trim() || 'sketch';
    if (!W || want !== mode) fit();                          // first shown, or the theme was switched
    if (on && W && now - last > 33) { step(1 / 30); draw(); last = now; }
    requestAnimationFrame(frame);
  }
  fit(); draw();
  addEventListener('resize', () => { fit(); draw(); });
  if (still) { new MutationObserver(() => { fit(); draw(); }).observe(document.documentElement, { attributes: true }); return; }
  new IntersectionObserver(e => { on = e[0].isIntersecting; }).observe(cv);
  document.addEventListener('visibilitychange', () => { on = !document.hidden; });
  requestAnimationFrame(frame);
})();
