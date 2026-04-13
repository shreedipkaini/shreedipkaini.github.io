/* ═══════════════════════════════════════════════════════════════
   QUANTUM VISUAL — Sketchfab 3D Background
   Self-contained. No changes needed to any other file.
   
   - Preloads 3D model behind password gate
   - Auto-detects gate unlock (watches #gate-overlay removal)
   - Pop-zoom reveal animation on access
   - Scroll-driven parallax + fade
   - Hides all Sketchfab UI (click-hold icon, watermark, etc.)
   
   USAGE: Add 1 line before </body> in index.html:
     <script src="quantum-visual.js"></script>
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var MODEL_UID = "82006aac41744663a161ab844264ac2a";
  var GATE_OVERLAY_ID = "gate-overlay";
  var GATE_HIDDEN_CLASS = "gate-overlay--hidden";
  var GATE_SESSION_KEY = "sk_gate_auth";

  // ─── STYLES ────────────────────────
  var css = document.createElement("style");
  css.textContent = [
    /* Wrapper — fixed behind content, right-aligned */
    ".qv-wrap {",
    "  position: fixed;",
    "  top: 0; right: -8%;",
    "  width: 70%; height: 100%;",
    "  z-index: 0;",
    "  pointer-events: none;",
    "  overflow: hidden;",
    "  opacity: 0;",
    "  transform: scale(0.65) translateY(8%);",
    "  mask-image: radial-gradient(ellipse 75% 75% at 60% 50%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 75%);",
    "  -webkit-mask-image: radial-gradient(ellipse 75% 75% at 60% 50%, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 75%);",
    "}",

    /* Reveal animation */
    ".qv-wrap--pop {",
    "  transition: opacity 1.6s cubic-bezier(0.16, 1, 0.3, 1),",
    "              transform 2s cubic-bezier(0.16, 1, 0.3, 1);",
    "  opacity: 1;",
    "  transform: scale(1) translateY(0);",
    "}",

    /* Settled */
    ".qv-wrap--live {",
    "  opacity: 1;",
    "  transform: scale(1) translateY(0);",
    "  transition: none;",
    "}",

    /* Iframe */
    ".qv-wrap iframe {",
    "  width: 100%; height: 100%;",
    "  border: none;",
    "  filter: brightness(0.30) saturate(0.50) contrast(1.2);",
    "  transition: filter 0.5s ease;",
    "}",


    /* Bottom cover — hides "click & hold", watermark */
    ".qv-cover-bot {",
    "  position: absolute; bottom: 0; left: 0; right: 0;",
    "  height: 130px; z-index: 1; pointer-events: none;",
    "  background: linear-gradient(0deg, rgba(5,12,20,1) 0%, rgba(5,12,20,0.7) 50%, transparent 100%);",
    "}",

    /* Top cover */
    ".qv-cover-top {",
    "  position: absolute; top: 0; left: 0; right: 0;",
    "  height: 50px; z-index: 1; pointer-events: none;",
    "  background: linear-gradient(180deg, rgba(5,12,20,0.5) 0%, transparent 100%);",
    "}",

    /* Hex lattice bg */
    ".qv-hex {",
    "  position: fixed; inset: 0; z-index: 0;",
    "  pointer-events: none; opacity: 0.025;",
    "  background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300dcd0' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\");",
    "}",

    /* Mobile */
    "@media (max-width: 768px) {",
    "  .qv-wrap { right: -20%; width: 90%; }",
    "  .qv-wrap iframe { filter: brightness(0.18) saturate(0.35) contrast(1.15); }",
    "  .qv-wrap--live:hover iframe { filter: brightness(0.28) saturate(0.5) contrast(1.1); }",
    "}",
  ].join("\n");
  document.head.appendChild(css);

  // ─── BUILD DOM ─────────────────────
  // Hex bg
  var hex = document.createElement("div");
  hex.className = "qv-hex";
  document.body.appendChild(hex);

  // Wrapper
  var wrap = document.createElement("div");
  wrap.className = "qv-wrap";

  // Iframe — eager load, all UI hidden
  var iframe = document.createElement("iframe");
  iframe.title = "Quantum Computer";
  iframe.allow = "autoplay; fullscreen; xr-spatial-tracking";
  iframe.setAttribute("allowfullscreen", "");
  iframe.loading = "eager";
  iframe.src = "https://sketchfab.com/models/" + MODEL_UID + "/embed" +
    "?autostart=1&autospin=0.1&camera=0&preload=1&transparent=1" +
    "&ui_stop=0&ui_inspector=0&ui_watermark_link=0&ui_watermark=0" +
    "&ui_infos=0&ui_ar=0&ui_help=0&ui_settings=0&ui_vr=0" +
    "&ui_fullscreen=0&ui_annotations=0&ui_fadeout=0&ui_controls=0" +
    "&ui_general_controls=0&ui_loading=0&ui_hint=0" +
    "&scrollwheel=0&double_click=0";
  wrap.appendChild(iframe);

  // Covers
  var cBot = document.createElement("div");
  cBot.className = "qv-cover-bot";
  wrap.appendChild(cBot);

  var cTop = document.createElement("div");
  cTop.className = "qv-cover-top";
  wrap.appendChild(cTop);

  document.body.appendChild(wrap);

  // ─── REVEAL LOGIC ─────────────────
  var revealed = false;

  function doReveal() {
    if (revealed) return;
    revealed = true;

    // Delay slightly so gate fade-out starts first
    setTimeout(function () {
      wrap.classList.add("qv-wrap--pop");

      // After pop animation → switch to live (enables scroll + hover)
      setTimeout(function () {
        wrap.classList.remove("qv-wrap--pop");
        wrap.classList.add("qv-wrap--live");
      }, 2200);
    }, 500);
  }

  // ─── GATE DETECTION ───────────────
  // Strategy 1: Watch #gate-overlay for hidden class or removal
  // Strategy 2: Check sessionStorage (already authed → no gate exists)
  // Strategy 3: No gate at all → reveal immediately

  function startWatching() {
    var gate = document.getElementById(GATE_OVERLAY_ID);

    // No gate exists → already authed or no gate.js loaded
    if (!gate) {
      // Double-check: maybe gate.js hasn't rendered yet
      // Wait a tick, then check again
      setTimeout(function () {
        var g2 = document.getElementById(GATE_OVERLAY_ID);
        if (!g2) {
          doReveal();
        } else {
          observeGate(g2);
        }
      }, 500);
      return;
    }

    observeGate(gate);
  }

  function observeGate(gate) {
    // Watch for class change (gate adds "gate-overlay--hidden")
    var classObs = new MutationObserver(function () {
      if (gate.classList.contains(GATE_HIDDEN_CLASS)) {
        classObs.disconnect();
        doReveal();
      }
    });
    classObs.observe(gate, { attributes: true, attributeFilter: ["class"] });

    // Also watch for node removal from body
    var removeObs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var removed = mutations[i].removedNodes;
        for (var j = 0; j < removed.length; j++) {
          if (removed[j] === gate || removed[j].id === GATE_OVERLAY_ID) {
            removeObs.disconnect();
            doReveal();
            return;
          }
        }
      }
    });
    removeObs.observe(document.body, { childList: true });
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startWatching);
  } else {
    startWatching();
  }

  // ─── SCROLL PARALLAX ──────────────
  var scrollPct = 0;
  var curY = 0;
  var curBright = 0.30;

  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    scrollPct = h > 0 ? window.scrollY / h : 0;
  });

  function tick() {
    requestAnimationFrame(tick);
    if (!revealed) return;

    // Drift up on scroll
    var tgtY = scrollPct * -10;
    curY += (tgtY - curY) * 0.05;

    // Darken as scroll
    var tgtB = Math.max(0.08, 0.30 - scrollPct * 0.22);
    curBright += (tgtB - curBright) * 0.05;

    // Apply only if live and not hovered
    if (wrap.classList.contains("qv-wrap--live")) {
      wrap.style.transform = "scale(1) translateY(" + curY + "%)";
      if (!wrap.matches(":hover")) {
        iframe.style.filter = "brightness(" + curBright + ") saturate(0.50) contrast(1.2)";
      }
    }
  }
  tick();

})();
