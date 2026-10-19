// The light-theme river strip at the bottom of the home page: a black-and-white sketch of a few trout
// holding against the current, the odd rise. (In the dark theme the page shows the real river instead,
// blueline's ?strip view.) Clicking it opens blueline.
(function () {
  const cv = document.getElementById('river-strip');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const P = 3, H = 22;                 // one art pixel = 3 css px; strip height in art pixels
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const FISH = [                       // facing left (upstream), two tail frames
    ['...####....', '.########.#', '##########.', '.########.#', '...##......'],
    ['...####....', '.#########.', '###########', '.#########.', '...##......'],
  ];
  let W = 0, dpr = 1, fish = [], dashes = [], rings = [], t = 0;

  function fit() {
    dpr = window.devicePixelRatio || 1;
    const w = cv.clientWidth;
    if (!w) return;                    // hidden (dark theme): nothing to size
    cv.width = w * dpr; cv.height = H * P * dpr;
    W = Math.floor(w / P);
    if (!fish.length) {
      for (let i = 0; i < 5; i++) fish.push({ x: rand(0, W), y: Math.round(rand(3, H - 8)), v: rand(.02, .08), ph: rand(0, 6), hold: Math.random() < .5 });
      for (let i = 0; i < 40; i++) dashes.push({ x: rand(0, W), y: Math.floor(rand(1, H - 1)), len: Math.round(rand(2, 6)), v: rand(.15, .35) });
    }
  }
  function px(x, y, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * P, Math.round(y) * P, P, P); }
  function draw() {
    if (!W) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W * P, H * P);
    for (let x = 0; x < W; x += 2) { px(x, 0, '#e8e8e8'); px(x + 1, H - 1, '#e8e8e8'); }  // banks
    for (const d of dashes) for (let i = 0; i < d.len; i++) px((d.x + i) % W, d.y, '#dcdcdc');
    for (const r of rings) {
      const k = Math.round(r.age * 6), shade = r.age < .5 ? '#bdbdbd' : '#dedede';
      for (let a = 0; a < 16; a++) px(r.x + Math.cos(a / 16 * 6.283) * k * 1.6, r.y + Math.sin(a / 16 * 6.283) * k * .8, shade);
    }
    for (const f of fish) {
      FISH[Math.floor(f.ph) % 2].forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch === '#') px(f.x + rx, f.y + ry, '#111'); }));
      px(f.x + 1, f.y + 2, '#fff');      // eye
    }
  }
  function step() {
    t++;
    for (const d of dashes) { d.x += d.v; if (d.x > W) { d.x = -d.len; d.y = Math.floor(rand(1, H - 1)); } }
    for (const f of fish) {
      f.ph += .08;
      f.x -= f.hold ? Math.sin(t / 90 + f.y) * .02 : f.v;   // holders sit in the current, the rest swim up
      if (Math.random() < .002) f.hold = !f.hold;
      if (f.x < -12) { f.x = W + rand(2, 30); f.y = Math.round(rand(3, H - 8)); }
      if (Math.random() < .0015) rings.push({ x: f.x - 2, y: f.y + 1, age: 0 });
    }
    rings = rings.filter(r => (r.age += .012) < 1);
  }
  let on = true, last = 0;
  function frame(now) {
    if (!W) fit();                      // the theme was switched to light after load
    if (on && W && now - last > 33) { step(); draw(); last = now; }
    requestAnimationFrame(frame);
  }
  fit(); draw();
  addEventListener('resize', () => { fit(); draw(); });
  if (still) return;
  new IntersectionObserver(e => { on = e[0].isIntersecting; }).observe(cv);
  document.addEventListener('visibilitychange', () => { on = !document.hidden; });
  requestAnimationFrame(frame);
})();
