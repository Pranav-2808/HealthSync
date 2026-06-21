import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface HealthChartProps {
  data: { time: string; hr: number; spo2: number }[];
}

const HealthChart: React.FC<HealthChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider">Health Vitals History</h3>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            domain={[40, 150]} 
            tick={{ fontSize: 10, fill: '#64748b' }} 
            axisLine={false} 
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey="hr" 
            stroke="#e11d48" 
            strokeWidth={3} 
            dot={false}
            animationDuration={1000}
          />
          <Line 
            type="monotone" 
            dataKey="spo2" 
            stroke="#2563eb" 
            strokeWidth={3} 
            dot={false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-600"></div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Heart Rate (BPM)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">SpO2 (%)</span>
        </div>
      </div>
    </div>
  );
};

export default HealthChart;
