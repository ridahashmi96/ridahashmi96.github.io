/* Q+U hero: the sequencing disc.
   A tilted disc of systems. A sweep travels round it in schedule order; every system it
   reaches flips from quantum-vulnerable (outlined, dim) to post-quantum (filled, accent).
   A dashed wedge marks a quarter-close freeze the schedule steps around. Exposure falls
   as systems migrate. Pure canvas, no libraries. */
(function () {
  const canvas = document.getElementById('disc');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEBUG_T = Number((/[?&]t=(\d+)/.exec(location.search) || [])[1]) || 0;

  // systems: angle (schedule position, 0..1 around the disc), radius (0..1), criticality (1..3)
  const SYS = [];
  const rnd = mulberry32(7);
  for (let i = 0; i < 34; i++) {
    SYS.push({ a: i / 34 + (rnd() - 0.5) * 0.012, r: 0.28 + rnd() * 0.62, c: 1 + Math.floor(rnd() * 3), j: rnd() });
  }
  // a few dependencies drawn as thin links
  const LINKS = [[0, 3], [3, 7], [7, 12], [5, 9], [14, 20], [20, 27], [16, 24], [25, 31], [10, 18]];
  // the freeze window the schedule skips, as a fraction of the circle
  const FREEZE = { from: 0.58, to: 0.70 };

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let A = [91, 155, 255], B = [242, 236, 225], FG = '#F2ECE1', SOFT = '#A9B4C8', BG = '#0B1426';
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const a = cs.getPropertyValue('--ring-a').trim(), b = cs.getPropertyValue('--ring-b').trim();
    if (a) A = a.split(',').map(Number);
    if (b) B = b.split(',').map(Number);
    FG = cs.getPropertyValue('--fg').trim() || FG;
    SOFT = cs.getPropertyValue('--fg-soft').trim() || SOFT;
    BG = cs.getPropertyValue('--bg').trim() || BG;
  }
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a.toFixed(3)})`;
  const CYCLE = 16000;
  const start = performance.now();
  let running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => { running = es[0].isIntersecting; if (running && !reduce) requestAnimationFrame(frame); }, { threshold: 0.05 }).observe(canvas);
  }

  // schedule position of the sweep: 0..1, skipping the freeze window
  function sweepAt(phase) {
    const span = 1 - (FREEZE.to - FREEZE.from);
    let p = Math.min(phase / 0.78, 1) * span;
    if (p > FREEZE.from) p += (FREEZE.to - FREEZE.from);
    return p;
  }

  function frame(now) {
    const t = reduce ? 8600 : (now - start) + DEBUG_T;
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const phase = (t % CYCLE) / CYCLE;
    const sweep = sweepAt(phase);
    const fade = phase > 0.92 ? (phase - 0.92) / 0.08 : 0;   // reset for the next pass
    const vis = 1 - fade;

    const cx = W * 0.5 + mx * 6, cy = H * 0.5 + my * 4;
    const R = Math.min(W, H) * 0.40;
    const tilt = 0.62 + my * 0.03;              // ellipse squash = the disc seen at an angle
    const rot = -0.35 + mx * 0.04;              // slight turn
    const P = (a, r) => {                       // polar on the disc → screen
      const ang = a * Math.PI * 2 + rot;
      const x = Math.cos(ang) * r * R, y = Math.sin(ang) * r * R * tilt;
      return [cx + x, cy + y];
    };

    ctx.clearRect(0, 0, W, H);

    // disc floor: two faint rings and a soft centre glow
    ctx.save();
    ctx.translate(cx, cy); ctx.scale(1, tilt); ctx.rotate(rot);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
    g.addColorStop(0, rgba(A, 0.10)); g.addColorStop(0.6, rgba(A, 0.03)); g.addColorStop(1, rgba(A, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 1;
    for (const rr of [0.45, 0.78, 1]) {
      ctx.strokeStyle = rgba(B, rr === 1 ? 0.28 : 0.12);
      ctx.beginPath(); ctx.arc(0, 0, R * rr, 0, Math.PI * 2); ctx.stroke();
    }
    // freeze wedge
    ctx.setLineDash([3, 5]); ctx.strokeStyle = rgba(B, 0.35);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, FREEZE.from * Math.PI * 2, FREEZE.to * Math.PI * 2); ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = rgba(B, 0.04); ctx.fill();
    // sweep trail: bright at the head, fading behind
    const head = sweep * Math.PI * 2;
    for (let k = 0; k < 28; k++) {
      const a0 = head - (k + 1) * 0.045, a1 = head - k * 0.045;
      ctx.strokeStyle = rgba(A, (1 - k / 28) * 0.9 * vis);
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(0, 0, R, a0, a1); ctx.stroke();
    }
    // sweep radius line
    ctx.strokeStyle = rgba(A, 0.55 * vis); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(head) * R, Math.sin(head) * R); ctx.stroke();
    ctx.restore();

    // dependency links
    ctx.lineWidth = 1;
    for (const [i, j] of LINKS) {
      const s = SYS[i], d = SYS[j];
      const mi = s.a < sweep ? 1 : 0, mj = d.a < sweep ? 1 : 0;
      const [x1, y1] = P(s.a, s.r), [x2, y2] = P(d.a, d.r);
      ctx.strokeStyle = (mi && mj) ? rgba(A, 0.45 * vis) : rgba(B, 0.14);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    }

    // systems, far ones first so near ones overlap
    const order = SYS.map((s, i) => i).sort((i, j) => P(SYS[i].a, SYS[i].r)[1] - P(SYS[j].a, SYS[j].r)[1]);
    let migrated = 0, total = 0;
    for (const i of order) {
      const s = SYS[i];
      const [x, y] = P(s.a, s.r);
      const d = sweep - s.a;
      let m = d <= 0 ? 0 : d > 0.03 ? 1 : d / 0.03;
      m *= vis;
      const w = s.c; total += w; migrated += w * m;
      const size = 5 + s.c * 2.2;
      const pulse = m > 0 && m < 1 ? 1 + (1 - m) * 0.8 : 1;
      // halo on fresh migrations
      if (m > 0 && m < 1) {
        ctx.fillStyle = rgba(A, 0.25 * (1 - m));
        ctx.beginPath(); ctx.arc(x, y, size * 2.2 * pulse, 0, Math.PI * 2); ctx.fill();
      }
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4);
      const sz = size * pulse;
      if (m < 1) {
        ctx.strokeStyle = rgba(B, 0.6); ctx.lineWidth = 1;
        ctx.strokeRect(-sz / 2, -sz / 2, sz, sz);
        // hatch: vulnerable
        ctx.strokeStyle = rgba(B, 0.35);
        ctx.beginPath(); ctx.moveTo(-sz / 2, sz / 2); ctx.lineTo(sz / 2, -sz / 2); ctx.stroke();
      }
      if (m > 0) {
        ctx.globalAlpha = m;
        ctx.fillStyle = rgba(A, 1);
        ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }

    // rim labels
    ctx.font = `600 10px ${getComputedStyle(document.body).fontFamily}`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const labels = [['MAP', 0.04], ['SEQUENCE', 0.36], ['MIGRATE', 0.78]];
    for (const [txt, a] of labels) {
      const [x, y] = P(a, 1.12);
      const on = a < sweep && vis > 0.5;
      ctx.fillStyle = on ? rgba(A, 1) : SOFT;
      ctx.letterSpacing = '0.16em';
      ctx.fillText(txt, x, y);
    }
    {
      const [x, y] = P((FREEZE.from + FREEZE.to) / 2, 0.86);
      ctx.fillStyle = SOFT; ctx.font = `500 9px ${getComputedStyle(document.body).fontFamily}`;
      ctx.fillText('QUARTER CLOSE', x, y);
    }

    // centre badge
    ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = BG; ctx.fill();
    ctx.strokeStyle = rgba(A, 0.9); ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 36 + Math.sin(t * 0.003) * 2, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(A, 0.25); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = FG; ctx.font = `700 15px ${getComputedStyle(document.body).fontFamily}`; ctx.letterSpacing = '0';
    ctx.fillText('Q+U', cx, cy + 1);

    // exposure readout
    const exposure = Math.round(100 - 100 * (migrated / total));
    ctx.textAlign = 'left';
    ctx.font = `600 10px ${getComputedStyle(document.body).fontFamily}`; ctx.letterSpacing = '0.16em';
    ctx.fillStyle = SOFT; ctx.fillText('EXPOSURE', 12, H - 34);
    ctx.font = `600 22px ${getComputedStyle(document.body).fontFamily}`; ctx.letterSpacing = '-0.02em';
    ctx.fillStyle = FG; ctx.fillText(exposure + '%', 12, H - 14);
    // bar
    ctx.fillStyle = rgba(B, 0.2); ctx.fillRect(80, H - 20, 110, 2);
    ctx.fillStyle = rgba(A, 1); ctx.fillRect(80, H - 20, 110 * (exposure / 100), 2);

    if (!reduce && running) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
