import React from "react";
import { Member } from "../types";
import { X, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";

interface AttendanceModalProps {
  member: Member | null;
  onClose: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ member, onClose }) => {
  const { markAttendance } = useApp();

  if (!member) return null;

  const today = new Date().toISOString().split("T")[0];

  const getAttendanceStatus = (date: string) => {
    return member.attendance.find(a => a.date === date)?.status;
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
      return { day, date, status: getAttendanceStatus(date) };
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
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-display font-bold text-slate-900">Attendance History</h2>
              <p className="text-sm text-slate-500">Member: {member.name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-4 mb-8">
              {monthSummaries.map(month => (
                <section key={month.key} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/60">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="font-bold text-slate-900">{month.label}</h3>
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Present {month.present}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                        Absent {month.absent}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5">
                    {month.days.map(day => (
                      <div
                        key={day.date}
                        title={day.date}
                        className={`h-9 rounded-lg flex items-center justify-center text-[11px] font-bold border ${
                          day.status === true ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                          day.status === false ? "bg-rose-50 border-rose-100 text-rose-700" :
                          "bg-white border-slate-100 text-slate-300"
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
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Mark Today ({today})</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => markAttendance(member.id, today, true)}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={20} /> Mark Present
                </button>
                <button
                  onClick={() => markAttendance(member.id, today, false)}
                  className="flex-1 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-all border border-rose-200 flex items-center justify-center gap-2"
                >
                  <XCircle size={20} /> Mark Absent
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
