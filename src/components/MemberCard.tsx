import React from "react";
import { Member } from "../types";
import { useNavigate } from "react-router-dom";
import { Heart, Activity, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MemberCard: React.FC<{ member: Member }> = ({ member }) => {
  const navigate = useNavigate();
  const hr = member.healthData?.hr || 0;
  const spo2 = member.healthData?.spo2 || 0;

  const isHrCritical = hr > 105 || hr < 50;
  const isSpo2Critical = spo2 < 93;
  const isCritical = isHrCritical || isSpo2Critical;

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
          ? "bg-rose-50 border-rose-400 border-2" 
          : "bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-2xl hover:shadow-emerald-100/70"
      )}
    >
      {!isCritical && (
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm transition-all duration-300",
            !isCritical && "group-hover:border-emerald-200 group-hover:shadow-lg group-hover:shadow-emerald-100"
          )}>
            <img 
              src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div>
            <h3 className={cn(
              "font-display font-semibold text-slate-900 transition-colors",
              !isCritical && "group-hover:text-emerald-950"
            )}>{member.name}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider">{member.gender}, {member.age}y</p>
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
          isHrCritical ? "bg-rose-100" : "bg-slate-50 group-hover:bg-white group-hover:shadow-sm"
        )}>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Heart size={14} className={cn(isHrCritical ? "text-rose-600" : "group-hover:text-emerald-600 transition-colors")} />
            <span className="text-[10px] font-semibold uppercase">Heart Rate</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-bold font-display", isHrCritical ? "text-rose-700" : "text-slate-900")}>
              {hr}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">BPM</span>
          </div>
        </div>

        <div className={cn(
          "p-3 rounded-xl transition-all duration-300",
          isSpo2Critical ? "bg-rose-100" : "bg-slate-50 group-hover:bg-white group-hover:shadow-sm"
        )}>
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Activity size={14} className={cn(isSpo2Critical ? "text-rose-600" : "group-hover:text-emerald-600 transition-colors")} />
            <span className="text-[10px] font-semibold uppercase">SpO2</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-bold font-display", isSpo2Critical ? "text-rose-700" : "text-slate-900")}>
              {spo2}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">%</span>
          </div>
        </div>
      </div>

      {isCritical && (
        <div className="mt-4 p-2.5 bg-rose-600 rounded-lg text-center">
          <span className="text-white text-[11px] font-bold uppercase tracking-widest">Critical Alert Triggered</span>
        </div>
      )}
    </motion.div>
  );
};

export default MemberCard;
