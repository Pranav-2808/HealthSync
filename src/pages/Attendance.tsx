import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Search, Calendar as CalendarIcon } from "lucide-react";
import AttendanceModal from "../components/AttendanceModal";
import { Member } from "../types";

const Attendance: React.FC = () => {
  const { members } = useApp();
  const [search, setSearch] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  // Always get the live member from context (reactive to attendance updates)
  const selectedMember = selectedMemberId
    ? members.find(m => m.id === selectedMemberId) ?? null
    : null;

  const handleMemberClick = (member: Member) => {
    setSelectedMemberId(member.id);
  };

  const handleCloseModal = () => {
    setSelectedMemberId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Member Attendance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Select a member to view and manage their attendance records</p>
      </header>
      <div className="glass p-6 rounded-3xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search members by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-20 glass rounded-3xl">
          <CalendarIcon size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
          <p className="text-slate-500 dark:text-slate-400">
            No members available yet. Register new members to manage attendance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map(member => (
              <div
                key={member.id}
                onClick={() => handleMemberClick(member)}
                className="glass p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                  <img
                    src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">{member.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{member.email}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 glass rounded-3xl">
              <CalendarIcon size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No members found matching your search.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal uses live context member for real-time updates after marking attendance */}
      {selectedMember && (
        <AttendanceModal member={selectedMember} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default Attendance;