import { useState, useEffect, useRef } from "react";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; overflow-x: hidden; }
  body { overflow-x: hidden; width: 100%; }
  #root { width: 100%; overflow-x: hidden; }

  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes glitch1 {
    0%,80%,100%{transform:translateX(-3px) skewX(0deg);opacity:0}
    82%{transform:translateX(-5px) skewX(-5deg);opacity:1}
    84%{transform:translateX(3px) skewX(3deg);opacity:1}
    86%{opacity:0}
  }
  @keyframes glitch2 {
    0%,75%,100%{transform:translateX(3px);opacity:0}
    77%{transform:translateX(5px) skewX(4deg);opacity:1}
    79%{transform:translateX(-3px) skewX(-2deg);opacity:1}
    81%{opacity:0}
  }

  .glitch-wrap { position:relative; display:inline-block; }
  .glitch-wrap::before,.glitch-wrap::after {
    content:attr(data-text); position:absolute; top:0; left:0; width:100%; height:100%;
    clip-path:polygon(0 0,100% 0,100% 35%,0 35%);
  }
  .glitch-wrap::before { color:#f0f; animation:glitch1 2.5s infinite steps(1); }
  .glitch-wrap::after  { color:#0ff; clip-path:polygon(0 60%,100% 60%,100% 100%,0 100%); animation:glitch2 2.5s infinite steps(1); }

  .pixel-card { transition: transform 0.15s, box-shadow 0.15s; }
  .pixel-card:hover { transform: translate(-3px,-3px); }
  ::-webkit-scrollbar { width:5px; }
  ::-webkit-scrollbar-thumb { background:#7c3aed; }

  /* ── Nav ── */
  /* Desktop: show links, hide hamburger cluster */
  .nav-desk-links   { display: flex; align-items: center; gap: 24px; }
  .nav-mob-cluster  { display: none !important; }
  .nav-mob-menu     { display: none; }

  /* Mobile: hide desktop links, show hamburger cluster + slide menu */
  @media (max-width: 700px) {
    .nav-desk-links  { display: none !important; }
    .nav-mob-cluster { display: flex !important; align-items: center; gap: 10px; }
    .nav-mob-menu    { display: block; }
  }

  /* ── Layout grids ── */
  .about-grid    { display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:start; }
  .skills-grid   { display:grid; grid-template-columns:repeat(auto-fit,minmax(190px,1fr)); gap:20px; }
  .projects-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px; }
  .contact-links { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }

  @media(max-width:700px){
    .about-grid { grid-template-columns:1fr !important; }
  }
`;

// ── Pixel Rain ─────────────────────────────────────────────────────────────────
function PixelRain({ dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      // Use clientWidth to avoid scrollbar-induced layout shift
      canvas.width  = document.documentElement.clientWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    let { width: w, height: h } = canvas;
    const SIZE = 14;
    let cols = Math.floor(w / SIZE);
    let drops = Array(cols).fill(1);
    const chars = "01アイウエオカキクケコ✦★◆▲▼◉░▒▓";

    let frame;
    const draw = () => {
      ctx.fillStyle = dark ? "rgba(8,8,18,0.07)" : "rgba(238,235,255,0.07)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${SIZE - 2}px monospace`;
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const a  = Math.random() * 0.35 + 0.04;
        ctx.fillStyle = dark ? `rgba(130,80,255,${a})` : `rgba(100,60,210,${a})`;
        ctx.fillText(ch, i * SIZE, y * SIZE);
        if (y * SIZE > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      frame = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      resize();
      w = canvas.width; h = canvas.height;
      cols = Math.floor(w / SIZE);
      drops = Array(cols).fill(1);
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", onResize); };
  }, [dark]);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", top: 0, left: 0,
      width: "100%", height: "100%",
      zIndex: 0, pointerEvents: "none", opacity: 0.55,
    }} />
  );
}

// ── Typewriter ─────────────────────────────────────────────────────────────────
function Typewriter({ strings }) {
  const [idx, setIdx] = useState(0);
  const [txt, setTxt] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const current = strings[idx % strings.length];
    const t = setTimeout(() => {
      if (!del) {
        const n = current.slice(0, txt.length + 1);
        setTxt(n);
        if (n === current) setTimeout(() => setDel(true), 1100);
      } else {
        const n = current.slice(0, txt.length - 1);
        setTxt(n);
        if (n === "") { setDel(false); setIdx(i => i + 1); }
      }
    }, del ? 45 : 95);
    return () => clearTimeout(t);
  }, [txt, del, idx, strings]);
  return (
    <span>
      {txt}
      <span style={{ borderRight: "3px solid #7c3aed", marginLeft: 2, animation: "blink 1s step-end infinite" }} />
    </span>
  );
}

// ── Pixel Card ─────────────────────────────────────────────────────────────────
function PixelCard({ children, accent = "#7c3aed", style: extra = {} }) {
  return (
    <div className="pixel-card" style={{
      border: `2px solid ${accent}`,
      boxShadow: `4px 4px 0 ${accent}`,
      ...extra,
    }}>{children}</div>
  );
}

// ── Skill Pill ─────────────────────────────────────────────────────────────────
function SkillPill({ skill, dark }) {
  const pal = ["#7c3aed","#db2777","#0891b2","#059669","#d97706","#dc2626"];
  const c = pal[skill.charCodeAt(0) % pal.length];
  const [hov, setHov] = useState(false);
  return (
    <span onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        border: `2px solid ${c}`, color: hov ? "#fff" : c,
        background: hov ? c : dark ? `${c}18` : `${c}12`,
        padding: "5px 11px", fontSize: 10,
        fontFamily: "'Press Start 2P', monospace",
        display: "inline-block", cursor: "default",
        transition: "all 0.15s", lineHeight: 1.6,
      }}
    >{skill}</span>
  );
}

// ── Section Label ──────────────────────────────────────────────────────────────
function SectionLabel({ label, dark }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 44 }}>
      <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 9, color: "#7c3aed", letterSpacing: 1, whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: dark ? "#7c3aed44" : "#7c3aed33" }} />
    </div>
  );
}

// ── Nav ────────────────────────────────────────────────────────────────────────
function Nav({ dark, setDark, active, setActive }) {
  const links = ["home", "about", "skills", "projects", "contact"];
  const [open, setOpen] = useState(false);

  const go = (id) => {
    setActive(id);
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navBg = dark ? "rgba(8,8,18,0.96)" : "rgba(243,241,255,0.96)";
  const border = dark ? "#7c3aed55" : "#7c3aed33";

  const barStyle = (extra = {}) => ({
    display: "block", width: 22, height: 2.5,
    background: "#7c3aed", borderRadius: 2,
    transition: "transform 0.25s, opacity 0.25s",
    ...extra,
  });

  return (
    <>
      {/* ── Main nav bar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
        height: 60, padding: "0 5vw",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: navBg, backdropFilter: "blur(16px)",
        borderBottom: `2px solid ${border}`,
      }}>
        {/* Logo */}
        <span style={{
          fontFamily: "'Press Start 2P', monospace", fontSize: 11,
          color: "#7c3aed", whiteSpace: "nowrap", letterSpacing: 1, flexShrink: 0,
        }}>
          &lt;YourName/&gt;
        </span>

        {/* Desktop links — hidden via CSS on mobile */}
        <div className="nav-desk-links">
          {links.map(l => (
            <button key={l} onClick={() => go(l)} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9,
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 0", letterSpacing: 1,
              color: active === l ? "#7c3aed" : dark ? "#aaa" : "#666",
              borderBottom: active === l ? "2px solid #7c3aed" : "2px solid transparent",
              transition: "color 0.2s",
            }}>{l}</button>
          ))}
          {/* Dark/light toggle */}
          <button onClick={() => setDark(d => !d)} style={{
            background: dark ? "#7c3aed" : "#ede9fe",
            border: "2px solid #7c3aed",
            width: 36, height: 36, cursor: "pointer", fontSize: 15, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{dark ? "☀️" : "🌙"}</button>
        </div>

        {/* Mobile cluster: theme toggle + hamburger — shown via CSS on mobile */}
        <div className="nav-mob-cluster">
          <button onClick={() => setDark(d => !d)} style={{
            background: dark ? "#7c3aed" : "#ede9fe",
            border: "2px solid #7c3aed",
            width: 36, height: 36, cursor: "pointer", fontSize: 14, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{dark ? "☀️" : "🌙"}</button>

          <button onClick={() => setOpen(o => !o)} aria-label="Toggle menu" style={{
            background: "none", border: "2px solid #7c3aed66",
            width: 38, height: 38, cursor: "pointer", flexShrink: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 5, padding: 8,
          }}>
            <span style={barStyle({ transform: open ? "translateY(7px) rotate(45deg)" : "none" })} />
            <span style={barStyle({ opacity: open ? 0 : 1 })} />
            <span style={barStyle({ transform: open ? "translateY(-7px) rotate(-45deg)" : "none" })} />
          </button>
        </div>
      </nav>

      {/* ── Slide-down mobile menu — hidden via CSS on desktop ── */}
      <div className="nav-mob-menu" style={{
        position: "fixed", top: 60, left: 0, right: 0, zIndex: 299,
        background: navBg, backdropFilter: "blur(16px)",
        maxHeight: open ? 380 : 0,
        overflow: "hidden",
        transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        borderBottom: open ? `2px solid ${border}` : "none",
      }}>
        {links.map((l, i) => (
          <button key={l} onClick={() => go(l)} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%",
            fontFamily: "'Press Start 2P', monospace", fontSize: 11, letterSpacing: 1,
            background: active === l ? "#7c3aed22" : "none",
            border: "none", borderBottom: `1px solid ${border}`,
            color: active === l ? "#7c3aed" : dark ? "#ccc" : "#444",
            padding: "18px 6vw", cursor: "pointer",
            transition: "background 0.2s, color 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#7c3aed1a"; }}
            onMouseLeave={e => { e.currentTarget.style.background = active === l ? "#7c3aed22" : "none"; }}
          >
            <span>
              <span style={{ color: "#7c3aed66", marginRight: 14, fontSize: 9 }}>0{i + 1}.</span>
              {l}
            </span>
            {active === l && <span style={{ color: "#7c3aed" }}>◀</span>}
          </button>
        ))}
      </div>

      {/* Tap-outside backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 298, background: "rgba(0,0,0,0.4)",
        }} />
      )}
    </>
  );
}

// ── Data ───────────────────────────────────────────────────────────────────────
const PROJECTS = [
  { title: "project_alpha.exe", desc: "A full-stack web app that does something really cool. Built with React and Node.", tags: ["React","Node","MongoDB"], color: "#7c3aed" },
  { title: "neon_dashboard",    desc: "Real-time analytics dashboard with live data visualization and sick animations.",    tags: ["Vue","D3","Firebase"],   color: "#db2777" },
  { title: "pixel_art_gen",     desc: "AI-powered pixel art generator. Type a prompt, get retro game sprites instantly.",   tags: ["Python","OpenAI","Flask"], color: "#0891b2" },
  { title: "open_source_cli",   desc: "A CLI tool that automates boring dev tasks. 500+ GitHub stars and counting.",        tags: ["TypeScript","CLI"],        color: "#059669" },
];

const SKILLS = {
  "Frontend 🎨": ["React","Next.js","TypeScript","Tailwind","Figma"],
  "Backend ⚙️":  ["Node.js","Python","FastAPI","PostgreSQL","Redis"],
  "Tools 🔧":    ["Git","Docker","AWS","Vercel","Linux"],
  "Vibes ✨":    ["UI/UX","Open Source","Coffee","Lo-fi"],
};

// ── App ────────────────────────────────────────────────────────────────────────
export default function Portfolio() {
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("home");

  const bg  = dark ? "#080812" : "#f3f1ff";
  const fg  = dark ? "#e8e6ff" : "#170f30";
  const sub = dark ? "#8888aa" : "#5f5880";

  // inject styles once
  useEffect(() => {
    let el = document.getElementById("__pf-styles");
    if (!el) { el = document.createElement("style"); el.id = "__pf-styles"; document.head.appendChild(el); }
    el.textContent = GLOBAL_STYLES;
  }, []);

  // active section tracking
  useEffect(() => {
    const ids = ["home","about","skills","projects","contact"];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { threshold: 0.35 });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const sec = { padding: "96px 5vw", maxWidth: 1040, margin: "0 auto", position: "relative", zIndex: 1 };

  return (
    <div style={{
      background: bg, color: fg, minHeight: "100vh",
      fontFamily: "'Syne', sans-serif",
      transition: "background 0.4s, color 0.4s",
      overflowX: "hidden", width: "100%",
    }}>
      <PixelRain dark={dark} />
      <Nav dark={dark} setDark={setDark} active={active} setActive={setActive} />

      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 5vw 60px",
        position: "relative", zIndex: 1,
      }}>
        <div style={{ marginBottom: 28, animation: "float 3s ease-in-out infinite" }}>
          <div style={{
            width: 84, height: 84, margin: "0 auto",
            background: "linear-gradient(135deg,#7c3aed,#db2777)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 38, border: "3px solid #7c3aed", boxShadow: "5px 5px 0 #5b21b6",
          }}>👾</div>
        </div>

        <p style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: "#7c3aed", letterSpacing: 3, marginBottom: 20 }}>
          &gt; HELLO WORLD_
        </p>

        <h1 style={{ fontSize: "clamp(36px, 9vw, 96px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 20, maxWidth: "90vw" }}>
          <span className="glitch-wrap" data-text="YOUR NAME">YOUR NAME</span>
        </h1>

        <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(12px, 2.2vw, 20px)", color: "#7c3aed", marginBottom: 20, minHeight: 28 }}>
          <Typewriter strings={["Full Stack Dev ✦","UI/UX Enjoyer ✦","Open Source Nerd ✦","Building Cool Stuff ✦"]} />
        </h2>

        <p style={{ maxWidth: 500, color: sub, lineHeight: 1.9, fontSize: "clamp(13px,1.8vw,16px)", marginBottom: 44, padding: "0 8px" }}>
          i build things for the internet that are actually fun to use. obsessed with good UX, clean code, and making stuff that slaps 🔥
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          {[
            { label: "view my work ↓", primary: true,  onClick: () => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }) },
            { label: "download cv",    primary: false, onClick: () => {} },
          ].map(btn => (
            <button key={btn.label} onClick={btn.onClick} style={{
              fontFamily: "'Press Start 2P', monospace", fontSize: 9, letterSpacing: 1,
              padding: "13px 20px", cursor: "pointer", border: "2px solid #7c3aed",
              background: btn.primary ? "#7c3aed" : "transparent",
              color: btn.primary ? "#fff" : "#7c3aed",
              boxShadow: btn.primary ? "4px 4px 0 #5b21b6" : "4px 4px 0 #7c3aed55",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="translate(-2px,-2px)"; e.currentTarget.style.boxShadow=btn.primary?"6px 6px 0 #5b21b6":"6px 6px 0 #7c3aed55"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=btn.primary?"4px 4px 0 #5b21b6":"4px 4px 0 #7c3aed55"; }}
            >{btn.label}</button>
          ))}
        </div>

        <div style={{ marginTop: 56, animation: "float 2s ease-in-out infinite", fontSize: 20, color: "#7c3aed88" }}>▼</div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={sec}>
        <SectionLabel label="01. about_me" dark={dark} />
        <div className="about-grid">
          <div>
            <h2 style={{ fontSize: "clamp(24px,4vw,46px)", fontWeight: 800, marginBottom: 18, lineHeight: 1.15 }}>
              just a dev<br />who gives a <span style={{ color: "#7c3aed" }}>damn</span>
            </h2>
            <p style={{ color: sub, lineHeight: 1.9, fontSize: 15, marginBottom: 14 }}>
              hey! i'm a full-stack developer based somewhere on earth, making digital experiences that don't suck. currently obsessed with web3, AI tooling, and building in public.
            </p>
            <p style={{ color: sub, lineHeight: 1.9, fontSize: 15 }}>
              when i'm not pushing code i'm probably watching anime, messing with pixel art, or hunting for the perfect lo-fi playlist. let's build something together ✨
            </p>
          </div>
          <PixelCard accent="#7c3aed">
            <div style={{ padding: "26px 22px", fontFamily: "'Space Mono', monospace", fontSize: 12, lineHeight: 2.2, color: dark ? "#c4b5fd" : "#5b21b6" }}>
              <div style={{ color: "#7c3aed", marginBottom: 6 }}>$ whoami</div>
              {[["name","Your Name"],["role","Full Stack Dev"],["city","Your City 📍"],["exp","3+ years"]].map(([k,v]) => (
                <div key={k}>{k.padEnd(6," ")} → <span style={{ color: fg }}>{v}</span></div>
              ))}
              <div>status → <span style={{ color: "#4ade80" }}>open to work ✓</span></div>
              <div style={{ marginTop: 10, color: "#7c3aed", animation: "blink 1s step-end infinite" }}>$ _</div>
            </div>
          </PixelCard>
        </div>
      </section>

      {/* ── SKILLS ── */}
      <section id="skills" style={sec}>
        <SectionLabel label="02. skills.json" dark={dark} />
        <div className="skills-grid">
          {Object.entries(SKILLS).map(([cat, skills], i) => {
            const ac = ["#7c3aed","#db2777","#0891b2","#059669"][i];
            return (
              <PixelCard key={cat} accent={ac}>
                <div style={{ padding: "20px 18px" }}>
                  <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 7, color: ac, marginBottom: 16, letterSpacing: 1 }}>
                    {cat.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {skills.map(s => <SkillPill key={s} skill={s} dark={dark} />)}
                  </div>
                </div>
              </PixelCard>
            );
          })}
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" style={sec}>
        <SectionLabel label="03. projects[]" dark={dark} />
        <div className="projects-grid">
          {PROJECTS.map((p, i) => (
            <PixelCard key={p.title} accent={p.color}>
              <div style={{ padding: "22px 20px" }}>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: p.color, marginBottom: 10 }}>
                  [{String(i+1).padStart(2,"0")}]
                </div>
                <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{p.title}</h3>
                <p style={{ color: sub, fontSize: 13, lineHeight: 1.85, marginBottom: 16 }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                  {p.tags.map(t => (
                    <span key={t} style={{ background: `${p.color}22`, color: p.color, padding: "2px 8px", fontSize: 10, fontFamily: "'Space Mono', monospace", border: `1px solid ${p.color}66` }}>{t}</span>
                  ))}
                </div>
                <a href="#" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 8, color: p.color, textDecoration: "none" }}>
                  view project →
                </a>
              </div>
            </PixelCard>
          ))}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ ...sec, textAlign: "center" }}>
        <SectionLabel label="04. contact.sh" dark={dark} />
        <h2 style={{ fontSize: "clamp(28px,5vw,58px)", fontWeight: 800, marginBottom: 18, lineHeight: 1.1 }}>
          let's <span style={{ color: "#7c3aed" }}>collab</span> ✦
        </h2>
        <p style={{ color: sub, lineHeight: 1.9, fontSize: "clamp(13px,1.8vw,16px)", marginBottom: 44, maxWidth: 480, margin: "0 auto 44px" }}>
          open to freelance, full-time, and interesting side projects. if you have a cool idea, my dms are open 📬
        </p>
        <div className="contact-links">
          {[
            { label: "email me ✉️",  href: "mailto:you@email.com" },
            { label: "github 🐙",   href: "https://github.com/yourusername" },
            { label: "twitter 𝕏",   href: "https://twitter.com/yourusername" },
            { label: "linkedin 💼", href: "https://linkedin.com/in/yourusername" },
          ].map(link => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
              style={{
                fontFamily: "'Press Start 2P', monospace", fontSize: 8, padding: "12px 14px",
                border: "2px solid #7c3aed", color: "#7c3aed", textDecoration: "none",
                boxShadow: "4px 4px 0 #7c3aed55", transition: "all 0.15s",
                background: dark ? "#7c3aed18" : "#ede9fe", display: "inline-block",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="#7c3aed"; e.currentTarget.style.color="#fff"; e.currentTarget.style.transform="translate(-2px,-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background=dark?"#7c3aed18":"#ede9fe"; e.currentTarget.style.color="#7c3aed"; e.currentTarget.style.transform=""; }}
            >{link.label}</a>
          ))}
        </div>

        <div style={{ marginTop: 60, paddingTop: 30, borderTop: `1px solid ${dark ? "#7c3aed33" : "#7c3aed22"}`, fontFamily: "'Space Mono', monospace", fontSize: 11, color: sub }}>
          built with React + vibes ✦ no templates harmed
          <br /><span style={{ color: "#7c3aed" }}>© 2025 YourName</span>
        </div>
      </section>
    </div>
  );
}