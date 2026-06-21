import React, { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts";
import { 
  Sparkles, TrendingUp, Users, UserMinus, IndianRupee, 
  AlertTriangle, CheckCircle, Activity, Bell
} from "lucide-react";
import { motion } from "motion/react";

// Standard fee assumption for revenue estimation if not explicitly stored
const ESTIMATED_MONTHLY_FEE = 1500; 

const BusinessInsights: React.FC = () => {
  const { members } = useApp();

  // ----- Data Processing -----
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);

  const {
    totalMembers,
    activeMembers,
    inactiveMembers,
    paidMembers,
    unpaidMembers,
    atRiskMembers,
    totalRevenue,
    pendingRevenue,
    attendanceByDay
  } = useMemo(() => {
    let activeCount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    const riskList: any[] = [];
    
    // For Attendance Chart (last 7 days)
    const daysMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      daysMap[d.toISOString().split("T")[0]] = 0;
    }

    members.forEach(member => {
      // Fee Status
      if (member.feesStatus === "PAID") paidCount++;
      else unpaidCount++;

      // Active / Inactive Status
      const recentAttendance = member.attendance.filter(a => {
        const d = new Date(a.date);
        return a.status === true && d >= sevenDaysAgo && d <= today;
      });

      if (recentAttendance.length > 0) {
        activeCount++;
      } else {
        // High Risk: Inactive + Pending Fees
        // Medium Risk: Inactive but Paid
        const riskLevel = member.feesStatus === "UNPAID" ? "High" : "Medium";
        riskList.push({
          ...member,
          riskLevel,
          daysInactive: member.attendance.length > 0 ? "7+" : "New/No Data"
        });
      }

      // Populate attendance chart data
      member.attendance.forEach(a => {
        if (a.status && daysMap[a.date] !== undefined) {
          daysMap[a.date]++;
        }
      });
    });

    const attChartData = Object.keys(daysMap).map(date => {
      // Format date nicely (e.g., "Mon 12")
      const d = new Date(date);
      const shortDate = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      return { date: shortDate, count: daysMap[date] };
    });

    return {
      totalMembers: members.length,
      activeMembers: activeCount,
      inactiveMembers: members.length - activeCount,
      paidMembers: paidCount,
      unpaidMembers: unpaidCount,
      atRiskMembers: riskList.sort((a, b) => a.riskLevel === "High" ? -1 : 1).slice(0, 5), // Top 5 at risk
      totalRevenue: paidCount * ESTIMATED_MONTHLY_FEE,
      pendingRevenue: unpaidCount * ESTIMATED_MONTHLY_FEE,
      attendanceByDay: attChartData
    };
  }, [members]);

  // ----- AI Rule-Based Recommendations -----
  const recommendations = useMemo(() => {
    const recs = [];
    
    if (unpaidMembers > 0) {
      const unpaidPercent = (unpaidMembers / totalMembers) * 100;
      if (unpaidPercent > 20) {
        recs.push({
          type: "critical",
          title: "High Pending Dues Detected",
          desc: `${unpaidPercent.toFixed(0)}% of your members have unpaid fees. Consider sending a bulk automated reminder to improve cash flow.`
        });
      } else {
        recs.push({
          type: "warning",
          title: "Follow up on Pending Fees",
          desc: `You have ₹${pendingRevenue.toLocaleString("en-IN")} locked in pending fees from ${unpaidMembers} members.`
        });
      }
    }

    if (inactiveMembers > 0) {
      const inactivePercent = (inactiveMembers / totalMembers) * 100;
      if (inactivePercent > 30) {
        recs.push({
          type: "critical",
          title: "Retention Warning",
          desc: `${inactivePercent.toFixed(0)}% of members haven't visited in the last 7 days. Send re-engagement emails to prevent drop-offs.`
        });
      } else {
        recs.push({
          type: "info",
          title: "Boost Member Engagement",
          desc: `${inactiveMembers} members are currently inactive. A quick check-in call could boost retention.`
        });
      }
    }

    // Attendance trend analysis
    if (attendanceByDay.length >= 2) {
      const lastDay = attendanceByDay[attendanceByDay.length - 1].count;
      const prevDay = attendanceByDay[attendanceByDay.length - 2].count;
      if (lastDay > prevDay * 1.5 && lastDay > 5) {
        recs.push({
          type: "success",
          title: "Attendance Spike",
          desc: "Yesterday saw a significant spike in attendance. Ensure sufficient trainer availability during these peak days."
        });
      }
    }

    if (recs.length === 0) {
      recs.push({
        type: "success",
        title: "Looking Good!",
        desc: "Your gym metrics are healthy. Keep up the good work!"
      });
    }

    return recs;
  }, [totalMembers, inactiveMembers, unpaidMembers, pendingRevenue, attendanceByDay]);

  // Chart Colors
  const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b'];

  if (members.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Sparkles size={48} className="mx-auto text-indigo-300 dark:text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">No Data Available</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Add some members and record attendance to generate AI insights.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
          <Sparkles size={28} />
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">AI Business Insights</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400">Intelligent analytics and recommendations based on your gym's data.</p>
      </header>

      {/* AI Recommendations Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className={`p-5 rounded-2xl border flex items-start gap-4 shadow-sm
              ${rec.type === 'critical' ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900/50' : 
                rec.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50' : 
                rec.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50' : 
                'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-900/50'}
            `}
          >
            <div className={`p-2 rounded-xl shrink-0
              ${rec.type === 'critical' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400' : 
                rec.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400' : 
                rec.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 
                'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}
            `}>
              {rec.type === 'critical' ? <AlertTriangle size={24} /> :
               rec.type === 'warning' ? <Bell size={24} /> :
               rec.type === 'success' ? <CheckCircle size={24} /> :
               <Activity size={24} />}
            </div>
            <div>
              <h3 className={`font-bold text-sm mb-1
                ${rec.type === 'critical' ? 'text-rose-900 dark:text-rose-300' : 
                  rec.type === 'warning' ? 'text-amber-900 dark:text-amber-300' : 
                  rec.type === 'success' ? 'text-emerald-900 dark:text-emerald-300' : 
                  'text-indigo-900 dark:text-indigo-300'}
              `}>{rec.title}</h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rec.desc}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users />} title="Total Members" value={totalMembers} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
        <StatCard icon={<TrendingUp />} title="Active (7 Days)" value={activeMembers} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
        <StatCard icon={<UserMinus />} title="Inactive Risk" value={inactiveMembers} color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-900/20" />
        <StatCard icon={<IndianRupee />} title="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/20" subtitle={`+₹${pendingRevenue.toLocaleString("en-IN")} Pending`} />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Trend */}
        <div className="glass p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <Activity size={18} className="text-slate-400 dark:text-slate-500" /> Attendance Trend (Last 7 Days)
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member & Fee Distribution */}
        <div className="glass p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 text-center">Active vs Inactive</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                      { name: 'Active', value: activeMembers },
                      { name: 'Inactive', value: inactiveMembers }
                    ]} 
                    innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"
                  >
                    <Cell fill={COLORS[0]} />
                    <Cell fill={COLORS[1]} />
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-l border-slate-100 dark:border-slate-800 pl-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2 text-center">Fees Status</h3>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[
                      { name: 'Paid', value: paidMembers },
                      { name: 'Unpaid', value: unpaidMembers }
                    ]} 
                    innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value"
                  >
                    <Cell fill={COLORS[2]} />
                    <Cell fill={COLORS[3]} />
                  </Pie>
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* At-Risk Members Table */}
      {atRiskMembers.length > 0 && (
        <section className="glass p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <AlertTriangle size={18} className="text-rose-500" /> Retention Risk Analysis
            </h3>
            <span className="text-xs font-semibold px-3 py-1 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full">Top {atRiskMembers.length} At Risk</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4 font-bold">Member Name</th>
                  <th className="py-3 px-4 font-bold">Risk Level</th>
                  <th className="py-3 px-4 font-bold">Inactivity</th>
                  <th className="py-3 px-4 font-bold">Fees Status</th>
                  <th className="py-3 px-4 font-bold">Action Needed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {atRiskMembers.map(member => (
                  <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <img src={member.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`} alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{member.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${member.riskLevel === 'High' ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'}`}>
                        {member.riskLevel}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">{member.daysInactive}</td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${member.feesStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'}`}>
                        {member.feesStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {member.feesStatus === 'UNPAID' ? "Send fee reminder & call" : "Send re-engagement text"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, color: string, bg: string, subtitle?: string }> = ({ icon, title, value, color, bg, subtitle }) => (
  <div className="glass p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
      {subtitle && <p className="text-[10px] font-semibold text-rose-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

export default BusinessInsights;
