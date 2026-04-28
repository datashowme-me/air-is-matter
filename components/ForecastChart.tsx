import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { AQIDataPoint } from '../types';

interface ForecastChartProps {
  data: AQIDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as AQIDataPoint;
    const p = data.pollutants;
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/95 p-4 text-sm text-white shadow-2xl shadow-slate-900/40">
        <p className="mb-1 font-semibold text-slate-200">{label}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-[#ffd37a]">{data.aqi}</span>
          <span className="font-medium text-slate-300">{data.status}</span>
        </div>
        
        {p && (
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-slate-800 pt-2 text-xs text-slate-300">
            {p.pm2_5 !== undefined && <div>PM2.5: <span className="font-semibold text-white">{p.pm2_5}</span></div>}
            {p.pm10 !== undefined && <div>PM10: <span className="font-semibold text-white">{p.pm10}</span></div>}
            {p.o3 !== undefined && <div>O3: <span className="font-semibold text-white">{p.o3}</span></div>}
            {p.no2 !== undefined && <div>NO2: <span className="font-semibold text-white">{p.no2}</span></div>}
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const ForecastChart: React.FC<ForecastChartProps> = ({ data }) => {
  // Determine gradient color based on max AQI
  const maxAQI = Math.max(...data.map(d => d.aqi));
  let stopColor = "#22C55E";
  if (maxAQI > 50) stopColor = "#F59E0B";
  if (maxAQI > 100) stopColor = "#F97316";
  if (maxAQI > 150) stopColor = "#EF4444";

  return (
    <div className="mt-6 mb-4 h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 12,
            right: 10,
            left: -24,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stopColor} stopOpacity={0.62}/>
              <stop offset="95%" stopColor={stopColor} stopOpacity={0.04}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" vertical={false} stroke="#E8DECF" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => str.slice(5)} 
            stroke="#8A7E6A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#8A7E6A" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="aqi" 
            stroke={stopColor} 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorAqi)" 
            activeDot={{ r: 6, stroke: '#0f172a', strokeWidth: 2, fill: stopColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
