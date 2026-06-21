import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import HealthChart from "../components/HealthChart";
import {
  ArrowLeft, Trash2, Edit2, Phone, Mail, User,
  Dna, Ruler, Weight, History, Calendar, CreditCard,
  AlertCircle, ShieldAlert, Sparkles
} from "lucide-react";

type HealthHistoryPoint = {
  time: string;
  hr: number;
  spo2: number;
};

const MemberDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { members, deleteMember } = useApp();
  const member = members.find(m => m.id === id);

  // For chart simulation
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [history, setHistory] = useState<HealthHistoryPoint[]>([]);

  useEffect(() => {
    if (member?.healthData) {
      setHistory(prev => {
        const newData = [...prev, { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
          hr: member.healthData!.hr, 
          spo2: member.healthData!.spo2 
        }];
        return newData.slice(-10); // Keep last 10 points
      });
    }
  }, [member?.healthData]);

  const getAIInsight = async () => {
    setLoadingAi(true);
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "your_gemini_api_key") {
        alert("Please set a valid GEMINI_API_KEY in your .env file");
        setLoadingAi(false);
        return;
      }

      const prompt = `You are an AI assistant for a gym owner. Your goal is to provide actionable insights for the gym owner to better manage and support their members. Analyze the following member's data and provide:
1. An overall status summary (e.g., "Healthy & Engaged", "At Risk - Health", "At Risk - Engagement", "Financial Concern").
2. Key observations regarding their health vitals, attendance, and fees status.
3. One specific, actionable recommendation for the gym owner to take (e.g., "Suggest a new workout plan", "Reach out about low attendance", "Follow up on overdue fees", "Schedule a health check-in").

Member Data:
Name: ${member?.name}, Age: ${member?.age}, Gender: ${member?.gender}, Weight: ${member?.weight}kg, Height: ${member?.height}cm, Blood Group: ${member?.bloodGroup}
Medical History: ${member?.medicalHistory}
Current Vitals -> Heart Rate: ${member?.healthData?.hr} bpm, SpO2: ${member?.healthData?.spo2}%
Fees Status: ${member?.feesStatus}
Attendance this month: ${member?.attendance.filter(a => a.status).length} days present.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      const data = await res.json();
      setAiInsight(data.candidates?.[0]?.content?.parts?.[0]?.text || "No insights available.");
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI insight.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (!member) return <div className="text-center py-20">Member not found</div>;

  const handleDelete = async () => {
    if (!confirm("Are you sure?")) return;

    setDeleting(true);
    try {
      await deleteMember(member.id);
      navigate("/");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} /> Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="glass p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
            
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 relative">
              <div className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 p-1 shadow-inner border border-slate-200 dark:border-slate-700 overflow-hidden">
                <img 
                  src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} 
                  alt={member.name}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{member.name}</h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                  <Badge icon={<Mail size={12} />} text={member.email} />
                  <Badge icon={<User size={12} />} text={`${member.gender}, ${member.age}yrs`} />
                  <Badge icon={<Dna size={12} />} text={`Blood: ${member.bloodGroup}`} color="bg-rose-50 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoBox icon={<Ruler size={18} />} label="Height" value={`${member.height}cm`} />
              <InfoBox icon={<Weight size={18} />} label="Weight" value={`${member.weight}kg`} />
              <InfoBox icon={<Calendar size={18} />} label="Attendance" value={`${member.attendance.filter(a => a.status).length} Days`} />
              <InfoBox 
                icon={<CreditCard size={18} />} 
                label="Fees" 
                value={member.feesStatus} 
                subValue={member.feesStatus === "PAID" ? "Settled" : "Pending"}
                color={member.feesStatus === "PAID" ? "text-emerald-600" : "text-rose-600"}
              />
            </div>
          </section>

          <section className="glass p-8 rounded-3xl">
            <HealthChart data={history} />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <History className="text-slate-400 dark:text-slate-500" size={20} />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Medical History</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{member.medicalHistory || "No known medical issues."}</p>
              {member.additionalHealth && (
                <ul className="mt-4 space-y-2">
                  {member.additionalHealth.bp && <li className="text-xs font-medium text-slate-500 dark:text-slate-400">BP: {member.additionalHealth.bp}</li>}
                  {member.additionalHealth.diabetes && <li className="text-xs font-medium text-slate-500 dark:text-slate-400">Diabetes: {member.additionalHealth.diabetes}</li>}
                </ul>
              )}
            </div>

            <div className="glass p-6 rounded-3xl bg-amber-50/30 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/50">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="text-amber-600 dark:text-amber-500" size={20} />
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Emergency Contact</h3>
              </div>
              <div className="space-y-3">
                <p className="text-slate-900 dark:text-white font-semibold">{member.emergencyContact?.name || "N/A"}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone size={14} /> {member.emergencyContact?.phone || "N/A"}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail size={14} /> {member.emergencyContact?.email || "N/A"}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Actions</h3>
            <button
              onClick={() => navigate(`/member/edit/${member.id}`)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-all"
            >
              <Edit2 size={18} /> Update Details
            </button>
            <button
              onClick={getAIInsight}
              disabled={loadingAi}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              <Sparkles size={18} /> {loadingAi ? "Generating..." : "Generate AI Insight"}
            </button>
            <button 
              onClick={handleDelete}
              disabled={deleting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all disabled:opacity-60"
            >
              <Trash2 size={18} /> {deleting ? "Removing..." : "Remove Member"}
            </button>
          </div>

          <div className="glass p-6 rounded-3xl border-rose-100 dark:border-rose-900/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-600 dark:text-rose-500" />
              Safety Protocols
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If health vitals cross thresholds, we instantly notify the emergency contact. 
              Closest Hospital: <strong>City General</strong>. 
              Emergency Services: <strong>102/911</strong>.
            </p>
          </div>

          {aiInsight && (
            <div className="glass p-6 rounded-3xl border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-inner">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-400 mb-2 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400" /> AI Insight
              </h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed whitespace-pre-line">{aiInsight}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ icon: React.ReactNode, text: string, color?: string }> = ({ icon, text, color = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" }) => (
  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
    {icon} {text}
  </span>
);

const InfoBox: React.FC<{ icon: React.ReactNode, label: string, value: string, subValue?: string, color?: string }> = ({ icon, label, value, subValue, color = "text-slate-900 dark:text-white" }) => (
  <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-white dark:border-slate-700">
    <div className="text-slate-400 dark:text-slate-500 mb-2 flex justify-center">{icon}</div>
    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-lg font-display font-bold ${color}`}>{value}</p>
    {subValue && <p className="text-[9px] text-slate-400 font-medium">{subValue}</p>}
  </div>
);

export default MemberDetail;
