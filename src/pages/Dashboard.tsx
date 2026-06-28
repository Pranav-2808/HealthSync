import React from "react";
import { useApp } from "../context/AppContext";
import MemberCard from "../components/MemberCard";
import { Users, Activity, AlertTriangle, ShieldAlert, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const Dashboard: React.FC = () => {
  const { members, emergencyAlertIds, dismissAlert } = useApp();

  const activeCriticalMembers = members.filter(m => emergencyAlertIds.has(m.id));

  const criticalCountTotal = members.filter(m => {
    const hr = m.healthData?.hr || 0;
    const spo2 = m.healthData?.spo2 || 100;
    return hr > 105 || hr < 50 || spo2 < 93;
  }).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Trainer Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time health monitoring for all gym members</p>
          </div>
          <div className="flex gap-4">
            <StatSmall icon={<Users className="text-blue-600" />} label="Total Members" value={members.length} />
            <StatSmall 
              icon={<Activity className={criticalCountTotal > 0 ? "text-rose-600" : "text-emerald-600"} />} 
              label="Critical Alerts" 
              value={criticalCountTotal} 
              isAlert={criticalCountTotal > 0}
            />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {activeCriticalMembers.length > 0 && (
          <div className="space-y-4 mb-10">
            {activeCriticalMembers.map(member => {

              return (
              <motion.div 
                key={`alert-box-${member.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 border-2 border-rose-500 rounded-[2.5rem] shadow-2xl shadow-rose-100 dark:shadow-rose-900/20 overflow-hidden"
              >
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-700">
                  <div className="p-8 flex flex-1 items-start gap-8">
                    <div className="w-20 h-20 bg-rose-600 rounded-[2rem] flex items-center justify-center text-white shrink-0 animate-pulse shadow-lg shadow-rose-200">
                      <AlertTriangle size={36} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-display font-black uppercase text-rose-600 tracking-tighter">Emergency: {member.name}</h2>
                      </div>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-4">
                        Emergency contact notification has been triggered. This alert stays here until you dismiss it.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <AlertStat label="Vitals" value={`HR: ${member.healthData?.hr} | Sp: ${member.healthData?.spo2}%`} />
                        <AlertStat label="Blood Group" value={member.bloodGroup} />
                        <AlertStat label="Med History" value={member.medicalHistory || "Normal"} />
                        <AlertStat label="Emergency Contact" value={member.emergencyContact?.name || "N/A"} />
                      </div>

                      {/* Quick Contact & Info Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Emergency Contact */}
                        {member.emergencyContact?.phone && (
                          <a
                            href={`tel:${member.emergencyContact.phone}`}
                            className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 hover:border-amber-400 transition-all duration-200 active:scale-95"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-2xl">📱</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-black tracking-wider">Emergency Contact</p>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{member.emergencyContact.name || "Contact"}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{member.emergencyContact.phone}</p>
                            </div>
                          </a>
                        )}

                        {/* Nearest Hospital */}
                        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                          <span className="text-2xl">🏥</span>
                          <div>
                            <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-wider">Nearest Hospital</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">City General</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">2.4 km away</p>
                          </div>
                        </div>

                        {/* Alt Emergency */}
                        <a
                          href="tel:911"
                          className="flex items-center gap-3 bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl border border-rose-200 dark:border-rose-800 hover:border-rose-400 transition-all duration-200 active:scale-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-2xl">🚑</span>
                          <div>
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 uppercase font-black tracking-wider">Alt Emergency</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dial 911</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Ambulance: 102</p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 lg:w-[260px] bg-slate-50 dark:bg-slate-900 flex flex-col justify-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                      <ShieldAlert size={18} /> Emergency Actions
                    </div>
                    {/* Call Ambulance Button */}
                    <a
                      href="tel:102"
                      className="flex items-center gap-3 bg-rose-600 hover:bg-rose-700 text-white p-4 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-rose-200 dark:shadow-rose-900/30 group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                        <Phone size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] text-rose-200 uppercase tracking-wider">One-Tap Emergency</p>
                        <p className="text-sm font-black">Call Ambulance — 102</p>
                      </div>
                    </a>
                    <button 
                      onClick={() => dismissAlert(member.id)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                      Dismiss Emergency
                    </button>
                  </div>
                </div>
              </motion.div>
            );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {members.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
        {members.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-3xl">
            <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No members found</h3>
            <p className="text-slate-500 dark:text-slate-400">Register new members to start monitoring</p>
          </div>
        )}
      </div>
    </div>
  );
};



const AlertStat: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[9px] uppercase font-black text-rose-300 tracking-widest leading-none mb-1">{label}</p>
    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{value}</p>
  </div>
);

const StatSmall: React.FC<{ icon: React.ReactNode, label: string, value: number, isAlert?: boolean }> = ({ icon, label, value, isAlert }) => (
  <div className="glass px-5 py-3 rounded-2xl flex items-center gap-4">
    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{icon}</div>
    <div>
      <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">{label}</p>
      <p className={`text-xl font-display font-bold ${isAlert ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>{value}</p>
    </div>
  </div>
);

export default Dashboard;
