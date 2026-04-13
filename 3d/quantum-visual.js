/* ═══════════════════════════════════════════════════════════════
   QUANTUM VISUAL — Sketchfab Viewer API + Scroll Zoom
   
   Scroll → camera moves to different parts of quantum computer.
   Uses Sketchfab Viewer API (free tier) for camera control.
   
   USAGE: Add before </body>:
     <script src="quantum-visual.js"></script>
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const MODEL_UID = "82006aac41744663a161ab844264ac2a";

  // ─── STYLES ────────────────────────
  const style = document.createElement("style");
  style.textContent = `
    .qv-wrap {
      position: fixed;
      top: 0;
      right: -10%;
      width: 75%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      mask-image: radial-gradient(
        ellipse 80% 80% at 65% 50%,
        rgba(0,0,0,0.7) 0%,
        rgba(0,0,0,0.35) 45%,
        transparent 78%
      );
      -webkit-mask-image: radial-gradient(
        ellipse 80% 80% at 65% 50%,
        rgba(0,0,0,0.7) 0%,
        rgba(0,0,0,0.35) 45%,
        transparent 78%
      );
    }
    .qv-wrap iframe {
      width: 100%;
      height: 100%;
      border: none;
      filter: brightness(0.35) saturate(0.6) contrast(1.15);
      transition: filter 0.6s ease;
    }
    .qv-wrap:hover {
      pointer-events: auto;
    }
    .qv-wrap:hover iframe {
      filter: brightness(0.5) saturate(0.75) contrast(1.1);
    }
    .qv-hex-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.025;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300dcd0' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    /* Section indicator */
    .qv-section-label {
      position: fixed;
      right: 32px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1;
      pointer-events: none;
      text-align: right;
    }
    .qv-section-label__text {
      font-family: 'Outfit', 'JetBrains Mono', monospace;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(0, 220, 208, 0.15);
      transition: all 0.5s;
      display: block;
      margin-bottom: 4px;
    }
    .qv-section-label__text--active {
      color: rgba(0, 220, 208, 0.35);
    }
    @media (max-width: 768px) {
      .qv-wrap {
        right: -25%;
        width: 90%;
      }
      .qv-wrap iframe {
        filter: brightness(0.22) saturate(0.4) contrast(1.1);
      }
      .qv-section-label { display: none; }
    }
  `;
  document.head.appendChild(style);

  // ─── DOM ────────────────────────────
  document.body.appendChild(Object.assign(document.createElement("div"), { className: "qv-hex-bg" }));

  const wrap = document.createElement("div");
  wrap.className = "qv-wrap";
  document.body.appendChild(wrap);

  // Iframe — using provided embed URL with minimal additions
  const iframe = document.createElement("iframe");
  iframe.id = "qv-api-frame";
  iframe.title = "Quantum Computer";
  iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
  iframe.setAttribute("allowfullscreen", "");
  iframe.src = [
    `https://sketchfab.com/models/${MODEL_UID}/embed`,
    "?autostart=1",
    "&camera=0",
    "&preload=1",
    "&transparent=1",
    "&autospin=0",
    "&ui_stop=0",
    "&ui_inspector=0",
    "&ui_watermark_link=0",
    "&ui_watermark=0",
    "&ui_infos=0",
    "&ui_ar=0",
    "&ui_help=0",
    "&ui_settings=0",
    "&ui_vr=0",
    "&ui_fullscreen=0",
    "&ui_annotations=0",
    "&ui_fadeout=0",
    "&ui_controls=0",
    "&ui_general_controls=0",
    "&ui_loading=0",
    "&scrollwheel=0",
    "&double_click=0",
  ].join("");
  wrap.appendChild(iframe);

  // Section labels (right side, shows which part camera focused on)
  const sectionNames = [
    "Full View",
    "Cryostat Top",
    "Cooling Stages",
    "Wiring Harness",
    "Qubit Chamber",
    "Processor Core",
    "Wide Pullback",
    "Final View",
  ];
  const labelWrap = document.createElement("div");
  labelWrap.className = "qv-section-label";
  sectionNames.forEach((name, i) => {
    const span = document.createElement("span");
    span.className = "qv-section-label__text";
    span.id = `qv-sl-${i}`;
    span.textContent = name;
    labelWrap.appendChild(span);
  });
  document.body.appendChild(labelWrap);

  // ─── SKETCHFAB VIEWER API ──────────
  // Load API script
  const apiScript = document.createElement("script");
  apiScript.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
  document.head.appendChild(apiScript);

  let api = null;
  let apiReady = false;

  apiScript.onload = () => {
    const client = new Sketchfab(iframe);
    client.init(MODEL_UID, {
      success: (a) => {
        api = a;
        api.addEventListener("viewerready", () => {
          apiReady = true;
          // Disable user camera interaction initially
          api.setUserInteraction(false);
        });
      },
      error: () => console.warn("[QV] Sketchfab API init failed — falling back to CSS-only"),
      autostart: 1,
      preload: 1,
      transparent: 1,
      camera: 0,
      ui_stop: 0,
      ui_watermark: 0,
      ui_infos: 0,
      ui_controls: 0,
    });
  };

  // Enable interaction on hover
  wrap.addEventListener("mouseenter", () => {
    if (api && apiReady) api.setUserInteraction(true);
  });
  wrap.addEventListener("mouseleave", () => {
    if (api && apiReady) api.setUserInteraction(false);
  });

  // ─── CAMERA KEYFRAMES ─────────────
  // Each: [scrollPct, camera_position[x,y,z], camera_target[x,y,z], sectionIndex]
  // These zoom into different parts of quantum computer as user scrolls
  const CAM_KF = [
    // Full view — wide establishing shot
    [0,   [0, 3, 12],     [0, 1, 0],      0],
    // Top of cryostat — zoom to top plate
    [12,  [3, 6, 6],      [0, 4, 0],      1],
    // Cooling stages — mid section side view
    [25,  [-4, 2, 5],     [0, 1.5, 0],    2],
    // Wiring — close up, slightly below
    [38,  [3, 0, 4],      [0, 0, 0],      3],
    // Qubit chamber — zoom in bottom
    [50,  [-2, -2, 3.5],  [0, -2, 0],     4],
    // Processor core — tight shot
    [62,  [1, -3, 2.5],   [0, -3, 0],     5],
    // Wide pullback — dramatic reveal
    [78,  [5, 4, 14],     [0, 0, 0],      6],
    // Final — settle
    [100, [0, 2, 10],     [0, 0, 0],      7],
  ];

  // ─── INTERPOLATION ────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function lerpVec(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }

  function getCamValues(pct) {
    let lo = CAM_KF[0], hi = CAM_KF[CAM_KF.length - 1];
    for (let i = 0; i < CAM_KF.length - 1; i++) {
      if (pct >= CAM_KF[i][0] && pct <= CAM_KF[i + 1][0]) {
        lo = CAM_KF[i];
        hi = CAM_KF[i + 1];
        break;
      }
    }
    const range = hi[0] - lo[0];
    const t = range === 0 ? 0 : ease((pct - lo[0]) / range);
    return {
      pos: lerpVec(lo[1], hi[1], t),
      tgt: lerpVec(lo[2], hi[2], t),
      section: t < 0.5 ? lo[3] : hi[3],
    };
  }

  // ─── SCROLL LOOP ──────────────────
  let scrollPct = 0;
  // Smoothed camera values
  let curPos = [0, 3, 12];
  let curTgt = [0, 1, 0];
  let curSection = 0;
  const SM = 0.04; // Smooth factor — very smooth camera movement

  // CSS fallback: also shift iframe via transform for parallax
  let curCssY = 0;
  let curBright = 0.35;

  function loop() {
    requestAnimationFrame(loop);

    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollPct = h > 0 ? (window.scrollY / h) * 100 : 0;

    const cam = getCamValues(scrollPct);

    // Smooth interpolation
    curPos = curPos.map((v, i) => v + (cam.pos[i] - v) * SM);
    curTgt = curTgt.map((v, i) => v + (cam.tgt[i] - v) * SM);

    // Send to Sketchfab API if ready and user not interacting
    if (api && apiReady && !wrap.matches(":hover")) {
      api.setCameraLookAt(curPos, curTgt, 0);
    }

    // Update section labels
    if (cam.section !== curSection) {
      curSection = cam.section;
      sectionNames.forEach((_, i) => {
        const el = document.getElementById(`qv-sl-${i}`);
        if (el) {
          el.classList.toggle("qv-section-label__text--active", i === curSection);
        }
      });
    }

    // CSS parallax fallback + brightness fade
    const targetCssY = scrollPct * -0.08;
    curCssY += (targetCssY - curCssY) * 0.06;

    const targetBright = Math.max(0.12, 0.35 - (scrollPct / 100) * 0.2);
    curBright += (targetBright - curBright) * 0.06;

    wrap.style.transform = `translateY(${curCssY}%)`;
    if (!wrap.matches(":hover")) {
      iframe.style.filter = `brightness(${curBright}) saturate(0.6) contrast(1.15)`;
    }
  }

  loop();

})();
