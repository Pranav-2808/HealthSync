import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Activity,
  Mail,
  Lock,
  User,
  ChevronRight,
  Heart,
  BarChart2,
  Users,
  Bell,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "react-hot-toast";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedName.length < 2) {
      toast.error("Enter the trainer's full name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register(normalizedName, normalizedEmail, password);
      toast.success(`Welcome to HealthSync, ${normalizedName}!`);
      navigate("/");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a0a1a 0%, #1a1060 45%, #0d1b2a 100%)",
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glowing orbs */}
        <div
          className="absolute top-[-100px] right-[-80px] w-[380px] h-[380px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-80px] left-[-60px] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #e11d48 0%, transparent 70%)" }}
        />

        {/* Pulse rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-indigo-500/20"
              style={{ width: i * 130, height: i * 130, top: -(i * 65), left: -(i * 65) }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.08, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.9, ease: "easeInOut" }}
            />
          ))}
        </div>

        {/* Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity size={22} className="text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">HealthSync</span>
          </div>
        </div>

        {/* Center hero */}
        <div className="relative z-10 text-center flex flex-col items-center gap-6">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2rem] flex items-center justify-center shadow-2xl"
          >
            <Users size={44} className="text-white" />
          </motion.div>

          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Join HealthSync<br />
              <span className="text-indigo-400">as a Trainer</span>
            </h2>
            <p className="text-slate-300 mt-3 text-base leading-relaxed max-w-sm mx-auto">
              Manage members, track vitals, and grow your gym with powerful AI tools.
            </p>
          </div>

          {/* Feature list */}
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {[
              { icon: <Heart size={13} />, label: "Vitals Monitoring" },
              { icon: <BarChart2 size={13} />, label: "Business Insights" },
              { icon: <Bell size={13} />, label: "Auto Reminders" },
            ].map((feat) => (
              <div
                key={feat.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white/80"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                <span className="text-indigo-400">{feat.icon}</span>
                {feat.label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom cards */}
        <div className="relative z-10 flex gap-4 justify-center">
          {[
            { label: "Members Managed", value: "∞", from: "from-indigo-500/20", to: "to-indigo-600/10" },
            { label: "Alerts Sent", value: "Auto", from: "from-rose-500/20", to: "to-rose-600/10" },
            { label: "Free to Start", value: "Yes", from: "from-emerald-500/20", to: "to-emerald-600/10" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.from} ${stat.to} backdrop-blur-sm rounded-2xl px-4 py-3 text-center`}
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">{stat.label}</p>
              <p className="text-white font-bold text-sm mt-0.5">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-200">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                <Activity size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">HealthSync</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Join HealthSync as a certified trainer</p>
          </div>

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 border border-slate-100 dark:border-slate-700/50 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pravin Sharma"
                    autoComplete="name"
                    minLength={2}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="trainer@gym.com"
                    autoComplete="email"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase font-bold text-slate-400 tracking-widest">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 dark:shadow-rose-900/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>Register Now <ChevronRight size={18} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mt-5">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700" />
            </div>

            {/* Footer link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
              Already have an account?{" "}
              <Link to="/login" className="text-rose-600 hover:text-rose-700 font-semibold transition">
                Sign In
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-6">
            HealthSync &copy; {new Date().getFullYear()} — All rights reserved
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
