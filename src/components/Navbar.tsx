import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Activity, LogOut, LayoutDashboard, Users, Calendar, IndianRupee, UserPlus } from "lucide-react";

const Navbar: React.FC = () => {
  const { authState, logout } = useApp();
  const navigate = useNavigate();

  if (!authState.token) return null;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <Activity size={24} />
            </div>
            <span className="text-xl font-display font-bold text-slate-900 tracking-tight">HealthSync</span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/" icon={<LayoutDashboard size={18} />} label="Dashboard" />
            <NavLink to="/attendance" icon={<Calendar size={18} />} label="Attendance" />
            <NavLink to="/fees" icon={<IndianRupee size={18} />} label="Fees" />
            <NavLink to="/register-member" icon={<UserPlus size={18} />} label="New Member" />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{authState.user?.name}</p>
              <p className="text-xs text-slate-500">Trainer</p>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
  >
    {icon}
    {label}
  </Link>
);

export default Navbar;
