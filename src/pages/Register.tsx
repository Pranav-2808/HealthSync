import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Activity, Mail, Lock, User, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.token) {
        login(data.token, data.user);
        navigate("/");
      } else {
        alert(data.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-600 rounded-2xl text-white mb-4 shadow-xl shadow-rose-200">
            <Activity size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Join HealthSync as a certified trainer</p>
        </div>

        <div className="glass p-8 rounded-3xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="Coach Carter"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="trainer@gym.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Register Now"} <ChevronRight size={18} />
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link to="/login" className="text-rose-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
