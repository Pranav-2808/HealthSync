import React, { useState, useEffect } from "react";
import { Member, AttendanceRecord } from "../types";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Heart, Activity, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MemberCard: React.FC<{ member: Member }> = ({ member }) => {
  const navigate = useNavigate();
  const { markAttendance } = useApp();
  const hr = member.healthData?.hr || 0;
  const spo2 = member.healthData?.spo2 || 0;

  const isHrCritical = hr > 105 || hr < 50;
  const isSpo2Critical = spo2 < 93;
  const isCritical = isHrCritical || isSpo2Critical;

  const today = new Date().toISOString().split('T')[0];

  // Derive attendance status directly from context-provided member data (reactive)
  const todayRecord = member.attendance.find((a: AttendanceRecord) => a.date === today);
  const [isPresent, setIsPresent] = useState<boolean>(todayRecord?.status ?? false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Keep local state in sync when context updates (e.g. after API call completes)
  useEffect(() => {
    const record = member.attendance.find((a: AttendanceRecord) => a.date === today);
    setIsPresent(record?.status ?? false);
  }, [member.attendance, today]);

  const handleToggleAttendance = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newStatus = e.target.checked;
    setIsPresent(newStatus); // Optimistic UI update
    setIsSaving(true);
    try {
      await markAttendance(member.id, today, newStatus);
    } catch (error) {
      console.error(`Error updating attendance for ${member.name}:`, error);
      setIsPresent(!newStatus); // Revert UI on error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      animate={isCritical ? { 
        boxShadow: ["0 0 0px rgba(225, 29, 72, 0)", "0 0 20px rgba(225, 29, 72, 0.4)", "0 0 0px rgba(225, 29, 72, 0)"]
      } : {}}
      transition={isCritical ? { repeat: Infinity, duration: 1.5 } : { type: "spring", stiffness: 400, damping: 25 }}
      onClick={() => navigate(`/member/${member.id}`)}
      className={cn(
        "group cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden",
        isCritical 
          ? "bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-500/50 border-2" 
          : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 hover:shadow-2xl hover:shadow-emerald-100/70 dark:hover:shadow-emerald-900/20"
      )}
    >
      {!isCritical && (
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 shadow-sm transition-all duration-300",
            !isCritical && "group-hover:border-emerald-200 dark:group-hover:border-emerald-500/30 group-hover:shadow-lg group-hover:shadow-emerald-100 dark:group-hover:shadow-emerald-900/20"
          )}>
            <img 
              src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div>
            <h3 className={cn(
              "font-display font-semibold text-slate-900 dark:text-white transition-colors",
              !isCritical && "group-hover:text-emerald-950 dark:group-hover:text-emerald-400"
            )}>{member.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{member.gender}, {member.age}y</p>
          </div>
        </div>
        {isCritical && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-rose-600 bg-rose-100 p-1.5 rounded-full"
          >
            <AlertCircle size={20} />
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-3 rounded-xl transition-all duration-300",
          isHrCritical ? "bg-rose-100 dark:bg-rose-900/30" : "bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm"
        )}>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Heart size={14} className={cn(isHrCritical ? "text-rose-600" : "group-hover:text-emerald-600 transition-colors")} />
            <span className="text-[10px] font-semibold uppercase">Heart Rate</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-bold font-display", isHrCritical ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-white")}>
              {hr}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">BPM</span>
          </div>
        </div>

        <div className={cn(
          "p-3 rounded-xl transition-all duration-300",
          isSpo2Critical ? "bg-rose-100 dark:bg-rose-900/30" : "bg-slate-50 dark:bg-slate-900/50 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:shadow-sm"
        )}>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Activity size={14} className={cn(isSpo2Critical ? "text-rose-600" : "group-hover:text-emerald-600 transition-colors")} />
            <span className="text-[10px] font-semibold uppercase">SpO2</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-bold font-display", isSpo2Critical ? "text-rose-700 dark:text-rose-400" : "text-slate-900 dark:text-white")}>
              {spo2}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">%</span>
          </div>
        </div>
      </div>

      {isCritical && (
        <div className="mt-4 p-2.5 bg-rose-600 rounded-lg text-center">
          <span className="text-white text-[11px] font-bold uppercase tracking-widest">Critical Alert Triggered</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">Present Today:</span>
        <label
          onClick={(event) => event.stopPropagation()}
          className="relative inline-flex items-center cursor-pointer"
        >
          <input
            type="checkbox"
            value=""
            className="sr-only peer"
            checked={isPresent}
            onChange={handleToggleAttendance}
            disabled={isSaving}
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
          <span className="ms-2 text-xs font-medium text-gray-900 dark:text-gray-300">
            {isSaving ? '...' : isPresent ? 'Present' : 'Absent'}
          </span>
        </label>
      </div>
    </motion.div>
  );
};

export default MemberCard;
