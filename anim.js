// Football Trivia Golf — pixel-art shot animation.
// Draws on a tiny 160x90 canvas that CSS scales up with `image-rendering: pixelated`.
//
// TGAnim.play(canvas, shots) animates one shot per golfer, in order.
//   shot = { color: "#hex", outcome: "ace" | "short" | "long" | "water", frac: 0..1 }
//   frac = how far from the cup (0 = right next to it, 1 = as far as it goes).
// Returns { done: Promise, skip() }. Tapping the canvas also skips to the end.
window.TGAnim = (function () {
  const W = 160, H = 90, GY = 70;          // canvas size, ground line
  const TEE_X = 14, HOLE_X = 122;          // golfer position, cup position
  const POND = { x: 54, w: 26 };           // water hazard between tee and green

  const C = {
    sky1: "#7ec8f0", sky2: "#a9dcf5", sky3: "#cdeefb", cloud: "#ffffff", cloudShade: "#e3f3fb",
    hill: "#4f9a5c", hillDark: "#3f8450", grass: "#3fa34d", grassDark: "#358c42", grassLight: "#55b960",
    green: "#6fd17a", greenLight: "#86dd90", dirt: "#7a5a32",
    water: "#3a8ee0", waterLight: "#7cc0ff", cup: "#10220f", pole: "#f2f2f2", flag: "#e8423f", flagDark: "#b8302d",
    skin: "#f1c27d", hair: "#3b2a1a", pants: "#2d3e66", shoe: "#1d1d1d", club: "#d8d8d8", clubHead: "#9a9a9a",
    ball: "#8b4a1f", ballDark: "#6a3614", lace: "#ffffff",
  };

  // ---------- tiny sprite helpers ----------
  function px(ctx, x, y, color, w = 1, h = 1) { ctx.fillStyle = color; ctx.fillRect(Math.round(x), Math.round(y), w, h); }
  function sprite(ctx, rows, x, y, pal) {
    for (let j = 0; j < rows.length; j++)
      for (let i = 0; i < rows[j].length; i++) {
        const k = rows[j][i];
        if (k !== "." && pal[k]) px(ctx, x + i, y + j, pal[k]);
      }
  }
  function line(ctx, x0, y0, x1, y1, color) {   // Bresenham, so the club stays crisp
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      px(ctx, x0, y0, color);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  // Golfer facing right. t = shirt (player's color).
  const GOLFER = [
    "...hhh...",
    "..hhhhh..",
    "..hsss...",
    "...sss...",
    "..ttttt..",
    ".ttttttt.",
    ".ttttttt.",
    "..ttttt..",
    "..ppppp..",
    "..pp.pp..",
    "..pp.pp..",
    "..pp.pp..",
    ".bbb.bbb.",
  ];
  const G_H = GOLFER.length;
  // Football: 3 spin frames
  const BALL = [
    [".bbbbb.", "bdwwwdb", "bbbbbbb", ".bbbbb."],
    ["..bbb", ".bdwb", "bbwdb", "bdwb.", "bbb.."],
    [".bb.", "bdbb", "bwwb", "bwdb", "bbdb", ".bb."],
  ];
  const BALL_PAL = { b: C.ball, d: C.ballDark, w: C.lace };

  // ---------- static background (drawn once) ----------
  let bgCache = null;
  function background() {
    if (bgCache) return bgCache;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    // banded pixel sky
    px(g, 0, 0, C.sky1, W, 22); px(g, 0, 22, C.sky2, W, 18); px(g, 0, 40, C.sky3, W, GY - 40);
    // hills
    for (let x = 0; x < W; x++) {
      const h1 = Math.round(8 + 5 * Math.sin(x / 13) + 3 * Math.sin(x / 5.3));
      px(g, x, GY - h1 - 6, C.hill, 1, h1 + 6);
      const h2 = Math.round(4 + 3 * Math.sin(x / 9 + 2));
      px(g, x, GY - h2, C.hillDark, 1, h2);
    }
    // ground with stripes
    px(g, 0, GY, C.grass, W, H - GY);
    for (let x = 0; x < W; x += 16) px(g, x, GY + 1, C.grassDark, 8, H - GY - 1);
    for (let x = 0; x < W; x += 3) px(g, x, GY, C.grassLight);
    // putting green
    for (let y = 0; y < 5; y++) {
      const half = 18 - y * 2;
      px(g, HOLE_X - half, GY + y, y % 2 ? C.green : C.greenLight, half * 2, 1);
    }
    // pond
    px(g, POND.x, GY, C.water, POND.w, 4);
    px(g, POND.x + 2, GY + 4, C.water, POND.w - 4, 2);
    for (let x = POND.x + 3; x < POND.x + POND.w - 3; x += 5) px(g, x, GY + 1, C.waterLight, 2, 1);
    // tee box dirt
    px(g, TEE_X - 2, GY, C.dirt, 18, 1);
    // cup
    px(g, HOLE_X - 2, GY, C.cup, 4, 2);
    bgCache = c;
    return c;
  }

  function drawCloud(ctx, x, y) {
    px(ctx, x + 2, y, C.cloud, 8, 1); px(ctx, x, y + 1, C.cloud, 14, 2); px(ctx, x + 1, y + 3, C.cloudShade, 12, 1);
  }

  function drawFlag(ctx, t, shake) {
    const top = GY - 20, wave = Math.floor(t * 6) % 2;
    const off = shake ? Math.round(Math.sin(t * 40)) : 0;
    line(ctx, HOLE_X + off, top, HOLE_X, GY - 1, C.pole);
    const fx = HOLE_X + 1 + off;
    px(ctx, fx, top, C.flag, 7 - wave, 1);
    px(ctx, fx, top + 1, C.flag, 8, 1);
    px(ctx, fx, top + 2, C.flagDark, 7 + wave, 1);
    px(ctx, fx, top + 3, C.flag, 5, 1);
    px(ctx, fx, top + 4, C.flag, 3, 1);
  }

  function drawGolfer(ctx, color, clubAngle) {
    const x = TEE_X, y = GY - G_H;
    sprite(ctx, GOLFER, x, y, { h: C.hair, s: C.skin, t: color, p: C.pants, b: C.shoe });
    // hands / club pivot at the shirt's front
    const pvx = x + 6, pvy = y + 6, L = 11;
    const ex = pvx + Math.sin(clubAngle) * L, ey = pvy + Math.cos(clubAngle) * L;
    line(ctx, pvx, pvy, ex, ey, C.club);
    px(ctx, ex - 1, ey, C.clubHead, 3, 1);
    px(ctx, pvx - 1, pvy, C.skin, 2, 2);
  }
  // where the clubhead is at impact (angle 0) = where the ball sits on the tee
  const BALL_START = { x: TEE_X + 6, y: GY - G_H + 6 + 11 };

  function drawBall(ctx, cx, cy, frame) {
    const f = BALL[frame % BALL.length];
    sprite(ctx, f, cx - Math.floor(f[0].length / 2), cy - f.length + 1, BALL_PAL);
  }
  function drawMarker(ctx, x, color) {     // small pennant above a resting ball, in the golfer's color
    px(ctx, x, GY - 9, color, 1, 5);
    px(ctx, x + 1, GY - 9, color, 3, 1); px(ctx, x + 1, GY - 8, color, 2, 1);
  }

  // ---------- shot planning ----------
  function plan(shot, i) {
    const f = Math.max(0, Math.min(1, shot.frac || 0));
    const jitter = ((i * 37) % 7) - 3;     // stops balls from stacking exactly on top of each other
    if (shot.outcome === "ace") return { land: HOLE_X - 7, end: HOLE_X, sink: true };
    if (shot.outcome === "water") return { land: POND.x + POND.w / 2 + jitter, end: null, water: true };
    if (shot.outcome === "long") {
      const end = HOLE_X + 5 + f * (W - 6 - HOLE_X - 5) + (f > 0.1 ? jitter * 0.3 : 0);
      return { land: end - 5, end };
    }
    // short: never into the pond (that's reserved for off-list guesses), so the far end stops after it
    const near = HOLE_X - 5, far = POND.x + POND.w + 4;
    const end = near - f * (near - far) + (f > 0.1 ? jitter * 0.3 : 0);
    return { land: end - 5, end };
  }

  // ---------- main ----------
  function play(canvas, shots) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const plans = shots.map(plan);

    const SWING = 0.75, FLIGHT = 1.15, ROLL = 0.45, PAUSE = 0.35;
    const PER = SWING + FLIGHT + ROLL + PAUSE;
    const total = shots.length * PER + 0.6;

    const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    let start = null, raf = 0, finished = false, resolveDone;
    const done = new Promise((r) => (resolveDone = r));
    const confetti = [], splashes = [];

    function clubAngleAt(t) {     // t in [0, SWING]
      if (t < 0.45) { const k = t / 0.45; return -2.5 * (1 - Math.pow(1 - k, 2)); }       // backswing
      if (t < 0.57) { const k = (t - 0.45) / 0.12; return -2.5 + 2.5 * k; }               // downswing to impact
      const k = Math.min(1, (t - 0.57) / 0.18); return 2.2 * (1 - Math.pow(1 - k, 2));    // follow-through
    }
    const IMPACT = 0.57;

    function frame(now) {
      if (start === null) start = now;
      let t = finished ? total : (now - start) / 1000;
      if (t >= total) t = total;
      const idx = Math.min(shots.length - 1, Math.floor(t / PER));
      const lt = t - idx * PER;            // time within the current shot

      ctx.drawImage(background(), 0, 0);
      drawCloud(ctx, ((t * 4) % (W + 40)) - 20, 8);
      drawCloud(ctx, ((t * 2.5 + 90) % (W + 40)) - 20, 20);

      // balls that already finished
      for (let i = 0; i < idx; i++) {
        const p = plans[i];
        if (p.end !== null && !p.sink) { drawBall(ctx, p.end, GY - 1, 0); drawMarker(ctx, p.end, shots[i].color); }
      }

      const p = plans[idx], s = shots[idx];
      let anyAceShake = false;

      // golfer + club
      const swingT = Math.min(lt, SWING);
      drawGolfer(ctx, s.color, lt < SWING ? clubAngleAt(swingT) : clubAngleAt(SWING));

      // ball
      if (lt < IMPACT) {
        drawBall(ctx, BALL_START.x, BALL_START.y, 0);
      } else if (lt < SWING + FLIGHT) {
        const k = Math.min(1, (lt - IMPACT) / (SWING + FLIGHT - IMPACT));
        const dist = p.land - BALL_START.x;
        const peak = 22 + Math.min(30, dist * 0.28);
        const x = BALL_START.x + dist * k;
        const y = BALL_START.y + (GY - 1 - BALL_START.y) * k - peak * 4 * k * (1 - k);
        // shadow
        px(ctx, x - 2, GY, C.grassDark, 4, 1);
        drawBall(ctx, x, y, Math.floor(lt * 14));
        if (p.water && k >= 1 && !splashes.length) spawnSplash(p.land);
      } else if (lt < SWING + FLIGHT + ROLL + PAUSE) {
        const k = Math.min(1, (lt - SWING - FLIGHT) / ROLL);
        if (p.water) {
          if (!splashes.length && !finished) spawnSplash(p.land);
        } else {
          const e = 1 - Math.pow(1 - k, 2);
          const x = p.land + (p.end - p.land) * e;
          const bounce = Math.round(Math.abs(Math.sin(k * Math.PI * 2)) * 3 * (1 - k));
          if (p.sink && k >= 1) {
            anyAceShake = true;
            if (!confetti.length && !finished) spawnConfetti();
          } else {
            drawBall(ctx, x, GY - 1 - bounce, k < 1 ? Math.floor(lt * 10) : 0);
          }
          if (k >= 1 && !p.sink) drawMarker(ctx, p.end, s.color);
        }
      }

      drawFlag(ctx, t, anyAceShake && lt < PER);
      stepParticles(ctx);

      if (t < total) raf = requestAnimationFrame(frame);
      else finish(true);
    }

    function spawnSplash(x) {
      for (let i = 0; i < 16; i++)
        splashes.push({ x, y: GY, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, life: 0.8, c: i % 3 ? C.waterLight : "#ffffff" });
    }
    function spawnConfetti() {
      const cols = ["#f2c94c", "#ff6b6b", "#7cc7ff", "#6fdc8c", "#ffffff", "#c58cff"];
      for (let i = 0; i < 40; i++)
        confetti.push({ x: HOLE_X, y: GY - 2, vx: (Math.random() - 0.5) * 60, vy: -30 - Math.random() * 45, life: 1.4, c: cols[i % cols.length] });
    }
    let lastStep = null;
    function stepParticles(ctx) {
      const now = performance.now(), dt = lastStep ? Math.min(0.05, (now - lastStep) / 1000) : 0.016;
      lastStep = now;
      for (const arr of [splashes, confetti]) {
        for (let i = arr.length - 1; i >= 0; i--) {
          const q = arr[i];
          q.vy += 70 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.life -= dt;
          if (q.life > 0 && q.y <= GY + 2) px(ctx, q.x, q.y, q.c);
          else if (q.life <= 0) arr.splice(i, 1);
        }
      }
    }

    function finish(natural) {
      if (natural) { cancelAnimationFrame(raf); resolveDone(); return; }
    }

    function skip() {
      if (finished) return;
      finished = true;
      confetti.length = 0; splashes.length = 0;
      cancelAnimationFrame(raf);
      drawFinal();
      resolveDone();
    }

    function drawFinal() {
      ctx.drawImage(background(), 0, 0);
      drawCloud(ctx, 30, 8); drawCloud(ctx, 100, 20);
      plans.forEach((p, i) => { if (p.end !== null && !p.sink) { drawBall(ctx, p.end, GY - 1, 0); drawMarker(ctx, p.end, shots[i].color); } });
      drawGolfer(ctx, shots[shots.length - 1].color, 2.2);
      drawFlag(ctx, 0, false);
      if (plans.some((p) => p.sink)) {     // a little static confetti so an ace still reads as an ace
        const cols = ["#f2c94c", "#ff6b6b", "#7cc7ff", "#6fdc8c"];
        for (let i = 0; i < 18; i++) px(ctx, HOLE_X - 14 + ((i * 11) % 28), GY - 30 + ((i * 7) % 22), cols[i % 4]);
      }
    }

    canvas.onclick = skip;
    if (reduce) { skip(); } else { raf = requestAnimationFrame(frame); }
    return { done, skip };
  }

  return { play };
})();
