/* ═══════════════════════════════════════════
   GATEKEEPER — Auth Gate Logic
   
   SETUP INSTRUCTIONS:
   1. Go to https://www.emailjs.com → Create free account
   2. Add an email service (Gmail/Outlook) → note SERVICE_ID
   3. Create email template with variables:
        {{from_name}}, {{from_email}}, {{phone}},
        {{ip_address}}, {{user_agent}}, {{timestamp}}
      → note TEMPLATE_ID
   4. Get your PUBLIC_KEY from Account → API Keys
   5. Replace the 3 values in CONFIG below
   
   PASSWORD:
   Default password is "shreedip2026"
   To change: run in browser console:
     crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
       .then(h => console.log(Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('')))
   Then replace PASS_HASH below with output.
   ═══════════════════════════════════════════ */

const GATE_CONFIG = {
  // EmailJS credentials — REPLACE THESE
  EMAILJS_PUBLIC_KEY: "E0w-bHMxYgX_wA7yz",
  EMAILJS_SERVICE_ID: "service_duzsnrp",
  EMAILJS_TEMPLATE_ID: "template_er28y6j",

  // SHA-256 of "shreedip2026"
  PASS_HASH: "89aa143c79839a2da42557fb647f3fb37c40db7a1223b0cd7798a0331e05fcdf",

  // Max password attempts before lockout
  MAX_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 10,

  // Session key
  SESSION_KEY: "sk_gate_auth",
  ATTEMPTS_KEY: "sk_gate_attempts",
  LOCKOUT_KEY: "sk_gate_lockout",
};

/* ─── Utility: SHA-256 Hash ──────────── */
async function sha256(str) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(str)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ─── Utility: Get visitor IP ────────── */
async function getVisitorIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    return data.ip;
  } catch {
    try {
      const res2 = await fetch("https://ipapi.co/json/");
      const data2 = await res2.json();
      return data2.ip;
    } catch {
      return "Unknown";
    }
  }
}

/* ─── Gatekeeper Class ───────────────── */
class Gatekeeper {
  constructor() {
    this.visitorIP = "Detecting...";
    this.activeTab = "password";
    this.loading = false;

    this.init();
  }

  async init() {
    // Check if already authenticated
    if (sessionStorage.getItem(GATE_CONFIG.SESSION_KEY) === "true") {
      this.unlock();
      return;
    }

    this.render();
    this.bindEvents();

    // Fetch IP in background
    this.visitorIP = await getVisitorIP();
    const ipEl = document.getElementById("gate-ip-display");
    if (ipEl) ipEl.textContent = this.visitorIP;
  }

  /* ── Check lockout ─────────────────── */
  isLockedOut() {
    const lockUntil = localStorage.getItem(GATE_CONFIG.LOCKOUT_KEY);
    if (!lockUntil) return false;
    if (Date.now() < parseInt(lockUntil)) return true;
    // Lockout expired
    localStorage.removeItem(GATE_CONFIG.LOCKOUT_KEY);
    localStorage.removeItem(GATE_CONFIG.ATTEMPTS_KEY);
    return false;
  }

  getLockoutRemaining() {
    const lockUntil = parseInt(localStorage.getItem(GATE_CONFIG.LOCKOUT_KEY) || "0");
    return Math.max(0, Math.ceil((lockUntil - Date.now()) / 60000));
  }

  incrementAttempts() {
    const attempts = parseInt(localStorage.getItem(GATE_CONFIG.ATTEMPTS_KEY) || "0") + 1;
    localStorage.setItem(GATE_CONFIG.ATTEMPTS_KEY, attempts.toString());
    if (attempts >= GATE_CONFIG.MAX_ATTEMPTS) {
      const lockUntil = Date.now() + GATE_CONFIG.LOCKOUT_MINUTES * 60 * 1000;
      localStorage.setItem(GATE_CONFIG.LOCKOUT_KEY, lockUntil.toString());
    }
    return attempts;
  }

  /* ── Password verification ─────────── */
  async verifyPassword(input) {
    if (this.isLockedOut()) {
      this.showMessage("error", `Too many attempts. Try again in ${this.getLockoutRemaining()} minutes.`);
      return;
    }

    this.setLoading(true);
    const hash = await sha256(input.trim());

    if (hash === GATE_CONFIG.PASS_HASH) {
      localStorage.removeItem(GATE_CONFIG.ATTEMPTS_KEY);
      localStorage.removeItem(GATE_CONFIG.LOCKOUT_KEY);
      sessionStorage.setItem(GATE_CONFIG.SESSION_KEY, "true");
      this.showMessage("success", "Access granted. Welcome.");
      setTimeout(() => this.unlock(), 800);
    } else {
      const attempts = this.incrementAttempts();
      const remaining = GATE_CONFIG.MAX_ATTEMPTS - attempts;
      if (remaining > 0) {
        this.showMessage("error", `Incorrect password. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
      } else {
        this.showMessage("error", `Locked out for ${GATE_CONFIG.LOCKOUT_MINUTES} minutes.`);
      }
    }
    this.setLoading(false);
  }

  /* ── Access request via EmailJS ────── */
  async requestAccess(name, email, phone) {
    this.setLoading(true);

    const templateParams = {
      from_name: name,
      from_email: email,
      phone: phone,
      ip_address: this.visitorIP,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    try {
      // Load EmailJS SDK if not present
      if (!window.emailjs) {
        await this.loadEmailJS();
      }

      emailjs.init(GATE_CONFIG.EMAILJS_PUBLIC_KEY);
      await emailjs.send(
        GATE_CONFIG.EMAILJS_SERVICE_ID,
        GATE_CONFIG.EMAILJS_TEMPLATE_ID,
        templateParams
      );

      this.showMessage(
        "success",
        "Request sent! Shreedip will review and send you the password via email if approved."
      );

      // Disable form
      document.getElementById("gate-request-btn").disabled = true;
      document.getElementById("gate-request-btn").textContent = "REQUEST SENT";
    } catch (err) {
      console.error("EmailJS error:", err);
      this.showMessage(
        "error",
        "Failed to send request. Please try again or contact directly."
      );
    }

    this.setLoading(false);
  }

  loadEmailJS() {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /* ── UI Helpers ────────────────────── */
  unlock() {
    const overlay = document.getElementById("gate-overlay");
    if (overlay) {
      overlay.classList.add("gate-overlay--hidden");
      setTimeout(() => overlay.remove(), 600);
    }
  }

  showMessage(type, text) {
    const container = document.getElementById("gate-messages");
    if (!container) return;
    container.innerHTML = `<div class="gate-msg gate-msg--${type}">${text}</div>`;
  }

  setLoading(state) {
    this.loading = state;
    const btns = document.querySelectorAll(".gate-btn");
    btns.forEach((b) => {
      b.disabled = state;
      if (state) {
        b.dataset.origText = b.textContent;
        b.innerHTML = '<span class="gate-spinner"></span>Verifying...';
      } else if (b.dataset.origText) {
        b.textContent = b.dataset.origText;
      }
    });
  }

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll(".gate-tab").forEach((t) => {
      t.classList.toggle("gate-tab--active", t.dataset.tab === tab);
    });
    document.querySelectorAll(".gate-panel").forEach((p) => {
      p.classList.toggle("gate-panel--active", p.dataset.panel === tab);
    });
    // Clear messages on tab switch
    const container = document.getElementById("gate-messages");
    if (container) container.innerHTML = "";
  }

  /* ── Events ────────────────────────── */
  bindEvents() {
    // Tab switching
    document.querySelectorAll(".gate-tab").forEach((tab) => {
      tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
    });

    // Password form
    const passForm = document.getElementById("gate-pass-form");
    if (passForm) {
      passForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const val = document.getElementById("gate-pass-input").value;
        if (val) this.verifyPassword(val);
      });
    }

    // Password show/hide toggle
    const passInput = document.getElementById("gate-pass-input");
    const toggleBtn = document.getElementById("gate-pass-toggle");
    if (toggleBtn && passInput) {
      toggleBtn.addEventListener("click", () => {
        const isPass = passInput.type === "password";
        passInput.type = isPass ? "text" : "password";
        toggleBtn.textContent = isPass ? "🙈" : "👁️";
      });
    }

    // Request form
    const reqForm = document.getElementById("gate-request-form");
    if (reqForm) {
      reqForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("gate-req-name").value.trim();
        const email = document.getElementById("gate-req-email").value.trim();
        const phone = document.getElementById("gate-req-phone").value.trim();

        if (!name || !email || !phone) {
          this.showMessage("error", "All fields are required.");
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          this.showMessage("error", "Please enter a valid email.");
          return;
        }
        this.requestAccess(name, email, phone);
      });
    }

    // Enter key on password input
    if (passInput) {
      passInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          passForm.dispatchEvent(new Event("submit"));
        }
      });
    }
  }

  /* ── Render ────────────────────────── */
  render() {
    const lockedOut = this.isLockedOut();
    const lockMins = this.getLockoutRemaining();

    const html = `
      <div id="gate-overlay" class="gate-overlay">
        <div class="gate-box">

          <!-- Header -->
          <div class="gate-header">
            <span class="gate-header__icon">⚛️</span>
            <h1 class="gate-header__title">
              Shreedip <span class="accent">Kaini</span>
            </h1>
            <p class="gate-header__sub">This portfolio is access-restricted</p>
          </div>

          <!-- Tabs -->
          <div class="gate-tabs">
            <button class="gate-tab gate-tab--active" data-tab="password">
              🔑 Enter Password
            </button>
            <button class="gate-tab" data-tab="request">
              📩 Request Access
            </button>
          </div>

          <!-- Password Panel -->
          <div class="gate-panel gate-panel--active" data-panel="password">
            <form id="gate-pass-form">
              <div class="gate-field">
                <label class="gate-label" for="gate-pass-input">Password</label>
                <div style="position:relative;">
                  <input
                    type="password"
                    id="gate-pass-input"
                    class="gate-input"
                    placeholder="Enter access password"
                    autocomplete="off"
                    ${lockedOut ? "disabled" : ""}
                  />
                  <button
                    type="button"
                    id="gate-pass-toggle"
                    style="position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:16px;padding:4px;"
                  >👁️</button>
                </div>
              </div>
              <button
                type="submit"
                class="gate-btn gate-btn--primary"
                ${lockedOut ? "disabled" : ""}
              >
                Unlock Portfolio
              </button>
            </form>
            ${lockedOut ? `<div class="gate-lockout">🔒 Locked out. Try again in ${lockMins} minute${lockMins !== 1 ? "s" : ""}.</div>` : ""}
          </div>

          <!-- Request Panel -->
          <div class="gate-panel" data-panel="request">
            <p style="font-family:'Source Serif 4',serif;font-size:14px;color:#5a8a8f;margin-bottom:20px;line-height:1.5;">
              Submit your details below.
              If approved, the access password will be emailed to you.
            </p>
            <form id="gate-request-form">
              <div class="gate-field">
                <label class="gate-label" for="gate-req-name">Full Name</label>
                <input
                  type="text"
                  id="gate-req-name"
                  class="gate-input"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div class="gate-field">
                <label class="gate-label" for="gate-req-email">Email</label>
                <input
                  type="email"
                  id="gate-req-email"
                  class="gate-input"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div class="gate-field">
                <label class="gate-label" for="gate-req-phone">Phone</label>
                <input
                  type="tel"
                  id="gate-req-phone"
                  class="gate-input"
                  placeholder="+977 98XXXXXXXX"
                  required
                />
              </div>
              <button
                type="submit"
                id="gate-request-btn"
                class="gate-btn gate-btn--primary"
              >
                Request Access
              </button>
            </form>
          </div>

          <!-- Messages -->
          <div id="gate-messages"></div>

          <!-- IP Display -->
          <div class="gate-ip">
            Your IP: <code id="gate-ip-display">${this.visitorIP}</code>
          </div>

          <!-- Footer -->
          <div class="gate-footer">
            <p class="gate-footer__text">
              Unauthorized access attempts are logged.
            </p>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("afterbegin", html);
  }
}

/* ─── Init on DOM ready ──────────────── */
document.addEventListener("DOMContentLoaded", () => {
  new Gatekeeper();
});
