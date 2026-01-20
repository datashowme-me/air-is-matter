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
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-slate-100 text-sm ring-1 ring-slate-200">
        <p className="font-semibold text-slate-800 mb-1">{label}</p>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-bold text-blue-600">{data.aqi}</span>
          <span className="text-slate-500 font-medium">{data.status}</span>
        </div>
        
        {p && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
            {p.pm2_5 !== undefined && <div>PM2.5: <span className="font-semibold text-slate-800">{p.pm2_5}</span></div>}
            {p.pm10 !== undefined && <div>PM10: <span className="font-semibold text-slate-800">{p.pm10}</span></div>}
            {p.o3 !== undefined && <div>O3: <span className="font-semibold text-slate-800">{p.o3}</span></div>}
            {p.no2 !== undefined && <div>NO2: <span className="font-semibold text-slate-800">{p.no2}</span></div>}
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
  let stopColor = "#10B981"; // Green
  if (maxAQI > 50) stopColor = "#FBBF24"; // Yellow
  if (maxAQI > 100) stopColor = "#F59E0B"; // Orange
  if (maxAQI > 150) stopColor = "#EF4444"; // Red

  return (
    <div className="h-64 w-full mt-6 mb-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 0,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stopColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={stopColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => str.slice(5)} 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#9CA3AF" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="aqi" 
            stroke={stopColor} 
            fillOpacity={1} 
            fill="url(#colorAqi)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};