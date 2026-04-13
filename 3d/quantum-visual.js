/* ═══════════════════════════════════════════════════════════════
   QUANTUM VISUAL — Sketchfab Embed + Scroll Control
   
   Uses Sketchfab Viewer API to control camera on scroll.
   No file hosting, no CORS, no Three.js needed.
   
   USAGE: Add 1 line before </body> in index.html:
     <script src="quantum-visual.js"></script>
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  const MODEL_UID = "82006aac41744663a161ab844264ac2a";

  // ─── INJECT STYLES ─────────────────
  const style = document.createElement("style");
  style.textContent = `
    .qv-container {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .qv-container iframe {
      width: 100%;
      height: 80%;
      border: none;
      pointer-events: none;
    }
    /* Opacity overlay — controlled by JS */
    .qv-fade {
      position: fixed;
      inset: 0;
      z-index: 0;
      background: radial-gradient(ellipse at 20% 0%, #0a1628 0%, #050c14 50%, #020608 100%);
      pointer-events: none;
      transition: opacity 0.1s linear;
    }
    /* Hex lattice */
    .qv-hex-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      opacity: 0.025;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300dcd0' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    /* Loading */
    .qv-loading {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      font-family: 'Outfit', 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(0, 220, 208, 0.5);
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(5, 12, 20, 0.8);
      border: 1px solid rgba(0, 220, 208, 0.1);
      backdrop-filter: blur(9px);
      transition: opacity 0.5s;
    }
  `;
  document.head.appendChild(style);

  // ─── DOM ────────────────────────────
  // Hex bg
  document.body.appendChild(Object.assign(document.createElement("div"), { className: "qv-hex-bg" }));

  // Fade overlay (controls opacity of background showing through)
  const fadeOverlay = document.createElement("div");
  fadeOverlay.className = "qv-fade";
  fadeOverlay.style.opacity = "0.65";
  document.body.appendChild(fadeOverlay);

  // Container
  const container = document.createElement("div");
  container.className = "qv-container";
  document.body.appendChild(container);

  // Loading indicator
  const loadingEl = document.createElement("div");
  loadingEl.className = "qv-loading";
  loadingEl.textContent = "Loading Quantum Model...";
  document.body.appendChild(loadingEl);

  // ─── SKETCHFAB IFRAME ──────────────
  // Params: no UI, transparent-ish, autospin, autostart
  const params = [
    "autostart=1",
    "autospin=0.15",
    "camera=0",
    "ui_stop=0",
    "ui_inspector=0",
    "ui_watermark_link=0",
    "ui_watermark=0",
    "ui_infos=0",
    "ui_ar=0",
    "ui_help=0",
    "ui_settings=0",
    "ui_vr=0",
    "ui_fullscreen=0",
    "ui_annotations=0",
    "ui_fadeout=0",
    "transparent=1",
    "ui_controls=0",
    "ui_general_controls=0",
    "ui_loading=0",
    "ui_color=00dcd0",
    "scrollwheel=0",
    "double_click=0",
    "orbit_constraint_pitch_down=0",
    "orbit_constraint_pitch_up=0",
  ].join("&");

  const iframe = document.createElement("iframe");
  iframe.id = "qv-sketchfab";
  iframe.title = "Quantum Computer 3D Model";
  iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
  iframe.src = `https://sketchfab.com/models/${MODEL_UID}/embed?${params}`;
  container.appendChild(iframe);

  // ─── SCROLL-DRIVEN EFFECTS ─────────
  // Since Sketchfab API (camera control) requires the paid plan for
  // setCameraLookAt via JS, we use CSS transforms on the iframe +
  // opacity overlay for Apple-style scroll effects.

  // Scroll keyframes: [scrollPct, translateX%, translateY%, rotateZ°, scale, overlayOpacity]
  // overlayOpacity: higher = more faded/hidden, lower = more visible
  const KF = [
    [0,    0,     0,     0,    1.2,   0.60],
    [8,    0,     0,     0,    1.25,  0.50],
    [15,  -15,    0,    -2,    1.2,   0.58],
    [25,   15,    3,     2,    1.15,  0.62],
    [35,   0,     0,     0,    1.3,   0.50],
    [45,  -20,   -2,    -3,    1.15,  0.65],
    [55,   20,    2,     3,    1.2,   0.58],
    [65,   0,     0,     0,    1.35,  0.48],
    [75,  -10,    0,    -1,    1.2,   0.60],
    [85,   10,    0,     1,    1.25,  0.55],
    [95,   0,     0,     0,    1.15,  0.70],
    [100,  0,     0,     0,    1.1,   0.82],
  ];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function getValues(pct) {
    let lo = KF[0], hi = KF[KF.length - 1];
    for (let i = 0; i < KF.length - 1; i++) {
      if (pct >= KF[i][0] && pct <= KF[i + 1][0]) { lo = KF[i]; hi = KF[i + 1]; break; }
    }
    const range = hi[0] - lo[0];
    const t = range === 0 ? 0 : ease((pct - lo[0]) / range);
    return {
      tx:      lerp(lo[1], hi[1], t),
      ty:      lerp(lo[2], hi[2], t),
      rz:      lerp(lo[3], hi[3], t),
      scale:   lerp(lo[4], hi[4], t),
      fadeOp:  lerp(lo[5], hi[5], t),
    };
  }

  // Smooth current values
  const cv = { tx: 0, ty: 0, rz: 0, scale: 1.2, fadeOp: 0.6 };
  const SM = 0.05;
  let scrollPct = 0;
  let ticking = false;

  function updateScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollPct = h > 0 ? (window.scrollY / h) * 100 : 0;

    const tgt = getValues(scrollPct);
    cv.tx     += (tgt.tx - cv.tx) * SM;
    cv.ty     += (tgt.ty - cv.ty) * SM;
    cv.rz     += (tgt.rz - cv.rz) * SM;
    cv.scale  += (tgt.scale - cv.scale) * SM;
    cv.fadeOp += (tgt.fadeOp - cv.fadeOp) * SM;

    iframe.style.transform =
      `translate(${cv.tx}%, ${cv.ty}%) ` +
      `rotate(${cv.rz}deg) ` +
      `scale(${cv.scale})`;

    fadeOverlay.style.opacity = cv.fadeOp;

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll);

  // Smooth animation loop for idle smoothing even without scroll
  function smoothLoop() {
    requestAnimationFrame(smoothLoop);
    const tgt = getValues(scrollPct);
    cv.tx     += (tgt.tx - cv.tx) * SM;
    cv.ty     += (tgt.ty - cv.ty) * SM;
    cv.rz     += (tgt.rz - cv.rz) * SM;
    cv.scale  += (tgt.scale - cv.scale) * SM;
    cv.fadeOp += (tgt.fadeOp - cv.fadeOp) * SM;

    iframe.style.transform =
      `translate(${cv.tx}%, ${cv.ty}%) ` +
      `rotate(${cv.rz}deg) ` +
      `scale(${cv.scale})`;
    fadeOverlay.style.opacity = cv.fadeOp;
  }
  smoothLoop();

  // ─── HIDE LOADER WHEN IFRAME LOADS ──
  iframe.addEventListener("load", () => {
    loadingEl.style.opacity = "0";
    setTimeout(() => loadingEl.remove(), 500);
  });

  // Initial position
  updateScroll();

})();
