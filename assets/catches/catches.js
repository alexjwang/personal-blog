// catch collection: open and close outings, filter the log by fish or water, and draw a dot per outing on each water.
(function () {
  var root = document.querySelector('.catches');
  if (!root) return;
  var outs = [].slice.call(root.querySelectorAll('.cc-out'));
  var filterBar = root.querySelector('.cc-filter');
  var filterWhat = root.querySelector('.cc-filter-what');
  var current = null;

  function setOpen(out, open) {
    out.classList.toggle('cc-open', open);
    out.querySelector('.cc-row').setAttribute('aria-expanded', open ? 'true' : 'false');
    out.querySelector('.cc-body').hidden = !open;
  }

  outs.forEach(function (out) {
    out.querySelector('.cc-row').addEventListener('click', function () {
      var open = !out.classList.contains('cc-open');
      setOpen(out, open);
      if (history.replaceState) history.replaceState(null, '', open ? '#' + out.id : location.pathname);
    });
  });

  function openFromHash() {
    var id = decodeURIComponent(location.hash.slice(1));
    var out = id && document.getElementById(id);
    if (out && out.classList.contains('cc-out')) { setOpen(out, true); out.scrollIntoView({ block: 'start' }); }
  }
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  // an area's waters show under its map once the area (or one of its waters) is picked
  // (a region with a single area always shows it)
  function showArea(area) {
    root.querySelectorAll('.cc-region').forEach(function (r) {
      var ps = r.querySelectorAll('.cc-panel:not(.cc-panel-always)');
      if (ps.length < 2) return;
      var here = !!area && !!r.querySelector('.cc-panel[data-area="' + area + '"]');
      ps.forEach(function (p) { p.hidden = !(here && p.dataset.area === area); });
      var hint = r.querySelector('.cc-hint');
      if (hint) hint.hidden = here;
    });
  }

  // filtering: one fish, area or water at a time; clicking it again clears
  function applyFilter(kind, id, label) {
    var same = current && current.kind === kind && current.id === id;
    current = same ? null : { kind: kind, id: id };
    root.querySelectorAll('.cc-on').forEach(function (el) { el.classList.remove('cc-on'); });
    var shown = 0;
    outs.forEach(function (out) {
      // species, water and area are space-separated lists on each outing
      var match = !current || (' ' + out.dataset[kind] + ' ').indexOf(' ' + id + ' ') !== -1;
      out.hidden = !match;
      if (match) shown++;
    });
    showArea(null);
    if (!current) { filterBar.hidden = true; return; }
    var sel = kind === 'species' ? '.cc-sp[data-species="' + id + '"]'
      : kind === 'area' ? '.cc-area[data-area="' + id + '"]'
      : '.cc-w[data-water="' + id + '"], .cc-wdot[data-water="' + id + '"]';
    root.querySelectorAll(sel).forEach(function (el) { el.classList.add('cc-on'); });
    if (kind === 'area') showArea(id);
    if (kind === 'water') {
      var dot = root.querySelector('.cc-w[data-water="' + id + '"]');
      var panel = dot && dot.closest('.cc-panel');
      if (panel) {
        showArea(panel.dataset.area);
        var pin = root.querySelector('.cc-area[data-area="' + panel.dataset.area + '"]');
        if (pin) pin.classList.add('cc-on');
      }
    }
    filterWhat.textContent = label + ' · ' + shown + (shown === 1 ? ' outing' : ' outings');
    filterBar.hidden = false;
    filterBar.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  root.querySelectorAll('button.cc-sp').forEach(function (card) {
    card.addEventListener('click', function () {
      applyFilter('species', card.dataset.species, card.dataset.name + ', first caught ' + card.dataset.first);
    });
  });
  function clickable(el, go) {
    el.addEventListener('click', go);
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  }
  root.querySelectorAll('.cc-w[role=button], .cc-wdot[role=button]').forEach(function (w) {
    clickable(w, function () { applyFilter('water', w.dataset.water, w.dataset.name); });
  });
  root.querySelectorAll('.cc-area').forEach(function (a) {
    clickable(a, function () { applyFilter('area', a.dataset.area, a.dataset.name); });
  });
  root.querySelector('.cc-clear').addEventListener('click', function () { if (current) applyFilter(current.kind, current.id, ''); });

  // one dot per outing, spread along the river or around inside the lake
  var NS = 'http://www.w3.org/2000/svg';
  root.querySelectorAll('.cc-w').forEach(function (w) {
    var n = +w.dataset.n;
    if (!n) return;
    var line = w.querySelector('.cc-line');
    var pts = [];
    if (line.tagName.toLowerCase() === 'ellipse') {
      var cx = +line.getAttribute('cx'), cy = +line.getAttribute('cy');
      var rx = +line.getAttribute('rx') * 0.5, ry = +line.getAttribute('ry') * 0.45;
      for (var i = 0; i < n; i++) {
        var a = n === 1 ? 0 : (i / n) * Math.PI * 2 - Math.PI / 2;
        pts.push(n === 1 ? [cx, cy] : [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
      }
    } else {
      var len = line.getTotalLength();
      for (var j = 0; j < n; j++) {
        var p = line.getPointAtLength(len * (n === 1 ? 0.5 : 0.25 + 0.5 * j / (n - 1)));
        pts.push([p.x, p.y]);
      }
    }
    pts.forEach(function (pt) {
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('class', 'cc-dot');
      c.setAttribute('cx', pt[0].toFixed(1));
      c.setAttribute('cy', pt[1].toFixed(1));
      c.setAttribute('r', 4);
      w.insertBefore(c, w.querySelector('text'));
    });
  });
})();
