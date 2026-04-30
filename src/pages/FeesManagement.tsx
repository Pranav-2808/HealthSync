import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { DollarSign, Send, CheckCircle, Clock, Search } from "lucide-react";
import { motion } from "motion/react";

const FeesManagement: React.FC = () => {
  const { members, updateMember, sendFeesReminder } = useApp();
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleReminder = async (id: string, name: string) => {
    setLoadingId(id);
    try {
      await sendFeesReminder(id, 1500, "Next Monday"); // Using typical rupee value 1500
      alert(`Reminder sent to ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reminder";
      alert(`Could not send reminder to ${name}: ${message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PAID" ? "UNPAID" : "PAID";
    await updateMember(id, { feesStatus: nextStatus as any });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Fees Management</h1>
        <p className="text-slate-500 mt-1">Track payments and send automated email reminders</p>
      </header>

      <div className="glass p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Filter by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
          />
        </div>
        <div className="flex gap-4">
          <StatMini label="Total Paid" value={members.filter(m => m.feesStatus === "PAID").length} color="text-emerald-600" />
          <StatMini label="Pending" value={members.filter(m => m.feesStatus === "UNPAID").length} color="text-rose-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <div key={member.id} className="glass p-6 rounded-3xl relative overflow-hidden group">
            {member.feesStatus === "PAID" ? (
              <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest">
                Settled
              </div>
            ) : (
              <div className="absolute top-0 right-0 bg-rose-500 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest">
                Unpaid
              </div>
            )}

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 p-1">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
                  alt={member.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{member.name}</h3>
                <p className="text-xs text-slate-500">{member.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => toggleStatus(member.id, member.feesStatus)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  member.feesStatus === "PAID" 
                    ? "bg-slate-50 text-slate-400 hover:text-slate-600" 
                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                }`}
              >
                {member.feesStatus === "PAID" ? <Clock size={16} /> : <CheckCircle size={16} />}
                {member.feesStatus === "PAID" ? "Mark as Unpaid" : "Mark as Paid"}
              </button>

              <button
                disabled={member.feesStatus === "PAID" || loadingId === member.id}
                onClick={() => handleReminder(member.id, member.name)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loadingId === member.id ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent animate-spin rounded-full" /> : <Send size={16} />}
                Send Email Reminder
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatMini: React.FC<{ label: string, value: number, color: string }> = ({ label, value, color }) => (
  <div className="bg-white border border-slate-100 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px]">
    <span className="text-[10px] uppercase font-bold text-slate-400 mb-1 leading-tight">{label}</span>
    <span className={`text-xl font-display font-bold ${color}`}>{value}</span>
  </div>
);

export default FeesManagement;
