/* ═══════════════════════════════════════════════════════════════
   QUANTUM VISUAL — Sketchfab Embed (Subtle + Interactive)
   
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
      top: -10%;
      right: -15%;
      width: 80%;
      height: 120%;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      /* Darken + blend model into dark background */
      mix-blend-mode: lighten;
      filter: brightness(0.3) saturate(0.7) contrast(1.1);
      transition: filter 0.5s ease;
      mask-image: radial-gradient(
        ellipse 70% 70% at 60% 50%,
        rgba(0,0,0,0.6) 0%,
        rgba(0,0,0,0.3) 40%,
        transparent 75%
      );
      -webkit-mask-image: radial-gradient(
        ellipse 70% 70% at 60% 50%,
        rgba(0,0,0,0.6) 0%,
        rgba(0,0,0,0.3) 40%,
        transparent 75%
      );
    }

    /* On hover — brighten slightly, enable interaction */
    .qv-container:hover {
      pointer-events: auto;
      filter: brightness(0.45) saturate(0.8) contrast(1.1);
    }

    .qv-container iframe {
      width: 100%;
      height: 100%;
      border: none;
      opacity: 0.6;
      transition: opacity 0.5s ease;
    }

    .qv-container:hover iframe {
      opacity: 0.8;
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

    /* Subtle interact hint */
    .qv-hint {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 2;
      font-family: 'Outfit', 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(0, 220, 208, 0.2);
      padding: 6px 12px;
      border-radius: 6px;
      border: 1px solid rgba(0, 220, 208, 0.06);
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.4s;
    }
    .qv-container:hover ~ .qv-hint {
      opacity: 1;
    }

    /* ─── Responsive ──────────────────── */
    @media (max-width: 768px) {
      .qv-container {
        right: -30%;
        width: 100%;
        filter: brightness(0.2) saturate(0.5) contrast(1.1);
      }
      .qv-container:hover {
        filter: brightness(0.3) saturate(0.6) contrast(1.1);
      }
    }
  `;
  document.head.appendChild(style);

  // ─── DOM ────────────────────────────
  // Hex bg
  document.body.appendChild(Object.assign(document.createElement("div"), { className: "qv-hex-bg" }));

  // Container (positioned right side)
  const container = document.createElement("div");
  container.className = "qv-container";
  document.body.appendChild(container);

  // Sketchfab iframe — all UI hidden, transparent bg, autospin
  const params = [
    "autostart=1",
    "autospin=0.12",
    "camera=0",
    "transparent=1",
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
    "ui_controls=0",
    "ui_general_controls=0",
    "ui_loading=0",
    "ui_color=00dcd0",
    "scrollwheel=0",
    "double_click=0",
    "preload=1",
    "orbit_constraint_zoom_in=0",
    "orbit_constraint_zoom_out=0",
  ].join("&");

  const iframe = document.createElement("iframe");
  iframe.title = "Quantum Computer 3D Model";
  iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
  iframe.loading = "lazy";
  iframe.src = `https://sketchfab.com/models/${MODEL_UID}/embed?${params}`;
  container.appendChild(iframe);

  // Hint
  const hint = document.createElement("div");
  hint.className = "qv-hint";
  hint.textContent = "Hover right side to interact with 3D model";
  document.body.appendChild(hint);

  // ─── SCROLL-DRIVEN POSITION ────────
  // Shift model position on scroll for parallax feel
  let scrollPct = 0;
  let currentY = 0;
  let currentBrightness = 0.3;

  function onScroll() {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollPct = h > 0 ? window.scrollY / h : 0;

    // Parallax — model drifts up slower than scroll
    const targetY = scrollPct * -15;
    currentY += (targetY - currentY) * 0.08;

    // Fade model more as user scrolls deeper
    const targetB = 0.3 - scrollPct * 0.2; // 0.3 → 0.1
    currentBrightness += (targetB - currentBrightness) * 0.08;

    container.style.transform = `translateY(${currentY}%)`;

    // Only update filter if not hovered (hover has its own filter)
    if (!container.matches(':hover')) {
      container.style.filter = `brightness(${Math.max(0.08, currentBrightness)}) saturate(0.7) contrast(1.1)`;
    }
  }

  // Smooth loop
  function loop() {
    requestAnimationFrame(loop);
    onScroll();
  }

  window.addEventListener("scroll", () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    scrollPct = h > 0 ? window.scrollY / h : 0;
  });

  loop();

})();
