/* ═══════════════════════════════════════════════════════════════
   QUANTUM VISUAL — Three.js + Google Drive GLTF
   Scroll-driven 3D quantum computer model.
   
   USAGE: Add 1 line before </body> in index.html:
     <script src="quantum-visual.js"></script>
   
   Model hosted on Google Drive (no local files needed).
   ═══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  // ─── GOOGLE DRIVE FILE IDS ──────────
  const GLTF_ID = "1TWdlzEZrwVw5967jRTVI_UJjU82B7eiy";
  const BIN_ID  = "1fs8w6M7MeNhj-8ALw8MjzpeMfsLrYEJU";

  const GLTF_URL = "https://drive.google.com/uc?export=download&id=" + GLTF_ID;
  const BIN_URL  = "https://drive.google.com/uc?export=download&id=" + BIN_ID;

  const CANVAS_ID = "qv-canvas";

  // Scroll keyframes: [scrollPct, rotY°, rotX°, posX, posY, posZ, scale, opacity]
  const KF = [
    [0,     0,    5,    0,   0,   0,   1.0,  0.30],
    [8,    10,    3,    0,   0,   0,   1.05, 0.45],
    [15,  -30,    0,   -3,   0,   0,   1.0,  0.35],
    [25,   35,   -5,    3,   0.5, 0,   0.95, 0.30],
    [35,    0,   10,    0,   0,   0,   1.15, 0.45],
    [45,  -45,    5,   -4,  -0.5, 0,   0.85, 0.25],
    [55,   50,   -3,    4,   0,   0,   0.95, 0.30],
    [65,    0,   15,    0,   0.5, 0,   1.20, 0.40],
    [75,  -25,    5,   -2,   0,   0,   1.0,  0.25],
    [85,   20,    0,    2,   0,   0,   1.05, 0.30],
    [95,    0,    3,    0,   0,   0,   1.0,  0.15],
    [100,   0,    0,    0,   0,   0,   0.9,  0.08],
  ];

  // ─── INJECT STYLES ─────────────────
  const style = document.createElement("style");
  style.textContent = `
    #${CANVAS_ID} {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 0;
      pointer-events: none;
    }
    .qv-loader {
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
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      border-radius: 8px;
      background: rgba(5, 12, 20, 0.8);
      border: 1px solid rgba(0, 220, 208, 0.1);
      backdrop-filter: blur(8px);
      transition: opacity 0.5s;
    }
    .qv-loader__bar {
      width: 80px; height: 3px;
      border-radius: 2px;
      background: rgba(0, 220, 208, 0.1);
      overflow: hidden;
    }
    .qv-loader__fill {
      height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, #00dcd0, #00ffe6);
      transition: width 0.3s;
    }
    .qv-hex-bg {
      position: fixed; inset: 0;
      z-index: 0; pointer-events: none;
      opacity: 0.025;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300dcd0' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
  `;
  document.head.appendChild(style);

  // ─── HEX BG ─────────────────────────
  document.body.appendChild(Object.assign(document.createElement("div"), { className: "qv-hex-bg" }));

  // ─── LOADER UI ──────────────────────
  const loader = document.createElement("div");
  loader.className = "qv-loader";
  loader.innerHTML = `
    <span>Loading Quantum Model</span>
    <div class="qv-loader__bar"><div class="qv-loader__fill" id="qv-fill" style="width:0%"></div></div>
    <span id="qv-pct">0%</span>
  `;
  document.body.appendChild(loader);

  function updateProgress(pct) {
    const fill = document.getElementById("qv-fill");
    const txt = document.getElementById("qv-pct");
    if (fill) fill.style.width = pct + "%";
    if (txt) txt.textContent = pct + "%";
  }

  function hideLoader() {
    loader.style.opacity = "0";
    setTimeout(() => loader.remove(), 500);
  }

  function showError(msg) {
    loader.innerHTML = `<span style="color:#ff6b6b;">${msg}</span>`;
  }

  // ─── CANVAS ─────────────────────────
  const canvas = document.createElement("canvas");
  canvas.id = CANVAS_ID;
  document.body.appendChild(canvas);

  // ─── LOAD SCRIPTS ───────────────────
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ─── FETCH GLTF FROM GOOGLE DRIVE ──
  // Google Drive doesn't support range requests or relative paths,
  // so we fetch .gltf JSON, rewrite buffer URI to Drive .bin URL,
  // convert to blob URL, and feed to GLTFLoader.
  async function fetchModelFromDrive() {
    updateProgress(5);

    // 1. Fetch GLTF JSON
    const gltfRes = await fetch(GLTF_URL);
    if (!gltfRes.ok) throw new Error("Failed to fetch scene.gltf from Google Drive");
    const gltfText = await gltfRes.text();
    updateProgress(15);

    // 2. Parse and rewrite buffer URI to point to Drive bin URL
    const gltfJson = JSON.parse(gltfText);

    // 3. Fetch the .bin as arraybuffer
    updateProgress(20);
    const binRes = await fetch(BIN_URL);
    if (!binRes.ok) throw new Error("Failed to fetch scene.bin from Google Drive");

    // Track download progress
    const contentLength = binRes.headers.get("content-length");
    const total = contentLength ? parseInt(contentLength) : 0;
    const reader = binRes.body.getReader();
    const chunks = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      if (total > 0) {
        updateProgress(20 + Math.round((loaded / total) * 60));
      }
    }

    // Combine chunks into single arraybuffer
    const binBlob = new Blob(chunks);
    const binBlobUrl = URL.createObjectURL(binBlob);
    updateProgress(85);

    // 4. Rewrite buffer URI in gltf
    if (gltfJson.buffers && gltfJson.buffers.length > 0) {
      gltfJson.buffers[0].uri = binBlobUrl;
    }

    // 5. Create blob URL for modified gltf
    const gltfBlob = new Blob([JSON.stringify(gltfJson)], { type: "application/json" });
    const gltfBlobUrl = URL.createObjectURL(gltfBlob);
    updateProgress(90);

    return { gltfUrl: gltfBlobUrl, binBlobUrl };
  }

  // ─── THREE.JS SCENE ────────────────
  let scene, camera, renderer, model;
  let pointLight;
  let scrollPct = 0;

  function initScene(gltfUrl) {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 18);
    camera.lookAt(0, 0, 0);

    // Quantum-tinted lighting
    scene.add(new THREE.AmbientLight(0x0a2030, 0.6));

    const dir1 = new THREE.DirectionalLight(0x00dcd0, 1.2);
    dir1.position.set(5, 10, 7);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x006680, 0.6);
    dir2.position.set(-5, 3, -5);
    scene.add(dir2);

    pointLight = new THREE.PointLight(0x00ffe6, 0.8, 30);
    pointLight.position.set(0, -2, 5);
    scene.add(pointLight);

    scene.add(Object.assign(new THREE.DirectionalLight(0x00dcd0, 0.3), { position: new THREE.Vector3(0, 0, -10) }));

    // Load model from blob URL
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load(
      gltfUrl,
      (gltf) => {
        model = gltf.scene;

        // Auto-center + scale
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 8 / maxDim;
        model.scale.set(s, s, s);
        model.position.sub(center.multiplyScalar(s));

        // Quantum material tint
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            const mat = child.material;
            if (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial) {
              mat.emissive = new THREE.Color(0x001a1a);
              mat.emissiveIntensity = 0.15;
              mat.metalness = Math.min((mat.metalness || 0) + 0.1, 1.0);
              mat.roughness = Math.max((mat.roughness || 0.5) - 0.1, 0.0);
              mat.needsUpdate = true;
            }
          }
        });

        scene.add(model);
        updateProgress(100);
        hideLoader();
        animate();
      },
      undefined,
      (err) => {
        console.error("[QV] GLTFLoader error:", err);
        showError("Model parse failed. Check console.");
      }
    );

    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener("scroll", () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      scrollPct = h > 0 ? (window.scrollY / h) * 100 : 0;
    });
  }

  // ─── INTERPOLATION ──────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function getKFValues(pct) {
    let lo = KF[0], hi = KF[KF.length - 1];
    for (let i = 0; i < KF.length - 1; i++) {
      if (pct >= KF[i][0] && pct <= KF[i + 1][0]) { lo = KF[i]; hi = KF[i + 1]; break; }
    }
    const range = hi[0] - lo[0];
    const t = range === 0 ? 0 : easeInOut((pct - lo[0]) / range);
    return {
      rotY: lerp(lo[1], hi[1], t) * (Math.PI / 180),
      rotX: lerp(lo[2], hi[2], t) * (Math.PI / 180),
      posX: lerp(lo[3], hi[3], t),
      posY: lerp(lo[4], hi[4], t),
      posZ: lerp(lo[5], hi[5], t),
      scale: lerp(lo[6], hi[6], t),
      opacity: lerp(lo[7], hi[7], t),
    };
  }

  // ─── RENDER LOOP ────────────────────
  const cv = { rotY: 0, rotX: 0, posX: 0, posY: 0, posZ: 0, scale: 1, opacity: 0.3 };
  const SM = 0.06;

  function animate() {
    requestAnimationFrame(animate);
    if (!model) return;

    const tgt = getKFValues(scrollPct);
    cv.rotY    += (tgt.rotY - cv.rotY) * SM;
    cv.rotX    += (tgt.rotX - cv.rotX) * SM;
    cv.posX    += (tgt.posX - cv.posX) * SM;
    cv.posY    += (tgt.posY - cv.posY) * SM;
    cv.posZ    += (tgt.posZ - cv.posZ) * SM;
    cv.scale   += (tgt.scale - cv.scale) * SM;
    cv.opacity += (tgt.opacity - cv.opacity) * SM;

    model.rotation.y = cv.rotY + performance.now() * 0.0001;
    model.rotation.x = cv.rotX;
    model.position.set(cv.posX, cv.posY, cv.posZ);
    const s = cv.scale;
    model.scale.set(s, s, s);

    model.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = cv.opacity;
      }
    });

    pointLight.intensity = (0.6 + 0.4 * Math.sin(performance.now() * 0.002)) * cv.opacity * 3;
    renderer.render(scene, camera);
  }

  // ─── BOOT ──────────────────────────
  async function boot() {
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js");

      const { gltfUrl } = await fetchModelFromDrive();
      initScene(gltfUrl);
    } catch (err) {
      console.error("[QV] Boot failed:", err);
      showError("Failed to load model: " + err.message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
