import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Activity,
  Mail,
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  Heart,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "react-hot-toast";

// ── ECG heartbeat path ──────────────────────────────────────────────────────
const ECG_PATH =
  "M0,50 L60,50 L70,20 L80,80 L90,10 L100,90 L110,50 L130,50 L140,30 L150,70 L160,50 L220,50 L230,10 L240,90 L250,40 L260,60 L270,50 L340,50";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [ecgOffset, setEcgOffset] = useState(0);

  const { login } = useApp();
  const navigate = useNavigate();

  // Animate ECG line continuously
  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const speed = 0.06; // px per ms

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      setEcgOffset((elapsed * speed) % 340);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      toast.error("Enter your password.");
      return;
    }
    setLoading(true);
    try {
      await login(normalizedEmail, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── LEFT PANEL ───────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #050912 0%, #0e0b2a 40%, #1a0a20 100%)" }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(225,29,72,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(225,29,72,0.06) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating orbs */}
        {[
          { size: 420, top: "-120px", left: "-100px", color: "#e11d48", opacity: 0.15 },
          { size: 350, bottom: "-80px", right: "-80px", color: "#7c3aed", opacity: 0.12 },
          { size: 280, top: "40%", left: "55%", color: "#0ea5e9", opacity: 0.08 },
        ].map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size,
              height: orb.size,
              top: (orb as any).top,
              bottom: (orb as any).bottom,
              left: (orb as any).left,
              right: (orb as any).right,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              opacity: orb.opacity,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [orb.opacity, orb.opacity * 1.6, orb.opacity] }}
            transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Floating particles */}
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${(i * 37 + 11) % 90 + 5}%`,
              top: `${(i * 53 + 7) % 85 + 5}%`,
              background: i % 3 === 0 ? "#e11d48" : i % 3 === 1 ? "#7c3aed" : "#0ea5e9",
              opacity: 0.4,
            }}
            animate={{
              y: [-8, 8, -8],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Infinity,
              delay: i * 0.22,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* ECG Line */}
        <div className="absolute bottom-32 left-0 right-0 overflow-hidden" style={{ height: 100 }}>
          <svg
            viewBox="0 0 340 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="ecg-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="40%" stopColor="#e11d48" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <filter id="ecg-glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d={ECG_PATH}
              fill="none"
              stroke="url(#ecg-grad)"
              strokeWidth="1.5"
              filter="url(#ecg-glow)"
              style={{
                transform: `translateX(${-ecgOffset}px)`,
                transition: "none",
              }}
            />
            <path
              d={ECG_PATH}
              fill="none"
              stroke="url(#ecg-grad)"
              strokeWidth="1.5"
              filter="url(#ecg-glow)"
              style={{
                transform: `translateX(${340 - ecgOffset}px)`,
                transition: "none",
              }}
            />
          </svg>
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #e11d48, #9f1239)" }}
              animate={{ boxShadow: ["0 0 0px #e11d4840", "0 0 20px #e11d4880", "0 0 0px #e11d4840"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Activity size={22} className="text-white" />
            </motion.div>
            <span className="text-white text-2xl font-bold tracking-tight">HealthSync</span>
          </div>
        </div>

        {/* Center hero */}
        <div className="relative z-10 text-center flex flex-col items-center gap-6">
          {/* Pulse rings + heart */}
          <div className="relative flex items-center justify-center">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: i * 96,
                  height: i * 96,
                  border: "1px solid rgba(225,29,72,0.25)",
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.05, 0.4] }}
                transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.7, ease: "easeInOut" }}
              />
            ))}
            <motion.div
              animate={{ y: [0, -6, 0], scale: [1, 1.04, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-2xl relative z-10"
              style={{ background: "linear-gradient(135deg, #e11d48 0%, #7f1d1d 100%)", boxShadow: "0 0 40px rgba(225,29,72,0.4)" }}
            >
              <Heart size={44} className="text-white" fill="white" />
            </motion.div>
          </div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Track. Monitor.<br />
              <span
                style={{
                  background: "linear-gradient(90deg, #e11d48, #f97316, #e11d48)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Transform.
              </span>
            </h2>
            <p className="text-slate-400 mt-3 text-base leading-relaxed max-w-sm mx-auto">
              The all-in-one gym management platform built for modern fitness trainers.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {[
              { icon: <Zap size={13} />, label: "Real-time Vitals" },
              { icon: <Shield size={13} />, label: "Emergency Alerts" },
              { icon: <TrendingUp size={13} />, label: "AI Insights" },
            ].map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span className="text-rose-400">{feat.icon}</span>
                {feat.label}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stat cards */}
        <div className="relative z-10 flex gap-4 justify-center">
          {[
            { label: "Heart Rate", value: "72 BPM", color: "#e11d48" },
            { label: "SpO₂", value: "98%", color: "#0ea5e9" },
            { label: "Members", value: "Active", color: "#10b981" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.12 }}
              className="rounded-2xl px-4 py-3 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${stat.color}30`,
                backdropFilter: "blur(12px)",
                boxShadow: `0 0 20px ${stat.color}15`,
              }}
            >
              <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: `${stat.color}90` }}>{stat.label}</p>
              <p className="font-bold text-sm mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%)" }}
      >
        {/* Dark mode override */}
        <style>{`
          .dark .login-right-panel {
            background: linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%) !important;
          }
        `}</style>

        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #334155 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glow accent top-right */}
        <div
          className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: "radial-gradient(circle at top right, rgba(225,29,72,0.08), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-48 h-48 pointer-events-none"
          style={{ background: "radial-gradient(circle at bottom left, rgba(99,102,241,0.06), transparent 70%)" }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200"
                style={{ background: "linear-gradient(135deg, #e11d48, #9f1239)" }}>
                <Activity size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">HealthSync</span>
            </div>
          </div>

          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.45 }}
          >
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Sign in to your trainer dashboard</p>
          </motion.div>

          {/* ── GLASS FORM CARD ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.72)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.10), 0 2px 12px rgba(225,29,72,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            {/* Top gradient shimmer bar */}
            <div
              className="h-1 w-full"
              style={{ background: "linear-gradient(90deg, #e11d48, #f97316, #7c3aed, #e11d48)", backgroundSize: "200% auto" }}
            />

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email */}
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <label className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
                    Email Address
                  </label>
                  <div className="relative">
                    <motion.div
                      animate={{ color: focusedField === "email" ? "#e11d48" : "#94a3b8" }}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    >
                      <Mail size={18} />
                    </motion.div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="trainer@example.com"
                      autoComplete="email"
                      required
                      className="w-full border text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 outline-none transition-all placeholder:text-slate-300"
                      style={{
                        background: focusedField === "email" ? "rgba(225,29,72,0.04)" : "rgba(241,245,249,0.8)",
                        borderColor: focusedField === "email" ? "#e11d48" : "rgba(226,232,240,0.8)",
                        boxShadow: focusedField === "email" ? "0 0 0 3px rgba(225,29,72,0.12)" : "none",
                      }}
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 }}
                >
                  <label className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <motion.div
                      animate={{ color: focusedField === "password" ? "#e11d48" : "#94a3b8" }}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                    >
                      <Lock size={18} />
                    </motion.div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      minLength={6}
                      required
                      className="w-full border text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-12 outline-none transition-all placeholder:text-slate-300"
                      style={{
                        background: focusedField === "password" ? "rgba(225,29,72,0.04)" : "rgba(241,245,249,0.8)",
                        borderColor: focusedField === "password" ? "#e11d48" : "rgba(226,232,240,0.8)",
                        boxShadow: focusedField === "password" ? "0 0 0 3px rgba(225,29,72,0.12)" : "none",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={showPassword ? "off" : "on"}
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                </motion.div>

                {/* Submit button */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02, boxShadow: "0 8px 30px rgba(225,29,72,0.45)" } : {}}
                    whileTap={!loading ? { scale: 0.97 } : {}}
                    className="w-full py-4 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 overflow-hidden relative"
                    style={{
                      background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
                      boxShadow: "0 4px 20px rgba(225,29,72,0.35)",
                    }}
                  >
                    {/* Shimmer overlay */}
                    {!loading && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                          backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["-100% 0", "200% 0"] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>Sign In <ChevronRight size={18} /></>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 h-px bg-slate-200/70" />
                <span className="text-xs text-slate-400 font-medium">or</span>
                <div className="flex-1 h-px bg-slate-200/70" />
              </div>

              {/* Footer link */}
              <p className="text-center text-sm text-slate-500 mt-5">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-rose-600 hover:text-rose-700 font-semibold transition">
                  Register Now
                </Link>
              </p>
            </div>
          </motion.div>

          <p className="text-center text-xs text-slate-400 mt-6">
            HealthSync &copy; {new Date().getFullYear()} — All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
