/* ═══════════════════════════════════════════════════════════════
   QUANTUM VISUAL LAYER
   Scroll-driven 3D quantum computer + lattice that rotates,
   shifts, scales, and fades as user scrolls — Apple-style.
   
   USAGE: Add to index.html <head>:
     <link rel="stylesheet" href="quantum-visual.css" />
   Add before </body>:
     <script src="quantum-visual.js"></script>
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── INJECT CSS ────────────────────────
  const css = `
    /* Container — fixed behind everything */
    .qv-layer {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      perspective: 1200px;
    }

    /* The quantum computer object */
    .qv-machine {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 320px;
      height: 400px;
      transform-style: preserve-3d;
      will-change: transform, opacity;
      transition: none;
    }

    /* ─── Chandelier / dilution fridge tubes ─── */
    .qv-tube {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 4px;
      background: linear-gradient(180deg,
        rgba(0, 220, 208, 0.5) 0%,
        rgba(0, 180, 190, 0.15) 100%);
      box-shadow:
        0 0 20px rgba(0, 220, 208, 0.15),
        inset 0 0 8px rgba(0, 220, 208, 0.1);
    }

    .qv-tube--main {
      width: 4px;
      height: 100%;
      top: 0;
    }

    /* Horizontal plates / stages */
    .qv-plate {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 50%;
      border: 1.5px solid rgba(0, 220, 208, 0.25);
      background: radial-gradient(
        ellipse at center,
        rgba(0, 220, 208, 0.06) 0%,
        rgba(0, 220, 208, 0.02) 60%,
        transparent 100%
      );
      box-shadow: 0 0 30px rgba(0, 220, 208, 0.08);
    }

    /* Vertical connector rods */
    .qv-rod {
      position: absolute;
      width: 1.5px;
      background: linear-gradient(180deg,
        rgba(0, 220, 208, 0.35),
        rgba(0, 220, 208, 0.08));
      box-shadow: 0 0 6px rgba(0, 220, 208, 0.1);
    }

    /* Central qubit chip glow */
    .qv-chip {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 4px;
      background: rgba(0, 220, 208, 0.15);
      border: 1px solid rgba(0, 220, 208, 0.4);
      box-shadow:
        0 0 40px rgba(0, 220, 208, 0.2),
        0 0 80px rgba(0, 220, 208, 0.08),
        inset 0 0 12px rgba(0, 220, 208, 0.15);
      animation: qv-chip-pulse 3s ease-in-out infinite;
    }

    @keyframes qv-chip-pulse {
      0%, 100% { box-shadow: 0 0 40px rgba(0,220,208,0.2), 0 0 80px rgba(0,220,208,0.08), inset 0 0 12px rgba(0,220,208,0.15); }
      50% { box-shadow: 0 0 60px rgba(0,220,208,0.35), 0 0 120px rgba(0,220,208,0.12), inset 0 0 20px rgba(0,220,208,0.25); }
    }

    /* Floating particles around machine */
    .qv-particle {
      position: absolute;
      border-radius: 50%;
      background: rgba(0, 220, 208, 0.6);
      box-shadow: 0 0 8px rgba(0, 220, 208, 0.4);
      animation: qv-float linear infinite;
    }

    @keyframes qv-float {
      0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateY(-200px) translateX(30px) scale(0.3); opacity: 0; }
    }

    /* Wire grid on plates */
    .qv-grid {
      position: absolute;
      inset: 15%;
      border-radius: 50%;
      opacity: 0.3;
      background:
        repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(0,220,208,0.15) 8px, rgba(0,220,208,0.15) 9px),
        repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,220,208,0.15) 8px, rgba(0,220,208,0.15) 9px);
    }

    /* Glow ring */
    .qv-ring {
      position: absolute;
      border-radius: 50%;
      border: 1px solid rgba(0, 220, 208, 0.1);
      animation: qv-ring-pulse 4s ease-in-out infinite;
    }

    @keyframes qv-ring-pulse {
      0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
      50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.6; }
    }

    /* Scroll label */
    .qv-label {
      position: absolute;
      font-family: 'Outfit', 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: rgba(0, 220, 208, 0.3);
      white-space: nowrap;
      will-change: opacity;
    }

    /* ─── Ambient hex grid background ─── */
    .qv-hex-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300dcd0' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
  `;

  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ─── BUILD DOM ─────────────────────────
  // Hex background
  const hexBg = document.createElement("div");
  hexBg.className = "qv-hex-bg";
  document.body.appendChild(hexBg);

  // Main layer
  const layer = document.createElement("div");
  layer.className = "qv-layer";

  // Machine
  const machine = document.createElement("div");
  machine.className = "qv-machine";

  // Central tube
  const mainTube = document.createElement("div");
  mainTube.className = "qv-tube qv-tube--main";
  machine.appendChild(mainTube);

  // Plates (dilution refrigerator stages)
  const plateConfigs = [
    { top: "2%",  w: 200, h: 200 },
    { top: "18%", w: 170, h: 170 },
    { top: "35%", w: 140, h: 140 },
    { top: "52%", w: 110, h: 110 },
    { top: "70%", w: 80,  h: 80  },
    { top: "88%", w: 50,  h: 50  },
  ];

  plateConfigs.forEach((cfg, i) => {
    const plate = document.createElement("div");
    plate.className = "qv-plate";
    plate.style.top = cfg.top;
    plate.style.width = cfg.w + "px";
    plate.style.height = cfg.h + "px";

    // Add grid pattern to larger plates
    if (i < 3) {
      const grid = document.createElement("div");
      grid.className = "qv-grid";
      plate.appendChild(grid);
    }

    // Connector rods on larger plates
    if (i < 5) {
      const nextCfg = plateConfigs[i + 1];
      const rodH = parseInt(nextCfg.top) - parseInt(cfg.top);
      [-0.35, 0.35].forEach(offset => {
        const rod = document.createElement("div");
        rod.className = "qv-rod";
        rod.style.left = `calc(50% + ${offset * cfg.w}px)`;
        rod.style.top = cfg.top;
        rod.style.height = rodH + "%";
        machine.appendChild(rod);
      });
    }

    machine.appendChild(plate);
  });

  // Qubit chip at bottom
  const chip = document.createElement("div");
  chip.className = "qv-chip";
  chip.style.bottom = "6%";
  chip.style.width = "30px";
  chip.style.height = "30px";
  machine.appendChild(chip);

  // Glow rings
  [200, 300, 420].forEach((size, i) => {
    const ring = document.createElement("div");
    ring.className = "qv-ring";
    ring.style.width = size + "px";
    ring.style.height = size + "px";
    ring.style.left = "50%";
    ring.style.top = "50%";
    ring.style.transform = "translate(-50%, -50%)";
    ring.style.animationDelay = (i * 1.3) + "s";
    machine.appendChild(ring);
  });

  // Floating particles
  for (let i = 0; i < 12; i++) {
    const p = document.createElement("div");
    p.className = "qv-particle";
    const size = 2 + Math.random() * 3;
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.left = (20 + Math.random() * 60) + "%";
    p.style.top = (30 + Math.random() * 50) + "%";
    p.style.animationDuration = (3 + Math.random() * 4) + "s";
    p.style.animationDelay = (Math.random() * 5) + "s";
    machine.appendChild(p);
  }

  // Labels
  const labels = [
    { text: "Dilution Refrigerator", top: "5%", left: "calc(50% + 130px)" },
    { text: "Mixing Chamber", top: "55%", left: "calc(50% + 90px)" },
    { text: "Qubit Processor", top: "88%", left: "calc(50% + 55px)" },
  ];
  labels.forEach(cfg => {
    const lbl = document.createElement("div");
    lbl.className = "qv-label";
    lbl.textContent = cfg.text;
    lbl.style.top = cfg.top;
    lbl.style.left = cfg.left;
    machine.appendChild(lbl);
  });

  layer.appendChild(machine);
  document.body.appendChild(layer);

  // ─── SCROLL ANIMATION ─────────────────
  // Keyframes: [scrollPercent, translateX%, translateY%, rotateY°, rotateX°, scale, opacity]
  const keyframes = [
    [0,    -50,  -50,    0,    15,   1.0,  0.25],   // Center, subtle tilt, low opacity
    [8,    -50,  -50,    0,    10,   1.1,  0.4 ],   // Slight scale up, more visible
    [15,   -80,  -45,   -25,   5,    1.0,  0.35],   // Drift left, rotate
    [25,   -20,  -50,    30,   0,    0.9,  0.3 ],   // Swing right
    [35,   -50,  -55,    0,   -10,   1.15, 0.4 ],   // Center, tilt back, bigger
    [45,   -85,  -40,   -40,   5,    0.85, 0.25],   // Far left, rotate more
    [55,   -15,  -55,    45,  -5,    0.95, 0.3 ],   // Far right
    [65,   -50,  -50,    0,    20,   1.2,  0.35],   // Center, dramatic tilt
    [75,   -70,  -45,   -20,   10,   1.0,  0.25],   // Left drift
    [85,   -30,  -50,    15,   0,    1.1,  0.3 ],   // Right
    [95,   -50,  -50,    0,    5,    1.0,  0.15],   // Settle center, fade
    [100,  -50,  -50,    0,    0,    0.9,  0.08],   // Almost gone
  ];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getScrollPercent() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return 0;
    return (window.scrollY / h) * 100;
  }

  function interpolateKeyframes(pct) {
    // Find surrounding keyframes
    let lo = keyframes[0];
    let hi = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (pct >= keyframes[i][0] && pct <= keyframes[i + 1][0]) {
        lo = keyframes[i];
        hi = keyframes[i + 1];
        break;
      }
    }

    const range = hi[0] - lo[0];
    const t = range === 0 ? 0 : (pct - lo[0]) / range;
    // Ease
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    return {
      tx: lerp(lo[1], hi[1], eased),
      ty: lerp(lo[2], hi[2], eased),
      ry: lerp(lo[3], hi[3], eased),
      rx: lerp(lo[4], hi[4], eased),
      s:  lerp(lo[5], hi[5], eased),
      o:  lerp(lo[6], hi[6], eased),
    };
  }

  let ticking = false;

  function updateScroll() {
    const pct = getScrollPercent();
    const v = interpolateKeyframes(pct);

    machine.style.transform =
      `translate(${v.tx}%, ${v.ty}%) ` +
      `rotateY(${v.ry}deg) ` +
      `rotateX(${v.rx}deg) ` +
      `scale(${v.s})`;
    machine.style.opacity = v.o;

    // Labels fade based on rotation angle
    const labelOpacity = Math.max(0, 1 - Math.abs(v.ry) / 30) * v.o;
    machine.querySelectorAll(".qv-label").forEach(l => {
      l.style.opacity = labelOpacity;
    });

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  });

  // Initial position
  updateScroll();

})();
