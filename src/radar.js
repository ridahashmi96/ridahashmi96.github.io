/* Q+U hero: the sequencing disc, in 3D.
   A disc of systems seen from above and to the side, turning slowly. Each system is a pillar
   whose height is its criticality. A sweep (a vertical curtain) travels round the disc in
   schedule order; every system it reaches flips from quantum-vulnerable (outlined, dim) to
   post-quantum (filled, accent) and rises. A dashed wedge marks a quarter-close freeze the
   schedule steps around. Exposure falls as systems migrate. Hand-rolled perspective, no libraries. */
(function () {
  const canvas = document.getElementById('disc');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEBUG_T = Number((/[?&]t=(\d+)/.exec(location.search) || [])[1]) || 0;

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rnd = mulberry32(11);
  // systems: schedule position a (0..1 round the disc), radius r, criticality c (1..3)
  const SYS = [];
  for (let i = 0; i < 34; i++) SYS.push({ a: i / 34 + (rnd() - 0.5) * 0.012, r: 0.26 + rnd() * 0.66, c: 1 + Math.floor(rnd() * 3), j: rnd() });
  const LINKS = [[0, 3], [3, 7], [7, 12], [5, 9], [14, 20], [20, 27], [16, 24], [25, 31], [10, 18], [2, 29]];
  const FREEZE = { from: 0.58, to: 0.70 };

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let A = [91, 155, 255], B = [242, 236, 225], FG = '#F2ECE1', SOFT = '#A9B4C8', BG = '#0B1426', FONT = 'sans-serif';
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const a = cs.getPropertyValue('--ring-a').trim(), b = cs.getPropertyValue('--ring-b').trim();
    if (a) A = a.split(',').map(Number);
    if (b) B = b.split(',').map(Number);
    FG = cs.getPropertyValue('--fg').trim() || FG;
    SOFT = cs.getPropertyValue('--fg-soft').trim() || SOFT;
    BG = cs.getPropertyValue('--bg').trim() || BG;
    FONT = getComputedStyle(document.body).fontFamily || FONT;
  }
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a)).toFixed(3)})`;
  const CYCLE = 16000;
  const start = performance.now();
  let running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { running = es[0].isIntersecting; if (running && !reduce) requestAnimationFrame(frame); }, { threshold: 0.05 }).observe(canvas);
  }

  function sweepAt(phase) {
    const span = 1 - (FREEZE.to - FREEZE.from);
    let p = Math.min(phase / 0.78, 1) * span;
    if (p > FREEZE.from) p += (FREEZE.to - FREEZE.from);
    return p;
  }

  // ---- camera ----
  // world: disc in the x/z plane, y up. radius 1.
  let cam;
  function makeCamera(yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const dist = 3.1, focal = Math.min(W, H) * 1.12;
    const cx = W * 0.5, cyy = H * 0.52;
    return {
      project(x, y, z) {
        // yaw round y, then pitch round x
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp;
        const d = dist + z2;
        const f = focal / d;
        return [cx + x1 * f, cyy - y2 * f, d];
      }
    };
  }
  const polar = (a, r, y = 0) => { const ang = a * Math.PI * 2; return [Math.cos(ang) * r, y, Math.sin(ang) * r]; };

  function frame(now) {
    const t = reduce ? 8600 : (now - start) + DEBUG_T;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const phase = (t % CYCLE) / CYCLE;
    const sweep = sweepAt(phase);
    const fade = phase > 0.92 ? (phase - 0.92) / 0.08 : 0;
    const vis = 1 - fade;

    const yaw = (reduce ? 0.6 : t * 0.00009) + mx * 0.25;
    const pitch = 0.82 - my * 0.12;      // ~55° from above
    cam = makeCamera(yaw, pitch);
    const P = cam.project;

    ctx.clearRect(0, 0, W, H);
    const prims = [];                     // depth-sorted drawables

    // ---- floor: rings, spokes, freeze wedge, sweep fan (drawn first; they lie on the plane)
    const ringPath = (r, a0 = 0, a1 = 1, steps = 96) => {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const a = a0 + (a1 - a0) * i / steps;
        const [x, y] = P(...polar(a, r));
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
    };
    // soft glow on the floor
    {
      const [cx0, cy0] = P(0, 0, 0);
      const [rx] = P(1, 0, 0);
      const g = ctx.createRadialGradient(cx0, cy0, 0, cx0, cy0, Math.abs(rx - cx0));
      g.addColorStop(0, rgba(A, 0.12)); g.addColorStop(0.7, rgba(A, 0.03)); g.addColorStop(1, rgba(A, 0));
      ctx.fillStyle = g; ringPath(1); ctx.fill();
    }
    ctx.lineWidth = 1;
    for (const r of [0.45, 0.78, 1]) { ctx.strokeStyle = rgba(B, r === 1 ? 0.30 : 0.12); ringPath(r); ctx.stroke(); }
    for (let k = 0; k < 12; k++) {
      const a = k / 12; const [x1, y1] = P(...polar(a, 0.12)); const [x2, y2] = P(...polar(a, 1));
      ctx.strokeStyle = rgba(B, 0.07); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }
    // freeze wedge: dashed outline, faint fill, short dashed wall at the rim
    {
      ctx.setLineDash([3, 5]); ctx.strokeStyle = rgba(B, 0.4); ctx.fillStyle = rgba(B, 0.05);
      ctx.beginPath();
      const [cx0, cy0] = P(0, 0, 0); ctx.moveTo(cx0, cy0);
      for (let i = 0; i <= 24; i++) { const a = FREEZE.from + (FREEZE.to - FREEZE.from) * i / 24; const [x, y] = P(...polar(a, 1)); ctx.lineTo(x, y); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      for (const a of [FREEZE.from, FREEZE.to]) {
        const [x1, y1] = P(...polar(a, 1, 0)), [x2, y2] = P(...polar(a, 1, 0.18));
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    // sweep fan on the floor: gradient trail behind the head
    {
      const TR = 0.16; // trail length as fraction of the circle
      const steps = 40;
      for (let i = 0; i < steps; i++) {
        const a0 = sweep - TR * (1 - i / steps), a1 = sweep - TR * (1 - (i + 1) / steps);
        const al = (i / steps) * 0.22 * vis;
        ctx.fillStyle = rgba(A, al);
        ctx.beginPath();
        const [cx0, cy0] = P(0, 0, 0); ctx.moveTo(cx0, cy0);
        const [x1, y1] = P(...polar(a0, 1)); const [x2, y2] = P(...polar(a1, 1));
        ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill();
      }
      // bright rim segment
      ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(A, 0.95 * vis); ringPath(1, sweep - 0.03, sweep, 12); ctx.stroke();
      ctx.lineWidth = 1;
    }

    // ---- sweep curtain: a translucent vertical wall at the head, from centre to rim
    {
      const [x0, y0] = P(0, 0, 0), [x1, y1] = P(...polar(sweep, 1, 0)), [x2, y2] = P(...polar(sweep, 1, 0.28)), [x3, y3] = P(0, 0.28, 0);
      const d = P(...polar(sweep, 0.5, 0.1))[2];
      prims.push({ d, draw() {
        const g = ctx.createLinearGradient(x1, y1, x2, y2);
        g.addColorStop(0, rgba(A, 0.35 * vis)); g.addColorStop(1, rgba(A, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = rgba(A, 0.9 * vis); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.lineWidth = 1;
      } });
    }

    // ---- links on the floor
    for (const [i, j] of LINKS) {
      const s = SYS[i], e = SYS[j];
      const both = s.a < sweep && e.a < sweep;
      const [x1, y1] = P(...polar(s.a, s.r)), [x2, y2] = P(...polar(e.a, e.r));
      ctx.strokeStyle = both ? rgba(A, 0.45 * vis) : rgba(B, 0.14);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // ---- systems as pillars
    let migrated = 0, total = 0;
    for (const s of SYS) {
      const dd = sweep - s.a;
      let m = dd <= 0 ? 0 : dd > 0.03 ? 1 : dd / 0.03;
      m *= vis;
      total += s.c; migrated += s.c * m;
      const h = 0.05 + s.c * 0.07 + m * 0.08;
      const size = 4 + s.c * 2;
      const [bx, by, bd] = P(...polar(s.a, s.r, 0));
      const [tx_, ty_, td] = P(...polar(s.a, s.r, h));
      const f = 3.1 / td;                     // perspective scale for the cap
      const fresh = m > 0 && m < 1;
      prims.push({ d: bd, draw() {
        // base dot
        ctx.fillStyle = m > 0.5 ? rgba(A, 0.5) : rgba(B, 0.35);
        ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, Math.PI * 2); ctx.fill();
        // stem
        ctx.strokeStyle = m > 0 ? rgba(A, 0.25 + 0.5 * m) : rgba(B, 0.22);
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx_, ty_); ctx.stroke();
        // halo on fresh migration
        if (fresh) { ctx.fillStyle = rgba(A, 0.28 * (1 - m)); ctx.beginPath(); ctx.arc(tx_, ty_, size * 2.4 * f * (1.6 - m * 0.6), 0, Math.PI * 2); ctx.fill(); }
        // cap: diamond
        const sz = size * f * (fresh ? 1 + (1 - m) * 0.6 : 1);
        ctx.save(); ctx.translate(tx_, ty_); ctx.rotate(Math.PI / 4);
        if (m < 1) {
          ctx.strokeStyle = rgba(B, 0.7); ctx.strokeRect(-sz / 2, -sz / 2, sz, sz);
          ctx.strokeStyle = rgba(B, 0.35); ctx.beginPath(); ctx.moveTo(-sz / 2, sz / 2); ctx.lineTo(sz / 2, -sz / 2); ctx.stroke();
        }
        if (m > 0) { ctx.globalAlpha = m; ctx.fillStyle = rgba(A, 1); ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.globalAlpha = 1; }
        ctx.restore();
      } });
    }

    // ---- centre badge: a short cylinder with Q+U on top
    {
      const hh = 0.12;
      const [cx0, cy0, cd] = P(0, hh, 0);
      prims.push({ d: cd - 0.3, draw() {
        ctx.setLineDash([]);
        // side
        ctx.fillStyle = rgba(A, 0.10);
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) { const [x, y] = P(...polar(i / 48, 0.14, 0)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        for (let i = 48; i >= 0; i--) { const [x, y] = P(...polar(i / 48, 0.14, hh)); ctx.lineTo(x, y); }
        ctx.closePath(); ctx.fill();
        // top
        ctx.fillStyle = BG; ctx.strokeStyle = rgba(A, 0.9); ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= 48; i++) { const [x, y] = P(...polar(i / 48, 0.14, hh)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.lineWidth = 1;
        // pulse ring
        ctx.strokeStyle = rgba(A, 0.25); ctx.beginPath();
        const pr = 0.18 + Math.sin(t * 0.003) * 0.01;
        for (let i = 0; i <= 48; i++) { const [x, y] = P(...polar(i / 48, pr, hh)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = FG; ctx.font = `700 ${Math.round(13 * (3.1 / cd))}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.letterSpacing = '0';
        ctx.fillText('Q+U', cx0, cy0 + 1);
      } });
    }

    // ---- draw depth-sorted primitives, far first
    prims.sort((p, q) => q.d - p.d);
    for (const p of prims) p.draw();

    // ---- rim labels, standing up at the rim
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `600 10px ${FONT}`; ctx.letterSpacing = '0.16em';
    for (const [txt, a] of [['MAP', 0.04], ['SEQUENCE', 0.36], ['MIGRATE', 0.80]]) {
      const [x, y] = P(...polar(a, 1.12, 0.06));
      const on = a < sweep && vis > 0.5;
      ctx.fillStyle = on ? rgba(A, 1) : SOFT;
      ctx.fillText(txt, x, y);
    }
    {
      const [x, y] = P(...polar((FREEZE.from + FREEZE.to) / 2, 0.8, 0.2));
      ctx.fillStyle = SOFT; ctx.font = `500 9px ${FONT}`; ctx.fillText('QUARTER CLOSE', x, y);
    }

    // ---- exposure readout
    const exposure = Math.round(100 - 100 * (migrated / total));
    ctx.textAlign = 'left';
    ctx.font = `600 10px ${FONT}`; ctx.letterSpacing = '0.16em';
    ctx.fillStyle = SOFT; ctx.fillText('EXPOSURE', 12, H - 34);
    ctx.font = `600 22px ${FONT}`; ctx.letterSpacing = '-0.02em';
    ctx.fillStyle = FG; ctx.fillText(exposure + '%', 12, H - 14);
    ctx.fillStyle = rgba(B, 0.2); ctx.fillRect(80, H - 20, 110, 2);
    ctx.fillStyle = rgba(A, 1); ctx.fillRect(80, H - 20, 110 * (exposure / 100), 2);

    if (!reduce && running) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
