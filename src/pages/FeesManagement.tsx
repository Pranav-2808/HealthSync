import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { CheckCircle, Clock, CreditCard, IndianRupee, Search, Send, X } from "lucide-react";
import { FeeRecord, Member } from "../types";

const getMonthKey = (date = new Date()) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
);

const formatMonth = (monthKey: string) => {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

const getDisplayFeeHistory = (member: Member) => {
  const history = member.feeHistory || [];
  const recordsByMonth = new Map(history.map(record => [record.month, record]));
  const currentMonthKey = getMonthKey();

  if (!recordsByMonth.has(currentMonthKey)) {
    recordsByMonth.set(currentMonthKey, {
      month: currentMonthKey,
      status: member.feesStatus,
      paidDate: member.feePaymentDate,
    });
  }

  return Array.from(recordsByMonth.values()).sort((a, b) => b.month.localeCompare(a.month));
};

const FeesManagement: React.FC = () => {
  const { members, updateMember, sendFeesReminder } = useApp();
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const selectedMember = members.find(member => member.id === selectedMemberId) || null;
  const selectedFeeHistory = selectedMember ? getDisplayFeeHistory(selectedMember) : [];
  const currentMonth = useMemo(() => (
    new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  ), []);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleReminder = async (event: React.MouseEvent, member: Member) => {
    event.stopPropagation();
    setLoadingId(member.id);
    try {
      await sendFeesReminder(member.id, 1500, "this month");
    } finally {
      setLoadingId(null);
    }
  };

  const toggleStatus = async (event: React.MouseEvent, member: Member) => {
    event.stopPropagation();
    if (togglingId) return;

    setTogglingId(member.id);
    const nextStatus = member.feesStatus === "PAID" ? "UNPAID" : "PAID";
    const today = new Date().toISOString().split("T")[0];
    const currentMonthKey = getMonthKey();
    const existingHistory = member.feeHistory || [];
    const feeHistory: FeeRecord[] = [
      {
        month: currentMonthKey,
        status: nextStatus,
        paidDate: nextStatus === "PAID" ? today : "",
      },
      ...existingHistory.filter(record => record.month !== currentMonthKey),
    ];

    try {
      await updateMember(member.id, {
        feesStatus: nextStatus,
        feePaymentDate: nextStatus === "PAID" ? today : "",
        feeHistory,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Fees Management</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track monthly payments and send pending email reminders</p>
      </header>

      <div className="glass p-6 rounded-3xl mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Filter by member name or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-4">
          <StatMini label="Total Paid" value={members.filter(member => member.feesStatus === "PAID").length} color="text-emerald-600" />
          <StatMini label="Pending" value={members.filter(member => member.feesStatus === "UNPAID").length} color="text-rose-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            onClick={() => setSelectedMemberId(member.id)}
            className="glass p-6 rounded-3xl relative overflow-hidden group text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
          >
            <div className={`absolute top-0 right-0 text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest ${
              member.feesStatus === "PAID" ? "bg-emerald-500" : "bg-rose-500"
            }`}>
              {member.feesStatus === "PAID" ? "Paid" : "Pending"}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                <img
                  src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{member.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <InfoPill label="Month" value={currentMonth} />
              <InfoPill label="Date" value={member.feePaymentDate || "Not paid"} />
            </div>

            <div className="space-y-3 mt-5">
              <button
                type="button"
                disabled={togglingId === member.id}
                onClick={(event) => toggleStatus(event, member)}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  member.feesStatus === "PAID"
                    ? "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-60"
                    : "bg-emerald-600 text-white shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 hover:bg-emerald-700 disabled:opacity-60"
                }`}
              >
                {member.feesStatus === "PAID" ? <Clock size={16} /> : <CheckCircle size={16} />}
                {togglingId === member.id ? "Saving..." : member.feesStatus === "PAID" ? "Mark as Pending" : "Mark as Paid"}
              </button>

              <button
                type="button"
                disabled={member.feesStatus === "PAID" || loadingId === member.id}
                onClick={(event) => handleReminder(event, member)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loadingId === member.id ? <div className="w-4 h-4 border-2 border-slate-600 dark:border-slate-400 border-t-transparent animate-spin rounded-full" /> : <Send size={16} />}
                Send Pending Email
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedMember && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close fees detail"
            onClick={() => setSelectedMemberId(null)}
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Monthly Fees</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedMember.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberId(null)}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <DetailBox icon={<CreditCard size={18} />} label="Month" value={currentMonth} />
                <DetailBox icon={<IndianRupee size={18} />} label="Status" value={selectedMember.feesStatus === "PAID" ? "Paid" : "Pending"} tone={selectedMember.feesStatus === "PAID" ? "emerald" : "rose"} />
                <DetailBox icon={<Clock size={18} />} label="Paid Date" value={selectedMember.feePaymentDate || "Not paid"} />
              </div>

              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Month-wise Payment History</h3>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedFeeHistory.map(record => (
                    <div key={record.month} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 items-center">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{formatMonth(record.month)}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {record.status === "PAID" && record.paidDate ? `Paid on ${record.paidDate}` : "No paid date recorded"}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        record.status === "PAID"
                          ? "bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50"
                          : "bg-rose-50 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
                      }`}>
                        {record.status === "PAID" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  disabled={togglingId === selectedMember.id}
                  onClick={(event) => toggleStatus(event, selectedMember)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-60"
                >
                  {selectedMember.feesStatus === "PAID" ? <Clock size={18} /> : <CheckCircle size={18} />}
                  {togglingId === selectedMember.id ? "Saving..." : selectedMember.feesStatus === "PAID" ? "Mark Pending" : "Mark Paid"}
                </button>
                <button
                  type="button"
                  disabled={selectedMember.feesStatus === "PAID" || loadingId === selectedMember.id}
                  onClick={(event) => handleReminder(event, selectedMember)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {loadingId === selectedMember.id ? <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent animate-spin rounded-full" /> : <Send size={18} />}
                  Send Pending Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3">
    <p className="text-[9px] uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-1">{label}</p>
    <p className="text-slate-800 dark:text-slate-200 truncate">{value}</p>
  </div>
);

const DetailBox: React.FC<{ icon: React.ReactNode; label: string; value: string; tone?: "emerald" | "rose" }> = ({ icon, label, value, tone }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4">
    <div className={`${tone === "emerald" ? "text-emerald-600 dark:text-emerald-500" : tone === "rose" ? "text-rose-600 dark:text-rose-500" : "text-slate-400 dark:text-slate-500"} mb-2`}>
      {icon}
    </div>
    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-1">{label}</p>
    <p className={`font-display font-bold ${tone === "emerald" ? "text-emerald-700 dark:text-emerald-400" : tone === "rose" ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
      {value}
    </p>
  </div>
);

const StatMini: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[120px]">
    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-1 leading-tight">{label}</span>
    <span className={`text-xl font-display font-bold ${color}`}>{value}</span>
  </div>
);

export default FeesManagement;
