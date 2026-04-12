const { useState, useEffect, useRef, useCallback } = React;

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const SECTIONS = ["home", "about", "research", "publications", "skills", "awards", "education", "contact"];

const RESEARCH = [
  {
    title: "Defect Engineering in Wide Band-Gap Semiconductors",
    org: "Nepal Academy of Science & Technology (NAST)",
    period: "Jan 2026 – Present",
    desc: "Band engineering in heterojunction of 2D semiconducting materials. Experimental work at Materials Science & Nanotechnology Research Center. Computational simulation using FPLO, WIEN2k in collaboration with IFW Dresden.",
    tags: ["DFT", "FPLO", "WIEN2k", "2D Materials", "Experimental"],
    status: "active",
  },
  {
    title: "Quantum Dot TMDC: Photodetectors & Actuation",
    org: "Christ University, Bangalore",
    period: "Mar – Jul 2025",
    desc: "Synthesized MoTe₂ and MnS₂ nanosheets & QDs via Liquid Phase Exfoliation. Fabricated polymer-infused thin films with optical sensing and organic solvent-based actuation properties.",
    tags: ["TMDC", "Nanosheets", "UV-vis", "XRD", "Raman", "SEM"],
    status: "completed",
  },
  {
    title: "N₂ Adsorption on P-Zn Clusters (BSc Thesis)",
    org: "St. Xavier's College, TU",
    period: "2025",
    desc: "DFT simulations using Quantum ESPRESSO investigating N₂ adsorption on phosphorous-zinc clusters. Found perpendicular arrangement more effective, with ~0.5 eV Fermi level shift as evidence of charge transfer.",
    tags: ["DFT", "Quantum ESPRESSO", "Adsorption", "Catalysis"],
    status: "completed",
  },
  {
    title: "Holographic Himalayas — ICTP PWF Project",
    org: "Physics Without Frontiers, ICTP",
    period: "Jun 2022 – Apr 2025",
    desc: "Optimization of buses using circular Dyson Brownian motion algorithm with Random Matrix Theory. Previously analyzed Krylov Complexity of Gaussian States.",
    tags: ["Random Matrix Theory", "Krylov Complexity", "Theoretical"],
    status: "completed",
  },
  {
    title: "Spectral Analysis of Particulate Matter",
    org: "LSRA Fellowship, St. Xavier's College",
    period: "Apr 2023 – Apr 2024",
    desc: "Research fellowship analyzing PM2.5 and PM10 spectral data across different regions of Nepal. Published findings in Research Annals of Xavier's Nepal.",
    tags: ["Atmospheric Physics", "Data Analysis", "Published"],
    status: "published",
  },
];

const PUBLICATIONS = [
  {
    year: 2024,
    title: "Spectral Analysis of Particulate Matter PM2.5 and PM10 over different region of Nepal",
    authors: "S. Kaini, B. Adhikari",
    journal: "Research Annals of Xavier's Nepal, Science and Technology Series",
    info: "ISSN: 2705-456x, Issue: 6.1",
  },
  {
    year: 2021,
    title: "IoT Based Automatic Air Pollution Monitoring and Purification System",
    authors: "M. Gurung, S. Kaini, K. Bhandari, I. Panta, N. Singh",
    journal: "IJRASET",
    info: "Vol 9, Issue IX, SJ Impact Factor: 7.429",
  },
];

const AWARDS = [
  { year: 2025, icon: "🏆", title: "Excellence in Leadership Award", detail: "Fr. James J. Donnelly Memorial Award — Emerging Leader of the Batch" },
  { year: 2025, icon: "🥉", title: "3rd Place, AESCAP International Conference", detail: "Poster Presentation, Delhi — MnS₂ & MoTe₂ nanoparticles research" },
  { year: 2024, icon: "🌍", title: "NASA SpaceApp Challenge — Global Nominee", detail: "Interactive NEO learning website for young students" },
  { year: 2024, icon: "✈️", title: "IUPAP Travel Grant", detail: "Selected for ICPS 2024 presentation in Tbilisi, Georgia" },
  { year: 2024, icon: "🇮🇪", title: "PLANCKS National Delegate", detail: "Represented Nepal at Trinity College Dublin. Won '10 Years PLANCKS Challenge'" },
  { year: 2023, icon: "🔬", title: "Fr. Locke & Stellar Research Award", detail: "Research Fellowship under Dr. Binod Adhikari" },
  { year: 2022, icon: "🚀", title: "Phoenix Space Launchpad — Global Finalist", detail: "Research on Cyanobacteria for Mars settlement" },
  { year: 2021, icon: "💡", title: "ICT Award — National Finalist", detail: "IoT air quality monitoring system prototype, Top 5" },
];

const SKILLS = {
  "Computational Physics": ["Quantum ESPRESSO", "Gaussian / ADF", "FPLO", "WIEN2k", "DFT", "MATLAB", "COMSOL"],
  "Experimental": ["XRD / RSM / XRR", "SEM / TEM / AFM", "UV-Vis / FTIR / Raman", "Spin-coating", "Liquid Phase Exfoliation", "Hydrothermal Synthesis", "Sol-Gel"],
  "Programming": ["Python", "C / C++", "TensorFlow / PyTorch", "Qiskit", "Pandas", "MATLAB / Simulink"],
  "Quantum Computing": ["VQE", "Qiskit / Cirq", "Error Mitigation", "Quantum Algorithms"],
  "Tools & Platforms": ["Fusion360 / CAD", "Arduino / ESP8266", "Git / Docker", "GNU/Linux"],
};

const EDUCATION = [
  {
    degree: "Bachelor of Science in Physics",
    school: "St. Xavier's College, Tribhuvan University",
    period: "Graduated Sep 2025",
    grade: "84% Final Year · EQF Level 6",
    thesis: "Computational Analysis of N₂ adsorption and dissociation on PZn clusters",
  },
  {
    degree: "School Leaving Certificate",
    school: "St. Xavier's College, Maitighar",
    period: "Completed Aug 2020",
    grade: "Physics, Mathematics, Chemistry, Computer Science",
    thesis: null,
  },
];

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

// ─── Quantum Particle Canvas ─────────────
function QuantumCanvas() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const N = Math.min(80, Math.floor((W * H) / 15000));
    particles.current = Array.from({ length: N }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      pulse: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const pts = particles.current;
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        const glow = 0.5 + 0.5 * Math.sin(p.pulse);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 220, 220, ${0.3 + glow * 0.4})`;
        ctx.fill();
      }

      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0, 200, 210, ${0.08 * (1 - d / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
        const dmx = pts[i].x - mx;
        const dmy = pts[i].y - my;
        const dm = Math.sqrt(dmx * dmx + dmy * dmy);
        if (dm < 200) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(0, 255, 240, ${0.15 * (1 - dm / 200)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
      raf.current = requestAnimationFrame(draw);
    }
    draw();

    const handleMouse = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", handleMouse);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return React.createElement("canvas", { ref: canvasRef, className: "quantum-canvas" });
}

// ─── Section Wrapper with scroll reveal ──
function Section({ id, children, className }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return React.createElement("section", {
    ref,
    id,
    className: `section ${visible ? "section--visible" : ""} ${className || ""}`,
  }, children);
}

function SectionTitle({ children, sub }) {
  return React.createElement("div", { className: "section__title" },
    React.createElement("h2", null, children, React.createElement("span", { className: "dot" }, ".")),
    sub && React.createElement("p", { className: "subtitle" }, sub),
    React.createElement("div", { className: "line" })
  );
}

// ─── Nav ─────────────────────────────────
function Nav({ active, onNav }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return React.createElement("nav", { className: `nav ${scrolled ? "nav--scrolled" : ""}` },
    React.createElement("a", {
      href: "#home",
      className: "nav__logo",
      onClick: (e) => { e.preventDefault(); onNav("home"); },
    }, "S", React.createElement("span", null, "K")),
    React.createElement("div", { className: "nav__links" },
      SECTIONS.filter(s => s !== "home").map(s =>
        React.createElement("a", {
          key: s,
          href: `#${s}`,
          className: `nav__link ${active === s ? "nav__link--active" : ""}`,
          onClick: (e) => { e.preventDefault(); onNav(s); },
        }, s)
      )
    )
  );
}

// ─── Hero ────────────────────────────────
function Hero() {
  return React.createElement("section", { id: "home", className: "hero" },
    React.createElement("div", { className: "hero-s0" },
      React.createElement("span", { className: "hero__tag" },
        React.createElement("span", { className: "hero__tag-line" }),
        "Physics Researcher"
      )
    ),
    React.createElement("h1", { className: "hero__name hero-s1" },
      "Shreedip", React.createElement("br"),
      React.createElement("span", { className: "accent" }, "Kaini")
    ),
    React.createElement("p", { className: "hero__desc hero-s2" },
      "Condensed Matter · Quantum Materials · Nanotechnology · DFT",
      React.createElement("br"),
      React.createElement("span", { className: "sub" }, "BSc Physics, Tribhuvan University · MSc candidate")
    ),
    React.createElement("div", { className: "hero__stats hero-s3" },
      [{ label: "Publications", val: "2" }, { label: "Awards", val: "8+" }, { label: "Research Projects", val: "5+" }].map(s =>
        React.createElement("div", { key: s.label, className: "stat-card" },
          React.createElement("div", { className: "stat-card__val" }, s.val),
          React.createElement("div", { className: "stat-card__label" }, s.label)
        )
      )
    ),
    React.createElement("div", { className: "hero__scroll hero-s4" },
      React.createElement("span", { className: "hero__scroll-text" }, "Scroll"),
      React.createElement("div", { className: "hero__scroll-line" })
    )
  );
}

// ─── Research Card ───────────────────────
function ResearchCard({ item }) {
  return React.createElement("div", { className: "research-card" },
    React.createElement("div", { className: "research-card__header" },
      React.createElement("span", { className: "research-card__period" }, item.period),
      React.createElement("span", { className: `status-badge status-badge--${item.status}` }, item.status)
    ),
    React.createElement("h3", { className: "research-card__title" }, item.title),
    React.createElement("p", { className: "research-card__org" }, item.org),
    React.createElement("p", { className: "research-card__desc" }, item.desc),
    React.createElement("div", { className: "tag-list" },
      item.tags.map(t => React.createElement("span", { key: t, className: "tag" }, t))
    )
  );
}

// ─── Main App ────────────────────────────
function App() {
  const [activeSection, setActiveSection] = useState("home");

  const handleNav = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handler = () => {
      for (const s of [...SECTIONS].reverse()) {
        const el = document.getElementById(s);
        if (el && el.getBoundingClientRect().top <= 200) {
          setActiveSection(s);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return React.createElement(React.Fragment, null,
    React.createElement(QuantumCanvas),
    React.createElement(Nav, { active: activeSection, onNav: handleNav }),

    // Hero
    React.createElement(Hero),

    // About
    React.createElement(Section, { id: "about" },
      React.createElement(SectionTitle, { sub: "Computational + Experimental Condensed Matter" }, "About"),
      React.createElement("p", { className: "about__text" },
        "Physics student exploring the interplay between emergence and reductionism. Research spans DFT simulations of molecular adsorption, synthesis of 2D TMDC nanomaterials, and quantum computing algorithms. Skilled in bridging first-principles computation with experimental characterization — from Quantum ESPRESSO to wet-lab synthesis and SEM/XRD/Raman analysis."
      ),
      React.createElement("p", { className: "about__text about__text--dim" },
        "Currently at NAST working on defect engineering in wide band-gap semiconductors and band engineering in 2D heterojunctions. Pursuing MSc in Physics with focus on condensed matter, quantum materials, and low-dimensional systems."
      ),
      React.createElement("div", { className: "about__grid" },
        [
          { label: "Current", value: "Research Intern, NAST" },
          { label: "Education", value: "BSc Physics, TU (84%)" },
          { label: "Focus", value: "Condensed Matter / DFT" },
          { label: "Goal", value: "MSc → PhD in Physics" },
        ].map(d =>
          React.createElement("div", { key: d.label, className: "info-card" },
            React.createElement("div", { className: "info-card__label" }, d.label),
            React.createElement("div", { className: "info-card__value" }, d.value)
          )
        )
      )
    ),

    // Research
    React.createElement(Section, { id: "research" },
      React.createElement(SectionTitle, { sub: "From DFT simulations to nanomaterial synthesis" }, "Research"),
      React.createElement("div", { className: "research-grid" },
        RESEARCH.map((r, i) => React.createElement(ResearchCard, { key: i, item: r }))
      )
    ),

    // Publications
    React.createElement(Section, { id: "publications" },
      React.createElement(SectionTitle, { sub: "Peer-reviewed and published work" }, "Publications"),
      React.createElement("div", { className: "pub-grid" },
        PUBLICATIONS.map((p, i) =>
          React.createElement("div", { key: i, className: "pub-card" },
            React.createElement("div", { className: "pub-card__year" }, p.year),
            React.createElement("div", null,
              React.createElement("h3", { className: "pub-card__title" }, p.title),
              React.createElement("p", { className: "pub-card__authors" }, p.authors),
              React.createElement("p", { className: "pub-card__journal" }, p.journal, " · ", p.info)
            )
          )
        )
      )
    ),

    // Skills
    React.createElement(Section, { id: "skills" },
      React.createElement(SectionTitle, { sub: "Computational, experimental, and programming" }, "Skills"),
      React.createElement("div", { className: "skills-grid" },
        Object.entries(SKILLS).map(([name, items]) =>
          React.createElement("div", { key: name },
            React.createElement("h3", { className: "skill-cat__name" }, name),
            React.createElement("div", { className: "skill-cat__items" },
              items.map(s => React.createElement("span", { key: s, className: "skill-chip" }, s))
            )
          )
        )
      )
    ),

    // Awards
    React.createElement(Section, { id: "awards" },
      React.createElement(SectionTitle, { sub: "International recognitions and fellowships" }, "Awards"),
      React.createElement("div", { className: "awards-grid" },
        AWARDS.map((a, i) =>
          React.createElement("div", { key: i, className: "timeline-item" },
            React.createElement("div", { className: "timeline-item__icon" }, a.icon),
            React.createElement("div", null,
              React.createElement("div", { className: "timeline-item__year" }, a.year),
              React.createElement("h4", { className: "timeline-item__title" }, a.title),
              React.createElement("p", { className: "timeline-item__detail" }, a.detail)
            )
          )
        )
      )
    ),

    // Education
    React.createElement(Section, { id: "education" },
      React.createElement(SectionTitle, { sub: "Academic background" }, "Education"),
      React.createElement("div", { className: "edu-grid" },
        EDUCATION.map((e, i) =>
          React.createElement("div", { key: i, className: "edu-card" },
            React.createElement("h3", { className: "edu-card__degree" }, e.degree),
            React.createElement("p", { className: "edu-card__school" }, e.school),
            React.createElement("p", { className: "edu-card__meta" }, e.period, " · ", e.grade),
            e.thesis && React.createElement("p", { className: "edu-card__thesis" }, "Thesis: ", e.thesis)
          )
        )
      )
    ),

    // Contact
    React.createElement(Section, { id: "contact" },
      React.createElement(SectionTitle, { sub: "Let's connect" }, "Contact"),
      React.createElement("div", { className: "contact-grid" },
        [
          { icon: "✉️", label: "Email", value: "kainisridip5@gmail.com", href: "mailto:kainisridip5@gmail.com" },
          { icon: "🔗", label: "LinkedIn", value: "shreedipkaini", href: "https://www.linkedin.com/in/shreedipkaini/" },
          { icon: "📍", label: "Location", value: "Kathmandu, Nepal", href: null },
          { icon: "📱", label: "Phone", value: "+977 9846908487", href: "tel:+9779846908487" },
        ].map(c =>
          React.createElement("a", {
            key: c.label,
            href: c.href || "#",
            target: c.href ? "_blank" : undefined,
            rel: "noopener noreferrer",
            className: "contact-card",
          },
            React.createElement("span", { className: "contact-card__icon" }, c.icon),
            React.createElement("div", null,
              React.createElement("div", { className: "contact-card__label" }, c.label),
              React.createElement("div", { className: "contact-card__value" }, c.value)
            )
          )
        )
      )
    ),

    // Footer
    React.createElement("footer", { className: "footer" },
      React.createElement("p", { className: "footer__text" }, "© 2026 Shreedip Kaini · Quantum Lattice Portfolio")
    )
  );
}

// ─── Mount ───────────────────────────────
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
