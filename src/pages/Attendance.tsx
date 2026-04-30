import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Member } from "../types";
import { Search, Calendar as CalendarIcon, ChevronRight, CheckCircle } from "lucide-react";
import AttendanceModal from "../components/AttendanceModal";

const Attendance: React.FC = () => {
  const { members } = useApp();
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Daily Attendance</h1>
        <p className="text-slate-500 mt-1">Manage and track member attendance across the month</p>
      </header>

      <div className="glass p-6 rounded-3xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-slate-900 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            onClick={() => setSelectedMember(member)}
            className="relative overflow-hidden border border-slate-100 bg-white/85 p-4 rounded-2xl shadow-sm shadow-slate-100 transition-all duration-300 cursor-pointer flex items-center justify-between group hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/70 hover:shadow-2xl hover:shadow-emerald-100/70"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 p-1 border border-slate-200 overflow-hidden transition-all duration-300 group-hover:border-emerald-300 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-emerald-100">
                <img 
                  src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
                  alt={member.name}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 transition-colors group-hover:text-emerald-950">{member.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span>{member.attendance.filter(a => a.status).length} Days Present this month</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-emerald-200">
                View History
              </div>
              <div className="h-9 w-9 rounded-full flex items-center justify-center bg-white border border-slate-100 transition-all duration-300 group-hover:border-emerald-200 group-hover:bg-emerald-100">
                <ChevronRight className="text-slate-300 group-hover:text-emerald-700 transition-colors" />
              </div>
            </div>
          </div>
        ))}
        {filteredMembers.length === 0 && (
          <div className="text-center py-20 glass rounded-3xl">
            <CalendarIcon size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500">No members found matching your search</p>
          </div>
        )}
      </div>

      <AttendanceModal 
        member={selectedMember} 
        onClose={() => setSelectedMember(null)} 
      />
    </div>
  );
};

export default Attendance;
