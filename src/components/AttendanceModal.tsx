import React, { useMemo, useState } from "react";
import { Member } from "../types";
import { X, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";

interface AttendanceModalProps {
  member: Member | null;
  onClose: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ member, onClose }) => {
  const { markAttendance, members } = useApp();
  const [savingStatus, setSavingStatus] = useState<boolean | null>(null);

  const currentMember = useMemo(
    () => member ? members.find(item => item.id === member.id) || member : null,
    [member, members]
  );

  if (!currentMember) return null;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const getAttendanceStatus = (date: string) => {
    const record = currentMember.attendance.find(a => a.date === date);
    // Return true for present, false for absent, null if no record
    return record ? record.status : null;
  };

  const handleMarkAttendance = async (status: boolean) => {
    setSavingStatus(status);
    try {
      await markAttendance(currentMember.id, today, status);
    } finally {
      setSavingStatus(null);
    }
  };

  const monthSummaries = Array.from({ length: 6 }, (_, monthOffset) => {
    const monthDate = new Date();
    monthDate.setDate(1);
    monthDate.setMonth(monthDate.getMonth() - monthOffset);

    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, dayIndex) => {
      const day = dayIndex + 1;
      const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return { day, date, status: getAttendanceStatus(date) }; // status can be true, false, or null
    });

    return {
      key: `${year}-${month}`,
      label: monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      present: days.filter(day => day.status === true).length,
      absent: days.filter(day => day.status === false).length,
      days
    };
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-md"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Attendance History</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Member: {currentMember.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} className="text-slate-400 dark:text-slate-500" />
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4 mb-8">
              {monthSummaries.map(month => (
                <section key={month.key} className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/60 dark:bg-slate-800/30">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="font-bold text-slate-900 dark:text-white">{month.label}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                        Present {month.present}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
                        Absent {month.absent}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
                    {month.days.map(day => (
                      <div
                        key={day.date}
                        title={day.date}
                        className={`h-9 rounded-lg flex items-center justify-center text-[11px] font-bold border ${day.status === true ? "bg-emerald-50 dark:bg-emerald-900/50 border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400" : // Present
                            day.status === false ? "bg-rose-50 dark:bg-rose-900/50 border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400" : // Absent
                              "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                          }`}
                      >
                        {day.day}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Mark Today ({today})</h3>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleMarkAttendance(true)}
                  disabled={savingStatus !== null}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle size={20} /> {savingStatus === true ? "Saving..." : "Mark Present"}
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAttendance(false)}
                  disabled={savingStatus !== null}
                  className="flex-1 py-3 px-4 bg-rose-50 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl font-bold transition-all border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <XCircle size={20} /> {savingStatus === false ? "Saving..." : "Mark Absent"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AttendanceModal;
