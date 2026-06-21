import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  Activity, LogOut, LayoutDashboard, Calendar,
  IndianRupee, UserPlus, Sparkles, Sun, Moon, Menu, X
} from "lucide-react";

const Navbar: React.FC = () => {
  const { authState, logout, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!authState.token) return null;

  const navLinks = [
    { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { to: "/insights", icon: <Sparkles size={18} />, label: "AI Insights" },
    { to: "/attendance", icon: <Calendar size={18} />, label: "Attendance" },
    { to: "/fees", icon: <IndianRupee size={18} />, label: "Fees" },
    { to: "/register-member", icon: <UserPlus size={18} />, label: "New Member" },
  ];

  // Get initials from name
  const initials = authState.user?.name
    ? authState.user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200 dark:shadow-rose-900/20 shrink-0">
                <Activity size={22} />
              </div>
              <span className="text-xl font-display font-bold text-slate-900 dark:text-white tracking-tight">HealthSync</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  active={location.pathname === link.to}
                  onClick={() => setMobileOpen(false)}
                />
              ))}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Trainer Info — desktop */}
              <div className="hidden sm:flex items-center gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-rose-200 dark:shadow-rose-900/30 shrink-0">
                  {initials}
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{authState.user?.name}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight truncate max-w-[140px]">{authState.user?.email}</p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
              >
                <LogOut size={20} />
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(prev => !prev)}
                className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-1">
            {/* Trainer info pill on mobile */}
            <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 flex items-center justify-center text-white text-sm font-bold shadow">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{authState.user?.name}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{authState.user?.email}</p>
              </div>
            </div>

            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === link.to
                    ? "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/20"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all mt-2"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        )}
      </nav>
    </>
  );
};

const NavLink: React.FC<{
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}> = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
      active
        ? "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-900/30"
        : "text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800"
    }`}
  >
    {icon}
    {label}
  </Link>
);

export default Navbar;
