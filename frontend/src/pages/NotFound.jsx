import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

// ── Floating particle ─────────────────────────────────────────────────────────
function Particle({ style }) {
  return (
    <div className="absolute rounded-full pointer-events-none" style={style} />
  );
}

// ── Glitch text effect ────────────────────────────────────────────────────────
function GlitchText({ text, className = "" }) {
  return (
    <span className={`glitch-wrapper ${className}`} data-text={text}>
      {text}
    </span>
  );
}

// ── Animated grid line ────────────────────────────────────────────────────────
function GridCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let offset = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 60;
      offset = (offset + 0.3) % spacing;

      // Vertical lines
      ctx.strokeStyle = "rgba(109, 40, 217, 0.12)";
      ctx.lineWidth = 1;
      for (let x = offset; x < canvas.width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = (offset * 0.6) % spacing; y < canvas.height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Glow dot at intersections (sparse)
      ctx.fillStyle = "rgba(167, 139, 250, 0.25)";
      for (let x = offset; x < canvas.width; x += spacing * 3) {
        for (
          let y = (offset * 0.6) % spacing;
          y < canvas.height;
          y += spacing * 3
        ) {
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 1 }}
    />
  );
}

// ── Countdown redirect ────────────────────────────────────────────────────────
// function useCountdown(seconds, onDone) {
//   const [count, setCount] = useState(seconds);
//   useEffect(() => {
//     if (count <= 0) {
//       onDone();
//       return;
//     }
//     const t = setTimeout(() => setCount((c) => c - 1), 1000);
//     return () => clearTimeout(t);
//   }, [count, onDone]);
//   return count;
// }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN 404 PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();
  // const [entered, setEntered] = useState(false);

  // // Trigger entrance animation on mount
  // useEffect(() => {
  //   const t = setTimeout(() => setEntered(true), 50);
  //   return () => clearTimeout(t);
  // }, []);

  // Auto-redirect countdown
  // const count = useCountdown(10, () => navigate("/"));

  // Particles data (static, computed once)
  const particles = useRef(
    Array.from({ length: 24 }, (_, i) => ({
      key: i,
      style: {
        width: `${4 + (i % 5) * 3}px`,
        height: `${4 + (i % 5) * 3}px`,
        left: `${(i * 17 + 5) % 95}%`,
        top: `${(i * 13 + 10) % 90}%`,
        background:
          i % 3 === 0
            ? "rgba(167,139,250,0.4)"
            : i % 3 === 1
              ? "rgba(99,102,241,0.3)"
              : "rgba(236,72,153,0.2)",
        animation: `float-${i % 3} ${5 + (i % 4)}s ease-in-out infinite`,
        animationDelay: `${(i * 0.4) % 4}s`,
        filter: "blur(1px)",
      },
    })),
  ).current;

  // const quickLinks = [
  //   { to: "/", icon: "🏠", label: "Beranda" },
  //   { to: "/gallery", icon: "🖼️", label: "Galeri" },
  //   { to: "/exhibition", icon: "🏛️", label: "Pameran 3D" },
  //   { to: "/login", icon: "🔐", label: "Login" },
  // ];

  return (
    <>
      {/* ── Global styles injected ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Outfit:wght@300;400;600;700;900&display=swap');

        .nf-root {
          font-family: 'Outfit', sans-serif;
        }
        .nf-mono {
          font-family: 'Space Mono', monospace;
        }

        /* Glitch effect */
        .glitch-wrapper {
          position: relative;
          display: inline-block;
        }
        .glitch-wrapper::before,
        .glitch-wrapper::after {
          content: attr(data-text);
          position: absolute;
          inset: 0;
          font: inherit;
          color: inherit;
        }
        .glitch-wrapper::before {
          animation: glitch-1 3.5s infinite;
          clip-path: polygon(0 0, 100% 0, 100% 40%, 0 40%);
          color: #f0abfc;
          left: -2px;
        }
        .glitch-wrapper::after {
          animation: glitch-2 3.5s infinite;
          clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
          color: #60a5fa;
          left: 2px;
        }

        @keyframes glitch-1 {
          0%,94%,100% { transform: none; opacity: 0; }
          95%          { transform: translate(-3px, 1px) skewX(-2deg); opacity: 0.8; }
          97%          { transform: translate(3px, -1px) skewX(1deg); opacity: 0.6; }
          99%          { transform: translate(-1px, 2px); opacity: 0.9; }
        }
        @keyframes glitch-2 {
          0%,94%,100% { transform: none; opacity: 0; }
          95%          { transform: translate(3px, -1px) skewX(2deg); opacity: 0.7; }
          97%          { transform: translate(-3px, 1px) skewX(-1deg); opacity: 0.5; }
          99%          { transform: translate(2px, -2px); opacity: 0.8; }
        }

        /* Particle float animations */
        @keyframes float-0 {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%     { transform: translateY(-28px) rotate(180deg); }
        }
        @keyframes float-1 {
          0%,100% { transform: translateY(0px) translateX(0px); }
          33%     { transform: translateY(-20px) translateX(12px); }
          66%     { transform: translateY(12px) translateX(-8px); }
        }
        @keyframes float-2 {
          0%,100% { transform: scale(1) rotate(0deg); }
          50%     { transform: scale(1.5) rotate(90deg); }
        }

        /* 404 number pulse glow */
        @keyframes pulse-glow {
          0%,100% { text-shadow: 0 0 20px rgba(109,40,217,0.4), 0 0 60px rgba(109,40,217,0.2); }
          50%     { text-shadow: 0 0 40px rgba(109,40,217,0.8), 0 0 100px rgba(109,40,217,0.4), 0 0 160px rgba(167,139,250,0.2); }
        }

        /* Scan line */
        @keyframes scan {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        /* Card entrance */
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .enter-1 { animation: slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
        .enter-2 { animation: slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .enter-3 { animation: slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .enter-4 { animation: slide-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.55s both; }

        /* Countdown ring */
        @keyframes countdown-ring {
          from { stroke-dashoffset: 220; }
          to   { stroke-dashoffset: 0; }
        }
        .countdown-path {
          stroke-dasharray: 220;
          animation: countdown-ring 10s linear forwards;
        }

        /* Quick link hover */
        .quick-link {
          transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
        }
        .quick-link:hover {
          transform: translateY(-3px) scale(1.04);
        }

        /* Scanline overlay */
        .scanline {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, rgba(167,139,250,0.4), transparent);
          animation: scan 5s linear infinite;
          pointer-events: none;
          z-index: 9999;
        }
      `}</style>

      <div className="nf-root fixed inset-0 bg-gray-950 overflow-hidden flex items-center justify-center">
        {/* Scanline effect */}
        <div className="scanline" />

        {/* Animated grid background */}
        <GridCanvas />

        {/* Radial glow center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(109,40,217,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Floating particles */}
        {particles.map((p) => (
          <Particle key={p.key} style={p.style} />
        ))}

        {/* ── Main content card ── */}
        <div className="relative z-10 w-full max-w-xl mx-4 text-center">
          {/* Logo top */}
          <div className="enter-1 mb-8">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform">
                VE
              </div>
              <span className="font-semibold text-white/60 group-hover:text-white transition-colors text-sm">
                Virtual Exhibition
              </span>
            </Link>
          </div>

          {/* 404 Big Number */}
          <div className="enter-2 mb-4">
            <div
              className="nf-mono font-bold leading-none select-none"
              style={{
                fontSize: "clamp(100px, 22vw, 180px)",
                color: "transparent",
                WebkitTextStroke: "2px rgba(109,40,217,0.8)",
                animation: "pulse-glow 3s ease-in-out infinite",
                letterSpacing: "-0.05em",
              }}
            >
              <GlitchText text="404" />
            </div>
          </div>

          {/* Divider */}
          <div className="enter-2 flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
            <span className="nf-mono text-xs text-primary-400/70 tracking-widest px-2">
              PAGE_NOT_FOUND
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          </div>

          {/* Message */}
          <div className="enter-3 mb-8 space-y-2">
            <h1 className="text-2xl font-bold text-white">
              Halaman Tidak Ditemukan
            </h1>
            <p className="text-white/50 text-sm leading-relaxed">
              Halaman yang kamu cari tidak ada, sudah dipindahkan, atau mungkin
              URL-nya salah ketik.
            </p>
            {/* Show the path they tried to access */}
            <div
              className="nf-mono inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 mt-3"
              style={{ fontSize: "12px" }}
            >
              <span className="text-red-400">404</span>
              <span className="text-white/30">→</span>
              <span className="text-white/60 truncate max-w-[280px]">
                {location.pathname}
              </span>
            </div>
          </div>

          {/* Quick nav links */}
          {/* <div className="enter-3 grid grid-cols-4 gap-2 mb-8">
            {quickLinks.map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className="quick-link flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-primary-900/30 hover:border-primary-500/40 group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {icon}
                </span>
                <span className="text-xs text-white/50 group-hover:text-white/90 transition-colors font-medium">
                  {label}
                </span>
              </Link>
            ))}
          </div> */}

          {/* Primary CTA + countdown */}
          <div className="enter-4 flex items-center justify-center gap-4">
            {/* Countdown ring */}
            {/* <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 80 80">
              
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="6"
                />
                
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="none"
                  stroke="rgba(109,40,217,0.8)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  className="countdown-path"
                />
              </svg>
              <span className="nf-mono absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-400">
                {count}
              </span>
            </div> */}

            <div className="text-left">
              {/* <p className="text-xs text-white/40 mb-1">
                Redirect otomatis ke beranda dalam {count} detik
              </p> */}
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                🏠 Ke Beranda Sekarang
              </Link>
            </div>
          </div>

          {/* Bottom hint */}
          {/* <div className="enter-4 mt-8">
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-white/25 hover:text-white/60 transition-colors underline underline-offset-4 nf-mono"
            >
              ← kembali ke halaman sebelumnya
            </button>
          </div> */}
        </div>
      </div>
    </>
  );
}
