// The river strip at the bottom of the home page: two banks, the current drifting past, a few trout holding
// or swimming up, the odd rise. Clicking it opens blueline. The light theme draws it as a black-and-white
// sketch; the dark theme (--strip-style: game) draws the same scene in blueline's own colours.
(function () {
  const cv = document.getElementById('river-strip');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const P = 3, H = 22;                 // one art pixel = 3 css px; strip height in art pixels
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  // facing left (upstream), two tail frames
  const SKETCH = [
    ['...####....', '.########.#', '##########.', '.########.#', '...##......'],
    ['...####....', '.#########.', '###########', '.#########.', '...##......'],
  ];
  const TROUT = [
    ['..#######...#', '.##########.#', '############.', '.##########.#', '..#######...#'],
    ['..#######....', '.###########.', '#############', '.###########.', '..#######....'],
  ];
  // blueline's species colours: back (fill), sides (edge), spots, and a rainbow's or brown's flank
  const SPECIES = [
    { fill: '#5d6f5c', edge: '#c9d6c2', spot: '#1e2a20' },                     // yamame
    { fill: '#3a4854', edge: '#9bb1c2', spot: '#eef3f5' },                     // iwana
    { fill: '#4c6a4b', edge: '#a5c4ac', spot: '#1b2a1e', flank: '#d98aa0' },   // rainbow
    { fill: '#4d5e49', edge: '#bccbaa', spot: '#f0806e' },                     // Dolly Varden
    { fill: '#7b5c2b', edge: '#dab66c', spot: '#23160a', flank: '#cf4a33' },   // brown
  ];
  const WATER = ['#14232b', '#0e1a22', '#09131a'], BAYER = [0, .5, .75, .25];
  const RING = ['#d7ecf2', '#7fa9bb', '#35596a'];

  let W = 0, dpr = 1, mode = '', bed = null, fish = [], drift = [], rings = [], t = 0;
  const game = () => mode === 'game';

  function fit() {
    mode = getComputedStyle(cv).getPropertyValue('--strip-style').trim() || 'sketch';
    dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth;
    if (!w) { W = 0; return; }
    cv.width = w * dpr; cv.height = H * P * dpr;
    W = Math.floor(w / P);
    if (!fish.length) {
      for (let i = 0; i < 5; i++) fish.push({ x: rand(0, W), y: Math.round(rand(4, H - 9)), v: rand(.02, .08), ph: rand(0, 6), hold: Math.random() < .5, sp: SPECIES[i % SPECIES.length], seed: Math.floor(rand(0, 99)) });
      for (let i = 0; i < 40; i++) drift.push({ x: rand(0, W), y: Math.floor(rand(2, H - 2)), len: Math.round(rand(2, 6)), v: rand(.15, .35), tw: rand(0, 6) });
    }
    bed = game() ? paintBed() : null;
  }

  function px(g, x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); }

  // the still part of the dark strip: water shaded deeper toward the middle, grassy banks with the odd tuft
  function paintBed() {
    const o = document.createElement('canvas'); o.width = W * P; o.height = H * P;
    const g = o.getContext('2d');
    for (let x = 0; x < W; x++) {
      for (let y = 1; y < H - 1; y++) {
        const d = Math.min(y - 1, H - 2 - y) / ((H - 3) / 2);                       // 0 at a bank, 1 mid-river
        px(g, x, y, WATER[Math.min(2, Math.floor(d * 2 + BAYER[(x & 1) + 2 * (y & 1)]))]);
      }
      px(g, x, 0, '#2a7a55'); px(g, x, H - 1, '#2a7a55');
      if (Math.random() < .25) px(g, x, 1, Math.random() < .5 ? '#2f8a5c' : '#1d5a3f');        // grass leaning over the water
      if (Math.random() < .25) px(g, x, H - 2, Math.random() < .5 ? '#2f8a5c' : '#1d5a3f');
    }
    return o;
  }

  function drawFish(f) {
    const rows = (game() ? TROUT : SKETCH)[Math.floor(f.ph) % 2], at = (rx, ry) => rows[ry] && rows[ry][rx] === '#';
    rows.forEach((row, ry) => [...row].forEach((ch, rx) => {
      if (ch !== '#') return;
      let c = '#111';
      if (game()) {
        const rim = !at(rx, ry - 1) || !at(rx, ry + 1) || !at(rx - 1, ry) || !at(rx + 1, ry);
        c = rim ? f.sp.edge : f.sp.fill;                                               // dark back, light sides
        if (!rim && f.sp.flank && ry === 2 && rx > 2 && rx < 10) c = f.sp.flank;      // a rainbow's or brown's stripe
        else if (!rim && (rx * 5 + ry * 3 + f.seed) % 7 === 0) c = f.sp.spot;          // spots
      }
      px(ctx, f.x + rx, f.y + ry, c);
    }));
    if (!game()) px(ctx, f.x + 1, f.y + 2, '#fff');                                    // eye
  }

  function draw() {
    if (!W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W * P, H * P);
    if (game()) ctx.drawImage(bed, 0, 0);
    else for (let x = 0; x < W; x += 2) { px(ctx, x, 0, '#e8e8e8'); px(ctx, x + 1, H - 1, '#e8e8e8'); }   // banks
    for (const d of drift) {
      if (game()) px(ctx, d.x % W, d.y, Math.sin(t / 12 + d.tw) > .3 ? '#7fa9bb' : '#24363f');           // specks catching the light
      else for (let i = 0; i < d.len; i++) px(ctx, (d.x + i) % W, d.y, '#dcdcdc');
    }
    for (const r of rings) {
      const k = Math.round(r.age * 6), shade = game() ? RING[Math.min(2, Math.floor(r.age * 3))] : (r.age < .5 ? '#bdbdbd' : '#dedede');
      for (let a = 0; a < 16; a++) px(ctx, r.x + Math.cos(a / 16 * 6.283) * k * 1.6, r.y + Math.sin(a / 16 * 6.283) * k * .8, shade);
    }
    for (const f of fish) drawFish(f);
  }

  function step() {
    t++;
    for (const d of drift) { d.x += d.v; if (d.x > W) { d.x = -d.len; d.y = Math.floor(rand(2, H - 2)); } }
    for (const f of fish) {
      f.ph += .08;
      f.x -= f.hold ? Math.sin(t / 90 + f.y) * .02 : f.v;   // holders sit in the current, the rest swim up
      if (Math.random() < .002) f.hold = !f.hold;
      if (f.x < -14) { f.x = W + rand(2, 30); f.y = Math.round(rand(4, H - 9)); }
      if (Math.random() < .0015) rings.push({ x: f.x - 2, y: f.y + 2, age: 0 });
    }
    rings = rings.filter(r => (r.age += .012) < 1);
  }

  let on = true, last = 0;
  function frame(now) {
    const want = getComputedStyle(cv).getPropertyValue('--strip-style').trim() || 'sketch';
    if (!W || want !== mode) fit();                         // first shown, or the theme was switched
    if (on && W && now - last > 33) { step(); draw(); last = now; }
    requestAnimationFrame(frame);
  }
  fit(); draw();
  addEventListener('resize', () => { fit(); draw(); });
  if (still) { new MutationObserver(() => { fit(); draw(); }).observe(document.documentElement, { attributes: true }); return; }
  new IntersectionObserver(e => { on = e[0].isIntersecting; }).observe(cv);
  document.addEventListener('visibilitychange', () => { on = !document.hidden; });
  requestAnimationFrame(frame);
})();
