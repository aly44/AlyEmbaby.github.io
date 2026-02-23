/* secret.js — ↑↑↓↓←→←→ → Stars → Snake */
(function () {
  'use strict';

  let active = false; // prevent double-trigger

  // ── Konami Listener ──────────────────────────────────────────────────────────
  const SEQ = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight'];
  let seqIdx = 0;

  document.addEventListener('keydown', e => {
    seqIdx = (e.key === SEQ[seqIdx]) ? seqIdx + 1 : (e.key === SEQ[0] ? 1 : 0);
    if (seqIdx === SEQ.length) { seqIdx = 0; if (!active) { active = true; burstStars(openGame); } }
  });

  // ── Star Burst ───────────────────────────────────────────────────────────────
  function burstStars(onDone) {
    const cvs = document.createElement('canvas');
    cvs.width  = window.innerWidth;
    cvs.height = window.innerHeight;
    cvs.style.cssText = 'position:fixed;inset:0;z-index:10001;pointer-events:none;';
    document.body.appendChild(cvs);

    const ctx = cvs.getContext('2d');
    const cx  = cvs.width / 2;
    const cy  = cvs.height / 2;
    const COLORS = ['#00d4ff','#9d78f5','#ffffff','#00e87a','#ff2d78'];

    const pts = Array.from({ length: 130 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: 160 + Math.random() * 500,
      size:  1.5 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      freq:  0.007 + Math.random() * 0.016
    }));

    const t0  = performance.now();
    const DUR = 1900;

    function frame(now) {
      const t      = Math.min((now - t0) / DUR, 1);
      const eased  = 1 - Math.pow(1 - t, 3);
      const fadeIn = Math.min(t / 0.12, 1);
      const fadeOut= t > 0.55 ? 1 - (t - 0.55) / 0.45 : 1;
      const baseA  = fadeIn * fadeOut;

      ctx.clearRect(0, 0, cvs.width, cvs.height);

      pts.forEach(p => {
        const dist = p.speed * eased;
        const x = cx + Math.cos(p.angle) * dist;
        const y = cy + Math.sin(p.angle) * dist;
        const a = baseA * (0.5 + 0.5 * Math.sin(now * p.freq));
        ctx.globalAlpha = a;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = p.size * 5;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      if (t < 1) requestAnimationFrame(frame);
      else { cvs.remove(); onDone(); }
    }

    requestAnimationFrame(frame);
  }

  // ── Snake Game ───────────────────────────────────────────────────────────────
  function openGame() {
    const CELL = 60, COLS = 8, ROWS = 7;
    const W = CELL * COLS, H = CELL * ROWS;

    // Overlay shell
    const ov = document.createElement('div');
    ov.style.cssText = [
      'position:fixed;inset:0;z-index:10000;',
      'background:rgba(6,6,10,0.96);',
      'backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;',
      "font-family:'Space Grotesk',system-ui,sans-serif;",
      'opacity:0;transition:opacity 0.4s;'
    ].join('');

    // Header
    const hdr = document.createElement('div');
    hdr.style.cssText = 'text-align:center;margin-bottom:1.25rem;';
    hdr.innerHTML = `
      <div style="font-size:0.6rem;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#00d4ff;margin-bottom:0.35rem;">&#127918; Secret Unlocked</div>
      <div style="font-size:1.6rem;font-weight:700;color:#f0eff8;letter-spacing:-0.03em;">Snake</div>
    `;
    ov.appendChild(hdr);

    // Score row
    const scoreRow = document.createElement('div');
    scoreRow.style.cssText = 'display:flex;gap:3rem;margin-bottom:1rem;';
    scoreRow.innerHTML = `
      <div style="text-align:center;">
        <div style="font-size:0.58rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4a4a6a;margin-bottom:0.2rem;">Score</div>
        <div id="sk-score" style="font-size:1.25rem;font-weight:700;color:#00d4ff;line-height:1;">0</div>
      </div>
      <div style="text-align:center;">
        <div style="font-size:0.58rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#4a4a6a;margin-bottom:0.2rem;">Best</div>
        <div id="sk-hi" style="font-size:1.25rem;font-weight:700;color:#9d78f5;line-height:1;">0</div>
      </div>
    `;
    ov.appendChild(scoreRow);

    // Game canvas
    const cvs = document.createElement('canvas');
    cvs.width  = W;
    cvs.height = H;
    cvs.style.cssText = 'display:block;border:1px solid rgba(0,212,255,0.15);border-radius:4px;';
    ov.appendChild(cvs);
    const ctx = cvs.getContext('2d');

    // Footer
    const foot = document.createElement('div');
    foot.style.cssText = 'display:flex;align-items:center;gap:0.75rem;margin-top:1rem;';
    foot.innerHTML = `<span style="font-size:0.6rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#4a4a6a;">Arrows to move &nbsp;&middot;&nbsp; Space to restart &nbsp;&middot;&nbsp; ESC to close</span>`;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '× Close';
    closeBtn.style.cssText = [
      "font-family:'Space Grotesk',system-ui,sans-serif;",
      'font-size:0.6rem;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;',
      'color:#7a7a9a;background:none;border:1px solid rgba(255,255,255,0.08);',
      'padding:0.3rem 0.75rem;border-radius:3px;cursor:pointer;',
      'transition:color 0.2s,border-color 0.2s;'
    ].join('');
    closeBtn.onmouseenter = () => { closeBtn.style.color = '#00d4ff'; closeBtn.style.borderColor = 'rgba(0,212,255,0.3)'; };
    closeBtn.onmouseleave = () => { closeBtn.style.color = '#7a7a9a'; closeBtn.style.borderColor = 'rgba(255,255,255,0.08)'; };
    foot.appendChild(closeBtn);
    ov.appendChild(foot);

    document.body.appendChild(ov);
    requestAnimationFrame(() => requestAnimationFrame(() => { ov.style.opacity = '1'; }));

    // ── Game state ──────────────────────────────────────────
    let snake, dir, nextDir, food, score, hiScore, ivId, state;

    function init() {
      snake   = [{x:Math.floor(COLS*0.6),y:Math.floor(ROWS/2)},{x:Math.floor(COLS*0.6)-1,y:Math.floor(ROWS/2)},{x:Math.floor(COLS*0.6)-2,y:Math.floor(ROWS/2)}];
      dir     = {x:1, y:0};
      nextDir = {x:1, y:0};
      score   = 0;
      state   = 'waiting';
      food    = spawnFood();
      hiScore = +localStorage.getItem('sk-hi') || 0;
      document.getElementById('sk-score').textContent = '0';
      document.getElementById('sk-hi').textContent    = hiScore;
      draw();
    }

    function spawnFood() {
      let p;
      do { p = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)}; }
      while (snake.some(s => s.x===p.x && s.y===p.y));
      return p;
    }

    function draw() {
      // Background
      ctx.fillStyle = '#06060a';
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke(); }
      for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke(); }

      // Food — glowing purple dot
      ctx.shadowColor = '#9d78f5';
      ctx.shadowBlur  = 16;
      ctx.fillStyle   = '#9d78f5';
      ctx.beginPath();
      ctx.arc(food.x*CELL + CELL/2, food.y*CELL + CELL/2, CELL/2 - 2, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Snake — cyan with glow on head, fading tail
      snake.forEach((seg, i) => {
        const head  = i === 0;
        const alpha = head ? 1 : Math.max(0.28, 1 - (i / snake.length) * 0.72);
        ctx.globalAlpha = alpha;
        ctx.fillStyle   = '#00d4ff';
        if (head) { ctx.shadowColor = '#00d4ff'; ctx.shadowBlur = 14; }
        const pad = head ? 1 : 2;
        ctx.fillRect(seg.x*CELL + pad, seg.y*CELL + pad, CELL - pad*2, CELL - pad*2);
        ctx.shadowBlur = 0;
      });
      ctx.globalAlpha = 1;

      // Waiting overlay
      if (state === 'waiting') {
        ctx.fillStyle = 'rgba(6,6,10,0.58)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle   = '#00d4ff';
        ctx.font        = 'bold 11px "Space Grotesk",system-ui,sans-serif';
        ctx.textAlign   = 'center';
        ctx.fillText('PRESS ANY ARROW KEY TO START', W/2, H/2);
      }

      // Game over overlay
      if (state === 'dead') {
        ctx.fillStyle = 'rgba(6,6,10,0.76)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f0eff8';
        ctx.font      = 'bold 22px "Space Grotesk",system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W/2, H/2 - 18);
        ctx.fillStyle = '#00d4ff';
        ctx.font      = 'bold 11px "Space Grotesk",system-ui,sans-serif';
        ctx.fillText('PRESS SPACE TO RESTART', W/2, H/2 + 14);
      }
    }

    function getSpeed() { return Math.max(75, 180 - Math.floor(score / 5) * 10); }

    function tick() {
      if (state !== 'playing') return;
      dir = nextDir;
      const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

      // Collision
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
          snake.some(s => s.x===head.x && s.y===head.y)) {
        state = 'dead';
        clearInterval(ivId);
        draw();
        return;
      }

      snake.unshift(head);

      if (head.x===food.x && head.y===food.y) {
        score++;
        if (score > hiScore) {
          hiScore = score;
          localStorage.setItem('sk-hi', hiScore);
          document.getElementById('sk-hi').textContent = hiScore;
        }
        document.getElementById('sk-score').textContent = score;
        food = spawnFood();
        if (score % 5 === 0) { clearInterval(ivId); ivId = setInterval(tick, getSpeed()); }
      } else {
        snake.pop();
      }

      draw();
    }

    function startLoop() {
      if (ivId) clearInterval(ivId);
      state = 'playing';
      ivId  = setInterval(tick, getSpeed());
    }

    function close() {
      clearInterval(ivId);
      document.removeEventListener('keydown', onKey);
      ov.style.opacity = '0';
      setTimeout(() => { ov.remove(); active = false; }, 400);
    }

    const ARROWS = new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);

    function onKey(e) {
      if (ARROWS.has(e.key) || (e.key === ' ' && state === 'dead')) e.preventDefault();
      if (e.key === 'Escape')                         { close(); return; }
      if (e.key === ' ' && state === 'dead')          { init(); startLoop(); return; }
      if (state === 'waiting' && ARROWS.has(e.key))   { startLoop(); }
      switch (e.key) {
        case 'ArrowUp':    if (dir.y === 0) nextDir = {x:0,  y:-1}; break;
        case 'ArrowDown':  if (dir.y === 0) nextDir = {x:0,  y:1};  break;
        case 'ArrowLeft':  if (dir.x === 0) nextDir = {x:-1, y:0};  break;
        case 'ArrowRight': if (dir.x === 0) nextDir = {x:1,  y:0};  break;
      }
    }

    document.addEventListener('keydown', onKey);
    closeBtn.addEventListener('click', close);
    init();
  }

})();
