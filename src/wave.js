/* Q+U hero: a wave of systems migrating from quantum-vulnerable to post-quantum.
   A grid of points on a rolling 3D surface, projected in perspective. A migration front
   sweeps left to right; points behind it switch from dim to the accent colour and lift.
   Pure canvas, no libraries. */
(function () {
  const canvas = document.getElementById('wave');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const COLS = 160, ROWS = 46;
  const N = COLS * ROWS;
  const seed = new Float32Array(N);
  for (let i = 0; i < N; i++) seed[i] = Math.random();

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let colA = [91, 155, 255], colB = [242, 236, 225];
  function readTheme() {
    const cs = getComputedStyle(document.documentElement);
    const a = cs.getPropertyValue('--ring-a').trim(), b = cs.getPropertyValue('--ring-b').trim();
    if (a) colA = a.split(',').map(Number);
    if (b) colB = b.split(',').map(Number);
  }
  readTheme();
  new MutationObserver(readTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  const HOOP = 900;
  const hoopSeed = new Float32Array(HOOP);
  for (let i = 0; i < HOOP; i++) hoopSeed[i] = Math.random();

  const CYCLE = 18000; // ms for one migration sweep
  const start = performance.now();
  const DEBUG_T = Number((/[?&]t=(\d+)/.exec(location.search) || [])[1]) || 0; // ?t=ms jumps the animation, for screenshots

  function frame(now) {
    const t = reduce ? 7500 : (now - start) + (DEBUG_T || 0);
    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    const phase = (t % CYCLE) / CYCLE;
    // the front crosses the field over 75% of the cycle, holds, then fades for the next pass
    const front = Math.min(phase / 0.75, 1) * 1.15 - 0.07;
    const resetFade = phase > 0.9 ? (phase - 0.9) / 0.1 : 0;

    // camera: looking slightly down across the sheet; the sheet sits in the lower part of the hero
    const horizon = H * 0.52 + my * 10;
    const camZ = 2.4;
    const pitch = 0.34 - my * 0.03;
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const ts = t * 0.00055;

    ctx.clearRect(0, 0, W, H);
    for (let r = ROWS - 1; r >= 0; r--) {          // far rows first
      const v = r / (ROWS - 1);                     // 0 near .. 1 far
      const z0 = v * 3.2;
      for (let c = 0; c < COLS; c++) {
        const u = c / (COLS - 1);                   // 0 left .. 1 right
        const i = r * COLS + c;
        const x0 = (u - 0.5) * 6.2 + mx * 0.12;
        // rolling surface: two travelling waves plus a slow swell
        const y0 = 0.42 * Math.sin(u * 7.5 - ts * 1.6 + v * 2.1)
                 + 0.22 * Math.sin(u * 13.0 + ts * 0.9 - v * 4.0)
                 + 0.16 * Math.sin(v * 5.0 + ts * 0.5)
                 + (seed[i] - 0.5) * 0.06;
        // migrated if left of the sweeping front (with a soft edge that follows the surface)
        const d = front - (u + y0 * 0.05);
        let m = d <= 0 ? 0 : d >= 0.12 ? 1 : d / 0.12;
        if (resetFade) m *= (1 - resetFade);
        const y = y0 - 0.9 + m * 0.18;             // migrated points lift a little
        // rotate by pitch, then project
        const zc = z0 * cp - y * sp + camZ;
        const yc = y * cp + z0 * sp;
        const f = (H * 0.9) / zc;
        const px = W / 2 + x0 * f;
        const py = horizon - yc * f;
        if (px < -4 || px > W + 4 || py < -4 || py > H + 4) continue;
        const depthFade = 1 - v * 0.7;
        const cr = colB[0] + (colA[0] - colB[0]) * m;
        const cg = colB[1] + (colA[1] - colB[1]) * m;
        const cb = colB[2] + (colA[2] - colB[2]) * m;
        const alpha = (0.28 + 0.6 * m) * depthFade;
        const s = (1.0 + 1.6 * (1 - v)) * (1 + m * 0.5);
        ctx.fillStyle = `rgba(${cr | 0},${cg | 0},${cb | 0},${alpha.toFixed(3)})`;
        ctx.fillRect(px, py, s, s);
      }
    }
    // the hoop: the migration front itself, a circle of points standing in the wave,
    // perpendicular to its travel, so the surface passes through it and comes out post-quantum
    const hx = (front - 0.5) * 6.2 + mx * 0.12;
    const hy = -0.72, hz = 1.6, HR = 1.3;
    const hoopAlpha = 1 - resetFade;
    const spin = t * 0.0004;
    for (let k = 0; k < HOOP; k++) {
      const a = (k / HOOP) * Math.PI * 2 + spin;
      const jit = hoopSeed[k];
      const rr = HR + (jit - 0.5) * 0.14;
      // circle in the y-z plane, with a slight lean so it reads as a ring in perspective
      const x = hx + Math.cos(a) * rr * 0.72;
      const y = hy + Math.sin(a) * rr;
      const z = hz + Math.cos(a) * rr * 0.6;
      const zc = z * cp - y * sp + camZ;
      if (zc < 0.2) continue;
      const yc = y * cp + z * sp;
      const f = (H * 0.9) / zc;
      const px = W / 2 + x * f, py = horizon - yc * f;
      const near = 1 - (z / 3.2) * 0.5;
      const twinkle = 0.65 + 0.35 * Math.sin(t * 0.004 + jit * 40);
      const alpha = (0.55 + 0.45 * near) * twinkle * hoopAlpha;
      const s = (1.4 + 1.8 * near) * (0.8 + jit * 0.5);
      ctx.fillStyle = `rgba(${colA[0]},${colA[1]},${colA[2]},${alpha.toFixed(3)})`;
      ctx.fillRect(px - s / 2, py - s / 2, s, s);
    }
    // a faint halo where the hoop meets the surface
    {
      const zc = hz * cp - hy * sp + camZ, yc = hy * cp + hz * sp, f = (H * 0.9) / zc;
      const px = W / 2 + hx * f, py = horizon - yc * f, R = HR * f;
      const g = ctx.createRadialGradient(px, py, R * 0.2, px, py, R);
      g.addColorStop(0, `rgba(${colA[0]},${colA[1]},${colA[2]},${(0.06 * hoopAlpha).toFixed(3)})`);
      g.addColorStop(1, `rgba(${colA[0]},${colA[1]},${colA[2]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.ellipse(px, py, R * 0.8, R * 0.9, 0, 0, Math.PI * 2); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
